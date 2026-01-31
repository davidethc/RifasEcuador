import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { normalizePhoneNumber } from '@/utils/phoneFormatter';

function safeExtFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m === 'application/pdf') return 'pdf';
  if (m === 'image/jpeg') return 'jpg';
  if (m === 'image/png') return 'png';
  if (m === 'image/webp') return 'webp';
  return 'bin';
}

function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    const orderId = String(form.get('orderId') || '').trim();
    const email = cleanEmail(String(form.get('email') || ''));
    const phone = String(form.get('phone') || '').trim();
    const file = form.get('file');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId requerido' }, { status: 400 });
    }
    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'email o phone requerido' }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'file requerido' }, { status: 400 });
    }

    // Basic size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'El archivo excede 5MB' }, { status: 413 });
    }

    const allowedMimes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
    if (!allowedMimes.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Formato no permitido. Usa PDF/JPG/PNG/WebP' },
        { status: 415 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch order + client details for verification
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        id,
        status,
        payment_method,
        transfer_proof_url,
        client_id,
        clients:client_id (
          email,
          phone
        )
      `
      )
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Orden no encontrada' }, { status: 404 });
    }

    const client = (order as unknown as { clients?: { email?: string | null; phone?: string | null } | null }).clients;
    const clientEmail = cleanEmail(client?.email || '');
    const clientPhone = client?.phone ? normalizePhoneNumber(client.phone) : '';

    const emailMatches = email ? clientEmail === email : false;
    const phoneMatches = phone ? clientPhone === normalizePhoneNumber(phone) : false;

    if (!emailMatches && !phoneMatches) {
      return NextResponse.json(
        { success: false, error: 'No autorizado para esta orden (email/teléfono no coincide)' },
        { status: 403 }
      );
    }

    // Upload to private bucket
    const ext = safeExtFromMime(file.type);
    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const rand = crypto.randomUUID();
    const objectPath = `${yyyy}/${mm}/${dd}/${orderId}/${rand}.${ext}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from('transfer-proofs')
      .upload(objectPath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ success: false, error: `Error subiendo comprobante: ${uploadError.message}` }, { status: 500 });
    }

    // Save storage path in orders.transfer_proof_url (kept as string)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_method: 'transfer',
        status: 'pending_approval',
        transfer_proof_url: objectPath,
        rejection_reason: null,
      })
      .eq('id', orderId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: `Error actualizando orden: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: 'pending_approval',
      proofPath: objectPath,
      message: 'Comprobante recibido. Tu pago quedará en revisión.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error inesperado' },
      { status: 500 }
    );
  }
}

