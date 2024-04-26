import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import type { ConfigOptions } from '@nuxt/test-utils/playwright';

const devicesToTest = [
  'Desktop Chrome',
  // Test against other common browser engines.
  // 'Desktop Firefox',
  // 'Desktop Safari',
  // Test against mobile viewports.
  // 'Pixel 5',
  // 'iPhone 12',
  // Test against branded browsers.
  // { ...devices['Desktop Edge'], channel: 'msedge' },
  // { ...devices['Desktop Chrome'], channel: 'chrome' },
] satisfies Array<string | (typeof devices)[string]>;

/* See https://playwright.dev/docs/test-configuration. */
export default defineConfig<ConfigOptions>({
  timeout: 5 * 60 * 1000,
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.spec.mts',
  outputDir: './tests/e2e/reports',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: './tests/e2e/reports/playw-report' }]],
  // server options
  webServer: {
    // port: 3000,
    command: 'npm run dev',
    // url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    // baseURL: 'http://127.0.0.1:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Nuxt configuration options */
    nuxt: {
      build: false,
      dev: true,
      // server: false,
      // // browser: false,
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  projects: devicesToTest.map((p) =>
    typeof p === 'string' ? { name: p, use: devices[p] } : p,
  ),
});
