"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Componente de testimonios de ganadores reales
 * Muestra fotos, nombres y premios ganados para generar confianza
 */
export function WinnersTestimonials() {
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
              loading="lazy"
              quality={50}
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
            Cada sorteo tiene ganadores verificados. Tu nombre puede ser el próximo en esta lista.
          </p>
        </div>

        {/* Card central para motivar al usuario a ser el próximo ganador */}
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl border-2 p-6 md:p-8 lg:p-10 shadow-xl relative overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(255, 178, 0, 0.15), transparent 60%), radial-gradient(circle at 100% 100%, rgba(168, 62, 245, 0.3), rgba(15, 17, 23, 0.9))",
              borderColor: "rgba(255, 255, 255, 0.15)",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 md:mb-6" style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(148, 163, 184, 0.4)" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22C55E", boxShadow: "0 0 10px rgba(34, 197, 94, 0.9)" }} />
              <span className="text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: "#E5E7EB" }}>
                Sorteos reales, premios entregados y verificados
              </span>
            </div>

            {/* Texto principal */}
            <h3
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 md:mb-5 font-[var(--font-comfortaa)]"
              style={{ color: "#F9FAFB" }}
            >
              El próximo ganador puedes ser <span style={{ color: "#FFB200" }}>tú</span>
            </h3>

            <p
              className="text-sm md:text-base lg:text-lg mb-5 md:mb-6 max-w-2xl font-[var(--font-dm-sans)]"
              style={{ color: "#D1D5DB" }}
            >
              Miles de boletos participan en cada sorteo, pero solo unos pocos se llevan el premio. Compra tus boletos hoy y
              asegura tu lugar en el próximo sorteo oficial de ALTOKEEc.
            </p>

            {/* Bullets de confianza */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-lg" style={{ color: "#22C55E" }}>✔</span>
                <p className="text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: "#E5E7EB" }}>
                  Sorteos legales y transparentes en todo Ecuador.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-lg" style={{ color: "#22C55E" }}>✔</span>
                <p className="text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: "#E5E7EB" }}>
                  Premios entregados con evidencia y ganadores verificados.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-lg" style={{ color: "#22C55E" }}>✔</span>
                <p className="text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: "#E5E7EB" }}>
                  Soporte por WhatsApp para acompañarte en tu compra.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Link
                href="/sorteos"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm md:text-base shadow-lg transition-all font-[var(--font-dm-sans)]"
                style={{
                  background:
                    "linear-gradient(135deg, #FFB200 0%, #FFD54A 50%, #FFB200 100%)",
                  color: "#1F2933",
                  boxShadow: "0 10px 30px rgba(255, 178, 0, 0.6)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 14px 36px rgba(255, 178, 0, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(255, 178, 0, 0.6)";
                }}
              >
                Ver sorteos activos
              </Link>
              <p className="text-xs md:text-sm font-[var(--font-dm-sans)] text-center sm:text-left" style={{ color: "#9CA3AF" }}>
                No te quedes solo mirando ganadores. Empieza a participar hoy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

