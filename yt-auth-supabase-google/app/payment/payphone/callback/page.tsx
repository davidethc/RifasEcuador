'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Página de callback de Payphone
 * 
 * Payphone redirige aquí después de que el usuario complete el pago
 * con los parámetros: id y clientTransactionId
 * 
 * Esta página:
 * 1. Recibe los parámetros de la URL
 * 2. Llama al endpoint /api/payment/payphone/confirm
 * 3. Redirige al usuario según el resultado
 */
function PayphoneCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Procesando pago...');

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Obtener parámetros de la URL
        const id = searchParams.get('id');
        const clientTxId = searchParams.get('clientTransactionId');

        console.log('📥 Callback de Payphone recibido:', { id, clientTxId });

        if (!id || !clientTxId) {
          throw new Error('Parámetros faltantes en la URL');
        }

        // Llamar al endpoint de confirmación
        console.log('🔄 Confirmando transacción...');

        const response = await fetch('/api/payment/payphone/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: parseInt(id),
            clientTxId: clientTxId,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Error al confirmar el pago');
        }

        const transaction = data.transaction;
        console.log('✅ Transacción confirmada:', transaction);

        // Verificar el estado de la transacción
        // Strict check: statusCode 3 AND transactionStatus 'Approved'
        if (transaction.statusCode === 3 && transaction.transactionStatus === 'Approved') {
          // Aprobado
          setStatus('success');
          setMessage('¡Pago aprobado! Redirigiendo...');

          // El orderId completo viene del endpoint de confirmación
          // que lo buscó en la base de datos por el prefijo
          const orderId: string | null = data.orderId || transaction.optionalParameter || null;

          console.log('🔍 OrderId recibido:', orderId);

          // Redirigir a la página de confirmación después de 2 segundos
          setTimeout(() => {
            if (orderId) {
              router.push(`/comprar/${orderId}/confirmacion?status=success&transactionId=${id}`);
            } else {
              router.push('/');
            }
          }, 2000);

        } else if (transaction.statusCode === 2 || (transaction.statusCode === 3 && transaction.transactionStatus !== 'Approved')) {
          // Cancelado o Rechazado (aunque tenga statusCode 3 si no es Approved es rechazo)
          setStatus('error');
          setMessage(`Pago no aprobado: ${transaction.transactionStatus || 'Cancelado'}`);

          setTimeout(() => {
            router.push(`/comprar/error?message=${encodeURIComponent('Pago no aprobado: ' + (transaction.transactionStatus || 'Cancelado'))}`);
          }, 3000);

        } else {
          // Pendiente
          setStatus('loading');
          setMessage('Pago pendiente de confirmación');

          setTimeout(() => {
            router.push('/');
          }, 3000);
        }

      } catch (error) {
        console.error('❌ Error en callback:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Error al procesar el pago');

        setTimeout(() => {
          const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
          router.push('/comprar/error?message=' + encodeURIComponent(errorMessage));
        }, 3000);
      }
    };

    confirmPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-legacy-purple-deep p-4">
      <div className="max-w-md w-full">
        {status === 'loading' && (
          <div className="bg-white dark:bg-legacy-purple-deep rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 dark:border-accent-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-[var(--font-comfortaa)]">
              Procesando pago
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
              {message}
            </p>
            <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
              <p className="text-sm text-primary-800 dark:text-primary-200 font-[var(--font-dm-sans)]">
                Por favor espera mientras confirmamos tu pago...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white dark:bg-legacy-purple-deep rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2 font-[var(--font-comfortaa)]">
              ¡Pago Exitoso!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
              {message}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white dark:bg-legacy-purple-deep rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2 font-[var(--font-comfortaa)]">
              Error en el Pago
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Página de callback con Suspense para useSearchParams
 */
export default function PayphoneCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-legacy-purple-deep">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    }>
      <PayphoneCallbackContent />
    </Suspense>
  );
}
