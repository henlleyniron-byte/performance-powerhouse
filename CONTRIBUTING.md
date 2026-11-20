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

Visit the URL printed in the terminal. The preview serves V22’s public assets at their original paths. It serves the community page from `hosted-source/public/community-share.html`. The [source guide](docs/V22_SOURCE.md) distinguishes the original import from later changes, including Biology Academy. Run the legacy root app separately with `python3 -m http.server --bind 127.0.0.1 8080`.

The two downloadable HTML files in `demo/` are generated from the Community Share and Biology Academy pages. After editing either page, its styles or its scripts, run `npm run demo --prefix qa` with QA dependencies installed and commit the regenerated files.

### Test V22

Use Node.js 22.13 or newer and Python 3. Install test dependencies in the QA directory:

```sh
npm ci --prefix qa
python3 scripts/verify-v22-source.py
python3 scripts/verify-v22-source.py --archive
npm test
npm run unit --prefix qa
```

The V22 test command runs the CommonJS and ES module suites, including the DOM tests. It copies the manifest-listed files to a temporary directory and supplies a fictional, allowed-host URL in two positive test fixtures whose original links were redacted. The tests parse the URL locally. Some corpus tests require private resources and report a skip in a public clone.

To run the real-browser checks:

```sh
cd qa
npx playwright install chromium webkit
npm run browser
```

On a minimal Linux machine, use `npx playwright install --with-deps chromium webkit`. The suite starts its own loopback preview on port 4174 and uses disposable browser profiles and fictional records.

To measure retest selection and backup validation on a synthetic history of 5,000 attempts and 10,000 retests, run `npm run bench:evidence --prefix qa`. It checks the selected result and reports the median and range of seven runs on your machine. To compare two revisions, save the earlier `hosted-source/public/evidence-rules.js` as a local file and pass its absolute path after `--`.

### Build the hosted app

From the repository root on Linux, run:

```sh
cd hosted-source
npm run install:ci
npm run build
./node_modules/.bin/tsc --noEmit
npm run lint
python3 ../scripts/verify-v22-source.py --checkout
```

The build validates the Worker entry point and Site manifest. The checkout verifier checks source bytes and executable flags while excluding Git-ignored build products and dependencies. Both the clean-copy and checkout checks reject any of the seven deliberately omitted files. When editing a source file, update its entry in `docs/V22_WORKING_CHANGES.json` with the new SHA-256 and Git mode. Keep the original import manifest intact.

Before a pull request, please check:

1. Main navigation still works.
2. A new attempt can be logged.
3. Repair and retest stages behave correctly.
4. Share-safe mode does not expose private performance values.
5. No browser-console errors are introduced.
6. Relative assets resolve correctly.

## AI-assisted contributions

AI-assisted code is welcome. Contributors remain responsible for reviewing, testing and understanding what they submit. Please disclose substantial AI-generated changes in the pull-request description when useful for review.
