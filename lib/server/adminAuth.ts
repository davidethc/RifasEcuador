import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

export async function requireAdminFromRequest(request: Request): Promise<AdminAuthResult> {
  const token = extractBearerToken(request.headers.get('authorization'));
  if (!token) return { ok: false, status: 401, error: 'Missing Authorization Bearer token' };

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) {
    return { ok: false, status: 401, error: 'Invalid or expired session' };
  }

  const userId = data.user.id;

  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleError) {
    return { ok: false, status: 500, error: 'Error checking admin role' };
  }

  if (roleRow?.role !== 'admin') {
    return { ok: false, status: 403, error: 'Not authorized' };
  }

  return { ok: true, userId };
}

