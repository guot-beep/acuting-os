# Western Condition Research Batch E - Metabolic / Hematology / Cardiac

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 7  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Cushing Syndrome · 庫欣症候群

## Identity
```yaml
candidate_id: cond.cushing_syndrome
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Cushing syndrome is the clinical state caused by prolonged exposure to excessive cortisol, whether endogenous or due to glucocorticoid treatment.

### `clinical_definition` [CANONICAL_NOW]
The syndrome is broader than Cushing disease, which specifically refers to an ACTH-secreting pituitary cause. Exogenous glucocorticoid exposure must remain a separate causal pathway.

### `etiology` [CANONICAL_NOW]
Causes include long-term/high-dose glucocorticoid therapy and endogenous cortisol excess from pituitary, adrenal, or ectopic ACTH-producing disease.

### `pathophysiology` [CANONICAL_NOW]
Chronic cortisol excess alters glucose and protein metabolism, fat distribution, bone, skin, immune function, blood pressure, mood, and reproductive physiology.

### `presentation_clinical` [CANONICAL_NOW]
Possible features include central weight gain, rounded face, dorsocervical fat, thin skin/easy bruising, purple striae, proximal muscle weakness, hypertension, glucose intolerance, mood changes, menstrual changes, and osteoporosis.

### `key_features` [CANONICAL_NOW]
- cortisol excess syndrome
- Cushing disease is a subtype, not a synonym
- medication history is essential
- multisystem metabolic/bone/infection effects

### `red_flags` [CANONICAL_NOW]
Severe infection, marked hyperglycemia, thromboembolic symptoms, psychiatric decompensation, or adrenal insufficiency after abrupt glucocorticoid withdrawal require urgent biomedical evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Evaluation uses medication history plus biochemical testing for cortisol excess, then ACTH and imaging/cause-directed testing after biochemical confirmation.

### `differential_diagnosis` [CANONICAL_NOW]
- simple obesity
- metabolic syndrome
- PCOS
- major depression/alcohol-related pseudo-Cushing states
- exogenous glucocorticoid effect

### `western_treatment` [CANONICAL_NOW]
Treat the cause: taper exogenous steroids only under medical direction; endogenous disease may require pituitary/adrenal surgery, radiation, or cortisol-directed medicines.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive symptom care only. Do not advise abrupt steroid discontinuation; consider fragile skin, bruising, osteoporosis, diabetes, hypertension, infection and thrombosis risk.

## Proposed relations [DERIVED_RELATION]
- sym.bruising candidate
- cond.osteoporosis context
- cond.type-2-diabetes/metabolic context
- medication relation: glucocorticoids STAGING_ONLY

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Cushing's Syndrome — https://www.niddk.nih.gov/health-information/endocrine-diseases/cushings-syndrome
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Does current canonical data separate Cushing syndrome and Cushing disease?
2. Should chronic exogenous steroid exposure be represented as cause/medication relation rather than a separate card?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 02. Type 1 Diabetes · 第一型糖尿病

## Identity
```yaml
candidate_id: cond.type_1_diabetes
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Type 1 diabetes is an autoimmune disease in which immune destruction of pancreatic beta cells causes severe insulin deficiency and lifelong dependence on exogenous insulin.

### `clinical_definition` [CANONICAL_NOW]
Type 1 diabetes is distinct from type 2 diabetes, LADA classification questions, and transient hyperglycemia. Diabetic ketoacidosis can be the first presentation.

### `etiology` [CANONICAL_NOW]
Autoimmune susceptibility plus environmental triggers contribute; the immune system destroys insulin-producing beta cells.

### `pathophysiology` [CANONICAL_NOW]
Insulin deficiency prevents normal glucose uptake and promotes hepatic glucose output, lipolysis and ketone production; severe deficiency can cause DKA.

### `presentation_clinical` [CANONICAL_NOW]
Polyuria, polydipsia, hunger, fatigue, weight loss and blurred vision can develop; DKA may cause nausea, vomiting, abdominal pain, dehydration, rapid/deep breathing and altered mental status.

### `key_features` [CANONICAL_NOW]
- autoimmune beta-cell destruction
- requires insulin
- DKA is a major emergency complication
- glucose monitoring and hypoglycemia safety are central

### `red_flags` [CANONICAL_NOW]
DKA symptoms, severe hypoglycemia, altered mental status, seizures, dehydration or inability to take insulin/fluids safely require urgent or emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
Diagnosis uses glucose/A1C criteria for diabetes plus autoantibodies and other tests when diabetes type is uncertain. Ketones and acid-base testing assess suspected DKA.

