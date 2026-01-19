'use client';

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/hero';
import { SorteosGrid } from '@/components/sorteos';

// Dynamic imports para componentes no críticos - mejoran el rendimiento inicial
const WinnersTestimonials = dynamic(
  () => import('@/components/testimonials/WinnersTestimonials').then(mod => ({ default: mod.WinnersTestimonials })),
  { 
    loading: () => <div className="h-64" />, // Placeholder mientras carga
    ssr: true 
  }
);

const TransparentProcess = dynamic(
  () => import('@/components/transparency/TransparentProcess').then(mod => ({ default: mod.TransparentProcess })),
  { 
    loading: () => <div className="h-64" />,
    ssr: true 
  }
);

/**
 * Página de inicio
 * Incluye Hero section, barra de estadísticas, testimonios, proceso transparente y grid de sorteos destacados
 * Los sorteos se cargan automáticamente desde Supabase
 * Componentes no críticos cargados con dynamic import para mejorar LCP
 */
export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <SorteosGrid />
      <WinnersTestimonials />
      <TransparentProcess />
    </div>
  );
}
