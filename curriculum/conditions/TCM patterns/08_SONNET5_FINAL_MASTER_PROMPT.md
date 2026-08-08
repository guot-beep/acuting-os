# SONNET 5 — FINAL MASTER PROMPT

You are the implementation owner for the **AcuTing OS TCM Pattern V1 Completion Project**.

I want this to be a one-time completion pass for the CURRENT canonical TCM Pattern library so I do not need to keep returning later to fill obvious missing Pattern-card content.

You are working inside my existing AcuTing OS repository.

## FIRST

Read the entire attached `Acuting_OS_TCM_Pattern_V1_Sonnet_Start_Pack_2026-08-08`.

Start with `README_START_HERE.md`.

Then inspect the CURRENT repository before editing, especially:

- `DECISIONS.md`
- `AI_CONSTITUTION.md` if present
- `docs/PATTERN_CARD_TEMPLATE.md`
- `data/pathology/pattern_registry.json`
- `data/pathology/pattern_library.json`
- `data/config/pattern_alias_map.json`
- `data/config/relation_registry.json`
- current formula registry / aliases
- current acupoint registry / aliases
- current TCM disease registry
- current biomedical condition registry
- Pattern validators
- relation validators
- build-data pipeline

The current repository is the source of truth for IDs and existing schema.

## CORE RULES

1. Existing canonical Pattern IDs are immutable.
2. The canonical namespace remains `pattern.<english_slug>`.
3. Do not create `pat.*` IDs.
4. Do not create Chinese-character canonical IDs.
5. Do not rename existing Pattern IDs for consistency.
6. Do not create duplicates because external sources use different English wording.
7. Do not mass-import every syndrome/pattern phrase from American Dragon, Sacred Lotus, Me & Qi, Shen-Nong, or any other site.
8. Complete the CURRENT canonical Pattern library first.
9. Unmatched external Pattern concepts go to staging/candidate review only.
10. Preserve accepted existing non-empty content unless there is a clear source-backed additive improvement.
11. Reverse relations must follow the current relation-registry policy.
12. Do not infer Western condition = TCM Pattern equivalence.
13. Do not use American Dragon as the biomedical red-flag authority.
14. Do not redesign the whole Condition workspace.

## SOURCE PRIORITY

Use the newer multi-source policy in `07_SOURCE_STACK_V2_MULTI_SOURCE.md`.

### Canonical terminology / classification
- current AcuTing decisions
- GB/T standards where available
- accepted course/textbook terminology

### Primary Pattern clinical backbone
- Sacred Lotus

Use especially for:
- signs
- tongue
- coating
- pulse
- etiology/pathology
- treatment principle
- acupuncture points
- differentiation structure

### Graph / differential / aliases
- Me & Qi

Use especially for:
- Chinese/English aliases
- Pinyin
- affected organs
- key signs
- causes
- precursor patterns
- progression
- differential discussion
- formulas
- points
- related concepts

### Theory / classification cross-check
- Shen-Nong

Use especially for:
- Eight Principles
- Zang-Fu framework
- Six Channels
- Four Levels / Wei-Qi-Ying-Xue framework
- differentiation logic

### Secondary treatment/context corroboration
- American Dragon

Use especially for:
- manifestations
- tongue / coating / pulse corroboration
- formula candidates
- point candidates
- source-associated clinical contexts
- exact AD URLs

### Board / course
- NCBAHM
- Bastyr / existing course material

## IMPORTANT

Do not mirror any external website.

Synthesize concise bilingual AcuTing content from multiple sources.

Preserve exact source URLs / provenance.

Do not copy long passages.

## DETERMINE CURRENT STATE FIRST

The UI recently displayed 59 Pattern cards, but historical data counts have differed.

Before editing:

1. count current `pattern_registry.json`
2. count current `pattern_library.json`
3. identify registry-only records
4. identify library-only records
5. identify staging/alias-only concepts
6. identify how many are currently `awaiting classification`
7. explain how the current UI reaches its rendered Pattern count

Do not assume 59 is the repo count until verified.

## PATTERN V1 REQUIRED CONTENT

For every CURRENT canonical Pattern, audit and complete where source-supported:

### Identity
- Chinese name
- English name
- Pinyin if supported
- useful aliases

### Classification
- one reviewed primary differentiation system
- family/organ tags
- Eight-Principle tags
- Qi/Blood/Fluid/Yin/Yang/Jing mechanism tags
- pathogenic-factor tags
- stage/system tags when relevant

Target: `Awaiting classification = 0`.

Primary-system starter set:

- `zang_fu`
- `qi_blood_body_fluid`
- `pathogenic_factor_mechanism`
- `six_channels`
- `wei_qi_ying_xue`
- `san_jiao`
- `channel_bi` where genuinely appropriate

### Etiology & Pathomechanism
- etiology
- pathomechanism
- disease location/nature if useful
- progression where supported

Do not infer mechanism from the name alone.

### Clinical Manifestations
- bilingual Key Signs
- bilingual Supporting Signs
- prioritize distinguishing manifestations, not symptom dumping

### Tongue
- color
- shape
- moisture
- special features where supported

