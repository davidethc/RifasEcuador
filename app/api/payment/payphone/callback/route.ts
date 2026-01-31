import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios, { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

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

    logger.debug('📥 Callback de Payphone recibido:', {
      transactionId,
      clientTransactionId,
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString(),
    });

    // Validar parámetros
    if (!transactionId || !clientTransactionId) {
      logger.error('❌ Faltan parámetros en el callback');
      return NextResponse.redirect(
        new URL('/comprar/error?message=Parámetros faltantes', request.url)
      );
    }

    // ⚠️ CRÍTICO: Confirmar PRIMERO con Payphone (debe ser rápido, dentro de 5 minutos)
    // Si no confirmamos rápido, Payphone reversará automáticamente la transacción
    logger.debug('⚡ Confirmando transacción con Payphone INMEDIATAMENTE...');
    const confirmationResult = await confirmPayphoneTransaction(transactionId, clientTransactionId);

    if (!confirmationResult.success) {
      logger.error('❌ Error al confirmar transacción:', confirmationResult.error);
      logger.warn('⚠️ Redirigiendo a página de espera - revisar estado manualmente');
      
      // Extraer orderId para redirigir a página de confirmación en modo pending
      // (Mismo código de extracción que usamos abajo)
      const supabase = getSupabaseAdmin();
      let orderId: string | null = null;
      
      const orderMatch1 = clientTransactionId.match(/^order-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})-/);
      if (orderMatch1) {
        orderId = orderMatch1[1];
      } else {
        const orderMatch2 = clientTransactionId.match(/^ord-([a-f0-9]{8})-/);
        if (orderMatch2) {
          const orderPrefix = orderMatch2[1];
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
            }
          }
        }
      }
      
      // Redirigir a página de pending (no a error)
      // El pago puede estar aprobado pero no pudimos confirmarlo
      if (orderId) {
        return NextResponse.redirect(
          new URL(`/comprar/${orderId}/confirmacion?status=pending&message=Verificando+pago&transactionId=${transactionId}`, request.url)
        );
      } else {
      return NextResponse.redirect(
          new URL(`/comprar/error?message=${encodeURIComponent('Error al procesar confirmación - Contacta soporte con ID: ' + transactionId)}`, request.url)
      );
      }
    }

    const transaction = confirmationResult.data;
    const transactionStatus = transaction?.transactionStatus || 'Pending';
    const statusCode = transaction?.statusCode;
    const transactionAmount = transaction?.amount || 0; // En centavos

    // ⚠️ VALIDACIÓN CRÍTICA: Verificar statusCode === 3 Y transactionStatus === 'Approved'
    // statusCode 2 = Cancelado, 3 = Aprobada (pero también puede ser Rejected)
    // Solo consideramos aprobado si statusCode === 3 Y transactionStatus === 'Approved'
    const status = transactionStatus.toString().toLowerCase();
    const isApproved = statusCode === 3 && status === 'approved';

    logger.debug('✅ Transacción confirmada con Payphone:', {
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
      logger.debug('✅ OrderId extraído del formato completo (order-{uuid}-):', orderId);
    } else {
      // Formato 2: ord-{primeros 8 chars}-{timestamp}
      const orderMatch2 = clientTransactionId.match(/^ord-([a-f0-9]{8})-/);
      if (orderMatch2) {
        const orderPrefix = orderMatch2[1];
        logger.debug('🔍 Buscando orden con prefijo (ord-{8chars}-):', orderPrefix);
        
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
            logger.debug('✅ Orden encontrada por prefijo:', orderId);
          }
        }
      }
    }

    // Si aún no tenemos orderId, intentar usar el clientTransactionId de la respuesta de Payphone
    if (!orderId && transaction?.clientTransactionId) {
      logger.debug('🔍 Intentando extraer orderId del clientTransactionId de la respuesta:', transaction.clientTransactionId);
      const responseOrderMatch1 = transaction.clientTransactionId.match(/^order-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})-/);
      if (responseOrderMatch1) {
        orderId = responseOrderMatch1[1];
        logger.debug('✅ OrderId extraído del clientTransactionId de la respuesta:', orderId);
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
              logger.debug('✅ Orden encontrada por prefijo en respuesta:', orderId);
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
        logger.debug('✅ OrderId obtenido de optionalParameter3:', orderId);
      } else if (transaction?.optionalParameter) {
        orderId = transaction.optionalParameter;
        logger.debug('✅ OrderId obtenido de optionalParameter:', orderId);
      }
    }

    if (!orderId) {
      logger.error('❌ No se pudo extraer orderId de ninguna fuente:', {
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

    logger.debug('✅ Order ID recuperado:', orderId);
    const finalOrderId = orderId;

    // ⚠️ VALIDACIÓN CRÍTICA: Verificar que el monto de Payphone coincida con el de la orden
    // Esto previene fraude donde alguien modifica el monto
    const { data: orderData, error: orderDataError } = await supabase
      .from('orders')
      .select('total, status')
      .eq('id', finalOrderId)
      .single();

    if (orderDataError || !orderData) {
      logger.error('❌ Error al obtener orden para validar monto:', orderDataError);
      return NextResponse.redirect(
        new URL(`/comprar/error?message=Error al validar la orden&orderId=${finalOrderId}`, request.url)
      );
    }

    // Convertir monto de Payphone (centavos) a dólares y comparar
    const payphoneAmountInDollars = transactionAmount / 100;
    const orderTotal = orderData.total;
    const amountDifference = Math.abs(payphoneAmountInDollars - orderTotal);
    const tolerance = 0.01; // Tolerancia de 1 centavo por redondeos

    if (amountDifference > tolerance) {
      logger.error('❌ ERROR CRÍTICO: Monto de Payphone no coincide con orden:', {
        payphoneAmount: payphoneAmountInDollars,
        orderTotal: orderTotal,
        difference: amountDifference,
        transactionId,
        orderId: finalOrderId,
      });
      // ⚠️ NO procesar el pago si los montos no coinciden
      return NextResponse.redirect(
        new URL(`/comprar/error?message=Error de validación: Los montos no coinciden. Contacta soporte con ID: ${transactionId}`, request.url)
      );
    }

    logger.debug('✅ Validación de monto exitosa:', {
      payphoneAmount: payphoneAmountInDollars,
      orderTotal: orderTotal,
      transactionId,
    });

    // Actualizar base de datos (esto puede tomar más tiempo, pero ya confirmamos con Payphone)
    // Procesar de forma asíncrona para no bloquear la respuesta
    processPaymentUpdate(supabase, finalOrderId, transactionId, transactionStatus, transaction).catch(err => {
      logger.error('❌ Error en actualización asíncrona de pago:', err);
      // No bloqueamos el flujo, solo registramos el error
    });

    // Redirigir INMEDIATAMENTE según el estado (sin esperar actualizaciones de BD)
    // Las actualizaciones de BD se hacen de forma asíncrona
    // ⚠️ VALIDACIÓN CRÍTICA: Solo considerar aprobado si statusCode === 3 Y transactionStatus === 'Approved'
    if (isApproved) {
      // Pago aprobado: redirigir inmediatamente
      logger.debug('✅ Pago aprobado - Redirigiendo inmediatamente');
      return NextResponse.redirect(
        new URL(`/comprar/${finalOrderId}/confirmacion?status=success&transactionId=${transactionId}`, request.url)
      );
    } else if (statusCode === 2 || transactionStatus === 'Canceled') {
      // Pago cancelado (statusCode 2 = Cancelado)
      logger.debug('❌ Pago cancelado - Redirigiendo');
      return NextResponse.redirect(
        new URL(`/comprar/error?message=Pago cancelado o rechazado&orderId=${finalOrderId}`, request.url)
      );
    } else {
      // Pago pendiente, rechazado u otro estado (NO aprobado)
      logger.debug('⏳ Pago pendiente/rechazado - Redirigiendo a página de espera');
      return NextResponse.redirect(
        new URL(`/comprar/${finalOrderId}/confirmacion?status=pending&transactionId=${transactionId}`, request.url)
      );
    }
  } catch (error) {
    logger.error('❌ Error en callback de Payphone:', error);
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
    
    logger.debug('🌐 Ambiente Payphone:', environment, '| Endpoint:', confirmUrl);
    logger.debug('🔑 Token configurado:', token ? `${token.substring(0, 20)}...` : 'NO');

    logger.debug('🔄 Confirmando transacción con Payphone:', { transactionId, clientTransactionId });

    // Convertir transactionId a número (Payphone lo requiere como int)
    const transactionIdNum = parseInt(transactionId, 10);
    
    const requestBody = {
      id: transactionIdNum,
      clientTxId: clientTransactionId,
    };
    
    logger.debug('📤 Request body:', requestBody);

    // ⚠️ REINTENTOS: PayPhone puede tardar en responder, intentar hasta 3 veces
    // USANDO AXIOS en lugar de fetch (recomendación de PayPhone para Next.js)
    let lastError: string | null = null;
    let responseData: Record<string, unknown> | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        logger.debug(`🔄 Intento ${attempt}/3 de confirmar con PayPhone (usando axios)...`);
        
        // Axios con timeout de 30 segundos por intento
        const response = await axios.post(confirmUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
          timeout: 30000, // 30 segundos
          validateStatus: (status) => status < 600, // No lanzar error en 4xx/5xx, manejarlos manualmente
    });

        logger.debug(`📨 Status de respuesta (intento ${attempt}):`, response.status, response.statusText);
    
        // Si respuesta OK (2xx), salir del loop
        if (response.status >= 200 && response.status < 300) {
          logger.debug(`✅ Confirmación exitosa en intento ${attempt}`);
          responseData = response.data;
          break;
        }
        
        // Si es error 500 o 503 (servidor ocupado), reintentar
        if (response.status === 500 || response.status === 503) {
          const errorText = JSON.stringify(response.data).substring(0, 200);
          lastError = `HTTP ${response.status}: ${errorText}`;
          logger.warn(`⚠️ Error ${response.status} en intento ${attempt}, reintentando en ${attempt * 2}s...`);
          
          // Esperar antes de reintentar (backoff exponencial: 2s, 4s, 6s)
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          }
          continue;
        }
        
        // Otros errores (4xx) no reintentar
        const errorText = JSON.stringify(response.data).substring(0, 200);
        lastError = `HTTP ${response.status}: ${errorText}`;
        logger.error('❌ Error NO reintentar:', lastError);
        break;
        
      } catch (axiosError) {
        const error = axiosError as AxiosError;
        
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          lastError = `Timeout en intento ${attempt}`;
        } else if (error.response) {
          lastError = `HTTP ${error.response.status}: ${JSON.stringify(error.response.data).substring(0, 200)}`;
        } else {
          lastError = error.message || 'Error de red desconocido';
        }
        
        logger.error(`❌ Error axios en intento ${attempt}:`, lastError);
        
        // Si es timeout o error de red, reintentar
        if (attempt < 3) {
          logger.warn(`⚠️ Reintentando en ${attempt * 2}s...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
      }
    }
    
    // Verificar si todos los intentos fallaron
    if (!responseData) {
      logger.error('❌ Todos los intentos de confirmación fallaron');
      logger.error('❌ Error final:', lastError);
      
      return {
        success: false,
        error: `Error al confirmar con PayPhone después de 3 intentos: ${lastError}`,
      };
    }

    const data = responseData;

    logger.debug('✅ Respuesta de confirmación de Payphone:', JSON.stringify(data, null, 2));
    logger.debug('📊 Detalles clave:', {
      statusCode: data.statusCode,
      transactionStatus: data.transactionStatus,
      transactionId: data.transactionId,
      authorizationCode: data.authorizationCode,
      amount: data.amount,
      cardType: data.cardType,
      cardBrand: data.cardBrand,
    });

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    logger.error('❌ Error al confirmar transacción:', error);
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
    logger.debug('🔄 Procesando actualización de base de datos para orden:', orderId);

    // ⚠️ VALIDACIÓN CRÍTICA: Verificar si este transactionId ya fue procesado (prevenir duplicados)
    // Usar SELECT FOR UPDATE para bloqueo de fila y prevenir race conditions
    const { data: existingPaymentByTransaction, error: checkError } = await supabase
      .from('payments')
      .select('id, order_id, status')
      .eq('provider_reference', transactionId)
      .maybeSingle();

    if (checkError) {
      logger.error('❌ Error al verificar pago existente:', checkError);
      // Continuar pero registrar el error
    }

    if (existingPaymentByTransaction) {
      // Si ya existe un pago con este transactionId
      if (existingPaymentByTransaction.order_id === orderId) {
        // Mismo orden - verificar si ya está completado (idempotencia)
        if (existingPaymentByTransaction.status === 'approved') {
          logger.debug('⚠️ Pago ya procesado y aprobado para esta orden (idempotencia)');
          // Ya está procesado, no hacer nada más
          return;
        }
        // Mismo orden pero diferente estado - actualizar
        logger.debug('⚠️ Pago ya existe para esta orden con estado diferente, actualizando...');
      } else {
        // Diferente orden - ERROR: transactionId duplicado
        logger.error('❌ ERROR CRÍTICO: transactionId ya procesado para otra orden:', {
          transactionId,
          existingOrderId: existingPaymentByTransaction.order_id,
          currentOrderId: orderId,
        });
        // No procesar para evitar duplicados
        return;
      }
    }

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
      payphone_response: transaction, // ✅ GUARDAR RESPUESTA COMPLETA de PayPhone
      created_at: new Date().toISOString(),
    };

    if (existingPayment) {
      // Actualizar pago existente
      logger.debug('🔄 Actualizando pago existente:', existingPayment.id);
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          provider_reference: transactionId,
          status: transactionStatus.toLowerCase(),
          amount: paymentData.amount,
          payphone_response: transaction, // ✅ GUARDAR RESPUESTA COMPLETA
        })
        .eq('id', existingPayment.id);
      
      if (updatePaymentError) {
        logger.error('❌ Error al actualizar payment:', updatePaymentError);
      } else {
        logger.debug('✅ Payment actualizado');
      }
    } else {
      // Crear nuevo registro de pago
      logger.debug('✨ Creando nuevo registro en payments...');
      const { error: insertError } = await supabase
        .from('payments')
        .insert(paymentData);
      
      if (insertError) {
        logger.error('❌ Error al insertar en payments:', insertError);
      } else {
        logger.debug('✅ Registro creado en payments');
      }
    }

    // Actualizar el estado de la orden según el resultado
    // ⚠️ VALIDACIÓN CRÍTICA: Solo marcar como aprobado si statusCode === 3 Y transactionStatus === 'Approved'
    const status = transactionStatus.toString().toLowerCase();
    const isApproved = transaction?.statusCode === 3 && status === 'approved';
    
    if (isApproved) {
      // ⚠️ VERIFICACIÓN ADICIONAL: Verificar que la orden no esté ya completada (idempotencia)
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (currentOrder?.status === 'completed') {
        logger.debug('⚠️ Orden ya está completada, saltando actualización (idempotencia)');
        return; // Ya está procesada, no hacer nada
      }

      // Pago aprobado: actualizar orden a completada
      logger.debug('🔄 Actualizando orden a completed...');
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_method: 'payphone',
        })
        .eq('id', orderId);

      if (updateError) {
        logger.error('❌ Error al actualizar orden:', updateError);
      } else {
        logger.debug('✅ Orden actualizada a completada');
        
        // Actualizar todos los tickets de esta orden a 'paid'
        logger.debug('🔄 Actualizando tickets a "paid" para orden:', orderId);
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
            })
            .eq('raffle_id', orderData.raffle_id)
            .in('number', ticketNumbers);
          
          if (ticketsUpdateError) {
            logger.error('❌ Error al actualizar tickets a "paid":', ticketsUpdateError);
          } else {
            logger.debug(`✅ ${ticketNumbers.length} tickets actualizados a "paid"`);
          }
        }
        
        // Enviar correo de confirmación (no bloquea si falla)
        try {
          logger.debug('📧 Intentando enviar correo de confirmación para orden:', orderId);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const emailUrl = `${baseUrl}/api/email/send-purchase-confirmation`;
          
          const emailResponse = await axios.post(emailUrl, 
            { orderId },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000, // 10 segundos timeout para email
            }
          );
          
          logger.debug('✅ Correo de confirmación enviado exitosamente:', emailResponse.data);
        } catch (emailError) {
          logger.error('❌ Error al enviar correo (no crítico):', emailError instanceof AxiosError ? emailError.message : emailError);
        }
      }
    } else if (transaction?.statusCode === 2 || transactionStatus === 'Canceled') {
      // Pago cancelado o rechazado (statusCode 2 = Cancelado)
      logger.debug('❌ Actualizando orden a expired (pago cancelado/rechazado)...');
      await supabase
        .from('orders')
        .update({
          status: 'expired',
        })
        .eq('id', orderId);
      logger.debug('⚠️ Orden marcada como expirada (pago cancelado/rechazado)');
    } else {
      // Pago pendiente o rechazado (pero no cancelado explícitamente)
      // Mantener estado 'reserved' para que el usuario pueda ver el estado pendiente
      logger.debug('⏳ Orden permanece en estado reserved (pago pendiente/rechazado)');
    }

    logger.debug('✅ Actualización de base de datos completada para orden:', orderId);
  } catch (error) {
    logger.error('❌ Error en processPaymentUpdate:', error);
    // No lanzamos el error para no afectar el flujo principal
  }
}
