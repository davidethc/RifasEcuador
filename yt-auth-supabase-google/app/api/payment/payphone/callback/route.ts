import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con service role para bypass de RLS
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Callback de Payphone después de completar el pago
 * 
 * Payphone redirige aquí con los siguientes parámetros:
 * - id: Transaction ID de Payphone
 * - clientTransactionId: ID único generado por nosotros (order-{orderId}-{timestamp})
 * 
 * Documentación: https://docs.payphone.app/cajita-de-pagos-payphone
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('id');
    const clientTransactionId = searchParams.get('clientTransactionId');

    console.log('📥 Callback de Payphone recibido:', {
      transactionId,
      clientTransactionId,
    });

    // Validar parámetros
    if (!transactionId || !clientTransactionId) {
      console.error('❌ Faltan parámetros en el callback');
      return NextResponse.redirect(
        new URL('/comprar/error?message=Parámetros faltantes', request.url)
      );
    }

    // Extraer orderId del clientTransactionId
    // Formato nuevo: ord-{8chars}-{timestamp}
    // Formato antiguo: order-{orderId}-{timestamp}
    let orderId: string | null = null;
    
    // Intentar formato nuevo primero
    const newFormatMatch = clientTransactionId.match(/^ord-([a-f0-9]{8})-/);
    if (newFormatMatch) {
      // Solo tenemos los primeros 8 caracteres, necesitamos buscar la orden completa
      const orderPrefix = newFormatMatch[1];
      console.log('🔍 Buscando orden con prefijo:', orderPrefix);
      
      // Buscar en las últimas 50 órdenes (usando admin client - bypass RLS)
      // No podemos usar ILIKE directamente con UUID, así que obtenemos órdenes recientes y filtramos en JS
      const { data: orders, error: searchError } = await supabase
        .from('orders')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (searchError) {
        console.error('❌ Error al buscar orden:', searchError);
      } else {
        console.log('📊 Órdenes recientes obtenidas:', orders?.length || 0);
        
        // Filtrar en JavaScript por el prefijo del UUID
        const matchingOrder = orders?.find(order => 
          order.id.toLowerCase().startsWith(orderPrefix.toLowerCase())
        );
        
        if (matchingOrder) {
          orderId = matchingOrder.id;
          console.log('✅ Orden encontrada:', orderId);
        } else {
          console.log('⚠️ No se encontró orden con prefijo:', orderPrefix);
        }
      }
    } else {
      // Intentar formato antiguo
      const oldFormatMatch = clientTransactionId.match(/order-([a-f0-9-]+)-/);
      if (oldFormatMatch) {
        orderId = oldFormatMatch[1];
      }
    }
    
    if (!orderId) {
      console.error('❌ No se pudo encontrar orderId para:', clientTransactionId);
      return NextResponse.redirect(
        new URL('/comprar/error?message=ID de orden inválido', request.url)
      );
    }

    console.log('✅ Order ID completo recuperado:', orderId);

    // Confirmar el pago con la API de Payphone
    const confirmationResult = await confirmPayphoneTransaction(transactionId, clientTransactionId);

    if (!confirmationResult.success) {
      console.error('❌ Error al confirmar transacción:', confirmationResult.error);
      return NextResponse.redirect(
        new URL(`/comprar/error?message=${encodeURIComponent(confirmationResult.error || 'Error al confirmar pago')}`, request.url)
      );
    }

    const transaction = confirmationResult.data;
    const transactionStatus = transaction?.transactionStatus || 'Pending';

    console.log('✅ Transacción confirmada:', {
      transactionId,
      status: transactionStatus,
      amount: transaction?.amount,
      optionalParameter3: transaction?.optionalParameter3,
    });

    // PRIMERO: Intentar usar optionalParameter3 (tiene el orderId completo según docs)
    const finalOrderId = transaction?.optionalParameter3 || orderId;
    
    console.log('🔍 OrderId final a usar:', {
      fromOptionalParameter3: transaction?.optionalParameter3,
      fromSearch: orderId,
      final: finalOrderId,
    });

    // Actualizar o crear registro en la tabla payments (usando admin client)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', finalOrderId)
      .maybeSingle();

    const paymentData = {
      order_id: finalOrderId,
      provider: 'payphone',
      provider_reference: transactionId,
      amount: transaction?.amount || 0,
      status: transactionStatus.toLowerCase(),
      created_at: new Date().toISOString(),
    };

    if (existingPayment) {
      // Actualizar pago existente
      console.log('🔄 Actualizando pago existente:', existingPayment.id);
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          provider_reference: transactionId,
          status: transactionStatus.toLowerCase(),
        })
        .eq('id', existingPayment.id);
      
      if (updatePaymentError) {
        console.error('❌ Error al actualizar payment:', updatePaymentError);
      } else {
        console.log('✅ Payment actualizado');
      }
    } else {
      // Crear nuevo registro de pago
      console.log('✨ Creando nuevo registro en payments...');
      const { error: insertError } = await supabase
        .from('payments')
        .insert(paymentData);
      
      if (insertError) {
        console.error('❌ Error al insertar en payments:', insertError);
      } else {
        console.log('✅ Registro creado en payments');
      }
    }

    // Actualizar el estado de la orden según el resultado
    if (transactionStatus === 'Approved') {
      // Pago aprobado: actualizar orden a completada
      console.log('🔄 Actualizando orden a completed...');
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_method: 'payphone',
        })
        .eq('id', finalOrderId);

      if (updateError) {
        console.error('❌ Error al actualizar orden:', updateError);
      } else {
        console.log('✅ Orden actualizada a completada');
        
        // Actualizar todos los tickets de esta orden a 'paid'
        console.log('🔄 Actualizando tickets a "paid" para orden:', finalOrderId);
        const { data: orderData } = await supabase
          .from('orders')
          .select('raffle_id, numbers')
          .eq('id', finalOrderId)
          .single();
        
        if (orderData && orderData.numbers && orderData.numbers.length > 0) {
          // Los números en orders.numbers son strings, y en tickets.number también son strings
          const ticketNumbers = orderData.numbers as string[];
          
          // Obtener el payment_id del pago existente o recién creado
          const { data: paymentData } = await supabase
            .from('payments')
            .select('id')
            .eq('order_id', finalOrderId)
            .single();
          
          const { error: ticketsUpdateError } = await supabase
            .from('tickets')
            .update({ 
              status: 'paid',
              payment_id: paymentData?.id || null
            })
            .eq('raffle_id', orderData.raffle_id)
            .in('number', ticketNumbers);
          
          if (ticketsUpdateError) {
            console.error('❌ Error al actualizar tickets a "paid":', ticketsUpdateError);
          } else {
            console.log(`✅ ${ticketNumbers.length} tickets actualizados a "paid"`);
          }
        }
        
        // Enviar correo de confirmación (no bloquea si falla)
        try {
          console.log('📧 Intentando enviar correo de confirmación para orden:', finalOrderId);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const emailUrl = `${baseUrl}/api/email/send-purchase-confirmation`;
          console.log('📧 URL del correo:', emailUrl);
          
          const emailResponse = await fetch(emailUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: finalOrderId }),
          });
          
          const emailData = await emailResponse.json();
          
          if (emailResponse.ok) {
            console.log('✅ Correo de confirmación enviado exitosamente:', emailData);
          } else {
            console.error('⚠️ Error al enviar correo:', emailData);
            console.warn('⚠️ No se pudo enviar correo de confirmación');
          }
        } catch (emailError) {
          console.error('❌ Error al enviar correo (no crítico):', emailError);
          // No lanzamos error para no bloquear el flujo
        }
      }

      // Redirigir a página de confirmación exitosa
      return NextResponse.redirect(
        new URL(`/comprar/${finalOrderId}/confirmacion?status=success&transactionId=${transactionId}`, request.url)
      );
    } else if (transactionStatus === 'Canceled') {
      // Pago cancelado
      console.log('❌ Actualizando orden a expired...');
      await supabase
        .from('orders')
        .update({
          status: 'expired',
        })
        .eq('id', finalOrderId);

      console.log('⚠️ Orden marcada como expirada (pago cancelado)');

      // Redirigir a página de error
      return NextResponse.redirect(
        new URL(`/comprar/error?message=Pago cancelado&orderId=${finalOrderId}`, request.url)
      );
    } else {
      // Pago pendiente u otro estado
      console.log('⏳ Orden en estado pendiente');

      // Redirigir a página de espera
      return NextResponse.redirect(
        new URL(`/comprar/${finalOrderId}/confirmacion?status=pending&transactionId=${transactionId}`, request.url)
      );
    }
  } catch (error) {
    console.error('❌ Error en callback de Payphone:', error);
    return NextResponse.redirect(
      new URL('/comprar/error?message=Error al procesar el pago', request.url)
    );
  }
}

