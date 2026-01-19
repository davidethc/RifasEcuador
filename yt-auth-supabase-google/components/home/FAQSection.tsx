"use client";

import { useState } from "react";

/**
 * Sección FAQ
 * Preguntas frecuentes sobre el sorteo
 */
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      pregunta: "¿Cuánto cuesta participar?",
      respuesta: "El boleto cuesta $1. Puedes comprar varios para aumentar tus chances.",
    },
    {
      pregunta: "¿Cuándo se realiza el sorteo?",
      respuesta: "Cuando se complete la emisión de boletos. Avisaremos la fecha exacta y transmitiremos el sorteo con Lotería Nacional.",
    },
    {
      pregunta: "¿Cómo sé si gané?",
      respuesta: "Publicaremos los resultados y contactaremos al ganador por WhatsApp y correo.",
    },
    {
      pregunta: "¿Puedo participar desde cualquier parte del Ecuador?",
      respuesta: "Sí. El sorteo es nacional y la entrega es en Pichincha.",
    },
    {
      pregunta: "¿Qué métodos de pago aceptan?",
      respuesta: "Payphone, tarjeta de crédito/débito y transferencia bancaria.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{
      background: 'linear-gradient(180deg, #2A1F3D 0%, #1F1835 50%, #1A152E 100%)'
    }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 font-[var(--font-comfortaa)]" style={{ color: '#F9FAFB' }}>
          Preguntas Frecuentes
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border overflow-hidden transition-all"
              style={{
                background: 'rgba(28, 32, 58, 0.6)',
                borderColor: openIndex === index ? 'rgba(255, 178, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-4 md:p-6 text-left flex items-center justify-between focus:outline-none"
                style={{ color: '#F9FAFB' }}
              >
                <span className="text-lg md:text-xl font-semibold font-[var(--font-comfortaa)] pr-4">
                  {faq.pregunta}
                </span>
                <svg
                  className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <p className="text-base md:text-lg font-[var(--font-dm-sans)] leading-relaxed" style={{ color: '#9CA3AF' }}>
                    {faq.respuesta}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
