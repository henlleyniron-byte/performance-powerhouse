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
