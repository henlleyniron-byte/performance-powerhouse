# Practical Mastery Lab V3

This is an additive module in the existing V8 Performance Powerhouse Site, not a replacement application. The canonical deployment source is Sites-managed Git, not the historical public GitHub default branch.

## Content update

1. Obtain the reviewed replacement JSON, schema and CSV from the owner’s current resource package. Replace the three matching `public/practical-lab/` assets together. Never reconstruct records from a PDF or reorder/renumber them to disguise a source change.
2. Keep stable activity IDs and `nie_number` strings. Physics `phy-21-1` / `21.1` and `phy-21-2` / `21.2` must remain separate. Retain the printed NIE pages; they are not viewer page numbers.
3. Validate against the supplied Draft 2020-12 schema and run `node --test tests/practical-lab.test.mjs`. The runtime currently intentionally accepts release `2026-10-15-v3`; a future release requires an explicit compatibility update in `model.js` and tests, preserving all old private evidence. Do not simply change the release gate and discard old records.
4. Record scientific wording changes and the exact NIE/teacher verification in a changelog. The current supplied catalog is imported byte-for-byte, without content corrections. Its answers are independent student commentary awaiting teacher review.
5. Change the two Drive PDF URLs in `public/practical-lab/index.html` only after checking the new file metadata, edition, page count, and public sharing. PDFs remain external, online links; do not claim they are cached. No large PDF is embedded in activity pages.
6. Bump the cache release string in `public/sw.js`. Keep all previous assets, same-origin/API exclusions, existing origin, database binding and storage keys. Do not change unrelated UI or run database migrations for a catalog update.
7. Build through the existing Sites workflow, test a disposable browser, inspect mobile/tablet/desktop and share-safe mode, then release the exact pushed commit through the same Sites project.

## Evidence and error semantics

The static catalog is separate from `performance_powerhouse_practical_lab_v3` private progress (schema `powerhouse-practical-progress-v1`, version 1). A recovery key keeps the previous committed Lab bytes. Up to 126 records, 200 attempts per activity and 3.5 MB overall are accepted. A full history is never silently truncated; export it before the limit.

The existing `PowerhouseVerification.assess` rules are reused with an activity-specific adapter. Chains reference one original attempt plus exact reattempt/transfer/delayed IDs. They never write to core attempts or complete core retests. Main Command next actions and Repairs link to the same practical evidence; no parallel calendar/scheduler is introduced. A delayed unseen check requires at least seven days after the successful fresh transfer. Formative marks remain separate from official paper results.

Reading/revealing is transient and grants no marks/status. The answer is written and locked before the marking UI; each of Principle, Evidence and Evaluation starts at zero. T/D/P require explicit evidence-mode saving. P additionally requires an actual nonfuture date and truth confirmation. D requires a teacher-dataset reference. No observations, dates, results or signatures are manufactured.

## Owner backup and restore

- In Command, use **Export all-module recovery bundle**. It now preserves original Practical Lab JSON bytes with the other existing module snapshots. Core-only **Export JSON backup** remains the existing format and does not include separate module stores.
- For a smaller working backup, use **Export Practical Lab backup** inside the Lab. The private dialog offers Download JSON, Copy exact JSON and the complete read-only text, so browser download restrictions cannot hide the recoverable bytes. Keep owner backups private and off public GitHub/Drive and screenshots.
- **Preview backup import** accepts a Lab backup or extracts only the Lab entry from the all-module bundle. It validates all records and shows counts before replacing the Lab namespace. The explicit Restore button preserves the previous raw bytes in `_recovery`; other modules are never restored/changed by this action.
- Old core-only backups continue through their existing imports. They do not wipe Practical Lab. Restore other full-bundle entries using their existing validated module import paths; the bundle itself is not an automatic cross-module transaction.
- On unreadable progress, edits are blocked and original bytes can be exported. Export first; then a valid Lab import can replace the unreadable namespace with its original raw recovery retained. Storage-unavailable errors remain blocked until browser access is restored.
- Concurrent tab changes block stale writes. Reload before continuing. Quota failures keep the last committed data and display an error; do not clear storage to repair an update.

## Rollback

Redeploy saved Sites **version 29** from `baseline.json` on the same project and audience. No database rollback or localStorage clearing is needed: this release adds no database migration and writes no new fields into old stores. Leave `performance_powerhouse_practical_lab_v3` intact; the old application ignores it, and redeploying the Lab restores access.

The source fallback tag is `pre-practical-lab-v3-20261015`, commit `9ca04aba9e70d8b19685b6c55952d15a9710ae3f`. The pre-change bundle was verified, cloned into an isolated checkout, and its baseline suite rerun. Never force-push old history merely to roll back hosting. Use the native saved-version deployment first. Existing network-first service-worker activation can replace caches but never touches study records; a device offline during rollback may retain its previous shell until it reconnects.

## Privacy and verification limits

Share-safe view removes notes, mode counts, answers, detailed history, repair IDs, backup controls and private import dialogs; its URL strips private chain IDs. It provides no public personal-record export. No Lab progress is sent to the existing optional cloud service. No mandatory account, analytics, backend, subscription or third-party script was added.

The automated suite uses disposable evidence. The remote browser's original site is a clean first-run profile, not the owner’s Android profile. Actual on-device data cannot be inspected or backed up remotely here. Preserve the original device/origin; use its existing owner export for an independent personal copy. Do not label synthetic preservation tests as a direct inspection of that device.
