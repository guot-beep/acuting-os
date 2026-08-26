# Western Condition Research Batch G - Neurology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 8  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Bell Palsy · 貝爾氏麻痺／周邊性顏面神經麻痺

## Identity
```yaml
candidate_id: cond.bell_palsy
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Bell palsy is acute idiopathic peripheral facial nerve palsy causing unilateral facial weakness.

### `clinical_definition` [CANONICAL_NOW]
Bell palsy is a diagnosis of peripheral facial palsy after considering other causes; it must be distinguished from central facial weakness due to stroke.

### `etiology` [CANONICAL_NOW]
Exact cause is uncertain; inflammation of the facial nerve, possibly associated with viral reactivation, is proposed.

### `pathophysiology` [CANONICAL_NOW]
Facial nerve swelling/dysfunction impairs ipsilateral facial motor function and can affect eye closure, taste and lacrimation.

### `presentation_clinical` [CANONICAL_NOW]
Rapid unilateral facial weakness involving forehead and lower face, drooling, altered taste, hyperacusis, ear discomfort and incomplete eye closure can occur.

### `key_features` [CANONICAL_NOW]
- peripheral pattern includes forehead
- stroke must be excluded when presentation is atypical
- eye protection matters
- often improves over weeks-months

### `red_flags` [CANONICAL_NOW]
Any uncertain acute facial droop, limb weakness, speech difficulty, severe headache, ataxia or other focal deficit requires stroke evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical neurologic exam; imaging/labs when atypical, recurrent or alternative cause suspected.

### `differential_diagnosis` [CANONICAL_NOW]
- stroke/TIA
- Ramsay Hunt syndrome
- Lyme disease
- tumor
- otitis/mastoid disease

### `western_treatment` [CANONICAL_NOW]
Early corticosteroids are commonly used; eye lubrication/protection is essential when closure is impaired; antivirals may be used selectively.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive after appropriate diagnosis. Protect the cornea and never assume facial droop is Bell palsy without stroke screening.

## Proposed relations [DERIVED_RELATION]
- tdis.mian_tan strong association
- facial_weakness sign review

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus — Bell palsy — https://medlineplus.gov/ency/article/000773.htm
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should Ramsay Hunt be separate infectious/neuro condition?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 02. Trigeminal Neuralgia · 三叉神經痛

## Identity
```yaml
candidate_id: cond.trigeminal_neuralgia
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Trigeminal neuralgia is a chronic neuropathic facial-pain disorder with recurrent brief electric-shock-like pain in one or more trigeminal nerve divisions.

### `clinical_definition` [CANONICAL_NOW]
It is distinct from dental pain, TMJ pain, persistent idiopathic facial pain and trigeminal neuropathy from structural disease.

### `etiology` [CANONICAL_NOW]
Often related to vascular compression of the trigeminal nerve; multiple sclerosis, tumors and other lesions can cause secondary disease.

### `pathophysiology` [CANONICAL_NOW]
Focal demyelination/hyperexcitability permits innocuous stimuli to trigger paroxysmal pain.

### `presentation_clinical` [CANONICAL_NOW]
Sudden unilateral stabbing/electric facial pain triggered by light touch, chewing, speaking, brushing teeth or wind; attacks may cluster.

### `key_features` [CANONICAL_NOW]
- paroxysmal shock-like pain
- trigger zones
- usually unilateral
- MRI helps exclude secondary causes

### `red_flags` [CANONICAL_NOW]
Sensory loss, bilateral symptoms, progressive neurologic deficits, systemic disease or atypical persistent pain warrants evaluation for secondary cause.

### `diagnosis_methods` [CANONICAL_NOW]
Characteristic history/neurologic exam; MRI is commonly used to assess structural causes.

### `differential_diagnosis` [CANONICAL_NOW]
- dental pathology
- TMJ disorder
- cluster headache
- postherpetic neuralgia
- sinus disease

### `western_treatment` [CANONICAL_NOW]
Anticonvulsant medication is first-line in many patients; procedures/surgery are options for refractory disease.

### `acupuncture_role` [CANONICAL_NOW]
Can be adjunctive after diagnosis; avoid delaying dental/neurologic evaluation when atypical.

## Proposed relations [DERIVED_RELATION]
- tdis.mian_tong strong association
- sym.facial_pain candidate

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDCR — Trigeminal Neuralgia — https://www.nidcr.nih.gov/health-info/trigeminal-neuralgia
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Does current library have facial pain or TN already?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 03. Peripheral Neuropathy · 周邊神經病變

