# Western Condition Research Batch M - Infectious Disease

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 7  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Influenza · 流行性感冒

## Identity
```yaml
candidate_id: cond.influenza
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Influenza is a contagious respiratory illness caused by influenza viruses and ranges from mild disease to severe pneumonia, decompensation and death.

### `clinical_definition` [CANONICAL_NOW]
Influenza is distinct from the common cold and COVID-19; symptoms overlap and testing may be needed.

### `etiology` [CANONICAL_NOW]
Seasonal influenza A and B viruses cause most human seasonal epidemics.

### `pathophysiology` [CANONICAL_NOW]
Respiratory epithelial infection and host inflammatory response produce systemic and respiratory symptoms; secondary bacterial pneumonia can occur.

### `presentation_clinical` [CANONICAL_NOW]
Abrupt fever/chills, cough, sore throat, runny/stuffy nose, myalgias, headache and fatigue; fever may be absent.

### `key_features` [CANONICAL_NOW]
- abrupt onset
- systemic aches/fatigue
- antivirals time-sensitive for high-risk/severe patients
- vaccination preventive

### `red_flags` [CANONICAL_NOW]
Dyspnea, chest pain, confusion, dehydration, hypoxia or high-risk patient with worsening illness requires prompt care.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical context plus molecular/antigen testing when results affect treatment/infection-control decisions.

### `differential_diagnosis` [CANONICAL_NOW]
- COVID-19
- common cold
- pneumonia
- strep pharyngitis

### `western_treatment` [CANONICAL_NOW]
Supportive care; antiviral treatment for severe/high-risk or selected early cases; vaccination prevention.

### `acupuncture_role` [CANONICAL_NOW]
Do not treat contagious acute illness without infection-control judgment; antivirals and respiratory evaluation should not be delayed.

## Proposed relations [DERIVED_RELATION]
- tdis.gan_mao/ke_sou contextual
- fever/cough endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- CDC — About Influenza — https://www.cdc.gov/flu/about/index.html
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

# 02. COVID-19 · 新冠病毒疾病 COVID-19

## Identity
```yaml
candidate_id: cond.covid_19
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
COVID-19 is infection caused by SARS-CoV-2, ranging from asymptomatic infection to critical multisystem disease and post-acute Long COVID.

### `clinical_definition` [CANONICAL_NOW]
COVID-19 and influenza share symptoms but are caused by different viruses and cannot be reliably distinguished by symptoms alone.

### `etiology` [CANONICAL_NOW]
SARS-CoV-2 infection transmitted primarily through respiratory particles.

### `pathophysiology` [CANONICAL_NOW]
Viral infection and host immune response affect respiratory and other organ systems; severe disease can cause hypoxemic pneumonia and thromboinflammatory complications.

### `presentation_clinical` [CANONICAL_NOW]
Fever/chills, cough, dyspnea, fatigue, sore throat, congestion, myalgias, headache, GI symptoms and taste/smell change may occur.

### `key_features` [CANONICAL_NOW]
- viral testing confirms
- severity spectrum broad
- early outpatient antivirals for eligible high-risk patients
- Long COVID is separate post-acute condition

### `red_flags` [CANONICAL_NOW]
Hypoxia, severe dyspnea, chest pain, confusion, cyanosis or high-risk worsening disease requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
NAAT/PCR or antigen viral testing plus severity evaluation.

### `differential_diagnosis` [CANONICAL_NOW]
- influenza
- common cold
- pneumonia
- PE
- asthma/COPD exacerbation

### `western_treatment` [CANONICAL_NOW]
Supportive care for low-risk mild disease; time-limited antiviral options for high-risk outpatients and hospital protocols for severe disease.

### `acupuncture_role` [CANONICAL_NOW]
Respect infection-control and treatment windows. Adjunctive symptom care must not delay antiviral eligibility or emergency assessment.

## Proposed relations [DERIVED_RELATION]
- tdis.gan_mao/ke_sou/chuan_zheng contextual
- Long COVID related condition

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- CDC — COVID-19 Clinical Presentation — https://www.cdc.gov/covid/hcp/clinical-care/covid19-presentation.html
- CDC — COVID-19 Outpatient Treatment — https://www.cdc.gov/covid/hcp/clinical-care/outpatient-treatment.html
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

# 03. Active Tuberculosis Disease · 活動性結核病

