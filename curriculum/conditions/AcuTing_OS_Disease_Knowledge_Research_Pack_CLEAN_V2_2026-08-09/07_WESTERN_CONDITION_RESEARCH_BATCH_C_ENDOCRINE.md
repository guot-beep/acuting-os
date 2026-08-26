# Western Condition Research Batch C - Endocrine

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 3  
**Focus:** Addison disease, Graves disease, Hashimoto thyroiditis.

---

# 01. Addison Disease / Primary Adrenal Insufficiency · 愛迪生氏病／原發性腎上腺功能不全

## Identity

```yaml
candidate_id: cond.addison_disease
candidate_id_status: STAGING_ONLY
identity_status: LEGACY_CANDIDATE_REVERIFY
name: Addison Disease / Primary Adrenal Insufficiency
name_zh: 愛迪生氏病／原發性腎上腺功能不全
board_scope: BOARD_PARENT_EXAMPLE
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Addison disease is primary adrenal insufficiency caused by failure of the adrenal glands, resulting in inadequate cortisol production and often inadequate aldosterone production.

### `clinical_definition` [CANONICAL_NOW]

Addison disease is one form of adrenal insufficiency. It should be distinguished from secondary/tertiary adrenal insufficiency, including suppression caused by prolonged exogenous corticosteroid exposure and withdrawal.

### `etiology` [CANONICAL_NOW]

Autoimmune adrenal destruction is a major cause. Infection, hemorrhage, infiltrative disease and other forms of adrenal injury can also cause primary adrenal insufficiency.

### `pathophysiology` [CANONICAL_NOW]

Cortisol deficiency impairs the physiologic stress response, glucose regulation and vascular homeostasis. In primary adrenal failure, aldosterone deficiency can contribute to sodium loss, volume depletion and potassium elevation.

### `presentation_clinical` [CANONICAL_NOW]

Symptoms may develop gradually and include fatigue, muscle weakness, reduced appetite, weight loss and abdominal pain. Primary adrenal insufficiency can also cause hyperpigmentation and salt craving. Acute decompensation can present as adrenal crisis.

### `key_features` [CANONICAL_NOW]

```text
primary adrenal failure
cortisol deficiency
aldosterone deficiency often present
hyperpigmentation can support primary rather than central disease
stress/illness can precipitate crisis
```

### `red_flags` [CANONICAL_NOW]

Adrenal crisis is life-threatening. Severe weakness with vomiting/diarrhea, hypotension, confusion, loss of consciousness or severe abdominal/back/leg pain in a person with adrenal insufficiency requires emergency treatment.

### `diagnosis_methods` [CANONICAL_NOW]

Blood testing confirms adrenal insufficiency and helps distinguish type. NIDDK describes the ACTH stimulation test as the most commonly used diagnostic test. Antibody testing, adrenal CT or pituitary MRI may be used to determine the cause.

### `differential_diagnosis` [CANONICAL_NOW]

```text
secondary/tertiary adrenal insufficiency
glucocorticoid withdrawal
sepsis
dehydration
acute GI illness
hypoglycemia
other causes of hypotension/electrolyte abnormality
```

### `western_treatment` [CANONICAL_NOW]

Treatment replaces deficient hormones, usually glucocorticoid and, when aldosterone is deficient, mineralocorticoid. Stress dosing is required for significant illness/surgery. Adrenal crisis requires immediate parenteral corticosteroid plus fluid and glucose/electrolyte support.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture is not a replacement for hormone replacement or stress-dose planning. Vomiting that prevents oral steroid intake, severe illness or adrenal-crisis symptoms require urgent medical management.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - primary vs secondary adrenal-insufficiency subtype object
  - sick-day / stress-dose plan
  - electrolyte monitoring
  - emergency adrenal-crisis plan
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - id: sym.fatigue
    endpoint: EXISTS
  - concept: abdominal_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: vomiting
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: hypotension
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: syncope
    endpoint: MISSING_ENDPOINT_CANDIDATE

tdis:
  - id: tdis.xu_lao
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
    warning: not equivalent
```

## ICD / coding staging

Exact coding depends on Addison disease versus other adrenal insufficiency and whether crisis is present. Verify current ICD-10-CM at ingestion.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Appendix A - adrenal disorders
  supports: Board scope

- source: NIDDK - Adrenal Insufficiency & Addison's Disease
  url: https://www.niddk.nih.gov/health-information/endocrine-diseases/adrenal-insufficiency-addisons-disease
  tier: A
  supports: overview, symptoms, causes

- source: NIDDK - Diagnosis of Adrenal Insufficiency & Addison's Disease
  url: https://www.niddk.nih.gov/health-information/endocrine-diseases/adrenal-insufficiency-addisons-disease/diagnosis
  tier: A
  supports: ACTH testing and cause work-up

