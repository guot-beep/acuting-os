# 外部檢視消化報告 2026-08-02(ChatGPT 三份文件)

Ting 2026-08-05:「這是我之前跟 ChatGPT 討論,給你看我們的討論並思考一下哪些
可行,消化後給我可實踐的報告跟解釋該怎麼做,還有時間表。」

檢視對象(下載於 `~/Downloads`):

| 檔案 | 內容 |
|---|---|
| `Acuting_OS_Condition_Card_Framework_v1_2026-08-02.md` | 病症卡架構:三實體分離、關係物件、Evidence/Notes 實體、大卡 UI、垂直切片 |
| `Acuting_OS_Vision_Roadmap_AI_Governance_2026-08-02.md` | 成熟度 Level 1–6、時間表、**AI 治理**、schema/CI/golden examples |
| `Acuting_OS_Vision_Roadmap_AI_Governance_2026-08-02 (1).md` | **與上一份完全相同**(重複下載),無額外內容 |
| `Acuting_OS_Parallel_Clinical_Curriculum_..._2026-08-02.md` | 職涯:平行課綱、四大臨床支柱、外部進修、畢業能力模型 |

所以實際是**三份**文件。本報告的分診等級:

- **A 立刻做** — 便宜、對到現有真實痛點
- **B 想法對,形狀要改** — 概念採納,實作換成 repo 的樣子
- **C 現在不要做** — 太早,或與已定案/文件自身矛盾
- **D 不可以做** — 會破壞已鎖定的東西

---

## 0. 先講三件事

**① 這三份文件寫的「現況」已經過期。** 它們的日期是 8/02,但 8/01–8/03 之間
Codex 與 Antigravity 又推進了一批。Vision 文件說「Level 1 內容完成度約 25–40%」
—— 以卡片數而言你**已經超過它自己訂的 Level 1 v1.0 門檻**(見 §1)。

**② 這三份文件的價值差距很大。** Vision 文件的**治理**那一段是三份裡最有價值的
東西,而且指出了 repo 真正的洞;Condition 文件的資料模型**大部分你已經有了**,
它的 UI 提案則與 BLUEPRINT 定案衝突;Curriculum 文件基本不是工程文件,但它給了
兩樣 repo 用得上的東西。

**③ 有一項必須先擋下來。** 見 §2 的 D1 —— 如果任何 AI 讀了 Vision 文件的
ID 章節就開工,會造成全庫遷移。派工前務必先講。

---

## 1. 現況快照(2026-08-05 實測)

來源:`data/audits/missing_report.json.quality_layers`(Codex 8/01 重測)+ 本次查核。

| 層 | 卡片 | 達樣板等級 | 已驗證(RV1) | 備註 |
|---|---|---|---|---|
| 穴位 | **769**(標準 361 + 奇穴 72 + 耳/頭/董氏) | **361/361 標準經穴** ✅ | 1 | 活線已換成**經外奇穴 23/72**,49 張在 worklist |
| 中藥 | **329** | **93** | **37** ⬆ | Appendix A 304/304;partial 236 |
| 方劑 | 201 | **2** | 0 | **仍是最大阻塞點** |
| 病症 | 150 | 0 | 0 | 無 grade validator |
| 辨證鑑別 | **41** | 0 | 0 | 已從 11 表長到 41 筆 |

三個必須看懂的變化:

1. **穴位標準經穴已全部通過 validator 樣板等級** —— 7/29 排期寫的「剩 264 穴」
   已作廢。八月的穴位線現在是**經外奇穴 49 張**,不是經穴。
2. **中藥 verified 從 0 → 37,中藥 grade 從 79 → 93。** RV1 真的在動了,這是
   目前唯一在動的「已驗證」欄位。
3. **方劑 template_grade = 2/201。** validator 現在報得出具體缺陷:
   34 damaged text · 55 bilingual alignment · 14 truncated composition ·
   18 outline skeleton。**這不是「沒量尺」了,是量尺裝好而東西真的沒過。**

