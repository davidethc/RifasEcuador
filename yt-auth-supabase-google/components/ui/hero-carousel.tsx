"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface CarouselImage {
  src: string;
  alt?: string;
}

interface HeroCarouselProps {
  images: CarouselImage[];
  ratio?: number;
  autoplayInterval?: number;
  className?: string;
  showIndicators?: boolean;
}

export function HeroCarousel({
  images,
  ratio = 23 / 9,
  autoplayInterval = 5000,
  className,
  showIndicators = true,
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

  if (validImages.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative w-full", className)}>
      <AspectRatio ratio={ratio} className="rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="relative w-full h-full bg-white dark:bg-gray-800">
          {validImages.map((image, idx) => (
            <div
              key={`${image.src}-${idx}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <Image
                src={image.src}
                alt={image.alt ?? `Imagen ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

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

