# COND_FULLDETAIL_EYESON_01 — 全細節病症卡人眼審查（第 1–30 筆）

狀態：**findings ledger + 修正紀錄。** 原始審查（本檔案 §0–§3 主文）沒有動
`data/**` 一個字元；下方每條 finding 的狀態列是後續修正批次補記的。
Branch：`codex/cond-eyeson-1`（自 `origin/codex/pattern-v2` tip `e3dabd4`）
日期：2026-08-12

## 修正狀態總覽（2026-08-12，branch `codex/cond-eyeson-fixes-1`）

| Finding | 狀態 | commit |
|---|---|---|
| F-01 breech_presentation（SAFETY） | **RELOCATED**（止血；BL67 處方重建仍 OPEN，需 Ting） | `e8843e1` |
| F-02 depression（SAFETY） | **RELOCATED**（etiology/western_pathology 四欄搬走留空；`aliases_zh` 的「神經衰弱」問題仍 OPEN，需 Ting） | `e8843e1` |
| F-03 chronic_gastritis 部落格汙染 | OPEN（需 Ting 先看過） | — |
| F-04 asthma 部落格汙染 + 穴位格式 | OPEN（需 Ting 先看過；穴位 id 格式問題見 F-17） | — |
| F-05 bells_palsy 解剖錯誤 + 證型連結 | **FIXED** | `b2a1365` |
| F-06 cervical_spondylosis 方劑/穴位傾倒 | OPEN（需 Ting 先看過；`import_artifacts` 已示範正確流程，未擴大處理） | — |
| F-07 樣板治療區塊（8 筆／全庫 74 筆） | OPEN（`cond.breech_presentation` 因孕期安全已優先處理，見 F-01；其餘 7 筆＋全庫 66 筆仍 OPEN，是產品層取捨，需 Ting） | — |
| F-08 bppv red flag 分級 | **FIXED** | `b2a1365` |
| F-09 diminished_ovarian_reserve red flags 混入非安全條目 | OPEN | — |
| F-10 acupuncture_scope 來源誤植（5 筆） | **FIXED** | `b2a1365` |
| F-11 red flag 來源為不可回溯通則（2 筆） | OPEN | — |
| F-12 eczema evidence 分級錯誤 | **FIXED** | `b2a1365` |
| F-13 aneurysm 譯名 | OPEN | — |
| F-14 etiology 與 risk_factors 重複 | OPEN | — |
| F-15 acute_pancreatitis 中英強度不一致 | **FIXED** | `b2a1365` |
| F-16 `&hellip;` 殘留（4 筆） | **FIXED** | `b2a1365` |
| F-16 `classical_references_en` 全缺（5 筆） | OPEN（需 Ting 決定：翻譯／暫留單邊／整欄留空） | — |
| F-17 `acupoint_protocols` 兩種 shape／非正規 code（4 筆） | OPEN | — |
| F-18 chronic_low_back_pain 樣板只清了一半 | OPEN | — |

**未做（本輪修正範圍聲明）**：只處理派工單指名的 B1–B6（13 筆機械修正）與
F-01／F-02 兩個 SAFETY 止血。沒有讀第 31–92 筆。沒有處理 F-07 全庫 74 筆
樣板治療區塊（產品取捨，需 Ting）、F-03/F-04/F-06 的部落格內文搬遷（每筆
3000–5000 字，需 Ting 先看過）、F-16 的 `classical_references_en` 翻譯缺口、
F-17 的穴位 id 格式映射。

---

## §0 範圍與方法

### 取樣

```bash
node scripts/audit-cr010-condition-detail-maturity.js
# → tmp/cr010/cr010_condition_detail_maturity_live.json
#   live_condition_count 505 / full_detail_count 92 / partial 70 / skeleton 343
```

取 `maturity === "FULL_DETAIL_CANDIDATE"` 的 92 筆，依 **id 字母序** 取前 30 筆
（`cond.achilles_tendinopathy` … `cond.eczema`）。

### 方法

每一筆從 `data/pathology/condition_canon_shortlist.json` 完整取出、格式化後**整份逐行讀完**
（不是抽樣、不是 grep）。判準依派工單六項：
假中文/隱形英文 · 中英不忠實 · 臨床胡說 · 樣板句 · 錯位內容 · 來源紀律。

輔助用機器掃描只用來**量化已用眼睛確認的問題有多廣**，不用來取代閱讀：

```bash
# 樣板 TCM 區塊的全庫散佈
tcm_patterns 完全等同「氣血不和證/八珍湯 + 臟腑虛弱證/補中益氣湯」：74 / 505 筆（前 30 筆中 8 筆）
acupoint_protocols 完全等同 ["足三里 (ST36)","合谷 (LI4)","三陰交 (SP6)","中脘 (CV12)"]：71 / 505（前 30 筆中 7 筆）
herb_formulas 完全等同 ["八珍湯","補中益氣湯","柴胡疏肝散"]：73 / 505（前 30 筆中 8 筆）

# 已知樣板句（憲法紅線 6）在這 30 筆中的殘留
western_pathology_zh === "相關系統功能障礙及發炎或代謝異常導致的臨床症狀。"：全庫 39 筆，**前 30 筆中 0 筆**
etiology_zh === "正氣不足，臟腑功能失調，氣血津液運化不利。"：全庫 39 筆，**前 30 筆中 0 筆**
```

→ 派工單點名的那一族樣板句，在這 30 筆裡**已經清乾淨**；
但**另一族樣板（TCM 治療區塊）完全沒被處理**，而且它比句子型樣板危險，因為它長得像處方。

### 保守原則

只列**能引用原文並說出為什麼錯**的項目。純風格差異（句子長短、標點、行文語氣一致性）不列。
`red_flags` 舊式字串陣列 vs 新式五欄結構的混用，屬 schema 演進，只在 §1 標註，不單獨列為缺陷。

---

## §1 逐筆判定（30 筆）

