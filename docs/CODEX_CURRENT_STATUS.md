# Codex Current Status

Purpose: single-screen status for Claude / Ting / Codex coordination. Read this
before scanning the longer `docs/CODEX_HANDOFF.md`.

Last updated: 2026-07-18
Agent: Codex, reconciled with Claude handoff
Status: `LL3_CLAIMED_IN_PROGRESS`
Current branch: `main`
Reviewed work commit: `0d0e5c4` - `LL3: fill PCOS pattern comparison draft`
Active claim: LL3 comparison fill on `main` (Codex, 2026-07-14)
Latest Codex work: `cmp.endometriosis_context_patterns` source-assisted draft fill,
pending in the latest Codex handoff commit.

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
factor context, IVF cycle context, insomnia, luteal support, and endometriosis
context as draft comparison tables. Queue status after the latest fill: 138
filled cells, 36 pending cells, 3 empty tables, 8 complete tables.
Keep each fill:

- source-assisted;
- `model_draft`;
- `review_status: "draft"`;
- `public_safe: false`;
- clearly cited;
- out of danger-zone clinical claims.

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
