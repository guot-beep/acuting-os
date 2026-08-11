# TCM Disease Research Batch A - Head / Shen / Heart-Chest

**Date:** 2026-08-09  
**Status:** COMPLETE STAGING BATCH  
**Identities:** 5  
**Identity authority:** CURRENT `data/pathology/tdis_registry.json`  
**Important:** every ID in this batch is already registered. This file enriches; it does not create identities.

## Batch source policy

```yaml
identity_and_current_id: CURRENT_REPO_VERIFIED
pattern_ids: CURRENT_PATTERN_REGISTRY_OR_CANONICAL_REVIEW_VERIFIED
TCM_mechanism_text: RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK
western_associations: STAGING_ONLY
safety_logic: must be verified from biomedical authority before canonical write
```

Legacy Pattern research packs are used as discovery/provenance inputs. Current repo contract wins.

---

# 01. `tdis.tou_tong` - 頭痛 / Headache

## Identity [CANONICAL_NOW]

```yaml
id: tdis.tou_tong
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_BECAUSE_EXPECTED_TDIS_LIBRARY_PATH_IS_MISSING
name_zh: 頭痛
name_en: Headache
pinyin: Toutong
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]

TCM disease-level identity for headache presentations. It should remain distinct from the biomedical headache diagnosis family and from the symptom endpoint `sym.headache`. One surface word can exist at multiple ontology levels without becoming the same entity.

## `bing_yin` / `bing_ji` staging

Research synthesis indicates that headache differentiation can involve external pathogenic factors, Liver Yang/Fire/Wind, phlegm, blood stasis or deficiency mechanisms. These are candidate Pattern pathways, not mandatory disease mechanisms. Final wording requires approved TCM source extraction.

## `zheng_hou` staging

Core manifestation is head pain. High-value differentiators to preserve in source staging include:

```text
location
quality
onset
frequency/chronicity
relation to stress/menstruation/food/sleep
nausea or vomiting
visual features
neurologic features
neck symptoms
```

Do not turn all of these into canonical `sym.*` automatically.

## Pattern candidates [DERIVED_RELATION]

```yaml
- pattern.liver_yang_rising
- pattern.liver_fire
- pattern.liver_wind
- pattern.blood_stasis
```

Confidence: medium until disease-specific TCM sources are attached.

## Western associations [DERIVED_RELATION]

```yaml
- cond.migraine
  endpoint: EXISTS
  relation: COMMON_TCM_PRESENTATION
  identity_equality: false
- tension-type headache
  endpoint: UNKNOWN_NEEDS_CANONICAL_SCAN
- cluster headache
  endpoint: UNKNOWN_NEEDS_CANONICAL_SCAN
- secondary headache causes
  relation: DIFFERENTIAL_CONTEXT
