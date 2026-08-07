# AcuTing OS Clinical Card Seed Batch 01

**Prepared:** 2026-08-07  
**Target milestone:** begin structured clinical case entry by 2026-09-05  
**Purpose:** source-grounded seed data for Codex / Claude Code / Antigravity.  
**Important:** This is a staging specification, not a billing claim generator and not a replacement for clinician coding judgment.


# 01 — Neurology / Headache / Dizziness / Ear-Balance Seed Cards

## Implementation rule

This file contains a mixture of `sym.*` complaints and `cond.*` diagnoses. Do not collapse them.

### Seed table

| Entity type | Preferred English | Preferred Chinese | Common aliases | ICD-10-CM seed / family | Key distinction |
|---|---|---|---|---|---|
| symptom | Headache | 頭痛 | head pain | R51.9 Headache, unspecified | Complaint only; do not assume migraine |
| condition | Migraine | 偏頭痛 | migraine headache | G43.*; common unspecified example G43.909 | Use exact child code when aura/intractability/status are documented |
| symptom | Dizziness | 頭暈 | lightheadedness, wooziness, unsteadiness | R42 Dizziness and giddiness | Broader than vertigo |
| symptom | Vertigo | 眩暈 | spinning sensation | Often R42 if only a symptom is documented; diagnosed vestibular disorders use H81.* | Do not code BPPV merely from “dizzy” |
| condition | Benign paroxysmal positional vertigo | 良性陣發性位置性眩暈 | BPPV, positional vertigo | H81.10 unspecified ear; H81.11 right; H81.12 left; H81.13 bilateral | Brief intense positional vertigo; laterality exists |
| condition | Ménière disease | 梅尼爾氏病 | Meniere disease, Ménière's disease | H81.01 right; H81.02 left; H81.03 bilateral; H81.09 unspecified | Episodic vertigo + hearing symptoms / tinnitus / aural fullness |
| condition | Vestibular neuritis | 前庭神經炎 | vestibular neuronitis | H81.20 unspecified; H81.21 right; H81.22 left; H81.23 bilateral | Distinguish from BPPV and Ménière |
| symptom | Tinnitus | 耳鳴 | ringing in ears | H93.11 right; H93.12 left; H93.13 bilateral; H93.19 unspecified | Laterality is important |
| condition | Trigeminal neuralgia | 三叉神經痛 | tic douloureux | G50.0 | Distinct facial neuropathic pain diagnosis |
| condition | Occipital neuralgia | 枕神經痛 | occipital nerve pain | M54.81 | Do not merge with generic headache |
| symptom | Syncope / fainting | 暈厥 | fainting, passed out | R55 Syncope and collapse | High safety importance; not the same as dizziness |
| symptom | Paresthesia | 感覺異常 | numbness/tingling when nonspecific | code depends on site/etiology; do not force one generic diagnosis | Track site/laterality and diagnosed neuropathy separately |

---

## Card-ready clinical summaries

### Headache / 頭痛 — `sym.*`

**Definition:** Pain or discomfort involving the head. Headache is a symptom category with many possible primary and secondary causes.

**Track in a visit:**
- onset
- sudden vs gradual
- location
- laterality
- severity
- duration
- frequency
- associated nausea/vomiting
- photophobia/phonophobia
- visual or neurologic symptoms
- trauma
- fever
- pregnancy/postpartum context
- change from usual headache pattern

**Safety:** Do not treat “headache” as automatically benign. A new or unusually severe headache, abrupt onset, neurologic deficits, trauma, systemic illness, or other concerning features requires biomedical evaluation.

**Primary sources:**
- MedlinePlus Headache: https://medlineplus.gov/headache.html
- CMS ICD-10: https://www.cms.gov/medicare/coding-billing/icd-10-codes

### Migraine / 偏頭痛 — `cond.*`

**Definition:** A recurring neurologic headache disorder, commonly moderate to severe and often throbbing/pulsing, frequently with nausea and sensitivity to light or sound.

**Common presentation:**
- often unilateral, but may be bilateral
- pulsating/throbbing pain
- nausea/vomiting
- photophobia / phonophobia
- worse with activity
- may occur with aura
- postdrome fatigue/weakness/confusion may occur

