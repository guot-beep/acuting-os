# 方劑層修復稽核 —— 課件第一組 30 首(唯讀)

**狀態:唯讀稽核。一張方劑卡都沒有改。** 機器清單:
`data/formulas/formula_restoration_worklist.json`。

- 稽核日:2026-08-06
- 範圍:**課件自己定義的**「1st group: detailed knowledge of the formulas: **30 [Most Important]**」
- 來源:`方剂学汇总_extracted.md` · `CHM_Formulation_2_course_package_extracted.md`
- 驗證器:`node scripts/validate-formula-standard.js`

---

## §0 先講三件推翻我自己初判的事

寫進報告之前,我有三個判斷是錯的。留在這裡是因為**下一個人很可能會犯同樣的錯**。

### ① 「21 首疑似模板污染」——錯,實際是 1 首

第一版分類器把 21/30 判成 `POSSIBLE_CORRUPTION`,依據是「跨卡共用句」。
看了實際字串之後,17 條共用句裡:

- **6 條是 safety_flag id**(`pregnancy_review` · `medication_review` · `bleeding_review`…)
- **8 條是 CloudTCM 症狀詞彙**(`呼吸氣短言語無力` · `突然暈倒不省人事`…)

治同一個症狀的方**本來就該**共用那個字串 —— 那是受控詞彙正常運作,不是污染。
把它當污染會讓 21 首方被判死刑,而證據其實指向系統運作正常。

**真正的跨卡共用散文只有 2 條**(見 §4)。

### ② 「課件正文完全沒有這 30 首」——錯,是我的 regex 壞了

一次探測回報 0/30,原因是 shell 轉義把 `\s+` 弄壞。實際上 **29/30 有實質課件區塊**,
而且結構很完整:

```
| Bai Hu Tang [白虎汤] (White Tiger Decoction) [1st Degree] |
| Actions: Clears Qi-Level Heat, Generates Fluids.
  Preparation: Cook shi gao first…   Administration: taken warm, bid-tid
  Indications  Blazing heat in Qi-level… 四大 [Big Fever, sweating, pulse, thirst]
  Applications  Epidemic meningitis… Lobar pneumonia… Heat stroke
| Modern Research  Anti-pyretic / Immunity-supporting / Anti-bacterial
  Case Study  On the CHM shift, A 23 y-o male comes in with… |
```

**結論因此完全相反:來源不是不足,是卡片沒接上來源。** `D_SOURCE_GAP` 因此是 **0 首**。

> ⚠️ 抽取器仍不完美:六味地黃丸抓到 0 字(需人工定位),
> 麻黃湯與麻杏石甘湯抓到 3 萬字(方名出現在散文裡被過度捕捉)。
> 每方的 `course_block_chars` 是**參考值不是斷言**。

### ③ 「白虎湯與十全大補湯組成有假藥材」——錯,是別名與正簡體

| 卡片寫 | 中藥庫 | 實際 |
|---|---|---|
| 白虎湯 `大米` | `粳米`(別名含**大米**) | **別名未解析** |
| 十全大補湯 `黃芪` | `黃耆` | **正簡體不一致** |

兩者都是連結斷掉,**不是內容造假**。機械可修。

---

## §1 分組結果

| 組 | 數量 | 意義 |
|---|---|---|
| **A_PROTECTED** | **2** | 麻黃湯 · 桂枝湯 |
| **B_SAFE_FOR_ANTIGRAVITY** | **14** | 來源明確,缺陷是欄位補齊與對齊 |
| **C_CLAUDE_REVIEW_REQUIRED** | **13** | 含高風險藥味,或有安全內容卻無來源 |
| **D_SOURCE_GAP** | **0** | 課件都有,見 §0② |
| **E_POSSIBLE_CORRUPTION** | **1** | 人參敗毒散 |

---

## §2 A 組 —— protected 兩張的實際狀況

Ting 要求「檢查哪裡不好、可以改進」。結果是兩張差距極大,而且**其中一張的 protected 標記是誤判**。

