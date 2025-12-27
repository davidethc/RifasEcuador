'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/hooks/usePurchase';
import type { Raffle } from '@/types/database.types';

// Componentes
import { Stepper } from '@/components/compra/Stepper';
import { TicketSelector } from '@/components/compra/TicketSelector';
import { PurchaseFormWithPayment } from '@/components/compra/PurchaseFormWithPayment';
import { HeroCarousel } from '@/components/ui/hero-carousel';

/**
 * Página principal del proceso de compra
 * Implementa un flujo de 2 pasos con stepper visual
 */
export default function ComprarPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const raffleId = params.id as string;

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [raffleLoading, setRaffleLoading] = useState(true);
  const [raffleError, setRaffleError] = useState<string | null>(null);

  const {
    currentStep,
    quantity,
    formData,
    saleId,
    orderId,
    ticketNumbers,
    isLoading,
    error,
    setQuantity,
    nextStep,
    previousStep,
    createPurchase,
  } = usePurchase(raffleId);

  // Cargar información del sorteo
  useEffect(() => {
    async function fetchRaffle() {
      try {
        setRaffleLoading(true);
        setRaffleError(null);

        const { data, error: fetchError } = await supabase
          .from('raffles')
          .select('*')
          .eq('id', raffleId)
          .eq('status', 'active')
          .single();

        if (fetchError) {
          console.error('Error fetching raffle:', fetchError);
          setRaffleError('No se pudo cargar el sorteo');
          return;
        }

        setRaffle(data);
      } catch (err) {
        console.error('Unexpected error:', err);
        setRaffleError('Ocurrió un error inesperado');
      } finally {
        setRaffleLoading(false);
      }
    }

    if (raffleId) {
      fetchRaffle();
    }
  }, [raffleId]);

  // Manejar continuación desde paso 1
  const handleContinueFromQuantity = () => {
    if (quantity > 0 && quantity <= 100) {
      nextStep();
    }
  };

  // Manejar envío del formulario (ahora retorna el saleId directamente)
  const handleFormSubmit = async (data: typeof formData): Promise<string | null> => {
    return await createPurchase(data);
  };

  // Pasos del stepper (ahora solo 2 pasos)
  const steps = [
    { id: 1, title: 'Seleccionar cantidad', description: 'Elige cuántos boletos deseas' },
    { id: 2, title: 'Datos y pago', description: 'Completa tu información y realiza el pago' },
  ];

  const purchaseCarouselImages = [
    { src: "/imagenhero.png", alt: "Premios destacados" },
    { src: "/kia.jpg", alt: "Kia Sedan" },
    { src: "/mazdaprin.png", alt: "Mazda CX-3 SUV" },
    { src: "/yamaha.jpg", alt: "Yamaha Motocicleta" },
  ];

  // Loading state
  if (authLoading || raffleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
            Cargando información del sorteo...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (raffleError || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
            Sorteo no disponible
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 font-[var(--font-dm-sans)]">
            {raffleError || 'El sorteo que buscas no está disponible o no existe'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-accent-600 transition-colors font-[var(--font-dm-sans)]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carrusel destacado */}
        <div className="mb-6 md:mb-8 w-full md:max-w-4xl lg:max-w-5xl mx-auto">
          <HeroCarousel images={purchaseCarouselImages} ratio={20 / 9} />
        </div>

        {/* Botón conocer más premios */}
        <div className="flex justify-center mb-6 md:mb-8">
          <button
            onClick={() => router.push(`/sorteos/${raffleId}`)}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-accent-500 dark:to-accent-600 text-white dark:text-gray-900 rounded-xl font-bold text-base md:text-lg hover:from-primary-700 hover:to-primary-800 dark:hover:from-accent-600 dark:hover:to-accent-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-[var(--font-dm-sans)] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Conocer más de los premios
          </button>
        </div>

        {/* Stepper con los 3 pasos */}
        <div className="mb-6 md:mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1 font-[var(--font-dm-sans)]">
                    Error al procesar la compra
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 font-[var(--font-dm-sans)]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido según el paso actual - Centrado */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4 sm:px-6 md:px-8">
            {currentStep === 1 && (
              <TicketSelector
                pricePerTicket={raffle.price_per_ticket}
                selectedQuantity={quantity}
                onQuantityChange={setQuantity}
                onContinue={handleContinueFromQuantity}
              />
            )}

            {currentStep === 2 && (
              <PurchaseFormWithPayment
                initialData={formData}
                onSubmit={handleFormSubmit}
                onBack={previousStep}
                isLoading={isLoading}
                quantity={quantity}
                totalAmount={quantity * raffle.price_per_ticket}
                raffleTitle={raffle.title}
                saleId={saleId}
                orderId={orderId}
                ticketNumbers={ticketNumbers}
              />
            )}
          </div>
        </div>

        {/* Botón volver (solo en paso 2, pero el componente lo maneja internamente) */}
      </div>
    </div>
  );
}
