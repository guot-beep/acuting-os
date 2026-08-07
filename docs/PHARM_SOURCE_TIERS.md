# 藥理卡外部來源分層【規格】

**建立**：2026-08-06 · Claude
**狀態**：規格已定，資料層尚未建立（`data/pharmacology/**` 的主人待 Ting 指定）
**相關**：`docs/AI_CONSTITUTION.md` §二（紅線）、`docs/HERB_CARD_TEMPLATE.md` 教訓 10

---

## §0 最重要的區別:URL 可推導 vs 必須查

這個專案為「推導出來的連結」付過代價（中藥卡教訓 10）。藥理來源必須先分成兩類,
因為它決定**哪些連結可以自動產生、哪些一旦自動產生就是假的**。

| 類別 | 意義 | 存法 |
|---|---|---|
| **derivable** | URL 是藥名的純函數,任何時候都能重算 | 可由腳本產生,不必逐筆存 |
| **lookup** | URL 帶不透明 id,無法從藥名推出 | **必須逐藥查到才能存**,查不到就留空 |

**實測證據（2026-08-06 親自打過）**:

```
MedlinePlus  furosemide → /druginfo/meds/a682858.html
```

`a682858` 跟 "furosemide" 沒有任何可推導關係。**任何自動產生 MedlinePlus URL
的腳本都在編造。** 這一條寫在最前面,因為它最容易被下一個 agent 弄錯。

---

## §1 來源清單（附實測狀態）

### 第一層 · 官方藥品資訊

| # | 來源 | 用途 | URL 型態 | 實測 |
|---|---|---|---|---|
| 1 | **DailyMed** | 現行 FDA 藥品標籤（適應症、禁忌、警告、不良反應、交互、孕期哺乳、黑框） | **derivable** | ✅ furosemide → 231 筆 |
| 2 | **Drugs@FDA** | 核准與審查**歷史**（原始核准、補充核准、標籤版本、審查文件、學名藥等效性） | **lookup**（需 application number） | 未測 |
| 3 | **FDA Medication Guide** | 高風險藥的病人用藥指引 | **lookup**,且**條件式**（不是每種藥都有） | 未測 |

**1 和 2 不可互相取代**:DailyMed 是「現在在用的標籤」,Drugs@FDA 是「怎麼核准的、
標籤怎麼改的」。查藥物安全用 1,查監管沿革用 2。

### 第二層 · 術語標準化

| # | 來源 | 用途 | URL 型態 | 實測 |
|---|---|---|---|---|
| 4 | **RxNorm / RxNav** | 統一藥名、RXCUI、成分↔商品名↔劑型關係 | **derivable**（REST API） | ✅ furosemide → RXCUI `4603` |

```
https://rxnav.nlm.nih.gov/REST/rxcui.json?name=furosemide
→ {"idGroup":{"rxnormId":["4603"]}}
```

**這一項對資料庫架構最重要**,不是拿來讀藥理。它解決的是:

```
Lasix / Furosemide / Furosemide 20 mg tablet / Furosemide oral solution
```

其實是同一藥物家族的不同產品層級。

⚠️ **RxNorm 不涵蓋草藥、膳食補充劑與醫療器材。** 中藥永遠不會有 RXCUI ——
不要為此建一個永遠空白的欄位,也不要拿別的 id 硬塞。

### 第三層 · 安全更新（條件式）

| # | 來源 | 用途 | 型態 |
|---|---|---|---|
| 5 | **FDA Drug Safety Communications** | 上市後新發現的風險警示 | **lookup** · 條件式 |
| 6 | **FDA REMS** | 風險評估與管控（限制配送、處方者認證、病人登錄、孕期預防方案） | **lookup** · 條件式 |

**條件式的意思是:沒有就不要建欄位。** 憲法紅線 6 —— 200 筆共用一句
「無相關警示」比留空更糟,而且會毀掉覆蓋率統計。

卡片上顯示的應該是**查核日期**而不是空白宣稱:

```
FDA Safety Update    最後查核 2026-08-06 · 無連結警示
```

「最後查核」有意義,「無警示」沒有 —— 因為沒有人知道那是查過還是沒查。

### 第四層 · 病人衛教與研究

| # | 來源 | 用途 | URL 型態 | 實測 |
|---|---|---|---|---|
| 7 | **MedlinePlus 藥物** | 學生／病人可讀版本 | **lookup**（`a<NNNNNN>`） | ✅ a682858 = furosemide |
| 8 | **MedlinePlus 健康主題** | 適應症 → 疾病衛教頁 | **lookup** | 未測 |
| 9 | **PubMed** | 系統性回顧、統合分析、不良反應案例、中西藥交互 | **derivable**（搜尋式） | 未測 |
| 10 | **ClinicalTrials.gov** | 進行中／已完成研究、仿單外用途 | **derivable**（搜尋式） | 未測 |

