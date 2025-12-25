/**
 * Hook para manejar pagos con Payphone
 */

import { useState, useCallback } from 'react';
import { payphoneService } from '../services/payphoneService';
import type {
  CreatePaymentParams,
  PayphoneTransactionResponse,
  PayphoneButtonConfirmResponse,
  PaymentRecord,
} from '../types/payphone.types';

interface CreatePaymentResult {
  success: boolean;
  transactionId?: number;
  paymentId?: string;
  error?: string;
}

interface ConfirmButtonPaymentResult {
  success: boolean;
  transaction?: PayphoneButtonConfirmResponse | null;
  error?: string;
  errorCode?: number;
}

interface UsePaymentReturn {
  createPayment: (params: CreatePaymentParams) => Promise<CreatePaymentResult>;
  checkStatus: (transactionId: number) => Promise<PayphoneTransactionResponse | null>;
  confirmButtonPayment: (
    transactionId: number,
    clientTransactionId: string
  ) => Promise<ConfirmButtonPaymentResult>;
  getPaymentRecord: (saleId: string) => Promise<PaymentRecord | null>;
  updatePaymentStatus: (
    paymentId: string,
    status: string,
    payphoneResponse?: PayphoneTransactionResponse | PayphoneButtonConfirmResponse
  ) => Promise<boolean>;
  clearError: () => void;
  isLoading: boolean;
  error: string | null;
}

export function usePayment(): UsePaymentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(
    async (params: CreatePaymentParams): Promise<CreatePaymentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await payphoneService.createPayment(params);

        if (!result.success) {
          const errorMessage = result.error || 'Error al crear el pago';
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }

        return {
          success: true,
          transactionId: result.transactionId,
          paymentId: result.paymentId,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkStatus = useCallback(
    async (transactionId: number): Promise<PayphoneTransactionResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await payphoneService.checkPaymentStatus(transactionId);

        if (!result.success) {
          const errorMessage = result.error || 'Error al consultar el estado';
          setError(errorMessage);
          return null;
        }

        return result.transaction || null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getPaymentRecord = useCallback(
    async (saleId: string): Promise<PaymentRecord | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const record = await payphoneService.getPaymentRecord(saleId);
        return record;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const confirmButtonPayment = useCallback(
    async (
      transactionId: number,
      clientTransactionId: string
    ): Promise<ConfirmButtonPaymentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await payphoneService.confirmButtonPayment(
          transactionId,
          clientTransactionId
        );

        if (!result.success) {
          let errorMessage = result.error || 'Error al confirmar el pago';
          
          // Agregar información específica según el código de error
          if (result.errorCode === 20) {
            errorMessage = 'La transacción no existe o ya fue procesada.';
          }
          
          setError(errorMessage);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updatePaymentStatus = useCallback(
    async (
      paymentId: string,
      status: string,
      payphoneResponse?: PayphoneTransactionResponse | PayphoneButtonConfirmResponse
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const success = await payphoneService.updatePaymentStatus(
          paymentId,
          status,
          payphoneResponse
        );

        if (!success) {
          setError('Error al actualizar el estado del pago');
        }

        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createPayment,
    checkStatus,
    confirmButtonPayment,
    getPaymentRecord,
    updatePaymentStatus,
    clearError,
    isLoading,
    error,
  };
}
