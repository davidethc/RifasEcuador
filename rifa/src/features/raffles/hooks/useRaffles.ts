import { useState, useEffect } from 'react';
import { raffleService } from '../services/raffleService';
import type { PublicRaffle } from '../types/raffle.types';

export function useRaffles() {
  const [raffles, setRaffles] = useState<PublicRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRaffles() {
      try {
        setLoading(true);
        setError(null);
        const data = await raffleService.getActiveRaffles();
        setRaffles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sorteos');
        console.error('Error fetching raffles:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRaffles();
  }, []);

  return { raffles, loading, error };
}

export function useRaffle(id: string) {
  const [raffle, setRaffle] = useState<PublicRaffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRaffle() {
      try {
        setLoading(true);
        setError(null);
        const data = await raffleService.getRaffleById(id);
        setRaffle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sorteo');
        console.error('Error fetching raffle:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchRaffle();
    }
  }, [id]);

  return { raffle, loading, error };
}

