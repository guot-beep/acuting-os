# AcuTing OS Legacy Namespace & Retired-ID Integrity Inventory (Task 10A)

> **Execution Date**: 2026-08-25  
> **Audit Status**: **INVENTORY COMPLETE (READ-ONLY)**  
> **Safety Boundary**: 0 Canonical / Generated / Workflow Mutations  

---

## 1. Executive Summary

| Metric | Measurement | Interpretation |
|---|---|---|
| **Total Distinct Namespaces** | **465** | All ID prefixes discovered across `data/**` |
| **D11 Canonical Diagnostic Namespaces** | **4** (`cond.*`, `tdis.*`, `pattern.*`, `sym.*`) | DECISIONS.md D11 locked diagnosis-side namespaces |
| **Non-D11 Namespaces** | **461** | Entity-specific (`herb`, `formula`, `drug`, `tung`, etc.) & legacy staging namespaces |
| **Unique Legacy Diagnostic IDs** | **465** | IDs using legacy diagnostic prefixes (`western_condition`, `eastern_disease`, `med`, `pat`, `symptom`, `tdx`, `rf`, `xwalk`) |
| **Legacy Diagnostic References** | **2023** | Total reference occurrences of legacy diagnostic IDs |
| **Active → Deprecated Reference Edges** | **35** | Active canonical records referencing deprecated targets |
| **Active → Import Stub Reference Edges** | **0** | Active canonical records referencing import stub targets |
| **UI Duplicate Namespace Universes** | **2** | Renderers mapping multiple namespaces to the same entity type |
| **Unresolved Mapping Candidates** | **450** | Legacy diagnostic IDs requiring human/architectural crosswalk adjudication |

---

## 2. Namespace Inventory & D11 Partition

