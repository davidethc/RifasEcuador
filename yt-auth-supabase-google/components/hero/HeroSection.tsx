"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { purchaseService, type UserTicket } from "@/services/purchaseService";
import StatsCount from "@/components/ui/statscount";
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
    { src: "/mazdaprin.png", alt: "Mazda 3" },
    { src: "/yamaha.jpg", alt: "Yamaha MT-03" },
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
    <section className="relative w-full min-h-[60vh] flex items-center pt-4 md:pt-12 pb-12 md:pb-16 overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #1F1935 0%, #2A1F3D 30%, #360254 70%, #4A1F5C 100%)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Carrusel de imágenes */}
        <div className="mb-6 md:mb-12">
          <HeroCarousel images={heroCarouselImages} ratio={22 / 9} />
        </div>

        <div className="text-left w-full">
          {/* Título principal - Profesional y sobrio */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 font-[var(--font-comfortaa)] leading-tight" style={{ color: '#F9FAFB' }}>
              Premios reales. Ganadores reales.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold" style={{ color: '#FFB200' }}>
              En todo el Ecuador 🇪🇨
            </p>
          </div>

          {/* Subtítulo */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 font-[var(--font-comfortaa)]" style={{ color: '#E5E7EB' }}>
            Sorteos Disponibles
          </h2>

          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 font-[var(--font-dm-sans)] max-w-2xl leading-relaxed" style={{ color: '#9CA3AF' }}>
            Participa en nuestros sorteos y gana increíbles premios
          </p>

          {/* Botones de acción - Profesionales */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 md:mb-12">
            <button
              onClick={() => router.push('/sorteos')}
              className="px-6 py-3.5 md:px-8 md:py-4 text-base md:text-lg font-bold font-[var(--font-dm-sans)] border-0 min-h-[44px] rounded-lg transition-all"
              style={{ 
                background: 'linear-gradient(135deg, #F2C94C, #F2994A)',
                color: '#1A1A1A',
                boxShadow: '0 4px 12px rgba(242, 201, 76, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              Ver Sorteos
            </button>
            <Link
              href="/como-jugar"
              className="px-6 py-3.5 md:px-8 md:py-4 text-base md:text-lg font-semibold rounded-lg transition-all font-[var(--font-dm-sans)] min-h-[44px] flex items-center justify-center"
              style={{ 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#E5E7EB',
                background: 'rgba(28, 32, 58, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(28, 32, 58, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(28, 32, 58, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Cómo Funciona
            </Link>
          </div>

          {/* Bloque de Confianza - Estilo profesional */}
          <div className="mt-8 md:mt-12 max-w-4xl mx-auto">
            <div className="rounded-lg border p-4 md:p-6 lg:p-8" style={{ 
              background: 'rgba(28, 32, 58, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Título */}
              <div className="mb-4 md:mb-6 text-center">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold font-[var(--font-comfortaa)] flex items-center justify-center gap-2" style={{ color: '#F9FAFB' }}>
                  <span className="text-xl md:text-2xl">🔒</span>
                  <span>Plataforma segura y legal</span>
                </h2>
              </div>

              {/* Beneficios - Estilo profesional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-xl font-bold mt-1" style={{ color: '#22C55E' }}>✔</span>
                  <div>
                    <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Sorteos transparentes y públicos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl font-bold mt-1" style={{ color: '#22C55E' }}>✔</span>
                  <div>
                    <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Cumplimos normativa vigente en Ecuador
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl font-bold mt-1" style={{ color: '#22C55E' }}>✔</span>
                  <div>
                    <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Pagos 100% seguros
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl font-bold mt-1" style={{ color: '#22C55E' }}>✔</span>
                  <div>
                    <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Premios entregados a ganadores reales
                    </p>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="border-t pt-4 md:pt-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <p className="text-xs md:text-sm font-semibold mb-3 md:mb-4 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
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
                        sizes="(max-width: 768px) 80px, (max-width: 1024px) 112px, 128px"
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
                <p className="text-xs mt-3 md:mt-4 font-[var(--font-dm-sans)] text-center" style={{ color: '#9CA3AF' }}>
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
          <div className="mt-16 md:mt-24 max-w-6xl">
            <div className="rounded-lg border p-6 md:p-8" style={{ 
              background: 'rgba(28, 32, 58, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-comfortaa)] flex items-center gap-3" style={{ color: '#F9FAFB' }}>
                  <span className="text-3xl">🎫</span>
                  Mis Boletos
                </h2>
                {userTickets.length > 0 && (
                  <Link
                    href="/mis-boletos"
                    className="text-sm md:text-base font-semibold font-[var(--font-dm-sans)] transition-colors"
                    style={{ color: '#A83EF5' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#FFB200';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#A83EF5';
                    }}
                  >
                    Ver todos →
                  </Link>
                )}
              </div>

              {ticketsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A83EF5' }}></div>
                  <p className="font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                    Cargando tus boletos...
                  </p>
                </div>
              ) : userTickets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎟️</div>
                  <p className="font-[var(--font-dm-sans)] mb-4" style={{ color: '#9CA3AF' }}>
                    Aún no has comprado boletos
                  </p>
                  <Link
                    href="/sorteos"
                    className="inline-block px-6 py-3 rounded-lg font-semibold transition-all font-[var(--font-dm-sans)]"
                    style={{ 
                      background: 'linear-gradient(135deg, #F2C94C, #F2994A)',
                      color: '#1A1A1A',
                      boxShadow: '0 4px 12px rgba(242, 201, 76, 0.25)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'brightness(1)';
                    }}
                  >
                    Ver Sorteos Disponibles
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.order_id}
                      className="rounded-lg border p-4 md:p-6 transition-all"
                      style={{ 
                        background: 'rgba(15, 17, 23, 0.4)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(168, 62, 245, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
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
                          <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-[var(--font-comfortaa)]">
                            {ticket.raffle_title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {ticket.ticket_numbers.slice(0, 5).map((num) => (
                              <span
                                key={num}
                                className="px-3 py-1 glass-card border border-[#A83EF5]/30 rounded-lg font-bold text-sm text-white font-[var(--font-comfortaa)] neon-glow-purple"
                              >
                                {num}
                              </span>
                            ))}
                            {ticket.ticket_numbers.length > 5 && (
                              <span className="px-3 py-1 glass-card border border-[#FFB200]/30 rounded-lg font-bold text-sm text-white font-[var(--font-comfortaa)] neon-glow-gold">
                                +{ticket.ticket_numbers.length - 5} más
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-300 font-[var(--font-dm-sans)]">
                            <span>
                              {new Date(ticket.purchase_date).toLocaleDateString('es-EC', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="font-semibold text-[#FFB200] neon-text-gold">
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
                        className="inline-block px-6 py-3 btn-cta-secondary rounded-lg font-semibold transition-colors font-[var(--font-dm-sans)]"
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

