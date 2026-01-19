# 🔍 AUDITORÍA PROFUNDA: Sistema de Pagos Payphone

**Fecha:** 2026-01-XX  
**Auditor:** Ingeniero de Software & Tester Profesional  
**Alcance:** Flujo completo de pagos, manejo de reversos, estados, permisos y base de datos

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Flujo de Pago Completo](#flujo-de-pago-completo)
3. [Análisis de Estados](#análisis-de-estados)
4. [Manejo de Reversos](#manejo-de-reversos)
5. [Auditoría de Base de Datos](#auditoría-de-base-de-datos)
6. [Permisos y Acceso](#permisos-y-acceso)
7. [Problemas Críticos Encontrados](#problemas-críticos-encontrados)
8. [Recomendaciones](#recomendaciones)
9. [Checklist de Verificación](#checklist-de-verificación)

---

## 📊 RESUMEN EJECUTIVO

### ✅ **Aspectos Positivos**

1. ✅ **Uso de axios** - Ya implementado (no fetch)
2. ✅ **Guardado de respuesta completa** - `payphone_response` JSONB
3. ✅ **Validación estricta** - `statusCode === 3 AND transactionStatus === 'Approved'`
4. ✅ **Reintentos inteligentes** - 3 intentos con backoff exponencial
5. ✅ **Confirmación rápida** - Dentro de 5 minutos (requerido por Payphone)

### ⚠️ **Problemas Críticos Encontrados**

1. ❌ **NO hay verificación de reversos** - Si Payphone revierte, el sistema no lo detecta
2. ❌ **Actualización asíncrona sin verificación** - `processPaymentUpdate` puede fallar silenciosamente
3. ❌ **No hay validación de duplicados** - Mismo `transactionId` puede procesarse múltiples veces
4. ❌ **Falta verificación de estado antes de marcar como pagado** - No se consulta Payphone antes de actualizar
5. ⚠️ **No hay webhook de reverso** - Depende solo del callback inicial

### 📈 **Métricas de Riesgo**

- **Riesgo de Reversos No Detectados:** 🔴 ALTO
- **Riesgo de Boletos Duplicados:** 🟡 MEDIO
- **Riesgo de Estados Inconsistentes:** 🟡 MEDIO
- **Riesgo de Experiencia de Usuario:** 🟢 BAJO (bien manejado)

---

## 🔄 FLUJO DE PAGO COMPLETO

### **Fase 1: Creación de Orden**

```
Usuario selecciona boletos
  ↓
Frontend: POST /api/payment/payphone/create
  ↓
Backend crea orden en BD (status: 'reserved')
  ↓
Backend reserva tickets (status: 'reserved')
  ↓
Backend llama Payphone API Sale
  ↓
Payphone responde con transactionId
  ↓
Usuario redirigido a Payphone para pagar
```

**✅ Verificación:**
- ✅ Orden se crea correctamente
- ✅ Tickets se reservan correctamente
- ✅ `clientTransactionId` incluye `orderId`

### **Fase 2: Pago en Payphone**

```
Usuario ingresa datos de tarjeta en Payphone
  ↓
Payphone procesa pago
  ↓
Payphone redirige a: /api/payment/payphone/callback?id=X&clientTransactionId=Y
```

**⚠️ Punto Crítico:** Si el usuario cierra la ventana aquí, el pago puede quedar en estado incierto.

### **Fase 3: Callback y Confirmación (CRÍTICO - 5 minutos)**

```
Callback recibe parámetros
  ↓
confirmPayphoneTransaction() - INMEDIATAMENTE
  ↓
POST https://pay.payphonetodoesposible.com/api/button/V2/Confirm
  Body: { id: X, clientTxId: Y }
  ↓
Payphone responde con estado completo
  ↓
Si statusCode === 3 AND transactionStatus === 'Approved':
  ✅ processPaymentUpdate() (asíncrono)
  ✅ Actualizar payments.status = 'approved'
  ✅ Actualizar orders.status = 'completed'
  ✅ Actualizar tickets.status = 'paid'
  ✅ Enviar email
  ↓
Redirigir a /comprar/{orderId}/confirmacion?status=success
```

**✅ Verificación:**
- ✅ Confirmación se hace INMEDIATAMENTE (no bloquea)
- ✅ Validación estricta de aprobación
- ✅ Respuesta completa se guarda en `payphone_response`

**❌ Problemas:**
- ❌ `processPaymentUpdate` es asíncrono - si falla, no se notifica al usuario
- ❌ No hay verificación de duplicados antes de actualizar
- ❌ No se verifica si el pago ya fue procesado

---

## 📊 ANÁLISIS DE ESTADOS

### **Estados de Orden (`orders.status`)**

| Estado | Cuándo se asigna | ¿Puede ver boletos? | ¿Puede comprar más? |
|--------|------------------|---------------------|---------------------|
| `reserved` | Al crear orden | ❌ NO | ✅ SÍ |
| `completed` | Pago aprobado | ✅ SÍ | ✅ SÍ |
| `expired` | Pago cancelado/rechazado | ❌ NO | ✅ SÍ |
| `pending` | (No usado actualmente) | ❌ NO | ✅ SÍ |

**✅ Verificación:**
- ✅ Estados bien definidos
- ✅ Frontend solo muestra boletos si `status === 'completed'` (línea 254 de confirmacion/page.tsx)

### **Estados de Pago (`payments.status`)**

| Estado | Cuándo se asigna | Origen |
|--------|------------------|--------|
| `approved` | `statusCode === 3 AND transactionStatus === 'Approved'` | Payphone |
| `canceled` | `statusCode === 2 OR transactionStatus === 'Canceled'` | Payphone |
| `pending` | Otros casos | Payphone |

**✅ Verificación:**
- ✅ Validación estricta implementada
- ✅ Se guarda en `payphone_response` para auditoría

### **Estados de Ticket (`tickets.status`)**

| Estado | Cuándo se asigna | ¿Vendido? |
|--------|------------------|-----------|
| `reserved` | Al crear orden | ❌ NO |
| `paid` | Pago aprobado | ✅ SÍ |
| `cancelled` | Orden expirada | ❌ NO |

**✅ Verificación:**
- ✅ Estados correctos
- ✅ Solo se marca `paid` cuando `order.status === 'completed'`

---

## 🔄 MANEJO DE REVERSOS

### **⚠️ PROBLEMA CRÍTICO: NO HAY DETECCIÓN DE REVERSOS**

**Escenario de Reverso:**

```
1. Usuario paga → Payphone aprueba
2. Callback confirma → Sistema marca como 'paid'
3. 10 minutos después → Payphone revierte (por fraude, banco, etc.)
4. ❌ Sistema NO detecta el reverso
5. ❌ Boletos siguen marcados como 'paid'
6. ❌ Usuario tiene boletos sin pagar
```

**Causas de Reversos:**
- Fraude detectado por el banco
- Tarjeta sin fondos (débito diferido)
- Disputa del cliente
- Reverso manual por Payphone
- Timeout de confirmación (ya resuelto con axios)

### **Solución Actual (INSUFICIENTE):**

✅ **Confirmación rápida** - Previene reversos por timeout  
❌ **NO hay verificación periódica** - No detecta reversos posteriores  
❌ **NO hay webhook de reverso** - Depende solo del callback inicial  
❌ **NO hay consulta de estado** - No verifica con Payphone periódicamente

### **Recomendación CRÍTICA:**

Implementar **verificación periódica** de pagos aprobados:

```typescript
// Cron job cada 1 hora
// Verificar pagos aprobados de las últimas 24 horas
// Consultar estado en Payphone
// Si statusCode !== 3 o transactionStatus !== 'Approved':
//   → Revertir orden a 'expired'
//   → Revertir tickets a 'reserved'
//   → Notificar al usuario
```

---

## 🗄️ AUDITORÍA DE BASE DE DATOS

### **Tabla: `orders`**

**Campos Relevantes:**
- `id` (UUID) - ✅ Primary Key
- `raffle_id` - ✅ Foreign Key
- `client_id` - ✅ Foreign Key
- `numbers` (JSONB) - ✅ Array de números de boletos
- `total` (DECIMAL) - ✅ Monto total
- `status` - ✅ Enum: 'reserved' | 'completed' | 'expired'
- `payment_method` - ✅ String: 'payphone' | null
- `created_at` - ✅ Timestamp

**✅ Verificaciones:**
- ✅ Estructura correcta
- ✅ Relaciones bien definidas
- ✅ `numbers` es JSONB (permite arrays)

**❌ Problemas Potenciales:**
- ⚠️ No hay índice en `status` (puede ser lento en consultas grandes)
- ⚠️ No hay `updated_at` (difícil auditar cambios)
- ⚠️ No hay `payment_id` directo (solo vía `payments.order_id`)

### **Tabla: `payments`**

**Campos Relevantes:**
- `id` (UUID) - ✅ Primary Key
- `order_id` (UUID) - ✅ Foreign Key
- `provider` - ✅ String: 'payphone'
- `provider_reference` - ✅ String (transactionId de Payphone)
- `amount` (DECIMAL) - ✅ Monto pagado
- `status` - ✅ String: 'approved' | 'canceled' | 'pending'
- `payphone_response` (JSONB) - ✅ Respuesta completa de Payphone
- `created_at` - ✅ Timestamp

**✅ Verificaciones:**
- ✅ `payphone_response` guarda respuesta completa
- ✅ `provider_reference` permite buscar por transactionId
- ✅ Relación con `orders` correcta

**❌ Problemas Críticos:**
- ❌ **NO hay índice único en `provider_reference`** - Permite duplicados
- ❌ **NO hay `updated_at`** - No se puede auditar cambios
- ❌ **NO hay campo `reversed_at`** - No se puede rastrear reversos
- ❌ **NO hay campo `reversal_reason`** - No se sabe por qué se revirtió

**⚠️ Riesgo de Duplicados:**

```sql
-- PROBLEMA: Mismo transactionId puede procesarse 2 veces
INSERT INTO payments (provider_reference, ...) VALUES ('12345', ...);
INSERT INTO payments (provider_reference, ...) VALUES ('12345', ...); -- ❌ PERMITIDO
```

**Solución:**
```sql
-- Agregar índice único
CREATE UNIQUE INDEX idx_payments_provider_reference 
  ON payments(provider_reference) 
  WHERE provider_reference IS NOT NULL;
```

### **Tabla: `tickets`**

**Campos Relevantes:**
- `id` (UUID) - ✅ Primary Key
- `raffle_id` - ✅ Foreign Key
- `number` (STRING) - ✅ Número del boleto
- `status` - ✅ Enum: 'reserved' | 'paid' | 'cancelled'
- `payment_id` - ✅ Foreign Key (nullable)
- `user_id` - ✅ Foreign Key (nullable - para usuarios logueados)

**✅ Verificaciones:**
- ✅ Estructura correcta
- ✅ `payment_id` permite rastrear qué pago pagó el boleto
- ✅ `user_id` permite filtrar boletos por usuario

**❌ Problemas Potenciales:**
- ⚠️ No hay índice único en `(raffle_id, number)` - Puede haber duplicados
- ⚠️ No hay `updated_at` - No se puede auditar cambios

**⚠️ Riesgo de Duplicados:**

```sql
-- PROBLEMA: Mismo número puede reservarse 2 veces
INSERT INTO tickets (raffle_id, number, status) VALUES ('raffle-1', '001', 'reserved');
INSERT INTO tickets (raffle_id, number, status) VALUES ('raffle-1', '001', 'reserved'); -- ❌ PERMITIDO
```

**Solución:**
```sql
-- Agregar índice único
CREATE UNIQUE INDEX idx_tickets_raffle_number 
  ON tickets(raffle_id, number);
```

### **Tabla: `clients`**

**Campos Relevantes:**
- `id` (UUID) - ✅ Primary Key
- `email` - ✅ String (único)
- `name` - ✅ String
- `phone` - ✅ String
- `auth_user_id` - ✅ Foreign Key (nullable - para usuarios logueados)

**✅ Verificaciones:**
- ✅ `auth_user_id` permite vincular con usuarios autenticados
- ✅ Permite compras sin login (guest checkout)

**❌ Problemas Potenciales:**
- ⚠️ No hay índice único en `email` (puede haber duplicados si no está en DB)

---

## 🔐 PERMISOS Y ACCESO

### **Usuarios NO Logueados (Guest Checkout)**

**✅ Verificaciones:**
- ✅ Pueden comprar boletos
- ✅ Pueden ver confirmación de compra (`/comprar/{orderId}/confirmacion`)
- ✅ Reciben email de confirmación
- ❌ **NO pueden ver "Mis Boletos"** (requiere login)

**Flujo:**
```
1. Usuario NO logueado compra boletos
2. Se crea `client` sin `auth_user_id`
3. Se crea `order` con `client_id`
4. Usuario puede ver confirmación por URL directa
5. Si luego se registra con mismo email → Se vincula automáticamente
```

**✅ Verificación de Vinculación:**
- ✅ `purchaseService.findClientByUser()` busca por email
- ✅ Si encuentra cliente con mismo email → vincula `auth_user_id`
- ✅ `purchaseService.getUserTickets()` muestra boletos vinculados

### **Usuarios Logueados**

**✅ Verificaciones:**
- ✅ Pueden comprar boletos
- ✅ Pueden ver "Mis Boletos" (`/mis-boletos`)
- ✅ Solo ven SUS boletos (filtrados por `auth_user_id`)

**Flujo:**
```
1. Usuario logueado compra boletos
2. Se crea/actualiza `client` con `auth_user_id`
3. Se crea `order` con `client_id`
4. Usuario puede ver boletos en "Mis Boletos"
```

**✅ Verificación de Filtrado:**
- ✅ `purchaseService.getUserTickets()` filtra por `auth_user_id`
- ✅ RLS (Row Level Security) debería proteger (verificar en Supabase)

**⚠️ Problema Potencial:**
- ⚠️ Si RLS no está configurado, usuarios podrían ver boletos de otros
- ⚠️ Frontend filtra, pero backend debe también proteger

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### **1. ❌ NO HAY DETECCIÓN DE REVERSOS POSTERIORES**

**Severidad:** 🔴 CRÍTICA  
**Impacto:** Usuarios pueden tener boletos sin pagar

**Descripción:**
Si Payphone revierte un pago después de que el sistema lo marcó como aprobado, el sistema NO lo detecta. Los boletos siguen marcados como 'paid' aunque el pago fue revertido.

**Solución:**
Implementar cron job que verifique periódicamente el estado de pagos aprobados.

### **2. ❌ ACTUALIZACIÓN ASÍNCRONA SIN VERIFICACIÓN**

**Severidad:** 🟡 MEDIA  
**Impacto:** Si `processPaymentUpdate` falla, el usuario ve éxito pero la BD no se actualiza

**Descripción:**
En `callback/route.ts`, `processPaymentUpdate` se ejecuta de forma asíncrona. Si falla, solo se registra en logs, pero el usuario ya fue redirigido a la página de éxito.

**Solución:**
- Opción 1: Hacer síncrono (más lento pero más seguro)
- Opción 2: Implementar retry mechanism
- Opción 3: Verificar estado antes de mostrar éxito

### **3. ❌ NO HAY VALIDACIÓN DE DUPLICADOS**

**Severidad:** 🟡 MEDIA  
**Impacto:** Mismo pago puede procesarse múltiples veces

**Descripción:**
Si el callback se llama 2 veces (por ejemplo, usuario refresca), el sistema puede procesar el mismo pago 2 veces, creando 2 registros en `payments`.

**Solución:**
- Agregar índice único en `payments.provider_reference`
- Verificar si ya existe pago antes de crear nuevo

### **4. ⚠️ NO HAY VERIFICACIÓN DE ESTADO ANTES DE MARCAR COMO PAGADO**

**Severidad:** 🟡 MEDIA  
**Impacto:** Si Payphone cambia el estado después, no se detecta

**Descripción:**
El sistema confía en la respuesta del callback inicial. No verifica el estado actual en Payphone antes de marcar como pagado.

**Solución:**
Antes de marcar como `paid`, consultar estado actual en Payphone usando `/api/payment/payphone/status`.

### **5. ⚠️ FALTA ÍNDICE ÚNICO EN `payments.provider_reference`**

**Severidad:** 🟡 MEDIA  
**Impacto:** Permite duplicados en base de datos

**Solución:**
```sql
CREATE UNIQUE INDEX idx_payments_provider_reference 
  ON payments(provider_reference) 
  WHERE provider_reference IS NOT NULL;
```

### **6. ⚠️ FALTA ÍNDICE ÚNICO EN `tickets(raffle_id, number)`**

**Severidad:** 🟡 MEDIA  
**Impacto:** Mismo número puede reservarse 2 veces

**Solución:**
```sql
CREATE UNIQUE INDEX idx_tickets_raffle_number 
  ON tickets(raffle_id, number);
```

---

## 💡 RECOMENDACIONES

### **Prioridad ALTA (Implementar Inmediatamente)**

1. **✅ Implementar verificación periódica de reversos**
   - Cron job cada 1 hora
   - Verificar pagos aprobados de últimas 24 horas
   - Consultar estado en Payphone
   - Revertir si detecta reverso

2. **✅ Agregar índices únicos**
   - `payments.provider_reference`
   - `tickets(raffle_id, number)`

3. **✅ Validar duplicados antes de procesar**
   - Verificar si `provider_reference` ya existe
   - Si existe, retornar pago existente (idempotencia)

4. **✅ Verificar estado antes de marcar como pagado**
   - Antes de actualizar a `paid`, consultar `/api/payment/payphone/status`
   - Solo marcar como `paid` si estado actual es aprobado

### **Prioridad MEDIA (Implementar Pronto)**

5. **✅ Agregar campos de auditoría**
   - `orders.updated_at`
   - `payments.updated_at`
   - `payments.reversed_at`
   - `payments.reversal_reason`

6. **✅ Mejorar manejo de errores en `processPaymentUpdate`**
   - Retry mechanism
   - Notificación si falla
   - Logging estructurado

7. **✅ Implementar webhook de Payphone (si disponible)**
   - Backup del callback
   - Notificación de reversos en tiempo real

### **Prioridad BAJA (Mejoras Futuras)**

8. **✅ Dashboard de transacciones**
   - Ver todas las transacciones
   - Filtrar por estado
   - Ver `payphone_response` completo

9. **✅ Alertas automáticas**
   - Email si reverso detectado
   - Slack/Discord si pago falla

10. **✅ Tests automatizados**
    - Test de flujo completo
    - Test de reversos
    - Test de duplicados

---

## ✅ CHECKLIST DE VERIFICACIÓN

### **Flujo de Pago**

- [x] ✅ Orden se crea correctamente
- [x] ✅ Tickets se reservan correctamente
- [x] ✅ Payphone recibe solicitud correcta
- [x] ✅ Callback se ejecuta correctamente
- [x] ✅ Confirmación se hace dentro de 5 minutos
- [x] ✅ Validación estricta de aprobación
- [x] ✅ Respuesta completa se guarda
- [ ] ❌ **Verificación de reversos** (FALTA)
- [ ] ❌ **Validación de duplicados** (FALTA)

### **Estados**

- [x] ✅ Estados bien definidos
- [x] ✅ Frontend solo muestra boletos si `completed`
- [x] ✅ Validación estricta (`statusCode === 3 AND transactionStatus === 'Approved'`)
- [ ] ❌ **Verificación periódica de estados** (FALTA)

### **Base de Datos**

- [x] ✅ Estructura correcta
- [x] ✅ Relaciones bien definidas
- [x] ✅ `payphone_response` guarda respuesta completa
- [ ] ❌ **Índice único en `payments.provider_reference`** (FALTA)
- [ ] ❌ **Índice único en `tickets(raffle_id, number)`** (FALTA)
- [ ] ❌ **Campos de auditoría (`updated_at`, etc.)** (FALTA)

### **Permisos**

- [x] ✅ Usuarios NO logueados pueden comprar
- [x] ✅ Usuarios logueados pueden ver sus boletos
- [x] ✅ Filtrado por `auth_user_id` funciona
- [ ] ⚠️ **Verificar RLS en Supabase** (VERIFICAR MANUALMENTE)

### **Experiencia de Usuario**

- [x] ✅ Redirección inmediata (no bloquea)
- [x] ✅ Polling automático si pendiente
- [x] ✅ Email de confirmación
- [x] ✅ Mensajes claros de estado
- [x] ✅ No muestra boletos hasta pago confirmado

---

## 📝 CONCLUSIÓN

### **Estado General: 🟡 REQUIERE MEJORAS**

El sistema está **bien implementado** en términos de:
- ✅ Flujo de pago funcional
- ✅ Validación estricta de estados
- ✅ Experiencia de usuario
- ✅ Guardado de respuesta completa

Sin embargo, **requiere mejoras críticas** en:
- ❌ Detección de reversos
- ❌ Validación de duplicados
- ❌ Índices únicos en BD
- ❌ Verificación periódica de estados

### **Riesgo para Producción: 🟡 MEDIO-ALTO**

**Riesgos:**
1. Reversos no detectados → Boletos sin pagar
2. Duplicados → Contabilidad incorrecta
3. Estados inconsistentes → Confusión de usuarios

**Recomendación:**
Implementar mejoras de **Prioridad ALTA** antes de producción.

---

**Fin de Auditoría**
