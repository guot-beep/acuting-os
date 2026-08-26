# Western Condition Research Batch A - Hematology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 3  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Board anchor:** 2026 NCBAHM Biomedicine Appendix A.

> Candidate IDs below are staging labels only. A future ingest AI must exact-scan the current canonical condition file before creating or renaming any `cond.*` identity.

---

# 01. Anemia · 貧血

## Identity

```yaml
candidate_id: cond.anemia
candidate_id_status: STAGING_ONLY
identity_status: LEGACY_CANDIDATE_REVERIFY
name: Anemia
name_zh: 貧血
board_scope: BOARD_PARENT_EXAMPLE
board_anchor: Disorders of red blood cells, anemia example
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Anemia is a condition in which the blood has a lower-than-normal amount of healthy red blood cells and/or hemoglobin, reducing the delivery of oxygen-rich blood to tissues. It is a syndrome with many possible causes rather than one single cause-specific disease.

### `clinical_definition` [CANONICAL_NOW]

Clinically, anemia should be treated as a finding that requires cause evaluation. Major mechanistic categories are blood loss, insufficient red-cell production, and increased red-cell destruction. Morphology, reticulocyte response and the clinical context help narrow the cause.

### `etiology` [CANONICAL_NOW]

Important cause pathways include:

```text
acute or chronic blood loss
iron deficiency
vitamin B12 or folate deficiency
chronic kidney disease
chronic inflammatory disease
bone-marrow disease
inherited hemoglobin disorders
hemolysis
pregnancy-related increased iron demand
selected medication/treatment effects
```

Do not collapse “risk factor” and “cause” if a source distinguishes them.

### `pathophysiology` [CANONICAL_NOW]

Reduced red-cell mass and/or hemoglobin lowers oxygen-carrying capacity. The marrow response and red-cell indices help distinguish production failure, nutrient deficiency, blood loss and destruction. Mechanism-specific workup may assess iron stores, B12/folate, renal function, hemolysis and the source of bleeding.

### `presentation_clinical` [CANONICAL_NOW]

Possible features include fatigue, weakness, pallor, shortness of breath, headache, dizziness or fainting, chills and irregular heartbeat. Symptoms vary with severity, chronicity, comorbidity and the rate at which anemia develops. Some patients are minimally symptomatic.

### `key_features` [CANONICAL_NOW]

```text
CBC confirms the presence and basic morphology of anemia
MCV helps frame microcytic / normocytic / macrocytic reasoning
reticulocyte response helps distinguish underproduction from loss/destruction
iron studies are essential when iron deficiency is suspected
cause evaluation matters more than simply raising hemoglobin
```

### `red_flags` [CANONICAL_NOW]

Urgent medical assessment is appropriate when anemia is accompanied by chest pain, syncope, severe dyspnea, hemodynamic instability, active major bleeding, or other signs of inadequate tissue oxygen delivery. Do not place a universal hemoglobin emergency cutoff in the card without context-specific authoritative guidance.

### `diagnosis_methods` [CANONICAL_NOW]

CBC is the entry test. Depending on history and indices, evaluation can include reticulocyte count, peripheral smear, ferritin and iron studies, vitamin B12/folate testing, renal function and tests for hemolysis or blood loss. The diagnostic goal is to identify the cause, not merely label a low hemoglobin value.

### `differential_diagnosis` [CANONICAL_NOW]

```text
iron deficiency anemia
vitamin B12 / folate deficiency
anemia of chronic inflammation
renal anemia
hemolytic anemia
marrow failure or infiltration
inherited hemoglobin disorder
acute or chronic blood loss
```

Fatigue and dizziness alone do not establish anemia.

### `western_treatment` [CANONICAL_NOW]

Treatment depends on cause and severity. It can include nutrient replacement when deficiency is proven, treatment of bleeding or underlying disease, selected erythropoiesis-supporting therapy, transfusion in appropriate severe contexts and disease-specific hematology management.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture may be used only as adjunctive symptom/supportive care within scope. It must not delay evaluation of blood loss, severe anemia, marrow disease or cardiopulmonary compromise. If fatigue or dizziness changes abruptly, reassess biomedical safety rather than assuming a TCM pattern shift.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - structured anemia subtype taxonomy
  - structured complication list
  - longitudinal monitoring plan

DERIVED_RELATION:
  - symptoms
  - related causes/conditions where canonical
  - medication associations after pharmacology relation contract is found
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - id: sym.fatigue
    endpoint: EXISTS
    confidence: high
    note: common but nonspecific
  - concept: dizziness
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - id: sym.headache
    endpoint: EXISTS
    confidence: medium
  - concept: dyspnea
    endpoint: MISSING_ENDPOINT_CANDIDATE

tdis_candidates:
  - id: tdis.xu_lao
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
    warning: 虛勞 is broader than anemia
```