- source: NIDDK - Treatment of Adrenal Insufficiency & Addison's Disease
  url: https://www.niddk.nih.gov/health-information/endocrine-diseases/adrenal-insufficiency-addisons-disease/treatment
  tier: A
  supports: replacement and crisis treatment
```

## Open questions

```text
1. Does current canonical data contain generic adrenal insufficiency, Addison disease, or both?
2. Is adrenal crisis a complication state, separate emergency entity, or safety relation?
3. Where should individualized stress-dose instructions live relative to a generic disease card?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 6
schema_gap_candidates: 4
source_items: 4
canonical_write_authorized: false
```

---

# 02. Graves Disease · 葛瑞夫茲病

## Identity

```yaml
candidate_id: cond.graves_disease
candidate_id_status: STAGING_ONLY
identity_status: LEGACY_CANDIDATE_REVERIFY
name: Graves Disease
name_zh: 葛瑞夫茲病
board_scope: BOARD_PARENT_EXAMPLE
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Graves disease is an autoimmune disorder in which thyroid-stimulating antibodies drive excessive thyroid hormone production and commonly cause hyperthyroidism.

### `clinical_definition` [CANONICAL_NOW]

Graves disease is not synonymous with every form of hyperthyroidism. It is an autoimmune cause with characteristic antibody findings, diffuse thyroid stimulation and sometimes eye or skin manifestations.

### `etiology` [CANONICAL_NOW]

Genetic susceptibility and environmental factors contribute. Thyroid-stimulating immunoglobulins activate the TSH receptor and drive excess hormone production.

### `pathophysiology` [CANONICAL_NOW]

TSH-receptor stimulation increases thyroid hormone synthesis and release, accelerating metabolic and cardiovascular activity. Autoimmune inflammation can also affect orbital tissues and, less commonly, skin.

### `presentation_clinical` [CANONICAL_NOW]

Possible features include weight loss despite appetite, rapid or irregular heartbeat, heat intolerance, sweating, tremor, anxiety/irritability, insomnia, fatigue, frequent bowel movements and goiter. Graves eye disease can cause eye irritation, proptosis or diplopia.

### `key_features` [CANONICAL_NOW]

```text
autoimmune hyperthyroidism
TSI/TRAb support etiology
diffuse goiter may occur
ophthalmopathy is a distinctive Graves association
hyperthyroid symptoms are not specific enough to establish Graves alone
```

### `red_flags` [CANONICAL_NOW]

Severe decompensated thyrotoxicosis/thyroid storm, serious tachyarrhythmia, chest pain, heart failure symptoms or acute vision-threatening eye disease require urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]

Diagnosis uses thyroid hormone and TSH testing plus evidence that Graves is the cause. TSI antibody testing, radioactive iodine uptake/scan or Doppler ultrasound may be used depending context. Pregnancy changes test choice.

### `differential_diagnosis` [CANONICAL_NOW]

```text
toxic thyroid nodules
thyroiditis
exogenous thyroid hormone excess
iodine-related hyperthyroidism
other causes of tachycardia / weight loss / tremor
```

### `western_treatment` [CANONICAL_NOW]

Treatment may include beta blockers for symptom control, antithyroid medication, radioiodine or surgery depending patient context. Graves eye disease can require separate management.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture is adjunctive only. It must not delay biochemical diagnosis or treatment of severe tachyarrhythmia, thyroid storm, serious eye disease or pregnancy-related risk.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - Graves ophthalmopathy as complication/subentity
  - thyroid-storm complication state
  - treatment course / remission
  - structured thyroid-lab monitoring
```

## Proposed relations [DERIVED_RELATION]

```yaml
missing_symptoms:
  - palpitations
  - tremor
  - heat_intolerance
  - weight_loss

existing_symptom_context:
  - id: sym.insomnia
    endpoint: EXISTS
  - id: sym.fatigue
    endpoint: EXISTS

tdis:
  - id: tdis.ying_bing
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
    warning: 癭病 is broader than Graves and goiter is not universal
  - id: tdis.xin_ji
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
```

## ICD / coding staging

Graves/thyrotoxicosis coding varies with complication such as crisis and eye disease. Verify exact current ICD-10-CM rather than assigning a universal code.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Appendix A - thyroid disorders
  supports: Board scope

- source: NIDDK - Graves' Disease
  url: https://www.niddk.nih.gov/health-information/endocrine-diseases/graves-disease
  tier: A
  supports: cause, symptoms, diagnosis, treatment

- source: NIDDK - Hyperthyroidism
  url: https://www.niddk.nih.gov/health-information/endocrine-diseases/hyperthyroidism
  tier: A
  supports: hyperthyroid presentation and differential context
```

