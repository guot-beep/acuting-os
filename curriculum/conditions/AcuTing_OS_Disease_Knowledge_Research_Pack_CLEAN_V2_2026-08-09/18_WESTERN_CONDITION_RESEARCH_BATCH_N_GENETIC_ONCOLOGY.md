# Western Condition Research Batch N - Genetic / Oncology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 7  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Down Syndrome · 唐氏症

## Identity
```yaml
candidate_id: cond.down_syndrome
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Down syndrome is a chromosomal condition caused by extra chromosome 21 material and is associated with characteristic developmental, cognitive and multisystem health features.

### `clinical_definition` [CANONICAL_NOW]
Most cases are trisomy 21 from nondisjunction; translocation and mosaic forms exist. It is not a disease to be 'cured' but a lifelong genetic condition requiring individualized health surveillance.

### `etiology` [CANONICAL_NOW]
Extra chromosome 21 material, usually from a random cell-division error; some translocation cases can be inherited from a balanced-translocation parent.

### `pathophysiology` [CANONICAL_NOW]
Gene-dosage effects alter development across brain, heart, immune, endocrine and other systems.

### `presentation_clinical` [CANONICAL_NOW]
Variable intellectual/developmental disability, hypotonia and characteristic physical features; associated congenital heart, hearing, vision, thyroid, GI and hematologic conditions.

### `key_features` [CANONICAL_NOW]
- trisomy 21 most common form
- multisystem surveillance
- wide individual variation
- increased congenital heart/hearing/thyroid risks

### `red_flags` [CANONICAL_NOW]
Acute symptoms should be evaluated according to the associated organ condition; cervical instability or congenital heart disease can affect procedure/exercise safety in some individuals.

### `diagnosis_methods` [CANONICAL_NOW]
Prenatal screening/diagnostic testing or postnatal chromosome analysis confirms diagnosis.

### `differential_diagnosis` [CANONICAL_NOW]
- other chromosomal/developmental syndromes

### `western_treatment` [CANONICAL_NOW]
No single disease treatment; developmental supports and condition-specific preventive/specialty care throughout life.

### `acupuncture_role` [CANONICAL_NOW]
Provide accessible, respectful individualized care; confirm cardiac, cervical-spine, sensory and communication needs without stereotyping.

## Proposed relations [DERIVED_RELATION]
- congenital heart disease/hearing/vision/thyroid contexts

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus Genetics — Down syndrome — https://medlineplus.gov/genetics/condition/down-syndrome/
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 02. Marfan Syndrome · 馬凡氏症候群

## Identity
```yaml
candidate_id: cond.marfan_syndrome
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Marfan syndrome is an autosomal-dominant connective-tissue disorder caused by FBN1 variants that can affect the aorta, heart valves, eyes and skeleton.

### `clinical_definition` [CANONICAL_NOW]
Aortic-root disease and ectopia lentis are major diagnostic/management features; phenotype varies widely.

### `etiology` [CANONICAL_NOW]
Pathogenic variants in FBN1; some cases inherited and others de novo.

### `pathophysiology` [CANONICAL_NOW]
Defective fibrillin-1/microfibrils weaken connective tissue and dysregulate growth-factor signaling.

### `presentation_clinical` [CANONICAL_NOW]
Tall/slender habitus, long digits, skeletal deformity, lens dislocation/myopia, aortic dilation/aneurysm and valve disease.

### `key_features` [CANONICAL_NOW]
- FBN1 connective-tissue disorder
- aortic aneurysm/dissection risk
- ectopia lentis
- autosomal dominant

### `red_flags` [CANONICAL_NOW]
Sudden severe chest/back/abdominal pain, syncope or neurologic symptoms requires emergency evaluation for aortic dissection/rupture.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical Ghent-style criteria, family history, cardiovascular/eye evaluation and genetic testing.

### `differential_diagnosis` [CANONICAL_NOW]
- Loeys-Dietz syndrome
- vascular EDS
- homocystinuria
- familial thoracic aortic aneurysm

### `western_treatment` [CANONICAL_NOW]
Regular aortic imaging, blood-pressure/heart-rate management and prophylactic aortic surgery when indicated; eye/skeletal care.

### `acupuncture_role` [CANONICAL_NOW]
Know aortic dimensions/restrictions and avoid aggressive manipulation. New chest/back pain is emergency territory.

## Proposed relations [DERIVED_RELATION]
- aortic_aneurysm/valvular disease/pneumothorax contexts

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus Genetics — Marfan syndrome — https://medlineplus.gov/genetics/condition/marfan-syndrome/
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 03. Cancer / Malignancy Parent · 癌症／惡性腫瘤（總類）

