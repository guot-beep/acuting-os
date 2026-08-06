# 遷移設計:localStorage → SQLite(H2)

**狀態:設計,遷移腳本尚未實作。** 本文件與
`data/clinical_cases/localstorage_sqlite_mapping.json` 是一對:機器讀那個,人讀這個。

- 來源:`acuting-clinical-cases-v1`(瀏覽器 localStorage,D7 永不進 git)
- 目標:`data/clinical_cases/schema.sql`(20 表)
- 對應表由 `app.js` 的 `normalizeClinicalCase()` / `normalizeSoapNote()` 產生,
  **每個目標欄位都經過 schema.sql 存在性驗證**才寫檔
- Last updated: 2026-08-06

> 對應檔的敘述文字裡一律寫年月(`2026-08`)而不是完整日期。
> `validate-clinical-case-standard.js` 的 K4 會把 `data/clinical_cases/` 底下任何
> `YYYY-MM-DD` 當成可能的出生日期並**阻擋**,只豁免 `created_at` 那類日期欄位。
> 這是對的 —— 一個會為了配合說明文字而放寬的 PHI 偵測器就沒有意義了。
> 下一個往那個目錄寫檔的人請照辦。

---

## §0 為什麼先寫設計而不是先寫腳本

H2 遷移是**對真實臨床資料的一次性操作**(D12)。腳本裡的一行
`red_flags: allergies` 沒有人會 review —— 它會通過所有驗證器,然後把「過敏史」
永遠變成「紅旗」的一部分。

**在腳本裡決定的對應,等於沒有人決定過。** 所以先把 67 個欄位攤開,
讓有爭議的那幾個被看見。

---

## §1 兩邊不是同一個形狀

localStorage 是**扁平的**:一個 case 物件,底下一個 `soapNotes[]`。
schema.sql 是**正規化的**:`patients` → `cases` → `visits` → `soap_notes`,
外加 12 張 junction。

所以這不是欄位改名對照,而是四種轉換:

| 轉換 | 意思 | 例 |
|---|---|---|
| `as-is` / `RENAME` | 一對一 | `advice` → `plan_patient_instructions` |
| `SPLIT` | 一個欄位變兩個 | `birthYearMonth` → `birth_year` + `birth_month` |
| `EXPLODE` | 一個欄位變多列 | `acupointLinks` → `visit_acupuncture` 每穴一列 |
| `JOIN` | 陣列壓成文字 | `westernConditionLinks` → 一個 text blob |

一筆 SOAP note 會變成 **`visits` 一列 + `soap_notes` 一列**(共用同一個 id),
外加最多 5 張 junction 的多列。

---

## §2 統計

**67 個欄位** · 61 mapped · **4 unresolved** · 2 no_destination_yet · 0 intentionally_not_migrated

> `intentionally_not_migrated` 是 0 —— 查完之後,**沒有任何欄位只是 UI 裝飾**。
> `workflowLink` 曾是唯一候選,查明它存的是 registry id 而非網址。

---

## §3 三個未決議題 —— 遷移作者不可自行決定

`status: unresolved_needs_ting`。這三項各自都有一個「看起來合理」的做法,
而那個做法都會**摧毀或捏造臨床意義**。Ting 於 2026-08-06 逐項否決。

### 3.1 舌質 + 舌苔 不可併成 `visits.tongue_zh`(2 個欄位)

```
tongueBody    舌質(淡紅/紅/淡白/紫暗…胖大/齒痕/裂紋)
tongueCoating 舌苔(薄白/黃膩/少苔/無苔…)
        ↓  ✗ 提議過,已否決
visits.tongue_zh   一欄
```

`docs/TCM_CASE_SPEC.md` 把這兩個分別列為「**缺,最重要**」而後補上。
併成一欄等於把當初補的那一刀退回去,而且**不可逆** ——
「淡紅胖大 · 黃膩」拆不回「舌質」與「舌苔」,因為分隔符不是資料。

**需要的決定:** `visits` 是否新增 `tongue_body_zh` / `tongue_coating_zh`
(additive,不受 9/01 影響),或明確接受合併並記錄理由。

### 3.2 `allergies` 不可併入 `case_intake_baseline.red_flags`

