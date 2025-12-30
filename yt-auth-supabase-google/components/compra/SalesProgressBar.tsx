'use client';

import { useEffect, useState } from 'react';

interface SalesProgressBarProps {
  raffleId: string;
  totalNumbers: number;
}

/**
 * Barra de progreso que muestra el porcentaje de boletos vendidos
 * Usa colores dorados para comunicar valor, premio y confianza
 */
export function SalesProgressBar({ raffleId, totalNumbers }: SalesProgressBarProps) {
  const [soldCount, setSoldCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSoldCount() {
      try {
        setIsLoading(true);
        
        // Llamar al endpoint API que tiene acceso admin (bypass RLS)
        const response = await fetch(`/api/stats/sold-by-raffle?raffleIds=${raffleId}`);
        const data = await response.json();

        if (data.success && data.counts && data.counts[raffleId] !== undefined) {
          setSoldCount(data.counts[raffleId] || 0);
        } else {
          setSoldCount(0);
        }
      } catch (err) {
        console.error('Error al obtener conteo de boletos vendidos:', err);
        setSoldCount(0);
      } finally {
        setIsLoading(false);
      }
    }

    if (raffleId && totalNumbers > 0) {
      fetchSoldCount();
    }
  }, [raffleId, totalNumbers]);

  const percentage = totalNumbers > 0 ? Math.min(100, Math.round((soldCount / totalNumbers) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="rounded-xl p-6 md:p-8" style={{
        background: '#1C203A',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}>
          <div className="space-y-4">
            {/* Título y porcentaje */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-bold font-[var(--font-comfortaa)]" style={{ color: '#cbd5e1' }}>
                  Progreso del Sorteo
                </h3>
                <p className="text-sm font-[var(--font-dm-sans)] mt-1" style={{ color: '#94a3b8' }}>
                  Boletos vendidos
                </p>
              </div>
              {!isLoading && (
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-bold font-[var(--font-comfortaa)]" style={{ color: '#fbbf24' }}>
                    {percentage}%
                  </div>
                  <p className="text-xs font-[var(--font-dm-sans)] mt-1" style={{ color: '#94a3b8' }}>
                    {soldCount.toLocaleString('es-EC')} / {totalNumbers.toLocaleString('es-EC')}
                  </p>
                </div>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="relative w-full h-4 md:h-5 rounded-full overflow-hidden" style={{
              background: 'rgba(0, 0, 0, 0.3)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-pulse h-2 w-2 rounded-full" style={{ background: '#fbbf24' }}></div>
                </div>
              ) : (
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, #fcd34d 0%, #f59e0b 100%)',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Efecto de brillo sutil */}
                  <div className="absolute inset-0 shimmer"></div>
                </div>
              )}
            </div>

            {/* Texto motivacional */}
            {!isLoading && percentage > 0 && (
              <p className="text-xs md:text-sm text-center font-[var(--font-dm-sans)] italic" style={{ color: '#cbd5e1' }}>
                {percentage < 25 && '¡Apenas comenzamos! Sé parte de este sorteo.'}
                {percentage >= 25 && percentage < 50 && '¡El sorteo está en marcha! No te quedes fuera.'}
                {percentage >= 50 && percentage < 75 && '¡Más de la mitad vendido! Únete ahora.'}
                {percentage >= 75 && percentage < 90 && '¡Quedan pocos boletos! Asegura tu oportunidad.'}
                {percentage >= 90 && '¡Últimos boletos disponibles! Esta es tu oportunidad.'}
              </p>
            )}
          </div>
        </div>
    </div>
  );
}

