"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { purchaseService, type UserTicket } from "@/services/purchaseService";
import { AnimatedTextGenerate } from "@/components/ui/animated-textgenerate";
import StatsCount from "@/components/ui/statscount";
import { AnimatedButton } from "@/components/ui/animated-button";
import { HeroCarousel } from "@/components/ui/hero-carousel";

/**
 * Hero Section - Sección principal de la página de inicio
 * Diseño moderno y responsive con call-to-action
 */
export function HeroSection() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const heroCarouselImages = [
    { src: "/imagenhero.png", alt: "Premios: Autos, Motos y Tecnología" },
    { src: "/tren02.jpeg", alt: "Tren histórico" },
    { src: "/volcan01.jpeg", alt: "Volcán Ecuador" },
  ];

  // Cargar boletos del usuario cuando esté autenticado
  useEffect(() => {
    async function loadUserTickets() {
      if (!user || authLoading) {
        setUserTickets([]);
        return;
      }

      try {
        setTicketsLoading(true);
        const tickets = await purchaseService.getUserTickets();
        setUserTickets(tickets);
      } catch (error) {
        console.error('Error al cargar boletos:', error);
        setUserTickets([]);
      } finally {
        setTicketsLoading(false);
      }
    }

    loadUserTickets();
  }, [user, authLoading]);

  return (
    <section className="relative w-full min-h-[60vh] flex items-center pt-8 md:pt-12 pb-12 md:pb-16 overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10" />
      
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Carrusel de imágenes */}
        <div className="mb-5 md:mb-12">
          <HeroCarousel images={heroCarouselImages} ratio={22 / 9} />
        </div>

        <div className="text-center w-full">
          {/* Texto animado antes del título */}
          <div className="mb-8 md:mb-12 space-y-4 md:space-y-6">
            {/* Título principal - Dominante */}
            <AnimatedTextGenerate
              text="Premios reales. Ganadores reales. En todo el Ecuador 🇪🇨"
              className="mb-0"
              textClassName="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-900 dark:text-white"
              speed={0.4}
              highlightWords={[]}
              highlightClassName="text-primary-600 dark:text-accent-500"
              letterColors={{
                "ecuador": [
                  "text-yellow-500 dark:text-yellow-400", // E - Amarillo
                  "text-blue-600 dark:text-blue-400",     // c - Azul
                  "text-red-600 dark:text-red-400",       // u - Rojo
                  "text-black dark:text-white",           // a - Negro
                  "text-black dark:text-white",           // d - Negro
                  "text-black dark:text-white",           // o - Negro
                  "text-black dark:text-white",           // r - Negro
                ]
              }}
            />
          </div>

          {/* Título principal */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 font-[var(--font-comfortaa)] leading-tight">
            Sorteos Disponibles
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-12 font-[var(--font-dm-sans)] max-w-2xl mx-auto leading-relaxed px-4">
            Participa en nuestros sorteos y gana increíbles premios
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AnimatedButton
              onClick={() => router.push('/sorteos')}
              className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 text-base md:text-lg font-bold text-white bg-primary-500 hover:bg-primary-600 font-[var(--font-dm-sans)] border-0 min-h-[44px]"
              variant="default"
              size="lg"
              glow={false}
              textEffect="normal"
              uppercase={false}
              rounded="custom"
              asChild={false}
              hideAnimations={true}
              shimmerColor="transparent"
              shimmerSize="0"
              shimmerDuration="0s"
              borderRadius="8px"
              background="#3ab795"
            >
              Ver Sorteos
            </AnimatedButton>
            <Link
              href="/como-jugar"
              className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-[var(--font-dm-sans)] min-h-[44px] flex items-center justify-center"
            >
              Cómo Funciona
            </Link>
          </div>

          {/* Bloque de Confianza */}
          <div className="mt-8 md:mt-12 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 md:p-6 lg:p-8 shadow-lg">
              {/* Título */}
              <div className="text-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)] flex items-center justify-center gap-2">
                  <span className="text-xl md:text-2xl">🔒</span>
                  <span>Plataforma segura y legal</span>
                </h2>
              </div>

              {/* Beneficios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold mt-1">✔</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Sorteos transparentes y públicos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold mt-1">✔</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Cumplimos normativa vigente en Ecuador
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold mt-1">✔</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Pagos 100% seguros
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold mt-1">✔</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Premios entregados a ganadores reales
                    </p>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 md:pt-6">
                <p className="text-center text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 md:mb-4 font-[var(--font-dm-sans)]">
                  Métodos de pago disponibles
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8">
                  {/* PayPhone */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-20 h-14 md:w-28 md:h-18 lg:w-32 lg:h-20">
                      <Image
                        src="/payphonee.webp"
                        alt="PayPhone"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Transferencia Bancaria */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-14 md:w-28 md:h-18 lg:w-32 lg:h-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg border-2 border-primary-200 dark:border-primary-700">
                      <span className="text-[10px] md:text-xs lg:text-sm font-bold text-primary-700 dark:text-primary-300 text-center px-1.5 md:px-2 font-[var(--font-dm-sans)] leading-tight">
                        Transferencia Bancaria
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3 md:mt-4 font-[var(--font-dm-sans)] px-4">
                  Pagos procesados de forma segura y verificada
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas animadas */}
          <div className="mt-4 md:mt-6">
            <StatsCount
              stats={[
                {
                  value: 10,
                  label: "Sorteos Activos",
                  duration: 2,
                },
                {
                  value: 200,
                  label: "Participantes",
                  duration: 2.5,
                },
                {
                  value: 100,
                  suffix: "%",
                  label: "Legales",
                  duration: 2,
                },
              ]}
              title=""
              showDividers={true}
              className="py-0"
            />
          </div>
        </div>

        {/* Sección Mis Boletos - Solo si el usuario está autenticado */}
        {user && !authLoading && (
          <div className="mt-16 md:mt-24 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)] flex items-center gap-3">
                  <span className="text-3xl">🎫</span>
                  Mis Boletos
                </h2>
                {userTickets.length > 0 && (
                  <Link
                    href="/mis-boletos"
                    className="text-sm md:text-base text-primary-600 dark:text-accent-500 hover:text-primary-700 dark:hover:text-accent-600 font-semibold font-[var(--font-dm-sans)] transition-colors"
                  >
                    Ver todos →
                  </Link>
                )}
              </div>

              {ticketsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-accent-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                    Cargando tus boletos...
                  </p>
                </div>
              ) : userTickets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎟️</div>
                  <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)] mb-4">
                    Aún no has comprado boletos
                  </p>
                  <Link
                    href="/sorteos"
                    className="inline-block px-6 py-3 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-accent-600 transition-colors font-[var(--font-dm-sans)]"
                  >
                    Ver Sorteos Disponibles
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.order_id}
                      className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800 p-4 md:p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {ticket.raffle_image_url && (
                          <div className="flex-shrink-0 relative w-20 h-20 md:w-24 md:h-24">
                            <Image
                              src={ticket.raffle_image_url}
                              alt={ticket.raffle_title}
                              fill
                              className="object-cover rounded-lg"
                              sizes="(max-width: 768px) 80px, 96px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 font-[var(--font-comfortaa)]">
                            {ticket.raffle_title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {ticket.ticket_numbers.slice(0, 5).map((num) => (
                              <span
                                key={num}
                                className="px-3 py-1 bg-white dark:bg-gray-800 border-2 border-primary-500 dark:border-primary-400 rounded-lg font-bold text-sm text-gray-900 dark:text-white font-[var(--font-comfortaa)]"
                              >
                                {num}
                              </span>
                            ))}
                            {ticket.ticket_numbers.length > 5 && (
                              <span className="px-3 py-1 bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-400 rounded-lg font-bold text-sm text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
                                +{ticket.ticket_numbers.length - 5} más
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                            <span>
                              {new Date(ticket.purchase_date).toLocaleDateString('es-EC', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="font-semibold text-primary-600 dark:text-accent-500">
                              {new Intl.NumberFormat('es-EC', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2,
                              }).format(ticket.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {userTickets.length > 3 && (
                    <div className="text-center pt-4">
                      <Link
                        href="/mis-boletos"
                        className="inline-block px-6 py-3 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-accent-600 transition-colors font-[var(--font-dm-sans)]"
                      >
                        Ver todos los boletos ({userTickets.length})
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


