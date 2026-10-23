# Source reconciliation — 23 October 2026

This update supersedes the latest-version statements in `SOURCE_IMPORT_2026-10-21.md`. It extends existing draft PR #8 rather than merging the older root application into the hosted product.

- Canonical public repository: `henlleyniron-byte/performance-powerhouse`.
- Current owned hosted source: V16 — Evidence & Recovery; saved version 42; original commit `8295a54feae1878777768fea4ce25c383cdffec4`.
- First-party publication record reports success on 21 October 2026. The saved archive metadata reports SHA-256 `3fa8fc6ed6771b534e73104e8945a1af8787be9ca4ad279101b9e18d1aafdca1`, 13,629,440 bytes and 163 archive files. Those are recorded artifact metadata; the release archive bytes were not downloaded or rehashed in this task. Archive file count and tracked source file count use different scopes.
- All 42 saved Site versions and six additional reachable intermediate commits from the owned hosted source repository have public sanitized snapshots. All 48 reachable original source commits were compared to their manifests.
- Four further commits from the secondary `HenlleyNiron/performance-powerhouse` development line are preserved separately under `related-source/legacy-v5.1/`, with original commit references and snapshots. Its historical canonical-repository claim does not override the owner's Byte repository instruction.
- Latest hosted snapshot: 262 included paths, seven omissions, eight link-redacted files. Latest secondary snapshot: 67 included paths, four omitted screenshots. Per-version manifests are authoritative.
- Public archive verification: 52 snapshots; 5,763 file-hash checks; 631 unique public blobs. Original associations, public hashes, complete path sets, modes and omissions checked. See `scripts/verify-source-history.py` and the verification receipt.
- Latest sanitized V16 direct Node suite: 241 total, 187 passed, 54 skipped, zero failed, Node 24.19.0. Legacy root: seven passed. Secondary legacy suite: 63 passed. No build, real-browser, authenticated API, database migration, recovery rehearsal or release was performed.

The six intermediate source commits had no saved Site version number. Their public imports retain source identity without manufacturing historical GitHub dates. The existing 41 saved-version imports remain intact. Additional corrected secondary snapshots remove obsolete paths left by upstream renames; the catalogue points to the snapshots whose complete file sets pass verification.

Run instructions, privacy/redistribution boundaries, limitations and outstanding release gates are in [the reviewer guide](REVIEWER_GUIDE.md). Keep issues #5/#7 open. Public archival and documentation work is not production merge/deployment authorization.
