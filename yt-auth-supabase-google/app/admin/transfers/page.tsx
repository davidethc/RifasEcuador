'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { adminFetch } from '@/components/admin/adminFetch';

type TransferOrder = {
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

export default function AdminTransfersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<TransferOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [lookupId, setLookupId] = useState('');
  const [lookupOrder, setLookupOrder] = useState<TransferOrder | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [invoiceSending, setInvoiceSending] = useState<string | null>(null);
  const [invoiceMessage, setInvoiceMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const load = async (isAutoRefresh: boolean) => {
    if (isAutoRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      // Show BOTH:
      // - pending_approval: has proof uploaded (ready to approve)
      // - pending: user chose transfer / notified, but may not have uploaded proof yet
      const [r1, r2] = await Promise.all([
        adminFetch('/api/admin/transfers?status=pending_approval', { cache: 'no-store' }),
        adminFetch('/api/admin/transfers?status=pending', { cache: 'no-store' }),
      ]);

      const j1 = (await r1.json()) as { success: boolean; orders?: TransferOrder[]; error?: string };
      const j2 = (await r2.json()) as { success: boolean; orders?: TransferOrder[]; error?: string };

      if (!j1.success) throw new Error(j1.error || 'No se pudo cargar');
      if (!j2.success) throw new Error(j2.error || 'No se pudo cargar');

      const merged = [...(j1.orders || []), ...(j2.orders || [])].sort((a, b) =>
        (b.created_at || '').localeCompare(a.created_at || '')
      );

      setOrders(merged);
      setLastUpdatedAt(new Date().toLocaleString('es-EC'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(false);

    const id = window.setInterval(() => void load(true), 15000);
    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') void load(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const pendingCount = useMemo(() => orders.length, [orders]);
  const withProofCount = useMemo(() => orders.filter((o) => o.status === 'pending_approval').length, [orders]);
  const withoutProofCount = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders]);

  const lookupByOrderId = async () => {
    const id = lookupId.trim();
    if (!id) return;
    setLookupLoading(true);
    setError(null);
    setLookupOrder(null);
    try {
      const res = await adminFetch(`/api/admin/orders/lookup?orderId=${encodeURIComponent(id)}`);
      const json = (await res.json()) as { success: boolean; order?: TransferOrder; error?: string };
      if (!json.success || !json.order) throw new Error(json.error || 'No encontrado');
      setLookupOrder(json.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLookupLoading(false);
    }
  };

  const approve = async (orderId: string) => {
    setActing(orderId);
    try {
      const res = await adminFetch('/api/admin/transfers/approve', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error || 'No se pudo aprobar');
      await load(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setActing(null);
    }
  };

  const reject = async (orderId: string) => {
    setActing(orderId);
    try {
      const res = await adminFetch('/api/admin/transfers/reject', {
        method: 'POST',
        body: JSON.stringify({ orderId, reason: rejectReason[orderId] || 'Pago no validado' }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error || 'No se pudo rechazar');
      await load(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setActing(null);
    }
  };

  const sendInvoice = async (orderId: string) => {
    setInvoiceMessage(null);
    setInvoiceSending(orderId);
    try {
      const res = await adminFetch('/api/admin/send-invoice', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });
      const json = (await res.json()) as { success: boolean; error?: string; message?: string };
      if (!json.success) throw new Error(json.error || 'No se pudo enviar');
      setInvoiceMessage({ type: 'ok', text: 'Factura enviada al correo del cliente' });
      setTimeout(() => setInvoiceMessage(null), 4000);
    } catch (e) {
      setInvoiceMessage({ type: 'error', text: e instanceof Error ? e.message : 'Error al enviar factura' });
    } finally {
      setInvoiceSending(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-[var(--font-comfortaa)]">Transferencias</h1>
          <p className="text-sm font-[var(--font-dm-sans)] mt-1" style={{ color: '#9CA3AF' }}>
            Órdenes pagadas por transferencia que esperan tu aprobación o el comprobante del cliente.
          </p>
          <p className="text-sm font-[var(--font-dm-sans)] mt-0.5" style={{ color: '#E5D4FF' }}>
            Pendientes: {pendingCount} · Con comprobante: {withProofCount} · Sin comprobante: {withoutProofCount}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdatedAt && (
            <span className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              Actualizado: {lastUpdatedAt}
            </span>
          )}
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={loading || refreshing}
            className="px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.10)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {refreshing ? 'Actualizando…' : 'Refrescar'}
          </button>
        </div>
      </div>

      {/* Buscar por código/ID (para cuando llega por WhatsApp) */}
      <div className="mb-6 rounded-xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.12)' }}>
        <p className="text-sm font-semibold font-[var(--font-dm-sans)] mb-2" style={{ color: '#E5D4FF' }}>
          Buscar por ID de orden (código)
        </p>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Pega aquí el ID de orden (ej: 901ffadc-...)"
            className="flex-1 px-3 py-2 rounded-lg border text-sm"
            style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
          />
          <button
            type="button"
            onClick={lookupByOrderId}
            disabled={lookupLoading || !lookupId.trim()}
            className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
            style={{ background: '#A83EF5', color: '#FFFFFF' }}
          >
            {lookupLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {lookupOrder && (
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              Resultado:
            </p>
            <p className="text-sm font-semibold font-[var(--font-dm-sans)] text-white">
              {lookupOrder.raffles?.title || 'Sorteo'} · ${Number(lookupOrder.total).toFixed(2)} · estado: {lookupOrder.status}
            </p>
            <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              Cliente: {lookupOrder.clients?.name || '-'} · {lookupOrder.clients?.email || '-'} · {lookupOrder.clients?.phone || '-'}
            </p>
            {lookupOrder.payment_method !== 'transfer' && (
              <div className="mt-3 rounded-lg border p-3 text-sm" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#9CA3AF' }}>
                Esta orden <b>no está marcada como transferencia</b>. Pide al cliente que presione <b>“Avisar al sistema”</b> o que suba el comprobante en la web.
              </div>
            )}
            <div className="mt-3 flex flex-col md:flex-row gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => approve(lookupOrder.id)}
                disabled={acting === lookupOrder.id || lookupOrder.payment_method !== 'transfer'}
                className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{ background: '#22C55E', color: '#0F1117' }}
              >
                {acting === lookupOrder.id ? 'Procesando...' : 'Aprobar transferencia'}
              </button>
              <button
                type="button"
                onClick={() => reject(lookupOrder.id)}
                disabled={acting === lookupOrder.id || lookupOrder.payment_method !== 'transfer'}
                className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{ background: '#EF4444', color: '#0F1117' }}
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => sendInvoice(lookupOrder.id)}
                disabled={invoiceSending === lookupOrder.id || !lookupOrder.clients?.email}
                className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{ background: '#FFB200', color: '#0F1117' }}
              >
                {invoiceSending === lookupOrder.id ? 'Enviando...' : 'Factura'}
              </button>
            </div>
          </div>
        )}
      </div>

          {error && (
            <div className="mb-4 rounded-xl border p-4" style={{ background: 'rgba(239, 68, 68, 0.10)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#E5E7EB' }}>
              {error}
            </div>
          )}
          {invoiceMessage && (
            <div
              className="mb-4 rounded-xl border p-4"
              style={
                invoiceMessage.type === 'ok'
                  ? { background: 'rgba(34, 197, 94, 0.10)', borderColor: 'rgba(34, 197, 94, 0.25)', color: '#E5E7EB' }
                  : { background: 'rgba(239, 68, 68, 0.10)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#E5E7EB' }
              }
            >
              {invoiceMessage.text}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border p-6 text-white" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
              Cargando...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border p-6 text-white" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
              No hay transferencias pendientes.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border p-5" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                  <div className="flex flex-col md:flex-row gap-4 md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
                        {o.raffles?.title || 'Sorteo'} · {new Date(o.created_at).toLocaleString('es-EC')}
                      </p>
                      <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                        Orden: {o.id}
                      </p>
                      <p className="mt-2 text-lg font-bold font-[var(--font-comfortaa)] text-white">
                        ${Number(o.total).toFixed(2)}
                      </p>
                      <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                        Cliente: {o.clients?.name || '-'} · {o.clients?.email || '-'} · {o.clients?.phone || '-'}
                      </p>
                      <p className="mt-2 text-sm font-[var(--font-dm-sans)] text-white">
                        Números: {(o.numbers || []).join(', ')}
                      </p>
                    </div>

                    <div className="w-full md:w-[360px] flex-shrink-0">
                      {o.transfer_proof_signed_url ? (
                        o.transfer_proof_signed_url.includes('.pdf') ? (
                          <a
                            href={o.transfer_proof_signed_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl border p-4 text-center font-semibold text-sm"
                            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF' }}
                          >
                            Abrir comprobante (PDF)
                          </a>
                        ) : (
                          <div className="relative w-full h-[220px] rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                            <Image src={o.transfer_proof_signed_url} alt="Comprobante" fill className="object-cover" sizes="360px" />
                          </div>
                        )
                      ) : (
                        <div className="rounded-xl border p-4 text-sm text-center" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#9CA3AF' }}>
                          Sin comprobante
                        </div>
                      )}

                      <div className="mt-3 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => approve(o.id)}
                          disabled={acting === o.id}
                          className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                          style={{ background: '#22C55E', color: '#0F1117' }}
                        >
                          {acting === o.id ? 'Procesando...' : 'Aprobar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => sendInvoice(o.id)}
                          disabled={invoiceSending === o.id || !o.clients?.email}
                          className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                          style={{ background: '#FFB200', color: '#0F1117' }}
                        >
                          {invoiceSending === o.id ? 'Enviando...' : 'Factura'}
                        </button>

                        <div className="flex gap-2">
                          <input
                            value={rejectReason[o.id] || ''}
                            onChange={(e) => setRejectReason((prev) => ({ ...prev, [o.id]: e.target.value }))}
                            placeholder="Motivo (opcional)"
                            className="flex-1 px-3 py-2 rounded-lg border text-sm"
                            style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
                          />
                          <button
                            type="button"
                            onClick={() => reject(o.id)}
                            disabled={acting === o.id}
                            className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                            style={{ background: '#EF4444', color: '#0F1117' }}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}

