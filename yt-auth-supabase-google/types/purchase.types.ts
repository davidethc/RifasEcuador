/**
 * Tipos para el módulo de compra de boletos
 */

export interface PurchaseFormData {
  name: string;
  lastName: string;
  whatsapp: string;
  email: string;
  confirmEmail: string;
  documentId?: string;
}

export interface PurchaseConfirmation {
  sale_id: string;
  raffle_id: string;
  raffle_title: string;
  prize_name: string;
  prize_image_url: string | null;
  quantity: number;
  total_amount: number;
  payment_status: 'pending' | 'reserved' | 'completed' | 'cancelled' | 'expired';
  ticket_start_number: number;
  ticket_end_number: number;
  ticket_numbers: string[]; // Ahora son strings: ['00012', '03827', '59999']
  purchase_date: string;
  order_id?: string;
  customerData?: {
    name: string;
    email: string;
    phone: string;
    documentId?: string;
  };
}

export interface TicketBundle {
  quantity: number;
  label: string;
  pricePerTicket: number;
  totalPrice: number;
}

export interface Customer {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  raffle_id: string;
  customer_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_status: 'pending' | 'reserved' | 'completed' | 'cancelled' | 'expired';
  payment_id?: string | null;
  ticket_start_number: number;
  ticket_end_number: number;
  created_at: string;
  completed_at?: string | null;
  updated_at: string;
}

export interface PaymentData {
  saleId: string;
  orderId?: string;
  amount: number;
  customerData: PurchaseFormData;
  raffleTitle: string;
  ticketNumbers?: string[];
}

export interface ReservationResult {
  order_id: string;
  ticket_numbers: string[];
  total_amount: number;
  success: boolean;
  error_message: string | null;
}





