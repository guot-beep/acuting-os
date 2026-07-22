# REBUILD HANDOFF - Session 39 (2026-07-22, indication translation batch 1)

## 1. Goal
Start the 2473-label English layer with identity-checked curated overrides.

## 2. Files changed
Translation override, regenerated indication vocabulary, scripts, migration
map, and coordination logs.

## 3. What changed
58 high-frequency or clearly translatable labels now have English drafts;
2415 remain explicitly pending.

## 4. Why this changed
Ting requires bilingual tags, but bulk unreviewed machine translation would
create false medical equivalences and poor search terms.

## 5. Data content changes
Taxonomy translations only; no clinical recommendations or formula facts.

## 6. Source status / accuracy guardrail
All translations remain curated_draft. Traditional terms are labelled as such.

## 7. Schema / field changes
English authority is stored separately by source_id + exact source name.

## 8. Generated files / scripts
Extractor applies overrides only after Chinese identity matches; validator
enforces curated/pending status and bilingual counts.

## 9. Protected areas
No runtime, canonical clinical/content, generated app bundle, or frozen area.

## 10. Validation
2473 unique IDs; 58 bilingual; 2415 pending; vocabulary and standard checks PASS.

## 11. Triage results
Common search concepts are prioritised before obscure historical expressions.

## 12. Not completed
2415 English labels and all runtime wiring remain incomplete.

## 13. Next reader should inspect
The 58 override terms and TCM-term qualifications.

## 14. Next step
Continue 50-100 label batches and cross-link only after terminology review.

## 15. Risk
Medium terminology risk, zero runtime risk while unwired.

---

# REBUILD HANDOFF - Session 38 (2026-07-22, CloudTCM taxonomy source layer)

## 1. Goal
Create stable source vocabularies for CloudTCM's 14 disease categories, 139
formula functions, and 2473 formula indications without overwriting canon.

## 2. Files changed
Three additive JSON vocabularies, extraction/validation scripts, source
registry, migration map, and coordination logs.

## 3. What changed
All source IDs, Chinese labels, and direct routes are preserved. Disease and
function categories have English curated drafts; indications form a complete
Chinese translation queue.

## 4. Why this changed
Ting requested CloudTCM-compatible classification and real bilingual labels,
not English-only, Chinese-only, or ad hoc category names.

## 5. Data content changes
Taxonomy labels only. No article text, images, efficacy statements, formula
composition, clinical recommendation, or diagnosis mapping was copied.

## 6. Source status / accuracy guardrail
All records remain draft. Taxonomy membership is browse metadata, not evidence
of efficacy, a diagnosis, or a one-to-one Western/TCM equivalence.

## 7. Schema / field changes
New additive records carry namespaced source IDs, source_id, name_zh/name_en,
direct source_url, and translation_status.

## 8. Generated files / scripts
Extractor reads public `__NEXT_DATA__`, asserts exact source counts, and writes
UTF-8 JSON. Validator enforces counts, identity, direct links, and translations.

## 9. Protected areas
No current canonical formula/condition record, generated data, runtime UI,
361.json, CLOUDTCM review document, point map, case/SOAP, router, or CSS change.

## 10. Validation
Vocabulary validation PASS (14/139/2473 unique IDs); syntax, recursive JSON,
and eight standard validators PASS. Existing quality baseline remains 36%.

## 11. Triage results
English completion: disease 14/14, functions 139/139, indications 0/2473.

## 12. Not completed
The 2473 indication English translations and UI wiring are not complete.

## 13. Next reader should inspect
Both scripts, the 139 translations, qualified high-claim source labels, and
the explicit 2473 pending-translation policy.

## 14. Next step
Translate only high-priority indication tags in deterministic reviewed batches,
then connect complete bilingual vocabularies to browse filters.

## 15. Risk
Medium content risk, low runtime risk. The new files are currently unwired.

---

# REBUILD HANDOFF - Session 37 (2026-07-22, exact source-link repair)

## 1. Goal
Replace broken search links and inaccurate English-only Tung identities with
verified exact CloudTCM herb and Master Tung point records.

## 2. Files changed
Herb/Tung source maps and fetch scripts; Tung JSON/generated JS; runtime source
link helpers in `app.js` and `js/knowledge.js`; build output and handoff logs.

## 3. What changed
CloudTCM exact pages cover 201/202 herbs. Master Tung exact pages and Chinese
names cover 277/277 points. Google search fallbacks were removed.

## 4. Why this changed
Ting found the old links misleading and specifically requested exact record
pages, bilingual identities, and 後椎穴 at the authoritative T44.02 page.

## 5. Data content changes
Identity and link metadata only. No clinical facts, dosing, needling,
indications, contraindications, or copied article/image content was added.

## 6. Source status / accuracy guardrail
Exact Chinese-name/code matching is required. 牛膝 is deliberately unmatched
because 川牛膝 is not accepted as the same canonical entity.

## 7. Schema / field changes
The herb URL map stores verified page identity. Tung records gained/fill
`name_zh`, aliases, exact `source_urls`, `visual_links`, and source status.

## 8. Generated files / scripts
Added two resumable fetchers. `scripts/build-data.js` bundles the herb URL map
and regenerates application/Tung outputs.

## 9. Protected areas
No 361.json, CLOUDTCM review docs, CloudTCM point map, case/SOAP, router,
review runtime, CSS, or clinical data changes. app.js edits are source-link
helpers only.

## 10. Validation
Build and syntax PASS; recursive JSON parse PASS (484); eight validators PASS;
browser QA PASS for 後椎穴, 大棗, exact URLs, and zero Google search links.

## 11. Triage results
Herbs 201 exact / 1 withheld; Tung 277 exact / 0 missing Chinese identity.

## 12. Not completed
The 139 formula functions and 2473 formula indications still need source-keyed
bilingual vocabulary records. Herb and Tung substantive content remains a
separate source-fill task.

## 13. Next reader should inspect
The two source maps, both fetch scripts, and the source-link helper diffs.

## 14. Next step
Build CloudTCM taxonomy vocabularies additively, preserving source IDs and
translation review state; then continue professional-source herb content fill.

## 15. Risk
Low for routing. Synonym mapping remains identity-sensitive, especially 牛膝.

---

# REBUILD HANDOFF - Session 36 (2026-07-12, A4 UI config extraction)

## 1. Goal
Complete CODEX_TASK_QUEUE A4: move the remaining UI config constants out of `app.js` into JSON, build them into `data/generated/app_data.js`, and keep runtime behavior unchanged.

## 2. Files changed
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

## 3. What changed
- Extracted seven config blocks:
  - `standardChannelAudit`
  - `channelPrefixMeta`
  - `auricularZonePositions`
  - `directoryRegionGroups`
  - `directoryTopics`
  - `earAnatomyLabelData`
  - `earPointAnchors`
- Added `data/config/ui_config.json` as the editable source.
- `scripts/build-data.js` now includes `uiConfig` in `ACUTING_APP_DATA`.
- `app.js` hydrates regex and topic match functions from config.
- `scripts/validate-interactions.js` now reads directory topic IDs from `ui_config.json`.
- `docs/DATA_MIGRATION_MAP.md` marks small UI configs as migrated.

## 4. Why this changed
This completes CODEX_TASK_QUEUE A4 and reduces app.js size/risk by moving static UI data into a structured JSON source.

## 5. Data content changes
No clinical/acupoint/herb/pathology content changed. The extracted config is a mechanical relocation of existing UI constants.

## 6. Source status / accuracy guardrail
No source status or clinical review status changed.

## 7. Schema / field changes
New config schema is implicit in `data/config/ui_config.json`. Directory regexes are stored as `matchPattern` / `matchFlags`; topic function shortcuts are stored as `matchType`.

## 8. Generated files / scripts
Ran `scripts/build-data.js`. `data/generated/app_data.js` now includes `uiConfig`.

## 9. Protected areas
Touched `app.js` only for the A4-approved config hydration change. Did not modify `data/acupoints/361.json`, `docs/CLOUDTCM_*`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- `node --check app.js`: PASS
- `node --check scripts/build-data.js`: PASS
- `node --check scripts/validate-interactions.js`: PASS
- `scripts/build-data.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `scripts/validate-encoding.js`: expected backlog FAIL, still 798 known findings

## 11. Triage results
Default point validation remains lossless: 681 default points, no duplicate point codes, legacy/current app data deep-equal after excluded reference URL fields.
Encoding backlog count did not increase after adding `data/config/ui_config.json`.

## 12. Not completed
Manual browser QA not yet done. Recommended checks: home dashboard counts, directory topic shortcut chips, Tung/Auricular filters, and ear anatomy labels.

## 13. Next reader should inspect
Read:
- `data/config/ui_config.json`
- `scripts/build-data.js`
- top hydration block in `app.js`
- `scripts/validate-interactions.js`

## 14. Next step
Claude/Ting should review A4 extraction. If accepted, future edits to these config values should happen in `data/config/ui_config.json`, followed by `scripts/build-data.js`.

## 15. Risk
Medium. Runtime behavior is validated by scripts, but browser visual QA is recommended because config affects directory and ear-map display.

---

# REBUILD HANDOFF - Session 35 (2026-07-12, A3 JS twins generation completed)

## 1. Goal
Complete CODEX_TASK_QUEUE A3: generate Tung and GB93 `.js` twins from `.json` sources, prove payload equivalence, and update `docs/DATA_MIGRATION_MAP.md` after Ting approved continuing past the gate.

## 2. Files changed
- `scripts/build-data.js`
- `data/auricular/gb93_index.js`
- `data/auricular/gb93_worklist.js`
- `docs/A3_JS_TWINS_DIFF_SUMMARY.md`
- `docs/DATA_MIGRATION_MAP.md`
- `docs/CODEX_HANDOFF.md`
- `docs/REBUILD_HANDOFF.md`
- `docs/VALIDATION_LOG.md`
- `PROJECT_LOG.md`

## 3. What changed
- Added reusable JSON read/write helpers to `scripts/build-data.js`.
- Added generation of:
  - `data/tung/point_index.js` from `data/tung/point_index.json`
  - `data/auricular/gb93_index.js` from `data/auricular/gb93_index.json`
  - `data/auricular/gb93_worklist.js` from `data/auricular/gb93_worklist.json`
- Ran build and wrote `docs/A3_JS_TWINS_DIFF_SUMMARY.md`.
- Updated `docs/DATA_MIGRATION_MAP.md` to mark the three `.js` twins as generated from their `.json` sources.

## 4. Why this changed
The Tung/GB93 `.js` files are hand-maintained copies of JSON sources. A3 reduces double-edit risk by making the JSON files the future authority and the JS wrappers generated.

## 5. Data content changes
No source JSON content changed. Generated JS payloads match their JSON sources.

## 6. Source status / accuracy guardrail
No TCM content was added, removed, source-checked, or clinically upgraded.

## 7. Schema / field changes
No source schema changed.

## 8. Generated files / scripts
`scripts/build-data.js` now generates the three JS twins. `data/auricular/gb93_index.js` and `data/auricular/gb93_worklist.js` show formatting diffs; payload equivalence is MATCH. `data/tung/point_index.js` generated without tracked diff.

## 9. Protected areas
Did not modify `data/acupoints/361.json`, `docs/CLOUDTCM_*`, `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- `node --check scripts/build-data.js`: PASS
- `node --check data/tung/point_index.js`: PASS
- `node --check data/auricular/gb93_index.js`: PASS
- `node --check data/auricular/gb93_worklist.js`: PASS
- JSON source vs generated JS payload equivalence: MATCH for all three
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `scripts/validate-encoding.js`: expected backlog FAIL, 798 known findings

## 11. Triage results
- Tung JS twin: payload MATCH, no tracked content diff after build.
- GB93 index JS twin: payload MATCH, formatting diff only.
- GB93 worklist JS twin: payload MATCH, formatting diff only.

## 12. Not completed
No browser visual QA yet. No source data content changed.

## 13. Next reader should inspect
Read:
- `docs/A3_JS_TWINS_DIFF_SUMMARY.md`
- `scripts/build-data.js`
- `data/auricular/gb93_index.js`
- `data/auricular/gb93_worklist.js`

## 14. Next step
Claude should review `docs/A3_JS_TWINS_DIFF_SUMMARY.md`, the generated JS twin diffs, and the `scripts/build-data.js` generation behavior. Ting should browser spot-check Tung and GB93 pages/filters.

## 15. Risk
Medium-low. The generated payloads match source JSON, but app/browser spot-check is still recommended because `index.html` loads these JS files directly.

---

# REBUILD HANDOFF - Session 34 (2026-07-11, B3 herbs Lookup wiring)

## 1. Goal
Complete CODEX_TASK_QUEUE B3: make the existing 202-record herb canon shortlist visible/searchable in the Lookup workspace without filling new content or changing source status.

## 2. Files changed
- `scripts/build-data.js`
- `data/generated/app_data.js`
- `data/generated/knowledge_data.js`
- `index.html`
- `js/knowledge.js`
- `styles.css`
- `docs/VALIDATION_LOG.md`
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

