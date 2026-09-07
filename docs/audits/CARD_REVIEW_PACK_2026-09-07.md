# 卡片審讀包 2026-09-07 — 包 D:卡片語意（唯讀，不改資料）

審讀員：Claude；分支 `claude/pkgD-review`；開工 SHA `103e162a004dc9ea2ba447f3837bc612ad12dc92`（`origin/main`）。
本文件是**審讀結果**，不是資料修改。所有數字附一行可重現指令；`node scripts/build-data.js` 等驗證器輸出見第 5 節與 `docs/audits/` 同批 scratchpad 存檔。

---

## 0. 選卡規則（可重現）

**方劑 9 張**：`docs/FORMULA_CARDS_INVENTORY.md` 從檔案最上方開始，逐行往下數第一個出現 ⭐ 的區塊（「未分類 / 考點與補充劑」章節，行 39–47），取前 9 張，排除 `xiao_jian_zhong_tang`（該卡在檔案第 249 行才出現，不在前 9 名之內，排除規則沒有實際生效，但驗證過一次）：

```
formula.bu_fei_tang · formula.da_bu_yin_wan · formula.da_jian_zhong_tang · formula.da_qing_long_tang ·
formula.dan_shen_yin · formula.dang_gui_shao_yao_san · formula.dang_gui_yin_zi · formula.ding_zhi_wan · formula.du_qi_wan
```

重現指令：`grep -n "⭐" docs/FORMULA_CARDS_INVENTORY.md | head -9`

**藥材 9 味**：對 `data/generated/knowledge_mm.js`（畫面實際載入的分片）量 `related_formulas.length`，降序取前 9 名，排除 `herb.huang_qi`：

```
herb.gan_cao(70) · herb.ren_shen(38) · herb.fu_ling(37) · herb.dang_gui(34) · herb.huang_qin(31) ·
herb.sheng_jiang(28) · herb.bai_zhu(28) · herb.ban_xia(26) · herb.bai_shao(26)
```

第 8/9 名（白朮 28、半夏 26、白芍 26）之後有並列值，取用 `Array.prototype.sort`（穩定排序）對載入順序的結果，重現指令見附錄腳本 `select-herbs.js`（原始碼片段見本文件末）。

**必審 2 張**：`herb.huang_qi`、`formula.xiao_jian_zhong_tang`。

**總計 20 張**：10 味藥（含黃耆）+ 10 首方（含小建中湯）。

**兩種模式**：每張卡先在中文模式 `openDetail()` 讀一次完整 `dialog.innerText`，`herb.gan_cao` 額外切 `setContentMode("english")` 後重新 `openDetail()` 讀一次，確認雙語切換不是只換 UI 外殼、確實改變欄位內容（詳見 §2 對照）。

---

## 1. 環境與 D29 量測腳本可重現性

dev server：`node scripts/dev-server.js 8645`（本機背景程序），瀏覽器以 `preview_start({url:"http://localhost:8645"})` 開啟（未使用 `.claude/launch.json` 具名設定，因為該檔案由多個並行審讀 session 共用，寫入會撞名；已在本機 worktree 的 `.claude/launch.json` 追加 `pkgD-8645` 項目留存但未使用該路徑啟動）。全程確認 `location.origin === "http://localhost:8645"`；未呼叫 `localStorage.setItem/clear`；未開啟 `*.workers.dev`。

D29 與其餘量測腳本用 Node `vm` 模組把 `data/generated/*.js` 六片載入沙箱 `globalThis`，等同瀏覽器實際看到的合併結果（畫面為準）；另外直接 `JSON.parse` `data/herbs/formulas.json`／`herb_pairs.json`／`herb_canon_shortlist.json` 取得原檔內容核對來源（原檔為證）。

---

## 2. 20 卡逐卡表

> 欄位「嚴重度」：HIGH=會誤導臨床/歸屬錯，MED=樣板句/缺來源/內容不完整，LOW=文字。
> 「建議值來源」寫「待 Ting」的條目**沒有**進 `ledger_pkgD.json`（帳本只收有 repo 內來源、可不經臨床判斷落地的條目）。

### herb.huang_qi（黃耆）— 必審

| # | 欄位 | 現值（截120字） | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 1 | `channels_entered`（畫面「歸經 Channels」表頭列讀這欄，見 `js/knowledge.js:1473`） | `["脾經","三焦經","腎經","大腸經","心經","肺經"]`，`source_hint:"Bensky Materia Medica: Tonify Qi"`，**無 `field_sources.channels_entered`** | (h) 醫學錯誤 + (g) 來源缺 + 渲染器 fallback 錯誤 | 表頭改讀 `channels_zh`＝`["肺經","脾經"]`（與 `tcm_properties.meridian_tropism_zh` 一致） | `curriculum/herbs/materia_medica_abbreviated_chenoweth.md` 第 22 頁區塊（`## p.22` 後）：「Huáng Qí (黄芪) [Old Yellow] Sweet, Slightly Warm **[LU, SP]**」——課件原文只列肺、脾兩經；`channels_zh` 已正確引用此頁（`field_sources.channels_zh`），`channels_entered` 沒有任何逐欄來源，是另一條沒有核實的匯入欄位 | **HIGH** |
| 2 | 同上，畫面實測 | 卡片同時顯示「歸經 Channels：脾經、三焦經、腎經、大腸經、心經、肺經」（表頭）與「歸經 Channels entered：肺經、脾經」（下方 chip） | 同上（同一張卡兩處講不同的事，肉眼可見） | — | — | HIGH（同一條） |

