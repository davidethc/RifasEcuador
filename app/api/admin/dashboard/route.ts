import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function GET(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseAdmin();
  type SalesProgressRow = { total_tickets: number; sold_tickets: number };
  type RevenueRow = { amount: number; provider: string | null };

  // 1) Sold/Total (from view)
  const { data: progressRows, error: progressError } = await supabase
    .from('raffle_sales_progress')
    .select('total_tickets,sold_tickets');

  if (progressError) {
    return NextResponse.json({ success: false, error: progressError.message }, { status: 500 });
  }

  const progress = (progressRows || []) as unknown as SalesProgressRow[];
  const soldTickets = progress.reduce((acc, r) => acc + Number(r.sold_tickets || 0), 0);
  const totalTickets = progress.reduce((acc, r) => acc + Number(r.total_tickets || 0), 0);

  // 2) Reserved / Available counts (tickets table)
  const [{ count: reservedTickets }, { count: availableTickets }] = await Promise.all([
    supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'reserved'),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'available'),
  ]);

  // 3) Revenue (approved payments) - total + breakdown by provider
  const { data: revenueRows, error: revError } = await supabase
    .from('payments')
    .select('amount,provider')
    .eq('status', 'approved');

  if (revError) {
    return NextResponse.json({ success: false, error: revError.message }, { status: 500 });
  }

  const revenue = (revenueRows || []) as unknown as RevenueRow[];
  let revenuePayphone = 0;
  let revenueTransfer = 0;
  let revenueOther = 0;

  for (const r of revenue) {
    const amt = Number(r.amount || 0);
    const provider = (r.provider || '').toLowerCase();
    if (provider === 'payphone') revenuePayphone += amt;
    else if (provider === 'transfer') revenueTransfer += amt;
    else revenueOther += amt;
  }

  const totalRevenue = revenuePayphone + revenueTransfer + revenueOther;

  // 4) Pending transfers
  const { count: pendingTransfers, error: pendErr } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('payment_method', 'transfer')
    .eq('status', 'pending_approval');

  if (pendErr) {
    return NextResponse.json({ success: false, error: pendErr.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      success: true,
      metrics: {
        soldTickets,
        totalTickets,
        reservedTickets: reservedTickets || 0,
        availableTickets: availableTickets || 0,
        totalRevenue,
        revenuePayphone,
        revenueTransfer,
        pendingTransfers: pendingTransfers || 0,
      },
    },
    {
      headers: {
        // Avoid any caching so numbers update immediately after payments/admin actions.
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

