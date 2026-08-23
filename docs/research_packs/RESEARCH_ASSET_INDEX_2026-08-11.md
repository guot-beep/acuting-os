# AcuTing OS — RESEARCH ASSET INDEX
## Latest-authority manifest for Fable / Claude / Sonnet / Codex

**Index date:** 2026-08-11  
**Purpose:** Stop repeated research caused by multiple historical versions.  
**Rule:** CURRENT repo schema / DECISIONS / validators always outrank research files.

## Status vocabulary

- `CURRENT_AUTHORITY` — latest known design/research authority for this topic.
- `CURRENT_SOURCE_PACK` — latest source/extraction pack, not canonical repo truth.
- `CURRENT_HANDOFF` — latest workflow/integration instructions.
- `INGESTED_OR_PARTLY_INGESTED` — useful provenance, but do not reread before checking repo.
- `HISTORICAL` — keep only for provenance/why-decisions.
- `SUPERSEDED` — ignore unless investigating history.
- `DO_NOT_INGEST` — explicitly invalidated by later repo inventory.

---

# 1. Western Condition architecture

## CURRENT_AUTHORITY
`WESTERN_CONDITION_BIG_CARD_CONTENT_SPEC_v2.md`

Use for:
- Preview Card vs Big Card split
- CANONICAL_NOW / DERIVED / BOARD_UI / TRUE_SCHEMA_GAP decisions
- content authoring expectations
- diagnosis/work-up and differential as genuine future schema candidates

It explicitly says current canonical schema wins and Big Card richness must not create uncontrolled fields.

## CURRENT_AUTHORITY
`Acuting_OS_Condition_Pattern_Source_Mapping_Spec_v2_2026-08-07.md`

Use for:
- cond.* / tdis.* / pattern.* / sym.* boundaries
- official source hierarchy
- graph direction / derived reverse links
- CloudTCM as provenance, not fifth diagnosis universe
- SNOMED / LOINC / ICD / FHIR conceptual mapping

## HISTORICAL / SECONDARY
`Condition Card Framework v1`

Keep for product/UI history only. If it conflicts with:
1. current repo `CONDITION_CARD_TEMPLATE`
2. current validators
3. Big Card Content Spec v2
4. Mapping Spec v2
then the newer/current contracts win.

## SUPERSEDED
`WESTERN_CONDITION_BIG_CARD_CONTENT_SPEC_v1*`
Any older Mapping Spec without `v2`.

---

# 2. Disease Knowledge / CLEAN_V2 line

## CURRENT_SOURCE_PACK / CURRENT_RESEARCH AUTHORITY
`CLEAN_V2` disease knowledge pack and its indexed MD files.

Important local assets Fable already confirmed:
- `00_DISEASE_KNOWLEDGE_CURRENT_STATE_AUDIT.md`
- `01_WESTERN_CONDITION_GAP_MASTERLIST.md` — 93 researched Western-condition candidates
- `02_TCM_DISEASE_GAP_MASTERLIST.md` — TDIS completeness + 75 EXISTING_ENRICH research
- `03_COND_TDIS_PATTERN_RELATION_GAP_AUDIT.md`
- `71_BOARD_COVERAGE_RESIDUAL_GAPS*`
- `90_INGESTION_QUEUE_AND_HANDOFF*`

### CR-011 decision
**CANCELLED.**
Do not research TDIS completeness again. `02_TCM_DISEASE_GAP_MASTERLIST` is the research authority. Ingest/reconcile it against current repo instead.

### CR-010 decision
Do **not** reuse the first CR-010 150-candidate masterlist.
New work begins from:
`current repo cond.* IDs (Fable reported 153)` + `01 masterlist 93` + `71 residual gaps`
→ produce only the true delta needed to reach Ting's >=300 useful/common condition target.

## DO_NOT_INGEST
`AcuTing_OS_CR010_CR011_CR012_Research_Pack_v1.zip`

Reason:
- CR-011 was redundant with existing CLEAN_V2 assets.
- CR-010 was too broad because it did not start from the local 153 + CLEAN_V2 93 + 71 residual-gap inventory.
- CR-012 repeated Pattern research already present in Batch04/07/08 and an existing Final Canonical Decision Pack.

Keep only for audit history if desired.

---

# 3. Pattern line

## CURRENT_AUTHORITY
`AcuTing_OS_Pattern_V2_Final_Canonical_Decision_Pack_2026-08-08.md`

This is already the human canonical gate across Batch02–10. It supersedes individual agent canonical recommendations when they conflict.

## CURRENT_RESEARCH EVIDENCE
- `Acuting_OS_TCM_Pattern_Expansion_Research_Pack_v0.4_Batch04_Gynecology_ChongRen_Jing_2026-08-08.md`
- `Acuting_OS_TCM_Pattern_Expansion_Research_Pack_v0.7_Batch07_Differentiation_Systems_2026-08-08.md`
- `Acuting_OS_TCM_Pattern_Expansion_Research_Pack_v0.8_Batch08_Extraordinary_Vessels_Channel_System_2026-08-08.md`
- Batch09 differential matrix and Batch10 relationship graph remain supporting evidence.

