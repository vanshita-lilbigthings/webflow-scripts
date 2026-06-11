import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

const srcFiles = readdirSync('./src').filter((f) => f.endsWith('.js'));

const entries = Object.fromEntries(
  srcFiles.map((f) => [f.replace('.js', ''), resolve(__dirname, `src/${f}`)])
);

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: entries,
      formats: ['iife'],
    },
    minify: true,
  },
});