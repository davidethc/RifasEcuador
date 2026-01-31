'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PayphonePaymentBox } from './PayphonePaymentBox';
import { logger } from '@/utils/logger';
import { buildPayphoneErrorExplanation, type PayphoneErrorExplanation } from '@/utils/payphoneUserMessage';

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
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedReference, setCopiedReference] = useState(false);
  const [payphoneError, setPayphoneError] = useState<PayphoneErrorExplanation | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofResult, setProofResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [transferNotifying, setTransferNotifying] = useState(false);
  const [transferNotice, setTransferNotice] = useState<{ ok: boolean; message: string } | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleMethodSelect = (method: 'payphone' | 'transfer') => {
    setSelectedMethod(method);
    setPayphoneError(null);
    setProofResult(null);
    if (method === 'transfer') {
      // Make the order visible in Admin → Transferencias even before uploading proof
      void notifyTransfer();
    }
  };

  const handlePayphoneSuccess = (transactionId: string) => {
    logger.log('✅ Pago exitoso con Payphone:', transactionId);
    setPayphoneError(null);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePayphoneError = (error: string) => {
    logger.error('❌ Error en Payphone:', error);
    const explanation = buildPayphoneErrorExplanation({ rawError: error });
    setPayphoneError(explanation);
    if (onError) {
      onError(explanation.userMessage);
    }
  };

  const notifyTransfer = async () => {
    if (!orderId) {
      setTransferNotice({ ok: false, message: 'Falta el ID de la orden' });
      return;
    }

    setTransferNotifying(true);
    setTransferNotice(null);
    try {
      const res = await fetch('/api/payment/transfer/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email: customerData.email,
          phone: customerData.whatsapp,
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string; error?: string };
      if (!res.ok || !data?.success) {
        setTransferNotice({ ok: false, message: data?.error || 'No se pudo avisar al sistema' });
        return;
      }

      setTransferNotice({ ok: true, message: data?.message || 'Listo: tu orden quedó registrada como transferencia.' });
    } catch (e) {
      setTransferNotice({ ok: false, message: e instanceof Error ? e.message : 'Error inesperado' });
    } finally {
      setTransferNotifying(false);
    }
  };

  const retryPayphone = () => {
    setPayphoneError(null);
    // Forzar remount del widget (el componente se desmonta y vuelve a montar)
    setSelectedMethod(null);
    setTimeout(() => setSelectedMethod('payphone'), 50);
  };

  const uploadTransferProof = async () => {
    if (!orderId) {
      setProofResult({ ok: false, message: 'Falta el ID de la orden' });
      return;
    }
    if (!proofFile) {
      setProofResult({ ok: false, message: 'Selecciona un comprobante (imagen o PDF)' });
      return;
    }

    setProofUploading(true);
    setProofResult(null);
    try {
      const form = new FormData();
      form.append('orderId', orderId);
      form.append('email', customerData.email);
      form.append('phone', customerData.whatsapp);
      form.append('file', proofFile);

      const res = await fetch('/api/payment/transfer/upload-proof', {
        method: 'POST',
        body: form,
      });

      const data = (await res.json()) as { success?: boolean; message?: string; error?: string };
      if (!res.ok || !data?.success) {
        setProofResult({ ok: false, message: data?.error || 'No se pudo subir el comprobante' });
        return;
      }

      setProofResult({ ok: true, message: data?.message || 'Comprobante recibido. Quedará en revisión.' });
    } catch (e) {
      setProofResult({ ok: false, message: e instanceof Error ? e.message : 'Error inesperado' });
    } finally {
      setProofUploading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-5 w-full min-w-0 max-w-full overflow-hidden">
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
            {/* Opción: Payphone - Tamaño consistente */}
            <button
              onClick={() => handleMethodSelect('payphone')}
              aria-label="Seleccionar método de pago Payphone"
              className="w-full p-3 md:p-4 border rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-h-[90px] flex items-center"
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
                <div className="flex items-center gap-4 w-full">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold font-[var(--font-dm-sans)]" style={{ color: '#FFFFFF' }}>
                        Pagar con PayPhone
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-xl font-semibold font-[var(--font-dm-sans)] whitespace-nowrap" style={{ 
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

            {/* Opción: Transferencia Bancaria - Tamaño consistente */}
            <button
              onClick={() => handleMethodSelect('transfer')}
              aria-label="Seleccionar método de pago transferencia bancaria"
              className="w-full p-3 md:p-4 border rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-h-[90px] flex items-center"
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
                <div className="flex items-center gap-4 w-full">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
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
                  <div className="flex-1 min-w-0">
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

          {/* Área para Cajita de Pagos de Payphone - Ancho fijo */}
          {selectedMethod === 'payphone' && orderId && (
            <div className="mt-4 w-full min-w-0 max-w-full overflow-hidden">
              {payphoneError && (
                <div
                  className="mb-4 rounded-xl border p-4"
                  style={{
                    background: 'rgba(239, 68, 68, 0.10)',
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: '#FCA5A5' }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold mb-1 font-[var(--font-dm-sans)]" style={{ color: '#FCA5A5' }}>
                        {payphoneError.title}
                      </p>
                      <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                        {payphoneError.userMessage}
                      </p>
                      <ul className="mt-2 text-xs list-disc pl-5 space-y-1 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                        {payphoneError.possibleCauses.slice(0, 3).map((cause) => (
                          <li key={cause}>{cause}</li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={retryPayphone}
                          className="text-xs font-semibold underline hover:no-underline"
                          style={{ color: '#A83EF5' }}
                        >
                          Intentar nuevamente
                        </button>
                        {payphoneError.technicalHint && (
                          <span className="text-[11px] font-mono" style={{ color: '#6B7280' }}>
                            {payphoneError.technicalHint}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

          {/* Instrucciones para Transferencia - Rediseño UX Mejorado */}
          {selectedMethod === 'transfer' && (
            <div className="mt-4 w-full min-w-0 max-w-full overflow-hidden space-y-4">
              {/* Subir comprobante (web) - Mantiene WhatsApp como respaldo */}
              {orderId && (
                <div
                  className="rounded-xl border p-5"
                  style={{
                    background: 'rgba(15, 17, 23, 0.6)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'rgba(34, 197, 94, 0.18)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                      }}
                    >
                      <span className="text-lg font-bold font-[var(--font-comfortaa)]" style={{ color: '#22C55E' }}>
                        0
                      </span>
                    </div>
                    <h4 className="font-bold text-base font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
                      Sube tu comprobante aquí (recomendado)
                    </h4>
                  </div>

                  <p className="text-sm font-[var(--font-dm-sans)] mb-3" style={{ color: '#E5D4FF' }}>
                    Así tu pago queda en revisión inmediata en el sistema. También puedes enviarlo por WhatsApp como respaldo.
                  </p>

                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={notifyTransfer}
                      disabled={transferNotifying}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                      style={{
                        background: 'rgba(255,255,255,0.10)',
                        color: '#E5E7EB',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {transferNotifying ? 'Avisando…' : 'Avisar al sistema'}
                    </button>
                    <span className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      (para que aparezca en Admin → Transferencias)
                    </span>
                  </div>

                  {transferNotice && (
                    <div
                      className="mb-3 rounded-lg border p-3"
                      style={{
                        background: transferNotice.ok ? 'rgba(34, 197, 94, 0.10)' : 'rgba(239, 68, 68, 0.10)',
                        borderColor: transferNotice.ok ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                        color: '#E5E7EB',
                      }}
                    >
                      <p className="text-sm font-[var(--font-dm-sans)]">{transferNotice.message}</p>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="flex-1 text-sm"
                      style={{ color: '#E5E7EB' }}
                    />
                    <button
                      type="button"
                      onClick={uploadTransferProof}
                      disabled={proofUploading || !proofFile}
                      className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: '#22C55E',
                        color: '#0F1117',
                      }}
                    >
                      {proofUploading ? 'Subiendo...' : 'Enviar comprobante'}
                    </button>
                  </div>

                  {proofResult && (
                    <div
                      className="mt-3 rounded-lg border p-3"
                      style={{
                        background: proofResult.ok ? 'rgba(34, 197, 94, 0.10)' : 'rgba(239, 68, 68, 0.10)',
                        borderColor: proofResult.ok ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                        color: '#E5E7EB',
                      }}
                    >
                      <p className="text-sm font-[var(--font-dm-sans)]">{proofResult.message}</p>
                      {proofResult.ok && (
                        <p className="mt-1 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                          Ya debería aparecer en Admin → Transferencias (máximo 15s).
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Paso 1: Datos Bancarios - Destacado y fácil de copiar */}
              <div className="rounded-xl border p-5" style={{ 
                background: 'linear-gradient(135deg, rgba(168, 62, 245, 0.1) 0%, rgba(15, 17, 23, 0.6) 100%)',
                borderColor: 'rgba(168, 62, 245, 0.3)',
                boxShadow: '0 4px 20px rgba(168, 62, 245, 0.15)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                    background: 'rgba(168, 62, 245, 0.2)',
                    border: '1px solid rgba(168, 62, 245, 0.4)'
                  }}>
                    <span className="text-lg font-bold font-[var(--font-comfortaa)]" style={{ color: '#A83EF5' }}>1</span>
                  </div>
                  <h4 className="font-bold text-base font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
                    Realiza la Transferencia
                  </h4>
                </div>

                {/* QR para pago (deuna! / Banco Pichincha) */}
                <div className="flex justify-center mb-4">
                  <div className="rounded-xl overflow-hidden p-4 text-center" style={{ 
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Paga con QR
                    </p>
                    <div className="relative inline-block rounded-lg overflow-hidden" style={{ maxWidth: 220 }}>
                      <Image
                        src="/qr.jpg"
                        alt="QR para transferencia - Banco Pichincha / deuna!"
                        width={220}
                        height={220}
                        className="object-contain w-full h-auto"
                        unoptimized
                      />
                    </div>
                    <p className="text-xs mt-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Escanea con tu app de banca y paga al instante
                    </p>
                  </div>
                </div>
                
                {/* Datos bancarios en formato destacado */}
                <div className="space-y-3">
                  {/* Número de cuenta - Lo más importante */}
                  <div className="rounded-lg p-4" style={{ 
                    background: 'rgba(255, 178, 0, 0.15)',
                    border: '2px solid rgba(255, 178, 0, 0.3)'
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold font-[var(--font-dm-sans)] uppercase tracking-wide" style={{ color: '#FFB200' }}>
                        Número de Cuenta
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText('2209782102');
                            setCopiedAccount(true);
                            setTimeout(() => setCopiedAccount(false), 2000);
                          } catch (err) {
                            logger.error('Error al copiar:', err);
                          }
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
                        style={{ 
                          color: copiedAccount ? '#22C55E' : '#FFB200',
                          background: copiedAccount ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 178, 0, 0.2)',
                          border: `1px solid ${copiedAccount ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 178, 0, 0.3)'}`
                        }}
                        onMouseEnter={(e) => {
                          if (!copiedAccount) {
                            e.currentTarget.style.background = 'rgba(255, 178, 0, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!copiedAccount) {
                            e.currentTarget.style.background = 'rgba(255, 178, 0, 0.2)';
                          }
                        }}
                      >
                        {copiedAccount ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-xl font-bold font-[var(--font-dm-sans)]" style={{ color: '#FFFFFF' }}>
                      2209782102
                    </p>
                  </div>

                  {/* Otros datos en grid compacto */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium mb-1 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>Banco</p>
                      <p className="font-semibold text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>Banco Pichincha</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>Tipo</p>
                      <p className="font-semibold text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>Cuenta de ahorro transaccional</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>Titular</p>
                    <p className="font-semibold text-sm font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>Santiago Ismael Carpio Zavala</p>
                  </div>
                </div>
              </div>

              {/* Paso 2: Monto y Referencia - Destacado */}
              <div className="rounded-xl border p-5" style={{ 
                background: 'rgba(15, 17, 23, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                    background: 'rgba(255, 178, 0, 0.2)',
                    border: '1px solid rgba(255, 178, 0, 0.4)'
                  }}>
                    <span className="text-lg font-bold font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>2</span>
                  </div>
                  <h4 className="font-bold text-base font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
                    Monto y Referencia
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {/* Monto destacado */}
                  <div className="rounded-lg p-4 text-center" style={{ 
                    background: 'rgba(255, 178, 0, 0.1)',
                    border: '1px solid rgba(255, 178, 0, 0.2)'
                  }}>
                    <p className="text-xs font-medium mb-2 font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                      Monto a Transferir
                    </p>
                    <p className="font-bold text-3xl font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
                      {formatPrice(amount)}
                    </p>
                  </div>

                  {/* Referencia con botón copiar */}
                  <div className="rounded-lg p-4" style={{ 
                    background: 'rgba(42, 45, 69, 0.4)',
                    border: '1px solid rgba(168, 62, 245, 0.3)'
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold font-[var(--font-dm-sans)]" style={{ color: '#A83EF5' }}>
                        ⚠️ Referencia (OBLIGATORIA)
                      </p>
                      {orderId && (
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(orderId);
                              setCopiedReference(true);
                              setTimeout(() => setCopiedReference(false), 2000);
                            } catch (err) {
                              logger.error('Error al copiar:', err);
                            }
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
                          style={{ 
                            color: copiedReference ? '#22C55E' : '#A83EF5',
                            background: copiedReference ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 62, 245, 0.2)',
                            border: `1px solid ${copiedReference ? 'rgba(34, 197, 94, 0.4)' : 'rgba(168, 62, 245, 0.3)'}`
                          }}
                          onMouseEnter={(e) => {
                            if (!copiedReference) {
                              e.currentTarget.style.background = 'rgba(168, 62, 245, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!copiedReference) {
                              e.currentTarget.style.background = 'rgba(168, 62, 245, 0.2)';
                            }
                          }}
                        >
                          {copiedReference ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {orderId && (
                      <p className="font-mono text-sm p-2 rounded break-all bg-black/20" style={{ color: '#E5E7EB' }}>
                        {orderId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Paso 3: Confirmar Pago - CTA Principal */}
              <div className="rounded-xl border p-5" style={{ 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 17, 23, 0.6) 100%)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.15)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.4)'
                  }}>
                    <span className="text-lg font-bold font-[var(--font-comfortaa)]" style={{ color: '#22C55E' }}>3</span>
                  </div>
                  <h4 className="font-bold text-base font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
                    Confirma tu Pago
                  </h4>
                </div>
                
                <p className="text-sm font-[var(--font-dm-sans)] mb-4 leading-relaxed" style={{ color: '#9CA3AF' }}>
                  Después de realizar la transferencia, envía el comprobante por WhatsApp. 
                  <strong style={{ color: '#E5E7EB' }}> Tu orden será confirmada en menos de 24 horas.</strong>
                </p>
                
                {/* Botón CTA Principal - Más prominente */}
                {orderId && (
                  <a
                    href={`https://wa.me/593960948984?text=${encodeURIComponent(
                      `¡Hola! He realizado el pago por transferencia bancaria.\n\n` +
                      `📋 *Detalles de mi compra:*\n` +
                      `• ID de Orden: ${orderId}\n` +
                      `• Monto: ${formatPrice(amount)}\n` +
                      `• Sorteo: ${raffleTitle}\n` +
                      `• Nombre: ${customerData.name} ${customerData.lastName}\n` +
                      `• Cédula: ${customerData.documentId || 'N/A'}\n\n` +
                      `Adjunto el comprobante de transferencia. Por favor, confírmenme la recepción del pago.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #25D366 0%, #20BA5A 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      boxShadow: '0 6px 30px rgba(37, 211, 102, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #20BA5A 0%, #1DA851 100%)';
                      e.currentTarget.style.boxShadow = '0 8px 35px rgba(37, 211, 102, 0.6)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #25D366 0%, #20BA5A 100%)';
                      e.currentTarget.style.boxShadow = '0 6px 30px rgba(37, 211, 102, 0.5)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg 
                      className="w-7 h-7" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span className="font-[var(--font-dm-sans)]">Ya hice el pago - Enviar comprobante</span>
                  </a>
                )}

                {/* Info adicional de tiempo */}
                <div className="mt-4 flex items-center gap-2 text-xs font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#22C55E' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Confirmación en menos de 24 horas hábiles</span>
                </div>
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

