# Skill Suite 可行性評估(2026-08-05)

Ting 提出 15 個 Skill 的五層 Skill Suite 構想,問可行性。
結論寫在最前面:**做 3 個,不是 15 個。** 理由不是保守,是這 15 個裡有
一半你已經有了、而且做成 Skill 會**變弱**。

---

## 0. 先講兩件會改變結論的事

### ① Skill 是「打包好的提示」,不是強制力

Skill = 一包在被叫用時載入 context 的指示,可以附帶腳本與參考檔。
**它不能阻止任何事。** 這正是 ChatGPT 自己那份治理文件診斷對的問題:

> LLM 不會真的遵守規格,它只是機率性地遵守。

所以:**把規則類的東西做成 Skill 是降級,不是升級。**

「JSON Validator Skill」比你現在的 27 個 `validate-*.js` **弱** ——
validator 會 `exit 1`,Skill 只會被忽略。同理,「Refactor Guardian Skill」
比 `AI_CONSTITUTION.md` §A 弱,因為憲法是**貼進每一份派工單**的,
Skill 只在被叫用時才載入。

> **規則要往下走進 code,不要往旁邊走進另一個提示包。**

### ② Skill 只管得到你三個 agent 裡的一個

`.claude/skills/` 是 Claude Code 的機制。**Codex 和拓關不讀它。**

你現有的 `skills/acuting-extra-point-refinement/` 帶了一個
`agents/openai.yaml` 轉接檔(Codex 8/02 自己加的)—— 那是目前唯一能跨工具的
做法,但每一個 skill 都要手寫一份轉接。

**跨三個工具的一致性只能靠兩樣東西**,而且順序是固定的:

```
1. validator + CI    ← 機器,誰都繞不過      (最強)
2. AI_CONSTITUTION   ← 貼進任何 prompt,跨工具
3. Skill             ← 只有 Claude Code,要靠叫用  (最弱)
```

---

## 1. 分診:15 個提案分成四類

### ✅ 已經有了 —— 不要重做(重做 = 第二個真相來源 = 必然分岔)

| 提案 | 你已經有的東西 |
|---|---|
| **TCM Database Architect** | `HERB_CARD_TEMPLATE.md` · `FORMULA_CARD_TEMPLATE.md` · `ACUPOINT_CARD_TEMPLATE.md` · `COMPARISON_CARD_TEMPLATE.md` · **今天新增的 `CONDITION_CARD_TEMPLATE.md`**。Schema 正本在這五份 |
| **JSON Validator** | 27 個 `scripts/validate-*.js`,而且會 exit 1。**做成 Skill 是降級** |
| **Herb / Formula / Acupoint Card Generator** | 就是三份 CARD_TEMPLATE 的 §0 五步必跑流程 |
| **Refactor Guardian** | 今天的 `AI_CONSTITUTION.md` §A 檔案所有權 + §B 七條紅線 |
| **Cross Reference Builder** | 部分有:`validate-relations.js` + `condition_crosswalk.json`(150 筆中西對照)+ `herb_pair_relations.json` |
| **Search Optimizer** | 搜尋已支援中文/英文/拼音。何時該優化的觸發條件寫在 NORTH_STAR §4:**感覺慢於 50ms 才上 minisearch** |

> **這一格最大的風險**:如果 Skill 裡「再寫一次」欄位格式,你就有兩份 schema
> 定義,而它們一定會分岔 —— 然後 AI 照哪一份都有理。
> **Skill 只能指向模板,絕對不能複述模板內容。**

### 🔨 值得做(3 個)

判準:**重複性程序 + 來源紀律**。這是 Skill 擅長而文件不擅長的地方,因為程序
要被「執行」不是被「閱讀」。

你已經有一個成功案例可以照抄:`skills/acuting-extra-point-refinement/`
(SKILL.md + references/card-contract.md + agents/openai.yaml)。
**它有效是因為它打包了一套流程,不是把格式抄一遍。**

| # | Skill | 給誰 | 何時 | 內容 |
|---|---|---|---|---|
| S1 | **`acuting-condition-fill`** | 拓關 | **本週** | §0 五步 · 來源階層(`curriculum/conditions/` 52 份課件 → CloudTCM/AD)· C4 red flags 的五欄結構 · C3 西醫病名/中醫病名判準 · 批次大小 · 跑 `validate-condition-standard.js` · handoff 格式。**指向 `CONDITION_CARD_TEMPLATE.md`,不複述** |
| S2 | **`acuting-medication-card`** | 拓關(藥理層) | 病症線收尾時 | 西藥卡。安全欄位(交互作用、禁忌、劑量)比中藥**更不能猜**;要先有 `MEDICATION_CARD_TEMPLATE.md` + validator,skill 只包流程 |
| S3 | **`acuting-clinic-visit`** | **Ting 自己** | **9/01 前** | 不是給 AI 的。進診所後把當天病例記進系統的固定流程 + 去識別化檢查清單(D4「粗化,絕不寫假的臨床事實」)+ 匯出備份提醒 |

