import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"));

function versionTuple(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  assert.ok(match, `Expected a pinned stable version, received ${version}`);
  return match.slice(1).map(Number);
}

function assertAtLeast(actual, minimum) {
  const a = versionTuple(actual);
  const b = versionTuple(minimum);
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      assert.ok(a[index] > b[index], `${actual} must be at least ${minimum}`);
      return;
    }
  }
}

function satisfiesCaret(actual, range) {
  const actualVersion = versionTuple(actual);
  const match = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
  assert.ok(match, `Expected a simple caret peer range, received ${range}`);
  const minimum = match.slice(1).map(Number);
  return actualVersion[0] === minimum[0]
    && (minimum[0] > 0
      ? actualVersion[1] >= minimum[1]
      : actualVersion[1] === minimum[1] && actualVersion[2] >= minimum[2]);
}

test("pins security-fixed React Server Components and compatible React packages", () => {
  const rsc = manifest.devDependencies["react-server-dom-webpack"];
  assertAtLeast(rsc, "19.2.9");
  assert.equal(manifest.dependencies.react, manifest.dependencies["react-dom"]);
  assert.equal(manifest.dependencies.react, rsc);
  const vinext = lock.packages["node_modules/vinext"];
  assertAtLeast(vinext.version, "1.4.7");
  const vinextPeers = vinext.peerDependencies;
  for (const peer of ["react", "react-dom", "react-server-dom-webpack"]) {
    assert.ok(
      satisfiesCaret(manifest.dependencies[peer] ?? manifest.devDependencies[peer], vinextPeers[peer]),
      `${peer} must satisfy Vinext's declared ${vinextPeers[peer]} peer range`,
    );
  }
  assertAtLeast(manifest.devDependencies["@vitejs/plugin-rsc"], "0.5.37");
  assert.ok(satisfiesCaret(manifest.devDependencies["@vitejs/plugin-rsc"], vinextPeers["@vitejs/plugin-rsc"]));
  assertAtLeast(manifest.devDependencies.vite, "8.4.0");
  assert.ok(satisfiesCaret(manifest.devDependencies.vite, vinextPeers.vite));
  const rscPeers = lock.packages["node_modules/react-server-dom-webpack"].peerDependencies;
  assert.ok(satisfiesCaret(manifest.dependencies.react, rscPeers.react));
  assert.ok(satisfiesCaret(manifest.dependencies["react-dom"], rscPeers["react-dom"]));
});

test("keeps Next.js and its lint config aligned to a security-fixed release", () => {
  assertAtLeast(manifest.dependencies.next, "16.4.5");
  assert.equal(manifest.devDependencies["eslint-config-next"], manifest.dependencies.next);
});

test("overrides the pinned vulnerable fflate transitive dependency with its patched patch release", () => {
  assert.equal(manifest.overrides.fflate, "0.7.5");
  assert.equal(lock.packages["node_modules/fflate"].version, manifest.overrides.fflate);
});

test("lockfile resolves each declared security-sensitive package exactly", () => {
  const packages = [
    ["next", manifest.dependencies.next],
    ["react", manifest.dependencies.react],
    ["react-dom", manifest.dependencies["react-dom"]],
    ["@cloudflare/vite-plugin", manifest.devDependencies["@cloudflare/vite-plugin"]],
    ["@vitejs/plugin-rsc", manifest.devDependencies["@vitejs/plugin-rsc"]],
    ["eslint-config-next", manifest.devDependencies["eslint-config-next"]],
    ["react-server-dom-webpack", manifest.devDependencies["react-server-dom-webpack"]],
    ["fflate", manifest.overrides.fflate],
    ["vinext", manifest.devDependencies.vinext],
    ["vite", manifest.devDependencies.vite],
    ["wrangler", manifest.devDependencies.wrangler],
  ];

  for (const [name, expectedVersion] of packages) {
    const locked = lock.packages[`node_modules/${name}`];
    assert.ok(locked, `${name} must have a lockfile entry`);
    assert.equal(locked.version, expectedVersion, `${name} lockfile version must match package.json`);
    assert.ok(locked.resolved, `${name} must have a resolved tarball`);
    assert.ok(locked.integrity, `${name} must have an integrity hash`);
  }
});
