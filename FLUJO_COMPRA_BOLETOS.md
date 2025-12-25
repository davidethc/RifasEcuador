# 🎫 Flujo Completo de Compra de Boletos - Sistema de Rifas

## 📋 Resumen Ejecutivo

Este documento describe el flujo completo de compra de boletos en el sistema de rifas, desde que el usuario ve un sorteo hasta que completa el pago y recibe sus números asignados.

---

## 🗺️ Diagrama de Flujo

```
1. Ver Sorteo (/raffles/:id)
   ↓
2. Clic "Participar ahora" → /purchase/:id
   ↓
3. Seleccionar cantidad (1, 5, 10, 20 o personalizada)
   ↓
4. Clic "Continuar con los datos" → /purchase/:id/form?quantity=X
   ↓
5. Llenar formulario de datos personales
   ↓
6. Clic "Continuar al pago" → Crea compra → /purchase/:saleId/payment
   ↓
7. Seleccionar método de pago (Payphone)
   ↓
8. Completar pago en Payphone
   ↓
9. Callback de Payphone → /payment/callback
   ↓
10. Procesar pago → Actualizar estado → /payment/result
   ↓
11. Ver confirmación → /purchase/:saleId/confirmation o /my-tickets
```

---

## 📍 Rutas del Sistema

### Rutas Principales

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `HomePage` | Lista de sorteos disponibles |
| `/raffles/:id` | `RaffleDetailPage` | Detalle del sorteo con botón "Participar ahora" |
| `/purchase/:id` | `PurchasePage` | Selección de cantidad de boletos |
| `/purchase/:id/form` | `PurchaseFormPage` | Formulario de datos personales |
| `/purchase/:saleId/payment` | `PurchasePaymentPage` | Selección de método de pago |
| `/purchase/:saleId/confirmation` | `PurchaseConfirmationPage` | Confirmación con números asignados |
| `/payment/callback` | `PaymentCallbackPage` | Callback de Payphone después del pago |
| `/payment/result` | `PaymentResultPage` | Resultado del pago (éxito/error) |
| `/my-tickets` | `MyTicketsPage` | Lista de boletos del usuario |

---

## 🔄 Flujo Detallado Paso a Paso

### **PASO 1: Usuario Ve el Sorteo**

**Ruta:** `/raffles/:id`  
**Componente:** `RaffleDetailPage`

**Qué muestra:**
- Imagen del premio (carrusel con 4 premios: KIA, Mazda, Yamaha, Sorpresa)
- Título del sorteo
- Nombre del premio
- Precio por boleto
- Descripción
- Progreso de venta (porcentaje)
- Botón **"Participar ahora"**

**Acción del usuario:**
- Hace clic en "Participar ahora"
- Redirige a `/purchase/:id`

---

### **PASO 2: Selección de Cantidad de Boletos**

**Ruta:** `/purchase/:id`  
**Componente:** `PurchasePage`  
**Stepper:** Paso 1 de 3 ("Seleccionar cantidad")

**Qué muestra:**
- **Columna izquierda:**
  - Imagen del premio
  - Información del sorteo (título, premio, descripción)
  - Progreso de venta
  - Precio por boleto

- **Columna derecha:**
  - **Selector de cantidad** (`TicketSelector`):
    - Opciones rápidas: **1 Boleto**, **Combo 5**, **Combo 10**, **Combo 20**
    - Input personalizado para cantidad (1-100)
    - Muestra precio total en tiempo real
  - Resumen de compra:
    - Cantidad seleccionada
    - Precio unitario
    - **Total a pagar**
  - Botón **"Continuar con los datos"**

**Opciones de compra:**
- ✅ **Por unidad:** Seleccionar 1 boleto
- ✅ **Cajas/Combos:** 
  - Combo 5 boletos
  - Combo 10 boletos
  - Combo 20 boletos
- ✅ **Cantidad personalizada:** Input numérico (1-100)

**Datos capturados:**
- `quantity`: Cantidad de boletos seleccionada
- `raffleId`: ID del sorteo

**Acción del usuario:**
- Selecciona cantidad (1, 5, 10, 20 o personalizada)
- Hace clic en "Continuar con los datos"
- Redirige a `/purchase/:id/form?quantity=X`

---

### **PASO 3: Formulario de Datos Personales**

