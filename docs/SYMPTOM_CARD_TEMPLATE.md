# 症狀卡片模板(Symptom Card Template)

適用:`sym.*` —— **第四套診斷命名空間,目前 0 筆記錄**。

**驗證器:`node scripts/validate-symptom-standard.js --worklist --all`**

四份詞彙表:
`data/config/symptom_taxonomy.json`(部位 13 類)·
`symptom_quality.json`(性質 14)· `symptom_timing.json`(時間 15)·
`symptom_laterality.json`(側性 6)

姊妹文件:西醫病名 `docs/CONDITION_CARD_TEMPLATE.md` · 中醫病名
`docs/TDIS_CARD_TEMPLATE.md` · 證型 `docs/PATTERN_CARD_TEMPLATE.md`。
命名空間分工 `DECISIONS.md` **D11** · 四件必備部件 **D14** · 邊的單側儲存 **D13**。

Last updated: 2026-08-06(Batch A —— 依 Ting 核可的 implementation proposal 重寫)。

---

## §0 現況與 Batch 邊界

| 部件 | 狀態 |
|---|---|
| 四份詞彙表 | ✅ Batch A |
| 模板(本文件) | ✅ Batch A |
| 驗證器 Y1–Y15 | ✅ Batch A |
| relation registry 三條邊 | ✅ Batch A |
| crosswalk proposal schema | ✅ Batch A |
| **`sym.*` 記錄** | **0 筆 —— Batch B,15 張試點,尚未開始** |

**Batch A 不建立任何 `sym.*` 記錄。** 照 D14 的順序:詞彙表 → 模板 → 驗證器 → 才填內容。

---

## §1 症狀是什麼(以及它為什麼只有一套)

```
sym.*   症狀/體徵   頭痛 · 口苦 · 惡寒 · 耳鳴 · 白帶 · 容易流眼淚
```

**一個觀察。** 不是診斷,不是結論,不帶治法。

### 三條界線

| 不是 | 差別 | 去哪 |
|---|---|---|
| **不是中醫病名** | 「頭痛」當**病名**時是完整的辨證單元(底下分證型、有治法);當**症狀**時只是一個現象,可出現在幾十個病底下 | `tdis.*` |
| **不是西醫病名** | 症狀沒有診斷標準、沒有 ICD 位置 | `cond.*` |
| **不是證型** | 證型是把一組症狀 + 舌脈**推論**出來的結論。症狀是輸入,證型是輸出 | `pattern.*` |

> **同名跨命名空間是兩個實體**(D11)。`頭痛` 同時是 `tdis.*` 的病名和 `sym.*`
> 的症狀 —— 各自保留 id,互相連結,**絕不合併**。兩個不同層級的東西剛好共用一個中文詞。

### 為什麼中西醫共用一套

`頭痛` 與 `headache` 是**同一個觀察的兩種語言**,不是兩個概念。這跟病名不同
(中醫的「眩暈」和西醫的「梅尼埃病」是兩套系統各自定義的實體),也跟證型不同
(證型沒有西醫對應物)。分兩套會讓每條對應變兩倍而換不到東西。

### `tradition` 標的是**術語框架**,不是現象所有權

```
tradition: biomedical | tcm | both
```

**這一欄回答「哪一套診斷框架在使用這個詞」,不回答「這個現象屬於誰」。**
現象不屬於任何一套醫學。

| 症狀 | 常見誤標 | 正確 | 為什麼 |
|---|---|---|---|
| **自汗** | `tcm` | **`both`** | 現象是「不因熱不因動而汗出」。西醫也有 spontaneous / inappropriate sweating,只是不當成一個診斷單元。**中醫給了它名字和辨證位置,不等於西醫的病人不會出這種汗** |
| 口苦 | `tcm` | **`both`** | 西醫是 dysgeusia |
| 盜汗 | `tcm` | **`both`** | 西醫是 night sweats,而且是有名的紅旗(淋巴瘤、結核) |
| 惡寒 | `tcm` | `both` | chills |
| 脈弦 | — | — | **不收(§2)** |

**真正只有一套框架命名的比想像中少。** 標 `tcm` 之前先問:西醫有沒有描述這個現象的詞?
若有就是 `both`,即使那個詞很冷門。

---

## §2 舌象與脈象**不屬於這一層**

`sym.*` **不收舌象、脈象**,理由是它們已經有三個家,而且不是扁平名稱清單:

