'use client';

import { useState, useRef, useEffect } from 'react';

interface MaterialInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  variant?: 'filled' | 'outlined';
  autoFocus?: boolean;
  showSuccess?: boolean; // Mostrar indicador de éxito cuando el campo está completo y válido
}

/**
 * Componente de Input siguiendo estándares Material Design
 * - Altura mínima: 56dp (14rem)
 * - Etiqueta flotante
 * - Estados claros (inactivo, focado, error, deshabilitado)
 * - Soporte para dark theme con colores apropiados
 */
export function MaterialInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled = false,
  required = false,
  helperText,
  variant = 'filled',
  autoFocus = false,
  showSuccess = false,
}: MaterialInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(value.length > 0);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Determinar si la etiqueta debe estar flotante
  const isLabelFloating = isFocused || hasValue;

  // Determinar si mostrar el indicador de éxito (check verde)
  const showSuccessIndicator = showSuccess && hasValue && !error && !isFocused;

  // Clases base para el contenedor
  const containerBaseClasses = 'relative w-full';
  
  // Clases base para el input - Más compacto pero visible, optimizado para escritura rápida
  const inputBaseClasses = 'w-full px-4 pt-6 pb-2 text-base font-[var(--font-dm-sans)] transition-all duration-200 outline-none min-h-[50px] disabled:opacity-[0.38] disabled:cursor-not-allowed';

  // Estilos usando sistema de diseño unificado - Campos más resaltantes y visibles
  const filledClasses = [
    inputBaseClasses,
    'border-2',
    'rounded-xl',
    'text-[var(--text-primary)]',
    'placeholder-transparent',
    // Fondo más claro para que resalte - usa bg-elevated siempre y más claro en focus
    isFocused && !error ? 'bg-[#2F2540]' : 'bg-[#2A1F3D]', // Más claro que bg-secondary
    isFocused && !error ? 'border-[var(--primary-purple)]' : showSuccessIndicator ? 'border-green-500' : 'border-[rgba(168,62,245,0.3)]', // Borde más visible
    error ? 'border-[var(--error)] bg-[#2A1F3D]' : '',
    disabled ? 'border-dashed border-[var(--border-subtle)] opacity-[0.38] bg-[var(--bg-primary)]' : '',
    'hover:border-[rgba(168,62,245,0.5)] hover:bg-[#2F2540] transition-all duration-200',
    isFocused && !error ? 'shadow-[0_0_0_3px_rgba(168,62,245,0.2)]' : showSuccessIndicator ? 'shadow-[0_0_0_3px_rgba(34,197,94,0.15)]' : 'shadow-sm',
    showSuccessIndicator ? 'pr-12' : '', // Espacio para el icono de éxito
  ].filter(Boolean).join(' ');

  // Estilos para variant outlined - MÁS RESALTANTE y visible
  const outlinedClasses = [
    inputBaseClasses,
    'border-2',
    'rounded-xl',
    'text-[var(--text-primary)]',
    'placeholder-transparent',
    // Fondo más claro y visible - resalta sobre el fondo oscuro
    isFocused && !error ? 'bg-[#2F2540]' : 'bg-[#2A1F3D]', // Más claro para destacar
    isFocused && !error ? 'border-[var(--primary-purple)]' : showSuccessIndicator ? 'border-green-500' : 'border-[rgba(168,62,245,0.4)]', // Borde más visible siempre
    error ? 'border-[var(--error)] bg-[#2A1F3D]' : '',
    disabled ? 'border-dashed border-[var(--border-subtle)] opacity-[0.38] bg-[var(--bg-primary)]' : '',
    'hover:border-[rgba(168,62,245,0.6)] hover:bg-[#2F2540] transition-all duration-200',
    isFocused && !error ? 'shadow-[0_0_0_3px_rgba(168,62,245,0.25)]' : showSuccessIndicator ? 'shadow-[0_0_0_3px_rgba(34,197,94,0.15)]' : 'shadow-md',
    showSuccessIndicator ? 'pr-12' : '', // Espacio para el icono de éxito
  ].filter(Boolean).join(' ');

  const inputClasses = variant === 'filled' ? filledClasses : outlinedClasses;

  // Clases base para la etiqueta
  const labelBaseClasses = 'absolute left-4 font-[var(--font-dm-sans)] pointer-events-none transition-all duration-200 origin-top-left';

  const labelNormalClasses = [
    labelBaseClasses,
    'top-4',
    'text-[var(--text-secondary)]', // Más visible que muted
    'text-base',
    isLabelFloating ? 'opacity-0' : 'opacity-100',
  ].filter(Boolean).join(' ');

  const labelFloatingClasses = [
    labelBaseClasses,
    'top-2',
    'text-xs',
    'font-medium',
    isFocused && !error ? 'text-[var(--primary-purple)]' : '',
    error ? 'text-[var(--error)]' : '',
    !isFocused && !error ? 'text-[var(--text-secondary)]' : '',
    isLabelFloating ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
  ].filter(Boolean).join(' ');

  // Clases para el texto de ayuda/error
  const helperTextClasses = [
    'mt-1',
    'px-4',
    'text-xs',
    'font-[var(--font-dm-sans)]',
    error ? 'text-[var(--error)]' : 'text-[var(--text-muted)]',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerBaseClasses}>
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={isLabelFloating ? placeholder : ''}
          style={{ 
            color: 'var(--text-primary)',
            caretColor: 'var(--primary-purple)'
          }}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error || helperText ? `${id}-helper` : undefined}
        />

        {/* Etiqueta normal (cuando el campo está vacío) */}
        <label
          htmlFor={id}
          className={labelNormalClasses}
        >
          {label}
          {required && <span className="text-[var(--primary-purple)] ml-1">*</span>}
        </label>

        {/* Etiqueta flotante (cuando el campo tiene valor o está enfocado) */}
        <label
          htmlFor={id}
          className={labelFloatingClasses}
        >
          {label}
          {required && <span className="text-[var(--primary-purple)] ml-1">*</span>}
        </label>

        {/* Indicador de éxito (check verde) */}
        {showSuccessIndicator && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-in fade-in duration-200">
              <svg 
                className="w-4 h-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
        )}

      </div>


      {/* Texto de ayuda o error */}
      {(error || helperText) && (
        <div id={`${id}-helper`} className={helperTextClasses}>
          {error ? (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          ) : (
            <span>{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}

