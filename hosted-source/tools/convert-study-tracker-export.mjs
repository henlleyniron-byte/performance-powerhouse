#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

const [inputPath, outputPath = "study-tracker-migrated.json"] = process.argv.slice(2);
if (!inputPath) {
  console.error("Usage: node tools/convert-study-tracker-export.mjs <supabase-export.json> [output.json]");
  process.exit(1);
}

const raw = await readFile(inputPath, "utf8");
let payload;
try {
  payload = JSON.parse(raw);
} catch {
  throw new Error("Input is not valid JSON.");
}

const rows = Array.isArray(payload?.daily_progress)
  ? payload.daily_progress
  : Array.isArray(payload?.dailyProgress)
    ? payload.dailyProgress
    : Array.isArray(payload)
      ? payload
      : null;
if (!rows) throw new Error("Expected daily_progress, dailyProgress, or a JSON array.");

const metricLabels = {
  mcqs: "MCQs",
  essays: "Essays",
  fullPapers: "Full papers",
  purePartA: "Pure Part A",
  purePartB: "Pure Part B",
  appliedPartA: "Applied Part A",
  appliedPartB: "Applied Part B",
};
const sessions = [];
let invalidRows = 0;

for (const row of rows) {
  const date = String(row?.date ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    invalidRows += 1;
    continue;
  }
  const progress = row.progress_data ?? {
    physics: { mcqs: row.physics_mcqs, essays: row.physics_essays, fullPapers: row.physics_full_papers },
    ict: { mcqs: row.ict_mcqs, essays: row.ict_essays, fullPapers: row.ict_full_papers },
    math: {
      purePartA: row.math_pure_part_a,
      purePartB: row.math_pure_part_b,
      appliedPartA: row.math_applied_part_a,
      appliedPartB: row.math_applied_part_b,
      fullPapers: row.math_full_papers,
    },
  };
  for (const [sourceSubject, metrics] of Object.entries(progress ?? {})) {
    for (const [metric, rawCount] of Object.entries(metrics ?? {})) {
      const outputCount = Math.min(100000, Math.max(0, Math.round(Number(rawCount) || 0)));
      if (!outputCount) continue;
      const safeRow = String(row.id ?? row.entryId ?? date).replace(/[^a-zA-Z0-9._:-]/g, "-");
      const label = metricLabels[metric] ?? metric;
      sessions.push({
        id: `legacy-${safeRow}-${sourceSubject}-${metric}`.slice(0, 100),
        subject: sourceSubject === "physics" ? "physics" : "other",
        topic: `${sourceSubject === "math" ? "Combined Maths" : sourceSubject.toUpperCase()} · ${label}`,
        sessionType: "legacy-output",
        status: "completed",
        startedAt: new Date(`${date}T12:00:00+05:30`).toISOString(),
        endedAt: new Date(`${date}T12:00:00+05:30`).toISOString(),
        durationSeconds: 0,
        plannedDurationSeconds: 0,
        notes: "Imported from the permitted original tracker. The source recorded output counts, not study duration.",
        linkedAttemptId: "",
        evidenceKind: "marked-attempt",
        outputCount,
        outputUnit: label,
        source: "study-tracker-gamma-supabase-export",
        metadata: { sourceRowId: row.id ?? row.entryId ?? null, sourceSubject, sourceMetric: metric },
        clientUpdatedAt: new Date().toISOString(),
        syncState: "pending",
      });
    }
  }
}

const sourceChecksum = createHash("sha256").update(raw).digest("hex");
const migration = {
  id: `migration-study-tracker-gamma-${sourceChecksum.slice(0, 16)}`,
  source: "study-tracker-gamma-supabase-export",
  version: "1",
  recordsImported: sessions.length,
  sourceChecksum,
  integrityResult: invalidRows ? "transformed-with-invalid-rows-skipped" : "transformed-and-counted",
  migratedAt: new Date().toISOString(),
};
const output = {
  kind: "performance-powerhouse-study-tracker-backup",
  version: 1,
  exportedAt: new Date().toISOString(),
  studyTracker: {
    version: 1,
    sessions,
    goals: [],
    preferences: { timezone: "Asia/Colombo", defaultMinutes: 90, shareSafe: false },
    active: null,
    sync: { queue: [], lastSyncedAt: null, status: "local" },
    migrations: [migration],
  },
  migrationReport: {
    input: basename(inputPath),
    sourceRows: rows.length,
    invalidRows,
    outputRecords: sessions.length,
    sourceChecksum,
    countsMatch: sessions.length === migration.recordsImported,
    note: "The source stores daily output counts, not elapsed study time; imported durations are intentionally zero.",
  },
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Converted ${rows.length} source rows into ${sessions.length} output records.`);
console.log(`SHA-256 ${sourceChecksum}`);
console.log(`Wrote ${outputPath}`);
