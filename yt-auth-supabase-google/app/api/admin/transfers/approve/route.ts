import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as { orderId?: string } | null;
  const orderId = body?.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId requerido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, raffle_id, client_id, numbers, total, status, payment_method, transfer_proof_url')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
  }

  // Idempotency
  if (order.status === 'completed') {
    return NextResponse.json({ success: true, orderId, status: 'completed', message: 'Orden ya estaba completada' });
  }

  if (order.payment_method !== 'transfer') {
    return NextResponse.json({ success: false, error: 'La orden no es de transferencia' }, { status: 409 });
  }

  // Update order -> completed
  const { error: updOrderErr } = await supabase
    .from('orders')
    .update({ status: 'completed', rejection_reason: null })
    .eq('id', orderId);

  if (updOrderErr) {
    return NextResponse.json({ success: false, error: updOrderErr.message }, { status: 500 });
  }

  // Create payment record for transfer
  const { error: payErr } = await supabase.from('payments').insert({
    order_id: orderId,
    provider: 'transfer',
    provider_reference: null,
    amount: order.total,
    status: 'approved',
    proof_url: order.transfer_proof_url ?? null,
    created_at: new Date().toISOString(),
  });

  if (payErr) {
    return NextResponse.json({ success: false, error: `Orden completada pero fallo crear payment: ${payErr.message}` }, { status: 500 });
  }

  // Mark tickets as paid based on numbers list
  const numbers = order.numbers as unknown;
  const ticketNumbers = Array.isArray(numbers)
    ? (numbers.filter((n): n is string => typeof n === 'string') as string[])
    : [];

  if (ticketNumbers.length > 0) {
    const { error: tErr } = await supabase
      .from('tickets')
      .update({ status: 'paid', reserved_until: null })
      .eq('raffle_id', order.raffle_id)
      .eq('client_id', order.client_id)
      .in('number', ticketNumbers);

    if (tErr) {
      return NextResponse.json(
        { success: false, error: `Pago aprobado pero fallo actualizar tickets: ${tErr.message}` },
        { status: 500 }
      );
    }
  }

  await supabase.from('admin_access_logs').insert({
    user_id: auth.userId,
    action: 'transfer_approve',
    resource: `orders:${orderId}`,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, orderId, status: 'completed' });
}

