# Biology Academy in Performance Powerhouse

Open **Biology Academy** from the dashboard navigation or **Practise in Biology Academy** from the Biology tab. The hosted Powerhouse also lists it under **Explore tools → Subjects**. Both source layouts include the academy at `biology-academy/`. The hosted source adds a link to the existing Biology Intelligence paper explorer.

The ten tracks sample competencies from all ten units of the [published NIE Biology syllabus](https://nie.lk/pdffiles/tg/AL_Syl%20Biology2017.pdf). Each track includes a conceptual prediction exercise with three choices, a five-option MCQ with feedback for every answer, a structured response with three practice marking points, and a fresh transfer question. The questions, explanations, and model examples are original. They provide introductory practice across the units. A full competency map, examination-year syllabus confirmation, and independent teacher moderation remain future work.

The academy runs in the browser with no new dependency, backend, account, analytics, or cloud connection. Typed responses survive track changes during the open page session. They are not added to Powerhouse attempts, marks, retest history, or recovery records. Copy any response you want to keep before closing or reloading. Opening the academy from Share-safe and navigating back preserves the shared URL.

## Maintenance

- The standalone root and `hosted-source/public/` are separate serving layouts. Keep their `biology-academy/academy.js`, `academy.css`, and `content.js` byte-identical. The hosted HTML includes the Biology Intelligence navigation because that route is available there.
- Run `node --test tests/*.test.mjs` from the repository root to check the navigation entries, mirrored assets, lesson schema, and existing service-worker tests.
- The academy uses conceptual models with stated assumptions. Review new explanations and marking points against the applicable NIE resources before an expansion. Keep textbook and exam-paper files out of this route unless redistribution is authorized.
- This scope does not implement a full exam bank, automated essay scoring, saved revision scheduling, or a native lab replacement. It changes no existing Powerhouse data model, storage namespace, or deployment configuration.
