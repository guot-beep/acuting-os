# ACUPOINT_EYESON_01 — 穴位卡人眼審查（高風險 30 穴）

狀態：**findings ledger，只讀。本輪沒有動 `data/**` 一個字元。**
Branch：`codex/acupoint-eyeson-1`（自 `origin/codex/pattern-v2` tip `f1c17a70`）
日期：2026-08-12
對象：`data/acupoints/361.json`（**361 筆 records**，全部 `source_type: "sourced_cloudtcm_and_elotus"`、全部 `review_status: "draft"`）
上游對照：`HERB_EYESON_01/02`（中藥層 60 味）、`HERB_CLOUDTCM_LAYER_SCAN`（全層 predicate 掃描）

---

## §0 取樣、方法、與本層的前提

### 為什麼選這 30 穴（派工單指定的兩級優先序，可一行重現）

派工單的第一順位是「錯了臨床風險最高」。實際落成五族：

| 族 | 代碼 | n |
|---|---|---|
| **胸壁／肺尖／胸膜** | `LU1 LU2 ST12 SP21 GB21 GB22 BL13 KI27 PC1 LR14 CV17` | 11 |
| **大血管** | `ST9`（頸總動脈）`LU9`（橈動脈）`PC7`（正中神經） | 3 |
| **眼眶** | `BL1 ST1 GB1` | 3 |
| **孕期禁忌經典** | `LI4 SP6 BL60 BL67 LR3 CV3 CV4 SP1` | 8 |
| **其他具名風險 ＋ 高頻** | `GB20`（延髓）`ST17`（絕對禁針特例）`LI11`、**`ST36` `PC6`（樣板卡，當對照組）** | 5 |

```
LU1 LU2 ST12 SP21 GB21 GB22 BL13 KI27 PC1 LR14 CV17
ST9 LU9 PC7 BL1 ST1 GB1 GB20
LI4 SP6 BL60 BL67 LR3 CV3 CV4 SP1
ST17 LI11 ST36 PC6
```

**刻意把 `ST36`／`PC6` 兩張樣板卡放進來當對照組。** 中藥層最強的預測因子是
`source_type`（CloudTCM 原樣落地 vs 模板級補卡）；穴位層 361 筆的 `source_type`
**只有一個值**，那個因子在這裡完全沒有變異，無法用。樣板卡是唯一可用的對照。
這個決定在 §3.3 有回報。

**72 個 extra points 不在範圍內**（另有掃描）。`data/acupoints/extra_points.json` 未讀。

### 方法

1. `LU1 LU2 ST12 SP21` 四筆**整筆逐欄讀完**（含 `moxa_zh` `massage_zh` `moxa_en`
   `massage_en` `combine_points_en` `modern_research_en` `classical_refs` 全文），
   用來確定這一層的欄位形狀與失效型態。
2. 其餘 26 筆以**兩份聚焦攤平檔**逐行讀完：
   - 安全層（24 欄）：`location_zh/_en` `cun_measurement` `anatomy_zh/_en` `needling`
     `acumethod_zh/_en` `contraindications` `cautions_zh` `cautions` `cautions_en`
     `cautionsEn` `contraindications_en` `danger` `point_identity_zh/_en`
     `exam_pearl(_en)` `moxa_zh` `point_categories` `wushu_point` `five_shu_element`
   - 內容層（13 欄）：`functions_zh/_en` `indications_zh/_en` `action_tags_zh/_en`
     **`action_tags`（舊欄，當對照）** `disease_tags_zh/_en` `related_conditions`
     `tcm_pattern_ids` `compare_with`
3. `combine_points_zh` / `clinical_pearls` 的跨穴主張**不靠眼睛數**：從 361.json 自己
   建 `中文穴名 → channel_zh` 對照表，逐句比對「X穴為/屬…經」型敘述。
   118 條可判定的跨穴歸經主張，機器點名，**再由人眼逐條判定哪些是真錯、
   哪些是「肝俞為肝經背俞穴」這種寬鬆但不錯的講法**（見 AP-18）。
4. 機器掃描只用來**量化已經用眼睛確認過的問題有多廣**，不用來發現問題。

腳本在 scratchpad，未進 repo。全部 predicate 在 §2 各條寫明。

### 判級規則（沿用中藥／方劑層）

- **DEFECT** = 至少一項可引用原文、且有臨床後果的缺陷
- **MINOR** = 只有 QUALITY 級
- **CLEAN** = 引不出任何一條

因為本層有數條**全層級**的安全缺陷（AP-01/02/03/04），照字面判會 30/30 全 DEFECT，
對 Ting 沒有分辨力。**§1 因此給兩套判級**：一套含全層缺陷、一套只算該穴獨有的發現。

### 開讀前必須先講的一件事：本層的缺陷驗證器全部看不到

```
node scripts/validate-acupoint-standard.js  → PASS — no blocking defects
  中英未對齊 misaligned pairs      0
  缺英文陣列 missing _en arrays     0
  共用套話禁忌 boilerplate safety   0  (0 distinct shared strings)
  英文欄位內含中文 A11 (擋)         0
  禁忌欄是針法文字 A14 (擋)         0
node scripts/validate-content-junk.js       → PASS (穴位層無 finding)
```

下面 §2 的 31 條，**沒有一條被這兩支擋下來**。三個具體的盲點：

- **A4「`_en` 長度＝`_zh`」擋不住位移。** `SP6` 的 `point_identity` 兩邊都是 4 條，
  A4 綠燈；但英文從 index 1 起整串位移，「婦科要穴」消失、「⚠️ 孕婦禁針」變成一個
  光禿禿的 `⚠️`（AP-04）。**長度相等是位移的必要條件，不是正確的充分條件。**
- **A8/A11 只掃中文欄。** `contraindications_en` 有一句話被 **357/361** 穴共用，
  A8 報「0 distinct shared strings」——因為它不看 `_en`（AP-01）。
- **A7「針法必含深度數字」只看有沒有數字，不看數字彼此矛不矛盾。**
  210/361 穴的 `needling` 與 `acumethod_en` 講的是不同的深度（AP-03）。

---

## §1 逐穴判級

「獨有」＝把 AP-01/02/03/04/19/20/21/25/26/28（全層級）扣掉之後，該穴自己的發現。

| # | code | 中文 | 含全層 | 獨有 | 一句話 |
|---|---|---|---|---|---|
| 1 | LU1 | 中府 | DEFECT | **DEFECT** | 配穴段 5 個穴的歸經寫錯（華蓋→大腸經、肩髎→膽經、意舍→大腸經、陽交→腎經、間使→大腸經）；`related_conditions` 掛坐骨神經痛與板機指 |
| 2 | LU2 | 雲門 | DEFECT | **DEFECT** | 「俞府穴為肺之背俞穴」（KI27 不是肺俞）、「孔最穴為手太陰肺經原穴」（LU6 是郄穴）、魂門稱心包經、大陵稱心經 |
| 3 | ST12 | 缺盆 | DEFECT | **DEFECT** | 「水突穴為任脈穴，氣舍穴為肺經穴」兩個都是胃經；`point_identity_en` 把「⚠️ 不可深刺——可能刺穿肺」渲染成 `⚠️  ——`；`exam_pearl_en` 只剩標點 |
| 4 | SP21 | 大包 | DEFECT | **DEFECT** | `acumethod_en` 允許 **Perpendicular 0.5–0.8**，同卡禁忌寫「僅可斜刺 0.3–0.5 吋，直刺或深刺有氣胸風險」；第 6 vs 第 7 肋間的未決衝突寫在安全欄裡 |
| 5 | GB21 | 肩井 | DEFECT | **DEFECT** | `needling` 0.3–0.5 vs `acumethod_en` 直刺 0.5–0.8（正對肺尖）；`cautions_en` 把孕禁與氣胸併成一句，讀成「孕婦禁針（因為氣胸風險）」 |
| 6 | GB22 | 淵腋 | DEFECT | **DEFECT** | `acumethod_en` 寫 "Perpendicular or oblique"，`danger` 寫 "oblique or transverse **only**"；`cautions_en` 整句沒有氣胸字樣；`exam_pearl` 是五輸穴口訣樣板（GB22 不是五輸穴） |
| 7 | BL13 | 肺俞 | DEFECT | MINOR | `cautions_en` 空，但 `field_sources.cautions_en` 仍掛 WHO SAPL 2008 + eLotus CORE；深度 0.5–0.7 vs 0.5–0.8 |
| 8 | KI27 | 俞府 | DEFECT | **DEFECT** | 「神藏穴屬心包經」（KI25 是腎經）；`needling` 0.3–0.5 vs 其餘全部 0.5–0.8，位置在肺尖上 |
| 9 | PC1 | 天池 | DEFECT | **DEFECT** | 「乳根屬任脈」（ST18 胃經）、「少澤屬手少陰心經」（SI1 小腸經）；深度 0.2–0.4 vs 0.3–0.5 |
| 10 | LR14 | 期門 | DEFECT | **DEFECT** | `needling` 寫「**直刺**0.3～0.5寸」，同卡 `cautions_zh` 寫「⚠️ 嚴禁**直刺**深刺以免刺傷肺臟致氣胸或傷及肝脾」 |
| 11 | CV17 | 膻中 | DEFECT | **DEFECT** | 安全欄唯一一條是就醫轉診句，沒有任何針刺風險；`cautions_en` 完全沒有警語；「內關穴為心經絡穴」「厥陰俞穴為肝經背俞穴」皆錯 |
| 12 | ST9 | 人迎 | DEFECT | **DEFECT** | 全庫最近頸總動脈的穴，`exam_pearl_en` 只剩「：。「 LI18 」。，。」；英文禁忌欄是衛生樣板 |
| 13 | LU9 | 太淵 | DEFECT | **DEFECT** | 「人迎穴為手陽明大腸經的**絡穴**」（ST9 是胃經，且非絡穴），同一句重複兩次 |
| 14 | PC7 | 大陵 | DEFECT | MINOR | 安全層本身是本批最好的之一（中/英/`danger` 三處都點名正中神經）；`related_conditions` 掛踝扭傷、低血壓、聽力損失 |
| 15 | BL1 | 睛明 | DEFECT | **DEFECT** | 深度字串含未解碼 `&mdash;`；同卡並存 0.5–1 寸與 0.3–0.5 cun（眼眶穴的 2 倍差）；`moxa_en` 寫 "Moxibustion applicable: 3-5 moxa cones" |
| 16 | ST1 | 承泣 | DEFECT | **DEFECT** | `point_identity_en` 位移，「不宜灸」與「緩慢進針、不可大幅提插」變成 "Foot Yangming Stomach Channel Point" 和 `、`；`moxa_en` 同 BL1 |
| 17 | GB1 | 瞳子髎 | DEFECT | **DEFECT** | `moxa_zh`「不宜運用灸法」，`moxa_en`「Moxibustion applicable」；「少澤穴為手少陰心經井穴」錯 |
| 18 | GB20 | 風池 | DEFECT | **DEFECT** | `location_zh` 寫「項部」，`location_en` 寫 "On the **anterior** aspect of the neck"；深度 0.5–0.8 vs 0.8–1.2；禁忌寫「需由**受訓者**操作」 |
| 19 | LI4 | 合谷 | DEFECT | **DEFECT** | `needling` 同欄並存 0.5–1.0 / **2.0–3.0** / 0.5–0.8 三個範圍，2–3 寸透刺沒有任何操作者限制；`related_conditions` 掛 6 個孕期病症，同卡 5 條孕禁 |
| 20 | SP6 | 三陰交 | DEFECT | **DEFECT** | `point_identity_en` 整串位移，孕禁 chip 變成裸 `⚠️`；`contraindications` 5 條→`cautions_zh` 3 條，掉的是脛後動脈神經那條 |
| 21 | BL60 | 崑崙 | DEFECT | **DEFECT** | `acumethod_en` 寫 "behind **medial** malleolus"（內踝後方是 KI3，不是崑崙）；同一陣列並存「孕期慎用」與「孕婦禁針」 |
| 22 | BL67 | 至陰 | DEFECT | **DEFECT** | 全庫矯正胎位第一要穴，**`related_conditions` 裡沒有 `cond.breech_presentation`**；`danger[]` 裝的是中文 |
| 23 | LR3 | 太衝 | DEFECT | **DEFECT** | 禁忌只有一句「局部腫痛或傷口時避開」（A8 定義的套話）；四關穴的另一半 LI4 有 5 條孕禁，LR3 **全卡零字** |
| 24 | CV3 | 中極 | DEFECT | **DEFECT** | `cautions_zh[0]` 有「孕婦禁針」，`cautions_en` 只有排空膀胱、沒有孕期 |
| 25 | CV4 | 關元 | DEFECT | **DEFECT** | 渲染欄寫「孕期…需避免**自行**刺激」（自我保健口吻），舊欄 `cautions` 寫「孕婦禁針！…深刺易傷及子宮」；英文側全部欄位零字孕期 |
| 26 | SP1 | 隱白 | DEFECT | **DEFECT** | `needling`「淺刺0.2～0.3寸」與同卡禁忌「僅可沿皮下淺刺 0.1 吋，**不可深刺**」矛盾；`contraindications` 4 條→`cautions_zh` 2 條 |
| 27 | ST17 | 乳中 | DEFECT | **DEFECT** | 全庫唯一「絕對禁針禁灸」的穴，`combine_points_zh` 給了三組把它當治療穴的處方；`moxa_en` 寫「Moxibustion applicable: 3-5 moxa cones」；英文禁忌欄寫「strictly control insertion depth」 |
| 28 | LI11 | 曲池 | DEFECT | **DEFECT** | 「孕婦禁用」只存在於中文；`cautions_en` `acumethod_en` `exam_pearl_en` `point_identity_en` 四欄零字 |
| 29 | ST36 | 足三里 | DEFECT | **DEFECT** | 樣板卡。安全欄與 `anatomy_en` 是全庫最好的（見 §3.3），但「豐隆為**脾經經穴**」錯（ST40 是胃經絡穴）；深度三個範圍 1–2 / 0.5–1.2 / 1–1.5 |
| 30 | PC6 | 內關 | DEFECT | **DEFECT** | 樣板卡。安全內容具體且有退針指示，但「間使穴屬**心經**」錯（PC5 是心包經） |

