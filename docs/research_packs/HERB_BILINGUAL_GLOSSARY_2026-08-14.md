# 中藥雙語批次翻譯 — 術語鎖定表(2026-08-14)

來源:對 data/herbs/herb_canon_shortlist.json 已成對記錄的全量萃取
(condition_tags 138 對、modern_functions 109 對、cautions/contraindications 787 對句)。
用途:cautions_en / condition_tags_en / modern_functions_en 批次(HB-B1~B10)的**強制對照表**。
批次 agent 遇到表內詞彙必須照表翻;表外新詞按 §1 全域規則造,並在批次報告列出供回填本表。

## 0. 結構性事實(批次設計依據)

- 三條缺口嵌套:mf_gap(159) ⊂ ca_gap(216);ct_gap(141) ∩ ca_gap = 137。聯集 = 220 筆 = 358 − 138。
  → **跑 10 個記錄批,每批一次填三欄**,不跑欄位批。
- ct_gap 裡 110 筆是 schema 放錯(單一四字功效聯,非證候標籤),**不進翻譯批**,等 Ting 裁定處置。
  真正的 condition_tags 翻譯工作 = 31 筆 / 165 標籤,集中在 B1/B2/B6。
- mf_gap 的 1115 條裡 1001 條已存在於既成詞彙表 → 90% 查表,僅 ~114 條新詞。
- 全庫索引對齊零錯位,位置式抽取安全。
- herb validator 無 A11 等價檢查:每批收尾自跑 `/[㐀-鿿]/` 掃填入的 _en,零命中才 commit。
- E5/H5 驗 _en 與 _zh 長度嚴格相等;_en 留空不罰,填了就必須整組對齊。

## 1. condition_tags_en 全域規則

首字母大寫;TCM 實體詞大寫(Yin/Yang/Qi/Blood/Heat/Cold/Damp/Dryness/Phlegm/Fire/Wind/Spirit + 臟腑名);
複合病邪才用連字號(Wind-Cold, Damp-Heat, Wind-Cold-Damp);禁斜線、禁 &、禁括號拼音;
Bi 與 Lin 不翻譯。

### 1a. 漂移統一(既有多譯 → 鎖定)

| zh | 鎖定英譯 |
|---|---|
| 水腫 | Edema |
| 小便不利 | Difficult urination |
| 風濕痹痛 | Wind-Damp Bi pain |
| 皮膚瘙癢/皮膚搔癢 | Skin itching |
| 咽喉腫痛 | Sore swollen throat |
| 目赤腫痛 | Red swollen painful eyes |
| 崩漏 | Flooding and spotting |
| 肝陽上亢 | Liver Yang rising |
| 失眠 | Insomnia |
| 吐血 | Hematemesis |
| 風寒濕痹 | Wind-Cold-Damp Bi |
| 麻疹不透 | Incomplete measles eruption |
| 自汗 | Spontaneous sweating |
| 跌打損傷 | Traumatic injury |
| 腸燥便秘 | Intestinal Dryness constipation |
| 高血壓 | Hypertension |
| 濕疹 | Eczema |
| 衄血 | Epistaxis |
| 陽痿 | Impotence |
| 帶下 | Vaginal discharge |
| 風寒表證 | Wind-Cold exterior pattern |
| 遺精 | Spermatorrhea |
| 滑精 | Seminal emission |
| 乳癰 | Breast abscess |
| 腸癰 | Intestinal abscess |
| 食少便溏 | Poor appetite with loose stools |
| 痰核瘰癧 | Phlegm nodules and scrofula |
| 疥癬 | Scabies and tinea |
| 瘡瘍腫毒 | Sores and toxic swelling |
| 久咳 | Chronic cough |
| 遺尿 | Enuresis |
| 寒痰 | Cold Phlegm |
| 血淋 | Blood Lin |
| 久痢 | Chronic dysentery |
| 腰膝痠軟/腰膝痠痛 | Low-back and knee soreness |
| 便血 | Blood in stool |
| 陰疽 | Yin flat abscess |
| 偏頭痛 | Migraine |
| 月經不調 | Irregular menstruation |
| 濕熱淋證 | Damp-Heat Lin syndrome |
| 噯氣 | Belching |
| 痰多 | Copious sputum |
| 脾胃氣虛 | Spleen-Stomach Qi deficiency |
| 蕁麻疹 | Urticaria |
| 腹水 | Ascites |
| 胸腹冷痛 | Cold chest and abdominal pain |
| 神昏譫語 | Clouded spirit with delirium |
| 中風後遺症 | Post-stroke sequelae |
| 脘腹冷痛 | Cold epigastric and abdominal pain |
| 乳汁不下/乳汁不通 | Insufficient lactation |
| 石淋 | Stone Lin |
| 風寒表實 | Wind-Cold exterior excess |
| 無汗 | Absence of sweating |
| 咳嗽 | Cough |
| 魚蟹中毒 | Fish and crab toxicity |
| 胃寒嘔吐 | Stomach Cold vomiting |
| 目赤翳障 | Red eyes with nebula |
| 脾虛泄瀉 | Spleen-deficiency diarrhea |
| 疔瘡腫毒 | Deep-rooted boils with toxic swelling |
| 脘腹脹滿 | Epigastric and abdominal fullness |
| 癲癇驚風 | Epilepsy and childhood convulsions |
| 咳嗽痰多 | Cough with copious sputum |
| 消渴 | Wasting-thirst |
| 脾胃虛弱 | Spleen-Stomach deficiency |
| 瘡瘍/瘡癰 | Sores and abscesses |
| 臟躁 | Restless organ disorder |
| 頭痛眩暈 | Headache and dizziness |
| 癰腫瘡毒/熱毒瘡腫 | Toxic sores and swellings |
| 高熱驚厥 | High fever with convulsions |
| 口舌生瘡 | Mouth and tongue sores |
| 抽搐 | Convulsions |
| 盜汗 | Night sweats |
| 痔血/痔瘡出血 | Bleeding hemorrhoids |
| 腎不納氣喘 | Kidney failing to grasp Qi wheezing |
| 不孕 | Infertility |
| 尿失禁 | Urinary incontinence |
| 腰膝冷痛 | Cold low-back and knee pain |
| 熱毒瘡瘍 | Heat-toxin sores |
| 嘔吐 | Vomiting |
| 腹瀉 | Diarrhea |
| 腰痛 | Low-back pain |
| 濕熱瀉痢 | Damp-Heat diarrhea and dysentery |
| 疲勞/倦怠乏力 | Fatigue |
| 筋骨痿弱 | Flaccid sinews and bones |
| 煩躁 | Restlessness |
| 心煩 | Vexation |
| 咳血 | Hemoptysis |
| 骨折 | Bone fracture |
| 虛寒泄瀉 | Deficiency-Cold diarrhea |
| 驚悸 | Fright palpitations |

