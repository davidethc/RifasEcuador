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
        className="relative flex items-center justify-between w-full max-w-6xl h-auto py-2.5 [@media(min-width:768px)]:py-3 px-3 [@media(min-width:640px)]:px-4 [@media(min-width:768px)]:px-5 [@media(min-width:1024px)]:px-6 border-2 rounded-3xl transition-all duration-300"
        style={{
          background: 'linear-gradient(180deg, #1A1F2E 0%, #1D2338 100%)',
          border: '1px solid rgba(255, 215, 98, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset',
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/logo1.webp"
              alt="La Cima Logo"
              width={70}
              height={70}
              className="[@media(min-width:768px)]:w-[80px] [@media(min-width:768px)]:h-[80px] [@media(min-width:1024px)]:w-[90px] [@media(min-width:1024px)]:h-[90px] cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </Link>
        </div>

        {/* Último chance - Solo móvil */}
        <div className="[@media(min-width:640px)]:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span
            className="text-sm font-bold italic"
              style={{
                color: '#128ECE',
                textShadow: '0 0 10px rgba(18, 142, 206, 0.5)',
              }}
          >
            Ecuador andino
          </span>
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden [@media(min-width:640px)]:flex items-center space-x-3 [@media(min-width:768px)]:space-x-4 [@media(min-width:1024px)]:space-x-5">
          {navLinks.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-xs [@media(min-width:768px)]:text-sm [@media(min-width:1024px)]:text-base font-semibold transition-all duration-200 relative group whitespace-nowrap"
              style={{ color: '#FFD962' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.textShadow = '0 0 12px rgba(255, 215, 98, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#FFD962';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-[#FFD962] to-[#FFFFFF] group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
          ))}
        </nav>

        {/* Botones de acción Desktop */}
        <div className="hidden [@media(min-width:640px)]:flex items-center space-x-2 [@media(min-width:768px)]:space-x-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/mis-boletos"
                className="px-3 [@media(min-width:768px)]:px-4 py-2 text-xs [@media(min-width:768px)]:text-sm font-semibold transition-all duration-200 font-[var(--font-dm-sans)] whitespace-nowrap rounded-lg"
                style={{ color: '#FFD962' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 215, 98, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#FFD962';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Mis boletos
              </Link>
              <button
                onClick={() => router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e")}
                className="px-4 [@media(min-width:768px)]:px-5 [@media(min-width:1024px)]:px-6 py-2 [@media(min-width:768px)]:py-2.5 text-xs [@media(min-width:768px)]:text-sm font-bold rounded-full transition-all duration-200 font-[var(--font-dm-sans)] hover:transform hover:-translate-y-0.5 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #ffb200 0%, #f02080 100%)',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(240,32,128,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f02080 0%, #ffb200 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(240,32,128,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ffb200 0%, #f02080 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(240,32,128,0.25)';
                }}
              >
                <span className="hidden [@media(min-width:1024px)]:inline">Participar - Desde $1.00</span>
                <span className="[@media(min-width:1024px)]:hidden">Participar</span>
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 [@media(min-width:768px)]:gap-2 px-2 [@media(min-width:768px)]:px-3 py-2 rounded-xl transition-all duration-200"
                  style={{ backgroundColor: 'rgba(255, 215, 98, 0.15)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 215, 98, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 215, 98, 0.15)';
                  }}
                >
                  <div className="w-7 h-7 [@media(min-width:768px)]:w-8 [@media(min-width:768px)]:h-8 rounded-full flex items-center justify-center font-semibold text-xs [@media(min-width:768px)]:text-sm flex-shrink-0" style={{ 
                    background: 'linear-gradient(135deg, #FFD962 0%, #F59E0B 100%)',
                    color: '#1A1D29'
                  }}>
                    {userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-xs [@media(min-width:768px)]:text-sm font-medium font-[var(--font-dm-sans)] max-w-[80px] [@media(min-width:1024px)]:max-w-[120px] truncate" style={{ color: '#FFD962' }}>
                    {getDisplayName(userName)}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 [@media(min-width:768px)]:w-4 [@media(min-width:768px)]:h-4 transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="#FFD962"
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
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-2 border z-50 backdrop-blur-xl" style={{
                    background: 'linear-gradient(180deg, #1A1F2E 0%, #1D2338 100%)',
                    border: '1px solid rgba(255, 215, 98, 0.2)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
                  }}>
                    <Link
                      href="/perfil"
                      className="block px-4 py-2.5 text-sm transition-all duration-200 font-[var(--font-dm-sans)] rounded-lg mx-2"
                      style={{ color: '#FFD962' }}
                      onClick={() => setIsDropdownOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 215, 98, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#FFD962';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm transition-all duration-200 font-[var(--font-dm-sans)] rounded-lg mx-2"
                      style={{ color: '#FCA5A5' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#FCA5A5';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
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
                className="px-3 [@media(min-width:768px)]:px-4 py-2 text-xs [@media(min-width:768px)]:text-sm font-semibold rounded-xl transition-all duration-200 font-[var(--font-dm-sans)] whitespace-nowrap border-2"
                style={{
                  background: 'rgba(255, 215, 98, 0.15)',
                  color: '#FFD962',
                  border: '2px solid rgba(255, 215, 98, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 98, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 98, 0.6)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 98, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 98, 0.4)';
                  e.currentTarget.style.color = '#FFD962';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Iniciar Sesión
              </Link>
              <button
                onClick={() => router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e")}
                className="px-4 [@media(min-width:768px)]:px-5 [@media(min-width:1024px)]:px-6 py-2 [@media(min-width:768px)]:py-2.5 text-xs [@media(min-width:768px)]:text-sm font-bold rounded-full transition-all duration-200 font-[var(--font-dm-sans)] hover:transform hover:-translate-y-0.5 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #ffb200 0%, #f02080 100%)',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(240,32,128,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f02080 0%, #ffb200 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(240,32,128,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ffb200 0%, #f02080 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(240,32,128,0.25)';
                }}
              >
                <span className="hidden [@media(min-width:1024px)]:inline">Participar - Desde $1.00</span>
                <span className="[@media(min-width:1024px)]:hidden">Participar</span>
              </button>
            </>
          )}
        </div>

        {/* Menú móvil hamburguesa */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMobileMenu}
            className="[@media(min-width:640px)]:hidden flex justify-center items-center p-2.5 rounded-xl transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 215, 98, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 215, 98, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 215, 98, 0.15)';
            }}
          >
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFD962"
              strokeWidth="2.5"
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

        {/* Menú móvil desplegable */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-full left-0 right-0 mt-3 [@media(min-width:640px)]:hidden rounded-3xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden border-2"
              style={{
                background: 'linear-gradient(180deg, #1A1F2E 0%, #1D2338 100%)',
                border: '1px solid rgba(255, 215, 98, 0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              <nav className="flex flex-col py-2">
                {navLinks.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-5 py-3.5 text-sm font-semibold transition-all duration-200 relative"
                    style={{
                      color: '#FFD962',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 215, 98, 0.2)';
                      e.currentTarget.style.textShadow = '0 0 8px rgba(255, 215, 98, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#FFD962';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.textShadow = 'none';
                    }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FFB200] to-[#F59E0B] opacity-0 transition-opacity duration-200"
                      style={{ opacity: 0 }}
                      onMouseEnter={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const indicator = parent.querySelector('.mobile-indicator') as HTMLElement;
                          if (indicator) indicator.style.opacity = '1';
                        }
                      }}
                    ></span>
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/mis-boletos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-5 py-3.5 text-sm font-semibold transition-all duration-200"
                      style={{
                        color: '#FFD962',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 215, 98, 0.2)';
                        e.currentTarget.style.textShadow = '0 0 8px rgba(255, 215, 98, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#FFD962';
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.textShadow = 'none';
                      }}
                    >
                      Mis boletos
                    </Link>
                    <div className="px-4 py-2">
                      <AnimatedButton
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e");
                        }}
                        className="w-full px-6 py-2 text-sm font-bold text-white font-[var(--font-dm-sans)]"
                        variant="default"
                        size="default"
                        glow={false}
                        textEffect="normal"
                        uppercase={true}
                        rounded="custom"
                        asChild={false}
                        hideAnimations={false}
                        shimmerColor="#39FF14"
                        shimmerSize="0.15em"
                        shimmerDuration="3s"
                        borderRadius="100px"
                        background="linear-gradient(135deg, #ffb200 0%, #f02080 100%)"
                      >
                        Participar - Desde $1.00
                      </AnimatedButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-2.5 text-sm font-semibold text-center rounded-xl transition-all duration-200 font-[var(--font-dm-sans)] border-2"
                        style={{
                          background: 'rgba(255, 215, 98, 0.15)',
                          color: '#FFD962',
                          border: '2px solid rgba(255, 215, 98, 0.4)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 215, 98, 0.25)';
                          e.currentTarget.style.borderColor = 'rgba(255, 215, 98, 0.6)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 215, 98, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(255, 215, 98, 0.4)';
                          e.currentTarget.style.color = '#FFD962';
                        }}
                      >
                        Iniciar Sesión
                      </Link>
                    </div>
                    <div className="px-4 py-2">
                      <AnimatedButton
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e");
                        }}
                        className="w-full px-6 py-2 text-sm font-bold text-white font-[var(--font-dm-sans)]"
                        variant="default"
                        size="default"
                        glow={false}
                        textEffect="normal"
                        uppercase={true}
                        rounded="custom"
                        asChild={false}
                        hideAnimations={false}
                        shimmerColor="#39FF14"
                        shimmerSize="0.15em"
                        shimmerDuration="3s"
                        borderRadius="100px"
                        background="linear-gradient(135deg, #ffb200 0%, #f02080 100%)"
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
      </motion.div>
    </div>
  );
}
