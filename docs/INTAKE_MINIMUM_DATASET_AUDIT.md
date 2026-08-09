# Initial Intake — Clinical Minimum Dataset Audit

Written: 2026-08-09 (Claude, at Ting's request). Status: **AUDIT — no schema or
UI changes made in this batch.** Ting reviews and picks before anything below
is implemented.

Scope: **first-visit / initial-intake fields only** (the Case form + what a
Visit-1 SOAP already captures as baseline). Follow-up visit design, Safety
Layer, Pattern/Formula/Extra-point content, Cloudflare Access, and the
`sym.*` vs `metric.*` measurement-identity fork are all out of scope and
untouched.

Read together with: `docs/CLINICAL_DATA_FOUNDATION_DESIGN.md` (already flags
`patients.race/ethnicity`, `cases.approx_onset/duration_at_intake/course/
severity_baseline` as gaps — this audit does not re-litigate that those are
real gaps, it widens the same question to the rest of intake and gives each
field a recommendation) · `docs/TCM_CASE_SPEC.md` · `data/clinical_cases/
schema.sql` · `data/clinical_cases/localstorage_sqlite_mapping.json` ·
`DECISIONS.md` D4 (coarsen, never falsify).

---

## 0. What "current state" means here

There are **three layers that can each independently have or lack a field**,
and they currently disagree in specific ways:

1. **Runtime data model** — `app.js normalizeClinicalCase()` /
   `normalizeSoapNote()` (app.js:4817-4893). This is the actual shape of what
   gets saved to `localStorage`. Ground truth for "does the app support this
   today."
2. **UI form** — `index.html` `#caseForm` / `#soapForm`. A field can exist in
   the runtime model but have no input to fill it (rare here) or vice versa
   (does not happen — the form and normalizer are kept in lockstep).
3. **`schema.sql`** — the future SQLite destination. A field can be fully
   working in 1+2 and still have `status: no_destination_yet` or
   `unresolved_needs_ting` in the mapping file, i.e. it works today but has
   nowhere to land in the eventual migration (H2, scheduled 11–12月, not a
   9/5 blocker per `docs/ROADMAP_TO_CLINIC_2026-09-05.md` §6).

**One structural fact that shapes every recommendation below:** the runtime
model has **no separate Patient entity**. `patientCode`, `sex`, `occupation`,
`birthYearMonth` all live directly on the *case* object — exactly where
`race`/`ethnicity` would also have to go if added today. `schema.sql`
already separates `patients` from `cases`, but the app has never been wired
to that split (Patient hub / CG1–CG3 is explicitly deferred to 11–12月). This
means: **adding patient-level demographic fields now means adding them to the
Case form**, same precedent as the existing `sex` field — not a new UI
surface. If the same real person opens a second case/episode later, those
fields get re-entered and could drift. This is not a new problem (`sex` and
`occupation` already have it); it is a reason to flag it once here rather
than pretend it doesn't apply to race/ethnicity too.

---

## 1. Classification — every field the audit was asked to check

**A** = must capture at initial intake (missing it permanently weakens future
data). **B** = useful, can wait. **C** = derived, should never be a manual
field. **D** = not needed for this system.

| Field | Class | Current state |
|---|---|---|
| Age / birth year-month | — (exists) | `case.birthYearMonth` (UI) → `patients.birth_year/birth_month` (schema, mapped, D4-compliant coarsening) |
| **Race** | **A** | **missing — UI and schema** |
| **Ethnicity** | **A** | **missing — UI and schema** |
| **Gender identity** | **A** | UI missing; `patients.gender_identity` column exists unused |
| Sex at birth | — (exists, semantics ambiguous) | `case.sex` (UI) → `patients.sex_at_birth` (schema); mapping file itself flags this as unconfirmed whether the UI field means birth-sex or identity |
| Primary language | B | missing everywhere; low urgency, not acutely unrecoverable |
| Country / region / ancestry (granular) | D | not needed as a separate controlled field — covered by race/ethnicity "other, self-describe" free text if ever wanted |
| Chief complaint | — (exists) | `case.chiefComplaint` → `case_intake_baseline.chief_complaint_zh` (mapped) |
| **Onset (approx)** | **A** | **missing — UI and schema** (buried in `historyPresent` prose today) |
| Duration at intake | **C** | derive from `approx_onset` + `startDate` at display/query time — do not add a second manually-entered field once onset exists |
| **Disease course** (acute/subacute/chronic/recurrent/episodic) | **A** | **missing — UI and schema** |
| Baseline severity (numeric) | *(deferred)* | mechanism for this is exactly the `sym.*` vs `metric.*` fork already flagged DEFERRED in `visit_observations` — see §3, not reopened here |
| Functional impact (ADL/work) | B | no dedicated field; foldable into `chiefComplaint`/`historyPresent` prompts rather than a new column |
| **Previous treatment tried** (for this complaint) | **A** | **missing — no dedicated field**, currently relies on prose discipline inside `historyPresent` |
| Medication / supplement baseline | — (exists, schema gap already known) | `case.currentMeds` (UI, works today); schema has **no case-level destination** (`no_destination_yet` in the mapping file — pre-existing, not new) |
| Major comorbidities | — (exists) | covered by `case.pastHistory` free text |
| Relevant surgical history | — (exists) | covered by `case.pastHistory` (placeholder text explicitly invites "手術") |
| Relevant family history | — (exists) | covered by `case.pastHistory` (placeholder explicitly invites "家族史") |
| Allergies | — (exists, schema gap already known) | `case.allergies` (UI, works today); schema has **no column at all** — `unresolved_needs_ting`, Ting already rejected folding it into `red_flags` (2026-08). Pre-existing, not new. |
| Lifestyle exposures | — (exists) | `case.lifestyle` free text |
| Menstrual / reproductive baseline | — (exists) | `case.menstrualObHistory` |
| TCM disease (中醫病名) | — (exists) | `case.easternDiseases[]` |
| Baseline TCM pattern | — (exists) | `case.tcmPatterns[]` (case-level summary) + visit-level `tcmPatternLinks` on the first SOAP, per the existing D5 case-summary/visit-authoritative split |
| Tongue / pulse baseline | — (exists) | SOAP fields `tongueBody`/`tongueCoating`/`pulse`, captured on visit 1 |
| Objective findings / vitals baseline | — (exists) | SOAP `objective` + `vitals` (A1, already shipped) |

Only **five rows are true A — must-capture — gaps**: race, ethnicity, gender
identity, approx onset, disease course, previous treatment tried. (Six rows
listed A above; gender identity's schema half already exists.)

---

## 2. The five MUST fields, in the requested format

### Race

- **CURRENT STATE:** no field in the Case form; no field in
  `normalizeClinicalCase()`; no column in `patients`.
- **DATA GAP:** total — UI and schema both.
- **CLINICAL VALUE:** low direct bearing on a single visit's treatment plan.
- **LONGITUDINAL / RESEARCH VALUE:** high — the exact thing "demographics ×
  condition × TCM pattern × treatment × outcome" analysis needs as a
  covariate, and the thing least recoverable after the fact (a returning
  patient can be asked again; someone seen once for a synthetic/informal
  case, per this half-year's actual population, likely cannot).
- **STORAGE LOCATION:** `patients.race` — does not exist, additive column
  needed.
- **Existing schema support it?** No.
- **UI missing?** Yes.
- **Recommended shape:** self-reported, **multi-select**, controlled
  vocabulary in its own versioned file (`data/config/demographic_vocabulary.json`,
  same lightweight pattern as `outcome_metrics.json` — a flat array of
  `{id, label_zh, label_en}`, no D14 four-way build needed for a demographic
  field). Values stored as an array of opaque ids on the case object
  (`race: ["race.asian", "race.white"]`), never inferred, never free-text-only.
  Must include `other_self_described` (paired free-text field),
  `unknown`, and `prefer_not_to_answer` as first-class options — not absence
  of an answer, but a recorded answer that means "asked, declined/unsure."
  **The exact category list is Ting's call — not drafted here.** A US
  federal (OMB) 5-category starting point is the common precedent if useful,
  but the vocabulary file's whole purpose (per D14's existing pattern in this
  repo) is that it can grow without touching `app.js` or `schema.sql` again.

### Ethnicity

- Same shape as Race, **modeled as a separate concept** (per the v2 spec's
  own instruction, §13: "Race and ethnicity must be modeled as separate
  concepts if collected") — a second controlled-vocabulary field/array, not
  a sub-option of race. Same gap, same recommendation, same open question
  (exact vocabulary) left to Ting.

### Gender identity

- **CURRENT STATE:** `patients.gender_identity` column exists in `schema.sql`
  (added early, unused). The Case form has one `sex` dropdown (F/M/Other) and
  nothing else.
- **DATA GAP:** UI-only — schema anticipated this and the app never caught up.
- **CLINICAL VALUE:** distinct from sex-at-birth reasoning (D4: sex at birth
  drives 月經/孕產/更年期 branches); gender identity matters for
  identity-aware care and is a different question.
- **LONGITUDINAL / RESEARCH VALUE:** medium — demographic covariate, and
  keeps sex-at-birth (the clinically load-bearing field per D4) from being
  silently overloaded with identity meaning it was never designed to carry.
- **STORAGE LOCATION:** `patients.gender_identity` (exists).
- **Existing schema support it?** Yes.
- **UI missing?** Yes.
- **Recommended shape:** light controlled vocabulary (female / male /
  non-binary / other-self-describe / prefer not to answer), separate from
  the existing `sex` dropdown. Doing this properly also means relabeling the
  existing `sex` field to unambiguously read "sex at birth" — a copy change,
  not a data change, but flagged here because the mapping file already
  called the current label ambiguous and it should not ship to 9/5 still
  ambiguous.

### Onset (approx_onset)

- **CURRENT STATE:** no structured field. Onset timing is prose buried inside
  `historyPresent` (confirmed live in this session's T1 dry-run entry:
  "Onset after long car drive 3 weeks ago" — free text, not queryable, not
  sortable).
- **DATA GAP:** total — UI and schema (`cases.approx_onset` does not exist
  yet; `CLINICAL_DATA_FOUNDATION_DESIGN.md` §3.1 already named this gap).
- **CLINICAL VALUE:** directly changes TCM reasoning (急性/慢性) and red-flag
  triage weight (new-onset vs longstanding same complaint is a different
  urgency).
- **LONGITUDINAL / RESEARCH VALUE:** high — this is the one field that makes
  "duration at intake" and treatment-response-over-time analysis possible at
  all. Missed at intake, it degrades with the patient's memory and is not
  reconstructable from visit dates alone.
- **STORAGE LOCATION:** `cases.approx_onset` — additive column, coarse
  `"YYYY-MM"` grain, same D4 "coarsen, never falsify" pattern already used
  for `birth_year_month`.
- **Existing schema support it?** No.
- **UI missing?** Yes.
- **Recommended data type:** free-text-shaped but conventionally `"YYYY-MM"`
  or a short phrase ("~3 weeks ago") when precision genuinely isn't known —
  same discipline as `birthYearMonth`: never invent a month that wasn't
  given.

### Disease course

- **CURRENT STATE:** no controlled field. `historyPresent` prose sometimes
  implies it, never structured.
- **DATA GAP:** total — UI and schema (`cases.course` does not exist yet;
  same §3.1 gap).
- **CLINICAL VALUE:** acute/chronic/recurrent changes treatment principle
  directly, not just documentation.
- **LONGITUDINAL / RESEARCH VALUE:** high — needed to group cases for
  "TCM pattern evolution" and "treatment-response analysis" (an acute strain
  and a 5-year recurrent pattern are not comparable data points without this
  label).
- **STORAGE LOCATION:** `cases.course` — additive column.
- **Existing schema support it?** No.
- **UI missing?** Yes.
- **Recommended data type:** controlled vocabulary — `acute | subacute |
  chronic | recurrent | episodic` (the FHIR-subset list
  `CLINICAL_DATA_FOUNDATION_DESIGN.md` already proposed for `cases.status`
  is a reasonable adjacent precedent, not the same field).

### Previous treatment tried

- **CURRENT STATE:** no dedicated field. Whatever the patient already tried
  for this complaint (PT, chiropractic, prior acupuncture, injections,
  surgery, and how it went) has no reserved place — it either gets folded
  into `historyPresent` prose inconsistently or gets lost.
- **DATA GAP:** total, in the sense that nothing prompts for it — a MUST
  field can silently become an accidental gap if it depends entirely on the
  intake-taker remembering to ask and write it into a general-purpose box.
- **CLINICAL VALUE:** informs treatment principle selection (what already
  failed) and is standard intake practice.
- **LONGITUDINAL / RESEARCH VALUE:** high — "treatment-response analysis"
  cannot distinguish a treatment-naive responder from someone who already
  plateaued on PT without this baseline, and it is exactly the kind of detail
  a patient stops mentioning precisely at visit 3 the way they would at visit
  1.
- **STORAGE LOCATION:** none — new field. `case_intake_baseline` (schema) is
  the natural home if a `history_present_illness`-adjacent column is added,
  or a dedicated `cases.previous_treatment` column.
- **Existing schema support it?** No.
- **UI missing?** Yes.
- **Recommended data type:** free text (this is narrative, not code-able —
  do not force a controlled vocabulary onto "tried PT for 6 weeks, mild
  improvement then plateaued").

---

## 3. Explicitly not re-opened here

- **Baseline severity as a queryable number.** The mechanism for this is the
  same `visit_observations.sym_id` vs `metric.*` identity fork already
  flagged DEFERRED in `data/clinical_cases/schema.sql` (commit `7fa4dc1`).
  `outcomeMetricLinks` on the SOAP form is confirmed, in this session, to
  still be **free text only** — `"pain_score 7->4"` as a string, not a
  structured value (app.js:5343 says so explicitly: *"structured outcome
  entry is the LL-track item"*). This audit does not pick a side of that
  fork; it just confirms the gap is real and already tracked.
- **Sex-at-birth vs gender-identity clinical-reasoning wiring.** Only the
  *field* gap is in scope here. Whatever downstream logic keys off sex
  (期/孕產/更年期 branches, D4) is untouched.
- **Patient hub / cross-case demographic reuse.** Named in §0 as a structural
  fact, not solved. Stays on the existing 11–12月 CG1–CG3 schedule.

---

## 4. Decisions this audit surfaces for Ting (not made here)

1. **Race/ethnicity exact category lists** — self-report, multi-select,
   versioned vocabulary file. The shape is recommended above; the actual
   category names are not drafted in this document.
2. **Where race/ethnicity/gender-identity live in the UI** — recommendation
   is "same Case form, same precedent as the existing `sex` field," which
   also means accepting the existing per-case (not per-patient) storage
   limitation rather than building a Patient hub now.
3. **`sex` field relabel** to remove the ambiguity the mapping file already
   flagged, alongside adding the separate `gender_identity` field.
4. **`cases.course` controlled vocabulary** — proposed list above, not
   confirmed.
5. **Previous-treatment field placement** — new dedicated column vs. a
   stronger prompt inside existing `historyPresent`/`pastHistory` fields.

None of the five MUST fields are safety-relevant in the Phase-1 sense
(Safety Layer is untouched), so none of this blocks 9/5 by itself — the
blocker this audit names is **permanent, not urgent**: every day of real (or
synthetic/informal) intake recorded without these fields is intake that
cannot be backfilled later with the same reliability.
