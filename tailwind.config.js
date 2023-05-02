const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    colors: {
      primary: '#0080b7',
      secondary: '#09b0da',
      accent: '#add361',
      gray: colors.gray,
      white: colors.white,
      transparent: colors.transparent,
    },
    fontFamily: {
      sans: ['Source Sans Pro', 'Helvetica Neue', 'sans-serif'],
      utds: ['utah design system'],
    },
    extend: {
      animation: {
        'slide-down': 'slideDown 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        flip: 'rotate-180 300ms ease-out',
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
      },
    },
  },
  plugins: [],
};