**渲染器根因**（不是 huang_qi 一張卡的問題，是共用程式碼）：`js/knowledge.js:1473` 表頭 `["歸經 Channels", cleanList(record.channels_entered || record.channels_zh).join("、") || "待補"]`——`channels_entered` 排在 `channels_zh` 前面，只要兩者都非空，表頭永遠顯示未經來源核對的 `channels_entered`；下方 chip 列（`js/knowledge.js:2163-2164`）優先序不同（`meridian_tropism_zh || channels_entered || channels_zh`），造成同一張卡兩個區塊可能互相矛盾。全庫量測：366 味藥材裡 282 味兩欄皆非空，其中 **168 味（59%）兩欄不同**（多數只是順序不同，但確有實質差集，例如桂枝：entered 5 經 vs zh 3 經；防風：entered 4 經 vs zh 3 經）。重現指令：`node <腳本見附錄 channels-mismatch.js>`。**這是渲染器程式碼問題（`js/knowledge.js`），不在我的資料權限內，也沒有進帳本**——僅回報。

### formula.xiao_jian_zhong_tang（小建中湯）— 必審

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 3 | `contraindications_zh` / `contraindications_en` | zh=`["因嘔吐或蛔蟲所致者，宜去甘味藥。","腹脹（中滿）者宜隨證加減。","陰虛內熱者禁用"]`；en=`["Contraindicated for those with Heat from Yin Deficiency.","Eliminate sweet flavor for vomiting or roundworms.","Modify for abdominal distention."]` | (d) 中英陣列長度相等（3=3）但**逐項配對錯位**：zh[0]配到en[2]的譯文、zh[1]配到en[0]的譯文、zh[2]配到en[1]的譯文 | en 重排為 `["Eliminate sweet flavor for vomiting or roundworms.","Modify for abdominal distention.","Contraindicated for those with Heat from Yin Deficiency."]`（zh 不動，只調 en 順序） | 同記錄內逐句對照翻譯即可驗證正確配對（不需外部來源）；根因記錄在同記錄 `import_artifacts[0]`/`[2]`（2026-08-29 A1(a) 重新拆分時的 `ruling` 欄位） | **HIGH**（已進帳本） |
| 4 | `cautions_zh` / `cautions_en` | zh=`["陰虛火旺者慎用。","因嘔吐或蛔蟲所致者，宜去甘味藥。","腹脹（中滿）者宜隨證加減。"]`；en=`["Use with caution for those with Fire from Yin Deficiency, vomiting, or abdominal fullness.","Eliminate sweet flavor for vomiting or roundworms.","Modify for abdominal distention."]` | (d)/(b) 混合：cautions_zh[1]/[2] 與 contraindications_zh[0]/[1] **逐字重複**（同一句話同時掛在「禁忌」和「注意事項」兩個標題下）；cautions_en[0] 是把三個概念揉成一句的合譯，與 cautions_zh[0]（只講一件事）對不上 | — | 同記錄 `import_artifacts[1]`/`[3]` 明確標記這兩條是 `needs_review(2)` `<no_direction_token>`（A1(a) 2026-08-29 分類器判不出屬「禁忌」還是「注意」，兩邊都塞了一份，尚未有人回頭裁定） | **HIGH，待 Ting**（判斷屬於絕對禁忌或相對注意需要臨床判斷，未進帳本；系統性量測：全庫 223 方裡 **64 方**（29%）的 `contraindications_zh`/`cautions_zh` 有逐字重複句，同源於同一次 A1(a) 遷移，見附錄腳本輸出） |
| 5 | `applications_zh` | `[]`（空） | 內容缺口（模板 §1 區 12「現代應用」必填，且明訂不可用 `modern_diseases_zh` 代替） | — | 待補（curriculum/formulas/Herbal Formulations Comprehensive 尚未對這批「未分類」方做這一輪整理） | MED（見下方跨卡量測，10/10 全缺） |

### herb.gan_cao（甘草）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 6 | 對藥「滑石 + 甘草」 | 只有英文 `Indication difficult, painful, dark urination...`，無中文、無 `relation`、無主治/注意中文句 | (c)/(g) 英文獨立存在、缺中文對照與來源 | — | 待補 | LOW（全庫已知樣態，多筆對藥記錄同型，不逐一列舉） |

