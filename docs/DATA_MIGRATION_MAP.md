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
| 361 canonical file | `data/acupoints/361.json` (210 records, DIFFERENT schema) | not loaded by app | synced by hand from app.js | STALE as canonical — Phase 2 will merge embedded/*.json into it and make it the single acupoint truth |
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
