# Acuting OS: Vision, Roadmap, AI Governance, and Execution Plan

**Date:** 2026-08-02  
**Project:** Acuting OS  
**Working Vision:** Evidence-Based Integrative Medicine Knowledge Graph  
**Primary Audience:** Codex, Claude Code, Antigravity, and future AI agents working in this repository

---

# 1. Executive Summary

Acuting OS is evolving from a personal TCM study database into an **evidence-based integrative medicine knowledge graph**.

The project should not remain a collection of attractive cards. Its long-term purpose is to become a clinical reasoning and knowledge system that connects:

- Acupoints
- Herbs
- Formulas
- Channels
- TCM diseases
- TCM patterns
- Biomedical diseases
- Symptoms
- Pharmacology
- Drug-herb interactions
- Mechanisms
- Clinical evidence
- Guidelines
- Clinical cases
- Longitudinal outcomes
- Living medical literature

The project is currently in **Level 1**, focused on foundational TCM data. The next major transition is to move from isolated cards to disease-centered vertical knowledge chains.

The greatest near-term engineering problem is not lack of content generation. It is **AI governance**.

Multiple agents currently produce inconsistent output, ignore templates, rename fields, introduce new structures, and drift from the intended schema. Therefore, Acuting OS must move from prompt-based compliance to **machine-enforced compliance** using schemas, validators, controlled vocabulary, golden examples, CI checks, and role-specific agent workflows.

---

# 2. Long-Term Product Vision

## 2.1 Working Definition

> Acuting OS is an AI-assisted, evidence-based integrative medicine knowledge graph that connects TCM, Western medicine, medical evidence, biomedical mechanisms, clinical safety, and real-world cases.

Traditional databases answer:

> What is ST36?

Acuting OS should eventually answer:

- Why choose ST36?
- Which TCM patterns is it associated with?
- Which biomedical conditions has it been studied for?
- Which mechanisms are proposed?
- Which mechanisms are supported only by animal research?
- Which clinical trials exist?
- Which guidelines mention acupuncture for the condition?
- What safety concerns apply?
- Which patient cases used this intervention?
- What outcomes were recorded?
- How recent is the evidence?
- Has newer evidence changed the conclusion?

---

# 3. Core Design Principles

## 3.1 Structured Data Over Freeform Notes

Content should be stored as structured, reusable fields rather than prose-only documents.

## 3.2 Stable IDs Over Display Names

All core entities must use stable identifiers. Display names may change. IDs should not.

## 3.3 Many-to-Many Relationships

Do not force one-to-one equivalence between TCM and Western medicine.

Incorrect:

```text
Migraine = Liver Yang Rising
```

Correct:

```text
Migraine
→ may correspond to multiple TCM patterns

Liver Yang Rising
→ may appear in multiple biomedical conditions
```

## 3.4 Safety Must Be First-Class Data

Safety, contraindications, red flags, referral criteria, pregnancy warnings, anticoagulant concerns, and drug-herb interactions must not be buried in prose.

## 3.5 Evidence Must Be Separated From Theory

A proposed mechanism is not the same as proven clinical effectiveness.

The system must distinguish:

- Clinical guideline
- Systematic review
- Meta-analysis
- RCT
- Observational study
- Mechanism study
- Animal study
- Expert opinion

## 3.6 Sources Must Be Traceable

Every major clinical or pharmacological claim should have a source.

## 3.7 Versioned Knowledge

Knowledge should include:

- created date
- updated date
- last reviewed date
- evidence freshness
- source version
- revision history when appropriate

## 3.8 Vertical Slices Before Massive Expansion

It is better to complete one full disease chain than to create hundreds of disconnected cards.

Example:

```text
Migraine
→ Symptoms
→ Red flags
→ Diagnosis
→ Differential diagnosis
→ Medications
→ TCM patterns
→ Acupoints
→ Formulas
→ Interactions
→ Evidence
→ Follow-up
```

---

# 4. Maturity Model

---

## Level 1: Foundational TCM Database

### Goal

Create stable, structured, standardized foundational data.

