# AcuTing OS — Condition / TCM Disease / Pattern / Symptom Source & Mapping Specification

**Version:** 2026-08-07  
**Purpose:** Feed this file to Codex / Claude Code before expanding the AcuTing OS `#ws/condition` knowledge layer and before connecting it to longitudinal clinical cases.

---

# 0. Executive Decision

AcuTing OS must NOT create a separate “CloudTCM / 雲端中醫” diagnosis universe.

CloudTCM is valuable for:

- exact source-page links
- category/browse structure
- terminology discovery
- synonym discovery
- historical/classical references
- related formula / herb / acupoint discovery
- visual/source references

But CloudTCM records and categories are **source/provenance handles**, not canonical clinical entity IDs.

The canonical diagnostic model remains:

```text
cond.*      = Western / biomedical conditions
tdis.*      = TCM disease names 中醫病名
pattern.*   = TCM patterns / syndrome differentiation 證型
sym.*       = symptoms / signs / observations 症狀、體徵、觀察
```

CloudTCM content must be **broken apart and mapped into these four canonical namespaces**, while preserving:

```text
exact CloudTCM URL
CloudTCM external record id
CloudTCM category id
CloudTCM category path
CloudTCM aliases / same-name terms
CloudTCM image URL as a source reference only
retrieval / review metadata
```

Do not create:

```text
cloudtcm-condition-card as a fifth condition type
cloudtcm-pattern-card as a fifth namespace
duplicate disease entities just because CloudTCM has a separate page
```

---

# 1. Why This Matters for Future Clinical Data

The future clinical layer will collect longitudinal observations such as:

```text
Patient
  ↓
Case / Episode
  ↓
Visit
  ↓
Symptoms / signs at that visit
  ↓
TCM pattern(s) assessed at that visit
  ↓
TCM disease name(s)
  ↓
Western condition(s)
  ↓
Treatment
  ↓
Outcome
  ↓
Follow-up changes
```

These relationships are many-to-many and time-dependent.

Example:

```text
Patient A
Age 47
Female
Visit 1:
  headache severity 8/10
  dizziness
  red tongue
  wiry pulse
  pattern = Liver Yang Rising

Visit 4:
  headache severity 3/10
  insomnia persists
  tongue less red
  pattern = Liver-Kidney Yin Deficiency

Western condition:
  migraine

TCM disease:
  頭痛

Treatment exposure:
  acupuncture + formula

Outcome:
  headache frequency ↓
```

The **patient does not permanently “have” one TCM pattern**.  
Patterns should normally be assessed at the **visit level** because they may change over time.

Western conditions and TCM disease diagnoses may persist over a longer **case/episode**.

Symptoms and observations must be recorded longitudinally so AcuTing OS can later answer questions such as:

```text
Which symptoms most often co-occurred with pattern X?
Which patterns appeared most often in patients with condition Y?
Did pattern distribution change by age group / sex / clinical course?
Which treatments were associated with improvement in a specific symptom?
How often did a biomedical diagnosis map to more than one TCM pattern?
How did a patient's pattern change across treatment visits?
```

---

# 2. Canonical Diagnostic Namespaces

## 2.1 `cond.*` — Biomedical Condition

Examples:

```text
cond.migraine
cond.hashimotos_thyroiditis
cond.functional_dyspepsia
cond.trigeminal_neuralgia
```

Represents:

- biomedical disease
- disorder
- diagnosis
- clinically managed biomedical problem

Use biomedical terminology/coding systems as external mappings.

Recommended external codes:

```text
ICD-10-CM
ICD-11
SNOMED CT
MeSH when useful
```

Do NOT use a symptom as a biomedical condition merely because a source website puts it in a “disease” list.

---

## 2.2 `tdis.*` — TCM Disease 中醫病名

Examples:

```text
tdis.tou_tong     頭痛
tdis.xuan_yun     眩暈
tdis.ke_sou       咳嗽
tdis.wei_tong     胃痛
```

Represents a recognized Chinese-medicine disease name.

This is different from a TCM pattern.

Example:

```text
頭痛 = TCM disease
肝陽上亢 = TCM pattern
```

One TCM disease may have many patterns.

One pattern may occur across many TCM diseases.

---

## 2.3 `pattern.*` — TCM Pattern / Syndrome Differentiation 證型

Examples:

```text
pattern.liver_yang_rising
pattern.spleen_qi_deficiency
pattern.qi_stagnation_blood_stasis
pattern.liver_kidney_yin_deficiency
```

Represents a diagnostic conclusion about the current pathomechanism.

Patterns are dynamic and should normally be recorded per visit.

Do NOT equate:

```text
migraine = Liver Yang Rising
```

Correct structure:

```text
cond.migraine
    ↕ related
tdis.tou_tong
    ↕ may_present_as
pattern.liver_yang_rising
```

---

## 2.4 `sym.*` — Symptom / Sign / Observation

The clinical use case now justifies building this namespace.

Examples:

