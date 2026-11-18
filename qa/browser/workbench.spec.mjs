import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const coreKey = 'al_performance_powerhouse_v4';

async function startPrivateWorkbench(page) {
  await page.goto('/index.html');
  await page.getByLabel('Your name').fill('Example Learner');
  await page.getByRole('button', { name: 'Enter my Powerhouse' }).click();
  await page.locator('#app-tabs [data-panel="attempts"]').click();
}

async function coreRecord(page) {
  return page.evaluate(key => JSON.parse(window.TrinityRead.raw(localStorage, key)), coreKey);
}

test('a marked attempt, reattempt, transfer and delayed retest survive backup and reload', async ({ page }) => {
  await startPrivateWorkbench(page);
  const dialog = page.locator('#attempt-dialog');
  const original = 'Fictional timing card A';
  let sourceId;

  async function save({ type = 'topic-question', question, date, earned, linked = false, novel = false }) {
    await page.locator('#log-from-ledger').click();
    await dialog.locator('#attempt-date').fill(date);
    await dialog.locator('#attempt-type').selectOption(type);
    await dialog.locator('#attempt-topic').selectOption('physics|0|0');
    await dialog.locator('#attempt-question').fill(question);
    await dialog.locator('#marks-earned').fill(String(earned));
    await dialog.locator('#marks-total').fill('5');
    await dialog.locator('#attempt-minutes').fill('4');
    if (earned < 5) {
      await dialog.locator('#attempt-error').selectOption('M');
      await dialog.locator('#attempt-note').fill('Convert milliseconds to seconds before calculating.');
    }
    await dialog.locator('#attempt-unaided').check();
    if (novel) await dialog.locator('#attempt-novel').check();
    if (linked) await dialog.locator('#fs-source').selectOption(sourceId);
    await dialog.getByRole('button', { name: 'Save evidence + update repair queue' }).click();
    await expect(dialog).toBeHidden();
  }

  await save({ question: original, date: '2026-07-01', earned: 2 });
  let record = await coreRecord(page);
  sourceId = record.attempts[0].id;
  const openStages = () => record.retests.filter(row => !row.completedAt).map(row => row.stage).sort();
  expect(openStages()).toEqual([1, 2]);
  await save({ type: 'reattempt', question: original, date: '2026-07-02', earned: 5, linked: true });
  await save({ type: 'fresh-transfer', question: 'Unlinked practice card', date: '2026-07-04', earned: 5, novel: true });
  record = await coreRecord(page);
  expect(openStages()).toEqual([1, 2]);

  await save({ type: 'fresh-transfer', question: 'Fictional timing card B', date: '2026-07-04', earned: 5, linked: true, novel: true });
  record = await coreRecord(page);
  expect(openStages()).toEqual([2]);
  await save({ type: 'delayed-retest', question: 'Fictional timing card C', date: '2026-07-08', earned: 5, linked: true, novel: true });
  await page.reload();
  record = await coreRecord(page);
  expect(openStages()).toEqual([]);
  expect(record.attempts).toHaveLength(5);
  const proof = record.retests.map(retest => ({
    stage: retest.stage, source: retest.sourceAttemptId,
    question: record.attempts.find(a => a.id === retest.completedByAttemptId)?.question,
  }));
  expect(proof).toEqual([
    { stage: 1, source: sourceId, question: 'Fictional timing card B' },
    { stage: 2, source: sourceId, question: 'Fictional timing card C' },
  ]);

  await page.locator('#data-btn').click();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  const download = await downloading;
  const backup = await readFile(await download.path());
  expect(JSON.parse(backup).retests).toEqual(record.retests);

  // Restore in an independent browser profile, as a student changing devices would.
  const fresh = await page.context().browser().newContext();
  try {
    const restored = await fresh.newPage();
    await restored.goto(page.url());
    await expect(restored.locator('#welcome-dialog')).toBeVisible();
    restored.once('dialog', confirm => confirm.accept());
    const chooser = restored.waitForEvent('filechooser');
    await restored.getByRole('button', { name: 'Restore a backup' }).click();
    await (await chooser).setFiles({ name: 'fictional-backup.json', mimeType: 'application/json', buffer: backup });
    await expect(restored.locator('#welcome-dialog')).toBeHidden();
    await restored.reload();
    const imported = await coreRecord(restored);
    expect(imported.retests).toEqual(record.retests);
    expect(imported.attempts.map(a => a.id)).toEqual(record.attempts.map(a => a.id));
  } finally {
    await fresh.close();
  }
});
