'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialInput } from './ui/MaterialInput';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const { supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password#`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="rounded-2xl p-6 max-w-md w-full border" style={{ 
        background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
        borderColor: '#3A2F5A',
        boxShadow: '0 20px 60px rgba(168, 62, 245, 0.3), 0 0 40px rgba(240, 32, 128, 0.2)'
      }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#FFFFFF' }}>Restablecer contraseña</h2>

        {success ? (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: '#E5D4FF' }}>
              Se ha enviado un enlace de restablecimiento a tu correo electrónico. Por favor revisa tu bandeja de entrada.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 text-white rounded-xl transition-colors font-[var(--font-dm-sans)] font-semibold"
              style={{ background: 'linear-gradient(135deg, #A83EF5 0%, #f02080 100%)', boxShadow: '0 4px 20px rgba(168, 62, 245, 0.4), 0 0 30px rgba(240, 32, 128, 0.2)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f02080 0%, #A83EF5 100%)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(168, 62, 245, 0.5), 0 0 40px rgba(240, 32, 128, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #A83EF5 0%, #f02080 100%)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(168, 62, 245, 0.4), 0 0 30px rgba(240, 32, 128, 0.2)';
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <MaterialInput
              id="email"
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="tu@email.com"
              required
              error={error}
              variant="outlined"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 transition-colors font-[var(--font-dm-sans)] rounded-xl"
                style={{ color: '#E5D4FF' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#E5D4FF';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="py-3 px-4 text-white rounded-xl disabled:opacity-50 transition-colors font-[var(--font-dm-sans)] font-semibold"
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
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 