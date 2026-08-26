# TCM Disease Research Batch B - Spleen / Stomach / Gastrointestinal

**Date:** 2026-08-09  
**Status:** COMPLETE STAGING BATCH  
**Identities:** 7  
**Identity authority:** CURRENT `tdis_registry.json`.

> All seven identities already exist. TCM mechanism language below is research staging and requires approved disease-specific TCM source verification before canonical ingestion.

---

# 01. `tdis.wei_tong` - 胃痛 / Stomach Pain

```yaml
identity_status: EXISTING_ENRICH
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Scope

TCM disease identity for epigastric/stomach-region pain. It can overlap multiple biomedical diagnoses and must not be equated automatically with gastritis, GERD or peptic ulcer disease.

## Mechanism candidates

```text
cold affecting the Stomach
food stagnation
Liver-Stomach disharmony
Stomach heat/fire
Stomach Yin deficiency
blood stasis
```

## Manifestation staging

Epigastric pain is primary. Relation to meals, burning versus cold pain, belching, nausea/vomiting, bleeding signs and chronicity are useful differentiators.

## Pattern candidates

```yaml
- pattern.liver_stomach_disharmony
- pattern.stomach_fire
- pattern.stomach_yin_deficiency
- pattern.food_stagnation
- pattern.blood_stasis
```

## Western associations

```text
GERD
gastritis
peptic ulcer disease
pancreatobiliary disease
cardiac causes of epigastric/chest discomfort
```

## Symptom candidates

```text
epigastric_pain: MISSING
nausea: MISSING
vomiting: MISSING
heartburn: MISSING
```

## Differential TDIS

`tdis.tun_suan`, `tdis.fu_tong`, `tdis.pi_man` depending the dominant presentation.

## Open questions

- Is 胃脘痛 an alias of `tdis.wei_tong`?
- Which shared upper-GI red-flag rule should handle bleeding, weight loss, severe acute pain and cardiac mimics?

## Provenance / accounting

```yaml
sources:
  - CURRENT tdis_registry
  - CURRENT Pattern registry/review
  - approved TCM source recheck required
pattern_candidates: 5
western_associations: 5
canonical_write_authorized: false
```

---

# 02. `tdis.pi_man` - 痞滿 / Glomus and Fullness

```yaml
identity_status: EXISTING_ENRICH
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Scope

TCM disease identity characterized by subjective epigastric fullness/oppression without assuming a palpable structural mass.

## Mechanism candidates

Spleen/Stomach Qi dysfunction, food stagnation, dampness/phlegm, heat or cold may contribute depending the differentiated Pattern.

## Manifestation staging

```text
epigastric fullness/distension
reduced appetite
belching
early satiety/digestive discomfort
```

## Pattern candidates

```yaml
- pattern.spleen_qi_deficiency
- pattern.food_stagnation
- pattern.damp_heat_spleen_stomach
```

## Western associations

Functional dyspepsia, GERD, gastritis, delayed gastric emptying and other upper-GI disorders are contextual differentials.

## Missing symptom endpoints

```text
fullness
bloating
early_satiety
belching
```

## Differential TDIS

- `tdis.wei_tong` when pain dominates.
- `tdis.tun_suan` when acid regurgitation dominates.

## Open question

Need a source-backed distinction between 痞滿, generic bloating and structural abdominal mass.

## Accounting

```yaml
pattern_candidates: 3
missing_symptoms: 4
canonical_write_authorized: false
```

---

# 03. `tdis.ou_tu` - 嘔吐 / Vomiting

```yaml
identity_status: EXISTING_ENRICH
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Scope

TCM disease identity for clinically meaningful vomiting presentations. Vomiting can simultaneously need a symptom-level `sym.*` endpoint, but the TDIS and symptom identities must remain distinct.

## Mechanism candidates

Traditional research commonly frames vomiting around Stomach Qi failing to descend, with possible external invasion, food retention, phlegm-fluid, Liver-Stomach disharmony, heat/cold or deficiency pathways.

## Manifestation / safety staging

Vomiting is the defining feature. Hydration status, blood or bile, severe pain, pregnancy, fever and neurologic symptoms drive biomedical safety and differential reasoning.

## Pattern candidates

```yaml
- pattern.liver_stomach_disharmony
- pattern.food_stagnation
- pattern.stomach_fire
- pattern.stomach_yin_deficiency
```

## Western associations

```text
gastroenteritis
pregnancy
bowel obstruction
migraine
medication effects
intracranial disease
other GI disease
```

## Symptom candidates

```text
vomiting: MISSING
nausea: MISSING
dehydration: GRANULARITY_REVIEW
```

## Differential TDIS

- `tdis.ren_shen_e_zu` for pregnancy-specific TCM disease context.
- `tdis.e_ni` for hiccup rather than emesis.

## Open question

Define the terminology crosswalk between disease-level 嘔吐 and symptom-level vomiting without merging IDs.

## Accounting

```yaml
pattern_candidates: 4
western_associations: 7
symptom_candidates: 3
canonical_write_authorized: false
```

---

# 04. `tdis.tun_suan` - 吞酸 / Acid Regurgitation

```yaml
identity_status: EXISTING_ENRICH
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Scope

TCM disease identity centered on sour/acid regurgitation. It has strong clinical overlap with GERD but is not universally equivalent to GERD.

