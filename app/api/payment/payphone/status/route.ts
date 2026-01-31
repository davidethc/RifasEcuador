import { NextRequest, NextResponse } from 'next/server';
import type { PayphoneTransactionResponse, PayphoneErrorResponse } from '@/types/payphone.types';
import axios, { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

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

    logger.debug('🔍 Consultando estado de transacción:', transactionId);

    // Validar configuración
    const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;

    if (!token) {
      logger.error('❌ Token de Payphone no configurado');
      return NextResponse.json(
        {
          success: false,
          error: 'Configuración de Payphone incompleta',
        },
        { status: 500 }
      );
    }

    // Consultar el estado en la API de Payphone (usando axios)
    const apiUrl = `https://pay.payphonetodoesposible.com/api/Sale/${transactionId}`;

    try {
      const response = await axios.get<PayphoneTransactionResponse>(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-language': 'es',
        },
        timeout: 30000, // 30 segundos
      });

      const data = response.data;

      logger.debug('✅ Estado obtenido:', {
        transactionId: data.transactionId,
        status: data.transactionStatus,
        statusCode: data.statusCode,
      });

      return NextResponse.json({
        success: true,
        transaction: data,
      });

    } catch (axiosError) {
      const error = axiosError as AxiosError<PayphoneErrorResponse>;
      logger.error('❌ Error de axios al consultar estado:', error.message);
      
      if (error.response) {
        const errorData = error.response.data;
        logger.error('❌ Error HTTP de Payphone:', error.response.status, errorData);
        
        return NextResponse.json(
          {
            success: false,
            error: errorData?.message || 'Error al consultar el estado',
            errorCode: errorData?.errorCode,
          },
          { status: error.response.status }
        );
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return NextResponse.json(
          {
            success: false,
            error: 'Timeout al consultar estado con PayPhone',
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
    logger.error('❌ Error general al consultar estado:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
