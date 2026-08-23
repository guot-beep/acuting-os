# FIELD_SHAPE_CONSISTENCY_BASELINE — 欄位型別分裂的今日普查

狀態：**baseline ledger（唯讀）。本輪沒有動 `data/**` 一個位元組。**
Branch：`codex/field-shape-consistency`（自 `origin/codex/pattern-v2` tip `c078f4e`）
日期：2026-08-12
實作：`scripts/validate-field-shape-consistency.js`（本輪唯一新增的腳本）
CI：`.github/workflows/validate.yml` green job，**NOTE tier**（永遠 exit 0）

**一行重現**（下面每一個數字都由這幾行產出，沒有手抄）：

```bash
node scripts/validate-field-shape-consistency.js             # 摘要 + 危險層
node scripts/validate-field-shape-consistency.js --worklist  # 全部清單
node scripts/validate-field-shape-consistency.js --json      # 機讀
node scripts/validate-field-shape-consistency.js --blocking=A  # 預覽畢業後行為（今天 exit 1）
```

---

## §0 為什麼有這一份

同一天連踩三次同一種缺陷，而且**三次都是碰巧發現的，不是任何檢查抓到的**：

| # | 欄位 | 兩種型別 | 後果 | 修在 |
|---|---|---|---|---|
| 1 | `cautionsEn` | 字串 / 陣列 | `needlingArticle()` 先看 `.length`（**字串也為真**）再 `.join()` → TypeError → **英文模式禁忌在 206 個穴位安靜地消失** | `c078f4e` |
| 2 | previsit payload `metrics` | 陣列 / 物件 | app 端驗證器降級成 `[]` 就**放行**，CLI 端對同一份 payload 卻**拒絕** | `aaf8b81` |
| 3 | `import_artifacts` | 兩組互斥鍵 | 兩條線同一天各自發明 `{original_field,moved_at}` 與 `{field,archived_at,belongs_to}` | 未修 |

共同形狀：**一個欄位有時是字串、有時是陣列，就是缺陷工廠。**
每個消費端都得猜，而猜錯時失敗通常是**安靜的**（少一段、空一塊），不是大聲的。
`.length` 是那個陷阱——它是唯一在兩種型別上都合法、因此永遠不會在看得見的地方爆掉的存取。

本腳本量測整個類別。**它不修任何東西**：正規化等於寫入本腳本不擁有的線（憲法 §一），
必須是另外一批、另外核准。

---

## §1 掃描範圍與規模

| 指標 | 數字 |
|---|---|
| `data/**.json` 檔案（排除 `data/generated/**`） | 621 |
| 成功解析 | **621 / 621**（`data/tung/` 兩檔帶 UTF-8 BOM，先剝 BOM 再 parse） |
| 解析失敗（盲區） | **0** |
| 偵測到的集合 | **361**（其中 **101** 個是巢狀，如 `…#records.composition[]`） |
| 記錄總數 | **40,293** |
| 欄位槽位（集合 × 欄名） | **4,299** |
| 消費端檔案（`app.js` + `js/*.js`） | 8 |

集合是**結構偵測**的，不是檔名白名單：root 陣列 / 頂層鍵下的物件陣列 / id→record 物件表，
再往下遞迴三層把 `composition[]`、`import_artifacts[]` 這種也變成獨立集合。
派工單裡猜的 `data/patterns/*` 這個目錄**不存在**（證型資料在 `data/pathology/pattern_*.json`）——
這正是為什麼走訪必須用走的，不能用寫死的清單。

**未掃描的（誠實聲明）**：`data/generated/**`（build 產物，計進去會重複計算）、
`curriculum/**`（Ting 的，AI 只讀）、以及任何**傳輸中的 payload**（見 §4 事故 #2）。

---

## §2 四個層級的計數

| 層級 | 定義 | 數量 |
|---|---|---|
| **SHAPE** | 同一集合內，同一欄位有 ≥2 種型別（string/array/object/number/boolean） | **28** |
| ├ Tier A | 有 shape 專屬消費端（`.join .map .filter .length .trim .split`） | **10** |
| ├ Tier B | 安全欄名，但 grep 找不到消費端 | **3** |
| └ Tier C | 兩者皆無（記帳用） | **15** |
| **CROSS** | 同一欄名在不同集合的主導型別不同 | **81** |
| ├ Tier A | 有 shape 專屬消費端 | **24** ← 事故 #1 的真實規模在這一層 |
| ├ Tier B | 安全欄名、無消費端 | **0** |
| └ Tier C | 兩者皆無 | **57** |
| **ITEM** | 陣列元素本身分裂（primitive 混型 / 互斥鍵對） | **13** |
| **NULLMIX** | 單一型別但混 `null` | **46** |

