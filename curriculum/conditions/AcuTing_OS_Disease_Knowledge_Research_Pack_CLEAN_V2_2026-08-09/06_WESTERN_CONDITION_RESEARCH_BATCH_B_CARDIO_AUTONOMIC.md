# Western Condition Research Batch B - Cardiovascular / Autonomic

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 2  
**Focus:** heart failure and POTS.

---

# 01. Heart Failure · 心臟衰竭

## Identity

```yaml
candidate_id: cond.heart_failure
candidate_id_status: STAGING_ONLY
identity_status: LEGACY_CANDIDATE_REVERIFY
name: Heart Failure
name_zh: 心臟衰竭
board_scope: BOARD_EXPLICIT
```

Before ingestion, determine whether CURRENT canonical data uses `heart failure`, `congestive heart failure`, or a subtype-specific identity.

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Heart failure is a serious clinical syndrome in which the heart cannot pump and/or fill adequately to meet the body's needs without abnormally elevated filling pressures. Common consequences include dyspnea, fatigue and fluid retention.

### `clinical_definition` [CANONICAL_NOW]

Heart failure is not synonymous with myocardial infarction or cardiomyopathy, although ischemic disease, myocardial injury, hypertension, valvular disease, cardiomyopathy and rhythm disorders can cause or worsen it. Phenotype and cause matter for treatment.

### `etiology` [CANONICAL_NOW]

Common cause pathways include:

```text
ischemic heart disease / prior myocardial injury
hypertension
cardiomyopathy
valvular heart disease
arrhythmia
other structural or inflammatory cardiac disease
```

### `pathophysiology` [CANONICAL_NOW]

Impaired systolic contraction, impaired relaxation/filling or both can reduce effective output and raise cardiac filling pressures. Neurohormonal compensation initially supports circulation but can promote remodeling, sodium/water retention and progressive congestion.

### `presentation_clinical` [CANONICAL_NOW]

Common symptoms include exertional dyspnea, orthopnea, fatigue and edema. Clinical phenotype can vary by left/right-sided involvement, acuity, ejection fraction and comorbid disease.

### `key_features` [CANONICAL_NOW]

```text
clinical syndrome rather than one single anatomic diagnosis
congestion and exercise intolerance are common
EF classification helps treatment but does not replace the clinical diagnosis
cause and precipitating factors must be evaluated
```

### `red_flags` [CANONICAL_NOW]

New or severe dyspnea at rest, chest pain suggesting acute ischemia, syncope, marked hypoxia, rapidly worsening edema with respiratory distress, or signs of shock require urgent or emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]

Evaluation uses history and physical examination plus tests such as BNP/NT-proBNP, ECG, echocardiography and additional imaging or ischemic evaluation as clinically indicated. Echocardiography helps assess structure and ejection fraction.

### `differential_diagnosis` [CANONICAL_NOW]

```text
COPD / asthma
pneumonia
pulmonary embolism
anemia
renal or liver volume overload
venous disease
deconditioning
other causes of dyspnea and edema
```

### `western_treatment` [CANONICAL_NOW]

Management depends on heart-failure phenotype and cause. It can include lifestyle/fluid-sodium strategies, guideline-directed medications, treatment of contributing disease, cardiac rehabilitation and selected devices or procedures.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture can only be adjunctive for stable, medically managed patients. New dyspnea, edema, exercise intolerance, hypotension, chest symptoms or syncope should trigger biomedical reassessment rather than being interpreted only through a TCM pattern.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - HFrEF / HFmrEF / HFpEF phenotype model
  - stage / functional class
  - structured complication list
  - monitoring targets
  - cardiac device status
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - concept: dyspnea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: edema
    endpoint: RECONCILE_EXISTING_REFERENCE
    note: tdis registry already references sym.edema
  - concept: orthopnea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: palpitations
    endpoint: MISSING_ENDPOINT_CANDIDATE

tdis_candidates:
  - id: tdis.shui_zhong
    endpoint: REGISTERED_ONLY
    relation: COMMON_TCM_PRESENTATION
    warning: edema has many biomedical causes
  - id: tdis.xin_ji
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
  - id: tdis.xiong_bi
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
```

## ICD / coding staging

Heart failure codes vary by systolic/diastolic characterization and acute/chronic status. A generic family hint is safer than an exact code when phenotype/acuity is unknown.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Appendix A
  supports: Board scope

- source: NHLBI - Heart Failure
  url: https://www.nhlbi.nih.gov/health/heart-failure
  tier: A
  supports: overview, pathophysiology, symptoms

- source: NHLBI - Heart Failure Diagnosis
  url: https://www.nhlbi.nih.gov/health/heart-failure/diagnosis
  tier: A
  supports: BNP, ECG, echo and other testing

- source: NHLBI - Heart Failure Treatment
  url: https://www.nhlbi.nih.gov/health/heart-failure/treatment
  tier: A
  supports: treatment framework
```

## Open questions

```text
1. Which exact current cond.* identity represents heart failure, if any?
2. Should EF phenotype be separate subtypes or a structured property?
3. Should edema/dyspnea reverse relations be authored from symptom side only?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 7
schema_gap_candidates: 5
source_items: 4
canonical_write_authorized: false
```

---

# 02. Postural Orthostatic Tachycardia Syndrome (POTS) · 姿勢性直立心搏過速症候群