**PubMed 不要只放首頁。** 放固定搜尋式,例如 `Furosemide AND hypokalemia`。
但要標明**那是搜尋不是結論** —— 憲法紅線 9:機轉 ≠ 療效,案例報告 ≠ 臨床證據。

### 第五層 · 整合醫學（你的差異化）

| # | 來源 | 用途 | 型態 |
|---|---|---|---|
| 11 | **NCCIH** | 草藥、補充品、安全顧慮、交互作用摘要 | lookup |
| 12 | **NIH Office of Dietary Supplements** | 營養素／電解質（鉀、鎂、B6、鐵、鈣、omega-3、D） | lookup |
| 13 | MedlinePlus Herbs & Supplements | 草藥入口 | **僅次級參考** |

**13 只能當次級來源。** 該站原本部分內容來自 Natural Medicines 資料庫,已不再提供,
所以**不可當唯一來源**。

**12 對利尿劑特別重要**,因為課件的重點正是電解質:

```
Loop diuretics → hypokalemia → 鉀 fact sheet + 鎂 fact sheet
```

---

## §2 卡片上的分組（不要堆十個藍色網址）

```
官方藥品資訊    DailyMed · Drugs@FDA · Medication Guide
安全更新        FDA Safety Communications · REMS        ← 有才顯示
術語            RxNorm / RxNav
病人衛教        MedlinePlus
研究            PubMed · ClinicalTrials.gov
整合醫學        NCCIH · NIH ODS
```

跟中藥卡一致:**顯示來源名稱,不露出醜的網址**(`js/knowledge.js` 的 named source
chips 已經是這樣做)。

---

## §3 現階段先固定六個

Ting 與 ChatGPT 討論的結論,我同意:

1. DailyMed
2. Drugs@FDA
3. RxNorm / RxNav
4. MedlinePlus
5. PubMed
6. ClinicalTrials.gov

涉及中藥或補充品再加 NCCIH 與 NIH ODS。FDA Safety Communications 與 REMS
做成條件式欄位。

---

## §4 欄位規格（配合本庫慣例,不是 ChatGPT 的 camelCase）

ChatGPT 提的是 `externalLinks.dailyMed`。**本庫全部是 snake_case + `_zh`/`_en`**,
採用 camelCase 等於分岔整個專案。所以:

```json
{
  "rxnorm_rxcui": "4603",
  "rxnorm_normalized_name": "furosemide",

  "dailymed_url": "https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=furosemide",
  "dailymed_url_kind": "derived_search",

  "medlineplus_url": "https://medlineplus.gov/druginfo/meds/a682858.html",
  "medlineplus_url_kind": "verified_exact",

  "fda_safety_last_checked": "2026-08-06",
  "fda_safety_alerts": [],

  "field_sources": {
    "contraindications_en": ["dailymed:furosemide", "course:W5-diuretics.md#electrolyte"],
    "mnemonic_en": ["course:Pharmacology Summary.md#L399"]
  }
}
```

**`*_url_kind` 是必要的**,值域:

| 值 | 意義 |
|---|---|
| `verified_exact` | 人或腳本實際打開過,確認是這個藥的專屬頁 |
| `derived_search` | 由藥名產生的搜尋連結 —— **有用,但不是「查過的來源」** |
| `verified_none` | 查過了,該站沒有這個藥的頁面 |

沒有這個欄位,`derived_search` 和 `verified_exact` 在卡片上長得一模一樣,
而它們的可信度差很多。中藥卡的 American Dragon 連結就踩過這個坑。

---

## §5 來源型別（`field_sources` 的值域）

沿用 ChatGPT 的分類,我認為對:

```
course              課件（PPT 抽出的 md）
instructor-note     老師口頭強調
board-outline       考綱
official-label      DailyMed / FDA 標籤
official-database   RxNorm / ODS
textbook
systematic-review
ai-explanation      ← 永遠不可假裝成原始資料
```

最後一項對應本庫既有的 `AI_generated_pending_review`。**模型解釋不是來源。**

---

## §6 已知未解（留給 Ting）

1. **`data/pharmacology/**` 的主人是誰**（憲法 §一 每條線一個主人）
2. **id 命名空間**:建議 `drug.furosemide` / `drugclass.loop_diuretics`,與
   `herb.*` / `formula.*` 一致,需鎖進 `DECISIONS.md`
3. Drugs@FDA / Medication Guide / REMS / MedlinePlus 健康主題 / PubMed /
   ClinicalTrials.gov 的 URL 型態**尚未實測**,填之前要各打一次確認
