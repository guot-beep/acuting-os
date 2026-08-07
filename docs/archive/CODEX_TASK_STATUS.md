# Codex Task Status

Updated: 2026-07-12

Purpose: fast status overlay for `docs/CODEX_TASK_QUEUE.md`. This file does not replace the queue; it records what has already been completed or blocked so Claude/Ting do not have to infer status from old task text.

## Completed

| Task | Status | Commit / Evidence |
| --- | --- | --- |
| A1. UTF-8 / mojibake guard | DONE | `c74b7ae`, `docs/ENCODING_VALIDATION_FINDINGS.md` |
| A2. DATA_MIGRATION_MAP sync | DONE | `e2e2833` |
| A3. Generate Tung + GB93 JS twins | DONE | `bfcd128`, `docs/A3_JS_TWINS_DIFF_SUMMARY.md` |
| A4. Move UI config constants out of app.js | DONE | `e26d4fa`, `data/config/ui_config.json` |
| B1. Formula reconciliation preview | DONE | `docs/FORMULA_MERGE_DIFF_SUMMARY.md` |
| B2. Apply formula merge + render in Lookup | DONE | `280c193`, 115 formulas rendered |
| B3. Herbs list in Lookup | DONE | `b3f1280`, 202 herbs rendered |
| D1. CloudTCM 361 raw fetch | DONE | `data/imports/cloudtcm/points/`, fetch manifest |
| D2. CloudTCM raw -> staging transform | DONE | `data/imports/cloudtcm/staging_points.json`, coverage report |
| D5. Fill remaining needling / EN fields | DONE | Earlier D5 commits; current `validate-data` reports 681 default points deep-equal and no duplicates |

## Gated / Frozen

| Task / Area | Status | Reason |
| --- | --- | --- |
| D3. CloudTCM merge into `361.json` | FROZEN / GATED | D3 review docs exist, but `data/acupoints/361.json` and `docs/CLOUDTCM_*` remain frozen pending Ting decisions. |
| Encoding backlog repair | FROZEN | `validate-encoding` still reports 798 known findings; B1 triage found `git-recoverable=0`. Repair requires source-aware content refill, not mechanical git restore. |
| C1. Source-check pilot | BLOCKED | Needs Bensky / approved school notes from Ting. |
| H1. Herb comparison groups | PREVIEW READY / GATED | `docs/HERB_COMPARISON_GROUP_DIFF_SUMMARY.md`; 202 herbs, 34 mechanical category groups, 1,430 directed links, 0 canonical writes. Ting/Claude must review five groups larger than 10 herbs before any merge. |
| Acupoint WHO location/cun source lane | PREVIEW READY / GATED | `docs/WHO_ACUPOINT_LOCATION_EXTRACTION_SUMMARY.md` and `docs/WHO_CUN_FILL_DIFF_SUMMARY.md`; WHO staging 361/361, 100 fill-empty B-cun proposals, 0 canonical writes. Five page-image transcriptions require second review. |
| Acupoint high-risk anatomy source lane | PREVIEW READY / GATED | `docs/ACUPOINT_HIGH_RISK_ANATOMY_SUMMARY.md` and `docs/ACUPOINT_ANATOMY_FILL_DIFF_SUMMARY.md`; 44-point ultrasound set, 66 unique review points, 34 fill-empty field proposals / 38 values for 28 points, 0 conflicts, 0 canonical writes. |
| Acupoint protocol-table anatomy lane | PREVIEW READY / GATED | `docs/ACUPOINT_PROTOCOL_ANATOMY_SUMMARY.md`; 12 source rows / 11 points, 8 fill-empty field proposals / 12 values, LR3 cross-source conflict withheld, 0 canonical writes. |

## Track E-I — Conditions interop (added 2026-07-12)

