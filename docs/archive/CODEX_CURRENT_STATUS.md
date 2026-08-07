# Codex Current Status

Purpose: single-screen status for Claude / Ting / Codex coordination. Read this
before scanning the longer `docs/CODEX_HANDOFF.md`.

Last updated: 2026-07-21
Agent: Codex, reconciled with Claude handoff
Status: `ACUPOINT_ANATOMY_SOURCE_BATCHES_READY_REVIEW`
Current branch: `main`
Reviewed work commit: `4c8879a` - `docs: Claude review — accept Codex dual-source herb visual references (5af7892)`
Active claim: LL3 comparison fill on `main` (Codex, 2026-07-14)
Latest Codex work: a source-backed, review-only high-risk anatomy lane. Six
peer-reviewed sources produce a 44-point ultrasound safety set, 15
point-specific anatomy findings, and 16 explicit point-to-peripheral-nerve
candidates. The combined preview covers 66 unique points. A strict fill-empty
preview proposes 34 fields / 38 values across 28 points, skips three non-empty
canonical safety fields, and reports 0 conflicts and 0 canonical writes. It
does not infer universal safe depth or treat regional study membership as a
point-specific anatomy claim. `data/acupoints/361.json` remains untouched.

Continuation batch: two open peer-reviewed human-study tables add 12 source
rows across 11 points. A strict preview proposes 8 empty fields / 12 values:
muscle candidates for LI4, PC6, SP6, SP9, ST25, ST29, and ST36, plus named
cutaneous/muscle nerves for ST36. LR3 is withheld because the two studies name
different muscle paths and segmental descriptions. The disagreement remains
explicit; 0 canonical writes.

Earlier Codex work: a source-backed, review-only WHO location extraction for
all 361 standard points. The source PDF is fingerprinted but not committed.
The staging retains page locators and extraction method; a separate no-apply
preview proposes 100 fill-empty `cun_measurement` values, leaves 131 unresolved,
and reports 0 conflicts and 0 canonical writes.

Earlier Codex work: a review-only H1 herb comparison preview. It mechanically
maps all 202 herbs into 34 groups using their existing exact bilingual
categories, proposes 1,430 directed `related_herbs` ID links, leaves
`substitution_context_zh` empty, and reports 0 conflicts and 0 canonical
writes. Apply mode is intentionally unsupported. Five groups larger than 10
herbs require Ting/Claude boundary review before any merge. No dosage,
substitution advice, efficacy language, or clinical prose was added.

Earlier Codex work: a separate five-formula CloudTCM Chinese-depth staging probe
for `fang_yi_zh`, `zhu_zhi_zh`, and `notes_zh`. It has 15 staged fields,
0 conflicts, and 0 canonical writes. American Dragon is recorded as manual-
browser review required because automated access returned a verification
challenge. Canonical formula data remains unchanged. The latest UI-only batch
adds CloudTCM and HKBU visual-reference searches to all single-herb detail
cards; exact reviewed per-record links take precedence when later added. A
separate no-apply lane now stages 20 exact pages for ten high-yield exterior
herbs across two five-herb probes, each with 0 conflicts and 0 canonical
writes. The second probe preserves CloudTCM's `Bao He` pinyin discrepancy as a
documented source typo instead of silently changing it to canonical `Bo He`.

## What Changed

Codex completed Ting-approved LL3 PCOS comparison draft fill:

- Filled `cmp.pcos_patterns`.
- Compared `pattern.phlegm_damp`, `pattern.liver_qi_stagnation`,
  `pattern.kidney_deficiency`, and `pattern.blood_stasis`.
- Filled 24/24 comparison cells.
- Added `data/knowledge/comparison_fill_pcos.json`.
- Added `scripts/apply-comparison-fill.js` so future comparison fills can use a
  reviewable fill-file pipeline.
- Rebuilt generated knowledge data and refreshed
  `docs/COMPARISON_FILL_QUEUE.md`.

## Source And Review Status

- Biomedical PCOS context: NIH/NICHD, WomensHealth.gov, MedlinePlus.
- TCM pattern discriminator content: Ting Notion/Bastyr notes.
- `review_status`: `draft`.
- `public_safe`: `false`.
- Not `source_checked`.
- Not medical advice.

