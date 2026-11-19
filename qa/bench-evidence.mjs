import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const moduleUrl = process.argv[2]
  ? pathToFileURL(resolve(process.argv[2]))
  : new URL('../hosted-source/public/evidence-rules.js', import.meta.url);
await import(moduleUrl);
const rules = globalThis.PowerhouseEvidence;
const topicKey = 'physics|0|0';
const attempts = Array.from({ length: 5000 }, (_, number) => ({
  id: 'original-' + number, date: '2026-01-01', subject: 'physics', topicKey,
  type: 'topic-question', question: 'Original ' + number, earned: 1, total: 5,
}));
const retests = attempts.flatMap(attempt => [1, 2].map(stage => ({
  id: attempt.id + '-' + stage, sourceAttemptId: attempt.id, topicKey, stage,
  due: stage === 1 ? '2026-01-04' : '2026-01-08',
})));
const transfer = {
  id: 'new-transfer', question: 'Fresh question', topicKey, type: 'fresh-transfer',
  sourceAttemptId: attempts.at(-1).id, date: '2026-01-07',
  earned: 5, total: 5, unaided: true, novelQuestion: true,
};
const backup = { ratings: {}, attempts, retests };

function measure(label, run) {
  run();
  const times = Array.from({ length: 7 }, () => {
    const start = performance.now();
    run();
    return performance.now() - start;
  }).sort((a, b) => a - b);
  console.log(label + ': ' + times[3].toFixed(2) + ' ms median (' +
    times[0].toFixed(2) + '–' + times[6].toFixed(2) + ' ms range)');
}

console.log(process.version + ' · 5,000 fictional attempts · 10,000 retests · 7 measured runs');
measure('Select linked transfer', () => {
  assert.equal(rules.eligibleRetest(transfer, retests, attempts), retests.at(-2));
});
measure('Validate backup', () => {
  assert.equal(rules.validateBackup(backup, [topicKey], ['physics'], ['topic-question'], [], '2026-01-20'), backup);
});
