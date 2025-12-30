'use client';

import { HeroSection } from '@/components/hero';
import { SorteosGrid } from '@/components/sorteos';
import { WinnersTestimonials } from '@/components/testimonials/WinnersTestimonials';
import { TransparentProcess } from '@/components/transparency/TransparentProcess';

/**
 * Página de inicio
 * Incluye Hero section, barra de estadísticas, testimonios, proceso transparente y grid de sorteos destacados
 * Los sorteos se cargan automáticamente desde Supabase
 */
export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
     
      <WinnersTestimonials />
      <TransparentProcess />
      <SorteosGrid />
    </div>
  );
}
