# 病症 / 證型卡片模板(Condition & Pattern Card Template)

適用:`data/pathology/condition_canon_shortlist.json`(150 筆病症)、
`data/pathology/pattern_registry.json`(61 筆證型索引)、
`data/pathology/pattern_library.json`(50 筆證型內容)。

**驗證器:`node scripts/validate-condition-standard.js --worklist --all`**
—— 這份文件的每一條規則都對應一個錯誤碼。文件與驗證器不一致時,**改文件再改驗證器**,
不要繞過驗證器。

Last updated: 2026-08-05(Claude,在 conditions/patterns 填充衝刺開始前寫)。

---

## §0 五步必跑流程(每一張卡都要走完,不可跳)

沿用 `docs/HERB_CARD_TEMPLATE.md` §0 的紀律。

1. **先跑一次驗證器**,看這張卡目前有哪些缺陷碼。
2. **來源階層**:NCBAHM outline → `curriculum/conditions/`(Ting 的 52 份課堂
   handout,Tier-1)→ CloudTCM / American Dragon → 其他。**課件優先於網站。**
3. **逐欄位填,逐欄位標來源**(`field_sources`)。劑量、刺深、red flags 不得虛構。
4. **雙語成對**。`etiology_zh` 有內容就必須有 `etiology_en`。只填中文 = C5 錯誤。
5. **再跑一次驗證器 + 自己 diff 一次**,確認沒有欄位變短或被清空
   (驗證器 PASS ≠ 沒有損失 —— 見 `CLAUDE.md`)。

---

## §1 四套命名空間,不要混成一個(DECISIONS D11)

**診斷側的知識剛好四套,而且「命名空間就是實體型別」** ——
沒有任何記錄可以帶一個跟自己 id 打架的型別欄位。

| 命名空間 | 中文 | 是什麼 | 現況 |
|---|---|---|---|
| `cond.*` | **西醫病名** | 有診斷標準、檢驗影像、ICD 位置 | **150** ✅ |
| `tdis.*` | **中醫病名** | 典籍病名,以症狀群定義(感冒·咳嗽·喘證·胃痛) | **75** ✅ |
| `pattern.*` | **證型** | 辨證結論,病機的一個切面(肝陽上亢) | **61 / 50** ✅ |
| `sym.*` | **症狀/體徵** | 單一觀察(頭痛·口苦·惡寒) | **0 — 未建** ❌ |

**最容易搞錯的一點:`pattern` 不是中醫病名。**
中醫病名是 `tdis.*`(已經有 75 筆,帶 `classical_source_hint`),
而 150 筆病症早就透過 `related_eastern_diseases` 連過去了(70 個 unique id)。

**為什麼病名與證型不能同一套**:辨證論治建立在**一病多證、同證異病**上。
頭痛底下有肝陽上亢/血虛/痰濕;肝陽上亢又出現在頭痛/眩暈/高血壓/耳鳴。
把它們塞進同一個命名空間,這個多對多結構就塌了 —— **而那個結構就是中醫的診斷邏輯本身。**

**症狀只有一套,不分中西。** 頭痛與 headache 是同一個觀察的兩種語言;
中醫特有的觀察(口苦、舌淡、脈弦)用 `tradition: biomedical | tcm | both`
**標籤**處理,不是開第二個命名空間。分兩套會讓每一條對應都變兩倍而換不到東西。

**跨命名空間的同名是兩個實體**(D3 的規則往上一層)。今天有三個中文名同時
存在於 `cond.*` 與 `tdis.*`:月經過多、月經過少、痔瘡。**各自保留自己的 id,
互相連結,絕不合併。同一個字串 ≠ 同一個實體。**

### 匯入層不是命名空間

`cloudtcm.disease_entry.*`(190)與 `cloudtcm.disease_category.*`(14)
是**來源把手**,**絕不可出現在任何關係欄位**裡。它們的價值是呈現在正典卡上:

- 精確頁 URL → 併進 `sources`(**永不刪除** —— 這就是 Ting 要保留的連結)
- `image_url` → 卡片上的 `cloudtcm_ref` 區塊。**190/190 筆都有圖**,
  那是 Ting 說的「很精緻的具象化理解」。

