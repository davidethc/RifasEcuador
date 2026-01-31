import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function GET(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending_approval';

  const supabase = getSupabaseAdmin();

  const { data: orders, error } = await supabase
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
    .eq('payment_method', 'transfer')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Attach signed URLs (short-lived) for convenience in UI
  type TransferOrderRow = {
    transfer_proof_url: string | null;
    [key: string]: unknown;
  };

  const withSigned = await Promise.all(
    ((orders || []) as unknown as TransferOrderRow[]).map(async (o) => {
      const path = o.transfer_proof_url;
      if (!path) return { ...o, transfer_proof_signed_url: null };

      const { data: signed, error: signErr } = await supabase.storage
        .from('transfer-proofs')
        .createSignedUrl(path, 60 * 10); // 10 minutes

      return {
        ...o,
        transfer_proof_signed_url: signErr ? null : signed?.signedUrl || null,
      };
    })
  );

  return NextResponse.json({ success: true, orders: withSigned });
}

