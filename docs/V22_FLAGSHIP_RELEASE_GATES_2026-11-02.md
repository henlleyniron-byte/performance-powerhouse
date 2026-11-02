# V22 flagship release gates — 2026-11-02

Status: **review only**. This branch must not deploy, overwrite user data, or merge V5.3.0 into V22.

## Verified provenance
- Current hosted source: `hosted-source/`, native commit `29314a708c0ab325ad1d9936ad17de747237c222`, saved Site version 49.
- Successful deployment reported for 2026-10-29; see `docs/V22_SOURCE.md`.
- Snapshot has 290 files; 118 redactions and five omitted downloadable files. It is **not** a complete production recovery artifact.
- Reported test subset: 227 passed, 35 skipped; legacy service worker: 7 passed.
- Live HTTP byte parity was **not** established (403); full DOM/browser acceptance and build were **not** completed.
- Root `package.json` is legacy V5, not the V22 package. Run current application checks from `hosted-source/`.

## Required gates before a release
- [ ] Independently run `python scripts/verify-v22-source.py` and record results and environment.
- [ ] Install pinned dependencies in a clean, isolated environment; run lint, type checks, build and full tests; document skipped tests.
- [ ] Reproduce V22 draft recovery in a disposable browser, including pending 250 ms edits, conflicting tabs, invalid historical fields, quota failure and share-safe mode.
- [ ] Verify export/import and offline service-worker behavior with synthetic records; never use actual student data.
- [ ] Check keyboard navigation, focus restoration, contrast and screen-reader notices.
- [ ] Compare six production JS assets with expected hashes when access is authorized; record 403 as *unverified*, not a pass.
- [ ] Validate private-resource placeholders and missing downloads before publishing a repository-based deployment.
- [ ] Check dependencies, exposed secrets, permissions and CI permissions without printing credentials.
- [ ] Prepare backup, rollback and user-data recovery instructions; note that code rollback does not roll back browser storage.
- [ ] Obtain explicit approval before production deployment or data migration.

## Separate engineering line
`HenlleyNiron/performance-powerhouse` V5.3.0 contains independently developed evidence-chain and keyboard tests. Compare features and tests individually; do not substitute that source for the hosted V22 tree.

## Decision
**HOLD production changes** until browser acceptance, complete build and parity gates are evidenced. No automatic AI model swap: identify each actual model call, provider, key handling, costs, fallbacks and evaluation dataset before proposing a model upgrade.
