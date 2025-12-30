# 🔍 Payphone: Diferencias entre Local y Producción

## El Problema

El error **401 Unauthorized con código 127** aparece en producción pero funciona en local. Esto es común y tiene causas específicas.

## 🔑 Diferencia Principal: Credenciales

### En Local (Desarrollo)
- Usas credenciales de **SANDBOX/PRUEBAS**
- El ambiente es más permisivo
- Las validaciones son menos estrictas

### En Producción
- Debes usar credenciales de **PRODUCCIÓN**
- Validaciones más estrictas
- Control antifraude activo
- Requiere configuración exacta

## ⚠️ Error 127: Posibles Causas

Según la documentación de Payphone, el error 127 puede ser por:

1. **Credenciales incorrectas** (más común)
2. **Control antifraude** (si los datos parecen sospechosos)
3. **Configuración incorrecta** del dominio o URLs

## 🛠️ Solución Paso a Paso

### 1. Verificar Credenciales en el Panel de Payphone

En tu panel de Payphone (https://appdeveloper.payphonetodoesposible.com):

#### A. Verificar el Ambiente
- El toggle debe estar en **"Producción"** (no "Prueba")
- Si está en "Prueba", cambia a "Producción"

#### B. Obtener las Credenciales Correctas

Para la **Cajita de Pagos** en producción, necesitas:

**Opción 1: Usar Token y Store ID** (Recomendado)
- **Token**: El token largo que aparece como "Token para 0605844828001:"
- **Store ID**: El número después de "Token para" (ej: `0605844828001`)

**Opción 2: Usar Id Cliente y Clave Secreta** (Alternativa)
Si el Token no funciona, Payphone puede requerir:
- **Id Cliente**: `TnfWR8gqiEWwElZ6nI0nUg` (del panel)
- **Clave secreta**: `qPL6DFTIgEGS93LJAbiryA` (del panel)

### 2. Actualizar Variables en Vercel

#### Si usas Token + Store ID:

```env
NEXT_PUBLIC_PAYPHONE_TOKEN=el_token_largo_completo
NEXT_PUBLIC_PAYPHONE_STORE_ID=0605844828001
NEXT_PUBLIC_PAYPHONE_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://rifas-ecuador-ians.vercel.app
```

#### Si necesitas usar Id Cliente + Clave Secreta:

Puede que necesites modificar el código para usar estas credenciales en lugar de Token + Store ID. Esto requiere cambios en `PayphonePaymentBox.tsx`.

### 3. Verificar Configuración en el Panel de Payphone

En el panel, verifica que:

- ✅ **Dominio web**: `https://rifas-ecuador-ians.vercel.app`
- ✅ **Url de respuesta**: `https://rifas-ecuador-ians.vercel.app/api/payment/payphone/callback`
- ✅ **Tipo de Aplicación**: `Web`
- ✅ **Ambiente**: `Producción`

### 4. Verificar que No Estés Usando Credenciales de Sandbox

**Síntoma común:**
- Funciona en local (usa sandbox)
- No funciona en producción (necesita producción)

**Solución:**
1. En Vercel, verifica que `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT=production`
2. Verifica que el token sea de **Producción**, no de Pruebas
3. En el panel de Payphone, asegúrate de estar en modo **Producción** al copiar el token

### 5. Redesplegar Después de Cambios

**CRÍTICO**: Después de actualizar variables:
1. Redesplegar en Vercel
2. Esperar 2-5 minutos
3. Probar de nuevo

## 🔍 Verificación en el Código

El componente `PayphonePaymentBox.tsx` usa:

```typescript
token: process.env.NEXT_PUBLIC_PAYPHONE_TOKEN,
storeId: process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID,
```

**Verifica que:**
- El token sea el completo (muy largo, >200 caracteres)
- El Store ID sea el número correcto
- Ambos sean de **Producción**, no de Sandbox

## 🐛 Si el Error 127 Persiste

### Posible Causa: Control Antifraude

El error 127 también puede indicar que Payphone detectó algo sospechoso:

1. **Datos de prueba**: Si estás usando datos falsos o de prueba
2. **IP bloqueada**: Tu IP puede estar en lista negra
3. **Patrón sospechoso**: Múltiples intentos fallidos

### Solución:

1. **Usa datos reales** para pruebas en producción
2. **Contacta a soporte de Payphone**:
   - Explica que recibes error 127
   - Menciona que funciona en local pero no en producción
   - Proporciona el `orderNumber` de la transacción fallida
   - Pregunta si necesitas usar "Id Cliente" en lugar de Token

## 📋 Checklist de Verificación

- [ ] Panel de Payphone en modo **Producción** (no Prueba)
- [ ] Token copiado de ambiente **Producción**
- [ ] Store ID correcto (`0605844828001` o el que aparezca)
- [ ] Variables actualizadas en Vercel
- [ ] `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT=production`
- [ ] Dominio correcto en panel de Payphone
- [ ] URL de respuesta correcta
- [ ] Aplicación **redesplegada** después de cambios
- [ ] Probando con datos reales (no de prueba)

## 🔄 Alternativa: Usar Id Cliente y Clave Secreta

Si el Token + Store ID no funciona, puede que Payphone requiera usar:

- **Id Cliente**: `TnfWR8gqiEWwElZ6nI0nUg`
- **Clave secreta**: `qPL6DFTIgEGS93LJAbiryA`

Esto requeriría modificar `PayphonePaymentBox.tsx` para usar estas credenciales. **Contacta primero a soporte de Payphone** para confirmar qué credenciales debes usar para la Cajita de Pagos en producción.

## 📞 Información para Soporte de Payphone

Si necesitas contactar soporte, proporciona:

- **Aplicación**: rifasECUADOR
- **Ambiente**: Producción
- **Error**: 401 Unauthorized, código 127
- **Síntoma**: Funciona en local (sandbox) pero no en producción
- **Dominio**: https://rifas-ecuador-ians.vercel.app
- **Pregunta**: ¿Debo usar Token + Store ID o Id Cliente + Clave Secreta para la Cajita de Pagos en producción?

## 💡 Resumen

**La diferencia principal entre local y producción:**

1. **Local**: Usa credenciales de SANDBOX (más permisivo)
2. **Producción**: Requiere credenciales de PRODUCCIÓN (más estricto)

**Solución más probable:**
- Verifica que estés usando el token de **Producción** (no de Pruebas)
- Asegúrate de que el Store ID sea correcto
- Verifica que el ambiente esté configurado como `production`
- Redesplegar después de cambios

---

**Última actualización**: Diciembre 2024




