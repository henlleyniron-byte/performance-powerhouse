import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { compareSource, validateManifest } from '../tools/check-source-parity.mjs';

const sha = bytes => createHash('sha1').update(`blob ${Buffer.byteLength(bytes)}\0`).update(bytes).digest('hex');
const manifest = files => ({ schemaVersion: 1, algorithm: 'git-blob-sha1', files });
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'powerhouse-parity-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('compares exact binary bytes and lists changed and missing files without writing', async t => {
  const root = await fixture(t), bytes = Buffer.from([0, 255, 13, 10]);
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'assets/a.bin'), bytes);
  await writeFile(join(root, 'changed.txt'), 'actual');
  const result = await compareSource(root, manifest([
    { path: 'assets/a.bin', sha: sha(bytes) },
    { path: 'changed.txt', sha: sha('expected') },
    { path: 'absent.txt', sha: sha('missing') }
  ]));
  assert.deepEqual([result.matches, result.changed, result.missing, result.total], [1, 1, 1, 3]);
  assert.deepEqual(await readFile(join(root, 'assets/a.bin')), bytes);
  assert.equal(await readFile(join(root, 'changed.txt'), 'utf8'), 'actual');
});

test('rejects traversal, absolute paths, duplicate entries and invalid hashes', () => {
  for (const path of ['../secret', '/secret', 'a/../secret', 'a//b', 'a\\b', 'C:/secret', './a']) {
    assert.throws(() => validateManifest(manifest([{ path, sha: sha('x') }])));
  }
  assert.throws(() => validateManifest(manifest([{ path: 'x', sha: 'invalid' }])));
  const item = { path: 'same', sha: sha('x') };
  assert.throws(() => validateManifest(manifest([item, item])));
});

test('rejects unknown versions, algorithms and empty inventories', () => {
  assert.throws(() => validateManifest(manifest([])));
  assert.throws(() => validateManifest({ ...manifest([{ path: 'a', sha: sha('a') }]), schemaVersion: 2 }));
  assert.throws(() => validateManifest({ ...manifest([{ path: 'a', sha: sha('a') }]), algorithm: 'sha256' }));
});

test('refuses a symlink to a file outside the selected root', async t => {
  const root = await fixture(t);
  await mkdir(join(root, 'selected'));
  await writeFile(join(root, 'outside'), 'private fictional bytes');
  await symlink(join(root, 'outside'), join(root, 'selected', 'link'));
  await assert.rejects(compareSource(join(root, 'selected'), manifest([{ path: 'link', sha: sha('x') }])), /escapes/);
});

test('CLI returns 0 for parity, 1 for differences and 2 for invalid input', async t => {
  const root = await fixture(t), file = join(root, 'manifest.json');
  const cli = fileURLToPath(new URL('../tools/check-source-parity.mjs', import.meta.url));
  await writeFile(join(root, 'a'), 'ok');
  await writeFile(file, JSON.stringify(manifest([{ path: 'a', sha: sha('ok') }])));
  assert.equal(spawnSync(process.execPath, [cli, file, root]).status, 0);
  await writeFile(join(root, 'a'), 'changed');
  assert.equal(spawnSync(process.execPath, [cli, file, root]).status, 1);
  await writeFile(file, '{}');
  assert.equal(spawnSync(process.execPath, [cli, file, root]).status, 2);
});
