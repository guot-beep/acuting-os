# pattern_indications / actions 中英對齊 — 58 筆待裁決

三無乾淨的 2 筆已落庫(2026-08-19)。這條線跟 contraindications 不同:
既有 en 大多是**意譯**,忠實化提案會把原句移進 orphan_en(= 覆蓋既有內容),
依憲法整批先問 Ting。帳本全文:docs/research_packs/PI_ACTIONS_ALIGN_PROPOSALS_2026-08-19.json

## ⚠️ 先看:歸屬錯誤(8 筆,比語言錯誤嚴重)

### formula.tao_hong_si_wu_tang · pattern_indications
ATTRIBUTION FLAG: zh is encyclopedia-style article prose (headers, per-herb analysis, modification notes) misfiled into pattern_indications — only items 1-2 resemble actual indications. en was empty. Translated faithfully line-by-line per alignment rules; the field itself needs a curation pass (move, do not delete). zh untouched.

### formula.gui_zhi_fu_ling_wan · pattern_indications
ATTRIBUTION FLAG: the sole existing en item ("Phlegm-Dampness in the Middke Jiao", typo included) belongs to Er Chen Tang, not Gui Zhi Fu Ling Wan; moved to orphan_en.

### formula.gui_zhi_fu_ling_wan · actions
ATTRIBUTION FLAG: all three existing en actions (Dries Dampness / Moves Qi / Transforms Phlegm) are Er Chen Tang actions; moved to orphan_en.

### formula.ding_chuan_tang · pattern_indications
ATTRIBUTION FLAG: zh is article prose, and its content is internally misattributed — it speaks of removing Shi Gao and Xi Xin, of "all four [Si Wu] ingredients present", and of true-stroke vs stroke-like windstroke; Ding Chuan Tang contains none of those herbs and does not treat windstroke. The passage fits a Da Qin Jiao Tang commentary. The sole existing en ("Indication: 總結與思考") is untranslated mixed-language junk; moved to orphan_en.

### formula.huang_tu_tang · actions
SUSPECTED FAKE CONTENT: 清熱解表、調理氣血 contradicts Huang Tu Tang's established actions (warms yang, fortifies the spleen, nourishes blood, stops bleeding). Looks like generated template filler; the same sentence appears on formula.ling_jiao_gou_teng_yin with 本方 substituted. Translated literally per rules; needs clinical review before any downstream use. en was empty.

### formula.xuan_fu_dai_zhe_tang · pattern_indications
ATTRIBUTION FLAG: zh is formula-analysis prose (herb roles, modern biomedical disease list), not pattern indications; en was empty. Translated faithfully line-by-line; the field needs a curation pass (move, not delete).