**易混對,鎖死不互換**:遺精=Spermatorrhea / 滑精=Seminal emission;煩躁=Restlessness / 心煩=Vexation
(皆不得譯 Irritability);心悸=Palpitations / 驚悸=Fright palpitations。

### 1b. 已定案詞(單譯,照抄)

肺熱咳嗽 Lung-Heat cough · 心悸 Palpitations · 尿頻 Urinary frequency · 風熱感冒 Wind-Heat common cold ·
久瀉 Chronic diarrhea · 瘰癧 Scrofula · 腎陽虛 Kidney Yang deficiency · 風熱表證 Wind-Heat exterior pattern ·
鼻淵 Sinusitis · 濕熱黃疸 Damp-Heat jaundice · 眩暈 Dizziness · 頭痛 Headache · 血熱出血 Blood-Heat bleeding ·
肺癰 Lung abscess · 濕痰咳嗽 Damp-Phlegm cough · 血虛 Blood deficiency · 肢體麻木 Limb numbness ·
口瘡 Mouth sores · 早洩 Premature ejaculation · 胸痺 Chest Bi · 藥引 Formula vehicle ·
心神不寧 Restless Spirit · 神昏 Clouded spirit · 風寒感冒 Wind-Cold common cold ·
噁心嘔吐 Nausea and vomiting · 妊娠惡阻 Nausea and vomiting of pregnancy · 陽明頭痛 Yangming headache ·
寒濕帶下 Cold-Damp discharge · 風寒頭痛 Wind-Cold headache · 小兒驚風 Childhood convulsions ·
發熱頭痛 Fever and headache · 視物昏花 Blurred vision · 眼前黑花 Spots before the eyes ·
中氣下陷 Sinking middle Qi · 臟器下垂 Organ prolapse · 食少/食慾不振 Poor appetite ·
破傷風痙攣 Tetanus spasms · 健忘 Forgetfulness · 胎動不安 Restless fetus · 脘腹攣急 Abdominal spasm ·
情緒不穩 Emotional instability · 痛經 Dysmenorrhea · 胸脅痰飲 Phlegm-Fluids in the chest and flanks ·
痄腮 Mumps · 食積 Food stagnation · 寒濕痹痛 Cold-Damp Bi pain · 關節冷痛 Cold joint pain ·
寒疝 Cold hernia · 昏迷 Coma · 癲癇 Epilepsy · 蛇咬傷 Snakebite · 白濁 Turbid urine · 呃逆 Hiccup ·
胃寒 Stomach Cold · 熱淋 Heat Lin · 痰熱咳嗽 Phlegm-Heat cough · 腹痛 Abdominal pain · 乾咳 Dry cough ·
虛喘 Deficiency wheezing · 腎不納氣 Kidneys failing to grasp Qi · 膝痛 Knee pain · 咽乾 Dry throat ·
癭瘤 Goiter · 尿血 Hematuria · 心腎不交 Heart-Kidney disharmony · 血瘀經閉 Blood-stasis amenorrhea ·
癥瘕積聚 Abdominal masses · 濕熱瘡瘍 Damp-Heat sores · 陰虛火旺 Yin deficiency with blazing Fire ·
骨蒸潮熱 Steaming-bone tidal fever

(寫回時大小寫正規化:snakebite、turbid urine、hiccup、bleeding hemorrhoids 現存小寫,統一首字大寫。)

## 2. modern_functions_en 規則

一律綴 `activity`(多數形+全穩定 `-作用` 條目一致)。
前綴規則:**anti + 拉丁/希臘語根 = 連寫**(antibacterial, antiviral, antipyretic, antitussive,
antitumor, antiarrhythmic, antiallergic, antioxidant);**anti- + 英語詞 = 連字號**
(anti-inflammatory, anti-ulcer, anti-fatigue, anti-aging)。

### 2a. 漂移統一

| zh | 鎖定英譯 |
|---|---|
| 抗氧化 | Antioxidant activity |
| 抗菌 | Antibacterial activity(禁 Antibiotic) |
| 抗發炎/抗炎 | Anti-inflammatory activity |
| 降血糖 | Hypoglycemic activity |
| 抗菌抗病毒(各式寫法) | Antibacterial and antiviral activity |
| 降血脂 | Lipid-lowering activity |
| 提升免疫力 | Immune-enhancing activity |
| 免疫調節 | Immunomodulatory activity(與上一條嚴格分開) |
| 降血壓 | Antihypertensive activity |
| 保肝利膽 | Hepatoprotective and cholagogic activity |
| 保肝 | Hepatoprotective activity |
| 鎮痛/止痛(各式) | Analgesic activity |
| 抗病毒 | Antiviral activity |
| 防癌抗腫瘤 | Antitumor and cancer-preventive activity |
| 抗腫瘤 | Antitumor activity |
| 抗心律失常 | Antiarrhythmic activity |
| 抗炎鎮痛 | Anti-inflammatory and analgesic activity |
| 利尿 | Diuretic activity |
| 促進血液循環 | Promotes blood circulation |
| 改善消化系統 | Improves digestive function |
| 預防心血管疾病 | Cardiovascular-protective activity |
| 鎮靜 | Sedative activity |
| 改善睡眠 | Sleep-improving activity |
| 潤腸通便 | Moistening laxative activity |
| 抗過敏 | Antiallergic activity |
| 抗潰瘍 | Anti-ulcer activity |
| 強心作用 | Cardiotonic activity |
| 抗疲勞 | Anti-fatigue activity |
| 提高耐缺氧能力 | Improves hypoxia tolerance |
| 防癌抗腫瘤相關研究 | Anticancer and antitumor-related research |
| 降血壓方向 | Antihypertensive direction |

