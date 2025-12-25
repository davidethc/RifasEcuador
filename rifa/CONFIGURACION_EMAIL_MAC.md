# 📧 Configuración de Envío de Correos en XAMPP para Mac

## 📍 Ubicación del archivo php.ini

```
/Applications/XAMPP/xamppfiles/etc/php.ini
```

## 🔧 Configuración de sendmail_path

### Opción 1: Usar sendmail del sistema (Recomendado)

Abre el archivo `php.ini` y busca la sección `[mail function]` (alrededor de la línea 1100-1105).

**Descomenta y configura:**
```ini
[mail function]
; For Unix only. You may supply arguments as well (default: "sendmail -t -i").
sendmail_path = /usr/sbin/sendmail -t -i
```

### Opción 2: Usar el comando mail (Alternativa)

Si `/usr/sbin/sendmail` no está disponible:
```ini
sendmail_path = /usr/bin/mail -t
```

### Opción 3: Configurar SMTP directamente (Mejor para desarrollo)

Para usar Gmail u otro servicio SMTP:
```ini
[mail function]
SMTP = smtp.gmail.com
smtp_port = 587
sendmail_from = tu-email@gmail.com
sendmail_path = /usr/sbin/sendmail -t -i
```

**Nota:** Para Gmail necesitarás una "Contraseña de aplicación" en lugar de tu contraseña normal.

### Opción 4: Usar msmtp (Si lo instalaste con Homebrew)

```bash
# Instalar msmtp
brew install msmtp
```

Luego en `php.ini`:
```ini
sendmail_path = /opt/homebrew/bin/msmtp -t
```

## ✅ Verificar la configuración

1. **Reinicia Apache** desde el panel de control de XAMPP
2. **Verifica la configuración** con este script PHP:

```php
<?php
phpinfo();
// Busca la sección "mail" y verifica sendmail_path
```

O crea un archivo de prueba:

```php
<?php
$to = "tu-email@ejemplo.com";
$subject = "Prueba de correo";
$message = "Este es un correo de prueba desde XAMPP en Mac";
$headers = "From: tu-email@ejemplo.com";

if (mail($to, $subject, $message, $headers)) {
    echo "Correo enviado correctamente";
} else {
    echo "Error al enviar correo";
}
```

## ⚠️ Notas importantes

- En macOS moderno, el servidor de correo puede no estar configurado por defecto
- Para desarrollo local, considera usar servicios como **Mailtrap** o **MailHog**
- Si usas Gmail, necesitas habilitar "Acceso de aplicaciones menos seguras" o usar OAuth2
- Siempre reinicia Apache después de modificar `php.ini`

## 🔍 Verificar si sendmail está disponible

Ejecuta en Terminal:
```bash
which sendmail
# Debería mostrar: /usr/sbin/sendmail

# O verifica si existe:
ls -la /usr/sbin/sendmail
```

Si no existe, usa la **Opción 2** o **Opción 3**.

