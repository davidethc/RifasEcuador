"use client";

import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Componente de Preguntas Frecuentes (FAQ)
 * Sección visible en la página principal para generar confianza
 */
export function FAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "¿Los sorteos son legales y regulados?",
      answer: "Sí, todos nuestros sorteos están completamente regulados y autorizados por las autoridades competentes de Ecuador. Contamos con licencia vigente y cada sorteo es supervisado por un notario público.",
    },
    {
      id: "2",
      question: "¿Cómo puedo verificar que el sorteo es transparente?",
      answer: "Todos nuestros sorteos se transmiten en vivo en nuestro canal de YouTube. Puedes ver el proceso completo en tiempo real, desde la selección de números hasta la entrega del premio. Además, cada sorteo está documentado y los resultados son públicos.",
    },
    {
      id: "3",
      question: "¿Qué pasa si gano?",
      answer: "Si eres ganador, te contactaremos inmediatamente a través del correo electrónico y WhatsApp que proporcionaste al comprar tus boletos. El premio se entregará en un plazo máximo de 30 días hábiles después de la verificación de tu identidad.",
    },
    {
      id: "4",
      question: "¿Puedo elegir mis números de boleto?",
      answer: "Los números se asignan automáticamente de forma aleatoria para garantizar la transparencia y equidad del sorteo. Esto asegura que todos los participantes tengan las mismas oportunidades.",
    },
    {
      id: "5",
      question: "¿Los pagos son seguros?",
      answer: "Absolutamente. Utilizamos Payphone, una plataforma de pagos certificada y segura. Todos los datos de pago están encriptados y nunca almacenamos información de tarjetas de crédito. También aceptamos transferencias bancarias verificadas.",
    },
    {
      id: "6",
      question: "¿Puedo cancelar mi compra?",
      answer: "Una vez completada la compra y asignados los números, no se permiten cancelaciones ni devoluciones, excepto en casos excepcionales contemplados por la ley. Esto garantiza la integridad del sorteo.",
    },
    {
      id: "7",
      question: "¿Dónde puedo ver mis boletos?",
      answer: "Puedes ver todos tus boletos en la sección 'Mis Boletos' una vez que inicies sesión. También recibirás un correo electrónico y un mensaje de WhatsApp con los números asignados después de completar el pago.",
    },
    {
      id: "8",
      question: "¿Cuándo se realiza el sorteo?",
      answer: "La fecha y hora del sorteo se publica en la página de cada sorteo. Todos los sorteos se realizan en las fechas programadas y son transmitidos en vivo para que puedas seguirlos en tiempo real.",
    },
  ];

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section className="w-full py-8 md:py-12 lg:py-16 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4 md:mb-6">
            <span className="text-xl md:text-2xl">❓</span>
            <span className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-400 font-[var(--font-dm-sans)]">
              Preguntas frecuentes
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 font-[var(--font-comfortaa)]">
            Preguntas Frecuentes
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-[var(--font-dm-sans)] px-4">
            Resolvemos todas tus dudas sobre nuestros sorteos
          </p>
        </div>

        {/* Lista de preguntas */}
        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:border-primary-500"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-4 md:px-6 py-3 md:py-4 text-left flex items-center justify-between gap-3 md:gap-4 focus:outline-none min-h-[56px]"
              >
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white font-[var(--font-comfortaa)] flex-1">
                  {faq.question}
                </h3>
                <svg
                  className={`w-6 h-6 text-primary-500 flex-shrink-0 transition-transform ${
                    openItems.has(faq.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openItems.has(faq.id) && (
                <div className="px-4 md:px-6 pb-3 md:pb-4">
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-[var(--font-dm-sans)]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

