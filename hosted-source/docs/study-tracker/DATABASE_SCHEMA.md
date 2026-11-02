# Study Tracker Database Schema

The optional cloud layer uses the Sites-managed D1 binding `DB`. Browser-local state remains authoritative while offline under `al_performance_powerhouse_study_tracker_v1`.

## Tables

### `study_sessions`

Composite primary key: (`user_id`, `id`). Stores subject, topic, session type/status, UTC start/end timestamps, actual/planned duration, notes, optional linked Powerhouse attempt ID, evidence kind/output, source, metadata JSON, and client/server timestamps.

Indexes:

- (`user_id`, `started_at`) for the user's chronological history;
- (`user_id`, `subject`) for subject summaries.

### `study_goals`

Composite primary key: (`user_id`, `id`). Stores a dated period, metric and target. Indexed by (`user_id`, `period`). The current implementation uses realistic weekly evidence-session goals.

### `study_preferences`

Primary key: `user_id`. Stores timezone and compact tracker/display settings. Default timezone is `Asia/Colombo`.

### `study_migrations`

Composite primary key: (`user_id`, `id`). Stores migration source/version, imported record count, source SHA-256, integrity result and migration timestamp.

## Authorization and isolation

- The server derives an opaque user identifier by hashing the normalized email from Sites' authenticated ChatGPT user context.
- The API does not accept a client-supplied `user_id`.
- Every select, update and delete is scoped by the authenticated server-derived user ID.
- Session/goal/migration idempotency uses composite user/record conflict targets.
- The public client contains no database credential or service-role secret.
- Unauthenticated cloud reads and writes return HTTP 401. Local-first use remains available without sign-in.

D1 does not provide Supabase-style database RLS. Isolation is enforced in the server API and reinforced by composite ownership keys; the D1 binding is not exposed directly to the browser.

## Derived values

Evidence streak, weekly/30-day totals, subject time, study-to-evidence conversion, heatmap values and passive/admin time are derived from `study_sessions`. They are not stored as redundant counters.

## Time handling

Session timestamps are stored as normalized ISO UTC strings. Calendar/streak display uses `Asia/Colombo` boundaries in the browser. Legacy daily output is anchored at local noon to avoid midnight boundary shifts.