**Coding:** Store `G43.*` family. Do not default every migraine to `G43.909`; select a more specific code when documentation supports aura, intractability, or status migrainosus.

**Sources:**
- MedlinePlus Migraine: https://medlineplus.gov/migraine.html
- MedlinePlus Connect example G43.909: https://connect.medlineplus.gov/application?informationRecipient.languageCode.c=en&mainSearchCriteria.v.c=G43.909&mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.dn=Migraines

### Dizziness / 頭暈 — `sym.*`

**Definition:** A broad patient complaint that can include lightheadedness, wooziness, disorientation, imbalance, or near-fainting.

**Do not equate with:** vertigo, BPPV, Ménière disease, or syncope.

**Track:**
- spinning vs lightheaded vs imbalance
- positional trigger
- orthostatic trigger
- hearing change / tinnitus
- nausea/vomiting
- neurologic symptoms
- loss of consciousness
- duration of episodes
- medications / dehydration

**ICD-10-CM:** `R42 Dizziness and giddiness`.

**Sources:**
- MedlinePlus Dizziness and Vertigo: https://medlineplus.gov/dizzinessandvertigo.html
- CMS definitions/manual evidence for R42: official CMS ICD resources

### BPPV / 良性陣發性位置性眩暈 — `cond.*`

**Definition:** A peripheral balance disorder with brief, intense episodes of vertigo triggered by particular changes in head position.

**Common clues:**
- rolling over in bed
- looking up
- bending down
- turning the head
- brief attacks rather than continuous nonspecific dizziness

**ICD-10-CM:**
- H81.10 unspecified ear
- H81.11 right ear
- H81.12 left ear
- H81.13 bilateral

**Sources:**
- NIDCD Balance Disorders: https://www.nidcd.nih.gov/health/balance-disorders
- CMS Vestibular/Audiologic coding article: https://www.cms.gov/medicare-coverage-database/view/article.aspx?articleId=57434

### Ménière disease / 梅尼爾氏病 — `cond.*`

**Definition:** Inner-ear disorder characterized by episodic vertigo with fluctuating hearing symptoms; tinnitus and aural pressure/fullness commonly occur.

**ICD-10-CM:**
- H81.01 right
- H81.02 left
- H81.03 bilateral
- H81.09 unspecified ear

**Sources:**
- MedlinePlus Ménière Disease: https://medlineplus.gov/menieresdisease.html
- NIDCD Balance Disorders: https://www.nidcd.nih.gov/health/balance-disorders
- CMS coding article above

### Tinnitus / 耳鳴 — `sym.*` or existing condition representation per current schema

**Definition:** Perception of ringing/buzzing or other sound without an external sound source.

**Track:** laterality, pulsatile vs nonpulsatile, hearing loss, sudden onset, vestibular symptoms.

**ICD-10-CM:**
- H93.11 right
- H93.12 left
- H93.13 bilateral
- H93.19 unspecified ear

**Sources:**
- CMS Vestibular/Audiologic coding article
- NIDCD health information should be preferred for future full content enrichment

### Trigeminal Neuralgia / 三叉神經痛 — `cond.*`

**Definition:** Neuropathic facial pain involving the trigeminal nerve; should remain distinct from generic facial pain and headache.

**ICD-10-CM:** `G50.0`.

**Coding/source evidence:**
- CMS coding article containing G50.0: https://www.cms.gov/medicare-coverage-database/view/article.aspx?articleid=56607

---

## Agent tasks for this group

1. Match every row against current `cond.*` / `sym.*`.
2. Add bilingual aliases without changing canonical IDs.
3. Add versioned ICD-10-CM external mapping objects.
4. Add `laterality_applicable=true` for tinnitus/BPPV/Ménière when represented in symptom/condition tracking.
5. Ensure unified search treats:
   - 頭暈 → dizziness
   - 眩暈 → vertigo
   - 偏頭痛 → migraine
   - 頭痛 → headache
   as related but non-identical concepts.
6. Do not auto-map any of these to a TCM disease/pattern without using the reviewed AcuTing relation layer.
