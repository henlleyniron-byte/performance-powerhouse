# V9 Focus & Evidence / Practical Mastery V3.2

Additive release on the existing Sites project `appgprj_6a68dab7877881919ef39b46aaed6c22`. Production origin, audience, D1 binding, authentication, existing local keys and core schema remain unchanged. The historical public GitHub repository is not the controlling deployment source.

## Scope
- Shared public tool directory with keyboard shortcut, four purpose groups, native modal focus handling, consistent navigation and responsive framing across existing modules.
- Question-first workbench; existing timer/cycle, evidence/weekly review and capacity tools grouped in expandable sections. Existing nodes and event handlers are retained.
- Practical Mastery V3.2: 15 graph cases / 5 per subject; V3.1: 24 questions / 8 per subject. Exact supplied static assets; original 126-record V3 catalog unchanged.
- Supplied coordinates, units and plot kinds; accessible coordinate tables; fictional-data and independent-key disclosures. No lab procedures or generated observations.
- Answer submission before key rendering; manual 0–6 / 0–5 formative marking. One-point transfer/delayed checks have their own explicit denominator. Viewing and PDFs award nothing.
- Existing Verification model reused for precise diagnosis, repair, closed-book reattempt, unseen transfer and delayed check (seven-day minimum). Every check belongs to an exact question/error.
- Dedicated versioned browser key `performance_powerhouse_practical_clinic_v32`; no new backend. Clinic records join the existing next-action queue and all-module recovery bundle.
- Core scheduled retests now require an explicit source attempt. Recorded historical completed links replay without mutating the original attempt. Ambiguous historical links cannot close multiple errors.
- Exact-text owner backup fallback, clinic preview/confirm restore, original-byte recovery copy, shared-view clearing and identity redaction.

## Validation
Run `node scripts/validate-clinic.mjs`, `node --test tests/*.test.mjs`, then `npm run build`. The schema script supports every keyword currently used by the supplied lightweight schema and rejects unknown keywords; the runtime model additionally validates all counts, cross-references, numbering, printed pages and coordinates.

Browser QA uses disposable preview-origin data. A zero-score attempt persisted after refresh, and its owner backup was previewed/restored. Shared view hid the answer/history and cleared the backup field. The paper form, explicit source selector and all-module bundle were checked. Phone-width smoke checks cover all twelve workspaces and a graph question. These checks do not access or back up the owner's Android-local records. Optional existing fixture tests remain skipped, rather than reported as passing. Airplane-mode behavior is covered by the existing service-worker cache tests; external Drive PDFs remain online-only.

## Rollback and private backups
Pre-release saved Sites version **30** is `appgprj_6a68dab7877881919ef39b46aaed6c22~appgver_e2bd9fd58b38819186a47a5fc8a25f8c`, commit `e5ddd5be7a56b3e6ebb97699ce8357ca386f58a7`, tag `pre-flagship-v9-version30`. Its private source bundle was verified and restored into a separate checkout; restored HEAD matched exactly. Redeploy that saved version through Sites to roll back. Source rollback alone does not restore a browser's study data.

Before switching devices or recovering data, use Workbench → Export all-module recovery bundle. Keep this owner JSON privately. Practical Lab and Clinic each provide their validated import. Clinic accepts its own JSON or its entry in the all-module bundle; preview the counts before confirmation. The prior clinic bytes remain at the key plus `_recovery`. Core-only backups retain existing import behavior and leave both practical namespaces alone. Never paste owner backups into GitHub or public sharing. Code rollback leaves the new clinic key intact for a later forward release.

## Maintenance
1. Keep `practical-lab-catalog-v3.json` and the 24 `PM-` question IDs immutable. Do not recreate indexes from PDFs.
2. For V3.2 updates, replace the separately versioned graph JSON/schema/index only from a verified supplied release. Preserve `PM32-` IDs and valid original activity references. Retain source and review-status labels.
3. Run the schema/crosswalk script and tests. If schema keywords change, update the validator deliberately; it fails closed on unknown keywords.
4. Update verified Drive PDF links in both Lab and Clinic. Confirm document page counts. Do not embed large PDFs or promise external offline downloads.
5. Add any new static content paths to `sw.js` and change its cache release suffix. Never rename user-storage keys or clear browser data to update content.
6. Use a feature branch and the Sites source helper. Package from the exact pushed commit, save/deploy into the same project, then verify the live UI.

Teacher review of independent questions/answer keys remains outstanding. Formative self-reports are evidence for a chosen weakness, not official marks or whole-topic mastery.
