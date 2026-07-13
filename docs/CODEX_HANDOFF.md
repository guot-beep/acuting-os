# Codex Handoff

Purpose: shared repo mailbox for Codex -> Claude -> Ting coordination.

Rules:
- Latest entry goes at the top.
- Every meaningful Codex task should end with a clean working tree: committed + pushed, or explicitly named stash.
- This file is the handoff source of truth for Claude review. Ting should not need to manually relay routine status.
- Keep entries concise, factual, and auditable.

## Latest Entry Template

```text
Date/time:
Agent:
Branch:
Commit or stash:
Task:
Files changed:
Validation:
Protected areas not touched:
Known risks / manual checks:
Next recommended action:
Claude review note:
```

---

## 2026-07-12 - Claude - Phase 2 Runtime Adapter landed (branch, pending merge)

Branch: `phase2-runtime-adapter`

Commit: see branch head — "Phase 2: render standard acupoints from 361 adapter". Push/PR may be pending GitHub access; if the branch is local-only, Codex should push it and open the PR for Ting.

Task: EXECUTION_PLAN Phase 2 / docs/RUNTIME_ADAPTER_SPEC.md (all 8 steps). Gate (retire validate-data legacy deep-equal) was approved by Ting — recorded in PROJECT_LOG.

Files changed:
- `scripts/build-data.js` (emits `data/generated/points_361.js`)
- `data/generated/points_361.js` (new, generated)
- `data/generated/*` (rebuild timestamps)
- `index.html` (script tag + dashboard quality labels)
- `app.js` (adapt361Record, needling361Text, reconcileSavedPoints, assembly swap, placeholder removal, status-based dashboard counters)
- `scripts/validate-data.js` (rewritten: 361-coverage validator)
- `PROJECT_LOG.md`, `docs/DATA_MIGRATION_MAP.md`, `docs/CODEX_HANDOFF.md`

Validation:
- `validate-data` PASS (new checks), `validate-interactions` PASS, `validate-relations` PASS, `validate-herbal-links` PASS, `validate-herb-canon` PASS
- `validate-encoding`: expected backlog FAIL, still exactly 798 findings
- Browser QA: dashboard 361/361, LI4/PC1/BL61 pages, search jump, filters, 390px, localStorage merge scenarios, no console errors

Protected areas not touched:
- `data/acupoints/361.json` (read-only source; content unchanged)
- `docs/CLOUDTCM_*`, `data/acupoints/embedded/*.json`, `legacy/`, encoding backlog

Known risks / manual checks:
- Pre-adapter localStorage snapshots are filtered at load by `reconcileSavedPoints()`; if Ting has hand-edited points saved, verify they still appear (console logs an info line listing overriding codes).
- BL61-BL67 needling shows the existing mojibake text (frozen encoding backlog) — expected until the data repair batch.

Next recommended action:
- Ting merge the PR (or Codex push branch + open PR first). After merge, app.js/index.html/build-data.js freeze for Codex lifts per EXECUTION_PLAN Phase 2 note.

Claude review note:
- Embedded arrays now contribute only EX-HN3/EX-HN5. Standard-channel content edits must go to `data/acupoints/361.json` + `scripts/build-data.js` rebuild from now on.

---

## 2026-07-12 - Codex - Task queue status overlay

Branch: `main`

Commit: `fcb4f8d Add Codex task status overlay`; merged with Claude's latest `origin/main` in local merge commit `5afcf9b` before push.

Task: Maintenance after A3/A4. Make task completion/gate state explicit so Claude/Ting do not have to infer status from the original long queue.

Files changed:
- `docs/CODEX_HANDOFF.md`
- `docs/CODEX_TASK_QUEUE.md`
- `docs/CODEX_TASK_STATUS.md`

Validation:
- Docs-only change; no runtime validation required.

Protected areas not touched:
- `data/acupoints/361.json`
- `docs/CLOUDTCM_*`
- runtime app files
- generated files

Known risks / manual checks:
- Status overlay should be reviewed by Claude against Git history.

Next recommended action:
- Claude can use `docs/CODEX_TASK_STATUS.md` as a fast overlay before assigning the next task.

Claude review note:
- A1-A4, B1-B3, D1-D2, and D5 are marked complete. D3 / encoding backlog / C1 remain gated or blocked.

---

## 2026-07-12 - Codex - A4 UI config extraction

Branch: `main`

Commit: `e26d4fa A4: move UI config constants to generated data`

Task: CODEX_TASK_QUEUE A4. Move remaining app.js UI config constants into JSON and hydrate them from generated app data.

Files changed:
- `data/config/ui_config.json`
- `scripts/build-data.js`
- `data/generated/app_data.js`
- `app.js`
- `scripts/validate-interactions.js`
- `docs/DATA_MIGRATION_MAP.md`
- `docs/CODEX_HANDOFF.md`
- `docs/REBUILD_HANDOFF.md`
- `docs/VALIDATION_LOG.md`
- `PROJECT_LOG.md`

Validation:
- `node --check app.js`: PASS
- `node --check scripts/build-data.js`: PASS
- `node --check scripts/validate-interactions.js`: PASS
- `scripts/build-data.js`: PASS, `app_data.js` includes `uiConfig: 7`
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `scripts/validate-encoding.js`: expected backlog FAIL, still 798 known findings.

Protected areas not touched:
- `data/acupoints/361.json`
- `docs/CLOUDTCM_*`
- `js/router.js`
- `js/knowledge.js`
- `styles.css` point-detail-mode
- `data/sources/cloudtcm_point_map.json`
- `scripts/validate-data.js` IGNORED_FIELDS
- `legacy/`

