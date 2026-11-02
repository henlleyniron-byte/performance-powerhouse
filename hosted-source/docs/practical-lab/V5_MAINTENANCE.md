# Practical Mastery V5 maintenance

Read the existing MAINTENANCE.md and owner instructions. This supplements them for the V5 clinic, not a replacement policy for unrelated modules.

- Keep raw V3.1–V4 JSON unchanged; add explicit bounded corrections to the V5 ledger. Preserve all IDs, including PM40-P21-2. Current bank:126 new V5 +70 V4 +12 V3.3 +15 V3.2 +24 V3.1 =247 questions,1,286 formative marks.
- Edit subject JSON in data/practical-v5/, rerun scripts/assemble-practical-v5.py, scripts/export-practical-v5.mjs and scripts/build-practical-v5-pdfs.py, inspect PDF layouts, then scripts/package-practical-v5.py. The PDF builder requires the attached403-page V4 source in the documented scratch input location; its hash is in the release report. Do not silently substitute another edition.
- Validate source activity methods and numerical assertions. A pass is not teacher approval. Teacher review remains pending. Keep associated enrichment and reference discrepancies explicit.
- The old clinic namespace/schema/version remain unchanged. Drafts are an optional root property. Loading/revealing creates no attempt. Preserve arbitrary original bytes on unreadable storage; require export before recovery replacement, and block stale-tab writes. Test with disposable records only.
- Share entry must read no private store. Share mode removes owner controls, answer fields, detailed history and chain IDs. Do not send private attempts to any public download or source file.
- PWA assets include V4/V5 JSON and app code, not PDFs/ZIP. Keep the cache release bumped when content changes. Host downloads at the same origin and link them from the clinic; do not alter old Drive links or sharing without a separate need.
- Run node --test tests/*.test.mjs and the supported Sites build before packaging. Existing fixture-related skips remain disclosed. Managed Linux without control-browser cannot provide interactive browser visual QA; do not improvise a browser installation.
- Pre-V5 rollback: same project's saved Sites version33. Never clear localStorage or migrate D1 to roll back a content release. Preserve newer attempt bytes even when older banks cannot display their IDs. Restore V5 to recover access.