## 3. What changed
- Added `data/herbs/herb_canon_shortlist.json` to the generated knowledge bundle as `ACUTING_KNOWLEDGE.herbs`.
- Added a Lookup Herbs / Materia Medica section.
- Added herb rendering with:
  - search by id, zh/en name, pinyin, category, channel, functions, modern tags, safety flags, and related formulas,
  - category filter,
  - draft/source-review pending status display,
  - safety flag snippets,
  - related formula ID chips.
- Added small CSS for herb cards and related formula chips.

## 4. Why this changed
The 202 herb records already existed but were invisible in the app. This follows the current "wiring beats writing" rule: make draft content searchable before creating more content.

## 5. Data content changes
No herb content changed. No source status was upgraded.

## 6. Source status / accuracy guardrail
All herb records remain draft/source-review pending and are rendered as study reference only.

## 7. Schema / field changes
No source JSON schema changed. The generated knowledge bundle now includes `herbs`.

## 8. Generated files / scripts
- Ran `scripts/build-data.js`.
- `data/generated/knowledge_data.js` now reports `herbs: 202`.
- `data/generated/*` was refreshed by the build script only, not hand-edited.

## 9. Protected areas
Did not modify `app.js`, `js/router.js`, `styles.css` point-detail-mode, `data/acupoints/361.json`, `docs/CLOUDTCM_*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- `node --check scripts/build-data.js`: PASS
- `node --check js/knowledge.js`: PASS
- `scripts/build-data.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `scripts/validate-encoding.js`: expected backlog FAIL, 798 known findings.

## 11. Triage results
- Herbs rendered: 202
- Herb categories: 34
- Related formula links in herb canon: 407
- Safety flags in herb canon: 409

## 12. Not completed
No browser screenshot/manual visual QA yet. No herb source-checking. No encoding repair.

## 13. Next reader should inspect
Read:
- `index.html` herb section
- `js/knowledge.js` Herbs renderer
- `data/generated/knowledge_data.js` generated `herbs` payload

## 14. Next step
Manual browser spot-check: open Lookup -> Herbs, search by pinyin/category/related formula, and confirm draft status is visible on every herb card. If accepted, commit this B3 batch.

## 15. Risk
Medium-low. Additive UI and generated data wiring only; no source data mutation. Main risk is visual density from 202 cards, mitigated by search/filter.

---

# REBUILD HANDOFF - Session 33 (2026-07-11, B2 formula merge + Lookup rendering)

## 1. Goal
After Ting approved continuing directly from B1, apply the formula merge and make 115 formulas visible/searchable in the Lookup workspace. Do not touch `data/acupoints/361.json`, `docs/CLOUDTCM_*`, or the encoding backlog.

## 2. Files changed
- `data/herbs/formulas.json`
- `data/generated/app_data.js`
- `data/generated/knowledge_data.js`
- `scripts/merge-formulas-preview.js`
- `js/knowledge.js`
- `styles.css`
- `index.html`
- `docs/VALIDATION_LOG.md`
- `docs/DATA_MIGRATION_MAP.md`
- `docs/FORMULA_MERGE_PREVIEW.json`
- `docs/FORMULA_MERGE_DIFF_SUMMARY.md`
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

## 3. What changed
- Extended `scripts/merge-formulas-preview.js` with `--apply-approved`.
- Applied the approved formula merge:
  - preserved 23 content-bearing records,
  - added 92 draft skeleton records,
  - kept all records draft/source-review pending.
- Ran `scripts/build-data.js`, updating `data/generated/knowledge_data.js` to 115 formulas.
- Updated Lookup formula rendering:
  - 23 content-bearing records render as full cards,
  - 92 skeleton-only records render as compact draft rows,
  - formula search covers id, zh/en name, pinyin, category, comparison group, and modern tags,
  - added category filter.
- Updated static formula progress text.
- Added validation entry to `docs/VALIDATION_LOG.md`.

## 4. Why this changed
The previous formula layer split made 92 approved core formula skeletons invisible in the app. This merges the planning layer into the rendered formula source while keeping draft status honest.

## 5. Data content changes
`data/herbs/formulas.json` now has:
- 115 records total,
- 23 content-bearing records,
- 92 draft skeleton records,
- 0 duplicate IDs.

No formula content was source-checked or clinically upgraded.

## 6. Source status / accuracy guardrail
All added skeleton records remain `review_status: "draft"` and `source_status: "source_review_pending"`. UI labels them as study reference / source-review pending.

## 7. Schema / field changes
Merged formula records now include planning fields such as `tier`, `category`, `source_hint`, `comparison_group`, `related_formulas`, and `clinical_use_note`. Existing content fields were preserved.

## 8. Generated files / scripts
- Ran `scripts/build-data.js`.
- `data/generated/app_data.js` and `data/generated/knowledge_data.js` were refreshed by the build script.
- `data/generated/knowledge_data.js` updated from the canonical formula file.
- No hand edit to `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `styles.css` point-detail-mode, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, `legacy/`, `data/acupoints/361.json`, or `docs/CLOUDTCM_*`.

## 10. Validation
- `node --check scripts/merge-formulas-preview.js`: PASS
- `node --check js/knowledge.js`: PASS
- `scripts/build-data.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS

## 11. Triage results
Formula data check:
- records: 115
- content-bearing: 23
- skeletons: 92
- duplicate ids: 0

## 12. Not completed
No formula content filling, no source-checking, no encoding backlog repair, no commit.

## 13. Next reader should inspect
Read:
- `data/herbs/formulas.json`
- `js/knowledge.js`
- `docs/FORMULA_MERGE_DIFF_SUMMARY.md`
- `docs/VALIDATION_LOG.md`

## 14. Next step
Claude/Ting should review the 115-formula Lookup behavior and decide whether to commit B1+B2 together or ask for UI refinements first.

## 15. Risk
Medium-low. Data merge was scripted and validated; UI change is additive but should be manually checked in browser.

---

# REBUILD HANDOFF - Session 32 (2026-07-11, B1 formula merge preview)

## 1. Goal
Complete CODEX_TASK_QUEUE B1: create a formula reconciliation preview between `data/herbs/formulas.json` and `data/herbs/formula_canon_shortlist.json`. Preview only; do not apply or modify formula data.

## 2. Files changed
- `scripts/merge-formulas-preview.js` (new)
- `docs/FORMULA_MERGE_PREVIEW.json` (new)
- `docs/FORMULA_MERGE_DIFF_SUMMARY.md` (new)
- `docs/DATA_MIGRATION_MAP.md`
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

## 3. What changed
- Added a preview script for formula merge planning.
- Generated a machine-readable preview and human-readable diff summary.
- Added the formula field map to `docs/DATA_MIGRATION_MAP.md`.
- Recommended target remains one rendered canonical formula file: `data/herbs/formulas.json`, but no apply was done.

## 4. Why this changed
The app currently renders 23 formula records from `data/herbs/formulas.json`, while `data/herbs/formula_canon_shortlist.json` has 115 canon-planning records. B1 prevents these from diverging by creating a gated merge plan before any data overwrite.

## 5. Data content changes
No data content changed. `data/herbs/formulas.json` was not modified.

## 6. Source status / accuracy guardrail
No source status changed. Draft skeleton additions remain draft in preview only. No formula was upgraded to `source_checked`.

## 7. Schema / field changes
No schema changed. Preview recommends adding planning fields after approval: `tier`, `category`, `source_hint`, `comparison_group`, `related_formulas`, and `clinical_use_note`.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, `legacy/`, `data/acupoints/361.json`, or `docs/CLOUDTCM_*`.

## 10. Validation
- `node --check scripts/merge-formulas-preview.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `scripts/validate-encoding.js`: not used as blocker; known backlog remains documented.

## 11. Triage results
- `formulas.json`: 23 records
- `formula_canon_shortlist.json`: 115 records
- Overlap by `id`: 23
- Formula-only records: 0
- Shortlist-only proposed draft skeleton additions: 92
- Projected merged total: 115
- Duplicate ids: 0
- Identity conflicts: 0
- Overlap planning fields to fill from shortlist: 138
- Changed/conflicting overlap fields: 0

## 12. Not completed
No apply step. No formula data merge. No UI rendering change. No encoding backlog repair.

## 13. Next reader should inspect
Read:
- `docs/FORMULA_MERGE_DIFF_SUMMARY.md`
- `docs/FORMULA_MERGE_PREVIEW.json`
- `scripts/merge-formulas-preview.js`

## 14. Next step
Ting reviews B1 preview. If approved later, B2 should apply the merge and render 115 formulas in Lookup. Do not combine approval/apply into this session.

## 15. Risk
Low. Preview-only, no data mutation.

---

# REBUILD HANDOFF - Session 31 (2026-07-11, A1/A2 encoding guard + migration map sync)

## 1. Goal
After pulling `origin/main` to `0259258`, complete A1 and A2 from `docs/CODEX_TASK_QUEUE.md`. Keep `data/acupoints/361.json` and `docs/CLOUDTCM_*` frozen pending Ting §A/§B decisions.

## 2. Files changed
- `scripts/validate-encoding.js` (new)
- `docs/ENCODING_VALIDATION_FINDINGS.md` (new)
- `README.md`
- `docs/CODEX_TASK_QUEUE.md`
- `docs/DATA_MIGRATION_MAP.md`
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

## 3. What changed
- Added a read-only encoding validator for `data/**/*.json`.
- Validator reports:
  - strings made of question marks,
  - dense question-mark damage,
  - replacement characters,
  - Chinese-labeled fields without CJK characters.
- Added `--summary-only` mode for compact triage output.
- Added the validator to README and task queue validation lists.
- Wrote current findings to `docs/ENCODING_VALIDATION_FINDINGS.md`.
- Updated `docs/DATA_MIGRATION_MAP.md` with current formula, herb, import, pathology, medication, and clinical workflow authority/staging status.

## 4. Why this changed
The BL61-BL67 mojibake incident showed the project needs an automated encoding guard. The migration map also needed to reflect newer draft/staging files so nobody mistakes staging data for app-rendered canonical data.

## 5. Data content changes
No data content changed.

## 6. Source status / accuracy guardrail
No source status changed. The encoding validator reports only and does not infer or repair clinical content.

## 7. Schema / field changes
No schema changed.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, `legacy/`, `data/acupoints/361.json`, or `docs/CLOUDTCM_*`.

## 10. Validation
- `node --check scripts/validate-encoding.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `scripts/validate-encoding.js --summary-only`: FAIL by design on existing backlog

## 11. Triage results
First encoding scan after `0259258`:
- Files checked: 439
- Findings: 798
- By type: question_mark_only 325, chinese_field_without_cjk 403, question_mark_damage 8, replacement_character 62
- Main affected files: `data/herbs/formulas.json`, `data/herbs/herb_canon_shortlist.json`, `data/sources/source_registry.json`, `data/imports/cloudtcm/*`, `data/pathology/*`, `data/acupoints/361.json`, `data/learn/content_architecture_seed.json`.

## 12. Not completed
No data repairs were attempted. `validate-encoding.js` is not yet a green gate because existing data has known findings.

## 13. Next reader should inspect
Read:
- `docs/ENCODING_VALIDATION_FINDINGS.md`
- `scripts/validate-encoding.js`
- `docs/DATA_MIGRATION_MAP.md`

## 14. Next step
Choose whether to repair small encoding backlogs first (`data/sources/source_registry.json`, pathology names) or add an explicit known-issues allowlist so the validator can become a green regression gate while repairs proceed.

## 15. Risk
Low. Validator/docs only; no data mutation.

---

# REBUILD HANDOFF - Session 28 (2026-07-10, BL61-BL67 approved encoding repair apply)

## 1. Goal
Apply only the 3 BL61-BL67 encoding repair items approved by Ting from the preview batch. Do not bulk merge CloudTCM and do not reconstruct study-note fields.

## 2. Files changed
- `data/acupoints/361.json`
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

## 3. What changed
- Repaired BL61 `location_zh`.
- Repaired BL67 `location_zh`.
- Repaired BL67 `contraindications`.
- Left the remaining 13 damaged fields unchanged because they are `clinical_pearls`, `danger`, or similar study-note/safety-note fields requiring manual rewrite/removal decision.

## 4. Why this changed
Ting approved the preview's 3 concise repairs. These were small canonical data repairs, not a CloudTCM bulk merge.

## 5. Data content changes
Canonical `data/acupoints/361.json` changed only in the 3 approved fields.

## 6. Source status / accuracy guardrail
No `source_checked` status changed. The repaired text remains conservative study data and should still be reviewed against preferred authoritative sources during later D3/D4 safety review.

## 7. Schema / field changes
No schema changed.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS

## 11. Triage results
- Approved repairs applied: 3
- Damaged fields still requiring manual review: 13

## 12. Not completed
No `clinical_pearls`, `danger`, or BL67 `needling.technique` reconstruction was attempted.

## 13. Next reader should inspect
Read:
- `docs/BL61_BL67_ENCODING_REPAIR_PREVIEW.md`
- `docs/CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md`

## 14. Next step
Run validators, then decide whether to create a dedicated commit for D3 review docs plus the 3 approved canonical repairs.

## 15. Risk
Low. Three small approved field repairs only; no bulk source merge.

