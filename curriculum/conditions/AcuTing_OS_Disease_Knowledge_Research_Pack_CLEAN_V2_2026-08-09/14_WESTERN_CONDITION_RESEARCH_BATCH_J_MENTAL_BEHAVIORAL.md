# Western Condition Research Batch J - Mental / Behavioral Health

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Concepts:** 7  
**Contract:** CURRENT `docs/CONDITION_CARD_TEMPLATE.md`  
**Identity rule:** every candidate `cond.*` ID below is STAGING_ONLY until the complete current canonical condition file and aliases are exact-scanned.  
**Source rule:** biomedical facts are synthesized from the official NIH/NLM/CDC sources listed per card.  


---
# 01. Generalized Anxiety Disorder · 廣泛性焦慮症

## Identity
```yaml
candidate_id: cond.generalized_anxiety_disorder
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Generalized anxiety disorder (GAD) involves excessive, difficult-to-control worry about multiple areas of life on most days over a sustained period, with associated physical/cognitive symptoms and impairment.

### `clinical_definition` [CANONICAL_NOW]
GAD is distinct from normal situational anxiety, panic disorder, OCD, PTSD and anxiety caused by substances or medical disease.

### `etiology` [CANONICAL_NOW]
Genetic, temperament, stress and neurobiologic factors contribute; medical and substance causes must be considered.

### `pathophysiology` [CANONICAL_NOW]
Persistent threat/worry processing and autonomic arousal interact with avoidance, sleep disruption and attentional bias.

### `presentation_clinical` [CANONICAL_NOW]
Excessive worry, restlessness, fatigue, poor concentration, irritability, muscle tension and sleep disturbance.

### `key_features` [CANONICAL_NOW]
- persistent multi-domain worry
- difficult to control
- functional impairment
- medical/substance mimics must be considered

### `red_flags` [CANONICAL_NOW]
Suicidal thoughts, severe functional collapse, psychosis, intoxication/withdrawal, or acute medical symptoms mimicking anxiety require urgent evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical psychiatric assessment using symptom duration, impairment and exclusion of substances/medical causes; screening tools support but do not independently diagnose.

### `differential_diagnosis` [CANONICAL_NOW]
- panic disorder
- major depression
- PTSD
- OCD
- hyperthyroidism
- arrhythmia/POTS
- substance effects

### `western_treatment` [CANONICAL_NOW]
Psychotherapy, especially CBT, and medications such as SSRIs/SNRIs are common evidence-based options; treatment is individualized.

### `acupuncture_role` [CANONICAL_NOW]
May be adjunctive for stress/somatic symptoms but is not a substitute for mental-health assessment or treatment. Screen safety when distress escalates.

## Proposed relations [DERIVED_RELATION]
- sym.insomnia EXISTS
- palpitations/dyspnea differential endpoints
- tdis.yu_zheng contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIMH — Generalized Anxiety Disorder — https://www.nimh.nih.gov/health/publications/generalized-anxiety-disorder-gad
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

# 02. Major Depressive Disorder · 重度憂鬱症

## Identity
```yaml
candidate_id: cond.major_depressive_disorder
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Major depressive disorder is a mood disorder with persistent depressed mood and/or loss of interest plus cognitive, physical and functional symptoms that cause clinically significant impairment.

### `clinical_definition` [CANONICAL_NOW]
Depression is not ordinary sadness and can coexist with anxiety, chronic pain, substance use and medical illness.

### `etiology` [CANONICAL_NOW]
Genetic, biologic, psychological and environmental factors interact; medications and medical disorders can contribute to depressive syndromes.

### `pathophysiology` [CANONICAL_NOW]
Distributed brain-network, neurotransmitter, stress-system and behavioral changes are involved; no single mechanism explains all cases.

### `presentation_clinical` [CANONICAL_NOW]
Low mood, anhedonia, sleep/appetite change, fatigue, guilt/worthlessness, concentration difficulty, psychomotor change and thoughts of death/self-harm may occur.

### `key_features` [CANONICAL_NOW]
- mood/anhedonia core
- functional impairment
- suicide assessment may be required
- bipolar history must be screened

