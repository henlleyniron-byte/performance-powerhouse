import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
test('evidence audit enforces ordered proof gates and avoids shared storage', () => {
  const html = read('evidence-closure-audit.html');
  for (const stage of ['marked','diagnosed','repaired','reattempt','transfer','retest']) {
    assert.match(html, new RegExp('name="' + stage + '"'));
  }
  assert.match(html, /validSequence/);
  assert.match(html, /application\/json/);
  assert.doesNotMatch(html, /localStorage|sessionStorage|fetch\(|XMLHttpRequest/);
});
test('paper sprint records marks, privacy boundaries and exports backups', () => {
  const html = read('daily-paper-sprint.html');
  for(const field of ['subject','set','earned','available','error','repair','retest']) {
    assert.match(html, new RegExp('id="' + field + '"'));
  }
  assert.match(html, /earned>available/);
  assert.match(html, /pp-paper-sprints-v1/);
  assert.match(html, /application\/json/);
  assert.doesNotMatch(html, /fetch\(|XMLHttpRequest/);
});
