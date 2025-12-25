'use client';

import { useState } from 'react';
import type { CreatePaymentParams } from '@/types/payphone.types';

interface PayphoneSaleButtonProps {
  orderId: string;
  amount: number;
  customerData: {
    name: string;
    lastName: string;
    email: string;
    whatsapp: string;
    documentId?: string;
  };
  raffleTitle: string;
  onSuccess?: (transactionId: number) => void;
  onError?: (error: string) => void;
}

type PaymentStatus = 'idle' | 'creating' | 'pending' | 'polling' | 'success' | 'error';

/**
 * Componente de pago con Payphone API Sale
 * Usa la API Sale directamente en lugar del botón widget
 * 
 * Documentación: https://www.docs.payphone.app/api-implementacion
 */
export function PayphoneSaleButton({
  orderId,
  amount,
  customerData,
  raffleTitle,
  onSuccess,
  onError,
}: PayphoneSaleButtonProps) {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);

  const maxPollingAttempts = 60; // 5 minutos (cada 5 segundos)
  const pollingInterval = 5000; // 5 segundos

  /**
   * Limpia el número de teléfono
   */
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/[\s+\-()]/g, '');
  };

  /**
   * Valida el número de teléfono
   */
  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = cleanPhoneNumber(phone);
    // Validar que tenga 10 dígitos (para Ecuador)
    return /^\d{10}$/.test(cleaned);
  };

  /**
   * Crea la solicitud de pago con Payphone
   */
  const handleCreatePayment = async () => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Por favor ingresa un número de teléfono válido de 10 dígitos');
      return;
    }

    setStatus('creating');
    setErrorMessage(null);

    try {
      const cleanedPhone = cleanPhoneNumber(phoneNumber);

      const params: CreatePaymentParams = {
        orderId,
        phoneNumber: cleanedPhone,
        countryCode: '593', // Ecuador
        amount,
        customerData: {
          name: customerData.name,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.whatsapp,
          documentId: customerData.documentId,
        },
        raffleTitle,
      };

      console.log('🚀 Creando pago con Payphone...');

      const response = await fetch('/api/payment/payphone/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      console.log('✅ Pago creado:', data);

      setTransactionId(data.transactionId);
      setStatus('pending');
      setPollingAttempts(0);

      // Iniciar polling del estado
      startPolling(data.transactionId);

    } catch (error) {
      console.error('❌ Error al crear pago:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(message);
      setStatus('error');
      if (onError) {
        onError(message);
      }
    }
  };

  /**
   * Inicia el polling para verificar el estado del pago
   */
  const startPolling = (txId: number) => {
    setStatus('polling');

    const pollStatus = async (attempts: number) => {
      if (attempts >= maxPollingAttempts) {
        setErrorMessage('Tiempo de espera agotado. Por favor verifica el estado del pago manualmente.');
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`/api/payment/payphone/status?transactionId=${txId}`);
        const data = await response.json();

        if (data.success && data.transaction) {
          const txStatus = data.transaction.transactionStatus;
          const txStatusCode = data.transaction.statusCode;

          console.log('📊 Estado de transacción:', {
            status: txStatus,
            statusCode: txStatusCode,
            attempts,
          });

          if (txStatusCode === 3) {
            // Aprobado
            console.log('✅ Pago aprobado');
            setStatus('success');
            if (onSuccess) {
              onSuccess(txId);
            }
            return;
          } else if (txStatusCode === 2) {
            // Cancelado
            console.log('❌ Pago cancelado');
            setErrorMessage('El pago fue cancelado');
            setStatus('error');
            if (onError) {
              onError('Pago cancelado');
            }
            return;
          } else {
            // Pendiente (statusCode === 1), continuar polling
            setPollingAttempts(attempts + 1);
            setTimeout(() => pollStatus(attempts + 1), pollingInterval);
          }
        } else {
          // Error al consultar
          setPollingAttempts(attempts + 1);
          setTimeout(() => pollStatus(attempts + 1), pollingInterval);
        }
      } catch (error) {
        console.error('Error al consultar estado:', error);
        // Continuar intentando
        setPollingAttempts(attempts + 1);
        setTimeout(() => pollStatus(attempts + 1), pollingInterval);
      }
    };

    // Iniciar el primer intento después de 5 segundos
    setTimeout(() => pollStatus(0), pollingInterval);
  };

  /**
   * Cancela el proceso
   */
  const handleCancel = () => {
    setStatus('idle');
    setPhoneNumber('');
    setErrorMessage(null);
    setTransactionId(null);
    setPollingAttempts(0);
  };

  // Estados del componente

  // Estado: Idle (esperando que el usuario ingrese el teléfono)
  if (status === 'idle') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-900/20 dark:to-amber-900/20 border-2 border-blue-200 dark:border-amber-400/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
            Pagar con Payphone
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-[var(--font-dm-sans)]">
                Número de teléfono registrado en Payphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0987654321"
                maxLength={10}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-amber-400 focus:outline-none font-[var(--font-dm-sans)]"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-[var(--font-dm-sans)]">
                Ingresa el número de teléfono que usas en tu cuenta de Payphone (10 dígitos)
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200 font-[var(--font-dm-sans)]">
                  {errorMessage}
                </p>
              </div>
            )}

            <button
              onClick={handleCreatePayment}
              disabled={!phoneNumber || !validatePhoneNumber(phoneNumber)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-amber-500 dark:to-amber-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-amber-600 dark:hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-[var(--font-comfortaa)] text-lg shadow-lg hover:shadow-xl"
            >
              Solicitar Pago
            </button>
          </div>

          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-[var(--font-dm-sans)]">
              <strong>📱 ¿Cómo funciona?</strong><br />
              1. Ingresa tu número de Payphone<br />
              2. Recibirás una notificación en tu app<br />
              3. Confirma el pago en tu aplicación Payphone<br />
              4. ¡Listo! Tu compra será confirmada automáticamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Creando pago
  if (status === 'creating') {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-amber-400"></div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
            Creando solicitud de pago...
          </p>
        </div>
      </div>
    );
  }

  // Estado: Pendiente / Polling (esperando confirmación del usuario)
  if (status === 'pending' || status === 'polling') {
    const timeRemaining = Math.max(0, 300 - (pollingAttempts * 5)); // 5 minutos
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-ping absolute h-20 w-20 rounded-full bg-amber-400 opacity-75"></div>
            <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-amber-500 dark:bg-amber-600">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
              ¡Revisa tu app de Payphone!
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
              Hemos enviado una solicitud de pago a tu teléfono
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
              Número: {phoneNumber}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
                Esperando confirmación...
              </span>
              <span className="text-sm font-mono text-amber-600 dark:text-amber-400 font-bold">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(pollingAttempts / maxPollingAttempts) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 w-full">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-[var(--font-dm-sans)]">
              <strong>📱 Instrucciones:</strong><br />
              1. Abre tu aplicación Payphone<br />
              2. Verás una notificación de pago<br />
              3. Revisa los detalles y confirma<br />
              4. Espera la confirmación automática
            </p>
          </div>

          <button
            onClick={handleCancel}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline font-[var(--font-dm-sans)]"
          >
            Cancelar y volver
          </button>
        </div>
      </div>
    );
  }

  // Estado: Éxito
  if (status === 'success') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2 font-[var(--font-comfortaa)]">
              ¡Pago Aprobado!
            </h3>
            <p className="text-lg text-green-700 dark:text-green-300 font-[var(--font-dm-sans)]">
              Tu compra ha sido confirmada exitosamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Error
  if (status === 'error') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 font-[var(--font-comfortaa)]">
              Error en el pago
            </h3>
            <p className="text-lg text-red-700 dark:text-red-300 font-[var(--font-dm-sans)]">
              {errorMessage || 'Ocurrió un error al procesar el pago'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="mt-4 bg-red-600 dark:bg-red-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-all font-[var(--font-comfortaa)]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return null;
}
