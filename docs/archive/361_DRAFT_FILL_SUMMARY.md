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

---

## Enrichment fill — 2026-07-09T02:50:00.622Z

- Batch files: lu_ht_enrichment.json
- Fields filled (empty-only): 35 across 20 records — {"needling":20,"location_en":5,"functions_en":5,"indications_en":5}
- Conflicts skipped (existing values untouched): 0
- Codes: LU1, LU2, LU3, LU4, LU5, LU6, LU7, LU8, LU9, LU10, LU11, HT1, HT2, HT3, HT4, HT5, HT6, HT7, HT8, HT9
- All fills are model drafts pending source review (CloudTCM D1-D3 cross-check + WHO SAPL).

---

## Enrichment fill — 2026-07-09T17:42:20.300Z

- Batch files: bl_enrichment.json, final_tail_enrichment.json, ki_enrichment.json, lu_ht_enrichment.json, si_enrichment.json, sp_enrichment.json
- Fields filled (empty-only): 255 across 150 records — {"needling":150,"location_en":35,"functions_en":35,"indications_en":35}
- Conflicts skipped (existing values untouched): 70
- Codes: BL1, BL2, BL3, BL4, BL5, BL6, BL7, BL8, BL9, BL10, BL11, BL12, BL13, BL14, BL15, BL16, BL17, BL18, BL19, BL20, BL21, BL22, BL23, BL24, BL25, BL26, BL27, BL28, BL29, BL30, BL31, BL32, BL33, BL34, BL35, BL36, BL37, BL38, BL39, BL40, BL41, BL42, BL43, BL44, BL45, BL46, BL47, BL48, BL49, BL50, BL51, BL52, BL53, BL54, BL55, BL56, BL57, BL58, BL59, BL60, CV4, CV6, CV12, CV17, GB20, GB21, GB30, GB34, GB39, GV14, GV20, GV26, LI4, LI11, LI20, LR3, LR14, PC6, ST25, ST36, ST40, ST44, TE5, KI1, KI2, KI3, KI4, KI5, KI6, KI7, KI8, KI9, KI10, KI11, KI12, KI13, KI14, KI15, KI16, KI17, KI18, KI19, KI20, KI21, KI22, KI23, KI24, KI25, KI26, KI27, SI1, SI2, SI3, SI4, SI5, SI6, SI7, SI8, SI9, SI10, SI11, SI12, SI13, SI14, SI15, SI16, SI17, SI18, SI19, SP1, SP2, SP3, SP4, SP5, SP6, SP7, SP8, SP9, SP10, SP11, SP12, SP13, SP14, SP15, SP16, SP17, SP18, SP19, SP20, SP21
- All fills are model drafts pending source review (CloudTCM D1-D3 cross-check + WHO SAPL).
## Enrichment fill — 2026-07-09T02:57:18.838Z

- Batch files: bl_enrichment.json
- Fields filled (empty-only): 87 across 60 records — {"needling":60,"location_en":9,"functions_en":9,"indications_en":9}
- Conflicts skipped (existing values untouched): 0
- Codes: BL1, BL2, BL3, BL4, BL5, BL6, BL7, BL8, BL9, BL10, BL11, BL12, BL13, BL14, BL15, BL16, BL17, BL18, BL19, BL20, BL21, BL22, BL23, BL24, BL25, BL26, BL27, BL28, BL29, BL30, BL31, BL32, BL33, BL34, BL35, BL36, BL37, BL38, BL39, BL40, BL41, BL42, BL43, BL44, BL45, BL46, BL47, BL48, BL49, BL50, BL51, BL52, BL53, BL54, BL55, BL56, BL57, BL58, BL59, BL60
- All fills are model drafts pending source review (CloudTCM D1-D3 cross-check + WHO SAPL).

---

## Enrichment fill — 2026-07-09T02:59:53.535Z

- Batch files: ki_enrichment.json
- Fields filled (empty-only): 27 across 27 records — {"needling":27}
- Conflicts skipped (existing values untouched): 0
- Codes: KI1, KI2, KI3, KI4, KI5, KI6, KI7, KI8, KI9, KI10, KI11, KI12, KI13, KI14, KI15, KI16, KI17, KI18, KI19, KI20, KI21, KI22, KI23, KI24, KI25, KI26, KI27
- All fills are model drafts pending source review (CloudTCM D1-D3 cross-check + WHO SAPL).

---

## Enrichment fill — 2026-07-09T03:01:12.201Z

- Batch files: sp_enrichment.json
- Fields filled (empty-only): 27 across 21 records — {"needling":21,"location_en":2,"functions_en":2,"indications_en":2}
- Conflicts skipped (existing values untouched): 0
- Codes: SP1, SP2, SP3, SP4, SP5, SP6, SP7, SP8, SP9, SP10, SP11, SP12, SP13, SP14, SP15, SP16, SP17, SP18, SP19, SP20, SP21
- All fills are model drafts pending source review (CloudTCM D1-D3 cross-check + WHO SAPL).

---

## Enrichment fill — 2026-07-09T03:02:19.825Z

- Batch files: si_enrichment.json
- Fields filled (empty-only): 22 across 19 records — {"needling":19,"location_en":1,"functions_en":1,"indications_en":1}
- Conflicts skipped (existing values untouched): 0
- Codes: SI1, SI2, SI3, SI4, SI5, SI6, SI7, SI8, SI9, SI10, SI11, SI12, SI13, SI14, SI15, SI16, SI17, SI18, SI19
- All fills are model drafts pending source review (CloudTCM D1-D3 cross-check + WHO SAPL).

---

## Enrichment fill — 2026-07-09T03:04:27.835Z

- Batch files: final_tail_enrichment.json
- Fields filled (empty-only): 127 across 43 records — {"needling":43,"location_en":28,"functions_en":28,"indications_en":28}
- Conflicts skipped (existing values untouched): 0
- Codes: CV4, CV6, CV12, CV17, GB20, GB21, GB30, GB34, GB39, GV14, GV20, GV26, HT1, HT2, HT3, HT4, HT5, HT6, HT7, HT8, HT9, LI4, LI11, LI20, LR3, LR14, LU1, LU2, LU3, LU4, LU5, LU6, LU7, LU8, LU9, LU10, LU11, PC6, ST25, ST36, ST40, ST44, TE5
- All fills are model drafts pending source review (CloudTCM D1-D3 cross-check + WHO SAPL).