過敏史是**病史事實**;紅旗是**需要立即處理的警訊**。
「對青黴素過敏」放進紅旗欄,會讓紅旗欄同時裝著「該注意的既往事實」與
「現在要轉診的徵象」,而**下游任何以紅旗為條件的邏輯都會誤判**。

**需要的決定:** `case_intake_baseline` 是否新增 `allergies` 欄位。

### 3.3 `outcomeMetricLinks` 沒有值,不可寫成 `visit_outcomes` 列

```
outcomeMetricLinks: ["metric.pain_score", "metric.sleep_quality"]
                     ↑ 只有 id,沒有數值
        ↓  ✗ 提議過,已否決
visit_outcomes(metric_name="metric.pain_score", value_number=NULL)
```

一列 `visit_outcomes` 的語意是「這次量了這個指標」。
**metric_name 有值而 value 為 NULL,讀起來是「量了但結果是空的」——
而真相是「選了這個指標,從來沒填數字」。** 這兩件事在趨勢圖上長得一樣。

**需要的決定:** 這些 id 是「打算追蹤的指標」還是「量過的結果」?
若是前者,它需要自己的家(可能是 `cases` 層的追蹤清單),不是 `visit_outcomes`。

---

## §4 兩個尚無目標欄位(`no_destination_yet`)

**這不等於「不遷移」。遷移腳本遇到這兩個必須報錯停下,不可靜默丟棄。**

| 欄位 | 情況 | 下一步 |
|---|---|---|
| `workflowLink` | 存的是 `fertility.workflow.*` registry id(4 個有效值),不是網址 | 先跑 `scripts/inventory-workflow-links.js` 清點實際值,再決定 `visits.fertility_workflow_id` 要不要加驗證 |
| `currentMeds` | case 層的目前用藥。schema 只有 per-visit 的 `visit_western_medications` | 決定 case 層是否需要一個「目前長期用藥」欄位 |

---

## §5 一個貫穿全表的假設:語言槽

app 存**單一語言的自由文字**,schema 是 `_zh` / `_en` 成對。
對應表一律寫進 `_zh`,`_en` 留 NULL。

**這是標記假設,不是翻譯。** 若 Ting 曾用英文填某欄,它會被標成中文。
影響 8 個欄位(`goals` · `chiefComplaint` · `summary` · `plan` ·
`treatmentPrinciple` · `pathomechanism` · `assessment` 系列),
在對應表裡標為 `low` 風險。

---

## §6 十三個中風險轉換(有家,但過程中會做判斷)

`mapped` 但 `data_loss_risk: medium`。這些不需要 Ting 事前逐項裁定,
但**遷移腳本必須把它們的處理結果列印出來讓人核對**,不是靜默完成:

- `pastHistory` → `biomedical_history`(但也有 `tcm_history`,分不分是判斷)
- `menstrualObHistory` → 拆成 `menstrual_history` + `pregnancy_history`
  (**建議預設全寫進前者、後者留 NULL,不要猜**)
- `safetyFlagLinks` → `case_safety_flags`(**每次 visit 的旗標變成 case 層,
  失去它是在哪一診升起的**)
- `tcmPattern` · `pointsUsed` · `formulaHerbs` · `westernMeds` → 自由文字爆成多列,
  需要 id 解析;解析不出來的文字**沒有 fallback 欄位**
- `retentionMinutes` · `technique` → app 一診一個值,表是一穴一列,
  會被複製到每一列(每穴不同留針時間的資訊本來就沒被記錄)
- `outcomes` → `visit_outcomes.notes` 單獨一列,無 metric

---

## §7 腳本開始寫之前必須先有的東西

1. §3 三個未決議題的裁定
2. `scripts/inventory-workflow-links.js` 的執行結果
3. §6 十三項的「列印核對」機制設計
4. 一份可回滾的測試資料集 —— **絕不可拿真實 case 做第一次執行**(D12)

四項全部是 additive 或文件工作,不受 9/01 凍結影響。
9/01 真正鎖住的是**既有欄位的型態變更**(例如 §3.1 把 `tongue_zh` 拆成兩欄,
那要遷移腳本)。
