import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Optimizaciones de compilación
  // swcMinify está habilitado por defecto en Next.js 15+
  compress: true,
  
  // Optimizar producción
  productionBrowserSourceMaps: false,
  
  // Optimizaciones adicionales
  poweredByHeader: false, // Remover header X-Powered-By
  reactStrictMode: true,
  
  // Optimización de bundle
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dropdown-menu'],
  },
  
  // Headers de seguridad, performance y Payphone
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: '/:path*',
        headers: [
          {
            // Configurar Referrer-Policy para Payphone
            // Recomendación de Payphone: 'origin' u 'origin-when-cross-origin'
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // Cache para assets estáticos
        source: '/:path*\\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
