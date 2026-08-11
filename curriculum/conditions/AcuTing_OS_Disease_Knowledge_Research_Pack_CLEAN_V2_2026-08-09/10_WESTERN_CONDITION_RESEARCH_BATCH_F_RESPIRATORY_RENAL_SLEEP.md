# Western Condition Research Batch F - Respiratory / Renal / Sleep

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 8  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Asthma · 氣喘／哮喘（西醫）

## Identity
```yaml
candidate_id: cond.asthma
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Asthma is a chronic inflammatory airway disease with variable airflow obstruction and bronchial hyperresponsiveness that produces episodic respiratory symptoms.

### `clinical_definition` [CANONICAL_NOW]
Asthma is not synonymous with wheezing or with the TCM disease 哮病. Objective evidence of variable expiratory airflow limitation is often important.

### `etiology` [CANONICAL_NOW]
Genetic susceptibility interacts with allergens, viral infections, irritants, exercise, occupational exposures and other triggers.

### `pathophysiology` [CANONICAL_NOW]
Airway inflammation, smooth-muscle constriction and mucus narrow the airways; remodeling can occur in chronic disease.

### `presentation_clinical` [CANONICAL_NOW]
Wheeze, cough, shortness of breath and chest tightness are typical; symptoms can vary over time and worsen at night/early morning or with triggers.

### `key_features` [CANONICAL_NOW]
- variable symptoms
- reversible/variable airflow limitation
- action plan and rescue therapy are important
- severe exacerbation can be life-threatening

### `red_flags` [CANONICAL_NOW]
Severe breathlessness, inability to speak normally, cyanosis, altered mental status, exhaustion or poor response to rescue medication requires emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
History plus spirometry/bronchodilator response when feasible; peak flow, challenge testing or allergy evaluation can support diagnosis.

### `differential_diagnosis` [CANONICAL_NOW]
- COPD
- vocal cord dysfunction
- heart failure
- PE
- pneumothorax
- anaphylaxis

### `western_treatment` [CANONICAL_NOW]
Trigger control, inhaled corticosteroid-containing regimens, reliever therapy and stepwise controller treatment guided by severity/control; action plans are important.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive only. Never replace inhalers or delay emergency treatment; verify inhaler availability and current exacerbation status.

## Proposed relations [DERIVED_RELATION]
- tdis.xiao_bing
- tdis.chuan_zheng
- wheeze/dyspnea/cough endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NHLBI — Asthma — https://www.nhlbi.nih.gov/health/asthma
- NHLBI — Asthma Treatment and Action Plan — https://www.nhlbi.nih.gov/health/asthma/treatment-action-plan
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Which asthma subtypes already exist?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 02. Chronic Kidney Disease · 慢性腎臟病

## Identity
```yaml
candidate_id: cond.chronic_kidney_disease
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Chronic kidney disease (CKD) is persistent kidney damage or reduced kidney function lasting more than three months and carrying cardiovascular, metabolic and progression risks.

### `clinical_definition` [CANONICAL_NOW]
CKD is not a single creatinine result. Staging incorporates estimated GFR and albuminuria/other evidence of kidney damage.

### `etiology` [CANONICAL_NOW]
Common causes include diabetes, hypertension, glomerular disease, inherited disease, obstruction and recurrent kidney injury.

### `pathophysiology` [CANONICAL_NOW]
Progressive nephron loss causes reduced filtration and endocrine/metabolic disturbances, including fluid, electrolyte, acid-base, anemia and mineral-bone complications.

### `presentation_clinical` [CANONICAL_NOW]
Often asymptomatic early; later fatigue, edema, pruritus, nausea, appetite change, dyspnea, sleep problems and urinary changes may occur.

### `key_features` [CANONICAL_NOW]
- persistence >3 months matters
- eGFR and urine albumin are core tests
- cardiovascular risk is high
- advanced CKD affects medication/procedure safety

### `red_flags` [CANONICAL_NOW]
Severe hyperkalemia, pulmonary edema, uremic encephalopathy, pericarditis, severe acidosis or rapidly worsening kidney function requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Serum creatinine/eGFR and urine albumin-to-creatinine ratio are central; urinalysis, imaging and cause-specific testing are added as indicated.

### `differential_diagnosis` [CANONICAL_NOW]
- acute kidney injury
- dehydration-related transient creatinine rise
- obstructive uropathy
- heart/liver-related edema

### `western_treatment` [CANONICAL_NOW]
Treat cause, control BP/diabetes, use kidney-protective therapies when indicated, avoid nephrotoxins, manage complications and plan renal replacement therapy for kidney failure when necessary.

