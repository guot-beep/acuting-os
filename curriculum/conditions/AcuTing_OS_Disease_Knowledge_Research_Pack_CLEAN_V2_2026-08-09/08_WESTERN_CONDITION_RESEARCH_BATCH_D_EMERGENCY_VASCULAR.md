# Western Condition Research Batch D - Emergency / Vascular

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 8  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Board anchor:** 2026 NCBAHM Biomedicine Appendix A and emergency-management scope.  
**Source policy:** NIH/NHLBI, NINDS, NIAMS, NLM/MedlinePlus, CDC/NCHS ICD-10-CM.  

> Candidate IDs below are staging labels only. A future ingest AI must exact-scan the complete current Condition canonical file, including aliases, before creating, renaming, or merging any `cond.*` identity.

> Repository note: during this continuation pass, the connected GitHub path for `data/pathology/condition_canon_shortlist.json` resolved, but its content was not returned by the connector. Therefore none of the eight identities below are promoted beyond `IDENTITY_CHECK_REQUIRED` or `NEAR_DUPLICATE_NEEDS_DECISION`.

---

# 01. Deep Vein Thrombosis (DVT) · 深部靜脈血栓

## Identity

```yaml
candidate_id: cond.deep_vein_thrombosis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
name: Deep Vein Thrombosis
name_zh: 深部靜脈血栓
aliases:
  - DVT
board_scope: BOARD_EXPLICIT
board_anchor: cardiovascular / vascular disorders
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Deep vein thrombosis is formation of a blood clot in a deep vein, most often in the lower leg, thigh, or pelvis. It is one component of venous thromboembolism (VTE) and is clinically important because part of the clot can detach and travel to the lungs, causing pulmonary embolism.

### `clinical_definition` [CANONICAL_NOW]

DVT should remain distinct from superficial thrombophlebitis, generalized edema, cellulitis, lymphedema, chronic venous insufficiency and pulmonary embolism. DVT and PE belong to the same VTE disease family but are different clinical states with different immediate manifestations and safety implications.

### `etiology` [CANONICAL_NOW]

Important risk contexts include:

```text
recent surgery or major trauma
prolonged immobility or bed rest
long-distance travel with prolonged sitting
active cancer or cancer treatment
prior VTE or inherited/acquired clotting disorders
serious infection or inflammatory states
pregnancy and postpartum states
selected hormone exposure
older age
obesity
selected heart, kidney, neurologic or systemic disease
```

A single risk factor is not required, and many patients have more than one risk factor.

### `pathophysiology` [CANONICAL_NOW]

DVT develops when conditions favor venous clot formation, including slowed venous blood flow, vessel-wall injury and prothrombotic blood states. A deep venous thrombus can obstruct local venous return, causing swelling and pain. Embolization of part of the thrombus to the pulmonary circulation can produce PE.

### `presentation_clinical` [CANONICAL_NOW]

DVT can be asymptomatic. When symptoms occur, common findings include unilateral leg swelling, pain or tenderness, warmth, and sometimes redness or discoloration. Symptoms alone are not sufficiently specific to establish DVT.

### `key_features` [CANONICAL_NOW]

```text
part of the VTE spectrum
often involves a deep vein of the leg, thigh or pelvis
may be clinically silent
unilateral swelling/tenderness raises concern but is not diagnostic
major feared complication is pulmonary embolism
risk assessment and objective testing are required
```

### `red_flags` [CANONICAL_NOW]

Suspected DVT requires prompt biomedical evaluation because progression or embolization can be life-threatening. New shortness of breath, pleuritic or unexplained chest pain, coughing blood, syncope, marked tachycardia, hypoxia, or hemodynamic instability raise concern for PE and require emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]

Evaluation begins with clinical probability assessment, history, examination and risk-factor review. D-dimer can help exclude VTE in appropriately selected low-risk contexts, while venous ultrasound is a major imaging test for suspected lower-extremity DVT. Additional imaging is chosen according to location, probability and clinical context.

### `differential_diagnosis` [CANONICAL_NOW]

```text
cellulitis
superficial thrombophlebitis
muscle or soft-tissue injury
ruptured Baker cyst
chronic venous insufficiency
lymphedema
heart-failure or renal-related edema
other causes of unilateral limb swelling or pain
```

### `western_treatment` [CANONICAL_NOW]

Anticoagulation is the main treatment for most clinically significant DVT and helps prevent clot extension and new emboli. Duration depends on provoking factors, recurrence risk, bleeding risk and patient context. Selected patients may require catheter-based clot treatment or an inferior vena cava filter when anticoagulation cannot be used.

### `acupuncture_role` [CANONICAL_NOW]

Suspected acute DVT is not a routine acupuncture presentation. Do not massage, vigorously manipulate, cup, scrape or otherwise treat a newly swollen painful limb as a local musculoskeletal problem until DVT has been appropriately evaluated. In patients taking anticoagulants, needling and other tissue-trauma techniques also require bleeding-risk review.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - provoked_vs_unprovoked_VTE_status
  - recurrence_history
  - anticoagulation_course
  - clot_location_and_extent

DERIVED_RELATION:
  - VTE_family_relation
  - pulmonary_embolism_complication_relation
  - symptom endpoints
  - anticoagulant medication relations after pharmacology contract is confirmed
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - concept: unilateral_leg_swelling
    endpoint: MISSING_ENDPOINT_CANDIDATE
    note: laterality/localization may need structured symptom qualifiers
  - concept: leg_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - id: sym.edema
    endpoint: RECONCILE_EXISTING_REFERENCE
    warning: generic edema loses the high-value unilateral-localization detail
  - concept: warmth
    endpoint: GRANULARITY_REVIEW

conditions:
  - concept: pulmonary_embolism
    relation: VTE_RELATED_COMPLICATION
    endpoint: THIS_BATCH_STAGING

tdis_candidates:
  - id: tdis.shui_zhong
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
    warning: 水腫 is broad and must never normalize unilateral DVT swelling
```

## ICD / coding staging

DVT coding depends on vein, laterality, acuity/chronicity and recurrence/context. Do not assign one generic exact ICD-10-CM code from the disease name alone. Verify the active fiscal-year CDC/NCHS index and tabular rules at ingestion.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Content Outline
  tier: Board authority
  supports: scope
  url: https://www.ncbahm.org/certification/ncbahm-exam-preparation-center/exam-content-outlines-2/

- source: NHLBI - Venous Thromboembolism
  tier: A
  supports: VTE/DVT/PE identity and overview
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism

- source: NHLBI - Venous Thromboembolism Causes and Risk Factors
  tier: A
  supports: risk factors and mechanism context
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism/causes

- source: NHLBI - Venous Thromboembolism Symptoms
  tier: A
  supports: DVT and PE manifestations
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism/symptoms

- source: NHLBI - Venous Thromboembolism Diagnosis
  tier: A
  supports: D-dimer, imaging and diagnostic approach
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism/diagnosis

- source: NHLBI - Venous Thromboembolism Treatment
  tier: A
  supports: anticoagulation and procedures
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism/treatment

- source: CDC/NCHS ICD-10-CM
  tier: A
  supports: coding verification only
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
```

## Open questions

```text
1. Does CURRENT canonical data already have DVT, VTE, venous thrombosis, or a parent/child model?
2. Should VTE be a parent identity while DVT and PE remain separately queryable clinical cards?
3. How should laterality and anatomical clot location be represented without exploding the Condition namespace?
4. Should anticoagulation status be derived from medications rather than stored on the disease card?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 6
schema_gap_candidates: 4
source_items: 7
canonical_write_authorized: false
```

---

# 02. Pulmonary Embolism (PE) · 肺栓塞

## Identity

```yaml
candidate_id: cond.pulmonary_embolism
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
name: Pulmonary Embolism
name_zh: 肺栓塞
aliases:
  - PE
