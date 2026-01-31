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
    <main className="min-h-screen relative overflow-hidden" aria-label="Sorteos disponibles">
      {/* Imagen de fondo - Montañas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ 
          position: 'absolute', 
          top: '-15%',
          left: 0, 
          right: 0, 
          bottom: '-25%',
          width: '100%',
          height: '135%'
        }}>
          <Image
            src="/fondomontana.jpeg"
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: 'center top' }}
            priority
            quality={90}
            aria-hidden="true"
          />
        </div>
      </div>
      
      {/* Overlay oscuro para mejorar legibilidad del texto */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          zIndex: 0,
          background: 'linear-gradient(180deg, rgba(31, 25, 53, 0.4) 0%, rgba(42, 31, 61, 0.45) 30%, rgba(54, 2, 84, 0.5) 70%, rgba(74, 31, 92, 0.55) 100%)'
        }}
      />

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
    </main>
  );
}
