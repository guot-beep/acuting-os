# 07 — Sonnet 5 Master Prompt: TCM Pattern V1 Complete

Paste everything below into the NEW Claude Code / Sonnet 5 session.

---

You are the implementation owner for the **AcuTing OS TCM Pattern V1 Completion Project**.

This is one bounded, end-to-end workstream.

## PRIMARY OBJECTIVE

Complete the CURRENT canonical TCM Pattern library into a stable V1 baseline so I do not need to repeatedly return later to fill basic Pattern-card holes.

This includes:

1. architecture audit
2. Pattern classification repair
3. card-schema completion where additive changes are truly needed
4. content enrichment
5. formula and acupoint canonical linking
6. source provenance
7. differential / exam value
8. final validation
9. Pattern V1 freeze recommendation

Do the entire current canonical Pattern library in this session/workstream.

Internally use safe batches and checkpoints, but **do not stop after every normal batch to ask me for permission**.

---

# READ FIRST

Read the repository before editing:

- `DECISIONS.md`
- `AI_CONSTITUTION.md` if present
- `docs/PATTERN_CARD_TEMPLATE.md`
- `data/pathology/pattern_registry.json`
- `data/pathology/pattern_library.json`
- `data/config/pattern_alias_map.json`
- `data/config/relation_registry.json`
- `data/config/tcm_pattern_canon.json` only as staging/history
- `scripts/validate-pattern-standard.js`
- every validator affecting Pattern records or their links
- formula registry / formula aliases
- acupoint registry / aliases / canonical code convention
- TCM disease registry
- biomedical condition registry
- source registry
- build-data pipeline

Then read ALL files in the supplied:

`Acuting_OS_TCM_Pattern_V1_Master_Pack_2026-08-08`

including all `ad_batches/`.

Also search/use the existing repository formula master cards, American Dragon formula-syndrome extractions, NCBAHM material, and accepted course/reference material where they directly support a Pattern field.

The CURRENT repository is the source of truth for IDs and schema.

---

# LOCKED ID LAW

The only canonical Pattern namespace is:

`pattern.<english_slug>`

Existing canonical IDs are immutable.

DO NOT:

- rename existing Pattern IDs
- create `pat.*`
- create Chinese-character canonical IDs
- promote `tcm_pattern_canon.json` into ID authority
- create a second Pattern because AD wording differs
- mass-promote every American Dragon syndrome heading
- delete an existing canonical Pattern

`pattern_registry.json` is the ID authority.

`pattern_library.json` is the content layer.

If a source concept does not safely match an existing canonical Pattern:

→ stage/report it  
→ do not silently create a production Pattern ID

---

# IMPORTANT: FIRST DETERMINE THE REAL CURRENT COUNT

The UI recently displayed 59 Pattern cards, but historical repo snapshots contained 61 registry IDs and 50 content records.

Do not assume any historical count is current.

At the beginning:

1. count current registry IDs
2. count current library records
3. identify registry-only records
4. identify library-only records
5. identify aliases/staging-only concepts
6. explain how the UI arrives at its current rendered count

Reconcile only according to existing decisions. Do not re-ID.

---

# PATTERN V1 CARD TARGET

For every CURRENT canonical Pattern, audit and complete, where reliably supported:

## Identity
- Chinese canonical name
- English canonical name
- Pinyin if current schema supports it
- useful Chinese/English aliases

## Classification
- one reviewed primary differentiation system
- organ/family tags
- Eight-Principle tags
- Qi/Blood/Fluid/Yin/Yang/Jing mechanism tags
- pathogenic-factor tags
- stage/system tags where applicable

## Etiology & Pathomechanism
- etiology
- pathomechanism
- location/nature where useful
- bilingual if the current template expects bilingual content
- source-backed only

## Clinical Manifestations
- bilingual Key Signs
- bilingual Supporting Signs
- prioritize differentiating signs, not symptom dumping

## Tongue
- body color
- shape
- moisture
- special features when supported

## Coating
- color
- thickness
- texture
- moisture when supported

## Pulse
- accepted pulse qualities
- preserve legitimate variants with source/context

## Differential & Exam Pearls
- closest confusing canonical Patterns
- clear distinguishing signs
- tongue/pulse distinctions when useful
- mechanism distinctions
- Board/course pearls only when sourced

## Treatment Principle
- canonical Chinese
- normalized English
- preserve valid existing Chinese wording

## Formula Connections
- resolve to existing canonical formula IDs
- separate core/common from source-contextual candidates
- preserve provenance
- no formula doses in Pattern card
- unresolved candidate → staging/report, no duplicate formula

## Acupoint Connections
- resolve to existing canonical point IDs/codes
- preserve provenance
- do not copy needle depth/manipulation/moxa dose into this task
- context-specific point sets are not universal prescriptions

