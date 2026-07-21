# Herb Comparison Group Diff Summary

H1 review-only preview. Existing herb categories are reused as the comparison-group boundary; no new clinical classification is inferred.

## Migration Safety Plan

1. What changes: add `comparison_group`, generated `related_herbs[]`, and empty `substitution_context_zh` to each of 202 herb records.
2. Why: enable same-category comparison and substitution-thinking navigation while preserving stable herb IDs.
3. Backup: canonical data is unchanged in this preview; any later approved apply must be a standalone git commit.
4. Validation: reject unknown/self/cross-group IDs, duplicate IDs, group-slug collisions, and non-empty target conflicts.
5. Rollback: revert the standalone apply commit; no existing field or ID would be renamed or deleted.

## Summary

| Metric | Count |
| --- | ---: |
| Herbs | 202 |
| Existing categories reused | 34 |
| Proposed comparison groups | 34 |
| Proposed directed related-herb links | 1430 |
| Singleton groups | 4 |
| Conflicts | 0 |
| Canonical writes | 0 |

## Group Size Review

| Group | Existing category | Herbs | Review note |
| --- | --- | ---: | --- |
| `invigorate_blood` | 活血化瘀藥 / Invigorate Blood | 15 | Large group: Ting/Claude should confirm this category is sufficiently specific |
| `release_exterior_warm_acrid` | 解表藥 / Release Exterior - Warm Acrid | 12 | Large group: Ting/Claude should confirm this category is sufficiently specific |
| `regulate_qi` | 理氣藥 / Regulate Qi | 11 | Large group: Ting/Claude should confirm this category is sufficiently specific |
| `tonify_yang` | 補虛藥 / Tonify Yang | 11 | Large group: Ting/Claude should confirm this category is sufficiently specific |
| `tonify_yin` | 補虛藥 / Tonify Yin | 11 | Large group: Ting/Claude should confirm this category is sufficiently specific |
| `drain_dampness` | 利水滲濕藥 / Drain Dampness | 9 | Mechanical same-category group |
| `release_exterior_cool_acrid` | 解表藥 / Release Exterior - Cool Acrid | 9 | Mechanical same-category group |
| `tonify_qi` | 補虛藥 / Tonify Qi | 9 | Mechanical same-category group |
| `clear_heat_resolve_toxicity` | 清熱藥 / Clear Heat - Resolve Toxicity | 8 | Mechanical same-category group |
| `stabilize_and_bind` | 收澀藥 / Stabilize and Bind | 8 | Mechanical same-category group |
| `stop_bleeding` | 止血藥 / Stop Bleeding | 8 | Mechanical same-category group |
| `warm_interior` | 溫裡藥 / Warm Interior | 8 | Mechanical same-category group |
| `dispel_wind_damp` | 祛風濕藥 / Dispel Wind-Damp | 7 | Mechanical same-category group |
| `stop_cough_and_wheeze` | 化痰止咳平喘藥 / Stop Cough and Wheeze | 7 | Mechanical same-category group |
| `clear_heat_drain_fire` | 清熱藥 / Clear Heat - Drain Fire | 6 | Mechanical same-category group |
| `tonify_blood` | 補虛藥 / Tonify Blood | 6 | Mechanical same-category group |
| `transform_dampness` | 化濕藥 / Transform Dampness | 6 | Mechanical same-category group |
| `calm_spirit` | 安神藥 / Calm Spirit | 5 | Mechanical same-category group |
| `clear_heat_dry_damp` | 清熱藥 / Clear Heat - Dry Damp | 5 | Mechanical same-category group |
| `extinguish_wind` | 平肝息風藥 / Extinguish Wind | 5 | Mechanical same-category group |
| `relieve_food_stagnation` | 消食藥 / Relieve Food Stagnation | 5 | Mechanical same-category group |
| `transform_phlegm_cool` | 化痰止咳平喘藥 / Transform Phlegm - Cool | 5 | Mechanical same-category group |
| `clear_heat_cool_blood` | 清熱藥 / Clear Heat - Cool Blood | 4 | Mechanical same-category group |
| `expel_parasites` | 驅蟲藥 / Expel Parasites | 4 | Mechanical same-category group |
| `clear_deficiency_heat` | 清熱藥 / Clear Deficiency Heat | 3 | Mechanical same-category group |
| `transform_phlegm` | 化痰止咳平喘藥 / Transform Phlegm | 3 | Mechanical same-category group |
| `anchor_and_calm` | 安神/平肝藥 / Anchor and Calm | 2 | Mechanical same-category group |
| `drain_downward` | 瀉下藥 / Drain Downward | 2 | Mechanical same-category group |
| `moisten_intestines` | 瀉下藥 / Moisten Intestines | 2 | Mechanical same-category group |
| `open_orifices` | 開竅藥 / Open Orifices | 2 | Mechanical same-category group |
| `anchor_and_direct_downward` | 重鎮降逆藥 / Anchor and Direct Downward | 1 | Singleton: related_herbs remains empty |
| `direct_qi_downward` | 化痰降逆藥 / Direct Qi Downward | 1 | Singleton: related_herbs remains empty |
| `harsh_expellants` | 瀉下藥 / Harsh Expellants | 1 | Singleton: related_herbs remains empty |
| `transform_phlegm_warm` | 化痰止咳平喘藥 / Transform Phlegm - Warm | 1 | Singleton: related_herbs remains empty |

## Sample Proposed Records

| Herb | Group | Related herb IDs |
| --- | --- | --- |
| `herb.ma_huang` 麻黃 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.gui_zhi` 桂枝 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.zi_su_ye` 紫蘇葉 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua` |
| `herb.sheng_jiang` 生薑 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.xiang_ru` 香薷 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.jing_jie` 荊芥 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.fang_feng` 防風 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.qiang_huo` 羌活 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.bai_zhi` 白芷 | `release_exterior_warm_acrid` | `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.xi_xin` 細辛 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.cang_er_zi` 蒼耳子 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.xin_yi_hua`, `herb.zi_su_ye` |
| `herb.xin_yi_hua` 辛夷花 | `release_exterior_warm_acrid` | `herb.bai_zhi`, `herb.cang_er_zi`, `herb.fang_feng`, `herb.gui_zhi`, `herb.jing_jie`, `herb.ma_huang`, `herb.qiang_huo`, `herb.sheng_jiang`, `herb.xi_xin`, `herb.xiang_ru`, `herb.zi_su_ye` |

## Permanent UI Wording

> 同組相近藥供比較與替換思考參考，非自動替代；劑量與配伍調整屬專業判斷。

## Gate

Review the 34 group boundaries, especially groups larger than 10 herbs. Do not apply this preview until Ting/Claude approves the mechanical category-to-group rule. No substitution prose or dosage is included.
