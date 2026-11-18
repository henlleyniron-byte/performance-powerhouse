# Contributing

Thank you for considering a contribution to Performance Powerhouse.

## Good contribution targets

- Reproducible bugs
- Accessibility and mobile usability
- Privacy / share-safe behaviour
- Data-export / migration reliability
- Documentation clarity
- Small improvements that strengthen the Attempt → Mark → Diagnose → Repair → Reattempt → Transfer → Retest loop

## Please avoid

- Adding large resource libraries or copyrighted exam-question dumps
- Turning the project into a general productivity dashboard
- Adding server-side collection of student records without an explicit privacy design
- Committing credentials, personal study records, financial documents or private communications

## Development

For the current V22 browser app, start the local server from the repo root:

```sh
python3 scripts/preview-v22.py
```

Visit the URL printed in the terminal. The preview serves V22’s public assets at their original paths. It reads the community page from `preview/community-share.html`. The archived V22 files and their provenance are described in the [source guide](docs/V22_SOURCE.md). Run the legacy root app separately with `python3 -m http.server --bind 127.0.0.1 8080`.

### Test V22

Use Node.js 22.13 or newer and Python 3. Install test dependencies in the QA directory:

```sh
npm ci --prefix qa
python3 scripts/verify-v22-source.py
npm test
npm run unit --prefix qa
```

The V22 test command runs the archived CommonJS and ES module suites, including the DOM tests. Some corpus tests require private resources and report a skip in a public clone.

To run the real-browser checks:

```sh
cd qa
npx playwright install chromium webkit
npm run browser
```

On a minimal Linux machine, use `npx playwright install --with-deps chromium webkit`. The suite starts its own loopback preview on port 4174 and uses disposable browser profiles and fictional records.

Before a pull request, please check:

1. Main navigation still works.
2. A new attempt can be logged.
3. Repair and retest stages behave correctly.
4. Share-safe mode does not expose private performance values.
5. No browser-console errors are introduced.
6. Relative assets resolve correctly.

## AI-assisted contributions

AI-assisted code is welcome. Contributors remain responsible for reviewing, testing and understanding what they submit. Please disclose substantial AI-generated changes in the pull-request description when useful for review.
