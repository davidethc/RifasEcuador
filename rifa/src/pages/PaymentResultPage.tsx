/**
 * Página de agradecimiento después del pago
 * Valida el pago consultando la base de datos y muestra información completa de la compra
 * Basado en la lógica de validación: si Payphone dio 200 (éxito), valida y muestra "gracias por participar"
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { usePayment } from '@/features/payment/hooks/usePayment';
import { purchaseService } from '@/features/purchase/services/purchaseService';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/components/ui/button';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { TicketNumbersDisplay } from '@/features/purchase/components/TicketNumbersDisplay';
import type {
  PayphoneTransactionResponse,
  PayphoneButtonConfirmResponse,
} from '@/features/payment/types/payphone.types';
import type { PurchaseConfirmation } from '@/features/purchase/types/purchase.types';

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkStatus, confirmButtonPayment, isLoading } = usePayment();
  const [transaction, setTransaction] = useState<
    PayphoneTransactionResponse | PayphoneButtonConfirmResponse | null
  >(null);
  const [purchase, setPurchase] = useState<PurchaseConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const status = searchParams.get('status');
  const transactionId = searchParams.get('transactionId');
  const clientTransactionId = searchParams.get('clientTransactionId');

  useEffect(() => {
    async function loadTransactionAndValidate() {
      try {
        setLoading(true);
        setError(null);

        // PASO 1: Confirmar transacción con Payphone (validar que Payphone dio 200/éxito)
        let payphoneStatus: string | null = null;
        let payphoneTransaction: PayphoneTransactionResponse | PayphoneButtonConfirmResponse | null = null;

        if (transactionId && clientTransactionId) {
          console.log('🔍 [DEBUG] PaymentResultPage - Confirmando con Payphone:', { transactionId, clientTransactionId });
          const result = await confirmButtonPayment(Number(transactionId), clientTransactionId);
          
          if (result.success && result.transaction) {
            payphoneTransaction = result.transaction;
            payphoneStatus = result.transaction.transactionStatus; // 'Approved', 'Canceled', etc.
            console.log('✅ [DEBUG] PaymentResultPage - Payphone confirmó:', payphoneStatus);
            setTransaction(payphoneTransaction);
          } else {
            console.error('❌ [DEBUG] PaymentResultPage - Payphone no confirmó:', result.error);
            setError(result.error || 'No se pudo confirmar la transacción con Payphone');
            setLoading(false);
            return;
          }
        } else if (status) {
          // Si solo tenemos status en la URL, usarlo
          payphoneStatus = status;
          console.log('📋 [DEBUG] PaymentResultPage - Usando status de URL:', payphoneStatus);
        } else {
          setError('No se pudo obtener la información de la transacción');
          setLoading(false);
          return;
        }

        // PASO 2: Validar en la base de datos (consultar sales y payments)
        // Extraer sale_id del clientTransactionId (formato: sale-{sale_id}-{timestamp})
        const saleIdMatch = clientTransactionId?.match(/^sale-([a-f0-9-]+)-/);
        const saleId = saleIdMatch ? saleIdMatch[1] : null;

        if (!saleId) {
          console.error('❌ [DEBUG] PaymentResultPage - No se pudo extraer sale_id');
          setError('Error al procesar la transacción. Identificador de venta no válido.');
          setLoading(false);
          return;
        }

        console.log('🔍 [DEBUG] PaymentResultPage - Validando en BD, sale_id:', saleId);

        // PASO 3: Consultar la venta en la base de datos
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .select(`
            id,
            raffle_id,
            ticket_start_number,
            ticket_end_number,
            quantity,
            total_amount,
            payment_status,
            payment_id,
            completed_at,
            created_at,
            raffles:raffle_id (
              id,
              title,
              prize_name,
              prize_image_url
            ),
            customers:customer_id (
              id,
              name,
              email,
              phone
            )
          `)
          .eq('id', saleId)
          .single();

        if (saleError || !saleData) {
          console.error('❌ [DEBUG] PaymentResultPage - Error al obtener venta:', saleError);
          setError('No se pudo encontrar la información de tu compra en la base de datos.');
          setLoading(false);
          return;
        }

        console.log('✅ [DEBUG] PaymentResultPage - Venta encontrada:', {
          payment_status: saleData.payment_status,
          payment_id: saleData.payment_id,
          completed_at: saleData.completed_at,
        });

        // PASO 4: Validar que el pago esté completado en la BD
        // Si Payphone dice "Approved" pero la BD dice "pending", algo está mal
        const isPayphoneApproved = payphoneStatus === 'Approved';
        const isDbCompleted = saleData.payment_status === 'completed';

        if (isPayphoneApproved && !isDbCompleted) {
          console.warn('⚠️ [WARNING] PaymentResultPage - Payphone aprobó pero BD no está completada. Actualizando...');
          
          // Intentar actualizar manualmente
          await supabase
            .from('sales')
            .update({
              payment_status: 'completed',
              payment_id: clientTransactionId,
              completed_at: new Date().toISOString(),
            })
            .eq('id', saleId);
        }

        // PASO 5: Cargar información completa de la compra
        const purchaseData = await purchaseService.getPurchaseConfirmation(saleId);
        
        if (purchaseData) {
          setPurchase(purchaseData);
          console.log('✅ [DEBUG] PaymentResultPage - Compra cargada:', {
            ticket_start: purchaseData.ticket_start_number,
            ticket_end: purchaseData.ticket_end_number,
            quantity: purchaseData.quantity,
          });
        }

        setValidated(true);
        setLoading(false);
      } catch (err) {
        console.error('❌ [ERROR] PaymentResultPage - Error:', err);
        setError('Error al cargar la información del pago');
        setLoading(false);
      }
    }

    loadTransactionAndValidate();
  }, [status, transactionId, clientTransactionId, checkStatus, confirmButtonPayment]);

  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <LoadingState message="Cargando información del pago..." />
      </div>
    );
  }

  // Determinar si el pago fue exitoso
  // Validación: Si Payphone dio 200 (Approved) Y la BD está validada
  const isPayphoneApproved = status === 'Approved' || transaction?.transactionStatus === 'Approved';
  const isDbValidated = validated && purchase?.payment_status === 'completed';
  const isSuccess = isPayphoneApproved && isDbValidated;
  const isCanceled = status === 'Canceled' || transaction?.transactionStatus === 'Canceled';

  // Si el pago fue exitoso, mostrar página de agradecimiento completa
  if (isSuccess && purchase) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        {/* Hero Section - Mensaje de Agradecimiento */}
        <div className="text-center mb-12 sm:mb-16 space-y-6 fade-in-up">
          {/* Icono de éxito grande */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 fade-in-up">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              {/* Efecto de pulso */}
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
            ¡Gracias por Participar!
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
            Tu pago ha sido procesado correctamente. Ya estás participando en el sorteo.
          </p>
        </div>

        {/* Información del Sorteo y Premio */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Imagen del Premio */}
          {purchase.prize_image_url && (
            <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
              <img
                src={purchase.prize_image_url}
                alt={purchase.prize_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {purchase.raffle_title}
                </h2>
                <p className="text-lg sm:text-xl text-white/90 font-medium">
                  Premio: {purchase.prize_name}
                </p>
              </div>
            </div>
          )}

          {/* Información de la Compra */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Números de Boletos Asignados */}
            {purchase.ticket_numbers && purchase.ticket_numbers.length > 0 && (
              <div className="border-t border-border/50 pt-6">
                <TicketNumbersDisplay ticketNumbers={purchase.ticket_numbers} />
              </div>
            )}

            {/* Detalles de la Transacción */}
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6 space-y-4 border border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">Detalles de tu Compra</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cantidad de boletos:</span>
                  <span className="font-semibold">{purchase.quantity}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total pagado:</span>
                  <span className="font-semibold text-primary">
                    ${purchase.total_amount.toFixed(2)} USD
                  </span>
                </div>

                {transaction?.authorizationCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Código de autorización:</span>
                    <span className="font-mono text-xs">{transaction.authorizationCode}</span>
                  </div>
                )}

                {transaction?.transactionId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ID de transacción:</span>
                    <span className="font-mono text-xs">{transaction.transactionId}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha de compra:</span>
                  <span className="font-medium">
                    {new Date(purchase.purchase_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {purchase.ticket_start_number > 0 && purchase.ticket_end_number > 0 && (
                  <div className="flex justify-between text-sm sm:col-span-2">
                    <span className="text-muted-foreground">Rango de boletos:</span>
                    <span className="font-semibold">
                      {purchase.ticket_start_number.toString().padStart(5, '0')} - {purchase.ticket_end_number.toString().padStart(5, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje de Confirmación */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm sm:text-base text-green-800 dark:text-green-200 font-medium mb-1">
                    Pago Confirmado
                  </p>
                  <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                    Tu transacción ha sido validada exitosamente. Recibirás un correo electrónico con los detalles de tu compra.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/my-tickets">
            <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6">
              Ver mis boletos
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Si el pago fue cancelado
  if (isCanceled) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Pago Cancelado
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            El pago fue cancelado. Puedes intentar nuevamente cuando estés listo.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              Intentar nuevamente
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error o está pendiente
  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          {error ? 'Error al Procesar el Pago' : 'Pago Pendiente'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {error || 'Tu pago está siendo procesado. Te notificaremos cuando se complete.'}
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/my-tickets">
            <Button variant="outline" className="w-full sm:w-auto">
              Ver mis boletos
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