### 2b. 已定案詞

抗發炎作用 Anti-inflammatory activity · 解熱 Antipyretic activity · 降血糖作用 Hypoglycemic activity ·
抗菌作用 Antibacterial activity · 抗氧化作用 Antioxidant activity · 鎮靜作用 Sedative activity ·
鎮痛作用 Analgesic activity · 鎮咳作用 Antitussive activity · 抗驚厥作用 Anticonvulsant activity ·
抗凝血 Anticoagulant activity · 抗衰老 Anti-aging activity · 心血管保護 Cardiovascular support ·
營養補充 Nutritional support · 局部麻醉訊號 Local anesthetic signal · 神經毒性風險 Neurotoxicity risk ·
抗腫瘤研究提示 Antitumor research signal · 抗腫瘤潛力 Potential antitumor activity ·
抗驚厥/抗癲癇方向 Anticonvulsant / antiepileptic direction · 降血脂作用 Lipid-lowering activity

### 2c. 證據等級後綴(強制保留,不得省略)

`（CloudTCM）` → ` (CloudTCM)` 原樣附加;`-方向` → ` direction`;`-潛力` → `Potential …`;
`-研究提示` → ` research signal`。
例:`抗發炎方向（CloudTCM）` → `Anti-inflammatory direction (CloudTCM)`。
這層是「宣稱療效」與「研究訊號」的分界,譯文必須保留。

## 3. 安全欄位(cautions/contraindications)句型庫

### 3a. 嚴重度階梯(安全鐵則——升降級即臨床缺陷)

| zh 標記 | 等級 | 強制英譯動詞 |
|---|---|---|
| 禁用/禁服/忌服/忌用/勿用 | 絕對 | **Contraindicated in …** |
| 不宜服/不宜使用/避免使用 | 強避免 | **Avoid in …** |
| 慎用/慎服 | 注意 | **Use cautiously in …** |
| 不宜久服/不宜長期服用 | 期限 | **Not for prolonged use …** |
| 不可大劑量 | 劑量 | **Do not use large doses …** |

corpus 內已有明文裁定×2:「不要把 AD 的『慎用』升級成禁用」。反向亦然。

### 3b. 15 個標準句型

1. 孕婦禁用/忌用/孕期禁用 → **Contraindicated in pregnancy.**(退役 "during pregnancy" 形)
2. 孕婦慎用 → **Use cautiously in pregnancy.**
3. 孕婦、哺乳期婦女禁服 → **Contraindicated in pregnancy and lactation.**
4. 陰虛有熱者禁用 → **Contraindicated in Yin deficiency with Heat signs.**
5. 陰虛火旺者禁用 → **Contraindicated in Yin deficiency with Fire blazing.**
6. 脾胃虛寒者慎用 → **Use cautiously in Spleen-Stomach Deficiency-Cold.**(禁斜線形)
7. 脾胃虛寒者忌用 → **Contraindicated in Spleen-Stomach Deficiency-Cold.**
8. 脾胃虛弱者不宜服 → **Not suitable in Spleen-Stomach deficiency.**
9. 表虛(多汗/自汗)忌服 → **Contraindicated in Exterior deficiency with spontaneous sweating.**
10. 氣虛者忌服:恐耗傷元氣 → **Contraindicated in Qi deficiency — its warm nature can consume original Qi.**
11. 十八反 → **Eighteen Incompatibilities: incompatible with X — never combine.**(標籤不得省)
12. 十九畏 → **Nineteen Antagonisms: antagonistic to X — do not combine.**
13. 惡X → **Mutually inhibiting with X — combining them reduces efficacy.**
    (相反=incompatible / 相畏=antagonistic / 相惡=mutually inhibiting,三詞不互換)
14. 與X併用可能… → **Concurrent use with X may …**(用全形)
15. 過量可引起… → **Overdose may cause A, B, and C.**("Excessive exposure" 僅限非口服途徑)

**附則**:`X者忌服：<理由>` 譯成 `<Verdict> — <reason>.`(em dash);
來源詞彙固定:CloudTCM 提醒→ CloudTCM notes;課件→ Chenoweth;American Dragon 首現全拼後用 AD;
「課件未列禁忌」句照既定形 The coursework lists no contraindications for X. **不得為填欄造警語**。

## 4. 批次表(HB-B1~B10,一批一 agent,每批填滿三欄)

| 批 | 分類 | 味數 | CT | MF | CA |
|---|---|---|---|---|---|
| B1 | 活血化瘀 + 瀉下(潤腸/峻下) | 22 | 22(104 tags) | 16(104) | 20(111) |
| B2 | 利水滲濕 + 瀉下(攻下) + 重鎮降逆 | 22 | 15(45) | 13(88) | 22(94) |
| B3 | 補陰 + 補血 + 清虛熱 | 23 | HOLD* | 17(100) | 23(119) |
| B4 | 止血 + 清化熱痰 | 19 | HOLD* | 13(73) | 19(84) |
| B5 | 清熱解毒 + 燥濕 + 涼血 | 24 | HOLD* | 16(150) | 24(130) |
| B6 | 收澀 + 消食 + 驅蟲 | 22 | 13(32) | 16(93) | 20(93) |
| B7 | 理氣 + 化濕 + 開竅 | 23 | HOLD* | 17(113)✅ | 20/23(3 扣住:zhi_ke/xie_bai/fo_shou) |
| B8 | 補陽 + 補氣 + 溫化寒痰 | 20 | HOLD* | 13(79)✅ | 20(96)✅ |
| B9 | 清熱瀉火 + 止咳平喘 + 安神 | 23 | 1/1(4 tags,shi_gao 例外)✅ | 18(117)✅ | 22/23(116 填入;1 扣住:kuan_dong_hua) |
| B10 | 溫裡 + 祛風濕 + 平肝息風 | 22 | 0(0,無缺口)✅ | 20/20(198)✅ | 22/22(132)✅ |