| 既有位置 | 用途 |
|---|---|
| `visits.tongue_zh` / `pulse_zh` | 每次看診的實際所見 |
| `soap_notes.objective_tongue_zh` / `objective_pulse_zh` | SOAP 的 O |
| `pattern_library` 每筆的 `tongue_zh` / `pulse_zh`(50/50) | 該證型的典型舌脈 |

脈象有部位(寸關尺)、左右、浮沉、脈形 —— 是一套**有維度的受控術語**,
不是可以掛在病症下的症狀條目。舌象同理。

**實測佐證**:129 筆候選裡**沒有任何一筆舌象或脈象**(唯一含「舌」的是
「舌頭痛」,那真的是症狀)。資料本身就沒把它們放進來。

> 需要舌脈受控詞彙時,那是**獨立的一套**
> (`tongue_vocabulary.json` / `pulse_vocabulary.json`),不是塞進 `sym.*`。

---

## §3 ID 規則

| 格式 | 範例 |
|---|---|
| `sym.<english_slug>` | `sym.headache` · `sym.bitter_taste` · `sym.tinnitus` |

- 小寫、底線、**純 ASCII**(D10)。
- id 永不改(D1);退役用 `review_status: "deprecated"`,永不刪(D6)。
- **詞彙表分類 id 是 `sym.<category>`(如 `sym.pain`),記錄 id 是
  `sym.<symptom>`(如 `sym.headache`)** —— 同前綴不同層,記錄用 `taxonomy_ids` 指向分類。

---

## §4 observation_modes[] + primary_mode

### 只有兩個值

```json
{
  "observation_modes": ["patient_reported", "examiner_observed"],
  "primary_mode": "patient_reported"
}
```

| 值 | 誰產生 | SOAP |
|---|---|---|
| `patient_reported` | 病人自述 | **S** |
| `examiner_observed` | 醫者望聞切診 | **O** |

**`instrument_measured` 不是症狀的取得型態。** 儀器值是**另一個實體**:

```
sym.fever            是「現象」    ← 症狀卡
metric.body_temp     是「測量」    ← CG6 的量化層
38.5°C               是「這一次的值」← 病例層
```

三者相關,**不是同一個 entity**。把測量當成症狀的一種型態,會讓症狀卡開始承載
數值語意,而數值語意屬病例層。

### 儀器結果用獨立欄位引用

```json
{
  "id": "sym.fever",
  "observation_modes": ["patient_reported", "examiner_observed"],
  "primary_mode": "examiner_observed",
  "supporting_measurements": ["metric.body_temperature"]
}
```

`supporting_measurements[]` 指向 **CG6 已有的 22 個 `metric.*`**
(`data/clinical_cases/outcome_metrics.json`)—— **不重造量化層**。

> ⚠️ `metric.body_temperature` 目前**不在**那 22 個裡。Batch B 若需要,
> 那是 CG6 的擴充,由 Claude 加進 `outcome_metrics.json`,不是 `sym.*` 自己新增。

### 三條約束(validator 強制)

| 碼 | 規則 |
|---|---|
| **Y11-a** | `primary_mode` **必須是 `observation_modes[]` 的成員** |
| **Y11-b** | `observation_modes[]` 只允許兩個值;出現 `instrument_measured` 即缺陷 |
| **Y11-c** | `supporting_measurements[]` 的每個 id 必須解析到 `metric.*` |

### 跨 mode 的三個標準案例

| 症狀 | modes | primary | supporting |
|---|---|---|---|
| 頭痛 | `[patient_reported]` | `patient_reported` | — |
| 水腫 | `[patient_reported, examiner_observed]` | `examiner_observed` | `metric.*`(體重)|
| 發熱 | `[patient_reported, examiner_observed]` | `examiner_observed` | 體溫 metric |
| 黃疸 | `[examiner_observed]` | `examiner_observed` | 膽紅素 metric |

**`primary_mode` 存在的唯一理由是消除 SOAP 自動填欄的歧義** —— 陣列說「可能怎麼取得」,
單值說「預設填 S 還是 O」。

---

## §5 關係:descriptive edge vs inferential edge

**這一節是本模板最容易被誤解的部分,也是 D13 在症狀層的具體形狀。**

### 5.1 Descriptive edge —— 存在**診斷實體**側,症狀卡上是衍生的

三條,方向一致:「診斷實體列出它的症狀」。

```
edge.condition_symptoms   cond.*    sign_symptom_ids[]        → sym.*
edge.pattern_symptoms     pattern.* key_signs_ids[]           → sym.*
edge.tdis_symptoms        tdis.*    key_manifestation_ids[]   → sym.*
```

**為什麼存在診斷側 —— 四個維度全部同向:**

