# Maintainer workflow and verifiable releases

This document explains how Performance Powerhouse issues, fixes and releases are to be handled. It is a *process guide*, not a claim that every step has occurred on every historical build.

## Project purpose and boundaries

The project is a local-first study evidence application for Sri Lankan G.C.E. A/L Biological Science learners. It focuses on an evidence loop: **Attempt → Mark → Diagnose → Repair → Closed-book reattempt → Fresh transfer → Delayed retest**.

Contributions should preserve the privacy-first architecture, minimise dependencies and avoid turning the project into a generic dashboard.

## Issue triage

1. Reproduce with synthetic, non-identifying records.
2. Classify the affected area and student impact.
3. Check for privacy/security risk; coordinate a private report for sensitive issues.
4. Define an observable acceptance criterion.
5. Record the result in an issue or a pull request. Do not manufacture issue history to imply outside adoption.

## Change review

1. Work on a separate branch; keep `main` and live deployments unchanged until review.
2. Keep changes narrow. Note affected storage schemas, migrations, service-worker caches and backup formats.
3. Run `npm test` (Node.js 22+) for the existing automated service-worker checks.
4. Manually verify relevant app flows using fictional data. The automated checks do **not** constitute full browser end-to-end coverage.
5. Review accessibility, privacy, non-regression, and offline conditions.
6. Require a deliberate human merge and deploy decision.

## Release evidence ledger

For each *actually released* version, record:

| Field | Required evidence |
| --- | --- |
| Version / date | Publicly deployed version and date (not an estimated date) |
| Commit | A GitHub SHA or an explicit note that deployment predates source migration |
| Changes | Functional changes observable in a changelog or pull request |
| Validation | Actual test results and manual scenarios performed |
| Deployment | Live public URL, if available, verified against this version |
| Open limitations | Known regressions, deferred tasks and risks |

A release row should be added **only after verifying the deployment**. It is fine for pre-GitHub releases to lack a commit SHA. Do not backdate commits or infer user counts, GitHub stars, downloads, or outside contributions.

## Maintainer responsibilities

The primary maintainer chooses product scope, triages bugs, reviews AI-assisted proposals, approves changes, manages releases and documents limitations. AI-generated code and documentation must be reviewed and tested; automated output does not establish correctness by itself.

## Privacy and safety checklist

- Keep real student performance histories out of public issues and commits.
- Test with synthetic data.
- Preserve local-first storage unless a new design receives explicit review.
- Check share-safe screenshots and exports for accidental disclosure.
- Treat storage migrations, backups, and offline cache changes as high-risk.
- Do not upload copyrighted paper text or answer keys.

## Roadmap priorities

1. Improve evidence-driven test coverage for the repair / transfer / delayed retest loop.
2. Strengthen accessibility and keyboard/mobile usability.
3. Build a reproducible backup-and-restore regression checklist.
4. Improve public onboarding, documentation and contributor experience.
5. Collect *opt-in, non-sensitive* feedback without claiming unverified adoption.

This document describes maintainable practices and planned priorities; it is not proof that planned tests or community uptake have already happened.
