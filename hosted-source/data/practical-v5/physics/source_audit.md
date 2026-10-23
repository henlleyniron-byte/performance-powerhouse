# Physics V5 authoring and source audit

43 original five-mark, data-interpretation cases cover the 43 exact Physics catalog activity IDs, including 21.1 and 21.2 separately. These correspond to the handbook's 42 numbered experiments with experiment 21 split into two lens activities.

## Primary source and inspection

NIE, G.C.E. (Advanced Level) Physics Practical Handbook, effective from 2017, revised-copy attribution 2018. Primary PDF: https://nie.lk/pdffiles/other/eALOM%20PysicsPracBook.pdf . Retrieved 16 October 2026. Online open returned 113 PDF pages. PDF page numbers are one-based and equal printed Arabic page plus 14. Browsing reference in this worker: `turn17view0`; additional experiment-28 page retrieval `turn21view0`. Do not cite worker reference IDs in a parent response without reopening them.

The relevant body title, theory and method/readout were inspected for each activity, beyond checking the table of contents. `method_checked` means that the question's analytical method and variables match the inspected section, not that the entire experimental procedure was independently replicated or that a teacher approved the question. In questions with methods spanning several pages, the theory/method heading establishes the actual approach, and these questions intentionally remain theoretical data interpretation.

Official titles are transcribed from the body headings, with whitespace and typographic ligatures normalised; the handbook's spelling “spectometer” and “Poiseuill's” is preserved in the corresponding title field. Catalog titles remain unchanged.

## Important scientific decisions

- Experiment 28 is explicitly **method of mixtures** at printed p.66. PM5-P29 includes both condensation heat and the subsequent sensible heat released by the condensate. It does not substitute electrical heating.
- Experiment 14: PM5-P14 has l1=0.1580 m, l2=0.4900 m, e=+0.00800 m and f=512 Hz. Both lengths fit a 0.50 m tube. The effective lengths are in ratio 1:3; the end correction is positive and approximately 0.60 times the specified bore radius.
- Experiment 15: the handbook equation is l=(v/4)(1/f)-e. Therefore the signed vertical intercept is -e. The handbook shorthand “e = intercept” cannot be used without the sign qualification. V5 explicitly makes that distinction.
- Lens activities use a declared internally consistent Cartesian convention (positive in the propagation direction; real-object u negative). This avoids reproducing internally confusing sign prose in the source's convex-lens section. Both convex and concave questions explicitly state the equation and their sign convention.
- Constant-volume gas data distinguish gauge pressure from absolute pressure and acknowledge displayed rounding. Constant-pressure gas data use 273.15 for the Celsius-to-kelvin offset.
- Quill-tube values imply 75.0 cm Hg; the implied gas length also fits inside the stated total tube length. A plausible pressure alone would not suffice if the implied air-column length exceeded the tube length.
- Capillary-flow water data yield approximately 1.00e-3 Pa s. The review caught and repaired an initial factor-of-ten volume inconsistency before delivery.
- Transistor base current is explicitly in microamperes and collector current in milliamperes, with both converted to amperes for beta. This avoids relying on ambiguous extracted micro-symbols.
- No question contains an apparatus-building recipe, chemical cleaning recipe, mercury handling instruction, heating instruction or mains-electricity task. All records are fictional data for interpretation.
- This source describes the effective-2017 handbook experiment list. The cases do not independently establish what practicals a particular current class or examination authority has removed; no such claim is made.

## Verification performed

