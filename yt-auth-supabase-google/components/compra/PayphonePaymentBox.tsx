'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';

interface PayphonePaymentBoxProps {
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
}

interface PPaymentButtonBoxConfig {
  token: string;
  storeId: string;
  clientTransactionId: string;
  amount: number;
  amountWithoutTax: number;
  currency: string;
  reference: string;
  responseUrl?: string;
  lang: string;
  defaultMethod: string;
  phoneNumber: string;
  email: string;
  documentId: string;
  identificationType: number;
  timeZone?: number;
  lat?: string;
  lng?: string;
  optionalParameter?: string;
}

interface PPaymentButtonBox {
  render: (containerId: string) => void;
}

declare global {
  interface Window {
    PPaymentButtonBox?: new (config: PPaymentButtonBoxConfig) => PPaymentButtonBox;
  }
}

/**
 * Componente de Cajita de Pagos de Payphone
 * Usa el widget oficial de Payphone con scripts CDN
 * 
 * Documentación: https://docs.payphone.app/cajita-de-pagos-payphone
 */
export function PayphonePaymentBox({
  orderId,
  amount,
  customerData,
  raffleTitle,
  onSuccess,
  onError,
}: PayphonePaymentBoxProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const buttonRendered = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validar configuración
  const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;
  const storeId = process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID;

  // Debug: Log temporal para verificar variables (eliminar despudés)
  useEffect(() => {
    console.log('🔍 Debug Payphone Variables:', {
      hasToken: !!token,
      hasStoreId: !!storeId,
      tokenLength: token?.length || 0,
      storeIdValue: storeId || 'NO DEFINIDO',
      allEnvVars: {
        NEXT_PUBLIC_PAYPHONE_TOKEN: process.env.NEXT_PUBLIC_PAYPHONE_TOKEN ? 'DEFINIDO' : 'NO DEFINIDO',
        NEXT_PUBLIC_PAYPHONE_STORE_ID: process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID ? 'DEFINIDO' : 'NO DEFINIDO',
        NEXT_PUBLIC_PAYPHONE_ENVIRONMENT: process.env.NEXT_PUBLIC_PAYPHONE_ENVIRONMENT || 'NO DEFINIDO',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NO DEFINIDO',
      }
    });
  }, []);

  useEffect(() => {
    if (!token || !storeId) {
      console.error('❌ Variables faltantes:', {
        token: token ? 'OK' : 'FALTA',
        storeId: storeId ? 'OK' : 'FALTA'
      });
      setLoadError('Configuración de Payphone incompleta. Verifica las variables de entorno.');
      return;
    }
  }, [token, storeId]);

  /**
   * Maneja mensajes del iframe de Payphone
   */
  const handlePayphoneMessage = useCallback((event: MessageEvent) => {
    // Verificar origen por seguridad
    if (!event.origin.includes('payphone')) {
      return;
    }

    console.log('📨 Mensaje de Payphone:', event.data);

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      if (data.event === 'payment_success') {
        console.log('✅ Pago exitoso:', data);
        if (onSuccess) {
          onSuccess(data.transactionId || 'success');
        }
      } else if (data.event === 'payment_error') {
        console.error('❌ Error en el pago:', data);
        if (onError) {
          onError(data.message || 'Error en el pago');
        }
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!isScriptLoaded || buttonRendered.current || !token || !storeId) {
      return;
    }

    // Esperar a que el window tenga PPaymentButtonBox
    const initializePaymentBox = () => {
      if (!window.PPaymentButtonBox) {
        console.error('❌ PPaymentButtonBox no está disponible');
        setLoadError('Error al cargar el sistema de pagos');
        return;
      }

      try {
        // Convertir dólares a centavos
        const amountInCents = Math.round(amount * 100);

        // Generar ID único para la transacción
        // Límite de Payphone: 50 caracteres
        // Formato: primeros 8 chars del orderId + timestamp acortado
        const orderShort = orderId.substring(0, 8);
        const timestamp = Date.now().toString().substring(3); // Quitar primeros 3 dígitos
        const clientTransactionId = `ord-${orderShort}-${timestamp}`;

        // Verificar longitud (debe ser <= 50)
        if (clientTransactionId.length > 50) {
          console.error('❌ clientTransactionId demasiado largo:', clientTransactionId.length);
          setLoadError('Error de configuración: ID de transacción inválido');
          return;
        }

        console.log('🔑 ClientTransactionId generado:', {
          value: clientTransactionId,
          length: clientTransactionId.length,
          orderId: orderId,
        });

        // URL de callback (donde Payphone redirigirá después del pago)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const responseUrl = `${appUrl}/payment/payphone/callback`;

        // Limpiar y validar número de teléfono de Ecuador
        let cleanPhone = customerData.whatsapp.trim();

        // Remover caracteres no numéricos (excepto +)
        cleanPhone = cleanPhone.replace(/[^\d+]/g, '');

        // Si empieza con +593, usar tal cual
        // Si empieza con 593, agregar +
        // Si empieza con 0, reemplazar 0 por +593
        // Si no tiene código de país, agregar +593
        if (cleanPhone.startsWith('+593')) {
          // Ya está bien
        } else if (cleanPhone.startsWith('593')) {
          cleanPhone = '+' + cleanPhone;
        } else if (cleanPhone.startsWith('0')) {
          cleanPhone = '+593' + cleanPhone.substring(1);
        } else {
          cleanPhone = '+593' + cleanPhone;
        }

        // Validar longitud (Ecuador: +593 + 9 dígitos = 13 caracteres)
        if (cleanPhone.length !== 13) {
          console.warn('⚠️ Número de teléfono con longitud incorrecta:', {
            original: customerData.whatsapp,
            cleaned: cleanPhone,
            length: cleanPhone.length,
            expected: 13
          });
        }

        console.log('📱 Número de teléfono procesado:', {
          original: customerData.whatsapp,
          cleaned: cleanPhone,
          isValid: cleanPhone.length === 13 && cleanPhone.startsWith('+593')
        });

        console.log('🚀 Inicializando Cajita de Pagos:', {
          orderId,
          clientTransactionId,
          amount: amountInCents,
          responseUrl,
          phoneNumber: cleanPhone,
        });

        // Configuración de la Cajita de Pagos
        const config: PPaymentButtonBoxConfig = {
          // Credenciales
          token: token,
          storeId: storeId,

          // Transacción
          clientTransactionId: clientTransactionId,
          amount: amountInCents,
          amountWithoutTax: amountInCents, // Rifas no tienen impuestos
          currency: 'USD',
          reference: `Compra de boletos - ${raffleTitle}`,

          // URL de respuesta (callback después del pago)
          responseUrl: responseUrl,

          // Configuración visual
          lang: 'es',
          defaultMethod: 'card', // 'card' para tarjeta, 'payphone' para app

          // Datos del cliente (obligatorios según documentación)
          phoneNumber: cleanPhone,
          email: customerData.email,
          documentId: customerData.documentId || '9999999999',
          identificationType: customerData.documentId ? 1 : 1, // 1=Cédula, 2=RUC, 3=Pasaporte

          // Ubicación (opcional)
          timeZone: -5, // Ecuador GMT-5
          lat: '-1.831239',
          lng: '-78.183406',

          // Parámetro opcional
          optionalParameter: orderId,
        };

        console.log('📋 Configuración:', config);

        // Crear instancia y renderizar
        const ppb = new window.PPaymentButtonBox(config);
        ppb.render('pp-button');

        buttonRendered.current = true;
        console.log('✅ Cajita de Pagos renderizada');

        // Escuchar eventos del iframe (opcional)
        window.addEventListener('message', handlePayphoneMessage);

      } catch (error) {
        console.error('❌ Error al inicializar Cajita de Pagos:', error);
        setLoadError('Error al inicializar el sistema de pagos');
        if (onError) {
          onError(error instanceof Error ? error.message : 'Error desconocido');
        }
      }
    };

    // Intentar inicializar
    initializePaymentBox();

    // Cleanup
    return () => {
      window.removeEventListener('message', handlePayphoneMessage);
    };
  }, [isScriptLoaded, token, storeId, orderId, amount, customerData, raffleTitle, onError, onSuccess, handlePayphoneMessage]);

  const handleScriptLoad = () => {
    console.log('✅ Script de Cajita de Pagos cargado');
    setIsScriptLoaded(true);
  };

  const handleScriptError = () => {
    console.error('❌ Error al cargar script de Cajita de Pagos');
    setLoadError('No se pudo cargar el sistema de pagos. Intenta recargar la página.');
  };

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

  return (
    <>
      {/* Cargar CSS de la Cajita de Pagos */}
      <link
        rel="stylesheet"
        href="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css"
      />

      {/* Cargar JavaScript de la Cajita de Pagos */}
      <Script
        src="https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />

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

        {/* Estado de carga */}
        {!isScriptLoaded && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-amber-400 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
                Cargando sistema de pagos...
              </p>
            </div>
          </div>
        )}

        {/* Contenedor donde se renderizará la Cajita de Pagos */}
        <div
          ref={containerRef}
          id="pp-button"
          className="min-h-[200px] flex justify-center items-center"
        />

        {/* Información adicional */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-[var(--font-dm-sans)]">
            <strong>🔒 Pago 100% seguro</strong><br />
            Puedes pagar con tarjeta de crédito/débito o con tu cuenta Payphone.
            Tu información está protegida.
          </p>
        </div>
      </div>
    </>
  );
}
