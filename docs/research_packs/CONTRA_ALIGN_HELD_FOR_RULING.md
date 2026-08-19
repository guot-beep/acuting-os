# contraindications 中英對齊 — 20 方待裁決

乾淨的 34 方已落庫(2026-08-19)。以下每方至少有一個要裁的點:
- **orphan_en**:英文側有、中文側沒有的既有內容。套用對齊 = 這些從欄位消失(內容仍留在本包)。
  裁法:(a) 內容該保留 → 把對應中文補進 contraindications_zh(先搬再改),重出提案;(b) 內容錯置/過時 → 准套用。
- **damaged_zh**:中文條目損毀(亂碼/衍字),附推定讀法暫譯。裁法:確認推定讀法後修 zh 原文,再套用。

帳本(全文含 en_proposed):docs/research_packs/CONTRA_ALIGN_PROPOSALS_2026-08-19.json

---

## formula.xiao_qing_long_tang

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with dry mouth and throat with thick, yellow sputum.

note: en[4] ("dry mouth and throat with thick, yellow sputum") does not faithfully render zh[4] (肺熱咳喘、吐黃稠痰) — moved to orphan_en for ruling; zh[4] retranslated. en[6] replaced: original omitted 嚴重心臟病.

## formula.yin_qiao_san

**orphan_en(1 條,套用後將從欄位消失):**
- This formula must be significantly modified to treat Damp-Heat.

note: en[1] ("Contraindicated for Wind-Cold.") subsumed by fuller translation of zh[0]. en[0] (modify for Damp-Heat) has no zh counterpart — orphaned.

## formula.bai_hu_tang

**orphan_en(1 條,套用後將從欄位消失):**
- Use caution with a floating, wiry, thin pulse.

note: en[3..6] (four separate cautions) correspond to the single zh[1] 白虎四禁 entry — consolidated into one translation; en[4..6] content fully covered. en[3] orphaned because its "wiry" is absent from zh[1] (脈浮細). en[1] expanded with 陰盛格陽; en[2] expanded with 腑實. zh grades these 禁用 while old en said "use caution" — corrected to Contraindicated per zh.

## formula.zhu_ye_shi_gao_tang

**orphan_en(1 條,套用後將從欄位消失):**
- Febrile disease with chest oppression, dry heaves, and a yellow greasy tongue coat from Damp-Heat.

**damaged_zh:**
- {"index":1,"zh":"熱病開盛邪實，大熱未哀，氣陰未傷者，不宜使用本方。","reason":"疑似訛字:「熱病開盛邪實」疑為「熱病初起邪實」、「大熱未哀」應為「大熱未衰」。已按推定原意提供暫譯,請人工確認原文。"}

note: en[0..2] are fragments of zh[1] — consolidated into one translation (content covered, not orphaned). en[3] attributes the pattern to "Damp-Heat" while zh[2] says 痰濕 (Phlegm-Damp) — attribution mismatch, orphaned; zh[2] retranslated.

## formula.da_chai_hu_tang

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with Spleen and Stomach Deficiencies.

note: en[0] (Spleen and Stomach Deficiencies contraindicated) has no zh counterpart — orphaned.

## formula.dang_gui_si_ni_tang

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with during Spring and Summer or in warm climates.

note: en[2] is a defective duplicate of the seasonal caution ("Contraindicated for those with during Spring and Summer...") and contradicts zh grading (慎用) — orphaned for ruling.

## formula.ba_zhen_tang

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with Heat or Excess conditions.

note: en[0] (Heat or Excess conditions) has no zh counterpart — orphaned.

## formula.yi_guan_jian

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with chest pain due to Phlegm or Phlegm-Damp Retention.

note: en[0] attributes the contraindication to "chest pain", which appears nowhere in zh — orphaned; zh[0..2] translated in full.

## formula.tian_wang_bu_xin_dan

**orphan_en(1 條,套用後將從欄位消失):**
- Review severe depression, suicidality, mania, sedatives, pregnancy, and digestive tolerance

note: en[0] (review severe depression, suicidality, mania, sedatives, pregnancy, digestive tolerance) has no zh counterpart — orphaned.

## formula.huo_xiang_zheng_qi_san

**orphan_en(2 條,套用後將從欄位消失):**
- Contraindicated for Damp-Heat with thirst, dry throat, greasy yellow tongue coat.
- Contraindicated for Yin or Blood Deficiencies.

**damaged_zh:**
- {"index":3,"zh":"但本方藥偏溫燥，故對風寒襲表，濕滯脾胃，以及山嵐瘴氣所導致的病證，甚為合適。若屬於「陽暑」不適合，「陰屬」適合","reason":"「陰屬」疑為「陰暑」之訛,已按「陰暑」推定翻譯,請人工確認。"}

