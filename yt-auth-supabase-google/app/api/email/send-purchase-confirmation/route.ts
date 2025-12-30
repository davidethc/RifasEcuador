import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con service role para bypass de RLS
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Tipos para los datos de la orden con relaciones
 */
interface OrderWithRelations {
  id: string;
  numbers: string[];
  total: number;
  status: string;
  created_at: string;
  clients: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  raffles: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    price_per_ticket: number;
  } | null;
}

/**
 * API Route para enviar correo de confirmación de compra
 * Se llama cuando una compra es exitosa
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📧 [EMAIL] Iniciando envío de correo de confirmación');
    const body = await request.json();
    const { orderId } = body;

    console.log('📧 [EMAIL] OrderId recibido:', orderId);

    if (!orderId) {
      console.error('❌ [EMAIL] orderId no proporcionado');
      return NextResponse.json(
        { success: false, error: 'orderId es requerido' },
        { status: 400 }
      );
    }

    // Obtener información completa de la orden usando cliente admin (bypass RLS)
    const supabase = getSupabaseAdmin();
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        numbers,
        total,
        status,
        created_at,
        clients:client_id (
          id,
          name,
          email,
          phone
        ),
        raffles:raffle_id (
          id,
          title,
          description,
          image_url,
          price_per_ticket
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      console.error('❌ [EMAIL] Error al obtener orden:', orderError);
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada', details: orderError },
        { status: 404 }
      );
    }

    console.log('✅ [EMAIL] Orden obtenida:', orderData.id);

    const typedOrderData = orderData as unknown as OrderWithRelations;
    const client = typedOrderData.clients;
    const raffle = typedOrderData.raffles;
    const ticketNumbers = typedOrderData.numbers || [];

    console.log('📧 [EMAIL] Cliente:', client?.name, 'Email:', client?.email);
    console.log('📧 [EMAIL] Sorteo:', raffle?.title);
    console.log('📧 [EMAIL] Números de boletos:', ticketNumbers);

    if (!client?.email) {
      console.error('❌ [EMAIL] Email del cliente no encontrado');
      return NextResponse.json(
        { success: false, error: 'Email del cliente no encontrado' },
        { status: 400 }
      );
    }

    // IMPORTANTE: Calcular el total correcto basado en tickets PAGADOS (no todos los tickets)
    // Los combos incluyen tickets gratis:
    // - Combo 10: 15 tickets totales (10 pagados + 5 gratis)
    // - Combo 20: 27 tickets totales (20 pagados + 7 gratis)
    // - Otros: cantidad exacta pagada
    const totalTickets = ticketNumbers.length;
    let paidQuantity = totalTickets;
    
    if (totalTickets === 15) {
      // Combo 10: 10 pagados + 5 gratis
      paidQuantity = 10;
    } else if (totalTickets === 27) {
      // Combo 20: 20 pagados + 7 gratis
      paidQuantity = 20;
    }
    
    // Calcular el total correcto: cantidad pagada * precio por ticket
    const correctTotal = paidQuantity * (raffle?.price_per_ticket || 0);
    
    console.log('💰 [EMAIL_PRICE_CORRECTION] Corrigiendo total en correo:', {
      totalTickets,
      paidQuantity,
      pricePerTicket: raffle?.price_per_ticket,
      totalDeOrden: orderData.total,
      totalCorrecto: correctTotal,
    });

    // Verificar que Resend esté configurado
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('❌ [EMAIL] RESEND_API_KEY no configurado');
      return NextResponse.json(
        { success: false, error: 'Servicio de correo no configurado' },
        { status: 500 }
      );
    }

    console.log('✅ [EMAIL] RESEND_API_KEY configurado');

    // Formatear números de boletos - mostrar todos los números
    const numbersText = ticketNumbers.length === 0
      ? 'No asignados'
      : ticketNumbers.length === 1
      ? ticketNumbers[0]
      : ticketNumbers.join(', ');

    // Crear template HTML del correo
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Compra</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #fbbf24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">¡Compra Exitosa! 🎉</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hola <strong>${client.name}</strong>,</p>
            
            <p>Tu compra ha sido procesada exitosamente. Aquí están los detalles:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h2 style="margin-top: 0; color: #3b82f6;">${raffle?.title || 'Sorteo'}</h2>
              
              <div style="margin: 15px 0;">
                <strong>Números de boletos asignados:</strong>
                <div style="font-size: ${ticketNumbers.length > 3 ? '18px' : '24px'}; font-weight: bold; color: #059669; margin-top: 10px; word-break: break-word;">
                  ${numbersText}
                </div>
              </div>
              
              <div style="margin: 15px 0;">
                <strong>Cantidad de boletos:</strong> ${ticketNumbers.length}
                ${totalTickets !== paidQuantity ? ` <span style="color: #059669; font-size: 14px;">(${paidQuantity} pagados + ${totalTickets - paidQuantity} gratis 🎁)</span>` : ''}
              </div>
              
              <div style="margin: 15px 0;">
                <strong>Precio por boleto:</strong> $${(raffle?.price_per_ticket || 0).toFixed(2)}
              </div>
              
              <div style="margin: 15px 0;">
                <strong>Total pagado:</strong> 
                <span style="font-size: 20px; font-weight: bold; color: #059669;">
                  $${correctTotal.toFixed(2)}
                </span>
              </div>
              
              <div style="margin: 15px 0;">
                <strong>ID de orden:</strong> ${orderId}
              </div>
            </div>
            
            <p style="margin-top: 30px;">Guarda este correo como comprobante de tu compra.</p>
            
            <p style="margin-top: 20px;">¡Mucha suerte en el sorteo! 🍀</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
              <p>Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar correo usando Resend
    // Usar dominio verificado yt.bytemind.space
    // Puedes configurar RESEND_FROM_EMAIL en las variables de entorno
    // Si no está configurado, usa el dominio verificado por defecto
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Rifas Ecuador <noreply@yt.bytemind.space>';
    
    // Si el email contiene dominios de proveedores gratuitos, usar el dominio verificado
    const finalFromEmail = fromEmail.includes('@gmail.com') || 
                          fromEmail.includes('@yahoo.com') || 
                          fromEmail.includes('@hotmail.com') ||
                          fromEmail.includes('@outlook.com')
                          ? 'Rifas Ecuador <noreply@yt.bytemind.space>'
                          : fromEmail;
    
    const emailSubject = `✅ Confirmación de Compra - ${raffle?.title || 'Sorteo'}`;
    
    console.log('📧 [EMAIL] Enviando correo a:', client.email);
    console.log('📧 [EMAIL] Desde (original):', fromEmail);
    console.log('📧 [EMAIL] Desde (final):', finalFromEmail);
    console.log('📧 [EMAIL] Asunto:', emailSubject);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: finalFromEmail,
        to: client.email,
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const responseText = await resendResponse.text();
    console.log('📧 [EMAIL] Respuesta de Resend (status):', resendResponse.status);
    console.log('📧 [EMAIL] Respuesta de Resend (body):', responseText);

    if (!resendResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      console.error('❌ [EMAIL] Error al enviar correo:', errorData);
      return NextResponse.json(
        { success: false, error: 'Error al enviar correo', details: errorData },
        { status: 500 }
      );
    }

    const emailResult = JSON.parse(responseText);
    console.log('✅ [EMAIL] Correo enviado exitosamente:', emailResult);

    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      emailId: emailResult.id,
    });

  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

