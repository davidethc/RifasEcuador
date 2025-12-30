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
        <h2 className="text-2xl md:text-3xl font-bold mb-3 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
          Método de Pago
        </h2>
        <p className="text-base font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
          Selecciona cómo deseas realizar el pago
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Datos personales - Consistente con formulario principal */}
        <div className="rounded-lg border p-6" style={{ 
          background: 'rgba(28, 32, 58, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
              background: 'rgba(168, 62, 245, 0.15)',
              border: '1px solid rgba(168, 62, 245, 0.2)'
            }}>
              <svg className="w-5 h-5" style={{ color: '#A83EF5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
              Datos Personales
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-[var(--font-dm-sans)] mb-1" style={{ color: '#9CA3AF' }}>Nombre completo</p>
              <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                {customerData.name} {customerData.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-[var(--font-dm-sans)] mb-1" style={{ color: '#9CA3AF' }}>Correo electrónico</p>
              <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                {customerData.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-[var(--font-dm-sans)] mb-1" style={{ color: '#9CA3AF' }}>Teléfono</p>
              <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                {customerData.whatsapp}
              </p>
            </div>
            {customerData.documentId && (
              <div>
                <p className="text-sm font-[var(--font-dm-sans)] mb-1" style={{ color: '#9CA3AF' }}>Identificación</p>
                <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                  {customerData.documentId}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Método de pago */}
        <div className="space-y-6">
          {/* Resumen del pedido - Consistente con formulario principal */}
          <div className="rounded-lg border p-6" style={{ 
            background: 'rgba(28, 32, 58, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                background: 'rgba(168, 62, 245, 0.15)',
                border: '1px solid rgba(168, 62, 245, 0.2)'
              }}>
                <svg className="w-5 h-5" style={{ color: '#A83EF5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
                Resumen del Pedido
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-[var(--font-dm-sans)]">
                <span style={{ color: '#9CA3AF' }}>Sorteo:</span>
                <span className="font-medium text-right" style={{ color: '#E5E7EB' }}>{raffleTitle}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t font-[var(--font-comfortaa)]" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span style={{ color: '#E5E7EB' }}>Total a Pagar:</span>
                <span style={{ color: '#FFB200' }}>{formatPrice(amount)}</span>
              </div>
            </div>
          </div>

          {/* Opciones de método de pago - Consistente con formulario principal */}
          <div className="rounded-lg border p-6" style={{ 
            background: 'rgba(28, 32, 58, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 className="text-lg font-bold mb-4 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
              Selecciona un método de pago
            </h3>
            <div className="space-y-4">
              {/* Opción: Payphone */}
              <button
                onClick={() => handleMethodSelect('payphone')}
                className="w-full p-4 border rounded-lg transition-all text-left"
                style={selectedMethod === 'payphone' 
                  ? {
                      borderColor: 'rgba(168, 62, 245, 0.4)',
                      background: 'rgba(168, 62, 245, 0.1)'
                    }
                  : {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      background: 'rgba(15, 17, 23, 0.4)'
                    }
                }
                onMouseEnter={(e) => {
                  if (selectedMethod !== 'payphone') {
                    e.currentTarget.style.borderColor = 'rgba(168, 62, 245, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMethod !== 'payphone') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center"
                    style={selectedMethod === 'payphone'
                      ? {
                          borderColor: '#A83EF5',
                          background: '#A83EF5'
                        }
                      : {
                          borderColor: 'rgba(107, 114, 128, 0.5)'
                        }
                    }
                  >
                    {selectedMethod === 'payphone' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                        Pagar con PayPhone
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded font-semibold font-[var(--font-dm-sans)]" style={{ 
                        background: 'rgba(168, 62, 245, 0.2)',
                        color: '#A83EF5',
                        border: '1px solid rgba(168, 62, 245, 0.3)'
                      }}>
                        Recomendado
                      </span>
                    </div>
                    <p className="text-sm font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Pago instantáneo con tarjeta o cuenta Payphone. Confirmación inmediata.
                    </p>
                  </div>
                </div>
              </button>

              {/* Opción: Transferencia Bancaria */}
              <button
                onClick={() => handleMethodSelect('transfer')}
                className="w-full p-4 border rounded-lg transition-all text-left"
                style={selectedMethod === 'transfer' 
                  ? {
                      borderColor: 'rgba(168, 62, 245, 0.4)',
                      background: 'rgba(168, 62, 245, 0.1)'
                    }
                  : {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      background: 'rgba(15, 17, 23, 0.4)'
                    }
                }
                onMouseEnter={(e) => {
                  if (selectedMethod !== 'transfer') {
                    e.currentTarget.style.borderColor = 'rgba(168, 62, 245, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMethod !== 'transfer') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center"
                    style={selectedMethod === 'transfer'
                      ? {
                          borderColor: '#A83EF5',
                          background: '#A83EF5'
                        }
                      : {
                          borderColor: 'rgba(107, 114, 128, 0.5)'
                        }
                    }
                  >
                    {selectedMethod === 'transfer' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Transferencia Bancaria
                    </h4>
                    <p className="text-sm font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
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

            {/* Instrucciones para Transferencia - Consistente con formulario */}
            {selectedMethod === 'transfer' && (
              <div className="mt-6 p-6 rounded-lg border" style={{ 
                background: 'rgba(15, 17, 23, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}>
                <h4 className="font-bold mb-4 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
                  Instrucciones para Transferencia
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border p-4" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Banco:
                    </p>
                    <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Banco Pichincha
                    </p>
                  </div>
                  <div className="rounded-lg border p-4" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Tipo de Cuenta:
                    </p>
                    <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Cuenta Corriente
                    </p>
                  </div>
                  <div className="rounded-lg border p-4" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Número de Cuenta:
                    </p>
                    <p className="font-semibold font-mono font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      2100123456
                    </p>
                  </div>
                  <div className="rounded-lg border p-4" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Titular:
                    </p>
                    <p className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      RifasEcuador S.A.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4" style={{ 
                    background: 'rgba(255, 178, 0, 0.1)',
                    borderColor: 'rgba(255, 178, 0, 0.2)'
                  }}>
                    <p className="mb-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Monto a Transferir:
                    </p>
                    <p className="font-bold text-2xl font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
                      {formatPrice(amount)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Referencia (Importante):
                    </p>
                    <p className="font-mono text-xs p-2 rounded" style={{ 
                      color: '#E5E7EB',
                      background: 'rgba(42, 45, 69, 0.4)'
                    }}>
                      {orderId}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg border" style={{ 
                  background: 'rgba(255, 178, 0, 0.08)',
                  borderColor: 'rgba(255, 178, 0, 0.2)'
                }}>
                  <p className="text-sm font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                    <strong style={{ color: '#E5E7EB' }}>Importante:</strong> Después de realizar la transferencia, envía el
                    comprobante por WhatsApp al número{' '}
                    <a
                      href="https://wa.me/593999999999"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                      style={{ color: '#A83EF5' }}
                    >
                      +593 99 999 9999
                    </a>{' '}
                    junto con tu ID de orden para confirmar tu compra.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Información de seguridad - Consistente */}
          <div className="rounded-lg border p-4" style={{ 
            background: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.2)'
          }}>
            <div className="flex gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold mb-1 font-[var(--font-dm-sans)]" style={{ color: '#22C55E' }}>
                  Sitio 100% Seguro
                </p>
                <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
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
