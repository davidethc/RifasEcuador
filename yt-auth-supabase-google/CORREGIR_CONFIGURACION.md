# 🔧 Correcciones Necesarias en la Configuración de Payphone

## ⚠️ Problemas Detectados

### 1. Número de Teléfono con Formato Incorrecto ✅ CORREGIDO

**Problema:**
```json
"phoneNumber": "+593(939)039-191"  // ❌ Formato incorrecto
```

**Solución:**
```json
"phoneNumber": "+593939039191"  // ✅ Formato correcto (sin paréntesis ni guiones)
```

**Código corregido:** El número ahora se limpia automáticamente removiendo espacios, paréntesis y guiones.

### 2. Store ID Puede Ser Incorrecto ⚠️ VERIFICAR

**Problema:**
En la configuración que envías aparece:
```json
"storeId": "a0d7963a-751f-4540-824a-8d1339dd3d16"  // UUID
```

**Pero en el panel de Payphone debería ser:**
```
Store ID: 0605844828001  // Número (no UUID)
```

## 🛠️ Solución: Verificar Store ID en Vercel

### Paso 1: Verificar en el Panel de Payphone

1. Ve a https://appdeveloper.payphonetodoesposible.com
2. Selecciona tu aplicación "rifasECUADOR"
3. Ve a "Credenciales"
4. Busca el número que aparece después de "Token para [NÚMERO]:"
5. Ese número es tu Store ID (ejemplo: `0605844828001`)

### Paso 2: Actualizar en Vercel

1. Ve a Vercel → Settings → Environment Variables
2. Haz clic en `NEXT_PUBLIC_PAYPHONE_STORE_ID`
3. Verifica que el valor sea el **número** del panel (ej: `0605844828001`)
4. **NO debe ser un UUID** como `a0d7963a-751f-4540-824a-8d1339dd3d16`
5. Si es incorrecto, actualízalo con el número correcto
6. Guarda y **redesplegar**

## 📋 Verificación de la Configuración Correcta

Después de corregir, la configuración debería verse así:

```json
{
  "token": "tu_token_largo_de_produccion...",
  "storeId": "0605844828001",  // ← Número, no UUID
  "phoneNumber": "+593939039191",  // ← Sin paréntesis ni guiones
  "email": "davidecondet@gmail.com",
  "documentId": "0706567344001",
  "amount": 100,
  "currency": "USD",
  "responseUrl": "https://rifas-ecuador-ians.vercel.app/payment/payphone/callback"
}
```

## ✅ Cambios Aplicados

1. ✅ **Número de teléfono**: Ahora se limpia automáticamente
   - Remueve espacios, paréntesis, guiones
   - Formato final: `+593939039191`

## 🔄 Próximos Pasos

1. **Verificar Store ID** en Vercel
2. **Actualizar** si es necesario (debe ser número, no UUID)
3. **Redesplegar** la aplicación
4. **Probar** de nuevo el pago

## 🐛 Si el Error Persiste

Si después de corregir el Store ID el error 401 persiste:

1. **Verifica el Token**:
   - Debe ser el token de **Producción** (no Sandbox)
   - Debe ser muy largo (>200 caracteres)
   - Sin espacios al inicio/final

2. **Contacta a Soporte de Payphone**:
   - Menciona que recibes error 401 código 127
   - Proporciona el `orderNumber` de la transacción
   - Pregunta si el Store ID debe ser el número o el UUID

---

**Última actualización**: Diciembre 2024




