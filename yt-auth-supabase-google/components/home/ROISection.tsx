"use client";

/**
 * Sección ROI / Valor de Cambio
 * Muestra el valor emocional de participar
 */
export function ROISection() {
  return (
    <section className="relative w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1A152E 0%, #2A1F3D 100%)'
    }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
          Con $1 puedes ganar más de $20.000 en premios reales
        </h2>
        <p className="text-xl md:text-2xl font-semibold font-[var(--font-dm-sans)]" style={{ color: '#FFB200' }}>
          Un café o un boleto, tú decides.
        </p>
      </div>
    </section>
  );
}
