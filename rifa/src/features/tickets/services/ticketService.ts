import { supabase } from '@/shared/lib/supabase';
import type { MyTicket, TicketDetail } from '../types/ticket.types';

export const ticketService = {
  /**
   * Obtiene todos los tickets comprados del usuario autenticado
   * 
   * Estrategia:
   * 1. Intenta usar la función SQL get_my_tickets() si existe (más confiable)
   * 2. Si no existe, consulta directamente la vista my_tickets
   *    (RLS de las tablas subyacentes debería filtrar automáticamente)
   */
  async getMyTickets(): Promise<MyTicket[]> {
    // Verificar que hay sesión
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Si no hay sesión, retornar array vacío
      return [];
    }

    // Intentar usar la función SQL primero (más confiable con RLS)
    // Si no existe (404), usar la vista directamente (fallback)
    try {
      const { data: functionData, error: functionError } = await supabase.rpc('get_my_tickets');

      // Si la función existe y no hay error, usar sus datos
      if (!functionError && functionData) {
        return functionData;
      }

      // Si el error es 404 (función no existe), continuar con la vista
      // No es un error grave, simplemente la función no está creada
      if (functionError?.code === 'PGRST204' || functionError?.message?.includes('404')) {
        // Función no existe, continuar con la vista (comportamiento normal)
      } else if (functionError) {
        // Otro tipo de error, loguear pero continuar con la vista
        console.warn('Error al llamar get_my_tickets:', functionError.message);
      }
    } catch {
      // Si hay excepción, continuar con la vista (fallback seguro)
      // No es necesario loguear, es comportamiento esperado si la función no existe
    }

    // Consultar la vista directamente
    // Ordenar por rifa primero (para agrupar), luego por fecha (más antigua primero)
    // Esto permite ver todos los boletos de una rifa juntos, en orden cronológico
    const { data, error } = await supabase
      .from('my_tickets')
      .select('*')
      .order('raffle_id', { ascending: true })
      .order('purchase_date', { ascending: true });

    if (error) {
      // Si hay error, puede ser problema de RLS o que no haya tickets
      // Retornar array vacío en lugar de lanzar error para mejor UX
      console.warn('Error al obtener tickets:', error.message);
      return [];
    }

    return data || [];
  },

  /**
   * Obtiene los detalles de tickets individuales para una venta específica
   * Útil para mostrar todos los números de tickets comprados
   */
  async getTicketDetailsBySale(saleId: string): Promise<TicketDetail[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('id, ticket_number, status, raffle_id, sale_id, assigned_at')
      .eq('sale_id', saleId)
      .eq('status', 'sold')
      .order('ticket_number', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener detalles de tickets: ${error.message}`);
    }

    // Formatear números a 5 dígitos
    return (data || []).map((ticket) => ({
      ...ticket,
      ticket_number_formatted: ticket.ticket_number.toString().padStart(5, '0'),
    }));
  },

  /**
   * Obtiene todos los tickets de un usuario para un sorteo específico
   */
  async getTicketsByRaffle(raffleId: string): Promise<MyTicket[]> {
    // Obtener el usuario actual de la sesión
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener el user_id de la tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (userError || !userData) {
      // Si no existe el usuario, retornar array vacío
      return [];
    }

    const { data, error } = await supabase
      .from('my_tickets')
      .select('*')
      .eq('user_id', userData.id)
      .eq('raffle_id', raffleId)
      .order('purchase_date', { ascending: true });

    if (error) {
      console.warn('Error al obtener tickets por rifa:', error.message);
      return [];
    }

    return data || [];
  },
};