### `differential_diagnosis` [CANONICAL_NOW]
- type 2 diabetes
- monogenic diabetes
- secondary diabetes
- stress hyperglycemia
- diabetes insipidus for polyuria/polydipsia

### `western_treatment` [CANONICAL_NOW]
Lifelong insulin, glucose monitoring/CGM as appropriate, nutrition/activity education, hypoglycemia prevention, sick-day planning, and complication screening.

### `acupuncture_role` [CANONICAL_NOW]
Acupuncture cannot replace insulin. Confirm food/insulin timing and hypoglycemia risk; defer treatment in DKA or severe glucose instability.

## Proposed relations [DERIVED_RELATION]
- sym.fatigue EXISTS
- polyuria/polydipsia endpoints candidate
- tdis.xiao_ke contextual association

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Type 1 Diabetes — https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-1-diabetes
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Is type 1 diabetes already canonical under a different slug?
2. Should DKA be a complication state or separate emergency condition?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 03. Polycythemia Vera / Erythrocytosis Identity Review · 真性紅血球增多症／紅血球增多鑑別

## Identity
```yaml
candidate_id: cond.polycythemia_vera
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Polycythemia vera (PV) is a chronic myeloproliferative neoplasm with excessive blood-cell production, especially red cells. Generic erythrocytosis/polycythemia is broader and can be secondary.

### `clinical_definition` [CANONICAL_NOW]
Do not treat 'polycythemia' and polycythemia vera as synonyms. PV is a clonal marrow disease; secondary erythrocytosis can result from hypoxia, erythropoietin-driven states, or other causes.

### `etiology` [CANONICAL_NOW]
PV is usually associated with acquired JAK2-pathway mutations. Secondary erythrocytosis has different causes and needs separate evaluation.

### `pathophysiology` [CANONICAL_NOW]
Expanded red-cell mass increases blood viscosity and thrombosis risk; leukocyte/platelet abnormalities and marrow evolution may also occur in PV.

### `presentation_clinical` [CANONICAL_NOW]
Some patients are asymptomatic; possible headache, dizziness, visual symptoms, pruritus after warm water, erythromelalgia, splenomegaly, thrombosis or bleeding.

### `key_features` [CANONICAL_NOW]
- PV is a myeloproliferative neoplasm
- generic erythrocytosis is not a synonym
- thrombosis and bleeding are important complications
- hematocrit/CBC plus cause evaluation are central

### `red_flags` [CANONICAL_NOW]
Stroke/TIA, MI, DVT/PE, severe headache/neurologic deficits or major bleeding require urgent assessment.

### `diagnosis_methods` [CANONICAL_NOW]
CBC/hematocrit, erythropoietin level, JAK2 testing and marrow evaluation may be used; secondary causes of erythrocytosis must be assessed.

### `differential_diagnosis` [CANONICAL_NOW]
- secondary erythrocytosis from hypoxia
- relative erythrocytosis/dehydration
- other myeloproliferative neoplasms

### `western_treatment` [CANONICAL_NOW]
PV management may include phlebotomy, antiplatelet therapy and cytoreductive treatment based on risk; secondary erythrocytosis treatment targets the cause.

### `acupuncture_role` [CANONICAL_NOW]
Do not use bloodletting as a substitute for therapeutic phlebotomy. Review thrombosis/bleeding risk and antithrombotic therapy.

## Proposed relations [DERIVED_RELATION]
- sym.headache EXISTS
- sym.dizziness candidate
- DVT/PE/stroke/MI complication contexts

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus Genetics — Polycythemia vera — https://medlineplus.gov/genetics/condition/polycythemia-vera/
- NCI Dictionary — Polycythemia vera — https://www.cancer.gov/publications/dictionaries/cancer-terms/def/polycythemia-vera
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should OS use PV as the canonical disease and keep generic erythrocytosis as differential/parent?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 04. Neutropenia · 嗜中性白血球減少症

## Identity
```yaml
candidate_id: cond.neutropenia
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Neutropenia is a reduced absolute neutrophil count that increases susceptibility to bacterial and fungal infection, with risk rising as neutropenia becomes more severe or prolonged.

### `clinical_definition` [CANONICAL_NOW]
Neutropenia is a laboratory-defined hematologic state with many causes; it should not be conflated with total leukopenia or with a single disease etiology.

### `etiology` [CANONICAL_NOW]
Causes include medications/chemotherapy, marrow disorders, infections, autoimmune disease, nutritional deficiency, congenital disorders and other systemic disease.

### `pathophysiology` [CANONICAL_NOW]
Reduced neutrophil availability weakens innate defense against invasive bacterial and fungal infection; fever may be the only early sign in severely neutropenic patients.

