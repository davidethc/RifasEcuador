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

    // Simple near-real-time refresh (keeps UX simple, no websockets)
    const id = window.setInterval(() => {
      void fetchDashboard(true);
    }, 15000); // 15s

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const m = data?.metrics;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-white font-[var(--font-comfortaa)]">Dashboard</h1>
        <div className="flex items-center gap-3">
          {lastUpdatedAt && (
            <span className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              Actualizado: {lastUpdatedAt}
            </span>
          )}
          <button
            type="button"
            onClick={() => void fetchDashboard(true)}
            disabled={loading || refreshing}
            className="px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.10)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {refreshing ? 'Actualizando…' : 'Refrescar'}
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
          <StatCard title="Boletos vendidos" value={`${m.soldTickets}`} subtitle={`Total: ${m.totalTickets}`} />
          <StatCard title="Reservados" value={`${m.reservedTickets}`} subtitle={`Disponibles: ${m.availableTickets}`} />
          <StatCard
            title="Recaudación"
            value={`$${m.totalRevenue.toFixed(2)}`}
            subtitle={`Payphone: $${m.revenuePayphone.toFixed(2)} · Transfer: $${m.revenueTransfer.toFixed(2)} · Pendientes transfer: ${m.pendingTransfers}`}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
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
      <p className="mt-2 text-3xl font-extrabold font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
        {value}
      </p>
      <p className="mt-2 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
        {subtitle}
      </p>
    </div>
  );
}

