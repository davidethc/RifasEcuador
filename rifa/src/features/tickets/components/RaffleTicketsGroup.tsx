import { TicketCard } from './TicketCard';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import type { MyTicket } from '../types/ticket.types';

interface RaffleTicketsGroupProps {
  raffleId: string;
  raffleTitle: string;
  prizeName: string;
  prizeImageUrl: string | null;
  tickets: MyTicket[];
}

/**
 * Componente que agrupa todos los boletos de una rifa específica
 * Diseño simplificado y responsivo
 */
export function RaffleTicketsGroup({
  raffleId,
  raffleTitle,
  prizeName,
  prizeImageUrl,
  tickets,
}: RaffleTicketsGroupProps) {
  // Calcular totales para esta rifa
  const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const totalPaid = tickets.reduce((sum, ticket) => sum + ticket.total_amount, 0);

  return (
    <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Encabezado del grupo - Mismo estilo que HomePage */}
      <div className="p-4 sm:p-6">
        {/* Imagen del premio - aspect-video como HomePage */}
        {prizeImageUrl && (
          <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
            <img
              src={prizeImageUrl}
              alt={prizeName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Información de la rifa - Mismo estilo que HomePage */}
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {raffleTitle}
        </h3>
        
        <p className="text-sm font-medium text-primary mb-4">
          Premio: {prizeName}
        </p>

        {/* Resumen compacto */}
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Boletos:</span>{' '}
            <span className="font-semibold">{totalTickets}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total pagado:</span>{' '}
            <span className="font-semibold text-primary">${totalPaid.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón ver sorteo */}
        <div className="flex justify-end">
          <Link to={`/raffles/${raffleId}`}>
            <Button variant="outline" size="sm">
              Ver sorteo
            </Button>
          </Link>
        </div>
      </div>

      {/* Lista de compras - Diseño compacto */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 border-t pt-4 sm:pt-6">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.sale_id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
