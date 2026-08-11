# Western Condition Research Batch K - Reproductive / Gynecology / Urology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 9  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Endometriosis · 子宮內膜異位症

## Identity
```yaml
candidate_id: cond.endometriosis
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Endometriosis is a disease in which tissue similar to endometrium grows outside the uterus and can cause pain, inflammation, adhesions and infertility.

### `clinical_definition` [CANONICAL_NOW]
Endometriosis is distinct from primary dysmenorrhea, adenomyosis and ordinary menstrual cramps.

### `etiology` [CANONICAL_NOW]
Cause is not fully established; proposed mechanisms include retrograde menstruation, metaplasia and dissemination.

### `pathophysiology` [CANONICAL_NOW]
Ectopic endometrium-like lesions respond to hormones and promote inflammation, scarring/adhesions and pain sensitization.

### `presentation_clinical` [CANONICAL_NOW]
Dysmenorrhea, chronic pelvic pain, dyspareunia, painful bowel/bladder symptoms during menses, heavy/irregular bleeding and infertility.

### `key_features` [CANONICAL_NOW]
- pain + infertility high-yield
- pain severity may not match lesion extent
- imaging can detect larger lesions
- laparoscopy can confirm diagnosis

### `red_flags` [CANONICAL_NOW]
Acute severe pelvic pain, hemodynamic symptoms, fever, pregnancy possibility or new mass requires evaluation for ectopic pregnancy/torsion/infection.

### `diagnosis_methods` [CANONICAL_NOW]
History/pelvic exam, ultrasound/MRI; laparoscopy remains definitive confirmation in many traditional diagnostic frameworks.

### `differential_diagnosis` [CANONICAL_NOW]
- primary dysmenorrhea
- adenomyosis
- fibroids
- PID
- IBS/bladder pain syndrome

### `western_treatment` [CANONICAL_NOW]
Analgesics, hormonal suppression and surgery based on pain, fertility goals and disease severity; fertility treatment may be needed.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive pain support can be integrated, but infertility and acute pelvic red flags need biomedical pathways.

## Proposed relations [DERIVED_RELATION]
- tdis.tong_jing/bu_yun/zheng_jia contextual
- pelvic_pain endpoint

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NICHD — Endometriosis — https://www.nichd.nih.gov/health/topics/factsheets/endometriosis
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

# 02. Uterine Fibroids · 子宮肌瘤

## Identity
```yaml
candidate_id: cond.uterine_fibroids
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Uterine fibroids (leiomyomas) are benign smooth-muscle tumors of the uterus that may be asymptomatic or cause bleeding, pressure, pain and reproductive problems.

### `clinical_definition` [CANONICAL_NOW]
Fibroids are noncancerous and are distinct from uterine sarcoma; location/size matter for symptoms and fertility.

### `etiology` [CANONICAL_NOW]
Hormonal, genetic and growth-factor influences contribute; risk varies by age and population.

### `pathophysiology` [CANONICAL_NOW]
Monoclonal smooth-muscle/fibroblast growth creates intramural, submucosal or subserosal masses that can distort uterine anatomy.

### `presentation_clinical` [CANONICAL_NOW]
Heavy/prolonged bleeding, anemia, pelvic pressure/fullness, urinary frequency, dyspareunia, back pain and fertility/pregnancy problems.

### `key_features` [CANONICAL_NOW]
- benign uterine tumors
- many asymptomatic
- location matters
- bleeding/anemia high-value

### `red_flags` [CANONICAL_NOW]
Heavy bleeding with syncope/hemodynamic symptoms, pregnancy-related pain/bleeding or rapidly concerning mass symptoms requires urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Pelvic exam plus ultrasound; saline sonography, MRI or other imaging for selected questions.

### `differential_diagnosis` [CANONICAL_NOW]
- adenomyosis
- endometriosis
- pregnancy
- ovarian mass
- uterine malignancy

### `western_treatment` [CANONICAL_NOW]
Observation when asymptomatic; medications for symptoms and procedures such as myomectomy, uterine artery embolization or hysterectomy based on goals.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive symptom care only. Track bleeding/anemia and pregnancy/fertility goals; do not claim to shrink fibroids without evidence.