## Identity
```yaml
candidate_id: cond.tuberculosis_disease
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Tuberculosis disease is active illness caused by Mycobacterium tuberculosis complex, most often pulmonary but potentially affecting nearly any organ.

### `clinical_definition` [CANONICAL_NOW]
Active TB disease is distinct from latent/inactive TB infection: latent infection causes no symptoms and is not contagious.

### `etiology` [CANONICAL_NOW]
Airborne transmission of M. tuberculosis; progression from latent infection is more likely with immunosuppression and certain comorbidities.

### `pathophysiology` [CANONICAL_NOW]
Mycobacteria evade/overcome immune containment, multiply and create granulomatous tissue injury; pulmonary disease can transmit organisms through air.

### `presentation_clinical` [CANONICAL_NOW]
Pulmonary TB can cause cough ≥3 weeks, chest pain, sputum/hemoptysis, fatigue, weight loss, fever and night sweats.

### `key_features` [CANONICAL_NOW]
- active vs latent distinction
- airborne infection-control implications
- reportable disease
- sputum/culture/molecular testing

### `red_flags` [CANONICAL_NOW]
Suspected infectious pulmonary TB requires prompt isolation/public-health/medical pathway; hemoptysis, respiratory compromise or CNS TB symptoms are urgent.

### `diagnosis_methods` [CANONICAL_NOW]
TB blood/skin test indicates infection but does not alone diagnose active disease; chest imaging and sputum smear/culture/molecular tests evaluate disease.

### `differential_diagnosis` [CANONICAL_NOW]
- pneumonia
- lung cancer
- fungal infection
- sarcoidosis
- latent TB

### `western_treatment` [CANONICAL_NOW]
Multi-drug antimicrobial therapy under public-health/clinical guidance; adherence and resistance testing are critical.

### `acupuncture_role` [CANONICAL_NOW]
Do not provide routine in-person acupuncture to potentially contagious pulmonary TB without proper infection-control/public-health management.

## Proposed relations [DERIVED_RELATION]
- cough/fever/weight_loss endpoints
- latent_TB identity boundary

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- CDC — Clinical Overview of Tuberculosis Disease — https://www.cdc.gov/tb/hcp/clinical-overview/tuberculosis-disease.html
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should latent TB infection be a separate non-disease state card?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 04. Lyme Disease · 萊姆病

## Identity
```yaml
candidate_id: cond.lyme_disease
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Lyme disease is a bacterial infection transmitted by infected blacklegged ticks; untreated infection can involve skin, joints, heart and nervous system.

### `clinical_definition` [CANONICAL_NOW]
Erythema migrans in an appropriate exposure context can be diagnostic; nonspecific chronic symptoms alone do not establish Lyme disease.

### `etiology` [CANONICAL_NOW]
In the U.S., mainly Borrelia burgdorferi and rarely B. mayonii transmitted by Ixodes ticks.

### `pathophysiology` [CANONICAL_NOW]
Local infection can disseminate through blood/tissues and trigger neurologic, cardiac or joint manifestations.

### `presentation_clinical` [CANONICAL_NOW]
Fever, headache, fatigue and erythema migrans early; later facial palsy, meningitis/radicular pain, carditis/heart block or arthritis.

### `key_features` [CANONICAL_NOW]
- tick-borne
- erythema migrans high-yield
- two-step serology for indicated testing
- neurologic/cardiac complications

### `red_flags` [CANONICAL_NOW]
Syncope/palpitations with heart block, meningitis symptoms, severe neurologic deficits or major systemic illness requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical diagnosis for classic EM; otherwise CDC-recommended two-step serology plus organ-specific evaluation.

### `differential_diagnosis` [CANONICAL_NOW]
- cellulitis/tinea for rash
- Bell palsy other causes
- viral syndrome
- RA
- other tick-borne disease

### `western_treatment` [CANONICAL_NOW]
Appropriate oral or IV antibiotics based on manifestation; early treatment prevents many complications.

### `acupuncture_role` [CANONICAL_NOW]
Do not substitute herbs/acupuncture for antibiotics. Facial palsy still needs stroke differential; carditis symptoms need cardiac evaluation.

## Proposed relations [DERIVED_RELATION]
- Bell palsy differential/complication
- joint/neuro/cardiac contexts

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- CDC — About Lyme Disease — https://www.cdc.gov/lyme/about/index.html
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

# 05. HIV Infection · 人類免疫缺乏病毒感染

## Identity
```yaml
candidate_id: cond.hiv_infection
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
HIV is a chronic viral infection that attacks the immune system; untreated infection can progress to AIDS, while effective antiretroviral therapy can suppress viral replication and preserve health.

### `clinical_definition` [CANONICAL_NOW]
HIV infection and AIDS/stage 3 disease are related but not interchangeable identities.

### `etiology` [CANONICAL_NOW]
Transmission occurs through specific body fluids, including sexual, blood and perinatal routes.

### `pathophysiology` [CANONICAL_NOW]
HIV infects and depletes CD4 immune cells, impairing host defense and increasing opportunistic disease risk when uncontrolled.

### `presentation_clinical` [CANONICAL_NOW]
Acute infection may cause flu-like illness or no symptoms; chronic infection can remain asymptomatic for years.

### `key_features` [CANONICAL_NOW]
- testing is required to know status
- ART for all diagnosed people
- viral suppression prevents sexual transmission
- opportunistic risk depends on immune status

### `red_flags` [CANONICAL_NOW]
Severe opportunistic infection, neurologic symptoms, respiratory compromise or advanced immunosuppression complications need urgent specialty care.

### `diagnosis_methods` [CANONICAL_NOW]
CDC HIV antigen/antibody and supplemental testing algorithms; viral load and CD4 monitor treatment/disease.

### `differential_diagnosis` [CANONICAL_NOW]
- other acute viral illnesses
- primary immunodeficiency
- medication-related cytopenia

### `western_treatment` [CANONICAL_NOW]
Start and maintain combination antiretroviral therapy; prevent/treat opportunistic infections and address preventive care.

### `acupuncture_role` [CANONICAL_NOW]
Use standard precautions universally; HIV status alone is not a reason to refuse care. Coordinate around immune status, neuropathy and medication interactions.

## Proposed relations [DERIVED_RELATION]
- TB/opportunistic infection context
- peripheral neuropathy relation

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- CDC — About HIV — https://www.cdc.gov/hiv/about/index.html
- CDC — Treating HIV — https://www.cdc.gov/hiv/treatment/index.html
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

# 06. Herpes Zoster (Shingles) · 帶狀皰疹

## Identity
```yaml
candidate_id: cond.herpes_zoster
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Herpes zoster is reactivation of latent varicella-zoster virus causing a painful usually unilateral dermatomal rash and possible neurologic/ocular complications.

