# 藥理卡模板【v1】

**建立**：2026-08-06 · Claude · Ting 定案分層與所有權
**相關**：`docs/PHARM_SOURCE_TIERS.md`（來源分層）、`docs/AI_CONSTITUTION.md`
**驗證**：`scripts/validate-pharm-standard.js`

---

## §0 這一層的最高原則：沒有來源的安全欄位不存在

中藥卡的 §0 是「只加深不刪除」。藥理卡的 §0 不一樣,因為風險不一樣。

**禁忌、交互作用、黑框警告、不良反應 —— 這四類欄位若沒有 `field_sources`
指向一個 `verified_exact` 的官方標籤,驗證器直接 FAIL。**

這不是不信任填充者。這是把判斷題變成轉錄題:

- 「furosemide 的禁忌是什麼」→ 需要藥理判斷 → 弱模型會編出聽起來很專業的答案
- 「把 DailyMed setid `7cdcd001…` 的 CONTRAINDICATIONS 區段抄過來」→ 轉錄 → 可驗證

**編造在結構上做不到**:要嘛附上真實 setid,要嘛留空。
留空是誠實的來源缺口(憲法 §三：查不到就停下來回報),編造的禁忌會在診所裡被相信。

---

## §1 六層架構

Ting 定案。ChatGPT 原提 4 層,補上作用標的與產品層。

| 層 | id 命名空間 | 例 | 建卡? |
|---|---|---|---|
| L1 系統 | `drugsystem.*` | `drugsystem.cardiovascular_renal` | ✅ 瀏覽入口 |
| **L2 作用標的** | `drugtarget.*` | `drugtarget.nkcc2` · `drugtarget.ace` · `drugtarget.cox2` | ✅ |
| L3 藥物分類 | `drugclass.*` | `drugclass.loop_diuretics` | ✅ 骨架 |
| L4 單藥(**成分層**) | `drug.*` | `drug.furosemide` | ✅ 卡片主體 |
| L5 概念/安全 | **不新增命名空間** | 低血鉀 → `cond.*` / `sym.*` | ⚠️ 見 §1.2 |
| L6 產品層 | 無 | DailyMed setid | ❌ **不建卡** |

### §1.1 為什麼有 L2 作用標的

考題大量考「不同分類打同一個標的」與「同一個標的的不同藥效」。
沒有這一層,袢利尿劑與 thiazide 的關係只能寫在散文裡,無法查詢。

一個 class 指向一個主要標的;一個標的可以被多個 class 引用。

### §1.2 L5 的紅線 —— 不要建藥理專屬的病症節點

憲法 D11 已定四套診斷命名空間(`cond.*` 西醫病名 / `tdis.*` 中醫病名 /
`pattern.*` 證型 / `sym.*` 症狀)。

**低血鉀、高血鉀、耳鳴、男性女乳症 —— 全部複用既有命名空間,不新增。**

```
✅ drug.furosemide.adverse_effect_ids = ["cond.hypokalemia", "sym.tinnitus"]
❌ 另建 pharmconcept.hypokalemia
```

理由跟 D11 一樣:一藥多副作用、一副作用多藥,是多對多。另開命名空間會讓
同一個「低血鉀」在庫裡有兩個 id,而病歷不知道要連哪一個。

### §1.3 為什麼產品層不建卡（實測發現）

DailyMed 上 furosemide 有 **231 筆標籤** —— 每個藥廠、每個劑型各一筆。
「那個藥的頁面」不是單一頁。

RxNorm 已經解決過這個問題:成分 → 臨床藥物 → 商品藥。所以本庫:

- **`drug.furosemide` 是成分層**,那是唸書與考試的單位
- **產品層不建卡**,只作為引用來源的 `setid` 存在

引用時記錄用了哪一筆:

```json
"dailymed_setid": "7cdcd001-ab4b-4210-a455-2e17a7bc4972",
"dailymed_label_title": "FUROSEMIDE (FUROSEMIDE) TABLET [REMEDYREPACK INC.]"
```

⚠️ **不同藥廠的標籤內容可能有差異。** 引用哪一筆要記下來,不要假裝
「furosemide 的標籤」是單數。

---

## §2 單藥卡欄位（對應 FDA SPL 實際區段）

欄位順序照 FDA 標籤本身,不自己發明。**實測 setid `7cdcd001…` 的區段順序**:

```
WARNING(黑框) → DESCRIPTION → CLINICAL PHARMACOLOGY → INDICATIONS AND USAGE
→ CONTRAINDICATIONS → WARNINGS → PRECAUTIONS → ADVERSE REACTIONS
→ OVERDOSAGE → DOSAGE AND ADMINISTRATION → HOW SUPPLIED
```

⚠️ 標籤有兩種格式並存:舊格式(上面那個,WARNINGS 與 PRECAUTIONS 分開)與
PLR 新格式(`4 CONTRAINDICATIONS` / `5 WARNINGS AND PRECAUTIONS` /
`7 DRUG INTERACTIONS` / `8 USE IN SPECIFIC POPULATIONS`)。
**填的時候記下是哪一種**,否則欄位對不齊。