note: en[1] ("Modify for Wind-Heat or Fire due to Deficiency") subsumed by faithful translation of zh[0] (zh grades it 慎用, not modify). en[0] (Damp-Heat with thirst, dry throat, greasy yellow coat) and en[2] (Yin or Blood Deficiencies) have no zh counterpart — orphaned.

## formula.san_ren_tang

**damaged_zh:**
- {"index":1,"zh":"凡治濕病，禁發其汗，而陽鬱者不微汗之，轉致傷人，醫之過也。濕家不可發汗，以身本多汗，易致亡陽，故濕濕之證，誤發其汗，名曰重喝。","reason":"「重喝」疑為「重暍」、「濕濕之證」疑為「濕溫之證」之訛,已按推定原意提供暫譯,請人工確認。"}

note: en[0] was a positive restatement, not a faithful translation of zh[0] — replaced; its content is implied by zh[0], nothing orphaned. zh[1..2] newly translated.

## formula.fang_ji_huang_qi_tang

**orphan_en(3 條,套用後將從欄位消失):**
- Acute Excess type edema.
- Dampness Obstructing the Protective Yang.
- Overdose can cause nausea and anorexia.

note: None of the three existing en entries is a faithful rendering of any single zh entry (en[0] "Acute Excess type edema" reframes zh[0]; en[1] "Dampness Obstructing the Protective Yang" and en[2] "Overdose can cause nausea and anorexia" appear nowhere in zh) — all orphaned for ruling; zh[0..4] translated in full.

## formula.yin_chen_hao_tang

**orphan_en(2 條,套用後將從欄位消失):**
- Contraindicated for Yin jaundice.
- Use Da Huang with extreme caution during pregnancy.

note: en[0] (Yin jaundice) appears nowhere in zh; en[1] singles out Da Huang in pregnancy, which zh does not say (zh[1] is a general pregnancy/debility caution) — both orphaned.

## formula.er_chen_tang

**damaged_zh:**
- {"index":0,"zh":"使用不當會引起口渴 咽燥忌","reason":"句式殘缺(「使用不當會引起口渴 咽燥忌」),按「使用不當會引起口渴咽燥,(此類情況)忌」推定暫譯,請人工確認。"}

note: Existing en[0] maps to zh[1] (肺陰虛咳嗽) and is kept there; zh[0] newly translated with damage flag.

## formula.an_gong_niu_huang_wan

**orphan_en(1 條,套用後將從欄位消失):**
- Do not take Cinnabaris (Zhu Sha) in large doses or heated.

note: en[1] ("Do not take Cinnabaris in large doses or heated") states specifics (large doses, heating) absent from zh[3] — orphaned; zh[3] retranslated.

## formula.huai_hua_san

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with rectal bleeding with symptoms of Q i or Yin Deficiency.

**damaged_zh:**
- {"index":2,"zh":"現多無無此散劑生產，本方漸被槐角丸等一類成藥所代替，臨床時注意選用。","reason":"「現多無無此散劑生產」疑衍一「無」字,已按「現多無此散劑生產」翻譯。"}

note: en[0] replaced (original omitted 藥性寒涼/只宜暫用); en[1] replaced (original omitted 大便下血); en[2] ("rectal bleeding with symptoms of Q i or Yin Deficiency", note the "Q i" typo) has no zh counterpart — orphaned.

## formula.ling_jiao_gou_teng_tang

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with Wind due to Deficiency.

note: en[0] (Wind due to Deficiency) appears nowhere in zh — orphaned. NOTE for reviewer: zh[0..1] are lead-in/indication text rather than contraindications — possible misfiled content; translated faithfully without moving (attribution ruling belongs to a human).

## formula.zuo_jin_wan

**orphan_en(1 條,套用後將從欄位消失):**
- Acid regurgitation due to Stomach Deficiency Cold.

note: en[0] ("Acid regurgitation due to Stomach Deficiency Cold") is a possible loose match to zh[1] but names a different symptom (反酸 vs zh 嘔吐) — orphaned for ruling; zh[1] retranslated. zh[0] newly translated.

## formula.er_zhi_wan

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with for those with weak digestion.

note: en[2] is a corrupted duplicate of en[0] ("Contraindicated for those with for those with weak digestion") and contradicts zh grading (慎用) — orphaned.

## formula.fu_yuan_huo_xue_tang_import_stub

**orphan_en(1 條,套用後將從欄位消失):**
- Contraindicated for those with for those with Spleen Deficiency.

note: en[4] is a corrupted duplicate of en[3] ("Contraindicated ... for those with for those with Spleen Deficiency") and contradicts zh grading (慎用) — orphaned.