合計 **122** 筆型別分裂發現，其中 **34** 筆有活的 shape 專屬消費端。

`null` 被單獨切出來、而且**永遠不排進危險層**：`null.join()` 與 `null.length` 都會
**大聲**立刻爆——那是會被注意到、會被修的失敗模式。字串／陣列分裂之所以更糟，
正因為它安靜。

### 為什麼 CROSS 這一層是後來加的

第一版只做 per-collection 普查，結果 `cautionsEn` 只在 `extra_points.json` 裡分裂
（28 字串 / 44 陣列），**其他地方一片乾淨**——而事故 #1 的真實數字是 947 個穴位裡 206 個。
原因是 runtime 的 point 物件是從 `data/acupoints/361.json`、`extra_points.json`、
`data/scalp/*`、`data/auricular/*` **合併**出來的，每個檔案各自完全自洽，
消費端拿到的聯集卻不是。**只做 per-collection 普查會低報那個催生這支腳本的事故。**
所以 per-collection 的數字不是頭條數字。

CROSS 的已知代價（明寫，不藏）：它以**欄名**為鍵，兩個不相干領域同名的欄位
（草藥的 `functions` 與頭皮針的 `functions`）不必然在 runtime 合併。
但消費端 grep 也是以欄名為鍵，所以「同名 + 有 shape 專屬呼叫」仍然是值得印出來的風險。

---

## §3 消費端偵測是 grep，grep 有盲區

逐行掃 `app.js` 與 `js/*.js`：先把欄名當**整詞**找到，再在**同一行**內找
`.join / .map / .filter / .length / .trim / .split`。因此**結構上看不到**：

* **別名**——`const c = p.cautionsEn;` 一行，`c.join()` 下一行。
  （試過往下看 3 行，誤報比撈回來的真陽性還多，所以退回同行。）
* **解構**——`const { cautionsEn } = point;`
* **動態取值**——`point[fieldName]`，`app.js` 好幾個 render helper 就是這樣寫的，
  整族消費端在這裡是隱形的。
* `index.html` 內嵌 script，以及 `app.js` / `js/*.js` 以外的任何消費端。

**「0 消費端」只代表「這個 grep 沒找到」，不代表「沒有人讀」。**
報告會同時印出「欄名被提及幾次」，好讓「從沒被提到」與「被提到但沒有同行 shape 呼叫」分得開。

呼叫點若同行或上一行有 `Array.isArray(` 會標 `[guarded]`（`c078f4e` 的修法形狀）。
**guarded 仍然計為消費端**：底層資料還是分裂的，下一個照著寫的人不會自動抄那個 guard。

---

## §4 三起已知事故的回測（walker 自檢）

腳本每次執行都印這一段，不藏在旗標後面。

| # | 結果 | 掃到的內容 |
|---|---|---|
| 1 `cautionsEn` | **✔ 找到** | CROSS：4 個集合，合計 `string:290 array:44`。`extra_points.json` 主導 array（內部又是 `string:28 array:44`），`361.json` `string:84`、`auricular_points.json` `string:174`、`scalp_points_full.json` `string:4`。消費端 `app.js:4988 .filter [guarded]`、`app.js:4989 .trim` |
| 2 previsit `metrics` | **○ 範圍外** | 事故發生在**傳輸中的 payload**（app 端驗證器 vs CLI 端驗證器對同一個物件不同意），不是任何 `data/**.json` 記錄。本腳本掃**靜態資料**，結構上看不到。該類由 `scripts/validate-previsit-payload.js --self-test` 守。**這是本腳本涵蓋範圍的真實邊界，寫在這裡是為了不讓人把「三起事故三個勾」讀進一份結構上看不到其中一起的掃描。**（附帶：`data/research_staging/clinical_v2_fictional_test_scenarios_v0.json` 的 `visits[]` 裡 `metrics` 出現在 17/20 個元素，被 ITEM 層以互斥鍵對抓到） |
| 3 `import_artifacts` | **✔ 找到** | ITEM／keysplit：`data/pathology/condition_canon_shortlist.json#records`，126 個陣列 / 268 個元素。互斥鍵對 `archived_at(160) ⊥ moved_at(108)`、`belongs_to(160) ⊥ moved_at(108)`、`field(160) ⊥ original_field(108)`。鍵組 `144×{archived_at,belongs_to,field,reason,text}`、`105×{moved_at,original_field,reason,text}`、`16×{…,source_url}`、`3×{…,original_record}` |

