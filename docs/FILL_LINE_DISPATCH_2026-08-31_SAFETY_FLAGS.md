# FILL LINE 派工單 — 2026-08-31:safety_flags 受控詞彙收斂

**派給**:Sonnet 5
**檔案**:`data/config/safety_flag_vocabulary.json`(新增 slug)+
`data/herbs/herb_canon_shortlist.json`、`data/herbs/formulas.json`(改用受控 slug)
**分支**:`sonnet/safety-flag-vocab`
**不會撞**:另一條線正在改 `curriculum` 引用路徑,不碰這三個檔。

---

## 為什麼有這張單(先讀完再動手)

`safety_flags` 是安全層的**結構化索引** —— 它存在的目的不是印在卡上
(卡上的安全內容由 `contraindications_zh` / `cautions_zh` 負責,那一區
渲染得很好,不用你管),而是讓人可以**問問題**:

> 「哪些藥有馬兜鈴酸風險?」「哪些藥孕婦禁用?」「哪些藥在十八反名單裡?」

現在問不出正確答案。實測(2026-08-31):

```
結構化查 aristolochic 旗標 → 命中 4 張:防己、木通、漢防己、川木通
青木香在不在結果裡?⛔ 不在
```

**全庫馬兜鈴酸最嚴重、而且剛被 Ting 裁定撤下的那張卡,查不到。**
因為它的 `safety_flags` 是一句自由中文,不是 slug:

```json
"safety_flags": ["禁用：馬兜鈴科，含馬兜鈴酸(腎毒性/致癌)，中國藥典2005年版起取消收載"]
```

全庫盤點:**915 次使用,414 次(45%)不在 47 個受控詞彙裡**,涉及 281 個不同的值。
而且看得出碎裂 —— `pregnancy_contraindication`(10 次)與
`pregnancy_contraindicated`(8 次)是同一個概念的兩種拼法;
`toxic`(4)與 `very_toxic`(3)也是。這跟 2026-08-19 檢測報告寫過的
「review_status 碎裂成 16 種值」是同一種病,那次的解法是建受控詞彙 + 鎖,
這次要做的是**把已經碎掉的收回來**。

---

## 紅線

1. **不准發明新的臨床宣稱**。這張單是把**既有的**旗標值歸位,不是替某味藥
   新增安全判斷。看到 `hypertension_contraindication`,你要決定的是
   「它該對應到已登記的哪個 slug、或該不該登記成新 slug」,
   **不是**「這味藥是不是真的高血壓禁用」。
2. **不准刪內容**。四筆自由文字(見下)搬出 `safety_flags` 之前,原陣列先進
   `import_artifacts`(`{original_field, text, reason, moved_at, ruling}`)。
3. **拿不定就列待裁,不要猜**。281 個值裡一定有你判斷不了的
   (例如 `contraindication` vs `caution` 的強度差別涉及臨床判斷)。
   留在原狀 + 列進回報,比硬歸位安全。
4. **不動渲染器、不動 CI、不動驗證器**。

---

## 做法

### 第一步:分三類,先出分類表再改資料

把 281 個未登記的值分成三堆,**先把分類表貼給我看過再開始改**:

- **A 同義重複**:與已登記 slug 是同一個概念,只是拼法不同
  (`pregnancy_contraindicated` → 已有 `pregnancy_caution` 嗎?還是該新增?)
  → 改指到已登記的那個。
- **B 該登記的新概念**:確實是詞彙表缺的概念,而且用了不只一次
  (`aristolochic_acid_risk` 4 次、`species_confusion` 系列、
  `eighteen_incompatibilities_*` 系列)→ 補進 `safety_flag_vocabulary.json`,
  每個都要有 `id` / `name_zh` / `name_en`,格式照現有 47 個。
- **C 待裁**:一次性的、語意不明的、或強度判斷涉及臨床的 → 原狀不動,列清單。

### 第二步:四筆自由文字歸位(這四筆是硬性的)

```
罌粟殼   管制藥品：含嗎啡類生物鹼
穿山甲   禁用：CITES 附錄一保護動物，2020年版中國藥典除名
硝石     有毒：內服須嚴格控制
青木香   禁用：馬兜鈴科，含馬兜鈴酸(腎毒性/致癌)，中國藥典2005年版起取消收載
```