| # | id | 判定 | 一行說明 |
|---|---|---|---|
| 1 | `cond.achilles_tendinopathy` | **DEFECT** | 治療區塊三欄全是與 7 個不相干病共用的樣板（八珍湯／ST36-LI4-SP6-CV12），跟腱一個字都沒有 |
| 2 | `cond.acute_lumbar_sprain` | **DEFECT** | 同一組樣板；急性腰扭傷的穴位處方裡沒有任何一個腰部局部穴 |
| 3 | `cond.acute_pancreatitis` | MINOR | `acupuncture_scope` 中英強度不一致（「不適用」vs "not a routine presentation"） |
| 4 | `cond.addison_disease` | CLEAN | 病因/病理/紅旗/範圍全部具名 NIDDK 分頁，co_management 明寫不得建議自行停類固醇 |
| 5 | `cond.allergic_rhinitis` | MINOR | 四條 red flag 的 source 是「標準耳鼻喉科警示症狀原則」這種不可回溯的通則；field_sources 缺 etiology/western_pathology |
| 6 | `cond.amenorrhea` | **DEFECT** | 同一組樣板治療區塊；閉經卡的方劑是八珍湯／補中益氣湯／柴胡疏肝散 |
| 7 | `cond.anemia` | CLEAN | etiology 明寫「機轉 ≠ 危險因子」並分欄；紅旗五欄具名 NHLBI |
| 8 | `cond.aneurysm` | MINOR | 「二尖瓣主動脈瓣」譯名易與 mitral valve 混淆；`etiology_zh` 實質是危險因子清單 |
| 9 | `cond.angina_pectoris` | MINOR | `etiology` 與 `risk_factors` 四項逐條重複；冠狀動脈痙攣標 `modifiable:false` |
| 10 | `cond.anxiety` | **DEFECT** | 樣板治療區塊 + `field_sources.acupuncture_scope_*` 把針灸範圍歸給 NIMH，該欄自己的 note 卻說查不到針灸指引 |
| 11 | `cond.asthma` | **DEFECT** | `etiology_zh` 是未清洗的部落格全文：`[@post:43]`、`&hellip;`、章節編號「一二二三四六」、無來源的經絡統計、50 筆方劑傾倒、33 穴非正規 code |
| 12 | `cond.bells_palsy` | **DEFECT** | 「莖乳突神經」為不存在的解剖構造且與 `_en` 不符；`related_patterns` 指向風寒**犯肺**；`&hellip;`；古籍欄只有 `_zh` |
| 13 | `cond.bppv` | MINOR | 自發持續性眩暈被標成 `urgency_level: routine` |
| 14 | `cond.breech_presentation` | **DEFECT（SAFETY）** | 胎位不正卡的 `acupoint_protocols` 是樣板的合谷＋三陰交；真正的至陰 BL67 不在清單裡 |
| 15 | `cond.bronchiectasis` | CLEAN | 紅旗分級合理，範圍欄明寫不能取代抗生素與氣道廓清 |
| 16 | `cond.carpal_tunnel` | **DEFECT** | 樣板治療區塊；腕隧道的穴位處方是 ST36/LI4/SP6/CV12，沒有任何腕部局部穴 |
| 17 | `cond.celiac_disease` | CLEAN | 明寫檢驗須在仍攝取麩質時完成，範圍欄明寫不得取代無麩質飲食 |
| 18 | `cond.cervical_spondylosis` | **DEFECT** | 方劑清單含不存在的「鼻良湯」；38 方 + 35 穴傾倒；`&hellip;`；`import_artifacts` 引用不存在的模板章節 |
| 19 | `cond.chronic_gastritis` | **DEFECT** | 病因/病理是部落格原文：會員自行針灸軼事、`[@ad:1]`、無來源的「26%」、殘句「功能性消化不」、簡體慣用語；方劑清單含十棗湯 |
| 20 | `cond.chronic_hepatitis_b` | CLEAN | 含免疫抑制前未篩檢 → 再活化這條實務紅旗，凝血/血小板注意事項具體 |
| 21 | `cond.chronic_kidney_disease` | CLEAN | 範圍欄明寫「不可在透析瘻管處針刺或拔罐」，是本批最具體的安全條款之一 |
| 22 | `cond.chronic_low_back_pain` | MINOR | `import_artifacts` 已正確搬走樣板句並補上專屬內容，但樣板治療區塊仍在，`acupoint_protocols` 是空陣列 |
| 23 | `cond.cirrhosis` | CLEAN | 失代償相關紅旗齊全，範圍欄點名血小板低下與拔罐風險 |
| 24 | `cond.cushing_syndrome` | CLEAN | 明確區分庫欣症候群 vs 庫欣病；紅旗含驟停類固醇 → 腎上腺危象 |
| 25 | `cond.deep_vein_thrombosis` | CLEAN | 範圍欄明寫「新發腫脹疼痛肢體在評估前不得按摩/拔罐/刮痧」——本批寫得最好的一條 |
| 26 | `cond.depression` | **DEFECT（SAFETY）** | 整個 `etiology_zh`/`western_pathology_zh` 寫的是神經衰弱，內含「旁人可能會誤以為是憂鬱症」與「你沒有病」等淡化語句 |
| 27 | `cond.diminished_ovarian_reserve` | **DEFECT** | 樣板治療區塊；`red_flags` 混入「合併停經症狀影響生活品質」這種非安全條目 |
| 28 | `cond.diverticular_disease` | CLEAN | 紅旗涵蓋穿孔/大量出血/阻塞，並正確使用 `same_day` 級別 |
| 29 | `cond.dry_eye` | MINOR | red flag source 為「標準眼科警示症狀原則」通則；field_sources 缺 etiology/western_pathology |
| 30 | `cond.eczema` | MINOR | `acupuncture_scope.evidence` 標 `label_derived`，但內容並非從藥品標籤推導 |

**合計：CLEAN 10 · MINOR 8 · DEFECT 12。**

---

## §2 逐項發現（所有 MINOR / DEFECT）

嚴重度：**SAFETY**（可能直接導致病人受傷或延誤）· **CLINICAL**（臨床上錯，會誤導判斷）· **QUALITY**（可信度/可追溯性受損）

