# Study-flow upgrade candidate — 14 October 2026

Status: implemented, built and automatically tested; **save only**. The Science integration release remains subject to the owner's desktop/mobile browser and production-flow acceptance gate. Browser control is unavailable in this managed environment. Do not deploy this candidate by interpreting the absence of a test environment as a passing visual test.

The source branch started from saved version 24, commit `d460c96fa3793311122f662ba88fff6aea7f58a3`. Version 24 itself is an unpublished candidate. The established published rollback is version 23, commit `6c8802022469150b26f46b466f37b9f080ed5d86`, saved version `appgprj_6a68dab7877881919ef39b46aaed6c22~appgver_7556693e1bdc8191a7430e0b8f0991b5`. Current origin and public audience remain unchanged.

## Added behavior

- Command's next-action desk reads existing due core retests and recent marked errors. It skips core errors with a retained Verification chain, where that chain is present. It performs no writes to source ledgers and creates no new evidence.
- An all-module recovery export captures exact original browser bytes from Command, Physics, Chemistry, Biology, Science sessions, Verification, timetable and Study Tracker. Malformed bytes are retained; denied reads are reported. This is a recovery container, not an automatic all-module restore. Existing validated import controls remain the restoration path. A private corpus held only in another open tab must still be exported from that Science tab.
- Science sessions can resume an existing saved phase or explicitly close a plan. Closing is planning state only. A per-stage timer supports start/pause/reset, uses elapsed wall time and never logs minutes or completion. It resets on reload or a phase switch. Stage budgets are editable; the seven defaults total 90 minutes.
- Scheduled checks are shown separately from mastery. Only clean delayed checks explicitly linked to a baseline record can clear one planned check; a single check cannot clear both intervals. A failure remains visible as repair work. Older records without links continue to load and remain unresolved until reviewed. Verification Desk's seven-day independent-chain gate remains unchanged.
- New evidence rejects future dates and cross-subject/missing baseline links. An optional Command link must match subject, date, marks and guessed count.
- Chemistry/Biology practice logs compare original stored bytes before a save so an older tab cannot overwrite a newer copy. Conflict copies remain exportable. Their original namespace/schema is preserved. Known item IDs can be opened directly from the next-action desk. Imports allow valid logs up to 50 MB rather than producing exports too large for the previous 5 MB limit.
- Study Tracker's complete export additionally includes raw Science, Verification and timetable snapshots.

## Validation and limits

Powerhouse: 62 automatic tests passed with no skips, including real private-package tests for 1,910 references and 70 diagnostic positions, guarded imports, denominator states, evidence dates, explicit retest links, clock arithmetic, session resume/close, share-safe entry and unreadable-byte recovery. Production build, TypeScript and whitespace checks passed. Local HTML IDs and script/style paths were checked. Private source identifiers were checked absent from served assets.

These tests establish structural reconciliation and software behavior, not independent scientific authentication of every paper, classification or answer. The private package is unchanged and excluded from the repository/public bundle. No new source claims were upgraded to official verification. Browser layout, real touch navigation, offline journeys and genuine live-production flow checks remain unavailable.

Required next gate: inspect the saved candidate at desktop and Android widths, import the private package, exercise session resume/timer/retests, inspect Command's next-action desk, round-trip validated module backups, and verify existing Tracker, core, Physics and Verification journeys. Preserve version 23 as rollback. Publish only after this required gate passes.
