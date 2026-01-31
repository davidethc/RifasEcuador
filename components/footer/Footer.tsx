"use client";

import Link from "next/link";
import Image from "next/image";
import { CertificationsBadge } from "@/components/certifications/CertificationsBadge";

/**
 * Footer - Pie de página de la aplicación
 * Incluye enlaces importantes, información legal y redes sociales
 */
export function Footer() {

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navegacion: [
      { label: "Inicio", href: "/" },
      { label: "Cómo jugar", href: "/como-jugar" },
      { label: "Sorteos", href: "/sorteos" },
    ],
    legal: [
      { label: "Términos y condiciones", href: "/terminos" },
    ],
  };

  const socialLinks = [
    {
      label: "Facebook",
      ariaLabel: "Síguenos en Facebook",
      href: "#",
      iconSrc: "/iconoFacebook.png",
    },
    {
      label: "Instagram",
      ariaLabel: "Síguenos en Instagram",
      href: "#",
      iconSrc: "/iconoInstagram.png",
    },
    {
      label: "TikTok",
      ariaLabel: "Síguenos en TikTok",
      href: "#",
      iconSrc: "/iconoTiktok.png",
    },
  ] as const;

  return (
    <footer className="w-full border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: '#100235' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* 1. Certificaciones - Primero */}
        <div className="mb-6 md:mb-10">
          <CertificationsBadge />
        </div>

        {/* 2. Footer principal - Logo + links (más juntos) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-10">
          {/* Logo y descripción */}
          <div>
            <Link href="/" className="flex items-center mb-3 md:mb-4">
              <Image
                src="/logosrifaweb.png"
                alt="Rifas Ecuador - Participa y Gana"
                width={80}
                height={80}
                sizes="(max-width: 768px) 48px, (max-width: 1024px) 64px, 80px"
                className="h-12 w-auto md:h-16 lg:h-20 object-contain"
                loading="lazy"
                quality={85}
              />
            </Link>
            <p className="text-sm font-[var(--font-dm-sans)] leading-relaxed" style={{ color: '#ffffff' }}>
              Participa en sorteos legales y gana increíbles premios. Tu oportunidad de ganar está aquí.
            </p>
          </div>

          {/* Links (Navegación + Legal más juntos) */}
          <div className="grid grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            {/* Navegación */}
            <div>
              <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4 font-[var(--font-dm-sans)]" style={{ color: '#FFB200' }}>
                Navegación
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {footerLinks.navegacion.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:transition-colors font-[var(--font-dm-sans)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 rounded"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#A83EF5'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                      aria-label={`Ir a ${link.label}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal + redes */}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-dm-sans)]">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:transition-colors font-[var(--font-dm-sans)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 rounded"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#A83EF5'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                      aria-label={`Ir a ${link.label}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="text-base font-bold text-gray-900 dark:text-white mt-6 mb-4 font-[var(--font-dm-sans)]">
                Síguenos
              </h3>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#100235]"
                    aria-label={social.ariaLabel}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={social.iconSrc}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 object-contain transition-transform group-hover:scale-105"
                      loading="lazy"
                      quality={90}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Copyright pequeño - Más abajo */}
        <div className="pt-4 md:pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="text-center">
            <p className="text-xs font-[var(--font-dm-sans)]" style={{ color: '#ffffff' }}>
              © {currentYear} Altoke. Todos los derechos reservados.
            </p>
            <p className="text-xs font-[var(--font-dm-sans)] mt-1" style={{ color: '#ffffff' }}>
               ALTOKEEC, ECUADOR
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
