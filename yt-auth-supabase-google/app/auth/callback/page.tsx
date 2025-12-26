'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

/**
 * Página de callback para manejar la autenticación OAuth
 * Procesa los tokens del hash de la URL y redirige al usuario
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Verificar si hay un código en la query string (método preferido)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          // Si hay código, intercambiarlo por sesión
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error al intercambiar código:', error);
            router.replace('/login?error=auth-failed');
            return;
          }

          if (data?.session) {
            // Limpiar la URL
            window.history.replaceState({}, document.title, window.location.pathname);
            router.replace('/');
            return;
          }
        }

        // Si no hay código, verificar si hay tokens en el hash
        // Supabase debería detectarlos automáticamente con detectSessionInUrl
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error al obtener sesión:', error);
          router.replace('/login?error=auth-failed');
          return;
        }

        if (session) {
          // Limpiar el hash de la URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Redirigir al inicio
          router.replace('/');
        } else {
          // Esperar un momento para que Supabase procese el hash
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              window.history.replaceState({}, document.title, window.location.pathname);
              router.replace('/');
            } else {
              router.replace('/login?error=no-session');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error en callback de autenticación:', error);
        router.replace('/login?error=auth-failed');
      }
    }

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-accent-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
          Procesando autenticación...
        </p>
      </div>
    </div>
  );
}

