# TCM Disease Research Batch D - Respiratory / ENT

**Date:** 2026-08-09  
**Status:** COMPLETE STAGING BATCH  
**Identities:** 8  
**Identity authority:** CURRENT `data/pathology/tdis_registry.json` as documented in the supplied audit pack.  
**Important:** every `tdis.*` identity below was already registered in the supplied source pack. This file enriches existing identities; it does not create new TCM Disease IDs.

## Batch source policy

```yaml
identity_and_current_id:
  authority: CURRENT_REPO_VERIFIED_IN_SUPPLIED_AUDIT_PACK

pattern_ids:
  authority: CURRENT_PATTERN_REGISTRY_OR_CANONICAL_REVIEW_VERIFIED_IN_SUPPLIED_AUDIT

TCM_mechanism_text:
  status: RESEARCH_STAGING
  rule: approved disease-specific TCM/classical source recheck required before canonical ingestion

western_associations:
  status: STAGING_ONLY
  rule: association_not_equivalence

biomedical_safety:
  sources:
    - NIH / NHLBI
    - NIDCD
    - NLM / MedlinePlus
  rule: biomedical safety can constrain a TCM card, but does not define its TCM mechanism
```

Major ontology guardrail:

```text
TCM Disease != Western Condition != Pattern != Symptom
```

---

# 01. `tdis.gan_mao` - 感冒 / Common Cold-Type TCM Disease

## Identity

```yaml
id: tdis.gan_mao
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_BECAUSE_EXPECTED_TDIS_LIBRARY_PATH_IS_MISSING
name_zh: 感冒
name_en: Common Cold-Type TCM Disease
pinyin: Ganmao
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]

Traditional TCM disease identity for an acute externally contracted respiratory illness with nasal/throat and systemic manifestations. It should not be equated one-to-one with a single virus, the Western common cold, influenza, COVID-19, streptococcal pharyngitis or bacterial sinusitis.

## `bing_yin` / `bing_ji` staging

Candidate mechanism families include external Wind-Cold and Wind-Heat affecting the Lung and Defensive Qi. Disease-specific source extraction is required before final canonical wording.

## `zheng_hou` staging

High-value manifestations include:

```text
acute onset
aversion to cold or chills
fever when present
nasal congestion or rhinorrhea
sneezing
sore throat
cough
headache or body aches
fatigue
```

These are staging concepts, not automatic permission to mint every item as `sym.*`.

## Pattern candidates [DERIVED_RELATION]

```yaml
- pattern.wind_cold_invading_lung
- pattern.wind_heat_invading_lung
```

## Western associations [DERIVED_RELATION]

```yaml
- common_cold
  endpoint: IDENTITY_CHECK_REQUIRED
  relation: STRONG_CLINICAL_ASSOCIATION
  identity_equality: false

- viral_upper_respiratory_infection
  endpoint: IDENTITY_CHECK_REQUIRED
  relation: COMMON_TCM_PRESENTATION
  identity_equality: false

- influenza
  endpoint: UNKNOWN_NEEDS_CANONICAL_SCAN
  relation: DIFFERENTIAL_CONTEXT

- COVID_19
  endpoint: UNKNOWN_NEEDS_CANONICAL_SCAN
  relation: DIFFERENTIAL_CONTEXT

- streptococcal_pharyngitis
  endpoint: UNKNOWN_NEEDS_CANONICAL_SCAN
  relation: DIFFERENTIAL_CONTEXT
```

## Symptom endpoints

```yaml
- id: sym.fever
  endpoint: RECONCILE_EXISTING_REFERENCE
- concept: cough
  endpoint: MISSING_ENDPOINT_CANDIDATE
- concept: nasal_congestion
  endpoint: MISSING_ENDPOINT_CANDIDATE
- concept: rhinorrhea
  endpoint: MISSING_ENDPOINT_CANDIDATE
- concept: sore_throat
  endpoint: MISSING_ENDPOINT_CANDIDATE
- id: sym.headache
  endpoint: EXISTS
- id: sym.fatigue
  endpoint: EXISTS