```

## Symptom endpoints

```yaml
- sym.headache: EXISTS
- nausea: MISSING_ENDPOINT_CANDIDATE
- photophobia: MISSING_ENDPOINT_CANDIDATE
- visual_disturbance: MISSING_ENDPOINT_CANDIDATE
- dizziness: MISSING_ENDPOINT_CANDIDATE
```

## Differential TCM disease identities

- `tdis.xuan_yun` when dizziness/vertigo rather than pain is the dominant complaint.
- `tdis.zhong_feng` when acute focal neurologic deficit suggests a stroke-related disease context.

## Provenance

```yaml
- CURRENT data/pathology/tdis_registry.json
- CURRENT Pattern registry / PATTERN_V2_CODEX_CANONICAL_REVIEW.md
- LEGACY_RESEARCH: TCM Pattern expansion packs, reverify disease-specific source before ingest
```

## Open questions

```text
1. Is 頭風 an alias/historical term within `tdis.tou_tong`, a subtype, or source-only terminology?
2. Which exact Western headache subtype identities are already canonical?
3. Which symptom granularity should be normalized first for migraine/headache study?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 4
western_associations: 4
symptom_candidates: 5
canonical_write_authorized: false
```

---

# 02. `tdis.xuan_yun` - 眩暈 / Dizziness

## Identity [CANONICAL_NOW]

```yaml
id: tdis.xuan_yun
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_BECAUSE_EXPECTED_TDIS_LIBRARY_PATH_IS_MISSING
name_zh: 眩暈
name_en: Dizziness
pinyin: Xuanyun
family_candidate: 内科
```

## Disease scope / `summary`

TCM disease identity for dizziness/vertigo-type presentations. It must not be equated with the biomedical symptom “dizziness” or a single Western diagnosis such as BPPV, Ménière disease, anemia or POTS.

## Mechanism staging

Candidate TCM differentiation families include Liver Yang/Wind, phlegm-dampness, Qi/Blood deficiency and Kidney/Jing deficiency. Disease-specific source verification is required before canonical `bing_yin` / `bing_ji` writing.

## Manifestation staging

The broad complaint can include spinning, lightheadedness, unsteadiness or visual dimness in traditional descriptions. Biomedical evaluation should distinguish true vertigo, presyncope and disequilibrium because their urgent differentials differ.

## Pattern candidates

```yaml
- pattern.liver_yang_rising
- pattern.liver_wind
- pattern.liver_blood_deficiency
- pattern.kidney_essence_deficiency
```

## Western associations

```text
BPPV / peripheral vestibular disease
Ménière disease
vestibular neuritis
POTS
orthostatic hypotension
anemia
arrhythmia
medication effects
stroke/TIA differential
```

All are contextual associations, not identity matches.

## Symptom endpoints

```yaml
- dizziness: MISSING_ENDPOINT_CANDIDATE
- vertigo: GRANULARITY_REVIEW
- presyncope: GRANULARITY_REVIEW
- nausea: MISSING_ENDPOINT_CANDIDATE
- imbalance: MISSING_ENDPOINT_CANDIDATE
```

## Differential TCM diseases

- `tdis.tou_tong` if head pain dominates.
- `tdis.xin_ji` if palpitation/presyncope is the central traditional complaint.
- `tdis.zhong_feng` in acute focal-neurologic disease context.

## Provenance

CURRENT TDIS registry + current Pattern registry/review + biomedical differential staging from Board/clinical sources. TCM mechanism wording needs approved TCM source recheck.

## Open questions

```text
1. Should `sym.*` split dizziness, vertigo and presyncope?
2. Which Western vertigo identities exist in the current 150-card set?
3. Which red-flag rule should be shared across dizziness/vertigo cards?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 4
western_association_clusters: 9
symptom_candidates: 5
canonical_write_authorized: false
```

---

# 03. `tdis.bu_mei` - 不寐 / Insomnia

## Identity

```yaml
id: tdis.bu_mei
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_BECAUSE_EXPECTED_TDIS_LIBRARY_PATH_IS_MISSING
name_zh: 不寐
name_en: Insomnia
pinyin: Bumei
family_candidate: 内科
```

## Disease scope

TCM disease identity for inability to obtain normal restorative sleep. It must remain distinct from the symptom endpoint `sym.insomnia` and the Western biomedical condition `cond.insomnia`.

## Mechanism staging

Research candidates include Heart/Shen disturbance due to deficiency or heat, Heart-Kidney disharmony, Liver constraint/heat, and phlegm/food disturbance. Final disease mechanism should resolve through `pattern_ids` rather than hard-code one mechanism as universal.

## Manifestation staging

```text
difficulty initiating sleep
difficulty maintaining sleep
early awakening
nonrestorative sleep
sleep with vivid dreams/restlessness when source-supported
daytime fatigue or concentration effects
```

Duration and daytime impairment belong primarily to biomedical diagnostic reasoning when linking to Western insomnia.

## Pattern candidates

```yaml
- pattern.heart_kidney_not_communicating
- pattern.heart_blood_deficiency
- pattern.heart_fire
- pattern.liver_qi_stagnation
```

## Western associations

```yaml
- cond.insomnia
  endpoint: EXISTS
  relation: STRONG_CLINICAL_ASSOCIATION
  identity_equality: false
- sleep_apnea
  relation: DIFFERENTIAL_CONTEXT
- restless_legs
  relation: DIFFERENTIAL_CONTEXT
- depression_anxiety
  relation: DIFFERENTIAL_CONTEXT
- medication_substance_effects
  relation: DIFFERENTIAL_CONTEXT
