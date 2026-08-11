# TCM Disease Research Batch C - Gynecology / Reproduction

**Date:** 2026-08-09  
**Status:** COMPLETE STAGING BATCH  
**Identities:** 9  
**Current repo fact:** all identities below are already registered. Do not create duplicates.

## Source policy

Identity is CURRENT-repo verified. Pattern/mechanism staging uses existing Pattern research as discovery and must be rechecked against approved gynecology/classical sources before canonical write. Western associations are never 1:1 equivalence unless explicitly supported.

---

# 01. `tdis.tong_jing` - 痛經 / Dysmenorrhea

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
```

## Scope

TCM disease identity for painful menstruation. It may correspond clinically to primary dysmenorrhea or occur with secondary biomedical causes such as endometriosis, adenomyosis or uterine fibroids.

## Mechanism candidates

```text
Qi stagnation and blood stasis
cold coagulation
selected damp-heat presentations
Qi/Blood deficiency
Kidney deficiency
```

## Pattern candidates

```yaml
- pattern.liver_qi_stagnation
- pattern.blood_stasis
- pattern.kidney_yang_deficiency
- pattern.kidney_yin_deficiency
```

## Manifestation staging

Menstrual/pelvic pain is central. Timing relative to flow, pain quality, clots, bleeding amount and associated systemic signs are high-value differentiators.

## Western associations

```text
primary dysmenorrhea
endometriosis
adenomyosis
uterine fibroids
pelvic inflammatory disease
pregnancy-related emergency differential when clinically relevant
```

## Missing symptoms

```text
pelvic_pain
menstrual_pain
heavy_menstrual_bleeding
```

## Differential TDIS

- `tdis.zheng_jia` if a traditional mass context dominates.
- `tdis.beng_lou` if abnormal bleeding rather than pain is primary.

## Open question

Exact current Western dysmenorrhea/endometriosis/fibroid IDs must be scanned before crosswalk ingestion.

## Accounting

```yaml
pattern_candidates: 4
western_associations: 6
missing_symptoms: 3
canonical_write_authorized: false
```

---

# 02. `tdis.yue_jing_xian_qi` - 月經先期 / Early Menstruation

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
```

## Scope

Traditional menstrual disease identity for cycles arriving earlier than expected within the TCM gynecologic diagnostic system.

## Mechanism candidates

Research staging suggests heat accelerating Blood or Qi deficiency failing to secure Blood as important mechanism families. Exact criteria and wording must come from an approved gynecology source.

## Pattern candidates

```yaml
- pattern.spleen_not_governing_blood
- pattern.liver_fire
```

These are candidates, not exhaustive differentiation.

## Western differential associations

```text
normal cycle variation
anovulatory abnormal uterine bleeding
thyroid disease
structural uterine causes
pregnancy-related bleeding
medication effects
```

## Missing symptom endpoints

```text
abnormal_uterine_bleeding
menstrual_irregularity
```

## Differential TDIS

- `tdis.yue_jing_guo_duo` if amount is the defining problem.
- `tdis.beng_lou` for flooding/trickling abnormal bleeding.

## Open question

Do not define an exact “early” cycle-day threshold from model memory. Extract it from the approved source.

## Accounting

```yaml
pattern_candidates: 2
western_differential_clusters: 6
canonical_write_authorized: false
```

---

# 03. `tdis.yue_jing_hou_qi` - 月經後期 / Delayed Menstruation

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
```

## Scope

TCM menstrual disease identity for delayed cycle timing.

## Mechanism candidates

Blood deficiency, cold, Kidney deficiency, Qi stagnation or phlegm-damp may contribute depending the approved source and Pattern differentiation.

## Pattern candidates

```yaml
- pattern.liver_blood_deficiency
- pattern.kidney_yang_deficiency
- pattern.liver_qi_stagnation
```

## Biomedical associations / differential

```text
pregnancy
PCOS
thyroid disease
hypothalamic causes
weight/exercise changes
medication effects
```

Pregnancy status is a biomedical first question when clinically relevant.

## Missing symptom endpoints

```text
delayed_menstruation
menstrual_irregularity
```

## Differential TDIS

`tdis.bi_jing` for absence of menstruation beyond the delayed-cycle scope.

## Open question

Source-check the exact boundary between 月經後期 and 閉經.

## Accounting

```yaml
pattern_candidates: 3
western_differential_clusters: 6
canonical_write_authorized: false
```

---

# 04. `tdis.yue_jing_guo_duo` - 月經過多 / Heavy Menstruation

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
priority: P0_BLEEDING_ANEMIA_CROSSWALK
```

