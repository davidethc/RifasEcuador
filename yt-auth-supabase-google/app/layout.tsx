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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Light Mode: Teal Corner Cool Background */}
          <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:bg-[#020617] relative overflow-hidden">
            {/* Light Mode Background - Teal Corners with better visibility */}
            <div
              className="absolute inset-0 z-0 dark:hidden"
              style={{
                backgroundImage: `
                  radial-gradient(circle 800px at 0% 0%, rgba(167, 243, 208, 0.4), transparent),
                  radial-gradient(circle 800px at 100% 0%, rgba(167, 243, 208, 0.4), transparent),
                  radial-gradient(circle 600px at 50% 100%, rgba(134, 239, 172, 0.2), transparent)
                `,
              }}
            />

            {/* Dark Mode Background - Enhanced Grid with Magenta/Purple Orb */}
            <div
              className="absolute inset-0 z-0 hidden dark:block"
              style={{
                background: "#020617",
                backgroundImage: `
                  linear-gradient(to right, rgba(71,85,105,0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(71,85,105,0.3) 1px, transparent 1px),
                  radial-gradient(circle at 50% 50%, rgba(236,72,153,0.25) 0%, rgba(168,85,247,0.15) 40%, transparent 70%)
                `,
                backgroundSize: "40px 40px, 40px 40px, 100% 100%",
              }}
            />


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
