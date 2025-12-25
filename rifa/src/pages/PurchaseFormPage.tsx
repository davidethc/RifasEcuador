import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useRaffle } from '@/features/raffles/hooks/useRaffles';
import { purchaseService } from '@/features/purchase/services/purchaseService';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Stepper } from '@/shared/components/ui/stepper';
import { useToast } from '@/shared/hooks/useToast';
import type { PurchaseFormData } from '@/features/purchase/types/purchase.types';
import { debugRaffle } from '@/shared/lib/debugRaffle';

/**
 * Página de formulario de datos del cliente
 * Segunda etapa del flujo de compra
 * Usuario completa sus datos antes de proceder al pago
 */
export function PurchaseFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { raffle, loading, error } = useRaffle(id || '');
  
  const quantity = parseInt(searchParams.get('quantity') || '1', 10);
  
  const [formData, setFormData] = useState<PurchaseFormData>({
    name: '',
    lastName: '',
    whatsapp: '',
    email: '',
    confirmEmail: '',
    documentId: '',
  });

  const [errors, setErrors] = useState<Partial<PurchaseFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Debug: Log cuando cambia el ID
  useEffect(() => {
    if (id) {
      console.log('🔍 [DEBUG] PurchaseFormPage - Raffle ID desde URL:', id);
      console.log('💡 [TIP] Para diagnosticar, ejecuta en consola: window.debugRaffle("' + id + '")');
    } else {
      console.warn('⚠️ [WARNING] PurchaseFormPage - No hay ID en la URL');
    }
  }, [id]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<PurchaseFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'El número de WhatsApp es requerido';
    } else {
      // Validar formato para Ecuador (+593)
      const cleaned = formData.whatsapp.replace(/\s|-|\(|\)/g, '');
      // Acepta: +593939039191, 593939039191, 0939039191, 939039191
      const isValid = /^(\+?593)?[0-9]{9,10}$/.test(cleaned) || /^0[0-9]{9}$/.test(cleaned);
      if (!isValid) {
        newErrors.whatsapp = 'Formato de WhatsApp inválido. Ej: +593 939039191 o 0939039191';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Los correos no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      console.error('❌ [ERROR] Validación falló o ID faltante:', { id, formData });
      return;
    }

    console.log('🔍 [DEBUG] PurchaseFormPage - handleSubmit:', {
      raffleId: id,
      quantity,
      customerName: formData.name,
      customerEmail: formData.email,
    });

    setIsSubmitting(true);

    try {
      // Crear customer y sale, asignar tickets
      const saleId = await purchaseService.createPurchaseWithCustomer(
        id,
        quantity,
        formData
      );

      if (!saleId) {
        throw new Error('Error al procesar la compra');
      }

      // Mostrar toast de éxito
      toast({
        variant: 'success',
        title: '¡Compra procesada exitosamente!',
        description: 'Tus boletos han sido asignados. Redirigiendo a la confirmación...',
      });
      
      // Redirigir a página de selección de método de pago
      setTimeout(() => {
        navigate(`/purchase/${saleId}/payment`);
      }, 1000);
    } catch (err) {
      console.error('Error al procesar compra:', err);
      toast({
        variant: 'destructive',
        title: 'Error al procesar la compra',
        description: 'Por favor, intenta de nuevo. Si el problema persiste, contacta con soporte.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PurchaseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real
    const newErrors: Partial<PurchaseFormData> = { ...errors };
    
    if (field === 'name' && value.trim()) {
      delete newErrors.name;
    } else if (field === 'name' && !value.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (field === 'lastName' && value.trim()) {
      delete newErrors.lastName;
    } else if (field === 'lastName' && !value.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    
    if (field === 'whatsapp') {
      const cleaned = value.replace(/\s|-|\(|\)/g, '');
      // Validar formato para Ecuador (+593)
      // Acepta: +593939039191, 593939039191, 0939039191, 939039191
      const isValid = /^(\+?593)?[0-9]{9,10}$/.test(cleaned) || /^0[0-9]{9}$/.test(cleaned);
      if (cleaned && isValid) {
        delete newErrors.whatsapp;
      } else if (cleaned) {
        newErrors.whatsapp = 'Formato de WhatsApp inválido. Ej: +593 939039191 o 0939039191';
      } else if (!value.trim()) {
        newErrors.whatsapp = 'El número de WhatsApp es requerido';
      }
    }
    
    if (field === 'email') {
      if (value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        delete newErrors.email;
        // Si el email es válido y hay confirmEmail, validar coincidencia
        if (formData.confirmEmail && formData.confirmEmail !== value) {
          newErrors.confirmEmail = 'Los correos no coinciden';
        } else if (formData.confirmEmail && formData.confirmEmail === value) {
          delete newErrors.confirmEmail;
        }
      } else if (value.trim()) {
        newErrors.email = 'Correo electrónico inválido';
      } else {
        newErrors.email = 'El correo electrónico es requerido';
      }
    }
    
    if (field === 'confirmEmail') {
      if (value === formData.email && formData.email) {
        delete newErrors.confirmEmail;
      } else if (value.trim()) {
        newErrors.confirmEmail = 'Los correos no coinciden';
      } else {
        newErrors.confirmEmail = 'Confirma tu correo electrónico';
      }
    }
    
    setErrors(newErrors);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <LoadingState message="Cargando información del sorteo..." />
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || 'Sorteo no encontrado'}</p>
          <Link to="/">
            <Button>Volver a sorteos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const total = quantity * raffle.price_per_ticket;

  const steps = ['Seleccionar cantidad', 'Completar datos', 'Confirmación'];

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header - Mismo estilo que HomePage */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Completa tus datos
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Necesitamos tus datos para procesar tu compra
        </p>
        
        {/* Stepper */}
        <div className="max-w-2xl mx-auto mb-8">
          <Stepper steps={steps} currentStep={2} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Columna izquierda: Formulario */}
        <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8">
          <h2 className="text-2xl font-semibold mb-6">COMPLETA LOS DATOS A CONTINUACIÓN</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <Label htmlFor="name">Nombre(s)</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => {
                  if (!formData.name.trim()) {
                    setErrors((prev) => ({ ...prev, name: 'El nombre es requerido' }));
                  }
                }}
                placeholder="Ingresa tu nombre"
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : formData.name ? 'border-green-500/50' : ''}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <Label htmlFor="lastName">Apellido(s)</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                onBlur={() => {
                  if (!formData.lastName.trim()) {
                    setErrors((prev) => ({ ...prev, lastName: 'El apellido es requerido' }));
                  }
                }}
                placeholder="Ingresa tu apellido"
                className={errors.lastName ? 'border-destructive focus-visible:ring-destructive' : formData.lastName ? 'border-green-500/50' : ''}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <Label htmlFor="whatsapp">Número WhatsApp</Label>
              <Input
                id="whatsapp"
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                onBlur={() => {
                  if (!formData.whatsapp.trim()) {
                    setErrors((prev) => ({ ...prev, whatsapp: 'El número de WhatsApp es requerido' }));
                  }
                }}
                placeholder="Ej: +593 939039191 o 0939039191"
                className={errors.whatsapp ? 'border-destructive focus-visible:ring-destructive' : formData.whatsapp && !errors.whatsapp ? 'border-green-500/50' : ''}
                aria-invalid={!!errors.whatsapp}
                aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
              />
              {errors.whatsapp && (
                <p id="whatsapp-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.whatsapp}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => {
                  if (!formData.email.trim()) {
                    setErrors((prev) => ({ ...prev, email: 'El correo electrónico es requerido' }));
                  }
                }}
                placeholder="tu@email.com"
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : formData.email && !errors.email ? 'border-green-500/50' : ''}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Confirmar Email */}
            <div>
              <Label htmlFor="confirmEmail">Confirma el Correo Electrónico</Label>
              <Input
                id="confirmEmail"
                type="email"
                value={formData.confirmEmail}
                onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                onBlur={() => {
                  if (formData.confirmEmail && formData.confirmEmail !== formData.email) {
                    setErrors((prev) => ({ ...prev, confirmEmail: 'Los correos no coinciden' }));
                  }
                }}
                placeholder="Confirma tu correo"
                className={errors.confirmEmail ? 'border-destructive focus-visible:ring-destructive' : formData.confirmEmail && !errors.confirmEmail ? 'border-green-500/50' : ''}
                aria-invalid={!!errors.confirmEmail}
                aria-describedby={errors.confirmEmail ? 'confirmEmail-error' : undefined}
              />
              {errors.confirmEmail && (
                <p id="confirmEmail-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.confirmEmail}
                </p>
              )}
            </div>

            {/* Documento de Identidad (Opcional pero recomendado) */}
            <div>
              <Label htmlFor="documentId">
                Cédula/Documento de Identidad
                <span className="text-xs text-muted-foreground ml-2">(Opcional)</span>
              </Label>
              <Input
                id="documentId"
                type="text"
                value={formData.documentId || ''}
                onChange={(e) => handleInputChange('documentId', e.target.value)}
                placeholder="Ej: 1234567890"
                className={errors.documentId ? 'border-destructive focus-visible:ring-destructive' : formData.documentId ? 'border-green-500/50' : ''}
                aria-invalid={!!errors.documentId}
                aria-describedby={errors.documentId ? 'documentId-error' : undefined}
              />
              {errors.documentId && (
                <p id="documentId-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.documentId}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Si no lo ingresas, Payphone lo solicitará durante el pago
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-6 text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Continuar al pago'}
            </Button>
          </form>
        </div>

        {/* Columna derecha: Resumen */}
        <div className="space-y-6">
          {/* Información del sorteo */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
              {raffle.prize_image_url ? (
                <img
                  src={raffle.prize_image_url}
                  alt={raffle.prize_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              {raffle.title}
            </h3>
            
            <p className="text-sm font-medium text-primary mb-4">
              Premio: {raffle.prize_name}
            </p>
          </div>

          {/* Detalles de la compra */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Detalles de la compra:</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Número(s) Elegido(s):</span>
                <span className="font-semibold">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio unitario:</span>
                <span className="font-medium">${raffle.price_per_ticket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total a pagar:</span>
                <span className="text-primary">${total.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

