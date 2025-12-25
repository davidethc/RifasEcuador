import { NextRequest, NextResponse } from 'next/server';
import type { PayphoneTransactionResponse, PayphoneErrorResponse } from '@/types/payphone.types';

/**
 * API Route para consultar el estado de una transacción de Payphone
 * 
 * Endpoint: GET /api/payment/payphone/status?transactionId=12345
 * 
 * Documentación: https://www.docs.payphone.app/api-implementacion#consultar-respuesta-de-transaccion
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de transacción requerido',
        },
        { status: 400 }
      );
    }

    console.log('🔍 Consultando estado de transacción:', transactionId);

    // Validar configuración
    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;

    if (!token) {
      console.error('❌ Token de Payphone no configurado');
      return NextResponse.json(
        {
          success: false,
          error: 'Configuración de Payphone incompleta',
        },
        { status: 500 }
      );
    }

    // Consultar el estado en la API de Payphone
    const apiUrl = `https://pay.payphonetodoesposible.com/api/Sale/${transactionId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-language': 'es',
      },
    });

    const responseText = await response.text();
    console.log('📤 Respuesta de Payphone:', responseText);

    if (!response.ok) {
      console.error('❌ Error HTTP de Payphone:', response.status, responseText);
      
      // Intentar parsear el error
      let errorData: PayphoneErrorResponse | null = null;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        // No se pudo parsear como JSON
      }

      return NextResponse.json(
        {
          success: false,
          error: errorData?.message || 'Error al consultar el estado',
          errorCode: errorData?.errorCode,
        },
        { status: response.status }
      );
    }

    // Parsear respuesta exitosa
    const data: PayphoneTransactionResponse = JSON.parse(responseText);

    console.log('✅ Estado obtenido:', {
      transactionId: data.transactionId,
      status: data.transactionStatus,
      statusCode: data.statusCode,
    });

    return NextResponse.json({
      success: true,
      transaction: data,
    });

  } catch (error) {
    console.error('❌ Error al consultar estado:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