**合計：含全層 30 DEFECT / 0 MINOR / 0 CLEAN；只算獨有 28 DEFECT / 2 MINOR / 0 CLEAN。**

---

## §2 逐條 findings

嚴重度：**SAFETY**（會讓針下錯地方、下太深、或漏掉禁忌）·
**CLINICAL**（臨床內容錯但不直接造成傷害）· **QUALITY**。

---

### AP-01 — 英文卡的「CONTRAINDICATIONS」區塊，357/361 穴是同一句衛生宣導；真正的英文警語欄位渲染器不讀

**嚴重度：SAFETY。全層。**

`app.js:438` 把 `contraindications_en` 映射成 `cautionsEn`，`app.js:4990` 在英文模式印成
`CONTRAINDICATIONS:` 區塊。而 `contraindications_en` 有 **357/361** 穴是同一個字串：

```
"Clinical Cautions: Standard hygienic practice; strictly control insertion depth
 according to patient body constitution and anatomical landmarks."
```

同時 **`cautions_en` 這個欄位在 `app.js` 裡完全沒有被讀取**
（全 repo 只有 `js/knowledge.js:1551` 引用，那是中藥卡）。也就是：

| 穴 | `cautions_en`（資料裡有，畫面上沒有） | 英文卡實際印出的 CONTRAINDICATIONS |
|---|---|---|
| LU1 中府 | `"1st intercostal space; oblique 0.5-0.8 cun. ⚠️ Deep medial insertion contraindicated (pneumothorax risk)."` | 上面那句衛生宣導 |
| ST9 人迎 | `"Anterior to SCM at laryngeal prominence; perpendicular 0.3-0.5 cun. ⚠️ Avoid carotid artery."` | 同上 |
| PC7 大陵 | `"Midpoint of wrist crease over median nerve; avoid deep insertion."` | 同上 |
| **ST17 乳中** | `"⚠️ NEEDLING & MOXIBUSTION STRICTLY PROHIBITED! Landmark only."` | 同上（**「strictly control insertion depth」印在一個絕對禁針的穴上**） |

`app.js:4991` 有一條 `else if (point.cautions)` 的中文 fallback，**永遠不會觸發**，
因為 `contraindications_en` 在 361 筆裡沒有一筆是空的。

> **這條的後果是：361 條逐穴撰寫的英文安全警語存在於資料裡，一條都到不了畫面；
> 到得了畫面的是一句 357 穴共用的空話。** 這是本輪最廣的單一 SAFETY 發現。

predicate：`contraindications_en.startsWith("Clinical Cautions: Standard hygienic practice")` → 357/361。
另 `cautionsEn`（第三套）有 84 穴是三句樣板之一。

---

### AP-02 — 21 個「不宜灸／禁灸」的穴，`moxa_en` 開頭寫「Moxibustion applicable: 3-5 moxa cones」

**嚴重度：SAFETY。**

`app.js:4983` 在英文模式印 `MOXIBUSTION & HEAT THERAPY:\n${point.moxaEn}`。
21 個穴的 `moxa_en` 是這個形狀 ——**英文肯定句在前，中文否定句被塞進括號**：

```
ST17 乳中："Moxibustion applicable: 3-5 moxa cones or 5-15 minutes with moxa roll.
            (不宜運用灸法，此穴為胸部取穴標誌，不做針灸治療)"
BL1 睛明："Moxibustion applicable: 3-5 moxa cones or 5-15 minutes with moxa roll. (不宜運用灸法)"
ST1 承泣：同上
```

命中的 21 穴：`BL1 BL2 BL6 GV26 HT7 LI19 LI20 SP11 SP12 ST1 ST2 ST8 ST12 ST17
GV15 GV16 GV25 GV27 GV28 GB1 TE23` —— **含兩個眼眶穴（BL1/ST1）、
兩個延髓區（GV15/GV16）、鎖骨上窩（ST12），以及乳頭（ST17）。**

英文讀者看到的是「可灸，3–5 壯」加一段他看不懂的中文。

predicate：`/Moxibustion applicable/i.test(moxa_en) && /不宜運用灸法|禁灸|不宜灸|不可灸/.test(moxa_zh+moxa_en)` → 21。
更廣的一條：`moxa_en` 含 CJK **354/361**（英文欄整段中文，A11 沒擋是因為 A11 只掃陣列型 `_en`）。

---

### AP-03 — 中文 `needling` 與英文 `acumethod_en` 講兩個不同的深度：210/361 穴；英文那側較深的有 134 穴，其中 77 穴在胸背頸

**嚴重度：SAFETY。這是雙來源（CloudTCM + eLotus）沒有做對照收斂留下的疤。**

`needling`／`acumethod_zh` 帶的是 CloudTCM 的數字，`acumethod_en`／`cautions_en`／
`exam_pearl` 帶的是 eLotus/課件的數字，兩者**各自落地，沒有任何一步把它們對起來**。
在胸壁穴上，較深的那個一律在英文側：

| 穴 | `needling`（中） | `acumethod_en` / `exam_pearl`（英） |
|---|---|---|
| LU1 中府 | 直刺 0.3～0.5 寸 | Oblique 0.5–0.8 cun |
| SP21 大包 | 沿肋間隙橫刺 0.3～0.5 寸。**不可深刺** | **Perpendicular** or oblique **0.5–0.8** cun |
| GB21 肩井 | 刺 0.3～0.5 寸 | **Perpendicular** or oblique posterior **0.5–0.8** cun |
| GB22 淵腋 | 斜刺 0.3～0.5 寸 | **Perpendicular** or oblique **0.5–0.8** cun |
| KI27 俞府 | 斜刺 0.3～0.5 寸 | Oblique/subcutaneous 0.5–0.8 cun |
| LR14 期門 | **直刺** 0.3～0.5 寸 | Oblique/subcutaneous 0.5–0.8 cun |
| GB20 風池 | 0.5～0.8 寸 | 0.8–1.2 cun |
| BL1 睛明 | 0.5–1 寸 | 0.3–0.5 cun（**反向，眼眶穴 2 倍差**） |

全層數字（predicate：兩欄都能解析出 `N-M cun|inch|寸|吋`，集合不相等）：

```
needling 與 acumethod_en 的深度範圍不同        210 / 361
  其中 acumethod_en 的上限較深                 134
  其中位於胸/背/脅/肋/鎖骨/頸 區域             77
30 穴取樣裡至少列出兩個不同深度範圍的          19 / 30
```

憲法 §4「課件與網站衝突 → **兩個都記、標出處**」是允許的做法，但**必須標出處**。
本層兩個數字分佔中英兩欄、沒有任何一欄說明另一欄的存在，
英文使用者只會看到較深的那個。**這不是「兩個都記」，是「分兩邊各記一個」。**

---

### AP-04 — `point_identity_en` 位移與空殼：安全 chip 在英文版消失

**嚴重度：SAFETY。A4 完全擋不到（長度相等）。**

**SP6 三陰交** —— 兩邊都是 4 條，英文從 index 1 起整串位移一格：

```
zh: ["交會穴 —— 足三陰（脾、肝、腎）交會", "婦科要穴", "可灸", "⚠️ 孕婦禁針"]
en: ["Intersection Point of 3 Yin Leg Meridians (Spleen, Liver, Kidney)",
     "Moxibustion Applicable",            ← 對到 zh 的「婦科要穴」
     "Contraindicated during pregnancy",  ← 對到 zh 的「可灸」
     "⚠️"]                                 ← 對到 zh 的「⚠️ 孕婦禁針」，內容整個掉光
```