### `acupuncture_role` [CANONICAL_NOW]
Review BP, anticoagulation, anemia, edema, dialysis access and infection risk. Do not needle/cup over dialysis fistulas or unstable edema/infection.

## Proposed relations [DERIVED_RELATION]
- sym.edema RECONCILE
- anemia relation
- tdis.shui_zhong contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Chronic Kidney Disease — https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should dialysis status be longitudinal/device layer?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 03. Kidney Stones (Nephrolithiasis) · 腎結石

## Identity
```yaml
candidate_id: cond.nephrolithiasis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Kidney stones are solid mineral/crystal deposits in the urinary tract that can cause renal colic, hematuria and obstruction.

### `clinical_definition` [CANONICAL_NOW]
Stone disease includes different compositions and anatomical locations; a stone causing infected obstruction is a high-risk emergency state.

### `etiology` [CANONICAL_NOW]
Risk reflects low urine volume, urinary chemistry, diet, metabolic disease, infection, medications and genetic factors depending stone type.

### `pathophysiology` [CANONICAL_NOW]
Crystals form and aggregate; migration into the ureter can obstruct urine flow, raise pressure and cause severe colicky pain.

### `presentation_clinical` [CANONICAL_NOW]
Severe flank/back pain radiating toward groin, hematuria, nausea/vomiting and urinary urgency can occur.

### `key_features` [CANONICAL_NOW]
- colicky flank pain
- hematuria common
- noncontrast imaging often used
- infection plus obstruction is dangerous

### `red_flags` [CANONICAL_NOW]
Fever/chills with obstruction, sepsis signs, anuria, solitary kidney, uncontrolled pain/vomiting or pregnancy-related concern needs urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Urinalysis, blood tests and imaging identify stone/obstruction; recovered stones and 24-hour urine can guide prevention in recurrent disease.

### `differential_diagnosis` [CANONICAL_NOW]
- pyelonephritis
- appendicitis
- aortic disease
- biliary colic
- musculoskeletal pain
- ectopic pregnancy

### `western_treatment` [CANONICAL_NOW]
Pain control, hydration as appropriate, medical expulsive therapy in selected cases, and urologic procedures for obstructing/large/complicated stones; prevention is stone-specific.

### `acupuncture_role` [CANONICAL_NOW]
Acupuncture may support stable pain but must not delay evaluation of obstruction, infection or vascular/abdominal emergencies.

## Proposed relations [DERIVED_RELATION]
- flank_pain/hematuria endpoints
- tdis.lin_zheng context

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Kidney Stones — https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-stones
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should renal and ureteral stones be child identities?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 04. Kidney Infection (Pyelonephritis) · 腎盂腎炎／腎臟感染

## Identity
```yaml
candidate_id: cond.pyelonephritis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Pyelonephritis is an infection of the kidney, usually bacterial and often ascending from the lower urinary tract.

### `clinical_definition` [CANONICAL_NOW]
Kidney infection is more serious than uncomplicated cystitis and can cause sepsis or renal complications.

### `etiology` [CANONICAL_NOW]
Most cases arise from urinary bacteria ascending to the kidney; obstruction, pregnancy, reflux, catheters and urinary abnormalities can increase risk.

### `pathophysiology` [CANONICAL_NOW]
Bacterial infection produces inflammation of renal tissue and collecting system; bacteremia/sepsis can occur.

### `presentation_clinical` [CANONICAL_NOW]
Fever/chills, flank or back pain, nausea/vomiting and urinary symptoms are common.

### `key_features` [CANONICAL_NOW]
- upper urinary tract infection
- fever plus flank pain is high-yield
- urine testing/culture important
- sepsis risk

### `red_flags` [CANONICAL_NOW]
Sepsis features, pregnancy, obstruction/stone, inability to tolerate fluids/antibiotics, severe pain or immunocompromise may require urgent/hospital care.

### `diagnosis_methods` [CANONICAL_NOW]
Urinalysis and urine culture; blood tests and imaging when severe, atypical, recurrent or obstruction is suspected.

### `differential_diagnosis` [CANONICAL_NOW]
- cystitis
- nephrolithiasis
- appendicitis
- musculoskeletal flank pain
- PID

### `western_treatment` [CANONICAL_NOW]
Antibiotics with route/setting based on severity and resistance risk; address obstruction or structural cause.

### `acupuncture_role` [CANONICAL_NOW]
Do not treat febrile flank pain as simple Kidney deficiency. Defer during systemic infection/instability.