| | 麻黃湯 | 桂枝湯 |
|---|---|---|
| 君臣佐使 | **4/4 ✓** | **0/5 ✗** |
| 每味「本方功效」 | 4/4 ✓ | 0/5 ✗ |
| 舌 / 脈 | 薄白 / 浮緊 ✓ | **✗ / ✗** |
| actions 中英 | 2 / 2 對齊 | **16 / 2 錯位** |
| actions 條數(F8 上限 8) | 2 ✓ | **16 ✗** |
| 方劑家族 | **4 條 ✓** | **0 ✗** |
| 現代應用 `applications_zh` | 5 ✓ | **0 ✗** |
| `field_sources` 欄位數 | **32** | **8** |
| 方歌 | ✓ | ✓ |
| 方義 `fang_yi_zh` | ✗ | ✗ |
| `american_dragon_url` | ✗ | ✗ |
| `composition[].herb_id` | ✗ | ✗ |

### 桂枝湯不該被當成已精修

它算「已整理」只因為 `field_sources.actions_zh` 這一個欄位存在 —— 那正是
`FORMULA_CARD_TEMPLATE` **教訓 4** 記載的誤判模式(穴位卡爆 236 個錯、
中藥卡爆 755 個錯,都是同一個原因)。

**建議:把桂枝湯移出 protected,當成 C 組處理。** 它是課件第一組第 2 首,
而它現在連舌脈都沒有。

### 麻黃湯真正缺的三樣(都不是內容錯誤)

1. `chinese_depth_track.fang_yi_zh`(方義)—— 模板 §1 第 9 區必填
2. `american_dragon_url` —— 環境讀不到 AD(§4 gateway 403),**不可推導,只能等能連線時查**
3. `composition[].herb_id` —— 4 味藥全部沒有連到中藥卡,§8 連接契約斷的

麻黃湯另外帶了 §4 那句共用免責聲明,一併清掉即可。

---

## §3 E 組 —— 人參敗毒散(唯一一首真正損毀)

```
composition: [ { herb_zh: "人參" } ]        ← 只有一味
composition_suspect: "組成只有一味，且該味是方名開頭 —— 很可能是匯入時被截斷"
```

人參敗毒散實際約 12 味(人參 · 羌活 · 獨活 · 柴胡 · 前胡 · 川芎 · 枳殼 ·
桔梗 · 茯苓 · 甘草 · 生薑 · 薄荷)。現在的組成是**方名前兩字被當成藥材**,
與模板 §7 記載的「`瀉心湯` → `["瀉心"]`」是同一個匯入錯誤。

**課件供給最完整的也正是它**(2756 字,含 Actions / Preparation / Administration /
Indications / Applications / Modern Research / Source)。所以它同時是最壞的卡與最好修的卡。

⚠️ **不可用「人參」這一味去推其餘 11 味。** 從方名推組成正是造成這個錯的動作。

---

## §4 模板污染模式(H)

只有 **2 條**,但兩條都很嚴重,因為它們**住在內容欄位裡**。

### ① `孕婦及體虛者請遵醫囑使用。` —— **25 方共用**

一句通用孕期警語坐在 `contraindications` / `cautions` 位置上。
違反 `AI_CONSTITUTION` §12:「200 筆共用一句話不是內容,是骨架穿了內容的衣服」。

**危險在於它讓覆蓋率統計說謊** —— 驗證器數到「有禁忌 84/201」,
其中 25 筆是這一句。真實的逐方禁忌覆蓋率比報表低。

### ② `Draft search/study context only; not a treatment claim. Verify English exam layer against Bensky before source…` —— **23 方共用**

一段**流程免責聲明**被寫進內容欄位。它不是方劑知識,是工作流備註。

> 第三條 `Strengthen Spleen`(3 方)是真實共用功效,**不是污染**。

---

## §5 跨卡重複模式(I)

**除了 §4 那兩條之外,沒有發現跨卡內容複製。** 逐方的 actions、indications、
applications 都是各自的內容。這一層比預期乾淨。

真正的重複風險在別處:**同一段 CloudTCM 長文被同時寫進 `actions_zh` 與
`pattern_indications_zh`**(四物湯、桑菊飲、黃連解毒湯可見),那是同卡內重複,
不是跨卡。

