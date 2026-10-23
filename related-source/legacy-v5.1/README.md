# Performance Powerhouse

**Performance Powerhouse** is a local-first, privacy-conscious study evidence system for Sri Lankan G.C.E. A/L Biological Science students.

Its central question is simple:

> **What is costing marks, and has it actually been fixed?**

The application turns study activity into an evidence loop:

**Attempt → Mark → Diagnose → Repair → Closed-book reattempt → Fresh transfer → Delayed retest**

## Why this project exists

Students often accumulate resources, trackers, notes, and revision plans without proving that a weakness has actually been corrected. Performance Powerhouse is designed around the opposite principle: capture the smallest useful evidence, identify repeated mark loss, repair the narrow cause, and require a later retest before calling the error stable.

## Core features

- Paper / attempt logging with score, time, confidence, guess and error evidence
- Repair prioritisation based on repeated mark loss and unresolved retests
- Explicit closed-book reattempt, transfer-question and delayed-retest stages
- Biology, Chemistry and Physics diagnosis guidance
- Local-first storage in the browser; no backend is required
- Share-safe display mode for demonstrations and screenshots
- JSON backup / restore and migration support from earlier builds
- Installable PWA shell for offline use
- Integrated Physics Intelligence module with aggregate 2000–2025 paper-pattern metadata
- Lightweight study-session tracker

## Quick start

No build process is required.

1. Clone or download this repository.
2. Open `index.html` in a modern browser, or serve the folder with a static web server.
3. Complete the first-run profile.
4. Log a marked attempt and follow the repair loop.

For a local server, one simple option is:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Entry points

- `index.html` — main Performance Powerhouse application
- `community-share.html` — public/share-oriented entry point
- `physics-intelligence/` — aggregate Physics paper-pattern explorer
- `study-tracker/` — local-first study-session evidence tracker

## Privacy model

Performance Powerhouse is intentionally **local-first**. Study records are stored in browser `localStorage` rather than a central server. The repository contains application code and static aggregate datasets, not the maintainer's personal study history.

Share-safe mode is provided to reduce accidental exposure when demonstrating the application. Users should still review screenshots before publishing them.

## Physics Intelligence data

The included Physics Intelligence dataset stores aggregate counts, syllabus/taxonomy labels, years, question references, recurrence metadata, and derived statistics. It does **not** reproduce full exam-question text or answer keys.

See [`docs/DATA_PROVENANCE.md`](docs/DATA_PROVENANCE.md) for the data boundary and limitations.

## Project history

Performance Powerhouse existed and was iterated outside GitHub before this public repository was created. Earlier releases and QA packages were maintained through web deployments and private working archives. The Git history therefore begins with a migration of an already-existing project rather than pretending that the project originated on GitHub.

See [`docs/PROJECT_HISTORY.md`](docs/PROJECT_HISTORY.md).

## AI-assisted development disclosure

The project is maintained by **Henlley Niron Pushparajah** using an AI-assisted development workflow. AI tools are used for implementation, debugging, testing and documentation; project direction, acceptance/rejection of changes, release decisions, maintenance and responsibility for the published result remain with the maintainer.

## Contributing

Bug reports, accessibility improvements, documentation fixes and narrowly scoped study-workflow improvements are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a pull request.

## Security

Do not put personal study records, API keys, passwords, private documents or other secrets in issues or commits. See [`SECURITY.md`](SECURITY.md).

## License

Released under the [MIT License](LICENSE).
