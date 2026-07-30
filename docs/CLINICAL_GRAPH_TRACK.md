# AcuTing OS — Clinical Graph Track（臨床經驗圖譜:中長期目標)

**Status:** 方向紀錄。來源 = Ting 與 ChatGPT 一起看完網站後的討論結論
(2026-07-29),Claude 消化、對帳、落地成規格。

**定位:中長期目標,不是本週工作。** 這份文件**不覆蓋**
`docs/NORTH_STAR.md`(策略)、`docs/BLUEPRINT.md`(架構定案)、
`DECISIONS.md`(一次性門)、`docs/LEARNING_LOOP_TRACK.md`(學習迴路)。
它是在它們之上補**「病例 ↔ 知識 雙向圖譜」**這一層的欄位規格、驗收標準
與護欄。與它們衝突時,以它們 + Ting 最新指示為準。

一句話總結:**讓系統從「教材」變成 Ting 自己的臨床經驗圖譜。**

---

## 0. 先讀這段 — 哪些已經有了,哪些是真的新的

反重複造輪子。這次討論的七個主題,大多數在 repo 裡**已有骨架**,
真正缺的是 runtime / UI 與詞彙表。

| 討論主題 | repo 現況 | 這份文件新增什麼 |
|---|---|---|
| Patient → Episode → Visit 三層 | **已存在**:`schema.sql` = `patients` → `cases` → `visits` | 澄清 Episode = 現有的 `cases`,**禁止再加第四層**;缺的是 app 端的 patient hub(CG1–CG3) |
| 雙向連結 | 部分:`NORTH_STAR` H2-3 relationship graph(設計階段) | 知識頁「我的臨床用法」panel 規格 + 統計落地規則(CG4/CG5 = DECISIONS D9) |
| 病例追蹤指標 | **已存在**:`visit_outcomes` 表(metric/value/unit/direction)+ 12 個 metric 定義 | 新增 10 個 metric(含 `effect_duration_days`)+ Baseline/Today/Change/Trend 顯示契約(CG6–CG8) ✅ CG6 已做 |
| 臨床反思 | **已存在**:`case_reflections` 3 欄 + `visits` 的 LL1 三欄(已進 schema 也已進 app) | ChatGPT 六問 → 現有欄位對映,補 3 個缺口(CG9) |
| 複習系統 | 部分:`LEARNING_LOOP_TRACK` LL2 誤案頁 + LL5 SRS(設計階段) | review queue 的**七個來源**與排序規則(CG10) |
| 搜尋 | 部分:首頁統一搜尋(只涵蓋知識層) | 病例/看診/筆記併入同一搜尋 + facets + **索引護欄**(CG11–CG12) |
| 評估標準權重 | 無 | 新的驗收權重表(§8),取代「先做好看」的直覺 |

---

## 1. 病例結構:Patient → Episode → Visit(已存在,**勿新增第四層**)

Ting 的目標形狀:

```
Patient A
├── Menstrual disorder episode
│   ├── Visit 1  ├── Visit 2  └── Visit 3
└── Low back pain episode
    ├── Visit 1  └── Visit 2
```

**這個形狀在 `data/clinical_cases/schema.sql` 裡已經是對的**:
`cases.patient_id` → `patients.id`,`visits.case_id` → `cases.id`。
一個病人多個病程 = 同一個 `patient_id` 底下多筆 `cases`。

> **給任何接手 AI 的硬規則:不要新增 `episodes` 表、不要把 `cases` 改名。**
> ChatGPT 講的「Episode」就是現有的 `cases`(一個病程/一個主題),
> `case_intake_baseline` 是該病程的基線。加第四層會讓所有 junction 表
> 重新指向(D1/D5 級的全庫遷移),而且換不到任何新能力。
> 詞彙統一:資料層一律叫 `case`;UI 上顯示成「病程」/ Episode 即可。

真正的缺口在 **runtime**,不在 schema:`app.js` 的
`acuting-clinical-cases-v1` 是**平的** — 病例直接掛 `patientCode` 字串,
沒有 patient 實體,所以「同一個病人的兩個病程」在畫面上看不出來。

| ID | 工作 | 說明 |
|---|---|---|
| CG1 | **Patient hub 頁** | 一個病人一頁:夾層摘要 → 該病人所有病程(episode)卡 → 每個病程展開成 visit timeline。這是「三年後看到一條可追蹤的臨床時間線」的實作。 |
| CG2 | **病例列表改成兩層** | 現在的 cases 分頁列的是病程;上面加「依病人聚合」切換。 |
| CG3 | **localStorage → patient 實體遷移** | 以 `patientCode` 去重建 patient 實體(adds-only,不動既有 key)。**照 D4:patient 實體不得帶任何可識別資訊。** 這一步排在 H2 的 localStorage → SQLite 遷移**之前或同時**,不要做兩次。 |

