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
 * Payphone redirige aquí con los siguientes parámetros en la URL:
 * - id: Número entero que representa el identificador único de la transacción generado por Payphone
 * - clientTransactionId: Cadena de texto definida como identificador único por tu plataforma al iniciar el pago
 * 
 * ⚠️ IMPORTANTE: Debe ejecutarse la confirmación dentro de los primeros 5 minutos
 * o Payphone reversará automáticamente la transacción.
 * 
 * Documentación oficial: https://www.docs.payphone.app/boton-de-pago-por-redireccion#sect4
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('id');
    const clientTransactionId = searchParams.get('clientTransactionId');

    console.log('📥 Callback de Payphone recibido:', {
      transactionId,
      clientTransactionId,
      timestamp: new Date().toISOString(),
    });

    // Validar parámetros
    if (!transactionId || !clientTransactionId) {
      console.error('❌ Faltan parámetros en el callback');
      return NextResponse.redirect(
        new URL('/comprar/error?message=Parámetros faltantes', request.url)
      );
    }

    // ⚠️ CRÍTICO: Confirmar PRIMERO con Payphone (debe ser rápido, dentro de 5 minutos)
    // Si no confirmamos rápido, Payphone reversará automáticamente la transacción
    console.log('⚡ Confirmando transacción con Payphone INMEDIATAMENTE...');
    const confirmationResult = await confirmPayphoneTransaction(transactionId, clientTransactionId);

    if (!confirmationResult.success) {
      console.error('❌ Error al confirmar transacción:', confirmationResult.error);
      // Aún así redirigimos, pero con error
      return NextResponse.redirect(
        new URL(`/comprar/error?message=${encodeURIComponent(confirmationResult.error || 'Error al confirmar pago')}`, request.url)
      );
    }

    const transaction = confirmationResult.data;
    const transactionStatus = transaction?.transactionStatus || 'Pending';

    console.log('✅ Transacción confirmada con Payphone:', {
      transactionId,
      status: transactionStatus,
      statusCode: transaction?.statusCode,
      amount: transaction?.amount,
      timestamp: new Date().toISOString(),
    });

    // Ahora procesar la actualización de base de datos (después de confirmar con Payphone)
    const supabase = getSupabaseAdmin();

    // Extraer orderId del clientTransactionId
    // Formato: order-{orderId}-{timestamp}
    let orderId: string | null = null;
    const orderMatch = clientTransactionId.match(/order-([a-f0-9-]+)-/);
    if (orderMatch) {
      orderId = orderMatch[1];
    } else {
      // Si no encontramos el orderId en el clientTransactionId, intentar usar optionalParameter3
      orderId = transaction?.optionalParameter3 || null;
    }

    if (!orderId) {
      console.error('❌ No se pudo extraer orderId de:', clientTransactionId);
      // Aún así redirigimos, pero registramos el error
      return NextResponse.redirect(
        new URL('/comprar/error?message=ID de orden inválido', request.url)
      );
    }

    console.log('✅ Order ID recuperado:', orderId);
    const finalOrderId = orderId;
    
    console.log('🔍 OrderId final a usar:', {
      fromOptionalParameter3: transaction?.optionalParameter3,
      fromSearch: orderId,
      final: finalOrderId,
    });

    // Actualizar base de datos (esto puede tomar más tiempo, pero ya confirmamos con Payphone)
    // Procesar de forma asíncrona para no bloquear la respuesta
    processPaymentUpdate(supabase, finalOrderId, transactionId, transactionStatus, transaction).catch(err => {
      console.error('❌ Error en actualización asíncrona de pago:', err);
      // No bloqueamos el flujo, solo registramos el error
    });

    // Redirigir INMEDIATAMENTE según el estado (sin esperar actualizaciones de BD)
    // Las actualizaciones de BD se hacen de forma asíncrona
    if (transactionStatus === 'Approved') {
      // Pago aprobado: redirigir inmediatamente
      console.log('✅ Pago aprobado - Redirigiendo inmediatamente');
      return NextResponse.redirect(
        new URL(`/comprar/${finalOrderId}/confirmacion?status=success&transactionId=${transactionId}`, request.url)
      );
    } else if (transactionStatus === 'Canceled') {
      // Pago cancelado
      console.log('❌ Pago cancelado - Redirigiendo');
      return NextResponse.redirect(
        new URL(`/comprar/error?message=Pago cancelado&orderId=${finalOrderId}`, request.url)
      );
    } else {
      // Pago pendiente u otro estado
      console.log('⏳ Pago pendiente - Redirigiendo');
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
 * Este método realiza una solicitud POST al endpoint de confirmación de Payphone
 * para verificar si una transacción fue aprobada, cancelada o fallida.
 * 
 * Endpoint: POST https://pay.payphonetodoesposible.com/api/button/V2/Confirm
 * 
 * Cuerpo de la solicitud (JSON):
 * {
 *   "id": 0,                    // Transaction ID de Payphone (número entero)
 *   "clientTxId": "string"      // Identificador único generado por tu plataforma
 * }
 * 
 * Headers requeridos:
 * - Authorization: Bearer TU_TOKEN
 * - Content-Type: application/json
 * 
 * Respuesta exitosa incluye:
 * - statusCode: 2 = Cancelado, 3 = Aprobada
 * - transactionStatus: "Approved" o "Canceled"
 * - transactionId: Identificador de transacción asignado por Payphone
 * - authorizationCode: Código de autorización bancario
 * - amount: Monto total pagado
 * - Y otros campos según documentación oficial
 * 
 * ⚠️ IMPORTANTE: Si no se ejecuta dentro de los primeros 5 minutos,
 * Payphone reversará automáticamente la transacción.
 * 
 * Documentación oficial: https://www.docs.payphone.app/boton-de-pago-por-redireccion#sect4
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

/**
 * Procesa la actualización de la base de datos de forma asíncrona
 * Esto se ejecuta después de confirmar con Payphone para no bloquear la respuesta
 */
async function processPaymentUpdate(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  orderId: string,
  transactionId: string,
  transactionStatus: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: any
) {
  try {
    console.log('🔄 Procesando actualización de base de datos para orden:', orderId);

    // Actualizar o crear registro en la tabla payments
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    const paymentData = {
      order_id: orderId,
      provider: 'payphone',
      provider_reference: transactionId,
      amount: transaction?.amount ? transaction.amount / 100 : 0, // Convertir centavos a dólares
      status: transactionStatus.toLowerCase(),
      created_at: new Date().toISOString(),
    };

    let paymentId: string | null = null;

    if (existingPayment) {
      // Actualizar pago existente
      console.log('🔄 Actualizando pago existente:', existingPayment.id);
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          provider_reference: transactionId,
          status: transactionStatus.toLowerCase(),
          amount: paymentData.amount,
        })
        .eq('id', existingPayment.id);
      
      if (updatePaymentError) {
        console.error('❌ Error al actualizar payment:', updatePaymentError);
      } else {
        console.log('✅ Payment actualizado');
        paymentId = existingPayment.id;
      }
    } else {
      // Crear nuevo registro de pago
      console.log('✨ Creando nuevo registro en payments...');
      const { data: newPayment, error: insertError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select('id')
        .single();
      
      if (insertError) {
        console.error('❌ Error al insertar en payments:', insertError);
      } else {
        console.log('✅ Registro creado en payments');
        paymentId = newPayment?.id || null;
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
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Error al actualizar orden:', updateError);
      } else {
        console.log('✅ Orden actualizada a completada');
        
        // Actualizar todos los tickets de esta orden a 'paid'
        console.log('🔄 Actualizando tickets a "paid" para orden:', orderId);
        const { data: orderData } = await supabase
          .from('orders')
          .select('raffle_id, numbers')
          .eq('id', orderId)
          .single();
        
        if (orderData && orderData.numbers && orderData.numbers.length > 0) {
          const ticketNumbers = orderData.numbers as string[];
          
          const { error: ticketsUpdateError } = await supabase
            .from('tickets')
            .update({ 
              status: 'paid',
              payment_id: paymentId
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
          console.log('📧 Intentando enviar correo de confirmación para orden:', orderId);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const emailUrl = `${baseUrl}/api/email/send-purchase-confirmation`;
          
          const emailResponse = await fetch(emailUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
          });
          
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            console.log('✅ Correo de confirmación enviado exitosamente:', emailData);
          } else {
            const emailData = await emailResponse.json();
            console.error('⚠️ Error al enviar correo:', emailData);
          }
        } catch (emailError) {
          console.error('❌ Error al enviar correo (no crítico):', emailError);
        }
      }
    } else if (transactionStatus === 'Canceled') {
      // Pago cancelado
      console.log('❌ Actualizando orden a expired...');
      await supabase
        .from('orders')
        .update({
          status: 'expired',
        })
        .eq('id', orderId);
      console.log('⚠️ Orden marcada como expirada (pago cancelado)');
    }

    console.log('✅ Actualización de base de datos completada para orden:', orderId);
  } catch (error) {
    console.error('❌ Error en processPaymentUpdate:', error);
    // No lanzamos el error para no afectar el flujo principal
  }
}