## Claude Review Outcome

Claude has reviewed Codex's LL3 PCOS comparison draft fill and accepted it.
The work was merged to `main` by fast-forward with zero conflicts.

Claude review outcome, summarized from `docs/CODEX_HANDOFF.md`:

- status hygiene correct: `authored_by: "model_draft"`,
  `review_status: "draft"`, `public_safe: false`, not `source_checked`;
- no danger-zone content such as needling depth, dosage, point location, or ICD
  claims from memory;
- wording stays study-framed and not patient-directed;
- seven-validator sweep passed on merged `main`.

## Next Coordination Rule

LL3 remains Codex-owned unless Ting changes ownership.

Before starting a multi-step track, an agent should add a one-line claim marker
near the top of `docs/CODEX_HANDOFF.md`:

`CLAIMED: <track> on <branch> (<agent>, <date>)`

The other agent should check that marker before starting overlapping work.

## Next LL3 Action

Continue one comparison table at a time from `docs/COMPARISON_FILL_QUEUE.md`.
Codex has now filled PCOS, unexplained infertility, anovulation, ovulatory
factor context, IVF cycle context, insomnia, luteal support, endometriosis
context, and insulin-resistance context as draft comparison tables. Queue
status after the latest fill: 150 filled cells, 24 pending cells, 2 empty
tables, 9 complete tables.
Keep each fill:

- source-assisted;
- `model_draft`;
- `review_status: "draft"`;
- `public_safe: false`;
- clearly cited;
- out of danger-zone clinical claims.

The two remaining empty LL3 tables are recurrent-pregnancy-loss and embryo-
transfer contexts. Codex paused them because direct course-note evidence is
currently insufficient for these higher-risk pregnancy tables; do not fill by
inference.

## C2 Formula Queue

`docs/FORMULA_CONTENT_FILL_QUEUE.md` now records 23 populated formulas and 92
skeletons split into 30 / 30 / 32. It is planning-only. Future C2 content must
use staging, fill only empty classical fields, remain draft, and stop for a
preview gate before canonical apply. The 184 existing `???` string values are
frozen repair work and are not C2 gaps.

`scripts/preview-formula-content-fill.js` now implements that preview gate. It
has no apply mode. The first previews now cover Da Chai Hu Tang (8 fields / 21
items, direct Ting course note plus HKBU/MOHW) and Si Ni San (3 fields / 8
items, HKBU/MOHW institutional-only). Both report 0 conflicts and 0 canonical
writes. Si Ni San exam-track fields remain empty because no direct Ting course
page was found. Tong Xie Yao Fang adds 5 fields / 13 items: HKBU supports
formula facts, while Ting's FOM/diarrhea notes support only the exam comparison
context. Gan Mai Da Zao Tang adds 3 fields / 7 items, and Suan Zao Ren Tang
adds 5 fields / 15 items. No content has been merged into canonical formulas.

The five-formula probe is now complete and stopped at review gate: 24 staged
fields / 64 items / 0 conflicts / 0 canonical writes. See
`docs/formula_content_previews/C2_1_PROBE_SUMMARY.md`. Do not expand to the
remaining skeleton formulas until Ting/Claude accepts the evidence shape and
decides how field-level sources persist in canonical data.

The same five formulas now also have a separate B-layer Chinese-depth preview
under `data/imports/formula_chinese_depth/`. The no-apply preview allows only
the three existing `chinese_depth_track` fields and records exact CloudTCM
formula IDs plus source caveats. It deliberately excludes dose and modern-
disease claims. This remains an additional review gate, not a canonical merge.

## Protected Areas

Not touched by this work:

- clinical case data;
- `data/acupoints/361.json`;
- `docs/CLOUDTCM_*`;
- `data/sources/cloudtcm_point_map.json`.

## Historical Note

Older `docs/CODEX_HANDOFF.md` entries may contain phrases such as
`pending at time of entry`. Treat those as historical snapshots, not current
state. This file is the current-status source of truth.
