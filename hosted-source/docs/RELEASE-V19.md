# Performance Powerhouse V19 — Exact Practice & Recovery

Isolated local candidate based on V18 source `0484b637678e270223a9c18e7c7a5bdeae9c2822`. No commit, source synchronization, audience change or publication was performed by the implementing agent. Root owns the exact final source freeze, full regression/build/browser checks and any GitHub handoff or release decision.

## Concrete change

Paper Observatory now turns the current filtered source inventory into a small private question-locator packet. Existing navigation leads to the same page; its new anchor opens the packet controls. This is an in-page workflow, not another tracker or separate application.

The packet uses the exact subject, exam-year interval, medium and syllabus/variant filters, plus a named-unit and declared-review selection. It accepts 1–20 references and a 5–120 minute planned timebox, using integer validation rather than clamping invalid inputs. Questions are selected deterministically by exam year, exact paper ID and original question number. It never pads a short packet, fabricates aggregate question IDs, or claims randomization, difficulty, freshness, an official time allowance or mastery.

Each selected reference retains its original Q number, question/page locator, paper ID, sitting, year, medium, variant, source label/locator/SHA and both source/question review declarations. The effective review is conservative: a provisional or inherited source cannot become reviewed because a question has a stronger label. Supplied classification rationale is excluded from the attempt packet. The original question and key must be opened and checked separately.

Aggregate-only sources and held/unclassified mappings are excluded from selection, with their counts shown separately. Missing years and incomplete classification coverage remain visible. A filter with only aggregate summaries returns no eligible packet instead of converting a distribution into invented questions. All newly researched private source files remain outside the candidate; the public seed is unchanged.

The private preview and printable/Markdown/compact JSON outputs provide a concrete sequence: verify exact paper/key, attempt closed-book, mark strictly, diagnose one error family, repair and reattempt, then deliberately choose a genuinely fresh transfer and arrange a delayed retest in the existing system. The tool cannot establish prior exposure or award credit. There are no marks, attempt IDs, timer, completion buttons, automatic scheduling or academic storage writes.

## Preservation and privacy

No academic namespace, record schema, source ID, planner, dependency, package script, lockfile or hosting configuration was changed. The existing service-worker asset cache has a V19 revision label. Packet JSON has a distinct export-only schema `al-paper-practice-packet-v1`; it is a planning artifact, not an importable academic backup. Existing dataset JSON/CSV and byte-preserving exact-original File/Blob export retain their guards and schema.

Packets and their previews live only in memory. Changing the dataset, any analysis filter or packet setting invalidates the prepared packet. Export/print handlers compare the current dataset identity and full control signature again, even if a change event has not fired. Share-safe clears the packet DOM, controls and preview and blocks stale handlers. A private→shared→private transition cannot restore the old packet or a pending asynchronous import preview. Returning to private may restore the previously opened dataset under the existing contract; the packet must be built again.

Imported strings are inserted as text nodes, with no links or HTML generated from their content. Markdown renders all supplied metadata as indented literal text, preventing imported headings, links or HTML from becoming active markup. JSON retains literal values. Print is an explicit private action scoped to the packet. Once a user has printed or saved a file outside the page, this page cannot recall that copy.

The inspector also now agrees with known-zero heatmap cells: an absent unit is zero only when its paper's classification is complete and the explicit register includes that unit. Held/incomplete mappings and unregistered units remain unknown. No original data is normalized to obtain that display.

The V18 fail-closed legacy-topic handoff is retained without expanding its record-editing surface in this pass. Users can still use the existing manual log for historical sources that require topic review.

## Agent verification and limits

Focused model and actual-app synthetic DOM tests cover exact selection/sitting/hash identity, medium/variant/year/review boundaries, aggregate/held exclusion, short packets, invalid limits, detached output and original-byte preservation, inert Markdown, stale controls, dataset replacement, Share-safe exports/print, asynchronous privacy transitions and the known-zero inspector. No real visitor data or personal browser profile was accessed.

The first focused run had 26 passes and six fixture failures: the new DOM parser omitted h2/h3 IDs and a Markdown assertion omitted its trusted field-label prefix. Those fixtures were corrected without removing assertions or changing production behavior; the next run passed all 32 focused cases with zero skips. Later validation evidence and any remaining issues belong to the final root QA report. No browser, print-device, native assistive-technology, scientific answer-key or fresh-question certification is claimed by these unit fixtures.

Remaining data limitation: the 1,410-row Physics master ledger is unlocated; inherited annual summaries remain aggregate-only. No historical coverage was invented to make packet selection available. Question source locators and classification/review labels are supplied evidence declarations and still require the user's actual source inspection.
