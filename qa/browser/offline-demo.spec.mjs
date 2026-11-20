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

test('the standalone Biology Academy runs every learning track without a network connection', async ({ page, context }) => {
  const requests = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route(/^https?:/, route => {
    requests.push(route.request().url());
    return route.abort('internetdisconnected');
  });
  await page.goto(new URL('../../demo/biology-academy.html', import.meta.url).href);
  const links = page.locator('#tracks a');
  await expect(links).toHaveCount(10);
  const titles = await links.allTextContents();
  for (const title of titles) {
    await page.locator('#tracks').getByRole('link', { name: title, exact: true }).click();
    await expect(page.locator('#lesson h2')).toHaveText(title);
    await expect(page.locator('#lesson textarea')).toHaveCount(2);
    await expect(page.locator('#lesson input[type=radio]')).toHaveCount(8);
  }
  await page.locator('#lesson input[type=radio]').first().check();
  await page.getByRole('button', { name: 'Check prediction' }).click();
  await expect(page.locator('#lesson [role=status]').first()).toBeVisible();
  await page.locator('#lesson textarea').first().fill('A fictional written response.');
  await links.first().click();
  await links.last().click();
  await expect(page.locator('#lesson textarea').first()).toHaveValue('A fictional written response.');
  await page.reload();
  await expect(page.locator('#lesson h2')).toHaveText(titles.at(-1));
  await expect(page.locator('#lesson textarea').first()).toHaveValue('');
  await expect(page.getByRole('link', { name: 'Biology Intelligence', exact: true })).toHaveAttribute('href', /^https:\/\/.*\/biology-intelligence\/\?share=1$/);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
