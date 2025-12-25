/**
 * Formatea un porcentaje para mostrar en la UI
 * - Si es menor a 1%, muestra 2 decimales (ej: 0.01%)
 * - Si es mayor o igual a 1%, muestra 1 decimal (ej: 1.5%)
 * - Si es 0, muestra "0.0%"
 */
export function formatPercentage(value: number): string {
  if (value === 0) {
    return '0.0%';
  }
  
  if (value < 1) {
    return `${value.toFixed(2)}%`;
  }
  
  return `${value.toFixed(1)}%`;
}

/**
 * Formatea un porcentaje sin el símbolo %
 */
export function formatPercentageValue(value: number): string {
  if (value === 0) {
    return '0.0';
  }
  
  if (value < 1) {
    return value.toFixed(2);
  }
  
  return value.toFixed(1);
}