## 2. 雙向連結 — 整個系統的心臟(以及最重要的護欄)

目標:病例裡選到 `脾氣虛` / `SP6` / `桂枝茯苓丸`,系統自動建立反向關係。
打開 SP6 時看到的不是教材,而是:

```
我的臨床用法(n=18 cases / 42 visits)
最常搭配的證型: 脾氣虛 · 血虛 · 腎虛
常用配穴:      SP6+ST36 · SP6+CV4 · SP6+LV3
療效分佈:      improved 12 / no_change 5 / worsened 1
```

| ID | 工作 | 規格 |
|---|---|---|
| CG4 | 知識頁「我的臨床用法」panel | 資料來源:`visit_acupuncture` / `visit_formulas` / `visit_herbs` / `visit_tcm_patterns` / `visits.outcome_verdict` 的反向查詢。**0 筆時整個 panel 不顯示**(不要空殼)。**一律顯示樣本數** — n=3 和 n=40 的意義完全不同,不顯示 n 就是在製造假信心。 |
| CG5 | **護欄(DECISIONS D9)** | 預設 runtime 計算。**快照可以進 git**,但只能是**獨立的、有日期的**衍生檔 `data/audits/clinical_usage_snapshot.json`;**絕不可**寫成 canonical 知識記錄裡的欄位。 |

> ### CG5 — Ting 2026-07-29 裁定後的版本
> 本文件初稿把這條寫成「統計永不落地」,理由掛在隱私上。**Ting 指出那個
> 理由錯了,她是對的**:「18 例」是計數與約略值,不指向任何人,而且她記錄
> 時本來就不記名。所以**快照可以寫、可以進 git**。
>
> 真正不能做的只有一件事:**把聚合值寫成 canonical 知識記錄裡的欄位**
> (在 `data/acupoints/361.json` 裡塞 `used_in_cases: 18`)。理由是工程性的,
> 不是隱私性的:
> 1. **它會無聲過期** — 下一次看診一記錄,那個數字就錯了。卡片上寫 18 例
>    而實際是 25 例,正是 AGENTS.md 列為最重罪的假數字。有日期的快照檔
>    不會這樣騙人,它自己寫著「as of 2026-07-29」。
> 2. **它會讓 canonical 知識檔每個看診日都變髒** — 知識層的價值在於
>    它的 diff 有意義(D7);每週重算的統計會把真正的內容 diff 埋掉。
>
> **殘餘的隱私風險只在未來的公開匯出**(NORTH_STAR H3):公開頁面上
> 「used in 1 case」+ 一個病名,小樣本格是可以反推的。規則:**公開匯出
> 遮蔽 n < 5 的格;私人 App 顯示全部 n,而且一律把 n 顯示出來。**

## 3. 病例追蹤:先統一格式,再談圖表

Ting 的原則:**第一階段不求複雜,只求資料格式一致**;折線圖以後再說。

`visit_outcomes` 表已經是對的形狀(`metric_name` / `metric_category` /
`value_number` / `unit` / `direction`),`outcome_metrics.json` 已定義 12 項:
pain_score · sleep_quality · stress_level · energy_level · cycle_length ·
bleeding_days · ovulation_confirmed · lh_surge · bbt_pattern ·
endometrial_lining · follicle_size · adverse_reaction。

| ID | 工作 | 內容 |
|---|---|---|
| CG6 | **補 metric 詞彙表** ✅ 已做 2026-07-29 | 新增 **10 項**(id 一律 `metric.*`,加了就不改名 — D1): `sleep_hours` · `sleep_onset_minutes` · `night_wakings` · `mood` · `bloating` · `bowel_frequency` · `menstrual_flow_volume` · `menstrual_clots` · `post_treatment_reaction` · **`effect_duration_days`**。同時把原有 12 項補上 `label_zh`/`label_en`,並在 0-10 量表標明哪端是好(mood 0 最差 / pain 0 無痛,以前沒寫,量表方向靠猜)。合計 22 項。 |
| CG7 | **不要重複的東西**(Ting 清單裡有、但**故意不新增** metric 的 4 項) | **舌象 / 脈象** → 已在 `visits.tongue_*` / `pulse_*` 與 `soap_notes.objective_*`,趨勢視圖直接讀 visit 那一列。**疼痛** → 用既有 `metric.pain_score`。**疲勞** → 記在既有 `metric.energy_level` 的低分,**不另開 `fatigue`** — 同一個事實兩個家會立刻分岔。(所以 Ting 的 14 項清單 = 10 新 + 4 個已有的家。) |
| CG8 | **四欄顯示契約** | 每個指標一律呈現 `Baseline / Today / Change / Trend` 四欄。Baseline = 該**病程**首診值(不是該病人首診值)。Trend 第一階段只用 ↑ ↓ → 與箭頭數,不畫圖。 |

