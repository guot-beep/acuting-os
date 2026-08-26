# Shared Safety Object Candidates — Clean V2

**Purpose:** identify high-value reusable safety objects that can be rendered across Western Condition, TCM Disease, Symptom and future clinical-note surfaces without duplicating emergency prose.

A safety object is a **proposal candidate**, not an authorized schema/edge type.

---

## `safety.acute_chest_pain`

```yaml
western_conditions:
  - myocardial infarction / ACS
  - angina
  - pulmonary embolism
  - aortic aneurysm/dissection context
  - pneumothorax
  - pericardial/other causes in future expansion
tdis_context:
  - tdis.xiong_bi
  - tdis.xin_ji
symptoms:
  - chest_pain
  - dyspnea
  - syncope
  - diaphoresis
rule:
  - do_not_treat_first_and_reassess_when_emergency_features_present
```

## `safety.acute_dyspnea`

```yaml
western_conditions:
  - asthma exacerbation
  - COPD exacerbation
  - heart failure
  - pulmonary embolism
  - pneumothorax
  - pneumonia
  - severe anemia
tdis_context:
  - tdis.chuan_zheng
  - tdis.xiao_bing
  - tdis.ke_sou
rule:
  - respiratory_distress_or_hypoxia_requires_biomedical_triage
```

## `safety.acute_focal_neurologic_deficit`

```yaml
western_conditions:
  - stroke
  - TIA
  - other neurologic emergencies
tdis_context:
  - tdis.zhong_feng
  - tdis.mian_tan
  - tdis.ma_mu
symptoms_or_signs:
  - facial_weakness
  - unilateral_weakness
  - unilateral_numbness
  - speech_difficulty
  - acute_visual_loss
rule:
  - resolved_symptoms_can_still_be_emergency_warning_events
```

## `safety.acute_visual_loss`

```yaml
western_conditions:
  - giant cell arteritis
  - retinal detachment
  - acute angle-closure glaucoma
  - TIA/stroke
tdis_context:
  - tdis.mu_yun
rule:
  - sudden_vision_loss_requires_immediate_eye_or_emergency_evaluation
```

## `safety.sudden_hearing_loss`

```yaml
western_conditions:
  - sudden sensorineural hearing loss
  - Ménière / vestibular differential
  - neurologic/vascular causes
tdis_context:
  - tdis.er_ming_er_long
rule:
  - sudden_sensorineural_hearing_loss_is_time_sensitive
```

## `safety.major_bleeding`

```yaml
western_conditions:
  - thrombocytopenia
  - coagulation disorders
  - peptic ulcer / GI bleeding
  - cirrhosis/variceal context
  - abnormal uterine bleeding
  - ectopic pregnancy
tdis_context:
  - tdis.beng_lou
  - tdis.yue_jing_guo_duo
  - tdis.zhi_chuang
rule:
  - hemodynamic_or_significant_bleeding_requires_biomedical_assessment
```

## `safety.acute_abdominal_or_pelvic_pain`

```yaml
western_conditions:
  - appendicitis
  - bowel obstruction
  - pancreatitis
  - gallbladder complications
  - ectopic pregnancy
  - kidney stone
  - aortic disease
tdis_context:
  - tdis.fu_tong
  - tdis.wei_tong
  - tdis.tong_jing
  - tdis.xie_tong
rule:
  - TCM_location_or_pattern_does_not_exclude_surgical_or_obstetric_emergency
```

## `safety.airway_compromise`

```yaml
western_context:
  - anaphylaxis
  - deep neck / tonsillar complications
  - severe asthma
tdis_context:
  - tdis.ru_e
  - tdis.xiao_bing
features:
  - stridor
  - drooling
  - inability_to_swallow_secretions
  - severe_respiratory_distress
rule:
  - emergency_airway_management_precedes_acupuncture
```

## `safety.febrile_neutropenia_or_sepsis`

```yaml
western_context:
  - neutropenia
  - oncology treatment
  - severe infection
features:
  - fever
  - rigors
  - hypotension
  - altered_mental_status
rule:
  - infection_emergency_pathway
```

## `safety.acute_urinary_retention_or_cauda_equina`

```yaml
western_context:
  - BPH / prostatitis / obstruction
  - cauda equina syndrome
tdis_context:
  - tdis.long_bi
  - tdis.yao_tong
features:
  - acute_retention
  - saddle_anesthesia
  - bilateral_weakness
  - bowel_dysfunction
rule:
  - neurologic_red_flags_override_routine_low_back_or_urinary_TCM_treatment
```

## `safety.pregnancy_emergency`

```yaml
western_context:
  - ectopic pregnancy
  - preeclampsia/eclampsia
  - major pregnancy bleeding
  - severe hyperemesis/dehydration
tdis_context:
  - tdis.ren_shen_e_zu
  - tdis.beng_lou
  - tdis.fu_tong
features:
  - severe_pelvic_or_abdominal_pain
  - syncope
  - heavy_bleeding
  - severe_headache_or_visual_change
  - seizure
rule:
  - pregnancy_status_changes_triage_priority
```

## Architectural recommendation

Pilot **one** shared safety object first, preferably `acute_chest_pain` or `acute_dyspnea`.

Do not create ten new schema objects at once. Validate:

```text
query value
renderer value
relation reuse
validator feasibility
source/provenance model
backward compatibility
```
