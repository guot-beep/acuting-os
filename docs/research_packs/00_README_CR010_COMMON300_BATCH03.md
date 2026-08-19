# AcuTing OS — CR-010 Common-300 Detail Batch 03

Generated: 2026-08-11
Source commit: `aa170b9`
Status: **RESEARCH STAGING / NOT CANONICAL / NO PHI**

This batch uses the actual live CR-010 audit:
- 77 full-detail
- 85 partial
- 343 skeleton
- 1106 source assets scanned

Selection is the first 15 `DETAIL_PARTIAL` records in live queue order.

## Files
- `docs/research_packs/CR010_CONDITION_DETAIL_BATCH03_SOL.md`
- `data/research_staging/cr010_condition_detail_batch03_SOL.json`
- `data/research_staging/cr010_source_reuse_map_batch03_SOL.json`
- `data/research_staging/cr010_live_order_snapshot_batch03_SOL.json`
- `data/research_staging/cr010_common300_batch03_manifest.json`

## Important
All 15 IDs are existing records. Use `EXISTING_ENRICH`, preserve richer existing content,
reuse prior assets first, and fill only approved missing fields. TCM sections remain
`needs_textbook_source_review`.

Special cautions preserved:
- `cond.ivf_support` is a care-context identity, not a disease. Do not claim acupuncture
  around embryo transfer improves live birth; ASRM finds no demonstrated live-birth benefit.
- `cond.luteal_phase_defect` remains a contested clinical construct; ASRM uncertainty must stay visible.
- pregnancy-related cards never substitute adjunctive TCM care for obstetric evaluation.