## Identity
```yaml
candidate_id: cond.peripheral_neuropathy
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Peripheral neuropathy is a broad category of disorders caused by damage to peripheral nerves, producing sensory, motor and/or autonomic dysfunction.

### `clinical_definition` [CANONICAL_NOW]
This is a parent concept. Etiology-specific neuropathies such as diabetic, chemotherapy-induced, entrapment or hereditary neuropathy may need child identities.

### `etiology` [CANONICAL_NOW]
Diabetes, trauma/compression, autoimmune disease, infections, kidney/liver disease, toxins/medications, nutritional deficiency, cancer treatment and inherited disorders are common categories.

### `pathophysiology` [CANONICAL_NOW]
Axonal injury, demyelination or both disrupt peripheral sensory/motor/autonomic signaling.

### `presentation_clinical` [CANONICAL_NOW]
Numbness, tingling, burning or shooting pain, sensory loss, weakness, balance problems and autonomic symptoms vary by nerve pattern.

### `key_features` [CANONICAL_NOW]
- parent syndrome, not one cause
- distribution matters
- motor/autonomic involvement changes risk
- cause-directed workup is important

### `red_flags` [CANONICAL_NOW]
Rapidly progressive weakness, respiratory/bulbar symptoms, bowel/bladder dysfunction or acute asymmetric deficits require urgent neurologic evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
History/neurologic exam, labs for cause, electrodiagnostic studies and selected imaging/biopsy/genetic tests.

### `differential_diagnosis` [CANONICAL_NOW]
- radiculopathy
- myelopathy
- stroke
- Guillain-Barré syndrome
- vascular disease

### `western_treatment` [CANONICAL_NOW]
Treat underlying cause, neuropathic pain management, rehabilitation and fall/foot-care prevention.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive pain support may be reasonable; protect insensate skin and screen for rapidly progressive motor/autonomic disease.

## Proposed relations [DERIVED_RELATION]
- tdis.ma_mu common presentation
- numbness/paresthesia candidate

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NINDS — Peripheral Neuropathy — https://www.ninds.nih.gov/health-information/disorders/peripheral-neuropathy
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Which etiologic neuropathies deserve child cards?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 04. Epilepsy · 癲癇

## Identity
```yaml
candidate_id: cond.epilepsy
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Epilepsy is a chronic brain disorder characterized by an enduring predisposition to recurrent unprovoked seizures.

### `clinical_definition` [CANONICAL_NOW]
A single provoked seizure is not automatically epilepsy. Seizure type and epilepsy syndrome classification affect diagnosis and treatment.

### `etiology` [CANONICAL_NOW]
Causes include genetic, structural, metabolic, immune, infectious and unknown factors.

### `pathophysiology` [CANONICAL_NOW]
Abnormal hypersynchronous neuronal activity produces transient alterations in awareness, movement, sensation, behavior or autonomic function.

### `presentation_clinical` [CANONICAL_NOW]
Seizures vary from focal sensory/behavioral events to impaired awareness, convulsions or brief generalized events.

### `key_features` [CANONICAL_NOW]
- recurrent unprovoked seizures
- seizure classification matters
- EEG and imaging often used
- medication adherence/safety are critical

### `red_flags` [CANONICAL_NOW]
First seizure, status epilepticus, prolonged/recurrent seizures without recovery, serious injury, pregnancy or persistent altered mental status requires emergency assessment.

### `diagnosis_methods` [CANONICAL_NOW]
Detailed event history/witness description, neurologic exam, EEG, brain imaging and labs to identify provocation/cause.

### `differential_diagnosis` [CANONICAL_NOW]
- syncope
- psychogenic nonepileptic events
- migraine
- TIA
- hypoglycemia

### `western_treatment` [CANONICAL_NOW]
Antiseizure medicines are mainstay; surgery, devices and dietary therapies are used in selected refractory epilepsy.

### `acupuncture_role` [CANONICAL_NOW]
Do not needle during uncontrolled acute seizure activity. Review antiseizure medicines, triggers and rescue plan; acupuncture is adjunctive only.

## Proposed relations [DERIVED_RELATION]
- seizure endpoint/sign review
- syncope differential

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NINDS — Epilepsy and Seizures — https://www.ninds.nih.gov/health-information/disorders/epilepsy-and-seizures
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should seizure be a symptom/sign entity distinct from epilepsy?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 05. Parkinson Disease · 巴金森氏症