其餘欄位（功效 5 條、主治 6 條、現代藥理 15 條、禁忌 3、慎用 5、中英陣列全部等長）核對無誤，`field_sources` 18 欄，考點與十八反內容與 `curriculum/herbs/materia_medica_abbreviated_chenoweth.md` 一致。**中英模式對照**（`setContentMode("english")` 後重開卡）：`歸經 Channels entered` 從「脾經 胃經 心經 肺經」正確切成「Heart / Lung / Spleen / Stomach」，`相關經典方劑` 從中文·拼音雙標籤正確切成純拼音——雙語切換機制運作正常，本卡沒有語言洩漏。

### herb.ren_shen（人參）

無 HIGH/MED 問題。`channels_entered=["心經","脾經","肺經"]` 與 `channels_zh=["脾經","肺經","心經","腎經"]` 集合不同（zh 多一個腎經），但因 `tcm_properties.meridian_tropism_zh` 為空，畫面表頭與 chip 都回退到 `channels_entered`，**兩處彼此一致、但都比已標來源的 `channels_zh` 少一經**——歸類為 MED（(g) 類，來源缺口）：`channels_entered` 沒有 `field_sources`，`channels_zh` 有（`curriculum/herbs/materia_medica_abbreviated_chenoweth.pdf#p22` 等）；不確定何者才是正確答案，未提出建議值，列**待 Ting**。

### herb.fu_ling（茯苓）

無新增問題。兩源分歧（Chenoweth 記 HT/SP/KD 三經，雲端中醫另列肺經）**已經被正確處理**：`meridian_tropism_zh` 欄位本身就帶著括號註記「肺經（雲端中醫另列;Chenoweth 作 HT/SP/KD 三經）」，畫面上也照樣顯示這段但書——這是 R2 Evidence 慣例「兩源不合就並記」的正例，記錄在案供其他卡參考，不算缺陷。

### herb.dang_gui（當歸）

無新增問題。三筆「歸屬更正（2026-09-01）」自我修正紀錄（考綱 Appendix B 對藥被錯貼上擴充配伍組合）看得出前一輪已經處理過同類錯誤，本卡目前乾淨。

### herb.huang_qin（黃芩）— D29 選中（第 5 大連結數 31）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 7 | `exam_importance` / `exam_pearl` | 兩欄都不存在（`undefined`） | 內容缺口，模板列「必（Ting 指定保留）」 | — | 待補 | MED |
| 8 | `dosage_g.standard_daily_g` | 不存在 →畫面顯示「生藥日服量：**待補**」 | (f) 劑量缺口，但**不是沒有來源**：`dosage`（字串化 JSON）與 `dosage_normalized.medicinal`=`[{low_g:3,high_g:10,verbatim:"3-10克",attributed_to:"https://cloudtcm.com/herb/1082"}]` 已有查證數字，只是沒被搬進畫面實際讀取的 `dosage_g.standard_daily_g` | — | 渲染器故意不讀 `record.dosage`（見 `js/knowledge.js:2165-2172` 註解：77 張卡食療上限高於藥用上限，接錯會顯示更危險的數字，需先定形狀公約，`docs/TING_DECISION_QUEUE.md B3` 尚未結案）——**這是一個被刻意擋住的系統性缺口，不是黃芩一張卡能單獨修的**，未進帳本 | **HIGH，待 Ting**（B3 形狀公約優先於逐卡補值） |
| 9 | `condition_tags_zh` / `_en` | 均為 `[]` | (d)/(g) 兩欄同時空白，必填欄位缺內容 | — | 待補 | MED |
| 10 | `indications_zh` | 只有 1 條合併句：「清熱燥濕；瀉火解毒；止血；安胎」，不是模板要求的「證型 —— 配伍」逐條格式 | 內容不完整 | — | 待補 | MED |
| 11 | `functions_zh` | 13 條（`card_grade:"partial"`，不受 E8 上限 2-6 條約束，但 `validate-herb-standard.js` 的「action curation」統計把它算進「75 筆 >6 條原始倒貨」那組，屬已知但未強制的缺口） | (b) 樣板/未整理 | — | 待補（交叉比對課件/CloudTCM/American Dragon 篩成 3-5 條） | MED |
| 12 | `pharmaceutical_latin` | 不存在（卡頭沒有拉丁藥名行，同批其餘 9 張都有） | 內容缺口 | — | `curriculum/herbs/pinyin_latin_herb_list.csv` 待查 | LOW |
| 13 | `channels_entered` vs `channels_zh` | entered=`["心經","肝經","膽經","大腸經","肺經","胃經"]`（source_hint 同樣是無逐欄來源的 Bensky 分類標籤）；zh=`["肺經","膽經","脾經","大腸經","小腸經"]`（`field_sources.channels_zh`→cloudtcm/1082） | (g)/(h)，兩者是**不同的集合**（entered 多心/肝/胃、少脾/小腸），畫面兩處因 `meridian_tropism_zh` 為空而都回退到 entered，**彼此一致但都不是已標來源的 zh** | — | 待 Ting（同 huang_qi 案例的同一條渲染器 fallback 問題，唯一差別是這裡剛好兩處一致所以肉眼看不出矛盾） | MED |

