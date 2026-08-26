# Source Transport Integrity Audit (Task 9A Round 2)

> **Audit Date**: 2026-08-25  
> **Scope**: `data/herbs/herb_canon_shortlist.json` & `data/herbs/formulas.json`  
> **Type**: READ-ONLY Canonical Provenance & Transport Integrity Audit  
> **Status**: COMPLETED -- Canonical Data Byte-for-Byte Unchanged  

---

## 1. Executive Summary

| Metric | Herbs | Formulas | Total |
|---|---|---|---|
| **Records Scanned** | 363 | 223 | 586 |
| **Unique HTTP URLs Probed** | 711 | 552 | 1260 |
| **Total URL References** | 5946 | 1769 | 7715 |
| **OK_200 (Direct 200)** | 620 | 470 | 1087 |
| **REDIRECT_TO_200 (Followed Redirect to 200)** | 3 | 0 | 3 |
| **DEAD_4XX (HTTP 4xx Client Error)** | 88 | 6 | 94 |
| **SERVER_5XX (HTTP 5xx Server Error)** | 0 | 73 | 73 |
| **TIMEOUT (Request Timeout >10s)** | 0 | 2 | 2 |
| **DNS / TLS / Network Errors** | 0 | 0 | 0 |
| **Local Source Paths Checked** | 2483 | 2360 | 4843 |
| **LOCAL_EXISTS** | 1988 | 1632 | 3620 |
| **LOCAL_MISSING** | 495 | 728 | 1223 |
| **Malformed URLs** | 0 | 0 | 0 |
| **Duplicate / Shared URL Groups** | 471 | 248 | 716 |

---

## 2. URL-Bearing Fields Inventory (`url_field_inventory`)

### Herbs URL-bearing Fields (55 fields)
- `safety_source_url`
- `exact_source_url`
- `cloudtcm_url`
- `american_dragon_url`
- `atlas_url`
- `image`
- `modern_functions_source_url`
- `source_urls[]`
- `source_citations[].url`
- `field_sources.functions_zh[]`
- `field_sources.actions_en[]`
- `field_sources.indications_zh[]`
- `field_sources.modern_functions_zh[]`
- `field_sources.modern_functions_en[]`
- `field_sources.key_pairs[]`
- `field_sources.dosage[]`
- `field_sources.cautions_zh[]`
- `field_sources.cautions_en[]`
- `field_sources.classical_text_zh[]`
- `field_sources.classical_text_en[]`
- `field_sources.contraindications_zh[]`
- `field_sources.contraindications_en[]`
- `field_sources.clinical_use_note[]`
- `field_sources.traditional_functions_zh[]`
- `field_sources.modern_pharmacology_zh[]`
- `field_sources.aliases_zh[]`
- `field_sources.category_zh[]`
- `field_sources.modern_functions_detail_zh[]`
- `field_sources.properties_taste_temp[]`
- `field_sources.condition_tags_en[]`
- `field_sources.tcm_properties[]`
- `field_sources.pao_zhi_notes_zh[]`
- `field_sources.channels_zh[]`
- `field_sources.condition_tags_zh[]`
- `field_sources.dosage_g[]`
- `field_sources.safety_info[]`
- `field_sources.safety_flags[]`
- `field_sources.modern_pharmacology_en[]`
- `field_sources.modern_pharmacology[]`
- `field_sources.channels_en[]`
- `field_sources.indications_en[]`
- `field_sources.name_en[]`
- `field_sources.pharmaceutical_latin[]`
- `field_sources.related_formulas[]`
- `field_sources.exam_importance[]`
- `field_sources.herb_pairs[]`
- `field_sources.identity[]`
- `field_sources.exam_pearl[]`
- `field_sources.category[]`
- `field_sources.safety_source_url`
- `field_sources.taste_temperature_zh[]`
- `visual_links[].url`
- `field_sources.safety[]`
- `field_sources.cloudtcm`
- `field_sources.american_dragon`

### Formulas URL-bearing Fields (34 fields)
- `safety_source_url`
- `exact_source_url`
- `cloudtcm_url`
- `american_dragon_url`
- `tags_source_url`
- `source_urls[]`
- `external_links[].url`
- `formula_family[].source`
- `field_sources.tongue_zh[]`
- `field_sources.pulse_zh[]`
- `field_sources.symptoms_zh[]`
- `field_sources.pattern_indications_en[]`
- `field_sources.applications_zh[]`
- `field_sources.applications_en[]`
- `field_sources.modifications_zh[]`
- `field_sources.modifications_en[]`
- `field_sources.contraindications_zh[]`
- `field_sources.contraindications_en[]`
- `field_sources.formula_family[]`
- `field_sources.source_classic[]`
- `image_url`
- `field_sources.exact_source_url[]`
- `field_sources.formula_song_zh[]`
- `herb_drug_interaction_sources[]`
- `field_sources.modern_research_zh[]`
- `field_sources.chinese_depth_track.fang_yi_zh[]`
- `field_sources.chinese_depth_track.zhu_zhi_zh[]`
- `field_sources.chinese_depth_track.notes_zh[]`
- `field_sources.source_urls[]`
- `field_sources.actions_zh[]`
- `field_sources.pattern_indications_zh[]`
- `field_sources.actions_en[]`
- `field_sources.hierarchy_status[]`
- `field_sources.clinical_use_note[]`

---

## 3. Action Required Queue (For Manual / Claude Review -- 0 Auto-Modifications Made)

