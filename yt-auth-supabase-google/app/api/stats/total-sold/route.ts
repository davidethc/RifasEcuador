import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
 * API Route para obtener el total de boletos vendidos
 * Usa service role para bypass de RLS
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Obtener todos los sorteos activos
    const { data: raffles, error: rafflesError } = await supabase
      .from('raffles')
      .select('id')
      .eq('status', 'active');

    if (rafflesError) {
      logger.error('Error al obtener sorteos:', rafflesError);
      return NextResponse.json(
        { success: false, error: 'Error al obtener sorteos', totalSold: 0 },
        { status: 500 }
      );
    }

    if (!raffles || raffles.length === 0) {
      return NextResponse.json({
        success: true,
        totalSold: 0,
        rafflesCount: 0
      });
    }

    const raffleIds = raffles.map(r => r.id);
    let totalCount = 0;

    // Para cada sorteo, contar boletos vendidos
    for (const raffleId of raffleIds) {
      // Obtener órdenes completadas con pagos aprobados usando una consulta más eficiente
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          numbers,
          payments!inner (
            id,
            status
          )
        `)
        .eq('raffle_id', raffleId)
        .eq('status', 'completed')
        .eq('payments.status', 'approved')
        .not('numbers', 'is', null);

      if (!ordersError && ordersData && ordersData.length > 0) {
        ordersData.forEach((order: { id: string; numbers: string[] | null }) => {
          if (order.numbers && Array.isArray(order.numbers)) {
            totalCount += order.numbers.length;
          }
        });
      } else {
        // Fallback: método anterior si la consulta con join falla
        const { data: completedOrders } = await supabase
          .from('orders')
          .select('id, numbers')
          .eq('raffle_id', raffleId)
          .eq('status', 'completed')
          .not('numbers', 'is', null);

        if (completedOrders && completedOrders.length > 0) {
          const orderIds = completedOrders.map(o => o.id).filter(Boolean);
          
          const { data: approvedPayments } = await supabase
            .from('payments')
            .select('order_id')
            .in('order_id', orderIds)
            .eq('status', 'approved');

          if (approvedPayments && approvedPayments.length > 0) {
            const approvedOrderIds = new Set(approvedPayments.map(p => p.order_id));
            
            completedOrders.forEach(order => {
              if (approvedOrderIds.has(order.id) && order.numbers && Array.isArray(order.numbers)) {
                totalCount += order.numbers.length;
              }
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalSold: totalCount,
      rafflesCount: raffles.length
    });

  } catch (error) {
    logger.error('Error al calcular total de boletos vendidos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        totalSold: 0
      },
      { status: 500 }
    );
  }
}

