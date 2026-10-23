# Practical Mastery Lab V3 — validation report

Baseline: existing public Sites version 29, source `9ca04aba9e70d8b19685b6c55952d15a9710ae3f`. The live homepage SHA-256 matched recovered canonical source byte for byte. Historical GitHub README was checked separately and was not used to overwrite production.

| Check | Result | Evidence |
|---|---|---|
| Existing baseline suite | PASS | 86 pass, 46 optional fixture skips, 0 fail |
| Full amended suite | PASS | 100 pass, 46 optional fixture skips, 0 fail (146 tests total) |
| New Lab-specific tests | PASS | 14 tests: catalog/CSV, scoring, modes, chains, storage, offline, recovery and source pages |
| Production build | PASS | Existing vinext build and ESM Worker artifact validator |
| Catalog invariants | PASS | Supplied Draft 2020-12 schema; all 126 unique IDs; counts 38/45/43; number strings |
| Original catalog unchanged | PASS | SHA-256 `3aa5fd03cc9f9ad505e73e9f6420f5a56a8e5d96f2d1a7748cebc0a42dc71677` matches handoff |
| Printed NIE references | PASS | All number/page arrays checked against the three primary handbook contents tables; `source-audit.json` |
| Physics split | PASS | `phy-21-1`, NIE 21.1, p.47; `phy-21-2`, NIE 21.2, p.51 |
| Browser question-first entry | PASS | Search exact ID, open question; no answer initially visible |
| Score persistence | PASS | 0–3 automated round-trips; actual disposable browser 0/3 saved and refreshed |
| Reveal / performance integrity | PASS | No marks on reveal; saved 0/3 remained unset rather than performed; P rejects absent date/confirmation |
| Exact repair isolation | PASS | Separate activities/chains cannot overwrite one another; unrelated core sentinels remain byte-identical |
| Seven-day rule | PASS | Existing verification engine reused; familiar/assisted/early checks rejected; delayed chain tested |
| Backups | PASS with browser limitation | Validated owner JSON was exported via visible exact-text fallback, restored through actual file chooser/import preview and refreshed; re-export was exactly equal. All-module bundle retains Lab raw bytes; old core bytes preserved. Automated remote browser Blob-download capture failed, so native file capture is not claimed as verified. Download link plus copy/read-only JSON remain available. |
| Corruption / quota / concurrent tabs | PASS | Stale writes blocked; previous committed data/recovery unchanged on failure; unknown/future imports rejected |
| Stored HTML injection | PASS | Actual browser imported `<img ... onerror=...>` synthetic note; rendered literally in textarea, no image node and no script/title change |
| Share-safe view | PASS | No notes, answers, mode totals, detailed history, private chain IDs or backup controls visible; private link parameters stripped |
| Responsive layout | PASS | Actual 360px iframe and 768px iframe viewports plus 1363px desktop browser; document scrollWidth equals clientWidth (345/345, 753/753, 1348/1348 after scrollbar). Mobile evidence is a responsive viewport harness, not physical Android emulation. |
| Keyboard / labels | PASS | Enter/Space path for question lock, criteria, submit, details and menus; labelled controls; shared focus rings; responsive readable text. Formal screen-reader/hardware audit not performed. |
| Offline shell/catalog | PASS in executable SW simulation | Full ASSETS install resolves; actual failed fetch returns cached Lab and JSON; activation removes only obsolete app caches; API bypass retained. External PDFs not cached. A real Android installed-PWA upgrade/offline smoke test is not claimed. |
| Rollback source | PASS | Verified pre-change Git bundle; cloned baseline and reran 86 baseline checks successfully |
| Actual owner device records | NOT REMOTELY ACCESSIBLE | Cloud browser starts with a clean profile. No actual Android/private study records were read, modified, published or represented as backed up. Synthetic tests and unchanged old-store code establish the implementation boundary. |
| Post-deployment browser verification | Pending release | Must be recorded in the final release receipt, separate from this source report. |

The 46 skipped checks belong to pre-existing optional private/external study-library or subject fixtures absent in this environment; no failures were hidden as skips. New Lab checks do not depend on those fixtures.

All development browser data is deliberately disposable. No fixture, private backup or responsive harness is included in production assets. Private study data is not added to Git, Drive or screenshots. D1 schema/API sources, the old verification implementation and existing core persistence/import functions were not modified.
