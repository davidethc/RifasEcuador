"use client";

import Link from "next/link";
import Image from "next/image";
import { ViewersCounter } from "@/components/ui/viewers-counter";

interface SorteoCardProps {
  id: string;
  titulo: string;
  premio: string;
  precio: number;
  imagen?: string;
  totalNumbers?: number;
  soldNumbers?: number;
}

/**
 * Tarjeta de sorteo individual
 * Muestra información del premio y permite acceder a los detalles
 */
export function SorteoCard({ id, titulo, premio, precio, imagen, totalNumbers = 1000, soldNumbers = 0 }: SorteoCardProps) {

  // Formatear precio en dólares
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Calcular porcentaje de boletos vendidos
  const progressPercentage = totalNumbers > 0 ? Math.min((soldNumbers / totalNumbers) * 100, 100) : 0;
  const remainingNumbers = Math.max(totalNumbers - soldNumbers, 0);

  return (
    <Link
      href={`/sorteos/${id}`}
      className="group relative block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:shadow-xl"
    >
      {/* Imagen del premio */}
      <div className="relative w-full h-48 md:h-72 bg-gradient-to-br from-secondary-100 via-white to-secondary-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-600 overflow-hidden">
        {imagen ? (
          <Image
            src={imagen}
            alt={premio}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="text-center">
              <svg
                className="w-24 h-24 md:w-32 md:h-32 text-primary-500 dark:text-accent-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-[var(--font-dm-sans)]">
                Premio sorpresa
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)] group-hover:text-primary-500 transition-colors line-clamp-2 flex-1">
          {titulo}
        </h3>
          <div className="flex-shrink-0">
            <ViewersCounter min={8} max={20} />
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
              {soldNumbers} / {totalNumbers} boletos
            </span>
            <span className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
              {progressPercentage.toFixed(0)}% vendidos
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {remainingNumbers > 0 && remainingNumbers <= 50 && (
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1 font-[var(--font-dm-sans)]">
              ⚠️ Solo quedan {remainingNumbers} boletos
          </p>
          )}
        </div>

        {/* Botón de acción - ACCENT (dorado) para destacar */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/sorteos/${id}`;
          }}
          className="w-full py-3.5 px-4 bg-accent-500 hover:bg-accent-600 text-gray-900 rounded-xl font-bold text-sm md:text-base transition-all shadow-lg hover:shadow-xl font-[var(--font-dm-sans)] flex items-center justify-center gap-2 active:scale-95 min-h-[48px]"
        >
          <span>Participar desde {formatPrice(precio)}</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </Link>
  );
}