## Scope

TCM disease identity for excessive menstrual bleeding within the traditional disease framework.

## Mechanism candidates

Qi deficiency failing to contain Blood, Blood heat and blood stasis are recurrent research pathways. Exact Pattern list requires source verification.

## Pattern candidates

```yaml
- pattern.spleen_not_governing_blood
- pattern.blood_stasis
- pattern.liver_fire
```

## Biomedical associations

```text
abnormal uterine bleeding
uterine fibroids
adenomyosis
bleeding/coagulation disorders
thyroid disease
anticoagulant effects
iron deficiency / anemia consequence
```

## Symptom endpoints

```yaml
- heavy_menstrual_bleeding: MISSING
- dizziness: MISSING
- sym.fatigue: EXISTS
```

Fatigue/dizziness may reflect blood loss or anemia but are not defining features.

## Differential TDIS

- `tdis.beng_lou` when flooding/trickling abnormal bleeding exceeds ordinary heavy cyclic menses.
- `tdis.tong_jing` when pain is primary.

## Open question

Model anemia as a possible consequence/related condition, not an inevitable causal edge.

## Accounting

```yaml
pattern_candidates: 3
western_associations: 7
symptom_candidates: 3
canonical_write_authorized: false
```

---

# 05. `tdis.beng_lou` - 崩漏 / Flooding and Trickling

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
priority: P0_SAFETY
```

## Scope

TCM gynecologic bleeding disease identity. It is not a substitute for biomedical evaluation of abnormal uterine bleeding.

## Mechanism candidates

Research staging includes Chong/Ren instability associated with deficiency, heat or stasis. A legacy Pattern research pack identified Chong-Ren deficiency phrases, but no new Pattern ID is authorized by this disease batch.

## Pattern candidates that currently resolve

```yaml
- pattern.spleen_not_governing_blood
- pattern.blood_stasis
- pattern.kidney_yang_deficiency
```

Any proposed Chong/Ren Pattern remains in Pattern canonical review.

## Manifestation / safety staging

Sudden profuse bleeding and/or persistent irregular trickling are central traditional concepts. Hemodynamic symptoms, possible pregnancy, severe pain, syncope or significant anemia symptoms require biomedical evaluation.

## Western associations

```text
abnormal uterine bleeding
pregnancy-related bleeding
structural uterine disease
anovulatory/endocrine bleeding
coagulation/platelet disorder
age/risk-appropriate malignancy differential
anemia secondary to blood loss
```

## Missing symptom endpoints

```text
vaginal_bleeding
heavy_bleeding
dizziness
syncope
```

`fatigue` already exists.

## Differential TDIS

`tdis.yue_jing_guo_duo` for heavy but cyclic menstruation; pregnancy-specific TDIS if gestational context applies.

## Open questions

```text
1. Which shared urgent-bleeding red-flag object should this card reference?
2. Do not create `pattern.chong_ren_deficiency` here; defer to Pattern canonical review.
```

## Accounting

```yaml
pattern_candidates_resolving_now: 3
western_associations: 7
missing_symptoms: 4
canonical_write_authorized: false
```

---

# 06. `tdis.bi_jing` - 閉經 / Amenorrhea

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
```

## Scope

TCM disease identity for absence of menstruation within its traditional diagnostic scope.

## Mechanism candidates

Kidney/Jing deficiency, Blood deficiency, Qi/Blood stasis and phlegm-damp are possible research families. Exact disease criteria and differentiation require approved gynecology sources.

## Pattern candidates

```yaml
- pattern.kidney_essence_deficiency
- pattern.liver_blood_deficiency
- pattern.blood_stasis
```

## Western differential associations

```text
pregnancy
PCOS
hypothalamic amenorrhea
thyroid disease
hyperprolactinemia
primary ovarian insufficiency
menopause
```

## Missing symptom endpoint

```text
amenorrhea / missed_period: IDENTITY_GRANULARITY_REVIEW
```

## Differential TDIS

- `tdis.yue_jing_hou_qi` for delayed rather than absent menstruation.
- `tdis.jing_duan_qian_hou` for menopausal-transition syndrome context.

