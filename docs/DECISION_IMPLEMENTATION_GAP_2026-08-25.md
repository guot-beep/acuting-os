# D1–D21 實作落差盤點 — 2026-08-25

**這份不是新架構提案。** `DECISIONS.md` 記錄的是**裁定了什麼**；這份量的是
**實際落地多少**。兩者的差距就是該處理的東西。

```bash
node scripts/audit-decision-implementation.js
```

腳本唯讀，不改任何資料，開頭會自己印出 `MEASURED TREE: <branch> @ <sha>`。

## 量測基準（先讀這段）

| 欄位 | 意義 |
|---|---|
| **main** | `origin/main` @ `78765ca6` — 本文的**主要基準** |
| **codex** | `codex/pattern-v2` @ `595c42d2` — 對照，落後 main 208 個 commit |

**這兩棵樹的知識層差很多**，同一支腳本在上面跑出來的數字可以差到兩倍
（`related_patterns` 在 main 是 78%，在 codex 是 30%）。所以：

> 任何要根據這份做的決定，先確認你在哪個 branch。
> 本文若只給一個數字，代表兩棵樹一致。

---

## 0. 為什麼是這份，不是又一份架構審查

`ARCHITECTURE_AUDIT.md`（317 行）與
`CLINICAL_LAYERS_RECONCILIATION_2026-08-10.md`（A. ALREADY / B. PARTIALLY /
C. MISSING / D. CONFLICTS / E. minimal changes）已經是兩份架構落差審查。
第三份不會讓判斷更清楚。

外部建議（SOL 2026-08-24）提的四件事——Protocol 升格 entity、Knowledge 與
Patient Event 分離、Evidence 分級、Case→Canonical 工作流——其中三件已經是
LOCKED 決策：**D7**（JSON knowledge in git / SQLite clinical gitignored）、
**D13**（每條邊存一側、另一側推導）、`ACUTING_OS_3_YEAR_ARCHITECTURE` 的
L1–L6 分層（L3 就叫 Evidence Layer）。缺的不是架構，是落地。

---

## 1. 總表（數字為 main；括號內為 codex，只在不同時列出）

`實作` 讀法：✅ 落地且有 CI 守著 · ⚠️ 落地但無 CI 或部分落地 ·
❌ 裁定了但幾乎沒實作 · ❓ 需要 Ting 裁定，不是修 bug。

| 決策 | 量到什麼 | 實作 |
|---|---|---|
| D1 IDs 不可變 | 1621 筆正典記錄帶 id（codex 1601），**id 含中文 0** | ✅ |
| D2 穴位命名空間 | 971 筆穴位 100% 帶 id；925 distinct；**同檔內重複 0** | ✅ |
| D3 同名 `__` 消歧 | formula 223 / herb 363，**name_zh 碰撞 0** | ⚠️ `validate-naming.js` 不在 CI |
| D4 去識別 | 三支 PHI validator 全在 CI；schema **無** birth_day 欄 | ✅ |
| D5 多對多 | schema.sql 29 表 / 24 junction；visit_outcomes 有；FK ON | ⚠️ 只在 schema，runtime 仍是 localStorage |
| D6 不硬刪 | manifest 925 ids，**消失 0**；deprecated: pattern 3 / herb 4 / formula 4 | ✅ |
| D7 儲存分離 | `*.db` 已 gitignore；**derived-tables 橋接未建** | ⚠️ |
| D8 `domain` 標籤 | **0/1621 (0%)**；詞彙表檔不存在 | ❌ 見 §5 |
| D10 單一 pattern 命名空間 | 1380 條 related_patterns **1380/1380 (100%) 解析成功**（codex 675/675） | ✅ |
| D11 四套命名空間 | cond 505 / tdis 159 / pattern 151 / sym 122 | ⚠️ **有第五、六套，見 §2.1** |
| D12 9/01 起 additive-only | **剩 7 天**；v1 匯出是裸陣列，版本只在檔名 | 🔴 見 §2.2 |
| D13 邊只存一側 | 14 條邊登記；**被退役的反向欄位被回填 0** | ✅ 規則守住；覆蓋率見 §3 |
| D14 每套四件套 | 6 套齊全 / 4 套只有詞彙表（0 卡，誠實） | ⚠️ |
| D15 `drug.*` | drug 59；alias 12；**`med.*` 仍 86 次出現在 relation 欄位** | ⚠️ 見 §2.1 |
| D16 三張 pattern 退役 | 3/3 deprecated + note | ✅ |
| D17 V2 命名空間 | supp 36 有卡；life/exposure/adverse_event/modality 只有詞彙表 | ⚠️ 誠實的空 |
| D17 §3 sym↔metric | 32/122 sym 帶 supporting_measurements，48 refs **全部解析成功** | ✅ |
| D18 SQLite 條件觸發 | mapping **87 欄：mapped 85 / 待 Ting 0 / 無去處 2**（codex 81/75/4/2） | ✅ |
| D19 Pattern V1 凍結 | registry 69→151，library 62→154；**未註冊卡 0** | ❓ 見 §2.4 |
| D20 判讀兩個軸 | 27 筆；sourced 10 / no_published_threshold 17；**缺 source 0、缺 scope 0** | ✅ |
| D21 四組中藥退役 | 4/4 deprecated + note；**但 2 處引用沒改到，見 §2.3** | 🔴 |

