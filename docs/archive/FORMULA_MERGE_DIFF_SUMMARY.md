# Formula Merge Diff Summary

Generated: 2026-07-11T19:04:17.495Z

## Gate

Preview only. No data file was modified. Do not apply until Ting approves this summary.

## Counts

| Metric | Count |
|---|---:|
| formulas_records | 23 |
| shortlist_records | 115 |
| overlap_records | 23 |
| formula_only_records | 0 |
| shortlist_only_records_to_add_as_draft_skeletons | 92 |
| projected_records_after_merge | 115 |
| duplicate_formula_ids | 0 |
| duplicate_shortlist_ids | 0 |
| identity_conflict_records | 0 |
| overlapping_fill_from_shortlist_fields | 138 |
| overlapping_changed_or_conflicting_fields | 0 |

## Field Map

| Shortlist field | Target field | Decision |
|---|---|---|
| `id` | `id` | primary key; must match; no auto-change on conflict |
| `name_zh` | `name_zh` | identity field; must match; no auto-change on conflict |
| `name_en` | `name_en` | identity field; must match; no auto-change on conflict |
| `pinyin` | `pinyin` | identity field; must match; no auto-change on conflict |
| `category` | `category` | add shortlist category while preserving existing category_id/category_en |
| `tier` | `tier` | add to all records; current shortlist is core |
| `source_hint` | `source_hint` | add planning/source hint from shortlist |
| `comparison_group` | `comparison_group` | add study comparison group from shortlist |
| `related_formulas` | `related_formulas` | add/replace from shortlist only after approval; ID references only |
| `modern_clinical_use_tags` | `modern_clinical_use_tags` | compare existing values; prefer approved union/review, not blind overwrite |
| `related_conditions` | `related_conditions` | compare existing values; keep ID references only |
| `clinical_use_note` | `clinical_use_note` | add conservative clinical-context note from shortlist |
| `english_exam_track` | `english_exam_track` | preserve formulas.json content-bearing field; skeleton additions get draft empty track |
| `chinese_depth_track` | `chinese_depth_track` | preserve formulas.json content-bearing field; skeleton additions get draft empty track |
| `actions/composition/indications/modifications/contraindications` | `same formulas.json fields` | preserve existing 23 content; skeleton additions remain empty draft |

## Overlap Result

- Overlap records matched by `id`: 23
- Formula-only records: 0
- Shortlist-only records proposed as draft skeleton additions: 92
- Identity conflict records: 0
- Projected merged record count: 115

## Overlap Planning Field Changes

| Formula | Fill from shortlist | Changed/conflicting fields |
|---|---:|---:|
| `formula.ba_zhen_tang` 八珍湯 | 6 | 0 |
| `formula.ban_xia_xie_xin_tang` 半夏瀉心湯 | 6 | 0 |
| `formula.bu_zhong_yi_qi_tang` 補中益氣湯 | 6 | 0 |
| `formula.er_chen_tang` 二陳湯 | 6 | 0 |
| `formula.gui_pi_tang` 歸脾湯 | 6 | 0 |
| `formula.gui_zhi_tang` 桂枝湯 | 6 | 0 |
| `formula.jia_wei_xiao_yao_san` 加味逍遙散 | 6 | 0 |
| `formula.jin_gui_shen_qi_wan` 金匱腎氣丸 | 6 | 0 |
| `formula.liu_jun_zi_tang` 六君子湯 | 6 | 0 |
| `formula.liu_wei_di_huang_wan` 六味地黃丸 | 6 | 0 |
| `formula.long_dan_xie_gan_tang` 龍膽瀉肝湯 | 6 | 0 |
| `formula.ma_huang_tang` 麻黃湯 | 6 | 0 |
| `formula.ping_wei_san` 平胃散 | 6 | 0 |
| `formula.sang_ju_yin` 桑菊飲 | 6 | 0 |
| `formula.si_jun_zi_tang` 四君子湯 | 6 | 0 |
| `formula.si_wu_tang` 四物湯 | 6 | 0 |
| `formula.tao_hong_si_wu_tang` 桃紅四物湯 | 6 | 0 |
| `formula.tian_wang_bu_xin_dan` 天王補心丹 | 6 | 0 |
| `formula.wen_jing_tang` 溫經湯 | 6 | 0 |
| `formula.xiao_chai_hu_tang` 小柴胡湯 | 6 | 0 |
| `formula.xiao_yao_san` 逍遙散 | 6 | 0 |
| `formula.xue_fu_zhu_yu_tang` 血府逐瘀湯 | 6 | 0 |
| `formula.yin_qiao_san` 銀翹散 | 6 | 0 |

