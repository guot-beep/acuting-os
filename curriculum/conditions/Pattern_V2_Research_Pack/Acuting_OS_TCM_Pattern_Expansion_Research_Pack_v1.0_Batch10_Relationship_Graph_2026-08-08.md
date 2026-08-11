# AcuTing OS — TCM Pattern Expansion Research Pack v1.0
## Batch 10 — Pattern Relationship Graph Pack
### Causal, Progression, Transformation, Cross-System and Context Graph for Antigravity

**Date:** 2026-08-08  
**Research / synthesis layer:** ChatGPT  
**Repository / implementation layer:** Antigravity  
**Status:** STAGING / GRAPH REVIEW ONLY — do not bulk-write production relations

---

# 0. Purpose

Batches 02–09 identified:

- Pattern candidates
- aliases and duplicate risks
- Zang-Fu expansion
- gynecology / Chong-Ren / Jing
- formula evidence density
- Six Channels / Four Levels / San Jiao / Eight Principles
- Extraordinary Vessels / channel pathology
- differential discriminators

Batch 10 converts that material into an explicit **knowledge-graph layer**.

The central question is now:

> How do Patterns cause, transform into, generate, damage, invade, obstruct, overlap with, or contextualize one another?

This pack is designed for Antigravity to compare against the live repository's existing relation registry before implementing anything.

---

# 1. Core graph principle

AcuTing should not treat Pattern cards as isolated flashcards.

The intended model is closer to:

```text
root mechanism
    ↓
secondary pathology
    ↓
organ / channel / fluid effect
    ↓
clinical Pattern expression
    ↓
TCM disease / biomedical context
```

Example:

```text
Spleen Qi Deficiency
    ↓ may_generate
Dampness
    ↓ may_condense_into
Phlegm
    ↓ may_obstruct
Lung / Channels / Heart Orifices
```

This is more useful than creating long flat IDs such as:

```text
pattern.spleen_qi_deficiency_with_phlegm_damp_obstructing_lung
```

---

# 2. Relation taxonomy proposal

**Important:** These are semantic concepts for staging.

Antigravity must first inspect the live `relation_registry.json` and reuse approved relation names if equivalents already exist.

Do **not** create these exact production keys automatically.

---

## 2.1 Identity / taxonomy relations

### `subtype_of`
A narrower Pattern is a true subtype of a broader Pattern.

Example:

```text
Warm-Dryness Attacking Lung
    subtype_of
Lung Dryness / Exterior Dryness
```

### `broader_than`
Inverse of subtype.

### `alias_of`
Only for genuine identity equivalence.

Never use when two concepts merely overlap clinically.

### `deprecated_to`
Historical/import-only ID points to canonical identity.

Examples from V1 migration:
- `insomnia_heart_kidney_disharmony` → Heart-Kidney Not Communicating
- `liver_fire_flaring` → Liver Fire
- `liver_wind_stirring` → Liver Wind

These may already be represented through existing deprecation metadata rather than the relation registry.

---

## 2.2 Causal / mechanistic relations

### `may_generate`
Pattern A may generate pathology B.

Example:
- Blood Deficiency → Internal Wind

### `may_cause`
A broader causal relation when “generate” is not traditional terminology.

Example:
- Kidney Yang Deficiency → Water Retention/Flooding

### `results_from`
Inverse causal relation.

### `contributes_to`
Use for weaker/multifactorial causation.

Example:
- Qi Deficiency → contributes to Blood Stasis

---

## 2.3 Transformation relations

### `may_transform_into`
Pathology changes qualitative nature.

Examples:
- Wind-Cold → Heat
- Liver Qi Stagnation → Heat
- Dampness → Phlegm

### `may_intensify_to`
Same-axis worsening.

Example:
- Stomach Heat → Stomach Fire

### `may_progress_to`
Clinical progression without implying a strict transformation mechanism.

Example:
- Heart Qi Deficiency → Heart Yang Deficiency

---

## 2.4 Functional-failure relations

### `fails_to_nourish`
Examples:
- Kidney Yin Deficiency → fails to nourish Heart
- Liver Blood Deficiency → fails to nourish sinews

### `fails_to_hold`
Examples:
- Spleen Qi Deficiency → fails to hold Blood
- Kidney Qi Deficiency → fails to secure urine/essence

### `fails_to_descend`
Examples:
- Stomach Qi → rebellious Stomach Qi
- Lung Qi → cough/dyspnea

### `rebels_upward`
Examples:
- Stomach Qi Rebellion
- Chong Qi Rebellion

### `fails_to_grasp`
Example:
- Kidney deficiency → fails to grasp Lung Qi

---

## 2.5 Organ interaction relations

### `invades`
Examples:
- Liver Qi → invades Stomach
- Liver Qi → invades Spleen

### `scorches`
Example:
- Liver Fire → scorches Lung

### `transfers_heat_to`
Example:
- Heart Fire → Small Intestine Heat

### `pours_downward_to`
Example:
- Liver/GB Damp-Heat → Bladder / Lower Jiao Damp-Heat

### `affects`
Generic organ/channel involvement when stronger mechanistic terminology is not justified.

---

## 2.6 Obstruction relations

### `obstructs`
Examples:
- Phlegm → channels
- Blood Stasis → collaterals
- Cold → channels

### `binds_with`
Examples:
- Liver Qi Stagnation + Phlegm → Phlegm-Qi binding

### `congeals`
Example:
- Cold → congeals Blood → Blood Stasis

---

## 2.7 Damage relations

### `damages_yin`
Examples:
- Stomach Fire → Stomach Yin
- Liver Fire → Liver/Kidney Yin in chronic cases

### `damages_fluids`
Examples:
- Lung Heat → fluids
- Qi-level Heat → fluids

### `injures_blood`
For deep Heat patterns when source-backed.

### `forces_blood_out`
Example:
- Blood Heat / Xue-stage Heat → bleeding

---

## 2.8 Stage / temporal relations

### `stage_precedes`
For formal differentiation systems.

Example:
- Wei stage → Qi stage

### `may_enter`
Example:
- Tai Yang → Yang Ming / Shao Yang

### `concurrent_with`
For combined stages.

Example:
- Shao Yang concurrent with Yang Ming interior excess

