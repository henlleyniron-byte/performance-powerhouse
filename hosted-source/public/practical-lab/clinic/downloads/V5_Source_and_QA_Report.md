# Practical Mastery V5 — Source and QA report

Release: 2026-10-16-v5.0. Final reconciliation completed 17 October 2026 (Sri Lanka).

## What is included

| Component | Count |
| --- | ---: |
| New V5 cases | 126 (Biology 38, Chemistry 45, Physics 43) |
| Preserved V4 cases | 70 (Biology 23, Chemistry 24, Physics 23) |
| Preserved V3.1–V3.3 interactive cases | 51 |
| Interactive questions | 247 |
| Formative rubric marks across the interactive bank | 1,286 |
| New workbook | 137 pages |
| New answer guide | 137 pages |
| Correction register and revised earlier cases | 78 pages |
| Historical V4 complete collection | 403 pages |
| Complete V5 collection, including overview cover | 756 pages |

The complete PDF is a reference collection. Use one case at a time in the smaller workbook or interactive clinic. Page count includes retained editions and separate question/answer sections; it is not a measure of mastery.

## Provenance

The attached V4 originals arrived during development and superseded the initial V3.3-only source basis. All 70 V4 IDs, including PM40-P21-2, are preserved. Historical JSON banks remain byte-for-byte unchanged; correction overlays affect the current display and normalized export. Historical private attempts retain their original answer/question text. The complete PDF preserves all 403 V4 pages, marks revised V4 pages and places corrected versions in an earlier appendix. It also applies the documented V3.1–V3.3 text corrections.

SHA-256 of the attached 403-page V4 source: `4f5f94fff63ebd94472adbc0b28087e841f6d6083d31e73c0ae19faa074dd569`.

## Official source alignment

