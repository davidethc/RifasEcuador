"use client";

import { useEffect, useState } from "react";

/**
 * Sección de Avance del Sorteo
 * Muestra barra de progreso de boletos vendidos
 */
export function AvanceSorteoSection() {
  // ⚠️ ATENCIÓN: Datos mock hardcodeados - REEMPLAZAR con datos reales de API
  // TODO: Conectar con endpoint real de estadísticas (ej: /api/stats/total-sold)
  // Este código muestra datos falsos al usuario y debe ser reemplazado
  const [soldCount, setSoldCount] = useState(45230); // Mock - debería venir de API
  const totalTickets = 60000; // No se muestra al usuario, pero se usa para calcular porcentaje

  // ⚠️ ATENCIÓN: Simulación de actualización - REEMPLAZAR con datos reales
  // TODO: Obtener datos reales desde API en lugar de simular
  // Simular actualización (en producción vendría de API)
  useEffect(() => {
    const interval = setInterval(() => {
      setSoldCount(prev => Math.min(prev + Math.floor(Math.random() * 10), totalTickets));
    }, 5000);
    return () => clearInterval(interval);
  }, [totalTickets]);

  // Porcentaje quemado en 8 (mostrar siempre 8% hasta que se desee usar el real)
  const percentage = 8;

  return (
    <section className="relative w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{
      background: 'linear-gradient(180deg, #2A1F3D 0%, #1F1835 50%, #1A152E 100%)'
    }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 md:mb-6 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
          Avance del sorteo
        </h2>
        <p className="text-lg md:text-xl text-center mb-8 md:mb-10 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
          Cuando se complete la emisión de boletos, se realiza el sorteo con Lotería Nacional.
        </p>

        <div className="rounded-lg border p-6 md:p-8" style={{
          background: 'rgba(28, 32, 58, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg md:text-xl font-semibold font-[var(--font-dm-sans)]" style={{ color: '#F9FAFB' }}>
                Boletos vendidos: <span style={{ color: '#FFB200' }}>{soldCount.toLocaleString('es-EC')}</span>
              </span>
              <span className="text-sm md:text-base font-semibold font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full h-6 md:h-8 rounded-full overflow-hidden" style={{
              background: 'rgba(255, 255, 255, 0.1)'
            }}>
              <div
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #F2C94C 0%, #F2994A 100%)',
                  width: `${percentage}%`,
                  boxShadow: '0 2px 8px rgba(242, 201, 76, 0.4)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
