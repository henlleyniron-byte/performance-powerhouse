# Security Policy

## Sensitive information

Do **not** report security issues by posting passwords, access tokens, private student records, financial documents, medical information or other sensitive material in a public GitHub issue.

If a report can be demonstrated without sensitive data, open an issue with the minimum reproducible details. For a vulnerability that cannot safely be disclosed publicly, contact the maintainer privately through the contact method listed on the maintainer's GitHub profile.

## Data model

Performance Powerhouse is designed as a local-first static application. The default project does not require a backend account and stores study state in the user's browser. Any future feature that transmits study data off-device should be treated as a security- and privacy-sensitive architectural change.
