# Western Condition Research Batch I - Autoimmune / MSK / Dermatology / Genetic

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 8  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Rheumatoid Arthritis · 類風濕性關節炎

## Identity
```yaml
candidate_id: cond.rheumatoid_arthritis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Rheumatoid arthritis (RA) is a chronic systemic autoimmune inflammatory disease that primarily targets synovial joints and can cause progressive joint damage and extra-articular disease.

### `clinical_definition` [CANONICAL_NOW]
RA is distinct from osteoarthritis and from transient inflammatory arthralgia.

### `etiology` [CANONICAL_NOW]
Autoimmune susceptibility with genetic, smoking and environmental factors contributes.

### `pathophysiology` [CANONICAL_NOW]
Persistent synovitis drives pannus formation, cartilage/bone erosion and systemic inflammation.

### `presentation_clinical` [CANONICAL_NOW]
Symmetric small-joint pain/swelling, prolonged morning stiffness, fatigue and reduced function; extra-articular manifestations can occur.

### `key_features` [CANONICAL_NOW]
- autoimmune synovitis
- symmetrical inflammatory pattern
- erosive damage possible
- DMARD treatment changes prognosis

### `red_flags` [CANONICAL_NOW]
Hot single joint with fever, severe infection on immunosuppression, neurologic cervical-spine symptoms or cardiopulmonary complications need urgent assessment.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical synovitis plus RF/anti-CCP, inflammatory markers and imaging; diagnosis is clinical, not one lab alone.

### `differential_diagnosis` [CANONICAL_NOW]
- osteoarthritis
- psoriatic arthritis
- SLE
- gout
- viral arthritis

### `western_treatment` [CANONICAL_NOW]
Early DMARDs, biologic/targeted therapies, short-term anti-inflammatory symptom control and rehabilitation.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive pain support only; consider immunosuppression/infection risk and unstable cervical spine/severe osteoporosis.

## Proposed relations [DERIVED_RELATION]
- tdis.bi_zheng contextual
- joint_pain/swelling endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIAMS — Arthritis and Rheumatic Diseases — https://www.niams.nih.gov/health-topics/arthritis-and-rheumatic-diseases
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

# 02. Systemic Lupus Erythematosus · 全身性紅斑性狼瘡

## Identity
```yaml
candidate_id: cond.systemic_lupus_erythematosus
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
SLE is a chronic systemic autoimmune disease that can affect skin, joints, kidneys, nervous system, blood, lungs, heart and vessels.

### `clinical_definition` [CANONICAL_NOW]
SLE is heterogeneous and cannot be defined by a single positive ANA.

### `etiology` [CANONICAL_NOW]
Genetic susceptibility, hormones and environmental triggers contribute to loss of immune tolerance.

### `pathophysiology` [CANONICAL_NOW]
Autoantibodies and immune complexes drive inflammation and organ-specific injury.

### `presentation_clinical` [CANONICAL_NOW]
Fatigue, arthritis, photosensitive rash, oral ulcers, cytopenias and organ-specific symptoms; course often relapsing/remitting.

### `key_features` [CANONICAL_NOW]
- multisystem autoimmune disease
- ANA sensitive but nonspecific
- renal/CNS/hematologic involvement changes severity
- infection risk from treatment

### `red_flags` [CANONICAL_NOW]
Nephritis with severe hypertension/renal failure, CNS symptoms, chest pain/dyspnea, major cytopenia or infection on immunosuppression requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical criteria plus ANA and specific antibodies, complement, CBC, urinalysis/protein and organ-directed tests.

### `differential_diagnosis` [CANONICAL_NOW]
- RA
- viral illness
- fibromyalgia
- drug-induced lupus
- other connective-tissue disease

### `western_treatment` [CANONICAL_NOW]
Hydroxychloroquine and organ/severity-specific corticosteroid/immunosuppressive/biologic therapy; sun protection and risk-factor management.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive only; avoid treatment over active rash/infection and account for anticoagulation, cytopenias, steroids and immunosuppression.

## Proposed relations [DERIVED_RELATION]
- tdis.bi_zheng/shi_chuang contextual
- renal/hematology complications

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIAMS — Lupus — https://www.niams.nih.gov/health-topics/lupus
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

