# Acuting OS TCM Pattern Preview Cards and Source Strategy v1

**Date:** 2026-08-02  
**Project:** Acuting OS  
**Audience:** Antigravity, Codex, Claude Code, and future AI agents  
**Purpose:** Define the first TCM Pattern Preview Card prototype, repository workflow, source hierarchy, content-ingestion rules, and copyright safeguards.

---

# 1. Immediate Objective

Create a new **TCM Pattern Preview Card** system that visually matches the existing Biomedical Condition preview cards in the Acuting OS Condition Library.

The Pattern Preview Card is a compact browsing card only.

It must later open a separate **Big TCM Pattern Detail Card**.

```text
Condition and Pattern Library
→ TCM Pattern Preview Card
→ Big TCM Pattern Detail Card
→ Relationships
→ Evidence
→ Personal Notes
```

Do not place the complete textbook-level pattern content inside the preview card.

---

# 2. Required Domain Separation

TCM Pattern is an independent entity type.

Do not merge it with:

- Biomedical Condition
- TCM Disease
- Symptom
- Sign
- Formula
- Herb
- Acupoint
- Treatment Principle

Examples:

```text
TCM Pattern
→ 肝陽上亢 · Liver Yang Rising
→ 心脾兩虛 · Heart and Spleen Deficiency
→ 痰濕 · Phlegm-Dampness
→ 血瘀 · Blood Stasis
```

Incorrect:

```text
Migraine = Liver Yang Rising
```

Correct:

```text
Biomedical Condition: Migraine
→ MAY_CORRESPOND_TO
→ TCM Pattern: Liver Yang Rising

TCM Disease: Headache
→ HAS_PATTERN
→ TCM Pattern: Liver Yang Rising
```

Mappings must remain many-to-many.

---

# 3. Required Reading Before Work

Before auditing or modifying the repository, read the following files when available:

1. `AI_CONSTITUTION.md`
2. `AGENT_ROLES.md`
3. `AGENT_WORKFLOW.md`
4. `SCHEMA_POLICY.md`
5. `TERMINOLOGY_POLICY.md`
6. `SOURCE_POLICY.md`
7. `EVIDENCE_POLICY.md`
8. `ID_CONVENTIONS.md`
9. `RELATIONSHIP_MODEL.md`
10. `Acuting_OS_Condition_Card_Framework_v1_2026-08-02.md`

If a required file does not exist:

- Report it clearly
- Do not invent its contents
- Do not silently substitute new rules

---

# 4. Phase 1: Repository Audit Only

Before writing code, inspect the repository and report:

1. Which component renders the current Biomedical Condition preview cards
2. Which CSS files control their appearance
3. Which data files contain condition preview-card content
4. Which fields currently exist
5. Which fields are inconsistent or one-off
6. Which components and styles can be reused
7. Whether a shared preview-card component already exists
8. Whether TCM Pattern data already exists elsewhere
9. Whether current IDs and tags use controlled vocabulary
10. The smallest safe implementation plan

Do not modify production code or production data during the audit phase.

Stop after the audit and wait for approval.

---

# 5. Visual Direction

The TCM Pattern cards should visually match the current Condition Preview Cards.

Required visual characteristics:

- Warm ivory background
- Thin beige border
- Large rounded corners
- Chinese title first
- English title beside or below it
- Small status pill in the upper-right corner
- Soft serif title typography
- Sans-serif body text
- Bilingual content
- Rounded information chips
- Consistent internal spacing
- Responsive two-column desktop layout
- Single-column mobile layout

Do not introduce:

- A new color system
- A new typography system
- A new navigation system
- A new unrelated card style
- Decorative medical illustrations at this stage
- Global UI redesign

---

# 6. Pattern Preview Card Content

Each Preview Card should contain only compact browsing information.

---

## 6.1 Header

Required:

- Chinese pattern name
- English pattern name
- Status pill

Example:

```text
肝陽上亢  Liver Yang Rising                       draft
```

Optional:

- Pinyin on hover, detail drawer, or metadata row
- Do not overload the main title line

---

## 6.2 Metadata Row

Do not use biomedical ICD codes for TCM Patterns.

Example:

```text
pattern.liver_yang_rising
zang_fu
interior
heat
mixed_deficiency_excess
```

Metadata must come from controlled vocabulary.

Suggested controlled dimensions:

```text
Pattern category
Zang-Fu involvement
Eight Principles
Qi, Blood, Fluid involvement
Pathogenic factor
Root / branch structure
```

