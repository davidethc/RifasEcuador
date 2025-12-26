"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { SorteoCard } from "./SorteoCard";
import type { Raffle } from "@/types/database.types";

interface Sorteo {
  id: string;
  titulo: string;
  premio: string;
  precio: number;
  
  imagen?: string;
}

interface SorteosGridProps {
  sorteos?: Sorteo[];
}

/**
 * Grid de sorteos destacados
 * Muestra los sorteos activos desde Supabase
 * - Accesible públicamente (no requiere autenticación)
 * - Muestra solo sorteos con status 'active'
 * - Ordena por featured primero, luego por fecha de creación
 */
export function SorteosGrid({ sorteos }: SorteosGridProps) {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRaffles() {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 Intentando conectar a Supabase...');
        
        // Primero intentar con todas las columnas (incluyendo featured)
        let { data, error: fetchError } = await supabase
          .from('raffles')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        // Si el error es por columna featured, intentar sin ella
        if (fetchError?.code === '42703' && fetchError?.message?.includes('featured')) {
          console.log('⚠️ Columna featured no existe, consultando sin ella...');
          
          const result = await supabase
            .from('raffles')
            .select('id, title, description, price_per_ticket, total_numbers, status, start_date, end_date, created_at')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          
          data = result.data;
          fetchError = result.error;
        }

        if (fetchError) {
          console.error('❌ Error fetching raffles:', {
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
            code: fetchError.code,
          });
          
          // Mensajes de error más específicos
          if (fetchError.code === 'PGRST116' || fetchError.message?.includes('permission denied')) {
            setError('⚠️ RLS bloqueando consulta. Ve a Supabase y ejecuta: sql/policies_raffles.sql');
          } else if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
            setError('⚠️ La tabla "raffles" no existe. Crea la tabla en Supabase primero.');
          } else {
            setError(`Error: ${fetchError.message || 'No se pudieron cargar los sorteos'}`);
          }
          return;
        }

        console.log('✅ Sorteos cargados:', data?.length || 0);
        setRaffles(data || []);
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setError('Ocurrió un error inesperado. Verifica la consola.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRaffles();
  }, []);

  // Datos de fallback si no hay en Supabase o está cargando
  const sorteosDestacados: Sorteo[] = sorteos && sorteos.length > 0
    ? sorteos
    : raffles.length > 0
    ? raffles.map((raffle) => ({
        id: raffle.id,
        titulo: raffle.title,
        premio: raffle.description || raffle.title,
        precio: raffle.price_per_ticket,
        destacado: raffle.featured || false,
        imagen: raffle.image_url || '/rifa.png',
      }))
    : [
        {
          id: "1",
          titulo: "Sorteo Especial",
          premio: "Moto Yamaha MT-07 2024",
          precio: 1.00,
          destacado: true,
          imagen: "/yamaha.jpg",
        },
        {
          id: "2",
          titulo: "Gran Sorteo",
          premio: "Carro Kia 2024",
          precio: 1.00,
          destacado: true,
          imagen: "/kia.jpg",
        },
        {
          id: "3",
          titulo: "Sorteo Premium",
          premio: "Mazda 2024",
          precio: 1.00,
          destacado: true,
          imagen: "/mazdaprin.png",
        },
      ];

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto">

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-amber-400"></div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Sorteos grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {sorteosDestacados.map((sorteo) => (
              <SorteoCard
                key={sorteo.id}
                id={sorteo.id}
                titulo={sorteo.titulo}
                premio={sorteo.premio}
                precio={sorteo.precio}
                imagen={sorteo.imagen}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && sorteosDestacados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No hay sorteos activos en este momento
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
