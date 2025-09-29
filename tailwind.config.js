import ugrcPreset from '@ugrc/tailwind-preset';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './node_modules/@ugrc/**/*.{tsx,jsx,js}',
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [ugrcPreset],
  theme: {
    fontFamily: {
      sans: ['Source Sans Pro', 'Helvetica Neue', 'sans-serif'],
      utds: ['utah design system'],
    },
    extend: {
      colors: {
        primary: {
          light: '#009DE0',
          DEFAULT: '#0080B7',
          dark: '#00597F',
        },
        secondary: {
          light: '#16C9F5',
          DEFAULT: '#09B0DA',
          dark: '#0785A4',
        },
        accent: {
          light: '#CEE5A1',
          DEFAULT: '#ADD361',
          dark: '#74992B',
        },
        slate: colors.slate,
        white: colors.white,
        transparent: colors.transparent,
        success: colors.emerald,
        error: colors.red,
        info: colors.sky,
        warning: colors.amber,
        sky: colors.sky,
      },
      animation: {
        'slide-down': 'slideDown 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        flip: 'rotate-180 300ms ease-out',
        'fade-in': 'fadeIn 200ms ease-in-out',
        'fade-out': 'fadeOut 200ms ease-in-out',
        'pop-in': 'popIn 200ms ease-in-out',
      },
      keyframes: {
        slideDown: {
          from: {
            height: 0,
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        slideUp: {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: 0,
          },
        },
        fadeIn: {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
        fadeOut: {
          from: {
            opacity: 1,
          },
          to: {
            opacity: 0,
          },
        },
        popIn: {
          from: {
            opacity: 0,
            transform: 'translate(-50%, -48%) scale(0.96)',
          },
          to: {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
          },
        },
      },
      boxShadow: {
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@tailwindcss/forms')],
};
