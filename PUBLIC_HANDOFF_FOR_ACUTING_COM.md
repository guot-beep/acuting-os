# Public Handoff for acuting.com

## Purpose

This file explains how the AcuTing OS local/private project should hand public English content to the separate acuting.com workflow.

The acuting.com site is currently managed outside this project. Treat this repository as the source workspace and content-preparation layer, not the final public website.

## Recommended Boundary

Keep these separate:

- `AcuTing OS`: private bilingual study app, clinical learning database, de-identified case notebook, NCCAOM prep, personal notes.
- `AcuTing Learn`: public English educational content that can later be published on acuting.com.

Do not publish private case notes, school-only notes, copyrighted textbook passages, or unreviewed clinical claims.

## Public-Ready Folder Candidates

These are the most relevant files/folders for public English site planning:

```text
data/learn/
data/tung/
data/sources/
data/acupoints/361.json
data/herbs/formulas.json
data/herbs/formula_categories.json
data/herbs/high_yield_formula_seeds.json
data/herbs/formula_safety_flags.json
data/evidence/
data/pathology/
data/pathology/condition_graph_expansion.json
data/clinical_cases/fertility_workflow_seed.json
```

Key architecture file:

```text
data/learn/public_knowledge_architecture.json
```

## Current Public Architecture

The public site should eventually support:

- Traditional Acupuncture.
- Master Tung's Acupuncture.
- Auricular Medicine.
- Special Methods.
- Herbal Formulas.
- Conditions, Evidence, and Safety.

Master Tung structure is seeded in:

```text
data/tung/schema.json
data/tung/zones.json
```

This is structure-only. Do not publish individual Tung point pages until each record is rewritten, source-checked, and marked `public_ready`.

Formula category structure is seeded in:

```text
data/herbs/formula_categories.json
data/herbs/formulas.json
data/herbs/high_yield_formula_seeds.json
data/herbs/formula_safety_flags.json
```

Individual formula pages should not be public until each formula has composition, pattern indications, contraindications, herb-drug cautions, fertility/pregnancy review where relevant, source URLs, and `public_ready` status.

The current high-yield formula records are draft seeds only. They are useful for private study, NCCAOM organization, and future page planning, but should not be published as clinical instructions.

Fertility workflow data is private-clinical scaffolding:

```text
data/clinical_cases/fertility_workflow_seed.json
data/medications/western_medications.json
```

Do not publish fertility workflows as treatment protocols. Public content may discuss general education only after source review, conservative safety wording, and removal of private clinical documentation assumptions.

Condition graph data is also draft scaffolding:

```text
data/pathology/conditions.json
data/pathology/condition_graph_expansion.json
```

Use it to understand relationships among Western conditions, Eastern disease categories, TCM patterns, formulas, acupuncture seeds, medications, and safety flags. Public pages must avoid one-to-one diagnosis translation and must state that pattern differentiation is individualized.

## Source Policy

Public English content should be:

1. Rewritten in original English.
2. Source-linked.
3. Checked against professional or official references.
4. Conservative about evidence and safety.
5. Clearly separated from private personal notes and clinic records.

Chinese and English websites may be used for structure, terminology, and topic discovery, but not copied wholesale into public articles.

## Suggested Claude/acuting.com Integration Task

Ask the website maintainer:

```text
Please review the AcuTing OS public content architecture in data/learn/public_knowledge_architecture.json and create matching public content sections on acuting.com for Acupuncture, Master Tung, Auricular, Formulas, Conditions, and Evidence/Safety. Use the JSON files as source scaffolds, but publish only content marked public_safe or reviewed.
```

## Review Status Convention

Use these values before publishing:

```text
draft
translated
source_checked
clinically_reviewed
public_ready
```

Only `public_ready` content should be copied to the final public site.