Ting 原話:「可以整合入那個四套,不用單獨自己雲端中醫一套,
只是雲端中醫有的可以寫入訊息跟 link。」

**最重要的一條臨床安全規則:不准建立一對一等同。**

```
❌ 偏頭痛 = 肝陽上亢
✅ 偏頭痛 → 可能重疊 → 肝陽上亢 / 血虛 / 痰濕 / 血瘀
✅ 肝陽上亢 → 可能出現在 → 偏頭痛 / 高血壓 / 耳鳴 / 更年期
```

關係一律**多對多**,而且要標明強度用語:
`possible_overlap`(可能重疊)· `symptom_overlap`(症狀重疊)·
`clinical_correlation`(臨床相關)。**沒有 `equals`。**

現況:150 筆 `cond.*` 實測**幾乎全是西醫病名**(多囊性卵巢症候群、子宮內膜異位症、
原發性痛經…)。所以 `entity_type` **不是逐筆判斷題,是照命名空間填**:
`cond.*` → `biomedical_condition`,`tdis.*` → `tcm_disease`。
驗證器 C3 會檢查兩者是否一致 —— 一筆 `cond.*` 標成 `tcm_disease` 就是缺陷,
因為中醫病名的家在 `tdis.*`(D11)。

---

## §2 ID 規則(已鎖,不可改)

| 實體 | ID 格式 | 範例 |
|---|---|---|
| 病症(西醫/中醫病名) | `cond.<english_slug>` | `cond.pcos` · `cond.primary_dysmenorrhea` |
| 證型 | `pattern.<english_slug>` | `pattern.liver_yang_rising` · `pattern.blood_stasis` |

- 小寫、底線、**純 ASCII**。
- **id 一旦存在就永不改**(DECISIONS D1)。改名 = 改 `name_zh`/`name_en`,不改 id。
- 退役用 `review_status: "deprecated"`,**永不刪除**(D6)。

> **不准把 id 改成 `condition:pcos` / `pattern:liver-yang-rising` 這種冒號格式。**
> 有外部文件這樣建議 —— 那份文件在這一點上是錯的,它不知道 D1/D2/D3 已鎖,
> 也不知道 `point_id_manifest.json` 是帳本。改 id = 全庫遷移 + 病例外鍵全斷。

---

## §3 欄位表(驗證器的 approved 清單 = C8 的依據)

**不在這張表裡的欄位一律是 C8 錯誤。** 要新增欄位:先改這份文件,再改驗證器,
最後才改資料 —— 順序不能反。

### 3.1 身分(必填)

| 欄位 | 說明 | 缺了會觸發 |
|---|---|---|
| `id` | `cond.*`,永不改 | C1 |
| `entity_type` | `biomedical_condition` \| `tcm_disease` | **C3** |
| `name_zh` / `name_en` | 雙語病名 | C1 |
| `category` | 12 類之一(見 §3.5) | C1 |
| `review_status` | `draft` \| `source_checked` \| `deprecated` | — |
| `aliases_zh` / `aliases_en` | 別名,成對 | C5/C9 |
| `domain` | 橫切專科 tag(DECISIONS D8),多選 | — |
| `icd_hint` | ICD 提示,**僅供參考不是編碼** | — |
| `authored_by` | `owner` \| `model_draft` | — |

### 3.2 內容(雙語成對,單邊填 = C5/C9)

| 欄位對 | 說明 |
|---|---|
| `summary_zh` / `summary_en` | 一段話定義 |
| `western_context_zh` / `western_context_en` | 西醫脈絡 |
| `western_pathology_zh` / `western_pathology_en` | 病理生理 |
| `etiology_zh` / `etiology_en` | 病因病機 |
| **`risk_factors_zh` / `risk_factors_en`** | **危險因子(2026-08-06 新增,見 §5.5)** |
| **`red_flags_zh` / `red_flags_en`** | **安全,見 §5** |
| **`acupuncture_scope_zh` / `acupuncture_scope_en`** | **針灸範圍與共同照護(2026-08-06 新增,見 §5.6)** |
| `classical_references_zh` / `classical_references_en` | 古籍出處 |

