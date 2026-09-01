# 混合形狀盤點 2026-09-01

**唯讀稽核。** 不改 `data/**`、`js/**`、`app.js`、CI。
測量對象：`data/generated/knowledge_data.js`（單體 bundle，經
`node scripts/validate-knowledge-parts.js` 確認與 index.html 實際載入的六片
`knowledge_core/ref/rx/mm/dx/pat.js` **逐位元組相等**——量的是出貨的 bundle，
不是原始 `data/**.json`）。

MEASURED TREE: `sonnet/mixed-shape-audit` @ `d1779770`（= `origin/main` HEAD，
2026-09-01 起點；含當日已上車的紅旗形狀修復 814c1632/9e1249a1/2e9c4c01）。

## 分母

- 掃了 **32** 個 record 集合（`ACUTING_KNOWLEDGE` 47 個頂層鍵裡，凡是含
  `records`/陣列本體的都掃；純字典型 vocabulary 物件如
  `formulaActionGroups`、`clinicProfile` 沒有 records 陣列，不在掃描對象內）。
- 合計 **3153** 筆記錄。逐筆記錄的**每一個頂層欄位**都量了形狀
  （`string`/`number`/`boolean`/`object`/`array`/`null`）；凡是 `array` 型欄位，
  額外量**陣列元素**的形狀分布；凡是 `object` 型欄位，額外量鍵組合簽章。
- 原始訊號：**76** 個「欄位在不同記錄／元素間出現超過一種形狀」的信號
  （頂層型別混、陣列元素型別混、物件鍵簽章混，三類分開列不去重）。
- 76 個信號逐一去 `js/knowledge.js` / `app.js` 找渲染路徑，讀不出來的用
  `node scripts/dev-server.js 8699` 開瀏覽器實測、抓 DOM 文字，不用字串比對。

## 一句話結論

76 個混合形狀信號裡，**6 個是渲染器處理不了、已在瀏覽器上實測確認的真缺陷**；
其中 1 個（TDIS 紅旗全暗）是稽核當天稍早的紅旗修復（814c1632）留下的**已知但尚未
正式登記**的殘留，本次把範圍從「75 張」修正為「159 張」；其餘 5 個是**新發現**。
約 10 個信號是字典型欄位（`field_sources`、`cells` 這類用 id/欄名當鍵的 map），
形狀天生就會不同，不是缺陷。約 8 個信號指向渲染器**根本沒讀**的暗欄位。2 個信號
起初看似危險，實測後確認被同一張卡上的備援欄位完全遮蔽，**不是**真缺陷——附上
反例是因為這正是任務提醒的「差點誤報」型態。

---

## A. 處理不了的（6 個，已用瀏覽器實測）

### A1 · `tdisRegistry.red_flags_zh` / `red_flags_en` —— TDIS 卡的紅旗整個是暗的

- **形狀**：陣列元素 `object` 200 筆 / `string` 261 筆（160 筆記錄裡 **159 筆
  （99%）** 帶有紅旗內容，不分形狀）。
- **渲染路徑**：`js/knowledge.js` 的 `renderTdis()`（約 3736 行）只讀
  `t.id / t.name_zh / t.name_en / t.pinyin / t.classical_source / t.definition_zh /
  t.key_manifestation_ids / t.related_patterns`——**完全沒有呼叫**
  `redFlagRows()`（那是給 `renderConditions()` 用的）。`hasRedFlags(t)` 只用來
  決定要不要印「⚠ 無安全警訊」提示牌，紅旗**內容**本身從未進入 DOM。
  `.k-condition-card` 沒有點開詳情的 modal（跟證型卡不同，`grep` 全庫找不到
  `k-condition-card` 的 click handler），所以 `renderTdis()` 印出來的就是這張卡
  的全部——沒有「再點進去看更多」這條路。