```text
sym.headache
sym.dizziness
sym.nausea
sym.tinnitus
sym.cold_limbs
sym.bitter_taste
sym.red_tongue
sym.wiry_pulse
sym.abdominal_tenderness
```

Symptoms should NOT be split into separate Western and TCM universes.

Use:

```json
{
  "id": "sym.bitter_taste",
  "name_zh": "口苦",
  "name_en": "Bitter taste",
  "tradition": ["tcm"],
  "observation_type": "symptom"
}
```

and:

```json
{
  "id": "sym.headache",
  "name_zh": "頭痛",
  "name_en": "Headache",
  "tradition": ["biomedical", "tcm"],
  "observation_type": "symptom"
}
```

Possible observation types:

```text
symptom
sign
tongue
pulse
physical_exam
vital_sign
lab_finding
imaging_finding
patient_reported_measure
clinical_scale
```

For numeric laboratory / vital / measurement data, map to LOINC where appropriate.

---

# 3. Primary Official Sources

# 3.1 Western Conditions — Authority Core

## A. WHO ICD-11

Official:

https://icd.who.int/

API:

https://icd.who.int/icdapi

API documentation:

https://icd.who.int/docs/icd-api/APIDoc-Version2/

Use for:

```text
ICD-11 entity URI
ICD-11 code
preferred diagnosis name
classification hierarchy
parent / child categories
international disease classification
Traditional Medicine Module cross-reference where applicable
```

Important:

ICD is primarily a classification/coding system.  
Do not expect ICD alone to provide a complete clinical card.

---

## B. CDC / NCHS ICD-10-CM

Official:

https://www.cdc.gov/nchs/icd/icd-10-cm/

Files:

https://www.cdc.gov/nchs/icd/icd-10-cm/files.html

Use for:

```text
US diagnosis codes
ICD-10-CM official descriptions
hierarchy / category
coding relationships
US clinical coding compatibility
```

Store code mappings separately from the canonical AcuTing ID.

Example:

```json
"external_codes": [
  {
    "system": "ICD-10-CM",
    "code": "G43.909",
    "mapping_type": "related_or_narrower",
    "source": "CDC-NCHS"
  }
]
```

Do not assume every AcuTing card has one exact ICD-10-CM code.

---

## C. SNOMED CT

Official:

https://www.snomed.org/

Documentation:

https://docs.snomed.org/

Use for:

```text
clinical concepts
symptoms
signs
disorders
body structures
clinical findings
synonyms
formal concept relationships
machine-readable semantic mapping
```

SNOMED is especially useful because its architecture already separates:

```text
concept
description
relationship
```

This is conceptually compatible with the AcuTing knowledge graph.

Important:

Check current licensing/distribution requirements before bulk redistributing SNOMED content.

Do not copy the entire terminology into AcuTing OS unless licensing and implementation requirements are explicitly satisfied.

Prefer storing:

```text
SNOMED concept id
preferred term
mapping status
source link
```

where permitted.

---

## D. NLM MedlinePlus

Health topics:

https://medlineplus.gov/healthtopics.html

All topics:

https://medlineplus.gov/all_healthtopics.html

Developer XML:

https://medlineplus.gov/xml.html

Web service:

https://medlineplus.gov/about/developers/webservices/

MedlinePlus Connect:

https://medlineplus.gov/medlineplus-connect/web-service/

Use for high-quality card content such as:

```text
plain-language definition
aliases
summary
related topics
NIH institute links
patient-facing overview
```

MedlinePlus XML is particularly useful for ingestion because records include:

```text
title
URL
language
ID
MeSH vocabulary
also-called terms
summary
topic groups
related topics
primary NIH institute
linked site records
```

MedlinePlus Connect can map:

```text
ICD-10-CM → MedlinePlus topic
SNOMED CT → MedlinePlus topic
LOINC → lab test information
```

Important:

Follow NLM attribution and acceptable-use rules.

Do not blindly scrape/copy normal MedlinePlus web pages.

Prefer official XML / web services / Connect.

---

## E. NIH Institute-Specific Condition Pages

Use institute pages when greater clinical depth is needed.

Examples:

```text
NIDDK — digestive, endocrine, kidney, diabetes
https://www.niddk.nih.gov/health-information

NINDS — neurological conditions
https://www.ninds.nih.gov/health-information/disorders

NHLBI — heart, lung, blood
https://www.nhlbi.nih.gov/health

NIAMS — musculoskeletal / rheumatologic / skin
https://www.niams.nih.gov/health-topics

NIA — aging
https://www.nia.nih.gov/health
```

These are excellent sources for:

```text
definition
risk factors
signs and symptoms
diagnosis
laboratory / imaging workup
standard management
complications
prognosis
when to seek care
```

Use the specialty NIH institute when its page is stronger than a generic summary.

---

# 3.2 TCM Disease and Pattern — Authority Core

## A. GB/T 15657-2021

**中醫病證分類與代碼**  
Classification and codes of diseases and patterns of traditional Chinese medicine

Official National Standard page:

https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=41FD9D06E5BE4F84EA1D8D07101BED2C

Official standard information:

https://std.samr.gov.cn/gb/search/gbDetailed?id=CE1E6A1DD54558F6E05397BE0A0A68DF

Use as a core taxonomy for:

```text
TCM disease classification
TCM pattern classification
official Chinese terminology
hierarchical category
TCM disease code
TCM pattern code
treatment-method code where relevant
```

Coding rule:

```text
A = disease 疾病
B = pattern 證候
C = treatment method 治法
```

Do NOT use the GB/T code as the mutable AcuTing entity ID.

Store it as an external code.

Example:

```json
{
  "id": "pattern.spleen_qi_deficiency",
  "external_codes": [
    {
      "system": "GB/T 15657-2021",
      "code": "B...",
      "source_authority": "国家中医药局"
    }
  ]
}
```

---

## B. GB/T 16751.1-2021

**中醫臨床診療術語 第1部分：疾病**

Official standards platform:

https://std.samr.gov.cn/

Search:

```text
GB/T 16751.1-2021
```

Use for:

```text
official TCM disease names
standard terminology
preferred Chinese labels
terminological normalization
synonym review
```

This is a strong source for `tdis.*`.

---

## C. GB/T 16751.2-2021

**中醫臨床診療術語 第2部分：證候**

Official standards platform:

https://std.samr.gov.cn/

Search:

```text
GB/T 16751.2-2021
```

Use for:

```text
official TCM pattern names
pattern terminology
standardized definitions / naming
pattern normalization
```

This is a strong source for `pattern.*`.

---

## D. GB/T 16751.3 — Treatment Methods

**中醫臨床診療術語 第3部分：治法**

Use for controlled treatment-principle vocabulary where available.

Examples:

```text
疏肝
健脾
清熱
化痰
活血化瘀
滋陰
溫陽
```

Do not leave treatment principle as uncontrolled prose if an official standardized term exists.

---

## E. 国家中医药管理局 / 国家卫生健康委员会 2020 Standard Release

Official notice:

https://www.natcm.gov.cn/yizhengsi/zhengcewenjian/2020-11-23/18461.html

This notice released/download-linked:

```text
《中医病证分类与代码》
《中医临床诊疗术语 第1部分：疾病》
《中医临床诊疗术语 第2部分：证候》
《中医临床诊疗术语 第3部分：治法》
new/old mapping table
```

Use the official downloadable files where accessible.

Prefer this material over commercial TCM websites when resolving names and classifications.

---

## F. ZY/T 10—2024

**中醫病證診斷與療效評價規範制修訂通則**

Official notice:

https://www.natcm.gov.cn/fajiansi/zhengcewenjian/2024-07-29/34570.html

Use as a methodology reference for designing:

```text
diagnostic criteria structure
outcome assessment structure
clinical efficacy evaluation fields
future disease-specific TCM standards
```

This is highly relevant to the future clinical-outcome layer.

---

## G. WHO ICD-11 Traditional Medicine Module

WHO explanation:

https://www.who.int/standards/classifications/frequently-asked-questions/traditional-medicine

ICD-11:

https://icd.who.int/

Use for:

```text
international TM disease/pattern coding
dual coding
cross-system interoperability
mapping Chinese/Japanese/Korean traditional medicine diagnostic concepts
```

WHO explicitly recommends Traditional Medicine coding in conjunction with conventional ICD concepts for appropriate morbidity use.

Therefore AcuTing should support:

```text
Western biomedical code
+
TCM disease / pattern code
```

without pretending that they are one-to-one translations.

---

# 3.3 Symptoms / Signs / Measurements — Authority Core

## A. SNOMED CT Clinical Finding

Best for:

```text
symptoms
physical signs
clinical findings
body-site findings
qualitative observations
```

Map when an appropriate concept exists.

---

## B. LOINC

Official:

https://loinc.org/

Use for:

```text
laboratory tests
vital signs
clinical measurements
survey instruments
patient-reported outcomes
standardized scores
```

LOINC is especially important for future longitudinal data.

Examples:

```text
hemoglobin
ferritin
TSH
blood pressure
body weight
PHQ-9
pain rating instruments
```

Store:

```text
LOINC code
measurement unit
value
reference range where applicable
date/visit
```

Do not turn a numeric result into a permanent “symptom” string.

---

## C. HL7 FHIR Observation Model

Official:

https://www.hl7.org/fhir/R5/observation.html

FHIR distinguishes observations from diagnoses.

AcuTing does not need to become a full FHIR server now, but its data model should learn from this distinction.

FHIR Observation is appropriate conceptually for:

```text
symptoms
signs
vital signs
labs
measurements
assessment scores
physical exam findings
```

This prevents the common modeling error:

```text
everything = condition
```

---

# 4. CloudTCM / 雲端中醫 — Correct Role

Official/non-official authority status:

```text
Useful clinical/educational secondary reference
NOT primary terminology authority
NOT a canonical ontology
NOT a fifth AcuTing namespace
```