## Open question

Extract exact traditional duration/age criteria from approved source, not model memory.

## Accounting

```yaml
pattern_candidates: 3
western_differential_clusters: 7
canonical_write_authorized: false
```

---

# 07. `tdis.dai_xia_bing` - 帶下病 / Vaginal Discharge Disease

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
```

## Scope

TCM disease identity for abnormal vaginal discharge. It must not be used to infer infection without biomedical evaluation.

## Mechanism candidates

Dampness, damp-heat and Spleen/Kidney deficiency are candidate mechanism families.

## Pattern candidates

```yaml
- pattern.damp_heat_spleen_stomach
- pattern.spleen_qi_deficiency
- pattern.kidney_yang_deficiency
```

These are broad candidates; disease-specific source may reveal more precise canonical Pattern matches.

## Biomedical associations

```text
vaginitis
cervicitis / STI
normal physiologic discharge
pelvic infection
pregnancy-related changes
```

## Missing symptom endpoints

```text
vaginal_discharge
itching
pelvic_pain
fever: RECONCILE_EXISTING_REFERENCE
```

## Open question

Need exact traditional subtype/pattern mapping and a safe infection/STI referral relation.

## Accounting

```yaml
pattern_candidates: 3
western_associations: 5
symptom_candidates: 4
canonical_write_authorized: false
```

---

# 08. `tdis.bu_yun` - 不孕 / Female Infertility

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
```

## Scope

TCM disease identity for female infertility. It should link to, not be equated with, biomedical infertility diagnoses and causes.

## Mechanism candidates

Kidney/Jing deficiency, Chong/Ren dysfunction, Liver Qi stagnation, blood stasis and phlegm-damp are research candidates.

## Pattern candidates that currently resolve

```yaml
- pattern.kidney_essence_deficiency
- pattern.kidney_yang_deficiency
- pattern.kidney_yin_deficiency
- pattern.liver_qi_stagnation
- pattern.blood_stasis
```

Chong/Ren Pattern phrases remain separate canonical-review work.

## Western associations

```text
PCOS
endometriosis
tubal disease
diminished ovarian reserve
endocrine disease
male-factor infertility
age-related fertility decline
```

`cond.pcos` is a verified current endpoint but should link to `tdis.bu_yun` only when infertility context is present.

## Symptom endpoints

Infertility itself should not be reduced to a symptom ID. Cause-specific symptoms can be linked separately.

## Differential TDIS

`tdis.bu_yu` is the separately registered male-infertility identity.

## Open question

Which current Western infertility identities already exist, and how should multifactor infertility be modeled without false causal edges?

## Accounting

```yaml
pattern_candidates: 5
western_associations: 7
canonical_write_authorized: false
```

---

# 09. `tdis.jing_duan_qian_hou` - 絕經前後諸證 / Perimenopausal Syndrome

```yaml
identity_status: EXISTING_ENRICH
family_candidate: 妇科
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
```

## Scope

TCM disease identity for symptom complexes around the menopausal transition. Menopause itself can be a normal life stage; the card should not pathologize every person who has reached menopause.

## Mechanism candidates

Research commonly centers on decline of Kidney essence/Yin/Yang with secondary Heart/Liver/Spleen effects. Exact wording and Pattern mapping require approved source verification.

## Pattern candidates

```yaml
- pattern.kidney_yin_deficiency
- pattern.kidney_yang_deficiency
- pattern.heart_kidney_not_communicating
- pattern.liver_yang_rising
```

## Manifestation staging

Potential complaints can include vasomotor symptoms, sleep disturbance, mood changes, menstrual change and genitourinary symptoms. Other biomedical causes must remain in the differential.

## Western associations

```text
perimenopause / menopause
thyroid disease
anemia
mood disorders
sleep disorders
medication effects
```

## Symptom endpoints

```yaml
- sym.insomnia: EXISTS
- sym.fatigue: EXISTS
- hot_flash: MISSING
- night_sweats: MISSING
- menstrual_irregularity: MISSING
```

## Differential TDIS

`tdis.bi_jing` if amenorrhea is being treated as a distinct disease outside the normal menopausal-transition context.

## Open question

Define the boundary so normal menopause is not automatically converted into a disease card presentation.

## Accounting

```yaml
pattern_candidates: 4
western_associations: 6
symptom_candidates: 5
canonical_write_authorized: false
```