**ST1 承泣** —— 兩條安全指示被換成同一句通用經絡標籤：

```
zh: ["入經穴", "交會穴 —— 任脈、陽蹻脈", "不宜灸", "緩慢進針、不可大幅提插"]
en: ["Foot Yangming Stomach Channel Point", "—— 、",
     "Foot Yangming Stomach Channel Point", "、"]
```

**ST17 乳中**：`zh ["⚠️ 絕對禁針禁灸", "僅用作胸腹部取穴的定位標誌"]` →
`en ["⚠️", "Foot Yangming Stomach Channel Point"]`。
**ST12 缺盆**：`zh[0] "⚠️ 不可深刺 —— 可能刺穿肺"` → `en[0] "⚠️  ——"`。

`app.js:3931` 的 chip 過濾只擋 `可灸|不可灸|禁灸|待補` 與長度 >35，
所以裸 `⚠️` 與 `、` **會照樣渲染成 chip**。

全層 predicate：

```
point_identity_en 有純標點/表情、無任何字母的條目        17 / 361
  GV14 SP6 ST1 ST3 ST4 ST8 ST12 ST13 ST14 ST15 ST16 ST17 ST18 ST19 ST20 ST35 CV14
point_identity_en 有重複條目而 point_identity_zh 沒有    20 / 361
point_identity_en 含 "...Channel Point" 通用填充         135 / 361
```

---

### AP-05 — `exam_pearl_en` 有 27–35 穴只剩標點，中文內容被機器剝空

**嚴重度：SAFETY（命中的穴含 ST9／ST1／ST12／ST17）／QUALITY。**

```
ST9  人迎："：。「 LI18 」。，。"                          （全字串只有 2 個拉丁字母）
           （中文原文：「胃經最危險的穴之一：緊貼頸總動脈。課件直接寫
             『用 LI18 比較安全』。…」——「比較安全」四個字整段消失）
ST1  承泣："，：、、。 ST2 。"                              （2 個字母）
ST12 缺盆："。 ST12  ST18 「」， 0.3–0.5 。"                （4 個字母）
ST17 乳中："「」 ——  NEVER needled or treated。（）。。"    （21 個字母，見下）
```

兩條 predicate 給不同的數，兩個都列出來：

```
(a) 出現 ≥3 次「標點接標點」或以標點開頭            27 / 361（SEL30 命中 3：ST9 ST1 ST12）
(b) 拉丁字母佔比 < 25%                             35 / 361（SEL30 同 3 個）
```

**ST17 兩條 predicate 都沒命中**（它保留了 "NEVER needled or treated" 五個英文字），
但它是同一道工序的產物 —— 中文被刪光只留 `「」` 與 `（）` 的空殼。
**這說明本條的機器判準會低估：能引英文原文的部分越多，predicate 越抓不到。**

同一機器剝空手法的其他受害欄位（同 predicate）：
`massage_en` **358/361** · `combine_points_en` **359/361**（見 AP-19）·
`modern_research_en` **327/361** · `anatomy_en` **225/361**（見 AP-20）。

---

### AP-06 — `contraindications` 有內容而 `cautions_zh` 少一截：21 穴的安全條目在複製時被丟掉

**嚴重度：SAFETY。**

兩個欄位在 272/361 穴是逐字相同的（AP-29），但有 **21 穴** `contraindications`
比 `cautions_zh` 長，掉的都是具體那幾條：

```
SP6 三陰交  contraindications 5 條 → cautions_zh 3 條
  掉的是 [2]「脛骨內側後緣，直刺 0.5–1.0 吋，避免刺傷脛後動脈與神經」
         —— 唯一一條講血管神經的
SP1 隱白    contraindications 4 條 → cautions_zh 2 條
  掉的是 [1]「趾端穴，僅可沿皮下淺刺 0.1 吋，不可深刺」
         [2]「甲角旁血運豐富，出針後按壓止血」
SP21 大包   contraindications 4 條 → cautions_zh 2 條
  掉的是 [1]「⚠️ 肋間穴，僅可斜刺 0.3–0.5 吋，直刺或深刺有氣胸風險」
         [2]「腋中線第 6 肋間隙（課件另註：MOA 作第 7 肋間）」
```

predicate：`contraindications.length > cautions_zh.length` → 21/361
（`PC6 SP1 SP2 SP3 SP4 SP5 SP6 SP7 SP8 SP9 …`）。

**哪一欄才是渲染的那一欄，決定這 21 穴掉的是不是使用者看得到的東西 ——
這一點本 ledger 沒有查證到底，列為 Ting 需要裁定的項目。**

---

### AP-07 — `acumethod_en` 指示「Perpendicular」，同一張卡的中文欄寫「嚴禁直刺／僅可斜刺」

**嚴重度：SAFETY。**

```
SP21 大包
  contraindications[1]：「⚠️ 肋間穴，僅可斜刺 0.3–0.5 吋，直刺或深刺有氣胸風險」
  acumethod_en       ："Perpendicular or oblique insertion 0.5–0.8 cun on mid-axillary
                        line in 6th intercostal space."

GB22 淵腋
  danger[0]     ："Pneumothorax risk — oblique or transverse insertion only."
  acumethod_en  ："Perpendicular or oblique insertion 0.5–0.8 cun in 4th intercostal space
                   on mid-axillary line."          ← 同一張卡，英文自己打架
  cautions_en[0]："4th intercostal space on mid-axillary line; oblique/transverse 0.5-0.8 cun."
                                                    ← 氣胸兩個字整句消失
```

predicate：`/Perpendicular/i.test(acumethod_en)` 且中文安全欄含 `嚴禁直刺|不可直刺|僅可斜刺|禁直刺`
→ **7 穴：`LR14 SP12 SP21 ST18 KI27 CV22 PC1`**。

**LR14 期門另有更嚴重的一種**：矛盾在中文內部 ——
`needling` = 「**直刺**0.3～0.5寸」，`cautions_zh[1]` = 「⚠️ 嚴禁**直刺**深刺以免刺傷肺臟致氣胸或傷及肝脾」。
這條 predicate 抓不到（因為 `acumethod_en` 寫的是 Oblique），要靠眼睛。

---

### AP-08 — BL60 崑崙的英文針法把針送到腳踝的另一邊

**嚴重度：SAFETY。**

```
location_zh ：足部外踝後方，當外踝尖與跟腱之間凹陷處
location_en ："Posterior to the lateral malleolus, in the depression between the
              prominence of the lateral malleolus and the calcaneal tendon."   ← 對
acumethod_en："Perpendicular insertion 0.5–0.8 cun behind MEDIAL malleolus.
              Jing-River (Fire) point. CAUTION: CONTRAINDICATED IN PREGNANCY."  ← 錯邊
```

內踝後方是 KI3 太溪，在腳踝的對側。**英文針法欄指的是另一個穴。**

我用「中文寫內踝／外踝、英文寫反」當 predicate 掃全庫，只命中這一筆
（因為 BL60 的 `location_en` 是對的，錯的只有 `acumethod_en`，
單欄比對抓不到；這一筆是眼睛讀到的）。**同型錯誤在其他 331 個沒讀的穴是否存在，未知。**

---

### AP-09 — GB20 風池：中文寫「項部」，英文寫 "anterior aspect of the neck"

**嚴重度：SAFETY。**

```
location_zh：項部枕骨下，斜方肌上部外緣與胸鎖乳突肌上端後緣之間凹陷處
location_en："On the ANTERIOR aspect of the neck, inferior to the occipital bone,
             in the depression between sternocleidomastoid and trapezius."
region     ：頭頸
```

「項部」是頸後，"anterior aspect of the neck" 是頸前。**兩句話指的是脖子的兩面。**

本 ledger **不判定哪一邊對** —— WHO SAPL 的區域用語與中文教材的「項部」是否等義，
需要開來源頁核，屬 Ting/RV1。這裡只指出兩欄互相矛盾，且矛盾落在一個
`cautions` 寫著「嚴禁向上深刺入腦！」的穴上。

**同穴另兩條**：`needling` 0.5～0.8 寸 vs 其餘四欄 0.8–1.2（AP-03）；
`contraindications[0]`「針刺方向與深度需由**受訓者**操作，避免危險深刺」——
「受訓者」是「正在受訓的人」，字面讀成「要讓學員來操作」，與原意相反。

predicate：`location_zh` 含 `項部|後髮際|枕骨下|背部|後方|背側|後緣`
且 `location_en` 含 `anterior (aspect|region|surface) of the neck` → 1/361（GB20）。

---

### AP-10 — BL1 睛明：深度字串裡有未解碼的 HTML 實體，而且同卡並存兩個差兩倍的深度

**嚴重度：SAFETY。**

```
needling / acumethod_zh：
  「囑患者閉目，醫者左手輕推眼球想外側固定，右手緩慢進針，緊靠眶緣直刺
   0.5&mdash;1寸，不捻轉提插。…」
cautions（舊欄）  ：「…沿眼眶邊緣緩緩直刺 0.5-1.0 寸。」
acumethod_en      ："…insert needle perpendicularly 0.3–0.5 cun slowly along the orbital wall."
exam_pearl        ：「…沿眼眶壁直刺 0.3-0.5 寸…」
```

三件事同時發生在一個眼眶穴上：
1. `&mdash;` 未解碼，畫面上會印出 `0.5&mdash;1寸`；
2. 中文側 0.5–1.0 寸、英文側與考點 0.3–0.5 寸，**上限差兩倍**；
3. 「輕推眼球**想**外側固定」——「想」是「向」的錯字。

`cautions_en` 為空、`cautionsEn` 與 `contraindications_en` 都是樣板（AP-01），
所以英文卡上關於這個穴的具體安全內容只剩 `acumethod_en` 一句。

predicate：`/&[a-z]+;/` 出現在 `needling`+`acumethod_zh` → **3/361（BL1 ST4 TE6）**。

---

### AP-11 — `cun_measurement` 231/361 空白，45 筆裝的是英文定位句而不是骨度分寸

**嚴重度：CLINICAL。**

模板第 1 區指定 `cun_measurement` 是骨度分寸。實際：

```
空白                          231 / 361（含 BL13 BL60 CV4 CV17 GB20 GB21 LI4 LI11 LR3 LR14 LU1 LU2 LU9 PC6）
裝英文句子、且不含 "N cun"     45 / 361
  SP21 大包："Sixth intercostal space on the midaxillary line."   ← 這是定位，不是分寸
  BL1  睛明："At the inner canthus."
```

