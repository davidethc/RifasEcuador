'use client';

import { SorteosGrid } from '@/components/sorteos';

/**
 * Página de todos los sorteos
 * Muestra el grid completo de sorteos activos
 * Cualquier persona puede ver y participar en los sorteos
 */
export default function SorteosPage() {
  return (
    <div className="min-h-screen">
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
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-lg">🎫</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
                Compra rápida
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
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
  );
}

