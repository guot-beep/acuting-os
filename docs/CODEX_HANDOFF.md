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

## 2026-07-14 - Claude - CS-track batch 2: CS4 autocomplete chip pickers

Branch: `cs-track-2` (off main). Files: `app.js`, `index.html` (none — form
unchanged), `styles.css`. Plus `.claude/launch.json` + `scripts/dev-server.js`
landed on main first (local static preview; `node` isn't on PATH so launch.json
uses the bundled node absolute path).

CS4 (external-review Phase 4.1 — the biggest SOAP-form friction): the SOAP
`acupointLinks` and `formulaLinks` textareas are now progressively enhanced
with an autocomplete chip picker. Type Chinese / pinyin / code → pick from a
menu → a chip is added and the underlying (now hidden) textarea is filled with
the exact `code` / `formula.<id>` the save+linkify path already expects. The
user never types an internal id. Existing notes hydrate into chips on open.
Vanilla, zero-dependency, progressive (textarea stays the source of truth, so
`saveSoapFromForm` / `splitList` are untouched).

Key functions (app.js): `enhanceLinkField()`, `setupLinkAutocomplete()`,
`pointPickerOptions()` / `formulaPickerOptions()`, `linkPickerControllers`;
`openSoapEditor()` calls setup+sync after hydration.

Points store `code` (not the new `id`) to stay compatible with the current
linkify renderer; the code→id swap happens with the future FK migration.
NOT YET enhanced (same pattern, follow-ups): tcmPatternLinks, medicationLinks,
safetyFlagLinks, westernConditionLinks, easternDiseaseLinks, outcomeMetricLinks.

Validation: node --check + validate-interactions PASS; browser QA drove the
real dialog — type/select/multi-select/remove/hydrate all verified, 0 console
errors. Handoff + PROJECT_LOG updated.

---

## 2026-07-13 - Claude - CS-track batch 1 (runtime id + backup banner + runtime stats)

Branch: `cs-track-1` (off main). First work after the freeze lifted.

Files changed: `app.js`, `index.html`, `styles.css`.

- Runtime `id` passthrough: `adapt361Record` / `tungIndexPoint` /
  `auricularGb93Point` now emit `id` (DECISIONS D2 namespaced id). Every
  runtime point carries `id` (embedded auricular / EX already had it from
  their JSON). This is the field future clinical FKs + CS4 autocomplete key on.
- CS1 backup discipline (no storage-engine change): `acuting-backup-meta-v1`
  tracks last export + saves-since. A sticky banner appears when there are
  cases AND the last export is ≥7 days old (or never); every 10th case/SOAP
  save prompts to export. `exportClinicalCases()` resets the meta. localStorage
  is still the store — this is the H2 bridge, not the migration.
- CS2 stop the lying numbers: hardcoded stats in index.html (115/23/18/15,
  202/34/407/409, fertility 4/12) replaced with runtime spans filled by
  `renderKnowledgeCounts()` from ACUTING_KNOWLEDGE. Underivable ones (content-
  bearing count, formula safety, workflow seeds, fertility meds) were removed
  /reworded, not left to rot. Verified live: 115/17/202/202/34/407/409.

Validation: 7-validator sweep PASS; browser QA (counts, banner, id passthrough,
zero console errors). Next: CS4 autocomplete (separate batch), then merge.

Claude review note: app.js/index.html are no longer frozen but stay
one-writer-per-area — coordinate before touching the SOAP form.

---

## 2026-07-13 - Claude - ALL SESSION BRANCHES MERGED TO MAIN (read this first)

Branch: `main`

Commit: `367cdb2` (merge of the whole stack + point-category). main went `f13899a` -> `367cdb2`.

State for Codex / other agents — the freeze has LIFTED:
- **Phase 2 runtime adapter is LIVE on main.** app.js renders `data/acupoints/361.json` via `adapt361Record()`; embedded standard-channel arrays are retired from the runtime (they now contribute only EX-HN3/EX-HN5). `app.js` / `index.html` / `scripts/build-data.js` are NO LONGER frozen — but still coordinate one-writer-per-area.
- **DECISIONS.md is now authoritative and machine-enforced.** READ IT before touching ids/schema/naming/deletion. Locked + validated: D2 (namespaced immutable point `id`), D3 (formula/herb homonym `__source` rule), D4 (de-id posture), D6 (knowledge never hard-deleted; `data/acupoints/point_id_manifest.json` ledger).
- **New validators in the standard sweep** (run all of these now):
  `validate-point-ids.js` (id namespacing + no-hard-delete via the manifest),
  `validate-naming.js` (homonym rule). Plus the existing five.
