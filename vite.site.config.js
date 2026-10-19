// Event website. Dev: run `npm run server` and `npm run site:dev` side by side (/api is proxied).
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  root: 'site',
  publicDir: '../public', // same logo files as the poster generator
  plugins: [svelte()],
  build: { outDir: '../dist-site', emptyOutDir: true },
  server: { port: 5200, proxy: { '/api': 'http://localhost:8080' } },
});
