# Codex Current Status

Purpose: single-screen status for Claude / Ting / Codex coordination. Read this
before scanning the longer `docs/CODEX_HANDOFF.md`.

Last updated: 2026-07-20
Agent: Codex, reconciled with Claude handoff
Status: `HERB_VISUAL_REFERENCES_READY_REVIEW`
Current branch: `main`
Reviewed work commit: `0d0e5c4` - `LL3: fill PCOS pattern comparison draft`
Active claim: LL3 comparison fill on `main` (Codex, 2026-07-14)
Latest Codex work: a separate five-formula CloudTCM Chinese-depth staging probe
for `fang_yi_zh`, `zhu_zhi_zh`, and `notes_zh`. It has 15 staged fields,
0 conflicts, and 0 canonical writes. American Dragon is recorded as manual-
browser review required because automated access returned a verification
challenge. Canonical formula data remains unchanged. The latest UI-only batch
adds CloudTCM and HKBU visual-reference searches to all single-herb detail
cards; exact reviewed per-record links take precedence when later added.

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
