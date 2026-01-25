import { NextRequest, NextResponse } from 'next/server';
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
    const totals: Record<string, number> = {};
    const percentages: Record<string, number> = {};

    // Preferir vista agregada (evita N+1 y usa el total real de tickets por sorteo)
    const { data: progressRows, error: progressError } = await supabase
      .from('raffle_sales_progress')
      .select('raffle_id,total_tickets,sold_tickets,sold_percentage')
      .in('raffle_id', raffleIds);

    if (!progressError && progressRows) {
      progressRows.forEach((row: { raffle_id: string; total_tickets: number; sold_tickets: number; sold_percentage: number | string }) => {
        counts[row.raffle_id] = row.sold_tickets || 0;
        totals[row.raffle_id] = row.total_tickets || 0;
        percentages[row.raffle_id] = typeof row.sold_percentage === 'string'
          ? Number(row.sold_percentage)
          : (row.sold_percentage || 0);
      });

      // Asegurar claves para sorteos solicitados aunque no existan filas (por ejemplo, sin tickets)
      raffleIds.forEach((raffleId) => {
        if (counts[raffleId] === undefined) counts[raffleId] = 0;
        if (totals[raffleId] === undefined) totals[raffleId] = 0;
        if (percentages[raffleId] === undefined) percentages[raffleId] = 0;
      });

      return NextResponse.json({
        success: true,
        counts,
        totals,
        percentages,
      });
    }

    // Fallback ultra-seguro: método anterior (por si la vista no existe)
    for (const raffleId of raffleIds) {
      let totalCount = 0;

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
        .eq('payments.status', 'approved')
        .not('numbers', 'is', null);

      if (!ordersError && ordersData && ordersData.length > 0) {
        ordersData.forEach((order: { id: string; numbers: string[] | null }) => {
          if (order.numbers && Array.isArray(order.numbers)) {
            totalCount += order.numbers.length;
          }
        });
      }

      counts[raffleId] = totalCount;
    }

    return NextResponse.json({ success: true, counts, totals: {}, percentages: {} });

  } catch (error) {
    logger.error('Error al calcular boletos vendidos por sorteo:', error);
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

