import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import type { TicketBundle } from '../types/purchase.types';
import { cn } from '@/shared/lib/utils';

interface TicketSelectorProps {
  pricePerTicket: number;
  onQuantityChange: (quantity: number) => void;
  selectedQuantity: number;
}

/**
 * Componente para seleccionar cantidad de boletos
 * Muestra opciones: 1, 5, 10, 20 boletos
 * Diseño responsivo igual que HomePage
 */
export function TicketSelector({
  pricePerTicket,
  onQuantityChange,
  selectedQuantity,
}: TicketSelectorProps) {
  // Definir combos disponibles
  const bundles: TicketBundle[] = [
    { quantity: 1, label: '1 Boleto', pricePerTicket, totalPrice: pricePerTicket },
    { quantity: 5, label: 'Combo 5', pricePerTicket, totalPrice: pricePerTicket * 5 },
    { quantity: 10, label: 'Combo 10', pricePerTicket, totalPrice: pricePerTicket * 10 },
    { quantity: 20, label: 'Combo 20', pricePerTicket, totalPrice: pricePerTicket * 20 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-card-foreground mb-4">
        Selecciona la cantidad de boletos
      </h3>

      {/* Grid de opciones - Responsive igual que HomePage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {bundles.map((bundle) => {
          const isSelected = selectedQuantity === bundle.quantity;
          return (
            <Card
              key={bundle.quantity}
              className={cn(
                'cursor-pointer transition-all duration-300',
                'hover:shadow-lg hover:scale-[1.02]',
                'active:scale-[0.98]',
                isSelected
                  ? 'border-2 border-primary bg-primary/10 shadow-md shadow-primary/20 ring-2 ring-primary/20'
                  : 'border hover:border-primary/50 hover:bg-accent/50'
              )}
              onClick={() => onQuantityChange(bundle.quantity)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onQuantityChange(bundle.quantity);
                }
              }}
              aria-pressed={isSelected}
              aria-label={`Seleccionar ${bundle.label} por $${bundle.totalPrice.toFixed(2)}`}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="space-y-2">
                  {isSelected && (
                    <div className="flex justify-center mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-primary-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                  <p className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}>
                    {bundle.label}
                  </p>
                  <p className={cn(
                    'text-2xl font-bold',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}>
                    ${bundle.totalPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${bundle.pricePerTicket.toFixed(2)} c/u
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Input personalizado para cantidad */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium text-foreground mb-2">
          O ingresa una cantidad personalizada:
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            max="100"
            value={selectedQuantity || ''}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value > 0) {
                onQuantityChange(Math.min(value, 100));
              } else if (e.target.value === '') {
                onQuantityChange(0);
              }
            }}
            className="flex-1"
            placeholder="Cantidad"
            aria-label="Cantidad personalizada de boletos"
          />
          <div className="flex items-center px-4 py-2 bg-muted rounded-lg">
            <span className="text-sm font-semibold text-primary">
              ${((selectedQuantity || 0) * pricePerTicket).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
