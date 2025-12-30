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
 * API Route para obtener el conteo de boletos vendidos por sorteo
 * Usa service role para bypass de RLS
 * Query params: raffleIds (comma-separated)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const raffleIdsParam = searchParams.get('raffleIds');
    
    if (!raffleIdsParam) {
      return NextResponse.json(
        { success: false, error: 'raffleIds parameter is required', counts: {} },
        { status: 400 }
      );
    }

    const raffleIds = raffleIdsParam.split(',').filter(Boolean);
    const counts: Record<string, number> = {};

    // Para cada sorteo, contar boletos vendidos
    for (const raffleId of raffleIds) {
      let totalCount = 0;

      // Intentar consulta con join primero
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
        // Fallback: método anterior
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

      counts[raffleId] = totalCount;
    }

    return NextResponse.json({
      success: true,
      counts
    });

  } catch (error) {
    console.error('Error al calcular boletos vendidos por sorteo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        counts: {}
      },
      { status: 500 }
    );
  }
}

