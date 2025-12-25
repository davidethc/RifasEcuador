import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { supabase } from '@/shared/lib/supabase';

export function VerifyEmailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || user?.email || '';
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Redirigir si el usuario ya está verificado
  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate('/');
    }
  }, [user, navigate]);

  // Countdown timer para reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      setResendSuccess(true);
      setCountdown(60); // Reiniciar countdown
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reenviar el email';
      setResendError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <PageContainer>
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Email no encontrado</CardTitle>
              <CardDescription className="text-center">
                No se pudo obtener la dirección de correo electrónico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/register">
                <Button className="w-full">Volver al registro</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Confirma tu correo electrónico</CardTitle>
            <CardDescription>
              Hemos enviado un enlace de verificación a{' '}
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instrucciones */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Sigue estos pasos:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Revisa tu bandeja de entrada (y la carpeta de spam si no lo encuentras)</li>
                <li>Haz clic en el enlace de verificación del email</li>
                <li>Serás redirigido automáticamente para poder iniciar sesión</li>
              </ol>
            </div>

            {/* Mensajes de éxito/error al reenviar */}
            {resendSuccess && (
              <div className="bg-green-500/15 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-md border border-green-500/20">
                ✓ Email reenviado exitosamente. Revisa tu bandeja de entrada.
              </div>
            )}

            {resendError && (
              <div className="bg-destructive/15 text-destructive text-sm px-4 py-3 rounded-md border border-destructive/20">
                {resendError}
              </div>
            )}

            {/* Botón de reenvío */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                ¿No recibiste el email?
              </p>
              <Button
                onClick={handleResendEmail}
                disabled={countdown > 0 || isResending}
                variant="outline"
                className="w-full"
              >
                {isResending
                  ? 'Reenviando...'
                  : countdown > 0
                  ? `Reenviar en ${countdown}s`
                  : 'Reenviar email de verificación'}
              </Button>
            </div>

            {/* Enlaces de navegación */}
            <div className="pt-4 border-t space-y-2">
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  ← Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

