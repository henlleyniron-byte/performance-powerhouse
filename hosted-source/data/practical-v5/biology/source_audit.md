# Biology V5 source and scientific audit

## Source inspected

- Official NIE Biology Practical Handbook, effective from 2017.
- URL: https://nie.lk/pdffiles/other/eALOM%20Biology%20Practical%20Handbook.pdf
- Web retrieval: official PDF opened successfully (61 PDF pages). Direct PDF retrieved and inspected with PyMuPDF.
- All 38 activity bodies (objectives, materials and instructions) inspected, not merely the contents index.
- Handbook printed page 1 corresponds to PDF page 11 (1-based).
- Exact official activity titles extracted from activity bodies with whitespace normalised; No.21 subheading excluded from the main title.
- Original catalogue IDs retained exactly: bio-001 through bio-038.
- No claim of teacher review. All 38 cases remain independent_model_teacher_review_pending.
- Tables are original fictional exercise data or concrete representative feature inventories. Lookup potentials in B20–B21 are explicitly identified as source lookup values rather than fictional observations.
- No laboratory operating procedures, culturing recipes, incubation parameters or hazardous handling instructions included. No.35 uses broad method identification only.

## Scientific decisions and corrections

1. B01: starch can itself yield reducing sugars after complete acid hydrolysis. Its fictional after-hydrolysis Benedict result is therefore positive; identifying a non-reducing sugar requires using the initially negative sample B, not any post-hydrolysis positive alone.
2. B03/B10: cell wall alone does not diagnose plant cells; cyanobacterial photosynthetic membranes are not chloroplasts.
3. B04: chromosomes counted by centromeres; post-meiosis-I chromosomes still comprise sister chromatids.
4. B05: 1/t is a relative rate index. A missing endpoint is not an exact zero; sampling interval limits precision, and the fastest tested treatment does not prove the precise optimum.
5. B06: oxygen output is a net proxy; no inverse-square assumption or unique limiting-factor diagnosis is imposed.
6. B07: typical Kranz versus dorsiventral anatomy is explicitly representative, not a universal claim.
7. B08: no-absorbent contraction is oxygen consumed minus carbon dioxide produced. RQ 0.80 is not called proof of fat respiration.
8. B09: cyanobacteria are bacteria; the handbook comparison wording must not create a false domain distinction. Lyngbia source spelling is explained as Lyngbya.
9. B12/B13: taxonomy follows the source syllabus. Traditional fungal groups are not advertised as a current exhaustive taxonomy. Genus features are interpreted within restricted candidate sets.
10. B16: xylem and phloem are complex tissues; not all xylem cells are dead.
11. B18: annual ring periodicity is supplied as a condition; ring count is not automatically whole-tree age.
12. B20: 50% plasmolysis and approximately zero pressure potential support an estimated median cell solute potential, not an identical value for every cell.
13. B21: official potato method uses LENGTH, not mass. Zero length change estimates tissue WATER potential; it is not the 50%-plasmolysis criterion.
14. B22: capillary volume = area × distance; uptake is a transpiration proxy, not exact identity.
15. B25: artery/vein defined by direction relative to heart; ventricular output is not assumed unequal.
16. B26: respiratory counts with unequal durations are normalised; fictional response is not a clinical test.
17. B30: cochlea versus semicircular canals distinguished; pupil is an opening, iris regulates aperture.
18. B35: sterilisation distinguished from disinfection; filtration removes rather than necessarily kills microorganisms. Broad method categories only.
19. B36: colony morphotypes do not establish species count; colonies need not originate from one cell; blank appearance does not prove universal sterility.
20. B37: methylene-blue SIMPLE staining does not establish Gram reaction; preparation artefacts and scale-bar interpretation assessed.
21. B38: retained the official treated/untreated colony-count comparison. Did not substitute disc diffusion. Relative count reduction is not equivalent to percentage of all microbes killed.

## Verification results

