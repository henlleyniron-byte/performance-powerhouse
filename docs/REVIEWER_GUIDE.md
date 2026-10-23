# Performance Powerhouse: source and maintainer evidence

Verified on **23 October 2026 (Asia/Colombo)**. Flagship repository: **[henlleyniron-byte/performance-powerhouse](https://github.com/henlleyniron-byte/performance-powerhouse)**. Maintainer: Henlley Niron Pushparajah. Development is AI-assisted; direction, acceptance and release responsibility remain with the maintainer.

## Start with the current source

The repository has two development lines. Their version numbers must not be combined into one release sequence.

| Source | Where to inspect it | Status |
| --- | --- | --- |
| Hosted V16 — Evidence & Recovery | [Current public source](https://github.com/henlleyniron-byte/performance-powerhouse/tree/archive/site-history-review-20261021/hosted-source) | Sanitized source copy of saved Site version 42; original source `8295a54feae1878777768fea4ce25c383cdffec4` |
| Hosted history | [Version catalogue](https://github.com/henlleyniron-byte/performance-powerhouse/blob/archive/site-history-review-20261021/history/SITE_VERSIONS.md) | All 42 saved versions and six other reachable source commits; each has a browsable snapshot and manifest |
| Secondary legacy V5.1 line | [Recovered source](https://github.com/henlleyniron-byte/performance-powerhouse/tree/archive/site-history-review-20261021/related-source/legacy-v5.1) | Four commits recovered from `HenlleyNiron/performance-powerhouse`; retained separately for review |
| Default branch application | Repository root on `main` | Legacy static V5.0.1 runtime. The documentation update does not promote it to V16 |
| Import and verification | [Draft PR #8](https://github.com/henlleyniron-byte/performance-powerhouse/pull/8) | Public review branch, not a production migration |
| Hosted application | [Performance Powerhouse](https://al-performance-powerhouse.phenlleyniron.chatgpt.site) | First-party deployment record for saved version 42 reports success, 21 October 2026 |

Saved Site versions are numbered separately from product labels: product V16 corresponds to saved version 42. A hosted deployment record establishes publication status; it does not independently prove current HTTP bytes or acceptance-test results.

The secondary line's original history document calls the other repository canonical. That historical statement is superseded by the owner's current instruction to keep **the Byte repository as the flagship**. Its source remains unchanged inside its historical snapshots; do not use its package `repository`/`homepage` fields or nested Pages workflow as deployment instructions for the flagship.

## What the project does

Performance Powerhouse helps Sri Lankan English-medium G.C.E. A/L science students connect marked practice to a specific repair and later independent evidence:

**Attempt → Mark → Diagnose → Repair → Closed-book reattempt → Fresh transfer → Delayed retest.**

The hosted source includes the main evidence workspace, repair board and chain inspector, study tracker, subject-intelligence interfaces, resource and practical-study tools, local recovery code, and optional authenticated API/schema code. The source tree itself is the evidence for these implementations. No improvement in examination results, academic validation, adoption scale or production security is inferred from their presence.

V16 adds guarded writes and recovery exports, compatible same-origin readers, resumable attempt fields, evidence filtering, and share-safe safeguards while retaining V15's repair and verification interfaces. See `hosted-source/docs/RELEASE-V16-2026-10-21.md`. That original document describes an unpublished candidate; later authenticated version/deployment records establish its subsequent saved publication. Historical release notes remain historical records.

The secondary V5.1 work extracts evidence logic into a tested core, refactors scripts/styles, introduces import sanitisation and retest fixes, and adds unit/integrity/browser test sources and workflow templates. Those fixes apply to that legacy code line; they are not proof that the distinct hosted application has the same implementation or coverage.

## Reproduce the public checks

Use a full clone because the archive verifier reads historical Git objects:

```bash
git clone https://github.com/henlleyniron-byte/performance-powerhouse.git
cd performance-powerhouse
git switch archive/site-history-review-20261021
python3 scripts/verify-source-history.py --json
npm test
cd hosted-source
node --test tests/*.test.mjs tests/*.test.cjs
cd ../related-source/legacy-v5.1
npm test
```

Python 3.9+ and Node.js 24 were used for the public-source verification. No dependency installation is needed for these particular Node source/unit checks. A shallow checkout must first fetch the referenced history. The hosted package's `npm test` also builds the framework and is a different command.

For an isolated static preview of the hosted public frontend:

```bash
python3 -m http.server 8080 --directory hosted-source/public
```

Use fictional records and a separate browser profile. This preview does not supply hosted identity, API authentication, cloud bindings or missing downloads. The hosted source is a framework/Worker application with a `public/` frontend; the legacy root and secondary line are static applications. Do not deploy one using the other's instructions.

## Checks actually run in this reconciliation

| Check | Result | What it establishes |
| --- | --- | --- |
| Public archive verifier | 52 snapshots; 5,763 file-hash checks; 631 unique public blobs; pass | Indexed paths, modes, omissions, public hashes and original blob association for unredacted files |
| Original hosted Git history comparison | All 48 reachable commits represented | Source coverage within the recovered owned repository; not every possible external/local artifact |
| Latest sanitized V16 direct Node suite | 241 total; 187 passed; 54 skipped; 0 failed | Executed regression checks; skipped optional DOM/private-corpus checks remain unverified |
| Legacy root `npm test` | 7 passed; 0 failed | Service-worker source contracts |
| Secondary legacy `npm test` | 63 passed; 0 failed | Its unit and static-integrity checks |

The new [public source archive CI run](https://github.com/henlleyniron-byte/performance-powerhouse/actions/runs/39952317952) passed on `df16ff71f016a891c4bce87c3fd99d1ab013f86a`. This is remote verification of the listed archive/source/unit checks, not a deployment or browser test.

The verifier reads hashes from Git objects, compares complete snapshot path sets and rejects published omissions. It also compares all 42 saved version/source associations to the captured first-party record inventory. The original source trees were independently compared with the public manifests locally. Runtime source files are copied without dependency upgrades.

No full Worker build, real-browser run, authenticated API test, data migration, backup/restore rehearsal or production rollout was performed for this reconciliation. Secondary Playwright test files are preserved but were not executed. Historical green CI results or imported QA documents do not extend these results. A skipped test is not a pass.

## Public source boundaries

The latest hosted snapshot contains **262 files**, with **seven omissions** and **eight files with link redactions**. Omitted paths comprise five downloadable PDF/ZIP files awaiting redistribution review and two generated Python bytecode files. Private-resource and contact URLs use nonfunctional `example.invalid` placeholders; this includes some test fixture URLs. Exact paths, original blobs and public hashes are disclosed in the per-snapshot manifests.

The latest secondary snapshot includes **67 files** and omits **four screenshot files** whose synthetic-data provenance was not independently verified. All four secondary code commits have separate snapshots. Nested `.github/workflows/` files are preserved source records; their placement inside `related-source/` does not activate deployments or paid API calls in the flagship repository.

No learner databases, browser storage, backup files, runtime credentials, environment secrets or source Git authentication configuration were imported. These sanitized snapshots are not exact production artifacts or complete rollback bundles. The root MIT licence and source/data provenance documents remain applicable; included learning datasets are not an official marking scheme or a blanket redistribution licence for third-party papers.

## Maintenance and remaining work

| Evidence | Location | Next action |
| --- | --- | --- |
| Historical source provenance and reproducible verifier | PR #8 and `history/` | Review omissions/redactions and source layout |
| Browser evidence-loop coverage gap | [Issue #5](https://github.com/henlleyniron-byte/performance-powerhouse/issues/5) | Exercise the current hosted lifecycle, reload, invalid evidence, privacy and export/import with synthetic records |
| Source/production/recovery reconciliation | [Issue #7](https://github.com/henlleyniron-byte/performance-powerhouse/issues/7) | Verify exact private release artifacts and isolated recovery before migration |
| First-attempt guide | [Draft PR #2](https://github.com/henlleyniron-byte/performance-powerhouse/pull/2) | Reconcile its V5 context with the hosted workspace |
| Evidence closure auditor | [Draft PR #3](https://github.com/henlleyniron-byte/performance-powerhouse/pull/3) | Review overlap with current hosted evidence rules |
| Governance and CI | [Draft PR #4](https://github.com/henlleyniron-byte/performance-powerhouse/pull/4) | Consolidate duplicated workflows/templates and distinguish the two code lines |
| Community keyboard accessibility | [Draft PR #6](https://github.com/henlleyniron-byte/performance-powerhouse/pull/6) | Port narrowly to the current hosted page and verify keyboard behavior |

All listed draft branches already exist in the correct Byte repository. They are visible upgrades awaiting review, not missing production releases. The archive work leaves these PRs as drafts and leaves issues #5/#7 open. Explicit human merge/release review remains required. No production source, audience, project identity, learner data or default-branch runtime is changed.

## Codex for OSS context

This is a maintained student-focused project with public code and an explicit AI-assisted workflow. The repository supplies inspectable evidence of source preservation, repairs, tests and maintenance decisions. It makes **no claim of widespread adoption, independent contributors, measured learning gains or OpenAI endorsement**.

OpenAI's [Codex for Open Source programme](https://developers.openai.com/community/codex-for-oss) offers eligible maintainers six months of ChatGPT Pro with Codex. The [programme terms](https://learn.chatgpt.com/docs/codex-for-oss-terms) say selection may consider usage, ecosystem importance, active maintenance, maintainer role/permissions and programme capacity. Repository improvements do not guarantee acceptance. The user's submitted application was not reopened or amended in this task; its actual submitted fields have not been independently verified.
