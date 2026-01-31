import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      // ⚠️ ATENCIÓN: Usar logger en lugar de console.error para consistencia con el resto del proyecto
      // Solo loguear errores en desarrollo
      // TODO: Reemplazar console.error con logger.error
      if (process.env.NODE_ENV === 'development') {
        console.error('AuthCallback: Error:', error);
      }
      return NextResponse.redirect(new URL('/login?error=auth-failed', requestUrl.origin));
    }

    // Ensure profile exists
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { 
            id: data.user.id,
            email: data.user.email,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );

      // ⚠️ ATENCIÓN: Usar logger en lugar de console.error para consistencia con el resto del proyecto
      // TODO: Reemplazar console.error con logger.error
      if (profileError && process.env.NODE_ENV === 'development') {
        console.error('Profile creation error:', profileError);
      }
    }

    if (next) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin));
} 