import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ticketService } from '../services/ticketService';
import type { MyTicket, TicketDetail } from '../types/ticket.types';

export function useTickets() {
  const { isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      if (!isAuthenticated) {
        setLoading(false);
        setTickets([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // El servicio obtiene el usuario de la sesión automáticamente
        const data = await ticketService.getMyTickets();
        setTickets(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar tickets';
        setError(errorMessage);
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [isAuthenticated]);

  return { tickets, loading, error };
}

export function useTicketDetails(saleId: string | null) {
  const [ticketDetails, setTicketDetails] = useState<TicketDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTicketDetails() {
      if (!saleId) {
        setTicketDetails([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ticketService.getTicketDetailsBySale(saleId);
        setTicketDetails(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar detalles';
        setError(errorMessage);
        console.error('Error fetching ticket details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTicketDetails();
  }, [saleId]);

  return { ticketDetails, loading, error };
}