還沒做的(7/29 排期的第一週工作,至今未動):

- ❌ `report-formula-outline-coverage.js`(Appendix C 181 方 vs 本地 201 筆,從未比對)
- ❌ `stamp-formula-card-grade.js`
- ❌ **`.github/` 不存在 —— 沒有任何 CI**
- ❌ `schemas/` 不存在 —— 沒有任何 JSON Schema
- ❌ `examples/gold-standard/` 不存在

新增的資產(Ting 自己放的,還沒進版控):

- ✅ **`curriculum/conditions/` 有 52 份課堂 handout**(Palpitation、Dizziness、
  Hypertension、Wind Stroke、Fibromyalgia、BPH、Lin syndrome、Male Infertility…)。
  這是病症層的 Tier-1 來源,**病症工作現在有料可做了**。

---

## 2. Grade D — 不可以做(先擋下來)

### D1 ❌ 改 ID 格式 `herb:huang-qi` / `acupoint:st-36` / `pattern:liver-yang-rising`

Vision 文件 §9.2 提出這套 ID 格式。**直接違反 DECISIONS D1/D2/D3(已 LOCKED)。**

repo 實際用的是 `herb.huang_qi`、`SP6`、`formula.gui_zhi_tang`、`ex.hn3`、
`tung.11.01`、`ear.at4`,而且 `data/acupoints/point_id_manifest.json` 有
**681 個 id 的帳本**,`validate-point-ids.js` 會在任何 id 消失時 FAIL。

改 id = 全庫遷移 + 未來每一張 SOAP 的外鍵全斷(D1 存在的唯一理由)。
**這一條要寫進每一份 dispatch 的否決清單。** ChatGPT 不知道 D1 存在,
它的建議在一個沒有既有 id 的專案裡是對的,在你這裡是災難。

### D2 ❌ `data/notes/` —— 個人筆記進 git

Condition 文件 §11–12 把 Notes 實體放在 `data/notes/`。**違反 D7 兩層儲存分離**:
`data/` 是 git 版控且是未來公開匯出的來源,個人筆記屬 clinical 層
(`data/clinical_cases/local|private` 或未來的 `.db`,全部 gitignored)。

Notes 這個實體**概念是對的**(個人筆記不得混進已驗證醫學內容),
但它的家在 clinical 層,不在 `data/notes/`。

### D3 ❌ 資料夾大搬家 + `schemas/` 平行體系

Condition 文件 §12 提議 `data/conditions/biomedical/`、`data/patterns/`、
`data/symptoms/`、`data/signs/`、`data/red-flags/`、`data/relationships/` …

現況是 conditions 在 `data/pathology/`、patterns 在
`data/pathology/pattern_*.json` + `data/config/tcm_pattern_canon.json`。
id 不變所以技術上「搬得動」,但**現在有三個 agent 在平行寫入**,大搬家 =
merge 地獄,而且換不到任何新能力。**要搬也是等 Level 1 v1.0 之後。**

---

## 3. Grade A — 立刻做

### A1 ✅ AI 治理:只做「機器強制」,**不要**做 11 份文件

Vision 文件講對了整份文件裡最重要的一句話:

> LLM 不會真的遵守規格,它只是機率性地遵守。

這正是這個 repo 的疤痕史:202 味中藥共用 26 句模板通過 8 個 validator、
穴位安全欄位被覆蓋 285/361 而所有 validator 都 PASS、agent 動了不該動的
`app.js`。**它診斷對了。**

但它開的藥方(11 份 governance `.md`)會有反效果。你現在已經有
`AGENTS.md` + `BLUEPRINT.md` + `AI_ROLES.md` + `DECISIONS.md` +
4 份 CARD_TEMPLATE + `ANTIGRAVITY_VALIDATION_PROTOCOL.md` + 兩份 SCHEDULE +
`CLINICAL_GRAPH_TRACK.md`。**再加 11 份 = agent 讀不完 = 更不遵守。**