## Proposed relations [DERIVED_RELATION]
- tdis.zheng_jia/tong_jing/yue_jing_guo_duo
- anemia consequence

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NICHD — Uterine Fibroids — https://www.nichd.nih.gov/health/topics/factsheets/uterine
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

# 03. Primary Dysmenorrhea · 原發性痛經

## Identity
```yaml
candidate_id: cond.primary_dysmenorrhea
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Primary dysmenorrhea is painful menstruation without another pelvic disease explaining the pain, commonly driven by prostaglandin-mediated uterine contractions.

### `clinical_definition` [CANONICAL_NOW]
Secondary dysmenorrhea is menstrual pain caused by conditions such as endometriosis or fibroids and must remain separate.

### `etiology` [CANONICAL_NOW]
Excess prostaglandin activity around menses promotes uterine contractions and ischemic cramping.

### `pathophysiology` [CANONICAL_NOW]
Prostaglandin-driven myometrial contractions and transient reduced uterine blood flow produce cyclic pain and systemic symptoms.

### `presentation_clinical` [CANONICAL_NOW]
Crampy lower abdominal pain around onset of menstruation, sometimes with back/leg pain, nausea, diarrhea or headache.

### `key_features` [CANONICAL_NOW]
- primary vs secondary distinction
- cyclic timing
- usually begins in younger years
- prostaglandin mechanism

### `red_flags` [CANONICAL_NOW]
Sudden severe pain, fever/discharge, late/missed period with pregnancy possibility, progressive new pain or intermenstrual symptoms requires evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
History; pelvic exam/imaging/testing when secondary cause suspected.

### `differential_diagnosis` [CANONICAL_NOW]
- endometriosis
- fibroids
- adenomyosis
- PID
- ectopic pregnancy

### `western_treatment` [CANONICAL_NOW]
NSAIDs, hormonal contraception and supportive measures are common first-line therapies.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive pain care is reasonable once secondary causes/red flags are assessed.

## Proposed relations [DERIVED_RELATION]
- tdis.tong_jing strong association
- menstrual_pain endpoint

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus — Period Pain — https://medlineplus.gov/periodpain.html
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

# 04. Abnormal Uterine Bleeding · 異常子宮出血

## Identity
```yaml
candidate_id: cond.abnormal_uterine_bleeding
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Abnormal uterine bleeding (AUB) is uterine bleeding abnormal in timing, regularity, duration or amount and is a syndrome requiring cause classification.

### `clinical_definition` [CANONICAL_NOW]
AUB is not one etiology and should not be equated directly with fibroids, anovulation or the TCM disease 崩漏.

### `etiology` [CANONICAL_NOW]
Structural uterine causes, ovulatory/endocrine dysfunction, bleeding disorders, medications and pregnancy-related causes must be distinguished.

### `pathophysiology` [CANONICAL_NOW]
Mechanism depends on cause: endometrial instability/anovulation, structural bleeding surface, coagulation disorder or medication effects.

### `presentation_clinical` [CANONICAL_NOW]
Heavy menstrual bleeding, prolonged bleeding, irregular/intermenstrual bleeding and symptoms of iron deficiency/anemia.

### `key_features` [CANONICAL_NOW]
- syndrome not single disease
- pregnancy must be considered
- PALM-COEIN-style cause logic may be useful
- anemia consequence

### `red_flags` [CANONICAL_NOW]
Profuse bleeding with syncope, dyspnea/chest pain, pregnancy, severe pelvic pain or hemodynamic instability requires urgent/emergency evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Pregnancy testing where applicable, CBC, history/exam and cause-directed endocrine/coagulation testing and pelvic imaging/endometrial assessment.

### `differential_diagnosis` [CANONICAL_NOW]
- pregnancy/ectopic
- fibroids/polyps
- endometrial malignancy
- coagulopathy
- endocrine/anovulatory bleeding

