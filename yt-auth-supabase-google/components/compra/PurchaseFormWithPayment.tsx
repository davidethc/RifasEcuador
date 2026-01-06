'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import type { PurchaseFormData } from '@/types/purchase.types';
import { PaymentMethod } from './PaymentMethod';
import { MaterialInput } from '../ui/MaterialInput';
import { PhoneInput } from '../ui/PhoneInput';
import { normalizePhoneNumber, isValidEcuadorianPhone } from '@/utils/phoneFormatter';

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
  // const router = useRouter();
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
        const normalized = normalizePhoneNumber(value);
        const isValid = isValidEcuadorianPhone(normalized);
        return !isValid ? 'Formato inválido. Ej: 0939039191 o +593 93 903 9191' : null;

      case 'email':
        if (!value.trim()) return 'El correo electrónico es requerido';
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Correo electrónico inválido' : null;

      case 'confirmEmail':
        if (!value.trim()) return 'Confirma tu correo electrónico';
        return value !== formData.email ? 'Los correos no coinciden' : null;

      case 'documentId':
        if (!value.trim()) return 'La cédula de identidad es requerida';
        // Validar que sea numérico y tenga entre 10 y 13 dígitos (cédula ecuatoriana o pasaporte)
        const docNumber = value.replace(/\D/g, '');
        if (docNumber.length < 10 || docNumber.length > 13) {
          return 'La cédula debe tener entre 10 y 13 dígitos';
        }
        return null;

      default:
        return null;
    }
  };

  // Validar todo el formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<PurchaseFormData> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof PurchaseFormData>).forEach((field) => {
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


  // Mostrar formulario y método de pago en la misma vista
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Columna izquierda: Formulario - Integrado al mismo universo visual */}
          <div className={`rounded-2xl border ${isFormSubmitted ? 'border-green-500/30 opacity-75' : 'border-[#3A2F5A]'} p-6 md:p-8 space-y-6 transition-all duration-300`} style={{
            background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
            borderColor: isFormSubmitted ? 'rgba(34, 197, 94, 0.3)' : '#3A2F5A',
            boxShadow: '0 20px 60px rgba(168, 62, 245, 0.2), 0 0 40px rgba(240, 32, 128, 0.1)'
          }}>
            {/* Nombre */}
            <MaterialInput
              id="name"
              label="Nombre(s)"
              type="text"
              value={formData.name}
              onChange={(value) => handleChange('name', value)}
              onBlur={() => handleBlur('name')}
              placeholder="Ingresa tu nombre"
              disabled={isFormSubmitted}
              required
              error={errors.name && touched.has('name') ? errors.name : undefined}
              variant="outlined"
            />

            {/* Apellido */}
            <MaterialInput
              id="lastName"
              label="Apellido(s)"
              type="text"
              value={formData.lastName}
              onChange={(value) => handleChange('lastName', value)}
              onBlur={() => handleBlur('lastName')}
              placeholder="Ingresa tu apellido"
              disabled={isFormSubmitted}
              required
              error={errors.lastName && touched.has('lastName') ? errors.lastName : undefined}
              variant="outlined"
            />

            {/* WhatsApp */}
            <PhoneInput
              id="whatsapp"
              label="Número WhatsApp"
              value={formData.whatsapp}
              onChange={(value) => handleChange('whatsapp', value)}
              onBlur={() => handleBlur('whatsapp')}
              disabled={isFormSubmitted}
              required
              error={errors.whatsapp && touched.has('whatsapp') ? errors.whatsapp : undefined}
              variant="outlined"
            />

            {/* Email */}
            <MaterialInput
              id="email"
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              onBlur={() => handleBlur('email')}
              placeholder="tu@email.com"
              disabled={isFormSubmitted}
              required
              error={errors.email && touched.has('email') ? errors.email : undefined}
              variant="outlined"
            />

            {/* Confirmar Email */}
            <MaterialInput
              id="confirmEmail"
              label="Confirma el Correo Electrónico"
              type="email"
              value={formData.confirmEmail}
              onChange={(value) => handleChange('confirmEmail', value)}
              onBlur={() => handleBlur('confirmEmail')}
              placeholder="Confirma tu correo"
              disabled={isFormSubmitted}
              required
              error={errors.confirmEmail && touched.has('confirmEmail') ? errors.confirmEmail : undefined}
              variant="outlined"
            />

            {/* Documento de Identidad */}
            <MaterialInput
              id="documentId"
              label="Cédula/Documento de Identidad"
              type="text"
              value={formData.documentId || ''}
              onChange={(value) => handleChange('documentId', value)}
              onBlur={() => handleBlur('documentId')}
              placeholder="Ej: 1234567890"
              disabled={isFormSubmitted}
              required
              error={errors.documentId && touched.has('documentId') ? errors.documentId : undefined}
              variant="outlined"
            />
          </div>

          {/* Columna derecha: Resumen - Zona segura de pago */}
          <div className="space-y-6">
            <div className="rounded-2xl border p-6 md:p-8 transition-all duration-300" style={{
              background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
              borderColor: '#3A2F5A',
              boxShadow: '0 20px 60px rgba(168, 62, 245, 0.2), 0 0 40px rgba(240, 32, 128, 0.1)'
            }}>
              <h3 className="text-xl font-bold mb-6 font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
                Resumen de la compra
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-[var(--font-dm-sans)] pb-3 border-b" style={{ borderColor: '#3A2F5A' }}>
                  <span style={{ color: '#E5D4FF' }}>Cantidad de boletos:</span>
                  <span className="font-semibold" style={{ color: '#FFFFFF' }}>{quantity}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-[var(--font-dm-sans)] pb-3 border-b" style={{ borderColor: '#3A2F5A' }}>
                  <span style={{ color: '#E5D4FF' }}>Precio unitario:</span>
                  <span className="font-medium" style={{ color: '#FFFFFF' }}>
                    {formatPrice(totalAmount / quantity)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-4 border-t font-[var(--font-comfortaa)]" style={{ borderColor: '#3A2F5A' }}>
                  <span style={{ color: '#FFFFFF' }}>Total a pagar:</span>
                  <span className="font-bold text-2xl" style={{ color: '#A83EF5' }}>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{
              background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
              borderColor: '#3A2F5A',
              boxShadow: '0 10px 30px rgba(168, 62, 245, 0.15)'
            }}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: 'rgba(168, 62, 245, 0.2)',
                  border: '1px solid rgba(168, 62, 245, 0.4)',
                  boxShadow: '0 0 20px rgba(168, 62, 245, 0.3)'
                }}>
                  <svg className="w-5 h-5" style={{ color: '#A83EF5' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 font-[var(--font-dm-sans)]" style={{ color: '#FFFFFF' }}>
                    Nota importante
                  </p>
                  <p className="text-xs leading-relaxed font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
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
                className="px-8 py-4 md:py-3 text-base md:text-lg border-2 rounded-xl font-bold transition-all font-[var(--font-dm-sans)] min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: '#3A2F5A',
                  color: '#E5D4FF',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && !isLoading) {
                    e.currentTarget.style.borderColor = '#5A4A7A';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.background = 'rgba(168, 62, 245, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#3A2F5A';
                  e.currentTarget.style.color = '#E5D4FF';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Volver
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-8 py-4 text-base rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-[var(--font-dm-sans)] flex items-center justify-center gap-2 min-h-[48px] w-full"
              style={{
                background: 'linear-gradient(135deg, #A83EF5 0%, #f02080 100%)',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 4px 20px rgba(168, 62, 245, 0.4), 0 0 30px rgba(240, 32, 128, 0.2)',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f02080 0%, #A83EF5 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(168, 62, 245, 0.5), 0 0 40px rgba(240, 32, 128, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #A83EF5 0%, #f02080 100%)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(168, 62, 245, 0.4), 0 0 30px rgba(240, 32, 128, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
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
              console.log('✅ Evento payment_success recibido del widget. Esperando redirección nativa...');
              // No redirigir manualmente aquí. El widget redirige automáticamente a responseUrl (/payment/payphone/callback).
              // Esto evita que se muestre la página de confirmación antes de validar la transacción en el servidor.
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