- Cases: 38; unique IDs: 38; unique mapped activity IDs: 38.
- Every case has five explicit tasks and five corresponding one-mark points: True.
- Arithmetic expressions evaluated successfully: 38.
- Formula checks use simple Python arithmetic without external state.
- Content reviewed across all 38 cases for method alignment, biological plausibility, inference limits and task/mark correspondence.
- Some taxonomy and representative anatomy reflect the 2017 handbook syllabus and are explicitly scoped accordingly.
- No teacher/official marking-scheme validation performed. Source alignment and arithmetic checking are not a substitute for that review.

## Activity verification ledger

| Case | Catalogue ID | Official no. | Printed pages inspected | Status |
|---|---|---:|---|---|
| PM5-B01 | bio-001 | 1 | 1–1 | method_checked |
| PM5-B02 | bio-002 | 2 | 2–3 | method_checked |
| PM5-B03 | bio-003 | 3 | 4–4 | method_checked |
| PM5-B04 | bio-004 | 4 | 5–5 | method_checked |
| PM5-B05 | bio-005 | 5 | 6–6 | method_checked |
| PM5-B06 | bio-006 | 6 | 7–7 | method_checked |
| PM5-B07 | bio-007 | 7 | 8–8 | method_checked |
| PM5-B08 | bio-008 | 8 | 9–9 | method_checked |
| PM5-B09 | bio-009 | 9 | 10–10 | method_checked |
| PM5-B10 | bio-010 | 10 | 11–11 | method_checked |
| PM5-B11 | bio-011 | 11 | 12–12 | method_checked |
| PM5-B12 | bio-012 | 12 | 13–13 | method_checked |
| PM5-B13 | bio-013 | 13 | 14–14 | method_checked |
| PM5-B14 | bio-014 | 14 | 15–15 | method_checked |
| PM5-B15 | bio-015 | 15 | 16–16 | method_checked |
| PM5-B16 | bio-016 | 16 | 17–17 | method_checked |
| PM5-B17 | bio-017 | 17 | 18–18 | method_checked |
| PM5-B18 | bio-018 | 18 | 19–19 | method_checked |
| PM5-B19 | bio-019 | 19 | 20–20 | method_checked |
| PM5-B20 | bio-020 | 20 | 21–23 | method_checked |
| PM5-B21 | bio-021 | 21 | 24–26 | method_checked |
| PM5-B22 | bio-022 | 22 | 27–27 | method_checked |
| PM5-B23 | bio-023 | 23 | 28–28 | method_checked |
| PM5-B24 | bio-024 | 24 | 29–29 | method_checked |
| PM5-B25 | bio-025 | 25 | 30–30 | method_checked |
| PM5-B26 | bio-026 | 26 | 31–31 | method_checked |
| PM5-B27 | bio-027 | 27 | 32–32 | method_checked |
| PM5-B28 | bio-028 | 28 | 33–33 | method_checked |
| PM5-B29 | bio-029 | 29 | 34–34 | method_checked |
| PM5-B30 | bio-030 | 30 | 35–35 | method_checked |
| PM5-B31 | bio-031 | 31 | 36–36 | method_checked |
| PM5-B32 | bio-032 | 32 | 37–37 | method_checked |
| PM5-B33 | bio-033 | 33 | 38–39 | method_checked |
| PM5-B34 | bio-034 | 34 | 40–40 | method_checked |
| PM5-B35 | bio-035 | 35 | 41–42 | method_checked |
| PM5-B36 | bio-036 | 36 | 43–44 | method_checked |
| PM5-B37 | bio-037 | 37 | 45–46 | method_checked |
| PM5-B38 | bio-038 | 38 | 47–47 | method_checked |

## Local source integrity

- Downloaded official PDF SHA-256: `617789a075071ece481dbd5758d1b4aa775e4f6440b8c9753e0a7a80eb628a25`.
- Cases JSON SHA-256: `4e15ba4b89e953b561d7d5c485d17ecb8547daa0209933d4e80349f8f833f4a1`.

These are intermediate authoring files. Parent agent is responsible for durable saving, final document rendering, and site integration.
