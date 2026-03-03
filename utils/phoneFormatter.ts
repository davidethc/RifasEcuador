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
 * Usa SOLO dígitos para evitar duplicar +593 cuando el usuario borra y reescribe
 *
 * @param input - El valor que el usuario está escribiendo
 * @returns El número formateado para mostrar: +593 XX XXX XXXX
 */
export function formatPhoneWhileTyping(input: string): string {
  // Extraer SOLO dígitos (0-9) - evita que "+" u otros caracteres causen duplicados
  const digitsOnly = input.replace(/\D/g, '');
  if (digitsOnly.length === 0) {
    return '';
  }
  // Obtener los 9 dígitos locales (Ecuador)
  let localDigits: string;
  if (digitsOnly.startsWith('593') && digitsOnly.length > 3) {
    localDigits = digitsOnly.substring(3, 12);
  } else if (digitsOnly.startsWith('0') && digitsOnly.length > 1) {
    localDigits = digitsOnly.substring(1, 10);
  } else {
    localDigits = digitsOnly.substring(0, 9);
  }
  // Máximo 9 dígitos
  localDigits = localDigits.substring(0, 9);
  if (localDigits.length === 0) {
    return '';
  }
  // Formato: +593 XX XXX XXXX
  let formatted = '+593';
  if (localDigits.length > 0) {
    formatted += ' ' + localDigits.substring(0, 2);
  }
  if (localDigits.length > 2) {
    formatted += ' ' + localDigits.substring(2, 5);
  }
  if (localDigits.length > 5) {
    formatted += ' ' + localDigits.substring(5, 9);
  }
  return formatted.trim();
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

