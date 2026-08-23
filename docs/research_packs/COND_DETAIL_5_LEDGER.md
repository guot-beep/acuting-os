# CR-010 Condition Detail Batch 03 (SOL) — Ingestion Ledger (Detail Batch 5)

Branch: `codex/cond-detail-5-sol03` off `origin/codex/pattern-v2` @ `c524f90`
("Stage SOL CR-010 Batch 03").
Source pack: `docs/research_packs/CR010_CONDITION_DETAIL_BATCH03_SOL.md` +
`data/research_staging/cr010_condition_detail_batch03_SOL.json` (15 conditions).
Target file: `data/pathology/condition_canon_shortlist.json`.

Live audit re-run before ingestion (`node scripts/audit-cr010-condition-detail-maturity.js`):
baseline `full_detail_count: 77` (live, 505 records: 77 FULL_DETAIL_CANDIDATE / 85
DETAIL_PARTIAL / 343 SKELETON) — exact match to the pack's own stated live state
(77/85/343). All 15 staged conditions cross-checked against this live PARTIAL list.

## Exact-scan result (15 staged conditions vs 505 canon records)

**All 15 IDs resolved exactly on the first try** — unlike Batch 02 (6/15 name
mismatches), every id in the staging pack (`cond.achilles_tendinopathy`,
`cond.acute_lumbar_sprain`, `cond.amenorrhea`, `cond.breech_presentation`,
`cond.diminished_ovarian_reserve`, `cond.hip_osteoarthritis`,
`cond.hyperemesis_gravidarum`, `cond.ivf_support`, `cond.lateral_epicondylitis`,
`cond.luteal_phase_defect`, `cond.medial_epicondylitis`, `cond.meniscus_injury`,
`cond.menopause_syndrome`, `cond.menorrhagia`, `cond.neck_pain_stiff`) matched an
existing canon record by exact id. **Zero new `cond.*` records created.**

All 15 had identical pre-batch shape (score 5/12, matching the pack's own
"Exact live PARTIAL order" table exactly):
`summary_zh/en` ✓, `western_context_zh/en` ✓, `red_flags_zh/en` ✓ (2 pts, hard
gate met), `related_patterns` non-empty (relations pt met) = 5. Missing:
`etiology_en`, `western_pathology_en` (both had **only** `_zh`, and that `_zh`
was the 56-way-shared C10 boilerplate — see below), `risk_factors_*` (absent),
`acupuncture_scope_*` (absent, hard gate), `sources` (absent, hard gate; only a
generic `content_source: ["aaos_orthoinfo", ...]` array existed, not the
canonical `sources` field), `field_sources` (absent, hard gate).

## C10 boilerplate — all 15 carried it, all 15 authorized for replacement

Every one of the 15 records' `etiology_zh` was the exact string
`"正氣不足，臟腑功能失調，氣血津液運化不利。"` and every `western_pathology_zh`
was the exact string `"相關系統功能障礙及發炎或代謝異常導致的臨床症狀。"` — the
same 56-way-shared generic boilerplate documented in `COND_DETAIL_4_LEDGER.md`
for `carpal_tunnel`/`restless_legs`. Per that ledger's precedent
("C10 boilerplate replaced per validator's own authorization" for records that
are **this batch's own assigned targets**, distinct from `COND_C5_LEDGER.md`'s
"skipped, owned by the untangle pass" scope for incidental touches): all 15
`etiology_zh` + `western_pathology_zh` fields were **replaced** with the SOL
pack's real sourced content, with bilingual `_en` added for both. This is a
15/15 clean sweep of this defect class within the batch — the largest
single-batch C10 reduction of this series so far (see validation trail).

## Field mapping used (identical to Batch 01/02, template §3, §5.5, §5.6)

- `western_pathology_en/zh`, `etiology_en/zh` — written verbatim from the SOL
  pack's staged text (already bilingual in the staging JSON).
- `risk_factors_zh/en` — pack's plain bullet lists converted into the template
  §5.5 structured shape (`factor`/`direction`/`modifiable`/`source`) per bullet;
  `direction` is `increases` throughout (no protective factors in this batch's
  source material); `modifiable` set per clinical judgment (e.g. training-load
  factors `true`, age/family-history/prior-injury/structural factors `false`).
- `sources` — the pack's structured `{title, url, authority}` objects folded
  into the dataset's established `"Authority — Title: URL"` string-array
  convention (matches `cond.restless_legs`/`cond.carpal_tunnel` precedent).
- `field_sources` — per-field short citations, keyed with the `_zh`/`_en`
  suffix convention already used on `cond.restless_legs`
  (`etiology_zh`/`etiology_en`/`western_pathology_zh`/... not the pack's own
  unsuffixed `western_pathology`/`etiology` keys).