**Ruta:** `/purchase/:id/form?quantity=X`  
**Componente:** `PurchaseFormPage`  
**Stepper:** Paso 2 de 3 ("Completar datos")

**Qué muestra:**
- **Columna izquierda:** Formulario con campos:
  - **Nombre(s)** (requerido)
  - **Apellido(s)** (requerido)
  - **Número WhatsApp** (requerido, formato Ecuador: +593 939039191 o 0939039191)
  - **Correo Electrónico** (requerido, validación de formato)
  - **Confirma el Correo Electrónico** (requerido, debe coincidir)
  - **Cédula/Documento de Identidad** (opcional, pero recomendado para Payphone)

- **Columna derecha:**
  - Resumen del sorteo (imagen, título, premio)
  - Detalles de la compra:
    - Cantidad de boletos
    - Precio unitario
    - Total a pagar

**Validaciones:**
- ✅ Nombre y apellido: No vacíos
- ✅ WhatsApp: Formato válido para Ecuador (+593 o 0 seguido de 9 dígitos)
- ✅ Email: Formato válido y coincidencia con confirmación
- ✅ Validación en tiempo real (bordes verdes cuando es válido)

**Acción del usuario:**
- Llena todos los campos requeridos
- Hace clic en **"Continuar al pago"**

**Proceso backend (al enviar):**
1. Llama a `purchaseService.createPurchaseWithCustomer()`
2. Crea o actualiza `customer` en la base de datos
3. Crea `sale` con estado `pending`
4. Asigna boletos aleatoriamente usando función SQL `assign_tickets_atomic()`
5. Actualiza `sale` con `ticket_start_number` y `ticket_end_number`
6. Retorna `saleId`
7. Redirige a `/purchase/:saleId/payment`

**Nota importante:** Los boletos se asignan **ANTES** del pago, pero quedan en estado `pending` hasta que se confirme el pago.

---

### **PASO 4: Selección de Método de Pago**

**Ruta:** `/purchase/:saleId/payment`  
**Componente:** `PurchasePaymentPage`  
**Stepper:** Paso 3 de 4 ("Método de pago")

**Qué muestra:**
- **Columna izquierda:**
  - Datos personales (resumen de lo ingresado):
    - Nombre completo
    - Correo electrónico
    - Teléfono
    - Identificación (si se ingresó)

- **Columna derecha:**
  - **Resumen del Pedido:**
    - ID del proyecto (raffle_id)
    - Cantidad de participaciones
    - **Total a Pagar**
  
  - **Método de Pago:**
    - Opción 1: **Tarjeta de Débito/Crédito** (Visa, Mastercard, PayPhone)
      - ⚠️ Actualmente muestra mensaje "Próximamente"
    - Opción 2: **Pagar con PayPhone** ✅
      - Al seleccionar, muestra la **Cajita de Pagos de Payphone** (`PayphonePaymentBox`)

**Componente PayphonePaymentBox:**
- Integra el widget de Payphone
- Recibe datos:
  - `saleId`: ID de la venta
  - `amount`: Monto total
  - `customerData`: Datos del cliente
  - `raffleTitle`: Título del sorteo
- Genera `clientTransactionId` con formato: `sale-{saleId}-{timestamp}`
- Configuración de Payphone:
  - `storeId`: Desde variables de entorno
  - `amount`: Monto total
  - `clientTransactionId`: Identificador único
  - `customer`: Datos del cliente

**Acción del usuario:**
- Selecciona "Pagar con PayPhone"
- Se muestra la cajita de Payphone
- Completa el pago en el widget de Payphone
- Payphone redirige automáticamente a `/payment/callback?id={transactionId}&clientTransactionID={clientTransactionId}`

---

### **PASO 5: Callback de Pago (Payphone)**

**Ruta:** `/payment/callback?id={transactionId}&clientTransactionID={clientTransactionId}`  
**Componente:** `PaymentCallbackPage`

**Proceso automático (sin interacción del usuario):**

1. **Recibe parámetros de Payphone:**
   - `id`: Transaction ID de Payphone
   - `clientTransactionID`: ID de transacción del cliente (formato: `sale-{saleId}-{timestamp}`)

2. **Confirma el estado de la transacción:**
   - Llama a `confirmButtonPayment()` que consulta el endpoint de Payphone
   - ⚠️ **IMPORTANTE:** Debe confirmarse dentro de los primeros 5 minutos o Payphone reversará la transacción

