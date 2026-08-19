# 分支評估：`origin/pattern-v2-implementation` vs 整合線 `origin/codex/pattern-v2`

READ-ONLY 評估。未合併、未改任何 `data/**`、`app.js`、`scripts/**`。
本檔是這次派工唯一寫入的檔案。

| 項目 | 值 |
|---|---|
| 整合線 tip | `7d69dd68` 2026-08-12 `PROJECT_LOG: defect-reckoning day…` |
| 目標分支 tip | `c3c38cf6` 2026-08-11 `Archive research pack provenance (NOT CANONICAL)…` |
| merge-base | `197b423d` 2026-08-09 `Outcome metrics semantic audit v2…` |
| 目標領先 | 25 commits |
| 整合線領先 | 419 commits |
| 評估分支 | `codex/assess-pv2impl`（自 `origin/codex/pattern-v2` 建立，未 push） |

> 評估期間 `origin/codex/pattern-v2` 前進到 `d5d014e3`（+3 commits：
> `ab7e8fbe` DECISIONS D17、`ef029d86` landing audit、`d5d014e3` merge）。
> `git diff --name-only 7d69dd68 d5d014e3` = `DECISIONS.md` + `docs/LANDING_AUDIT_2026-08-12_OPUS.md`
> 兩個檔，與本評估涉及的 `data/pharmacology/**`、`js/**`、`scripts/**` 零重疊，
> 下列所有數字不受影響。

## 0. 一句話結論

目標分支的藥理成果**已經在 2026-08-11 由 `c27ced73` 整批吸收進整合線**（squash 式採納，
所以 `git cherry` 偵測不到 patch-id 相等，不可用 `git cherry` 當作「未被吸收」的證據）。
之後整合線又做了 4 批 DailyMed 補值、1 次來源整肅、19 張門診高頻藥卡。
**drug id 層級：目標分支 40 筆 id 全部是整合線 59 筆的子集，沒有任何一筆是整合線沒有的；
且逐筆比對，整合線的 record 欄位數與位元組數全部大於等於目標分支。**

真正還有價值的只有 4 樣東西，全部不在藥理資料裡：
`docs/PHARM_CARD_TEMPLATE.md` 的 §B–G 擴充、`js/knowledge.js` 的西藥 Big Card modal
(~348 行)、`styles.css` 的 `.k-pharm-card` 兩行、以及一份需要 Ting 裁決的 curriculum 研究包。

---

## 1. Commit inventory（25 筆，舊→新）

「實際改了什麼」由 diff 讀出，不採信 subject。
`c27ced73` = 整合線 2026-08-11 的整批採納 commit（下表簡稱「已被 c27ced73 吸收」）。

