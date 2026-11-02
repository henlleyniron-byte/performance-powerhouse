# Hosted V22 source verification

The current public source copy is [`hosted-source/`](../hosted-source/), imported on 2 November 2026.

| Identifier | Verified value |
| --- | --- |
| Product | A/L Performance Powerhouse V22 — Latest Attempt Recovery |
| Native source commit | `29314a708c0ab325ad1d9936ad17de747237c222` |
| Saved Site version | 49 |
| Saved version ID | `appgprj_6a68dab7877881919ef39b46aaed6c22~appgver_ec40baff36808191becc48df43b5f8a3` |
| Deployment ID | `appgdep_6ae36b95e4a081918d05d725ffeccbd3` |
| Deployment status | succeeded |
| Deployment completion | 29 October 2026, 15:54:26 UTC |
| Production URL | https://al-performance-powerhouse.phenlleyniron.chatgpt.site/ |

The native source checkout HEAD exactly matched the source recorded for saved Site version 49. That version's deployment status was independently read and confirmed successful. The Site title and package display name identify V22. This establishes source/deployment provenance; it is not a new build or browser acceptance test.

## Public-copy boundary

The snapshot contains 290 tracked source files. Private Google Drive/Docs and contact links are replaced with deterministic `example.invalid/private-resource/` placeholders: 118 occurrences. Five downloadable PDF/ZIP files and two generated Python bytecode files are excluded under the existing public archive policy. The manifest lists every retained file's original Git blob, original SHA-256, public SHA-256, mode and redaction count, and every omission.

All unredacted retained files match the native source bytes exactly. Redacted links deliberately do not open the original resources. Download references may point to omitted files. The repository does not contain user records, credentials, deployed database contents or runtime secrets. Source code includes database schema/migration files, which are not live data. This is a sanitized review/development copy, not a complete production recovery artifact.

Verify from the repository root:

```bash
python scripts/verify-v22-source.py
```

For the current app, work from `hosted-source/`. Its package and lockfile describe the full Vinext/Cloudflare application. Its inherited README describes the starter; the product release behavior is documented in `docs/RELEASE-V22.md` within that folder. `.openai/hosting.json` preserves the existing Site identity for provenance: it does not authorize an arbitrary clone to deploy.

## Checks performed for this synchronization

- Native source Node test subset: 227 passed, 35 skipped, zero failed across 37 test files. Skips are reported, not counted as passes.
- Legacy root service-worker contracts: seven passed, zero failed.
- The full test invocation encountered unavailable LinkeDOM imports at a historical absolute QA path. DOM/browser-dependent acceptance was not completed in this environment. No dependency installation, full build, deployment or live data mutation was performed.
- Direct unauthenticated HTTP retrieval of six live JavaScript files returned HTTP 403; live byte-for-byte HTTP parity could not be checked. Native source and successful deployment provenance were verified instead.
- Manifest verification checks the complete public file inventory, hashes, executable modes and exclusions.

The earlier V16 archive and distinct HenlleyNiron V5.3.0 repository remain preserved. Neither is relabeled V22. This synchronization adds the current hosted source to the existing repository's main branch without replacing the legacy root application.
