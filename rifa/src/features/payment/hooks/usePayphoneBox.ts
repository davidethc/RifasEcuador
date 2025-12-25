/**
 * Hook para manejar la Cajita de Pagos de Payphone
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { PayphoneBoxConfig, PayphoneBoxProps } from '../types/payphone-box.types';

interface UsePayphoneBoxReturn {
  initializeBox: () => void;
  isReady: boolean;
  error: string | null;
}

/**
 * Convierte dólares a centavos
 */
function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Genera un ID único para la transacción
 */
function generateClientTransactionId(saleId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `sale-${saleId}-${timestamp}-${random}`.substring(0, 50); // Máximo 50 caracteres
}

/**
 * Formatea el número de teléfono para Payphone
 * Formato requerido: +593999999999 (Ecuador)
 * Acepta: +593 939039191, 593939039191, 0939039191, 939039191
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remover TODOS los espacios y caracteres especiales (excepto +)
  const cleaned = phone.replace(/[\s\-().]/g, '');
  
  console.log('🔍 [DEBUG] formatPhoneNumber - Input:', phone, 'Cleaned:', cleaned);
  
  // Si ya tiene +, verificar formato
  if (cleaned.startsWith('+')) {
    // Verificar que después del + tenga código de país válido
    const withoutPlus = cleaned.substring(1);
    if (withoutPlus.startsWith('593')) {
      // Formato: +593939039191 (correcto)
      const numberOnly = withoutPlus.substring(3); // Quitar 593
      if (numberOnly.length >= 9 && numberOnly.length <= 10) {
        const formatted = `+593${numberOnly}`;
        console.log('✅ [DEBUG] formatPhoneNumber - Formatted (con +593):', formatted);
        return formatted;
      }
    } else if (withoutPlus.startsWith('57')) {
      // Si tiene +57, mantenerlo pero advertir
      console.warn('⚠️ [WARNING] Número con código de Colombia (+57). Debería ser Ecuador (+593)');
      return cleaned; // Mantenerlo pero puede fallar en Payphone
    }
    // Si tiene + pero no es 593 ni 57, devolverlo tal cual
    return cleaned;
  }
  
  // Si empieza con 593 (sin +), agregar +
  if (cleaned.startsWith('593')) {
    const numberOnly = cleaned.substring(3); // Quitar 593
    if (numberOnly.length >= 9 && numberOnly.length <= 10) {
      const formatted = `+593${numberOnly}`;
      console.log('✅ [DEBUG] formatPhoneNumber - Formatted (593 sin +):', formatted);
      return formatted;
    }
  }
  
  // Si empieza con 0, reemplazar con +593
  if (cleaned.startsWith('0')) {
    const numberOnly = cleaned.substring(1); // Quitar 0
    if (numberOnly.length >= 9 && numberOnly.length <= 10) {
      const formatted = `+593${numberOnly}`;
      console.log('✅ [DEBUG] formatPhoneNumber - Formatted (0 inicial):', formatted);
      return formatted;
    }
  }
  
  // Si no tiene código de país, agregar +593 (asumiendo Ecuador)
  if (cleaned.length >= 9 && cleaned.length <= 10) {
    const formatted = `+593${cleaned}`;
    console.log('✅ [DEBUG] formatPhoneNumber - Formatted (sin código):', formatted);
    return formatted;
  }
  
  // Si no cumple ninguna condición, devolver con +593 de todas formas
  console.warn('⚠️ [WARNING] formatPhoneNumber - Formato inesperado, forzando +593');
  return `+593${cleaned}`;
}

export function usePayphoneBox({
  saleId,
  amount,
  customerData,
  raffleTitle,
  onError,
  backgroundColor,
  containerId,
}: PayphoneBoxProps): UsePayphoneBoxReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxInstanceRef = useRef<{ render: (containerId: string) => void } | null>(null);
  const containerIdRef = useRef(containerId || `pp-button-${saleId}`);

  // Verificar que el SDK esté cargado
  useEffect(() => {
    const checkSDK = () => {
      if (window.PPaymentButtonBox) {
        setIsReady(true);
        setError(null);
      } else {
        // Intentar nuevamente después de un breve delay
        setTimeout(checkSDK, 100);
      }
    };

    // Verificar inmediatamente
    if (window.PPaymentButtonBox) {
      // Usar setTimeout para evitar setState síncrono en effect
      setTimeout(() => {
        setIsReady(true);
      }, 0);
    } else {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', checkSDK);
      } else {
        checkSDK();
      }
    }

    return () => {
      window.removeEventListener('DOMContentLoaded', checkSDK);
    };
  }, []);

  const initializeBox = useCallback(() => {
    if (!isReady || !window.PPaymentButtonBox) {
      setError('El SDK de Payphone no está cargado');
      onError?.('El SDK de Payphone no está cargado');
      return;
    }

    // Validar variables de entorno
    const token = import.meta.env.VITE_PAYPHONE_BOX_TOKEN;
    const storeId = import.meta.env.VITE_PAYPHONE_BOX_STORE_ID;

    console.log('🔍 [DEBUG] Payphone Box - Variables de entorno:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO DEFINIDO',
      hasStoreId: !!storeId,
      storeId: storeId || 'NO DEFINIDO',
    });

    if (!token) {
      const errorMsg = 'Token de Payphone no configurado. Verifica VITE_PAYPHONE_BOX_TOKEN en .env';
      console.error('❌ [ERROR]', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // StoreId es opcional según documentación de Payphone
    if (!storeId) {
      console.warn('⚠️ [WARNING] Store ID no configurado. Payphone puede funcionar sin él, pero es recomendado.');
    } else {
      console.log('✅ [INFO] Store ID configurado:', storeId);
    }

    try {
      // Convertir montos a centavos
      const amountInCents = dollarsToCents(amount);
      const clientTransactionId = generateClientTransactionId(saleId);
      const formattedPhone = formatPhoneNumber(customerData.whatsapp);

      // Configuración del botón
      // Según documentación: amount debe ser la suma de amountWithTax + amountWithoutTax + tax + service + tip
      // Para simplificar, usamos amountWithoutTax = amount (sin impuestos)
      const config: PayphoneBoxConfig = {
        token,
        clientTransactionId,
        amount: amountInCents, // Total en centavos (requerido)
        amountWithoutTax: amountInCents, // Sin impuestos (opcional pero recomendado)
        currency: 'USD',
        // StoreId es opcional - solo incluirlo si está definido
        ...(storeId && { storeId }),
        reference: `Compra de boletos - ${raffleTitle}`.substring(0, 100), // Máximo 100 caracteres
        phoneNumber: formattedPhone,
        email: customerData.email,
        ...(customerData.documentId && { 
          documentId: customerData.documentId,
          identificationType: 1 // 1=Cédula por defecto
        }),
        lang: 'es',
        defaultMethod: 'card',
        timeZone: -5, // Ecuador
        lat: '-1.831239', // Latitud de Ecuador
        lng: '-78.183406', // Longitud de Ecuador
        optionalParameter: `Venta ${saleId}`,
        ...(backgroundColor && { backgroundColor }), // Agregar backgroundColor si se proporciona
      };

      // Validar que amount sea correcto según documentación
      // amount debe ser >= amountWithoutTax (si se envía)
      if (config.amountWithoutTax && config.amount < config.amountWithoutTax) {
        console.error('❌ [ERROR] amount debe ser >= amountWithoutTax');
        throw new Error('Configuración de montos inválida');
      }

      console.log('🔍 [DEBUG] Payphone Box - Configuración completa:', {
        ...config,
        token: token ? `${token.substring(0, 30)}...${token.substring(token.length - 10)}` : 'NO DEFINIDO', // Mostrar inicio y fin del token para debugging
      });
      
      console.log('💡 [TIP] Si ves error 401, verifica:');
      console.log('   1. La aplicación en Payphone Developer debe ser tipo "Web"');
      console.log('   2. El token debe ser el de la aplicación tipo "Web"');
      console.log('   3. La aplicación debe estar "Activa"');
      console.log('   4. El dominio debe coincidir con el configurado en Payphone Developer');

      // Limpiar contenedor anterior si existe
      const container = document.getElementById(containerIdRef.current);
      if (container) {
        container.innerHTML = '';
      }

      console.log('🔍 [DEBUG] Payphone Box - Inicializando botón...');
      console.log('🔍 [DEBUG] Payphone Box - Configuración completa:', {
        ...config,
        token: `${token.substring(0, 30)}...${token.substring(token.length - 10)}`, // Mostrar inicio y fin del token
      });
      
      // Interceptar errores de red para mejor debugging
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args[0]?.includes?.('payment-button-box') || args[0]?.includes?.('400')) {
          console.error('❌ [ERROR] Payphone API Error:', ...args);
          console.error('💡 [TIP] Revisa la pestaña Network para ver el error completo de Payphone');
        }
        originalConsoleError(...args);
      };
      
      // Crear nueva instancia del botón
      try {
        boxInstanceRef.current = new window.PPaymentButtonBox(config);
        boxInstanceRef.current.render(containerIdRef.current);
        console.log('✅ [SUCCESS] Payphone Box - Botón renderizado');
      } catch (initError) {
        console.error('❌ [ERROR] Error al crear instancia de Payphone Box:', initError);
        throw initError;
      } finally {
        // Restaurar console.error después de un momento
        setTimeout(() => {
          console.error = originalConsoleError;
        }, 1000);
      }

      // Escuchar eventos del botón (si están disponibles)
      // Nota: Payphone puede redirigir directamente, así que el callback se maneja en PaymentCallbackPage

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al inicializar el botón de pago';
      console.error('Error inicializando Payphone Box:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isReady, saleId, amount, customerData, raffleTitle, backgroundColor, onError]);

  return {
    initializeBox,
    isReady,
    error,
  };
}