Example pages:

```text
https://cloudtcm.com/syndrome/...
https://cloudtcm.com/disease/...
https://cloudtcm.com/dic/...
https://cloudtcm.com/formula/...
```

Preserve:

```json
{
  "source_id": "cloudtcm.disease_entry.XXXX",
  "source_name": "CloudTCM",
  "external_record_id": "XXXX",
  "url": "https://cloudtcm.com/...",
  "category_refs": [
    "cloudtcm.disease_category.XX"
  ],
  "category_path": [
    "內科或兒科病症",
    "..."
  ],
  "image_url": "...",
  "retrieved_at": "YYYY-MM-DD"
}
```

But map the source record to a canonical entity:

```json
{
  "source_ref": "cloudtcm.disease_entry.XXXX",
  "canonical_targets": [
    {
      "target_id": "tdis.tou_tong",
      "mapping_type": "related",
      "review_status": "human_reviewed"
    }
  ]
}
```

Possible mapping types:

```text
exact
close
broader
narrower
related
historical_term
synonym_candidate
symptom_of
pattern_of
not_equivalent
unresolved
```

Never force `exact` because two labels look similar.

---

# 5. CloudTCM Category Preservation Without a Separate Module

CloudTCM categories have value as an **external taxonomy view**.

Store them separately:

```text
data/sources/cloudtcm/disease_categories.json
data/sources/cloudtcm/disease_entries.json
data/sources/cloudtcm/source_mappings.json
```

or preserve the existing equivalent paths.

A canonical card may render:

```text
Source classifications
────────────────────────
CloudTCM:
  內科或兒科病症 > 頭面五官 > 頭痛
  [Open exact source page]
```

This preserves the browsing logic Ting finds useful while preventing it from becoming AcuTing's primary taxonomy.

Primary filters should be based on AcuTing controlled vocabularies.

External-source categories may be optional secondary filters:

```text
AcuTing classification
Source classification
Board domain
Body system
TCM category
```

---

# 6. Recommended `cond.*` Card Fields

```yaml
identity:
  id:
  name_en:
  name_zh:
  aliases_en: []
  aliases_zh: []
  pronunciation:
  review_status:

classification:
  body_systems: []
  specialty_domains: []
  condition_family: []
  external_codes: []

biomedical:
  definition:
  epidemiology:
  prevalence:
  typical_age:
  sex_associations:
  risk_factors: []
  causes: []
  pathophysiology:
  clinical_course:
  complications: []
  prognosis:

presentation:
  key_symptom_ids: []
  key_sign_ids: []
  history_features: []
  physical_exam_findings: []

diagnosis:
  diagnostic_criteria:
  differential_diagnoses: []
  labs: []
  imaging: []
  special_tests: []

safety:
  red_flags: []
  emergency_referral: []
  urgent_referral: []
  routine_referral: []

biomedical_management:
  medications: []
  procedures: []
  lifestyle: []
  monitoring: []

integrative_links:
  related_tcm_diseases: []
  related_patterns: []
  acupuncture_links: []
  formula_links: []
  herb_links: []

clinical_tracking:
  suggested_outcome_measures: []
  follow_up_metrics: []

board:
  board_map: []
  high_yield:
  exam_traps: []

provenance:
  field_sources: {}
  sources: []
  last_reviewed:
```

Important:

The knowledge card describes the **general condition**.

Do NOT store patient-specific:

```text
age
sex
race
onset
severity
current status
```

inside the canonical condition card.

Those belong to the clinical instance.

---

# 7. Recommended `tdis.*` Card Fields

```yaml
identity:
  id:
  name_zh:
  name_en:
  pinyin:
  aliases: []
  external_codes: []

classification:
  taxonomy_id:
  disease_family:
  zangfu_systems: []
  classical_source:

definition:
  concise_definition:
  defining_symptom_ids: []

etiology_pathogenesis:
  etiologies: []
  pathomechanism:
  disease_location: []
  disease_nature: []
  progression:

diagnosis:
  diagnostic_features: []
  differential_tcm_diseases: []

pattern_links:
  common_patterns: []

treatment_framework:
  general_treatment_principles: []
  acupuncture_links: []
  formula_links: []

biomedical_links:
  related_conditions: []

sources:
  field_sources: {}
  sources: []

review:
  review_status:
  last_reviewed:
```

Do not embed full pattern cards inside a disease card.

Use IDs.

---

# 8. Recommended `pattern.*` Card Fields

```yaml
identity:
  id:
  name_zh:
  name_en:
  pinyin:
  aliases: []
  external_codes: []

classification:
  pattern_family:
  eight_principles: []
  zangfu: []
  qi_blood_fluids: []
  pathogenic_factors: []
  six_channels: []
  four_levels: []
  sanjiao: []

pathomechanism:
  mechanism:
  etiologies: []
  disease_location: []
  disease_nature: []

manifestations:
  key_symptom_ids: []
  supporting_symptom_ids: []
  tongue_ids: []
  pulse_ids: []

differentiation:
  distinguishing_features: []
  differential_patterns: []

treatment:
  treatment_principles: []
  acupuncture_links: []
  formula_links: []
  herb_links: []

sources:
  field_sources: {}
  sources: []

review:
  review_status:
  last_reviewed:
```

