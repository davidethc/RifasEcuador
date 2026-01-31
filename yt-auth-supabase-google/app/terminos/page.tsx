'use client';

/**
 * Página "Términos y condiciones"
 * Muestra los términos y condiciones de participación en los sorteos
 */
export default function TerminosPage() {

  const terminos = [
    {
      numero: 1,
      titulo: 'Aceptación de términos',
      descripcion: 'Al participar en nuestros sorteos, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes participar en los sorteos.',
    },
    {
      numero: 2,
      titulo: 'Elegibilidad',
      descripcion: 'Para participar en nuestros sorteos, debes ser mayor de edad según la legislación del Ecuador. Los sorteos están sujetos a las leyes y regulaciones locales aplicables.',
    },
    {
      numero: 3,
      titulo: 'Compra de boletos',
      descripcion: 'Los boletos se asignan de forma aleatoria y automática. Una vez completada la compra, no se permiten cambios, devoluciones ni cancelaciones.',
    },
    {
      numero: 4,
      titulo: 'Realización del sorteo',
      descripcion: 'El sorteo se realizará a la par que la lotería nacional del Ecuador, cuando se culmine la compra total de los boletos se elegiría la fecha de la lotería más actual.',
    },
    {
      numero: 5,
      titulo: 'Premios',
      descripcion: 'En caso de que se haya intentado contactar al ganador y no se obtenga respuesta por parte del mismo en el plazo establecido, se procederá a declarar desierto el premio y se buscará otro ganador.',
    },
    {
      numero: 6,
      titulo: 'Privacidad',
      descripcion: 'Respetamos tu privacidad y protegemos tus datos personales de acuerdo con nuestra política de privacidad. Tus datos solo se utilizarán para los fines relacionados con la participación en los sorteos.',
    },
    {
      numero: 7,
      titulo: 'Limitación de responsabilidad',
      descripcion: 'No nos hacemos responsables por pérdidas o daños derivados de la participación en los sorteos, salvo los previstos por la ley. La participación es bajo tu propio riesgo.',
    },
    {
      numero: 8,
      titulo: 'Modificaciones',
      descripcion: 'Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones se publicarán en esta página y entrarán en vigor inmediatamente. Es tu responsabilidad revisar periódicamente estos términos.',
    },
  ];

  return (
    <main className="w-full min-h-screen" aria-label="Términos y condiciones" style={{
      background: 'linear-gradient(180deg, #1F1A2E 0%, #2A1F3D 50%, #1F1A2E 100%)'
    }}>
      {/* Sección principal */}
      <section className="relative py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado mejorado */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-block mb-4">
              <div className="w-16 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #FFB200, #f02080)' }}></div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
              Términos y condiciones
            </h1>
            <p className="text-base md:text-lg max-w-2xl mx-auto font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
              Información importante sobre nuestros sorteos
            </p>
          </div>

          {/* Contenedor de términos mejorado */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'rgba(28, 32, 58, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="p-6 md:p-8 lg:p-10">
              {/* Título de sección mejorado */}
              <div className="mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl font-bold mb-2 font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
                  Condiciones de participación
                </h2>
                <div className="w-20 h-0.5 rounded-full" style={{ background: 'rgba(255, 178, 0, 0.5)' }}></div>
              </div>

              {/* Lista de términos mejorada */}
              <div className="space-y-6 md:space-y-8">
                {terminos.map((termino, index) => (
                  <div 
                    key={termino.numero} 
                    className="relative group"
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className="flex items-start gap-4 md:gap-5">
                      {/* Número del término mejorado */}
                      <div className="flex-shrink-0">
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-bold transition-all group-hover:scale-110" 
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(168, 62, 245, 0.3), rgba(185, 33, 99, 0.3))',
                            border: '1px solid rgba(168, 62, 245, 0.4)',
                            color: '#E5E7EB'
                          }}
                        >
                          <span className="text-lg md:text-xl font-[var(--font-comfortaa)]">
                            {termino.numero}
                          </span>
                        </div>
                      </div>
                      {/* Contenido mejorado */}
                      <div className="flex-1 pt-1">
                        <h3 className="text-lg md:text-xl font-bold mb-2.5 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
                          {termino.titulo}
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed font-[var(--font-dm-sans)]" style={{ 
                          color: '#D1D5DB',
                          lineHeight: '1.7'
                        }}>
                          {termino.descripcion}
                        </p>
                      </div>
                    </div>
                    {/* Separador mejorado (excepto en el último) */}
                    {index < terminos.length - 1 && (
                      <div className="mt-6 md:mt-8" style={{ 
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Fecha de última actualización mejorada */}
              <div className="mt-10 md:mt-12 pt-6 md:pt-8" style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div className="rounded-lg p-4 md:p-5" style={{
                  background: 'rgba(15, 17, 23, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <p className="text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                    <span style={{ color: '#6B7280' }}>Última actualización: </span>
                    <span style={{ color: '#FFB200', fontWeight: 600 }}>
                      {new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional destacada */}
          <div className="mt-8 md:mt-10 rounded-xl p-5 md:p-6" style={{
            background: 'rgba(168, 62, 245, 0.1)',
            border: '1px solid rgba(168, 62, 245, 0.2)'
          }}>
            <p className="text-sm md:text-base text-center font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
              <span style={{ color: '#A83EF5', fontWeight: 600 }}>Importante: </span>
              Al participar en nuestros sorteos, aceptas estos términos y condiciones en su totalidad.
            </p>
          </div>
        </div>
      </section>

      {/* Pie de página con copyright */}
      <footer className="py-6 md:py-8 px-4 text-center">
        <p className="text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: '#6B7280' }}>
          © {new Date().getFullYear()} Rifas Ecuador. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}
