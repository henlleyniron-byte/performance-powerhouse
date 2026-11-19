import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { coreRecord, saveAttempt, startPrivateWorkbench } from './workbench.mjs';

const draftKey = 'alpp_attempt_draft_v14';

async function savedDraft(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), draftKey);
}

test('a linked draft restores its exact source after a cold reload', async ({ page }) => {
  await startPrivateWorkbench(page);
  await saveAttempt(page, { question: 'Fictional milliseconds worksheet', date: '2026-07-01', earned: 2 });
  const before = await coreRecord(page);
  const originalId = before.attempts[0].id;
  await page.locator('#log-from-ledger').click();
  await page.locator('#attempt-type').selectOption('fresh-transfer');
  await page.locator('#attempt-question').fill('Fictional unfinished transfer');
  // Choosing the original is the last edit before the student leaves.
  await page.locator('#fs-source').selectOption(originalId);
  await expect.poll(async () => (await savedDraft(page))?.fields['fs-source']).toBe(originalId);
  await page.reload();
  await page.locator('#app-tabs [data-panel="attempts"]').click();
  await page.getByRole('button', { name: 'Restore unsubmitted attempt fields' }).click();
  await expect(page.locator('#attempt-dialog')).toBeVisible();
  await expect(page.locator('#attempt-question')).toHaveValue('Fictional unfinished transfer');
  await expect(page.locator('#fs-source')).toHaveValue(originalId);
  await expect(page.locator('#v6-source-id')).toHaveValue(originalId);
  const after = await coreRecord(page);
  expect(after.attempts).toEqual(before.attempts);
  expect(after.retests).toEqual(before.retests);
});

for (const earlier of [null, 'Earlier fictional question']) {
  test(`restore before autosave with ${earlier ? 'an older saved draft' : 'no earlier draft'}`, async ({ page }) => {
    await startPrivateWorkbench(page);
    await page.locator('#log-from-ledger').click();
    if (earlier) {
      await page.locator('#attempt-question').fill(earlier);
      await expect.poll(async () => (await savedDraft(page))?.fields['attempt-question']).toBe(earlier);
    }
    // Perform these three DOM actions in one browser task to exercise the 250 ms
    // gap deterministically while keeping the native form and its listeners.
    const observed = await page.evaluate(key => {
      const field = document.getElementById('attempt-question');
      field.value = 'Latest fictional question';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#attempt-form [data-close-dialog]').click();
      document.getElementById('v14-draft-restore').click();
      return { restored: field.value, persisted: JSON.parse(localStorage.getItem(key))?.fields['attempt-question'] ?? null };
    }, draftKey);
    expect(observed).toEqual({ restored: 'Latest fictional question', persisted: earlier });
    await expect(page.locator('#attempt-dialog')).toBeVisible();
    expect((await coreRecord(page)).attempts).toHaveLength(0);
  });
}

test('opening a shared view hides draft actions and retains the private draft', async ({ page }) => {
  await startPrivateWorkbench(page);
  await page.locator('#log-from-ledger').click();
  await page.locator('#attempt-question').fill('Fictional private draft');
  await expect.poll(async () => (await savedDraft(page))?.fields['attempt-question']).toBe('Fictional private draft');
  await page.goto('/index.html?share=1');
  await expect(page.locator('body')).toHaveClass(/share-safe/);
  await page.locator('#app-tabs [data-panel="attempts"]').click();
  await expect(page.locator('#v14-draft-export')).toBeHidden();
  await expect(page.locator('#v14-draft-restore')).toBeHidden();
  await expect(page.locator('#identity-line')).not.toContainText('Example Learner');
  await page.goto('/index.html');
  await page.locator('#app-tabs [data-panel="attempts"]').click();
  await page.getByRole('button', { name: 'Restore unsubmitted attempt fields' }).click();
  await expect(page.locator('#attempt-question')).toHaveValue('Fictional private draft');
});