Reverse connections such as:

```text
related Western conditions
related TCM diseases
cases where this occurred
```

should be derived from graph edges / clinical data, not manually duplicated on both sides.

---

# 9. Recommended `sym.*` Card Fields

```yaml
identity:
  id:
  name_zh:
  name_en:
  aliases_zh: []
  aliases_en: []
  pinyin:

classification:
  observation_type:
  tradition: []
  body_site: []
  body_system: []

semantics:
  definition:
  subjective_or_objective:
  positive_negative_possible:
  laterality_applicable:
  severity_applicable:
  frequency_applicable:
  duration_applicable:

measurement:
  measurable: false
  loinc_codes: []
  units: []
  scale_ids: []

external_codes:
  snomed_ct: []
  mesh: []

clinical_links:
  associated_conditions: DERIVED
  associated_tcm_diseases: DERIVED
  associated_patterns: DERIVED

sources:
  field_sources: {}
  sources: []

review:
  review_status:
  last_reviewed:
```

For tongue/pulse:

```text
red tongue
pale tongue
purple tongue
greasy coat
wiry pulse
slippery pulse
weak pulse
```

keep them in the same observation namespace with subtype tags:

```json
"observation_type": "tongue"
```

or

```json
"observation_type": "pulse"
```

Do NOT create a separate `tongue.*` universe unless a future technical requirement truly needs it.

---

# 10. Relation Registry

Every graph relation must have one authored direction.

The reverse is derived.

Recommended registry concepts:

```text
condition_has_symptom
tcm_disease_has_symptom
pattern_has_manifestation
condition_related_tcm_disease
condition_related_pattern
tcm_disease_may_present_as_pattern
pattern_treated_by_formula
pattern_treated_by_acupoint
condition_monitored_by_observation
condition_differential_of_condition
pattern_differential_of_pattern
```

Recommended edge object:

```json
{
  "edge_id": "edge.XXXX",
  "source_id": "pattern.liver_yang_rising",
  "relation": "pattern_has_manifestation",
  "target_id": "sym.headache",
  "qualifier": {
    "role": "key",
    "frequency": "common"
  },
  "evidence": [
    {
      "source_id": "source.xxx",
      "source_url": "https://...",
      "evidence_type": "standard"
    }
  ],
  "mapping_strength": "high",
  "review_status": "source_checked"
}
```

Avoid storing:

```json
condition.related_patterns = [...]
pattern.related_conditions = [...]
```

as two independently edited lists.

One is authored.  
The other is derived.

---

# 11. Mapping Strength Is Essential

AcuTing should never treat all links as equivalent.

Use:

```text
exact_equivalence
close_match
broader_than
narrower_than
associated_with
commonly_cooccurs
supports_diagnosis
manifestation_of
possible_pattern
differential
contraindicated_with
treatment_target
monitoring_measure
```

And optionally:

```text
mapping_strength:
  high
  moderate
  low

mapping_basis:
  official_standard
  clinical_guideline
  textbook
  source_website
  course_material
  expert_review
  inferred
```

This will be critical when generating analytics later.

A relationship learned from 300 cases must not be mixed silently with a relationship copied from one educational website.

---

# 12. Clinical Case Model

AcuTing clinical data should reference canonical knowledge IDs.

Recommended conceptual structure:

```text
Patient
  └── Case
        ├── Western conditions
        ├── TCM disease diagnosis
        ├── onset / duration
        └── Visit
              ├── symptom observations
              ├── tongue
              ├── pulse
              ├── vitals / labs
              ├── current patterns
              ├── treatment
              └── outcomes
```

The existing repository term `case` can function as the episode.

Do not add a second `episode` table merely to rename it.

---

# 13. Patient-Level Data

Patient-level stable or slowly changing information may include:

```text
patient_code
birth_year OR age band
sex
race
ethnicity
relevant social determinants
major past medical history
allergies
baseline medications
```

Race and ethnicity must be modeled as separate concepts if collected.

Do not encode personal identifiers into `patient_code`.

---

# 14. Case-Level Data

```yaml
case_id:
patient_id:
primary_condition_ids: []
secondary_condition_ids: []
tcm_disease_ids: []
approx_onset:
duration_at_intake:
course:
  acute | subacute | chronic | recurrent | episodic
status:
  active | recurrence | relapse | remission | resolved
severity_baseline:
referral_status:
```

FHIR Condition is a useful design reference for:

```text
clinicalStatus
verificationStatus
severity
onset
abatement
stage
supporting evidence
```

AcuTing does not have to implement FHIR exactly.

---

# 15. Visit-Level Data

