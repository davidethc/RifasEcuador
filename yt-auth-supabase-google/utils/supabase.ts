import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  // Si ya existe una instancia, retornarla
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validar variables de entorno solo cuando se necesite crear el cliente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Durante el build (SSR), si no hay variables de entorno, crear un cliente placeholder
  // Esto permite que el build continúe sin errores
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Build time: crear cliente placeholder
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
    // Runtime en cliente: lanzar error
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }

  // Crear el cliente real
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'supabase.auth.token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  });

  return supabaseInstance;
};

// Crear un objeto proxy que inicializa el cliente de forma lazy
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const client = getSupabaseClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
}); 