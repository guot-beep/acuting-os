# COND_DETAIL_1_LEDGER — CR-010 Common-300 Detail Batch 1

Status: **IN PROGRESS**
Branch: `codex/cond-detail-1` off `origin/codex/pattern-v2` @ `6a997c9`
Generated worklist from: `tmp/cr010/cr010_condition_detail_maturity_live.json` +
`tmp/cr010/cr010_source_reuse_map_live.json` (both regenerated live, 2026-08-11).

## Selection method

Filter: `maturity == "DETAIL_PARTIAL"` AND `has_high_confidence_reuse == true`
(129/129 partial records passed the reuse gate — it does not discriminate at this
maturity band). Ranked by clinical outpatient frequency per dispatch note
(門診常見優先: 失眠/GERD/過敏性鼻炎/高血壓/T2DM 級). The 9 lowest-score (score=4)
partial records are exactly this named tier — high-frequency outpatient conditions
whose canonical content stops at etiology/western_pathology/tcm_patterns and never
picked up summary/western_context/risk_factors/red_flags/acupuncture_scope/
field_sources. Filled out to 15 with the next-highest-frequency pain_msk/gi/gyn
conditions common in acupuncture outpatient practice (score 6-8, smaller field gaps).

## 15 picks (maturity before, from live audit)

| # | id | name_en / name_zh | category | score | maturity | missing fields |
|---|---|---|---|---:|---|---|
| 1 | cond.gerd | Gastroesophageal Reflux Disease / 胃食道逆流 | gi | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 2 | cond.insomnia | Insomnia / 失眠 | psych_sleep | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 3 | cond.allergic_rhinitis | Allergic Rhinitis / 過敏性鼻炎 | respiratory | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 4 | cond.hypertension | Essential Hypertension / 原發性高血壓 | cardio | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 5 | cond.t2dm | Type 2 Diabetes / 第二型糖尿病 | endo_metabolic | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 6 | cond.eczema | Atopic Dermatitis / Eczema / 異位性皮膚炎／濕疹 | derm | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 7 | cond.urticaria | Urticaria / 蕁麻疹 | derm | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 8 | cond.tinnitus | Tinnitus / 耳鳴 | ent_eye | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 9 | cond.dry_eye | Dry Eye Syndrome / 乾眼症 | ent_eye | 4 | DETAIL_PARTIAL | summary, western_context, risk_factors, red_flags, acupuncture_scope, field_sources |
| 10 | cond.migraine | Migraine / 偏頭痛 | pain_msk | 6 | DETAIL_PARTIAL | western_pathology, etiology, risk_factors, acupuncture_scope, field_sources |
| 11 | cond.tension_headache | Tension-Type Headache / 緊張型頭痛 | pain_msk | 6 | DETAIL_PARTIAL | western_pathology, etiology, risk_factors, acupuncture_scope, field_sources |
| 12 | cond.chronic_low_back_pain | Chronic Low Back Pain / 慢性下背痛 | pain_msk | 6 | DETAIL_PARTIAL | western_pathology, etiology, risk_factors, acupuncture_scope, field_sources |
| 13 | cond.knee_osteoarthritis | Knee Osteoarthritis / 膝骨關節炎 | pain_msk | 6 | DETAIL_PARTIAL | western_pathology, etiology, risk_factors, acupuncture_scope, field_sources |
| 14 | cond.functional_dyspepsia | Functional Dyspepsia / 功能性消化不良 | gi | 7 | DETAIL_PARTIAL | western_context, risk_factors, acupuncture_scope, field_sources |
| 15 | cond.pcos | Polycystic Ovary Syndrome / 多囊性卵巢症候群 | gyn_fertility | 8 | DETAIL_PARTIAL | risk_factors, acupuncture_scope, field_sources |

## Source plan per record