```

## Biomedical safety context

MedlinePlus describes the common cold as a usually mild viral upper-respiratory infection, but similar symptoms can occur in other infectious diseases. High fever, respiratory distress, dehydration, altered mental status, serious comorbidity or a clinically concerning course should not be reduced to an ordinary 感冒 label.

## Open questions

```text
1. Which current Western URI/common-cold/influenza identities already exist?
2. Should `sym.rhinorrhea` and `sym.nasal_congestion` be separate reusable endpoints?
3. Which approved TCM source should define the exact traditional boundary between 感冒 and other externally contracted disease names?
```

## Provenance

```yaml
- CURRENT supplied tdis_registry audit
- CURRENT supplied Pattern registry/canonical review
- MedlinePlus - Common Cold
  url: https://medlineplus.gov/commoncold.html
- MedlinePlus Medical Encyclopedia - Common cold
  url: https://medlineplus.gov/ency/article/000678.htm
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 2
western_associations: 5
symptom_candidates_or_existing: 7
canonical_write_authorized: false
```

---

# 02. `tdis.ke_sou` - 咳嗽 / Cough

## Identity

```yaml
id: tdis.ke_sou
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_PATH_MISMATCH
name_zh: 咳嗽
name_en: Cough
pinyin: Kesou
family_candidate: 内科
```

## Disease scope

TCM disease-level identity centered on cough. It must remain distinct from a symptom endpoint `cough` and from Western causes such as URI, asthma, COPD, pneumonia, GERD, medication effect or lung cancer.

## Mechanism staging

Candidate differentiation families include external Wind-Cold/Wind-Heat, phlegm-damp, phlegm-heat, Lung Qi deficiency and Lung Yin deficiency. Final `bing_yin` and `bing_ji` require approved source verification.

## Manifestation staging

```text
cough frequency and duration
dry versus productive cough
sputum amount/color when present
wheeze or dyspnea
fever
chest pain
hemoptysis
relation to meals/supine position
nighttime or exertional pattern
```

## Pattern candidates

```yaml
- pattern.wind_cold_invading_lung
- pattern.wind_heat_invading_lung
- pattern.phlegm_damp_in_lung
- pattern.phlegm_heat_in_lung
- pattern.lung_qi_deficiency
- pattern.lung_yin_deficiency
```

## Western associations

```text
viral URI / common cold
asthma
COPD
pneumonia
GERD
postnasal-drip / upper-airway cough context
medication-related cough
other pulmonary disease
```

All are contextual associations; none equals 咳嗽.

## Symptom endpoints

```yaml
- cough: MISSING_ENDPOINT_CANDIDATE
- sputum: GRANULARITY_REVIEW
- wheeze: MISSING_ENDPOINT_CANDIDATE
- dyspnea: MISSING_ENDPOINT_CANDIDATE
- fever: RECONCILE_EXISTING_REFERENCE
- chest_pain: MISSING_ENDPOINT_CANDIDATE
- hemoptysis: MISSING_ENDPOINT_CANDIDATE
```

## Biomedical safety context

Cough accompanied by marked dyspnea, hypoxia, hemoptysis, severe chest pain, altered mental status or other emergency features requires biomedical evaluation. Chronic cough also requires cause assessment rather than indefinite symptom-only treatment.

## Provenance

```yaml
- CURRENT supplied TDIS registry audit
- CURRENT supplied Pattern registry/review
- NHLBI asthma resources for asthma symptom context
- MedlinePlus common-cold resources for acute URI cough context
```

## Open questions

```text
1. Which cough-causing Western conditions are already canonical?
2. Should sputum characteristics be structured qualifiers rather than separate symptom IDs?
3. Which shared cough red-flag object should be reused across TDIS and Western cards?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 6
western_association_clusters: 8
symptom_candidates: 7
canonical_write_authorized: false
```

---

# 03. `tdis.xiao_bing` - 哮病 / Wheezing-Asthma TCM Disease

## Identity

```yaml
id: tdis.xiao_bing
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_PATH_MISMATCH
name_zh: 哮病
name_en: Wheezing-Asthma TCM Disease
pinyin: Xiaobing
family_candidate: 内科
```

## Disease scope

Traditional TCM disease identity characterized by recurrent wheezing and breathing difficulty. It has strong clinical overlap with asthma but is not a biomedical synonym and should not be used to bypass pulmonary diagnosis.

## Mechanism staging

Phlegm obstructing the Lung is a recurring traditional disease-mechanism family, with cold/heat expressions during attacks and Lung/Spleen/Kidney deficiency contexts in chronic or recurrent disease. Exact disease-specific wording requires approved TCM source extraction.

## Manifestation staging

```text
episodic wheezing
shortness of breath
chest tightness
cough
recurrent attacks
trigger pattern
night or early-morning worsening
```

## Pattern candidates

```yaml
- pattern.phlegm_damp_in_lung
- pattern.phlegm_heat_in_lung
- pattern.lung_qi_deficiency
- pattern.spleen_qi_deficiency
- pattern.kidney_not_grasping_qi
```

## Western associations

```yaml
- asthma
  endpoint: IDENTITY_CHECK_REQUIRED
  relation: STRONG_CLINICAL_ASSOCIATION
  identity_equality: false