**#1 的 290/44 與事故當時的 206/321 不相等**，這是預期的、也必須說清楚：
事故的數字量的是 **runtime 合併後**的 point 物件，而 `app.js:438` 有
`cautionsEn: record.contraindications_en || []` 這種**衍生**（把別的欄位映射成 `cautionsEn`），
會在 runtime 再生出陣列形。本份量的是**磁碟上的資料**。兩個數字量的不是同一個母體，
不能互相取代——這也是為什麼腳本 §CI 那段說它是普查，不是 runtime 契約檢查。

**keysplit 的判準換過一次，值得記下來**：第一版用「沒有任何鍵出現在全部元素上」，
結果**漏掉事故 #3**——兩個家族其實共享 `reason` 與 `text`。
改成「存在**互斥鍵對**（兩個鍵從不同時出現、各佔非瑣碎比例、聯集涵蓋 ≥60% 元素）」才抓到。
**共享核心不是健康的證據。**

---

## §5 危險層清單（依 安全欄名 → 消費端數 → 少數側筆數 排序）

### §5.1 SHAPE Tier A（10）

| 欄位 | 集合 | 型別分佈 | 少數側 | 消費端呼叫點 |
|---|---|---|---|---|
| `cautionsEn` ⚠ | `data/acupoints/extra_points.json` | string:28 array:44 | 28 | `app.js:4988 .filter [guarded]`、`app.js:4989 .trim [guarded]` |
| `contraindications_en` ⚠ | `data/pharmacology/drugs.json#records` | string:1 array:58 | 1 | `js/knowledge.js:1525 .length` |
| `contraindications_zh` ⚠ | `data/pharmacology/drugs.json#records` | string:1 array:58 | 1 | `js/knowledge.js:1524 .length` |
| `functions` | `data/scalp/scalp_points_full.json` | string:4 array:18 | 4 | `app.js:325/412/478 .join`、`app.js:2245 .length`、`app.js:4181 .split [guarded]`、`app.js:4674/4678 .split`、`app.js:9350 .trim` |
| `location` | `data/scalp/scalp_points_full.json` | string:4 object:18 | 4 | `app.js:1809 .join`、`app.js:2245 .length`、`app.js:2938 .join`、`app.js:4765 .trim`、`app.js:9347 .trim` |
| `needling` | `data/scalp/scalp_points_full.json` | string:4 object:18 | 4 | `app.js:4699 .split [guarded]`、`app.js:6990/6992 .filter`、`app.js:6991 .length` |
| `indications_en` | `data/herbs/herb_canon_shortlist.json#records` | string:3 array:121 | 3 | `app.js:479 .join`、`app.js:9804 .map` |
| `modern_pharmacology_zh` | `data/herbs/herb_canon_shortlist.json#records` | string:12 array:67 | 12 | `js/knowledge.js:1420 .length` |
| `pointIdentityZh` | `data/acupoints/extra_points.json` | string:6 array:44 | 6 | `app.js:3932 .length` |
| `pointIdentityEn` | `data/acupoints/extra_points.json` | string:6 array:44 | 6 | `app.js:3931 .length` |

**這裡本份草稿犯過一次錯，留著當教訓**：第一版寫「`app.js:4699` 的
`point.needling.split()` 沒有 guard，對 18 筆物件形會直接 TypeError」。
不對——`app.js:4698` 用的是 `typeof point.needling === "string"`，
是 guard，只是不是 `Array.isArray` 那一種。腳本當時只認 `Array.isArray`，
於是把它標成未保護。**腳本與這一列都已修正**（`RE_GUARD` 現在兩種寫法都認）。
教訓：報告說「某個呼叫點會炸」之前，要把那幾行打開讀，不能只信自己的 regex。

實際數字：Tier A ＋ CROSS Tier A 合計 **165 個呼叫點，其中只有 10 個被標 `[guarded]`**。
但這**不等於**另外 155 個會炸——`cleanList()` / `asList()` 這類正規化 helper
本身就吸收型別（`js/knowledge.js` 大量使用），而 grep 看不出來。
**「未標 guarded」是「值得去看一眼」，不是「已證實會爆」。**

