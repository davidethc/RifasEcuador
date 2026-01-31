'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/utils/logger';

/**
 * Componente de barra de estadísticas de ventas
 * Muestra el total de boletos vendidos de todos los sorteos activos
 * Usa un endpoint API que bypass RLS usando service role
 */
export function SalesStatsBar() {
  const [totalSold, setTotalSold] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTotalSold() {
      try {
        setIsLoading(true);
        
        // Llamar al endpoint API que tiene acceso admin (bypass RLS)
        const response = await fetch('/api/stats/total-sold');
        const data = await response.json();

        if (data.success) {
          setTotalSold(data.totalSold || 0);
          logger.log('✅ [SALES_STATS] Total de boletos vendidos:', data.totalSold);
        } else {
          logger.error('❌ [SALES_STATS] Error al obtener total:', data.error);
          setTotalSold(0);
        }
      } catch (err) {
        logger.error('❌ [SALES_STATS] Error al obtener total de boletos vendidos:', err);
        setTotalSold(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTotalSold();
  }, []);

  return (
    <section className="w-full py-8 md:py-12 relative overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #1F1935 0%, #2A1F3D 30%, #360254 70%, #4A1F5C 100%)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl p-6 md:p-8 lg:p-10 border" style={{
          background: 'rgba(28, 32, 58, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
              Boletos Vendidos
            </h2>
            <p className="text-base md:text-lg mb-6 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              Únete a los participantes que ya están en el sorteo
            </p>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FFB200' }}></div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
                  {totalSold.toLocaleString('es-EC')}
                </div>
                <div className="flex items-center gap-2 text-lg md:text-xl font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                  <span className="text-2xl">🎫</span>
                  <span>Boletos vendidos en total</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm md:text-base font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                  <svg className="w-5 h-5" style={{ color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Pagos verificados y confirmados</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