| # | commit | 動到的檔（排除 curriculum） | 實際改了什麼 |
|---|---|---|---|
| 1 | `2190df43` | `js/router.js` | `WORKSPACES` 陣列加入 `"pharm"` 一個字串 |
| 2 | `d612541c` | `PROJECT_LOG.md` | 只有 log 文字 |
| 3 | `18109e93` | `js/knowledge.js`, `styles.css` | 初版西藥清單/卡片 renderer + 篩選；`styles.css` 加 `.k-pharm-card { border-left: 3px solid #6366f1; }` |
| 4 | `f2009466` | `PROJECT_LOG.md` | 只有 log 文字 |
| 5 | `365c072f` | `drugs.json` `drug_classes.json` `drug_targets.json` `staging_v7_ingestion.json`(A) `knowledge_data.js` | 首批 7 筆藥（warfarin/apixaban/clopidogrel/aspirin/enoxaparin/losartan/hydrochlorothiazide）+ staging ledger 建檔 |
| 6 | `f44450e2` | `staging_v7_ingestion.json` | 只改 staging ledger，不動 canonical |
| 7 | `fecfc0af` | `staging_v7_ingestion.json` | 把 staging 條目改成 1:1 原子化 bullet + source flag |
| 8 | `ee4b47a8` | `staging…json`, `scripts/audit-atomic-ledger.js`(A), `scripts/build-atomic-ledger.js`(A) | 建 provenance ledger 產生器與稽核器 |
| 9 | `224ef6b4` | `staging…json`, 上兩支 script, `scripts/verify-source-coverage.js`(A) | 加 source→ledger 覆蓋率驗證器（硬編 15 個 drug id） |
| 10 | `59fd2211` | `v7_source_manifest.json`(A), 3 支 script | manifest SHA-256 + content-hash 穩定 ID + drift 防護 |
| 11 | `50f5712f` | 4 個 data 檔, 2 支 script, `scripts/test-source-drift-simulation.js`(A) | 第 2 批 8 筆藥（rivaroxaban/lisinopril/metoprolol/amlodipine/atorvastatin/digoxin/furosemide/spironolactone） |
| 12 | `d231b2ce` | `drugs.json` `drug_classes.json` `knowledge_data.js` | metoprolol 產品專一性註記、補 DailyMed 標題、beta1 分類調整 |
| 13 | `fc4c029e` | `drugs.json` `staging…` `dailymed_verified_labels_manifest.json`(A) `validate-pharm-standard.js` + 2 script | P0 安全欄位對齊 SPL section、舊 URL disposition 收斂 |
| 14 | `d88adb74` | `audit-atomic-ledger.js` `validate-pharm-standard.js` | 三閘門稽核報告格式 |
| 15 | `2a986f82` | `drugs.json` `drug_classes.json` `js/knowledge.js` `knowledge_data.js` | **Big Card / Class Big Card schema 與 renderer 框架**（knowledge.js 的主要新增） |
| 16 | `ce5fb3e3` | `js/knowledge.js` `validate-pharm-standard.js` | UI 篩選器改用 `drugclass_id` 解析 canonical 名；解析不到就印 `[DATA INTEGRITY DEFECT]` |
| 17 | `2cdc498b` | 3 個 data 檔, `docs/PHARM_CARD_TEMPLATE.md`, `js/knowledge.js`, `validate-pharm-standard.js` | foundation graph validator + 模板第一波擴充 |
| 18 | `4007e0fa` | 5 個 data 檔 | Bastyr W1-2 priority pack：12 張藥卡 + 12 張 class 卡 |
| 19 | `1e154b72` | `drugs.json` `drug_classes.json` `scripts/test-pharm-negative-cases.js`(A) `validate-pharm-standard.js` | 官方來源閘門、`field_sources`、`verification_status`、負面測試套件 |
| 20 | `4d760d44` | `dailymed_api_responses.json`(A) `drugs.json` `test-pharm-source-integrity-negative-cases.js`(A) `validate-pharm-standard.js` | 用真實 NLM DailyMed API 回應取代先前來源 |
| 21 | `b7a8917c` | 4 個 data 檔 + 2 支 script | DailyMed evidence schema 擴充、來源整肅 |
| 22 | `5b4e9f80` | `medlineplus_verified_links.json`(A) 等 5 個 data 檔, `docs/PHARM_CARD_TEMPLATE.md`, `js/knowledge.js`, 2 支 script | MedlinePlus 逐筆核驗連結 + Big Card 外部資源區塊 |
| 23 | `7108ce73` | `drugs.json` `medlineplus_verified_links.json` `docs/PHARM_CARD_TEMPLATE.md` `js/knowledge.js` 2 支 script | MedlinePlus scope 規則（`verified_none` 定義）與 QA |
| 24 | `1cd00287` | 6 個 data 檔 | 再 7 筆藥的 priority pack batch 1（subject 說「ingest」，實際是把既有 40 筆補欄位＋新增少量） |
| 25 | `c3c38cf6` | **只有 `curriculum/**`**，68 個 md/json，約 28k 行 | Pattern V2 Batch02-10 handoff pack + Disease Knowledge CLEAN V2 pack 歸檔。自稱 NOT CANONICAL |

（A）= 新增檔。

---

## 2. Supersession 分析 — drug id 層級

方法：把三個 revision 的 `data/pharmacology/drugs.json` 取出逐筆比對
（`records[].id` 為鍵），不看檔案層 diff。

### 2.1 id 集合

| 集合 | 筆數 |
|---|---|
| merge-base `197b423` | 15 |
| 目標分支 `pattern-v2-implementation` | 40 |
| 整合線 `codex/pattern-v2` | 59 |
| 目標新增而整合線也有（NEW-IN-BOTH） | **25** |
| **目標有、整合線沒有** | **0** |
| 整合線有、目標沒有 | **19** |

