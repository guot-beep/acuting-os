# Condition <-> TCM Disease Crosswalk Batch C - Respiratory / ENT / Neurologic

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Relation atoms:** 24  
**Focus:** asthma/URI/allergic-rhinitis/sinus-ENT plus Bell palsy/trigeminal neuralgia/peripheral neuropathy.  
**Guardrail:** no identity equality is asserted.

---

# 1. Staging semantics

```text
STRONG_CLINICAL_ASSOCIATION
COMMON_TCM_PRESENTATION
POSSIBLE_CONTEXTUAL_ASSOCIATION
DIFFERENTIAL_CONTEXT
EMERGENCY_DIFFERENTIAL_CONTEXT
UNSUPPORTED_DO_NOT_LINK
```

These are research semantics only. Map them to the current relation vocabulary at ingestion; do not create new edge types merely because a phrase appears below.

---

# 2. Endpoint status legend

```yaml
EXISTS:
  directly verified in supplied current-repo audit

REGISTERED_ONLY:
  TDIS identity verified in current registry, full library card path unresolved

IDENTITY_CHECK_REQUIRED:
  Western concept requires complete current Condition canonical scan

MISSING_ENDPOINT:
  symptom/sign endpoint not present in inspected symptom pilot

GRANULARITY_REVIEW:
  clinically useful fact needs namespace/granularity decision
```

---

# 3. Relation atoms

| # | Source | Target | Staging relation | Direction | Endpoint status | Confidence | Reason / guardrail |
|---:|---|---|---|---|---|---|---|
| 1 | asthma candidate | `tdis.xiao_bing` | `STRONG_CLINICAL_ASSOCIATION` | cond -> tdis | asthma identity check; TDIS registered | high | recurrent wheeze/airflow symptoms overlap strongly; not identity equality |
| 2 | asthma candidate | `tdis.chuan_zheng` | `COMMON_TCM_PRESENTATION` | cond -> tdis | TDIS registered | medium-high | dyspnea-focused TCM disease context |
| 3 | asthma candidate | `tdis.ke_sou` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | cond -> tdis | TDIS registered | medium | cough-variant or cough-predominant presentation only |
| 4 | asthma candidate | wheeze | manifestation | cond -> sym | `MISSING_ENDPOINT` | high | NHLBI core asthma symptom |
| 5 | asthma candidate | dyspnea | manifestation | cond -> sym | `MISSING_ENDPOINT` | high | NHLBI core asthma symptom |
| 6 | asthma candidate | cough | manifestation | cond -> sym | `MISSING_ENDPOINT` | high | NHLBI core asthma symptom |
| 7 | asthma candidate | `pattern.phlegm_damp_in_lung` | possible TCM pattern | cond -> pattern | `EXISTS` | medium | selected TCM presentations only |
| 8 | asthma candidate | `pattern.phlegm_heat_in_lung` | possible TCM pattern | cond -> pattern | `EXISTS` | medium | selected TCM presentations only |
| 9 | common-cold / viral-URI candidate | `tdis.gan_mao` | `STRONG_CLINICAL_ASSOCIATION` | cond -> tdis | Western identity check; TDIS registered | high | acute upper-respiratory syndrome overlap, not virologic equivalence |
| 10 | common-cold / viral-URI candidate | `tdis.ke_sou` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | cond -> tdis | TDIS registered | medium | cough may be prominent |
| 11 | common-cold / viral-URI candidate | rhinorrhea | manifestation | cond -> sym | `MISSING_ENDPOINT` | high | common cold feature |
| 12 | common-cold / viral-URI candidate | nasal_congestion | manifestation | cond -> sym | `MISSING_ENDPOINT` | high | common cold feature |
| 13 | `cond.allergic-rhinitis` | `tdis.bi_qiu` | `STRONG_CLINICAL_ASSOCIATION` | cond -> tdis | both known/registered | high | recurrent sneezing/rhinorrhea overlap; not identity equality |
| 14 | `cond.allergic-rhinitis` | `pattern.wind_cold_invading_lung` | possible TCM pattern | cond -> pattern | `EXISTS` | medium-low | selected TCM presentation, not universal |
| 15 | sinusitis/rhinosinusitis candidate | `tdis.bi_yuan` | `COMMON_TCM_PRESENTATION` | cond -> tdis | Western identity check; TDIS registered | medium-high | nasal obstruction/discharge/facial pressure context; bacterial status not implied |
| 16 | tinnitus Western concept | `tdis.er_ming_er_long` | `STRONG_CLINICAL_ASSOCIATION` | cond/sym context -> tdis | Western identity/granularity review; TDIS registered | high | tinnitus is central to the traditional combined identity, but is not necessarily a Condition |
| 17 | hearing-loss Western concept | `tdis.er_ming_er_long` | `COMMON_TCM_PRESENTATION` | cond -> tdis | identity/granularity review; TDIS registered | high | broad hearing-loss overlap; cause-specific Western diagnosis remains separate |
| 18 | Bell palsy candidate | `tdis.mian_tan` | `STRONG_CLINICAL_ASSOCIATION` | cond -> tdis | Bell identity check; TDIS registered | high | peripheral facial palsy and 面癱 have strong clinical correspondence; stroke still must be excluded |
| 19 | Bell palsy candidate | facial_weakness | manifestation | cond -> sym/sign | `GRANULARITY_REVIEW` | high | core presentation; distinguish peripheral from central pattern |
| 20 | trigeminal-neuralgia candidate | `tdis.mian_tong` | `STRONG_CLINICAL_ASSOCIATION` | cond -> tdis | Western identity check; TDIS registered | high | severe paroxysmal facial pain overlap; not identity equality |
| 21 | trigeminal-neuralgia candidate | facial_pain | manifestation | cond -> sym | `MISSING_ENDPOINT` | high | core NIDCR feature |
| 22 | peripheral-neuropathy candidate | `tdis.ma_mu` | `COMMON_TCM_PRESENTATION` | cond -> tdis | Western identity check; TDIS registered | medium-high | numbness/paresthesia context, not every neuropathy |
| 23 | peripheral-neuropathy candidate | numbness_or_paresthesia | manifestation | cond -> sym | `MISSING_ENDPOINT` | high | common sensory neuropathy manifestation |
| 24 | peripheral-neuropathy candidate | `tdis.wei_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | cond -> tdis | TDIS registered | medium-low | only weakness/atrophy-dominant presentations; do not universalize |

---

# 4. Existing relation atoms intentionally NOT duplicated

The supplied prior crosswalk already contains:

```text
cond.copd -> tdis.chuan_zheng
cond.copd -> tdis.ke_sou
cond.copd -> pattern.lung_qi_deficiency

