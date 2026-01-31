'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (isLoading) return;
      if (!user) {
        router.replace('/admin/login');
        return;
      }

      setChecking(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          setAllowed(false);
          setError('No se pudo validar permisos');
          return;
        }

        if (data?.role !== 'admin') {
          setAllowed(false);
          setError('No autorizado');
          return;
        }

        setAllowed(true);
      } finally {
        setChecking(false);
      }
    };

    void run();
  }, [isLoading, user, router]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#100235' }}>
        <div className="text-white font-[var(--font-dm-sans)]">Cargando...</div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#100235' }}>
        <div className="max-w-md w-full rounded-2xl border p-6 text-center" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(15, 17, 23, 0.6)' }}>
          <h1 className="text-xl font-bold mb-2 font-[var(--font-comfortaa)] text-white">Acceso restringido</h1>
          <p className="text-sm mb-4 font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
            {error || 'No autorizado'}
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg font-semibold text-sm"
            style={{ background: '#FFB200', color: '#0F1117' }}
            onClick={() => router.replace('/')}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