---

# REBUILD HANDOFF - Session 27 (2026-07-10, BL61-BL67 encoding repair preview)

## 1. Goal
Continue after Batch A safety review by preparing a gated repair preview for the BL61-BL67 canonical fields that contain literal `????` encoding damage. Do not modify `data/acupoints/361.json`.

## 2. Files changed
- `scripts/preview-bl61-bl67-encoding-repair.js` (new)
- `docs/BL61_BL67_ENCODING_REPAIR_PREVIEW.md` (new)
- `docs/BL61_BL67_ENCODING_REPAIR_PREVIEW.json` (new)
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

## 3. What changed
- Added a read-only preview script for BL61-BL67 encoding damage.
- Generated a repair preview separating:
  - 3 proposed concise repairs that could be applied after Ting approval,
  - 13 study-note fields that need manual rewrite/removal decision.
- Proposed repairs:
  - BL61 `location_zh`
  - BL67 `location_zh`
  - BL67 `contraindications`
- Manual review fields are mostly `clinical_pearls` and `danger`, which should not be blindly replaced with CloudTCM prose.

## 4. Why this changed
Literal `????` strings are unreadable canonical data and should be handled before deeper source-review work. This preview gives Ting a tiny gated repair target without bulk applying CloudTCM content.

## 5. Data content changes
No canonical data changed. This is a preview only.

## 6. Source status / accuracy guardrail
CloudTCM staging was used only as one reference for proposing concise repair candidates. No source_checked status was changed.

## 7. Schema / field changes
No schema changed.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- `node --check scripts/preview-bl61-bl67-encoding-repair.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- UTF-8 doc spot-check: PASS

## 11. Triage results
- Affected codes: BL61, BL62, BL63, BL64, BL65, BL66, BL67
- Proposed concise repairs: 3
- Needs manual rewrite/removal decision: 13

## 12. Not completed
No repair was applied. No `clinical_pearls` or `danger` text was reconstructed.

## 13. Next reader should inspect
Read:
- `docs/BL61_BL67_ENCODING_REPAIR_PREVIEW.md`
- `docs/BL61_BL67_ENCODING_REPAIR_PREVIEW.json`
- `docs/CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md`

## 14. Next step
If Ting approves, apply only the 3 proposed repairs first, then separately decide what to do with the 13 unreadable study-note fields.

## 15. Risk
Low. This is preview-only and does not alter canonical data.

---

# REBUILD HANDOFF - Session 26 (2026-07-10, D3 Batch A safety review worksheet)

## 1. Goal
Continue D3 review without applying any merge. Build a smaller safety-focused review batch from the CloudTCM DIFFER set and document a newly found canonical encoding issue.

## 2. Files changed
- `scripts/build-cloudtcm-safety-review-batch.js` (new)
- `scripts/report-361-encoding-findings.js` (new)
- `docs/CLOUDTCM_REVIEW_BATCH_A_SAFETY.md` (new)
- `docs/CLOUDTCM_REVIEW_BATCH_A_SAFETY.json` (new)
- `docs/CLOUDTCM_REVIEW_BATCH_A1_CRITICAL_SAFETY.md` (new)
- `docs/CLOUDTCM_REVIEW_BATCH_A1_CRITICAL_SAFETY.json` (new)
- `docs/CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md` (new)
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

## 3. What changed
- Generated broad Batch A safety review worksheet from D3 preview.
- Generated narrower Batch A1 critical safety subset excluding broad keyword-only matches.
- A1 focuses on explicit high-risk regions:
  - eye / face,
  - neck / medulla-adjacent,
  - chest / back / pneumothorax,
  - abdomen / pregnancy / bladder / kidney / organ-depth,
  - common pregnancy caution points.
- A1 includes 107 unique point codes for first-pass safety review.
- Discovered canonical encoding damage in `data/acupoints/361.json`: 16 damaged string fields containing literal question marks across BL61-BL67.
- Wrote `docs/CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md` as a finding only; no canonical data was repaired.

## 4. Why this changed
The previous D3 review strategy showed 553 high-risk triage items. Batch A/A1 makes the work actionable by narrowing the first review pass to safety-sensitive point groups.

## 5. Data content changes
No canonical data changed. No CloudTCM text was merged into `data/acupoints/361.json`.

## 6. Source status / accuracy guardrail
All new files are review worksheets. They do not decide source truth and do not approve merge. CloudTCM remains private study staging/reference only.

## 7. Schema / field changes
No schema changed.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- `node --check scripts/build-cloudtcm-safety-review-batch.js`: PASS
- `node --check scripts/report-361-encoding-findings.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- UTF-8 doc spot-check: PASS for new docs

## 11. Triage results
- Broad Batch A:
  - safety-related diff items: 576
  - unique point codes: 335
- Focused Batch A1:
  - unique point codes: 107
  - chest/back/pneumothorax region: 44
  - abdomen/pregnancy/organ-depth region: 42
  - eye/face region: 9
  - neck/head-risk region: 8
  - common pregnancy caution points: 8
- Canonical encoding findings:
  - damaged fields: 16
  - affected codes: BL61, BL62, BL63, BL64, BL65, BL66, BL67

## 12. Not completed
No source-review decisions were applied. No BL61-BL67 repair was applied.

## 13. Next reader should inspect
Read:
- `docs/CLOUDTCM_REVIEW_BATCH_A1_CRITICAL_SAFETY.md`
- `docs/CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md`
- `docs/CLOUDTCM_HIGH_RISK_DIFFS.md`

## 14. Next step
Recommended next step: decide whether to first repair BL61-BL67 encoding damage in a tiny gated patch, or start A1 safety review point-by-point.

## 15. Risk
Low. This is docs-only plus read-only helper scripts; no canonical data was changed.

---

# REBUILD HANDOFF - Session 25 (2026-07-10, D3 CloudTCM review strategy docs)

## 1. Goal
Continue after Ting approved moving past the D3 preview, but do not apply any merge. Convert the large CloudTCM DIFFER set into a safer human-review strategy and high-risk triage document.

## 2. Files changed
- `scripts/analyze-cloudtcm-diffs.js` (new helper script)
- `docs/CLOUDTCM_REVIEW_STRATEGY.md` (new)
- `docs/CLOUDTCM_HIGH_RISK_DIFFS.md` (new)
- `docs/REBUILD_HANDOFF.md`

## 3. What changed
- Added a read-only analyzer for `docs/CLOUDTCM_MERGE_PREVIEW.json`.
- Generated a review strategy document explaining why `--apply-approved` should not be run yet: D3 preview has `FILL = 0`, so there are no empty canonical fields to fill.
- Generated a high-risk diff triage document that highlights differences involving:
  - needling depth / direction,
  - location numeric landmarks,
  - safety wording such as pneumothorax, eye, neck vessel, pregnancy, bleeding, organ-depth cautions,
  - contraindication wording differences.

## 4. Why this changed
The D3 preview contains 1453 DIFFER items. Applying would not write anything because there are no fill candidates, and bulk replacement would be unsafe. The next useful step is source-review triage, not merge.

## 5. Data content changes
No canonical data changed. No CloudTCM text was merged into `data/acupoints/361.json`.

## 6. Source status / accuracy guardrail
CloudTCM remains private study staging/reference only. The new documents do not decide which source is correct; they only prioritize human review.

## 7. Schema / field changes
No schema changed.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- `node --check scripts/analyze-cloudtcm-diffs.js`: PASS
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS

## 11. Triage results
- Total DIFFER records: 1453
- High-risk triage items: 553
- Medium-risk triage items: 15
- Low-risk wording differences: 189
- Reference-only prose differences: 696

By field:
- `location_zh`: high 193, medium 10, low 157
- `needling`: high 322, low 32
- `functions_zh`: reference 348
- `indications_zh`: reference 348
- `contraindications`: high 38, medium 5

## 12. Not completed
No review decisions were applied. No source_checked upgrade was performed.

## 13. Next reader should inspect
Read:
- `docs/CLOUDTCM_REVIEW_STRATEGY.md`
- `docs/CLOUDTCM_HIGH_RISK_DIFFS.md`
- `docs/CLOUDTCM_MERGE_PREVIEW.json`

## 14. Next step
Recommended next step: choose a small human-review batch, for example eye/neck/chest/abdomen safety points or BL back-shu points, then decide point-by-point whether current canonical text, CloudTCM text, or a rewritten verified note should be kept.

## 15. Risk
Low. This is docs-only plus a read-only analysis helper; no canonical data was changed.

---

# REBUILD HANDOFF - Session 24 (2026-07-10, D1-D2 CloudTCM point import staging)

## 1. Goal
Run CODEX_TASK_QUEUE D1 + D2 on local main after pulling the merged `a8cdb21`: fetch all 361 CloudTCM acupoint raw pages into private staging, then distill them into a draft staging file and coverage report. Do not merge into `data/acupoints/361.json`.

## 2. Files changed
- `scripts/transform-cloudtcm-points.js`
- `data/imports/cloudtcm/points/*.json` (361 raw private staging files)
- `data/imports/cloudtcm/fetch_manifest.json`
- `data/imports/cloudtcm/staging_points.json`
- `data/imports/cloudtcm/coverage_report.json`
- `docs/REBUILD_HANDOFF.md`
- `PROJECT_LOG.md`

## 3. What changed
- Confirmed local `main` was updated to commit `a8cdb21`.
- Ran D1 probe: `node scripts/fetch-cloudtcm-points.js --limit 5`; result 5/361 raw files, 0 failures.
- Inspected `LU1` raw JSON and found CloudTCM data under `pageProps.pageData`.
- Updated `scripts/transform-cloudtcm-points.js` field candidates for CloudTCM's real keys: `AcuNameCH`, `AcuNameEN`, `AcuCode`, `Location`, `Detail`, `Acumethod`, `Caution`, `NameIntroCH`.
- Added HTML-to-text cleanup in transform output.
- Preserved canonical file-based point code (`LU1`) and stored CloudTCM's padded code (`LU01`) as `cloudtcm_code`.
- Ran full D1 fetch: 361/361 raw point JSON files present, 0 failures.
- Ran full D2 transform: 361 staging records written.

## 4. Why this changed
D1-D2 are the staging-only bulk import steps before the gated D3 merge preview. They create private raw and distilled CloudTCM staging data without altering canonical acupoint data or runtime generated files.

## 5. Data content changes
No canonical data was changed. All imported CloudTCM text remains under `data/imports/cloudtcm/` as private draft staging.

## 6. Source status / accuracy guardrail
All staged records are:
- `review_status: "draft"`
- `source_status: "cloudtcm_import_pending_review"`
- per-record `source_url`

CloudTCM text is private study staging only and must not be republished. D3 must be a separate approval-gated merge preview before any canonical data change.

## 7. Schema / field changes
No runtime schema changed. Transform output includes `cloudtcm_id` and `cloudtcm_code` while preserving the canonical `code`.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- D1 probe fetch: PASS, 5/361, 0 failures.
- D1 full fetch: PASS, 361/361 raw files present, 0 failures.
- D2 transform: PASS, 361 staged records, 0 unmatched files.
- Coverage:
  - `name_zh`: 361/361
  - `pinyin`: 361/361
  - `name_en`: 361/361
  - `code`: 361/361
  - `location_zh`: 361/361
  - `technique_zh`: 361/361
  - `description_zh`: 361/361
  - `functions_zh`: 348/361
  - `indications_zh`: 348/361
  - `cautions_zh`: 44/361
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `data/**/*.json` parse check: PASS, 439 JSON files

## 11. Completed batch
D1 and D2 are complete.

## 12. Not completed
D3 merge into `data/acupoints/361.json` was not started. It remains gated and must produce a preview/diff summary for Ting approval before apply.

## 13. Next reader should inspect
Inspect:
- `data/imports/cloudtcm/fetch_manifest.json`
- `data/imports/cloudtcm/coverage_report.json`
- `data/imports/cloudtcm/staging_points.json`
- `scripts/transform-cloudtcm-points.js`

## 14. Next step
Recommended next step: D3 gated preview only. Write `scripts/merge-cloudtcm-preview.js`, map staging zh fields into the 361 schema, never overwrite non-empty canonical values, produce a diff summary, and stop for Ting approval.

## 15. Risk
Low. This is staging-only and validators pass. Content risk remains because CloudTCM text is not yet reviewed or authorized for public use.

---

# REBUILD HANDOFF - Session 23 (2026-07-08, D5 remaining needling/EN batches complete)

## 1. Goal
Continue D5 after BL and complete the remaining fill-empty-only batches: KI, SP, SI, and the final small remainders.

## 2. Files changed
- `data/acupoints/361.json`
- `data/imports/model_draft/enrichment/applied/bl_enrichment.json`
- `data/imports/model_draft/enrichment/applied/ki_enrichment.json`
- `data/imports/model_draft/enrichment/applied/sp_enrichment.json`
- `data/imports/model_draft/enrichment/applied/si_enrichment.json`
- `data/imports/model_draft/enrichment/applied/final_tail_enrichment.json`
- `docs/361_DRAFT_FILL_SUMMARY.md`
- `docs/REBUILD_HANDOFF.md`