cond.stroke -> tdis.zhong_feng
cond.stroke -> pattern.liver_wind
cond.stroke -> tdis.mian_tan
```

Batch C references these clusters conceptually but does not count them again as new relation atoms.

---

# 5. Safety relation principles

## Asthma / wheeze

NHLBI identifies wheeze, cough, shortness of breath and chest tightness as asthma symptoms, but other conditions can cause the same features. `tdis.xiao_bing` must not become a diagnostic substitute for objective pulmonary evaluation or an asthma action plan.

## Facial weakness

Bell palsy is a peripheral facial palsy diagnosis; sudden facial droop can also be caused by stroke. MedlinePlus explicitly advises immediate evaluation of facial droop so more serious causes such as stroke can be ruled out. Therefore:

```text
Bell palsy <-> 面癱 association
does not
suppress stroke differential
```

## Facial pain

NIDCR describes trigeminal neuralgia as recurrent, often unilateral, electric/shock-like facial pain triggered by light touch and other ordinary stimuli. `tdis.mian_tong` is a useful TCM association layer but cannot replace neurologic/dental differential assessment.

## Peripheral neuropathy / numbness

NINDS emphasizes that peripheral neuropathy is a large family with sensory, motor and autonomic manifestations and many causes, including diabetes, injury/compression, autoimmune disease, kidney/liver disease, nutritional imbalance, toxins, cancer treatment and infection. `tdis.ma_mu` should link to numbness-dominant presentation rather than become a universal reverse target for all neuropathy.

## Hearing loss

NIDCD considers sudden sensorineural hearing loss a medical emergency. A general `tdis.er_ming_er_long` relation must therefore carry a safety route for sudden unilateral hearing loss rather than imply that all hearing change is suitable for routine TCM-only evaluation.

---

# 6. Endpoint candidates generated by Batch C

```yaml
P0_or_high_reuse:
  - wheeze
  - dyspnea
  - cough
  - rhinorrhea
  - nasal_congestion
  - hearing_loss
  - tinnitus
  - facial_pain
  - numbness_or_paresthesia

granularity_or_sign_review:
  - facial_weakness
  - chest_tightness
  - ear_fullness
  - sneezing
  - sore_throat
```

No canonical symptom ID is authorized by this batch.

---

# 7. Provenance

```text
CURRENT supplied data/config/relation_registry.json audit
CURRENT supplied data/pathology/tdis_registry.json audit
CURRENT supplied Pattern registry/canonical review
CURRENT supplied symptoms pilot audit

NHLBI - Asthma Symptoms / Diagnosis / Treatment
MedlinePlus - Common Cold / Allergic Rhinitis / Bell Palsy
NIDCR - Trigeminal Neuralgia
NINDS - Peripheral Neuropathy
NIDCD - Tinnitus / Sudden Sensorineural Hearing Loss / Hearing Loss
```

---

# 8. Content accounting

```yaml
relation_atoms: 24
identity_equalities_asserted: 0
prior_atoms_duplicated: 0
new_endpoint_ids_authorized: 0
new_edge_types_authorized: 0
cumulative_crosswalk_atoms_after_batches_A_B_C: 74
```
