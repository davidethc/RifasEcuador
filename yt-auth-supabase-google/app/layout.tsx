import type { Metadata } from "next";
import { Comfortaa, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer/Footer';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';

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
        <AuthProvider>
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
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
      </body>
    </html>
  );
}