## Identity
```yaml
candidate_id: cond.cancer_parent
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Cancer is a large family of diseases in which abnormal cells grow uncontrollably, invade tissues and may metastasize. Site, histology, stage and biomarkers determine clinical meaning.

### `clinical_definition` [CANONICAL_NOW]
A generic cancer parent is useful for navigation/co-management but should not replace site-specific canonical cancers.

### `etiology` [CANONICAL_NOW]
Cancer arises from accumulated genomic/epigenomic alterations influenced by age, inherited susceptibility, exposures, infections and random cellular processes.

### `pathophysiology` [CANONICAL_NOW]
Malignant cells escape growth controls, invade local tissue, recruit blood supply and may spread through lymph/blood to distant organs.

### `presentation_clinical` [CANONICAL_NOW]
Varies by site; unexplained persistent masses, bleeding, weight loss, pain, organ dysfunction or no symptoms on screening.

### `key_features` [CANONICAL_NOW]
- heterogeneous disease family
- biopsy/pathology defines many diagnoses
- stage drives prognosis/treatment
- treatment adverse effects are major co-management issue

### `red_flags` [CANONICAL_NOW]
Febrile neutropenia, spinal cord compression, superior vena cava syndrome, tumor lysis, severe bleeding, sepsis or acute neurologic compromise are oncology emergencies.

### `diagnosis_methods` [CANONICAL_NOW]
Site-specific imaging/endoscopy/labs followed by tissue diagnosis in many cancers and staging.

### `differential_diagnosis` [CANONICAL_NOW]
- benign tumors
- infection/inflammation
- site-specific mimics

### `western_treatment` [CANONICAL_NOW]
Surgery, radiation, systemic therapy (cytotoxic, endocrine, targeted, immunotherapy) and supportive/palliative care based on cancer type/stage.

### `acupuncture_role` [CANONICAL_NOW]
AcuTing OS should emphasize symptom support, treatment-side-effect awareness and oncology coordination, never anticancer substitution.

## Proposed relations [DERIVED_RELATION]
- site-specific cancer child cards
- neutropenia/thrombocytopenia/anemia treatment effects

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NCI — Cancer Types — https://www.cancer.gov/types
- NCI — Symptoms of Cancer — https://www.cancer.gov/about-cancer/diagnosis-staging/symptoms
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should generic cancer parent be navigational only?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 04. Breast Cancer · 乳癌

## Identity
```yaml
candidate_id: cond.breast_cancer
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Breast cancer is malignant growth arising in breast tissue, most commonly from ductal or lobular epithelium, with diverse biologic subtypes.

### `clinical_definition` [CANONICAL_NOW]
Breast cancer includes in-situ and invasive entities and molecular subtypes; benign breast lumps are not cancer.

### `etiology` [CANONICAL_NOW]
Risk reflects age, sex, inherited variants/family history, reproductive/hormonal and lifestyle/exposure factors.

### `pathophysiology` [CANONICAL_NOW]
Malignant breast cells invade surrounding tissue and can spread to regional nodes and distant organs.

### `presentation_clinical` [CANONICAL_NOW]
Often screen-detected; possible breast/axillary lump, skin/nipple changes, discharge or shape change. Early disease may be asymptomatic.

### `key_features` [CANONICAL_NOW]
- screening detects asymptomatic disease
- tissue biopsy diagnosis
- ER/PR/HER2 biomarkers matter
- stage/subtype guide treatment

### `red_flags` [CANONICAL_NOW]
Inflammatory breast changes, rapidly progressive mass or metastatic/oncologic emergency symptoms require prompt evaluation, though most breast changes are not cancer.

### `diagnosis_methods` [CANONICAL_NOW]
Diagnostic mammography/ultrasound/MRI as appropriate followed by biopsy and receptor/pathology testing; staging when indicated.

### `differential_diagnosis` [CANONICAL_NOW]
- fibroadenoma
- cyst
- mastitis
- benign breast change

### `western_treatment` [CANONICAL_NOW]
Surgery, radiation and systemic endocrine, chemotherapy, HER2-targeted or other targeted/immunotherapies according to subtype/stage.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive symptom/side-effect care only; account for lymphedema, surgery/radiation fields, neutropenia and anticoagulation.

## Proposed relations [DERIVED_RELATION]
- lymphedema/pain/fatigue endpoints
- oncology treatment effects

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NCI — Breast Cancer — https://www.cancer.gov/types/breast
- NCI — Breast Cancer Diagnosis — https://www.cancer.gov/types/breast/diagnosis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 05. Prostate Cancer · 攝護腺癌

