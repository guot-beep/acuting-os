# Outcome Metrics Semantic Audit v2 — Numeric Shape / Clinical Meaning / UI Wiring Readiness

Written: 2026-08 (Claude, at Ting's request). Original status at the time
this document was written: **AUDIT + DESIGN ONLY — no metric wired, no code
changed, no schema changed.** That was true on the day this was written; it
is no longer the current state.

**Status update (2026-08, correction):** the historical audit below is
unchanged and its reasoning still holds — this note only corrects the
"nothing is wired yet" framing, which the runtime has since passed.
Implementation proceeded in three batches after this document's
recommendation in §8: `metric.stress_level`/`metric.mood`/
`metric.energy_level`/`metric.sleep_quality` (commit `c16099b`), then
`metric.bloating`/`metric.sleep_onset_minutes`/`metric.night_wakings`/
`metric.bowel_frequency` (commit `360691d`). **Current wired numeric
metrics: 11 of the 22 total vocabulary definitions.** Full lineage:
`63f0896` (pain_score) → `eda9819` (sleep_hours) → `1a3a426`
(effect_duration_days, reconciled from a legacy field) → `c16099b` (batch
2, four 0–10 scales) → `360691d` (batch 3, four mixed-shape metrics) →
whatever commit accompanies Outcome Tracking v1 (see
`docs/CLINICAL_OUTCOMES_HANDOFF.md`, which supersedes this note as the
single up-to-date status source — read that file for current state,
read this file for the numeric-shape reasoning behind each metric).

Supersedes the coarse classification in `docs/SOAP_FOLLOWUP_TRACKING_AUDIT.md`
§9/§7 for numeric-shape purposes — that pass grouped everything non-0–10 as
"continuous numeric," which conflated counts, whole-unit durations, and
decimal measurements into one bucket. This document reclassifies from the
current `data/clinical_cases/outcome_metrics.json` directly, field by field,
not from the earlier report.

Read together with: `app.js` `NUMERIC_OUTCOME_METRIC_CONFIG` /
`getOutcomeMetricDef()` / `renderNumericOutcomeMetricInputs()` /
`computeNumericOutcomeMetrics()` / `formatNumericOutcomeMetrics()` ·
`data/clinical_cases/schema.sql` `visit_outcomes` ·
`data/clinical_cases/localstorage_sqlite_mapping.json`.

---

## 0. What's already wired

Historical note: at the time this section was first written, only three
metrics were wired (the table below, first three rows). **That is stale —
see the status update at the top of this document.** Eleven are wired now,
all proven end-to-end (create/save/reload/edit/multi-visit/multi-case,
verified live in-browser, each in its own commit):

| metric_id | commit |
|---|---|
| `metric.pain_score` | 63f0896 |
| `metric.sleep_hours` | eda9819 |
| `metric.effect_duration_days` | 1a3a426 (reconciled from a pre-existing legacy field) |
| `metric.stress_level` | c16099b |
| `metric.mood` | c16099b |
| `metric.energy_level` | c16099b |
| `metric.sleep_quality` | c16099b |
| `metric.bloating` | 360691d |
| `metric.sleep_onset_minutes` | 360691d |
| `metric.night_wakings` | 360691d |
| `metric.bowel_frequency` | 360691d |

Config shape in use today (unchanged since this document was written —
every metric above fits it with zero extension, confirming the §6
prediction held):
```js
{ metricId, min, max, integer, legacyField? }
```

---

## 1. Classification model

| Letter | Type | Meaning |
|---|---|---|
| A | bounded_integer_scale | fixed 0–N subjective scale, whole numbers |
| B | bounded_decimal_scale | fixed-range scale allowing decimals (none found this pass) |
| C | nonnegative_integer_count | a tally — no natural upper bound, decimals meaningless |
| D | nonnegative_integer_duration | elapsed time in whole units (days, minutes) |
| E | nonnegative_decimal_duration | elapsed time where fractional units are real (hours) |
| F | decimal_measurement | a physical measurement where sub-unit precision is standard clinical practice (mm) |
| G | boolean | 2–3 state (yes/no/unknown, positive/negative/unknown) |
| H | categorical | fixed label set, not ordered/numeric |
| I | free_text / narrative | genuinely textual |
| J | unclear_requires_decision | (none found this pass — every metric's `unit` field was specific enough to classify without guessing) |

---

## 2. Full classification table

| metric_id | name | unit | category | direction_good | type | int/dec | min | max | step | blank ok | zero meaningful | individualized | wired | readiness |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pain_score | pain_score | 0-10 | symptom | decrease | A | int | 0 | 10 | 1 | yes | yes (no pain) | no | **YES** | READY |
| sleep_quality | sleep_quality | 0-10 | symptom | increase | A | int | 0 | 10 | 1 | yes | yes (worst) | no | no | READY |
| sleep_hours | sleep_hours | hours | symptom | individualized | E | dec | 0 | null | any | yes | yes (no sleep) | yes | **YES** | READY |
| sleep_onset_minutes | sleep_onset_minutes | minutes | symptom | decrease | D | int | 0 | null | 1 | yes | yes (fell asleep instantly) | no | no | READY |
| night_wakings | night_wakings | count_per_night | symptom | decrease | C | int | 0 | null | 1 | yes | yes (slept through) | no | no | READY |
| stress_level | stress_level | 0-10 | symptom | decrease | A | int | 0 | 10 | 1 | yes | yes (no stress) | no | no | READY |
| mood | mood | 0-10 | symptom | increase | A | int | 0 | 10 | 1 | yes | yes (worst) | no | no | READY |
| energy_level | energy_level | 0-10 | symptom | increase | A | int | 0 | 10 | 1 | yes | yes (worst) | no | no | READY |
| bloating | bloating | 0-10 | symptom | decrease | A | int | 0 | 10 | 1 | yes | yes (none) | no | no | READY |
| bowel_frequency | bowel_frequency | count_per_week | symptom | individualized | C | int | 0 | null | 1 | yes | yes (no BMs — clinically significant) | **yes** | no | READY |
| cycle_length | cycle_length | days | fertility | individualized | D | int | 0* | null | 1 | yes | **not applicable** — 0 isn't a real cycle length, distinct from "not measured" | **yes** | no | NEEDS_SMALL_DECISION |
| bleeding_days | bleeding_days | days | fertility | individualized | D | int | 0 | null | 1 | yes | yes (amenorrhea this cycle is a real, trackable state) | **yes** | no | READY |
| menstrual_flow_volume | menstrual_flow_volume | scanty/normal/heavy | fertility | individualized | H | — | — | — | — | — | — | — | no | NOT_FOR_NUMERIC_RENDERER |
| menstrual_clots | menstrual_clots | none/small/large | fertility | decrease | H | — | — | — | — | — | — | — | no | NOT_FOR_NUMERIC_RENDERER |
| ovulation_confirmed | ovulation_confirmed | yes/no/unknown | fertility | yes | G | — | — | — | — | — | — | — | no | NOT_FOR_NUMERIC_RENDERER |
| lh_surge | lh_surge | positive/negative/unknown | fertility | contextual | G | — | — | — | — | — | — | — | no | NOT_FOR_NUMERIC_RENDERER |
| bbt_pattern | basal_body_temperature_pattern | text | fertility | contextual | I | — | — | — | — | — | — | — | no | NOT_FOR_NUMERIC_RENDERER |
| endometrial_lining | endometrial_lining | mm | fertility | contextual | F | dec | 0 | null | any | yes | technically valid (thin early-cycle lining) but rare, not a "good/bad" marker | contextual | no | NEEDS_SMALL_DECISION |
| follicle_size | follicle_size | mm | fertility | contextual | F | dec | 0 | null | any | yes | not realistic in practice | contextual | no | NEEDS_SMALL_DECISION |
| post_treatment_reaction | post_treatment_reaction | text | treatment_response | contextual | I | — | — | — | — | — | — | — | no | NOT_FOR_NUMERIC_RENDERER |
| effect_duration_days | effect_duration_days | days | treatment_response | increase | D | int | 0 | null | 1 | yes | yes (no lasting effect is a real, trackable answer) | no | **YES** | READY (confirmed, unchanged) |
| adverse_reaction | adverse_reaction | text | safety | none | I | — | — | — | — | — | — | — | no | NOT_FOR_NUMERIC_RENDERER |

\* cycle_length's `min: 0` is a placeholder floor, not a claimed realistic value — see §3.11 and the NEEDS_SMALL_DECISION note.

**Type tally**: A (bounded integer scale) 6 · C (integer count) 2 · D (integer duration) 4 · E (decimal duration) 1 · F (decimal measurement) 2 · G (boolean) 2 · H (categorical) 2 · I (free text) 3. Total 22.

---

## 3. Special semantic questions, answered from the actual vocabulary

**A note on what `unit` does and doesn't prove (correction, 2026-08).** An
earlier version of this section repeatedly read `unit` as if it settled
integer-vs-decimal by itself. It doesn't. `unit` is a reliable vocabulary
fact for the *kind and range of quantity* — that `"0-10"` is a bounded
0–10 scale, that `"minutes"`/`"days"` is a duration, that `"mm"` is a
physical measurement. Whether values within that shape must be whole
numbers or may carry decimals is a separate call, not encoded in the unit
string itself — `"days"` alone doesn't forbid decimals and `"mm"` alone
doesn't require them. Below, where an answer says a range or quantity kind
is "confirmed by `unit`," that confirms the vocabulary fact only; the
accompanying integer/decimal choice is stated as an explicit AcuTing
clinical/UI convention layered on top, for the reason given in each case.
This note changes no classification — every type/int-or-decimal/min/max
call in §2 and the recommendation in §8 are unchanged; only how they're
justified below is corrected.

**1–5. Are sleep_quality, stress_level, mood, energy_level, bloating all truly 0–10 scales?**
Yes — the 0–10 range itself is confirmed directly from each record's `unit` field (`"0-10"`, not inherited from the prior report), a vocabulary fact. All five also have a defined `direction_good` (increase/decrease, never "individualized"), meaning — unlike sleep_hours or bowel_frequency — there's a universal "which way is better" for these, same shape as `pain_score` exactly. Whole-number entry within that 0–10 range (no `7.5` scores) is not something `"0-10"` proves on its own; it is an explicit AcuTing convention applied uniformly to every subjective 0–10 scale in this vocabulary — the same convention `pain_score` already uses. No correction needed to the range/shape classification here; the earlier report's assumption on this specific group happened to be right.

**6. sleep_onset_minutes — decimal or integer?**
`unit: "minutes"` confirms this is a duration (vocabulary fact); it does not by itself rule out decimals. Whole-minute entry is proposed as the AcuTing convention here because that matches how it's actually estimated clinically ("about 20 minutes," not "20.4 minutes") — nobody times sleep onset with sub-minute precision. Type D, same shape as `effect_duration_days`.

**7. night_wakings — integer count? How should 0 behave?**
Integer count, confirmed by `unit: "count_per_night"` — a tally, decimals are meaningless (there is no such thing as 2.5 wakings). Zero is a real, desirable, trackable answer ("slept through the night") — not "not measured." No natural upper bound; not inventing one.

**8. bowel_frequency — is integer count the correct representation?**
Yes. `unit: "count_per_week"` is explicitly a count. Unlike night_wakings, `direction_good` here is `"individualized"` — there is no universal "more/fewer is better," bowel frequency varies by person, so the runtime should never imply a target. No cap invented, per instruction — a very high or very low weekly count is exactly the kind of value this field exists to record honestly.

**9. cycle_length — whole days or decimal days?**
`unit: "days"` confirms this is a duration (vocabulary fact); it does not by itself say whole days only. Whole days is proposed as the AcuTing convention here, matching how menstrual cycles are conventionally counted in whole calendar days (day 1 = first day of bleeding to the next day 1) in both clinical and TCM charting practice. Type D.

**10. bleeding_days — whole days or decimal days?**
Same as cycle_length: `unit: "days"` confirms duration, not granularity. Whole days proposed as the same convention. Type D.

**11. endometrial_lining — should decimals like 7.5 be preserved?**
`unit: "mm"` confirms this is a physical measurement (vocabulary fact); it does not by itself mandate decimal precision. Decimal entry (e.g. `7.5`) is proposed as the AcuTing convention here for a real clinical-practice reason, not because the unit string requires it: endometrial thickness on ultrasound is conventionally reported to one decimal place. Type F, decimal.

**12. follicle_size — should decimals be preserved?**
Same as endometrial_lining: `unit: "mm"` confirms measurement, not decimal-vs-integer. Decimal entry proposed as the same convention, for the same kind of reason — dominant follicle measurements are conventionally reported with decimal precision (e.g. "18.5mm"). Type F, decimal.

**13. effect_duration_days — does the existing integer decision remain consistent?**
Yes, confirmed, unchanged. It sits in the same type D bucket as sleep_onset_minutes/cycle_length/bleeding_days — all four are "elapsed time in whole units," and none of the other three arguments for allowing decimals apply to any of them either. The 1a3a426 decision was correct and this fuller audit reinforces it rather than revising it.

---

## 4. Corrections to the previous classification

`docs/SOAP_FOLLOWUP_TRACKING_AUDIT.md`'s §9 table had a single **"continuous numeric" bucket of 8**: sleep_hours, sleep_onset_minutes, night_wakings, bowel_frequency, cycle_length, bleeding_days, endometrial_lining, follicle_size. That bucket implied "these are all decimal-shaped," which is the exact assumption this round was asked not to inherit. Splitting it:

- **Stays decimal (type E/F, 3 of the 8):** sleep_hours (E), endometrial_lining (F), follicle_size (F) — genuinely decimal, for two different reasons (a duration people report fractionally, vs. a measurement with standard sub-unit clinical precision).
- **Reclassified to integer duration (type D, 3 of the 8):** sleep_onset_minutes, cycle_length, bleeding_days — these are elapsed-time-in-whole-units, not decimal-shaped at all.
- **Reclassified to integer count (type C, 2 of the 8):** night_wakings, bowel_frequency — these are tallies. "count_per_night" and "count_per_week" were always in the unit field; the previous pass didn't act on what the unit string already said.

The bounded-0–10-scale group of 6 (pain_score + sleep_quality + stress_level + mood + energy_level + bloating) is **confirmed correct**, re-verified from `unit` directly rather than carried over. The boolean (2), categorical (2), and free-text (3) groups are also confirmed unchanged.

---

## 5. Zero and blank semantics — summary rule

Every numeric metric in this vocabulary follows the same two rules already proven by `pain_score`/`sleep_hours`/`effect_duration_days`, and nothing in this audit changes them:

- **Blank always means "not measured."** Never coerced to 0, never coerced to any other value. `setOutcomeMetricValue()` already enforces this by removing the array entry entirely rather than storing a null.
- **Zero is a real, distinct value wherever it is a real clinical answer** — confirmed metric-by-metric above (yes for pain/sleep_quality/night_wakings/bowel_frequency/bleeding_days/effect_duration_days; not realistically applicable for cycle_length, endometrial_lining, follicle_size, though not forbidden).

No metric in this vocabulary needed a THIRD state beyond "blank" and "a real number including possibly zero" — the existing `getOutcomeMetricValue`/`resolveNumericMetricValue` two-state model is sufficient for all 22, not just the 3 already wired.

---

## 6. Is the current config shape sufficient?

**Yes, for every metric classified READY above, with zero extension.** Every one of them fits `{ metricId, min, max, integer }` exactly as it stands:

```js
{ metricId: "metric.stress_level", min: 0, max: 10, integer: true }
{ metricId: "metric.sleep_onset_minutes", min: 0, max: null, integer: true }
{ metricId: "metric.night_wakings", min: 0, max: null, integer: true }
```

The `integer: true/false` flag already generalizes past "0–10 vs decimal" to "any bounded/unbounded integer vs any bounded/unbounded decimal" — that was the whole point of building it generically in a1348b5, and this 22-metric sweep is the first real stress test of that claim. It holds.

**Not proposing `valueType`/`step`/`displayPrecision` right now.** They were offered as *possible* extensions, not requirements, and nothing in this batch's recommended next metrics needs them — `integer: true/false` already implies `step` (`1` vs `"any"`) exactly as today's renderer computes it. `displayPrecision` is a real future concern for `endometrial_lining`/`follicle_size` (decimal mm values could pick up floating-point noise, e.g. `7.500000000001`), but since neither is in the recommended batch (§8), it stays a documented "when we get there" note, not a change made now.

**Not proposing anything for `outcome_metrics.json` itself.** Nothing in this audit's min/max/integer decisions is clinical meaning — they're all restatements of what the `unit` field already says (a count is a count, a 0–10 scale is a 0–10 scale). Confirms the a1348b5 design boundary held up under a full 22-metric sweep, not just the original 2.

---

## 7. Runtime unknown-metric-id validation

**Classification: worthwhile before more metrics — as a cheap config-authoring-time self-check, NOT as full save-time input validation. Not implemented this round, per instruction.**

Tradeoffs:

- **Current actual risk is low.** The only code path that ever creates an `outcomeMetrics[]` entry is `computeNumericOutcomeMetrics()`, which iterates `NUMERIC_OUTCOME_METRIC_CONFIG` — a hardcoded array a developer edits, not a user-facing input. There is no current UI or import path that lets an arbitrary string reach `metricId`. A bad id's actual failure mode today is already graceful: `outcomeMetricLabel()` falls back to printing the raw id string if `getOutcomeMetricDef()` returns null — cosmetic, not a crash, not silent data corruption.
- **The risk that IS real: copy-paste typos in the config array**, and that risk scales with how many entries exist. Adding this metric's worth of protection (4 more entries, per §8) roughly doubles the config's line count; the next batch after that would double it again. The cheapest time to add a self-check is before the array gets long enough that a typo is hard to spot by eye.
- **What "worthwhile now" would look like, if it were built** (not built this round): a one-time assertion at app init — `NUMERIC_OUTCOME_METRIC_CONFIG.forEach(cfg => { if (!getOutcomeMetricDef(cfg.metricId)) console.error(...) })` — costs nothing at runtime, catches a config typo the moment the page loads in dev, and is a completely different (much cheaper) thing than validating arbitrary save-time input.
- **Full save-time validation of `outcomeMetrics[]` entries against the vocabulary is correctly deferred to migration.** That is where the actual threat model changes — a future import/merge feature or a hand-edited JSON file is the first time an *externally supplied* id could realistically reach this array, and `localstorage_sqlite_mapping.json` already documents that a migration script must fail loudly there. Building that check into the live SOAP form now would be solving a problem that doesn't exist yet at the cost of real complexity (what does the UI even do with a "this id doesn't exist" error mid-edit?).

Recommendation for whoever picks up §8: add the cheap config-authoring assertion alongside that batch's four new config lines, not as a separate task.

---

## 8. Recommended next implementation batch (NOT implemented this round)

**Four metrics, all type A (bounded_integer_scale), identical shape to the already-proven `pain_score`:**

```js
{ metricId: "metric.stress_level", min: 0, max: 10, integer: true },
{ metricId: "metric.mood", min: 0, max: 10, integer: true },
{ metricId: "metric.energy_level", min: 0, max: 10, integer: true },
{ metricId: "metric.sleep_quality", min: 0, max: 10, integer: true },
```

Why these four over the other four READY metrics (sleep_onset_minutes,
night_wakings, bowel_frequency, bloating):

- **Zero new design questions.** Same exact config shape as `pain_score`
  down to every field value (`min:0, max:10, integer:true`) — the lowest
  possible implementation risk of anything in this audit.
- **Broadest clinical applicability.** Stress/mood/energy/sleep-quality are
  relevant to nearly every follow-up visit regardless of chief complaint,
  not narrowed to a digestive or sleep-specific case the way
  bowel_frequency or night_wakings are. `bloating` was left for a later
  batch for exactly that narrower-applicability reason, not because
  anything is wrong with it — it's equally READY.
- **No fertility-workflow logic** — none of the four touch
  `fertility_cycle_tracking` or cycle-phase context.
- **No legacy conflict** — none of the four have a pre-existing direct
  field the way `effect_duration_days` did; this would be a clean first
  save for all four on every note, no `resolveNumericMetricValue`/
  `legacyField` complexity needed.
- **Meaningful tracking value** — together with `pain_score`, this gives a
  five-metric "how are you doing today" battery covering the most commonly
  tracked TCM symptom-response dimensions in one pass, a genuinely useful
  jump in longitudinal coverage rather than four isolated additions.

Deferred to a later batch, still READY, not blocked on anything: bloating,
sleep_onset_minutes, night_wakings, bowel_frequency.

Deferred pending a small decision, per §2/§6: cycle_length's `min` (0 vs a
more clinically honest floor), and whether endometrial_lining/follicle_size
belong in this generic renderer at all given their fertility-monitoring
workflow context, independent of their numeric shape being perfectly
fine.

Not for this renderer at all: menstrual_flow_volume, menstrual_clots
(categorical) · ovulation_confirmed, lh_surge (boolean) · bbt_pattern,
post_treatment_reaction, adverse_reaction (free text) — none reclassified
by this audit, all confirmed to need a different renderer type entirely.
