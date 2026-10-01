/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        pujo: {
          red: '#D32F2F',
          gold: '#FFD700',
          dark: '#121212',
          card: '#1E1E1E',
          accent: '#FF9800',
        },
        zone: {
          north: '#E53935',
          south: '#1E88E5',
          central: '#43A047',
          east: '#8E24AA',
          west: '#FB8C00',
        },
      },
    },
  },
  plugins: [],
};
