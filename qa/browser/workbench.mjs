import { expect } from '@playwright/test';

const coreKey = 'al_performance_powerhouse_v4';

export async function startPrivateWorkbench(page, path = '/index.html') {
  await page.goto(path);
  await page.getByLabel('Your name').fill('Example Learner');
  await page.getByRole('button', { name: 'Enter my Powerhouse' }).click();
  await page.locator('#app-tabs [data-panel="attempts"]').click();
}

export async function coreRecord(page) {
  return page.evaluate(key => JSON.parse(window.TrinityRead.raw(localStorage, key)), coreKey);
}

export async function saveAttempt(page, { type = 'topic-question', question, date, earned, sourceId, novel = false }) {
  const dialog = page.locator('#attempt-dialog');
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
  const unaided = dialog.locator('#attempt-unaided');
  if (await unaided.count()) await unaided.check();
  if (novel) await dialog.locator('#attempt-novel').check();
  if (sourceId) await dialog.locator('#fs-source').selectOption(sourceId);
  await dialog.getByRole('button', { name: 'Save evidence + update repair queue' }).click();
  await expect(dialog).toBeHidden();
}
