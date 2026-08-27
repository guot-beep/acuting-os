# A1 FORMULA SAFETY FIELD SEMANTICS — 方劑安全欄語意重設計

**Date:** 2026-08-27  
**Status:** NOT CANONICAL · NO PHI · RULES ONLY  
**Decision basis:** TING_RULING_SHEET_2026-08-27 A1(a) / DECISIONS.md D28  
**Scope:** `contraindications_*` and `cautions_*` for formula cards  
**Red line:** 寧缺勿造；每條安全敘述必須可追溯。方向詞不得靠翻譯者或模型自由改寫。

---

## 0. 設計目標

這份規格處理的是**安全語意結構**，不是逐卡內容修補。核心原則：

1. 一個欄位只回答一個問題。
2. 「禁用」與「慎用」的方向由**來源文字**決定，不由疾病嚴重度、藥味印象或模型常識推斷。
3. 中英文方向詞由受控詞彙表渲染；翻譯時只能查表，不得把 `avoid` 自由翻成「禁用」，也不得把「禁用」弱化成 `use caution`。
4. A2 的三個來源層級 `formula-specific` / `ingredient-derived` / `modern-component` 與本規格完全共用，但**來源層級不是證據強度排名**，它只描述警告直接作用在哪一層。
5. 來源層級若不是 `formula-specific`，不得把警告無條件升格成「整個方劑禁用／慎用」。
6. 十八反／十九畏等已有結構化 canonical 關係者，文字欄只做 UI 投影，不再承載 canonical 關係本身。

---

# 1. 兩欄的一句話判定

## 1.1 `contraindications_*`

> **只有當來源明確表示：在某一已定義狀態下「不得使用／禁止使用／contraindicated」時，才進 `contraindications_*`。即使監測、減量或專業監督也不能把該來源所表達的禁用改成可用。**

判斷問題：

> **來源是否明確要求「不要用」？**

若答案不是明確的 Yes，不能因為風險看起來很大就自行歸入 contraindications。

## 1.2 `cautions_*`

> **當來源表示仍可能使用，但需要慎用、監測、調整劑量／療程、專業評估、指定炮製／給藥前提、避免特定暴露方式，或受非臨床法規限制時，進 `cautions_*`。**

判斷問題：

> **來源是否仍保留「符合條件後可以使用」的可能性？**

若 Yes，屬 cautions；若來源只說 `not recommended` / `avoid` 而未明確說 `contraindicated` / `must not use`，也不得自動升級為 contraindication。

## 1.3 第三條路：`needs_review`

只要無法從原句可靠判斷「禁止」或「條件式使用」，就不硬分：

- 方向詞缺失；
- 同一句同時含禁用與慎用訊號；
- 方向被否定或不確定化，例如 `not contraindicated`、`no known contraindications`、`禁忌不明`；
- 來源層級／作用範圍不明；
- 中英文方向衝突；
- 想從「嚴重肝腎病／孕婦／高毒性」等客觀風險**推導**方向，而來源本身沒有下方向。

---

# 2. 方向詞受控詞彙

完整機器表見：

`data/research_staging/formula_safety_direction_lexicon_A1.json`

## 2.1 禁用族 → `contraindications_*`

| direction_id | 中文標準詞 | English standard | 用法 |
|---|---|---|---|
| `contraindicated` | 禁用於／禁忌於 | Contraindicated in | 來源明確使用禁忌／contraindicated 語意 |
| `do_not_use` | 不得使用／不可使用 | Do not use in | 來源為明確禁止句 |
| `prohibited_combination` | 禁止與…同用／禁止配伍 | Must not be combined with | 僅當 canonical 關係或來源明確為禁止方向 |
| `unprocessed_form_prohibited` | 未按規定炮製者不得使用 | Do not use the unprocessed form | 僅當來源明確禁止未炮製形態；若只是要求先炮製，見 caution |
| `exposure_limit_prohibited` | 不得超過指定暴露上限 | Must not exceed the specified exposure limit | 硬限制只作用於超出已來源支持的 dose/duration/exposure 條件，不等於整方禁用 |

### 不自動視為禁用的詞

以下詞**不得**自由翻成 contraindicated：

- 中文：`不建議`、`不宜`、`應避免`、`慎用`、`宜慎`、`需醫師指導`
- English: `not recommended`, `avoid`, `should avoid`, `use caution`, `under supervision`

## 2.2 慎用／條件族 → `cautions_*`

