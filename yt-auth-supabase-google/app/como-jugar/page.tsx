'use client';

/**
 * Página "Cómo jugar"
 * Muestra una guía paso a paso para participar en los sorteos
 */
export default function ComoJugarPage() {

  const pasos = [
    {
      numero: 1,
      titulo: 'Explora los sorteos',
      descripcion: 'Navega por nuestra página principal y descubre los sorteos disponibles. Cada sorteo muestra información detallada sobre los premios, fechas y disponibilidad de boletos.',
    },
    {
      numero: 2,
      titulo: 'Selecciona tu sorteo',
      descripcion: 'Haz clic en "Participar ahora" en el sorteo que más te interese. Podrás ver todos los detalles, incluyendo los premios disponibles y el progreso del sorteo.',
    },
    {
      numero: 3,
      titulo: 'Elige tus boletos',
      descripcion: 'Selecciona la cantidad de boletos que deseas comprar. Los números se asignarán automáticamente de forma aleatoria para garantizar la transparencia del sorteo.',
    },
    {
      numero: 4,
      titulo: 'Completa tus datos',
      descripcion: 'Ingresa tu información personal necesaria para procesar tu compra. Puedes participar como invitado o crear una cuenta para un proceso más rápido en futuras compras.',
    },
    {
      numero: 5,
      titulo: 'Realiza el pago',
      descripcion: 'Completa el proceso de pago de forma segura. Una vez confirmado, recibirás tus boletos asignados y podrás verlos en la sección "Mis Boletos".',
    },
    {
      numero: 6,
      titulo: '¡Espera el sorteo!',
      descripcion: 'Mantente atento a la fecha del sorteo. Los resultados se publicarán en nuestra plataforma y te notificaremos si eres ganador.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sección principal */}
      <section className="relative py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Encabezado con ícono */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-2 font-[var(--font-dm-sans)]">
              Guía rápida
            </h2>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
              Cómo jugar
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-[var(--font-dm-sans)]">
              Sigue estos simples pasos para participar en nuestros sorteos
            </p>
          </div>

          {/* Grid de pasos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12">
            {pasos.map((paso) => (
              <div
                key={paso.numero}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-500 dark:hover:border-amber-400"
              >
                <div className="flex items-start gap-4">
                  {/* Número del paso */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-amber-400 font-[var(--font-comfortaa)]">
                        {paso.numero}
                      </span>
                    </div>
                  </div>
                  {/* Contenido */}
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 font-[var(--font-comfortaa)]">
                      {paso.titulo}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-[var(--font-dm-sans)]">
                      {paso.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de preguntas */}
      <section className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="text-center">
              {/* Ícono de chat */}
              <div className="inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-amber-400 mb-4 font-[var(--font-comfortaa)]">
                ¿Tienes preguntas?
              </h3>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
                Contáctanos a través de WhatsApp o por correo electrónico. Estamos aquí para ayudarte.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