### formula.yu_nu_jian · pattern_indications
ATTRIBUTION FLAG: zh is article prose misfiled into pattern_indications (item 0's indication list — lung-heat cough, steaming bone — is itself questionable for Yu Nu Jian). en was empty. Translated faithfully line-by-line; field needs curation (move, not delete).

### formula.ling_jiao_gou_teng_yin · actions
SUSPECTED FAKE CONTENT: 清熱解表、調理氣血 contradicts this formula's established actions (cools the liver, extinguishes wind, clears heat); identical template sentence appears on formula.huang_tu_tang with the name substituted. Translated literally per rules; needs clinical review. en was empty.

---

## 其餘 50 筆(orphan_en / damaged_zh)

### formula.cang_er_zi_san · pattern_indications
- orphan_en 2 條
- note: Both existing en items are loose paraphrases (they drop 鬱肺 lung constraint; the second adds "headache" found nowhere in zh); both preserved in orphan_en.

### formula.xie_xin_tang · pattern_indications
- orphan_en 3 條
- note: en index 0 kept verbatim (faithful to zh 0). Old en for zh 1 said "Stomach Deficiency" where zh says 中焦虛寒 (middle jiao deficiency cold); old en for zh 2 dropped 積滯 (accumulation-stagnation); both replaced and preserved in orphan_en. "Gu Syndrome" matches no zh item.

### formula.xie_xin_tang · actions
- orphan_en 4 條
- damaged_zh 1 條
- note: Attribution error in existing en: all four current en actions (Harmonizes the Stomach / Descends Rebellious Qi / Disperses clumping / Eliminates focal distention...) are Ban Xia Xie Xin Tang actions, not Xie Xin Tang (San Huang) actions; all moved to orphan_en.

### formula.ma_zi_ren_wan · pattern_indications
- orphan_en 4 條
- note: None of the four existing en items is a faithful rendering of either zh item (they name Colon Heat / Yang Ming Xu instead of 脾約); all preserved in orphan_en.

### formula.xiao_chai_hu_tang · pattern_indications
- orphan_en 4 條
- note: "Shao Yang Stage disorders" loosely corresponds to zh 0 but drops 半表半裡; replaced and preserved in orphan_en together with three en items matching no zh (Gu Syndrome etc.).

### formula.xiao_yao_san · pattern_indications
- orphan_en 7 條
- note: "Liver Qi Stagnation with Blood Deficiency" corresponds loosely to zh 0 but drops 脾弱; all seven existing en preserved in orphan_en (several — Bone Steaming, Gu Syndrome — match no zh at all).

### formula.tong_xie_yao_fang · pattern_indications
- orphan_en 2 條
- note: Existing en frames the mechanism as Liver Qi Stagnation Invading the Spleen, where zh says 脾虛肝旺 (spleen deficiency, liver exuberance) and adds 腸鳴; both en preserved in orphan_en (the second adds a Wind-Cold variant found in no zh).

### formula.ban_xia_xie_xin_tang · pattern_indications
- orphan_en 4 條
- note: The four existing en items are the same set stored on formula.xie_xin_tang; none is a 1:1 rendering of these two zh items; all preserved in orphan_en.

### formula.li_zhong_wan · pattern_indications
- orphan_en 11 條
- note: The 11 existing en items form a much broader indication list than the 3 zh patterns (Tai Yin subtypes, sudden turmoil disorder, childhood convulsions); all preserved in orphan_en rather than forced onto zh slots.

### formula.fu_zi_li_zhong_wan · pattern_indications
- orphan_en 6 條
- note: zh is a single combined pattern; the six existing en items are separate looser patterns ("Spleen and Kidney Yang Deficiency" is closest but drops 陰寒內盛); all preserved in orphan_en.

### formula.huang_qi_jian_zhong_tang · pattern_indications
- orphan_en 4 條
- note: Closest existing en drops 氣血不足 and 腹痛; all four preserved in orphan_en.

### formula.si_ni_tang · pattern_indications
- orphan_en 5 條
- note: None of the five existing en is a faithful rendering of either zh item; all preserved in orphan_en.

### formula.wu_zhu_yu_tang · pattern_indications
- orphan_en 5 條
- note: Existing en items name zang-fu patterns (Stomach Deficiency Cold etc.) where zh uses six-channel framing; all five preserved in orphan_en.

### formula.dang_gui_si_ni_tang · pattern_indications
- orphan_en 2 條
- note: "Cold in the Channels due to Blood Deficiency" is close but drops 寒厥 and 凝滯; both en preserved in orphan_en.

### formula.mu_li_san · pattern_indications
- orphan_en 3 條
- note: The three existing en split the single zh pattern into Qi-/Yin-deficiency subtypes not stated in zh; all preserved in orphan_en.

### formula.suan_zao_ren_tang · pattern_indications
- orphan_en 4 條
- note: The four existing en are looser zang-fu variants of the single zh pattern; all preserved in orphan_en.

### formula.er_chen_tang · pattern_indications
- orphan_en 5 條
- note: The five existing en are looser phlegm-pattern variants, none a 1:1 rendering of either zh; all preserved in orphan_en.

### formula.wen_dan_tang · pattern_indications
- orphan_en 4 條
- note: "Disharmony Between the Gallbladder and Stomach with Phlegm Heat" is closest but drops 失眠心悸; all four preserved in orphan_en.

### formula.ban_xia_bai_zhu_tian_ma_tang · pattern_indications
- orphan_en 2 條
- note: "Wind-Phlegm (Feng Tan)" is closest but drops 上擾頭痛眩暈; both preserved in orphan_en.

### formula.san_zi_yang_qin_tang · pattern_indications
- orphan_en 6 條
- note: The six existing en form a broader indication list; none is a 1:1 rendering; all preserved in orphan_en.

### formula.xiao_feng_san · pattern_indications
- orphan_en 2 條
- note: Second existing en is closest but reframes as two rash subtypes; both preserved in orphan_en ("Damp-Heat Injures the Spleen" matches no zh).

### formula.tian_ma_gou_teng_yin · pattern_indications
- orphan_en 2 條
- note: Both existing en are partial (each covers one half of the combined zh pattern); both preserved in orphan_en.

### formula.zhen_gan_xi_feng_tang · pattern_indications
- orphan_en 3 條
- note: The three existing en are mechanism elaborations, none carrying the zh head-word 類中風 (stroke-like disorder); all preserved in orphan_en.

### formula.xiao_huo_luo_dan · pattern_indications
- orphan_en 3 條
- note: First existing en is closest but drops 手足不仁; all three preserved in orphan_en.

### formula.sha_shen_mai_men_dong_tang · pattern_indications
- orphan_en 3 條
- note: "Dryness Injuring the Lungs and Stomach" is closest but drops 津液/燥熱乾咳 specifics; all three preserved in orphan_en.

### formula.an_gong_niu_huang_wan · pattern_indications
- orphan_en 3 條
- note: The three existing en are related but none carries the full zh clause; all preserved in orphan_en.

### formula.zhi_bao_dan · pattern_indications
- orphan_en 6 條
- note: The six existing en form a broader list (summerheat stroke, infantile epilepsy) not present in zh; all preserved in orphan_en.

### formula.yang_he_tang · pattern_indications
- orphan_en 2 條
- note: First existing en is closest but reframes mechanism as Yang Deficiency and drops 骨槽風; both preserved in orphan_en.

### formula.bai_du_san · pattern_indications
- orphan_en 3 條
- note: First existing en is closest but drops 惡寒發熱; all three preserved in orphan_en.

### formula.ding_chuan_tang · actions
- orphan_en 3 條
- damaged_zh 1 條
- note: zh is a full article dump (composition / principle / modification prose), stored twice: 35 items with a leading ":" artifact plus 32 plain duplicates (the plain copy lacks 咳嗽/氣喘/胸悶). Duplicated zh items get identical en, mirroring the duplication. The three existing en ("Action: 咳嗽" etc.) are untran

### formula.du_huo_ji_sheng_tang · pattern_indications
- orphan_en 4 條
- note: The four existing en split the single combined zh pattern into subtypes and add an atrophy-disorder indication not in zh; all preserved in orphan_en.

### formula.huai_hua_san · pattern_indications
- orphan_en 2 條
- note: zh appears to concatenate two phrases without punctuation (腸風臟毒便血 + 濕熱便血); translated as written. Both existing en preserved in orphan_en.

### formula.huang_tu_tang · pattern_indications
- damaged_zh 1 條
- note: zh is a placeholder heading, not an actual pattern; en was empty. Translated literally; the record needs real content.

### formula.ling_jiao_gou_teng_tang · pattern_indications
- orphan_en 4 條
- note: The four existing en are related Wen Bing framings plus two phlegm items matching no zh; all preserved in orphan_en.

### formula.qian_zheng_san · pattern_indications
- orphan_en 2 條
- note: Second existing en is closest but adds head-and-face channel detail and drops 口眼歪斜 phrasing; both preserved in orphan_en.

### formula.qing_zao_jiu_fei_tang · pattern_indications
- orphan_en 5 條
- note: The five existing en form a broader list; none is a 1:1 rendering; all preserved in orphan_en.

### formula.shi_xiao_san · pattern_indications
- orphan_en 3 條
- note: The three existing en name other stasis locations (Stomach, Liver) not in zh; all preserved in orphan_en.

### formula.si_ni_san · pattern_indications
- orphan_en 4 條
- note: The four existing en (Jue Yin Heat, Shao Yin Heat, Gu Syndrome, and a long Liver-Spleen item) do not map 1:1 onto the single combined zh pattern; all preserved in orphan_en.

### formula.su_he_xiang_wan · pattern_indications
- orphan_en 6 條
- note: The six existing en form a broader indication list; all preserved in orphan_en.

### formula.xuan_fu_dai_zhe_tang · actions
- damaged_zh 1 條
- note: zh is trivia prose (formula provenance), not action phrases, stored twice (leading-colon variant + plain). en was empty. Duplicated zh items get identical en.

### formula.yu_nu_jian · actions
- damaged_zh 1 條
- note: zh duplicates 19 sentences of the pattern_indications prose, stored twice (19 leading-colon items + 19 plain duplicates = 38). Not action phrases. en was empty. Duplicated zh items get identical en; field needs curation.

### formula.da_bu_yin_wan · pattern_indications
- orphan_en 4 條
- note: The four existing en name organ-specific variants plus an atrophy indication not in zh; all preserved in orphan_en.

### formula.da_qing_long_tang · pattern_indications
- orphan_en 4 條
- note: First existing en is closest but drops 水飲內停 and 煩躁; all four preserved in orphan_en ("Yi Yin" corresponds to the 溢飲 indication zh does not list).

### formula.ge_gen_huang_qin_huang_lian_tang · pattern_indications
- orphan_en 3 條
- note: None of the three existing en maps 1:1 (the first also carries a stray "(c)." artifact); all preserved in orphan_en.

### formula.gui_zhi_shao_yao_zhi_mu_tang · pattern_indications
- orphan_en 3 條
- note: The three existing en overlap but none maps 1:1 (歷節 head-word missing); all preserved in orphan_en.

### formula.ling_jiao_gou_teng_yin · pattern_indications
- damaged_zh 1 條
- note: zh is a placeholder heading, not an actual pattern; en was empty. Record 羚角鉤藤丸 also looks like a duplicate of formula.ling_jiao_gou_teng_tang (羚角鉤藤湯) — flag for dedupe review.

### formula.xiao_ji_yin_zi · pattern_indications
- orphan_en 3 條
- note: "Blood Lin" corresponds loosely to part of zh 0; none of the three existing en maps 1:1; all preserved in orphan_en.

### formula.zeng_ye_tang · pattern_indications
- orphan_en 3 條
- note: "Constipation due to Yin Deficiency" is closest to zh 1 but drops 腸燥; all three preserved in orphan_en.

### formula.wei_jing_tang · pattern_indications
- orphan_en 5 條
- note: The five existing en include one long item merging both zh clauses plus unrelated indications (eye disorders, recuperation); all preserved in orphan_en.

### formula.dang_gui_nian_tong_tang · pattern_indications
- orphan_en 3 條
- note: "Damp-Heat with External Wind Invasion" is closest to zh 0 but drops 肢節煩痛; all three preserved in orphan_en.

