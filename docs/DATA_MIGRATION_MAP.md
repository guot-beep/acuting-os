# Data Migration Map

Purpose: single authoritative answer to "which file is the latest truth?"
Update this file every time data moves. Last update: 2026-07-02 (Claude).

## Authority table — where each dataset lives NOW

| Dataset | Source of truth (edit here) | Consumed by app via | Old location | Status |
|---|---|---|---|---|
| Standard acupoints (LU–KI expansions, starter, professional) | `data/acupoints/embedded/*.json` (10 files) | `data/generated/app_data.js` | app.js lines ~156–4856 (removed) | MIGRATED 2026-07-02, validated lossless |
| Auricular points (in-app 29 records) | `data/auricular/embedded/auricular_points.json` | `data/generated/app_data.js` | app.js `auricularPoints` (removed) | MIGRATED 2026-07-02 |
| EN i18n maps (locations, anatomy glossary, functions, patterns) | `data/acupoints/embedded/i18n_maps.json` | `data/generated/app_data.js` | app.js 4 map consts (removed) | MIGRATED 2026-07-02 |
| Master Tung index (277) | `data/tung/point_index.json` | hand-kept twin `data/tung/point_index.js` | same | UNCHANGED — Phase 2: generate .js from .json |
| Auricular GB93 index (13/93) + worklist | `data/auricular/gb93_index.json`, `gb93_worklist.json` | hand-kept `.js` twins | same | UNCHANGED — Phase 2: generate |
| 361 canonical file | `data/acupoints/361.json` (235 standard-channel records, transitional unified schema) | not loaded by app | synced by hand from app.js | MERGED 2026-07-02/03 by `scripts/merge-361-preview.js`; next phase: generated adapter/runtime migration |
| Formulas (23) / categories / safety flags / pattern links | `data/herbs/*.json` | NOT wired into app yet | same | Phase 2 wiring |
| Pathology conditions (6) + graph seeds | `data/pathology/*.json` | NOT wired | same | Phase 2 wiring |
| Source registry (19) + validation matrix | `data/sources/*.json` | NOT wired | same | Phase 2 wiring |
| Missing-record audit | `data/audits/missing_report.json` | NOT wired (health cards are semi-static) | same | Phase 2 wiring |
| Clinical case & SOAP templates, fertility workflow, billing seeds | `data/clinical_cases/*`, `data/billing/*` | app has its own form logic; templates not wired | same | Phase 3 |
| USER DATA: edited points | browser localStorage `acupoint-atlas-v1` | app runtime | same | NOT in git. Ting must export via 匯出 JSON regularly |
| USER DATA: clinical cases | browser localStorage `acuting-clinical-cases-v1` | app runtime | same | NOT in git. Export via Export cases. PRIVATE — do not commit if identifiable |
| Small UI configs (channel audit, taxonomy, ear anchors) | still inside app.js (lines 5–150, ~5880–6035 region of legacy) | app.js | app.js | Phase 2 extraction |
| Legacy app snapshot | `legacy/` (index.html, app.js, styles.css) | fallback only | root | FROZEN 2026-07-02, do not edit |

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
