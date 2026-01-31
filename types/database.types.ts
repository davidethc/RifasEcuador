/**
 * Tipos de la base de datos Supabase
 * Estos tipos mapean las tablas de tu base de datos
 */

export interface Raffle {
  id: string;
  title: string;
  description: string | null;
  price_per_ticket: number;
  total_numbers: number;
  status: 'draft' | 'active' | 'finished' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  image_url?: string | null;
  featured?: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  reactivated_at?: string | null;
}

export interface Ticket {
  id: string;
  raffle_id: string;
  user_id: string;
  ticket_number: number;
  purchase_date: string;
  status: 'reserved' | 'paid' | 'cancelled';
  payment_id?: string | null;
}
