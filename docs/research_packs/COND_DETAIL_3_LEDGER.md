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

### Commits

1. `34aecdf` — Part A: `field_sources` for the 11 score-11 records (#1–11).
2. `b4e3634` — Part B: full detail (etiology/western_pathology/risk_factors/
   acupuncture_scope/field_sources) for the 4 score-6 MSK records (#12–15),
   including one in-batch C12 fix (frozen_shoulder English co_management
   contained "discontinue" without a prescriber-routing keyword — reworded,
   zero clinical-meaning change).

### Maturity before → after (`node scripts/audit-cr010-condition-detail-maturity.js`)

| id | score before → after | maturity before → after |
|---|---|---|
| cond.ibs | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.anxiety | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.depression | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.asthma | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.chronic_gastritis | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.fibromyalgia | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.rheumatoid_arthritis | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.endometriosis | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.primary_dysmenorrhea | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.bells_palsy | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.trigeminal_neuralgia | 11 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.lumbar_disc_herniation | 6 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.sciatica | 6 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.cervical_spondylosis | 6 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.frozen_shoulder | 6 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |

Corpus-wide: `full_detail_count` 50 → 65 (+15, exactly this batch's picks),
`partial_count` 106 → 91 (−15), `live_condition_count` unchanged at 505,
`skeleton_count` unchanged at 349.

### Defect trajectory (`node scripts/validate-condition-standard.js`)

Blocking defects **294 → 294 (no change)**. This is expected, not a null
result: `field_sources` is not a C4/C5/C10-tracked field, and for the 4 MSK
records, the newly-written `etiology`/`western_pathology` replaced *empty
strings* (not C5/C10-triggering) with fresh bilingual unique text (also not
C5/C10-triggering) — so neither sub-batch could move the C4/C5/C10 counts.
Clean-record count **423 → 423** (unchanged for the same reason — the 4 MSK
records carry N1 notes, which are non-blocking and don't count toward
"clean"). One transient C12 defect (frozen_shoulder co_management wording)
appeared mid-batch and was fixed before commit (see Part B commit message).

`node scripts/check-validation-ratchet.js`: **PASS — conditions 294, no
regressions.**
`node scripts/validate-content-junk.js`: **PASS** (pre-existing unrelated
formula-dosage warning, untouched by this batch).
`node scripts/validate-relations.js`: **Relation validation passed**
(pre-existing unrelated warnings on `condition_crosswalk.json` and
`comparisons.json` — files this batch did not touch).

### Source split

- **11 score-11 records**: no new research — provenance reconstructed from
  each record's own already-embedded per-field `"source"` strings (in
  `risk_factors`/`red_flags`/`acupuncture_scope`) and `content_source` tags.
  4 of the 11 (`cond.anxiety`, `cond.depression`, `cond.endometriosis`,
  `cond.primary_dysmenorrhea`) had `sources` deepened with the actual
  resolvable NIMH/NICHD/MedlinePlus URL (previously only a bare CloudTCM
  link despite citing these bodies by name internally) — each URL verified
  live via WebFetch before use (see table above).
- **4 score-6 MSK records**: `western_pathology_*` and `risk_factors_*`
  freshly sourced from AAOS OrthoInfo (Herniated Disk in the Lower Back /
  Cervical Spondylosis / Frozen Shoulder) and MedlinePlus (Sciatica) — all
  fetched and verified live, not reused verbatim from any CloudTCM or prior
  research-pack text. `etiology_*` freshly authored TCM Bi-syndrome /
  liver-kidney-deficiency differentiation, distinct per condition (not
  shared boilerplate — each references different channel pathways: Bladder/
  Gallbladder for sciatica and lumbar disc herniation, Taiyang/Shaoyang +
  liver-yang-rising for cervical spondylosis, the three hand yang/yin
  channels + 肩凝症/漏肩風 naming for frozen shoulder).

### Evidence-grading correction (not a Batch-1 repeat)

Verified live via WebSearch/WebFetch that **UK NICE guideline NG59** ("Low
back pain and sciatica in over 16s", 2016, current) explicitly states **"Do
not offer acupuncture for managing low back pain with or without sciatica"**
— reversing an earlier 2009 (CG88) positive recommendation. This directly
contradicts the implication in Batch 1's `cond.chronic_low_back_pain`
acupuncture_scope (`evidence: "guideline"`, note citing "英國 NICE" as
listing acupuncture as an option). That record is untouched by this batch
(different id, out of scope) but has been flagged via `spawn_task` for
correction (task_185566bb).

For this batch's own records: `cond.lumbar_disc_herniation` and
`cond.sciatica` are graded `evidence: "unknown"` with the note stating NICE's
actual current negative recommendation — not `"guideline"`, per constitution
redline 9 (don't overclaim efficacy). `cond.cervical_spondylosis` is also
`"unknown"` — NICE NG193 (chronic primary pain) does include acupuncture, but
that guideline explicitly excludes pain with an identifiable structural
cause, so cervical spondylosis (a structural diagnosis) falls outside its
scope. `cond.frozen_shoulder` is graded `"guideline"`, but citing a real,
verified, dated source (Qin et al. 2023, *Journal of Evidence-Based
Medicine*, "Traditional Chinese medicine for frozen shoulder: An
evidence-based guideline") with its actual weak/consensus-level caveat
stated explicitly in the note — not upgraded to sound like high-certainty
evidence.

### Verbatim tails (spot-check against the live file)

- `cond.sciatica.acupuncture_scope_en.note`: "...UK NICE guideline NG59
  explicitly recommends against offering acupuncture as routine treatment
  for sciatica; this entry is a scope-of-practice caution, not a claim of
  guideline-endorsed efficacy — follow local guidance and shared
  decision-making with the patient"
- `cond.frozen_shoulder.western_pathology_en`: "...The course runs through
  three phases: freezing (progressive pain and declining motion, roughly 6
  weeks to 9 months), frozen (pain may ease but stiffness persists, roughly
  4–6 months), and thawing (motion gradually returns, roughly 6 months to 2
  years) — the full course can span 1 to 3 years."
- `cond.cervical_spondylosis.etiology_en`: "...In protracted cases, qi
  stagnation and blood stasis obstruct the collaterals, producing radiating
  numbness into the shoulder and arm."

### Judgment calls (documented, not silently applied)

1. **`cond.depression`** — `etiology_zh`/`western_pathology_zh` is verbatim
   CloudTCM blog-narrative content about 神經衰弱 (neurasthenia/autonomic
   dysregulation), not major depressive disorder specifically — confirmed by
   exact-string search: the identical text also appears on
   `cond.cancer_supportive` (a likely cross-record misfile, same family as
   Batch 1's `cond.pcos` finding). Out of scope for a field_sources-only task
   (would require the same untangle judgment as pcos); left untouched.
   `field_sources.etiology_zh/en` cites the CloudTCM source honestly with the
   mismatch flagged inline in the citation string itself, so the provenance
   record doesn't silently imply the content is depression-specific.
2. **CloudTCM blog embed-code markers ("[@ad:1]", "[@post:43]" etc.)** spotted
   in passing on `cond.asthma`/`cond.chronic_gastritis` (and 25 other
   records corpus-wide, confirmed by grep) — not caught by
   `validate-content-junk.js`. Out of scope for this batch (not a missing-
   field gap); flagged via `spawn_task` (task_b2c37707) for a dedicated
   cleanup pass per §3.5.5.
3. **Evidence-grade correction** — see "Evidence-grading correction" section
   above; flagged Batch 1's `cond.chronic_low_back_pain` overclaim via
   `spawn_task` (task_185566bb) rather than editing that out-of-worklist
   record directly.

### Eyeball read

`cond.sciatica`, `cond.frozen_shoulder`, and `cond.depression` read in full
post-patch (bilingual arrays index-aligned, no fake Chinese, no invisible
English, no template sentences shared across unrelated cards, import_artifacts
correctly preserved as quarantined junk with real content written to the live
fields instead).
