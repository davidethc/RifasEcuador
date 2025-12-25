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
 * Endpoint para obtener una orden por ID
 * Usa el cliente admin para bypass de RLS
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id: orderId } = await params;

    console.log('📥 Solicitando orden:', orderId);

    // Validar formato de UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { error: 'ID de orden inválido' },
        { status: 400 }
      );
    }

    // Obtener la orden con información de la rifa
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        raffle_id,
        numbers,
        total,
        status,
        payment_method,
        created_at,
        raffles:raffle_id (
          title,
          description,
          image_url,
          price_per_ticket
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('❌ Error al obtener orden:', error);
      return NextResponse.json(
        { error: 'Orden no encontrada', details: error },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ Orden encontrada:', data.id);

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Error inesperado al obtener orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
