# AcuTing OS — CR-010 Common-300 Detail Batch 01

Generated: 2026-08-11  
Repo target: `guot-beep/acuting-os`  
Branch checked: `codex/pattern-v2`  
Status: **RESEARCH STAGING / NOT CANONICAL / NO PHI**

## Contents

- `docs/research_packs/CR010_CONDITION_DETAIL_BATCH01_SOL.md`
- `data/research_staging/cr010_condition_detail_batch01_SOL.json`
- `data/research_staging/cr010_source_reuse_map_SOL.json`
- `data/research_staging/cr010_repo_preflight_SOL.json`
- `data/research_staging/cr010_common300_batch01_manifest.json`

## Batch scope

12 Common-300 candidate conditions:
1. Peptic ulcer disease
2. Cholelithiasis
3. Diverticular disease / diverticulitis
4. Celiac disease
5. Lactose intolerance
6. Acute pancreatitis
7. Cirrhosis
8. Hepatitis B
9. Chronic kidney disease
10. Nephrolithiasis
11. Gout
12. Osteoporosis

## Important ingestion rule

The suggested `cond.*` IDs are **not asserted as canonical**. Fable must exact-scan current
`condition_canon_shortlist.json` by id/name/aliases first. If the card exists, merge only into
approved empty fields. If it does not exist, do not create it merely because this pack suggests an ID.

The two Fable-generated live CR-010 reports were not available as usable content during this run,
so this is a **source-reuse-optimized prefetch fallback**, not a final maturity ranking.

TCM pathogenesis is intentionally marked `needs_textbook_source_review`; it is written as a
differential framework and never as Western-condition = TCM-pattern equivalence.
