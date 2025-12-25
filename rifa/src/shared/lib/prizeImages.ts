/**
 * Helper para obtener las imágenes de los premios de una rifa
 * Retorna un array de URLs de imágenes para el carrusel
 */

// Importar imágenes locales
import kiaImage from '@/assets/kia.jpg';
import mazdaImage from '@/assets/mazdaprin.png';
import yamahaImage from '@/assets/yamaha.jpg';

export interface PrizeImage {
  url: string;
  alt: string;
  prizeNumber: number;
}

/**
 * Obtiene las imágenes de los premios para una rifa específica
 * @param raffleId - ID de la rifa
 * @param prizeImageUrl - URL de la imagen principal del premio (desde BD)
 * @returns Array de imágenes para el carrusel
 */
export function getPrizeImages(raffleId: string, prizeImageUrl: string | null): PrizeImage[] {
  // Por ahora, para la rifa principal, mostramos los 4 premios
  // Puedes ajustar esta lógica según necesites
  
  const images: PrizeImage[] = [];

  // 1er Premio: KIA SEDAN
  images.push({
    url: kiaImage,
    alt: '1er Premio: KIA SEDAN',
    prizeNumber: 1,
  });

  // 2do Premio: MAZDA CX-3 SUV
  images.push({
    url: mazdaImage,
    alt: '2do Premio: MAZDA CX-3 SUV',
    prizeNumber: 2,
  });

  // 3er Premio: YAMAHA MOTOCICLETA
  images.push({
    url: yamahaImage,
    alt: '3er Premio: YAMAHA MOTOCICLETA',
    prizeNumber: 3,
  });

  // 4to Premio: SORPRESA (usar imagen de placeholder o la imagen principal si existe)
  if (prizeImageUrl) {
    images.push({
      url: prizeImageUrl,
      alt: '4to Premio: SORPRESA',
      prizeNumber: 4,
    });
  } else {
    // Si no hay imagen de la BD, usar un placeholder
    images.push({
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzE1NjVlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+4oKsNHRvIFBSRU1JTyBTT1JQUkVTSUEhPC90ZXh0Pjwvc3ZnPg==',
      alt: '4to Premio: SORPRESA',
      prizeNumber: 4,
    });
  }

  return images;
}

/**
 * Obtiene solo las URLs de las imágenes (para compatibilidad con ImageCarousel)
 */
export function getPrizeImageUrls(raffleId: string, prizeImageUrl: string | null): string[] {
  return getPrizeImages(raffleId, prizeImageUrl).map(img => img.url);
}