Known risks / manual checks:
- Browser QA is recommended for dashboard counts, directory topic shortcut chips, Tung/Auricular filters, and ear anatomy labels.
- `app.js` was touched only for the A4-approved config hydration block.
- Encoding backlog count did not increase after adding `data/config/ui_config.json`.

Next recommended action:
- Claude review A4 extraction and confirm `ui_config.json` should be the future edit source.

Claude review note:
- Regex-based directory region matching is stored as `matchPattern` / `matchFlags`.
- Function-based topic filters are stored as `matchType` and hydrated through explicit matchers in app.js.

---

## 2026-07-12 - Codex - A3 JS twins generation completed

Branch: `main`

Commit: `bfcd128 A3: generate Tung and GB93 JS twins from JSON`

Task: CODEX_TASK_QUEUE A3. Generate Tung + GB93 `.js` twins from `.json` sources, verify payload equivalence, and update `DATA_MIGRATION_MAP.md` after Ting approved continuing past the gate.

Files changed:
- `scripts/build-data.js`
- `data/auricular/gb93_index.js`
- `data/auricular/gb93_worklist.js`
- `docs/A3_JS_TWINS_DIFF_SUMMARY.md`
- `docs/DATA_MIGRATION_MAP.md`
- `docs/CODEX_HANDOFF.md`
- `docs/REBUILD_HANDOFF.md`
- `docs/VALIDATION_LOG.md`
- `PROJECT_LOG.md`

Validation:
- `node --check scripts/build-data.js`: PASS
- `node --check data/tung/point_index.js`: PASS
- `node --check data/auricular/gb93_index.js`: PASS
- `node --check data/auricular/gb93_worklist.js`: PASS
- JSON source vs generated JS payload equivalence: MATCH for all three targets.
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `scripts/validate-encoding.js`: expected backlog FAIL, 798 known findings.

Protected areas not touched:
- `data/acupoints/361.json`
- `docs/CLOUDTCM_*`
- `app.js`
- `js/router.js`
- `js/knowledge.js`
- `styles.css` point-detail-mode
- `data/sources/cloudtcm_point_map.json`
- `scripts/validate-data.js` IGNORED_FIELDS
- `legacy/`

Known risks / manual checks:
- `data/auricular/gb93_index.js` and `data/auricular/gb93_worklist.js` have formatting diffs, but payloads match their JSON sources.
- App/browser spot-check is recommended because `index.html` loads these JS twins directly.

Next recommended action:
- Claude review `docs/A3_JS_TWINS_DIFF_SUMMARY.md`, payload equivalence, and generated JS twin behavior.

Claude review note:
- This is now final A3 completion, not just the gate artifact. No source data content changed.

---

## 2026-07-11 - Codex - B3 herbs Lookup wiring

Branch: `main`

Commit: `b3f1280 B3: wire herb canon into Lookup`

Task: CODEX_TASK_QUEUE B3. Wire existing `data/herbs/herb_canon_shortlist.json` into Lookup without filling new content or changing source status.

Files changed:
- `scripts/build-data.js`
- `data/generated/app_data.js`
- `data/generated/knowledge_data.js`
- `index.html`
- `js/knowledge.js`
- `styles.css`
- `docs/VALIDATION_LOG.md`
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

Validation:
- `node --check scripts/build-data.js`: PASS
- `node --check js/knowledge.js`: PASS
- `scripts/build-data.js`: PASS, `knowledge_data.js` includes `herbs: 202`
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `scripts/validate-encoding.js`: expected backlog FAIL, 798 known findings.

Protected areas not touched:
- `data/acupoints/361.json`
- `docs/CLOUDTCM_*`
- `app.js`
- `js/router.js`
- `data/sources/cloudtcm_point_map.json`
- `scripts/validate-data.js` IGNORED_FIELDS
- `legacy/`

Known risks / manual checks:
- Browser visual QA still recommended for Lookup -> Herbs search/category filter.
- 202 herb records remain draft/source-review pending.

Next recommended action:
- Claude can review B3 UI/data wiring from GitHub. If accepted, next task should come from `docs/CODEX_TASK_QUEUE.md` or a Claude-authored queue update.

Claude review note:
- This was additive wiring only. No source-check upgrade, no content refill, no encoding repair.

---

## 2026-07-11 - Codex - B2 formula merge/render cleanup

Branch: `main`

Commit: `280c193 B2: merge formula canon and render 115 formulas`

Task: Resolve previously uncommitted B2 formula merge/render work by committing and pushing one coherent change.

Files changed:
- `data/herbs/formulas.json`
- `data/generated/app_data.js`
- `data/generated/knowledge_data.js`
- `scripts/merge-formulas-preview.js`
- `docs/FORMULA_MERGE_PREVIEW.json`
- `docs/FORMULA_MERGE_DIFF_SUMMARY.md`
- `docs/DATA_MIGRATION_MAP.md`
- `docs/VALIDATION_LOG.md`
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`
- `index.html`
- `js/knowledge.js`
- `styles.css`

Validation:
- `node --check scripts/merge-formulas-preview.js`: PASS
- `node --check js/knowledge.js`: PASS
- `scripts/build-data.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS

Protected areas not touched:
- `data/acupoints/361.json`
- `docs/CLOUDTCM_*`
- replacement-character imports
- encoding backlog
- `stash@{0}`

Known risks / manual checks:
- Browser visual QA still recommended for Lookup -> Formulas search/category filter.
- Existing `????` data remains intentionally unresolved.

Next recommended action:
- Claude can review B2 commit scope and UI behavior.

Claude review note:
- Formula records are now 115 total: 23 content-bearing, 92 draft skeletons. No formula content was source-checked or clinically upgraded.
