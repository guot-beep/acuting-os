# 提案 A — 臨床測量層(read-only,尚未實作)

狀態:**提案。本文件不改任何 schema、不新增任何 metric、不建立任何表。**
起因:Pilot 0 的 `sym.fever` 需要體溫、`sym.edema` 需要體重,兩者都不存在。
決定者:Ting。

---

## §0 先回答你列的六個檢查項

### 1. 既有 vitals 是否曾出現在其他 branch 或文件?

**有,而且比預期嚴重。`vitals` 不是「曾經提過」—— 它現在就在跑。**

| 位置 | 內容 |
|---|---|
| `app.js:4832 · 5364 · 5561 · 5620` | SOAP note 有 `vitals` 欄位,**自由文字**,畫面上是「生命徵象 Vitals」一格 |
| `docs/REBUILD_HANDOFF.md:1810` | 2026-07-03 Session 12:「依 Ting 要求補病歷欄位(…**生命徵象**…)」 |
| `docs/TCM_CASE_SPEC.md:49` | `objectiveOther｜其他望聞切、理學檢查、**生命徵象**｜有(objective)` |

**所以你早就要過這個欄位,而且它上線了。** 我在 Pilot 0 說「schema 沒有 vitals」是對的,但不完整 —— 正確的說法是:

> **`vitals` 存在於 localStorage 執行層,不存在於 `schema.sql`。兩邊已經分岔。**

實測:`soap_notes` 在 `schema.sql` 有 36 個欄位,**不含 `vitals`,也不含 `modalities`**(同一天加的治療手法欄位)。

### 這一點的後果比體溫本身更急

`data/clinical_cases/schema.sql` 是 H2 localStorage→SQLite 遷移的目標。**現在遷移的話,病人身上量到的生命徵象與治療手法會沒有欄位可落地。** 而 9/05 你進診所開始輸入,9/01 D12 凍結。

**這是本提案裡唯一有時間壓力的一項,而且它跟要不要蓋測量層無關。**

### 2. `schema.sql` 是否適合新增 junction table?

適合,而且**形狀已經存在**。`visit_outcomes` 就是一張 metric junction:

```sql
visit_outcomes(id, visit_id, metric_name, metric_category,
               value_text, value_number, unit, direction, notes)
```

一張 `visit_measurements` 會是它的雙胞胎。**這正是要小心的地方 —— 兩張幾乎一樣的表,是未來混淆的來源。**(見 §2 的三個選項。)

### 3. D12 additive-only 時間線

`D12` 2026-09-01 起 `schema.sql`、`acuting-clinical-cases-v1`、匯出格式**只增不改**。

- **新增一張表是 additive,9/01 後仍合法。**
- **把 `vitals` 從自由文字改成結構化,不是 additive** —— 那是 retype,9/01 後需要遷移腳本。

→ **若要改 `vitals` 的型態,必須在 9/01 前做完;9/01 後就只能新增而不能動它。**

### 4. outcome metric 與 measurement 如何避免重複?

現有 22 個 metric 每一筆都帶 `direction_good`(decrease / increase / individualized / contextual)。**那個欄位就是 outcome 的本質:它回答「往哪個方向算變好」。**

我建議的判準不是「主觀 vs 客觀」(`metric.menstrual_flow_volume` 是病人自述但明顯是測量),而是:

| | outcome metric | clinical measurement |
|---|---|---|
| 存在的理由 | **追蹤療程之間的變化** | **記錄這一次的生理狀態** |
| 有 `direction_good` 嗎 | 有,是必要欄位 | 沒有 —— 體溫 38.5 不是「變差」,它是一個值 |
| 有外部參考範圍嗎 | 沒有(0–10 是自訂尺) | 有(而且隨年齡/情境變動) |
| 誰產生 | 病人評分或醫者判讀 | 儀器讀數 |

**重疊是真實存在的,不要假裝沒有。** 體重同時是兩者:減重療程裡它是 outcome,一般看診裡它是 measurement。