> **原則:多一份文件,少一分遵守;多一個 validator,多一分遵守。**
> 規則要寫進 code,不是寫進第 12 份 markdown。

要做的是 **1 份 + 3 個工具**:

| # | 項目 | 說明 | 成本 |
|---|---|---|---|
| G1 | `docs/AI_CONSTITUTION.md` | **一頁**、20 條硬規則、含 §2 的否決清單。設計成可以整段貼進 dispatch 開頭。不是第 12 份說明書,是那 12 份的**摘要卡**。 | 半天 |
| G2 | **`.github/workflows/validate.yml`** | PR 不過 validator 就不能 merge。**repo 現在完全沒有 CI** —— 三個 AI 平行跑卻只靠人記得跑 validator,這是最大的單點失效。 | 半天 |
| G3 | `schemas/*.schema.json` + `additionalProperties: false` | 先做 herb / formula / acupoint 三型。直接堵死「agent 發明 `clinicalNotes` / `tips` / `effects` 欄位」。 | 1 天 |
| G4 | `examples/gold-standard/` | 不用新寫 —— **麻黃、麻黃湯、杜仲、LU 經的卡已經是黃金樣本**,只要把路徑固定下來、在 dispatch 裡指名「照這張的長相」。 | 1 小時 |

G2 是這四項裡 CP 值最高的。**它是唯一能防止「validator 存在但沒人跑」的東西。**

### A2 ✅ `domain` 詞彙表 —— D8 鎖了但從來沒建

DECISIONS **D8 已 LOCKED**:specialty 是橫切的 `domain` tag,不是每個專科一個容器。
但 D8 的「Current state」寫著「no `domain` field yet」—— 詞彙表一直沒建,
因為**沒有內容可以決定該有哪些值**。

Curriculum 文件的四大支柱正好就是那些值:

```
pain_msk          疼痛 / 肌骨 / 筋膜 / 動作 / 復健   ← 文件指定的第一支柱
healthy_aging     功能老化 / 跌倒 / 衰弱 / 多重用藥
womens_health     婦科 / 生殖 / 更年期
neuro_rehab       中風 / 帕金森 / 周邊神經病變 / 頭皮針
oncology_support  腫瘤支持照護(後期)
```

加上既有的 `gyn_fertility` / `sports` / `cosmetic`。**一個 vocabulary 檔,
半天,而且它解鎖了「按支柱查全站」這個查詢。**

### A3 ✅ 病症優先序:用 Collection 1 的 16 條取代「150 張都要做」

你有 150 張 draft 病症卡、0 grade、**沒有優先序**。Curriculum 文件的
Collection 1（北美針灸核心)是我看過最適合你的優先序清單:

```
慢性下背痛 · 頸痛 · 膝 OA · 肩痛 · 肌筋膜痛
偏頭痛 · 緊張型頭痛 · 頸源性頭痛 · TMJ 痛
周邊神經病變 · 失眠 · 焦慮
痛經 · 更年期症狀 · 癌症相關噁心 · AI 關節痛
```

理由:這些**同時**是北美臨床最常見、保險最可能給付、其他醫療人員聽得懂、
而且證據最站得住腳的。**16 條垂直鏈遠比 150 張半成品有用。**

而且你剛好有料:`curriculum/conditions/` 的 52 份 handout 涵蓋了其中不少
(Fibromyalgia、Dizziness、Hypertension、Mood Disorder、CFS…)。

### A4 ✅ `legacy_student_notes` 來源等級

Curriculum 文件 §13 對「學姊筆記 / 舊課件」的處理方式是對的:

```yaml
source_type: legacy_student_notes
framework_use: allowed        # 當 domain map、當發現實體的工具
clinical_authority: low       # 不當臨床權威
verification_status: unverified
freshness_status: outdated_or_unknown
```

