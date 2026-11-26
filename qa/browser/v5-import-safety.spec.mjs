import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const pageURL = 'http://127.0.0.1:4175/index.html';
const appKey = 'al_performance_powerhouse_v5';
const trackerKey = 'al_performance_powerhouse_study_tracker_v1';
const physicsKey = 'al_performance_powerhouse_physics_intelligence_v1';
const initial = {
  [appKey]: JSON.stringify({ profileSetupComplete: true, attempts: [], retests: [], ratings: {} }),
  [trackerKey]: JSON.stringify({ sessions: [{ id: 'keep-tracker' }] }),
  [physicsKey]: JSON.stringify({ attempts: [{ familyId: 'keep-physics' }] }),
};

async function seed(page) {
  await page.addInitScript(values => {
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
  }, initial);
}

async function importJson(page, name, value) {
  await page.locator('#import-file').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(value)),
  });
}

test('an invalid unified core cannot partially replace secondary browser stores', async ({ page }) => {
  await seed(page);
  await page.goto(pageURL);
  const keys = [appKey, trackerKey, physicsKey];
  const before = await page.evaluate(keysToRead => Object.fromEntries(keysToRead.map(key => [key, localStorage.getItem(key)])), keys);
  await importJson(page, 'invalid-unified-backup.json', {
    product: 'A/L Performance Powerhouse',
    core: {
      attempts: [{ id: 'bad-score', date: '2026-11-26', subject: 'biology', topicKey: 'biology|0|0', question: 'Invalid score', earned: '<img src=x onerror="window.__xss=1">', total: 5 }],
      ratings: {},
    },
    study_tracker: { sessions: [{ id: 'must-not-replace' }] },
    physics_intelligence: { attempts: [{ familyId: 'must-not-replace' }] },
  });
  await expect(page.locator('#toast')).toContainText('That JSON could not be safely mapped into Powerhouse.');
  const after = await page.evaluate(keysToRead => Object.fromEntries(keysToRead.map(key => [key, localStorage.getItem(key)])), keys);
  expect(after).toEqual(before);
});

test('imported V5 records render as text and cannot inject markup or event attributes', async ({ page }) => {
  await seed(page);
  await page.goto(pageURL);
  const payload = {
    product: 'A/L Performance Powerhouse',
    core: {
      version: 12,
      profileSetupComplete: true,
      ratings: {},
      attempts: [{
        id: 'attempt-1" onmouseover="window.__xss=1',
        date: '2026-11-26',
        createdAt: '2026-11-26T00:00:00.000Z',
        type: 'paper-section',
        subject: '<img src=x onerror="window.__xss=1">',
        topicKey: 'biology|0|0',
        question: '<svg onload="window.__xss=1">Source</svg>',
        earned: 2,
        total: 5,
        trustedEarned: null,
        confidence: 'high',
        guesses: 1,
        error: 'K"><img src=x onerror="window.__xss=1">',
      }],
      dailyEntries: [{ id: 'daily-1" onmouseover="window.__xss=1', date: '2026-11-26', note: '<img src=x onerror="window.__xss=1">', physics: { mcqs: 1 }, chemistry: {}, biology: {} }],
      retests: [
        { id: 'retest-1" onmouseover="window.__xss=1', topicKey: 'biology|0|0', due: '2000-01-01', stage: 1, attempts: [] },
        { id: 'retest-2', topicKey: 'biology|0|0" onmouseover="window.__xss=1', due: '2000-01-01', stage: 1, attempts: [] },
        { id: 'retest-ics\r\nSUMMARY:Injected', topicKey: 'biology|0|0', due: new Date(Date.now() + 86400000).toISOString().slice(0, 10), stage: 1, attempts: [] },
        { id: 'retest-date-injection', topicKey: 'biology|0|0', due: `${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}\r\nSUMMARY:Injected`, stage: 1, attempts: [] },
      ],
    },
    study_tracker: { sessions: [] },
    physics_intelligence: { attempts: [] },
  };
  await importJson(page, 'fictional-hostile-records.json', payload);
  await expect(page.locator('#toast')).toContainText('Powerhouse backup imported successfully.');
  await expect(page.locator('#attempt-table-body tr')).toHaveCount(1);
  await expect(page.locator('#v5-chain-list .chain-card')).toHaveCount(1);
  await expect(page.getByText('NaN%', { exact: true })).toHaveCount(0);

  const markupCount = await page.locator(
    '#attempt-table-body img, #attempt-table-body svg, #recent-attempts img, #calibration-risk img, #retest-queue img, #v5-chain-list img, #v5-papers-root img, #v5-retests-root img, #daily-history-body img'
  ).count();
  expect(markupCount).toBe(0);
  const eventAttributeCount = await page.locator(
    '#attempt-table-body [onmouseover], #attempt-table-body [onerror], #calibration-risk [onmouseover], #retest-queue [onmouseover], #v5-chain-list [onmouseover], #v5-retests-root [onmouseover], #daily-history-body [onmouseover]'
  ).count();
  expect(eventAttributeCount).toBe(0);
  const executableMarkupCount = await page.locator('body img[src="x"], body [onerror], body [onload], body [onmouseover]').count();
  expect(executableMarkupCount).toBe(0);
  expect(await page.evaluate(() => Boolean(window.__xss))).toBe(false);
  const secondary = await page.evaluate(keysToRead => Object.fromEntries(keysToRead.map(key => [key, localStorage.getItem(key)])), [trackerKey, physicsKey]);
  expect(JSON.parse(secondary[trackerKey])).toEqual({ sessions: [] });
  expect(JSON.parse(secondary[physicsKey])).toEqual({ attempts: [] });

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#v5-export-ics').evaluate(button => button.click());
  const download = await downloadPromise;
  const icsPath = await download.path();
  expect(icsPath).not.toBeNull();
  const calendar = await readFile(icsPath, 'utf8');
  expect(calendar.split(/\r?\n/).filter(line => line.startsWith('UID:'))).toHaveLength(1);
  expect(calendar).not.toMatch(/\r?\nSUMMARY:Injected(?:\r?\n|$)/);
});
