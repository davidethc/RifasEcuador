# 📦 Instrucciones: Subir GIF a Vercel Blob Storage

## 🎯 Objetivo
Subir el archivo `gifhero.gif` (68 MB) a Vercel Blob Storage para servir desde CDN.

---

## 📋 Pasos para Subir el GIF

### 1. Obtener Token de Vercel Blob

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Storage** > **Blob**
4. Si no tienes un Blob Store:
   - Click en **"Create Blob Store"**
   - Dale un nombre (ej: `rifas-assets`)
   - Click en **"Create"**
5. Copia el **"Read and Write Token"**

---

### 2. Configurar Variable de Entorno

Agrega a tu `.env.local`:

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANTE**: Este token es sensible. **NUNCA** lo subas a GitHub.

---

### 3. Subir el GIF

#### Opción A: Usar el Script (Recomendado)

```bash
cd yt-auth-supabase-google
node scripts/upload-gif-to-vercel.mjs
```

#### Opción B: Usar la API Route

Con el servidor corriendo (`npm run dev`):

```bash
curl -X POST http://localhost:3000/api/storage/upload-gif-vercel
```

O visita en tu navegador:
```
http://localhost:3000/api/storage/upload-gif-vercel
```

---

### 4. Configurar la URL en Variables de Entorno

Una vez subido, obtendrás una URL como:
```
https://[hash].public.blob.vercel-storage.com/gifhero.gif
```

Agrega esta URL a tu `.env.local`:

```env
# URL del GIF desde Vercel Blob Storage
NEXT_PUBLIC_GIF_URL=https://[hash].public.blob.vercel-storage.com/gifhero.gif
```

---

### 5. Verificar que Funciona

1. Reinicia tu servidor de desarrollo: `npm run dev`
2. Visita la página principal
3. El GIF debería cargar desde Vercel Blob Storage

---

## 🔒 Seguridad

- ✅ El token `BLOB_READ_WRITE_TOKEN` solo debe estar en `.env.local` (local) y en las variables de entorno de Vercel (producción)
- ✅ **NUNCA** lo agregues a `.env` o lo subas a GitHub
- ✅ En producción, agrégalo en: Vercel Dashboard > Settings > Environment Variables

---

## 📝 Notas

- ✅ Vercel Blob Storage es gratuito hasta 1 GB
- ✅ Las URLs son CDN, así que cargarán rápido
- ✅ El código tiene fallback a local si `NEXT_PUBLIC_GIF_URL` no está configurada
- ✅ Funciona tanto en desarrollo como en producción

---

## 🐛 Troubleshooting

### Error: "Falta BLOB_READ_WRITE_TOKEN"
- Verifica que agregaste el token a `.env.local`
- Obtén el token desde Vercel Dashboard > Settings > Storage > Blob

### Error: "Invalid token"
- Verifica que copiaste el token completo
- Asegúrate de usar el "Read and Write Token" (no el "Read Only Token")

### Error: "File too large"
- Vercel Blob Storage permite archivos hasta varios GB, así que esto no debería ocurrir
- Si ocurre, verifica el tamaño del archivo

---

## ✅ Resultado Final

Una vez configurado:
- ✅ El GIF se servirá desde Vercel Blob Storage (CDN rápido)
- ✅ No necesitarás subirlo a GitHub
- ✅ Funcionará en desarrollo y producción
- ✅ El código tiene fallback a local si no está configurado

---

## 🚀 Configurar en Producción (Vercel)

1. Ve a tu proyecto en Vercel Dashboard
2. Settings > Environment Variables
3. Agrega:
   - `BLOB_READ_WRITE_TOKEN` = `tu_token_aqui`
   - `NEXT_PUBLIC_GIF_URL` = `https://[hash].public.blob.vercel-storage.com/gifhero.gif`
4. Haz un nuevo deploy
