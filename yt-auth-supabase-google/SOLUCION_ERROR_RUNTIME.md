# 🔧 Solución para Error de Runtime en Producción

## ⚠️ Problema Detectado

Estás viendo un error en la consola del navegador: `@ 517-fa01abf65205b6b5.js:1`

Este error puede estar relacionado con:

1. **Ambiente de Payphone en modo sandbox** (debería estar en `prod` para producción)
2. **Inicialización de Supabase** en el cliente
3. **Variables de entorno** no accesibles en tiempo de ejecución

---

## ✅ Acciones a Realizar

### 1. Cambiar Ambiente de Payphone a Producción

En Hostinger, en la sección de **Environment Variables**:

1. Busca la variable `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT`
2. Cambia su valor de `sandbox` a `prod`
3. Haz clic en **Save and redeploy**

**⚠️ Importante**: Asegúrate de que tu token de Payphone sea de producción, no de sandbox.

---

### 2. Verificar que Todas las Variables Estén Configuradas

Asegúrate de que todas estas variables estén presentes en Hostinger:

✅ `NEXT_PUBLIC_SUPABASE_URL`  
✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
✅ `SUPABASE_SERVICE_ROLE_KEY`  
✅ `NEXT_PUBLIC_PAYPHONE_TOKEN`  
✅ `NEXT_PUBLIC_PAYPHONE_STORE_ID`  
✅ `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT` → **Cambiar a `prod`**  
✅ `RESEND_API_KEY`  
✅ `RESEND_FROM_EMAIL`  
✅ `NEXT_PUBLIC_APP_URL`  

---

### 3. Redesplegar la Aplicación

Después de hacer los cambios:

1. En Hostinger, ve a **Deployments**
2. Haz clic en **Settings and redeploy**
3. Verifica que todas las variables estén correctas
4. Haz clic en **Save and redeploy**
5. Espera a que el despliegue termine

---

### 4. Verificar el Error en la Consola

Después de redesplegar:

1. Abre tu sitio web en producción
2. Abre las **Herramientas de Desarrollador** (F12)
3. Ve a la pestaña **Console**
4. Revisa si el error persiste

---

## 🔍 Diagnóstico del Error

Si el error persiste después de los cambios, verifica:

### A. Error relacionado con Supabase

**Síntomas:**
- Error: "Missing Supabase environment variables"
- La aplicación no carga
- Problemas de autenticación

**Solución:**
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctamente configuradas
- Asegúrate de que no haya espacios extra al copiar/pegar
- Verifica que las URLs y keys sean válidas en tu panel de Supabase

### B. Error relacionado con Payphone

**Síntomas:**
- Error al intentar pagar
- El botón de pago no carga
- Error: "Configuración de Payphone incompleta"

**Solución:**
- Verifica que `NEXT_PUBLIC_PAYPHONE_TOKEN` sea válido
- Verifica que `NEXT_PUBLIC_PAYPHONE_STORE_ID` sea correcto
- Asegúrate de que `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT` esté en `prod`
- Verifica que el token sea de producción, no de sandbox

### C. Error relacionado con Resend (Correos)

**Síntomas:**
- Los correos no se envían
- Error al enviar confirmaciones

**Solución:**
- Verifica que `RESEND_API_KEY` sea válida
- Verifica que `RESEND_FROM_EMAIL` esté verificado en Resend
- Asegúrate de que el formato sea: `Nombre <email@dominio.com>`

---

## 📝 Checklist Final

Antes de considerar el problema resuelto, verifica:

- [ ] Todas las variables de entorno están configuradas en Hostinger
- [ ] `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT` está en `prod` (no `sandbox`)
- [ ] La aplicación se redesplegó después de los cambios
- [ ] No hay errores en la consola del navegador
- [ ] Los pagos funcionan correctamente
- [ ] Los correos se envían correctamente
- [ ] La autenticación funciona correctamente

---

## 🆘 Si el Problema Persiste

Si después de seguir estos pasos el error continúa:

1. **Revisa los logs de Hostinger:**
   - Ve a **Deployments** → **Build logs**
   - Busca errores durante el build

2. **Revisa la consola del navegador:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña **Console**
   - Copia el error completo y compártelo

3. **Verifica las variables de entorno:**
   - Asegúrate de que no haya espacios extra
   - Verifica que las URLs y keys sean válidas
   - Asegúrate de que todas las variables estén presentes

4. **Prueba en modo local:**
   - Crea un archivo `.env.local` con todas las variables
   - Ejecuta `npm run build` localmente
   - Verifica si el error ocurre también localmente

---

## 📞 Contacto

Si necesitas ayuda adicional, proporciona:
- El error completo de la consola
- Los logs de build de Hostinger
- Una captura de pantalla de las variables de entorno (ocultando valores sensibles)

