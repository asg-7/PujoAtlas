import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base: (process.env.BASE_PATH || '/').trim(),
  integrations: [tailwind(), react()],
});
