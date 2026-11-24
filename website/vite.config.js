import { defineConfig } from 'vite';

export default defineConfig({
  // Rutas relativas: funciona en GitHub Pages, subcarpetas y file://
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: 'public',
});
