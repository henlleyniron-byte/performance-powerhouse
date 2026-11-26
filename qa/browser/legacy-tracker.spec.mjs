import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const legacy = 'http://127.0.0.1:4175/study-tracker/';
const ledger = 'al_performance_powerhouse_study_tracker_v1';
const lock = 'al_performance_powerhouse_study_tracker_active_lock_v1';

async function addFictionalSession(page) {
  await page.goto(legacy);
  await page.locator('#quick-log-btn').click();
  await page.locator('#q-task').fill('Fictional marked worksheet');
  await page.locator('#save-quick').click();
  await expect(page.locator('#history')).toContainText('Fictional marked worksheet');
}

test('a shared tracker link hides private history, preserves the ledger and leaves the timer stopped', async ({ page }) => {
  await addFictionalSession(page);
  const original = await page.evaluate(key => localStorage.getItem(key), ledger);
  await page.goto(legacy + '?share=1&start=1&task=Fictional');
  await expect(page.locator('#share-note')).toBeVisible();
  await expect(page.locator('#data-btn')).toBeHidden();
  await expect(page.locator('#history')).toBeHidden();
  await expect(page.locator('#history')).toBeEmpty();
  await expect(page.locator('#kpis')).toBeEmpty();
  await expect(page.locator('#task')).toBeHidden();
  await expect(page.locator('#task')).toHaveValue('');
  await expect(page.getByRole('link', { name: 'Back to Performance Powerhouse' })).toHaveAttribute('href', /\?share=1$/);
  await expect(page.locator('body')).not.toContainText('Fictional marked worksheet', { useInnerText: true });
  expect(await page.evaluate(key => localStorage.getItem(key), ledger)).toBe(original);
  expect(await page.evaluate(key => localStorage.getItem(key), lock)).toBeNull();
  const leakedDownload = page.waitForEvent('download', { timeout: 250 }).then(() => true).catch(() => false);
  await page.locator('#export-json').evaluate(button => button.click());
  expect(await leakedDownload).toBe(false);
  await page.locator('#import-file').setInputFiles({
    name: 'fictional-empty-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"sessions":[]}'),
  });
  expect(await page.evaluate(key => localStorage.getItem(key), ledger)).toBe(original);
  await page.getByRole('button', { name: 'Return to private tracker' }).click();
  await expect(page.locator('#history')).toBeVisible();
  await expect(page.locator('#history')).toContainText('Fictional marked worksheet');
  await expect(page).toHaveURL(url => !url.searchParams.has('share') && !url.searchParams.has('start'));
  await page.locator('#data-btn').click();
  const download = page.waitForEvent('download');
  await page.locator('#export-json').click();
  const backup = JSON.parse(await readFile(await (await download).path(), 'utf8'));
  expect(backup.sessions).toEqual(JSON.parse(original).sessions);
});

test('opening a public tracker tab preserves ownership of an existing private timer', async ({ page, context }) => {
  await page.goto(legacy);
  await page.locator('#task').fill('Fictional private effort');
  await page.locator('#start-btn').click();
  await expect(page.locator('#active-task')).toHaveText('Fictional private effort');
  const owner = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).activeSession.ownerTab, ledger);
  const shared = await context.newPage();
  await shared.goto(legacy + '?share=1');
  await expect(shared.locator('#active-task')).toBeHidden();
  await expect(shared.locator('#active-task')).toBeEmpty();
  await expect(shared.locator('#clock')).toBeEmpty();
  await expect(shared.locator('#sync-state')).toHaveText('SHARED VIEW');
  const state = await shared.evaluate(key => JSON.parse(localStorage.getItem(key)), ledger);
  expect(state.activeSession.ownerTab).toBe(owner);
  expect(state.settings.shareSafe).toBe(false);
  expect(await shared.evaluate(key => JSON.parse(localStorage.getItem(key)).tabId, lock)).toBe(owner);
});

test('a pending import cannot replace the ledger after share mode is enabled', async ({ page }) => {
  await addFictionalSession(page);
  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), ledger);
  await page.evaluate(() => {
    FileReader.prototype.readAsText = function () {
      const reader = this;
      window.__completeImportRead = () => {
        Object.defineProperty(reader, 'result', { configurable: true, value: '{"sessions":[]}' });
        reader.onload?.();
      };
    };
  });
  await page.locator('#import-file').setInputFiles({
    name: 'fictional-empty-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"sessions":[]}'),
  });
  await page.locator('#share-btn').click();
  await expect(page.locator('#share-note')).toBeVisible();
  await page.evaluate(() => window.__completeImportRead());
  const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), ledger);
  expect(after.sessions).toEqual(before.sessions);
});

test('captured private controls cannot write after share mode closes their dialog', async ({ page }) => {
  await addFictionalSession(page);
  const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).sessions, ledger);
  await page.locator('#quick-log-btn').click();
  await page.locator('#q-task').fill('Fictional stale quick entry');
  await page.evaluate(() => document.getElementById('share-btn').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await expect(page.locator('#quick-dialog')).toBeHidden();
  await page.locator('#save-quick').evaluate(button => button.click());
  await page.locator('#start-btn').evaluate(button => button.click());
  let state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), ledger);
  expect(state.sessions).toEqual(before);
  expect(state.activeSession).toBeNull();

  await page.getByRole('button', { name: 'Return to private tracker' }).click();
  await page.locator('#task').fill('Fictional active session');
  await page.locator('#start-btn').click();
  await page.locator('#finish-btn').click();
  await page.evaluate(() => document.getElementById('share-btn').dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await expect(page.locator('#finish-dialog')).toBeHidden();
  await page.locator('#pause-btn').evaluate(button => button.click());
  await page.locator('#save-finish').evaluate(button => button.click());
  state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), ledger);
  expect(state.sessions).toEqual(before);
  expect(state.activeSession.task).toBe('Fictional active session');
  expect(state.activeSession.status).toBe('running');
});

test('an explicit private tracker choice stays private after the shared default is reloaded', async ({ page }) => {
  await page.goto(legacy);
  await page.evaluate(() => localStorage.setItem('al_performance_powerhouse_v5', JSON.stringify({ v5Settings: { shareSafe: true } })));
  await page.reload();
  await expect(page.locator('#share-note')).toBeVisible();
  await page.getByRole('button', { name: 'Return to private tracker' }).click();
  await expect(page.locator('#share-note')).toBeHidden();
  await page.reload();
  await expect(page.locator('#share-note')).toBeHidden();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).settings.shareSafe, ledger)).toBe(false);
});

test('the timer display follows a session refreshed by another private tab', async ({ page, context }) => {
  await page.goto(legacy);
  await page.locator('#task').fill('Fictional cross-tab timer');
  await page.locator('#start-btn').click();
  const update = await context.newPage();
  await update.goto(legacy);
  await update.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key));
    state.activeSession.startedAt = Date.now() - 125_000;
    localStorage.setItem(key, JSON.stringify(state));
  }, ledger);
  await page.waitForTimeout(1_200);
  await expect(page.locator('#clock')).toHaveText(/^00:02:/);
});
