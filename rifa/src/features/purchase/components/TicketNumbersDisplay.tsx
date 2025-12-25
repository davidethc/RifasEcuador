import { cn } from '@/shared/lib/utils';

interface TicketNumbersDisplayProps {
  ticketNumbers: number[];
  className?: string;
}

/**
 * Componente para mostrar números de boletos asignados
 * Diseño responsivo con efecto destacado
 */
export function TicketNumbersDisplay({ ticketNumbers, className }: TicketNumbersDisplayProps) {
  // Formatear números a 5 dígitos
  const formattedNumbers = ticketNumbers.map((num) => num.toString().padStart(5, '0'));

  // Si hay muchos números, mostrar solo algunos con indicador
  const maxDisplay = 6;
  const displayNumbers = formattedNumbers.slice(0, maxDisplay);
  const hasMore = formattedNumbers.length > maxDisplay;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Título */}
      <div className="text-center">
        <p className="text-sm sm:text-base text-muted-foreground mb-2">
          Para obtener tus números ganadores
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          Tus números son:
        </h2>
      </div>

      {/* Números destacados */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {displayNumbers.map((number, index) => (
          <div
            key={index}
            className={cn(
              'relative group',
              'bg-gradient-to-br from-primary/20 via-primary/10 to-background',
              'border-2 border-primary/30',
              'rounded-2xl p-4 sm:p-6',
              'shadow-lg shadow-primary/20',
              'hover:shadow-xl hover:shadow-primary/30',
              'transition-all duration-300',
              'hover:scale-105',
              'min-w-[100px] sm:min-w-[120px]',
              'flex flex-col items-center justify-center',
              // Efecto de brillo
              'before:absolute before:inset-0 before:rounded-2xl',
              'before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent',
              'before:opacity-0 before:transition-opacity before:duration-300',
              'hover:before:opacity-100'
            )}
          >
            {/* Efecto de rayos (solo en el primero) */}
            {index === 0 && (
              <div className="absolute -inset-4 opacity-20">
                <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-pulse" />
                <div className="absolute inset-2 border border-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            )}

            <div className="relative z-10 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground/80 mb-1 font-medium uppercase tracking-wider">
                Boleto
              </p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight">
                {number}
              </p>
            </div>
          </div>
        ))}

        {/* Indicador si hay más números */}
        {hasMore && (
          <div className="flex items-center justify-center">
            <div className="bg-muted/50 border border-muted-foreground/20 rounded-2xl p-4 sm:p-6 min-w-[100px] sm:min-w-[120px] flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm text-muted-foreground/80 mb-1 font-medium">
                Y {formattedNumbers.length - maxDisplay} más
              </p>
              <p className="text-lg sm:text-xl font-semibold text-muted-foreground">
                +{formattedNumbers.length - maxDisplay}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rango completo si hay muchos */}
      {hasMore && formattedNumbers.length > 0 && (
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Rango completo: <span className="font-semibold">{formattedNumbers[0]}</span> -{' '}
            <span className="font-semibold">{formattedNumbers[formattedNumbers.length - 1]}</span>
          </p>
        </div>
      )}
    </div>
  );
}