| Task | Status | Gate |
| --- | --- | --- |
| E-I0 pathology mojibake repair (18 strings) | DONE 2026-07-12 (Claude, under Ting's "always allowed" delegation) — encoding findings 798 → 768 | — |
| E-I1 大辭典 source-registry record | DONE 2026-07-12 — `mohw_nricm_disease_name_dictionary`, registry now 34 sources | — |
| E-I2 condition_crosswalk.json skeleton (150) | DONE 2026-07-12 — 150 records, icd10 seeded 150/150, placeholders present | Ting 5-record spot-check pending |
| E-I3 dictionary_refs fill batches | BLOCKED | needs Ting's copy of 《中西醫病名對照大辭典》. Online DB cnwm.nricm.edu.tw verified to EXIST but unreachable 2026-07-12 (port 80 timeout / 443 refused); official edition recorded in source registry. |
| E3 gyn_fertility content fill (summary/red_flags/western_context) | DONE 2026-07-13 (Claude) — 25/25 conditions, 150 fields, all draft; encoding count unchanged 768 | Ting per-batch review |
| E-I4 validate-relations crosswalk extension | DONE 2026-07-12 — 150 records checked, 0 errors, 0 warnings | — |
| E-I5 intake form build | BLOCKED | Phase 2 merge (app.js freeze) + design approval |
| E-I6 conditionGraph → canon 150 rewire | BLOCKED | E3 gyn batch rendered |

## Remaining Candidate Tasks

| Task | Recommended handling |
| --- | --- |
| C2. Fill remaining 92 formula skeletons | Do only in small draft batches with conservative wording; avoid source_checked upgrades. Needs careful content policy and source plan. |
| C3. PC/TE/GB/LR/CV/GV standard-point content batches | Do not start while `361.json` is frozen unless Ting explicitly unfreezes that scope. |
| D4. Formula bulk fill | Start with probe/staging only; do not overwrite canonical formulas without preview/gate. |

C2 planning update (2026-07-19): `scripts/report-formula-content-gaps.js` and
`docs/FORMULA_CONTENT_FILL_QUEUE.md` now define three deterministic classical-
content batches (30 / 30 / 32). No content has been filled. Each future batch
must use staging + conflict-refusing preview and must not touch the 184 frozen
question-mark-damaged values in the 23 populated pilot formulas.

C2 preview update (2026-07-19): `scripts/preview-formula-content-fill.js` now
enforces the staging gate and intentionally has no apply mode. A five-formula
probe manifest exists under `data/imports/formula_content/`. Da Chai Hu Tang is
the first source-backed staging preview (commit `bf3b0dc`): 8 fields, 21 items,
0 conflicts, and 0 canonical writes. Si Ni San now has an institutional-only
preview (commit `b02d043`): composition, actions, and indications only; 3
fields, 8 items, 0 conflicts, and 0 canonical writes. Its exam-track fields
remain empty because no direct Ting course page was found. Tong Xie Yao Fang,
now has a source-role-separated preview (commit `105991c`): 5 fields, 13 items,
0 conflicts, and 0 canonical writes. HKBU supports formula facts; Ting's FOM
and diarrhea notes support the exam comparison context. Gan Mai Da Zao Tang
now has an institutional-only preview (`7a7f740`), and Suan Zao Ren Tang has an
HKBU plus Ting-insomnia-context preview (`0f45870`). The five-formula probe is
complete: 24 fields, 64 items, 0 conflicts, 0 canonical writes. C2 is stopped
at the review gate documented in
`docs/formula_content_previews/C2_1_PROBE_SUMMARY.md`.

C2 Chinese-depth update (2026-07-19): a separate no-apply B-layer preview now
covers the same five formulas using exact CloudTCM formula pages. It stages
only `fang_yi_zh`, `zhu_zhi_zh`, and `notes_zh`: 15 fields, 0 conflicts, and
0 canonical writes. Source inconsistencies are recorded rather than absorbed.
American Dragon remains `manual_browser_review_required` because automated
access returned a verification challenge. Canonical apply remains gated.

## Current Safe Default

Until Ting/Claude issues a new explicit content task:

1. Prefer validation, documentation, and preview-only tooling.
2. Do not touch `data/acupoints/361.json`.
3. Do not touch `docs/CLOUDTCM_*`.
4. Do not start source-checked content upgrades without approved source material.
5. Keep every task ending with a clean working tree and an updated `docs/CODEX_HANDOFF.md`.
