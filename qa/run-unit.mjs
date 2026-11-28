import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const snapshot = fileURLToPath(new URL('../hosted-source/', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../docs/V22_SOURCE_MANIFEST.json', import.meta.url)));

const changes = JSON.parse(readFileSync(new URL('../docs/V22_WORKING_CHANGES.json', import.meta.url)));
const paths = new Set([...manifest.files, ...changes.files].map(item => item.path));

// The public tests now use explicit synthetic source hosts, so they need no
// private-link reconstruction or sanitizer-dependent rewriting.
const worktree = mkdtempSync(join(tmpdir(), 'powerhouse-v22-unit-'));
try {
  for (const path of paths) {
    const source = join(snapshot, path);
    const target = join(worktree, path);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
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