> **現況警告**:`etiology_zh` 與 `western_pathology_zh` 在 150/150 都有內容,
> 但**兩者的 `_en` 完全不存在** —— 300 個 C5 缺陷。這是這一層最大的結構債。

### 3.3 關係(一律 id,不放內容)

| 欄位 | 指向 | 檢查 |
|---|---|---|
| `related_patterns` | `pattern.*` | **C6:必須解析得到** |
| `related_eastern_diseases` | 中醫病名 | — |
| **`sign_symptom_ids`** | `sym.*` | **新的正典欄位**(edge.condition_symptoms,D13)。這一側是 authored side:填 migraine 卡時症狀就在眼前,不必去改三張症狀卡 |
| ~~`related_tcm_symptoms`~~ | 症狀 | **deprecated_but_temporarily_accepted** —— 見下 |
| `herb_formulas` | `formula.*` | — |
| `acupoint_protocols` | 穴位處方 | — |
| `medication_links` | 西藥(藥理層做完後接) | — |
| `workflow_links` | 臨床流程 | — |

> #### `related_tcm_symptoms` 的過渡狀態(2026-08-06)
>
> 它是 `sign_symptom_ids` 的前身,而且存的是內嵌 blob 不是 id。三個檔案對它的
> 說法必須一致,否則會出現「registry 說已退役 / validator 說仍核准 / 模板說不能用」
> 這種互相矛盾:
>
> | 規則 | 狀態 |
> |---|---|
> | **新內容一律不准用** | 新的症狀連結寫 `sign_symptom_ids` |
> | 既有那 1 筆(`cond.functional_dyspepsia`)可暫留 | 現在刪掉會在 id 存在之前先丟掉 blob(§0 只加深不刪除)|
> | 仍在 validator 的 approved 清單 | 所以那 1 筆不會變成缺陷 |
> | validator 發 **N2 提示**,不阻擋 | 讓它可見,不讓它擋路 |
> | 遷移後才從 approved 移除 | 那時才轉為 `retired` |
>
> **這是第三種狀態,不是 `retired`。** retired 的欄位是「沒人能寫、也沒有資料
> 持有」;這個欄位還握著資料,所以叫它 retired 而 validator 又核准它,就是
> 自相矛盾。正本記在 `data/config/relation_registry.json` 的
> `deprecated_but_temporarily_accepted`。

### 3.4 來源(**只用 `sources`**)

| 欄位 | 說明 |
|---|---|
| `sources` | **唯一正典來源欄位** |
| `field_sources` | 逐欄位出處(對到 herb/acupoint 卡的做法) |
| `source_type` · `fetched_at` · `content_source` · `public_safe` · `source_status` | 輔助 |

> **C7 = 來源欄位漂移。** 資料裡現在同時存在
> `exact_source_url`(81 筆)、`source_urls`(2)、`source_links`(2)——
> 三個一次性欄位做同一件事。全部折進 `sources`。

### 3.5 `category` 的 12 個值(既有,不要發明新的)

```
gyn_fertility · pain_msk · gi · psych_sleep · respiratory · neuro
derm · endo_metabolic · cardio · uro_renal · ent_eye · immune_misc
```

### 3.6 原始匯入(保留,但永不用於導覽)

`tcm_patterns` —— 728 個內嵌 blob(`{pattern_zh, formula_zh, symptoms_zh}`),
**沒有 id,解析不到任何東西**。它是抓取來的原始素材。

- **保留**(§0 只加深不刪除),當 provenance 用。
- **絕不**拿它做連結或導覽 —— 導覽只走 `related_patterns`。
- 工作方向:把 blob 裡真實存在的證型**提升**成 `pattern.*` 記錄,再寫進
  `related_patterns`。驗證器的 N1 會告訴你還有幾個沒提升(目前 66 筆記錄有落差)。

---

## §4 證型的單一命名空間(架構修正,見 DECISIONS D10)

證型現在散在三個檔案,而且**有兩套不相容的 id**:

| 檔案 | 筆數 | id 格式 | 角色 |
|---|---|---|---|
| `data/pathology/pattern_registry.json` | 61 | `pattern.blood_stasis` | **ID 權威**。每個證型 id 必須先在這裡登記 |
| `data/pathology/pattern_library.json` | 50 | `pattern.lung_qi_deficiency` | **內容層**(舌脈、主症、治則、代表方穴) |
| `data/config/tcm_pattern_canon.json` | 140(134 unique,**6 個重複 id**) | **`pat.氣血不和`** ❌ | **降級為匯入暫存**,不是 canon |

- registry ∩ library = 48(對得上)
- **registry ∩ canon = 0**(完全對不上 —— 兩套獨立宇宙)

**規則(D10)**:

1. **唯一的證型命名空間是 `pattern.<english_slug>`。**
2. `pat.<中文>` **不再產生新記錄**。中文字進 id 在這個 repo 是已知地雷
   (見 `docs/ENCODING_TRIAGE.md` 的 mojibake 史)。
3. 既有的 `pat.*` 記錄**不刪、不改 id**(D1/D6),而是建對照:
   `pat.氣滯血瘀 → pattern.qi_stagnation_blood_stasis`,對照表放
   `data/config/pattern_alias_map.json`。
4. `tcm_pattern_canon.json` 的 `kind` 有兩種:`證候` 115 / `方證` 25。
   **方證(桂枝湯證)和證候(肝氣鬱結)是不同的診斷實體**,不要混進同一份
   pattern registry —— 方證屬方劑層。

> **為什麼這件事必須在填充衝刺之前做完**:如果現在開始填 150 條病症的證型連結,
> 每一條連結都要在兩套命名空間之間擲骰子。之後要收斂 = 動到每一筆病症記錄的
> 全庫遷移。**現在做是一天,之後做是一個月。**

---

## §5 Red flags 規格(安全,C4)

**現況:150 筆裡只有 55 筆有 red flags。95 筆沒有。**

一張沒有 red flags 的病症卡,等於沒有告訴讀者「什麼時候該停手轉診」。
這一層是 BLUEPRINT 臨床北極星的第一順位。

每一條 red flag 要有結構,不要寫成一段散文:

```
finding            具體發現(雷鳴樣頭痛 / 進行性神經缺損 / 停經後出血)
urgency_level      emergency | same_day | urgent | routine | monitor
recommended_action 該做什麼(急診 / 當日轉診 / 影像 / 追蹤)
rationale          為什麼
source             出處
```

`urgency_level` 是固定的五個值,不要發明新的。

---

## §5.5 Risk factors 規格(2026-08-06 新增)

危險因子跟病因病機**不是同一件事**,原本混在 `western_pathology_*` 裡:

- **病因病機**回答「這個病怎麼發生的」——機轉,寫給理解用
- **危險因子**回答「哪些人會得、我該問什麼」——問診用

所以它有自己的欄位。每一條要有結構:

```
factor         具體因子(年齡 > 35 / BMI ≥ 30 / 吸菸 / 一級親屬病史)
direction      increases | decreases           ← 保護因子也是危險因子研究的一部分
modifiable     true | false                    ← 決定它是衛教目標還是背景風險
source         出處
```

**`modifiable` 是這一欄最實用的部分。** 不可改變的(年齡、家族史)用來評估
機率;可改變的(吸菸、體重、睡眠)是你在診間真的能介入的東西。混在一起
就分不出「該擔心」和「該做什麼」。

⚠️ **不要把危險因子寫成因果。** 「相關」不等於「造成」——憲法紅線 9。

---

## §5.6 Acupuncture scope 規格(2026-08-06 新增)

這是整張卡**唯一為執業者本人寫的欄位**。red flags 說的是「什麼時候該停手」,
這一欄說的是「可以做到哪裡」——兩者不能互相取代。

不可以寫成一段散文,否則 150 張卡會長出 150 句聽起來很像的話
(憲法紅線 6 樣板句)。三個子結構:

```
can_treat        這個病針灸的適應範圍是什麼(症狀緩解 / 輔助 / 不適用)
precautions      部位、深度、手法、體位的具體限制
co_management    該跟誰配合、什麼情況要先聯絡對方
```

**三者都要有來源,而且分級。** 「針灸對這個病有效」是療效宣稱,
不是憑感覺寫的:

