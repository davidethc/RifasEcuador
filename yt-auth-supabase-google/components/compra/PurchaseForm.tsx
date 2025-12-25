'use client';

import { useState } from 'react';
import type { PurchaseFormData } from '@/types/purchase.types';

interface PurchaseFormProps {
  initialData?: Partial<PurchaseFormData>;
  onSubmit: (data: PurchaseFormData) => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
  quantity: number;
  totalAmount: number;
}

/**
 * Componente de formulario para datos personales del comprador
 * Incluye validación en tiempo real
 */
export function PurchaseForm({
  initialData,
  onSubmit,
  onBack,
  isLoading = false,
  quantity,
  totalAmount,
}: PurchaseFormProps) {
  const [formData, setFormData] = useState<PurchaseFormData>({
    name: initialData?.name || '',
    lastName: initialData?.lastName || '',
    whatsapp: initialData?.whatsapp || '',
    email: initialData?.email || '',
    confirmEmail: initialData?.confirmEmail || '',
    documentId: initialData?.documentId || '',
  });

  const [errors, setErrors] = useState<Partial<PurchaseFormData>>({});
  const [touched, setTouched] = useState<Set<keyof PurchaseFormData>>(new Set());

  // Validar un campo específico
  const validateField = (field: keyof PurchaseFormData, value: string): string | null => {
    switch (field) {
      case 'name':
        return !value.trim() ? 'El nombre es requerido' : null;
      
      case 'lastName':
        return !value.trim() ? 'El apellido es requerido' : null;
      
      case 'whatsapp':
        if (!value.trim()) return 'El número de WhatsApp es requerido';
        const cleaned = value.replace(/\s|-|\(|\)/g, '');
        const isValid = /^(\+?593)?[0-9]{9,10}$/.test(cleaned) || /^0[0-9]{9}$/.test(cleaned);
        return !isValid ? 'Formato inválido. Ej: +593 939039191 o 0939039191' : null;
      
      case 'email':
        if (!value.trim()) return 'El correo electrónico es requerido';
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Correo electrónico inválido' : null;
      
      case 'confirmEmail':
        if (!value.trim()) return 'Confirma tu correo electrónico';
        return value !== formData.email ? 'Los correos no coinciden' : null;
      
      default:
        return null;
    }
  };

  // Validar todo el formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<PurchaseFormData> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof PurchaseFormData>).forEach((field) => {
      if (field !== 'documentId') { // documentId es opcional
        const fieldValue = formData[field];
        // Asegurar que el valor sea string antes de validar
        if (typeof fieldValue === 'string') {
          const error = validateField(field, fieldValue);
          if (error) {
            newErrors[field] = error;
            isValid = false;
          }
        } else {
          // Si el campo es requerido y no tiene valor, es un error
          newErrors[field] = `El campo ${field} es requerido`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Manejar cambio en un campo
  const handleChange = (field: keyof PurchaseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched.has(field)) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }

    // Si es confirmEmail, también validar contra email
    if (field === 'confirmEmail' || field === 'email') {
      if (touched.has('confirmEmail')) {
        const confirmError = validateField(
          'confirmEmail',
          field === 'confirmEmail' ? value : formData.confirmEmail
        );
        setErrors((prev) => ({ ...prev, confirmEmail: confirmError || undefined }));
      }
    }
  };

  // Manejar blur (cuando sale del campo)
  const handleBlur = (field: keyof PurchaseFormData) => {
    setTouched((prev) => new Set(prev).add(field));
    const fieldValue = formData[field];
    // Asegurar que el valor sea string antes de validar
    const valueToValidate = typeof fieldValue === 'string' ? fieldValue : '';
    const error = validateField(field, valueToValidate);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched(
      new Set(Object.keys(formData) as Array<keyof PurchaseFormData>)
    );

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getInputClassName = (field: keyof PurchaseFormData) => {
    const baseClass =
      'w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-[var(--font-dm-sans)] transition-colors';
    
    if (errors[field] && touched.has(field)) {
      return `${baseClass} border-red-500 focus:border-red-600`;
    }
    
    if (formData[field] && !errors[field] && touched.has(field)) {
      return `${baseClass} border-green-500 focus:border-green-600`;
    }
    
    return `${baseClass} border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-amber-400`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 font-[var(--font-comfortaa)]">
          Completa tus datos
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
          Necesitamos tu información para procesar tu compra
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 font-[var(--font-dm-sans)]">
              Nombre(s) *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Ingresa tu nombre"
              className={getInputClassName('name')}
            />
            {errors.name && touched.has('name') && (
              <p className="text-sm text-red-500 mt-1 font-[var(--font-dm-sans)]">{errors.name}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 font-[var(--font-dm-sans)]">
              Apellido(s) *
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              placeholder="Ingresa tu apellido"
              className={getInputClassName('lastName')}
            />
            {errors.lastName && touched.has('lastName') && (
              <p className="text-sm text-red-500 mt-1 font-[var(--font-dm-sans)]">{errors.lastName}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 font-[var(--font-dm-sans)]">
              Número WhatsApp *
            </label>
            <input
              id="whatsapp"
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              onBlur={() => handleBlur('whatsapp')}
              placeholder="Ej: +593 939039191 o 0939039191"
              className={getInputClassName('whatsapp')}
            />
            {errors.whatsapp && touched.has('whatsapp') && (
              <p className="text-sm text-red-500 mt-1 font-[var(--font-dm-sans)]">{errors.whatsapp}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 font-[var(--font-dm-sans)]">
              Correo Electrónico *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="tu@email.com"
              className={getInputClassName('email')}
            />
            {errors.email && touched.has('email') && (
              <p className="text-sm text-red-500 mt-1 font-[var(--font-dm-sans)]">{errors.email}</p>
            )}
          </div>

          {/* Confirmar Email */}
          <div>
            <label htmlFor="confirmEmail" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 font-[var(--font-dm-sans)]">
              Confirma el Correo Electrónico *
            </label>
            <input
              id="confirmEmail"
              type="email"
              value={formData.confirmEmail}
              onChange={(e) => handleChange('confirmEmail', e.target.value)}
              onBlur={() => handleBlur('confirmEmail')}
              placeholder="Confirma tu correo"
              className={getInputClassName('confirmEmail')}
            />
            {errors.confirmEmail && touched.has('confirmEmail') && (
              <p className="text-sm text-red-500 mt-1 font-[var(--font-dm-sans)]">{errors.confirmEmail}</p>
            )}
          </div>

          {/* Documento de Identidad (Opcional) */}
          <div>
            <label htmlFor="documentId" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 font-[var(--font-dm-sans)]">
              Cédula/Documento de Identidad
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Opcional)</span>
            </label>
            <input
              id="documentId"
              type="text"
              value={formData.documentId}
              onChange={(e) => handleChange('documentId', e.target.value)}
              placeholder="Ej: 1234567890"
              className={getInputClassName('documentId')}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-[var(--font-dm-sans)]">
              Si no lo ingresas, Payphone lo solicitará durante el pago
            </p>
          </div>
        </div>

        {/* Columna derecha: Resumen */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-blue-200 dark:border-amber-400/50 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
              Resumen de la compra
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-[var(--font-dm-sans)]">
                <span className="text-gray-600 dark:text-gray-400">Cantidad de boletos:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm font-[var(--font-dm-sans)]">
                <span className="text-gray-600 dark:text-gray-400">Precio unitario:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice(totalAmount / quantity)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300 dark:border-gray-600 font-[var(--font-comfortaa)]">
                <span className="text-gray-900 dark:text-white">Total a pagar:</span>
                <span className="text-blue-600 dark:text-amber-400">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1 font-[var(--font-dm-sans)]">
                  Nota importante
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 font-[var(--font-dm-sans)]">
                  Tus números de boletos se asignarán automáticamente después de completar el pago. Los recibirás por correo y WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-[var(--font-dm-sans)]"
          >
            Volver
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-amber-400 dark:to-amber-500 text-white dark:text-gray-900 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-amber-500 dark:hover:to-amber-600 transition-all transform hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-[var(--font-dm-sans)] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <span>Continuar al pago</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}