## ICD / coding staging

Anemia spans multiple ICD-10-CM families. Generic anemia should not be assigned one exact billing code without type/cause. Exact code selection must be verified in the active fiscal-year CDC/NCHS ICD-10-CM source at ingestion.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Appendix A
  tier: Board authority
  supports: scope

- source: NHLBI - Anemia
  url: https://www.nhlbi.nih.gov/health/anemia
  tier: A
  supports: definition, symptoms, general mechanism

- source: NHLBI - Anemia Causes and Risk Factors
  url: https://www.nhlbi.nih.gov/health/anemia/causes
  tier: A
  supports: causes

- source: NHLBI - Anemia Diagnosis
  url: https://www.nhlbi.nih.gov/health/anemia/diagnosis
  tier: A
  supports: diagnostic work-up

- source: NHLBI - Anemia Treatment
  url: https://www.nhlbi.nih.gov/health/anemia/treatment
  tier: A
  supports: management

- source: CDC/NCHS ICD-10-CM
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
  tier: A
  supports: coding verification only
```

## Open questions

```text
1. Does the current 150-card library already contain generic anemia under a different ID or alias?
2. Should iron deficiency anemia be a separate canonical condition, child identity, or subtype/staging concept?
3. Where should longitudinal lab monitoring live if it becomes a repeated structured need?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 5
schema_gap_candidates: 3
source_items: 6
canonical_write_authorized: false
```

---

# 02. Thrombocytopenia · 血小板減少症

## Identity

```yaml
candidate_id: cond.thrombocytopenia
candidate_id_status: STAGING_ONLY
identity_status: LEGACY_CANDIDATE_REVERIFY
name: Thrombocytopenia
name_zh: 血小板減少症
board_scope: BOARD_PARENT_EXAMPLE
board_anchor: Disorders of platelets, thrombocytopenia example
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Thrombocytopenia is a lower-than-normal platelet count. Clinical significance ranges from an incidental laboratory finding to serious bleeding risk depending on platelet level, platelet function, cause and the patient's overall clinical context.

### `clinical_definition` [CANONICAL_NOW]

Platelets are essential to primary hemostasis. Thrombocytopenia may reflect decreased production, increased immune or nonimmune destruction, increased consumption, splenic sequestration, dilution or other systemic disease. The diagnosis is not complete until the mechanism is considered.

### `etiology` [CANONICAL_NOW]

```text
bone-marrow suppression or failure
immune destruction
consumptive processes
infection
liver/splenic disease
pregnancy-related states
drug-associated thrombocytopenia
systemic disease
```

### `pathophysiology` [CANONICAL_NOW]

A reduced circulating platelet pool impairs formation of the initial platelet plug. Mechanism-specific disease may involve marrow production failure, immune-mediated destruction, consumption in systemic coagulation or sequestration in an enlarged spleen.

### `presentation_clinical` [CANONICAL_NOW]

Possible findings include petechiae, purpura, easy bruising, prolonged bleeding, nose or gum bleeding, blood in urine/stool and heavy menstrual bleeding. Mild thrombocytopenia may be asymptomatic and discovered on CBC.

### `key_features` [CANONICAL_NOW]

