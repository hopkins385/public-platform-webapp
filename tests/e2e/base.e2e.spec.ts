import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  // Navigate to your Nuxt 3 app's URL
  await page.goto('/');
  // expect a redirect to /login
  expect(page.url()).toBe('http://localhost:3000/');
});
