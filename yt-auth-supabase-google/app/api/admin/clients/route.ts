import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

type ClientRow = {
  id: string;
  auth_user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
};

type OrderMini = {
  id: string;
  client_id: string;
  total: number | null;
  status: string | null;
  payment_method: string | null;
  created_at: string | null;
};

type PaymentMini = {
  order_id: string;
  amount: number | null;
  status: string | null;
  provider: string | null;
  created_at: string | null;
};

type ClientWithStats = ClientRow & {
  last_order_id: string | null;
  last_order_status: string | null;
  last_order_payment_method: string | null;
  last_order_total: number | null;
  last_order_created_at: string | null;
  last_payment_status: string | null;
  last_payment_provider: string | null;
  total_paid: number;
  orders_count: number;
};

const PAGE_SIZE = 5;

export async function GET(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || 'all').trim().toLowerCase();
  const pageRaw = (url.searchParams.get('page') || '1').trim();
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getSupabaseAdmin();

  // Optional filter by "payment state" (implemented via order statuses)
  // - paid -> completed
  // - pending -> reserved / pending / pending_approval
  // - rejected -> rejected
  const statusToOrderStatuses = (): string[] | null => {
    if (status === 'paid') return ['completed'];
    if (status === 'pending') return ['reserved', 'pending', 'pending_approval'];
    if (status === 'rejected') return ['rejected'];
    return null; // "all" or unknown => no filter
  };

  const orderStatuses = statusToOrderStatuses();
  let filteredClientIds: string[] | null = null;

  if (orderStatuses) {
    const { data: orderRows, error: orderErr } = await supabase
      .from('orders')
      .select('client_id')
      .in('status', orderStatuses);

    if (orderErr) {
      return NextResponse.json({ success: false, error: orderErr.message }, { status: 500 });
    }

    const ids = (orderRows || [])
      .map((r) => (r as { client_id: string | null }).client_id)
      .filter((v): v is string => Boolean(v));

    filteredClientIds = Array.from(new Set(ids));

    if (filteredClientIds.length === 0) {
      return NextResponse.json({
        success: true,
        clients: [],
        page,
        pageSize: PAGE_SIZE,
        total: 0,
        totalPages: 1,
      });
    }
  }

  let query = supabase
    .from('clients')
    .select('id,auth_user_id,name,email,phone,created_at', { count: 'exact' });

  if (filteredClientIds) {
    query = query.in('id', filteredClientIds);
  }

  // Simple search (email exact-ish, name/phone partial) without adding fields
  if (q) {
    // Note: PostgREST `or` filter uses comma-separated expressions.
    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const total = typeof count === 'number' ? count : 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const clients = ((data || []) as unknown as ClientRow[]) || [];
  const clientIds = clients.map((c) => c.id).filter(Boolean);

  // Enrich each page of clients with last order + totals (no new DB fields)
  let orders: OrderMini[] = [];
  if (clientIds.length > 0) {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id,client_id,total,status,payment_method,created_at')
      .in('client_id', clientIds)
      .order('created_at', { ascending: false });

    orders = (ordersData || []) as unknown as OrderMini[];
  }

  const ordersByClient = new Map<string, OrderMini[]>();
  for (const o of orders) {
    if (!o?.client_id) continue;
    const arr = ordersByClient.get(o.client_id) || [];
    arr.push(o);
    ordersByClient.set(o.client_id, arr);
  }

  const lastOrderByClient = new Map<string, OrderMini>();
  for (const [cid, arr] of ordersByClient.entries()) {
    // orders are globally sorted by created_at desc, but ensure per-client too
    const sorted = arr
      .slice()
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    if (sorted[0]) lastOrderByClient.set(cid, sorted[0]);
  }

  const allOrderIds = orders.map((o) => o.id).filter(Boolean);
  const orderIdToClientId = new Map<string, string>();
  for (const o of orders) {
    if (o?.id && o?.client_id) orderIdToClientId.set(o.id, o.client_id);
  }

  let payments: PaymentMini[] = [];
  if (allOrderIds.length > 0) {
    const { data: payData } = await supabase
      .from('payments')
      .select('order_id,amount,status,provider,created_at')
      .in('order_id', allOrderIds)
      .order('created_at', { ascending: false });

    payments = (payData || []) as unknown as PaymentMini[];
  }

  const totalPaidByClient = new Map<string, number>();
  const lastPaymentByOrder = new Map<string, PaymentMini>();
  for (const p of payments) {
    if (!p?.order_id) continue;
    if (!lastPaymentByOrder.has(p.order_id)) lastPaymentByOrder.set(p.order_id, p);

    const cid = orderIdToClientId.get(p.order_id);
    if (!cid) continue;
    if ((p.status || '').toLowerCase() !== 'approved') continue;
    const prev = totalPaidByClient.get(cid) || 0;
    totalPaidByClient.set(cid, prev + (typeof p.amount === 'number' ? p.amount : 0));
  }

  const ordersCountByClient = new Map<string, number>();
  for (const [cid, arr] of ordersByClient.entries()) {
    ordersCountByClient.set(cid, arr.length);
  }

  const clientsWithStats: ClientWithStats[] = clients.map((c) => {
    const lastOrder = lastOrderByClient.get(c.id) || null;
    const lastPayment = lastOrder?.id ? lastPaymentByOrder.get(lastOrder.id) || null : null;

    return {
      ...c,
      last_order_id: lastOrder?.id || null,
      last_order_status: lastOrder?.status || null,
      last_order_payment_method: lastOrder?.payment_method || null,
      last_order_total: typeof lastOrder?.total === 'number' ? lastOrder.total : null,
      last_order_created_at: lastOrder?.created_at || null,
      last_payment_status: lastPayment?.status || null,
      last_payment_provider: lastPayment?.provider || null,
      total_paid: totalPaidByClient.get(c.id) || 0,
      orders_count: ordersCountByClient.get(c.id) || 0,
    };
  });

  return NextResponse.json({
    success: true,
    clients: clientsWithStats,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as { name?: string; email?: string; phone?: string } | null;
  const name = body?.name?.trim() || null;
  const email = body?.email?.trim().toLowerCase() || null;
  const phone = body?.phone?.trim() || null;

  if (!email && !phone) {
    return NextResponse.json({ success: false, error: 'email o phone requerido' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Reuse existing security-definer function (no RLS headaches, no duplicates by email/auth_user_id)
  const { data: clientId, error: rpcErr } = await supabase.rpc('get_or_create_client', {
    p_email: email,
    p_name: name,
    p_phone: phone,
    p_auth_user_id: null,
  });

  if (rpcErr || !clientId) {
    return NextResponse.json({ success: false, error: rpcErr?.message || 'No se pudo crear cliente' }, { status: 500 });
  }

  return NextResponse.json({ success: true, clientId });
}