### `presentation_clinical` [CANONICAL_NOW]
Neutropenia itself may be asymptomatic. Infection can present with fever, chills, mouth sores, sore throat, cough, urinary symptoms, skin changes or sepsis.

### `key_features` [CANONICAL_NOW]
- ANC is the key count
- risk depends on depth/duration and clinical context
- fever in significant neutropenia is time-sensitive
- cause evaluation is essential

### `red_flags` [CANONICAL_NOW]
Fever with significant neutropenia, rigors, hypotension, altered mental status, dyspnea or other sepsis features requires urgent/emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
CBC with differential establishes ANC; repeated counts, medication review, infection/nutrition studies and bone-marrow evaluation may be required by context.

### `differential_diagnosis` [CANONICAL_NOW]
- transient viral leukopenia
- medication-induced neutropenia
- marrow failure/malignancy
- autoimmune neutropenia
- nutritional deficiency

### `western_treatment` [CANONICAL_NOW]
Treat the cause, stop offending agents when medically appropriate, treat infections promptly, and use growth-factor or other hematology-directed therapy in selected cases.

### `acupuncture_role` [CANONICAL_NOW]
Avoid treatment during febrile neutropenia or unstable infection. Use strict infection-control precautions and coordinate with oncology/hematology when counts are treatment-related.

## Proposed relations [DERIVED_RELATION]
- sym.fever RECONCILE
- infection safety cluster
- medication relation STAGING_ONLY

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NCI Dictionary — Neutropenia — https://www.cancer.gov/publications/dictionaries/cancer-terms/def/neutropenia
- NCI — Infection and Neutropenia During Cancer Treatment — https://www.cancer.gov/about-cancer/treatment/side-effects/infection
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should lab-severity thresholds live in a lab/safety layer rather than Condition prose?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 05. Hemochromatosis · 血色素沉著症／血鐵沉積症

## Identity
```yaml
candidate_id: cond.hemochromatosis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Hemochromatosis is a disorder of excessive iron accumulation that can damage the liver, heart, pancreas, joints and other organs.

### `clinical_definition` [CANONICAL_NOW]
Hereditary hemochromatosis is a genetic iron-overload disorder; secondary iron overload from transfusions or other disease is a different cause pathway.

### `etiology` [CANONICAL_NOW]
Hereditary forms commonly involve HFE-related altered iron regulation; secondary overload can follow repeated transfusion or other conditions.

### `pathophysiology` [CANONICAL_NOW]
Excess intestinal iron absorption or iron loading raises body iron stores; deposited iron promotes oxidative tissue injury and fibrosis.

### `presentation_clinical` [CANONICAL_NOW]
May be asymptomatic early. Fatigue, joint pain, liver abnormalities, diabetes, skin pigmentation, arrhythmia/cardiomyopathy, or endocrine problems can occur.

### `key_features` [CANONICAL_NOW]
- iron overload, not ordinary high dietary iron
- ferritin and transferrin saturation guide evaluation
- organ damage is preventable when treated early
- genetic vs secondary cause matters

### `red_flags` [CANONICAL_NOW]
Decompensated liver disease, serious arrhythmia/heart failure, severe hyperglycemia or other organ failure requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Iron studies, ferritin/transferrin saturation, genetic testing and organ-specific evaluation are used; alternate causes of elevated ferritin must be considered.

### `differential_diagnosis` [CANONICAL_NOW]
- inflammation-related high ferritin
- chronic liver disease
- secondary transfusional iron overload
- other genetic iron disorders

### `western_treatment` [CANONICAL_NOW]
Regular therapeutic phlebotomy is standard for many hereditary cases; chelation is used in selected patients who cannot undergo phlebotomy or have secondary overload.

### `acupuncture_role` [CANONICAL_NOW]
Do not confuse acupuncture bloodletting with medical phlebotomy. Account for cirrhosis, diabetes, cardiac disease and treatment status.

## Proposed relations [DERIVED_RELATION]
- fatigue EXISTS
- cirrhosis/diabetes/cardiac complication contexts

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Hemochromatosis — https://www.niddk.nih.gov/health-information/liver-disease/hemochromatosis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Does the library distinguish hereditary hemochromatosis from secondary iron overload?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 06. Raynaud Phenomenon · 雷諾現象

## Identity
```yaml
candidate_id: cond.raynaud_phenomenon
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Raynaud phenomenon is episodic vasospasm of small vessels, usually in fingers or toes, triggered by cold or emotional stress and causing characteristic color/sensory changes.

