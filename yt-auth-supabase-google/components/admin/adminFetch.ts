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

  const { data } = await supabase.auth.getSession();
  let token = data.session?.access_token ?? null;

  // If missing/expired, try refresh once (keeps UX simple)
  if (!token) {
    const refreshed = await supabase.auth.refreshSession();
    token = refreshed.data.session?.access_token ?? null;
  }

  // First attempt
  const res = await doFetch(token);
  if (res.status !== 401) return res;

  // If token exists but is expired/invalid, refresh + retry once
  const refreshed = await supabase.auth.refreshSession();
  const nextToken = refreshed.data.session?.access_token ?? null;
  if (!nextToken || nextToken === token) return res;

  return doFetch(nextToken);
}