### Main Entities

- Herbs
- Formulas
- Acupoints
- Channels
- TCM actions
- Indications
- Contraindications
- Safety
- Interactions
- Sources

### Current Status

Estimated overall maturity:

- Technical architecture: approximately 55–65%
- Content completeness: approximately 25–40%
- Overall Level 1 maturity: approximately 40–50%

### Existing Strengths

- Working website
- JSON data structure
- Herbs, formulas, and acupoints categories
- Cloudflare deployment
- Mobile access
- Basic authentication
- Batch content generation
- Validation scripts
- Multiple AI agents contributing
- Early workflow and branch discipline

### Remaining Work

- Freeze core schemas
- Establish stable IDs
- Standardize references
- Standardize safety fields
- Standardize interaction fields
- Add relationship validation
- Detect unknown fields
- Add duplicate ID detection
- Add broken-link detection
- Add terminology controls
- Add backup and migration strategy
- Reduce UI redesign churn

### Level 1 Exit Criteria

Level 1 v1.0 does not require every possible herb, formula, or acupoint.

Minimum target:

- 150–200 core herbs
- 80–120 core formulas
- 120–180 core acupoints
- At least 90% schema validation pass rate
- High-risk safety content prioritized
- All core entities have stable IDs
- References display consistently
- Relationships resolve correctly
- Mobile search works reliably
- Herb-to-formula navigation works
- Formula-to-herb navigation works
- Acupoint-to-channel navigation works
- UI is stable enough that data changes do not require repeated redesign

---

## Level 2: TCM Clinical Reasoning

### Goal

Move from dictionary-style information to treatment logic.

### Main Entities

- TCM diseases
- Patterns
- Symptoms
- Signs
- Tongue findings
- Pulse findings
- Treatment principles
- Point prescriptions
- Formula selection
- Formula modifications
- Differential pattern logic

### Example

```text
Insomnia
├── Heart and Spleen Deficiency
│   ├── Symptoms
│   ├── Tongue
│   ├── Pulse
│   ├── Treatment principle
│   ├── Formula
│   └── Acupoint strategy
├── Liver Fire
├── Yin Deficiency with Empty Heat
└── Phlegm-Heat Disturbing the Heart
```

### Level 2 Purpose

Answer:

> Why this treatment?

rather than only:

> What is this herb or point?

---

## Level 3: Biomedical Disease and Pharmacology

### Goal

Build a complete and independent biomedical layer.

### Main Entities

- Biomedical diseases
- Pathophysiology
- Clinical manifestations
- Diagnostic criteria
- Differential diagnosis
- Red flags
- Laboratory tests
- Imaging
- Standard treatments
- Medications
- Pharmacology
- Adverse effects
- Referral criteria
- Prognosis
- Clinical monitoring

### Important Rule

Do not convert biomedical disease cards into TCM cards.

The biomedical layer must remain medically coherent on its own.

---

## Level 4: Cross-System Integration

### Goal

Bridge TCM and Western medicine without falsely equating them.

### Relationship Types

#### Conceptual mapping

Example:

```text
Inflammation
↔ Heat
↔ Damp-Heat
↔ Blood Stasis
```

These are possible overlaps, not direct equivalences.

#### Symptom mapping

```text
Fatigue
├── Biomedical causes
│   ├── Anemia
│   ├── Hypothyroidism
│   └── Depression
└── TCM patterns
    ├── Qi Deficiency
    ├── Blood Deficiency
    └── Dampness
```

#### Mechanism mapping

```text
ST36 stimulation
├── TCM description
├── Neural mechanism
├── Immune mechanism
├── Proposed biological pathway
└── Evidence status
```

#### Treatment comparison

Compare:

- Conventional treatment
- Acupuncture
- Herbal medicine
- Lifestyle intervention
- Integrative use
- Safety
- Evidence strength
- Best role in care

### Level 4 Core Feature

Many-to-many mapping across:

```text
Biomedical Disease
↔ Symptoms
↔ TCM Patterns
↔ Treatment Principles
↔ Acupoints
↔ Formulas
↔ Herbs
↔ Medications
↔ Mechanisms
```

