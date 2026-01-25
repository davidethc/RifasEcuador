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
 * API Route para confirmar transacciones de Payphone
 * 
 * Este endpoint se llama después de que el usuario complete el pago
 * y sea redirigido con los parámetros id y clientTransactionId en la URL.
 * 
 * Realiza una solicitud POST al endpoint de confirmación de Payphone:
 * POST https://pay.payphonetodoesposible.com/api/button/V2/Confirm
 * 
 * Cuerpo de la solicitud:
 * {
 *   "id": 0,                    // Transaction ID de Payphone (número entero)
 *   "clientTxId": "string"      // Identificador único generado por tu plataforma
 * }
 * 
 * Respuesta incluye:
 * - statusCode: 2 = Cancelado, 3 = Aprobada
 * - transactionStatus: "Approved" o "Canceled"
 * - transactionId, authorizationCode, amount, etc.
 * 
 * ⚠️ IMPORTANTE: Debe ejecutarse dentro de los primeros 5 minutos
 * o Payphone reversará automáticamente la transacción para proteger
 * tanto al comercio como al cliente.
 * 
 * Documentación oficial: https://www.docs.payphone.app/boton-de-pago-por-redireccion#sect4
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, clientTxId } = body;

    logger.debug('📥 Confirmando transacción:', { id, clientTxId });

    // Validar parámetros
    if (!id || !clientTxId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetros faltantes: id y clientTxId son requeridos',
        },
        { status: 400 }
      );
    }

    // Validar token
    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;

    if (!token) {
      logger.error('❌ Token de Payphone no configurado');
      return NextResponse.json(
        {
          success: false,
          error: 'Configuración de Payphone incompleta',
        },
        { status: 500 }
      );
    }

    // Llamar al endpoint de confirmación de Payphone
    const confirmUrl = 'https://pay.payphonetodoesposible.com/api/button/V2/Confirm';

    logger.debug('🔄 Enviando confirmación a Payphone (usando axios)...');

    try {
      const response = await axios.post(confirmUrl, {
        id: parseInt(id),
        clientTxId: clientTxId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000, // 30 segundos
      });

      logger.debug('📤 Respuesta de Payphone:', JSON.stringify(response.data, null, 2));

      const transaction = response.data;

      logger.debug('✅ Transacción confirmada:', {
        transactionId: transaction.transactionId,
        status: transaction.transactionStatus,
        statusCode: transaction.statusCode,
        authorizationCode: transaction.authorizationCode,
        amount: transaction.amount,
        cardType: transaction.cardType,
        cardBrand: transaction.cardBrand,
      });

    // Extraer orderId del clientTransactionId
    // Formato nuevo: ord-{primeros8chars}-{timestamp}
    // Formato antiguo: order-{orderId}-{timestamp}
    let orderId: string | null = null;
    const supabase = getSupabaseAdmin();

    // Intentar formato nuevo primero
    const newFormatMatch = clientTxId.match(/^ord-([a-f0-9]{8})-/);
    if (newFormatMatch) {
      // Solo tenemos los primeros 8 caracteres, necesitamos buscar la orden completa
      const orderPrefix = newFormatMatch[1];
      logger.debug('🔍 Buscando orden con prefijo:', orderPrefix);

      // Buscar en la base de datos por el prefijo del ID
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .ilike('id', `${orderPrefix}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (orders && orders.length > 0) {
        orderId = orders[0].id;
        logger.debug('✅ Orden encontrada:', orderId);
      }
    } else {
      // Intentar formato antiguo
      const oldFormatMatch = clientTxId.match(/order-([a-f0-9-]+)-/);
      if (oldFormatMatch) {
        orderId = oldFormatMatch[1];
      }
    }

    if (!orderId) {
      logger.error('❌ No se pudo extraer orderId de:', clientTxId);
      return NextResponse.json({
        success: true,
        transaction,
        orderId: null,
        warning: 'No se pudo actualizar la orden en la base de datos',
      });
    }

    logger.debug('✅ OrderId completo recuperado:', orderId);

    // ⚠️ VALIDACIÓN CRÍTICA: Verificar que el monto de Payphone coincida con el de la orden
    const { data: orderData, error: orderDataError } = await supabase
      .from('orders')
      .select('total, status')
      .eq('id', orderId)
      .single();

    if (orderDataError || !orderData) {
      logger.error('❌ Error al obtener orden para validar monto:', orderDataError);
      return NextResponse.json({
        success: false,
        error: 'Error al validar la orden',
        orderId,
      }, { status: 400 });
    }

    // Convertir monto de Payphone (centavos) a dólares y comparar
    const transactionAmount = transaction.amount || 0;
    const payphoneAmountInDollars = transactionAmount / 100;
    const orderTotal = orderData.total;
    const amountDifference = Math.abs(payphoneAmountInDollars - orderTotal);
    const tolerance = 0.01; // Tolerancia de 1 centavo por redondeos

    if (amountDifference > tolerance) {
      logger.error('❌ ERROR CRÍTICO: Monto de Payphone no coincide con orden:', {
        payphoneAmount: payphoneAmountInDollars,
        orderTotal: orderTotal,
        difference: amountDifference,
        transactionId: transaction.transactionId,
        orderId,
      });
      return NextResponse.json({
        success: false,
        error: 'Error de validación: Los montos no coinciden',
        orderId,
      }, { status: 400 });
    }

    logger.debug('✅ Validación de monto exitosa:', {
      payphoneAmount: payphoneAmountInDollars,
      orderTotal: orderTotal,
    });

    // Actualizar la orden en la base de datos según el estado
    // Strict check: statusCode 3 AND transactionStatus 'Approved' (case insensitive)
    const status = transaction.transactionStatus ? transaction.transactionStatus.toString().toLowerCase() : '';
    const isApproved = transaction.statusCode === 3 && status === 'approved';

    if (isApproved) {
      logger.debug('✅ Pago aprobado, actualizando orden...');

      // ⚠️ VALIDACIÓN CRÍTICA: Verificar si este transactionId ya fue procesado (prevenir duplicados)
      const { data: existingPaymentByTransaction, error: checkError } = await supabase
        .from('payments')
        .select('id, order_id, status')
        .eq('provider_reference', transaction.transactionId.toString())
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
            // Ya está procesado, retornar éxito sin hacer nada más
            return NextResponse.json({
              success: true,
              transaction,
              orderId,
              message: 'Orden ya procesada anteriormente',
            });
          }
          // Mismo orden pero diferente estado - actualizar
          logger.debug('⚠️ Pago ya existe para esta orden con estado diferente, actualizando...');
        } else {
          // Diferente orden - ERROR: transactionId duplicado
          logger.error('❌ ERROR CRÍTICO: transactionId ya procesado para otra orden:', {
            transactionId: transaction.transactionId,
            existingOrderId: existingPaymentByTransaction.order_id,
            currentOrderId: orderId,
          });
          // Retornar error pero no bloquear
          return NextResponse.json({
            success: false,
            error: 'TransactionId duplicado detectado',
            orderId,
          }, { status: 409 }); // 409 Conflict
        }
      }

      // Crear o actualizar registro de pago
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      const paymentData = {
        order_id: orderId,
        provider: 'payphone',
        provider_reference: transaction.transactionId.toString(),
        amount: transaction.amount / 100, // Convertir centavos a dólares
        status: 'approved',
        payphone_response: transaction, // ✅ GUARDAR RESPUESTA COMPLETA de PayPhone
        created_at: new Date().toISOString(),
      };

      if (existingPayment) {
        await supabase
          .from('payments')
          .update({
            provider_reference: transaction.transactionId.toString(),
            status: 'approved',
            amount: transaction.amount / 100, // Update amount too
            payphone_response: transaction, // ✅ GUARDAR RESPUESTA COMPLETA
          })
          .eq('id', existingPayment.id);
      } else {
        await supabase.from('payments').insert(paymentData);
      }

      // ⚠️ VERIFICACIÓN ADICIONAL: Verificar que la orden no esté ya completada (idempotencia)
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (currentOrder?.status === 'completed') {
        logger.debug('⚠️ Orden ya está completada, saltando actualización (idempotencia)');
        return NextResponse.json({
          success: true,
          transaction,
          orderId,
          message: 'Orden ya procesada anteriormente',
        });
      }

      // Actualizar la orden a completada
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
          // Los números en orders.numbers son strings, y en tickets.number también son strings
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
          logger.debug('📧 URL del correo:', emailUrl);

          const emailResponse = await axios.post(emailUrl, 
            { orderId },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000, // 10 segundos
            }
          );

          logger.debug('✅ Correo de confirmación enviado exitosamente:', emailResponse.data);
        } catch (emailError) {
          logger.error('❌ Error al enviar correo (no crítico):', emailError instanceof AxiosError ? emailError.message : emailError);
          // No lanzamos error para no bloquear el flujo
        }
      }

    } else if (transaction.statusCode === 2 || (transaction.statusCode === 3 && !isApproved)) {
      // statusCode 2 = Canceled OR statusCode 3 but NOT Approved (e.g. Rejected)
      logger.debug('⚠️ Pago cancelado o rechazado:', transaction.transactionStatus);

      const supabase = getSupabaseAdmin();
      await supabase
        .from('orders')
        .update({
          status: 'expired', // Mark as expired/canceled
        })
        .eq('id', orderId);

    } else {
      // statusCode 1 = Pending or unknown
      logger.debug('⏳ Pago pendiente');
    }

    return NextResponse.json({
      success: true,
      transaction,
      orderId, // Retornar el orderId completo para usar en el callback
    });

    } catch (axiosError) {
      const error = axiosError as AxiosError;
      logger.error('❌ Error de axios al confirmar con PayPhone:', error.message);
      
      if (error.response) {
        logger.error('❌ Respuesta de error:', error.response.status, error.response.data);
        return NextResponse.json(
          {
            success: false,
            error: `Error HTTP ${error.response.status} de PayPhone`,
            details: error.response.data,
          },
          { status: error.response.status }
        );
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return NextResponse.json(
          {
            success: false,
            error: 'Timeout al conectar con PayPhone',
          },
          { status: 504 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Error de red al conectar con PayPhone',
          },
          { status: 503 }
        );
      }
    }
  } catch (error) {
          logger.error('❌ Error general al confirmar transacción:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
