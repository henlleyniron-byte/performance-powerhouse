import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('a first visit prepares the Biology Academy and Community Share for offline use', async ({ page, context }) => {
  // Another app on this origin may already have a response for the same URL.
  await page.goto('/manifest.webmanifest');
  await page.evaluate(async () => {
    const other = await caches.open('unrelated-preview');
    await other.put('/biology-academy/index.html', new Response('Unrelated preview'));
  });
  await page.goto('/index.html?share=1');
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const key = keys.find(name => name.startsWith('powerhouse-v22-'));
    const cache = await caches.open(key);
    return (await cache.keys()).map(request => new URL(request.url).pathname);
  });
  expect(cached).toEqual(expect.arrayContaining([
    '/biology-academy/index.html', '/biology-academy/academy.js', '/biology-academy/content.js',
    '/biology-academy/academy.css', '/community-share.html', '/evidence-rules.js',
  ]));
  await context.setOffline(true);
  await page.goto('/biology-academy/?share=1');
  await expect(page.getByRole('heading', { name: 'Biology Academy' })).toBeVisible();
  await expect(page.locator('#tracks a')).toHaveCount(10);
  await expect(page.getByRole('link', { name: 'Performance Powerhouse', exact: true })).toHaveAttribute('href', /share=1/);
  await page.goto('/community-share.html');
  await page.getByLabel('Choose a follow-up').selectOption('transfer');
  await page.getByRole('button', { name: 'Check this attempt' }).click();
  await expect(page.locator('#transfer-status')).toHaveText('Recorded');
});