---

### F-01 · SAFETY · `cond.breech_presentation` · `acupoint_protocols` + `herb_formulas`

**原文：**

```json
"acupoint_protocols": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)", "中脘 (CV12)"],
"herb_formulas": ["八珍湯", "補中益氣湯", "柴胡疏肝散"]
```

**為什麼錯：**
這是一張妊娠晚期的卡（`icd_hint: "O32.1"`，`summary_zh` 明寫「妊娠晚期胎兒非頭位」）。
合谷與三陰交是所有標準教材中孕期禁針/慎針的代表穴組（傳統歸為催產、下胎作用），
把它們當成這張卡的「穴位處方」直接呈現在診間畫面上，是把慎用穴呈現成建議穴。

同一張卡的 `acupuncture_scope_zh.can_treat` 寫的是正確做法：

```
"部分執業者於特定孕週（依訓練與臨床判斷）以艾灸至陰穴（BL67）作為胎位轉正之輔助嘗試"
```

但 **BL67（至陰）完全不在 `acupoint_protocols` 裡**。也就是說：
唯一正確的穴只出現在散文欄位，錯誤的穴出現在結構化處方欄位。
`§8.1 小卡` 規格會渲染關聯計數與處方，這個錯誤會被放大到列表層。

方劑同理：柴胡疏肝散／補中益氣湯不是胎位不正的處方，也未經孕期適用性標註。

**建議修法：** 先把 `acupoint_protocols`／`herb_formulas`／`tcm_patterns` 三欄的樣板內容
搬到 `import_artifacts`（照 §0「只加深不刪除」，先搬再清），再依 `acupuncture_scope`
既有內容重建為 `["至陰 (BL67)"]` 並註明艾灸、孕週與產科協同條件；方劑欄留空比留錯好。

---

### F-02 · SAFETY · `cond.depression` · `western_pathology_zh` / `etiology_zh` / `aliases_zh`

**原文（`western_pathology_zh` 節錄）：**

```
反應變慢，對周遭的人事物漠不關心，這讓旁人可能會誤以為是憂鬱症。
…
這種狀態常被歸類為「精神官能症」、「自律神經失調」或「身心症」。但是到醫院檢查，
常會得到一個讓人哭笑不得的答案：「你沒有病！」讓人更感到無助。
這時候，中醫提供了另一種角度來看待和治療神經衰弱，提供另一條全新的思路！
```

**為什麼錯：**
三層問題疊在同一張卡上。

1. **錯位內容（整筆等級）**：`etiology_zh` 與 `western_pathology_zh` 寫的都是**神經衰弱**，不是重度憂鬱症。
   記錄自己的 `field_sources` 已經自承：
   `"CloudTCM disease record (content currently describes neurasthenia/自律神經失調 — topic-mismatch flagged, not corrected this batch)"`。
   自承不等於已修：卡片仍會照樣渲染。
2. **臨床上危險**：這是一張 `red_flags` 第一條寫著「自殺意圖／計畫 → 立即精神科／急診評估」的卡。
   同一張卡的病理欄卻在告訴讀者「旁人可能會誤以為是憂鬱症」、「醫院會說你沒有病」、
   「中醫提供另一條全新的思路」。這直接抵銷了自己紅旗欄的轉診指令。
3. **一對一等同（違反 §1 / 模板 §10.1）**：`aliases_zh: ["重度憂鬱症", "神經衰弱"]`
   把神經衰弱登記成 MDD 的別名——這正是內容錯位的根。

另有同筆內的次級問題（併入本條處理）：

- `herb_formulas` 含 **「半夏白朮麻湯」**——`data/herbs/formulas.json` 查無此名，正名為
  **半夏白朮天麻湯**（該檔中存在），是掉字的爬蟲殘留。
- `herb_formulas` 含 **虎潛丸**（歷史配方含虎骨，屬管制/不可得藥材），未加任何註記。
- `classical_references_zh` 有內容但無 `classical_references_en` → C5 雙語缺口。
- `field_sources.acupuncture_scope_zh/_en` 標 `"NIMH — Depression"`，但該欄自己的
  `note` 是「尚未查到專屬於重度憂鬱症的針灸療效臨床指引」。NIMH 沒有寫過針灸範圍。

**建議修法：** 這一筆不適合小修。先把 `etiology_zh`/`western_pathology_zh` 現文整段搬進
`import_artifacts`（原因寫明「內容為神經衰弱，非 MDD」），欄位留空（留空比留錯誠實）；
`aliases_zh` 移除「神經衰弱」，另立 `cond.*` 或 `tdis.*` 記錄並用 `possible_overlap` 連結。
**這一筆建議 Ting 先看過再動。**

---

### F-03 · CLINICAL · `cond.chronic_gastritis` · `etiology_zh` / `western_pathology_zh`

**原文（節錄）：**

```
2022年1月時某會員住在馬來西亞回報，他早上直反胃，肚子脹了半天，頭暈目眩、四肢無力，
什麼都不想動，就是出現鐵三角經絡型態。
他突然間想到用「八卦耳療」+「針灸」來解決，生平第一次針灸自己身上大腸經、胃經與肝經的
合谷穴、足三里與太衝穴，按壓和下針之後，上下一直排濁氣了，也不頭暈了，感到超舒服，
自己成功改善健康危機。
```

```
三、胃部虛寒
上面提到的胃熱，其實出現的機率只有大約26%…
```

```
所以真正的殺手是「肝」，也可以直接從肝下手治療，「小柴胡湯」或「四逆散」就是一個好的
下手處。[@ad:1]
```

**為什麼錯：**

- **臨床安全**：一則「生平第一次針灸自己身上」的病人自行針刺軼事，出現在執業者診間會打開的卡片上，
  且被描述為成功案例。這不是內容，是廣告文案，而且示範的是不安全行為。
- **虛構數字**：「大約26%」沒有任何來源（憲法紅線 4：劑量/比例類數字必須具名來源）。
  `field_sources` 對這兩欄只給了一個 CloudTCM 首頁 URL。
