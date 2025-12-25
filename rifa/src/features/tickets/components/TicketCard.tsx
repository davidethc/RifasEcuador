import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { MyTicket } from '../types/ticket.types';
import { cn } from '@/shared/lib/utils';

interface TicketCardProps {
  ticket: MyTicket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  
  // Formatear números si no vienen formateados
  const startFormatted = ticket.ticket_start_number_formatted || 
    ticket.ticket_start_number.toString().padStart(5, '0');
  const endFormatted = ticket.ticket_end_number_formatted || 
    ticket.ticket_end_number.toString().padStart(5, '0');

  // Generar lista de números de tickets
  const ticketNumbers: string[] = [];
  for (let i = ticket.ticket_start_number; i <= ticket.ticket_end_number; i++) {
    ticketNumbers.push(i.toString().padStart(5, '0'));
  }

  // Si hay muchos tickets, mostrar solo algunos
  const displayNumbers = showAllNumbers 
    ? ticketNumbers 
    : ticketNumbers.slice(0, 5);

  return (
    <div className="border rounded-lg p-4 sm:p-5 bg-card hover:bg-accent/50 transition-colors">
        {/* Información de compra - Compacta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-4 border-b text-sm">
          <div>
            <span className="text-muted-foreground">Comprado:</span>{' '}
            <span className="font-medium">
              {new Date(ticket.purchase_date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Cantidad:</span>{' '}
              <span className="font-semibold">{ticket.quantity} {ticket.quantity === 1 ? 'boleto' : 'boletos'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total:</span>{' '}
              <span className="font-semibold text-primary">${ticket.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Números de tickets - Diseño simplificado y responsivo */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground mb-2">Números de boletos:</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {displayNumbers.map((number, index) => (
              <div
                key={index}
                className={cn(
                  "relative group",
                  "bg-gradient-to-br from-primary/10 via-primary/5 to-background",
                  "border border-primary/20",
                  "rounded-lg p-2 sm:p-3",
                  "hover:border-primary/40 hover:bg-primary/15",
                  "transition-all duration-200",
                  "flex items-center justify-center",
                  "min-h-[60px] sm:min-h-[70px]"
                )}
              >
                <div className="text-center w-full">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground/70 mb-0.5 sm:mb-1 font-medium uppercase tracking-wide">
                    Boleto
                  </p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-primary tracking-tight">
                    {number}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para ver más si hay más de 5 tickets */}
          {ticketNumbers.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllNumbers(!showAllNumbers)}
              className="w-full"
            >
              {showAllNumbers 
                ? `Ocultar (mostrando ${ticketNumbers.length})` 
                : `Ver todos (${ticketNumbers.length} boletos)`}
            </Button>
          )}

          {/* Rango de tickets si hay muchos */}
          {ticket.quantity > 10 && (
            <div className="text-center text-xs sm:text-sm text-muted-foreground pt-2 mt-2 border-t">
              Rango: <span className="font-medium">{startFormatted}</span> - <span className="font-medium">{endFormatted}</span>
            </div>
          )}
        </div>
    </div>
  );
}
