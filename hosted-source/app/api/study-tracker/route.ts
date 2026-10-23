import { and, desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import {
  studyGoals,
  studyMigrations,
  studyPreferences,
  studySessions,
} from "../../../db/schema";

const SUBJECTS = new Set(["physics", "chemistry", "biology", "other"]);
const SESSION_TYPES = new Set([
  "timed-paper",
  "mcq-set",
  "structured-questions",
  "essay",
  "active-recall",
  "closed-book-reattempt",
  "repair",
  "fresh-transfer",
  "delayed-retest",
  "targeted-theory-repair",
  "lecture-class",
  "resource-admin",
  "legacy-output",
]);

type SessionInput = {
  id?: unknown;
  subject?: unknown;
  topic?: unknown;
  sessionType?: unknown;
  status?: unknown;
  startedAt?: unknown;
  endedAt?: unknown;
  durationSeconds?: unknown;
  plannedDurationSeconds?: unknown;
  notes?: unknown;
  linkedAttemptId?: unknown;
  evidenceKind?: unknown;
  outputCount?: unknown;
  outputUnit?: unknown;
  source?: unknown;
  metadata?: unknown;
  clientUpdatedAt?: unknown;
};

function cleanText(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeInteger(value: unknown, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function validIso(value: unknown, required = true): string | null {
  if (typeof value !== "string" || !value.trim()) return required ? null : "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function validId(value: unknown): string | null {
  const id = cleanText(value, 100);
  return /^[a-zA-Z0-9][a-zA-Z0-9._:-]{7,99}$/.test(id) ? id : null;
}

async function currentIdentity() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const normalized = user.email.trim().toLowerCase();
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalized),
  );
  const userId = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return { userId, displayName: user.displayName };
}

function unauthorized() {
  return Response.json(
    { authenticated: false, error: "Sign in with ChatGPT to use cloud sync." },
    { status: 401 },
  );
}

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const unavailable = message.includes("no such table");
  return Response.json(
    {
      error: unavailable
        ? "Study Tracker storage is not initialized yet. Apply the bundled D1 migration."
        : "Study Tracker request failed.",
    },
    { status: 500 },
  );
}

