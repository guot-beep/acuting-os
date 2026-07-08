# Codex Task Queue

Written: 2026-07-08 (Claude Cowork). Owner: Ting decides when each task runs.
Purpose: Codex is running low on tokens. Each task below is written to be
self-contained — Codex should be able to execute it by reading ONLY this task
section plus the files it names, without re-reading the whole handoff history.

## How to use this file

- Ting picks ONE task and tells Codex the task ID (e.g. "do A1").
- Tasks are ordered by priority within each track. Track A first when tokens
  are tight; Track B needs medium budget; Track C only with a full budget.
- Every task keeps the standing AGENTS.md rules. For docs-only tasks, a
  compact handoff (files changed / what / validation / next) is acceptable
  instead of the full 15-point format, to save tokens.
- Tasks marked **[GATE]** must stop and wait for Ting's approval at the
  marked point before continuing.

## Standing protected areas (all tasks)

Do not modify unless the task explicitly says so:
`app.js` case/soap/cloudtcm/search/enrichPoint/selectPoint sections,
`js/router.js`, `js/knowledge.js` (except where a task names it),
`styles.css` point-detail-mode, `data/generated/*` by hand,
`data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS,
`legacy/`.

## Standard validation (run after every task unless stated otherwise)

```
node scripts/validate-data.js
node scripts/validate-interactions.js
node scripts/validate-relations.js
node scripts/validate-herbal-links.js
node scripts/validate-herb-canon.js
```

---

## Track A — Mechanical hygiene (small, low-risk, token-cheap)

### A1. UTF-8 / mojibake guard for batch edits

Why: Session 19 corrupted Chinese labels on 32 herb records via a Windows
console encoding issue. Same failure family as the earlier OneDrive damage.
We want this caught by a validator, not by manual review after the fact.

Do:
1. New file `scripts/validate-encoding.js`. For every `data/**/*.json`:
   - flag any string value that is only `?` characters (2+),
   - flag replacement chars `�`,
   - flag fields named `*_zh` / `nameZh` / `chinese` whose value contains no
     CJK characters but is non-empty and longer than 3 chars.
   Exit 1 on failures, print file + JSON path + offending value.
2. Add it to the validation list in this file and in `README.md`'s
   push-checklist section (one line each).
3. Do NOT auto-fix anything it finds — report only.

Files: `scripts/validate-encoding.js` (new), `README.md`, this file.
Done when: script passes on current data (or failures are listed for Ting),
standard validations pass.
Risk: low. Read-only checker.

### A2. Bring DATA_MIGRATION_MAP.md back in sync (docs only)

Why: the authority table was last updated 2026-07-02 and doesn't know about
`formula_canon_shortlist.json` (115), `herb_canon_shortlist.json` (202),
`formula_import_staging.json`, `data/imports/`, or `clinical_decision_links.json`.
That file is supposed to be the single answer to "which file is the truth?".

Do: add rows to the authority table for each file above with: source of truth,
consumed-by (all currently "NOT wired into app"), and status. Note that
`data/herbs/formulas.json` (23 records) is the ONLY formula file the app
renders today. Do not change any data file.

Files: `docs/DATA_MIGRATION_MAP.md` only.
Done when: every data file Codex created in Sessions 9–21 appears in the table.
Risk: none.

### A3. Generate Tung + GB93 .js twins from .json  **[GATE]**

Why: `data/tung/point_index.js`, `data/auricular/gb93_index.js`,
`gb93_worklist.js` are hand-maintained copies of their `.json` files —
double-edit risk. REBUILD_PLAN Phase 2 item 3, untouched since 07-02.

Do:
1. In `scripts/build-data.js`, add generation of those three `.js` files from
   their `.json` sources, using the same global-variable names the app expects
   today (inspect the current `.js` files for the exact `globalThis.X = ...`
   or `const X = ...` shape before writing).
2. Run build, diff generated output vs the old hand-kept files. Byte-level
   differences in formatting are fine; data differences are not.
3. **[GATE]** Show Ting the diff summary. Only after approval: delete nothing —
   instead move the hand-kept originals' content authority note into
   DATA_MIGRATION_MAP.md ("now generated"). The old files are simply
   overwritten by the build from now on.

Files: `scripts/build-data.js`, `data/generated/` outputs or the three `.js`
files (as generated targets), `docs/DATA_MIGRATION_MAP.md`.
Done when: editing the `.json` and running build updates the `.js`; app loads
with identical behavior; standard validations pass.
Risk: medium-low. App load order in `index.html` must not change.

### A4. Move remaining config constants out of app.js

Why: REBUILD_PLAN Phase 2 item 2, untouched since 07-02. Seven config blocks
still live at `app.js` lines ~17–425: `standardChannelAudit`,
`channelPrefixMeta`, `auricularZonePositions`, `directoryRegionGroups`,
`directoryTopics`, `earAnatomyLabelData`, `earPointAnchors`.

Do:
1. Create `data/config/ui_config.json` holding all seven blocks (one file is
   fine; they are small).
2. `scripts/build-data.js` emits them into `data/generated/app_data.js` (or a
   new small generated file loaded before app.js — keep it simple).
3. In app.js, replace the seven `const` definitions with reads from the
   generated global. Touch NOTHING else in app.js.
4. Verify: `node --check app.js`, open app, home dashboard counts render,
   directory filters work, ear labels render.

Files: `data/config/ui_config.json` (new), `scripts/build-data.js`, `app.js`
(only the seven const blocks), `index.html` only if a new script tag is needed.
Done when: standard validations pass + the manual checks above.
Risk: medium. This is app.js surgery, but confined to constant definitions.
If anything else in app.js needs touching, STOP and report instead.

---

## Track B — Wire existing draft content into the UI (medium budget)

Principle (architecture decision, Claude 2026-07-08): STOP creating new
draft-content files until the existing ones are visible in the app. The
115-formula and 202-herb shortlists currently help nobody because the UI
can't show them. Wiring beats writing.

### B1. Formula reconciliation plan (plan first, no merge)  **[GATE]**

Why: two formula files overlap — `data/herbs/formulas.json` (23 records,
rendered by the app) and `data/herbs/formula_canon_shortlist.json` (115
records incl. the same 23, richer planning fields, NOT rendered). One must
become canonical or they will diverge like the old 361/embedded split.

Do (mirror the successful 361 workflow):
1. Write the field map: for the 23 overlapping formulas, map every field in
   both files and decide the merge direction. Recommended target: ONE file,
   `data/herbs/formulas.json`, absorbing shortlist fields (`tier`,
   `comparison_group`, `related_formulas`, `modern_clinical_use_tags`,
   `english_exam_track`, `chinese_depth_track`, ...); the 92 skeleton-only
   records join as `review_status: "draft"` skeletons.
2. Write a preview script `scripts/merge-formulas-preview.js` producing
   `docs/FORMULA_MERGE_PREVIEW.json` + `docs/FORMULA_MERGE_DIFF_SUMMARY.md`
   (counts, added, changed, conflicts — same shape as 361_MERGE_DIFF_SUMMARY).
3. **[GATE]** Stop. Ting reviews the diff summary before any file is
   overwritten. Do not apply in the same session as writing the preview.

Files: `scripts/merge-formulas-preview.js` (new), two docs outputs, and the
field map appended to `docs/DATA_MIGRATION_MAP.md`. NO data file changes yet.
Done when: diff summary exists and validations pass.
Risk: low at this step (preview only). The apply step is a separate task.

### B2. Apply formula merge + render in Lookup (after B1 approval)

Do:
1. Apply the approved merge (`--apply-approved` pattern).
2. Run `scripts/build-data.js`; `js/knowledge.js` formula section now renders
   the merged set: keep the existing card layout, add a search box + category
   filter + status pill (draft records visibly marked, consistent with the
   content-status model in ARCHITECTURE_AUDIT.md).
3. Skeleton-only records render as compact rows ("draft — content pending"),
   not full cards, so the section stays honest.

Files: `data/herbs/formulas.json`, `scripts/build-data.js`,
`js/knowledge.js` formula block, `index.html` formulaSection markup if a
search input is needed, `styles.css` additions only (no edits to existing rules).
Done when: 115 formulas searchable in Lookup, 23 with content, all validations
pass, `docs/VALIDATION_LOG.md` updated.
Risk: medium. UI change; run validate-interactions and a browser spot-check.

### B3. Herbs list in Lookup (202 records, draft-labeled)

Why: 202 draft herb records exist and are invisible. Same "wiring beats
writing" principle.

Do:
1. `scripts/build-data.js` adds `herb_canon_shortlist.json` to
   `data/generated/knowledge_data.js`.
2. New "單味藥 Herbs" block in the Lookup workspace (pattern-match the
   formula section in `index.html` + `js/knowledge.js`): search by pinyin/
   zh/en name, filter by category, status pill on every card, related-formula
   links as plain text chips for now (clickable later).
3. Every card must show `draft — source review pending`. No record may render
   without its status.

Files: `scripts/build-data.js`, `js/knowledge.js`, `index.html` (new section
inside lookup workspace), `styles.css` additions only.
Done when: herbs searchable in Lookup, standard validations +
`validate-herb-canon.js` pass, VALIDATION_LOG updated.
Risk: medium-low. Additive UI.

---

## Track C — Content quality (full token budget only)

### C1. Source-check pilot: 20–30 high-yield items  **[GATE — needs source material from Ting]**

Blocked until Ting supplies/points to Bensky text or approved school notes.
Then: verify the 23 filled formulas' `english_exam_track` one by one; only
verified records get `source_status` upgraded. Never batch-upgrade.

### C2. Fill remaining 92 formula skeletons (draft only)

Only after B2, so new content lands in the rendered canonical file, not in a
side file. Same conservative wording rules as FORMULA_CANON_RULES.md. Batch in
groups of ~15 with a validation run between batches (and A1's encoding guard).

### C3. PC/TE/GB/LR/CV/GV standard-point content batches

Channel-by-channel completion per REBUILD_PLAN Phase 3 item 5. Follow the
existing per-channel workflow from README "資料庫更新進度". Requires A1 done
first (encoding guard) since these are large Chinese-text batches.

---

## Claude-owned items (do NOT assign to Codex)

These involve high-risk app.js surgery or architecture calls:

1. **361.json runtime adapter** — switching the app runtime from
   `data/acupoints/embedded/*.json` to `361.json` as the single source.
2. Case/SOAP dialog UX re-segmentation (per docs/CASE_SOAP_FLOW_REVIEW.md);
   case point/formula links → clickable into the knowledge base.
3. Router/workspace architecture changes; mobile one-workspace-at-a-time UX.
4. Any change to search behavior or the CloudTCM direct-link logic.

## Suggested order when Ting says "just pick the next thing"

A1 → A2 → B1 (gate) → B2 → B3 → A4 → A3 (gate) → C2 → C3. C1 whenever source
material becomes available — it can interleave.
