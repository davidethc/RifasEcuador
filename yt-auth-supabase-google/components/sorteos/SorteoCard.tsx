"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
    imagen = "/rifa.png",
    totalNumbers = 1000,
    soldNumbers = 0,
}: SorteoCardProps) {
    const percentageSold = Math.min(100, Math.round((soldNumbers / totalNumbers) * 100));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative card-floating rounded-xl overflow-hidden transition-all duration-300"
        >
            {/* Image Container with radial glow */}
            <div className="relative aspect-[4/3] overflow-hidden hero-radial-glow">
                <Image
                    src={imagen}
                    alt={titulo}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Price Tag with neon glow */}
                <div className="absolute top-3 right-3 glass-card px-3 py-1.5 rounded-full z-10 neon-glow-gold">
                    <span className="text-sm font-bold text-[#FFB200] neon-text-gold">
                        ${precio.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-[#FFB200] transition-colors neon-text-purple group-hover:neon-text-gold">
                        {titulo}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2 h-10">
                        {premio}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-300">
                            <span className="text-[#A83EF5] font-bold">{soldNumbers}</span> vendidos
                        </span>
                        <span className="text-gray-400">
                            {totalNumbers} disponibles
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentageSold}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#A83EF5] to-[#683DF5] rounded-full neon-glow-purple"
                        />
                    </div>
                </div>

                {/* Action Button - Premium CTA */}
                <Link 
                    href={`/comprar/${id}`}
                    className="w-full btn-cta-primary rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-semibold"
                >
                    <Ticket className="w-4 h-4" />
                        Comprar Boletos
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
            </div>
        </motion.div>
    );
}