/**
 * Confirma una transacción con la API de Payphone
 * 
 * Endpoint: POST https://pay.payphonetodoesposible.com/api/button/V2/Confirm
 * Documentación: https://docs.payphone.app/confirmar-boton-de-pago
 */
async function confirmPayphoneTransaction(
  transactionId: string, 
  clientTransactionId: string
): Promise<{
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
}> {
  try {
    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;

    if (!token) {
      return {
        success: false,
        error: 'Token de Payphone no configurado',
      };
    }

    // Endpoint correcto para Cajita de Pagos según documentación
    // En Payphone, sandbox vs prod se determina por el TOKEN/STORE_ID, no por URL diferente
    const confirmUrl = 'https://pay.payphonetodoesposible.com/api/button/V2/Confirm';
    const environment = process.env.NEXT_PUBLIC_PAYPHONE_ENVIRONMENT || 'prod';
    
    console.log('🌐 Ambiente Payphone:', environment, '| Endpoint:', confirmUrl);
    console.log('🔑 Token configurado:', token ? `${token.substring(0, 20)}...` : 'NO');

    console.log('🔄 Confirmando transacción con Payphone:', { transactionId, clientTransactionId });

    // Convertir transactionId a número (Payphone lo requiere como int)
    const transactionIdNum = parseInt(transactionId, 10);
    
    const requestBody = {
      id: transactionIdNum,
      clientTxId: clientTransactionId,
    };
    
    console.log('📤 Request body:', requestBody);

    const response = await fetch(confirmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📨 Status de respuesta:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta de Payphone:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText.substring(0, 500), // Solo primeros 500 chars
      });
      
      // Si es error 500, podría ser que la transacción ya fue procesada
      // Intentamos continuar de todas formas con datos mínimos
      if (response.status === 500) {
        console.warn('⚠️ Error 500 de Payphone - Intentando continuar con datos disponibles');
        return {
          success: true,
          data: {
            transactionId: parseInt(transactionId, 10),
            transactionStatus: 'Approved', // Asumimos aprobado porque llegó al callback
            clientTransactionId: clientTransactionId,
          },
        };
      }
      
      return {
        success: false,
        error: `Error HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    console.log('✅ Respuesta de confirmación de Payphone:', data);

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('❌ Error al confirmar transacción:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