那 19 筆正是任務描述裡的門診高頻藥卡，來自整合線 `95d70ddd`
「Dry Clinic #5: 19 drug cards, clinic-frequency (fertility/sleep/pain/GI)」：

```
drug.letrozole drug.clomiphene drug.metformin drug.progesterone drug.estradiol
drug.zolpidem drug.lorazepam drug.alprazolam drug.sertraline drug.escitalopram
drug.trazodone drug.ibuprofen drug.naproxen drug.acetaminophen
drug.cyclobenzaprine drug.celecoxib drug.omeprazole drug.pantoprazole drug.ondansetron
```

**結論：目標分支沒有任何一個 drug id 是整合線缺的。**

### 2.2 同 id 的內容衝突方向

40 筆共有 id 逐筆序列化比對，**40 筆全部 DIFFERS**，但方向是一致的：

- **目標分支有、整合線沒有的欄位鍵：0 個。**（跨 40 筆 record 掃描，一個都沒有）
- 整合線有、目標沒有的欄位鍵（鍵：出現在幾筆 record）：
  `physiologic_effect_en/zh` 38、`site_of_action_en/zh` 36、`updated_at` 18、
  `adverse_effects_zh` 15、`adverse_effects_en` 14、`mechanism_en/zh` 8、
  `indications_en/zh` 5、`contraindications_en/zh` 4、
  `dailymed_label_format` 2、`supersedes_setid` 1、`setid_fix_note` 1、`dailymed_fetched_at` 1
- `field_sources` 條目數：整合線較多 38 筆、相等 2 筆、**目標較多 0 筆**
- 位元組數：25 筆 NEW-IN-BOTH 全部整合線 > 目標
  （例 `drug.amlodipine` 3031B vs 1935B；`drug.digoxin` 3070B vs 1874B）；
  15 筆 base-era id 也全部整合線 ≥ 目標（例 `drug.heparin` 5644B vs 2671B）

換句話說：**同 id 取目標分支的版本 = 用短的覆蓋長的**，直接違反憲法紅線二.3。

### 2.3 來源標準：同一套 DailyMed，但整合線的錨點更精確

兩邊都是 DailyMed SPL 為骨幹、MedlinePlus 為病人閱讀層，**不是兩套不同標準**。
差別在錨點粒度。`drug_interactions_graded` 有 9 筆內容不同，文字完全一樣，
差在 source anchor：

| id | 整合線 anchor | 目標分支 anchor |
|---|---|---|
| `drug.albuterol` | `…#PRECAUTIONS` | `…#WARNINGS_AND_PRECAUTIONS` |
| `drug.phenelzine` | `…#DRUG_INTERACTIONS` | `…#WARNINGS_AND_PRECAUTIONS` |
| `drug.carbamazepine` | `…#DRUG_INTERACTIONS` | `…#WARNINGS_AND_PRECAUTIONS` |

整合線 `fce078b3` 把 69 個錨點重新對到「該標籤上實際存在的 section」。取目標版本 = 把
錨點退回粗粒度。

### 2.4 最嚴重的一筆：`drug.mannitol` 抓錯藥

| | setid | 標籤標題 |
|---|---|---|
| 整合線 | `0d914965-…` | `OSMITROL (MANNITOL) INJECTION, SOLUTION [BAXTER HEALTHCARE COMPANY]` |
| 目標分支 | `5b44e248-…` | `SORBITOL-MANNITOL (SORBITOL AND MANNITOL) IRRIGANT [ICU MEDICAL INC.]` |

整合線 `fce078b3`（Ting 核可）已修正並留下 `supersedes_setid` + `setid_fix_note`：
舊 setid 指向「泌尿科灌洗液」標籤，標籤首行寫 NOT FOR INJECTION BY USUAL PARENTERAL
ROUTES / FOR UROLOGIC IRRIGATION ONLY，與本卡要教的靜脈滲透性利尿劑不是同一個臨床角色。
**合併目標分支的 `drugs.json` 會把這個錯誤來源重新掛回去。**
`drug.hydrochlorothiazide` 同理（目標的 setid `b7c9e05f…` 其 SPL XML 端點 404，整合線已換）。

### 2.5 其他藥理資料檔（同樣方法，逐 record id）

