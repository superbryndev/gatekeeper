import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    target: 'es2020',
    lib: {
      entry: 'src/index.ts',
      name: 'Gatekeeper',
      fileName: (format) => `gatekeeper.${format === 'es' ? 'es' : 'umd'}.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        exports: 'named'
      }
    }
  },
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: true,
      insertTypesEntry: true,
      exclude: ['src/script.ts']
    })
  ]
});

