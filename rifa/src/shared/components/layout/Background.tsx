import type { ReactNode } from 'react';
import { backgrounds, type BackgroundName } from '@/shared/lib/backgrounds';
import { cn } from '@/shared/lib/utils';

interface BackgroundProps {
  name: BackgroundName;
  children: ReactNode;
  className?: string;
}

/**
 * Componente Background - Aplica fondos predefinidos fácilmente
 * 
 * @example
 * <Background name="emerald">
 *   <YourContent />
 * </Background>
 * 
 * @example
 * <Background name="slate" className="custom-class">
 *   <YourContent />
 * </Background>
 */
export function Background({ name, children, className }: BackgroundProps) {
  const background = backgrounds[name];
  // Agregar clase para modo oscuro cuando es deep-ocean o midnight-aurora
  const isDarkMode = name === 'deep-ocean' || name === 'midnight-aurora';

  // Extraer propiedades especiales para soft-yellow
  const { opacity, mixBlendMode, ...restStyle } = background.backgroundStyle;
  const hasSpecialProps = opacity !== undefined || mixBlendMode !== undefined;

  return (
    <div className={cn(background.containerClass, className, isDarkMode && 'dark-mode-deep-ocean')}>
      {Object.keys(background.backgroundStyle).length > 0 && (
        <div
          className="absolute inset-0 z-0"
          style={hasSpecialProps ? {
            ...restStyle,
            opacity,
            mixBlendMode: mixBlendMode as React.CSSProperties['mixBlendMode'],
          } : background.backgroundStyle}
        />
      )}
      {children}
    </div>
  );
}
