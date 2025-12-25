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
      descripcion: 'Para participar en nuestros sorteos, debes ser mayor de edad según la legislación de tu país. Los sorteos están sujetos a las leyes y regulaciones locales aplicables.',
    },
    {
      numero: 3,
      titulo: 'Compra de boletos',
      descripcion: 'Los boletos se asignan de forma aleatoria y automática. Una vez completada la compra, no se permiten cambios, devoluciones ni cancelaciones, excepto en casos excepcionales contemplados por la ley.',
    },
    {
      numero: 4,
      titulo: 'Realización del sorteo',
      descripcion: 'Los sorteos se realizarán en las fechas programadas y serán supervisados por un notario público o autoridad competente. Los resultados serán publicados en nuestra plataforma y serán definitivos.',
    },
    {
      numero: 5,
      titulo: 'Premios',
      descripcion: 'Los premios se entregarán a los ganadores según se establezca en cada sorteo. Los ganadores serán contactados a través de los datos proporcionados durante la compra. Es responsabilidad del participante mantener sus datos actualizados.',
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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sección principal */}
      <section className="relative py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Encabezado */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
              Términos y condiciones
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-[var(--font-dm-sans)]">
              Información importante sobre nuestros sorteos
            </p>
          </div>

          {/* Contenedor de términos */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-8 lg:p-12">
              {/* Título de sección */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 font-[var(--font-comfortaa)]">
                Condiciones de participación
              </h2>

              {/* Lista de términos */}
              <div className="space-y-6 md:space-y-8">
                {terminos.map((termino, index) => (
                  <div key={termino.numero}>
                    <div className="flex items-start gap-4 md:gap-6">
                      {/* Número del término */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 dark:bg-amber-400 flex items-center justify-center shadow-md">
                          <span className="text-xl md:text-2xl font-bold text-white dark:text-gray-900 font-[var(--font-comfortaa)]">
                            {termino.numero}
                          </span>
                        </div>
                      </div>
                      {/* Contenido */}
                      <div className="flex-1 pt-1">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 font-[var(--font-comfortaa)]">
                          {termino.titulo}
                        </h3>
                        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-[var(--font-dm-sans)]">
                          {termino.descripcion}
                        </p>
                      </div>
                    </div>
                    {/* Separador (excepto en el último) */}
                    {index < terminos.length - 1 && (
                      <div className="mt-6 md:mt-8 border-t border-gray-200 dark:border-gray-700" />
                    )}
                  </div>
                ))}
              </div>

              {/* Fecha de última actualización */}
              <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 md:p-6">
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                    <span className="text-gray-500 dark:text-gray-500">Última actualización: </span>
                    <span className="text-blue-600 dark:text-amber-400 font-semibold">
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
        </div>
      </section>

      {/* Pie de página con copyright */}
      <footer className="py-8 px-4 text-center">
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-[var(--font-dm-sans)]">
          © {new Date().getFullYear()} Rifas Ecuador. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