```yaml
visit_id:
case_id:
visit_date:

reported_symptoms:
  - symptom_id:
    severity:
    frequency:
    duration:
    laterality:
    notes:

observed_signs:
  - symptom_id:
    value:
    unit:

tongue_observations: []
pulse_observations: []

pattern_assessments:
  - pattern_id:
    is_primary:
    confidence:
    reasoning_evidence_ids: []

treatment:
  acupuncture: []
  formulas: []
  herbs: []
  other: []

outcomes:
  - measure_id:
    value:
    unit:
    change_from_baseline:
```

Patterns belong here because they can change from visit to visit.

---

# 16. Demographic Analytics

The future system may aggregate by:

```text
age band
sex
race
ethnicity
condition
TCM disease
pattern
symptom cluster
disease duration
treatment duration
number of visits
baseline severity
treatment type
outcome
```

But demographic variables must NEVER be hard-coded into a disease card as though they describe a specific patient.

Condition cards may contain epidemiologic associations from published evidence.

Clinical analytics come from patient/case/visit data.

Keep those layers separate.

---

# 17. Source Provenance Schema

Every sourced fact should eventually be traceable.

Recommended source record:

```json
{
  "source_id": "source.medlineplus.migraine",
  "authority": "NLM / NIH",
  "source_type": "official_health_topic",
  "title": "Migraine",
  "url": "https://...",
  "retrieved_at": "2026-08-07",
  "language": "en",
  "license_notes": "...",
  "supports_fields": [
    "definition",
    "symptoms",
    "risk_factors"
  ]
}
```

Recommended `field_sources`:

```json
{
  "definition": [
    "source.medlineplus.migraine"
  ],
  "red_flags": [
    "source.ninds.xxx"
  ],
  "external_codes": [
    "source.cdc.icd10cm"
  ]
}
```

This is far safer than a single generic “sources” list at the bottom of a card.

---

# 18. Source Tier Policy

## Tier A — Standards / official terminology

```text
WHO ICD-11
CDC/NCHS ICD-10-CM
SNOMED CT
LOINC
GB/T 15657-2021
GB/T 16751 series
国家中医药管理局
HL7 FHIR structural references
```

Use for:

```text
identity
coding
classification
terminology
formal relationships
data architecture
```

---

## Tier B — Official clinical education / government clinical sources

```text
MedlinePlus
NIH institutes
CDC disease pages
FDA when medications/safety are involved
```

Use for:

```text
definition
symptoms
risk factors
diagnosis
tests
management
red flags
patient education
```

---

## Tier C — School / professional educational sources

```text
Bastyr lecture material
assigned textbooks
NCCAOM / NCBAHM exam outline
professional reference books
```

Use for:

```text
board emphasis
TCM differentiation
course-specific clinical pearls
exam traps
teaching organization
```

Keep course material separate from universally verified medical facts.

---

## Tier D — Secondary TCM reference / discovery

```text
CloudTCM
American Dragon
other reviewed TCM databases
```

Use for:

```text
terminology discovery
synonyms
related concepts
historical references
category discovery
exact source links
formula / herb / point discovery
```

Do not use Tier D alone to establish a high-stakes biomedical diagnosis, contraindication, emergency referral, or drug interaction.

---

# 19. Source Selection by Card Field

| Card Field | Preferred Source |
|---|---|
| Biomedical canonical code | ICD-10-CM / ICD-11 |
| Biomedical clinical concept | SNOMED CT |
| Patient-friendly summary | MedlinePlus |
| Specialty clinical depth | NIH Institute |
| Symptoms/signs code | SNOMED CT |
| Labs / measurements | LOINC |
| TCM disease classification | GB/T 15657 |
| TCM disease terminology | GB/T 16751.1 |
| TCM pattern classification | GB/T 15657 |
| TCM pattern terminology | GB/T 16751.2 |
| TCM treatment principle terminology | GB/T 16751.3 |
| International TM coding | WHO ICD-11 TM |
| TCM diagnosis/outcome methodology | ZY/T 10—2024 |
| CloudTCM category | CloudTCM provenance only |
| Board emphasis | NCBAHM / course material |
| Red flags | NIH / CDC / professional guidelines |
| Medication safety | FDA / DailyMed / official drug labeling |

---

# 20. Card Ingestion Workflow for Codex / Claude Code

## Phase 1 — Do NOT fill content yet

Before mass card creation:

```text
1. Freeze canonical namespace rules.
2. Freeze controlled vocabularies.
3. Freeze card templates.
4. Freeze relation registry.
5. Add validators.
6. Create source registry.
7. Create staging/import format.
8. Run migration tests.
```

---

## Phase 2 — Build `sym.*` infrastructure

The clinical use case now requires a symptom/observation namespace.

Order:

```text
1. symptom controlled vocabulary
2. SYM_CARD_TEMPLATE.md
3. validate-sym-standard.js
4. symptom source staging
5. aliases
6. only then symptom content
```

Start with high-frequency symptoms already referenced by:

```text
conditions
TCM diseases
patterns
course notes
CloudTCM disease entries
```

Do not attempt to build every possible medical symptom on day one.

---