board_scope: BOARD_RELEVANT_EMERGENCY_EXTENSION
board_anchor: VTE / cardiovascular-pulmonary emergency recognition
board_note: exact Appendix A wording should be rechecked during ingest
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Pulmonary embolism is obstruction of pulmonary arterial blood flow by an embolus, most commonly a blood clot arising from a deep venous thrombosis. PE ranges from small or minimally symptomatic events to rapidly fatal cardiopulmonary collapse.

### `clinical_definition` [CANONICAL_NOW]

PE is part of VTE but is not synonymous with DVT. DVT describes the deep venous clot source; PE describes embolic obstruction in the pulmonary circulation. A patient can have DVT without clinically recognized PE, PE without a documented DVT at presentation, or both.

### `etiology` [CANONICAL_NOW]

Most thromboembolic PE shares DVT/VTE risk factors:

```text
recent surgery or trauma
immobility
prior VTE
cancer
pregnancy/postpartum and selected hormone exposure
inherited/acquired thrombophilia
serious infection/inflammation
older age and selected systemic disease
```

Nonthrombotic pulmonary embolic phenomena exist but should not be silently merged into the routine VTE card.

### `pathophysiology` [CANONICAL_NOW]

An embolus obstructing pulmonary arterial circulation increases pulmonary vascular resistance and produces ventilation-perfusion mismatch. Larger clot burden or poor cardiopulmonary reserve can cause right-ventricular strain, impaired cardiac output, hypoxemia, shock and death.

### `presentation_clinical` [CANONICAL_NOW]

PE may cause sudden shortness of breath, chest pain that can worsen with breathing, tachycardia, low oxygen, cough or hemoptysis, lightheadedness, syncope and anxiety. Presentation is variable, and some cases are subtle.

### `key_features` [CANONICAL_NOW]

```text
potentially life-threatening VTE complication
sudden dyspnea and pleuritic chest pain are classic but not universal
symptoms overlap MI, pneumothorax, pneumonia and other emergencies
objective diagnostic strategy is required
hemodynamic impact changes urgency and treatment
```

### `red_flags` [CANONICAL_NOW]

Suspected PE with severe dyspnea, syncope, hypoxia, hypotension, shock, altered mental status or persistent significant chest pain is an emergency. A patient with possible PE should not be observed through an acupuncture visit to see whether symptoms improve.

### `diagnosis_methods` [CANONICAL_NOW]

Evaluation combines clinical probability, history/exam and appropriate testing. D-dimer can help exclude PE in selected low-risk patients. CT pulmonary angiography is a main diagnostic imaging test. Ventilation-perfusion scanning and other testing may be used when clinically appropriate. ECG, oxygen assessment and cardiac biomarkers can contribute to severity and differential evaluation but are not independently diagnostic of PE.

### `differential_diagnosis` [CANONICAL_NOW]

```text
acute coronary syndrome / myocardial infarction
pneumothorax
pneumonia
asthma or COPD exacerbation
aortic disease
pericarditis
heart failure
musculoskeletal chest pain
panic/anxiety presentations
```

### `western_treatment` [CANONICAL_NOW]

Anticoagulation is central for most thromboembolic PE. Severe or high-risk events may require thrombolysis, catheter-assisted intervention or surgery. Supportive cardiopulmonary management and evaluation of the provoking cause are part of acute care and follow-up.

### `acupuncture_role` [CANONICAL_NOW]

Suspected acute PE is outside routine acupuncture management and requires emergency medical evaluation. In a stable patient with a history of treated PE, medication-related bleeding risk, residual cardiopulmonary symptoms and recurrence warning signs should be reviewed before adjunctive care.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - PE_severity_or_hemodynamic_risk_class
  - provoked_vs_unprovoked_status
  - clot_burden_location
  - recurrence_history
  - anticoagulation_course
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - concept: dyspnea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: chest_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: syncope
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: hemoptysis
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: tachycardia
    endpoint: P1_ENDPOINT_CANDIDATE

conditions:
  - concept: deep_vein_thrombosis
    relation: VTE_SOURCE_OR_ASSOCIATED_CONDITION
    endpoint: THIS_BATCH_STAGING

tdis_candidates:
  - id: tdis.chuan_zheng
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
    warning: acute PE dyspnea must not be converted into a TCM-only diagnosis
  - id: tdis.xiong_bi
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
    warning: chest pain requires biomedical emergency triage
```

## ICD / coding staging

Pulmonary embolism codes vary by acute versus chronic context and associated features. Do not infer an exact code from the phrase "PE" alone. Verify active fiscal-year ICD-10-CM at ingestion.

## Sources / provenance

```yaml
- source: NHLBI - Venous Thromboembolism
  tier: A
  supports: PE definition and relationship to DVT
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism

- source: NHLBI - Venous Thromboembolism Symptoms
  tier: A
  supports: manifestations
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism/symptoms

- source: NHLBI - Venous Thromboembolism Diagnosis
  tier: A
  supports: CTPA, D-dimer and V/Q testing
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism/diagnosis

- source: NHLBI - Venous Thromboembolism Treatment
  tier: A
  supports: anticoagulation, thrombolysis and catheter therapy
  url: https://www.nhlbi.nih.gov/health/venous-thromboembolism/treatment

- source: CDC/NCHS ICD-10-CM
  tier: A
  supports: coding verification only
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
```

## Open questions

```text
1. Is PE already a canonical Condition endpoint or represented only under VTE?
2. Does the Condition architecture want one VTE parent plus DVT and PE child cards?
3. Should PE severity/risk-stratification details live in structured criteria only after other emergency conditions show the same repeated need?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 8
schema_gap_candidates: 5
source_items: 5
canonical_write_authorized: false
```

---

# 03. Acute Myocardial Infarction (MI / Heart Attack) · 急性心肌梗塞

## Identity

```yaml
candidate_id: cond.myocardial_infarction
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
name: Myocardial Infarction
name_zh: 心肌梗塞
aliases:
  - MI
  - heart attack
board_scope: BOARD_EXPLICIT
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Myocardial infarction is acute myocardial injury caused by prolonged ischemia, commonly from sudden blockage of a coronary artery. It is a life-threatening emergency in which delayed restoration of blood flow can increase irreversible heart-muscle damage.

### `clinical_definition` [CANONICAL_NOW]

Myocardial infarction must remain distinct from angina, nonspecific chest pain, cardiac arrest and chronic coronary artery disease. Angina reflects myocardial ischemia without the same defining myocardial necrosis; MI involves myocardial injury/necrosis and is supported by biomarkers and clinical evidence of ischemia.

### `etiology` [CANONICAL_NOW]

The most common pathway is atherosclerotic coronary artery disease with plaque disruption and thrombus formation. Other mechanisms can include coronary spasm, coronary embolism, spontaneous coronary artery dissection and other causes of myocardial infarction without obstructive coronary artery disease.

### `pathophysiology` [CANONICAL_NOW]

Abrupt reduction of coronary blood flow creates an oxygen supply-demand mismatch severe enough to injure and kill myocardial cells. Extent and consequences depend on vessel, duration, collateral flow, myocardial territory and speed of reperfusion.