---

## 2. 需要拍板的四件事

### 2.1 `western_condition.*` / `eastern_disease.*` 是 D11 之外的命名空間 —— 兩棵樹都一樣

**main 與 codex 量到完全相同的結果。**

| | 數字 |
|---|---|
| relation 欄位裡的**未獲授權**命名空間 | 3 套 |
| `med.*` | 86 次（`pathology/conditions.json`、`condition_graph_expansion.json`） |
| `eastern_disease.*` | 53 次（`herbs/formulas.json`、`formula_canon_shortlist.json`、`conditions.json`） |
| `western_condition.*` | 12 次（`herbs/formulas.json`、`formula_canon_shortlist.json`） |
| `data/pathology/conditions.json` 記錄數 | 12（id 全是 `western_condition.*`） |
| 在 `cond.*` 有同 slug 雙胞胎 | **2**（pcos、diminished_ovarian_reserve） |
| **只存在於 `western_condition.*`** | **10** |
| crosswalk 對映 | **0** |
| alias map | **不存在** |
| 被 `scripts/build-data.js` 載入 | **是**（第 90 行） |

`js/knowledge.js:269` 把兩套渲染成同一個標籤：

```js
: p === "western_condition" || p === "cond" ? "西醫病名" : "";
```

**畫面上看不出有兩套。** 這正是 D11 禁止的：「Import layers 不是命名空間…
永遠不可以出現在 relation 欄位」。

**建議：只做分類，不自動遷移。** 產出一份 inventory：

```
western_condition.*  (12)
├── exact cond equivalent        (2 已知)
├── probable cond equivalent
├── no canonical equivalent      (至少 10 之中的多數)
└── ambiguous
```

理由：10 筆沒有雙胞胎，粗暴 replace 會**創造 10 個沒人審核過的 `cond.*`**。
D10 的先例是分類→裁定→再遷移，不是直接 sed。

### 2.2 🔴 匯出檔沒有版本欄位，而 additive-only 剩 7 天生效

[`app.js:10552`](../app.js) 的 v1 路徑：

```js
payload = clinicalCases;   // 裸陣列
```

版本只活在**檔名**（`acuting-clinical-cases-*` vs `-v2-*`）——使用者改個檔名，
未來的還原程式就沒有依據判斷這是哪一版。

D12 從 **9/01** 起 additive-only。加外層信封（`{version, exportedAt, cases}`）
本身就是破壞性變更 = **典型 one-way door，只剩 7 天窗口**。

### 2.3 🔴 D21 的自我驗證不完整 —— 但要修的檔案跟 branch 有關

`DECISIONS.md` D21 記載「四個退役 id 除自己記錄的 id 欄位外，`data/**`
**零殘留**」。實際：

| 檔案 | main | codex |
|---|---|---|
| `data/herbs/formulas.json` composition | **0**（乾淨） | **2**（`shi_hui_san`、`gu_chong_tang` → `herb.qian_cao_gen`） |
| `data/herbs/herb_pairs.json` | **2 筆殘留** ↓ | 0 |
| `data/audits/*` 快照 | 4（歷史紀錄，正常） | 2（同上） |

main 上實際殘留的兩筆：

| pair id | 仍指向 | 應指向 |
|---|---|---|
| `pair.han_lian_cao__nu_zhen_zi` | `herb.han_lian_cao` | `herb.mo_han_lian` |
| `pair.mai_men_dong__sha_shen` | `herb.sha_shen` | `herb.bei_sha_shen` |

而 D21 的重導表格**明確列出這兩筆已改**
（`data/herbs/herb_pairs.json`（`pairs[].herbs[]`）| 2 |
`pair.han_lian_cao__nu_zhen_zi`、`pair.mai_men_dong__sha_shen`）。