## Identity
```yaml
candidate_id: cond.parkinson_disease
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Parkinson disease is a progressive neurodegenerative movement disorder characterized by bradykinesia with tremor and/or rigidity plus many nonmotor manifestations.

### `clinical_definition` [CANONICAL_NOW]
Parkinson disease is distinct from atypical parkinsonism and medication-induced parkinsonism.

### `etiology` [CANONICAL_NOW]
Most cases are multifactorial with genetic and environmental contributions; a minority are strongly genetic.

### `pathophysiology` [CANONICAL_NOW]
Degeneration of dopaminergic neurons in the substantia nigra and abnormal alpha-synuclein pathology disrupt basal-ganglia motor circuits.

### `presentation_clinical` [CANONICAL_NOW]
Bradykinesia, resting tremor, rigidity, gait/postural changes plus constipation, sleep disturbance, mood/cognitive and autonomic symptoms.

### `key_features` [CANONICAL_NOW]
- progressive
- bradykinesia is central
- motor and nonmotor symptoms
- falls/swallowing/cognition become important over time

### `red_flags` [CANONICAL_NOW]
Acute sudden parkinsonian symptoms suggest another cause; aspiration, severe falls, delirium or medication crisis needs urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical neurologic diagnosis; response to dopaminergic therapy and imaging/testing may help exclude alternatives.

### `differential_diagnosis` [CANONICAL_NOW]
- essential tremor
- drug-induced parkinsonism
- vascular parkinsonism
- multiple system atrophy
- normal-pressure hydrocephalus

### `western_treatment` [CANONICAL_NOW]
Levodopa and other dopaminergic therapies, exercise/rehabilitation, symptom-specific treatment and selected deep brain stimulation.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive for pain, stiffness or nonmotor symptoms; account for orthostatic hypotension, falls and medication timing.

## Proposed relations [DERIVED_RELATION]
- tdis.chan_zheng contextual
- fall-risk safety

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NINDS — Parkinson's Disease — https://www.ninds.nih.gov/health-information/disorders/parkinsons-disease
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should parkinsonism parent exist separately?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 06. Multiple Sclerosis · 多發性硬化症

## Identity
```yaml
candidate_id: cond.multiple_sclerosis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Multiple sclerosis (MS) is an immune-mediated central nervous system disease causing demyelination and neuroaxonal injury with episodes and/or progression of neurologic dysfunction.

### `clinical_definition` [CANONICAL_NOW]
MS affects brain, spinal cord and optic nerves and is distinct from peripheral neuropathy.

### `etiology` [CANONICAL_NOW]
Cause is multifactorial, involving immune dysregulation, genetic susceptibility and environmental factors.

### `pathophysiology` [CANONICAL_NOW]
Inflammatory immune injury damages myelin and axons, producing multifocal CNS lesions and variable recovery/scarring.

### `presentation_clinical` [CANONICAL_NOW]
Visual symptoms, numbness/tingling, weakness, spasticity, imbalance, bladder dysfunction, fatigue and cognitive symptoms can occur.

### `key_features` [CANONICAL_NOW]
- CNS demyelinating disease
- relapsing or progressive courses
- MRI is central
- symptoms disseminate in time/space

### `red_flags` [CANONICAL_NOW]
New severe neurologic deficit, inability to walk, major vision loss, infection with neurologic worsening or respiratory compromise needs urgent assessment.

### `diagnosis_methods` [CANONICAL_NOW]
Neurologic history/exam, MRI and sometimes CSF/evoked potentials; alternative diagnoses must be excluded.

### `differential_diagnosis` [CANONICAL_NOW]
- neuromyelitis optica spectrum
- B12 deficiency
- stroke
- structural myelopathy
- infection/autoimmune disease

### `western_treatment` [CANONICAL_NOW]
Disease-modifying therapies reduce relapses/progression; corticosteroids treat selected acute relapses; rehabilitation and symptom management are important.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive symptom support only; coordinate around immunomodulatory therapy, infection risk and sensory deficits.

## Proposed relations [DERIVED_RELATION]
- fatigue EXISTS
- numbness/weakness endpoints
- tdis.ma_mu contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NINDS — Multiple Sclerosis — https://www.ninds.nih.gov/health-information/disorders/multiple-sclerosis
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should optic neuritis be separate condition?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 07. Guillain-Barré Syndrome · 格林-巴利症候群

