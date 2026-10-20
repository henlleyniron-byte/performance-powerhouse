# Contributor and coding-agent guardrails

Performance Powerhouse is a public, student-facing, local-first web application. Its main question is: *What marks were lost, and is the weakness actually repaired?*

## Product invariants

- Preserve the **Attempt → Mark → Diagnose → Repair → Closed-book reattempt → Fresh transfer → Delayed retest** evidence loop.
- Keep local performance data on-device by default.
- Avoid changes that expose personal records via demos, backups, logs, issues, screenshots or query strings.
- Maintain backwards-compatible backups and migrations unless the change explicitly handles upgrades.
- Preserve PWA/offline behavior and respect privacy and cache-control directives.

## Safe development workflow

1. Inspect existing implementation and tests before editing.
2. Work in a review branch; do **not** push unreviewed changes straight to `main` or deploy to the public site.
3. Make focused changes with human-readable commits and an issue/PR that states a real problem.
4. Use made-up student records for tests and screenshots.
5. Run `npm test` (requires Node.js 22 or newer) and check affected browser flows manually.
6. If a test cannot be run, disclose the limitation. Do not claim that tests passed without evidence.
7. Flag any change to service workers, storage schema, import/export or share-safe behavior for extra human review.

## Contributions and claims

- Do not fabricate usage numbers, contributors, benchmarks, versions, release dates, or QA results.
- Do not add copyrighted examination questions, answers, paid-course content, credentials or private documents.
- Be transparent about substantial AI assistance.
- Maintainer approval remains necessary for merges and public releases.

Useful references: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/PROJECT_HISTORY.md`, `docs/DATA_PROVENANCE.md`, and `docs/MAINTAINER_WORKFLOW.md`.
