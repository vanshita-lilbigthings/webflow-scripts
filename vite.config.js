import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/navbar.js'),
      name: 'NavbarScript',
      fileName: 'navbar',
      formats: ['iife'],
    },
    minify: true,
  },
})