# 📧 Configuración de Envío de Correos

## 🎯 Resumen

El sistema envía correos automáticamente cuando:
1. ✅ Un pago se completa exitosamente
2. ✅ Los boletos se asignan correctamente

### Correos que se envían:

1. **Al Cliente** (email del formulario):
   - Confirmación de compra
   - Números de boletos asignados
   - Detalles de la transacción

2. **Al Administrador** (davidecondet@gmail.com):
   - Notificación de nueva compra
   - Información del cliente y boletos
   - Detalles de la transacción

---

## 🚀 Opción 1: Usar Resend (Recomendado - GRATIS)

Resend es gratuito hasta **3,000 correos/mes** y muy fácil de configurar.

### Paso 1: Crear cuenta en Resend

1. Ve a https://resend.com
2. Crea una cuenta gratuita
3. Verifica tu email

### Paso 2: Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Crea un nuevo API Key
3. Copia el key (empieza con `re_...`)

### Paso 3: Configurar en Supabase

1. Ve a tu proyecto en Supabase
2. Ve a **Settings** > **Edge Functions** > **Secrets**
3. Agrega el secreto:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Tu API key de Resend (ej: `re_abc123...`)

### Paso 4: Verificar dominio (Opcional pero recomendado)

Para enviar desde tu dominio (ej: `noreply@rifassantin.com`):

1. En Resend, ve a **Domains**
2. Agrega tu dominio
3. Configura los registros DNS que te indique
4. Espera la verificación (puede tardar unos minutos)

**Nota:** Si no verificas un dominio, puedes usar el dominio de prueba de Resend, pero los correos pueden ir a spam.

### Paso 5: Actualizar el remitente en el código

En `supabase/functions/send-purchase-email/index.ts`, línea ~150, cambia:

```typescript
from: 'RIFASSANTIN <noreply@rifassantin.com>',
```

Por tu dominio verificado o usa:
```typescript
from: 'RIFASSANTIN <onboarding@resend.dev>', // Dominio de prueba
```

---

## 🔧 Opción 2: Usar SMTP de Supabase

Si prefieres usar SMTP directamente:

### Paso 1: Configurar SMTP en Supabase

1. Ve a tu proyecto en Supabase
2. Ve a **Settings** > **Auth** > **SMTP Settings**
3. Configura tu servidor SMTP:
   - **Host:** smtp.gmail.com (para Gmail)
   - **Port:** 587
   - **Username:** Tu email
   - **Password:** Contraseña de aplicación (no tu contraseña normal)
   - **Sender email:** Tu email

### Paso 2: Para Gmail

1. Ve a tu cuenta de Google
2. **Seguridad** > **Verificación en 2 pasos** (debe estar activada)
3. **Contraseñas de aplicaciones**
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en Supabase SMTP

### Paso 3: Actualizar la Edge Function

La función ya está preparada para usar SMTP si configuras las variables de entorno correctas.

---

## 🧪 Probar el Envío de Correos

### Opción A: Probar manualmente

1. Realiza una compra de prueba
2. Completa el pago
3. Verifica que lleguen los correos

### Opción B: Probar la Edge Function directamente

```bash
# Desde tu terminal
curl -X POST https://TU_PROYECTO.supabase.co/functions/v1/send-purchase-email \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "saleId": "uuid-de-venta",
    "customerEmail": "cliente@ejemplo.com",
    "customerName": "Juan Pérez",
    "raffleTitle": "Sorteo de Prueba",
    "ticketNumbers": "034",
    "totalAmount": 1.00,
    "quantity": 1,
    "paymentId": "sale-xxx-123"
  }'
```

---

## 📋 Verificar que los Correos se Envían

### 1. Revisar la tabla `notifications`

```sql
SELECT * FROM notifications 
WHERE sale_id = 'TU_SALE_ID'
ORDER BY created_at DESC;
```

Deberías ver:
- 2 registros (cliente y administrador)
- `status` = `'sent'` si se envió correctamente
- `sent_at` con la fecha de envío

### 2. Revisar la tabla `sales`

```sql
SELECT email_sent FROM sales WHERE id = 'TU_SALE_ID';
```

Debería ser `TRUE` si el correo se envió.

### 3. Revisar logs de Supabase

1. Ve a **Logs** > **Edge Functions**
2. Busca `send-purchase-email`
3. Revisa los logs para ver si hay errores

---

## ⚠️ Problemas Comunes

### Los correos no llegan

1. **Verifica que RESEND_API_KEY esté configurado:**
   - Ve a Supabase > Settings > Edge Functions > Secrets
   - Debe existir `RESEND_API_KEY`

2. **Revisa la carpeta de spam:**
   - Los correos pueden ir a spam si no verificaste el dominio

3. **Revisa los logs:**
   - Ve a Supabase > Logs > Edge Functions
   - Busca errores en `send-purchase-email`

### Error: "Invalid API key"

- Verifica que copiaste correctamente el API key de Resend
- Asegúrate de que el secreto en Supabase se llama exactamente `RESEND_API_KEY`

### Los correos llegan pero están vacíos

- Verifica que todos los datos se estén pasando correctamente
- Revisa los logs de la Edge Function

---

## 📝 Notas Importantes

1. **Límite de Resend gratuito:** 3,000 correos/mes
2. **PayPal:** Los correos de PayPal los envía Payphone automáticamente, no necesitas configurarlos
3. **Correo del administrador:** Se envía a `davidecondet@gmail.com` (configurado en la Edge Function)
4. **Registro de notificaciones:** Todos los intentos de envío se registran en la tabla `notifications`

---

## 🔄 Actualizar Correo del Administrador

Para cambiar el correo del administrador:

1. Ve a Supabase > Settings > Edge Functions > Secrets
2. Agrega o actualiza:
   - **Name:** `ADMIN_EMAIL`
   - **Value:** `tu-nuevo-email@gmail.com`

O edita directamente en `supabase/functions/send-purchase-email/index.ts` línea ~25:

```typescript
const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'davidecondet@gmail.com';
```

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en Resend
- [ ] API Key obtenida
- [ ] `RESEND_API_KEY` configurado en Supabase Secrets
- [ ] Dominio verificado (opcional pero recomendado)
- [ ] Remitente actualizado en el código
- [ ] Prueba de envío realizada
- [ ] Correos llegando correctamente
- [ ] Tabla `notifications` registrando los envíos

---

**¿Necesitas ayuda?** Revisa los logs en Supabase o contacta con soporte.

