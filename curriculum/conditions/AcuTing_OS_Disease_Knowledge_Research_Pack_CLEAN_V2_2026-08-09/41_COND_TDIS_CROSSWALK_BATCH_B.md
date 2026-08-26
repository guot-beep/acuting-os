# Condition <-> TCM Disease Crosswalk Batch B - Hematology / Cardiovascular / Endocrine / Gynecology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Relation atoms:** 26.

---

# 1. Crosswalk atoms

| # | Source | Target | Staging relation | Endpoint status | Confidence | Key caveat |
|---:|---|---|---|---|---|---|
| 1 | anemia candidate | `tdis.xu_lao` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | 虛勞 is much broader than anemia |
| 2 | anemia candidate | `sym.fatigue` | manifestation | `EXISTS` | high | nonspecific |
| 3 | anemia candidate | dizziness | manifestation | `MISSING_ENDPOINT` | high | common possible symptom, not diagnostic |
| 4 | anemia candidate | dyspnea | manifestation | `MISSING_ENDPOINT` | medium-high | severity/context dependent |
| 5 | thrombocytopenia candidate | bruising | manifestation | `MISSING_ENDPOINT` | high | common bleeding manifestation |
| 6 | thrombocytopenia candidate | bleeding | manifestation | `IDENTITY_GRANULARITY_REVIEW` | high | broad endpoint may need site/severity model |
| 7 | sickle cell disease candidate | `sym.fatigue` | manifestation | `EXISTS` | medium | chronic anemia context |
| 8 | sickle cell disease candidate | chest_pain | emergency manifestation context | `MISSING_ENDPOINT` | medium-high | acute chest syndrome / cardiopulmonary differential |
| 9 | heart failure candidate | `tdis.shui_zhong` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | edema has many causes |
| 10 | heart failure candidate | `tdis.xin_ji` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | palpitation context only |
| 11 | heart failure candidate | `tdis.xiong_bi` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | ischemia/chest discomfort may coexist |
| 12 | heart failure candidate | `sym.edema` | manifestation | referenced but unresolved in inspected symptom pilot | high | TDIS registry already references this ID |
| 13 | heart failure candidate | dyspnea | manifestation | `MISSING_ENDPOINT` | high | core clinical feature |
| 14 | POTS candidate | `tdis.xuan_yun` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | dizziness/orthostatic-intolerance context |
| 15 | POTS candidate | `tdis.xin_ji` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | palpitation/tachycardia context |
| 16 | POTS candidate | dizziness | manifestation | `MISSING_ENDPOINT` | high | core symptom endpoint |
| 17 | POTS candidate | palpitations | manifestation | `MISSING_ENDPOINT` | high | core symptom endpoint |
| 18 | Addison candidate | `tdis.xu_lao` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low-medium | fatigue/weakness overlap only |
| 19 | Addison candidate | `sym.fatigue` | manifestation | `EXISTS` | high | nonspecific |
| 20 | Graves candidate | `tdis.ying_bing` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | goiter context only; 癭病 is broader |
| 21 | Graves candidate | `tdis.xin_ji` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | palpitations context |
| 22 | Hashimoto candidate | `tdis.ying_bing` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | goiter context only |
| 23 | Western dysmenorrhea identity | `tdis.tong_jing` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | ontology remains distinct |
| 24 | abnormal uterine bleeding identity | `tdis.beng_lou` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | phenotype/source dependent |
| 25 | `cond.pcos` | `tdis.bu_yun` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | both known | medium-high | link only when infertility context is present |
| 26 | `cond.pcos` | `tdis.bi_jing` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | both known | medium | link only when amenorrhea phenotype is present |

---

# 2. Safety relation principles

## Chest symptoms

`tdis.xiong_bi` must never suppress biomedical evaluation for dangerous chest-pain causes such as acute coronary syndrome, myocardial infarction, pulmonary embolism, aortic disease, pneumothorax or serious arrhythmia.

## Dizziness

`tdis.xuan_yun` should not become a universal reverse target that hides the biomedical differential:

```text
vestibular disease
POTS
orthostatic hypotension
anemia
arrhythmia
stroke/TIA
medication effect
dehydration
```

## Abnormal uterine bleeding

`tdis.beng_lou` should link to a safety/differential context that preserves:

```text
pregnancy-related bleeding
structural uterine disease
coagulation/platelet disorders
endocrine/anovulatory causes
age/risk-appropriate malignancy evaluation
anemia from blood loss
```

---

# 3. Endpoint candidates generated

```text
dizziness
dyspnea
palpitations
edema
chest_pain
bruising
bleeding
vaginal_bleeding
```

No canonical ID is authorized until symptom identity/alias/granularity review is complete.

---

# 4. Content accounting

```yaml
relation_atoms: 26
strong_or_common_associations: 13
contextual_or_differential_associations: 13
identity_equalities: 0
new_endpoints_authorized: 0
```