- [NIE Biology Practical Handbook](https://nie.lk/pdffiles/other/eALOM%20Biology%20Practical%20Handbook.pdf)
- [NIE Chemistry Practical Handbook](https://nie.lk/pdffiles/other/eALOM%20Chemistry%20Practical%20Handbook.pdf)
- [NIE Physics Practical Handbook](https://nie.lk/pdffiles/other/eALOM%20PysicsPracBook.pdf)

All 126 new cases were checked against their activity's official method or observation scope. Broad specimen-identification practicals use supplied feature tables. Stable catalog IDs remain unchanged. Chemistry25 begins on printed78, although the index/catalog says80; V5 records both values explicitly. Chemistry38 has an internal handbook inconsistency between its2-butanol title and butan-1-ol procedure; V5 identifies the discrepancy. Associated enrichment in earlier cases is labelled rather than represented as an exact replication of the handbook method.

## Verification and its limits

- 624 executable arithmetic assertions passed, including original/transferred values, corrected values and legacy checks. This counts assertions, not unique questions. Tolerances and expressions are supplied in `V5_numeric_checks.csv`.
- All 126 new cases have a one-to-one activity mapping, five tasks, five marking points and explicit fictional/review-pending labels.
- All 70 V4 cases were independently inspected.38 receive corrections or clarifications:12 Biology, 18 Chemistry, 8 Physics. This is not a claim that38 cases had wrong arithmetic; their calculated results were correct at stated rounding, while scientific claims and assumptions needed work.
- The 51 earlier machine-readable cases were reviewed. The full historical 346-page core was retained; this release does not claim a new exhaustive teacher audit of every historical paragraph or of the 18 core examples that are absent from the machine-readable banks.
- Site regression suite: 171 tests, 125 passed, 0 failed, 46 skipped. Skips are existing fixture/private-corpus dependent tests and do not count as passes.
- Disposable interaction checks cover answer-first marking, genuine zero scores, saved drafts, stale-tab protection, unreadable-record recovery, share-entry privacy and old-record compatibility. They do not inspect the owner's actual device records.
- Both 137-page new PDFs contain exactly 126 unique case headers. Programmatic page-boundary checks passed. Representative covers, indexes, subject questions, answers, correction pages and patched historical pages were rendered and visually inspected.
- A full interactive browser/mobile visual test was unavailable in this execution environment. DOM-level tests are not represented as browser tests.
- Qualified teacher/subject-expert review remains pending. This is independent AI-assisted educational material, not an official NIE/DoE marking scheme. No fictional result certifies laboratory performance.

## Site behavior

The existing Performance Powerhouse origin, project, public audience, D1 binding and all existing data namespaces are retained. The V5 clinic adds subject, edition, activity, search and private-state filters; per-activity entry links; continue-next-case; unfinished answer drafts; answer-first marking; and readable correction/source notes. Private marks and recovery bytes remain browser-local. No account, paid service, database migration or analytics was added.

The original clinic store is `performance_powerhouse_practical_clinic_v32`, schema `powerhouse-practical-clinic-v1`, version 1. Reattempt, fresh transfer and delayed-retention checks use the existing exact-error chain. A qualifying delayed check requires at least seven days after successful fresh transfer. Downloads, reveals and app visits award nothing.

The PWA caches the app shell and question data after a successful update. Large PDF/ZIP files are not pre-cached: download them separately. The ZIP is a PDF/data/audit bundle, not an installable replacement app.

## Rollback and maintenance

The pre-change saved Sites version is33, source commit `7aca80dba638226ed0a9c9f5a21f415877c7b0be`. Roll back hosting through that saved version on the same project and audience; do not clear localStorage or roll back a database. Existing V5 attempt bytes should be preserved even if an older clinic cannot display their newer question IDs. Re-publish V5 to recover access, or export original recovery bytes before any deliberate import. Never truncate unknown records to fit an old bank.

Rebuild instructions and editable subject sources are in the site repository under `data/practical-v5/` and `scripts/`. Original uploads are untouched. The release checksum list excludes the ZIP and itself to avoid recursive hashes.

## Correction register

- **PM-P03** — Corrected spring constant rounding: using the mean T²/m gives 9.95735 N m⁻¹, hence 9.96 to three significant figures. Historical attempts retain their original text.
- **PM-P04** — The earlier 0.18 m and 0.53 m first/second lengths implied a negative end correction. V5 uses 0.17 m and 0.52 m: the same spacing and speed, with a physically valid +0.005 m end correction.
- **PM33-B01** — RQ = 0.800 does not specifically identify fat. Protein or mixed-substrate oxidation can produce this value. Corrected the spelling of “Inferring”.
- **PM-B05** — Refined the earlier near-0.30 estimate by explicit linear interpolation to 0.307 mol dm⁻³; uncertainty and model limits remain.
- **PM32-C04** — Made the joule-to-kilojoule conversion explicit; the earlier final numerical answer was correct.
- **PM33-C02** — Made the joule-to-kilojoule conversion explicit; the earlier final numerical answer was correct.
- **PM40-B01** — Avoid absolute absence claims from qualitative negative tests.
- **PM40-B09** — Scope the observation limit to the supplied routine images.
- **PM40-B11** — Replace an unlisted genus with the handbook-listed Ulva for exact specimen-set alignment.
- **PM40-B15** — Supply discriminatory bony-fish evidence so the identification reaches the official class level.
- **PM40-B16** — Correct false causal and universal statements about lignification and cell viability.
- **PM40-B18** — Distinguish complex secondary xylem from its dead elements and clarify what the ring-width sum represents.
- **PM40-B27** — Correct comparative excretory/osmoregulatory functions without making unsupported evolutionary claims.
- **PM40-B28** — Specify a monosynaptic model so the anatomical pathway matches the single delay and preserve correct arithmetic.
- **PM40-B30** — Separate geometric aperture ratio from light flux under different illumination.
- **PM40-B34** — State perpendicular lever arms and remove an incorrect statics rule.
- **PM40-B36** — Clarify statistical counting terminology and evidence limits; preserve correct calculation.
- **PM40-B37** — State what fixed stained images establish without an unsupported viability guarantee.
- **PM40-C01** — Qualify evidence and state assumptions behind v=E/B.
- **PM40-C06** — Make gas-pressure and Ar versus molar-mass assumptions explicit.
- **PM40-C10** — Parenthesise the full wavelength denominator; no final numerical change.
- **PM40-C11** — Repair the unsupported unique identification without inventing extra observations.
- **PM40-C12** — Qualify the scope of the negative control.
- **PM40-C13** — Limit acidification claim to acid-reactive interferences; halide assignments and AgF transfer are correct.
- **PM40-C15** — Clarify ideal recovery assumption versus real experimental limitations.
- **PM40-C16** — State assumptions required for the supplied Ksp-to-solubility conversion.
- **PM40-C24** — State acyclic candidate scope so ring strain does not defeat the identification.
- **PM40-C25** — Clarify initial product and reaction-condition scope; original page error documented separately.
- **PM40-C26** — Distinguish carbonate protonation stages and state pH approximation assumptions.
- **PM40-C27** — Make the candidate/test-validity assumptions explicit before identifying functional-group classes.
- **PM40-C28** — Repair initial-versus-equilibrium acid concentration notation.
- **PM40-C29** — Qualify stability statement to the supplied aqueous practical context.
- **PM40-C40** — Use measuredE instead of unjustifiedE°; display unrounded conversions and precise reference cancellation.
- **PM40-C41** — Correct saltingout explanation and remove misleading premature-rounding substitution.
- **PM40-C42** — Replace guaranteed thermal protection and one-direction yield claim with defensible limits.
- **PM40-C43** — Clarify chemically distinct effects of water and free fatty acids.
- **PM40-P21-2** — The original contact-lens calculation is numerically correct but is a different experiment from NIE21.2. Printed51–52 uses one concave lens and a virtual image located by no parallax, not a convex/concave pair in contact.
- **PM40-P27** — “Dry ice” conventionally means solid carbon dioxide, which is not the substance in this water-ice fusion experiment. Replace with water ice whose surface meltwater was removed.
- **PM40-P29** — For the standard onset/disappearance bracket without an explicit lag model, condensation appears at the lower temperature on cooling and disappears at the higher temperature on warming. Original labels were reversed; mean and RH values are unchanged.
- **PM40-P36** — The stated fixed-VCE dataset does not justify claiming the transistor necessarily approaches saturation as current rises.
- **PM40-P39** — The arithmetic is correct, but the old answer infers viscosity under a laminar model and then uses that inferred value to assert laminar validity. Reynolds-number thresholds are absent from this handbook method; use its Q-versus-head evidence criterion. Radius dominance also requires comparison with other uncertainties.
- **PM40-P41** — The numerical meniscus correction is correct but is not part of the basic NIE41 body method, which uses measured h directly. Label it as a supplied extension. No height uncertainty is given, so radius cannot be declared the dominant contributor unconditionally.
- **PM40-P40** — “Grease or detergent lowers gamma” overgeneralises the effect of grease: it can alter the contact angle rather than simply changing the liquid surface tension.
- **PM40-P42** — Maximum bubble pressure occurs at the approximately hemispherical bubble stage, not necessarily just before detachment. Preserve the maximum-pressure criterion without identifying it with breakup.