---

## Level 5: Evidence-Based Integrative Medicine

### Goal

Evaluate and compare integrative treatments using explicit evidence.

### Evidence Card Fields

```text
Study ID
Condition
Intervention
Comparator
Population
Outcome
Study design
Sample size
Effect estimate
Limitations
Risk of bias
Evidence quality
Clinical relevance
Safety findings
Guideline status
Publication date
Source
Last reviewed date
```

### Evidence Hierarchy

UI may use simplified ratings, but the database must preserve the underlying evidence type.

Suggested hierarchy:

1. Clinical guideline
2. Systematic review
3. Meta-analysis
4. Randomized controlled trial
5. Observational study
6. Mechanism study
7. Animal study
8. Expert opinion

### Evidence Quality Dimensions

Do not use star ratings alone.

Track:

- Risk of bias
- Directness
- Consistency
- Precision
- Sample size
- Replication
- Clinical significance
- Guideline status
- Population relevance
- Safety signal

### Integrative Comparison

Each disease should eventually support comparison across:

- Conventional treatment
- Acupuncture
- Herbal medicine
- Manual therapy
- Lifestyle
- Combined treatment
- Evidence strength
- Risks
- Cost
- Patient preference
- Feasibility

---

## Level 6: Living Clinical Intelligence

### Goal

Create a continuously updating clinical knowledge system.

### Main Features

- Literature monitoring
- New guideline alerts
- New meta-analysis alerts
- New RCT alerts
- Drug safety alerts
- Herb-drug interaction alerts
- Evidence conflict detection
- Knowledge freshness warnings
- Clinical case tracking
- Longitudinal outcomes
- Decision-support reminders
- Email digests
- Internal OS notifications

### Literature Sources

Potential sources:

- PubMed
- Cochrane
- JAMA
- BMJ
- The Lancet
- Nature
- Pain
- Neurology
- Acupuncture in Medicine
- Relevant professional guidelines

### Ranking Dimensions

New literature should be ranked by:

- Evidence quality
- Clinical impact
- Research attention
- Novelty
- Discussion volume
- Relevance to Acuting OS
- Safety importance
- Potential to change practice

### Notification Levels

#### Critical

- Email
- OS notification
- High visibility

#### Important

- OS inbox
- Review queue

#### Background

- Archive only
- No interruption

### Clinical Case Graph

```text
Patient case
├── Biomedical diagnosis
├── TCM pattern
├── Symptoms
├── Treatments
├── Acupoints
├── Formulas
├── Medications
├── Outcome measures
├── Adverse effects
├── Follow-up
└── Related evidence
```

---

# 5. Revised Timeline

This roadmap assumes three AI systems are working in parallel:

- Claude Code
- Codex
- Antigravity

The speed gain is real, but only if the agents are controlled by the same rules.

---

## 2026 Q3: Level 1 Stabilization

Primary goals:

- Freeze herbs schema
- Freeze formulas schema
- Freeze acupoints schema
- Add stable IDs
- Standardize references
- Standardize safety
- Standardize interactions
- Add strong validators
- Reduce UI redesign
- Establish governance files

Parallel prototype work:

- 1–3 disease cards
- symptom entity prototype
- TCM pattern entity prototype
- disease-to-treatment relationship prototype

---

## 2026 Q4: Level 1 v1.0 + Level 2 Main Build + Level 3/4 Pilot

Target by end of 2026:

### Level 1

- Core content usable
- Stable schema
- Stable IDs
- Reliable references
- Safety and interaction fields
- Validation pass rate above 90%

### Level 2

- 10–20 common conditions
- Pattern differentiation
- Tongue and pulse structure
- Treatment principles
- Point combinations
- Formula modifications

### Level 3 Pilot

- 3–5 biomedical disease cards
- 5–10 medication cards
- Pathophysiology
- Diagnosis
- Red flags
- Basic pharmacology

### Level 4 Pilot

