import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("renders the V8 Evidence & Capacity Edition metadata and seven-stage cycle", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  assert.match(html, /<title>A\/L Performance Powerhouse · V8 Evidence & Capacity Edition<\/title>/i);
  assert.match(html, /Attempt → mark → diagnose → repair → reattempt → fresh transfer → delayed retest/i);
  assert.match(html, /<h1>Performance Powerhouse V8<\/h1>/);
  assert.match(html, /id="cycle-steps"/);
  assert.match(html, /id="cycle-subject"/);
  assert.match(html, /const CYCLE_STEPS = \[/);
  assert.match(html, /CYCLE_KEY = 'alpp_evidence_cycle_v1'/);
  assert.match(html, /cycle-action'\)\.disabled = evidenceCycle\.step > 0/);
  assert.match(html, /fresh-transfer/);
  assert.match(html, /delayed-retest/);
});

test("ships the current core, Community Share, PWA shell and Physics Intelligence", async () => {
  const host = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const legacyAlias = await readFile(new URL("../public/al-performance-command-centre.html", import.meta.url), "utf8");
  const community = await readFile(new URL("../public/community-share.html", import.meta.url), "utf8");
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  const serviceWorker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  const physicsModule = await readFile(new URL("../public/physics-intelligence/index.html", import.meta.url), "utf8");
  const moduleScript = await readFile(new URL("../public/physics-intelligence/app.js", import.meta.url), "utf8");
  const data = JSON.parse(await readFile(new URL("../public/physics-intelligence/assets/physics-intelligence-data.json", import.meta.url), "utf8"));

  assert.notEqual(legacyAlias, host);
  assert.match(host, /al_performance_powerhouse_v4/);
  assert.match(host, /al_performance_powerhouse_v3/);
  assert.match(host, /href="\.\/physics-intelligence\/"/i);
  assert.match(host, /serviceWorker\.register\('\.\/sw\.js'\)/);
  assert.match(community, /href="\.\/\?share=1"/i);
  assert.match(community, /href="\.\/physics-intelligence\/\?share=1"/i);
  assert.equal(manifest.start_url, "./");
  assert.match(serviceWorker, /powerhouse-v8-study-flow-candidate/);
  assert.match(serviceWorker, /community-share\.html/);
  assert.match(physicsModule, /Physics Intelligence \| Performance Powerhouse/i);
  assert.match(physicsModule, /href="\.\.\/index\.html"/i);
  assert.match(moduleScript, /al_performance_powerhouse_physics_intelligence_v1/);
  assert.equal(data.overview.questions, 1410);
  assert.equal(data.overview.currentEra.questions, 350);
  assert.equal(data.overview.currentEra.families, 173);
  assert.equal(data.currentFamilies.length, 173);
});

test("ships the native Study Tracker with isolated persistence and migration support", async () => {
  const host = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const tracker = await readFile(new URL("../public/study-tracker/index.html", import.meta.url), "utf8");
  const trackerScript = await readFile(new URL("../public/study-tracker/app.js", import.meta.url), "utf8");
  const serviceWorker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  const schema = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const api = await readFile(new URL("../app/api/study-tracker/route.ts", import.meta.url), "utf8");

  assert.match(host, /href="\.\/study-tracker\/"/i);
  assert.match(tracker, /Run the block\. Then prove what it produced\./i);
  assert.match(trackerScript, /al_performance_powerhouse_study_tracker_v1/);
  assert.match(trackerScript, /study-tracker-gamma-supabase-export/);
  assert.match(trackerScript, /durationSeconds:0/);
  assert.match(serviceWorker, /\.\/study-tracker\/app\.js/);
  assert.match(schema, /study_sessions/);
  assert.match(schema, /primaryKey\(\{ columns: \[table\.userId, table\.id\] \}\)/);
  assert.match(api, /where\(eq\(studySessions\.userId, identity\.userId\)\)/);
  assert.match(api, /target: \[studySessions\.userId, studySessions\.id\]/);
});
