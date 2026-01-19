import { supabase } from '@/utils/supabase';
import type { PurchaseFormData, PurchaseConfirmation } from '@/types/purchase.types';
import type { Raffle } from '@/types/database.types';
import { logger } from '@/utils/logger';

/**
 * Tipo para la respuesta de Supabase con relaciones
 */
interface OrderWithRelations {
  id: string;
  raffle_id: string;
  numbers: string[];
  total: number;
  status: string;
  created_at: string;
  raffles: Raffle | null;
  clients: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
}

/**
 * Tipo para la respuesta de órdenes con información del sorteo
 */
interface OrderWithRaffle {
  id: string;
  raffle_id: string;
  numbers: string[];
  total: number;
  status: string;
  created_at: string;
  client_id?: string; // Opcional para compatibilidad
  raffles: {
    title: string;
    image_url: string | null;
  } | null;
}

/**
 * Tipo para los boletos del usuario
 */
export interface UserTicket {
  order_id: string;
  raffle_id: string;
  raffle_title: string;
  raffle_image_url: string | null;
  ticket_numbers: string[];
  total: number;
  purchase_date: string;
  status: string;
}

/**
 * Servicio para manejar las operaciones de compra
 */
export const purchaseService = {
  /**
   * Crea una nueva compra con datos del cliente
   * Crea o actualiza customer, crea sale, asigna tickets
   */
  async createPurchaseWithCustomer(
    raffleId: string,
    quantity: number,
    customerData: PurchaseFormData
  ): Promise<{ success: boolean; saleId?: string; orderId?: string; ticketNumbers?: string[]; error?: string }> {
    try {
      logger.debug('🔍 [DEBUG] Iniciando createPurchaseWithCustomer:', {
        raffleId,
        quantity,
        customerEmail: customerData.email,
      });

      // ============================================
      // VALIDACIONES DE ENTRADA
      // ============================================
      
      // Validar raffleId
      if (!raffleId || typeof raffleId !== 'string' || raffleId.trim() === '') {
        logger.error('❌ [ERROR] raffleId está vacío o inválido');
        return { success: false, error: 'ID de sorteo no válido' };
      }

      // Validar quantity
      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
        logger.error('❌ [ERROR] quantity inválido:', quantity);
        return { success: false, error: 'Cantidad de boletos debe ser un número entre 1 y 100' };
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!customerData.email || !emailRegex.test(customerData.email.trim())) {
        logger.error('❌ [ERROR] Email inválido:', customerData.email);
        return { success: false, error: 'Email inválido' };
      }

      // Validar nombre
      if (!customerData.name || customerData.name.trim().length < 2) {
        logger.error('❌ [ERROR] Nombre inválido');
        return { success: false, error: 'El nombre debe tener al menos 2 caracteres' };
      }

      // Validar apellido
      if (!customerData.lastName || customerData.lastName.trim().length < 2) {
        logger.error('❌ [ERROR] Apellido inválido');
        return { success: false, error: 'El apellido debe tener al menos 2 caracteres' };
      }

      // Validar teléfono (debe tener al menos 7 dígitos)
      const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
      if (!customerData.whatsapp || !phoneRegex.test(customerData.whatsapp.trim())) {
        logger.error('❌ [ERROR] Teléfono inválido:', customerData.whatsapp);
        return { success: false, error: 'Número de teléfono inválido' };
      }

      // Sanitizar inputs
      const sanitizedRaffleId = raffleId.trim();
      const sanitizedEmail = customerData.email.trim().toLowerCase();
      const sanitizedName = customerData.name.trim();
      const sanitizedLastName = customerData.lastName.trim();
      const sanitizedPhone = customerData.whatsapp.trim();

      // 1. Obtener información del sorteo
      logger.debug('🔍 [DEBUG] Buscando sorteo con ID:', sanitizedRaffleId);

      const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .select('id, price_per_ticket, title, status, total_numbers')
        .eq('id', sanitizedRaffleId)
        .eq('status', 'active')
        .single();

      if (raffleError) {
        logger.error('❌ [ERROR] Error al obtener sorteo:', raffleError);
        return { success: false, error: 'Sorteo no encontrado o no está disponible' };
      }

      if (!raffle) {
        logger.error('❌ [ERROR] Sorteo no encontrado');
        return { success: false, error: 'Sorteo no encontrado o no está disponible' };
      }

      // Validar que el precio sea válido
      if (!raffle.price_per_ticket || raffle.price_per_ticket <= 0) {
        logger.error('❌ [ERROR] Precio por ticket inválido:', raffle.price_per_ticket);
        return { success: false, error: 'El sorteo tiene un precio inválido' };
      }

      // Verificar disponibilidad de tickets (si total_numbers está disponible)
      // Nota: Esto es una verificación optimista, la reserva real se hace en la función SQL
      if (raffle.total_numbers) {
        // Obtener cantidad de tickets disponibles (reserved + paid)
        const { count: reservedCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('raffle_id', raffle.id)
          .in('status', ['reserved', 'paid']);

        const availableTickets = raffle.total_numbers - (reservedCount || 0);
        const totalTicketsNeeded = quantity === 10 ? 15 : quantity === 20 ? 27 : quantity;
        
        if (availableTickets < totalTicketsNeeded) {
          logger.error('❌ [ERROR] No hay suficientes tickets disponibles:', {
            disponibles: availableTickets,
            necesarios: totalTicketsNeeded,
          });
          return { success: false, error: `Solo hay ${availableTickets} boletos disponibles. Por favor, selecciona una cantidad menor.` };
        }
      }

      logger.debug('✅ [SUCCESS] Sorteo encontrado:', {
        id: raffle.id,
        price_per_ticket: raffle.price_per_ticket,
        title: raffle.title || 'Sin título',
      });

      // 2. Obtener usuario autenticado (si existe)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      let customerId: string | null = null;
      let userId: string | null = null;
      let userEmail: string | null = null;

      // Si está autenticado, buscar o crear user y customer
      if (authUser && !authError) {
        userId = authUser.id;
        userEmail = authUser.email || null;
        logger.debug('✅ [createPurchaseWithCustomer] Usuario autenticado:', {
          userId,
          userEmail,
          customerEmail: customerData.email,
        });
      } else {
        logger.debug('⚠️ [createPurchaseWithCustomer] Usuario no autenticado (guest checkout)');
      }

      // Crear o buscar client usando RPC (Security Definer para evitar problemas de RLS)
      const fullName = `${sanitizedName} ${sanitizedLastName}`.trim();
      const clientEmail = userEmail || sanitizedEmail;

      logger.debug('🔍 [DEBUG] Llamando a get_or_create_client:', {
        email: clientEmail,
        name: fullName,
        phone: customerData.whatsapp,
        auth_user_id: userId
      });

      const { data: clientId, error: clientError } = await supabase.rpc('get_or_create_client', {
        p_email: clientEmail,
        p_name: fullName,
        p_phone: sanitizedPhone,
        p_auth_user_id: userId
      });

      if (clientError) {
        logger.error('Error al obtener/crear client:', clientError);
        return {
          success: false,
          error: `Error al procesar cliente: ${clientError.message}`
        };
      }

      if (!clientId) {
        logger.error('Error: get_or_create_client retornó null');
        return { success: false, error: 'Error al procesar cliente (ID nulo)' };
      }

      customerId = clientId as string;
      logger.debug('✅ [SUCCESS] Cliente procesado correctamente:', customerId);

      if (!customerId) {
        return { success: false, error: 'Error al crear o encontrar cliente' };
      }

      // 3. Calcular cantidad total de tickets (incluyendo regalos)
      // Combo 10: regalamos 5 tickets adicionales (total 15)
      // Combo 20: regalamos 7 tickets adicionales (total 27)
      let totalTicketsToReserve = quantity;
      let bonusTickets = 0;

      if (quantity === 10) {
        bonusTickets = 5;
        totalTicketsToReserve = 15;
        logger.debug('🎁 [BONUS] Combo 10: agregando 5 tickets adicionales (total: 15)');
      } else if (quantity === 20) {
        bonusTickets = 7;
        totalTicketsToReserve = 27;
        logger.debug('🎁 [BONUS] Combo 20: agregando 7 tickets adicionales (total: 27)');
      }

      // 4. Reservar tickets aleatoriamente usando la función SQL
      // Esto creará automáticamente la orden (order) y reservará los tickets
      logger.debug('🔍 [DEBUG] Llamando a reserve_tickets_random:', {
        raffleId: sanitizedRaffleId,
        quantity: totalTicketsToReserve,
        originalQuantity: quantity,
        bonusTickets,
        customerId,
      });

      const { data: reservationResult, error: reservationError } = await supabase.rpc(
        'reserve_tickets_random',
        {
          p_raffle_id: sanitizedRaffleId,
          p_client_id: customerId,
          p_quantity: totalTicketsToReserve,
        }
      );

      logger.debug('🔍 [DEBUG] Resultado de reserve_tickets_random:', {
        reservationResult,
        reservationError,
      });

      if (reservationError) {
        logger.error('❌ [ERROR] Error al llamar reserve_tickets_random:', reservationError);
        return { success: false, error: `Error al reservar boletos: ${reservationError.message}` };
      }

      if (!reservationResult || !reservationResult[0]?.success) {
        const errorMsg = reservationResult?.[0]?.error_message || 'Error al reservar boletos';
        logger.error('❌ [ERROR] reserve_tickets_random falló:', errorMsg);
        return { success: false, error: errorMsg };
      }

      const reservation = reservationResult[0];
      const ticketNumbers = reservation.ticket_numbers || [];

      // Validar que se reservaron la cantidad correcta de tickets
      if (!ticketNumbers || ticketNumbers.length !== totalTicketsToReserve) {
        logger.error('❌ [ERROR] Cantidad de tickets reservados no coincide:', {
          esperados: totalTicketsToReserve,
          recibidos: ticketNumbers?.length || 0,
        });
        // Intentar revertir la reserva (la orden ya fue creada)
        // Nota: Esto debería manejarse mejor con transacciones, pero por ahora registramos el error
        return { success: false, error: 'Error al reservar la cantidad correcta de boletos. Por favor, intenta nuevamente.' };
      }

      // IMPORTANTE: Corregir el total de la orden
      // El total debe ser quantity * price_per_ticket (no totalTicketsToReserve)
      // porque los tickets adicionales son GRATIS
      const correctTotal = quantity * raffle.price_per_ticket;

      logger.debug('💰 [PRICE_CORRECTION] Corrigiendo total de la orden:', {
        orderId: reservation.order_id,
        totalCalculadoPorSQL: reservation.total_amount,
        totalCorrecto: correctTotal,
        quantity: quantity,
        totalTicketsToReserve: totalTicketsToReserve,
        bonusTickets: bonusTickets,
        pricePerTicket: raffle.price_per_ticket
      });

      // Actualizar la orden con el total correcto
      // ⚠️ CRÍTICO: Si esto falla, la orden tiene un total incorrecto
      // Deberíamos considerar esto un error crítico
      const { error: updateTotalError } = await supabase
        .from('orders')
        .update({ total: correctTotal })
        .eq('id', reservation.order_id);

      if (updateTotalError) {
        logger.error('❌ [ERROR] Error CRÍTICO al actualizar total de la orden:', updateTotalError);
        // ⚠️ DECISIÓN: Fallar la compra si no podemos actualizar el total correcto
        // Esto previene que el usuario pague un monto incorrecto
        return { 
          success: false, 
          error: 'Error al procesar la orden. Por favor, contacta soporte con el ID: ' + reservation.order_id 
        };
      } else {
        logger.debug('✅ [PRICE_CORRECTION] Total de la orden actualizado correctamente a:', correctTotal);
      }

      logger.debug('✅ [SUCCESS] Tickets reservados:', {
        orderId: reservation.order_id,
        ticketNumbers,
        totalAmount: correctTotal, // Usar el total correcto
        ticketsReservados: totalTicketsToReserve,
        ticketsPagados: quantity,
        ticketsGratis: bonusTickets,
      });

      return {
        success: true,
        saleId: reservation.order_id, // Usamos order_id como saleId para compatibilidad
        orderId: reservation.order_id,
        ticketNumbers,
      };
    } catch (error) {
      logger.error('Error al crear compra con cliente:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  /**
   * Obtiene la confirmación de compra con los números asignados
   * Usa la tabla 'orders' en lugar de 'sales'
   */
  async getPurchaseConfirmation(orderId: string): Promise<PurchaseConfirmation | null> {
    try {
      // Obtener información de la orden con detalles del sorteo y cliente
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          raffle_id,
          numbers,
          total,
          status,
          created_at,
          raffles:raffle_id (
            id,
            title,
            description,
            image_url,
            price_per_ticket
          ),
          clients:client_id (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        logger.error('Error al obtener confirmación de compra:', orderError);
        return null;
      }

      // Tipar los datos de la orden
      const typedOrderData = orderData as unknown as OrderWithRelations;

      // Los números están en el campo JSONB 'numbers'
      const ticketNumbers = (typedOrderData.numbers as string[]) || [];

      // Calcular cantidad
      const quantity = ticketNumbers.length;

      const raffle = typedOrderData.raffles;
      const client = typedOrderData.clients;

      // Extraer nombre del client.name
      const clientNameParts = client?.name?.split(' ') || [];
      const clientName = clientNameParts[0] || '';

      // Convertir status de order a payment_status
      const paymentStatus: PurchaseConfirmation['payment_status'] =
        typedOrderData.status === 'completed' ? 'completed' :
          typedOrderData.status === 'expired' ? 'expired' :
            'pending';

      return {
        sale_id: typedOrderData.id,
        order_id: typedOrderData.id,
        raffle_id: typedOrderData.raffle_id,
        raffle_title: raffle?.title || 'Sorteo',
        prize_name: raffle?.description || 'Premio',
        prize_image_url: raffle?.image_url || null,
        ticket_start_number: 0, // No aplica con este sistema
        ticket_end_number: 0, // No aplica con este sistema
        quantity,
        total_amount: typedOrderData.total,
        payment_status: paymentStatus,
        purchase_date: typedOrderData.created_at,
        ticket_numbers: ticketNumbers,
        customerData: client
          ? {
            name: clientName,
            email: client.email || '',
            phone: client.phone || '',
          }
          : undefined,
      };
    } catch (error) {
      logger.error('Error al obtener confirmación:', error);
      return null;
    }
  },

  /**
   * Obtiene todos los boletos del usuario autenticado
   * Retorna todas las órdenes del usuario (completadas, pendientes, etc.)
   * 
   * @returns Array de boletos del usuario ordenados por fecha (más recientes primero)
   */
  async getUserTickets(): Promise<UserTicket[]> {
    try {
      // 1. Verificar autenticación - usar getSession primero para evitar llamadas innecesarias
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // No loggear si simplemente no hay sesión (comportamiento esperado)
        return [];
      }

      // 2. Obtener el usuario completo solo si hay sesión
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        // Solo loggear errores reales, no ausencia de autenticación
        if (authError && authError.message !== 'Invalid Refresh Token') {
          logger.warn('⚠️ [getUserTickets] Error al obtener usuario:', authError.message);
        }
        return [];
      }

      // 2. Buscar cliente asociado al usuario
      let client = await this.findClientByUser(authUser);

      // 3. Si no se encuentra cliente, buscar órdenes directamente por email del cliente
      if (!client && authUser.email) {
        logger.debug('🔄 [getUserTickets] Buscando órdenes directamente por email del cliente...');
        const ordersByEmail = await this.findOrdersByClientEmail(authUser.email);

        if (ordersByEmail.length > 0) {
          logger.debug(`✅ [getUserTickets] Se encontraron ${ordersByEmail.length} órdenes por email del cliente`);
          // Obtener el cliente de la primera orden y asociarlo
          const firstOrder = ordersByEmail[0];
          if (firstOrder.client_id) {
            // Actualizar el cliente con auth_user_id
            const { error: updateError } = await supabase
              .from('clients')
              .update({ auth_user_id: authUser.id })
              .eq('id', firstOrder.client_id);

            if (!updateError) {
              logger.debug('✅ [getUserTickets] Cliente asociado con auth_user_id');
              client = { id: firstOrder.client_id };
            }
          }

          // Formatear y retornar las órdenes encontradas
          return this.formatOrdersToTickets(ordersByEmail);
        }
      }

      if (!client) {
        logger.debug('⚠️ [getUserTickets] No se encontró cliente. El usuario puede no haber realizado compras aún.');
        return [];
      }

      // 4. Obtener órdenes del cliente
      const orders = await this.getOrdersByClient(client.id);

      if (!orders || orders.length === 0) {
        logger.debug('⚠️ [getUserTickets] No se encontraron órdenes para el cliente');
        return [];
      }

      logger.debug(`✅ [getUserTickets] Se encontraron ${orders.length} órdenes`);

      // 5. Formatear y retornar datos
      return this.formatOrdersToTickets(orders);
    } catch (error) {
      logger.error('❌ [getUserTickets] Error inesperado:', error);
      return [];
    }
  },

  /**
   * Busca el cliente asociado al usuario autenticado
   * Intenta primero por auth_user_id, luego por email si es necesario
   */
  async findClientByUser(authUser: { id: string; email?: string }): Promise<{ id: string } | null> {
    logger.debug('🔍 [findClientByUser] Buscando cliente para usuario:', {
      userId: authUser.id,
      email: authUser.email,
    });

if (!authUser.email) {
    // Si no tiene email, solo podemos buscar por auth_user_id via RPC (si pasamos email nulo)
    // Pero mejor intentamos directo si solo tenemos ID
    const { data: clientByAuthId } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

    if (clientByAuthId) {
        return clientByAuthId;
    }
    return null;
}

try {
    // Usar get_or_create_client para buscar y vincular
    // Pasamos null en nombre/telefono para no sobrescribir datos existentes
    const { data: clientId, error } = await supabase.rpc('get_or_create_client', {
        p_email: authUser.email,
        p_name: null,
        p_phone: null,
        p_auth_user_id: authUser.id
    });

    if (error) {
        logger.error('❌ [findClientByUser] Error en RPC:', error);
        return null;
    }

    if (clientId) {
        logger.debug('✅ [findClientByUser] Cliente encontrado/vinculado:', clientId);
        return { id: clientId as string };
    }

    return null;
} catch (err) {
    logger.error('❌ [findClientByUser] Error inesperado:', err);
    return null;
}
  },

  /**
   * Busca órdenes por email del cliente (útil cuando el cliente no tiene auth_user_id)
   */
  async findOrdersByClientEmail(email: string): Promise<OrderWithRaffle[]> {
    // Primero buscar clientes con ese email
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .ilike('email', email);

    if (clientsError || !clients || clients.length === 0) {
      logger.debug('⚠️ [findOrdersByClientEmail] No se encontraron clientes con email:', email);
      return [];
    }

    const clientIds = clients.map(c => c.id);
    logger.debug(`🔍 [findOrdersByClientEmail] Encontrados ${clientIds.length} clientes, buscando órdenes...`);

    // Buscar órdenes de esos clientes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        raffle_id,
        numbers,
        total,
        status,
        created_at,
        client_id,
        raffles:raffle_id (
          title,
          image_url
        )
      `)
      .in('client_id', clientIds)
      .order('created_at', { ascending: false });

    if (ordersError) {
      logger.error('❌ [findOrdersByClientEmail] Error al obtener órdenes:', ordersError);
      return [];
    }

    return (orders || []) as unknown as OrderWithRaffle[];
  },

  /**
   * Busca órdenes recientes que puedan pertenecer al usuario
   * Útil cuando el email no coincide exactamente
   */
  async findRecentOrdersForUser(authUser: { id: string; email?: string }): Promise<OrderWithRaffle[]> {
    // Buscar las últimas 50 órdenes y verificar sus clientes
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        raffle_id,
        numbers,
        total,
        status,
        created_at,
        client_id,
        clients:client_id (
          id,
          email,
          auth_user_id
        ),
        raffles:raffle_id (
          title,
          image_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (ordersError || !recentOrders) {
      logger.error('❌ [findRecentOrdersForUser] Error al obtener órdenes recientes:', ordersError);
      return [];
    }

    // Filtrar órdenes que puedan pertenecer al usuario
    interface OrderWithClient {
      id: string;
      raffle_id: string;
      numbers: string[];
      total: number;
      status: string;
      created_at: string;
      client_id: string;
      clients: {
        id: string;
        email: string;
        auth_user_id: string | null;
      } | null;
      raffles: {
        title: string;
        image_url: string | null;
      } | null;
    }

    const userOrders = (recentOrders as unknown as OrderWithClient[]).filter((order) => {
      const client = order.clients;
      if (!client) return false;

      // Si el cliente tiene auth_user_id que coincide
      if (client.auth_user_id === authUser.id) {
        return true;
      }

      // Si el cliente tiene el mismo email (case insensitive)
      if (authUser.email && client.email &&
        client.email.toLowerCase() === authUser.email.toLowerCase()) {
        return true;
      }

      return false;
    });

    logger.debug(`🔍 [findRecentOrdersForUser] De ${recentOrders.length} órdenes recientes, ${userOrders.length} pueden pertenecer al usuario`);

    // Retornar solo los campos necesarios
    return userOrders.map((order) => ({
      id: order.id,
      raffle_id: order.raffle_id,
      numbers: order.numbers,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
      client_id: order.client_id,
      raffles: order.raffles,
    })) as OrderWithRaffle[];
  },

  /**
   * Obtiene todas las órdenes de un cliente con información del sorteo
   */
  async getOrdersByClient(clientId: string): Promise<OrderWithRaffle[]> {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        raffle_id,
        numbers,
        total,
        status,
        created_at,
        raffles:raffle_id (
          title,
          image_url
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      logger.error('❌ [getOrdersByClient] Error al obtener órdenes:', ordersError);
      return [];
    }

    return (orders || []) as unknown as OrderWithRaffle[];
  },

  /**
   * Formatea las órdenes a formato de boletos del usuario
   */
  formatOrdersToTickets(orders: OrderWithRaffle[]): UserTicket[] {
    return orders.map((order) => ({
      order_id: order.id,
      raffle_id: order.raffle_id,
      raffle_title: order.raffles?.title || 'Sorteo',
      raffle_image_url: order.raffles?.image_url || null,
      ticket_numbers: (order.numbers as string[]) || [],
      total: order.total,
      purchase_date: order.created_at,
      status: order.status,
    }));
  },
};
