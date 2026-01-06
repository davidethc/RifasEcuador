'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchase } from '@/hooks/usePurchase';
import type { Raffle } from '@/types/database.types';
import type { PurchaseFormData } from '@/types/purchase.types';

// Componentes
import { TicketSelector } from '@/components/compra/TicketSelector';
import { PurchaseFormWithPayment } from '@/components/compra/PurchaseFormWithPayment';
import { VideoModal } from '@/components/ui/VideoModal';
import { HeroCarousel } from "@/components/ui/hero-carousel";
import { SalesProgressBar } from '@/components/compra/SalesProgressBar';

// Assets (Legacy)
// Nota: Asegurarse que las imágenes existan en public/legacy/img/

export default function ComprarPage() {
   const params = useParams();
   const router = useRouter();
   const { isLoading: authLoading } = useAuth();
   const raffleId = params.id as string;

   const [raffle, setRaffle] = useState<Raffle | null>(null);
   const [raffleLoading, setRaffleLoading] = useState(true);
   const [raffleError, setRaffleError] = useState<string | null>(null);
   const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
               console.error('Error fetching raffle:', fetchError);
               setRaffleError('No se pudo cargar el sorteo');
               return;
            }

            setRaffle(data);

         } catch (err) {
            console.error('Unexpected error:', err);
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
      <div className="min-h-screen font-josefin overflow-x-hidden" style={{ 
         background: 'linear-gradient(180deg, #1F1A2E 0%, #2A1F3D 20%, #2D2140 40%, #2A1F3D 60%, #1F1A2E 100%)',
         backgroundAttachment: 'fixed'
      }}>

         {/* =================================
          SECTION A: HERO (Gradiente suave que oscurece hacia abajo)
          ================================= */}
         <div className="relative pt-10 pb-12 md:pb-16 lg:pt-32 lg:pb-24 overflow-hidden" style={{ 
            background: 'linear-gradient(180deg, #b92163 0%, #8B1A4D 25%, #5A0B5C 50%, #360254 75%, #2A1F3D 100%)',
            minHeight: '70vh'
         }}>

            <div className="container mx-auto px-4 relative z-20">
               <div className="flex flex-col lg:flex-row items-center">

                  <div className="w-full lg:w-1/2 text-center lg:text-left pt-4 lg:pt-0 relative">
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <Image src="/legacy/img/hero-building.png" alt="Ciudad" width={700} height={400} className="opacity-30 blur-[1px] scale-110" />
                     </div>
                     <h4 className="text-xl md:text-2xl font-bold uppercase mb-3 tracking-wider" style={{ color: '#FFD962', textAlign: 'left', textShadow: '0 2px 8px rgba(255, 215, 98, 0.3)' }}>
                        Ahora tienes la oportunidad
                     </h4>
                     <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-tight mb-5" style={{ color: '#F9FAFB', textAlign: 'left', textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)' }}>
                        ¡De Participar y Ganar<br />
                        <span className="text-3xl md:text-5xl lg:text-6xl">un Auto, una Moto<br />y Muchos Premios Sorpresa</span>
                     </h1>
                     <p className="text-lg md:text-xl font-semibold mb-8" style={{ color: '#E5E7EB', textAlign: 'left' }}>
                        ¿Serás tú nuestro próximo afortunado ganador?
                     </p>

                     <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                        <a href="#buy-section" className="px-8 py-4 rounded-xl text-xl font-bold uppercase hover:scale-105 transition-transform shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(0deg, #ffb200 0%, #f02080 100%)', color: '#fff' }}>
                           Participa Ahora
                        </a>
                        <button 
                           onClick={() => setIsVideoModalOpen(true)}
                           className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full hover:scale-110 transition-all shadow-xl flex items-center justify-center" 
                           style={{ background: '#A83EF5', color: '#fff' }}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                           </svg>
                        </button>
                     </div>
                  </div>

                  <div className="w-full lg:w-1/2 relative mt-12 lg:mt-0">
                     <div className="absolute inset-0 flex items-center justify-center animate-spin-slow opacity-60">
                        <Image src="/legacy/img/car-ray.png" alt="Rays" width={600} height={600} className="object-contain scale-150" />
                     </div>

                     <div className="absolute top-0 right-0 animate-pulse">
                        <Image src="/legacy/img/car-star.png" alt="Star" width={100} height={100} />
                     </div>
                     <div className="absolute top-10 left-2 animate-twinkle">
                        <Image src="/legacy/img/car-star.png" alt="Star" width={60} height={60} className="opacity-90" />
                     </div>
                     <div className="absolute top-20 right-40 animate-twinkle">
                        <Image src="/legacy/img/car-star.png" alt="Star" width={50} height={50} className="opacity-90" />
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

                     <div className="relative z-10 transform hover:scale-105 transition-transform duration-500 w-full max-w-[800px] mx-auto">
                        {/* Shadow removed as requested */}
                        <HeroCarousel
                           images={[
                              { src: "/mazdaprin.png", alt: "Mazda 3" },

                           ]}
                           ratio={4 / 3}
                           className="w-full"
                           autoplayInterval={3000}
                           transparent={true}
                        />
                     </div>
                  </div>

               </div>
            </div>


         </div>

         {/* =================================
          SECTION B: HOW TO PLAY (Continúa del hero, más oscuro)
          ================================= */}
         <div className="relative pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden" id="how-to-play" style={{ 
            background: 'linear-gradient(180deg, #2A1F3D 0%, #1F1835 50%, #1A152E 100%)',
            color: '#fff'
         }}>
            {/* Overlay sutil para integración */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ zIndex: 0 }}>
               <Image src="/legacy/img/contest-bg.png" alt="bg" fill className="object-cover" style={{ filter: 'hue-rotate(0deg) saturate(100%) invert(0%)' }} />
            </div>

            <div className="container mx-auto px-4 relative" style={{ zIndex: 1 }}>
               <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
                  {/* Left Column - Text */}
                  <div className="col-span-1 md:col-span-2 flex flex-col justify-center">
                     <h5 className="text-uppercase font-bold mb-2 text-lg" style={{ color: '#FFB200' }}>Necesita saber acerca de</h5>
                     <h1 className="text-uppercase font-bold text-4xl md:text-6xl mb-4" style={{ color: '#fff' }}>Cómo Jugar</h1>
                     <p className="text-xl font-bold" style={{ color: '#fff' }}>¡Sigue estos 3 sencillos pasos!</p>
                  </div>

                  {/* Cards - Template Style - Clean Layout */}
                  <div className="col-span-1">
                     <div className="rounded-xl overflow-hidden h-full shadow-lg" style={{ background: 'url(/legacy/img/card-bg-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center center', filter: 'hue-rotate(0deg) saturate(100%) invert(0%)' }}>
                        <div className="p-6 text-center h-full flex flex-col justify-center min-h-[200px]">
                           <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30" style={{ background: 'linear-gradient(135deg, #A83EF5 0%, #b92163 100%)' }}>
                              <Image src="/legacy/img/1.png" alt="1" width={40} height={40} />
                           </div>
                           <p className="text-xl font-bold leading-tight" style={{ color: '#fff' }}>1.ELIGE<br /><small className="text-base font-normal">Tu número ganador</small></p>
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
         </div>

         {/* =================================
          SECTION C: NUMBER GRID (Fondo vibrante que combina con formularios)
          ================================= */}
         <div className="relative py-16 md:py-20 overflow-hidden" id="buy-section" style={{ 
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
            <div className="container mx-auto px-4 relative" style={{ zIndex: 1 }}>
               <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#F9FAFB', fontWeight: 700 }}>
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

               {/* Grid Component */}
               <div className="max-w-4xl mx-auto">
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

               {/* Payment Form (Only shown if numbers selected) - Integrado al mismo fondo */}
               {quantity > 0 && (
                  <div id="payment-form" className="mt-16 max-w-5xl mx-auto">
                     <div className="rounded-2xl p-6 md:p-10 border" style={{ 
                       background: 'linear-gradient(135deg, #1A1525 0%, #2A1F3D 50%, #1F1A2E 100%)',
                       borderColor: '#3A2F5A',
                       boxShadow: '0 20px 60px rgba(168, 62, 245, 0.2), 0 0 40px rgba(240, 32, 128, 0.1)'
                     }}>
                        {/* Header sobrio */}
                        <div className="text-center mb-8 md:mb-10 pb-6 border-b" style={{ borderColor: '#3A2F5A' }}>
                           <h3 className="text-2xl md:text-3xl font-bold mb-3 font-[var(--font-comfortaa)]" style={{ color: '#FFFFFF' }}>
                              Completa tu compra
                           </h3>
                           <p className="text-base font-[var(--font-dm-sans)]" style={{ color: '#E5D4FF' }}>
                              Ingresa tus datos para continuar
                           </p>
                        </div>

                        <PurchaseFormWithPayment
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

         </div>

         {/* =================================
          SECTION D: PRIZE INFO (Premium, elegante, con profundidad)
          ================================= */}
         <div className="relative pt-4 pb-12 md:pt-8 md:pb-16 overflow-hidden" id="prize" style={{ 
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
               <h1 className="text-3xl md:text-5xl font-bold text-center mb-2" style={{ color: '#FFB200' }}>Conoce el premio</h1>
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
                              <div className="aspect-[16/10] relative">
                                 <Image 
                                    src="/kia.jpg" 
                                    alt="Kia Sedan" 
                                    fill 
                                    className="object-cover transition-transform duration-500" 
                                    style={{ 
                                       filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3))'
                                    }}
                                 />
                              </div>
                              <div className="p-5" style={{ background: 'rgba(15, 17, 23, 0.8)' }}>
                                 <p className="font-bold text-lg" style={{ color: '#FFB200' }}>KIA SOLUTO O RÍO</p>
                                 <p className="text-sm mt-2" style={{ color: '#9CA3AF' }}>Premio principal del sorteo</p>
                              </div>
                           </div>
                        </div>

                        {/* 2do y 3er PREMIO - Secundarios, más pequeños */}
                        <div className="space-y-6">
                           {/* Prize 2 */}
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
                                 <div className="aspect-[4/3] relative">
                                    <Image 
                                       src="/mazdaprin.png" 
                                       alt="Mazda SUV" 
                                       fill 
                                       className="object-cover transition-transform duration-500" 
                                       style={{ 
                                          filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.25))'
                                       }}
                                    />
                                 </div>
                                 <div className="p-4" style={{ background: 'rgba(15, 17, 23, 0.7)' }}>
                                    <p className="font-semibold text-sm" style={{ color: '#E5E7EB' }}>MAZDA CX-3 O HYUNDAI ELANTRA</p>
                                 </div>
                              </div>
                           </div>

                           {/* Prize 3 */}
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
                                 <div className="aspect-[4/3] relative">
                                    <Image 
                                       src="/yamaha.jpg" 
                                       alt="Yamaha Motorcycle" 
                                       fill 
                                       className="object-cover transition-transform duration-500" 
                                       style={{ 
                                          filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.25))'
                                       }}
                                    />
                                 </div>
                                 <div className="p-4" style={{ background: 'rgba(15, 17, 23, 0.7)' }}>
                                    <p className="font-semibold text-sm" style={{ color: '#E5E7EB' }}>YAMAHA MT-03 O R3</p>
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
                           Sorteo {raffle.end_date ? new Date(raffle.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha por definir'}
                           <span className="mx-3" style={{ color: '#6B7280' }}>|</span>
                           <span style={{ color: '#9CA3AF' }}>Por las dos últimas cifras de la lotería del Paísita</span>
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
         </div>

         {/* =================================
          SECTION E: FAQ (Continúa el gradiente, cierre elegante)
          ================================= */}
         <div className="relative pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden" id="faq" style={{ 
            background: 'linear-gradient(180deg, #4A1F5C 0%, #360254 50%, #2A1F3D 100%)',
            color: '#fff'
         }}>
            <div className="container mx-auto px-4 relative" style={{ zIndex: 1 }}>
               <h1 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#F9FAFB' }}>
                  Preguntas frecuentes
               </h1>

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
         </div>

         {/* Modal de Video */}
         <VideoModal
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
         />
      </div>
   );
}
