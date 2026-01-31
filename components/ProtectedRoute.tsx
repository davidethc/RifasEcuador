'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/verify-email', '/reset-password', '/update-password', '/como-jugar', '/terminos', '/sorteos', '/contacto', '/soporte', '/faq', '/privacidad'];

// Function to check if a route is public (includes dynamic routes like /sorteos/[id])
const isPublicRoute = (pathname: string): boolean => {
  // Check exact matches first
  if (publicRoutes.includes(pathname)) return true;

  // Admin section: auth is handled by AdminGuard; avoid redirecting to main /login
  // so admin.altokeec.com/admin/login doesn't flicker/redirect loop
  if (pathname.startsWith('/admin')) return true;

  // Check if it's a sorteo detail page (matches /sorteos/[any-id])
  if (pathname.startsWith('/sorteos/')) return true;

  // Comprar pages are public - allow guest checkout (no authentication required)
  // Includes: /comprar/[id], /comprar/[id]/confirmacion, /comprar/error
  if (pathname.startsWith('/comprar/')) return true;

  return false;
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if still loading or on a public route
    if (isLoading || isPublicRoute(pathname)) return;

    // If no user is logged in and we're not on a public route, redirect to login
    if (!user) {
      router.replace('/login');
    }
  }, [user, isLoading, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  // If on a public route or user is authenticated, render children
  if (isPublicRoute(pathname) || user) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
} 