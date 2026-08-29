# FILL LINE 派工單 — 2026-08-28:雙語逐索引對齊(17 張中藥卡)

**派給**:Sonnet 5
**檔案**:`data/herbs/herb_canon_shortlist.json`(**只動這一支**)
**分支**:`sonnet/bilingual-index-alignment`
**不會撞**:同時在跑的 A1 批次動的是 `data/herbs/formulas.json`,兩批檔案不重疊。

---

## 為什麼有這張單

卡片上的雙語 chip 是**逐索引**印出來的:第 i 個中文配第 i 個英文。
2026-08-28 修掉一個渲染層缺陷(commit `9364a5bb`):它原本允許
`modern_pharmacology_zh` 在同源英文長度不符時,去挪用**另一份清單**
`modern_functions_en` 湊長度。11 張卡因此印出錯的翻譯:

| 卡 | 畫面上印過的錯配 |
|---|---|
| 香薷 | 「發汗與退熱作用」→ "Increases gastric acid secretion" |
| 石膏 | 「顯著解熱作用」→ "Hypoglycemic activity" |
| 蒼耳子 | 「降血糖作用」→ "Analgesic activity" |
| 車前子 | 「顯著利尿作用」→ "Analgesic activity" |

渲染規則已收緊成**同源才配**,錯的翻譯不再出現。代價是那 11 張現在
一條英文都不印。這張單要把它們的**同源英文**補回來。

新 gate:`node scripts/validate-bilingual-index-pairing.js`(已在 CI)。

---

## 紅線(違反其中任何一條,整批退回)

1. **不准挪用鄰欄**。`modern_pharmacology_en` 只能寫
   `modern_pharmacology_zh` 那幾條的英文。單子裡每張卡都列出了
   `modern_functions_en` 的內容,那是**給你比對用的反面教材**,不是素材。
   複製貼上它 = 把剛修掉的 bug 重新寫進資料裡。
2. **不准刪內容**(憲法「只加深,不刪除」)。群組 2 兩側各自有對方沒有的
   真內容,解法是**補齊短的那一側**,不是砍長的那一側。
   真的必須搬動時:先搬進 `import_artifacts`
   (`{original_field, text, reason, moved_at, ruling}`)再改。
3. **順序要對,不只是長度對**。硝石現在英文第 1 條對應中文第 2 條 ——
   長度湊對了但索引仍然錯位,那還是印錯的翻譯。
4. **查不到就留白並回報**,不要自己編。一條沒把握的英文,寧可整個欄位留空
   (渲染層會安全地只印中文),也不要印一句沒有來源的話。
5. **不動渲染器、不動驗證器、不動 CI**。這張單只改一支 JSON。

---

## 群組 1 的做法(11 張,低發明風險)

中文那幾條**自己就帶著英文括號**:

```
"擴張末梢血管與改善微循環 (Vasodilation & Microcirculation - Cinnamaldehyde)"
```

所以 `modern_pharmacology_en[0]` 就是把括號裡那句寫成完整的英文短語:

```
"Vasodilation and improved microcirculation (cinnamaldehyde)"
```

規則:
- 條數必須與 `modern_pharmacology_zh` **完全相同**,順序**完全對應**。
- 成分名(Cinnamaldehyde、Gingerol、Atractyloside…)保留在括號裡。
- 括號裡沒有英文的中文條目 → 照該條中文的藥理意思寫,不要跨條借。

## 群組 2 的做法(6 張,需要中醫判斷 + 來源)

`functions_zh` 與 `actions_en` 長度不符,而且**兩側各自有對方沒有的真內容**。
逐張判斷要補哪一側,補完長度相等且索引對應。

- **青木香 `herb.qing_mu_xiang` 先不要動,列 待裁 回報**:它是馬兜鈴科
  (含馬兜鈴酸,有腎毒性/致癌性爭議),英文那條已經標了 "historical action"。
  補一條「解毒消腫」的英文等於替一味有安全爭議的藥增加適應症敘述 ——
  那是 Ting 的裁定,不是填空題。
- 其餘 5 張照上面的規則補齊。

---

## 驗收(自己先跑,數字要能被一行指令重現)

```bash
node scripts/build-data.js
node scripts/validate-bilingual-index-pairing.js      # 必須 PASS
node scripts/validate-herb-card-schema.js --json      # defects 應由 6 降到 1(青木香待裁)
node scripts/check-validation-ratchet.js              # 不准有任何一條變多
node scripts/validate-content-junk.js
```