`HOLD*` = 該批 CT 欄多為 110 筆 schema 放錯記錄(單一功效聯),**待 Ting 裁定處置,不進翻譯**。
B10/B5 modern_functions 最重(198/150 條),跑不完可拆:溫裡+祛風濕(15)/平肝息風(7)。
毒性旗標記錄(ku_shen, gan_sui, mu_tong, fu_zi, wu_zhu_yu, chuan_lian_zi, chuan_bei_mu, zhe_bei_mu,
gua_lou, xing_ren, kuan_dong_hua, su_he_xiang, quan_xie, he_shou_wu, ku_lian_pi, bing_lang,
rou_dou_kou, xiong_huang, zhu_sha)散在各批,所在批優先排程。

每批驗收指令:`node scripts/validate-herb-standard.js --worklist --category "<分類>"` +
`node scripts/validate-herb-card-schema.js` + 全套 + ratchet。

## 5. 批次判例回填(B1,2026-08-14)

### 5a. B1 新定 condition_tags 詞(後批照抄)

經閉 Amenorrhea · 產後惡露腹痛 Postpartum lochia with abdominal pain ·
胸痺心痛 Chest Bi with heart pain · 胃脘痛 Epigastric pain ·
產後瘀滯腹痛 Postpartum stasis abdominal pain · 熱病神昏 Clouded spirit in febrile disease ·
癲癇狂躁 Epilepsy with manic agitation · 痰濕蒙蔽心竅 Phlegm-Damp clouding the orifices of the Heart ·
產後血瘀 Postpartum Blood stasis · 胸脅刺痛 Stabbing pain in the chest and hypochondrium ·
下肢痿軟 Weakness and flaccidity of the lower limbs · 血滯經閉 Blood-stagnation amenorrhea
(滯≠瘀:與既定 血瘀經閉 Blood-stasis amenorrhea 嚴格分開) ·
食積不化 Food stagnation with indigestion · 手足麻木 Numbness of the hands and feet ·
跌打腫痛 Traumatic injury with swelling and pain ·
瘡瘍潰後不斂 Toxic sores and swellings that fail to heal after rupture ·
產後浮腫 Postpartum edema · 通利關節 Frees and benefits the joints ·
利尿通淋 Promotes urination and relieves Lin · 淋濁 Turbid Lin ·
血瘀心腹劇痛 Severe pain from Blood stasis in the heart and abdomen ·
崩漏下血 Flooding and spotting with bleeding · 產後瘀血出血 Postpartum hemorrhage with Blood stasis ·
經閉痛經 Amenorrhea and dysmenorrhea · 肩臂風濕痹痛 Wind-Damp Bi pain of the shoulder and arm

### 5b. B1 新定 modern_functions 詞

改善腦功能 Improves brain function · 改善記憶 Improves memory ·
改善微循環 Improves microcirculation(改善-系動詞式,不加 activity,平行於既定 改善消化系統) ·
保護心臟健康 Cardioprotective activity · 抗心肌缺血 Protects against myocardial ischemia ·
抗肝纖維化 Anti-fibrotic activity in the liver · 興奮子宮 Uterine-stimulant activity ·
抗血栓 Antithrombotic activity · 抗血小板聚集 Antiplatelet aggregation activity ·
保護心血管 Cardiovascular-protective activity(與 預防心血管疾病 同英譯,zh 異形) ·
抗早孕 Anti-early-pregnancy activity(低信度直譯,藥理實為抗著床/墮胎訊號,勿擴寫機轉)

### 5b-2. B2 新詞回填(2026-08-14)

condition_tags:腳氣 Beriberi · 濕溫初起 Early-stage Damp-Warmth ·
痰飲眩暈 Phlegm-Fluids with dizziness · 腎陰不足 Kidney Yin deficiency ·
濕熱水腫 Damp-Heat Edema · 熱淋痛澀 Heat Lin with painful urinary straining ·
暑濕洩瀉 Summerheat-Damp diarrhea · 水瀉 Watery diarrhea ·
肝火目赤腫痛 Liver Fire with red, swollen, painful eyes ·
小便赤澀 Reddish, difficult urination ·
心火上炎口舌生瘡 Heart Fire flaring upward with mouth and tongue sores ·
產後乳汁不下 Postpartum insufficient lactation · 小便澀痛 Painful straining urination ·
暑濕煩渴 Summerheat-Damp with vexing thirst

modern_functions:助消化 Promotes digestion · 抗病原微生物 Antimicrobial activity ·
護膚美容 Skin-care and beautifying activity ·
降血脂降血壓 Lipid-lowering and antihypertensive activity ·
改善心血管健康 Improves cardiovascular health · 抗輻射 Radioprotective activity

### 5b-3. B3 新詞回填(2026-08-14)

modern_functions:抗癌 Anticancer activity · 抗瘧 Antimalarial activity ·
調節血糖 Blood-glucose-regulating activity(調節≠降,與 Hypoglycemic 嚴格分開) ·
抗應激作用 Anti-stress activity · 抗休克 Anti-shock activity ·
緩解壓力 Relieves stress · 保護眼睛健康 Eye-protective activity ·
抗突變作用 Antimutagenic activity

### 5b-4. B4 新詞回填(2026-08-14)

modern_functions:興奮中樞神經 CNS-stimulant activity ·
抑制中樞神經 CNS-depressant activity ·
消炎抗菌 Anti-inflammatory and antibacterial activity

### 5b-6. B6 新詞回填(2026-08-14)

modern_functions:降膽固醇 Cholesterol-lowering activity · 減肥減重 Weight-loss activity ·
補充能量 Energy-boosting activity · 促進腸道健康 Promotes gut health ·
營養豐富 Rich in nutrients · 促進排毒 Promotes detoxification ·
促進骨骼健康 Promotes bone health · 促進消化 Promotes digestion