test('a competing tab keeps the saved draft and can export its own pending edit', async ({ page, context }) => {
  await startPrivateWorkbench(page);
  await page.locator('#log-from-ledger').click();
  await page.locator('#attempt-question').fill('Shared starting draft');
  await expect.poll(async () => (await savedDraft(page))?.fields['attempt-question']).toBe('Shared starting draft');

  const other = await context.newPage();
  await other.goto('/index.html');
  await other.locator('#app-tabs [data-panel="attempts"]').click();
  await other.getByRole('button', { name: 'Restore unsubmitted attempt fields' }).click();
  await page.locator('#attempt-question').fill('First tab saved question');
  await expect.poll(async () => (await savedDraft(page))?.fields['attempt-question']).toBe('First tab saved question');

  await other.locator('#attempt-question').fill('Second tab pending question');
  await other.locator('#attempt-dialog').getByRole('button', { name: 'Cancel' }).click();
  await expect(other.locator('#v14-draft-status')).toContainText(/paused|another tab/i);
  await expect(other.locator('#v14-draft-restore')).toBeDisabled();
  const downloading = other.waitForEvent('download');
  await other.locator('#v14-draft-export').click();
  const exported = JSON.parse(await readFile(await (await downloading).path(), 'utf8'));
  expect(exported.fields['attempt-question']).toBe('Second tab pending question');
  expect((await savedDraft(page)).fields['attempt-question']).toBe('First tab saved question');
});

test('older source-picker drafts recover a valid choice and preserve ambiguous originals for review', async ({ page, browser }) => {
  await startPrivateWorkbench(page);
  await saveAttempt(page, { question: 'Original timing task', date: '2026-07-01', earned: 2 });
  const source = (await coreRecord(page)).attempts[0];
  const storage = await page.context().storageState();
  const saved = storage.origins.find(origin => origin.origin === new URL(page.url()).origin);
  saved.localStorage = saved.localStorage.filter(item => !item.name.startsWith(draftKey));
  for (const [visible, hidden, valid] of [
    [source.id, '', true], [undefined, source.id, true],
    [source.id, 'other-original', false], ['missing-original', '', false],
  ]) {
    const fields = {
      'attempt-question': 'Historical fictional transfer', 'attempt-subject': source.subject,
      'attempt-type': 'fresh-transfer', 'attempt-topic': source.topicKey,
      'fs-source': visible, 'v6-source-id': hidden,
    };
    const raw = JSON.stringify({ schema: 'powerhouse-attempt-draft-v1', fields });
    const profile = structuredClone(storage);
    profile.origins.find(origin => origin.origin === saved.origin).localStorage.push({ name: draftKey, value: raw });
    const context = await browser.newContext({ storageState: profile });
    try {
      const tab = await context.newPage();
      await tab.goto(page.url());
      await tab.locator('#app-tabs [data-panel="attempts"]').click();
      await tab.locator('#v14-draft-restore').click();
      if (valid) {
        await expect(tab.locator('#fs-source')).toHaveValue(source.id);
        await expect(tab.locator('#v6-source-id')).toHaveValue(source.id);
        await expect(tab.locator('#attempt-dialog')).toBeVisible();
      } else {
        await expect(tab.locator('#attempt-dialog')).toBeHidden();
        await expect(tab.locator('#v14-draft-status')).toContainText(/review/i);
      }
      expect(await tab.evaluate(key => localStorage.getItem(key), draftKey)).toBe(raw);
      expect((await coreRecord(tab)).attempts).toHaveLength(1);
    } finally {
      await context.close();
    }
  }
});

test('a simulated draft quota failure retains the pending download and the saved original', async ({ page }) => {
  await startPrivateWorkbench(page);
  await page.locator('#log-from-ledger').click();
  await page.locator('#attempt-question').fill('Last saved example');
  await expect.poll(async () => (await savedDraft(page))?.fields['attempt-question']).toBe('Last saved example');
  await page.evaluate(prefix => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith(prefix)) throw new DOMException('Simulated quota limit', 'QuotaExceededError');
      return setItem.call(this, key, value);
    };
  }, draftKey);
  await page.locator('#attempt-question').fill('Pending at the quota limit');
  await page.locator('#attempt-dialog').getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('#v14-draft-status')).toContainText(/quota/i);
  const downloading = page.waitForEvent('download');
  await page.locator('#v14-draft-export').click();
  const exported = JSON.parse(await readFile(await (await downloading).path(), 'utf8'));
  expect(exported.fields['attempt-question']).toBe('Pending at the quota limit');
  expect((await savedDraft(page)).fields['attempt-question']).toBe('Last saved example');
});
