/**
 * Tipos para la integración con Payphone API
 */

export type PayphoneTransactionStatus = 'Pending' | 'Approved' | 'Canceled';
export type PayphoneStatusCode = 1 | 2 | 3;

export interface PayphoneSaleRequest {
  phoneNumber: string;
  countryCode: string;
  amount: number;
  amountWithoutTax?: number;
  clientTransactionId: string;
  reference?: string;
  storeId: string;
  currency: string;
  timeZone?: number;
  clientUserId?: string;
  responseUrl?: string;
  order?: {
    billTo?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      country?: string;
    };
  };
}

export interface PayphoneSaleResponse {
  transactionId: number;
}

export interface PayphoneErrorResponse {
  message: string;
  errorCode: number;
  errors?: Array<{
    message: string;
    errorCode: number;
  }>;
}

export interface PayphoneTransactionResponse {
  amount: number;
  clientTransactionId: string;
  phoneNumber: string;
  statusCode: PayphoneStatusCode;
  transactionStatus: PayphoneTransactionStatus;
  transactionId: number;
  currency: string;
  date: string;
  message?: string | null;
  authorizationCode?: string;
}

// Tipos para la Cajita de Pagos (Button/Confirm)
export interface PayphoneButtonConfirmRequest {
  id: number;
  clientTxId: string;
}

export interface PayphoneButtonConfirmResponse {
  email?: string;
  cardType?: string; // "Credit" | "Debit"
  bin?: string; // Primeros 6 dígitos
  lastDigits?: string; // Últimos dígitos
  deferredCode?: string;
  deferred?: boolean;
  deferredMessage?: string;
  cardBrandCode?: string;
  cardBrand?: string; // "Mastercard Produbanco/Promerica", etc.
  amount: number; // En centavos
  clientTransactionId: string;
  phoneNumber: string;
  statusCode: PayphoneStatusCode;
  transactionStatus: PayphoneTransactionStatus;
  authorizationCode?: string;
  message?: string | null;
  messageCode: number;
  transactionId: number;
  document?: string;
  currency: string;
  optionalParameter3?: string;
  optionalParameter4?: string; // Nombre del titular
  storeName?: string;
  date: string; // ISO 8601
  regionIso?: string; // ISO 3166-1 alpha-2
  transactionType?: string; // "Classic"
  reference?: string;
}

export interface CreatePaymentParams {
  saleId: string;
  phoneNumber: string;
  countryCode: string;
  customerData: {
    name: string;
    lastName: string;
    email: string;
    phone: string;
  };
  amount: number;
  reference?: string;
}

export interface PaymentRecord {
  id: string;
  sale_id: string;
  payment_id: string;
  transaction_id?: number;
  amount: number;
  currency: string;
  status: string;
  payphone_response?: PayphoneTransactionResponse;
  webhook_received: boolean;
  created_at: string;
  updated_at: string;
}