### §5.2 CROSS Tier A（24；此處列全部，安全欄名在前）

| 欄位 | 集合數 | 合計 | 少數側 | 少數側集合 | 消費端 |
|---|---|---|---|---|---|
| `red_flags_zh` ⚠ | 8 | array:496 string:1 | 1 | `pathology/clinical_graph_seed.json#western_conditions` | `js/knowledge.js:2306 .length`、`:2491 .length`、`:2495 .map` |
| `cautions_zh` ⚠ | 15 | array:1162 string:522 | 522 | `herbs/herb_pairs.json#pairs`、`imports/cloudtcm/staging_points.json#records` | `app.js:305 .split [guarded]`、`js/knowledge.js:1528 .length` |
| `cautionsEn` ⚠ | 4 | string:290 array:44 | 44 | `acupoints/extra_points.json` | `app.js:4988 .filter [guarded]`、`:4989 .trim` |
| `contraindications_en` ⚠ | 5 | array:684 string:362 | 362 | `acupoints/361.json` | `js/knowledge.js:1525 .length` |
| `cautions_en` ⚠ | 5 | array:631 string:179 | 179 | `herbs/herb_pairs.json#pairs`、`scalp/scalp_points_full.json` | `js/knowledge.js:1529 .length` |
| `red_flags_en` ⚠ | 10 | array:520 string:1 | 1 | `pathology/clinical_graph_seed.json#western_conditions` | `js/knowledge.js:2306 .length` |
| `id` | 125 | string:9273 number:664 | 664 | `tung/tungs_website_raw.json`、`tung/tungs_zone_index.json#*`（12 個分區） | 38 處 |
| `category` | 23 | string:2712 array:34 | 34 | `sources/source_registry.json#sources` | 17 處 |
| `notes` | 9 | string:541 array:60 | 60 | `imports/formula_content/summary_chart_parsed.json#formulas` | 16 處 |
| `functions` | 15 | string:880 array:219 | 219 | `herbs/herb_canon_shortlist.json#records`、`scalp/scalp_points_full.json` | 8 處 |
| `functionsEn` | 11 | string:362 array:130 | 130 | `embedded/meridian_bl/ht/ki/si/sp.json`（5 檔 array，另 3 檔 string） | 8 處 |
| `title` | 25 | string:1393 object:472 | 472 | `tung/tungs_website_raw.json` | 6 處 |
| `source` | 28 | string:6205 object:117 | 117 | `clinical_cases/outcome_metrics.json#records`、`supplements/…key_safety_notes[]` | 5 處 |
| `anatomy` | 5 | string:333 array:94 | 94 | `embedded/meridian_li/lu/st.json`、`auricular_points.json` | 5 處 |
| `location` | 16 | string:1347 object:18 | 18 | `scalp/scalp_points_full.json` | 5 處 |
| `needling` | 15 | string:1716 object:18 | 18 | `scalp/scalp_points_full.json` | 4 處 |
| `indications_zh` | 13 | array:1260 string:540 | 540 | `herbs/herb_pairs.json#pairs`、`imports/cloudtcm/staging_points.json#records` | 3 處 |
| `functions_zh` | 6 | array:841 string:361 | 361 | `imports/cloudtcm/staging_points.json#records` | 3 處 |
| `fields` | 3 | array:8 object:5 | 5 | `imports/formula_chinese_depth/c2_2_…probe.json#records` | 3 處 |
| `indications_en` | 18 | array:1068 string:543 | 543 | `channels_and_charts.json.points_curriculum[]`、`herb_pairs.json#pairs` 等 | 2 處 |
| `actions_en` | 5 | string:2159 array:405 | 405 | `herbs/formulas.json#records`、`herbs/herb_canon_shortlist.json#records` | 2 處 |
| `evidence` | 16 | string:795 array:226 | 226 | `pathology/red_flag_registry.json#records` | 2 處 |
| `indications` | 6 | string:1150 array:87 | 87 | `formulas.json#records`、`summary_chart_parsed.json#formulas`、`scalp_points_full.json` | 1 處 |
| `actions` | 2 | string:361 array:60 | 60 | `imports/formula_content/summary_chart_parsed.json#formulas` | 1 處 |

### §5.3 ITEM（13）