### A. Dead Links (`DEAD_4XX`) -- 491 references
| Record ID | Type | Field Path | HTTP Status | Target URL |
|---|---|---|---|---|
| `herb.ma_huang` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Ephedra_sinica_bgi.jpg/640px-Ephedra_sinica_bgi.jpg |
| `herb.ma_huang` | herb | `source_citations[6].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Ephedra_sinica_bgi.jpg/640px-Ephedra_sinica_bgi.jpg |
| `herb.gui_zhi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Cinnamomum_cassia_blume.jpg/640px-Cinnamomum_cassia_blume.jpg |
| `herb.gui_zhi` | herb | `source_citations[2].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Cinnamomum_cassia_blume.jpg/640px-Cinnamomum_cassia_blume.jpg |
| `herb.zi_su_ye` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Perilla_frutescens_crispa_purpurea0.jpg/640px-Perilla_frutescens_crispa_purpurea0.jpg |
| `herb.zi_su_ye` | herb | `source_citations[1].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Perilla_frutescens_crispa_purpurea0.jpg/640px-Perilla_frutescens_crispa_purpurea0.jpg |
| `herb.sheng_jiang` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Zingiber_officinale_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-148.jpg/640px-Zingiber_officinale_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-148.jpg |
| `herb.sheng_jiang` | herb | `source_citations[2].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Zingiber_officinale_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-148.jpg/640px-Zingiber_officinale_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-148.jpg |
| `herb.sheng_jiang` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `source_urls[0]` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `source_citations[0].url` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `field_sources.dosage[0]` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.sheng_jiang` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1171 |
| `herb.xiang_ru` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Elsholtzia_ciliata_1.jpg/640px-Elsholtzia_ciliata_1.jpg |
| `herb.jing_jie` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Schizonepeta_tenuifolia_bgi.jpg/640px-Schizonepeta_tenuifolia_bgi.jpg |
| `herb.jing_jie` | herb | `source_citations[2].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Schizonepeta_tenuifolia_bgi.jpg/640px-Schizonepeta_tenuifolia_bgi.jpg |
| `herb.fang_feng` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Saposhnikovia_divaricata_1.jpg/640px-Saposhnikovia_divaricata_1.jpg |
| `herb.fang_feng` | herb | `source_citations[2].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Saposhnikovia_divaricata_1.jpg/640px-Saposhnikovia_divaricata_1.jpg |
| `herb.qiang_huo` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Notopterygium_incisum_bgi.jpg/640px-Notopterygium_incisum_bgi.jpg |
| `herb.bai_zhi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Angelica_dahurica_1.jpg/640px-Angelica_dahurica_1.jpg |
| `herb.xi_xin` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Asarum_sieboldii.jpg/640px-Asarum_sieboldii.jpg |
| `herb.cang_er_zi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Xanthium_strumarium_1.jpg/640px-Xanthium_strumarium_1.jpg |
| `herb.bo_he` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mentha_x_piperita_001.jpg/640px-Mentha_x_piperita_001.jpg |
| `herb.bo_he` | herb | `source_urls[2]` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mentha_x_piperita_001.jpg/640px-Mentha_x_piperita_001.jpg |
| `herb.bo_he` | herb | `source_citations[4].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Mentha_x_piperita_001.jpg/640px-Mentha_x_piperita_001.jpg |
| `herb.chan_tui` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cicada_shell_slough.jpg/640px-Cicada_shell_slough.jpg |
| `herb.chan_tui` | herb | `source_urls[2]` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cicada_shell_slough.jpg/640px-Cicada_shell_slough.jpg |
| `herb.chan_tui` | herb | `source_citations[3].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cicada_shell_slough.jpg/640px-Cicada_shell_slough.jpg |
| `herb.sang_ye` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Morus_alba_Leaf.jpg/640px-Morus_alba_Leaf.jpg |
| `herb.sang_ye` | herb | `source_urls[2]` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Morus_alba_Leaf.jpg/640px-Morus_alba_Leaf.jpg |
| `herb.sang_ye` | herb | `source_citations[3].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Morus_alba_Leaf.jpg/640px-Morus_alba_Leaf.jpg |
| `herb.ju_hua` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Chrysanthemum_indicum_1.jpg/640px-Chrysanthemum_indicum_1.jpg |
| `herb.ju_hua` | herb | `source_urls[2]` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Chrysanthemum_indicum_1.jpg/640px-Chrysanthemum_indicum_1.jpg |
| `herb.ju_hua` | herb | `source_citations[6].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Chrysanthemum_indicum_1.jpg/640px-Chrysanthemum_indicum_1.jpg |
| `herb.ge_gen` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Pueraria_montana_var._lobata_1.jpg/640px-Pueraria_montana_var._lobata_1.jpg |
| `herb.ge_gen` | herb | `source_urls[2]` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Pueraria_montana_var._lobata_1.jpg/640px-Pueraria_montana_var._lobata_1.jpg |
| `herb.ge_gen` | herb | `source_citations[6].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Pueraria_montana_var._lobata_1.jpg/640px-Pueraria_montana_var._lobata_1.jpg |
| `herb.chai_hu` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Bupleurum_falcatum_1.jpg/640px-Bupleurum_falcatum_1.jpg |
| `herb.chai_hu` | herb | `source_urls[2]` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Bupleurum_falcatum_1.jpg/640px-Bupleurum_falcatum_1.jpg |
| `herb.chai_hu` | herb | `source_citations[6].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Bupleurum_falcatum_1.jpg/640px-Bupleurum_falcatum_1.jpg |
| `herb.sheng_ma` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Cimicifuga_foetida.jpg/640px-Cimicifuga_foetida.jpg |
| `herb.man_jing_zi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Vitex_trifolia.jpg/640px-Vitex_trifolia.jpg |
| `herb.dan_dou_chi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Douchi.jpg/640px-Douchi.jpg |
| `herb.shi_gao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Gypsum_crystal.jpg/640px-Gypsum_crystal.jpg |
| `herb.zhi_mu` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Anemarrhena_asphodeloides_1.jpg/640px-Anemarrhena_asphodeloides_1.jpg |
| `herb.ma_huang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gui_zhi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zi_su_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sheng_jiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xiang_ru` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.jing_jie` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fang_feng` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qiang_huo` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_zhi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xi_xin` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.cang_er_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bo_he` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chan_tui` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sang_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ju_hua` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ge_gen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chai_hu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sheng_ma` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.man_jing_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.dan_dou_chi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shi_gao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zhi_mu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.lu_gen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.tian_hua_fen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zhi_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xia_ku_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.huang_qin` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.huang_lian` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.huang_bai` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.long_dan_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ku_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.jin_yin_hua` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.lian_qiao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.pu_gong_ying` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zi_hua_di_ding` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.da_qing_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ban_lan_gen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yu_xing_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_tou_weng` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sheng_di_huang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xuan_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mu_dan_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chi_shao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qing_hao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.di_gu_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yin_chai_hu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.da_huang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mang_xiao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.huo_ma_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yu_li_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gan_sui` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.du_huo` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wei_ling_xian` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qin_jiao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fang_ji` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sang_ji_sheng` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wu_jia_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mu_gua` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.huo_xiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.pei_lan` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.cang_zhu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.hou_po` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sha_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_dou_kou` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fu_ling` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zhu_ling` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ze_xie` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yi_yi_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.che_qian_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mu_tong` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.hua_shi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yin_chen_hao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.jin_qian_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fu_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gan_jiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.rou_gui` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wu_zhu_yu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xiao_hui_xiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ding_xiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ju_hong` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chen_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zhi_ke` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zhi_shi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mu_xiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xiang_fu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chuan_lian_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qing_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shan_zha` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shen_qu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mai_ya` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ji_nei_jin` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.san_qi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_ji` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ai_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.di_yu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ce_bai_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chuan_xiong` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yan_hu_suo` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yu_jin` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.dan_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.tao_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.hong_hua` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.niu_xi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wang_bu_liu_xing` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.e_zhu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.san_leng` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ji_xue_teng` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ban_xia` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.tian_nan_xing` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.jie_geng` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chuan_bei_mu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zhe_bei_mu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gua_lou` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zhu_ru` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xing_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.su_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.kuan_dong_hua` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zi_wan` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shi_chang_pu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.su_he_xiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gou_teng` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.tian_ma` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.di_long` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.quan_xie` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mu_li` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.long_gu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ren_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.dang_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.huang_qi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_zhu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shan_yao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gan_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.da_zao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_shao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.dang_gui` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shu_di_huang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.e_jiao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.he_shou_wu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.long_yan_rou` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bei_sha_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mai_men_dong` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.tian_men_dong` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shi_hu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yu_zhu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_he` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gou_qi_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.nu_zhen_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gui_ban` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.lu_jiao_jiao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.lu_rong` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yin_yang_huo` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ba_ji_tian` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.du_zhong` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xu_duan` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bu_gu_zhi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.tu_si_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sha_yuan_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.suan_zao_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_zi_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yuan_zhi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.he_huan_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wu_wei_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wu_bei_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shan_zhu_yu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.lian_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qian_shi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fu_xiao_mai` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.dai_zhe_shi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xuan_fu_hua` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gao_liang_jiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.hua_jiao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fo_shou` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mei_gui_hua` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xie_bai` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.lai_fu_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shi_jun_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ku_lian_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bing_lang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.nan_gua_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xian_he_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.pu_huang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qian_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ru_xiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mo_yao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yi_mu_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ze_lan` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_jie_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qian_hu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_bu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.pi_pa_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ting_li_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_jiang_can` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ye_jiao_teng` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.tai_zi_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xi_yang_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sang_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.han_lian_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.rou_cong_rong` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yi_zhi_ren` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wu_zei_gu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.rou_dou_kou` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chuan_niu_xi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.dan_zhu_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fu_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.niu_bang_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.niu_bang_zi` | herb | `source_urls[2]` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.tong_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sha_shen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_wei` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zi_su_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xin_yi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.da_fu_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.da_ji` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xiao_ji` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.she_gan` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sang_bai_pi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.sang_piao_xiao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.huai_hua` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_bian_dou` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_mao_gen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_fu_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qu_mai` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shi_jue_ming` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ling_yang_jiao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.qian_cao_gen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.he_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bian_xu` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.xue_yu_tan` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wu_ling_zhi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bie_jia` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wu_mei` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.deng_xin_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.cong_bai` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yin_xing` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.yi_tang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ma_bo` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.she_xiang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.hei_zhi_ma` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.gao_ben` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fu_ping` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.zi_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chuan_xin_lian` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.shan_dou_gen` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ma_chi_xian` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chui_pen_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bai_jiang_cao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fan_xie_ye` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.lu_hui` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.cao_dou_kou` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.cao_guo` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.hai_jin_sha` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.wu_yao` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.jiang_huang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.pang_da_hai` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.ci_shi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.bing_pian` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.huang_jing` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.mo_han_lian` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.hu_zhang` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.he_zi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.chi_shi_zhi` | herb | `atlas_url` | 403 | https://chinesemedicineatlas.com/tcm_herb_atlas/ |
| `herb.fang_ji` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/FangJi.html |
| `herb.zhu_ling` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Polyporus_umbellatus_1.jpg/640px-Polyporus_umbellatus_1.jpg |
| `herb.ze_xie` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Alisma_plantago-aquatica_1.jpg/640px-Alisma_plantago-aquatica_1.jpg |
| `herb.ze_xie` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `source_citations[1].url` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.properties_taste_temp[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.dosage[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.ze_xie` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1242 |
| `herb.yi_yi_ren` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Coix_lacryma-jobi_1.jpg/640px-Coix_lacryma-jobi_1.jpg |
| `herb.yi_yi_ren` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `source_citations[1].url` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.properties_taste_temp[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.dosage[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.yi_yi_ren` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1263 |
| `herb.che_qian_zi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Plantago_major_1.jpg/640px-Plantago_major_1.jpg |
| `herb.mu_tong` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Akebia_quinata_stem.jpg/640px-Akebia_quinata_stem.jpg |
| `herb.hua_shi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Talc_block.jpg/640px-Talc_block.jpg |
| `herb.yin_chen_hao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/YinChenHao.html |
| `herb.fu_zi` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/FuZi.html |
| `herb.ju_hong` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/JuHong.html |
| `herb.zhi_ke` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/ZhiKe.html |
| `herb.che_qian_zi` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `source_citations[1].url` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.properties_taste_temp[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.dosage[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.che_qian_zi` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/991 |
| `herb.chuan_xiong` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Ligusticum_striatum_1.jpg/640px-Ligusticum_striatum_1.jpg |
| `herb.yan_hu_suo` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Corydalis_yanhusuo_1.jpg/640px-Corydalis_yanhusuo_1.jpg |
| `herb.yu_jin` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Curcuma_aromatica_1.jpg/640px-Curcuma_aromatica_1.jpg |
| `herb.dan_shen` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Salvia_miltiorrhiza_1.jpg/640px-Salvia_miltiorrhiza_1.jpg |
| `herb.tao_ren` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Prunus_persica_seeds.jpg/640px-Prunus_persica_seeds.jpg |
| `herb.hong_hua` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Carthamus_tinctorius_1.jpg/640px-Carthamus_tinctorius_1.jpg |
| `herb.niu_xi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Achyranthes_bidentata_1.jpg/640px-Achyranthes_bidentata_1.jpg |
| `herb.wang_bu_liu_xing` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vaccaria_hispanica_1.jpg/640px-Vaccaria_hispanica_1.jpg |
| `herb.niu_xi` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `source_citations[1].url` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.properties_taste_temp[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.niu_xi` | herb | `field_sources.cautions_zh[0]` | 404 | https://cloudtcm.com/herb/1131 |
| `herb.e_zhu` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Curcuma_zedoaria_1.jpg/640px-Curcuma_zedoaria_1.jpg |
| `herb.san_leng` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Sparganium_erectum_1.jpg/640px-Sparganium_erectum_1.jpg |
| `herb.ji_xue_teng` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Spatholobus_suberectus_1.jpg/640px-Spatholobus_suberectus_1.jpg |
| `herb.tian_nan_xing` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/TianNanXing.html |
| `herb.su_zi` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/SuZi.html |
| `herb.hong_hua` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `source_citations[1].url` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.properties_taste_temp[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.dosage[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.hong_hua` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1070 |
| `herb.bei_sha_shen` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/BeiShaShen.html |
| `herb.lu_jiao_jiao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/LuJiaoJiao.html |
| `herb.wu_wei_zi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Schisandra_chinensis_1.jpg/640px-Schisandra_chinensis_1.jpg |
| `herb.hua_jiao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/HuaJiao.html |
| `herb.ru_xiang` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Frankincense_2003-12-29.jpg/640px-Frankincense_2003-12-29.jpg |
| `herb.mo_yao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Myrrh_resin.jpg/640px-Myrrh_resin.jpg |
| `herb.mo_yao` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.properties_taste_temp[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.dosage[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.mo_yao` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1118 |
| `herb.qian_cao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/QianCao.html |
| `herb.yi_mu_cao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Leonurus_japonica_1.jpg/640px-Leonurus_japonica_1.jpg |
| `herb.yi_mu_cao` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `source_citations[1].url` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.properties_taste_temp[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.dosage[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.yi_mu_cao` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1260 |
| `herb.ze_lan` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Lycopus_lucidus_1.jpg/640px-Lycopus_lucidus_1.jpg |
| `herb.ze_lan` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `source_citations[1].url` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.properties_taste_temp[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.dosage[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.ze_lan` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1243 |
| `herb.bai_jiang_can` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/BaiJiangCan.html |
| `herb.han_lian_cao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/HanLianCao.html |
| `herb.mo_han_lian` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/HanLianCao.html |
| `herb.rou_dou_kou` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Myristica_fragrans_fruit_1.jpg/640px-Myristica_fragrans_fruit_1.jpg |
| `herb.chuan_niu_xi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Cyathula_officinalis_1.jpg/640px-Cyathula_officinalis_1.jpg |
| `herb.wu_zei_gu` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/WuZeiGu.html |
| `herb.tong_cao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tetrapanax_papyriferus_1.jpg/640px-Tetrapanax_papyriferus_1.jpg |
| `herb.xin_yi` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/XinYi.html |
| `herb.huai_hua` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/HuaiHua.html |
| `herb.bai_fu_zi` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/BaiFuZi.html |
| `herb.qu_mai` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Dianthus_superbus_1.jpg/640px-Dianthus_superbus_1.jpg |
| `herb.bian_xu` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Polygonum_aviculare_1.jpg/640px-Polygonum_aviculare_1.jpg |
| `herb.wu_ling_zhi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Trogopterus_xanthipes.jpg/640px-Trogopterus_xanthipes.jpg |
| `herb.wu_mei` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Prunus_mume_fruit_1.jpg/640px-Prunus_mume_fruit_1.jpg |
| `herb.deng_xin_cao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Juncus_effusus_1.jpg/640px-Juncus_effusus_1.jpg |
| `herb.yin_xing` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/YinXing.html |
| `herb.niu_bang_zi` | herb | `source_citations[6].url` | 403 | https://www.tph.mohw.gov.tw/?aid=86&iid=276&page_name=detail&pid=44 |
| `herb.niu_bang_zi` | herb | `field_sources.dosage[1]` | 403 | https://www.tph.mohw.gov.tw/?aid=86&iid=276&page_name=detail&pid=44 |
| `herb.bai_fu_zi` | herb | `source_urls[3]` | 403 | https://baike.baidu.com/item/%E7%99%BD%E9%99%84%E5%AD%90 |
| `herb.bai_fu_zi` | herb | `source_citations[5].url` | 403 | https://baike.baidu.com/item/%E7%99%BD%E9%99%84%E5%AD%90 |
| `herb.jiang_huang` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Curcuma_longa_roots.jpg/640px-Curcuma_longa_roots.jpg |
| `herb.jiang_huang` | herb | `cloudtcm_url` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `source_citations[1].url` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.tcm_properties[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.channels_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.functions_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.indications_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.traditional_functions_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.pao_zhi_notes_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.modern_pharmacology_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.condition_tags_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.category_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.jiang_huang` | herb | `field_sources.cautions_zh[0]` | 404 | https://cloudtcm.com/herb/1172 |
| `herb.hu_zhang` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Reynoutria_japonica_1.jpg/640px-Reynoutria_japonica_1.jpg |
| `herb.he_zi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Terminalia_chebula_1.jpg/640px-Terminalia_chebula_1.jpg |
| `herb.chi_shi_zhi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Halloysite.jpg/640px-Halloysite.jpg |
| `herb.zhi_gan_cao` | herb | `safety_source_url` | 404 | https://www.americandragon.com/IndividualHerbs/ZhiGanCao.html |
| `herb.zhi_gan_cao` | herb | `exact_source_url` | 404 | https://www.americandragon.com/IndividualHerbs/ZhiGanCao.html |
| `herb.zhi_gan_cao` | herb | `source_urls[0]` | 404 | https://www.americandragon.com/IndividualHerbs/ZhiGanCao.html |
| `herb.zhi_gan_cao` | herb | `field_sources.safety_source_url` | 404 | https://www.americandragon.com/IndividualHerbs/ZhiGanCao.html |
| `formula.jiu_wei_qiang_huo_tang` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/JiuWeiQiangHuoTang.html |
| `formula.jia_jian_wei_rui_tang` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/JiaJianWeiRuiTang.html |
| `formula.da_huang_mu_dan_tang` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/DaHuangMuDanPiTang.html |
| `formula.shen_qi_wan` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/JinGuiShenQiWan.html |
| `formula.zhen_gan_xi_feng_tang` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/ZhenGanXiFengTang.html |
| `formula.xian_fang_huo_ming_yin` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/XianFangHuoMingYin.html |

### B. Missing Local Files (`LOCAL_MISSING`) -- 1223 references
| Record ID | Type | Field Path | Normalized Missing Path | Raw Citation |
|---|---|---|---|---|
| `herb.bo_he` | herb | `field_sources.cautions_zh[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.bo_he` | herb | `field_sources.cautions_en[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.bo_he` | herb | `field_sources.contraindications_zh[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.bo_he` | herb | `field_sources.contraindications_en[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.bo_he` | herb | `field_sources.exam_importance[3]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.bo_he` | herb | `field_sources.exam_pearl[3]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.bo_he` | herb | `field_sources.dosage[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.bo_he` | herb | `field_sources.safety_info[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.bo_he` | herb | `field_sources.safety_flags[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L102` |
| `herb.chan_tui` | herb | `field_sources.cautions_zh[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.chan_tui` | herb | `field_sources.cautions_en[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.chan_tui` | herb | `field_sources.contraindications_zh[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.chan_tui` | herb | `field_sources.contraindications_en[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.chan_tui` | herb | `field_sources.exam_importance[3]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.chan_tui` | herb | `field_sources.exam_pearl[3]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.chan_tui` | herb | `field_sources.dosage[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.chan_tui` | herb | `field_sources.safety_info[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.chan_tui` | herb | `field_sources.safety_flags[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md#L28` |
| `herb.fu_zi` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p2（與 actions_en 逐條對應）` |
| `herb.fu_zi` | herb | `field_sources.actions_en[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p2（Main Actions 逐字照抄）` |
| `herb.gan_jiang` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p5（與 actions_en 逐條對應）` |
| `herb.gan_jiang` | herb | `field_sources.actions_en[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p5（Main Actions 逐字照抄）` |
| `herb.rou_gui` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p6（與 actions_en 逐條對應）` |
| `herb.rou_gui` | herb | `field_sources.actions_en[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p6（Main Actions 逐字照抄）` |
| `herb.wu_zhu_yu` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p7（與 actions_en 逐條對應）` |
| `herb.wu_zhu_yu` | herb | `field_sources.actions_en[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p7（Main Actions 逐字照抄）` |
| `herb.xiao_hui_xiang` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p11（與 actions_en 逐條對應）` |
| `herb.xiao_hui_xiang` | herb | `field_sources.actions_en[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p11（Main Actions 逐字照抄）` |
| `herb.ding_xiang` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p10（與 actions_en 逐條對應）` |
| `herb.ding_xiang` | herb | `field_sources.actions_en[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p10（Main Actions 逐字照抄）` |
| `herb.bai_zhu` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.identity[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.actions_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.indications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.contraindications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.contraindications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.pao_zhi_notes_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.bai_zhu` | herb | `field_sources.exam_pearl[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L282-L312` |
| `herb.da_zao` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.identity[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.actions_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.indications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.contraindications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.contraindications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.da_zao` | herb | `field_sources.exam_pearl[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L413-L432` |
| `herb.bai_shao` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.identity[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.category[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.actions_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.indications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.contraindications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.contraindications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.bai_shao` | herb | `field_sources.exam_pearl[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Blood-tonifying Herbs.md#L129-L150` |
| `herb.hua_jiao` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p9（與 actions_en 逐條對應）` |
| `herb.hua_jiao` | herb | `field_sources.actions_en[0]` | `4_Warm_Interior_Herbs-1.pdf` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.pdf#p9（Main Actions 逐字照抄）` |
| `herb.bai_ji_li` | herb | `source_citations[1].path` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p11-p12` |
| `herb.bai_ji_li` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p11-p12` |
| `herb.bai_ji_li` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p11-p12` |
| `herb.bai_ji_li` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p11-p12` |
| `herb.chuan_wu` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.name_en[2]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.actions_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.indications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.dosage_g[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.pao_zhi_notes_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.contraindications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.cautions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.exam_importance[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.chuan_wu` | herb | `field_sources.exam_pearl[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.name_en[2]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.actions_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.indications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.dosage_g[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.pao_zhi_notes_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.contraindications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.cautions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.modern_functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.exam_importance[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.cao_wu` | herb | `field_sources.exam_pearl[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#p7-p8` |
| `herb.niu_huang` | herb | `source_citations[1].url` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.name_en[1]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.pharmaceutical_latin[1]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.properties_taste_temp[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.channels_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.functions_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.actions_en[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.indications_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.indications_en[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.dosage[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.dosage_g[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.contraindications_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.clinical_use_note[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.niu_huang` | herb | `field_sources.exam_importance[1]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#p7` |
| `herb.wu_gong` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.name_en[2]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.actions_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.indications_en[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.dosage_g[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.contraindications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.exam_importance[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.wu_gong` | herb | `field_sources.exam_pearl[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p6-p7` |
| `herb.han_fang_ji` | herb | `source_citations[1].url` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#p7-p8` |
| `herb.jue_ming_zi` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#p12-p13` |
| `herb.bai_hua_she` | herb | `source_citations[1].url` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L305-L330` |
| `herb.liu_huang` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L184-L220` |
| `herb.xian_mao` | herb | `source_citations[1].url` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L231-L253` |
| `herb.bai_hua_she_she_cao` | herb | `source_citations[1].url` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L758-L778` |
| `herb.bai_xian_pi` | herb | `source_citations[1].url` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L272-L299` |
| `herb.bai_qian` | herb | `source_citations[1].url` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L280-L303` |
| `herb.ban_zhi_lian` | herb | `safety_source_url` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L785-L786` |
| `herb.ban_zhi_lian` | herb | `source_citations[1].url` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L762-L786` |
| `herb.bi_ba` | herb | `source_citations[1].url` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L355-L373` |
| `herb.bi_xie` | herb | `source_citations[1].url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L382-L401` |
| `herb.chi_xiao_dou` | herb | `source_citations[1].url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L677-L697` |
| `herb.chi_xiao_dou` | herb | `field_sources.curriculum` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L677-L697` |
| `herb.chuan_mu_tong` | herb | `source_citations[1].url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L319-L355` |
| `herb.chuan_mu_tong` | herb | `source_citations[2].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L104-L159` |
| `herb.chuan_mu_tong` | herb | `field_sources.curriculum` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L319-L355; curriculum/herbs/Materia Medica III-Extra Herbs.md#L104-L159` |
| `herb.ci_wu_jia` | herb | `safety_source_url` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L380-L381` |
| `herb.ci_wu_jia` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L367-L381` |
| `herb.ci_wu_jia` | herb | `field_sources.curriculum` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L367-L381` |
| `herb.di_fu_zi` | herb | `exact_source_url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L429-L450` |
| `herb.di_fu_zi` | herb | `source_citations[1].url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L429-L450` |
| `herb.di_fu_zi` | herb | `field_sources.curriculum` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L429-L450` |
| `herb.dong_chong_xia_cao` | herb | `exact_source_url` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L124-L145` |
| `herb.dong_chong_xia_cao` | herb | `source_citations[1].url` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L124-L145` |
| `herb.dong_chong_xia_cao` | herb | `field_sources.curriculum` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L124-L145` |
| `herb.dong_gua_zi` | herb | `safety_source_url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L463-L490` |
| `herb.dong_gua_zi` | herb | `exact_source_url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L463-L490` |
| `herb.dong_gua_zi` | herb | `source_citations[1].url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L463-L490` |
| `herb.dong_kui_zi` | herb | `exact_source_url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L568-L595` |
| `herb.dong_kui_zi` | herb | `source_citations[1].url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L568-L595` |
| `herb.dong_kui_zi` | herb | `field_sources.curriculum` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L568-L595` |
| `herb.feng_mi` | herb | `exact_source_url` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L464-L480` |
| `herb.feng_mi` | herb | `source_citations[1].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L464-L480` |
| `herb.feng_mi` | herb | `field_sources.curriculum` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Qi-tonifying Herbs.md#L464-L480` |
| `herb.ge_jie` | herb | `source_citations[0].url` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L147-L165` |
| `herb.ge_jie` | herb | `field_sources.identity[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L147-L150` |
| `herb.ge_jie` | herb | `field_sources.category[1]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L147-L153` |
| `herb.ge_jie` | herb | `field_sources.properties_taste_temp[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L147-L150` |
| `herb.ge_jie` | herb | `field_sources.channels_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L147-L150` |
| `herb.ge_jie` | herb | `field_sources.functions_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L151-L153` |
| `herb.ge_jie` | herb | `field_sources.indications_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L154-L158` |
| `herb.ge_jie` | herb | `field_sources.dosage[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L159-L160` |
| `herb.ge_jie` | herb | `field_sources.contraindications_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L161-L162` |
| `herb.ge_jie` | herb | `field_sources.clinical_use_note[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L163-L165` |
| `herb.gou_ji` | herb | `source_citations[0].url` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L320-L343` |
| `herb.gou_ji` | herb | `field_sources.identity[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L320-L326` |
| `herb.gou_ji` | herb | `field_sources.properties_taste_temp[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L320-L326` |
| `herb.gou_ji` | herb | `field_sources.channels_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L320-L326` |
| `herb.gou_ji` | herb | `field_sources.functions_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L327-L330` |
| `herb.gou_ji` | herb | `field_sources.indications_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L331-L336` |
| `herb.gou_ji` | herb | `field_sources.dosage[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L337-L338` |
| `herb.gou_ji` | herb | `field_sources.contraindications_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L339-L341` |
| `herb.gou_ji` | herb | `field_sources.clinical_use_note[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L342-L343` |
| `herb.gu_sui_bu` | herb | `source_citations[0].url` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L344-L366` |
| `herb.gu_sui_bu` | herb | `field_sources.identity[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L344-L347` |
| `herb.gu_sui_bu` | herb | `field_sources.category[1]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L344-L350` |
| `herb.gu_sui_bu` | herb | `field_sources.properties_taste_temp[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L344-L347` |
| `herb.gu_sui_bu` | herb | `field_sources.channels_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L344-L347` |
| `herb.gu_sui_bu` | herb | `field_sources.functions_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L348-L350` |
| `herb.gu_sui_bu` | herb | `field_sources.indications_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L351-L355` |
| `herb.gu_sui_bu` | herb | `field_sources.dosage[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L356-L358` |
| `herb.gu_sui_bu` | herb | `field_sources.contraindications_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L363-L364` |
| `herb.gu_sui_bu` | herb | `field_sources.clinical_use_note[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L365-L366` |
| `herb.gu_ya` | herb | `source_citations[0].url` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L108-L117` |
| `herb.gu_ya` | herb | `field_sources.identity[0]` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L108-L117` |
| `herb.gu_ya` | herb | `field_sources.identity[1]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md#L159` |
| `herb.gu_ya` | herb | `field_sources.category[1]` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L108-L117` |
| `herb.gu_ya` | herb | `field_sources.properties_taste_temp[0]` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L108-L112` |
| `herb.gu_ya` | herb | `field_sources.channels_zh[0]` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L108-L112` |
| `herb.gu_ya` | herb | `field_sources.functions_zh[0]` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L113-L117` |
| `herb.gu_ya` | herb | `field_sources.indications_zh[0]` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L113-L117` |
| `herb.gu_ya` | herb | `field_sources.modern_functions_zh[0]` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L113-L117` |
| `herb.gu_ya` | herb | `field_sources.clinical_use_note[0]` | `5_Food_Stagnation_Herbs.md` | `curriculum/herbs/MM2_Module 5_Food_Stagnation_Herbs.md#L108-L117` |
| `herb.gua_lou_pi` | herb | `source_citations[0].url` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.identity[1]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.category[1]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.properties_taste_temp[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.channels_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.functions_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.indications_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.dosage[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.contraindications_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_pi` | herb | `field_sources.clinical_use_note[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `source_citations[0].url` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.identity[1]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.category[1]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.properties_taste_temp[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.channels_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.functions_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.indications_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.dosage[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.contraindications_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.gua_lou_ren` | herb | `field_sources.clinical_use_note[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_tong_pi` | herb | `source_citations[0].url` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_tong_pi` | herb | `field_sources.identity[1]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_tong_pi` | herb | `field_sources.category[1]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_tong_pi` | herb | `field_sources.properties_taste_temp[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_tong_pi` | herb | `field_sources.channels_zh[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_tong_pi` | herb | `field_sources.functions_zh[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_tong_pi` | herb | `field_sources.indications_zh[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_tong_pi` | herb | `field_sources.dosage[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_tong_pi` | herb | `field_sources.clinical_use_note[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L30-L260` |
| `herb.hai_zao` | herb | `source_citations[0].url` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `source_citations[2].url` | `contraindications.md` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` |
| `herb.hai_zao` | herb | `field_sources.identity[1]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.category[1]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.properties_taste_temp[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.channels_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.functions_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.indications_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.dosage[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.contraindications_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.contraindications_zh[2]` | `contraindications.md` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` |
| `herb.hai_zao` | herb | `field_sources.clinical_use_note[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L389-L536` |
| `herb.hai_zao` | herb | `field_sources.clinical_use_note[2]` | `contraindications.md` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` |
| `herb.he_tao_ren` | herb | `source_citations[0].url` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L43-L45` |
| `herb.he_tao_ren` | herb | `field_sources.identity[1]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L43-L45` |
| `herb.he_tao_ren` | herb | `field_sources.category[1]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L43-L45` |
| `herb.he_tao_ren` | herb | `field_sources.properties_taste_temp[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L43-L45` |
| `herb.he_tao_ren` | herb | `field_sources.channels_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L43-L45` |
| `herb.he_tao_ren` | herb | `field_sources.functions_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L43-L45` |
| `herb.he_tao_ren` | herb | `field_sources.clinical_use_note[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L43-L45` |
| `herb.hu_jiao` | herb | `source_citations[0].url` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.identity[1]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.category[1]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.properties_taste_temp[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.channels_zh[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.indications_zh[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.dosage[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.contraindications_zh[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.hu_jiao` | herb | `field_sources.clinical_use_note[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md#L468-L479` |
| `herb.huai_mi` | herb | `field_sources.identity[1]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.jin_ying_zi` | herb | `field_sources.identity[1]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.kun_bu` | herb | `source_citations[0].url` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L478-L496` |
| `herb.kun_bu` | herb | `field_sources.identity[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L478-L496` |
| `herb.kun_bu` | herb | `field_sources.category[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L478-L496` |
| `herb.kun_bu` | herb | `field_sources.properties_taste_temp[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L478-L496` |
| `herb.kun_bu` | herb | `field_sources.channels_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L478-L496` |
| `herb.kun_bu` | herb | `field_sources.functions_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L478-L496` |
| `herb.kun_bu` | herb | `field_sources.clinical_use_note[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L478-L496` |
| `herb.ling_zhi` | herb | `source_citations[0].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.identity[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.category[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.cautions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.ling_zhi` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L11-L44` |
| `herb.lu_dou` | herb | `source_citations[0].url` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L85-L86` |
| `herb.lu_dou` | herb | `source_citations[1].url` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md#L42-L46` |
| `herb.lu_dou` | herb | `field_sources.identity[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L85-L86` |
| `herb.lu_dou` | herb | `field_sources.functions_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L85-L86` |
| `herb.lu_dou` | herb | `field_sources.functions_zh[1]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md#L42-L46` |
| `herb.lu_dou` | herb | `field_sources.clinical_use_note[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L85-L86` |
| `herb.lu_lu_tong` | herb | `source_citations[0].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.lu_lu_tong` | herb | `field_sources.identity[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.lu_lu_tong` | herb | `field_sources.category[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.lu_lu_tong` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.lu_lu_tong` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.lu_lu_tong` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.lu_lu_tong` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.lu_lu_tong` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.lu_lu_tong` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L74-L98` |
| `herb.qin_pi` | herb | `source_citations[0].url` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L73-L74` |
| `herb.qin_pi` | herb | `field_sources.category[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L73-L74` |
| `herb.qin_pi` | herb | `field_sources.functions_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L73-L74` |
| `herb.qin_pi` | herb | `field_sources.clinical_use_note[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L73-L74` |
| `herb.qing_dai` | herb | `source_citations[0].url` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.qing_dai` | herb | `field_sources.identity[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.qing_dai` | herb | `field_sources.category[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.qing_dai` | herb | `field_sources.properties_taste_temp[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.qing_dai` | herb | `field_sources.channels_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.qing_dai` | herb | `field_sources.functions_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.qing_dai` | herb | `field_sources.indications_zh[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.qing_dai` | herb | `field_sources.dosage[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.qing_dai` | herb | `field_sources.clinical_use_note[0]` | `Herbs-New.md` | `curriculum/herbs/06 -Clear Heat Eliminate Toxins Herbs-New.md#L340-L378` |
| `herb.sang_zhi` | herb | `source_citations[0].url` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.sang_zhi` | herb | `field_sources.identity[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.sang_zhi` | herb | `field_sources.category[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.sang_zhi` | herb | `field_sources.properties_taste_temp[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.sang_zhi` | herb | `field_sources.channels_zh[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.sang_zhi` | herb | `field_sources.functions_zh[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.sang_zhi` | herb | `field_sources.indications_zh[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.sang_zhi` | herb | `field_sources.dosage[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.sang_zhi` | herb | `field_sources.clinical_use_note[0]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md#L221-L236` |
| `herb.she_chuang_zi` | herb | `source_citations[0].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L222-L260` |
| `herb.she_chuang_zi` | herb | `field_sources.identity[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L222-L260` |
| `herb.she_chuang_zi` | herb | `field_sources.category[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L222-L260` |
| `herb.she_chuang_zi` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L222-L260` |
| `herb.she_chuang_zi` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L222-L260` |
| `herb.she_chuang_zi` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L222-L260` |
| `herb.she_chuang_zi` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L222-L260` |
| `herb.she_chuang_zi` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Topical & Expel Parasite Herbs.md#L222-L260` |
| `herb.shi_wei` | herb | `source_citations[0].url` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.shi_wei` | herb | `field_sources.identity[0]` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.shi_wei` | herb | `field_sources.category[0]` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.shi_wei` | herb | `field_sources.properties_taste_temp[0]` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.shi_wei` | herb | `field_sources.channels_zh[0]` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.shi_wei` | herb | `field_sources.functions_zh[0]` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.shi_wei` | herb | `field_sources.indications_zh[0]` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.shi_wei` | herb | `field_sources.dosage[0]` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.shi_wei` | herb | `field_sources.clinical_use_note[0]` | `3_Herbs_That_Drain_Dampness.md` | `curriculum/herbs/MM2_Module 3_Herbs_That_Drain_Dampness.md#L646-L673` |
| `herb.si_gua_luo` | herb | `source_citations[0].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.si_gua_luo` | herb | `field_sources.identity[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.si_gua_luo` | herb | `field_sources.category[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.si_gua_luo` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.si_gua_luo` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.si_gua_luo` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.si_gua_luo` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.si_gua_luo` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.si_gua_luo` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Extra Herbs.md#L163-L184` |
| `herb.suo_yang` | herb | `source_citations[0].url` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L88-L92` |
| `herb.suo_yang` | herb | `field_sources.category[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L88-L92` |
| `herb.suo_yang` | herb | `field_sources.properties_taste_temp[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L88-L92` |
| `herb.suo_yang` | herb | `field_sources.functions_zh[0]` | `Full.md` | `curriculum/herbs/Materia Medica III - Yang Tonics Full.md#L88-L92` |
| `herb.zao_jiao_ci` | herb | `source_citations[0].url` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.identity[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.category[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.properties_taste_temp[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.channels_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.functions_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.indications_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.dosage[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.contraindications_zh[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zao_jiao_ci` | herb | `field_sources.clinical_use_note[0]` | `Phlegm.md` | `curriculum/herbs/Materia Medica III-Herbs that Transform Phlegm.md#L202-L225` |
| `herb.zhen_zhu` | herb | `source_citations[0].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.identity[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.category[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.properties_taste_temp[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.channels_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.cautions_zh[2]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.zhen_zhu` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md#L395-L420` |
| `herb.huang_jiu` | herb | `source_citations[1].url` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.huang_jiu` | herb | `field_sources.identity[1]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.zong_lu_pi` | herb | `source_citations[1].url` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zong_lu_pi` | herb | `field_sources.indications_zh[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zong_lu_pi` | herb | `field_sources.dosage[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zhu_ji_sui` | herb | `source_citations[1].url` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zhu_ji_sui` | herb | `source_citations[2].url` | `docx.md` | `curriculum/Formulations Summary Chart.docx.md` |
| `herb.zhu_ji_sui` | herb | `field_sources.category[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zhu_ji_sui` | herb | `field_sources.channels_zh[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zhu_ji_sui` | herb | `field_sources.functions_zh[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zhu_ji_sui` | herb | `field_sources.indications_zh[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zhu_ji_sui` | herb | `field_sources.clinical_use_note[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.zhu_ye` | herb | `source_citations[1].url` | `curriculum/herbs/M.M.1` | `curriculum/herbs/M.M.1` |
| `herb.zhu_ye` | herb | `field_sources.identity[0]` | `curriculum/herbs/M.M.1` | `curriculum/herbs/M.M.1` |
| `herb.zhu_ye` | herb | `field_sources.category[0]` | `curriculum/herbs/M.M.1` | `curriculum/herbs/M.M.1` |
| `herb.zhu_ye` | herb | `field_sources.cautions_zh[1]` | `curriculum/herbs/M.M.1` | `curriculum/herbs/M.M.1` |
| `herb.pao_jiang` | herb | `source_citations[0].url` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.pao_jiang` | herb | `source_citations[1].url` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.pao_jiang` | herb | `source_citations[2].url` | `Functions.md` | `curriculum/herbs/Herb Functions.md` |
| `herb.pao_jiang` | herb | `field_sources.identity[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.pao_jiang` | herb | `field_sources.identity[1]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.pao_jiang` | herb | `field_sources.category[0]` | `Functions.md` | `curriculum/herbs/Herb Functions.md` |
| `herb.pao_jiang` | herb | `field_sources.properties_taste_temp[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.pao_jiang` | herb | `field_sources.channels_zh[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.pao_jiang` | herb | `field_sources.functions_zh[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.pao_jiang` | herb | `field_sources.indications_zh[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.pao_jiang` | herb | `field_sources.dosage[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.pao_jiang` | herb | `field_sources.cautions_zh[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.pao_jiang` | herb | `field_sources.clinical_use_note[0]` | `4_Warm_Interior_Herbs-1.md` | `curriculum/herbs/MM2_Module 4_Warm_Interior_Herbs-1.md` |
| `herb.hu_huang_lian` | herb | `source_citations[0].url` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `source_citations[2].url` | `Functions.md` | `curriculum/herbs/Herb Functions.md` |
| `herb.hu_huang_lian` | herb | `field_sources.identity[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.category[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.properties_taste_temp[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.channels_zh[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.functions_zh[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.indications_zh[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.dosage[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.cautions_zh[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.clinical_use_note[0]` | `doc.md` | `curriculum/herbs/08 - Clear Deficient Heat Herbs-NEW.doc.md` |
| `herb.hu_huang_lian` | herb | `field_sources.clinical_use_note[1]` | `Functions.md` | `curriculum/herbs/Herb Functions.md` |
| `herb.gui_ban_jiao` | herb | `source_citations[0].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `source_citations[1].url` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.identity[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.identity[1]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.category[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.properties_taste_temp[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.channels_zh[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.functions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.functions_zh[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.indications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.dosage[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.dosage[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.contraindications_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.cautions_zh[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.clinical_use_note[0]` | `Herbs.md` | `curriculum/herbs/Materia Medica III – Yin-tonifying Herbs.md` |
| `herb.gui_ban_jiao` | herb | `field_sources.clinical_use_note[1]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.zhen_zhu_mu` | herb | `source_citations[2].url` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.zhen_zhu_mu` | herb | `source_citations[3].url` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.identity[0]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.properties_taste_temp[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.channels_zh[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.functions_zh[1]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.indications_zh[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.modern_functions_zh[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.dosage[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.cautions_zh[1]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.clinical_use_note[1]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.zhen_zhu_mu` | herb | `field_sources.clinical_use_note[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.long_chi` | herb | `source_citations[1].url` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.long_chi` | herb | `field_sources.identity[0]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.long_chi` | herb | `field_sources.cautions_zh[1]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.long_chi` | herb | `field_sources.clinical_use_note[0]` | `List.md` | `curriculum/herbs/Pinyin & Latin Herb List.md` |
| `herb.an_xi_xiang` | herb | `source_citations[0].url` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `source_citations[2].url` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.an_xi_xiang` | herb | `field_sources.identity[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `field_sources.category[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `field_sources.properties_taste_temp[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `field_sources.channels_zh[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `field_sources.functions_zh[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `field_sources.indications_zh[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `field_sources.dosage[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `field_sources.cautions_zh[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.an_xi_xiang` | herb | `field_sources.clinical_use_note[0]` | `PREP.md` | `curriculum/herbs/MATERIA MEDICA AND SPECIAL PREP.md` |
| `herb.chuan_shan_jia` | herb | `source_citations[3].url` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.chuan_shan_jia` | herb | `field_sources.category[1]` | `Functions.md` | `curriculum/herbs/Herb Functions.md` |
| `herb.chuan_shan_jia` | herb | `field_sources.properties_taste_temp[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.chuan_shan_jia` | herb | `field_sources.channels_zh[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.chuan_shan_jia` | herb | `field_sources.functions_zh[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.chuan_shan_jia` | herb | `field_sources.indications_zh[1]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.chuan_shan_jia` | herb | `field_sources.clinical_use_note[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.shan_yang_jiao` | herb | `source_citations[2].url` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md` |
| `herb.shan_yang_jiao` | herb | `source_citations[3].url` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.shan_yang_jiao` | herb | `field_sources.properties_taste_temp[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.shan_yang_jiao` | herb | `field_sources.channels_zh[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.shan_yang_jiao` | herb | `field_sources.functions_zh[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.shan_yang_jiao` | herb | `field_sources.indications_zh[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.shan_yang_jiao` | herb | `field_sources.dosage[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md` |
| `herb.shan_yang_jiao` | herb | `field_sources.cautions_zh[1]` | `Herbs.md` | `curriculum/herbs/Materia Medica III-Wind-extinguishing Herbs.md` |
| `herb.shan_yang_jiao` | herb | `field_sources.clinical_use_note[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.han_shui_shi` | herb | `source_citations[1].url` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.han_shui_shi` | herb | `source_citations[2].url` | `Functions.md` | `curriculum/herbs/Herb Functions.md` |
| `herb.han_shui_shi` | herb | `source_citations[3].url` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.han_shui_shi` | herb | `field_sources.category[0]` | `Functions.md` | `curriculum/herbs/Herb Functions.md` |
| `herb.han_shui_shi` | herb | `field_sources.properties_taste_temp[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.han_shui_shi` | herb | `field_sources.channels_zh[0]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.han_shui_shi` | herb | `field_sources.functions_zh[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.han_shui_shi` | herb | `field_sources.functions_zh[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.han_shui_shi` | herb | `field_sources.indications_zh[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.han_shui_shi` | herb | `field_sources.indications_zh[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.han_shui_shi` | herb | `field_sources.clinical_use_note[1]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.xiao_shi` | herb | `source_citations[1].url` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.xiao_shi` | herb | `field_sources.functions_zh[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.xiao_shi` | herb | `field_sources.indications_zh[1]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md` |
| `herb.qing_mu_xiang` | herb | `source_citations[1].url` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md` |
| `herb.qing_mu_xiang` | herb | `source_citations[2].url` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `herb.qing_mu_xiang` | herb | `field_sources.cautions_zh[1]` | `1_Dispel_Wind-Damp_Herbs.md` | `curriculum/herbs/MM2-Module 1_Dispel_Wind-Damp_Herbs.md` |
| `herb.qing_mu_xiang` | herb | `field_sources.cautions_zh[2]` | `Abbbreviated.md` | `curriculum/herbs/Materia Medica Abbbreviated.md` |
| `formula.gui_zhi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_zhi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gui_zhi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ma_huang_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ma_huang_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ma_huang_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_qing_long_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_qing_long_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_qing_long_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jiu_wei_qiang_huo_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jiu_wei_qiang_huo_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jiu_wei_qiang_huo_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yin_qiao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yin_qiao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yin_qiao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_ju_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_ju_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.sang_ju_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiang_su_san` | formula | `field_sources.pattern_indications_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md(Indications 行);解析器原將 Case Study 病例段落黏入,2026-08-06 截去病例殘渣,中文層待填` |
| `formula.xiang_su_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiang_su_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiang_su_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiang_su_san` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 26 Xiang Su San（Preparation/Administration 欄）` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.chai_ge_jie_ji_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.chai_ge_jie_ji_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chai_ge_jie_ji_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chai_ge_jie_ji_tang` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 49 Chai Ge Jie Ji Tang（Preparation/Administration 欄）` |
| `formula.sheng_ma_ge_gen_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)；curriculum/herbs/方剂学汇总_extracted.md#Table47-48（升麻葛根湯 君臣佐使表，核對甘草角色為使）` |
| `formula.sheng_ma_ge_gen_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_ma_ge_gen_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_ma_ge_gen_tang` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 47 Sheng Ma Ge Gen Tang（Preparation/Administration 欄）` |
| `formula.ren_shen_bai_du_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ren_shen_bai_du_san` | formula | `field_sources.pattern_indications_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md(Indications 行);解析器原將 Case Study 病例段落黏入,2026-08-06 截去病例殘渣,中文層待填` |
| `formula.ren_shen_bai_du_san` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 52 Ren Shen Bai Du San（Preparation/Administration 欄）` |
| `formula.jia_jian_wei_rui_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jia_jian_wei_rui_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jia_jian_wei_rui_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bai_hu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bai_hu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bai_hu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhu_ye_shi_gao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhu_ye_shi_gao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhu_ye_shi_gao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huang_lian_jie_du_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huang_lian_jie_du_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.huang_lian_jie_du_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_ge_san` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.liang_ge_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.liang_ge_san` | formula | `field_sources.pattern_indications_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md(Indications 行);解析器原將 Case Study 病例段落黏入,2026-08-06 截去病例殘渣,中文層待填` |
| `formula.liang_ge_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_ge_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_ge_san` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 145 Liang Ge San（Preparation and administration 欄）` |
| `formula.qing_ying_tang` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.qing_ying_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_ying_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_ying_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xi_jiao_di_huang_tang` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.xi_jiao_di_huang_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xi_jiao_di_huang_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xi_jiao_di_huang_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huang_lian_e_jiao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.huang_lian_e_jiao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huang_lian_e_jiao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dao_chi_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dao_chi_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.dao_chi_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.long_dan_xie_gan_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.long_dan_xie_gan_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.long_dan_xie_gan_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_wei_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_wei_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_wei_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xie_bai_san` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.xie_bai_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xie_bai_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xie_bai_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_tang` | formula | `field_sources.composition` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table178（芍藥湯 君臣佐使表，9 味核對一致）` |
| `formula.shao_yao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_tang` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 177 Shao Yao Tang（Preparation and administration 欄）` |
| `formula.bai_tou_weng_tang` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.bai_tou_weng_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bai_tou_weng_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bai_tou_weng_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bai_tou_weng_tang` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 181 Bai Tou Weng Tang（Source: Shang Han Lun；Preparation and administration 欄）` |
| `formula.qing_hao_bie_jia_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_hao_bie_jia_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_hao_bie_jia_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_gu_san` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.qing_gu_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_gu_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_gu_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_gu_san` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 189 Qing Gu San（Preparation and administration 欄）` |
| `formula.dang_gui_liu_huang_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_liu_huang_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_liu_huang_tang` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 192 Dang Gui Liu Huang Tang（Preparation and administration 欄）` |
| `formula.liu_yi_san` | formula | `field_sources.clinical_use_note[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#p.49 Liu Yi San（Preparation and administration 欄）` |
| `formula.wu_wei_xiao_du_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wu_wei_xiao_du_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_wei_xiao_du_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_wen_bai_du_yin` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.qing_wen_bai_du_yin` | formula | `field_sources.composition[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.qing_wen_bai_du_yin` | formula | `field_sources.pattern_indications_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md(Indications 行);解析器原將 Case Study 病例段落黏入,2026-08-06 截去病例殘渣,中文層待填` |
| `formula.qing_wen_bai_du_yin` | formula | `field_sources.clinical_use_note[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#p.35 Qing Wen Bai Du Yin（Preparation/Administration/Dosages Vs. Pulses 欄）` |
| `formula.da_cheng_qi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_cheng_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_cheng_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_cheng_qi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_cheng_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_cheng_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tiao_wei_cheng_qi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.tiao_wei_cheng_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tiao_wei_cheng_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_huang_mu_dan_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_huang_mu_dan_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ma_zi_ren_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ma_zi_ren_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ma_zi_ren_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.run_chang_wan` | formula | `field_sources.clinical_use_note[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#p.19 Ma Zi Ren Wan Patent Forms／China 欄，Run Chang Wan 8 tid` |
| `formula.ji_chuan_jian` | formula | `field_sources.clinical_use_note[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#p.20 Ji Chuan Jian（Source: Jing Yue Quan Shu；Preparation/Administration 欄）` |
| `formula.xiao_chai_hu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_chai_hu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_chai_hu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_chai_hu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_chai_hu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_chai_hu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chai_hu_gui_zhi_tang` | formula | `field_sources.composition` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table92,94（小柴胡湯君臣佐使表 + 柴胡桂枝湯「加桂枝、芍藥」衍生方說明）；桂枝、芍藥劑量取藥材通用範圍（無獨立課件劑量表，見 field 內註記），非本方專屬古方劑量` |
| `formula.xiao_yao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_yao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_yao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jia_wei_xiao_yao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jia_wei_xiao_yao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jia_wei_xiao_yao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tong_xie_yao_fang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.tong_xie_yao_fang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tong_xie_yao_fang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_xie_xin_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ban_xia_xie_xin_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_xie_xin_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.li_zhong_wan` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.li_zhong_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.li_zhong_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.li_zhong_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_zi_li_zhong_wan` | formula | `field_sources.composition` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md（附子理中丸 = 理中丸 + 附子，課件加減說明），5 味核對一致` |
| `formula.fu_zi_li_zhong_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_zi_li_zhong_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.huang_qi_jian_zhong_tang` | formula | `field_sources.composition` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md（黃耆建中湯 = 小建中湯 + 黃耆9g，課件加減說明），7 味核對一致` |
| `formula.huang_qi_jian_zhong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huang_qi_jian_zhong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huang_qi_jian_zhong_tang` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.huang_qi_jian_zhong_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.si_ni_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_ni_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_ni_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_zhu_yu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wu_zhu_yu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_zhu_yu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_si_ni_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.dang_gui_si_ni_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_si_ni_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_jun_zi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_jun_zi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_jun_zi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liu_jun_zi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.liu_jun_zi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liu_jun_zi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiang_sha_liu_jun_zi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiang_sha_liu_jun_zi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiang_sha_liu_jun_zi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_ling_bai_zhu_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shen_ling_bai_zhu_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_ling_bai_zhu_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.tongue_zh[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table253(正文 T/P 行;中文為回譯)` |
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.tongue_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table253(正文 T/P 行;中文為回譯)` |
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.pulse_zh[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table253(正文 T/P 行;中文為回譯)` |
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.pulse_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table253(正文 T/P 行;中文為回譯)` |
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yu_ping_feng_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yu_ping_feng_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yu_ping_feng_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_mai_san` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.sheng_mai_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.sheng_mai_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_mai_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ren_shen_yang_rong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ren_shen_yang_rong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_wu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_wu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_wu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jiao_ai_tang` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.jiao_ai_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jiao_ai_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jiao_ai_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_bu_xue_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.dang_gui_bu_xue_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_bu_xue_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ba_zhen_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ba_zhen_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ba_zhen_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_quan_da_bu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shi_quan_da_bu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_quan_da_bu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.taishan_pan_shi_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.taishan_pan_shi_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.taishan_pan_shi_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liu_wei_di_huang_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.liu_wei_di_huang_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liu_wei_di_huang_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zuo_gui_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zuo_gui_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zuo_gui_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zuo_gui_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zuo_gui_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zuo_gui_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.you_gui_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.you_gui_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.you_gui_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.you_gui_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.you_gui_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.you_gui_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qi_ju_di_huang_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qi_ju_di_huang_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qi_ju_di_huang_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qi_ju_di_huang_wan` | formula | `field_sources.modern_research_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07) —— 原列於 actions 第 5-9 條，屬藥理指標非中醫功效，2026-08-11 錯層搬移歸位` |
| `formula.qi_ju_di_huang_wan` | formula | `field_sources.modern_research_en[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07) —— 原列於 actions 第 5-9 條，屬藥理指標非中醫功效，2026-08-11 錯層搬移歸位` |
| `formula.zhi_bai_di_huang_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhi_bai_di_huang_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_bai_di_huang_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_qi_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shen_qi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_qi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_qi_wan` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 288 Jin Gui Shen Qi Wan（Preparation and administration 欄）` |
| `formula.shen_qi_wan` | formula | `field_sources.modifications_zh[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md — Jin Gui Shen Qi Wan [金匮肾气丸] section, Modifications table (Table 290, right columns); cross-checked with curriculum/formulas/Herbal Formulations Comprehensive.docx.md（2026-08-19 課件 Modifications 表逐列抽取）` |
| `formula.shen_qi_wan` | formula | `field_sources.modifications_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md — Jin Gui Shen Qi Wan [金匮肾气丸] section, Modifications table (Table 290, right columns); cross-checked with curriculum/formulas/Herbal Formulations Comprehensive.docx.md（2026-08-19 課件 Modifications 表逐列抽取）` |
| `formula.jin_gui_shen_qi_wan` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.jin_gui_shen_qi_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jin_gui_shen_qi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_gui_shen_qi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_gan_cao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhi_gan_cao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_gan_cao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yi_guan_jian` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yi_guan_jian` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yi_guan_jian` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.mu_li_san` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.mu_li_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.mu_li_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.mu_li_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.si_shen_wan` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.si_shen_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_shen_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_shen_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_suo_gu_jing_wan` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.jin_suo_gu_jing_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jin_suo_gu_jing_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_suo_gu_jing_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_piao_xiao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.sang_piao_xiao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_piao_xiao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.suo_quan_wan` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.suo_quan_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.suo_quan_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.suo_quan_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.suo_quan_wan` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 400 Suo Quan Wan（Preparation & administration 欄）` |
| `formula.suan_zao_ren_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.suan_zao_ren_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.suan_zao_ren_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gan_mai_da_zao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gan_mai_da_zao_tang` | formula | `field_sources.actions_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table350(Actions 行逐字)` |
| `formula.gan_mai_da_zao_tang` | formula | `field_sources.pattern_indications_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table350(Indications 行逐字)` |
| `formula.gan_mai_da_zao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gan_mai_da_zao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yue_ju_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yue_ju_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yue_ju_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chai_hu_shu_gan_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.chai_hu_shu_gan_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chai_hu_shu_gan_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gua_lou_xie_bai_ban_xia_tang` | formula | `field_sources.composition` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table413-416（瓜蔞薤白白酒湯基礎方 Table414 + 「加半夏」衍生方說明 Table416）；白酒劑量另見同一課件之瓜蔞薤白白酒湯記載` |
| `formula.ban_xia_hou_po_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ban_xia_hou_po_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_hou_po_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.su_zi_jiang_qi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.su_zi_jiang_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.su_zi_jiang_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ju_pi_zhu_ru_tang` | formula | `field_sources.composition` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table440-441（橘皮竹茹湯 君臣佐使表）` |
| `formula.xue_fu_zhu_yu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xue_fu_zhu_yu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xue_fu_zhu_yu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bu_yang_huan_wu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bu_yang_huan_wu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bu_yang_huan_wu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_hua_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.sheng_hua_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_hua_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_hui_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shi_hui_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_hui_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wen_jing_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wen_jing_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wen_jing_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_zhi_fu_ling_wan` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gui_zhi_fu_ling_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_zhi_fu_ling_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ge_xia_zhu_yu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ge_xia_zhu_yu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ge_xia_zhu_yu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_fu_zhu_yu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shao_fu_zhu_yu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_fu_zhu_yu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_tong_zhu_yu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shen_tong_zhu_yu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_tong_zhu_yu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ping_wei_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ping_wei_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ping_wei_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huo_xiang_zheng_qi_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.huo_xiang_zheng_qi_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huo_xiang_zheng_qi_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_ling_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wu_ling_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_ling_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhu_ling_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhu_ling_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhu_ling_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.san_ren_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.san_ren_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.san_ren_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.san_ren_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.er_miao_san` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.er_miao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.er_miao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_miao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_miao_san` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 562 Er Miao San（Preparation & administration 欄）` |
| `formula.si_miao_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_miao_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_miao_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_wu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhen_wu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_wu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_pi_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.fang_ji_huang_qi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.fang_ji_huang_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fang_ji_huang_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yin_chen_hao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yin_chen_hao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yin_chen_hao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ba_zheng_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ba_zheng_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ba_zheng_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ling_gui_zhu_gan_tang` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.ling_gui_zhu_gan_tang` | formula | `field_sources.composition[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.er_chen_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.er_chen_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_chen_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wen_dan_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wen_dan_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wen_dan_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_bai_zhu_tian_ma_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ban_xia_bai_zhu_tian_ma_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_bai_zhu_tian_ma_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_qi_hua_tan_wan` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.qing_qi_hua_tan_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_qi_hua_tan_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_qi_hua_tan_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_xian_xiong_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_xian_xiong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_xian_xiong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.san_zi_yang_qin_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.san_zi_yang_qin_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.san_zi_yang_qin_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chuan_xiong_cha_tiao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.chuan_xiong_cha_tiao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chuan_xiong_cha_tiao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_feng_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_feng_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_feng_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tian_ma_gou_teng_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.tian_ma_gou_teng_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tian_ma_gou_teng_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_gan_xi_feng_tang` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.zhen_gan_xi_feng_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhen_gan_xi_feng_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_gan_xi_feng_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_huo_luo_dan` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.xiao_huo_luo_dan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_huo_luo_dan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_huo_luo_dan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_huo_luo_dan` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 513 Xiao Huo Luo Dan（Preparation & administration 欄）` |
| `formula.bao_he_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bao_he_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bao_he_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jian_pi_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jian_pi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jian_pi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_xing_tang` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.sang_xing_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.sang_xing_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_xing_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_xing_tang` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 532 Sang Xing Tang（Preparation & administration 欄）` |
| `formula.sha_shen_mai_men_dong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sha_shen_mai_men_dong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_sou_san` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.zhi_sou_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhi_sou_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_sou_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_sou_san` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 627 Zhi Sou San（Preparation & administration 欄）` |
| `formula.an_gong_niu_huang_wan` | formula | `source_urls[1]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `formula_family[0].source` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `formula_family[1].source` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.actions_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.pattern_indications_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.contraindications_zh[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.contraindications_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.exam_pearl[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.formula_family[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.compare_with[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.applications_zh[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.applications_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.modern_research_zh[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.modern_research_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.administration_zh[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.administration_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.zi_xue_dan` | formula | `source_urls[4]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.zi_xue_dan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zi_xue_dan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zi_xue_dan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zi_xue_dan` | formula | `field_sources.clinical_use_note[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table 359 Zi Xue Dan（Preparation and administration 欄）` |
| `formula.zhi_bao_dan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhi_bao_dan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_bao_dan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yang_he_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yang_he_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yang_he_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_pi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gui_pi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_pi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bai_du_san` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.bai_du_san` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.bai_he_gu_jin_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bai_he_gu_jin_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bai_he_gu_jin_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bei_mu_gua_lou_san` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.bei_mu_gua_lou_san` | formula | `field_sources.composition[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.bei_mu_gua_lou_san` | formula | `field_sources.pattern_indications_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md（Bei Mu Gua Lou San 條目 Indications 原文）` |
| `formula.bei_mu_gua_lou_san` | formula | `field_sources.source_classic[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md（Source: Yi Xue Xin Wu）` |
| `formula.bei_mu_gua_lou_san` | formula | `field_sources.pattern_indications_zh[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md p.144 (replaced the scraped placeholder 「貝母瓜蔞散主治證候」)` |
| `formula.da_ding_feng_zhu` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_ding_feng_zhu` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_ding_feng_zhu` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.du_huo_ji_sheng_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.du_huo_ji_sheng_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.du_huo_ji_sheng_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gan_lu_xiao_du_dan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gan_lu_xiao_du_dan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gan_lu_xiao_du_dan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gu_chong_tang` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.gu_chong_tang` | formula | `field_sources.composition[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.gu_chong_tang` | formula | `field_sources.source_classic[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md（Source: Yi Xue Zhong Zhong Can Xi Lu）` |
| `formula.gu_chong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md p.94 (replaced the scraped placeholder 「固沖湯主治證候」)` |
| `formula.huai_hua_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.huai_hua_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huai_hua_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huang_tu_tang` | formula | `source_urls[3]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.huang_tu_tang` | formula | `field_sources.composition[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.huang_tu_tang` | formula | `field_sources.composition[1]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#L6952-L6973` |
| `formula.huang_tu_tang` | formula | `field_sources.actions_zh[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#L6952-L6973` |
| `formula.huang_tu_tang` | formula | `field_sources.actions_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#L6952-L6973` |
| `formula.huang_tu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#L6952-L6973` |
| `formula.huang_tu_tang` | formula | `field_sources.pattern_indications_en[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md#L6952-L6973` |
| `formula.lian_po_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.lian_po_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.lian_po_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ling_jiao_gou_teng_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ling_jiao_gou_teng_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ling_jiao_gou_teng_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ma_xing_shi_gan_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ma_xing_shi_gan_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ma_xing_shi_gan_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.mai_men_dong_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.pu_ji_xiao_du_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.pu_ji_xiao_du_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.pu_ji_xiao_du_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qian_zheng_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qian_zheng_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qian_zheng_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_zao_jiu_fei_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_zao_jiu_fei_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_zao_jiu_fei_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_pi_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_pi_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_xiao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shi_xiao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_xiao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shi_xiao_san` | formula | `field_sources.administration_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07) —— 原列為 composition 第 3 味「Wine or vinegar」，屬服法藥引，2026-08-11 錯層搬移歸位` |
| `formula.shi_xiao_san` | formula | `field_sources.administration_en[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07) —— 原列為 composition 第 3 味「Wine or vinegar」，屬服法藥引，2026-08-11 錯層搬移歸位` |
| `formula.si_ni_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_ni_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_ni_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.su_he_xiang_wan` | formula | `field_sources.actions_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table367(Actions/Indications 行);原 actions_zh 誤作「清熱解表、調理氣血」(本方為溫開劑),2026-08-06 依課件更正` |
| `formula.su_he_xiang_wan` | formula | `field_sources.pattern_indications_en[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#Table367(Actions/Indications 行);原 actions_zh 誤作「清熱解表、調理氣血」(本方為溫開劑),2026-08-06 依課件更正` |
| `formula.su_he_xiang_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.su_he_xiang_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.su_he_xiang_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tao_he_cheng_qi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.tao_he_cheng_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tao_he_cheng_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wan_dai_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wan_dai_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wan_dai_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_mei_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wu_mei_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_mei_wan` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.wu_mei_wan` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.xing_su_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xing_su_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xing_su_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yu_nu_jian` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhi_shi_xie_bai_gui_zhi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhi_shi_xie_bai_gui_zhi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_shi_xie_bai_gui_zhi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zuo_jin_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zuo_jin_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zuo_jin_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bu_fei_tang` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.bu_fei_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bu_fei_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bu_fei_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_bu_yin_wan` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.da_bu_yin_wan` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.da_bu_yin_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_bu_yin_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_bu_yin_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_jian_zhong_tang` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_jian_zhong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_jian_zhong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_qing_long_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_qing_long_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_qing_long_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dan_shen_yin` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.dan_shen_yin` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.dan_shen_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.dan_shen_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dan_shen_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dan_shen_yin` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.dan_shen_yin` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.dang_gui_shao_yao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.dang_gui_shao_yao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_shao_yao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_yin_zi` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.dang_gui_yin_zi` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_yin_zi` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ding_zhi_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ding_zhi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ding_zhi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.du_qi_wan` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.du_qi_wan` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.du_qi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.du_qi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_xian_tang` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.er_xian_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.er_xian_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_xian_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_xian_tang` | formula | `field_sources.source_classic[2]` | `docx.md` | `curriculum/Formulations Summary Chart.docx.md#L2188-L2206` |
| `formula.er_zhi_wan` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.er_zhi_wan` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.er_zhi_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.er_zhi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_zhi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fang_feng_tong_sheng_san` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.fang_feng_tong_sheng_san` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.fang_feng_tong_sheng_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.fang_feng_tong_sheng_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fang_feng_tong_sheng_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gu_jing_wan` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.gu_jing_wan` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.gu_jing_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gu_jing_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gu_jing_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_zhi_shao_yao_zhi_mu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gui_zhi_shao_yao_zhi_mu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_zhi_shao_yao_zhi_mu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_ling_zi_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jin_ling_zi_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_ling_zi_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_fu_wan` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.liang_fu_wan` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.liang_fu_wan` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.liang_fu_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_fu_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_fu_wan` | formula | `field_sources.administration_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `curriculum/formulas/20_Formula_Cards_191-201_未分類-考點與補充劑.md#191 良附丸（Bastyr/Chenoweth 課件 composition/role evidence）；American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_fu_wan` | formula | `field_sources.administration_en[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `curriculum/formulas/20_Formula_Cards_191-201_未分類-考點與補充劑.md#191 良附丸（Bastyr/Chenoweth 課件 composition/role evidence）；American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.nuan_gan_jian` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.nuan_gan_jian` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.nuan_gan_jian` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.nuan_gan_jian` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.nuan_gan_jian` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `source_urls[0]` | `docx.md` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.md` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_gan_cao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shao_yao_gan_cao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_gan_cao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tian_tai_wu_yao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.tian_tai_wu_yao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tian_tai_wu_yao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_pi_san` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.wu_pi_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wu_pi_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_pi_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xi_jiao_di_huang_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xi_jiao_di_huang_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_ji_yin_zi` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.xiao_ji_yin_zi` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_ji_yin_zi` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_ji_yin_zi` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xie_huang_san` | formula | `field_sources.name_zh[0]` | `docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.xie_huang_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xie_huang_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xie_huang_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xie_huang_san` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.xie_huang_san` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.zeng_ye_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zeng_ye_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zeng_ye_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wei_jing_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wei_jing_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wei_jing_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xian_fang_huo_ming_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xian_fang_huo_ming_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xian_fang_huo_ming_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_miao_yong_an_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_miao_yong_an_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_miao_yong_an_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_nian_tong_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.dang_gui_nian_tong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_nian_tong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.san_miao_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.san_miao_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.san_miao_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_su_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shen_su_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shen_su_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zai_zao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zai_zao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zai_zao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.cong_chi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.cong_chi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.cong_chi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tong_qiao_huo_xue_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.tong_qiao_huo_xue_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tong_qiao_huo_xue_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jiu_xian_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jiu_xian_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jiu_xian_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tao_hua_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.tao_hua_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tao_hua_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gua_lou_xie_bai_bai_jiu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gua_lou_xie_bai_bai_jiu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gua_lou_xie_bai_bai_jiu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.hou_po_wen_zhong_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.hou_po_wen_zhong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.hou_po_wen_zhong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.hou_po_wen_zhong_tang` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.hou_po_wen_zhong_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.da_xian_xiong_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_xian_xiong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_xian_xiong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_huang_fu_zi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_huang_fu_zi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_huang_fu_zi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wen_pi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wen_pi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wen_pi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.hao_qin_qing_dan_tang` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.hao_qin_qing_dan_tang` | formula | `field_sources.composition[1]` | `docx.md` | `curriculum/Formulations Summary Chart.docx.md（Hao Qin Qing Dan Tang 列下方「Bi Yu San: Hua Shi: Gan Cao: Qing Dai 6:1:1」） —— 碧玉散展開比例` |
| `formula.hao_qin_qing_dan_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.hao_qin_qing_dan_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.hao_qin_qing_dan_tang` | formula | `field_sources.composition_source_note_zh[0]` | `docx.md` | `curriculum/Formulations Summary Chart.docx.md（Hao Qin Qing Dan Tang 列下方「Bi Yu San: Hua Shi: Gan Cao: Qing Dai 6:1:1」）` |
| `formula.fu_ling_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhu_sha_an_shen_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhu_sha_an_shen_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhu_sha_an_shen_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_zhu_mu_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhen_zhu_mu_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_zhu_mu_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_zhu_mu_wan` | formula | `field_sources.source_classic[0]` | `_extracted.md` | `curriculum/herbs/方剂学汇总_extracted.md#L3017` |
| `formula.ci_zhu_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ci_zhu_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ci_zhu_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang_import_stub` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.fu_yuan_huo_xue_tang_import_stub` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |

### C. Malformed URLs -- 0 references
_None detected._

---

## 4. Invariant & Safety Proof

- **Canonical Herb Data (`data/herbs/herb_canon_shortlist.json`)**: Byte-for-byte unchanged.
- **Canonical Formula Data (`data/herbs/formulas.json`)**: Byte-for-byte unchanged.
- **Generated Knowledge Bundles**: 0 mutations.
- **Output Hygiene**: 0 illegal control characters (U+0000?U+001F except TAB/LF/CR), 0 replacement characters.
