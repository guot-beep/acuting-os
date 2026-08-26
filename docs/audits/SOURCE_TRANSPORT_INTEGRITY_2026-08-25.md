# Source Transport Integrity Audit (Task 9A Round 4)

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
| **OK_200 (Direct 200)** | 620 | 464 | 1081 |
| **REDIRECT_TO_200 (Followed Redirect to 200)** | 3 | 0 | 3 |
| **DEAD_4XX (HTTP 4xx Client Error)** | 88 | 7 | 95 |
| **SERVER_5XX (HTTP 5xx Server Error)** | 0 | 73 | 73 |
| **TIMEOUT (Request Timeout >10s)** | 0 | 6 | 6 |
| **DNS / TLS / Network Errors** | 0 | 0 | 0 |
| **OTHER_HTTP_STATUS** | 0 | 2 | 2 |
| **HTTP Closure Verification** | CLOSED_PASS (1260/1260) | - | - |
| **Local Source Paths Checked** | 2804 | 3437 | 6241 |
| **LOCAL_EXISTS** | 2801 | 2823 | 5624 |
| **LOCAL_MISSING** | 3 | 614 | 617 |
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

### A. Dead Links (`DEAD_4XX`) -- 493 references
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
| `herb.chai_hu` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Bupleurum_falcatum_1.jpg/640px-Bupleurum_falcatum_1.jpg |
| `herb.chai_hu` | herb | `source_urls[2]` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Bupleurum_falcatum_1.jpg/640px-Bupleurum_falcatum_1.jpg |
| `herb.chai_hu` | herb | `source_citations[6].url` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Bupleurum_falcatum_1.jpg/640px-Bupleurum_falcatum_1.jpg |
| `herb.sheng_ma` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Cimicifuga_foetida.jpg/640px-Cimicifuga_foetida.jpg |
| `herb.man_jing_zi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Vitex_trifolia.jpg/640px-Vitex_trifolia.jpg |
| `herb.dan_dou_chi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Douchi.jpg/640px-Douchi.jpg |
| `herb.shi_gao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Gypsum_crystal.jpg/640px-Gypsum_crystal.jpg |
| `herb.zhi_mu` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Anemarrhena_asphodeloides_1.jpg/640px-Anemarrhena_asphodeloides_1.jpg |
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
| `herb.hua_shi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Talc_block.jpg/640px-Talc_block.jpg |
| `herb.yin_chen_hao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/YinChenHao.html |
| `herb.fu_zi` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/FuZi.html |
| `herb.ju_hong` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/JuHong.html |
| `herb.zhi_ke` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/ZhiKe.html |
| `herb.chuan_xiong` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Ligusticum_striatum_1.jpg/640px-Ligusticum_striatum_1.jpg |
| `herb.yan_hu_suo` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Corydalis_yanhusuo_1.jpg/640px-Corydalis_yanhusuo_1.jpg |
| `herb.yu_jin` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Curcuma_aromatica_1.jpg/640px-Curcuma_aromatica_1.jpg |
| `herb.dan_shen` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Salvia_miltiorrhiza_1.jpg/640px-Salvia_miltiorrhiza_1.jpg |
| `herb.tao_ren` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Prunus_persica_seeds.jpg/640px-Prunus_persica_seeds.jpg |
| `herb.hong_hua` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Carthamus_tinctorius_1.jpg/640px-Carthamus_tinctorius_1.jpg |
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
| `herb.bei_sha_shen` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/BeiShaShen.html |
| `herb.lu_jiao_jiao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/LuJiaoJiao.html |
| `herb.wu_wei_zi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Schisandra_chinensis_1.jpg/640px-Schisandra_chinensis_1.jpg |
| `herb.hua_jiao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/HuaJiao.html |
| `herb.ru_xiang` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Frankincense_2003-12-29.jpg/640px-Frankincense_2003-12-29.jpg |
| `herb.mo_yao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Myrrh_resin.jpg/640px-Myrrh_resin.jpg |
| `herb.yi_mu_cao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Leonurus_japonica_1.jpg/640px-Leonurus_japonica_1.jpg |
| `herb.qian_cao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/QianCao.html |
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
| `herb.bai_jiang_can` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/BaiJiangCan.html |
| `herb.han_lian_cao` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/HanLianCao.html |
| `herb.mo_han_lian` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/HanLianCao.html |
| `herb.rou_dou_kou` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Myristica_fragrans_fruit_1.jpg/640px-Myristica_fragrans_fruit_1.jpg |
| `herb.chuan_niu_xi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Cyathula_officinalis_1.jpg/640px-Cyathula_officinalis_1.jpg |
| `herb.wu_zei_gu` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/WuZeiGu.html |
| `herb.tong_cao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tetrapanax_papyriferus_1.jpg/640px-Tetrapanax_papyriferus_1.jpg |
| `herb.xin_yi` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/XinYi.html |
| `herb.huai_hua` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/HuaiHua.html |
| `herb.qu_mai` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Dianthus_superbus_1.jpg/640px-Dianthus_superbus_1.jpg |
| `herb.bai_fu_zi` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/BaiFuZi.html |
| `herb.niu_bang_zi` | herb | `source_citations[6].url` | 403 | https://www.tph.mohw.gov.tw/?aid=86&iid=276&page_name=detail&pid=44 |
| `herb.niu_bang_zi` | herb | `field_sources.dosage[1]` | 403 | https://www.tph.mohw.gov.tw/?aid=86&iid=276&page_name=detail&pid=44 |
| `herb.bian_xu` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Polygonum_aviculare_1.jpg/640px-Polygonum_aviculare_1.jpg |
| `herb.wu_ling_zhi` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Trogopterus_xanthipes.jpg/640px-Trogopterus_xanthipes.jpg |
| `herb.wu_mei` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Prunus_mume_fruit_1.jpg/640px-Prunus_mume_fruit_1.jpg |
| `herb.deng_xin_cao` | herb | `image` | 400 | https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Juncus_effusus_1.jpg/640px-Juncus_effusus_1.jpg |
| `herb.yin_xing` | herb | `american_dragon_url` | 404 | https://www.americandragon.com/Individualherbsupdate/YinXing.html |
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
| `formula.ren_shen_yang_rong_tang` | formula | `source_urls[4]` | 403 | https://www1.ndmctsgh.edu.tw/MedChinese/Detail/C1/B0989.html |
| `formula.ren_shen_yang_rong_tang` | formula | `field_sources.source_classic[1]` | 403 | https://www1.ndmctsgh.edu.tw/MedChinese/Detail/C1/B0989.html |
| `formula.shen_qi_wan` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/JinGuiShenQiWan.html |
| `formula.zhen_gan_xi_feng_tang` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/ZhenGanXiFengTang.html |
| `formula.xian_fang_huo_ming_yin` | formula | `american_dragon_url` | 404 | https://www.americandragon.com/Herb%20Formulas%20copy/XianFangHuoMingYin.html |

### B. Missing Local Files (`LOCAL_MISSING`) -- 617 references
| Record ID | Type | Field Path | Normalized Missing Path | Raw Citation |
|---|---|---|---|---|
| `herb.hai_zao` | herb | `source_citations[2].url` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` |
| `herb.hai_zao` | herb | `field_sources.contraindications_zh[2]` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` |
| `herb.hai_zao` | herb | `field_sources.clinical_use_note[2]` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` | `curriculum/herbs/Mnemonics for 18 incompatibilities, 19 antagonisms and pregnant contraindications.md` |
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
| `formula.xiang_su_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiang_su_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiang_su_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.jing_fang_bai_du_san` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.chai_ge_jie_ji_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.chai_ge_jie_ji_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chai_ge_jie_ji_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_ma_ge_gen_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_ma_ge_gen_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ren_shen_bai_du_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
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
| `formula.liang_ge_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.liang_ge_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_ge_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_ying_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_ying_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_ying_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.xie_bai_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xie_bai_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xie_bai_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bai_tou_weng_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bai_tou_weng_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bai_tou_weng_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_hao_bie_jia_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_hao_bie_jia_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_hao_bie_jia_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_gu_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qing_gu_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qing_gu_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_liu_huang_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dang_gui_liu_huang_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_wei_xiao_du_yin` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wu_wei_xiao_du_yin` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_wei_xiao_du_yin` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.ji_chuan_jian` | formula | `field_sources.pulse_zh[0]` | `curriculum/formulas/Formulations Summary Chart.docx.md(「Intestines, Unblocks Bowels.   Envoy      Sheng Ma                          1.5-」;帳本 docs/research_packs/TONGUE_PULSE_BACKFILL_2026-08-19.json` | `curriculum/formulas/Formulations Summary Chart.docx.md(「Intestines, Unblocks Bowels.   Envoy      Sheng Ma                          1.5-」;帳本 docs/research_packs/TONGUE_PULSE_BACKFILL_2026-08-19.json` |
| `formula.xiao_chai_hu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_chai_hu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_chai_hu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_chai_hu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_chai_hu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_chai_hu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.li_zhong_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.li_zhong_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.li_zhong_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_zi_li_zhong_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_zi_li_zhong_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.xiao_jian_zhong_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
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
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bu_zhong_yi_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yu_ping_feng_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yu_ping_feng_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yu_ping_feng_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_mai_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.sheng_mai_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sheng_mai_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ren_shen_yang_rong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ren_shen_yang_rong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_wu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_wu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_wu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.jin_gui_shen_qi_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jin_gui_shen_qi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_gui_shen_qi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_gan_cao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhi_gan_cao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_gan_cao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yi_guan_jian` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yi_guan_jian` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yi_guan_jian` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.mu_li_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.mu_li_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.mu_li_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.zhen_ren_yang_zang_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.si_shen_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.si_shen_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.si_shen_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_suo_gu_jing_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jin_suo_gu_jing_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_suo_gu_jing_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_piao_xiao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.sang_piao_xiao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_piao_xiao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.suo_quan_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.suo_quan_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.suo_quan_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.suan_zao_ren_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.suan_zao_ren_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.suan_zao_ren_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gan_mai_da_zao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gan_mai_da_zao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gan_mai_da_zao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yue_ju_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.yue_ju_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.yue_ju_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chai_hu_shu_gan_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.chai_hu_shu_gan_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.chai_hu_shu_gan_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_hou_po_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ban_xia_hou_po_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_hou_po_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.su_zi_jiang_qi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.su_zi_jiang_qi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.su_zi_jiang_qi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.er_miao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.er_miao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_miao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.er_chen_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.er_chen_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_chen_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wen_dan_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wen_dan_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wen_dan_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_bai_zhu_tian_ma_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ban_xia_bai_zhu_tian_ma_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ban_xia_bai_zhu_tian_ma_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.zhen_gan_xi_feng_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhen_gan_xi_feng_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_gan_xi_feng_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_huo_luo_dan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_huo_luo_dan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_huo_luo_dan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bao_he_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bao_he_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bao_he_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jian_pi_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jian_pi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jian_pi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_xing_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.sang_xing_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sang_xing_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sha_shen_mai_men_dong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.sha_shen_mai_men_dong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_sou_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhi_sou_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhi_sou_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.an_gong_niu_huang_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zi_xue_dan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zi_xue_dan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zi_xue_dan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.da_ding_feng_zhu` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_ding_feng_zhu` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_ding_feng_zhu` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.du_huo_ji_sheng_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.du_huo_ji_sheng_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.du_huo_ji_sheng_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gan_lu_xiao_du_dan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gan_lu_xiao_du_dan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gan_lu_xiao_du_dan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huai_hua_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.huai_hua_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.huai_hua_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
| `formula.bu_fei_tang` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.bu_fei_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.bu_fei_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.bu_fei_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_bu_yin_wan` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.da_bu_yin_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_bu_yin_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_bu_yin_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_jian_zhong_tang` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_jian_zhong_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_jian_zhong_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_qing_long_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.da_qing_long_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.da_qing_long_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.dan_shen_yin` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
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
| `formula.du_qi_wan` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.du_qi_wan` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.du_qi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.du_qi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_xian_tang` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.er_xian_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.er_xian_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_xian_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_zhi_wan` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
| `formula.er_zhi_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.er_zhi_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.er_zhi_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fang_feng_tong_sheng_san` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.fang_feng_tong_sheng_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.fang_feng_tong_sheng_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fang_feng_tong_sheng_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.contraindications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.fu_yuan_huo_xue_tang` | formula | `field_sources.cautions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `中文譯自本筆記錄既有 contraindications_en/cautions_en（原始英文出處：American Dragon Formula Index, American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07 匯入）。本次僅補忠實中譯，未新增未查證主張 — 2026-08-11` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.ge_gen_huang_qin_huang_lian_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gu_jing_wan` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.gu_jing_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gu_jing_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gu_jing_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_zhi_shao_yao_zhi_mu_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.gui_zhi_shao_yao_zhi_mu_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.gui_zhi_shao_yao_zhi_mu_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_ling_zi_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.jin_ling_zi_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.jin_ling_zi_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_fu_wan` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.liang_fu_wan` | formula | `field_sources.composition[0]` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.liang_fu_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.liang_fu_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.nuan_gan_jian` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.nuan_gan_jian` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.nuan_gan_jian` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.nuan_gan_jian` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.qiang_huo_sheng_shi_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_gan_cao_tang` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.shao_yao_gan_cao_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.shao_yao_gan_cao_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tian_tai_wu_yao_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.tian_tai_wu_yao_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.tian_tai_wu_yao_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_pi_san` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.wu_pi_san` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.wu_pi_san` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.wu_pi_san` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xi_jiao_di_huang_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xi_jiao_di_huang_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_ji_yin_zi` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` | `curriculum/formulas/Herbal Formulations Comprehensive.docx.pdf` |
| `formula.xiao_ji_yin_zi` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.xiao_ji_yin_zi` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xiao_ji_yin_zi` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.xie_huang_san` | formula | `field_sources.name_zh[0]` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` | `curriculum/formulas/Formulations Summary Chart.docx.pdf` |
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
| `formula.hao_qin_qing_dan_tang` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.hao_qin_qing_dan_tang` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.fu_ling_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhu_sha_an_shen_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhu_sha_an_shen_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhu_sha_an_shen_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_zhu_mu_wan` | formula | `field_sources.composition` | `AD_Selected_Formulas_Name_Herbs_Actions.md` | `American Dragon Formula Dataset (AD_Selected_Formulas_Name_Herbs_Actions.md, 2026-08-07)` |
| `formula.zhen_zhu_mu_wan` | formula | `field_sources.actions_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
| `formula.zhen_zhu_mu_wan` | formula | `field_sources.pattern_indications_zh[0]` | `American_Dragon_201_Formulas_Name_Actions_Syndromes.md` | `American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)` |
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
- **Output Hygiene**: 0 illegal control characters (U+0000–U+001F except TAB/LF/CR), 0 replacement characters.
- **HTTP Classification Closure Invariant**: `sum(all HTTP transport classifications) === uniqueHttpUrls` (100% verified).
- **Path Parser Anti-Bare-Tail Invariant**: All citations with repo prefixes retain full repo-relative paths (100% verified).