30 穴取樣裡 24 穴空白。**派工單問「`location_zh` 是否與 `cun_measurement` 相符」——
在 80% 的穴上這個問題無法回答，因為欄位是空的。** 這是誠實的空白，不是錯誤，
但它意味著卡片第 1 區「骨度分寸」那一格對多數穴不顯示。

---

### AP-12 — LR3 太衝：四關穴的另一半，全卡零字孕期

**嚴重度：SAFETY。**

LR3 自己的 `point_identity_zh[4]` 寫著「四關穴之一（配 LI4 合谷）」，
`exam_pearl` 寫「四關穴第一要穴（「四關穴：合谷+太衝」）」。
它的搭檔 LI4 有 **5 條**孕期禁忌。LR3 的安全欄全文是：

```
contraindications：["局部腫痛或傷口時避開。"]
cautions_zh      ：["局部腫痛或傷口時避開。"]
cautions         ： "局部腫痛或傷口時避開。"
cautions_en      ：["Distal to junction of 1st & 2nd metatarsals; perpendicular 0.5-1.0 cun."]
point_identity_zh／_en／exam_pearl／exam_pearl_en／acumethod_en：零字孕期
```

而「局部腫痛或傷口時避開」正是 A8 條文列為套話的那一類
（「對任何針刺都成立的空話」）。**這張卡的安全欄同時是空的、又是套話。**

這是 `HERB_CLOUDTCM_LAYER_SCAN §5` 第 2 點講的那類 ——
「該有而沒有」的缺口，機器無從得知。本條靠的是把 LI4 與 LR3 兩張卡並排讀。

---

### AP-13 — CV4 關元：渲染欄寫「避免自行刺激」，舊欄寫「孕婦禁針」，英文側零字

**嚴重度：SAFETY。**

```
cautions_zh[0]（陣列，新欄）：「孕期、腹部急症或不明出血需避免自行刺激。」
cautions（字串，舊欄）      ：「孕婦禁針！本穴位於少腹，深刺易傷及子宮。」
```

前者是給自我保健讀者的（「避免**自行**刺激」），後者是給臨床者的禁令。
**兩句話的強度不同，而較弱的那一句在較新的欄位裡。**
`cautions_en`、`acumethod_en`、`contraindications_en`、`exam_pearl_en`、
`point_identity_en` 五欄全部零字孕期 —— CV4 的英文卡完全不知道這是個孕期穴。

同型（孕期只在中文側）：**LI11 曲池**（`contraindications[0]`「孕婦禁用 —— 強刺激可能引動胎氣」，
英文五欄零字）、**CV3 中極**（`cautions_zh[0]`「孕婦禁針」，`cautions_en` 只寫排空膀胱；
`danger[0]` 有 "Contraindicated in pregnancy"，但 `danger` 未確認是否渲染）。

---

### AP-14 — BL60 崑崙：同一個陣列裡並存「孕期慎用」與「孕婦禁針」

**嚴重度：SAFETY。**

```
contraindications：[
  "孕期慎用",                              ← 慎用
  "踝部腫脹明顯或傷口感染時避開。",         ← 套話
  "孕婦禁針（崑崙穴具催生下胎之力）"        ← 禁針
]
cautions（舊欄）  ："孕婦禁針！本穴有催產與通經下胎作用。"
acumethod_en     ："… CAUTION: CONTRAINDICATED IN PREGNANCY."
cautions_en      ：空
```

「慎用」與「禁針」是兩個不同的臨床決定，同一欄同時給出兩個。
憲法第四條說兩源不合要「兩個都記並標出處」——這裡兩條都沒有出處。

---

### AP-15 — GB21 肩井：英文把孕期禁忌的**理由**寫成氣胸

**嚴重度：SAFETY。**

```
cautions_en[0]："Highest point of shoulder; perpendicular 0.5-0.8 cun.
                 ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY (pneumothorax risk)."
```

中文側講得很清楚是兩個獨立風險：
`contraindications[0]`「深部正當肺尖，慎不可深刺，以防刺傷肺尖造成氣胸」、
`[3]`「孕婦嚴禁針刺（肩井穴降氣下行，針刺極易激發強烈宮縮致流產或早產）」。

英文把它們併成一句，讀起來變成「孕婦禁針，因為有氣胸風險」——
**因果錯了，而且氣胸作為獨立風險在 `cautions_en` 裡不再存在。**
（`cautions_en` 本身也不渲染，見 AP-01。）

---

### AP-16 — ST17 乳中：全庫唯一絕對禁針的穴，卡片給了三組把它當治療穴的處方

**嚴重度：SAFETY。本輪最嚴重的單張卡。**

模板 §1 寫明：「**絕對禁針的穴（ST17 乳中）是特例**：第 5 區（功效/主治/標籤）留空，
禁令只出現在 4 與 2。」第 5 區確實處理對了（`action_tags_zh`／`disease_tags_zh` 都是 `[]`）。
但**第 6 區「常用配穴與臨床應用」沒有清空**，`combine_points_zh` 527 字：

```
1. 癲癇配伍：足通谷、太沖、絲竹空、乳中
   … 乳中: 雖然與癲癇病竈關係較間接，但其可疏通胸部經絡，調和氣血，輔助其他穴位…
2. 性冷淡配伍：乳中、會陰、會陽、京門
   … 乳中: 可通調胸部氣血，與任脈經絡相關，協調臟腑功能，間接影響性功能。
3. 產後出血配伍：乳中、會陰
   … 乳中: 可能通過調和氣血，間接促進凝血功能。
```

三組處方都把乳中當作**主動使用**的穴，並逐條解釋它「貢獻」了什麼。
（順帶：「足通谷: 膽經原穴」錯，BL66 是膀胱經滎穴；「京門: 腎經經穴」錯，GB25 在膽經。）

同一張卡的其他三處：

```
moxa_en           ："Moxibustion applicable: 3-5 moxa cones or 5-15 minutes with moxa roll.
                     (不宜運用灸法，此穴為胸部取穴標誌，不做針灸治療)"        ← AP-02
contraindications_en："Clinical Cautions: Standard hygienic practice; strictly control
                     insertion depth according to patient body constitution…"  ← AP-01
point_identity_en  ：["⚠️", "Foot Yangming Stomach Channel Point"]              ← AP-04
exam_pearl_en      ："「」 ——  NEVER needled or treated。（）。。"                 ← AP-05
```

> **把這四條放在一起：英文版的 ST17 卡片讀起來是一個可以下針、可以艾灸、
> 只要「注意深度」的正常胃經穴。中文版有正確的禁令，英文版沒有。**

中文側是對的：`needling`／`acumethod_zh`／`contraindications`／`cautions`
四欄都寫「絕對禁針、禁灸、禁任何治療操作（課件原文：Contraindicated. NEVER needled or treated.）」。

---

### AP-17 — LI4 合谷：`needling` 同欄並存三個深度，最深的 2–3 寸透刺沒有任何操作者限制

**嚴重度：CLINICAL。**

```
needling：「直刺0.5~1.0寸，局部酸脹，可擴散至肘、肩、面部

           深刺2.0~3.0寸，透勞宮或後溪時，出現手掌酸麻並向指端放散。針刺時針尖
           不宜偏向腕側，以免刺破手背靜脈網和掌深動脈而引起出血。此穴提插幅度
           不宜過大，以免傷及血管引起血腫

           《針灸大成》：針三分, 留六呼, 灸三壯。

           課件：直刺 0.5–0.8 吋。⚠️ 孕婦禁針禁灸（課件明列…）。」
```

0.5–1.0（CloudTCM）／**2.0–3.0（透刺）**／0.5–0.8（課件）三個範圍，上下相差 6 倍。
透刺那一段自帶血管警告（這點是好的），但**沒有任何一句說這屬於特殊手法**，
而 `acumethod_en`／`cautions_en`／`exam_pearl` 一律只講 0.5–1.0。

LI4 的孕期覆蓋在中文側是本批最完整的（5 條，`contraindications` ≡ `cautions_zh`），
英文側 `cautions_en` 與 `exam_pearl_en` 也都有 —— **本批唯一一個孕期禁忌
中英兩側都到位的穴。** 這證明「做得到」，所以 AP-12/13 的缺口是遺漏不是限制。

---

### AP-18 — 配穴段有 22 條把別的穴掛到錯的經上，涵蓋 15/30 穴，含兩張樣板卡

**嚴重度：CLINICAL。**

方法：從 361.json 建 `中文穴名 → channel_zh`，逐句比對
`([一-鿿]{2,4})穴(?:則|亦|即|乃)?(?:為|是|屬)(…經|脈)` 型敘述，
排除自我描述，**再由人眼剔除寬鬆但不錯的講法**
（「肝俞穴為肝經背俞穴」「腎俞穴為腎經背俞穴」「天樞為大腸經募穴」
「中脘為胃經募穴」「肺俞穴為肺經的背俞穴」—— 這些指的是「某臟的背俞/募穴」，
是常見說法，**不列為錯誤**）。剩下的 22 條是真的把穴放到別的經上：

```
LU1 中府（5 條）
  「華蓋穴則為手陽明大腸經穴位」          → CV20，任脈
  「肩髎穴為膽經穴位」                    → TE14，三焦經
  「意舍穴為手陽明大腸經穴位」            → BL49，膀胱經
  「陽交穴為足少陰腎經穴位」              → GB35，膽經
  「間使穴為手陽明大腸經穴」              → PC5，心包經
  另：「尺澤穴為手太陰肺經的絡穴」        → LU5 是合穴，肺經絡穴是 LU7
      「定喘穴為手太陰肺經穴」            → 定喘是經外奇穴，不屬十四經
LU2 雲門（4 條）
  「俞府穴為肺之背俞穴」                  → KI27，腎經；肺俞是 BL13
  「孔最穴為手太陰肺經原穴」              → LU6 是郄穴；肺經原穴是 LU9
  「心包經（魂門）」                      → BL47，膀胱經
  「心經（大陵）」                        → PC7，心包經
ST12 缺盆（2 條）「水突穴為任脈穴，氣舍穴為肺經穴」 → ST10／ST11，兩個都是胃經
SP21 大包（2 條）「陽輔穴屬足少陰腎經」→ GB38 膽經；「外關穴屬小腸經」→ TE5 三焦經
GB21 肩井（2 條）「乳根穴為足厥陰肝經穴」→ ST18 胃經；「少澤穴為手少陰心經井穴」→ SI1 小腸經
KI27 俞府（1 條）「神藏穴屬心包經」      → KI25，腎經
CV17 膻中（2 條）「內關穴為心經絡穴」→ PC6 心包經；「厥陰俞穴為肝經背俞穴」→ BL14 是心包的背俞
LU9 太淵（1 條）「人迎穴為手陽明大腸經的絡穴」→ ST9 胃經，且不是絡穴（同句重複兩次）
GB1 瞳子髎（1 條）「少澤穴為手少陰心經井穴」→ SI1 小腸經
PC1 天池（2 條）「乳根屬任脈」→ ST18 胃經；「少澤屬手少陰心經」→ SI1 小腸經
ST17 乳中（2 條）「足通谷: 膽經原穴」→ BL66 膀胱經滎穴；「京門: 腎經經穴」→ GB25 膽經
ST36 足三里（1 條・樣板卡）「豐隆為脾經經穴」→ ST40，胃經絡穴
PC6 內關（1 條・樣板卡）「間使穴屬心經」→ PC5，心包經
```

