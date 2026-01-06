/**
 * Utilidades para formatear números telefónicos ecuatorianos
 * Convierte diferentes formatos de entrada al formato estándar: +593 XX XXX XXXX
 */

/**
 * Limpia un número telefónico removiendo espacios, guiones, paréntesis, etc.
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '');
}

/**
 * Normaliza un número telefónico ecuatoriano a formato estándar sin espacios
 * Formato de salida: +593XXXXXXXXX (13 caracteres)
 * 
 * Acepta formatos de entrada:
 * - 0939039191 → +593939039191
 * - 939039191 → +593939039191
 * - +593939039191 → +593939039191
 * - 593939039191 → +593939039191
 * - +593 93 903 9191 → +593939039191
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = cleanPhoneNumber(phone);
  
  // Si empieza con +593, usar tal cual
  if (cleaned.startsWith('+593')) {
    cleaned = cleaned.substring(4); // Remover +593
  } 
  // Si empieza con 593, remover el 593
  else if (cleaned.startsWith('593')) {
    cleaned = cleaned.substring(3);
  } 
  // Si empieza con 0, remover el 0
  else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Validar que tenga 9 dígitos (número local ecuatoriano)
  if (!/^\d{9}$/.test(cleaned)) {
    return phone; // Retornar original si no es válido
  }
  
  // Retornar en formato +593XXXXXXXXX
  return `+593${cleaned}`;
}

/**
 * Formatea un número telefónico para mostrar (con espacios)
 * Formato de salida: +593 XX XXX XXXX
 * 
 * Ejemplo: +593939039191 → +593 93 903 9191
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  
  // Si no se pudo normalizar, retornar original
  if (!normalized.startsWith('+593') || normalized.length !== 13) {
    return phone;
  }
  
  // Extraer los 9 dígitos después de +593
  const digits = normalized.substring(4);
  
  // Formatear: +593 XX XXX XXXX
  return `+593 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
}

/**
 * Formatea un número telefónico mientras el usuario escribe
 * Permite escribir en cualquier formato y lo formatea automáticamente
 * 
 * @param input - El valor que el usuario está escribiendo
 * @returns El número formateado para mostrar: +593 XX XXX XXXX
 */
export function formatPhoneWhileTyping(input: string): string {
  // Si está vacío, retornar vacío
  if (!input.trim()) {
    return '';
  }
  
  // Limpiar el input (remover espacios, guiones, paréntesis) pero mantener el orden
  const cleaned = cleanPhoneNumber(input);
  
  // Si el usuario está borrando, permitir que borre
  if (cleaned.length === 0) {
    return '';
  }
  
  // Detectar si el usuario escribió un +
  const hasPlus = input.includes('+');
  
  // CASO ESPECIAL: Si el usuario está escribiendo "0" al inicio, permitirlo
  // Solo formatear cuando tenga al menos 2 dígitos después del "0"
  if (cleaned === '0' || (cleaned.startsWith('0') && cleaned.length < 3)) {
    // Permitir escribir "0" o "09" sin formatear aún
    return cleaned;
  }
  
  // Extraer solo los dígitos del número local (9 dígitos)
  let localDigits = '';
  
  if (cleaned.startsWith('+593')) {
    // Ya tiene +593, extraer solo los 9 dígitos después
    localDigits = cleaned.substring(4);
  } else if (cleaned.startsWith('593')) {
    // Tiene 593 sin +, extraer los 9 dígitos después
    localDigits = cleaned.substring(3);
  } else if (cleaned.startsWith('0') && cleaned.length >= 3) {
    // Empieza con 0 y tiene al menos 3 dígitos (ej: "093"), remover el 0
    localDigits = cleaned.substring(1);
  } else {
    // No tiene código de país, asumir que son los dígitos locales
    localDigits = cleaned;
  }
  
  // Limitar a 9 dígitos (número local ecuatoriano)
  if (localDigits.length > 9) {
    localDigits = localDigits.substring(0, 9);
  }
  
  // Si no hay dígitos locales, retornar solo el + si estaba
  if (localDigits.length === 0) {
    return hasPlus ? '+' : '';
  }
  
  // Formatear siempre con +593 y espacios: +593 XX XXX XXXX
  let formatted = '+593';
  
  if (localDigits.length > 0) {
    formatted += ' ' + localDigits.substring(0, Math.min(2, localDigits.length));
  }
  if (localDigits.length > 2) {
    formatted += ' ' + localDigits.substring(2, Math.min(5, localDigits.length));
  }
  if (localDigits.length > 5) {
    formatted += ' ' + localDigits.substring(5, Math.min(9, localDigits.length));
  }
  
  return formatted;
}

/**
 * Valida si un número telefónico ecuatoriano es válido
 */
export function isValidEcuadorianPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return normalized.startsWith('+593') && normalized.length === 13 && /^\d+$/.test(normalized.substring(1));
}

/**
 * Obtiene el número en formato para Payphone (sin espacios)
 * Formato: +593XXXXXXXXX
 */
export function getPhoneForPayphone(phone: string): string {
  return normalizePhoneNumber(phone);
}