| 檔案 | 整合線 n | 目標 n | 目標有而整合線無 | 目標 record 較大 |
|---|---|---|---|---|
| `drug_classes.json` | 48 | 33 | 0 | 0 |
| `drug_targets.json` | 38 | 29 | 0 | 0 |
| `drug_systems.json` | 7 | 5 | 0 | 0 |
| `medlineplus_verified_links.json` | 40 | 40 | 0 | 0（逐筆相同） |
| `dailymed_verified_labels_manifest.json` | 52 | 33 | 0 | 0 |
| `v7_source_manifest.json` | 3 | 3 | 0 | 0（逐筆相同） |
| `staging_v7_ingestion.json` | 280 | 280 | 0 | 0（逐筆相同） |
| `dailymed_api_responses.json` | 59 | 40 | 0 | 0 |

**八個藥理資料檔，目標分支的獨有記錄數合計為 0。**

---

## 3. Regression risk

### 3.1 任務指定的指令與其陷阱

```
git diff origin/codex/pattern-v2...origin/pattern-v2-implementation --stat
→ 89 files changed, 44027 insertions(+), 263 deletions(-)
```

**這個數字會誤導決策。** 三點語法算的是 merge-base→目標，只顯示目標自己做了什麼，
完全看不到整合線這 419 個 commit 做了什麼。兩點（tip-to-tip）才是合併的真實面貌：

```
git diff origin/codex/pattern-v2 origin/pattern-v2-implementation --stat
→ 236 files changed, 6422 insertions(+), 230285 deletions(-)   （排除 curriculum）
```

那 230,285 行「刪除」全部是整合線這邊的資產（`js/avs.js`、`js/clinical-store.js`、
`data/supplements/supplements.json`、`data/symptoms/symptoms.json`、20 支 validator…）。
任何以「整體採納目標分支」為前提的操作都會碰到它們。

### 3.2 真實合併衝突（`git merge-tree --write-tree`，未寫入任何東西）

11 個檔案會衝突：

```
PROJECT_LOG.md                                        content
data/generated/knowledge_data.js                      content
data/pharmacology/dailymed_api_responses.json         add/add
data/pharmacology/dailymed_verified_labels_manifest.json  add/add
data/pharmacology/drug_classes.json                   content
data/pharmacology/drug_systems.json                   content
data/pharmacology/drug_targets.json                   content
data/pharmacology/drugs.json                          content
js/knowledge.js                                       content
js/router.js                                          content
scripts/validate-pharm-standard.js                    content
```

`add/add` 是因為整合線是用 squash commit `c27ced73` 獨立新增這些檔案的，兩邊沒有共同 blob
——**衝突解決時沒有 base 可參照，工具會傾向要人二選一，這正是「整檔選 theirs」最容易發生的情境。**

### 3.3 三大風險（照嚴重度排序）

**風險 1 — `js/knowledge.js`：會回退 `ce00e95` 那批 main-side UI 修復。**
tip-to-tip 472 插入 / 131 刪除。取目標版本會失去（`-` 側 = 整合線側）：

- `alreadyShown()` / `absorbedByModernIndex()` 80% 去重 helper（`74c63a2c` / `8cafc2ac`）
- 方劑「現代應用」的 **English-only gate**：整合線是 `if (app.length || (appEn.length && !absorbed…))`，
  目標是 `if (app.length)` —— 8 個方有 `applications_en` 而無 `applications_zh`，
  退回後那些英文就是隱形英文，看不見
- 同理「現代藥理」：整合線 `if (res.length || resEn.length)` vs 目標 `if (res.length)`
- `adSyndromesBlock`（American Dragon 證型，`74c63a2c` 明確恢復的 10 個方的差異內容）
- 核心分頁的 **方劑群組 Comparison group** section
- 臨床分頁的 **相關病名與證型** section 與 `formulaModernSection(record)` 呼叫
- 西藥卡的 `作用標的`、`mnemonic`、`gap_note_zh` 誠實缺口提示、`查看西藥卡` 按鈕
- `classLabelOf` 回傳「中文 / English」合併字串的修法（整合線註解明寫：回傳 `modeText()`
  會讓 chip 語言凍結在 render 當下）—— 目標的 `pharmClassName` 正是用 `modeText()`

記憶裡「merges clobber knowledge.js」這條，在這裡是可預測的、不是機率問題。

**風險 2 — `scripts/validate-pharm-standard.js`：會回退 metformin 誤判修正。**
tip-to-tip 只差 3 行，方向是整合線較新：

