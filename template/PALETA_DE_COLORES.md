# 🎨 Paleta de Colores del Template

## 📋 Índice
1. [Colores de Fondo](#colores-de-fondo)
2. [Colores de Texto](#colores-de-texto)
3. [Colores de Botones](#colores-de-botones)
4. [Colores de Componentes](#colores-de-componentes)
5. [Gradientes](#gradientes)
6. [Bordes y Líneas](#bordes-y-líneas)
7. [Colores Especiales](#colores-especiales)

---

## 🎨 Colores de Fondo

### Fondos Principales

| Color | Hex | RGB | Uso |
|-------|-----|-----|-----|
| **Fondo Principal** | `#100235` | rgb(16, 2, 53) | Fondo general del body y sección main |
| **Fondo Morado Oscuro** | `#360254` | rgb(54, 2, 84) | Sección top, modales, gradientes |
| **Fondo Morado Claro** | `#683DF5` | rgb(104, 61, 245) | Sección main bg, FAQ, cards, números disponibles |
| **Fondo Morado Alternativo** | `#5A0B5C` | rgb(90, 11, 92) | SVG en checkout y thanks |
| **Fondo Rosa/Magenta** | `#b92163` | rgb(185, 33, 99) | Hero section (base del gradiente) |

### Fondos de Secciones Específicas

| Sección | Color | Hex |
|---------|-------|-----|
| **Hero Section** | Gradiente | `#b92163` → `#360254` |
| **Hero Checkout** | Gradiente | `#b92163` → `#360254` |
| **Sección Prize** | Gradiente | `#100235` → `#360254` |
| **Coming Soon Overlay** | Morado con opacidad | `#683DF5` (opacity: 0.7) |

---

## 📝 Colores de Texto

| Color | Hex | RGB | Uso |
|-------|-----|-----|-----|
| **Texto Principal** | `#fff` | rgb(255, 255, 255) | Texto general (blanco) |
| **Texto Destacado** | `#FFB200` | rgb(255, 178, 0) | Títulos destacados (clase `.t1`), texto en números vendidos |
| **Texto Oscuro** | `#000` | rgb(0, 0, 0) | Texto en algunos elementos (checkout) |

### Aplicación de Textos

- **Todos los párrafos y títulos (h1-h6)**: `#fff` (blanco)
- **Títulos destacados (`.t1`)**: `#FFB200` (amarillo/dorado)
- **Números vendidos (`.sold`)**: `#FFB200` sobre fondo `#A83EF5`

---

## 🔘 Colores de Botones

### Botón Principal (`.b1`)

| Estado | Color/Gradiente | Hex |
|--------|----------------|-----|
| **Fondo** | Gradiente | `#ffb200` → `#f02080` |
| **Texto** | `#fff` | rgb(255, 255, 255) |

**Uso**: Botones principales como "Participa Ahora", "COMPRAR NÚMERO(s)"

### Botón Secundario (`.b2`)

| Propiedad | Color | Hex |
|-----------|-------|-----|
| **Fondo** | `#A83EF5` | rgb(168, 62, 245) |
| **Texto** | `#fff` | rgb(255, 255, 255) |

**Uso**: Botón de video en hero section

---

## 🧩 Colores de Componentes

### Números (Selector de Números)

| Estado | Fondo | Texto | Hex Fondo | Hex Texto |
|--------|-------|-------|-----------|-----------|
| **Disponible** | `#683DF5` | `#fff` | rgb(104, 61, 245) | rgb(255, 255, 255) |
| **Vendido (`.sold`)** | `#A83EF5` | `#FFB200` | rgb(168, 62, 245) | rgb(255, 178, 0) |
| **Checkout (`.numbers`)** | `orange` | `#fff` | orange | rgb(255, 255, 255) |

**Bordes**: `1px solid #fff` (blanco)

### Barra de Progreso

| Propiedad | Color | Hex |
|-----------|-------|-----|
| **Fondo de la barra** | `#EC6624` | rgb(236, 102, 36) |

### Cards y Modales

| Componente | Fondo | Texto |
|------------|-------|-------|
| **Modal Content (`.bg`)** | `#360254` | `#fff` |
| **FAQ Cards (`.bgFaq`)** | `#683DF5` | `#fff` |
| **Card de Tickets Vendidos** | `#683DF5` | `#fff` |

### Iconos de Pago

| Color | Hex | RGB | Uso |
|-------|-----|-----|-----|
| **Azul Payphone** | `#128ECE` | rgb(18, 142, 206) | Iconos SVG de métodos de pago |

---

## 🌈 Gradientes

### Gradientes Lineales

1. **Hero Section**
   ```css
   linear-gradient(0deg, #b92163 0%, #360254 100%)
   ```
   - Dirección: 0deg (de abajo hacia arriba)
   - De: `#b92163` (rosa/magenta)
   - A: `#360254` (morado oscuro)

2. **Botón Principal (`.b1`)**
   ```css
   linear-gradient(0deg, #ffb200 0%, #f02080 100%)
   ```
   - Dirección: 0deg (de abajo hacia arriba)
   - De: `#ffb200` (amarillo/dorado)
   - A: `#f02080` (rosa/magenta)

3. **Sección Prize**
   ```css
   linear-gradient(0deg, #100235 0%, #360254 100%)
   ```
   - Dirección: 0deg (de abajo hacia arriba)
   - De: `#100235` (fondo principal)
   - A: `#360254` (morado oscuro)

---

## 🔲 Bordes y Líneas

| Elemento | Estilo | Color | Hex |
|----------|--------|-------|-----|
| **Números disponibles** | `1px solid` | `#fff` | rgb(255, 255, 255) |
| **Bordes de pago (checkout)** | `2px solid` | `#000` | rgb(0, 0, 0) |
| **Líneas divisorias (hr)** | `1px solid` | `#fff` | rgb(255, 255, 255) |

---

## ✨ Colores Especiales

### Colores de Bootstrap (Coming Soon)

El archivo `coming_soon.css` incluye variables de Bootstrap:

| Variable | Color | Hex |
|----------|-------|-----|
| `--bs-primary` | Verde azulado | `#2a5555` |
| `--bs-link-color` | Verde azulado | `#2a5555` |
| `--bs-link-hover-color` | Verde azulado oscuro | `#224444` |
| `--bs-code-color` | Rosa | `#d63384` |
| `--bs-highlight-bg` | Amarillo claro | `#fff3cd` |

### Colores Adicionales

| Color | Hex | RGB | Uso |
|-------|-----|-----|-----|
| **Naranja (orange)** | `orange` | - | Números en checkout |
| **Blanco** | `#fff` | rgb(255, 255, 255) | Texto, bordes, fondos de contraste |
| **Negro** | `#000` | rgb(0, 0, 0) | Bordes en elementos de pago |

---

## 📊 Resumen de Colores Principales

### Colores Primarios
- **Morado Oscuro**: `#360254`
- **Morado Claro**: `#683DF5`
- **Morado Alternativo**: `#5A0B5C`
- **Fondo Principal**: `#100235`

### Colores Secundarios
- **Rosa/Magenta**: `#b92163`, `#f02080`
- **Amarillo/Dorado**: `#FFB200`, `#ffb200`
- **Naranja**: `#EC6624`, `orange`
- **Azul**: `#128ECE`

### Colores Neutros
- **Blanco**: `#fff`
- **Negro**: `#000`

---

## 🎯 Guía de Uso Rápido

### Para Fondos
```css
background: #100235;        /* Fondo principal */
background: #360254;        /* Fondo morado oscuro */
background: #683DF5;        /* Fondo morado claro */
```

### Para Textos
```css
color: #fff;                /* Texto principal */
color: #FFB200;            /* Texto destacado */
```

### Para Botones
```css
/* Botón principal */
background: linear-gradient(0deg, #ffb200 0%, #f02080 100%);
color: #fff;

/* Botón secundario */
background: #A83EF5;
color: #fff;
```

### Para Componentes
```css
/* Números disponibles */
background: #683DF5;
color: #fff;
border: 1px solid #fff;

/* Números vendidos */
background: #A83EF5;
color: #FFB200;

/* Barra de progreso */
background: #EC6624;
```

---

## 📝 Notas

- Todos los colores de texto principales son **blanco** (`#fff`) para mantener contraste sobre fondos oscuros
- Los gradientes se aplican principalmente en secciones hero y botones principales
- El color `#FFB200` se usa para destacar información importante
- Los modales y cards usan principalmente `#360254` y `#683DF5` como fondos
- Los bordes son principalmente blancos (`#fff`) para mantener la coherencia visual

---

**Última actualización**: Febrero 2025
**Template**: RifaManía