| Namespace | Classification | Reference Count | Unique IDs | Sample IDs | Source Files Count |
|---|---|---|---|---|---|
| `standard_acupoint.*` | `NON_D11_NAMESPACE` | 13420 | 745 | `BL1`, `BL2` | 394 |
| `cond.*` | `D11_CANONICAL_DIAGNOSTIC` | 5353 | 533 | `cond.cluster_headache`, `cond.depression` | 39 |
| `pattern.*` | `D11_CANONICAL_DIAGNOSTIC` | 4609 | 158 | `pattern.kidney_essence_deficiency`, `pattern.liver_kidney_yin_deficiency` | 22 |
| `formula.*` | `NON_D11_NAMESPACE` | 3697 | 244 | `formula.jia_wei_xiao_yao_san`, `formula.jin_gui_shen_qi_wan` | 34 |
| `cloudtcm.*` | `NON_D11_NAMESPACE` | 3224 | 2816 | `cloudtcm.disease_entry.11`, `cloudtcm.disease_entry.19` | 6 |
| `herb.*` | `NON_D11_NAMESPACE` | 2852 | 370 | `herb.bai_shao`, `herb.da_zao` | 19 |
| `sym.*` | `D11_CANONICAL_DIAGNOSTIC` | 823 | 136 | `sym.eye`, `sym.general_limb` | 12 |
| `tdis.*` | `D11_CANONICAL_DIAGNOSTIC` | 801 | 163 | `tdis.chuan_zheng`, `tdis.fu_tong` | 6 |
| `tdx.*` | `NON_D11_NAMESPACE` | 739 | 45 | `tdx.internal_medicine`, `tdx.internal_medicine.externally_contracted_febrile` | 3 |
| `drug.*` | `NON_D11_NAMESPACE` | 737 | 98 | `drug.clomiphene_citrate`, `drug.estradiol` | 9 |
| `rf.*` | `NON_D11_NAMESPACE` | 681 | 226 | `rf.chronic_low_back_pain.legacy01`, `rf.chronic_low_back_pain.legacy02` | 4 |
| `tung.*` | `NON_D11_NAMESPACE` | 555 | 277 | `tung.1010.01`, `tung.1010.02` | 3 |
| `pair.*` | `NON_D11_NAMESPACE` | 454 | 243 | `pair.rel.dan_xing`, `pair.rel.xiang_sha` | 12 |
| `contra.*` | `NON_D11_NAMESPACE` | 452 | 452 | `contra.BL1.A0.clinical_pearls_0`, `contra.BL1.A1.combine_points_zh` | 4 |
| `ear.*` | `NON_D11_NAMESPACE` | 431 | 215 | `ear.abdomen`, `ear.abdominal_distension_area` | 3 |
| `S83.*` | `NON_D11_NAMESPACE` | 201 | 100 | `S83.200A`, `S83.200D` | 3 |
| `N80.*` | `NON_D11_NAMESPACE` | 198 | 99 | `N80.00`, `N80.01` | 3 |
| `M10.*` | `NON_D11_NAMESPACE` | 195 | 97 | `M10.00`, `M10.011` | 2 |
| `western_condition.*` | `NON_D11_NAMESPACE` | 180 | 12 | `western_condition.anovulation`, `western_condition.insulin_resistance` | 10 |
| `1.*` | `NON_D11_NAMESPACE` | 180 | 19 | `1.0`, `1.2g` | 17 |
| `metric.*` | `NON_D11_NAMESPACE` | 162 | 31 | `metric.night_wakings`, `metric.pain_score` | 10 |
| `xwalk.*` | `NON_D11_NAMESPACE` | 150 | 150 | `xwalk.endometriosis`, `xwalk.pcos` | 1 |
| `ex.*` | `NON_D11_NAMESPACE` | 146 | 72 | `ex.hn1`, `ex.hn2` | 3 |
| `med.*` | `NON_D11_NAMESPACE` | 142 | 12 | `med.clomiphene_citrate`, `med.follitropin_alfa` | 8 |
| `supp.*` | `NON_D11_NAMESPACE` | 139 | 47 | `supp.ashwagandha`, `supp.iron` | 9 |
| `drugsystem.*` | `NON_D11_NAMESPACE` | 138 | 7 | `drugsystem.autonomic_nervous_system`, `drugsystem.cardiovascular_renal` | 4 |
| `drugtarget.*` | `NON_D11_NAMESPACE` | 137 | 38 | `drugtarget.aldosterone_receptor`, `drugtarget.carbonic_anhydrase` | 3 |
| `drugclass.*` | `NON_D11_NAMESPACE` | 129 | 56 | `drugclass.carbonic_anhydrase_inhibitors`, `drugclass.loop_diuretics` | 3 |
| `T88.*` | `NON_D11_NAMESPACE` | 128 | 51 | `T88.01`, `T88.02` | 3 |
| `five_shu.*` | `NON_D11_NAMESPACE` | 125 | 5 | `five_shu.he_sea`, `five_shu.jing_river` | 3 |
| ... (435 more namespaces) | ... | ... | ... | ... | ... |

---

## 3. Legacy Diagnostic Namespaces & Crosswalk Status

