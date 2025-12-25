# 🎰 Sistema de Rifas - RIFASSANTIN

Sistema completo de gestión de sorteos/rifas con integración de pagos Payphone.

## 🚀 Características

- ✅ **Gestión de Sorteos** - Crear y administrar sorteos
- ✅ **Sistema de Boletos** - 60,000 boletos por sorteo
- ✅ **Pagos con Payphone** - Cajita de Pagos integrada
- ✅ **Autenticación** - Sistema de usuarios con Supabase Auth
- ✅ **Responsive** - Diseño adaptativo para todos los dispositivos
- ✅ **TypeScript** - Tipado completo y seguro
- ✅ **Base de Datos** - Supabase PostgreSQL con RLS

## 📁 Estructura del Proyecto

```
src/
├── features/          # Módulos de negocio (Feature-Sliced Design)
│   ├── auth/          # Autenticación
│   ├── payment/       # Integración Payphone
│   ├── purchase/      # Proceso de compra
│   ├── raffles/       # Gestión de sorteos
│   └── tickets/       # Gestión de boletos
├── pages/             # Páginas/Vistas
├── routes/            # Configuración de rutas
└── shared/            # Componentes y utilidades compartidas
```

## 🛠️ Tecnologías

- **Frontend:** React 19 + TypeScript + Vite
- **Estilos:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Pagos:** Payphone (Cajita de Pagos)
- **Routing:** React Router 7
- **Estado:** Zustand
- **Formularios:** React Hook Form + Zod

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Supabase
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Payphone
VITE_PAYPHONE_BOX_TOKEN=tu_token_payphone
VITE_PAYPHONE_BOX_STORE_ID=tu_store_id
VITE_PAYPHONE_BOX_ENV=prueba  # o 'produccion'
```

### Base de Datos

1. Ejecuta el SQL completo en Supabase: `sql.supabase`
2. Verifica que todas las tablas, funciones y triggers estén creados
3. Revisa las políticas RLS

### Edge Functions

Despliega las Edge Functions en Supabase:

```bash
# Opción 1: Desde terminal
supabase functions deploy confirm-payphone-button

# Opción 2: Desde Dashboard de Supabase
# Crear función manualmente y pegar el código
```

Funciones necesarias:
- `confirm-payphone-button` - Confirma pagos de Cajita de Pagos
- `create-payphone-payment` - Crea pagos (API Sale, opcional)
- `check-payphone-status` - Consulta estado (API Sale, opcional)

## 🛣️ Rutas Principales

- `/` - Página principal (sorteos activos)
- `/raffles/:id` - Detalle de sorteo
- `/purchase/:id` - Seleccionar cantidad de boletos
- `/purchase/:id/form` - Formulario de datos del cliente
- `/purchase/:saleId/confirmation` - Confirmación y pago
- `/payment/callback` - Callback de Payphone
- `/payment/result` - Resultado del pago
- `/my-tickets` - Mis boletos comprados
- `/login` - Iniciar sesión
- `/register` - Registrarse

## 🔄 Flujo de Compra

1. Usuario selecciona sorteo → Selecciona cantidad
2. Completa formulario → Se crea venta (pending)
3. Ve confirmación → Aparece botón de Payphone
4. Usuario paga → Payphone redirige a callback
5. Sistema confirma → Actualiza estado a completed
6. Usuario ve resultado → Puede ver sus boletos

## 📚 Documentación

- `PROYECTO_LIMPIO_CHECKLIST.md` - Checklist completo
- `SUPABASE_REVISION_PLAN.md` - Plan de revisión de Supabase
- `BUENAS_PRACTICAS_PRODUCCION.md` - Buenas prácticas
- `PAYPHONE_SETUP.md` - Setup inicial de Payphone
- `PAYPHONE_BOX_SETUP.md` - Configuración Cajita de Pagos
- `PAYPHONE_CONFIRM_IMPORTANT.md` - Reverso automático
- `PAYPHONE_IMPLEMENTATION_SUMMARY.md` - Resumen de implementación
- `PAYPHONE_MODAL_EXAMPLE.md` - Ejemplo de modal

## 🧪 Pruebas

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173
```

### Entorno de Pruebas Payphone

1. Configurar `VITE_PAYPHONE_BOX_ENV=prueba`
2. Usar token de pruebas
3. Invitar probadores en Payphone Developer

## 🚀 Deploy a Producción

### 1. Build

```bash
npm run build
```

### 2. Configurar Variables de Entorno

En tu plataforma de hosting (Vercel, Netlify, etc.):
- Agregar todas las variables de `.env`

### 3. Configurar Supabase

- Desplegar Edge Functions
- Configurar variables de entorno en Edge Functions
- Verificar RLS y políticas

### 4. Configurar Payphone

- Cambiar a entorno de producción
- Configurar URLs de producción
- Configurar dominio autorizado

## 🔒 Seguridad

- ✅ RLS habilitado en todas las tablas
- ✅ Tokens protegidos en Edge Functions
- ✅ Validación de datos en frontend y backend
- ✅ Variables de entorno para configuración
- ✅ Service Role Key solo en servidor

## 📊 Monitoreo

### Queries SQL Útiles

Ver `PAYPHONE_CONFIRM_IMPORTANT.md` para queries de monitoreo.

### Logs

- Supabase Dashboard > Logs
- Edge Functions logs
- Browser console (solo en desarrollo)

## 🆘 Soporte

### Problemas Comunes

1. **Error 401 en customers/sales:**
   - Verificar políticas RLS
   - Ejecutar scripts SQL de políticas

2. **Botón de Payphone no aparece:**
   - Verificar que scripts CSS/JS estén en `index.html`
   - Verificar variables de entorno
   - Verificar que SDK esté cargado

3. **Callback no funciona:**
   - Verificar URL configurada en Payphone Developer
   - Verificar que Edge Function esté desplegada
   - Verificar logs de Edge Functions

## 📝 Licencia

Privado - Todos los derechos reservados

## 👥 Contribuidores

Desarrollado para RIFASSANTIN

---

**Última actualización:** 2025
