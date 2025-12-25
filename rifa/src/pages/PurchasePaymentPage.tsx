/**
 * Página de selección de método de pago
 * Muestra opciones: Pagar con Tarjeta o Pagar con PayPhone
 * Después de completar datos personales, antes de la confirmación
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { purchaseService } from '@/features/purchase/services/purchaseService';
import { PayphonePaymentBox } from '@/features/payment/components/PayphonePaymentBox';
import { PayphonePaymentModal } from '@/features/payment/components/PayphonePaymentModal';
import type { PurchaseConfirmation } from '@/features/purchase/types/purchase.types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Stepper } from '@/shared/components/ui/stepper';
import { useToast } from '@/shared/hooks/useToast';

type PaymentMethod = 'card' | 'payphone' | null;

export function PurchasePaymentPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [purchase, setPurchase] = useState<PurchaseConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayphoneModal, setShowPayphoneModal] = useState(false);

  // Cargar datos de la compra
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

  const steps = ['Seleccionar cantidad', 'Completar datos', 'Método de pago', 'Confirmación'];

  const handlePaymentMethodSelect = (method: 'card' | 'payphone') => {
    setPaymentMethod(method);
    
    if (method === 'payphone') {
      // Abrir modal con la cajita de Payphone
      setShowPayphoneModal(true);
    } else if (method === 'card') {
      // TODO: Implementar formulario de tarjeta o redirigir
      toast({
        variant: 'default',
        title: 'Pago con Tarjeta',
        description: 'Esta funcionalidad estará disponible próximamente.',
      });
    }
  };

  const handlePayphoneSuccess = () => {
    // El callback se manejará en PaymentCallbackPage
    // La redirección se hace automáticamente desde Payphone
    setShowPayphoneModal(false);
  };

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

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Método de Pago
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Selecciona cómo deseas realizar el pago
        </p>
        
        {/* Stepper */}
        <div className="max-w-2xl mx-auto mb-8">
          <Stepper steps={steps} currentStep={3} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Columna izquierda: Datos Personales */}
        <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Datos Personales</h2>
          </div>

          <div className="space-y-4">
            {purchase.customerData && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre completo</p>
                  <p className="font-medium">{purchase.customerData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correo electrónico</p>
                  <p className="font-medium">{purchase.customerData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{purchase.customerData.phone}</p>
                </div>
                {purchase.customerData.documentId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Identificación</p>
                    <p className="font-medium">{purchase.customerData.documentId}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              La información solicitada será utilizada exclusivamente para procesar y gestionar tu compra, conforme a nuestros términos y condiciones.
            </p>
          </div>
        </div>

        {/* Columna derecha: Resumen y Método de Pago */}
        <div className="space-y-6">
          {/* Resumen del Pedido */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <CardTitle>Resumen del Pedido</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Proyecto:</span>
                <span className="font-medium">#{purchase.raffle_id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Participaciones:</span>
                <span className="font-medium">{purchase.quantity}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-lg pt-2 border-t">
                <span>Total a Pagar:</span>
                <span className="text-primary">${purchase.total_amount.toFixed(2)} USD</span>
              </div>
            </CardContent>
          </Card>

          {/* Método de Pago */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <CardTitle>Método de Pago</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Opción: Pagar con Tarjeta */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handlePaymentMethodSelect('card')}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {paymentMethod === 'card' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Tarjeta de Débito/Crédito</h3>
                      <div className="flex gap-1">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Visa</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Mastercard</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">PayPhone</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Puedes pagar con tus tarjetas de crédito o débito Visa o Mastercard. Si cuentas con PayPhone, también puedes usar tu saldo disponible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción: Pagar con PayPhone */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'payphone'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handlePaymentMethodSelect('payphone')}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'payphone'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {paymentMethod === 'payphone' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Pagar con PayPhone</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pago directo con tu cuenta PayPhone. Rápido y seguro.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mostrar cajita de Payphone si está seleccionado */}
              {paymentMethod === 'payphone' && purchase.customerData && (
                <div className="mt-4 pt-4 border-t">
                  <PayphonePaymentBox
                    saleId={purchase.sale_id}
                    amount={purchase.total_amount}
                    customerData={{
                      name: purchase.customerData.name,
                      lastName: '',
                      email: purchase.customerData.email,
                      whatsapp: purchase.customerData.phone,
                      documentId: purchase.customerData.documentId,
                    }}
                    raffleTitle={purchase.raffle_title}
                    onSuccess={handlePayphoneSuccess}
                    onError={(error) => {
                      console.error('Error en pago:', error);
                      toast({
                        variant: 'destructive',
                        title: 'Error en el pago',
                        description: error,
                      });
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Sitio 100% Seguro</CardTitle>
              <CardDescription>Tu Seguridad Garantizada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm">SSL Seguro Verificado</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm">Compra Segura Protegido</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm">Pago Seguro Garantizado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Payphone (opcional, para mostrar en popup) */}
      {showPayphoneModal && purchase.customerData && (
        <PayphonePaymentModal
          isOpen={showPayphoneModal}
          onClose={() => setShowPayphoneModal(false)}
          saleId={purchase.sale_id}
          amount={purchase.total_amount}
          customerData={{
            name: purchase.customerData.name,
            lastName: '',
            email: purchase.customerData.email,
            whatsapp: purchase.customerData.phone,
            documentId: purchase.customerData.documentId,
          }}
          raffleTitle={purchase.raffle_title}
          onSuccess={handlePayphoneSuccess}
          onError={(error) => {
            console.error('Error en pago:', error);
            toast({
              variant: 'destructive',
              title: 'Error en el pago',
              description: error,
            });
          }}
        />
      )}
    </div>
  );
}



