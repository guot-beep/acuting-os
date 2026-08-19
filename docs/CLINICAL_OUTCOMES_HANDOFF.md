# Clinical Outcomes Handoff — AcuTing OS

Written: 2026-08 (Claude/Sonnet, end of session). This is the single
up-to-date status document for the clinical case / outcome-metrics work
line. `docs/OUTCOME_METRICS_SEMANTIC_AUDIT_V2.md` still holds the detailed
per-metric numeric-shape reasoning and is not superseded on that point —
read this file for current state, that file for why each metric is shaped
the way it is.

Not an official EHR. Deidentified, personal-learning clinical cases.

---

## A. Current architecture

```
Patient → Case/Episode → Visit/SOAP → Treatment Tracking → Case Reflection
```

**Case = Episode. There is no separate Episode layer, and none should be
added.** `docs/TCM_CASE_SPEC.md` fixes this as a deliberate two-layer
model: Case (病例夾, stable, changes rarely) and Visit/SOAP (每次就診,
changes every visit). "Episode" in casual conversation refers to the Case
layer, not a fourth table.

- **Patient** — not a runtime entity yet. `patientCode` is a
  deidentified string field on Case, and the case-creation form currently
  enforces one Case per `patientCode` (a pre-existing UI guard, confirmed
  this session, not something this round changed or was asked to change).
  A real Patient entity — one patient, many Cases/Episodes over time — is
  still future work.
- **Case/Episode** — `clinicalCases[]` in localStorage. Stable chart-level
  fields: demographics, chief complaint, history, allergies, current meds,
  safety flags, working pattern.
- **Visit/SOAP** — `case.soapNotes[]`. Everything that changes per visit:
  four exams, assessment, plan, treatment given, and — as of this session
  — up to 11 structured numeric outcome measurements.
- **Treatment Tracking** — points/formula/technique/retention recorded
  per visit, already existing, unchanged this session.
- **Case Reflection** — `case_reflections` (schema.sql) / per-visit
  `reflection` field, the six-question structure from
  `docs/CLINICAL_GRAPH_TRACK.md` §4, unchanged this session.

## B. Current runtime state

- **Storage**: `localStorage` key `acuting-clinical-cases-v1`, JS objects
  only. `normalizeClinicalCase()`/`normalizeSoapNote()` in `app.js` are the
  single source of truth for the runtime shape and always default absent
  fields safely (D4: coarsen, never falsify — never fabricate a value).
- **SQLite**: `data/clinical_cases/schema.sql` exists and is kept
  additive-only (frozen 2026-09-01 per its own header). **Migration has
  not started.** No script moves localStorage data into it yet.
- **Patient runtime entity**: not implemented (see §A). `patientCode` is
  presently doing double duty as a soft per-case unique key.
- **Nature of the data**: deidentified, personal-learning clinical cases —
  not an official EHR, not used for real patient records outside this
  learning context.

## C. Outcome metrics state

**Canonical vocabulary** (`data/clinical_cases/outcome_metrics.json`): 22
metric definitions total (id/name/label_zh/label_en/category/unit/
direction_good).

**Numeric renderer wired: 11 of the 22.** All 11 share one generic
config/render/validate/display path (`NUMERIC_OUTCOME_METRIC_CONFIG` in
`app.js` + `getOutcomeMetricDef()`/`renderNumericOutcomeMetricInputs()`/
`computeNumericOutcomeMetrics()`/`formatNumericOutcomeMetrics()`/
`formatMetricNumberDisplay()`/`resolveNumericMetricValue()`), in this
order (the order the SOAP form renders them, and the order Outcome
Tracking §E displays them — never alphabetized):

1. `metric.pain_score` — 0–10, integer
2. `metric.sleep_hours` — decimal, no max
3. `metric.effect_duration_days` — integer, no max, has a legacy field (§D)
4. `metric.stress_level` — 0–10, integer
5. `metric.mood` — 0–10, integer
6. `metric.energy_level` — 0–10, integer
7. `metric.sleep_quality` — 0–10, integer
8. `metric.bloating` — 0–10, integer
9. `metric.sleep_onset_minutes` — integer, no max
10. `metric.night_wakings` — integer, no max
11. `metric.bowel_frequency` — integer, no max, `direction_good:
    "individualized"` — never displayed with a "more/fewer is better"
    implication anywhere (form, SOAP card, Last Visit at a Glance, or the
    new Outcome Tracking panel)

**Persisted shape**, unchanged since the metric layer was first built and
unchanged by every batch since:
```js
note.outcomeMetrics = [
  { metricId, valueNumber }
]
```
One entry per metric actually measured that visit. Blank removes the
entry (never stores a null, never coerces to 0). No new persisted field
was added in any of the batches referenced in this document.

## D. Legacy reconciliation

`metric.effect_duration_days` is the canonical structured representation.
A pre-existing direct field, `note.effectDurationDays`, still exists on
old notes for backward compatibility / fallback — it is not deleted and
old data is never silently dropped.

