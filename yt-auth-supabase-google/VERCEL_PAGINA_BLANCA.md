# Por qué Vercel muestra página en blanco – qué revisar

## Lo que ya está bien (Git / GitHub)

- **Repositorio:** `davidethc/RifasEcuador`
- **Rama:** `main`
- **Último commit en GitHub:** `462d52a` (incluye el arreglo del `layout.tsx` para "Invalid URL").
- **Código en GitHub:** En `yt-auth-supabase-google/app/layout.tsx` ya está el fix: se usa una URL base válida (`https://altokeec.com`) si `NEXT_PUBLIC_APP_URL` está vacía o no tiene `http://` o `https://`.

Es decir: el código que Vercel debería estar desplegando es el correcto.

---

## Qué revisar en Vercel (proyecto rifas-ecuador-ians)

### 1. Root Directory (carpeta del proyecto)

El repo tiene la app Next.js **dentro** de la carpeta `yt-auth-supabase-google/`. En la raíz del repo solo están `template/` y esa carpeta; el `package.json` está en `yt-auth-supabase-google/`.

- En Vercel: **Settings** → **General** → **Root Directory**.
- Debe estar en: **`yt-auth-supabase-google`**.
- Si está vacío, Vercel construye desde la raíz del repo, no encuentra un proyecto Next.js válido y puede dar build raro o página en blanco.

### 2. Rama que despliega Vercel

- En **Settings** → **Git** (o **Build & Development**): confirma que **Production Branch** sea **`main`**.
- Así Vercel usa el commit `462d52a` que ya tiene el fix del layout.

### 3. Variable NEXT_PUBLIC_APP_URL

- **Settings** → **Environment Variables**.
- Debe existir **`NEXT_PUBLIC_APP_URL`** para **Production** (y Preview si lo usas).
- Valor correcto: **`https://altokeec.com`** (con `https://`).
- Si falta o está mal, el layout ya no debería romper la app gracias al fix, pero conviene tenerla bien para enlaces y metadatos.

### 4. Redeploy limpiando caché

Después de cambiar Root Directory o variables:

1. **Deployments** → abre el último deployment.
2. Menú (tres puntos) → **Redeploy**.
3. Marca **"Clear cache and deploy"** (o la opción equivalente).
4. Confirmar y esperar a que termine.

Así te aseguras de que se construye de nuevo con el código actual de `main` y sin caché vieja.

---

## Resumen

| Revisar              | Dónde en Vercel              | Valor correcto                    |
|----------------------|-----------------------------|-----------------------------------|
| Root Directory       | Settings → General           | `yt-auth-supabase-google`         |
| Production Branch    | Settings → Git               | `main`                            |
| NEXT_PUBLIC_APP_URL  | Settings → Environment Variables | `https://altokeec.com`        |
| Redeploy             | Deployments → … → Redeploy  | Con "Clear cache and deploy"     |

Si con esto sigue en blanco, en **Deployments** → último deploy → **Build Logs** y **Runtime Logs** suelen mostrar el error concreto (build fallido, error en tiempo de ejecución, etc.).
