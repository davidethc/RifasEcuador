/**
 * Utilidades de depuración para verificar sorteos
 * Ejecutar en la consola del navegador para diagnosticar problemas
 */

import { supabase } from './supabase';

/**
 * Función de diagnóstico para verificar un sorteo
 * Ejecutar en consola: window.debugRaffle('ID_DEL_SORTEO')
 */
export async function debugRaffle(raffleId: string) {
  console.log('🔍 [DEBUG] Iniciando diagnóstico de sorteo:', raffleId);

  const results: Record<string, any> = {
    raffleId,
    timestamp: new Date().toISOString(),
  };

  // 1. Verificar en public_raffles
  console.log('1️⃣ Verificando en public_raffles...');
  const { data: publicRaffle, error: publicError } = await supabase
    .from('public_raffles')
    .select('*')
    .eq('id', raffleId)
    .maybeSingle();

  results.public_raffles = {
    found: !!publicRaffle,
    data: publicRaffle,
    error: publicError ? {
      code: publicError.code,
      message: publicError.message,
      details: publicError.details,
    } : null,
  };

  // 2. Verificar en tabla raffles directamente
  console.log('2️⃣ Verificando en tabla raffles...');
  const { data: raffleDirect, error: directError } = await supabase
    .from('raffles')
    .select('id, title, status, price_per_ticket, created_at')
    .eq('id', raffleId)
    .maybeSingle();

  results.raffles_table = {
    found: !!raffleDirect,
    data: raffleDirect,
    error: directError ? {
      code: directError.code,
      message: directError.message,
    } : null,
  };

  // 3. Verificar todos los sorteos activos
  console.log('3️⃣ Verificando todos los sorteos activos...');
  const { data: allActive, error: allActiveError } = await supabase
    .from('public_raffles')
    .select('id, title, price_per_ticket')
    .limit(10);

  results.all_active_raffles = {
    count: allActive?.length || 0,
    data: allActive,
    error: allActiveError ? {
      code: allActiveError.code,
      message: allActiveError.message,
    } : null,
  };

  // 4. Análisis
  console.log('4️⃣ Análisis:');
  if (raffleDirect) {
    if (raffleDirect.status !== 'active') {
      results.analysis = {
        problem: `El sorteo existe pero tiene status "${raffleDirect.status}" en lugar de "active"`,
        solution: `Ejecuta en Supabase SQL Editor: UPDATE raffles SET status = 'active' WHERE id = '${raffleId}';`,
      };
    } else if (!publicRaffle) {
      results.analysis = {
        problem: 'El sorteo está activo pero no aparece en public_raffles',
        solution: 'Verifica que la vista public_raffles esté correctamente definida en sql.supabase',
      };
    } else {
      results.analysis = {
        status: '✅ Todo correcto',
        message: 'El sorteo está activo y disponible',
      };
    }
  } else {
    results.analysis = {
      problem: 'El sorteo no existe en la base de datos',
      solution: 'Verifica que el ID sea correcto o crea un nuevo sorteo',
    };
  }

  console.table(results);
  console.log('📋 Resultado completo:', results);

  return results;
}

// Exponer globalmente para uso en consola
if (typeof window !== 'undefined') {
  (window as any).debugRaffle = debugRaffle;
}