### CR-012 decision
No new research pack is needed.
Use `PATTERN_V2D_FINAL_CANONICAL_DECISION_SLICE_2026-08-11.md` in this handoff as the V2-D-relevant extraction of the already-authoritative Final Canonical Decision Pack.

The slice covers:
- Six Channels
- Wei-Qi-Ying-Xue
- San Jiao
- Gynecology / Chong-Ren / Uterus
- Extraordinary Vessels
- Jing-Luo/channel-state boundary

## HISTORICAL
Pattern V2 Batch02–10 individual recommendation labels are research evidence, not final canonical authority once a decision exists in the Final Canonical Decision Pack.

---

# 4. Pharmacology line

## CURRENT_SOURCE_PACK
`AcuTing_Pharm_Master_Extraction_v7.zip`

Known inventory from the ingestion audit:
- 24 markdown extraction files
- 82 unique `drug.*` candidates
- 1 `boardclass.*` candidate
- 20 high-value drug-drug interaction seed pairs
- 46 RxNorm normalization seeds

## CURRENT_HANDOFF
`PHARM_Antigravity_Moving_Pack_v2.md`

Use for moving/inventory/content-preservation rules.
It explicitly states the repo is architecture source of truth and v7 is source material, not automatic canonical data.

## CURRENT_INVENTORY / FREEZE REFERENCE
`19_PHARM_SOURCE_PACK_FREEZE_AND_INVENTORY.md`

## INGESTED_OR_PARTLY_INGESTED
Fable/Antigravity ingestion reports after v7 extraction should be checked before asking for any new drug research. Repo data outranks the source pack after additive ingestion.

## SUPERSEDED
- `AcuTing_Pharm_Master_Extraction_v5.zip`
- `PHARM_Antigravity_Moving_Pack_v1.md`

Do not use them for new ingestion unless investigating lost content.

---

# 5. Clinical V2 / SOL research packs preserved in this ZIP

## FOUNDATION, CURRENT BUT PARTLY CONSUMED
`saved_packs/AcuTing_OS_Tonight_ClinicalV2_Research_Staging_Pack.zip`

Contains:
- Clinical V2 capture examples
- sym/metric seed v0
- supplement source map batch 01
- supplement taxonomy gap review

Read only if the repo does not already contain the staged/ingested equivalent.

## CURRENT, SUPERSEDES PLAIN PACK 2
`saved_packs/AcuTing_OS_Tonight_Pack_2_ClinicalV2_PLUS_CR001_CR002_CR003.zip`

Contains:
- Patient Wiring Pack
- Clinical V2 fictional test scenarios
- selector/vocabulary pack
- Research Ingestion Contract draft
- CR-001 sym seed research 28
- CR-002 metric definitions
- CR-003 supplement skeleton batch 01

The plain `AcuTing_OS_Tonight_Pack_2_ClinicalV2.zip` is superseded by this PLUS version.

Fable reported Pack 2 was ingested and validated at commit `bae56b7`; therefore **repo staging is now the first place to check**.

## CURRENT / LIKELY INGESTED
`saved_packs/AcuTing_OS_Tonight_Pack_3_CR004_CR005_CR006.zip`

Contains:
- CR-004 metric alias/semantic dedupe
- CR-005 supplement interaction focus
- CR-006 TCM symptom extension

Check repo before rereading.

## CURRENT SOURCE PACK
`saved_packs/AcuTing_OS_CR007_CR009_Research_Pack.zip`

Contains:
- CR-007 Supplement Batch 02
- CR-008 Symptom Expansion Batch D
- CR-009 Clinical Relation Seeds

Still staging unless repo handoff says otherwise.

---

# 6. Clinical V2 architecture direction

`architecture/ACUTING_CLINICAL_DATA_CAPTURE_V2_DIRECTION_2026-08-10.md`

Use as product/research direction only when it does not conflict with current repo schema/DECISIONS.

Current locked backbone remains:
`Patient → Case → Visit`

Exposure history:
snapshot + append-only events

Clinical knowledge:
canonical IDs, no PHI in GitHub knowledge layer.

---

# 7. Version-resolution rule for all future orders

Before SOL/Fable/Codex/Sonnet starts research:

1. check `RESEARCH_ASSET_INDEX`
2. check CURRENT repo canonical/staging data
3. check CLEAN_V2 / source-pack inventory
4. search by exact candidate ID/name/alias
5. only then open a new research order

Every future order should state:
- repo asset inventory checked
- research asset inventory checked
- exact delta still missing
- target canonical/staging namespace
- whether work is RESEARCH / CANONICAL DECISION / INGEST / UI

This should prevent another CR-010/011/012 duplicate-research loop.
