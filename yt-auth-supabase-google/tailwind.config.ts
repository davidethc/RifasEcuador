import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta oficial del proyecto
        brand: {
          // Fondos principales
          'bg-1': '#100235',      // Fondo oscuro principal
          'bg-2': '#360254',      // Fondo oscuro secundario
          'bg-3': '#683DF5',      // Fondo morado brillante
          'bg-4': '#5A0B5C',     // Fondo morado oscuro
          'bg-5': '#b92163',      // Fondo rosa/magenta
          // Textos
          'text-white': '#ffffff', // Texto blanco
          'text-gold': '#FFB200',  // Texto amarillo/dorado
          // Botones
          'btn-gradient-start': '#ffb200',  // Inicio gradiente botón
          'btn-gradient-end': '#f02080',   // Fin gradiente botón
          'btn-purple': '#A83EF5',         // Botón morado
          // Componentes
          'comp-purple': '#A83EF5',        // Componente morado
          'comp-orange': '#EC6624',        // Componente naranja
          'comp-blue': '#128ECE',          // Componente azul
        },
        // Legacy Template Colors (mantener compatibilidad)
        legacy: {
          'purple-deep': '#100235',
          'purple-light': '#360254',
          'purple-medium': '#5A0B5C',
          'purple-bright': '#683DF5',
          'pink': '#b92163',
          'neon': '#f02080',
          'gold': '#FFB200',
        },
      },
      fontFamily: {
        comfortaa: ['var(--font-comfortaa)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'josefin': ['var(--font-josefin)', 'sans-serif'],
        'space-grotesk': ['var(--font-space-grotesk)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
