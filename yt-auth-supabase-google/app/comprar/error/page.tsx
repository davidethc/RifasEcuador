'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Página de error en el proceso de compra
 * Muestra mensajes de error amigables y opciones para reintentar
 */
export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const errorMessage = searchParams.get('message') || 'Ocurrió un error inesperado';
    const orderIdParam = searchParams.get('orderId');

    setMessage(errorMessage);
    setOrderId(orderIdParam);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Icono de error */}
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600 dark:text-red-400"
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
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-comfortaa)]">
          ¡Ups! Algo salió mal
        </h1>

        {/* Mensaje de error */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
          <p className="text-gray-700 dark:text-gray-300 font-[var(--font-dm-sans)]">
            {message}
          </p>
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
            No te preocupes, tu información está segura. Puedes intentar nuevamente o contactar
            con nuestro soporte si el problema persiste.
          </p>
          {orderId && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 font-mono">
              ID de Orden: {orderId}
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {orderId ? (
            <button
              onClick={() => router.push(`/comprar/${orderId}`)}
              className="w-full px-6 py-3 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-accent-600 transition-colors font-[var(--font-dm-sans)]"
            >
              Intentar de nuevo
            </button>
          ) : (
            <button
              onClick={() => router.push('/sorteos')}
              className="w-full px-6 py-3 bg-primary-600 dark:bg-accent-500 text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-accent-600 transition-colors font-[var(--font-dm-sans)]"
            >
              Ver sorteos disponibles
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-[var(--font-dm-sans)]"
          >
            Volver al inicio
          </button>
        </div>

        {/* Información de contacto */}
        <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-[var(--font-dm-sans)]">
            ¿Necesitas ayuda?
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://wa.me/593999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline font-[var(--font-dm-sans)]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              href="mailto:soporte@tudominio.com"
              className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-accent-500 hover:underline font-[var(--font-dm-sans)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}







