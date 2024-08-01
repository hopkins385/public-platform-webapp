import { setup, $fetch, createPage, url } from '@nuxt/test-utils';
import { describe, test, expect, beforeEach } from 'vitest';
import { renderPage } from '../utils';

describe('Login', async () => {
  await setup({
    browser: true,
    server: true,
  });

  beforeEach(async () => {});

  test('login screen by default', async () => {
    const { page } = await renderPage('/login');
    expect(page.getByRole('heading', { name: 'Login' })).toBeTruthy();
    await page.close();
  });

  test('can login', async () => {
    const { page } = await renderPage('/login');
    await page.fill('input[name="email"]', 'sven@svenson.ai');
    await page.fill('input[name="password"]', 'password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByText('Welcome to RAGNA Cloud').waitFor();

    expect(page.url()).toBe(url('/'));

    await page.close();
  });
});
