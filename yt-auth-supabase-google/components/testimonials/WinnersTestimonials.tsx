"use client";

import Image from "next/image";

interface Winner {
  id: string;
  name: string;
  prize: string;
  image?: string;
  testimonial: string;
  date: string;
}

/**
 * Componente de testimonios de ganadores reales
 * Muestra fotos, nombres y premios ganados para generar confianza
 */
export function WinnersTestimonials() {
  // Datos de ejemplo - En producción, estos vendrían de Supabase
  const winners: Winner[] = [
    {
      id: "1",
      name: "María González",
      prize: "Kia Sedan 2024",
      image: "/Testimonio 2.webp",
      testimonial: "¡No podía creerlo cuando me llamaron! El proceso fue muy transparente y recibí mi premio en tiempo récord. 100% recomendado.",
      date: "Enero 2024",
    },
    {
      id: "2",
      name: "Carlos Ramírez",
      prize: "Yamaha MT-07",
      image: "/Testimonio 3.webp",
      testimonial: "Siempre dudé de las rifas online, pero esta es diferente. Todo el proceso fue público y verificado. ¡Gracias!",
      date: "Diciembre 2023",
    },

  ];

  return (
    <section className="w-full py-8 md:py-12 lg:py-16 relative overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #1F1935 0%, #2A1F3D 30%, #360254 70%, #4A1F5C 100%)'
    }}>
      {/* Silueta de fondo - Integrada con el fondo morado */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full" style={{ maxWidth: '2000px', maxHeight: '100vh' }}>
            <Image
              src="/legacy/img/map.png"
              alt="Mapa de fondo"
              fill
              className="object-contain"
              style={{ 
                opacity: 0.1,
                filter: 'brightness(0) invert(1)',
                mixBlendMode: 'screen'
              }}
              priority
            />
          </div>
        </div>
      </div>

      {/* Contenido con z-index superior */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
        {/* Encabezado */}
        <div className="text-center mb-8 md:mb-12">

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
            Ganadores Reales
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto font-[var(--font-dm-sans)] px-4" style={{ color: '#9CA3AF' }}>
            Conoce a las personas que han ganado premios increíbles en nuestros sorteos
          </p>
        </div>

        {/* Grid de testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {winners.map((winner) => (
            <div
              key={winner.id}
              className="rounded-2xl border-2 p-4 md:p-6 shadow-lg hover:shadow-xl transition-all"
              style={{
                background: 'rgba(28, 32, 58, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Imagen del premio */}
              <div className="relative w-full h-40 md:h-48 mb-3 md:mb-4 rounded-xl overflow-hidden" style={{ 
                background: 'rgba(15, 17, 23, 0.4)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                {winner.image ? (
                  <Image
                    src={winner.image}
                    alt={winner.prize}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Información del ganador */}
              <div className="space-y-2 md:space-y-3">
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
                    {winner.name}
                  </h3>
                  <p className="text-sm font-semibold font-[var(--font-dm-sans)]" style={{ color: '#FFB200' }}>
                    Ganó: {winner.prize}
                  </p>
                  <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                    {winner.date}
                  </p>
                </div>

                {/* Testimonio */}
                <div className="rounded-lg p-3 md:p-4" style={{ background: 'rgba(15, 17, 23, 0.4)' }}>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#A83EF5' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm italic font-[var(--font-dm-sans)] leading-relaxed" style={{ color: '#E5E7EB' }}>
                      &quot;{winner.testimonial}&quot;
                    </p>
                  </div>
                </div>

                {/* Badge de verificado */}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" style={{ color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold font-[var(--font-dm-sans)]" style={{ color: '#10B981' }}>
                    Ganador Verificado
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