```js
// 整合線（正確）
const forbiddenExtra = ['metformin', 'rosiglitazone', 'glimepiride', 'benazepril', 'irbesartan']
  .filter((f) => !expectedTokens.includes(f));
// 目標（會讓 drug.metformin 自己的卡永遠過不了 strict ingredient match）
const forbiddenExtra = ['metformin', 'rosiglitazone', 'glimepiride', 'benazepril', 'irbesartan'];
```

整合線已經有 `drug.metformin`（19 張門診卡之一），目標分支沒有——所以這個 bug 在目標分支
上不會觸發，但合併後會立刻把整合線的 metformin 卡打成 FAIL。

**風險 3 — `js/router.js`：會刪掉 `patients` workspace。**

```js
// 整合線
const WORKSPACES = [... "cases", "patients", "quality", "sources"];
// 目標
const WORKSPACES = [... "cases", "quality", "sources"];
```

目標分支的 `2190df43` 只是加 `"pharm"`，而 `"pharm"` 整合線早就有了
（`c27ced73` 同時採納了 router 那一行）。取目標版本 = 淨損失一個 workspace。

**`app.js`：三方合併下安全，但只在三方合併下安全。**
`app.js` tip-to-tip 差 2986 行，但那全部是整合線側的變更——目標分支自 merge-base 以來
**沒有動過 `app.js`**，所以標準 `git merge` 不會列為衝突、整合線版本自動勝出。
危險只存在於 `-X theirs`、`checkout --theirs`、或 bundle/整包還原式的操作。
`index.html`、`styles.css` 主體、`data/**` 其餘各線同理。

**Workflow 檔：兩邊都沒動 `.github/workflows/validate.yml` 的合併風險**
（目標分支對 `.github/` 零變更）。但要注意：該 workflow **沒有跑任何 pharm 驗證器**
（`node scripts/` 共 27 行，無 `validate-pharm-standard.js`、無兩支 pharm 測試）。
下面第 5 節的驗證必須手跑，CI 不會擋。

---

## 4. Verdict 逐 commit