「少澤穴為手少陰心經井穴」在三張不同的卡上出現（GB21／GB1／PC1）——
心經井穴是少衝 HT9，少澤 SI1 是小腸經井穴。**同一個錯誤跨卡複製。**

機器可判定的跨穴歸經主張共 **118 條**，人眼剔除寬鬆講法後判定為錯的 **22 條**。
**這一族的關鍵在於它落在卡片第 6 區「常用配穴與臨床應用」——
模板寫明這一區「不能刪掉」、是「這一區最有價值的地方」。
內容有價值，但裡面的經絡歸屬有 18.6% 是錯的。**

---

### AP-19 — `combine_points_en` 359/361 是「paired with」＋剝空的標點

**嚴重度：QUALITY（但整區英文版等於不存在）。**

```
LU1："1. paired with 、，、: ，；，、。，，，、。 2. paired with 、、、，、: ，、，，。
     paired with ，，，。 3. paired with ，、、: ，。 …"
ST12："1. paired with : : ，、。，。，，，，。 paired with 、。 …"
```

機器把中文的「配」換成 "paired with"，**其餘中文字元全部刪掉，標點留著**。
`combine_points_en` 含 CJK 的是 0/361 —— 所以 A11「`_en` 裡出現中文」永遠不會觸發，
因為中文被刪光了而不是被翻譯。**A11 綠燈的原因正是這個欄位壞得更徹底。**

predicate：`combine_points_en` 含 "paired with" → 359/361。

---

### AP-20 — `anatomy_en` 225/361 是標點湯；全庫只有 2 筆是真英文散文

**嚴重度：QUALITY。但它同時是 AP-27 的證據。**

```
LU1："， , , . nerve branch . , artery branch, branch , . . , nerve artery branch, ."
ST9（頸總動脈穴）：
    "Located at , sternocleidomastoid muscle , , . artery . artery artery . vein, vein.
     nervedistributed with, facial nerve branch. , artery , . deeper layer nerve, nerve .
     , nerve branch nerve ."
```

同一手法（保留西醫名詞，刪掉中文，標點原位留下）。全庫統計：

```
anatomy_en 標點湯                          225 / 361
anatomy_en 是通用填充句                      1 / 361（ST17："Anatomy: Regional neuromuscular structures…"）
anatomy_en 是真正的英文散文                  2 / 361 ← 只有 PC6 與 ST36
```

模板 2026-07-30 把解剖從「現代研究」搬到「定位」區，理由是
「解剖是取穴與安全的依據」。**英文模式下，這個依據在 361 穴裡有 359 穴讀不出來。**

---

### AP-21 — `action_tags_en` 有 49.7% 的條目是佔位字串 "TCM Action"，而舊欄 `action_tags` 有正確譯文

**嚴重度：QUALITY（但這是一次回歸，不是缺漏）。**

```
LU1 action_tags_zh    ：["化痰","健脾","利水","平喘","行氣","寬胸","解表","消脹"]
    action_tags_en    ：["Transform Phlegm","Fortify Spleen","Promote Diuresis",
                         "Relieve Asthma / Calming Wheezing",
                         "TCM Action","TCM Action","Release Exterior","TCM Action"]
    action_tags（舊欄）：["Transform Phlegm","Tonify the Spleen","Promote Urination",
                         "Calm Wheezing","Move Qi","Unbind the Chest",
                         "Release the Exterior","Relieve Distension"]
```

`行氣`／`寬胸`／`消脹` 在舊欄有 "Move Qi"／"Unbind the Chest"／"Relieve Distension"，
在新欄變成 "TCM Action"。全庫：

```
action_tags_en 條目總數                                        2886
其中 "TCM Action"                                             1433（49.7%）
有 "TCM Action" 而同 index 的舊欄 action_tags 有真譯文的穴數     335 / 361
30 穴取樣命中                                                  29 / 30
```

模板 §2 說英文標籤一律查 `data/config/acupoint_tag_glossary.json`、
「glossary 沒有的詞先加進去再用；該欄寧可整個留空，也不要半翻」。
**現況是半翻，而且完整的那一半就躺在同一筆記錄的舊欄裡。**
LI4 最誇張：29 個標籤，18 個是 "TCM Action"。

---

### AP-22 — `related_conditions` 是分塊指派不是逐穴判斷：LI4=115、ST36=112、SP6=111，中位數 4

**嚴重度：CLINICAL。**

```
有 related_conditions 的穴                179 / 361
最大：LI4 115 · ST36 112 · SP6 111 · CV12 83 · LR3 47 · KI3 35 · SP9 35 · LI11 33
中位數                                     4
```

而且有一個**逐字相同的 7 條婦科組合**出現在 30 個穴上：

```
["cond.endometriosis","cond.primary_dysmenorrhea","cond.pms","cond.irregular_menstruation",
 "cond.female_infertility","cond.recurrent_pregnancy_loss","cond.chronic_pelvic_pain"]
命中：BL18 BL20 BL23 BL67 CV3 CV4 CV6 GB26 GB30 GV4 GV14 KI2 KI3 KI10 KI13 LI4 LI11
      LR3 LR14 SI3 SI4 SP1 SP6 SP8 SP9 SP10 ST25 ST36 TE2 TE3
```

單穴層面的不合理例子（眼睛讀出來的）：

```
LU1 中府（胸壁肺募穴）→ cond.sciatica（坐骨神經痛）、cond.trigger_finger（板機指）、
                        cond.overactive_bladder
PC7 大陵（腕部）      → cond.ankle_sprain、cond.hypotension、cond.hearing_loss
PC6 內關（前臂）      → cond.sciatica、cond.knee_osteoarthritis、cond.ankle_sprain
CV17 膻中（胸骨）     → cond.patellofemoral_pain（髕股疼痛）
LU9 太淵（腕部）      → cond.ankle_sprain
```

模板 §2.8 說分類用查表、不寫進穴位記錄，理由是「ST36 有 112 個關聯病症，
若每個穴位各自存一份分類，以後病症模組改分類就要回頭改 361 筆」。
**分類確實沒寫進來（做對了），但 id 清單本身就是問題所在。**

---

### AP-23 — `cond.breech_presentation` 掛在 CV12／LI4／SP6／ST36，**沒有掛在 BL67**

**嚴重度：CLINICAL（且與 AP-24 疊加成 SAFETY）。**

BL67 至陰的 `functions_zh[0]` 是「矯正胎位」，
`point_identity_zh[2]` 是「矯正胎位第一要穴（至陰灸）」，
`exam_pearl_en` 是 "Primary point on the body for correcting breech fetal presentation via moxibustion"。

```
掛 cond.breech_presentation 的穴：CV12 · LI4 · SP6 · ST36      （4 個）
BL67 有沒有掛？                    否
```

從病症頁點進「胎位不正」，會拿到中脘、合谷、三陰交、足三里，
**拿不到那個卡片自己宣稱是第一要穴的穴。**

---

### AP-24 — 6 個穴一邊掛著孕期病症、一邊自己寫著「孕婦嚴禁針刺」

**嚴重度：SAFETY。**

```
predicate：related_conditions 含 hyperemesis_gravidarum / breech_presentation /
           ivf_support / recurrent_pregnancy_loss / luteal_phase_defect /
           postpartum_hypolactation 任一，且自己的安全欄含
           孕婦禁針|孕婦嚴禁|孕婦禁用|孕婦禁針禁灸

命中 6 穴：LI4(6 個孕期病症) · SP6(6) · CV3(1) · CV4(1) · LI11(1) · ST25(1)
```

LI4 與 SP6 掛的六個是：`hyperemesis_gravidarum`（妊娠劇吐）、`breech_presentation`、
`ivf_support`、`recurrent_pregnancy_loss`、`luteal_phase_defect`、`postpartum_hypolactation`。

**同一張卡：`contraindications` 說「⚠️ 孕婦嚴禁針刺（針刺易激發強烈宮縮致流產）」，
`related_conditions` 說它治妊娠劇吐與試管嬰兒支持。**
兩者都會渲染，且不在同一個區塊（安全在第 2 區，病症連結在第 7 區）。

（臨床上「孕期可用但需權衡」的立場是存在的，LI4/SP6 用於催產也是標準做法 ——
**問題不是連結本身荒謬，是這張卡沒有任何一個欄位處理這個張力。**
本 ledger 不代寫立場，列為 Ting 裁定項。）

---

### AP-25 — `field_sources` 是一個蓋在 361 筆上的同款印章，不是逐欄來源

**嚴重度：CLINICAL（來源紀律）。派工單指定要回答的問題。**

```
distinct field_sources key-shapes across 361 records：1
  acumethod_en, acumethod_zh, anatomy_en, anatomy_zh, cautions_en, cautions_zh,
  combine_points_zh, exam_pearl, exam_pearl_en, functions_en, functions_zh,
  indications_en, indications_zh                                    ← 13 鍵，361/361 完全相同

distinct field_sources VALUE strings：78
  [2166] CloudTCM                          ← 361 × 6 個槽
  [2166] eLotus CORE                       ← 361 × 6 個槽
  [1083] WHO SAPL 2008                     ← 361 × 3 個槽
  [ 722] eLotus CORE / MasterTungAcupuncture.org
  [  40] curriculum/acupoints/7 URINARY BLADDER CHANNEL OF FOOT TAI YANG.pdf#p1
  …（課件錨點是唯一逐穴變化的部分）
```

也就是：`anatomy_zh` 一律 `["CloudTCM"]`，`anatomy_en` 一律 `["WHO SAPL 2008","eLotus CORE"]`，
`cautions_zh` 一律 `["CloudTCM","WHO SAPL 2008"]` …… **不管那一欄實際上有沒有內容、
內容是什麼。** 唯一逐穴變的是課件的 `#pN` 頁碼。

> **派工單問「雙來源是否逐欄反映，還是每筆只宣告一次」——答案是後者。
> `source_type: "sourced_cloudtcm_and_elotus"` 與 `field_sources` 兩者都是
> 記錄級的宣告；`field_sources` 的形狀證明它是一次批次寫入的模板，
> 不是逐欄核讀的結果。**

---

### AP-26 — 定位與禁忌 —— 全卡最帶主張的兩欄 —— 在 361 筆裡沒有任何來源

