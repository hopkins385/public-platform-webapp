import { expect, test } from '@nuxt/test-utils/playwright';

test('test', async ({ page, goto }) => {
  // Navigate to your Nuxt 3 app's URL
  await goto('/', { waitUntil: 'hydration' });
  // split get rid of the protocol and host
  const url = page.url().split('/').slice(3).join('/');
  // expect a redirect to /login
  expect(url).toBe('login');
});
