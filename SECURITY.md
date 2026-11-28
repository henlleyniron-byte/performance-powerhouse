# Security Policy

## Sensitive information

Do **not** report security issues by posting passwords, access tokens, private student records, financial documents, medical information or other sensitive material in a public GitHub issue.

If a report can be demonstrated without sensitive data, open an issue with the minimum reproducible details. For a vulnerability that cannot safely be disclosed publicly, contact the maintainer privately through the contact method listed on the maintainer's GitHub profile.

## Data model and service boundary

This repository contains local and hosted paths. The legacy root application uses browser `localStorage`; the standalone demos run without an account. The GitHub `hosted-source/` V22 snapshot also contains optional ChatGPT sign-in and D1-backed API routes for saving Powerhouse snapshots and Study Tracker data. This is source-code evidence only; issue [#7](https://github.com/henlleyniron-byte/performance-powerhouse/issues/7) tracks reconciliation with the current live Site, so do not assume this snapshot matches production. See the [V22 source guide](docs/V22_SOURCE.md).

The repository snapshot does not contain deployed database contents or runtime secrets. Anyone considering sign-in or cloud sync for personal records should review the live service's current privacy disclosures first. Changes to identity, synchronization, or server-side storage need security and privacy review.
