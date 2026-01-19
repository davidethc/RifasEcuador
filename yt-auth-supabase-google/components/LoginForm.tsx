'use client';

import { useState } from 'react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { MaterialInput } from './ui/MaterialInput';

interface LoginFormProps {
  onSubmit: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function LoginForm({ 
  onSubmit, 
  onGoogleSignIn, 
  isLoading, 
  error 
}: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password, isSignUp);
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 md:p-10 rounded-2xl border" style={{ 
      background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
      borderColor: '#3A2F5A',
      boxShadow: '0 20px 60px rgba(168, 62, 245, 0.2), 0 0 40px rgba(240, 32, 128, 0.1)'
    }}>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>
      </div>

      {error && (
        <div className="p-3 rounded-lg border" style={{ background: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)' }}>
          <p className="text-sm text-[#DC2626] text-center font-[var(--font-dm-sans)]">
          {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" aria-label={isSignUp ? "Formulario de registro" : "Formulario de inicio de sesión"}>
        <div className="space-y-6">
          <MaterialInput
            id="email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tu@email.com"
            required
            variant="outlined"
          />
          <MaterialInput
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
            variant="outlined"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className="text-sm font-medium transition-colors font-[var(--font-dm-sans)]"
            style={{ color: '#A83EF5' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f02080';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A83EF5';
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <ForgotPasswordModal 
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3 px-4 border border-transparent rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] font-bold text-base font-[var(--font-dm-sans)]"
          style={{ 
            background: 'linear-gradient(135deg, #A83EF5 0%, #f02080 100%)',
            boxShadow: '0 4px 20px rgba(168, 62, 245, 0.4), 0 0 30px rgba(240, 32, 128, 0.2)',
            fontWeight: '600'
          }}
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
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
            </span>
          ) : (
            <span>{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</span>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium transition-colors font-[var(--font-dm-sans)]"
            style={{ color: '#E5D4FF' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#A83EF5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#E5D4FF';
            }}
          >
            {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión' : '¿Necesitas una cuenta? Regístrate'}
          </button>
        </div>
      </form>

      {/* Separador */}
      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: '#3A2F5A' }}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4" style={{ background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)', color: '#B8A8D8' }}>O continúa con</span>
        </div>
      </div>

      {/* Botón de Google mejorado */}
      <div className="mt-6">
        <button
          onClick={onGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A83EF5] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold text-base font-[var(--font-dm-sans)] flex items-center justify-center gap-3"
          style={{ 
            borderColor: '#3A2F5A',
            color: '#FFFFFF',
            background: 'transparent'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.borderColor = '#5A4A7A';
              e.currentTarget.style.background = 'rgba(168, 62, 245, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#3A2F5A';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>
      </div>
    </div>
  );
}
