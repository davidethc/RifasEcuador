import { supabase } from '@/shared/lib/supabase';
import type { PurchaseConfirmation } from '../types/purchase.types';

export const purchaseService = {
  /**
   * Crea una nueva compra/participación con datos del cliente
   * Crea o actualiza customer, crea sale, asigna tickets
   */
  async createPurchaseWithCustomer(
    raffleId: string,
    quantity: number,
    customerData: { name: string; lastName: string; whatsapp: string; email: string; documentId?: string }
  ): Promise<string | null> {
    try {
      console.log('🔍 [DEBUG] Iniciando createPurchaseWithCustomer:', {
        raffleId,
        quantity,
        customerEmail: customerData.email,
      });

      // Validar raffleId
      if (!raffleId || raffleId.trim() === '') {
        console.error('❌ [ERROR] raffleId está vacío o inválido');
        throw new Error('ID de sorteo no válido');
      }

      // 1. Obtener información del sorteo (usar vista pública que solo muestra sorteos activos)
      console.log('🔍 [DEBUG] Buscando sorteo en public_raffles con ID:', raffleId);
      
      const { data: raffle, error: raffleError } = await supabase
        .from('public_raffles')
        .select('id, price_per_ticket, title, status')
        .eq('id', raffleId)
        .single();

      if (raffleError) {
        console.error('❌ [ERROR] Error al obtener sorteo de public_raffles:', {
          code: raffleError.code,
          message: raffleError.message,
          details: raffleError.details,
          hint: raffleError.hint,
          raffleId,
        });
        
        // Intentar buscar en la tabla raffles directamente para diagnóstico
        console.log('🔍 [DEBUG] Intentando buscar en tabla raffles directamente...');
        const { data: raffleDirect, error: directError } = await supabase
          .from('raffles')
          .select('id, title, status, price_per_ticket')
          .eq('id', raffleId)
          .maybeSingle();
        
        if (directError) {
          console.error('❌ [ERROR] Error al buscar en tabla raffles:', directError);
        } else if (raffleDirect) {
          console.warn('⚠️ [WARNING] Sorteo encontrado en tabla raffles pero no en public_raffles:', {
            id: raffleDirect.id,
            title: raffleDirect.title,
            status: raffleDirect.status,
            motivo: raffleDirect.status !== 'active' 
              ? `El sorteo tiene status "${raffleDirect.status}" pero necesita estar "active"` 
              : 'Posible problema con la vista public_raffles',
          });
        } else {
          console.error('❌ [ERROR] Sorteo no existe en ninguna tabla con ID:', raffleId);
        }
        
        // Si es error PGRST116, el sorteo no existe o no está activo
        if (raffleError.code === 'PGRST116') {
          const errorMsg = raffleDirect 
            ? `Sorteo encontrado pero no está activo (status: "${raffleDirect.status}"). Necesita estar "active".`
            : 'Sorteo no encontrado o no está disponible. Verifica que el sorteo esté activo.';
          throw new Error(errorMsg);
        }
        throw new Error(`Error al obtener sorteo: ${raffleError.message || 'Sorteo no encontrado'}`);
      }

      if (!raffle) {
        console.error('❌ [ERROR] Sorteo no encontrado (data es null):', raffleId);
        throw new Error('Sorteo no encontrado o no está disponible');
      }

      console.log('✅ [SUCCESS] Sorteo encontrado:', {
        id: raffle.id,
        price_per_ticket: raffle.price_per_ticket,
        title: raffle.title || 'Sin título',
      });

      // 2. Obtener o crear customer
      // Estrategia:
      // - Si está autenticado: buscar/crear user, luego buscar/crear customer vinculado
      // - Si NO está autenticado: crear customer sin user_id (guest)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      let customerId: string | null = null;
      let userId: string | null = null;

      // Si está autenticado, obtener o crear user
      if (authUser && !authError) {
        // Buscar user existente
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name')
          .eq('auth_user_id', authUser.id)
          .maybeSingle();

        if (userError) {
          console.warn('Error al buscar user:', userError);
        }

        if (userData) {
          userId = userData.id;
          
          // Buscar customer existente vinculado a este user
          // Si hay múltiples, tomar el más reciente
          const { data: existingCustomers, error: customerQueryError } = await supabase
            .from('customers')
            .select('id, name, email, phone')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

          if (customerQueryError) {
            console.warn('Error al buscar customer:', customerQueryError);
          }

          const existingCustomer = existingCustomers && existingCustomers.length > 0 ? existingCustomers[0] : null;

          if (existingCustomer) {
            customerId = existingCustomer.id;
            // Actualizar datos del customer con los nuevos datos del formulario
            const fullName = `${customerData.name} ${customerData.lastName}`.trim();
            const { error: updateError } = await supabase
              .from('customers')
              .update({
                name: fullName,
                email: customerData.email,
                phone: customerData.whatsapp,
                updated_at: new Date().toISOString(),
              })
              .eq('id', customerId);
            
            if (updateError) {
              console.warn('Error al actualizar customer (continuando):', updateError);
              // Continuar de todas formas, no es crítico - los datos se guardarán en la venta
            }
          }
        } else {
          // User no existe en la tabla users, pero el usuario está autenticado
          // Esto puede pasar si el trigger handle_new_user no se ejecutó
          // Intentar crear el user (puede fallar si ya existe por email)
          const fullName = `${customerData.name} ${customerData.lastName}`.trim();
          const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert({
              auth_user_id: authUser.id,
              email: customerData.email,
              name: fullName,
            })
            .select('id')
            .maybeSingle();

          if (createUserError) {
            // Si falla, intentar obtener el user por email o auth_user_id
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('auth_user_id', authUser.id)
              .maybeSingle();
            
            if (existingUser) {
              userId = existingUser.id;
            } else {
              console.warn('No se pudo crear/obtener user, continuando como guest');
            }
          } else if (newUser) {
            userId = newUser.id;
          }
        }
      }

      // Si no hay customer, crear uno (puede ser con o sin user_id)
      if (!customerId) {
        const fullName = `${customerData.name} ${customerData.lastName}`.trim();
        
        // Preparar datos para insert
        const customerInsertData: {
          email: string;
          name: string;
          phone: string;
          user_id?: string | null;
        } = {
          email: customerData.email,
          name: fullName,
          phone: customerData.whatsapp,
        };

        // Solo agregar user_id si existe (usuarios autenticados)
        if (userId) {
          customerInsertData.user_id = userId;
        }

        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert(customerInsertData)
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          console.error('Error al crear customer:', customerError);
          // Si es error 401, puede ser problema de RLS
          if (customerError?.code === '42501' || customerError?.message?.includes('permission')) {
            throw new Error('No tienes permisos para crear un cliente. Por favor, contacta al soporte.');
          }
          throw new Error(`Error al crear cliente: ${customerError?.message || 'Error desconocido'}`);
        }

        customerId = newCustomer.id;
      }

      // 3. Calcular total
      const totalAmount = quantity * raffle.price_per_ticket;

      // 4. Crear la venta (sale) con estado pending
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          raffle_id: raffleId,
          customer_id: customerId,
          quantity,
          unit_price: raffle.price_per_ticket,
          total_amount: totalAmount,
          payment_status: 'pending',
          ticket_start_number: 0,
          ticket_end_number: 0,
        })
        .select('id')
        .single();

      if (saleError || !sale) {
        console.error('❌ [ERROR] Error al crear la venta:', saleError);
        throw new Error('Error al crear la venta');
      }

      console.log('✅ [SUCCESS] Venta creada:', sale.id);

      // 5. Asignar tickets aleatoriamente usando la función SQL
      console.log('🔍 [DEBUG] Llamando a assign_tickets_atomic:', {
        raffleId,
        quantity,
        saleId: sale.id,
      });

      const { data: assignmentResult, error: assignmentError } = await supabase.rpc(
        'assign_tickets_atomic',
        {
          p_raffle_id: raffleId,
          p_quantity: quantity,
          p_sale_id: sale.id,
        }
      );

      console.log('🔍 [DEBUG] Resultado de assign_tickets_atomic:', {
        assignmentResult,
        assignmentError,
        success: assignmentResult?.[0]?.success,
        error_message: assignmentResult?.[0]?.error_message,
      });

      if (assignmentError) {
        console.error('❌ [ERROR] Error al llamar assign_tickets_atomic:', assignmentError);
        // Si falla la asignación, eliminar la venta
        await supabase.from('sales').delete().eq('id', sale.id);
        throw new Error(`Error al asignar boletos: ${assignmentError.message}`);
      }

      if (!assignmentResult || !assignmentResult[0]?.success) {
        const errorMsg = assignmentResult?.[0]?.error_message || 'Error al asignar boletos';
        console.error('❌ [ERROR] assign_tickets_atomic falló:', {
          assignmentResult,
          error_message: errorMsg,
        });
        
        // Si falla la asignación, eliminar la venta
        await supabase.from('sales').delete().eq('id', sale.id);
        
        // Si el error dice "Sorteo no encontrado", verificar en la tabla raffles
        if (errorMsg.includes('Sorteo no encontrado')) {
          console.log('🔍 [DEBUG] Verificando sorteo en tabla raffles directamente...');
          const { data: raffleCheck, error: checkError } = await supabase
            .from('raffles')
            .select('id, title, status')
            .eq('id', raffleId)
            .maybeSingle();
          
          if (checkError) {
            console.error('❌ [ERROR] Error al verificar sorteo:', checkError);
          } else if (raffleCheck) {
            console.warn('⚠️ [WARNING] Sorteo encontrado en raffles:', raffleCheck);
            throw new Error(`El sorteo existe pero la función SQL no lo encuentra. Status: ${raffleCheck.status}. Posible problema: la función assign_tickets_atomic necesita permisos SECURITY DEFINER o el sorteo no está accesible desde la función.`);
          } else {
            throw new Error('Sorteo no encontrado en la base de datos. Verifica que el sorteo exista y esté activo.');
          }
        }
        
        throw new Error(errorMsg);
      }

      const assignment = assignmentResult[0];
      console.log('✅ [SUCCESS] Tickets asignados:', {
        ticket_start_number: assignment.ticket_start_number,
        ticket_end_number: assignment.ticket_end_number,
      });

      // 6. Actualizar la venta con los números asignados (pero mantener pending hasta pago)
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          ticket_start_number: assignment.ticket_start_number,
          ticket_end_number: assignment.ticket_end_number,
          // NO completar aún, esperar pago
          // payment_status: 'completed',
          // completed_at: new Date().toISOString(),
        })
        .eq('id', sale.id);

      if (updateError) {
        console.error('Error al actualizar sale:', updateError);
        // Si es error de permisos, puede ser problema de RLS
        if (updateError.code === '42501' || updateError.message?.includes('permission')) {
          throw new Error('No tienes permisos para actualizar la venta. Por favor, contacta al soporte.');
        }
        throw new Error(`Error al actualizar la venta: ${updateError.message || 'Error desconocido'}`);
      }

      return sale.id;
    } catch (error) {
      console.error('Error al crear compra con cliente:', error);
      return null;
    }
  },

  /**
   * Crea una nueva compra/participación en un sorteo (versión simple)
   * Asigna tickets aleatoriamente y retorna el sale_id
   * @deprecated Usar createPurchaseWithCustomer en su lugar
   */
  async createPurchase(raffleId: string, quantity: number = 1): Promise<string | null> {
    try {
      // 1. Obtener información del sorteo (usar vista pública que solo muestra sorteos activos)
      const { data: raffle, error: raffleError } = await supabase
        .from('public_raffles')
        .select('id, price_per_ticket')
        .eq('id', raffleId)
        .single();

      if (raffleError || !raffle) {
        // Si es error PGRST116, el sorteo no existe o no está activo
        if (raffleError?.code === 'PGRST116') {
          throw new Error('Sorteo no encontrado o no está disponible');
        }
        throw new Error(`Error al obtener sorteo: ${raffleError?.message || 'Sorteo no encontrado'}`);
      }

      // 2. Obtener o crear customer
      // Primero intentar obtener el usuario actual
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      let customerId: string | null = null;

      if (authUser) {
        // Si está autenticado, buscar customer por user_id
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', authUser.id)
          .single();

        if (userData) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', userData.id)
            .single();

          if (customerData) {
            customerId = customerData.id;
          }
        }
      }

      // Si no hay customer, crear uno temporal (para usuarios no autenticados)
      if (!customerId) {
        const email = authUser?.email || `guest_${Date.now()}@temp.com`;
        const name = authUser?.user_metadata?.name || 'Usuario';

        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            email,
            name,
            user_id: authUser ? (await supabase.from('users').select('id').eq('auth_user_id', authUser.id).single()).data?.id : null,
          })
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          throw new Error('Error al crear cliente');
        }

        customerId = newCustomer.id;
      }

      // 3. Calcular total
      const totalAmount = quantity * raffle.price_per_ticket;

      // 4. Crear la venta (sale) con estado pending
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          raffle_id: raffleId,
          customer_id: customerId,
          quantity,
          unit_price: raffle.price_per_ticket,
          total_amount: totalAmount,
          payment_status: 'pending',
          ticket_start_number: 0, // Se actualizará después
          ticket_end_number: 0, // Se actualizará después
        })
        .select('id')
        .single();

      if (saleError || !sale) {
        console.error('❌ [ERROR] Error al crear la venta:', saleError);
        throw new Error('Error al crear la venta');
      }

      console.log('✅ [SUCCESS] Venta creada:', sale.id);

      // 5. Asignar tickets aleatoriamente usando la función SQL
      console.log('🔍 [DEBUG] Llamando a assign_tickets_atomic:', {
        raffleId,
        quantity,
        saleId: sale.id,
      });

      const { data: assignmentResult, error: assignmentError } = await supabase.rpc(
        'assign_tickets_atomic',
        {
          p_raffle_id: raffleId,
          p_quantity: quantity,
          p_sale_id: sale.id,
        }
      );

      console.log('🔍 [DEBUG] Resultado de assign_tickets_atomic:', {
        assignmentResult,
        assignmentError,
        success: assignmentResult?.[0]?.success,
        error_message: assignmentResult?.[0]?.error_message,
      });

      if (assignmentError) {
        console.error('❌ [ERROR] Error al llamar assign_tickets_atomic:', assignmentError);
        // Si falla la asignación, eliminar la venta
        await supabase.from('sales').delete().eq('id', sale.id);
        throw new Error(`Error al asignar boletos: ${assignmentError.message}`);
      }

      if (!assignmentResult || !assignmentResult[0]?.success) {
        const errorMsg = assignmentResult?.[0]?.error_message || 'Error al asignar boletos';
        console.error('❌ [ERROR] assign_tickets_atomic falló:', {
          assignmentResult,
          error_message: errorMsg,
        });
        
        // Si falla la asignación, eliminar la venta
        await supabase.from('sales').delete().eq('id', sale.id);
        
        // Si el error dice "Sorteo no encontrado", verificar en la tabla raffles
        if (errorMsg.includes('Sorteo no encontrado')) {
          console.log('🔍 [DEBUG] Verificando sorteo en tabla raffles directamente...');
          const { data: raffleCheck, error: checkError } = await supabase
            .from('raffles')
            .select('id, title, status')
            .eq('id', raffleId)
            .maybeSingle();
          
          if (checkError) {
            console.error('❌ [ERROR] Error al verificar sorteo:', checkError);
          } else if (raffleCheck) {
            console.warn('⚠️ [WARNING] Sorteo encontrado en raffles:', raffleCheck);
            throw new Error(`El sorteo existe pero la función SQL no lo encuentra. Status: ${raffleCheck.status}. Posible problema: la función assign_tickets_atomic necesita permisos SECURITY DEFINER o el sorteo no está accesible desde la función.`);
          } else {
            throw new Error('Sorteo no encontrado en la base de datos. Verifica que el sorteo exista y esté activo.');
          }
        }
        
        throw new Error(errorMsg);
      }

      const assignment = assignmentResult[0];
      console.log('✅ [SUCCESS] Tickets asignados:', {
        ticket_start_number: assignment.ticket_start_number,
        ticket_end_number: assignment.ticket_end_number,
      });

      // 6. Actualizar la venta con los números asignados y completar
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          ticket_start_number: assignment.ticket_start_number,
          ticket_end_number: assignment.ticket_end_number,
          payment_status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', sale.id);

      if (updateError) {
        throw new Error('Error al actualizar la venta');
      }

      return sale.id;
    } catch (error) {
      console.error('Error al crear compra:', error);
      return null;
    }
  },

  /**
   * Obtiene la confirmación de compra con los números asignados
   * Se usa cuando el usuario completa una compra y necesita ver sus números
   */
  async getPurchaseConfirmation(saleId: string): Promise<PurchaseConfirmation | null> {
    // Obtener información de la venta con detalles del sorteo y cliente
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .select(`
        id,
        raffle_id,
        ticket_start_number,
        ticket_end_number,
        quantity,
        total_amount,
        payment_status,
        created_at,
        raffles:raffle_id (
          id,
          title,
          prize_name,
          prize_image_url
        ),
        customers:customer_id (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('id', saleId)
      .single();

    if (saleError || !saleData) {
      console.error('Error al obtener confirmación de compra:', saleError);
      return null;
    }

    // Obtener números individuales de tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('ticket_number')
      .eq('sale_id', saleId)
      .eq('status', 'sold')
      .order('ticket_number', { ascending: true });

    if (ticketsError) {
      console.error('Error al obtener números de tickets:', ticketsError);
    }

    const ticketNumbers = ticketsData?.map((t) => t.ticket_number) || [];

    // Si no hay tickets individuales, generar rango
    if (ticketNumbers.length === 0 && saleData.ticket_start_number && saleData.ticket_end_number) {
      for (let i = saleData.ticket_start_number; i <= saleData.ticket_end_number; i++) {
        ticketNumbers.push(i);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raffle = saleData.raffles as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customer = saleData.customers as any;

    // Extraer nombre y apellido del customer.name (formato: "Nombre Apellido")
    const customerNameParts = customer?.name?.split(' ') || [];
    const customerName = customerNameParts[0] || '';

    return {
      sale_id: saleData.id,
      raffle_id: saleData.raffle_id,
      raffle_title: raffle?.title || 'Sorteo',
      prize_name: raffle?.prize_name || 'Premio',
      prize_image_url: raffle?.prize_image_url || null,
      ticket_start_number: saleData.ticket_start_number,
      ticket_end_number: saleData.ticket_end_number,
      quantity: saleData.quantity,
      total_amount: saleData.total_amount,
      payment_status: saleData.payment_status,
      purchase_date: saleData.created_at,
      ticket_numbers: ticketNumbers,
      customerData: customer
        ? {
            name: customerName,
            email: customer.email || '',
            phone: customer.phone || '',
          }
        : undefined,
    };
  },
};
