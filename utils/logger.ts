/**
 * Logger utility para desarrollo y producción
 * En producción, solo muestra errores críticos
 * En desarrollo, muestra todos los logs
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: unknown[]) => {
    // Errores siempre se muestran, pero en producción solo en desarrollo
    if (isDevelopment) {
      console.error(...args);
    } else {
      // En producción, podrías enviar a un servicio de logging
      // Por ahora, solo silenciamos
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