# 03. Myasthenia Gravis · 重症肌無力

## Identity
```yaml
candidate_id: cond.myasthenia_gravis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Myasthenia gravis is an autoimmune neuromuscular-junction disorder causing fluctuating fatigable skeletal-muscle weakness.

### `clinical_definition` [CANONICAL_NOW]
MG is distinct from central neurologic weakness and from Guillain-Barré syndrome; sensory function is usually preserved.

### `etiology` [CANONICAL_NOW]
Autoantibodies target acetylcholine-receptor or related neuromuscular-junction proteins; thymic abnormalities are associated.

### `pathophysiology` [CANONICAL_NOW]
Impaired neuromuscular transmission causes weakness that worsens with use and improves with rest.

### `presentation_clinical` [CANONICAL_NOW]
Ptosis, diplopia, facial/bulbar weakness, dysarthria/dysphagia, neck/proximal weakness and sometimes respiratory weakness.

### `key_features` [CANONICAL_NOW]
- fatigable weakness
- ocular/bulbar symptoms common
- sensation preserved
- myasthenic crisis is respiratory emergency

### `red_flags` [CANONICAL_NOW]
New dyspnea, weak cough, dysphagia, inability to handle secretions or rapidly worsening generalized weakness requires emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Antibody tests, electrodiagnostics and bedside pharmacologic/ice tests as appropriate; chest imaging evaluates thymus.

### `differential_diagnosis` [CANONICAL_NOW]
- GBS
- botulism
- motor neuron disease
- brainstem stroke
- thyroid eye disease

### `western_treatment` [CANONICAL_NOW]
Acetylcholinesterase inhibitors, immunotherapy, thymectomy in selected patients and IVIG/plasma exchange for crisis/exacerbation.

### `acupuncture_role` [CANONICAL_NOW]
Do not treat respiratory/bulbar worsening. Review medications that can exacerbate MG and coordinate with neurology.

## Proposed relations [DERIVED_RELATION]
- weakness/diplopia/dysphagia endpoints
- acute respiratory safety

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NINDS — Myasthenia Gravis — https://www.ninds.nih.gov/health-information/disorders/myasthenia-gravis
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

# 04. Psoriasis · 乾癬／銀屑病

## Identity
```yaml
candidate_id: cond.psoriasis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Psoriasis is a chronic immune-mediated skin disease causing well-demarcated inflammatory plaques and sometimes nail or joint disease.

### `clinical_definition` [CANONICAL_NOW]
Psoriasis is distinct from eczema, fungal rash and psoriatic arthritis although they may coexist in differential/related layers.

### `etiology` [CANONICAL_NOW]
Genetic/immune susceptibility with triggers such as infections, skin injury, stress and medications.

### `pathophysiology` [CANONICAL_NOW]
Immune activation accelerates keratinocyte turnover and produces chronic skin inflammation.

### `presentation_clinical` [CANONICAL_NOW]
Scaly erythematous plaques, often scalp/extensor surfaces, itching/pain, nail pitting; psoriatic arthritis may occur.

### `key_features` [CANONICAL_NOW]
- chronic immune-mediated skin disease
- plaques with scale
- nail disease common
- screen for psoriatic arthritis

### `red_flags` [CANONICAL_NOW]
Erythrodermic or generalized pustular psoriasis, fever/systemic illness or serious infection on immunosuppression requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Usually clinical; biopsy when uncertain; joint symptoms need arthritis evaluation.

### `differential_diagnosis` [CANONICAL_NOW]
- eczema
- tinea
- seborrheic dermatitis
- cutaneous lupus

### `western_treatment` [CANONICAL_NOW]
Topical therapy, phototherapy and systemic/biologic immune-directed therapy based on severity.

### `acupuncture_role` [CANONICAL_NOW]
Avoid needling through active plaques/infected skin. Koebner phenomenon/skin trauma and immunosuppression matter.

## Proposed relations [DERIVED_RELATION]
- tdis.bai_bi strong contextual
- skin_pruritus endpoint

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIAMS — Psoriasis — https://www.niams.nih.gov/health-topics/psoriasis
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