## Phase 3 — Normalize existing CloudTCM imports

For each CloudTCM source entry:

```text
1. retain source ID
2. retain exact URL
3. retain categories
4. retain category path
5. retain image URL as source reference
6. identify candidate canonical entity/entities
7. assign mapping type
8. human review ambiguous mappings
9. write canonical link
10. never use CloudTCM ID in canonical relation fields
```

---

## Phase 4 — Fill Western condition cards

Priority:

```text
NCBAHM / school-relevant conditions
high-frequency clinic conditions
conditions already connected to AcuTing patterns/formulas/points
conditions appearing in current CloudTCM source index
```

For each:

```text
ICD → identity / classification
SNOMED → concept mapping
MedlinePlus → summary / aliases
NIH specialty source → clinical depth
FHIR-inspired fields → longitudinal compatibility
```

---

## Phase 5 — Fill TCM disease and pattern cards

For each:

```text
GB/T terminology first
WHO TM mapping when available
school/textbook clinical detail
CloudTCM as secondary discovery/reference
formula/acupuncture links via relation registry
```

---

# 21. Validator Rules That Should Exist Before Mass Ingestion

Recommended hard failures:

```text
canonical ID changes
duplicate canonical IDs
Chinese characters in IDs where namespace rules prohibit them
CloudTCM source ID used as canonical relation target
unregistered relation field
unresolved relation target
hand-authored reverse edge
same source copied as both canonical entity and staging entity
missing source URL on sourced card
invalid mapping type
invalid review status
invalid controlled vocabulary value
```

Recommended warnings:

```text
card has no official source
only Tier-D source supports biomedical content
mapping marked exact without official support
pattern has no manifestations
condition has no symptom links
symptom has duplicate synonym collisions
CloudTCM category exists but no canonical mapping
```

---

# 22. Minimum Review Status

Use:

```text
draft
translated
source_checked
clinically_reviewed
public_ready
deprecated
```

For mappings also use:

```text
unreviewed
candidate
source_checked
human_reviewed
rejected
```

---

# 23. Critical Rules for AI Agents

```text
DO NOT rename existing canonical IDs.

DO NOT delete canonical knowledge records.

DO NOT create a fifth CloudTCM diagnostic namespace.

DO NOT treat CloudTCM categories as AcuTing's canonical disease taxonomy.

DO preserve CloudTCM exact links and category paths.

DO NOT equate Western condition ↔ TCM disease ↔ TCM pattern.

DO NOT infer exact mappings from same/similar wording.

DO NOT hand-maintain both directions of a graph edge.

DO build the reverse direction from the relation registry.

DO NOT store patient-specific variables in canonical knowledge cards.

DO store changing TCM patterns at the visit level.

DO use one shared symptom/observation namespace.

DO distinguish symptoms, diagnoses, patterns, laboratory observations and treatment exposures.

DO preserve provenance for every imported source.

DO prefer official standards for identity/classification and high-authority clinical sources for safety.
```

---

# 24. Recommended Repository Layout

Adapt to existing paths without destructive refactoring.

```text
data/
  pathology/
    conditions.json
    tcm_diseases.json
    pattern_registry.json
    pattern_library.json
    symptoms.json

  config/
    relation_registry.json
    pattern_alias_map.json
    symptom_alias_map.json
    condition_vocabulary.json
    tdis_vocabulary.json
    pattern_family_vocabulary.json
    symptom_vocabulary.json

  sources/
    source_registry.json

    cloudtcm/
      disease_entries.json
      disease_categories.json
      source_mappings.json

    standards/
      icd11_refs.json
      icd10cm_refs.json
      gbt15657_refs.json
      gbt16751_refs.json

  clinical_cases/
    schema.sql
```

Do not move existing files solely to make this tree pretty.

Backward compatibility is more important than cosmetic organization.

---

# 25. Recommended First Implementation Task

Give this prompt to Codex / Claude Code:

```text
Read these files first:
- DECISIONS.md
- AI_CONSTITUTION.md
- docs/CONDITION_CARD_TEMPLATE.md
- docs/TDIS_CARD_TEMPLATE.md
- pattern template / validator docs
- data/config/relation_registry.json
- existing CloudTCM staging/import files
- this specification

Do not mass-fill cards yet.

Task:

1. Audit the current four diagnostic namespaces:
   cond.*
   tdis.*
   pattern.*
   sym.*

2. Confirm that CloudTCM records/categories are provenance only and that no
   cloudtcm.* source ID is used as a canonical relation target.

3. Preserve every exact CloudTCM URL and category assignment while mapping
   source records into canonical entities.

4. Because longitudinal clinical cases now require symptom-level data,
   design the missing sym.* namespace:
   - controlled vocabulary
   - card template
   - validator
   - alias map
   - import/staging format

5. Extend relation_registry.json for:
   condition ↔ symptom
   TCM disease ↔ symptom
   pattern ↔ manifestation
   condition ↔ TCM disease
   condition ↔ pattern
   TCM disease ↔ pattern

   Store each edge on one side only and derive the reverse.

6. Do not change existing immutable IDs.

7. Do not delete current data.

8. Do not make CloudTCM a separate user-facing diagnosis universe.

9. Before editing, return:
   - current state
   - proposed schema
   - exact files affected
   - migration risk
   - validator plan
   - smallest safe implementation batch

10. After implementation:
   - run all condition/pattern/tdis/sym/relation validators
   - run build-data
   - run content-junk checks
   - run git diff --check
   - report exact defect-count deltas
   - inspect the diff for accidental content loss
```