- cond.copd
  endpoint: EXISTS
  relation: DIFFERENTIAL_CONTEXT
  identity_equality: false

- anaphylaxis
  endpoint: UNKNOWN_NEEDS_CANONICAL_SCAN
  relation: EMERGENCY_DIFFERENTIAL_CONTEXT

- heart_failure
  endpoint: IDENTITY_CHECK_REQUIRED_OR_BATCH_B_STAGING
  relation: DIFFERENTIAL_CONTEXT
```

## Symptom endpoints

```yaml
- wheeze: MISSING_ENDPOINT_CANDIDATE
- dyspnea: MISSING_ENDPOINT_CANDIDATE
- cough: MISSING_ENDPOINT_CANDIDATE
- chest_tightness: MISSING_ENDPOINT_CANDIDATE
```

## Biomedical safety context

NHLBI describes asthma as a chronic condition with wheeze, cough, shortness of breath and chest tightness; diagnosis uses history plus objective lung-function testing when appropriate. Severe respiratory distress, inability to speak normally, cyanosis, altered mental status or poor response to rescue therapy requires urgent/emergency management. 哮病 must never become a shortcut around an asthma action plan or emergency evaluation.

## Provenance

```yaml
- CURRENT supplied TDIS registry audit
- CURRENT supplied Pattern registry/review
- NHLBI - Asthma Symptoms
  url: https://www.nhlbi.nih.gov/health/asthma/symptoms
- NHLBI - Asthma Diagnosis
  url: https://www.nhlbi.nih.gov/health/asthma/diagnosis
- NHLBI - Asthma Treatment and Action Plan
  url: https://www.nhlbi.nih.gov/health/asthma/treatment-action-plan
