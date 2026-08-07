# AcuTing OS Clinical Card Seed Batch 01

**Prepared:** 2026-08-07  
**Target milestone:** begin structured clinical case entry by 2026-09-05  
**Purpose:** source-grounded seed data for Codex / Claude Code / Antigravity.  
**Important:** This is a staging specification, not a billing claim generator and not a replacement for clinician coding judgment.


# 04 — Women's Health / Menstrual & Menopause Seed Cards

## Seed table

| Entity type | Preferred English | Preferred Chinese | ICD-10-CM seed / family | Notes |
|---|---|---|---|---|
| symptom/condition | Dysmenorrhea | 痛經 / 經痛 | N94.4 primary; N94.5 secondary; N94.6 unspecified | Preserve primary vs secondary |
| condition/symptom category | Irregular menstruation | 月經不規則 | N92.6 unspecified; more specific menstrual codes exist | Do not use if a more specific abnormality is documented |
| symptom | Abnormal uterine/vaginal bleeding | 異常子宮／陰道出血 | N93.9 unspecified; more specific codes exist | High safety relevance |
| condition/symptom state | Amenorrhea | 閉經 | N91.2 unspecified; more specific codes exist | Pregnancy and underlying cause matter |
| condition | Premenstrual syndrome | 經前症候群 | N94.3 Premenstrual tension syndrome | PMDD is a different diagnosis |
| condition/state | Menopausal symptoms / climacteric state | 更年期症狀 / 更年期狀態 | N95.1 | Do not use for asymptomatic menopause if another code is appropriate |
| symptom | Pelvic pain | 骨盆痛 | R10.2 family / current more-specific pelvic pain variants may apply | Track laterality if schema supports it |
| symptom | Hot flashes | 熱潮紅 / 潮熱 | commonly linked to menopausal state when clinically established | Do not invent menopause diagnosis from one symptom |
| symptom | Heavy menstrual bleeding | 經血過多 / 月經量過多 | N92.* family | Cycle regularity matters |
| symptom | Postmenopausal bleeding | 絕經後出血 | requires prompt biomedical evaluation; coding should use specific documented diagnosis/symptom | Safety-critical |

---

## Card-ready content

### Dysmenorrhea / 痛經 — `cond.*` or clinical problem concept

**Definition:** Pain associated with menstruation, commonly cramping lower abdominal/pelvic pain; back pain, nausea, diarrhea, or headache may accompany it.

**Types:**
- primary dysmenorrhea: menstrual pain not caused by another condition
- secondary dysmenorrhea: pain associated with another pelvic condition

**ICD-10-CM:**
- N94.4 Primary dysmenorrhea
- N94.5 Secondary dysmenorrhea
- N94.6 Dysmenorrhea, unspecified

**Important:** Do not default to primary if etiology has not been assessed/documented.

**Sources:**
- MedlinePlus Period Pain: https://medlineplus.gov/periodpain.html
- HHS Office on Women’s Health Period Problems: https://womenshealth.gov/menstrual-cycle/period-problems

### Irregular Menstruation / 月經不規則

**Definition:** Menstrual timing/cycle variation outside the person’s usual or expected pattern. The HHS Office on Women’s Health describes irregular cycles using interval and month-to-month variability examples.

**ICD-10-CM seed:** `N92.6 Irregular menstruation, unspecified`, but use a more specific N92.* code when the abnormality is clearly documented.

**Coding source:**
- CMS OB/GYN Clinical Concepts: official CMS ICD resource

### Abnormal Uterine/Vaginal Bleeding / 異常子宮／陰道出血

**Definition:** Bleeding that differs from the expected menstrual pattern or occurs outside expected menstruation.

**ICD-10-CM seed:** `N93.9 Abnormal uterine and vaginal bleeding, unspecified`.

**Safety:** Bleeding after menopause should not be normalized as a routine “menopause symptom”; HHS advises prompt medical evaluation.

**Sources:**
- Office on Women’s Health Period Problems: https://womenshealth.gov/menstrual-cycle/period-problems
- CMS coding evidence for N93.9: CMS Medicare Coverage Database

### Premenstrual Syndrome / 經前症候群 — `cond.*`

**Definition:** Cyclic physical/emotional symptoms occurring after ovulation and before menstruation, improving soon after menstruation begins.

**Common manifestations:**
- bloating
- headache
- mood changes / irritability
- fatigue
- other physical/emotional symptoms

**ICD-10-CM:** `N94.3 Premenstrual tension syndrome`.

**Important:** Do not merge PMS with PMDD.

**Source:**
- HHS Office on Women’s Health PMS: https://womenshealth.gov/menstrual-cycle/premenstrual-syndrome

### Menopausal Symptoms / 更年期症狀

**Common manifestations:**
- irregular menstrual cycles during transition
- hot flashes
- sleep difficulty
- mood changes
- vaginal dryness
- urinary/sexual symptoms may occur

**ICD-10-CM seed:** `N95.1 Menopausal and female climacteric states`.

**Safety:** Vaginal bleeding after menopause requires medical evaluation.

**Source:**
- Office on Women’s Health Menopause Basics: https://womenshealth.gov/menopause/menopause-basics
- Menopause Symptoms: https://womenshealth.gov/menopause/menopause-symptoms-and-relief
- CMS coding evidence for N95.1

### Heavy / Irregular Menstrual Bleeding

Do not create a single vague “period problem” entity if a clinically meaningful specific observation exists.

Potential structured fields:
- cycle interval
- cycle variability
- bleeding duration
- estimated heaviness
- clots
- intermenstrual bleeding
- postcoital bleeding
- postmenopausal bleeding
- pain severity
- pregnancy status when relevant

This structure will later support both clinical tracking and more specific ICD-10-CM mapping.

---

## Agent tasks

1. Preserve primary vs secondary dysmenorrhea.
2. Keep PMS and PMDD distinct.
3. Never map hot flash → menopause automatically.
4. Flag postmenopausal bleeding as safety-critical.
5. Preserve menstrual timeline variables in clinical Visit/Case data rather than hiding them in prose.
6. Search current cards first and enrich existing IDs.
