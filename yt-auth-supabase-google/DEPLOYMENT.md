# 🚀 Guía de Deployment a Producción

## ✅ Checklist Pre-Deployment

### 1. Variables de Entorno Requeridas

Configura estas variables en Vercel (Settings → Environment Variables):

#### Payphone (Obligatorias)
```env
NEXT_PUBLIC_PAYPHONE_TOKEN=tu_token_completo_de_produccion
NEXT_PUBLIC_PAYPHONE_STORE_ID=tu_store_id
NEXT_PUBLIC_PAYPHONE_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

#### Supabase (Obligatorias)
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

#### Resend (Para emails - Opcional pero recomendado)
```env
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=Rifas Ecuador <noreply@yt.bytemind.space>
```

### 2. Verificación de Archivos

#### Imágenes Verificadas ✅
Todas las imágenes están en `/public`:
- `/public/legacy/img/*` - Imágenes del template
- `/public/kia.jpg` - Premio principal
- `/public/mazdaprin.png` - Segundo premio
- `/public/yamaha.jpg` - Tercer premio
- `/public/logo1.webp` - Logo principal
- `/public/siluetafondo.png` - Silueta para /sorteos
- `/public/silueta2.png` - Silueta para /como-jugar
- `/public/payphonee.webp` - Logo Payphone

### 3. Configuración de Next.js

✅ `next.config.ts` - Configurado con headers para Payphone
✅ `package.json` - Scripts de build correctos
✅ `.gitignore` - Excluye archivos sensibles

### 4. Verificaciones de Código

#### Linting
```bash
npm run lint
```
✅ Sin errores de linting

#### Build
```bash
npm run build
```
✅ Build exitoso

### 5. Configuración en Payphone

En el panel de Payphone (https://appdeveloper.payphonetodoesposible.com):

1. **Ambiente**: Producción (no Sandbox)
2. **Dominio web**: `https://tu-dominio.vercel.app`
3. **Url de respuesta**: `https://tu-dominio.vercel.app/api/payment/payphone/callback`
4. **Tipo**: Web

### 6. Configuración en Supabase

1. Verificar que las políticas RLS estén configuradas correctamente
2. Verificar que las funciones SQL (`reserve_tickets_random`) estén creadas
3. Verificar que las tablas necesarias existan:
   - `raffles`
   - `orders`
   - `tickets`
   - `payments`
   - `clients`

## 📦 Pasos para Deploy en Vercel

### 1. Preparar el Repositorio

```bash
# Asegúrate de que todo esté commiteado
git add .
git commit -m "Preparado para producción"
git push origin main
```

### 2. Conectar con Vercel

1. Ve a https://vercel.com
2. Importa tu repositorio
3. Configura las variables de entorno (ver sección 1)
4. Deploy

### 3. Verificar el Deploy

Después del deploy, verifica:

1. ✅ La página principal carga correctamente
2. ✅ Los sorteos se muestran
3. ✅ El proceso de compra funciona
4. ✅ Los pagos se procesan correctamente
5. ✅ Los emails se envían

## 🔍 Troubleshooting

### Error 401 de Payphone

Ver archivo `SOLUCIONAR_401.md` para solución detallada.

### Imágenes no cargan

Verifica que todas las rutas de imágenes usen `/public/...` o rutas relativas desde `/public`.

### Variables de entorno no funcionan

- Verifica que las variables tengan el prefijo `NEXT_PUBLIC_` si se usan en el cliente
- Redesplegar después de cambiar variables
- Verifica que no haya espacios al inicio/final de los valores

### Build falla

1. Ejecuta `npm run build` localmente para ver errores
2. Verifica que todas las dependencias estén en `package.json`
3. Verifica que no haya imports rotos

## 📝 Notas Importantes

- **NUNCA** subas archivos `.env` con valores reales al repositorio
- Usa `env.example.txt` como referencia
- Los `console.log` están presentes para debugging, considera removerlos en producción futura
- El proyecto usa Next.js 15 con React 19

## ✅ Estado Actual del Proyecto

- ✅ Todas las imágenes verificadas y presentes
- ✅ Configuraciones de Next.js correctas
- ✅ Variables de entorno documentadas
- ✅ Sin errores de linting
- ✅ Código listo para producción
- ✅ Documentación completa

## 🎯 Próximos Pasos

1. Configurar variables de entorno en Vercel
2. Hacer deploy
3. Verificar funcionalidad completa
4. (Opcional) Configurar dominio personalizado
5. (Opcional) Configurar monitoreo y analytics