- **Canonical wins on conflict.** `resolveNumericMetricValue()` reads the
  canonical `outcomeMetrics[]` entry first; the legacy field is read only
  when canonical is absent.
- **Both present and disagreeing is surfaced, not hidden** — a visible
  `⚠` warning on the form and a `⚠` suffix on card/Last-Visit/Outcome-
  Tracking display, never two silent rows.
- **Touch/save clears the legacy shadow.** Any save of a note (new or
  edited) migrates that note to canonical-only going forward
  (`legacyClears` merged into the save payload after the `...current`
  spread). This is per-note, on-touch — not a bulk migration script.

This is the only metric with a legacy shadow field. No other metric has
ever had one.

## E. Outcome Tracking v1

Implemented this session. **Read-only, fully derived** from existing
`note.outcomeMetrics[]` data — no new persisted field, no schema change,
no localStorage migration, no chart library, no SVG, no trend value ever
stored anywhere. Recomputed from scratch on every render.

Rendered as a small table in the case detail view (`renderClinicalCaseDetail`
→ `renderOutcomeTrackingPanel()`/`computeOutcomeTrackingRows()` in
`app.js`), between the case tags and the SOAP visit timeline.

**Semantics (CG8, `docs/CLINICAL_GRAPH_TRACK.md` §3):**

- **Baseline** = the value recorded on this **Case's** chronologically
  first visit. Not the patient's first-ever visit anywhere, not another
  case's first visit, not the first nonblank value found by scanning
  forward. If visit 1 didn't measure a metric, Baseline for that metric is
  permanently "—" for this case — never silently backfilled from a later
  visit.
- **Today** = the value recorded on this Case's chronologically latest
  visit. If the latest visit didn't measure it, Today is "—". **No
  LOCF** — a value from an earlier visit is never carried forward and
  presented as today's.
- **Change** = Today − Baseline, a signed numeric delta, whenever both are
  measured (e.g. `-3`, `+1.25`, `0`). **Never converted to "improved/
  worsened" text** — `direction_good` varies per metric and several are
  individualized/contextual, so a bare mathematical delta is the only
  claim this v1 makes. If either side is unmeasured, Change is "—" (blank
  is never treated as zero).
- **Trend** = a chronological `↑`/`↓`/`→` sequence built from the
  MEASURED-only observations for that metric across the whole case
  (unmeasured visits are skipped when building the sequence — no
  fabricated arrow for a gap). Fewer than 2 measured observations → "—".
  **No chart, no color, no clinical verdict** — `↑` states the number
  went up, nothing about whether that's good.
- **Row visibility**: a metric's row is shown only if it has at least one
  measured value anywhere in the case (avoids an 11-row wall of dashes on
  a brand-new case). Baseline/Today can still individually be "—" within
  a shown row. If the case has zero numeric measurements anywhere, the
  whole panel is replaced by one compact empty-state line, never a table
  of dashes.
- **Optional direction hint**: each row shows `direction_good` verbatim
  (increase/decrease/individualized/contextual) as a small neutral label —
  vocabulary metadata, not a computed verdict, no color.

**Verified this session** (10 lettered QA scenarios, all passed exactly as
specified, including the fully-generic single-visit case where Change=0
and Trend="—" fall out of the definitions with no special-casing needed):
simple two-visit change, an increase-good metric, an individualized
metric (bowel_frequency, no "better" wording), decimal preservation
(sleep_hours, no rounding), missing baseline, missing today, 3+
measurements, an intermediate-missing-visit gap, cross-case isolation, and
a single-visit case.

## F. Known debts / deferred

- **11-field SOAP outcome block is usable but dense.** Classified `B`
  (usable but grouping would help) in commit `360691d`: 2-column grid, 6
  rows, ~700–780px on its own inside a form whose total height is ~7× a
  720px viewport. No rendering bug, everything saves/loads correctly.
  Grouping/collapsing is desirable later, not a correctness blocker now.
  **Not redesigned this session, by instruction** — same debt, now
  documented in one place instead of two.
- Boolean outcome metrics (`ovulation_confirmed`, `lh_surge`) — unwired,
  no renderer exists for this shape yet.
- Categorical outcome metrics (`menstrual_flow_volume`, `menstrual_clots`)
  — unwired, no renderer exists for this shape yet.
- Free-text outcome metrics (`bbt_pattern`, `post_treatment_reaction`,
  `adverse_reaction`) — unwired, no renderer exists for this shape yet.
- Fertility numeric metrics (`cycle_length`, `bleeding_days`,
  `endometrial_lining`, `follicle_size`) — READY per the semantic audit but
  unwired; `cycle_length`'s floor and whether the two mm-measurements
  belong in this generic renderer at all (given their fertility-monitoring
  workflow context) are flagged `NEEDS_SMALL_DECISION`, not resolved.
