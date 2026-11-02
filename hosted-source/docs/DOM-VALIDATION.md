# Optional DOM interaction tests

The repair-board and verification-draft DOM tests use linkedom 0.18.12 from a temporary test-only installation. They are enabled with DOM_QA_PACKAGE pointing to that package's esm/index.js. When it is absent, these checks are explicitly skipped. Existing core evidence and regression tests require no extra package.

The harness supplies missing native select, dialog and FormData behaviour. It exercises the application's real event handlers against synthetic records. It does not verify pixels, browser layout, browser downloads, clipboard permissions or native focus semantics. Never report it as browser QA.
