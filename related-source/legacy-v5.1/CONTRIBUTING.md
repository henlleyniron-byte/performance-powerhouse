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

The project is intentionally static and dependency-light. A local web server is sufficient for normal development:

```bash
python -m http.server 8080
```

Before a pull request, please check:

1. Main navigation still works.
2. A new attempt can be logged.
3. Repair and retest stages behave correctly.
4. Share-safe mode does not expose private performance values.
5. No browser-console errors are introduced.
6. Relative assets resolve correctly.

## AI-assisted contributions

AI-assisted code is welcome. Contributors remain responsible for reviewing, testing and understanding what they submit. Please disclose substantial AI-generated changes in the pull-request description when useful for review.