```

## Open questions

```text
1. Does the current Western Condition library already contain asthma and which asthma subtypes?
2. Should asthma action-plan status live in a longitudinal/safety layer rather than on the generic disease card?
3. How should 哮病 and 喘證 co-occur without making them aliases?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 5
western_associations: 4
symptom_candidates: 4
canonical_write_authorized: false
```

---

# 04. `tdis.chuan_zheng` - 喘證 / Dyspnea-Breathlessness TCM Disease

## Identity

```yaml
id: tdis.chuan_zheng
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_PATH_MISMATCH
name_zh: 喘證
name_en: Dyspnea-Breathlessness TCM Disease
pinyin: Chuanzheng
family_candidate: 内科
```

## Disease scope

TCM disease identity for prominent breathlessness, difficult breathing or panting presentations. It is broader than asthma and must remain distinct from the symptom endpoint dyspnea and from specific Western diseases.

## Mechanism staging

Candidate traditional pathways include Lung Qi failure, phlegm obstruction and Kidney failure to grasp Qi, with excess and deficiency presentations. Exact mechanism text requires approved disease-specific TCM sources.

## Pattern candidates

```yaml
- pattern.lung_qi_deficiency
- pattern.phlegm_damp_in_lung
- pattern.phlegm_heat_in_lung
- pattern.kidney_not_grasping_qi
- pattern.kidney_yang_deficiency
```

## Western associations / differential context

```text
asthma
COPD
pneumonia
heart failure
pulmonary embolism
pneumothorax
anemia
metabolic/acidosis contexts
anxiety/panic presentations
```

None is an identity match.

## Symptom endpoints

```yaml
- dyspnea: MISSING_ENDPOINT_CANDIDATE
- wheeze: MISSING_ENDPOINT_CANDIDATE
- cough: MISSING_ENDPOINT_CANDIDATE
- chest_pain: MISSING_ENDPOINT_CANDIDATE
- cyanosis: SIGN_OR_OBSERVATION_REVIEW
```

## Biomedical safety context

Acute dyspnea is a high-value emergency gateway. The supplied Western Batch D specifically identifies PE and pneumothorax as dangerous dyspnea/chest-pain conditions; COPD and asthma also require biomedical severity assessment. Acupuncture should not delay emergency evaluation in unstable respiratory presentations.

## Open questions

```text
1. Should one shared dyspnea safety object connect asthma, COPD, PE, pneumothorax, HF, anemia and 喘證?
2. How should breathing rate and oxygen saturation be modeled as measurements rather than `sym.*` identities?
3. Which approved TCM source defines the disease-level boundary between 哮病 and 喘證?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 5
western_differential_clusters: 9
symptom_candidates: 5
canonical_write_authorized: false
```

---

# 05. `tdis.bi_qiu` - 鼻鼽 / Allergic-Rhinitis-Type TCM Disease

## Identity

```yaml
id: tdis.bi_qiu
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_PATH_MISMATCH
name_zh: 鼻鼽
name_en: Biqiu / Allergic-Rhinitis-Type TCM Disease
pinyin: Biqiu
family_candidate: 五官
```

## Disease scope

TCM disease identity characterized by recurrent sneezing and clear nasal discharge/congestion presentations. It has a strong clinical association with allergic rhinitis but is not universally equivalent to it.

## Mechanism staging

Candidate mechanisms include Lung Qi/Defensive Qi weakness with external Wind, and Spleen/Kidney deficiency contexts in recurrent disease. Final disease-specific mechanism and exact Pattern mapping require approved source verification.

## Pattern candidates

```yaml
- pattern.wind_cold_invading_lung
- pattern.lung_qi_deficiency
- pattern.spleen_qi_deficiency
- pattern.kidney_yang_deficiency
```

## Western associations

```yaml
- cond.allergic-rhinitis
  endpoint: EXISTS
  relation: STRONG_CLINICAL_ASSOCIATION
  identity_equality: false

- common_cold
  endpoint: IDENTITY_CHECK_REQUIRED
  relation: DIFFERENTIAL_CONTEXT

- nonallergic_rhinitis
  endpoint: UNKNOWN_NEEDS_CANONICAL_SCAN
  relation: DIFFERENTIAL_CONTEXT
```

## Symptom endpoints

```yaml
- sneezing: MISSING_ENDPOINT_CANDIDATE
- rhinorrhea: MISSING_ENDPOINT_CANDIDATE
- nasal_congestion: MISSING_ENDPOINT_CANDIDATE
- nasal_itching: MISSING_ENDPOINT_CANDIDATE
- itchy_watery_eyes: GRANULARITY_REVIEW
```

## Biomedical context

MedlinePlus describes allergic rhinitis as nasal symptoms triggered by inhaled allergens such as pollen, dust mites or animal dander. Allergy may also involve ocular symptoms and asthma. Fever or marked systemic illness should trigger consideration of other diagnoses rather than being assumed to be allergic rhinitis.

## Provenance

```yaml
- CURRENT supplied TDIS registry audit
- CURRENT supplied Pattern registry/review
- MedlinePlus - Allergic rhinitis self-care
  url: https://medlineplus.gov/ency/patientinstructions/000547.htm
- MedlinePlus - Allergy
  url: https://medlineplus.gov/allergy.html
