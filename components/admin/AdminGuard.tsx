'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Cache global para evitar múltiples verificaciones
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minuto

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRedirectedToLogin = useRef(false);
  const lastCheckedUserId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const currentUserId = user?.id || null;
      console.log('[AdminGuard] Starting check...', { 
        isLoading, 
        hasUser: !!user, 
        currentUserId,
        lastCheckedUserId: lastCheckedUserId.current 
      });
      
      // Wait for auth to be ready
      if (isLoading) {
        console.log('[AdminGuard] Auth still loading, waiting...');
        return;
      }

      // Evitar múltiples redirecciones en rebote
      if (hasRedirectedToLogin.current) {
        console.log('[AdminGuard] Already redirected to login, skipping');
        return;
      }

      // Evitar verificar el mismo usuario múltiples veces
      if (currentUserId && lastCheckedUserId.current === currentUserId) {
        console.log('[AdminGuard] Already checked this user, skipping');
        return;
      }

      // Check if we have a user
      if (!user) {
        console.log('[AdminGuard] No user in context, checking session...');
        // Only redirect if we're sure there's no session
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        
        console.log('[AdminGuard] Session check result:', { hasSession: !!data.session, hasUser: !!data.session?.user });
        
        if (!data.session?.user) {
          console.log('[AdminGuard] No session found, redirecting to login');
          hasRedirectedToLogin.current = true;
          router.replace('/admin/login');
          return;
        }
      }

      const currentUser = user;
      if (!currentUser) {
        console.log('[AdminGuard] No current user after checks, aborting');
        return;
      }

      console.log('[AdminGuard] User found:', currentUser.email, 'ID:', currentUser.id);

      // Verificar cache primero
      const cached = roleCache.get(currentUser.id);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('[AdminGuard] Using cached role:', cached.role);
        lastCheckedUserId.current = currentUser.id; // Marcar como verificado desde cache
        if (cached.role === 'admin') {
          setAllowed(true);
          setChecking(false);
          return;
        } else {
          setAllowed(false);
          setError('No autorizado - no tienes rol de administrador');
          setChecking(false);
          return;
        }
      }

      setChecking(true);
      setError(null);
      try {
        console.log('[AdminGuard] Checking user_roles for user:', currentUser.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (cancelled) return;
        
        console.log('[AdminGuard] user_roles query result:', { data, error });
        
        if (error) {
          console.error('[AdminGuard] Error checking admin role:', error);
          lastCheckedUserId.current = currentUser.id; // Marcar como verificado incluso si falla
          setAllowed(false);
          setError('No se pudo validar permisos');
          return;
        }

        if (data?.role !== 'admin') {
          console.error('[AdminGuard] User is not admin. Role:', data?.role);
          // Cache el resultado negativo también
          roleCache.set(currentUser.id, { role: data?.role || 'none', timestamp: Date.now() });
          lastCheckedUserId.current = currentUser.id; // Marcar como verificado
          setAllowed(false);
          setError('No autorizado - no tienes rol de administrador');
          return;
        }

        console.log('[AdminGuard] ✅ User is admin, granting access');
        // Cache el resultado positivo
        roleCache.set(currentUser.id, { role: 'admin', timestamp: Date.now() });
        lastCheckedUserId.current = currentUser.id; // Marcar como verificado DESPUÉS de confirmar admin
        setAllowed(true);
      } catch (err) {
        console.error('[AdminGuard] Unexpected error:', err);
        lastCheckedUserId.current = currentUser.id; // Marcar como verificado incluso si hay excepción
        setAllowed(false);
        setError('Error inesperado al validar permisos');
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [isLoading, user?.id, router]); // Solo reaccionar cuando cambie el USER ID, no el objeto completo

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

