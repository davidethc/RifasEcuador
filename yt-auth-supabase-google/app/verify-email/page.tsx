'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [countdown, setCountdown] = useState(60);

  // Redirect if user is already verified
  useEffect(() => {
    if (user?.email_confirmed_at) {
      router.replace('/');
    }
  }, [user, router]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    // Reset countdown
    setCountdown(60);
    // TODO: Implement resend verification email logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-6 bg-white dark:bg-legacy-purple-deep rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Revisa tu correo
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enviamos un enlace de verificación a{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>

          <div className="mt-8 space-y-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Revisa tu correo y haz clic en el enlace de verificación para continuar.</p>
            <p className="mt-2 text-xs">
              El correo puede tardar unos minutos. Revisa también la carpeta de <strong>spam</strong> o correo no deseado.
            </p>
            <p className="mt-4">
              ¿No llegó el correo? Puedes solicitar uno nuevo{' '}
              {countdown > 0 ? (
                <span>en {countdown} segundos</span>
              ) : (
                <button
                  onClick={handleResendEmail}
                  className="text-blue-600 dark:text-amber-400 hover:text-blue-500 dark:hover:text-amber-500 transition-colors"
                >
                  ahora
                </button>
              )}
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 dark:text-amber-400 hover:text-blue-500 dark:hover:text-amber-500 transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
