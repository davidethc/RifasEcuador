import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { purchaseService } from '@/features/purchase/services/purchaseService';
import { TicketNumbersDisplay } from '@/features/purchase/components/TicketNumbersDisplay';
import { PayphonePaymentBox } from '@/features/payment/components/PayphonePaymentBox';
import type { PurchaseConfirmation } from '@/features/purchase/types/purchase.types';
import { Button } from '@/shared/components/ui/button';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Stepper } from '@/shared/components/ui/stepper';

/**
 * Página de confirmación de compra
 * Muestra "TE FALTO UN PASO" con números asignados aleatoriamente arriba del premio
 * Diseño 100% responsivo igual que HomePage
 */
export function PurchaseConfirmationPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const [purchase, setPurchase] = useState<PurchaseConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPurchase() {
      if (!saleId) {
        setError('ID de compra no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await purchaseService.getPurchaseConfirmation(saleId);
        
        if (!data) {
          setError('Compra no encontrada');
          return;
        }

        setPurchase(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar la compra';
        setError(errorMessage);
        console.error('Error loading purchase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPurchase();
  }, [saleId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <LoadingState message="Cargando información de tu compra..." />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || 'Compra no encontrada'}</p>
          <Link to="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const steps = ['Seleccionar cantidad', 'Completar datos', 'Confirmación'];

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header - Mismo estilo que HomePage */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          ¡Te falta un paso!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Completa tus datos para finalizar tu participación
        </p>
        
        {/* Stepper */}
        <div className="max-w-2xl mx-auto mb-8">
          <Stepper steps={steps} currentStep={3} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8">
        {/* Números de boletos - Arriba del premio */}
        <div className="mb-8 sm:mb-12">
          <TicketNumbersDisplay ticketNumbers={purchase.ticket_numbers} />
        </div>

        {/* Imagen del premio - Mismo estilo que HomePage */}
        <div className="aspect-video bg-muted rounded-lg mb-6 sm:mb-8 overflow-hidden">
          {purchase.prize_image_url ? (
            <img
              src={purchase.prize_image_url}
              alt={purchase.prize_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        {/* Información del sorteo - Mismo estilo que HomePage */}
        <div className="space-y-4 mb-6 sm:mb-8">
          <h3 className="text-xl font-semibold text-card-foreground">
            {purchase.raffle_title}
          </h3>

          <p className="text-sm font-medium text-primary">
            Premio: {purchase.prize_name}
          </p>

          {/* Detalles de la compra */}
          <div className="bg-muted/30 rounded-lg p-4 sm:p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cantidad de boletos:</span>
              <span className="font-semibold">{purchase.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total pagado:</span>
              <span className="font-semibold text-primary">
                ${purchase.total_amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha de compra:</span>
              <span className="font-medium">
                {new Date(purchase.purchase_date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Botón de pago Payphone - Solo si el pago está pendiente */}
        {purchase.payment_status === 'pending' && purchase.customerData && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Completa tu pago
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Realiza el pago para confirmar tus boletos
              </p>
              <PayphonePaymentBox
                saleId={purchase.sale_id}
                amount={purchase.total_amount}
                customerData={{
                  name: purchase.customerData.name,
                  lastName: '', // Se obtiene del nombre completo
                  email: purchase.customerData.email,
                  whatsapp: purchase.customerData.phone,
                  documentId: purchase.customerData.documentId, // Cédula/documento si está disponible
                }}
                raffleTitle={purchase.raffle_title}
                onSuccess={() => {
                  // El callback se manejará en PaymentCallbackPage
                  // La redirección se hace automáticamente desde Payphone
                }}
                onError={(error) => {
                  console.error('Error en pago:', error);
                }}
              />
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {purchase.payment_status === 'completed' ? (
            <>
              <Link to={`/raffles/${purchase.raffle_id}`}>
                <Button variant="outline" className="w-full sm:w-auto">
                  Ver sorteo
                </Button>
              </Link>
              <Link to="/my-tickets">
                <Button className="w-full sm:w-auto">
                  Ver mis boletos
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Volver al inicio
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
