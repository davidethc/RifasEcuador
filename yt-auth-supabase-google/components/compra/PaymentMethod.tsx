'use client';

import { useState } from 'react';
import { PayphonePaymentBox } from './PayphonePaymentBox';

interface PaymentMethodProps {
  orderId?: string;
  amount: number;
  customerData: {
    name: string;
    lastName: string;
    whatsapp: string;
    email: string;
    documentId?: string;
  };
  raffleTitle: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Componente para selección de método de pago
 * Soporta Payphone y Transferencia Bancaria
 */
export function PaymentMethod({
  orderId,
  amount,
  customerData,
  raffleTitle,
  onSuccess,
  onError,
}: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<'payphone' | 'transfer' | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleMethodSelect = (method: 'payphone' | 'transfer') => {
    setSelectedMethod(method);
  };

  const handlePayphoneSuccess = (transactionId: string) => {
    console.log('✅ Pago exitoso con Payphone:', transactionId);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePayphoneError = (error: string) => {
    console.error('❌ Error en Payphone:', error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 font-[var(--font-comfortaa)]">
          Método de Pago
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
          Selecciona cómo deseas realizar el pago
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Datos personales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-amber-400/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
              Datos Personales
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">Nombre completo</p>
              <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                {customerData.name} {customerData.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">Correo electrónico</p>
              <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                {customerData.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">Teléfono</p>
              <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                {customerData.whatsapp}
              </p>
            </div>
            {customerData.documentId && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">Identificación</p>
                <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                  {customerData.documentId}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Método de pago */}
        <div className="space-y-6">
          {/* Resumen del pedido */}
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-blue-200 dark:border-amber-400/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
                Resumen del Pedido
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-[var(--font-dm-sans)]">
                <span className="text-gray-600 dark:text-gray-400">Sorteo:</span>
                <span className="font-medium text-gray-900 dark:text-white text-right">{raffleTitle}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300 dark:border-gray-600 font-[var(--font-comfortaa)]">
                <span className="text-gray-900 dark:text-white">Total a Pagar:</span>
                <span className="text-blue-600 dark:text-amber-400">{formatPrice(amount)}</span>
              </div>
            </div>
          </div>

          {/* Opciones de método de pago */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
              Selecciona un método de pago
            </h3>
            <div className="space-y-4">
              {/* Opción: Payphone */}
              <button
                onClick={() => handleMethodSelect('payphone')}
                className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                  selectedMethod === 'payphone'
                    ? 'border-blue-600 dark:border-amber-400 bg-blue-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-amber-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'payphone'
                        ? 'border-blue-600 dark:border-amber-400 bg-blue-600 dark:bg-amber-400'
                        : 'border-gray-400 dark:border-gray-500'
                    }`}
                  >
                    {selectedMethod === 'payphone' && <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-900" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                        Pagar con PayPhone
                      </h4>
                      <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-0.5 rounded font-semibold font-[var(--font-dm-sans)]">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                      Pago instantáneo con tarjeta o cuenta Payphone. Confirmación inmediata.
                    </p>
                  </div>
                </div>
              </button>

              {/* Opción: Transferencia Bancaria */}
              <button
                onClick={() => handleMethodSelect('transfer')}
                className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                  selectedMethod === 'transfer'
                    ? 'border-blue-600 dark:border-amber-400 bg-blue-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-amber-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'transfer'
                        ? 'border-blue-600 dark:border-amber-400 bg-blue-600 dark:bg-amber-400'
                        : 'border-gray-400 dark:border-gray-500'
                    }`}
                  >
                    {selectedMethod === 'transfer' && <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-900" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 font-[var(--font-dm-sans)]">
                      Transferencia Bancaria
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                      Realiza una transferencia a nuestra cuenta. Confirmación manual.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Área para Cajita de Pagos de Payphone */}
            {selectedMethod === 'payphone' && orderId && (
              <div className="mt-6">
                <PayphonePaymentBox
                  orderId={orderId}
                  amount={amount}
                  customerData={customerData}
                  raffleTitle={raffleTitle}
                  onSuccess={handlePayphoneSuccess}
                  onError={handlePayphoneError}
                />
              </div>
            )}

            {/* Instrucciones para Transferencia */}
            {selectedMethod === 'transfer' && (
              <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
                  Instrucciones para Transferencia
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)]">
                      Banco:
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Banco Pichincha
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)]">
                      Tipo de Cuenta:
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      Cuenta Corriente
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)]">
                      Número de Cuenta:
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white font-mono font-[var(--font-dm-sans)]">
                      2100123456
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)]">
                      Titular:
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white font-[var(--font-dm-sans)]">
                      RifasEcuador S.A.
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-amber-100 dark:from-blue-900/20 dark:to-amber-900/20 rounded-lg p-4 border-2 border-blue-300 dark:border-amber-400/50">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)]">
                      Monto a Transferir:
                    </p>
                    <p className="font-bold text-blue-600 dark:text-amber-400 text-2xl font-[var(--font-comfortaa)]">
                      {formatPrice(amount)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)]">
                      Referencia (Importante):
                    </p>
                    <p className="font-mono text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      {orderId}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 font-[var(--font-dm-sans)]">
                    <strong>Importante:</strong> Después de realizar la transferencia, envía el
                    comprobante por WhatsApp al número{' '}
                    <a
                      href="https://wa.me/593999999999"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      +593 99 999 9999
                    </a>{' '}
                    junto con tu ID de orden para confirmar tu compra.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Información de seguridad */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1 font-[var(--font-dm-sans)]">
                  Sitio 100% Seguro
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 font-[var(--font-dm-sans)]">
                  Tu información está protegida con encriptación SSL. Nunca compartimos tus datos personales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