| direction_id | 中文標準詞 | English standard | 用法 |
|---|---|---|---|
| `use_with_caution` | 慎用於 | Use with caution in | 一般慎用 |
| `requires_monitoring` | 使用時需監測 | Requires monitoring | 生理、實驗室、不良反應或交互作用監測 |
| `requires_dose_adjustment` | 需調整劑量 | Requires dose adjustment | 來源允許以劑量調整降低風險 |
| `avoid_high_dose` | 避免大劑量使用 | Avoid high-dose use | 大劑量是風險條件，而非正常使用全部禁用 |
| `avoid_prolonged_use` | 避免久服／不宜久服 | Avoid prolonged use | 長療程條件性限制 |
| `professional_supervision_required` | 需專業人員評估／指導下使用 | Use only under qualified professional supervision | 不等於專業使用時也禁用 |
| `risk_benefit_assessment_required` | 需先評估風險效益 | Requires risk-benefit assessment | 孕期、共病、交互作用等常見 |
| `processing_prerequisite` | 需按規定炮製／處理後使用 | Requires specified processing before use | 符合前提後可用 |
| `administration_prerequisite` | 需按指定煎煮／給藥方式使用 | Requires specified preparation or administration | 先煎、後下等只有在來源明確與安全相關時使用 |
| `not_recommended` | 不建議用於 | Not recommended in | 明確弱於 contraindicated；不得升級 |
| `avoid_unless_directed` | 應避免，除非經專業評估 | Avoid unless directed by a qualified clinician | `avoid` 類警語的標準落點 |
| `athlete_restriction` | 運動員／禁賽規則限制 | Athlete restriction applies | 非臨床禁忌；須明示規則來源與日期／版本 |
| `regulatory_restriction` | 法規／產品使用限制 | Regulatory restriction applies | 非臨床禁忌；不可渲染成「對病人禁用」 |

---

# 3. 單條安全敘述的 shape

## 3.1 最小語意四元組

每一條 staging 敘述至少具有：

```text
{ target_state, direction_id, reason?, source_level }
```

- `target_state`：對象狀態。例：孕期、某共病、與某藥同用、大劑量／久服、未炮製形態、競賽運動員。
- `direction_id`：只能來自 controlled vocabulary。
- `reason`：可省；只能寫來源支持的理由，不可自行補機轉。
- `source_level`：只能為 `formula-specific` / `ingredient-derived` / `modern-component`。

## 3.2 可追溯性是寫入 gate，不是裝飾欄

為符合「每條可追溯」，staging 實際寫入還必須包含：

- `source_ref`：可唯一定位來源的 id／citation key；
- `source_locator`：頁、段、條文、章節、label section、relation id 等能定位到支持該**方向**的地方；
- `source_text`：支持方向的短摘錄或受控摘要；
- `subject_scope`：`formula` / `ingredient` / `component`；
- `subject_ref`：若為 ingredient/component 必須指出是哪一味／哪一成分。

**只有卡片有一個籠統來源，不代表該安全方向已被逐條支持。** 若來源無法定位到警告方向，`canonical_write_eligible = false`。

## 3.3 A2 三層互通規則

### `formula-specific`

來源直接談此方：

- `subject_scope = formula`
- 可直接渲染「本方禁用於…／本方慎用於…」。

### `ingredient-derived`

來源只談方中某一味：

- `subject_scope = ingredient`
- 必須保留藥味名稱；
- **不得自動把「某味禁用」改寫成「整方禁用」。**
- 建議 UI 語形：`本方含 X；X 的來源警告為……` / `Contains X; source warning for X: …`

### `modern-component`

來源談現代化學成分、藥理成分或檢測／法規成分：

- `subject_scope = component`
- 必須保留 component 名稱與其對應 ingredient（若已知且有來源）；
- 不得把 component 警告直接改寫成 formula-specific 禁忌。

**三個 source level 是作用層級，不是高／中／低證據分數。**

## 3.4 canonical card 與 staging shape 分離

現有安全欄 shape 為陣列，故本規格不要求立刻把卡片改成 object array：

- research staging：`array<object>`，保留完整語意與 provenance；
- canonical card：仍可維持 `array<string>`；
- 字串只能由 staging object + direction lookup table 產生，不允許人工自由翻方向詞。

---

# 4. 中英文渲染規則

1. `direction_id` 先定，再由詞彙表輸出 zh/en 標準方向。
2. `target_state` 與 `reason` 可翻譯，但不得改變量詞、否定、條件、程度或人群範圍。
3. 若中文來源只有「慎用」，英文只能渲染為受控的 `Use with caution` 類，不得變成 `contraindicated`。
4. 若英文來源為 `not recommended`，中文只能落到「不建議」，不得變成「禁用」。
5. 若來源方向本身不明確，翻譯不得替來源做裁決，直接 `needs_review`。
6. 雙語方向 id 必須一致；若 zh/en 各自有來源但 direction_id 不一致，必須 review，不能讓 UI 各說各話。

