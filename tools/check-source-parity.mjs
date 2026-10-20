import { createHash } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const safePath = value => typeof value === 'string' && value.length > 0 &&
  !value.includes('\\') && !value.includes('\0') &&
  !value.split('/').some(part => part === '..' || part === '.' || part === '') &&
  !isAbsolute(value) && !/^[A-Za-z]:/.test(value);

export function validateManifest(manifest) {
  if (manifest?.schemaVersion !== 1 || manifest?.algorithm !== 'git-blob-sha1' ||
      !Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error('Invalid source manifest header');
  }
  const paths = new Set();
  for (const file of manifest.files) {
    if (!safePath(file.path) || !/^[a-f0-9]{40}$/.test(file.sha || '') || paths.has(file.path)) {
      throw new Error('Invalid or duplicate source manifest entry');
    }
    paths.add(file.path);
  }
  return manifest;
}

export async function compareSource(root, manifest) {
  validateManifest(manifest);
  const base = await realpath(root);
  const files = [];
  for (const file of manifest.files) {
    const target = resolve(base, file.path);
    try {
      const actual = await realpath(target);
      const local = relative(base, actual);
      if (local === '..' || local.startsWith(`..${sep}`) || isAbsolute(local)) {
        throw new Error('Source path escapes the selected root');
      }
      if (!(await stat(actual)).isFile()) throw new Error('Source entry is not a regular file');
      const bytes = await readFile(actual);
      const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      files.push({ path: file.path, status: sha === file.sha ? 'match' : 'changed' });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      files.push({ path: file.path, status: 'missing' });
    }
  }
  const count = status => files.filter(file => file.status === status).length;
  return { matches: count('match'), changed: count('changed'), missing: count('missing'),
    total: files.length, files };
}

export async function main(args) {
  if (args.length !== 2) throw new Error('Usage: node tools/check-source-parity.mjs MANIFEST ROOT');
  const manifest = JSON.parse(await readFile(args[0], 'utf8'));
  const result = await compareSource(args[1], manifest);
  console.log(JSON.stringify(result, null, 2));
  return result.changed || result.missing ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(code => { process.exitCode = code; }).catch(error => {
    console.error(error.message);
    process.exitCode = 2;
  });
}
