import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const snapshot = new URL('../hosted-source/', import.meta.url);
const tests = readdirSync(new URL('tests/', snapshot))
  .filter(name => /\.test\.[cm]js$/.test(name))
  .sort()
  .map(name => `tests/${name}`);

const run = spawnSync(process.execPath, ['--test', ...tests], {
  cwd: snapshot,
  env: { ...process.env, DOM_QA_PACKAGE: fileURLToPath(import.meta.resolve('linkedom')) },
  stdio: 'inherit',
});
if (run.error) throw run.error;
process.exitCode = run.status ?? 1;
