'use client';

import { useEffect } from 'react';

interface VideoModalProps {
  videoSrc?: string;
  youtubeUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Función para extraer el ID del video de YouTube desde una URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Patrones comunes de URLs de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export function VideoModal({ videoSrc, youtubeUrl, isOpen, onClose }: VideoModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determinar si es un video de YouTube
  const youtubeId = youtubeUrl ? getYouTubeVideoId(youtubeUrl) : null;
  const isYouTube = !!youtubeId;

  // URL del video por defecto - Video promocional del sorteo (naturaleza/pájaros)
  // Si no hay videoSrc, usa el video local del proyecto
  const defaultVideoSrc = videoSrc || '/bg.mp4';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
      <div
        className="relative w-full max-w-4xl rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#360254',
          color: '#fff',
          border: '2px solid rgba(168, 62, 245, 0.3)'
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/20"
          style={{ 
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          aria-label="Cerrar video"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video - YouTube o local */}
        <div className="p-4">
          {isYouTube ? (
            <div className="relative w-full" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>
              <iframe
                className="w-full h-full rounded"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title="Video de YouTube"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <video
              className="w-full rounded"
              controls
              autoPlay
              preload="metadata"
              playsInline
              style={{ maxHeight: '80vh' }}
            >
              <source src={defaultVideoSrc} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}

