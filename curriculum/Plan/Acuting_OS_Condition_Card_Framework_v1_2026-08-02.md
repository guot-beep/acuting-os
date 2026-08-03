# Acuting OS Condition Card Framework v1

**Date:** 2026-08-02  
**Project:** Acuting OS  
**Audience:** Antigravity, Codex, Claude Code, and future AI agents  
**Purpose:** Define the product, data, UI, mapping, evidence, and notes architecture for biomedical conditions, TCM diseases, and TCM patterns.

---

# 1. Current State

Acuting OS currently has compact condition preview cards containing items such as:

- Bilingual title
- Draft or review status
- Internal condition ID
- Category tags
- ICD hint
- Short bilingual summary
- Symptom chips
- Collapsible red-flag section

These compact cards should remain as **Preview Cards** for search results and browsing.

The next stage is to add a separate **Big Condition Detail Card**.

```text
Condition Library
→ Preview Card
→ Big Condition Detail Card
→ Relationships
→ Evidence
→ Notes
```

The library page should remain compact. Detailed clinical content should open in a dedicated view.

---

# 2. Core Domain Model

Do not combine Chinese medicine and biomedical concepts into one generic condition object.

The condition system should contain at least three distinct entity types:

```text
Biomedical Condition
TCM Disease
TCM Pattern
```

Examples:

```text
Biomedical Condition
→ Migraine
→ Polycystic Ovary Syndrome
→ Iron Deficiency Anemia

TCM Disease
→ Headache 頭痛
→ Dysmenorrhea 痛經
→ Insomnia 不寐

TCM Pattern
→ Liver Yang Rising 肝陽上亢
→ Heart and Spleen Deficiency 心脾兩虛
→ Phlegm-Dampness 痰濕
```

These entities must be connected through explicit many-to-many relationships.

Incorrect:

```text
Migraine = Liver Yang Rising
```

Correct:

```text
Migraine
→ may clinically overlap with
→ Liver Yang Rising

Migraine
→ may also overlap with
→ Blood Deficiency
→ Phlegm-Dampness
→ Blood Stasis
```

---

# 3. Product Structure

## 3.1 Preview Card

The Preview Card should remain compact.

Recommended fields:

```text
Entity type badge
Bilingual title
Status
Internal ID
Category tags
ICD hint when relevant
Short summary
Common symptom chips
Red-flag indicator
Related entity counts
Favorite action
Open full card action
```

Example:

```text
[Biomedical Condition]

Polycystic Ovary Syndrome
多囊性卵巢症候群

cond.pcos · gyn_fertility · ICD hint E28.2

Short bilingual summary...

Delayed Menstruation
Amenorrhea
Female Infertility

4 TCM patterns
6 acupoint strategies
3 formula links

[Open Full Card]
```

The Preview Card should not contain full diagnostic, treatment, or evidence content.

---

## 3.2 Big Condition Detail Card

Desktop layout:

```text
┌──────────────────────────────────────────────────────┐
│ Sticky Condition Header                              │
├─────────────┬────────────────────────┬───────────────┤
│ Left Panel  │ Main Content           │ Right Panel   │
│             │                        │               │
│ Navigation  │ Clinical sections      │ Quick facts   │
│ Tags        │ Diagnosis              │ Relationships │
│ Status      │ Treatment              │ Notes         │
│ Sources     │ Evidence               │ Actions       │
└─────────────┴────────────────────────┴───────────────┘
```

Mobile layout:

```text
Sticky Header
Quick Facts
Expandable Sections
Related Cards
Notes
Sources
```

---

# 4. Shared Condition Header

All three entity types should use a shared header component.

Example:

```text
Migraine
偏頭痛

Biomedical Condition

Aliases:
Migraine disorder · Migraine headache

System:
Neurology

Review status:
Reviewed

Evidence freshness:
Reviewed July 2026
```

Recommended actions:

```text
Favorite
Add Note
Compare
Add Relationship
Edit
More
```

Shared base fields:

```yaml
id:
entity_type:
primary_name:
chinese_name:
pinyin:
aliases:
short_definition:
category:
body_systems:
tags:
review_status:
created_at:
updated_at:
last_reviewed_at:
schema_version:
```

---

# 5. Shared Tabs

All condition-related cards may use the same major tab structure:

```text
Overview
Clinical Features
Diagnosis / Differentiation
Treatment
Safety
Mappings
Evidence
Notes
History
Sources
```

The content inside each tab should vary by entity type.

---

# 6. Biomedical Condition Card

Examples:

- Migraine
- Polycystic Ovary Syndrome
- Hypothyroidism
- Knee Osteoarthritis
- Iron Deficiency Anemia

## 6.1 Overview

```yaml
overview:
  definition:
  body_systems:
  condition_category:
  subtypes:
  clinical_course:
  affected_populations:
  common_comorbidities:
```

## 6.2 Pathophysiology

Do not store pathophysiology as one undifferentiated paragraph.

```yaml
pathophysiology:
  summary:
  core_mechanisms:
  affected_structures:
  hormonal_pathways:
  neurologic_pathways:
  inflammatory_pathways:
  metabolic_pathways:
  contributing_factors:
```

Only relevant fields should be displayed.

## 6.3 Clinical Features

```yaml
clinical_features:
  symptoms:
    common:
    less_common:
    severe:
  signs:
    physical_exam:
    neurologic:
    vital_signs:
    laboratory:
    imaging:
  associated_features:
  complications:
```

Possible UI sections:

```text
Common Symptoms
Less Common Symptoms
Physical Findings
Associated Features
Complications
```

## 6.4 Etiology, Risk Factors, and Triggers

These concepts must remain separate.

```yaml
etiology:
risk_factors:
predisposing_factors:
triggers:
protective_factors:
```

```text
Cause
≠ Risk factor
≠ Trigger
≠ Associated factor
```

## 6.5 Diagnosis

```yaml
diagnosis:
  criteria:
  history_questions:
  examination:
  laboratory_tests:
  imaging:
  screening_tools:
  diagnostic_limitations:
```

## 6.6 Differential Diagnosis

Differentials should link to other condition entities and include distinguishing features.

```yaml
differential_diagnoses:
  - condition_id:
    distinguishing_features:
    urgency_level:
    recommended_action:
    source_ids:
```

Example UI:

```text
Tension-Type Headache
Key distinction:
Usually bilateral and pressing, with less prominent nausea.

Subarachnoid Hemorrhage
Key distinction:
Sudden thunderclap headache.
Urgency:
Emergency
```

## 6.7 Red Flags and Referral

Urgency levels:

```text
Emergency
Same-Day Referral
Urgent Referral
Routine Referral
Monitor
```

Suggested structure:

```yaml
red_flags:
  - finding:
    urgency_level:
    recommended_action:
    rationale:
    source_ids:
```

Safety information must remain structured and visible.

## 6.8 Standard Biomedical Treatment

```yaml
standard_treatment:
  medications:
  procedures:
  rehabilitation:
  lifestyle:
  monitoring:
```

Medications should link to independent Medication Cards.

```text
biomedical:migraine
→ TREATED_WITH
→ medication:sumatriptan
```

Do not duplicate complete medication pharmacology inside every condition card.

## 6.9 Acupuncture and TCM Integration

This section should display relationships instead of duplicating full TCM content.

Suggested sections:

```text
Related TCM Diseases
Possible TCM Patterns
Common Acupoint Strategies
Related Formulas
Evidence for Acupuncture
```

Each mapping should display:

```text
Mapping type
Mapping strength
Rationale
Source
Review status
Last reviewed
```

---

# 7. TCM Disease Card

Examples:

- Headache 頭痛
- Insomnia 不寐
- Dizziness 眩暈
- Dysmenorrhea 痛經

A TCM Disease must remain separate from a TCM Pattern.

## 7.1 Overview

```yaml
overview:
  definition:
  chinese_name:
  pinyin:
  classical_names:
  category:
  affected_zang_fu:
  affected_channels:
```

## 7.2 Etiology and Pathogenesis

