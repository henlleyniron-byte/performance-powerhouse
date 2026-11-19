import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
for (const theme of ['dark', 'light']) {
  test(`Community Share passes automated WCAG A/AA checks in ${theme} mode`, async ({ page }) => {
    await page.addInitScript(mode => localStorage.setItem('study_ui_theme_v1', mode), theme);
    await page.goto('/community-share.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      return result.violations.map(rule => ({ rule: rule.id, elements: rule.nodes.map(node => node.target) }));
    });
    expect(violations).toEqual([]);
  });
}