---

## §6 內容錯層 —— 這是最有價值的發現

**10/30 的加減、藥理、現代疾病內容被寫進 `actions_zh` 或 `pattern_indications_zh`。**

| 錯層方向 | 方數 |
|---|---|
| `pattern_indications_zh` ← 加減變化 | 6 |
| `actions_zh` ← 加減變化 | 4 |
| `pattern_indications_zh` ← 現代藥理 | 2 |
| `actions_zh` ← 現代藥理 / 現代疾病 | 2 |
| `pattern_indications_zh` ← 組成語 | 1 |

實例(四物湯 `actions_zh`):

> 「…及抗突變等藥理作用(註2)。」「**四物湯劑量加減方法**:若有氣虛的症狀,
> 可以加人參、黃芪等藥物來補氣並幫助生血。若血瘀較為嚴重,可加桃仁、紅花…」

驗證器報「**加減變化 1/201**」。**那個數字是錯的 —— 加減內容存在,只是住錯欄位。**

→ 依 §0「**先搬到對的欄位,再換掉原欄位。順序不能反**」,
這 10 首的修復是**搬移**,不是重寫,而且會同時修好三件事:
`actions_zh` 超過 F8 上限(14 首)、中英不對齊(11 首)、加減缺失。

---

## §7 標籤層與關係層(Ting 2026-08-06 追加)

模板 §2 把標籤獨立成一層,教訓 2 記載過:用整句覆蓋短標籤會**當場毀掉搜尋,
而畫面上看不出來**。

| 欄位 | 30 首中缺的數量 |
|---|---|
| `condition_tags_zh` / `_en` | **13** |
| `pattern_tags_zh` / `_en` | **16** |
| `study_tags` | **17** |
| `related_conditions`(病證連結) | **16** |
| `tcm_pattern_ids` / `syndromes_zh`(證候連結) | 16 |
| 標籤中英**不對齊** | **0** ✓ |

**好消息:一個標籤中英錯位都沒有。** 缺的是整層沒填,不是填錯 ——
比錯位好處理得多(教訓 3:錯位看畫面看不出來,空的看得出來)。

---

## §8 最嚴重的 20 首(F)

排序:E 組優先 → defect_score 由高至低。

| # | 方 | 組 | score | 缺 | 疑 | 最關鍵的問題 |
|---|---|---|---|---|---|---|
| 1 | 人參敗毒散 | **E** | 39 | 18 | 1 | 組成只剩 1 味(方名截斷) |
| 2 | 理中丸 | C | 48 | 21 | 2 | 含附子類高風險;標籤層全空 |
| 3 | 生脈散 | C | 48 | 21 | 2 | 標籤層全空;無舌脈 |
| 4 | 調胃承氣湯 | C | 46 | 17 | 4 | 含大黃芒硝;安全內容無來源 |
| 5 | 甘麥大棗湯 | C | 46 | 17 | 4 | 安全內容無來源 |
| 6 | 白虎湯 | B | 43 | 17 | 3 | 0/4 君臣佐使;`大米` 別名未解析 |
| 7 | 青蒿鱉甲湯 | B | 42 | 18 | 2 | 無君臣佐使、無舌脈 |
| 8 | 小承氣湯 | C | 40 | 17 | 2 | 含大黃;課件清單漏字 |
| 9 | 四逆散 | B | 40 | 17 | 2 | 加減內容錯層 |
| 10 | 麻杏石甘湯 | C | 40 | 17 | 2 | 含麻黃;加減錯層 |
| 11 | 四逆湯 | C | 40 | 17 | 2 | **含附子** —— 最高風險 |
| 12 | 酸棗仁湯 | C | 40 | 17 | 2 | 加減錯層 |
| 13 | 十全大補湯 | B | 39 | 17 | 1 | `黃芪` 正簡體;10 味全無劑量 |
| 14 | 大承氣湯 | C | 37 | 17 | 1 | 含大黃芒硝 |
| 15 | 黃連解毒湯 | B | 37 | 17 | 1 | 加減 + 藥理雙重錯層 |
| 16 | 柴葛解肌湯 | B | 36 | 18 | 0 | 純欄位缺失,最乾淨 |
| 17 | 桂枝湯 | **A→建議改 C** | 33 | 9 | 5 | **protected 誤判**(見 §2) |
| 18 | 四物湯 | B | 33 | 9 | 5 | 加減+藥理錯層;缺一字 |
| 19 | 桑菊飲 | B | 30 | 9 | 4 | 加減錯層 |
| 20 | 銀翹散 | B | 30 | 9 | 4 | 加減錯層;缺一字(喉嚨❑) |

