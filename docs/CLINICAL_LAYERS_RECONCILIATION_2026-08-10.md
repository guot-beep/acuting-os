# Clinical Layers Reconciliation — 2026-08-10 architecture checkpoint

Ting approved a new direction set — full text in
`docs/CLINICAL_DATA_CAPTURE_V2_DIRECTION_2026-08-10.md` (copied verbatim from her
handoff file). This doc reconciles it against the repo as of `388c947`.
**No code changed in this checkpoint — design only.**

> **2026-08-10 evening update — Ting locked the open calls (recorded as D17 in DECISIONS.md; med→drug was already D15):**
> canonical supplement namespace is **`supp.*`** (NOT `suppl.*` as the V2 direction
> doc's §6 spelled it — this reconciliation has been updated to `supp.*` throughout);
> `drug.*` is canonical for medications with `med.*` kept as non-deleted legacy
> aliases; `sym.*` and `metric.*` are complementary, not competing; visit pattern
> roles are primary|secondary for MVP (root|branch reserved); baseline + visit-level
> exposure changes must form ONE reconstructable timeline.

---

## A. ALREADY SUPPORTED

- **Cond ↔ Tdis ↔ Pattern are not 1:1** — already locked as D11 (four namespaces, the
  namespace IS the type; cross-namespace homonyms are two entities). The registry edge
  semantics for `related_patterns` / `related_eastern_diseases` is already
  "possible_overlap — never one-to-one equivalence".
- **Differentiation happens at Case/Visit level** — `case_tcm_patterns` (confidence,
  evidence, dated), `visit_tcm_patterns` (many patterns per visit, `is_primary`),
  `case_western_conditions` (`diagnosis_status`), `case_eastern_diseases`. D9 keeps
  clinical usage out of knowledge records.
- **Structured IDs alongside free-text SOAP** — `visit_acupuncture` (point.*),
  `visit_formulas`, `visit_herbs`, `visit_western_medications`, `visit_outcomes`
  (+ `metric_id` → metric.*), `case_safety_flags`, plus `visit_observations`
  (schema-only, empty). D12 additive-only contract protects all of it from 9/01.
- **Pharm taxonomy skeleton exists** — PHARM_CARD_TEMPLATE §1 六層 L1–L6:
  `drugsystem.*` / `drugtarget.*` / `drugclass.*` / `drug.*`, seeded in
  `data/pharmacology/` (15 drugs, classes/targets/systems files live). Direction 4's
  "categorization too weak" predates this design; the real gap is B3 below.
- **Analytics primitives** — dated visits, numeric `visit_outcomes`, canonical IDs on
  interventions. Seasonal / population / treatment-outcome queries are answerable once
  the missing layers below exist; no dashboard needed now (per direction 9).
- **"Lifestyle never auto-converts to a TCM diagnosis"** — nothing in the codebase does
  this today, and D9/D13 already forbid clinical→knowledge persistence. Needs to be
  *written down* as a rule (→ E8), but no existing behavior violates it.
- **Derived time/season fields (V2 §13)** — `visits.visit_date` exists; month/quarter/
  season/rolling windows are derivable. No season column needed; nothing to add.
- **Data isolation (V2 §16)** — already the architecture: schema references knowledge
  IDs only, real cases live in localStorage/private store, PHI validator exists,
  knowledge records never carry clinical stats (D9).
- **Outcome metrics (V2 §12)** — `visit_outcomes` + `metric_id` → metric.* plus the
  Outcome Tracking v1 Baseline/Today/Change/Trend work (`388c947`) already match the
  "reuse, don't duplicate" instruction. Nothing new needed for 9/5.

## B. PARTIALLY SUPPORTED

1. **Typed relations** — edges exist but are plain ID arrays with one blanket
   semantics. `associated_with` / `may_present_as` / `differential_candidate` are not
   representable per-edge. Pattern V2-C's STOP note already queues "relation
   types/edges" as未開始 work — this direction slots into that track.
2. **Longitudinal medication tracking** — `visit_western_medications` has dose,
   frequency, start/end, adherence, but rows are per-visit snapshots. No case-level
   ledger with `current/stopped` status or between-visit change derivation.
3. **Pharmacology namespaces** — TWO parallel drug namespaces are live: legacy `med.*`
   (12 fertility seeds, `data/medications/`, wired to the app and
   `visit_western_medications`) vs `drug.*` (`data/pharmacology/`, the card track).
   `medication_alias_map.json` exists but canonicalization is undecided.
4. **Structured observations** — `visit_observations` table exists but is empty. The
   `sym_id` fork flagged in schema.sql is now RESOLVED (D17): `sym.*` = symptom/
   clinical finding, `metric.*` = measurement instrument/tracked value — different
   concepts, neither collapses into the other. `visit_observations.sym_id` stays
   sym.*; a symptom may optionally link to one or more measurements
   (e.g. sym.insomnia → metric.sleep_quality + metric.sleep_duration_hours), which
   `visit_outcomes.metric_id` rows already carry — an optional additive
   `related_sym_id` on `visit_outcomes` (or a link table) makes the association
   explicit. Design note only; no DDL tonight.
5. **Capture UI** — chip pickers exist for points/herbs/formulas/patterns; medications
   fall back to `name_text`; supplements/lifestyle/exposures have no capture path.
6. **Differential vs working patterns (V2 §4)** — `visit_tcm_patterns` has `is_primary`
   but no `role` (primary/secondary/root/branch) or per-visit `confidence`, and there
   is no visit-level differential-candidates list (`case_tcm_patterns.confidence`
   exists but only at case level). Additive fix in E.

## C. MISSING

- **`supp.*`** — no supplement namespace, records, categories, template, or validator
  anywhere. Planned categories: vitamins, minerals, botanical extracts, fatty acids,
  probiotics, coenzymes/antioxidants, performance, multi-ingredient.
- **`life.*`** — only `case_intake_baseline.lifestyle_notes` free text. No structured
  factors (sleep timing/duration, caffeine, smoking/vaping, alcohol, exercise,
  sedentary, raw/cold foods, raw seafood, very hot beverages, late meals, high sugar).
- **`exposure.*`** — no environmental/toxic exposure layer (wildfire smoke, mold, lead,
  mercury, pesticides, solvents, occupational dust). Grep hits for "exposure" in the
  repo are incidental prose.
- **`adverse_event.*`** — zero mentions in schema.sql. Only the (empty)
  `common_adverse_effects_*` knowledge fields on drug cards.
- **Exposure ledger table** — nothing stores an agent's history across visits.
- **`modality.*`** (V2 §3) — no modality namespace; moxa/e-stim/cupping live only in
  free-text columns (`plan_moxa_e_stim_notes`, `visit_acupuncture.moxa`). Needed so
  adverse events can point at a modality, not just prose.

## D. CONFLICTS / RISKS

1. **D12 freeze 2026-09-01** — new tables/columns should land BEFORE 9/01. Additive
   changes stay legal after, but a wrong shape post-freeze is permanent. The schema's
   own rule: 寧可表先建好空著.
2. **`med.*` vs `drug.*`** — DECIDED (existing D15 of 2026-08-06, reconfirmed by Ting 2026-08-10): `drug.*` is canonical for new medication
   identities. `med.*` records are NEVER destructively deleted — they are legacy
   compatibility/migration aliases mapping toward `drug.*` via
   `medication_alias_map.json`. Migration gate: after it, new real Clinical Visits
   must not create new `med.*` references. Until the gate lands, `med.*` writes are
   tolerated and alias-resolvable.
3. **Typed relations must be additive** — existing edge arrays are consumed by
   validators and CG4. Types arrive as a NEW registered field/attribute in
   relation_registry (D13), never by retyping arrays in place.
4. ~~`sym_id` fork~~ — RESOLVED by D17: sym.* and metric.* are complementary (see B4).
   The separate lifestyle table in E3 stays — lifestyle factors are behaviors, not
   symptoms, and still don't belong in `visit_observations`.
5. **Namespace proliferation** — D11's "namespace IS the type" is diagnostic-side; the
   new namespaces are now LOCKED by D17 (`supp.*` — NOT `suppl.*` — plus `life.*`,
   `exposure.*`, `adverse_event.*`, `modality.*`) so agents must not invent variants
   (`suppl.*`, `supplement.*`, `ae.*`).
6. **Scope: 26 days to 9/5** — MVP is *capture*, not taxonomy completeness. Vocabulary
   seeds stay at dozens of entries, not hundreds. No dashboards (direction 9).

## E. Proposed minimal schema changes (all additive; land before 9/01)

All case-level (no wired Patient entity yet — same caveat as intake; D4 coarse dates
throughout; free text always allowed beside the ID).

> **Timeline principle (D17, Ting):** long-term baseline exposure and Visit-level
> changes belong to ONE coherent longitudinal model — baseline "coffee 3 cups/day"
> plus Visit #4 "changed to 1 cup/day" must reconstruct the full timeline. Applies to
> `drug.*`, `supp.*`, `life.*`, `exposure.*`. Concretely: E1/E2 ledger rows are the
> baseline+state, and per-visit changes reference the SAME ledger row
> (`change_since_last` + visit ids) — never a disconnected second system.

1. **`case_agent_exposures`** — the longitudinal ledger (directions 3+5):
   `agent_type` ('drug'|'supplement'), `agent_id` (drug.*/supp.*, nullable),
   `name_text`, `dose_text`, `frequency_text`, `route`, `start_approx`, `stop_approx`,
   `status` ('current'|'stopped'|'prn'|'unknown'), `adherence_note`,
   `info_source` ('patient_reported'|'records'), `first_noted_visit_id`,
   `last_confirmed_visit_id`,
   `change_since_last` ('unchanged'|'started'|'stopped'|'dose_changed'|
   'frequency_changed', V2 §7), `change_note`, `notes`.
2. **`case_environmental_exposures`** (direction 7):
   `exposure_id` (exposure.*, nullable), `name_text`,
   `certainty` ('suspected'|'patient_reported'|'confirmed'),
   `timing` ('ongoing'|'historical'|'unknown'), `start_approx`, `end_approx`,
   `context_text`, `notes`.
3. **`visit_lifestyle_factors`** (direction 6):
   `factor_id` (life.*, nullable), `name_text`, `value_number`, `unit`, `value_text`,
   `frequency_text`, `notes`. Quantitative when possible. NEVER auto-mapped to a
   pattern (E8).
4. **`visit_adverse_events`** (direction 8):
   `intervention_type` ('acupuncture'|'cupping'|'moxa'|'herbs'|'formula'|'other'),
   `intervention_ref_id` (nullable), `event_id` (adverse_event.*, nullable),
   `name_text`, `severity` ('mild'|'moderate'|'severe'),
   `onset_text`, `resolution_status` ('resolved'|'resolving'|'ongoing'|'unknown'),
   `resolved_date`, `notes`.
5. **Working-pattern model (V2 §4, roles locked by D17)** — additive columns on
   `visit_tcm_patterns`: `role` (MVP supports 'primary'|'secondary'; 'root'|'branch'
   reserved in the vocabulary for later, no CHECK constraint blocking them;
   `is_primary` stays and is never removed) and `confidence` (eventually supported;
   column lands now, UI later); plus new table `visit_pattern_differentials`
   (`visit_id`, `pattern_id`, `ruled_out` 0/1, `note`) for candidates considered.
6. **Vocabulary seeds** in `data/config/` (each ≤30 entries, build-data wired):
   `supplement_category_vocabulary.json`, `lifestyle_factor_vocabulary.json`
   (hierarchical ids per V2 §8, e.g. `life.sleep.late_bedtime`),
   `exposure_vocabulary.json`, `adverse_event_vocabulary.json`,
   `modality_vocabulary.json` (small: acupuncture, e-stim, moxa, cupping, gua sha,
   tui na, auricular, bloodletting).
7. **relation_registry doc note** — reserve `relation_type` enum
   (associated_with | may_present_as | differential_candidate | commonly_seen_with)
   as a future edge attribute. Doc-only now; implementation belongs to Pattern V2-D.
8. **D17 — LOCKED by Ting 2026-08-10 evening** (recorded in DECISIONS.md): (a) new
   namespaces exactly `supp.*`, `life.*`, `exposure.*`, `adverse_event.*`,
   `modality.*`; (b) `drug.*` canonical, `med.*` never deleted — legacy aliases via
   `medication_alias_map.json`, migration gate after which new Visits create no new
   `med.*` refs; (c) sym.*/metric.* complementary, optional symptom→measurement
   links; (d) visit pattern roles primary|secondary MVP, root|branch reserved,
   confidence eventually; (e) one coherent exposure timeline; (f) lifestyle/exposure
   is observed behavior — never auto-converts into a TCM diagnosis or pattern (V2
   §9), suspected exposure never becomes confirmed poisoning (V2 §10).

## F0. Model routing policy for the 8/12 Clinical V2 sprint (Ting, 2026-08-10)

Fable acts as **architecture lead + task router**. Routing:

| Agent | Use for |
|---|---|
| **Fable** | schema, architecture, migration, cross-module changes, difficult/high-risk decisions |
| **Sonnet** | implementation AFTER design is settled: forms, CRUD, UI, tests, routine refactors/integration |
| **Opus** | only major architecture disagreement or second-opinion review |
| **Antigravity** | bulk/mechanical content work |
| **Codex** | independent QA/validation after milestones |

Rules: when a Fable task becomes well-specified and low-risk, hand the implementation
to Sonnet instead of spending Fable quota. **Never delegate unresolved architecture.**
This machine has 16 GB RAM — run heavy edit/build/test agents **sequentially**, not in
parallel.

## F. Next implementation cycle order (starts after Claude quota reset)

> ⚠️ **Working-tree warning for the next agent:** ~40 pre-existing deleted
> `curriculum/` files sit in the dirty working tree. They are OUT OF SCOPE — do not
> restore, stage, commit, or modify them, and NEVER use `git add -A` in this repo;
> stage files by explicit path only.

1. **First** — additive Clinical schema/DDL commit (NOT content-card expansion): the
   four new tables + `visit_tcm_patterns` columns (empty, validators untouched);
   push immediately.
2. **Then** — vocabulary seeds (E6) + build-data wiring; supp.* category skeleton
   in the Pharmacology workspace (visible beside drug.*, separate namespace;
   V2 §6 seed list: vitamin D, B12, folate, CoQ10, omega-3, magnesium, zinc, etc.).
3. **Then** — smallest capture UI: visit-form entry for the agent ledger
   (current meds/supps with status) and adverse-event quick-add.
4. **Then** — walk ONE full fake case end-to-end (intake → visit → export), the gap
   PLAN_TO_2026-09-05 already names: 「你從未走過一次完整流程」.
5. **Explicitly deferred** — typed-relation implementation (Pattern V2-D track),
   supplement card content fills, med.*→drug.* data migration, dashboards, any
   analytics UI.
