/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="raat"]'],
  theme: {
    extend: {
      colors: {
        /* Primary Hue Arc Tokens */
        sindoor: 'var(--sindoor)',
        kumkum: {
          DEFAULT: 'var(--kumkum)',
          lit: 'var(--kumkum-lit)',
        },
        terracotta: 'var(--terracotta)',
        marigold: {
          DEFAULT: 'var(--marigold)',
          lit: 'var(--marigold-lit)',
        },
        haldi: 'var(--haldi)',
        neel: 'var(--neel)',

        /* Neutrals */
        shola: 'var(--shola)',
        paper: 'var(--paper)',
        sand: 'var(--sand)',
        smoke: 'var(--smoke)',
        ink: 'var(--ink)',

        /* Dark Mode Surfaces */
        base: 'var(--base)',
        surface: 'var(--surface)',
        raised: 'var(--raised)',
        line: 'var(--line)',
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
