# Configurar Resend en Vercel para enviar facturas / confirmación de compra

Con Resend configurado en Vercel, la app envía el correo de confirmación (factura) cuando:

- **Pago con tarjeta (Payphone)**: se envía al confirmar el pago.
- **Pago por transferencia**: se envía **solo cuando el admin aprueba** la transferencia en el panel.

---

## Paso 1: Obtener la API Key de Resend

1. Entra a [Resend](https://resend.com) e inicia sesión.
2. Ve a **API Keys** (https://resend.com/api-keys).
3. Crea una nueva API Key (nombre ej. "Vercel ALTOKEE").
4. Copia la key (empieza por `re_...`). **No la compartas ni la subas al código.**

---

## Paso 2: Añadir variables en Vercel

1. Entra a [Vercel](https://vercel.com) → tu proyecto.
2. **Settings** → **Environment Variables**.
3. Añade estas variables:

| Nombre | Valor | Entornos |
|--------|--------|----------|
| `RESEND_API_KEY` | Tu API Key de Resend (ej. `re_xxxxxxxxxxxx`) | Production (y Preview si quieres probar) |
| `RESEND_FROM_EMAIL` | `ALTOKEE <administracion@altokeec.com>` | Production (opcional pero recomendado) |

- **RESEND_API_KEY** es obligatoria para que se envíen los correos.
- **RESEND_FROM_EMAIL** es opcional. Si no la pones, el código usa un valor por defecto. Si la pones, los correos saldrán de ese remitente (el dominio debe estar verificado en Resend).

Formato recomendado para `RESEND_FROM_EMAIL`:

```
ALTOKEE <administracion@altokeec.com>
```

(o el nombre que quieras entre `<` y `>` el email).

4. Guarda y **redeploy** el proyecto (Deployments → ... → Redeploy) para que las variables se apliquen.

---

## Paso 3: Verificar dominio en Resend

Para que los correos salgan de `administracion@altokeec.com`:

1. En Resend: **Domains** → **Add Domain**.
2. Añade `altokeec.com` (o el subdominio que uses).
3. Configura en tu DNS los registros que Resend te indique (SPF, DKIM, etc.).
4. Cuando el dominio esté verificado, podrás usar `administracion@altokeec.com` como remitente.

---

## Resumen

- **RESEND_API_KEY** en Vercel → necesaria para enviar facturas/confirmación.
- **RESEND_FROM_EMAIL** en Vercel → para que el remitente sea `administracion@altokeec.com`.
- Las facturas se envían: (1) al confirmar pago con tarjeta, (2) cuando el admin aprueba una transferencia.