## Draft Skeleton Additions

The following 92 shortlist-only formulas would be added as `review_status: "draft"` skeletons after approval:

- `formula.an_gong_niu_huang_wan` 安宮牛黃丸 / Calm the Palace Pill with Cattle Gallstone (開竅劑 / Open the Orifices; group `open_orifices`)
- `formula.ba_zheng_san` 八正散 / Eight-Herb Powder for Rectification (祛濕劑 / Dispel Dampness; group `damp_heat`)
- `formula.bai_du_san` 敗毒散 / Overcome Pathogenic Influences Powder (解表劑 / Release the Exterior; group `exterior_wind_cold`)
- `formula.bai_he_gu_jin_tang` 百合固金湯 / Lily Bulb Decoction to Preserve the Metal (治燥劑 / Treat Dryness; group `dryness_lung`)
- `formula.bai_hu_tang` 白虎湯 / White Tiger Decoction (清熱劑 / Clear Heat; group `heat_qi_ying_blood`)
- `formula.ban_xia_bai_zhu_tian_ma_tang` 半夏白朮天麻湯 / Pinellia, Atractylodes Macrocephala, and Gastrodia Decoction (祛痰劑 / Transform Phlegm; group `phlegm_damp`)
- `formula.ban_xia_hou_po_tang` 半夏厚朴湯 / Pinellia and Magnolia Bark Decoction (理氣劑 / Regulate Qi; group `qi_regulation`)
- `formula.bao_he_wan` 保和丸 / Preserve Harmony Pill (消食劑 / Reduce Food Stagnation; group `food_stagnation`)
- `formula.bei_mu_gua_lou_san` 貝母瓜蔞散 / Fritillaria and Trichosanthes Fruit Powder (祛痰劑 / Transform Phlegm; group `phlegm_damp`)
- `formula.bu_yang_huan_wu_tang` 補陽還五湯 / Tonify the Yang to Restore Five Decoction (理血劑 / Regulate Blood; group `blood_stasis`)
- `formula.chai_hu_shu_gan_san` 柴胡疏肝散 / Bupleurum Powder to Spread the Liver (理氣劑 / Regulate Qi; group `liver_spleen`)
- `formula.chuan_xiong_cha_tiao_san` 川芎茶調散 / Ligusticum Chuanxiong Powder to be Taken with Green Tea (治風劑 / Expel or Extinguish Wind; group `wind_external_skin`)
- `formula.da_chai_hu_tang` 大柴胡湯 / Major Bupleurum Decoction (和解劑 / Harmonize; group `shaoyang_harmonize`)
- `formula.da_cheng_qi_tang` 大承氣湯 / Major Order the Qi Decoction (瀉下劑 / Drain Downward; group `drain_downward`)
- `formula.da_ding_feng_zhu` 大定風珠 / Major Arrest Wind Pearl (治風劑 / Expel or Extinguish Wind; group `internal_wind`)
- `formula.dang_gui_bu_xue_tang` 當歸補血湯 / Dang Gui Decoction to Tonify the Blood (補益劑 / Tonify; group `blood_tonify`)
- `formula.dang_gui_si_ni_tang` 當歸四逆湯 / Dang Gui Decoction for Frigid Extremities (溫裡劑 / Warm the Interior; group `rescue_yang_warm_channels`)
- `formula.dao_chi_san` 導赤散 / Guide Out the Red Powder (清熱劑 / Clear Heat; group `heat_toxin_fire`)
- `formula.ding_chuan_tang` 定喘湯 / Arrest Wheezing Decoction (理氣劑 / Regulate Qi; group `qi_regulation`)
- `formula.du_huo_ji_sheng_tang` 獨活寄生湯 / Angelica Pubescens and Taxillus Decoction (祛濕劑 / Dispel Dampness; group `wind_damp_bi`)
- `formula.fang_ji_huang_qi_tang` 防己黃耆湯 / Stephania and Astragalus Decoction (祛濕劑 / Dispel Dampness; group `damp_water`)
- `formula.gan_lu_xiao_du_dan` 甘露消毒丹 / Sweet Dew Special Pill to Eliminate Toxin (祛濕劑 / Dispel Dampness; group `damp_heat`)
- `formula.gan_mai_da_zao_tang` 甘麥大棗湯 / Licorice, Wheat, and Jujube Decoction (安神劑 / Calm the Spirit; group `calm_spirit`)
- `formula.gu_chong_tang` 固沖湯 / Stabilize Gushing Decoction (固澀劑 / Stabilize and Bind; group `stabilize_bind`)
- `formula.gui_zhi_fu_ling_wan` 桂枝茯苓丸 / Cinnamon Twig and Poria Pill (理血劑 / Regulate Blood; group `blood_stasis`)
- `formula.huai_hua_san` 槐花散 / Sophora Japonica Flower Powder (理血劑 / Regulate Blood; group `bleeding`)
- `formula.huang_lian_e_jiao_tang` 黃連阿膠湯 / Coptis and Ass-Hide Gelatin Decoction (安神劑 / Calm the Spirit; group `calm_spirit`)
- `formula.huang_lian_jie_du_tang` 黃連解毒湯 / Coptis Decoction to Relieve Toxicity (清熱劑 / Clear Heat; group `heat_toxin_fire`)
- `formula.huang_tu_tang` 黃土湯 / Yellow Earth Decoction (理血劑 / Regulate Blood; group `bleeding`)
- `formula.huo_xiang_zheng_qi_san` 藿香正氣散 / Agastache Powder to Rectify the Qi (祛濕劑 / Dispel Dampness; group `damp_middle_jiao`)
- `formula.jian_pi_wan` 健脾丸 / Strengthen the Spleen Pill (消食劑 / Reduce Food Stagnation; group `food_stagnation`)
- `formula.jiu_wei_qiang_huo_tang` 九味羌活湯 / Nine-Herb Decoction with Notopterygium (解表劑 / Release the Exterior; group `exterior_wind_cold`)
- `formula.li_zhong_wan` 理中丸 / Regulate the Middle Pill (溫裡劑 / Warm the Interior; group `warm_interior_middle`)
- `formula.lian_po_yin` 連朴飲 / Coptis and Magnolia Bark Decoction (祛濕劑 / Dispel Dampness; group `damp_heat`)
- `formula.ling_jiao_gou_teng_tang` 羚角鉤藤湯 / Antelope Horn and Uncaria Decoction (治風劑 / Expel or Extinguish Wind; group `internal_wind`)
- `formula.ma_xing_shi_gan_tang` 麻杏石甘湯 / Ephedra, Apricot Kernel, Gypsum, and Licorice Decoction (解表劑 / Release the Exterior; group `exterior_wind_heat`)
- `formula.ma_zi_ren_wan` 麻子仁丸 / Hemp Seed Pill (瀉下劑 / Drain Downward; group `drain_downward`)
- `formula.mai_men_dong_tang` 麥門冬湯 / Ophiopogonis Decoction (治燥劑 / Treat Dryness; group `dryness_lung`)
- `formula.mu_li_san` 牡蠣散 / Oyster Shell Powder (固澀劑 / Stabilize and Bind; group `stabilize_bind`)
- `formula.pu_ji_xiao_du_yin` 普濟消毒飲 / Universal Benefit Decoction to Eliminate Toxin (清熱劑 / Clear Heat; group `heat_toxin_fire`)
- `formula.qian_zheng_san` 牽正散 / Lead to Symmetry Powder (治風劑 / Expel or Extinguish Wind; group `wind_external_skin`)
- `formula.qing_hao_bie_jia_tang` 青蒿鱉甲湯 / Artemisia Annua and Soft-Shelled Turtle Shell Decoction (清熱劑 / Clear Heat; group `heat_qi_ying_blood`)
- `formula.qing_qi_hua_tan_wan` 清氣化痰丸 / Clear the Qi and Transform Phlegm Pill (祛痰劑 / Transform Phlegm; group `phlegm_damp`)
- `formula.qing_wei_san` 清胃散 / Clear the Stomach Powder (清熱劑 / Clear Heat; group `heat_toxin_fire`)
- `formula.qing_ying_tang` 清營湯 / Clear the Nutritive Level Decoction (清熱劑 / Clear Heat; group `heat_qi_ying_blood`)
- `formula.qing_zao_jiu_fei_tang` 清燥救肺湯 / Eliminate Dryness and Rescue the Lungs Decoction (治燥劑 / Treat Dryness; group `dryness_lung`)
- `formula.san_ren_tang` 三仁湯 / Three-Nut Decoction (祛濕劑 / Dispel Dampness; group `damp_heat`)
- `formula.shen_ling_bai_zhu_san` 參苓白朮散 / Ginseng, Poria, and Atractylodes Macrocephala Powder (補益劑 / Tonify; group `qi_tonify`)
- `formula.sheng_hua_tang` 生化湯 / Generation and Transformation Decoction (理血劑 / Regulate Blood; group `gynecology_blood`)
- `formula.sheng_mai_san` 生脈散 / Generate the Pulse Powder (補益劑 / Tonify; group `qi_tonify`)
- `formula.shi_hui_san` 十灰散 / Ten Partially-Charred Substances Powder (理血劑 / Regulate Blood; group `bleeding`)
- `formula.shi_pi_san` 實脾散 / Bolster the Spleen Powder (祛濕劑 / Dispel Dampness; group `damp_water`)
- `formula.shi_xiao_san` 失笑散 / Sudden Smile Powder (理血劑 / Regulate Blood; group `blood_stasis`)
- `formula.si_ni_san` 四逆散 / Frigid Extremities Powder (和解劑 / Harmonize; group `liver_spleen`)
- `formula.si_ni_tang` 四逆湯 / Frigid Extremities Decoction (溫裡劑 / Warm the Interior; group `rescue_yang_warm_channels`)
- `formula.si_shen_wan` 四神丸 / Four-Miracle Pill (固澀劑 / Stabilize and Bind; group `stabilize_bind`)
- `formula.su_he_xiang_wan` 蘇合香丸 / Liquid Styrax Pill (開竅劑 / Open the Orifices; group `open_orifices`)
- `formula.su_zi_jiang_qi_tang` 蘇子降氣湯 / Perilla Fruit Decoction for Directing Qi Downward (理氣劑 / Regulate Qi; group `qi_regulation`)
- `formula.suan_zao_ren_tang` 酸棗仁湯 / Sour Jujube Decoction (安神劑 / Calm the Spirit; group `calm_spirit`)
- `formula.tao_he_cheng_qi_tang` 桃核承氣湯 / Peach Pit Decoction to Order the Qi (理血劑 / Regulate Blood; group `blood_stasis`)
- `formula.tian_ma_gou_teng_yin` 天麻鉤藤飲 / Gastrodia and Uncaria Decoction (治風劑 / Expel or Extinguish Wind; group `internal_wind`)
- `formula.tiao_wei_cheng_qi_tang` 調胃承氣湯 / Regulate the Stomach and Order the Qi Decoction (瀉下劑 / Drain Downward; group `drain_downward`)
- `formula.tong_xie_yao_fang` 痛瀉要方 / Important Formula for Painful Diarrhea (和解劑 / Harmonize; group `liver_spleen`)
- `formula.wan_dai_tang` 完帶湯 / End Discharge Decoction (固澀劑 / Stabilize and Bind; group `stabilize_bind`)
- `formula.wen_dan_tang` 溫膽湯 / Warm the Gallbladder Decoction (祛痰劑 / Transform Phlegm; group `phlegm_damp`)
- `formula.wu_ling_san` 五苓散 / Five-Ingredient Powder with Poria (祛濕劑 / Dispel Dampness; group `damp_water`)
- `formula.wu_mei_wan` 烏梅丸 / Mume Pill (驅蟲劑 / Expel Parasites; group `parasites_jueyin`)
- `formula.wu_zhu_yu_tang` 吳茱萸湯 / Evodia Decoction (溫裡劑 / Warm the Interior; group `warm_interior_middle`)
- `formula.xi_jiao_di_huang_tang` 犀角地黃湯 / Rhinoceros Horn and Rehmannia Decoction (清熱劑 / Clear Heat; group `heat_qi_ying_blood`)
- `formula.xiao_cheng_qi_tang` 小承氣湯 / Minor Order the Qi Decoction (瀉下劑 / Drain Downward; group `drain_downward`)
- `formula.xiao_feng_san` 消風散 / Eliminate Wind Powder (治風劑 / Expel or Extinguish Wind; group `wind_external_skin`)
- `formula.xiao_jian_zhong_tang` 小建中湯 / Minor Construct the Middle Decoction (溫裡劑 / Warm the Interior; group `warm_interior_middle`)
- `formula.xiao_qing_long_tang` 小青龍湯 / Minor Blue-Green Dragon Decoction (解表劑 / Release the Exterior; group `exterior_wind_cold`)
- `formula.xiao_xian_xiong_tang` 小陷胸湯 / Minor Decoction for Pathogens Stuck in the Chest (祛痰劑 / Transform Phlegm; group `phlegm_damp`)
- `formula.xing_su_san` 杏蘇散 / Apricot Kernel and Perilla Leaf Powder (治燥劑 / Treat Dryness; group `dryness_lung`)
- `formula.xuan_fu_dai_zhe_tang` 旋覆代赭湯 / Inula and Hematite Decoction (理氣劑 / Regulate Qi; group `qi_regulation`)
- `formula.yi_guan_jian` 一貫煎 / Linking Decoction (補益劑 / Tonify; group `yin_tonify`)
- `formula.yin_chen_hao_tang` 茵陳蒿湯 / Virgate Wormwood Decoction (祛濕劑 / Dispel Dampness; group `damp_heat`)
- `formula.you_gui_wan` 右歸丸 / Restore the Right Kidney Pill (補益劑 / Tonify; group `yang_tonify`)
- `formula.yu_nu_jian` 玉女煎 / Jade Woman Decoction (清熱劑 / Clear Heat; group `heat_toxin_fire`)
- `formula.yu_ping_feng_san` 玉屏風散 / Jade Windscreen Powder (補益劑 / Tonify; group `qi_tonify`)
- `formula.yue_ju_wan` 越鞠丸 / Escape Restraint Pill (理氣劑 / Regulate Qi; group `liver_spleen`)
- `formula.zhen_gan_xi_feng_tang` 鎮肝熄風湯 / Sedate the Liver and Extinguish Wind Decoction (治風劑 / Expel or Extinguish Wind; group `internal_wind`)
- `formula.zhen_ren_yang_zang_tang` 真人養臟湯 / True Man's Decoction to Nourish the Organs (固澀劑 / Stabilize and Bind; group `stabilize_bind`)
- `formula.zhen_wu_tang` 真武湯 / True Warrior Decoction (祛濕劑 / Dispel Dampness; group `damp_water`)
- `formula.zhi_bao_dan` 至寶丹 / Greatest Treasure Special Pill (開竅劑 / Open the Orifices; group `open_orifices`)
- `formula.zhi_gan_cao_tang` 炙甘草湯 / Honey-Fried Licorice Decoction (補益劑 / Tonify; group `qi_blood_tonify`)
- `formula.zhi_shi_xie_bai_gui_zhi_tang` 枳實薤白桂枝湯 / Unripe Bitter Orange, Chinese Chive, and Cinnamon Twig Decoction (理氣劑 / Regulate Qi; group `qi_regulation`)
- `formula.zhu_ling_tang` 豬苓湯 / Polyporus Decoction (祛濕劑 / Dispel Dampness; group `damp_water`)
- `formula.zhu_ye_shi_gao_tang` 竹葉石膏湯 / Lophatherus and Gypsum Decoction (清熱劑 / Clear Heat; group `heat_qi_ying_blood`)
- `formula.zuo_gui_wan` 左歸丸 / Restore the Left Kidney Pill (補益劑 / Tonify; group `yin_tonify`)
- `formula.zuo_jin_wan` 左金丸 / Left Metal Pill (清熱劑 / Clear Heat; group `liver_gallbladder_damp_heat`)

## Recommended Apply Policy

1. Preserve all content-bearing fields already present in `data/herbs/formulas.json` for the 23 overlap records.
2. Add missing planning fields from the shortlist (`tier`, `category`, `source_hint`, `comparison_group`, `related_formulas`, `clinical_use_note`).
3. For overlapping `modern_clinical_use_tags` and `related_conditions`, review before overwrite; these are search/relation surfaces.
4. Add the 92 shortlist-only records as compact draft skeletons only after Ting approves this preview.
5. Do not upgrade any record to `source_checked` during merge.