### `presentation_clinical` [CANONICAL_NOW]

Possible symptoms include chest pressure, squeezing, heaviness or discomfort; pain or discomfort in an arm, shoulder, back, neck or jaw; shortness of breath; sweating; nausea or vomiting; unusual fatigue; lightheadedness; dizziness; and rapid or irregular heartbeat. Some people have mild or atypical symptoms, and some infarctions may be clinically silent.

### `key_features` [CANONICAL_NOW]

```text
medical emergency
ischemic symptoms may be typical, atypical or absent
ECG is an early critical test
serial cardiac troponin testing supports myocardial-injury diagnosis
MI != angina
MI != cardiac arrest
rapid reperfusion can limit myocardial damage
```

### `red_flags` [CANONICAL_NOW]

Any suspected heart attack requires emergency response. New persistent chest pressure/pain, unexplained dyspnea, diaphoresis, syncope or near-syncope, severe weakness, or an ischemic symptom cluster should trigger EMS activation rather than transport by private vehicle or an attempt to "treat first and reassess."

### `diagnosis_methods` [CANONICAL_NOW]

Emergency evaluation includes ECG, serial cardiac troponin testing, history and physical examination. Additional imaging and coronary evaluation are selected according to presentation and ECG/biomarker findings. The card should not hard-code a single troponin cutoff because assays and clinical criteria vary.

### `differential_diagnosis` [CANONICAL_NOW]

```text
unstable/stable angina
pulmonary embolism
aortic dissection or rupturing aneurysm
pneumothorax
pericarditis
GERD/esophageal disease
musculoskeletal chest pain
panic/anxiety presentations
other causes of acute dyspnea or shock
```

### `western_treatment` [CANONICAL_NOW]

Acute treatment aims to restore coronary blood flow and reduce complications. Depending on MI type and resources, care can include antiplatelet and other antithrombotic therapy, nitrates when appropriate, urgent percutaneous coronary intervention, selected thrombolytic therapy when timely PCI is not available, and subsequent secondary-prevention medication plus cardiac rehabilitation.

### `acupuncture_role` [CANONICAL_NOW]

Suspected acute MI is an emergency and should never be managed by acupuncture, herbs, cupping, gua sha or observation. For patients recovering after MI, adjunctive acupuncture requires stable medical status and attention to antiplatelet/anticoagulant use, cardiac symptoms, implanted devices if relevant, exercise tolerance and the treating medical team's restrictions.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - STEMI_NSTEMI_or_other_MI_type
  - culprit_vessel_or_infarct_territory
  - reperfusion_history
  - complication_registry
  - longitudinal_secondary_prevention_monitoring

IDENTITY_MODEL_REVIEW:
  - old_MI_or_history_of_MI should not be treated as the same acute state
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - concept: chest_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: dyspnea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: diaphoresis
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: nausea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: vomiting
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: syncope
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - id: sym.fatigue
    endpoint: EXISTS
    note: possible but nonspecific

tdis_candidates:
  - id: tdis.xiong_bi
    endpoint: REGISTERED_ONLY
    relation: STRONG_CLINICAL_ASSOCIATION
    warning: historical/clinical overlap must never delay ACS emergency care
  - id: tdis.xin_ji
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
```

## ICD / coding staging

Acute MI coding is time-, type- and episode-sensitive, with distinctions among acute MI categories, subsequent MI, complications and old MI/history states. Verify the active FY2026 or later CDC/NCHS tabular rules at ingestion; do not assign one universal I21 subtype from the generic concept.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Content Outline
  tier: Board authority
  supports: scope
  url: https://www.ncbahm.org/certification/ncbahm-exam-preparation-center/exam-content-outlines-2/

- source: NHLBI - Heart Attack
  tier: A
  supports: definition and emergency status
  url: https://www.nhlbi.nih.gov/health/heart-attack

- source: NHLBI - Heart Attack Causes and Risk Factors
  tier: A
  supports: plaque rupture, thrombus and alternative mechanisms
  url: https://www.nhlbi.nih.gov/health/heart-attack/causes

- source: NHLBI - Heart Attack Symptoms
  tier: A
  supports: presentation and EMS instruction
  url: https://www.nhlbi.nih.gov/health/heart-attack/symptoms

- source: NHLBI - Heart Attack Diagnosis
  tier: A
  supports: ECG and troponin testing
  url: https://www.nhlbi.nih.gov/health/heart-attack/diagnosis

- source: NHLBI - Heart Attack Treatment
  tier: A
  supports: emergency treatment and reperfusion
  url: https://www.nhlbi.nih.gov/health/heart-attack/treatment

- source: CDC/NCHS ICD-10-CM
  tier: A
  supports: coding verification
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
```

## Open questions

```text
1. Does CURRENT canonical data contain MI, heart attack, acute coronary syndrome, CAD, or separate STEMI/NSTEMI identities?
2. Should acute MI and history/old MI be separate clinical states rather than aliases?
3. Where should post-MI cardiac rehabilitation and secondary-prevention monitoring live if longitudinal structure is added?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 9
schema_gap_candidates: 5
source_items: 7
canonical_write_authorized: false
```

---

# 04. Angina Pectoris · 心絞痛

## Identity

```yaml
candidate_id: cond.angina_pectoris
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
name: Angina Pectoris
name_zh: 心絞痛
aliases:
  - angina
board_scope: BOARD_EXPLICIT
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Angina is chest pain or discomfort caused by inadequate oxygen-rich blood supply to the heart muscle relative to its needs. It commonly occurs in coronary heart disease but can also occur through microvascular dysfunction or coronary vasospasm.

### `clinical_definition` [CANONICAL_NOW]

Angina is an ischemic symptom syndrome, not the same identity as myocardial infarction. Stable, unstable, microvascular and vasospastic angina have different triggers, risk and treatment implications. Unstable angina is an acute coronary syndrome and requires urgent hospital assessment.

### `etiology` [CANONICAL_NOW]

Major mechanisms include:

```text
atherosclerotic coronary artery disease
coronary microvascular disease
coronary vasospasm
oxygen supply-demand mismatch in selected clinical contexts
```

### `pathophysiology` [CANONICAL_NOW]

Angina occurs when myocardial oxygen demand exceeds the oxygen delivered through coronary blood flow. In stable angina this mismatch often appears predictably with exertion or stress. Unstable symptoms can reflect acute reduction in coronary blood flow and may precede or accompany MI.

### `presentation_clinical` [CANONICAL_NOW]

Chest discomfort can feel like pressure, squeezing, tightness, heaviness or burning, often behind the sternum, and may radiate to the shoulders, arms, neck, back or jaw. Dyspnea, nausea, sweating, weakness, fatigue, lightheadedness or fainting may accompany the discomfort.

### `key_features` [CANONICAL_NOW]

```text
ischemic chest discomfort
angina != MI
stable angina follows a more predictable pattern
unstable angina is an emergency
microvascular and vasospastic angina may not fit classic exertional patterns
symptoms can differ by sex and individual patient
```

### `red_flags` [CANONICAL_NOW]

Chest discomfort that is new, worsening, occurring at rest, prolonged, recurrent, or not relieved as expected must be treated as possible acute coronary syndrome. If the patient or practitioner cannot confidently distinguish angina from MI, emergency evaluation takes priority.

### `diagnosis_methods` [CANONICAL_NOW]

Evaluation includes symptom history, cardiovascular risk assessment, physical examination and ECG. Troponin helps distinguish myocardial injury/MI from unstable angina. Depending on stability and probability, stress testing, coronary CT angiography, echocardiography, cardiac MRI or invasive coronary angiography may be used. Provocation testing may be considered for selected vasospastic or microvascular disease.

### `differential_diagnosis` [CANONICAL_NOW]

```text
myocardial infarction / acute coronary syndrome
pulmonary embolism
aortic disease
pneumothorax
pericarditis
GERD / esophageal pain
chest-wall or musculoskeletal pain
panic/anxiety presentations
```

### `western_treatment` [CANONICAL_NOW]

Treatment depends on angina type and underlying coronary disease. It can include heart-healthy risk reduction, nitrates, beta blockers, calcium-channel blockers, antiplatelet therapy, statins, other antianginal medicines, and revascularization with PCI or CABG when indicated. Unstable angina requires hospital-level emergency management.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture may be considered only as adjunctive care in stable, medically evaluated patients. New or changing chest symptoms should not be interpreted as Qi stagnation, chest Bi, muscle tension or reflux without appropriate biomedical triage.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - stable_unstable_microvascular_vasospastic_subtype
  - symptom_trigger_pattern
  - coronary_anatomy_context
  - longitudinal_response_monitoring
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - concept: chest_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: dyspnea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: nausea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: diaphoresis
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: syncope_or_lightheadedness
    endpoint: GRANULARITY_REVIEW

tdis_candidates:
  - id: tdis.xiong_bi
    endpoint: REGISTERED_ONLY
    relation: STRONG_CLINICAL_ASSOCIATION
    warning: not identity equality and not permission to bypass ACS triage
  - id: tdis.xin_ji
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
```

