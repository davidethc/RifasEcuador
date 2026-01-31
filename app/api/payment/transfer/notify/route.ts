import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { normalizePhoneNumber } from '@/utils/phoneFormatter';

function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { orderId?: string; email?: string; phone?: string } | null;
    const orderId = String(body?.orderId || '').trim();
    const email = cleanEmail(String(body?.email || ''));
    const phone = String(body?.phone || '').trim();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId requerido' }, { status: 400 });
    }
    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'email o phone requerido' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        id,
        status,
        payment_method,
        transfer_proof_url,
        client_id,
        clients:client_id (
          email,
          phone
        )
      `
      )
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
    }

    // Don't allow changing completed orders
    const currentStatus = String((order as unknown as { status?: string | null }).status || '').toLowerCase();
    if (currentStatus === 'completed') {
      return NextResponse.json({ success: false, error: 'La orden ya está completada' }, { status: 409 });
    }

    const client = (order as unknown as { clients?: { email?: string | null; phone?: string | null } | null }).clients;
    const clientEmail = cleanEmail(client?.email || '');
    const clientPhone = client?.phone ? normalizePhoneNumber(client.phone) : '';

    const emailMatches = email ? clientEmail === email : false;
    const phoneMatches = phone ? clientPhone === normalizePhoneNumber(phone) : false;

    if (!emailMatches && !phoneMatches) {
      return NextResponse.json(
        { success: false, error: 'No autorizado para esta orden (email/teléfono no coincide)' },
        { status: 403 }
      );
    }

    // If proof already uploaded, keep status pending_approval, else set to pending.
    const hasProof = Boolean((order as unknown as { transfer_proof_url?: string | null }).transfer_proof_url);
    const nextStatus = hasProof ? 'pending_approval' : 'pending';

    const { error: updErr } = await supabase
      .from('orders')
      .update({
        payment_method: 'transfer',
        status: nextStatus,
        rejection_reason: null,
      })
      .eq('id', orderId);

    if (updErr) {
      return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: nextStatus,
      message: hasProof
        ? 'Listo: tu comprobante ya está en revisión.'
        : 'Listo: tu orden quedó registrada como transferencia (pendiente). Sube el comprobante para que el admin la apruebe.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error inesperado' },
      { status: 500 }
    );
  }
}

