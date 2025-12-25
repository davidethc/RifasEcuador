/**
 * Tipos para el módulo de Tickets
 */

export interface MyTicket {
  sale_id: string;
  raffle_id: string;
  raffle_title: string;
  prize_name: string;
  prize_image_url: string | null;
  ticket_start_number: number;
  ticket_end_number: number;
  ticket_start_number_formatted?: string;
  ticket_end_number_formatted?: string;
  quantity: number;
  total_amount: number;
  payment_status: string;
  purchase_date: string;
  completed_at: string | null;
  user_id: string;
}

export interface TicketDetail {
  id: string;
  ticket_number: number;
  ticket_number_formatted: string;
  status: string;
  raffle_id: string;
  sale_id: string | null;
  assigned_at: string | null;
}