```

## Symptom endpoints

```yaml
- sym.insomnia: EXISTS
- sym.fatigue: EXISTS
```

## Differential TCM diseases

- `tdis.zang_zao` and `tdis.yu_zheng` may overlap emotional/sleep complaints but remain separate disease identities.

## Provenance

CURRENT TDIS registry; current Pattern review; 2026 Board includes sleep disorders. TCM disease-mechanism detail requires approved source verification.

## Open questions

```text
1. Is 失眠 a preferred modern alias for `tdis.bu_mei`?
2. What is the canonical authored direction for `tdis.bu_mei` <-> `cond.insomnia`?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 4
western_associations: 5
symptom_endpoints: 2
canonical_write_authorized: false
```

---

# 04. `tdis.xin_ji` - 心悸 / Palpitations

## Identity

```yaml
id: tdis.xin_ji
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_BECAUSE_EXPECTED_TDIS_LIBRARY_PATH_IS_MISSING
name_zh: 心悸
name_en: Palpitations
pinyin: Xinji
family_candidate: 内科
```

## Disease scope

TCM disease identity centered on awareness of abnormal, forceful or irregular heartbeat. It is not proof of a biomedical arrhythmia.

## Mechanism staging

Candidate mechanisms include Heart Qi/Yang/Blood/Yin deficiency, phlegm-fluid disturbance, fire or blood stasis. These should be expressed as differentiable Pattern relations after source verification, not as one disease mechanism.

## Manifestation staging

```text
awareness of heartbeat
pounding/fluttering sensation
possible fright/anxiety association
possible dizziness or weakness depending pattern
```

Syncope, chest pain, severe dyspnea and sustained tachyarrhythmia are biomedical safety inputs, not ordinary TCM qualifiers.

## Pattern candidates

```yaml
- pattern.heart_qi_deficiency
- pattern.heart_yang_deficiency
- pattern.heart_blood_deficiency
- pattern.heart_yin_deficiency
- pattern.heart_fire
- pattern.blood_stasis
```

## Western associations

```text
arrhythmia
POTS
hyperthyroidism
anemia
anxiety/panic
stimulant or medication effects
```

## Symptom endpoints

```yaml
- palpitations: MISSING_ENDPOINT_CANDIDATE
- syncope: MISSING_ENDPOINT_CANDIDATE
- dyspnea: MISSING_ENDPOINT_CANDIDATE
- chest_pain: MISSING_ENDPOINT_CANDIDATE
```

## Differential TCM diseases

- `tdis.xiong_bi` when chest obstruction/pain dominates.
- `tdis.xuan_yun` when dizziness dominates.

## Provenance

CURRENT TDIS registry + current Pattern registry/review. Western differential categories are staging for future condition links.

## Open questions

```text
1. How should ECG/referral logic link to this TDIS without putting biomedical diagnosis rules into `bing_ji`?
2. Should 心悸 use a shared palpitations symptom endpoint once created?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 6
western_associations: 6
missing_symptom_candidates: 4
canonical_write_authorized: false
```

---

# 05. `tdis.xiong_bi` - 胸痺 / Chest Bi

## Identity

```yaml
id: tdis.xiong_bi
identity_status: EXISTING_ENRICH
registry_status: EXISTS
library_card_status: UNKNOWN_BECAUSE_EXPECTED_TDIS_LIBRARY_PATH_IS_MISSING
name_zh: 胸痺
name_en: Chest Bi
pinyin: Xiongbi
family_candidate: 内科
```

## Disease scope

Traditional disease identity for chest obstruction/oppression/pain-type presentations. It must never be used as an explanatory label that bypasses biomedical chest-pain triage.

## Mechanism staging

Candidate TCM mechanism families include Yang/Qi deficiency, cold, phlegm, Qi stagnation and blood stasis obstructing the chest/Heart network. Final `bing_yin` and `bing_ji` require approved TCM sources.

## Manifestation staging

```text
chest pain
chest pressure/oppression
possible shortness of breath
possible palpitation
```

Acute onset, radiation, diaphoresis, syncope, severe dyspnea or hemodynamic symptoms require biomedical emergency reasoning.

## Pattern candidates

```yaml
- pattern.heart_yang_deficiency
- pattern.heart_qi_deficiency
- pattern.blood_stasis
```

Additional phlegm/cold patterns require exact current Pattern endpoint review rather than new IDs.

## Western associations

```text
angina / coronary artery disease
myocardial infarction
GERD
musculoskeletal chest pain
pulmonary disease
anxiety/panic
```

These are differential contexts, not synonyms.

## Symptom endpoints

```yaml
- chest_pain: MISSING_ENDPOINT_CANDIDATE
- dyspnea: MISSING_ENDPOINT_CANDIDATE
- palpitations: MISSING_ENDPOINT_CANDIDATE
- syncope: MISSING_ENDPOINT_CANDIDATE
```

## Differential TCM diseases

- `tdis.xin_ji` if palpitation is primary.
- `tdis.wei_tong` / `tdis.tun_suan` if upper-GI symptoms better explain the traditional presentation.

## Provenance

CURRENT TDIS registry + Pattern review + 2026 Board cardiovascular/pulmonary emergency scope. TCM mechanism requires approved source recheck.

## Open questions

```text
1. Should multiple TDIS cards reference one shared chest-pain red-flag rule?
2. Which current Western angina/MI/CAD identities exist and should be linked?
```

## Content accounting

```yaml
identity_verified: true
pattern_candidates: 3
western_differential_clusters: 6
missing_symptom_candidates: 4
canonical_write_authorized: false
```