## ICD / coding staging

Angina coding varies by underlying coronary disease and subtype. Some documentation can require combination coding with atherosclerotic heart disease. Exact code selection must follow active fiscal-year ICD-10-CM tabular instructions.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Content Outline
  tier: Board authority
  supports: scope
  url: https://www.ncbahm.org/certification/ncbahm-exam-preparation-center/exam-content-outlines-2/

- source: NHLBI - Angina
  tier: A
  supports: definition and identity
  url: https://www.nhlbi.nih.gov/health/angina

- source: NHLBI - Angina Types
  tier: A
  supports: stable, unstable, microvascular and vasospastic types
  url: https://www.nhlbi.nih.gov/health/angina/types

- source: NHLBI - Angina Causes and Risk Factors
  tier: A
  supports: coronary disease, microvascular dysfunction and vasospasm
  url: https://www.nhlbi.nih.gov/health/angina/causes

- source: NHLBI - Angina Symptoms
  tier: A
  supports: clinical presentation and emergency warning
  url: https://www.nhlbi.nih.gov/health/angina/symptoms

- source: NHLBI - Angina Diagnosis
  tier: A
  supports: ECG, troponin, stress and coronary testing
  url: https://www.nhlbi.nih.gov/health/angina/diagnosis

- source: NHLBI - Angina Treatment
  tier: A
  supports: medication and revascularization framework
  url: https://www.nhlbi.nih.gov/health/angina/treatment

- source: CDC/NCHS ICD-10-CM
  tier: A
  supports: coding verification
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
```

## Open questions

```text
1. Does CURRENT canonical data model angina as one parent card or separate stable/unstable/variant identities?
2. Is unstable angina represented under an acute coronary syndrome identity?
3. Should the OS display an emergency chest-pain comparison panel across angina, MI, PE, aortic disease and pneumothorax?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 7
schema_gap_candidates: 4
source_items: 8
canonical_write_authorized: false
```

---

# 05. Aneurysm - Aortic-Focused Parent Strategy · 動脈瘤（以主動脈瘤為本批研究核心）

## Identity

```yaml
candidate_id: cond.aneurysm
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
name: Aneurysm
name_zh: 動脈瘤
board_scope: BOARD_EXPLICIT
research_focus: aortic_aneurysm
```

## Identity boundary warning

"Aneurysm" is an anatomical/pathologic parent concept, not one uniform clinical disease. Aortic aneurysm and intracranial/cerebral aneurysm have different risk factors, complications, diagnostic pathways and specialists. This batch uses NHLBI aortic-aneurysm material because the requested batch is vascular/cardiovascular. A future canonical scan must determine whether AcuTing OS should use:

```text
one aneurysm parent + subtype/child cards
aortic aneurysm as a standalone Condition
abdominal and thoracic aortic aneurysm as separate identities
cerebral aneurysm as a separate neurologic identity
```

Do not copy the aortic-specific content below into a generic all-aneurysm card without preserving that boundary.

## Canonical candidate content

### `summary` [CANONICAL_NOW]

An aortic aneurysm is an abnormal balloon-like enlargement of the aorta caused by weakening of the vessel wall. Major forms include abdominal aortic aneurysm (AAA) and thoracic aortic aneurysm (TAA). Aneurysms can enlarge silently and may become life-threatening if they rupture or are complicated by dissection.

### `clinical_definition` [CANONICAL_NOW]

Aneurysm refers to abnormal focal vessel dilation, but the clinically useful definition and threshold depend on vascular territory. In NHLBI guidance, an abdominal aortic aneurysm is diagnosed when the abdominal aorta measures 3 cm or greater; thoracic dimensions are interpreted using location and patient characteristics.

### `etiology` [CANONICAL_NOW]

Aortic aneurysm risk reflects interaction among vessel-wall degeneration, age, smoking, hypertension, atherosclerotic disease, family/genetic conditions, bicuspid aortic valve, connective-tissue syndromes, selected infections/inflammation and trauma.

### `pathophysiology` [CANONICAL_NOW]

Weakening of the aortic wall permits progressive dilation under systemic pressure. As diameter and wall stress increase, risk of rupture or dissection rises. Expansion can also compress nearby structures or affect aortic-valve function.

### `presentation_clinical` [CANONICAL_NOW]

Many aortic aneurysms cause no symptoms. Depending on location, possible symptoms include chest, back, abdominal, neck, jaw or shoulder pain; pulsating abdominal sensation; hoarseness; swallowing difficulty; dyspnea; or symptoms from compression of nearby structures.

### `key_features` [CANONICAL_NOW]

```text
often asymptomatic until large or complicated
AAA and TAA are clinically distinct subtypes
imaging defines location and size
rupture and aortic dissection are major emergencies
serial imaging may be needed for known stable aneurysms
```

### `red_flags` [CANONICAL_NOW]

Sudden severe chest, back or abdominal pain, lightheadedness, rapid heart rate, syncope, shock symptoms or known aneurysm with abrupt new symptoms require emergency evaluation for rupture or dissection.

### `diagnosis_methods` [CANONICAL_NOW]

Imaging is central. Ultrasound is widely used for AAA screening and follow-up. CT, MRI and echocardiography are selected according to location and clinical question. Imaging should document location, diameter, morphology and interval growth when relevant.

### `differential_diagnosis` [CANONICAL_NOW]

```text
aortic dissection
acute coronary syndrome
pulmonary embolism
renal or biliary colic
pancreatitis
musculoskeletal back/chest pain
other causes of abdominal mass or pulsation
intracranial aneurysm belongs to a separate neurologic differential pathway
```

### `western_treatment` [CANONICAL_NOW]

Management depends on location, size, growth rate, cause and patient risk. Smaller stable aortic aneurysms may be monitored with imaging and cardiovascular risk-factor management. Larger, rapidly enlarging, symptomatic or complicated aneurysms may require open surgical or endovascular repair. Rupture or dissection can require emergency surgery.

### `acupuncture_role` [CANONICAL_NOW]

Acupuncture does not treat or reduce an aneurysm. Known aneurysm status, blood-pressure control, exercise restrictions and antithrombotic use may affect safe adjunctive care. New severe chest, back or abdominal pain in a patient with an aneurysm requires emergency evaluation, not local needling or manual therapy.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - vascular_territory
  - maximum_diameter_and_serial_growth
  - genetic_or_syndromic_context
  - repair_type_and_graft_status
  - surveillance_interval

IDENTITY_MODEL_REVIEW:
  - aneurysm_parent
  - abdominal_aortic_aneurysm
  - thoracic_aortic_aneurysm
  - cerebral_aneurysm
  - aortic_dissection
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - concept: chest_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: back_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: abdominal_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: syncope
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: pulsatile_abdominal_mass
    endpoint: SIGN_OR_OBSERVATION_REVIEW

tdis_candidates:
  - id: tdis.xiong_bi
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
  - id: tdis.fu_tong
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
    warning: neither TDIS identity should obscure vascular emergency assessment
```

