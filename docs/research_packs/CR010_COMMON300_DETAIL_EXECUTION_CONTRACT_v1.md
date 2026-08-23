# CR-010 Common-300 Detail Execution Contract v1

Status: **ACTIVE CR-010 SUPPORT / RESEARCH TOOLING / NOT CANONICAL**

## 1. Goal

AcuTing OS has two Western-condition layers:

1. **Skeleton breadth**: no hard ceiling. Sonnet may continue reserving useful canonical identities.
2. **Common 300 full detail**: the high-value clinical/study layer. CR-010 exists to supply this layer.

Therefore CR-010 is no longer an identity-expansion exercise. It is a detail-maturity and source-reuse pipeline.

## 2. Live authority

Every run MUST use the current:

`data/pathology/condition_canon_shortlist.json`

Do not freeze a count such as 153 or 209 into the research logic. The audit reports whatever live count exists when it runs.

Authority order:
1. CURRENT repo `DECISIONS.md`
2. CURRENT condition schema/template/validators
3. CURRENT canonical/staging data
4. CLEAN_V2 and prior source packs
5. new SOL research

## 3. Detail maturity heuristic

This scoring system is a **production heuristic**, not a new schema.

Core score = 12 points:

| Requirement | Points |
|---|---:|
| bilingual summary | 1 |
| bilingual western_context | 1 |
| bilingual western_pathology | 1 |
| bilingual etiology | 1 |
| bilingual risk_factors | 1 |
| bilingual red_flags | 2 |
| bilingual acupuncture_scope | 2 |
| sources/provenance | 1 |
| field_sources | 1 |
| structured relations present | 1 |

### Classification

`FULL_DETAIL_CANDIDATE`
- score >= 10
- AND red flags bilingual
- AND acupuncture scope bilingual
- AND sources present
- AND field_sources present

`DETAIL_PARTIAL`
- score 4–9
- OR score >=10 but one of the hard gates above is missing

`SKELETON`
- score <=3

A validator may still reject a FULL_DETAIL_CANDIDATE. The validator wins.

## 4. Common-300 planning numbers

The audit reports:
- `live_condition_count`
- `full_detail_count`
- `partial_count`
- `skeleton_count`
- `minimum_future_identity_slots_if_all_current_selected = max(0, 300 - live_condition_count)`
- `remaining_detail_slots_to_300 = max(0, 300 - full_detail_count)`

Important:
`remaining_detail_slots_to_300` is NOT permission to enrich every current card. The Common-300 selection still needs clinical-commonness + board-value prioritization.

## 5. Source-reuse gate

Before opening new research for any `cond.*`:

1. exact current ID scan
2. exact/normalized English name scan
3. exact/normalized Chinese name scan
4. prior CLEAN_V2 / residual-gap / disease-knowledge asset scan
5. only then declare a true research gap

Exact `cond.*` matches are high confidence.
Name-only matches are medium confidence and require human/agent review.
No fuzzy semantic auto-merge.

## 6. Research batching after audit

Once the live queue is known:
- 10–15 conditions per detail-research batch
- prioritize `clinical commonness × board weight × safety importance × current detail gap`
- reuse existing CLEAN_V2 content first
- produce source-backed material aligned to CONDITION_CARD_TEMPLATE
- no uncontrolled new fields
- no PHI

## 7. CR-010 stop condition

CR-010 is complete when:
- Common-300 target list is explicit
- each of the 300 is either FULL_DETAIL_CANDIDATE / validator-passing full detail, or has an assigned research/production batch
- remaining gaps are explicit, not hidden in “skeleton exists”

Do not start CR-014 or CR-013 before CR-010 handoff is complete.
