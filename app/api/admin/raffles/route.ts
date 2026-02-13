import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    console.log('[admin/raffles] GET request received');
    
    // Verificar que es admin
    console.log('[admin/raffles] Checking admin auth...');
    const adminCheck = await requireAdminFromRequest(req);
    console.log('[admin/raffles] Admin check result:', adminCheck);
    
    if (!adminCheck.ok) {
      console.error('[admin/raffles] Admin check failed:', adminCheck.error);
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    console.log('[admin/raffles] Creating Supabase admin client...');
    const supabase = getSupabaseAdmin();
    console.log('[admin/raffles] Supabase client created');

    // Obtener rifas activas
    console.log('[admin/raffles] Fetching active raffles...');
    const { data: raffles, error } = await supabase
      .from('raffles')
      .select('id, title, price_per_ticket, total_numbers, status')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    console.log('[admin/raffles] Query result:', { raffles: raffles?.length, error });

    if (error) {
      console.error('[admin/raffles] Supabase error:', error);
      return NextResponse.json({ success: false, error: 'Error al obtener rifas' }, { status: 500 });
    }

    console.log('[admin/raffles] Success, returning', raffles?.length, 'raffles');
    return NextResponse.json({
      success: true,
      raffles: raffles || [],
    });
  } catch (error) {
    console.error('[admin/raffles] Unexpected error:', error);
    console.error('[admin/raffles] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