## ICD / coding staging

Aneurysm coding is highly dependent on vascular site, rupture status and, for aortic aneurysm, anatomical segment. Generic `aneurysm` is insufficient for exact coding. Use the active CDC/NCHS ICD-10-CM tabular list at ingestion.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Content Outline
  tier: Board authority
  supports: scope
  url: https://www.ncbahm.org/certification/ncbahm-exam-preparation-center/exam-content-outlines-2/

- source: NHLBI - Aortic Aneurysm
  tier: A
  supports: definition and subtype distinction
  url: https://www.nhlbi.nih.gov/health/aortic-aneurysm

- source: NHLBI - Aortic Aneurysm Causes and Risk Factors
  tier: A
  supports: risk context
  url: https://www.nhlbi.nih.gov/health/aortic-aneurysm/causes

- source: NHLBI - Aortic Aneurysm Symptoms
  tier: A
  supports: presentation and rupture warning signs
  url: https://www.nhlbi.nih.gov/health/aortic-aneurysm/symptoms

- source: NHLBI - Aortic Aneurysm Diagnosis
  tier: A
  supports: imaging and AAA definition
  url: https://www.nhlbi.nih.gov/health/aortic-aneurysm/diagnosis

- source: NHLBI - Aortic Aneurysm Treatment
  tier: A
  supports: monitoring, medical management and repair
  url: https://www.nhlbi.nih.gov/health/aortic-aneurysm/treatment

- source: CDC/NCHS ICD-10-CM
  tier: A
  supports: coding verification
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
```

## Open questions

```text
1. Is `aneurysm` already represented by one or more anatomical subtype cards in the current 150-card library?
2. Should a generic aneurysm parent be navigational only while clinical facts live on subtype cards?
3. Is aortic dissection already canonical and, if so, should it be linked as a complication/differential rather than nested under aneurysm?
4. Should serial diameter and growth live in a structured longitudinal layer instead of canonical static disease truth?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 7
schema_gap_candidates: 5
identity_model_candidates: 5
source_items: 7
canonical_write_authorized: false
```

---

# 06. Transient Ischemic Attack (TIA) · 暫時性腦缺血發作

## Identity

```yaml
candidate_id: cond.transient_ischemic_attack
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
name: Transient Ischemic Attack
name_zh: 暫時性腦缺血發作
aliases:
  - TIA
board_scope: BOARD_EXPLICIT
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

A transient ischemic attack is a brief episode of focal neurologic dysfunction caused by temporary interruption of blood flow to the brain or retina without the persistent clinical deficit of an established stroke. TIA is a medical warning event because an underlying vascular source can soon cause a completed ischemic stroke.

### `clinical_definition` [CANONICAL_NOW]

TIA is not simply "dizziness that goes away," a fainting spell or a vague transient symptom. It typically begins suddenly with focal stroke-like deficits such as unilateral weakness/numbness, speech/language disturbance or acute visual loss. Modern clinical reasoning emphasizes evidence of transient ischemia and urgent cause evaluation rather than relying only on a rigid symptom-duration cutoff.

### `etiology` [CANONICAL_NOW]

Potential ischemic sources include:

```text
large-artery atherosclerotic disease
carotid or vertebrobasilar disease
cardioembolism such as atrial fibrillation
small-vessel disease
other embolic or vascular causes
```

Risk-factor evaluation overlaps ischemic stroke prevention.

### `pathophysiology` [CANONICAL_NOW]

Transient obstruction or severe reduction of cerebral or retinal blood flow produces focal neurologic dysfunction. Symptoms can resolve when perfusion is restored or the obstruction dissipates, but the causative vascular disease may remain and can lead to later infarction.

### `presentation_clinical` [CANONICAL_NOW]

Possible sudden symptoms include unilateral face/arm/leg weakness or numbness, speech or language difficulty, acute monocular or binocular visual disturbance, imbalance, coordination problems or other focal neurologic deficits. Symptoms may resolve before medical assessment, which does not make the event safe to ignore.

### `key_features` [CANONICAL_NOW]

```text
sudden focal neurologic dysfunction
symptoms may fully resolve
a resolved deficit is still urgent
TIA is a major stroke-warning event
cause evaluation is essential
TIA != generalized dizziness, syncope or anxiety by default
```

### `red_flags` [CANONICAL_NOW]

Any new stroke-like symptoms require emergency action even if they improve within minutes. Do not wait for symptoms to recur, and do not proceed with acupuncture because the neurologic examination appears normal after resolution.

### `diagnosis_methods` [CANONICAL_NOW]

Urgent evaluation may include brain imaging, vascular imaging, ECG/cardiac evaluation, laboratory testing and assessment for the underlying embolic or vascular cause. Diagnostic work should distinguish TIA from completed ischemic stroke and from mimics such as seizure, migraine aura, hypoglycemia and vestibular disorders.

### `differential_diagnosis` [CANONICAL_NOW]

```text
ischemic stroke
migraine with aura
focal seizure / postictal deficit
hypoglycemia
peripheral vestibular disease
syncope/presyncope
functional neurologic presentation
other metabolic or toxic causes
```

### `western_treatment` [CANONICAL_NOW]

Management focuses on rapid stroke prevention and treatment of the cause. Depending on etiology and patient context, this can include antiplatelet therapy, anticoagulation for selected cardioembolic causes, statin therapy, blood-pressure and diabetes management, smoking cessation and carotid or other vascular procedures when indicated.

### `acupuncture_role` [CANONICAL_NOW]

A suspected or recent unevaluated TIA requires emergency/urgent stroke-system assessment, not acupuncture. After medical stabilization, adjunctive care can address residual symptoms or risk-factor-related quality-of-life concerns only within the patient's medical plan.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - vascular_territory
  - presumed_etiology
  - neuroimaging_result_summary
  - recurrence_or_ABCD_style_risk_context
  - secondary_prevention_plan

IDENTITY_MODEL_REVIEW:
  - retinal_TIA_or_amaurosis_fugax
  - TIA_vs_minor_ischemic_stroke_boundary
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms_or_neurologic_deficits:
  - concept: unilateral_weakness
    endpoint: NAMESPACE_GRANULARITY_REVIEW
  - concept: unilateral_numbness
    endpoint: P1_ENDPOINT_CANDIDATE
  - concept: aphasia_or_speech_difficulty
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: acute_visual_loss
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: imbalance
    endpoint: P1_ENDPOINT_CANDIDATE
  - concept: dizziness
    endpoint: MISSING_ENDPOINT_CANDIDATE
    warning: nonspecific; do not make it the defining TIA relation

