import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

type LookupOrder = {
  id: string;
  raffle_id: string;
  client_id: string;
  numbers: string[];
  total: number;
  status: string;
  payment_method: string | null;
  transfer_proof_url: string | null;
  transfer_proof_signed_url: string | null;
  rejection_reason: string | null;
  created_at: string;
  clients?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  raffles?: { title?: string | null } | null;
};

export async function GET(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const orderId = (url.searchParams.get('orderId') || '').trim();

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId requerido' }, { status: 400 });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderId)) {
    return NextResponse.json({ success: false, error: 'orderId inválido (debe ser UUID completo)' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      raffle_id,
      client_id,
      numbers,
      total,
      status,
      payment_method,
      transfer_proof_url,
      rejection_reason,
      created_at,
      clients:client_id (
        name,
        email,
        phone
      ),
      raffles:raffle_id (
        title
      )
    `
    )
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
  }

  const path = (order as unknown as { transfer_proof_url?: string | null }).transfer_proof_url ?? null;
  let signedUrl: string | null = null;
  if (path) {
    const { data: signed, error: signErr } = await supabase.storage
      .from('transfer-proofs')
      .createSignedUrl(path, 60 * 10);
    signedUrl = signErr ? null : signed?.signedUrl || null;
  }

  const result: LookupOrder = {
    ...(order as unknown as Omit<LookupOrder, 'transfer_proof_signed_url'>),
    transfer_proof_signed_url: signedUrl,
  };

  return NextResponse.json({ success: true, order: result });
}

