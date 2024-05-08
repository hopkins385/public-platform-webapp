// vitest.config.ts
import { fileURLToPath } from 'node:url';
import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  // plugins: ['@nuxt/test-utils'],
  test: {
    environment: 'nuxt',
    dir: 'tests',
    coverage: {
      reportsDirectory: 'coverage',
    },
    includeSource: ['../pages/index.vue'],
    exclude: ['./e2e/*'],
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('./', import.meta.url)),
        domEnvironment:
          (process.env.VITEST_DOM_ENV as 'happy-dom' | 'jsdom') ?? 'happy-dom',
        mock: {
          indexedDb: true,
        },
      },
    },
    // setupFiles: './tests/setup/mocks.ts',
    globals: true,
  },
});