## 3. What changed
- Archived applied enrichment batches under `data/imports/model_draft/enrichment/applied/` so future dry-runs do not re-read already-applied batches and report expected conflicts.
- KI batch filled 27 empty fields across 27 records:
  - `needling`: 27
- SP batch filled 27 empty fields across 21 records:
  - `needling`: 21
  - `location_en`: 2
  - `functions_en`: 2
  - `indications_en`: 2
- SI batch filled 22 empty fields across 19 records:
  - `needling`: 19
  - `location_en`: 1
  - `functions_en`: 1
  - `indications_en`: 1
- Final tail batch filled 127 empty fields across 43 records:
  - `needling`: 43
  - `location_en`: 28
  - `functions_en`: 28
  - `indications_en`: 28

## 4. Why this changed
D5 aims to close the remaining empty needling and English field gaps in existing `361.json` records using the safe no-overwrite enrichment pipeline.

## 5. Data content changes
Added draft needling/safety text and selected English study fields only. Existing non-empty fields were not overwritten.

## 6. Source status / accuracy guardrail
All fills remain `model_draft_pending_source_review` and are pending CloudTCM D1-D3 plus WHO SAPL review. No record was promoted to source-checked.

## 7. Schema / field changes
No schema changed. The apply script only fills allowed fields and adds `enrichment_status` to touched records.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not hand-edit `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- KI dry-run: PASS, 27 fillable fields, 0 conflicts; apply PASS.
- SP dry-run: PASS, 27 fillable fields, 0 conflicts; apply PASS.
- SI dry-run: PASS, 22 fillable fields, 0 conflicts; apply PASS.
- Final tail dry-run: PASS, 127 fillable fields, 0 conflicts; apply PASS.
- Final D5 gap check: PASS, 0 remaining gaps for `needling`, `location_en`, `functions_en`, `indications_en` across all 361 records.
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `data/**/*.json` parse check: PASS, 71 JSON files

## 11. Completed batch
D5 is complete for BL, KI, SP, SI, and the remaining tail records.

## 12. Not completed
No source-check promotion was done. These are draft fills only.

## 13. Next reader should inspect
Inspect `docs/361_DRAFT_FILL_SUMMARY.md` and the applied batch files under `data/imports/model_draft/enrichment/applied/`.

## 14. Next step
Recommended next step: decide whether to run `scripts/build-data.js` in a separate approved session if the runtime/generated data should reflect the updated `361.json`.

## 15. Risk
Low-medium. The fill-empty-only script reported 0 conflicts for every batch and D5 gaps are closed, but needling and English content remain draft pending authoritative review.

---

# REBUILD HANDOFF - Session 22 (2026-07-08, D5 BL needling/EN fill)

## 1. Goal
Run Codex Task Queue D5 for the BL channel only: fill remaining empty `needling` and selected English fields in existing `data/acupoints/361.json` records using the fill-empty-only enrichment pipeline.

## 2. Files changed
- `docs/CODEX_TASK_QUEUE.md` (copied from Claude branch so the task queue exists locally)
- `scripts/apply-361-enrichment.js` (copied from Claude branch so the D5 pipeline exists locally)
- `data/imports/model_draft/enrichment/bl_enrichment.json` (new BL batch)
- `data/acupoints/361.json`
- `docs/361_DRAFT_FILL_SUMMARY.md`
- `docs/REBUILD_HANDOFF.md`

## 3. What changed
- Ran the D5 BL gap command before writing the batch.
- Added BL-only enrichment records for the exact fields listed by the gap command.
- Filled 87 empty fields across 60 BL records:
  - `needling`: 60
  - `location_en`: 9
  - `functions_en`: 9
  - `indications_en`: 9
- BL10, BL13, BL17, BL20, BL23, BL25, BL32, BL40, and BL60 received the missing EN triple.
- BL11-BL30 first-line back-shu region entries include oblique needling wording and pneumothorax warning language as required by D5.
- Each touched 361 record received `enrichment_status: "model_draft_pending_source_review"` from the apply script.

## 4. Why this changed
D5 is the safe, fill-empty-only path to complete missing needling and English fields in the canonical 361 file without overwriting existing values.

## 5. Data content changes
Added draft needling/safety text and selected English study fields only. Existing non-empty fields were not overwritten.

## 6. Source status / accuracy guardrail
All BL fills are model drafts pending source review against CloudTCM D1-D3 and WHO SAPL. No record was promoted to `source_checked`.

## 7. Schema / field changes
No schema changed. The apply script only writes allowed fields and `enrichment_status` when a record receives a fill.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not hand-edit `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS, or `legacy/`.

## 10. Validation
- D5 BL dry-run: PASS, 87 fillable fields across 60 records, 0 conflicts.
- D5 BL apply: PASS, 87 fields filled across 60 records.
- Post-apply BL gap check: PASS, no remaining BL gaps for `needling`, `location_en`, `functions_en`, `indications_en`.
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-herb-canon.js`: PASS
- `data/**/*.json` parse check: PASS, 67 JSON files

## 11. Completed batch
BL channel D5 batch is complete.

## 12. Not completed
D5 remaining channel batches are still pending: KI, SP, SI, then small remainders.

## 13. Next reader should inspect
Inspect `data/imports/model_draft/enrichment/bl_enrichment.json`, `docs/361_DRAFT_FILL_SUMMARY.md`, and a few BL records in `data/acupoints/361.json`, especially BL11-BL30 needling safety wording.

## 14. Next step
Run the same D5 workflow for KI next: gap command with `^KI`, write `ki_enrichment.json`, dry-run confirm 0 conflicts, apply, validate, and handoff as a separate session.

## 15. Risk
Low-medium. The apply script enforces fill-empty-only and reported no conflicts, but needling text remains draft pending authoritative source review.

---

# REBUILD HANDOFF - Session 21 (2026-07-05, Codex herb canon validation layer)

## 1. Goal
Continue safely while Ting/Claude are unavailable by strengthening the single-herb draft layer without changing protected runtime code or promoting any draft content.

## 2. Files changed
- `scripts/validate-herb-canon.js` (new)
- `docs/REBUILD_HANDOFF.md`
- `data/herbs/herb_canon_shortlist.json` remains the active draft data file from Sessions 19-20

## 3. What changed
- Added a dedicated herb canon validator for `data/herbs/herb_canon_shortlist.json`.
- The validator checks required top-level fields, required per-herb fields, ID format, duplicate IDs, likely mojibake, pending UTF-8 repair markers, draft-only review status, English/Chinese track structure, non-empty draft arrays, safety flags, and `related_formulas` links against `formula_canon_shortlist.json`.
- The validator intentionally fails if any staging record is promoted beyond `draft` before source review.

## 4. Why this changed
The existing validators passed, but none of them specifically protected the new 202-herb shortlist from future missing fields, broken formula links, accidental `source_checked` promotion, or Windows encoding damage. This adds a guardrail before more Materia Medica content is added.

## 5. Data content changes
No herb facts were changed in this session. This session added validation coverage only.

## 6. Source status / accuracy guardrail
All herb records remain draft/source-review pending. No Bensky, CloudTCM, or institutional Chinese source verification was performed in this session.

## 7. Schema / field changes
No runtime schema changed. This is a script-level validator for the staging shortlist.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, or `scripts/validate-data.js` IGNORED_FIELDS.

## 10. Validation
- `scripts/validate-herb-canon.js`: PASS
  - herbs: 202
  - categories: 34
  - related formula links checked: 407
  - safety flags checked: 409
  - modern-use tags checked: 587
  - warnings: 0
  - failures: 0
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `data/**/*.json` parse check: PASS, 66 JSON files

## 11. Completed categories
No new herb categories were filled in this session; all 202 herbs were already draft-filled in Session 20.

## 12. Not completed
- The new validator is not yet wired into any one-click script or README command list.
- Herb content remains draft and source-review pending.

## 13. Next reader should inspect
Review `scripts/validate-herb-canon.js` and decide whether it should become part of the standard validation checklist after every herb-data edit.

## 14. Next step
Recommended next step: run `node scripts/validate-herb-canon.js` after all future edits to `data/herbs/herb_canon_shortlist.json`, then select a small high-yield herb subset for real source-checking.

## 15. Risk
Low. This adds a read-only validation script and does not affect app runtime.

---

# REBUILD HANDOFF - Session 20 (2026-07-04, Codex single herb full draft fill)

## 1. Goal
Continue the CH / Materia Medica autonomous batch: repair the 32 pending Chinese-name/category records, then fill the remaining single-herb shortlist records with conservative draft study scaffolding. No commit was made.

## 2. Files changed
- `data/herbs/herb_canon_shortlist.json`
- `docs/REBUILD_HANDOFF.md`

## 3. What changed
- Repaired all 32 records previously marked `pending_utf8_repair` / `pending_chinese_label_repair`.
- Removed the pending repair markers after standard Chinese names and Chinese category labels were restored.
- Filled the remaining 127 skeleton-only records with draft study fields.
- Current file status:
  - Total herbs: 202
  - English draft track: 202
  - Chinese draft track: 202
  - `source_checked`: 0
  - Pending UTF-8 repair markers: 0
  - Broken `related_formulas` links: 0

## 4. Why this changed
Ting wants the single-herb layer to become useful for CH study and future formula/herb/search connections. This batch turns the whole 202-herb shortlist into a complete draft scaffold while keeping source verification honest.

## 5. Data content changes
- Filled draft `properties_taste_temp`, `functions`, `clinical_use_note`, `modern_use_tags`, `related_formulas`, and `safety_flags` for the previously empty records.
- Added conservative `english_exam_track` and `chinese_depth_track` objects for all remaining records.
- Added safety review flags for pregnancy, toxicity, anticoagulants, active bleeding, urgent red flags, dose/preparation, incompatibility, dehydration/electrolyte review, and related contexts where appropriate.

## 6. Source status / accuracy guardrail
No Bensky text, CloudTCM herb page text, or institutional herb monograph was directly verified in this session. Therefore every record remains draft:
- Main record: `review_status: "draft"`
- English track: `source_status: "bensky_review_pending"`
- Chinese track: `source_status: "cloudtcm_or_institution_review_pending"`

Modern tags and clinical notes are documentation/search context only. They are not treatment claims.

## 7. Schema / field changes
No runtime schema changed. `data/herbs/single_herbs.json` remains unchanged; this work is still a canon shortlist/staging file.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`. A temporary one-off fill script was used and then removed before handoff.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, or `scripts/validate-data.js` IGNORED_FIELDS.

## 10. Validation
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `data/**/*.json` parse check: PASS, 66 JSON files
- Single-herb self-check: PASS, 202/202 English tracks, 202/202 Chinese tracks, 0 source_checked, 0 pending UTF-8 repairs, 0 broken formula links

## 11. Completed categories
The file now has draft scaffolding across all 34 category labels represented in the 202-herb shortlist, including wind-damp, dampness, drain dampness, warm interior, regulate qi, food stagnation, parasites, bleeding, blood stasis, phlegm/cough/wheeze, open orifices, extinguish wind, calm spirit, tonify qi/blood/yin/yang, stabilize/bind, and downward-directing herbs/minerals.

## 12. Not completed
- No herb has been source-checked against Bensky yet.
- No CloudTCM or institutional Chinese herb source has been directly cross-checked yet.
- Draft content is category-level scaffolding, not final monograph-quality herb detail.
- Dosage ranges were intentionally not added.

## 13. Next reader should inspect
Review `data/herbs/herb_canon_shortlist.json` for:
- repaired Chinese names/categories,
- safety flags,
- related formula links,
- whether category-level draft wording is useful enough for Ting's study workflow.

## 14. Next step
Recommended next step: select 20 to 30 highest-yield herbs from formulas Ting is actively studying, then source-check those against Bensky and CloudTCM/institutional Chinese sources one by one before promoting any record beyond draft.

## 15. Risk
Medium. The file is internally consistent and validators pass, but content remains draft and source-review pending. It should support search/study scaffolding, not canonical clinical use.

---

# REBUILD HANDOFF - Session 19 (2026-07-04, Codex single herb 1-hour draft batch)

## 1. Goal
Run Ting's autonomous CH / Materia Medica batch: expand the single-herb canon shortlist and draft-fill the first five priority categories without touching protected runtime areas or existing formal data files.

## 2. Files changed
- `data/herbs/herb_canon_shortlist.json`
- `docs/REBUILD_HANDOFF.md`

## 3. What changed
- Expanded the single-herb shortlist from 170 to 202 draft records.
- Filled draft dual-track study fields for 75 herbs across the first five requested categories:
  - Release Exterior: 21 herbs
  - Clear Heat: 23 herbs
  - Tonify Qi: 9 herbs
  - Tonify Blood: 7 herbs
  - Invigorate Blood: 15 herbs
- Added draft `english_exam_track` and `chinese_depth_track` objects where content was filled.
- Added draft functions, properties/taste/temp, conservative modern use tags, clinical notes, related formula IDs where appropriate, and safety flags where needed.

## 4. Why this changed
`data/herbs/single_herbs.json` is still empty, while CH / Materia Medica is a core NCCAOM study area and is needed to connect formulas, safety, and future search. This gives Ting a reviewable draft base without changing runtime data.