### `alternative_transformation`
Example:
- Shao Yin Cold vs Shao Yin Heat

---

## 2.9 Cross-system relations

### `crosswalk_overlap`
High clinical overlap, different diagnostic framework.

Examples:
- Yang Ming Jing ↔ Qi-stage Stomach Heat
- Yang Ming Fu ↔ Qi-stage Intestinal Dry Heat

### `clinical_overlap_not_alias`
Similar manifestations, but identity remains separate.

Example:
- Stomach Fire ↔ Yang Ming Jing

### `framework_specific_expression_of`
Optional if supported by live graph architecture.

Example:
- Wei-stage Wind-Heat as a Four-Level expression of exterior Wind-Heat

Use only if this does not erase framework identity.

---

## 2.10 Context relations

### `may_present_as_tdis`
Pattern may appear in a TCM disease context.

### `associated_with_condition`
Pattern can occur in biomedical condition, without equivalence.

### `located_in`
For San Jiao/channel location.

### `affects_channel`
For Jing-Luo involvement.

---

# 3. Evidence / confidence model for edges

Every relation should carry provenance and confidence.

Recommended staging fields:

```json
{
  "from": "pattern.spleen_qi_deficiency",
  "relation": "may_generate",
  "to": "candidate.dampness",
  "confidence": "high",
  "evidence_class": ["textbook", "formula_corpus"],
  "source_refs": [],
  "notes": "Repeated across formula and Zang-Fu theory sources."
}
```

### Confidence levels

- `very_high`
  - standard traditional mechanism
  - multiple accepted sources
  - no meaningful ontology conflict

- `high`
  - strong conventional relation
  - multiple corroborating sources

- `moderate`
  - plausible/source-backed but context-sensitive

- `low`
  - single-source or terminology-sensitive

- `hold`
  - do not implement until reviewed

---

# 4. Liver graph family

## LIV-G01 — Liver Qi Stagnation → Heat

```text
Liver Qi Stagnation 肝氣鬱結
    ↓ may_transform_into
Liver Heat / constrained Heat 肝鬱化熱
```

**Confidence:** very high  
**Evidence:** Jia Wei Xiao Yao San, Jin Ling Zi San, repeated theory/formula corpus.

### Notes
Heat transformation is not inevitable.

---

## LIV-G02 — Liver Qi Stagnation → Liver Fire

```text
Liver Qi Stagnation
    ↓ prolonged / intensified
Liver Fire
```

**Relation:** `may_transform_into`  
**Confidence:** high

Could be modeled with Heat as an intermediate node if the graph supports it:

```text
Liver Qi Stagnation
→ constrained Heat
→ Liver Fire
```

---

## LIV-G03 — Liver Fire → Internal Wind

```text
Liver Fire / Extreme Heat
    ↓ may_generate
Internal Liver Wind
```

**Confidence:** high

### Formula anchors
- Tian Ma Gou Teng Yin
- Ling Jiao Gou Teng Yin
- Zhen Gan Xi Feng Tang context

### Important
Do not imply all Liver Wind is caused by Liver Fire.

---

## LIV-G04 — Liver Yang Rising → Internal Wind

```text
Liver Yang Rising
    ↓ may_generate
Internal Liver Wind
```

**Confidence:** very high

Future subtype:
- 肝陽化風

---

## LIV-G05 — Blood Deficiency → Internal Wind

```text
Liver Blood Deficiency / Blood Deficiency
    ↓ may_generate
Internal Wind
```

**Confidence:** high

Future subtype:
- 血虛生風

---

## LIV-G06 — Yin Deficiency → Internal Wind

```text
Liver/Kidney Yin Deficiency
    ↓ may_generate
Internal Wind
```

**Confidence:** high

Future subtype:
- 陰虛風動

---

## LIV-G07 — Liver Yin/Blood Deficiency → Liver Yang Rising

```text
Liver Blood Deficiency
or
Liver/Kidney Yin Deficiency
    ↓ fails_to_anchor
Liver Yang Rising
```

**Confidence:** high

Use `fails_to_anchor` only if existing vocabulary supports it. Otherwise `contributes_to`.

---

## LIV-G08 — Liver Qi Invades Stomach

```text
Liver Qi Stagnation
    ↓ invades
Stomach
    ↓
Liver Qi Invading Stomach
```

**Confidence:** very high

### Manifestation consequences
- epigastric distention/pain
- belching
- nausea
- reflux
- emotional trigger

---

## LIV-G09 — Liver Qi Invades Spleen

```text
Liver Qi Stagnation
    ↓ invades / overacts_on
Spleen
    ↓
Liver-Spleen Disharmony
```

**Confidence:** very high

---

## LIV-G10 — Liver Fire Scorches Lung

```text
Liver Fire
    ↓ scorches
Lung
    ↓
Liver Fire Scorching Lung
```

**Confidence:** high

Cross-organ candidate preserved in Batches 02–06.

---

## LIV-G11 — Liver/GB Damp-Heat → Lower Jiao / Bladder

```text
Liver-Gallbladder Damp-Heat
    ↓ may_pour_downward_to
Lower Jiao
    ↓ may_affect
Bladder
```

**Confidence:** high

Potential resulting Pattern:
- Bladder Damp-Heat

Do not equate all Lower Jiao Damp-Heat with Bladder Damp-Heat.

---

# 5. Spleen / Damp / Phlegm graph family

## SP-G01 — Spleen Qi Deficiency → Dampness

```text
Spleen Qi Deficiency
    ↓ may_generate
Dampness
```

**Confidence:** very high

### Formula anchors
- Shen Ling Bai Zhu San
- Liu Jun Zi Tang
- Er Chen Tang root logic

---

## SP-G02 — Dampness → Phlegm

```text
Dampness
    ↓ may_condense_into
Phlegm
```

**Confidence:** very high

This is a central TCM mechanism edge.

---

## SP-G03 — Spleen Qi Deficiency → Phlegm-Damp

Use as a derived graph path:

```text
Spleen Qi Deficiency
→ Dampness
→ Phlegm-Damp
```

Rather than a separate direct edge if graph traversal can derive it.

---

## SP-G04 — Spleen Qi Deficiency → Qi Sinking

```text
Spleen Qi Deficiency
    ↓ may_progress_to
Spleen Qi Sinking
```

