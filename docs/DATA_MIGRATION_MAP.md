# Data Migration Map

Purpose: single authoritative answer to "which file is the latest truth?"
Update this file every time data moves. Last update: 2026-07-12 (Claude Phase 2 runtime adapter: 361.json is live).

## Authority table — where each dataset lives NOW

| Dataset | Source of truth (edit here) | Consumed by app via | Old location | Status |
|---|---|---|---|---|
| Standard acupoints (14 channels, 361 records) | `data/acupoints/361.json` | `data/generated/points_361.js` -> app.js `adapt361Record()` | `data/acupoints/embedded/*.json` standard-channel arrays (retired from runtime 2026-07-12, files kept in place) | LIVE 2026-07-12 (Phase 2 runtime adapter); embedded arrays now contribute only EX-HN3/EX-HN5 |
| Auricular points (in-app 29 records) | `data/auricular/embedded/auricular_points.json` | `data/generated/app_data.js` | app.js `auricularPoints` (removed) | MIGRATED 2026-07-02 |
| EN i18n maps (locations, anatomy glossary, functions, patterns) | `data/acupoints/embedded/i18n_maps.json` | `data/generated/app_data.js` | app.js 4 map consts (removed) | MIGRATED 2026-07-02 |
| Master Tung index (277) | `data/tung/point_index.json` | generated twin `data/tung/point_index.js` | formerly hand-kept twin | GENERATED 2026-07-12 by `scripts/build-data.js`; edit JSON only |
| Auricular GB93 index (13/93) + worklist | `data/auricular/gb93_index.json`, `gb93_worklist.json` | generated `.js` twins | formerly hand-kept twins | GENERATED 2026-07-12 by `scripts/build-data.js`; edit JSON only |
| 361 canonical file | `data/acupoints/361.json` (361 standard-channel records, unified schema) | `data/generated/points_361.js` (built by `scripts/build-data.js`) | synced by hand from app.js and enrichment batches | LIVE IN APP since 2026-07-12 (Phase 2); content still frozen pending Ting §A/§B decisions |
| Formulas currently rendered (23) | `data/herbs/formulas.json` | Lookup / Knowledge formula section | same | CURRENT APP FORMULA SOURCE; contains content-bearing records and known encoding backlog |
| Formula categories / safety flags / pattern links | `data/herbs/formula_categories.json`, `data/herbs/formula_safety_flags.json`, `data/herbs/formula_pattern_links.json` | partially referenced by formula/pathology planning scripts; not fully rendered | same | Draft relationship/reference layer |
| Formula canon shortlist (115) | `data/herbs/formula_canon_shortlist.json` | NOT wired into app | created as formula canon planning layer | Draft skeleton/canon planning file; do not treat as rendered canonical until formula merge B1/B2 is approved |
| Formula import staging | `data/herbs/formula_import_staging.json` | NOT wired into app | dataset import staging | Staging only; do not overwrite `formulas.json` from this file without a preview/apply workflow |
| Formula dose evidence staging | `data/imports/formula_doses/formula_dose_staging.json` | NOT wired into app | HKBU dose transcription + Sun Ten U.S. product identity | Draft/source-evidence only; granule serving grams stay null without reviewed label evidence; requires field-level preview and Ting approval before canonical merge |
| Formula/herb card relation design | `docs/HERB_FORMULA_CARD_RELATION_DESIGN.md` | NOT wired into app | new design note | DESIGN 2026-07-17; modern applications, related formulas, condition links, and formula composition must use stable IDs |
| High-yield formula seeds | `data/herbs/high_yield_formula_seeds.json` | NOT wired into app | study seed file | Draft seed/reference list |
| Single herbs rendered file | `data/herbs/single_herbs.json` | NOT wired into app | same | Empty placeholder; not current herb canon |
| Herb canon shortlist (202) | `data/herbs/herb_canon_shortlist.json` | NOT wired into app | new CH / Materia Medica staging layer | Draft skeleton/content file; visible only after B3 wiring |
| Herb exact visual-link staging | `data/imports/herb_visual_links/*.json` | `scripts/preview-herb-visual-links.js`; NOT canonical | verified CloudTCM herb pages + HKBU MMID/MPID image pages | Review-only exact-page mappings; no apply mode; canonical `visual_links[]` requires Ting/Claude preview approval |
| Pathology conditions + graph seeds | `data/pathology/conditions.json`, `clinical_graph_seed.json`, `condition_graph_expansion.json` | relation validator; not fully rendered | same plus graph expansion | Draft relationship layer; `conditions.json` is current primary pathology record file |
| Western medications | `data/medications/western_medications.json` | relation validator; not rendered | new Friday relationship layer | Draft ID reference layer for clinical decision/pathology links |
| Source registry + validation matrix | `data/sources/*.json` | Sources workspace / source planning; not fully validated | same | Draft registry; known encoding backlog in `source_registry.json` |
| Dataset imports manifest and raw imports | `data/imports/import_manifest.json`, `data/imports/README.md`, `data/imports/*` | NOT wired into app | new import staging root | Raw/staging only; preserve original imports, never edit generated/canonical data directly from here |
| CloudTCM raw/staging imports | `data/imports/cloudtcm/*` | D3 preview/review scripts only | private CloudTCM fetch staging | Private study staging; not canonical; do not bulk apply without gated review |
| Model draft enrichment imports | `data/imports/model_draft/enrichment/*` | `scripts/apply-361-enrichment.js` | model-assisted D5 batch drafts | Applied through script only; rerunnable fill-empty workflow |
| Missing-record audit | `data/audits/missing_report.json` | NOT wired (health cards are semi-static) | same | Phase 2 wiring |
| Clinical case & SOAP templates | `data/clinical_cases/case_template.json`, `soap_note_template.json`, `fertility_case_template.json`, markdown quick templates | app has its own form logic; templates not fully wired | same | Phase 3; keep de-identified only |
| Clinical decision links | `data/clinical_cases/clinical_decision_links.json` | `scripts/validate-relations.js` | new Friday relationship layer | Draft relationship layer; ID references only |
| Fertility workflow seeds | `data/clinical_cases/fertility_workflow_seed.json` | `scripts/validate-relations.js` | new fertility workflow layer | Draft workflow/reference layer; not treatment protocol |
| Clinical outcomes / patient record map | `data/clinical_cases/outcome_metrics.json`, `patient_record_system_map.json` | NOT wired or partially referenced by case workspace planning | same | Draft documentation/workflow layer |
| USER DATA: edited points | browser localStorage `acupoint-atlas-v1` | app runtime | same | NOT in git. Ting must export via 匯出 JSON regularly |
| USER DATA: clinical cases | browser localStorage `acuting-clinical-cases-v1` | app runtime | same | NOT in git. Export via Export cases. PRIVATE — do not commit if identifiable |
| Small UI configs (channel audit, taxonomy, ear anchors) | `data/config/ui_config.json` | `data/generated/app_data.js` -> app.js hydration | app.js constants | MIGRATED 2026-07-12; edit JSON only and run `scripts/build-data.js` |
| Legacy app snapshot | `legacy/` (index.html, app.js, styles.css) | fallback only | root | FROZEN 2026-07-02, do not edit |

