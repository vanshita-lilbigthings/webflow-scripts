import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/navbar.js'),
      name: 'Navbar',
      fileName: 'navbar',
      formats: ['iife'],
    },
    minify: true,
  },
});