**Confidence:** high

---

## SP-G05 — Spleen Qi Deficiency → Spleen Not Controlling Blood

```text
Spleen Qi Deficiency
    ↓ may_fail_to_hold
Blood
    ↓
Spleen Not Controlling Blood
```

**Confidence:** very high

---

## SP-G06 — Spleen Qi Deficiency → Spleen Yang Deficiency

```text
Spleen Qi Deficiency
    ↓ may_progress_to
Spleen Yang Deficiency
```

**Confidence:** high

Not mandatory progression.

---

## SP-G07 — Spleen Yang Deficiency → Water/Damp retention

```text
Spleen Yang Deficiency
    ↓ may_cause
Dampness / Water Retention
```

**Confidence:** high

---

## SP-G08 — Spleen Deficiency → Chong instability

```text
Spleen Qi Deficiency
    ↓ fails_to_hold / fails_to_secure
Blood / Chong
    ↓
Chong instability / uterine bleeding context
```

**Confidence:** high

### Formula anchor
- Gu Chong Tang

### Ontology note
Prefer this graph over a very long canonical Pattern ID.

---

# 6. Kidney / Water / Lung graph family

## KI-G01 — Kidney Qi Deficiency → Kidney Qi Not Firm

```text
Kidney Qi Deficiency
    ↓ may_progress_to
Kidney Qi Not Firm
```

**Confidence:** high

### Identity discriminator
Not Firm requires leakage / securing failure.

---

## KI-G02 — Kidney Qi Deficiency → Kidney Failing to Grasp Qi

```text
Kidney Qi Deficiency
    ↓ may_fail_to_grasp
Lung Qi
    ↓
Kidney Failing to Grasp Qi
```

**Confidence:** high

### Clinical direction
- inspiratory weakness
- chronic dyspnea

---

## KI-G03 — Kidney Qi Deficiency → Kidney Yang Deficiency

```text
Kidney Qi Deficiency
    ↓ may_progress_to
Kidney Yang Deficiency
```

**Confidence:** moderate-high

Use context-sensitive wording.

---

## KI-G04 — Kidney Yang Deficiency → Water Flooding

```text
Kidney Yang Deficiency
    ↓ may_cause
Water Retention / Water Flooding
```

**Confidence:** very high

### Formula anchors
- Zhen Wu Tang
- Jin Gui Shen Qi Wan
- Shi Pi Yin contexts

---

## KI-G05 — Water Flooding → Lung

```text
Water Flooding
    ↓ may_affect
Lung
```

**Confidence:** high

Possible result:
- dyspnea
- cough
- retained fluids

---

## KI-G06 — Water Flooding → Heart

```text
Water Flooding
    ↓ may_affect
Heart
```

**Confidence:** high

Possible result:
- palpitations
- chest oppression
- Heart Yang / Water-Qi interaction

---

## KI-G07 — Kidney Yin Deficiency → Deficiency Fire

```text
Kidney Yin Deficiency
    ↓ may_generate
Deficiency Fire
```

**Confidence:** very high

Potential subtype:
- Kidney Yin Deficiency with Fire Flaring

---

## KI-G08 — Kidney Yin Deficiency → Liver Yin Deficiency

```text
Kidney Yin Deficiency
    ↓ fails_to_nourish
Liver Yin
```

**Confidence:** high

Supports combined:
- Liver-Kidney Yin Deficiency

---

## KI-G09 — Kidney Yin Deficiency → Heart-Kidney disharmony

```text
Kidney Yin / Water deficiency
    ↓ fails_to_nourish / fails_to_communicate_with
Heart
    ↓
Heart-Kidney Not Communicating
```

**Confidence:** high

### Canonical caution
Heart-Kidney Yin Deficiency and Heart-Kidney Not Communicating remain distinct concepts.

---

## KI-G10 — Kidney Jing Deficiency → reproductive/developmental contexts

```text
Kidney Jing Deficiency
    ↓ may_manifest_in
growth / marrow / bone / fertility / reproductive weakness
```

**Confidence:** high

These endpoints are manifestations/contexts, not new Pattern IDs.

---

# 7. Lung graph family

## LU-G01 — Wind-Cold → Lung

```text
Wind-Cold
    ↓ may_affect
Lung
    ↓
Wind-Cold Attacking Lung
```

**Confidence:** very high

Broad exterior Pattern and Lung subtype stay separate.

---

## LU-G02 — Wind-Heat → Lung

```text
Wind-Heat
    ↓ may_affect
Lung
    ↓
Wind-Heat Attacking Lung
```

**Confidence:** very high

---

## LU-G03 — Wind-Heat / exterior Heat → Lung Heat

```text
Wind-Heat
    ↓ may_enter / may_progress_to
Lung Heat
```

**Confidence:** high

Not inevitable.

---

## LU-G04 — Lung Heat → Fluid Injury

```text
Lung Heat
    ↓ damages_fluids
Fluid Deficiency / Lung Yin injury
```

**Confidence:** high

---

## LU-G05 — Lung Qi Deficiency ↔ Spleen Qi Deficiency

Better modeled as a combined-pattern relation:

```text
Lung Qi Deficiency
    concurrent_with
Spleen Qi Deficiency
    ↓
Lung-Spleen Qi Deficiency
```

**Confidence:** high

Do not imply one universally causes the other.

---

## LU-G06 — Lung Qi Deficiency ↔ Kidney Qi Deficiency

```text
Lung Qi Deficiency
    concurrent_with
Kidney Qi Deficiency
    ↓
Lung-Kidney Qi Deficiency
```

**Confidence:** high

Can progress toward Kidney failing to grasp Qi in chronic respiratory disease contexts.

---

## LU-G07 — Phlegm-Damp → Lung obstruction

```text
Phlegm-Damp
    ↓ obstructs
Lung
    ↓
Phlegm-Damp Obstructing Lung
```

**Confidence:** very high

---

## LU-G08 — Phlegm + Heat → Lung

```text
Phlegm
+ Heat
    ↓ coexists_with / combines_with
Phlegm-Heat
    ↓ obstructs
Lung
```

**Confidence:** high

Result:
- Phlegm-Heat Obstructing Lung

---

## LU-G09 — Cold + Phlegm → Lung