conditions:
  - id: cond.stroke
    endpoint: EXISTS
    relation: HIGH_VALUE_WARNING_OR_RELATED_VASCULAR_CONDITION

tdis_candidates:
  - id: tdis.zhong_feng
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
    warning: TIA is not automatically equivalent to 中風
  - id: tdis.ma_mu
    endpoint: REGISTERED_ONLY
    relation: POSSIBLE_CONTEXTUAL_ASSOCIATION
    warning: focal numbness with sudden onset still needs stroke triage
```

## ICD / coding staging

TIA coding belongs to transient cerebral ischemic attack/syndrome families and depends on the documented syndrome. Do not code a completed stroke when no infarction is established, and do not infer a precise TIA subtype without documentation. Verify the active ICD-10-CM year.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Content Outline
  tier: Board authority
  supports: scope
  url: https://www.ncbahm.org/certification/ncbahm-exam-preparation-center/exam-content-outlines-2/

- source: NINDS - Stroke Overview
  tier: A
  supports: TIA overview and warning significance
  url: https://www.ninds.nih.gov/health-information/stroke/stroke-overview

- source: NINDS - Signs and Symptoms of Stroke
  tier: A
  supports: emergency symptom recognition and TIA warning
  url: https://www.ninds.nih.gov/health-information/stroke/signs-and-symptoms

- source: NINDS - Assess and Treat
  tier: A
  supports: stroke/TIA emergency treatment framework
  url: https://www.ninds.nih.gov/health-information/stroke/assess-and-treat

- source: NHLBI - Stroke Diagnosis
  tier: A
  supports: imaging and cause evaluation
  url: https://www.nhlbi.nih.gov/health/stroke/diagnosis

- source: NHLBI - Stroke Treatment
  tier: A
  supports: prevention/treatment context after TIA
  url: https://www.nhlbi.nih.gov/health/stroke/treatment

- source: CDC/NCHS ICD-10-CM
  tier: A
  supports: coding verification
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
```

## Open questions

```text
1. Does CURRENT canonical data already contain TIA or a transient cerebral ischemia identity?
2. Should amaurosis fugax be modeled as a TIA subtype, symptom/sign endpoint, or separate condition?
3. Which focal neurologic deficits belong in `sym.*` versus a dedicated sign/neurologic-deficit layer?
4. Should stroke/TIA share one reusable emergency recognition object?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 9
schema_gap_candidates: 5
identity_model_candidates: 2
source_items: 7
canonical_write_authorized: false
```

---

# 07. Giant Cell Arteritis (Temporal Arteritis) · 巨細胞動脈炎／顳動脈炎

## Identity

```yaml
candidate_id: cond.giant_cell_arteritis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
name: Giant Cell Arteritis
name_zh: 巨細胞動脈炎／顳動脈炎
aliases:
  - temporal arteritis
  - GCA
board_scope: BOARD_PARENT_EXAMPLE
board_anchor: autoimmune / vasculitis, temporal arteritis example
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Giant cell arteritis is an inflammatory vasculitis of medium and large arteries, often involving cranial branches such as the temporal arteries and sometimes the aorta or its major branches. It occurs almost exclusively in adults over age 50 and can cause permanent visual loss if not treated promptly.

### `clinical_definition` [CANONICAL_NOW]

Temporal arteritis is a common historical/clinical name for giant cell arteritis, but GCA can extend beyond the temporal arteries. The card should therefore use GCA as the broader canonical biomedical identity while preserving "temporal arteritis" as an alias unless the current repo has a different convention.

### `etiology` [CANONICAL_NOW]

The exact cause is not fully established. GCA is immune-mediated and is associated with age and inflammatory/autoimmune susceptibility. It frequently overlaps polymyalgia rheumatica.

### `pathophysiology` [CANONICAL_NOW]

Inflammation of affected arterial walls causes wall thickening, luminal narrowing and impaired blood flow. Ischemia of ocular, cranial or other vascular territories can produce vision loss, jaw claudication, stroke/TIA or large-vessel complications.

### `presentation_clinical` [CANONICAL_NOW]

Important features include new headache, temporal/scalp tenderness, jaw claudication, fatigue, fever, loss of appetite and visual symptoms such as diplopia or vision loss. Polymyalgia rheumatica symptoms can coexist. Large-vessel disease can produce limb claudication or aortic complications.

### `key_features` [CANONICAL_NOW]

```text
usually age >50
new headache in the appropriate age group is a major clue
jaw claudication and visual symptoms are high-value features
ESR/CRP support inflammation but are not specific
temporal-artery biopsy and vascular imaging can support diagnosis
treatment urgency is driven by ischemic/vision risk
```

### `red_flags` [CANONICAL_NOW]

New visual loss, transient monocular vision loss, diplopia or other ischemic symptoms in suspected GCA require urgent medical evaluation. Treatment may need to begin before all confirmatory testing is complete because delay can lead to irreversible blindness.

### `diagnosis_methods` [CANONICAL_NOW]

Diagnosis uses clinical history and examination plus inflammatory markers such as ESR and CRP. Temporal-artery biopsy is a classic confirmatory test. Ultrasound and other vascular imaging, including CT, MRI or PET in selected cases, can identify cranial or large-vessel inflammation.

### `differential_diagnosis` [CANONICAL_NOW]

```text
migraine or other primary headache
tension-type headache
temporomandibular or dental pain
other vasculitides
polymyalgia rheumatica without GCA
carotid or other vascular disease
ophthalmic causes of acute visual loss
infection or malignancy causing constitutional symptoms
```

### `western_treatment` [CANONICAL_NOW]

Prompt glucocorticoid therapy is the main initial treatment to reduce ischemic complications. Additional immunomodulatory therapy may be used in selected patients. Longitudinal care includes monitoring disease activity, treatment adverse effects and large-vessel complications.

### `acupuncture_role` [CANONICAL_NOW]

Suspected GCA is a referral/emergency-recognition condition, especially when new headache, jaw claudication or visual change occurs in a patient over 50. Acupuncture for "headache" should never delay evaluation when this phenotype is present.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - cranial_vs_large_vessel_phenotype
  - vision_ischemia_history
  - biopsy_or_imaging_result
  - immunosuppressive_course
  - large_vessel_surveillance

DERIVED_RELATION:
  - polymyalgia_rheumatica_association
  - visual-loss emergency relation
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - id: sym.headache
    endpoint: EXISTS
  - id: sym.fatigue
    endpoint: EXISTS
  - id: sym.fever
    endpoint: RECONCILE_EXISTING_REFERENCE
  - concept: scalp_tenderness
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: jaw_claudication
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: visual_loss
    endpoint: MISSING_ENDPOINT_CANDIDATE

conditions:
  - concept: polymyalgia_rheumatica
    relation: COMMON_ASSOCIATED_CONDITION
    endpoint: UNKNOWN_NEEDS_CANONICAL_SCAN

tdis_candidates:
  - id: tdis.tou_tong
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
    warning: new headache over age 50 with GCA features requires biomedical evaluation
  - id: tdis.mu_yun
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
    warning: acute visual symptoms must not be normalized as a chronic TCM eye presentation
```

## ICD / coding staging

