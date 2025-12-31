# 🔧 Configurar Payphone para Producción

## 📍 URL de tu Aplicación en Producción

**URL de Producción**: `https://rifas-ecuador-ians.vercel.app`

## 🎯 Pasos para Configurar en el Panel de Payphone

### 1. Acceder al Panel de Payphone

1. Ve a: https://appdeveloper.payphonetodoesposible.com
2. Inicia sesión con tus credenciales
3. Selecciona tu aplicación: **rifasECUADOR**

### 2. Ir a la Sección "Detalles"

1. En el panel, haz clic en la pestaña **"Detalles"**
2. Verás la configuración actual de tu aplicación

### 3. Actualizar la Configuración

Debes cambiar los siguientes campos:

#### ❌ Configuración Actual (Local/Desarrollo):
```
Dominio web: http://localhost:3000/
Url de respuesta: http://localhost:3000/api/payment/payphone/callback
```

#### ✅ Configuración Correcta (Producción):
```
Dominio web: https://rifas-ecuador-ians.vercel.app
Url de respuesta: https://rifas-ecuador-ians.vercel.app/api/payment/payphone/callback
```

### 4. Pasos Detallados

1. **Busca el campo "Dominio web"**
   - Actualmente dice: `http://localhost:3000/`
   - Cámbialo a: `https://rifas-ecuador-ians.vercel.app`
   - ⚠️ Asegúrate de incluir `https://` (no `http://`)

2. **Busca el campo "Url de respuesta"**
   - Actualmente dice: `http://localhost:3000/api/payment/payphone/callback`
   - Cámbialo a: `https://rifas-ecuador-ians.vercel.app/api/payment/payphone/callback`
   - ⚠️ Asegúrate de incluir `https://` (no `http://`)

3. **Verifica otros campos:**
   - **Tipo de Aplicación**: Debe ser `Web` ✅
   - **Ambiente**: Debe estar en **"Producción"** (no "Prueba") ✅

4. **Guarda los cambios**
   - Busca el botón "Guardar" o "Actualizar"
   - Confirma que los cambios se guardaron correctamente

### 5. Verificar las Credenciales

En la pestaña **"Credenciales"**, verifica que tengas:

- **Identificador**: `mdpfeLbkkqmtYSOXROWDg`
- **Id Cliente**: `TnfWR8gqiEWwElZ6nI0nUg`
- **Clave secreta**: `qPL6DFTIgEGS93LJAbiryA`
- **Contraseña de codificación**: `97293ec026b9438a91068e7bbd38b0c7`

### 6. Obtener el Token de Producción

1. En el panel, busca el **Token** para tu Store ID
2. Debe aparecer como: `Token para 0605844828001:` (o tu Store ID)
3. Copia el token completo (es muy largo, >200 caracteres)
4. Este token debe estar configurado en Vercel como `NEXT_PUBLIC_PAYPHONE_TOKEN`

## ✅ Checklist de Verificación

Después de actualizar, verifica:

- [ ] **Dominio web** = `https://rifas-ecuador-ians.vercel.app`
- [ ] **Url de respuesta** = `https://rifas-ecuador-ians.vercel.app/api/payment/payphone/callback`
- [ ] **Tipo de Aplicación** = `Web`
- [ ] **Ambiente** = `Producción` (no "Prueba")
- [ ] Token de producción copiado y configurado en Vercel
- [ ] Store ID correcto configurado en Vercel
- [ ] Variables de entorno actualizadas en Vercel
- [ ] Aplicación redesplegada en Vercel después de cambios

## 🔄 Variables de Entorno en Vercel

Asegúrate de que en Vercel (Settings → Environment Variables) tengas:

```env
NEXT_PUBLIC_PAYPHONE_TOKEN=tu_token_de_produccion_completo
NEXT_PUBLIC_PAYPHONE_STORE_ID=0605844828001
NEXT_PUBLIC_PAYPHONE_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://rifas-ecuador-ians.vercel.app
```

## ⚠️ Importante

1. **NO uses `http://localhost:3000`** en producción
2. **Siempre usa `https://`** (no `http://`) en producción
3. **Redesplegar** en Vercel después de cambiar variables de entorno
4. **Esperar 2-5 minutos** después de redesplegar antes de probar

## 🧪 Probar la Configuración

Después de actualizar:

1. Ve a: https://rifas-ecuador-ians.vercel.app
2. Intenta realizar una compra de prueba
3. Verifica que el pago se procese correctamente
4. Revisa los logs en Vercel si hay errores

## 📞 Si Tienes Problemas

Si después de actualizar sigues teniendo problemas:

1. Verifica que el token sea de **Producción** (no de Pruebas)
2. Verifica que el Store ID sea correcto
3. Revisa los logs en Vercel para ver errores específicos
4. Contacta a soporte de Payphone si el error persiste

---

**Última actualización**: Enero 2025
