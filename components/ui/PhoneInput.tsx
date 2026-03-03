'use client';

import { useState, useEffect } from 'react';
import { MaterialInput } from './MaterialInput';
import { formatPhoneWhileTyping, normalizePhoneNumber, isValidEcuadorianPhone } from '@/utils/phoneFormatter';

interface PhoneInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  variant?: 'filled' | 'outlined';
  autoFocus?: boolean;
  showSuccess?: boolean; // Mostrar indicador de éxito cuando el campo está completo y válido
}

/**
 * Componente especializado para números telefónicos ecuatorianos
 * Formatea automáticamente mientras el usuario escribe
 * Acepta formatos comunes: 0939039191, 939039191, +593939039191, etc.
 * Muestra formato legible: +593 93 903 9191
 * Almacena formato normalizado: +593939039191
 */
export function PhoneInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  helperText,
  variant = 'filled',
  autoFocus = false,
  showSuccess = false,
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    // Inicializar con formato si hay valor
    return value ? formatPhoneWhileTyping(value) : '';
  });

  // Sincronizar displayValue cuando value cambia externamente
  useEffect(() => {
    if (value) {
      const formatted = formatPhoneWhileTyping(value);
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }

  }, [value]);

  const handleChange = (newValue: string) => {
    // formatPhoneWhileTyping extrae solo dígitos → evita duplicar +593 al borrar y reescribir
    const formatted = formatPhoneWhileTyping(newValue);
    setDisplayValue(formatted);
    const normalized = formatted ? normalizePhoneNumber(formatted) : '';
    onChange(normalized);
  };

  const handleBlurInternal = () => {
    // Al perder el foco, asegurar que el formato esté completo y correcto
    if (displayValue) {
      const normalized = normalizePhoneNumber(displayValue);
      if (normalized && isValidEcuadorianPhone(normalized)) {
        // Formatear correctamente
        const formatted = formatPhoneWhileTyping(normalized);
        setDisplayValue(formatted);
        // Asegurar que el valor almacenado esté normalizado
        onChange(normalized);
      }
    }

    if (onBlur) {
      onBlur();
    }
  };

  return (
    <MaterialInput
      id={id}
      label={label}
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlurInternal}
      placeholder="+593 93 903 9191"
      error={error}
      disabled={disabled}
      required={required}
      helperText={helperText}
      variant={variant}
      autoFocus={autoFocus}
      showSuccess={showSuccess}
    />
  );
}