## Phase 2 runtime adapter LANDED — Claude 2026-07-12

`data/acupoints/361.json` is now the single runtime source for the 14
standard channels, per docs/RUNTIME_ADAPTER_SPEC.md. Data flow:
`361.json → scripts/build-data.js → data/generated/points_361.js
(globalThis.ACUTING_POINTS_361) → app.js adapt361Record() → defaultPoints`.

Field map actually implemented (verified against runtime renderers):

| 361.json | runtime | decision |
|---|---|---|
| code / chinese / english / pinyin | code / nameZh / nameEn / pinyin | direct |
| meridian_display, region | meridian, region | fallback channelPrefixMeta |
| location_zh / location_en / cun_measurement | location / locationEn / cunMeasurement | direct |
| functions_zh[] | functions (string) | join "，" |
| functions_en[] | functionsEn (string) | join " " — runtime convention is string (embedded records), not array as the spec table guessed |
| indications_zh[] / indications_en[] | patterns[] / patternsEn[] | pass through |
| needling | techniqueNotes | authoritative needling field; string on 354 records, {depth,angle,technique,moxibustion} object on BL61–BL67 (encoding backlog) — composed by needling361Text() |
| contraindications[] + cautions[] + danger[] | cautions (string) | deduped union joined "\n"; validator proves no safety line is lost |
| anatomy_terms[] | anatomy[] | 65 records; others fall back to anatomyFromText() |
| review_status / source_status / enrichment_status | reviewStatus / sourceStatus / enrichmentStatus | defaults draft / model_draft_pending_source_review for the 235 records that predate status fields |
| nccaom_high_yield / clinical_pearls | nccaomHighYield / clinicalPearls | passed through for future study sections |
| ui_map {x,y} | x, y | 126 new records lack ui_map → channelPrefixMeta fallback coords |
| sources[] | sources[] | enrichPoint dedupes/augments as before |

