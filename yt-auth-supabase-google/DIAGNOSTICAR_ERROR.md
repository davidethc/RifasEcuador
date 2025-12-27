# 🔍 Diagnosticar Error: "Configuración de Payphone incompleta"

## El Problema

El error aparece porque las variables de entorno `NEXT_PUBLIC_PAYPHONE_TOKEN` y `NEXT_PUBLIC_PAYPHONE_STORE_ID` **no están disponibles en el cliente** (navegador).

## 🔎 Cómo Verificar

### Paso 1: Abrir la Consola del Navegador

1. En la página donde aparece el error, presiona **F12** o **Click derecho → Inspeccionar**
2. Ve a la pestaña **Console** (Consola)
3. Busca el mensaje que dice: `🔍 Debug Payphone Variables:`

Deberías ver algo como:

```javascript
🔍 Debug Payphone Variables: {
  hasToken: false,  // ← Si es false, el problema está aquí
  hasStoreId: false, // ← Si es false, el problema está aquí
  tokenLength: 0,
  storeIdValue: "NO DEFINIDO",
  allEnvVars: {
    NEXT_PUBLIC_PAYPHONE_TOKEN: "NO DEFINIDO",  // ← Problema
    NEXT_PUBLIC_PAYPHONE_STORE_ID: "NO DEFINIDO", // ← Problema
    ...
  }
}
```

### Paso 2: Verificar en Vercel

#### A. Verificar que las Variables Estén Configuradas

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Verifica que estas 4 variables existan:
   - `NEXT_PUBLIC_PAYPHONE_TOKEN`
   - `NEXT_PUBLIC_PAYPHONE_STORE_ID`
   - `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT`
   - `NEXT_PUBLIC_APP_URL`

#### B. Verificar el Ambiente

**⚠️ MUY IMPORTANTE**: Las variables deben estar configuradas para el ambiente **Production**.

1. En la lista de variables, verifica la columna **"Environment"**
2. Debe decir **"Production"** (o "All Environments")
3. Si dice solo "Preview" o "Development", **esa es la causa del problema**

#### C. Verificar que se Redesplegó

1. Ve a **Deployments**
2. Verifica la fecha/hora del último deployment
3. Debe ser **DESPUÉS** de cuando agregaste las variables
4. Si el último deployment es anterior, **necesitas redesplegar**

## 🛠️ Soluciones

### Solución 1: Agregar Variables al Ambiente Correcto

Si las variables solo están en "Preview" o "Development":

1. En Vercel → **Settings** → **Environment Variables**
2. Haz clic en la variable `NEXT_PUBLIC_PAYPHONE_TOKEN`
3. En el dropdown **"Environment"**, selecciona **"Production"** (o marca todas)
4. Haz clic en **Save**
5. Repite para `NEXT_PUBLIC_PAYPHONE_STORE_ID`
6. **Redesplegar** (ver Solución 2)

### Solución 2: Redesplegar la Aplicación

**CRÍTICO**: Después de agregar/modificar variables, SIEMPRE debes redesplegar.

#### Opción A: Desde la Notificación
1. Si ves la notificación azul que dice "Added Environment Variable successfully"
2. Haz clic en **"Redeploy"**

#### Opción B: Desde Deployments
1. Ve a **Deployments**
2. Haz clic en los **3 puntos** (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el deployment

#### Opción C: Forzar Nuevo Deployment
1. Haz un pequeño cambio en cualquier archivo (o agrega un espacio)
2. Haz commit y push a GitHub
3. Vercel automáticamente creará un nuevo deployment

### Solución 3: Verificar que los Valores Estén Correctos

1. En Vercel → **Settings** → **Environment Variables**
2. Haz clic en el **ícono del ojo** 👁️ junto a cada variable
3. Verifica que:
   - El token no tenga espacios al inicio/final
   - El Store ID sea correcto
   - Los valores no estén vacíos

### Solución 4: Verificar Build Logs

1. Ve a **Deployments**
2. Abre el último deployment
3. Haz clic en **"Build Logs"**
4. Busca mensajes relacionados con variables de entorno
5. Si ves errores, esos te dirán qué está mal

## ✅ Verificación Final

Después de aplicar las soluciones:

1. **Espera** a que termine el nuevo deployment (puede tomar 2-5 minutos)
2. **Refresca** la página de compra (Ctrl+F5 o Cmd+Shift+R para limpiar caché)
3. Abre la **consola del navegador** (F12)
4. Busca el mensaje `🔍 Debug Payphone Variables:`
5. Ahora deberías ver:
   ```javascript
   {
     hasToken: true,  // ← Debe ser true
     hasStoreId: true, // ← Debe ser true
     tokenLength: 200, // ← Debe ser > 0
     storeIdValue: "tu-store-id", // ← Debe tener valor
   }
   ```
6. El error debería desaparecer y la Cajita de Pagos debería cargar

## 🐛 Si el Problema Persiste

### Verificar en Runtime Logs

1. En Vercel → **Logs** → **Runtime Logs**
2. Filtra por "payphone" o "NEXT_PUBLIC"
3. Busca errores relacionados

### Verificar que Next.js Esté Compilando las Variables

Las variables `NEXT_PUBLIC_*` se compilan en el **build time**, no en runtime.

Si agregaste las variables después del último build, **debes redesplegar**.

### Contactar Soporte

Si después de todo esto sigue sin funcionar:

1. Toma capturas de:
   - Las variables en Vercel (sin mostrar los valores completos)
   - Los logs de la consola del navegador
   - Los Runtime Logs de Vercel
2. Verifica con el soporte de Payphone que las credenciales sean correctas

## 📝 Checklist de Verificación

- [ ] Variables configuradas en Vercel
- [ ] Variables configuradas para ambiente **Production**
- [ ] Valores de variables correctos (sin espacios, no vacíos)
- [ ] Aplicación **redesplegada** después de agregar variables
- [ ] Deployment completado exitosamente
- [ ] Página refrescada con caché limpio (Ctrl+F5)
- [ ] Consola del navegador muestra `hasToken: true` y `hasStoreId: true`
- [ ] Error desapareció y Cajita de Pagos carga

---

**Nota**: Después de verificar que funciona, puedes eliminar los logs de debug del código.

