'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import type { Raffle } from '@/types/database.types';

// Premios estáticos con imágenes
const PREMIOS = [
  {
    id: 1,
    nombre: 'Kia Sedan',
    descripcion: '1er Premio',
    imagen: '/kia.jpg',
  },
  {
    id: 2,
    nombre: 'Mazda CX-3 SUV',
    descripcion: '2do Premio',
    imagen: '/mazdaprin.png',
  },
  {
    id: 3,
    nombre: 'Yamaha Motocicleta',
    descripcion: '3er Premio',
    imagen: '/yamaha.jpg',
  },
  {
    id: 4,
    nombre: 'Premio Sorpresa',
    descripcion: '4to Premio',
    imagen: '/rifa.png',
  },
];

/**
 * Página de detalle del sorteo
 * Muestra información completa del sorteo y permite comprar boletos
 */
export default function SorteoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const raffleId = params.id as string;

  useEffect(() => {
    async function fetchRaffle() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('raffles')
          .select('*')
          .eq('id', raffleId)
          .single();

        if (fetchError) {
          console.error('Error fetching raffle:', fetchError);
          setError('No se pudo cargar el sorteo');
          return;
        }

        setRaffle(data);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Ocurrió un error inesperado');
      } finally {
        setIsLoading(false);
      }
    }

    if (raffleId) {
      fetchRaffle();
    }
  }, [raffleId]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleBuyTicket = () => {
    // Redirigir a la página de compra
    router.push(`/comprar/${raffleId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-accent-500"></div>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
            Sorteo no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 font-[var(--font-dm-sans)]">
            {error || 'El sorteo que buscas no existe o no está disponible'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors font-[var(--font-dm-sans)] min-h-[44px]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-10">
          {/* Imagen del sorteo */}
          <div className="relative flex flex-col">
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden shadow-2xl">
              {raffle.image_url ? (
                <Image
                  src={raffle.image_url}
                  alt={raffle.title}
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <svg
                    className="w-32 h-32 md:w-40 md:h-40 text-primary-500 dark:text-accent-500 mb-4"
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
                  <p className="text-lg text-gray-500 dark:text-gray-400 font-[var(--font-dm-sans)]">
                    Premio increíble
                  </p>
                </div>
              )}
            </div>

            {/* Indicador para scroll - Conoce los premios - Solo Desktop */}
            <div className="hidden lg:block mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-dashed border-primary-300 dark:border-accent-500/50 shadow-md hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-accent-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600 dark:text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
                      Conoce todos los premios
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                      Desliza hacia abajo para ver detalles
                    </p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-primary-600 dark:text-accent-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Información del sorteo */}
          <div className="flex flex-col justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-2xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 lg:mb-6 font-[var(--font-comfortaa)] leading-tight">
                {raffle.title}
              </h1>

              {raffle.description && (
                <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4 md:mb-6 lg:mb-8 font-[var(--font-dm-sans)] leading-relaxed">
                  {raffle.description}
                </p>
              )}

              {/* Precio */}
              <div className="mb-4 md:mb-6 lg:mb-8 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-blue-900/20 dark:to-amber-900/20 rounded-2xl border-2 border-blue-200 dark:border-amber-400 shadow-inner">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)] uppercase tracking-wide">
                    Precio por boleto
                  </p>
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-600 dark:text-accent-500 font-[var(--font-comfortaa)]">
                    {formatPrice(raffle.price_per_ticket)}
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-2 font-[var(--font-dm-sans)]">
                    🎫 Compra fácil y rápida
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6 lg:mb-8">
                <div className="text-center p-2 md:p-3 lg:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 md:mb-2 font-[var(--font-dm-sans)]">
                    Probabilidad
                  </p>
                  <p className="text-sm md:text-base lg:text-lg font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
                    99%
                  </p>
                </div>
                <div className="text-center p-2 md:p-3 lg:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 md:mb-2 font-[var(--font-dm-sans)]">
                    Inicia
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                    {raffle.start_date ? new Date(raffle.start_date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }) : 'Pronto'}
                  </p>
                </div>
                <div className="text-center p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)]">
                    Estado
                  </p>
                  <p className={`text-sm md:text-base font-bold font-[var(--font-dm-sans)] ${
                    raffle.status === 'active'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {raffle.status === 'active' ? '✅ Activo' : raffle.status}
                  </p>
                </div>
              </div>

              {/* Botón de compra */}
              <button
                onClick={handleBuyTicket}
                disabled={raffle.status !== 'active'}
                className="w-full py-3.5 md:py-4 lg:py-5 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-base md:text-lg lg:text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl hover:shadow-2xl font-[var(--font-dm-sans)] min-h-[48px]"
              >
                ¡Comprar boletos ahora!
              </button>

              {/* Indicador para scroll - Conoce los premios - Solo Móvil */}
              <div className="lg:hidden mt-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-4 border-2 border-dashed border-primary-300 dark:border-accent-500/50 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-accent-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600 dark:text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
                        Conoce todos los premios
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                        Desliza hacia abajo para ver detalles
                      </p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-primary-600 dark:text-accent-500 animate-bounce flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE PREMIOS - Después del scroll */}
        <div id="premios-section" className="mt-12 md:mt-16 lg:mt-20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 font-[var(--font-comfortaa)]">
              🏆 Premios Increíbles
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
              Participa y gana cualquiera de estos fantásticos premios
            </p>
          </div>

          {/* Grid de premios */}
          <div className="space-y-8 md:space-y-12">
            {PREMIOS.map((premio, index) => (
              <div
                key={premio.id}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } gap-6 md:gap-8 items-center bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700`}
              >
                {/* Imagen del premio */}
                <div className="w-full md:w-1/2 relative">
                  <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-primary-100 via-white to-accent-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={premio.imagen}
                      alt={premio.nombre}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  {/* Badge del número de premio */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-500 dark:to-accent-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-gray-800">
                    <span className="text-2xl font-bold text-white dark:text-gray-900 font-[var(--font-comfortaa)]">
                      {premio.id}
                    </span>
                  </div>
                </div>

                {/* Información del premio */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <p className="text-sm md:text-base text-primary-600 dark:text-accent-500 font-bold mb-2 font-[var(--font-dm-sans)] uppercase tracking-wide">
                    {premio.descripcion}
                  </p>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
                    {premio.nombre}
                  </h3>
                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)] mb-6">
                    Un premio increíble que puede ser tuyo. Participa con solo {formatPrice(raffle.price_per_ticket)} por boleto.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold font-[var(--font-dm-sans)]">
                        Premio verificado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bloque de confianza */}
          <div className="mt-12 md:mt-16">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)] flex items-center justify-center gap-2">
                  <span className="text-2xl">🔒</span>
                  Plataforma segura y legal
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold mt-1">✔</span>
                  <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                    Sorteos transparentes y públicos
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold mt-1">✔</span>
                  <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                    Cumplimos normativa vigente en Ecuador
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold mt-1">✔</span>
                  <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                    Pagos 100% seguros
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold mt-1">✔</span>
                  <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                    Premios entregados a ganadores reales
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 font-[var(--font-dm-sans)]">
                  Métodos de pago disponibles
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-24 h-16 md:w-32 md:h-20">
                      <Image
                        src="/payphonee.webp"
                        alt="PayPhone"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-16 md:w-32 md:h-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg border-2 border-primary-200 dark:border-primary-700">
                      <span className="text-xs md:text-sm font-bold text-primary-700 dark:text-primary-300 text-center px-2 font-[var(--font-dm-sans)]">
                        Transferencia Bancaria
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 font-[var(--font-dm-sans)]">
                  Pagos procesados de forma segura y verificada
                </p>
              </div>
            </div>
          </div>

          {/* Call to action final */}
          <div 
            className="mt-12 text-center rounded-2xl p-8 md:p-12 shadow-2xl"
            style={{
              background: 'linear-gradient(90deg, #4eb79d, #48c28c, #7dc487, #d4fba6)',
            }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white dark:text-gray-900 mb-4 font-[var(--font-comfortaa)]">
              ¿Listo para ganar?
            </h3>
            <p className="text-base md:text-lg text-white/90 dark:text-gray-900/90 mb-6 font-[var(--font-dm-sans)]">
              Compra tus boletos ahora y participa por estos increíbles premios
            </p>
            <button
              onClick={handleBuyTicket}
              disabled={raffle.status !== 'active'}
              className="px-6 md:px-8 py-3.5 md:py-4 bg-white dark:bg-gray-900 text-primary-500 rounded-xl font-bold text-base md:text-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl font-[var(--font-dm-sans)] min-h-[48px]"
            >
              Comprar boletos ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