- **爬蟲殘留**：`[@ad:1]` 是未清除的廣告嵌入短碼。
- **商業品牌汙染**：「雲端中醫」在這兩欄出現 6 次以上。
- **殘句 / 譯名漂移**：`「最常見於胃食管反流病、功能性消化不、慢性胃炎」`——
  「功能性消化不」是**掉字**（應為功能性消化不良）；「胃食管反流病」是簡體圈慣用語，
  而同一張卡的 `western_context_zh` 用的是「胃食道逆流」，同卡兩套術語。
  同段的「抑鬱症」亦與卡內他處的「憂鬱」不一致。
- **圖說變正文**：「肝經實證時，脾經容易出現虛證」等句是原網頁的圖片說明，被當成段落留下。

另：`herb_formulas` 含 **十棗湯**（甘遂/大戟/芫花，峻下逐水，主治懸飲），
出現在胃炎方劑清單中屬錯位，且是本批唯一列出的毒性峻劑而無任何註記。

**建議修法：** 兩欄整段搬 `import_artifacts`（`cond.cervical_spondylosis` 與
`cond.chronic_low_back_pain` 已建立此先例，照抄流程），再依 NIDDK 重寫；
`herb_formulas` 需重新策展或整欄留空。

---

### F-04 · CLINICAL · `cond.asthma` · `etiology_zh` / `western_pathology_zh` / `classical_references_zh`

**原文（節錄）：**

```
現代人普遍是脾虛的，到了冬天之後又加上腎虛時，就有機會出現氣喘或是其他肺部疾病，
最常見的是咳嗽。[@post:43]
```

```
既然多數小孩在小時候感冒之後就開始氣喘，可以有很合理的懷疑這是感冒沒治好的後遺症。
```

```
從大量經絡數據也可以看出，現代人普遍肺經、大腸經與三焦經實證…
```

```
《景岳全書．喘促》：「關格之證為喘者，&hellip;其病必虛裡跳動而氣喘不已。」
```

**為什麼錯：**

- `[@post:43]`、`[@post:182]`：CMS 短碼，隱形英文/爬蟲殘留。
- `&hellip;`：未解碼 HTML entity，會原樣顯示在古籍引文中（同一問題見 F-05、F-06）。
- **章節編號結構壞掉**：`一、` `二、` `二、` `三、` `四、` `六、`——「二」出現兩次、缺「五」。
- **無來源的實證宣稱**：「從大量經絡數據也可以看出…」屬經絡量測統計，
  `field_sources` 只給 CloudTCM URL，等於沒有來源（憲法紅線 9：不把不確定寫成確定）。
- **臨床上不可接受的因果推論**：「可以有很合理的懷疑這是感冒沒治好的後遺症」——
  這句在 `western_pathology_zh`（西醫病理生理欄）裡，而且 `western_pathology_en`
  **並未翻譯這句**（en 只寫 "modern medicine treats airway infection as closely linked to asthma onset"）。
  中英不忠實，而且錯的那一邊是中文。
- **孤兒圖說**：「肺經、大腸經與三焦經的連動性高，與肺部疾病相關」「冬季發生腎虛氣喘的機率很高」。
- `classical_references_zh` 有內容、無 `_en` → C5。

**同筆結構性問題（併入）：**

- `acupoint_protocols` 是 33 個穴的物件陣列（**與其他 29 筆的字串陣列 shape 不同**），
  且 code 用 `LI01` / `LV14` / `DU09` / `REN04` / `SJ05` / `KI01` / `LV03` 這套非正規格式。
  憲法紅線 1 鎖定的是 `SP6` / `LI4` 這種格式；`LV`→`LR`、`DU`→`GV`、`REN`→`CV`、`SJ`→`TE`、補零。
  這些 id **接不上 `point_id_manifest.json`**。
- `herb_formulas` 50 筆，含桂枝茯苓丸、麻子仁丸、豬苓湯、芍藥甘草湯、酸棗仁湯——
  這是原始抓取結果，不是氣喘方劑清單。
- `field_sources.acupuncture_scope_*` 標 `"NHLBI — Asthma Treatment and Action Plan"`，
  但該欄 note 自承「尚未查到專屬於氣喘的針灸療效臨床指引」。

---

### F-05 · CLINICAL · `cond.bells_palsy` · `western_pathology_zh` + `related_patterns`

**原文：**

```json
"western_pathology_zh": "莖乳孔內莖乳突神經非特異性炎症導致的面神經麻痺，引起面部表情肌癱瘓。",
"western_pathology_en": "Nonspecific inflammation of the facial nerve within the stylomastoid canal causes facial nerve palsy with paralysis of the facial expression muscles."
```

**為什麼錯：**
**「莖乳突神經」不是一個存在的解剖構造。** 莖乳突（stylomastoid）是孔/動脈的名字，
發炎的是**顏面神經（facial nerve）本身**——`_en` 寫對了（"the facial nerve"），
`_zh` 寫錯了。這同時是臨床錯誤與中英不忠實，而且錯在中文側。
（次要：`_en` 的 "stylomastoid canal" 亦應為 facial canal / 莖乳突孔。）

**同筆第二個臨床錯誤：**

```json
"related_patterns": ["pattern.wind_cold_invading_lung", ...]
```

貝爾氏麻痺被連到**風寒犯肺**。同一張卡自己的 `tcm_patterns` 寫的是 **「風寒襲絡證」**，
而 `pattern_registry.json` 裡 **`pattern.wind_cold_invading_collaterals`（風寒襲絡）確實存在**。
連錯證型會讓「肝陽上亢 → 出現在哪些病」這種反向導覽整條走偏。

**建議修法：** `related_patterns` 的 `pattern.wind_cold_invading_lung` 改為
`pattern.wind_cold_invading_collaterals`；`western_pathology_zh` 的「莖乳突神經」改「顏面神經」。
兩處都是一詞替換，可入即時修正批次。

**同筆其他：** `classical_references_zh` 內 5 處 `&hellip;`；該欄無 `_en`（C5）；
`field_sources.acupuncture_scope_*` 標 `"MedlinePlus — Bell palsy"`，但該欄 note 自承查無針灸指引。