### Coating
- color
- thickness
- texture
- moisture where supported

### Pulse
- accepted pulse qualities
- preserve legitimate context-dependent variants

### Differential & Exam Pearls
- nearest confusing canonical Patterns
- distinguishing signs
- tongue/pulse differences where useful
- mechanism differences
- board/course pearls only when sourced

Every differential target must resolve to an existing canonical Pattern ID.

### Treatment Principle
- accepted Chinese wording
- normalized English

### Formula Connections
- resolve to existing canonical formula IDs
- distinguish core/common/contextual when needed
- preserve source context
- unresolved aliases go to staging/report
- do not create duplicate formula records
- do not add doses

### Acupoint Connections
- resolve to existing point IDs/codes
- preserve source context
- unresolved aliases go to staging/report
- do not add needle depth/manipulation/moxa dose

### Related Knowledge
Use approved relation registry / derived reverse links.

Do not create duplicate hand-maintained reverse arrays.

### Sources & Provenance
Retain exact source URLs and field/block provenance where schema supports it.

### Review / Completeness
Use explicit completeness states rather than hallucinating missing evidence.

## CLASSIFICATION REQUIREMENT

The current UI has a large “Awaiting classification” group.

This task must eliminate it.

Combined-organ Patterns are still Zang-Fu with multiple organ-family tags.

Examples:

- Heart-Spleen Deficiency → Zang-Fu, heart + spleen
- Liver-Kidney Yin Deficiency → Zang-Fu, liver + kidney
- Blood Stasis → Qi/Blood/Body Fluid
- Tai Yang Shang Han → Six Channels
- Ying Stage Heat → Wei-Qi-Ying-Xue
- Middle Jiao Damp-Heat → San Jiao only if that exact Pattern is canonical
- Wind-Damp-Heat Bi → Channel/Bi or current approved system

Eight Principles are normally secondary orthogonal tags, not the only main folder.

## SCHEMA CHANGES

You are authorized to make the smallest additive, backward-compatible schema/template/validator changes necessary for Pattern V1.

Possible examples:
- controlled classification fields
- supporting signs
- separate coating from tongue
- differential structure
- provenance structure
- completeness/review state

Before any schema edit, document internally:
1. current field
2. missing capability
3. additive change
4. compatibility/migration behavior
5. validator update

Do not perform destructive migration.

## EXECUTION MODE

Do the entire current Pattern library in this workstream.

Internally work in small safe batches.

Do not ask me for permission after every normal batch.

After each batch:
- run Pattern validators
- run relation validators
- run relevant schema/content validators
- run build-data
- run encoding/content-junk checks
- run `git diff --check`
- confirm no canonical ID changed
- confirm no accepted content silently disappeared

Continue automatically when clean.

STOP only if:
1. genuine canonical identity collision
2. destructive migration would be required
3. two existing canonical Patterns appear semantically identical and resolving them would require changing a locked decision
4. source conflict would overwrite clinically meaningful accepted content
5. a locked repo decision makes the task impossible

Normal unresolved formula/point aliases are not a reason to stop. Stage and continue.

## WEB RESEARCH

For CURRENT canonical Patterns not adequately covered by the supplied MD files, you may research the exact Pattern using:

1. Sacred Lotus
2. Me & Qi
3. Shen-Nong when useful
4. American Dragon
5. accepted official/educational references

Do not use web research to indiscriminately expand the canonical Pattern count.

## UNMATCHED SOURCE CONCEPTS

Create/use staging-only candidates containing:
- source label
- normalized label
- URL
- source system
- possible existing match
- candidate classification
- mapping status
- review note

Do not count these as canonical Pattern V1 cards.

## FINAL GATE

Do not declare success merely because source files were processed.

Every CURRENT canonical Pattern must appear in a final completeness matrix:

Pattern ID | Primary system | Mechanism | Key/Supporting Signs | Tongue/Coat | Pulse | Differential | Treatment | Formula | Points | Sources | V1 status

Allowed V1 status:
- COMPLETE
- PARTIAL_SOURCE_GAP
- BLOCKED_AMBIGUITY
- NOT_APPLICABLE

Final targets:
- 100% canonical Patterns audited
- 0 Awaiting classification
- 0 unintended ID changes
- 0 broken canonical formula/point links
- 0 forbidden reverse-relation fields
- 0 silent content loss

## FINAL REPORT

Return:
1. canonical Pattern count before
2. canonical Pattern count after
3. rendered UI count
4. IDs changed, target = 0
5. registry/library discrepancies
6. classification before/after
7. count per primary system
8. Awaiting classification before/after, target = 0
9. cards enriched
10. COMPLETE count
11. PARTIAL_SOURCE_GAP count
12. BLOCKED_AMBIGUITY count
13. manifestations completed
14. tongue/coating completed
15. pulse completed
16. etiology/pathomechanism completed
17. differential sections completed
18. formula links added
19. unresolved formula candidates
20. point links added
21. unresolved point candidates
22. source/provenance additions
23. unmatched external staging candidates
24. validator/test results
25. exact files changed
26. whether TCM Pattern V1 is READY TO FREEZE

Start now.