**嚴重度：CLINICAL（來源紀律）。**

上面 13 個鍵裡**沒有**：

```
location_zh · location_en · cun_measurement · needling · contraindications ·
contraindications_en · danger · moxa_zh · moxa_en · massage_zh · modern_research_zh ·
point_identity_zh/_en · related_conditions · tcm_pattern_ids · classical_refs

→ 361 / 361 穴，這些欄位零來源
```

憲法第四條：「劑量、**刺深**、毒性、孕期、藥物交互：絕不虛構數字，必須具名來源」。
**`needling`（刺深）與 `contraindications`（孕期）兩欄，全層零來源標註。**
`acumethod_zh` 有來源（`["CloudTCM","eLotus CORE"]`），但那是印章，
而且 `needling` 與 `acumethod_zh` 的第一行在 361/361 穴完全相同 —— 前者是後者的副本。

`docs/AI_CONSTITUTION.md` §R2 Evidence 慣例要求「per-field 來源錨點 + **擷取日期**」：

```
field_sources 內含 YYYY-MM-DD 形式日期的穴數：0 / 361
```

唯一的日期是記錄級的 `cloudtcm_fetched_at`（`2026-07-23T08:16–08:2x`，
361 筆全部在同一次批次抓取的幾分鐘內）。eLotus 側**沒有任何擷取時間**。

---

### AP-27 — `field_sources` 為空欄與亂碼欄掛名來源

**嚴重度：CLINICAL（來源紀律）。**

因為印章不看內容，就出現了：

```
anatomy_en 是標點湯，而 field_sources.anatomy_en = ["WHO SAPL 2008","eLotus CORE"]
                                                                   → 225 / 361
cautions_en 是空的，而 field_sources.cautions_en = ["WHO SAPL 2008","eLotus CORE"]
                                                                   →  67 / 361
                                                （含 BL1 睛明、BL13 肺俞、BL60 崑崙、BL67 至陰）
```

模板 §2.7 寫明「**不准出現沒有實際核讀的來源名稱**（同 `HERB_RECORD_STANDARD.md` §4.5）」。
一個空欄位不可能核讀過 WHO SAPL 2008。

這與中藥層 H-34 是同一族問題（`field_sources` 引用外來 CloudTCM id，21 張），
但形態不同：**中藥層是引錯了 id，穴位層是根本沒有逐欄動作。**

---

### AP-28 — 三份逐字重複：`evidence` ≡ `modern_research_zh` ≡ `cloudtcm_detail` 346/361；`contraindications` ≡ `cautions_zh` 272/361

**嚴重度：QUALITY。**

```
evidence === modern_research_zh          346 / 361
cloudtcm_detail === modern_research_zh   346 / 361   → 同一段文字存三份
contraindications === cautions_zh        272 / 361（逐字，含陣列順序）
```

前者驗證器已列為「全庫既有清理（報告不擋）」。後者沒有列 ——
而它與 AP-06 是一體兩面：272 筆同步、21 筆不同步，**沒有任何規則說哪一欄是正本**。

---

### AP-29 — 考點欄大面積樣板化

**嚴重度：QUALITY，但其中一條有臨床後果。**

```
exam_importance："NCCAOM / US Acupuncture Board Exam Focus"                        174 穴共用
                「★ NCBAHM 2026 ACPL 考綱 Domain I（穴位定位，15%）與 Domain III…」  98 穴共用
                「NCBAHM 2026 ACPL 考綱 Domain I（穴位定位，15%）」                   12 穴共用
                → 284 / 361 穴的「考試重要性」是三句話之一

exam_pearl     ：「…考點：五輸穴五行相生母子補瀉法（井主心下滿、滎主身熱、
                   輸主體重節痛、經主喘咳寒熱、合主逆氣而洩）。」                    109 穴共用
                「…考點：解剖定位、針刺深度角度與解剖安全注意事項。」                 44 穴共用

exam_pearl_en  ："High-Yield Board Pearl (<CODE> <Pinyin>): **<identity>**.
                  Core NCCAOM exam focus: point location landmarks, special point
                  classifications, and clinical indications."                       174 穴共用

modern_research_en："Modern Clinical Research: Demonstrates neuro-endocrine modulation,
                    microcirculation regulation, analgesia, and anti-inflammatory
                    pathways in modern cl…"                                          32 穴共用
```

**有臨床後果的那一條**：五輸穴口訣的 109 穴裡包含 **GB22 淵腋**，
它不是五輸穴。卡片對一個肋間穴印出「井主心下滿、滎主身熱…」的補瀉法考點。
（同族還有 BL2 BL3 BL4 BL5 BL6 BL7 BL8 BL9 BL16 BL24 等頭部與背俞穴。）

---

### AP-30 — 「共用不等於套話」在本層仍成立，但有一句是真套話

**嚴重度：QUALITY。**

依 A8 修訂的判準（有沒有指名解剖結構／器官／孕期／出血）逐句判：

```
真風險（依 A8 修訂豁免，該留）
  [29] 「胸背部穴位斜刺 0.5-0.8 寸，嚴禁直刺過深以免傷及內臟。」
  [11] 「孕期、生殖治療期間、使用抗凝血藥物,以及症狀嚴重者,須由合格臨床人員評估後操作。」
  [ 5] 「胸骨面淺薄，不可深刺。」      CV16 CV18 CV19 CV20 CV21
  [ 5] 「⚠️ 深刺可能刺穿肺造成氣胸（課件明列）—— 斜刺 0.3–0.5 吋」  ST13-16,18
  [ 5] 「⚠️ 嚴禁深刺以免氣胸。」       KI22-26
  [ 5] 「出血傾向者慎點刺。」           GB44 PC3 PC9 TE1 TE18

真套話（A8 定義的「對任何針刺都成立的空話」）
  [28] 「注意針刺深度與角度，無菌操作；孕婦及體弱者慎用。」   CV24 GV3 GV4 GV5 GV17 GV18 …
       英文對應 cautionsEn [28]「Observe correct depth and angle under aseptic
       conditions. Caution in pregnancy and weak patients.」
  [ 1] 「局部腫痛或傷口時避開。」（LR3，見 AP-12）
```

A8 判 0 是對的（它只看 ≥10 穴且不含具名風險，而那 28 穴那句含「孕婦」二字，
被 A8 修訂後的「有孕期就豁免」規則放行）。**「孕婦及體弱者慎用」作為 28 穴共用的
一般性提醒，與 GB21/LI4/SP6 那種具名機轉的孕禁是兩種東西，
A8 現在無法區分。** 這是規則的已知代價，不是本層造成的。

---

### AP-31 — `tcm_pattern_ids` 的 id 格式，憲法與模板互相矛盾（規則衝突，不是資料缺陷）

**嚴重度：需 Ting 裁定。憲法 §三「規則互相矛盾：停下來問，不要猜著做完一整批」。**

```
data/acupoints/361.json：44 穴有 tcm_pattern_ids，32 個 distinct id，
                          全部是 pat.<中文> 形式（pat.肺氣虛寒 · pat.肝陽上亢 · pat.氣血不和 …）
                          pattern.<english_slug> 形式：0 個

docs/AI_CONSTITUTION.md 紅線 1：
  「證型只有 `pattern.<english_slug>`，不准新增 `pat.<中文>`。」

docs/ACUPOINT_CARD_TEMPLATE.md §6.5(B)：
  「`tcm_pattern_ids` → `data/config/tcm_pattern_canon.json` 的 `pat.*`」
```

兩份**都是規則文件**（CLAUDE.md 指定的兩份），指向相反的方向。
現有 44 筆資料照模板走。本輪**不動**，列為 Ting 的規則裁定項。

---

## §3 總結

### §3.1 數字（每一格都能由 `361.json` ＋ §2 的 predicate 重算）

| 指標 | 30 穴取樣 | 全庫 361 |
|---|---|---|
| CLEAN / MINOR / DEFECT（含全層缺陷） | **0 / 0 / 30** | — |
| CLEAN / MINOR / DEFECT（只算該穴獨有） | **0 / 2 / 28** | — |
| findings 條數 | 31（AP-01…AP-31） | — |
| 其中 SAFETY | 16 | — |
| 其中 CLINICAL | 9 | — |
| **`contraindications_en` 是同一句衛生樣板（＝英文卡的禁忌區塊）** | 27 / 30 | **357 / 361** |
| `cautions_en` 被 `app.js` 讀取 | 0 | **0**（欄位存在，渲染器不讀） |
| `moxa_en` 說 applicable 而中文說禁灸 | 5 | **21** |
| `moxa_en` 含中文整段 | 27 | **354** |
| `needling` 與 `acumethod_en` 深度範圍不同 | 19（列出兩個以上範圍） | **210** |
| ↳ 其中 `acumethod_en` 較深 | — | **134** |
| ↳ 其中位於胸/背/脅/肋/鎖骨/頸 | — | **77** |
| `acumethod_en` 寫 Perpendicular 而中文禁直刺 | 4 | **7** |
| `point_identity_en` 有純標點條目 | 4 | **17** |
| `point_identity_en` 含 "…Channel Point" 填充 | 5 | **135** |
| `point_identity_en` 有重複而 zh 無 | 2 | **20** |
| `exam_pearl_en` 只剩標點 | 3 | **27**（寬判準 35；ST17 兩者皆漏，見 AP-05） |
| `anatomy_en` 標點湯 | 17 | **225** |
| ↳ `anatomy_en` 是真英文散文 | **2（PC6・ST36）** | **2 / 361** |
| `massage_en` 標點湯 | 28 | **358** |
| `combine_points_en` "paired with" 剝空 | 28 | **359** |
| `modern_research_en` 標點湯 | 27 | **327** |
| `action_tags_en` 有 "TCM Action" 而舊欄有真譯文 | 29 | **335**（條目 1433/2886 ＝ 49.7%） |
| `contraindications` 比 `cautions_zh` 長（條目被丟） | 4 | **21** |
| `contraindications` ≡ `cautions_zh` 逐字 | 26 | **272** |
| `evidence` ≡ `modern_research_zh` ≡ `cloudtcm_detail` | 28 | **346** |
| `cun_measurement` 空 | 24 | **231** |
| ↳ 裝英文定位句而非分寸 | 2 | **45** |
| `cautions_en` 空但 `field_sources` 仍掛來源 | 4 | **67** |
| `anatomy_en` 是標點湯但 `field_sources` 掛 WHO SAPL 2008 | 17 | **225** |
| `field_sources` key-shape 種類 | 1 | **1**（361 筆完全相同的 13 鍵） |
| `field_sources` 有 location/needling/contraindications 的 key | 0 | **0 / 361** |
| `field_sources` 含擷取日期 | 0 | **0 / 361** |
| `exam_importance` 是三句樣板之一 | — | **284 / 361** |
| `exam_pearl` 是五輸穴口訣樣板 | 1（GB22，非五輸穴） | **109** |
| `related_conditions` 有值 | — | 179 / 361（中位數 4，最大 115） |
| 掛孕期病症而自己寫孕婦禁針 | 6 | **6** |
| 驗證器判定 | — | `validate-acupoint-standard.js` **PASS**・`validate-content-junk.js` **PASS** |