| 分級 | 意義 |
|---|---|
| `guideline` | 有臨床指引或系統性回顧支持 |
| `label_derived` | 從西藥標籤的警告推導出來的謹慎(例:抗凝劑病人近脊椎深刺) |
| `course` | 課件或老師教的 |
| `clinical_judgment` | Ting 自己的臨床判斷,**明確標記為個人判斷** |
| `unknown` | 尚未查證 —— **這是正確的初始值,不是缺陷** |

### 兩條紅線

1. **不准把療效寫得比證據強。** 機轉 ≠ 療效,動物研究 ≠ 臨床證據(憲法紅線 9)。
   「可緩解症狀」與「可治癒」差很遠。
2. **不准替病人決定停藥。** 例:ticagrelor 標籤明寫「若可能不要停藥」。
   `co_management` 只能寫「聯絡開藥醫師」,永遠不能寫「建議停藥」。
   這是執業範圍問題,不只是安全問題。

範例(抗凝劑相關,`label_derived`):

```
precautions: 近脊椎(督脈、夾脊)深刺特別謹慎;確認末次服藥時間。
             DOAC 無 INR 可查,不要用「沒有數字」當成風險較低。
evidence:    label_derived
source:      dailymed:a454cd24#BOXED_WARNING
note:        標籤講的是神經軸麻醉與脊椎穿刺,未涵蓋針刺 ——
             未給門檻,不自行推導一個。
```

---

## §6 雙語規則

- `_zh` 有內容 → `_en` 必須有內容(C5);反之亦然(C9)。
- **`_en` 欄位裡放中文、或 `_zh` 欄位裡放英文,是缺陷不是內容。**
- 陣列的 `_en` 長度必須等於 `_zh`,**或者整個留空**。
  寧可整個留空,也不要半套錯位(`CLAUDE.md` 索引對齊原則)。

---

## §7 驗證指令

```bash
node scripts/validate-condition-standard.js                        # 總表
node scripts/validate-condition-standard.js --worklist --all       # 列出所有 id
node scripts/validate-condition-standard.js --worklist --category gyn_fertility
node scripts/validate-condition-standard.js --json                 # 給腳本吃
```

錯誤碼:C1 身分 · C2 重複 id · **C3 entity_type** · **C4 red flags(安全)** ·
C5/C9 雙語 · C6 證型連結解析 · C7 來源漂移 · C8 未經核准的欄位 ·
N1 未提升的內嵌 blob(僅提示)。

**2026-08-05 基準線:150 筆、0 筆乾淨、631 個缺陷**
(C3 150 · C5 300 · C4 95 · C7 85 · C9 1)。每一批做完,這些數字要下降。

---

## §8 小卡 / 大卡(同一份資料,兩種呈現)

**設計規則:小卡的欄位是大卡欄位的「子集」,不是另一組欄位。**
一筆資料、一套 schema、兩種渲染。**絕不為小卡新增專用欄位** ——
那會變成兩份 schema,而兩份 schema 必然分岔。

### 8.1 小卡 Preview(搜尋結果、列表、其他卡片的關聯區塊)

只放「認得出來 + 決定要不要點進去」需要的東西:

```
[西醫病名]  多囊性卵巢症候群  Polycystic Ovary Syndrome
cond.pcos · gyn_fertility · ICD hint E28.2
月經稀發 · 不孕 · 多毛                        ⚠ 3 red flags
4 證型 · 6 穴位 · 3 方劑                       [draft]
```

小卡欄位(全部取自大卡):
`entity_type` badge · `name_zh` / `name_en` · `id` · `category` · `icd_hint` ·
`summary_zh` **截斷一行** · 主要症狀 **前 3 個** · **red flag 數量與最高 urgency** ·
關聯計數 · `review_status`

**小卡一定要顯示 red flag 的存在**(數量 + 最高等級)。
安全資訊不能只藏在大卡裡 —— 掃列表的時候就要看得到哪一個有急症鑑別。

**小卡不放**:病理生理、病因、鑑別、治療細節、來源。那些是點進去才看的。

### 8.2 大卡 Detail(單頁細讀)

段落順序固定,**缺的段落不顯示**(不要留空殼標題,那是假完整度):

