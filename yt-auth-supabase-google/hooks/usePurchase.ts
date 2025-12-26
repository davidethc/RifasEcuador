'use client';

import { useState, useCallback } from 'react';
import { purchaseService } from '@/services/purchaseService';
import type { PurchaseFormData } from '@/types/purchase.types';

/**
 * Hook personalizado para manejar el estado del proceso de compra
 */
export function usePurchase(raffleId: string) {
  const [currentStep, setCurrentStep] = useState(1);
  const [quantity, setQuantity] = useState(0);
  const [formData, setFormData] = useState<PurchaseFormData>({
    name: '',
    lastName: '',
    whatsapp: '',
    email: '',
    confirmEmail: '',
    documentId: '',
  });
  const [saleId, setSaleId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [ticketNumbers, setTicketNumbers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avanzar al siguiente paso
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  }, []);

  // Retroceder al paso anterior
  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Crear la compra
  const createPurchase = useCallback(
    async (data: PurchaseFormData): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await purchaseService.createPurchaseWithCustomer(
          raffleId,
          quantity,
          data
        );

        if (!result.success) {
          setError(result.error || 'Error al procesar la compra');
          return null;
        }

        if (result.saleId) {
          setSaleId(result.saleId);
          setOrderId(result.orderId || null);
          setTicketNumbers(result.ticketNumbers || []);
          setFormData(data);
          return result.saleId;
        }

        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error al crear compra:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [raffleId, quantity]
  );

  // Resetear el estado
  const reset = useCallback(() => {
    setCurrentStep(1);
    setQuantity(0);
    setFormData({
      name: '',
      lastName: '',
      whatsapp: '',
      email: '',
      confirmEmail: '',
      documentId: '',
    });
    setSaleId(null);
    setOrderId(null);
    setTicketNumbers([]);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    // Estado
    currentStep,
    quantity,
    formData,
    saleId,
    orderId,
    ticketNumbers,
    isLoading,
    error,
    
    // Setters
    setQuantity,
    setFormData,
    
    // Métodos
    nextStep,
    previousStep,
    createPurchase,
    reset,
  };
}







