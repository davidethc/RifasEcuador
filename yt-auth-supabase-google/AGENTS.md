# AGENTS.md - Rifas Ecuador

Este archivo proporciona información esencial para que los agentes de IA entiendan y trabajen eficientemente en este proyecto.

## 🎯 Propósito del Proyecto

Aplicación web para la venta de boletos de rifas en Ecuador. El objetivo principal es **VENDER BOLETOS** - todo el código y diseño debe facilitar la compra de boletos.

## 🏗️ Arquitectura

### Stack Tecnológico
- **Framework**: Next.js 15.1.9 (App Router)
- **Lenguaje**: TypeScript 5
- **React**: 19.0.0
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Pagos**: Payphone API
- **Estilos**: Tailwind CSS 3.4.1
- **Animaciones**: Framer Motion 12.23.26
- **UI Components**: Radix UI

### Estructura del Proyecto

```
/app                    # Next.js App Router (páginas y rutas API)
  /api                  # API Routes
    /payment/payphone   # Integración de pagos Payphone
    /email              # Envío de correos (Resend)
    /orders             # Gestión de órdenes
    /stats              # Estadísticas de ventas
  /comprar/[id]         # Flujo de compra de boletos
  /sorteos              # Páginas de sorteos
  /mis-boletos          # Boletos del usuario autenticado
  /auth/callback        # Callback de autenticación Supabase
  
/components             # Componentes reutilizables
  /compra               # Componentes del flujo de compra
  /sorteos              # Componentes de sorteos
  /ui                   # Componentes UI base (shadcn/ui)
  
/contexts               # React Contexts
  AuthContext.tsx       # Contexto de autenticación
  
/services               # Servicios de negocio
  purchaseService.ts    # Lógica de compra
  
/utils                  # Utilidades
  supabase.ts          # Cliente Supabase
  phoneFormatter.ts    # Formateo de teléfonos
  
/types                  # Tipos TypeScript
  database.types.ts    # Tipos generados de Supabase
  payphone.types.ts    # Tipos de Payphone API
  purchase.types.ts    # Tipos de compras
```

## 🚀 Configuración del Entorno

### Variables de Entorno Requeridas

Crea un archivo `.env.local` basado en `env.example.txt`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Payphone
NEXT_PUBLIC_PAYPHONE_TOKEN=tu_token_payphone
NEXT_PUBLIC_PAYPHONE_STORE_ID=tu_store_id
NEXT_PUBLIC_PAYPHONE_ENVIRONMENT=sandbox|production
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (Emails)
RESEND_API_KEY=tu_resend_api_key
```

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint
```

## 📝 Convenciones de Código

### Estilo de Código

1. **TypeScript**: Usar tipos estrictos. Evitar `any` siempre que sea posible.
2. **Componentes React**: 
   - Usar componentes funcionales con hooks
   - Nombres en PascalCase
   - Props tipadas con interfaces o types
3. **Archivos**: 
   - Componentes: `PascalCase.tsx`
   - Utilidades: `camelCase.ts`
   - Tipos: `camelCase.types.ts`

### Importaciones

- Usar rutas absolutas con alias `@/` cuando sea posible
- Agrupar imports: externos → internos → relativos
- Ejemplo:
```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/utils/phoneFormatter'
```

### Manejo de Errores

- Usar try-catch en operaciones asíncronas
- Mostrar mensajes de error amigables al usuario
- Registrar errores críticos (pero no datos sensibles)

## 🎨 Sistema de Diseño

Ver `design-system.md` para detalles completos.

### Principios Clave

1. **Objetivo único**: VENDER BOLETOS
2. **Claridad y simplicidad**: Menos es más
3. **Jerarquía visual**: Botón de comprar siempre destacado

### Colores Principales

- **Primary Gold** (`#FFB200`): Botones CTA principales
- **Primary Purple** (`#A83EF5`): Acentos, links importantes
- **Background Dark** (`#100235`): Fondo principal

### Componentes UI

- Los componentes base están en `/components/ui/`
- Siguen el patrón shadcn/ui con Tailwind CSS
- Usar componentes existentes antes de crear nuevos

## 🔐 Autenticación y Seguridad

### Supabase Auth

- Autenticación manejada por Supabase
- Contexto: `AuthContext.tsx`
- Rutas protegidas: `ProtectedRoute.tsx`
- Callback: `/app/auth/callback/route.ts`

### Validación de Datos

- Validar datos del lado del cliente (UX)
- **Siempre** validar en el servidor (seguridad)
- Usar tipos TypeScript para validación de tipos

## 💳 Integración de Pagos

### Payphone API

- Endpoints en `/app/api/payment/payphone/`
- Flujo:
  1. `/create` - Crear transacción
  2. `/confirm` - Confirmar pago
  3. `/callback` - Webhook de Payphone
  4. `/status` - Consultar estado

### Importante sobre Pagos

- **NUNCA** confiar solo en el callback del cliente
- Validar todos los pagos en el servidor
- Usar webhooks de Payphone para confirmaciones
- Implementar reintentos para transacciones fallidas

## 📊 Base de Datos

### Supabase

- Tipos generados en `types/database.types.ts`
- Usar cliente Supabase de `utils/supabase.ts`
- Implementar Row Level Security (RLS) en Supabase

### Consultas

- Usar queries optimizadas
- Implementar paginación para listas grandes
- Cachear datos estáticos cuando sea posible

## 📧 Emails

### Resend

- Configurado en `/app/api/email/`
- Templates de confirmación de compra
- Usar variables de entorno para API key

## 🧪 Testing y Calidad

### Antes de Commitear

1. Ejecutar `npm run lint`
2. Verificar que no haya errores de TypeScript
3. Probar flujo de compra en desarrollo
4. Verificar que los tipos estén correctos

### Buenas Prácticas

- Mantener componentes pequeños y enfocados
- Separar lógica de negocio de componentes
- Reutilizar componentes existentes
- Documentar funciones complejas

## 🐛 Debugging

### Logs

- Usar `console.log` en desarrollo (eliminar en producción)
- Para producción, considerar un servicio de logging
- No loggear información sensible (tokens, passwords)

### Errores Comunes

- **401 Unauthorized**: Verificar configuración de Supabase RLS
- **Payphone errors**: Verificar token y ambiente (sandbox/production)
- **Type errors**: Regenerar tipos de Supabase si cambia el schema

## 📚 Recursos Importantes

- [Sistema de Diseño](./design-system.md)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Payphone API Docs](https://payphone.app/documentacion)
- [Tailwind CSS](https://tailwindcss.com/docs)

## ⚠️ Reglas Importantes

1. **NUNCA** hardcodear tokens o API keys en el código
2. **SIEMPRE** validar datos en el servidor
3. **SIEMPRE** usar tipos TypeScript
4. Mantener el objetivo: facilitar la venta de boletos
5. Seguir el sistema de diseño para consistencia
6. Probar el flujo de compra completo antes de hacer merge

## 🔄 Flujo de Desarrollo

1. Crear branch desde `main`
2. Implementar cambios
3. Probar localmente
4. Ejecutar linter
5. Hacer commit con mensaje descriptivo
6. Crear pull request
7. Revisar y mergear

## 📝 Notas Adicionales

- El proyecto usa App Router de Next.js (no Pages Router)
- Todos los componentes deben ser responsive (mobile-first)
- Priorizar performance y SEO
- Implementar lazy loading para imágenes y componentes pesados
