import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    name: 'glycogourmet-unit-integration',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/unit/**/*.{spec,test}.{ts,tsx,js,jsx}',
      'tests/integration/**/*.{spec,test}.{ts,tsx,js,jsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/metabolicEngine.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