## Sources / Provenance
- exact URLs
- source type
- field/block source references when current schema supports it
- preserve existing CloudTCM links
- preserve American Dragon source contexts

## Review / Completeness
- do not call a card clinically reviewed merely because AD was added
- explicitly mark true source gaps instead of inventing data

---

# CLASSIFICATION REPAIR IS A REQUIRED PART OF THIS PROJECT

The UI currently shows a large “Awaiting classification” group.

Target:

`Awaiting classification = 0`

Use a controlled multi-axis model.

Primary-system starter vocabulary:

- `zang_fu`
- `qi_blood_body_fluid`
- `pathogenic_factor_mechanism`
- `six_channels`
- `wei_qi_ying_xue`
- `san_jiao`
- `channel_bi` only where actually appropriate

If the current registry contains a legitimate differentiation system not representable by these, propose the smallest controlled extension. Do not invent categories casually.

Eight Principles are usually secondary orthogonal tags, not the sole primary folder:

- exterior / interior
- cold / heat
- deficiency / excess
- yin / yang where useful

Combined organ Patterns remain Zang-Fu with multiple family tags.

Examples:

- Heart-Spleen Deficiency → `zang_fu`, families `[heart, spleen]`
- Liver-Kidney Yin Deficiency → `zang_fu`, families `[liver, kidney]`
- Blood Stasis → `qi_blood_body_fluid`
- Tai Yang Shang Han → `six_channels`
- Ying Stage Heat → `wei_qi_ying_xue`
- Middle Jiao Damp-Heat → `san_jiao` if that exact Pattern is canonical
- Wind-Damp-Heat Bi → `channel_bi` or existing approved system, based on repo semantics

Do not classify solely from string matching if source semantics conflict.

---

# AMERICAN DRAGON POLICY

American Dragon does NOT have a clean unique Pattern index.

Its Conditions Index contains hundreds of condition-page targets and Pattern blocks are embedded inside those pages.

Therefore:

- use AD to enrich CURRENT canonical Patterns
- do not attempt to make AcuTing’s canonical registry equal every AD heading
- stage additional AD-only concepts separately

AD is strong for:

- manifestations
- tongue
- coating
- pulse
- treatment-principle corroboration
- formula candidates
- point candidates
- source-associated context

AD is NOT the sole authority for:

- canonical ID/name
- classification
- biomedical red flags
- emergency referral
- ICD
- Western diagnosis equivalence

When the same Pattern appears on several AD pages:

- derive a stable core from repeated consistent features
- keep page-specific extras/formulas/points as contextual source evidence
- do not flatten everything into a universal rule

Use exact AD URLs.

You may research American Dragon on the web for CURRENT canonical Patterns not sufficiently covered by the provided MDs.

Search exact canonical name + aliases and high-density AD condition pages.

---

# USE EXISTING FORMULA MASTER DATA

The repository/file set already contains substantial American Dragon + course formula material with:

- formula actions
- syndrome names
- manifestations
- tongue/pulse
- Board scope
- source URLs

Use this to:

- resolve Pattern → formula candidates
- corroborate terminology
- identify special systems
- improve differential/exam content when directly supported

Do not transform every formula-indication phrase into a new canonical Pattern.

---

# SPECIAL DIFFERENTIATION SYSTEMS

Do not accidentally force all current Patterns into Zang-Fu.

Audit for:

## Six Channels
Tai Yang / Yang Ming / Shao Yang / Tai Yin / Shao Yin / Jue Yin

## Wei-Qi-Ying-Xue
Wei / Qi / Ying / Xue stages

## San Jiao
Upper / Middle / Lower Jiao

## Channel / Bi
only where the Pattern itself is fundamentally a channel/Bi obstruction pattern

The supplied `05_AD_SPECIAL_DIFFERENTIATION_SYSTEMS.md` contains source-discovery anchors.

---

# RELATIONSHIP LAW

Read `relation_registry.json`.

Every graph edge is authored on ONE side according to the current policy; reverse links are derived.

Do NOT create manual reverse arrays merely for convenience.

In particular:

- AD page placement does not mean Western condition = Pattern
- do not introduce `pattern.related_conditions` if D13 retired it
- show related conditions/diseases through approved relation data / derived reverse index
- formula and point links must use the existing approved direction/shape

---

# SCHEMA CHANGES

You ARE authorized to make the smallest additive schema/template/validator changes required for Pattern V1, especially to support:

- controlled classification
- separate coating from tongue if currently conflated
- supporting signs if currently absent
- source/provenance structure
- differential content
- completeness/review state

BUT:

