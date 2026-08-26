# Western Condition Research Batch L - ENT / Ophthalmic Emergencies

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 6  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Acute Angle-Closure Glaucoma · 急性閉角型青光眼

## Identity
```yaml
candidate_id: cond.acute_angle_closure_glaucoma
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Acute angle-closure glaucoma is sudden obstruction of aqueous outflow causing a rapid rise in intraocular pressure and threat to vision.

### `clinical_definition` [CANONICAL_NOW]
It is a medical emergency and distinct from chronic open-angle glaucoma.

### `etiology` [CANONICAL_NOW]
Anatomically narrow angles predispose; pupillary dilation or other triggers can precipitate closure.

### `pathophysiology` [CANONICAL_NOW]
Iris blocks trabecular drainage, rapidly increasing intraocular pressure and injuring optic nerve/ocular structures.

### `presentation_clinical` [CANONICAL_NOW]
Severe eye pain, red eye, blurred vision/halos, headache, nausea/vomiting.

### `key_features` [CANONICAL_NOW]
- ocular emergency
- rapid IOP rise
- painful red eye
- vision loss can occur quickly

### `red_flags` [CANONICAL_NOW]
Sudden intense eye pain with red eye, nausea and blurred vision requires immediate emergency/ophthalmic care.

### `diagnosis_methods` [CANONICAL_NOW]
Urgent eye exam with intraocular pressure and angle/optic evaluation.

### `differential_diagnosis` [CANONICAL_NOW]
- uveitis
- keratitis
- migraine
- conjunctivitis
- orbital cellulitis

### `western_treatment` [CANONICAL_NOW]
Rapid pressure-lowering medication followed by laser iridotomy and other ophthalmic treatment.

### `acupuncture_role` [CANONICAL_NOW]
Do not needle around the eye or delay referral when acute angle closure is possible.

## Proposed relations [DERIVED_RELATION]
- eye_pain/visual_loss endpoints
- tdis.mu_yun DIFFERENTIAL_CONTEXT

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NEI — Glaucoma — https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/glaucoma
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

# 02. Retinal Detachment · 視網膜剝離

## Identity
```yaml
candidate_id: cond.retinal_detachment
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Retinal detachment occurs when the retina separates from its normal position and is a vision-threatening emergency.

### `clinical_definition` [CANONICAL_NOW]
Major types are rhegmatogenous, tractional and exudative; posterior vitreous detachment is a risk/differential but not the same condition.

### `etiology` [CANONICAL_NOW]
Retinal tears, diabetic traction, inflammatory/exudative disease, trauma and prior eye surgery can cause different types.

### `pathophysiology` [CANONICAL_NOW]
Separation of neurosensory retina from underlying support disrupts photoreceptor function and can cause permanent vision loss.

### `presentation_clinical` [CANONICAL_NOW]
Sudden new floaters, flashes of light and a shadow/curtain over vision; central acuity may decline as macula detaches.

### `key_features` [CANONICAL_NOW]
- medical emergency
- floaters + flashes + curtain high-yield
- dilated exam
- early surgery/laser protects vision

### `red_flags` [CANONICAL_NOW]
Any sudden curtain/shadow, rapid increase in floaters or flashes with vision change requires immediate eye/emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Dilated retinal exam; ocular ultrasound/OCT when needed.

### `differential_diagnosis` [CANONICAL_NOW]
- posterior vitreous detachment
- ocular migraine
- vitreous hemorrhage
- retinal vascular occlusion

### `western_treatment` [CANONICAL_NOW]
Laser/cryo for tears and procedures such as pneumatic retinopexy, scleral buckle or vitrectomy for detachment depending type.

### `acupuncture_role` [CANONICAL_NOW]
Acute symptoms require ophthalmology, not acupuncture. Avoid ocular-area treatment until emergency causes excluded.

## Proposed relations [DERIVED_RELATION]
- floaters/flashes/visual_field_loss endpoints
- tdis.mu_yun DIFFERENTIAL_CONTEXT

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NEI — Retinal Detachment — https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/retinal-detachment
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

