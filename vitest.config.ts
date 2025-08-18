import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/src'),
      '@shared': resolve(__dirname, 'shared'),
      '@assets': resolve(__dirname, 'attached_assets'),
    }
  }
});