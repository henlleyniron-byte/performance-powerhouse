import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const snapshot = fileURLToPath(new URL('../hosted-source/', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../docs/V22_SOURCE_MANIFEST.json', import.meta.url)));

// The export redacted two positive URL fixtures. Exercise the original assertions
// with an invented URL on a supported host. The tests only parse this string.
const publicFixtures = new Map([
  ['tests/science-intelligence.test.mjs', 'https://example.invalid/private-resource/a45c461fd1878379'],
  ['tests/study-library.test.mjs', 'https://example.invalid/private-resource/a41be9fcc7a6607d'],
]);
const sampleUrl = 'https://docs.google.com/document/d/fictional-powerhouse-test/edit';
const worktree = mkdtempSync(join(tmpdir(), 'powerhouse-v22-unit-'));
try {
  for (const { path } of manifest.files) {
    const source = join(snapshot, path);
    const target = join(worktree, path);
    mkdirSync(dirname(target), { recursive: true });
    if (publicFixtures.has(path)) {
      const archived = readFileSync(source, 'utf8');
      const placeholder = publicFixtures.get(path);
      if (!archived.includes(placeholder)) throw Error(`Review the public test fixture in ${path}`);
      writeFileSync(target, archived.replaceAll(placeholder, sampleUrl));
    } else {
      copyFileSync(source, target);
    }
  }
  const tests = readdirSync(join(worktree, 'tests'))
    .filter(name => /\.test\.[cm]js$/.test(name))
    .sort()
    .map(name => `tests/${name}`);
  const run = spawnSync(process.execPath, ['--test', ...tests], {
    cwd: worktree,
    env: { ...process.env, DOM_QA_PACKAGE: fileURLToPath(import.meta.resolve('linkedom')) },
    stdio: 'inherit',
  });
  if (run.error) throw run.error;
  process.exitCode = run.status ?? 1;
} finally {
  rmSync(worktree, { recursive: true, force: true });
}
