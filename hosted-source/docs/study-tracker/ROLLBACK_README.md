# Rollback: Pre Study Tracker Integration Baseline

Known-good baseline: **Performance Powerhouse — Pre Study Tracker Integration Baseline — 2026-08-24**

- Sites project ID: `appgprj_6a68dab7877881919ef39b46aaed6c22`
- Public URL: `https://al-performance-powerhouse.phenlleyniron.chatgpt.site`
- Pre-integration production version: `9`
- Pre-integration git commit: `1a8a8d2d12a7dbe8879042993fa47ac83964da4e`
- Baseline ZIP SHA-256: `1b8541ee270e5b77a73faf95a8aa6f6f0677c6e449033e7e96357b28167d3905`

## What the baseline contains

The V4 core, legacy compatibility alias, Community Share, Physics Intelligence, manifest, service worker, icons/assets, V3→V4 migration and recovery logic. Storage keys are preserved exactly:

- `al_performance_powerhouse_v4`
- `al_performance_powerhouse_v3`
- `al_performance_powerhouse_v3_recovery`
- `al_performance_powerhouse_v4_recovery`
- `al_performance_powerhouse_physics_intelligence_v1`

## Restore procedure

1. Export current Powerhouse and Study Tracker data before rollback.
2. In the existing Sites project, restore/redeploy saved production version `9`, or redeploy the baseline source at commit `1a8a8d2d12a7dbe8879042993fa47ac83964da4e` to the same project.
3. Do not create a new Sites project or change the public origin.
4. Verify `/`, `/community-share.html`, `/physics-intelligence/`, the manifest and service worker.
5. Confirm V4 local data and Physics Intelligence state still load. Restoring application code does not itself remove browser-local Study Tracker state or cloud D1 rows.

The baseline ZIP is included in the final handoff package under `rollback/` and must remain unchanged.
