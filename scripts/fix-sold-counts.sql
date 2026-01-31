-- ============================================
-- SCRIPT PARA VERIFICAR Y CORREGIR CONTEO DE BOLETOS VENDIDOS
-- ============================================
-- Este script:
-- 1. Verifica el estado actual de órdenes y pagos
-- 2. Actualiza órdenes a 'completed' si tienen pagos aprobados
-- 3. Actualiza tickets a 'paid' si corresponden a órdenes con pagos aprobados
-- 4. Muestra estadísticas finales
-- ============================================

-- PASO 1: Verificar estado actual
SELECT 
    'ESTADO ACTUAL' as seccion,
    COUNT(*) as total_ordenes,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as ordenes_completadas,
    COUNT(CASE WHEN status != 'completed' THEN 1 END) as ordenes_no_completadas
FROM orders;

SELECT 
    'PAGOS' as seccion,
    COUNT(*) as total_pagos,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as pagos_aprobados,
    COUNT(CASE WHEN status != 'approved' THEN 1 END) as pagos_no_aprobados
FROM payments;

SELECT 
    'TICKETS' as seccion,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as tickets_pagados,
    COUNT(CASE WHEN status = 'reserved' THEN 1 END) as tickets_reservados
FROM tickets;

-- PASO 2: Ver órdenes con pagos aprobados que NO están completadas
SELECT 
    o.id as order_id,
    o.raffle_id,
    o.status as order_status,
    o.numbers as ticket_numbers,
    p.id as payment_id,
    p.status as payment_status,
    p.amount,
    p.created_at as payment_date
FROM orders o
INNER JOIN payments p ON p.order_id = o.id
WHERE p.status = 'approved'
  AND o.status != 'completed'
ORDER BY p.created_at DESC;

-- PASO 3: Actualizar órdenes a 'completed' si tienen pagos aprobados
UPDATE orders
SET 
    status = 'completed',
    payment_method = COALESCE(payment_method, 'payphone')
WHERE id IN (
    SELECT DISTINCT o.id
    FROM orders o
    INNER JOIN payments p ON p.order_id = o.id
    WHERE p.status = 'approved'
      AND o.status != 'completed'
);

-- PASO 4: Verificar tickets que necesitan actualizarse
SELECT 
    t.id as ticket_id,
    t.raffle_id,
    t.number as ticket_number,
    t.status as ticket_status,
    o.id as order_id,
    o.status as order_status,
    p.status as payment_status
FROM tickets t
INNER JOIN orders o ON o.raffle_id = t.raffle_id 
    AND t.number::text = ANY(
        SELECT jsonb_array_elements_text(o.numbers::jsonb)
    )
INNER JOIN payments p ON p.order_id = o.id
WHERE p.status = 'approved'
  AND o.status = 'completed'
  AND t.status != 'paid'
LIMIT 20;

-- PASO 5: Actualizar tickets a 'paid' para órdenes completadas con pagos aprobados
UPDATE tickets t
SET 
    status = 'paid',
    payment_id = p.id
FROM orders o
INNER JOIN payments p ON p.order_id = o.id
WHERE t.raffle_id = o.raffle_id
  AND t.number::text = ANY(
      SELECT jsonb_array_elements_text(o.numbers::jsonb)
  )
  AND p.status = 'approved'
  AND o.status = 'completed'
  AND t.status != 'paid';

-- PASO 6: Estadísticas finales por sorteo
SELECT 
    r.id as raffle_id,
    r.title as raffle_title,
    COUNT(DISTINCT o.id) as total_ordenes_completadas,
    COUNT(DISTINCT p.id) as total_pagos_aprobados,
    SUM(jsonb_array_length(o.numbers::jsonb)) as total_boletos_vendidos,
    COUNT(DISTINCT CASE WHEN t.status = 'paid' THEN t.id END) as tickets_pagados
FROM raffles r
LEFT JOIN orders o ON o.raffle_id = r.id AND o.status = 'completed'
LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'approved'
LEFT JOIN tickets t ON t.raffle_id = r.id AND t.status = 'paid'
GROUP BY r.id, r.title
ORDER BY total_boletos_vendidos DESC;

-- PASO 7: Verificación final - Conteo de boletos vendidos por sorteo
-- (Este es el mismo cálculo que hace el frontend)
SELECT 
    r.id as raffle_id,
    r.title as raffle_title,
    COALESCE(SUM(
        CASE 
            WHEN o.status = 'completed' 
            AND p.status = 'approved' 
            AND o.numbers IS NOT NULL
            THEN jsonb_array_length(o.numbers::jsonb)
            ELSE 0
        END
    ), 0) as boletos_vendidos_calculados
FROM raffles r
LEFT JOIN orders o ON o.raffle_id = r.id
LEFT JOIN payments p ON p.order_id = o.id
GROUP BY r.id, r.title
ORDER BY boletos_vendidos_calculados DESC;

-- ============================================
-- RESUMEN DE CAMBIOS
-- ============================================
-- Si ejecutaste este script, deberías ver:
-- 1. Órdenes actualizadas a 'completed'
-- 2. Tickets actualizados a 'paid'
-- 3. Estadísticas correctas de boletos vendidos
-- ============================================

