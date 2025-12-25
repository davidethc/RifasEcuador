# 🔧 Solución Error: "La tienda asociada no existe" (Error 100)

## 🚨 Error Actual

```json
{
  "message": "La tienda asociada no existe. Verifique su store id o comuníquese con Payphone",
  "errorCode": 100
}
```

**Causa:** El Store ID configurado en `.env` no existe en tu cuenta de Payphone Developer, o no está asociado al token que estás usando.

---

## ✅ Solución Rápida: Hacer Store ID Opcional

**Ya está implementado:** El código ahora permite que el Store ID sea opcional. Si no tienes un Store ID válido, simplemente no lo configures.

### Opción 1: Remover Store ID (Recomendado si no lo necesitas)

1. Abre tu archivo `.env`
2. Comenta o elimina la línea de `VITE_PAYPHONE_BOX_STORE_ID`:

```env
# Payphone - Cajita de Pagos
VITE_PAYPHONE_BOX_TOKEN=tu_token_aqui
# VITE_PAYPHONE_BOX_STORE_ID=6j4JtBnHrkqKrdRvZth09A  # Comentado - no es necesario
```

3. Reinicia el servidor: `npm run dev`
4. Recarga la página

**El botón de Payphone funcionará sin Store ID.**

---

## ✅ Opción 2: Obtener el Store ID Correcto

Si necesitas usar un Store ID (por ejemplo, si tienes múltiples sucursales), sigue estos pasos:

### PASO 1: Acceder a Payphone Developer

1. Ve a: https://developer.payphonetodoesposible.com/
2. Inicia sesión con tu cuenta

### PASO 2: Verificar Store ID

1. Ve a tu proyecto/comercio
2. Busca la sección **"Sucursales"** o **"Stores"**
3. Verifica que exista una sucursal con el ID: `6j4JtBnHrkqKrdRvZth09A`

### PASO 3: Si el Store ID no existe

**Opción A: Crear una nueva sucursal**
1. En Payphone Developer, ve a **Sucursales** o **Stores**
2. Click en **Crear nueva sucursal**
3. Completa los datos
4. Copia el nuevo Store ID que se genera

**Opción B: Usar el Store ID por defecto**
1. Si no tienes sucursales configuradas, Payphone puede usar un Store ID por defecto
2. Contacta con soporte de Payphone para obtenerlo
3. O simplemente no uses Store ID (es opcional)

### PASO 4: Actualizar .env

Si obtuviste un Store ID válido:

```env
VITE_PAYPHONE_BOX_TOKEN=tu_token_aqui
VITE_PAYPHONE_BOX_STORE_ID=TU_STORE_ID_CORRECTO_AQUI
```

---

## 🔍 Verificar Store ID en Payphone Developer

### Cómo encontrar tu Store ID:

1. **Dashboard de Payphone Developer**
   - Ve a: https://developer.payphonetodoesposible.com/
   - Inicia sesión
   - Ve a tu proyecto/comercio
   - Busca la sección **"Sucursales"** o **"Stores"**

2. **En la configuración del proyecto**
   - Algunas veces el Store ID aparece en la configuración general
   - Busca campos como "Identificador de Sucursal" o "Store Identifier"

3. **Contactar soporte**
   - Si no encuentras el Store ID, contacta con soporte de Payphone
   - Ellos te pueden decir si necesitas uno o si puedes trabajar sin él

---

## 📋 Checklist

- [ ] Store ID es ahora opcional (código actualizado)
- [ ] Si no tienes Store ID válido, comenta la línea en `.env`
- [ ] Si necesitas Store ID, verifica en Payphone Developer
- [ ] Reinicia el servidor después de cambiar `.env`
- [ ] Prueba el botón de pago nuevamente

---

## 🎯 Resultado Esperado

Después de hacer el Store ID opcional:

- ✅ El botón de Payphone funciona sin Store ID
- ✅ No más error "La tienda asociada no existe"
- ✅ Si tienes un Store ID válido, puedes agregarlo opcionalmente

---

## 💡 Nota Importante

Según la documentación de Payphone, el `storeId` es **opcional** (marcado con ✅ Sí en la tabla de parámetros). Esto significa que:

- **No es obligatorio** tener un Store ID
- Puedes usar Payphone sin configurar Store ID
- Solo es necesario si tienes múltiples sucursales o puntos de venta

---

**Solución aplicada: Store ID ahora es opcional. Prueba sin configurarlo** 🚀



