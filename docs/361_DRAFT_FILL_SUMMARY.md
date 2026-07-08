# 361 Draft Fill Summary

Generated: 2026-07-08T21:34:22.117Z

Source: data/imports/model_draft/*.json (model-knowledge drafts, Claude 2026-07-08)

## What happened

- 126 NEW records appended to data/acupoints/361.json (add-only).
- 0 existing records modified. 0 draft records skipped (already present or duplicate).
- Every new record: review_status "draft", source_status "model_draft_pending_source_review",
  sources auto-filled with acupoints.org + CloudTCM per-point URLs.
- data/audits/missing_report.json regenerated: 361/361 present, 0 missing.

## Added by channel

- CV: 20
- GV: 25
- GB: 39
- PC: 8
- LR: 12
- TE: 22

## Added codes

CV1, CV2, CV3, CV5, CV7, CV8, CV9, CV10, CV11, CV13, CV14, CV15, CV16, CV18, CV19, CV20, CV21, CV22, CV23, CV24, GV1, GV2, GV3, GV4, GV5, GV6, GV7, GV8, GV9, GV10, GV11, GV12, GV13, GV15, GV16, GV17, GV18, GV19, GV21, GV22, GV23, GV24, GV25, GV27, GV28, GB1, GB2, GB3, GB4, GB5, GB6, GB7, GB8, GB9, GB10, GB11, GB12, GB13, GB14, GB15, GB16, GB17, GB18, GB19, GB22, GB23, GB24, GB25, GB26, GB27, GB28, GB29, GB31, GB32, GB33, GB35, GB36, GB37, GB38, GB40, GB41, GB42, GB43, GB44, PC1, PC2, PC3, PC4, PC5, PC7, PC8, PC9, LR1, LR2, LR4, LR5, LR6, LR7, LR8, LR9, LR10, LR11, LR12, LR13, TE1, TE2, TE3, TE4, TE6, TE7, TE8, TE9, TE10, TE11, TE12, TE13, TE14, TE15, TE16, TE17, TE18, TE19, TE20, TE21, TE22, TE23

## Review path

These records are study drafts from model knowledge, NOT source-checked.
Verification order per docs/CODEX_TASK_QUEUE.md: CloudTCM import (D1-D3)
cross-checks the Chinese layer; WHO SAPL verifies locations; only then may
records be promoted past draft. High-risk points (CV22 天突, GV15 啞門,
GV16 風府, chest/back points) carry explicit danger notes and must be
independently verified before any clinical reference use.
