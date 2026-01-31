import { NextRequest, NextResponse } from 'next/server';
import type { PayphoneSaleRequest, PayphoneSaleResponse, PayphoneErrorResponse } from '@/types/payphone.types';
import axios, { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

/**
 * API Route para crear un pago con Payphone API Sale
 * 
 * Este endpoint se ejecuta en el servidor para proteger el token de Payphone.
 * No exponer el token en el frontend.
 * 
 * Documentación: https://www.docs.payphone.app/api-implementacion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      orderId,
      phoneNumber,
      countryCode,
      amount, // En dólares
      customerData,
      raffleTitle,
    } = body;

    logger.debug('📥 Solicitud de pago recibida:', {
      orderId,
      phoneNumber,
      amount,
    });

    // ============================================
    // VALIDACIONES DE ENTRADA
    // ============================================
    
    // Validar orderId
    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de orden requerido',
        },
        { status: 400 }
      );
    }

    // Validar phoneNumber
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 7) {
      return NextResponse.json(
        {
          success: false,
          error: 'Número de teléfono inválido',
        },
        { status: 400 }
      );
    }

    // Validar countryCode
    if (!countryCode || typeof countryCode !== 'string' || !/^\d{1,3}$/.test(countryCode)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código de país inválido',
        },
        { status: 400 }
      );
    }

    // Validar amount
    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Monto inválido. Debe ser un número positivo menor a $100,000',
        },
        { status: 400 }
      );
    }

    // Validar customerData
    if (!customerData || typeof customerData !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos del cliente requeridos',
        },
        { status: 400 }
      );
    }

    // Validar email del cliente
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerData.email || !emailRegex.test(customerData.email.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email del cliente inválido',
        },
        { status: 400 }
      );
    }

    // Validar nombre del cliente
    if (!customerData.name || typeof customerData.name !== 'string' || customerData.name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre del cliente inválido',
        },
        { status: 400 }
      );
    }

    // Sanitizar inputs
    const sanitizedOrderId = orderId.trim();
    const sanitizedPhoneNumber = phoneNumber.trim();
    const sanitizedCountryCode = countryCode.trim();
    const sanitizedEmail = customerData.email.trim().toLowerCase();
    const sanitizedName = customerData.name.trim();
    const sanitizedLastName = (customerData.lastName || '').trim();

    // Validar variables de entorno
    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;
    const storeId = process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID;
    const environment = process.env.NEXT_PUBLIC_PAYPHONE_ENVIRONMENT || 'sandbox';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!token || !storeId) {
      logger.error('❌ Configuración de Payphone incompleta');
      return NextResponse.json(
        {
          success: false,
          error: 'Configuración de Payphone incompleta',
        },
        { status: 500 }
      );
    }

    // Convertir dólares a centavos
    const amountInCents = Math.round(amount * 100);
    
    // Validar que la conversión sea correcta
    if (amountInCents <= 0 || amountInCents > 10000000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Monto fuera del rango permitido',
        },
        { status: 400 }
      );
    }

    // Generar ID único para la transacción
    const clientTransactionId = `order-${sanitizedOrderId}-${Date.now()}`;

    // Limpiar número de teléfono (quitar espacios, guiones, paréntesis)
    const cleanPhoneNumber = sanitizedPhoneNumber.replace(/[\s+\-()]/g, '');
    
    // Validar que el número limpio tenga al menos 7 dígitos
    if (cleanPhoneNumber.length < 7) {
      return NextResponse.json(
        {
          success: false,
          error: 'Número de teléfono inválido (muy corto)',
        },
        { status: 400 }
      );
    }

    // Preparar la solicitud para Payphone
    const payphoneRequest: PayphoneSaleRequest = {
      phoneNumber: cleanPhoneNumber,
      countryCode: sanitizedCountryCode,
      amount: amountInCents,
      amountWithoutTax: amountInCents, // Rifas no tienen impuestos
      clientTransactionId: clientTransactionId,
      reference: `Compra de boletos - ${(raffleTitle || 'Sorteo').substring(0, 100)}`, // Limitar longitud
      storeId: storeId,
      currency: 'USD',
      timeZone: -5, // Ecuador (GMT-5)
      clientUserId: sanitizedOrderId,
      responseUrl: `${appUrl}/api/payment/payphone/callback`,
      order: {
        billTo: {
          firstName: sanitizedName.substring(0, 50), // Limitar longitud
          lastName: sanitizedLastName.substring(0, 50), // Limitar longitud
          email: sanitizedEmail,
          phoneNumber: `+${sanitizedCountryCode}${cleanPhoneNumber}`,
          country: 'EC',
          customerId: sanitizedOrderId,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
        },
        lineItems: [
          {
            productName: `Boletos - ${(raffleTitle || 'Sorteo').substring(0, 100)}`, // Limitar longitud
            unitPrice: amountInCents,
            quantity: 1,
            totalAmount: amountInCents,
            taxAmount: 0,
            productSKU: sanitizedOrderId.substring(0, 50), // Limitar longitud
            productDescription: `Compra de boletos para ${(raffleTitle || 'Sorteo').substring(0, 200)}`, // Limitar longitud
          },
        ],
      },
    };

    logger.debug('🔄 Enviando solicitud a Payphone API Sale...');

    // Determinar la URL según el ambiente
    const apiUrl = environment === 'production'
      ? 'https://pay.payphonetodoesposible.com/api/Sale'
      : 'https://pay.payphonetodoesposible.com/api/Sale'; // Mismo endpoint para sandbox y producción

    // Realizar la solicitud a la API de Payphone (usando axios)
    // ⚠️ REINTENTOS: Agregar reintentos para errores transitorios
    let lastError: string | null = null;
    let response: { data: PayphoneSaleResponse } | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`🔄 Intento ${attempt}/${maxRetries} de crear pago con PayPhone...`);
        
        response = await axios.post<PayphoneSaleResponse>(apiUrl, payphoneRequest, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 30000, // 30 segundos
        });
        
        // Si llegamos aquí, la solicitud fue exitosa
        break;
      } catch (axiosError) {
        const error = axiosError as AxiosError<PayphoneErrorResponse>;
        lastError = error.message;
        
        // Si es un error 4xx (cliente), no reintentar
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          logger.error('❌ Error del cliente (4xx), no reintentar:', error.response.status);
          throw error; // Lanzar el error para que se maneje abajo
        }
        
        // Si es timeout o error de red, reintentar
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || !error.response) {
          if (attempt < maxRetries) {
            const delay = attempt * 2000; // Backoff exponencial: 2s, 4s, 6s
            logger.warn(`⚠️ Error de red/timeout en intento ${attempt}, reintentando en ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // Si es error 5xx (servidor), reintentar
        if (error.response && error.response.status >= 500) {
          if (attempt < maxRetries) {
            const delay = attempt * 2000;
            logger.warn(`⚠️ Error del servidor (5xx) en intento ${attempt}, reintentando en ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // Si llegamos aquí, no se debe reintentar o ya se agotaron los intentos
        throw error;
      }
    }
    
    if (!response) {
      return NextResponse.json(
        {
          success: false,
          error: `Error al crear pago después de ${maxRetries} intentos: ${lastError}`,
        },
        { status: 503 }
      );
    }

    // Si llegamos aquí, la solicitud fue exitosa
    const data = response.data;

    logger.debug('✅ Pago creado exitosamente:', {
      transactionId: data.transactionId,
      clientTransactionId,
    });

    return NextResponse.json({
      success: true,
      transactionId: data.transactionId,
      clientTransactionId,
      message: 'Solicitud de pago enviada. El cliente recibirá una notificación en su app Payphone.',
    });

  } catch (error) {
    logger.error('❌ Error general al crear pago:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
