# 🔧 Solucionar Error 401 (Unauthorized) de Payphone

## El Problema

Estás recibiendo un error **401 Unauthorized** con el código de error **127** cuando intentas procesar un pago:

```
POST https://pay.payphonetodoesposible.com/api/payment-button-box/card-payment/process 401 (Unauthorized)
{
  "message": "No fue posible completar el pago. Para más información comuníquese con Payphone.",
  "errorCode": 127
}
```

Este error significa que **Payphone no puede autenticar tu solicitud**. Generalmente se debe a credenciales incorrectas.

## 🔍 Verificaciones Necesarias

### 1. Verificar el Token Correcto

En el panel de Payphone que viste, hay un **Token largo**. Este es el token que debes usar.

**Pasos:**
1. Ve a tu panel de Payphone: https://appdeveloper.payphonetodoesposible.com
2. Selecciona tu aplicación "rifasECUADOR"
3. Ve a la sección **"Credenciales"**
4. Copia el **Token completo** (el que aparece como "Token para 0605844828001:")
5. Este token debe ir en `NEXT_PUBLIC_PAYPHONE_TOKEN` en Vercel

**⚠️ IMPORTANTE:**
- El token debe ser el **completo**, sin espacios al inicio o final
- Debe ser el token de **PRODUCCIÓN** (no de pruebas)
- El token es muy largo (más de 200 caracteres)

### 2. Verificar el Store ID

En el panel de Payphone, el Store ID aparece en el formato:
- **"Token para 0605844828001:"** ← Este número `0605844828001` es tu Store ID

**Pasos:**
1. En el panel de Payphone, busca el número que aparece después de "Token para"
2. Este número debe ir en `NEXT_PUBLIC_PAYPHONE_STORE_ID` en Vercel
3. En tu caso parece ser: `0605844828001`

### 3. Verificar en Vercel

1. Ve a Vercel → **Settings** → **Environment Variables**
2. Verifica que:
   - `NEXT_PUBLIC_PAYPHONE_TOKEN` = El token completo del panel
   - `NEXT_PUBLIC_PAYPHONE_STORE_ID` = `0605844828001` (o el que aparezca en tu panel)
   - `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT` = `production`
   - `NEXT_PUBLIC_APP_URL` = `https://rifas-ecuador-ians.vercel.app`

### 4. Verificar el Dominio en Payphone

En el panel de Payphone que viste, verifica que:
- **Dominio web**: `https://rifas-ecuador-ians.vercel.app` ✅ (ya está correcto)
- **Url de respuesta**: `https://rifas-ecuador-ians.vercel.app/api/payment/payphone/callback` ✅ (ya está correcto)

## 🛠️ Soluciones

### Solución 1: Actualizar el Token en Vercel

1. **Copia el token completo** del panel de Payphone
2. En Vercel → **Settings** → **Environment Variables**
3. Haz clic en `NEXT_PUBLIC_PAYPHONE_TOKEN`
4. **Elimina el valor actual** y pega el token nuevo (completo, sin espacios)
5. Guarda
6. Haz lo mismo con `NEXT_PUBLIC_PAYPHONE_STORE_ID` (debe ser `0605844828001`)
7. **Redesplegar** la aplicación

### Solución 2: Verificar que el Token Sea de Producción

El error 401 también puede ocurrir si:
- Estás usando un token de **sandbox/pruebas** en producción
- O viceversa

**Verifica:**
1. En el panel de Payphone, el toggle debe estar en **"Producción"** (no "Prueba")
2. El token que copias debe ser del ambiente **Producción**
3. En Vercel, `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT` debe ser `production`

### Solución 3: Verificar que No Haya Espacios

A veces el problema es que el token tiene espacios al inicio o final:

1. En Vercel, edita `NEXT_PUBLIC_PAYPHONE_TOKEN`
2. **Selecciona todo** el valor (Ctrl+A)
3. **Elimina** y pega de nuevo el token
4. Asegúrate de que no haya espacios al inicio o final
5. Guarda y redesplegar

### Solución 4: Usar las Credenciales Correctas

Según el panel de Payphone, también tienes:
- **Id Cliente**: `TnfWR8gqiEWwElZ6nI0nUg`
- **Clave secreta**: `qPL6DFTIgEGS93LJAbiryA`

**⚠️ NOTA**: Para la **Cajita de Pagos** (Payment Box), generalmente solo necesitas:
- El **Token** (el largo que aparece en "Token para...")
- El **Store ID** (el número después de "Token para")

Pero si el error persiste, verifica con Payphone si necesitas usar el "Id Cliente" en lugar del Store ID.

## 🔄 Pasos para Aplicar la Solución

1. **Copia el token completo** del panel de Payphone
2. **Copia el Store ID** (el número después de "Token para")
3. En Vercel, actualiza ambas variables
4. **Redesplegar** la aplicación
5. **Esperar** 2-5 minutos a que termine el deployment
6. **Probar** de nuevo el pago
7. Si persiste, revisar los logs en la consola del navegador

## 📋 Checklist de Verificación

- [ ] Token copiado completo del panel de Payphone (sin espacios)
- [ ] Store ID correcto (`0605844828001` o el que aparezca)
- [ ] Variables actualizadas en Vercel
- [ ] Ambiente configurado como `production`
- [ ] Aplicación redesplegada después de actualizar variables
- [ ] Dominio correcto en panel de Payphone
- [ ] URL de respuesta correcta en panel de Payphone

## 🐛 Si el Problema Persiste

### Verificar en la Consola del Navegador

1. Abre la consola (F12)
2. Busca el mensaje `🔍 Debug Payphone Variables:`
3. Verifica que:
   - `hasToken: true`
   - `tokenLength` sea mayor a 200 (el token es muy largo)
   - `storeIdValue` sea el número correcto

### Contactar Soporte de Payphone

Si después de verificar todo sigue el error 401:

1. Toma capturas de:
   - El panel de Payphone (sin mostrar credenciales completas)
   - Los logs de la consola del navegador
   - El error específico (401, errorCode 127)
2. Contacta al soporte de Payphone explicando:
   - Estás recibiendo error 401 con código 127
   - Estás usando la Cajita de Pagos
   - El dominio está configurado correctamente
   - Pregunta si necesitas usar "Id Cliente" en lugar de Store ID

## 📞 Información Útil para Soporte

- **Aplicación**: rifasECUADOR
- **Ambiente**: Producción
- **Dominio**: https://rifas-ecuador-ians.vercel.app
- **Error**: 401 Unauthorized, errorCode 127
- **Endpoint**: `/api/payment-button-box/card-payment/process`

---

**Última actualización**: Diciembre 2024

