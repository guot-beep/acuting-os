-- AcuTing OS clinical case schema
-- This schema tracks real clinical cases as de-identified timelines.
-- It references the knowledge graph by IDs but does not merge patient data into knowledge-base tables.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  patient_code TEXT NOT NULL UNIQUE,
  display_label TEXT,
  birth_year INTEGER,
  sex_at_birth TEXT,
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
  FOREIGN KEY (patient_id) REFERENCES patients(id)
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
