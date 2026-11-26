import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pageURL = 'http://127.0.0.1:4175/physics-intelligence/';
const storageKey = 'al_performance_powerhouse_physics_intelligence_v1';
const data = JSON.parse(await readFile(fileURLToPath(new URL('../../physics-intelligence/assets/physics-intelligence-data.json', import.meta.url)), 'utf8'));
const familyId = data.currentFamilies[0].familyId;
const existing = {
  version: 1,
  attempts: [{ familyId, outcome: 'wrong', timeSeconds: 140, confidence: 5, recordedAt: '2026-11-26T00:00:00.000Z' }],
};

async function seed(page, value = existing) {
  await page.addInitScript(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: storageKey, state: value });
}

test('share mode clears private results and blocks exports, imports and stale assessment submits', async ({ page }) => {
  await seed(page);
  await page.goto(`${pageURL}?share=1`);
  await expect(page.locator('#familyCount')).toContainText('families');
  await expect(page.locator('#shareBanner')).toBeVisible();
  await expect(page.locator('#performance')).toBeHidden();
  await expect(page.locator('#recommendations')).toBeEmpty();
  await expect(page.locator('#opportunityTable')).toBeEmpty();
  const before = await page.evaluate(key => localStorage.getItem(key), storageKey);

  const leakedDownload = page.waitForEvent('download', { timeout: 250 }).then(() => true).catch(() => false);
  await page.locator('#exportBackup').evaluate(button => button.click());
  expect(await leakedDownload).toBe(false);
  await page.locator('#importBackup').setInputFiles({
    name: 'fictional-empty-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, attempts: [] })),
  });
  await page.locator('#attemptForm').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(before);

  await page.locator('#shareToggle').click();
  await expect(page.locator('#performance')).toBeVisible();
  await expect(page.locator('#recommendations')).toContainText('REVISE');
});

test('malformed imports preserve existing outcomes and valid imports require replacement confirmation', async ({ page }) => {
  await seed(page);
  await page.goto(pageURL);
  await expect(page.locator('#recommendations')).toContainText('REVISE');
  const before = await page.evaluate(key => localStorage.getItem(key), storageKey);

  await page.locator('#importBackup').setInputFiles({
    name: 'fictional-invalid-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, storageKey, attempts: [{ ...existing.attempts[0], outcome: '<img src=x onerror=alert(1)>' }] })),
  });
  await expect(page.locator('#backupStatus')).toContainText('Import rejected');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(before);
  await expect(page.locator('#backupStatus img')).toHaveCount(0);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#importBackup').setInputFiles({
    name: 'fictional-valid-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, storageKey, attempts: [{ familyId, outcome: 'correct', timeSeconds: 80, confidence: 4, recordedAt: '2026-11-26T00:00:00.000Z' }] })),
  });
  await expect(page.locator('#backupStatus')).toContainText('Imported 1 validated outcome');
  const after = JSON.parse(await page.evaluate(key => localStorage.getItem(key), storageKey));
  expect(after.attempts).toEqual([{ familyId, outcome: 'correct', timeSeconds: 80, confidence: 4, recordedAt: '2026-11-26T00:00:00.000Z' }]);
});

test('a file read that spans a share-mode round trip cannot replace private outcomes', async ({ page }) => {
  await seed(page);
  await page.goto(pageURL);
  await expect(page.locator('#recommendations')).toContainText('REVISE');
  const before = await page.evaluate(key => localStorage.getItem(key), storageKey);
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = function () {
      const file = this;
      return new Promise(resolve => { window.__finishBackupRead = () => original.call(file).then(resolve); });
    };
  });
  await page.locator('#importBackup').setInputFiles({
    name: 'fictional-valid-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, storageKey, attempts: [] })),
  });
  await page.locator('#shareToggle').click();
  await page.locator('#shareToggle').click();
  await page.evaluate(() => window.__finishBackupRead());
  await page.waitForTimeout(50);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(before);
});