### `red_flags` [CANONICAL_NOW]
Suicidal intent/plan, inability to maintain safety, psychotic depression, severe self-neglect or mania/mixed features requires urgent psychiatric/emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical assessment of symptoms, duration, impairment, bipolar/substance/medical differential and suicide risk.

### `differential_diagnosis` [CANONICAL_NOW]
- bipolar disorder
- grief
- hypothyroidism/anemia
- substance-induced disorder
- PTSD

### `western_treatment` [CANONICAL_NOW]
Psychotherapy, antidepressant medications, combined treatment and neuromodulation for selected severe/refractory cases.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive only. Maintain scope boundaries and referral pathways; never interpret suicidality as only a TCM Shen imbalance.

## Proposed relations [DERIVED_RELATION]
- sym.fatigue/insomnia EXISTS
- tdis.yu_zheng/zang_zao contextual
- suicide safety object

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIMH — Depression — https://www.nimh.nih.gov/health/topics/depression
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

# 03. Post-Traumatic Stress Disorder · 創傷後壓力症候群

## Identity
```yaml
candidate_id: cond.post_traumatic_stress_disorder
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
PTSD is a trauma- and stressor-related disorder involving persistent intrusion, avoidance, negative mood/cognition changes and hyperarousal after exposure to traumatic events.

### `clinical_definition` [CANONICAL_NOW]
PTSD differs from an acute normal stress response and from acute stress disorder by diagnostic timing/course.

### `etiology` [CANONICAL_NOW]
Traumatic exposure is required; individual vulnerability, prior trauma, social support and biologic factors influence risk.

### `pathophysiology` [CANONICAL_NOW]
Trauma memory, threat detection, autonomic arousal and avoidance-learning processes become persistently dysregulated.

### `presentation_clinical` [CANONICAL_NOW]
Flashbacks/nightmares, intrusive memories, avoidance, emotional numbing, guilt, hypervigilance, sleep disturbance, irritability and concentration problems.

### `key_features` [CANONICAL_NOW]
- trauma exposure required
- four symptom clusters
- functional impairment
- co-occurring depression/SUD common

### `red_flags` [CANONICAL_NOW]
Suicidality, severe dissociation, violence risk, substance crisis, inability to function safely or psychosis requires urgent mental-health care.

### `diagnosis_methods` [CANONICAL_NOW]
Trauma-informed clinical interview; validated instruments support assessment; differential includes TBI and substance effects.

### `differential_diagnosis` [CANONICAL_NOW]
- acute stress disorder
- major depression
- GAD
- TBI
- substance-induced symptoms

### `western_treatment` [CANONICAL_NOW]
Trauma-focused psychotherapies are first-line; medications can treat PTSD and comorbid symptoms in appropriate patients.

### `acupuncture_role` [CANONICAL_NOW]
Trauma-informed adjunctive care may help symptoms, but consent, boundaries and mental-health referral are essential.

## Proposed relations [DERIVED_RELATION]
- sym.insomnia EXISTS
- anxiety/depression/SUD relations
- tdis.yu_zheng contextual

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIMH — Post-Traumatic Stress Disorder — https://www.nimh.nih.gov/health/publications/post-traumatic-stress-disorder-ptsd
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

# 04. Attention-Deficit/Hyperactivity Disorder · 注意力不足過動症

## Identity
```yaml
candidate_id: cond.adhd
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
ADHD is a neurodevelopmental disorder with developmentally inappropriate inattention and/or hyperactivity-impulsivity that begins in childhood and causes impairment across settings.

### `clinical_definition` [CANONICAL_NOW]
ADHD is not defined by occasional distractibility and should be distinguished from anxiety, sleep deprivation, learning disorders, mood disorders and substance effects.

### `etiology` [CANONICAL_NOW]
Strong genetic contribution with neurodevelopmental and environmental influences.

### `pathophysiology` [CANONICAL_NOW]
Differences in attention, executive-control and reward networks contribute to persistent regulation difficulties.

### `presentation_clinical` [CANONICAL_NOW]
Inattention, disorganization, forgetfulness, impulsivity and/or hyperactivity; adult presentations may be less overtly hyperactive.

