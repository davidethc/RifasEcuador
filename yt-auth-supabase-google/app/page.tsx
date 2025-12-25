'use client';

import { HeroSection } from '@/components/hero';
import { SorteosGrid } from '@/components/sorteos';

/**
 * Página de inicio
 * Incluye Hero section y grid de sorteos destacados
 * Los sorteos se cargan automáticamente desde Supabase
 */
export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <SorteosGrid />
    </div>
  );
}
