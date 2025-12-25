"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { purchaseService, type UserTicket } from "@/services/purchaseService";
import { AnimatedTextGenerate } from "@/components/ui/animated-textgenerate";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import StatsCount from "@/components/ui/statscount";
import { AnimatedButton } from "@/components/ui/animated-button";

/**
 * Hero Section - Sección principal de la página de inicio
 * Diseño moderno y responsive con call-to-action
 */
export function HeroSection() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

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
    <section className="relative w-full min-h-screen flex items-center pt-8 md:pt-12 pb-20 md:pb-28 overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10" />
      
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Banner visual con premios */}
        <div className="mb-8 md:mb-12">
          <AspectRatio ratio={23 / 9} className="rounded-3xl overflow-hidden border-4 border-blue-500/30 shadow-2xl">
            <Image
              src="/imagenhero.png"
              alt="Premios: Autos, Motos y Tecnología"
              fill
              className="object-cover"
              priority
            />
          </AspectRatio>
        </div>

        <div className="text-center w-full">
          {/* Texto animado antes del título */}
          <div className="mb-8 md:mb-12 space-y-4 md:space-y-6">
            {/* Título principal - Dominante */}
            <AnimatedTextGenerate
              text="Premios esperándote en todo el Ecuador."
              className="mb-0"
              textClassName="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-gray-900 dark:text-white"
              speed={0.4}
              highlightWords={[]}
              highlightClassName="text-blue-600 dark:text-amber-400"
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
            
            {/* Subtítulo - Secundario */}
            <AnimatedTextGenerate
              text="Ganadores reales como tú."
              className="mb-0 mt-2 md:mt-4"
              textClassName="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-800 dark:text-gray-200"
              speed={0.4}
              highlightWords={["Ganadores", "reales"]}
              highlightClassName="text-blue-600 dark:text-amber-400"
            />
            
            {/* Texto descriptivo - Apoyo */}
            <AnimatedTextGenerate
              text="Participa en sorteos por autos, motos de alto valor, con un costo accesible desde cualquier ciudad del país."
              className="mb-0 mt-4 md:mt-6"
              textClassName="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed"
              speed={0.3}
              highlightWords={["autos", "motos", "tecnología"]}
              highlightClassName="text-blue-600 dark:text-amber-400 font-semibold"
            />
          </div>

          {/* Título principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 font-[var(--font-comfortaa)] leading-tight">
            Sorteos Disponibles
          </h1>

          {/* Subtítulo */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 md:mb-12 font-[var(--font-dm-sans)] max-w-2xl mx-auto leading-relaxed">
            Participa en nuestros sorteos y gana increíbles premios
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AnimatedButton
              onClick={() => router.push('/sorteos')}
              className="w-full sm:w-auto px-8 py-4 text-base md:text-lg font-bold text-white bg-blue-600 dark:bg-amber-400 font-[var(--font-dm-sans)] border-0"
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
              background="rgb(37 99 235)"
            >
              Ver Sorteos
            </AnimatedButton>
            <Link
              href="/como-jugar"
              className="w-full sm:w-auto px-8 py-4 text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-[var(--font-dm-sans)]"
            >
              Cómo Funciona
            </Link>
          </div>

          {/* Estadísticas animadas */}
          <div className="mt-12 md:mt-16">
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
              className="py-4"
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
                    className="text-sm md:text-base text-blue-600 dark:text-amber-400 hover:text-blue-700 dark:hover:text-amber-500 font-semibold font-[var(--font-dm-sans)] transition-colors"
                  >
                    Ver todos →
                  </Link>
                )}
              </div>

              {ticketsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-amber-400 mx-auto mb-4"></div>
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
                    className="inline-block px-6 py-3 bg-blue-600 dark:bg-amber-400 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-amber-500 transition-colors font-[var(--font-dm-sans)]"
                  >
                    Ver Sorteos Disponibles
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.order_id}
                      className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-4 md:p-6 hover:shadow-md transition-shadow"
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
                                className="px-3 py-1 bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-400 rounded-lg font-bold text-sm text-gray-900 dark:text-white font-[var(--font-comfortaa)]"
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
                            <span className="font-semibold text-blue-600 dark:text-amber-400">
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
                        className="inline-block px-6 py-3 bg-blue-600 dark:bg-amber-400 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-amber-500 transition-colors font-[var(--font-dm-sans)]"
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