→ 建議:**允許重疊,用 `also_tracked_as` 互指,不要強迫二選一。** 強迫分類會讓體重這種欄位每隔幾個月被搬一次。

### 5. 血壓這種雙值怎麼表示?

三種寫法:

| 寫法 | 問題 |
|---|---|
| 一個 id + `value_text: "128/82"` | 無法排序、無法畫趨勢 —— 等於退回自由文字 |
| 一個 id + 兩個數值欄位 | **需要改 junction 表的欄位型態 → 違反 D12(9/01 後)** |
| **兩個 id(systolic / diastolic)+ `pairs_with` 互指** | 兩列資料,一次輸入。表結構不用動 |

**建議第三種。** 理由是它不需要 junction 表帶第二個數值欄 —— 而那個欄位一旦加了,99% 的測量會永遠留空。

### 6. measurement 需要 normal range 嗎?

**需要,但不能是單一數字區間,也不能自動判讀。**

參考範圍隨年齡、性別、量測部位(耳溫/腋溫/口溫差 0.3–0.6°C)、情境(運動後心率)而變。存一組固定區間會產生**假確定性** —— 而這正是本 repo 一再踩到的模式(285/361 穴位安全欄位、100 張卡共用一個紅旗)。

建議:

```
reference_range_note   自由文字,說明範圍與其前提
measurement_method     耳溫/腋溫/口溫;上臂/手腕
requires_clinical_judgement: true
```

**不要**存 `normal_min` / `normal_max` 讓 UI 自動標紅。你是學生、進臨床第一年 —— 系統替你判讀「正常」比不判讀更危險。

---

## §1 建議的 id 形狀(若採用)

```
measurement.body_temperature
measurement.heart_rate
measurement.respiratory_rate
measurement.blood_pressure_systolic
measurement.blood_pressure_diastolic
measurement.oxygen_saturation
measurement.body_weight
```

七個,不多不少 —— 這是診間真的會量的。**不要一次列 30 個。**(D14 的教訓:詞彙表可以小,但要有驗證器。)

`sym.fever.supporting_measurements` 屆時填 `measurement.body_temperature`,而 `symptom` 驗證器的 Y11-c 目前**只接受 `metric.*`** —— 採用本提案就必須同步放寬,那是一次 validator 修改,要走正常流程。

---

## §2 三個選項

| | A1 只修分岔 | A2 詞彙表 + 沿用 `visit_outcomes` | A3 完整測量層 |
|---|---|---|---|
| 做什麼 | `schema.sql` 補 `vitals` / `modalities` 兩欄 | 新增 `measurement_vocabulary.json`,值寫進現有 `visit_outcomes` | 詞彙表 + `visit_measurements` 表 + UI |
| 9/01 前做得完 | ✅ 十分鐘 | ✅ | ⚠️ 有風險 |
| 解決 `sym.fever` | ❌ | ✅ | ✅ |
| 能畫趨勢 | ❌ 自由文字 | ✅ | ✅ |
| 新增概念 | 0 | 1(詞彙表) | 2(詞彙表 + 表) |
| 風險 | 不解決任何測量問題 | `visit_outcomes` 裝了兩種東西,`direction_good` 對測量沒意義 | 兩張近乎相同的表 |

### 我的建議:**A1 立刻做,A2/A3 等你進診所兩週後再決定**

理由:

1. **A1 是真正有 deadline 的。** 它跟測量層無關,是既有資料的落地問題,而且 9/01 之後改型態就要遷移腳本。
2. **A2 與 A3 的差別,只有你實際量過幾次之後才知道。** 你進診所會不會真的量血壓?學生跟診的場景可能根本量不到 —— 那 A3 就是蓋了一間沒人住的房子。
3. **Pilot 0 的教訓正是這個。** 三張卡才看出 quality 軸壞掉;測量層應該用同樣方式驗證 —— **先量幾次真的,再決定表長什麼樣。**

**不建議現在蓋 A3。** `sym.fever` 少一個 `supporting_measurements` 不影響它作為症狀卡的可用性 —— 那張卡的臨床價值在熱型辨證與紅旗,不在體溫數字。