---

### F-06 · CLINICAL · `cond.cervical_spondylosis` · `herb_formulas` + `acupoint_protocols`

**原文（`herb_formulas` 末項）：**

```json
"herb_formulas": [..., "金沸草散", "蠲痹湯", "鼻良湯"]
```

**為什麼錯：**
**「鼻良湯」在 `data/herbs/formulas.json`（224 筆）查無，也不是任何標準方名。**
從字形看是爬蟲斷詞造成的殘片。一個不存在的方名出現在頸椎病的方劑清單末端，
點進去會是死連結，而且它會讓整份清單的可信度歸零。

同清單另有 38 個方，含大陷胸丸、龍膽瀉肝湯、少腹逐瘀湯、白虎加人參湯——
與頸椎退化無關，屬原始抓取傾倒。（`蠲痹湯`／`大活絡丹`／`金沸草散`／`雙解散`／`瓜蔞桂枝湯`
亦不在 formulas.json，但這些是真實方名，屬未建卡而非造字，只需標記待建。）

`acupoint_protocols` 35 個穴、物件 shape、非正規 code（`LI04`/`SJ15`/`DU16`/`LV03`/`SP06`/`KI01`…），
問題與 F-04 相同，且清單含湧泉、太白、少府、三陰交——不是頸椎病處方。

**加分項須記錄：** 這一筆的 `import_artifacts` 是全批做得最對的一件事——
把 CloudTCM 部落格原文（含會員軼事、廣告碼）從 `etiology_zh`／`western_pathology_zh`
**先搬再清**，並附 `reason` 與 `moved_at`。這正是 §0 第 1 條的正確操作，其他爬蟲汙染卡應照抄。

**QUALITY 附註：** `import_artifacts[].reason` 引用
`"CONDITION_CARD_TEMPLATE §3.5.5"`——模板沒有 §3.5.5（有 §3.5、§5.5、§5.6）。交叉引用寫錯。

---

### F-07 · CLINICAL · 樣板治療區塊（8 筆共用同一組處方）

**受影響（本批 30 筆中）：**
`cond.achilles_tendinopathy` · `cond.acute_lumbar_sprain` · `cond.amenorrhea` ·
`cond.anxiety` · `cond.breech_presentation`（見 F-01） · `cond.carpal_tunnel` ·
`cond.chronic_low_back_pain` · `cond.diminished_ovarian_reserve`

**原文（八筆完全逐字相同）：**

```json
"tcm_patterns": [
  {"pattern_zh": "氣血不和證", "formula_zh": "八珍湯",
   "acupoints_zh": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)"]},
  {"pattern_zh": "臟腑虛弱證", "formula_zh": "補中益氣湯",
   "acupoints_zh": ["中脘 (CV12)", "氣海 (CV6)", "脾俞 (BL20)"]}
],
"acupoint_protocols": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)", "中脘 (CV12)"],
"herb_formulas": ["八珍湯", "補中益氣湯", "柴胡疏肝散"]
```

**為什麼錯：**

1. **憲法紅線 6**：「多筆記錄共用同一句話比留空更糟，因為留空至少誠實。」
   這裡共用的不是一句話，是一整組**處方**。全庫散佈 74/71/73 筆（見 §0），本批中 8 筆。
2. **臨床上是空話**：跟腱病變、急性腰扭傷、繼發性閉經、廣泛性焦慮症、腕隧道症候群
   得到同一組穴。腰扭傷沒有腰部穴，腕隧道沒有腕部穴。這不是「內容較淺」，
   而是把「沒有內容」偽裝成「有處方」。
3. **會被小卡放大**：模板 §8.1 規定小卡顯示關聯計數。這 8 張卡在列表上都會顯示
   「4 穴位 · 3 方劑」，看起來完整度一樣，實際上都是同一份空殼。
4. **`cond.anxiety`**：`related_patterns` 其實已經填了正確的四個證型
   （肝鬱、心陰虛、心腎不交、心脾兩虛），但 `tcm_patterns` 樣板寫的是「氣血不和證」，
   兩欄互相矛盾。
5. **`cond.chronic_low_back_pain`**：`import_artifacts` 已經正確處理掉句子型樣板，
   卻漏掉這一組；且 `acupoint_protocols` 是 `[]`，與 `tcm_patterns` 內的樣板穴不一致。

**建議修法：** 這 8 筆（以及全庫 74 筆）的正確處置是**同一個批次動作**：
三欄樣板內容搬進 `import_artifacts`，欄位留空，等待逐病策展。
`cond.breech_presentation` 因是孕期卡，須**優先**（見 F-01）。

---

### F-08 · CLINICAL · `cond.bppv` · `red_flags_zh[2]` / `red_flags_en[2]`

**原文：**

```json
{
  "finding": "頭位誘發之外，眩暈呈自發性持續狀態",
  "urgency_level": "routine",
  "recommended_action": "重新評估診斷，考慮其他前庭或中樞疾病"
}
```

**為什麼錯：**
自發、持續（非姿勢誘發）的眩暈，正是**必須排除後循環中風／前庭神經炎**的表現型，
也是同一張卡 `western_context_zh` 自己列為 `中樞性陣發性位置性眩暈（少見但需警覺）` 的情境。
把它放進 `red_flags`（安全層）卻標成五級中最低的 `routine`，等於在安全欄位裡對一個
需要當日排除中樞病因的表現說「例行處理」。同卡其他兩條（持續神經缺損、複視/新發劇烈頭痛）
都正確標成 `urgent`，唯獨這條落差。

**建議修法：** `urgency_level` 由 `routine` 改為 `urgent`，`recommended_action`
補上「當日神經學評估以排除中樞病因」。單欄修改，可入即時修正批次。

---

### F-09 · CLINICAL · `cond.diminished_ovarian_reserve` · `red_flags_zh` / `red_flags_en`

**原文：**

