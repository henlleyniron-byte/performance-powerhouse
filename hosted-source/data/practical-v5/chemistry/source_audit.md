# Chemistry V5 source and content audit

Audit date: 16 October 2026. Authoring status: independently model-authored; teacher review pending. This is source inspection and arithmetic validation, not an independent teacher audit.

## Primary source inspected

NIE English-medium Chemistry Practical Handbook (2018), 148 PDF pages:
https://nie.lk/pdffiles/other/eALOM%20Chemistry%20Practical%20Handbook.pdf

Retrieved directly from NIE. The local source PDF is `handbook.pdf`; extracted body text is `handbook_extracted.txt`. Activity headings, relevant method descriptions, observations and calculation concepts were inspected. Four rendered pages were visually inspected for critical discrepancies: contents PDF8, Experiment25 PDF86, Experiment38 PDF125, and Experiment44 PDF143. Activity29–45 references were verified against actual body headings, not inferred from an inaccessible online index. PDF one-based page equals printed Arabic page+8 for these activities.

## Deliverable and coverage

- `chemistry_cases.json`: 45 original cases PM5-C01…PM5-C45 mapped one-to-one to unchanged IDs che-001…che-045.
- Every case has an original fictional data or diagnostic observation table, exactly five tasks and five one-mark guide points, reasoning, one common error, and a fresh transfer question with answer.
- All cases are interpretation-only: no operational synthesis recipe, apparatus construction, reagent preparation or handling instructions.
- `numeric_check_results.json`: 67 explicit numerical checks, all passing. The checker caught and corrected two overprecise expected values in PM5-C06 before release. Its displayed three-significant-figure molar-mass answer remains 24.4 g mol-1.
- Qualitative practicals use actual observation logic, structure, balanced equations and candidate discrimination rather than invented percentage scores.
- Source titles preserve source spelling after whitespace/ligature normalization. Descriptive case titles are original.

## Catalogue/source discrepancies and corrections

| Activity | Evidence inspected | V5 handling |
|---|---|---|
|25, alcohols|Contents PDF8 lists printed80, matching original catalogue. Actual activity heading is printed78/PDF86.|V5 `nie_print_page` is78; `catalog_print_page` retains80 and the per-case verification note explains why. Original catalogue is untouched.|
|12, nitrogen in air|Actual printed49–50 activity uses magnesium nitride and ammonia evidence; it does not determine nitrogen fraction by oxygen-removal/air-remainder measurement.|PM5-C12 uses the nitride-to-ammonia observation chain and explicitly refuses to infer a percentage of air.|
|20, oxalate/permanganate|Printed67 displayed equation has only one MnO4- on the left but2Mn2+ on right. The balanced equation requires2MnO4-.|PM5-C20 derives the correct2:5 ratio from half equations. The missing coefficient is not propagated.|
|18, ion colours|Source introduction contains oversimplified/misleading transition-metal and colour descriptions.|Case uses correct d9 Cu2+ and d10 Zn2+ electronic reasoning and distinguishes observed from absorbed colour. It does not repeat the source claim that partly filled d must mean 'half-filled'.|
|38, distribution|Printed117 heading/contents says water and2-butanol; introduction, equipment list and method printed117–118 repeatedly say butan-1-ol/but-1-ol.|Explicit source-ambiguity note. Case defines organic/aqueous analytical distribution ratio and uses given phase concentrations, without silently assuming either solvent's universal molecular partition constant. Teacher clarification required for solvent identity.|
|39, electrochemical series|Printed120–121 actual method is metal/metal-ion displacement observations.|PM5-C39 follows a displacement matrix, rather than substituting potential readings for the handbook method.|
|40, Ag/AgCl|Source mixes language of standard electrode and saturated-KCl implementation; potential depends on filling composition.|PM5-C40 explicitly gives actual calibrated reference potential and does not assume it equals the unit-activity standard potential.|
|41, soap|Printed126 introduction calls base a catalyst in saponification.|PM5-C41 correctly states hydroxide is consumed in net ester-to-carboxylate hydrolysis. Distinguishes it from catalytic transesterification in43.|
|44, vinegar|Printed135 aim says percent by mass; printed137 calculation asks w/v.|PM5-C44 includes density and separately calculates%m/v and%m/m; never labels them interchangeably.|
|45, Winkler|Printed140 illustration implies a special numerical titre-to-DO conversion without universally applicable concentration conditions.|PM5-C45 uses explicit1O2:4thiosulfate stoichiometry, reagent blank, standard concentration, corrected original sample volume and full mg dm-3 calculation.|

## Verified body references 29–45

|NIE number|Printed start|PDF page, 1-based|Method/concept alignment|
|---|---:|---:|---|
|29|88|96|Aromatic diazonium/azo coupling; completed structural observations only|
|30|90|98|Mg/acid concentration comparison; time to same hydrogen-volume endpoint|
|31|95|103|Thiosulfate/nitric-acid cloudiness; post-mixing concentration and fixed optical endpoint|
|32|98|106|Fe3+/iodide clock with thiosulfate; explicit iodine-rate factor of1/2|
|33|102|110|Fe3+/SCN- dynamic equilibrium and colour comparisons|
|34|105|113|NO2/N2O4 temperature shift; exothermic association direction specified|
|35|109|117|Salt solution pH and hydrolysis|
|36|111|119|Carbonate/HCl two endpoints; cumulative volumes distinguished|
|37|114|122|Saturated calcium hydroxide titration and common-ion reasoning|
|38|117|125|Phase acid titration and explicitly defined ratio; solvent discrepancy flagged|
|39|120|128|Metal displacement evidence|
|40|122|130|Ag/AgCl reference theory and calibration interpretation|
|41|126|134|Soap chemistry, product stoichiometry and hard water|
|42|130|138|Steam-distillation vapour-pressure interpretation and dry-mass evidence|
|43|133|141|Biodiesel transesterification accounting and ester-product class|
|44|135|143|Vinegar titration, dilution and explicit percentage basis|
|45|138|146|Winkler analytical stoichiometry and sample-volume basis|

All45 case mappings and source headings were checked. The only start-page disagreement against original catalogue is activity25. Arithmetic validation is not proof of conceptual completeness; teacher review of the original educational cases remains pending.
