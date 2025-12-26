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
        // Paleta profesional para rifas - diseñada estratégicamente
        // PRIMARY (#3ab795): Verde esmeralda - Confianza, acciones principales, éxito
        primary: {
          50: '#e6f7f3',   // Muy claro
          100: '#cceee7',  // Claro
          200: '#99ddcf',  // Suave
          300: '#66ccb7',  // Medio claro
          400: '#4abfa3',  // Medio
          500: '#3ab795',  // PRINCIPAL - Botones CTAs, elementos principales
          600: '#2e9277',  // Oscuro - Hover, estados activos
          700: '#236d59',  // Más oscuro
          800: '#17483b',  // Muy oscuro
          900: '#0c231d',  // Casi negro
        },
        // SECONDARY (#a0e8af): Verde menta claro - Fondos suaves, elementos secundarios
        secondary: {
          50: '#f0fdf4',   // Muy claro
          100: '#e6f9eb',  // Claro
          200: '#ccf3d7',  // Suave
          300: '#b3edc3',  // Medio claro
          400: '#a0e8af',  // PRINCIPAL - Fondos, hover states, elementos secundarios
          500: '#8de19f',  // Medio
          600: '#7ada8f',  // Oscuro
          700: '#5cb371',  // Más oscuro
          800: '#3d8c52',  // Muy oscuro
          900: '#1e4633',  // Casi negro
        },
        // ACCENT (#ffcf56): Amarillo dorado - Urgencia, premios, destacados (texto negro)
        accent: {
          50: '#fffbf0',   // Muy claro
          100: '#fff7e0',  // Claro
          200: '#ffefc1',  // Suave
          300: '#ffe7a2',  // Medio claro
          400: '#ffdf83',  // Medio
          500: '#ffcf56',  // PRINCIPAL - Premios, urgencia, destacados
          600: '#ffc633',  // Oscuro
          700: '#e6b025',  // Más oscuro
          800: '#cc9918',  // Muy oscuro
          900: '#99720c',  // Casi negro
        },
      },
      fontFamily: {
        comfortaa: ['var(--font-comfortaa)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
