'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/components/admin/adminFetch';

type ClientRow = {
  id: string;
  auth_user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  last_order_id?: string | null;
  last_order_status?: string | null;
  last_order_payment_method?: string | null;
  last_order_total?: number | null;
  last_order_numbers?: string[] | null;
  last_order_created_at?: string | null;
  last_payment_status?: string | null;
  last_payment_provider?: string | null;
  total_paid?: number;
  orders_count?: number;
};

type ClientsResponse = {
  success: boolean;
  clients?: ClientRow[];
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  error?: string;
};

type Raffle = {
  id: string;
  title: string;
  price_per_ticket: number;
  total_numbers: number;
  status: string;
};

type RafflesResponse = {
  success: boolean;
  raffles?: Raffle[];
  error?: string;
};

type AssignResponse = {
  success: boolean;
  order_id?: string;
  numbers?: string[];
  total?: number;
  message?: string;
  email_sent?: boolean;
  error?: string;
};

const PAGE_SIZE = 5;
type StatusFilter = 'all' | 'paid' | 'pending' | 'rejected';

const formatMoney = (v: number | null | undefined) => {
  const n = typeof v === 'number' ? v : 0;
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(n);
};

const prettyStatus = (s: string | null | undefined) => {
  const v = (s || '').toLowerCase();
  if (!v) return '-';
  if (v === 'completed') return 'Pagado';
  if (v === 'pending_approval') return 'Pendiente (comprobante)';
  if (v === 'rejected') return 'Rechazado';
  if (v === 'pending') return 'Pendiente';
  if (v === 'reserved') return 'Reservado';
  return v;
};

/** Método de pago: mostrar transfer/payphone/cash; "pending" o vacío = "-" */
const prettyPaymentMethod = (method: string | null | undefined, provider: string | null | undefined) => {
  const v = (method || provider || '').toLowerCase().trim();
  if (!v || v === 'pending') return '-';
  if (v === 'transfer') return 'Transferencia';
  if (v === 'payphone') return 'Payphone';
  if (v === 'cash') return 'Efectivo';
  return v;
};

const buildPageItems = (current: number, total: number) => {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);

  // If small, show all pages
  if (safeTotal <= 7) {
    return Array.from({ length: safeTotal }, (_, i) => i + 1);
  }

  // Always show first + last, and a window around current
  const windowSize = 2; // pages before/after current
  const start = Math.max(2, safeCurrent - windowSize);
  const end = Math.min(safeTotal - 1, safeCurrent + windowSize);

  const items: Array<number | '...'> = [1];
  if (start > 2) items.push('...');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < safeTotal - 1) items.push('...');
  items.push(safeTotal);
  return items;
};

