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
| B7 | 理氣 + 化濕 + 開竅 | 23 | HOLD* | 17(113) | 23(119) |
| B8 | 補陽 + 補氣 + 溫化寒痰 | 20 | HOLD* | 13(79) | 20(96) |
| B9 | 清熱瀉火 + 止咳平喘 + 安神 | 23 | HOLD* | 18(117) | 23(123) |
| B10 | 溫裡 + 祛風濕 + 平肝息風 | 22 | HOLD* | 20(198) | 22(126) |

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

### 5c. B1 判例

- 單句內強弱動詞混用(標題「忌」+說明「不宜」):**取較保守(較強)級**。
- 反/畏與典籍通說不合時(例:五靈脂反人參 vs 通說人參畏五靈脂):**照原文字翻**,
  不代改 TCM 學說;列報告供內容審。
- cautions_zh 與同記錄藥性/藥理欄**內在矛盾**者(B1 抓到 5 筆):cautions_en 扣住,
  zh 不動,進 Ting 裁定佇列。
