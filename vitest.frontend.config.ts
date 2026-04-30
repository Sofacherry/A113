import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    css: true,
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