- **New data/docs on main:** `data/interop/condition_crosswalk.json` (150),
  `data/acupoints/point_id_manifest.json`, point `id` fields across
  361/tung/auricular/professional, gyn condition fills in
  `condition_canon_shortlist.json`, `DECISIONS.md`, `docs/EXTERNAL_REVIEW_2026-07.md`,
  `docs/POINT_CATEGORY_TAGS_DESIGN.md`, `docs/LEARNING_LOOP_TRACK.md`,
  `docs/CONDITIONS_INTEROP_DESIGN.md`, hardened `.gitignore`.
- **Point maintenance rule:** never delete a point — set `review_status="deprecated"`.
  To add a new permanent point: add it, then `node scripts/update-point-manifest.js --write`.
- All five session branches were merged and DELETED (local + remote). Only `main` remains active.

Next (Claude, in progress on branch `cs-track-1`): CS-track batch 1 — runtime
`id` passthrough + CS1 backup banner + CS2 replace hardcoded index.html stats.

---

## 2026-07-13 - Claude - 大辭典 verified + E3 gyn content fill

Branch: `conditions-interop-design`

Task: ran the unblocked conditions work while Codex is out of credits.

Files changed:
- `data/sources/source_registry.json` (大辭典 record enriched with verified edition + official/online/GPI URLs + access note)
- `data/pathology/condition_canon_shortlist.json` (25 gyn records gain summary/red_flags/western_context; 125 others byte-identical)
- `data/pathology/condition_fill_gyn.json` (NEW: the fill source content)
- `scripts/apply-condition-fill.js` (NEW: adds-only merge tool, rerunnable per batch)
- `docs/CODEX_TASK_STATUS.md`, `PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`

Validation: validate-relations / validate-data / validate-interactions / validate-herb-canon PASS; validate-encoding still 768 (no new findings).

Protected areas not touched: 361.json, CLOUDTCM_*, app.js, index.html, legacy/, encoding backlog.

Known risks / manual checks:
- E3 gyn content is DRAFT clinical study text pending Ting's per-batch review; not rendered yet (E-I6 conditionGraph rewire still blocked).
- E-I3 dictionary_refs still BLOCKED: the NRICM online DB was unreachable from here; Ting's print/online access needed.

Next recommended action:
- Ting: review the 25 gyn fills (spot-check cond.pcos, cond.amenorrhea, cond.breech_presentation). If the tone/depth is right, the same apply-condition-fill.js pattern extends to pain_msk (30) next.
- Codex (when credits return): E-I3 once Ting has the dictionary; E3 pain_msk batch using data/pathology/condition_fill_pain_msk.json + scripts/apply-condition-fill.js pain_msk.

Claude review note:
- red_flags are bilingual parallel arrays (red_flags_zh/red_flags_en), matching the existing conditions.json red_flags_en convention.

---

## 2026-07-12 - Claude - Track E-I0/I1/I2/I4 executed

Branch: `conditions-interop-design` (stacked on `phase2-runtime-adapter`)

Commit: branch head after "Execute Track E-I0-I4" commit; pushed to origin.

Task: docs/CONDITIONS_INTEROP_DESIGN.md §9 tasks E-I0, E-I1, E-I2, E-I4, executed under Ting's explicit "always allowed" continuation delegation (recorded in PROJECT_LOG).

Files changed:
- `data/pathology/conditions.json` + `data/pathology/condition_graph_expansion.json` (E-I0: 18 mojibake name_zh repaired via guarded script; provenance stamped)
- `data/sources/source_registry.json` (E-I1: added `mohw_nricm_disease_name_dictionary`, additive only)
- `data/interop/condition_crosswalk.json` (E-I2: NEW, 150 skeleton records)
- `scripts/validate-relations.js` (E-I4: crosswalk FK checks + icd warning)
- `data/generated/*` (rebuild)
- `docs/CODEX_TASK_STATUS.md`, `docs/CODEX_HANDOFF.md`, `PROJECT_LOG.md`

Validation:
- validate-data / validate-interactions / validate-relations / validate-herbal-links / validate-herb-canon: PASS (relations now checks 150 crosswalk records, 0 errors 0 warnings)
- validate-encoding: expected FAIL; findings DROPPED 798 → 768 (the repaired strings had triggered multiple rules each)
- repair script re-run dry: 0 to repair, 18 recognized healthy

Protected areas not touched:
- `data/acupoints/361.json`, `docs/CLOUDTCM_*`, `app.js`, `index.html`, `legacy/`, all other encoding-backlog content beyond the 18 approved strings

Known risks / manual checks:
- E-I2 awaits Ting's 5-record spot-check (e.g. xwalk.pcos, one per category).
- 大辭典 registry URL is the institute root; exact resource page/edition needs Ting's verification before E-I3.

Next recommended action:
- Ting: merge Phase 2 PR first, then the conditions-interop PR; spot-check E-I2; locate her copy of the 大辭典 for E-I3.
- Codex: E-I3 stays BLOCKED; E-I5 waits for Phase 2 merge.

Claude review note:
- The old 798 encoding baseline is obsolete — new expected backlog count is 768.

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