GCA/temporal arteritis belongs to vasculitis/arteritis coding families. Exact coding can vary with documented vessel involvement or related conditions. Verify the active fiscal-year ICD-10-CM before ingestion.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Content Outline
  tier: Board authority
  supports: autoimmune scope / temporal arteritis example
  url: https://www.ncbahm.org/certification/ncbahm-exam-preparation-center/exam-content-outlines-2/

- source: NIAMS - Polymyalgia Rheumatica and Giant Cell Arteritis
  tier: A
  supports: identity, association and overview
  url: https://www.niams.nih.gov/health-topics/polymyalgia-rheumatica-giant-cell-arteritis

- source: NIAMS - Diagnosis, Treatment, and Steps to Take
  tier: A
  supports: ESR/CRP, biopsy, imaging and treatment framework
  url: https://www.niams.nih.gov/health-topics/polymyalgia-rheumatica-giant-cell-arteritis/diagnosis-treatment-and-steps-to-take

- source: MedlinePlus - Giant Cell Arteritis
  tier: A / NLM
  supports: age, symptoms and vision-risk overview
  url: https://medlineplus.gov/giantcellarteritis.html

- source: CDC/NCHS ICD-10-CM
  tier: A
  supports: coding verification
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
```

## Open questions

```text
1. Does the current Condition library use `giant-cell-arteritis`, `temporal-arteritis`, or a broader vasculitis parent?
2. Is polymyalgia rheumatica already canonical and ready for a condition-condition relation?
3. Should sudden visual loss be promoted as a P0 symptom/sign endpoint because it is reused across GCA, retinal vascular disease and neurologic emergencies?
4. Should age-sensitive red flags be represented structurally or remain prose?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 9
schema_gap_candidates: 5
source_items: 5
canonical_write_authorized: false
```

---

# 08. Pneumothorax · 氣胸

## Identity

```yaml
candidate_id: cond.pneumothorax
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
name: Pneumothorax
name_zh: 氣胸
board_scope: BOARD_EXPLICIT
```

## Canonical candidate content

### `summary` [CANONICAL_NOW]

Pneumothorax is abnormal accumulation of air in the pleural space, which can cause partial or complete collapse of the affected lung. Severity ranges from a small stable pneumothorax to tension pneumothorax with life-threatening respiratory and circulatory compromise.

### `clinical_definition` [CANONICAL_NOW]

Pneumothorax should remain distinct from atelectasis, pleural effusion, hemothorax and simple pleuritic pain. It can occur spontaneously, because of underlying lung disease, after trauma, or as a complication of medical procedures.

### `etiology` [CANONICAL_NOW]

Important contexts include:

```text
primary spontaneous pneumothorax
secondary spontaneous pneumothorax with underlying lung disease
chest trauma
iatrogenic or procedure-related pneumothorax
positive-pressure ventilation
selected pressure-change exposures in susceptible people
```

### `pathophysiology` [CANONICAL_NOW]

Air entering the pleural space separates the visceral and parietal pleura and reduces the negative pressure that normally keeps the lung expanded. The affected lung can partially or fully collapse. In tension pneumothorax, intrathoracic pressure rises enough to impair venous return and circulation, producing obstructive shock.

### `presentation_clinical` [CANONICAL_NOW]

Typical symptoms include sudden sharp or pleuritic chest pain and shortness of breath. Larger events may cause tachycardia, hypoxia/cyanosis, increased work of breathing, lightheadedness, near-syncope, hypotension or collapse. Examination can show reduced breath sounds on the affected side.

### `key_features` [CANONICAL_NOW]

```text
air in the pleural space
sudden unilateral pleuritic chest pain and dyspnea are classic
chest imaging usually confirms a stable suspected pneumothorax
tension pneumothorax is a clinical emergency and must not wait for routine outpatient workup
pneumothorax != atelectasis
```

### `red_flags` [CANONICAL_NOW]

Severe chest pain, marked dyspnea, cyanosis, hypotension, syncope, rapidly worsening respiratory distress or shock can indicate tension pneumothorax and require emergency treatment. Recent chest needling, trauma or procedure history should raise the index of suspicion.

### `diagnosis_methods` [CANONICAL_NOW]

History and examination are combined with oxygen assessment and chest imaging in stable patients. Chest X-ray and ultrasound can identify pleural air; CT may be used when diagnosis is uncertain or associated injury/disease must be defined. Tension pneumothorax is a time-critical clinical diagnosis when the patient is unstable.

### `differential_diagnosis` [CANONICAL_NOW]

```text
pulmonary embolism
acute coronary syndrome / MI
pneumonia
pleurisy
asthma/COPD exacerbation
aortic disease
musculoskeletal chest pain
pericarditis
hemothorax
```

### `western_treatment` [CANONICAL_NOW]

Treatment depends on size, symptoms, cause and physiologic stability. Small stable pneumothoraces may be observed with oxygen and follow-up in selected circumstances. Larger or symptomatic cases may require needle or catheter drainage and chest-tube placement. Tension pneumothorax requires immediate decompression and emergency management.

### `acupuncture_role` [CANONICAL_NOW]

Pneumothorax is directly relevant to acupuncture safety because thoracic needling can injure the pleura if technique, depth or anatomy are inappropriate. New chest pain or dyspnea after needling near the thorax, upper back, supraclavicular region or chest wall requires prompt medical assessment for pneumothorax rather than routine post-treatment reassurance.

## Big-card research staging

```yaml
TRUE_SCHEMA_GAP_CANDIDATES:
  - primary_vs_secondary_vs_traumatic_vs_iatrogenic
  - laterality_and_size
  - tension_status
  - recurrence_history
  - procedure_related_adverse_event_link

SAFETY_MODEL_CANDIDATE:
  - reusable_acupuncture_adverse_event_rule
```

## Proposed relations [DERIVED_RELATION]

```yaml
symptoms:
  - concept: chest_pain
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: dyspnea
    endpoint: MISSING_ENDPOINT_CANDIDATE
  - concept: tachycardia
    endpoint: P1_ENDPOINT_CANDIDATE
  - concept: cyanosis
    endpoint: SIGN_OR_OBSERVATION_REVIEW
  - concept: syncope
    endpoint: MISSING_ENDPOINT_CANDIDATE

tdis_candidates:
  - id: tdis.chuan_zheng
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
    warning: acute dyspnea after thoracic needling needs biomedical evaluation
  - id: tdis.xiong_bi
    endpoint: REGISTERED_ONLY
    relation: DIFFERENTIAL_CONTEXT
```

## ICD / coding staging

Pneumothorax coding depends on spontaneous, secondary, traumatic, iatrogenic and other context. Traumatic pneumothorax may belong to injury coding with encounter-specific rules. Do not assign a universal code without mechanism/context and active-year verification.

## Sources / provenance

```yaml
- source: NCBAHM 2026 Biomedicine Content Outline
  tier: Board authority
  supports: pulmonary scope
  url: https://www.ncbahm.org/certification/ncbahm-exam-preparation-center/exam-content-outlines-2/

- source: NHLBI - Pleural Disorders
  tier: A
  supports: pneumothorax as a pleural disorder
  url: https://www.nhlbi.nih.gov/health/pleural-disorders

- source: NHLBI - Pleural Disorders Types
  tier: A
  supports: pneumothorax identity
  url: https://www.nhlbi.nih.gov/health/pleural-disorders/types