export default function AdminClientsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdMsg, setCreatedMsg] = useState<string | null>(null);

  // Estados para asignación de boletos
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffleId, setSelectedRaffleId] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignedMsg, setAssignedMsg] = useState<string | null>(null);
  const [assignedNumbers, setAssignedNumbers] = useState<string[]>([]);
  const [assignedEmailSent, setAssignedEmailSent] = useState(false);

  const load = async (nextPage?: number, nextStatus?: StatusFilter) => {
    const p = Math.max(1, nextPage ?? page);
    const effectiveStatus = nextStatus ?? status;
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(
        `/api/admin/clients?q=${encodeURIComponent(q.trim())}&status=${encodeURIComponent(effectiveStatus)}&page=${p}`
      );
      const json = (await res.json()) as ClientsResponse;
      if (!json.success) throw new Error(json.error || 'No se pudo cargar');
      setClients(json.clients || []);
      setPage(json.page ?? p);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
    void loadRaffles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRaffles = async () => {
    try {
      console.log('[loadRaffles] Fetching raffles...');
      const res = await adminFetch('/api/admin/raffles');
      const json = (await res.json()) as RafflesResponse;
      console.log('[loadRaffles] Response:', json);
      
      if (json.success && json.raffles) {
        console.log('[loadRaffles] Raffles loaded:', json.raffles.length);
        setRaffles(json.raffles);
        // Seleccionar la primera rifa por defecto
        if (json.raffles.length > 0) {
          setSelectedRaffleId(json.raffles[0].id);
          console.log('[loadRaffles] Selected raffle:', json.raffles[0].id);
        }
      } else {
        console.error('[loadRaffles] No raffles or error:', json.error);
      }
    } catch (e) {
      console.error('[loadRaffles] Error:', e);
    }
  };

  // Actualización automática: cada 20s y al volver a la pestaña (pagos en tiempo casi real)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void load(page);
      }
    }, 20_000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load(page);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const createClient = async () => {
    setCreating(true);
    setCreatedMsg(null);
    setError(null);
    setAssignedMsg(null);
    setAssignedNumbers([]);
    try {
      const res = await adminFetch('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const json = (await res.json()) as { success: boolean; clientId?: string; error?: string };
      if (!json.success) throw new Error(json.error || 'No se pudo crear');
      
      console.log('[createClient] Cliente creado:', json.clientId);
      setCreatedMsg(`✅ Cliente creado exitosamente`);
      
      // Seleccionar automáticamente el cliente recién creado
      if (json.clientId) {
        setSelectedClientId(json.clientId);
        console.log('[createClient] Cliente seleccionado para asignación:', json.clientId);
      }
      
      setName('');
      setEmail('');
      setPhone('');
      setPage(1);
      await load(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setCreating(false);
    }
  };

  const assignTickets = async () => {
    console.log('[assignTickets] Starting...', {
      selectedClientId,
      selectedRaffleId,
      ticketQuantity,
      raffles: raffles.length,
    });

    if (!selectedClientId) {
      setError('Selecciona un cliente primero');
      return;
    }
    if (!selectedRaffleId) {
      setError('Selecciona una rifa');
      return;
    }
    if (ticketQuantity < 1 || ticketQuantity > 1000) {
      setError('La cantidad debe estar entre 1 y 1000');
      return;
    }

    setAssigning(true);
    setAssignedMsg(null);
    setAssignedNumbers([]);
    setAssignedEmailSent(false);
    setError(null);
    try {
      console.log('[assignTickets] Calling API...');
      const res = await adminFetch('/api/admin/assign-tickets', {
        method: 'POST',
        body: JSON.stringify({
          client_id: selectedClientId,
          raffle_id: selectedRaffleId,
          quantity: ticketQuantity,
        }),
      });
      const json = (await res.json()) as AssignResponse;
      console.log('[assignTickets] API Response:', json);
      
      if (!json.success) throw new Error(json.error || 'No se pudo asignar');
      
      setAssignedMsg(json.message || '✅ Boletos asignados exitosamente');
      setAssignedNumbers(json.numbers || []);
      setAssignedEmailSent(!!json.email_sent);
      
      // Resetear estados
      setSelectedClientId('');
      setTicketQuantity(1);
      setCreatedMsg(null);
      
      // Pequeño delay para asegurar que la DB se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar la tabla para mostrar los cambios
      console.log('[assignTickets] Reloading clients table...');
      await load(page);
    } catch (e) {
      console.error('[assignTickets] Error:', e);
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-[var(--font-comfortaa)]">Clientes</h1>
          <p className="text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
            Agrega clientes manualmente (por WhatsApp) o búscalos por email/teléfono.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border p-4" style={{ background: 'rgba(239, 68, 68, 0.10)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#E5E7EB' }}>
          {error}
        </div>
      )}
      {createdMsg && (
        <div className="mb-4 rounded-xl border p-4" style={{ background: 'rgba(34, 197, 94, 0.10)', borderColor: 'rgba(34, 197, 94, 0.25)', color: '#E5E7EB' }}>
          {createdMsg}
        </div>
      )}
      {assignedMsg && (
        <div className="mb-4 rounded-xl border p-4" style={{ background: 'rgba(34, 197, 94, 0.10)', borderColor: 'rgba(34, 197, 94, 0.25)', color: '#E5E7EB' }}>
          <p className="font-semibold mb-2">{assignedMsg}</p>
          {assignedEmailSent && (
            <p className="text-sm mb-2" style={{ color: '#86EFAC' }}>
              📧 El cliente recibió un correo con los números y el comprobante.
            </p>
          )}
          {assignedNumbers.length > 0 && (
            <div>
              <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>
                Números asignados:
              </p>
              <p className="font-mono text-xs" style={{ color: '#E5D4FF' }}>
                {assignedNumbers.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.12)' }}>
          <p className="text-sm font-semibold font-[var(--font-dm-sans)] mb-3" style={{ color: '#E5D4FF' }}>
            1️⃣ Nuevo cliente
          </p>
          <div className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (opcional)"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Teléfono (opcional)"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
            />
            <button
              type="button"
              onClick={createClient}
              disabled={creating || (!email.trim() && !phone.trim())}
              className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 w-full"
              style={{ background: '#FFB200', color: '#0F1117' }}
            >
              {creating ? 'Creando...' : '✅ Crear cliente'}
            </button>
            <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              Tip: con email o teléfono es suficiente. Si pones email, al asignar boletos (pago físico) el cliente recibirá un correo con los números y el comprobante.
            </p>
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.12)' }}>
          <p className="text-sm font-semibold font-[var(--font-dm-sans)] mb-3" style={{ color: '#E5D4FF' }}>
            2️⃣ Asignar boletos (pago físico)
          </p>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-[var(--font-dm-sans)] mb-1 block" style={{ color: '#9CA3AF' }}>
                Cliente
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
              >
                <option value="">Selecciona un cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.email || c.phone || `Cliente ${c.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-[var(--font-dm-sans)] mb-1 block" style={{ color: '#9CA3AF' }}>
                Rifa activa
              </label>
              <select
                value={selectedRaffleId}
                onChange={(e) => setSelectedRaffleId(e.target.value)}
                disabled={raffles.length === 0}
                className="w-full px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
                style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
              >
                {raffles.length === 0 ? (
                  <option>No hay rifas activas</option>
                ) : (
                  raffles.map((raffle) => (
                    <option key={raffle.id} value={raffle.id}>
                      {raffle.title} - ${raffle.price_per_ticket}/boleto
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-[var(--font-dm-sans)] mb-1 block" style={{ color: '#9CA3AF' }}>
                Cantidad de boletos (aleatorios)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
              />
            </div>
            <button
              type="button"
              onClick={assignTickets}
              disabled={assigning || !selectedClientId || !selectedRaffleId || raffles.length === 0}
              className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 w-full"
              style={{ background: '#A83EF5', color: '#FFFFFF' }}
            >
              {assigning ? 'Asignando...' : '🎲 Asignar boletos aleatorios'}
            </button>
            <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              {selectedClientId && raffles.length > 0
                ? `✅ Listo. ${ticketQuantity} boleto(s) de $${
                    raffles.find((r) => r.id === selectedRaffleId)?.price_per_ticket || 0
                  } c/u = $${(
                    ticketQuantity * (raffles.find((r) => r.id === selectedRaffleId)?.price_per_ticket || 0)
                  ).toFixed(2)}`
                : raffles.length === 0
                ? '⚠️ No hay rifas activas'
                : '⚠️ Selecciona un cliente'}
            </p>
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.12)' }}>
          <p className="text-sm font-semibold font-[var(--font-dm-sans)] mb-3" style={{ color: '#E5D4FF' }}>
            Buscar
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre/email/teléfono"
              className="flex-1 px-3 py-2 rounded-lg border text-sm"
              style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
            />
            <select
              value={status}
              onChange={(e) => {
                const next = (e.target.value as StatusFilter) || 'all';
                setStatus(next);
                setPage(1);
                void load(1, next);
              }}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
            >
              <option value="all">Todos</option>
              <option value="paid">Pagados</option>
              <option value="pending">Pendientes</option>
              <option value="rejected">Rechazados</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                void load(1);
              }}
              className="px-4 py-2 rounded-lg font-semibold text-sm"
              style={{ background: '#A83EF5', color: '#FFFFFF' }}
            >
              Buscar
            </button>
          </div>
          <p className="mt-2 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
            Resultados: {total} {total > PAGE_SIZE ? `(mostrando ${clients.length} por página)` : ''}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {/* Scroll indicator hint */}
        <p className="text-xs mb-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
          💡 Tip: Desliza horizontalmente para ver todas las columnas →
        </p>
        <div className="relative overflow-x-auto rounded-xl border shadow-xl" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          {/* Keep table mounted to avoid scroll "rebote" when loading */}
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                <th className="text-left px-3 py-2.5 text-white font-semibold whitespace-nowrap">Nombre</th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                  Email
                </th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                  Teléfono
                </th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                  Estado
                </th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                  Método de pago
                </th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                  Monto
                </th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                  Números
                </th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                  Total pagado
                </th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={{ color: '#9CA3AF' }}>
                  ID de orden
                </th>
              </tr>
            </thead>
            <tbody style={loading ? { opacity: 0.55 } : undefined}>
              {clients.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <td className="px-3 py-2.5 text-white whitespace-nowrap">{c.name || '-'}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                    {c.email || '-'}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                    {c.phone || '-'}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                    {prettyStatus(c.last_order_status || null)}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                    {prettyPaymentMethod(c.last_order_payment_method ?? null, c.last_payment_provider ?? null)}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                    {c.last_order_total != null ? formatMoney(c.last_order_total) : '-'}
                  </td>
                  <td className="px-3 py-2.5 font-mono whitespace-nowrap" style={{ color: '#E5D4FF', maxWidth: '200px' }}>
                    <div className="truncate" title={Array.isArray(c.last_order_numbers) ? c.last_order_numbers.join(', ') : ''}>
                      {Array.isArray(c.last_order_numbers) && c.last_order_numbers.length > 0
                        ? c.last_order_numbers.join(', ')
                        : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#E5D4FF' }}>
                    {formatMoney(c.total_paid)}
                  </td>
                  <td className="px-3 py-2.5" style={{ color: '#9CA3AF' }}>
                    {c.last_order_id ? (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="font-mono truncate max-w-[120px]" title={c.last_order_id}>
                          {c.last_order_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(c.last_order_id || '');
                            // Opcional: mostrar feedback visual
                          }}
                          className="px-2 py-0.5 rounded font-semibold hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0"
                          style={{ background: 'rgba(168, 62, 245, 0.2)', color: '#A83EF5', fontSize: '10px' }}
                          title="Copiar ID de orden"
                        >
                          Copiar
                        </button>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
              {!loading && clients.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center" colSpan={9} style={{ color: '#9CA3AF' }}>
                    Sin resultados
                  </td>
                </tr>
              )}
              {loading && clients.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-white text-center" colSpan={9}>
                    Cargando...
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && clients.length > 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-3">
              <div
                className="rounded-lg border px-3 py-1 text-xs font-semibold"
                style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}
              >
                Actualizando...
              </div>
            </div>
          )}
        </div>
      </div>

      {!loading && total > 0 && (
        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
            Página {page} de {totalPages} · 5 por página
          </p>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => void load(page - 1)}
              disabled={loading || page <= 1}
              className="px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.10)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Anterior
            </button>

            {buildPageItems(page, totalPages).map((it, idx) =>
              it === '...' ? (
                <span key={`dots-${idx}`} className="px-2 text-sm" style={{ color: '#9CA3AF' }}>
                  ...
                </span>
              ) : (
                <button
                  key={it}
                  type="button"
                  onClick={() => void load(it)}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg text-sm font-semibold"
                  style={
                    it === page
                      ? { background: '#A83EF5', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.12)' }
                      : { background: 'rgba(255,255,255,0.10)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)' }
                  }
                >
                  {it}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => void load(page + 1)}
              disabled={loading || page >= totalPages}
              className="px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.10)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