- SQLite migration — schema exists, not started.
- Patient runtime entity — not implemented; `patientCode` currently
  functions as a soft one-case-per-code key (see §A), not a true
  multi-episode patient identity.
- `case.currentMeds` — no case-level SQLite destination documented yet.
- `case.allergies` — unresolved (`unresolved_needs_ting` in
  `localstorage_sqlite_mapping.json`).
- `soap.tongueBody` / `soap.tongueCoating` — migration mapping unresolved.
- `soap.outcomeMetricLinks` — remains narrative/unresolved; explicitly
  must NOT become `visit_outcomes` rows (a `metric_name` with a null
  value would read as "measured, result blank" when the truth is
  "selected, never measured" — indistinguishable on a trend view).
- `soap.workflowLink` — no schema destination yet.
- **Structured metric migration must resolve `metric_name` from the
  canonical vocabulary** (`data/clinical_cases/outcome_metrics.json`),
  because `schema.sql`'s `visit_outcomes.metric_name` is `NOT NULL`.
- **An unknown `metricId` during migration must fail loudly**, not invent
  a name — matches the config-integrity self-check's own philosophy
  (§below) at the migration layer instead of the runtime layer.

## G. Frozen decisions

- No fourth Episode layer. Case = Episode, permanently.
- One fact, one home (effect_duration_days's legacy/canonical
  reconciliation is the worked example; the same rule applies to any
  future field with a pre-existing shadow representation).
- Blank ≠ zero, everywhere in the outcome-metric layer — form validation,
  storage (`setOutcomeMetricValue` removes rather than nulls), and now
  Outcome Tracking's Baseline/Today/Change ("—" is not 0).
- This Case's first visit defines Baseline. Never the patient's first
  visit anywhere, never another case's.
- No LOCF for Today. An unmeasured latest visit is "—", not the last
  known value.
- No invented metric maximum — unbounded metrics (`sleep_onset_minutes`,
  `night_wakings`, `bowel_frequency`, `sleep_hours`, `effect_duration_days`)
  accept any nonnegative value, including clinically unusual large ones.
- Labels/units come from the canonical vocabulary
  (`outcome_metrics.json`) only — never hardcoded/duplicated in `app.js`
  or `styles.css`.
- Subjective 0–10 runtime convention = whole-number entry. This is an
  AcuTing UI/clinical convention layered on top of the vocabulary's
  `unit: "0-10"` range fact, not something the unit string proves by
  itself (`docs/OUTCOME_METRICS_SEMANTIC_AUDIT_V2.md`'s corrected §3).
- Trend first phase = descriptive `↑`/`↓`/`→` arrows only. No chart, no
  prediction, no statistical regression, ever discussed as "first phase
  only" — a later phase adding a chart is not precluded, but nothing here
  assumes one is coming.
- Outcome metrics remain visit-level (`soap_notes` / `outcomeMetrics[]`),
  never promoted to case-level fields — a case-level summary (like §E) is
  always derived, never a second place the value is stored.

## H. Last verified commits

```
63f0896  metric.pain_score wired (first structured numeric metric)
eda9819  metric.sleep_hours wired (second metric, decimal shape)
a1348b5  metadata-driven numeric renderer generalized (config-driven, 2 metrics)
1a3a426  metric.effect_duration_days reconciled from a pre-existing legacy field
e53fc6c  structured outcome mapping documented in localstorage_sqlite_mapping.json
b947b6d  intake mapping correction — 12 fields' "no destination" mislabel fixed
197b423  Outcome Metrics Semantic Audit v2 (22-metric classification, design only)
c16099b  batch 2 wired: stress_level/mood/energy_level/sleep_quality (4 metrics) +
         config-integrity self-check + audit wording correction
360691d  batch 3 wired: bloating/sleep_onset_minutes/night_wakings/bowel_frequency
         (4 metrics, deliberately mixed shapes)
<this session's final commit — see the commit this file ships with>
         Outcome Tracking v1 (Baseline/Today/Change/Trend) + stale-audit-status
         correction + this handoff
```

## I. Next safe task (recommended, NOT started)

**Outcome metric UI grouping / category-aware presentation of the 11-field
SOAP outcome block.** This directly resolves the `B`-classified form
density debt (§F) with no new metric, no new persisted field, and no
architecture change — a pure presentation pass over data that already
exists (e.g. grouping by `outcome_metrics.json`'s existing `category`
field, or a simple collapsed/expanded state per group). Good next task
because: it is scoped, it is UI-only, it does not touch persisted shape or
validation, and it was explicitly flagged (not silently deferred) three
commits in a row (`360691d`, and now here).

**Do not start SQLite migration next** unless a new migration plan is
explicitly approved separately — `schema.sql` existing is not the same as
a migration being ready to run, and §F lists several fields
(`outcomeMetricLinks`, unknown-metricId handling, `metric_name` NOT NULL)
that need resolution before any migration script should be written.