- **`acupuncture_scope_zh/en`** — genuinely absent on all 15 pre-batch (the
  pack's `preserve_existing_fields` list named it, but no such field existed to
  preserve — this was a missing-field build, not a preservation case). Built
  per template §5.6 (three sub-structures + `evidence` grade + `source` +
  `note`), graded `unknown` for 14/15 records (no acupuncture-specific efficacy
  guideline located in this session's live research — matches the dataset's
  established honest convention) — **except `cond.ivf_support`, graded
  `guideline`** (see judgment call below).
- **`risk_factors`/`acupuncture_scope` were NOT in the staging pack itself**
  (`acupuncture_scope` explicitly absent from the pack's field list; the pack's
  `risk_factors_*` fields, unlike Batch 01/02, **were** included this time as
  plain-string arrays and were restructured into the template's object shape).

## `summary`/`western_context`/`red_flags` — preserved untouched

Per the pack's own merge contract ("Preserve current summary, western_context,
red_flags, and acupuncture_scope by default") and matching Batch 02 precedent:
none of these three fields were modified on any of the 15 records. All three
were already non-boilerplate, condition-specific, real content from an earlier
authoring pass (verified by eyeball read — see below). `red_flags` in
particular remain plain string arrays (not the 5-field structured shape used
on newer cards like `cond.restless_legs`) — this batch did not restructure
them, since the pack's own rule says preserve, and restructuring is a
different, separate task (not named in this batch's fill_targets).

## sign_symptom_ids — genuine-match discipline (7 of 15 records)

Checked all 15 against the 102-symptom registry (`data/symptoms/symptoms.json`).
Genuine matches only, no force-fit:

| Condition | sign_symptom_ids added | Basis |
|---|---|---|
| `cond.acute_lumbar_sprain` | `sym.low_back_pain` | exact presenting complaint |
| `cond.amenorrhea` | `sym.amenorrhea` | exact id/name match |
| `cond.hyperemesis_gravidarum` | `sym.nausea`, `sym.vomiting` | both explicit in card text |
| `cond.meniscus_injury` | `sym.knee_pain` | exact presenting complaint |
| `cond.menopause_syndrome` | `sym.hot_flash`, `sym.night_sweats` | both explicit in card text |
| `cond.menorrhagia` | `sym.heavy_menstrual_bleeding` | exact id/name match |
| `cond.neck_pain_stiff` | `sym.neck_pain` | exact presenting complaint |

**8 of 15 left honestly empty — no genuine match exists in the 102-symptom
registry**: `cond.achilles_tendinopathy`, `cond.breech_presentation`,
`cond.diminished_ovarian_reserve`, `cond.hip_osteoarthritis`,
`cond.ivf_support`, `cond.lateral_epicondylitis`, `cond.luteal_phase_defect`,
`cond.medial_epicondylitis`. This is a real registry gap, not an oversight:
the 102-symptom set has no ankle/heel-tendon pain, hip pain, or elbow-pain
entries at all (confirmed by full enumeration of the registry), and DOR/IVF
support/LPD/breech are lab-defined or context identities without a single
defining presenting symptom. Flagged here, not silently dropped, matching
Batch 02's `cond.trigeminal_neuralgia` precedent (no `sym.facial_pain` exists,
left empty rather than force-fitting `sym.numbness`).

## `structured_relation_seeds` — disposition (NOT written to canon)

The staging pack carries a `structured_relation_seeds` array per condition
(`differential_candidate` / `commonly_seen_with` / `workflow_context`, all
`needs_id_resolution: true` — i.e. free-text targets like "Achilles rupture",
"PCOS", "cervical radiculopathy", not ids). **None of these were written to
canon.** The approved relation-field list (template §3.3) has no field for
cond-to-cond differential/context relations — only `related_patterns`
(pattern.\*), `related_eastern_diseases` (tdis.\*), and `sign_symptom_ids`
(sym.\*) resolve to real canon ids. Inventing a field for these text seeds
would be a C8 violation (§10 DON'T #5: "不要發明欄位"). The `structured_relations`
fill-target in the maturity-audit scoring is satisfied honestly by the
pre-existing non-empty `related_patterns` on every one of the 15 records (all
already resolve per `validate-relations.js`, unchanged this batch) plus the 7
records' new `sign_symptom_ids` — not by inventing a new relation field for
the free-text seeds. This mirrors Batch 02's disposition of `cond.epilepsy`'s
`tcm_pathogenesis`-derived relation seed (closed the maturity gap honestly via
`sign_symptom_ids`, not via a forced/invented link).

## tcm_pathogenesis — dispositions (NOT written to canon)

All 15 staging records carry `tcm_source_status: "needs_textbook_source_review"`.
Per task instruction and constitution redline 9, **none of the 15
`tcm_pathogenesis_zh/en` seed texts were written into `etiology_zh/en` or any
other canon field.** `related_patterns` was left completely untouched (already
populated from an earlier batch, unrelated to this session's SOL seed text) —
no canon-ready `pattern.*` linkage was asserted or modified from unreviewed
seed text.

| Condition | tcm_pathogenesis seed candidates (differential, not equivalence) | Disposition |
|---|---|---|
| Achilles tendinopathy | 經筋痹阻、氣血不暢、瘀血 | pending textbook review |
| Acute lumbar sprain | 氣滯血瘀、經筋損傷 | pending textbook review |
| Secondary amenorrhea | 腎虛、血虛、痰濕、血瘀、肝鬱 | pending textbook review |
| Breech presentation | (context —艾灸輔助限定討論，不可取代產科評估) | pending textbook review |
| Diminished ovarian reserve | 腎精不足、腎陰／腎陽、血虛、瘀血 | pending textbook review |
| Hip osteoarthritis | 痹證（重著／寒熱／虛弱／瘀象再辨） | pending textbook review |
| Hyperemesis gravidarum | 胃氣上逆、痰濕、肝胃不和、脾胃虛弱 | pending textbook review |
| IVF/ART adjunctive support | (context — 無固定證型，依個人資料辨證) | pending textbook review |
| Lateral epicondylitis | 經筋痹阻、氣滯、血瘀、痹證 | pending textbook review |
| Luteal phase deficiency | 腎、脾、肝、血虛、血瘀（依實際表現） | pending textbook review |
| Medial epicondylitis | 經筋痹阻、氣滯、血瘀、痹證 | pending textbook review |
| Meniscus injury | 氣血壅滯、血瘀（急性）／痹證、虛證（慢性） | pending textbook review |
| Menopausal syndrome | 腎陰／腎陽不足、心腎不交、肝鬱、痰、瘀 | pending textbook review |
| Heavy menstrual bleeding | 脾氣不攝、血熱、血瘀、腎虛 | pending textbook review |
| Acute neck pain / stiff neck | 風寒、氣滯血瘀、經筋痹阻 | pending textbook review |

## Judgment calls

**`cond.ivf_support` — `acupuncture_scope.evidence` graded `guideline`, not
`unknown`.** This is the one exception to this batch's (and the dataset's)
otherwise universal `unknown` convention. Rationale: the ASRM "Performing the
embryo transfer" guideline (2017) directly and specifically addresses
peri-transfer acupuncture and concludes there is no demonstrated live-birth
benefit — this is a real, specific, on-topic guideline statement about
acupuncture efficacy for this exact clinical context, not an absence of
evidence. Grading it `unknown` would understate what is actually known (a
negative guideline-level finding); the card's `can_treat`/`note` fields state
the ASRM conclusion as a **ceiling** on any efficacy claim, per the README's
explicit caution ("do not claim acupuncture around embryo transfer improves
live-birth rate") and constitution redline 9 (uncertain ≠ certain; do not
overclaim mechanism/effect).

**`cond.luteal_phase_defect` — ASRM uncertainty preserved, `evidence` left
`unknown`.** Per the README's second special caution ("remains a contested
clinical construct; ASRM uncertainty must stay visible"), the
`acupuncture_scope` explicitly states LPD lacks a reliable diagnostic test and
that isolated LPD is unproven as an independent cause of infertility/pregnancy
loss — framed so the card cannot be read as licensing acupuncture to "treat"
a diagnosis whose own validity is disputed. No acupuncture-specific evidence
was located this session, so `evidence: unknown` (distinct from `ivf_support`,
where a specific guideline *was* found).

**`cond.breech_presentation` moxibustion — `evidence` left `unknown` despite
being a well-known traditional practice.** BL67 (Zhiyin) moxibustion for
version is one of the more widely cited integrative-OB practices, but no
specific systematic-review citation was verified in *this session's* live
research. Per redline 9 ("不把不確定寫成確定") and the dataset's established
discipline (grade only what was actually verified this session, not what is
generally believed to be true), `evidence: unknown` was used, with a `note`
acknowledging it is a commonly taught practice whose evidence grade was not
checked this session — rather than silently upgrading to `course` or
`guideline` without a fresh citation.

**`risk_factors` direction/modifiable classification** was authored per
clinical judgment (not stated explicitly in the SOL pack, which gave plain
prose bullets). E.g. training-load/occupational-overuse factors → `modifiable:
true`; age, family history, prior injury, structural/developmental factors →
`modifiable: false`. All `direction: increases` (no protective factors
appeared in this batch's source material).

## Validation trail (single commit, 15 records)

```
node scripts/build-data.js
  PASS

node scripts/validate-condition-standard.js   (before batch)
  505 records · 425 clean
  C4  42 defects / 42 records
  C5  120 defects / 62 records
  C10 123 defects / 64 records
  FAIL — 285 blocking defects

node scripts/validate-condition-standard.js   (after batch)
  505 records · 440 clean   (+15, exactly the 15 targeted)
  C4  42 defects / 42 records   (flat — red_flags untouched, per merge contract)
  C5  90 defects / 47 records   (-30 = 15 records × 2 fields:
      etiology_en + western_pathology_en both newly paired)
  C10 93 defects / 49 records   (-30 = 15 records × 2 fields:
      etiology_zh + western_pathology_zh no longer match the
      56-way-shared boilerplate)
  FAIL — 225 blocking defects   (-60 net; largest single-batch drop in this
  series so far — every one of the 15 records carried both boilerplate
  fields, a 100% hit rate unlike Batch 02's partial overlap)

node scripts/check-validation-ratchet.js
  conditions 285 -> 225  BETTER  PASS — no regressions
node scripts/check-validation-ratchet.js --update
  baseline updated -> data/audits/validation_baseline.json

node scripts/validate-content-junk.js
  PASS — no scraped header tokens, no encoding anomalies in _zh fields
  (1 pre-existing formula-layer WARN — 32-record shared dosage clause,
  unrelated to this batch, tracked separately in AUDIT_DATA_FIXES_LEDGER.md)

node scripts/validate-relations.js
  Relation validation passed (sign_symptom_ids / sources / related_patterns
  all resolve; 1 pre-existing unrelated comparisons.json SKELETON note)

git diff --check data/pathology/condition_canon_shortlist.json
  clean (no whitespace errors)
```

## Batch totals (15 records, single commit)

- **0 new `cond.*` records created** — all 15 IDs resolved exactly on first
  scan (no name-mismatch resolution needed, unlike Batch 02's 6/15).
- **full_detail_count** (live audit,
  `node scripts/audit-cr010-condition-detail-maturity.js`): **77 → 92** (+15).
  All 15 targeted conditions now score FULL_DETAIL_CANDIDATE (12/12 or the max
  achievable with `related_patterns`-only relations).
  partial_count 85→70 (-15), skeleton_count 343→343 (flat). Arithmetic checks:
  85-15=70 ✓, 77+15=92 ✓.
- **Overall condition-layer blocking defects**: 285 → 225 (net **-60**) —
  the largest single-batch reduction in this series to date, because all 15
  targets carried both C10-boilerplate fields (100% hit rate) versus Batch
  02's partial (2 of 15) overlap.
- **sign_symptom_ids added**: 7 of 15 records (9 total ids added, including a
  2-symptom pair on `hyperemesis_gravidarum` and `menopause_syndrome` each);
  8 of 15 left honestly empty (registry gap: no ankle/hip/elbow-pain symptom
  entries exist in the 102-symptom set; DOR/IVF-support/LPD/breech are
  context/lab-defined identities without one defining presenting symptom).
- **`acupuncture_scope.evidence`**: `unknown` for 14/15; **`guideline` for
  `cond.ivf_support`** (ASRM directly addresses peri-transfer acupuncture and
  finds no demonstrated live-birth benefit — a real, on-topic guideline
  finding, framed strictly as a ceiling on any efficacy claim, not license to
  promote the intervention).
- **Sources used this batch**: AAOS (achilles_tendinopathy, acute_lumbar_sprain,
  hip_osteoarthritis, lateral_epicondylitis, medial_epicondylitis,
  meniscus_injury, neck_pain_stiff), NCCIH/NIH (acute_lumbar_sprain risk
  factors), ACOG (amenorrhea, breech_presentation, hyperemesis_gravidarum,
  menopause_syndrome, menorrhagia), ASRM (diminished_ovarian_reserve,
  ivf_support, luteal_phase_defect), PubMed/Acta Obstetricia et Gynecologica
  Scandinavica (hyperemesis_gravidarum risk factors) — all reused verbatim
  from the SOL pack's own live-research citations, no new independent
  research performed this session per the pack's `REUSE_REVIEW_BEFORE_NEW_RESEARCH`
  gate.
- **Missing staging asset check**: `data/research_staging/cr010_source_reuse_map_batch03_SOL.json`
  and `data/research_staging/cr010_live_order_snapshot_batch03_SOL.json`
  (both referenced in `00_README_CR010_COMMON300_BATCH03.md`'s file list) were
  not directly consulted — the staging condition-detail JSON alone contained
  every field needed for this batch's fill_targets, and the pack's own
  `source_reuse_live_map.has_high_confidence_reuse: true` flag per-record
  confirmed reuse was already vetted upstream.

## Next batch

`remaining_detail_slots_to_300` per the live audit after this batch: **223 →
208** (-15). This batch's 15 conditions are cleared from the CR-010 Common-300
detail queue. `full_detail_count` 77 → 92 (target: 300).
