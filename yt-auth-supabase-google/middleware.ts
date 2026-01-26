import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Subdomain routing:
 * - `admin.*` should serve `/admin/*` pages.
 * - Keep auth (`/auth/*`) and API (`/api/*`) paths intact.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const isAdminHost = host.startsWith('admin.');
  const isProd = process.env.NODE_ENV === 'production';

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