Runtime merge is now `mergeByCode(standardPoints361, embeddedExtraPoints,
auricularGb93Index, auricularPoints, tungPointIndex)` = 681 total.
`embeddedExtraPoints` = embedded records whose codes are NOT in 361.json —
currently exactly EX-HN3 印堂 and EX-HN5 太陽. The embedded standard-channel
arrays and `legacy/` stay in git unchanged (rollback = revert the PR).

`scripts/validate-data.js` was rewritten (legacy deep-equal retired, approved
by Ting 2026-07-12): it now proves 361 coverage, field fidelity, safety-line
preservation, layer counts (361+2+29+13−1+277=681), and no duplicate codes.

localStorage note: pre-adapter `persist()` snapshots contained placeholder
stubs and unedited default copies; `reconcileSavedPoints()` in app.js drops
those at load time (old placeholder stubs, and standard-channel records with
no `techniqueNotes` key). Genuine user edits still merge over defaults.

## Field-mapping note for Phase 2 (361.json unification)

`data/acupoints/embedded/*.json` records use the app schema:
`code, nameZh, nameEn, pinyin, region, location, locationEn, cunMeasurement,
functions[], functionsEn[], patterns[], patternsEn[], cautions, x, y, sources[], visualLinks[]`.

`data/acupoints/361.json` uses:
`code, chinese, pinyin, english, channel_zh, channel_en, location_zh, location_en,
cun_measurement, functions_zh[], functions_en[], indications_zh[], indications_en[], ...`.

Phase 2 must write an explicit field map before merging. Do not silently drop
`x, y, visualLinks, cautions` — they have no 361.json equivalent yet; add fields
or keep a sidecar file. Record every decision here.

## Phase 2 acupoint schema unification plan -- Codex 2026-07-02

Scope for the first Phase 2 step:
- Do not change runtime search or UI while another agent is debugging search.
- Do not merge records yet.
- First define the canonical field map and validation expectations.

Current counts:

| Dataset | Count | Notes |
|---|---:|---|
| `data/acupoints/embedded/*.json` unique codes | 237 | App-schema records currently feeding generated app data. |
| Embedded standard-channel codes | 235 | LU through KI plus existing PC/TE/GB/LR/CV/GV records from starter/professional sets. |
| `data/acupoints/361.json` | 210 | Existing canonical-candidate file, not loaded by app. |
| Embedded standard codes missing from `361.json` | 25 | KI1, KI2, KI4-KI27. |
| Codes in `361.json` missing from embedded data | 0 | No stale 361-only codes found in this check. |
| Duplicate embedded source codes before app merge | 17 | Expected overlaps between starter/professional/channel files; app merge order resolves these. |

Canonical decision:
- `data/acupoints/361.json` should become the canonical standard-channel acupoint file.
- It should preserve the richer structured fields already present in 361 schema.
- It must also gain the app runtime fields needed by the current UI, so moving to 361 does not lose behavior.
- Until the merge script exists and validates losslessly, `data/acupoints/embedded/*.json` remains the runtime source of truth.

