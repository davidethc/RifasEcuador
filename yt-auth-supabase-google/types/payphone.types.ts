/**
 * Tipos para la integración con Payphone API Sale
 * Documentación: https://www.docs.payphone.app/api-implementacion
 */

export type PayphoneTransactionStatus = 'Pending' | 'Approved' | 'Canceled';
export type PayphoneStatusCode = 1 | 2 | 3;

/**
 * Solicitud para crear un pago con API Sale
 */
export interface PayphoneSaleRequest {
  phoneNumber: string;
  countryCode: string;
  amount: number; // En centavos (multiply dollars * 100)
  amountWithoutTax?: number;
  amountWithTax?: number;
  tax?: number;
  service?: number;
  tip?: number;
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
      state?: string;
      locality?: string;
      address1?: string;
      customerId?: string;
      ipAddress?: string;
    };
    lineItems?: Array<{
      productName: string;
      unitPrice: number;
      quantity: number;
      totalAmount: number;
      taxAmount?: number;
      productSKU?: string;
      productDescription?: string;
    }>;
  };
}

/**
 * Respuesta exitosa al crear un pago
 */
export interface PayphoneSaleResponse {
  transactionId: number;
}

/**
 * Respuesta de error de Payphone
 */
export interface PayphoneErrorResponse {
  message: string;
  errorCode: number;
  errors?: Array<{
    message: string;
    errorCode: number;
  }>;
}

/**
 * Respuesta al consultar el estado de una transacción
 */
export interface PayphoneTransactionResponse {
  email?: string;
  cardType?: string; // "Credit" | "Debit"
  bin?: string; // Primeros 6 dígitos de la tarjeta
  lastDigits?: string; // Últimos dígitos (XX17)
  deferredCode?: string;
  deferredMessage?: string;
  deferred?: boolean;
  cardBrandCode?: string; // "51"
  cardBrand?: string; // "Mastercard Produbanco/Promerica"
  amount: number; // En centavos
  clientTransactionId: string;
  phoneNumber: string;
  statusCode: PayphoneStatusCode; // 1=Pending, 2=Canceled, 3=Approved
  transactionStatus: PayphoneTransactionStatus;
  authorizationCode?: string;
  message?: string | null;
  messageCode?: number;
  transactionId: number;
  document?: string;
  currency: string;
  optionalParameter1?: string;
  optionalParameter2?: string;
  optionalParameter3?: string;
  optionalParameter4?: string; // Nombre del titular
  storeName?: string;
  date: string; // ISO 8601
  regionIso?: string; // ISO 3166-1 alpha-2 (EC)
  transactionType?: string; // "Store to Customer"
  reference?: string;
  canBypassRedirection?: boolean;
  pan?: string;
}

/**
 * Parámetros para crear un pago desde el frontend
 */
export interface CreatePaymentParams {
  orderId: string;
  phoneNumber: string;
  countryCode: string;
  amount: number; // En dólares (el servicio lo convertirá a centavos)
  customerData: {
    name: string;
    lastName: string;
    email: string;
    phone: string;
    documentId?: string;
  };
  raffleTitle: string;
}
