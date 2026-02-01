import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { logger } from '@/utils/logger';

/**
 * POST /api/admin/orders/cancel-and-release
 * Anula órdenes de prueba: elimina pagos, libera boletos (available) y marca la orden como cancelada.
 * Así las ventas y la recaudación bajan y los números vuelven a estar disponibles.
 * Body: { orderIds: string[] }
 */
export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as { orderIds?: string[] } | null;
  const raw = body?.orderIds;
  const orderIds = Array.isArray(raw)
    ? (raw as string[]).map((id) => String(id).trim()).filter(Boolean)
    : [];

  if (orderIds.length === 0) {
    return NextResponse.json(
      { success: false, error: 'orderIds (array) requerido con al menos un ID' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const results: { orderId: string; ok: boolean; error?: string }[] = [];

  for (const orderId of orderIds) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, raffle_id, client_id, numbers, status, payment_method')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      results.push({ orderId, ok: false, error: 'Orden no encontrada' });
      continue;
    }

    if (order.status === 'cancelled') {
      results.push({ orderId, ok: true, error: 'Ya estaba cancelada' });
      continue;
    }

    try {
      // 1) Eliminar pagos de esta orden (reduce recaudación)
      await supabase.from('payments').delete().eq('order_id', orderId);

      // 2) Liberar boletos: available, sin reserva, sin client_id
      const numbers = order.numbers as unknown;
      const ticketNumbers = Array.isArray(numbers)
        ? (numbers.filter((n): n is string => typeof n === 'string') as string[])
        : [];

      if (ticketNumbers.length > 0 && order.raffle_id && order.client_id) {
        const { error: tErr } = await supabase
          .from('tickets')
          .update({ status: 'available', reserved_until: null, client_id: null })
          .eq('raffle_id', order.raffle_id)
          .eq('client_id', order.client_id)
          .in('number', ticketNumbers);

        if (tErr) {
          logger.warn('[cancel-and-release] Error liberando tickets:', orderId, tErr);
          results.push({ orderId, ok: false, error: `Liberar tickets: ${tErr.message}` });
          continue;
        }
      }

      // 3) Marcar orden como cancelada
      const { error: updErr } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          rejection_reason: 'Prueba del sistema – anulada por admin',
        })
        .eq('id', orderId);

      if (updErr) {
        results.push({ orderId, ok: false, error: updErr.message });
        continue;
      }

      await supabase.from('admin_access_logs').insert({
        user_id: auth.userId,
        action: 'order_cancel_and_release',
        resource: `orders:${orderId}`,
        created_at: new Date().toISOString(),
      });

      results.push({ orderId, ok: true });
    } catch (e) {
      results.push({
        orderId,
        ok: false,
        error: e instanceof Error ? e.message : 'Error inesperado',
      });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;

  return NextResponse.json({
    success: true,
    processed: results.length,
    ok: okCount,
    failed: failCount,
    results,
  });
}
