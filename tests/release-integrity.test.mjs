import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
const physics = JSON.parse(await readFile(
  new URL('../physics-intelligence/assets/physics-intelligence-data.json', import.meta.url), 'utf8'
));

const assetListSource = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
assert.ok(assetListSource, 'service worker must declare an ASSETS allowlist');
const assets = [...assetListSource[1].matchAll(/'(\.\/[^']*)'/g)].map(match => match[1]);

async function assertLocalAsset(path) {
  assert.match(path, /^\.\/[a-zA-Z0-9_./-]*$/, 'only clean relative app assets are allowed');
  assert.ok(!path.includes('..'), 'asset cannot traverse directories');
  const localPath = resolve(root, path.slice(2));
  assert.ok(localPath.startsWith(root), 'asset must remain inside repo');
  await stat(localPath);
}

test('service-worker pre-cache entries exist and use local paths', async () => {
  assert.ok(assets.length >= 10, 'expected a meaningful offline asset list');
  assert.equal(new Set(assets).size, assets.length, 'duplicate precache entries');
  await Promise.all(assets.map(assertLocalAsset));
});

test('PWA manifest stays locally installable with available icon files', async () => {
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  await Promise.all(manifest.icons.map(icon => assertLocalAsset(icon.src)));
});

test('Physics aggregate overview totals and historical boundaries are internally consistent', () => {
  const overview = physics.overview;
  assert.equal(overview.startYear, 2000);
  assert.equal(overview.endYear, 2025);
  assert.equal(overview.examinationYears, overview.endYear - overview.startYear + 1);
  assert.equal(overview.questions,
    overview.oldFormat.papers * overview.oldFormat.questionsPerPaper +
      overview.currentFormatBoundary.papers * overview.currentFormatBoundary.questionsPerPaper);
  assert.equal(overview.currentEra.questions, 7 * 50);
  assert.equal(physics.release.predictiveInterpretation, 'prohibited');
});