> `effect_duration_days`(效果維持時間)是 Ting 特別點出來的一項,
> 它是**決定療程間隔**的依據,現有 12 個 metric 完全沒有覆蓋。優先補這一個。

## 4. 臨床反思:六個固定問題

Ting 的原話重點:**病例記錄只是資料,反思才會把資料轉成臨床能力。**
每個病程或每次療程結束都要有一個簡短 Reflection 區。

六問 → 現有欄位對映(**三個已經有,三個要補**):

| 六問 | 落在哪 | 現況 |
|---|---|---|
| What worked? | `case_reflections.what_worked` | ✅ 已有 |
| What did not work? | `visits.outcome_verdict`(LL2)+ `what_to_adjust` | ✅ 已有 |
| What would I change next time? | `case_reflections.what_to_adjust` | ✅ 已有 |
| **What changed?** | 新欄位 `case_reflections.what_changed` | ⬜ CG9 |
| **What surprised me?** | `visits.reflection_note`(LL1 按語)可承接,但**病程層**要獨立一欄 `what_surprised` | ⬜ CG9 |
| **What do I need to study?** | 新欄位 `case_reflections.what_to_study` → **直接餵 review queue(CG10)** | ⬜ CG9 |

| ID | 工作 |
|---|---|
| CG9 ✅ 已做 2026-07-29 | `case_reflections` 加 3 欄(`what_changed` / `what_surprised` / `what_to_study`),全部選填、預設收合。**照 LL1 原則:不得必填、不得用模型預填。** `what_to_study` 存的每一筆自動成為複習佇列的一個項目(CG10 ③)。schema 已加,SOAP UI 待 Phase 2 後接。 |

## 5. 複習系統:七個來源,不是單字卡

Ting 的判斷:未來真正需要複習的**不是**孤立的中藥和穴位。
這比傳統 flashcard 更接近真實臨床學習 — 也正是 LL5 已寫下的
「卡片來自 Ting 自己的病例」原則的具體來源清單。

| ID | 工作 | 佇列的七個來源(即排序類別) |
|---|---|---|
| CG10 | Review queue 規格 | ① 最近常搞混的內容(來自 LL3 comparison + 答錯記錄)② 病例裡用過但效果不清楚的治法(`outcome_verdict` 空白或 `no_change`)③ 長期沒複習的概念(SM-2 到期,LL5)④ 多次出現在病例中的模式(反向索引 CG4 的高頻項)⑤ 判斷錯誤或效果不佳的病例(LL2 誤案,**框架成「值得學習的病例」不是失敗牆**)⑥ 學校考試高頻內容(board exam outline)⑦ **臨床安全紅旗**(禁忌、交互作用、刺深) |

排序規則:**⑦ 安全永遠置頂**(與 BLUEPRINT 的臨床北極星一致:
中西藥交互安全第一),其餘依到期日與出現頻率。
Gate:照 LL5 — 排程資料屬個人衍生資料,只進 clinical 層,**永不進 git**。

## 6. 搜尋:比首頁設計重要十倍

Ting 的原話。這會是整個系統使用頻率最高的功能。

現況:首頁統一搜尋只涵蓋**知識層**(穴位/方劑/中藥/病症)。
目標:同一個搜尋框輸入 `fibroid` / `血瘀` / `SP6` / `月經量多` /
`Gui Zhi Fu Ling Wan`,同時列出:知識條目 · 病例 · 看診紀錄 · 學習筆記 ·
方劑 · 穴位 · 症狀 · 追蹤結果。

| ID | 工作 | 規格 |
|---|---|---|
| CG11 | 搜尋涵蓋 clinical 層 | 結果**依 type 分組**顯示(不要混成一條 list);病例結果顯示 patient_code + 病程 + 日期。中英雙語 + 拼音都要命中(現有知識層搜尋已具備,clinical 層要比照)。 |
| CG12 | Facets | `Type` · `Date` · `Patient` · `Pattern` · `Treatment` · `Outcome` · `Tags`。 |
| CG13 | **護欄** | 病例搜尋索引**只在本機 / clinical 層**,永不進 git、永不進未來公開匯出。與 CG5 同一條線:knowledge 索引可以是建置產物,clinical 索引只能是 runtime。 |

## 7. 階段優先序 — 對映本 repo 既有 phase

Ting 版四階段,對映既有路線圖(**不是新的一套 phase 編號**):

