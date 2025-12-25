# 📋 Cómo Validar una Compra

## 🔍 Campos Vacíos Identificados

Basándome en las imágenes de tu base de datos, estos son los campos que están vacíos:

### 1. **Tabla `sales` (Ventas)**

#### Campos vacíos o con valores incorrectos:

- **`payment_id`** → `NULL` (debería tener el ID de Payphone)
  - **Problema:** No se está guardando el `clientTransactionId` de Payphone
  - **Solución:** Se debe actualizar cuando se confirma el pago

- **`ticket_start_number`** → `0` (debería tener el primer número de boleto)
- **`ticket_end_number`** → `0` (debería tener el último número de boleto)
  - **Problema:** Los boletos no se están asignando correctamente
  - **Solución:** Se asignan cuando se completa el pago

- **`completed_at`** → `NULL` (debería tener fecha cuando se completa)
  - **Problema:** No se está marcando como completada
  - **Solución:** Se actualiza cuando `payment_status` cambia a `completed`

- **`payment_status`** → `pending` (debería ser `completed` si el pago fue exitoso)
  - **Problema:** No se está actualizando después del pago
  - **Solución:** Se actualiza cuando Payphone confirma el pago

- **`email_sent`** → `FALSE` (debería ser `TRUE` si se envió)
- **`whatsapp_sent`** → `FALSE` (debería ser `TRUE` si se envió)
  - **Problema:** Las notificaciones no se están enviando
  - **Solución:** Se actualizan cuando se envían las notificaciones

---

### 2. **Tabla `payments` (Pagos)**

- **Tabla completamente vacía** ❌
  - **Problema:** No se están creando registros de pagos
  - **Solución:** Se debe crear un registro cuando se inicia el pago

---

### 3. **Tabla `notifications` (Notificaciones)**

- **Tabla completamente vacía** ❌
  - **Problema:** No se están registrando las notificaciones enviadas
  - **Solución:** Se debe crear un registro cada vez que se envía una notificación

---

## ✅ Cómo Validar una Compra

Una compra está **completamente validada** cuando cumple TODOS estos criterios:

### Criterio 1: Pago Confirmado

1. **En la tabla `sales`:**
   - ✅ `payment_status` = `'completed'`
   - ✅ `payment_id` tiene un valor (el `clientTransactionId` de Payphone)
   - ✅ `completed_at` tiene una fecha (no es `NULL`)

2. **En la tabla `payments`:**
   - ✅ Existe un registro con `payment_id` = `clientTransactionId`
   - ✅ `status` = `'Approved'` o `'approved'`
   - ✅ `transaction_id` tiene el ID de Payphone

---

### Criterio 2: Boletos Asignados

1. **En la tabla `sales`:**
   - ✅ `ticket_start_number` > 0 (no es 0)
   - ✅ `ticket_end_number` > 0 (no es 0)
   - ✅ `ticket_end_number` >= `ticket_start_number`

2. **En la tabla `tickets`:**
   - ✅ Existen registros con `sale_id` = ID de la venta
   - ✅ `status` = `'sold'`
   - ✅ Los números de boletos coinciden con el rango en `sales`

---

### Criterio 3: Notificaciones Enviadas (Opcional)

1. **En la tabla `sales`:**
   - ✅ `email_sent` = `TRUE` (si se envió email)
   - ✅ `whatsapp_sent` = `TRUE` (si se envió WhatsApp)

2. **En la tabla `notifications`:**
   - ✅ Existen registros con `sale_id` = ID de la venta
   - ✅ `status` = `'sent'`

---

## 🔧 Validación Manual de una Compra

Si una compra está en `pending` pero el pago fue exitoso (según tu correo de Payphone), puedes validarla manualmente:

### Paso 1: Identificar la Venta

1. Ve a la tabla `sales` en Supabase
2. Busca la venta por:
   - `customer_id` (si conoces el cliente)
   - `created_at` (fecha aproximada)
   - `total_amount` (monto de la compra)

### Paso 2: Obtener el `clientTransactionId`

El `clientTransactionId` tiene el formato: `sale-{sale_id}-{timestamp}`

Ejemplo: `sale-7d2dbde8-0b87-4d66-a7b2-e08097b0478e-17656634`

- El `sale_id` es: `7d2dbde8-0b87-4d66-a7b2-e08097b0478e`
- El `timestamp` es: `17656634`

### Paso 3: Actualizar la Venta Manualmente

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- 1. Actualizar el estado de la venta
UPDATE sales
SET 
  payment_status = 'completed',
  payment_id = 'sale-{SALE_ID}-{TIMESTAMP}', -- Reemplaza con el clientTransactionId real
  completed_at = NOW()
WHERE id = '{SALE_ID}'; -- Reemplaza con el ID de la venta

-- 2. Asignar boletos (si no están asignados)
-- Primero verifica si hay boletos disponibles
SELECT * FROM assign_tickets_atomic(
  '{RAFFLE_ID}', -- ID del sorteo
  {QUANTITY},    -- Cantidad de boletos
  '{SALE_ID}'    -- ID de la venta
);

-- 3. Crear registro en payments (si no existe)
INSERT INTO payments (
  sale_id,
  payment_id,
  amount,
  currency,
  status,
  payment_method,
  payphone_response
) VALUES (
  '{SALE_ID}',
  'sale-{SALE_ID}-{TIMESTAMP}',
  {TOTAL_AMOUNT}, -- Ejemplo: 1.00
  'USD',
  'Approved',
  'payphone',
  '{"transactionId": "{PAYPHONE_TRANSACTION_ID}", "transactionStatus": "Approved"}'::jsonb
)
ON CONFLICT (payment_id) DO NOTHING;
```

---

## 🚨 Problema Actual

El flujo de confirmación de pago está fallando porque:

1. **Error de CORS** en la Edge Function `confirm-payphone-button`
2. **No se está ejecutando** el código que actualiza `sales` y `payments`
3. **No se están asignando** los boletos después del pago

**Por eso:**
- Las ventas quedan en `pending`
- `payment_id` está vacío
- `completed_at` está vacío
- `ticket_start_number` y `ticket_end_number` están en 0
- La tabla `payments` está vacía

---

## ✅ Solución Temporal (Manual)

Mientras se corrige el flujo automático, puedes validar compras manualmente usando el SQL de arriba.

---

## 🎯 Solución Definitiva

Una vez que se corrija el error de CORS en la Edge Function, el flujo debería:

1. ✅ Confirmar el pago con Payphone
2. ✅ Crear registro en `payments`
3. ✅ Actualizar `sales` con `payment_status = 'completed'`
4. ✅ Asignar boletos automáticamente
5. ✅ Enviar notificaciones
6. ✅ Registrar en `notifications`

---

**¿Necesitas ayuda para validar una compra específica? Comparte el `sale_id` y te ayudo con el SQL exacto.** 🚀