```yaml
etiology:
  external:
  internal:
  emotional:
  dietary:
  lifestyle:
  constitutional:
  trauma:

pathogenesis:
  summary:
  progression:
  root_mechanisms:
  branch_manifestations:
```

## 7.3 Clinical Manifestations

```yaml
clinical_manifestations:
  core:
  associated:
  location:
  timing:
  aggravating_factors:
  relieving_factors:
```

## 7.4 Pattern Differentiation

This is the central section of a TCM Disease Card.

```text
Headache 頭痛
├── Liver Yang Rising
├── Blood Deficiency
├── Phlegm-Dampness
├── Blood Stasis
└── Kidney Deficiency
```

Relationship:

```text
tcm-disease:headache
→ HAS_PATTERN
→ pattern:liver-yang-rising
```

Pattern summaries may display:

```text
Key symptoms
Tongue
Pulse
Treatment principle
Formula
Acupoint strategy
```

Detailed content should remain in the independent TCM Pattern Card.

## 7.5 Treatment Strategy

```yaml
treatment_strategy:
  general_principle:
  root_treatment:
  branch_treatment:
  acupuncture_strategy:
  herbal_strategy:
  lifestyle_strategy:
```

## 7.6 Biomedical Mapping

A TCM Disease Card may connect to multiple biomedical conditions.

Example:

```text
Headache 頭痛

Possible Biomedical Conditions:
Migraine
Tension-Type Headache
Cervicogenic Headache
Hypertension-Related Headache
Sinus-Related Headache
```

Mapping labels must remain cautious:

```text
Possible overlap
Symptom overlap
Clinical correlation
Not equivalent
```

## 7.7 Biomedical Safety Screen

Every TCM Disease Card must contain:

```text
Urgent biomedical differentials
Red flags
Referral criteria
Contraindications
```

---

# 8. TCM Pattern Card

Examples:

- Liver Yang Rising 肝陽上亢
- Heart and Spleen Deficiency 心脾兩虛
- Blood Stasis 血瘀
- Phlegm-Dampness 痰濕

The TCM Pattern Card is a key mapping node.

## 8.1 Pattern Identity

```yaml
pattern_identity:
  pattern_name:
  chinese_name:
  pinyin:
  pattern_category:
  root_pattern:
  branch_manifestation:
  zang_fu:
  qi_blood_fluid:
  eight_principles:
    interior_exterior:
    heat_cold:
    excess_deficiency:
    yin_yang:
```

## 8.2 Pattern Mechanism

```yaml
pattern_mechanism:
  summary:
  underlying_deficiency:
  excess_manifestation:
  common_causes:
  progression:
```

## 8.3 Key Manifestations

```yaml
manifestations:
  key_symptoms:
  supporting_symptoms:
  tongue:
  pulse:
  emotional_features:
  constitutional_features:
```

## 8.4 Differential Patterns

```yaml
differential_patterns:
  - pattern_id:
    distinguishing_features:
    tongue_difference:
    pulse_difference:
    clinical_significance:
```

Example comparisons:

```text
Liver Yang Rising
vs.
Liver Fire Blazing

Liver Yang Rising
vs.
Yin Deficiency with Empty Heat
```

## 8.5 Associated Conditions

A pattern may connect to:

```text
TCM Diseases
Biomedical Conditions
Symptoms
Signs
```

Examples:

```text
pattern:liver-yang-rising
→ ASSOCIATED_WITH
→ tcm-disease:headache

pattern:liver-yang-rising
→ MAY_CORRESPOND_TO
→ biomedical:migraine
```

## 8.6 Treatment

```yaml
treatment:
  treatment_principle:
  primary_acupoints:
  supporting_acupoints:
  formula_strategies:
  herb_strategies:
  lifestyle:
  contraindications:
```

All acupoints, formulas, and herbs should link by stable entity ID.

---

# 9. Relationship and Mapping Architecture

Do not store mapping as uncontrolled arrays such as:

```json
{
  "westernConditions": ["migraine"]
}
```

Use independent relationship objects.

