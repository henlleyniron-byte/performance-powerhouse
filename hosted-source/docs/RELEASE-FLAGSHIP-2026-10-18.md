# Powerhouse V12 — Evidence Workspace

The front workspace now makes the existing attempt, marking and repair workflow easier to reach. The earlier dashboard remains available in a disclosure; its records and tools are preserved.

- One existing evidence ledger owns search, subject, type, error and date filtering, editing, correction copying and CSV export. Removed the redundant second filter interface.
- Review shows seven-day or thirty-day subject results with separate raw totals and audited coverage. Actionable due checks respect the transfer prerequisite.
- An explicit summary export supplies aggregate figures to Command Centre. It excludes questions, notes and ratings and is disabled in Share-safe mode. No automatic cross-site data transfer was introduced.
- Storage namespaces, core schema, hosting bindings, project identity and audience remain unchanged.

Validation: production build; 18 existing evidence, recovery and reliability tests; six aggregate contract tests; browser interactions at 1440, 768 and 390 CSS pixels. Synthetic browser records tested filtering, denominator accuracy, due-check gating, summary export and Share-safe behavior. Personal cloud data was not used or changed for testing.

Rollback: the previous source commit and saved Sites version remain available. This release does not migrate the ledger.
