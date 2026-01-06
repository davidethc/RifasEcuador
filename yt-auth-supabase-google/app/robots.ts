import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://altokeec.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/mis-boletos',
          '/comprar/',
          '/payment/',
          '/update-password',
          '/reset-password',
          '/verify-email',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/mis-boletos',
          '/comprar/',
          '/payment/',
          '/update-password',
          '/reset-password',
          '/verify-email',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

