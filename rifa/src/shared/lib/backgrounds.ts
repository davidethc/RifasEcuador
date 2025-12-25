/**
 * Sistema de fondos reutilizables
 * Usa estos fondos con el componente <Background name="emerald" />
 */

export type BackgroundName = 
  | 'emerald'
  | 'slate'
  | 'midnight-aurora'
  | 'deep-ocean'
  | 'crystal-maze'
  | 'soft-yellow'
  | 'default';

export interface BackgroundStyle {
  containerClass: string;
  backgroundStyle: React.CSSProperties;
}

export const backgrounds: Record<BackgroundName, BackgroundStyle> = {
  emerald: {
    containerClass: 'min-h-screen w-full bg-white relative',
    backgroundStyle: {
      backgroundImage: `
        radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #10b981 100%)
      `,
      backgroundSize: '100% 100%',
    },
  },
  slate: {
    containerClass: 'min-h-screen w-full relative',
    backgroundStyle: {
      background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)',
    },
  },
  'midnight-aurora': {
    containerClass: 'min-h-screen w-full bg-black relative',
    backgroundStyle: {
      backgroundImage: `
        radial-gradient(circle at 50% 50%, 
          rgba(58, 123, 255, 0.25) 0%, 
          rgba(100, 149, 237, 0.15) 25%, 
          rgba(123, 104, 238, 0.07) 35%, 
          transparent 50%
        )
      `,
    },
  },
  'deep-ocean': {
    containerClass: 'min-h-screen w-full bg-black relative',
    backgroundStyle: {
      background: 'radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)',
    },
  },
  'crystal-maze': {
    containerClass: 'min-h-screen w-full relative',
    backgroundStyle: {
      background: `
        repeating-linear-gradient(
          60deg,
          transparent 0px,
          transparent 1px,
          rgba(255, 255, 255, 0.05) 1px,
          rgba(255, 255, 255, 0.05) 2px
        ),
        repeating-linear-gradient(
          -60deg,
          transparent 0px,
          transparent 1px,
          rgba(255, 255, 255, 0.05) 1px,
          rgba(255, 255, 255, 0.05) 2px
        ),
        linear-gradient(
          60deg,
          rgba(43, 108, 176, 0.4) 0%,
          rgba(72, 126, 176, 0.4) 33%,
          rgba(95, 142, 176, 0.4) 66%,
          rgba(116, 157, 176, 0.4) 100%
        ),
        radial-gradient(
          circle at 50% 50%,
          rgba(255, 255, 255, 0.2) 0%,
          transparent 50%
        )
      `,
      backgroundBlendMode: 'overlay, overlay, normal, screen',
      animation: 'crystal-shimmer 15s ease-in-out infinite',
    },
  },
  'soft-yellow': {
    containerClass: 'min-h-screen w-full relative bg-white',
    backgroundStyle: {
      backgroundImage: 'radial-gradient(circle at center, #FFF991 0%, transparent 70%)',
      opacity: 0.6,
      mixBlendMode: 'multiply',
    },
  },
  default: {
    containerClass: 'min-h-screen w-full relative',
    backgroundStyle: {},
  },
};