```
① 定義      名稱 · 別名 · 分類 · ICD hint · 一段話定義
② 病因病機   西醫:病理生理 / 中醫:病因病機 · **危險因子**
③ 臨床表現   主症 · 次症 · 體徵
④ 診斷鑑別   診斷依據 · 鑑別診斷(連到其他病症)
⑤ 安全 ★    red flags(五欄結構)· 轉診條件 · **針灸範圍與共同照護**
⑥ 治療      西醫標準治療 / 中醫辨證論治
⑦ 關聯      證型 · 穴位 · 方劑 · 西藥（多對多,不等同）
⑧ 來源      逐欄位出處
```

**⑤ 安全排在治療之前**,不是排在最後。這對應 BLUEPRINT 的臨床北極星:
中西藥交互安全第一。讀者在想「怎麼治」之前應該先讀完「什麼時候不要治」。

**針灸範圍放在 ⑤ 而不是最後一段**,理由相同:「可以做到哪裡」是安全判斷的
一部分,不是治療技巧的附錄。2026-08-06 有一份外部提案把 red flags 放第 7、
針灸範圍放第 8 —— 那個順序會讓人**讀完治療才讀到警訊**,所以沒有採用。

---

## §9 西醫病名 vs 中醫病名:欄位差異

兩種 `entity_type` **共用同一套 schema**,但填的欄位不同。
**不要為了對稱而硬填** —— 用不到的欄位留空是正確的,不是缺陷。

| 段落 | `biomedical_condition` 西醫病名 | `tcm_disease` 中醫病名 |
|---|---|---|
| ② 病因病機 | `western_pathology_*` 病理生理(機轉、受影響結構、荷爾蒙/神經/發炎路徑) | `etiology_*` 病因(外感/內傷/情志/飲食/勞倦/體質)+ 病機傳變 |
| ③ 臨床表現 | 症狀 + **體徵/檢驗/影像** | 症狀 + **舌脈**(在證型卡上,病症卡只做連結) |
| ④ 診斷鑑別 | 診斷標準、檢驗、影像、鑑別診斷 | **辨證分型**(連到 `pattern.*`)、與相似中醫病名的鑑別 |
| ⑤ 安全 | red flags + 轉診 | red flags + **西醫急症鑑別**(中醫病名更需要這一條:眩暈要先排除中風) |
| ⑥ 治療 | 標準治療、用藥(連 `medication.*`) | 治則治法(在證型卡)、代表方穴(連結) |
| 專屬欄位 | `icd_hint` · `western_context_*` | `classical_references_*` 古籍出處 |

### 三條容易做錯的規則

1. **中醫病名的卡片不要變成證型卡。** 「頭痛」的卡片列出它底下有哪些證型
   (肝陽上亢、血虛、痰濕…),但**每個證型的舌脈治則寫在證型卡上**,
   病症卡只做連結。重複寫 = 兩份會分岔。
2. **西醫病名的卡片不要變成中醫卡。** PCOS 的病理生理要在西醫框架下站得住腳
   (胰島素阻抗、高雄激素、LH/FSH),**不要用「腎虛痰濕」取代它**。
   兩層各自完整,再用多對多連起來。
3. **中醫病名更需要 red flags,不是更不需要。** 「眩暈」「頭痛」「胸痺」
   這類中醫病名底下藏著中風、蜘蛛膜下腔出血、心肌梗塞。
   **中醫病名卡的 red flags 欄位優先於西醫病名卡。**

---

## §10 DON'T

1. **不要建立中西醫一對一等同。** 一律多對多 + 強度用語。
2. **不要改 id 格式。**(§2)
3. **不要在 `pat.<中文>` 命名空間新增記錄。**(§4)
4. **不要拿 `tcm_patterns` 內嵌 blob 做導覽連結。**(§3.6)
5. **不要發明欄位。** 不在 §3 就是 C8;要加欄位先改這份文件。
6. **不要只填中文。** 單邊 = 缺陷。
7. **不要在內容任務裡改 UI**(`app.js` / `index.html` / `styles.css` / `js/`)。
8. **不要跳過 red flags。** 沒查到就寫「查無」並註明查過哪些來源,不要留空。
