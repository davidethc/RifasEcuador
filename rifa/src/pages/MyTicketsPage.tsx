import { useTickets } from '@/features/tickets/hooks/useTickets';
import { RaffleTicketsGroup } from '@/features/tickets/components/RaffleTicketsGroup';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMemo } from 'react';
import type { MyTicket } from '@/features/tickets/types/ticket.types';

export function MyTicketsPage() {
  const { isAuthenticated } = useAuth();
  const { tickets, loading, error } = useTickets();

  // Agrupar tickets por rifa para mejor organización y escalabilidad
  // Cuando haya múltiples rifas, cada una tendrá su propio grupo
  const ticketsByRaffle = useMemo(() => {
    const grouped = new Map<string, MyTicket[]>();
    
    tickets.forEach((ticket) => {
      const raffleId = ticket.raffle_id;
      if (!grouped.has(raffleId)) {
        grouped.set(raffleId, []);
      }
      grouped.get(raffleId)!.push(ticket);
    });

    // Convertir a array de objetos con información de la rifa
    return Array.from(grouped.entries()).map(([raffleId, raffleTickets]) => {
      // Tomar la primera compra para obtener info de la rifa (todas tienen la misma info)
      const firstTicket = raffleTickets[0];
      return {
        raffleId,
        raffleTitle: firstTicket.raffle_title,
        prizeName: firstTicket.prize_name,
        prizeImageUrl: firstTicket.prize_image_url,
        tickets: raffleTickets,
      };
    });
  }, [tickets]);

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Acceso restringido</h1>
          <p className="text-muted-foreground mb-8">
            Debes iniciar sesión para ver tus boletos comprados.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Registrarse</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header mejorado */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-2">
          <span className="text-xl">🎫</span>
          <span className="text-sm font-semibold text-primary">Tus compras</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground tracking-tight">
          Mis Boletos
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
          Aquí puedes ver todos los boletos que has comprado
        </p>
      </div>

        {/* Estado de carga */}
        {loading && (
          <LoadingState 
            message="Cargando tus boletos..." 
            variant="skeleton" 
            skeletonCount={3}
          />
        )}

        {/* Error - Solo mostrar si es un error real, no si simplemente no hay tickets */}
        {error && error !== 'Usuario no encontrado' && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de tickets agrupados por rifa */}
        {!loading && !error && (
          <>
            {tickets.length > 0 ? (
              <div className="space-y-8">
                {ticketsByRaffle.map((group) => (
                  <RaffleTicketsGroup
                    key={group.raffleId}
                    raffleId={group.raffleId}
                    raffleTitle={group.raffleTitle}
                    prizeName={group.prizeName}
                    prizeImageUrl={group.prizeImageUrl}
                    tickets={group.tickets}
                  />
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
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4v-3a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-foreground">
                        No tienes boletos aún
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Cuando compres boletos, aparecerán aquí con todos sus detalles.
                      </p>
                      <div className="pt-4">
                        <Link to="/">
                          <Button size="lg" className="font-semibold">
                            Ver Sorteos Disponibles
                          </Button>
                        </Link>
                      </div>
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