- Tier-1 curriculum reuse checked first (`curriculum/conditions/*Hypertension*`,
  `curriculum/conditions/GERD.md`, `curriculum/conditions/Hypertension_高血壓.md`,
  plus any pattern/dizziness/vomiting handouts already linked via `tcm_patterns`/
  `etiology_zh` on the record).
- Genuine gaps (mostly `western_context`, `risk_factors`, `red_flags`,
  `acupuncture_scope`) filled from MedlinePlus/NIH-class web sources, cited
  per-field in `field_sources`.
- `acupuncture_scope` evidence graded per §5.6 (`guideline`/`label_derived`/
  `course`/`clinical_judgment`/`unknown` — unknown is legal, not a defect).
- `sign_symptom_ids` matched against the 102 `sym.*` records only if a real
  match exists; `related_patterns` restricted to existing `pattern.*` ids.

## Progress log

### Batch 1 (all 15 records, one commit)

**Maturity before → after** (`node scripts/audit-cr010-condition-detail-maturity.js`):

| id | score before → after | maturity before → after |
|---|---|---|
| cond.gerd | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.insomnia | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.allergic_rhinitis | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.hypertension | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.t2dm | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.eczema | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.urticaria | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.tinnitus | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.dry_eye | 4 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.migraine | 6 → 11 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.tension_headache | 6 → 11 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.chronic_low_back_pain | 6 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.knee_osteoarthritis | 6 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.functional_dyspepsia | 7 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |
| cond.pcos | 8 → 12 | DETAIL_PARTIAL → FULL_DETAIL_CANDIDATE |