- Many-to-many disease-pattern mapping
- Symptom-disease mapping
- Medication-herb interaction prototype
- Mechanism-to-intervention mapping

---

## 2027 H1: Level 2 Maturity + Level 3 Expansion + Level 4 Usable Bridge

Targets:

- 20–40 core conditions
- Mature TCM clinical reasoning
- Biomedical disease library expansion
- Medication and pharmacology expansion
- Differential diagnosis
- Red flags
- Laboratory and imaging links
- Referral logic
- Cross-system relationship model becomes usable

---

## 2027 H2: Level 3 and Level 4 Maturity

Targets:

- Expand pathophysiology
- Expand diagnostics
- Expand pharmacology
- Build disease vertical chains
- Mature many-to-many mappings
- Add red flags and referral logic
- Add herb-drug interaction engine
- Add clinical safety layer
- Add mechanism bridge
- Start early evidence schema

### Interaction Engine Categories

- Pharmacokinetic interaction
- Pharmacodynamic interaction
- Additive bleeding risk
- Sedative effect
- Hepatotoxicity concern
- Nephrotoxicity concern
- QT prolongation concern
- CYP interaction
- Theoretical interaction
- Uncertain evidence
- Documented clinical interaction

### Clinical Safety Layer

- Emergency red flag
- Same-day referral
- Urgent referral
- Routine referral
- Contraindication
- Pregnancy warning
- Anticoagulant warning
- Immunocompromised warning
- Infection warning
- High-risk needling area
- Herb toxicity warning

---

## 2028: Level 5 Evidence System

Targets:

- Evidence cards
- Guideline cards
- Systematic review cards
- Meta-analysis cards
- RCT cards
- Evidence grading
- Risk-of-bias tracking
- Integrative treatment comparison
- Safety evidence
- Cost and feasibility
- Patient preference

---

## Graduation and Beyond: Level 6

Targets:

- Real clinical cases
- Longitudinal outcome tracking
- Privacy model
- Consent model
- Living literature surveillance
- Email evidence alerts
- Internal OS evidence alerts
- Clinical decision support
- Evidence conflict detection
- Knowledge freshness warnings

---

# 6. AI Governance Problem

## 6.1 Current Problem

The project already has templates and rules, but agents still:

- Ignore templates
- Rename fields
- Add unapproved fields
- Change terminology
- Reorganize data
- Modify UI unnecessarily
- Create schema drift
- Produce inconsistent phrasing
- Use inconsistent evidence standards
- Introduce unsupported claims
- Edit files outside assigned scope

The core issue is:

> LLMs do not truly obey specifications. They probabilistically follow them.

Therefore, prompts are not sufficient.

---

# 7. AI Governance Framework

The repository should include a formal governance layer.

Recommended structure:

```text
docs/
├── AI_CONSTITUTION.md
├── AGENT_ROLES.md
├── AGENT_WORKFLOW.md
├── SCHEMA_POLICY.md
├── SOURCE_POLICY.md
├── EVIDENCE_POLICY.md
├── TERMINOLOGY_POLICY.md
├── ID_CONVENTIONS.md
├── RELATIONSHIP_MODEL.md
├── REVIEW_POLICY.md
└── MIGRATION_POLICY.md

schemas/
├── herb.schema.json
├── formula.schema.json
├── acupoint.schema.json
├── disease.schema.json
├── pattern.schema.json
├── medication.schema.json
├── evidence.schema.json
└── case.schema.json

data/
├── vocabulary/
├── relationships/
└── ...

examples/
├── gold-standard/
│   ├── herbs/
│   ├── formulas/
│   ├── acupoints/
│   ├── diseases/
│   └── evidence/
```

---

# 8. AI Constitution

`AI_CONSTITUTION.md` should be the highest-level policy.

All agents must be instructed to read it first.

Suggested principles:

1. Do not change schema without explicit approval.
2. Do not add unknown fields.
3. Do not rename fields.
4. Do not invent terminology.
5. Do not modify files outside assigned scope.
6. Do not rewrite architecture unless explicitly requested.
7. Do not make unsupported medical claims.
8. Do not remove source citations.
9. Do not downgrade safety information.
10. Do not merge incomplete or invalid data.
11. Do not modify golden examples.
12. Do not bypass validators.
13. Do not convert uncertainty into certainty.
14. Do not equate TCM and biomedical concepts one-to-one.
15. Do not perform broad UI redesign during content tasks.
16. Prefer small, reviewable PRs.
17. Explain every schema change.
18. Preserve backward compatibility unless a migration is approved.
19. Record unresolved uncertainty.
20. Fail safely when the rule is unclear.

---

# 9. Machine-Enforceable Rules

Prompt rules must be converted into code.

## 9.1 JSON Schema

Each entity type must have a JSON Schema.

Required validation:

- Required fields
- Field types
- Enum values
- Array versus string
- String length
- Unique IDs
- Unknown fields rejected
- Reference format
- Date format
- Relationship target format

Use:

```json
{
  "additionalProperties": false
}
```

This prevents agents from inventing fields such as:

- clinicalNotes
- clinicalPearls
- tips
- functions
- effects

unless those fields are explicitly approved.

## 9.2 Stable IDs

Example patterns:

```text
herb:huang-qi
formula:gui-pi-tang
acupoint:st-36
disease:migraine
pattern:liver-yang-rising
medication:sumatriptan
evidence:doi-10.xxxx
```

Display names can change. IDs must not.

## 9.3 Controlled Vocabulary

Create canonical term dictionaries for:

- TCM patterns
- TCM actions
- biomedical diseases
- symptoms
- evidence types
- relationship types
- safety categories
- herb interaction types
- medication classes

Example:

Accepted:

```text
Blood Deficiency
```

Rejected alternatives:

```text
Deficiency of Blood
Blood Vacuity
Insufficient Blood
```

unless the system explicitly stores synonyms separately.

## 9.4 Content Linter

The linter should detect:

- Unapproved headings
- Inconsistent terminology
- Duplicate synonyms
- Missing references
- Unsupported evidence language
- Ambiguous safety claims
- Empty arrays
- Placeholder text
- Invalid markdown
- Broken internal links
- Duplicate IDs
- Unknown relationship types
- Inconsistent Latin names
- Inconsistent point formatting
- Invalid dose or unit formats

## 9.5 Golden Examples

Each major entity type must have several gold-standard examples.

Agents should compare generated output against these examples.

Golden examples must demonstrate:

- Correct schema
- Correct terminology
- Correct level of detail
- Correct citation style
- Correct safety style
- Correct relationship structure
- Correct uncertainty language

## 9.6 CI Gate

Every PR should run:

```text
Schema validation
ID validation
Vocabulary validation
Relationship validation
Reference validation
Duplicate detection
Broken-link detection
Content lint
Unit tests
UI regression checks when needed
```

No validation pass means no merge.

---

# 10. Recommended Agent Roles

Three AI agents should not freely work on the same part of the repository.

## Claude Code

Primary role:

- Architecture
- Cross-file refactoring
- Schema migration
- Component-level changes
- Repository-wide analysis

Restrictions:

- No broad content generation unless assigned
- No schema changes without approval
- No UI redesign during data tasks

## Codex

Primary role:

- Focused implementation
- Validators
- Tests
- Stable ID migration
- Bug fixes
- Small PRs
- CI improvements
- Precise transformations

Restrictions:

- No unapproved field changes
- No content style invention
- No broad architecture rewrite

## Antigravity

Primary role:

- Batch content generation
- Missing-field completion
- Content normalization
- Initial draft generation
- Batch review queues

Restrictions:

- Must not change schema
- Must not alter UI
- Must not invent new categories
- Must stay inside assigned batch

---

# 11. Branch and Scope Discipline

Recommended branch model:

```text
claude/architecture-*
codex/validation-*
codex/fix-*
antigravity/content-*
```

Each task must declare:

```text
Allowed files
Forbidden files
Schema version
Expected output
Validation command
Maximum scope
Definition of done
```

Example task boundary:

```text
Allowed:
data/herbs/batch-13/*.json

Forbidden:
app.js
styles.css
schemas/*
docs/*
```

---

# 12. Agent Workflow

Recommended workflow:

```text
Specification
→ Read constitution
→ Read schema
→ Read vocabulary
→ Read golden examples
→ Generate or modify
→ Run validator
→ Run linter
→ Run tests
→ Produce diff summary
→ Human review
→ Merge
```

Prompts come last, not first.

The actual hierarchy should be:

```text
Constitution
→ Schema
→ Vocabulary
→ Golden examples
→ Validators
→ CI
→ Prompt
→ Agent output
```

---

# 13. Required Governance Files

## `AI_CONSTITUTION.md`

Highest-level non-negotiable rules.

## `AGENT_ROLES.md`

Defines what each AI agent is allowed to do.

## `AGENT_WORKFLOW.md`

Defines task sequence, branch policy, validation, and review.

## `SCHEMA_POLICY.md`

Defines schema ownership and schema-change process.

## `SOURCE_POLICY.md`

Defines acceptable sources and citation requirements.

Suggested source tiers:

### Tier 1

- Clinical guidelines
- Government agencies
- Major academic institutions
- Primary peer-reviewed sources

### Tier 2

- Systematic reviews
- Major textbooks
- Established professional organizations

### Tier 3

- Expert monographs
- Narrative reviews
- Academic teaching materials

### Restricted

- Unsourced blogs
- Social media posts
- Commercial wellness pages
- AI-generated claims without source verification

## `EVIDENCE_POLICY.md`

Defines:

- Evidence type
- Evidence grading
- Risk-of-bias notes
- Clinical relevance
- Mechanism-versus-effect distinction
- Uncertainty wording

## `TERMINOLOGY_POLICY.md`

Defines canonical terms and synonym handling.

## `ID_CONVENTIONS.md`

Defines stable ID formats.

## `RELATIONSHIP_MODEL.md`

Defines approved relationships.

Example:

```text
herb PART_OF formula
acupoint LOCATED_ON channel
pattern ASSOCIATED_WITH disease
intervention STUDIED_FOR condition
evidence SUPPORTS claim
medication INTERACTS_WITH herb
case USES intervention
case HAS_OUTCOME outcome
```

## `REVIEW_POLICY.md`

Defines what requires human review.

## `MIGRATION_POLICY.md`

Defines how schema changes are versioned and migrated.

---

# 14. Human Role

The user should not spend most of her time writing every card manually.

Her role should become:

- Product owner
- Medical editor
- Schema decision-maker
- Terminology reviewer
- Source-quality reviewer
- Final approver
- Clinical reasoning architect

The user decides:

1. What should be built
2. What the schema means
3. Which sources are acceptable
4. Which claims are clinically appropriate
5. Which relationships are valid
6. When a version is good enough
7. When to stop polishing and move forward

---

# 15. Near-Term Priorities

## Priority 1: Governance Before More Scale

Before generating hundreds of additional cards:

- Create AI constitution
- Create agent role definitions
- Freeze core schemas
- Add `additionalProperties: false`
- Create controlled vocabulary
- Add golden examples
- Add CI enforcement

## Priority 2: Level 1 v1.0 Exit Criteria

Define an explicit release boundary.

## Priority 3: One Full Vertical Slice

Build one complete disease chain as a prototype.

Recommended candidates:

- Migraine
- Insomnia
- Chronic low back pain
- Dysmenorrhea

Example:

```text
Migraine
→ Symptoms
→ Red flags
→ Diagnosis
→ Differential diagnosis
→ Medications
→ TCM patterns
→ Acupoints
→ Formulas
→ Herb-drug interactions
→ Evidence
→ Follow-up
```

## Priority 4: Prevent UI Churn

Until Level 1 v1.0:

- No broad redesign
- No new card system
- No typography overhaul
- No navigation rewrite unless blocking functionality

## Priority 5: Make Validation Visible

Provide a dashboard or report showing:

- Total entities
- Valid entities
- Invalid entities
- Missing references
- Broken links
- Duplicate IDs
- Unknown fields
- Vocabulary violations
- Last validation date

