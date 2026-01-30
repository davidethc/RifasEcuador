import type { Metadata } from "next";
import { Comfortaa, DM_Sans, Space_Grotesk, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer/Footer';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { ThemeProvider } from "next-themes";
import { StructuredData } from '@/components/seo/StructuredData';

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-comfortaa",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});


const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://altokeec.com';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Rifas Ecuador - Participa y Gana Premios Increíbles",
    template: "%s | Rifas Ecuador"
  },
  description: "Participa en sorteos legales en todo Ecuador y gana increíbles premios. Autos, motos y muchos premios sorpresa. Sorteos 100% transparentes y verificados.",
  keywords: [
    "rifas ecuador",
    "sorteos ecuador",
    "rifas online",
    "sorteos legales",
    "ganar premios",
    "rifas autos",
    "sorteos motos",
    "rifas verificadas",
    "premios ecuador",
    "participar sorteos"
  ],
  authors: [{ name: "Rifas Ecuador" }],
  creator: "Rifas Ecuador",
  publisher: "Rifas Ecuador",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: "/",
    siteName: "Rifas Ecuador",
    title: "Rifas Ecuador - Participa y Gana Premios Increíbles",
    description: "Participa en sorteos legales en todo Ecuador y gana increíbles premios. Autos, motos y muchos premios sorpresa. Sorteos 100% transparentes y verificados.",
    images: [
      {
        url: "/logosrifaweb.png",
        width: 625,
        height: 625,
        alt: "Rifas Ecuador - Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rifas Ecuador - Participa y Gana Premios Increíbles",
    description: "Participa en sorteos legales en todo Ecuador y gana increíbles premios. Autos, motos y muchos premios sorpresa.",
    images: ["/logosrifaweb.png"],
    creator: "@rifasecuador",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: `${appUrl}/logosrifaweb.png`, sizes: "any" },
      { url: `${appUrl}/logosrifaweb.png`, sizes: "32x32", type: "image/png" },
      { url: `${appUrl}/logosrifaweb.png`, sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: `${appUrl}/logosrifaweb.png`, sizes: "180x180", type: "image/png" },
    ],
    shortcut: `${appUrl}/logosrifaweb.png`,
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  category: "Gaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Número de WhatsApp (formato: código país + número, sin + ni espacios)
  // Ejemplo: '+593 96 094 8984' → '593960948984' para Ecuador
  const whatsappNumber = '593960948984';

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preload recursos críticos para mejorar LCP */}
        <link rel="preload" href="/logosrifaweb.png" as="image" />
        <link rel="dns-prefetch" href="https://mmkqihvjruwdkhrylhxc.supabase.co" />
      </head>
      <body className={`${comfortaa.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${josefinSans.variable} antialiased`} suppressHydrationWarning>
        <StructuredData />
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
          {/* Fondo global con paleta oficial */}
          <div className="min-h-screen w-full bg-gradient-to-b from-brand-bg-1 via-brand-bg-2 to-brand-bg-1 relative overflow-hidden">
            {/* Glow superior con colores oficiales */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle 500px at 50% 80px, rgba(185,33,99,0.25), transparent),
                  radial-gradient(circle 600px at 80% 120px, rgba(104,61,245,0.15), transparent),
                  radial-gradient(circle 600px at 20% 140px, rgba(168,62,245,0.15), transparent)
                `,
              }}
            />

            {/* Fondo oscuro eliminado */}


            {/* Contenido de la app */}
            <div className="relative z-10">
              <AuthProvider>
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1 pt-24">
                      {children}
                    </main>
                    <Footer />
                  </div>

                  {/* Botón flotante de WhatsApp - Siempre visible */}
                  <WhatsAppButton
                    phoneNumber={whatsappNumber}
                    message="Hola, me interesa participar en los sorteos"
                  />
                </ProtectedRoute>
              </AuthProvider>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