### §3.2 佔位句／樣板句的普查（派工單指定要數的那一族）

中藥層的四個匯入語（`Draft:` / `Review … before clinical use.` /
`verify against … before source_checked` / `… pattern documentation context only`）
**在 361.json 裡一個都沒有** —— 那是 `js/knowledge.js` 的 `usableText` 過濾對象，
屬中藥／方劑線。**穴位層有自己一整套不同的樣板句**，而且**沒有任何過濾器擋它們**，
所以它們不是「顯示空白」，是**照原樣印在畫面上**：

| 樣板句 | 穴數 | 印在哪 |
|---|---|---|
| `Clinical Cautions: Standard hygienic practice; strictly control insertion depth…` | **357** | 英文卡 CONTRAINDICATIONS 區塊 |
| `Moxibustion applicable: 3-5 moxa cones or 5-15 minutes with moxa roll.` | 354（其中 21 穴中文說禁灸） | 英文卡 MOXIBUSTION 區塊 |
| `NCCAOM / US Acupuncture Board Exam Focus` | 174 | 考點區 |
| `High-Yield Board Pearl (…): Core NCCAOM exam focus: point location landmarks…` | 174 | 英文考點區 |
| `…考點：五輸穴五行相生母子補瀉法（井主心下滿…）` | 109 | 考點區 |
| `Strict caution required. Observe accurate insertion angle and depth…` 等三句 | 84 | `cautionsEn`（第三套安全欄） |
| `Foot Yangming Stomach Channel Point` 型通用身分標籤 | 135 | 身分 chip |
| `…考點：解剖定位、針刺深度角度與解剖安全注意事項。` | 44 | 考點區 |
| `Modern Clinical Research: Demonstrates neuro-endocrine modulation…` | 32 | 現代研究區 |
| `注意針刺深度與角度，無菌操作；孕婦及體弱者慎用。` | 28 | 安全區 |

### §3.3 雙來源到底有沒有讓資料變好？——派工單指定的問題，逐項回答

**先講清楚可比性。** 中藥層批次一取的是慎用藥族（風險加權），本輪取的也是
高風險穴（風險加權）。兩邊的取樣偏誤方向相同，可以比。

#### （1）命中率：雙來源**沒有**比單來源好

| | 中藥層批次一（慎用藥 21＋高頻 9） | 中藥層批次二 | 中藥 CloudTCM 落地子層 | **穴位層本輪** |
|---|---|---|---|---|
| n | 30 | 30 | 24 | **30** |
| CLEAN | 2 | 5 | **0** | **0** |
| MINOR | 15 | 3 | 4 | **2** |
| DEFECT | 13 | 22 | **20** | **28** |
| DEFECT 率 | 43% | 73% | **83%** | **93%** |

兩批中藥合計 60 味：7 CLEAN / 18 MINOR / 35 DEFECT（58%）。
**穴位層 30 穴的 DEFECT 率高於中藥層任何一個切面，包含最差的
`sourced_cloudtcm_record` 子層。**

（風險加權讓兩邊都偏高；但穴位層的 0 CLEAN 對上中藥層的 7 CLEAN，
差距不是取樣造成的 —— 中藥層那 7 張 CLEAN 全是模板級補卡，見下。）

#### （2）雙來源產生了一種單來源不可能有的新失效型態

這是本輪最有價值的結論，也是直接回答派工單那句「不要外推，去量」：

> **雙來源沒有讓內容更準，它讓同一件事有了兩個數字，然後兩個數字各自落在
> 不同的欄位、不同的語言，沒有任何一步把它們對起來。**

```
needling / acumethod_zh   ← CloudTCM 的深度
acumethod_en / cautions_en / exam_pearl  ← eLotus / 課件的深度
兩者不同：210 / 361（58%）
英文那側較深：134
落在胸背頸：77
```

單來源的中藥層**不可能**產生這一族缺陷 —— 它的失效模式是
「有對的數字但渲染器不讀」（H-01/HB-1，維度 A）。
穴位層的失效模式是「**有兩個數字，中文讀者看到淺的、英文讀者看到深的**」。

同一機制的其他產物：AP-07（英文允許直刺、中文禁直刺，7 穴）、
AP-15（英文把兩個獨立風險併成一個因果）、AP-14（同陣列並存慎用與禁針）。
**這些全部是「兩份材料落地後沒有做對照」的直接後果。**

憲法 §4 對這件事有明文規定：「課件與網站衝突 → **兩個都記、標出處**，
絕不擅自二選一」。本層做的是「兩個都記、**不標出處、也不告訴對方存在**」。

#### （3）雙來源在一個維度上確實比較好，但那個好處被第二道機器工序抵消

eLotus 那一側帶進了**中文側沒有的東西**，而且品質不錯：

```
LU1 acumethod_en："…CAUTION: STRICTLY AVOID DEEP MEDIAL PERPENDICULAR INSERTION
                   TO PREVENT PNEUMOTHORAX."
ST9 acumethod_en："…CAUTION: STRICTLY AVOID CAROTID ARTERY PUNCTURE."
GB20 acumethod_en："…CAUTION: STRICTLY AVOID DEEP UPWARD INSERTION TOWARD MEDULLA OBLONGATA."
BL1  acumethod_en："…CAUTION: NO LIFTING/THRUSTING OR TWISTING. Apply firm pressure
                    after removal to prevent hematoma."
```

`acumethod_en` 是**全層唯一一個逐穴具體、且風險具名的英文欄位**。
`cautions_en` 361 筆也都是逐穴撰寫的（不是樣板）。**這是雙來源真正的收穫。**

但是：

```
cautions_en          → app.js 不讀（AP-01），0 / 361 到得了畫面
contraindications_en → 357 / 361 是衛生樣板，而它才是印出來的那一欄
```

**雙來源帶進來的英文安全內容，有一半躺在渲染器讀不到的欄位裡，
另一半被一句樣板取代。** 也就是：雙來源的好處**存在於資料層，
但在顯示層被歸零**。

#### （4）真正的預測因子不是來源數，是「有沒有人逐欄建過這張卡」

中藥層的結論是 `source_type` 決定品質（CloudTCM 落地 = 31/35 DEFECT，
模板級補卡 = 7/7 CLEAN）。穴位層 361 筆 `source_type` **只有一個值**，
那個變數沒有變異，理論上無法檢驗 —— 但樣板卡提供了替代對照：

| | ST36 · PC6（樣板卡，Ting 定案時逐欄建的） | 其餘 359 穴 |
|---|---|---|
| `anatomy_en` 是真英文散文 | **2 / 2** | **0 / 359** |
| `contraindications` 是該穴專屬臨床內容 | 2 / 2 | 見 AP-12/30 |
| `cautions_zh` 含具體操作指示（如 PC6「刺入出現麻電感時應微退針」） | 2 / 2 | 罕見 |
| `needling` 標明來源（「（課件）」「（American Dragon）」） | **2 / 2** | 0（見 AP-26） |
| 仍中 AP-01（英文禁忌樣板） | **2 / 2** | 359 / 359 |
| 仍中 AP-21（TCM Action） | 2 / 2 | 357 / 359 |
| 仍中 AP-18（配穴歸經錯） | **2 / 2** | — |

> **中藥層與穴位層在這一點上結論相反，這是本輪最重要的差異：**
>
> **中藥層的缺陷源頭是「匯入」—— 模板級補卡沒被污染，7/7 CLEAN。**
> **穴位層有第二道工序 —— 一次事後的機器產 `_en` 批次
> （AP-01/02/04/05/19/20/21 全部是它的產物）—— 它蓋過了所有 361 筆，
> 包含兩張手工樣板卡。** 所以穴位層**沒有任何一張卡是乾淨的**，
> 而中藥層有 7 張。

#### （5）最終答案

> **「雙來源（CloudTCM + eLotus）是否代表較好的資料」——不成立。**
>
> 1. **內容準確度沒有變好**：跨穴歸經錯誤 22/118（18.6%），
>    兩張樣板卡也各有一條。這一族全部來自 CloudTCM 的配穴散文，
>    eLotus 沒有覆蓋到它，也沒有校正它。
> 2. **雙來源新增了一族單來源不會有的安全缺陷**：210/361 穴的深度在
>    中英兩欄不一致，英文較深的 134 筆裡有 77 筆在胸背頸。
> 3. **雙來源確實帶進了有價值的英文安全內容**（`acumethod_en` 的具名風險警告
>    是全層最好的欄位），**但顯示層讓它歸零**（AP-01）。
> 4. **`source_type` 在本層沒有鑑別力**（361/361 同值），
>    但它同時也**不是**品質的保證 —— 它宣告的是抓取管線，不是核讀狀態。
>    `field_sources` 的單一 key-shape（AP-25）證明了這一點。
>
> **一句話：中藥層的問題是「來源爛」，穴位層的問題是「來源不算爛，
> 但事後有一道機器工序把英文層做壞了，而且它蓋過了全部 361 筆」。
> 兩層要用完全不同的修法。**

### §3.4 APB 系列 —— 可機械執行、判準已寫死、不需臨床判斷

