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

    // Crear template HTML del correo (diseño tipo factura/comprobante)
    const emailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante de Compra</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827; background: #f3f4f6; margin: 0; padding: 0;">
    <div style="max-width: 700px; margin: 0 auto; background: #ffffff;">
      <!-- Cabecera -->
      <div style="background: linear-gradient(135deg,#0f172a,#1d4ed8); padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; color: #f9fafb;">
        <div>
          <div style="font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8;">Comprobante de compra</div>
          <div style="font-size: 24px; font-weight: 700; margin-top: 4px;">${raffle?.title || 'Sorteo'}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 700;">ALTOKEEC</div>
          <div style="font-size: 12px; opacity: 0.85;">www.altokeec.com</div>
        </div>
      </div>

      <div style="padding: 24px 32px 8px 32px;">
        <!-- Datos cliente / empresa -->
        <div style="display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 24px;">
          <div style="flex: 1 1 260px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 4px;">Datos del cliente</div>
            <div style="font-size: 14px;">
              <div><strong>Nombre:</strong> ${client.name}</div>
              ${client.email ? `<div><strong>Mail:</strong> ${client.email}</div>` : ''}
              ${client.phone ? `<div><strong>Teléfono:</strong> ${client.phone}</div>` : ''}
            </div>
          </div>

          <div style="flex: 1 1 260px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; margin-bottom: 4px;">Datos de la empresa</div>
            <div style="font-size: 14px;">
              <div><strong>Nombre:</strong> ALTOKEEC</div>
              <div><strong>Dirección:</strong> Calle Ejemplo 123, Quito, Ecuador</div>
              <div><strong>Mail:</strong> soporte@altokeec.com</div>
              <div><strong>Teléfono:</strong> +593 99 999 9999</div>
            </div>
          </div>
        </div>

        <!-- Fecha + ID -->
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; font-size: 14px; margin-bottom: 24px;">
          <div><strong>Fecha:</strong> ${new Date(typedOrderData.created_at).toLocaleDateString('es-EC')}</div>
          <div><strong>ID de orden:</strong> ${orderId}</div>
        </div>

        <!-- Tabla de conceptos -->
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <thead>
            <tr>
              <th style="background: #0f172a; color: #f9fafb; padding: 10px; text-align: left;">Concepto</th>
              <th style="background: #0f172a; color: #f9fafb; padding: 10px; text-align: center;">Cantidad</th>
              <th style="background: #0f172a; color: #f9fafb; padding: 10px; text-align: right;">Precio</th>
              <th style="background: #0f172a; color: #f9fafb; padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border-bottom: 1px solid #e5e7eb; padding: 8px 10px;">
                Compra de boletos - ${raffle?.title || 'Sorteo'}
              </td>
              <td style="border-bottom: 1px solid #e5e7eb; padding: 8px 10px; text-align: center;">
                ${paidQuantity}
              </td>
              <td style="border-bottom: 1px solid #e5e7eb; padding: 8px 10px; text-align: right;">
                $${(raffle?.price_per_ticket || 0).toFixed(2)}
              </td>
              <td style="border-bottom: 1px solid #e5e7eb; padding: 8px 10px; text-align: right;">
                $${correctTotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Resumen -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
          <table style="font-size: 14px;">
            <tr>
              <td style="padding: 4px 8px; text-align: right;"><strong>Total pagado:</strong></td>
              <td style="padding: 4px 8px; text-align: right; font-size: 18px; font-weight: 700; color: #16a34a;">
                $${correctTotal.toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        <!-- Números de boletos -->
        <div style="margin-top: 24px; font-size: 14px;">
          <div style="font-weight: 600; margin-bottom: 8px;">Números de boletos asignados:</div>
          <div style="padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; background: #f9fafb;">
            ${ticketNumbers.length
              ? ticketNumbers.map(num =>
                  `<span style="display:inline-block;margin:2px 4px;padding:6px 10px;border-radius:4px;background:#1d4ed8;color:#ffffff;font-weight:600;">${num}</span>`
                ).join('')
              : '<span style="color:#b91c1c;">No se encontraron números asignados.</span>'
            }
          </div>
          ${ticketNumbers.length && totalTickets !== paidQuantity
            ? `<p style="margin-top:6px;font-size:12px;color:#6b7280;">Incluye ${paidQuantity} boletos pagados y ${totalTickets - paidQuantity} de cortesía.</p>`
            : ''
          }
        </div>

        <!-- Notas -->
        <div style="margin-top: 24px; font-size: 12px; color: #6b7280;">
          <p>Guarda este correo como comprobante de tu compra. En caso de dudas, contáctanos a <strong>soporte@altokeec.com</strong>.</p>
          <p>Este correo es generado automáticamente, por favor no respondas directamente.</p>
        </div>
      </div>
    </div>
  </body>
</html>
`;

    // Correo emisor oficial: Altokeec <administracion@altokeec.com>
    // Opcional en Vercel: RESEND_FROM_EMAIL (mismo formato). No usar @gmail.com como FROM.
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Altokeec <administracion@altokeec.com>';
    const finalFromEmail =
      fromEmail.includes('@gmail.com') ||
      fromEmail.includes('@yahoo.com') ||
      fromEmail.includes('@hotmail.com') ||
      fromEmail.includes('@outlook.com')
        ? 'Altokeec <administracion@altokeec.com>'
        : fromEmail;

    const emailSubject = 'Factura de tu compra – Altokeec';
    
    logger.debug('📧 [EMAIL] Enviando correo a:', client.email);
    logger.debug('📧 [EMAIL] Desde (original):', fromEmail);
    logger.debug('📧 [EMAIL] Desde (final):', finalFromEmail);
    logger.debug('📧 [EMAIL] Asunto:', emailSubject);

    // BCC opcional: en Vercel añade RESEND_BCC_EMAIL (ej. tu Gmail) para recibir copia de cada factura
    const bccEmail = process.env.RESEND_BCC_EMAIL?.trim() || undefined;
    const payload: { from: string; to: string; subject: string; html: string; bcc?: string } = {
      from: finalFromEmail,
      to: client.email,
      subject: emailSubject,
      html: emailHtml,
    };
    if (bccEmail) payload.bcc = bccEmail;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(payload),
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

