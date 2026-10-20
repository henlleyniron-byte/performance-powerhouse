# Canonical source reconciliation — 20 October 2026

## Verified current release

The owner's authenticated Sites records identify the current Performance Powerhouse publication as **V15 — Evidence Trail**, saved Site version **41**. Its production deployment succeeded on 19 October 2026. Opening the Site source recovered commit `55c6bb30bf66f474d315c61f217f3f8ce7b81138`, exactly matching version 41's source provenance.

Production origin: https://al-performance-powerhouse.phenlleyniron.chatgpt.site

The immediately preceding saved version 40 records source commit `1b51110dd4e12031fc786203f513ec8363edefe0`. This establishes an existing rollback candidate; rollback was not executed or independently rehearsed in this audit.

The earlier V7 reference in issue #7 was historical, not the current publication. The public repository remains a separate V5.0.1 snapshot. **Do not deploy this repository over the current Site as if the sources were identical.**

## Reproducible difference

Comparing all 128 tracked files under the recovered source's `public/` directory to this repository's `main` tree (39 files total), after stripping the `public/` prefix, found:

| Result | Count |
| --- | ---: |
| Identical Git blob hashes | 4 |
| Same URL-root path, different bytes | 8 |
| Canonical URL-root path absent from this snapshot | 116 |

The eight changed paths are `community-share.html`, `index.html`, `manifest.webmanifest`, `sw.js`, `physics-intelligence/app.js`, `physics-intelligence/index.html`, `physics-intelligence/assets/physics-intelligence-data.json`, and `study-tracker/index.html`.

These are path/byte comparisons, not a count of missing features. Renamed files and different architecture require semantic review. In particular, V15 contains a Vinext/React application, Worker entry point, authenticated API routes, D1 schema/migrations, and a larger set of browser applications. It cannot be reconciled by replacing the old root HTML alone. The current package's internal version is `0.1.0`; V15 comes from its display metadata and matching release documentation, not that package field.

## Repeat the read-only comparison

`canonical-public-v15.json` records only public asset paths and Git blob hashes from the immutable source commit. It contains no learner records or copied question/answer text. It is a fixed V15 baseline, not an automatically current production manifest.

```bash
# Compare a recovered canonical checkout's browser assets:
node tools/check-source-parity.mjs docs/canonical-public-v15.json /path/to/canonical/public

# Compare the legacy repository's URL-root layout:
node tools/check-source-parity.mjs docs/canonical-public-v15.json .
```

Exit status: `0` means all listed files match, `1` means at least one is changed/missing, and `2` means invalid input or a filesystem error. The second command is expected to return `1` on the V5 snapshot; it is deliberately not the normal CI acceptance check. Extra files are not compared. A match does not verify server source, runtime behavior, data migration, deployment contents, or academic accuracy.

The checker reads only the selected root, refuses unsafe manifest paths and outward symlinks, makes no network calls and changes no files. Run its synthetic regression tests with `node --test tests/source-parity.test.mjs`.

## Validation performed in this audit

- Canonical source tests: `node --test tests/*.test.mjs tests/*.test.cjs` completed with **216 tests: 162 passed, 54 skipped, zero failed**. Optional source fixtures and the optional DOM package were not supplied. These skips are not passes.
- The new comparison checker matched **128/128** listed canonical public assets and passed five isolated tests covering byte differences, absent files, invalid manifests, path traversal, symlink escape, and CLI exit codes.
- The complete public review-branch `npm test` suite passed **15/15** tests with the new checker included, using Node.js 24.19.0 locally. CI uses its configured Node.js version and must be checked separately.
- This audit did not rebuild or redeploy the Site, query learner records, perform a real-browser test, or prove academic content accuracy. Existing successful deployment metadata establishes publication status, not those additional claims.

## Remaining migration work

1. Preserve the complete canonical source and current deployment artifact; exclude credentials, local runtime state and learner records from any public transfer.
2. Review licensing/provenance before copying practical PDFs, examination material, or other third-party assets. This hash inventory grants no redistribution rights.
3. Choose an explicit full-stack source layout and hosting configuration. Port legacy public-contribution docs deliberately; preserve server identity boundaries, D1 bindings, migrations, origins, storage keys, backup formats and offline paths.
4. Rebase or port draft PRs #2, #3, #4 and #6 individually against that source. Run synthetic-data browser checks for the full evidence loop, privacy, backup/restore, keyboard use and offline behavior.
5. Record the final reviewed source commit, artifact, deployment and rollback baseline before an approved release. Keep issue #7 open until the migration and validation are actually complete.

Prepared with AI assistance from authenticated ownership records and immutable source trees. No adoption or contributor claims are inferred from this work.
