'use client';

import { useState } from 'react';
import { PayphonePaymentBox } from './PayphonePaymentBox';
import { logger } from '@/utils/logger';

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
    logger.log('✅ Pago exitoso con Payphone:', transactionId);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePayphoneError = (error: string) => {
    logger.error('❌ Error en Payphone:', error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold mb-2 font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
          Método de Pago
        </h2>
        <p className="text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
          Selecciona cómo deseas realizar el pago
        </p>
      </div>

      <div className="space-y-4 md:space-y-5">
        {/* Resumen del pedido */}
        <div className="rounded-2xl border p-4 md:p-5" style={{ 
          background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
          borderColor: '#3A2F5A',
          boxShadow: '0 10px 30px rgba(168, 62, 245, 0.15)'
        }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ 
              background: 'rgba(168, 62, 245, 0.2)',
              border: '1px solid rgba(168, 62, 245, 0.4)',
              boxShadow: '0 0 20px rgba(168, 62, 245, 0.3)'
            }}>
              <svg className="w-4 h-4" style={{ color: '#A83EF5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-bold font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
              Resumen del Pedido
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-[var(--font-dm-sans)]">
              <span style={{ color: '#E5D4FF' }}>Sorteo:</span>
              <span className="font-medium text-right" style={{ color: '#FFFFFF' }}>{raffleTitle}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t font-[var(--font-comfortaa)]" style={{ borderColor: '#3A2F5A' }}>
              <span style={{ color: '#FFFFFF' }}>Total a Pagar:</span>
              <span style={{ color: '#A83EF5' }}>{formatPrice(amount)}</span>
            </div>
          </div>
        </div>

        {/* Opciones de método de pago */}
        <div className="rounded-2xl border p-4 md:p-5" style={{ 
          background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
          borderColor: '#3A2F5A',
          boxShadow: '0 10px 30px rgba(168, 62, 245, 0.15)'
        }}>
          <h3 className="text-base font-bold mb-3 font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
            Selecciona un método de pago
          </h3>
          <div className="space-y-3">
            {/* Opción: Payphone */}
            <button
              onClick={() => handleMethodSelect('payphone')}
              aria-label="Seleccionar método de pago Payphone"
              className="w-full p-3 md:p-4 border rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                style={selectedMethod === 'payphone' 
                  ? {
                      borderColor: '#A83EF5',
                      background: 'rgba(168, 62, 245, 0.15)',
                      boxShadow: '0 0 20px rgba(168, 62, 245, 0.3)'
                    }
                  : {
                      borderColor: '#3A2F5A',
                      background: 'rgba(26, 21, 37, 0.5)'
                    }
                }
                onMouseEnter={(e) => {
                  if (selectedMethod !== 'payphone') {
                    e.currentTarget.style.borderColor = '#5A4A7A';
                    e.currentTarget.style.background = 'rgba(168, 62, 245, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMethod !== 'payphone') {
                    e.currentTarget.style.borderColor = '#3A2F5A';
                    e.currentTarget.style.background = 'rgba(26, 21, 37, 0.5)';
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={selectedMethod === 'payphone'
                      ? {
                          borderColor: '#A83EF5',
                          background: '#A83EF5',
                          boxShadow: '0 0 10px rgba(168, 62, 245, 0.5)'
                        }
                      : {
                          borderColor: '#5A4A7A'
                        }
                    }
                  >
                    {selectedMethod === 'payphone' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#FFFFFF' }}>
                        Pagar con PayPhone
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-xl font-semibold font-[var(--font-dm-sans)]" style={{ 
                        background: 'rgba(168, 62, 245, 0.3)',
                        color: '#A83EF5',
                        border: '1px solid rgba(168, 62, 245, 0.5)',
                        boxShadow: '0 0 10px rgba(168, 62, 245, 0.2)'
                      }}>
                        Recomendado
                      </span>
                    </div>
                    <p className="text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
                      Pago instantáneo con tarjeta o cuenta Payphone. Confirmación inmediata.
                    </p>
                  </div>
                </div>
              </button>

            {/* Opción: Transferencia Bancaria */}
            <button
              onClick={() => handleMethodSelect('transfer')}
              aria-label="Seleccionar método de pago transferencia bancaria"
              className="w-full p-3 md:p-4 border rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                style={selectedMethod === 'transfer' 
                  ? {
                      borderColor: '#A83EF5',
                      background: 'rgba(168, 62, 245, 0.15)',
                      boxShadow: '0 0 20px rgba(168, 62, 245, 0.3)'
                    }
                  : {
                      borderColor: '#3A2F5A',
                      background: 'rgba(26, 21, 37, 0.5)'
                    }
                }
                onMouseEnter={(e) => {
                  if (selectedMethod !== 'transfer') {
                    e.currentTarget.style.borderColor = '#5A4A7A';
                    e.currentTarget.style.background = 'rgba(168, 62, 245, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedMethod !== 'transfer') {
                    e.currentTarget.style.borderColor = '#3A2F5A';
                    e.currentTarget.style.background = 'rgba(26, 21, 37, 0.5)';
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={selectedMethod === 'transfer'
                      ? {
                          borderColor: '#A83EF5',
                          background: '#A83EF5',
                          boxShadow: '0 0 10px rgba(168, 62, 245, 0.5)'
                        }
                      : {
                          borderColor: '#5A4A7A'
                        }
                    }
                  >
                    {selectedMethod === 'transfer' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 font-[var(--font-dm-sans)]" style={{ color: '#FFFFFF' }}>
                      Transferencia Bancaria
                    </h4>
                    <p className="text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
                      Realiza una transferencia a nuestra cuenta. Confirmación manual.
                    </p>
                  </div>
                </div>
              </button>
            </div>

          {/* Área para Cajita de Pagos de Payphone */}
          {selectedMethod === 'payphone' && orderId && (
            <div className="mt-4">
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
            <div className="mt-4 p-4 md:p-5 rounded-lg border" style={{ 
              background: 'rgba(15, 17, 23, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}>
              <h4 className="font-bold mb-3 font-[var(--font-comfortaa)] text-sm md:text-base" style={{ color: '#F9FAFB' }}>
                Instrucciones para Transferencia
              </h4>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-2 md:p-3" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-1 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>Banco:</p>
                    <p className="font-semibold text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Banco Pichincha
                    </p>
                  </div>
                  <div className="rounded-lg border p-2 md:p-3" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-1 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>Tipo:</p>
                    <p className="font-semibold text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      Cuenta Corriente
                    </p>
                  </div>
                  <div className="rounded-lg border p-2 md:p-3 col-span-2" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-1 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>Número de Cuenta:</p>
                    <p className="font-semibold font-mono text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      2100123456
                    </p>
                  </div>
                  <div className="rounded-lg border p-2 md:p-3 col-span-2" style={{ 
                    background: 'rgba(15, 17, 23, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="mb-1 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>Titular:</p>
                    <p className="font-semibold text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                      RifasEcuador S.A.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border p-3 md:p-4 mt-2" style={{ 
                  background: 'rgba(255, 178, 0, 0.1)',
                  borderColor: 'rgba(255, 178, 0, 0.2)'
                }}>
                  <p className="mb-1 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                    Monto a Transferir:
                  </p>
                  <p className="font-bold text-xl md:text-2xl font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
                    {formatPrice(amount)}
                  </p>
                </div>
                <div className="rounded-lg border p-3 md:p-4" style={{ 
                  background: 'rgba(15, 17, 23, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}>
                  <p className="mb-2 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                    Referencia (Importante):
                  </p>
                  <p className="font-mono text-xs p-2 rounded break-all" style={{ 
                    color: '#E5E7EB',
                    background: 'rgba(42, 45, 69, 0.4)'
                  }}>
                    {orderId}
                  </p>
                </div>
                </div>
              <div className="mt-3 p-3 rounded-lg border" style={{ 
                background: 'rgba(255, 178, 0, 0.08)',
                borderColor: 'rgba(255, 178, 0, 0.2)'
              }}>
                <p className="text-xs md:text-sm font-[var(--font-dm-sans)] leading-relaxed" style={{ color: '#9CA3AF' }}>
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

        {/* Información de seguridad */}
        <div className="rounded-lg border p-3 md:p-4" style={{ 
          background: 'rgba(34, 197, 94, 0.08)',
          borderColor: 'rgba(34, 197, 94, 0.2)'
        }}>
          <div className="flex gap-2 md:gap-3">
            <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-xs md:text-sm font-semibold mb-1 font-[var(--font-dm-sans)]" style={{ color: '#22C55E' }}>
                Sitio 100% Seguro
              </p>
              <p className="text-xs font-[var(--font-dm-sans)] leading-relaxed" style={{ color: '#9CA3AF' }}>
                Tu información está protegida con encriptación SSL. Nunca compartimos tus datos personales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