Avoid displaying too many tags. The card should remain readable.

---

## 6.3 Short Summary

The summary should describe:

- Main pattern mechanism
- Core clinical tendency
- Root and branch when relevant

Recommended length:

- Approximately 2–4 visible lines on desktop
- Approximately 3–6 lines on mobile
- Full text may expand or open in the Big Card

Do not copy a textbook paragraph verbatim.

The summary must be an original synthesis derived from cited sources.

---

## 6.4 Key Manifestation Chips

Display 3–5 high-yield manifestations.

Example:

```text
頭痛 · Headache
眩暈 · Dizziness
急躁易怒 · Irritability
面紅 · Facial Redness
腰膝痠軟 · Weak or Sore Low Back and Knees
```

Rules:

- Use stable symptom IDs when available
- Do not use uncontrolled duplicate labels
- Prefer discriminating manifestations over generic symptoms
- Keep chips concise

---

## 6.5 Tongue and Pulse Preview

Display concise, structured tongue and pulse information.

Example:

```text
舌 Tongue
紅，苔少或薄黃
Red, with scanty or thin yellow coating

脈 Pulse
弦有力，或弦數
Wiry and forceful, or wiry and rapid
```

Possible layouts:

- Two compact information blocks
- Two pills
- One structured row

Do not flatten tongue and pulse into an unstructured paragraph.

---

## 6.6 Expandable Preview Sections

Primary expandable section:

```text
▶ 辨證要點 / Differentiation
```

It should contain only preview-level distinctions.

Optional second section:

```text
▶ 相關病證 / Related Conditions
```

This section must use stable entity links rather than duplicated content.

Do not force a generic Red Flags section into every Pattern Preview Card.

Biomedical red flags belong primarily to:

- Biomedical Condition Cards
- TCM Disease Cards
- Big Pattern Cards when a clinically relevant safety mapping exists

---

# 7. Proposed Preview Data Fields

The agent must first compare this proposal with the current repository schema.

Suggested draft:

```yaml
id:
entity_type: tcm_pattern

name_zh:
name_en:
pinyin:
aliases:

status:
review_status:
schema_version:

pattern_category:
zang_fu_ids:

eight_principles:
  interior_exterior:
  heat_cold:
  excess_deficiency:
  yin_yang:

qi_blood_fluid_ids:
pathogenic_factor_ids:

short_summary_zh:
short_summary_en:

key_manifestation_ids:

tongue_preview:
pulse_preview:

related_tcm_disease_ids:
related_biomedical_condition_ids:

differentiation_preview_zh:
differentiation_preview_en:

tag_ids:
source_ids:

created_at:
updated_at:
last_reviewed_at:
```

Do not add fields without explaining:

1. Why the field is needed
2. Why an existing field cannot represent it
3. Whether it belongs in the Preview Card or Big Card
4. Whether it requires a schema migration

---

# 8. Relationship Rules

Pattern cards must link to other entities using stable IDs.

Examples:

```text
pattern:liver-yang-rising
→ ASSOCIATED_WITH
→ tcm-disease:headache

pattern:liver-yang-rising
→ MAY_CORRESPOND_TO
→ biomedical:migraine

pattern:liver-yang-rising
→ HAS_SYMPTOM
→ symptom:dizziness
```

Do not use uncontrolled arrays such as:

```json
{
  "westernConditions": ["migraine"]
}
```

Use approved relationship objects.

Example:

```json
{
  "id": "rel-pattern-liver-yang-rising-migraine",
  "source_id": "pattern:liver-yang-rising",
  "relationship_type": "MAY_CORRESPOND_TO",
  "target_id": "biomedical:migraine",
  "mapping_category": "clinical_overlap",
  "strength": "moderate",
  "confidence": "reviewed",
  "rationale": "Possible overlap when headache or dizziness occurs with upward-rising signs and an underlying deficiency pattern.",
  "source_ids": [
    "source:example-001"
  ],
  "review_status": "reviewed",
  "last_reviewed_at": "2026-08-02"
}
```

Agents must not invent new relationship types.

---

# 9. Prototype Scope

After the audit is approved, implement only four prototype cards:

1. 肝陽上亢 · Liver Yang Rising
2. 心脾兩虛 · Heart and Spleen Deficiency
3. 痰濕 · Phlegm-Dampness
4. 血瘀 · Blood Stasis

The prototypes must test:

- Shared visual language
- Long and short bilingual titles
- Metadata wrapping
- Manifestation chips
- Tongue and pulse display
- Expandable differentiation
- Related entity links
- Stable IDs
- Mobile responsiveness
- Source provenance
- Draft and review status

Do not generate a large pattern batch before the prototype is reviewed.

---

# 10. Source Hierarchy

Antigravity must not treat every website as equally authoritative.

Use a tiered source strategy.

---

## Tier 0: Acuting OS Internal Sources

Highest priority for matching the user’s actual curriculum and terminology:

- Current Bastyr lecture slides
- Current course notes
- Current instructor handouts
- Current official syllabus
- User-approved textbooks
- Existing Acuting OS golden examples
- User-approved terminology dictionary

Use these to preserve:

- School terminology
- Exam language
- Course-specific distinctions
- Current project conventions

These sources may still require external verification for safety or terminology.

---

## Tier 1: Terminology and Classification Standards

These sources should control canonical names, aliases, and classification structure.

### WHO International Standard Terminologies on Traditional Chinese Medicine

Official source:

```text
https://www.who.int/publications/i/item/9789240042322
```

Useful for:

- Standard English terminology
- Standard Chinese terminology
- Definitions
- International communication
- Synonyms and preferred terms

Important licensing note:

- WHO states that the 2022 terminology publication is available under a CC BY-NC-SA 3.0 IGO license.
- Non-commercial reuse and adaptation require attribution and compatible licensing.
- Commercial use requires separate permission.

Use as:

```text
Canonical terminology source
```

Do not treat it as the only source for detailed clinical pattern differentiation.

---

### China National Standard GB/T 16751.2-2021

Official information page:

```text
https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=C71A9DAD24CB1252F12439D1F045DA6A
```

Title:

```text
中医临床诊疗术语 第2部分：证候
Clinic terminology of traditional Chinese medical diagnosis and treatment
Part 2: Syndromes/patterns
```

Useful for:

- Official syndrome and pattern names
- Definitions
- Classification hierarchy
- Standard Chinese terminology
- Standard English translations

The current standard contains a large controlled vocabulary of syndrome and pattern terms.

Important:

- Do not assume the complete standard text is freely reusable.
- Confirm access and licensing before bulk extraction.
- Store the standard number and source metadata even when content is entered manually.

Use as:

```text
Primary Chinese canonical terminology source
```

---

### WHO ICD-11 Traditional Medicine Chapter

Official information:

```text
https://www.who.int/standards/classifications/frequently-asked-questions/traditional-medicine
```

Useful for:

- Traditional medicine classification concepts
- Optional dual coding
- Interoperability planning
- International terminology mapping

Important:

- The WHO states that the Traditional Medicine chapter does not endorse the scientific validity or treatment efficacy of a practice.
- Do not convert ICD classification presence into an evidence rating.
- Do not use ICD-11 TM coding as a substitute for the Acuting OS pattern ontology.

Use as:

```text
Interoperability and coding reference
```

---

## Tier 2: Academic and Structured TCM Databases

These sources are useful for ontology discovery, entity relationships, comparison, and research.

They are not automatically authoritative for every clinical statement.

---

### TCMSSD

Database name:

```text
Traditional Chinese Medical Syndrome Standardization Database
```

Known access point:

```text
http://tcmssd.ratcm.cn
```

Publication record:

```text
https://pubmed.ncbi.nlm.nih.gov/38471316/
```

Useful for:

- Pattern inventory
- Syndrome standardization research
- Disease-pattern-formula-herb relationships
- Knowledge-graph comparison
- Candidate entity and relationship discovery

Rules:

- Use as a research and cross-checking source
- Verify important content against standards and textbooks
- Review database terms before mapping them into Acuting OS
- Do not import the full database without checking access, license, and duplication risk

---

### ITCMDB

Known access points:

```text
https://itcmdb.com/
https://itcm.work/
```

Useful for:

- Structured syndrome entities
- Symptom relationships
- Herb and formula relationships
- Knowledge-graph design comparison
- Candidate aliases

Rules:

- Treat as a secondary structured database
- Verify provenance of each imported claim
- Do not accept AI-generated database summaries as source evidence
- Check whether data export or automated access is permitted

---

### TCMEval-SDT Dataset

Publication:

```text
https://www.nature.com/articles/s41597-025-04772-9
```

Useful for:

- Pattern reasoning examples
- Clinical information extraction
- Pathogenesis reasoning
- Syndrome reasoning
- Designing future differentiation tests
- Building evaluation cases for AI agents