加進來源型別詞彙表,一行的事。它讓你可以**安心用舊筆記來設計架構**,
而不會讓舊筆記的內容偷偷變成臨床依據。

### A5 ✅ 修 pattern 詞彙散落(這是真的 schema drift,ChatGPT 沒看到但診斷方向對)

查核時發現:證型現在存在**三個地方**,數量各不相同。

```
data/pathology/pattern_registry.json      61 筆
data/pathology/pattern_library.json       50 筆
data/config/tcm_pattern_canon.json       140 筆
```

Vision 文件講的「controlled vocabulary / 同義詞失控」就是這個病,只是它是
從外面猜的,而這裡是實際存在的。**病症垂直鏈開工之前必須先收斂**,
否則每條鏈都會指向不同的證型 id。

---

## 4. Grade B — 想法對,形狀要改

### B1 三實體分離(Biomedical Condition / TCM Disease / TCM Pattern)

**概念完全正確,而且你已經有了大半。** ChatGPT 是看著 UI 的預覽卡推理的,
沒看到資料層 —— 實際上:

- `data/pathology/conditions.json` 的頂層鍵已經有
  `eastern_diseases` / `tcm_patterns` / `relation_links`
- `data/interop/condition_crosswalk.json` 有 **150 筆**中西對照 —— 這就是它
  要的 mapping 層
- clinical schema 早就三分:`case_western_conditions` / `case_eastern_diseases`
  / `case_tcm_patterns`

**要改的不是架構,是標記。** 現有 150 張病症記錄混在一起,加一個
`entity_type: biomedical_condition | tcm_disease | tcm_pattern` 欄位分類,
validator 檢查。**加欄位,不是重建資料夾。**

### B2 Relationship objects 取代裸陣列

方向對,且 **DECISIONS D5「有疑慮就選 many」已經鎖了這個方向**。但三處要改:

| ChatGPT 的寫法 | 改成 | 為什麼 |
|---|---|---|
| 新開 `data/relationships/` | 擴充既有 `data/config/*_relations.json` + `validate-relations.js` | 已經有這層了,再開一個就是兩個真相來源 |
| `"id": "rel-001"` 流水號 | `rel.<source>__<type>__<target>` 決定性 id | **三個 agent 平行跑會撞號。** 決定性 id 誰算都一樣,天然去重,也不需要中央發號 |
| v1 開 15 種 relationship type | v1 只開 5–6 種真的會用到的 | 15 種裡有一半你今年不會用到;沒用到的 enum 值只會讓 agent 亂填 |

v1 建議開這幾種:`HAS_PATTERN` · `MAY_CORRESPOND_TO` · `HAS_RED_FLAG` ·
`HAS_DIFFERENTIAL` · `TREATED_WITH` · `INTERACTS_WITH`。

「不要一對一等同」這條(Migraine ≠ 肝陽上亢)**必須寫進 AI_CONSTITUTION**,
它是這份文件裡最重要的臨床安全原則。

### B3 Evidence 分離 —— 用既有的 LL4,不要另建實體

「機轉 ≠ 臨床療效」的分離是對的。但整套 Evidence Card
(risk of bias、effect estimate、GRADE…)是他們自己 roadmap 排在 **2028** 的工作。

現在該做的版本已經在 repo 裡定義過了 —— `docs/LEARNING_LOOP_TRACK.md` **LL4**:

```
evidence: classic_text | textbook | rct | teacher_said | my_observation
```

**LL4 已經存在,只是沒填。** 三年後「老師說的」跟「RCT 顯示的」份量不同,
不標就會忘記自己當初為什麼相信。先把這個欄位填起來,Evidence Card 等 2028。

### B4 Vertical slice 先於量產 —— 同意,但候選要換

「與其做 20 張不完整的卡,不如做 1 條完整的垂直鏈」——**完全同意**,
而且這正是九月病症工作應該的形狀。

但它建議從 **Migraine** 開始,我建議從 **痛經** 開始:

- 你唯一已填的病症批次就是 **gyn 25 條**(`condition_fill_gyn.json`)
- **ABORM/FABORM 是你最接近的認證**(這是 7/22 排期就記下的判斷)
- SOAP 表單已經有 cycle day / phase / 西藥欄位,病例層接得上
- 方劑、穴位的婦科內容也是現有最厚的

**用你最強的領域做第一條鏈,不是最陌生的。** 第一條鏈的目的是驗證架構,
不是挑戰自己 —— 架構驗完了,第二條再做偏頭痛(它是 Collection 1 的核心)。

---

## 5. Grade C — 現在不要做

### C1 ❌ Big Condition Detail Card 的三欄 UI(左導覽 + 右快覽 + 10 個 tab)

**這一項跟 ChatGPT 自己的另一份文件互相矛盾。** Vision 文件 §15 Priority 4
白紙黑字寫著:

> Level 1 v1.0 之前:不做大改版、不做新卡片系統、不做字體大改、
> 不重寫導覽(除非它擋住功能)。

而 Condition 文件同一天提出一個全新的三欄大卡 + 左側導覽 + 10 個 tab。
它也同時牴觸 BLUEPRINT 的定案(唯一導覽 = 右側滑出面板;一個主題 = 一個
獨立分頁;主題頁不放 schema 卡)以及你自己 7/29 定的新權重(視覺 4%)。

**採納它的概念,拒絕它的版面**:「Preview Card(列表用)/ Detail(細讀用)
分離」這個概念是對的而且成本低 —— Detail 就用現有的單頁樣式呈現,
不要另做三欄外殼。

### C2 ❌ Evidence Cards / Living literature / 文獻監控 / email 警報(Level 5–6)

按它自己的時間表是 2028 與畢業後。現在做 = 用未來三年的工作換今年的考試時間。
**唯一現在該做的是把 `evidence` 標籤欄位填起來(B3)**,那是為 2028 鋪路的
最低成本動作。

### C3 ❌ 外部學校 / China 短期班 / 第二學位 —— 不進工程排期

Curriculum 文件有一半在講北中醫、上中醫、南中醫、成都中醫、SIEAM、
Pacific College、Weil、MSK、Northern College、Bern、Zurich。

**這不是 repo 工作,我不會把它排進工程時間表。** 它對系統唯一的影響是四大
支柱 → `domain` 詞彙表(已列在 A2)。其餘是你的職涯決定,建議用文件自己
§14 的十個問題過濾(「它填的是真的缺口嗎?」「同樣結果能不能用 mentorship
或 CE 用更低成本達成?」)—— 那十個問題本身寫得不錯。

---

## 6. 修正後的時間表

7/29 那份排期的穴位部分已作廢(經穴做完了)。以下是取代版本。

### 八月剩下(8/05 – 8/31)

| 週 | 線 1(工程,C) | 線 2(內容,X/A) | Ting |
|---|---|---|---|
| 8/05–8/11 | **G2 CI gate** + **G1 AI_CONSTITUTION** + G4 golden example 路徑固定 | 方劑:清 validator 報的 34 damaged text + 14 truncated composition | 每天 RV1 |
| 8/12–8/18 | **G3 JSON Schema**(herb/formula/acupoint)+ **F0 Appendix C 覆蓋報告** | 方劑:55 bilingual alignment + 18 skeleton | 每天 RV1 |
| 8/19–8/25 | **F1 stamp-formula-card-grade** + **A5 pattern 詞彙收斂** | 經外奇穴 49 張(分 5 批) | 每天 RV1 |
| 8/26–8/31 | **A2 domain 詞彙表** + A4 來源等級 | 經外奇穴收尾 | 每天 RV1 |

八月的重心從「量產」轉成「**裝護欄 + 清方劑債**」。理由:穴位經穴已完成,
方劑是唯一有 201 張卡而 grade 只有 2 的層,而且 validator 已經明確告訴你
缺陷在哪 —— 這時候再開新的量產線是浪費。

