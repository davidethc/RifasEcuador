# Sistema de Diseño - Rifas Ecuador

## Objetivo Único
**VENDER BOLETOS** - Todo debe apuntar a facilitar la compra de boletos

## Principios de Diseño

### 1. Claridad y Simplicidad
- Menos es más - reducir elementos innecesarios
- Cada elemento debe tener un propósito claro
- Priorizar contenido que impulse la compra

### 2. Jerarquía Visual
- Lo más importante: **Botón de comprar boletos**
- Segundo: Información del sorteo/premio
- Tercero: Detalles adicionales

### 3. Consistencia
- Colores unificados en toda la aplicación
- Tipografía clara y legible
- Espaciado consistente

## Paleta de Colores Unificada

### Colores Primarios
```css
--primary-gold: #FFB200;      /* CTA principal - Comprar */
--primary-purple: #A83EF5;    /* Acentos, links importantes */
--primary-pink: #f02080;      /* Acentos secundarios */
```

### Colores de Fondo
```css
--bg-primary: #100235;        /* Fondo principal oscuro */
--bg-secondary: #1A1525;      /* Cards, containers */
--bg-elevated: #2A1F3D;       /* Elementos elevados */
--bg-overlay: rgba(16, 2, 53, 0.9); /* Overlays, modales */
```

### Colores de Texto
```css
--text-primary: #FFFFFF;      /* Texto principal */
--text-secondary: #E5E7EB;    /* Texto secundario */
--text-muted: #9CA3AF;        /* Texto deshabilitado/helper */
--text-accent: #FFB200;       /* Texto destacado/precios */
```

### Estados
```css
--success: #22C55E;
--error: #EF4444;
--warning: #F59E0B;
```

## Componentes

### Botones

#### Botón Primario (CTA)
- Uso: Acción principal - "Comprar Boletos", "Continuar"
- Color: `--primary-gold` (#FFB200)
- Texto: Negro (#1A1A1A)
- Tamaño mínimo: 48px altura (accesibilidad móvil)
- Estado hover: Ligeramente más oscuro (#F59E0B)

#### Botón Secundario
- Uso: Acciones secundarias
- Color: `--primary-purple` (#A83EF5)
- Texto: Blanco
- Estado hover: Más oscuro (#683DF5)

#### Botón Terciario/Ghost
- Uso: Acciones menos importantes
- Estilo: Transparente con borde
- Color borde: `rgba(255, 255, 255, 0.2)`

### Cards

#### Card de Sorteo
- Fondo: `--bg-secondary` con bordes sutiles
- Imagen: Aspect ratio 4:3
- Información mínima: Título, precio, progreso
- CTA visible: Botón primario siempre visible
- Sin anidamiento excesivo - máximo 2 niveles

#### Card de Información
- Fondo: `--bg-elevated`
- Bordes sutiles: `rgba(168, 62, 245, 0.15)`
- Espaciado: Generoso pero no excesivo

### Formularios

#### Inputs
- Fondo: Transparente o muy oscuro
- Borde: `rgba(255, 255, 255, 0.1)`
- Focus: `--primary-purple` con glow sutil
- Altura mínima: 48px (móvil)
- Labels claros y siempre visibles

#### Agrupación
- Campos relacionados agrupados
- Espaciado: 16px entre grupos
- Validación inline

## Espaciado

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

## Tipografía

### Headings
- Font: Comfortaa (títulos principales)
- Tamaños: 2xl (32px), 3xl (48px), 4xl (64px)

### Body
- Font: DM Sans (cuerpo de texto)
- Tamaño base: 16px (móvil), 18px (desktop)
- Line height: 1.6

### Precios/Números importantes
- Font: Comfortaa
- Color: `--primary-gold`
- Tamaño: Más grande que texto normal

## Responsive

### Móvil (< 768px)
- Grids: 1 columna
- Botones: Full width
- Formularios: Stack vertical
- Cards: Menos padding, información esencial

### Tablet (768px - 1024px)
- Grids: 2 columnas
- Formularios: Pueden ser 2 columnas si es beneficioso

### Desktop (> 1024px)
- Grids: 3 columnas (sorteos)
- Formularios: 2 columnas cuando tiene sentido
- Contenedores: Max-width 1280px

## Optimización de Flujo de Compra

### Página Principal
1. Hero con CTA inmediato
2. Sorteos destacados (máximo 6)
3. Scroll mínimo antes del primer CTA

### Página de Compra
1. Información del sorteo (compacta)
2. Selector de boletos (visible arriba)
3. Formulario (siempre accesible, sticky si es necesario)
4. Método de pago (integrado)

### Eliminar
- Secciones que no aportan a la venta
- Contenido redundante
- Anidamiento innecesario
