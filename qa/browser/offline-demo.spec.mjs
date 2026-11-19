import { expect, test } from '@playwright/test';

test('the downloadable HTML works offline and makes no network requests', async ({ page, context }, testInfo) => {
  const requests = [];
  page.on('request', request => {
    if (/^https?:/.test(request.url())) requests.push(request.url());
  });
  // WebKit's offline emulation also blocks file: navigation. Block only
  // HTTP(S) so the browser can open the file while its network is unavailable.
  await context.route(/^https?:/, route => route.abort('internetdisconnected'));
  await page.goto(new URL('../../demo/repair-loop.html', import.meta.url).href);
  const check = page.getByRole('button', { name: 'Check this attempt' });
  await page.getByLabel('Choose a follow-up').selectOption('transfer');
  await check.click();
  await expect(page.locator('#transfer-status')).toHaveText('Recorded');
  await expect(page.locator('#delayed-status')).toHaveText('Open');
  // Preserve a visual reference of the actual synthetic example for reviewers.
  if (testInfo.project.name !== 'desktop-webkit') {
    await page.screenshot({ path: testInfo.outputPath('community-demo.png'), fullPage: true });
  }
  await page.getByLabel('Choose a follow-up').selectOption('delayed');
  await check.click();
  await expect(page.locator('#delayed-status')).toHaveText('Recorded');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
  await expect(page.getByRole('link', { name: 'Open in share mode' })).toHaveAttribute('href', 'https://al-performance-powerhouse.phenlleyniron.chatgpt.site/?share=1');
  expect(requests).toEqual([]);
});
