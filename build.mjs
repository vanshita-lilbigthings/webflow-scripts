import { build } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

const srcFiles = readdirSync('./src').filter((f) => f.endsWith('.js'));
console.log(`Building ${srcFiles.length} files:`, srcFiles);

for (const file of srcFiles) {
  const name = file.replace('.js', '');
  const libName = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve('./src', file),
        name: libName,
        fileName: name,
        formats: ['iife'],
      },
      minify: true,
    },
    logLevel: 'warn',
  });
  console.log(`✓ ${name}.iife.js`);
}
