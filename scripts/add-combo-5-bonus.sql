-- ============================================
-- MIGRACIÓN: Combo 5 boletos + 1 gratis
-- ============================================
-- Este script agrega la lógica del pack "5 boletos + 1 gratis"
-- a la función reserve_tickets_random, igual que combo 10 y 20.
--
-- IMPORTANTE: Ejecuta esto en el SQL Editor de Supabase.
-- Si la función tiene una estructura diferente, adapta el CASE/IF.
-- ============================================

-- PASO 1 (opcional): Ver la definición actual de la función
-- Ejecuta esto para ver cómo está implementada reserve_tickets_random:
--
-- SELECT pg_get_functiondef(oid) 
-- FROM pg_proc 
-- WHERE proname = 'reserve_tickets_random';

-- PASO 2: Buscar en la función el bloque que maneja combo 10 y 20.
-- Debe haber algo como:
--   WHEN p_quantity = 10 THEN 12
--   WHEN p_quantity = 20 THEN 24
--
-- Agrega ANTES de esos casos:
--   WHEN p_quantity = 5 THEN 6
--
-- O si usa IF:
--   IF p_quantity = 5 THEN v_quantity := 6;
--   ELSIF p_quantity = 10 THEN v_quantity := 12;
--   ...

-- PASO 3: Si la función usa un CASE, el bloque completo debería verse así:
/*
  v_quantity_to_reserve := CASE p_quantity
    WHEN 5 THEN 6   -- 5 boletos + 1 gratis (NUEVO)
    WHEN 10 THEN 12 -- 10 + 2 gratis
    WHEN 20 THEN 24 -- 20 + 4 gratis
    ELSE p_quantity
  END;
*/

-- Si usas un enfoque con variables IF/ELSIF, agrega al inicio:
/*
  IF p_quantity = 5 THEN
    v_quantity_to_reserve := 6;  -- 5 + 1 gratis
  ELSIF p_quantity = 10 THEN
    v_quantity_to_reserve := 12; -- 10 + 2 gratis
  ELSIF p_quantity = 20 THEN
    v_quantity_to_reserve := 24; -- 20 + 4 gratis
  ELSE
    v_quantity_to_reserve := p_quantity;
  END IF;
*/

-- ============================================
-- EJEMPLO: Si conoces la firma de la función,
-- puedes usar CREATE OR REPLACE FUNCTION completo.
-- Reemplaza [FUNCION_COMPLETA] con tu definición
-- agregando el caso WHEN 5 THEN 6.
-- ============================================