# 05. Gout · 痛風

## Identity
```yaml
candidate_id: cond.gout
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Gout is inflammatory arthritis caused by deposition of monosodium urate crystals due to hyperuricemia.

### `clinical_definition` [CANONICAL_NOW]
Hyperuricemia alone is not gout; diagnosis concerns crystal-induced clinical disease.

### `etiology` [CANONICAL_NOW]
Urate overproduction or, more commonly, underexcretion; kidney disease, diet, alcohol, metabolic factors and medications can contribute.

### `pathophysiology` [CANONICAL_NOW]
Urate crystals activate intense innate inflammation in joints and can form tophi or kidney stones.

### `presentation_clinical` [CANONICAL_NOW]
Sudden severe monoarthritis with redness, warmth and swelling, often first MTP; recurrent attacks/tophi can develop.

### `key_features` [CANONICAL_NOW]
- acute crystal arthritis
- first MTP classic
- hyperuricemia alone not diagnostic
- septic arthritis must be excluded

### `red_flags` [CANONICAL_NOW]
Fever/systemic toxicity or atypical hot swollen joint requires urgent exclusion of septic arthritis.

### `diagnosis_methods` [CANONICAL_NOW]
Synovial fluid crystal identification is definitive; serum urate supports but can be normal during attack.

### `differential_diagnosis` [CANONICAL_NOW]
- septic arthritis
- pseudogout/CPPD
- cellulitis
- trauma

### `western_treatment` [CANONICAL_NOW]
Acute anti-inflammatory therapy plus urate-lowering therapy and risk-factor management for indicated patients.

### `acupuncture_role` [CANONICAL_NOW]
Avoid aggressive treatment of acutely inflamed joint until infection excluded; kidney disease/anticoagulants influence safety.

## Proposed relations [DERIVED_RELATION]
- tdis.bi_zheng contextual
- joint_pain/swelling endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIAMS — Gout — https://www.niams.nih.gov/health-topics/gout
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

# 06. Osteoporosis · 骨質疏鬆症

## Identity
```yaml
candidate_id: cond.osteoporosis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Osteoporosis is a skeletal disorder of reduced bone strength that increases fragility-fracture risk.

### `clinical_definition` [CANONICAL_NOW]
Low bone mass/osteopenia is not identical to osteoporosis; fracture history and bone-density criteria contribute.

### `etiology` [CANONICAL_NOW]
Age, menopause, low body weight, glucocorticoids, endocrine disease, immobility, nutritional and genetic factors contribute.

### `pathophysiology` [CANONICAL_NOW]
Bone resorption exceeds formation and microarchitecture deteriorates, reducing strength.

### `presentation_clinical` [CANONICAL_NOW]
Usually silent until fracture; vertebral compression can cause height loss/back pain and hip/wrist fractures are important.

### `key_features` [CANONICAL_NOW]
- silent disease
- DXA central
- fragility fracture is clinically important
- secondary causes should be assessed

### `red_flags` [CANONICAL_NOW]
New severe back pain after minor trauma, suspected hip fracture, neurologic deficits or immobilization requires urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
DXA plus fracture/risk assessment and labs for secondary causes.

### `differential_diagnosis` [CANONICAL_NOW]
- osteomalacia
- metastatic bone disease
- multiple myeloma
- degenerative back pain

### `western_treatment` [CANONICAL_NOW]
Calcium/vitamin D adequacy, weight-bearing/resistance exercise, fall prevention and antiresorptive/anabolic medicines when indicated.

### `acupuncture_role` [CANONICAL_NOW]
Use gentle positioning/needling in severe osteoporosis; avoid high-force manipulation and assess fracture risk.

## Proposed relations [DERIVED_RELATION]
- fracture risk safety
- back_pain endpoint

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIAMS — Osteoporosis — https://www.niams.nih.gov/health-topics/osteoporosis
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

# 07. Fibromyalgia · 纖維肌痛症