- **判定**：處理不了（其實是根本沒接線）。
- **實測**（瀏覽器，`#ws/condition` → 中醫病名 → `tdis.gan_mao` 感冒）：
  卡片 `outerHTML` 全文只有 header/meta/摘要/症狀 chip/證型 chip，
  **沒有任何紅旗區塊**。而 `tdis.gan_mao` 的原始資料是：
  ```
  finding: "高燒不退（≧3天）或反覆發燒" → urgent
  finding: "呼吸困難、突發胸痛或腹痛、意識混亂、劇烈嘔吐不止" → emergency（立即急診）
  finding: "症狀10天以上未改善，或好轉後又惡化" → same_day
  ```
  三條都帶 MedlinePlus 具名來源，其中一條是**急診級**警訊——全庫查詢量最大的
  「感冒」卡，一條都印不出來。
- **影響**：159/160 張中醫病名卡（99%），其中物件形狀 75 張、字串形狀 84 張。
- **已知狀態的落差**：今天稍早的 `scripts/validate-red-flag-shapes.js`
  在檔頭註解裡寫了「已知殘留：tdisRegistry 有 200 筆物件形狀的紅旗，但 TDIS
  卡根本沒有渲染紅旗的區塊——那 75 張卡的紅旗整個是暗的」，並指向
  `docs/TING_PENDING_RULINGS` 去追蹤。**實際查 `docs/TING_PENDING_RULINGS_2026-08-31.md`
  和 `docs/TING_DECISION_QUEUE.md`，兩份都沒有這一條**——註解指的登記還沒真的寫進去。
  另外註解只點名「75 張物件形狀」的，本次盤點確認**字串形狀的 84 張同樣是暗的**
  （`renderTdis()` 不分形狀，兩種都不讀），實際受影響是 159 張不是 75 張。
  `validate-red-flag-shapes.js` 的 R3 只驗證「`redFlagRows` 這個函式存在且認得
  物件形狀」，不驗證「TDIS 有沒有呼叫到它」——這支驗證器本身 PASS，抓不到這個缺口
  （檔頭註解自己也這樣說：「這是接線問題不是形狀問題」）。

### A2 · `patternLibrary.eight_principles` —— 兩套鍵名，渲染器只認一套

- **形狀**：154 筆證型裡，110 筆用鍵名
  `{cold_heat, deficiency_excess, interior_exterior, yin_yang}`；
  **17 筆**用另一套鍵名
  `{heat_cold, excess_deficiency, interior_exterior, yin_yang}`
  （語意相同，鍵名前後對調：`cold_heat`↔`heat_cold`、
  `deficiency_excess`↔`excess_deficiency`）。
- **渲染路徑**：`js/knowledge.js:3046-3055`
  `patternEightPrincipleLabels()` 讀 `principles.interior_exterior`、
  `principles.cold_heat`、`principles.deficiency_excess`、`principles.yin_yang`
  ——寫死這四個鍵名，只認第一套。第二套的 17 筆裡，`cold_heat` 與
  `deficiency_excess` 兩個鍵都讀不到值（`undefined`），`.filter(Boolean)`
  悄悄把它們濾掉，不留痕跡。此函式同時餵給列表大卡 modal 的 meta 列
  （`js/knowledge.js:3279`）與另一處（3409-3414 一樣的邏輯）。
- **判定**：處理不了。
- **實測**（瀏覽器，`#ws/condition` → 證型 → `pattern.kidney_yang_deficiency`
  腎陽虛 → 開啟證型大卡）：
  大卡 meta 列印出 **`ID: pattern.kidney_yang_deficiency · 臟腑辨證 · 裏 · 陽`**
  ——只有「裏」（interior_exterior）跟「陽」（yin_yang）兩個標籤。寒/熱、虛/實
  兩軸完全消失，即使這筆記錄的原始資料明寫 `heat_cold:"cold"` 與
  `excess_deficiency:"deficiency"`。**這張卡的名字本身就是「腎陽虛」——
  病名裡的「虛」字，在自己的八綱分類列上不見了。**