黃芩是本次 D29 選出「連結數第 5 高」的藥材（31 個方引用），但卡片本身明顯還沒經過 huang_qi/gan_cao/ren_shen/dang_gui 那一輪「整理」（`card_grade:"partial"` vs 其餘 9 張皆 `"template"`）——連結數高不代表卡片品質高，這點值得留意。

### herb.sheng_jiang（生薑）

無新增問題。安全欄位誠實標註「現有來源未提供可核實的特定藥物交互作用數字；不沿用舊資料中未具精確來源的抗凝血、降壓或降糖斷言」——符合「查不到就留空」原則的正例。

### herb.bai_zhu（白朮）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 14 | 對藥 `pair.huang_qin__bai_zhu`（`data/herbs/herb_pairs.json`）的 `indication_en` | `"Uterine bleeding, threatened miscarriage, and nausea during pregnancy caused by Heat or Damp-Heat Male Reproductive Disorders:"` | (a) 歸屬錯：句尾「Male Reproductive Disorders:」不屬於這一組配伍，是下一類配伍（知母+黃柏，治遺精/陽強）的課件表格分類標題，多欄 PDF 抽取時黏到句尾 | `"Uterine bleeding, threatened miscarriage, and nausea during pregnancy caused by Heat or Damp-Heat."` | `curriculum/formulas/02_Formula_Cards_011-020_補益劑.md:1480`（同一抽取窗口也一致出現於 `06_Formula_Cards_051-060_祛濕劑.md:2197`、`19_Formula_Cards_181-190_未分類-考點與補充劑.md:1540` 三份課件抽取檔）：「...Huang Qin + Bai Zhu Uterine bleeding, threatened miscarriage, and nausea during pregnancy caused by Heat or Damp--Heat **Male Reproductive Disorders:** Zhi Mu + Huang Bai Priapism...」 | **HIGH**（已進帳本） |

此對藥記錄目前完全沒有 `relation`/`pair_meaning_zh`/`indication_zh`/`caution_zh`（只有這句被污染的英文主治），本次只修剪句尾污染，不補新內容。

### herb.ban_xia（半夏）

無新增問題。孕期安全資料誠實並記三源分歧（Chenoweth 列為晨吐適應證 / American Dragon 主張慎用配足量生薑 / CloudTCM 同時收錄忌用與可辨證使用），符合「兩源不合就並記」。

### herb.bai_shao（白芍）

無新增問題。赤芍/白芍鑑別（虛痛 vs 瘀痛）清楚，Appendix B 三組對藥（配甘草/配柴胡/配桂枝）也如實標記「待補充配伍意義」而非硬掰內容。

### formula.bu_fei_tang（補肺湯）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 15 | `contraindications_zh`（0）/ `cautions_zh`（0） | 兩欄皆空，畫面「安全與來源」區完全沒有「⚠️ 禁忌與注意事項」子區塊 | 必填欄位（模板 §1 區 14「必」）完全缺內容，一張已列入 NCBAHM 官方應試方劑（`on_board_list` 相關 `exam_importance` 存在）的方，組成含黃耆（高血壓需慎用）、熟地黃（濕阻中滿慎用）、五味子（外邪未解禁用）等常見安全考點卻一個字都沒有 | — | 待補（`curriculum/formulas` 或 American Dragon 頁需要人工核對） | **HIGH，待 Ting**（查無來源，不可代填） |
| 16 | `applications_zh` | `[]` | 內容缺口 | — | 待補 | MED |

### formula.da_bu_yin_wan（大補陰丸）

無新增問題，禁忌/注意兩欄都有內容。`applications_zh` 同樣是 `[]`（見跨卡量測）。

### formula.da_jian_zhong_tang（大建中湯）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 17 | `exam_pearl`（畫面最上方、最先被讀到的「💡考試重點」綠底框） | 「...蜀椒（君，溫中止痛散寒）；乾薑（臣，溫脾胃）；人參、飴糖（佐使，大補中氣、緩急止痛）...」 | (a)/(h) 與同一張卡的組成表**互相矛盾**：`composition[].role_zh` 是「飴糖=君、蜀椒=臣、乾薑=臣、人參=佐」（Ting 2026-08-12 裁定 1A），`exam_pearl` 卻停留在被否決的另一說（蜀椒=君），且沒有像 `clinical_use_note`/`correction_note`/`hierarchy_status`（=`disputed_modern_analysis`）那樣註明兩說並存 | 「...本卡採現代分析：飴糖（君，健脾益氣）；蜀椒、乾薑（臣，溫中散寒止痛）；人參（佐，大補元氣）——另有教學分析作蜀椒君、乾薑臣、人參佐、飴糖佐使，兩說並存（見學習備註）...」 | 同記錄 `correction_note`（2026-08-12 Ting 裁定 1A）+ `composition[].role_zh` + `clinical_use_note`（三處已一致採用「飴糖君」分析），逐字沿用已核可措辭改寫 | **HIGH**（已進帳本） |
| 18 | `applications_zh` | `[]` | 內容缺口 | — | 待補 | MED |

