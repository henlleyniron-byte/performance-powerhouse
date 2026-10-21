import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("renders the 2027 Powerhouse metadata", async () => {
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
  assert.match(html, /<title>A\/L Performance Powerhouse · 2027 Reset<\/title>/i);
  assert.match(html, /2027 Reset · Evidence → Repair → Retest/i);
});

test("ships the validated Physics Intelligence module and host navigation", async () => {
  const host = await readFile(new URL("../public/al-performance-command-centre.html", import.meta.url), "utf8");
  const module = await readFile(new URL("../public/physics-intelligence/index.html", import.meta.url), "utf8");
  const data = JSON.parse(await readFile(new URL("../public/physics-intelligence/assets/physics-intelligence-data.json", import.meta.url), "utf8"));

  assert.match(host, /href="\/physics-intelligence\/"/i);
  assert.match(module, /Physics Intelligence \| Performance Powerhouse/i);
  assert.match(module, /href="\/" class="nav-home"/i);
  assert.equal(data.overview.questions, 1410);
  assert.equal(data.overview.currentEra.questions, 350);
  assert.equal(data.overview.currentEra.families, 173);
  assert.equal(data.currentFamilies.length, 173);
});
