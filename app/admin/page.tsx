'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/components/admin/adminFetch';

type DashboardResponse = {
  success: boolean;
  error?: string;
  metrics?: {
    soldTickets: number;
    totalTickets: number;
    reservedTickets: number;
    availableTickets: number;
    totalRevenue: number;
    revenuePayphone: number;
    revenueTransfer: number;
    pendingTransfers: number;
  };
};

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const fetchDashboard = async (isAutoRefresh: boolean) => {
    if (isAutoRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminFetch('/api/admin/dashboard', { cache: 'no-store' });
      const json = (await res.json()) as DashboardResponse;
      setData(json);
      setLastUpdatedAt(new Date().toLocaleString('es-EC'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchDashboard(false);

    // Actualización automática: cada 5 s y al volver a la pestaña
    const id = window.setInterval(() => {
      void fetchDashboard(true);
    }, 5000);

    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void fetchDashboard(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const m = data?.metrics;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-[var(--font-comfortaa)]">Dashboard</h1>
          <p className="text-sm font-[var(--font-dm-sans)] mt-1" style={{ color: '#9CA3AF' }}>
            Resumen de tu negocio: ventas, reservas y recaudación. Se actualiza solo cada 5 segundos.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {refreshing && (
            <span className="flex items-center gap-2 text-xs font-[var(--font-dm-sans)] px-2 py-1 rounded" style={{ background: 'rgba(168, 62, 245, 0.15)', color: '#A83EF5' }}>
              <span className="animate-pulse">●</span>
              Actualizando...
            </span>
          )}
          {!refreshing && lastUpdatedAt && (
            <span className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              Actualizado: {lastUpdatedAt}
            </span>
          )}
          <button
            type="button"
            onClick={() => void fetchDashboard(true)}
            disabled={loading}
            className="px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.10)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Refrescar
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border p-6 text-white" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          Cargando métricas...
        </div>
      )}

      {!loading && (!data?.success || !m) && (
        <div className="rounded-2xl border p-6 text-white" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          Error: {data?.error || 'No se pudo cargar el dashboard'}
        </div>
      )}

      {!loading && data?.success && m && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Boletos vendidos"
            help="Ya pagados y confirmados"
            value={`${m.soldTickets}`}
            subtitle={`De ${m.totalTickets} total · Quedan ${m.availableTickets} por vender`}
          />
          <StatCard
            title="Reservados"
            help="Con reserva, aún no pagados"
            value={`${m.reservedTickets}`}
            subtitle={`Disponibles para vender: ${m.availableTickets}`}
          />
          <StatCard
            title="Recaudación"
            help="Dinero ya cobrado"
            value={`$${m.totalRevenue.toFixed(2)}`}
            subtitle={`Payphone: $${m.revenuePayphone.toFixed(2)} · Transferencia: $${m.revenueTransfer.toFixed(2)} · Pendientes por aprobar: ${m.pendingTransfers}`}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  help,
  value,
  subtitle,
}: {
  title: string;
  help?: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        borderColor: 'rgba(255,255,255,0.12)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
      }}
    >
      <p className="text-sm font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
        {title}
      </p>
      {help && (
        <p className="text-xs font-[var(--font-dm-sans)] mt-0.5" style={{ color: '#9CA3AF' }}>
          {help}
        </p>
      )}
      <p className="mt-2 text-3xl font-extrabold font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
        {value}
      </p>
      <p className="mt-2 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
        {subtitle}
      </p>
    </div>
  );
}

