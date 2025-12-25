import { useParams, Link } from 'react-router-dom';
import { useRaffle } from '@/features/raffles/hooks/useRaffles';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { ImageCarousel } from '@/shared/components/ui/image-carousel';
import { Button } from '@/shared/components/ui/button';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { formatPercentage } from '@/shared/lib/format';
import { getPrizeImageUrls } from '@/shared/lib/prizeImages';

export function RaffleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { raffle, loading, error } = useRaffle(id || '');

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-5xl mx-auto">
          <LoadingState message="Cargando detalles del sorteo..." variant="skeleton" skeletonCount={5} />
        </div>
      </PageContainer>
    );
  }

  if (error || !raffle) {
    return (
      <PageContainer>
        <div className="max-w-5xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Sorteo no encontrado</h1>
          <p className="text-muted-foreground mb-8">
            {error || 'El sorteo que buscas no existe o ya no está disponible.'}
          </p>
          <Link to="/">
            <Button>Volver a sorteos</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Preparar imágenes para el carrusel: incluye los 4 premios (KIA, Mazda, Yamaha, Sorpresa)
  const images = getPrizeImageUrls(id || '', raffle.prize_image_url);

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        {/* Botón volver */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a sorteos
        </Link>

        <div className="space-y-12">
          {/* Carrusel de imágenes */}
          <div className="w-full">
            <ImageCarousel
              images={images}
              alt={raffle.prize_name}
              autoPlay={images.length > 1}
              autoPlayInterval={3000}
            />
          </div>

          {/* Información del sorteo mejorada */}
          <div className="space-y-10">
            {/* Título y precio con mejor jerarquía */}
            <div className="space-y-6 border-b border-border/50 pb-10">
              <div className="space-y-3">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
                  {raffle.title}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <p className="text-xl text-primary font-semibold">
                    {raffle.prize_name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-6xl font-extrabold text-primary tracking-tight">
                  ${raffle.price_per_ticket.toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground font-medium">por boleto</span>
              </div>
            </div>

            {/* Descripción mejorada */}
            {raffle.description && (
              <div className="space-y-5">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Descripción</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                    {raffle.description}
                  </p>
                </div>
              </div>
            )}

            {/* Progreso de venta mejorado */}
            <div className="space-y-4 p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl border border-border/50 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold text-sm uppercase tracking-wide">Progreso de venta</span>
                <span className="text-2xl font-extrabold text-foreground">
                  {formatPercentage(raffle.sold_percentage)}
                </span>
              </div>
              <div className="w-full bg-muted/60 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-primary via-primary to-primary/90 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${Math.min(Math.max(raffle.sold_percentage, 0), 100)}%` }}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-4">
              <Link to={`/purchase/${id}`}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto min-w-[200px] text-lg py-6"
                >
                  Participar ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