### formula.da_qing_long_tang（大青龍湯）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 19 | `category` 欄缺失 →畫面「分類 Category」顯示「**待補**」 | `category_zh:"解表劑"` 存在但 `category`/`category_en` 都不存在，`js/knowledge.js:1451/1471` 的 fallback 鏈 `record.category \|\| record.category_en \|\| "待補"` 沒有接 `category_zh` | 渲染器 fallback 缺口（CLAUDE.md 規則五：fallback 預設當缺陷） | — | 全庫量測：223 方裡 **10 方**同樣「有 `category_zh` 卻顯示待補」（含本卡與 `dang_gui_yin_zi`，見附錄清單）；這是 `js/knowledge.js` 程式碼問題，不在資料權限內，未進帳本 | MED |
| 20 | `tier` 欄缺失 →畫面「學習層級 Tier」顯示字面值「**draft**」 | `record.tier` 不存在，`js/knowledge.js:1236` fallback 為 `record.tier \|\| "draft"` | 同上類型的 fallback 缺口 | — | 全庫量測：223 方裡 **107 方**（48%）沒有 `tier` 欄位，畫面統一顯示看起來像正式分級、實際只是預設值的「draft」 | MED |
| 21 | `composition[0]`（麻黃，君藥）`in_formula_zh`/`actions_zh` | 「止咳化痰。」 | (h) 醫學方向錯：本方是《傷寒論》發汗第一峻劑，麻黃在此方的定義性角色是**發汗解表**（對應 `in_formula_en`：「Releases Exterior, moves Lung Qi/water, stops cough/wheeze and warms Cold」），中文只寫「止咳化痰」等於把君藥的主要作用漏掉、只留次要作用 | — | 待 Ting（見下方跨卡系統性量測，這是全庫「本方功效＝藥材自身通用功效」樣板問題在本卡最嚴重的一例，需要逐方臨床改寫，不是我能單條代填） | **HIGH，待 Ting** |
| 22 | `formula_family`／`derived_from` 反向連結 | `formula.ma_huang_tang.formula_family` 有一條指向 `formula.da_qing_long_tang`（「加石膏 15g、生薑 9g、大棗 4枚；倍麻黃」），但 `formula.da_qing_long_tang.derived_from` 完全不存在 | (e) 懸空/缺反向連結；此例剛好是 `FORMULA_CARD_TEMPLATE.md` §6 用來說明「反向連結 derived_from」設計動機的**同一組範例方**（麻黃湯→大青龍湯） | `formula.da_qing_long_tang.derived_from` 應鏡射 `formula.ma_huang_tang.formula_family` 裡指向本方的那一條 | `scripts/link-formula-family-back.js` 應已處理此鏡射，但顯然對這一組沒有生效或是之後新增的 `formula_family` 沒有重跑；建議值即為 `formula.ma_huang_tang.formula_family[0]` 的鏡射版本 | **HIGH，待 Ting/腳本重跑**（不是逐欄手填問題，應該重跑 `link-formula-family-back.js`，不適合放進逐欄帳本） |
| 23 | `applications_zh` | `[]` | 內容缺口 | — | 待補 | MED |

`formula_family`/`derived_from` 全庫量測：94 條帶 `formula_id` 的 `formula_family` 條目裡，**33 條**沒有對應的鏡射 `derived_from`；扣掉目標方尚未建卡（模板明訂「只報告不建立」，非缺陷）的部分，仍有至少 6 組目標方**確實存在**於方劑庫卻沒鏡射（`ma_huang_tang→da_qing_long_tang`、`yin_qiao_san→sang_ju_yin`、`ren_shen_bai_du_san→jing_fang_bai_du_san`、`huang_lian_jie_du_tang→xie_xin_tang`、`da_cheng_qi_tang→`3個目标、`xiao_chai_hu_tang→chai_hu_gui_zhi_tang`）。**附帶發現**（超出本次 20 卡範圍，僅供留意）：`formula.dao_chi_san` 與 `formula.long_dan_xie_gan_tang` 的 `formula_family` 各有一條**指向自己**的自我循環條目，明顯是資料錯誤，建議另開任務查證。

### formula.dan_shen_yin（丹參飲）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 24 | `composition[0]`（丹參，君藥）`in_formula_zh`/`actions_zh`/`role_reason_zh` | 「補血養血，緩急止痛。」 | (h) 明顯醫學錯誤：丹參在本方（乃至其自身藥物分類）是**活血化瘀藥**，不是補血藥，這是方向相反的錯誤，不是用詞不精確 | 「活血化瘀，緩急止痛。」 | 同記錄 `in_formula_en`：「Invigorates/nourishes Blood, **dispels Stasis** and relieves pain.」明確包含活血化瘀；同記錄 `exam_pearl`：「丹參（君，重用一兩，**專活血化瘀**）」；`herb.dan_shen` 自身 `category`＝「活血化瘀藥 / Invigorate Blood」（非補血藥）——三處互證 | **HIGH**（已進帳本，三個欄位） |
| 25 | `applications_zh` | `[]` | 內容缺口 | — | 待補 | MED |