# 03. Sudden Sensorineural Hearing Loss · 突發性感音神經性聽力損失

## Identity
```yaml
candidate_id: cond.sudden_sensorineural_hearing_loss
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Sudden sensorineural hearing loss (SSHL) is rapid unexplained inner-ear hearing loss developing over hours to a few days, often unilateral, and is a medical emergency.

### `clinical_definition` [CANONICAL_NOW]
It must be distinguished promptly from conductive loss due to cerumen/fluid and from chronic hearing loss.

### `etiology` [CANONICAL_NOW]
Most cases are idiopathic; infections, autoimmune disease, circulation problems, neurologic disease, trauma or ototoxic drugs can be causes.

### `pathophysiology` [CANONICAL_NOW]
Acute dysfunction of cochlear/inner-ear sensory pathways produces rapid sensorineural threshold loss.

### `presentation_clinical` [CANONICAL_NOW]
Sudden unilateral hearing loss, sometimes noticed on waking, with tinnitus, ear fullness and/or dizziness.

### `key_features` [CANONICAL_NOW]
- time-sensitive emergency
- often unilateral
- audiometry within days
- steroids commonly considered

### `red_flags` [CANONICAL_NOW]
Sudden hearing loss should receive immediate medical/ENT evaluation; associated focal neurologic deficits raise central/vascular concern.

### `diagnosis_methods` [CANONICAL_NOW]
Rule out conductive loss and obtain pure-tone audiometry; additional imaging/labs seek underlying cause.

### `differential_diagnosis` [CANONICAL_NOW]
- cerumen impaction
- otitis media
- Ménière disease
- vestibular schwannoma
- stroke

### `western_treatment` [CANONICAL_NOW]
Corticosteroid treatment is commonly used when appropriate; cause-specific management if identified.

### `acupuncture_role` [CANONICAL_NOW]
Do not label sudden hearing loss as chronic 耳鳴耳聾 and begin routine care first. Time-to-evaluation matters.

## Proposed relations [DERIVED_RELATION]
- tdis.er_ming_er_long DIFFERENTIAL_CONTEXT
- hearing_loss/tinnitus/dizziness endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDCD — Sudden Deafness — https://www.nidcd.nih.gov/health/sudden-deafness
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

# 04. Ménière Disease · 梅尼爾氏症

## Identity
```yaml
candidate_id: cond.meniere_disease
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Ménière disease is an inner-ear disorder causing episodic vertigo with fluctuating sensorineural hearing loss, tinnitus and aural fullness.

### `clinical_definition` [CANONICAL_NOW]
It is distinct from BPPV, vestibular neuritis and nonspecific dizziness.

### `etiology` [CANONICAL_NOW]
Exact cause is unclear; symptoms are associated with abnormal inner-ear endolymph/fluid regulation.

### `pathophysiology` [CANONICAL_NOW]
Endolymphatic hydrops disrupts cochlear and vestibular signaling.

### `presentation_clinical` [CANONICAL_NOW]
Spontaneous vertigo attacks, fluctuating hearing loss, tinnitus and ear fullness, often unilateral.

### `key_features` [CANONICAL_NOW]
- vertigo + auditory symptoms
- episodes typically 20 min to hours in definite criteria
- hearing test documents loss
- drop attacks possible

### `red_flags` [CANONICAL_NOW]
New focal neurologic deficits, sudden persistent hearing loss or atypical continuous severe vertigo requires alternate emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
ENT history and audiometry; imaging may exclude other causes. Definite disease requires characteristic vertigo episodes plus documented hearing loss and auditory symptoms.

### `differential_diagnosis` [CANONICAL_NOW]
- BPPV
- vestibular migraine
- vestibular neuritis
- SSHL
- acoustic neuroma

### `western_treatment` [CANONICAL_NOW]
Diet/behavior changes, symptom medicines, vestibular rehab and selected intratympanic or surgical therapies for refractory disease.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive only. Do not claim cure; screen for SSHL and stroke-like red flags.

