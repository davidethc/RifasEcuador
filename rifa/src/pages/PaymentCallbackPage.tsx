/**
 * Página de callback de Payphone
 * Recibe los parámetros id y clientTransactionID de Payphone
 * Procesa la transacción y redirige a la página de resultado
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePayment } from '@/features/payment/hooks/usePayment';
import { supabase } from '@/shared/lib/supabase';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Button } from '@/shared/components/ui/button';

export function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmButtonPayment, isLoading } = usePayment();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        // Obtener parámetros de Payphone (Cajita de Pagos)
        // Payphone envía: id y clientTransactionID (o clientTransactionId)
        const transactionId = searchParams.get('id');
        const clientTransactionId = 
          searchParams.get('clientTransactionID') || 
          searchParams.get('clientTransactionId') ||
          searchParams.get('clientTxId'); // Variaciones posibles del parámetro

        if (!transactionId || !clientTransactionId) {
          setError('Parámetros de transacción incompletos. Se requieren id y clientTransactionID');
          setProcessing(false);
          return;
        }

        // Confirmar el estado de la transacción usando el endpoint de Cajita de Pagos
        // ⚠️ IMPORTANTE: Debe confirmarse dentro de los primeros 5 minutos
        // o Payphone reversará automáticamente la transacción
        const result = await confirmButtonPayment(
          Number(transactionId),
          clientTransactionId
        );

        if (!result.success || !result.transaction) {
          // Manejar errores específicos
          let errorMessage = result.error || 'No se pudo confirmar el estado de la transacción';
          
          // Error 20: Transacción no existe
          if (result.errorCode === 20) {
            errorMessage = 'La transacción no existe o ya fue procesada. Verifica el identificador.';
          }
          
          // Si el error es genérico, agregar información útil
          if (!result.errorCode) {
            errorMessage += ' Si el pago fue realizado, contacta con soporte para verificar el estado.';
          }

          setError(errorMessage);
          setProcessing(false);
          return;
        }

        const transaction = result.transaction;

        // Extraer sale_id del clientTransactionId
        // Formato: sale-{sale_id}-{timestamp}
        const saleIdMatch = clientTransactionId.match(/^sale-([a-f0-9-]+)-/);
        const saleId = saleIdMatch ? saleIdMatch[1] : null;

        if (!saleId) {
          console.error('❌ No se pudo extraer sale_id de clientTransactionId:', clientTransactionId);
          setError('Error al procesar la transacción. El identificador de venta no es válido.');
          setProcessing(false);
          return;
        }

        console.log('🔍 [DEBUG] PaymentCallbackPage - sale_id extraído:', saleId);

        // Buscar o crear registro en payments
        let payment = null;
        const { data: existingPayment, error: paymentError } = await supabase
          .from('payments')
          .select('id, sale_id')
          .eq('payment_id', clientTransactionId)
          .maybeSingle();

        if (paymentError && paymentError.code !== 'PGRST116') {
          console.error('❌ Error al buscar pago:', paymentError);
        }

        if (existingPayment) {
          payment = existingPayment;
          console.log('✅ [DEBUG] PaymentCallbackPage - Pago existente encontrado:', payment.id);
        } else {
          // Crear registro en payments si no existe
          console.log('📝 [DEBUG] PaymentCallbackPage - Creando registro en payments...');
          
          // Obtener información de la venta para el monto
          const { data: sale, error: saleError } = await supabase
            .from('sales')
            .select('id, total_amount')
            .eq('id', saleId)
            .single();

          if (saleError || !sale) {
            console.error('❌ Error al obtener información de la venta:', saleError);
            setError('Error al procesar la transacción. Venta no encontrada.');
            setProcessing(false);
            return;
          }

          const { data: newPayment, error: createError } = await supabase
            .from('payments')
            .insert({
              sale_id: saleId,
              payment_id: clientTransactionId,
              amount: sale.total_amount,
              currency: 'USD',
              status: transaction.transactionStatus.toLowerCase(),
              payphone_response: transaction,
            })
            .select('id, sale_id')
            .single();

          if (createError) {
            console.error('❌ Error al crear registro de pago:', createError);
            // Continuar de todas formas, intentar actualizar sales directamente
          } else {
            payment = newPayment;
            console.log('✅ [DEBUG] PaymentCallbackPage - Registro de pago creado:', payment.id);
          }
        }

        // Actualizar el estado del pago si existe
        if (payment) {
          await supabase
            .from('payments')
            .update({
              transaction_id: transaction.transactionId?.toString(),
              status: transaction.transactionStatus.toLowerCase(),
              payphone_response: transaction,
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.id);
        }

        // Actualizar el estado de la venta directamente usando sale_id
        const saleStatus =
          transaction.transactionStatus === 'Approved'
            ? 'completed'
            : transaction.transactionStatus === 'Canceled'
            ? 'cancelled'
            : 'pending';

        console.log('📝 [DEBUG] PaymentCallbackPage - Actualizando venta:', {
          saleId,
          saleStatus,
          transactionStatus: transaction.transactionStatus,
        });

        const { error: updateSaleError } = await supabase
          .from('sales')
          .update({
            payment_id: clientTransactionId,
            payment_status: saleStatus,
            completed_at: saleStatus === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', saleId);

        if (updateSaleError) {
          console.error('❌ Error al actualizar venta:', updateSaleError);
        } else {
          console.log('✅ [DEBUG] PaymentCallbackPage - Venta actualizada correctamente');
        }

        // Si el pago fue aprobado, asignar boletos y enviar correos
        if (saleStatus === 'completed') {
          console.log('🎫 [DEBUG] PaymentCallbackPage - Pago aprobado, asignando boletos...');
          
          // Obtener información completa de la venta para asignar boletos y enviar correos
          const { data: saleInfo, error: saleInfoError } = await supabase
            .from('sales')
            .select(`
              raffle_id, 
              quantity, 
              ticket_start_number, 
              ticket_end_number,
              total_amount,
              customer:customers(id, name, email),
              raffle:raffles(id, title)
            `)
            .eq('id', saleId)
            .single();

          if (!saleInfoError && saleInfo) {
            let ticketStart = saleInfo.ticket_start_number;
            let ticketEnd = saleInfo.ticket_end_number;
            
            // Solo asignar boletos si no están asignados (ticket_start_number = 0)
            if (saleInfo.ticket_start_number === 0 || saleInfo.ticket_end_number === 0) {
              const { data: assignmentResult, error: assignmentError } = await supabase.rpc(
                'assign_tickets_atomic',
                {
                  p_raffle_id: saleInfo.raffle_id,
                  p_quantity: saleInfo.quantity,
                  p_sale_id: saleId,
                }
              );

              if (assignmentError) {
                console.error('❌ Error al asignar boletos:', assignmentError);
              } else if (assignmentResult && Array.isArray(assignmentResult) && assignmentResult.length > 0) {
                const assignment = assignmentResult[0];
                if (assignment.success) {
                  ticketStart = assignment.ticket_start_number;
                  ticketEnd = assignment.ticket_end_number;
                  console.log('✅ [DEBUG] PaymentCallbackPage - Boletos asignados:', {
                    start: ticketStart,
                    end: ticketEnd,
                  });
                } else {
                  console.error('❌ Error al asignar boletos:', assignment.error_message);
                }
              }
            } else {
              console.log('✅ [DEBUG] PaymentCallbackPage - Boletos ya asignados');
            }

            // Enviar correos de confirmación
            if (ticketStart > 0 && ticketEnd > 0 && saleInfo.customer && saleInfo.raffle) {
              console.log('📧 [DEBUG] PaymentCallbackPage - Enviando correos de confirmación...');
              
              // Formatear números de boletos
              const ticketNumbers = ticketStart === ticketEnd 
                ? ticketStart.toString().padStart(3, '0')
                : `${ticketStart.toString().padStart(3, '0')}-${ticketEnd.toString().padStart(3, '0')}`;

              // Obtener URL de Supabase para llamar a la Edge Function
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

              if (supabaseUrl && supabaseAnonKey) {
                try {
                  const emailResponse = await fetch(
                    `${supabaseUrl}/functions/v1/send-purchase-email`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                      },
                      body: JSON.stringify({
                        saleId,
                        customerEmail: (saleInfo.customer as any).email,
                        customerName: (saleInfo.customer as any).name,
                        raffleTitle: (saleInfo.raffle as any).title,
                        ticketNumbers,
                        totalAmount: parseFloat(saleInfo.total_amount.toString()),
                        quantity: saleInfo.quantity,
                        paymentId: clientTransactionId,
                      }),
                    }
                  );

                  const emailResult = await emailResponse.json();
                  
                  if (emailResult.success) {
                    console.log('✅ [DEBUG] PaymentCallbackPage - Correos enviados correctamente');
                  } else {
                    console.error('❌ Error al enviar correos:', emailResult.error);
                    // No bloqueamos el flujo si falla el envío de correos
                  }
                } catch (emailError) {
                  console.error('❌ Error al llamar función de correos:', emailError);
                  // No bloqueamos el flujo si falla el envío de correos
                }
              } else {
                console.warn('⚠️ Variables de entorno de Supabase no configuradas, no se pueden enviar correos');
              }
            }
          }
        }

        // Redirigir a la página de resultado con los datos
        navigate(
          `/payment/result?status=${transaction.transactionStatus}&transactionId=${transaction.transactionId}&clientTransactionId=${transaction.clientTransactionId}`,
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error('Error procesando callback:', err);
        setError('Error al procesar la respuesta de Payphone');
        setProcessing(false);
      }
    }

    processCallback();
  }, [searchParams, navigate, confirmButtonPayment]);

  if (processing || isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <LoadingState message="Procesando tu pago..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center py-12">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6 mb-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-destructive mb-2">
              Error al procesar el pago
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Importante:</strong> Si realizaste el pago, verifica tu correo electrónico o 
                contacta con soporte. El sistema procesará tu transacción automáticamente.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} variant="outline">
              Volver al inicio
            </Button>
            <Button onClick={() => navigate('/my-tickets')}>
              Ver mis boletos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