```text
Cold
+ Phlegm
    ↓
Cold-Phlegm
    ↓ obstructs
Lung
```

**Confidence:** high

---

# 8. Heart / Shen graph family

## HT-G01 — Heart Qi Deficiency → Heart Yang Deficiency

```text
Heart Qi Deficiency
    ↓ may_progress_to
Heart Yang Deficiency
```

**Confidence:** high

---

## HT-G02 — Heart Yang Deficiency → Water Qi affecting Heart

```text
Heart Yang Deficiency
    ↓ weakens fluid movement
Water Qi / retained fluids
    ↓ affects
Heart
```

**Confidence:** moderate-high

Formula family:
- Ling Gui Zhu Gan Tang
- Zhen Wu Tang contexts

---

## HT-G03 — Heart Fire → Small Intestine Heat

```text
Heart Fire
    ↓ transfers_heat_to
Small Intestine
    ↓
Small Intestine Excess Heat
```

**Confidence:** very high

Formula anchor:
- Dao Chi San

---

## HT-G04 — Phlegm + Fire → Heart/Shen

```text
Phlegm
+ Fire/Heat
    ↓
Phlegm-Fire
    ↓ disturbs
Heart / Shen
```

**Confidence:** high

Result:
- Phlegm-Fire Disturbing Heart

---

## HT-G05 — Phlegm → Heart Orifices

```text
Phlegm / turbidity
    ↓ obstructs
Heart Orifices
```

**Confidence:** high

Heat can be an added modifier:
- Phlegm-Heat obstructing orifices

---

## HT-G06 — Heart Blood Deficiency → Shen undernourishment

```text
Heart Blood Deficiency
    ↓ fails_to_nourish
Shen
```

**Confidence:** high

Manifestations:
- insomnia
- poor memory
- palpitations

Keep these as manifestation relations rather than new Pattern nodes.

---

## HT-G07 — Heart Yin Deficiency → Deficiency Heat disturbing Shen

```text
Heart Yin Deficiency
    ↓ may_generate
Deficiency Heat
    ↓ disturbs
Shen
```

**Confidence:** high

---

# 9. Stomach / Intestine graph family

## ST-G01 — Stomach Heat → Stomach Fire

```text
Stomach Heat
    ↓ may_intensify_to
Stomach Fire
```

**Confidence:** high

### Locked AcuTing decision
Some sources use the terms interchangeably, but AcuTing preserves the severity distinction.

This edge should carry a source-conflict note.

---

## ST-G02 — Stomach Fire → Stomach Yin / Fluid damage

```text
Stomach Fire
    ↓ damages_yin / damages_fluids
Stomach Yin / Fluid Deficiency
```

**Confidence:** high

Formula anchor:
- Yu Nu Jian

---

## ST-G03 — Stomach Qi deficiency / dysfunction → rebellion

```text
Stomach Qi Deficiency
or
Stomach Qi dysfunction
    ↓ fails_to_descend
Rebellious Stomach Qi
```

**Confidence:** high

But rebellion can also arise from:
- Heat
- Cold
- Phlegm
- Liver invasion

So `Rebellious Stomach Qi` is a functional-direction Pattern with multiple causes.

---

## ST-G04 — Liver Qi → Stomach rebellion

```text
Liver Qi Invading Stomach
    ↓ disrupts_descending
Stomach Qi
    ↓
Rebellious Stomach Qi manifestations
```

**Confidence:** very high

---

## ST-G05 — Food Stagnation → Heat

```text
Food Stagnation
    ↓ may_generate
Heat
```

**Confidence:** high

---

## ST-G06 — Food Stagnation → Phlegm/Damp

```text
Food Stagnation
    ↓ contributes_to
Dampness / Phlegm
```

**Confidence:** moderate-high

---

## LI-G01 — Intestinal Heat → Fluid damage

```text
Large Intestine Heat / Yang Ming Heat
    ↓ damages_fluids
Dryness / Fluid Deficiency
```

**Confidence:** high

---

# 10. Blood / Qi graph family

## QB-G01 — Qi Deficiency → Blood Stasis

```text
Qi Deficiency
    ↓ weak propulsion
Blood Stasis
```

**Relation:** `contributes_to` / `may_cause`  
**Confidence:** high

Formula anchor:
- Bu Yang Huan Wu Tang

---

## QB-G02 — Qi Stagnation → Blood Stasis

```text
Qi Stagnation
    ↓ prolonged obstruction
Blood Stasis
```

**Confidence:** very high

---

## QB-G03 — Cold → Blood Stasis

```text
Cold
    ↓ congeals
Blood
    ↓
Blood Stasis
```

**Confidence:** very high

Clinical branches:
- uterus
- channels
- abdomen

---

## QB-G04 — Heat → Blood Stasis

```text
Heat
    ↓ may_contribute_to
Blood Stasis
```

**Confidence:** moderate-high

Mechanism may involve drying/congealing or Blood-level disturbance depending context.

---

## QB-G05 — Blood Deficiency → Blood Stasis

```text
Blood Deficiency
    ↓ may_contribute_to
Blood Stasis
```

**Confidence:** moderate

Keep context-sensitive.

---

## QB-G06 — Blood Heat → Reckless Bleeding

```text
Blood Heat
    ↓ forces_blood_out
Bleeding
```

**Confidence:** very high

---

## QB-G07 — Xue-stage Heat → bleeding

```text
Xue-stage Heat
    ↓ forces_blood_out
Bleeding
```

**Confidence:** very high

Do not alias Xue-stage Heat to Blood Heat.

---

# 11. Bi / Channel graph family

## CH-G01 — Wind + Cold + Damp → Bi obstruction

```text
Wind
+ Cold
+ Damp
    ↓ obstruct
Channels
    ↓
Wind-Cold-Damp Bi
```

**Confidence:** very high

---

## CH-G02 — Wind-Cold-Damp Bi → Heat transformation

```text
Wind-Cold-Damp Bi
    ↓ prolonged constraint may_transform_into
Wind-Damp-Heat Bi
```

**Confidence:** high

---

## CH-G03 — Phlegm → Channel obstruction

```text
Phlegm
    ↓ obstructs
Channels / Collaterals
```

**Confidence:** high

---

## CH-G04 — Blood Stasis → Channel obstruction

