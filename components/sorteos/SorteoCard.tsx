"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Ticket } from "lucide-react";

interface SorteoCardProps {
    id: string;
    titulo: string;
    premio: string;
    precio: number;
    imagen?: string;
    totalNumbers?: number;
    soldNumbers?: number;
}

export function SorteoCard({
    id,
    titulo,
    premio,
    precio,
    imagen = "/cardrifa.jpg",
    totalNumbers: _totalNumbers = 1000,
    soldNumbers: _soldNumbers = 0,
}: SorteoCardProps) {
    // Porcentaje quemado en 8 (mostrar siempre 8% hasta que se desee usar el real)
    const percentageSold = 8;
    const isPosterImage = imagen.includes("todospremiod.png");

    return (
        <div
            className="group relative bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden transition-all duration-300 hover:border-[var(--border-purple)] hover:shadow-lg"
            style={{ boxShadow: 'var(--shadow-sm)' }}
        >
            {/* Imagen del sorteo */}
            <div
                className={[
                    "relative overflow-hidden",
                    isPosterImage
                        ? "aspect-[3/4] md:aspect-[4/5] bg-[var(--bg-elevated)]"
                        : "aspect-[4/3]",
                ].join(" ")}
            >
                <Image
                    src={imagen}
                    alt={`Imagen del sorteo ${titulo}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={[
                        isPosterImage
                            ? "object-contain p-3"
                            : "object-cover transition-transform duration-300 group-hover:scale-105",
                    ].join(" ")}
                    loading="lazy"
                    quality={85}
                />
                
                {/* Precio - Badge simple */}
                <div className="absolute top-3 right-3 bg-[var(--primary-gold)] text-[#1A1A1A] px-3 py-1.5 rounded-full text-sm font-bold">
                    ${precio.toFixed(2)}
                </div>
            </div>

            {/* Contenido - Simplificado */}
            <div className="p-4 md:p-5 space-y-3">
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--primary-gold)] transition-colors">
                        {titulo}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                        {premio}
                    </p>
                </div>

                {/* Barra de progreso - Simplificada */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-[var(--text-muted)]">Progreso</span>
                        <span className="text-xs font-bold text-[var(--primary-purple)]">{percentageSold}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--primary-purple)] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentageSold}%` }}
                        />
                    </div>
                </div>

                {/* Botón CTA - Siempre visible, claro */}
                <Link 
                    href={`/comprar/${id}`}
                    className="w-full btn-primary rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    aria-label={`Comprar boletos para ${titulo}`}
                >
                    <Ticket className="w-4 h-4" aria-hidden="true" />
                    <span>Comprar Boletos</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}
