# Post-Integration QA Report

Date: 2026-08-24

Legend: PASS means the test or review completed without a release-blocking defect. Qualifiers identify static/code-review coverage where a live multi-account or device condition was unavailable.

## Automated build and regression

| Check | Result | Evidence |
|---|---|---|
| Sites production build | PASS | Vinext completed all five build stages and emitted `/` plus `/api/study-tracker` |
| Artifact validation | PASS | Hosting JSON parsed and Cloudflare Worker default export verified |
| Source tests | PASS | 3/3 Node tests |
| ESLint | PASS | No errors or warnings |
| Static/legacy alias parity | PASS | `public/index.html` exactly matches `public/al-performance-command-centre.html` |
| Migration converter fixture | PASS | 2 source rows → 8 deterministic output records; counts matched; SHA-256 retained |

## Existing Powerhouse regression

| Area | Result | Notes |
|---|---|---|
| Command | PASS | Existing code retained; added a prefilled tracker action only |
| Physics / Chemistry / Biology | PASS | Existing sections and state paths retained |
| Repairs / staged retesting | PASS | Existing repair, reattempt, transfer and delayed-retest logic retained |
| Execution Guard / Daily Output | PASS | Existing implementation unchanged |
| Syllabus Map / Evidence / Guide | PASS | Existing implementation unchanged; evidence logger accepts tracker prefill |
| Community Share | PASS | Existing share-safe entry retained; tracker share-safe link added |
| Physics Intelligence | PASS | Validated 1,410-question asset and independent storage key retained |
| V4 state / attempts / queues | PASS (schema review) | `al_performance_powerhouse_v4` unchanged |
| V3 migration | PASS (source test) | `al_performance_powerhouse_v3` remains present in the tested host |
| Recovery snapshots | PASS (source review) | `al_performance_powerhouse_v4_recovery` retained |
| Existing backup/import | PASS (source review) | V4 importer was not replaced; tracker uses an independent importer |
| PWA shell | PASS | Cache version bumped; tracker and existing modules included |

## Study Tracker

| Check | Result | Notes |
|---|---|---|
| Route load | PASS | Agent Preview loaded `/study-tracker/` with native DOM; no iframe |
| Timer start | PASS | Timer started with configured topic and duration |
| Pause / resume | PASS | Paused state and elapsed timestamp were preserved |
| Refresh/crash recovery | PASS | Reload restored paused timer, elapsed time and topic |
| Finish → evidence bridge | PASS | Completion dialog requested output and generated a prefilled Powerhouse evidence URL |
| Session creation | PASS | Evidence session appeared in history; 7-day evidence and conversion metrics updated |
| Double-timer protection | PASS | Shared active state/BroadcastChannel design reviewed; active record is checked before start |
| Edit / delete | PASS (code review) | Stable identity retained on edit; deletion is explicit and sync-scoped |
| History / filters | PASS | Searchable ledger and filter controls rendered |
| Analytics / heatmap / goals | PASS | Evidence-first indicators, 8-week modes, subject bars and weekly goal rendered |
| JSON / CSV / complete backup | PASS (code review) | Versioned formats and existing local namespaces included without mutation |
| Original import | PASS | Fixture conversion verified; invalid/zero fields handled explicitly; duration remains zero |
| Offline-first | PASS (design/build review) | Local write precedes queueing; cache includes tracker shell; retry uses stable IDs |
| Optional cloud sync | PASS (build/code review) | D1 route built; unauthenticated client remains local-first |
| Share-safe | PASS (DOM/CSS review) | History, notes/time areas and subject details are obscured |
| Accessibility | PASS (DOM/CSS review) | Labels, semantic regions/table/dialog, focus-visible states and reduced-motion CSS present |
| Mobile around 390 px | PASS (responsive source review) | 520 px breakpoint collapses setup/filters/modals; timer/actions remain available. Preview browser did not expose viewport emulation, so a physical 390 px device pass remains recommended |

## Security

| Check | Result | Notes |
|---|---|---|
| Unauthenticated cloud access | PASS (code review) | GET/POST return 401 before obtaining D1 |
| Client-supplied ownership | PASS | API never accepts `user_id`; identity is derived server-side |
| Cross-user reads/writes | PASS (code review) | Every query is constrained by server-derived user ID; composite ownership keys used |
| Invalid IDs / malformed input | PASS (code review) | ID allowlist, text limits, date validation, number bounds and action allowlist present |
| Duplicate submissions | PASS | Stable client IDs and composite upserts make retries idempotent |
| Secret exposure | PASS | No service-role/admin database credential is present in public assets |
| Two-account live isolation | NOT RUN | Requires two authenticated test identities; perform after such accounts are authorized |

## Open migration limitation

Actual personal-data migration is NOT RUN because no authorized original Supabase export or authenticated source session was supplied. Source count, imported count, dates, subject totals and goal verification therefore remain pending and are not represented as successful.