```json
"red_flags_zh": [
  "40 歲前出現卵巢功能不全徵象（潮熱、停經）需評估卵巢早衰",
  "計畫生育者宜及早轉介生殖專科討論時效性",
  "合併停經症狀影響生活品質"
]
```

**為什麼錯：**
第 1 條是合格的 red flag。第 2、3 條不是——「宜及早轉介討論時效性」是照護建議，
「合併停經症狀影響生活品質」是症狀描述，兩者都沒有「什麼時候該停手」的意涵。
模板 §5 明定 red flags 是「告訴讀者什麼時候該停手轉診」的欄位；
把非安全條目混進來，會稀釋小卡上「⚠ 3 red flags」這個計數的意義
（模板 §8.1 明定小卡必須顯示 red flag 數量與最高等級）。

**建議修法：** 第 2、3 條移到 `acupuncture_scope.co_management`（該欄已有類似文字，可合併）；
red_flags 保留第 1 條，並升級為五欄結構。

---

### F-10 · QUALITY · `field_sources` 把針灸範圍歸給不談針灸的來源（5 筆）

**受影響：** `cond.anxiety` · `cond.asthma` · `cond.bells_palsy` · `cond.chronic_gastritis` · `cond.depression`

**原文（以 `cond.anxiety` 為例，同一筆內互相矛盾）：**

```json
"field_sources": {
  "acupuncture_scope_zh": ["NIMH — Anxiety Disorders (Generalized Anxiety Disorder section)"]
}
```

```json
"acupuncture_scope_zh": {
  "source": "AcuTing OS Disease Knowledge Research Pack — Batch J Mental/Behavioral（依據 NIMH 臨床資料整理）",
  "note": "尚未查到專屬於 GAD 的針灸療效臨床指引，此為執業範圍謹慎建議"
}
```

**為什麼錯：**
`field_sources` 是模板 §3.4 的逐欄位出處，也是模板 §8.2 第 ⑧ 段要渲染給讀者看的東西。
NIMH／NHLBI／MedlinePlus／NIDDK 沒有任何一頁寫過針灸執業範圍。
把針灸範圍的出處標成這些機構，等於**替 NIH 掛名一段它沒說過的話**——
而且同一筆記錄的欄內 `source` 與 `note` 已經誠實寫了真正的出處與「查不到」。
兩處不一致時，被渲染出去的是錯的那一處。

其餘 25 筆的做法是對的：`field_sources.acupuncture_scope_*` 填
`"AcuTing OS Disease Knowledge Research Pack — …"`。所以這是 5 筆的漂移，不是全域設計問題。

**建議修法：** 這 5 筆的 `field_sources.acupuncture_scope_zh/_en` 改抄該欄自己的
`source` 值。純機械修正，最適合做第一個即時批次。

---

### F-11 · QUALITY · red flag 的來源是不可回溯的通則（2 筆）

**受影響：** `cond.allergic_rhinitis`（4 條全部） · `cond.dry_eye`（3 條全部）

**原文：**

```json
{"finding": "頭部外傷後清澈鼻水（疑似腦脊髓液鼻漏）", "urgency_level": "emergency",
 "source": "標準耳鼻喉科警示症狀原則"}
{"finding": "眼睛劇痛合併畏光及視力下降", "urgency_level": "emergency",
 "source": "標準眼科警示症狀原則"}
```

**為什麼錯：**
內容本身臨床上是對的（顱底骨折疑似 CSF 漏、角膜潰瘍都確實是急症）。
問題在 `source` 欄：「標準耳鼻喉科警示症狀原則」不是任何可以打開查證的東西。
模板 §5 明定 red flag 五欄之一是 `source`；憲法第三條第 6 點要求
「需要臨床判斷的欄位（紅旗…）查不到來源：停下來回報，不要編」。
寫一個聽起來像來源的通則，比誠實寫「查無來源、依臨床判斷」更難被後續審查抓到。

對照組：`cond.allergic_rhinitis` 第 4 條 red flag 的 source 是
`"MedlinePlus — Anaphylaxis"`——同一張卡上，一條有具名來源，三條沒有。

**建議修法：** 補具名來源，或改標為 `clinical_judgment` 並在 note 註明查證範圍
（模板 §5.6 的分級表已有 `clinical_judgment` 這個值，且明定要「明確標記為個人判斷」）。
`cond.eczema` 的第 3 條（`"標準皮膚科警示症狀原則"`）屬同一族，一併處理。

---

### F-12 · QUALITY · `cond.eczema` · `acupuncture_scope.evidence` 分級錯誤

**原文：**

```json
"acupuncture_scope_zh": {
  "evidence": "label_derived",
  "note": "尚未查到專屬於異位性皮膚炎針灸療效的臨床指引等級證據"
}
```

**為什麼錯：**
模板 §5.6 對 `label_derived` 的定義是「從**西藥標籤**的警告推導出來的謹慎
（例：抗凝劑病人近脊椎深刺）」。這一欄的內容（避開破損滲液病灶、注意感染控制、
不建議自行停用外用類固醇）沒有一條是從藥品標籤推導的，而且 note 自己說查不到指引級證據。
正確值應為 `unknown`（模板明寫「這是正確的初始值，不是缺陷」）或 `clinical_judgment`。

分級欄位標錯，比留 `unknown` 更糟——它讓一段沒有依據的文字看起來有依據。

---

### F-13 · QUALITY · `cond.aneurysm` · `risk_factors_zh` 譯名

**原文：**

```json
{"factor": "二尖瓣主動脈瓣", "direction": "increases", "modifiable": false}
```
（`_en` 對應項為 `"Bicuspid aortic valve"`）

**為什麼錯：**
「二尖瓣」在中文醫學術語中是 **mitral valve** 的固定譯名。「二尖瓣主動脈瓣」字面讀起來像
「二尖瓣＋主動脈瓣」兩個瓣膜，臨床閱讀時會產生實質歧義。
台灣慣用的標準譯名是**二葉性主動脈瓣**（或雙葉式主動脈瓣）。