Field map from embedded app schema to canonical 361 schema:

| Embedded field | Canonical 361 field | Decision |
|---|---|---|
| `code` | `code` | Preserve exactly; primary key. |
| `nameZh` | `chinese` | Map directly. |
| `nameEn` | `english` | Map directly. |
| `pinyin` | `pinyin` | Preserve directly. |
| `meridian` | `channel_en`, `channel_zh` | Split on `/` when possible; trim English and Chinese sides. Preserve original in `meridian_display` during transition. |
| `region` | `region` | Add to 361 schema; needed by current filters/cards. |
| `location` | `location_zh` | Map directly. |
| `locationEn` | `location_en` | Map directly. |
| `cunMeasurement` | `cun_measurement` | Map directly. |
| `functions` | `functions_zh` | If string, store as one-item array unless a trustworthy structured split already exists. |
| `functionsEn` | `functions_en` | Preserve array; if string, coerce to one-item array. |
| `patterns` | `indications_zh` | Preserve array. |
| `patternsEn` | `indications_en` | Preserve array. |
| `anatomy` | `anatomy_terms` | Add field; do not force into muscles/bones/nerves/vessels without professional review. |
| `evidence` | `evidence` | Add or preserve field; current 361 schema already documents evidence but records may not use it consistently. |
| `cautions` | `contraindications` | Preserve as array; if string, coerce to one-item array. Keep original `cautions` alias during transition if UI still expects it. |
| `sources` | `sources` | Preserve directly. |
| `visualLinks` | `visual_links` | Add field; required for external atlas/source links. |
| `x` | `ui_map.x` | Add transitional UI metadata object; do not mix with clinical/anatomical facts. |
| `y` | `ui_map.y` | Add transitional UI metadata object; do not mix with clinical/anatomical facts. |
| `reviewStatus` | `review_status` | Normalize spelling to snake_case in canonical data; generated app adapter can expose `reviewStatus` if needed. |

Canonical-only fields to preserve when merging:

| 361 field | Decision |
|---|---|
| `muscles`, `bones`, `nerves`, `vessels` | Preserve existing arrays; do not infer from free-text `anatomy`. |
| `needling` | Preserve existing value; future migration should normalize object/string shape separately. |
| `danger` | Preserve existing array. |
| `nccaom_high_yield` | Preserve existing array. |
| `clinical_pearls` | Preserve existing array. |

Merge precedence:
1. Start from the existing `361.json` record when a code already exists.
2. Fill missing canonical fields from embedded app data.
3. For the 25 KI records missing from `361.json`, create new canonical records from embedded app data.
4. Do not overwrite a populated 361 structured field with a weaker embedded field unless the merge script records the decision.
5. Keep a reversible generated adapter so the current app still receives the app-schema field names until UI code is migrated.

Validation required before any merge commit:
- Count after merge should be 235 standard-channel records, not 361, because PC/TE/GB/LR/CV/GV are still incomplete.
- Missing-from-361 list should become empty for embedded standard codes.
- No duplicate `code`.
- Generated app data must still produce 681 `defaultPoints`.
- `scripts/validate-data.js` must still pass deep-equal or explicitly document any intentional adapter-only difference.
- Run `scripts/validate-interactions.js`.

Manual approval point:
- Before replacing the current `361.json`, present a generated diff summary:
  added codes, changed field counts, and any overwritten non-empty fields.

## Phase 2 361 merge applied -- Codex 2026-07-02/03

Ting approved the generated diff summary and Codex applied the merge with:

```powershell
node scripts/merge-361-preview.js --apply-approved
```

Result:
- `data/acupoints/361.json` now has 235 standard-channel records.
- Added 25 records: KI1, KI2, KI4, KI5, KI7-KI27.
- KI3 and KI6 already existed and were preserved.
- Removed 0 records.
- Duplicate codes: 0.
- 39 question-mark placeholder fields were repaired from embedded data.
- 23 non-empty overwrite candidates were not applied automatically and remain documented in `docs/361_MERGE_DIFF_SUMMARY.md`.

