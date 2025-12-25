/**
 * Constantes y utilidades compartidas para responsividad
 * Evita duplicar clases responsive en cada componente
 */

// Spacing responsive estándar
export const spacing = {
  container: 'px-4 sm:px-6 lg:px-8',
  section: 'py-12 px-4 sm:px-6 lg:px-8',
  page: 'min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8',
} as const;

// Breakpoints estándar (para referencia)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

// Grid responsive estándar
export const grid = {
  cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
  items: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
} as const;
