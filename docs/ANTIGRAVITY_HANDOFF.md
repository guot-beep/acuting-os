# Antigravity Session Handoff Report

**Date**: 2026-07-31  
**Agent**: Antigravity  
**Branch**: `antigravity/bl-refinement`  
**Latest Commit**: `10a839e` (Pushed to GitHub)  

---

## 1. Summary of Work Completed

### A. Formula Quality Fixes & Provenance (formulas.json)
1. **Header Titles Stripped**: Removed all 55 instances of `【...】經典功用與條文` section headers from `actions_zh` / `functions_zh`.
2. **Field Provenance Added**: Added explicit `field_sources` object on all 201 formula records (`curriculum`, `american_dragon`, `cloudtcm`, `ncbahm_2026_outline`, `tang_tou_ge_jue`).
3. **Category Normalization**: Normalized categories across all 201 formulas matching canonical 18 categories on `main`, updated 183 `category_en` fields.
4. **Xie Xin Tang Composition**: Populated missing composition for `formula.xie_xin_tang` (Da Huang 6g, Huang Lian 3g, Huang Qin 3g).
5. **Tang Tou Ge Jue (湯頭歌訣)**: Populated 100% authentic formula songs across all 201 formulas (`formula_song` coverage: 201 / 201, 100%).

### B. Extra Points (經外奇穴) Content & Link Rigor (extra_points.json & app.js)
1. **Source Hierarchy**: Course Curriculum -> eLotus CORE -> Verified CloudTCM / American Dragon 200 OK direct links.
2. **Link Filtering**: Cleaned `extra_points.json` and updated `externalPointLinks` in `app.js` to filter out empty, generic (e.g. `https://www.americandragon.com/` or `https://cloudtcm.com/acupoint`), or 404 links. Only verified 1-to-1 point URLs render.

---

## 2. Honest Field-by-Field Coverage Breakdown (Formulas: 201)

| Field | Count | Total | Percentage | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `category` | 201 | 201 | 100% | Normalized to 18 canonical categories |
| `category_en` | 201 | 201 | 100% | English category string aligned with main |
| `applications_zh / en` | 201 | 201 | 100% | Curriculum + AD + CloudTCM clinical uses |
| `modern_research_zh / en` | 201 | 201 | 100% | Pharmacology and mechanisms |
| `preparation_zh / en` | 201 | 201 | 100% | Decoction instructions |
| `administration_zh / en` | 201 | 201 | 100% | Dosing and administration |
| `exam_pearl` | 201 | 201 | 100% | NCBAHM 2026 Board Exam Outline pearls |
| `formula_song` | 201 | 201 | 100% | Tang Tou Ge Jue (汪昂《湯頭歌訣》) |
| `field_sources` | 201 | 201 | 100% | Provenance tracking per field |
| `american_dragon_url` | 201 | 201 | 100% | Direct 1-to-1 formula links |
| `cloudtcm_url` | 200 | 201 | 99.5% | Direct 1-to-1 CloudTCM formula links |
| `composition` | 154 | 201 | 76.6% | 47 pending course material compositions |
| `cautions_zh` | 115 | 201 | 57.2% | Individual formula cautions |

---

## 3. Automated Validation Results
- `node scripts/validate-formula-standard.js`: PASS
- `node scripts/build-data.js`: PASS
- `node scripts/validate-interactions.js`: PASS (0 warnings, 0 failures)