```text
Blood Stasis
    ↓ obstructs
Channels / Collaterals
```

**Confidence:** very high

---

## CH-G05 — Cold → Channel contraction/obstruction

```text
Cold
    ↓ contracts / obstructs
Channels / Sinews
```

**Confidence:** very high

Could result in:
- pain
- stiffness
- reduced ROM
- Jingjin contraction

---

## CH-G06 — Wind-Phlegm → head/face channels

```text
Wind-Phlegm
    ↓ obstructs
Head / Face Channels
```

**Confidence:** high

Formula anchor:
- Qian Zheng San

---

# 12. Gynecology / Chong-Ren graph family

## GYN-G01 — Spleen Deficiency → Chong instability

```text
Spleen Qi Deficiency
    ↓ fails_to_hold
Blood / Chong
    ↓
Chong instability
```

**Confidence:** high

Formula:
- Gu Chong Tang

---

## GYN-G02 — Chong-Ren Deficiency + Cold

```text
Chong-Ren Deficiency
    concurrent_with
Deficiency Cold
```

Possible result:
- Chong-Ren Deficiency-Cold

**Confidence:** high

---

## GYN-G03 — Chong-Ren Deficiency + Blood Deficiency

```text
Chong-Ren Deficiency
    concurrent_with
Blood Deficiency
```

Formula:
- Jiao Ai Tang

**Confidence:** high

---

## GYN-G04 — Cold → uterine Blood Stasis

```text
Cold
    ↓ congeals
Blood
    ↓ located_in
Uterus / Chong-Ren
```

**Confidence:** very high

Result:
- Cold Congealing Blood in Uterus
- Chong-Ren deficiency-Cold with Blood Stasis in deficiency contexts

---

## GYN-G05 — Liver Heat/Fire → Chong-Ren

```text
Liver Qi Stagnation
    ↓ may_transform_into
Heat / Fire
    ↓ disturbs / injures
Chong-Ren
```

**Confidence:** high

Formula:
- Gu Jing Wan source family

---

## GYN-G06 — Blood Heat → Chong-Ren bleeding

```text
Blood Heat
    ↓ affects
Chong-Ren
    ↓ forces_blood_out
Uterine bleeding
```

**Confidence:** high

---

## GYN-G07 — Kidney deficiency → fetal instability context

```text
Kidney Qi / Jing Deficiency
    ↓ fails_to_secure
pregnancy / fetal root
```

**Confidence:** high within traditional gynecology framework

### Important
Endpoint belongs to pregnancy TCM disease/context, not a generic Pattern ID.

Formula:
- Shou Tai Wan

---

## GYN-G08 — Spleen deficiency + Liver constraint + Damp → Dai Mai

```text
Spleen Qi Deficiency
+ Liver Qi Stagnation
+ Dampness
    ↓ affects
Dai Mai
    ↓
Dai Mai Dysfunction / vaginal-discharge context
```

**Confidence:** high for Wan Dai Tang source context

Do not universalize to every Dai Mai dysfunction case.

---

# 13. Extraordinary Vessel graph family

## EV-G01 — Yin Qiao ↔ Yang Qiao paired regulation

```text
Yin Qiao Mai
    ↔ paired_function_with
Yang Qiao Mai
```

**Confidence:** very high

Regulates:
- eye opening/closing
- sleep/wake
- medial/lateral muscular balance

---

## EV-G02 — Yin Qiao imbalance

```text
Yin Qiao imbalance
    → associated_with
陽緩陰急
    → associated_with
hypersomnia tendency
```

**Confidence:** high

Do not create cause/effect direction beyond source support.

---

## EV-G03 — Yang Qiao imbalance

```text
Yang Qiao imbalance
    → associated_with
陰緩陽急
    → associated_with
insomnia/wakefulness tendency
```

**Confidence:** high

---

## EV-G04 — Dai Mai binds longitudinal channels

```text
Dai Mai
    ↓ binds / regulates
Longitudinal Channels
```

**Confidence:** high

Dysfunction may relate to:
- waist/pelvic instability
- discharge
- lower-limb weakness

---

## EV-G05 — Chong Mai Qi Rebellion

```text
Chong Mai Qi
    ↓ rebels_upward
Abdomen → Chest / Heart region
```

**Confidence:** high

Differentiate from:
- Stomach Qi Rebellion
- Liver Qi invading Stomach

---

## EV-G06 — Yin Wei internal linking

```text
Yin Wei Mai
    ↓ links
Yin Channels / interior
```

Associated chest-abdominal pain/constraint remains supporting evidence, not deterministic.

---

## EV-G07 — Yang Wei exterior/Yang linking

```text
Yang Wei Mai
    ↓ links
Yang Channels / exterior
```

Associated:
- alternating Cold/Heat
- head/neck/shoulder trajectory

Do not alias to Shao Yang.

---

# 14. Six-Channel graph family

## SC-G01 — Tai Yang subtype siblings

```text
Tai Yang
  ├─ Tai Yang Zhong Feng
  └─ Tai Yang Shang Han
```

**Relation:** `subtype_of`

---

## SC-G02 — Tai Yang → Yang Ming

```text
Tai Yang
    ↓ may_enter
Yang Ming
```

**Confidence:** high

---

## SC-G03 — Tai Yang → Shao Yang

```text
Tai Yang
    ↓ may_enter
Shao Yang
```

**Confidence:** high

---

## SC-G04 — Shao Yang concurrent with Yang Ming

```text
Shao Yang
    concurrent_with
Yang Ming Interior Excess
```

Formula:
- Da Chai Hu Tang

**Confidence:** high

---

## SC-G05 — Tai Yin → Shao Yin

```text
Tai Yin deficiency/cold
    ↓ may_progress_to
Shao Yin deficiency/cold
```

**Confidence:** moderate-high

Do not encode as mandatory.

---

## SC-G06 — Shao Yin alternative transformations

```text
Shao Yin
  ├─ Cold Transformation
  └─ Heat Transformation
```

Relation:
- `subtype_of`
- siblings / `alternative_transformation`

Do **not** encode Cold → Heat or Heat → Cold automatically.

---

## SC-G07 — Jue Yin mixed Cold/Heat

```text
Jue Yin
    ↓ may_manifest_as
Cold / Heat / mixed Cold-Heat
```

