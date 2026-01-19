import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://altokeec.com';
  
  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sorteos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/como-jugar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Obtener sorteos activos desde Supabase (solo si está disponible)
  let rafflePages: MetadataRoute.Sitemap = [];
  
  try {
    // Solo intentar obtener sorteos si las variables de entorno están disponibles
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data: raffles, error } = await supabase
        .from('raffles')
        .select('id, updated_at, status')
        .eq('status', 'active')
        .limit(100); // Limitar a 100 para evitar sitemaps muy grandes

      if (!error && raffles && raffles.length > 0) {
        rafflePages = raffles.map((raffle) => ({
          url: `${baseUrl}/sorteos/${raffle.id}`,
          lastModified: raffle.updated_at ? new Date(raffle.updated_at) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    // Si falla, continuar sin sorteos (sitemap solo con páginas estáticas)
    // En producción, no loguear errores de sitemap para evitar ruido
    // El error se silencia intencionalmente para no afectar el sitemap
    // ⚠️ ATENCIÓN: Usar logger en lugar de console.warn para consistencia con el resto del proyecto
    if (process.env.NODE_ENV === 'development') {
      // TODO: Reemplazar console.warn con logger.warn o logger.error
      // eslint-disable-next-line no-console
      console.warn('No se pudieron obtener sorteos para el sitemap:', error);
    }
  }

  return [...staticPages, ...rafflePages];
}

