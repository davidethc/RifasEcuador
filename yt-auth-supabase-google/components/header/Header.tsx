"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/animated-button";

/**
 * Header principal de la aplicación
 * Incluye logo, navegación y botones de acción
 * Muestra "Mis boletos" y nombre del usuario cuando está autenticado
 */
export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isMenuOpenRef = useRef(isMenuOpen);

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Cómo jugar", href: "/como-jugar" },
    { label: "Términos y condiciones", href: "/terminos" },
  ];

  const isAuthenticated = !!user;

  // Obtener nombre del usuario
  const getUserName = () => {
    if (!user) return null;
    
    // Intentar obtener el nombre de user_metadata
    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name ||
                     user.user_metadata?.display_name;
    
    if (fullName) return fullName;
    
    // Si no hay nombre, usar el email sin el dominio
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Usuario';
  };

  const userName = getUserName();

  // Actualizar ref cuando isMenuOpen cambie
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      
      // Verificar si el clic fue fuera del menú móvil y del botón hamburguesa
      const clickedMenuButton = menuButtonRef.current && menuButtonRef.current.contains(target);
      const clickedMenuContent = menuRef.current && menuRef.current.contains(target);
      
      if (!clickedMenuButton && !clickedMenuContent && isMenuOpenRef.current) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsDropdownOpen(false);
    router.replace('/login');
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group flex-shrink-0">
            <div className="relative h-12 w-auto md:h-16 lg:h-20 aspect-[2/1] transition-transform group-hover:scale-105">
              <Image
                src="/logo922.png"
                alt="La Cima Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors font-[var(--font-dm-sans)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Botones de acción Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/mis-boletos"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-amber-400 transition-colors font-[var(--font-dm-sans)]"
                >
                  Mis boletos
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-amber-400 flex items-center justify-center text-white dark:text-gray-900 font-semibold text-sm">
                      {userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
                      {userName}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                      <Link
                        href="/perfil"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-[var(--font-dm-sans)]"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-[var(--font-dm-sans)]"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-[var(--font-dm-sans)]"
                >
                  Iniciar Sesión
                </Link>
                <AnimatedButton
                  onClick={() => router.push('/sorteos/3b1f1182-ce6b-42cb-802c-a1537fe59c0e')}
                  className="px-6 py-2 text-sm font-bold text-white bg-blue-600 dark:bg-amber-400 font-[var(--font-dm-sans)]"
                  variant="default"
                  size="default"
                  glow={true}
                  textEffect="normal"
                  uppercase={false}
                  rounded="custom"
                  asChild={false}
                  hideAnimations={false}
                  shimmerColor="#39FF14"
                  shimmerSize="0.15em"
                  shimmerDuration="3s"
                  borderRadius="8px"
                  background="rgb(37 99 235)"
                >
                  Comprar boletos ahora
                </AnimatedButton>
              </>
            )}
          </div>

          {/* Menú móvil */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <Link
                href="/mis-boletos"
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-[var(--font-dm-sans)]"
              >
                Mis boletos
              </Link>
            )}
            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div ref={menuRef} className="md:hidden pb-4 pt-2 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-[var(--font-dm-sans)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-base font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center font-[var(--font-dm-sans)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <AnimatedButton
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/sorteos/3b1f1182-ce6b-42cb-802c-a1537fe59c0e');
                  }}
                    className="px-4 py-2 text-base font-bold text-white bg-blue-600 dark:bg-amber-400 text-center font-[var(--font-dm-sans)]"
                    variant="default"
                    size="default"
                    glow={true}
                    textEffect="normal"
                    uppercase={false}
                    rounded="custom"
                    asChild={false}
                    hideAnimations={false}
                    shimmerColor="#39FF14"
                    shimmerSize="0.15em"
                    shimmerDuration="3s"
                    borderRadius="8px"
                    background="rgb(37 99 235)"
                  >
                    Comprar boletos ahora
                  </AnimatedButton>
                </>
              )}
              {isAuthenticated && (
                <div className="px-4 py-2 flex items-center gap-3 border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-amber-400 flex items-center justify-center text-white dark:text-gray-900 font-semibold">
                    {userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-[var(--font-dm-sans)]">
                      {user?.email}
                    </p>
                  </div>
                </div>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 text-base font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-center font-[var(--font-dm-sans)]"
                >
                  Cerrar Sesión
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
