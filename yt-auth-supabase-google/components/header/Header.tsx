"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/animated-button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Header principal de la aplicación usando Lamphome estilizado
 * Incluye logo, navegación y botones de acción
 * Muestra "Mis boletos" y nombre del usuario cuando está autenticado
 */
export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Sorteos", href: "/sorteos" },
    { label: "Cómo jugar", href: "/como-jugar" },
    { label: "Términos y condiciones", href: "/terminos" },
  ];

  const isAuthenticated = !!user;

  // Obtener nombre del usuario
  const getUserName = () => {
    if (!user) return null;

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.display_name;

    if (fullName) return fullName;

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "Usuario";
  };

  const userName = getUserName();

  // Estado para el ancho de la ventana
  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Truncar nombre si es muy largo para desktop
  const getDisplayName = (name: string | null) => {
    if (!name) return "Usuario";
    const maxLength = windowWidth >= 1024 ? 15 : 10;
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsDropdownOpen(false);
    router.replace("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col items-center justify-start pt-1 [@media(min-width:480px)]:pt-2 [@media(min-width:768px)]:pt-3 [@media(min-width:1024px)]:pt-4 transition-all duration-500">
      <motion.div
        ref={navBarRef}
        initial={{ width: "95%" }}
        animate={{ width: "95%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex items-center justify-between w-full max-w-7xl h-auto py-3 px-4 md:px-6 border border-white/20 rounded-full transition-all duration-300 bg-gradient-to-r from-[#1e1b4b] via-[#4c1d95] via-[#be185d] to-[#ea580c] backdrop-blur-xl shadow-lg shadow-purple-500/30"
      >
        {/* Logo Desktop */}
        <div className="flex-shrink-0 hidden sm:block">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logosrifaweb.png"
              alt="ALTOKEE"
              width={180}
              height={72}
              className="w-auto h-14 md:h-[4.5rem] object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
            {/* Texto eliminado en desktop para dar prioridad al logo gráfico más grande */}
            <span className="font-space-grotesk text-2xl font-medium tracking-[0.25em] text-gray-100 uppercase group-hover:text-white transition-colors hidden lg:block">
              Altokee
            </span>
          </Link>
        </div>

        {/* Logo + Texto - Mobile */}
        <div className={`sm:hidden flex items-center flex-1 min-w-0 px-2 transition-all duration-300 ${mobileMenuOpen ? 'justify-start' : 'justify-center'}`}>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logosrifaweb.png"
              alt="ALTOKEE"
              width={140}
              height={56}
              className="w-auto h-11 object-contain"
              priority
            />
            <span
              className={`font-space-grotesk text-lg font-medium tracking-[0.2em] text-gray-100 uppercase whitespace-nowrap transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}
            >
              Altokee
            </span>
          </Link>
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden sm:flex items-center gap-5 lg:gap-8">
          {navLinks.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-sm lg:text-base font-dm-sans font-medium text-gray-300 hover:text-white transition-colors relative group py-1 tracking-wide"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#A83EF5] to-[#f02080] group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
          ))}
        </nav>

        {/* Botones de acción Desktop */}
        <div className="hidden sm:flex items-center gap-3 md:gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/mis-boletos"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-dm-sans whitespace-nowrap"
              >
                Mis boletos
              </Link>
              <button
                onClick={() => router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e")}
                className="px-5 lg:px-6 py-2.5 text-sm font-bold text-slate-900 rounded-full transition-all duration-200 font-dm-sans hover:-translate-y-0.5 whitespace-nowrap shadow-lg shadow-white/10 hover:shadow-white/20 bg-white hover:bg-gray-100"
              >
                <span className="hidden lg:inline">Participar - Desde $1.00</span>
                <span className="lg:hidden">Participar</span>
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 bg-gradient-to-br from-[#A83EF5] to-[#f02080] text-white">
                    {userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium font-dm-sans max-w-[100px] truncate text-gray-200">
                    {getDisplayName(userName)}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform flex-shrink-0 text-gray-400 ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-2 border z-50 backdrop-blur-xl bg-[#100235]/95 border-purple-500/30 shadow-purple-900/40">
                    <Link
                      href="/perfil"
                      className="block px-4 py-2.5 text-sm transition-all duration-200 font-dm-sans rounded-lg mx-2 text-gray-300 hover:text-[#A83EF5] hover:bg-purple-500/10"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm transition-all duration-200 font-dm-sans rounded-lg mx-2 text-red-400 hover:text-white hover:bg-red-500/20"
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
                className="px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 font-dm-sans whitespace-nowrap border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </Link>
              <button
                onClick={() => router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e")}
                className="px-5 lg:px-6 py-2.5 text-sm font-bold text-slate-900 rounded-full transition-all duration-200 font-dm-sans hover:-translate-y-0.5 whitespace-nowrap shadow-lg shadow-white/10 hover:shadow-white/20 bg-white hover:bg-gray-100"
              >
                <span className="hidden lg:inline">Participar - Desde $1.00</span>
                <span className="lg:hidden">Participar</span>
              </button>
            </>
          )}
        </div>

        {/* Menú móvil hamburguesa */}
        <div className="sm:hidden flex-shrink-0">
          <button
            onClick={toggleMobileMenu}
            className="flex justify-center items-center p-2 rounded-xl transition-all duration-200 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10"
          >
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </motion.svg>
          </button>
        </div>

      </motion.div>

      {/* Backdrop oscuro cuando el menú móvil está abierto */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 [@media(min-width:640px)]:hidden"
            style={{ zIndex: 35 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menú móvil desplegable - Fuera del contenedor principal */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -10, scale: 0.98, x: "-50%" }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-1/2 w-[95%] max-w-md sm:hidden rounded-2xl shadow-2xl backdrop-blur-xl overflow-y-auto border border-white/10 bg-[#100235]/95 z-40 shadow-purple-900/40"
            style={{
              top: 'calc(100% + 0.5rem)',
              maxHeight: '80vh',
            }}
          >
            <nav className="flex flex-col py-2">
              {navLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-4 text-sm font-medium transition-all duration-200 relative active:scale-95 text-gray-300 hover:text-white hover:bg-white/5 flex items-center font-dm-sans tracking-wide"
                >
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    href="/mis-boletos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-6 py-4 text-sm font-medium transition-all duration-200 active:scale-95 text-gray-300 hover:text-white hover:bg-white/5 flex items-center font-dm-sans tracking-wide"
                  >
                    Mis boletos
                  </Link>
                  <div className="px-6 py-4 mt-2 border-t border-white/10">
                    <AnimatedButton
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e");
                      }}
                      className="w-full px-6 py-3 text-sm font-bold text-slate-900 font-dm-sans"
                      style={{ minHeight: '48px' }}
                      variant="default"
                      size="default"
                      glow={false}
                      textEffect="normal"
                      uppercase={true}
                      rounded="custom"
                      asChild={false}
                      hideAnimations={false}
                      shimmerColor="#cbd5e1"
                      shimmerSize="0.15em"
                      shimmerDuration="3s"
                      borderRadius="100px"
                      background="white"
                    >
                      Participar - Desde $1.00
                    </AnimatedButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-6 py-4 mt-2 border-t border-white/10">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 text-sm font-semibold text-center rounded-xl transition-all duration-200 font-dm-sans border border-white/20 bg-white/5 text-white hover:bg-white/10 active:scale-95 hover:border-white/40"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                  <div className="px-6 pb-4">
                    <AnimatedButton
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e");
                      }}
                      className="w-full px-6 py-3 text-sm font-bold text-slate-900 font-dm-sans"
                      style={{ minHeight: '48px' }}
                      variant="default"
                      size="default"
                      glow={false}
                      textEffect="normal"
                      uppercase={true}
                      rounded="custom"
                      asChild={false}
                      hideAnimations={false}
                      shimmerColor="#cbd5e1"
                      shimmerSize="0.15em"
                      shimmerDuration="3s"
                      borderRadius="100px"
                      background="white"
                    >
                      Participar - Desde $1.00
                    </AnimatedButton>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
