import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { cn } from '@/shared/lib/utils';
import { spacing } from '@/shared/lib/constants';
import logo from '@/assets/logo.png';

export function Header() {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="bg-background/95 backdrop-blur-md sticky top-0 z-50 border-b border-border/50 shadow-sm">
      <nav className={cn('container mx-auto', spacing.container)}>
        <div className="flex items-center justify-between h-20">
          {/* Sección izquierda: Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img 
                src={logo} 
                alt="Rifa" 
                className="w-[60px] h-[50px] md:w-[70px] md:h-[60px] object-contain"
              />
            </Link>
          </div>

          {/* Sección central: Navegación principal (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 relative group"
              aria-label="Ir al inicio"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4" />
            </Link>
            <Link
              to="/como-jugar"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 relative group"
              aria-label="Ver cómo jugar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cómo jugar
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4" />
            </Link>
            <Link
              to="/terminos-y-condiciones"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 relative group"
              aria-label="Ver términos y condiciones"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Términos y condiciones
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4" />
            </Link>
          </div>

          {/* Sección derecha: Usuario y acciones */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Botón menú móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>

            {isAuthenticated ? (
              <>
                {/* Mis Boletos - Visible en desktop */}
                <Link
                  to="/my-tickets"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z" />
                  </svg>
                  Mis Boletos
                </Link>
                
                {/* Usuario y acciones */}
                <div className="flex items-center gap-3">
                  {/* Avatar/Nombre del usuario - Solo en desktop grande */}
                  <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground/80">
                      {userName}
                    </span>
                  </div>
                  
                  {/* Botón Cerrar Sesión con confirmación */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        aria-label="Cerrar sesión"
                      >
                        Salir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Estás a punto de cerrar tu sesión. ¿Estás seguro de que deseas continuar?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut}>
                          Cerrar sesión
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-foreground/80 hover:text-primary hover:bg-primary/5">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="text-xs sm:text-sm font-semibold">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 mt-2 pt-4 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-foreground/90 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </Link>
            <Link
              to="/como-jugar"
              className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-foreground/90 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cómo jugar
            </Link>
            <Link
              to="/terminos-y-condiciones"
              className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-foreground/90 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Términos y condiciones
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/my-tickets"
                  className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-foreground/90 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z" />
                  </svg>
                  Mis Boletos
                </Link>
                <div className="px-4 py-3 border-t border-border/50 mt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground/80">
                      {userName}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
