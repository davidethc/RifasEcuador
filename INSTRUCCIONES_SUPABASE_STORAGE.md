# 📦 Instrucciones: Subir GIF a Supabase Storage

## 🎯 Objetivo
Subir el archivo `Diseño Video.gif` (100.25 MB) a Supabase Storage para evitar problemas con GitHub.

---

## 📋 Pasos para Subir el GIF

### 1. Configurar Variables de Entorno

Agrega a tu `.env.local`:

```env
# Supabase (ya deberías tenerlas)
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# IMPORTANTE: Necesitas la Service Role Key para subir archivos
# Obténla desde: Supabase Dashboard > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

⚠️ **IMPORTANTE**: La `SUPABASE_SERVICE_ROLE_KEY` es sensible. **NUNCA** la subas a GitHub.

---

### 2. Crear el Bucket en Supabase (Manual)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Storage** en el menú lateral
3. Click en **"New bucket"**
4. Configuración:
   - **Name**: `public-assets`
   - **Public bucket**: ✅ **Activado** (importante para que las URLs sean públicas)
   - **File size limit**: `100 MB` (o más si tu plan lo permite)
   - **Allowed MIME types**: `image/gif, image/png, image/jpeg, video/mp4`

---

### 3. Subir el GIF usando la API

#### Opción A: Usar la API Route (Recomendado)

```bash
# Desde la raíz del proyecto
cd yt-auth-supabase-google

# Ejecutar el endpoint
curl -X POST http://localhost:3000/api/storage/upload-gif
```

O visita en tu navegador (con el servidor corriendo):
```
http://localhost:3000/api/storage/upload-gif
```

#### Opción B: Subir Manualmente desde Supabase Dashboard

1. Ve a **Storage** > **public-assets**
2. Click en **"Upload file"**
3. Selecciona `public/Diseño Video.gif`
4. Espera a que termine la subida
5. Click derecho en el archivo > **"Copy URL"**

---

### 4. Configurar la URL en Variables de Entorno

Una vez subido, obtendrás una URL como:
```
https://[tu-proyecto].supabase.co/storage/v1/object/public/public-assets/Diseño%20Video.gif
```

Agrega esta URL a tu `.env.local`:

```env
# URL del GIF desde Supabase Storage
NEXT_PUBLIC_GIF_URL=https://[tu-proyecto].supabase.co/storage/v1/object/public/public-assets/Diseño%20Video.gif
```

---

### 5. Verificar que Funciona

1. Reinicia tu servidor de desarrollo: `npm run dev`
2. Visita la página principal
3. El GIF debería cargar desde Supabase Storage

---

## 🔒 Seguridad

### Políticas de Acceso (RLS)

Si quieres que el bucket sea completamente público:

1. Ve a **Storage** > **public-assets** > **Policies**
2. Crea una nueva política:
   - **Policy name**: `Public read access`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
   ```sql
   (bucket_id = 'public-assets'::text)
   ```
   - **Target roles**: `anon`, `authenticated`

---

## 📝 Notas

- ✅ El GIF seguirá funcionando localmente si `NEXT_PUBLIC_GIF_URL` no está configurada
- ✅ En producción, usa la URL de Supabase Storage
- ✅ Supabase Storage es gratuito hasta cierto límite (depende de tu plan)
- ✅ Las URLs de Supabase Storage son CDN, así que cargarán rápido

---

## 🐛 Troubleshooting

### Error: "Bucket does not exist"
- Crea el bucket manualmente desde el Dashboard de Supabase

### Error: "Permission denied"
- Verifica que estás usando `SUPABASE_SERVICE_ROLE_KEY` (no `ANON_KEY`)
- Verifica las políticas RLS del bucket

### Error: "File size limit exceeded"
- Verifica el límite de tamaño en la configuración del bucket
- Algunos planes de Supabase tienen límites diferentes

---

## ✅ Resultado Final

Una vez configurado:
- ✅ El GIF se servirá desde Supabase Storage (rápido y confiable)
- ✅ No necesitarás subirlo a GitHub
- ✅ Funcionará en desarrollo y producción
- ✅ El código tiene fallback a local si no está configurado