保守起見標為 MINOR/QUALITY 而非 CLINICAL：這是譯名選擇問題，`_en` 側正確，
且 `western_context_zh` 對主動脈瘤的其餘內容準確（含 NHLBI 的 3 cm 閾值，中英一致）。

---

### F-14 · QUALITY · `etiology_*` 與 `risk_factors_*` 內容重複（2 筆）

**受影響：** `cond.angina_pectoris`（四項逐條對應） · `cond.aneurysm`

**原文（`cond.angina_pectoris`）：**

```
etiology_zh:  "主要機轉包含動脈粥狀硬化性冠心病、冠狀動脈微血管疾病、冠狀動脈痙攣，
               以及特定臨床情境下的氧氣供需失衡。"
risk_factors: 動脈粥狀硬化性冠心病 / 冠狀動脈微血管功能障礙 / 冠狀動脈痙攣 / 高血壓、血脂異常…
```

**為什麼錯：**
模板 §5.5 明確區分：「病因病機回答『這個病怎麼發生的』——機轉；
危險因子回答『哪些人會得、我該問什麼』——問診用」。兩欄寫同一份清單等於少一欄。

同批的 `cond.anemia` 反而把這條規則寫進了內容裡，可以直接當範本：

```
"這裡列的是「這個病怎麼發生」的機轉路徑；「哪些人容易得、問診該問什麼」的危險因子
另見下方危險因子段落，兩者不應混為一談。"
```

**次要**：`cond.angina_pectoris` 把「冠狀動脈痙攣」標成 `modifiable: false`。
血管痙攣與吸菸的關聯是既有共識，這個標記會讓「該擔心 vs 該做什麼」的分류失效
（模板 §5.5 說 `modifiable` 是這一欄最實用的部分）。

---

### F-15 · QUALITY · `cond.acute_pancreatitis` · `acupuncture_scope.can_treat` 中英強度不一致

**原文：**

```json
"acupuncture_scope_zh": {"can_treat": "不適用；急性期嚴重腹痛須優先接受西醫診斷"}
"acupuncture_scope_en": {"can_treat": "Not a routine acupuncture presentation during acute illness;
                                       severe abdominal pain warrants biomedical diagnosis first"}
```

**為什麼錯：**
中文「不適用」是絕對排除；英文 "not a routine presentation" 是「不常見」，
語意上留了一扇「非常規情況下也許可以」的門。這是一張急症卡
（五條 red flag 全部 `emergency`），安全欄位的中英強度不該有落差。
對照同批處理得對的 `cond.aneurysm`：中「針灸無法治療或縮小動脈瘤」／
英 "Acupuncture does not treat or reduce an aneurysm"，兩側一樣硬。

**建議修法：** `_en` 改為與 `_zh` 同強度（例如 "Not appropriate during the acute phase"）。

---

### F-16 · QUALITY · 古籍欄單邊（4 筆）+ HTML entity 殘留（4 筆）

**`classical_references_zh` 有內容但無 `classical_references_en`（C5 雙語缺口）：**
`cond.asthma` · `cond.bells_palsy` · `cond.cervical_spondylosis` · `cond.chronic_gastritis` · `cond.depression`（5 筆）

**`&hellip;` 未解碼（會原樣顯示）：**
`cond.asthma` · `cond.bells_palsy` · `cond.cervical_spondylosis`（含 `import_artifacts` 內） · `cond.chronic_gastritis`

**原文範例（`cond.chronic_gastritis`）：**

```
《丹溪心法》：「黃連，入痰藥用炒山梔子、黃芩為君，南星、半夏、陳皮為佐，熱多加青黛。&hellip;
肥人嘈雜，二陳湯少加撫芎、蒼朮、白朮、炒山梔子。」
```

**為什麼錯：**
`&hellip;` 是 HTML 實體，來源網頁的省略號在抓取時沒有解碼。它會原樣印在古籍引文裡，
是典型「驗證器 PASS 但眼睛一看就知道壞了」的案例。應解碼為 `…`。

`classical_references_en` 缺席違反模板 §6：「`_zh` 有內容 → `_en` 必須有內容（C5）」。
古籍原文翻譯成本高，若短期補不出來，模板 §6 也允許「寧可整個留空」——
但目前是單邊有內容，屬缺陷態。這一族建議 Ting 決定：翻譯，還是暫時接受單邊並記進豁免清單。

---

### F-17 · QUALITY · `acupoint_protocols` 兩種 shape、兩套 code 格式（4 筆）

**受影響：** `cond.asthma`(33) · `cond.cervical_spondylosis`(35) · `cond.chronic_gastritis`(13) · `cond.depression`(12)

**原文（物件 shape，非正規 code）：**

```json
"acupoint_protocols": [
  {"name_zh": "期門", "code": "LV14"},
  {"name_zh": "至陽", "code": "DU09"},
  {"name_zh": "關元", "code": "REN04"},
  {"name_zh": "外關", "code": "SJ05"}
]
```

**對照（其餘 26 筆的字串 shape，正規 code）：**

```json
"acupoint_protocols": ["睛明 (BL1)", "攢竹 (BL2)", "太陽 (EX-HN5)", "太溪 (KI3)", "光明 (GB37)"]
```

**為什麼錯：**
同一欄位在同一份檔案裡有兩種型別，任何消費端（build-data、UI、外鍵檢查）都得寫兩套分支。
更關鍵的是 code：`LV`/`DU`/`REN`/`SJ` 與補零（`LI04`、`SP06`、`KI01`）不是本專案鎖定的格式
（憲法紅線 1：`SP6` · `ex.hn3`），因此**接不上 `point_id_manifest.json`**。

**注意：這一條不是要求改 id 格式，而是指出這 4 筆用的根本不是本專案的 id。**
修法是把它們映射到正規 id（`LV14→LR14`、`DU09→GV9`、`REN04→CV4`、`SJ05→TE5`、`LI04→LI4`），
或連同 F-04/F-06 一起判定為未策展的抓取傾倒而整欄搬走。

---

### F-18 · QUALITY · `cond.chronic_low_back_pain` · 樣板只清了一半

**原文（`import_artifacts` 做對的部分）：**

