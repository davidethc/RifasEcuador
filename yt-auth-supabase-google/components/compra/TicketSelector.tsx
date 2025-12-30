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
    if (!isNaN(numValue) && numValue > 0) {
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
    <div className="space-y-6">
      {/* Mensaje informativo sobrio */}
      <div className="rounded-lg p-4 border" style={{ background: 'rgba(42, 45, 69, 0.4)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#E5E7EB' }}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(168, 62, 245, 0.2)', border: '1px solid rgba(168, 62, 245, 0.3)' }}>
            <svg className="w-4 h-4" style={{ color: '#A83EF5' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
              Selecciona la cantidad de boletos que deseas comprar
            </p>
          </div>
        </div>
      </div>

      {/* Grid de opciones rápidas - Cards flotantes sobrias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bundles.map((bundle) => {
          const isSelected = selectedQuantity === bundle.quantity && !customValue;
          return (
            <button
              key={bundle.quantity}
              onClick={() => handleBundleClick(bundle.quantity)}
              className={`relative p-4 md:p-5 rounded-lg border transition-all min-h-[120px] md:min-h-[140px] ${
                isSelected ? 'shadow-lg' : 'hover:shadow-md'
              }`}
              style={isSelected 
                ? { 
                    borderColor: 'rgba(242, 201, 76, 0.3)', 
                    background: '#F5D76E',
                    boxShadow: '0 10px 30px rgba(245, 215, 110, 0.25)',
                    color: '#1A1A1A',
                    transform: 'translateY(-2px)'
                  } 
                : { 
                    borderColor: 'rgba(242, 201, 76, 0.2)',
                    backgroundColor: '#F2C94C',
                    color: '#1A1A1A'
                  }
              }
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(242, 201, 76, 0.4)';
                  e.currentTarget.style.backgroundColor = '#F5D76E';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 215, 110, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(242, 201, 76, 0.2)';
                  e.currentTarget.style.backgroundColor = '#F2C94C';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Badge "Más vendidos" para combo 10 y 20 */}
              {(bundle.quantity === 10 || bundle.quantity === 20) && (
                <div className="absolute -top-2 -right-2 px-2 py-1 rounded-md text-xs font-bold font-[var(--font-dm-sans)] whitespace-nowrap" style={{ 
                  background: '#DC2626',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                }}>
                  Más vendidos
                </div>
              )}

              {/* Check de selección - Posicionado según si hay badge "Más vendidos" */}
              {isSelected && (
                <div className="absolute w-6 h-6 rounded-full flex items-center justify-center" style={{ 
                  background: '#1A1A1A', 
                  border: '2px solid rgba(242, 201, 76, 0.3)',
                  top: bundle.quantity === 10 || bundle.quantity === 20 ? '24px' : '-8px',
                  right: '-8px'
                }}>
                  <svg className="w-3.5 h-3.5" style={{ color: '#F2C94C' }} fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              <div className="text-center">
                <p
                  className={`text-sm font-medium mb-2 font-[var(--font-dm-sans)]`}
                  style={{ color: '#1A1A1A' }}
                >
                  {bundle.label}
                </p>
                <p
                  className={`text-2xl md:text-3xl font-bold mb-1 font-[var(--font-comfortaa)]`}
                  style={{ color: '#1A1A1A' }}
                >
                  {formatPrice(bundle.totalPrice)}
                </p>
                <p className={`text-xs font-[var(--font-dm-sans)] mb-2`} style={{ color: '#1A1A1A', opacity: 0.7 }}>
                  {formatPrice(bundle.pricePerTicket)} c/u
                </p>
                
                {/* Badge de regalo para combo 10 y 20 */}
                {(bundle.quantity === 10 || bundle.quantity === 20) && (
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(26, 26, 26, 0.2)' }}>
                    <p className="text-xs font-semibold font-[var(--font-dm-sans)]" style={{ color: '#1A1A1A', opacity: 0.9 }}>
                      {bundle.quantity === 10 ? 'Te regalamos 5 chances más' : 'Te regalamos 7 chances más'}
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Input personalizado - Fondo casi negro, borde gris */}
      <div className="rounded-lg border p-4" style={{ background: 'rgba(15, 17, 23, 0.8)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#E5E7EB' }}>
        <label className="block text-sm font-medium mb-3 font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
          O ingresa cantidad personalizada:
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Ingresa la cantidad"
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none font-[var(--font-dm-sans)] text-base min-h-[48px] transition-all"
            style={{ 
              borderColor: 'rgba(107, 114, 128, 0.5)',
              backgroundColor: '#0A0B0F',
              color: '#F3F4F6'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(168, 62, 245, 0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(168, 62, 245, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.5)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div className="flex items-center px-4 py-3 rounded-lg border" style={{ background: 'rgba(42, 45, 69, 0.6)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#FFB200' }}>
            <span className="text-lg font-bold font-[var(--font-comfortaa)] whitespace-nowrap">
              {formatPrice((selectedQuantity || 0) * pricePerTicket)}
            </span>
          </div>
        </div>
      </div>

      {/* Resumen y botón continuar - Sobrio y profesional */}
      {selectedQuantity > 0 && (
        <div className="sticky bottom-0 left-0 right-0 rounded-lg p-6 border-t" style={{ 
          background: 'rgba(15, 17, 23, 0.98)',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-[var(--font-dm-sans)] mb-1" style={{ color: '#9CA3AF' }}>
                {selectedQuantity} {selectedQuantity === 1 ? 'boleto' : 'boletos'}
              </p>
              <p className="text-3xl font-bold font-[var(--font-comfortaa)]" style={{ color: '#FFB200' }}>
                {formatPrice(selectedQuantity * pricePerTicket)}
              </p>
            </div>
            <button
              onClick={onContinue}
              className="px-8 py-4 rounded-lg font-semibold text-base transition-all font-[var(--font-dm-sans)] flex items-center gap-2 min-h-[48px]"
              style={{ 
                background: '#FFB200',
                color: '#0F1117',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F59E0B';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFB200';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Continuar</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-center font-[var(--font-dm-sans)]" style={{ color: '#6B7280' }}>
            Los números se asignarán automáticamente después del pago
          </p>
        </div>
      )}
    </div>
  );
}