## Open questions

```text
1. Does current canonical data already separate hyperthyroidism and Graves disease?
2. Should Graves ophthalmopathy be its own condition relation or a structured complication?
3. How should medication relations be authored once pharmacology linkage is formalized?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 8
schema_gap_candidates: 4
source_items: 3
canonical_write_authorized: false
```

---

# 03. Hashimoto Thyroiditis · 橋本氏甲狀腺炎

## Identity

```yaml
candidate_id: cond.hashimoto_thyroiditis
candidate_id_status: STAGING_ONLY
identity_status: LEGACY_CANDIDATE_REVERIFY
name: Hashimoto Thyroiditis
name_zh: 橋本氏甲狀腺炎
board_scope: BOARD_PARENT_EXAMPLE
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Hashimoto disease is autoimmune thyroiditis that commonly causes progressive thyroid damage and hypothyroidism. Early disease may be asymptomatic and some patients can have a transient hyperthyroid phase.

### `clinical_definition` [CANONICAL_NOW]

Hashimoto thyroiditis is not synonymous with all hypothyroidism. Other causes of thyroid hormone deficiency remain separate biomedical identities.

### `etiology` [CANONICAL_NOW]

Autoimmune susceptibility, family history and environmental factors contribute. Thyroid-directed antibodies and immune-cell infiltration damage thyroid tissue over time.

### `pathophysiology` [CANONICAL_NOW]

Chronic immune-mediated thyroid injury reduces hormone-producing capacity. Thyroid enlargement can occur earlier in the course, while gland atrophy can occur after prolonged disease.

### `presentation_clinical` [CANONICAL_NOW]

Symptoms often reflect hypothyroidism and may include fatigue, weight gain, cold intolerance, constipation, dry skin/hair, muscle or joint symptoms, menstrual/fertility changes and slowed heart rate. Some patients are initially asymptomatic.

### `key_features` [CANONICAL_NOW]

```text
autoimmune thyroiditis
can progress to hypothyroidism
TPO antibodies commonly support the autoimmune etiology
Hashimoto disease != every hypothyroid state
thyroid structure can change over time
```

### `red_flags` [CANONICAL_NOW]

Severe untreated hypothyroid decompensation with altered mental status, hypothermia, severe bradycardia or cardiorespiratory instability requires urgent medical care.

### `diagnosis_methods` [CANONICAL_NOW]

Diagnosis uses history/exam and thyroid blood tests including TSH and T4 plus thyroid peroxidase antibodies. Ultrasound may help when antibodies are negative or structural thyroid questions remain.

### `differential_diagnosis` [CANONICAL_NOW]

```text
non-autoimmune hypothyroidism
postpartum/subacute thyroiditis
medication or iodine effects
pituitary disease
non-thyroid causes of fatigue, constipation and weight change
```

### `western_treatment` [CANONICAL_NOW]

Patients who develop hypothyroidism are commonly treated with levothyroxine and monitored with thyroid testing. Patients without hypothyroidism may be monitored rather than automatically treated.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture can be adjunctive for symptoms but must not replace thyroid hormone when indicated. Medication timing/absorption interactions, pregnancy and thyroid lab follow-up are clinically important.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - autoimmune disease phase/course
  - goiter vs atrophy status
  - structured lab monitoring
  - pregnancy-specific management context
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - id: sym.fatigue
    endpoint: EXISTS
  - concept: cold_intolerance
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: constipation
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: weight_gain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: bradycardia
    endpoint: MISSING_ENDPOINT_CANDIDATE

tdis:
  - id: tdis.ying_bing
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
    warning: goiter context only; not autoimmune-thyroid equivalence
```

## ICD / coding staging

Hashimoto thyroiditis and hypothyroidism are different coding identities. Do not automatically use a hypothyroidism code as the Hashimoto identity or vice versa. Verify current ICD-10-CM at ingestion.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Appendix A - thyroid disorders
  supports: Board scope

- source: NIDDK - Hashimoto's Disease
  url: https://www.niddk.nih.gov/health-information/endocrine-diseases/hashimotos-disease
  tier: A
  supports: definition, mechanism, symptoms, diagnosis, treatment

- source: NIDDK - Hypothyroidism
  url: https://www.niddk.nih.gov/health-information/endocrine-diseases/hypothyroidism
  tier: A
  supports: hypothyroid context and management
```

## Open questions

```text
1. Does current canonical data contain Hashimoto and hypothyroidism as separate identities?
2. Should goiter be a symptom/sign, a TCM disease association, or a structural finding depending context?
3. Should levothyroxine absorption/interactions remain drug-card truth with a derived condition view?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 6
schema_gap_candidates: 4
source_items: 3
canonical_write_authorized: false
```
