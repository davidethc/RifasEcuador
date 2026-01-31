import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Subdomain routing:
 * - `admin.*` (ej. admin.altokeec.com) → sirve /admin/*.
 * - Cualquier otro host (altokeec.com, *.vercel.app, localhost) → sitio normal, sin rewrite.
 * - Auth (/auth/*) y API (/api/*) siempre pasan.
 *
 * Hosts permitidos para que el preview de Vercel no salga en blanco:
 * - altokeec.com, admin.altokeec.com, *.vercel.app, localhost
 * Si añades lógica de "solo permitir X host", incluye siempre *.vercel.app.
 */
const ALLOWED_HOST_PATTERNS = ['altokeec.com', 'admin.', 'localhost', '.vercel.app'];

function isAllowedHost(host: string): boolean {
  if (!host) return true;
  return ALLOWED_HOST_PATTERNS.some(
    (p) => host === p || host.startsWith(p) || (p.startsWith('.') && host.endsWith(p))
  );
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isAdminHost = host.startsWith('admin.');
  const isProd = process.env.NODE_ENV === 'production';

  // Sitio normal: altokeec.com, *.vercel.app (preview), localhost, etc.
  // No bloqueamos por host; isAllowedHost documenta los permitidos (p. ej. para preview).
  if (!isAdminHost) {
    // Hard-separation in PROD only: keep /admin only on admin subdomain
    // In DEV we allow /admin on localhost for easier local testing.
    if (isProd && request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Never rewrite internal/assets, APIs or auth callback routes.
  const passthroughPrefixes = ['/api', '/auth', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'];
  if (passthroughPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Rutas de auth que existen en app/ (verify-email, login, reset-password, etc.).
  // Si las reescribimos a /admin/verify-email no existe esa página → 404 en producción.
  const authPaths = ['/verify-email', '/login', '/reset-password', '/update-password'];
  if (authPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Public files in /public (avoid rewriting assets like png/jpg/json/etc.)
  // Example: /logosrifaweb.png, /manifest.json
  const lastSegment = pathname.split('/').pop() || '';
  if (lastSegment.includes('.')) {
    return NextResponse.next();
  }

  // Already under /admin
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/admin' : `/admin${pathname}`;

  // DEV: redirect (avoids missing /_next assets when serving rewritten routes)
  // PROD: rewrite keeps clean URLs on admin subdomain.
  if (!isProd) {
    return NextResponse.redirect(url);
  }

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};