三個都要附 `agents/openai.yaml` 轉接,否則 Codex 讀不到。

### ⏸ 等時機(想法對,不是現在)

| 提案 | 現在該做的最小版本 | 完整版何時 |
|---|---|---|
| **Evidence Reviewer** | 填 `LEARNING_LOOP_TRACK` **LL4** 已定義的 `evidence` 欄位:`classic_text \| textbook \| rct \| teacher_said \| my_observation`。**欄位早就定義好,只是沒填** | 2028(Level 5) |
| **Knowledge Graph Builder** | **先做 D10 證型命名空間收斂。** 你的圖譜已有骨架,缺的不是 skill 是**一致的 id** —— 現在建自動連結只會把 `pattern.*` 和 `pat.中文` 兩套宇宙的錯誤連結自動化 | D10 之後 |
| **Clinical Reasoner** | — | 需要病例量,`CLINICAL_GRAPH_TRACK` CG4/LL6,11–12 月 |
| **Case Builder / Follow-up Tracker / Pattern Evolution** | CG6 指標 22 項 + CG9 反思三欄**已建**(7/29) | 依賴 SQLite,11–12 月 |

> **Evidence Reviewer 的 ★★★★★ 星等評分:不要做。**
> GRADE 是有方法論的(risk of bias / directness / consistency / precision);
> 五顆星是感覺。**標錯的證據等級比沒有標更危險** —— 它會讓你在診所裡對一個
> 其實只有動物研究的說法產生信心。要嘛記錄真實的 study design,要嘛只記 LL4 的
> 五個標籤,不要中間那種好看的假精確。

### ❌ 現在不要做

| 提案 | 為什麼 |
|---|---|
| **UI Designer** | 直接牴觸你今天剛定的 **9/01 起 UI 凍結**、視覺權重 4%、BLUEPRINT 架構定案,以及 ChatGPT 自己 Vision 文件的 UI freeze 條款。**進診所前四天有個 skill 專門改 UI,是最糟的組合** |
| **Literature Monitor** | 這不是 skill,是產品(排程 + API + 去重 + 排序 + 通知分級)。而且它會**每天產生你沒空讀的東西** —— 九月你要同時上課、進診所、記病例。Level 6,畢業後 |
| **Performance Auditor** | 純靜態站、無圖片檔、無打包器。目前沒有可稽核的效能問題;有了再說 |

---

## 2. 為什麼是 3 個而不是 15 個

三條線同時在跑(病症/穴位/方劑),9/5 進診所剩 31 天。每一個 skill 都要寫、
要維護、要跟模板保持同步 —— **15 個 skill 就是 15 份會跟模板分岔的文件。**

而你真正的瓶頸不是「AI 不知道格式」:

- 格式:5 份 CARD_TEMPLATE 已經寫得很細
- 遵守:27 個 validator 會 exit 1
- **缺的是 CI** —— 沒有任何機制強迫 validator 被跑過
- **缺的是一致的 id** —— D10 的證型命名空間

**先補這兩個洞,再談 skill。** 一個 CI gate 比十五個 skill 更能防止你 8/02 那種
「validator PASS 但沒人跑」的狀況。

---

## 3. 建議的順序

```
本週     D10 證型命名空間收斂  →  S1 acuting-condition-fill
8/19     CI gate(.github/workflows)
8月底    S3 acuting-clinic-visit(給你自己,9/5 用)
9月後    S2 acuting-medication-card(藥理層開工前)
其餘     等觸發條件,不要提前做
```

**Skill 的黃金規則(寫進每一個 SKILL.md 的開頭):**

> 這個 Skill 不定義格式。格式的正本在 `docs/<X>_CARD_TEMPLATE.md`。
> 這個 Skill 只定義**流程**:讀哪些來源、依什麼順序、產出後跑哪個 validator、
> handoff 寫什麼。兩者衝突時以模板為準。

---

## 4. 通用市集 Skill(Stop-Slop / Claude Mem / Task Observer / UI UX Pro Max / Find Skills)

Ting 另外問了五個現成的通用 Skill。逐一對照你**已經有的東西**:

| Skill | 宣稱用途 | 你已經有的 | 結論 |
|---|---|---|---|
| **Task Observer** | 「找哪些沒完成、哪些欄位缺少、哪些 JSON 有問題」 | **`missing_report.json.quality_layers` + 27 個 validator 的 `--worklist` 旗標**。你舉的例子「幫我完成剩下 350 個穴位」就是 `validate-acupoint-standard.js --worklist --all` —— **那正是把穴位推到 361/361 的工具** | ❌ **已經有,而且更強**(會 exit 1) |
| **Claude Mem** | 「讓 AI 每次都知道 Acuting OS 的資料格式」 | 5 份 CARD_TEMPLATE + `AGENTS.md` + `BLUEPRINT.md` + `DECISIONS.md` + 2600 行 `PROJECT_LOG.md` + 今天的 `AI_CONSTITUTION.md` | ❌ **已經有,而且更好**:repo 文件有版控、可 diff、**三個工具都讀得到**;memory 只有 Claude 讀得到,而且**會跟 repo 分岔**(又一個第二真相來源) |
| **Stop-Slop** | 「不亂改程式、不過度設計、不一直重構」 | `AI_CONSTITUTION.md` **§A 檔案所有權**(逐路徑寫死誰能寫)+ §B 七條紅線 | ⚠️ **可裝,但憲法更精準**。通用 skill 不知道 `app.js` 是 Claude 專屬、`data/pathology/` 是拓關的。**「不要把我整個網站重寫」真正的解法是檔案所有權 + branch + CI,不是一句客氣話** |
| **UI UX Pro Max** | UI/UX 規範 | — | ❌ **牴觸 9/01 UI 凍結 + 視覺 4%**。等 Level 1 v1.0 之後、診所穩定之後再說 |
| **Find Skills** | 搜尋其他 skill | — | ⏭ 跳過 |

**ChatGPT 自己的結論是對的**:專屬 skill 的價值高於通用 skill。
但更精確的說法是 —— **你的問題早就不是「AI 不知道格式」了。**

格式:5 份模板寫得很細。遵守:27 個 validator 會 exit 1。
**缺的是沒有任何機制強迫 validator 被跑過**,以及**證型 id 不一致**(D10)。
再多的 skill 都補不了這兩個洞。

---

## 5. 真正會提升工作流的三件事(都不在那兩份清單上)

Ting:「希望這些 skill 能提升優化系統跟工作流。」以下是實測出來的真實瓶頸。

### W1 ⭐ CI gate —— 唯一能跨三個工具的強制力

`.github/` **完全不存在**。三個 agent 平行寫入,卻只靠人記得跑 validator。
8/01 Codex 接手時就發現前一批的宣稱要重測才知道真假。

一個 workflow 檔,半天。**它比十五個 skill 更能防止 8/02 那種
「validator 存在但沒人跑」的狀況。**

### W2 ⭐ `acuting-dispatch` —— 派工單產生器(這才是你最花時間的事)

你現在是**手寫**三份派工單給三個 agent,每次都要重講一遍允許/禁止的檔案、
批次範圍、驗證指令。這是你每週重複最多次的動作,而且漏講一項就出事。

Skill 的做法:讀 validator 的 `--json` 輸出 → 產出一段可直接複製的派工單:

```
角色 / 允許的檔案 / 禁止的檔案 / 這批的 id 清單(來自 worklist)
/ 來源階層 / 驗證指令 / 完成的定義 / handoff 格式
+ AI_CONSTITUTION 全文
```

**這是 Skill 真正擅長的事**(重複性程序),而且它直接減少你的操作負擔 ——
比任何內容生成 skill 都更值得先做。

### W3 ⭐ 讓 RV1 更快 —— 唯一 AI 動不了的那條 bar

已驗證:穴位 1 / 中藥 37 / 方劑 0 / 病症 0。
**趕工再快,這欄只有你按 RV1 才會動。** 中藥從 0 → 37 證明你按得動,
所以任何讓 RV1 更快的東西(批次掃、鍵盤快捷、手機上能按)的回報,
高於再多做 100 張卡。

九月你同時上課 + 進診所 + 記病例 —— **RV1 只會更擠。**
八月就要把它做順。

---

## 6. 修正後的順序

```
本週      D10 證型命名空間收斂  →  S1 acuting-condition-fill(拓關本週要用)
8/12–18   W2 acuting-dispatch(減少你自己的操作負擔)
8/19–25   W1 CI gate
8/26–31   W3 RV1 加速  +  S3 acuting-clinic-visit(9/5 用)
9 月後    S2 acuting-medication-card
不做      UI UX Pro Max · Literature Monitor · Performance Auditor · 星等評分
可選      Stop-Slop(無害,但憲法已涵蓋)
```

