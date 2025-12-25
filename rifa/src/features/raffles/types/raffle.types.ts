export interface PublicRaffle {
  id: string;
  title: string;
  description: string | null;
  prize_name: string;
  prize_image_url: string | null;
  price_per_ticket: number;
  sold_percentage: number;
  status: string;
  created_at: string;
}