| 欄位 | 集合 | 種類 | 規模 | 分裂內容 |
|---|---|---|---|---|
| `red_flags_zh[]` ⚠ | `pathology/condition_canon_shortlist.json#records` | primitive | 234 陣列 / 901 元素 | **object:519 string:382**；物件形鍵組單一：`{finding,rationale,recommended_action,source,urgency_level}`。**137 筆記錄全物件、97 筆全字串、0 筆混用** |
| `red_flags_en[]` ⚠ | 同上 | primitive | 234 / 901 | object:519 string:382（與 zh 同步） |
| `drug_interactions_graded[]` ⚠ | `pharmacology/drugs.json#records` | keysplit | 29 / 64 | `effect_en(52) ⊥ interaction_en(12)`、`effect_zh(50) ⊥ interaction_en(12)` |
| `herb_drug_interactions_graded[]` ⚠ | 同上 | keysplit | 8 / 14 | `herb_card_status_zh(11) ⊥ note_zh(3)` |
| `acupoint_protocols[]` | `condition_canon_shortlist.json#records` | primitive | 131 / 1608 | object:1263 string:345 |
| `tcm_patterns[]` | 同上 | keysplit | 146 / 720 | `acupoints_zh(173) ⊥ symptoms_zh(547)` |
| `icd10[]` | `interop/condition_crosswalk.json#records` | keysplit | 150 / 796 | `billable/description/effective_from(679) ⊥ label_en/note_zh(117)` |
| `import_artifacts[]` | `condition_canon_shortlist.json#records` | keysplit | 126 / 268 | 事故 #3，見 §4 |
| `modern_pharmacology[]` | `herbs/herb_canon_shortlist.json#records` | primitive | 74 / 348 | object:243 string:105 |
| `source_citations[]` | 同上 | keysplit | 159 / 558 | `note(93) ⊥ scope(399)` |
| `visual_links[]` | 同上 | keysplit | 27 / 50 | `label(36) ⊥ label_en/label_zh(14)` |
| `formula_family[]` | `herbs/formulas.json#records` | keysplit | 9 / 15 | `change_en(9) ⊥ indication_zh/source(6)` |
| `visits[]` | `research_staging/clinical_v2_fictional_test_scenarios_v0.json#patients.cases[]` | keysplit | 5 / 20 | `environmentalChanges(2) ⊥ metrics(17)` |

### §5.4 SHAPE Tier B（3；安全欄名，grep 找不到消費端）

| 欄位 | 集合 | 型別分佈 | 欄名被提及 |
|---|---|---|---|
| `dosage` ⚠ | `herbs/herb_canon_shortlist.json#records` | string:187 object:111 | 0 次 |
| `has_caution` ⚠ | `imports/cloudtcm/acupoint_url_map.json#entries` | string:319 boolean:44 | 0 次 |
| `dosage_g` ⚠ | `herbs/herb_canon_shortlist.json#records` | string:7 object:158 | 1 次 |

`dosage` 那 187 筆字串**有 175 筆是 JSON 序列化後的字串**
（`"{\r\n \"一般建議\": \"3-9克\",\r\n \"食療用量範圍\": \"6-12克\", …}"`，
含 `\r\n` 字面量，是 Windows 換行被一起序列化進去的），只有 12 筆是真的自由文字。
另外 111 筆是真物件。也就是說：**這個欄位實際上是物件形，其中 175 筆被存成了字串**——
不是「兩種語意」，是同一種語意被序列化了兩次。一行重現：

```bash
node -e "const j=require('./data/herbs/herb_canon_shortlist.json');console.log(j.records.filter(r=>typeof r.dosage==='string'&&/^\s*[{[]/.test(r.dosage)).length)"
# 175
```

劑量是憲法第四條的紅線欄位，這一列**不能靠猜**，但它也是全表方向最明確的一列。

### §5.5 Tier C 與 NULLMIX

SHAPE Tier C 15 筆、CROSS Tier C 57 筆、NULLMIX 46 筆，全文以
`--worklist` 列出，不在這裡複製（複製 = 兩份會不同步）。
CROSS Tier C 的 57 筆裡有 **43** 筆是穴位代碼欄名（`BL10`、`SP6`、`ST36`…），
那是處方對照表 `#{map}` 集合的自然產物，屬於記帳，不是缺陷。
剩下 14 筆是 `source_id`(28 集合)、`authority`(8)、`decoction_reference_g`(11)、
`change_en`(13)、`modern_research_zh`(13)、`cloudtcm_id`(5) 之類。

