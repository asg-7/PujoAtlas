/**
 * Tailwind cannot apply an opacity modifier (bg-paper/90) to a colour defined as var(--x),
 * so those classes were silently NOT generated (transparent headers, chips, bottom nav).
 * This helper keeps plain classes (bg-paper) byte-identical and makes `/NN` work via color-mix.
 */
const token = (name) => ({ opacityValue }) =>
  opacityValue === undefined || String(opacityValue).startsWith('var(')
    ? `var(--${name})`
    : `color-mix(in srgb, var(--${name}) ${Math.round(Number(opacityValue) * 100)}%, transparent)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="raat"]'],
  theme: {
    extend: {
      colors: {
        /* Primary Hue Arc Tokens */
        sindoor: token('sindoor'),
        kumkum: {
          DEFAULT: token('kumkum'),
          lit: token('kumkum-lit'),
        },
        terracotta: token('terracotta'),
        marigold: {
          DEFAULT: token('marigold'),
          lit: token('marigold-lit'),
        },
        haldi: token('haldi'),
        neel: token('neel'),

        /* Neutrals */
        shola: token('shola'),
        paper: token('paper'),
        sand: token('sand'),
        smoke: token('smoke'),
        ink: token('ink'),

        /* Dark Mode Surfaces */
        base: token('base'),
        surface: token('surface'),
        raised: token('raised'),
        line: token('line'),
        /* Dark-mode text tokens (already used in markup as dark:text-text / dark:text-text-muted) */
        text: { DEFAULT: token('text'), muted: token('text-muted') },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        full: 'var(--r-full)',
      },
      boxShadow: {
        e1: 'var(--e1)',
        e2: 'var(--e2)',
        e3: 'var(--e3)',
      },
      transitionDuration: {
        instant: 'var(--dur-instant)',
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        inout: 'var(--ease-inout)',
        spring: 'var(--ease-spring)',
      },
    },
  },
  plugins: [],
};