### 九月:病症垂直鏈(開學,產能減半)

| # | 項目 | Owner |
|---|---|---|
| N1 | **A5 pattern 詞彙收斂**(若八月沒做完,九月必須先完成)| C |
| N2 | **B1 加 `entity_type` 欄位**,150 張病症分成三實體 | X |
| N3 | **B4 第一條垂直鏈:痛經** —— 走完 病症→證型→穴位→方劑→red flags→證據標籤→病例 | C + T |
| N4 | **B2 relationship v1**(6 種 type,決定性 id) | X |
| N5 | 辨證鑑別 41 筆 → 課堂對照表繼續建 | T 提供 + C 建表 |
| N6 | `curriculum/conditions/` 52 份 handout 進版控並抽文字 | X |

**N3 是九月的核心。** 一條鏈走通了,其餘 15 條就是複製流程;走不通,
做 150 張也只是 150 張半成品。

### 十月:第二、三條鏈 + 部署 + 驗證衝刺

- 偏頭痛鏈 + 慢性下背痛鏈(Collection 1 的前兩名)
- Cloudflare Pages + Access(手機可用)
- RV1 驗證衝刺 —— **只有 Ting 能推進的那一欄**

### 十一–十二月:病例 MVP + 臨床圖譜

不變,照 `docs/CLINICAL_GRAPH_TRACK.md`:CG1–CG3 patient hub →
localStorage→SQLite → CG4 反向索引 → CG10 複習佇列。

### 2027 之後(對到 Curriculum 文件)

| 時間 | 內容 |
|---|---|
| 2027 H1 | Collection 1 的 16 條鏈做完;`domain` 標籤全站鋪開;中藥 236 張 partial 收尾 |
| 2027 H2 | Healthy Aging Core(Collection 2);herb–drug 交互引擎;安全層分級 |
| 2028 | Evidence Card 層(Level 5)—— 此時 `evidence` 標籤已累積三年,升級成實體才划算 |
| 畢業後 | Living literature / 決策支援(Level 6) |

---

## 7. 一句話總結每份文件

| 文件 | 一句話 |
|---|---|
| **Vision / Governance** | **診斷正確、藥方過量。** 「LLM 只是機率性遵守規格」這句是對的,repo 確實沒有 CI、沒有 schema;但解法是 1 份憲法 + 3 個工具,不是 11 份文件。**ID 那一節必須否決。** |
| **Condition Card** | **資料模型你大半已經有了**(crosswalk 150 筆、三實體在 clinical schema 裡、pattern canon 140 筆),要補的是 `entity_type` 標記與 relationship 物件化;**UI 提案與 BLUEPRINT 定案和它自己的 UI freeze 條款衝突,不採納。** |
| **Parallel Curriculum** | **不是工程文件,但給了兩樣真的有用的東西**:四大支柱 → 解鎖擱置已久的 D8 `domain` 詞彙表;Collection 1 的 16 條 → 病症層第一次有了合理優先序。學校清單不進排期。 |

---

## 8. 派工時要加進 dispatch 的否決清單

在既有三句話之外,再加這四條:

4. **不准改任何 id 格式。** `herb.*` / `formula.*` / `SP6` / `ex.*` / `tung.*` /
   `ear.*` 已鎖(DECISIONS D1/D2/D3),`point_id_manifest.json` 是帳本。
   看到任何文件建議改成 `herb:huang-qi` 這種格式 —— **那份文件在這一點上是錯的。**
5. **不准把個人筆記寫進 `data/`。** 筆記屬 clinical 層(gitignored)。
6. **不准建立中西醫一對一等同。** 偏頭痛 ≠ 肝陽上亢。一律多對多 + 標明
   「可能重疊 / 症狀重疊 / 臨床相關 / 並非等同」。
7. **不准在內容任務裡改 UI。** Level 1 v1.0 之前不做大改版(這條是 ChatGPT
   自己寫的,而且是對的)。
