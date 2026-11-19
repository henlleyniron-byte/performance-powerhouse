import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

import { startPrivateWorkbench, coreRecord, saveAttempt } from './workbench.mjs';

test('a marked attempt, reattempt, transfer and delayed retest survive backup and reload', async ({ page }) => {
  test.setTimeout(90_000); // This flow opens and closes independent browser profiles.
  await startPrivateWorkbench(page);
  const original = 'Fictional timing card A';

  await saveAttempt(page, { question: original, date: '2026-07-01', earned: 2 });
  let record = await coreRecord(page);
  const sourceId = record.attempts[0].id;
  const openStages = () => record.retests.filter(row => !row.completedAt).map(row => row.stage).sort();
  expect(openStages()).toEqual([1, 2]);
  await saveAttempt(page, { type: 'reattempt', question: original, date: '2026-07-02', earned: 5, sourceId });
  await saveAttempt(page, { type: 'fresh-transfer', question: 'Unlinked practice card', date: '2026-07-04', earned: 5, novel: true });
  record = await coreRecord(page);
  expect(openStages()).toEqual([1, 2]);

  await saveAttempt(page, { type: 'fresh-transfer', question: 'Fictional timing card B', date: '2026-07-04', earned: 5, sourceId, novel: true });
  record = await coreRecord(page);
  expect(openStages()).toEqual([2]);
  await saveAttempt(page, { type: 'delayed-retest', question: 'Fictional timing card C', date: '2026-07-08', earned: 5, sourceId, novel: true });
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
