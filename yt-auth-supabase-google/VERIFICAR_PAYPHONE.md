# ✅ Verificación de Configuración de Payphone

## 🔍 Pasos para Verificar que Payphone Funciona

### 1. **Redesplegar la Aplicación** ⚠️ IMPORTANTE

Después de agregar las variables de entorno en Vercel, **DEBES redesplegar** para que los cambios surtan efecto:

1. En Vercel, ve a la notificación que dice "Added Environment Variable successfully"
2. Haz clic en el botón **"Redeploy"**
3. O ve a **Deployments** → selecciona el último deployment → **"Redeploy"**

**Sin redesplegar, las nuevas variables NO estarán disponibles.**

---

### 2. **Verificar Variables en el Código**

Una vez redesplegado, puedes verificar que las variables se están leyendo correctamente:

#### Opción A: Revisar Logs de Build
1. En Vercel, ve a **Deployments**
2. Abre el último deployment
3. Haz clic en **"Build Logs"**
4. Busca mensajes relacionados con Payphone

#### Opción B: Agregar Log Temporal (Solo para verificación)

Puedes agregar temporalmente un log en el código para verificar:

```typescript
// En app/api/payment/payphone/create/route.ts (línea ~35)
console.log('🔑 Variables Payphone:', {
  hasToken: !!process.env.NEXT_PUBLIC_PAYPHONE_TOKEN,
  hasStoreId: !!process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID,
  environment: process.env.NEXT_PUBLIC_PAYPHONE_ENVIRONMENT,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
});
```

**⚠️ IMPORTANTE**: Elimina estos logs después de verificar, no deben quedar en producción.

---

### 3. **Probar en Producción**

#### Paso 1: Verificar que la Cajita de Pagos se Carga

1. Ve a tu sitio en producción: `https://rifas-ecuador-ians.vercel.app`
2. Navega a la página de compra de un sorteo
3. Selecciona "Pagar con PayPhone"
4. **Verifica que**:
   - La Cajita de Pagos se carga (no muestra error)
   - Aparece el formulario de pago de Payphone
   - Puedes ver los campos de tarjeta o la opción de pagar con app Payphone

#### Paso 2: Hacer una Compra de Prueba

**⚠️ IMPORTANTE**: Si estás en producción, usa un monto MUY PEQUEÑO para pruebas.

1. Completa el formulario de compra
2. Selecciona "Pagar con PayPhone"
3. Usa una tarjeta de prueba o la app Payphone
4. Completa el pago

#### Paso 3: Verificar el Callback

Después del pago, deberías ser redirigido a:
- `https://rifas-ecuador-ians.vercel.app/payment/payphone/callback`

**Verifica que**:
- La página carga correctamente
- Muestra confirmación de pago exitoso
- Los boletos se registran en la base de datos

---

### 4. **Revisar Logs en Tiempo Real**

#### En Vercel:

1. Ve a tu proyecto en Vercel
2. Navega a **Logs** en el menú superior
3. Selecciona **Runtime Logs**
4. Filtra por "payphone" o "payment"

**Logs que deberías ver si todo funciona**:

```
✅ 🔄 Enviando solicitud a Payphone API Sale...
✅ ✅ Pago creado exitosamente: { transactionId: ... }
✅ ✅ Respuesta de confirmación de Payphone: { ... }
```

**Logs de error a revisar**:

```
❌ Configuración de Payphone incompleta
❌ Error HTTP de Payphone: 401
❌ Token de Payphone no configurado
```

---

### 5. **Verificar en el Panel de Payphone**

1. Inicia sesión en tu panel de Payphone: https://appdeveloper.payphonetodoesposible.com
2. Ve a la sección de **Transacciones** o **Ventas**
3. Verifica que las transacciones de prueba aparezcan allí
4. Revisa el estado de cada transacción

---

### 6. **Checklist de Verificación**

Marca cada punto cuando lo verifiques:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Aplicación redesplegada después de agregar variables
- [ ] `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT=production` (no "sandbox")
- [ ] `NEXT_PUBLIC_APP_URL` apunta a tu dominio real
- [ ] La Cajita de Pagos se carga sin errores
- [ ] Puedes iniciar un pago de prueba
- [ ] El callback funciona correctamente
- [ ] Los logs muestran transacciones exitosas
- [ ] Las transacciones aparecen en el panel de Payphone

---

### 7. **Errores Comunes y Soluciones**

#### Error: "Configuración de Payphone incompleta"

**Causa**: Faltan variables o no se redesplegó

**Solución**:
- Verifica que las 4 variables estén configuradas
- Asegúrate de haber redesplegado después de agregarlas
- Verifica que los nombres sean exactos (case-sensitive)

#### Error: "401 Unauthorized" o "Token inválido"

**Causa**: Token incorrecto o de ambiente equivocado

**Solución**:
- Verifica que estés usando el token de **PRODUCCIÓN** (no sandbox)
- Confirma que el token esté completo (sin espacios al inicio/final)
- Verifica en el panel de Payphone que el token sea válido

#### La Cajita de Pagos no se carga

**Causa**: Token/Store ID incorrectos o dominio no permitido

**Solución**:
- Verifica las credenciales en el panel de Payphone
- Confirma que tu dominio esté en la lista de dominios permitidos
- Revisa la consola del navegador (F12) para errores específicos

#### Callback no funciona

**Causa**: URL incorrecta o no accesible

**Solución**:
- Verifica que `NEXT_PUBLIC_APP_URL` sea `https://rifas-ecuador-ians.vercel.app`
- Confirma que la ruta `/api/payment/payphone/callback` esté funcionando
- Verifica que la URL coincida con la configurada en Payphone

---

### 8. **Prueba Rápida con cURL (Opcional)**

Puedes probar directamente la API desde la terminal:

```bash
curl -X POST https://rifas-ecuador-ians.vercel.app/api/payment/payphone/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-123",
    "phoneNumber": "0999999999",
    "countryCode": "593",
    "amount": 1.00,
    "customerData": {
      "name": "Test",
      "lastName": "User",
      "email": "test@example.com"
    },
    "raffleTitle": "Test Raffle"
  }'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "transactionId": 12345,
  "clientTransactionId": "order-test-123-...",
  "message": "Solicitud de pago enviada..."
}
```

---

## 🎯 Resultado Esperado

Si todo está configurado correctamente:

1. ✅ La Cajita de Pagos se carga sin errores
2. ✅ Puedes completar pagos de prueba
3. ✅ Los callbacks funcionan correctamente
4. ✅ Las transacciones aparecen en el panel de Payphone
5. ✅ Los boletos se registran en tu base de datos
6. ✅ Los logs muestran transacciones exitosas

---

## 📞 Si Algo No Funciona

1. Revisa los **Runtime Logs** en Vercel para ver errores específicos
2. Revisa la **consola del navegador** (F12) para errores del frontend
3. Verifica que todas las variables estén correctamente configuradas
4. Confirma que el ambiente sea "production" (no "sandbox")
5. Contacta al soporte de Payphone si el problema persiste

---

**Última actualización**: Diciembre 2024