| Legacy ID | Namespace | Ref Count | Mapping Status | Exact Canonical Twin / Explicit Crosswalk | Mechanical Name Match Candidates |
|---|---|---|---|---|---|
| `eastern_disease.amenorrhea` | `eastern_disease` | 13 | `MULTIPLE_CANDIDATES` | — | `tdis.bi_jing`, `sym.amenorrhea` |
| `eastern_disease.delayed_menstruation` | `eastern_disease` | 8 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `tdis.yue_jing_hou_qi` |
| `eastern_disease.dysmenorrhea` | `eastern_disease` | 11 | `MULTIPLE_CANDIDATES` | — | `tdis.tong_jing`, `sym.dysmenorrhea` |
| `eastern_disease.infertility` | `eastern_disease` | 44 | `NO_CANDIDATE_FOUND` | — | none |
| `eastern_disease.irregular_menstruation` | `eastern_disease` | 26 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `cond.irregular_menstruation` |
| `eastern_disease.threatened_miscarriage_context` | `eastern_disease` | 9 | `NO_CANDIDATE_FOUND` | — | none |
| `med.clomiphene_citrate` | `med` | 13 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `drug.clomiphene` |
| `med.enoxaparin` | `med` | 10 | `EXACT_CANONICAL_TWIN_EXISTS` | `drug.enoxaparin` (twin) | `drug.enoxaparin` |
| `med.estradiol` | `med` | 8 | `EXACT_CANONICAL_TWIN_EXISTS` | `drug.estradiol` (twin) | none |
| `med.follitropin_alfa` | `med` | 11 | `NO_CANDIDATE_FOUND` | — | none |
| `med.ganirelix` | `med` | 8 | `NO_CANDIDATE_FOUND` | — | none |
| `med.human_chorionic_gonadotropin` | `med` | 15 | `NO_CANDIDATE_FOUND` | — | none |
| `med.letrozole` | `med` | 16 | `EXACT_CANONICAL_TWIN_EXISTS` | `drug.letrozole` (twin) | `drug.letrozole` |
| `med.leuprolide` | `med` | 10 | `NO_CANDIDATE_FOUND` | — | none |
| `med.low_dose_aspirin` | `med` | 11 | `NO_CANDIDATE_FOUND` | — | none |
| `med.menotropins` | `med` | 8 | `NO_CANDIDATE_FOUND` | — | none |
| `med.metformin` | `med` | 7 | `EXACT_CANONICAL_TWIN_EXISTS` | `drug.metformin` (twin) | `drug.metformin` |
| `med.progesterone` | `med` | 25 | `EXACT_CANONICAL_TWIN_EXISTS` | `drug.progesterone` (twin) | none |
| `pat.1` | `pat` | 2 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.bi_syndrome` | `pat` | 1 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.blood_deficiency` | `pat` | 1 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.blood_deficiency` (twin) | `pattern.blood_deficiency` |
| `pat.blood_stasis` | `pat` | 1 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.blood_stasis` (twin) | `pattern.blood_stasis` |
| `pat.cold_deficiency` | `pat` | 1 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.damp_heat` | `pat` | 1 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.damp_heat` (twin) | `pattern.damp_heat` |
| `pat.dampness` | `pat` | 1 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.phlegm` | `pat` | 1 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.phlegm` (twin) | `pattern.phlegm` |
| `pat.yang_deficiency` | `pat` | 1 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.yang_deficiency` (twin) | `pattern.yang_deficiency` |
| `symptom.dizziness` | `symptom` | 2 | `EXACT_CANONICAL_TWIN_EXISTS` | `sym.dizziness` (twin) | `tdis.xuan_yun`, `sym.dizziness` |
| `symptom.facial_redness` | `symptom` | 2 | `NO_CANDIDATE_FOUND` | — | none |
| `symptom.headache` | `symptom` | 2 | `EXACT_CANONICAL_TWIN_EXISTS` | `sym.headache` (twin) | `tdis.tou_tong`, `sym.headache` |
| `symptom.irritability` | `symptom` | 2 | `EXACT_CANONICAL_TWIN_EXISTS` | `sym.irritability` (twin) | `sym.irritability` |
| `symptom.lumbar_soreness` | `symptom` | 2 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.anovulation` | `western_condition` | 13 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.diminished_ovarian_reserve` | `western_condition` | 9 | `EXACT_CANONICAL_TWIN_EXISTS` | `cond.diminished_ovarian_reserve` (twin) | `cond.diminished_ovarian_reserve` |
| `western_condition.embryo_transfer` | `western_condition` | 11 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.endometriosis_context` | `western_condition` | 13 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.insulin_resistance` | `western_condition` | 11 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.ivf_cycle` | `western_condition` | 13 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.luteal_support` | `western_condition` | 15 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.male_factor_context` | `western_condition` | 5 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.ovulatory_factor_context` | `western_condition` | 15 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.pcos` | `western_condition` | 34 | `EXACT_CANONICAL_TWIN_EXISTS` | `cond.pcos` (twin) | none |
| `western_condition.recurrent_pregnancy_loss_context` | `western_condition` | 11 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.unexplained_infertility` | `western_condition` | 30 | `NO_CANDIDATE_FOUND` | — | none |

---

## 4. Retired & Deprecated ID Reference Audit

| Retired / Deprecated ID | Entity Type | Chinese Name | Declared Replacement ID | Referenced by Active Records | Referenced by Deprecated Records |
|---|---|---|---|---|---|
| `avs.cancer_tx_precautions` | `avs_advice` | — | — | **0** | 1 |
| `formula.bai_du_san` | `formula` | 敗毒散 | `formula.jing_fang_bai_du_san` | **10** | 1 |
| `formula.du_qi_wan_import_stub` | `formula` | 都氣丸(匯入重複殘根) | `formula.du_qi_wan` | **0** | 1 |
| `formula.fu_yuan_huo_xue_tang_import_stub` | `formula` | 復元活血湯(匯入重複殘根) | `formula.fu_yuan_huo_xue_tang` | **0** | 1 |
| `formula.ling_jiao_gou_teng_yin` | `formula` | 羚角鉤藤丸 | `formula.ling_jiao_gou_teng_tang` | **0** | 1 |
| `herb.han_lian_cao` | `herb` | 旱蓮草 | `herb.mo_han_lian` | **1** | 1 |
| `herb.qian_cao_gen` | `herb` | 茜草根 | `herb.qian_cao` | **0** | 1 |
| `herb.sha_shen` | `herb` | 沙參 | `herb.bei_sha_shen` | **1** | 1 |
| `herb.wu_zei_gu` | `herb` | 烏賊骨 | `herb.hai_piao_xiao` | **0** | 1 |
| `pattern.insomnia_heart_kidney_disharmony` | `pattern` | 心腎不交 | `pattern.heart_kidney_not_communicating` | **4** | 1 |
| `pattern.liver_fire_flaring` | `pattern` | 肝火上炎 | `pattern.liver_fire` | **2** | 1 |
| `pattern.liver_wind_stirring` | `pattern` | 肝風內動 | `pattern.liver_wind` | **17** | 1 |

### Active → Deprecated Edge Risk Inventory

1. `data/herbs/formula_canon_shortlist.json:formula.bai_du_san:records[7].id->formula.bai_du_san`
2. `data/herbs/formula_canon_shortlist.json:formula.gui_zhi_tang:records[0].related_formulas[3]->formula.bai_du_san`
3. `data/herbs/formula_canon_shortlist.json:formula.jiu_wei_qiang_huo_tang:records[2].related_formulas[3]->formula.bai_du_san`
4. `data/herbs/formula_canon_shortlist.json:formula.ma_huang_tang:records[1].related_formulas[3]->formula.bai_du_san`
5. `data/herbs/formula_canon_shortlist.json:formula.xiao_qing_long_tang:records[3].related_formulas[3]->formula.bai_du_san`
6. `data/herbs/formulas.json:formula.gui_zhi_tang:records[0].related_formulas[3]->formula.bai_du_san`
7. `data/herbs/formulas.json:formula.jiu_wei_qiang_huo_tang:records[3].related_formulas[3]->formula.bai_du_san`
8. `data/herbs/formulas.json:formula.ma_huang_tang:records[1].related_formulas[3]->formula.bai_du_san`
9. `data/herbs/formulas.json:formula.xiao_qing_long_tang:records[2].related_formulas[3]->formula.bai_du_san`
10. `data/herbs/herb_pairs.json:pair.han_lian_cao__nu_zhen_zi:pairs[170].herbs[0]->herb.han_lian_cao`
11. `data/herbs/herb_pairs.json:pair.mai_men_dong__sha_shen:pairs[174].herbs[1]->herb.sha_shen`
12. `data/knowledge/comparisons.json:cmp.exterior_wind_cold:records[11].compares[4]->formula.bai_du_san`
13. `data/pathology/pattern_library.json:pattern.yin_qiao_mai_imbalance:records[123].differential_patterns[1].pattern_id->pattern.insomnia_heart_kidney_disharmony`
14. `data/pathology/tdis_registry.json:tdis.bu_mei:records[23].related_patterns[2]->pattern.insomnia_heart_kidney_disharmony`
15. `data/pathology/tdis_registry.json:tdis.tou_tong:records[18].related_patterns[3]->pattern.liver_fire_flaring`
16. `data/pathology/tdis_registry.json:tdis.tou_tong:records[18].related_patterns[4]->pattern.liver_wind_stirring`
17. `data/pathology/tdis_registry.json:tdis.xuan_yun:records[19].related_patterns[5]->pattern.liver_fire_flaring`
18. `data/pathology/tdis_registry.json:tdis.xuan_yun:records[19].related_patterns[6]->pattern.liver_wind_stirring`
19. `data/pathology/tdis_registry.json:tdis.zhong_feng:records[20].related_patterns[1]->pattern.liver_wind_stirring`
20. `data/symptoms/symptoms.json:sym.altered_consciousness:records[91].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
21. `data/symptoms/symptoms.json:sym.altered_consciousness:records[91].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`
22. `data/symptoms/symptoms.json:sym.bradykinesia:records[100].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
23. `data/symptoms/symptoms.json:sym.bradykinesia:records[100].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`
24. `data/symptoms/symptoms.json:sym.facial_deviation:records[90].differentiation_en[1].points_to[0]->pattern.liver_wind_stirring`
25. `data/symptoms/symptoms.json:sym.facial_deviation:records[90].differentiation_zh[1].points_to[0]->pattern.liver_wind_stirring`
26. `data/symptoms/symptoms.json:sym.hemiplegia:records[89].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
27. `data/symptoms/symptoms.json:sym.hemiplegia:records[89].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`
28. `data/symptoms/symptoms.json:sym.insomnia:records[3].differentiation_en[3].points_to[0]->pattern.insomnia_heart_kidney_disharmony`
29. `data/symptoms/symptoms.json:sym.insomnia:records[3].differentiation_zh[3].points_to[0]->pattern.insomnia_heart_kidney_disharmony`
30. `data/symptoms/symptoms.json:sym.limb_stiffness:records[86].differentiation_en[2].points_to[0]->pattern.liver_wind_stirring`
31. `data/symptoms/symptoms.json:sym.limb_stiffness:records[86].differentiation_zh[2].points_to[0]->pattern.liver_wind_stirring`
32. `data/symptoms/symptoms.json:sym.slurred_speech:records[84].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
33. `data/symptoms/symptoms.json:sym.slurred_speech:records[84].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`
34. `data/symptoms/symptoms.json:sym.vertigo:records[9].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
35. `data/symptoms/symptoms.json:sym.vertigo:records[9].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`

