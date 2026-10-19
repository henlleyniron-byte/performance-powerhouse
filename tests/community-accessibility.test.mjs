import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../community-share.html', import.meta.url), 'utf8');

test('community entry provides a keyboard-visible skip-to-main link', () => {
  assert.match(html, /<a class="skip-link" href="#main-content">Skip to main content<\/a>/);
  assert.match(html, /<main[^>]*id="main-content"[^>]*tabindex="-1">/);
  assert.match(html, /\.skip-link:focus-visible\s*\{/);
});

test('main navigation links expose visible keyboard focus and reduced-motion support', () => {
  assert.match(html, /\.btn:focus-visible\s*\{/);
  assert.match(html, /prefers-reduced-motion:\s*reduce/);
});