### `western_treatment` [CANONICAL_NOW]
Cause- and severity-specific hormonal/nonhormonal medication, iron replacement and procedures/surgery as indicated.

### `acupuncture_role` [CANONICAL_NOW]
Do not treat severe bleeding as a routine pattern. Quantify bleeding, screen pregnancy/anemia and refer appropriately.

## Proposed relations [DERIVED_RELATION]
- tdis.beng_lou/yue_jing_guo_duo
- anemia/thrombocytopenia differential

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NICHD — Uterine Fibroids/AUB context — https://www.nichd.nih.gov/health/topics/factsheets/uterine
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should AUB remain a syndrome parent with structural/nonstructural cause relations?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 05. Ectopic Pregnancy · 子宮外孕

## Identity
```yaml
candidate_id: cond.ectopic_pregnancy
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Ectopic pregnancy is implantation of a pregnancy outside the main uterine cavity, most commonly in a fallopian tube, with risk of rupture and life-threatening internal bleeding.

### `clinical_definition` [CANONICAL_NOW]
Ectopic pregnancy cannot progress normally and is a time-sensitive pregnancy emergency distinct from miscarriage.

### `etiology` [CANONICAL_NOW]
Tubal damage/dysfunction and risk factors such as prior ectopic, surgery, PID/STIs, endometriosis and fertility treatment can increase risk, though no risk factor may be present.

### `pathophysiology` [CANONICAL_NOW]
Growing ectopic tissue can invade and rupture the implantation site, causing intraperitoneal hemorrhage and shock.

### `presentation_clinical` [CANONICAL_NOW]
Missed period/pregnancy symptoms, pelvic/abdominal pain and vaginal bleeding; rupture may cause shoulder pain, dizziness or syncope.

### `key_features` [CANONICAL_NOW]
- pregnancy outside uterus
- rupture causes internal bleeding
- hCG + ultrasound central
- pregnancy status is essential in reproductive-age acute pain

### `red_flags` [CANONICAL_NOW]
Severe abdominal/pelvic pain, shoulder pain, dizziness/syncope, heavy bleeding or shock in possible pregnancy requires emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
Pregnancy testing, serial hCG and transvaginal ultrasound; pelvic exam contributes.

### `differential_diagnosis` [CANONICAL_NOW]
- miscarriage
- ovarian torsion/cyst
- PID
- appendicitis
- kidney stone

### `western_treatment` [CANONICAL_NOW]
Methotrexate for selected unruptured cases or surgery; ruptured ectopic requires emergency surgical management.

### `acupuncture_role` [CANONICAL_NOW]
Never treat possible ectopic pregnancy as ordinary dysmenorrhea or abdominal pain. Emergency referral precedes acupuncture.

## Proposed relations [DERIVED_RELATION]
- tdis.fu_tong/tong_jing DIFFERENTIAL_CONTEXT
- vaginal_bleeding/syncope endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- MedlinePlus — Ectopic Pregnancy — https://medlineplus.gov/ectopicpregnancy.html
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

# 06. Preeclampsia / Eclampsia Spectrum · 子癲前症／子癲症

## Identity
```yaml
candidate_id: cond.preeclampsia
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Preeclampsia is a pregnancy-specific hypertensive disorder arising after 20 weeks with maternal organ-system involvement; eclampsia is preeclampsia with seizures.

### `clinical_definition` [CANONICAL_NOW]
Gestational hypertension, preeclampsia, HELLP syndrome and eclampsia are related but distinct clinical states.

### `etiology` [CANONICAL_NOW]
Cause is incompletely understood; abnormal placentation and vascular/endothelial dysfunction are central models.

### `pathophysiology` [CANONICAL_NOW]
Placental and maternal endothelial dysfunction produces hypertension, organ ischemia/injury and fetal placental insufficiency.

### `presentation_clinical` [CANONICAL_NOW]
Hypertension may be asymptomatic; severe headache, visual symptoms, RUQ/epigastric pain, dyspnea and swelling can occur; eclampsia causes seizures.