| # | commit | 判定 | 證據 |
|---|---|---|---|
| 1 | `2190df43` router pharm | **SUPERSEDED** | `c27ced73` 已把 `js/router.js` 那一行帶進整合線；取目標版反而刪 `patients` |
| 2 | `d612541c` log | **DROP** | 只有 `PROJECT_LOG.md` 文字；整合線 log 自 3947 行起已記錄本分支調查與採納 |
| 3 | `18109e93` renderer + css | **部分 TAKE（僅 css 兩行）** | `styles.css` 的 `.k-pharm-card` 在整合線 `grep` 為 0 筆——整合線 `js/knowledge.js` 用了 `k-pharm-card`/`k-pharm-gap` 但無對應樣式。renderer 部分 SUPERSEDED |
| 4 | `f2009466` log | **DROP** | 同 #2 |
| 5 | `365c072f` pilot 7 藥 | **SUPERSEDED** | 7 個 id 全在整合線，且整合線 record 全部較大（§2.2） |
| 6 | `f44450e2` staging 修正 | **SUPERSEDED** | `staging_v7_ingestion.json` 280 筆逐筆與整合線相同 |
| 7 | `fecfc0af` staging 語意 | **SUPERSEDED** | 同上 |
| 8 | `ee4b47a8` ledger 產生/稽核 | **DROP** | 見 §4.1，稽核器在缺來源檔時仍輸出覆蓋率通過 |
| 9 | `224ef6b4` coverage verifier | **DROP** | 見 §4.1，依賴未入庫的 `curriculum/pharm/v7_extracted/`，硬編 15 個 drug id |
| 10 | `59fd2211` manifest hash | **SUPERSEDED** | `v7_source_manifest.json` 3 筆逐筆與整合線相同 |
| 11 | `50f5712f` batch 2 (8 藥) | **SUPERSEDED** | 8 個 id 全在整合線且較大 |
| 12 | `d231b2ce` metoprolol/beta1 | **SUPERSEDED** | 整合線 `drug.metoprolol` 58 keys / 5876B vs 目標 53 keys / 4938B |
| 13 | `fc4c029e` P0 section 對齊 | **SUPERSEDED（且已被更好的取代）** | 整合線 `fce078b3` 重新對錨 69 個 field/interaction anchor |
| 14 | `d88adb74` 三閘門報告 | **DROP** | 報告格式屬 #8 的稽核器；`validate-pharm-standard.js` 那一半已在整合線 733 行版內 |
| 15 | `2a986f82` Big Card renderer | **CONFLICTS-NEEDS-RULING** | 見 §4.2：整合線缺這功能且按鈕是死的，但要 port 不是 merge |
| 16 | `ce5fb3e3` class label 解析 | **SUPERSEDED（整合線做法更好）** | 整合線 `classLabelOf` 回傳「中文 / English」合併字串並附註解說明 `modeText()` 會凍結語言 |
| 17 | `2cdc498b` graph validator + 模板 | **部分 TAKE（僅模板）** | validator 已在整合線 733 行版；模板部分見 #22/#23 |
| 18 | `4007e0fa` priority pack 12+12 | **SUPERSEDED** | class 48 vs 33、target 38 vs 29、system 7 vs 5，目標獨有 0 |
| 19 | `1e154b72` 安全閘門 + 負面測試 | **SUPERSEDED** | `scripts/test-pharm-negative-cases.js` 已在整合線；本地實跑 5/5 通過 |
| 20 | `4d760d44` 真實 API 證據 | **SUPERSEDED** | `dailymed_api_responses.json` 整合線 59 筆、目標 40 筆，40 筆全部整合線較大 |
| 21 | `b7a8917c` 來源整肅 | **SUPERSEDED** | 同上；整合線另有 `refresh-dailymed-evidence.js` 重抓全部 40 張標籤 |
| 22 | `5b4e9f80` MedlinePlus 連結 + UX | **部分 TAKE（模板）／SUPERSEDED（資料）** | `medlineplus_verified_links.json` 40 筆逐筆相同；模板部分見 §4.3 |
| 23 | `7108ce73` MedlinePlus scope QA | **TAKE（模板）** | §4.3：整合線 `test-pharm-source-integrity-negative-cases.js` Test 10 現在 FAIL，就是缺這段模板 |
| 24 | `1cd00287` priority pack batch 1 | **SUPERSEDED** | 6 個 data 檔全部目標獨有 0 |
| 25 | `c3c38cf6` curriculum 研究包 | **CONFLICTS-NEEDS-RULING** | 68 個檔在整合線是 0 筆（真的獨有），但落在 `curriculum/**` = Ting 的路徑，憲法一「AI 只讀」；commit 自稱 NOT CANONICAL |

彙總：**TAKE 1（模板）／部分 TAKE 3（css 兩行、模板兩段）／SUPERSEDED 16／
CONFLICTS-NEEDS-RULING 2／DROP 4。**

### 4.1 為什麼 #8 / #9 / #14 判 DROP（實跑證據）

四支 script 是同一個 cluster，全部 `require('./verify-source-coverage')`，
而它讀的是**未入庫**的來源檔：

```
git ls-tree -r origin/codex/pattern-v2         curriculum/pharm/v7_extracted/  → 0 檔
git ls-tree -r origin/pattern-v2-implementation curriculum/pharm/v7_extracted/ → 0 檔
```

在整合線 tree 實跑（read-only，未寫入任何檔）：

```
$ node …/verify-source-coverage.js
FATAL: Required source file missing locally: curriculum/pharm/v7_extracted/02_PHARM_BATCH_P1_ANTICOAG_ANTIPLATELET.md
FATAL: Verification failed! Reason: FILE_MISSING: …
TypeError: Cannot read properties of undefined (reading 'length')
    at …verify-source-coverage.js:307:26
```

——缺檔路徑不是乾淨退出，是 crash。更嚴重的是 `audit-atomic-ledger.js`：

```
$ node …/audit-atomic-ledger.js
FATAL: Required source file missing locally: …02_PHARM_BATCH_P1_ANTICOAG_ANTIPLATELET.md

--- GATE A: SOURCE -> LEDGER COVERAGE ---
280 extracted
280 matched
-1 missing
100.0% coverage
```

**來源檔不存在，Gate A 仍印出滿分覆蓋率，而且 missing 是負數。**
這是空跑假通過（`missing` 為 `-1` 表示計數式本身失效）。
把這種閘門帶進整合線，等於在 pharm 線放一個會說謊的儀表板。
第四支 `test-source-drift-simulation.js` 另有 side effect：它會
`renameSync` 真實的 `data/pharmacology/v7_source_manifest.json` 再寫入竄改版
——中途中斷會留下 `.bak`。本次評估**沒有執行**這一支。