## Mechanism candidates

```text
Liver-Stomach disharmony
Stomach heat/fire
food stagnation
selected deficiency/cold presentations depending approved source
```

## Pattern candidates

```yaml
- pattern.liver_stomach_disharmony
- pattern.stomach_fire
- pattern.food_stagnation
```

## Western association

```yaml
- cond.gerd
  endpoint: EXISTS
  relation: STRONG_CLINICAL_ASSOCIATION
  identity_equality: false
```

Peptic disease and functional dyspepsia may also overlap.

## Missing symptom endpoints

```text
acid_regurgitation
heartburn
belching
```

## Differential TDIS

- `tdis.wei_tong` when pain is primary.
- `tdis.pi_man` when fullness is primary.

## Open question

Need a relation-confidence rule for `tdis.tun_suan` <-> `cond.gerd` that avoids false 1:1 identity.

## Accounting

```yaml
pattern_candidates: 3
western_associations: 3
missing_symptoms: 3
canonical_write_authorized: false
```

---

# 05. `tdis.xie_xie` - 泄瀉 / Diarrhea

```yaml
identity_status: EXISTING_ENRICH
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Scope

TCM disease identity for diarrhea. It must remain distinct from the symptom endpoint and from specific biomedical diagnoses such as infection, IBD or IBS.

## Mechanism candidates

```text
Spleen Qi deficiency
Spleen Yang deficiency
cold-damp
damp-heat
food injury
Kidney Yang deficiency in selected chronic presentations
```

## Pattern candidates

```yaml
- pattern.spleen_qi_deficiency
- pattern.spleen_yang_deficiency
- pattern.cold_damp_encumbering_spleen
- pattern.damp_heat_spleen_stomach
```

Kidney-Yang relation requires disease-specific source confirmation.

## Western associations

```text
infectious diarrhea
IBD
IBS
medication effects
malabsorption
endocrine causes
```

## Missing symptom endpoints

```text
diarrhea
abdominal_pain
fever: RECONCILE_EXISTING_REFERENCE
blood_in_stool
dehydration
```

## Differential TDIS

`tdis.fu_tong` when abdominal pain is the primary disease identity; co-occurrence is possible.

## Open question

Use a shared diarrhea safety rule for dehydration, GI bleeding, severe pain and infection risk rather than repeating text across cards.

## Accounting

```yaml
pattern_candidates: 4
western_associations: 6
symptom_candidates: 5
canonical_write_authorized: false
```

---

# 06. `tdis.bian_mi` - 便秘 / Constipation

```yaml
identity_status: EXISTING_ENRICH
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Scope

TCM disease identity for difficult or infrequent defecation. It is distinct from a symptom endpoint and from any one Western cause.

## Mechanism candidates

Heat/dryness, Qi stagnation, Qi/Blood deficiency and Yang deficiency may contribute. Existing Pattern inventory does not necessarily contain every classical constipation subtype as its own Pattern ID.

## Pattern candidates

```yaml
- pattern.stomach_fire
- pattern.stomach_yin_deficiency
- pattern.spleen_qi_deficiency
```

Do not invent new Pattern IDs for dry intestine or other phrases in this batch.

## Western associations

```text
medication-induced constipation
IBS-C
hypothyroidism
bowel obstruction
pelvic-floor dysfunction
```

## Missing symptom endpoints

```text
constipation
abdominal_pain
bloating
```

## Differential TDIS

`tdis.fu_tong` if pain is the primary disease presentation.

## Open question

Source-check blood-deficiency and Yang-deficiency constipation mappings against existing canonical Pattern identities without ontology inflation.

## Accounting

```yaml
pattern_candidates: 3
western_associations: 5
missing_symptoms: 3
canonical_write_authorized: false
```

---

# 07. `tdis.fu_tong` - 腹痛 / Abdominal Pain

```yaml
identity_status: EXISTING_ENRICH
registry: EXISTS
library_card: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
priority: P0_SAFETY
```

## Scope

Broad TCM disease identity for abdominal pain. Because abdominal pain can represent emergencies, this card should function as a differentiation and safety gateway rather than a narrow one-diagnosis card.

## Mechanism candidates

Cold, heat, food stagnation, Qi stagnation, blood stasis and deficiency are broad traditional mechanism families requiring approved source refinement.

## Pattern candidates

```yaml
- pattern.food_stagnation
- pattern.blood_stasis
- pattern.spleen_yang_deficiency
```

Additional Pattern candidates should be added only after exact source/registry review.

## Western differential associations

```text
appendicitis
bowel obstruction
pancreatitis
biliary disease
peptic ulcer
ectopic pregnancy
infection
urinary disease
other acute abdomen causes
```

## Missing symptom endpoints

```text
abdominal_pain
vomiting
fever: RECONCILE_EXISTING_REFERENCE
GI_bleeding
```

## Differential TDIS

- `tdis.wei_tong` for epigastric/stomach-region pain.
- gynecologic TDIS identities when pelvic/menstrual context is primary.

## Open question

A shared acute-abdominal-pain red-flag object may be architecturally better than duplicating emergency prose across TDIS cards.

## Accounting

```yaml
pattern_candidates: 3
western_differential_clusters: 9
symptom_candidates: 4
canonical_write_authorized: false
```