### A · 身分

| 欄位 | 必要性 | 來源 |
|---|---|---|
| `id` | 必 | `drug.<generic_slug>` |
| `name_en` · `name_zh` | 必 | 學名/通用名 |
| `brand_names_en` | 有就填 | RxNorm |
| `drugclass_id` | 必 | L3 |
| `drugsystem_ids` | 必 | L1,**陣列** —— spironolactone 同屬利尿與內分泌 |
| `suffix_en` | 有就填 | `-ide` / `-olol` / `-actone` / `-statin` |
| `rxnorm_rxcui` | 必(若有) | RxNav。**中藥永遠沒有,不要建空欄位** |

**`drugsystem_ids` 是陣列不是單值。** ChatGPT 提 `primarySystem` + `secondarySystems`,
但本庫在證型已經否決過這個設計(腎陽虛同屬腎虛與陽虛,沒有主次)。同一個決定
不要做兩次。

### B · 藥理（課件是主來源）

| 欄位 | 對應 SPL | 來源 |
|---|---|---|
| `mechanism_en` · `mechanism_zh` | CLINICAL PHARMACOLOGY | **課件**(PPT 教的正是這個) |
| `drugtarget_id` | — | L2 |
| `site_of_action_en/zh` | CLINICAL PHARMACOLOGY | 課件 |
| `physiologic_effect_en/zh` | CLINICAL PHARMACOLOGY | 課件 |
| `pharmacodynamics_summary_en/zh` | CLINICAL PHARMACOLOGY | 課件/標籤 |
| `pharmacokinetics` | CLINICAL PHARMACOLOGY | `{ onset_duration_en, metabolism_en, elimination_en }` 物件 |
| `route_en` | DOSAGE AND ADMINISTRATION | 標籤 |

### C · 臨床用途

| 欄位 | 對應 SPL |
|---|---|
| `indications_en` · `indications_zh` | INDICATIONS AND USAGE |
| `indication_condition_ids` | — （**唯一官方病名連結欄位**，連到 `cond.*`；舊 `related_condition_ids` 已作廢） |
| `common_offlabel_uses_en/zh` | — （**常見仿單外用途**，必須標明為 off-label） |

### D · 安全 ⚠️ 受 §0 約束

**以下每一欄都必須有 `verified_exact` 官方標籤來源或具名來源,否則驗證器 FAIL。**

| 欄位 | 對應 SPL |
|---|---|
| `boxed_warning_en/zh` | WARNING（條件式,沒有就不要建欄位） |
| `contraindications_en/zh` | CONTRAINDICATIONS |
| `warnings_en/zh` | WARNINGS |
| `precautions_en/zh` | PRECAUTIONS |
| `adverse_effects_en/zh` | ADVERSE REACTIONS |
| `serious_adverse_effects_en/zh` | ADVERSE REACTIONS（嚴重/致命不良反應） |
| `adverse_effect_ids` | —（連到 `cond.*` / `sym.*`） |
| `drug_interactions_en/zh` · `drug_interactions_graded` | DRUG INTERACTIONS(PLR)或 PRECAUTIONS(舊格式) |
| `overdose_en` | OVERDOSAGE（**唯一規範欄位**，禁止誤用 `overdose_toxicity_notes_en` 規避稽核） |
| `pregnancy_lactation_en/zh` | USE IN SPECIFIC POPULATIONS / PRECAUTIONS |
| `renal_considerations_en` | USE IN SPECIFIC POPULATIONS / PRECAUTIONS（腎功能安全考量） |
| `hepatic_considerations_en` | USE IN SPECIFIC POPULATIONS / PRECAUTIONS（肝功能安全考量） |
| `monitoring_requirements_en` | PRECAUTIONS / DOSAGE AND ADMINISTRATION（臨床監測需求） |

### E · 整合醫學（你的差異化,也是最危險的一欄）

| 欄位 | 規則 |
|---|---|
| `herb_drug_interactions_zh/en` · `herb_drug_interactions_graded` | **每一條都要來源。** NCCIH / PubMed / 標籤 |
| `integrative_clinical_flags` | **受控臨床安全旗標詞彙** (`bleeding_risk`, `bradycardia`, `orthostatic_hypotension`, `sedation_dizziness`, `photosensitivity`, `immunosuppression`, `infection_risk`, `bone_health`, `glucose_effects`, `masking_hypoglycemia`, `electrolyte_hyperkalemia`, `electrolyte_hypokalemia`, `procedural_safety`, `cough_side_effect`, `angioedema_risk`) |
| `tcm_relation_note_zh` | **憲法紅線 9:不准建立中西醫一對一等同** |
| `acupuncture_note_zh` | 針灸臨床診察與穴位處方安全提示 |
| `related_herb_ids` | 連 `herb.*` |
| `related_formula_ids` | 連 `formula.*` |
| `related_pattern_ids` | 連 `pattern.*` |

⚠️ **中西藥交互作用是全庫最容易編出「聽起來很合理」內容的欄位。**
你會在診所裡相信它。沒有具名來源就留空。

