import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
for (const theme of ['dark', 'light']) {
  test(`Community Share passes automated WCAG A/AA checks in ${theme} mode`, async ({ page }) => {
    await page.addInitScript(mode => localStorage.setItem('study_ui_theme_v1', mode), theme);
    await page.goto('/community-share.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    // Let the selected palette, text and page geometry reach the screen before
    // axe samples contrast. WebKit can report the attribute before painting.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const audit = () => page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map(rule => ({
        rule: rule.id,
        elements: rule.nodes.map(node => ({ target: node.target, reason: node.failureSummary })),
      }));
    });
    await expect.poll(audit, { timeout: 10_000, intervals: [250, 750] }).toEqual([]);
  });
}