```text
platelet count must be interpreted with bleeding symptoms and cause
CBC and peripheral smear are common first steps
pseudothrombocytopenia/lab artifact must remain in the differential
other cytopenias can suggest marrow/systemic disease
medication review is important
```

### `red_flags` [CANONICAL_NOW]

Bleeding that will not stop with pressure requires immediate medical care. Serious internal bleeding, neurologic symptoms concerning for intracranial hemorrhage, hemodynamic compromise or major GI/GYN bleeding require urgent or emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]

Evaluation commonly includes history, medication review, examination, CBC and peripheral smear, followed by cause-directed testing. Bone-marrow evaluation may be used when production disorders or marrow disease are suspected.

### `differential_diagnosis` [CANONICAL_NOW]

```text
immune thrombocytopenia
drug-induced thrombocytopenia
TTP / DIC and other consumptive states
marrow disease
infection / liver disease
pregnancy-related thrombocytopenia
laboratory artifact
```

### `western_treatment` [CANONICAL_NOW]

Treatment is cause- and severity-specific. Some mild cases are observed. Other cases may require stopping an offending medicine, immune-directed treatment, thrombopoietic therapy, platelet transfusion in selected severe bleeding/high-risk contexts or splenectomy in selected chronic disease.

### `acupuncture_role` [CANONICAL_NOW]

Needling, cupping, gua sha and bleeding techniques require special caution in a bleeding-risk disorder. Acupuncture is not a substitute for hematologic evaluation. Procedure safety should be based on the patient's actual bleeding context, current laboratory data and clinical policy rather than an invented universal threshold.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - structured bleeding-risk context
  - procedure-specific needling precaution rules
  - structured cause taxonomy
```

## Proposed relations [DERIVED_RELATION]

```yaml
missing_symptom_candidates:
  - bruising
  - petechiae
  - bleeding
  - heavy_menstrual_bleeding

medication_relation_candidate:
  status: STAGING_ONLY
  note: anticoagulant/antiplatelet and offending-drug review is clinically important, but relation contract must be found first
```

## ICD / coding staging

Thrombocytopenia has multiple cause-specific ICD-10-CM identities. Unspecified thrombocytopenia should not be used when a more specific documented etiology exists. Verify the active fiscal-year code at ingestion.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Appendix A
  supports: Board scope

- source: NHLBI - Platelet Disorders / Thrombocytopenia
  url: https://www.nhlbi.nih.gov/health/platelet-disorders
  tier: A
  supports: definition, causes, manifestations

- source: NHLBI - Platelet Disorders Symptoms
  url: https://www.nhlbi.nih.gov/health/platelet-disorders/symptoms
  tier: A
  supports: bleeding manifestations and emergency context

- source: NHLBI - Platelet Disorders Treatment
  url: https://www.nhlbi.nih.gov/health/platelet-disorders/treatment
  tier: A
  supports: management

- source: CDC/NCHS ICD-10-CM
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
  tier: A
  supports: coding verification
```

## Open questions

```text
1. Is generic thrombocytopenia already represented under a platelet-disorder parent?
2. Should procedure-specific acupuncture thresholds live in a shared safety policy rather than individual condition cards?
3. Should bleeding be one broad symptom endpoint or a family of site-specific endpoints?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 5
schema_gap_candidates: 3
source_items: 5
canonical_write_authorized: false
```

---

# 03. Sickle Cell Disease · 鐮狀細胞疾病

## Identity

