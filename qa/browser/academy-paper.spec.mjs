import { expect, test } from '@playwright/test';

test('printing a track separates unanswered questions, marking guidance and private screen inputs', async ({ page }, testInfo) => {
  await page.goto(new URL('../../demo/biology-academy.html#inheritance', import.meta.url).href);
  const lesson = page.locator('#lesson');
  const paper = page.locator('.academy-paper');
  const track = await page.evaluate(() => window.PowerhouseBiologyAcademy.modules.find(item => item.id === 'inheritance'));
  const privateAnswer = 'Fictional draft for display only.';
  await lesson.locator('textarea').first().fill(privateAnswer);
  await lesson.getByText('Compare with the marking points', { exact: true }).click();
  await expect(lesson.getByText(track.structured.points[0], { exact: true })).toBeVisible();

  // Inspect the same content sent to the native print dialog, without opening it.
  await page.evaluate(() => {
    window.print = () => { window.printRequested = true; };
  });
  const print = page.getByRole('button', { name: 'Print current track' });
  await print.click();
  expect(await page.evaluate(() => window.printRequested)).toBe(true);
  await expect(paper).toBeHidden();
  await page.emulateMedia({ media: 'print' });
  await expect(lesson).toBeHidden();
  await expect(paper).toBeVisible();
  await expect(paper.getByRole('heading', { name: track.title })).toBeVisible();
  await expect(paper).toContainText(track.mcq.prompt);
  await expect(paper).toContainText(track.structured.prompt);
  await expect(paper).toContainText(track.transfer.prompt);
  await expect(paper).not.toContainText(track.structured.points[0]);
  await expect(paper).not.toContainText('Correct answer:');
  await expect(paper).not.toContainText(privateAnswer);
  await expect(paper.locator('textarea,input')).toHaveCount(0);
  if (testInfo.project.name === 'desktop-chromium') {
    await page.pdf({ path: testInfo.outputPath('biology-questions.pdf'), format: 'A4', displayHeaderFooter: false });
  }
  await page.emulateMedia({ media: 'screen' });
  await page.getByLabel('Paper copy').selectOption('answers');
  // Ctrl+P and the browser menu use beforeprint, independent of the page button.
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await page.emulateMedia({ media: 'print' });
  await expect(paper).toContainText(track.structured.points[0]);
  await expect(paper).toContainText(track.mcq.explanations[track.mcq.answer]);
  await expect(paper).toContainText(track.transfer.answer);
  await expect(paper).not.toContainText(privateAnswer);
  if (testInfo.project.name === 'desktop-chromium') {
    await page.pdf({ path: testInfo.outputPath('biology-marking-guide.pdf'), format: 'A4', displayHeaderFooter: false });
  }
  await page.emulateMedia({ media: 'screen' });
  await expect(lesson.locator('textarea').first()).toHaveValue(privateAnswer);
  await expect(paper).toBeHidden();
});

for (const layout of ['offline file', 'hosted preview']) {
  test(`all ten Biology worksheets keep the required labels and separate feedback in the ${layout}`, async ({ page }) => {
    const url = layout === 'offline file'
      ? new URL('../../demo/biology-academy.html', import.meta.url).href
      : '/biology-academy/';
    await page.goto(url);
    const paper = page.locator('.academy-paper');
    const catalogue = await page.evaluate(() => window.PowerhouseBiologyAcademy.modules);
    await expect(page.locator('#tracks a')).toHaveCount(10);
    await page.evaluate(() => { window.print = () => {}; });

    for (const track of catalogue) {
      await page.locator('#tracks').getByRole('link', { name: track.title, exact: true }).click();
      await page.getByLabel('Paper copy').selectOption('questions');
      await page.getByRole('button', { name: 'Print current track' }).click();
      await page.emulateMedia({ media: 'print' });
      await expect(paper.getByRole('heading', { name: track.title })).toBeVisible();
      for (const { label } of track.scenario.options) await expect(paper).toContainText(label);
      await expect(paper).toContainText(track.scenario.prediction);
      await expect(paper).not.toContainText(track.scenario.explanation);
      await expect(paper).not.toContainText(track.transfer.answer);
      await expect(paper).not.toContainText('Correct answer:');
      if (track.id === 'energy-metabolism') {
        await expect(paper).toContainText('Increase light alone — Relative uptake remains at 4 units.');
        await expect(paper).toContainText('Increase carbon dioxide alone — Relative uptake rises from 4 to 6 units.');
      } else {
        for (const { observation } of track.scenario.options) await expect(paper).not.toContainText(observation);
      }
      if (track.id === 'molecular-biology') {
        await expect(paper).not.toContainText('A teaching diagram shows three arrows');
      }

      await page.emulateMedia({ media: 'screen' });
      await page.getByLabel('Paper copy').selectOption('answers');
      await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
      await page.emulateMedia({ media: 'print' });
      await expect(paper).toContainText(track.scenario.explanation);
      await expect(paper).toContainText(track.transfer.answer);
      await expect(paper).toContainText('Correct answer:');
      await page.emulateMedia({ media: 'screen' });
    }
  });
}
