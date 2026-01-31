"use client";

/**
 * Sección Cómo Funciona
 * 4 pasos para participar
 */
export function ComoFuncionaSection() {
  const pasos = [
    {
      numero: 1,
      titulo: "Compra tu boleto",
      descripcion: "Participas desde $1 y puedes pagar con Payphone, tarjeta o transferencia.",
    },
    {
      numero: 2,
      titulo: "Recibe tu número",
      descripcion: "Te enviamos tus números de participación.",
    },
    {
      numero: 3,
      titulo: "Sorteo oficial",
      descripcion: "Transmisión pública con Lotería Nacional.",
    },
    {
      numero: 4,
      titulo: "Entrega del premio",
      descripcion: "El ganador recibe el vehículo con traspaso en Pichincha.",
    },
  ];

  return (
    <section className="relative w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1A152E 0%, #2A1F3D 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
          ¿Cómo funciona?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {pasos.map((paso) => (
            <div
              key={paso.numero}
              className="relative rounded-xl p-6 md:p-8 border shadow-lg"
              style={{
                background: 'rgba(28, 32, 58, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Número del paso */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl font-[var(--font-comfortaa)]" style={{
                background: 'linear-gradient(135deg, #F2C94C, #F2994A)',
                color: '#1A1A1A',
                boxShadow: '0 4px 12px rgba(242, 201, 76, 0.4)'
              }}>
                {paso.numero}
              </div>

              <h3 className="text-xl md:text-2xl font-bold mb-3 mt-4 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
                {paso.titulo}
              </h3>
              
              <p className="text-base md:text-lg font-[var(--font-dm-sans)] leading-relaxed" style={{ color: '#9CA3AF' }}>
                {paso.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
