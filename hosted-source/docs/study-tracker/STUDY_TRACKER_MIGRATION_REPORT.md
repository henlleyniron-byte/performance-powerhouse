# Study Tracker Migration Report

Date: 2026-08-24

## Source inspection

The permitted reference at `https://study-tracker-gamma.vercel.app/` is a Supabase-backed daily output tracker. Its public browser bundle uses Supabase Auth and reads or writes these tables:

- `daily_progress`
- `exam_settings`
- `user_profiles`

The client scopes queries with the authenticated Supabase `user_id`. No private credential, service-role key, authentication bypass, or server-side secret was accessed. The public client bundle shows the application contract but cannot prove the database's row-level-security policy.

The reference application records daily counts for Physics, ICT, and Combined Maths. It does not record elapsed timer sessions. Consequently, legacy output can be retained, but historical study duration cannot be reconstructed honestly.

## Authorized migration status

No authenticated database export, repository, or user session was supplied with this handoff. Source records therefore remain untouched and the production migration is **pending authorized export**.

| Stage | Count | Result |
|---|---:|---|
| Source | Not available | Awaiting the user's authorized `daily_progress` export |
| Transformed | 0 | No source payload processed |
| Imported | 0 | No personal data inserted |
| Verified | 0 | Cannot verify counts or aggregates without source data |

This is intentionally not reported as a completed migration.

## Implemented migration path

1. Export only the authorized user's `daily_progress` rows from the original Supabase project.
2. Preserve the untouched JSON as the rollback source.
3. Import it from Study Tracker → **Import / migrate**, or run:

   `node tools/convert-study-tracker-export.mjs source.json converted.json`

4. The converter accepts a `daily_progress` array, `dailyProgress` array, or a raw array.
5. Each non-zero daily metric becomes a deterministic `legacy-output` record. The original date, subject/metric, row identifier and count are retained.
6. Imported duration is exactly zero because the source did not store duration.
7. The SHA-256 source checksum, source-row count, transformed-record count, skipped invalid rows and migration receipt are retained.
8. Re-importing the same source is idempotent because record IDs derive from source row ID, subject and metric.

## Required verification when the export is supplied

Compare source → transformed → imported for:

- source row count and non-zero output record count;
- earliest and latest dates;
- active dates;
- Physics, ICT and Combined Maths totals by metric;
- total source output count;
- goals/settings if separately exported;
- source checksum and deterministic identifiers.

Historical duration, notes, tags and timer state cannot be migrated because those fields do not exist in the inspected source data. No original record should be deleted or altered after migration.
