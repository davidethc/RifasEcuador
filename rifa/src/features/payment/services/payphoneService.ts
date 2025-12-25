import { supabase } from '@/shared/lib/supabase';
import type {
  CreatePaymentParams,
  PayphoneTransactionResponse,
  PaymentRecord,
  PayphoneButtonConfirmResponse,
} from '../types/payphone.types';

function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function generateClientTransactionId(saleId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${saleId}-${timestamp}-${random}`;
}

function cleanPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s+\-()]/g, '');
}

function extractCountryCode(phoneNumber: string, providedCode: string): string {
  if (phoneNumber.startsWith('+')) {
    const match = phoneNumber.match(/^\+(\d{1,3})/);
    if (match) {
      return match[1];
    }
  }
  return providedCode;
}

export const payphoneService = {
  async createPayment(params: CreatePaymentParams) {
    try {
      const { saleId, phoneNumber, countryCode, customerData, amount, reference } = params;

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('id, total_amount, raffle_id, quantity, unit_price, raffles:raffle_id(title)')
        .eq('id', saleId)
        .single();

      if (saleError || !sale) {
        throw new Error('Venta no encontrada');
      }

      const clientTransactionId = generateClientTransactionId(saleId);
      const cleanedPhone = cleanPhoneNumber(phoneNumber);
      const extractedCountryCode = extractCountryCode(phoneNumber, countryCode);
      const amountInCents = dollarsToCents(amount);

      // Obtener el título del sorteo de forma segura
      const raffleTitle = Array.isArray(sale.raffles)
        ? sale.raffles[0]?.title
        : (sale.raffles as { title?: string })?.title;

      const { data: edgeFunctionResponse, error: edgeError } = await supabase.functions.invoke(
        'create-payphone-payment',
        {
          body: {
            saleId,
            phoneNumber: cleanedPhone,
            countryCode: extractedCountryCode,
            customerData,
            amount: amountInCents,
            clientTransactionId,
            reference: reference || `Compra de boletos - ${raffleTitle || 'Sorteo'}`,
          },
        }
      );

      if (edgeError || !edgeFunctionResponse) {
        throw new Error(edgeError?.message || 'Error al crear el pago');
      }

      if (!edgeFunctionResponse.success) {
        throw new Error(edgeFunctionResponse.error || 'Error desconocido al crear el pago');
      }

      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          sale_id: saleId,
          payment_id: clientTransactionId,
          transaction_id: edgeFunctionResponse.transactionId,
          amount: amount,
          currency: 'USD',
          status: 'pending',
          payphone_response: edgeFunctionResponse.payphoneResponse,
        })
        .select()
        .single();

      if (paymentError || !paymentRecord) {
        console.error('Error al registrar pago en BD:', paymentError);
      }

      await supabase
        .from('sales')
        .update({
          payment_id: clientTransactionId,
          payment_status: 'pending',
        })
        .eq('id', saleId);

      return {
        success: true,
        transactionId: edgeFunctionResponse.transactionId,
        paymentId: clientTransactionId,
      };
    } catch (error) {
      console.error('Error al crear pago:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  async checkPaymentStatus(transactionId: number) {
    try {
      const { data, error } = await supabase.functions.invoke('check-payphone-status', {
        body: { transactionId },
      });

      if (error || !data) {
        throw new Error(error?.message || 'Error al consultar el estado');
      }

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido');
      }

      return {
        success: true,
        transaction: data.transaction,
      };
    } catch (error) {
      console.error('Error al consultar estado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  async getPaymentRecord(saleId: string): Promise<PaymentRecord | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('sale_id', saleId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return data as PaymentRecord;
    } catch (error) {
      console.error('Error al obtener registro de pago:', error);
      return null;
    }
  },

  /**
   * Confirma el estado de una transacción de la Cajita de Pagos
   * Usa el endpoint /api/button/V2/Confirm
   * 
   * ⚠️ IMPORTANTE: Debe ejecutarse dentro de los primeros 5 minutos después del pago
   * o Payphone reversará automáticamente la transacción
   */
  async confirmButtonPayment(
    transactionId: number,
    clientTransactionId: string
  ): Promise<{
    success: boolean;
    transaction?: PayphoneButtonConfirmResponse;
    error?: string;
    errorCode?: number;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-payphone-button', {
        body: {
          id: transactionId,
          clientTxId: clientTransactionId,
        },
      });

      if (error) {
        console.error('❌ Error de Supabase al invocar función:', error);
        throw new Error(error.message || 'Error al confirmar el pago');
      }

      if (!data) {
        console.error('❌ No se recibieron datos de la función');
        throw new Error('No se recibieron datos de la función de confirmación');
      }

      console.log('📥 Respuesta de la función:', {
        success: data.success,
        hasTransaction: !!data.transaction,
        error: data.error,
        errorCode: data.errorCode,
        transactionId: data.transactionId,
        transactionStatus: data.transactionStatus,
      });

      if (!data.success) {
        // Retornar el código de error si está disponible
        console.error('❌ La función reportó error:', data.error);
        return {
          success: false,
          error: data.error || 'Error desconocido',
          errorCode: data.errorCode,
        };
      }

      console.log('✅ Confirmación exitosa, retornando datos de transacción');
      return {
        success: true,
        transaction: data.transaction,
      };
    } catch (error) {
      console.error('❌ Error al confirmar pago:', error);
      console.error('Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  async updatePaymentStatus(
    paymentId: string,
    status: string,
    payphoneResponse?: PayphoneTransactionResponse | PayphoneButtonConfirmResponse
  ): Promise<boolean> {
    try {
      const updateData: {
        status: string;
        payphone_response?: PayphoneTransactionResponse | PayphoneButtonConfirmResponse;
        updated_at: string;
      } = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (payphoneResponse) {
        updateData.payphone_response = payphoneResponse;
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('payment_id', paymentId);

      if (error) {
        throw error;
      }

      const statusMap: Record<string, string> = {
        Approved: 'completed',
        Canceled: 'cancelled',
        Pending: 'pending',
      };

      const saleStatus = statusMap[status] || 'pending';

      await supabase
        .from('sales')
        .update({
          payment_status: saleStatus,
          completed_at: saleStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('payment_id', paymentId);

      return true;
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      return false;
    }
  },
};