## Proposed relations [DERIVED_RELATION]
- sym.fever RECONCILE
- flank_pain
- tdis.lin_zheng contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Kidney Infection — https://www.niddk.nih.gov/health-information/urologic-diseases/kidney-infection-pyelonephritis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should UTI parent and pyelonephritis be separate canonical cards?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 05. Bladder Infection (Cystitis) · 膀胱炎／下泌尿道感染

## Identity
```yaml
candidate_id: cond.cystitis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Acute bacterial cystitis is infection/inflammation of the bladder causing lower urinary tract symptoms.

### `clinical_definition` [CANONICAL_NOW]
Cystitis is distinct from asymptomatic bacteriuria, pyelonephritis, STI/urethritis and interstitial cystitis/bladder pain syndrome.

### `etiology` [CANONICAL_NOW]
Usually caused by bacteria ascending through the urethra; risk is influenced by anatomy, sexual activity, menopause, pregnancy, obstruction and instrumentation.

### `pathophysiology` [CANONICAL_NOW]
Bacterial colonization triggers bladder mucosal inflammation, causing dysuria, urgency and frequency.

### `presentation_clinical` [CANONICAL_NOW]
Dysuria, urinary frequency/urgency, suprapubic discomfort and sometimes hematuria; fever/flank pain suggests upper-tract involvement.

### `key_features` [CANONICAL_NOW]
- lower UTI
- dysuria/frequency/urgency
- pyelonephritis must be excluded when systemic symptoms occur
- pregnancy changes management

### `red_flags` [CANONICAL_NOW]
Fever, flank pain, vomiting, pregnancy, male/complicated infection, urinary retention or sepsis features require broader evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical assessment plus urinalysis; urine culture in selected/complicated cases.

### `differential_diagnosis` [CANONICAL_NOW]
- pyelonephritis
- urethritis/STI
- vaginitis
- interstitial cystitis
- nephrolithiasis

### `western_treatment` [CANONICAL_NOW]
Appropriate antibiotics for bacterial cystitis plus supportive care; recurrent/complicated cases need cause evaluation.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive care should not delay antibiotics when infection is diagnosed; fever/flank pain is not routine acupuncture territory.

## Proposed relations [DERIVED_RELATION]
- dysuria/frequency endpoints
- tdis.lin_zheng

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Bladder Infection (UTI) — https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-infection-uti-in-adults
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should generic UTI be a parent or UI alias?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 06. Obstructive Sleep Apnea · 阻塞型睡眠呼吸中止症

## Identity
```yaml
candidate_id: cond.obstructive_sleep_apnea
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Obstructive sleep apnea (OSA) is recurrent upper-airway collapse during sleep causing intermittent airflow reduction/cessation, oxygen disturbance and sleep fragmentation.

### `clinical_definition` [CANONICAL_NOW]
OSA is distinct from primary snoring, central sleep apnea and insomnia.

### `etiology` [CANONICAL_NOW]
Upper-airway anatomy, obesity, age, craniofacial factors, alcohol/sedatives and other risk factors contribute.

### `pathophysiology` [CANONICAL_NOW]
Repeated airway obstruction produces intermittent hypoxemia, arousals, sympathetic activation and cardiovascular/metabolic stress.

### `presentation_clinical` [CANONICAL_NOW]
Loud snoring, witnessed apneas/gasping, unrefreshing sleep, daytime sleepiness, morning headache, dry mouth and concentration problems.

### `key_features` [CANONICAL_NOW]
- sleep study establishes severity
- snoring alone is not OSA
- daytime sleepiness and cardiometabolic risk matter
- CPAP is common effective therapy

### `red_flags` [CANONICAL_NOW]
Severe daytime sleepiness with driving risk, marked nocturnal hypoxemia or cardiopulmonary complications requires medical management.

### `diagnosis_methods` [CANONICAL_NOW]
Sleep history and risk assessment followed by home sleep apnea testing or polysomnography in appropriate patients.

### `differential_diagnosis` [CANONICAL_NOW]
- primary snoring
- central sleep apnea
- insomnia
- restless legs
- narcolepsy

### `western_treatment` [CANONICAL_NOW]
Weight/risk-factor management, positive airway pressure, oral appliances, positional therapy and selected surgery depending patient factors.

### `acupuncture_role` [CANONICAL_NOW]
May support sleep-related symptoms but cannot replace airway treatment. Ask about CPAP adherence and excessive sleepiness safety.