### `clinical_definition` [CANONICAL_NOW]
Primary Raynaud disease occurs without another causative disorder; secondary Raynaud phenomenon is associated with connective-tissue or other disease and has greater tissue-injury risk.

### `etiology` [CANONICAL_NOW]
Primary disease has no identified underlying systemic cause. Secondary Raynaud can accompany systemic sclerosis, lupus and other conditions, medications or occupational exposures.

### `pathophysiology` [CANONICAL_NOW]
Exaggerated vasoconstriction transiently reduces digital blood flow; reperfusion can cause color change, tingling or pain.

### `presentation_clinical` [CANONICAL_NOW]
Attacks may cause white/blue/red color change, coldness, numbness, tingling or pain in fingers/toes; episodes are often cold- or stress-triggered.

### `key_features` [CANONICAL_NOW]
- primary vs secondary distinction matters
- episodic and trigger-linked
- nailfold capillaroscopy can help secondary-disease evaluation
- secondary disease can ulcerate

### `red_flags` [CANONICAL_NOW]
Digital ulceration, tissue necrosis/gangrene, persistent ischemia, severe unilateral findings or systemic autoimmune features require medical evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical history and exam are central; nailfold capillaroscopy and autoimmune testing may be used when secondary disease is suspected.

### `differential_diagnosis` [CANONICAL_NOW]
- acrocyanosis
- peripheral arterial disease
- embolic ischemia
- thoracic outlet/vascular compression
- cold injury

### `western_treatment` [CANONICAL_NOW]
Cold avoidance and warming are foundational; smoking cessation and selected vasodilator medicines are used. Secondary disease treatment targets the cause.

### `acupuncture_role` [CANONICAL_NOW]
Avoid aggressive local needling/cupping on ischemic or ulcerated digits; new persistent ischemia requires vascular assessment.

## Proposed relations [DERIVED_RELATION]
- SLE/systemic sclerosis context
- numbness/pain endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIAMS — Raynaud's Phenomenon — https://www.niams.nih.gov/health-topics/raynauds-phenomenon
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should primary and secondary Raynaud be subtypes or separate canonical identities?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 07. Valvular Heart Disease · 心臟瓣膜疾病

## Identity
```yaml
candidate_id: cond.valvular_heart_disease
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Valvular heart disease comprises stenosis, regurgitation and other dysfunction of the heart valves that can alter intracardiac flow and lead to chamber remodeling, arrhythmia or heart failure.

### `clinical_definition` [CANONICAL_NOW]
This is a parent condition. Aortic stenosis, mitral regurgitation and other valve-specific disorders may deserve separate child identities depending current canonical coverage and UI needs.

### `etiology` [CANONICAL_NOW]
Causes include congenital abnormalities, degenerative calcification, rheumatic disease, infective endocarditis, ischemic/papillary muscle dysfunction and connective-tissue disease.

### `pathophysiology` [CANONICAL_NOW]
Stenosis obstructs forward flow; regurgitation causes backward flow and volume overload. Chronic pressure/volume stress can produce ventricular/atrial remodeling and heart failure.

### `presentation_clinical` [CANONICAL_NOW]
Some patients are asymptomatic. Dyspnea, fatigue, chest discomfort, palpitations, syncope, edema or exercise intolerance can occur depending valve and severity.

### `key_features` [CANONICAL_NOW]
- parent category with valve-specific subtypes
- murmur suggests but does not define severity
- echocardiography is central
- severe valve disease can cause HF/syncope

### `red_flags` [CANONICAL_NOW]
Exertional syncope, acute pulmonary edema, severe dyspnea, chest pain, shock or suspected infective endocarditis requires urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
History/exam and echocardiography are central; ECG, chest imaging, stress testing, CT/MRI or catheterization can add information by context.

### `differential_diagnosis` [CANONICAL_NOW]
- heart failure from other causes
- cardiomyopathy
- congenital heart disease
- arrhythmia
- noncardiac dyspnea

### `western_treatment` [CANONICAL_NOW]
Observation, guideline-directed medical management of consequences, and valve repair or replacement (surgical or transcatheter) depend on lesion and severity.

### `acupuncture_role` [CANONICAL_NOW]
Stable medically managed patients may receive adjunctive care. New syncope, dyspnea or chest pain requires cardiac evaluation; anticoagulation/device status may change procedural safety.

## Proposed relations [DERIVED_RELATION]
- heart failure
- arrhythmia
- dyspnea/chest_pain/syncope endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NHLBI — Heart Valve Diseases — https://www.nhlbi.nih.gov/health/heart-valve-diseases
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Which individual valve lesions already exist and should parent card be navigational only?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---