Canonical review should distinguish:
- broad Jue Yin stage
- stable subtype cards

---

# 15. Four-Level graph family

## WQYX-G01 — Wei → Qi

```text
Wei-stage
    ↓ may_progress_to
Qi-stage
```

**Confidence:** very high

---

## WQYX-G02 — Qi → Ying

```text
Qi-stage
    ↓ may_progress_to
Ying-stage
```

**Confidence:** very high

---

## WQYX-G03 — Ying → Xue

```text
Ying-stage
    ↓ may_progress_to
Xue-stage
```

**Confidence:** very high

### Critical
These are possible transmission paths, not guaranteed sequences.

---

## WQYX-G04 — Ying Heat → Pericardium/Shen

```text
Ying-stage Heat
    ↓ may_affect
Pericardium / Shen
```

**Confidence:** high

---

## WQYX-G05 — Xue Heat → Bleeding

```text
Xue-stage Heat
    ↓ forces_blood_out
Bleeding
```

**Confidence:** very high

---

## WQYX-G06 — Xue Heat → Internal Wind

```text
Extreme Xue-stage Heat
    ↓ may_generate
Internal Wind
```

**Confidence:** high

Formula:
- Ling Jiao Gou Teng Tang

---

## WQYX-G07 — Xue Heat + Blood Stasis

```text
Xue-stage Heat
    concurrent_with
Blood Stasis
```

**Confidence:** high

Formula:
- Xi Jiao Di Huang Tang source family

---

# 16. Cross-system graph

These are not aliases.

## XSYS-G01

```text
Yang Ming Jing
    ↔ crosswalk_overlap
Qi-stage Stomach Heat
    ↔ clinical_overlap_not_alias
Stomach Heat
```

---

## XSYS-G02

```text
Yang Ming Fu
    ↔ crosswalk_overlap
Qi-stage Intestinal Dry Heat
    ↔ clinical_overlap_not_alias
Large Intestine Excess Heat
```

---

## XSYS-G03

```text
Tai Yang Shang Han
    ↔ clinical_overlap_not_alias
Wind-Cold
    ↔ broader_than
Wind-Cold Attacking Lung
```

---

## XSYS-G04

```text
Wei-stage Wind-Heat
    ↔ framework_specific_overlap
Wind-Heat
    ↔ broader_than
Wind-Heat Attacking Lung
```

---

## XSYS-G05

```text
Tai Yin Deficiency-Cold
    ↔ clinical_overlap_not_alias
Spleen Yang Deficiency
```

---

## XSYS-G06

```text
Shao Yin Cold
    ↔ clinical_overlap_not_alias
Kidney Yang Deficiency
```

Shao Yin Cold carries stage/depth identity.

---

## XSYS-G07

```text
Shao Yin Heat
    ↔ clinical_overlap_not_alias
Heart-Kidney Yin Deficiency
    ↔ related_but_distinct
Heart-Kidney Not Communicating
```

---

## XSYS-G08

```text
Xue-stage Heat
    ↔ related_but_distinct
Blood Heat
```

Stage is identity-bearing.

---

## XSYS-G09

```text
Jue Yin Mixed Cold-Heat
    subtype_of / framework_specific_expression_of
Mixed Cold and Heat
```

Use the relation supported by the live ontology.

---

## XSYS-G10

```text
Shao Yang
    ↔ clinical_overlap_not_alias
Yang Wei Mai Disharmony
```

Shared alternating Cold/Heat is insufficient for aliasing.

---

# 17. San Jiao graph

## SJ-G01 — Damp-Heat through San Jiao

```text
Damp-Heat
    ↓ may_obstruct
San Jiao Qi / fluid pathways
```

Possible locations:
- Upper Jiao
- Middle Jiao
- Lower Jiao

---

## SJ-G02 — Middle Jiao Damp-Heat

```text
Damp-Heat
    ↓ located_in
Middle Jiao
```

Crosswalk:
- Spleen-Stomach Damp-Heat

Not hard alias.

---

## SJ-G03 — Lower Jiao Damp-Heat

```text
Damp-Heat
    ↓ located_in
Lower Jiao
```

Can affect:
- Bladder
- Liver/GB downward pathway
- reproductive/genital region
- lower limbs

---

## SJ-G04 — Middle Jiao Yang deficiency

Prefer:

```text
Spleen/Stomach Yang deficiency
    ↓ located_in
Middle Jiao
```

rather than a duplicate canonical Pattern unless future sources justify one.

---

# 18. TCM disease / context graph

## Context rule

A TCM disease is not a Pattern.

Preferred direction:

```text
tdis.xxx
    may_have_pattern
pattern.xxx
```

and/or:

```text
pattern.xxx
    may_present_in
tdis.xxx
```

---

## TDIS-G01 — Bi Syndrome

```text
tdis.bi_syndrome
  → may_have_pattern →
  Wind-Cold-Damp Bi
  Wind-Damp-Heat Bi
  Phlegm-Blood Stasis obstruction
  Qi-Blood deficiency root
  Liver-Kidney deficiency root
```

---

## TDIS-G02 — Wei Syndrome

```text
tdis.wei_syndrome
  → may_have_pattern →
  Spleen/Stomach Qi Deficiency
  Liver/Kidney Deficiency
  Lung Heat + Fluid Injury
  Qi Deficiency + Blood Stasis
```

---

## TDIS-G03 — Lin Syndrome

Current V1 Lin subtype cards are preserved.

Do not restructure during this graph pass.

---

## TDIS-G04 — Insomnia

```text
tdis.insomnia
  → may_have_pattern →
  Heart Blood Deficiency
  Heart Yin Deficiency
  Heart-Kidney Not Communicating
  Liver Fire
  Phlegm-Fire Disturbing Heart
  Yang Qiao imbalance
```

Do not imply all are equally common.

---

## TDIS-G05 — Gynecologic bleeding

```text
tdis.uterine_bleeding
  → may_have_pattern →
  Spleen Not Controlling Blood
  Chong-Ren Deficiency-Cold
  Chong-Ren Blood Heat
  Blood Stasis
  Blood Heat
```

---

## TDIS-G06 — Threatened miscarriage / fetal instability