## Identity
```yaml
candidate_id: cond.prostate_cancer
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Prostate cancer is malignancy arising in the prostate, commonly adenocarcinoma, ranging from indolent localized disease to metastatic cancer.

### `clinical_definition` [CANONICAL_NOW]
Prostate cancer is distinct from BPH and prostatitis; urinary symptoms are not specific.

### `etiology` [CANONICAL_NOW]
Age, family/genetic factors and ancestry influence risk.

### `pathophysiology` [CANONICAL_NOW]
Malignant prostate epithelial cells may remain localized or spread, commonly to bone and lymph nodes.

### `presentation_clinical` [CANONICAL_NOW]
Often asymptomatic early; advanced disease may cause urinary symptoms, hematuria/hematospermia or persistent bone/pelvic pain.

### `key_features` [CANONICAL_NOW]
- often slow-growing but heterogeneous
- PSA is not diagnostic alone
- biopsy defines cancer
- active surveillance appropriate for selected low-risk disease

### `red_flags` [CANONICAL_NOW]
Spinal cord compression symptoms, urinary obstruction, severe bone pain or systemic complications in known cancer need urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
PSA/DRE risk assessment, prostate MRI and biopsy; staging imaging based on risk.

### `differential_diagnosis` [CANONICAL_NOW]
- BPH
- prostatitis
- UTI
- metastatic bone disease from other cancer

### `western_treatment` [CANONICAL_NOW]
Active surveillance, surgery, radiation, androgen-deprivation/hormonal therapy and systemic treatments based on stage/risk.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive treatment-side-effect support; consider bone health, urinary symptoms and anticoagulation.

## Proposed relations [DERIVED_RELATION]
- BPH/prostatitis differentials
- bone_pain/urinary endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NCI — Prostate Cancer — https://www.cancer.gov/types/prostate
- NCI — Understanding Prostate Changes — https://www.cancer.gov/types/prostate/understanding-prostate-changes
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 06. Colorectal Cancer · 大腸直腸癌

## Identity
```yaml
candidate_id: cond.colorectal_cancer
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Colorectal cancer is malignancy arising in the colon or rectum, often developing through precursor polyps and with outcomes strongly influenced by stage.

### `clinical_definition` [CANONICAL_NOW]
Colon and rectal cancers are related but may differ in treatment planning; benign polyps are not cancer.

### `etiology` [CANONICAL_NOW]
Age, inherited syndromes/family history, IBD and lifestyle/metabolic factors contribute.

### `pathophysiology` [CANONICAL_NOW]
Adenomatous or serrated precursor pathways accumulate molecular alterations, progressing to invasive and metastatic disease.

### `presentation_clinical` [CANONICAL_NOW]
May be asymptomatic on screening; blood in stool, change in bowel habits, iron-deficiency anemia, abdominal pain or weight loss can occur.

### `key_features` [CANONICAL_NOW]
- screening/prevention important
- polyps precursor
- iron-deficiency anemia can be clue
- tissue diagnosis + staging

### `red_flags` [CANONICAL_NOW]
Obstruction, perforation, major bleeding or severe anemia/hemodynamic symptoms needs urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Colonoscopy with biopsy; CT/MRI and tumor markers support staging/follow-up, not standalone diagnosis.

### `differential_diagnosis` [CANONICAL_NOW]
- IBD
- hemorrhoids
- diverticular disease
- IBS
- other GI bleeding causes

### `western_treatment` [CANONICAL_NOW]
Surgery plus stage/site-specific chemotherapy, radiation (especially rectal contexts) and targeted/immunotherapy based on tumor features.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive care should account for bowel surgery, ostomy, neuropathy, cytopenias and infection risk.

## Proposed relations [DERIVED_RELATION]
- anemia/GI_bleeding/bowel_obstruction contexts

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NCI — Colorectal Cancer — https://www.cancer.gov/types/colorectal
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 07. Lung Cancer · 肺癌

## Identity
```yaml
candidate_id: cond.lung_cancer
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Lung cancer is malignant disease arising in lung tissue, broadly divided into non-small cell and small cell lung cancer with different biology and treatment.

### `clinical_definition` [CANONICAL_NOW]
Persistent cough or a lung nodule is not automatically cancer; histology and stage define disease.

### `etiology` [CANONICAL_NOW]
Tobacco smoke is a major risk factor; radon, occupational/environmental exposures and genetic factors also contribute, and nonsmokers can develop lung cancer.

### `pathophysiology` [CANONICAL_NOW]
Malignant pulmonary cells invade local structures and spread to nodes, brain, bone, liver and other sites.

### `presentation_clinical` [CANONICAL_NOW]
May be asymptomatic; persistent/change in cough, hemoptysis, chest pain, dyspnea, weight loss, hoarseness or recurrent pneumonia can occur.

### `key_features` [CANONICAL_NOW]
- NSCLC vs SCLC
- screening LDCT for eligible high-risk people
- biopsy/molecular testing
- metastatic patterns

### `red_flags` [CANONICAL_NOW]
Massive hemoptysis, severe dyspnea, SVC syndrome, spinal cord compression or acute neurologic metastatic symptoms requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Chest imaging followed by tissue diagnosis; staging and molecular biomarker testing guide treatment.

### `differential_diagnosis` [CANONICAL_NOW]
- pneumonia
- TB
- benign pulmonary nodule
- COPD
- metastatic cancer

### `western_treatment` [CANONICAL_NOW]
Surgery, radiation, chemotherapy, targeted therapy and immunotherapy based on histology/stage/biomarkers.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive symptom/side-effect care only; consider hypoxia, anticoagulation, cytopenias, radiation fields and metastatic bone risk.

## Proposed relations [DERIVED_RELATION]
- cough/dyspnea/hemoptysis endpoints
- COPD/TB differentials

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NCI — Lung Cancer — https://www.cancer.gov/types/lung
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Exact canonical identity scan required.

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---