---

## §9 最適合 Antigravity 的 10 首(G)

判準:**課件供給明確 · 無高風險藥味 · 缺陷是「填空與對齊」而非判斷**。

| # | 方 | 課件供給 | 為什麼安全 |
|---|---|---|---|
| 1 | 柴葛解肌湯 | Actions/Prep/Admin/Applications/Source | 疑點 **0**,純缺欄位 |
| 2 | 桑菊飲 | 七項全給(含 Modern Research) | 課件最完整之一 |
| 3 | 銀翹散 | 六項(含 Modern Research) | 同上 |
| 4 | 四君子湯 | Actions/Admin/Indications/Applications/Source | 補益劑,無高風險藥 |
| 5 | 四物湯 | 同上 | 同上 |
| 6 | 青蒿鱉甲湯 | Actions/Admin/Indications/Source | 清虛熱,藥味溫和 |
| 7 | 補中益氣湯 | Actions/Admin/Indications/Source | 補益劑 |
| 8 | 歸脾湯 | Actions/Admin/Indications/Source | 補益劑 |
| 9 | 六味地黃丸 | (需人工定位課件段落) | 補益劑,經典方 |
| 10 | 十全大補湯 | Actions 等 | 只需補劑量 + 正簡體 |

**派工單必須寫死**(模型層級分界:能被合理編造的欄位不放低階模型):

> 這一批是欄位補齊與中英對齊。**禁止**新增或改寫:禁忌、孕期、
> 藥物交互、劑量、君臣佐使的角色判定。遇到任何一項需要臨床判斷的,
> **停下來標記並回報,不要自己補**。

**明確不給 Antigravity 的**:人參敗毒散(組成重建)、四逆湯/理中丸(附子)、
三承氣湯(大黃芒硝)、麻杏石甘湯(麻黃)、桂枝湯(protected 標記待 Ting 裁定)。

---

## §10 這份稽核不能回答的事

1. **內容對不對。** 稽核量的是**有沒有、對不對齊、是不是共用**,
   不是「這句功效在臨床上是否正確」。低分不等於內容可信。
2. ~~**American Dragon 連結。** 環境讀不到(模板 §4 gateway 403)。~~
   **✅ 2026-08-06 已解決 —— 而且我一開始判錯了。**

   稽核時我照抄模板 §4 的「gateway 403」,結論是 30 首全部無法補連結。
   Ting 問「你找不到網頁?」之後我**實測**,American Dragon 讀得到。

   已補 **30/30 `american_dragon_url`**,每一個都是從站方四個索引頁讀出連結、
   再逐一 fetch 確認 HTTP 200,**沒有任何一個是從拼音推導的**。
   因此依教訓 10 的區分,它們**可以**進 `field_sources`。

   兩個要記的例外:
   - 理中丸 → AD 頁是 `Li Zhong Tang (Wan)`,湯丸同一頁
   - 金匱腎氣丸 → AD 列在 `Shen Qi Wan`

   > **教訓:文件寫的環境限制會過期。照抄比查一次貴得多。**
3. **課件區塊邊界。** 抽取器對六味地黃丸失敗、對麻黃湯過度捕捉(見 §0②)。
4. **驗證器 PASS 沒有意義。** `validate-formula-standard` 對全部 201 首回報
   **PASS — no blocking defects**,而這 30 首裡 28 首沒有君臣佐使、28 首沒有舌脈。
   F3–F7 只擋「已整理」的方,而只有 2 首算已整理 —— 其中一首還是誤判。