3. **Extrae `saleId` del `clientTransactionId`:**
   - Usa regex: `sale-([a-f0-9-]+)-`
   - Ejemplo: `sale-abc123-1234567890` → `saleId = "abc123"`

4. **Crea o actualiza registro en `payments`:**
   - Busca si existe `payment` con `payment_id = clientTransactionId`
   - Si no existe, crea nuevo registro:
     ```typescript
     {
       sale_id: saleId,
       payment_id: clientTransactionId,
       amount: total_amount,
       currency: 'USD',
       status: transaction.transactionStatus.toLowerCase(),
       payphone_response: transaction
     }
     ```
   - Si existe, actualiza el estado

5. **Actualiza la venta (`sales`):**
   - Si `transactionStatus === 'Approved'`:
     - `payment_status = 'completed'`
     - `payment_id = clientTransactionId`
     - `completed_at = NOW()`
   - Si `transactionStatus === 'Canceled'`:
     - `payment_status = 'cancelled'`
   - Si otro estado:
     - `payment_status = 'pending'`

6. **Si el pago fue aprobado:**
   - Verifica si los boletos ya están asignados (`ticket_start_number === 0`)
   - Si no están asignados, llama a `assign_tickets_atomic()` para asignar boletos
   - Actualiza `sale` con los números asignados
   - Envía correos de confirmación (llama a Edge Function `send-purchase-email`)

7. **Redirige a página de resultado:**
   - `/payment/result?status={transactionStatus}&transactionId={transactionId}&clientTransactionId={clientTransactionId}`

**Estados posibles:**
- ✅ `Approved` → Pago exitoso, boletos asignados
- ❌ `Canceled` → Pago cancelado
- ⏳ `Pending` → Pago pendiente

---

### **PASO 6: Resultado del Pago**

**Ruta:** `/payment/result?status={status}&transactionId={id}&clientTransactionId={clientTxId}`  
**Componente:** `PaymentResultPage`

**Qué muestra:**
- Si `status === 'Approved'`:
  - ✅ Mensaje de éxito
  - Números de boletos asignados
  - Botones: "Ver mis boletos", "Ver sorteo"
- Si `status === 'Canceled'`:
  - ❌ Mensaje de cancelación
  - Botón: "Intentar de nuevo"
- Si otro estado:
  - ⏳ Mensaje de pendiente
  - Instrucciones para verificar

---

### **PASO 7: Confirmación de Compra**

**Ruta:** `/purchase/:saleId/confirmation`  
**Componente:** `PurchaseConfirmationPage`  
**Stepper:** Paso 3 de 3 ("Confirmación")

**Qué muestra:**
- **Título:** "¡Te falta un paso!" (si el pago está pendiente)
- **Números de boletos asignados** (arriba del premio):
  - Muestra todos los números en formato visual
  - Componente: `TicketNumbersDisplay`
- **Imagen del premio**
- **Información del sorteo:**
  - Título
  - Premio
  - Cantidad de boletos
  - Total pagado
  - Fecha de compra
- **Si `payment_status === 'pending'`:**
  - Muestra la cajita de Payphone para completar el pago
- **Si `payment_status === 'completed'`:**
  - Botones: "Ver sorteo", "Ver mis boletos"

---

## 🗄️ Estructura de Base de Datos

### Tablas Involucradas

#### **`customers`**
```sql
- id (UUID)
- user_id (UUID, nullable) -- Si está autenticado
- name (TEXT) -- Nombre completo
- email (TEXT)
- phone (TEXT) -- WhatsApp
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **`sales`**
```sql
- id (UUID) -- saleId
- raffle_id (UUID)
- customer_id (UUID)
- quantity (INTEGER) -- Cantidad de boletos
- unit_price (DECIMAL)
- total_amount (DECIMAL)
- payment_status (TEXT) -- 'pending', 'completed', 'cancelled'
- payment_id (TEXT, nullable) -- clientTransactionId de Payphone
- ticket_start_number (INTEGER) -- Primer número asignado
- ticket_end_number (INTEGER) -- Último número asignado
- created_at (TIMESTAMP)
- completed_at (TIMESTAMP, nullable)
- updated_at (TIMESTAMP)
```

#### **`tickets`**
```sql
- id (UUID)
- raffle_id (UUID)
- sale_id (UUID)
- ticket_number (INTEGER) -- Número del boleto (1-60000)
- status (TEXT) -- 'available', 'reserved', 'sold'
- created_at (TIMESTAMP)
```

#### **`payments`**
```sql
- id (UUID)
- sale_id (UUID)
- payment_id (TEXT) -- clientTransactionId (único)
- transaction_id (TEXT, nullable) -- Transaction ID de Payphone
- amount (DECIMAL)
- currency (TEXT) -- 'USD'
- status (TEXT) -- 'approved', 'canceled', 'pending'
- payment_method (TEXT) -- 'payphone'
- payphone_response (JSONB) -- Respuesta completa de Payphone
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🔧 Funciones SQL Importantes

