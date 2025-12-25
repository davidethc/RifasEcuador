import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRaffles } from '@/features/raffles/hooks/useRaffles';
import { grid } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import { formatPercentage } from '@/shared/lib/format';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { raffles, loading, error } = useRaffles();
  
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header mejorado con mejor jerarquía visual */}
      <div className="text-center mb-16 space-y-4">
        {isAuthenticated && (
          <div className="mb-8 fade-in-up">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <span className="text-lg">👋</span>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-foreground leading-tight">
                  ¡Hola, {userName}!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Bienvenido de vuelta
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-3 fade-in-up">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">
            Sorteos Disponibles
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Participa en nuestros sorteos y gana increíbles premios
          </p>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className={cn(grid.cards, 'gap-8')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Error: {error}</p>
        </div>
      )}

      {/* Lista de sorteos */}
      {!loading && !error && (
        <>
          {raffles.length > 0 ? (
            <div className={cn(grid.cards, 'gap-8')}>
              {raffles.map((raffle, index) => (
                <div 
                  key={raffle.id} 
                  className="group bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-500 fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Imagen del premio con overlay sutil */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                    {raffle.prize_image_url ? (
                      <>
                        <img 
                          src={raffle.prize_image_url} 
                          alt={raffle.prize_name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Badge de precio elegante */}
                    <div 
                      className="absolute top-4 right-4 px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-2 border border-white/20 shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.65) 100%)',
                      }}
                    >
                      <svg 
                        className="w-4 h-4 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span className="text-base font-bold text-white tracking-tight">
                        ${raffle.price_per_ticket.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Contenido de la card */}
                  <div className="p-6 space-y-4">
                    {/* Título y premio */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-card-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {raffle.title}
                      </h3>
                      <p className="text-sm font-semibold text-primary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {raffle.prize_name}
                      </p>
                    </div>
                    
                    {/* Descripción */}
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {raffle.description || 'Sin descripción'}
                    </p>

                    {/* Progreso de venta mejorado */}
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Progreso</span>
                        <span className="text-foreground font-bold">{formatPercentage(raffle.sold_percentage)}</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                          style={{ width: `${Math.min(Math.max(raffle.sold_percentage, 0), 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <Link to={`/raffles/${raffle.id}`} className="block mt-6">
                      <Button className="w-full font-semibold" size="lg">
                        Ver Detalles
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="max-w-md mx-auto space-y-6 fade-in-up">
                  <div className="w-28 h-28 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg">
                    <svg
                      className="w-14 h-14 text-primary/60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m-6 4h6m-6-8h6m-6 0H9m0 0V8m0 4v4m0-8V4m0 4h6m-6 0v4m6-4v4m0-4h-6m6 4H9"
                      />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground">
                      No hay sorteos disponibles
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      En este momento no hay sorteos activos. Vuelve pronto para ver nuevas oportunidades de ganar increíbles premios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
