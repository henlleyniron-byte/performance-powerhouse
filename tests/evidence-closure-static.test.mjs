import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../evidence-closure-audit.html", import.meta.url), "utf8");

test("closure auditor includes all ordered gates", () => {
  for (const step of ["Original attempt completed independently", "Specific lost marks", "Narrow repair completed", "Closed-book reattempt passed", "Unseen transfer question passed", "Delayed retest passed"]) {
    assert.ok(html.includes(step), `Missing evidence gate: ${step}`);
  }
  assert.match(html, /validSequence=stages\.every/);
  assert.match(html, /status:!validSequence\?'INCONSISTENT':complete\?'CLOSED':'OPEN'/);
});

test("audit stays local, user initiated and safely renders notes", () => {
  assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage)\b/);
  assert.doesNotMatch(html, /\.innerHTML\s*=/);
  assert.match(html, /textContent/);
  assert.match(html, /JSON\.stringify\(record,null,2\)/);
});
