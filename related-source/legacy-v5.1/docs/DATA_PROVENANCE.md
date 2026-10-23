# Physics Intelligence — Data Boundary and Provenance Notes

The `physics-intelligence` module is an aggregate analysis layer for Sri Lankan G.C.E. A/L Physics paper patterns.

## What the repository stores

The packaged JSON contains items such as:

- paper year and question-count totals;
- primary syllabus-unit counts and percentages;
- taxonomy labels / subtopic identifiers;
- question references in the form `YEAR Q<number>`;
- recurrence counts and paper-hit rates;
- derived descriptive statistics;
- question-family labels created for analysis.

It does **not** contain full exam-question text or answer keys.

## Interpretation boundary

Historical frequency is descriptive evidence, not an exam prediction. The project's own data model explicitly distinguishes revision opportunity from guaranteed future weighting or exam probability.

## Source-material boundary

This repository publishes the derived aggregate dataset and taxonomy, not copies of underlying examination papers. Users who need the original questions should obtain them from an authorised or otherwise lawful source.

## Corrections

If you identify a classification error, open an issue with the year, question reference, current classification and proposed correction. Do not paste an entire copyrighted paper into the issue.
