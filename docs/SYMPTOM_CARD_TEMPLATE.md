# 症狀卡片模板(Symptom Card Template)

適用:`sym.*` —— **第四套診斷命名空間,目前 0 筆記錄**。
詞彙表:`data/config/symptom_taxonomy.json`(13 類 / 129 筆候選)。

**驗證器:`node scripts/validate-symptom-standard.js --worklist --all`**

姊妹文件:西醫病名 `docs/CONDITION_CARD_TEMPLATE.md` · 中醫病名
`docs/TDIS_CARD_TEMPLATE.md` · 證型 `docs/PATTERN_CARD_TEMPLATE.md`。
命名空間分工看 `DECISIONS.md` **D11**,四件必備部件看 **D14**。

Last updated: 2026-08-06(Claude,補上四套裡最後一份模板)。

---

## §0 現況:這一層還沒有任何記錄

**這是刻意的。** D11 說 `sym.*` 等真的有消費者需要時再建 —— 消費者在
2026-08-06 出現了:雲端中醫的 **129 筆症狀**,每一筆都有精確來源頁與圖,
卻無處可放(它們本來就不是病名,那也是 190 筆裡只有 20 筆對得上病名記錄的原因)。

所以現在有的是**詞彙表 + 缺口地圖**,還沒有記錄。**照 D14 的順序,
模板與驗證器要先於內容** —— 這份文件就是那一步。

| 部件 | 狀態 |
|---|---|
| 詞彙表 `symptom_taxonomy.json` | ✅ 13 類,承自雲端中醫的症狀軸 |
| 模板(本文件) | ✅ |
| 驗證器 | ✅ `validate-symptom-standard.js` |
| 記錄 | **0 筆** — 待建,129 筆候選在詞彙表的 `candidates` 裡 |

---

## §1 症狀是什麼(以及它為什麼只有一套)

```
sym.*   症狀/體徵   頭痛 · 口苦 · 惡寒 · 耳鳴 · 白帶 · 容易流眼淚
```

**一個觀察。** 不是診斷,不是結論,不帶治法。

### 三條界線

| 不是 | 差別 | 去哪 |
|---|---|---|
| **不是中醫病名** | 「頭痛」當**病名**時是一個完整的辨證單元(底下分證型、有治療原則);當**症狀**時只是一個可被觀察到的現象,可以出現在幾十個病底下 | `tdis.*` |
| **不是西醫病名** | 症狀沒有診斷標準、沒有 ICD 位置 | `cond.*` |
| **不是證型** | 證型是把一組症狀 + 舌脈**推論**出來的結論。症狀是輸入,證型是輸出 | `pattern.*` |

> **同名跨命名空間是兩個實體**(D11)。`頭痛` 同時是 `tdis.*` 的病名和
> `sym.*` 的症狀 —— **各自保留自己的 id,互相連結,絕不合併。**
> 這不是重複,是兩個不同層級的東西剛好共用一個中文詞。

### 為什麼中西醫共用一套(不分兩套)

`頭痛` 與 `headache` 是**同一個觀察的兩種語言**,不是兩個概念 —— 這跟病名不同
(中醫的「眩暈」和西醫的「梅尼埃病」是兩套系統各自定義的實體),也跟證型不同
(證型根本沒有西醫對應物)。

中醫特有的觀察(`口苦`、`舌淡`、`脈弦`)用 **`tradition` 標籤**處理:

```
tradition: biomedical | tcm | both
```

分成兩個命名空間會讓每一條對應都變兩倍,而換不到任何東西。

---

## §2 ID 規則

| 格式 | 範例 |
|---|---|
| `sym.<english_slug>` | `sym.headache` · `sym.bitter_taste` · `sym.tinnitus` |

- 小寫、底線、**純 ASCII**(D10:中文進 id 是本 repo 已知地雷)。
- id 永不改(D1);退役用 `review_status: "deprecated"`,永不刪(D6)。
- **詞彙表的分類 id 是 `sym.<category>`(如 `sym.pain`),記錄 id 是
  `sym.<symptom>`(如 `sym.headache`)** —— 兩者同前綴不同層,
  記錄用 `taxonomy_ids` 指向分類,不會混淆。

---

## §3 小卡 / 大卡

**規則同其他三套:小卡欄位是大卡的子集,絕不為小卡新增專用欄位。**

### 3.1 小卡 Preview

```
[症狀]  頭痛  Headache  toutong
疼痛症狀 · 頭面           [tcm+biomedical]
常見於:頭痛(病) · 眩暈 · 高血壓
可能證型:肝陽上亢 · 血虛 · 痰濕 · 血瘀     ⚠ 2 red flags
```

小卡欄位:`name_zh` / `name_en` / `pinyin` · `taxonomy_ids` 的標籤 ·
`tradition` · 相關病名前 3 個 · 可能證型前 4 個 ·
**red flag 數量與最高 urgency** · `review_status`

### 3.2 大卡 Detail

```
① 辨識      名稱 · 別名 · 分類（可多個部位）· tradition
② 描述      這個症狀實際上是什麼、病人會怎麼講
③ 問診 ★    要問什麼才能把它變成可辨證的資訊（見 §4.3）
④ 鑑別 ★    同一個症狀，不同性質指向不同方向（見 §5）
⑤ 安全 ★    什麼樣的這個症狀要立刻轉診
⑥ 關聯      出現在哪些病名 · 指向哪些證型
⑦ 來源      逐欄位出處
```

**③ 和 ④ 是症狀卡不可取代的價值。** 一張只寫「頭痛 = Headache」的卡等於
一本字典;寫出「怎麼問」和「怎麼分」才是臨床工具。

---

