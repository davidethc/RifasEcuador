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

  // Clases base para el contenedor
  const containerBaseClasses = 'relative w-full';
  
  // Clases base para el input - Premium oscuro
  const inputBaseClasses = 'w-full px-4 pt-6 pb-2 text-base font-[var(--font-dm-sans)] transition-all duration-300 outline-none min-h-[52px] disabled:opacity-[0.38] disabled:cursor-not-allowed';

  // Estilos para variant filled - Vibrante con colores del logo (rosa, púrpura, azul)
  const filledClasses = [
    inputBaseClasses,
    'bg-[#1F1A2E]',
    'border-2',
    'rounded-xl',
    'text-[#FFFFFF]',
    'placeholder-transparent',
    isFocused && !error ? 'border-[#A83EF5]' : 'border-[#3A2F5A]',
    error ? 'border-[#DC2626]' : '',
    disabled ? 'border-dashed border-[#3A2F5A] opacity-[0.38] bg-[#1A1525]' : '',
    'hover:border-[#5A4A7A] transition-all duration-300',
    isFocused && !error ? 'shadow-[0_0_0_3px_rgba(168,62,245,0.2)]' : '',
  ].filter(Boolean).join(' ');

  // Estilos para variant outlined - Vibrante con colores del logo
  const outlinedClasses = [
    inputBaseClasses,
    'bg-[#1F1A2E]',
    'border-2',
    'rounded-xl',
    'text-[#FFFFFF]',
    'placeholder-transparent',
    isFocused && !error ? 'border-[#A83EF5]' : 'border-[#3A2F5A]',
    error ? 'border-[#DC2626]' : '',
    disabled ? 'border-dashed border-[#3A2F5A] opacity-[0.38] bg-[#1A1525]' : '',
    'hover:border-[#5A4A7A] transition-all duration-300',
    isFocused && !error ? 'shadow-[0_0_0_3px_rgba(168,62,245,0.2)]' : '',
  ].filter(Boolean).join(' ');

  const inputClasses = variant === 'filled' ? filledClasses : outlinedClasses;

  // Clases base para la etiqueta
  const labelBaseClasses = 'absolute left-4 font-[var(--font-dm-sans)] pointer-events-none transition-all duration-200 origin-top-left';

  const labelNormalClasses = [
    labelBaseClasses,
    'top-4',
    'text-[#B8A8D8]',
    'text-base',
    isLabelFloating ? 'opacity-0' : 'opacity-100',
  ].filter(Boolean).join(' ');

  const labelFloatingClasses = [
    labelBaseClasses,
    'top-2',
    'text-xs',
    'font-medium',
    isFocused && !error ? 'text-[#A83EF5]' : '',
    error ? 'text-[#DC2626]' : '',
    !isFocused && !error ? 'text-[#E5D4FF]' : '',
    isLabelFloating ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
  ].filter(Boolean).join(' ');

  // Clases para el texto de ayuda/error - Vibrante
  const helperTextClasses = [
    'mt-1',
    'px-4',
    'text-xs',
    'font-[var(--font-dm-sans)]',
    error ? 'text-[#DC2626]' : 'text-[#B8A8D8]',
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
            color: '#FFFFFF',
            caretColor: '#A83EF5'
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
          {required && <span className="text-[#A83EF5] ml-1">*</span>}
        </label>

        {/* Etiqueta flotante (cuando el campo tiene valor o está enfocado) */}
        <label
          htmlFor={id}
          className={labelFloatingClasses}
        >
          {label}
          {required && <span className="text-[#A83EF5] ml-1">*</span>}
        </label>

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

