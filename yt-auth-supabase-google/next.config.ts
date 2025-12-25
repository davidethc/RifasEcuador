import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configurar headers para Payphone
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: '/:path*',
        headers: [
          {
            // Configurar Referrer-Policy para Payphone
            // Recomendación de Payphone: 'origin' u 'origin-when-cross-origin'
            // Esto permite que Payphone valide el origen de la solicitud
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
