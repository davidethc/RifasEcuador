import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRaffle } from '@/features/raffles/hooks/useRaffles';
import { TicketSelector } from '@/features/purchase/components/TicketSelector';
import { Button } from '@/shared/components/ui/button';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Stepper } from '@/shared/components/ui/stepper';
import { formatPercentage } from '@/shared/lib/format';

/**
 * Página de selección de boletos (carrito)
 * Primera etapa del flujo de compra
 * Usuario puede seleccionar cantidad: 1, 5, 10, 20 o personalizada
 */
export function PurchasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { raffle, loading, error } = useRaffle(id || '');
  const [quantity, setQuantity] = useState<number>(1);

  const handleContinue = () => {
    if (!id || !quantity || quantity < 1) return;
    // Redirigir a formulario de datos con la cantidad seleccionada
    navigate(`/purchase/${id}/form?quantity=${quantity}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <LoadingState message="Cargando información del sorteo..." />
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || 'Sorteo no encontrado'}</p>
          <Link to="/">
            <Button>Volver a sorteos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const total = quantity * raffle.price_per_ticket;

  const steps = ['Seleccionar cantidad', 'Completar datos', 'Confirmación'];

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header - Mismo estilo que HomePage */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Participar en el sorteo
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Selecciona la cantidad de boletos que deseas comprar
        </p>
        
        {/* Stepper */}
        <div className="max-w-2xl mx-auto mb-8">
          <Stepper steps={steps} currentStep={1} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Columna izquierda: Información del sorteo */}
        <div className="space-y-6">
          {/* Imagen del premio - Mismo estilo que HomePage */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {raffle.prize_image_url ? (
              <img
                src={raffle.prize_image_url}
                alt={raffle.prize_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>

          {/* Información del sorteo - Mismo estilo que HomePage */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              {raffle.title}
            </h3>
            
            <p className="text-sm font-medium text-primary mb-4">
              Premio: {raffle.prize_name}
            </p>

            {raffle.description && (
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {raffle.description}
              </p>
            )}

            {/* Progreso de venta */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Vendido</span>
                <span>{formatPercentage(raffle.sold_percentage)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(Math.max(raffle.sold_percentage, 0), 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Precio por boleto</p>
              <p className="text-3xl font-bold text-primary">
                ${raffle.price_per_ticket.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Selección de boletos */}
        <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8">
          <TicketSelector
            pricePerTicket={raffle.price_per_ticket}
            onQuantityChange={setQuantity}
            selectedQuantity={quantity}
          />

          {/* Resumen */}
          {quantity > 0 && (
            <div className="mt-8 pt-6 border-t space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cantidad:</span>
                <span className="font-semibold">{quantity} {quantity === 1 ? 'boleto' : 'boletos'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio unitario:</span>
                <span className="font-medium">${raffle.price_per_ticket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total a pagar:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>

              {/* Botón continuar */}
              <Button
                size="lg"
                className="w-full mt-6 text-lg py-6"
                onClick={handleContinue}
                disabled={quantity < 1}
              >
                Continuar con los datos
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Los números de boletos se asignarán aleatoriamente después del pago
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

