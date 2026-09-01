import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['client/src/**/*.test.ts', 'client/src/**/*.test.tsx', 'server/src/**/*.test.ts'],
  },
});
