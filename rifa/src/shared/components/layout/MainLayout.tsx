import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Background } from './Background';
import { WhatsAppButton } from '@/shared/components/ui/whatsapp-button';
import { Toaster } from '@/shared/components/ui/toaster';
import { spacing } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import type { BackgroundName } from '@/shared/lib/backgrounds';

export function MainLayout() {
  // Cambia el fondo fácilmente: 'emerald' | 'slate' | 'midnight-aurora' | 'deep-ocean' | 'crystal-maze' | 'soft-yellow' | 'default'
  const backgroundName: BackgroundName = 'slate';

  // Número de WhatsApp (formato: código país + número, sin + ni espacios)
  // Ejemplo: '573001234567' para Colombia
  const whatsappNumber = '593939039191'; // Cambia este número por el tuyo

  return (
    <Background name={backgroundName}>
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className={cn('flex-1 container mx-auto', spacing.container, 'py-8')}>
          <Outlet />
        </main>
        <footer className="bg-card/80 backdrop-blur-sm border-t border-border/40 mt-auto">
          <div className={cn('container mx-auto', spacing.container, 'py-6')}>
            <p className="text-center text-sm text-foreground">
              © {new Date().getFullYear()} Rifa. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
      
      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton 
        phoneNumber={whatsappNumber}
        message="Hola, me interesa participar en los sorteos"
      />
      
      {/* Sistema de notificaciones Toast */}
      <Toaster />
    </Background>
  );
}
