'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const hasRedirectedToAdmin = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Redirigir solo si hay usuario y no hemos redirigido ya (evita rebotes)
      if (user && !hasRedirectedToAdmin.current) {
        hasRedirectedToAdmin.current = true;
        router.replace('/admin');
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [user, router]);

  const handleSubmit = async (email: string, password: string, isSignUp: boolean) => {
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await signUpWithEmail(email, password);
        if (error) throw error;

        if (data?.user && !data.user.email_confirmed_at) {
          router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }

        hasRedirectedToAdmin.current = true;
        router.replace('/admin');
      } else {
        await signInWithEmail(email, password);
        hasRedirectedToAdmin.current = true;
        router.replace('/admin');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#100235' }}>
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" aria-label="Admin login" style={{
      background: 'linear-gradient(180deg, #1F1A2E 0%, #2A1F3D 20%, #2D2140 40%, #2A1F3D 60%, #1F1A2E 100%)',
      backgroundAttachment: 'fixed',
    }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[400px] rounded-full blur-[120px] opacity-10" style={{
          background: 'radial-gradient(circle, rgba(168, 62, 245, 0.4) 0%, transparent 70%)',
        }} />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[350px] rounded-full blur-[100px] opacity-8" style={{
          background: 'radial-gradient(circle, rgba(240, 32, 128, 0.3) 0%, transparent 70%)',
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <LoginForm onSubmit={handleSubmit} onGoogleSignIn={signInWithGoogle} isLoading={isLoading} error={error} />
      </div>
    </main>
  );
}

