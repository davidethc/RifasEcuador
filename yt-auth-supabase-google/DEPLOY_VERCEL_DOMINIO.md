# 🚀 Desplegar el sistema del administrador en Vercel con dominio y subdominio

Guía paso a paso para subir el proyecto a Vercel y configurar un subdominio (ej: `admin.tudominio.com`).

---

## Parte 1: Subir el proyecto a Vercel

### Paso 1: Tener el código en GitHub

1. Si aún no lo tienes, crea un repositorio en GitHub.
2. Sube el código del proyecto **yt-auth-supabase-google** (o solo esa carpeta como raíz del repo).
3. Asegúrate de que el `package.json` esté en la raíz del repositorio que vas a conectar a Vercel.

**Si tu repo es "RifasEcuador" y el admin está en una subcarpeta:**

- Opción A: Conectar Vercel al repo y en la configuración del proyecto poner **Root Directory** = `yt-auth-supabase-google`.
- Opción B: Tener un repositorio aparte solo para el admin y conectar ese repo a Vercel (sin Root Directory).

### Paso 2: Crear proyecto en Vercel

1. Entra a [vercel.com](https://vercel.com) e inicia sesión (con GitHub).
2. Clic en **Add New…** → **Project**.
3. **Import** el repositorio de GitHub (RifasEcuador o el repo del admin).
4. Si el admin está en una subcarpeta:
   - En **Root Directory** haz clic en **Edit** y selecciona `yt-auth-supabase-google`.
5. **Framework Preset**: Vercel suele detectar Next.js; si no, elige **Next.js**.
6. **Build Command**: `npm run build` (por defecto).
7. **Output Directory**: dejar por defecto (Next.js no usa un output dir explícito así).
8. No hagas **Deploy** todavía; primero configura las variables de entorno.

### Paso 3: Variables de entorno en Vercel

1. En la misma pantalla de importación, expande **Environment Variables**.
2. Añade **todas** las variables que tienes en `.env.local` (las de `env.example.txt`):

| Nombre | Dónde usarla | Ejemplo |
|--------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo Production (y Preview si quieres) | `eyJ...` |
| `NEXT_PUBLIC_PAYPHONE_TOKEN` | Production | token de Payphone |
| `NEXT_PUBLIC_PAYPHONE_STORE_ID` | Production | tu store id |
| `NEXT_PUBLIC_PAYPHONE_ENVIRONMENT` | Production | `production` |
| `NEXT_PUBLIC_APP_URL` | Production | `https://admin.tudominio.com` (tu URL final) |
| `RESEND_API_KEY` | Production | `re_...` |
| `BLOB_READ_WRITE_TOKEN` | Si usas Vercel Blob | token de Blob |

3. Para **NEXT_PUBLIC_APP_URL** en producción, usa la URL con la que accederás al admin (dominio o subdominio). Puedes cambiarla después cuando configures el dominio.
4. Clic en **Deploy**. Espera a que termine el build.

Cuando termine, tendrás una URL tipo:  
`https://tu-proyecto-xxx.vercel.app`

---

## Parte 2: Dominio y subdominio

Tienes dos casos: **dominio comprado en Vercel** o **dominio que ya tienes en otro proveedor** (GoDaddy, Namecheap, Cloudflare, etc.).

### Caso A: Dominio comprado en Vercel

1. En el dashboard de Vercel: **Tu proyecto** → **Settings** → **Domains**.
2. Clic en **Add**.
3. Escribe el subdominio que quieras, por ejemplo: `admin.tudominio.com`.
4. Sigue las instrucciones de Vercel para verificar el dominio (DNS suele estar ya gestionado por Vercel).

### Caso B: Dominio en otro proveedor (subdominio admin.tudominio.com)

Aquí “creas” el subdominio añadiendo un registro DNS que apunte a Vercel.

1. En Vercel: **Tu proyecto** → **Settings** → **Domains** → **Add**.
2. Escribe: `admin.tudominio.com` (sustituye por tu dominio real).
3. Vercel te dirá que **no puede verificar automáticamente** y te mostrará qué registro DNS debes crear.

Normalmente te pide algo así:

- **Tipo**: `CNAME`
- **Nombre / Host**: `admin` (o `admin.tudominio.com` según el panel)
- **Valor / Apunta a**: `cname.vercel-dns.com`

En tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare, etc.):

4. Entra a la sección **DNS** / **DNS Management** / **Registros** de tu dominio.
5. Crea un nuevo registro:
   - Tipo: **CNAME**
   - Nombre: `admin` (en algunos paneles ponen “admin” y en otros “admin.tudominio.com”; si solo pide “host”, usa `admin`).
   - Valor / Destino: `cname.vercel-dns.com`
   - TTL: 3600 o “Automático”.
6. Guarda los cambios. La propagación puede tardar desde minutos hasta 48 horas (suele ser rápido).
7. En Vercel, en **Domains**, clic en **Refresh** o “Verify” para que vuelva a comprobar. Cuando diga **Valid Configuration**, el subdominio ya está activo.

---

## Parte 3: Ajustar la app para producción

### 1. URL de la app

En **Vercel** → **Settings** → **Environment Variables**, asegúrate de que en **Production**:

- `NEXT_PUBLIC_APP_URL` = `https://admin.tudominio.com`  
  (la misma URL que pusiste en Domains).

Así los enlaces y callbacks (Payphone, emails, etc.) usarán el dominio correcto.

### 2. Supabase (redirect URLs)

1. En **Supabase** → tu proyecto → **Authentication** → **URL Configuration**.
2. En **Redirect URLs** añade:
   - `https://admin.tudominio.com/**`
   - `https://admin.tudominio.com/auth/callback`
3. En **Site URL** puedes poner: `https://admin.tudominio.com`.
4. Guarda. Así el login (Google, etc.) funcionará en tu subdominio.

### 3. Payphone (si aplica)

En el panel de Payphone, si tienes que configurar una URL de retorno o de notificaciones, usa:

- `https://admin.tudominio.com/...`  
  (la ruta exacta que te pida Payphone).

### 4. Resend (emails)

Si usas un dominio personalizado en Resend, no es obligatorio que sea el mismo que el subdominio del admin. Lo importante es tener las variables `RESEND_API_KEY` y opcionalmente `RESEND_FROM_EMAIL` bien configuradas en Vercel.

---

## Resumen rápido

| Paso | Acción |
|------|--------|
| 1 | Código en GitHub (repo entero o carpeta `yt-auth-supabase-google` con Root Directory en Vercel). |
| 2 | Vercel → Add New → Project → Import repo → Root Directory = `yt-auth-supabase-google` si aplica. |
| 3 | Añadir todas las variables de entorno (env.example.txt) en Vercel. |
| 4 | Deploy. Obtienes `https://xxx.vercel.app`. |
| 5 | Settings → Domains → Add → `admin.tudominio.com`. |
| 6 | En tu proveedor DNS: CNAME `admin` → `cname.vercel-dns.com`. |
| 7 | En Vercel: NEXT_PUBLIC_APP_URL = `https://admin.tudominio.com`. |
| 8 | En Supabase: Redirect URLs y Site URL con `https://admin.tudominio.com`. |

Cuando el DNS esté verificado, el sistema del administrador quedará disponible en **https://admin.tudominio.com** (o el subdominio que hayas elegido).