### `key_features` [CANONICAL_NOW]
- childhood onset
- cross-setting impairment
- presentation can persist into adulthood
- sleep/mood/learning differential

### `red_flags` [CANONICAL_NOW]
Severe depression/suicidality, substance misuse, dangerous impulsivity or medication cardiovascular adverse effects need appropriate evaluation.

### `diagnosis_methods` [CANONICAL_NOW]
Developmental/behavioral history from multiple sources; rating scales support but do not replace clinical assessment.

### `differential_diagnosis` [CANONICAL_NOW]
- anxiety
- depression/bipolar
- sleep disorder
- learning disorder
- substance use

### `western_treatment` [CANONICAL_NOW]
Stimulant or nonstimulant medications plus behavioral/organizational and educational supports.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive only; do not advise stopping prescribed ADHD medication. Monitor sleep/appetite/pulse context if relevant.

## Proposed relations [DERIVED_RELATION]
- sleep/anxiety differential
- study-layer relevance, not clinical truth

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIMH — ADHD — https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd
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

# 05. Obsessive-Compulsive Disorder · 強迫症

## Identity
```yaml
candidate_id: cond.obsessive_compulsive_disorder
candidate_id_status: STAGING_ONLY
identity_status: IDENTITY_CHECK_REQUIRED
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
OCD is characterized by recurrent intrusive obsessions and/or compulsions that are time-consuming, distressing or impairing.

### `clinical_definition` [CANONICAL_NOW]
OCD is distinct from ordinary preferences/perfectionism and from obsessive-compulsive personality disorder.

### `etiology` [CANONICAL_NOW]
Genetic, neurobiologic and learning factors contribute.

### `pathophysiology` [CANONICAL_NOW]
Cortico-striatal circuits and reinforcement of ritualized anxiety-reduction behaviors are implicated.

### `presentation_clinical` [CANONICAL_NOW]
Contamination fears, checking, symmetry, intrusive taboo thoughts and repetitive rituals or mental acts can occur.

### `key_features` [CANONICAL_NOW]
- obsessions and/or compulsions
- insight varies
- rituals reduce distress short-term
- ERP is high-yield treatment

### `red_flags` [CANONICAL_NOW]
Severe self-neglect, suicidality, inability to eat/drink/leave home, dangerous compulsions or psychosis requires urgent care.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical interview assessing time, distress, impairment and differential with psychosis/anxiety/tics.

### `differential_diagnosis` [CANONICAL_NOW]
- GAD
- psychotic disorders
- autism repetitive behavior
- OCPD
- tic disorders

### `western_treatment` [CANONICAL_NOW]
Exposure and response prevention/CBT and SSRIs are core treatments; severe refractory illness may need specialty therapies.

### `acupuncture_role` [CANONICAL_NOW]
Adjunctive stress support only. Do not participate in or reinforce compulsive reassurance rituals.

## Proposed relations [DERIVED_RELATION]
- anxiety/depression contextual
- tdis.yu_zheng possible context

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIMH — Obsessive-Compulsive Disorder — https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd
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

# 06. Eating Disorders Parent · 飲食失調症

## Identity
```yaml
candidate_id: cond.eating_disorder
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Eating disorders are serious psychiatric illnesses involving persistent disturbances in eating behavior and related thoughts/emotions; major forms include anorexia nervosa, bulimia nervosa and binge-eating disorder.

### `clinical_definition` [CANONICAL_NOW]
A parent card should not erase subtype-specific medical risks. Low body weight alone is not anorexia nervosa, and binge eating is not automatically binge-eating disorder.

### `etiology` [CANONICAL_NOW]
Genetic, psychological, sociocultural and neurobiologic factors interact.

### `pathophysiology` [CANONICAL_NOW]
Restrictive intake, bingeing, purging and compensatory behaviors can produce malnutrition, electrolyte disturbance and multisystem complications.

### `presentation_clinical` [CANONICAL_NOW]
Weight/shape preoccupation, restriction, binge episodes, vomiting/laxative misuse, excessive exercise, body-image disturbance and medical symptoms.

### `key_features` [CANONICAL_NOW]
- psychiatric + medical illness
- subtype matters
- electrolyte/cardiac risk
- can occur at any body size

