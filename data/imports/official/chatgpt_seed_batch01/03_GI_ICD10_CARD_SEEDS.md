# AcuTing OS Clinical Card Seed Batch 01

**Prepared:** 2026-08-07  
**Target milestone:** begin structured clinical case entry by 2026-09-05  
**Purpose:** source-grounded seed data for Codex / Claude Code / Antigravity.  
**Important:** This is a staging specification, not a billing claim generator and not a replacement for clinician coding judgment.


# 03 — Gastrointestinal Seed Cards

## Seed table

| Entity type | Preferred English | Preferred Chinese | ICD-10-CM seed / family | Notes |
|---|---|---|---|---|
| symptom | Abdominal pain | 腹痛 | R10.*; R10.9 unspecified | Location-specific codes should be preferred when documented |
| symptom | Nausea | 噁心 | R11.0 | Do not merge with vomiting |
| symptom | Diarrhea | 腹瀉 | R19.7 Diarrhea, unspecified | Cause-specific diagnosis may supersede |
| symptom/condition | Constipation | 便秘 | K59.00 Constipation, unspecified; more specific codes exist | Track frequency/stool difficulty |
| condition | Irritable bowel syndrome | 腸躁症 / 大腸激躁症 | K58.0 diarrhea; K58.1 constipation; K58.2 mixed; K58.8 other; K58.9 without diarrhea | Preserve subtype |
| condition | GERD | 胃食道逆流病 | K21.9 without esophagitis; K21.00/.01 with esophagitis no/with bleeding | Do not merge reflux symptom with established GERD |
| condition | Functional dyspepsia | 功能性消化不良 | K30 | Separate from generic epigastric pain |
| condition | Gastroparesis | 胃輕癱 / 胃排空延遲 | K31.84 | Delayed gastric emptying without mechanical obstruction |
| symptom | Bloating | 腹脹 | coding varies; do not force to IBS | Useful clinical symptom |
| symptom | Regurgitation | 反流 / 反芻感 | coding depends on context | Common GERD manifestation |
| symptom | Heartburn | 胃灼熱 / 火燒心 | symptom coding exists but diagnosed GERD may be more appropriate | Keep symptom separate |
| symptom | Early satiety | 早飽 | R68.81 Early satiety | Useful gastroparesis/dyspepsia observation |

---

## Card-ready content

### Abdominal Pain / 腹痛 — `sym.*`

**Definition:** Pain anywhere between the lower chest and groin; it can originate from many abdominal or extra-abdominal structures.

**Track:**
- onset
- location/quadrant
- radiation
- severity
- relation to meals
- bowel changes
- vomiting
- bleeding
- fever
- pregnancy possibility
- urinary symptoms

**Coding:** Use R10.*. If location is documented, prefer the location-specific code rather than `R10.9`.

Examples from CMS clinical concepts:
- R10.10 upper abdominal pain, unspecified
- R10.11 RUQ
- R10.12 LUQ
- R10.13 epigastric
- R10.30 lower abdominal pain
- R10.31 RLQ
- R10.32 LLQ
- R10.33 periumbilical
- R10.84 generalized
- R10.9 unspecified

**High-priority safety:** sudden sharp pain, associated chest/neck/shoulder pain, hematemesis, or blood in stool are among features requiring urgent medical attention.

**Source:**
- MedlinePlus Abdominal Pain: https://medlineplus.gov/abdominalpain.html

### IBS / 腸躁症 — `cond.*`

**Definition:** Chronic disorder with recurrent abdominal pain related to bowel movements and changes in stool pattern, without visible structural damage explaining the symptoms.

**Common presentation:**
- abdominal pain
- diarrhea and/or constipation
- bloating
- incomplete evacuation sensation
- mucus may occur
- symptoms may fluctuate

**ICD-10-CM:**
- K58.0 IBS with diarrhea
- K58.1 IBS with constipation
- K58.2 Mixed IBS
- K58.8 Other IBS
- K58.9 IBS without diarrhea

**Do not discard subtype.**

**Source:**
- NIDDK IBS: https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome
- Symptoms: https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/symptoms-causes

### GERD / 胃食道逆流病 — `cond.*`

**Definition:** Repeated bothersome reflux of stomach contents into the esophagus or reflux producing complications.

**Common symptoms:**
- heartburn
- regurgitation
- may include chest pain, nausea, dysphagia/odynophagia, chronic cough, hoarseness

**Safety/referral features described by NIDDK include:**
- chest pain
- persistent vomiting
- dysphagia/odynophagia
- GI bleeding
- unexplained weight loss

**ICD-10-CM examples:**
- K21.9 GERD without esophagitis
- K21.00 GERD with esophagitis, without bleeding
- K21.01 GERD with esophagitis, with bleeding

**Sources:**
- NIDDK GERD definition: https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults/definition-facts
- NIDDK GERD symptoms: https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults/symptoms-causes
- CMS GERD coding article: https://www.cms.gov/medicare-coverage-database/view/article.aspx?articleid=56395

### Functional Dyspepsia / 功能性消化不良 — `cond.*`

**ICD-10-CM:** `K30 Functional dyspepsia`.

Do not merge with:
- generic abdominal pain
- GERD
- gastroparesis
- gastritis

**Source for code:** CMS ICD definitions/manual resources.

### Gastroparesis / 胃輕癱 — `cond.*`

**Definition:** Disorder in which movement of food from the stomach to small intestine is slowed or stopped without a mechanical blockage.

**Common presentation:**
- early satiety
- prolonged fullness after eating
- nausea
- vomiting

**ICD-10-CM:** `K31.84`.

**Source:**
- NIDDK Gastroparesis: https://www.niddk.nih.gov/health-information/digestive-diseases/gastroparesis

### Constipation / 便秘

**Definition:** May involve fewer than three bowel movements per week, hard/dry/lumpy stools, difficult or painful passage, or incomplete evacuation.

**Safety/referral:** persistent constipation plus rectal bleeding, blood in stool, or continual abdominal pain requires medical assessment.

**Source:**
- NIDDK Constipation: https://www.niddk.nih.gov/health-information/digestive-diseases/constipation

---

## Agent tasks

1. Keep symptom cards (abdominal pain, nausea, diarrhea, bloating) separate from definitive GI diagnoses.
2. Preserve IBS subtype.
3. Make abdominal location structured enough to support R10.* specificity later.
4. Add GI red-flag fields before marking a card `clinically_reviewed`.
5. Never infer GERD solely because a patient reports heartburn.
