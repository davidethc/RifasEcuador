'use client';

import Image from 'next/image';

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
    <main className="w-full h-screen relative overflow-hidden flex flex-col" aria-label="Cómo jugar">
      {/* Imagen de fondo - Iglesia */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Image
          src="/fondoiglesia.jpeg"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
          aria-hidden="true"
        />
      </div>
      
      {/* Overlay oscuro para mejorar legibilidad del texto */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          zIndex: 0,
          background: 'linear-gradient(180deg, rgba(31, 25, 53, 0.4) 0%, rgba(42, 31, 61, 0.45) 30%, rgba(54, 2, 84, 0.5) 70%, rgba(74, 31, 92, 0.55) 100%)'
        }}
      />

      {/* Contenido con z-index superior */}
      <div className="relative flex-1 flex items-center" style={{ zIndex: 1 }}>
      {/* Sección principal */}
      <section className="relative w-full py-4 md:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          {/* Encabezado con ícono */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center mb-3 md:mb-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 md:w-8 md:h-8 text-white"
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
            <h2 className="text-xl md:text-2xl font-semibold mb-3 font-[var(--font-dm-sans)]" style={{ color: '#FFB200' }}>
              Necesita saber acerca de
            </h2>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-6 font-[var(--font-comfortaa)] leading-tight" style={{ color: '#F9FAFB' }}>
              Cómo jugar
            </h1>
            <p className="text-base md:text-lg max-w-2xl mx-auto font-[var(--font-dm-sans)] leading-relaxed" style={{ color: '#9CA3AF' }}>
              Sigue estos simples pasos para participar en nuestros sorteos
            </p>
          </div>

          {/* Grid de pasos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-8 md:mt-10">
            {pasos.slice(0, 3).map((paso) => (
              <div
                key={paso.numero}
                className="rounded-xl p-5 md:p-6 border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
                style={{ 
                  background: paso.numero === 1 ? 'linear-gradient(135deg, rgba(168, 62, 245, 0.3), rgba(236, 72, 153, 0.3))' :
                             paso.numero === 2 ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(236, 72, 153, 0.3))' :
                             'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(168, 62, 245, 0.3))',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Ícono circular grande */}
                <div className="mb-4 md:mb-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center" style={{ 
                    background: paso.numero === 1 ? '#EC4899' :
                               paso.numero === 2 ? '#EC4899' :
                               '#FFB200',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}>
                    {paso.numero === 1 ? (
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    ) : paso.numero === 2 ? (
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                  </div>
                </div>
                {/* Contenido */}
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 font-[var(--font-comfortaa)] leading-tight" style={{ color: '#F9FAFB' }}>
                    {paso.titulo}
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                    {paso.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de preguntas - Ocultar por ahora para que quepa todo */}
      <section className="relative hidden py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12 border shadow-lg" style={{ 
            background: 'rgba(28, 32, 58, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="text-center">
              {/* Ícono de chat */}
              <div className="inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center" style={{ 
                  background: 'rgba(168, 62, 245, 0.2)',
                  border: '1px solid rgba(168, 62, 245, 0.3)'
                }}>
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10"
                    style={{ color: '#A83EF5' }}
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
              <h3 className="text-2xl md:text-3xl font-bold mb-4 font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
                ¿Tienes preguntas?
              </h3>
              <p className="text-lg md:text-xl font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                Contáctanos a través de WhatsApp o por correo electrónico. Estamos aquí para ayudarte.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