## Identity

```yaml
candidate_id: cond.pots
candidate_id_status: STAGING_ONLY
identity_status: LEGACY_CANDIDATE_REVERIFY
name: Postural Orthostatic Tachycardia Syndrome (POTS)
name_zh: 姿勢性直立心搏過速症候群
board_scope: BOARD_EXPLICIT
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

POTS is a chronic orthostatic-intolerance syndrome characterized by excessive heart-rate rise with upright posture, associated orthostatic symptoms and absence of a qualifying orthostatic blood-pressure drop or another condition that better explains the tachycardia.

### `clinical_definition` [CANONICAL_NOW]

POTS is not a synonym for dizziness, tachycardia, anxiety, deconditioning or orthostatic hypotension. It is a syndrome requiring an orthostatic pattern and exclusion of alternative causes.

### `etiology` [CANONICAL_NOW]

Etiology is heterogeneous. Reported mechanisms/contexts include autonomic dysfunction, volume dysregulation, deconditioning and post-infectious or other triggers. Many patients have overlapping mechanisms rather than one single cause.

### `pathophysiology` [CANONICAL_NOW]

On standing, normal circulatory/autonomic compensation is insufficient or dysregulated, producing excessive tachycardia and orthostatic symptoms. Proposed mechanisms vary among patients and include hypovolemia, neuropathic autonomic dysfunction and hyperadrenergic physiology.

### `presentation_clinical` [CANONICAL_NOW]

Symptoms may include lightheadedness/dizziness, palpitations, tachycardia, fatigue, exercise intolerance, cognitive difficulty, dyspnea and sometimes syncope or near-syncope. Symptoms typically worsen upright and improve with recumbency.

### `key_features` [CANONICAL_NOW]

NIH expert work uses a sustained excessive heart-rate increase within 10 minutes upright, chronic orthostatic symptoms, absence of qualifying orthostatic hypotension and exclusion of another cause. Adult and adolescent heart-rate thresholds differ. Do not reduce the diagnosis to “fast pulse when standing.”

### `red_flags` [CANONICAL_NOW]

Syncope with injury, chest pain, severe dyspnea, new neurologic findings, major bleeding/dehydration, or evidence of a concerning arrhythmia/structural heart disorder requires evaluation beyond a routine POTS label.

### `diagnosis_methods` [CANONICAL_NOW]

Evaluation includes history, medication review, orthostatic vital signs, active stand or tilt testing, ECG and selected tests to exclude anemia, thyroid disease, dehydration, arrhythmia and structural/systemic causes. Additional autonomic/cardiac testing is individualized.

### `differential_diagnosis` [CANONICAL_NOW]

```text
orthostatic hypotension
inappropriate sinus tachycardia
dehydration / volume loss
anemia
hyperthyroidism
medication effects
arrhythmia
structural heart disease
panic/anxiety presentations
prolonged deconditioning
```

### `western_treatment` [CANONICAL_NOW]

Treatment is individualized and commonly begins with education and nonpharmacologic strategies such as graded conditioning, compression and fluid/salt strategies when appropriate. Medications may be used symptomatically. NIH expert reviews note limited evidence and no single universal cure.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture may be adjunctive for stable symptoms, but unexplained dizziness/palpitations should not be labeled POTS without biomedical evaluation. Orthostatic vitals, anemia/thyroid causes, medication effects and safety red flags matter.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - formal structured diagnostic criteria
  - POTS phenotype/subtype model
  - comorbidity clusters
  - longitudinal orthostatic-vital trends
  - structured response monitoring
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - id: sym.fatigue
    endpoint: EXISTS
  - concept: dizziness
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: palpitations
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: syncope
    endpoint: MISSING_ENDPOINT_CANDIDATE

tdis_candidates:
  - id: tdis.xuan_yun
    endpoint: REGISTERED_ONLY
    relation: COMMON_TCM_PRESENTATION
  - id: tdis.xin_ji
    endpoint: REGISTERED_ONLY
    relation: COMMON_TCM_PRESENTATION
```

## ICD / coding staging

POTS has had coding changes in recent ICD-10-CM eras. Verify the active fiscal-year exact code at ingestion. Do not reuse an older dysautonomia code from memory.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Appendix A
  supports: Board scope

- source: NHLBI NIH POTS Workshop - State of the Science, Clinical Care, and Research
  url: https://www.nhlbi.nih.gov/events/2019/postural-orthostatic-tachycardia-syndrome-pots-state-science-clinical-care-and-research
  tier: A / NIH workshop
  supports: criteria, mechanisms, care gaps

- source: NIH News in Health - Recognizing POTS
  url: https://newsinhealth.nih.gov/2023/09/recognizing-pots
  tier: A / NIH patient education
  supports: symptom overview

- source: NIH/PMC expert consensus review
  url: https://pmc.ncbi.nlm.nih.gov/articles/PMC8455420/
  tier: A / peer-reviewed expert review
  supports: diagnostic criteria and management framework
```

## Open questions

```text
1. Does the current condition library already contain POTS under another ID?
2. Should orthostatic criteria become a structured diagnostic object only after other criteria-heavy diseases show the same need?
3. Should orthostatic hypotension be a separate canonical condition if absent?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 6
schema_gap_candidates: 5
source_items: 4
canonical_write_authorized: false
```