condition_tags:五更瀉 Fifth-watch diarrhea · 晨瀉 Morning diarrhea ·
蛔厥腹痛 Roundworm-reversal abdominal pain · 膽道蛔蟲 Biliary ascariasis ·
虛熱消渴 Deficiency-Heat wasting-thirst · 下痢滑脫 Diarrhea with slippery collapse ·
瘡瘍不斂 Non-healing sores and ulcers

配伍詞追加(架構裁定 2026-08-14):**相剋 = mutually restrains**(B6 烏賊骨判例),
與 相反 incompatible / 相畏 antagonistic / 相惡 mutually inhibiting 並列第四詞,不互換。

### 5f. B7 新詞回填(2026-08-14,理氣+化濕+開竅)

modern_functions:改善皮膚健康 Improves skin health(改善-系動詞式,平行於既定 改善消化系統/改善微循環,不加 activity) ·
抗菌抗炎 Antibacterial and anti-inflammatory activity(組合式,平行於既定 抗菌抗病毒 的 "X and Y activity" 造詞法) ·
升高血壓 Raises blood pressure(本批確認鎖定,herb.chen_pi 已先行使用,回填鎖定供後批查表) ·
降壓 = 降血壓 的同義簡寫,鎖定同一英譯 Antihypertensive activity(僅 zh 異形,不分裂)。

### 5g. B7 判例(理氣+化濕+開竅,23 味,3 筆扣住)

- **herb.zhi_ke** cautions_zh 全部 6 則逐字引用「枳實」(非「枳殼」),且與 herb.zhi_shi 的
  cautions_zh 幾乎逐字相同(僅一處「或大量」/「或量」的 OCR 差異)——判定為整段從枳實卡複製貼上,
  不是枳殼自己的禁忌內容。cautions_en 整欄扣住,zh 不動,進 Ting 裁定佇列(對照 zhi_ke 自己的
  `properties_taste_temp` 目前也只是佔位草稿「Draft: ... verify individual taste and temperature」,
  佐證這筆記錄本來就沒填完整)。herb.zhi_shi 自己的同段內容因主詞正確,正常翻譯收錄。
- **herb.xie_bai** cautions_zh[0]「薤白性偏寒涼」與該記錄自己的 `properties_taste_temp`「辛、苦、溫」
  直接矛盾(溫 vs 寒涼)。cautions_en 整欄扣住,進 Ting 裁定佇列(比照 B5 huang_qin 判例)。
- **herb.fo_shou** cautions_zh 五則全數稱「佛手柑」而非本記錄的「佛手」,且其中「佛手柑性偏寒涼」
  再度與本記錄 `properties_taste_temp`「辛、苦、溫、酸」矛盾——名稱(佛手柑/Bergamot 常指
  Citrus bergamia,與本記錄「佛手」Citrus medica var. sarcodactylis 是不同基原)與藥性(寒涼/溫)
  雙重不符,判定整段內容疑似跨物種誤植。cautions_en 整欄扣住,進 Ting 裁定佇列;
  `modern_functions_zh`(抗菌、抗氧化等通用藥理,未見物種標記矛盾)不在本次扣住範圍,正常翻譯。
- **herb.xiang_fu** cautions_zh[4]~[8]「血燥便祕者」「脾虛泄瀉者」「孕婦及哺乳期婦女」
  「出血傾曏者」「高熱者」五則均為無動詞的裸名詞短語(疑似原本共用一個「禁用/慎用」表頭時
  被拆成陣列各自一項,表頭遺失)。比照 B6 檳榔判例(無動詞的中性敘述不擅自升級)延伸適用於
  「連中性動詞都沒有」的情況:逐項直譯為名詞短語,不代補「Contraindicated/Avoid/Use cautiously」
  等嚴重度動詞。
- **herb.shi_chang_pu** cautions_zh[1]「忌配伍：秦艽、秦皮為石菖蒲之使」——表頭寫「忌」,
  但內容描述的是相使(七情裡的協同關係),不是不相容。**忌 ≠ 相使**,兩者不可混譯;
  本欄照內容譯為配伍協同說明,不譯成「不可併用」,並在此列出供表頭用字校正。
  同記錄 cautions_zh[10]/[11] 為同一句「避免長期大量使用」被拆成表頭+全句兩個陣列項
  (索引對齊仍逐項照翻,不合併)。
- 單句內強弱動詞混用(表頭「慎服/慎用」+ 內文「不宜/不可」等更強動詞):**取較保守(較強)級**,
  沿用 B1 規則,本批命中 3 筆(shi_chang_pu[0]、shi_chang_pu[6]、su_he_xiang[0])。

### 5c. B1 判例

- 單句內強弱動詞混用(標題「忌」+說明「不宜」):**取較保守(較強)級**。
- 反/畏與典籍通說不合時(例:五靈脂反人參 vs 通說人參畏五靈脂):**照原文字翻**,
  不代改 TCM 學說;列報告供內容審。
- cautions_zh 與同記錄藥性/藥理欄**內在矛盾**者(B1 抓到 5 筆):cautions_en 扣住,
  zh 不動,進 Ting 裁定佇列。

### 5d. B5 新詞回填(2026-08-14)

modern_functions:驅蟲 Anthelmintic activity · 抗生育作用 Anti-fertility activity
(低信度直譯,平行於既定 抗早孕 判例,機轉未明,勿擴寫) ·
抗動脈粥樣硬化 Anti-atherosclerotic activity ·
抗黴菌/抗真菌 Antifungal activity(兩種 zh 寫法同譯一詞,不分裂黴菌/真菌)

### 5e. B5 判例(清熱解毒+燥濕+涼血,24 味,3 筆扣住)

- **herb.huang_qin** cautions_zh[1]「脾肺虛熱者忌之：體質虛寒者不宜服用」:
  條目本身矛盾(前段講虛熱、後段講虛寒,方向相反)。cautions_en 整欄扣住,
  zh 不動,進 Ting 裁定佇列。