- 43 distinct case IDs and 43 exact catalog activity IDs; five tasks and five corresponding one-mark points per case.
- 96 executable numerical expressions in the case JSON. Each expected value was computed from its expression; tolerances scale to the result rather than using a loose universal tolerance for very small areas.
- A separate same-author review script compares 44 principal calculated quantities against manually entered rounded targets from the written answer guides. All pass. This is an arithmetic cross-check, **not an independent human/teacher review**.
- Five additional physical assertions check closed-tube mode ratio, positive/sensible end correction, tube-length fit, quill-tube geometric fit and water-viscosity range. All pass.
- Transfer questions were manually reviewed for units, sign, interpretation and arithmetic. Conceptual transfer answers use clearly stated ideal-model assumptions.
- Significant figures: final values are generally given to three significant figures; longer intermediate values are retained to avoid premature rounding. Supplied lookup values and known material constants are treated as given model data. Teachers may reasonably prefer nearby rounding.

## Review still pending

All cases retain `review_status: independent_model_teacher_review_pending`. A separate subject specialist should assess pedagogy and marking-guide phrasing before these are treated as teacher-reviewed material. These cases are not NIE questions, official marking schemes or laboratory observations.

## Coverage and source-method map

| Case | Activity | NIE experiment | Printed page | Method checked |
|---|---|---|---|---|
| PM5-P01 | phy-001 | 1 | 1 | Body p.1 explicitly includes volume of PVC tubing from external/internal diameters and length. |
| PM5-P02 | phy-002 | 2 | 6 | Body p.6 specifies screw pitch/division least count and perpendicular wire readings at several positions. |
| PM5-P03 | phy-003 | 3 | 9 | Body p.9 gives R = a²/(6h) + h/2 using the separation of two legs. |
| PM5-P04 | phy-004 | 4 | 11 | Body p.11 introduces internal capillary diameter by travelling microscope; opposite edges and perpendicular directions are used. |
| PM5-P05 | phy-005 | 5 | 14 | Body p.14 uses a parallelogram diagonal to verify force addition and infer an unknown mass. |
| PM5-P06 | phy-006 | 6 | 16 | Body p.16 explicitly plots y against x with gradient m/m0 and keeps the original ruler balance point. |
| PM5-P07 | phy-007 | 7 | 18 | Body p.18 measures both heights from the common oil-water interface and plots hw against hl. |
| PM5-P08 | phy-008 | 8 | 20 | Body p.20 derives hw/hl = rho_liquid/rho_water using heights above the respective beaker surfaces. |
| PM5-P09 | phy-009 | 9 | 22 | Body p.22 uses l against additional mass and rho = 4/(pi d² G), with external diameter d. |
| PM5-P10 | phy-010 | 10 | 24 | Body p.24 times 25 oscillations and plots T² against suspension-to-bob-centre length. |
| PM5-P11 | phy-011 | 11 | 26 | Body p.26 gives T² = (4 pi²/k)m and tests a straight line through the origin. |
| PM5-P12 | phy-012 | 12 | 28 | Body p.28 determines an unknown fork using gradient of l² against hanging mass. |
| PM5-P13 | phy-013 | 13 | 30 | Body p.30 plots l against 1/f at constant hanging load and wire mass per length. |
| PM5-P14 | phy-014 | 14 | 32 | Body p.32 gives v = 2f(l2-l1), e = (l2-3l1)/2; dataset respects a positive correction and odd modes. |
| PM5-P15 | phy-015 | 15 | 34 | Body p.34 gives l = (v/4)(1/f)-e. Its shorthand “e = intercept” is read with the required negative sign from that equation. |
| PM5-P16 | phy-016 | 16 | 36 | Body p.36 defines real depth z-x and apparent depth z-y with three microscope focus positions. |
| PM5-P17 | phy-017 | 17 | 38 | Body p.38 varies incidence and records deviation; deviation first decreases and then increases. |
| PM5-P18 | phy-018 | 18 | 40 | Body p.40 uses the disappearing-image critical-angle construction and n = 1/sin(c). |
| PM5-P19 | phy-019 | 19 | 42 | Body p.42 uses reflected telescope positions with prism angle equal to half their separation. |
| PM5-P20 | phy-020 | 20 | 45 | Body p.45 compares minimum-deviation and direct-ray telescope positions and uses n = sin[(A+D)/2]/sin(A/2). |
| PM5-P21 | phy-21-1 | 21.1 | 47 | Body p.47 uses no-parallax locations and 1/v-1/u=1/f. V5 defines a consistent Cartesian direction explicitly; handbook sign prose is internally confusing. |
| PM5-P22 | phy-21-2 | 21.2 | 51 | Body p.51 locates a concave-lens virtual image by no parallax and uses the common signed lens formula. |
| PM5-P23 | phy-022 | 22 | 53 | Body p.53 gives H=(intercept/gradient)(x/L) for 1/l against elevation h. The case uses plausible atmospheric-pressure data. |
| PM5-P24 | phy-023 | 23 | 55 | Body p.55 derives l proportional to absolute temperature from V=Al for a uniform tube at constant pressure. |
| PM5-P25 | phy-024 | 24 | 57 | Body p.57 specifies fixed volume and pressure gauge. V5 explicitly distinguishes gauge pressure from the absolute pressure in p proportional to T. |
| PM5-P26 | phy-025 | 25 | 59 | Body p.59 equates heat lost by the solid to heat gained by water and calorimeter; this is method of mixtures. |
| PM5-P27 | phy-026 | 26 | 61 | Body p.61 compares equal volumes cooling through the same interval and includes the calorimeter heat capacity. |
| PM5-P28 | phy-027 | 27 | 64 | Body p.64 uses water ice at 0 degrees C, with fusion plus warming of meltwater and heat lost by water/calorimeter. |
| PM5-P29 | phy-028 | 28 | 66 | Body p.66 explicitly specifies method of mixtures, with steam condensation plus condensate cooling; not electrical calorimetry. |
| PM5-P30 | phy-029 | 29 | 68 | Body p.68 uses condensation onset/disappearance to infer dew point and compares saturated vapour pressures. |
| PM5-P31 | phy-030 | 30 | 70 | Body p.70 uses steady-state bar conduction balanced against cooling-water heat gain in Searle’s apparatus. |
| PM5-P32 | phy-031 | 31 | 73 | Body p.73 plots terminal V against I, with slope -r and intercept E. |
| PM5-P33 | phy-032 | 32 | 75 | Body p.75 uses Rtheta/RB=l/(100-l) and alpha = slope/intercept for the bridge-ratio graph. |
| PM5-P34 | phy-033 | 33 | 77 | Body p.77 compares emf ratios from balance-length ratios while keeping a common gradient for each comparison. |
| PM5-P35 | phy-034 | 34 | 79 | Body p.79 derives the 1/l versus 1/R graph with r equal to slope divided by intercept. |
| PM5-P36 | phy-035 | 35 | 81 | Body p.81 constructs the forward diode I–V characteristic; calculations interpret the resulting curve only. |
| PM5-P37 | phy-036 | 36 | 83 | Body p.83 plots IC against IB and takes gradient as beta, with VCE maintained constant. Units are explicit to avoid extracted micro-symbol confusion. |
| PM5-P38 | phy-037 | 37 | 85 | Body p.85 identifies simple gates from complete input/output truth tables; V5 includes no circuit assembly instructions. |
| PM5-P39 | phy-038 | 38 | 87 | Body p.87 plots mean extension against added mass and uses gradient gL/(AY); loading/unloading readings are specified. |
| PM5-P40 | phy-039 | 39 | 90 | Body p.90 uses laminar capillary flow, hydrostatic pressure head, and the Q-versus-h slope under Poiseuille’s formula. |
| PM5-P41 | phy-040 | 40 | 92 | Body p.92 uses 2(a+b)T = mg with the extra balancing mass and microscope-slide length/thickness. |
| PM5-P42 | phy-041 | 41 | 94 | Body p.94 derives 2T cos(theta)/r = rho gh and treats clean-water/glass contact angle as zero. |
| PM5-P43 | phy-042 | 42 | 96 | Body p.96 subtracts test-liquid tip depth head from maximum manometer head and sets the excess equal to 2T/r. |