### `key_features` [CANONICAL_NOW]
- after 20 weeks
- BP + organ involvement
- HELLP and eclampsia severe states
- can persist/postpartum

### `red_flags` [CANONICAL_NOW]
Severe headache/vision change, RUQ pain, dyspnea, severe hypertension, seizures or decreased fetal well-being requires immediate obstetric evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Repeated BP measurement, urine protein and blood tests for platelets, liver and kidney function; fetal assessment as appropriate.

### `differential_diagnosis` [CANONICAL_NOW]
- chronic/gestational hypertension
- migraine
- TTP
- acute fatty liver of pregnancy
- seizure disorder

### `western_treatment` [CANONICAL_NOW]
Maternal stabilization, antihypertensives for severe BP, magnesium sulfate for seizure prevention/treatment and delivery timing based on gestational age/severity.

### `acupuncture_role` [CANONICAL_NOW]
Not a condition for routine acupuncture management when severe features are present. Pregnancy-specific obstetric coordination is mandatory.

## Proposed relations [DERIVED_RELATION]
- headache/visual_change/RUQ_pain endpoints
- pregnancy safety object

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NICHD — Preeclampsia and Eclampsia — https://www.nichd.nih.gov/health/topics/preeclampsia
- NICHD — Preeclampsia Diagnosis — https://www.nichd.nih.gov/health/topics/preeclampsia/conditioninfo/diagnosed
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Separate preeclampsia, HELLP and eclampsia or model complication states?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 07. Benign Prostatic Hyperplasia · 良性攝護腺增生

## Identity
```yaml
candidate_id: cond.benign_prostatic_hyperplasia
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
BPH is noncancerous enlargement of the prostate that can obstruct urinary outflow and cause lower urinary tract symptoms.

### `clinical_definition` [CANONICAL_NOW]
BPH is distinct from prostate cancer and prostatitis; prostate size and symptom severity do not always correlate.

### `etiology` [CANONICAL_NOW]
Age-related hormonal, inflammatory and stromal/epithelial growth changes contribute.

### `pathophysiology` [CANONICAL_NOW]
Prostate enlargement and smooth-muscle tone increase urethral resistance and can impair bladder emptying.

### `presentation_clinical` [CANONICAL_NOW]
Weak stream, hesitancy, intermittency, urgency, frequency, nocturia and incomplete-emptying sensation.

### `key_features` [CANONICAL_NOW]
- common with age
- LUTS not specific for BPH
- retention/renal complications possible
- cancer is separate

### `red_flags` [CANONICAL_NOW]
Complete urinary retention, gross hematuria, recurrent infection, kidney dysfunction or severe pain needs prompt evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
History/symptom score, exam, urinalysis and selected PSA/postvoid residual/uroflow/imaging to evaluate alternatives/complications.

### `differential_diagnosis` [CANONICAL_NOW]
- prostate cancer
- prostatitis
- UTI
- neurogenic bladder
- urethral stricture

### `western_treatment` [CANONICAL_NOW]
Watchful waiting/lifestyle, alpha blockers, 5-alpha-reductase inhibitors and procedures/surgery based on severity/prostate anatomy.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive urinary symptom care only; acute retention is urgent and must not be treated with acupuncture delay.

## Proposed relations [DERIVED_RELATION]
- tdis.long_bi/lin_zheng contextual
- urinary_retention endpoint

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Enlarged Prostate (BPH) — https://www.niddk.nih.gov/health-information/urologic-diseases/prostate-problems/enlarged-prostate-benign-prostatic-hyperplasia
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

# 08. Prostatitis · 攝護腺炎

## Identity
```yaml
candidate_id: cond.prostatitis
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Prostatitis comprises bacterial prostatitis and chronic prostatitis/chronic pelvic pain syndrome, which have different mechanisms and treatment.

### `clinical_definition` [CANONICAL_NOW]
Not all prostatitis is bacterial; chronic pelvic pain syndrome commonly lacks an identified bacterial infection.

### `etiology` [CANONICAL_NOW]
Acute/chronic bacterial infection causes some forms; chronic pelvic pain syndrome may involve pelvic floor, inflammatory and neuropathic mechanisms.