### `red_flags` [CANONICAL_NOW]
Syncope, severe bradycardia/hypotension, dehydration, electrolyte abnormalities, hematemesis, suicidality or severe malnutrition requires urgent medical/psychiatric care.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical psychiatric/nutritional assessment plus medical exam, vitals, labs and ECG when indicated.

### `differential_diagnosis` [CANONICAL_NOW]
- GI/endocrine disease causing weight change
- OCD
- depression
- ARFID
- substance use

### `western_treatment` [CANONICAL_NOW]
Multidisciplinary nutritional rehabilitation, psychotherapy, medical monitoring and subtype-specific medication where indicated.

### `acupuncture_role` [CANONICAL_NOW]
Only adjunctive within coordinated care; do not reinforce weight-loss goals or miss physiologic instability.

## Proposed relations [DERIVED_RELATION]
- syncope/bradycardia/electrolyte safety
- weight_change endpoints

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIMH — Eating Disorders — https://www.nimh.nih.gov/health/topics/eating-disorders
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should parent be navigational with anorexia/bulimia/BED child cards?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---

# 07. Substance Use Disorders / Addiction Parent · 物質使用障礙／成癮

## Identity
```yaml
candidate_id: cond.substance_use_disorder
candidate_id_status: STAGING_ONLY
identity_status: NEAR_DUPLICATE_NEEDS_DECISION
board_scope: BOARD_CLUSTER_RELEVANT
```

### `summary` [CANONICAL_NOW]
Substance use disorders are medical disorders involving problematic patterns of substance use that cause impairment and can include compulsive use despite harm.

### `clinical_definition` [CANONICAL_NOW]
The clinical identity is substance-specific and severity-specific; intoxication, withdrawal, overdose and use disorder are different states.

### `etiology` [CANONICAL_NOW]
Risk reflects genetics, development, trauma/stress, environment, psychiatric comorbidity and substance exposure.

### `pathophysiology` [CANONICAL_NOW]
Repeated drug exposure can alter reward, stress and executive-control systems, reinforcing compulsive use and relapse risk.

### `presentation_clinical` [CANONICAL_NOW]
Loss of control, craving, hazardous use, tolerance/withdrawal in some disorders, role impairment and continued use despite harm.

### `key_features` [CANONICAL_NOW]
- medical disorder, not moral failing
- substance-specific
- overdose/withdrawal may be emergencies
- co-occurring mental illness common

### `red_flags` [CANONICAL_NOW]
Overdose, severe intoxication, dangerous withdrawal, suicidality, psychosis, respiratory depression or inability to maintain safety requires emergency care.

### `diagnosis_methods` [CANONICAL_NOW]
Clinical substance-use history, functional impact and DSM-style criteria; toxicology supports specific questions but does not diagnose SUD by itself.

### `differential_diagnosis` [CANONICAL_NOW]
- prescribed physiologic dependence without disorder
- acute intoxication only
- primary mood/psychotic disorder
- delirium

### `western_treatment` [CANONICAL_NOW]
Evidence-based behavioral therapies, recovery supports and medications for specific disorders such as opioid use disorder; treatment should be individualized.

### `acupuncture_role` [CANONICAL_NOW]
Maintain nonjudgmental screening and referral. Acupuncture may be supportive but must not replace evidence-based SUD treatment or overdose/withdrawal care.

## Proposed relations [DERIVED_RELATION]
- mental-health comorbidity
- overdose/withdrawal safety objects

## ICD / coding staging
Exact ICD-10-CM selection requires the current fiscal-year CDC/NCHS tabular/index review and documented subtype, acuity, complication, laterality, or cause where applicable. No exact billing code is authorized by this research entry.

## Sources / provenance
- NIDA — Drugs, Brains, and Behavior: The Science of Addiction — https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction
- NIDA — Research Topics — https://nida.nih.gov/drugabuse.html
- CDC/NCHS ICD-10-CM — https://www.cdc.gov/nchs/icd/icd-10-cm/

## Open questions
1. Should alcohol, opioid, stimulant and cannabis use disorders be separate child identities?

## Content accounting
```yaml
canonical_sections_researched: 10
canonical_write_authorized: false
new_canonical_id_authorized: false
```

---
