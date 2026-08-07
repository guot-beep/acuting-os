# 臨床資料地基設計 — 病例連接 × 數據收集 × 保險 × 論文 (雛形)

Written: 2026-08-07 (Claude, at Ting's request). Status: DESIGN — Ting approves
before any schema or data work starts.

輸入：Ting 的 `Acuting_OS_Condition_Pattern_Source_Mapping_Spec_v2_2026-08-07.md`
(下稱 **v2 spec**)。本文件是它與倉庫現況的對賬 + 落地設計。

Read together with: DECISIONS.md (D4/D9/D11/D12/D13/D14) ·
docs/CONDITIONS_INTEROP_DESIGN.md · docs/TCM_CASE_SPEC.md ·
docs/PROPOSAL_A_CLINICAL_MEASUREMENT_LAYER.md ·
docs/PROPOSAL_B_SYMPTOM_ATTRIBUTE_ARCHITECTURE.md ·
data/clinical_cases/schema.sql · data/config/relation_registry.json。

---

## §0 裁決先講：「大改動」的真實範圍

Ting 2026-08-07:「我感覺要大改動。」對照後的誠實答案:

**知識層不需要重蓋。** v2 spec §28 自己也這樣說。四個命名空間、統一搜尋、
受控分組、來源頁掛卡 —— 8/5 重構(8/7 復原)已經是 v2 spec §0–§5 要求的形狀。
再動它是把力氣花在已經對的東西上。

**真正的大改動在病例層,而且是「結構化」不是「重蓋」。** 病例現在存的是
自由文字(舌脈、vitals、症狀都是 prose);要收集可分析的數據,這些必須變成
指向 canonical id 的結構化紀錄。這是本文件的主體。

**而它有一個真實的期限:D12 凍結(2026-09-01 起 additive-only)。**
凍結後「新增表」仍合法,「改欄位型態」不合法。所以 §7 的清單有先後之分。

### v2 spec 逐項對賬

| v2 spec 要求 | 倉庫現況 | 裁決 |
|---|---|---|
| §0 四命名空間、CloudTCM 只當 provenance | D11 已鎖、8/5 已實作 | ✅ 已存在 |
| §2 cond/tdis/pattern/sym 定義 | 一致(sym.* 3 筆種子) | ✅ 已存在 |
| §6–8 卡片欄位建議 | 與現有模板大體重疊 | ⚠ 不照抄 —— 現有模板是正本,缺的欄位個別評估後 additive 加入 |
| §9 sym.* 卡片欄位 | SYMPTOM_CARD_TEMPLATE 已有;屬性軸問題見提案 B | ✅ 走提案 B,不另起爐灶 |
| §10 relation registry 單向邊 | D13 已鎖,registry 已運作 | ✅ 已存在;缺 qualifier/evidence/strength(§3.4) |
| §11 mapping_strength / mapping_basis | 無 | ➕ 採用(§3.4) |
| §12–15 Patient/Case/Visit 模型 | schema.sql 已有三層 + junctions | ✅ 大半存在;缺口見 §3 |
| §16 人口學分析變數 | patients 缺 race/ethnicity | ➕ 採用(§3.1) |
| §17 field_sources 逐欄位溯源 | 只有整卡 sources[] | ⚠ 部分採用 —— 新內容用,舊卡不回填(工作量不成比例) |
| §18–19 來源分層 Tier A–D | TCM_SOURCE_REGISTRY + PHARM_SOURCE_TIERS 已有類似 | ✅ 合併進 source_registry 的 tier 欄位,不另建文件 |
| §24 目錄重排 | — | ❌ 不做。spec 自己說 backward compatibility 優先 |
| §28 UI 凍結、下一步清單 | — | ✅ 採用,即本文件 §8 |

**v2 spec 與現有決策的三個衝突(以現有決策為準):**

1. spec §6 建議 cond 卡加 `biomedical_management.medications` —— 這踩到
   PHARM 線的所有權與安全規則(交互作用只引官方標籤)。cond 卡只放
   `medication_links[]` 指向 med.*,內容留在西藥卡。
2. spec §10 的 edge 檔案形狀(獨立 edge 物件)與現行 registry(欄位註冊制)
   不同。**保留現行制** —— 已有 validator 與 build 依賴它;qualifier 以
   additive 方式加進去(§3.4),不遷移。
3. spec §17 要求每個 sourced fact 可追溯 —— 對,但**只對新寫入生效**。
   繼往的 284 張卡按原計畫走 review_status 升級,不做一次性 field_sources
   回填(那是把 189 個假中文事件的修復力氣挪去搬格式)。

---

## §1 五層模型(每層一句話)

```
L1 知識圖譜     cond/tdis/pattern/sym 卡 + relation_registry 單向邊
                = 「醫學上什麼跟什麼有關」(已大半存在)
L2 編碼側車     condition_crosswalk: ICD-10-CM(已種 150 筆)/CPT 預留/大辭典
                = 「同一件事在別的系統叫什麼」(已存在,待填)
L3 臨床實例     patients → cases → visits + junction 表,全部指向 L1 的 id
                = 「這個病人這次是什麼」(schema 已有,app 還在寫自由文字)
L4 衍生分析     從 L3 算出來的統計,runtime 或 snapshot,永不寫回 L1 (D9)
                = 「我的病人裡,X 證型最常伴哪些症狀」
L5 匯出         去識別化 CSV/JSON 長表(論文用)+ superbill 草稿(保險用)
                = 「拿得出去的東西」
```

鐵律(全部既有,重申):病人屬性永不寫進知識卡(v2 spec §6);證型記在
visit 層(D5, visit_tcm_patterns 已存在);邊單向儲存(D13);臨床統計
永不落在知識記錄裡(D9)。

---

## §2 Ting 列的變數,每一個對到哪裡

「病人有甚麼病症 年紀 性別 種族 已有週期 病程 治療時間 狀態」:

| 變數 | 落點 | 現況 |
|---|---|---|
| 病症(西醫) | `case_western_conditions.condition_id → cond.*` | ✅ 表已存在 |
| 病症(中醫病名) | `case_eastern_diseases.disease_id → tdis.*` | ✅ 表已存在 |
| 證型 | `visit_tcm_patterns.pattern_id → pattern.*`(隨診變) | ✅ 表已存在 |
| 症狀 | `visit_observations.sym_id → sym.*` | ❌ **缺表**(§3.2) |
| 年紀 | `patients.birth_year + birth_month`(D4: 只存到月) | ✅ 已存在;分析時算年齡帶 |
| 性別 | `patients.sex_at_birth + gender_identity`(已分開) | ✅ 已存在 |
| 種族 | `patients.race + ethnicity`(兩欄分開,選填) | ❌ **缺欄**(§3.1) |
| 週期 | `visits.cycle_day/cycle_phase + fertility_cycle_tracking` | ✅ 已存在 |
| 病程 | `cases.approx_onset + course` | ❌ **缺欄**(§3.1) |
| 治療時間 | 不存 —— 從 visits 推導(首末診間隔、就診次數) | ✅ 衍生值,L4 |
| 狀態 | `cases.status` 擴充 course/status 詞彙(§3.1) | ⚠ 有欄,詞彙未控 |

---

## §3 Schema 增補(全部 additive;★ = 9/01 前必須)

### §3.1 patients / cases 補欄

```sql
-- patients(additive,選填,分析用;不進任何知識卡)
race TEXT,                -- 受控詞彙 demographic_vocabulary.json
ethnicity TEXT,           -- 與 race 分開建模(v2 spec §13)

-- cases(additive)
approx_onset TEXT,        -- "2025-11" 粒度,D4 精神:粗化不造假
duration_at_intake TEXT,  -- 初診時病程,如 "3_months"
course TEXT,              -- acute|subacute|chronic|recurrent|episodic
severity_baseline TEXT    -- 初診嚴重度摘要(數值進 visit_observations)
```

`cases.status` 詞彙擴為 active|recurrence|relapse|remission|resolved|closed
(FHIR clinicalStatus 的可用子集,v2 spec §14)。

### §3.2 ★ visit_observations — 本設計唯一的新表

一張表統一承載症狀/體徵/舌/脈/vitals/量測(v2 spec §15 + 提案 A 的
vitals 缺口一起解決;FHIR Observation 的教訓:不要什麼都當 condition):

```sql
CREATE TABLE IF NOT EXISTS visit_observations (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  sym_id TEXT,              -- FK → sym.*;vitals 等量測也是 sym.*(提案 A)
  observation_type TEXT,    -- symptom|sign|tongue|pulse|vital_sign|lab_finding|scale
  present INTEGER,          -- 1 有 0 明確無(「問了說沒有」是資料,NULL 是沒問)
  severity_0_10 INTEGER,
  laterality TEXT,          -- 受控:symptom_laterality.json
  quality TEXT,             -- 受控:symptom_quality.json(軸缺陷見提案 B)
  timing TEXT,              -- 受控:symptom_timing.json
  value_number REAL,        -- 量測值(體溫、BP、體重…)
  value_text TEXT,
  unit TEXT,
  loinc_code TEXT,          -- 有才填,不硬配
  notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id)
);
```

- 舌脈:`observation_type='tongue'/'pulse'` + sym.*(不另建 tongue.* 宇宙,
  v2 spec §9);現有 `visits.tongue_zh/pulse_zh` 自由文字**保留不動**,
  結構化是加項不是取代。
- **★ 提案 A 的緊急項在此收編**:localStorage 已在收 `vitals`/`modalities`
  而 schema.sql 沒有欄位。vitals → 本表;modalities → `visit_acupuncture`
  補 `modality` 欄或 soap_notes 補欄(照提案 A 的選項,Ting 裁)。
  **9/01 後只能加表不能改型,這件事必須在凍結前落地。**
- 與 `visit_outcomes` 的分界照提案 A:有「往哪個方向算好」的是 outcome,
  單純量到什麼的是 observation。`visit_outcomes` 補一欄 `metric_id`
  指向 outcome_metrics.json 的 id(現在只存 metric_name 字串)。

### §3.3 sym.* 名冊(D14 順序,提案 B 的軸修正優先)

```
1. 詞彙表   symptom_taxonomy.json 已有(13 類);屬性軸照提案 B 裁決後定
2. 模板     SYMPTOM_CARD_TEMPLATE.md 已有
3. 驗證器   validate-symptom-standard.js 已有
4. 種子     不進大字典。第一批 = 已被引用的 id:
            condition.sign_symptom_ids(7) + tdis.key_manifestation_ids(5)
            + pattern.key_signs_ids(2) + 雲端中醫 129 筆症狀種子
            + 提案 A 需要的 vitals 基本組(體溫/血壓/體重/心率)
5. 內容     種子建卡後才填,照現行填充線規則
```

### §3.4 relation_registry 補 qualifier(additive)

現行 registry 是「欄位註冊制」,保留。每個 edge 定義加三個選填鍵:

```json
"qualifier_vocabulary": ["key","supporting","common","occasional"],
"mapping_strength": ["high","moderate","low"],
"mapping_basis": ["official_standard","clinical_guideline","textbook",
                   "source_website","course_material","expert_review","inferred"]
```

寫入端(卡片欄位)相應從 `["sym.x"]` 允許升級為
`[{"id":"sym.x","role":"key","basis":"textbook"}]` —— 兩種形狀並存,
validator 兩種都收,舊資料不遷移。**分析時的用途(v2 spec §11 的原話):
從 300 個病例學到的關聯,絕不能與從一個教學網站抄來的關聯無聲混在一起。**
L4 統計輸出必須帶 basis 欄。

---

## §4 保險層(v2 spec §28 Insurance 節照單全收)

**不建平行 ICD 頁。** 已有的東西:`condition_crosswalk.json` 150 筆全部
有 icd10[] 種子(NLM 官方標籤)、cpt_placeholder/insurance_placeholder 預留、
`visit_billing_links` 表已存在。

補的東西(全部 additive):

1. cond 卡 UI 加一格「保險/編碼 Insurance & Coding」:渲染 crosswalk 的
   icd10[] + `documentation_requirements_zh`(新欄,charting 該寫什麼才
   支撐這個碼 —— documentation hint,不是 billing truth,固定標語照
   CONDITIONS_INTEROP_DESIGN §8)。
2. crosswalk 補 `icd10_version` 欄(ICD-10-CM 年版;編碼是有版本的)。
3. Superbill 草稿匯出(L5):visit → case_western_conditions → xwalk.icd10
   + CPT 97810/97811/97813/97814(codes only,預留欄) → 一頁 JSON/列印。
   標題固定帶「非請款依據 / not a billing determination」。
4. CPT descriptor 授權問題不變(AMA license):只存碼不存描述文字。

---

## §5 論文/研究層(L4 + L5)

### 分析單位與長表

去識別化匯出三張長表(CSV/JSON,一鍵):

```
case_rows    case_id · age_band · sex · race · ethnicity · cond ids ·
             tdis ids · course · duration_at_intake · n_visits ·
             first_to_last_days · status
visit_rows   case_id · visit_number · visit_date(相對天數,不出絕對日期) ·
             cycle_day/phase · pattern ids(+is_primary) · points ·
             formulas · outcome_verdict
obs_rows     visit_id · sym_id · observation_type · present · severity ·
             value/unit · loinc_code
```

### v2 spec §1 的六個問題 → 全部變成這三張表的 group-by

| 問題 | 查法 |
|---|---|
| 哪些症狀最常與證型 X 共現 | obs × visit_patterns join,count |
| 病 Y 的病人最常見哪些證型 | case_rows.cond × visit_rows.patterns |
| 證型分佈隨年齡/性別/病程變化 | case_rows 人口學 × patterns |
| 哪種治療與某症狀改善相關 | visit_rows.treatment × obs 縱向差 |
| 一個西醫診斷平均對到幾個證型 | case → distinct patterns count |
| 病人證型如何隨療程變化 | visit_rows 按 visit_number 排序 |

### 老實話(論文用途的邊界)

- 這是**單一執業者、去識別化病例系列**的資料形狀 —— 可支撐 case series /
  audit / 假說生成,不是 RCT;n 會小,匯出永遠帶 n。
- 任何細胞 n<某閾值(建議 5)的彙總不匯出 —— 小格子會變成再識別風險
  (HIPAA 精神,CONDITIONS_INTEROP_DESIGN §7 的 18 識別項規則不變)。
- 發表前的 IRB/倫理諮詢是 Ting 的行政待辦,系統只保證資料從第一天就是
  乾淨可稽核的:canonical id + 受控詞彙 + basis 標記 + 版本化編碼。
- ZY/T 10—2024(中醫療效評價通則)列為 outcome 欄位設計的方法學參照
  (v2 spec §3.2F),outcome_metrics.json 擴充時對著它擴。

---

## §6 sym.* 之外,知識層唯一要動的:cond 卡外部碼

`external_codes[]`(v2 spec §2.1)**不加進 cond 卡** —— crosswalk 側車
就是它的家(檔案已存在、已種 150 筆)。SNOMED/MeSH 等其他系統要加時,
加進 crosswalk 記錄,不動 canon。卡片 UI 從 crosswalk join 渲染(D13:
join at render)。

---

## §7 時間線(關鍵:D12 凍結 = 2026-09-01)

```
9/01 前(必須,retype 類)
  ★ vitals/modalities 落進 schema.sql(提案 A 唯一急件,形狀=§3.2)
  ★ visit_observations 表 + visit_outcomes.metric_id 欄定案
  (寧可表先建好空著,也不要凍結後才發現要改型)

9/01 前(順手,additive 但便宜)
  patients.race/ethnicity · cases 病程四欄 · crosswalk.icd10_version

9/05–11 月(診所實跑期,只加不改)
  sym.* 種子建卡(§3.3 順序) · registry qualifier · cond 卡保險格 UI

11–12 月(H2,照 NORTH_STAR 原排程)
  localStorage→SQLite 遷移(表已備好) · L5 匯出器 · superbill 草稿
  L4 分析頁(D9:runtime 統計)
```

---

## §8 最小安全第一批(Ting 核准本設計後)

1. `schema.sql` 加 §3.1 + §3.2(一個 commit,純 additive,migration risk:
   零 —— 沒有任何既有資料要動)。
2. 提案 A 的 vitals/modalities 裁決落地(Ting 從提案 A 選項中選一)。
3. `data/config/demographic_vocabulary.json`(race/ethnicity/course 詞彙,
   D14 part 1)。
4. validator:`validate-clinical-schema.js` —— 檢查 junction 表的 id 都
   解析得到 canonical 記錄、observation_type 在受控清單內、cases.status
   在詞彙內。
5. 跑 `node scripts/build-data.js` + 全 validator + ratchet,回報逐項數字。

**明確不做(本批):** UI 大改(9/01 凍結)· sym.* 大量建卡 · SNOMED 引入
(授權未清)· FHIR server · 任何知識卡的 field_sources 回填。

---

## §9 v2 spec 的保存

原檔已入庫:`docs/imports/Acuting_OS_Condition_Pattern_Source_Mapping_Spec_v2_2026-08-07.md`
(來源文件,歷史紀錄;規則以 DECISIONS + 本文件裁決為準)。