```yaml
candidate_id: cond.sickle_cell_disease
candidate_id_status: STAGING_ONLY
identity_status: LEGACY_CANDIDATE_REVERIFY
name: Sickle Cell Disease
name_zh: 鐮狀細胞疾病
board_scope: BOARD_PARENT_EXAMPLE
board_anchor: Disorders of red blood cells, sickle cell disease example
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Sickle cell disease is a group of inherited hemoglobin disorders in which abnormal hemoglobin promotes red-cell sickling, hemolysis and vaso-occlusion. It is a lifelong disease and is not the same identity as sickle cell trait.

### `clinical_definition` [CANONICAL_NOW]

Different genotypes cause different sickle cell disease phenotypes. Abnormally shaped, rigid red cells can break down prematurely and obstruct small-vessel blood flow, causing chronic anemia, recurrent pain and progressive organ injury.

### `etiology` [CANONICAL_NOW]

Sickle cell disease is inherited. Genotype determines the disease form; hemoglobin S may be inherited with another abnormal beta-globin allele. Sickle cell trait must remain a separate genetic state and should not be an alias of disease.

### `pathophysiology` [CANONICAL_NOW]

Hemoglobin polymerization under physiologic stress promotes red-cell sickling. Recurrent hemolysis causes chronic anemia, while vaso-occlusion produces ischemic pain and organ complications. The disease affects multiple organ systems over time.

### `presentation_clinical` [CANONICAL_NOW]

Clinical features may include anemia/fatigue, jaundice, painful swelling in children, recurrent vaso-occlusive pain and organ-specific complications. Severity varies widely with genotype and patient history.

### `key_features` [CANONICAL_NOW]

```text
inherited hemoglobinopathy
hemolytic anemia
vaso-occlusive episodes
multisystem complications
trait != disease
newborn screening is a major diagnostic pathway in the US
```

### `red_flags` [CANONICAL_NOW]

Severe pain crisis, significant anemia symptoms, fever, chest pain/cough/dyspnea concerning for acute chest syndrome, stroke symptoms and prolonged priapism are emergency contexts described by NHLBI.

### `diagnosis_methods` [CANONICAL_NOW]

Diagnosis is established with hemoglobin testing and, when needed, genetic testing. Newborn screening is standard in the United States and abnormal screens require confirmatory testing. Genotype matters for precise disease identity.

### `differential_diagnosis` [CANONICAL_NOW]

```text
sickle cell trait
other hemoglobinopathies
thalassemia
other causes of hemolytic anemia
cause-specific differential for acute chest pain, stroke symptoms or pain crisis
```

### `western_treatment` [CANONICAL_NOW]

Management is hematology-led and can include disease-modifying medicines such as hydroxyurea, vaccination/infection prevention, transfusion, pain management and, for selected patients, curative-intent transplant or gene therapy.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture, if used, is adjunctive only and must account for anemia, infection risk, acute pain crisis, organ complications and active hematologic treatment. Acute sickle complications are not routine acupuncture presentations.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - genotype / subtype model
  - structured complication registry
  - longitudinal preventive screening
  - disease-modifying therapy history
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - id: sym.fatigue
    endpoint: EXISTS
    confidence: medium
  - concept: chest_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: dyspnea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: jaundice
    endpoint: MISSING_ENDPOINT_CANDIDATE

condition_relations:
  - concept: anemia
    relation: manifestation/complication context, not identity synonym
```

## ICD / coding staging

Sickle cell disease coding is genotype- and complication-sensitive. Do not assign a single generic code without genotype and current complication status. Verify current fiscal-year ICD-10-CM.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Appendix A
  supports: Board scope

- source: NHLBI - Sickle Cell Disease
  url: https://www.nhlbi.nih.gov/health/sickle-cell-disease
  tier: A
  supports: definition, mechanism, overview

- source: NHLBI - Sickle Cell Disease Symptoms
  url: https://www.nhlbi.nih.gov/health/sickle-cell-disease/symptoms
  tier: A
  supports: manifestations and emergency contexts

- source: NHLBI - Sickle Cell Disease Diagnosis
  url: https://www.nhlbi.nih.gov/health/sickle-cell-disease/diagnosis
  tier: A
  supports: testing and newborn screening

- source: NHLBI - Sickle Cell Disease Treatment
  url: https://www.nhlbi.nih.gov/health/sickle-cell-disease/treatment
  tier: A
  supports: management
```

## Open questions

```text
1. Is sickle cell trait already modeled elsewhere as a genetic state/condition?
2. How should major complications such as stroke or acute chest syndrome link without duplicating independent canonical conditions?
3. Does the current 150-card library already contain a sickle-cell identity under another slug?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 5
schema_gap_candidates: 4
source_items: 5
canonical_write_authorized: false
```
