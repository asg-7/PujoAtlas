/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="raat"]'],
  theme: {
    extend: {
      colors: {
        chalk: {
          DEFAULT: 'var(--chalk)',
          2: 'var(--chalk-2)',
          3: 'var(--chalk-3)',
        },
        shankha: 'var(--shankha)',
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        geru: {
          DEFAULT: 'var(--geru)',
          text: 'var(--geru-text)',
        },
        neel: 'var(--neel)',
        sage: 'var(--sage)',
        brass: {
          DEFAULT: 'var(--brass)',
          text: 'var(--brass-text)',
        },
        border: {
          DEFAULT: 'var(--border)',
          control: 'var(--control-border)',
        },
        pujo: {
          red: '#D32F2F',
          gold: '#B08D57',
          dark: '#181512',
          card: '#221D18',
          accent: '#A65A3A',
        },
        zone: {
          north: 'var(--z-north)',
          south: 'var(--z-south)',
          central: 'var(--z-central)',
          east: 'var(--z-east)',
          west: 'var(--z-west)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