- **影響**：17/154 筆（11%），包括肺陰虛、脾氣虛、肝陽上亢、腎陽虛、腎陰虛、
  心脾兩虛、血瘀、痰濕、肝火上炎、肝風內動、心腎不交，以及 5 個淋證亞型
  （熱淋、石淋、氣淋實證、血淋實證、勞淋等）——都是高頻臨床證型，不是邊緣記錄。
  附帶一個更深的形狀分岔：17 筆裡至少 1 筆（`pattern.liver_yang_rising`）的
  `excess_deficiency` 值本身也用了第三種措辭 `"mixed_deficiency_excess"`，
  跟渲染器 `valueLabels` 表裡登記的 `"mixed"` 對不上——即使鍵名接上了，
  這個值仍然會查表落空。

### A3 · `herbs.pao_zhi_notes_zh` —— 陣列被 `esc()` 直接吞成逗號黏在一起的長句

- **形狀**：366 筆中藥裡，79 筆字串、**26 筆陣列**（每筆陣列 1–4 條，各講不同
  炮製品的差異）。
- **渲染路徑**：`js/knowledge.js:2153-2155`：
  `` esc((contentMode === "english" && usableText(record.pao_zhi_notes_en)) ||
  record.pao_zhi_notes_zh || usableText(record.pao_zhi_notes_en)) `` ——
  直接 `esc()`，沒有經過 `cleanList()`/`asList()` 這類先攤平陣列的安全層。
  `esc()` 對陣列做 `String(array)`，JS 內建行為是逗號相接、**不加空格**。
- **判定**：處理不了。
- **實測**（瀏覽器，中藥 → 半夏 → 炮製作用區塊）：
  ```
  法半夏：甘草、石灰等法製，燥濕化痰而藥力較和，偏脾虛濕痰。,薑半夏：以生薑、
  明礬炮製，長於降逆止嘔、溫中化痰。,清半夏：明礬等法製，偏燥濕化痰，適合痰多
  而正氣較弱者。,生半夏：毒性強，只供外用，不得內服。
  ```
  四條不同炮製品的說明黏成一句無法斷句的長文，而且**「生半夏：毒性強，只供
  外用，不得內服」這條安全警語被埋在句尾**，跟前面的臨床描述用一個裸逗號隔開，
  容易被當成同一句話的一部分掃過去。
- **影響**：26/366 張中藥卡（7%）。

### A4 · `herbs.classical_text_zh` / `classical_text_en` —— 同一個逗號黏字問題，卡上出現兩次

- **形狀**：366 筆裡 **19 筆**（`classical_text_zh`、`classical_text_en` 同一組
  19 筆）是陣列，其餘 20/21 筆是字串。
- **渲染路徑**：`js/knowledge.js:2178`（`linkifyHerbs(record.classical_text_zh, ...)`
  區塊「古籍原文 Classical Text」）與 `2179`
  （`esc(record.classical_text_zh).replace(/\n/g, '<br>')` 區塊「古文典籍記載
  Classical text quotation」）——**兩個區塊都直接讀，都沒有攤平陣列**，同一個
  缺陷在卡片上印兩次。
- **判定**：處理不了。
- **實測**（瀏覽器，中藥 → 漢防己 → 古籍原文 / 古文典籍記載，兩區塊皆同）：
  ```
  課件重點：漢防己善利水消腫；木防己/廣防己偏祛風濕止痛但毒性問題需辨。,
  防己黃耆湯方向：虛性水腫、汗出惡風、身重、脈浮。
  ```
  兩條原本各自獨立的課件筆記被逗號黏成一句。
- **影響**：19/366 張中藥卡（5%），每張卡上出現兩次（兩個區塊都壞）。

### A5 · `herbs.source_citations` —— 字串形狀的引用被整條吞掉，卡片還倒過來說「來源待補」

