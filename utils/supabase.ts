import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

let supabaseInstance: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  // Si ya existe una instancia, retornarla
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validar variables de entorno solo cuando se necesite crear el cliente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si no hay variables de entorno, usar cliente placeholder (build, SSR y cliente)
  // Evita que React Refresh / HMR fallen al inspeccionar el módulo y que la app devuelva 500
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      logger.error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Configure them in Replit Secrets or .env.local. Using placeholder client.'
      );
    }
    supabaseInstance = createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
    return supabaseInstance;
  }

  // Crear el cliente real
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'supabase.auth.token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    logger.error('Error creating Supabase client:', error);
    throw error;
  }

  return supabaseInstance;
};

// Crear un objeto proxy que inicializa el cliente de forma lazy
// Esto evita que se ejecute la validación durante el build
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    try {
      const client = getSupabaseClient();
      const value = (client as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    } catch (error) {
      // En caso de error, loguear y re-lanzar
      logger.error('Error accessing Supabase property:', prop, error);
      throw error;
    }
  },
  has(_target, prop: string | symbol) {
    try {
      const client = getSupabaseClient();
      return prop in client;
    } catch {
      return false;
    }
  },
}); 