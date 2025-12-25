'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseService, type UserTicket } from '@/services/purchaseService';

/**
 * Página de Mis Boletos
 * Muestra todos los boletos comprados por el usuario autenticado
 */
export default function MisBoletosPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      if (authLoading) {
        return;
      }

      if (!user) {
        // Si no está autenticado, redirigir al login
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userTickets = await purchaseService.getUserTickets();
        setTickets(userTickets);
      } catch (err) {
        console.error('Error al cargar boletos:', err);
        setError('Error al cargar tus boletos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [user, authLoading, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Estado de carga inicial
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
            Cargando tus boletos...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (ya se redirige en useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
            <span className="text-2xl">🎫</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 font-[var(--font-dm-sans)]">
              Tus compras
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
            Mis Boletos
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-[var(--font-dm-sans)]">
            Aquí puedes ver todos los boletos que has comprado
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1 font-[var(--font-dm-sans)]">
                    Error al cargar boletos
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 font-[var(--font-dm-sans)]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && tickets.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="text-6xl mb-6">🎟️</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
              Aún no has comprado boletos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 font-[var(--font-dm-sans)]">
              Participa en nuestros sorteos y gana increíbles premios
            </p>
            <Link
              href="/sorteos"
              className="inline-block px-8 py-4 bg-blue-600 dark:bg-amber-400 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-amber-500 transition-colors font-[var(--font-dm-sans)]"
            >
              Ver Sorteos Disponibles
            </Link>
          </div>
        )}

        {/* Tickets list */}
        {!loading && !error && tickets.length > 0 && (
          <div className="space-y-6 md:space-y-8">
            {tickets.map((ticket) => (
              <div
                key={ticket.order_id}
                className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 md:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Imagen del sorteo */}
                  {ticket.raffle_image_url && (
                    <div className="flex-shrink-0 relative w-full lg:w-48 h-48">
                      <Image
                        src={ticket.raffle_image_url}
                        alt={ticket.raffle_title}
                        fill
                        className="object-cover rounded-xl"
                        sizes="(max-width: 1024px) 100vw, 192px"
                      />
                    </div>
                  )}

                  {/* Información del boleto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 font-[var(--font-comfortaa)]">
                          {ticket.raffle_title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-[var(--font-dm-sans)]">
                          Comprado el {formatDate(ticket.purchase_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-amber-400 font-[var(--font-comfortaa)]">
                          {formatPrice(ticket.total)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-[var(--font-dm-sans)]">
                          {ticket.ticket_numbers.length} boleto{ticket.ticket_numbers.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Números de boletos */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-[var(--font-dm-sans)]">
                        Tus Números de la Suerte:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {ticket.ticket_numbers.map((num) => (
                          <span
                            key={num}
                            className="px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-500 dark:border-green-400 rounded-lg font-bold text-lg text-gray-900 dark:text-white font-[var(--font-comfortaa)] shadow-sm"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Estado y acciones */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                            : ticket.status === 'expired'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {ticket.status === 'completed' 
                            ? '✓ Completado' 
                            : ticket.status === 'expired'
                            ? '✗ Expirado'
                            : ticket.status === 'reserved'
                            ? '⏳ Reservado'
                            : '⏳ Pendiente'}
                        </span>
                      </div>
                      <Link
                        href={`/comprar/${ticket.order_id}/confirmacion`}
                        className="text-sm text-blue-600 dark:text-amber-400 hover:text-blue-700 dark:hover:text-amber-500 font-semibold font-[var(--font-dm-sans)] transition-colors"
                      >
                        Ver detalles →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón volver */}
        {!loading && (
          <div className="mt-12 md:mt-16 text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-[var(--font-dm-sans)]"
            >
              ← Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