1. **來源責任** —— 任何 migraine 來源都直接列 unilateral headache / nausea /
   photophobia / phonophobia。**沒有一份來源是「headache 出現在哪些病」。**
2. **自然填充位置** —— 填 migraine 卡時症狀就在眼前。存在症狀側的話,
   **建一張 migraine 卡要跑去改 headache、nausea、photophobia 三張症狀卡。**
3. **語意方向** —— 「此病有此症」是原生;「此症見於此病」是查詢結果。
4. **一致性** —— 三條同向 = 一個心智模型;一條反向 agent 就會記錯。

> cardinality 是這四個維度裡最弱的一個,而且它給出的答案與其他三個相反 ——
> 所以**不用 cardinality 決定 authored side**。

### 5.2 症狀卡上的 `seen_in_*` 是 **derived display fields**

```
seen_in_conditions    ← derived from cond.sign_symptom_ids
seen_in_patterns      ← derived from pattern.key_signs_ids
seen_in_tdis          ← derived from tdis.key_manifestation_ids
```

**這三個欄位不可手填。** 手填 = **Y8 缺陷**(D13:一條邊只存一側,反向永遠衍生)。
它們出現在大卡上是渲染時 join 出來的,不是記錄裡的資料。

### 5.3 Inferential edge —— 存在**症狀**側,而且它不是任何邊的反向

```
sym.differentiation[].points_to → pattern.*
```

**這是症狀卡唯一手填的關係欄位。**

| | descriptive | inferential |
|---|---|---|
| 問的問題 | 「這個證/病**有**哪些症狀?」 | 「這個症狀的**這種性質**指向什麼?」 |
| 方向 | 診斷實體 → 症狀 | 症狀的一個 variant → 證型 |
| 內容來源 | 教科書列表 | **臨床推論**,症狀卡獨有 |
| 存在哪 | 診斷實體側 | **症狀側** |

```yaml
differentiation_zh:
  - variant: 脹痛
    points_to: [pattern.qi_stagnation]
    distinguishing: 情緒波動時加重，按之不減
  - variant: 刺痛
    points_to: [pattern.blood_stasis]
    distinguishing: 痛處固定不移，夜間加重
```

> ⚠️ **`differentiation[].points_to` 不是 `edge.pattern_symptoms` 的反向。**
> 前者說「脹痛這種性質指向氣滯」,後者說「氣滯證見脹痛」——
> **一個是推論、一個是描述,兩條不同的邊。**
> 下一個 agent 若把它當重複刪掉,那是誤判 D13。

---

## §6 欄位表(驗證器 Y8 的依據)

不在表內 = Y8。要加欄位:本文件 → 驗證器 → 才改資料。

### 6.1 身分(必填)

| 欄位 | 說明 |
|---|---|
| `id` | `sym.<ascii_slug>`,永不改 |
| `name_zh` / `name_en` | 雙語症狀名 |
| `pinyin` | **不加聲調**;`pinyin_toned` 僅供顯示 |
| `aliases_zh` / `aliases_en` | 別名。**症狀的別名最多**(頭痛/頭疼、耳鳴/耳中鳴響)—— 病人用詞跟教科書不同,別名就是搜尋命中率 |
| **`taxonomy_ids`** | 陣列,來自 `symptom_taxonomy.json`。一個症狀可屬多個部位 |
| **`tradition`** | `biomedical` \| `tcm` \| `both`(§1:術語框架,不是所有權)|
| **`observation_modes`** | 陣列,只允許兩個值(§4)|
| **`primary_mode`** | 單值,必須是 `observation_modes` 的成員(§4)|
| **`safety_review_status`** | 四值之一(§6.6)—— **Y4 檢查的是這個** |
| `safety_review_sources` | `no_specific_red_flags_identified` 時必填 |
| `review_status` · `authored_by` | |

### 6.2 描述(雙語成對)

| 欄位對 | 說明 |
|---|---|
| `definition_zh` / `_en` | 這個症狀是什麼 |
| `patient_words_zh` / `_en` | **病人實際會怎麼講**(「悶悶的」「像有東西壓著」)。給診間用,不是給教科書用 |

### 6.3 `clinical_attributes` —— 定義維度,**不放實例值**

**卡片說「這個症狀該問哪些維度、各維度有哪些值」;病例說「這一次是哪個值」。**

