import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/script.ts',
      name: 'Gatekeeper',
      fileName: () => 'gatekeeper-script.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        extend: true,
        globals: {
          // No external dependencies for the script version
        }
      }
    }
  }
});
