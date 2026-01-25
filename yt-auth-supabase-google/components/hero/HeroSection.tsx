"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { purchaseService, type UserTicket } from "@/services/purchaseService";
import { logger } from '@/utils/logger';
import { HeroCarousel } from "../ui/hero-carousel";

/**
 * Hero Section - Sección principal de la página de inicio
 * Diseño moderno y responsive con call-to-action
 */
export function HeroSection() {
  const { user, isLoading: authLoading } = useAuth();
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ratio, setRatio] = useState(16 / 9);
  
  // URL del GIF desde Vercel Blob Storage o fallback a local
  const gifUrl = process.env.NEXT_PUBLIC_GIF_URL || "/gifhero.gif";
  
  const heroCarouselImages = [
    { src: gifUrl, alt: "Video de diseño de premios", isGif: true },
    { src: "/carusuel8.png", alt: "Premios del sorteo" },
    { src: "/motos.jpg", alt: "Motos del sorteo" },
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
        logger.error('Error al cargar boletos:', error);
        setUserTickets([]);
      } finally {
        setTicketsLoading(false);
      }
    }

    loadUserTickets();
  }, [user, authLoading]);

  // Manejar ratio responsivo
  useEffect(() => {
    const handleResize = () => {
      setRatio(window.innerWidth < 768 ? 16 / 10 : 19 / 9);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <section className="relative w-full min-h-[50vh] flex items-center justify-center pt-2 md:pt-4 pb-12 md:pb-20 overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1F1935 0%, #2A1F3D 30%, #360254 70%, #4A1F5C 100%)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Carrusel con margen transparente 3D */}
        <div className="w-full flex justify-center py-4 md:py-6">
          <div 
            className="relative w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw]"
            style={{ 
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 0 50px rgba(168, 62, 245, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <HeroCarousel 
              images={heroCarouselImages} 
              ratio={ratio}
              autoplayInterval={9000}
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
                              alt={`Imagen del sorteo ${ticket.raffle_title}`}
                              fill
                              className="object-cover rounded-lg"
                              sizes="(max-width: 768px) 80px, 96px"
                              loading="lazy"
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

