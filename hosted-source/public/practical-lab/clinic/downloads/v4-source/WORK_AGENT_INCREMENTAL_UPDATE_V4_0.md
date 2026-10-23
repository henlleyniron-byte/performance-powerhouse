# Practical Mastery V4.0 – incremental instructions (Coverage Completion)

Continue the existing website build. Do not replace or redesign the running site; do not touch existing private localStorage records.

Inputs: `practical-lab-coverage-completion-v4_0.json` (70 five-mark questions, IDs PM40-B01…B37, PM40-C01…C43, PM40-P03…P42; the number is the NIE practical number), `V4_0_QA_ledger.csv`, `V4_0_numeric_checks.csv`, `practical-coverage-map-v4_0.csv`, and the V4.0 PDF.

1. Back up current state; test on disposable sample data only.
2. Load the V4.0 bank as a separate read-only dataset. Keep the 126 catalogue activities and all PM-, PM32-, PM33- questions untouched.
3. Link each item via `activity_id` (bio-001 … phy-21-2). After loading, every one of the 126 activities must have at least one linked data-driven question (see coverage map).
4. Lock the five mark points until a student submits an attempt; private 0–5 score; transfer question is a separate attempt.
5. Show the labels `fictional-dataset` and `independent-not-teacher-reviewed` on every item.
6. Add non-destructive correction badges from the V4.0 corrections register: PM-P03 (k ≈ 9.96), PM-P04 (use 0.17 m / 0.52 m), PM33-B01 (RQ 0.80 = protein or mixed substrate), PM-B05 (≈0.307 mol dm⁻³). Preserve IDs and saved attempts.
7. Render tables, superscripts and subscripts correctly (UTF-8). Never copy fictional values into a lab-record field or mark an activity as Performed.
8. Regression tests: ID uniqueness, 5 marks per item, activity links resolve, score bounds, backup/restore, offline mode, privacy, no regressions in existing engines.
9. Stage first; deploy only through the owner-controlled production source; supply rollback steps and a short test report.

Quality disclosure: numeric checks (183 values) are code-verified; teacher/subject-expert review is still pending. Items are hypothetical data-analysis exercises, not official NIE/DoE marking schemes.
