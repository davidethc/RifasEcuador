import { NextRequest, NextResponse } from 'next/server';
import type { PayphoneSaleRequest, PayphoneSaleResponse, PayphoneErrorResponse } from '@/types/payphone.types';
import axios, { AxiosError } from 'axios';

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

    console.log('📥 Solicitud de pago recibida:', {
      orderId,
      phoneNumber,
      amount,
    });

    // Validar variables de entorno
    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;
    const storeId = process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID;
    const environment = process.env.NEXT_PUBLIC_PAYPHONE_ENVIRONMENT || 'sandbox';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!token || !storeId) {
      console.error('❌ Configuración de Payphone incompleta');
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

    // Generar ID único para la transacción
    const clientTransactionId = `order-${orderId}-${Date.now()}`;

    // Limpiar número de teléfono (quitar espacios, guiones, paréntesis)
    const cleanPhoneNumber = phoneNumber.replace(/[\s+\-()]/g, '');

    // Preparar la solicitud para Payphone
    const payphoneRequest: PayphoneSaleRequest = {
      phoneNumber: cleanPhoneNumber,
      countryCode: countryCode,
      amount: amountInCents,
      amountWithoutTax: amountInCents, // Rifas no tienen impuestos
      clientTransactionId: clientTransactionId,
      reference: `Compra de boletos - ${raffleTitle}`,
      storeId: storeId,
      currency: 'USD',
      timeZone: -5, // Ecuador (GMT-5)
      clientUserId: orderId,
      responseUrl: `${appUrl}/api/payment/payphone/callback`,
      order: {
        billTo: {
          firstName: customerData.name,
          lastName: customerData.lastName,
          email: customerData.email,
          phoneNumber: `+${countryCode}${cleanPhoneNumber}`,
          country: 'EC',
          customerId: orderId,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        },
        lineItems: [
          {
            productName: `Boletos - ${raffleTitle}`,
            unitPrice: amountInCents,
            quantity: 1,
            totalAmount: amountInCents,
            taxAmount: 0,
            productSKU: orderId,
            productDescription: `Compra de boletos para ${raffleTitle}`,
          },
        ],
      },
    };

    console.log('🔄 Enviando solicitud a Payphone API Sale...');

    // Determinar la URL según el ambiente
    const apiUrl = environment === 'production'
      ? 'https://pay.payphonetodoesposible.com/api/Sale'
      : 'https://pay.payphonetodoesposible.com/api/Sale'; // Mismo endpoint para sandbox y producción

    // Realizar la solicitud a la API de Payphone (usando axios)
    try {
      const response = await axios.post<PayphoneSaleResponse>(apiUrl, payphoneRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000, // 30 segundos
      });

      const data = response.data;

      console.log('✅ Pago creado exitosamente:', {
        transactionId: data.transactionId,
        clientTransactionId,
      });

      return NextResponse.json({
        success: true,
        transactionId: data.transactionId,
        clientTransactionId,
        message: 'Solicitud de pago enviada. El cliente recibirá una notificación en su app Payphone.',
      });

    } catch (axiosError) {
      const error = axiosError as AxiosError<PayphoneErrorResponse>;
      console.error('❌ Error de axios al crear pago:', error.message);
      
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData?.errors?.[0]?.message || errorData?.message || 'Error al crear la transacción';
        
        console.error('❌ Error HTTP de Payphone:', error.response.status, errorData);
        
        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            errorCode: errorData?.errorCode,
          },
          { status: error.response.status }
        );
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return NextResponse.json(
          {
            success: false,
            error: 'Timeout al conectar con PayPhone',
          },
          { status: 504 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Error de red al conectar con PayPhone',
          },
          { status: 503 }
        );
      }
    }

  } catch (error) {
    console.error('❌ Error general al crear pago:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
