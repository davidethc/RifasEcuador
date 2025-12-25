import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PageContainer } from '@/shared/components/layout/PageContainer';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase maneja automáticamente el callback y actualiza la sesión
        // Solo necesitamos obtener la sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          navigate('/login?error=auth-failed');
          return;
        }

        if (session && session.user) {
          setSession(session);
          setUser(session.user);
          setLoading(false);

          // Limpiar el hash de la URL si existe
          if (window.location.hash) {
            window.history.replaceState({}, document.title, '/auth/callback');
          }

          // Redirigir al home
          setTimeout(() => {
            navigate('/');
          }, 500);
        } else {
          // Si no hay sesión, esperar un momento y verificar de nuevo
          // (a veces Supabase necesita un momento para procesar)
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession && retrySession.user) {
              setSession(retrySession);
              setUser(retrySession.user);
              setLoading(false);
              navigate('/');
            } else {
              navigate('/login?error=no-session');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=auth-failed');
      }
    };

    handleAuthCallback();
  }, [navigate, setUser, setSession, setLoading]);

  return (
    <PageContainer>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Procesando autenticación...</CardTitle>
          <CardDescription>
            Por favor espera mientras completamos tu inicio de sesión
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