- **herb.huang_bai** cautions_zh[6]「黃柏具有收斂作用，腹瀉患者使用可能會加重腹瀉症狀」:
  機轉倒置(收斂傳統上止瀉,不會導致腹瀉加重)。cautions_en 整欄扣住,進裁定佇列。
- **herb.bai_tou_weng** cautions_zh[1]「豚實力使。（《藥性論》）」:
  古籍引文疑似 OCR/校對錯字,無法可信翻譯(不同於「反/畏與通說不合」的可直譯情境,
  此條本身語意不通)。cautions_en 整欄扣住,進裁定佇列。
- **herb.sheng_di_huang** cautions_zh[4]「畏蕪荑（柳絮）」:蕪荑為榆科植物(Ulmus
  macrocarpa)果實加工品,並非柳絮(楊柳科 Salix)。此為源資料的物種誤植,
  **照原文字翻**(不代改 zh),於報告中列出供內容審訂正 zh。
- **herb.chi_shao** functions_zh 內含「補腎」「補血養肝」,與赤芍(清熱涼血/
  活血化瘀,無補益功效)的公認藥性不符,疑似與白芍(補血養肝)內容混淆。
  functions_zh 不在本批填寫範圍,不逕行更動,列報告供 Ting 核對是否為
  跨藥誤植。

### 5h. B8 新詞回填(2026-08-14,補陽+補氣+溫化寒痰)

modern_functions:預防骨質疏鬆 Antiosteoporotic activity(anti+希臘語根連寫,平行 antiarrhythmic/antitumor 造詞法) ·
升高血糖 Raises blood glucose(新詞,平行既定 升高血壓 Raises blood pressure 的動詞片語式,不加 activity) ·
改善心功能 Improves cardiac function(改善-系動詞式,平行既定 改善消化系統/改善微循環/改善記憶,不加 activity) ·
改善大腦功能 = 既定 改善腦功能 Improves brain function 的同義變體(僅 zh 多一「大」字,鎖定同一英譯,不分裂) ·
改善記憶力 = 既定 改善記憶 Improves memory 的同義變體(僅 zh 多一「力」字,鎖定同一英譯,不分裂)。

### 5i. B8 判例(補陽+補氣+溫化寒痰,20 味,0 筆整欄扣住)

- **溫化寒痰類覆核**:半夏/天南星/白附子/白芥子/皂角刺(傳統溫化寒痰五味)MF/CA 兩欄
  在 B8 開工前已全數雙語到位,本批不動;B8 實際觸及的化痰類 3 筆(紫蘇子、銀杏、胖大海)
  屬廣義「化痰止咳平喘藥/Transform Phlegm」分類但非傳統溫化寒痰藥,因其 CA 缺口與
  補陽/補氣的缺口合計剛好湊滿派工單的 20 筆/96 條,故一併收入本批,不再另立新批。
- **herb.yin_xing(銀杏)cautions_zh[0]「生食過量易中毒」**:全庫唯一明確生食毒性警語,
  對應派工單「毒性炮製警語」抽查要求,已於眼讀樣本列出。
- **herb.shan_yao(山藥)cautions_zh[1]「紫芝為之使，惡甘逆」**:「甘逆」字形與「甘遂」
  極近,疑似 OCR/校對誤植(菟絲子條目亦見「菟蕬子」同類錯字模式,顯示本庫存在系統性
  OCR 雜訊,非個案)。因無法確認正確藥名,**未代改 zh**,cautions_en 保留「甘逆」原字
  的羅馬拼音轉寫並加註「character unclear / possibly Gan Sui」而非直接寫入漢字(避免
  漏網 CJK 字元進 _en 破壞 A11 掃描),供 Ting 核對後回填正確藥名。此條連帶的「不宜與
  甘味過重食物」說明與「惡」(七情配伍關係,非飲食禁忌)語意不符,一併列出供內容審,
  未整欄扣住(理由:此為配伍注解的疑似訛誤,非同記錄內藥性/藥理的直接方向性矛盾,
  嚴重度低於 B1/B5 已扣住的案例)。
- **herb.tai_zi_shen(太子參)cautions_zh[3]「高血壓：患有低血壓或已服降壓藥物者應在
  醫生指導下使用」、[4]「糖尿病：患有低血糖或已服降糖藥物者應在醫生指導下使用」**:
  兩則表頭(高血壓/糖尿病)與內文(低血壓/低血糖)方向相反,疑似生成模板套錯「高/低」
  變體。內文本身語意自洽(不含矛盾),故翻譯以內文為準、表頭改用中性詞「Blood pressure
  caution」「Blood glucose caution」,不逕自譯出「高血壓/糖尿病」字面(避免與內文方向
  衝突),原文表頭矛盾列此供 Ting 校正 zh。
- **herb.sha_yuan_zi(沙苑子)properties_taste_temp「無毒」vs cautions_zh[1]「沙苑子
  含有毒性成分，過量服用會引起中毒」**:兩者字面對立,但比對全庫其他「無毒 + 過量警語」
  記錄(如 herb.lu_rong 性味未標無毒但同樣有「驟用大量」警語),此類「classical 無毒
  分類」與「modern overdose caution」並存是全庫常見模式,非 B1/B5 判例中「同一件事
  方向直接相反」的強矛盾,故正常翻譯、不扣住,列此供留意。
- **人參/黨參/太子參/西洋參同名近似藥核對**:黨參、太子參、西洋參三筆 modern_functions_zh
  與 herb.ren_shen(已填)重疊項多為補氣藥常見通用藥理(抗氧化、提升免疫力等),非逐條
  複製;黨參「不宜與藜蘆同用」、西洋參「不宜與藜蘆同用」均屬「諸參類反藜蘆」的通行
  說法(非僅人參專有),核對後判定非跨藥誤植,兩者 zh 均未見「反」字,故英譯未套用
  「Eighteen Incompatibilities」標籤(該標籤僅在 zh 明文出現「反」/「十八反」時才用,
  見 herb.chi_shao 判例),改譯為中性「Avoid combining with Li Lu (Veratrum)」。

