'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MaterialInput } from '@/components/ui/MaterialInput';

export default function UpdatePasswordPage() {
  const { supabase } = useAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we have a valid hash in the URL (indicates password reset flow)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }).then(({ error }) => {
          if (error) {
            setError('Failed to set session');
          }
        });
      } else {
        setError('Invalid recovery link');
      }
    } else {
      setError('Auth session missing!');
    }
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
      // Redirect to login after successful password update
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #1F1A2E 0%, #2A1F3D 20%, #2D2140 40%, #2A1F3D 60%, #1F1A2E 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay sutil con colores vibrantes del logo - estilo Apple */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[400px] rounded-full blur-[120px] opacity-10" style={{ 
          background: 'radial-gradient(circle, rgba(168, 62, 245, 0.4) 0%, transparent 70%)'
        }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[350px] rounded-full blur-[100px] opacity-8" style={{ 
          background: 'radial-gradient(circle, rgba(240, 32, 128, 0.3) 0%, transparent 70%)'
        }}></div>
      </div>
      <div className="max-w-md w-full space-y-8 rounded-2xl p-8 border relative z-10" style={{ 
        background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
        borderColor: '#3A2F5A',
        boxShadow: '0 20px 60px rgba(168, 62, 245, 0.2), 0 0 40px rgba(240, 32, 128, 0.1)'
      }}>
        <div className="text-center">
          <h2 className="text-3xl font-bold font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>Actualizar contraseña</h2>
          <p className="mt-2 font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
            Ingresa tu nueva contraseña
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl border" style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl border" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' }}>
            ¡Contraseña actualizada exitosamente! Redirigiendo al inicio de sesión...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-6">
              <MaterialInput
                id="newPassword"
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Ingresa tu nueva contraseña"
                required
                variant="outlined"
                helperText="Mínimo 6 caracteres"
              />
              <MaterialInput
                id="confirmPassword"
                label="Confirma la contraseña"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirma tu nueva contraseña"
                required
                error={newPassword !== confirmPassword && confirmPassword.length > 0 ? 'Las contraseñas no coinciden' : undefined}
                variant="outlined"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-white disabled:opacity-50 transition-colors font-[var(--font-dm-sans)] font-semibold"
              style={{ background: 'linear-gradient(135deg, #A83EF5 0%, #f02080 100%)', boxShadow: '0 4px 20px rgba(168, 62, 245, 0.4), 0 0 30px rgba(240, 32, 128, 0.2)' }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f02080 0%, #A83EF5 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(168, 62, 245, 0.5), 0 0 40px rgba(240, 32, 128, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #A83EF5 0%, #f02080 100%)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(168, 62, 245, 0.4), 0 0 30px rgba(240, 32, 128, 0.2)';
              }}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 