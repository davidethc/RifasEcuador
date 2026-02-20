-- Añade la columna cedula a la tabla clients (cédula ecuatoriana, 10 dígitos).
-- Ejecuta este script en el SQL Editor de Supabase (Dashboard → SQL Editor).
-- Es necesario ejecutarlo para que el formulario de crear cliente y la búsqueda funcionen con cédula.

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS cedula text;

COMMENT ON COLUMN clients.cedula IS 'Cédula ecuatoriana del cliente (10 dígitos). Opcional.';