本方全方只有 3 味藥、丹參是唯一君藥，這條錯誤直接影響整方的核心機轉敘述（把「氣滯血瘀」的治療方向寫成「血虛」），嚴重度定 HIGH。

### formula.dang_gui_shao_yao_san（當歸芍藥散）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 26 | `category`/`tier` 缺失 | 同大青龍湯，畫面顯示「分類：待補」「學習層級：draft」，`category_zh:"理血劑"` 存在 | 同 #19/#20 渲染器 fallback | — | 見全庫 10 方/107 方清單 | MED |
| 27 | `applications_zh` | `[]` | 內容缺口 | — | 待補 | MED |

`composition` 裡澤瀉 `in_formula_zh`＝「利水滲濕，泄熱清相火」——「泄熱清相火」在本方（肝脾不和、血水互結，非熱證為主）語境突兀，疑似同一種「本方功效＝藥材自身通用功效庫」樣板現象的另一例（凡是澤瀉出現的方都可能帶到這句），未單獨列為新缺陷類型，併入跨卡系統性量測。

### formula.dang_gui_yin_zi（當歸飲子）

| # | 欄位 | 現值 | 問題類別 | 建議值 | 建議值來源 | 嚴重度 |
|---|---|---|---|---|---|---|
| 28 | `category`/`tier` 缺失 | 同上，`category_zh:"治風劑"` 存在，畫面顯示「待補」「draft」 | 同 #19/#20 | — | — | MED |
| 29 | `applications_zh` | `[]` | 內容缺口 | — | 待補 | MED |

`composition` 裡黃耆 `in_formula_zh`＝「補氣升陽，固表止汗，托毒生肌，利水消腫」（黃耆自己卡片 `functions_zh` 的逐字複製）、何首烏 `in_formula_zh`＝「補益，補血養血」（籠統），皆屬同一種樣板現象，不重複列為獨立缺陷。

### formula.ding_zhi_wan（定志丸）

無新增高嚴重度問題。`composition` 裡石菖蒲 `in_formula_zh`＝「化痰降逆」漏掉「開竅」（石菖蒲本身歸類開竅藥，且英文 `in_formula_en` 有寫「Opens Orifices」），屬同一種樣板/簡化現象。`applications_zh` 同樣是 `[]`。

### formula.du_qi_wan（都氣丸）

無新增問題，君臣佐使結構（六味地黃丸加五味子）敘述正確，`applications_zh` 為 `[]`（跨卡缺口）。

---

## 3. 問題總表（按嚴重度）

| 嚴重度 | 件數 | 類別分布 |
|---|---|---|
| **HIGH** | 10 | (a) 歸屬/多欄污染 2 件（黃芩配白朮句尾污染 #14、大建中湯 exam_pearl vs 組成矛盾 #17）；(d) 中英錯位 1 件（小建中湯禁忌 #3）；(h) 醫學方向錯 3 件（黃耆歸經 #1、丹參本方功效 #24、大青龍湯麻黃本方功效 #21）；(f) 劑量缺口但有查證數字未接線 1 件（黃芩 #8）；(e) 反向連結缺失 1 件（大青龍湯→derived_from #22）；必填欄位全空 1 件（補肺湯禁忌/注意 #15）；(b)/(d) 混合重複+錯位 1 件（小建中湯注意事項與禁忌重複 #4） |
| **MED** | 20 | 內容缺口 `applications_zh` 10 件（10 張目標方全數為空，逐卡見 §2）；渲染器 fallback（分類/學習層級）4 件（大青龍湯 2 件 #19/#20、當歸芍藥散 1 件 #26、當歸飲子 1 件 #28，分別代表全庫 10/223、107/223 的系統性缺口）；黃芩其餘內容缺口 5 件（exam_importance/pearl #7、condition_tags #9、indications_zh 未結構化 #10、functions_zh 未整理 #11、歸經來源不確定 #13）；人參歸經來源不確定 1 件（本節內文，未編號） |
| **LOW** | 2 | 藥對缺中文對照（甘草配滑石 #6）1 件；缺拉丁藥名（黃芩 #12）1 件 |
| **總計** | 32 | — |

**帳本條目數**：5 筆（`scratchpad/ledger_pkgD.json`，涵蓋 3 張卡的 5 個欄位；其餘全部「待 Ting」，理由詳見各筆備註，主要是需要臨床判斷或需要重跑腳本/改渲染器，不是可以直接照抄來源落地的欄位）。

---

## 4. D29 量測（`herb.related_formulas` 語意，對照 D26/D29 裁定）

裁定回顧：D29（`related_formulas` 語意裁定）明訂 `herb.related_formulas` 是**策展研讀連結**，不是 `formula.composition` 的反向索引，因此第 4 項數字**不是缺陷**，只是量測。

