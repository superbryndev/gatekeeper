import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'examples/react',
  build: {
    outDir: '../../dist-examples/react',
    emptyOutDir: true
  },
  server: {
    port: 5174,
    open: true
  }
});
