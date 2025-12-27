'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface OrderDetails {
  id: string;
  raffle_id: string;
  numbers: string[];
  total: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  raffles?: {
    title: string;
    description: string;
    image_url: string;
    price_per_ticket: number;
  } | null;
}

/**
 * Página de confirmación después del pago
 * Muestra los números de boletos asignados y el estado del pago
 */
export default function ConfirmacionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transactionId = searchParams.get('transactionId');

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar el endpoint API que tiene acceso admin a la base de datos
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        console.error('Error al obtener orden:', response.status);
        setError('No se pudo cargar la información de la orden');
        return;
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        setError('Orden no encontrada');
        return;
      }

      setOrder(result.data as OrderDetails);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

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

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
            Cargando información de tu compra...
          </p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
            Error al cargar la orden
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 font-[var(--font-dm-sans)]">
            {error || 'La orden no existe o no está disponible'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-accent-600 transition-colors font-[var(--font-dm-sans)]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === 'completed';
  const isPending = order.status === 'reserved' || order.status === 'pending';
  const isExpired = order.status === 'expired';

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado con estado */}
        <div className="text-center mb-8">
          {isCompleted && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {isPending && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
              <svg className="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {isExpired && (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 font-[var(--font-comfortaa)]">
            {isCompleted && '¡Compra Exitosa!'}
            {isPending && 'Pago Pendiente'}
            {isExpired && 'Orden Expirada'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
            {isCompleted && 'Tu compra ha sido confirmada exitosamente'}
            {isPending && 'Estamos esperando la confirmación de tu pago'}
            {isExpired && 'Esta orden ha expirado o fue cancelada'}
          </p>
        </div>

        {/* Números de boletos */}
        {order.numbers && order.numbers.length > 0 && (
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl border-2 border-primary-200 dark:border-primary-800 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center font-[var(--font-comfortaa)]">
              🎟️ Tus Números de la Suerte
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {order.numbers.map((num) => (
                <div
                  key={num}
                  className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-400 rounded-xl font-bold text-2xl text-gray-900 dark:text-white font-[var(--font-comfortaa)] shadow-lg"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detalles de la compra */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Información del sorteo */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
            {order.raffles?.image_url && (
              <div className="mb-4 rounded-xl overflow-hidden relative w-full h-48">
                <Image
                  src={order.raffles.image_url}
                  alt={order.raffles.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-[var(--font-comfortaa)]">
              {order.raffles?.title || 'Sorteo'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 font-[var(--font-dm-sans)]">
              {order.raffles?.description || 'Información del sorteo no disponible'}
            </p>
            <div className="space-y-2 text-sm">
              {order.raffles?.price_per_ticket && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Precio por boleto:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(order.raffles.price_per_ticket)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cantidad:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {order.numbers.length} boleto{order.numbers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white font-bold">Total Pagado:</span>
                <span className="font-bold text-primary-600 dark:text-accent-500 text-lg">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Información de la orden */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
              Información de la Orden
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">ID de Orden</p>
                <p className="font-mono text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {order.id}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Fecha de Compra</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Método de Pago</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {order.payment_method || 'Pendiente'}
                </p>
              </div>
              {transactionId && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">ID de Transacción</p>
                  <p className="font-mono text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    {transactionId}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Estado</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isCompleted ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                    isPending ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                  }`}>
                  {isCompleted && '✓ Completado'}
                  {isPending && '⏳ Pendiente'}
                  {isExpired && '✗ Expirado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/sorteos')}
            className="px-8 py-3 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-accent-600 transition-colors font-[var(--font-dm-sans)]"
          >
            Ver más sorteos
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-[var(--font-dm-sans)]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