```

## Open questions

```text
1. Which exact relation direction should author `cond.allergic-rhinitis` <-> `tdis.bi_qiu`?
2. Should ocular allergy symptoms be separate symptom endpoints or modifiers under an allergy cluster?
3. Which TCM source best distinguishes 鼻鼽 from 鼻淵?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 4
western_associations: 3
symptom_candidates: 5
canonical_write_authorized: false
```

---

# 06. `tdis.bi_yuan` - 鼻淵 / Chronic Purulent-Rhinorrhea-Sinus TCM Disease

## Identity

```yaml
id: tdis.bi_yuan
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_PATH_MISMATCH
name_zh: 鼻淵
name_en: Biyuan / Sinus-Nasal Discharge TCM Disease
pinyin: Biyuan
family_candidate: 五官
```

## Disease scope

Traditional TCM disease identity associated with persistent or recurrent nasal obstruction/discharge and sinus-region complaints. It can clinically overlap rhinosinusitis but should not be treated as a one-to-one synonym for acute bacterial sinusitis.

## Mechanism staging

Candidate mechanism families include Wind-Heat or heat affecting the Lung/nasal orifices, phlegm-heat and damp-heat-type presentations. Exact traditional differentiation requires approved ENT TCM source verification.

## Pattern candidates that currently resolve

```yaml
- pattern.wind_heat_invading_lung
- pattern.phlegm_heat_in_lung
```

Potential disease-specific heat/damp phrases that do not cleanly match the current Pattern registry must remain source phrases and not become new Pattern IDs in this batch.

## Western associations

```text
acute viral rhinosinusitis
acute bacterial rhinosinusitis
chronic rhinosinusitis
nasal polyps
allergic rhinitis
dental or structural contributors
```

## Symptom endpoints

```yaml
- nasal_congestion: MISSING_ENDPOINT_CANDIDATE
- rhinorrhea: MISSING_ENDPOINT_CANDIDATE
- purulent_nasal_discharge: GRANULARITY_REVIEW
- facial_pain_or_pressure: MISSING_ENDPOINT_CANDIDATE
- reduced_smell: MISSING_ENDPOINT_CANDIDATE
- fever: RECONCILE_EXISTING_REFERENCE
```

## Biomedical safety context

Severe facial/orbital swelling, visual symptoms, severe headache, neurologic change or systemic toxicity can indicate complications and should not be managed as ordinary 鼻淵. Antibiotic decisions belong to biomedical diagnostic criteria rather than the TCM disease card.

## Open questions

```text
1. Which rhinosinusitis identities exist in the current 150-card condition library?
2. Should facial pressure be one symptom endpoint shared with facial pain, or remain distinct?
3. Which source-backed TCM Pattern phrases map cleanly to the current registry without creating duplicates?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates_resolving_now: 2
western_association_clusters: 6
symptom_candidates: 6
canonical_write_authorized: false
```

---

# 07. `tdis.ru_e` - 乳蛾 / Tonsil-Throat TCM Disease

## Identity

```yaml
id: tdis.ru_e
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_PATH_MISMATCH
name_zh: 乳蛾
name_en: Rue / Tonsil-Throat TCM Disease
pinyin: Rue
family_candidate: 五官
```

## Disease scope

TCM ENT disease identity centered on tonsillar/throat swelling and pain presentations. It may overlap viral pharyngitis, streptococcal pharyngitis or tonsillitis but does not establish the infectious cause.

## Mechanism staging

Candidate traditional pathways include external Wind-Heat and heat/fire affecting the Lung/Stomach/throat. Exact mechanism and disease differentiation require approved TCM ENT sources.

## Pattern candidates

```yaml
- pattern.wind_heat_invading_lung
- pattern.stomach_fire
```

## Western associations

```text
viral pharyngitis
streptococcal pharyngitis
acute tonsillitis
peritonsillar abscess differential
infectious mononucleosis differential
```

## Symptom endpoints

```yaml
- sore_throat: MISSING_ENDPOINT_CANDIDATE
- odynophagia: MISSING_ENDPOINT_CANDIDATE
- tonsillar_swelling: SIGN_OR_OBSERVATION_REVIEW
- fever: RECONCILE_EXISTING_REFERENCE
- cervical_lymph_node_tenderness: SIGN_OR_OBSERVATION_REVIEW
```

## Biomedical safety context

Drooling, stridor, respiratory distress, severe trismus, muffled voice, neck swelling, dehydration or inability to swallow secretions require urgent evaluation for potentially serious airway/deep-neck processes. TCM disease labeling must not conceal an airway emergency.

## Open questions

```text
1. Which Western pharyngitis/tonsillitis identities exist?
2. Should tonsillar findings live in a physical-exam/sign layer rather than symptoms?
3. Can a shared throat/airway red-flag object serve this TDIS plus Western ENT cards?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 2
western_differential_clusters: 5
symptom_or_sign_candidates: 5
canonical_write_authorized: false
```

---

# 08. `tdis.er_ming_er_long` - 耳鳴耳聾 / Tinnitus and Hearing Loss

## Identity

```yaml
id: tdis.er_ming_er_long
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_PATH_MISMATCH
name_zh: 耳鳴耳聾
name_en: Tinnitus and Hearing Loss
pinyin: Erming Erlong
family_candidate: 五官
```

## Disease scope

Traditional TCM disease identity covering tinnitus and impaired hearing presentations. It must not be equated to one Western diagnosis. Tinnitus is a symptom/perceptual phenomenon, while hearing loss has conductive, sensorineural, mixed, sudden, chronic, noise-related, age-related and disease-specific causes.

## Mechanism staging

Candidate traditional mechanism families include Kidney Essence/Yin deficiency, Liver Yang/Fire and phlegm obstruction depending presentation. Exact disease-specific source verification is required.

## Pattern candidates

```yaml
- pattern.kidney_essence_deficiency
- pattern.kidney_yin_deficiency
- pattern.liver_yang_rising
- pattern.liver_fire
```

## Western associations

```text
tinnitus
age-related hearing loss
noise-induced hearing loss
sudden sensorineural hearing loss
Ménière disease
ear infection / middle-ear disease
cerumen obstruction
vestibular schwannoma and other structural causes
medication ototoxicity
```

No single association equals the TCM disease identity.

## Symptom endpoints

```yaml
- tinnitus: MISSING_ENDPOINT_CANDIDATE
- hearing_loss: MISSING_ENDPOINT_CANDIDATE
- ear_fullness: MISSING_ENDPOINT_CANDIDATE
- dizziness: MISSING_ENDPOINT_CANDIDATE
```

## Biomedical safety context

NIDCD states that sudden sensorineural hearing loss is a medical emergency and that delaying diagnosis/treatment can reduce treatment effectiveness. Sudden unilateral hearing loss, particularly with tinnitus, dizziness or ear fullness, should not be treated as an ordinary chronic 耳鳴耳聾 presentation. Pulsatile tinnitus can also require structural/vascular evaluation.

## Provenance

```yaml
- CURRENT supplied TDIS registry audit
- CURRENT supplied Pattern registry/review
- NIDCD - Tinnitus
  url: https://www.nidcd.nih.gov/health/tinnitus
