import { test, expect } from '@playwright/test';

test('the first keyboard stop skips the loaded workspace navigation', async ({ page }) => {
  await page.goto('/community-share.html');
  await expect(page.getByRole('navigation', { name: 'Powerhouse workspace' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Open in share mode', exact: true })).toBeFocused();
});

test('the example records only eligible attempts and leaves browser records alone', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/community-share.html');
  const storageBefore = await page.evaluate(() => JSON.stringify(localStorage));
  const check = async choice => {
    await page.getByLabel('Choose a follow-up').selectOption(choice);
    await page.getByRole('button', { name: 'Check this attempt' }).click();
  };
  const transfer = page.locator('#transfer-status');
  const delayed = page.locator('#delayed-status');
  for (const choice of ['repeat', 'early', 'delayed']) {
    await check(choice);
    await expect(transfer).toHaveText('Open');
    await expect(delayed).toHaveText('Open');
  }
  await check('transfer');
  await expect(transfer).toHaveText('Recorded');
  await expect(delayed).toHaveText('Open');
  await check('transfer');
  await expect(page.getByRole('status')).toContainText('already has credit');
  await check('delayed');
  await expect(delayed).toHaveText('Recorded');
  await page.getByRole('button', { name: 'Reset example' }).click();
  await expect(transfer).toHaveText('Open');
  await expect(delayed).toHaveText('Open');
  await expect(page.getByLabel('Choose a follow-up')).toHaveValue('repeat');
  await expect.poll(() => page.evaluate(() => JSON.stringify(localStorage))).toBe(storageBefore);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('all community share links open V22 with sharing active', async ({ page }) => {
  const destinations = [
    ['Open in share mode', '/', 'share-safe'],
    ['Physics Intelligence', '/physics-intelligence/', 'share-mode'],
    ['Chemistry Intelligence', '/chemistry-intelligence/', 'share-mode'],
    ['Biology Intelligence', '/biology-intelligence/', 'share-mode'],
    ['Study Tracker', '/study-tracker/', 'share-safe'],
  ];
  for (const [name, path, mode] of destinations) {
    await page.goto('/community-share.html');
    const link = page.getByRole('main').getByRole('link', { name, exact: true });
    await link.click();
    await expect(page).toHaveURL(url => url.pathname === path && url.searchParams.get('share') === '1');
    await expect(page.locator('body')).toHaveClass(new RegExp(`\\b${mode}\\b`));
  }
  await page.goto('/community-share.html');
  await page.getByRole('link', { name: 'Open full dashboard' }).click();
  await expect(page).toHaveTitle(/V22 Latest Attempt Recovery/);
  await expect(page.getByRole('dialog')).toContainText('Build your private A/L performance system');
});