---

## §6 建議的補救順序

**排序原則**：能單方向正規化、消費端唯一、且不需要臨床判斷的先做；
需要裁決的（多消費端／雙重語意／劑量安全）排後面並標明**要問誰**。
每一批都在自己的線裡做，**不跨線**。

| 順序 | 項目 | 線 | 安全正規化？ | 理由 |
|---|---|---|---|---|
| R1 | `data/scalp/scalp_points_full.json` 的 `functions` / `location` / `needling`（各 4 筆字串 vs 18 筆物件/陣列） | 穴位 | **安全**（方向明確） | 同一檔內 18:4，多數側就是 canonical 形，4 筆是漏改。三個欄位合計 17 個消費端呼叫點，只有 2 個標了 guard——一次改完就把 17 個都拆掉 |
| R2 | `data/pharmacology/drugs.json#records` 的 `contraindications_zh/_en`（各 1 筆字串 vs 58 筆陣列） | 藥理 | **安全**（單一消費端 `cleanList().length`） | 1/59 的離群值，就是那筆 mannitol 卡把整段標籤文字塞進字串。**拆成陣列時逐條保留原句，不得縮寫**（憲法紅線 3） |
| R3 | `data/acupoints/extra_points.json` 的 `cautionsEn`（28 字串 / 44 陣列）＋ `pointIdentityZh/En`（各 6 / 44） | 穴位 | **安全**，但要連同 CROSS 一起看 | 事故 #1 的原地。單檔正規化成陣列後，CROSS 那一層的 `361.json:84`、`auricular:174`、`scalp:4` 仍是字串——**R3 只關掉 SHAPE Tier A 的一筆，不關 CROSS** |
| R4 | `data/herbs/herb_canon_shortlist.json#records` 的 `indications_en`(3/121)、`modern_pharmacology_zh`(12/67) | 方藥 | **安全** | 少數側 <10%，多數側形狀明確 |
| R5 | `import_artifacts[]` 兩組鍵合一（事故 #3） | 病症 | **需裁決** | `field` vs `original_field`、`archived_at` vs `moved_at` 是同一個槽兩個名字，但要決定**留哪一個名字**、以及 `belongs_to`/`source_url`/`original_record` 這三個只出現在單邊的鍵怎麼處理。純改名、無新內容，但改的是別人寫的稽核軌跡 |
| R6 | `condition_canon_shortlist.json` 的 `red_flags_zh/_en[]` 元素形（137 筆物件 vs 97 筆字串） | 病症 | **需裁決** | 物件形鍵組單一且結構完整（`finding/rationale/recommended_action/source/urgency_level`），看得出是 A+ Clinical Safety View（`47026e5`）之後的目標形狀；97 筆字串是還沒升級的。但升級要**填 `rationale`/`recommended_action`/`source`**，那是內容工作、要具名來源，不是搬運。**在此之前，任何 `.map(esc).join()` 形狀的消費端對物件形會印出 `[object Object]`——這一條要先做 runtime 確認再談正規化順序** |
| R7 | `drug_interactions_graded[]` / `herb_drug_interactions_graded[]` 的互斥鍵對 | 藥理 | **需裁決** | `effect_en` vs `interaction_en` 是同義還是不同語意（效應 vs 交互作用本身），要問。藥物交互是憲法第四條欄位 |
| R8 | `dosage` 的 175 筆序列化字串（Tier B） | 方藥 | **需裁決，但方向已經很明確** | 175/187 個字串是 JSON 物件被序列化，另 111 筆是真物件——反序列化回物件是**還原**不是改寫。要裁決的只有兩件事：內鍵名（`一般建議`/`食療用量範圍` vs 已存在物件形的 `decoction_g`/`tincture_ml`）怎麼統一，以及誰在讀（grep 0 命中）。**先找到消費端再動**，劑量欄不能盲改 |
| R8b | `dosage_g`(7 字串 / 158 物件)、`has_caution`(319 空字串 / 44 boolean) | 方藥 / 匯入 | **需裁決** | 同為安全欄且 grep 找不到消費端。`has_caution` 的 319 筆字串樣本是**空字串**，很可能是「未判定」被寫成 `""`——那要的是三態，不是 boolean |
| R9 | CROSS `cautions_zh`(15 集合)、`cautions_en`(5)、`contraindications_en`(5)、`cautionsEn`(4) | 跨四條線 | **需裁決 + 跨線協調** | 這是最大的一塊（`cautions_zh` 少數側 522 筆）。要先有一個「安全欄一律陣列」的裁決寫進 `data/config/`，否則各線各自正規化只會再分裂一次 |
| R10 | CROSS 非安全欄（`id` number/string、`title`、`source`、`category`、`notes`、`functionsEn` …） | 各線 | 多數**需裁決** | `id` 的 664 筆 number 全在 `data/tung/tungs_website_raw.json` 與 `tungs_zone_index.json`（原始抓取檔），可能根本不該與 canonical `id` 同名。`functionsEn` 在 8 個 meridian 檔裡 5 array / 3 string，是同一族資料的內部不一致，優先於其他跨領域同名 |

