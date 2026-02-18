import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { logger } from '@/utils/logger';

type AssignRequest = {
  client_id: string;
  raffle_id: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    // Verificar que es admin
    const adminCheck = await requireAdminFromRequest(req);
    if (!adminCheck.ok) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = (await req.json()) as AssignRequest;
    const { client_id, raffle_id, quantity } = body;

    // Validar datos
    if (!client_id || !raffle_id || !quantity || quantity <= 0 || quantity > 1000) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos. Cantidad debe estar entre 1 y 1000.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Verificar que el cliente existe
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });
    }

    // 2. Verificar que la rifa existe y está activa
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('id, title, price_per_ticket, status')
      .eq('id', raffle_id)
      .single();

    if (raffleError || !raffle) {
      return NextResponse.json({ success: false, error: 'Rifa no encontrada' }, { status: 404 });
    }

    if (raffle.status !== 'active') {
      return NextResponse.json({ success: false, error: 'La rifa no está activa' }, { status: 400 });
    }

    // 3. Obtener boletos disponibles aleatorios
    // Nota: Obtenemos más boletos de los necesarios y seleccionamos aleatoriamente
    const fetchLimit = Math.min(quantity * 10, 5000); // Obtener 10x la cantidad o máximo 5000
    
    const { data: availableTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, number')
      .eq('raffle_id', raffle_id)
      .eq('status', 'available')
      .limit(fetchLimit);

    if (ticketsError) {
      return NextResponse.json({ success: false, error: 'Error al buscar boletos disponibles' }, { status: 500 });
    }

    if (!availableTickets || availableTickets.length < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `No hay suficientes boletos disponibles. Solicitados: ${quantity}, Disponibles: ${
            availableTickets?.length || 0
          }`,
        },
        { status: 400 }
      );
    }

    // Seleccionar aleatoriamente usando Fisher-Yates shuffle
    const shuffled = [...availableTickets];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedTickets = shuffled.slice(0, quantity);

    const ticketIds = selectedTickets.map((t) => t.id);
    const numbers = selectedTickets.map((t) => t.number);
    const total = parseFloat(raffle.price_per_ticket) * quantity;

    // 4. Crear la orden con status='completed' y payment_method='cash'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id,
        raffle_id,
        numbers,
        total,
        payment_method: 'cash',
        status: 'completed',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Error al crear la orden' }, { status: 500 });
    }

    // 5. Actualizar los boletos a 'sold' y asignar client_id
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'sold',
        client_id,
      })
      .in('id', ticketIds);

    if (updateError) {
      // Intentar revertir la orden (marcar como cancelled)
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      return NextResponse.json({ success: false, error: 'Error al asignar boletos' }, { status: 500 });
    }

    // 6. Crear el registro de pago como 'cash' aprobado
    const { error: paymentError } = await supabase.from('payments').insert({
      order_id: order.id,
      provider: 'cash',
      provider_reference: `CASH-${Date.now()}`,
      amount: total,
      status: 'approved', // Usar 'approved' para que se cuente en total_paid
    });

    if (paymentError) {
      // No revertir, solo continuar (el pago puede crearse después)
    }

    // 7. Enviar correo de confirmación al cliente con los números asignados (misma API que compra online)
    let emailSent = false;
    const clientEmail = (client.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (clientEmail && emailRegex.test(clientEmail)) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const emailRes = await fetch(`${baseUrl}/api/email/send-purchase-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        });
        if (emailRes.ok) {
          emailSent = true;
        } else {
          const errBody = await emailRes.text();
          logger.error('[assign-tickets] Error al enviar correo al cliente:', emailRes.status, errBody);
        }
      } catch (emailErr) {
        logger.error('[assign-tickets] Error al llamar API de correo:', emailErr);
      }
    }

    const successMsg = emailSent
      ? `✅ ${quantity} boletos asignados. Correo enviado a ${client.email}.`
      : `✅ ${quantity} boletos asignados exitosamente a ${client.name || client.email}${!clientEmail ? ' (sin email, no se envió correo)' : ''}`;

    return NextResponse.json({
      success: true,
      order_id: order.id,
      numbers,
      total,
      message: successMsg,
      email_sent: emailSent,
    });
  } catch (error) {
    logger.error('[assign-tickets] Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
