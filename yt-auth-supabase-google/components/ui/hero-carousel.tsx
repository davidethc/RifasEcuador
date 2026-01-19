"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface CarouselImage {
  src: string;
  alt?: string;
  isGif?: boolean;
}

interface HeroCarouselProps {
  images: CarouselImage[];
  ratio?: number;
  autoplayInterval?: number;
  className?: string;
  showIndicators?: boolean;
  transparent?: boolean;
  objectFit?: "object-contain" | "object-cover" | "object-fill" | "object-none" | "object-scale-down";
}

export function HeroCarousel({
  images,
  ratio = 25 / 9,
  autoplayInterval = 5000,
  className,
  showIndicators = true,
  transparent = false,
  objectFit,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = useMemo(() => images.filter((img) => img.src), [images]);

  useEffect(() => {
    if (validImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplayInterval, validImages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  if (validImages.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative w-full", className)}>
      <AspectRatio ratio={ratio} className={cn("rounded-3xl overflow-hidden relative", !transparent && "shadow-2xl")}>
        <div className={cn("relative w-full h-full", !transparent && "bg-white dark:bg-legacy-purple-deep")}>
          {validImages.map((image, idx) => {
            const isGif = image.isGif || image.src.toLowerCase().endsWith('.gif');
            return (
              <div
                key={`${image.src}-${idx}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              >
                {isGif ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.src}
                    alt={image.alt ?? `Imagen ${idx + 1}`}
                    className={cn("w-full h-full", objectFit || (transparent ? "object-contain" : "object-cover"))}
                    style={{ display: 'block' }}
                  />
                ) : (
                  <Image
                    src={image.src}
                    alt={image.alt ?? `Imagen ${idx + 1}`}
                    fill
                    sizes="100vw"
                    className={cn(objectFit || (transparent ? "object-contain" : "object-cover"))}
                    priority={idx === 0}
                    quality={idx === 0 ? 90 : 75}
                    loading={idx === 0 ? undefined : "lazy"}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Controles manuales - Flechas izquierda/derecha */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Imagen anterior"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Imagen siguiente"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {showIndicators && validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {validImages.map((_, idx) => (
              <button
                key={`indicator-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === currentIndex ? "w-8 bg-white shadow-lg" : "w-2 bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </AspectRatio>
    </div>
  );
}
