# SOAP / Follow-up / Treatment Tracking — Professionalism Audit

Written: 2026-08-09 (Claude, at Ting's request). Status: **AUDIT.** Three
tiny, unambiguous fixes were implemented and verified (§9, marked ✅
DONE) — everything else in this document is a finding for Ting to decide,
not yet built.

Read together with: `docs/TCM_CASE_SPEC.md` · `docs/CASE_SOAP_FLOW_REVIEW.md`
· `docs/CLINICAL_GRAPH_TRACK.md` · `data/clinical_cases/schema.sql` ·
`data/clinical_cases/outcome_metrics.json` · `data/clinical_cases/
localstorage_sqlite_mapping.json` · `docs/INTAKE_MINIMUM_DATASET_AUDIT.md`
(the sibling audit for the Case/intake side of this same architecture).

Architecture is not reopened here: Patient → Case/Episode → Visit/SOAP →
Treatment Tracking → Case Reflection, per Ting's own framing. No fourth
layer, no intake fields moved into SOAP.

---

## 0. Method

Three sources of truth were cross-read, and where they disagreed the
**runtime** (what actually saves and reloads today) was treated as ground
truth, not the schema or the design docs:

1. **`index.html` `#soapForm`** — the actual fields a user can type into.
2. **`app.js` `normalizeSoapNote()` / `openSoapEditor()` / `saveSoapFromForm()`**
   — what actually gets read, defaulted, validated, and persisted.
3. **`data/clinical_cases/schema.sql` `soap_notes`/`visits` tables** — the
   *aspirational* future SQLite destination.
4. **`data/clinical_cases/localstorage_sqlite_mapping.json`** — the single
   most useful file for this audit. It states, field by field, exactly which
   runtime field maps to which schema column, and flags every case where
   the mapping is `unresolved_needs_ting` or `no_destination_yet` — i.e.
   every place schema and runtime already disagree, with the disagreement
   dated and reasoned. This audit's §D/§C findings mostly restate what that
   file already knew, applied to the specific "follow-up efficiency" and
   "TCM reasoning chain" questions Ting asked about.

One live multi-visit synthetic case was created (per the explicit permission
to do a focused check rather than a full T1 run) to verify §F. Full result
in §9's verification notes.

---

## 1. CURRENT SOAP FLOW summary

- One **`soapDialog`** modal, opened per visit via "新增 SOAP" (case-scoped
  — you must have a case selected first).
- **Visit context**: visitDate, visitNumber (auto-filled `count+1`, plain
  editable number — see §9 fix #3), cycleDay, cyclePhase, fertilityPhase,
  workflowLink.
- **S**: one free-text blob (`subjective`), placeholder text lists everything
  it's supposed to cover (主訴、變化、疼痛、睡眠、情緒、消化、月經/不孕、西藥更新、
  red flags) — nothing structured underneath.
- **O**: one free-text blob (`objective`, placeholder covers 望診/觸診/ROM/
  labs) + separately-fielded **tongueBody**, **tongueCoating**, **pulse**,
  **vitals**.
- **A**: one free-text blob (`assessment`) + a single-line free-text
  **tcmPattern** + **pathomechanism** (free text) + four canonical-id chip
  pickers (westernConditionLinks / easternDiseaseLinks / tcmPatternLinks /
  safetyFlagLinks — CS4, autocomplete against the real knowledge base).
- **P**: one free-text blob (`plan`) + **treatmentPrinciple** (free text) +
  **pointsUsed** (free text) + **acupointLinks** (chip picker) +
  **retentionMinutes** (number) + **technique** (free text) + **modalities**
  (one free-text line covering moxa/e-stim/cupping/gua-sha/tuina together) +
  **formulaHerbs** (free text) + **formulaLinks** (chip picker) +
  **westernMeds** (free text) + **medicationLinks** (chip picker) +
  **advice** (free text) + **followUp** (free text).
- **Outcome/reflection** (collapsed by default, matches LL1's "never
  pressure every visit" principle): **outcomes** (free text), **outcomeVerdict**
  (select: improved/no_change/worsened/lost_followup — LL2), **outcomeMetricLinks**
  (free text, e.g. `"pain_score 7->4"` — NOT a real value+metric row, see §D),
  **differentialConsidered** / **reflection** / **ifIneffectivePlan** (LL1,
  free text, under a `<details>`).
- **Storage**: a flat array `case.soapNotes[]` in `localStorage`, normalized
  through `normalizeSoapNote()`. `schema.sql`'s `soap_notes`/`visits` tables
  are considerably more granular than what the runtime actually populates —
  see §3.
- **Display**: newest-visit-first card list ("SOAP Timeline") plus a compact
  horizontal outcome-verdict-colored timeline (CS5, oldest→newest, click to
  jump), both on the case-detail page, both **behind** the modal once a SOAP
  dialog is open (`dialog::backdrop` dims the page — confirmed in
  `styles.css`).
- **New-visit flow**: opens completely blank except visitDate (today) and
  visitNumber. Nothing is carried forward from the previous visit.

---

## 2. BLOCKER

**None.** The save/reload/edit/multi-visit/case-switch mechanism itself is
solid — verified live this session (§9). Nothing here would stop Ting from
using this for repeated real follow-up visits starting now. What follows is
about *quality and future research value*, not "does it work."

---

## 3. IMPORTANT (structural — needs Ting's decision, not implemented)

Ranked by how much they affect either follow-up efficiency or longitudinal
research value.

1. **Structured outcome metrics don't exist yet — this is the single
   biggest, most consistent gap in the whole audit.** `outcome_metrics.json`
   has 22 well-designed metrics (CG6, done 2026-07-29). Nothing writes a
   real `{metric_id, value_number, unit}` record for *any* of them except
   the one field added this batch (`effect_duration_days`, §9). Every pain
   score, sleep number, stress level, or menstrual metric that gets typed
   today lives only as prose inside `outcomeMetricLinks` or `outcomes` —
   and this is not an oversight, it is a **standing decision**: Ting already
   rejected auto-converting `outcomeMetricLinks` text into `visit_outcomes`
   rows (2026-08, per the mapping file) because a value-less row reads as a
   measurement that never happened. The vocabulary is done; only the UI/
   runtime capture mechanism is missing.
2. **TCM pattern capture is split across two uncoordinated mechanisms.**
   `tcmPattern` (single free-text line) and `tcmPatternLinks` (multi-select
   canonical-id chips, feeds `visit_tcm_patterns`) both exist, both partly
   answer "what's the pattern this visit," and neither exposes the
   `visit_tcm_patterns.is_primary` distinction the schema already supports.
   A visit with two co-existing patterns (肝鬱脾虛 + 腎陰虛) has nowhere in
   the UI to say which one is primary today.
3. **`case_reflections` (CG9's six-question episode-level reflection) has
   zero UI**, anywhere. Schema landed 2026-07-29 with an explicit note
   "SOAP UI 待 Phase 2 後接" — that connection never happened. The three
   visit-level LL1 fields (differentialConsidered/reflection/ifIneffectivePlan)
   *do* have UI; the three still-missing case-level ones (what_changed /
   what_surprised / what_to_study) don't, and `what_to_study` is specifically
   supposed to feed a future review queue (CG10) that has nothing to draw
   from yet.
4. **No "what changed since last visit" assistance.** New-SOAP opens fully
   blank; the previous visit's full card is rendered on the page but sits
   behind the modal's dimmed backdrop once the dialog opens. Every follow-up
   currently requires either memory or minimizing the dialog to scroll and
   compare — there is no carry-forward, no diff, no compact "last visit"
   reference visible while typing.
5. **CG8's Baseline/Today/Change/Trend four-column display contract is
   entirely unbuilt** — confirmed by search, no "trend" or "baseline"
   rendering exists anywhere in `app.js`. This depends on #1 (structured
   metrics) existing first; building it before that would have nothing to
   display.
6. **Schema's granular S/O/A/P columns are unused.** `soap_notes` has 7
   separate `subjective_*` columns (chief_complaint, symptom_updates,
   pain_sleep_energy_mood, digestion_bowel_urination, menstrual_fertility_update,
   medication_supplement_update, red_flags_screen) and similar breakdowns
   for O/A/P. The runtime's single `subjective`/`objective`/`assessment`/`plan`
   blobs map to exactly ONE of those columns each
   (`subjective`→`subjective_symptom_updates`, etc.) — the other columns
   have no source field at all. This is not a bug (S is legitimately
   narrative, per §6 below), but it means the schema currently promises more
   structure than the app delivers, and nobody has decided whether that's
   the intended final shape or a partial migration.
7. **Fertility-specific tracking (`fertility_cycle_tracking` table)** has no
   runtime/UI wiring at all — separate and more elaborate than the 9
   fertility-related `metric.*` entries, worth noting as its own gap since
   it's a whole table, not a field.
8. **Visit-level safety flags migrate to a case-level table**
   (`safetyFlagLinks` → `case_safety_flags`), which loses which visit raised
   a flag once/if the SQLite migration happens. Not a current-runtime
   problem (today's JSON keeps it visit-scoped); flagged because it's a
   silent loss if migration runs as currently mapped.

---

## 4. ALREADY GOOD

- **Tongue body vs tongue coating**: correctly separate fields, both in UI
  and (per the mapping file) protected in schema — Ting already rejected an
  earlier proposal to merge them.
- **Pulse, vitals**: separate dedicated fields.
- **outcomeVerdict**: exactly the "improved/unchanged/worse" quick-select
  the audit asked to check for — already a `<select>`, already good, no
  change needed.
- **CS4 chip pickers** (westernConditionLinks/easternDiseaseLinks/
  tcmPatternLinks/safetyFlagLinks/acupointLinks/formulaLinks/medicationLinks):
  real autocomplete against the actual knowledge base, canonical ids only —
  already professional-grade.
- **CS5 outcome-verdict timeline**: compact, colored, clickable, oldest→
  newest — a real longitudinal-at-a-glance view that already exists.
- **Visit numbering**: auto-increments correctly on new-SOAP open; now also
  duplicate-guarded (§9).
- **Multi-visit / multi-case data reliability**: verified live this
  session — create, save, reload, edit an existing (non-latest) visit,
  switch cases, reload again. No cross-contamination, no data loss, no
  console errors, backward-compatible with visits saved before this batch.
- **LL1 visit-level reflection triad**: exists, appropriately tucked under a
  collapsed `<details>` — optional, no pressure to fill every visit.
- **Pathomechanism / treatment principle as separate fields, downstream of
  pattern**: matches `TCM_CASE_SPEC.md`'s intended reasoning order.

---

## 5. LATER (deferred on purpose, not urgent)

- **Modalities multi-select vocabulary** — existing precedent (Phase 1
  vitals/modalities schema work) already decided to wait for real usage
  data before building a fixed vocabulary; still the right call.
- **cyclePhase / fertilityPhase / technique as single-selects** — small
  closed vocabularies exist informally in placeholder text, but converting
  them isn't obviously safe without checking real usage first (same
  "don't invent a vocabulary nobody's confirmed" principle as Phase 2's
  Menstrual/Lifestyle deferral).
- **followUp as a structured "days until next visit" number + notes** — low
  urgency, current free text works.

---

## 6. Field-by-field input-type recommendations

| Field | Recommendation | Why |
|---|---|---|
| visitDate, visitNumber, cycleDay, retentionMinutes | ALREADY GOOD | already number/date inputs |
| cyclePhase, fertilityPhase | KEEP FREE TEXT (LATER: could become single-select) | small vocab exists only informally |
| workflowLink | KEEP AS-IS | registry reference, not user-typed prose |
| subjective (S) | **KEEP FREE TEXT** | narrative medicine — do not turn into checkbox soup, per instruction |
| objective (O) | **KEEP FREE TEXT** | same |
| tongueBody, tongueCoating, pulse | KEEP FREE TEXT | TCM tongue/pulse description is descriptive prose, not a clean enum |
| vitals | KEEP FREE TEXT | already decided (Phase 1 vitals/modalities schema work) |
| assessment (A) | **KEEP FREE TEXT** | same |
| tcmPattern | **STRUCTURED + NOTES — flagged IMPORTANT (§3.2)** | should probably resolve to tcmPatternLinks + primary marker, not a parallel free string; needs Ting's decision, not a tiny fix |
| pathomechanism, treatmentPrinciple | KEEP FREE TEXT | reasoning prose, correctly free per TCM_CASE_SPEC |
| westernConditionLinks/easternDiseaseLinks/tcmPatternLinks/safetyFlagLinks | ALREADY GOOD | chip pickers |
| plan (P) | **KEEP FREE TEXT** | same |
| pointsUsed, acupointLinks | ALREADY GOOD | chip picker |
| technique | KEEP FREE TEXT (LATER: small single-select candidate) | vocab not yet confirmed |
| modalities | MULTI-SELECT/CHIPS candidate — LATER | needs real usage data first (existing precedent) |
| formulaHerbs/formulaLinks, westernMeds/medicationLinks | ALREADY GOOD | chip pickers |
| advice, followUp, referralOrSupervisorQuestion (new) | KEEP FREE TEXT | narrative, appropriately so |
| outcomes | KEEP FREE TEXT | narrative summary |
| outcomeVerdict | ALREADY GOOD | select |
| outcomeMetricLinks | **STRUCTURED + NOTES — flagged IMPORTANT (§3.1)** | the big one; needs Ting's decision on shape |
| effectDurationDays (new) | NUMBER — done this batch | ✅ |
| differentialConsidered, reflection, ifIneffectivePlan | KEEP FREE TEXT | LL1: never model-prefilled, always narrative |

---

## 7. Longitudinal tracking gaps

Against `outcome_metrics.json`'s 22 metrics, classified per the requested
four categories:

| Metric group | Classification |
|---|---|
| pain (`metric.pain_score`) | **FIELD EXISTS, UI DOES NOT CAPTURE IT** — nameable only inside free-text `outcomeMetricLinks`/`outcomes` |
| sleep (`sleep_quality`/`sleep_hours`/`sleep_onset_minutes`/`night_wakings`) | same |
| stress/mood (`stress_level`/`mood`) | same |
| energy (`energy_level` — also covers fatigue per CG7, deliberately no separate `fatigue`) | same |
| bowel/digestion (`bloating`/`bowel_frequency`) | same |
| menstrual/fertility (`cycle_length`/`bleeding_days`/`menstrual_flow_volume`/`menstrual_clots`/`ovulation_confirmed`/`lh_surge`/`bbt_pattern`/`endometrial_lining`/`follicle_size`) | same, **plus** the separate `fertility_cycle_tracking` schema table has no runtime wiring at all |
| adverse reaction (`adverse_reaction`) | **FIELD EXISTS, UI DOES NOT CAPTURE IT** — no dedicated safety-labeled input; case-level `safetyFlagLinks` covers known risk factors, not "a bad reaction happened this visit" |
| post-treatment response (`post_treatment_reaction`) | same |
| effect duration (`effect_duration_days`) | **was** FIELD EXISTS, UI DOES NOT CAPTURE IT → **now ALREADY GOOD**, fixed this batch (§9) |

**Bottom line: nothing is a MISSING DATA FIELD.** The vocabulary is
complete and well-designed (CG6). Every gap here is "UI DOES NOT CAPTURE
IT" — the same gap, 21 times over, now closed for exactly one metric as a
proof of the pattern (§9 fix #1/#2).

---

## 8. TCM reasoning-chain gaps

Chain: observations/四診 → TCM disease → pattern → pathomechanism →
treatment principle → treatment → response.

- **Four exams**: tongue body/coating/pulse are correctly separate; 望
  (observation) and 聞 (palpation-adjacent findings) live inside the single
  `objective` blob — acceptable, this is narrative territory (§6).
- **TCM disease**: `easternDiseaseLinks` chip picker — clean, canonical, no
  gap.
- **Pattern**: the chain's weakest link. Two parallel, uncoordinated
  capture mechanisms (§3.2) with no primary/secondary distinction exposed,
  despite schema support existing (`visit_tcm_patterns.is_primary`).
- **Pattern evolution between visits**: visible only by scrolling the SOAP
  Timeline and reading each card's pattern line — there is no automatic
  diff or "pattern changed from X to Y" summary. Tied to the same "no
  carry-forward" gap in §3.4.
- **Pathomechanism → treatment principle**: correctly separate, correctly
  downstream, matches `TCM_CASE_SPEC.md`'s design intent — no gap.
- **Treatment**: points/formula captured cleanly via chip pickers;
  modalities remains one unstructured line (§5, deliberately deferred).
- **Response**: `outcomeVerdict` + `outcomes` + (new) `effectDurationDays`
  capture the coarse verdict, but nothing currently lets a query ask "did
  疏肝健脾 as a treatment principle correlate with `improved` outcomes over
  N visits" — that requires §3.1 (structured metrics) to exist first.

**Verdict**: the chain's *labels* all exist and live in roughly the right
places. The chain has one **duplicated** link (pattern, captured twice,
reconciled never) and ends in a link that **can't be measured yet**
(response, because outcome values aren't structured). Nothing is silently
lost or stored in the wrong place — it's genuinely a capture-mechanism gap,
not a data-loss bug.

---

## 9. Top 5 recommended changes — and what was actually done

Three items were unambiguous enough (single new nullable field or a client-
side check, no architecture decision, direct precedent from Phase 1) to
implement and verify this batch:

### ✅ DONE — Fix 1: `effectDurationDays` (Plan §3.1's top-named gap)

Ting named this specifically in `CLINICAL_GRAPH_TRACK.md` CG6 as the
priority gap ("決定療程間隔的依據,現有 12 個 metric 完全沒有覆蓋。優先補這一個").
Added `soap_notes.effect_duration_days INTEGER` (nullable, 0+ CHECK,
transitional — same reasoning and shape as `cases.baseline_severity_0_10`
from the Intake audit: bypasses the not-yet-built general structured-outcome
layer rather than waiting on it and losing the value in the meantime), a
matching SOAP form number field, and card display.

### ✅ DONE — Fix 2: `referralOrSupervisorQuestion`

`soap_notes.plan_referral_or_supervisor_question` already existed in schema,
unused — the audit's own P-section checklist asked about this exact field.
Added the matching runtime field, form textarea, and card display. Zero
schema change (column already there).

### ✅ DONE — Fix 3: duplicate visit-number guard

`visitNumber` was a plain editable number with no uniqueness check — the
same class of gap the `patientCode` duplicate guard already closed
elsewhere. Now blocks (alert, no save) if the chosen visit number already
exists elsewhere in the same case, telling you which date it collides with.

**Not implemented — need Ting's decision (ranked, next 5):**

1. **Reconcile `tcmPattern` vs `tcmPatternLinks`, expose primary/secondary.**
   Highest clinical-reasoning value; `is_primary` column already exists.
   Medium risk only because it changes an existing field's meaning.
2. **Wire ONE structured outcome metric** (start with `pain_score` — highest
   frequency, and there's now a direct precedent from fixes #1/#2) as a
   dedicated number field instead of leaving all 22 in free-text purgatory.
   Proves the pattern before deciding whether to generalize.
3. **A compact "last visit at a glance" strip visible while the New-SOAP
   dialog is open** — directly answers the audit's own Section B question.
   Medium-high value, medium risk (touches dialog UX, needs a design call
   on where it lives).
4. **Wire `case_reflections` UI** (CG9's six-question episode reflection) —
   fully speced, schema-ready since 2026-07-29, mirrors the existing LL1
   `<details>` pattern already proven at the visit level.
5. **CG8's Baseline/Today/Change/Trend display** — highest long-term
   research value, but sequence *after* #2: there is nothing to display
   until at least one metric is structured.

---

## Verification (Fixes 1–3)

`node:sqlite` schema execution: `soap_notes` 40→41 columns, clean. `node --check app.js`
clean. `validate-clinical-case-standard` PASS (0 problems). `check-validation-ratchet`
PASS (no regressions). `validate-data`/`validate-relations` clean. `git diff --check` clean.

Live, on one focused synthetic multi-visit case (not a full T1 run, per
instruction): created a case, added Visit 1 and Visit 2 with full S/O/A/P +
tongue/pulse/pattern/points/outcome content, edited Visit 1 after Visit 2
existed (retroactive verdict update) without disturbing Visit 2, switched to
a second case and confirmed zero cross-contamination, reloaded — all data
exact. Then, with the three fixes live: confirmed the duplicate-visit-number
guard blocks a real collision (with the colliding date named in the alert)
and does *not* block a legitimate new number; added Visit 3 with
`effectDurationDays=6` and a `referralOrSupervisorQuestion`, saved, reloaded,
reopened the case detail — both new fields persisted exactly and render on
the card; confirmed Visits 1–2 (saved *before* this batch's code existed)
still render with zero console errors and no missing-field breakage.