### `pathophysiology` [CANONICAL_NOW]
Inflammation/infection or chronic pelvic pain mechanisms affect prostate/pelvic tissues and urinary/sexual function.

### `presentation_clinical` [CANONICAL_NOW]
Pelvic/perineal/lower abdominal/back pain, dysuria/frequency, painful ejaculation; acute bacterial disease can cause fever/chills and urinary retention.

### `key_features` [CANONICAL_NOW]
- bacterial vs chronic pelvic pain distinction
- fever + urinary symptoms can be serious
- urine culture useful for bacterial disease
- prostate cancer/BPH differential

### `red_flags` [CANONICAL_NOW]
Urinary retention, fever/chills with urinary symptoms, hematuria or severe lower-abdominal/urinary pain requires immediate medical care.

### `diagnosis_methods` [CANONICAL_NOW]
History/exam, urinalysis/culture and selected prostate/pelvic testing; subtype classification matters.

### `differential_diagnosis` [CANONICAL_NOW]
- BPH
- UTI
- STI/urethritis
- prostate cancer
- pelvic floor pain

### `western_treatment` [CANONICAL_NOW]
Antibiotics for bacterial forms; alpha blockers, pain/pelvic-floor and multimodal strategies for chronic pelvic pain syndrome.

### `acupuncture_role` [CANONICAL_NOW]
Pelvic pain adjunctive care may be relevant after infection/retention red flags are excluded.

## Proposed relations [DERIVED_RELATION]
- tdis.lin_zheng/long_bi contextual
- pelvic_pain endpoint

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Prostatitis — https://www.niddk.nih.gov/health-information/urologic-diseases/prostate-problems/prostatitis-inflammation-prostate
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Separate acute bacterial, chronic bacterial and CP/CPPS cards?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 09. Erectile Dysfunction · 勃起功能障礙

## Identity
```yaml
candidate_id: cond.erectile_dysfunction
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Erectile dysfunction (ED) is persistent difficulty getting or maintaining an erection sufficient for sexual activity.

### `clinical_definition` [CANONICAL_NOW]
ED is not an inevitable part of aging and can reflect vascular, neurologic, hormonal, medication or psychological factors.

### `etiology` [CANONICAL_NOW]
Cardiovascular disease, diabetes, neurologic disease, endocrine problems, pelvic surgery, medications, substance use and psychological/relationship factors.

### `pathophysiology` [CANONICAL_NOW]
Adequate erection requires coordinated vascular inflow, neural signaling, smooth-muscle relaxation and hormonal/psychological context.

### `presentation_clinical` [CANONICAL_NOW]
Inconsistent, short-lasting or absent erections; libido may be normal or altered depending cause.

### `key_features` [CANONICAL_NOW]
- multifactorial
- cardiovascular risk marker in some patients
- medication review important
- sexual/mental-health history part of diagnosis

### `red_flags` [CANONICAL_NOW]
ED with exertional chest symptoms, severe vascular disease, neurologic deficits or priapism requires condition-specific urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Medical/sexual/mental-health history, physical exam and selected labs, vascular ultrasound or nocturnal/injection testing.

### `differential_diagnosis` [CANONICAL_NOW]
- low libido/hypogonadism
- Peyronie disease
- medication effects
- depression/anxiety
- vascular disease

### `western_treatment` [CANONICAL_NOW]
Treat underlying causes, lifestyle/counseling, PDE5 inhibitors when safe, devices/injections and selected surgery.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive role is limited; medication interactions and cardiovascular fitness for sexual activity matter.

## Proposed relations [DERIVED_RELATION]
- tdis.yang_wei strong contextual
- cardiovascular/diabetes contexts

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDDK — Erectile Dysfunction — https://www.niddk.nih.gov/health-information/urologic-diseases/erectile-dysfunction
- NIDDK — ED Diagnosis — https://www.niddk.nih.gov/health-information/urologic-diseases/erectile-dysfunction/diagnosis
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