- source: NHLBI - Pleural Disorders Symptoms
  tier: A
  supports: chest pain, dyspnea and hypoxia context
  url: https://www.nhlbi.nih.gov/health/pleural-disorders/symptoms

- source: NHLBI - Pleural Disorders Diagnosis
  tier: A
  supports: examination and imaging
  url: https://www.nhlbi.nih.gov/health/pleural-disorders/diagnosis

- source: NHLBI - Pleural Disorders Treatment
  tier: A
  supports: oxygen, drainage and tension-pneumothorax emergency status
  url: https://www.nhlbi.nih.gov/health/pleural-disorders/treatment

- source: MedlinePlus - Collapsed Lung / Pneumothorax
  tier: A / NLM
  supports: presentation, causes and treatment overview
  url: https://medlineplus.gov/ency/article/000087.htm

- source: CDC/NCHS ICD-10-CM
  tier: A
  supports: coding verification
  url: https://www.cdc.gov/nchs/icd/icd-10-cm/
```

## Open questions

```text
1. Does CURRENT canonical data already contain pneumothorax or a pleural-disorder parent?
2. Should iatrogenic acupuncture-related pneumothorax be represented as an adverse-event relation rather than a disease subtype?
3. Which acupoint safety module should surface this card automatically for thoracic and supraclavicular points?
4. Should tension pneumothorax be a complication state rather than a separate canonical Condition?
```

## Content accounting

```yaml
canonical_sections_researched: 10
relation_candidates_staged: 7
schema_gap_candidates: 5
source_items: 8
canonical_write_authorized: false
```

---

# 9. Batch-wide emergency differential graph

This batch creates a reusable emergency-recognition cluster without asserting identity equivalence.

```yaml
acute_chest_pain_cluster:
  conditions:
    - myocardial_infarction
    - angina_pectoris
    - pulmonary_embolism
    - aortic_aneurysm_or_dissection_context
    - pneumothorax
  shared_endpoint_candidates:
    - chest_pain
    - dyspnea
    - syncope
    - diaphoresis
    - tachycardia
  tdis_context:
    - tdis.xiong_bi
  rule:
    - TCM_disease_label_does_not_suppress_biomedical_triage

vascular_neurologic_cluster:
  conditions:
    - transient_ischemic_attack
    - cond.stroke
    - giant_cell_arteritis
  shared_endpoint_candidates:
    - acute_visual_loss
    - unilateral_weakness_or_numbness
    - speech_difficulty
    - headache
    - dizziness_or_imbalance
  rule:
    - transient_or_resolved_symptoms_can_still_be_emergency_warning_events

venous_thromboembolism_cluster:
  conditions:
    - deep_vein_thrombosis
    - pulmonary_embolism
  shared_endpoint_candidates:
    - unilateral_leg_swelling
    - dyspnea
    - chest_pain
    - syncope
  rule:
    - DVT_and_PE_are_related_but_not_the_same_condition_identity
```

---

# 10. Symptom / sign endpoint actions generated by Batch D

## P0 candidates

```text
chest_pain
dyspnea
syncope
dizziness
unilateral_leg_swelling
acute_visual_loss
aphasia_or_speech_difficulty
jaw_claudication
```

## P1 / granularity-review candidates

```text
leg_pain
hemoptysis
tachycardia
diaphoresis
scalp_tenderness
unilateral_weakness
unilateral_numbness
back_pain
pulsatile_abdominal_mass
cyanosis
```

## Existing or previously referenced endpoints reused

```text
sym.headache
sym.fatigue
sym.fever          RECONCILE_EXISTING_REFERENCE
sym.edema          RECONCILE_EXISTING_REFERENCE
```

No symptom ID is authorized by this batch.

---

# 11. Schema-gap observations added by Batch D

Batch D strengthens several previously observed schema-gap candidates:

```yaml
structured_subtypes_or_phenotypes:
  recurrence: HIGH
  examples:
    - VTE DVT/PE family
    - angina types
    - MI types
    - aortic aneurysm territories
    - pneumothorax types
  status: TRUE_SCHEMA_GAP_CANDIDATE

structured_complication_or_emergency_state:
  recurrence: HIGH
  examples:
    - PE from DVT
    - MI complications
    - aneurysm rupture/dissection
    - tension pneumothorax
    - GCA visual ischemia
  status: TRUE_SCHEMA_GAP_CANDIDATE

longitudinal_monitoring:
  recurrence: HIGH
  examples:
    - anticoagulation course
    - post-MI secondary prevention
    - aneurysm surveillance
    - GCA therapy monitoring
    - recurrent pneumothorax
  status: TRUE_SCHEMA_GAP_CANDIDATE

shared_red_flag_objects:
  recurrence: VERY_HIGH
  value:
    - avoids duplicate emergency prose
    - supports triage UI
    - can connect Condition, TDIS and Symptom layers
  status: RELATION_OR_SAFETY_MODEL_CANDIDATE
```

This batch does **not** authorize root-schema changes.

---

# 12. Identity decisions still required before ingestion

```yaml
deep_vein_thrombosis:
  required_scan:
    - DVT
    - deep vein thrombosis
    - venous thrombosis
    - venous thromboembolism

pulmonary_embolism:
  required_scan:
    - PE
    - pulmonary embolism
    - venous thromboembolism

myocardial_infarction:
  required_scan:
    - myocardial infarction
    - MI
    - heart attack
    - acute coronary syndrome
    - STEMI
    - NSTEMI

angina:
  required_scan:
    - angina
    - angina pectoris
    - stable angina
    - unstable angina
    - vasospastic angina
    - microvascular angina

aneurysm:
  required_scan:
    - aneurysm
    - aortic aneurysm
    - abdominal aortic aneurysm
    - thoracic aortic aneurysm
    - cerebral aneurysm
    - aortic dissection

TIA:
  required_scan:
    - TIA
    - transient ischemic attack
    - transient cerebral ischemia
    - amaurosis fugax

giant_cell_arteritis:
  required_scan:
    - giant cell arteritis
    - temporal arteritis
    - GCA
    - vasculitis

pneumothorax:
  required_scan:
    - pneumothorax
    - collapsed lung
    - spontaneous pneumothorax
    - tension pneumothorax
```

---

# 13. Batch content accounting

```yaml
western_full_research_entries: 8
canonical_sections_per_entry: 10
identity_promotions_authorized: 0
new_symptom_ids_authorized: 0
new_edge_types_authorized: 0
high_value_emergency_clusters: 3
source_policy:
  official_board: true
  NIH_NHLBI_NINDS_NIAMS: true
  NLM_MedlinePlus: true
  CDC_NCHS_ICD10CM: true
canonical_repo_modified: false
schema_modified: false
```

---

# 14. Recommended continuation after Batch D

The next Western research batch should prioritize high-value concepts already listed in the handoff but not yet fully authored:

```text
09_WESTERN_CONDITION_RESEARCH_BATCH_E_METABOLIC_HEMATOLOGY.md

Cushing syndrome
Type 1 diabetes
Polycythemia
Neutropenia
Hemochromatosis
Raynaud phenomenon
Valvular disease
```

Alternative if emergency safety is prioritized over system balance:

```text
09_WESTERN_CONDITION_RESEARCH_BATCH_E_RESPIRATORY_RENAL.md

Asthma
Chronic kidney disease
Sleep apnea
Pneumonia
Acute bronchitis
Pyelonephritis
Kidney stone / nephrolithiasis
```

Do not begin TDIS bulk ingestion until the TDIS canonical-library path mismatch is resolved.
