'use client';

import { useState, useEffect, useRef } from 'react';
import { MaterialInput } from './MaterialInput';
import { normalizePhoneNumber, isValidEcuadorianPhone } from '@/utils/phoneFormatter';

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
   className?: string;
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
  className,
}: PhoneInputProps) {
  // Lo que se muestra al usuario: solo dígitos en formato local (ej: 0939039191)
  const toLocalDigits = (raw: string): string => {
    if (!raw) return '';
    const onlyDigits = raw.replace(/\D/g, '');
    if (!onlyDigits) return '';
    // Si viene en formato +5939XXXXXXXX, mostrar 0 + últimos 9 dígitos
    if (onlyDigits.startsWith('593') && onlyDigits.length >= 11) {
      return `0${onlyDigits.slice(3)}`;
    }
    return onlyDigits;
  };

  const [displayValue, setDisplayValue] = useState(() => {
    return value ? toLocalDigits(value) : '';
  });
  const lastSentRef = useRef<string>(value);

  // Sincronizar displayValue cuando value cambia externamente (load form, reset)
  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    // Mostrar siempre la versión local en dígitos, pero sin impedir que el usuario borre
    const local = toLocalDigits(value);
    if (value === lastSentRef.current) {
      setDisplayValue(local);
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    // Permitir escribir y borrar libremente: solo dejamos dígitos y longitud razonable
    const digits = newValue.replace(/\D/g, '');
    setDisplayValue(digits);

    // Normalizar para guardar/envíar al padre (formato +5939XXXXXXX)
    const normalized = digits ? normalizePhoneNumber(digits) : '';
    lastSentRef.current = normalized;
    onChange(normalized);
  };

  const handleBlurInternal = () => {
    // Al perder el foco, solo normalizamos/validamos internamente
    if (displayValue) {
      const normalized = normalizePhoneNumber(displayValue);
      if (normalized && isValidEcuadorianPhone(normalized)) {
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
      placeholder="0939039191"
      error={error}
      disabled={disabled}
      required={required}
      helperText={helperText}
      variant={variant}
      autoFocus={autoFocus}
      showSuccess={showSuccess}
      className={className}
    />
  );
}

