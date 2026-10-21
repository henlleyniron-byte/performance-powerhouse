import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("renders the V4 Community Edition metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>A\/L Performance Powerhouse · V4 Community Edition<\/title>/i);
  assert.match(html, /Attempt → Mark → Diagnose → Repair → Transfer → Retest/i);
});

test("ships the V4 core, Community Share, PWA shell and Physics Intelligence", async () => {
  const host = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const legacyAlias = await readFile(new URL("../public/al-performance-command-centre.html", import.meta.url), "utf8");
  const community = await readFile(new URL("../public/community-share.html", import.meta.url), "utf8");
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  const serviceWorker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  const module = await readFile(new URL("../public/physics-intelligence/index.html", import.meta.url), "utf8");
  const moduleScript = await readFile(new URL("../public/physics-intelligence/app.js", import.meta.url), "utf8");
  const data = JSON.parse(await readFile(new URL("../public/physics-intelligence/assets/physics-intelligence-data.json", import.meta.url), "utf8"));

  assert.equal(legacyAlias, host);
  assert.match(host, /al_performance_powerhouse_v4/);
  assert.match(host, /al_performance_powerhouse_v3/);
  assert.match(host, /href="\.\/physics-intelligence\/"/i);
  assert.match(host, /serviceWorker\.register\('\.\/sw\.js'\)/);
  assert.match(community, /href="\.\/\?share=1"/i);
  assert.match(community, /href="\.\/physics-intelligence\/\?share=1"/i);
  assert.equal(manifest.start_url, "./");
  assert.match(serviceWorker, /powerhouse-v4-community-2/);
  assert.match(serviceWorker, /community-share\.html/);
  assert.match(module, /Physics Intelligence \| Performance Powerhouse/i);
  assert.match(module, /href="\.\.\/index\.html"/i);
  assert.match(moduleScript, /al_performance_powerhouse_physics_intelligence_v1/);
  assert.equal(data.overview.questions, 1410);
  assert.equal(data.overview.currentEra.questions, 350);
  assert.equal(data.overview.currentEra.families, 173);
  assert.equal(data.currentFamilies.length, 173);
});
