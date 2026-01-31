# Por qué no llega o tarda el correo de verificación (Supabase Auth)

## Causas principales

### 1. SMTP por defecto de Supabase (sin SMTP personalizado)

Si **no** tienes configurado un SMTP personalizado en el proyecto:

- **Solo se envían correos a direcciones autorizadas**: los miembros del equipo de tu organización en Supabase. Cualquier otro email (ej. `csabor72@gmail.com`, clientes) **no recibe** el correo o Supabase lo rechaza.
- **Límite muy bajo**: pocos correos por hora (p. ej. 2/hora). No es para producción.
- **Sin SLA**: el envío es “best-effort”; puede tardar o no entregarse.
- **Dominio `supabase.io`**: más riesgo de que caiga en **spam**.

Por eso el código o el link de verificación **no llega** o **tarda mucho** con el SMTP por defecto.

### 2. Usuario ya registrado (`user_repeated_signup`)

En los logs de Auth del proyecto **SorteoRifas** aparecen eventos `user_repeated_signup` para `csabor72@gmail.com` y otros. Eso significa:

- El usuario **ya existe** en Auth.
- Supabase puede **no enviar** un nuevo correo de confirmación en cada intento (para evitar spam).
- El usuario debería usar **Iniciar sesión** con su contraseña, no registrarse de nuevo.

---

## Solución recomendada: SMTP personalizado (Resend)

Ya usas **Resend** para los correos de confirmación de compra. Puedes usar el **mismo Resend** para los correos de Auth (verificación, reset password, etc.).

### Pasos en Supabase Dashboard

1. Entra a **[Supabase Dashboard](https://supabase.com/dashboard)** → proyecto **SorteoRifas**.
2. **Authentication** → **SMTP** (o **Project Settings** → **Auth** → SMTP).
3. Activa **Enable Custom SMTP**.
4. Rellena con los datos de Resend:
   - **Sender email**: un email verificado en Resend (ej. `noreply@tudominio.com`).
   - **Sender name**: ej. `ALTOKEE` o `Rifas Ecuador`.
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL).
   - **Username**: `resend`
   - **Password**: tu **Resend API Key** (la misma que usas en `RESEND_API_KEY` en Vercel).
5. Guarda.

Documentación Resend + Supabase:  
https://resend.com/docs/send-with-supabase-smtp

### Después de configurar SMTP

- Los correos de verificación se envían a **cualquier** email (no solo al equipo).
- Mejor entrega y menos retrasos que el SMTP por defecto.
- Puedes subir el límite de envío en **Auth** → **Rate Limits** si lo necesitas.

---

## Revisar logs de Auth

Si sigues teniendo problemas:

1. Dashboard → **Logs** → **Auth**.
2. Busca errores al enviar (p. ej. “Email address not authorized”, errores de SMTP).
3. Si ves `user_repeated_signup`, el usuario ya está registrado: debe **iniciar sesión**, no volver a registrarse.

---

## Resumen

| Problema                         | Causa probable                         | Qué hacer                                      |
|----------------------------------|----------------------------------------|-----------------------------------------------|
| No llega el correo               | SMTP por defecto / solo equipo        | Configurar SMTP con Resend en Supabase        |
| Llega muy tarde                  | SMTP por defecto, sin SLA             | Igual: SMTP con Resend                        |
| “Usuario ya existe” al registrarse | Cuenta ya creada (`user_repeated_signup`) | Usar “Iniciar sesión” en lugar de registrarse |
| Cae en spam                      | Dominio por defecto `supabase.io`    | SMTP con tu dominio (Resend) + DKIM/SPF/DMARC |

Configurar **Custom SMTP con Resend** en el proyecto SorteoRifas soluciona la mayoría de los casos de “no llega” o “demora mucho” el correo de verificación.