- NIDCD - Sudden Sensorineural Hearing Loss
  url: https://www.nidcd.nih.gov/health/sudden-deafness
- NIDCD - Ménière's Disease
  url: https://www.nidcd.nih.gov/health/menieres-disease
- NIDCD - Noise-Induced Hearing Loss
  url: https://www.nidcd.nih.gov/health/noise-induced-hearing-loss
- NIDCD - Age-Related Hearing Loss
  url: https://www.nidcd.nih.gov/health/age-related-hearing-loss
```

## Open questions

```text
1. Should TDIS retain one combined 耳鳴耳聾 identity while Western/symptom layers split tinnitus and hearing loss?
2. Which current Western hearing-loss and Ménière identities already exist?
3. Should sudden sensorineural hearing loss be a separate P0 Western Condition card in a future batch?
4. Should pulsatile tinnitus have a high-priority vascular differential relation?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 4
western_association_clusters: 9
symptom_candidates: 4
canonical_write_authorized: false
```

---

# 9. Batch-wide safety clusters

```yaml
acute_respiratory_distress:
  tdis:
    - tdis.xiao_bing
    - tdis.chuan_zheng
    - tdis.ke_sou
  western_context:
    - asthma
    - cond.copd
    - pulmonary_embolism
    - pneumothorax
    - pneumonia
    - heart_failure
  endpoint_candidates:
    - dyspnea
    - wheeze
    - chest_pain
    - cyanosis
  rule:
    - TCM_label_does_not_suppress_emergency_triage

acute_upper_airway:
  tdis:
    - tdis.ru_e
  endpoint_candidates:
    - sore_throat
    - odynophagia
    - drooling
    - stridor
  rule:
    - airway_red_flags_require_biomedical_emergency_evaluation

sudden_hearing_loss:
  tdis:
    - tdis.er_ming_er_long
  endpoint_candidates:
    - hearing_loss
    - tinnitus
    - dizziness
    - ear_fullness
  rule:
    - sudden_sensorineural_hearing_loss_is_time_sensitive_and_not_routine_TCM_only_care
```

---

# 10. Batch content accounting

```yaml
tdis_research_entries: 8
identity_duplicates_created: 0
pattern_ids_created: 0
western_identity_equalities_asserted: 0
new_symptom_ids_authorized: 0
canonical_write_authorized: false
```