---

# 26. Long-Term Goal

The target is not a library of isolated cards.

It is a bilingual longitudinal integrative medicine knowledge graph:

```text
Biomedical Condition
        ↕
TCM Disease
        ↕
TCM Pattern
        ↕
Symptoms / Signs / Observations
        ↕
Patient Visit
        ↕
Treatment
        ↕
Outcome
```

with:

```text
stable immutable IDs
source provenance
external terminology mappings
time-aware clinical observations
one-way authored graph edges
derived reverse links
de-identified clinical records
reproducible outcome analytics
```

CloudTCM becomes a valuable lens into that graph, not a separate island inside it.


---

# 28. Current Implemented State Snapshot — 2026-08-07

The current `knowledge.js` implementation has already completed the major information-architecture merge.

Verified current state reported from browser testing:

```text
Total canonical cards: 284
  Western conditions: 150
  TCM diseases: 75
  TCM patterns: 59

Groups: 37
  Western: controlled 12-system vocabulary
  TCM diseases: controlled TCM disease taxonomy
  Patterns: differentiation-system taxonomy

Search:
  one unified search box

Example:
  query "眩暈"
  → 1 Western condition
  → 1 TCM disease
  → 6 TCM patterns

CloudTCM:
  no independent user-facing category row
  20 exact CloudTCM source-page links retained on corresponding canonical cards

Safety:
  170 cards currently flagged for missing safety content
    95 Western
    75 TCM disease
  cards remain searchable and visible

Pattern card:
  Antigravity large-card modal preserved
  bilingual switching verified
```

## Architectural interpretation

The project should NOT now spend time rebuilding the Condition workspace hierarchy again.

The correct next phase is:

```text
CURRENT:
cond.* + tdis.* + pattern.*
unified discovery UI
controlled grouping
source provenance links

NEXT:
sym.*
relation registry expansion
source normalization
ICD-10-CM mapping
clinical case/visit linking
safety-content completion
```

The UI can now be treated as a working shell over a graph rather than as three isolated card libraries.

## Unified search

Preserve the current single-search behavior. Future unified search should additionally return symptoms, signs, tongue findings, pulse findings, ICD-10-CM aliases/codes, and synonyms, while displaying entity-type badges so users do not confuse symptom, Western diagnosis, TCM disease, and TCM pattern.

## Missing-safety behavior

The current behavior is correct:

```text
missing safety content → show card + warning
```

Do not hide cards because safety content is incomplete. The warning should explicitly mean:

```text
Safety section incomplete / not yet source-checked
```

Recommended states:

```text
not_started
draft
source_checked
clinically_reviewed
not_applicable
```

## Safety backfill order

Prioritize:

```text
1. Western conditions with emergency / urgent red flags
2. Common acupuncture-clinic conditions
3. Conditions with important referral thresholds
4. TCM disease cards that may represent biomedical red-flag presentations
5. Remaining lower-risk educational cards
```

Do not independently duplicate the same red-flag prose across `cond.*`, `tdis.*`, `pattern.*`, and `sym.*`. Prefer shared safety rule sets and canonical relations.

## Preserve the Antigravity pattern modal

Pattern cards need deeper differentiation content, so the large bilingual modal is appropriate. Related conditions, TCM diseases, formulas, points, symptoms, tongue, and pulse should resolve via canonical IDs / relation registry rather than duplicated prose.

## Immediate next build order

Given the 284-card implementation is already stable:

```text
1. Freeze the current Condition workspace UX.
2. Add sym.* infrastructure.
3. Extend relation_registry.json.
4. Normalize aliases and source mappings.
5. Add ICD-10-CM external mappings for high-frequency acupuncture concepts.
6. Backfill high-priority safety content.
7. Add case/visit graph hooks.
8. Only then expand the card count substantially.
```

## First `sym.*` seed

Do not import a giant generic symptom dictionary first.

Extract the first symptom registry from manifestations already referenced in:

```text
150 Western condition cards
75 TCM disease cards
59 Pattern cards
CloudTCM mapped source entries
school / board content already in AcuTing
```

Then normalize them into canonical `sym.*` IDs.

## Insurance layer

Do not create a parallel ICD page.

The existing Western condition cards and future symptom cards should expose:

```text
Insurance / Coding
  ├── ICD-10-CM mappings
  ├── laterality / specificity notes
  ├── release/version
  └── documentation requirements
```

ICD-10-CM remains an external, versioned mapping rather than an AcuTing canonical ID.