---

## 5. UI / Renderer Duplicate Namespace Universe Findings

### Finding 1: `MULTIPLE_NAMESPACES_RENDERED_AS_SAME_ENTITY_TYPE`
- **Location**: `js/knowledge.js:entityKindLabel`
- **Namespaces**: `western_condition` and `cond`
- **Rendered As**: 「西醫病名」
- **Details**: Renderer handles both western_condition.* and cond.* as 西醫病名

### Finding 2: `MULTIPLE_NAMESPACES_RENDERED_AS_SAME_ENTITY_TYPE`
- **Location**: `js/knowledge.js:entityKindLabel`
- **Namespaces**: `eastern_disease` and `tdis`
- **Rendered As**: 「中醫病名」
- **Details**: Renderer handles eastern_disease.* as 中醫病名 alongside canonical tdis.*

---

## 6. Safety & Invariant Verification

- **Canonical Mutation**: 0 bytes diff vs `origin/main`.
- **Generated Data Mutation**: 0 bytes diff vs `origin/main`.
- **CI Workflow Mutation**: 0 bytes diff vs `origin/main`.
- **Output Hygiene**: 0 illegal control characters, 0 replacement characters.
- **Regression Fixtures**: 8/8 PASS.
- **Action Required**: None automatically executed. Awaiting human/architectural review.