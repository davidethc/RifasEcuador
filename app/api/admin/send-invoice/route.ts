import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';

/**
 * Envía la factura / correo de confirmación de compra al cliente.
 * Solo admins. Útil para reenviar factura desde el panel de transferencias.
 */
export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as { orderId?: string } | null;
  const orderId = body?.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId requerido' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const emailUrl = `${baseUrl}/api/email/send-purchase-confirmation`;

  try {
    const res = await fetch(emailUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: (data as { error?: string }).error || 'Error al enviar factura' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Factura enviada al correo del cliente' });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Error al enviar factura' },
      { status: 500 }
    );
  }
}
