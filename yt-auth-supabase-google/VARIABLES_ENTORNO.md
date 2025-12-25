# 🔐 Guía de Configuración de Variables de Entorno en Hostinger

Esta guía te ayudará a configurar todas las variables de entorno necesarias para que tu aplicación funcione correctamente en producción.

## 📋 Variables de Entorno Requeridas

### 1. **Variables de Supabase** (Base de datos)

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Descripción**: URL de tu proyecto de Supabase
- **Dónde encontrarla**: 
  - Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
  - Ve a **Settings** → **API**
  - Copia el valor de **Project URL**
- **Ejemplo**: `https://xxxxxxxxxxxxx.supabase.co`

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Descripción**: Clave pública (anon) de Supabase
- **Dónde encontrarla**:
  - En el mismo lugar: **Settings** → **API**
  - Copia el valor de **anon public** key
- **Ejemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Descripción**: Clave de servicio (admin) de Supabase (⚠️ MANTÉN ESTA SECRETA)
- **Dónde encontrarla**:
  - En **Settings** → **API**
  - Copia el valor de **service_role** key (⚠️ NO la compartas públicamente)
- **Ejemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### 2. **Variables de Payphone** (Pagos)

#### `NEXT_PUBLIC_PAYPHONE_TOKEN`
- **Descripción**: Token de autenticación de Payphone
- **Dónde encontrarla**:
  - Ve a tu cuenta de [Payphone](https://payphonetodoesposible.com)
  - En el panel de administración, busca la sección de **API** o **Configuración**
  - Copia tu **API Token**
- **Ejemplo**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### `NEXT_PUBLIC_PAYPHONE_STORE_ID`
- **Descripción**: ID de tu tienda en Payphone
- **Dónde encontrarla**:
  - En el mismo panel de Payphone
  - Busca **Store ID** o **Tienda ID**
- **Ejemplo**: `12345`

#### `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT`
- **Descripción**: Ambiente de Payphone (sandbox o prod)
- **Valores posibles**:
  - `sandbox` - Para pruebas
  - `prod` - Para producción
- **Recomendación**: Usa `prod` en producción

---

### 3. **Variables de Resend** (Envío de correos)

#### `RESEND_API_KEY`
- **Descripción**: Clave API de Resend para enviar correos
- **Dónde encontrarla**:
  - Ve a tu cuenta en [Resend](https://resend.com)
  - Ve a **API Keys**
  - Crea una nueva clave o copia una existente
- **Ejemplo**: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `RESEND_FROM_EMAIL`
- **Descripción**: Email desde el cual se enviarán los correos
- **Formato**: `Nombre <email@dominio.com>`
- **Ejemplo**: `Rifas Ecuador <noreply@tudominio.com>`
- **Nota**: Debe ser un email verificado en Resend

---

### 4. **Variables de la Aplicación**

#### `NEXT_PUBLIC_APP_URL`
- **Descripción**: URL completa de tu aplicación en producción
- **Ejemplo**: `https://tudominio.com` o `https://darkcyan-hornet-176723.hostingersite.com`
- **Importante**: No incluyas la barra final (`/`)

---

## 🚀 Cómo Configurar en Hostinger

### Paso 1: Acceder al Panel de Deployments

1. Inicia sesión en tu cuenta de [Hostinger](https://www.hostinger.com)
2. Ve a **Deployments** en el menú lateral
3. Selecciona tu sitio web (en tu caso: `darkcyan-hornet-176723.h`)

### Paso 2: Configurar Variables de Entorno

1. En el panel de tu sitio, busca la sección **Environment Variables** o **Variables de Entorno**
   - Puede estar en:
     - **Settings** → **Environment Variables**
     - **Advanced** → **Environment Variables**
     - **Configuration** → **Environment Variables**

2. Haz clic en **Add Variable** o **Agregar Variable**

3. Agrega cada variable una por una:

   ```
   Nombre: NEXT_PUBLIC_SUPABASE_URL
   Valor: https://tu-proyecto.supabase.co
   ```

   ```
   Nombre: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ```
   Nombre: SUPABASE_SERVICE_ROLE_KEY
   Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ```
   Nombre: NEXT_PUBLIC_PAYPHONE_TOKEN
   Valor: tu-token-de-payphone
   ```

   ```
   Nombre: NEXT_PUBLIC_PAYPHONE_STORE_ID
   Valor: 12345
   ```

   ```
   Nombre: NEXT_PUBLIC_PAYPHONE_ENVIRONMENT
   Valor: prod
   ```

   ```
   Nombre: RESEND_API_KEY
   Valor: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   ```
   Nombre: RESEND_FROM_EMAIL
   Valor: Rifas Ecuador <noreply@tudominio.com>
   ```

   ```
   Nombre: NEXT_PUBLIC_APP_URL
   Valor: https://darkcyan-hornet-176723.hostingersite.com
   ```

### Paso 3: Guardar y Redesplegar

1. Después de agregar todas las variables, haz clic en **Save** o **Guardar**
2. Ve a la sección **Deployments**
3. Haz clic en **Redeploy** o **Redesplegar** para que los cambios surtan efecto

---

## ✅ Verificación

Después de configurar las variables y redesplegar:

1. Ve a tu sitio web en producción
2. Verifica que:
   - La aplicación carga correctamente
   - Los pagos funcionan (prueba con un pago de prueba)
   - Los correos se envían correctamente
   - La base de datos se conecta correctamente

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**:
- **NUNCA** compartas `SUPABASE_SERVICE_ROLE_KEY` públicamente
- **NUNCA** compartas `RESEND_API_KEY` públicamente
- **NUNCA** compartas `NEXT_PUBLIC_PAYPHONE_TOKEN` públicamente
- Estas claves dan acceso completo a tus servicios

---

## 📝 Notas Adicionales

- Las variables que empiezan con `NEXT_PUBLIC_` son accesibles desde el cliente (navegador)
- Las variables sin `NEXT_PUBLIC_` solo son accesibles en el servidor
- Después de cambiar variables de entorno, siempre necesitas redesplegar la aplicación
- Si tienes problemas, verifica que no haya espacios extra al copiar/pegar los valores

---

## 🆘 Solución de Problemas

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- **Solución**: Verifica que la variable esté configurada correctamente en Hostinger y que hayas redesplegado

### Error: "Missing Supabase environment variables"
- **Solución**: Verifica que todas las variables de Supabase estén configuradas

### Los pagos no funcionan
- **Solución**: Verifica que `NEXT_PUBLIC_PAYPHONE_TOKEN` y `NEXT_PUBLIC_PAYPHONE_STORE_ID` estén correctos

### Los correos no se envían
- **Solución**: Verifica que `RESEND_API_KEY` y `RESEND_FROM_EMAIL` estén configurados y que el email esté verificado en Resend

