# 🔧 Solución: Error CORS en Edge Function

## 🚨 Error

```
Access to fetch at 'https://camqqtgefjganpbfgsvh.supabase.co/functions/v1/confirm-payphone-button' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solución

La Edge Function `confirm-payphone-button` no estaba enviando los headers CORS necesarios. **Ya está corregido** en el código.

---

## 🔄 PASO 1: Desplegar la Edge Function Actualizada

### Opción A: Usando Supabase CLI (Recomendado)

```bash
# Desde la raíz del proyecto
supabase functions deploy confirm-payphone-button
```

### Opción B: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Edge Functions**
3. Selecciona `confirm-payphone-button`
4. Copia y pega el código actualizado desde `supabase/functions/confirm-payphone-button/index.ts`
5. Click en **Deploy**

---

## ✅ PASO 2: Verificar que Funciona

1. **Recarga la página** del callback de Payphone
2. **Abre la consola** (F12)
3. **Verifica que no aparezcan errores de CORS**

Deberías ver:
- ✅ La petición a `confirm-payphone-button` se completa exitosamente
- ✅ No hay errores de CORS en la consola
- ✅ La transacción se confirma correctamente

---

## 🔍 Qué se Corrigió

### Antes (Sin CORS):
```typescript
return new Response(
  JSON.stringify({ ... }),
  {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }
);
```

### Después (Con CORS):
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

return new Response(
  JSON.stringify({ ... }),
  {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  }
);
```

### Manejo de Preflight (OPTIONS):
```typescript
// Manejar peticiones OPTIONS (preflight CORS)
if (req.method === 'OPTIONS') {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
```

---

## 🔒 Seguridad en Producción

**⚠️ IMPORTANTE:** En producción, cambia:

```typescript
'Access-Control-Allow-Origin': '*',
```

Por tu dominio específico:

```typescript
'Access-Control-Allow-Origin': 'https://tudominio.com',
```

O mejor aún, usa una lista de dominios permitidos:

```typescript
const allowedOrigins = [
  'https://tudominio.com',
  'https://www.tudominio.com',
];

const origin = req.headers.get('origin');
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') 
    ? origin || '*' 
    : 'none',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

---

## 📋 Checklist

- [ ] Edge Function actualizada con headers CORS
- [ ] Edge Function desplegada en Supabase
- [ ] Probado en `http://localhost:5173`
- [ ] No hay errores de CORS en la consola
- [ ] La confirmación de pago funciona correctamente
- [ ] (Opcional) Configurado dominio específico para producción

---

## 🎯 Próximos Pasos

1. **Despliega la Edge Function** actualizada
2. **Prueba el flujo completo** de pago
3. **Verifica** que la confirmación funciona sin errores

---

**¡El error de CORS debería estar resuelto!** 🚀



