-- ============================================
-- SCRIPT PARA AGREGAR ÍNDICES DE SEGURIDAD EN PAGOS
-- ============================================
-- Este script agrega índices únicos para prevenir:
-- 1. Duplicados en payments.provider_reference (mismo transactionId)
-- 2. Duplicados en tickets(raffle_id, number) (mismo número reservado 2 veces)
-- ============================================

-- PASO 1: Verificar si ya existen índices
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename IN ('payments', 'tickets')
  AND indexname IN (
    'idx_payments_provider_reference',
    'idx_tickets_raffle_number'
  );

-- PASO 2: Agregar índice único en payments.provider_reference
-- Esto previene que el mismo transactionId se procese 2 veces
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_reference 
  ON payments(provider_reference) 
  WHERE provider_reference IS NOT NULL;

COMMENT ON INDEX idx_payments_provider_reference IS 
  'Índice único para prevenir duplicados de transactionId de Payphone';

-- PASO 3: Agregar índice único en tickets(raffle_id, number)
-- Esto previene que el mismo número se reserve 2 veces para el mismo sorteo
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_raffle_number 
  ON tickets(raffle_id, number);

COMMENT ON INDEX idx_tickets_raffle_number IS 
  'Índice único para prevenir que el mismo número se reserve 2 veces en un sorteo';

-- PASO 4: Verificar índices creados
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename IN ('payments', 'tickets')
  AND indexname IN (
    'idx_payments_provider_reference',
    'idx_tickets_raffle_number'
  );

-- PASO 5: Verificar si hay duplicados existentes (antes de aplicar índices)
-- Si hay duplicados, este query los mostrará
SELECT 
    provider_reference,
    COUNT(*) as count,
    array_agg(order_id) as order_ids
FROM payments
WHERE provider_reference IS NOT NULL
GROUP BY provider_reference
HAVING COUNT(*) > 1;

-- PASO 6: Verificar duplicados en tickets
SELECT 
    raffle_id,
    number,
    COUNT(*) as count,
    array_agg(id) as ticket_ids
FROM tickets
GROUP BY raffle_id, number
HAVING COUNT(*) > 1;

-- ============================================
-- NOTAS:
-- ============================================
-- 1. Si hay duplicados existentes, el índice NO se creará
--    → Primero limpiar duplicados manualmente
-- 2. El índice en payments solo aplica a provider_reference NOT NULL
--    → Permite múltiples pagos sin provider_reference (casos edge)
-- 3. El índice en tickets es estricto
--    → NO permite duplicados bajo ninguna circunstancia
-- ============================================
