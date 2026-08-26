# Canonical Duplicate, Deprecated, Stub & Orphan Reference Inventory (Task 9B Round 2)

> **Audit Date**: 2026-08-25  
> **Scope**: `data/herbs/herb_canon_shortlist.json` & `data/herbs/formulas.json` (+ cross-repo reference scan)  
> **Type**: READ-ONLY Canonical Integrity Inventory (0 Canonical Mutations)  
> **Status**: COMPLETED  

---

## 1. Executive Summary

| Metric | Herbs | Formulas | Total |
|---|---|---|---|
| **Records Scanned** | 363 | 223 | 586 |
| **Deprecated Records** | 4 | 4 | 8 |
| **Import Stub Records** | 0 | 2 | 2 |
| **Duplicate ID Groups (Exact / Case / WS)** | 0 / 0 / 0 | 0 / 0 / 0 | 0 |
| **Exact Chinese Name Collisions** | 0 | 0 | 0 |
| **Exact English Name Collisions** | 1 | 2 | 3 |
| **Normalized Name Collisions** | 0 | 1 | 1 |
| **Alias to Multiple Canonicals** | 3 | 0 | 3 |
| **Alias Collides with Canonical Name** | 15 | 0 | 15 |
| **Alias Self-Duplicates** | 8 | 0 | 8 |
| **Possible Duplicate Groups (Heuristic Only)** | 0 | 2 | 2 |
| **Structured References Scanned** | - | - | 3784 |
| **TARGET_EXISTS_ACTIVE References** | - | - | 3775 |
| **TARGET_EXISTS_DEPRECATED References** | 0 | 4 | 4 |
| **TARGET_EXISTS_IMPORT_STUB References** | 0 | 0 | 0 |
| **TARGET_MISSING (Orphan References)** | 0 | 5 | 5 |
| **DEPRECATED_BUT_REFERENCED_BY_ACTIVE Records** | 0 | 1 | 1 |

---

## 2. Highest-Risk Cleanup Candidates (Inventory Only -- 0 Automated Cleanup)

| Risk Type | Severity | Record / Target ID | Entity | Detail |
|---|---|---|---|---|
| `IMPORT_STUB_MATCHING_ACTIVE_RECORD` | **HIGH** | `formula.du_qi_wan, formula.du_qi_wan_import_stub` | formula | Import stub (formula.du_qi_wan_import_stub) matches active canonical record (formula.du_qi_wan) |
| `IMPORT_STUB_MATCHING_ACTIVE_RECORD` | **HIGH** | `formula.fu_yuan_huo_xue_tang, formula.fu_yuan_huo_xue_tang_import_stub` | formula | Import stub (formula.fu_yuan_huo_xue_tang_import_stub) matches active canonical record (formula.fu_yuan_huo_xue_tang) |
| `DEPRECATED_BUT_REFERENCED_BY_ACTIVE` | **HIGH** | `formula.bai_du_san` | formula | Deprecated record formula.bai_du_san is referenced by 4 active records/fields. |
| `TARGET_MISSING_ORPHAN_REFERENCE` | **MEDIUM** | `formula.gui_zhi_jia_ge_gen_tang` | formula | Target ID formula.gui_zhi_jia_ge_gen_tang is missing from canonical registries but referenced by 1 places. |
| `TARGET_MISSING_ORPHAN_REFERENCE` | **MEDIUM** | `formula.xiao_qing_long_jia_shi_gao_tang` | formula | Target ID formula.xiao_qing_long_jia_shi_gao_tang is missing from canonical registries but referenced by 1 places. |
| `TARGET_MISSING_ORPHAN_REFERENCE` | **MEDIUM** | `formula.bai_hu_jia_ren_shen_tang` | formula | Target ID formula.bai_hu_jia_ren_shen_tang is missing from canonical registries but referenced by 1 places. |
| `TARGET_MISSING_ORPHAN_REFERENCE` | **MEDIUM** | `formula.bai_hu_jia_gui_zhi_tang` | formula | Target ID formula.bai_hu_jia_gui_zhi_tang is missing from canonical registries but referenced by 1 places. |
| `TARGET_MISSING_ORPHAN_REFERENCE` | **MEDIUM** | `formula.bai_hu_jia_cang_zhu_tang` | formula | Target ID formula.bai_hu_jia_cang_zhu_tang is missing from canonical registries but referenced by 1 places. |

