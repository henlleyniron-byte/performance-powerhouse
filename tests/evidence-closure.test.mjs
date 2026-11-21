import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../evidence-closure-audit.html',import.meta.url),'utf8');
test('evidence auditor enforces the six-step ordered sequence',()=>{
 for(const step of ['marked','diagnosed','repaired','reattempt','transfer','retest']) assert.match(html,new RegExp("name=\""+step+"\""));
 assert.match(html,/validSequence=stages\.every/);
 assert.match(html,/complete=!firstMissing&&validSequence/);
});
test('evidence auditor is opt-in and browser-local',()=>{
 assert.doesNotMatch(html,/\blocalStorage\b|\bsessionStorage\b|\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
 assert.match(html,/application\/json/);
 assert.match(html,/aria-live="polite"/);
});
