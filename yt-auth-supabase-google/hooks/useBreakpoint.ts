"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Hook personalizado para detectar el breakpoint actual con debounce
 * Optimizado para mejor performance
 * 
 * @returns El breakpoint actual ('base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl')
 * 
 * @example
 * const breakpoint = useBreakpoint();
 * 
 * if (breakpoint === 'md' || breakpoint === 'lg') {
 *   // Código para tablet/desktop
 * }
 */
export function useBreakpoint(): "base" | "sm" | "md" | "lg" | "xl" | "2xl" {
  const [breakpoint, setBreakpoint] = useState<"base" | "sm" | "md" | "lg" | "xl" | "2xl">("base");

  const getBreakpoint = useCallback((width: number): "base" | "sm" | "md" | "lg" | "xl" | "2xl" => {
    if (width >= 1536) return "2xl";
    if (width >= 1280) return "xl";
    if (width >= 992) return "lg";
    if (width >= 768) return "md";
    if (width >= 480) return "sm";
    return "base";
  }, []);

  useEffect(() => {
    // Inicializar breakpoint
    if (typeof window !== "undefined") {
      setTimeout(() => {
        setBreakpoint(getBreakpoint(window.innerWidth));
      }, 0);
    }

    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (typeof window !== "undefined") {
          setBreakpoint(getBreakpoint(window.innerWidth));
        }
      }, 150); // Debounce de 150ms
    };

    window.addEventListener("resize", handleResize, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [getBreakpoint]);

  return breakpoint;
}

/**
 * Hook para verificar si es móvil (optimizado)
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "base" || breakpoint === "sm";
}

/**
 * Hook para verificar si es tablet (optimizado)
 */
export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "md";
}

/**
 * Hook para verificar si es desktop (optimizado)
 */
export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";
}
