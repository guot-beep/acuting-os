-- AcuTing OS clinical knowledge graph schema
-- Principle: keep biomedical diagnoses, East Asian disease categories,
-- TCM patterns, medications, acupuncture, herbs, and cautions separate.
-- Use relation tables to describe overlap.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS western_conditions (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_zh TEXT,
  category TEXT,
  icd10_codes TEXT,
  summary_en TEXT,
  summary_zh TEXT,
  red_flags_en TEXT,
  red_flags_zh TEXT,
  fertility_relevance INTEGER DEFAULT 0,
  source_notes TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS eastern_diseases (
  id TEXT PRIMARY KEY,
  name_zh TEXT NOT NULL,
  pinyin TEXT,
  name_en TEXT,
  classical_category TEXT,
  summary_zh TEXT,
  summary_en TEXT,
  source_notes TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS tcm_patterns (
  id TEXT PRIMARY KEY,
  name_zh TEXT NOT NULL,
  pinyin TEXT,
  name_en TEXT NOT NULL,
  pattern_family TEXT,
  key_signs_zh TEXT,
  key_signs_en TEXT,
  tongue_zh TEXT,
  tongue_en TEXT,
  pulse_zh TEXT,
  pulse_en TEXT,
  treatment_principle_zh TEXT,
  treatment_principle_en TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS western_medications (
  id TEXT PRIMARY KEY,
  generic_name_en TEXT NOT NULL,
  brand_names_en TEXT,
  drug_class_en TEXT,
  common_uses_en TEXT,
  fertility_use_en TEXT,
  common_adverse_effects_en TEXT,
  major_contraindications_en TEXT,
  herb_interaction_watch_en TEXT,
  acupuncture_caution_en TEXT,
  pregnancy_lactation_note_en TEXT,
  source_notes TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS herbs (
  id TEXT PRIMARY KEY,
  name_pinyin TEXT NOT NULL,
  name_zh TEXT,
  name_en TEXT,
  category_en TEXT,
  cautions_en TEXT,
  herb_drug_watch_en TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS formulas (
  id TEXT PRIMARY KEY,
  name_pinyin TEXT NOT NULL,
  name_zh TEXT,
  name_en TEXT,
  category_en TEXT,
  indications_zh TEXT,
  indications_en TEXT,
  cautions_en TEXT,
  herb_drug_watch_en TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS condition_eastern_links (
  western_condition_id TEXT NOT NULL,
  eastern_disease_id TEXT NOT NULL,
  relationship_type TEXT DEFAULT 'overlaps_with',
  rationale_zh TEXT,
  rationale_en TEXT,
  source_notes TEXT,
  PRIMARY KEY (western_condition_id, eastern_disease_id),
  FOREIGN KEY (western_condition_id) REFERENCES western_conditions(id),
  FOREIGN KEY (eastern_disease_id) REFERENCES eastern_diseases(id)
);

CREATE TABLE IF NOT EXISTS condition_pattern_links (
  western_condition_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL,
  relevance TEXT DEFAULT 'common',
  rationale_zh TEXT,
  rationale_en TEXT,
  source_notes TEXT,
  PRIMARY KEY (western_condition_id, pattern_id),
  FOREIGN KEY (western_condition_id) REFERENCES western_conditions(id),
  FOREIGN KEY (pattern_id) REFERENCES tcm_patterns(id)
);

CREATE TABLE IF NOT EXISTS eastern_pattern_links (
  eastern_disease_id TEXT NOT NULL,
  pattern_id TEXT NOT NULL,
  relevance TEXT DEFAULT 'common',
  rationale_zh TEXT,
  rationale_en TEXT,
  source_notes TEXT,
  PRIMARY KEY (eastern_disease_id, pattern_id),
  FOREIGN KEY (eastern_disease_id) REFERENCES eastern_diseases(id),
  FOREIGN KEY (pattern_id) REFERENCES tcm_patterns(id)
);

CREATE TABLE IF NOT EXISTS condition_medication_links (
  western_condition_id TEXT NOT NULL,
  medication_id TEXT NOT NULL,
  usage_context_en TEXT,
  caution_summary_en TEXT,
  source_notes TEXT,
  PRIMARY KEY (western_condition_id, medication_id),
  FOREIGN KEY (western_condition_id) REFERENCES western_conditions(id),
  FOREIGN KEY (medication_id) REFERENCES western_medications(id)
);

CREATE TABLE IF NOT EXISTS acupuncture_strategy_links (
  id TEXT PRIMARY KEY,
  pattern_id TEXT,
  western_condition_id TEXT,
  strategy_name_zh TEXT,
  strategy_name_en TEXT,
  treatment_principle_zh TEXT,
  treatment_principle_en TEXT,
  core_points TEXT,
  modifications TEXT,
  contraindications TEXT,
  evidence_notes TEXT,
  FOREIGN KEY (pattern_id) REFERENCES tcm_patterns(id),
  FOREIGN KEY (western_condition_id) REFERENCES western_conditions(id)
);

CREATE TABLE IF NOT EXISTS herbal_strategy_links (
  id TEXT PRIMARY KEY,
  pattern_id TEXT,
  western_condition_id TEXT,
  formula_id TEXT,
  strategy_name_zh TEXT,
  strategy_name_en TEXT,
  modification_notes TEXT,
  contraindications TEXT,
  herb_drug_watch_en TEXT,
  evidence_notes TEXT,
  FOREIGN KEY (pattern_id) REFERENCES tcm_patterns(id),
  FOREIGN KEY (western_condition_id) REFERENCES western_conditions(id),
  FOREIGN KEY (formula_id) REFERENCES formulas(id)
);

CREATE TABLE IF NOT EXISTS fertility_workflow_steps (
  id TEXT PRIMARY KEY,
  western_condition_id TEXT,
  step_order INTEGER NOT NULL,
  phase_en TEXT,
  phase_zh TEXT,
  biomedical_goal_en TEXT,
  tcm_goal_zh TEXT,
  acupuncture_role_en TEXT,
  herbal_role_en TEXT,
  medication_context_en TEXT,
  referral_or_red_flags_en TEXT,
  source_notes TEXT,
  FOREIGN KEY (western_condition_id) REFERENCES western_conditions(id)
);

CREATE TABLE IF NOT EXISTS source_references (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT,
  url TEXT,
  source_type TEXT,
  access_date TEXT,
  notes TEXT
);