## §4 欄位表(驗證器 Y8 的依據)

不在表內 = Y8。要加欄位:先改本文件 → 改驗證器 → 才改資料。

### 4.1 身分(必填)

| 欄位 | 說明 |
|---|---|
| `id` | `sym.<ascii_slug>`,永不改 |
| `name_zh` / `name_en` | 雙語症狀名 |
| `pinyin` | **不加聲調**(搜尋用);`pinyin_toned` 僅供顯示 |
| `aliases_zh` / `aliases_en` | 別名。**症狀的別名最多**(頭痛/頭疼、耳鳴/耳中鳴響),病人的用詞跟教科書不同,別名就是搜尋命中率 |
| **`taxonomy_ids`** | 陣列,值來自 `symptom_taxonomy.json`。**一個症狀可以屬多個部位**(129 筆候選裡有 9 筆跨類) |
| **`tradition`** | `biomedical` \| `tcm` \| `both` |
| `review_status` · `authored_by` | |

### 4.2 描述(雙語成對)

| 欄位對 | 說明 |
|---|---|
| `definition_zh` / `_en` | 這個症狀是什麼 |
| `patient_words_zh` / `_en` | **病人實際會怎麼講**(「悶悶的」「像有東西壓著」)。這一欄是給診間用的,不是給教科書用的 |

### 4.3 問診 ★(症狀卡的核心之一)

一個症狀要能參與辨證,得先問清楚。結構化,不要寫成散文:

```yaml
inquiry_zh:
  - dimension: 部位          # 哪裡痛
    why: 前額陽明 · 兩側少陽 · 巔頂厥陰 · 後枕太陽
  - dimension: 性質          # 脹痛/刺痛/空痛/重墜
    why: 脹屬氣滯 · 刺屬血瘀 · 空屬虛 · 重屬濕
  - dimension: 時間          # 何時發作、持續多久
  - dimension: 誘因與緩解     # 什麼讓它好、什麼讓它壞
  - dimension: 伴隨症        # 同時還有什麼
```

`dimension` 用固定詞彙:`部位` · `性質` · `時間` · `程度` · `誘因` ·
`緩解` · `伴隨症` · `病程`。不要發明新的。

### 4.4 鑑別 ★(同一症狀,不同指向)

```yaml
differentiation_zh:
  - variant: 脹痛
    points_to: [pattern.qi_stagnation, pattern.liver_yang_rising]
    distinguishing: 情緒波動時加重，按之不減
  - variant: 刺痛
    points_to: [pattern.blood_stasis]
    distinguishing: 痛處固定不移，夜間加重
```

`points_to` 的每個 id 必須解析得到(Y6)。
**這一段做好,「症狀 → 證型」的查詢才可能。**

### 4.5 安全 ★

結構同其他三套(五欄、五級 urgency):

```yaml
red_flags_zh:
  - finding: 突發劇烈頭痛，數秒內達最痛
    urgency_level: emergency
    recommended_action: 立即急診
    rationale: 蜘蛛膜下腔出血的典型表現
    source: <確切出處>
```

> **症狀層的紅旗比病名層更關鍵。** 病人不會說「我有蜘蛛膜下腔出血」,
> 他會說「我頭痛」。**紅旗掛在症狀上才攔得住。**

### 4.6 關係(一律 id;反向一律衍生,D13)

| 欄位 | 指向 |
|---|---|
| `seen_in_tdis` | `tdis.*` 出現在哪些中醫病名 |
| `seen_in_conditions` | `cond.*` 出現在哪些西醫病名 |
| `suggests_patterns` | `pattern.*` 可能指向哪些證型(多對多,**不是等同**)|

> ~~`used_by_*`~~ 之類的反向欄位**不准手填**(D13)。

### 4.7 來源

`sources`(唯一正典來源欄位)· `field_sources` · `source_type`

---

## §5 驗證器錯誤碼

| 碼 | 意義 |
|---|---|
| Y1 | 缺核心身分(id / name_zh / name_en / pinyin) |
| Y2 | 重複 id |
| Y3 | id 不是 `sym.<ascii_slug>` |
| **Y4** | **沒有 red flags(安全)** |
| Y5 / Y9 | `_zh` 有內容但 `_en` 空(或反向) |
| Y6 | 關係 id 解析不到(含 `differentiation.points_to`) |
| Y7 | 陣列 `_en` 與 `_zh` 長度不一致 |
| Y8 | 未經核准的欄位(含手填衍生欄位) |
| **Y10** | **`taxonomy_ids` 缺失或不在詞彙表** |
| Y11 | `tradition` 缺失或不是三個值之一 |
| Y12 | `pinyin` 帶聲調 |
| N1 | 沒有 `differentiation`(症狀卡的核心)—— 提示 |
| N2 | 沒有 `inquiry`(問診面向)—— 提示 |

---

## §6 DON'T

1. **不要把症狀卡寫成病名卡。** 症狀不帶治法、不帶方藥 —— 那些在證型卡與病名卡上。
2. **不要把 `頭痛`(症狀)跟 `頭痛`(中醫病名)合併。** 兩個實體,兩個 id,互相連結。
3. **不要為中醫症狀另開命名空間** —— 用 `tradition` 標籤(§1)。
4. **不要建立症狀與證型的一對一等同。** 脹痛「可能指向」氣滯,不是「等於」氣滯。
5. **不要跳過紅旗** —— 症狀層的紅旗比病名層更關鍵(§4.5)。
6. **不要一次匯入 129 筆候選。** 詞彙表裡的 `candidates` 是**缺口地圖不是內容**;
   一筆記錄在有人用真來源填的時候才誕生(D14 建構順序)。
7. **拼音不加聲調。**
