"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/animated-button";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";

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
  const [chainPulled, setChainPulled] = useState(false);
  const [chainLength, setChainLength] = useState(48);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

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

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setChainPulled(true);
      setChainLength(72);
    } else {
      setChainPulled(false);
      setChainLength(48);
    }
  }, [resolvedTheme]);



  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const finalDragY = Math.max(0, info.offset.y);
    if (finalDragY > 8) {
      const newTheme = theme === "dark" ? "light" : "dark";
      setTheme(newTheme);
      setChainPulled(newTheme === "dark");
      setChainLength(newTheme === "dark" ? 72 : 48);
    }
    setTimeout(() => {
      setDragY(0);
    }, 100);
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
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col items-center justify-start pt-2 [@media(min-width:480px)]:pt-4 [@media(min-width:768px)]:pt-6 [@media(min-width:1024px)]:pt-8 transition-all duration-500 text-gray-900 dark:text-white">
      <motion.div
        ref={navBarRef}
        initial={{ width: "95%" }}
        animate={{ width: "95%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex items-center justify-between w-full max-w-6xl h-auto py-2.5 [@media(min-width:768px)]:py-3 px-3 [@media(min-width:640px)]:px-4 [@media(min-width:768px)]:px-5 [@media(min-width:1024px)]:px-6 border rounded-2xl transition-all duration-300"
        style={{
          background: isDarkMode
            ? 'linear-gradient(180deg, #1A1F2E, #1D2338)'
            : 'rgba(255, 255, 255, 0.8)',
          border: isDarkMode
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(229, 231, 235, 0.5)',
          boxShadow: isDarkMode
            ? '0 8px 30px rgba(0,0,0,0.6), 0 1px 0 rgba(212,175,55,0.25)'
            : '0 4px 12px rgba(0,0,0,0.1)',
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
              color: '#00BFFF',
              textShadow: '0 0 10px rgba(0, 191, 255, 0.5)',
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
              className="text-xs [@media(min-width:768px)]:text-sm [@media(min-width:1024px)]:text-base font-medium text-gray-700 hover:text-gray-900 dark:hover:text-[#D4AF37] transition-colors duration-200 relative group whitespace-nowrap"
              style={{ color: isDarkMode ? '#E5E7EB' : undefined }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </nav>

        {/* Botones de acción Desktop */}
        <div className="hidden [@media(min-width:640px)]:flex items-center space-x-2 [@media(min-width:768px)]:space-x-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/mis-boletos"
                className="px-3 [@media(min-width:768px)]:px-4 py-2 text-xs [@media(min-width:768px)]:text-sm font-semibold hover:text-[#D4AF37] transition-colors font-[var(--font-dm-sans)] whitespace-nowrap"
                style={{ color: isDarkMode ? '#E5E7EB' : '#0F172A' }}
              >
                Mis boletos
              </Link>
              <button
                onClick={() => router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e")}
                className="px-4 [@media(min-width:768px)]:px-5 [@media(min-width:1024px)]:px-6 py-2 [@media(min-width:768px)]:py-2.5 text-xs [@media(min-width:768px)]:text-sm font-bold rounded-full transition-all duration-200 font-[var(--font-dm-sans)] hover:transform hover:-translate-y-0.5 whitespace-nowrap"
                style={{
                  background: '#D4AF37',
                  color: '#111111',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(212,175,55,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E6C75A';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(212,175,55,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#D4AF37';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,175,55,0.25)';
                }}
              >
                <span className="hidden [@media(min-width:1024px)]:inline">Participar - Desde $1.00</span>
                <span className="[@media(min-width:1024px)]:hidden">Participar</span>
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 [@media(min-width:768px)]:gap-2 px-2 [@media(min-width:768px)]:px-3 py-2 rounded-lg hover:bg-sky-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-7 h-7 [@media(min-width:768px)]:w-8 [@media(min-width:768px)]:h-8 rounded-full bg-sky-600 flex items-center justify-center text-white font-semibold text-xs [@media(min-width:768px)]:text-sm flex-shrink-0">
                    {userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-xs [@media(min-width:768px)]:text-sm font-medium text-sky-800 dark:text-sky-300 font-[var(--font-dm-sans)] max-w-[80px] [@media(min-width:1024px)]:max-w-[120px] truncate">
                    {getDisplayName(userName)}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 [@media(min-width:768px)]:w-4 [@media(min-width:768px)]:h-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""
                      }`}
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
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-lg py-1 border border-sky-200 dark:border-gray-700 z-50">
                    <Link
                      href="/perfil"
                      className="block px-4 py-2 text-sm text-sky-800 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-neutral-800 transition-colors font-[var(--font-dm-sans)]"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-sky-50 dark:hover:bg-neutral-800 transition-colors font-[var(--font-dm-sans)]"
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
                className="px-3 [@media(min-width:768px)]:px-4 py-2 text-xs [@media(min-width:768px)]:text-sm font-semibold rounded-lg transition-all duration-200 font-[var(--font-dm-sans)] whitespace-nowrap"
                style={{
                  background: isDarkMode ? '#FFFFFF' : '#FFFFFF',
                  color: '#111111',
                  border: '2px solid #D4AF37',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFF8E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#FFFFFF' : '#FFFFFF';
                }}
              >
                Iniciar Sesión
              </Link>
              <button
                onClick={() => router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e")}
                className="px-4 [@media(min-width:768px)]:px-5 [@media(min-width:1024px)]:px-6 py-2 [@media(min-width:768px)]:py-2.5 text-xs [@media(min-width:768px)]:text-sm font-bold rounded-full transition-all duration-200 font-[var(--font-dm-sans)] hover:transform hover:-translate-y-0.5 whitespace-nowrap"
                style={{
                  background: '#D4AF37',
                  color: '#111111',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(212,175,55,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E6C75A';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(212,175,55,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#D4AF37';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,175,55,0.25)';
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
            className="[@media(min-width:640px)]:hidden flex justify-center items-center p-2 bg-gray-100 dark:bg-neutral-900 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            <motion.svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </motion.svg>
          </button>
        </div>

        {/* Lámpara toggle theme */}
        <div className="absolute right-3 top-full mt-2 flex flex-col items-center group z-10">
          <motion.div
            className="w-1 bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-300 rounded-full shadow-sm relative"
            animate={{
              height: chainLength + dragY,
              scaleY: 1,
            }}
            transition={{
              duration: isDragging ? 0.05 : 0.6,
              ease: isDragging ? "linear" : "easeOut",
              type: isDragging ? "tween" : "spring",
              stiffness: isDragging ? undefined : 200,
              damping: isDragging ? undefined : 20,
            }}
            style={{
              height: `${chainLength + dragY}px`,
              transformOrigin: "top center",
            }}
          >
            {dragY > 4 && (
              <div className="absolute inset-0 flex flex-col justify-evenly">
                {Array.from({ length: Math.floor((chainLength + dragY) / 8) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="w-full h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full opacity-40"
                    />
                  )
                )}
              </div>
            )}
          </motion.div>
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 12 }}
            dragElastic={0}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
              const newDragY = Math.max(0, info.offset.y);
              setDragY(newDragY);
            }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{
              scale: 1.12,
              boxShadow: `0 ${6 + dragY * 0.3}px ${14 + dragY * 0.3}px rgba(0,0,0,0.3)`,
            }}
            className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-300 dark:to-yellow-500 rounded-full shadow-lg border-2 border-yellow-500 dark:border-yellow-400 transition-shadow duration-200 relative overflow-hidden cursor-grab active:cursor-grabbing"
            animate={{
              rotateZ: chainPulled ? 180 : 0,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
            style={{ position: "relative", top: -20, y: 0 }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-transparent opacity-60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col space-y-0.5">
                <motion.div
                  className="w-3 h-0.5 bg-yellow-700 dark:bg-yellow-200 rounded-full opacity-60"
                  animate={{ scaleX: 1 + dragY * 0.02 }}
                />
                <motion.div
                  className="w-3 h-0.5 bg-yellow-700 dark:bg-yellow-200 rounded-full opacity-60"
                  animate={{ scaleX: 1 + dragY * 0.02 }}
                />
                <motion.div
                  className="w-3 h-0.5 bg-yellow-700 dark:bg-yellow-200 rounded-full opacity-60"
                  animate={{ scaleX: 1 + dragY * 0.02 }}
                />
              </div>
            </div>
            {isDarkMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-yellow-500/90 dark:bg-yellow-400/90 rounded-full backdrop-blur-sm"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-800"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Menú móvil desplegable */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 [@media(min-width:640px)]:hidden bg-white dark:bg-neutral-950 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg backdrop-blur-sm z-50"
            >
              <nav className="flex flex-col py-2">
                {navLinks.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/mis-boletos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
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
                        background="linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)"
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
                        className="block w-full px-4 py-2 text-sm font-semibold text-center rounded-lg transition-all duration-200 font-[var(--font-dm-sans)]"
                        style={{
                          background: isDarkMode ? '#FFFFFF' : '#FFFFFF',
                          color: '#111111',
                          border: '2px solid #D4AF37',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#FFF8E1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isDarkMode ? '#FFFFFF' : '#FFFFFF';
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
                        background="linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)"
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
