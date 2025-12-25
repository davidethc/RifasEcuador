'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface PayphoneButtonProps {
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
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  onCancelled?: () => void;
}

/**
 * Configuración para el botón de Payphone (Cajita de Pagos)
 */
interface PayphoneButtonConfig {
  token: string;
  storeId: string;
  amount: number;
  tax: number;
  tip: number;
  currency: string;
  clientTransactionId: string;
  env: string;
  responseUrl: string;
  client: {
    name: string;
    email: string;
    phone: string;
    document?: string;
  };
  description: string;
  reference: string;
  onSuccess: (result: PayphoneSuccessResult) => void;
  onError: (error: PayphoneErrorResult) => void;
  onCancelled: () => void;
}

/**
 * Resultado exitoso del pago de Payphone
 */
interface PayphoneSuccessResult {
  transactionId?: string | number;
  [key: string]: unknown;
}

/**
 * Resultado de error del pago de Payphone
 */
interface PayphoneErrorResult {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    PPaymentButtonMount?: (config: PayphoneButtonConfig) => void;
  }
}

/**
 * Componente de botón de pago de Payphone
 * Integra la "Cajita de Pagos" de Payphone para procesar pagos
 * 
 * Documentación: https://docs.payphone.app/cajita-de-pagos-payphone
 */
export function PayphoneButton({
  orderId,
  amount,
  customerData,
  raffleTitle,
  onSuccess,
  onError,
  onCancelled,
}: PayphoneButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);

  // Validar configuración
  const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;
  const storeId = process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID;
  const environment = process.env.NEXT_PUBLIC_PAYPHONE_ENVIRONMENT || 'sandbox';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const initializePayphoneButton = useCallback(() => {
    if (!window.PPaymentButtonMount || !containerRef.current) {
      console.error('❌ PPaymentButtonMount no está disponible');
      return;
    }

    // Validar que token y storeId estén definidos
    if (!token || !storeId) {
      console.error('❌ Token o StoreId no están definidos');
      setLoadError('Configuración de Payphone incompleta. Verifica las variables de entorno.');
      return;
    }

    // Generar un identificador único para la transacción
    const clientTransactionId = `order-${orderId}-${Date.now()}`;
    
    // URL de callback (Payphone redirigirá aquí después del pago)
    const responseUrl = `${appUrl}/api/payment/payphone/callback`;

    // Preparar nombre completo del cliente
    const fullName = `${customerData.name} ${customerData.lastName}`.trim();

    console.log('🚀 Inicializando botón de Payphone con configuración:', {
      orderId,
      clientTransactionId,
      amount,
      environment,
      responseUrl,
    });

    try {
      // Configuración del botón de Payphone
      const config: PayphoneButtonConfig = {
        // Token de autenticación (desde variables de entorno)
        token: token,
        
        // ID de la tienda en Payphone
        storeId: storeId,
        
        // Monto de la transacción
        amount: amount,
        
        // Impuestos (0 para rifas)
        tax: 0,
        
        // Propina (0 para rifas)
        tip: 0,
        
        // Moneda (USD para Ecuador)
        currency: 'USD',
        
        // ID único de transacción del cliente
        clientTransactionId: clientTransactionId,
        
        // Ambiente (sandbox o production)
        env: environment,
        
        // URL de respuesta (callback)
        responseUrl: responseUrl,
        
        // Información del cliente
        client: {
          name: fullName,
          email: customerData.email,
          phone: customerData.whatsapp,
          // Documento de identidad (opcional)
          ...(customerData.documentId && { document: customerData.documentId }),
        },
        
        // Descripción de la compra
        description: `Compra de boletos - ${raffleTitle}`,
        
        // Referencia adicional
        reference: orderId,

        // Callbacks de eventos
        onSuccess: (result: PayphoneSuccessResult) => {
          console.log('✅ Pago exitoso:', result);
          if (onSuccess) {
            const transactionId = result.transactionId 
              ? String(result.transactionId) 
              : clientTransactionId;
            onSuccess(transactionId);
          }
        },

        onError: (error: PayphoneErrorResult) => {
          console.error('❌ Error en el pago:', error);
          const errorMessage = error?.message || error?.error || 'Error al procesar el pago';
          if (onError) {
            onError(errorMessage);
          }
        },

        onCancelled: () => {
          console.log('⚠️ Pago cancelado por el usuario');
          if (onCancelled) {
            onCancelled();
          }
        },
      };

      // Montar el botón de Payphone en el contenedor
      window.PPaymentButtonMount(config);
      console.log('✅ Botón de Payphone montado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Payphone:', error);
      setLoadError('Error al inicializar el sistema de pagos');
    }
  }, [orderId, amount, customerData, raffleTitle, token, storeId, environment, appUrl, onSuccess, onError, onCancelled]);

  useEffect(() => {
    // Validar que existan las variables de entorno
    if (!token || !storeId) {
      setLoadError(
        'Configuración de Payphone incompleta. Verifica las variables de entorno.'
      );
      setIsLoading(false);
      return;
    }

    // Cargar el script de Payphone solo una vez
    if (scriptLoadedRef.current) {
      initializePayphoneButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pay.payphonetodoesposible.com/api/button/js?appId=invoiceApp';
    script.async = true;

    script.onload = () => {
      console.log('✅ Script de Payphone cargado correctamente');
      scriptLoadedRef.current = true;
      setIsLoading(false);
      initializePayphoneButton();
    };

    script.onerror = () => {
      console.error('❌ Error al cargar el script de Payphone');
      setLoadError('No se pudo cargar el sistema de pagos. Intenta recargar la página.');
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remover el script cuando el componente se desmonte
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [token, storeId, initializePayphoneButton]);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-amber-400 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
            Cargando sistema de pagos...
          </p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (loadError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex gap-3">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1 font-[var(--font-dm-sans)]">
              Error al cargar el sistema de pagos
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 font-[var(--font-dm-sans)]">
              {loadError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs font-semibold text-red-800 dark:text-red-200 underline hover:no-underline"
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Contenedor del botón de Payphone
  return (
    <div className="space-y-4">
      {/* Información del monto */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
            Monto a pagar:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-amber-400 font-[var(--font-comfortaa)]">
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Contenedor donde se montará el botón de Payphone */}
      <div
        ref={containerRef}
        id="pp-button"
        className="flex justify-center"
      />

      {/* Información adicional */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-[var(--font-dm-sans)]">
          Al hacer clic en &quot;Pagar&quot;, serás redirigido a la plataforma segura de Payphone
          para completar tu transacción.
        </p>
      </div>
    </div>
  );
}




