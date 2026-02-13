'use client';

import { supabase } from '@/utils/supabase';

export async function adminFetch(input: string, init?: RequestInit) {
  const buildHeaders = (token: string | null) => {
    const headers = new Headers(init?.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);

    // Only default Content-Type for JSON-string bodies.
    // (Do NOT set it for FormData; the browser will set boundary.)
    if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  };

  const doFetch = (token: string | null) =>
    fetch(input, {
      ...init,
      headers: buildHeaders(token),
    });

  // Get current session (without refresh)
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;

  // If no token at all, return 401
  if (!token) {
    return new Response(JSON.stringify({ error: 'No authentication token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // First attempt with existing token
  const res = await doFetch(token);
  
  // Only retry if we get 401 (token expired)
  if (res.status === 401) {
    // Try to refresh the session once
    const refreshed = await supabase.auth.refreshSession();
    const nextToken = refreshed.data.session?.access_token ?? null;
    
    if (nextToken && nextToken !== token) {
      // Retry with new token
      return doFetch(nextToken);
    }
  }

  return res;
}

