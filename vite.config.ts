import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  test: {
    include: ['src/**/*.test.ts', 'workers/**/*.test.ts'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts']
  },
  
  resolve: process.env.VITEST
    ? {
        conditions: ['browser']
      }
    : undefined,
  
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets'
  },
  
  server: {
    port: 5173,
    strictPort: true
  }
});