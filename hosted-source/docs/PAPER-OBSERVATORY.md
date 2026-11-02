# Paper Observatory: data contract and limits

V18 adds `/paper-analysis/` as an independent, buildless MCQ analysis page. The existing planning interface, academic stores and repair workflows remain available. This page reads no academic browser storage and saves no imported dataset automatically. Its private import is held only in tab memory; export before refresh or closure.

## What the seed establishes

- Physics: 26 inherited annual primary-unit aggregates, 2000–2025, with 1,410 observed MCQs. The denominator is 60 per paper for 2000–2010 and 50 for 2011–2025. These are previously published aggregates, not a newly inspected question ledger. The page does not invent question IDs for them.
- Chemistry: 50 inherited question references for 2025. Original papers and marking schemes were not re-reviewed for these inherited labels during this change.
- Biology: 50 provisional, single-analyst classifications for the English 2019 new-syllabus paper, visually inspected against original question pages and mapped using the primary NIE 2017 syllabus. Q42 remains in an explicit boundary-review bucket. This is not an official unit allocation or verified answer key.

Physics/Chemistry 1980 onward and Biology 2019 onward are the requested scope, not a completed archive. Missing years remain unknown. Original private Drive/Notion documents, OCR, student records and answer keys are not bundled. Source hashes, locators, review labels and limitations are included in the inspectable seed.

## Counting rules

`model.js` validates a bounded `al-paper-observatory-v1` bundle. Read `seed.json` and `tests/paper-analysis.test.cjs` for exact field names and examples. A paper declares its subject, exam year, sitting, medium, syllabus era, expected count, source provenance, review state and either exact question rows or aggregate rows. Duplicate paper identities and question numbers are rejected. Variants and media stay distinct. One medium is selected for comparison.

Heatmaps count each observed question once under its primary unit; secondary-unit inference is not added. Partial mappings are lower bounds. Expected paper size and observed mappings remain separate. An absent unit is zero only when the classifications are complete and its explicit unit register establishes that the unit belongs to that taxonomy. Positive rows under an Unclassified, Unknown, Unresolved or Boundary review primary label keep classification completeness false even if every question number is present. Otherwise an absent unit remains unknown. A valid zero-observed aggregate has an unknown distribution share. Reviewed-only mode excludes inherited and provisional sources. Topic frequency is descriptive, not a prediction, difficulty estimate or measure of student mastery.

Limits are 500 papers, 200 rows per paper, 40,000 total rows, 60 distinct primary-unit labels per subject and 8 MiB of UTF-8 input/canonical JSON. Per-paper counts and year groups are cached for bounded rendering. These limits describe accepted inputs, not guaranteed responsiveness on every device.

## Import, export and privacy

File imports are validated and previewed before explicit replacement. Invalid/unsupported data leaves the opened dataset untouched. Exact-original export uses the original File/Blob, preserving a UTF-8 BOM and original bytes. Current JSON is compact and round-trips through the same validator within its declared budget. CSV cells with formula prefixes are escaped; JSON retains literal text.

Imports never execute imported HTML, URLs or instructions. Strings use text nodes/native controls. The page's CSP restricts scripts/styles/connect sources to itself and denies objects, base changes and form submission. No PHP or third-party runtime was introduced. This is targeted hardening, not a claim of complete security certification.

Share-safe hides imported values and export/import controls, clears previews and invalidates pending asynchronous reads. Handlers check current privacy state again before acting. An import started before a private→shared→private transition cannot reappear as a later preview. Returning to private mode can restore the already opened in-memory dataset. Nothing automatically transfers to Command Centre or Atlas.

## V19: private locator practice packets

The same page can prepare 1–20 exact question references from its current subject/year/medium/variant filters, further restricted by named primary unit and conservative source/question review status. A planned 5–120 minute timebox is a user choice, not an official allowance or running timer. Aggregate summaries cannot supply question numbers. Held labels remain separate; missing years and incomplete classifications remain visible. Original rationale/answer-like fields are not copied into an attempt packet.

The packet retains exact source/page/Q/sitting/hash metadata and provides closed-book attempt, strict marking, diagnosis, repair, transfer and delayed-retest guidance without creating academic records. It is held only in memory, cleared by dataset/filter changes or Share-safe, and export/print handlers recheck current dataset/control identity. Printed/Markdown/compact JSON packets are private user-directed exports; the export-only `al-paper-practice-packet-v1` schema is not an academic backup importer. Every supplied Markdown field is literal indented text.

`packetInventory`, `practicePacket` and `packetMarkdown` are the model entry points. The existing dataset schema, exact-original File/Blob export and CSV safeguards remain. No source papers, new private research packages, answer keys or personal outcomes were added to the seed. See `RELEASE-V19.md` for validation and limitations.

## V20: blank attempt and review worksheets

After preparing an exact-reference packet, choose the closed-book attempt sheet or the separate strict-marking/one-error repair sheet, then prepare its private text preview. Download Markdown or a standalone printable HTML file; open the downloaded HTML and use the browser's Print command. No response is typed into this page. Existing packet JSON v1, locator Markdown and locator printing are unchanged.

The sheets reuse exactly the selected questions and planned timebox. Each source group retains the exact paper ID, sitting, year, medium, variant, source label/locator/hash and declared review. Original Q numbers, page locators and conservative question review remain attached. Neither phase copies supplied topic, primary-unit or rationale fields. Arbitrary supplied source labels/locators can themselves contain cues; the tool cannot authenticate or redact their academic meaning.

The attempt sheet has blank answer, pre-marking confidence, guess and excessive-time fields. The separate review sheet is explicitly **Unverified**. It asks for an independently checked scheme, actual earned/available marks, one observed error, a correction source, prevention rule, closed-book reattempt and deliberately checked transfer/delayed work. It supplies no answer, predicted result, automatic total, date, freshness judgment, completed attempt or mastery credit. Enter real completed evidence manually in the existing ledger/verification desk; no packet identity is automatically remapped into a legacy topic.

`packetWorksheetMarkdown(packet, phase)` and `packetWorksheetHTML(packet, phase)` accept only `attempt` or `review` and derive export strings from a supported packet. No new import schema, persistent store or runtime dependency is introduced. The original dataset and packet stay unchanged. Worksheet readiness is tied to the current packet and phase; all downloads recheck those identities, privacy and pending-import guards. Filter/data changes and Share-safe clear references and preview text. A phase change clears only the derived worksheet and must be prepared again.

Standalone HTML escapes every supplied value, keeps separate trusted field labels, encodes tabs/CR/LF/Unicode separators as text entities and contains no scripts, links, forms or external resources. Its CSP denies network/resource loads, base changes and form submission while permitting its embedded print styles. Markdown uses separate indented literal blocks and explicitly normalizes CR/CRLF/Unicode separators. Both printable formats display unpaired UTF-16 code units as visible `\uXXXX` escapes to avoid silent UTF-8 replacement; original packet JSON remains the exact string representation. A generated download is not proof of a saved or printed copy. See `RELEASE-V20.md` for verification and limits.

## Continued research and verification

The release report records model, real-browser, import, byte-preservation, Share-safe, keyboard and mobile checks. Synthetic fixtures establish implementation behavior; they cannot authenticate a national paper, marking key or scientific classification. Additional privately researched Biology and Chemistry datasets remain separate until deliberately reviewed. Before adding them to the public seed, verify redistribution rights, actual paper headers/medium, complete question ranges, duplicate/variant identity, era mapping and unresolved unit boundaries. Preserve rejected source evidence and never turn OCR citation counts into verified topic counts.