```json
{
  "id": "rel-001",
  "source_id": "biomedical:migraine",
  "relationship_type": "MAY_CORRESPOND_TO",
  "target_id": "pattern:liver-yang-rising",
  "mapping_category": "clinical_overlap",
  "strength": "moderate",
  "confidence": "reviewed",
  "rationale": "Possible overlap in unilateral headache, dizziness, irritability, and visual disturbance.",
  "source_ids": [
    "source:textbook-001"
  ],
  "review_status": "reviewed",
  "last_reviewed_at": "2026-08-02"
}
```

Approved relationship types for v1:

```text
HAS_SYMPTOM
HAS_SIGN
HAS_PATTERN
HAS_SUBTYPE
HAS_RED_FLAG
HAS_DIFFERENTIAL
TREATED_WITH
ASSESSED_BY
SUPPORTED_BY_EVIDENCE
MAY_CORRESPOND_TO
CLINICALLY_OVERLAPS_WITH
MECHANISTICALLY_RELATED_TO
CONTRAINDICATED_WITH
INTERACTS_WITH
ASSOCIATED_WITH
```

Agents must not invent new relationship types without an approved schema migration.

---

# 10. Evidence Architecture

Evidence should not be embedded as uncontrolled freeform prose inside the condition object.

The Condition Card may display a summary:

```text
Acupuncture for Migraine Prevention

Evidence summary:
Moderate

Study types:
Guidelines · Systematic Reviews · RCTs

Clinical role:
Adjunctive or preventive option

Last reviewed:
July 2026
```

The backend should link to independent Evidence Cards.

```text
biomedical:migraine
→ SUPPORTED_BY_EVIDENCE
→ evidence:migraine-acupuncture-review-001
```

The Condition Card may display:

```text
Evidence level
Study types
Clinical role
Safety findings
Evidence freshness
Last reviewed
```

The Evidence Card should preserve:

```text
Study design
Population
Intervention
Comparator
Outcome
Effect estimate
Risk of bias
Limitations
Clinical relevance
Source
```

---

# 11. Notes Architecture

Personal notes must not be mixed with verified condition content.

Use an independent Note entity.

```yaml
note_id:
target_type:
target_id:
section_anchor:
claim_id:
note_type:
title:
content_markdown:
tags:
source_links:
author:
visibility:
created_at:
updated_at:
```

Example:

```yaml
note_id: note-2026-001
target_type: biomedical_condition
target_id: biomedical:migraine
section_anchor: differential_diagnosis
note_type: lecture_note
title: Week 4 Headache Red Flags
content_markdown: |
  Remember SNOOP10 and thunderclap headache.
visibility: private
```

Recommended note types:

```text
Personal Note
Lecture Note
Clinical Pearl
Question
Correction
Evidence Update
Case Reflection
To Review
```

Notes may attach to:

```text
Whole card
Specific section
Specific relationship
Specific claim
Specific evidence item
```

---

# 12. Suggested Folder Structure

```text
data/
├── conditions/
│   ├── biomedical/
│   └── tcm-diseases/
│
├── patterns/
├── symptoms/
├── signs/
├── red-flags/
├── medications/
├── diagnostic-tests/
├── evidence/
├── relationships/
└── notes/
```

Suggested schemas:

```text
schemas/
├── condition-base.schema.json
├── biomedical-condition.schema.json
├── tcm-disease.schema.json
├── tcm-pattern.schema.json
├── relationship.schema.json
├── note.schema.json
└── evidence.schema.json
```

A shared base schema may be extended by each entity type.

---

# 13. Big Card UI Specification

## 13.1 Sticky Header

```text
Migraine 偏頭痛
Biomedical Condition

[Favorite] [Add Note] [Compare] [Edit]
```

## 13.2 Left Navigation

```text
Overview
Pathophysiology
Clinical Features
Diagnosis
Differentials
Red Flags
Treatment
TCM Mapping
Evidence
Notes
Sources
History
```

## 13.3 Right Quick Panel

