/**
 * Componente Modal para mostrar la Cajita de Pagos de Payphone
 * Similar al ejemplo de popup, pero usando React y nuestro componente
 */

import { useEffect, useState } from 'react';
import { PayphonePaymentBox } from './PayphonePaymentBox';
import type { PayphoneBoxProps } from '../types/payphone-box.types';
import { Button } from '@/shared/components/ui/button';

interface PayphonePaymentModalProps extends PayphoneBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function PayphonePaymentModal({
  isOpen,
  onClose,
  title = 'Completar Pago',
  saleId,
  amount,
  customerData,
  raffleTitle,
  onSuccess,
  onError,
  backgroundColor,
}: PayphonePaymentModalProps) {
  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    // Actualizar estado montado cuando el modal se abre (usando setTimeout para evitar setState síncrono)
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    // Prevenir scroll del body cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <div
          className="bg-card rounded-lg border shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <h2 id="payment-modal-title" className="text-xl font-semibold">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <svg
                className="w-5 h-5"
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
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {isMounted && (
              <PayphonePaymentBox
                saleId={saleId}
                amount={amount}
                customerData={customerData}
                raffleTitle={raffleTitle}
                onSuccess={(transactionId) => {
                  onSuccess?.(transactionId);
                  // Cerrar modal después de éxito (opcional)
                  // onClose();
                }}
                onError={onError}
                backgroundColor={backgroundColor}
                containerId={`pp-button-modal-${saleId}`}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
