import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { supabase } from '@/shared/lib/supabase';
import type { SignInCredentials, SignUpCredentials } from '../types/auth.types';

export function useAuth() {
  const { user, session, isLoading, error, setUser, setSession, setLoading, setError, reset } = useAuthStore();

  // Inicializar y escuchar cambios de auth
  useEffect(() => {
    // Obtener sesión inicial
    authService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading]);

  const signIn = async (credentials: SignInCredentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.signInWithEmail(credentials);
      
      // Actualizar estado inmediatamente si hay sesión
      if (response?.data?.user && response?.data?.session) {
        setUser(response.data.user);
        setSession(response.data.session);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.signUpWithEmail(credentials);
      
      // Si hay usuario en la respuesta, actualizar el estado
      if (response?.data?.user) {
        setUser(response.data.user);
        if (response.data.session) {
          setSession(response.data.session);
        }
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await authService.signInWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
      setError(errorMessage);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMessage);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al resetear contraseña';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAuthenticated: !!user && !!session,
  };
}
