import { supabase } from '@/utils/supabase';
import type { PurchaseFormData, PurchaseConfirmation } from '@/types/purchase.types';
import type { Raffle } from '@/types/database.types';

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
      console.log('🔍 [DEBUG] Iniciando createPurchaseWithCustomer:', {
        raffleId,
        quantity,
        customerEmail: customerData.email,
      });

      // Validar raffleId
      if (!raffleId || raffleId.trim() === '') {
        console.error('❌ [ERROR] raffleId está vacío o inválido');
        return { success: false, error: 'ID de sorteo no válido' };
      }

      // 1. Obtener información del sorteo
      console.log('🔍 [DEBUG] Buscando sorteo con ID:', raffleId);
      
      const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .select('id, price_per_ticket, title, status')
        .eq('id', raffleId)
        .eq('status', 'active')
        .single();

      if (raffleError) {
        console.error('❌ [ERROR] Error al obtener sorteo:', raffleError);
        return { success: false, error: 'Sorteo no encontrado o no está disponible' };
      }

      if (!raffle) {
        console.error('❌ [ERROR] Sorteo no encontrado');
        return { success: false, error: 'Sorteo no encontrado o no está disponible' };
      }

      console.log('✅ [SUCCESS] Sorteo encontrado:', {
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
        console.log('✅ [createPurchaseWithCustomer] Usuario autenticado:', {
          userId,
          userEmail,
          customerEmail: customerData.email,
        });
      } else {
        console.log('⚠️ [createPurchaseWithCustomer] Usuario no autenticado (guest checkout)');
      }

      // Crear o buscar client (nota: la tabla se llama 'clients' no 'customers')
      const fullName = `${customerData.name} ${customerData.lastName}`.trim();
      
      // Usar el email del usuario autenticado si está disponible, sino el del formulario
      const clientEmail = userEmail || customerData.email;
      
      // Buscar client existente
      // - Si está autenticado: buscar primero por auth_user_id, luego por email
      // - Si es guest: buscar por email
      let existingClient = null;

      if (userId) {
        // Usuario autenticado: buscar primero por auth_user_id
        const { data: clientByAuthId } = await supabase
          .from('clients')
          .select('id')
          .eq('auth_user_id', userId)
          .maybeSingle();
        
        if (clientByAuthId) {
          existingClient = clientByAuthId;
        } else {
          // Si no se encuentra por auth_user_id, buscar por email (case insensitive)
          // (puede ser que el cliente se creó antes de autenticarse)
          const { data: clientByEmail } = await supabase
            .from('clients')
            .select('id')
            .ilike('email', clientEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          existingClient = clientByEmail;
          if (existingClient) {
            console.log('✅ [createPurchaseWithCustomer] Cliente encontrado por email (usuario autenticado)');
          }
        }
      } else {
        // Guest checkout: buscar por email (case insensitive)
        const { data } = await supabase
          .from('clients')
          .select('id')
          .ilike('email', clientEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        existingClient = data;
        if (existingClient) {
          console.log('✅ [createPurchaseWithCustomer] Cliente encontrado por email (guest)');
        }
      }

      if (existingClient) {
        customerId = existingClient.id;
        
        // Actualizar datos del client, incluyendo auth_user_id si está autenticado
        const updateData: {
          name: string;
          phone: string;
          auth_user_id?: string | null;
        } = {
          name: fullName,
          phone: customerData.whatsapp,
        };

        // Si el usuario está autenticado y el cliente no tiene auth_user_id, asignarlo
        if (userId) {
          updateData.auth_user_id = userId;
        }

        await supabase
          .from('clients')
          .update(updateData)
          .eq('id', customerId);
        
        console.log('✅ [createPurchaseWithCustomer] Cliente actualizado:', {
          customerId,
          auth_user_id: userId || 'no asignado',
        });
      } else {
        // Crear nuevo client
        const clientInsertData: {
          email: string;
          name: string;
          phone: string;
          auth_user_id?: string | null;
        } = {
          email: clientEmail, // Usar el email del usuario autenticado si está disponible
          name: fullName,
          phone: customerData.whatsapp,
        };

        if (userId) {
          clientInsertData.auth_user_id = userId;
          console.log('✅ [createPurchaseWithCustomer] Creando cliente con auth_user_id:', userId);
        } else {
          console.log('⚠️ [createPurchaseWithCustomer] Creando cliente sin auth_user_id (guest)');
        }

        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert(clientInsertData)
          .select('id')
          .single();

        if (clientError || !newClient) {
          console.error('Error al crear client:', clientError);
          console.error('Detalle del error:', {
            code: clientError?.code,
            message: clientError?.message,
            details: clientError?.details,
            hint: clientError?.hint,
          });
          return { 
            success: false, 
            error: `Error al crear cliente: ${clientError?.message || 'Tabla "clients" no existe. Por favor, ejecuta CREAR_TABLA_CLIENTS.sql'}` 
          };
        }

        customerId = newClient.id;
      }

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
        console.log('🎁 [BONUS] Combo 10: agregando 5 tickets adicionales (total: 15)');
      } else if (quantity === 20) {
        bonusTickets = 7;
        totalTicketsToReserve = 27;
        console.log('🎁 [BONUS] Combo 20: agregando 7 tickets adicionales (total: 27)');
      }

      // 4. Reservar tickets aleatoriamente usando la función SQL
      // Esto creará automáticamente la orden (order) y reservará los tickets
      console.log('🔍 [DEBUG] Llamando a reserve_tickets_random:', {
        raffleId,
        quantity: totalTicketsToReserve,
        originalQuantity: quantity,
        bonusTickets,
        customerId,
      });

      const { data: reservationResult, error: reservationError } = await supabase.rpc(
        'reserve_tickets_random',
        {
          p_raffle_id: raffleId,
          p_client_id: customerId,
          p_quantity: totalTicketsToReserve,
        }
      );

      console.log('🔍 [DEBUG] Resultado de reserve_tickets_random:', {
        reservationResult,
        reservationError,
      });

      if (reservationError) {
        console.error('❌ [ERROR] Error al llamar reserve_tickets_random:', reservationError);
        return { success: false, error: `Error al reservar boletos: ${reservationError.message}` };
      }

      if (!reservationResult || !reservationResult[0]?.success) {
        const errorMsg = reservationResult?.[0]?.error_message || 'Error al reservar boletos';
        console.error('❌ [ERROR] reserve_tickets_random falló:', errorMsg);
        return { success: false, error: errorMsg };
      }

      const reservation = reservationResult[0];
      const ticketNumbers = reservation.ticket_numbers || [];
      
      // IMPORTANTE: Corregir el total de la orden
      // El total debe ser quantity * price_per_ticket (no totalTicketsToReserve)
      // porque los tickets adicionales son GRATIS
      const correctTotal = quantity * raffle.price_per_ticket;
      
      console.log('💰 [PRICE_CORRECTION] Corrigiendo total de la orden:', {
        orderId: reservation.order_id,
        totalCalculadoPorSQL: reservation.total_amount,
        totalCorrecto: correctTotal,
        quantity: quantity,
        totalTicketsToReserve: totalTicketsToReserve,
        bonusTickets: bonusTickets,
        pricePerTicket: raffle.price_per_ticket
      });

      // Actualizar la orden con el total correcto
      const { error: updateTotalError } = await supabase
        .from('orders')
        .update({ total: correctTotal })
        .eq('id', reservation.order_id);

      if (updateTotalError) {
        console.error('❌ [ERROR] Error al actualizar total de la orden:', updateTotalError);
        // No fallamos la compra por esto, pero lo registramos
      } else {
        console.log('✅ [PRICE_CORRECTION] Total de la orden actualizado correctamente a:', correctTotal);
      }
      
      console.log('✅ [SUCCESS] Tickets reservados:', {
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
      console.error('Error al crear compra con cliente:', error);
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
        console.error('Error al obtener confirmación de compra:', orderError);
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
      console.error('Error al obtener confirmación:', error);
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
      // 1. Verificar autenticación
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.log('❌ [getUserTickets] Usuario no autenticado');
        return [];
      }

      // 2. Buscar cliente asociado al usuario
      let client = await this.findClientByUser(authUser);
      
      // 3. Si no se encuentra cliente, buscar órdenes directamente por email del cliente
      if (!client && authUser.email) {
        console.log('🔄 [getUserTickets] Buscando órdenes directamente por email del cliente...');
        const ordersByEmail = await this.findOrdersByClientEmail(authUser.email);
        
        if (ordersByEmail.length > 0) {
          console.log(`✅ [getUserTickets] Se encontraron ${ordersByEmail.length} órdenes por email del cliente`);
          // Obtener el cliente de la primera orden y asociarlo
          const firstOrder = ordersByEmail[0];
          if (firstOrder.client_id) {
            // Actualizar el cliente con auth_user_id
            const { error: updateError } = await supabase
              .from('clients')
              .update({ auth_user_id: authUser.id })
              .eq('id', firstOrder.client_id);
            
            if (!updateError) {
              console.log('✅ [getUserTickets] Cliente asociado con auth_user_id');
              client = { id: firstOrder.client_id };
            }
          }
          
          // Formatear y retornar las órdenes encontradas
          return this.formatOrdersToTickets(ordersByEmail);
        }
      }
      
      if (!client) {
        console.log('⚠️ [getUserTickets] No se encontró cliente. El usuario puede no haber realizado compras aún.');
        return [];
      }

      // 4. Obtener órdenes del cliente
      const orders = await this.getOrdersByClient(client.id);
      
      if (!orders || orders.length === 0) {
        console.log('⚠️ [getUserTickets] No se encontraron órdenes para el cliente');
        return [];
      }

      console.log(`✅ [getUserTickets] Se encontraron ${orders.length} órdenes`);

      // 5. Formatear y retornar datos
      return this.formatOrdersToTickets(orders);
    } catch (error) {
      console.error('❌ [getUserTickets] Error inesperado:', error);
      return [];
    }
  },

  /**
   * Busca el cliente asociado al usuario autenticado
   * Intenta primero por auth_user_id, luego por email si es necesario
   */
  async findClientByUser(authUser: { id: string; email?: string }): Promise<{ id: string } | null> {
    console.log('🔍 [findClientByUser] Buscando cliente para usuario:', {
      userId: authUser.id,
      email: authUser.email,
    });

    // Intentar primero por auth_user_id
    const { data: clientByAuthId, error: errorByAuthId } = await supabase
      .from('clients')
      .select('id, email, auth_user_id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (!errorByAuthId && clientByAuthId) {
      console.log('✅ [findClientByUser] Cliente encontrado por auth_user_id:', clientByAuthId.id);
      return { id: clientByAuthId.id };
    }

    if (errorByAuthId) {
      console.error('❌ [findClientByUser] Error al buscar por auth_user_id:', errorByAuthId);
    }

    // Si no se encuentra y tiene email, intentar por email (case insensitive)
    if (authUser.email) {
      console.log('⚠️ [findClientByUser] Buscando por email como fallback:', authUser.email);
      
      // Buscar todos los clientes con ese email (case insensitive)
      const { data: allClients, error: errorByEmail } = await supabase
        .from('clients')
        .select('id, email, auth_user_id')
        .ilike('email', authUser.email)
        .order('created_at', { ascending: false });

      if (errorByEmail) {
        console.error('❌ [findClientByUser] Error al buscar por email:', errorByEmail);
      } else if (allClients && allClients.length > 0) {
        // Tomar el más reciente
        const clientByEmail = allClients[0];
        console.log('✅ [findClientByUser] Cliente encontrado por email:', {
          clientId: clientByEmail.id,
          clientEmail: clientByEmail.email,
          hasAuthUserId: !!clientByEmail.auth_user_id,
        });

        // Si el cliente no tiene auth_user_id, actualizarlo
        if (!clientByEmail.auth_user_id) {
          console.log('🔄 [findClientByUser] Actualizando auth_user_id del cliente...');
          const { error: updateError } = await supabase
            .from('clients')
            .update({ auth_user_id: authUser.id })
            .eq('id', clientByEmail.id);

          if (updateError) {
            console.error('❌ [findClientByUser] Error al actualizar auth_user_id:', updateError);
          } else {
            console.log('✅ [findClientByUser] auth_user_id actualizado correctamente');
          }
        }
        
        return { id: clientByEmail.id };
      } else {
        console.log('⚠️ [findClientByUser] No se encontró cliente con email:', authUser.email);
        
        // Debug: mostrar todos los clientes para ver qué hay
        const { data: allClientsDebug } = await supabase
          .from('clients')
          .select('id, email, auth_user_id, created_at')
          .limit(10)
          .order('created_at', { ascending: false });
        
        console.log('🔍 [findClientByUser] Últimos 10 clientes en BD:', allClientsDebug);
      }
    }

    console.log('❌ [findClientByUser] No se encontró cliente para el usuario');
    return null;
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
      console.log('⚠️ [findOrdersByClientEmail] No se encontraron clientes con email:', email);
      return [];
    }

    const clientIds = clients.map(c => c.id);
    console.log(`🔍 [findOrdersByClientEmail] Encontrados ${clientIds.length} clientes, buscando órdenes...`);

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
      console.error('❌ [findOrdersByClientEmail] Error al obtener órdenes:', ordersError);
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
      console.error('❌ [findRecentOrdersForUser] Error al obtener órdenes recientes:', ordersError);
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

    console.log(`🔍 [findRecentOrdersForUser] De ${recentOrders.length} órdenes recientes, ${userOrders.length} pueden pertenecer al usuario`);

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
      console.error('❌ [getOrdersByClient] Error al obtener órdenes:', ordersError);
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
