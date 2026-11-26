# Dependency security review — 27 November 2026

This source-only candidate updates the framework and React Server Components dependencies used by the V22 working tree:

- `next` and `eslint-config-next`: `16.4.1` / `16.2.6` → `16.4.6`.
- `react`, `react-dom`, and `react-server-dom-webpack`: `19.2.8` → `19.3.1`.
- Vite, Vinext, the React Server Components plugin, and the Cloudflare Vite adapter are upgraded together to versions whose declared peer ranges support React `19.3.1`.

The React advisory for unauthenticated remote code execution lists React Server Components `19.2.0` through `19.2.8` and `19.3.0` as affected; `19.2.9` and `19.3.1` are patched. This candidate selects `19.3.1` together with Vinext `1.4.7` and `@vitejs/plugin-rsc` `0.5.39`, whose declared peer ranges support that React line. The earlier V22 adapter pin only supported React `19.2.x`, so updating React alone would have left an unsupported peer combination.

Next.js `16.4.5` is the published security-fix release for the November advisories. `16.4.6` is the latest stable `16.x` package observed for this review and includes the subsequent backported fixes. The lint configuration is aligned to the same Next.js release. The Vite and Cloudflare adapter updates also address the high-severity audit findings on those development/build tools; they are verified as a linked adapter set rather than independent version bumps. The pinned Satori dependency requests `fflate` `0.7.3` exactly, so the candidate uses an npm override to select the compatible patched `0.7.5` release.

After the coordinated update and non-forced npm audit remediation, `npm audit` reports four moderate development-tool findings and no low, high, critical, or production dependency findings. They all flow through Drizzle Kit's legacy `@esbuild-kit` loader; npm offers only a breaking downgrade to `drizzle-kit@0.18.1`, so this candidate retains the current Drizzle Kit 0.31 line. This is residual development-tool risk, not a claim of zero advisories.

This document describes a dependency update in the public working source only. It does not establish which packages are running on a hosted service, whether any advisory is exploitable in a particular deployment, or that production has been patched. The V22 original-import archive and its manifest remain unchanged. Any site deployment or production security claim requires separate verification against the canonical hosting project and its running artifact.

References:

- [React Server Components remote code execution advisory](https://github.com/facebook/react/security/advisories/GHSA-xqc2-xf4c-x3h3)
- [Next.js security advisories](https://github.com/vercel/next.js/security/advisories)
- [Next.js 16.4.6 release](https://github.com/vercel/next.js/releases/tag/v16.4.6)
