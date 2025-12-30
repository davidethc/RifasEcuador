'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PurchaseFormData } from '@/types/purchase.types';
import { PaymentMethod } from './PaymentMethod';

interface PurchaseFormWithPaymentProps {
  initialData?: Partial<PurchaseFormData>;
  onSubmit: (data: PurchaseFormData) => Promise<string | null>;
  onBack?: () => void;
  isLoading?: boolean;
  quantity: number;
  totalAmount: number;
  raffleTitle: string;
  saleId: string | null;
  orderId: string | null;
  ticketNumbers: string[];
}

/**
 * Componente combinado que fusiona el formulario de datos y el método de pago
 * Muestra el formulario primero, y cuando se completa, muestra el método de pago
 */
export function PurchaseFormWithPayment({
  initialData,
  onSubmit,
  onBack,
  isLoading = false,
  quantity,
  totalAmount,
  raffleTitle,
  saleId,
  orderId,
  ticketNumbers,
}: PurchaseFormWithPaymentProps) {
  const router = useRouter();
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
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (typeof fieldValue === 'string') {
          const error = validateField(field, fieldValue);
          if (error) {
            newErrors[field] = error;
            isValid = false;
          }
        } else {
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
    
    if (touched.has(field)) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }

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
    const valueToValidate = typeof fieldValue === 'string' ? fieldValue : '';
    const error = validateField(field, valueToValidate);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched(
      new Set(Object.keys(formData) as Array<keyof PurchaseFormData>)
    );

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newSaleId = await onSubmit(formData);
      if (newSaleId) {
        setIsFormSubmitted(true);
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      'w-full px-4 py-3.5 text-base border rounded-lg focus:outline-none font-[var(--font-dm-sans)] transition-all duration-200';
    
    if (errors[field] && touched.has(field)) {
      return `${baseClass} border-red-500/50 bg-[#1A0F0F] text-red-100 placeholder-red-400/40 focus:border-red-400`;
    }
    
    if (formData[field] && !errors[field] && touched.has(field)) {
      return `${baseClass} border-green-500/40 bg-[#0F1A0F] text-green-50 placeholder-green-400/30 focus:border-green-400`;
    }
    
    return `${baseClass} border-[#2C2F4A] bg-[#0F1328] text-[#EDEDED] placeholder-[#6B7280]`;
  };

  const getInputStyle = (field: keyof PurchaseFormData) => {
    return {};
  };

  // Mostrar formulario y método de pago en la misma vista
  return (
    <div className="space-y-6">
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Columna izquierda: Formulario - Integrado al mismo universo visual */}
        <div className={`rounded-lg border ${isFormSubmitted ? 'border-green-500/30 opacity-75' : 'border-white/10'} p-6 md:p-8 space-y-6 transition-all duration-300`} style={{ 
          backgroundColor: 'rgba(28, 32, 58, 0.6)', 
          borderColor: isFormSubmitted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#F9FAFB] mb-3 font-[var(--font-dm-sans)] tracking-wide">
              Nombre(s) <span className="text-red-400 font-bold">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ingresa tu nombre"
              disabled={isFormSubmitted}
              className={getInputClassName('name')}
              style={getInputStyle('name')}
              onFocus={(e) => {
                if (!errors.name) {
                  e.currentTarget.style.borderColor = '#8F6AE1';
                  e.currentTarget.style.outline = 'none';
                }
              }}
              onBlur={(e) => {
                handleBlur('name');
                if (!errors.name) {
                  e.currentTarget.style.borderColor = formData.name ? 'rgba(34, 197, 94, 0.4)' : '#2C2F4A';
                }
              }}
            />
            {errors.name && touched.has('name') && (
              <p className="text-sm mt-2.5 font-[var(--font-dm-sans)] flex items-center gap-2" style={{ color: '#FCA5A5' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-[#F9FAFB] mb-3 font-[var(--font-dm-sans)] tracking-wide">
              Apellido(s) <span className="text-red-400 font-bold">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Ingresa tu apellido"
              disabled={isFormSubmitted}
              className={getInputClassName('lastName')}
              style={getInputStyle('lastName')}
              onFocus={(e) => {
                if (!errors.lastName) {
                  e.currentTarget.style.borderColor = '#8F6AE1';
                  e.currentTarget.style.outline = 'none';
                }
              }}
              onBlur={(e) => {
                handleBlur('lastName');
                if (!errors.lastName) {
                  e.currentTarget.style.borderColor = formData.lastName ? 'rgba(34, 197, 94, 0.4)' : '#2C2F4A';
                }
              }}
            />
            {errors.lastName && touched.has('lastName') && (
              <p className="text-sm mt-2.5 font-[var(--font-dm-sans)] flex items-center gap-2" style={{ color: '#FCA5A5' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.lastName}</span>
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-semibold text-[#F9FAFB] mb-3 font-[var(--font-dm-sans)] tracking-wide">
              Número WhatsApp <span className="text-red-400 font-bold">*</span>
            </label>
            <input
              id="whatsapp"
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="Ej: +593 939039191 o 0939039191"
              disabled={isFormSubmitted}
              className={getInputClassName('whatsapp')}
              style={getInputStyle('whatsapp')}
              onFocus={(e) => {
                if (!errors.whatsapp) {
                  e.currentTarget.style.borderColor = '#8F6AE1';
                  e.currentTarget.style.outline = 'none';
                }
              }}
              onBlur={(e) => {
                handleBlur('whatsapp');
                if (!errors.whatsapp) {
                  e.currentTarget.style.borderColor = formData.whatsapp ? 'rgba(34, 197, 94, 0.4)' : '#2C2F4A';
                }
              }}
            />
            {errors.whatsapp && touched.has('whatsapp') && (
              <p className="text-sm mt-2.5 font-[var(--font-dm-sans)] flex items-center gap-2" style={{ color: '#FCA5A5' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.whatsapp}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#F9FAFB] mb-3 font-[var(--font-dm-sans)] tracking-wide">
              Correo Electrónico <span className="text-red-400 font-bold">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@email.com"
              disabled={isFormSubmitted}
              className={getInputClassName('email')}
              style={getInputStyle('email')}
              onFocus={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = '#8F6AE1';
                  e.currentTarget.style.outline = 'none';
                }
              }}
              onBlur={(e) => {
                handleBlur('email');
                if (!errors.email) {
                  e.currentTarget.style.borderColor = formData.email ? 'rgba(34, 197, 94, 0.4)' : '#2C2F4A';
                }
              }}
            />
            {errors.email && touched.has('email') && (
              <p className="text-sm mt-2.5 font-[var(--font-dm-sans)] flex items-center gap-2" style={{ color: '#FCA5A5' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Confirmar Email */}
          <div>
            <label htmlFor="confirmEmail" className="block text-sm font-semibold text-[#F9FAFB] mb-3 font-[var(--font-dm-sans)] tracking-wide">
              Confirma el Correo Electrónico <span className="text-red-400 font-bold">*</span>
            </label>
            <input
              id="confirmEmail"
              type="email"
              value={formData.confirmEmail}
              onChange={(e) => handleChange('confirmEmail', e.target.value)}
              placeholder="Confirma tu correo"
              disabled={isFormSubmitted}
              className={getInputClassName('confirmEmail')}
              style={getInputStyle('confirmEmail')}
              onFocus={(e) => {
                if (!errors.confirmEmail) {
                  e.currentTarget.style.borderColor = '#8F6AE1';
                  e.currentTarget.style.outline = 'none';
                }
              }}
              onBlur={(e) => {
                handleBlur('confirmEmail');
                if (!errors.confirmEmail) {
                  e.currentTarget.style.borderColor = formData.confirmEmail ? 'rgba(34, 197, 94, 0.4)' : '#2C2F4A';
                }
              }}
            />
            {errors.confirmEmail && touched.has('confirmEmail') && (
              <p className="text-sm mt-2.5 font-[var(--font-dm-sans)] flex items-center gap-2" style={{ color: '#FCA5A5' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.confirmEmail}</span>
              </p>
            )}
          </div>

          {/* Documento de Identidad (Opcional) */}
          <div>
            <label htmlFor="documentId" className="block text-sm font-semibold text-[#F9FAFB] mb-3 font-[var(--font-dm-sans)] tracking-wide">
              Cédula/Documento de Identidad
              <span className="text-xs text-[#9CA3AF] ml-2 font-normal">(Opcional)</span>
            </label>
            <input
              id="documentId"
              type="text"
              value={formData.documentId}
              onChange={(e) => handleChange('documentId', e.target.value)}
              placeholder="Ej: 1234567890"
              disabled={isFormSubmitted}
              className={getInputClassName('documentId')}
              style={getInputStyle('documentId')}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#8F6AE1';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = formData.documentId ? 'rgba(34, 197, 94, 0.4)' : '#2C2F4A';
              }}
            />
            <p className="text-xs text-[#9CA3AF] mt-2 font-[var(--font-dm-sans)]">
              Si no lo ingresas, Payphone lo solicitará durante el pago
            </p>
          </div>
        </div>

          {/* Columna derecha: Resumen - Zona segura de pago */}
        <div className="space-y-6">
          <div className="rounded-lg border p-6 md:p-8 transition-all duration-300" style={{ 
            background: 'rgba(28, 32, 58, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 className="text-xl font-bold mb-6 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
              Resumen de la compra
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-[var(--font-dm-sans)] pb-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span style={{ color: '#9CA3AF' }}>Cantidad de boletos:</span>
                <span className="font-semibold" style={{ color: '#E5E7EB' }}>{quantity}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-[var(--font-dm-sans)] pb-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span style={{ color: '#9CA3AF' }}>Precio unitario:</span>
                <span className="font-medium" style={{ color: '#E5E7EB' }}>
                  {formatPrice(totalAmount / quantity)}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-4 border-t font-[var(--font-comfortaa)]" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                <span style={{ color: '#E5E7EB' }}>Total a pagar:</span>
                <span className="font-bold text-2xl" style={{ color: '#FFB200' }}>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-5 border" style={{ 
            background: 'rgba(15, 17, 23, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                background: 'rgba(168, 62, 245, 0.15)',
                border: '1px solid rgba(168, 62, 245, 0.2)'
              }}>
                <svg className="w-5 h-5" style={{ color: '#A83EF5' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2 font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                  Nota importante
                </p>
                <p className="text-xs leading-relaxed font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                  Tus números de boletos se asignarán automáticamente después de completar el pago. Los recibirás por correo y WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción - Solo mostrar si el formulario no ha sido enviado */}
      {!isFormSubmitted && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting || isLoading}
              className="px-8 py-4 md:py-3 text-base md:text-lg border-2 rounded-xl font-bold transition-all font-[var(--font-dm-sans)] min-h-[48px] text-white hover:bg-[#2A2D45]"
              style={{ borderColor: '#2A2D45' }}
            >
              Volver
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-8 py-4 text-base rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-[var(--font-dm-sans)] flex items-center justify-center gap-2 min-h-[48px] w-full"
            style={{
              background: 'linear-gradient(135deg, #F2C94C, #F2994A)',
              color: '#1A1A1A',
              border: 'none',
              boxShadow: '0 4px 12px rgba(242, 201, 76, 0.25)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && !isLoading) {
                e.currentTarget.style.filter = 'brightness(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(242, 201, 76, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(242, 201, 76, 0.25)';
            }}
          >
            {(isSubmitting || isLoading) ? (
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
      )}
    </form>

    {/* Mostrar método de pago cuando el formulario esté completado */}
    {isFormSubmitted && saleId && (
      <div className="space-y-6 mt-8">
        {/* Mostrar números reservados */}
        {ticketNumbers.length > 0 && (
          <div className="max-w-4xl mx-auto bg-[rgba(34,197,94,0.1)] rounded-2xl border border-green-800/30 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-xl font-bold text-white font-[var(--font-comfortaa)]">
                  ¡Tus números han sido reservados!
                </h3>
                <p className="text-sm text-green-200 font-[var(--font-dm-sans)]">
                  Estos números están reservados por 10 minutos. Completa el pago para confirmarlos.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {ticketNumbers.map((num) => (
                <div
                  key={num}
                  className="px-4 py-2 bg-[#1A1C28] border border-green-500/50 rounded-lg font-bold text-lg font-[var(--font-comfortaa)] shadow-md hover:scale-105 transition-transform text-white"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        <PaymentMethod
          orderId={orderId ?? undefined}
          amount={totalAmount}
          customerData={formData}
          raffleTitle={raffleTitle}
          onSuccess={() => {
            router.push(`/comprar/${saleId}/confirmacion`);
          }}
          onError={(error) => {
            console.error('Error en pago:', error);
          }}
        />

        {/* Botón para volver a editar datos */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsFormSubmitted(false)}
            className="text-[#8B8FAF] transition-colors font-[var(--font-dm-sans)] flex items-center gap-2 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Editar datos</span>
          </button>
        </div>
      </div>
    )}
    </div>
  );
}
