# AcuTing OS Clinical Card Seed Batch 01

**Prepared:** 2026-08-07  
**Target milestone:** begin structured clinical case entry by 2026-09-05  
**Purpose:** source-grounded seed data for Codex / Claude Code / Antigravity.  
**Important:** This is a staging specification, not a billing claim generator and not a replacement for clinician coding judgment.


# 00 — Ingestion Rules: Western Conditions, Symptoms, Bilingual Labels, ICD-10-CM

## 1. Non-destructive rule

Before creating any entity:

1. Search existing canonical IDs and aliases.
2. If a matching `cond.*` or `sym.*` entity exists, enrich it.
3. Do **not** rename an existing canonical ID.
4. Do **not** create a duplicate simply because the English or Chinese label differs.
5. If no safe canonical match exists, write a staging candidate. Do not invent a production ID during import.

Suggested staging shape:

```json
{
  "candidate_type": "condition|symptom",
  "preferred_name_en": "",
  "preferred_name_zh": "",
  "aliases_en": [],
  "aliases_zh": [],
  "suggested_icd10cm": [],
  "mapping_status": "candidate",
  "source_refs": [],
  "notes": ""
}
```

## 2. Entity distinction

Keep these separate:

```text
sym.headache            = symptom / complaint
cond.migraine           = biomedical diagnosis

sym.dizziness           = nonspecific dizziness / lightheadedness complaint
sym.vertigo             = spinning/motion sensation if the symptom namespace uses a distinct concept
cond.bppv               = diagnosed benign paroxysmal positional vertigo
cond.menieres_disease   = diagnosed Ménière disease
```

Do not automatically convert a chief complaint into a definitive disease diagnosis.

## 3. ICD-10-CM policy

For a clinical encounter dated **2026-09-05**, the applicable CMS/CDC ICD-10-CM release is the **April 1, 2026 update**, used for encounters from **2026-04-01 through 2026-09-30**.

For encounters beginning **2026-10-01**, use the FY2027 ICD-10-CM files.

Source:
- CMS ICD-10 page: https://www.cms.gov/medicare/coding-billing/icd-10-codes

Store coding as versioned external mappings:

```json
{
  "system": "ICD-10-CM",
  "code": "R51.9",
  "display": "Headache, unspecified",
  "release": "2026-04-01",
  "effective_from": "2026-04-01",
  "effective_to": "2026-09-30",
  "mapping_status": "source_checked"
}
```

Do **not** use ICD code as AcuTing canonical ID.

## 4. Coding specificity rule

Never auto-select an unspecified code if documentation supports a more specific code.

Important specificity dimensions include:

- laterality
- acute/chronic when encoded
- aura
- intractability
- status migrainosus
- with/without sciatica
- anatomical site
- primary vs secondary dysmenorrhea
- bleeding / esophagitis distinctions
- IBS subtype

The seed files below intentionally show common code candidates, not every possible child code.

## 5. Chinese label policy

`preferred_name_zh` is the AcuTing bilingual clinical label.

Use a common modern medical Chinese term and keep common variants as aliases.

Examples:

```text
Migraine → 偏頭痛
Dizziness → 頭暈
Vertigo → 眩暈
Low back pain → 下背痛
Dysmenorrhea → 痛經 / 經痛
GERD → 胃食道逆流病
```

Do not silently equate a Western disease label with a TCM disease (`tdis.*`) or TCM pattern (`pattern.*`).

## 6. Minimum useful Western card

A condition card can be clinically reference-ready even when not encyclopedically complete.

Minimum:

```yaml
identity:
  id: existing canonical ID
  name_en:
  name_zh:
  aliases_en: []
  aliases_zh: []

classification:
  system:
  entity_type: condition

coding:
  icd10cm: []

summary:
  definition:
  common_presentation: []

safety:
  red_flags: []
  safety_status: source_checked | incomplete

relations:
  symptom_ids: []
  tcm_disease_ids: []      # reviewed mapping only
  pattern_ids: []          # reviewed mapping only

provenance:
  field_sources: {}
```

## 7. Minimum useful symptom card / observation concept

```yaml
identity:
  id: existing sym.* ID OR staging candidate
  name_en:
  name_zh:
  aliases_en: []
  aliases_zh: []

classification:
  entity_type: symptom
  observation_type: symptom | sign | tongue | pulse | vital | other

tracking:
  severity_applicable:
  laterality_applicable:
  frequency_applicable:
  duration_applicable:

coding:
  icd10cm: []

provenance:
  field_sources: {}
```

## 8. Safety-content rule

Use high-authority biomedical sources for red flags:

- NIH / NLM / HHS
- CDC
- specialty NIH institute
- other official clinical guideline sources added later

Do not source biomedical red flags solely from CloudTCM, American Dragon, class notes, or AI inference.

## 9. Source hierarchy for this batch

**Coding**
1. CMS / CDC ICD-10-CM official files
2. CMS code tables / billing articles as supporting searchable evidence

**Clinical content**
1. NIH specialty institutes
2. NLM MedlinePlus
3. HHS Office on Women’s Health

## 10. Implementation instruction

For every seed in the category files:

```text
MATCH EXISTING
→ ENRICH EXISTING
→ ELSE STAGE CANDIDATE
→ VALIDATE
→ HUMAN REVIEW
→ ONLY THEN PROMOTE
```

Never mass-promote staging candidates solely because labels look similar.