```json
{
  "original_field": "western_pathology_zh",
  "text": "相關系統功能障礙及發炎或代謝異常導致的臨床症狀。",
  "reason": "Verbatim-shared boilerplate sentence duplicated across 57 other cond.* records … 
             violates constitution redline 6 (no template sentences).",
  "moved_at": "2026-08-11"
}
```

**為什麼仍列為 MINOR：**
句子型樣板清得非常正確（先搬再改、附原因、附日期），替換內容也是條件專屬且具名 NINDS。
但同一筆記錄的 `tcm_patterns` 與 `herb_formulas` 仍是 F-07 那組樣板，
而 `acupoint_protocols` 是 `[]`——結果是：`tcm_patterns` 裡有穴（ST36/LI4/SP6），
`acupoint_protocols` 卻空的，同一張卡兩欄互相矛盾。

**這一筆的價值在於它證明了修法可行**：F-03/F-04/F-06/F-07 全部可以照這個
`import_artifacts` 流程處理，不需要新發明程序。

---

## §3 統計與建議下一步

### 判定分佈（30 筆）

| 判定 | 筆數 | 佔比 |
|---|---|---|
| CLEAN | 10 | 33% |
| MINOR | 8 | 27% |
| DEFECT | 12 | 40% |

### 發現的嚴重度分佈（18 條）

| 嚴重度 | 條數 | 編號 |
|---|---|---|
| SAFETY | 2 | F-01, F-02 |
| CLINICAL | 7 | F-03, F-04, F-05, F-06, F-07, F-08, F-09 |
| QUALITY | 9 | F-10 – F-18 |

### 缺陷來源的分佈（重要）

12 筆 DEFECT 全部落在**兩個來源族**，不是隨機分佈：

| 來源族 | 筆數 | 特徵 |
|---|---|---|
| **樣板治療區塊**（F-07） | 8 | 三欄逐字相同，全庫 74 筆 |
| **未清洗的 CloudTCM 部落格抓取** | 5 | 部落格語氣、會員軼事、`[@post:]`/`[@ad:]`、`&hellip;`、方劑/穴位傾倒 |

（`cond.breech_presentation` 同時屬第一族；`cond.bells_palsy` 屬第二族但汙染程度較輕。）

**相對的，10 筆 CLEAN 全部來自 `sourced_research_pack`（NIH 系列：NIDDK / NHLBI / NIMH / NIAMS / NEI）。**
這條分界非常乾淨：**卡片品質幾乎完全由來源族決定，不由病種或批次決定。**
`cond.deep_vein_thrombosis`、`cond.chronic_kidney_disease`、`cond.addison_disease`
的 `acupuncture_scope` 已經是可以直接當範本的水準。

### 建議：立即修正批次（機械性、低風險、不需 Ting 判斷）

| 批次 | 內容 | 筆數 | 說明 |
|---|---|---|---|
| **B1** | `field_sources.acupuncture_scope_*` 改抄該欄自己的 `source` | 5 | F-10。純機械，該欄正確值就在同一筆記錄裡 |
| **B2** | `&hellip;` → `…` | 4 | F-16。單一字串替換 |
| **B3** | `cond.bells_palsy`：「莖乳突神經」→「顏面神經」；`pattern.wind_cold_invading_lung` → `pattern.wind_cold_invading_collaterals` | 1 | F-05。目標 id 已確認存在於 registry |
| **B4** | `cond.bppv` red_flag[2] `routine` → `urgent` + 補 action | 1 | F-08 |
| **B5** | `cond.eczema` `evidence` `label_derived` → `unknown` | 1 | F-12 |
| **B6** | `cond.acute_pancreatitis` `acupuncture_scope_en.can_treat` 強度對齊 `_zh` | 1 | F-15 |

B1–B6 合計動 13 筆、全部是單欄替換，改完跑
`node scripts/build-data.js` + `node scripts/validate-condition-standard.js` +
`node scripts/validate-content-junk.js` 即可。

### 建議：需要 Ting 先看過再動

| 項目 | 為什麼要先問 |
|---|---|
| **`cond.breech_presentation`（F-01）** | **最高優先。** 孕期卡上呈現合谷＋三陰交。可以先做「三欄搬 `import_artifacts` + 留空」的止血，但重建成 BL67 艾灸處方需要 Ting 確認孕週與操作條件的寫法 |
| **`cond.depression`（F-02）** | 涉及 `aliases_zh` 移除「神經衰弱」與整段內容留空。憲法第三條：覆蓋既有 canonical 內容或任何刪除，先問 Ting |
| **樣板治療區塊全庫清理（F-07）** | 影響 74 筆（本批 8 筆）。搬走等於這 74 張卡的治療區塊全部變空。這是產品層面的取捨（誠實的空 vs 假的滿），不是實作決定 |
| **CloudTCM 部落格汙染 5 筆（F-03/F-04/F-06）** | `cond.cervical_spondylosis` / `cond.chronic_low_back_pain` 已建立 `import_artifacts` 先例可照抄，但每筆要搬走 3000–5000 字，且搬完欄位會空 |
| **`classical_references_en` 全缺（F-16，5 筆）** | 模板 §6 要求成對。翻譯古籍原文成本高，Ting 需決定：翻譯 / 暫留單邊並記入豁免 / 整欄留空 |
| **不存在或掉字的方名（F-02「半夏白朮麻湯」、F-06「鼻良湯」）** | 屬 `data/herbs/**` 的所有權範圍（方劑線），本線只能回報，不能改 |

### 未做（明確聲明）

- 沒有讀第 31–92 筆全細節記錄。
- 沒有查證每一條 red flag 的臨床正確性到原始文獻層級——只查了**內部一致性**
  （中英是否一致、`source` 是否可回溯、`urgency_level` 是否與同卡其他條目自洽）。
- 沒有跑 `validate-condition-standard.js`：本次是純閱讀審查，且派工單指定驗證條件為
  「`git diff` 只有這一個新檔」。

---

*本檔為 findings ledger。`data/**` 未修改，未 push。*