回報格式(逐欄位列數字,禁用「完成」「100%」):
- 群組 1:`modern_pharmacology_en` 補齊 __/11 張,每張條數 = `_zh` 條數
- 群組 2:`actions_en` 對齊 __/5 張,青木香 1 張列待裁
- `herb_card_schema` defects:6 → __
- 沒有任何欄位變短或被清空(自己 diff 確認)
- **開卡片用眼睛讀過**:香薷、石膏、蒼耳子、車前子四張,確認括號裡的英文
  現在講的是同一件事

## 群組 1 — modern_pharmacology_en 缺漏 / 長度不符(11 張)

### 桂枝 `herb.gui_zhi`
- `modern_pharmacology_zh` (4 條):
  1. 擴張末梢血管與改善微循環 (Vasodilation & Microcirculation - Cinnamaldehyde)
  2. 鎮痛與解熱作用 (Analgesic & Antipyretic)
  3. 抗發炎與抗病毒 (Anti-inflammatory & Antiviral)
  4. 強心與促進血液循環 (Cardiotonic Effect)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (4 條,另一份清單): ["Antipyretic and analgesic activity","Anti-inflammatory and antiviral activity","Diuretic activity","Peripheral circulation support"]

### 紫蘇葉 `herb.zi_su_ye`
- `modern_pharmacology_zh` (4 條):
  1. 解熱與鎮靜作用 (Antipyretic & Sedative)
  2. 促進胃腸蠕動與解痙 (GI Motility & Spasmolytic)
  3. 抗過敏與止咳平喘 (Anti-allergic & Anti-asthmatic)
  4. 抗菌與抑真菌 (Antibacterial & Antifungal)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (4 條,另一份清單): ["Promotes gastric secretion and gastrointestinal motility","Antipyretic and sedative activity","Anti-allergic activity","Antibacterial and antifungal activity"]

### 生薑 `herb.sheng_jiang`
- `modern_pharmacology_zh` (4 條):
  1. 顯著止嘔作用 (Anti-emetic Effect - Gingerol 薑辣素)
  2. 促進胃液分泌與胃排空 (Gastric Secretion & Emptying)
  3. 抗發炎與鎮痛 (Anti-inflammatory & Analgesic)
  4. 抗氧化與心血管保護 (Antioxidant & Cardiovascular Protection)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (4 條,另一份清單): ["Promotes gastric mucus secretion","Promotes intestinal motility","Antiemetic activity","Antibacterial and anti-inflammatory activity"]

### 香薷 `herb.xiang_ru`
- `modern_pharmacology_zh` (4 條):
  1. 發汗與退熱作用 (Diaphoretic & Antipyretic - Carvacrol 香荊芥酚)
  2. 廣譜抗菌與抗病毒 (Broad-spectrum Antibacterial & Antiviral)
  3. 促進腸胃蠕動與解痙 (GI Motility & Spasmolytic)
  4. 溫和利尿作用 (Diuretic Effect)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (4 條,另一份清單): ["Increases gastric acid secretion","Slows intestinal peristalsis — used for diarrhea","Antibacterial activity","Antipyretic activity"]

### 荊芥 `herb.jing_jie`
- `modern_pharmacology_zh` (4 條):
  1. 解熱與鎮痛作用 (Antipyretic & Analgesic)
  2. 促進皮膚微循環 (Promote Cutaneous Microcirculation)
  3. 顯著止血作用 (Hemostatic Effect - Schizonepeta Charcoal)
  4. 廣譜抗菌與抗發炎 (Broad-spectrum Antibacterial)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (4 條,另一份清單): ["Antipyretic and diaphoretic activity","Antibacterial activity","Hemostatic activity","Bronchodilator activity"]

### 羌活 `herb.qiang_huo`
- `modern_pharmacology_zh` (3 條):
  1. 顯著鎮痛與解熱作用 (Significant Analgesic & Antipyretic)
  2. 抗心律失常與抗心肌缺血 (Anti-arrhythmic & Anti-ischemic)
  3. 抗發炎與抑真菌 (Anti-inflammatory & Antifungal)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (3 條,另一份清單): ["Antipyretic activity","Analgesic activity","Increases blood circulation"]

### 蒼耳子 `herb.cang_er_zi`
- `modern_pharmacology_zh` (3 條):
  1. 降血糖作用 (Hypoglycemic Effect - Atractyloside 蒼耳子甙)
  2. 抑菌與抗過敏 (Antibacterial & Anti-allergic)
  3. 鎮痛與抗發炎 (Analgesic & Anti-inflammatory)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (3 條,另一份清單): ["Analgesic activity","Lowers blood glucose","Antibacterial and antiviral activity"]

