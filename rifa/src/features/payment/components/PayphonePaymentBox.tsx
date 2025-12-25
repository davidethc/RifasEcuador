/**
 * Componente de Cajita de Pagos de Payphone
 * Renderiza el botón de pago embebido
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePayphoneBox } from '../hooks/usePayphoneBox';
import type { PayphoneBoxProps } from '../types/payphone-box.types';
import { LoadingState } from '@/shared/components/ui/loading-state';

export function PayphonePaymentBox({
  saleId,
  amount,
  customerData,
  raffleTitle,
  onSuccess,
  onError,
  backgroundColor,
  containerId,
  onRender,
}: PayphoneBoxProps) {
  const defaultContainerId = containerId || `pp-button-${saleId}`;
  const { initializeBox, isReady, error } = usePayphoneBox({
    saleId,
    amount,
    customerData,
    raffleTitle,
    onSuccess,
    onError,
    backgroundColor,
    containerId: defaultContainerId,
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    // Inicializar el botón cuando el SDK esté listo
    if (isReady && !initializedRef.current) {
      initializeBox();
      initializedRef.current = true;
      onRender?.(); // Notificar que se renderizó
    }
  }, [isReady, initializeBox, onRender]);

  // Función para reinicializar (útil para modales)
  const handleReinitialize = useCallback(() => {
    if (isReady) {
      // Limpiar contenedor
      const container = document.getElementById(defaultContainerId);
      if (container) {
        container.innerHTML = '';
      }
      initializedRef.current = false;
      // Reinicializar
      setTimeout(() => {
        initializeBox();
        initializedRef.current = true;
        onRender?.();
      }, 100);
    }
  }, [isReady, defaultContainerId, initializeBox, onRender]);

  // Exponer función de reinicialización (útil para modales)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      type WindowWithPayphone = Window & {
        [key: string]: (() => void) | undefined;
      };
      const windowWithPayphone = window as WindowWithPayphone;
      windowWithPayphone[`reinitPayphone_${saleId}`] = handleReinitialize;
    }
    return () => {
      if (typeof window !== 'undefined') {
        type WindowWithPayphone = Window & {
          [key: string]: (() => void) | undefined;
        };
        const windowWithPayphone = window as WindowWithPayphone;
        delete windowWithPayphone[`reinitPayphone_${saleId}`];
      }
    };
  }, [saleId, isReady, handleReinitialize]);

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Por favor, recarga la página o contacta con soporte si el problema persiste.
        </p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex justify-center py-8">
        <LoadingState message="Cargando botón de pago..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        id={defaultContainerId}
        className="w-full flex justify-center"
        // El botón se renderizará aquí por Payphone
      />
      <p className="text-xs text-center text-muted-foreground mt-4">
        El formulario de pago expirará en 10 minutos. Si no completas el pago, deberás generar uno nuevo.
      </p>
    </div>
  );
}
