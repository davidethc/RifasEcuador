export function StructuredData() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://altokeec.com';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rifas Ecuador",
    "alternateName": "Rifas Ecuador - Participa y Gana",
    "url": appUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${appUrl}/logosrifaweb.png`,
      "width": 625,
      "height": 625
    },
    "description": "Participa en sorteos legales en todo Ecuador y gana increíbles premios. Autos, motos y muchos premios sorpresa. Sorteos 100% transparentes y verificados.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "es"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Ecuador"
    },
    "offers": {
      "@type": "Offer",
      "category": "Gaming",
      "availability": "https://schema.org/InStock"
    }
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Rifas Ecuador",
    "url": appUrl,
    "description": "Participa en sorteos legales en todo Ecuador y gana increíbles premios",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${appUrl}/sorteos?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
    </>
  );
}