## 5. Source status / accuracy guardrail
Ting requested Bensky-checked English content, but no local Bensky source text was available to verify against. Therefore Codex did not mark any herb as `source_checked`.

Current status:
- Total records: 202
- Draft-filled records: 75
- `source_checked` records: 0
- English track status: `bensky_review_pending`
- Chinese track status: `cloudtcm_or_institution_review_pending`

## 6. Data content changes
The 75 filled herbs have conservative study wording only. Modern-use tags are search/support tags, not efficacy claims. Chinese-depth notes remain draft pending CloudTCM or institutional-source review.

## 7. Schema / field changes
No runtime schema changed. This is still a new shortlist/staging file only; `data/herbs/single_herbs.json` remains unchanged.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, or `scripts/validate-data.js` IGNORED_FIELDS.

## 10. Validation
- Category batch validation after Release Exterior: PASS
- Category batch validation after Clear Heat: PASS
- Final validation after Tonify Qi, Tonify Blood, and Invigorate Blood: PASS
- UTF-8 repair check: PASS, no literal `?` corruption remains
- `data/**/*.json` parse check: PASS, 66 JSON files
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS

## 11. Shortlist scope
The 202 records cover the main NCCAOM/Bensky-style Materia Medica categories: release exterior, clear heat, drain downward, dispel wind-damp, transform dampness, drain dampness, warm interior, regulate qi, relieve food stagnation, expel parasites, stop bleeding, invigorate blood, transform phlegm/stop cough, calm spirit, open orifices, extinguish wind, tonify qi/blood/yin/yang, stabilize/bind, and selected minerals/topical substances.

## 12. Not completed
- 127 herbs remain skeleton-only.
- No record is Bensky source-verified yet.
- No CloudTCM/institutional Chinese-source verification has been completed yet.
- 32 expanded records have `chinese_name_status: "pending_utf8_repair"` and `category_status: "pending_chinese_label_repair"` because a Windows console encoding issue damaged Chinese labels during expansion; their IDs and English categories were preserved.

## 13. Next reader should inspect
Start with `data/herbs/herb_canon_shortlist.json`, especially the 75 filled records and the 32 records marked for Chinese-label repair.

## 14. Next step
Ting should review whether the 202-herb scope is acceptable, then either:
- repair the 32 pending Chinese labels first, or
- continue content filling for the next categories while keeping all records draft until Bensky/CloudTCM/institutional verification is available.

## 15. Risk
Medium-low. Runtime data is untouched, but the new shortlist contains draft educational content and 32 records need Chinese-label repair before study use.

---

# REBUILD HANDOFF - Session 18 (2026-07-04, Codex single herb canon shortlist)

## 1. Goal
Start a clean CH / Materia Medica block without touching the formula review work: create a single-herb skeleton shortlist for Ting review before filling content.

## 2. Files changed
- `data/herbs/herb_canon_shortlist.json` (new)
- `docs/REBUILD_HANDOFF.md`

## 3. What changed
- Added 170 draft single-herb skeleton records.
- Each record includes: `id`, `name_zh`, `name_en`, `pinyin`, `category`, `channels_entered`, `source_hint`, `review_status`, `properties_taste_temp`, `functions`, `related_formulas`, `safety_flags`, `clinical_use_note`, and `modern_use_tags`.
- Empty content fields were intentionally left empty: `properties_taste_temp`, `functions`, `clinical_use_note`, `modern_use_tags`.

## 4. Why this changed
`data/herbs/single_herbs.json` is still empty, but single herbs are a core NCCAOM CH / Materia Medica study area and the foundation of formula understanding. This mirrors the successful formula workflow: skeleton first, Ting review second, content later.

## 5. Data content changes
No single-herb functions, indications, dosages, modern clinical claims, or source_checked content were added. This is only a draft scope/category/channel skeleton.

## 6. Schema / field changes
No runtime schema changed. This is a new shortlist file only; `data/herbs/single_herbs.json` remains unchanged.

## 7. Review status
All 170 records are `review_status: "draft"`. Nothing is `source_checked`.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, or `scripts/validate-data.js` IGNORED_FIELDS.

## 10. Validation
- Skeleton field check: PASS, 170 records, missing required skeleton fields 0
- `data/**/*.json` parse check: PASS, 66 JSON files
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS

## 11. Shortlist scope
The 170 records cover the main Bensky/NCCAOM-style categories: release exterior, clear heat, drain downward, dispel wind-damp, transform dampness, drain dampness, warm interior, regulate qi, relieve food stagnation, stop bleeding, invigorate blood, transform phlegm/stop cough, open orifices, extinguish wind, tonify qi/blood/yin/yang, calm spirit, stabilize/bind, and downward-directing minerals/herbs.

## 12. Not completed
No functions, properties/taste/temp, dosage, detailed safety, or modern use tags were filled. No CloudTCM herb IDs were mapped yet.

## 13. Next reader should inspect
Start with `data/herbs/herb_canon_shortlist.json` and review whether the 170-herb scope/category/channel skeleton matches Ting's NCCAOM study priority.

## 14. Next step
After Ting approves the scope, fill a smaller pilot group first (for example 20 high-yield herbs that appear in the 23 formula pilot), using English Bensky/source-checked track only if source material is available and Chinese CloudTCM/institutional notes as draft.

## 15. Risk
Low. This is a new draft shortlist only and does not affect runtime data. Category/channel entries should still be reviewed before content filling.

---

# REBUILD HANDOFF - Session 17 (2026-07-04, Codex 23 formula draft dual-track fill)

## 1. Goal
Follow `docs/FORMULA_SCHEMA_RULES.md`: first confirm the 115-formula shortlist has stable IDs, `tier: "core"`, and `comparison_group`; then fill only the existing 23 formulas as a pilot.

## 2. Files changed
- `data/herbs/formula_canon_shortlist.json`
- `data/herbs/formulas.json`
- `docs/REBUILD_HANDOFF.md`

## 3. What changed
- Confirmed all 115 shortlist records already have `id`, `tier: "core"`, and `comparison_group`; no mechanical fixes were needed.
- Added draft dual-track content to the 23 existing canonical formula records: composition pinyin list, actions, pattern indications, common modifications, contraindications, modern clinical use tags, related condition IDs, and separate `english_exam_track` / `chinese_depth_track` objects.
- Added matching `modern_clinical_use_tags`, `related_conditions`, `clinical_use_note`, and source status to the corresponding 23 shortlist records.

## 4. Source status correction
Ting asked for Bensky source_checked English exam content, but no local Bensky text or Ting-approved school notes were available in this session. Therefore the 23 records were not marked `source_checked`.

All 23 remain:
- `review_status: "draft"`
- `source_status: "bensky_review_pending_chinese_source_draft"`
- `english_exam_track.source_status: "bensky_review_pending"`
- `chinese_depth_track.source_status: "chinese_source_draft_hkbu_cloudtcm_review_pending"`

## 5. Data content changes
The 23 formula pilot now has search/study tags for modern contexts such as `pms`, `ibs`, `insomnia`, `dysmenorrhea`, `infertility`, `gerd`, `cough`, `chronic_fatigue`, and related ID links where existing condition/pattern IDs were available.

## 6. Schema / field changes
Added fields to formula records only:
- `modern_clinical_use_tags`
- `related_conditions`
- `pattern_indications_en`
- `pattern_indications_zh`
- `source_status`
- `english_exam_track`
- `chinese_depth_track`

## 7. Review status
No formula was upgraded to `source_checked`. The content is a draft pilot for Ting review, not publish-ready and not clinical advice.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, or `scripts/validate-data.js` IGNORED_FIELDS.

## 10. Validation
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-relations.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `data/**/*.json` parse check: PASS, 65 JSON files

## 11. Pilot list for Ting review
The 23 filled pilot formulas are: Gui Zhi Tang, Ma Huang Tang, Yin Qiao San, Sang Ju Yin, Xiao Chai Hu Tang, Xiao Yao San, Jia Wei Xiao Yao San, Si Jun Zi Tang, Liu Jun Zi Tang, Bu Zhong Yi Qi Tang, Gui Pi Tang, Si Wu Tang, Ba Zhen Tang, Liu Wei Di Huang Wan, Jin Gui Shen Qi Wan, Tian Wang Bu Xin Dan, Long Dan Xie Gan Tang, Ban Xia Xie Xin Tang, Er Chen Tang, Ping Wei San, Wen Jing Tang, Tao Hong Si Wu Tang, Xue Fu Zhu Yu Tang.

## 12. Not completed
No Bensky source verification was performed. CloudTCM/HKBU individual formula page verification still needs a follow-up pass before any `source_checked` upgrade.

## 13. Next reader should inspect
Start with the 23 records in `data/herbs/formulas.json` and compare `english_exam_track` against Bensky/Formulas & Strategies or Ting-approved notes.

## 14. Next step
Ting reviews the 23 tags/related condition links. After approval, either (a) provide Bensky/school source material for source checking, or (b) expand draft tags to the remaining 92 core formulas without upgrading source status.

## 15. Risk
Medium. This adds draft educational formula content, so source status must remain visible. The main safety control is that no record is marked source_checked and wording is conservative.

---

# REBUILD HANDOFF - Session 16 (2026-07-03, Codex dataset foundation staging)

## 1. Goal
Start the dataset-first expansion workflow after Ting approval: create `data/imports`, an import manifest, and formula staging without overwriting canonical data.

## 2. Files changed
- `data/imports/README.md` (new)
- `data/imports/import_manifest.json` (new)
- `data/herbs/formula_import_staging.json` (new)
- `PROJECT_LOG.md`
- `docs/REBUILD_HANDOFF.md`

## 3. What changed
- `data/imports/README.md`: defines raw import rules and states that no raw dataset files have been downloaded yet.
- `import_manifest.json`: records candidate source IDs, URLs, license/access status, download status, target area, and safety policy.
- `formula_import_staging.json`: defines the safe formula staging layer: existing 23 formulas as the pilot batch, 115 formula canon records as expansion target, target fields, review rules, and merge requirements.
- `PROJECT_LOG.md` / `REBUILD_HANDOFF.md`: records the staging task and validation.

## 4. Why this changed
Ting approved moving from manual page-by-page distillation to the safer workflow: dataset foundation first, institution/textbook review second, agent gap-filling last.

## 5. Data content changes
No production formula content was imported. No existing formula record was changed. New files are staging/manifest only.

## 6. Schema / field changes
No runtime schema change. The staging file defines future target fields only; it does not change `data/herbs/formulas.json`.

## 7. Review status
All future imported material defaults to `draft` and `dataset_import_pending_review`. Nothing is `source_checked`.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js`, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, or `scripts/validate-data.js` IGNORED_FIELDS.

## 10. Validation
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-relations.js`: PASS
- `data/**/*.json` parse check: PASS, 65 JSON files

## 11. Source / license status
No raw downloads yet. `import_manifest.json` marks Mengqi97 as an index source, Tianchi TCM-NER / TCM-QG terms as pending Ting review, and the bulk formula knowledge-base candidate as blocked until exact source URL and terms are confirmed.

## 12. Not completed
No dataset was downloaded. No formula content was transformed into staging records. No merge into canonical formula files.

## 13. Next reader should inspect
Start with `data/imports/import_manifest.json` and `data/herbs/formula_import_staging.json`.

## 14. Next step
Confirm exact formula knowledge-base source URL and license/access terms. After approval, place raw files under `data/imports/<source>/`, record file hashes, and generate staging records only.

## 15. Risk
Low. This is staging-only and does not affect runtime data. Main risk is future licensing/source ambiguity, so raw download is intentionally blocked until reviewed.

---

# REBUILD HANDOFF - Session 15 (2026-07-03, Codex Friday relation validation layer)

## 1. Goal
Build the formal relation-validation layer for the pathology graph, western medications, fertility workflows, and clinical decision links. This is cross-reference integrity work, not a treatment-plan expansion.

## 2. Files changed
- `scripts/validate-relations.js` (new)
- `data/clinical_cases/clinical_decision_links.json` (new)
- `data/pathology/conditions.json`
- `data/pathology/condition_graph_expansion.json`
- `data/clinical_cases/fertility_workflow_seed.json`
- `PROJECT_LOG.md`
- `docs/REBUILD_HANDOFF.md`

## 3. What changed in each file
- `validate-relations.js`: checks that western condition, TCM pattern, formula, western medication, acupoint, fertility workflow/review prompt, safety flag, and related formula IDs exist; broken links exit 1; success prints a count summary.
- `clinical_decision_links.json`: registers 17 fertility review-prompt IDs used by formula-pattern links.
- `conditions.json` / `condition_graph_expansion.json`: added 6 fertility-related western documentation-context nodes and 3 TCM pattern review-prompt nodes with conservative relationships.
- `fertility_workflow_seed.json`: normalized `DU20` to the existing acupoint code `GV20`.
- `PROJECT_LOG.md` / `REBUILD_HANDOFF.md`: recorded this task, validation, and handoff notes.