---

## 3. Deprecated & Import Stub Inventory

### A. Deprecated Herbs (4 records)
| Record ID | Chinese Name | English Name | Status | Incoming Refs | Risk | Reason |
|---|---|---|---|---|---|---|
| `herb.han_lian_cao` | 旱蓮草 | Eclipta | `deprecated` | 0 | `UNREFERENCED_DEPRECATED` | Marked deprecated in canonical record |
| `herb.wu_zei_gu` | 烏賊骨 | Cuttlebone | `deprecated` | 0 | `UNREFERENCED_DEPRECATED` | Marked deprecated in canonical record |
| `herb.sha_shen` | 沙參 | Glehniae / Adenophorae Radix | `deprecated` | 0 | `UNREFERENCED_DEPRECATED` | Marked deprecated in canonical record |
| `herb.qian_cao_gen` | 茜草根 | Rubiae Radix et Rhizoma | `deprecated` | 0 | `UNREFERENCED_DEPRECATED` | Marked deprecated in canonical record |

### B. Deprecated Formulas (4 records)
| Record ID | Chinese Name | English Name | Status | Incoming Refs | Risk | Reason |
|---|---|---|---|---|---|---|
| `formula.bai_du_san` | 敗毒散 | Overcome Pathogenic Influences Powder | `deprecated` | 4 | `DEPRECATED_BUT_REFERENCED_BY_ACTIVE` | Marked deprecated in canonical record |
| `formula.ling_jiao_gou_teng_yin` | 羚角鉤藤丸 | Antelope Horn and Uncaria Decoction | `deprecated` | 0 | `UNREFERENCED_DEPRECATED` | Marked deprecated in canonical record |
| `formula.du_qi_wan_import_stub` | 都氣丸(匯入重複殘根) | Du Qi Wan | `deprecated` | 0 | `UNREFERENCED_DEPRECATED` | Marked deprecated in canonical record |
| `formula.fu_yuan_huo_xue_tang_import_stub` | 復元活血湯(匯入重複殘根) | Fu Yuan Huo Xue Tang | `deprecated` | 0 | `UNREFERENCED_DEPRECATED` | Marked deprecated in canonical record |

---

## 4. Name & Alias Collisions

### A. Exact Name Collisions (Herbs)
| Colliding Name | Collision Field | Record IDs |
|---|---|---|
| Stephania Root | `name_en` | `herb.fang_ji, herb.han_fang_ji` |

### B. Exact Name Collisions (Formulas)
| Colliding Name | Collision Field | Record IDs |
|---|---|---|
| Rhinoceros Horn and Rehmannia Decoction | `name_en` | `formula.xi_jiao_di_huang_tang, formula.xi_jiao_di_huang_wan` |
| Antelope Horn and Uncaria Decoction | `name_en` | `formula.ling_jiao_gou_teng_tang, formula.ling_jiao_gou_teng_yin` |