### **`assign_tickets_atomic(p_raffle_id, p_quantity, p_sale_id)`**

**Propósito:** Asigna boletos aleatoriamente de forma atómica (evita condiciones de carrera).

**Parámetros:**
- `p_raffle_id`: ID del sorteo
- `p_quantity`: Cantidad de boletos a asignar
- `p_sale_id`: ID de la venta

**Proceso:**
1. Verifica que el sorteo existe y está activo
2. Busca `p_quantity` boletos disponibles (`status = 'available'`)
3. Si no hay suficientes, retorna error
4. Actualiza los boletos a `status = 'sold'` y asigna `sale_id`
5. Retorna:
   ```json
   {
     "success": true,
     "ticket_start_number": 123,
     "ticket_end_number": 127,
     "error_message": null
   }
   ```

**Uso:**
- Se llama **antes del pago** (en `PurchaseFormPage`) para reservar boletos
- Se puede llamar **después del pago** (en `PaymentCallbackPage`) si no se asignaron antes

---

## 📦 Componentes Clave

### **`TicketSelector`**
- Muestra opciones: 1, 5, 10, 20 boletos
- Input personalizado para cantidad (1-100)
- Calcula precio total en tiempo real
- Diseño responsive con cards seleccionables

### **`PayphonePaymentBox`**
- Integra el widget de Payphone (Cajita de Pagos)
- Configuración:
  - `storeId`: Desde `VITE_PAYPHONE_STORE_ID`
  - `amount`: Monto total
  - `clientTransactionId`: `sale-{saleId}-{timestamp}`
  - `customer`: Datos del cliente
- Callbacks:
  - `onSuccess`: Cuando el pago es exitoso
  - `onError`: Cuando hay un error

### **`TicketNumbersDisplay`**
- Muestra los números de boletos asignados
- Formato visual con badges
- Responsive

---

## 🔐 Autenticación

### **Flujo de Autenticación:**

1. **Usuario NO autenticado:**
   - Puede comprar boletos (guest)
   - Se crea `customer` sin `user_id`
   - Recibe números por email/WhatsApp
   - No puede ver boletos en "Mis Boletos"

2. **Usuario autenticado:**
   - Se crea/actualiza `user` en tabla `users`
   - Se vincula `customer` con `user_id`
   - Puede ver boletos en "Mis Boletos"
   - Recibe números por email/WhatsApp

### **Verificación de Autenticación:**
- En `PurchaseFormPage`: No requiere autenticación
- En `PurchasePaymentPage`: No requiere autenticación
- En `MyTicketsPage`: Requiere autenticación (redirige a login si no está autenticado)

---

## 💳 Integración con Payphone

### **Configuración:**
- **Store ID:** `VITE_PAYPHONE_STORE_ID`
- **Environment:** `VITE_PAYPHONE_ENVIRONMENT` (sandbox/production)
- **Widget:** Payphone Button (Cajita de Pagos)

### **Flujo de Pago:**
1. Usuario selecciona "Pagar con PayPhone"
2. Se muestra el widget de Payphone
3. Usuario completa el pago en Payphone
4. Payphone redirige a `/payment/callback` con parámetros:
   - `id`: Transaction ID
   - `clientTransactionID`: ID de transacción del cliente
5. Se confirma el estado con Payphone API
6. Se actualiza la base de datos
7. Se redirige a página de resultado

### **Formato de `clientTransactionId`:**
```
sale-{saleId}-{timestamp}
```
Ejemplo: `sale-abc123def456-1703123456789`

---

## 📧 Notificaciones

