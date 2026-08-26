# Relation Endpoint Missing Candidates — Clean V2

**Date:** 2026-08-09  
**Scope:** endpoint queue derived from 93 Western research cards, 75 TCM disease research cards, and 230 staged crosswalk atoms.  
**Purpose:** expand graph reuse without minting IDs prematurely.

## 1. Observed CURRENT symptom baseline from supplied audit

```text
sym.headache
sym.insomnia
sym.fatigue
```

TDIS registry references that must be reconciled before recreation:

```text
sym.fever
sym.edema
```

```yaml
sym.fever: RECONCILE_EXISTING_REFERENCE
sym.edema: RECONCILE_EXISTING_REFERENCE
```

## 2. P0 high-reuse symptom candidates

| Candidate | Why high priority | Important qualifier |
|---|---|---|
| `chest_pain` | MI, angina, PE, aortic disease, pneumothorax, 胸痺 | acute chest-pain safety route |
| `dyspnea` | HF, asthma, COPD, PE, pneumothorax, anemia, 喘證 | severity / SpO2 are measurements, not symptom IDs |
| `dizziness` | POTS, anemia, vestibular, TIA/stroke, hearing disease | distinguish vertigo/presyncope when clinically necessary |
| `palpitations` | POTS, arrhythmia, thyroid disease, 心悸 | subjective awareness, not ECG rhythm |
| `syncope` | cardiac, PE, POTS, aortic, neurologic | true LOC vs presyncope |
| `abdominal_pain` | appendicitis, obstruction, pancreatitis, ectopic, GU | location/onset qualifiers important |
| `nausea` | GI, migraine, pregnancy, MI, medications | reusable |
| `vomiting` | GI, pregnancy, adrenal crisis, neuro | dehydration/blood/bile are qualifiers |
| `cough` | URI, asthma, COPD, pneumonia, TB, cancer, 咳嗽 | duration and hemoptysis qualifiers |
| `wheeze` | asthma, COPD, 哮病 | subjective vs auscultatory source |
| `unilateral_leg_swelling` | DVT | laterality is essential; do not reduce to generic edema |
| `acute_visual_loss` | GCA, retinal detachment, glaucoma, TIA/stroke | time-sensitive |
| `speech_difficulty` | TIA/stroke | aphasia vs dysarthria qualifier may be useful later |
| `hearing_loss` | SSHL, Ménière, otitis, 耳鳴耳聾 | sudden vs chronic essential |
| `tinnitus` | Ménière, SSHL, otologic/vascular contexts | pulsatile vs nonpulsatile |
| `facial_pain` | trigeminal neuralgia, dental, sinus, 面痛 | distribution/trigger qualifiers |
| `numbness_or_paresthesia` | neuropathy, MS, radiculopathy, TIA/stroke, 麻木 | laterality/distribution |
| `dysuria` | cystitis, pyelonephritis, prostatitis, 淋證 | infection/stone context |
| `urinary_retention` | BPH, prostatitis, neurogenic bladder, cauda equina, 癃閉 | acute retention is urgent |
| `pelvic_pain` | endometriosis, PID, ectopic, torsion, 痛經 | pregnancy status changes urgency |
| `vaginal_bleeding` | AUB, ectopic, pregnancy complications, 崩漏 | quantity/hemodynamics |
| `sore_throat` | URI, tonsillitis/pharyngitis, 乳蛾 | airway features separate |
| `rhinorrhea` | URI, allergic rhinitis, 鼻鼽/鼻淵 | clear vs purulent qualifier |
| `nasal_congestion` | URI, allergic rhinitis, sinusitis | reusable |
| `joint_pain` | RA, gout, OA, Bi syndrome | hot swollen joint safety |
| `weakness` | GBS, MG, MS, stroke, cauda equina, 痿證 | focal vs generalized/progressive |
| `memory_problem` | dementia/MCI, mood/sleep causes, 健忘 | acute confusion is different |
| `night_sweats` | TB, menopause, endocrine/infectious contexts, 汗證 | fever/weight-loss context |

## 3. P1 candidates

```text
heartburn
acid_regurgitation
epigastric_pain
bloating
early_satiety
belching
orthopnea
hemoptysis
diaphoresis
back_pain
leg_pain
jaw_claudication
scalp_tenderness
chest_tightness
sneezing
nasal_itching
facial_pressure
reduced_smell
odynophagia
ear_fullness
vertigo
presyncope
imbalance
photophobia
visual_disturbance
flank_pain
hematuria
urinary_frequency
nocturia
menstrual_pain
menstrual_irregularity
heavy_menstrual_bleeding
hot_flash
hair_loss
oral_pain
tooth_pain
rectal_bleeding
weight_loss
weight_gain
polydipsia
polyuria
```

## 4. Sign / observation candidates requiring namespace review

```text
cyanosis
facial_weakness
tonsillar_swelling
cervical_lymph_node_tenderness
pulsatile_abdominal_mass
joint_swelling
rash / wheal / plaque morphology
jaundice
oral_ulcer
muscle_atrophy
facial_swelling
```

Do not auto-promote these into `sym.*` without deciding whether the repo needs a sign/exam-finding layer.

## 5. Measurements / labs / tests that must NOT become symptoms

```text
heart rate
blood pressure
respiratory rate
oxygen saturation
temperature value
troponin
TSH / free T4
ESR / CRP
D-dimer
ANC
hematocrit / hemoglobin
serum glucose / A1C
eGFR / creatinine
urine albumin
lipase
ECG finding
imaging finding
```

## 6. Endpoint promotion checklist

```yaml
exact_existing_ID_search: required
alias_search: required
namespace_classification: required
bilingual_label_source: required
symptom_vs_sign_vs_measurement_decision: required
qualifier_strategy: required
current_template_and_validator: required
existing_relation_migration_check: required
safety_consequence_review: required
provenance: required
```

## 7. Recommended first canonical endpoint wave

After reconciling `sym.fever` and `sym.edema`:

```text
chest_pain
dyspnea
dizziness
palpitations
syncope
abdominal_pain
nausea
vomiting
cough
wheeze
unilateral_leg_swelling
acute_visual_loss
speech_difficulty
hearing_loss
numbness_or_paresthesia
urinary_retention
vaginal_bleeding
```

No endpoint ID is authorized by this file.