- do not redesign the whole Condition workspace
- do not change canonical IDs
- do not delete legacy fields before compatibility is proven
- do not introduce duplicate fields when equivalents exist
- maintain backward compatibility
- update validator/schema together with any new field
- prefer migration/adapter over destructive rewrite

Before the first schema edit, create a concise internal audit note explaining:

1. existing field
2. missing capability
3. proposed additive change
4. migration behavior
5. validator rule

You do not need to stop for my approval unless it would violate a locked repo decision.

---

# UI

Preserve the existing large Pattern modal visual direction.

Make only the smallest UI changes required to expose the completed data.

Desired logical order:

1. Etiology & Pathomechanism
2. Clinical Manifestations
   - Key Signs
   - Supporting Signs
   - Tongue
   - Coating
   - Pulse
3. Differential & Exam Pearls
   - Treatment Principle
   - Differential Patterns
   - Board/course pearls
4. Treatment Connections
   - Formula
   - Acupoints
5. Related Knowledge
   - TCM disease / biomedical context via approved graph/reverse links
6. Sources & Provenance

Classification UI must no longer show 43 records under “Awaiting classification”.

Do not do a cosmetic redesign beyond what this task needs.

---

# EXECUTION MODE

Do NOT ask me for approval after each normal batch.

Work internally in batches such as:

1. architecture + classification infrastructure
2. Heart / Shen
3. Spleen / Lung
4. Liver / Gallbladder
5. Kidney / Bladder
6. Stomach / Middle Jiao
7. Qi / Blood / Fluids / Phlegm / Damp
8. Six Channels
9. Wei-Qi-Ying-Xue
10. San Jiao / Channel-Bi / remaining current Patterns
11. final completeness sweep

After each batch:

- run Pattern validator
- run relation validator
- run relevant schema/content validators
- run build-data
- run encoding/content-junk checks
- run `git diff --check`
- verify no canonical ID disappeared/changed
- verify no existing accepted content was silently removed

If clean, continue automatically.

STOP only for:

1. genuine canonical identity collision
2. destructive migration requirement
3. two existing canonical Patterns appear to be the same concept and resolving them would require a locked-decision change
4. source conflict that would overwrite clinically meaningful existing content
5. a locked repo decision makes the task impossible

Unresolved optional formula/point aliases are NOT a reason to stop the whole project. Stage and continue.

---

# UNMATCHED AD CONCEPTS

Create or use a staging-only candidate list for AD concepts discovered during research that do not safely map to a current canonical Pattern.

Each candidate should keep:

- source label
- normalized label
- AD URL(s)
- candidate differentiation system
- related formula evidence
- mapping status
- possible existing match
- review note

Do NOT count these as Pattern V1 canonical cards.

---

# FINAL COMPLETENESS GATE

Do not declare success because the supplied MD files were processed.

Success means EVERY current canonical Pattern was audited.

Produce a final matrix:

Pattern ID | Classification | Mechanism | Key/Supporting Signs | Tongue/Coat | Pulse | Differential | Treatment | Formula | Points | Sources | V1 status

Allowed V1 status:

- COMPLETE
- PARTIAL_SOURCE_GAP
- BLOCKED_AMBIGUITY
- NOT_APPLICABLE

No Pattern may silently disappear.

Final target:

- 100% canonical Patterns audited
- 0 Awaiting classification
- 0 unintended ID changes
- 0 broken canonical formula/point links
- 0 forbidden reverse relation fields
- 0 silent content loss

---

# FINAL VALIDATION

Run all relevant repository checks, including:

- Pattern standard validator
- relation validator
- build-data
- schema validator if present
- content-junk
- encoding checks
- `git diff --check`
- repo test suite / ratchet as applicable

If the repo has pre-existing failures, prove this work did not regress them.

---

# FINAL REPORT TO ME

Return:

1. canonical Pattern count before
2. canonical Pattern count after
3. exact rendered Pattern count
4. Pattern IDs changed — target ZERO
5. registry-only / library-only discrepancies resolved or retained with reason
6. classification before/after
7. count per primary differentiation system
8. Awaiting classification before/after — target ZERO
9. cards enriched
10. cards COMPLETE
11. cards PARTIAL_SOURCE_GAP
12. cards BLOCKED_AMBIGUITY
13. manifestations completed
14. tongue/coating completed
15. pulse completed
16. pathomechanism completed
17. differentials completed
18. formula links added
19. unresolved formula candidates
20. point links added
21. unresolved point candidates
22. source URLs/provenance added
23. unmatched AD staging candidates
24. all validator/test results
25. exact files changed
26. whether TCM Pattern V1 can now be FROZEN

The goal is a stable Pattern V1 baseline. After this project, future work should mainly add new evidence and clinical-case-derived relations, not repeatedly patch missing basic card content.