| # | 量測 | 數字 | 重現指令 |
|---|---|---|---|
| 1 | `related_formulas` 邊總數（全部 366 味藥材） | **1703** | `node <load-knowledge.js 沙箱載入 data/generated/*.js> ` 加總 `herbs.records[].related_formulas.length`（見附錄 `d29-measure.js`） |
| 2a | 邊指向的 `formula_id` 在 `formulas.records` 裡查無記錄的邊數 | **0** | 同上腳本，對每個 `related_formulas` id 查 `formulaById.has(id)` |
| 2b | 邊指向的記錄 `review_status === "deprecated"` 的邊數 | **0** | 同上腳本，查目標記錄的 `review_status` |
| 3 | 畫面按鈕標題不是中文名（`formulaLabel()` 回退成 id 美化字串或拼音/英文，而不是真正 `name_zh`）的邊數 | **0**（其中：完全查無記錄的純 id 美化 0，記錄存在但 `name_zh` 空白退回拼音/英文 0） | 同上腳本，重現 `js/knowledge.js` 的 `formulaLabel()` 判斷邏輯（`displayLabel(record.name_zh, record.pinyin||record.name_en, id)`），並用瀏覽器實測 3 張卡（`huang_qi`、`gan_cao`、`ren_shen` 的「相關經典方劑」按鈕）目視核對，全部顯示正確的「中文名 · 拼音」雙語標籤，無 id 洩漏 |
| 4 | 有幾味藥的 `related_formulas` 集合 **恰好等於**「所有 `composition` 含這味藥的方」集合（疑似機器反向，非缺陷，D29 已裁定策展連結可以包含組成方） | **60**（分母：兩集合至少一個非空的藥材數 315 / 全庫藥材 366） | 同上腳本，對每味藥建立 `composition[].herb_id` 反向索引集合，與 `related_formulas` 集合做 `setEqual` 比對 |

D29 前次量測（DECISIONS.md D29 段落）記錄「1,703 條邊，id 解析 0 錯」，本次重新量測**數字一致**（1703 / 0 / 0），確認 D29 裁定後兩欄未被重新生成，且畫面按鈕（`relationButton()`）目前對懸空與退役目標都有正確的視覺區分機制（`is-missing` chip + 「尚未建卡」標籤）——只是本次抽樣的 366 味藥材沒有任何一條邊踩中這個機制，樣本裡看不到它實際發動的畫面。

---

## 5. 驗證器盲區（跑過的三支 + 本次抓到但驗證器沒抓到的）

跑法與最後幾行輸出：

```
node scripts/validate-content-junk.js
→ EXIT 0；PASS（8 個既有控制字元/1 組跨 33 方共用食療劑量子句列為 WARN，不影響本次 20 卡）

node scripts/validate-herb-standard.js
→ EXIT 0；PASS — no structural defects.
  366 筆；action curation 統計：48 筆 0-1 條（列不足）、75 筆 >6 條（原始倒貨，含黃芩）、243 筆落在 2-6 條合理區間。

node scripts/validate-formula-standard.js
→ EXIT 0；PASS — no blocking defects.
  223 方（217 template-grade）；中英未對齊 55/223（只查陣列長度，見下方盲區 1）；方劑家族 44/223；缺方劑家族的 formula worklist 有列出，但不檢查 formula_family→derived_from 的鏡射完整性。
```

**本次抓到、三支驗證器都沒抓到的類別**：

1. **中英陣列「長度相等但內容錯位」不會被判定為未對齊。** `validate-formula-standard.js` 的「中英未對齊」只比較 `.length`；小建中湯 `contraindications_zh`/`_en` 各 3 條、長度相等但逐項配對整組錯位（見 §2 表 3），完全沒有出現在該驗證器的 `--worklist` 輸出裡（用 `node scripts/validate-formula-standard.js --worklist | grep 小建中`確認查無此筆）。
2. **`contraindications_zh` 與 `cautions_zh` 逐字重複不受檢查。** 沒有任何驗證器比對這兩欄是否有重疊句子；本次量測全庫 223 方裡 **64 方（29%）** 兩欄有逐字相同的句子（源頭同一批 2026-08-29 A1(a) 遷移的 `needs_review` 未結案項），驗證器全部視為正常。
3. **`composition[].in_formula_zh`（本方功效／方劑分析）完全沒有驗證器檢查。** `grep -rn "in_formula_zh\|role_reason_zh" scripts/validate-formula-standard.js scripts/validate-content-junk.js` 兩支都是 0 命中。這欄是 `FORMULA_CARD_TEMPLATE.md` 明訂的「這張卡最重要的新設計」之一（本方功效 ≠ 藥材自身功效），但全庫量測：**126 組「藥材+文字」組合被逐字複製到 2 張以上不同的方**，其中炙甘草的同一句「補中益氣，緩急止痛，調和諸藥。」被 **56 個不同的方**原封不動共用；167 筆 composition 列的 `in_formula_zh` 與該藥材自己卡片的 `functions_zh` 幾乎完全相同（等同把「這味藥能做什麼」複製貼上當成「這味藥在這個方裡做什麼」，模板明文禁止互相取代）。屬於系統性（b）樣板句，且是「方劑分析」這個賣點欄位本身的空心化，建議另立任務，逐方需要臨床改寫，不是逐欄搬移可以解決。
4. **`category` / `tier` 的畫面 fallback 缺口不是資料驗證器的檢查範圍（它們是程式碼問題），但也沒有任何機制標記「這張卡的畫面顯示會跟資料不一致」。** 223 方裡 10 方「有 `category_zh` 卻顯示分類待補」、107 方「無 `tier` 卻顯示學習層級 draft」，兩者都是 `js/knowledge.js` 的 fallback 鏈序問題（`category` 優先於 `category_zh`；`tier` 缺省值恰好是 `"draft"` 這個看起來很像正常值的字串），資料驗證器檢查資料本身沒有問題（`category_zh` 內容正確），所以全部 PASS，但畫面說謊。
5. **`channels_entered` vs `channels_zh`（歸經）矛盾同上，也是程式碼 fallback 問題，資料驗證器不檢查兩個欄位彼此是否一致。** 168/282 有落差，其中黃耆一例造成畫面自相矛盾（HIGH），其餘多數落差不會在畫面上互相打架（因為兩處剛好都回退到同一個未經來源核實的欄位），但等於整批藥材的「歸經」顯示值，有一部分繞過了已標來源的 `channels_zh`。