| Ting 的階段 | 內容 | 對映 |
|---|---|---|
| 第一階段:知識底座 | 統一資料結構、固定 ID、搜尋、標籤與關聯、卡片一致性、匯入匯出、資料驗證 | = BLUEPRINT Phase 1–3 + NORTH_STAR H1(**進行中,大部分已建立**:D1/D2 ID 不變、validators、card spec) |
| 第二階段:病例 MVP | Patient / Case / Visit / Assessment / Treatment / Outcome / Follow-up date / 知識條目連結 | = BLUEPRINT Phase 4 病例強化 + 本文件 CG1–CG3 |
| 第三階段:臨床知識圖譜 | 雙向連結、病例時間線、治療統計、常用組合、症狀變化、個人臨床心得 | = NORTH_STAR H2-3 + 本文件 **CG4–CG9** |
| 第四階段:智慧複習 | 間隔複習、弱項偵測、病例回顧、未解決問題、療效比較、自動生成學習題 | = LEARNING_LOOP LL5/LL6 + 本文件 CG10 |

## 8. 新的系統評估標準(Ting 2026-07-29)

| 項目 | 權重 |
|---|---|
| 資料結構與一致性 | 20% |
| 搜尋與篩選 | 18% |
| 病例與知識連結 | 18% |
| 病例追蹤能力 | 15% |
| 使用效率 | 10% |
| 手機版 | 8% |
| 資料安全與備份 | 7% |
| 視覺設計 | 4% |
| SEO | 幾乎不重要 |

這張表的實際含義,寫清楚免得被誤讀:

- **前三項 = 56%**:資料結構 + 搜尋 + 病例知識連結。任何工作要排優先序,
  先問它落在這三項的哪一項;都沒有就往後排。
- **視覺設計 4% 不等於「可以醜」** — 它的意思是**外觀已經定案,不要再重做**
  (BLUEPRINT:架構調整過三次,這一版定案)。改外觀只在「妨礙查詢效率」時做。
- **SEO ≈ 0 與既有定位一致**,不是改變:本系統永遠私人
  (BLUEPRINT §1),公開內容是未來 AcuTing Learn 的**另一個匯出**
  (NORTH_STAR H3)。repo 內目前沒有任何 SEO 工作,維持如此。
- **資料安全與備份 7%** 雖然權重不高,但它是**唯一一項出事就無法補救**的 —
  對應 DECISIONS 的「臨床上線前一學期完成 localStorage → SQLite + 每日備份輪替」。
  權重低不代表可以延後過門檻。

## 9. 驗收標準(這一層做完的定義)

- [ ] 打開一個病人 → 看到他所有病程 → 展開任一病程 → 看到 visit timeline(CG1)
- [ ] 打開 SP6 → 看到「我的臨床用法」panel,含樣本數;沒用過的穴位不顯示空殼(CG4)
- [ ] `grep -rE "used_in_cases|case_count" data/acupoints data/herbs data/formulas data/conditions` 回傳空 — 聚合值沒有被塞進 canonical 知識記錄(CG5)。快照若存在,只在 `data/audits/clinical_usage_snapshot.json` 且帶日期
- [ ] 任一追蹤指標都能顯示 Baseline / Today / Change / Trend 四欄(CG8)
- [ ] `effect_duration_days` 可記錄並在病程層看到趨勢(CG6)
- [ ] 病程結束能回答六問,`what_to_study` 自動進複習佇列(CG9/CG10)
- [ ] 複習佇列七類都有來源,安全類置頂(CG10)
- [ ] 一個搜尋框同時搜到知識 + 病例 + 看診紀錄,可用 7 個 facet 篩選(CG11/CG12)
- [ ] `git status --porcelain | grep -Ei 'case|patient|soap|\.db'` 提交後為空(沿用 LL 驗收)
- [ ] 沒有任何欄位變成必填;routine SOAP 輸入時間沒有變長

## 10. DON'T(這一層最容易做錯的事)

1. **不要新增 `episodes` 表或改 `cases` 的名字** — Episode 已經存在(§1)。
2. **不要把聚合值寫成 canonical 知識記錄的欄位** — 快照要進 git 可以,但放
   `data/audits/clinical_usage_snapshot.json` 並帶日期(CG5 / D9)。
3. **不要把舌象/脈象做成 outcome metric,也不要新開 `fatigue`** — 已有家(CG7)。
4. **不要先做圖表** — 第一階段只確保資料格式一致(CG8)。
5. **不要把複習系統做成「另一個穴位單字卡 app」** — 卡片來自 Ting 自己的病例(LL5)。
6. **不要為了這一層重做外觀** — 視覺 4%(§8)。
7. **不要在 H2 遷移之前硬做 CG4/CG10** — 字串連結上算不準,照 LL6 的 gate:
   先有 foreign keys / SQLite 再做統計。
8. 一次一項,先印出要改的檔案清單等 Ting 同意(沿用各 track 的工作協定)。
