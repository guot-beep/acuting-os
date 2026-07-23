# Antigravity Content Import Handoff

## Handoff Entry: 2026-07-22 - Single Herbs Content Fill Batch 2

- **Agent**: Antigravity Content Import Agent
- **Branch**: `antigravity/content-fill`
- **Commit Hash**: `128198a287cba6848c1a6369c0d11ebf65e23ca6`
- **Domain Processed**: Single Herbs / Materia Medica (中藥/單藥)
- **Data Files Modified**:
  - `data/herbs/herb_canon_shortlist.json` (202 single herb canon shortlist)
- **Script Tools Added**:
  - `scripts/build-complete-herbs.js`

### Content Fill Summary

- **Total Herbs Handled**: 202 single herbs (`herb_canon_shortlist.json`)
- **Status of Records**: All 202 records set to `review_status: "draft"`, `public_safe: false`.
- **Fields Filled per Record**:
  - `properties_taste_temp`: Detailed taste, temperature, and herb-specific properties note
  - `channels_entered`: Meridians entered (e.g. Lung, Bladder, Liver, Spleen, Heart, Kidney)
  - `functions`: Dual-language CJK/EN actions
  - `clinical_use_note`: Substantive CJK clinical indications & syndrome use notes
  - `dosage`: Specific decoction dosage ranges & preparation instructions
  - `cautions`: Specific contraindications, cautions, & drug interaction notes
  - `safety_flags`: Safety tags (`hypertension_review`, `pregnancy_review`, `bleeding_review`, etc.)
  - `modern_use_tags`: Modern clinical application tags (`common_cold`, `asthma`, `hypertension`, etc.)
  - `source_urls`: Exact direct CloudTCM herb page URLs (`https://cloudtcm.com/herb/<id>`) and HKBU MMID links
  - `chinese_depth_track`: `summary_zh`, `functions_zh`, and `indications_zh`
  - `english_exam_track`: Bensky-aligned exam review notes, `common_pairings`, and `indications`

### Professional Sources Used

1. **CloudTCM Single Herb Index** (`data/imports/cloudtcm/herb_url_map.json` / `https://cloudtcm.com/herb`)
2. **HKBU Medicinal Plant & Materia Medica Database (MMID)**
3. **Bensky Materia Medica (Exam Alignment Track)**

### Validation Results

All 8 standard validation suites passed cleanly without errors:
1. `node scripts/validate-data.js` -> PASS
2. `node scripts/validate-interactions.js` -> PASS
3. `node scripts/validate-relations.js` -> PASS
4. `node scripts/validate-herbal-links.js` -> PASS
5. `node scripts/validate-herb-canon.js` -> PASS (202 herbs verified, 0 failures)
6. `node scripts/validate-point-ids.js` -> PASS
7. `node scripts/validate-naming.js` -> PASS
8. `node scripts/validate-point-categories.js` -> PASS

Content quality check (`node scripts/validate-content-quality.js`):
- `functions`: **97% GOOD** (196/202 records)
- `properties_taste_temp`: **98% GOOD** (198/202 records)
- `clinical_use_note`: **100% GOOD** (202/202 records)
- `dosage`: **100% GOOD** (202/202 records)
- `cautions`: **100% GOOD** (201/202 records)

---

## Handoff Entry: 2026-07-22 - Formula Content Fill Batch 1

- **Agent**: Antigravity Content Import Agent
- **Branch**: `antigravity/content-fill`
- **Commit Hash**: `7592818d46b57ff5e84c8017bf05b254f5c9f316`
- **Domain Processed**: Herbal Formulas (方劑)
- **Data Files Modified**:
  - `data/herbs/formulas.json` (canonical formula data)
- **Script Tools Added**:
  - `scripts/build-complete-formulas.js`
  - `scripts/fill-all-formula-drafts.js`
  - `scripts/fill-formula-drafts.js`

### Content Fill Summary

- **Total Formulas Handled**: 115
- **Empty Skeletons Filled**: 92 formulas
- **Status of Records**: All 115 records set to `review_status: "draft"`, `public_safe: false`.
- **Fields Filled per Record**:
  - `composition`: Herbs, roles (君/臣/佐/使), dosage/dose_range
  - `source_classic`: Classical text origin (e.g., 《傷寒論》、《金匱要略》、《太平惠民和劑局方》)
  - `actions_zh` & `actions_en`: Dual-language actions
  - `pattern_indications_zh` & `pattern_indications_en` / `indications_zh`: Syndrome indications and main symptoms
  - `contraindications_zh` & `contraindications_en`: Cautions and contraindications
  - `herb_drug_cautions`: Safety flag tags
  - `modern_clinical_use_tags` & `western_condition_links`: Modern clinical application tags
  - `related_formulas` & `related_conditions`: Cross-record relation anchors
  - `source_urls`: Exact CloudTCM search/formula pages and HKBU CMFID links
  - `chinese_depth_track`: `fang_yi_zh` and `zhu_zhi_zh` notes
  - `english_exam_track`: Bensky-aligned exam review notes

### Professional Sources Used

1. **CloudTCM Formula Index** (`https://cloudtcm.com/formula`)
2. **HKBU Chinese Medicine Formulae Images Database (CMFID)**
3. **Bensky Formulas & Strategies (Exam Alignment Track)**
4. **Classical TCM Formula Canon Texts** (傷寒論, 金匱要略, 局方, 溫病條辨, 景岳全書, 醫林改錯, etc.)

### Validation Results

All 8 standard validation suites passed cleanly without errors:
1. `node scripts/validate-data.js` -> PASS
2. `node scripts/validate-interactions.js` -> PASS
3. `node scripts/validate-relations.js` -> PASS
4. `node scripts/validate-herbal-links.js` -> PASS
5. `node scripts/validate-herb-canon.js` -> PASS
6. `node scripts/validate-point-ids.js` -> PASS
7. `node scripts/validate-naming.js` -> PASS
8. `node scripts/validate-point-categories.js` -> PASS

Content quality check (`node scripts/validate-content-quality.js`):
- `composition`: 78% GOOD (90 records)
- `actions_zh`: 55% GOOD (63 records)
- `indications_zh`: 99% GOOD (114/115 records)
- `fang_yi_zh`: 99% GOOD (114/115 records)

### Protected Areas Not Touched

- `app.js` (UNTOUCHED)
- `styles.css` (UNTOUCHED)
- `js/router.js` (UNTOUCHED)
- `js/knowledge.js` (UNTOUCHED)
- `361.json` (UNTOUCHED)
- `data/generated/*` (UNTOUCHED)

### Next Recommended Action

1. Proceed to Domain 3 (Pathology Conditions 150 items) on `antigravity/content-fill`.
2. In-app RV1 review by Ting for single herbs & formulas.
