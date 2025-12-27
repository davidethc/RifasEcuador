# 🔧 Configuración de Payphone para Producción

Esta guía te ayudará a configurar Payphone para producción en tu aplicación de rifas.

## 📋 Requisitos Previos

1. Cuenta activa en Payphone (https://payphone.app)
2. Credenciales de producción proporcionadas por Payphone
3. Acceso a las variables de entorno de tu plataforma de hosting (Vercel, Netlify, etc.)

## 🔑 Variables de Entorno Requeridas

Necesitas configurar las siguientes variables de entorno en tu plataforma de hosting:

### Variables Obligatorias

```env
# Token de autenticación de Payphone (producción)
NEXT_PUBLIC_PAYPHONE_TOKEN=tu_token_de_produccion_aqui

# Store ID de tu tienda en Payphone
NEXT_PUBLIC_PAYPHONE_STORE_ID=tu_store_id_aqui

# URL de tu aplicación en producción
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Ambiente: 'production' para producción, 'sandbox' para pruebas
NEXT_PUBLIC_PAYPHONE_ENVIRONMENT=production
```

### ⚠️ Importante sobre NEXT_PUBLIC_

Las variables que comienzan con `NEXT_PUBLIC_` son expuestas al cliente. Aunque el token se usa principalmente en el servidor, Payphone también lo necesita en el frontend para la Cajita de Pagos.

**Seguridad**: Asegúrate de que solo uses tokens de producción en producción. Nunca expongas tokens de producción en repositorios públicos.

## 📝 Pasos para Configurar

### 1. Obtener Credenciales de Payphone

1. Inicia sesión en tu panel de Payphone: https://payphone.app
2. Ve a la sección de **API** o **Integraciones**
3. Obtén las siguientes credenciales:
   - **Token de Producción**: Token de autenticación para la API
   - **Store ID**: ID de tu tienda/comercio

### 2. Configurar en Vercel (Recomendado)

1. Ve a tu proyecto en Vercel
2. Navega a **Settings** → **Environment Variables**
3. Agrega cada variable:

   ```
   NEXT_PUBLIC_PAYPHONE_TOKEN = tu_token_de_produccion
   NEXT_PUBLIC_PAYPHONE_STORE_ID = tu_store_id
   NEXT_PUBLIC_APP_URL = https://tu-dominio.com
   NEXT_PUBLIC_PAYPHONE_ENVIRONMENT = production
   ```

4. Selecciona los ambientes donde aplicar (Production, Preview, Development)
5. Haz clic en **Save**
6. **Redespliega** tu aplicación para que los cambios surtan efecto

### 3. Configurar en Netlify

1. Ve a tu sitio en Netlify
2. Navega a **Site settings** → **Environment variables**
3. Agrega las variables de la misma forma que en Vercel
4. Guarda y redespliega

### 4. Configurar en Otros Hostings

Para otros servicios (Railway, Render, etc.):
- Busca la sección de **Environment Variables** o **Config Vars**
- Agrega las 4 variables mencionadas
- Redespliega la aplicación

## ✅ Verificación de Configuración

### 1. Verificar Variables en el Código

El código verifica automáticamente que las variables estén configuradas. Si falta alguna, verás un error en los logs:

```
❌ Configuración de Payphone incompleta
```

### 2. Probar en Producción

1. Realiza una compra de prueba con un monto pequeño
2. Verifica que:
   - La Cajita de Pagos se carga correctamente
   - Puedes completar el pago
   - Recibes la confirmación
   - El callback funciona correctamente

### 3. Monitorear Logs

Revisa los logs de tu aplicación para ver:
- ✅ `🔄 Enviando solicitud a Payphone API Sale...`
- ✅ `✅ Pago creado exitosamente`
- ✅ `✅ Respuesta de confirmación de Payphone`

## 🔄 URLs de Callback

Payphone redirigirá a los usuarios a estas URLs después del pago:

- **Callback URL**: `https://tu-dominio.com/api/payment/payphone/callback`
- **Página de callback**: `https://tu-dominio.com/payment/payphone/callback`

**Importante**: Estas URLs deben estar accesibles públicamente y deben coincidir con la URL configurada en tu panel de Payphone.

## 🛡️ Seguridad

### Buenas Prácticas

1. **Nunca commits credenciales**: No subas archivos `.env` con credenciales reales al repositorio
2. **Usa diferentes tokens**: Usa tokens de sandbox para desarrollo y producción para producción
3. **Rotación de tokens**: Si sospechas que un token fue comprometido, rótalo inmediatamente
4. **HTTPS obligatorio**: Asegúrate de que tu aplicación use HTTPS en producción
5. **Monitoreo**: Revisa regularmente las transacciones en tu panel de Payphone

### Configuración de Dominio en Payphone

1. Ve a tu panel de Payphone
2. Configura los dominios permitidos para tu aplicación
3. Asegúrate de que `https://tu-dominio.com` esté en la lista de dominios permitidos

## 🐛 Solución de Problemas

### Error: "Configuración de Payphone incompleta"

**Causa**: Faltan variables de entorno

**Solución**: 
- Verifica que todas las variables estén configuradas
- Asegúrate de que los nombres sean exactos (case-sensitive)
- Redespliega la aplicación después de agregar variables

### Error: "Token inválido" o "401 Unauthorized"

**Causa**: Token incorrecto o expirado

**Solución**:
- Verifica que estés usando el token de producción correcto
- Confirma que el token no haya expirado
- Verifica que no haya espacios extra en la variable

### La Cajita de Pagos no se carga

**Causa**: Token o Store ID incorrectos, o dominio no permitido

**Solución**:
- Verifica las credenciales en el panel de Payphone
- Confirma que tu dominio esté en la lista de dominios permitidos
- Revisa la consola del navegador para errores específicos

### Callback no funciona

**Causa**: URL de callback incorrecta o no accesible

**Solución**:
- Verifica que `NEXT_PUBLIC_APP_URL` sea correcta
- Asegúrate de que la ruta `/api/payment/payphone/callback` esté funcionando
- Verifica que la URL coincida con la configurada en Payphone

## 📞 Soporte

Si tienes problemas:

1. Revisa la documentación oficial de Payphone: https://docs.payphone.app
2. Contacta al soporte de Payphone
3. Revisa los logs de tu aplicación para más detalles

## 📚 Recursos Adicionales

- [Documentación de Payphone](https://docs.payphone.app)
- [API de Payphone](https://www.docs.payphone.app/api-implementacion)
- [Cajita de Pagos](https://docs.payphone.app/cajita-de-pagos-payphone)

---

**Última actualización**: Diciembre 2024