### F · 考試層（`Pharmacology Summary` 是主來源）

| 欄位 | 例 |
|---|---|
| `board_priority` | high / medium / low |
| `prototype_drug` | 是否為該類代表藥 (boolean) |
| `mnemonic_en/zh` | 「Fast & Furious in the Loop」「3 Peeing Monkeys」 |
| `exam_trap_en/zh` | 袢/thiazide 低血鉀 vs 保鉀利尿劑高血鉀 |
| `classic_association_en/zh` | Loop diuretic → hypokalemia |
| `board_high_yield_en/zh` | 國考高頻必考核心整理 |

### G · 驗證狀態與審核軌跡

| 欄位 | 值與規則 |
|---|---|
| `verification_status` | `framework_ready` / `source_identified` / `partially_populated` / `machine_verified` / `human_reviewed` / `draft`<br>⚠️ **AI/腳本生成內容絕不得標註為 `human_reviewed`** |
| `review_status` | `draft` / `rv1_passed` / `canonical` |
| `authored_by` | 標示建立者或腳本版本 |

### G · 外部連結（規格見 `PHARM_SOURCE_TIERS.md`）

每個 URL 欄位**必須**配一個 `*_url_kind`:

| 值 | 意義 |
|---|---|
| `verified_exact` | 實際打開過,確認是這個藥的專屬頁 |
| `derived_search` | 由藥名產生的搜尋連結 —— 有用,但不算查過 |
| `verified_none` | 查過了,該站沒有這個藥 |

**實測（2026-08-06）**:

```
RxNav        furosemide → RXCUI 4603                      derivable
DailyMed     API 可取 setid → 專屬頁                       lookup（可腳本化）
MedlinePlus  furosemide → /meds/a682858.html              lookup（不可推導）
```

`a682858` 與 "furosemide" 無任何可推導關係。**自動產生 MedlinePlus URL = 編造。**

### H · 筆記（兩種,不要混）

| 欄位 | 性質 | 存哪 |
|---|---|---|
| `clinical_use_note_zh` | 卡片內短筆記,跟中藥卡一致 | `data/pharmacology/**` |
| 個人臨床筆記 | **不進 data/** | `js/notes.js` localStorage,key `drug:<id>` |
| 長篇學習筆記 | markdown 文件,不是 JSON 欄位 | `docs/pharm_notes/<drug>.md` |

⚠️ **個人筆記與病人資料絕不可寫進 `data/`**(憲法紅線 7)。

---

## §3 分類卡（L3）欄位

分類卡是骨架,**課件填得出來**（PPT 教的就是這一層）。

`id` · `name_en/zh` · `drugsystem_ids` · `drugtarget_id` · `suffix_en` ·
`mechanism_overview_en/zh` · `site_of_action_en/zh` · `physiologic_effect_en/zh` ·
`shared_adverse_effects_en/zh` · `class_contraindications_en/zh` ·
`representative_drug_ids` · `prototype_drug_id` · `board_priority` ·
`mnemonic_en` · `field_sources`

---

## §4 誰做什麼（憲法 §一 檔案所有權的答案）

| 範圍 | 主人 |
|---|---|
| `docs/PHARM_*.md` · `scripts/validate-pharm-*.js` | **Claude** |
| `data/pharmacology/**` 內容填充 | **Antigravity**,受 §0 來源檢查所限 |
| 分層變更 · id 命名空間 · 臨床判斷 | **Ting** |

**為什麼安全欄位敢交給 Antigravity**:因為 §0 的檢查讓編造在結構上做不到。
他要嘛附真實 setid,要嘛留空。這個 session 的證據是他**在有明確規格與驗證器時
零缺陷**(方歌 102 首),**在需要判斷時會出事**(刪掉該搬的內容)。§0 把後者變成前者。

---

## §5 第一批（測模板用,不要一次做全部）

五個利尿劑,剛好涵蓋五種機轉:

| 藥 | 分類 | 標的 |
|---|---|---|
| Furosemide | 袢利尿劑 | NKCC2 |
| Hydrochlorothiazide | Thiazide | NCC |
| Spironolactone | 保鉀（醛固酮拮抗） | 醛固酮受體 |
| Acetazolamide | 碳酸酐酶抑制劑 | 碳酸酐酶 |
| Mannitol | 滲透性利尿 | — |

**做完這五個先停下來給 Ting 看**,確認模板不會太肥、欄位不會大量空白,
再往下做。憲法 §三:一批最多 30 筆,但模板第一批更少。

---

## §6 已知未解

1. Drugs@FDA / Medication Guide / REMS / MedlinePlus 健康主題的 URL 型態**尚未實測**
2. `sym.*` 命名空間目前 **0 筆**(D11 已定但未建),所以副作用暫時只能連 `cond.*`
3. 課件缺口實測:PPT 裡 `contraindication` / `interaction` / `monitor` / `toxicity`
   出現 **0 次** —— 這四類**完全依賴 DailyMed**,沒有官方標籤就是空的