## Proposed relations [DERIVED_RELATION]
- cond.insomnia differential
- sym.fatigue EXISTS
- tdis.bu_mei DIFFERENTIAL_CONTEXT

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NHLBI — Sleep Apnea — https://www.nhlbi.nih.gov/health/sleep-apnea
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Does the current library distinguish OSA and central sleep apnea?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 07. Pneumonia · 肺炎

## Identity
```yaml
candidate_id: cond.pneumonia
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Pneumonia is infection/inflammation of lung air sacs and surrounding tissue caused by bacteria, viruses, fungi or other pathogens.

### `clinical_definition` [CANONICAL_NOW]
Pneumonia is a lower respiratory infection and is distinct from acute bronchitis and uncomplicated URI.

### `etiology` [CANONICAL_NOW]
Common causes include bacterial and viral pathogens; aspiration and immunocompromised states alter the pathogen/risk profile.

### `pathophysiology` [CANONICAL_NOW]
Alveolar inflammation and fluid/cellular exudate impair gas exchange and can provoke systemic inflammatory response.

### `presentation_clinical` [CANONICAL_NOW]
Cough, fever/chills, dyspnea, chest pain, fatigue and sputum may occur; older or immunocompromised patients can present atypically.

### `key_features` [CANONICAL_NOW]
- lower respiratory infection
- gas-exchange impairment possible
- imaging often supports diagnosis
- severity determines outpatient vs hospital care

### `red_flags` [CANONICAL_NOW]
Hypoxia, severe dyspnea, confusion, hypotension, sepsis, inability to maintain hydration or rapidly worsening symptoms require urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
History/exam, oxygen assessment and often chest imaging; microbiologic testing depends on severity and context.

### `differential_diagnosis` [CANONICAL_NOW]
- acute bronchitis
- influenza/COVID
- asthma/COPD exacerbation
- PE
- heart failure

### `western_treatment` [CANONICAL_NOW]
Cause- and severity-specific antimicrobials when indicated plus supportive care; severe disease may require hospitalization and respiratory support.

### `acupuncture_role` [CANONICAL_NOW]
Do not treat unstable or hypoxic pneumonia. Infection-control and referral come first; stable recovery support is adjunctive.

## Proposed relations [DERIVED_RELATION]
- cough/dyspnea/fever endpoints
- tdis.ke_sou/chuan_zheng contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NHLBI — Pneumonia — https://www.nhlbi.nih.gov/health/pneumonia
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should bacterial/viral/aspiration pneumonia be subtypes?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 08. Acute Bronchitis · 急性支氣管炎

## Identity
```yaml
candidate_id: cond.acute_bronchitis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Acute bronchitis is short-term inflammation of the bronchi, usually caused by viral infection, characterized primarily by cough.

### `clinical_definition` [CANONICAL_NOW]
Acute bronchitis is distinct from chronic bronchitis, which is part of COPD when defined clinically.

### `etiology` [CANONICAL_NOW]
Most cases are viral; irritants can contribute. Routine bacterial antibiotics are generally not appropriate for uncomplicated viral bronchitis.

### `pathophysiology` [CANONICAL_NOW]
Bronchial mucosal inflammation increases cough and mucus production without the alveolar infection pattern of pneumonia.

### `presentation_clinical` [CANONICAL_NOW]
Cough with or without mucus, chest discomfort, fatigue and mild systemic symptoms; wheeze may occur.

### `key_features` [CANONICAL_NOW]
- usually viral
- cough may persist after other symptoms
- pneumonia must be considered when severity/fever/hypoxia suggests
- chronic bronchitis is different

### `red_flags` [CANONICAL_NOW]
Hypoxia, significant dyspnea, high/persistent fever, hemoptysis, confusion or focal pneumonia signs require evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Primarily clinical; testing/imaging is used when pneumonia, asthma/COPD or other disease is suspected.

### `differential_diagnosis` [CANONICAL_NOW]
- pneumonia
- asthma
- COPD exacerbation
- pertussis
- COVID/influenza
- GERD

### `western_treatment` [CANONICAL_NOW]
Supportive care for most cases; targeted treatment if another diagnosis is found.

### `acupuncture_role` [CANONICAL_NOW]
Stable symptom support may be reasonable, but prolonged or worsening cough needs biomedical reassessment.

## Proposed relations [DERIVED_RELATION]
- sym.cough candidate
- tdis.ke_sou contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NHLBI — Bronchitis — https://www.nhlbi.nih.gov/health/bronchitis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should chronic bronchitis remain under COPD rather than a separate card?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---
