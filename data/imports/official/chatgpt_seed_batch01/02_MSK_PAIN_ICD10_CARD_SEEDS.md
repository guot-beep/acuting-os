# AcuTing OS Clinical Card Seed Batch 01

**Prepared:** 2026-08-07  
**Target milestone:** begin structured clinical case entry by 2026-09-05  
**Purpose:** source-grounded seed data for Codex / Claude Code / Antigravity.  
**Important:** This is a staging specification, not a billing claim generator and not a replacement for clinician coding judgment.


# 02 — Musculoskeletal / Pain Seed Cards

## Seed table

| Entity type | Preferred English | Preferred Chinese | ICD-10-CM seed / family | Notes |
|---|---|---|---|---|
| symptom | Neck pain / Cervicalgia | 頸痛 / 頸部疼痛 | M54.2 Cervicalgia | Common acupuncture complaint |
| symptom | Low back pain | 下背痛 / 腰背痛 | M54.50 unspecified; M54.51 vertebrogenic; M54.59 other | Do not flatten specific documented etiologies |
| condition/symptom depending documentation | Sciatica | 坐骨神經痛 | M54.30 unspecified; M54.31 right; M54.32 left | Laterality |
| condition | Cervical radiculopathy | 頸椎神經根病變 | M54.12 Radiculopathy, cervical region; disc-specific M50.* may apply | Do not equate radiculopathy with neck pain |
| condition | Lumbar radiculopathy | 腰椎神經根病變 | M54.16 Radiculopathy, lumbar region; disc-specific M51.16 may apply | Distinct from uncomplicated low back pain |
| symptom | Shoulder pain | 肩痛 | M25.511 right; M25.512 left; M25.519 unspecified | Laterality |
| symptom | Knee pain | 膝痛 | M25.561 right; M25.562 left; M25.569 unspecified | Laterality |
| symptom | Hip pain | 髖痛 | M25.551 right; M25.552 left; M25.559 unspecified | Laterality |
| condition | Carpal tunnel syndrome | 腕隧道症候群 | G56.00 unspecified upper limb; use laterality-specific child code if documented | Median nerve entrapment |
| condition | Fibromyalgia | 纖維肌痛症 | M79.7 | Widespread pain + fatigue/sleep issues |
| condition | Osteoarthritis | 骨關節炎 | site-specific M15–M19 family; do not assign one generic site code | Card should link to knee/hip/hand/site variants |
| symptom | Cramp and spasm | 痙攣 / 肌肉抽筋 | R25.2 Cramp and spasm | Useful for real acupuncture chief complaints |
| symptom | Jaw pain | 下顎痛 / 顎痛 | R68.84 Jaw pain | Keep separate from trigeminal neuralgia/TMJ diagnosis |
| condition | Occipital neuralgia | 枕神經痛 | M54.81 | Cross-listed with neuro group |

---

## Card-ready content

### Neck Pain / 頸痛 — `sym.*`

**Definition:** Pain localized to the cervical/neck region. It is a symptom and may arise from muscular, joint, disc, nerve-root, inflammatory, traumatic, or other causes.

**Track:**
- onset / trauma
- midline vs paraspinal
- radiation into arm
- numbness/weakness
- range-of-motion limitation
- laterality
- severity and functional effect

**ICD-10-CM:** `M54.2 Cervicalgia`.

**Do not merge with:** cervical radiculopathy, cervical disc disorder, myelopathy.

**Coding evidence:** CMS lists `M54.2 Cervicalgia` and separate radiculopathy/disc codes.

### Low Back Pain / 下背痛 — `sym.*`

**Definition:** Pain involving the lower back. Causes range from nonspecific/mechanical pain to radiculopathy, fracture, infection, inflammatory disease, visceral referral, and other conditions.

**Common ICD-10-CM choices:**
- M54.50 Low back pain, unspecified
- M54.51 Vertebrogenic low back pain
- M54.59 Other low back pain