| # | 內容 | 影響 | 性質 |
|---|---|---|---|
| **APB-1** | **`app.js` 讀 `cautions_en`。** 目前英文卡的 CONTRAINDICATIONS 來自 `contraindications_en`（357 穴樣板），而 361 筆逐穴撰寫的 `cautions_en` 沒有任何程式讀取。**這是純渲染器改動，資料零改動，一次修好 361 穴的英文安全層。** | 361 穴 | **blocking・止血級・第一順位** |
| **APB-2** | 新 predicate：`moxa_en` 含 `Moxibustion applicable` 而 `moxa_zh`/`moxa_en` 含 `不宜運用灸法\|禁灸\|不宜灸\|不可灸` ⇒ FAIL | 21 穴（含 ST17・BL1・ST1・GV15・GV16） | **blocking・止血級** |
| **APB-3** | 新 predicate：`needling` 與 `acumethod_en` 各自解析出的深度區間集合不相等 ⇒ 報。**先跑 warn 拿全層清單，不要一次擋** | 210 穴（77 在胸背頸） | warn → blocking |
| **APB-4** | 新 predicate：`acumethod_en` 含 `Perpendicular` 而中文安全欄含 `嚴禁直刺\|不可直刺\|僅可斜刺\|禁直刺` ⇒ FAIL | 7 穴 | **blocking** |
| **APB-5** | 新 predicate：`point_identity_en` 任一條目不含 `[A-Za-z]` ⇒ FAIL（A4 的補洞：長度相等擋不到位移） | 17 穴 | **blocking** |
| **APB-6** | 新 predicate：`point_identity_en` 有重複條目而 `point_identity_zh` 沒有 ⇒ 報位移嫌疑 | 20 穴 | warn |
| **APB-7** | **把 A8/A11 擴到 `_en` 欄位。** 現在 A8 報「0 distinct shared strings」是因為它不看英文；`contraindications_en` 有一句被 357 穴共用 | 357 + 174 + 84 + 32 穴 | **blocking**（樣板句清單見 §3.2） |
| **APB-8** | 新 predicate：任一 `_en` 欄位出現 ≥3 次「標點接標點」或以標點開頭 ⇒ 報「機器剝空」 | anatomy_en 225 · massage_en 358 · combine_points_en 359 · modern_research_en 327 · exam_pearl_en 27 | warn（量太大，先報數字） |
| **APB-9** | 新 predicate：`action_tags_en[i] === "TCM Action"` 而 `action_tags[i]` 有真譯文 ⇒ 報「可從舊欄還原」。**這是搬遷不是新內容**（憲法 §二.3：先搬再改） | 335 穴 / 1433 條目 | **blocking 候選**（修法已知） |
| **APB-10** | 新 predicate：`contraindications.length > cautions_zh.length` ⇒ 報「安全條目在複製時被丟」 | 21 穴 | **blocking**（哪一欄是正本要先裁定，見下） |
| **APB-11** | 新 predicate：`_en` 欄為空／是標點湯，而 `field_sources` 仍為該欄掛名來源 ⇒ FAIL（模板 §2.7「不准出現沒有實際核讀的來源名稱」的機器化） | cautions_en 67 · anatomy_en 225 | **blocking** |
| **APB-12** | 新 predicate：`needling` / `acumethod_zh` 含 `&[a-z]+;` HTML 實體 ⇒ FAIL | 3 穴（BL1 ST4 TE6） | **blocking**（純字串） |
| **APB-13** | 新 predicate：`exam_pearl` 含五輸穴口訣樣板而 `point_categories` 不含 `five_shu.*` ⇒ 報「非五輸穴印五輸穴考點」 | 從 109 穴中篩（GB22 已確認） | warn |
| **APB-14** | 新 predicate：`cun_measurement` 有值但不含 `\d+\s*(cun\|寸)` ⇒ 報「英文定位句誤填為骨度分寸」 | 45 穴 | warn |
| **APB-15** | 跨穴歸經比對器：從 361.json 自建 `中文穴名 → channel_zh`，掃 `combine_points_zh`/`clinical_pearls` 的「X穴為/屬…經」型敘述。**白名單要含「某臟背俞穴／募穴」的寬鬆講法**，否則會誤報 | 30 穴中 118 主張 / 22 錯；全庫未跑 | warn（**先跑全庫拿數字**） |
| **APB-16** | `related_conditions` 反向檢查：卡片 `functions_zh`/`point_identity_zh` 宣稱主治某病（如 BL67「矯正胎位」）而 `related_conditions` 未掛對應 `cond.*` ⇒ 報 | BL67 已確認；全庫未跑 | warn |
| **APB-17** | 新 predicate：`related_conditions` 含孕期相關 `cond.*` 而安全欄含 `孕婦禁針\|孕婦嚴禁\|孕婦禁用` ⇒ 報「連結與禁忌互相矛盾」 | 6 穴 | warn（裁定屬 Ting） |

**建議執行順序：APB-1（渲染器，零資料改動，一次覆蓋 361 穴）
→ APB-2 / APB-4 / APB-12（三支純機械、合計 31 穴、全部止血級）
→ APB-5 / APB-11 / APB-7（英文層的結構性防線）
→ 其餘 warn。**

### §3.5 必須送 Ting、AI 不得自行處理

依「會不會傷到人」排序，不依發現順序。

**第一級 —— 打開卡片現在就看得到錯的東西**

1. **ST17 乳中整張卡**（AP-16）。三組把它當治療穴的處方要不要刪 —— **屬刪除，必須 Ting**。
   英文側的 `moxa_en`/`contraindications_en`/`point_identity_en` 由 APB-2/APB-7/APB-5 機械處理。
2. **英文卡的禁忌區塊**（AP-01）。APB-1 是渲染器改動，屬 Claude 的路徑，
   但**要先確認 Ting 同意把 `contraindications_en` 那句樣板視為應刪**——
   357 穴同時被影響。
3. **BL60 崑崙 `acumethod_en` 的「medial malleolus」**（AP-08）。
   改成 lateral 是一個字，但**這是安全欄位的內容修正，且要順帶決定
   同型錯誤要不要對 331 個未讀穴做一次全面核對。**
4. **GB20 風池 `location_en` 的 anterior / 項部**（AP-09）。
   哪一邊對要開 WHO SAPL 頁核，AI 不得二選一。
5. **BL1 睛明的 0.5–1.0 vs 0.3–0.5**（AP-10）。眼眶穴的兩倍深度差，需要權威裁定。

**第二級 —— 孕期覆蓋的缺口（「該有而沒有」，機器抓不到）**

6. **LR3 太衝全卡零字孕期**（AP-12）。四關穴的另一半有 5 條。補寫需來源。
7. **CV4 關元的「避免自行刺激」vs「孕婦禁針」**（AP-13）。兩句話強度不同，
   哪一句是給臨床者的，要裁定。
8. **LI11 / CV3 的孕期只在中文側**（AP-13）。補英文屬新內容。
9. **BL60 同陣列並存「慎用」與「禁針」**（AP-14）。
10. **LI4 / SP6 掛 6 個孕期病症而自己寫孕婦嚴禁針刺**（AP-24）。
    這是真實的臨床張力（催產本來就是這兩個穴的用途），**不是錯誤 ——
    但這張卡沒有任何欄位處理它**。要不要新增一個「孕期用法」欄位，屬架構決定。

**第三級 —— 深度的雙來源衝突**

11. **210 穴的中英深度不一致**（AP-03）。憲法 §4 說兩個都記要標出處。
    現在兩個都記了、都沒標。**要決定：標出處（保留兩個數字）還是收斂到一個。**
    這是本層規模最大的臨床裁定，**建議先跑 APB-3 拿到 77 個胸背頸穴的清單再決定。**
12. **SP21 大包的第 6 vs 第 7 肋間**（AP-06 引文）。這個衝突寫在安全欄裡，
    來自課件與 MOA 兩本教材。要裁定或明確標成「兩說並存」。
13. **LI4 的 2–3 寸透刺**（AP-17）。要不要加操作者限制，屬新內容。

**第四級 —— 欄位正本與規則**

14. **`contraindications` 與 `cautions_zh` 哪一欄是正本**（AP-06/AP-28）。
    272 穴同步、21 穴不同步，沒有規則說哪一欄該渲染。**這個裁定不做，APB-10 沒法定義 FAIL。**
15. **`tcm_pattern_ids` 的 `pat.<中文>` vs `pattern.<english_slug>`**（AP-31）。
    憲法紅線 1 與 ACUPOINT 模板 §6.5(B) 直接矛盾，兩份都是規則文件。
16. **`related_conditions` 的 7 條婦科套裝**（AP-22）。30 穴共用同一組 id，
    要不要拆屬內容決定；**LU1→坐骨神經痛、PC7→踝扭傷這類單筆錯連要不要刪，屬刪除。**
17. **BL67 沒有掛 `cond.breech_presentation`**（AP-23）。補連結是新內容。

**第五級 —— 來源紀律（決定上面全部能不能被查證）**

18. **`field_sources` 是 361 筆同款印章**（AP-25）。`location`/`needling`/
    `contraindications` 三欄零來源（AP-26），而憲法第四條把「刺深」與「孕期」
    列為必須具名來源的欄位。**這一條決定這一層要不要重新逐欄標源。**
19. **eLotus 側沒有任何擷取日期**（AP-26）。CloudTCM 有 `cloudtcm_fetched_at`
    （361 筆全在 2026-07-23 同一批），eLotus 完全沒有。R2 Evidence 慣例未達成。
20. **67 穴的空 `cautions_en` 掛著 WHO SAPL 2008**（AP-27）。
    模板 §2.7 明文禁止未核讀的來源掛名。

### §3.6 下一批建議

本輪讀了 30/361（8.3%），0 CLEAN。**不建議再抽 30 穴讀**，理由與中藥層批次二相同
但機制不同：中藥層是「`source_type` 已經是最強預測因子」，
本層是「**七條全層級缺陷已經蓋住 361 筆的 88–99%，再讀只會重複命中同樣七條**」。

1. **先做 APB-1。** 它是渲染器一行判斷，資料零改動，一次讓 361 穴的英文安全欄
   從「357 穴共用的衛生宣導」變成「逐穴撰寫的具名風險」。
   **本輪 16 條 SAFETY 裡有 6 條（AP-01/02 部分・AP-13・AP-14 部分・AP-15・AP-16 部分）
   的臨床後果由這一支直接消除或大幅減輕。**
2. **接著 APB-2 / APB-4 / APB-12。** 三支純機械、無臨床判斷、合計 31 穴，
   全部命中「畫面上正在顯示危險的錯誤」。
3. **跑 APB-15 全庫版拿跨穴歸經的全層數字。** 本輪只在 30 穴上跑，得到 22/118。
   全庫 361 穴的配穴散文都來自同一批 CloudTCM 匯入，
   **這個比率能不能外推，是決定「第 6 區要修還是要重抓」的關鍵數字，
   而它現在是未知數。**（中藥層 §3.6 第 3 點的同型建議。）
4. **`data/acupoints/extra_points.json`（888KB / 72 穴）本輪完全沒讀。**
   它與 361.json 是否共用同一道機器產 `_en` 工序 —— 也就是 AP-01/02/04/05
   會不會同樣命中 —— 目前未知。`app.js:4982` 的註解提到
   「206 of the 947 points」的 `contraindications_en` 是字串而非陣列，
   **暗示奇穴層的形狀與 361 層不同**，值得先做一次形狀比對再決定要不要眼讀。
5. **本輪沒做的一件事，下一輪應該做**：把 `needling`／`acumethod_zh` 的第一行
   與 `acumethod_en` 對照課件 PDF 原文。本輪只證明兩者互相矛盾，
   **沒有證明哪一個忠於課件** —— 那需要跑 `parse-channel-curriculum`，
   而該腳本是 Python（環境無 Python），要先用 JS 重寫。

---

**本輪 `git status` 於 ledger 寫入前為空；除本檔外沒有新增、修改或刪除任何檔案。
`data/**` 零改動。未執行 `git add`、未 commit、未 push。**