## Identity
```yaml
candidate_id: cond.fibromyalgia
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Fibromyalgia is a chronic pain disorder characterized by widespread pain, fatigue, sleep disturbance and cognitive/somatic symptoms without an inflammatory tissue lesion explaining the syndrome.

### `clinical_definition` [CANONICAL_NOW]
Fibromyalgia is distinct from inflammatory rheumatic disease and should not be dismissed as purely psychological.

### `etiology` [CANONICAL_NOW]
Cause is multifactorial; altered pain processing, sleep, stress and genetic/environmental factors contribute.

### `pathophysiology` [CANONICAL_NOW]
Central pain amplification and altered sensory processing are major models; peripheral and autonomic factors may contribute.

### `presentation_clinical` [CANONICAL_NOW]
Widespread pain/tenderness, fatigue, nonrestorative sleep, cognitive difficulty, headaches and IBS-like symptoms.

### `key_features` [CANONICAL_NOW]
- widespread chronic pain
- fatigue/sleep/cognition
- no single diagnostic lab
- coexists with other disease

### `red_flags` [CANONICAL_NOW]
New focal neurologic deficit, inflammatory joint swelling, fever, weight loss, severe anemia or other systemic findings require alternate diagnosis.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical symptom pattern after appropriate evaluation; routine labs exclude mimics based on history.

### `differential_diagnosis` [CANONICAL_NOW]
- hypothyroidism
- RA/SLE
- myopathy
- sleep apnea
- depression

### `western_treatment` [CANONICAL_NOW]
Education, graded exercise, sleep management, cognitive/behavioral approaches and selected medications.

### `acupuncture_role` [CANONICAL_NOW]
Reasonable adjunctive pain strategy; avoid reinforcing structural injury explanations unsupported by evidence.

## Proposed relations [DERIVED_RELATION]
- sym.fatigue EXISTS
- cond.insomnia differential
- tdis.bi_zheng possible contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIAMS — Fibromyalgia — https://www.niams.nih.gov/health-topics/fibromyalgia
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

# 08. Ehlers-Danlos Syndromes · 埃勒斯－當洛斯症候群

## Identity
```yaml
candidate_id: cond.ehlers_danlos_syndrome
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Ehlers-Danlos syndromes (EDS) are inherited connective-tissue disorders characterized by combinations of joint hypermobility, skin hyperextensibility and tissue fragility.

### `clinical_definition` [CANONICAL_NOW]
EDS is a family with genetically/clinically distinct subtypes; vascular EDS has markedly different vascular/organ rupture risk from hypermobile EDS.

### `etiology` [CANONICAL_NOW]
Pathogenic variants affecting collagen or connective-tissue pathways cause many EDS subtypes; hypermobile EDS has a different/less defined genetic basis.

### `pathophysiology` [CANONICAL_NOW]
Abnormal connective-tissue structure reduces tensile strength in skin, ligaments, vessels and organs depending subtype.

### `presentation_clinical` [CANONICAL_NOW]
Joint hypermobility/dislocations, chronic pain, easy bruising, soft/stretchy skin and subtype-specific vascular/organ features.

### `key_features` [CANONICAL_NOW]
- subtype matters
- joint hypermobility
- tissue fragility
- vascular EDS is high risk

### `red_flags` [CANONICAL_NOW]
Sudden severe chest/abdominal pain, arterial/organ rupture concern, major bleeding or neurologic vascular symptoms in vascular EDS requires emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical criteria, family history and genetic testing for many subtypes; hypermobile EDS is clinical.

### `differential_diagnosis` [CANONICAL_NOW]
- hypermobility spectrum disorder
- Marfan syndrome
- Loeys-Dietz syndrome
- bleeding disorders

### `western_treatment` [CANONICAL_NOW]
Injury prevention, physical therapy, pain management and subtype-specific cardiovascular/organ surveillance.

### `acupuncture_role` [CANONICAL_NOW]
Use conservative force and avoid aggressive manipulation/needling in fragile tissues; subtype/vascular risk must be known.

## Proposed relations [DERIVED_RELATION]
- bruising/joint_pain
- aneurysm/dissection vascular context

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus Genetics — Ehlers-Danlos syndrome — https://medlineplus.gov/genetics/condition/ehlers-danlos-syndrome/
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should each major EDS subtype be separate or one parent plus subtype metadata?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---
