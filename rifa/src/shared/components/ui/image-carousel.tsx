import { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { cn } from '@/shared/lib/utils';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ImageCarousel({
  images,
  alt = 'Imagen del premio',
  className,
  autoPlay = true,
  autoPlayInterval = 4000,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play functionality con pausa durante interacción
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || isTransitioning) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        setIsTransitioning(true);
        return (prev + 1) % images.length;
      });
    }, autoPlayInterval);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, images.length, isTransitioning]);

  // Resetear estado de transición después de la animación
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 600); // Duración de la transición CSS
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentIndex]);

  const goToPrevious = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    // Pausar auto-play temporalmente
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    // Pausar auto-play temporalmente
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      // Pausar auto-play temporalmente
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }
  };

  // Gestos táctiles mejorados para móvil
  const minSwipeDistance = 50;
  const [swipeOffset, setSwipeOffset] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeOffset(0);
    // Pausar auto-play durante el swipe
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const distance = touchStart - currentTouch;
    setSwipeOffset(-distance); // Negativo para que se mueva en la dirección correcta
    setTouchEnd(currentTouch);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      setSwipeOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Resetear offset
    setSwipeOffset(0);

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    // Resetear touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!images || images.length === 0) {
    return (
      <div className={cn('w-full aspect-[4/3] bg-muted rounded-lg flex items-center justify-center', className)}>
        <span className="text-muted-foreground">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full group', className)}>
      {/* Imagen principal - Con soporte para gestos táctiles mejorados */}
      <div 
        className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Contenedor de imágenes con transición suave */}
        <div 
          className="relative w-full h-full"
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: swipeOffset === 0 ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {/* Imagen actual */}
          <img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover select-none"
            style={{
              opacity: swipeOffset === 0 ? 1 : Math.max(0.3, 1 - Math.abs(swipeOffset) / 200),
              transform: `translateX(${swipeOffset}px) scale(${swipeOffset === 0 ? 1 : 1 - Math.abs(swipeOffset) / 1000})`,
              transition: swipeOffset === 0 ? 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            }}
            draggable={false}
          />
        </div>
        
        {/* Overlay sutil para mejor contraste de controles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Controles de navegación (solo si hay más de una imagen) */}
      {images.length > 1 && (
        <>
          {/* Botón anterior - Visible en móvil y desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg z-10"
            onClick={goToPrevious}
            aria-label="Imagen anterior"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>

          {/* Botón siguiente - Visible en móvil y desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg z-10"
            onClick={goToNext}
            aria-label="Imagen siguiente"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>

          {/* Indicadores de puntos */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-background/60 hover:bg-background/80'
                )}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
