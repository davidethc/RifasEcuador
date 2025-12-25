# 📧 Resumen: Sistema de Envío de Correos

## ✅ ¿Qué se implementó?

He creado un sistema completo de envío de correos que funciona automáticamente cuando un cliente completa su pago.

---

## 🎯 ¿A quién se envían los correos?

### 1. **Al Cliente** (el email que llenó en el formulario)
- ✅ Confirmación de que su pago fue acreditado
- ✅ Números de boletos asignados (ej: "034" o "034-039")
- ✅ Detalles de la compra (sorteo, monto, cantidad de boletos)
- ✅ ID de transacción para referencia

### 2. **Al Administrador** (davidecondet@gmail.com)
- ✅ Notificación de nueva compra
- ✅ Información del cliente (nombre y email)
- ✅ Números de boletos vendidos
- ✅ Detalles de la transacción

### 3. **PayPal** (automático)
- ℹ️ **No necesitas configurar nada** - Payphone envía automáticamente los correos de confirmación de PayPal cuando se procesa el pago

---

## 🔄 ¿Cuándo se envían los correos?

Los correos se envían automáticamente cuando:

1. ✅ El pago se confirma como "Approved" en Payphone
2. ✅ Los boletos se asignan correctamente
3. ✅ El sistema actualiza `payment_status = 'completed'`

**Flujo completo:**
```
Cliente completa pago → Payphone confirma → Boletos asignados → Correos enviados
```

---

## 📁 Archivos Creados/Modificados

### 1. **Edge Function** (Nueva)
📄 `supabase/functions/send-purchase-email/index.ts`
- Función que envía los correos
- Genera los templates HTML de los correos
- Registra en la tabla `notifications`
- Actualiza `email_sent` en la tabla `sales`

### 2. **PaymentCallbackPage** (Modificado)
📄 `src/pages/PaymentCallbackPage.tsx`
- Ahora llama a la función de correos después de asignar boletos
- Obtiene toda la información necesaria (cliente, sorteo, boletos)
- No bloquea el flujo si falla el envío de correos

### 3. **Documentación** (Nueva)
📄 `CONFIGURACION_ENVIO_CORREOS.md`
- Guía completa de configuración
- Instrucciones para Resend (gratis)
- Instrucciones para SMTP
- Troubleshooting

---

## 🚀 Cómo Configurarlo (Paso a Paso)

### Opción Recomendada: Resend (GRATIS hasta 3,000 correos/mes)

1. **Crear cuenta en Resend:**
   - Ve a https://resend.com
   - Crea cuenta gratuita
   - Verifica tu email

2. **Obtener API Key:**
   - En Resend Dashboard > API Keys
   - Crea nuevo API Key
   - Copia el key (empieza con `re_...`)

3. **Configurar en Supabase:**
   - Ve a Supabase > Settings > Edge Functions > Secrets
   - Agrega nuevo secreto:
     - **Name:** `RESEND_API_KEY`
     - **Value:** Tu API key de Resend

4. **Desplegar la Edge Function:**
   ```bash
   # Desde la carpeta del proyecto
   supabase functions deploy send-purchase-email
   ```

5. **¡Listo!** Los correos se enviarán automáticamente.

---

## 🧪 Cómo Probar

1. **Realiza una compra de prueba:**
   - Completa el formulario con tu email
   - Realiza el pago
   - Completa la transacción

2. **Verifica los correos:**
   - Revisa tu bandeja de entrada (y spam)
   - Deberías recibir el correo de confirmación
   - El administrador (davidecondet@gmail.com) también debería recibir notificación

3. **Verifica en la base de datos:**
   ```sql
   -- Ver notificaciones enviadas
   SELECT * FROM notifications 
   WHERE sale_id = 'TU_SALE_ID'
   ORDER BY created_at DESC;
   
   -- Verificar que email_sent = TRUE
   SELECT email_sent FROM sales WHERE id = 'TU_SALE_ID';
   ```

---

## 📊 ¿Cómo Saber si Llegaron los Correos?

### 1. Revisar la tabla `notifications`

Esta tabla registra TODOS los intentos de envío:

```sql
SELECT 
  recipient,
  subject,
  status,
  sent_at,
  created_at
FROM notifications
WHERE sale_id = 'TU_SALE_ID'
ORDER BY created_at DESC;
```

**Deberías ver:**
- 2 registros (cliente y administrador)
- `status` = `'sent'` si se envió correctamente
- `sent_at` con la fecha de envío

### 2. Revisar la tabla `sales`

```sql
SELECT email_sent FROM sales WHERE id = 'TU_SALE_ID';
```

**Debería ser:** `TRUE` si el correo se envió al cliente.

### 3. Revisar logs de Supabase

1. Ve a **Logs** > **Edge Functions**
2. Busca `send-purchase-email`
3. Revisa los logs para ver si hay errores

---

## ⚠️ Problemas Comunes y Soluciones

### ❌ Los correos no llegan

**Solución:**
1. Verifica que `RESEND_API_KEY` esté configurado en Supabase Secrets
2. Revisa la carpeta de spam
3. Revisa los logs de la Edge Function en Supabase

### ❌ Error: "Invalid API key"

**Solución:**
- Verifica que copiaste correctamente el API key
- Asegúrate de que el secreto se llame exactamente `RESEND_API_KEY`

### ❌ Los correos llegan pero están vacíos

**Solución:**
- Verifica que todos los datos se estén pasando correctamente
- Revisa los logs de la Edge Function

---

## 📝 Información Importante

### Sobre PayPal

**No necesitas configurar nada para PayPal.** Payphone envía automáticamente los correos de confirmación de PayPal cuando se procesa el pago. Tu sistema solo necesita:

1. ✅ Enviar correo al cliente con los números de boletos
2. ✅ Enviar correo al administrador con la notificación

### Sobre el Correo del Administrador

El correo del administrador está configurado como:
- **Por defecto:** `davidecondet@gmail.com`
- **Puedes cambiarlo:** Agregando la variable `ADMIN_EMAIL` en Supabase Secrets

### Límites de Resend

- **Plan gratuito:** 3,000 correos/mes
- **Plan Pro:** $20/mes para 50,000 correos

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en Resend (https://resend.com)
- [ ] API Key obtenida de Resend
- [ ] `RESEND_API_KEY` configurado en Supabase Secrets
- [ ] Edge Function desplegada (`supabase functions deploy send-purchase-email`)
- [ ] Prueba de compra realizada
- [ ] Correos llegando al cliente
- [ ] Correos llegando al administrador (davidecondet@gmail.com)
- [ ] Tabla `notifications` registrando los envíos
- [ ] Campo `email_sent` en `sales` actualizándose a `TRUE`

---

## 🎉 Resultado Final

Cuando un cliente complete su pago:

1. ✅ Recibirá un correo bonito con sus números de boletos
2. ✅ Tú recibirás una notificación en davidecondet@gmail.com
3. ✅ Todo quedará registrado en la base de datos
4. ✅ El sistema funcionará automáticamente sin intervención manual

---

**¿Necesitas ayuda?** Revisa `CONFIGURACION_ENVIO_CORREOS.md` para más detalles.