它活下來是因為 `validate-herb-standard.js` 驗的是藥材記錄本身，
**沒有任何一支 validator 檢查退役 id 有沒有殘留在別人的引用裡。**

**所以修法不是換掉那兩個 reference，是補一支 validator：**

> deprecated / retired 的 canonical id，不得出現在任何 active canonical
> 記錄的 relation / composition / pairs 欄位裡（`data/audits/**` 快照除外）。

否則今天是 `han_lian_cao`，下個月會再出現一個。

### 2.4 ❓ 10 個 taxonomy 節點長出了臨床卡片

| | V1 凍結 | 現在（兩棵樹相同） |
|---|---|---|
| registry 總數 | 69 | **151** |
| — level=pattern | 59 | **141** |
| — level=category | 10 | 10 |
| library active | 59 | **151** |
| **未註冊的 active 卡** | 0 | **0** ✅ |
| **註冊為 category 卻有臨床卡** | 0 | **10** |

那 10 個是：氣虛、血虛、陰虛、陽虛、熱、火、濕熱、痰、外風、腎虛。

**沒有 D10 缺陷**（每張卡都有註冊）。但 category vs clinical entity 的界線
不定乾淨，之後任何 `Disease → Pattern → TreatmentPlan` 的查詢都會把模糊放大。
**這是 ontology 裁定，不是 bug。**

---

## 3. D13 各條邊的填充率（main；括號為 codex）

未填 = 誠實的缺口；手工回填反向欄位 = 違規。**違規數：0。**

| 邊（存放側） | main | codex |
|---|---|---|
| `typical_points` (pattern) | **148/154 (96%)** | 125/154 (81%) |
| `typical_formulas` (pattern) | **139/154 (90%)** | 117/154 (76%) |
| `compares` (cmp) | 43/43 (100%) | 同 |
| `related_patterns` (cond) | **393/505 (78%)** | 153/505 (30%) |
| `related_eastern_diseases` (cond) | **358/505 (71%)** | 150/505 (30%) |
| `herb_formulas` (cond) | 146/505 (29%) | 同 |
| `acupoint_protocols` (cond) | 122/505 (24%) | 84/505 (17%) |
| `sign_symptom_ids` (cond) | 118/505 (23%) | 同 |
| `key_manifestation_ids` (tdis) | 3/159 (2%) | 同 |
| `differential_patterns[].pattern_id` | 0/154 (0%) | 同 |
| `key_signs_ids` (pattern) | 0/154 (0%) | 同 |
| `differentiation_zh[].points_to` (sym) | 0/122 (0%) | 同 |
| `medication_links` (cond) | 0/505 (0%) | 同 |

**Pattern 層是全庫填得最好的一層（96% / 90%）。** 這一點對之後任何
treatment-plan 或 graph 工作都是好消息——見附錄 A。

---

## 4. 執行面：CI 覆蓋（這裡的分支差異最危險）

> **更正（2026-08-26）**：本節初版把「經由 `check-validation-ratchet.js` 間接
> 進 CI」的 validator 全算成未接線——ratchet 本身在 CI 裡，註冊進它的
> RATCHETED 表就等於接線。conditions／patterns／tdis／symptoms／naming／
> encoding／formula_correctness／formula_dose_staging 八層其實**都有 gate**，
> 且前五層基線為 0。量測腳本已修（`ciLabel` 會標 `yes (via ratchet)`），
> main 上重跑的正確數字是 **58/74 (78%) 已接、16 支未接**，未接的集中在
> herb／formula quality 線。下方初版文字保留作歷史，數字以重跑為準。

| | main | codex |
|---|---|---|
| validator / test 腳本 | 72 | 70 |
| 進 `.github/workflows` | **50/72 (69%)** | 48/70 (69%) |
| `validate-condition-standard.js` | **在 CI，PASS 0 blocking** | **不在 CI，FAIL 52 blocking** |

**這是本次最該注意的一條。** main 的 condition 線有閘、而且是綠的；
`codex/pattern-v2` 上同一支 validator **不在 CI，跑起來 52 個 blocking 缺陷**。
也就是說那條整合分支目前累積的缺陷，**在它自己的 CI 上看不見**，
但合進 main 時會落到一個原本是綠的地方。

main 上仍未接 CI 的 22 支，集中在內容線：

