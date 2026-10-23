import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../public/powerhouse/verification-ui.js", import.meta.url), "utf8");

test("unreadable verification bytes are exported unchanged and block ordinary saves", () => {
  assert.match(source, /if\(unreadableRaw!==null\).*Save blocked/);
  assert.match(source, /damaged\?unreadableRaw:JSON\.stringify/);
  assert.match(source, /unreadable-recovery\.json/);
  assert.match(source, /records=clean;unreadableRaw=null;hydrated=true/);
});
