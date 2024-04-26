import { expect, test } from '@nuxt/test-utils/playwright';
import type { Page } from 'playwright-core';

function getUrl(page: Page) {
  return page.url().split('/').slice(3).join('/').split('?')[0];
}

test('[auth] can login', async ({ page, goto }) => {
  // Navigate to your Nuxt 3 app's URL
  await goto('/', { waitUntil: 'hydration' });

  // expect a redirect to /login
  expect(getUrl(page)).toBe('login');

  await page.fill('input[name="email"]', 'sven@svenson.ai');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // expect a redirect to /chat
  await page.waitForURL('/chat');
  await expect(page.getByText('Erstellen')).toBeVisible();
});

test('[auth] cannot login', async ({ page, goto }) => {
  // Navigate to your Nuxt 3 app's URL
  await goto('/', { waitUntil: 'hydration' });

  // expect a redirect to /login
  expect(getUrl(page)).toBe('login');

  await page.fill('input[name="email"]', 'sven@svenson.ai');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(1500);
  await expect(page.getByText('falsch')).toBeVisible();

  // expect a redirect to /login
  expect(getUrl(page)).toBe('login');

  // try to navigate to /chat
  await goto('/chat', { waitUntil: 'networkidle' });
  // expect a redirect to /login
  expect(getUrl(page)).toBe('login');
});
