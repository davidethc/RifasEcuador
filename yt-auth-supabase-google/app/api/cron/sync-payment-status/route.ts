import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios, { AxiosError } from 'axios';

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
 * Cron Job para verificar estado de pagos y detectar reversos
 * 
 * Este endpoint debe ejecutarse periódicamente (cada 1 hora recomendado)
 * para verificar que los pagos aprobados sigan siendo válidos.
 * 
 * Si detecta un reverso:
 * - Actualiza order.status a 'expired'
 * - Actualiza tickets.status a 'reserved'
 * - Actualiza payment.status a 'reversed'
 * 
 * Configuración en Vercel:
 * - Cron: 0 * * * * (cada hora)
 * - O usar Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar que sea una llamada autorizada (desde Vercel Cron o con secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Iniciando verificación de estado de pagos...');

    const supabase = getSupabaseAdmin();
    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;

    if (!token) {
      console.error('❌ Token de Payphone no configurado');
      return NextResponse.json(
        { error: 'Token de Payphone no configurado' },
        { status: 500 }
      );
    }

    // Obtener pagos aprobados de las últimas 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: approvedPayments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id,
        order_id,
        provider_reference,
        status,
        payphone_response,
        created_at,
        orders:order_id (
          id,
          status,
          raffle_id,
          numbers
        )
      `)
      .eq('status', 'approved')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100); // Limitar a 100 para no sobrecargar

    if (paymentsError) {
      console.error('❌ Error al obtener pagos:', paymentsError);
      return NextResponse.json(
        { error: 'Error al obtener pagos', details: paymentsError },
        { status: 500 }
      );
    }

    if (!approvedPayments || approvedPayments.length === 0) {
      console.log('✅ No hay pagos aprobados recientes para verificar');
      return NextResponse.json({
        success: true,
        message: 'No hay pagos para verificar',
        checked: 0,
        reversed: 0,
      });
    }

    console.log(`🔍 Verificando ${approvedPayments.length} pagos aprobados...`);

    let checked = 0;
    let reversed = 0;
    const reversedPayments: Array<{ paymentId: string; orderId: string; reason: string }> = [];

    // Verificar cada pago con Payphone
    for (const payment of approvedPayments) {
      const transactionId = payment.provider_reference;
      if (!transactionId) {
        console.warn('⚠️ Pago sin provider_reference, saltando:', payment.id);
        continue;
      }

      try {
        checked++;
        console.log(`🔍 Verificando pago ${checked}/${approvedPayments.length}: ${transactionId}`);

        // Consultar estado actual en Payphone
        const apiUrl = `https://pay.payphonetodoesposible.com/api/Sale/${transactionId}`;
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept-language': 'es',
          },
          timeout: 30000, // 30 segundos
        });

        const transaction = response.data;
        const statusCode = transaction?.statusCode;
        const transactionStatus = transaction?.transactionStatus?.toLowerCase() || '';

        // Verificar si sigue siendo aprobado
        const isStillApproved = statusCode === 3 && transactionStatus === 'approved';

        if (!isStillApproved) {
          // ⚠️ REVERSO DETECTADO
          console.error('❌ REVERSO DETECTADO:', {
            paymentId: payment.id,
            orderId: payment.order_id,
            transactionId,
            statusCode,
            transactionStatus,
          });

          reversed++;
          reversedPayments.push({
            paymentId: payment.id,
            orderId: payment.order_id as string,
            reason: `Status: ${transactionStatus}, Code: ${statusCode}`,
          });

          // Actualizar pago a reversed
          await supabase
            .from('payments')
            .update({
              status: 'reversed',
              payphone_response: transaction, // Guardar respuesta actualizada
            })
            .eq('id', payment.id);

          // Actualizar orden a expired
          await supabase
            .from('orders')
            .update({
              status: 'expired',
            })
            .eq('id', payment.order_id);

          // Revertir tickets a reserved
          const order = payment.orders as any;
          if (order && order.numbers && Array.isArray(order.numbers)) {
            const ticketNumbers = order.numbers as string[];
            await supabase
              .from('tickets')
              .update({
                status: 'reserved',
                payment_id: null,
              })
              .eq('raffle_id', order.raffle_id)
              .in('number', ticketNumbers);

            console.log(`✅ ${ticketNumbers.length} tickets revertidos a 'reserved'`);
          }

          console.log(`✅ Reverso procesado para orden ${payment.order_id}`);
        } else {
          console.log(`✅ Pago ${transactionId} sigue siendo aprobado`);
        }

        // Pequeña pausa para no sobrecargar Payphone API
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms entre requests

      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          // Transacción no encontrada - posible reverso
          console.error('❌ Transacción no encontrada en Payphone (posible reverso):', transactionId);
          
          reversed++;
          reversedPayments.push({
            paymentId: payment.id,
            orderId: payment.order_id as string,
            reason: 'Transaction not found in Payphone',
          });

          // Marcar como reversed
          await supabase
            .from('payments')
            .update({
              status: 'reversed',
            })
            .eq('id', payment.id);

          await supabase
            .from('orders')
            .update({
              status: 'expired',
            })
            .eq('id', payment.order_id);
        } else {
          console.error(`❌ Error al verificar pago ${transactionId}:`, error);
          // Continuar con el siguiente pago
        }
      }
    }

    console.log('✅ Verificación completada:', {
      checked,
      reversed,
      reversedPayments: reversedPayments.length,
    });

    return NextResponse.json({
      success: true,
      checked,
      reversed,
      reversedPayments,
      message: `Verificados ${checked} pagos, ${reversed} reversos detectados`,
    });

  } catch (error) {
    console.error('❌ Error en cron de verificación de pagos:', error);
    return NextResponse.json(
      {
        error: 'Error interno',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