```json
"clinical_attributes": {
  "location":   { "applicable": true,  "vocabulary": "symptom_taxonomy" },
  "quality":    { "applicable": true,  "vocabulary": "symptom_quality",
                  "diagnostic_note_zh": "脹屬氣滯 · 刺屬血瘀 · 空屬虛" },
  "laterality": { "applicable": true,  "vocabulary": "symptom_laterality" },
  // ⚠️ symptom_laterality 目前含一個相容值 `migratory`(遊走)。它描述的是
  //    位置隨時間移動,不是側性 —— 15 張試點後判斷是否拆成
  //    symptom_distribution_or_mobility。UI 不可把它渲染成一個「側」。
  "timing":     { "applicable": true,  "vocabulary": "symptom_timing" },
  "severity":   { "applicable": false, "why": "實例值，屬病例層" },
  "duration":   { "applicable": false, "why": "實例值，屬病例層" }
}
```

**Y14 阻擋實例值。** `"severity": 8` 或 `"duration": "3 days"` 出現在卡片上即缺陷 ——
那是病例層的東西(§8)。

### 6.4 問診

```yaml
inquiry_zh:
  - dimension: 部位
    why: 前額陽明 · 兩側少陽 · 巔頂厥陰 · 後枕太陽
  - dimension: 性質
    why: 脹屬氣滯 · 刺屬血瘀 · 空屬虛 · 重屬濕
```

`dimension` 固定詞彙:`部位` · `性質` · `時間` · `程度` · `誘因` · `緩解` ·
`伴隨症` · `病程`。不要發明新的。

### 6.5 鑑別(唯一手填的關係欄位,§5.3)

`differentiation_zh` / `_en` —— `points_to` 的每個 id 必須解析(Y6)。

### 6.6 安全:要求的是**做過審查**,不是「一定有紅旗」

**Y4 檢查 `safety_review_status`,不檢查有沒有紅旗。**

要求每張卡都掛一個 flag,會讓低風險症狀(口臭、打嗝、腹脹、健忘)被硬塞一個
`urgent_red_flag_review` —— 最後 100 張卡帶同一個萬用 flag,那是假安全感,
正是本專案最想避免的模板污染。

```json
{
  "safety_review_status": "no_specific_red_flags_identified",
  "safety_review_sources": ["<查過哪些來源>"],
  "safety_flags": [],
  "red_flags_zh": [],
  "red_flags_en": []
}
```

| 值 | 意思 | Y4 另外要求 |
|---|---|---|
| `specific_red_flags_present` | 本症狀有自己的紅旗 | `red_flags_*` 不得為空 |
| `shared_flags_linked` | 由既有 safety_flag 涵蓋 | `safety_flags` 不得為空 |
| `no_specific_red_flags_identified` | **查過,確實沒有** | **必須有 `safety_review_sources`** |
| `needs_safety_review` | 尚未審查 | —— 誠實的預設值 |

> **「查過確實沒有」是一個真實答案,但它是一個關於「查了哪些來源」的宣稱。**
> 沒有 `safety_review_sources`,它跟「根本沒人查」在資料上無法區分。
> 半成品的卡應該寫 `needs_safety_review`,不要假裝。

### 兩層紅旗:通用引用,特有自寫

| 欄位 | 放什麼 | 來源 |
|---|---|---|
| `safety_flags[]` | **通用**安全規則 → 引用既有 id | `data/config/safety_flag_vocabulary.json`(47 個,其中 `kind: red_flag` 7 個)|
| `red_flags_zh/en[]` | **本症狀特有**的紅旗,五欄結構 | 逐條標來源 |

可直接引用的 7 個:`psychiatric_red_flags` · `neurologic_red_flags` ·
`respiratory_red_flags` · `gi_red_flags` · `chest_pain_red_flag` ·
`urgent_red_flag_review` · `active_bleeding_medical_review`

> **症狀層的紅旗比病名層更關鍵。** 病人不會說「我有蜘蛛膜下腔出血」,
> 他會說「我頭痛」。**紅旗掛在症狀上才攔得住。**

#### ⚠️ 為什麼逐字重複偵測是 N3(提示)而不是 Y15(阻擋)

**阻擋型逐字比對會獎勵改寫。** agent 把「突發劇烈頭痛」改成
「突然出現非常嚴重的頭痛」,檢查就安靜了,而 boilerplate 還在 —— **訊號沒了、
內容沒改**,比不檢查更糟。那條規則會變成在優化「用詞變化」而不是「內容整併」。

所以拆成兩層:

| 檢查 | 阻擋? | 做什麼 |
|---|---|---|
| **N3** | ❌ 提示 | 逐字重複 → **整併候選**。人來判斷它是不是通用 |
| **Y15** | ✅ 阻擋 | 該句已登記在 `data/config/generic_red_flag_map.json` —— **人已經裁定過**它屬於某個 safety_flag |