`safety_flags` 是 slug 陣列,一句話放在裡面等於這張卡在所有結構化查詢中隱形。
做法:**句子搬進該卡的散文安全欄位**(`cautions_zh`,或青木香已有的
`deprecated_note_zh` 已含同樣內容則不必重複),**旗標位置改放對應的 slug**。
青木香至少要有 `kidney_disease_review` 與(第一步 B 類補上的)馬兜鈴酸 slug ——
補完之後上面那個查詢必須查得到它,那就是驗收條件。

---

## 驗收

```bash
node scripts/build-data.js
node scripts/validate-herb-standard.js
node scripts/validate-content-junk.js
node scripts/check-validation-ratchet.js      # 任何一條都不准變多
node scripts/validate-retired-id-references.js
```

加跑這一行(自己寫個小腳本即可),它是這張單的成敗:

```
查 aristolochic 相關 slug → 青木香必須在結果裡
未登記值:414 → ?(降到多少報多少)
```

回報逐項列數字,**禁用「完成」「100%」**:
- A 同義重複收斂 __ 個值 / __ 次使用
- B 新登記 slug __ 個(逐個列出 id + 中英文名)
- C 待裁 __ 個(逐個列出,說明為什麼判斷不了)
- 四筆自由文字:各自搬到哪、旗標改成什麼
- 未登記值 414 → __
- 青木香在馬兜鈴酸查詢結果裡:是/否
- 沒有任何欄位變短或被清空(附自己的 diff 統計)

推 `sonnet/safety-flag-vocab`,**不要直接推 main**。

---

## 已登記的 47 個受控 slug

- `pregnancy_review` — 孕期審慎 Pregnancy caution
- `pregnancy_caution` — 孕期禁慎 Pregnancy caution
- `lactation_review` — 哺乳期審慎 Lactation caution
- `fertility_medication_review` — 併用助孕藥物審核 Check with fertility medication
- `medication_review` — 藥物交互作用審核 Medication interaction review
- `anticoagulant_review` — 併用抗凝血劑審慎 Anticoagulant interaction
- `sedative_medication_review` — 併用鎮靜藥物審慎 Sedative interaction
- `stimulant_medication_review` — 併用興奮劑審慎 Stimulant interaction
- `incompatibility_review` — 配伍禁忌審核（十八反十九畏） Combining incompatibility (18/19 rules)
- `toxicity_review` — 毒性審慎 Toxicity caution
- `dose_preparation_review` — 劑量與炮製審核 Dose and processing review
- `heavy_metal_quality_review` — 重金屬與品質審核 Heavy metal / quality review
- `not_for_self_treatment` — 不宜自行使用 Not for self-treatment
- `cardiac_review` — 心臟病審慎 Cardiac caution
- `hypertension_review` — 高血壓審慎 Hypertension caution
- `liver_disease_review` — 肝病審慎 Liver disease caution
- `kidney_disease_review` — 腎病審慎 Kidney disease caution
- `blood_sugar_review` — 血糖影響審慎 Blood sugar caution
- `autoimmune_review` — 自體免疫審慎 Autoimmune caution
- `gallbladder_review` — 膽道疾病審慎 Gallbladder disease caution
- `psychiatric_red_flags` — 精神科警示徵象 Psychiatric red flags
- `neurologic_red_flags` — 神經科警示徵象 Neurological red flags
- `respiratory_red_flags` — 呼吸系統警示徵象 Respiratory red flags
- `gi_red_flags` — 腸胃警示徵象 GI red flags
- `chest_pain_red_flag` — 胸痛警示 Chest pain red flag
- `urgent_red_flag_review` — 緊急警示審核 Urgent red flag review
- `active_bleeding_medical_review` — 活動性出血就醫審核 Active bleeding — seek care
- `bleeding_review` — 出血傾向審慎 Bleeding tendency caution
- `allergy_review` — 過敏審慎 Allergy caution
- `infection_review` — 感染審慎 Infection caution
- `febrile_illness` — 發熱性疾病審慎 Febrile illness caution
- `dehydration_review` — 脫水審慎 Dehydration caution
- `dehydration_electrolyte_review` — 脫水與電解質審慎 Dehydration / electrolyte caution
- `edema_review` — 水腫審慎 Edema caution
- `insomnia_review` — 失眠審慎 Insomnia caution
- `skin_irritation_review` — 皮膚刺激審慎 Skin irritation caution
- `gluten_review` — 麩質審慎 Gluten caution
- `prolapse_context_review` — 臟器下垂情境審核 Prolapse context review
- `digestive_tolerance_review` — 消化耐受性審核 Digestive tolerance review
- `cloying_digestive_effect` — 滋膩礙胃 Cloying — may burden digestion
- `cold_digestive_weakness` — 脾胃虛寒審慎 Cold/weak digestion caution
- `cold_deficiency_review` — 虛寒證審慎 Deficiency-cold caution
- `heat_sign_review` — 熱象審慎 Heat-sign caution
- `heat_signs` — 熱象 Heat signs
- `dryness_review` — 燥象審慎 Dryness caution
- `phlegm_pattern_review` — 痰證審核 Phlegm-pattern review
- `sweating` — 汗證審慎 Sweating caution

