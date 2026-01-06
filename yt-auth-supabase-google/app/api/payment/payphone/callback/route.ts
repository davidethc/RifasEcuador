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
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries()),
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
    const statusCode = transaction?.statusCode;

    // ⚠️ VALIDACIÓN CRÍTICA: Verificar statusCode === 3 Y transactionStatus === 'Approved'
    // statusCode 2 = Cancelado, 3 = Aprobada (pero también puede ser Rejected)
    // Solo consideramos aprobado si statusCode === 3 Y transactionStatus === 'Approved'
    const status = transactionStatus.toString().toLowerCase();
    const isApproved = statusCode === 3 && status === 'approved';

    console.log('✅ Transacción confirmada con Payphone:', {
      transactionId,
      status: transactionStatus,
      statusCode: statusCode,
      isApproved: isApproved, // Nuevo campo para debugging
      amount: transaction?.amount,
      clientTransactionId: transaction?.clientTransactionId,
      optionalParameter: transaction?.optionalParameter,
      optionalParameter3: transaction?.optionalParameter3,
      optionalParameter4: transaction?.optionalParameter4,
      timestamp: new Date().toISOString(),
    });

    // Ahora procesar la actualización de base de datos (después de confirmar con Payphone)
    const supabase = getSupabaseAdmin();

    // Extraer orderId del clientTransactionId
    // Formatos posibles:
    // 1. order-{orderId}-{timestamp} (del API route)
    // 2. ord-{orderShort}-{timestamp} (del frontend, solo primeros 8 chars del UUID)
    let orderId: string | null = null;
    
    // Intentar extraer del clientTransactionId recibido en la URL
    // Formato 1: order-{uuid completo}-{timestamp}
    const orderMatch1 = clientTransactionId.match(/^order-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})-/);
    if (orderMatch1) {
      orderId = orderMatch1[1];
      console.log('✅ OrderId extraído del formato completo (order-{uuid}-):', orderId);
    } else {
      // Formato 2: ord-{primeros 8 chars}-{timestamp}
      const orderMatch2 = clientTransactionId.match(/^ord-([a-f0-9]{8})-/);
      if (orderMatch2) {
        const orderPrefix = orderMatch2[1];
        console.log('🔍 Buscando orden con prefijo (ord-{8chars}-):', orderPrefix);
        
        // Buscar en las últimas 100 órdenes por el prefijo
        const { data: orders, error: searchError } = await supabase
          .from('orders')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (!searchError && orders) {
          const matchingOrder = orders.find(order => 
            order.id.toLowerCase().startsWith(orderPrefix.toLowerCase())
          );
          
          if (matchingOrder) {
            orderId = matchingOrder.id;
            console.log('✅ Orden encontrada por prefijo:', orderId);
          }
        }
      }
    }

    // Si aún no tenemos orderId, intentar usar el clientTransactionId de la respuesta de Payphone
    if (!orderId && transaction?.clientTransactionId) {
      console.log('🔍 Intentando extraer orderId del clientTransactionId de la respuesta:', transaction.clientTransactionId);
      const responseOrderMatch1 = transaction.clientTransactionId.match(/^order-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})-/);
      if (responseOrderMatch1) {
        orderId = responseOrderMatch1[1];
        console.log('✅ OrderId extraído del clientTransactionId de la respuesta:', orderId);
      } else {
        const responseOrderMatch2 = transaction.clientTransactionId.match(/^ord-([a-f0-9]{8})-/);
        if (responseOrderMatch2) {
          const orderPrefix = responseOrderMatch2[1];
          const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(100);
          
          if (orders) {
            const matchingOrder = orders.find(order => 
              order.id.toLowerCase().startsWith(orderPrefix.toLowerCase())
            );
            if (matchingOrder) {
              orderId = matchingOrder.id;
              console.log('✅ Orden encontrada por prefijo en respuesta:', orderId);
            }
          }
        }
      }
    }

    // Último recurso: usar optionalParameter3 o optionalParameter si está disponible
    // Payphone puede devolverlo en optionalParameter3 o en optionalParameter dependiendo de la versión
    if (!orderId) {
      if (transaction?.optionalParameter3) {
        orderId = transaction.optionalParameter3;
        console.log('✅ OrderId obtenido de optionalParameter3:', orderId);
      } else if (transaction?.optionalParameter) {
        orderId = transaction.optionalParameter;
        console.log('✅ OrderId obtenido de optionalParameter:', orderId);
      }
    }

    if (!orderId) {
      console.error('❌ No se pudo extraer orderId de ninguna fuente:', {
        clientTransactionId,
        responseClientTransactionId: transaction?.clientTransactionId,
        optionalParameter3: transaction?.optionalParameter3,
        transactionId,
      });
      // Aún así redirigimos, pero registramos el error
      return NextResponse.redirect(
        new URL('/comprar/error?message=ID de orden inválido', request.url)
      );
    }

    console.log('✅ Order ID recuperado:', orderId);
    const finalOrderId = orderId;

    // Actualizar base de datos (esto puede tomar más tiempo, pero ya confirmamos con Payphone)
    // Procesar de forma asíncrona para no bloquear la respuesta
    processPaymentUpdate(supabase, finalOrderId, transactionId, transactionStatus, transaction).catch(err => {
      console.error('❌ Error en actualización asíncrona de pago:', err);
      // No bloqueamos el flujo, solo registramos el error
    });

    // Redirigir INMEDIATAMENTE según el estado (sin esperar actualizaciones de BD)
    // Las actualizaciones de BD se hacen de forma asíncrona
    // ⚠️ VALIDACIÓN CRÍTICA: Solo considerar aprobado si statusCode === 3 Y transactionStatus === 'Approved'
    if (isApproved) {
      // Pago aprobado: redirigir inmediatamente
      console.log('✅ Pago aprobado - Redirigiendo inmediatamente');
      return NextResponse.redirect(
        new URL(`/comprar/${finalOrderId}/confirmacion?status=success&transactionId=${transactionId}`, request.url)
      );
    } else if (statusCode === 2 || transactionStatus === 'Canceled') {
      // Pago cancelado (statusCode 2 = Cancelado)
      console.log('❌ Pago cancelado - Redirigiendo');
      return NextResponse.redirect(
        new URL(`/comprar/error?message=Pago cancelado o rechazado&orderId=${finalOrderId}`, request.url)
      );
    } else {
      // Pago pendiente, rechazado u otro estado (NO aprobado)
      console.log('⏳ Pago pendiente/rechazado - Redirigiendo a página de espera');
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
      
      // ⚠️ CRÍTICO: NUNCA asumir que un pago está aprobado si hay error
      // Un error 500 podría indicar problemas del servidor o transacciones rechazadas
      // Es más seguro rechazar que aprobar incorrectamente
      console.error('❌ Error HTTP de Payphone - NO podemos asumir el estado del pago');
      return {
        success: false,
        error: `Error HTTP ${response.status}: No se pudo confirmar el estado de la transacción`,
      };
      
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
    // ⚠️ VALIDACIÓN CRÍTICA: Solo marcar como aprobado si statusCode === 3 Y transactionStatus === 'Approved'
    const status = transactionStatus.toString().toLowerCase();
    const isApproved = transaction?.statusCode === 3 && status === 'approved';
    
    if (isApproved) {
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
    } else if (transaction?.statusCode === 2 || transactionStatus === 'Canceled') {
      // Pago cancelado o rechazado (statusCode 2 = Cancelado)
      console.log('❌ Actualizando orden a expired (pago cancelado/rechazado)...');
      await supabase
        .from('orders')
        .update({
          status: 'expired',
        })
        .eq('id', orderId);
      console.log('⚠️ Orden marcada como expirada (pago cancelado/rechazado)');
    } else {
      // Pago pendiente o rechazado (pero no cancelado explícitamente)
      // Mantener estado 'reserved' para que el usuario pueda ver el estado pendiente
      console.log('⏳ Orden permanece en estado reserved (pago pendiente/rechazado)');
    }

    console.log('✅ Actualización de base de datos completada para orden:', orderId);
  } catch (error) {
    console.error('❌ Error en processPaymentUpdate:', error);
    // No lanzamos el error para no afectar el flujo principal
  }
}