### 4.2 為什麼 #15 判 CONFLICTS-NEEDS-RULING（不是 DROP）

整合線的西藥卡有一顆**死按鈕**：

```js
// js/knowledge.js:2012（整合線）
<button … data-detail-kind="pharm" data-detail-id="…">查看西藥卡</button>
// js/knowledge.js:1589-1596（整合線）
function openKnowledgeDetail(kind, id) {
  const record = kind === "formula" ? formulaById.get(id) : herbById.get(id);
  if (!record) return;   // kind==="pharm" 走 herbById，必為 undefined，直接 return
```

`openKnowledgeDetail` 只認 `formula` / `herb`。傳 `"pharm"` 會查 `herbById` → `undefined` → 靜默返回。
**整合線的「查看西藥卡」點了沒有反應。**

目標分支有可運作的 `openPharmBigCardModal`（整卡點擊）+ `openPharmClassModal`（藥族大卡），
約 348 行，是整合線真的缺的功能。而且架構相容：兩邊都用同一套
`.k-modal-overlay` + `.is-open` + `.k-big-card` 慣例（整合線的 pattern 大卡就是這樣開的，
`styles.css:4889-4984` 這些 class 都在）。

但目標版本的卡片 renderer 比整合線的差（丟掉作用標的、mnemonic、`gap_note_zh` 誠實缺口提示，
改用大量 inline style），所以**不能整檔取**。這是「移植 modal，不動 renderer」的工作，
要 Ting 決定要不要現在做、以及大卡要對齊哪一套視覺。

### 4.3 為什麼 #23（模板）是唯一乾淨的 TAKE

整合線現在跑 `scripts/test-pharm-source-integrity-negative-cases.js`：

```
✅ Test 5 … ✅ Test 9  PASS
❌ Test 10: Template verification enum == validator verification enum contract match  Actual: FAIL
SOME TESTS FAILED!
```

Test 10 讀 `docs/PHARM_CARD_TEMPLATE.md`，要求裡面同時出現
`unverified` / `machine_metadata_verified` / `human_reviewed`。
整合線模板這三個字串出現 **0 次**（`grep -c` = 0），目標分支模板有。
整合線的 `drugs.json` **資料裡已經在用** `verification_status: machine_metadata_verified`
（34/59 筆），卻沒有任何一行模板文件定義它——資料跑在規格前面。

目標模板另外補上了整合線資料已在用、模板卻沒寫的欄位：
`pharmacodynamics_summary_en/zh`、`pharmacokinetics`（物件）、`serious_adverse_effects_en/zh`、
`renal_considerations_en`、`hepatic_considerations_en`、`monitoring_requirements_en`、
`integrative_clinical_flags`（15 個受控詞彙）、`board_high_yield_en/zh`、
`common_offlabel_uses_en/zh`、MedlinePlus 四層外部資源順序、`verified_none` 的定義。

**但不可以整檔覆蓋**：整合線模板 262 行、目標 274 行，整合線第 257-262 行的
「R2 Evidence 慣例（2026-08-11，三年藍圖 R2，全線統一）」在目標分支**不存在**。
整檔取 = 刪掉一條全線共用的規則 = 紅線二.3。必須逐段搬。
目標模板本身還有個小瑕疵：出現兩個 `### G`（`G · 驗證狀態與審核軌跡` 與
`G · 外部連結與使用者閱讀資源`），搬過去時要改成 G / H。

---

## 5. 建議的採納順序與逐項驗證

**不要 merge 這個分支。** 三個獨立的小 patch，一次一個，每個自己 commit + push。

### 步驟 1（風險最低，先做）— `styles.css` 兩行

```
取自 18109e93：.k-pharm-card { border-left: 3px solid #6366f1; }
（並補 .k-pharm-gap，整合線 js 有用、css 無定義）
```

驗證：`grep -n "k-pharm-card\|k-pharm-gap" styles.css` 應各 ≥1；
開 `#ws/pharm` 眼睛看一次卡片左邊界有沒有出現、gap note 有沒有被壓成不可讀。
不需跑 validator（純樣式）。

