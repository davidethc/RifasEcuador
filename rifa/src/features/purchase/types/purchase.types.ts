/**
 * Tipos para el módulo de Purchase (Compra/Asignación de Boletos)
 */

export interface PurchaseConfirmation {
  sale_id: string;
  raffle_id: string;
  raffle_title: string;
  prize_name: string;
  prize_image_url: string | null;
  ticket_start_number: number;
  ticket_end_number: number;
  quantity: number;
  total_amount: number;
  payment_status: string;
  purchase_date: string;
  ticket_numbers: number[]; // Números individuales de boletos asignados
  customerData?: {
    name: string;
    email: string;
    phone: string;
    documentId?: string; // Cédula/documento de identidad
  };
}

export interface PurchaseFormData {
  name: string;
  lastName: string;
  whatsapp: string;
  email: string;
  confirmEmail: string;
  documentId?: string; // Cédula/documento de identidad (opcional pero recomendado para Payphone)
}

export interface TicketBundle {
  quantity: number;
  label: string;
  pricePerTicket: number;
  totalPrice: number;
  discount?: number; // Porcentaje de descuento si aplica
}

export interface CartItem {
  raffle_id: string;
  raffle_title: string;
  prize_name: string;
  prize_image_url: string | null;
  price_per_ticket: number;
  quantity: number;
  total: number;
}