```text
tdis.threatened_miscarriage
  → may_have_pattern →
  Kidney Qi/Jing Deficiency
  Chong-Ren Deficiency
  Blood Heat
  Blood Stasis
```

Exact mapping requires source-specific validation.

---

# 19. Biomedical condition graph safety rule

Biomedical conditions must connect via **association**, never identity.

Allowed semantic model:

```text
pattern.liver_wind
    associated_with_condition
cond.essential_tremor
```

Not:

```text
pattern.liver_wind = Parkinson's disease
```

Likewise:

```text
pattern.liver_fire
    may_occur_in
cond.hypertension
```

is acceptable if source-backed.

Biomedical diagnosis and safety/red-flag logic must remain separate.

---

# 20. Graph cycles to avoid

Some relationships are directional and should not become accidental loops.

## Bad

```text
Spleen Qi Deficiency
→ Dampness
→ Spleen Qi Deficiency
```

unless the second edge is explicitly modeled as **aggravates**, not causes.

## Better

```text
Spleen Qi Deficiency
→ may_generate Dampness

Dampness
→ may_impair Spleen transformation
```

This creates a documented reinforcing cycle with distinct semantics.

---

## Another example

```text
Liver Qi Stagnation
→ Heat

Heat
→ worsens Qi constraint
```

If modeled, use `may_aggravate`, not `may_transform_into` in both directions.

---

# 21. Graph edges that should remain probabilistic

Do not state these as guaranteed:

- Wind-Cold → Heat
- Stomach Heat → Stomach Fire
- Liver Qi Stagnation → Liver Fire
- Liver Yang Rising → Liver Wind
- Spleen Qi Deficiency → Spleen Yang Deficiency
- Tai Yang → Yang Ming
- Wei → Qi → Ying → Xue
- Kidney Yang Deficiency → Water flooding

Use `may_*` semantics where appropriate.

---

# 22. Suggested graph-edge schema

Staging-only example:

```json
{
  "edge_id": "edge.spleen_qi_deficiency.generates.dampness",
  "from_id": "pattern.spleen_qi_deficiency",
  "relation_semantic": "may_generate",
  "to_id": "candidate.dampness",
  "directional": true,
  "confidence": "very_high",
  "framework": ["zang_fu", "qi_xue_jin_ye"],
  "source_evidence": [
    {
      "source_type": "formula",
      "source_name": "Shen Ling Bai Zhu San"
    },
    {
      "source_type": "textbook",
      "source_name": "TCM pattern differentiation"
    }
  ],
  "notes": "Use existing production relation key if equivalent."
}
```

---

# 23. Graph-node policy

A relation endpoint may initially be one of:

```text
canonical_pattern
candidate_pattern
taxonomy_node
tcm_disease
biomedical_condition
meridian
extraordinary_vessel
symptom
mechanism_modifier
stage
location
```

Do not force every endpoint into `pattern.*`.

This is especially important for:
- Dampness
- Heat
- Cold
- Fire
- Water
- Shen
- Upper/Middle/Lower Jiao
- bleeding
- pregnancy
- channels

Some may already have taxonomy IDs rather than clinical cards.

---

# 24. Priority graph edges for first implementation review

## Tier A — foundational edges

1. Spleen Qi Deficiency → may_generate → Dampness
2. Dampness → may_condense_into → Phlegm
3. Liver Qi Stagnation → may_transform_into → Heat
4. Liver Qi Stagnation → invades → Stomach
5. Liver Qi Stagnation → invades → Spleen
6. Liver Yang Rising → may_generate → Internal Liver Wind
7. Blood Deficiency → may_generate → Internal Wind
8. Kidney Yang Deficiency → may_cause → Water Flooding
9. Water Flooding → may_affect → Lung
10. Water Flooding → may_affect → Heart
11. Kidney Yin Deficiency → may_generate → Deficiency Fire
12. Heart Fire → transfers_heat_to → Small Intestine
13. Stomach Heat → may_intensify_to → Stomach Fire
14. Stomach Fire → damages_yin → Stomach Yin
15. Qi Stagnation → contributes_to → Blood Stasis
16. Cold → congeals → Blood Stasis
17. Phlegm → obstructs → Channels
18. Blood Stasis → obstructs → Channels
19. Wind-Cold → may_affect → Lung
20. Wind-Heat → may_affect → Lung

---

## Tier B — system/stage edges

21. Tai Yang Zhong Feng → subtype_of → Tai Yang
22. Tai Yang Shang Han → subtype_of → Tai Yang
23. Tai Yang → may_enter → Yang Ming
24. Tai Yang → may_enter → Shao Yang
25. Shao Yin Cold / Heat → subtype_of → Shao Yin
26. Wei → stage_precedes → Qi
27. Qi → stage_precedes → Ying
28. Ying → stage_precedes → Xue
29. Ying Heat → affects → Pericardium/Shen
30. Xue Heat → may_generate → Internal Wind
31. Yang Ming Jing ↔ crosswalk_overlap ↔ Qi-stage Stomach Heat
32. Yang Ming Fu ↔ crosswalk_overlap ↔ Qi-stage Intestinal Dry Heat
33. Xue-stage Heat ↔ related_but_distinct ↔ Blood Heat

---

## Tier C — gyne/channel/vessel edges

34. Spleen deficiency → fails_to_hold → Chong
35. Cold → congeals → uterine Blood Stasis
36. Liver Heat/Fire → disturbs → Chong-Ren
37. Kidney Qi/Jing deficiency → fails_to_secure → pregnancy context
38. Dai Mai → binds → longitudinal channels
39. Yin Qiao ↔ paired_function_with ↔ Yang Qiao
40. Chong Qi → rebels_upward → abdomen/chest
41. Wind-Cold-Damp → obstructs → channels
42. Phlegm-Blood Stasis → obstructs → channels
43. Yang Wei → links → Yang channels/exterior
44. Yin Wei → links → Yin channels/interior

---

# 25. Relation QA rules

Before any production graph write:

1. Confirm both endpoints exist or have an approved staging representation.
2. Confirm the relation key exists in the live registry.
3. Confirm direction.
4. Confirm whether relation is:
   - deterministic
   - probabilistic
   - subtype
   - overlap
   - context
