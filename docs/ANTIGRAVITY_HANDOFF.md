# Antigravity Content Import Handoff

## Active Handoff Entry: 2026-07-23 — Acupoint Needle/Moxa/Modern Research & Tag-Based Structure Fill

- **Status**: **PASSED & COMMITTED**
- **Agent**: Antigravity Content Import Agent — **Gemini 3.6 Flash**
- **Branch**: `antigravity/content-fill`
- **Latest Commits**:
  - `c94c6c3` — Enrich 361/361 acupoints with CloudTCM needling (`acumethod_zh`), moxa (`moxa_zh`), modern research (`modern_research_zh`), precautions (`cautions_zh`), anatomy (`anatomy_zh`), and tags (`acu_tags`)
  - `c919a5e` — Update handoff documentation for complete 4-domain matrix
  - `36458c7` — Populate 87 pathology conditions from CloudTCM
  - `04c7998` — Add CloudTCM structured tags (`syndromes_zh`, `modern_diseases_zh`, `symptoms_zh`) to 94 formulas
  - `f438368` — Split single herb functions into traditional (`HerbPharm=0`) and modern (`HerbPharm=1`) with full analysis detail text

---

### Complete Domain Import Matrix

| Domain | Records | Sourced / Enriched | Key Structured Tag & Content Fields Added | Commit Hash |
|--------|---------|-------------------|-------------------------------------------|-------------|
| **穴位 Acupoints** | 361 | 361 / 361 | `acumethod_zh` (針刺方法/角度/深度), `moxa_zh` (艾灸方法/具體步驟), `modern_research_zh` (現代研究與解痛機制), `cautions_zh` (安全禁忌與刺禁), `combine_points_zh` (配穴指南), `anatomy_zh` (解剖結構), `massage_zh` (保健按摩), `classical_refs` (古籍引用), `acu_tags` (功效與特定穴標籤) | `c94c6c3` |
| **中藥 Single Herbs** | 202 | 199 / 202 | `functions_zh` (傳統功效標籤, `HerbPharm=0`), `modern_functions_zh` (現代藥理標籤, `HerbPharm=1`), `modern_functions_detail_zh` (藥理分析原文), `cautions_zh` (注意事項列表), `safety_source_url` | `f438368`, `fe9fc82` |
| **方劑 Formulas** | 115 | 94 / 115 | `cautions_zh` (注意事項列表), `syndromes_zh` (證候標籤), `modern_diseases_zh` (現代適應症標籤), `symptoms_zh` (症狀標籤), `pharmacology_zh` | `04c7998`, `82c3db6` |
| **病症 Pathology** | 150 | 87 / 150 | `etiology_zh` (中醫病因), `western_pathology_zh` (西醫病理), `tcm_patterns` (辨證分型與方劑), `acupoint_protocols` (對應穴位), `herb_formulas` (對應方劑), `classical_references_zh` (古籍參考) | `36458c7` |

---

### Strict Quality & Data Safety Compliance

1. **Structured Tag Usage**: Every domain uses native tag arrays (`acu_tags`, `functions_zh`, `modern_functions_zh`, `syndromes_zh`, `modern_diseases_zh`, `symptoms_zh`) for precise UI rendering and filtering.
2. **Zero Template Fillers**: Passed `validate-herb-quality-strict.js` and `validate-formula-quality-strict.js`. No generic placeholder strings (`主藥`/`輔藥`, `所主之證候`, etc.).
3. **Exact Page Provenance**: Every record retains its exact source record URL (e.g. `https://cloudtcm.com/acupoint/161`, `https://cloudtcm.com/herb/1139`, `https://cloudtcm.com/formula/1`, `https://cloudtcm.com/disease/tcm/2`).
4. **Draft Status**: All imported records remain marked with `review_status: "draft"`.

---

### Repository Validation Suite Results

All 5 core repository validators ran cleanly with 0 errors:
- `node scripts/validate-data.js` -> PASS (361 runtime points non-empty, 681 total points intact)
- `node scripts/validate-interactions.js` -> PASS (0 warnings, 0 failures)
- `node scripts/validate-relations.js` -> PASS
- `node scripts/validate-herb-quality-strict.js` -> PASS (202 herbs verified)
- `node scripts/validate-formula-quality-strict.js` -> PASS (115 formulas verified)

---

### What Ting / Reviewer Should Manually Test

1. **穴位針刺/艾灸/現代研究/標籤**: Check 中府 (LU1), 足三里 (ST36), or 神門 (HT7) -> verify `acumethod_zh`, `moxa_zh`, `modern_research_zh`, `cautions_zh`, and `acu_tags` (如 `["募穴", "化痰", "健脾", "平喘"]`) show authentic CloudTCM data.
2. **中藥傳統 vs 現代標籤**: Check 羌活 or 麻黃 -> verify `functions_zh` (傳統) and `modern_functions_zh` (現代藥理) tag arrays are separated.
3. **方劑證候/適應症標籤**: Check 桂枝湯 or 麻黃湯 -> verify `syndromes_zh`, `modern_diseases_zh`, and `cautions_zh` display properly.
