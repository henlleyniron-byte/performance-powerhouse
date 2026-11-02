# Study Tracker Integration Changelog

## 2026-08-24

- Added native `/study-tracker/` module; no iframe or runtime dependency on the reference deployment.
- Added timestamp-based start/pause/resume/finish/recovery timer and cross-tab active-session protection.
- Added evidence completion bridge, linked attempt field and Command prefill integration.
- Added evidence-first metrics, 8-week heatmap modes, subject breakdown, realistic weekly evidence goal, filters, editing and explicit deletion.
- Added local-first offline queue and optional ChatGPT-authenticated D1 sync with per-user server authorization.
- Added D1 schema/migration and migration receipt tracking.
- Added JSON/CSV export, complete Powerhouse backup, original Supabase export importer and deterministic CLI converter.
- Added share-safe presentation mode and Community Share entry point.
- Added tracker assets to the versioned PWA cache and registered the existing service worker from the tracker route.
- Preserved all existing V4, V3, recovery and Physics Intelligence storage namespaces.
- Updated the main Command and Physics Intelligence navigation without changing the governing exam-performance loop.

The existing V4 core remains the product centre. Study time is presented as behavioural evidence, not a mastery score.