### **Correos Electrónicos:**
- Se envían después de confirmar el pago
- Edge Function: `send-purchase-email`
- Contenido:
  - Números de boletos asignados
  - Información del sorteo
  - Total pagado
  - Fecha de compra

### **WhatsApp:**
- ⚠️ Pendiente de implementación
- Se planea enviar números por WhatsApp usando la API de WhatsApp

---

## 🎯 Puntos Importantes

### **Asignación de Boletos:**
- ✅ Los boletos se asignan **ANTES** del pago (en `PurchaseFormPage`)
- ✅ Se reservan con `status = 'sold'` y `sale_id`
- ✅ Si el pago falla, los boletos quedan asignados a la venta (se pueden liberar manualmente)
- ✅ Si el pago es exitoso, se confirman los boletos

### **Estados de Venta:**
- `pending`: Compra creada, pago pendiente
- `completed`: Pago confirmado, boletos asignados
- `cancelled`: Pago cancelado

### **Estados de Boletos:**
- `available`: Disponible para compra
- `reserved`: Reservado temporalmente
- `sold`: Vendido y asignado a una venta

### **Validaciones:**
- ✅ Cantidad mínima: 1 boleto
- ✅ Cantidad máxima: 100 boletos (configurable)
- ✅ Formato de WhatsApp: Ecuador (+593 o 0 seguido de 9 dígitos)
- ✅ Email: Formato válido y coincidencia con confirmación
- ✅ Boletos disponibles: Verificación antes de asignar

---

## 🚀 Implementación en Otro Proyecto

### **Pasos para Replicar el Flujo:**

1. **Crear rutas:**
   - `/purchase/:id` → Selección de cantidad
   - `/purchase/:id/form` → Formulario de datos
   - `/purchase/:saleId/payment` → Método de pago
   - `/purchase/:saleId/confirmation` → Confirmación
   - `/payment/callback` → Callback de Payphone
   - `/payment/result` → Resultado del pago

2. **Crear componentes:**
   - `TicketSelector`: Selector de cantidad
   - `PayphonePaymentBox`: Widget de Payphone
   - `TicketNumbersDisplay`: Visualización de números

3. **Crear servicios:**
   - `purchaseService.createPurchaseWithCustomer()`: Crear compra
   - `purchaseService.getPurchaseConfirmation()`: Obtener confirmación
   - `usePayment.confirmButtonPayment()`: Confirmar pago con Payphone

4. **Configurar base de datos:**
   - Tablas: `customers`, `sales`, `tickets`, `payments`
   - Función SQL: `assign_tickets_atomic()`
   - Políticas RLS (Row Level Security)

5. **Integrar Payphone:**
   - Configurar Store ID
   - Integrar widget de Payphone
   - Configurar callback URL

6. **Configurar notificaciones:**
   - Edge Function para correos
   - Integración con WhatsApp (opcional)

---

## 📝 Notas Adicionales

- ⚠️ El sistema permite comprar sin autenticación (guest checkout)
- ⚠️ Los boletos se asignan antes del pago (reserva)
- ⚠️ Si el pago falla, los boletos quedan asignados (requiere limpieza manual)
- ✅ Validación en tiempo real en el formulario
- ✅ Stepper visual para mostrar progreso
- ✅ Diseño 100% responsive
- ✅ Soporte para dark mode

---

## 🔗 Archivos Clave

### **Frontend (React/Next.js):**
- `app/sorteos/[id]/page.tsx` - Detalle del sorteo
- `app/comprar/[id]/page.tsx` - Página de compra (Next.js, en desarrollo)
- `rifa/src/pages/PurchasePage.tsx` - Selección de cantidad
- `rifa/src/pages/PurchaseFormPage.tsx` - Formulario de datos
- `rifa/src/pages/PurchasePaymentPage.tsx` - Método de pago
- `rifa/src/pages/PurchaseConfirmationPage.tsx` - Confirmación
- `rifa/src/pages/PaymentCallbackPage.tsx` - Callback de Payphone
- `rifa/src/features/purchase/services/purchaseService.ts` - Servicio de compra
- `rifa/src/features/payment/components/PayphonePaymentBox.tsx` - Widget de Payphone

### **Backend (Supabase):**
- Función SQL: `assign_tickets_atomic()`
- Edge Function: `send-purchase-email`
- Edge Function: `confirm-payphone-button`

---

**Última actualización:** 2024  
**Versión del documento:** 1.0





