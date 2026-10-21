#!/usr/bin/env python3
"""Write the release report, checksums and PDF/data offline bundle after validation."""
import hashlib,json,pathlib,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1];WORK=ROOT.parent/'practical-v5';BASE=ROOT/'public/practical-lab/clinic';OUT=BASE/'downloads'
qa=json.loads((WORK/'build/qa_summary.json').read_text());pdf=json.loads((WORK/'build/pdf_summary.json').read_text());bank=json.loads((BASE/'practical-lab-v5.json').read_text());combined=json.loads((OUT/'practical-lab-combined-v5.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source=WORK/'input/v4_complete.pdf'
report=f'''# Practical Mastery V5 — Source and QA report

Release: 2026-10-16-v5.0. Final reconciliation completed 17 October 2026 (Sri Lanka).

## What is included

| Component | Count |
| --- | ---: |
| New V5 cases | 126 (Biology 38, Chemistry 45, Physics 43) |
| Preserved V4 cases | 70 (Biology 23, Chemistry 24, Physics 23) |
| Preserved V3.1–V3.3 interactive cases | 51 |
| Interactive questions | 247 |
| Formative rubric marks across the interactive bank | 1,286 |
| New workbook | {pdf['student_workbook_pages']} pages |
| New answer guide | {pdf['model_answer_pages']} pages |
| Correction register and revised earlier cases | {pdf['reconciliation_pages']} pages |
| Historical V4 complete collection | 403 pages |
| Complete V5 collection, including overview cover | {pdf['complete_pages']} pages |

The complete PDF is a reference collection. Use one case at a time in the smaller workbook or interactive clinic. Page count includes retained editions and separate question/answer sections; it is not a measure of mastery.

## Provenance

The attached V4 originals arrived during development and superseded the initial V3.3-only source basis. All 70 V4 IDs, including PM40-P21-2, are preserved. Historical JSON banks remain byte-for-byte unchanged; correction overlays affect the current display and normalized export. Historical private attempts retain their original answer/question text. The complete PDF preserves all 403 V4 pages, marks revised V4 pages and places corrected versions in an earlier appendix. It also applies the documented V3.1–V3.3 text corrections.

SHA-256 of the attached 403-page V4 source: `{sha(source)}`.

## Official source alignment

- [NIE Biology Practical Handbook](https://nie.lk/pdffiles/other/eALOM%20Biology%20Practical%20Handbook.pdf)
- [NIE Chemistry Practical Handbook](https://nie.lk/pdffiles/other/eALOM%20Chemistry%20Practical%20Handbook.pdf)
- [NIE Physics Practical Handbook](https://nie.lk/pdffiles/other/eALOM%20PysicsPracBook.pdf)

All 126 new cases were checked against their activity's official method or observation scope. Broad specimen-identification practicals use supplied feature tables. Stable catalog IDs remain unchanged. Chemistry25 begins on printed78, although the index/catalog says80; V5 records both values explicitly. Chemistry38 has an internal handbook inconsistency between its2-butanol title and butan-1-ol procedure; V5 identifies the discrepancy. Associated enrichment in earlier cases is labelled rather than represented as an exact replication of the handbook method.

## Verification and its limits

- {qa['numeric_checks']} executable arithmetic assertions passed, including original/transferred values, corrected values and legacy checks. This counts assertions, not unique questions. Tolerances and expressions are supplied in `V5_numeric_checks.csv`.
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

'''
for c in bank['corrections']:report+=f"- **{c['question_id']}** — {c['reason']}\n"
(OUT/'V5_Source_and_QA_Report.md').write_text(report)
(OUT/'V5_Release_Summary.json').write_text(json.dumps({'release':bank['release'],'qa':qa,'pdf':pdf,'interactive_questions':combined['question_count'],'total_formative_marks':sum(q['total'] for q in combined['questions']),'site_tests':{'tests':171,'pass':125,'fail':0,'skip':46},'teacher_reviewed':False},ensure_ascii=False,indent=2)+'\n')
files=[p for p in OUT.rglob('*') if p.is_file() and p.suffix!='.zip' and p.name!='V5_SHA256SUMS.txt']+[BASE/'practical-lab-v5.json',BASE/'practical-lab-coverage-completion-v4_0.json']
checksums=''.join(sha(p)+'  '+(str(p.relative_to(OUT)) if p.is_relative_to(OUT) else p.name)+'\n' for p in sorted(files))
(OUT/'V5_SHA256SUMS.txt').write_text(checksums)
with zipfile.ZipFile(OUT/'Practical_Mastery_V5_Offline_Pack.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files+[OUT/'V5_SHA256SUMS.txt']:z.write(p,str(p.relative_to(OUT)) if p.is_relative_to(OUT) else p.name)
with zipfile.ZipFile(OUT/'Practical_Mastery_V5_Offline_Pack.zip') as z:assert z.testzip() is None
print(json.dumps({'complete_pages':pdf['complete_pages'],'zip_files':len(files)+1,'zip_bytes':(OUT/'Practical_Mastery_V5_Offline_Pack.zip').stat().st_size}))
