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
  const [showGlow, setShowGlow] = useState(false);
  const [glowPosition, setGlowPosition] = useState<'above' | 'below'>('below');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

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

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setChainPulled(true);
      setShowGlow(true);
      setGlowPosition("above");
      setChainLength(72);
    } else {
      setChainPulled(false);
      setShowGlow(false);
      setGlowPosition("below");
      setChainLength(48);
    }
  }, [resolvedTheme]);

  const calculateGlowPosition = (currentDragY: number) => {
    if (!titleRef.current || !navBarRef.current) return "below";
    const navBarRect = navBarRef.current.getBoundingClientRect();
    const titleRect = titleRef.current.getBoundingClientRect();
    const chainEndY = navBarRect.bottom + chainLength + currentDragY;
    const titleCenterY = titleRect.top + titleRect.height / 2;
    return chainEndY < titleCenterY ? "above" : "below";
  };

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
      setShowGlow(newTheme === "dark");
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
        className="relative flex items-center justify-between w-full max-w-5xl h-auto py-3 px-4 [@media(min-width:768px)]:px-6 backdrop-blur-xl border rounded-2xl shadow-2xl transition-all duration-300"
        style={{
          background: isDarkMode
            ? 'linear-gradient(180deg, rgba(11, 18, 32, 0.9), rgba(14, 22, 39, 0.9))'
            : 'rgba(255, 255, 255, 0.8)',
          borderColor: isDarkMode ? 'rgba(212,175,55,0.2)' : 'rgba(229, 231, 235, 0.5)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/logo922.png"
              alt="La Cima Logo"
              width={60}
              height={60}
              className="cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </Link>
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden [@media(min-width:640px)]:flex items-center space-x-4 [@media(min-width:768px)]:space-x-6">
          {navLinks.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-sm [@media(min-width:768px)]:text-base font-medium text-gray-700 hover:text-gray-900 dark:hover:text-[#D4AF37] transition-colors duration-200 relative group"
              style={{ color: isDarkMode ? '#E5E7EB' : undefined }}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </nav>

        {/* Botones de acción Desktop */}
        <div className="hidden [@media(min-width:640px)]:flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/mis-boletos"
                className="px-4 py-2 text-sm font-semibold hover:text-[#D4AF37] transition-colors font-[var(--font-dm-sans)]"
                style={{ color: isDarkMode ? '#E5E7EB' : '#0F172A' }}
              >
                Mis boletos
              </Link>
              <button
                onClick={() => router.push("/comprar/3b1f1182-ce6b-42cb-802c-a1537fe59c0e")}
                className="px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-200 font-[var(--font-dm-sans)] hover:transform hover:-translate-y-0.5"
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
                Participar - Desde $1.00
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sky-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white font-semibold text-sm">
                    {userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-sky-800 dark:text-sky-300 font-[var(--font-dm-sans)]">
                    {userName}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""
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
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 font-[var(--font-dm-sans)]"
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
                className="px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-200 font-[var(--font-dm-sans)] hover:transform hover:-translate-y-0.5"
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
                Participar - Desde $1.00
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
              if (newDragY > 4) {
                const position = calculateGlowPosition(newDragY);
                setGlowPosition(position);
              }
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
                        className="block w-full px-4 py-2 text-sm font-semibold text-center text-sky-800 dark:text-sky-300 border-2 border-sky-300 dark:border-sky-600 rounded-lg hover:bg-sky-50 dark:hover:bg-neutral-800 transition-colors font-[var(--font-dm-sans)]"
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