### 5j. B9 新詞回填(2026-08-14,清熱瀉火+止咳平喘+安神)

modern_functions:改善學習記憶 Improves learning and memory(改善-系動詞式,平行既定
改善記憶/改善腦功能/改善大腦功能/改善微循環的造詞法,不加 activity) ·
抗菌消炎 Antibacterial and anti-inflammatory activity(herb.he_huan_pi;字序與既定
抗菌抗炎 相同、與 消炎抗菌 相反,依本詞字序譯 antibacterial 在前,鎖定同英譯不分裂) ·
herb.su_zi(紫蘇子)modern_functions_zh[6]「抗化」核對其自身 modern_functions_detail_zh
的 tag 說明文字(內容全講多醣體清除自由基、提升 SOD/CAT/GPx 抗氧化酶活性),確認為
「抗氧化」的資料截斷/漏字(非新詞、非臆測),譯為既定 Antioxidant activity,供後批比對
同類截斷字串時參考此驗證方法(查 modern_functions_detail_zh 而非直接猜詞)。

### 5k. B9 判例(清熱瀉火+止咳平喘+安神,23 味,1 筆整欄扣住)

- **herb.kuan_dong_hua(款冬花)cautions_zh[0]「款冬花性溫，會加劇肺火」vs [1]「款冬花
  性偏涼，會損傷陰津」**:同一記錄的 cautions_zh 陣列內部直接自相矛盾(溫 vs 涼,
  相反方向),且 [0] 與本記錄 `properties_taste_temp`「甘、辛、微甘、苦、溫」(溫)一致、
  [1] 反而牴觸。比照 B1(huang_qin 虛熱/虛寒同句矛盾)、B7(xie_bai/fo_shou 性偏寒涼 vs
  properties 溫)判例,cautions_en 整欄扣住,zh 不動,進 Ting 裁定佇列。modern_functions_zh
  (抗發炎、降血脂、保肝利膽、防癌抗腫瘤,通用藥理未見矛盾)不在扣住範圍,正常翻譯收錄。
- **herb.shi_gao(石膏)condition_tags_zh 例外處理**:本記錄的 `condition_tags_zh`
  四則(清熱瀉火/除煩止渴/清肺平喘/斂瘡生肌)與 `traditional_functions_zh` 逐字相同,
  外觀符合 §0 所述「110 筆 schema 放錯(單一四字功效聯,非證候標籤)」的樣式特徵。
  本欄仍照派工單明示指令翻譯收錄(派工單原文:「它是全庫最後一筆 CT 缺口——一併補」),
  未比照 HOLD* 扣住;因與既有 schema-錯置規則存在字面張力,在此列出供 Ting 複核是否
  也需要和其餘 110 筆一併重新裁定 schema 歸屬(而非僅翻譯了事)。
- **herb.zhu_sha(硃砂)cautions_zh 4 則**:全數為毒性/炮製警語(HgS 主成分、忌火煅、
  不入湯劑、蓄積性中毒),逐字對應翻譯,⚠️ 警示符號原樣保留,零改寫,對應派工單「毒性與
  久服警語逐字翻」規則;`contraindications_en` 先前批次已完成,本批僅補 `cautions_en`。
- **止咳平喘類温度/毒性覆核**:xing_ren(杏仁)properties_taste_temp 同時列「有毒」與
  「小毒」兩個並存的毒性標記(非同義互斥,屬原始資料冗餘,非方向性矛盾),cautions_zh
  的「小毒慎用」逐字翻譯保留,不因標記重複而扣住整欄。
- **herb.su_zi(蘇子)cautions_zh[4]「避免生食：生紫蘇子有毒」**:毒性警語逐字翻譯
  (Avoid raw consumption — raw Su Zi is toxic…),不改寫、不淡化。

### 5l. B10 新詞回填(2026-08-14,溫裡+祛風濕+平肝息風,含全庫殘餘掃尾)

modern_functions:利膽 Cholagogic activity(獨立詞,與既定 保肝利膽 Hepatoprotective and
cholagogic activity 區分——單獨出現時只譯利膽部分) · 改善食慾 Improves appetite(改善-系動詞式,
平行既定 改善消化系統/改善微循環/改善記憶,不加 activity) · 抗氧化抗腫瘤 Antioxidant and antitumor
activity(組合式,平行既定 抗菌抗炎/消炎抗菌 的 "X and Y activity" 造詞法) · 抗癲癇(單獨,非
「抗驚厥/抗癲癇方向」組合詞)Antiepileptic activity(平行 抗驚厥 Anticonvulsant activity 造詞) ·
催眠 Hypnotic activity(與既定 鎮靜 Sedative activity / 改善睡眠 Sleep-improving activity 三詞
並列,催眠指誘導入睡,不互換)。

### 5m. B10 判例(溫裡+祛風濕+平肝息風,22 味,0 筆整欄扣住;全庫殘餘掃尾另發現 6 筆新扣住)

B10 三分類本身逐筆核對(溫度極性、MF/CA 內部矛盾、跨藥誤植)**沒有找到扣住等級的案例**——
溫裡藥全數性味方向一致(辛熱/溫,cautions 無反向溫度宣稱);平肝息風的蟲類/動物藥
(全蠍、地龍)警語逐字對應無矛盾。以下 2 筆為**低信心度觀察,已翻譯、未扣住**,列此供 Ting 複核：

- **herb.du_huo cautions_zh[0]「獨活性溫，具有補陽和散寒的作用」**:「補陽」一詞不見於本記錄
  `functions_zh`(僅列「散風寒」，無補陽相關功效)，可能為 cautions 生成時的用詞誇大，非跨藥
  誤植(全庫搜尋此句僅此一筆，非複製貼上)。因非溫度極性反向、且非跨藥複製，未達 B1/B5/B7
  扣住門檻，**已照原文翻譯**，列此供內容審。