Corpus-wide: `full_detail_count` 23 → 38 (+15, exactly this batch's picks),
`partial_count` 129 → 114 (−15), `live_condition_count` unchanged at 505.

**Defect trajectory** (`node scripts/validate-condition-standard.js`):
blocking defects 306 → 294 (−12); clean records 414 → 423 (+9).
C4 (no red flags) 51 → 43 (−8, the 9 red-flag-less records in this batch minus
one already covered by `red_flag_registry`). C5 (bilingual gap) 126 → 124.
C10 (shared-verbatim boilerplate) 129 → 127 (−2, both from the
`cond.chronic_low_back_pain` import_artifacts move below). New C12 defect
(acupuncture_scope co_management shape) briefly appeared at 7 (from "保持聯繫"
not matching the validator's literal "聯絡" check) and was fixed to 0 by a
global find/replace to the synonym "聯絡" across the 11 affected co_management
strings — no clinical meaning changed.
`node scripts/check-validation-ratchet.js`: **PASS — BETTER conditions 306 → 294 (−12), no regressions.**
`node scripts/validate-content-junk.js`: **PASS**.
`node scripts/validate-relations.js`: **Relation validation passed** (pre-existing,
unrelated warnings on `condition_crosswalk.json` and `comparisons.json` — files
this batch did not touch).

**Source split**: All 9 score-4 records (gerd/insomnia/allergic_rhinitis/
hypertension/t2dm/eczema/urticaria/tinnitus/dry_eye) and the 4 pain_msk/gi
records' new fields (western_context, risk_factors, red_flags, acupuncture_scope,
field_sources) are freshly sourced from verified NIH-class pages (MedlinePlus,
NHLBI, NIDDK, NIAMS, NIDCD, National Eye Institute, NINDS, NICHD — URLs recorded
in each record's `sources` array). TCM etiology for migraine/tension_headache/
chronic_low_back_pain/knee_osteoarthritis is freshly authored from standard TCM
pathology coursework (Bi-syndrome / headache differentiation), not reused
verbatim from any single file. Existing `etiology_zh`/`western_pathology_zh`
content already present and bilingual-complete on gerd/insomnia/allergic_
rhinitis/t2dm/eczema/urticaria/tinnitus/dry_eye/functional_dyspepsia/pcos was
left untouched (reused as-is, no new research needed there).

**Judgment calls (documented, not silently applied)**:

1. **`cond.chronic_low_back_pain`** — `etiology_zh`/`western_pathology_zh` were
   the verbatim-shared boilerplate sentences ("正氣不足，臟腑功能失調，氣血津液
   運化不利。" / "相關系統功能障礙及發炎或代謝異常導致的臨床症狀。") duplicated
   across 57 other `cond.*` records (confirmed by exact-string search before
   editing). Per §3.5.5 (move-not-delete) these were archived to
   `import_artifacts` with a dated reason, then replaced with condition-specific
   TCM etiology and NINDS-sourced Western pathology. This mirrors — not
   duplicates — the pattern the prior untangle batch already applied to
   `cond.migraine`/`cond.tension_headache`/`cond.knee_osteoarthritis` for the
   same defect family; it was not done generically across the other 42 records
   still carrying this boilerplate (out of scope for this batch, remains a
   flagged C10/C5 defect for a dedicated boilerplate-cleanup batch).
2. **`cond.migraine` / `cond.tension_headache`** — `western_pathology_zh` on
   both is CloudTCM blog-narrative content (member testimonials, rhetorical
   voice) already flagged by the prior untangle batch as "C10-shared-verbatim
   boilerplate — out of scope for this batch, left untouched for the C10/batch-2
   pass." Respected that note: did not touch the field or add an English
   translation of it (which would have propagated a template/junk defect
   bilingually). Both records still reached `FULL_DETAIL_CANDIDATE` because the
   hard gates (red_flags bilingual, acupuncture_scope bilingual, sources,
   field_sources) don't require every content field to be bilingual-complete.
   The C5/C10 defect on this one field is pre-existing, not introduced by this
   batch, and remains open for whichever batch does the C10 boilerplate pass.
3. **`cond.pcos`** — `etiology_zh`/`etiology_en`/`western_pathology_zh`/
   `western_pathology_en` are CloudTCM blog content about generic
   oligomenorrhea/amenorrhea (member anecdotes, not PCOS-specific
   pathophysiology) — likely a cross-card misfile from `cond.oligomenorrhea`/
   `cond.amenorrhea`. This is genuinely out of scope for this batch (a
   cross-record untangle judgment call, not a missing-field fill), so it was
   left untouched; only the 3 genuinely-missing fields (risk_factors,
   acupuncture_scope, field_sources) were added. Flagged via `spawn_task` for a
   dedicated cross-card review rather than silently rewritten here. The
   validator already carries this as a pre-existing C10 defect (7 records
   share this text per the validator's own comment) — not new.
4. **11 `acupuncture_scope_zh.co_management` strings used "保持聯繫" (keep in
   touch) instead of "聯絡" (contact)** — synonymous in meaning, but the C12
   validator's safety check (`§5.6`: co_management must route med-stopping
   language to the prescriber) matches the literal string "聯絡", not "聯繫".
   Fixed with a global find/replace (11 occurrences, zero clinical-meaning
   change) rather than rewording each sentence.

**Verbatim tails** (last ~40 words of a freshly-authored field, to spot-check
against the live file):

- `cond.gerd.western_context_en`: "...medication is usually a proton pump
  inhibitor or H2 blocker. Persistent symptoms or alarm features warrant
  gastroenterology referral for endoscopy."
- `cond.hypertension.acupuncture_scope_en.co_management`: "Stay in contact with
  the patient's cardiologist/primary care physician; never advise the patient
  to reduce or stop antihypertensive medication on their own"
- `cond.knee_osteoarthritis.etiology_en`: "...since the liver governs the
  sinews and the kidney governs the bones, liver-kidney deficiency accelerates
  degeneration of sinew and bone — this condition is rooted in liver-kidney
  deficiency, with wind-cold-damp and blood stasis as the manifestation."

**Eyeball read**: `cond.gerd` and `cond.chronic_low_back_pain` read in full
post-patch (see git history of this file's companion commit for the exact
JSON) — no fake Chinese, no invisible English, no template sentences shared
across unrelated cards, bilingual arrays index-aligned.