```
機器找出候選  →  人裁定是否通用  →  進 generic_red_flag_map  →  機器從此阻擋
```

這是 boilerplate 的棘輪:每登記一句,那個寫法就永久關閉。**而機器從不自己
做「這句是通用的」這個判斷。**

語意重複(「急性爆發性劇烈頭痛」)**兩層都抓不到,只有人審看得出來。**

### 6.7 衍生欄位(**不可手填**,§5.2)

`seen_in_conditions` · `seen_in_patterns` · `seen_in_tdis` —— 手填 = Y8。

### 6.8 來源

`sources`(唯一正典來源欄位)· `field_sources` · `source_type`

---

## §7 驗證器錯誤碼

| 碼 | 意義 |
|---|---|
| Y1 | 缺核心身分(id / name_zh / name_en / pinyin) |
| Y2 | 重複 id |
| Y3 | id 不是 `sym.<ascii_slug>` |
| **Y4** | **`safety_review_status` 缺失/無效,或與卡片內容不符** —— 要求的是**做過審查**,不是有紅旗 |
| Y5 / Y9 | `_zh` 有內容但 `_en` 空(或反向) |
| Y6 | 關係 id 解析不到(含 `differentiation.points_to`) |
| Y7 | 陣列 `_en` 與 `_zh` 長度不一致 |
| Y8 | 未經核准的欄位 **或手填衍生欄位**(D13) |
| Y10 | `taxonomy_ids` 缺失或不在詞彙表 |
| **Y11** | `observation_modes` / `primary_mode` 違反 §4 三條約束 |
| Y12 | `tradition` 缺失或不是三值之一 |
| Y13 | `pinyin` 帶聲調 |
| **Y14** | **`clinical_attributes` 裡出現實例值**(severity/duration 有值)|
| **Y15** | 該句已登記在 `generic_red_flag_map.json`(**人已裁定為通用**)→ 應引用 safety_flag |
| N1 / N2 | 無 `differentiation` / 無 `inquiry` —— 提示 |
| **N3** | **紅旗句逐字重複於 2+ 筆 —— 整併候選,刻意不阻擋**(§6.6)|

---

## §8 canonical symptom vs 病例 observation

```
sym.headache              知識實體:是什麼、該問什麼、指向哪些證型
visits.subjective_*       病例實例:「今天右側搏動性頭痛 8/10，三天」
visit_outcomes            可量化追蹤:pain_score = 8
```

| | canonical `sym.*` | 病例 observation |
|---|---|---|
| 存什麼 | 維度定義、允許值、鑑別指向、紅旗 | **這一次的值** |
| severity | ❌ 只說「有嚴重度維度」 | ✅ `8/10` |
| duration | ❌ | ✅ `三天` |
| laterality | ❌ 只說「有側性維度」 | ✅ `right` |
| 版控 | git(知識層) | **gitignored**(D7) |
| 誰改 | 填充線 | Ting 在診間 |

**Y14 就是防這條線被跨過的。**

---

## §9 DON'T

1. **不要把症狀卡寫成病名卡。** 不帶治法、不帶方藥。
2. **不要合併 `頭痛`(症狀)與 `頭痛`(中醫病名)。** 兩個實體,兩個 id。
3. **不要為中醫症狀另開命名空間** —— 用 `tradition`(§1)。
4. **不要把 `tradition` 當成現象所有權。** 自汗、盜汗、口苦都是 `both`。
5. **不要收舌象脈象**(§2)。
6. **不要手填 `seen_in_*`** —— 那是衍生的(§5.2)。
7. **不要建立症狀與證型的一對一等同。** 脹痛「可能指向」氣滯,不是「等於」。
8. **不要把實例值寫進 `clinical_attributes`**(§6.3)。
9. **不要每張卡重寫通用紅旗** —— 通用的引用 `safety_flags`(§6.6)。
10. **不要一次匯入 129 筆候選。** 那是缺口地圖不是內容 ——
    記錄在有人用真來源填的時候才誕生。
11. **不要自動拆四字症狀。** 實測:嚴格判準下 112 筆四字裡只有 3 筆確定可拆
    (口苦咽乾 · 心悸健忘 · 心悸失眠),其餘 109 筆需逐筆人工判斷。
    樸素 2+2 拆解會產生 192 個原子(比原本 182 還多)與 `面色+萎黃` 這種垃圾。
12. **拼音不加聲調。**
