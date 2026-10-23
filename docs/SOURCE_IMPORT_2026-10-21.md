> Historical import record. The [23 October update](SOURCE_IMPORT_2026-10-23.md) supersedes its latest-version and current-test statements.

# Hosted source import — 21 October 2026

## What is included

`hosted-source/` contains the latest available saved source: **V15 — Evidence Trail**, saved Site version **41**, originally `55c6bb30bf66f474d315c61f217f3f8ce7b81138`. All 41 saved Site versions are browsable through [the version index](../history/SITE_VERSIONS.md). Each snapshot contains that version's framework application, public frontend assets, API code, database schemas/migrations, tests and documents where present in the original commit and allowed by the public filter.

The repository root remains the legacy V5 public application. No production migration, schema change, merge, or deployment is part of this import. The latest source lives in a separate folder so a legacy static deployment cannot silently become a full-stack deployment. The original Site repository and this GitHub repository remain independent.

## Public archive boundary

- This is a **sanitized review archive**, not a byte-identical source mirror, deployable release assertion or validated rollback bundle.
- Five PDF/ZIP downloads in version 41 are withheld pending redistribution review, including the uploaded V4 source PDF and the generated offline pack. Two Python bytecode files are omitted. The per-version manifests give exact paths and original blob IDs.
- Personal Drive/Docs links, a private chat URL if present, and messaging links are replaced by nonfunctional `https://example.invalid/private-resource/...` placeholders. Fictional `example`/`synthetic` test links are retained. Latest version 41 has six files with redacted links.
- The independently authored fictional practical exercise sources are retained with their original provenance and teacher-review limitations. Their inclusion is not an official marking-scheme or academic-accuracy endorsement.
- Runtime databases, learner backups, browser histories, environment credentials, node_modules, built output and source Git authentication/configuration are not copied.
- Git history uses new, current-date import commits; it records original source provenance rather than manufacturing historical GitHub activity.

## Inspect and run

Requirements from the recovered package: Node.js >=22.13.0. The full-stack installation/build scripts target Linux; original cross-platform notes remain in hosted-source/README.md. No dependency versions were upgraded.

For a static local inspection with no cloud API:

```bash
python3 -m http.server 8080 --directory hosted-source/public
```

Open http://localhost:8080/index.html with fictional data in a separate browser profile. This does not simulate authenticated APIs, hosted identity headers, cloud database bindings or production offline behavior. Withheld downloads and redacted resource links will not work.

Run the source regression suite without private fixtures:

```bash
cd hosted-source
node --test tests/*.test.mjs tests/*.test.cjs
```

Optional fixture variables and DOM_QA_PACKAGE are described in the original tests/release notes. A skipped test is not a pass. The source package's npm test also builds and is a different, broader command. Install/build instructions and hosted identity configuration require their own deliberate review; do not run any publish helper as part of this archive import.

## Verification performed

On the exact sanitized latest snapshot, Node.js **24.19.0**, `node --test tests/*.test.mjs tests/*.test.cjs`: **216 tests, 162 passed, 54 skipped, zero failed**. Optional DOM support and private fixtures were not supplied. No real learner data was loaded. This import did not build the Worker, test authenticated APIs, migrate a database, verify a real browser, or deploy.

All 41 original saved-version commits were found in the recovered source repository. The original source bundle passed `git bundle verify` locally. All imported file hashes are recorded in the per-version manifests. A pattern scan of the included text found no unresolved actual Drive/Docs links or matches for the checked GitHub/OpenAI token/private-key patterns; that bounded scan is not a guarantee against every possible secret or privacy issue.

The import's file hash verification and remote tree verification are recorded in the draft PR after completion. Historical QA results inside source docs remain attributed historical records; this session did not rerun all old releases.

## Before any merge or deployment

Keep [issue #7](https://github.com/henlleyniron-byte/performance-powerhouse/issues/7) open. Preserve exact private source and matching release artifacts separately from this public archive. Validate backup/restore and the seven-stage evidence loop using fictional data; inspect offline caches, privacy/share mode, migrations, APIs and identity boundaries. Review the five withheld assets and restore only material approved for public distribution. Port draft PRs #2, #3, #4 and #6 individually; do not apply old V5 pages over current pages. Human review precedes merge and production publication.

Version 40, original source `1b51110dd4e12031fc786203f513ec8363edefe0`, remains a documented prior publication candidate. This archive import does not rehearse rollback or prove database backward compatibility.

