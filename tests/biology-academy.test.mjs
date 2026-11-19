import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const hosted = new URL('hosted-source/public/', root);
const read = (dir, file) => readFile(new URL(file, dir), 'utf8');

test('both Powerhouse entry points lead to a real Academy and hosted-only links resolve', async () => {
  for (const [dir, showIntelligence] of [[root, false], [hosted, true]]) {
    const dashboard = await read(dir, 'index.html');
    assert.match(dashboard, /href="\.\/biology-academy\/" data-academy-link>Biology Academy<\/a>/);
    assert.match(dashboard, /subject === 'biology'[^\n]+Practise in Biology Academy/);
    assert.match(dashboard, /link\.href = shareSafeMode \? '\.\/biology-academy\/\?share=1'/);
    const page = await read(dir, 'biology-academy/index.html');
    assert.equal(page.includes('../biology-intelligence/'), showIntelligence);
    if (showIntelligence) assert.match(await read(dir, 'workspace-shell/shell.js'), /\['Biology Academy','\/biology-academy\//);
    for (const file of ['academy.js', 'content.js', 'academy.css']) {
      assert.match(page, new RegExp('\\./' + file.replace('.', '\\.')));
      assert.ok((await read(dir, 'biology-academy/' + file)).length > 0);
    }
  }
});

test('the two builds serve the same learning engine, lesson content, and styles', async () => {
  for (const file of ['academy.js', 'content.js', 'academy.css']) {
    assert.equal(await read(root, 'biology-academy/' + file), await read(hosted, 'biology-academy/' + file));
  }
});

test('every published NIE unit has a track with complete practice and feedback', async () => {
  const context = vm.createContext({});
  vm.runInContext(await read(root, 'biology-academy/content.js'), context);
  const { units, modules } = context.PowerhouseBiologyAcademy;
  const unitIds = Array.from(units, ({ id }) => id);
  assert.deepEqual(unitIds, Array.from({ length: 10 }, (_, ix) => String(ix + 1).padStart(2, '0')));
  assert.equal(modules.length, 10);
  assert.equal(new Set(Array.from(modules, ({ id }) => id)).size, modules.length);
  assert.deepEqual([...new Set(Array.from(modules).flatMap(({ units }) => Array.from(units)))].sort(), unitIds);
  for (const module of modules) {
    assert.match(module.id, /^[a-z][a-z0-9-]+$/);
    assert.ok(module.objective && module.concepts.length >= 2);
    assert.ok(module.scenario.prompt && module.scenario.prediction && module.scenario.explanation);
    assert.equal(module.scenario.options.length, 3);
    assert.ok(module.scenario.options.every(({ label, observation }) => label && observation));
    assert.equal(module.mcq.options.length, 5);
    assert.equal(new Set(module.mcq.options).size, 5);
    assert.equal(module.mcq.explanations.length, 5);
    assert.ok(Number.isInteger(module.mcq.answer) && module.mcq.options[module.mcq.answer]);
    assert.ok(module.structured.prompt && module.structured.points.length >= 3);
    assert.ok(module.transfer.prompt && module.transfer.answer);
  }
});