### `clinical_definition` [CANONICAL_NOW]
Shingles is reactivation, not new acquisition of shingles from another person; exposed susceptible people can develop chickenpox.

### `etiology` [CANONICAL_NOW]
Reactivation risk increases with age and immunosuppression.

### `pathophysiology` [CANONICAL_NOW]
Latent VZV in sensory ganglia reactivates and travels along sensory nerves to skin, causing neuritis and vesicular eruption.

### `presentation_clinical` [CANONICAL_NOW]
Pain, burning/tingling followed by grouped vesicular dermatomal rash; postherpetic neuralgia can persist.

### `key_features` [CANONICAL_NOW]
- dermatomal painful rash
- postherpetic neuralgia common complication
- ophthalmic involvement threatens vision
- vaccination preventive

### `red_flags` [CANONICAL_NOW]
Eye/forehead involvement, disseminated disease, severe immunosuppression, neurologic deficits or visceral involvement needs urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Usually clinical; PCR testing when atypical.

### `differential_diagnosis` [CANONICAL_NOW]
- HSV
- contact dermatitis
- cellulitis
- radiculopathy before rash
- insect bites

### `western_treatment` [CANONICAL_NOW]
Early antiviral therapy for indicated patients, pain control and complication management; vaccination prevents disease/complications.

### `acupuncture_role` [CANONICAL_NOW]
Do not needle through active vesicles; use infection-control precautions and urgent ophthalmology for eye involvement.

## Proposed relations [DERIVED_RELATION]
- tdis.she_chuan_chuang strong contextual
- postherpetic_neuralgia

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- CDC — About Shingles — https://www.cdc.gov/shingles/about/index.html
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

# 07. Syphilis · 梅毒

## Identity
```yaml
candidate_id: cond.syphilis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Syphilis is a systemic sexually transmitted infection caused by Treponema pallidum that progresses through primary, secondary, latent and tertiary stages if untreated.

### `clinical_definition` [CANONICAL_NOW]
Stage determines presentation, treatment duration and follow-up; neurosyphilis, ocular syphilis and otosyphilis can occur.

### `etiology` [CANONICAL_NOW]
Sexual transmission and vertical transmission during pregnancy; caused by T. pallidum.

### `pathophysiology` [CANONICAL_NOW]
Spirochetes disseminate systemically and can persist latently, later injuring nervous, cardiovascular and other tissues.

### `presentation_clinical` [CANONICAL_NOW]
Primary painless chancre; secondary rash including palms/soles and systemic symptoms; latent asymptomatic; tertiary neurologic/cardiovascular/gummatous disease.

### `key_features` [CANONICAL_NOW]
- staged STI
- serologic testing
- curable with penicillin
- neuro/ocular/otic involvement may occur at any stage

### `red_flags` [CANONICAL_NOW]
Neurologic deficits, vision loss, sudden hearing loss, pregnancy/congenital risk or tertiary cardiovascular disease requires prompt specialty care.

### `diagnosis_methods` [CANONICAL_NOW]
Serologic testing and direct lesion testing in selected cases; CSF/ocular/auditory assessment when indicated.

### `differential_diagnosis` [CANONICAL_NOW]
- other genital ulcers
- viral exanthem
- autoimmune rash
- other causes of neuro/ocular disease

### `western_treatment` [CANONICAL_NOW]
Penicillin regimen depends on stage/manifestation; partners, pregnancy and follow-up testing require guideline-directed care.

### `acupuncture_role` [CANONICAL_NOW]
Do not treat infectious lesions directly. Maintain STI confidentiality, referral and standard precautions.

## Proposed relations [DERIVED_RELATION]
- rash/hearing_loss/visual_loss/neuro endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- CDC — About Syphilis — https://www.cdc.gov/syphilis/about/index.html
- CDC — Syphilis Treatment Guidelines — https://www.cdc.gov/std/treatment-guidelines/syphilis.htm
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