---

## 6. 已知未解 / 待 Ting 清單

1. 小建中湯 `cautions_zh`/`cautions_en` 與 `contraindications_zh`/`_en` 的重複句該歸哪一欄（絕對禁忌 vs 相對注意）——需要臨床判斷，且是全庫 64 方共通的問題，建議整批一次裁定分類原則，不要逐方裁。
2. 黃芩 `dosage_g.standard_daily_g` 缺口——渲染器刻意不接 `record.dosage`，卡在 `docs/TING_DECISION_QUEUE.md B3` 劑量欄形狀公約未結案；本次只是又找到一個受影響的具體病例（黃芩），沒有新增判斷。
3. 大青龍湯（以及全庫其他方）composition `in_formula_zh` 的系統性樣板問題——規模大（126 組合、最高 56 方共用一句），建議另立批次，不建議塞進本次帳本逐條處理。
4. `formula_family`→`derived_from` 反向鏡射缺口（33/94，其中至少 6 組目標方存在卻沒鏡射）——懷疑是 `scripts/link-formula-family-back.js` 需要針對新增的 `formula_family` 條目重跑；`formula.dao_chi_san`、`formula.long_dan_xie_gan_tang` 的自我循環 `formula_family` 條目需要另外查證清除（超出本次 20 卡範圍，附帶回報）。
5. `category`/`tier` 畫面 fallback 問題（10/223、107/223）——建議 `js/knowledge.js` 補上 `|| record.category_zh` 與更誠實的 tier 缺省值（例如空字串或「未分級」而非字面 `"draft"`），但這是程式碼修改，不在本次審讀的資料權限內，只回報現象與範圍。
6. `channels_entered`（來源標記僅「Bensky Materia Medica: `<分類>`」、無逐欄 `field_sources`）在 366 味藥材中的可信度問題——這批欄位看起來是同一次批次匯入時，用課本的**章節分類**（不是逐味藥材查證）帶出的通用歸經猜測，建議整批核對後決定去留，不是本次能單張卡片處理完的規模。

---

## 附錄：量測用腳本片段（供重現，未寫回任何 data/** 檔案）

`select-herbs.js`（挑選連結數前 9 味）：
```js
const herbs = (K.herbs && K.herbs.records) || [];
const withCounts = herbs.filter(h => h.id !== 'herb.huang_qi')
  .map(h => ({ id: h.id, count: (h.related_formulas||[]).length }))
  .sort((a, b) => b.count - a.count);
```

`d29-measure.js`（D29 四個數字，核心邏輯）：
```js
const formulaById = new Map(formulas.map(f => [f.id, f]));
let totalEdges = 0, unresolved = 0, deprecatedTarget = 0;
herbs.forEach(h => (h.related_formulas||[]).forEach(fid => {
  totalEdges++;
  const f = formulaById.get(fid);
  if (!f) unresolved++; else if (f.review_status === 'deprecated') deprecatedTarget++;
}));
// (4) 機器反向量測：composition 反向索引 vs related_formulas 集合是否相等
```

`channels-mismatch.js`（歸經欄位落差量測）：
```js
herbs.forEach(h => {
  const ce = h.channels_entered, cz = h.channels_zh;
  if (ce?.length && cz?.length && JSON.stringify(ce) !== JSON.stringify(cz)) mismatched++;
});
```

`check-boilerplate-in-formula.js`（本方功效樣板量測）：
```js
formulas.forEach(f => (f.composition||[]).forEach(c => {
  const key = c.herb_id + '||' + (c.in_formula_zh||'').trim();
  textUsage.set(key, [...(textUsage.get(key)||[]), f.id]);
}));
const reused = [...textUsage.entries()].filter(([k, v]) => new Set(v).size >= 2);
```
