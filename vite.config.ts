import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      exclude: [...configDefaults.exclude],
      coverage: {
        exclude: [
          'node_modules/',
          'dist/',
          'src/setupTests.ts',
          'src/contracts/**',
          '**/*.config.js',
          '**/*.config.ts',
          '**/tsconfig*.json',
          '**/*.d.ts',
          'src/components/ui',
          'src/demos',
        ],
      },
    },
  };
});
