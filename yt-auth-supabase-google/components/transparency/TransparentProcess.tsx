"use client";

/**
 * Componente de proceso transparente
 * Muestra el video del sorteo en vivo del canal de lotería
 */
export function TransparentProcess() {
  // URL del video de YouTube del canal de lotería
  // En producción, esto debería venir de una configuración o base de datos
  const youtubeVideoId = "dQw4w9WgXcQ"; // Reemplazar con el ID real del video

  return (
    <section className="w-full py-8 md:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-8 md:mb-12">

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 font-[var(--font-comfortaa)]">
            Proceso 100% Transparente
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-[var(--font-dm-sans)] px-4">
            Todos nuestros sorteos son transmitidos en vivo y supervisados por notario público
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Video */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title="Sorteo en vivo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Información */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 font-[var(--font-comfortaa)]">
                ¿Cómo funciona?
              </h3>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Transmisión en vivo
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                      Todos los sorteos se transmiten en vivo en nuestro canal de YouTube para que puedas verificar cada paso.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Supervisión notarial
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                      Cada sorteo es supervisado por un notario público que garantiza la legalidad y transparencia del proceso.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Resultados públicos
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                      Los resultados se publican inmediatamente después del sorteo y quedan disponibles para consulta pública.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Algoritmo verificable
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                      Utilizamos un sistema de selección aleatoria certificado y auditado por terceros independientes.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
                  Garantía de Transparencia
                </h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)] leading-relaxed">
                Cumplimos con todas las normativas legales de Ecuador. Nuestros sorteos están registrados y autorizados por las autoridades competentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

