import type { Page } from 'playwright-core';
import { getBrowser, url, useTestContext } from '@nuxt/test-utils/e2e';

export async function renderPage(path = '/') {
  const ctx = useTestContext();
  if (!ctx.options.browser) {
    throw new Error('`renderPage` require `options.browser` to be set');
  }

  const browser = await getBrowser();
  const page = await browser.newPage({});
  const pageErrors: Error[] = [];
  const requests: string[] = [];
  const consoleLogs: { type: string; text: string }[] = [];

  page.on('console', (message) => {
    consoleLogs.push({
      type: message.type(),
      text: message.text(),
    });
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err);
  });
  page.on('request', (req) => {
    try {
      requests.push(req.url().replace(url('/'), '/'));
    } catch (err) {
      // TODO
    }
  });

  if (path) {
    await gotoPath(page, path);
  }

  return {
    page,
    pageErrors,
    requests,
    consoleLogs,
  };
}

export async function gotoPath(page: Page, path: string) {
  await page.goto(url(path));
  await page.waitForFunction(
    (path) => window.useNuxtApp?.()._route.fullPath === path && !window.useNuxtApp?.().isHydrating,
    path,
  );
}
