import type { Metadata } from "next";
import { Comfortaa, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer/Footer';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { ThemeProvider } from "next-themes";

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


export const metadata: Metadata = {
  title: "Rifas Ecuador",
  description: "Participa en nuestros sorteos y gana increíbles premios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Número de WhatsApp (formato: código país + número, sin + ni espacios)
  // Ejemplo: '593939039191' para Ecuador
  const whatsappNumber = '593986910158'; // Cambia este número por el tuyo

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${comfortaa.variable} ${dmSans.variable} antialiased`} suppressHydrationWarning>
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
