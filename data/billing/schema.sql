-- AcuTing OS billing/coding training schema
-- This is a scaffold for learning documentation-to-coding workflows.
-- It is not a claim submission engine.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS coding_systems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version_or_year TEXT,
  code_type TEXT,
  jurisdiction TEXT,
  source_reference_id TEXT,
  effective_date TEXT,
  review_date TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS diagnosis_codes (
  id TEXT PRIMARY KEY,
  coding_system_id TEXT NOT NULL,
  code TEXT NOT NULL,
  description_en TEXT,
  description_zh TEXT,
  active INTEGER DEFAULT 1,
  source_notes TEXT,
  FOREIGN KEY (coding_system_id) REFERENCES coding_systems(id)
);

CREATE TABLE IF NOT EXISTS procedure_codes (
  id TEXT PRIMARY KEY,
  coding_system_id TEXT NOT NULL,
  code TEXT NOT NULL,
  description_en TEXT,
  description_zh TEXT,
  service_category TEXT,
  typical_documentation_needed TEXT,
  unit_rule_notes TEXT,
  modifier_notes TEXT,
  active INTEGER DEFAULT 1,
  source_notes TEXT,
  FOREIGN KEY (coding_system_id) REFERENCES coding_systems(id)
);

CREATE TABLE IF NOT EXISTS payer_profiles (
  id TEXT PRIMARY KEY,
  payer_name TEXT NOT NULL,
  plan_name TEXT,
  state_or_region TEXT,
  credentialing_notes TEXT,
  acupuncture_coverage_notes TEXT,
  herbal_coverage_notes TEXT,
  referral_auth_requirements TEXT,
  documentation_requirements TEXT,
  effective_date TEXT,
  review_date TEXT,
  source_notes TEXT
);

CREATE TABLE IF NOT EXISTS payer_code_rules (
  id TEXT PRIMARY KEY,
  payer_profile_id TEXT NOT NULL,
  diagnosis_code_id TEXT,
  procedure_code_id TEXT,
  rule_type TEXT,
  rule_summary TEXT,
  documentation_required TEXT,
  contraindications_or_exclusions TEXT,
  prior_auth_required INTEGER DEFAULT 0,
  supervisor_review_required INTEGER DEFAULT 1,
  source_notes TEXT,
  FOREIGN KEY (payer_profile_id) REFERENCES payer_profiles(id),
  FOREIGN KEY (diagnosis_code_id) REFERENCES diagnosis_codes(id),
  FOREIGN KEY (procedure_code_id) REFERENCES procedure_codes(id)
);

CREATE TABLE IF NOT EXISTS visit_billing_drafts (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  payer_profile_id TEXT,
  claim_status TEXT DEFAULT 'draft',
  place_of_service TEXT,
  rendering_provider TEXT,
  supervising_provider TEXT,
  diagnosis_pointer_order TEXT,
  medical_necessity_summary TEXT,
  documentation_check_status TEXT DEFAULT 'needs_review',
  missing_items TEXT,
  supervisor_notes TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (payer_profile_id) REFERENCES payer_profiles(id)
);

CREATE TABLE IF NOT EXISTS visit_billing_diagnoses (
  billing_draft_id TEXT NOT NULL,
  diagnosis_code_id TEXT NOT NULL,
  priority_order INTEGER,
  linked_western_condition_id TEXT,
  documentation_support TEXT,
  PRIMARY KEY (billing_draft_id, diagnosis_code_id),
  FOREIGN KEY (billing_draft_id) REFERENCES visit_billing_drafts(id),
  FOREIGN KEY (diagnosis_code_id) REFERENCES diagnosis_codes(id)
);

CREATE TABLE IF NOT EXISTS visit_billing_procedures (
  id TEXT PRIMARY KEY,
  billing_draft_id TEXT NOT NULL,
  procedure_code_id TEXT NOT NULL,
  units REAL,
  modifiers TEXT,
  diagnosis_pointers TEXT,
  service_minutes INTEGER,
  body_regions_or_points TEXT,
  documentation_support TEXT,
  FOREIGN KEY (billing_draft_id) REFERENCES visit_billing_drafts(id),
  FOREIGN KEY (procedure_code_id) REFERENCES procedure_codes(id)
);

CREATE TABLE IF NOT EXISTS documentation_requirements (
  id TEXT PRIMARY KEY,
  requirement_name TEXT NOT NULL,
  applies_to TEXT,
  requirement_text TEXT,
  source_notes TEXT
);

CREATE TABLE IF NOT EXISTS visit_documentation_checks (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  requirement_id TEXT NOT NULL,
  status TEXT DEFAULT 'unchecked',
  evidence_in_note TEXT,
  missing_detail TEXT,
  reviewer TEXT,
  reviewed_at TEXT,
  FOREIGN KEY (requirement_id) REFERENCES documentation_requirements(id)
);