### 石膏 `herb.shi_gao`
- `modern_pharmacology_zh` (3 條):
  1. 顯著解熱作用 (Significant Antipyretic Effect)
  2. 調節汗腺與鎮靜作用 (Sedative & Diaphoretic Regulation)
  3. 外用促進創面愈合與止血 (Wound Healing & Hemostatic)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (3 條,另一份清單): ["Hypoglycemic activity","Anti-inflammatory activity","Analgesic activity"]

### 車前子 `herb.che_qian_zi`
- `modern_pharmacology_zh` (4 條):
  1. 顯著利尿作用 (Diuretic Effect - Plantaginin 車前苷)
  2. 祛痰與鎮咳作用 (Expectorant & Antitussive)
  3. 緩和瀉下與腸道潤滑 (Laxative & Mucilage)
  4. 降血壓與抗發炎 (Anti-hypertensive & Anti-inflammatory)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (4 條,另一份清單): ["Analgesic activity","Antibacterial and antiviral activity","Lipid-lowering activity","Anti-inflammatory and analgesic activity"]

### 五味子 `herb.wu_wei_zi`
- `modern_pharmacology_zh` (4 條):
  1. 顯著保肝與降低 ALT 轉氨酶 (Hepatoprotective - Schisandrin 五味子素)
  2. 中樞神經系統雙向調節與抗疲勞 (CNS Regulation & Anti-fatigue)
  3. 強心與抗氧化作用 (Cardiotonic & Antioxidant)
  4. 增強免疫力與抗應激 (Immunity Enhancement)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (4 條,另一份清單): ["Antioxidant activity","Anti-inflammatory activity","Antitumor and cancer-preventive activity","Hepatoprotective and cholagogic activity"]

### 赤石脂 `herb.chi_shi_zhi`
- `modern_pharmacology_zh` (3 條):
  1. 胃腸黏膜吸附保護作用 (GI Adsorbent & Protection - Aluminum Silicate 矽酸鋁)
  2. 顯著止血作用 (Hemostatic Effect)
  3. 吸附細菌毒素與止瀉 (Absorb Bacterial Toxins)
- `modern_pharmacology_en` 現況: **空**
- 不可挪用的鄰欄 `modern_functions_en` (3 條,另一份清單): ["Astringent hemostatic activity","Gastric mucosal protection","Antidiarrheal activity"]


## 群組 2 — functions_zh 與 actions_en 長度不符(6 張)

### 糯稻根 `herb.nuo_dao_gen`  (zh=3 / en=2)
- 中文:
  1. 固表止汗
  2. 益胃生津
  3. 退虛熱
- 英文:
  1. Astringes deficiency sweating
  2. Reduces low-grade deficiency fever

### 梨皮 `herb.li_pi`  (zh=2 / en=3)
- 中文:
  1. 清心潤肺
  2. 降火生津
- 英文:
  1. Moistens the Lung and clears Heat
  2. Generates fluids and relieves thirst
  3. Transforms Phlegm and stops cough

### 珍珠母 `herb.zhen_zhu_mu`  (zh=3 / en=5)
- 中文:
  1. 平肝潛陽
  2. 清肝明目
  3. 鎮驚安神
- 英文:
  1. Pacifies the Liver and anchors ascendant Yang
  2. Calms the Spirit and settles fright
  3. Clears the Liver and improves vision (course entry: similar to abalone shell, ranked as a second-line herb)
  4. Promotes healing and reduces itching (topical use for eczema and non-healing sores)
  5. Neutralizes stomach acid and relieves pain (similar to Mu Li; for peptic ulcer/acid regurgitation and stomach pain)

### 寒水石 `herb.han_shui_shi`  (zh=2 / en=3)
- 中文:
  1. 清熱瀉火
  2. 除煩止渴
- 英文:
  1. Clears Heat and drains Fire
  2. Relieves irritability and thirst
  3. Benefits the throat and clears Heat swelling (course entry: sore throat, red eyes [burning]; skin: burns, sores, oral ulcers)

### 硝石 `herb.xiao_shi`  (zh=2 / en=3)
- 中文:
  1. 破堅散積
  2. 利尿瀉下
- 英文:
  1. Promotes urination and relieves constipation
  2. Drains Heat and dissipates clumps
  3. Resolves toxicity and reduces swelling

### 青木香 `herb.qing_mu_xiang`  (zh=2 / en=1)
- 中文:
  1. 行氣止痛
  2. 解毒消腫
- 英文:
  1. Moves Qi and relieves pain (historical action)