### 步驟 2 — `docs/PHARM_CARD_TEMPLATE.md` 逐段搬（唯一乾淨 TAKE）

來源 commit：`2cdc498b` / `5b4e9f80` / `7108ce73`（模板那部分）。
**搬，不是覆蓋**：保留整合線第 257-262 行 R2 Evidence 慣例；重複的 `### G` 改成 G / H。

驗證（三條，缺一不可）：
1. `node scripts/test-pharm-source-integrity-negative-cases.js`
   —— Test 10 要從 FAIL 轉 PASS，Test 1-9 維持 PASS
2. `node scripts/test-pharm-negative-cases.js` —— 維持 5/5
3. `git diff --stat docs/PHARM_CARD_TEMPLATE.md` 行數要**增加**（262 → 約 285），
   若行數下降代表 R2 段被吃掉，退回重做

眼睛檢查：開檔讀 §G 與 R2 兩段是否都在、有沒有假中文或樣板句。

### 步驟 3（要 Ting 先裁決）— 西藥 Big Card modal 移植

來源：`2a986f82` 的 `openPharmBigCardModal` / `openPharmClassModal`（約 348 行）。
**只搬 modal 兩個函式與其事件綁定，不動 `renderPharm`、不動 `buildCategoryChips`、
不動 `formulaModernSection` 一帶。**
把 `js/knowledge.js:2012` 的死按鈕改為呼叫新的 modal（或讓 `openKnowledgeDetail`
新增 `pharm` 分支），並把目標版的 inline style 換成整合線既有的 `.k-big-card-*` class。

驗證：
1. `node scripts/validate-pharm-standard.js` 維持 PASS（drugs 59 / classes 48 / targets 38 / systems 7，阻擋 0 提醒 0）
2. `git diff origin/codex/pattern-v2 -- js/knowledge.js` 自查：
   `alreadyShown` / `absorbedByModernIndex` / `adSyndromesBlock` / `方劑群組` /
   `相關病名與證型` / `classLabelOf` 六個字串必須**一個都沒少**（這是 §3.3 風險 1 的清單）
3. 開 app 眼睛看：任一方劑卡的「核心」分頁仍有方劑群組、「臨床」分頁仍有現代應用與相關病名；
   西藥卡點下去會開大卡、大卡裡的 class 連結能開藥族卡

### 不做的事（明確列出）

- **不合併** `data/pharmacology/**` 任何一個檔（§2 已證明目標獨有記錄為 0，且會退回
  `drug.mannitol` 錯藥來源與 69 個粗粒度錨點）
- **不採納** `scripts/{audit-atomic-ledger,build-atomic-ledger,verify-source-coverage,test-source-drift-simulation}.js`（§4.1）
- **不合併** `js/router.js`（會刪 `patients`）與 `scripts/validate-pharm-standard.js`（會退 metformin 修正）
- `c3c38cf6` 的 68 個 curriculum 研究包：**先問 Ting**。它是目標分支唯一真正獨有的內容，
  但落在 Ting 的路徑，且 commit 自稱 NOT CANONICAL。若 Ting 要留，建議獨立 cherry-pick
  這一個 commit（它零接觸 `data/**` 與 `js/**`，可以完全隔離採納）

---

## 6. 順手發現的既有缺陷（不屬本次採納範圍，另開線）

1. **`docs/PHARM_CARD_TEMPLATE.md` Test 10 現在就是 FAIL**——不是合併造成的，
   是整合線目前的狀態。步驟 2 會順便修掉。
2. **`.github/workflows/validate.yml` 沒有任何 pharm 閘門**：27 行 `node scripts/` 呼叫裡
   沒有 `validate-pharm-standard.js`、沒有兩支 pharm 測試套件。Test 10 失敗才會沒人發現。
3. **`js/knowledge.js:2012` 的「查看西藥卡」按鈕是死的**（§4.2），與合併無關，現在就壞。
4. **`drug.lisinopril` 的 `name_zh` 是「李斯諾普」**（整合線與目標分支同值），
   應為「賴諾普利」。整合線 log 3947 行已記錄此問題但尚未修。合併不會改善也不會惡化。

---

*評估者：Claude（Opus 5）· 2026-08-12 · 分支 `codex/assess-pv2impl`（未 push）·
本檔所有數字皆可由文中列出的指令重現*
