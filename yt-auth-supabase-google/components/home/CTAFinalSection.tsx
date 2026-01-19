"use client";

import { useRouter } from "next/navigation";

/**
 * CTA Final
 * Llamado a la acción final
 */
export function CTAFinalSection() {
  const router = useRouter();

  return (
    <section className="relative w-full py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1A152E 0%, #2A1F3D 100%)'
    }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
          ¿Listo para participar?
        </h2>
        
        <button
          onClick={() => router.push('/sorteos')}
          className="px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-bold font-[var(--font-dm-sans)] border-0 rounded-lg transition-all"
          style={{
            background: 'linear-gradient(135deg, #F2C94C, #F2994A)',
            color: '#1A1A1A',
            boxShadow: '0 4px 16px rgba(242, 201, 76, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Comprar boletos — $1
        </button>
      </div>
    </section>
  );
}
