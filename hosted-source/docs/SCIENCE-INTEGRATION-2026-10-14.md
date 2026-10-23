# Three-subject private intelligence candidate

Status: implemented and tested candidate; **not published** until the owner's required desktop/mobile browser gate and live-production checks can pass.

Production baseline was independently resolved through Sites: existing V8, saved version 23, source commit `6c8802022469150b26f46b466f37b9f080ed5d86`. The production origin, Site identity, public audience, cloud APIs and existing storage namespaces are preserved. No GitHub mirror was treated as deployment source. The native source repository is canonical.

## Implementation

The additive `public/science-intelligence/` route imports a private data package into page memory, without network upload. Private source files and exact private reference data are excluded from the tracked source and public build. A full private backup includes the imported corpus and the learner's local session records. Reopening requires explicit import; browser storage is not used for a multi-megabyte corpus that might crowd out existing progress.

The hub provides subject evidence summaries, atlas-derived annual matrices with selectable Biology source versions, filtered question references and CSVs, Paper II labels kept outside MCQ counts, original v2 teaching practice with post-attempt model cues, a conflict/source desk, and a private optional 2–8-person session protocol. Each participant uses their own copy. There is no invitation, leaderboard, peer record collection or automatic sharing.

All 70 diagnostic positions are indexed across six sets. Exact original-question authentication is still incomplete; source-atlas agreement alone never grants trusted status. The 90-minute sequence and four-week guide are flexible. Retest defaults are +3/+10 days, configurable without creating Calendar events. A session plan or phase change creates no marks, attempt or mastery.

Session evidence uses the isolated `alpp_science_sessions_v1` namespace. Imports preview a merge, preserve existing records, reject conflicting IDs, and never silently overwrite unreadable bytes. Exports remain available after write failure. Concurrent-tab saves compare the previous serialized state. Private data is hidden and mutation paths disabled in share-safe mode. The bridge emits a review file using inspected Notion property names; it does not claim sync or write into canonical Notion databases.

The existing Verification Desk is linked at `/al-performance-command-centre.html#repairs`. A submitted record may link an actually existing core attempt ID; the hub cannot manufacture a core attempt. Existing closure/retention rules remain authoritative.

## Science boundaries

- Biology: earlier, Claude, independent-copy and new candidate distributions all total 350. The new candidate keeps mutation Q32/Q33 in U7 and places 2019 Q40 in U9 after inspecting the original scan and NIE scope. Q50 stays U9. These checks establish classification rationale, not official answer validation. The 2023 Q30 key remains withheld.
- Chemistry: 150 single-pass candidates, 127 source-high, 20 boundary, 3 unclassified. Unknown years remain NOT AUDITED, and zero assignments are not labelled verified zeros.
- Physics: 1,410 references with correct 60/50 denominator boundary; 350 current references and 173 families. The CSVs recompute 76 recurrent/97 singleton families, conflicting with report text 75/98. Both are retained for review. The 2019 Q26/Q35 unit/subtopic cross-links remain flagged.
- The cross-subject research and Claude delivery point to the same spreadsheet. They are not independent corroboration.
- One supposedly practical-PDF source returned unrelated text bytes and was quarantined. A separate actual PDF was used.

## Validation and publication gate

The first complete candidate passed the production build, TypeScript, all 52 tests, real private-corpus validation, legacy recovery/evidence regressions, and DOM-harness import/submit/share checks. Links and IDs are checked. Private IDs and source data are excluded from public assets. Final verification results are recorded in the separate private release dossier.

Supported browser QA is unavailable in this managed environment. The Sites workflow prohibits substituting an improvised browser-control path. Desktop/mobile visual checks, genuine touch/offline browser journeys, and live-production user flows therefore remain unverified. A production HTTP read also returned 403. These are critical gates under the full owner prompt, so no deployment is authorized yet.

Rollback checkpoint: existing saved version 23 and source commit above. Source restoration can be dry-run from its immutable archive without changing production. Production rollback is not executed or claimed.

## Resume

Open the exact saved candidate recorded in the private dossier. Confirm production has not changed. Load the private package locally, then test desktop/Android widths, long labels, focus, all six diagnostic sets, real import/export/recovery, low bandwidth and offline behavior, and old Powerhouse/Tracker/Verification journeys. Resolve any critical defects before deploying that saved version to the existing origin. Keep provisional corpus labels and private-import boundaries. Never publish the source package.