---

# 5. 十八反／十九畏與其他 canonical relation

## 5.1 canonical 承載

`herb_incompatibility_pairs.json` 等結構化關係仍是 canonical；文字安全欄不得另存一份獨立、可能漂移的關係事實。

## 5.2 UI 投影

若要在 `contraindications_*` 顯示：

- 文字由 relation record 產生；
- staging entry 必須帶 `canonical_relation_ref`；
- `source_level = ingredient-derived`；
- 方向**繼承 relation record 的 direction/severity**，不得在文字層自行改寫；
- 不重複手寫完整「十八反／十九畏」列表。

示意：

```text
配伍禁忌：見結構化十八反／十九畏關係。
Incompatibility: see the structured incompatibility relation.
```

若 formula-specific 來源另外明確說「此方不得與 X 同用」，那是另一條 formula-specific assertion，可獨立存在。

---

# 6. 邊界案例裁法

## 6.1 孕婦

| 來源原意 | 欄位 | direction_id |
|---|---|---|
| 孕婦禁用／pregnancy is contraindicated | contraindications | `contraindicated` |
| 懷孕期間不得使用／do not use during pregnancy | contraindications | `do_not_use` |
| 孕期慎用／use with caution in pregnancy | cautions | `use_with_caution` |
| 僅在效益大於風險時使用 | cautions | `risk_benefit_assessment_required` |
| 孕期不建議使用 | cautions | `not_recommended` |
| 孕期安全性尚未建立 | cautions 或 needs_review | 若來源同時提出限制，使用相應 caution；若只是資料不足敘述而沒有使用方向，`needs_review` |

**禁止規則：不能因「孕婦」三個字就預設 contraindication。**

## 6.2 大劑量／久服

- `大劑量慎用`、`不宜久服`、`avoid prolonged use` → cautions。
- `不得超過 X` / `must not exceed X` 若來源是明確硬上限，可用 `exposure_limit_prohibited` 記為 contraindication **但 target_state 必須是「超過 X 的暴露」**，不是「此方一律禁用」。
- 只看到「長期可能有毒」而沒有使用方向 → 不自行生成禁用或慎用，`needs_review`。

## 6.3 炮製／處理前提

- `需炮製後使用` / `requires processing before use` → cautions / `processing_prerequisite`。
- 只有當來源明確說「未炮製形態不得使用」時，才可額外建立 contraindication，target_state = unprocessed form。

## 6.4 運動員／禁賽／法規

- 一律不把「比賽規則禁止」渲染成病人臨床 contraindication。
- 放 `cautions_*`，用 `athlete_restriction` 或 `regulatory_restriction`。
- 必須保存規則機構、規則版本／日期或可追溯 locator。
- 若同一成分另有真實臨床禁忌，另開一條，兩者不可混成一句。

## 6.5 器官衰竭、嚴重共病、交互作用

疾病「看起來很嚴重」不是自動禁用理由：

- source says `contraindicated` / `do not use` → contraindications；
- source says monitor / reduce / caution / assess → cautions；
- source只描述風險但不下使用方向 → needs_review。

---

# 7. 守門規則（建議 CI invariants）

1. **Direction-field invariant**：contraindications 中不得出現 caution-only direction_id；cautions 中不得出現 contraindication-only direction_id。
2. **Bilingual parity invariant**：同一 assertion 的 zh/en 必須共用同一 `direction_id`。
3. **Provenance invariant**：無 `source_ref + source_locator` 不得寫 canonical。
4. **Scope invariant**：`ingredient-derived` / `modern-component` 不得渲染成 formula-level assertion，除非另有 formula-specific source。
5. **Relation invariant**：有 `canonical_relation_ref` 時，text direction 必須繼承 relation record，不得另存第二套 canonical 關係。
6. **No free direction translation**：canonical zh/en 方向詞必須存在於 controlled lexicon，禁止任意同義詞。
7. **No inference upgrade**：`not recommended` / `avoid` / `慎用` 不得轉成 contraindicated；任何 direction upgrade 必須有來源支持。
8. **Review quarantine**：`needs_review` 不得進 canonical `contraindications_*` / `cautions_*`。

---

# 8. 本包不做的事

- 不逐卡重寫 224 張方劑；
- 不替 163 張 duplicated English safety fields 猜哪一欄原本才是「真的」；
- 不把 A2 ingredient/component 警告自動提升為 formula-specific；
- 不重新裁定十八反／十九畏內容；
- 不根據模型醫學常識補來源沒有講的理由、劑量或禁忌。

163 張遷移的機器規則與 test fixtures 見：

`docs/research_packs/A1_FORMULA_SAFETY_MIGRATION_RULES_2026-08-27.md`
