import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const powerhouseSnapshots = sqliteTable("powerhouse_snapshots", {
  userId: text("user_id").primaryKey(),
  payloadJson: text("payload_json").notNull(),
  revision: integer("revision").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
});

export const studySessions = sqliteTable(
  "study_sessions",
  {
    id: text("id").notNull(),
    userId: text("user_id").notNull(),
    subject: text("subject").notNull(),
    topic: text("topic").notNull().default(""),
    sessionType: text("session_type").notNull(),
    status: text("status").notNull().default("completed"),
    startedAt: text("started_at").notNull(),
    endedAt: text("ended_at"),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    plannedDurationSeconds: integer("planned_duration_seconds")
      .notNull()
      .default(0),
    notes: text("notes").notNull().default(""),
    linkedAttemptId: text("linked_attempt_id"),
    evidenceKind: text("evidence_kind").notNull().default("none"),
    outputCount: integer("output_count").notNull().default(0),
    outputUnit: text("output_unit").notNull().default(""),
    source: text("source").notNull().default("powerhouse-study-tracker"),
    metadataJson: text("metadata_json").notNull().default("{}"),
    clientUpdatedAt: text("client_updated_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.id] }),
    index("study_sessions_user_started_idx").on(
      table.userId,
      table.startedAt,
    ),
    index("study_sessions_user_subject_idx").on(
      table.userId,
      table.subject,
    ),
  ],
);

export const studyGoals = sqliteTable(
  "study_goals",
  {
    id: text("id").notNull(),
    userId: text("user_id").notNull(),
    period: text("period").notNull(),
    metric: text("metric").notNull(),
    target: integer("target").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.id] }),
    index("study_goals_user_period_idx").on(table.userId, table.period),
  ],
);

export const studyPreferences = sqliteTable("study_preferences", {
  userId: text("user_id").primaryKey(),
  timezone: text("timezone").notNull().default("Asia/Colombo"),
  settingsJson: text("settings_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const studyMigrations = sqliteTable(
  "study_migrations",
  {
    id: text("id").notNull(),
    userId: text("user_id").notNull(),
    source: text("source").notNull(),
    version: text("version").notNull(),
    recordsImported: integer("records_imported").notNull().default(0),
    sourceChecksum: text("source_checksum").notNull().default(""),
    integrityResult: text("integrity_result").notNull(),
    migratedAt: text("migrated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.id] })],
);
