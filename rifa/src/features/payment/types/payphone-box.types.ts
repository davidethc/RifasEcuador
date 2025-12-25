/**
 * Tipos para la Cajita de Pagos de Payphone
 */

export interface PayphoneBoxConfig {
  token: string;
  clientTransactionId: string;
  amount: number; // En centavos
  amountWithoutTax?: number; // En centavos
  amountWithTax?: number; // En centavos
  tax?: number; // En centavos
  service?: number; // En centavos
  tip?: number; // En centavos
  currency?: string;
  storeId?: string; // Opcional según documentación de Payphone
  reference?: string;
  phoneNumber?: string; // Formato: +593999999999
  email?: string;
  documentId?: string;
  identificationType?: 1 | 2 | 3; // 1=Cédula, 2=RUC, 3=Pasaporte
  lang?: 'es' | 'en';
  defaultMethod?: 'card' | 'payphone';
  timeZone?: number;
  lat?: string;
  lng?: string;
  optionalParameter?: string;
  backgroundColor?: string; // Color de fondo del botón (ej: "#6610f2")
}

export interface PayphoneBoxProps {
  saleId: string;
  amount: number; // En dólares
  customerData: {
    name: string;
    lastName: string;
    email: string;
    whatsapp: string;
    documentId?: string; // Cédula/documento de identidad (opcional pero recomendado)
  };
  raffleTitle: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  backgroundColor?: string; // Color de fondo del botón (opcional)
  containerId?: string; // ID personalizado del contenedor (opcional)
  onRender?: () => void; // Callback cuando se renderiza el botón (opcional)
}

// Declaración global para el tipo de PPaymentButtonBox
declare global {
  interface Window {
    PPaymentButtonBox: new (config: PayphoneBoxConfig) => {
      render: (containerId: string) => void;
    };
  }
}