**R1–R4 是「單方向、可機驗、少數側 <30 筆」的一批**，適合當第一批派工單。
**R5 之後每一項都需要 Ting 或該線擁有者先裁決形狀，再派工。**

---

## §7 CI tier 的決定與畢業條件

**選 NOTE tier。** 理由不是保守，是算過的：122 筆發現分屬穴位／方藥／病症／藥理四條線，
全部是 `data/**` 的修改，而且**沒有一筆被派工過**。今天接成 blocking，
只會讓 build 為了沒人被要求修的 backlog 變紅——那種 gate 一週內就會被關掉。
這與 `validate-formula-composition-signatures.js`、`validate-formula-safety-predicates.js`
當初的判斷相同。

CI step（green job，`P1 previsit payload transport standard` 之後、
`whitespace / conflict markers` 之前）：

```yaml
- name: field shape consistency census (NOTE tier, see script header)
  run: node scripts/validate-field-shape-consistency.js
```

**workflow 的 `concurrency:` 區塊與 `preflight` job 未動一個位元組**：
`git diff` 只有一個 hunk、位置在 `@@ -285`，18 行純新增。
job 數 4 → 4（`preflight` / `green` / `ratchet` / `clinical-data-never-committed`），
step 數 43 → 44（只有 `green` 由 36 → 37）。

**畢業條件（逐層獨立）**

| 旗標 | 今日數字 | 歸零的意思 |
|---|---|---|
| `--blocking=A` | 10 | 每一筆集合內型別分裂且有消費端的欄位，**要嘛**在 data 裡正規化成單一型別，**要嘛**消費端改成型別無關**且**在 `data/config/` 記錄成「刻意雙形」。後者是裁決，不是跑批的人單方面說了算 |
| `--blocking=CROSS` | 24 | 同樣條件，跨集合。這一層比較慢，因為一次動好幾條線（`cautions_zh` 橫跨 15 個集合） |
| `--blocking=ITEM` | 13 | primitive 混型與互斥鍵對都收斂。最重的兩列是 `red_flags_zh/_en[]` 與 `import_artifacts` |
| `--blocking`（不帶值） | = A + CROSS + ITEM | — |
| `--blocking=B` | 3 | **刻意不含在不帶值的集合裡**：Tier B 的成員正是 grep 什麼都沒找到的那些，而腳本自己承認 grep 不完整。對一個自己說看不全的訊號設 gate 是不誠實的 |

**沒有「全部型別分裂歸零」這個模式**：其中有些是可能被裁決祝福的正當雙重語意，
一個永遠達不到的旗標不是畢業條件。

---

## §8 這份基線保證什麼、不保證什麼

**保證**：621 個 JSON 全部解析成功、361 個集合、40,293 筆記錄被逐欄位數過型別，
而且每個數字都能被 §0 那四行指令重現。三起事故裡兩起在範圍內、兩起都被重新掃到。

**不保證**：
1. **不保證這是全部的消費端**——見 §3 的四種 grep 盲區。
2. **不保證「型別一致」等於「內容正確」**——一個欄位可以型別完全一致而內容全是樣板句。
3. **不保證 runtime 的形狀等於磁碟的形狀**——`app.js` 會把別的欄位映射成新欄名
   （§4 的 290/44 vs 206/321 就是這麼來的）。要量 runtime 契約需要另一支腳本。
4. **不保證少數側就是錯的一側**——本腳本只報「不一致」與「誰在少數」，
   **哪一側是 canonical 是內容判斷，不是機器判斷**。§6 每一列的「安全正規化？」
   欄是建議，不是裁決。