## 4. Why this changed
Friday's task was to make database links stable before future search or UI work connects modern conditions, formulas, patterns, medications, acupoints, and fertility workflows by ID instead of loose text.

## 5. Data content changes
New content is relationship structure and review-prompt registry data only. All new content remains draft / source-review pending / not medical advice. No efficacy claim, treatment protocol, or TCM-pattern replacement for biomedical diagnosis was added.

## 6. Schema / field changes
No runtime schema was changed. The new validator reads existing relation fields such as `medication_links`, `workflow_links`, `related_eastern_diseases`, `related_tcm_patterns`, `seed_acupoints`, `seed_formulas`, `formula_id`, `pattern_ids`, `western_condition_ids`, `acupoint_seed_codes`, `fertility_workflow_links`, and `related_formulas`.

## 7. Review status
All added or strengthened relation data remains `draft`, `draft_relation_registry_not_medical_advice`, or `source-review pending`. Nothing was upgraded to `source_checked`.

## 8. Generated files / scripts
Did not run `scripts/build-data.js`. Did not modify `data/generated/*`.

## 9. Protected areas
Did not modify protected areas: `app.js` case/soap/cloudtcm/search logic, `js/router.js`, `js/knowledge.js`, `styles.css` point-detail-mode, `data/generated/*`, `data/sources/cloudtcm_point_map.json`, or `scripts/validate-data.js` IGNORED_FIELDS.

## 10. Validation
- `scripts/validate-data.js`: PASS
- `scripts/validate-interactions.js`: PASS
- `scripts/validate-herbal-links.js`: PASS
- `scripts/validate-relations.js`: PASS
- `data/**/*.json` parse check: PASS, 63 JSON files

## 11. Relation validator summary
`validate-relations.js` checked: 12 western conditions, 6 eastern diseases, 9 TCM patterns, 115 formulas, 12 western medications, 237 acupoint codes, 21 fertility workflow/review prompt IDs.

Checked links: 149 acupoint links, 69 formula links, 105 medication links, 28 pattern links, 370 related formula links, 31 safety flag links, 21 western condition links, 68 western-to-eastern links, 98 western-to-pattern links, 50 workflow links.

## 12. Not completed
No source review was performed and no UI display was added. `clinical_graph_seed.json` remains an older seed reference file; the validator only uses it for existing seed ID collection and validation.

## 13. Next reader should inspect
Start with `scripts/validate-relations.js` and `data/clinical_cases/clinical_decision_links.json`. After adding any condition / pattern / formula / medication / acupoint / workflow link, run the relation validator.

## 14. Next step
Before exposing these links in the UI, design the display language as related documentation context only. Another safe next batch is adding western-medication relationship metadata, still as draft.

## 15. Risk
Low to medium. This adds data relationships and a validator without touching app logic. `conditions.json` and `condition_graph_expansion.json` were structurally rewritten, so their diffs are larger. JSON parse and all four validators passed.

---

# REBUILD HANDOFF — Session 12 (2026-07-03, Claude)：病例欄位補強

## 目標
依 Ting 要求補病歷欄位（出生年月、婦科史、生活習慣、目標、生命徵象、治療手法）。

## 修改（只動 app.js + index.html）
- 病人夾層新增：birthYearMonth（type=month，年+月無日）、goals、menstrualObHistory、lifestyle。
  （sex/occupation/historyPresent/pastHistory/allergies/currentMeds 前一 session 已加）
- 看診層新增：vitals（生命徵象）、modalities（治療手法：艾灸/電針/拔罐/刮痧/推拿）。
- normalizeClinicalCase / normalizeSoapNote / open*Editor / save*FromForm / render 全部同步。
- birthYear 由 birthYearMonth 自動導出（向後相容）。

## 驗證
- node --check app.js PASS
- jsdom：新欄位存在 + 建案例/SOAP + 渲染 → 全過（13/13）
- validate-data.js 681 deep-equal PASS、validate-interactions.js 0 failures

## 未完成 / 下一步（Claude）
- 病例內穴位/方劑連結做成可點擊 → 跳知識庫（連接資料庫研究病例）。

## 給 Codex
勿改 app.js case/soap 區塊與 index.html caseDialog/soapDialog。

---

# REBUILD HANDOFF — Session 11 (2026-07-03, Claude)：病例表單改成中醫結構

## 目標
病例登入不符合中醫慣例（缺舌脈證治、案例夾與看診層混淆）。依 docs/TCM_CASE_SPEC.md 重構表單。

## 修改檔案（只動這兩個 + CSS，未碰 data/herbs/ 或 Codex 檔）
- app.js：normalizeClinicalCase 加 sex/occupation/historyPresent/pastHistory/allergies/currentMeds；
  normalizeSoapNote 加 tongueBody/tongueCoating/pulse/tcmPattern/pathomechanism/treatmentPrinciple/advice；
  openCaseEditor/openSoapEditor fallback、saveCaseFromForm/saveSoapFromForm、renderClinicalCaseDetail、
  renderSoapNoteCard 全部同步。
- index.html：caseDialog 加基本資料+現病史+既往史+過敏+用藥；soapDialog 加結構化舌質/舌苔/脈象、
  本次證型、病機、治法、醫囑。
- styles.css：.tcm-dx-row（舌脈證顯示列）。

## 原則
- 案例夾（穩定）與看診（每次變）分層；舌脈證放看診層。
- 全部欄位向後相容（default ""），舊病例 localStorage(acuting-clinical-cases-v1) 照常載入。

## 驗證
- node --check app.js PASS
- jsdom：13 新欄位存在、建案例+SOAP、舌脈治法正確渲染 → 全過
- validate-data.js PASS（681 deep-equal）、validate-interactions.js 0 failures
- CSS 大括號平衡

## 未完成 / 下一步
- 「新病人初診」合併流程（建案例+第一診一次做）尚未做，屬 UX polish。
- 病例內穴位/方劑連結尚未可點擊（連知識庫）— 下一步高價值項。

## 給 Codex
勿改 app.js 的 case/soap 區塊與 index.html 的 caseDialog/soapDialog。你的方劑 canon 工作不受影響。

---

# REBUILD HANDOFF — Session 14 (2026-07-03, Codex case/SOAP flow review)

## 1. 這次目標
回應 Ting 對「新增病例 → 新增 SOAP」流程不順的疑問。只做文件化審查與設計建議，
不改 app、不改 localStorage schema、不輸入病例資料。

## 2. 修改了哪些檔案
- `docs/CASE_SOAP_FLOW_REVIEW.md`（新）
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `CASE_SOAP_FLOW_REVIEW.md`：整理現有 Case layer / SOAP layer 欄位，說明哪些資料該放病例，
  哪些該放每次 SOAP，並提出未來低風險 UI 分段建議。
- `REBUILD_HANDOFF.md`：記錄本次 review 與 validation。

## 4. 為什麼這樣改
Ting 還沒有大量輸入真實病例，現在最適合先釐清流程。文件確認目前「先建病例、再掛 SOAP」
的邏輯是正確的；真正需要改善的是表單 UX：欄位分段、helper text、Case vs Visit 的心理模型。

## 5. 資料內容變動
無。未修改任何病例資料、模板 JSON、app runtime 或 localStorage schema。

## 6. Schema / 欄位變動
無。

## 7. Review 結論
- Case = 穩定 baseline / patient timeline / case-wide diagnosis-pattern-safety links。
- SOAP = 每次 visit 的 S/O/A/P、舌脈、本次辨證、用穴、方藥、用藥背景、outcomes、follow-up。
- `Case title` 應是短標籤，不是完整摘要。
- `Category` 應是 routing tag，不是診斷。
- `Summary` 應是 case-wide snapshot，不應存每次 visit 更新。
- 現有 SOAP 已是 TCM-oriented SOAP；問題主要是表單太長、未分段、advanced link fields 太早出現。

## 8. Generated files / scripts
未執行 `scripts/build-data.js`，未修改 `data/generated/*`。

