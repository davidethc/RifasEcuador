import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as { orderId?: string; reason?: string } | null;
  const orderId = body?.orderId?.trim();
  const reason = body?.reason?.trim() || 'Pago no validado';

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId requerido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, raffle_id, client_id, numbers, status, payment_method')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
  }

  if (order.status === 'completed') {
    return NextResponse.json({ success: false, error: 'No se puede rechazar una orden completada' }, { status: 409 });
  }

  if (order.payment_method !== 'transfer') {
    return NextResponse.json({ success: false, error: 'La orden no es de transferencia' }, { status: 409 });
  }

  const { error: updOrderErr } = await supabase
    .from('orders')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', orderId);

  if (updOrderErr) {
    return NextResponse.json({ success: false, error: updOrderErr.message }, { status: 500 });
  }

  const numbers = order.numbers as unknown;
  const ticketNumbers = Array.isArray(numbers)
    ? (numbers.filter((n): n is string => typeof n === 'string') as string[])
    : [];

  if (ticketNumbers.length > 0) {
    const { error: tErr } = await supabase
      .from('tickets')
      .update({ status: 'available', reserved_until: null, client_id: null })
      .eq('raffle_id', order.raffle_id)
      .eq('client_id', order.client_id)
      .in('number', ticketNumbers);

    if (tErr) {
      return NextResponse.json(
        { success: false, error: `Orden rechazada pero fallo liberar tickets: ${tErr.message}` },
        { status: 500 }
      );
    }
  }

  await supabase.from('admin_access_logs').insert({
    user_id: auth.userId,
    action: 'transfer_reject',
    resource: `orders:${orderId}`,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, orderId, status: 'rejected' });
}