```
validate-pattern-standard.js      validate-pattern-registry.js
validate-tdis-standard.js         validate-herb-canon.js
validate-herb-card-schema.js      validate-herb-quality-strict.js
validate-formula-correctness.js   validate-formula-quality-strict.js
validate-formula-song.js          validate-encoding.js
validate-no-boilerplate.js        validate-naming.js
validate-content-quality.js       validate-supp-standard.js
validate-herbal-links.js          validate-condition-sources.js
validate-point-categories.js      validate-cloudtcm-vocabularies.js
validate-formula-dose-staging.js  test-practice-audit.js
test-herb-cloudtcm-fetch.js       test-knowledge-gap-logging.js
```

§2.1 與 §2.3 兩個發現都在無閘的那一側，不是巧合。

---

## 5. D8：建議把「原則」和「排程」拆成兩個狀態

`domain` 標籤 LOCKED 一個月、**0/1621 (0%) 使用**、詞彙表檔不存在。

不建議因為 DECISIONS 寫著 LOCKED 就去補 1,621 個 tag。先問：**現在有誰要用它？**
沒有搜尋、沒有 dashboard、沒有病例流程、沒有 export 需要它。

**建議把 D8 標成「原則 LOCKED，實作未排程」**——保留「絕不做 per-specialty
容器」這個一次性門，但不因文件寫了就養一個還沒有價值的功能。
D14 的四件套要求也支持這個：詞彙表都還不存在，本來就不該開始填。

---

## 6. 這份沒有量到的

- **病例數**（D18 的 ≥50 觸發條件）：在瀏覽器 localStorage 裡，repo 量不到。
- **自由文字的去識別紀律**（D4）：設計上不可能用程式驗。
- **內容正確性**：本腳本量結構與引用，不量臨床內容對不對。

順帶一個眼睛看到、不是量出來的：codex 分支上 `formula.gu_chong_tang`
那筆茜草根的 `in_formula_zh` 寫「補氣，調和諸藥」——那是甘草的功效。
**歸屬錯誤優先於語言錯誤**，這類只有開卡片讀才抓得到。

---

## 附錄 A — TreatmentPlan V0 的可行性數字（Wednesday 研究題的輸入，不是提案）

針對 SOL 提的 5 個 V0 候選病，量 `cond → related_patterns → pattern card`
這條鏈實際撐不撐得住（main）：

| condition | 連到的 pattern | 有穴+治則+來源 | 再加配穴理由 | `acupoint_protocols` |
|---|---|---|---|---|
| `cond.migraine` | 6 | 6 | **0** | 27（`unassessed`） |
| `cond.chronic_low_back_pain` | 4 | 4 | **0** | 0 |
| `cond.primary_dysmenorrhea` | 9 | 9 | **0** | 30（`unassessed`） |
| `cond.insomnia` | 5 | 5 | **0** | 6（`unassessed`） |
| `cond.neck_pain_stiff` | 2 | 2 | **0** | 1 |
| **合計** | **26 組病×證** | **26** | **0** | — |

三件事因此變得清楚：

1. **種子不是「5 個 plan」，是這 26 組病×證。** 每一組都已經有穴位、治則、
   來源；缺的是配穴理由（0/26）、主配穴之分、手法、頻次、療程、modality、療效。
2. **`pattern.typical_points` 是證型層、與病無關。** 肝火上炎在偏頭痛和失眠
   拿到的是同一組 9 穴。**病×證的差異化正是現在不存在的東西**，也正是
   TreatmentPlan 這個實體唯一的臨床價值——它不是重組現有資料，是新內容。
3. **那三個 `unassessed` 的 protocol 不能當種子。** 卡片自己寫著
   「沒有人逐穴查證過…這組清單與另外 6 張卡逐字相同」。

另外三個現成條件（給 Wednesday 參考，不展開）：

- `data/config/modality_vocabulary.json` **已有 11 項**（針刺／電針／艾灸／
  拔罐／刮痧／推拿／耳針／放血／中藥／TDP／穴位按壓）—— modality 欄位的
  D14 第一件套已經備好。
- `schema.sql` **已有 `visit_acupuncture_protocols` 表**，但欄位是
  `protocol_name` / `point_codes` / `modifications` 全 TEXT，**沒有指向知識層的
  `plan_id` FK**。日後接法是加一個 additive 欄位，不是新建表。
- **全庫沒有任何正典實體使用兩點式 id**（`cloudtcm.disease_category.301`
  是 import handle、`case.demo_001.*` 是 fixture）。所以 `txplan.migraine.xxx`
  這種形狀會讓新實體和 import handle 同形，違反 D11「namespace 就是 type」。