5. Attach provenance.
6. Avoid duplicate inverse edges if the graph derives inverses automatically.
7. Avoid same-concept alias edges when canonical deprecation already handles identity.
8. No biomedical equivalence.
9. No symptom → Pattern causal claim unless source supports it.
10. Do not infer point/formula relations from Pattern graph alone.
11. Cross-system overlap must not become alias.
12. Progression must not imply inevitability.
13. Compound-pattern edges should not silently create new canonical nodes.
14. Relation validators must pass before commit.

---

# 26. Graph visualization concepts for future AcuTing UI

Not for immediate implementation, but this graph pack supports future UI modes.

## A. “How did this Pattern develop?”
Example:

```text
Spleen Qi Deficiency
  → Dampness
  → Phlegm
  → Phlegm-Damp Obstructing Lung
```

## B. “What can this Pattern turn into?”
Example:

```text
Liver Qi Stagnation
  → Heat
  → Liver Fire
  → Internal Wind
```

## C. “Why are these two different?”
Example:

```text
Yang Ming Jing
  ↔ cross-system overlap
Qi-stage Stomach Heat
  ↔ overlap
Stomach Heat

same clinical heat cluster
different diagnostic framework
```

## D. “Root and branch”
Example:

```text
Kidney Yang Deficiency [root]
  → Water Flooding [branch]
  → Lung dyspnea / Heart palpitations [manifestations]
```

## E. “Board progression mode”
Example:

```text
Wei → Qi → Ying → Xue
```

with explicit label:
**possible progression, not mandatory sequence**

---

# 27. What Antigravity should produce after receiving Batches 02–10

Before changing production data, Antigravity should create one consolidated review artifact:

## `PATTERN_V2_CANDIDATE_GRAPH_REVIEW.md`

Recommended sections:

### A. Candidate identity reconciliation
```text
source candidate
→ current registry match
→ alias?
→ subtype?
→ new?
→ hold?
```

### B. Proposed new canonical Patterns

### C. Proposed aliases

### D. Proposed relationship edges

### E. Proposed cross-system overlaps

### F. Proposed TCM disease relations

### G. Proposed deprecated/legacy mappings

### H. Missing evidence / unresolved conflicts

### I. Validator/schema changes required

### J. Proposed implementation batches

Antigravity should **stop after producing this review artifact** and wait for Ting's approval before mass implementation.

---

# 28. Recommended V2 implementation order after human review

### Phase V2-A
Core high-confidence missing Zang-Fu / Qi-Blood-Fluid Patterns

### Phase V2-B
Six Channels + Four Levels

### Phase V2-C
San Jiao + Eight-Principle mixed Patterns

### Phase V2-D
Gynecology / Chong-Ren / Jing

### Phase V2-E
Extraordinary Vessels / Channel mechanisms

### Phase V2-F
Differential-comparison objects

### Phase V2-G
Relationship graph edges

This order prevents relations from pointing at unstable candidate identities.

---

# 29. Freeze boundary

Pattern V1 is a separate frozen baseline.

Batch 10 and the previous Antigravity packs belong to **Pattern V2 research**.

Rules:

- do not silently mutate V1 canonical IDs
- V1 corrections require explicit migration decisions
- new Patterns are V2 additions
- aliases/relations may enrich V1 nodes if explicitly approved
- deprecated V1 import artifacts remain historical provenance
- V2 graph work must not reopen settled V1 identity decisions without new evidence

---

# 30. Batch 10 master relation summary

```text
LIVER
Liver Qi Stagnation
→ Heat
→ Fire
→ may generate Wind
→ may damage Yin

LIVER CROSS-ORGAN
Liver Qi
→ Stomach
→ Spleen
Liver Fire
→ Lung

SPLEEN / PHLEGM
Spleen Qi Deficiency
→ Dampness
→ Phlegm
→ Lung / Channels / Orifices

KIDNEY / WATER
Kidney Qi Deficiency
→ Not Firm / Fails to Grasp Qi
Kidney Yang Deficiency
→ Water Flooding
→ Lung / Heart
Kidney Yin Deficiency
→ Deficiency Fire
→ Liver/Heart consequences

STOMACH
Stomach Heat
→ Stomach Fire
→ Yin/Fluid damage
Stomach dysfunction
→ rebellious Qi

QI / BLOOD
Qi Stagnation
→ Blood Stasis
Cold
→ Blood Stasis
Qi Deficiency
→ contributes to Blood Stasis
Blood Heat
→ bleeding

CHANNELS
Wind + Cold + Damp
→ Bi obstruction
Phlegm
→ channel obstruction
Blood Stasis
→ channel obstruction

GYNE
Spleen deficiency
→ Chong instability
Cold
→ uterine Blood Stasis
Liver Heat/Fire
→ disturbs Chong-Ren
Kidney deficiency
→ pregnancy instability context

SIX CHANNELS
Tai Yang
→ Yang Ming / Shao Yang
Shao Yin
→ Cold or Heat transformation

FOUR LEVELS
Wei
→ Qi
→ Ying
→ Xue
Xue Heat
→ bleeding / Wind

EXTRAORDINARY VESSELS
Yin Qiao ↔ Yang Qiao
Dai Mai → binds longitudinal channels
Chong Qi → rebels upward
Yin Wei / Yang Wei → link Yin / Yang channel systems
```

---

# 31. Source basis

Batch 10 synthesizes the source-backed evidence and ontology decisions already preserved in:

- Batch 02 — combined/mechanism/channel candidates
- Batch 03 — Full Zang-Fu expansion
- Batch 04 — Gynecology / Chong-Ren / Jing
- Batch 05 — Canonical Candidate Master Map
- Batch 06 — Formula-to-Pattern Inversion
- Batch 07 — Six Channels / Four Levels / San Jiao / Eight Principles
- Batch 08 — Extraordinary Vessels / Channel System
- Batch 09 — Differential Matrix
- Pattern V1 Canonical Gap Pack
- Pattern V1 semantic comparison / dedup audit

Underlying source families include:
- Sacred Lotus
- Shen-Nong
- Me & Qi
- American Dragon
- NCBAHM 2026 formula corpus
- Bastyr course/formula materials
- user-curated extraordinary-vessel and meridian notes

No new canonical IDs or production relations are authorized by this file.

---

## End of Batch 10
