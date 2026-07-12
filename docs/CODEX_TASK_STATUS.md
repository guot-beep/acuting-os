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

## Remaining Candidate Tasks

| Task | Recommended handling |
| --- | --- |
| C2. Fill remaining 92 formula skeletons | Do only in small draft batches with conservative wording; avoid source_checked upgrades. Needs careful content policy and source plan. |
| C3. PC/TE/GB/LR/CV/GV standard-point content batches | Do not start while `361.json` is frozen unless Ting explicitly unfreezes that scope. |
| D4. Formula bulk fill | Start with probe/staging only; do not overwrite canonical formulas without preview/gate. |

## Current Safe Default

Until Ting/Claude issues a new explicit content task:

1. Prefer validation, documentation, and preview-only tooling.
2. Do not touch `data/acupoints/361.json`.
3. Do not touch `docs/CLOUDTCM_*`.
4. Do not start source-checked content upgrades without approved source material.
5. Keep every task ending with a clean working tree and an updated `docs/CODEX_HANDOFF.md`.
