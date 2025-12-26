"use client";

import Link from "next/link";
import Image from "next/image";

interface SorteoCardProps {
  id: string;
  titulo: string;
  premio: string;
  precio: number;
  destacado?: boolean;
  imagen?: string;
}

/**
 * Tarjeta de sorteo individual
 * Muestra información del premio y permite acceder a los detalles
 */
export function SorteoCard({ id, titulo, premio, precio, imagen }: SorteoCardProps) {

  // Formatear precio en dólares
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Link
      href={`/sorteos/${id}`}
      className="group relative block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-amber-400 transition-all transform hover:scale-[1.03] hover:shadow-2xl"
    >
      {/* Imagen del premio */}
      <div className="relative w-full h-56 md:h-72 bg-gradient-to-br from-blue-100 via-white to-amber-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-600 overflow-hidden">
        {imagen ? (
          <Image
            src={imagen}
            alt={premio}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="text-center">
              <svg
                className="w-24 h-24 md:w-32 md:h-32 text-blue-500 dark:text-amber-400 mx-auto mb-4"
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
      <div className="p-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 font-[var(--font-comfortaa)] group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
          {titulo}
        </h3>
        
        {/* Precio destacado */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-amber-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl border border-blue-200 dark:border-gray-600">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-amber-400 font-[var(--font-comfortaa)]">
              {formatPrice(precio)}
            </span>
          </div>
          <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1 font-[var(--font-dm-sans)]">
            por boleto
          </p>
        </div>

        {/* Botón de acción */}
        <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-amber-400 dark:to-amber-500 text-white dark:text-gray-900 rounded-xl font-bold text-base hover:from-blue-700 hover:to-blue-800 dark:hover:from-amber-500 dark:hover:to-amber-600 transition-all transform group-hover:scale-105 shadow-lg hover:shadow-xl font-[var(--font-dm-sans)] flex items-center justify-center gap-2">
          <span>¡Participar ahora!</span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
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
