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
            .select('id, title, description, price_per_ticket, total_numbers, status, start_date, end_date, created_at, image_url')
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

  // Obtener boletos vendidos para cada sorteo
  const [soldCounts, setSoldCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchSoldCounts() {
      if (raffles.length === 0) return;

      try {
        console.log('🔍 [SOLD_COUNTS] Iniciando conteo para', raffles.length, 'sorteos');
        
        // Usar endpoint API que bypass RLS usando service role
        const raffleIds = raffles.map(r => r.id).join(',');
        const response = await fetch(`/api/stats/sold-by-raffle?raffleIds=${raffleIds}`);
        const data = await response.json();

        if (data.success && data.counts) {
          console.log('✅ [SOLD_COUNTS] Conteos recibidos:', data.counts);
          setSoldCounts(data.counts);
          } else {
          console.error('❌ [SOLD_COUNTS] Error al obtener conteos:', data.error);
          // Fallback: poner todos en 0
          const counts: Record<string, number> = {};
          raffles.forEach(r => {
            counts[r.id] = 0;
          });
          setSoldCounts(counts);
        }
      } catch (err) {
        console.error('❌ [SOLD_COUNTS] Error al obtener conteo de boletos:', err);
        // Fallback: poner todos en 0
        const counts: Record<string, number> = {};
        raffles.forEach(r => {
          counts[r.id] = 0;
        });
        setSoldCounts(counts);
      }
    }

    if (raffles.length > 0) {
      fetchSoldCounts();
    }
  }, [raffles]);

  // Datos de fallback si no hay en Supabase o está cargando
  const sorteosDestacados: (Sorteo & { totalNumbers?: number; soldNumbers?: number })[] = sorteos && sorteos.length > 0
    ? sorteos.map(s => ({ 
        ...s, 
        totalNumbers: 1000, 
        soldNumbers: soldCounts[s.id] || 0  // Usar soldCounts en lugar de 0
      }))
    : raffles.length > 0
    ? raffles.map((raffle) => ({
        id: raffle.id,
        titulo: raffle.title,
        premio: raffle.description || raffle.title,
        precio: raffle.price_per_ticket,
        imagen: raffle.image_url || '/rifa.png',
        totalNumbers: raffle.total_numbers || 1000,
        soldNumbers: soldCounts[raffle.id] || 0,
      }))
    : [
        {
          id: "1",
          titulo: "Sorteo Especial",
          premio: "Moto Yamaha MT-07 2024",
          precio: 1.00,
          imagen: "/yamaha.jpg",
          totalNumbers: 1000,
          soldNumbers: 450,
        },
        {
          id: "2",
          titulo: "Gran Sorteo",
          premio: "Carro Kia 2024",
          precio: 1.00,
          imagen: "/kia.jpg",
          totalNumbers: 1000,
          soldNumbers: 320,
        },
        {
          id: "3",
          titulo: "Sorteo Premium",
          premio: "Mazda 2024",
          precio: 1.00,
          imagen: "/mazdaprin.png",
          totalNumbers: 1000,
          soldNumbers: 680,
        },
      ];

  return (
    <section className="w-full py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-accent-500"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {sorteosDestacados.map((sorteo) => (
              <SorteoCard
                key={sorteo.id}
                id={sorteo.id}
                titulo={sorteo.titulo}
                premio={sorteo.premio}
                precio={sorteo.precio}
                imagen={sorteo.imagen}
                totalNumbers={sorteo.totalNumbers}
                soldNumbers={sorteo.soldNumbers}
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
