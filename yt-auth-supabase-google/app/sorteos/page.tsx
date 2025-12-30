'use client';

import { SorteosGrid } from '@/components/sorteos';
import Image from 'next/image';

/**
 * Página de todos los sorteos
 * Muestra el grid completo de sorteos activos
 * Cualquier persona puede ver y participar en los sorteos
 */
export default function SorteosPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #1F1935 0%, #2A1F3D 30%, #360254 70%, #4A1F5C 100%)'
    }}>
      {/* Silueta de fondo - Integrada con el fondo morado */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full" style={{ maxWidth: '2000px', maxHeight: '100vh' }}>
            <Image
              src="/siluetafondo.png"
              alt="Silueta de fondo"
              fill
              className="object-contain"
              style={{ 
                opacity: 0.1,
                filter: 'brightness(0) invert(1)',
                mixBlendMode: 'screen'
              }}
              priority
            />
          </div>
        </div>
      </div>

      {/* Contenido con z-index superior */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        {/* Título principal compacto */}
        <div className="mb-6 md:mb-10">
          {/* Título y subtítulo - Centrado en móvil */}
          <div className="text-center md:text-left mb-4 md:mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)] leading-tight mb-2">
              Sorteos Disponibles
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
              ¡Cualquiera puede participar y ganar!
            </p>
          </div>

          {/* Badges informativos - Centrados en móvil, a la derecha en desktop */}
          <div className="flex items-center justify-center md:justify-end gap-4 md:gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-legacy-purple-deep rounded-full shadow-sm border border-gray-200 dark:border-white/10">
              <span className="text-lg">🎫</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
                Compra rápida
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-legacy-purple-deep rounded-full shadow-sm border border-gray-200 dark:border-white/10">
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
                100% Seguro
              </span>
            </div>
          </div>
        </div>

        <SorteosGrid />
        </div>
      </div>
    </div>
  );
}