## 9. Protected areas
未修改受保護區：
`app.js` CloudTCM/search/enrichPoint/selectPoint 段、`js/router.js`, `js/knowledge.js`,
`styles.css` point-detail-mode、`data/generated/*`,
`data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS。

## 10. Validation
- `scripts/validate-data.js`：PASS，681 defaultPoints deep-equal（excluding reference-URL fields），無 duplicate point codes
- `scripts/validate-interactions.js`：PASS，0 failures

## 11. 操作紀錄
讀 `index.html` case/SOAP dialog 欄位、`app.js` normalize/render/save 流程、
`data/clinical_cases/case_template.json`、`soap_note_template.json`、
`README.md` 與 `patient_record_system_map.json` 後寫 review。

## 12. 未完成
尚未改 UI。尚未分段 case dialog / SOAP dialog。尚未建立 migration。

## 13. 接手先看
先看 `docs/CASE_SOAP_FLOW_REVIEW.md`。若要改 UI，照 Immediate Recommendation：
保留現有 storage fields，只重排與加 helper text。

## 14. 下一步
建議下一個低風險 UI phase：
1. Case dialog 分成 Identity / Background / Presenting Problem / Diagnosis Links / Summary。
2. SOAP dialog 分成 Visit Context / S / O / A / P / Advanced Links。
3. 不改 localStorage schema，只改表單順序與說明。

## 15. 風險
低。這次 docs-only。真正 UI 改動前需再確認，並保留現有 localStorage 相容性。

---

# REBUILD HANDOFF — Session 13 (2026-07-03, Codex formula related formulas)

## 1. 這次目標
依 `comparison_group` 自動填 `related_formulas`，讓方劑可以互相比較與學習鑑別。
不填現代病、不填臨床內容、不做替代或療效宣稱。

## 2. 修改了哪些檔案
- `data/herbs/formula_canon_shortlist.json`
- `docs/FORMULA_CANON_RULES.md`
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `formula_canon_shortlist.json`：115 筆依同一 `comparison_group` 產生
  `related_formulas`。共 370 個 related formula links。
- `FORMULA_CANON_RULES.md`：補上 related_formulas 的規則：同組比較、非自動替代。

## 4. 為什麼這樣改
Ting 想要「某方不適合或沒有時，related formula 可以幫助」。這次先建立學習比較網，
未來填內容時可以顯示同組相似方，協助考試鑑別與臨床思考。

## 5. 資料內容變動
只新增方劑 id 之間的 related links；沒有填 composition/actions/indications/modern disease tags。

## 6. Schema / 欄位變動
無新增欄位；使用既有 `related_formulas`。

## 7. Review status
全部仍是 `draft`。`related_formulas` 是 study comparison graph，不是 source_checked content。

## 8. Generated files / scripts
未執行 `scripts/build-data.js`，未修改 `data/generated/*`。

## 9. Protected areas
未修改受保護區：
`app.js` CloudTCM/search/enrichPoint/selectPoint 段、`js/router.js`, `js/knowledge.js`,
`styles.css` point-detail-mode、`data/generated/*`,
`data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS。

## 10. Validation
- related formula graph check：115 records，bad links 0，self links 0，cross-group links 0
- empty related lists：2 (`formula.du_huo_ji_sheng_tang`, `formula.wu_mei_wan`)
- `scripts/validate-data.js`：PASS，681 defaultPoints deep-equal（excluding reference-URL fields），無 duplicate point codes
- `scripts/validate-interactions.js`：PASS，0 failures

## 11. 操作紀錄
用 Node parser 依 group 產生 peers；同一 `comparison_group` 的其他方劑都列入 related。
單方組保留空 list，等 expanded 方補進來。

## 12. 未完成
尚未填 `modern_clinical_use_tags` / `related_conditions`。
尚未填方劑雙軌內容。

## 13. 接手先看
看 `docs/FORMULA_CANON_RULES.md` 的 related_formulas 段。
注意 related formulas 不等於臨床替代。

## 14. 下一步
下一個安全步可選：
1. 先填 `modern_clinical_use_tags` 的 controlled vocabulary 文件，不填到資料；
2. 或開始為現有 23 筆填 CloudTCM formula id/source hints，仍不填內容。

## 15. 風險
低。只建立 study comparison graph，不影響 runtime。

---

# REBUILD HANDOFF — Session 12 (2026-07-03, Codex formula comparison groups)

## 1. 這次目標
依上一節規則，先為 115 筆方劑 shortlist 填 `comparison_group`，支援之後考試鑑別、
related formulas 與學習比較。不填臨床內容、不填現代病 tags。

## 2. 修改了哪些檔案
- `data/herbs/formula_canon_shortlist.json`
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `formula_canon_shortlist.json`：115 筆每筆填入一個 `comparison_group`。
  共 32 個學習鑑別群組，例如 `exterior_wind_cold`, `liver_spleen`,
  `qi_tonify`, `blood_stasis`, `phlegm_damp`, `damp_water`。
- 新增 `comparison_group_note`，明確說明這只是學習/鑑別群組，不代表自動替代或臨床等價。

## 4. 為什麼這樣改
Ting 需要方劑之間能互相比較。先把比較群組定好，後續才可以安全產生
`related_formulas`，並支援「某方不適合或沒有時，看相近方」的學習流程。

## 5. 資料內容變動
只填 comparison group，不填組成、功用、主治、禁忌、現代臨床運用或病症連結。

## 6. Schema / 欄位變動
無新增欄位；使用 Session 10 已建立的 `comparison_group`。

## 7. Review status
全部仍是 `review_status: "draft"`。comparison group 是學習結構，不是 source_checked 內容。

## 8. Generated files / scripts
未執行 `scripts/build-data.js`，未修改 `data/generated/*`。

## 9. Protected areas
未修改受保護區：
`app.js` CloudTCM/search/enrichPoint/selectPoint 段、`js/router.js`, `js/knowledge.js`,
`styles.css` point-detail-mode、`data/generated/*`,
`data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS。

## 10. Validation
- comparison group check：115 records，32 groups，missing 0，bad slug 0
- `scripts/validate-data.js`：PASS，681 defaultPoints deep-equal（excluding reference-URL fields），無 duplicate point codes
- `scripts/validate-interactions.js`：PASS，0 failures

## 11. 操作紀錄
用 Node parser 結構化寫入 groups，避免 JSON 手改錯誤。
分組依 Bensky-style 學生鑑別主題，而不是按現代病療效。

## 12. 未完成
尚未填 `related_formulas`。下一步可由 `comparison_group` 自動產生 group-internal related formulas，
但仍需保留「比較參考，不是替代」語意。

## 13. 接手先看
看 `formula_canon_shortlist.json` 的 `comparison_group` 統計；特別注意單一組：
`wind_damp_bi` 和 `parasites_jueyin` 目前各 1 筆，之後 expanded 方可補強。

## 14. 下一步
建議先依 `comparison_group` 產生 `related_formulas`，仍不填現代病或臨床內容。

## 15. 風險
低。只填學習分組，不影響 app runtime。

---

# REBUILD HANDOFF — Session 11 (2026-07-03, Codex formula id/tier/rules)

## 1. 這次目標
接收 Claude 死機前的審查結論，先把方劑 shortlist 的穩定識別與後續填寫規則定好：
每方新增 stable `id` 與 `tier`，並建立方劑雙軌內容規則文件。

## 2. 修改了哪些檔案
- `data/herbs/formula_canon_shortlist.json`
- `docs/FORMULA_CANON_RULES.md`（新）
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `formula_canon_shortlist.json`：115 筆每筆新增 `id: "formula.<pinyin_snake>"`
  與 `tier: "core"`。`related_formulas` 以後要引用這些 stable ids。
- `FORMULA_CANON_RULES.md`：新增雙軌內容、保守措辭、modern tags、
  related conditions、related formulas、comparison_group 命名規則。

## 4. 為什麼這樣改
Claude 審查認為 115 筆範圍適合當 core，後續新增再用 expanded。
在填內容前先定 id/tier/詞彙規則，可避免 related formulas 和搜尋連結之後重工。

## 5. 資料內容變動
沒有填方劑內容，沒有新增臨床宣稱。只補識別欄位和規則文件。

## 6. Schema / 欄位變動
Shortlist staging schema 新增：
- `id`
- `tier`

## 7. Review status
115 筆仍全部 `review_status: "draft"`。`tier: "core"` 不代表 source_checked。

## 8. Generated files / scripts
未執行 `scripts/build-data.js`，未修改 `data/generated/*`。

## 9. Protected areas
未修改受保護區：
`app.js` CloudTCM/search/enrichPoint/selectPoint 段、`js/router.js`, `js/knowledge.js`,
`styles.css` point-detail-mode、`data/generated/*`,
`data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS。

## 10. Validation
- ID/tier check：115 records，duplicate ids 0，bad ids 0
- `scripts/validate-data.js`：PASS，681 defaultPoints deep-equal（excluding reference-URL fields），無 duplicate point codes
- `scripts/validate-interactions.js`：PASS，0 failures

## 11. 操作紀錄
用 Node parser 依 pinyin 產生 `formula.<pinyin_snake>` id；全部設 `tier:"core"`。
再把 Claude 的規則整理成 `docs/FORMULA_CANON_RULES.md`。

## 12. 未完成
尚未填 comparison_group 值；尚未填 modern_clinical_use_tags / related_conditions /
related_formulas；尚未填雙軌內容。

## 13. 接手先看
先看 `docs/FORMULA_CANON_RULES.md`，再看 `data/herbs/formula_canon_shortlist.json`。

## 14. 下一步
建議先填 comparison_group，仍不填臨床內容。完成後再從現有 23 筆開始填雙軌內容。

## 15. 風險
低。只補 stable ids/tier 與規則，不影響 runtime。

---

# REBUILD HANDOFF — Session 10 (2026-07-03, Codex formula search scaffolding)

## 1. 這次目標
依 Ting 補充需求，讓方劑 canon shortlist 未來可以支援「現代病/症狀搜尋 → 方劑」與
「某方不適合或沒有時 → related formulas 比較」。本次只補空欄位，不填內容。

## 2. 修改了哪些檔案
- `data/herbs/formula_canon_shortlist.json`
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `formula_canon_shortlist.json`：每筆 115 方新增空欄位：
  `modern_clinical_use_tags`, `related_conditions`, `related_formulas`,
  `comparison_group`, `clinical_use_note`。
- `REBUILD_HANDOFF.md`：記錄本次資料設計補強。

## 4. 為什麼這樣改
Ting 學方劑時需要現代臨床運用作為搜尋入口；未來輸入 PCOS、IBS、insomnia、
PMS、GERD、URI、dysmenorrhea 等現代病名或臨床情境時，可以連到相關方劑。
`related_formulas` 也能支援考試比較與臨床替代思考，但不代表自動替代。

## 5. 資料內容變動
沒有填任何現代病、症狀、方劑關聯或臨床宣稱。所有新增欄位都是空陣列或空字串。

## 6. Schema / 欄位變動
Shortlist staging schema 新增：
- `modern_clinical_use_tags: []`
- `related_conditions: []`
- `related_formulas: []`
- `comparison_group: ""`
- `clinical_use_note: ""`

## 7. Review status
全部仍是 `draft`。這些欄位只是未來填資料的位置，不是 source_checked 內容。

## 8. Generated files / scripts
未執行 `scripts/build-data.js`，未修改 `data/generated/*`。

## 9. Protected areas
未修改受保護區：
`app.js` CloudTCM/search/enrichPoint/selectPoint 段、`js/router.js`, `js/knowledge.js`,
`styles.css` point-detail-mode、`data/generated/*`,
`data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS。

## 10. Validation
- JSON scaffold check：115 records，新增欄位缺漏 0
- `scripts/validate-data.js`：PASS，681 defaultPoints deep-equal（excluding reference-URL fields），無 duplicate point codes
- `scripts/validate-interactions.js`：PASS，0 failures

## 11. 操作紀錄
用 Node parser 結構化補欄位，避免手改 JSON 格式錯誤。未做任何內容填充。

## 12. 未完成
尚未填 `modern_clinical_use_tags` / `related_conditions` / `related_formulas`。
尚未建立 comparison groups，例如逍遙散/加味逍遙散/柴胡疏肝散。

## 13. 接手先看
看 `formula_canon_shortlist.json` 任一筆，確認新增欄位是否符合未來搜尋與比較需求。

## 14. 下一步
等 Ting/Claude 確認 shortlist 範圍與欄位後，再分批填 modern clinical use tags 與 related formulas。
填寫時仍須保守措辭：臨床參考情境，不寫「治療某病」。

## 15. 風險
低。只補空欄位，不影響 app runtime。

---

# REBUILD HANDOFF — Session 9 (2026-07-03, Codex formula canon shortlist)

## 1. 這次目標
依 Ting 的「方劑內容任務 — 雙軌，個人學習用途」第一步，只建立方劑骨架清單：
`data/herbs/formula_canon_shortlist.json`。不填組成、功用、主治、禁忌內容；
不抓內容；不改 app runtime；等待 Ting 確認清單後才進第二步。

## 2. 修改了哪些檔案
- `data/herbs/formula_canon_shortlist.json`（新）
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `formula_canon_shortlist.json`：新增 115 筆 NCCAOM-oriented 方劑候選骨架。
  每筆只含 `name_zh`, `name_en`, `pinyin`, `category`, `source_hint`, `review_status`。
- `REBUILD_HANDOFF.md`：記錄本次 shortlist 任務、驗證與下一步。

## 4. 為什麼這樣改
先把 Ting 要的高頻方 canon 範圍定下來，之後才能逐方做雙軌內容：
英文層對 Bensky / Deadman / NCCAOM 用語，中文層用 CloudTCM / 萬方作 draft 深度理解。

## 5. 資料內容變動
新增 shortlist file，但沒有修改既有 `data/herbs/formulas.json` 或其他現有方劑內容。
現有 23 筆已納入 shortlist；另外補入常見 Bensky/NCCAOM 範圍候選方。

## 6. Schema / 欄位變動
無正式 schema 變動。shortlist 是 staging/canon planning file，不被 app runtime 讀取。

## 7. Review status
全部 `review_status: "draft"`。尚未 source_checked，尚未代表臨床或考試最終正確內容。

## 8. Generated files / scripts
未執行 `scripts/build-data.js`，未修改 `data/generated/*`。
原因：本次新增檔不在 build-data 管線中，且 Ting 指定受保護區包含 generated files。

## 9. Protected areas
未修改受保護區：
`app.js` CloudTCM/search/enrichPoint/selectPoint 段、`js/router.js`, `js/knowledge.js`,
`styles.css` point-detail-mode、`data/generated/*`,
`data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS。

## 10. Validation
- JSON integrity check：115 records，duplicate names 0，missing required fields 0
- `scripts/validate-data.js`：PASS，681 defaultPoints deep-equal（excluding reference-URL fields），無 duplicate point codes
- `scripts/validate-interactions.js`：PASS，0 failures

## 11. 操作紀錄
先讀現有 `data/herbs/formulas.json` 23 筆與 `data/herbs/high_yield_formula_seeds.json`。
去重後建立 shortlist，source_hint 以 Bensky F&S category / existing AcuTing seed 為主；
CloudTCM formula id 留待第二步查表補入。

## 12. 未完成
尚未填任何方劑內容。尚未查 CloudTCM formula id。尚未做 Bensky/Deadman 實質核對。

## 13. 接手先看
先看 `data/herbs/formula_canon_shortlist.json`，確認 115 筆是否太多、太少，
或是否要分成 `core` / `expanded` 批次。

## 14. 下一步
等 Ting 確認 shortlist。第二步才逐方補雙軌內容：
英文層 source_checked；中文層 draft；兩層並存且保守措辭。

## 15. 風險
低。這次只新增 staging shortlist，不影響 app、不影響既有方劑資料。
主要風險是 shortlist 範圍可能需要 Ting/Claude 調整，所以目前全部 draft。

---

# REBUILD HANDOFF — Session 8 (2026-07-03, Claude)：CloudTCM 直連對照表 + 來源登記

## 完成
- 建立 `data/sources/cloudtcm_point_map.json`：361 標準穴 code→CloudTCM 數字ID + 圖片檔名。
  來源：CloudTCM Next.js `/_next/data/{buildId}/meridian/{n}.json` 的 Acupoint_List（瀏覽器抓取）。
  代碼別名已轉換：SJ→TE、LV→LR、REN→CV、DU→GV。
- `scripts/build-data.js`：多產出 `data/generated/cloudtcm_map.js`（globalThis.ACUTING_CLOUDTCM_MAP）。
- `index.html`：載入 cloudtcm_map.js。
- `app.js`：
  - chinesePointReference：優先用對照表直連 `cloudtcm.com/acupoint/{id}`（不在表內才 fallback 名稱搜尋）。
  - 新增 cloudtcmEntry / cloudtcmImage helper。
  - enrichPoint：CloudTCM 視覺連結改指向實際圖片 `media.cloudtcm.uk/acupoint-s/{img}.jpg`。
- `docs/TCM_SOURCE_REGISTRY.md`：Ting 提供的權威來源分級總表（穴位/方劑/中藥/病症/開源專案），
  日後擴建知識內容的指定參考來源。

## 驗證
- jsdom：8 穴（PC6/SP6/LU2/TE5/LR3/CV17/GV20/BL67）中文來源皆直連正確 /acupoint/{id} + 圖片連結 → 17/17 PASS
- validate-data.js：681、臨床欄位 deep-equal、無重複 → PASS
- validate-interactions.js：0 failures

## 給 Codex（不要動）
app.js 的 chinesePointReference / cloudtcmEntry / cloudtcmImage / enrichPoint CloudTCM 段、
build-data.js 的 cloudtcm 段、data/generated/*、data/sources/cloudtcm_point_map.json。
若 CloudTCM buildId 改版導致連結失效，重抓方式記在 TCM_SOURCE_REGISTRY.md 末段。

---

# REBUILD HANDOFF — Session 7 (2026-07-03, Claude)：搜尋直達單穴 + 中文來源連結

## 目標
(a) 搜尋一個穴位直接進單穴頁，不要中間卡片層；(b) 修「中文來源」連到通用目錄而非該穴。

## 修改檔案
- `app.js`：
  - runHomeSearch + searchInput(Enter)：精確比對 code/中文名/英文名/pinyin →
    直接 selectPoint 進單穴頁；模糊唯一結果也直接開。
    新增 helper findExactPoint()。
  - 新增 chinesePointReference(point)：用「中文名 + code + 穴 site:cloudtcm.com」
    組 Google 精準搜尋，對每個穴位都可靠。
  - getSourceButtons：中文來源改用 chinesePointReference；只有真正的
    數字 ID CloudTCM 頁（/acupoint/\d+）才採用 stored 值。
  - enrichPoint：把殘留的通用 "https://cloudtcm.com/acupoint" 一律換成
    chinesePointReference（sources 與 visualLinks 兩處）。
  - selectPoint：捲到頁頂（配合單穴模式）。
- `styles.css`：point-detail-mode 隱藏 hero / formula / condition / map。
- `scripts/validate-data.js`：deep-equal 排除 sources / visualLinks 兩個
  reference-URL 欄位（這些是刻意會演進的，非臨床資料）。

## 為什麼不用 Codex 提的 media.cloudtcm.uk/{CODE}.jpg
瀏覽器實測：PC6.jpg 有圖(500×600)，但 SP6/LI4/sp6/SP06 全無 → 涵蓋不完整，
硬套會產生大量破圖。CloudTCM 單穴頁用不可推導的數字 ID，站內 /search 不存在。
故改用「中文名精準站內搜尋」＝每穴都可靠、一鍵到該穴中文頁（含圖）。

## 驗證
- jsdom：搜尋直達（sp6/SP6/內關/neiguan/三陰交/PC6/LU9 + 目錄框 Enter）→ 全過
- jsdom：9 經絡穴位單穴模式 + 中文來源連結乾淨 → 全過
- validate-data.js：count 681、臨床欄位 deep-equal、無重複 → PASS
- validate-interactions.js：0 failures

## 給 Codex
- 不要動 app.js 的 findExactPoint / chinesePointReference / enrichPoint 的
  CloudTCM 處理 / selectPoint / runHomeSearch，也不要動 styles.css 的
  point-detail-mode 與 validate-data 的 IGNORED_FIELDS。
- 若要做「真正的 CloudTCM 單穴數字 ID 對照表」是有價值的後續（需逐穴人工驗證），
  但屬 data 任務、非本次範圍。

---

# REBUILD HANDOFF — Session 6 (2026-07-03, Claude)：單穴頁 UX 修正

## 目標
修正全站性問題：點任一穴位進單穴頁後，上方仍殘留大標題 hero、方劑區、病症區，
使用者要長距離往下捲才看到穴位內容。

## 修改檔案（只動這兩個）
- `app.js`：selectPoint() 的 `detailCard.scrollIntoView(block:"nearest")`
  改為 `window.scrollTo({top:0})`，因為單穴模式下 detail 已是頁面唯一內容。
- `styles.css`：檔尾新增 `body.point-detail-mode` 規則，隱藏
  `.acupoint-directory-hero`、`.formula-section`、`.condition-graph-section`、`.map-panel`。

## 為什麼
單穴模式（body.point-detail-mode）原本只隱藏 sidebar 與 search-panel，
但 lookup 工作區還含 hero + formula + condition 三個 section 排在 detail 之上。

## 驗證
- jsdom：9 個跨經絡穴位（PC6/LU5/SP6/BL67/KI27/GB44/LR14/GV1/AT1）
  進單穴模式皆正確、list 隱藏、返回可還原 → 12/12 PASS
- validate-data.js：681 deep-equal、無重複 PASS
- validate-interactions.js：0 failures

## 給 Codex
不要動 app.js 的 selectPoint 與 styles.css 檔尾的 point-detail-mode 區塊。
你的下一步（361→app schema adapter）不受影響，可繼續。

---

# REBUILD HANDOFF — Session 7 (2026-07-03, dataset shortlist direction reset)

## 1. 這次目標
依 Ting 新指令覆蓋前一輪「逐頁爬網站蒸餾」方向，改成先讀
`docs/TCM_SOURCE_REGISTRY.md` F 段，從 `Mengqi97/chinese-medical-dataset`
README 做資料集 shortlist。只產出 `docs/DATASET_SHORTLIST.md`，不下載、不匯入、
不改任何現有 data records。

## 2. 修改了哪些檔案
- `docs/DATASET_SHORTLIST.md`（新）
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `DATASET_SHORTLIST.md`：列出 TCM-NER、TCM-QG、QASystemOnMedicalGraph、
  Huatuo KG QA、CMB、QABasedOnMedicalKnowledgeGraph、家庭常見疾病 KG 的用途、
  格式、授權狀態、適合/不適合的 AcuTing 區域與建議。
- `REBUILD_HANDOFF.md`：記錄方向修正與本次只做 shortlist。

## 4. 為什麼這樣改
新的資料策略是「資料集打底 → 機構庫核對 → agent 補洞」。這比逐頁爬單一網站安全，
也更適合後續 FOM/ACPL/CH/BIOM 四科知識擴建。

## 5. 資料內容變動
沒有匯入或修改任何既有 `data/**` records。前一方向產生的未完成暫存檔
`data/herbs/hkbu_formula_extract_preview.json` 與 `scripts/fetch-hkbu-formula-preview.js`
已清掉，避免把被覆蓋的流程留下來。

## 6. Schema / 欄位變動
無。

## 7. Shortlist 重點
- 中藥/中成藥：優先看 TCM-NER；Tianchi 授權需確認。
- FOM/CH study prompts：TCM-QG 可用於題庫/學習提示，不作 canonical truth。
- 病症/BIOM：QASystemOnMedicalGraph / Huatuo KG QA 可做 draft condition graph seeds。
- 方劑：Mengqi README 本身不足以建立 classical formula canon；需另核對「中醫方劑知識庫」來源與授權。
- 穴位/ACPL：Mengqi README 沒找到直接適合的穴位資料集；仍走 WHO/manual/institutional route。

## 8. Generated files / scripts
未執行 build-data，未改 `data/generated/*`。

## 9. Protected areas
未修改受保護區：`app.js` CloudTCM/search 段、`js/router.js`, `js/knowledge.js`,
`styles.css` point-detail-mode、`data/sources/cloudtcm_point_map.json`,
`scripts/validate-data.js` IGNORED_FIELDS。

## 10. Validation
- `scripts/validate-data.js`：PASS，681 defaultPoints deep-equal（excluding reference-URL fields），無 duplicate point codes
- `scripts/validate-interactions.js`：PASS，0 failures

## 11. 操作紀錄
讀本地 `docs/TCM_SOURCE_REGISTRY.md` F 段；查 Mengqi97 README 與上游資料頁；
只寫 docs shortlist。沒有下載資料集，沒有建立 `data/imports/`。

## 12. 未完成
等待 Ting 確認 shortlist。確認前不下載、不匯入、不轉換資料。

## 13. 接手先看
先看 `docs/DATASET_SHORTLIST.md` 的 Quick Recommendation 和 Category Mapping。
授權不清的項目不要下載。

## 14. 下一步
Ting 選定資料集後，先確認 license/terms，再建立 `data/imports/README.md` 與 raw import manifest；
下載原始檔後仍只標 draft，不升 source_checked。

## 15. 風險
低。這次是 docs-only planning。主要風險是部分上游資料授權不清，所以已明確標註需要 Ting 確認。

---

# REBUILD HANDOFF — Session 6 (2026-07-03, Codex source registry batch 1)

## 1. 這次目標
只執行知識擴建批次第 1 項：把 `docs/TCM_SOURCE_REGISTRY.md` 的分級權威來源登記到
`data/sources/source_registry.json`，讓 Sources 工作區能顯示權威分層。完成後停下來等 Ting 確認。

## 2. 修改了哪些檔案
- `data/sources/source_registry.json`
- `data/generated/app_data.js`（由 `scripts/build-data.js` 產生）
- `data/generated/knowledge_data.js`（由 `scripts/build-data.js` 產生）
- `data/generated/cloudtcm_map.js`（由 `scripts/build-data.js` 產生）
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `source_registry.json`：來源數從 19 筆增加到 33 筆；補入 TCM registry 分級來源，
  並為所有來源補齊 `url`, `tier`, `language`, `category`, `review_status`,
  `primary_use` 等欄位。
- `knowledge_data.js`：重新打包 Sources，現在 `sources` count 為 33。
- `app_data.js` / `cloudtcm_map.js`：build-data 同步重產；未手改。

## 4. 為什麼這樣改
之後擴充方劑、病症、穴位臨床欄位時，需要先有可查詢的來源權威分層。
這次先把來源層級落地，不直接蒸餾醫療內容，避免未核對就寫入實質知識。

## 5. 資料內容變動
新增/補強的 TCM source categories：
- 穴位：WHO, acupoints.org, CloudTCM, 再探當代針灸大成數位典藏
- 方劑：香港浸大方劑圖像庫、高醫中藥處方集
- 中藥/藥理：萬方/中醫藥知識庫、中醫藥數據庫檢索系統、TCMIP、TCMSP、HERB、SymMap、TCMIO、香港中藥材標準
- 病症：SFU Library TCM Knowledge Base、中國醫學網/台灣中醫醫學網

## 6. Schema / 欄位變動
沒有改正式 schema 檔；但 `source_registry.json` 的 source records 現在統一帶有：
`name`, `url`, `tier`, `language`, `category`, `primary_use[]`, `review_status`。
Tier 統計：A=13, A-=11, B=8, C=1。

## 7. Review status
已能確認為既有或清楚來源登記的項目標 `source_checked`；URL/access 尚需人工確認的
項目標 `draft`，避免後續內容抽取時誤認為已完成來源核對。

## 8. Generated files / scripts
依 Ting 指示，改 data 後執行 `scripts/build-data.js`。
沒有手改 `data/generated/*`；沒有修改 `scripts/validate-data.js` 的 IGNORED_FIELDS。

## 9. Protected areas
未修改受保護區：
`app.js` CloudTCM/search/selection 相關段落、`styles.css` point-detail-mode、
`js/router.js`, `js/knowledge.js`, `data/sources/cloudtcm_point_map.json`。

## 10. Validation
- `scripts/build-data.js`：PASS；knowledge sources count = 33
- JSON completeness check：33 sources，missing required display fields = 0
- `scripts/validate-data.js`：PASS，681 defaultPoints deep-equal（excluding reference-URL fields），無 duplicate point codes
- `scripts/validate-interactions.js`：PASS，0 failures

## 11. 操作紀錄
先讀 `docs/TCM_SOURCE_REGISTRY.md` 與既有 `source_registry.json`。
用 JSON parser 結構化更新資料，避免手動 JSON 逗號/格式錯誤。
跑 build-data 與兩個 validation，全綠後才更新本 handoff。

## 12. 未完成
本批次只完成第 1 項。尚未開始：
- 第 2 項：香港浸大方劑圖像庫擴充 23 筆方劑
- 第 3 項：SFU TCM KB 擴充 pathology condition relation records
- 第 4 項：235 標準穴 needling / moxa / contraindications

## 13. 接手先看
先看 `data/sources/source_registry.json` 的新增 tier/category 欄位與 `review_status`。
URL 為空或 `draft` 的來源，下一步抽取內容前要先人工/瀏覽器核對 access 與正確入口。

## 14. 下一步
等待 Ting 確認第 1 項。確認後再做第 2 項：以香港浸大方劑圖像庫為主來源，
逐方擴充 `data/herbs/formulas.json`，每方保留 sources、標 review_status，
且不得過度醫療宣稱。

## 15. 風險
低。這次只改來源登記和 generated bundle，不改 UI 行為、不改 runtime search。
主要風險是部分 registry 網站 URL/access 尚需確認，所以已標 `draft`，避免誤用。

---

# REBUILD HANDOFF — Session 5 (2026-07-02/03, Codex + Ting approval)

## 1. 這次目標
完成 361 canonical merge 的批准後套用：把 embedded app acupoint records 安全合併進
`data/acupoints/361.json`，同時保留可審核 diff summary 與 validation 紀錄。

## 2. 修改了哪些檔案
- `scripts/merge-361-preview.js`（新：產生 merge preview，可在批准後套用）
- `data/acupoints/361.json`（已批准套用：210 → 235 筆）
- `docs/361_MERGE_DIFF_SUMMARY.md`（新：diff summary，已標記 approved/applied）
- `docs/361_MERGE_PREVIEW.json`（新：完整 preview artifact）
- `docs/DATA_MIGRATION_MAP.md`（更新 361 merge 狀態）
- `data/acupoints/MIGRATION_NOTES.md`（記錄 361 merge）
- `docs/REBUILD_HANDOFF.md`（本節）

## 3. 每個檔案改了什麼
- `scripts/merge-361-preview.js`：讀取 embedded acupoint JSON 與既有 361，先產生 preview；
  預設不覆寫。Ting 批准後用 `--apply-approved` 套用。
- `data/acupoints/361.json`：新增 25 筆 Kidney channel records：
  KI1, KI2, KI4, KI5, KI7-KI27。KI3、KI6 原本已存在並保留。
- `docs/361_MERGE_DIFF_SUMMARY.md`：記錄新增、刪除、欄位填補、placeholder 修復、