The published dataset is described as expert-annotated and released under CC BY 4.0.

Use as:

```text
Reasoning and evaluation dataset
```

Do not use 300 cases as a universal clinical truth source.

---

## Tier 3: Educational Reference Websites

These websites may be useful for drafting summaries, discovering manifestations, and locating related formulas or conditions.

They must not be the sole authority.

---

### Me & Qi

Pattern example:

```text
https://www.meandqi.com/knowledge-base/patterns/liver-yang-rising
```

Strengths:

- Clear bilingual names
- Pinyin
- Pattern mechanism
- Key signs
- Tongue and pulse
- Related formulas
- Related conditions
- Useful user-interface reference

Use for:

- Candidate fields
- Readability patterns
- Cross-checking
- Discovering possible aliases and relationships

Cautions:

- Commercial educational website
- Content may contain interpretive simplification
- Do not copy its prose
- Do not scrape at scale without checking permission, robots.txt, and terms
- Verify clinical claims against standards, textbooks, and course materials

---

### Sacred Lotus

Pattern and diagnosis resources:

```text
https://www.sacredlotus.com/go/diagnosis-chinese-medicine
```

Strengths:

- Eight Principles
- Zang-Fu pattern differentiation
- Tongue and pulse teaching
- Symptom-pattern relationships
- Educational organization

Use for:

- Educational cross-checking
- Candidate differentiation fields
- Pattern comparison
- Tongue and pulse terminology

Cautions:

- Secondary educational source
- Some content is based on teachers, class notes, and textbooks
- Do not treat as a canonical terminology source
- Do not copy text directly

---

### American Dragon

Main site:

```text
https://www.americandragon.com/
```

Strengths:

- Conditions organized by patterns
- Formula and herb links
- Acupuncture and herbal treatment associations
- Large breadth of clinical reference material

Use for:

- Candidate condition-pattern relationships
- Formula and herb relationship discovery
- Cross-checking possible treatment associations

Cautions:

- Secondary practitioner reference
- Content organization may not match Acuting OS terminology
- Verify all safety, dose, and treatment claims independently
- Do not bulk-copy pages or formulas

---

### TCM Wiki

Main site:

```text
https://tcmwiki.com/
```

Strengths:

- Broad Chinese medicine overview
- Classical formulas
- General pattern and treatment terminology
- Searchable introductory reference

Use for:

- Candidate aliases
- Broad concept discovery
- Initial cross-checking

Cautions:

- Variable depth and age
- Not suitable as the sole source for definitions
- Must be verified against WHO, national standards, textbooks, or current course materials

---

# 11. Source Use Rules

Antigravity must follow these rules:

1. Do not scrape or copy an entire website into Acuting OS.
2. Do not reproduce copyrighted paragraphs.
3. Do not use one secondary website as the only source.
4. Do not treat an AI summary as a source.
5. Preserve the original source URL and retrieval date.
6. Store source type and authority tier.
7. Write original summaries.
8. Keep direct quotations rare and short.
9. Verify terminology against WHO or GB/T sources when available.
10. Verify manifestations and differentiation using at least two sources.
11. High-risk clinical content requires stronger sources and human review.
12. Do not import formula doses, toxicology, pregnancy advice, or emergency guidance from an unverified website.
13. Do not place unreviewed scraped content directly into production.
14. Respect robots.txt, access controls, licensing, and terms of use.
15. If automated extraction is not clearly permitted, use manual research and structured note-taking instead.

---

# 12. Recommended Source Combination Per Pattern

For each TCM Pattern prototype, use:

```text
1 terminology standard
+
1 current course or textbook source
+
1 independent educational cross-check
+
optional structured-database cross-check
```

Example:

```text
Liver Yang Rising

WHO terminology
+
Bastyr diagnosis material or approved textbook
+
Me & Qi or Sacred Lotus
+
TCMSSD or ITCMDB relationship comparison
```

A pattern should not be marked `reviewed` until the user or medical editor confirms it.

---

# 13. Provenance Metadata

Each pattern must store source provenance.

Suggested source record:

```yaml
source_id:
title:
organization:
author:
source_type:
authority_tier:
publication_year:
version:
url:
license:
accessed_at:
language:
pages_or_section:
used_for:
review_notes:
```

Example:

```yaml
source_id: source-who-tcm-terminology-2022
title: WHO International Standard Terminologies on Traditional Chinese Medicine
organization: World Health Organization
source_type: terminology_standard
authority_tier: 1
publication_year: 2022
url: https://www.who.int/publications/i/item/9789240042322
license: CC BY-NC-SA 3.0 IGO
language:
  - Chinese
  - English
used_for:
  - canonical_name
  - english_translation
  - definition
review_notes: Confirm downstream licensing before public redistribution.
```

---

# 14. Claim-Level Source Tracking

Do not attach one generic source list to the entire card when different claims come from different sources.

Recommended future model:

```yaml
claim_id:
target_entity_id:
section:
statement:
source_ids:
verification_status:
reviewed_by:
reviewed_at:
```

Example:

```yaml
claim_id: claim-liver-yang-rising-pulse-001
target_entity_id: pattern:liver-yang-rising
section: pulse
statement: Wiry and forceful pulse may appear when the rising Yang manifestation is pronounced.
source_ids:
  - source-course-diagnosis-week-05
  - source-approved-textbook-001
verification_status: reviewed
```

---

# 15. Content Extraction Workflow

```text
Select pattern
→ Collect source metadata
→ Extract candidate facts
→ Normalize terminology
→ Separate mechanism, manifestations, tongue, pulse, and differentiation
→ Compare sources
→ Record disagreements
→ Write original bilingual summary
→ Link symptoms by stable ID
→ Run schema validator
→ Run terminology linter
→ Place in review queue
→ Human review
→ Production
```

Antigravity must not skip the review queue.

---

# 16. Handling Source Conflicts

When sources disagree:

1. Do not silently choose one version.
2. Record the disagreement.
3. Prefer current official terminology for naming.
4. Prefer current approved course material for exam language.
5. Prefer established diagnostic textbooks for detailed differentiation.
6. Use educational websites only as secondary support.
7. Preserve legitimate variants when clinically meaningful.
8. Mark uncertain fields as `needs_review`.
9. Do not create a false consensus.

Example:

```yaml
pulse_preview:
  value: "Wiry; may be forceful or rapid depending on severity and heat."
  status: needs_review
  source_conflict: true
```

---

# 17. Forbidden Changes

Do not:

- Redesign the current Biomedical Condition cards
- Change unrelated Herb, Formula, or Acupoint cards
- Change the global color palette
- Change global typography
- Rename existing fields without approval
- Add unknown schema fields
- Invent relationship types
- Generate dozens of Pattern Cards
- Embed full Big Card content in Preview Cards
- Mix personal notes with verified content
- Replace existing production data
- Rewrite the application architecture
- Bulk-scrape restricted or copyrighted sources
- Publish full textbook or website content
- Infer evidence strength from terminology standards
- Treat traditional medicine classification as proof of efficacy

---

# 18. Expected Audit Output

Return:

1. Repository audit
2. Current reusable components
3. Current field map
4. Proposed Pattern Preview Card field list
5. Proposed shared component structure
6. Proposed files to modify
7. Files that will not be touched
8. Mobile behavior
9. Source-ingestion plan
10. Licensing and access risks
11. Compatibility concerns
12. Small implementation plan

Stop and wait for approval before coding.

---

# 19. Approval Prompt for Phase 2

After the audit is approved, use:

```md
Approved.

Proceed with the prototype under these conditions:

1. Implement only the four approved TCM Pattern Preview Cards.
2. Reuse the existing Condition Preview Card visual system wherever practical.
3. Do not modify unrelated UI or production data.
4. Do not introduce unapproved fields or relationship types.
5. Keep Pattern data separate from Biomedical Condition and TCM Disease data.
6. Use source provenance for every prototype.
7. Do not copy source prose.
8. Run existing validation and tests.
9. Add focused tests for the Pattern Preview Card.
10. Provide:
    - files changed
    - schema decisions
    - source list
    - validation results
    - screenshots or rendered preview
    - known limitations
11. Do not expand beyond the approved prototype.
```

---

# 20. Definition of Success

The Pattern Preview Card prototype is successful when:

- It visually belongs to the existing Acuting OS card family
- It remains compact
- Chinese and English titles display correctly
- Pattern metadata uses controlled vocabulary
- Manifestations link to stable entities
- Tongue and pulse are structured
- Differentiation is easy to preview
- TCM and biomedical concepts remain separate
- Mappings remain many-to-many
- Sources are traceable
- Copyrighted prose is not copied
- The agent cannot invent uncontrolled fields
- The structure can later open into a Big Pattern Card
