/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Edge Function para confirmar transacciones de la Cajita de Pagos
 * Endpoint: /api/button/V2/Confirm
 */

const PAYPHONE_API_CONFIRM = 'https://pay.payphonetodoesposible.com/api/button/V2/Confirm';

interface RequestBody {
  id: number;
  clientTxId: string;
}

// Headers CORS para permitir peticiones desde el frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // En producción, cambiar a tu dominio específico
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // CRÍTICO: Manejar OPTIONS PRIMERO, sin ningún try-catch ni validación
  // Esto DEBE ser lo primero que se ejecute para evitar errores de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Max-Age': '86400', // Cache preflight por 24 horas
      },
    });
  }

  // Log inicial para diagnóstico (solo para peticiones POST)
  console.log('=== INICIO confirm-payphone-button ===');
  console.log('Método:', req.method);
  console.log('URL:', req.url);

  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Obtener token de Payphone
    const payphoneToken = Deno.env.get('PAYPHONE_TOKEN');

    if (!payphoneToken) {
      console.error('PAYPHONE_TOKEN no configurado');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración de Payphone no encontrada. Verifica la variable de entorno PAYPHONE_TOKEN',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Parsear body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error al parsear body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al parsear el cuerpo de la petición. Verifica que sea JSON válido.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const { id, clientTxId } = body;

    // Convertir id a número si viene como string
    const transactionId = typeof id === 'string' ? parseInt(id, 10) : id;

    // Validar parámetros
    if (!transactionId || isNaN(transactionId) || !clientTxId || typeof clientTxId !== 'string') {
      console.error('Parámetros inválidos:', { id, transactionId, clientTxId });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Parámetros inválidos. Se requieren id (número o string numérico) y clientTxId (string)',
          received: { id, clientTxId },
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log('Confirmando transacción de Cajita de Pagos:', { 
      id: transactionId, 
      clientTxId,
      tokenLength: payphoneToken.length,
    });

    // Llamar al endpoint de confirmación de Payphone
    let response: Response;
    try {
      response = await fetch(PAYPHONE_API_CONFIRM, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${payphoneToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: transactionId,
          clientTxId,
        }),
      });
    } catch (fetchError) {
      console.error('Error al hacer fetch a Payphone:', fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al conectar con Payphone. Verifica tu conexión a internet.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Parsear respuesta
    let data: unknown;
    const responseStatus = response.status;
    const responseStatusText = response.statusText;
    
    console.log('📥 Respuesta de Payphone recibida:', {
      status: responseStatus,
      statusText: responseStatusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    try {
      const responseText = await response.text();
      
      console.log('📄 Contenido de la respuesta (primeros 500 caracteres):', 
        responseText.substring(0, 500));
      console.log('📏 Longitud de la respuesta:', responseText.length);
      
      if (!responseText) {
        console.error('❌ Respuesta vacía de Payphone');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Payphone devolvió una respuesta vacía',
            payphoneStatus: responseStatus,
            payphoneStatusText: responseStatusText,
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Intentar parsear como JSON
      try {
        data = JSON.parse(responseText);
        console.log('✅ Respuesta parseada correctamente como JSON');
        console.log('📋 Tipo de datos:', typeof data);
        console.log('📋 Es objeto?:', typeof data === 'object' && data !== null);
        if (typeof data === 'object' && data !== null) {
          console.log('📋 Keys del objeto:', Object.keys(data as Record<string, unknown>));
        }
      } catch (jsonError) {
        console.error('❌ Error al parsear JSON:', jsonError);
        console.error('📄 Respuesta completa (no es JSON válido):', responseText);
        
        // Si no es JSON, puede ser un error HTML o texto plano
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Payphone devolvió una respuesta que no es JSON válido',
            payphoneStatus: responseStatus,
            payphoneStatusText: responseStatusText,
            responsePreview: responseText.substring(0, 200), // Primeros 200 caracteres
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    } catch (readError) {
      console.error('❌ Error al leer respuesta de Payphone:', readError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al leer la respuesta de Payphone',
          payphoneStatus: responseStatus,
          payphoneStatusText: responseStatusText,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Manejar errores de Payphone
    if (!response.ok) {
      const error = data as { message?: string; errorCode?: number; errors?: unknown };
      
      console.error('❌ Error al confirmar transacción en Payphone:', {
        status: response.status,
        statusText: response.statusText,
        errorCode: error.errorCode,
        message: error.message,
        errors: error.errors,
        fullResponse: data,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Error al confirmar la transacción',
          errorCode: error.errorCode,
          payphoneStatus: response.status,
          payphoneStatusText: response.statusText,
          ...(error.errors ? { errors: error.errors } : {}),
        }),
        {
          status: response.status >= 400 && response.status < 600 ? response.status : 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Éxito: retornar datos de la transacción
    console.log('✅ Payphone respondió con éxito (status:', responseStatus, ')');
    console.log('📦 Datos completos de la respuesta:', JSON.stringify(data, null, 2));
    
    // Intentar extraer información de la transacción de forma segura
    const transactionData = data as Record<string, unknown>;
    // Renombrar para evitar conflicto con transactionId del parámetro
    const payphoneTransactionId = transactionData.transactionId || transactionData.id || transactionData.transaction_id;
    const transactionStatus = transactionData.transactionStatus || transactionData.status || transactionData.transaction_status;
    const statusCode = transactionData.statusCode || transactionData.status_code;
    
    console.log('🔍 Información extraída:', {
      payphoneTransactionId,
      transactionStatus,
      statusCode,
      hasAllData: !!transactionData,
    });

    // Retornar respuesta exitosa
    try {
      const successResponse = {
        success: true,
        transaction: data,
        transactionId: payphoneTransactionId,
        transactionStatus: transactionStatus,
        statusCode: statusCode,
      };

      console.log('✅ Retornando respuesta exitosa');
      console.log('=== FIN confirm-payphone-button (ÉXITO) ===');

      return new Response(
        JSON.stringify(successResponse),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (responseError) {
      console.error('❌ Error al construir respuesta exitosa:', responseError);
      // Aún así, intentar retornar algo
      return new Response(
        JSON.stringify({
          success: true,
          transaction: data,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('❌ ERROR INESPERADO en confirm-payphone-button:');
    console.error('Mensaje:', errorMessage);
    console.error('Stack:', errorStack);
    console.error('Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.log('=== FIN confirm-payphone-button (ERROR) ===');
    
    // En Deno, no exponemos el stack trace en producción por seguridad
    const isDevelopment = Deno.env.get('DENO_ENV') === 'development';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        ...(isDevelopment && { details: errorStack }),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
