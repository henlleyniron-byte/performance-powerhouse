# Performance Powerhouse

## Current hosted source and complete upgrade history

**This is the flagship repository: henlleyniron-byte/performance-powerhouse.** The hosted product is **V16 — Evidence & Recovery**, saved Site version **42**. The application at the root of this default branch remains the **legacy V5.0.1** snapshot.

- **[Start here: reviewer guide and verification evidence](docs/REVIEWER_GUIDE.md)**
- **[Inspect the latest V16 source](https://github.com/henlleyniron-byte/performance-powerhouse/tree/archive/site-history-review-20261021/hosted-source)**
- **[Browse all 42 saved versions, six additional hosted commits and four secondary upgrades](https://github.com/henlleyniron-byte/performance-powerhouse/blob/archive/site-history-review-20261021/history/SITE_VERSIONS.md)**
- **[Inspect the separate legacy V5.1 development line](https://github.com/henlleyniron-byte/performance-powerhouse/tree/archive/site-history-review-20261021/related-source/legacy-v5.1)**
- **[Draft PR #8: source reconciliation](https://github.com/henlleyniron-byte/performance-powerhouse/pull/8)** · **[Verification receipt](https://github.com/henlleyniron-byte/performance-powerhouse/blob/archive/site-history-review-20261021/history/VERIFICATION_2026-10-23.json)**

All **48 reachable hosted-source commits** and **four secondary legacy commits** are represented by traceable public snapshots. The archive verifier passed **5,763 file-hash checks across 52 snapshots**. Latest hosted Node checks: **187 passed, 54 skipped, zero failed**. Legacy root: **seven passed**. Secondary legacy: **63 passed**. [Remote archive CI passed](https://github.com/henlleyniron-byte/performance-powerhouse/actions/runs/39952317952).

The newer source is available on the public review branch and has not been merged into the legacy root. Private/contact links are redacted, and document/archive/screenshot exclusions are disclosed per snapshot. These are sanitized review sources, not complete production recovery artifacts. Browser, authenticated API, migration and recovery acceptance remain open in [#5](https://github.com/henlleyniron-byte/performance-powerhouse/issues/5) and [#7](https://github.com/henlleyniron-byte/performance-powerhouse/issues/7).

## Legacy V5 application

**Performance Powerhouse** is a local-first, privacy-conscious study evidence system for Sri Lankan G.C.E. A/L Biological Science students.

Its central question is simple:

> **What is costing marks, and has it actually been fixed?**

The application turns study activity into an evidence loop:

**Attempt → Mark → Diagnose → Repair → Closed-book reattempt → Fresh transfer → Delayed retest**

## Why this project exists

Students often accumulate resources, trackers, notes, and revision plans without proving that a weakness has actually been corrected. Performance Powerhouse is designed around the opposite principle: capture the smallest useful evidence, identify repeated mark loss, repair the narrow cause, and require a later retest before calling the error stable.

## Core features

- Paper / attempt logging with score, time, confidence, guess and error evidence
- Repair prioritisation based on repeated mark loss and unresolved retests
- Explicit closed-book reattempt, transfer-question and delayed-retest stages
- Biology, Chemistry and Physics diagnosis guidance
- Local-first storage in the browser; no backend is required
- Share-safe display mode for demonstrations and screenshots
- JSON backup / restore and migration support from earlier builds
- Installable PWA shell for offline use
- Integrated Physics Intelligence module with aggregate 2000–2025 paper-pattern metadata
- Lightweight study-session tracker

## Quick start

No build process is required.

1. Clone or download this repository.
2. Open `index.html` in a modern browser, or serve the folder with a static web server.
3. Complete the first-run profile.
4. Log a marked attempt and follow the repair loop.

For a local server, one simple option is:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Entry points

- `index.html` — main Performance Powerhouse application
- `community-share.html` — public/share-oriented entry point
- `physics-intelligence/` — aggregate Physics paper-pattern explorer
- `study-tracker/` — local-first study-session evidence tracker

## Privacy model

Performance Powerhouse is intentionally **local-first**. Study records are stored in browser `localStorage` rather than a central server. The repository contains application code and static aggregate datasets, not the maintainer's personal study history.

Share-safe mode is provided to reduce accidental exposure when demonstrating the application. Users should still review screenshots before publishing them.

## Physics Intelligence data

The included Physics Intelligence dataset stores aggregate counts, syllabus/taxonomy labels, years, question references, recurrence metadata, and derived statistics. It does **not** reproduce full exam-question text or answer keys.

See [`docs/DATA_PROVENANCE.md`](docs/DATA_PROVENANCE.md) for the data boundary and limitations.

## Project history

Performance Powerhouse existed and was iterated outside GitHub before this public repository was created. Earlier releases and QA packages were maintained through web deployments and private working archives. The Git history therefore begins with a migration of an already-existing project rather than pretending that the project originated on GitHub.

See [`docs/PROJECT_HISTORY.md`](docs/PROJECT_HISTORY.md).

## AI-assisted development disclosure

The project is maintained by **Henlley Niron Pushparajah** using an AI-assisted development workflow. AI tools are used for implementation, debugging, testing and documentation; project direction, acceptance/rejection of changes, release decisions, maintenance and responsibility for the published result remain with the maintainer.

## Contributing

Bug reports, accessibility improvements, documentation fixes and narrowly scoped study-workflow improvements are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.

## Security

Do not put personal study records, API keys, passwords, private documents or other secrets in issues or commits. See [`SECURITY.md`](SECURITY.md).

## License

Released under the [MIT License](LICENSE).

## New: Evidence Closure Auditor (upgrade branch)

Open [`evidence-closure-audit.html`](evidence-closure-audit.html) to audit a single mistake using six ordered proof gates, including an unseen transfer question and a delayed retest. It provides an explicit incomplete/inconsistent/closed outcome and a manually downloadable JSON record. The page is standalone, local-only, and **does not access or overwrite existing Performance Powerhouse storage**. It is not included in production until the upgrade is tested and merged.

### Timed daily paper sprint (upgrade branch)

Open [`daily-paper-sprint.html`](daily-paper-sprint.html) for a self-contained, offline-friendly countdown and strictly marked attempt logger. Captures subject, question reference, marks, error family, repair note and delayed retest date; retains at most 200 local entries and supports manual JSON backup. It stores records under its own key and does not alter the existing application database. Requires QA before release.