**Important:** Do not auto-upgrade nonspecific pain to vertebrogenic pain.

**Safety content should include review for concerning neurologic deficits, trauma/fracture risk, systemic illness, or other features requiring medical evaluation.**

**Clinical source:**
- NIAMS Back Pain: https://www.niams.nih.gov/health-topics/back-pain
- NIAMS Chinese Back Pain: https://www.niams.nih.gov/zh-hans/health-topics/beitong

### Sciatica / 坐骨神經痛 — condition/symptom concept

**ICD-10-CM:**
- M54.30 unspecified side
- M54.31 right
- M54.32 left
- If low back pain with sciatica is specifically documented, M54.40/M54.41/M54.42 may apply.

**Do not store one combined “sciatica” label and discard whether low-back pain accompanies it.**

### Cervical / Lumbar Radiculopathy

These are neurologic diagnoses, not synonyms for axial pain.

**ICD-10-CM:**
- M54.12 cervical region
- M54.16 lumbar region
- other regional codes exist
- disc-disorder-with-radiculopathy codes may be more appropriate when the underlying diagnosis is documented

**Track:** sensory symptoms, weakness, reflex changes, distribution, laterality.

### Shoulder / Knee / Hip Pain

Use symptom cards for the complaint and condition cards for the established cause.

Examples:

```text
sym.knee_pain
    ↕ may be associated with
cond.knee_osteoarthritis
```

Do not replace every knee-pain encounter with osteoarthritis.

**ICD laterality:**
- Shoulder M25.511 / M25.512 / M25.519
- Knee M25.561 / M25.562 / M25.569
- Hip M25.551 / M25.552 / M25.559

### Osteoarthritis / 骨關節炎 — `cond.*`

**Definition:** Degenerative joint disease involving breakdown/change of joint tissues over time.

**Common presentation:**
- joint pain with use
- short-duration stiffness after rest/inactivity
- reduced movement
- swelling
- instability may occur
- site-specific manifestations

**Important modeling rule:** Preserve one general OA card only if useful, but coding should usually resolve to anatomical site-specific ICD-10-CM concepts rather than a generic label.

**Source:**
- NIAMS Osteoarthritis: https://www.niams.nih.gov/health-topics/osteoarthritis
- NIAMS Chinese Osteoarthritis: https://www.niams.nih.gov/zh-hans/health-topics/shenmeshiguxingguanjieyan

### Carpal Tunnel Syndrome / 腕隧道症候群 — `cond.*`

**Definition:** Median nerve compression at the wrist/carpal tunnel.

**Typical presentation:** Numbness/tingling especially involving thumb, index, and middle fingers; symptoms often develop gradually.

**Source:**
- NIAMS Carpal Tunnel Syndrome: https://www.niams.nih.gov/health-topics/carpal-tunnel-syndrome

### Fibromyalgia / 纖維肌痛症 — `cond.*`

**Definition:** Chronic disorder characterized by widespread pain/tenderness, fatigue, and sleep problems; increased pain sensitivity is an important feature.

**Common symptoms:** widespread pain, fatigue, poor sleep, stiffness, tenderness, paresthesia, cognitive complaints.

**Source:**
- NIAMS Fibromyalgia: https://www.niams.nih.gov/health-topics/fibromyalgia

---

## Coding source evidence

CMS source with many relevant pain codes:
https://www.cms.gov/medicare-coverage-database/view/article.aspx?articleId=56607

CMS official ICD release page:
https://www.cms.gov/medicare/coding-billing/icd-10-codes

## Agent tasks

1. Add `laterality_applicable` to shoulder/knee/hip/sciatica concepts.
2. Do not map an anatomical pain complaint directly to OA/radiculopathy.
3. Keep symptom and diagnosis as separate selectable results in clinical picker.
4. For an established diagnosis, allow visit/case to reference both:
   - condition ID
   - chief-complaint symptom ID
5. If current card ID exists, enrich; never rename.