---

# 16. Suggested Repository Milestones

## Milestone A: Governance Foundation

Definition of done:

- AI constitution exists
- Agent roles exist
- Workflow exists
- Schemas exist
- Golden examples exist
- CI rejects invalid content

## Milestone B: Level 1 v1.0

Definition of done:

- Core herbs complete
- Core formulas complete
- Core acupoints complete
- Stable IDs
- Source policy applied
- Safety fields validated
- Relationships work
- Mobile search reliable

## Milestone C: Disease Vertical Slice

Definition of done:

- One disease connects all relevant entity types
- Red flags present
- TCM and biomedical layers remain distinct
- Evidence and safety are included
- Relationships are valid

## Milestone D: Level 2 Core

Definition of done:

- 10–20 common conditions
- Pattern logic
- Tongue and pulse
- Treatment principles
- Point strategies
- Formula modifications

## Milestone E: Biomedical Pilot

Definition of done:

- 3–5 disease cards
- 5–10 medication cards
- Pathophysiology
- Diagnosis
- Red flags
- Pharmacology

## Milestone F: Integrative Mapping Pilot

Definition of done:

- Many-to-many mapping works
- No false equivalence
- Mechanism bridge works
- Interaction prototype works

---

# 17. Key Risks

## Risk 1: Infinite Level 1

Mitigation:

- Freeze schema
- Use exit criteria
- Continue improving content after Level 2 begins

## Risk 2: Agent Drift

Mitigation:

- Machine-enforced schema
- Controlled vocabulary
- Golden examples
- CI rejection

## Risk 3: Merge Conflict Explosion

Mitigation:

- Separate agent scopes
- Small PRs
- No overlapping files
- Branch discipline

## Risk 4: Unsupported Medical Claims

Mitigation:

- Source policy
- Evidence policy
- Uncertainty labels
- Human review

## Risk 5: False TCM-Western Equivalence

Mitigation:

- Many-to-many relationships
- Conceptual mapping labels
- Separate native models

## Risk 6: UI Consumes the Roadmap

Mitigation:

- UI freeze
- Function-first milestones
- Limit design changes to blockers

## Risk 7: Content Quantity Outpaces Quality

Mitigation:

- Validation dashboards
- Review queue
- Gold-standard comparison
- Batch size limits

---

# 18. Final Product Direction

Acuting OS should not become:

> A beautiful collection of cards.

It should become:

> A clinically useful, evidence-aware, integrative medical reasoning engine.

The immediate revolution is not adding more content.

The immediate revolution is building a system where future AI agents cannot casually break the project.

The correct foundation is:

```text
Governance
→ Stable schema
→ Controlled terminology
→ Validation
→ Traceable evidence
→ Connected knowledge
→ Clinical reasoning
→ Living evidence
→ Case intelligence
```

---

# 19. Immediate Action Request for Codex and Claude Code

Before making further major content changes:

1. Audit the current repository structure.
2. Identify all existing schema drift.
3. List every field currently used in herbs, formulas, and acupoints.
4. Identify inconsistent field names.
5. Identify duplicate concepts.
6. Identify unknown or one-off fields.
7. Propose canonical schemas.
8. Propose stable ID conventions.
9. Propose controlled vocabularies.
10. Propose a validation pipeline.
11. Propose a CI gate.
12. Do not modify production files until the audit is reviewed.
13. Keep recommendations incremental.
14. Do not rewrite the application.
15. Prefer small, reversible changes.

---

# 20. Definition of Success

By the end of 2026, success means:

- Level 1 v1.0 is stable
- Core TCM data is usable
- AI governance is enforced
- Agents cannot freely invent fields
- Validation catches drift
- 10–20 common conditions have TCM reasoning structure
- A biomedical pilot exists
- A cross-system mapping prototype exists
- At least one complete disease vertical chain works

This establishes the foundation for:

- 2027: biomedical expansion and integrative mapping
- 2028: evidence system and living literature
- Graduation and beyond: real clinical intelligence