Validation after apply:
- `scripts/validate-data.js`: PASS, 681 defaultPoints deep-equal, no duplicate point codes.
- `scripts/validate-interactions.js`: PASS, 0 failures.

Runtime status:
- The app still consumes `data/acupoints/embedded/*.json` through `data/generated/app_data.js`.
- Do not switch runtime to `361.json` until a generated adapter is written and validated.

## Formula merge preview plan -- Codex 2026-07-11

Scope:
- Preview only. Do not overwrite `data/herbs/formulas.json`.
- Target after Ting approval: one rendered canonical formula file, `data/herbs/formulas.json`.
- Current app-rendered formula source remains `data/herbs/formulas.json` with 23 content-bearing records.
- `data/herbs/formula_canon_shortlist.json` remains the 115-record planning/canon source until an approved apply step.

Preview outputs:
- `scripts/merge-formulas-preview.js`
- `docs/FORMULA_MERGE_PREVIEW.json`
- `docs/FORMULA_MERGE_DIFF_SUMMARY.md`

Current counts from preview:

| Dataset / result | Count | Notes |
|---|---:|---|
| `data/herbs/formulas.json` | 23 | Content-bearing records currently rendered by the app. |
| `data/herbs/formula_canon_shortlist.json` | 115 | Draft canon planning records, not rendered by the app. |
| Overlap by `id` | 23 | All current app-rendered formulas are present in the shortlist. |
| Formula-only records | 0 | No rendered formula is missing from the shortlist. |
| Shortlist-only records | 92 | Proposed as draft skeleton additions after approval. |
| Projected merged total | 115 | No apply yet. |
| Identity conflicts | 0 | `id`, `name_zh`, `name_en`, `pinyin` all align for overlaps. |

Field map from formula shortlist to rendered formula target:

| Shortlist field | Target field in `formulas.json` | Decision |
|---|---|---|
| `id` | `id` | Primary key; must match; no auto-change on conflict. |
| `name_zh` | `name_zh` | Identity field; must match; no auto-change on conflict. |
| `name_en` | `name_en` | Identity field; must match; no auto-change on conflict. |
| `pinyin` | `pinyin` | Identity field; must match; no auto-change on conflict. |
| `category` | `category` | Add shortlist category while preserving existing `category_id` and `category_en`. |
| `tier` | `tier` | Add to all records; current shortlist records are `core`. |
| `source_hint` | `source_hint` | Add planning/source hint from shortlist. |
| `comparison_group` | `comparison_group` | Add study comparison group from shortlist. |
| `related_formulas` | `related_formulas` | Add from shortlist after approval; ID references only. |
| `modern_clinical_use_tags` | `modern_clinical_use_tags` | Already present in the 23 rendered records; preview currently shows no differences. Review before future overwrites. |
| `related_conditions` | `related_conditions` | Already present in the 23 rendered records; preview currently shows no differences. ID references only. |
| `clinical_use_note` | `clinical_use_note` | Add conservative clinical-context note from shortlist. |
| `english_exam_track` | `english_exam_track` | Preserve existing formulas.json content-bearing field; skeleton additions get draft empty track. |
| `chinese_depth_track` | `chinese_depth_track` | Preserve existing formulas.json content-bearing field; skeleton additions get draft empty track. |
| content fields | existing formulas.json fields | Preserve existing 23 content (`actions`, `composition`, indications, modifications, contraindications, sources, safety notes). Skeleton additions remain empty draft content. |

Recommended apply policy after Ting approval:
1. Preserve all content-bearing fields already present in `data/herbs/formulas.json` for the 23 overlap records.
2. Add missing planning fields from the shortlist (`tier`, `category`, `source_hint`, `comparison_group`, `related_formulas`, `clinical_use_note`).
3. Add the 92 shortlist-only records as compact `review_status: "draft"` skeletons.
4. Do not upgrade any record to `source_checked` during merge.
5. Keep modern clinical tags and related condition links conservative; they are search/context links, not claims.