## Proposed relations [DERIVED_RELATION]
- tdis.xuan_yun/er_ming_er_long
- vertigo/hearing_loss/tinnitus

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDCD — Ménière's Disease — https://www.nidcd.nih.gov/health/menieres-disease
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

# 05. Acute Bacterial Rhinosinusitis · 急性細菌性鼻竇炎

## Identity
```yaml
candidate_id: cond.acute_bacterial_sinusitis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Acute bacterial rhinosinusitis is bacterial infection/inflammation of the paranasal sinuses, usually following a viral URI, and must be distinguished from viral rhinosinusitis.

### `clinical_definition` [CANONICAL_NOW]
Purulent discharge alone does not prove bacterial infection; duration/severity/worsening pattern guides diagnosis.

### `etiology` [CANONICAL_NOW]
Common bacterial pathogens infect obstructed/inflamed sinuses after viral URI or other predisposition.

### `pathophysiology` [CANONICAL_NOW]
Mucosal edema obstructs drainage, allowing bacterial infection and pressure/inflammation.

### `presentation_clinical` [CANONICAL_NOW]
Nasal obstruction/discharge, facial pain/pressure, reduced smell and sometimes fever.

### `key_features` [CANONICAL_NOW]
- viral vs bacterial distinction
- persistent/severe/double-worsening patterns matter
- orbital/intracranial complications rare but serious
- antibiotics selective

### `red_flags` [CANONICAL_NOW]
Periorbital swelling, vision change, severe headache, neurologic findings, high systemic toxicity or immunocompromise requires urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Usually clinical; imaging reserved for complications/alternative diagnosis.

### `differential_diagnosis` [CANONICAL_NOW]
- viral URI
- allergic rhinitis
- dental infection
- migraine
- chronic rhinosinusitis

### `western_treatment` [CANONICAL_NOW]
Symptomatic care and antibiotics when bacterial criteria/severity indicate; treat complications urgently.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive symptom care only after dangerous orbital/intracranial features excluded.

## Proposed relations [DERIVED_RELATION]
- tdis.bi_yuan
- nasal_congestion/facial_pressure endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus — Sinusitis — https://medlineplus.gov/sinusitis.html
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

# 06. Otitis Media · 中耳炎

## Identity
```yaml
candidate_id: cond.otitis_media
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Otitis media is inflammation/infection of the middle ear; acute otitis media and otitis media with effusion are distinct.

### `clinical_definition` [CANONICAL_NOW]
Middle-ear disease is distinct from otitis externa and sudden sensorineural hearing loss.

### `etiology` [CANONICAL_NOW]
Eustachian-tube dysfunction after viral URI can permit middle-ear fluid and bacterial/viral infection, especially in children.

### `pathophysiology` [CANONICAL_NOW]
Middle-ear pressure/fluid and inflammation cause pain and conductive hearing changes.

### `presentation_clinical` [CANONICAL_NOW]
Ear pain, fever, irritability, reduced hearing and tympanic-membrane changes; effusion can persist without acute infection.

### `key_features` [CANONICAL_NOW]
- AOM vs effusion
- otoscopy central
- hearing changes usually conductive
- mastoid complications uncommon but serious

### `red_flags` [CANONICAL_NOW]
Postauricular swelling, severe headache/neurologic signs, toxic illness or sudden sensorineural-type hearing loss requires urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Otoscopy showing middle-ear effusion/inflammation; hearing testing for persistent effusion/loss.

### `differential_diagnosis` [CANONICAL_NOW]
- otitis externa
- cerumen
- TMJ/dental pain
- SSHL
- mastoiditis

### `western_treatment` [CANONICAL_NOW]
Analgesia and observation or antibiotics based on age/severity/diagnostic certainty; tubes for selected recurrent/persistent disease.

### `acupuncture_role` [CANONICAL_NOW]
Do not needle through infected tissue or delay evaluation for complications/sudden hearing loss.

## Proposed relations [DERIVED_RELATION]
- ear_pain/hearing_loss endpoints
- tdis.er_ming_er_long differential

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus — Ear Infections — https://medlineplus.gov/earinfections.html
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