- **herb.gan_jiang cautions_zh[0]「乾薑可能活血化瘀，孕婦服用不當易導致流產」**:「活血化瘀」
  不見於本記錄 `functions_zh`(僅列「溫中散寒」「回陽通脈」「溫肺化飲」)。同上，未達扣住門檻，
  已照原文翻譯，列此供內容審。
- **herb.fang_ji cautions_zh[3]「上焦濕熱者不可用：防己清熱利濕，在上焦濕熱的情況下服用可能會
  加重濕熱」**:字面上「清熱利濕」藥為何會「加重濕熱」，機轉敘述有邏輯跳躍，但不同於
  B5 huang_bai(收斂止瀉 vs 加重腹瀉)的直接機轉倒置——本句可能反映上/下焦定位的古典教學
  (防己主治下焦水濕，非用於上焦)，證據不足以判定為錯誤，**已照原文翻譯**，列此供內容審。

**全庫殘餘掃尾(11 筆候選,5 筆填入,6 筆新扣住)**：溫度極性檢核延伸到全庫殘餘 CA 缺口時，
發現 6 筆記錄的 cautions_zh 用「與本記錄 properties_taste_temp 直接相反的溫度字」或「與本記錄
自己的 modern_functions_zh/functions_zh 直接相反的機轉/主治」作為警語理由——比照 B1/B5/B7/B9
的扣住標準(溫度極性反向、機轉倒置、跨藥誤植)，逐筆列出：

- **herb.yu_jin(鬱金)**:`properties_taste_temp`「辛、寒、苦」，但 cautions_zh[2]「胃虛血虛者
  忌服：**鬱金性溫**」與 cautions_zh[7]「腸胃不適患者禁用：**鬱金性溫**」兩處均稱「性溫」，
  與本記錄自己的寒性宣告直接相反(兩處重複出現，非單一筆誤)。cautions_en 整欄扣住，zh 不動，
  進 Ting 裁定佇列。
- **herb.yin_chen_hao(茵陳蒿)**:`properties_taste_temp`「微苦、辛、微寒」，但 cautions_zh[2]
  「熱甚發黃，無濕氣者禁用：**茵陳蒿屬溫性藥**，熱甚發黃者服用易助熱生火」稱其為溫性藥，
  與本記錄寒性宣告直接相反。cautions_en 整欄扣住，進 Ting 裁定佇列。
- **herb.long_gu(龍骨)**:`functions_zh`/`indications_zh` 均明列「平肝潛陽」為核心功效/主治，
  但 cautions_zh[5]「肝陽上亢者不宜使用：龍骨清熱降火，肝陽上亢者服用後可能加重症狀」直接
  聲稱在其自身主治適應症(肝陽上亢)中使用會加重症狀——與本記錄自己的主治欄直接矛盾。
  cautions_en 整欄扣住，進 Ting 裁定佇列。
- **herb.dan_shen(丹參)**:`modern_functions_zh` 明列「降血壓」，但 cautions_zh[4]「血壓過高者
  忌用：丹參擴張血管，血壓過高者使用恐導致血壓進一步升高」——擴血管機轉理應降壓而非「進一步
  升高」，機轉倒置，比照 B5 huang_bai(收斂止瀉 vs 加重腹瀉)判例。cautions_en 整欄扣住，
  進 Ting 裁定佇列。
- **herb.mo_yao(沒藥)**:`modern_functions_zh` 明列「抗血小板聚集」(抗凝血方向)，但
  cautions_zh[6]「出血性疾病患者應避免使用，因其具有促進血液凝固的作用」聲稱沒藥「促進血液
  凝固」——與本記錄自己的現代藥理欄方向直接相反，機轉倒置。cautions_en 整欄扣住，
  進 Ting 裁定佇列。
- **herb.zhe_bei_mu(浙貝母)**:`modern_functions_zh`(5 條)與 `cautions_zh`(5 條)**逐字**與
  `herb.chuan_bei_mu`(川貝母)的對應欄位相同，且 cautions_zh 內文五次直呼「川貝母」而非
  本記錄的「浙貝母」——比照 B7 zhi_ke(cautions 逐字引用「枳實」)判例，判定為跨藥複製貼上。
  cautions_en 整欄扣住，zh 不動；`modern_functions_en` 已在先前批次填入同樣的複製內容
  (非本批填寫，不在本次改動範圍)，一併列出供 Ting 裁定 zhe_bei_mu 整卡是否需要重新核對來源。

**未達扣住門檻、已翻譯的觀察項(平 vs 寒/熱，較弱極性差異)**：以下 3 筆的 cautions_zh 稱本記錄
「性寒」或「性溫熱」，但 `properties_taste_temp` 宣告為中性「平」(非相反極性，只是中性
vs 偏性)，未達 B1/B5/B7/B9 要求的「直接相反極性」門檻(溫 vs 寒/涼)，**已照原文翻譯，未扣住**，
列此供 Ting 複核是否要把門檻延伸到「平 vs 偏性」：
- herb.sang_ji_sheng：`properties_taste_temp`「苦、甘、平」vs cautions_zh[2]「桑寄生性溫熱」。
- herb.yu_li_ren：`properties_taste_temp`「甘、辛、苦、平、無毒」vs cautions_zh[0]「鬱李仁性寒」。
- herb.pu_huang：`properties_taste_temp`「辛、甘、平」vs cautions_zh[2]「蒲黃性寒」。

**herb.san_leng(三稜)cautions_zh「對三稜或其他柑橘科植物過敏者應避免使用」**:三稜為黑三稜科/
莎草科植物(Sparganium)，並非柑橘科(Rutaceae)，物種分類明顯錯誤，但屬單筆孤立錯誤(不影響
該筆整體警語方向，且未與本記錄其他欄位直接矛盾)，比照 B5 sheng_di_huang(蕪荑/柳絮物種誤植)
判例，**照原文字翻**，列此供內容審訂正 zh。

**herb.quan_xie(全蠍)cautions_zh 4 則**:全數為毒性/中毒處置警語，逐字對應翻譯，對應派工單
「蟲類藥毒性警語逐字翻」規則，已於眼讀樣本列出(見批次報告)。
