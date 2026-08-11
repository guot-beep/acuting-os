# COND_DETAIL_3_LEDGER — CR-010 Common-300 Detail Batch 3

Status: **IN PROGRESS**
Branch: `codex/cond-detail-3` off `origin/codex/pattern-v2` @ `6ee761c`.
Generated worklist from: `tmp/cr010/cr010_condition_detail_maturity_live.json` +
`tmp/cr010/cr010_source_reuse_map_live.json` (both regenerated live, 2026-08-11,
post batch-1/batch-2 merge: `full_detail_count` 50, `partial_count` 106,
`skeleton_count` 349, `live_condition_count` 505).

## Selection method

Filter: `maturity == "DETAIL_PARTIAL"` AND `has_high_confidence_reuse == true`,
excluding `cond.pcos` (separate untangle-owned session) and anything already
`FULL_DETAIL_CANDIDATE`. All 106 current `DETAIL_PARTIAL` records pass the
reuse gate (same non-discriminating finding as Batch 1/Batch 2 at this
maturity band — the gate mostly matches ledger/config file mentions, not
genuine content assets). Ranked by outpatient clinical frequency
(門診常見優先), matching general-practice/acupuncture-outpatient prevalence:
GI (IBS, chronic gastritis), psych (anxiety, depression), respiratory
(asthma), pain_msk (fibromyalgia, RA, and the classic acupuncture MSK
presentations — lumbar disc herniation, sciatica, cervical spondylosis,
frozen shoulder), gyn (endometriosis, primary dysmenorrhea), and neuro
(Bell's palsy, trigeminal neuralgia — both textbook acupuncture indications).

11 of the 15 picks are score-11 records (only `field_sources` missing —
summary/western_context/western_pathology/etiology/risk_factors/red_flags/
acupuncture_scope are already bilingual-complete from prior batches; the task
here is honest per-field provenance reconstruction, not new authoring). 4
picks are score-6 records (`cond.lumbar_disc_herniation`, `cond.sciatica`,
`cond.cervical_spondylosis`, `cond.frozen_shoulder`) whose `western_pathology_zh`/
`etiology_zh` were already cleared to an honest empty string by a prior/concurrent
batch (CloudTCM blog-narrative junk moved to `import_artifacts`, `moved_at:
"2026-08-11"` — visible on all 4 before this batch touched them) — these need
genuine new bilingual content, not just field_sources.

## 15 picks (maturity before, from live audit)

| # | id | name_en / name_zh | category | score | maturity | missing fields |
|---|---|---|---|---:|---|---|
| 1 | cond.ibs | Irritable Bowel Syndrome / 腸躁症 | gi | 11 | DETAIL_PARTIAL | field_sources |
| 2 | cond.anxiety | Anxiety Disorder (GAD) / 焦慮症 | psych_sleep | 11 | DETAIL_PARTIAL | field_sources |
| 3 | cond.depression | Depression (MDD) / 憂鬱症 | psych_sleep | 11 | DETAIL_PARTIAL | field_sources |
| 4 | cond.asthma | Asthma / 氣喘／哮喘 | respiratory | 11 | DETAIL_PARTIAL | field_sources |
| 5 | cond.chronic_gastritis | Gastritis (incl. Chronic) / 胃炎（含慢性胃炎） | gi | 11 | DETAIL_PARTIAL | field_sources |
| 6 | cond.fibromyalgia | Fibromyalgia / 纖維肌痛症 | pain_msk | 11 | DETAIL_PARTIAL | field_sources |
| 7 | cond.rheumatoid_arthritis | Rheumatoid Arthritis / 類風濕性關節炎 | pain_msk | 11 | DETAIL_PARTIAL | field_sources |
| 8 | cond.endometriosis | Endometriosis / 子宮內膜異位症 | gyn_fertility | 11 | DETAIL_PARTIAL | field_sources |
| 9 | cond.primary_dysmenorrhea | Primary Dysmenorrhea / 原發性痛經 | gyn_fertility | 11 | DETAIL_PARTIAL | field_sources |
| 10 | cond.bells_palsy | Bell's Palsy / 顏面神經麻痺 | neuro | 11 | DETAIL_PARTIAL | field_sources |
| 11 | cond.trigeminal_neuralgia | Trigeminal Neuralgia / 三叉神經痛 | neuro | 11 | DETAIL_PARTIAL | field_sources |
| 12 | cond.lumbar_disc_herniation | Lumbar Disc Herniation / 腰椎椎間盤突出 | pain_msk | 6 | DETAIL_PARTIAL | western_pathology, etiology, risk_factors, acupuncture_scope, field_sources |
| 13 | cond.sciatica | Sciatica / 坐骨神經痛 | pain_msk | 6 | DETAIL_PARTIAL | western_pathology, etiology, risk_factors, acupuncture_scope, field_sources |
| 14 | cond.cervical_spondylosis | Cervical Spondylosis / 頸椎病 | pain_msk | 6 | DETAIL_PARTIAL | western_pathology, etiology, risk_factors, acupuncture_scope, field_sources |
| 15 | cond.frozen_shoulder | Frozen Shoulder / 五十肩／冷凍肩 | pain_msk | 6 | DETAIL_PARTIAL | western_pathology, etiology, risk_factors, acupuncture_scope, field_sources |

## Source plan per record

- **Score-11 group (#1–11)**: `field_sources` reconstructed from what is
  *already* on the record — the per-field `"source"` strings embedded inside
  `risk_factors_zh`/`red_flags_zh`/`acupuncture_scope_zh` entries, and the
  `content_source` tags. Three records (`cond.anxiety`, `cond.depression`,
  `cond.endometriosis`, `cond.primary_dysmenorrhea`) only carried a bare
  CloudTCM URL in `sources` despite citing NIMH/NICHD/MedlinePlus by name in
  their embedded per-field `source` strings — this batch **deepens** `sources`
  (adds the resolvable URL, does not remove the CloudTCM entry) so
  `field_sources` points to something a reader can actually open. URLs
  verified live via WebFetch before being added (NIMH Anxiety Disorders,
  NIMH Depression, NICHD Endometriosis, MedlinePlus Period Pain — see below).
- **Score-6 group (#12–15)**: genuine gaps. `western_pathology_*` sourced from
  NIH-class orthopedic/neurology references (AAOS OrthoInfo family, already
  cited in each record's `content_source`); `etiology_*` freshly authored TCM
  pathology (Bi-syndrome / lumbar-spine differentiation, following the same
  non-verbatim-reuse convention as Batch 1's `cond.chronic_low_back_pain`/
  `cond.knee_osteoarthritis`); `risk_factors` and `acupuncture_scope` per
  §5.5/§5.6 structure, evidence-graded.
- `sign_symptom_ids` matched against the 102 `sym.*` records only on genuine
  matches; `related_patterns` restricted to existing `pattern.*` ids (no new
  pattern records created this batch).

## Verified new source URLs (WebFetch-confirmed before use)

| Condition | URL added to `sources` | Confirmed title |
|---|---|---|
| cond.anxiety | https://www.nimh.nih.gov/health/topics/anxiety-disorders | "Anxiety Disorders" (NIMH) |
| cond.depression | https://www.nimh.nih.gov/health/topics/depression | "Depression" (NIMH) |
| cond.endometriosis | https://www.nichd.nih.gov/health/topics/endometriosis | "Endometriosis" (NICHD) |
| cond.primary_dysmenorrhea | https://medlineplus.gov/periodpain.html | "Period Pain \| Menstrual Cramps" (MedlinePlus) |

## Progress log

(to be filled after commit — maturity before→after, defect trajectory, source
split, verbatim tails, judgment calls)
