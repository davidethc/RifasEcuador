import { NextRequest, NextResponse } from 'next/server';

/**
 * Ruta de prueba para enviar correos
 * 
 * Uso: POST /api/email/test
 * Body: { orderId: "uuid-de-orden" }
 * 
 * O puedes probar directamente desde el navegador visitando:
 * /api/email/test?orderId=uuid-de-orden
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'orderId es requerido. Uso: /api/email/test?orderId=uuid-de-orden',
          ejemplo: 'Visita: /api/email/test?orderId=tu-order-id-aqui'
        },
        { status: 400 }
      );
    }

    console.log('🧪 [TEST] Enviando correo de prueba para orden:', orderId);

    // Llamar a la API de envío de correos
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const emailResponse = await fetch(
      `${baseUrl}/api/email/send-purchase-confirmation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      }
    );

    const emailData = await emailResponse.json();

    if (emailResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Correo de prueba enviado exitosamente',
        data: emailData,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Error al enviar correo',
        details: emailData,
      }, { status: emailResponse.status });
    }

  } catch (error) {
    console.error('❌ Error en prueba de correo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'orderId es requerido en el body',
        },
        { status: 400 }
      );
    }

    console.log('🧪 [TEST] Enviando correo de prueba para orden:', orderId);

    // Llamar a la API de envío de correos
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const emailResponse = await fetch(
      `${baseUrl}/api/email/send-purchase-confirmation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      }
    );

    const emailData = await emailResponse.json();

    if (emailResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Correo de prueba enviado exitosamente',
        data: emailData,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Error al enviar correo',
        details: emailData,
      }, { status: emailResponse.status });
    }

  } catch (error) {
    console.error('❌ Error en prueba de correo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

