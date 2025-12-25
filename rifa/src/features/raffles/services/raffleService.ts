import { supabase } from '@/shared/lib/supabase';
import type { PublicRaffle } from '../types/raffle.types';

export const raffleService = {
  /**
   * Obtiene todos los sorteos activos desde la vista public_raffles
   * Esta vista solo muestra sorteos con status = 'active' y oculta información secreta
   */
  async getActiveRaffles(): Promise<PublicRaffle[]> {
    const { data, error } = await supabase
      .from('public_raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener sorteos: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Obtiene un sorteo específico por ID
   */
  async getRaffleById(id: string): Promise<PublicRaffle | null> {
    const { data, error } = await supabase
      .from('public_raffles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el sorteo
        return null;
      }
      throw new Error(`Error al obtener sorteo: ${error.message}`);
    }

    return data;
  },
};