export async function GET() {
  const identity = await currentIdentity();
  if (!identity) return unauthorized();
  try {
    const db = getDb();
    const [sessions, goals, preferences, migrations] = await Promise.all([
      db
        .select()
        .from(studySessions)
        .where(eq(studySessions.userId, identity.userId))
        .orderBy(desc(studySessions.startedAt))
        .limit(5000),
      db
        .select()
        .from(studyGoals)
        .where(eq(studyGoals.userId, identity.userId)),
      db
        .select()
        .from(studyPreferences)
        .where(eq(studyPreferences.userId, identity.userId))
        .limit(1),
      db
        .select()
        .from(studyMigrations)
        .where(eq(studyMigrations.userId, identity.userId)),
    ]);
    return Response.json({
      authenticated: true,
      displayName: identity.displayName,
      sessions: sessions.map((session) => ({
        ...session,
        metadata: JSON.parse(session.metadataJson || "{}"),
        metadataJson: undefined,
        userId: undefined,
      })),
      goals: goals.map((goal) => ({
        id: goal.id,
        period: goal.period,
        metric: goal.metric,
        target: goal.target,
        startDate: goal.startDate,
        endDate: goal.endDate,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      })),
      preferences: preferences[0]
        ? {
            timezone: preferences[0].timezone,
            settings: JSON.parse(preferences[0].settingsJson || "{}"),
          }
        : null,
      migrations: migrations.map((migration) => ({
        id: migration.id,
        source: migration.source,
        version: migration.version,
        recordsImported: migration.recordsImported,
        sourceChecksum: migration.sourceChecksum,
        integrityResult: migration.integrityResult,
        migratedAt: migration.migratedAt,
      })),
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  const identity = await currentIdentity();
  if (!identity) return unauthorized();
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const action = cleanText(payload.action, 40);
    const db = getDb();

    if (action === "upsert-session") {
      const input = (payload.session ?? {}) as SessionInput;
      const id = validId(input.id);
      const subject = cleanText(input.subject, 30).toLowerCase();
      const sessionType = cleanText(input.sessionType, 60);
      const startedAt = validIso(input.startedAt);
      const endedAt = validIso(input.endedAt, false);
      const clientUpdatedAt = validIso(input.clientUpdatedAt);
      if (
        !id ||
        !SUBJECTS.has(subject) ||
        !SESSION_TYPES.has(sessionType) ||
        !startedAt ||
        endedAt === null ||
        !clientUpdatedAt
      ) {
        return Response.json({ error: "Invalid study session." }, { status: 400 });
      }
      const values = {
        id,
        userId: identity.userId,
        subject,
        topic: cleanText(input.topic, 240),
        sessionType,
        status: cleanText(input.status, 20) || "completed",
        startedAt,
        endedAt: endedAt || null,
        durationSeconds: safeInteger(input.durationSeconds, 0, 86_400),
        plannedDurationSeconds: safeInteger(
          input.plannedDurationSeconds,
          0,
          86_400,
        ),
        notes: cleanText(input.notes, 4000),
        linkedAttemptId: cleanText(input.linkedAttemptId, 100) || null,
        evidenceKind: cleanText(input.evidenceKind, 60) || "none",
        outputCount: safeInteger(input.outputCount, 0, 100_000),
        outputUnit: cleanText(input.outputUnit, 40),
        source: cleanText(input.source, 80) || "powerhouse-study-tracker",
        metadataJson: JSON.stringify(input.metadata ?? {}).slice(0, 8000),
        clientUpdatedAt,
        updatedAt: new Date().toISOString(),
      };
      await db
        .insert(studySessions)
        .values(values)
        .onConflictDoUpdate({
          target: [studySessions.userId, studySessions.id],
          set: values,
        });
      return Response.json({ ok: true, id });
    }

    if (action === "delete-session") {
      const id = validId(payload.id);
      if (!id)
        return Response.json({ error: "Invalid session id." }, { status: 400 });
      await db
        .delete(studySessions)
        .where(
          and(
            eq(studySessions.userId, identity.userId),
            eq(studySessions.id, id),
          ),
        );
      return Response.json({ ok: true });
    }

    if (action === "delete-all") {
      await db
        .delete(studySessions)
        .where(eq(studySessions.userId, identity.userId));
      await db.delete(studyGoals).where(eq(studyGoals.userId, identity.userId));
      await db
        .delete(studyPreferences)
        .where(eq(studyPreferences.userId, identity.userId));
      await db
        .delete(studyMigrations)
        .where(eq(studyMigrations.userId, identity.userId));
      return Response.json({ ok: true, deleted: "all-study-tracker-data" });
    }

    if (action === "save-goal") {
      const goal = (payload.goal ?? {}) as Record<string, unknown>;
      const id = validId(goal.id);
      const startDate = cleanText(goal.startDate, 10);
      const endDate = cleanText(goal.endDate, 10);
      if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return Response.json({ error: "Invalid goal." }, { status: 400 });
      }
      const values = {
        id,
        userId: identity.userId,
        period: cleanText(goal.period, 30) || "weekly",
        metric: cleanText(goal.metric, 60) || "evidence-sessions",
        target: safeInteger(goal.target, 1, 100_000),
        startDate,
        endDate,
        updatedAt: new Date().toISOString(),
      };
      await db
        .insert(studyGoals)
        .values(values)
        .onConflictDoUpdate({
          target: [studyGoals.userId, studyGoals.id],
          set: values,
        });
      return Response.json({ ok: true, id });
    }

    if (action === "save-preferences") {
      const preferences = (payload.preferences ?? {}) as Record<string, unknown>;
      const values = {
        userId: identity.userId,
        timezone: cleanText(preferences.timezone, 80) || "Asia/Colombo",
        settingsJson: JSON.stringify(preferences.settings ?? {}).slice(0, 8000),
        updatedAt: new Date().toISOString(),
      };
      await db
        .insert(studyPreferences)
        .values(values)
        .onConflictDoUpdate({
          target: studyPreferences.userId,
          set: values,
        });
      return Response.json({ ok: true });
    }

    if (action === "record-migration") {
      const migration = (payload.migration ?? {}) as Record<string, unknown>;
      const id = validId(migration.id);
      const migratedAt = validIso(migration.migratedAt);
      if (!id || !migratedAt) {
        return Response.json({ error: "Invalid migration receipt." }, { status: 400 });
      }
      const values = {
        id,
        userId: identity.userId,
        source: cleanText(migration.source, 100),
        version: cleanText(migration.version, 40),
        recordsImported: safeInteger(migration.recordsImported, 0, 100_000),
        sourceChecksum: cleanText(migration.sourceChecksum, 128),
        integrityResult: cleanText(migration.integrityResult, 80) || "verified",
        migratedAt,
      };
      await db
        .insert(studyMigrations)
        .values(values)
        .onConflictDoUpdate({
          target: [studyMigrations.userId, studyMigrations.id],
          set: values,
        });
      return Response.json({ ok: true, id });
    }

    return Response.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    return routeError(error);
  }
}