- **形狀**：ELEM 混 `object`(522) / `string`(39) / 空陣列(1)，涉及 **22 筆**
  中藥記錄。
- **渲染路徑**：`js/knowledge.js:698-754` 的 `sourceLinks()`：
  `` citations.forEach(c => { const isUrl = c.url && ...; } else if (c.name && ...) `` ——
  只認得 `{name, url, scope}` 物件形狀。當 `c` 是裸字串時，`c.url` 與 `c.name`
  都是 `undefined`，兩個分支都不成立，這條引用**整條不渲染，不留任何痕跡**。
  更糟的是「外部參考 Sources」這個 tile 沒有其他來源可退回時，會落到
  「來源待補」的字樣——資料裡明明有具名來源，畫面卻說沒有。
- **判定**：處理不了（比單純「消失」更糟：訊息從「有」變成主動宣稱「沒有」）。
- **實測**（瀏覽器，中藥 → 石榴皮 → 外部參考 Sources）：
  畫面印出 **「外部參考 Sources / 來源待補 / Draft · source review pending」**，
  完全沒有出現 CloudTCM/American Dragon 之外的任何來源；而該筆記錄的
  `source_citations` 實際內容是
  `["《中華人民共和國藥典》2020年版一部：石榴皮"]`——一條具體、可查證的官方
  藥典引用，在畫面上不但不顯示，還被蓋成「待補」。
- **影響**：22/366 張中藥卡（6%），部分引用是《中華人民共和國藥典》
  《中藥大辭典》《傷寒論》《溫病條辨》等經典/官方出處。

### A6 · `herbs.safety_review_pending` —— 布林值被當文字印成 "true"

- **形狀**：366 筆裡 14 筆字串（真正的待審說明文字）、**58 筆布林值**
  （`true` 49 筆 / `false` 9 筆）。
- **渲染路徑**：`js/knowledge.js:748-750`：
  `` if (record.safety_review_pending) { html += `⏳ ${esc(record.safety_review_pending)}` } ``
  ——`esc(true)` = `String(true)` = `"true"`，逐字印在畫面上。
- **判定**：處理不了。
- **實測**（瀏覽器，中藥 → 巴豆 → 外部參考區塊）：畫面逐字印出 **「⏳ true」**，
  沒有任何說明文字。
- **影響**：49/366 張中藥卡（13%）印出裸的「⏳ true」；另外 9 筆是 `false`，
  falsy 所以整塊不顯示（等於「應該有審核提示但完全沒印」，是另一種資訊流失，
  沒有算進「處理不了」但一併記錄）。受影響名單裡有多味毒性藥材（巴豆、
  制川烏、制草烏、蜈蚣、水牛角、硫黃、罌粟殼、龍齒等）——這些卡本來最需要
  一段真正的審核說明，卻印出無意義的「true」。

---

## B. 驗過是假警報的（2 個）——寫進來是因為差一點就誤報

### B1 · `herbs.tcm_properties`（object 116 / string 10）—— 被同卡的備援欄位完全遮蔽

`js/knowledge.js:1983` `const props = record.tcm_properties || {}`，當
`tcm_properties` 是字串時 `props` 就是那個字串，後續 `props.four_natures_zh`
等點取用法在字串上全部是 `undefined`。**但** `2130` 行的渲染式是
`props.four_natures_zh || usableText(record.properties_taste_temp ||
record.taste_temperature_zh) || "待補"`——10 筆 `tcm_properties` 是字串的記錄，
逐筆檢查 `properties_taste_temp` **全部有值**（白果："甘、苦、澀，平，小毒"、
白前："辛、甘，微溫"……），瀏覽器實測白果卡「性味 Properties & Temp」正確印出
「甘、苦、澀，平，小毒」，不是「待補」。真正流失的只有 `tcm_properties`
字串裡**額外**的跨來源比對註記（例如「課件與 AD 以肺、腎為主，AD 另列心經；
CloudTCM 亦列肺、腎」這種來源分歧說明）——這段沒有任何欄位接住，但不是
「畫面壞掉」，是「一段附註沒地方去」，嚴重度遠低於 A 類。

### B2 · `herbs.taste_temperature_zh`（string 140 / array 9）—— 陣列形狀是死路徑，從未被讀到

`js/knowledge.js:1449` 與 `2130` 兩處都寫
`usableText(record.properties_taste_temp || record.taste_temperature_zh)`——
`||` 短路。逐筆核對 9 筆 `taste_temperature_zh` 是陣列的記錄
（漢防己、麻黃根、決明子、木賊、白花蛇、硫黃、仙茅、白花蛇舌草、白鮮皮），
**9/9 全部同時有 `properties_taste_temp` 字串**，所以 `taste_temperature_zh`
的陣列形狀永遠排不到、從未進入渲染。瀏覽器實測漢防己卡印出「苦、辛，寒。」
（來自 `properties_taste_temp`），不是陣列 `join()` 出來的「苦,辛,寒」。

---

## C. 字典型欄位（≈10 個信號）—— 形狀本來就該不同，不是缺陷

以下欄位是「用欄位名/id 當鍵」的 map，不是固定 schema 的 struct，逐記錄鍵組合
不同是設計如此。逐一核對渲染路徑用的是 `Object.entries(x || {})` 或
`(x || {})[key]` 這類防禦寫法，不是固定鍵解構，確認不會因為鍵集不同而壞：

`formulas.field_sources`（203 種鍵簽章）、`herbs.field_sources`（103 種）、
`patternLibrary.field_sources`（20 種）、`conditionCanon.field_sources`（33 種）、
`symptoms.field_sources`（21 種）、`herbPairs.field_sources`（5 種）、
`pharmDrugs.field_sources`（26 種）、`pharmDrugClasses.field_sources`（12 種）、
`pharmDrugTargets.field_sources`（2 種）、`comparisons.cells`（10 種，鍵是
比較對象 id）。

---

## D. 暗欄位（≈9 個信號）—— 渲染器根本沒讀，混合形狀目前零影響

以下欄位在 `js/knowledge.js`／`app.js`／`js/care-draft.js` 逐一 `grep` 過，
**找不到任何讀取點**（含 `record.<field>`、解構、`Object.entries` 間接讀取）。
形狀混雜屬實，但因為沒人讀，今天不會在畫面上造成任何後果——先寫「暗欄位」
而不是「缺陷」，因為兩種問題的修法不同（接線 vs 改渲染邏輯）：

- `conditionCanon.content_source`（array 127 / string 3）——只在
  `scripts/audit-evidence-provenance-fragmentation.js`、
  `scripts/validate-condition-standard.js` 兩支腳本裡出現，不上畫面。
- `herbs.dosage`（object 116 / string 188，21 種鍵簽章）——`knowledge.js:2143`
  註解明寫「刻意不自動改讀 `record.dosage`」，形狀公約待裁（`docs/TING_DECISION_QUEUE.md`
  B3）。
- `herbs.modern_pharmacology`（不帶 `_zh`/`_en` 後綴，ELEM object 243 / string 105）
  ——`grep "\.modern_pharmacology\b"` 全庫零命中；讀到的都是
  `modern_pharmacology_zh`/`_en`（帶後綴的姊妹欄位，經 `cleanList()` 安全處理）。
- `herbs.modern_functions_detail_zh`（ELEM object 1510 / string 1 / 空陣列 3）
  ——`herbModernDetailSection()` 用 `r.tag || r.analysis_zh` 過濾，那 1 筆字串
  元素會被悄悄濾掉；n=1，影響可忽略，未逐一追出是哪張卡。
- `outcomeMetrics.scale`（object 10 / null 17）、
  `outcomeMetrics.source`（object 10 / null 17）——`app.js:6607-6620` 讀
  `def.source?.name`（optional chaining，`null` 安全跳過）；`.scale` 全庫
  `grep` 零渲染讀取點。
- `supplementRecords.dose_source`（object 34 / null 2）——`grep` 零命中。
- `redFlagRegistry.evidence`（ELEM 3 種鍵簽章）——`redFlagRegistry` 只在
  `knowledge.js:3118-3119` 被讀來建 `RF_BY_ID`／`RF_TIER_VOCAB`，讀的鍵是
  `id/trigger_zh/trigger_en/tier`，`.evidence` 沒有任何讀取點。
- `formulas.tongue_en` / `formulas.pulse_en` / `formulas.fertility_notes`
  （string/array 混）——`grep` 找到的 `tongue_en`/`pulse_en` 讀取全部是
  `patternLibrary` 記錄（變數名同樣叫 `p`，容易誤讀成同一個集合，**其實是
  不同的頂層集合**）；`formulaPanels()`（1503-1799 行）本體完全沒有
  `tongue`/`pulse`/`fertility` 字樣，`formulas` 集合上的這三個欄位是暗的。

---

## E. 判斷不了的（未能在預算內窮盡）

- `herbs.source_citations` 的 522 筆物件裡有 **8 種**鍵簽章（多數應該只是
  `{name,url}` vs `{name,url,scope}` 這類可選欄位差異，經 `sourceLinks()`
  防禦式讀取應該安全），但沒有逐一核對全部 8 種是否都被涵蓋——只驗證了
  「純字串元素」這一種形狀（= A5）。
- `pharmDrugs.drug_interactions_graded`（ELEM 7 種鍵簽章）、
  `pharmDrugs.herb_drug_interactions_graded`（ELEM 3 種）——沒有找到明確的
  渲染呼叫點，但西藥卡的交互作用區塊邏輯較長，沒有在預算內追完整條路徑；
  不確定是暗欄位還是有防禦式讀取，列為未驗證。
- `formulas.composition`（ELEM 36 種鍵簽章）——`compositionSummary()` 有讀
  但只挑固定幾個欄位（劑量/角色類），36 種鍵簽章裡絕大多數差異應該是
  「加減味條件式」這類選填欄位，沒有逐一核對是否有任何一種鍵簽章會讓
  `compositionSummary()` 出錯或漏印。
- `formulas.english_exam_track` / `chinese_depth_track`
  （4 種／3 種鍵簽章，formulas 與 herbs 各有一份同名欄位）、
  `herbs.dosage_g`（22 種鍵簽章，未逐一核對是否每種都被
  `dose.standard_daily_g`/`dose.granule_dose_g` 兩個固定鍵安全跳過）、
  `herbs.safety_info`（5 種）、`herbs.visual_links`（3 種）、
  `herbs.key_pairs` / `herbs.import_artifacts`（各 2 種 ELEMOBJKEYS）——
  抽樣讀過渲染式用的是點取固定鍵而非解構，判斷風險低，但沒有逐一核對每種
  鍵簽章下是否都有安全預設值，未列入 A 類也未逐一排除。

---

## 附：重現方式

```bash
export PATH="/c/Program Files/nodejs:$PATH"
node scripts/dev-server.js 8699
# 瀏覽器開 http://localhost:8699/index.html#ws/herb 搜「巴豆」「半夏」「漢防己」「石榴皮」
# http://localhost:8699/index.html#ws/condition 搜「感冒」（中醫病名）、「腎陽虛」（證型）
```

掃描腳本（一次性，寫在 scratchpad，未提交）：讀
`data/generated/knowledge_data.js`，`JSON.parse` 出 `ACUTING_KNOWLEDGE`
物件後逐欄位跑形狀分類，未落地在 repo 內（任務要求唯讀，不留渲染器/資料改動；
掃描腳本本身也不是規則要求的產出物，因此沒有存進 `scripts/`）。
