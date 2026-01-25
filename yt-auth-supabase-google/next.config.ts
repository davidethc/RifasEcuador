import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

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
    // Permitir imágenes desde Supabase Storage (mis-boletos / confirmaciones)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mmkqihvjruwdkhrylhxc.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
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
    const headers = [
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
    ] as Awaited<ReturnType<NonNullable<NextConfig["headers"]>>>;

    // Evitar que imágenes de /public queden "pegadas" 1 año con immutable.
    // Esto era la causa principal de que en producción no se reflejen cambios de imágenes.
    headers.push({
      // Media (imágenes / video): revalidar siempre en prod; sin cache en dev.
      source: '/:path*\\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm)',
      headers: [
        {
          key: 'Cache-Control',
          value: isProd ? 'public, max-age=0, must-revalidate' : 'no-store',
        },
      ],
    });

    headers.push({
      // Fuentes: cache fuerte en prod; sin cache en dev.
      source: '/:path*\\.(woff|woff2|ttf|eot)',
      headers: [
        {
          key: 'Cache-Control',
          value: isProd ? 'public, max-age=31536000, immutable' : 'no-store',
        },
      ],
    });

    return headers;
  },
};

export default nextConfig;