### C. Alias Collisions (Herbs & Formulas)
| Collision Type | Alias | Entity | Detail / Record IDs |
|---|---|---|---|
| `ALIAS_TO_MULTIPLE_CANONICAL` | 烏頭 | herb | `herb.chuan_wu, herb.cao_wu` |
| `ALIAS_TO_MULTIPLE_CANONICAL` | Phaseolus | herb | `herb.chi_xiao_dou, herb.lu_dou` |
| `ALIAS_TO_MULTIPLE_CANONICAL` | 米酒 | herb | `herb.bai_jiu, herb.jiu` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 沙參 | herb | In `herb.bei_sha_shen` collides with canonical of `herb.sha_shen` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 茜草根 | herb | In `herb.qian_cao` collides with canonical of `herb.qian_cao_gen` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 旱蓮草 | herb | In `herb.mo_han_lian` collides with canonical of `herb.han_lian_cao` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 防己 | herb | In `herb.han_fang_ji` collides with canonical of `herb.fang_ji` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 銀杏 | herb | In `herb.bai_guo` collides with canonical of `herb.yin_xing` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | Ginkgo Semen | herb | In `herb.bai_guo` collides with canonical of `herb.yin_xing` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 木通 | herb | In `herb.chuan_mu_tong` collides with canonical of `herb.mu_tong` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 烏賊骨 | herb | In `herb.hai_piao_xiao` collides with canonical of `herb.wu_zei_gu` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 槐花 | herb | In `herb.huai_mi` collides with canonical of `herb.huai_hua` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 棕櫚皮 | herb | In `herb.zong_lu_tan` collides with canonical of `herb.zong_lu_pi` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 茶葉 | herb | In `herb.lu_cha` collides with canonical of `herb.cha_ye` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 棕櫚炭 | herb | In `herb.zong_lu_pi` collides with canonical of `herb.zong_lu_tan` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 白酒 | herb | In `herb.jiu` collides with canonical of `herb.bai_jiu` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 黃酒 | herb | In `herb.jiu` collides with canonical of `herb.huang_jiu` |
| `ALIAS_COLLIDES_WITH_CANONICAL_NAME` | 綠茶 | herb | In `herb.cha_ye` collides with canonical of `herb.lu_cha` |

---

## 5. Cross-Record Possible Duplicate Heuristics (`POSSIBLE_DUPLICATE`)

| Entity | Record IDs | Why Flagged | Matching Evidence |
|---|---|---|---|
| formula | `formula.du_qi_wan, formula.du_qi_wan_import_stub` | `IMPORT_STUB_CORRESPONDENCE` | Import stub (formula.du_qi_wan_import_stub) matches active canonical record (formula.du_qi_wan) |
| formula | `formula.fu_yuan_huo_xue_tang, formula.fu_yuan_huo_xue_tang_import_stub` | `IMPORT_STUB_CORRESPONDENCE` | Import stub (formula.fu_yuan_huo_xue_tang_import_stub) matches active canonical record (formula.fu_yuan_huo_xue_tang) |

---

## 6. Orphan References Audit (`TARGET_MISSING`) -- 5 references

| Source File | Source Record ID | Field Path | Referenced ID | Entity Type |
|---|---|---|---|---|
| `data/herbs/formulas.json` | `formula.gui_zhi_tang` | `formula_family[0]` | `formula.gui_zhi_jia_ge_gen_tang` | formula |
| `data/herbs/formulas.json` | `formula.xiao_qing_long_tang` | `formula_family[0]` | `formula.xiao_qing_long_jia_shi_gao_tang` | formula |
| `data/herbs/formulas.json` | `formula.bai_hu_tang` | `formula_family[0]` | `formula.bai_hu_jia_ren_shen_tang` | formula |
| `data/herbs/formulas.json` | `formula.bai_hu_tang` | `formula_family[1]` | `formula.bai_hu_jia_gui_zhi_tang` | formula |
| `data/herbs/formulas.json` | `formula.bai_hu_tang` | `formula_family[2]` | `formula.bai_hu_jia_cang_zhu_tang` | formula |

---

## 7. Invariant & Safety Proof

- **Canonical Herb Data (`data/herbs/herb_canon_shortlist.json`)**: Byte-for-byte unchanged vs starting main.
- **Canonical Formula Data (`data/herbs/formulas.json`)**: Byte-for-byte unchanged vs starting main.
- **Generated Knowledge Bundles**: 0 mutations.
- **Output Hygiene**: 0 illegal control characters (U+0000–U+001F except TAB/LF/CR), 0 replacement characters.
- **Audit Completeness**: 100% deterministic, rerunnable, and network-independent.
