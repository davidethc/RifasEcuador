'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/hooks/usePurchase';
import type { Raffle } from '@/types/database.types';
import type { PurchaseFormData } from '@/types/purchase.types';
import { logger } from '@/utils/logger';

// Componentes críticos
import { TicketSelector } from '@/components/compra/TicketSelector';
import { PurchaseFormWithPayment } from '@/components/compra/PurchaseFormWithPayment';

// Componentes no críticos - dynamic imports para mejorar rendimiento
import dynamic from 'next/dynamic';
const VideoModal = dynamic(() => import('@/components/ui/VideoModal').then(mod => ({ default: mod.VideoModal })), { ssr: false });
const SalesProgressBar = dynamic(() => import('@/components/compra/SalesProgressBar').then(mod => ({ default: mod.SalesProgressBar })), { ssr: true });

// Assets (Legacy)
// Nota: Asegurarse que las imágenes existan en public/legacy/img/

export default function ComprarPage() {
   const params = useParams();
   const router = useRouter();
   const { user, isLoading: authLoading } = useAuth();
   const raffleId = params.id as string;

   // Estado para rotación de imágenes en el HeroCarousel
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [isZooming, setIsZooming] = useState(false);
   const heroImages = [
      { src: "/kiario23.png", alt: "KIA Rio", videoUrl: "https://www.youtube.com/watch?v=Am1abV7Ckb8" },
      { src: "/Yamaha MT-07.png", alt: "Yamaha MT-07", videoUrl: "https://www.youtube.com/watch?v=uWmuNMR3QQM" },
      { src: "/KTM.png", alt: "KTM", videoUrl: "https://www.youtube.com/watch?v=wpz5ODAjia0" },
   ];

   const [raffle, setRaffle] = useState<Raffle | null>(null);
   const [raffleLoading, setRaffleLoading] = useState(true);
   const [raffleError, setRaffleError] = useState<string | null>(null);
   const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
   const [isPremioVideoModalOpen, setIsPremioVideoModalOpen] = useState(false);
   const [isPremio2VideoModalOpen, setIsPremio2VideoModalOpen] = useState(false);
   const [isPremio3VideoModalOpen, setIsPremio3VideoModalOpen] = useState(false);

   const {
      isLoading,
      error,
      createPurchase,
      saleId,
      orderId,
      ticketNumbers,
      quantity,
      setQuantity
   } = usePurchase(raffleId);

   // Cargar información del sorteo
   useEffect(() => {
      async function fetchRaffle() {
         try {
            setRaffleLoading(true);
            setRaffleError(null);

            const { data, error: fetchError } = await supabase
               .from('raffles')
               .select('*')
               .eq('id', raffleId)
               .eq('status', 'active')
               .single();

            if (fetchError) {
               logger.error('Error fetching raffle:', fetchError);
               setRaffleError('No se pudo cargar el sorteo');
               return;
            }

            setRaffle(data);

         } catch (err) {
            logger.error('Unexpected error:', err);
            setRaffleError('Ocurrió un error inesperado');
         } finally {
            setRaffleLoading(false);
         }
      }

      if (raffleId) {
         fetchRaffle();
      }
   }, [raffleId]);

   // Manejar compra
   const handlePurchase = async (data: PurchaseFormData) => {
      return await createPurchase(data);
   };

   const initialPurchaseData = useMemo<Partial<PurchaseFormData> | undefined>(() => {
      if (!user) return undefined;

      const email = user.email || '';
      const fullName =
         user.user_metadata?.full_name ||
         user.user_metadata?.name ||
         user.user_metadata?.display_name ||
         '';

      const parts = fullName
         .toString()
         .trim()
         .split(/\s+/)
         .filter(Boolean);

      const name = parts.length > 0 ? parts[0] : '';
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

      return {
         name,
         lastName,
         email,
         confirmEmail: email,
      };
   }, [user]);

   // Rotación automática de imágenes en el HeroCarousel con efecto zoom
   useEffect(() => {
      const interval = setInterval(() => {
         setIsZooming(true);
         setTimeout(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
            setTimeout(() => {
               setIsZooming(false);
            }, 100);
         }, 300);
      }, 4000); // Cambia cada 4 segundos

      return () => clearInterval(interval);
   }, [heroImages.length]);


   // Loading state
   if (authLoading || raffleLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#100235' }}>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto" style={{ borderColor: '#f02080' }}></div>
         </div>
      );
   }

   // Error state
   if (raffleError || !raffle) {
      return (
         <div className="min-h-screen flex items-center justify-center text-brand-text-white" style={{ backgroundColor: '#100235' }}>
            <div className="text-center">
               <h2 className="text-3xl font-josefin font-bold mb-4">Sorteo no disponible</h2>
               <button onClick={() => router.push('/')} className="underline" style={{ color: '#FFB200' }}>Volver al inicio</button>
            </div>
         </div>
      );
   }

   return (
      <main className="font-josefin overflow-x-hidden" style={{ 
         background: 'linear-gradient(180deg, #1F1A2E 0%, #2A1F3D 20%, #2D2140 40%, #2A1F3D 60%, #1F1A2E 100%)',
         backgroundAttachment: 'fixed'
      }}>

         {/* =================================
          SECTION A: HERO (Gradiente suave que oscurece hacia abajo)
          ================================= */}
         <section className="relative min-h-[calc(100vh-6rem)] flex items-center overflow-hidden pt-8 md:pt-12 pb-8 md:pb-12" aria-labelledby="hero-heading" style={{ 
            background: 'linear-gradient(180deg, #b92163 0%, #8B1A4D 25%, #5A0B5C 50%, #360254 75%, #2A1F3D 100%)',
         }}>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
               <div className="flex flex-col lg:flex-row items-center lg:items-center">

                  <div className="w-full lg:w-1/2 text-center lg:text-left relative z-10">
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20" aria-hidden="true">
                        <Image src="/legacy/img/hero-building.png" alt="" width={700} height={400} className="blur-[2px] scale-110" loading="lazy" />
                     </div>
                     <h4 className="text-base md:text-lg font-bold uppercase mb-3 md:mb-4 tracking-wider" style={{ color: '#FFB200', textAlign: 'left', textShadow: '0 2px 8px rgba(255, 178, 0, 0.3)' }}>
                        AHORA TIENES LA OPORTUNIDAD
                     </h4>
                     <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase leading-[1.1] mb-4 md:mb-5" style={{ color: '#F9FAFB', textAlign: 'left', textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)' }}>
                        ¡DE PARTICIPAR Y GANAR<br />
                        UN 
                        Kia Rio  <br />
                        UNA Yamaha MT-07 - CFMoto 300SR<br />
                       
                     </h1>
                     <p className="text-base md:text-lg font-semibold mb-6 md:mb-8" style={{ color: '#F9FAFB', textAlign: 'left' }}>
                        ¿Serás tú nuestro próximo afortunado ganador?
                     </p>

                     <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                        <a
                           href="#buy-section"
                           aria-label="Participa ahora desde $1"
                           className="group px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg lg:text-xl font-bold uppercase hover:scale-105 transition-transform shadow-xl relative overflow-hidden inline-flex flex-col items-center sm:items-start"
                           style={{ background: 'linear-gradient(0deg, #ffb200 0%, #f02080 100%)', color: '#fff' }}
                        >
                           {/* Brillo sutil al hover (no cambia el diseño base) */}
                           <span
                              className="pointer-events-none absolute -inset-x-10 -top-10 h-24 rotate-12 opacity-0 group-hover:opacity-20 transition-opacity"
                              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)' }}
                              aria-hidden="true"
                           />

                           <span className="flex items-center gap-3 leading-none font-[var(--font-comfortaa)] tracking-wide">
                              <span>Participa ahora</span>
                              <span
                                 className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-sm md:text-base font-extrabold text-[#1A1A1A] shadow-sm"
                                 style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.2)' }}
                              >
                                 <span className="mr-1 text-xs md:text-sm font-bold opacity-80">$</span>
                                 <span className="text-lg md:text-xl">1</span>
                              </span>
                           </span>
                           <span className="mt-1 text-[11px] md:text-xs font-[var(--font-dm-sans)] text-white/90 normal-case">
                              Compra segura · Números al instante
                           </span>
                        </a>
                        {/* Botón play con señal UX sutil (sin cambiar diseño) */}
                        <div className="flex flex-col items-center">
                           <button 
                              onClick={() => setIsVideoModalOpen(true)}
                              aria-label="Ver video explicativo"
                              className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-full hover:scale-110 transition-all shadow-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500" 
                              style={{ background: '#A83EF5', color: '#fff' }}
                           >
                              {/* Halo animado sutil para indicar interacción */}
                              <span
                                 className="absolute inset-0 rounded-full opacity-25 animate-ping pointer-events-none"
                                 style={{ background: '#A83EF5' }}
                                 aria-hidden="true"
                              />
                              <svg xmlns="http://www.w3.org/2000/svg" className="relative h-6 w-6 md:h-7 md:w-7" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                           </button>
                           <span className="mt-2 text-xs font-semibold tracking-wide font-[var(--font-dm-sans)]" style={{ color: '#E5E7EB' }}>
                              Ver video
                           </span>
                           <span className="text-[11px] font-[var(--font-dm-sans)]" style={{ color: '#9CA3AF' }}>
                              PREMIOS 
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0">
                     <div className="absolute inset-0 flex items-center justify-center animate-spin-slow opacity-60" aria-hidden="true">
                        <Image src="/legacy/img/car-ray.png" alt="" width={600} height={600} className="object-contain scale-150" loading="lazy" />
                     </div>

                     <div className="absolute top-0 right-0 animate-pulse" aria-hidden="true">
                        <Image src="/legacy/img/car-star.png" alt="" width={100} height={100} loading="lazy" />
                     </div>
                     <div className="absolute top-10 left-2 animate-twinkle" aria-hidden="true">
                        <Image src="/legacy/img/car-star.png" alt="" width={60} height={60} className="opacity-90" loading="lazy" />
                     </div>
                     <div className="absolute top-20 right-40 animate-twinkle" aria-hidden="true">
                        <Image src="/legacy/img/car-star.png" alt="" width={50} height={50} className="opacity-90" loading="lazy" />
                     </div>
                     <div className="absolute bottom-8 left-6 twinkle-strong">
                        <div className="w-7 h-7 bg-white diamond-shape diamond-glow"></div>
                     </div>
                     <div className="absolute top-8 left-24 twinkle-strong">
                        <div className="w-4 h-4 diamond-shape diamond-glow" style={{ backgroundColor: '#FFB200' }}></div>
                     </div>
                     <div className="absolute bottom-24 right-20 twinkle-strong">
                        <div className="w-5 h-5 bg-white diamond-shape diamond-glow"></div>
                     </div>
                     <div className="absolute top-2 right-36 twinkle-strong">
                        <div className="w-3 h-3 diamond-shape diamond-glow" style={{ backgroundColor: '#FFB200' }}></div>
                     </div>
                     <div className="absolute bottom-16 left-40 twinkle-strong">
                        <div className="w-4 h-4 bg-white diamond-shape diamond-glow"></div>
                     </div>

                     <div className="relative z-10 w-full max-w-[1000px] mx-auto">
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                           {heroImages.map((image, index) => (
                              <button
                                 type="button"
                                 key={image.src}
                                 className={`absolute inset-0 transition-all duration-700 cursor-pointer group/heroimg block w-full h-full ${
                                    index === currentImageIndex 
                                       ? 'opacity-100 z-10' 
                                       : 'opacity-0 z-0 pointer-events-none'
                                 }`}
                                 style={{
                                    transform: isZooming && index === currentImageIndex 
                                       ? 'scale(1.2)' 
                                       : 'scale(1)',
                                 }}
                                 onClick={() => {
                                    if (index === 0) setIsPremioVideoModalOpen(true);
                                    else if (index === 1) setIsPremio2VideoModalOpen(true);
                                    else setIsPremio3VideoModalOpen(true);
                                 }}
                                 aria-label={`Ver video del premio: ${image.alt}`}
                              >
                                 <Image 
                                    src={image.src} 
                                    alt={image.alt} 
                                    fill 
                                    sizes="(max-width: 768px) 100vw, 1000px"
                                    className="object-contain" 
                                    loading={index === 0 ? "eager" : "lazy"}
                                    quality={90}
                                 />
                                 {/* Overlay play al hover para indicar que es clickable */}
                                 <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/heroimg:opacity-100 transition-opacity bg-black/20 rounded-lg" aria-hidden="true">
                                    <span className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl" style={{ background: 'rgba(168, 62, 245, 0.9)' }}>
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </span>
                                 </span>
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

               </div>
            </div>

         </section>

         {/* =================================
          SECTION B: HOW TO PLAY (Continúa del hero, más oscuro)
          ================================= */}
         <section className="relative pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden" id="how-to-play" aria-labelledby="how-to-play-heading" style={{ 
            background: 'linear-gradient(180deg, #2A1F3D 0%, #1F1835 50%, #1A152E 100%)',
            color: '#fff'
         }}>
            {/* Overlay sutil para integración */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ zIndex: 0 }} aria-hidden="true">
               <Image src="/legacy/img/contest-bg.png" alt="" fill className="object-cover" style={{ filter: 'hue-rotate(0deg) saturate(100%) invert(0%)' }} loading="lazy" />
            </div>

            <div className="container mx-auto px-4 relative" style={{ zIndex: 1 }}>
               <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
                  {/* Left Column - Text */}
                  <div className="col-span-1 md:col-span-2 flex flex-col justify-center">
                     <h5 className="text-uppercase font-bold mb-2 text-lg" style={{ color: '#FFB200' }}>Necesita saber acerca de</h5>
                     <h2 id="how-to-play-heading" className="text-uppercase font-bold text-4xl md:text-6xl mb-4" style={{ color: '#fff' }}>Cómo Jugar</h2>
                     <p className="text-xl font-bold" style={{ color: '#fff' }}>¡Sigue estos 3 sencillos pasos!</p>
                  </div>

                  {/* Cards - Template Style - Clean Layout */}
                  <div className="col-span-1">
                     <div className="rounded-xl overflow-hidden h-full shadow-lg" style={{ background: 'url(/legacy/img/card-bg-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center center', filter: 'hue-rotate(0deg) saturate(100%) invert(0%)' }}>
                        <div className="p-6 text-center h-full flex flex-col justify-center min-h-[200px]">
                           <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30" style={{ background: 'linear-gradient(135deg, #A83EF5 0%, #b92163 100%)' }} aria-hidden="true">
                              <Image src="/legacy/img/1.png" alt="" width={40} height={40} loading="lazy" />
                           </div>
                           <p className="text-xl font-bold leading-tight" style={{ color: '#fff' }}>1.ELIGE<br /><small className="text-base font-normal">elige la cantidad de boletos que desees</small></p>
                        </div>
                     </div>
                  </div>

                  <div className="col-span-1">
                     <div className="rounded-xl overflow-hidden h-full shadow-lg" style={{ background: 'url(/legacy/img/card-bg-2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center center', filter: 'hue-rotate(0deg) saturate(100%) invert(0%)' }}>
                        <div className="p-6 text-center h-full flex flex-col justify-center min-h-[200px]">
                           <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30" style={{ background: 'linear-gradient(135deg, #b92163 0%, #f02080 100%)' }}>
                              <Image src="/legacy/img/2.png" alt="2" width={40} height={40} />
                           </div>
                           <p className="text-xl font-bold leading-tight" style={{ color: '#fff' }}>2.COMPRA<br /><small className="text-base font-normal">Completando los datos</small></p>
                        </div>
                     </div>
                  </div>

                  <div className="col-span-1">
                     <div className="rounded-xl overflow-hidden h-full shadow-lg" style={{ background: 'url(/legacy/img/card-bg-3.jpg)', backgroundSize: 'cover', backgroundPosition: 'center center', filter: 'hue-rotate(0deg) saturate(100%) invert(0%)' }}>
                        <div className="p-6 text-center h-full flex flex-col justify-center min-h-[200px]">
                           <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30" style={{ backgroundColor: '#FFB200' }}>
                              <Image src="/legacy/img/3.png" alt="3" width={40} height={40} />
                           </div>
                           <p className="text-xl font-bold leading-tight" style={{ color: '#fff' }}>3.GANA<br /><small className="text-base font-normal">Ya casi estás ahí</small></p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* =================================
          SECTION C: NUMBER GRID (Fondo vibrante que combina con formularios)
          ================================= */}
         <section className="relative py-16 md:py-20 overflow-hidden" id="buy-section" aria-labelledby="buy-section-heading" style={{ 
            background: 'linear-gradient(180deg, #2A1F3D 0%, #2D2140 25%, #2F2343 50%, #2D2140 75%, #2A1F3D 100%)',
            color: '#fff'
         }}>
            {/* Overlay sutil con colores vibrantes del logo */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
               <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full blur-[120px] opacity-8" style={{ 
                  background: 'radial-gradient(circle, rgba(168, 62, 245, 0.4) 0%, transparent 70%)'
               }}></div>
               <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] rounded-full blur-[100px] opacity-6" style={{ 
                  background: 'radial-gradient(circle, rgba(240, 32, 128, 0.3) 0%, transparent 70%)'
               }}></div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
               <div className="text-center mb-12">
                  <h2 id="buy-section-heading" className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#F9FAFB', fontWeight: 700 }}>
                     Elige tu(s) número(s)
                  </h2>
                  <p className="text-base md:text-lg mb-6" style={{ color: '#9CA3AF' }}>
                     Selecciona la cantidad de boletos que deseas comprar
                  </p>
                  <div className="inline-block px-6 py-3 rounded-lg text-lg font-semibold" style={{ 
                    background: 'rgba(42, 45, 69, 0.6)', 
                    color: '#E5E7EB',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                     ${raffle.price_per_ticket.toFixed(2)} USD c/u
                  </div>
               </div>

               {/* Grid Component - Usa más ancho disponible */}
               <div className="max-w-6xl mx-auto">
                  <TicketSelector
                     pricePerTicket={raffle.price_per_ticket}
                     selectedQuantity={quantity}
                     onQuantityChange={setQuantity}
                     onContinue={() => {
                        // Scroll to form if needed, or just let the user scroll
                        const formElement = document.getElementById('payment-form');
                        if (formElement) {
                           formElement.scrollIntoView({ behavior: 'smooth' });
                        }
                     }}
                  />
               </div>

               {/* Payment Form (Only shown if numbers selected) - Layout optimizado con mejor uso del espacio */}
               {quantity > 0 && (
                  <div id="payment-form" className="mt-6 md:mt-8 max-w-7xl mx-auto w-full px-0 sm:px-6 lg:px-8">
                     <div className="rounded-xl p-4 md:p-5 lg:p-6 border w-full overflow-hidden" style={{ 
                       background: 'var(--bg-secondary)',
                       borderColor: 'var(--border-subtle)',
                       boxShadow: 'var(--shadow-lg)'
                     }}>
                        {/* Header compacto */}
                        <div className="text-center mb-4 md:mb-5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                           <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-1 font-[var(--font-comfortaa)]" style={{ color: 'var(--text-primary)' }}>
                              Completa tu compra
                           </h3>
                           <p className="text-xs md:text-sm font-[var(--font-dm-sans)]" style={{ color: 'var(--text-secondary)' }}>
                              Ingresa tus datos para continuar
                           </p>
                           {/* Estado de sesión (logueado / no logueado) */}
                           <div className="mt-3 flex justify-center">
                              {user ? (
                                 <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs md:text-sm font-[var(--font-dm-sans)]" style={{
                                    background: 'rgba(34, 197, 94, 0.08)',
                                    borderColor: 'rgba(34, 197, 94, 0.25)',
                                    color: '#D1FAE5',
                                 }}>
                                    <span className="font-semibold">Sesión activa:</span>
                                    <span className="opacity-90">{user.email}</span>
                                    <span className="hidden md:inline opacity-70">·</span>
                                    <span className="hidden md:inline opacity-90">Tu compra se asociará a tu cuenta</span>
                                 </div>
                              ) : (
                                 <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs md:text-sm font-[var(--font-dm-sans)]" style={{
                                    background: 'rgba(168, 62, 245, 0.08)',
                                    borderColor: 'rgba(168, 62, 245, 0.22)',
                                    color: '#E5D4FF',
                                 }}>
                                    <span className="font-semibold">Compra como invitado</span>
                                    <span className="opacity-70">·</span>
                                    <button
                                       type="button"
                                       onClick={() => router.push('/login')}
                                       className="underline hover:no-underline font-semibold"
                                       style={{ color: '#A83EF5' }}
                                    >
                                       Inicia sesión
                                    </button>
                                    <span className="hidden md:inline opacity-90">para ver tus boletos en “Mis boletos”</span>
                                 </div>
                              )}
                           </div>
                        </div>

                        <PurchaseFormWithPayment
                           initialData={initialPurchaseData}
                           onSubmit={handlePurchase}
                           quantity={quantity}
                           totalAmount={quantity * raffle.price_per_ticket}
                           isLoading={isLoading}
                           raffleTitle={raffle.title}
                           saleId={saleId}
                           orderId={orderId}
                           ticketNumbers={ticketNumbers}
                        />
                        {error && (
                           <div className="mt-4 p-4 border rounded-xl text-center font-medium" style={{ 
                             background: 'rgba(220, 38, 38, 0.1)', 
                             color: '#DC2626', 
                             borderColor: 'rgba(220, 38, 38, 0.3)' 
                           }}>
                              {error}
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>

         </section>

         {/* =================================
          SECTION D: PRIZE INFO (Premium, elegante, con profundidad)
          ================================= */}
         <section className="relative pt-4 pb-12 md:pt-8 md:pb-16 overflow-hidden" id="prize" aria-labelledby="prize-heading" style={{ 
            background: 'linear-gradient(180deg, #1F1935 0%, #2A1F3D 30%, #360254 70%, #4A1F5C 100%)',
            color: '#fff'
         }}>
            {/* Degradado radial suave para profundidad */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] opacity-12" style={{ 
                  background: 'radial-gradient(circle, rgba(168, 62, 245, 0.3) 0%, transparent 70%)'
               }}></div>
               <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[500px] rounded-full blur-[100px] opacity-10" style={{ 
                  background: 'radial-gradient(circle, rgba(185, 33, 99, 0.25) 0%, transparent 70%)'
               }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
               <h2 id="prize-heading" className="text-3xl md:text-5xl font-bold text-center mb-2" style={{ color: '#FFB200' }}>Conoce el premio</h2>
               <p className="text-center mb-6 md:mb-8" style={{ color: '#9CA3AF' }}>Premios increíbles esperan por ti</p>

               <div className="max-w-7xl mx-auto">
                  {/* Premios con jerarquía visual clara */}
                  <div className="mb-16">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* 1er PREMIO - Protagonista, más grande */}
                        <div className="md:col-span-2 relative group">
                           <div className="rounded-lg overflow-hidden border transition-all" style={{ 
                              background: 'rgba(28, 32, 58, 0.6)',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                           }}>
                              <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-lg" style={{ 
                                 background: '#FFB200',
                                 color: '#1A1A1A'
                              }}>
                                 <span className="font-bold text-sm">1er PREMIO</span>
                              </div>
                              <div className="aspect-[16/10] relative group/prize">
                                 <Image 
                                    src="/kiarioplaca.png" 
                                    alt="KIA Rio" 
                                    fill 
                                    sizes="(max-width: 768px) 100vw, 66vw"
                                    className="object-cover transition-transform duration-500" 
                                    loading="lazy"
                                    quality={85}
                                    style={{ 
                                       filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3))'
                                    }}
                                 />
                                 {/* Botón de reproducir */}
                                 <button
                                    onClick={() => setIsPremioVideoModalOpen(true)}
                                    className="absolute inset-0 flex items-center justify-center z-20 transition-all"
                                    aria-label="Ver video del premio"
                                 >
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ 
                                       background: 'rgba(168, 62, 245, 0.9)',
                                       boxShadow: '0 4px 20px rgba(168, 62, 245, 0.5)'
                                    }}>
                                       <svg 
                                          xmlns="http://www.w3.org/2000/svg" 
                                          className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white ml-1" 
                                          fill="currentColor" 
                                          viewBox="0 0 24 24"
                                       >
                                          <path d="M8 5v14l11-7z"/>
                                       </svg>
                                    </div>
                                 </button>
                              </div>
                              <div className="p-5" style={{ background: 'rgba(15, 17, 23, 0.8)' }}>
                                 <p className="font-bold text-xl" style={{ color: '#FFB200', textShadow: '0 2px 10px rgba(255, 178, 0, 0.25)' }}>
                                    KIA RIO HATCHBACK
                                 </p>
                                 <p className="text-base md:text-lg mt-3 leading-relaxed" style={{ color: '#D1D5DB' }}>
                                    <strong style={{ color: '#F2C94C' }}>Tipo:</strong> Hatchback compacto<br/>
                                    <strong style={{ color: '#F2C94C' }}>Motor:</strong> 1.4L / 4 cilindros<br/>
                                    <strong style={{ color: '#F2C94C' }}>Potencia:</strong> 100–107 HP aprox.<br/>
                                    <strong style={{ color: '#F2C94C' }}>Transmisión:</strong> Manual o automática<br/>
                                    <strong style={{ color: '#F2C94C' }}>Consumo:</strong> 15–18 km/L aprox.<br/>
                                    <strong style={{ color: '#F2C94C' }}>Capacidad:</strong> 5 pasajeros<br/>
                                    <strong style={{ color: '#F2C94C' }}>Uso ideal:</strong> Ciudad / diario / familiar<br/>
                                    <strong style={{ color: '#F2C94C' }}>Puntos fuertes:</strong> Rendimiento, espacio, mantenimiento económico
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* 2do y 3er PREMIO - Secundarios, más pequeños */}
                        <div className="space-y-6">
                           {/* Prize 2 (Yamaha MT-07) */}
                           <div className="relative group">
                              <div className="rounded-lg overflow-hidden border transition-all" style={{ 
                                 background: 'rgba(28, 32, 58, 0.5)',
                                 borderColor: 'rgba(255, 255, 255, 0.08)',
                                 boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
                              }}>
                                 <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded" style={{ 
                                    background: 'rgba(107, 114, 128, 0.8)',
                                    color: '#E5E7EB'
                                 }}>
                                    <span className="font-semibold text-xs">2do PREMIO</span>
                                 </div>
                                 <div className="aspect-[4/3] relative group/prize">
                                    <Image 
                                       src="/yamaha01.jpg" 
                                       alt="Yamaha MT-07" 
                                       fill 
                                       sizes="(max-width: 768px) 100vw, 33vw"
                                       className="object-cover transition-transform duration-500" 
                                       loading="lazy"
                                       quality={85}
                                       style={{ 
                                          filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.25))'
                                       }}
                                    />
                                    {/* Botón de reproducir */}
                                    <button
                                       onClick={() => setIsPremio2VideoModalOpen(true)}
                                       className="absolute inset-0 flex items-center justify-center z-20 transition-all opacity-100 lg:opacity-0 lg:group-hover/prize:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
                                       aria-label="Ver video del 2do premio"
                                    >
                                       <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ 
                                          background: 'rgba(168, 62, 245, 0.9)',
                                          boxShadow: '0 4px 20px rgba(168, 62, 245, 0.5)'
                                       }}>
                                          <svg 
                                             xmlns="http://www.w3.org/2000/svg" 
                                             className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 text-white ml-1" 
                                             fill="currentColor" 
                                             viewBox="0 0 24 24"
                                          >
                                             <path d="M8 5v14l11-7z"/>
                                          </svg>
                                       </div>
                                    </button>
                                 </div>
                                 <div className="p-4" style={{ background: 'rgba(15, 17, 23, 0.75)' }}>
                                    <p className="font-bold text-lg md:text-xl mb-2" style={{ color: '#FFB200', textShadow: '0 2px 10px rgba(255, 178, 0, 0.18)' }}>
                                       YAMAHA MT-07
                                    </p>
                                    <p className="text-sm md:text-base leading-relaxed" style={{ color: '#D1D5DB' }}>
                                       <strong style={{ color: '#F2C94C' }}>Tipo:</strong> Moto Naked media cilindrada<br/>
                                       <strong style={{ color: '#F2C94C' }}>Motor:</strong> 689cc / 2 cilindros<br/>
                                       <strong style={{ color: '#F2C94C' }}>Potencia:</strong> 73–75 HP aprox.<br/>
                                       <strong style={{ color: '#F2C94C' }}>Par motor:</strong> 68 Nm<br/>
                                       <strong style={{ color: '#F2C94C' }}>Transmisión:</strong> 6 velocidades<br/>
                                       <strong style={{ color: '#F2C94C' }}>Frenos:</strong> Doble disco delantero + disco trasero <br/>
                                       <strong style={{ color: '#F2C94C' }}>Peso:</strong> 179–182 kg<br/>
                                       <strong style={{ color: '#F2C94C' }}>Uso ideal:</strong> Ciudad / curvas / viajes<br/>
                                       <strong style={{ color: '#F2C94C' }}>Puntos fuertes:</strong> Par motor fuerte, ligereza, muy divertida de manejar
                                    </p>
                                 </div>
                              </div>
                           </div>

                           {/* Prize 3 (CFMOTO 300SR) */}
                           <div className="relative group">
                              <div className="rounded-lg overflow-hidden border transition-all" style={{ 
                                 background: 'rgba(28, 32, 58, 0.5)',
                                 borderColor: 'rgba(255, 255, 255, 0.08)',
                                 boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
                              }}>
                                 <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded" style={{ 
                                    background: 'rgba(107, 114, 128, 0.8)',
                                    color: '#E5E7EB'
                                 }}>
                                    <span className="font-semibold text-xs">3er PREMIO</span>
                                 </div>
                                 <div className="aspect-[4/3] relative group/prize">
                                    <Image 
                                       src="/cst.jpg" 
                                       alt="CFMOTO 300SR" 
                                       fill 
                                       sizes="(max-width: 768px) 100vw, 33vw"
                                       className="object-cover transition-transform duration-500" 
                                       loading="lazy"
                                       quality={85}
                                       style={{ 
                                          filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.25))'
                                       }}
                                    />
                                    {/* Botón de reproducir */}
                                    <button
                                       onClick={() => setIsPremio3VideoModalOpen(true)}
                                       className="absolute inset-0 flex items-center justify-center z-20 transition-all opacity-100 lg:opacity-0 lg:group-hover/prize:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
                                       aria-label="Ver video del 3er premio"
                                    >
                                       <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ 
                                          background: 'rgba(168, 62, 245, 0.9)',
                                          boxShadow: '0 4px 20px rgba(168, 62, 245, 0.5)'
                                       }}>
                                          <svg 
                                             xmlns="http://www.w3.org/2000/svg" 
                                             className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 text-white ml-1" 
                                             fill="currentColor" 
                                             viewBox="0 0 24 24"
                                          >
                                             <path d="M8 5v14l11-7z"/>
                                          </svg>
                                       </div>
                                    </button>
                                 </div>
                                 <div className="p-4" style={{ background: 'rgba(15, 17, 23, 0.75)' }}>
                                    <p className="font-bold text-lg md:text-xl mb-2" style={{ color: '#FFB200', textShadow: '0 2px 10px rgba(255, 178, 0, 0.18)' }}>
                                       CFMOTO 300SR
                                    </p>
                                    <p className="text-sm md:text-base leading-relaxed" style={{ color: '#D1D5DB' }}>
                                       <strong style={{ color: '#F2C94C' }}>Tipo:</strong> Moto deportiva carenada (sport)<br/>
                                       <strong style={{ color: '#F2C94C' }}>Motor:</strong> 292cc / 1 cilindro<br/>
                                       <strong style={{ color: '#F2C94C' }}>Potencia:</strong> 29 HP (29 caballos de fuerza)<br/>
                                       <strong style={{ color: '#F2C94C' }}>Inyección:</strong> EFI<br/>
                                       <strong style={{ color: '#F2C94C' }}>Transmisión:</strong> 6 velocidades<br/>
                                       <strong style={{ color: '#F2C94C' }}>Frenos:</strong> Disco delantero + Disco trasero con ABS<br/>
                                       <strong style={{ color: '#F2C94C' }}>Suspensión:</strong> KYB delantera + monoshock<br/>
                                       <strong style={{ color: '#F2C94C' }}>Uso ideal:</strong> Ciudad / carretera / estilo racing<br/>
                                       <strong style={{ color: '#F2C94C' }}>Puntos fuertes:</strong> Diseño agresivo, manejo deportivo, buena relación costo–prestaciones
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Barra de progreso de ventas - Justo después de las imágenes de premios */}
                  {raffle && raffle.total_numbers && (
                     <div className="mt-8 mb-8">
                        <SalesProgressBar 
                           raffleId={raffle.id} 
                           totalNumbers={raffle.total_numbers} 
                        />
                     </div>
                  )}

                  <div className="flex flex-col lg:flex-row gap-8">
                     {/* Left: Details */}
                     <div className="lg:w-2/3">
                        <h5 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: '#FFB200' }}>Participa ahora para tener la oportunidad de ganar</h5>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#F9FAFB' }}>{raffle.title}</h2>
                        <p className="text-base mb-6" style={{ color: '#9CA3AF' }}>
                           Las cifras de la lotería del ECUADOR definen el ganador de este sorteo
                        </p>

                        <hr className="border-white/10 my-8" />

                        <h3 className="text-xl font-bold mb-4" style={{ color: '#E5E7EB' }}>Descripción general del premio</h3>
                        <p className="leading-relaxed" style={{ color: '#9CA3AF' }}>
                           {raffle.description || "Participa en este increíble sorteo y gana premios espectaculares. ¡Tu oportunidad es ahora!"}
                        </p>
                     </div>

                     {/* Right: CTA integrado - Reducido en saturación */}
                     <div className="lg:w-1/3">
                        <div className="rounded-lg border p-6 h-full" style={{ 
                           background: 'rgba(28, 32, 58, 0.6)',
                           borderColor: 'rgba(255, 255, 255, 0.1)',
                           boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
                        }}>
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
                                 background: 'rgba(168, 62, 245, 0.2)',
                                 border: '1px solid rgba(168, 62, 245, 0.3)'
                              }}>
                                 <svg className="w-5 h-5" style={{ color: '#A83EF5' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                 </svg>
                              </div>
                              <h3 className="text-lg font-bold" style={{ color: '#F9FAFB' }}>No te quedes fuera</h3>
                           </div>

                           <p className="mb-6 leading-relaxed" style={{ color: '#9CA3AF' }}>
                              Los boletos se están vendiendo rápido. Asegura tu oportunidad de ganar hoy mismo.
                           </p>

                           <a
                              href="#buy-section"
                              className="block w-full text-center py-3 rounded-lg font-semibold transition-all"
                              style={{ 
                                 background: 'linear-gradient(135deg, #F2C94C, #F2994A)',
                                 color: '#1A1A1A',
                                 boxShadow: '0 4px 12px rgba(242, 201, 76, 0.25)'
                              }}
                              onMouseEnter={(e) => {
                                 e.currentTarget.style.filter = 'brightness(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                 e.currentTarget.style.filter = 'brightness(1)';
                              }}
                           >
                              Participa Ahora
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* =================================
          SECTION E: FAQ (Continúa el gradiente, cierre elegante)
          ================================= */}
         <section className="relative pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden" id="faq" aria-labelledby="faq-heading" style={{ 
            background: 'linear-gradient(180deg, #4A1F5C 0%, #360254 50%, #2A1F3D 100%)',
            color: '#fff'
         }}>
            <div className="container mx-auto px-4 relative" style={{ zIndex: 1 }}>
               <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#F9FAFB' }}>
                  Preguntas frecuentes
               </h2>

               <div className="max-w-3xl mx-auto space-y-3">
                  {/* FAQ Item 1 */}
                  <details className="group rounded-lg border transition-all" style={{ background: 'rgba(42, 45, 69, 0.4)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                     <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:opacity-90 transition-opacity">
                        <h4 className="text-lg font-bold" style={{ color: '#fff' }}>
                           ¿Cómo se realiza el deposito de fondos?
                        </h4>
                        <span className="transform group-open:rotate-180 transition-transform flex-shrink-0 ml-4" style={{ color: '#FFB200' }}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                           </svg>
                        </span>
                     </summary>
                     <div className="px-6 pb-6 leading-relaxed" style={{ color: '#fff', opacity: 0.95 }}>
                        Puedes realizar el pago directamente a través de nuestra plataforma segura utilizando tarjetas de crédito, débito o transferencia bancaria.
                     </div>
                  </details>

                  {/* FAQ Item 2 */}
                  <details className="group rounded-lg border transition-all" style={{ background: 'rgba(42, 45, 69, 0.4)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                     <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:opacity-90 transition-opacity">
                        <h4 className="text-lg font-bold" style={{ color: '#fff' }}>
                           ¿Cómo sé quién es el ganador?
                        </h4>
                        <span className="transform group-open:rotate-180 transition-transform flex-shrink-0 ml-4" style={{ color: '#FFB200' }}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                           </svg>
                        </span>
                     </summary>
                     <div className="px-6 pb-6 leading-relaxed" style={{ color: '#fff', opacity: 0.95 }}>
                        El ganador se publicará en nuestras redes sociales y página web oficial inmediatamente después del sorteo. Además, nos contactaremos directamente con el afortunado.
                     </div>
                  </details>

                  {/* FAQ Item 3 */}
                  <details className="group rounded-lg border transition-all" style={{ background: 'rgba(42, 45, 69, 0.4)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                     <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:opacity-90 transition-opacity">
                        <h4 className="text-lg font-bold" style={{ color: '#fff' }}>
                           ¿Cuánto se demoran en entregar el premio?
                        </h4>
                        <span className="transform group-open:rotate-180 transition-transform flex-shrink-0 ml-4" style={{ color: '#FFB200' }}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                           </svg>
                        </span>
                     </summary>
                     <div className="px-6 pb-6 leading-relaxed" style={{ color: '#fff', opacity: 0.95 }}>
                        La entrega del premio se coordina inmediatamente después de la verificación del ganador, usualmente dentro de los 5 a 10 días hábiles siguientes.
                     </div>
                  </details>
               </div>
            </div>
         </section>

         {/* Modal de Video del Hero */}
         <VideoModal
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
            youtubeUrl="https://youtu.be/tb3KXOm2K2E"
         />

         {/* Modal de Video del Primer Premio */}
         <VideoModal
            isOpen={isPremioVideoModalOpen}
            onClose={() => setIsPremioVideoModalOpen(false)}
            youtubeUrl="https://www.youtube.com/watch?v=Am1abV7Ckb8"
         />

         {/* Modal de Video del Segundo Premio */}
         <VideoModal
            isOpen={isPremio2VideoModalOpen}
            onClose={() => setIsPremio2VideoModalOpen(false)}
            youtubeUrl="https://www.youtube.com/watch?v=uWmuNMR3QQM"
         />

         {/* Modal de Video del Tercer Premio */}
         <VideoModal
            isOpen={isPremio3VideoModalOpen}
            onClose={() => setIsPremio3VideoModalOpen(false)}
            youtubeUrl="https://www.youtube.com/watch?v=wpz5ODAjia0"
         />
      </main>
   );
}