## Identity
```yaml
candidate_id: cond.guillain_barre_syndrome
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Guillain-Barré syndrome (GBS) is an acute immune-mediated peripheral neuropathy that can cause rapidly progressive weakness, sensory symptoms and autonomic dysfunction.

### `clinical_definition` [CANONICAL_NOW]
GBS is a neurologic emergency spectrum distinct from chronic peripheral neuropathy and from myasthenia gravis.

### `etiology` [CANONICAL_NOW]
Often follows an infection; immune responses mistakenly attack peripheral nerves.

### `pathophysiology` [CANONICAL_NOW]
Immune-mediated demyelination and/or axonal injury impairs peripheral nerve conduction, potentially including respiratory nerves.

### `presentation_clinical` [CANONICAL_NOW]
Symmetric weakness often begins in legs and ascends; tingling, pain, reduced reflexes, facial/bulbar weakness and autonomic instability can occur.

### `key_features` [CANONICAL_NOW]
- acute progressive weakness
- areflexia common
- respiratory failure possible
- autonomic instability possible

### `red_flags` [CANONICAL_NOW]
Any rapidly progressive ascending weakness, trouble swallowing, facial/bulbar weakness, dyspnea or autonomic instability needs emergency hospitalization.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical exam plus nerve-conduction studies and CSF; respiratory function is monitored closely.

### `differential_diagnosis` [CANONICAL_NOW]
- spinal cord compression
- myasthenia gravis
- botulism
- tick paralysis
- acute myopathy

### `western_treatment` [CANONICAL_NOW]
IV immunoglobulin or plasma exchange plus respiratory/autonomic monitoring and rehabilitation.

### `acupuncture_role` [CANONICAL_NOW]
Acute or evolving GBS is not an acupuncture presentation. Later rehabilitation support requires neurologic clearance and fall/autonomic precautions.

## Proposed relations [DERIVED_RELATION]
- weakness/paresthesia endpoints
- acute neuromuscular respiratory safety

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NINDS — Guillain-Barré Syndrome — https://www.ninds.nih.gov/health-information/disorders/guillain-barre-syndrome
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should acute inflammatory demyelinating polyneuropathy be subtype only?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 08. Cauda Equina Syndrome · 馬尾症候群

## Identity
```yaml
candidate_id: cond.cauda_equina_syndrome
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Cauda equina syndrome is compression or dysfunction of lumbosacral nerve roots causing a high-risk combination of lower-extremity neurologic deficits and bowel/bladder/saddle sensory disturbance.

### `clinical_definition` [CANONICAL_NOW]
This is not ordinary sciatica or low-back pain. Many compressive cases require urgent surgical assessment.

### `etiology` [CANONICAL_NOW]
Large disc herniation, spinal stenosis, tumor, infection/abscess, hemorrhage or trauma can compress the cauda equina.

### `pathophysiology` [CANONICAL_NOW]
Compression of multiple lumbosacral roots disrupts motor, sensory and sacral autonomic pathways; prolonged compression can cause permanent deficits.

### `presentation_clinical` [CANONICAL_NOW]
Severe low-back/radicular pain, bilateral leg weakness/numbness, saddle anesthesia, urinary retention/incontinence and bowel/sexual dysfunction.

### `key_features` [CANONICAL_NOW]
- saddle anesthesia
- new urinary retention is high-yield
- bilateral neurologic deficits
- time-sensitive MRI/surgical evaluation

### `red_flags` [CANONICAL_NOW]
New urinary retention/incontinence, saddle anesthesia, rapidly progressive bilateral weakness or bowel dysfunction with back pain requires emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Urgent neurologic exam and spinal MRI; cause-specific labs/imaging as needed.

### `differential_diagnosis` [CANONICAL_NOW]
- simple radiculopathy/sciatica
- conus medullaris syndrome
- peripheral neuropathy
- functional symptoms
- urologic retention without neurologic cause

### `western_treatment` [CANONICAL_NOW]
Urgent decompression for compressive causes plus treatment of infection, tumor or other etiology.

### `acupuncture_role` [CANONICAL_NOW]
Do not needle/manipulate presumed sciatica when cauda-equina red flags are present. Emergency referral precedes treatment.

## Proposed relations [DERIVED_RELATION]
- low_back_pain/saddle_anesthesia/urinary_retention endpoints
- radiculopathy differential

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus — Spinal cord trauma/cauda equina emergency context — https://medlineplus.gov/ency/article/001066.htm
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should CES be modeled as emergency syndrome separate from underlying disc/tumor cause?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---
