import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { logger } from '@/utils/logger';

/**
 * POST /api/admin/send-past-comprobantes
 * Envía una copia del comprobante de cada orden completada al correo del admin (administracion@altokeec.com).
 * Útil para recibir los comprobantes de compras que ya se hicieron antes de activar el BCC.
 */
export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseAdmin();
  const { data: orders, error: fetchError } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (fetchError) {
    logger.error('[send-past-comprobantes] Error al listar órdenes:', fetchError);
    return NextResponse.json(
      { success: false, error: fetchError.message },
      { status: 500 }
    );
  }

  if (!orders?.length) {
    return NextResponse.json({
      success: true,
      sent: 0,
      failed: 0,
      message: 'No hay órdenes completadas.',
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const emailUrl = `${baseUrl}/api/email/send-purchase-confirmation`;
  let sent = 0;
  let failed = 0;
  const errors: { orderId: string; error: string }[] = [];

  for (let i = 0; i < orders.length; i++) {
    const orderId = orders[i].id;
    try {
      const res = await fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, sendCopyToAdminOnly: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        sent++;
        logger.info(`[send-past-comprobantes] ✓ Enviado: ${orderId}`);
      } else {
        failed++;
        const errorMsg = (data as { error?: string }).error || res.statusText;
        errors.push({ orderId, error: errorMsg });
        logger.error(`[send-past-comprobantes] ✗ Falló: ${orderId} - ${errorMsg}`);
      }
      // Pequeño delay para evitar rate limits (200ms entre cada correo)
      if (i < orders.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (e) {
      failed++;
      const errorMsg = e instanceof Error ? e.message : 'Error de red';
      errors.push({ orderId, error: errorMsg });
      logger.error(`[send-past-comprobantes] ✗ Error: ${orderId} - ${errorMsg}`);
    }
  }

  logger.info(`[send-past-comprobantes] Enviados: ${sent}, fallidos: ${failed}`);

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total: orders.length,
    ...(errors.length > 0 && { errors }),
  });
}
