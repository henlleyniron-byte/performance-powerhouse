import { expect, test } from '@playwright/test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

test.use({ serviceWorkers: 'allow' });

test('a first visit prepares the Biology Academy and Community Share for offline use', async ({ page }) => {
  // Stop a dedicated origin to test an actual connection failure in every engine.
  const script = fileURLToPath(new URL('../../scripts/preview-v22.py', import.meta.url));
  const server = spawn('python3', [script, '--port', '0'], { stdio: ['ignore', 'pipe', 'inherit'] });
  const stopped = once(server, 'exit');
  const lines = createInterface({ input: server.stdout });
  try {
    const [firstLine] = await Promise.race([
      once(lines, 'line'),
      stopped.then(() => { throw Error('The offline test server stopped before startup'); }),
    ]);
    const origin = new URL(firstLine.replace(/^Open /, '')).origin;
    // Another app on this origin may already have a response for the same URL.
    await page.goto(origin + '/favicon.svg');
    await page.evaluate(async () => {
      const other = await caches.open('unrelated-preview');
      await other.put('/biology-academy/index.html', new Response('Unrelated preview'));
    });
    await page.goto(origin + '/index.html?share=1');
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    const cached = await page.evaluate(async () => {
      const key = (await caches.keys()).find(name => name.startsWith('powerhouse-v22-'));
      const cache = await caches.open(key);
      return (await cache.keys()).map(request => new URL(request.url).pathname);
    });
    expect(cached).toEqual(expect.arrayContaining([
      '/biology-academy/index.html', '/biology-academy/academy.js', '/biology-academy/content.js',
      '/biology-academy/academy.css', '/community-share.html', '/evidence-rules.js',
    ]));
    server.kill();
    await stopped;

    await page.goto(origin + '/biology-academy/?share=1');
    await expect(page.getByRole('heading', { name: 'Biology Academy' })).toBeVisible();
    await expect(page.locator('#tracks a')).toHaveCount(10);
    await expect(page.getByRole('link', { name: 'Performance Powerhouse', exact: true })).toHaveAttribute('href', /share=1/);
    await page.goto(origin + '/community-share.html?offline=1');
    await page.getByLabel('Choose a follow-up').selectOption('transfer');
    await page.getByRole('button', { name: 'Check this attempt' }).click();
    await expect(page.locator('#transfer-status')).toHaveText('Recorded');
  } finally {
    lines.close();
    if (server.exitCode === null && server.signalCode === null) server.kill();
    await stopped;
  }
});
