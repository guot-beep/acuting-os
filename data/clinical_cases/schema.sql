-- AcuTing OS clinical case schema
-- This schema tracks real clinical cases as de-identified timelines.
-- It references the knowledge graph by IDs but does not merge patient data into knowledge-base tables.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  patient_code TEXT NOT NULL UNIQUE,
  display_label TEXT,
  birth_year INTEGER,
  -- localStorage patient.birthYearMonth ("1985-04"), split into year + month.
  -- D4 permits "year or year-month only, never full DOB" — the schema stored
  -- only the year, which is COARSER than the rule allows and threw away a month
  -- the app has been collecting since 2026-07-03.
  --
  -- NULL is required, not merely tolerated: records saved before that date have
  -- a birthYear and no birthYearMonth, so NOT NULL would fail the migration on
  -- exactly the oldest cases.
  --
  -- There is no birth_day and there will not be one. The input is
  -- <input type="month"> (index.html), which cannot produce a day — the source
  -- is coarse by construction, which is stronger than any CHECK. Coarsen, never
  -- falsify (D4): an unknown month stays NULL rather than being filled with 1.
  birth_month INTEGER CHECK (birth_month IS NULL OR birth_month BETWEEN 1 AND 12),
  -- localStorage case.sex, relabelled "Sex at birth" in the UI 2026-08-09 —
  -- the label was ambiguous (this column vs gender_identity below) before
  -- that; the stored values and this column's meaning did not change.
  sex_at_birth TEXT,
  -- Column existed unused since CS3; the UI gained a matching "Gender
  -- identity" field 2026-08-09 (optional, separate from sex_at_birth per
  -- D4 — sex at birth is the clinically load-bearing field, gender identity
  -- is not a restatement of it). Same case-level-not-patient-level caveat as
  -- race_ethnicity on `cases` above: written today via case.genderIdentity,
  -- not yet through a wired Patient entity.
  gender_identity TEXT,
  pronouns TEXT,
  occupation_context TEXT,
  emergency_red_flag_notes TEXT,
  privacy_level TEXT DEFAULT 'deidentified',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  case_title TEXT NOT NULL,
  case_category TEXT,
  primary_goal_zh TEXT,
  primary_goal_en TEXT,
  status TEXT DEFAULT 'active',
  start_date TEXT,
  end_date TEXT,
  summary_zh TEXT,
  summary_en TEXT,
  created_at TEXT,
  updated_at TEXT,
  -- Initial-intake minimum dataset (2026-08-09) — docs/INTAKE_MINIMUM_DATASET_AUDIT.md.
  -- All additive/nullable. Captured at CASE level today, not patient level:
  -- the runtime has no wired Patient entity yet (patients.* below stays
  -- unused by app.js), so the same real person opening a second case would
  -- re-answer these and could drift. That is a named, deferred problem, not
  -- solved here — see the patients-entity comment further down.
  --
  -- onset_approx: coarse "YYYY", "YYYY-MM", exact "YYYY-MM-DD", or the literal
  -- string "unknown" — never a fabricated day (D4: coarsen, never falsify).
  -- historyPresent (case_intake_baseline.history_present_illness once
  -- migrated) stays the free-text HPI; this is the structured sibling, not a
  -- replacement.
  onset_approx TEXT,
  -- Two independent dimensions, not one overloaded enum — an acute flare can
  -- be episodic, a chronic condition can be progressive, and collapsing them
  -- loses exactly the axis a treatment-response analysis needs.
  --   chronicity:     acute | subacute | chronic | unknown
  --   course_pattern: continuous | intermittent | episodic | recurrent |
  --                   progressive | improving | stable | unknown
  -- Vocabularies enforced in the UI (index.html #caseForm), not by a CHECK
  -- constraint — consistent with how `status` above is already handled.
  chronicity TEXT,
  course_pattern TEXT,
  -- previous_treatment (multi-select) explodes into case_previous_treatment
  -- below, same EXPLODE-list-to-child-table pattern already used for
  -- westernConditions/easternDiseases/tcmPatterns/safetyFlags
  -- (data/clinical_cases/localstorage_sqlite_mapping.json). This column
  -- holds only the free-text elaboration that multi-select can't carry.
  previous_treatment_notes TEXT,
  -- race_ethnicity (multi-select) explodes into case_race_ethnicity below,
  -- same reason. This column is the paired free-text self-description —
  -- "Chinese", "Taiwanese", "Mexican" — deliberately never promoted to a
  -- controlled id (data/config/demographic_vocabulary.json's own notes: that
  -- is what keeps the checkbox list from becoming an ever-growing enum).
  race_ethnicity_detail TEXT,
  -- Transitional. The sym.*-vs-metric.* identity question for structured
  -- measurements stays DEFERRED (visit_observations above) — this is NOT
  -- that layer. It exists because a first-visit severity number is
  -- unrecoverable once the visit has passed, and waiting for that ontology
  -- fight to resolve would silently lose it. 0-10 only, nullable: never
  -- required, never fabricated when a condition has no sensible single
  -- severity number (D4 spirit again). Prose lives alongside it in
  -- chiefComplaint/historyPresent, not replaced by it.
  baseline_severity_0_10 INTEGER CHECK (baseline_severity_0_10 IS NULL OR baseline_severity_0_10 BETWEEN 0 AND 10),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Race/ethnicity: self-reported, multi-select, 2024 OMB SPD 15-aligned
-- combined question (data/config/demographic_vocabulary.json). One row per
-- selected id. At CASE level today (see the cases-table comment above for
-- why) — a junction on patient_id is the eventual shape once the Patient
-- entity is wired, not this batch.
CREATE TABLE IF NOT EXISTS case_race_ethnicity (
  case_id TEXT NOT NULL,
  race_ethnicity_id TEXT NOT NULL,
  PRIMARY KEY (case_id, race_ethnicity_id),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

-- Previous treatment tried for the presenting problem, multi-select against a
-- small closed vocabulary enforced in the UI (not a separate vocabulary
-- file — the list is fixed and short, unlike race/ethnicity). Purpose is
-- treatment-naive vs previously-treated grouping for future treatment-
-- response analysis, per docs/INTAKE_MINIMUM_DATASET_AUDIT.md. Deliberately
-- NOT a treatment-history subsystem: no dates, no outcomes, no per-treatment
-- detail beyond the free-text previous_treatment_notes column on cases.
CREATE TABLE IF NOT EXISTS case_previous_treatment (
  case_id TEXT NOT NULL,
  treatment_type TEXT NOT NULL,
  PRIMARY KEY (case_id, treatment_type),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_intake_baseline (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  intake_date TEXT,
  chief_complaint_zh TEXT,
  chief_complaint_en TEXT,
  history_present_illness TEXT,
  biomedical_history TEXT,
  tcm_history TEXT,
  menstrual_history TEXT,
  fertility_history TEXT,
  pregnancy_history TEXT,
  sleep_energy_mood TEXT,
  digestion_bowel_urination TEXT,
  pain_notes TEXT,
  lifestyle_notes TEXT,
  labs_and_imaging_summary TEXT,
  red_flags TEXT,
  consent_scope TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_western_conditions (
  case_id TEXT NOT NULL,
  western_condition_id TEXT NOT NULL,
  diagnosis_status TEXT DEFAULT 'reported',
  diagnosed_by TEXT,
  diagnosis_date TEXT,
  notes TEXT,
  PRIMARY KEY (case_id, western_condition_id),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_eastern_diseases (
  case_id TEXT NOT NULL,
  eastern_disease_id TEXT NOT NULL,
  notes TEXT,
  PRIMARY KEY (case_id, eastern_disease_id),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_tcm_patterns (
  case_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL,
  confidence TEXT DEFAULT 'working',
  evidence_zh TEXT,
  evidence_en TEXT,
  start_date TEXT,
  end_date TEXT,
  PRIMARY KEY (case_id, pattern_id, start_date),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  visit_number INTEGER,
  visit_date TEXT,
  provider TEXT,
  setting TEXT,
  cycle_day INTEGER,
  cycle_phase TEXT,
  fertility_phase TEXT,
  subjective_changes TEXT,
  objective_notes TEXT,
  tongue_zh TEXT,
  tongue_en TEXT,
  pulse_zh TEXT,
  pulse_en TEXT,
  assessment_zh TEXT,
  assessment_en TEXT,
  plan_zh TEXT,
  plan_en TEXT,
  next_follow_up TEXT,
  safety_flags TEXT,
  -- LL2: per-visit outcome verdict (improved | no_change | worsened | lost_followup).
  -- Feeds the "cases to learn from" review. Mirrors the localStorage outcomeVerdict.
  outcome_verdict TEXT,
  -- LL1 按語: optional structured reflection (mirrors the localStorage SOAP fields).
  reflection_differential_considered TEXT,
  reflection_note TEXT,
  reflection_if_ineffective_plan TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

-- D5 cardinality: one visit -> many TCM patterns, with is_primary. This is the
-- canonical relation; soap_notes.assessment_tcm_pattern_ids stays as a
-- migration-source text blob until a fill moves it here. A visit having several
-- co-existing patterns (e.g. 肝鬱脾虛 + 腎陰虛) must be first-class.
CREATE TABLE IF NOT EXISTS visit_tcm_patterns (
  visit_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  note TEXT,
  PRIMARY KEY (visit_id, pattern_id),
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS soap_notes (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL UNIQUE,
  subjective_chief_complaint TEXT,
  subjective_symptom_updates TEXT,
  subjective_pain_sleep_energy_mood TEXT,
  subjective_digestion_bowel_urination TEXT,
  subjective_menstrual_fertility_update TEXT,
  subjective_medication_supplement_update TEXT,
  subjective_red_flags_screen TEXT,
  objective_observation TEXT,
  -- localStorage soapNote.vitals (added to the UI 2026-07-03 at Ting's request,
  -- index.html: "BP 120/80、HR 72、身高/體重、體溫"). It existed in the running app
  -- for a month with no column to migrate into. FREE TEXT on purpose: this is the
  -- additive alignment, not the structured measurement layer — see
  -- docs/PROPOSAL_A_CLINICAL_MEASUREMENT_LAYER.md. Retyping this to a structured
  -- form is a D12 breaking change after 2026-09-01, so if it is going to become
  -- measurement.* rows, that decision has to land before then.
  objective_vitals TEXT,
  objective_tongue_zh TEXT,
  objective_tongue_en TEXT,
  objective_pulse_zh TEXT,
  objective_pulse_en TEXT,
  objective_palpation TEXT,
  objective_rom_orthopedic TEXT,
  objective_labs_imaging_patient_reported TEXT,
  assessment_western_condition_ids TEXT,
  assessment_eastern_disease_ids TEXT,
  assessment_tcm_pattern_ids TEXT,
  assessment_tcm_diagnosis_text TEXT,
  -- localStorage soapNote.pathomechanism (index.html: "為什麼會這樣：如肝失疏泄，
  -- 橫逆犯脾"). Per VISIT, not per case: it sits in the SOAP form beside
  -- tcmPattern and treatmentPrinciple, and CASE_SOAP_FLOW_REVIEW calls it
  -- "Today's pattern and pathomechanism". A follow-up genuinely restates it
  -- (肝鬱減輕，但痰濕仍盛), so a single case-level value would erase the change
  -- that makes the record worth keeping.
  --
  -- Placed on soap_notes rather than visits so it stays beside
  -- assessment_treatment_principle_zh below: 病機 → 治則 is a derivation, and
  -- splitting the two across tables separates the field from its own conclusion.
  -- _en is nullable — most entries will be 中文 only.
  assessment_pathomechanism_zh TEXT,
  assessment_pathomechanism_en TEXT,
  assessment_treatment_principle_zh TEXT,
  assessment_treatment_principle_en TEXT,
  assessment_progress_note TEXT,
  plan_acupuncture_principle TEXT,
  plan_acupuncture_points TEXT,
  plan_needling_notes TEXT,
  plan_moxa_e_stim_notes TEXT,
  -- localStorage soapNote.modalities (same 2026-07-03 batch, index.html:
  -- "艾灸 / 電針 / 拔罐 / 刮痧 / 推拿"). Deliberately NOT folded into
  -- plan_moxa_e_stim_notes above: that column covers moxa and e-stim only, so
  -- 拔罐, 刮痧 and 推拿 had nowhere to land. Kept as free text rather than a
  -- visit_modalities junction — a junction is a real table with its own
  -- vocabulary, and nothing has been recorded yet to say which values recur.
  plan_modalities TEXT,
  plan_formula_herb_notes TEXT,
  plan_western_medication_context TEXT,
  plan_patient_instructions TEXT,
  plan_follow_up TEXT,
  plan_referral_or_supervisor_question TEXT,
  plan_safety_cautions TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS visit_acupuncture (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  acupoint_code TEXT NOT NULL,
  side TEXT,
  needle_depth TEXT,
  angle_direction TEXT,
  technique TEXT,
  tonification_sedation TEXT,
  retention_minutes INTEGER,
  moxa TEXT,
  e_stim TEXT,
  response_notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS visit_acupuncture_protocols (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  protocol_name TEXT,
  treatment_principle_zh TEXT,
  treatment_principle_en TEXT,
  point_codes TEXT,
  modifications TEXT,
  contraindication_check TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS visit_formulas (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  formula_id TEXT,
  formula_name_text TEXT,
  dosage_text TEXT,
  frequency_text TEXT,
  duration_days INTEGER,
  modifications TEXT,
  patient_instructions TEXT,
  caution_notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS visit_herbs (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  herb_id TEXT,
  herb_name_text TEXT,
  dose_text TEXT,
  role_in_formula TEXT,
  caution_notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS visit_western_medications (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  medication_id TEXT,
  medication_name_text TEXT,
  dose_text TEXT,
  frequency_text TEXT,
  start_date TEXT,
  end_date TEXT,
  prescribing_context TEXT,
  patient_reported_adherence TEXT,
  interaction_watch_notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS visit_outcomes (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_category TEXT,
  value_text TEXT,
  value_number REAL,
  unit TEXT,
  direction TEXT,
  notes TEXT,
  -- docs/CLINICAL_DATA_FOUNDATION_DESIGN.md §3.2: metric_name has always been a
  -- free string, not a resolvable id. metric_id is the additive fix — it points
  -- at outcome_metrics.json's id (e.g. "metric.pain_score") so a metric can be
  -- looked up instead of string-matched. Nullable and additive on purpose:
  -- existing rows (all of them, today) have metric_name only, and backfilling
  -- metric_id is future work, not this column's job.
  metric_id TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

-- docs/CLINICAL_DATA_FOUNDATION_DESIGN.md §3.2 — the one new table that design
-- calls for, carried over unchanged. Locks in a structured-observation shape
-- before the D12 additive-only freeze (2026-09-01); the design's own words:
-- "寧可表先建好空著,也不要凍結後才發現要改型" (better an empty table now than
-- finding out post-freeze it needs retyping).
--
-- This table is EMPTY as of this commit and nothing writes to it yet. It is
-- schema only, not a feature. In particular:
--   - sym_id has no seed data to point at. docs/PROPOSAL_A_CLINICAL_MEASUREMENT_LAYER.md
--     and docs/SYMPTOM_CARD_TEMPLATE.md (Y11-c) resolve a vitals measurement id
--     through `metric.*` in outcome_metrics.json; CLINICAL_DATA_FOUNDATION_DESIGN
--     §3.2/§3.3 instead resolves it through `sym.*`, seeded no earlier than
--     9/05-11 per that doc's own §7 timeline. That fork is UNRESOLVED — flagged
--     for Ting, not silently picked one way here.
--   - actual vitals capture for 9/05 clinic use is unaffected either way: it
--     stays on soap_notes.objective_vitals (free text, landed in bd0729f). This
--     table is where a structured value goes once the sym_id question is
--     settled, not a replacement for the free-text field.
--   - observation_type covers symptom|sign|tongue|pulse|vital_sign|lab_finding|
--     scale by design (§3.2) — the table is intentionally general so tongue/
--     pulse structuring later does not need a second near-identical table. No
--     seeding, UI, or validator work for those types happens in this batch.
CREATE TABLE IF NOT EXISTS visit_observations (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  sym_id TEXT,
  observation_type TEXT,
  present INTEGER,
  severity_0_10 INTEGER,
  laterality TEXT,
  quality TEXT,
  timing TEXT,
  value_number REAL,
  value_text TEXT,
  unit TEXT,
  loinc_code TEXT,
  notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);

CREATE TABLE IF NOT EXISTS fertility_cycle_tracking (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  cycle_label TEXT,
  cycle_start_date TEXT,
  cycle_day INTEGER,
  phase TEXT,
  bleeding_flow TEXT,
  cervical_mucus TEXT,
  bbt TEXT,
  lh_test TEXT,
  intercourse_or_iui_timing TEXT,
  ivf_stage TEXT,
  follicle_monitoring TEXT,
  lining_measurement TEXT,
  progesterone_or_luteal_support TEXT,
  pregnancy_test_result TEXT,
  notes TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_safety_flags (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT DEFAULT 'review',
  description TEXT,
  action_needed TEXT,
  resolved INTEGER DEFAULT 0,
  created_at TEXT,
  resolved_at TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS case_documents (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  document_type TEXT,
  title TEXT,
  file_path TEXT,
  summary TEXT,
  date_received TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

-- CG9 (docs/CLINICAL_GRAPH_TRACK.md): the six reflection prompts Ting settled on
-- 2026-07-29. what_worked / what_to_adjust already covered "what worked" and
-- "what would I change next time"; outcome_verdict on visits covers "what did
-- not work". The three columns below close the rest. All optional, collapsed by
-- default, never model-prefilled (LL1 rule) — reflection is what turns recorded
-- data into clinical ability, so it has to be Ting's own words.
CREATE TABLE IF NOT EXISTS case_reflections (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  reflection_date TEXT,
  what_worked TEXT,
  what_to_adjust TEXT,
  questions_for_supervisor TEXT,
  learning_tags TEXT,
  -- What changed? — the episode-level delta, distinct from per-visit outcomes.
  what_changed TEXT,
  -- What surprised me? — episode-level counterpart of visits.reflection_note.
  what_surprised TEXT,
  -- What do I need to study? — every entry becomes a review-queue item (CG10 ③).
  what_to_study TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE IF NOT EXISTS visit_billing_links (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  billing_draft_id TEXT NOT NULL,
  coding_status TEXT DEFAULT 'not_started',
  coding_question TEXT,
  supervisor_or_billing_review TEXT,
  updated_at TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);
