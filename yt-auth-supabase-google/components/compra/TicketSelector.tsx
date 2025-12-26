'use client';

import { useState } from 'react';
import type { TicketBundle } from '@/types/purchase.types';

interface TicketSelectorProps {
  pricePerTicket: number;
  selectedQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onContinue: () => void;
}

/**
 * Componente para seleccionar cantidad de boletos
 * Muestra opciones rápidas (1, 5, 10, 20) y permite cantidad personalizada
 */
export function TicketSelector({
  pricePerTicket,
  selectedQuantity,
  onQuantityChange,
  onContinue,
}: TicketSelectorProps) {
  const [customValue, setCustomValue] = useState('');

  // Definir combos disponibles
  const bundles: TicketBundle[] = [
    { quantity: 1, label: '1 Boleto', pricePerTicket, totalPrice: pricePerTicket },
    { quantity: 5, label: 'Combo 5', pricePerTicket, totalPrice: pricePerTicket * 5 },
    { quantity: 10, label: 'Combo 10', pricePerTicket, totalPrice: pricePerTicket * 10 },
    { quantity: 20, label: 'Combo 20', pricePerTicket, totalPrice: pricePerTicket * 20 },
  ];

  const handleBundleClick = (quantity: number) => {
    onQuantityChange(quantity);
    setCustomValue('');
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
      onQuantityChange(numValue);
    } else if (value === '') {
      onQuantityChange(0);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Mensaje motivador compacto */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-700">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)]">
              ⚡ ¡Más boletos = Más chances de ganar!
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-[var(--font-dm-sans)]">
              Selecciona rápido y participa ahora
            </p>
          </div>
        </div>
      </div>

      {/* Grid de opciones rápidas - MÁS COMPACTO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {bundles.map((bundle) => {
          const isSelected = selectedQuantity === bundle.quantity && !customValue;
          return (
            <button
              key={bundle.quantity}
              onClick={() => handleBundleClick(bundle.quantity)}
              className={`relative p-4 md:p-5 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 ${
                isSelected
                  ? 'border-blue-600 dark:border-amber-400 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-amber-900/30 dark:to-amber-900/20 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-amber-500 bg-white dark:bg-gray-800 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-600 dark:bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-4 h-4 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {bundle.quantity >= 10 && (
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Popular
                </div>
              )}
              <div className="text-center">
                <p
                  className={`text-xs md:text-sm font-medium mb-1 font-[var(--font-dm-sans)] ${
                    isSelected ? 'text-blue-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {bundle.label}
                </p>
                <p
                  className={`text-2xl md:text-3xl font-bold mb-0.5 font-[var(--font-comfortaa)] ${
                    isSelected ? 'text-blue-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {formatPrice(bundle.totalPrice)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-[var(--font-dm-sans)]">
                  {formatPrice(bundle.pricePerTicket)} c/u
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Input personalizado - MÁS COMPACTO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-4">
        <label className="block text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 font-[var(--font-dm-sans)]">
          O ingresa cantidad personalizada:
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="100"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="1-100"
            className="flex-1 px-3 py-2 md:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-600 dark:focus:border-amber-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-[var(--font-dm-sans)] text-sm md:text-base"
          />
          <div className="flex items-center px-3 md:px-4 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="text-base md:text-lg font-bold text-blue-600 dark:text-amber-400 font-[var(--font-comfortaa)] whitespace-nowrap">
              {formatPrice((selectedQuantity || 0) * pricePerTicket)}
            </span>
          </div>
        </div>
        {customValue && selectedQuantity > 100 && (
          <p className="text-xs text-red-500 mt-2 font-[var(--font-dm-sans)]">
            Máximo 100 boletos
          </p>
        )}
      </div>

      {/* Resumen y botón continuar - MÁS COMPACTO Y ATRACTIVO */}
      {selectedQuantity > 0 && selectedQuantity <= 100 && (
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-amber-400 dark:to-amber-500 rounded-xl p-4 shadow-2xl animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-white/80 dark:text-gray-900/80 font-[var(--font-dm-sans)]">
                {selectedQuantity} {selectedQuantity === 1 ? 'boleto' : 'boletos'}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white dark:text-gray-900 font-[var(--font-comfortaa)]">
                {formatPrice(selectedQuantity * pricePerTicket)}
              </p>
            </div>
            <button
              onClick={onContinue}
              className="px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-gray-900 text-blue-600 dark:text-amber-400 rounded-xl font-bold text-base md:text-lg hover:scale-105 active:scale-95 transition-all shadow-xl font-[var(--font-dm-sans)] flex items-center gap-2"
            >
              <span>Continuar</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-center text-white/70 dark:text-gray-900/70 font-[var(--font-dm-sans)]">
            🎯 Números asignados automáticamente tras el pago
          </p>
        </div>
      )}
    </div>
  );
}






