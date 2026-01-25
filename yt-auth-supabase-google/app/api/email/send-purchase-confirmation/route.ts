import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

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
    logger.debug('📧 [EMAIL] Iniciando envío de correo de confirmación');
    const body = await request.json();
    const { orderId } = body;

    logger.debug('📧 [EMAIL] OrderId recibido:', orderId);

    if (!orderId) {
      logger.error('❌ [EMAIL] orderId no proporcionado');
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
      logger.error('❌ [EMAIL] Error al obtener orden:', orderError);
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada', details: orderError },
        { status: 404 }
      );
    }

    logger.debug('✅ [EMAIL] Orden obtenida:', orderData.id);

    const typedOrderData = orderData as unknown as OrderWithRelations;
    const client = typedOrderData.clients;
    const raffle = typedOrderData.raffles;
    
    // Asegurar que numbers sea un array
    let ticketNumbers: string[] = [];
    if (Array.isArray(typedOrderData.numbers)) {
      ticketNumbers = typedOrderData.numbers;
    } else if (typedOrderData.numbers) {
      // Si viene como string o otro formato, intentar convertirlo
      try {
        if (typeof typedOrderData.numbers === 'string') {
          ticketNumbers = JSON.parse(typedOrderData.numbers);
        } else {
          ticketNumbers = [String(typedOrderData.numbers)];
        }
      } catch {
        logger.warn('⚠️ [EMAIL] No se pudo parsear numbers, usando array vacío');
        ticketNumbers = [];
      }
    }
    
    // Si aún no hay números, intentar obtenerlos de la tabla tickets usando los números de la orden
    // Los tickets se relacionan por raffle_id y number (que debe estar en orders.numbers)
    if (ticketNumbers.length === 0) {
      logger.debug('⚠️ [EMAIL] No se encontraron números en orders.numbers');
      logger.debug('⚠️ [EMAIL] Verificando si la orden tiene números en otro formato...');
      
      // Intentar obtener la orden nuevamente con más detalle
      const { data: orderDataRetry } = await supabase
        .from('orders')
        .select('numbers, raffle_id')
        .eq('id', orderId)
        .single();
      
      if (orderDataRetry?.numbers) {
        logger.debug('📧 [EMAIL] Reintento - Numbers encontrados:', orderDataRetry.numbers);
        if (Array.isArray(orderDataRetry.numbers)) {
          ticketNumbers = orderDataRetry.numbers.map(n => String(n));
        }
      }
    }

    logger.debug('📧 [EMAIL] Cliente:', client?.name, 'Email:', client?.email);
    logger.debug('📧 [EMAIL] Sorteo:', raffle?.title);
    logger.debug('📧 [EMAIL] Números de boletos:', ticketNumbers);
    logger.debug('📧 [EMAIL] Cantidad de números:', ticketNumbers.length);
    logger.debug('📧 [EMAIL] Tipo de numbers:', typeof typedOrderData.numbers);
    logger.debug('📧 [EMAIL] Numbers raw:', typedOrderData.numbers);

    if (!client?.email) {
      logger.error('❌ [EMAIL] Email del cliente no encontrado');
      return NextResponse.json(
        { success: false, error: 'Email del cliente no encontrado' },
        { status: 400 }
      );
    }

    // IMPORTANTE: Calcular el total correcto basado en tickets PAGADOS (no todos los tickets).
    // No inferimos "pagados vs gratis" por la cantidad total de tickets porque puede ser ambiguo (ej: 12 podría ser compra normal o combo).
    // En su lugar, derivamos la cantidad pagada desde el total de la orden y el precio por ticket.
    const totalTickets = ticketNumbers.length;
    const pricePerTicket = raffle?.price_per_ticket || 0;

    const paidQuantityRaw =
      pricePerTicket > 0 ? (typedOrderData.total ?? 0) / pricePerTicket : totalTickets;

    // paidQuantity debe ser un entero razonable y no puede exceder totalTickets
    const paidQuantityInt = Number.isFinite(paidQuantityRaw)
      ? Math.round(paidQuantityRaw + 1e-9) // tolerancia a ruido flotante
      : totalTickets;

    const paidQuantity = Math.min(Math.max(paidQuantityInt, 0), totalTickets);
    const correctTotal = paidQuantity * pricePerTicket;
    
    logger.debug('💰 [EMAIL_PRICE_CORRECTION] Corrigiendo total en correo:', {
      totalTickets,
      paidQuantity,
      pricePerTicket,
      totalDeOrden: orderData.total,
      totalCorrecto: correctTotal,
    });

    // Verificar que Resend esté configurado
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      logger.error('❌ [EMAIL] RESEND_API_KEY no configurado');
      return NextResponse.json(
        { success: false, error: 'Servicio de correo no configurado' },
        { status: 500 }
      );
    }

    logger.debug('✅ [EMAIL] RESEND_API_KEY configurado');

    // Formatear números de boletos - mostrar todos los números de forma clara
    let numbersText = 'No asignados';
    let numbersHtml = '<p style="color: #dc2626;">⚠️ No se asignaron números de boletos</p>';
    
    if (ticketNumbers.length > 0) {
      // Formato para texto plano (separado por comas)
      numbersText = ticketNumbers.join(', ');
      
      // Formato HTML más visual con cada número en su propia línea o caja
      if (ticketNumbers.length <= 10) {
        // Si son pocos números, mostrarlos en cajas individuales
        numbersHtml = ticketNumbers.map(num => 
          `<span style="display: inline-block; background: #059669; color: white; padding: 8px 12px; margin: 4px; border-radius: 6px; font-weight: bold; font-size: 16px;">${num}</span>`
        ).join('');
      } else {
        // Si son muchos números, mostrarlos en una lista más compacta
        const chunkSize = 5;
        const chunks = [];
        for (let i = 0; i < ticketNumbers.length; i += chunkSize) {
          chunks.push(ticketNumbers.slice(i, i + chunkSize));
        }
        numbersHtml = chunks.map(chunk => 
          `<div style="margin: 8px 0;">${chunk.map(num => 
            `<span style="display: inline-block; background: #059669; color: white; padding: 6px 10px; margin: 2px; border-radius: 4px; font-weight: bold;">${num}</span>`
          ).join(' ')}</div>`
        ).join('');
      }
    }
    
    logger.debug('📧 [EMAIL] Numbers text formateado:', numbersText);
    logger.debug('📧 [EMAIL] Numbers HTML generado:', numbersHtml.substring(0, 200) + '...');

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
                <strong style="font-size: 16px; color: #1f2937;">🎟️ Números de boletos asignados:</strong>
                <div style="margin-top: 15px; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 2px solid #059669;">
                  ${numbersHtml}
                </div>
                ${ticketNumbers.length > 0 ? `<p style="margin-top: 10px; font-size: 14px; color: #6b7280;">Total: <strong>${ticketNumbers.length} número${ticketNumbers.length !== 1 ? 's' : ''}</strong></p>` : ''}
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
    
    logger.debug('📧 [EMAIL] Enviando correo a:', client.email);
    logger.debug('📧 [EMAIL] Desde (original):', fromEmail);
    logger.debug('📧 [EMAIL] Desde (final):', finalFromEmail);
    logger.debug('📧 [EMAIL] Asunto:', emailSubject);

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
    logger.debug('📧 [EMAIL] Respuesta de Resend (status):', resendResponse.status);
    logger.debug('📧 [EMAIL] Respuesta de Resend (body):', responseText);

    if (!resendResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      logger.error('❌ [EMAIL] Error al enviar correo:', errorData);
      return NextResponse.json(
        { success: false, error: 'Error al enviar correo', details: errorData },
        { status: 500 }
      );
    }

    const emailResult = JSON.parse(responseText);
    logger.debug('✅ [EMAIL] Correo enviado exitosamente:', emailResult);

    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      emailId: emailResult.id,
    });

  } catch (error) {
    logger.error('❌ Error al enviar correo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