## 未登記的值(281 個,共 414 次使用)

| 次數 | 值 | 出現在 |
|---:|---|---|
| 22 | `safety_review_pending` | 中藥:石榴皮、中藥:天葵子、中藥:化橘紅、中藥:糯稻根 |
| 10 | `pregnancy_contraindication` | 中藥:硫黃、中藥:川木通、中藥:胡椒、中藥:路路通 |
| 9 | `yin_deficiency_heat_contraindication` | 中藥:白朮、中藥:硫黃、中藥:蓽茇、中藥:狗脊 |
| 8 | `pregnancy_contraindicated` | 中藥:巴豆、中藥:制川烏、中藥:制草烏、中藥:牛黃 |
| 5 | `excess_heat_contraindication` | 中藥:人參、中藥:大棗、中藥:蓽茇、中藥:檀香 |
| 5 | `anticoagulant_interaction` | 中藥:白朮、中藥:白芍、中藥:靈芝、中藥:青黛 |
| 5 | `diuretic_interaction` | 中藥:白朮、中藥:牛蒡子、中藥:白蒺藜、中藥:漢防己 |
| 5 | `spleen_stomach_cold_contraindication` | 中藥:南沙參、中藥:昆布、中藥:綠豆、中藥:秦皮 |
| 5 | `pregnancy_lactation_caution` | 中藥:沉香、中藥:椿皮、中藥:靈芝、中藥:秦皮 |
| 4 | `toxic` | 中藥:巴豆、中藥:制川烏、中藥:制草烏、中藥:蜈蚣 |
| 4 | `anticoagulant_antiplatelet_interaction` | 中藥:白花蛇、中藥:核桃仁、中藥:土鱉蟲、中藥:野菊花 |
| 4 | `yin_deficiency_heat_caution` | 中藥:沉香、中藥:覆盆子、中藥:骨碎補、中藥:路路通 |
| 4 | `not_a_canonical_materia_medica_entry` | 中藥:白酒、中藥:黃酒、中藥:金箔、中藥:銀箔 |
| 3 | `herb_drug_interaction_review` | 中藥:桂枝、中藥:生薑、中藥:蒲公英 |
| 3 | `sedative_interaction` | 中藥:蟬蛻、中藥:白芍、中藥:牛黃 |
| 3 | `eighteen_incompatibilities_li_lu` | 中藥:人參、中藥:白芍、中藥:南沙參 |
| 3 | `very_toxic` | 中藥:巴豆、中藥:制川烏、中藥:制草烏 |
| 3 | `special_preparation_required` | 中藥:巴豆、中藥:制川烏、中藥:制草烏 |
| 3 | `pediatric_caution` | 中藥:牛黃、中藥:蜈蚣、中藥:地膚子 |
| 3 | `deficiency_cold_caution` | 中藥:水牛角、中藥:冬瓜子、中藥:冬葵子 |
| 3 | `yin_deficiency_fire_contraindication` | 中藥:萆薢、中藥:金櫻子、中藥:海風藤 |
| 3 | `spleen_stomach_deficiency_cold_contraindication` | 中藥:椿皮、中藥:栝樓皮、中藥:海藻 |
| 3 | `spleen_stomach_cold_caution` | 中藥:蓮子心、中藥:藕節、中藥:野菊花 |
| 3 | `obsolete_substance` | 中藥:犀角、中藥:金箔、中藥:銀箔 |
| 2 | `pregnancy_priority_review` | 中藥:桂枝、中藥:紫蘇葉 |
| 2 | `pregnancy_source_conflict` | 中藥:荊芥、中藥:防風 |
| 2 | `yin_deficiency_heat_contraindicated` | 中藥:薄荷、中藥:仙茅 |
| 2 | `lactation_contraindicated` | 中藥:薄荷、中藥:巴豆 |
| 2 | `species_confusion` | 中藥:防己、中藥:漢防己 |
| 2 | `aristolochic_acid_risk` | 中藥:防己、中藥:漢防己 |
| 2 | `species_confusion_aristolochic_acid_risk` | 中藥:木通、中藥:川木通 |
| 2 | `antidiabetic_interaction` | 中藥:人參、中藥:白芍 |
| 2 | `qi_stagnation_contraindication` | 中藥:白朮、中藥:大棗 |
| 2 | `hypertension_caution` | 中藥:甘草、中藥:秦皮 |
| 2 | `exterior_cough_contraindication` | 中藥:南沙參、中藥:蛤蚧 |
| 2 | `kidney_disease_caution` | 中藥:浮萍、中藥:白花蛇舌草 |
| 2 | `max_dose_review` | 中藥:巴豆、中藥:蜈蚣 |
| 2 | `topical_caution` | 中藥:巴豆、中藥:蜈蚣 |
| 2 | `cardiotoxicity` | 中藥:制川烏、中藥:制草烏 |
| 2 | `neurotoxicity` | 中藥:制川烏、中藥:制草烏 |
| 2 | `arrhythmia_risk` | 中藥:制川烏、中藥:制草烏 |
| 2 | `herb_drug_interaction` | 中藥:制川烏、中藥:制草烏 |
| 2 | `predecoction_required` | 中藥:制川烏、中藥:水牛角 |
| 2 | `exterior_pathogen_contraindication` | 中藥:麻黃根、中藥:白果 |
| 2 | `professional_supervision_required` | 中藥:仙茅、方劑:安宮牛黃丸 |
| 2 | `spleen_stomach_deficiency_cold_caution` | 中藥:白花蛇舌草、中藥:槐米 |
| 2 | `allergy_caution` | 中藥:白鮮皮、中藥:赤小豆 |
| 2 | `pregnancy_contraindication_cloudtcm` | 中藥:白前、中藥:海螵蛸 |
| 2 | `overdose_caution` | 中藥:地膚子、中藥:冬葵子 |
| 2 | `diabetes_caution` | 中藥:冬葵子、中藥:蜂蜜 |
| 2 | `cold_phlegm_contraindication` | 中藥:栝樓皮、中藥:栝樓仁 |
| 2 | `wu_tou_incompatibility` | 中藥:栝樓皮、中藥:栝樓仁 |
| 2 | `constipation_long_use_caution` | 中藥:海螵蛸、中藥:金櫻子 |
| 2 | `diabetes_drug_interaction_review` | 中藥:海桐皮、中藥:槐米 |
| 2 | `diarrhea_contraindication` | 中藥:核桃仁、中藥:龜板膠 |
| 2 | `menstruation_caution` | 中藥:綠豆、中藥:藕節 |
| 2 | `heavy_metal_review` | 中藥:雄黃、中藥:硃砂 |
| 2 | `alcohol_containing` | 中藥:白酒、中藥:黃酒 |
| 1 | `bleeding_priority_review` | 中藥:桂枝 |
| 1 | `source_access_review` | 中藥:紫蘇葉 |
| 1 | `heat_pattern_contraindication` | 中藥:生薑 |
| 1 | `contraindication_source_conflict` | 中藥:荊芥 |
| 1 | `herb_incompatibility_review` | 中藥:防風 |
| 1 | `exterior_deficiency_contraindicated` | 中藥:薄荷 |
| 1 | `liver_yang_rising_contraindicated` | 中藥:薄荷 |
| 1 | `pediatric_essential_oil_inhalation_avoid` | 中藥:薄荷 |
| 1 | `hiatal_hernia_contraindicated` | 中藥:薄荷 |
| 1 | `late_decoction_required` | 中藥:薄荷 |
| 1 | `exterior_deficiency_caution` | 中藥:蟬蛻 |
| 1 | `qi_yin_deficiency_caution` | 中藥:蟬蛻 |
| 1 | `caffeine_interaction` | 中藥:蟬蛻 |
| 1 | `pediatric_dose_review` | 中藥:蟬蛻 |
| 1 | `insect_allergy_review` | 中藥:蟬蛻 |
| 1 | `cold_lung_caution` | 中藥:桑葉 |
| 1 | `qi_deficiency_caution` | 中藥:桑葉 |
| 1 | `max_dose_30g_ad` | 中藥:桑葉 |
| 1 | `no_ad_drug_interactions_listed` | 中藥:桑葉 |
| 1 | `yin_deficiency_dry_cough_contraindication` | 中藥:陳皮 |
| 1 | `stomach_fire_contraindication` | 中藥:陳皮 |
| 1 | `excess_heat_caution` | 中藥:陳皮 |
| 1 | `fluid_deficiency_caution` | 中藥:陳皮 |
| 1 | `nineteen_antagonisms_wu_ling_zhi` | 中藥:人參 |
| 1 | `antagonism_lai_fu_zi` | 中藥:人參 |
| 1 | `hypertension_contraindication` | 中藥:人參 |
| 1 | `maoi_interaction` | 中藥:人參 |
| 1 | `antiplatelet_interaction` | 中藥:白朮 |
| 1 | `eighteen_incompatibilities_gan_sui_da_ji_yuan_hua_hai_zao` | 中藥:甘草 |
| 1 | `edema_caution` | 中藥:甘草 |
| 1 | `pseudoaldosteronism_long_term` | 中藥:甘草 |
| 1 | `corticosteroid_interaction` | 中藥:甘草 |
| 1 | `digoxin_interaction` | 中藥:甘草 |
| 1 | `damp_heat_contraindication` | 中藥:大棗 |
| 1 | `phlegm_heat_contraindication` | 中藥:大棗 |
| 1 | `parasites_contraindication` | 中藥:大棗 |
| 1 | `antagonism_shi_hu` | 中藥:白芍 |
| 1 | `yang_deficiency_cold_contraindication` | 中藥:白芍 |
| 1 | `drowsiness_caution` | 中藥:白芍 |
| 1 | `pregnancy_contraindication_source_disagreement` | 中藥:牛蒡子 |
| 1 | `diarrhea_qi_deficiency` | 中藥:牛蒡子 |
| 1 | `hypoglycemic_drug_interaction` | 中藥:牛蒡子 |
| 1 | `strong_diaphoretic` | 中藥:浮萍 |
| 1 | `deficiency_sweating_contraindication` | 中藥:浮萍 |
| 1 | `overdose_toxicity_caution` | 中藥:浮萍 |
| 1 | `qi_blood_deficiency_caution` | 中藥:白蒺藜 |
| 1 | `minor_toxicity_source_difference` | 中藥:白蒺藜 |
| 1 | `herb_interaction_review` | 中藥:巴豆 |
| 1 | `topical_only_raw` | 中藥:制川烏 |
| 1 | `topical_preferred` | 中藥:制草烏 |
| 1 | `pattern_specific` | 中藥:牛黃 |
| 1 | `source_difference_review` | 中藥:牛黃 |
| 1 | `allergy_contraindicated` | 中藥:水牛角 |
| 1 | `endangered_species_substitute` | 中藥:水牛角 |
| 1 | `liver_function_risk` | 中藥:蜈蚣 |
| 1 | `pregnancy_parturition_blood_deficiency_caution` | 中藥:漢防己 |
| 1 | `pregnancy_lactation_pediatric_caution_cloudtcm` | 中藥:麻黃根 |
| 1 | `differentiate_from_ma_huang` | 中藥:麻黃根 |
| 1 | `spleen_stomach_deficiency_cold_diarrhea` | 中藥:決明子 |
| 1 | `hypotension` | 中藥:決明子 |
| 1 | `huo_ma_ren_incompatibility_ad` | 中藥:決明子 |
| 1 | `pediatric_under_one_caution` | 中藥:木賊 |
| 1 | `depleted_fluids_caution` | 中藥:木賊 |
| 1 | `urinary_frequency_caution` | 中藥:木賊 |
| 1 | `avoid_prolonged_use` | 中藥:木賊 |
| 1 | `toxic_animal_substance` | 中藥:白花蛇 |
| 1 | `pregnancy_contraindication_high_risk` | 中藥:白花蛇 |
| 1 | `iron_incompatibility` | 中藥:白花蛇 |
| 1 | `avoid_unsupervised_medicinal_wine` | 中藥:白花蛇 |
| 1 | `toxic_mineral` | 中藥:硫黃 |
| 1 | `internal_use_caution` | 中藥:硫黃 |
| 1 | `topical_absorption_overdose_risk` | 中藥:硫黃 |
| 1 | `toxic_herb` | 中藥:仙茅 |
| 1 | `excess_heat_contraindicated` | 中藥:仙茅 |
| 1 | `avoid_long_term_use` | 中藥:仙茅 |
| 1 | `lactation_caution` | 中藥:白花蛇舌草 |
| 1 | `high_dose_professional_supervision` | 中藥:白花蛇舌草 |
| 1 | `deficiency_cold_contraindicated` | 中藥:白鮮皮 |
| 1 | `spleen_deficiency_loose_stool_contraindicated` | 中藥:白鮮皮 |
| 1 | `liver_disease_caution` | 中藥:白鮮皮 |
| 1 | `drug_interaction_microtubule_inhibitors` | 中藥:白鮮皮 |
| 1 | `slightly_toxic` | 中藥:白果 |
| 1 | `excess_pattern_contraindication` | 中藥:白果 |
| 1 | `pregnancy_review_priority` | 中藥:白果 |
| 1 | `legacy_alias_record_exists` | 中藥:白果 |
| 1 | `qi_deficiency_cough_contraindication_cloudtcm` | 中藥:白前 |
| 1 | `antihypertensive_caution_cloudtcm` | 中藥:白前 |
| 1 | `american_dragon_not_verified` | 中藥:白前 |
| 1 | `high_dose_cancer_use_review` | 中藥:半枝蓮 |
| 1 | `blood_glucose_drug_caution` | 中藥:半枝蓮 |
| 1 | `blood_pressure_drug_caution` | 中藥:半枝蓮 |
| 1 | `hot_acrid` | 中藥:蓽茇 |
| 1 | `slightly_toxic_cloudtcm` | 中藥:蓽茇 |
| 1 | `topical_use_separate` | 中藥:蓽茇 |
| 1 | `no_dampness_lower_jiao_contraindication` | 中藥:萆薢 |
| 1 | `kidney_yin_deficiency_low_back_pain_contraindication` | 中藥:萆薢 |
| 1 | `liver_injury_high_dose_caution` | 中藥:萆薢 |
| 1 | `heart_channel_excess_contraindication` | 中藥:沉香 |
| 1 | `volatile_late_add_powder_note` | 中藥:沉香 |
| 1 | `pregnancy_overdose_miscarriage_caution` | 中藥:赤小豆 |
| 1 | `dryness_long_term_caution` | 中藥:赤小豆 |
| 1 | `kidney_toxicity_review` | 中藥:川木通 |
| 1 | `yin_fluid_injury_caution` | 中藥:川木通 |
| 1 | `astringent_pathogen_trapping_caution` | 中藥:椿皮 |
| 1 | `toxicity_high_dose_review` | 中藥:椿皮 |
| 1 | `internal_heat_contraindication` | 中藥:刺五加 |
| 1 | `yin_deficiency_contraindication` | 中藥:刺五加 |
| 1 | `interaction_review_pending` | 中藥:刺五加 |
| 1 | `adaptogen_safety_review` | 中藥:刺五加 |
| 1 | `incompatibility_hai_piao_xiao` | 中藥:地膚子 |
| 1 | `exterior_condition_caution` | 中藥:冬蟲夏草 |
| 1 | `pregnancy_lactation_pediatric_caution` | 中藥:冬蟲夏草 |
| 1 | `anticoagulant_caution` | 中藥:冬蟲夏草 |
| 1 | `source_quality_caution` | 中藥:冬蟲夏草 |
| 1 | `food_therapy_dose_separate` | 中藥:冬瓜子 |
| 1 | `infant_contraindication` | 中藥:蜂蜜 |
| 1 | `damp_phlegm_contraindication` | 中藥:蜂蜜 |
| 1 | `do_not_decoct` | 中藥:蜂蜜 |
| 1 | `damp_heat_urination_contraindication` | 中藥:覆盆子 |
| 1 | `kidney_disease_food_caution` | 中藥:覆盆子 |
| 1 | `excess_heat_cough_contraindication` | 中藥:蛤蚧 |
| 1 | `animal_source_quality_review` | 中藥:蛤蚧 |
| 1 | `source_discrepancy_review` | 中藥:蛤蚧 |
| 1 | `heat_dysuria_contraindication` | 中藥:狗脊 |
| 1 | `bai_jiang_cao_incompatibility` | 中藥:狗脊 |
| 1 | `renal_insufficiency_caution` | 中藥:骨碎補 |
| 1 | `thrombocytopenia_caution` | 中藥:骨碎補 |
| 1 | `blood_deficiency_contraindication` | 中藥:骨碎補 |
| 1 | `lactation_avoidance` | 中藥:谷芽 |
| 1 | `long_term_use_review` | 中藥:谷芽 |
| 1 | `cloudtcm_exact_page_missing` | 中藥:谷芽 |
| 1 | `loose_stool_contraindication` | 中藥:栝樓仁 |
| 1 | `overdose_diarrhea_caution` | 中藥:栝樓仁 |
| 1 | `deficiency_heat_contraindication` | 中藥:海螵蛸 |
| 1 | `blood_heat_contraindication` | 中藥:海螵蛸 |
| 1 | `kidney_function_contraindication_cloudtcm` | 中藥:海螵蛸 |
| 1 | `fu_zi_bai_ji_incompatibility_review` | 中藥:海螵蛸 |
| 1 | `blood_deficiency_contraindication_ad` | 中藥:海桐皮 |
| 1 | `accumulated_fire_contraindication_ad` | 中藥:海桐皮 |
| 1 | `lipid_drug_interaction_review` | 中藥:海桐皮 |
| 1 | `external_use_caution` | 中藥:海桐皮 |
| 1 | `gan_cao_incompatibility` | 中藥:海藻 |
| 1 | `thyroid_iodine_review` | 中藥:海藻 |
| 1 | `cold_bitter_long_use_caution` | 中藥:海藻 |
| 1 | `phlegm_fire_contraindication` | 中藥:核桃仁 |
| 1 | `hot_cough_contraindication` | 中藥:核桃仁 |
| 1 | `bleeding_disorder_contraindication` | 中藥:胡椒 |
| 1 | `hemorrhoid_contraindication` | 中藥:胡椒 |
| 1 | `mouth_eye_throat_heat_contraindication` | 中藥:胡椒 |
| 1 | `yin_deficiency_blood_heat_contraindication` | 中藥:槐米 |
| 1 | `non_excess_heat_contraindication` | 中藥:槐米 |
| 1 | `antihypertensive_interaction_review` | 中藥:槐米 |
| 1 | `excess_pathogen_heat_contraindication` | 中藥:金櫻子 |
| 1 | `heat_diarrhea_contraindication` | 中藥:金櫻子 |
| 1 | `pregnancy_postpartum_caution` | 中藥:金櫻子 |
| 1 | `opioid_interaction_cloudtcm` | 中藥:金櫻子 |
| 1 | `carbohydrate_glucose_caution` | 中藥:粳米 |
| 1 | `food_medicinal_context` | 中藥:粳米 |
| 1 | `no_strict_contraindication_found` | 中藥:粳米 |
| 1 | `hyperthyroidism_caution` | 中藥:昆布 |
| 1 | `antidiabetic_drug_interaction` | 中藥:昆布 |
| 1 | `constipation_contraindication` | 中藥:蓮鬚 |
| 1 | `difficult_urination_contraindication` | 中藥:蓮鬚 |
| 1 | `liver_yang_rising_contraindication` | 中藥:蓮鬚 |
| 1 | `no_heat_pattern_contraindication` | 中藥:蓮子心 |
| 1 | `antihypertensive_drug_interaction` | 中藥:蓮子心 |
| 1 | `excess_pattern_caution` | 中藥:靈芝 |
| 1 | `herb_incompatibility_chang_shan_yin_chen_hao` | 中藥:靈芝 |
| 1 | `no_heat_pattern_caution` | 中藥:綠豆 |
| 1 | `heavy_menstruation_contraindication` | 中藥:路路通 |
| 1 | `palpitation_caution` | 中藥:路路通 |
| 1 | `herb_incompatibility_wu_zhu_yu` | 中藥:秦皮 |
| 1 | `yin_deficiency_no_heat_toxicity_contraindication` | 中藥:青黛 |
| 1 | `spleen_stomach_weak_caution` | 中藥:桑枝 |
| 1 | `antihypertensive_hypoglycemic_interaction` | 中藥:桑枝 |
| 1 | `damp_heat_lower_jiao_contraindication` | 中藥:蛇床子 |
| 1 | `toxic_herb_internal_use_caution` | 中藥:蛇床子 |
| 1 | `herb_incompatibility_mu_dan_pi_ba_dou_bei_mu` | 中藥:蛇床子 |
| 1 | `yin_deficiency_no_damp_heat_contraindication` | 中藥:石韋 |
| 1 | `renal_impairment_contraindication` | 中藥:石韋 |
| 1 | `pregnancy_pediatric_elderly_caution` | 中藥:石韋 |
| 1 | `spleen_deficiency_loose_stool_caution` | 中藥:絲瓜絡 |
| 1 | `pediatric_diarrhea_caution` | 中藥:絲瓜絡 |
| 1 | `spleen_deficiency_diarrhea_contraindication` | 中藥:鎖陽 |
| 1 | `excess_heat_constipation_contraindication` | 中藥:鎖陽 |
| 1 | `no_blood_stasis_contraindication` | 中藥:土鱉蟲 |
| 1 | `toxic_herb_caution` | 中藥:土鱉蟲 |
| 1 | `liver_kidney_yin_deficiency_contraindication` | 中藥:土茯苓 |
| 1 | `tea_interaction_caution` | 中藥:土茯苓 |
| 1 | `yin_blood_deficiency_contraindication` | 中藥:豨薟草 |
| 1 | `overdose_vomiting_caution` | 中藥:豨薟草 |
| 1 | `pregnancy_pediatric_caution` | 中藥:豨薟草 |
| 1 | `stomach_qi_injury_caution` | 中藥:野菊花 |
| 1 | `ruptured_abscess_contraindication` | 中藥:皂角刺 |
| 1 | `drug_absorption_interaction` | 中藥:皂角刺 |
| 1 | `no_excess_heat_contraindication` | 中藥:珍珠 |
| 1 | `powder_form_only` | 中藥:珍珠 |
| 1 | `incompatibilities_review` | 中藥:炙甘草 |
| 1 | `food_derived_substance` | 中藥:雞子黃 |
| 1 | `animal_derived_substance` | 中藥:豬脊髓 |
| 1 | `historical_ingredient` | 中藥:豬脊髓 |
| 1 | `source_conflict_unresolved` | 中藥:小麥 |
| 1 | `easily_confused_with_dan_zhu_ye` | 中藥:竹葉 |
| 1 | `prohibited_endangered_species` | 中藥:犀角 |
| 1 | `ncbahm_appendix_d` | 中藥:犀角 |
| 1 | `substitute_with_shui_niu_jiao` | 中藥:犀角 |
| 1 | `easily_confused_with_huang_lian` | 中藥:胡黃連 |
| 1 | `cold_damp_contraindication` | 中藥:龜板膠 |
| 1 | `管制藥品：含嗎啡類生物鹼` | 中藥:罌粟殼 |
| 1 | `easily_confused_with_zhen_zhu` | 中藥:珍珠母 |
| 1 | `easily_confused_with_long_gu` | 中藥:龍齒 |
| 1 | `dose_source_conflict` | 中藥:安息香 |
| 1 | `禁用：CITES 附錄一保護動物，2020年版中國藥典除名` | 中藥:穿山甲 |
| 1 | `substitute_substance` | 中藥:山羊角 |
| 1 | `有毒：內服須嚴格控制` | 中藥:硝石 |
| 1 | `禁用：馬兜鈴科，含馬兜鈴酸(腎毒性/致癌)，中國藥典2005年版起取消收載` | 中藥:青木香 |
| 1 | `heat_bi_contraindication` | 中藥:海風藤 |
| 1 | `damp_heat_dysentery_contraindication` | 中藥:禹餘糧 |
| 1 | `drug_adsorption_interaction` | 中藥:禹餘糧 |
| 1 | `toxic_mineral_review` | 方劑:安宮牛黃丸 |
| 1 | `realgar_arsenic_review` | 方劑:安宮牛黃丸 |
| 1 | `cinnabar_mercury_review` | 方劑:安宮牛黃丸 |
| 1 | `emergency_formula` | 方劑:安宮牛黃丸 |
