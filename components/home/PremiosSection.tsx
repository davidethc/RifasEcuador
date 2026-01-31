"use client";

/**
 * Sección de Premios
 * Muestra los 3 premios principales del sorteo
 */
export function PremiosSection() {
  const premios = [
    {
      etiqueta: "Primer Premio",
      titulo: "KIA Rio Hatchback",
      descripcion: "Hatchback compacto con motor 1.4L / 4 cilindros, potencia 100–107 HP, transmisión manual o automática, consumo 15–18 km/L, capacidad para 5 pasajeros. Ideal para ciudad, uso diario y familiar. Puntos fuertes: Rendimiento, espacio, mantenimiento económico.",
    },
    {
      etiqueta: "Segundo Premio",
      titulo: "CFMOTO 300SR",
      descripcion: "Moto deportiva carenada (sport) con motor 292cc / 1 cilindro, potencia 29–34 HP, inyección EFI, transmisión 6 velocidades, frenos disco delantero + trasero con ABS, suspensión KYB delantera + monoshock. Ideal para ciudad, carretera y estilo racing. Puntos fuertes: Diseño agresivo, manejo deportivo, buena relación costo–prestaciones.",
    },
    {
      etiqueta: "Tercer Premio",
      titulo: "Yamaha MT-07",
      descripcion: "Moto Naked media cilindrada con motor 689cc / 2 cilindros (CP2), potencia 73–75 HP, par motor 68 Nm, transmisión 6 velocidades, frenos doble disco delantero + disco trasero, peso 179–182 kg. Ideal para ciudad, curvas y viajes. Puntos fuertes: Par motor fuerte, ligereza, muy divertida de manejar.",
    },
  ];

  return (
    <section className="relative w-full py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{
      background: 'linear-gradient(180deg, #2A1F3D 0%, #1F1835 50%, #1A152E 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
          Premios del Sorteo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {premios.map((premio, index) => (
            <div
              key={index}
              className="rounded-xl p-6 md:p-8 border shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: 'rgba(28, 32, 58, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 178, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-2 rounded-lg text-sm font-bold font-[var(--font-dm-sans)] mb-3" style={{
                  background: index === 0 ? 'linear-gradient(135deg, #F2C94C, #F2994A)' : 'rgba(168, 62, 245, 0.3)',
                  color: index === 0 ? '#1A1A1A' : '#F9FAFB'
                }}>
                  {premio.etiqueta}
                </span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-center font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
                {premio.titulo}
              </h3>
              
              <p className="text-base md:text-lg text-center font-[var(--font-dm-sans)] leading-relaxed" style={{ color: '#9CA3AF' }}>
                {premio.descripcion}
              </p>

              {/* ⚠️ ATENCIÓN: Placeholder para imagen - REEMPLAZAR con imagen real del premio */}
              {/* TODO: Agregar imágenes reales de los premios usando componente Image de Next.js */}
              {/* Placeholder para imagen */}
              <div className="mt-6 h-40 md:h-48 rounded-lg bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
                <span className="text-4xl">🏆</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
