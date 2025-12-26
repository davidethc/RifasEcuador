"use client";

import { useEffect, useState } from "react";

interface ViewersCounterProps {
  min?: number;
  max?: number;
  updateInterval?: number;
}

/**
 * Componente que muestra un contador de personas viendo el sorteo
 * Simula números que suben y bajan para crear urgencia
 */
export function ViewersCounter({ min = 3, max = 25, updateInterval = 3000 }: ViewersCounterProps) {
  const [viewers, setViewers] = useState<number>(min);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generar un número aleatorio entre min y max
      const newViewers = Math.floor(Math.random() * (max - min + 1)) + min;
      setViewers(newViewers);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [min, max, updateInterval]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
      <div className="relative w-2 h-2">
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 bg-red-500 rounded-full"></div>
      </div>
      <span className="text-xs md:text-sm font-semibold text-red-700 dark:text-red-400 font-[var(--font-dm-sans)]">
        {viewers} personas viendo
      </span>
    </div>
  );
}