```text
Quick Facts

System
Neurology

Typical Course
Recurrent

Urgency
Usually non-emergency

Related
6 Symptoms
4 Patterns
8 Acupoints
3 Formulas
5 Medications

Review Status
Reviewed
```

---

# 14. MVP Scope

## Condition Card v1

Implement:

- Big-card shell
- Biomedical Condition
- TCM Disease
- TCM Pattern
- Overview
- Symptoms
- Diagnosis or differentiation
- Red flags
- Treatment
- Basic relationships
- Notes
- Sources

## Condition Card v1.5

Add:

- Evidence Cards
- Medication links
- Diagnostic tests
- Mapping strength
- Comparison mode
- Revision history
- Relationship review status

## Condition Card v2

Add later:

- Clinical pathways
- AI-assisted mapping
- Evidence freshness
- Case integration
- Longitudinal outcomes
- Living literature alerts
- Automated evidence-update queue

---

# 15. First Prototype Vertical Slice

Do not begin with twenty incomplete cards.

Build one complete vertical slice.

Recommended prototype:

```text
Biomedical Condition
Migraine

TCM Disease
Headache 頭痛

TCM Patterns
Liver Yang Rising
Blood Deficiency
Phlegm-Dampness
Blood Stasis

Symptoms
Headache
Nausea
Photophobia
Dizziness

Treatments
Acupoints
Formulas
Medications

Safety
Headache red flags

Evidence
Acupuncture for migraine prevention

Notes
Lecture notes
Clinical pearls
Questions
```

This prototype should test:

- Preview Card
- Big Biomedical Condition Card
- Big TCM Disease Card
- TCM Pattern Cards
- Relationships
- Symptoms
- Treatment links
- Red flags
- Evidence
- Notes
- Mobile layout
- Search and navigation

---

# 16. Agent Instructions

All agents working on Condition Cards must follow these rules:

1. Read this document before changing condition-related files.
2. Do not merge Biomedical Condition, TCM Disease, and TCM Pattern into one type.
3. Do not create one-to-one equivalence between TCM and biomedical diagnoses.
4. Use stable IDs for all entities.
5. Use relationship objects for mapping.
6. Do not invent new relationship types.
7. Do not add unapproved schema fields.
8. Do not place personal notes inside verified medical content.
9. Do not duplicate full medication, herb, formula, acupoint, or evidence content.
10. Link to independent entities by ID.
11. Preserve red flags as structured and visible data.
12. Preserve source provenance.
13. Distinguish theory, mechanism, clinical evidence, and expert opinion.
14. Do not make unsupported medical claims.
15. Keep the existing small card as the Preview Card.
16. Build the Big Card as a separate detail view.
17. Prefer small, reviewable changes.
18. Run schema validation before submitting changes.
19. Do not redesign unrelated UI.
20. Do not modify production data until the schema proposal is approved.

---

# 17. Immediate Implementation Request

Before writing large amounts of condition content:

1. Audit the current condition preview-card implementation.
2. List all existing condition fields.
3. Identify one-off and inconsistent fields.
4. Propose a shared base schema.
5. Propose three separate schemas:
   - Biomedical Condition
   - TCM Disease
   - TCM Pattern
6. Propose the relationship schema.
7. Propose the notes schema.
8. Propose the Big Card component structure.
9. Propose the mobile layout.
10. Propose migration from the current PCOS preview-card format.
11. Do not modify production data before review.
12. Keep the first implementation limited to one vertical slice.

---

# 18. Definition of Success

The Condition Card system is successful when:

- Existing preview cards remain fast and readable
- Big cards support serious clinical study
- Biomedical and TCM concepts remain distinct
- Many-to-many mapping works
- Red flags and referral are visible
- Treatments link to independent entities
- Evidence is traceable
- Personal notes remain separate
- Agents cannot invent uncontrolled fields
- The structure can support future clinical cases
- Future content expansion does not require redesigning the entire system

The final product should function as:

> **A bilingual, evidence-aware, clinically safe knowledge hub connecting biomedical conditions, TCM diseases, TCM patterns, treatments, evidence, and personal learning notes.**
