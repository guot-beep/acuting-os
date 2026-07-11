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
