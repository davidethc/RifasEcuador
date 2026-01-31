"use client";

/**
 * Componente de proceso transparente
 * Muestra el video del sorteo en vivo del canal de lotería
 * Diseño mejorado para mayor credibilidad y profesionalismo
 */
export function TransparentProcess() {
  // URL del video de YouTube del canal de lotería
  // En producción, esto debería venir de una configuración o base de datos
  const youtubeVideoId = "tb3KXOm2K2E";

  return (
    <section 
      className="relative w-full py-10 md:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1A152E 0%, #2A1F3D 50%, #1F1835 100%)'
      }}
      aria-label="Proceso transparente de sorteos"
    >
      {/* Efecto de fondo sutil */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle 800px at 50% 50%, rgba(168, 62, 245, 0.1), transparent)'
      }} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Encabezado mejorado */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-block mb-3">
            <div className="w-16 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #FFB200, #A83EF5)' }}></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
            Proceso 100% Transparente
          </h2>
          <p className="text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-[var(--font-dm-sans)] px-2" style={{ color: '#9CA3AF' }}>
            Todos nuestros sorteos son transmitidos en vivo y supervisados por notario público
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-start">
          {/* Video mejorado con mejor diseño */}
          <div className="relative w-full order-2 lg:order-1">
            <div 
              className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 0 50px rgba(168, 62, 245, 0.1)'
              }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title="Sorteo en vivo - Transmisión oficial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            {/* Badge de "En Vivo" */}
            <div 
              className="absolute -top-2 -right-2 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              EN VIVO
            </div>
          </div>

          {/* Información mejorada con mejor UX/UI */}
          <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
            {/* Card principal: ¿Cómo funciona? */}
            <div 
              className="rounded-2xl p-5 md:p-6 transition-all duration-300"
              style={{
                background: 'rgba(28, 32, 58, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
                ¿Cómo funciona?
              </h3>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-4 group">
                  <div 
                    className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
                      border: '2px solid rgba(34, 197, 94, 0.5)'
                    }}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base md:text-lg mb-1 font-[var(--font-dm-sans)]" style={{ color: '#F9FAFB' }}>
                      Transmisión en vivo
                    </p>
                    <p className="text-sm leading-relaxed font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Se transmite en el canal de la Lotería Nacional para que puedas verificar cada paso.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4 group">
                  <div 
                    className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
                      border: '2px solid rgba(34, 197, 94, 0.5)'
                    }}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base md:text-lg mb-1 font-[var(--font-dm-sans)]" style={{ color: '#F9FAFB' }}>
                      Supervisión notarial
                    </p>
                    <p className="text-sm leading-relaxed font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Cada sorteo es supervisado por un notario público que garantiza la legalidad y transparencia del proceso.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4 group">
                  <div 
                    className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
                      border: '2px solid rgba(34, 197, 94, 0.5)'
                    }}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base md:text-lg mb-1 font-[var(--font-dm-sans)]" style={{ color: '#F9FAFB' }}>
                      Resultados públicos
                    </p>
                    <p className="text-sm leading-relaxed font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Los resultados se publican inmediatamente después del sorteo y quedan disponibles para consulta pública.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4 group">
                  <div 
                    className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
                      border: '2px solid rgba(34, 197, 94, 0.5)'
                    }}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base md:text-lg mb-1 font-[var(--font-dm-sans)]" style={{ color: '#F9FAFB' }}>
                      Algoritmo verificable
                    </p>
                    <p className="text-sm leading-relaxed font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
 La Lotería Nacional también verifica y valida el proceso.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Card de garantía mejorado */}
            <div 
              className="rounded-2xl p-5 md:p-6 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15))',
                border: '2px solid rgba(34, 197, 94, 0.3)',
                boxShadow: '0 10px 40px rgba(34, 197, 94, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))',
                    border: '2px solid rgba(34, 197, 94, 0.5)'
                  }}
                >
                  <svg className="w-6 h-6 md:w-7 md:h-7" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg md:text-xl font-bold font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
                  Garantía de Transparencia
                </h4>
              </div>
              <p className="text-sm md:text-base leading-relaxed font-[var(--font-dm-sans)]" style={{ color: '#D1D5DB' }}>
                Cumplimos con todas las normativas legales de Ecuador. Nuestros sorteos están registrados y autorizados por las autoridades competentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

