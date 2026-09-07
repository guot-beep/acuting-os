# 渲染成本量測 — 包 C（Ting 2026-09-07 五天派工）

**量測樹**：`claude/pkgC-render`，開工基底 `origin/main @ 103e162a004dc9ea2ba447f3837bc612ad12dc92`
**量測方式**：`node scripts/dev-server.js 8644` 服務 worktree 原始檔，Chromium 開
`http://localhost:8644/`。頁面節點數在同一份程式碼下**完全確定**（五次重載五次都是同一個數字），
時間數字則是背景分頁 + 同機其他 session 也在載 30 MB 頁面時量的，**噪音很大，只能看量級不能看小數**。

> **誠實聲明:量不到的東西**
> 1. 量測分頁是 `document.visibilityState === "hidden"`，所以 `requestAnimationFrame` **不會觸發**，
>    「到下一個 frame / 到第一次 paint」這一欄整批量不到，本文件不列。列出來的
>    `handlers_ms` 是「設定 `location.hash` → hashchange 監聽器全部跑完 + 一次強制 layout」。
> 2. `performance.memory.usedJSHeapSize` 受 GC 時機影響，同一份程式碼重複量會在 51–61 MB 之間跳，
>    只當數量級參考。
> 3. Ting 的基準（b196248f，55,541 節點）與本文件的 34,882 不是同一棵樹，**不可相減**。

---

## 1. Before — 靜態資產

`node` 讀 `index.html` 的 `<script src>` + `fs.statSync`：

```
scripts: 24   total bytes: 30,306,219
6,977,021  data/generated/knowledge_dx.js
5,793,417  data/generated/knowledge_mm.js
5,665,311  data/generated/points_361.js
4,601,214  data/generated/knowledge_rx.js
1,890,537  data/generated/knowledge_pat.js
1,390,266  data/generated/knowledge_ref.js
1,357,682  data/generated/app_data.js
1,213,318  data/tung/point_index.js
  660,845  app.js
  260,518  js/knowledge.js
（其餘 14 支合計 226,090）
```

瀏覽器端 `performance.getEntriesByType('resource')` 前 10（transferSize / duration ms，本機 no-store）：

| 檔 | transferSize | duration |
|---|---:|---:|
| knowledge_dx.js | 6,977,321 | 136 |
| knowledge_mm.js | 5,793,717 | 78 |
| points_361.js | 5,665,611 | 204 |
| knowledge_rx.js | 4,601,514 | 64 |
| knowledge_pat.js | 1,890,837 | 137 |
| knowledge_ref.js | 1,390,566 | 29 |
| app_data.js | 1,357,982 | 22 |
| point_index.js | 1,213,618 | 174 |
| app.js | 661,145 | 224 |
| js/knowledge.js | 260,818 | 227 |

**這一包不動 bytes**（見 §4 候選三為什麼被否決），所以 after 的這兩張表與 before 相同。

## 2. Before — DOM

四個 hash 各重載一次（`#ws/home` / `#ws/herb` / `#ws/condition` / `#ws/formula`），
`document.querySelectorAll('*').length` 全部是 **34,882**，逐區子樹也一字不差。

> **這就是歸因的第一個結論**：目前的渲染量**與使用者停在哪一頁完全無關**。
> 八個知識分頁的清單在開機期一起塞進 DOM，使用者一次只看得到其中一頁。

| 容器 | children | 子樹節點 | 佔 34,882 |
|---|---:|---:|---:|
| `#cards`（穴位目錄，`#acupointDirectory` 內） | 947 | 13,767 | 39.5% |
| `#herbRecords` → `#herbGrid` | 366 | 6,229 | 17.9% |
| `#symptomRecords`（卡直接掛在容器上） | 124 | 5,399 | 15.5% |
| `#comparisonRecords` → `#comparisonGrid` | 43 | 3,017 | 8.6% |
| `#formulaRecords` → `#formulaGrid` | 223 | 2,553 | 7.3% |
| `#pharmRecords` → `#pharmGrid` | 59 | 801 | 2.3% |
| `#conditionRecords` | 5 | **11** | 0.03% |
| 其餘（外殼、導覽、病例、品質、來源…） | — | 3,105 | 8.9% |

`#conditionRecords` 只有 11 個節點，是因為 2026-08-12 已經有人把它改成 lazy
（`js/knowledge.js:4014` `renderDxOnce`）。**第一次切到 `#ws/condition` 之後**，
全站節點數 34,882 → **68,675**（+33,793），而且再也不會降回來。

導覽時間（同一棵樹、同一台機器；主分頁 vs iframe 兩種量法都列，因為兩者不可比）：

| 量法 | domInteractive | domComplete = loadEventEnd |
|---|---:|---:|
| 主分頁，單次重載 ×2 | 221 / 379 | 735 / 871 |
| iframe，連續 5 次（中位數） | 173 | 1,669 |
| | 五次原始值 150/170/173/224/368 | 1596/1663/1669/1890/2751 |

heap（`performance.memory.usedJSHeapSize`）：51.33 / 60.75 / 60.94 MB。

## 3. Before — hash 切換耗時

`location.hash = X` → 最後一個 hashchange 監聽器跑完 → 一次 `document.body.offsetHeight`。
每個目標量 2–3 次（噪音大，列全部原始值，不取平均）：

| 目標 | handlers_ms（原始值） |
|---|---|
| `#ws/acu` | 1,647 · 1,998 · 5,314 |
| `#ws/herb` | 1,356 · 1,360 |
| `#ws/formula` | 494 |
| `#ws/home`（回首頁） | 277 · 413 · 579 · 785 |
| `#ws/condition`（第一次，含 lazy render 33,793 節點） | 717 |

**最貴的互動是切到 `#ws/acu`**——那是解除 `#cards`（13,767 節點）的 `hidden`、
整區重新排版的代價。切回首頁在踩過 condition 之後從 277 ms 漲到 500–785 ms，
因為 `router.js` 的 `activate()` 會對**所有** `section[data-workspace]` 切 `hidden`，
文件越大每次切換越貴——**開機期塞進去的節點不是只付一次，是每切一次分頁付一次**。

## 4. 歸因（誰在開機期就把清單塞進 DOM）

| 來源 | file:line | 節點貢獻 |
|---|---|---:|
| `renderCards(filtered)` ← `render()` | `app.js:2374`（函式本體 `app.js:4315`） | 13,767 + 1,894 個 listener（每張卡 click + keydown） |
| `<div class="k-grid" id="herbGrid">${renderHerbs(herbs)}</div>` | `js/knowledge.js:2667` | 6,229 |
| `updateSymptoms();` | `js/knowledge.js:3047` | 5,399 |
| `id="comparisonGrid">${renderComparisons(comparisons)…` | `js/knowledge.js:2951` | 3,017 |
| `id="formulaGrid">${renderEnhanced(records)}` | `js/knowledge.js:2520` | 2,553 |
| `id="pharmGrid">${renderPharm(pharmDrugs)}` | `js/knowledge.js:2769` | 801 |
| （已經 lazy）`renderDxOnce()` | `js/knowledge.js:4014` | 0 → 進站後 +33,793 |

### 移除實驗（本機暫時註解、量、還原；不進 commit）

* **EXP1** 註解掉 `app.js:2374` 的 `renderCards(filtered);`
  → 34,882 → **21,115**（−13,767，正好等於 `#cards` 子樹）
  → `#ws/acu` 切換 1,647–5,314 ms → **289 / 322 ms**
  → domComplete 1,721/1,794/2,196（與 before 的 1,596–2,751 同一個噪音帶，**測不出差別**）
* **EXP2** 把五個知識 grid 的開機內容清空（herb / formula / pharm / comparison / symptom）
  → 34,882 → **16,884**（−17,998）
  → `#ws/acu` 仍是 1,273–2,113 ms（**證明 acu 那筆帳全在 `#cards`，與知識 grid 無關**）
  → domComplete 1,853/1,901/2,245（同樣測不出差別）

兩個實驗做完都 `git checkout --` 還原，`git status --porcelain` 空。

### 驗證器 / 測試的相依性

`grep -rn "querySelectorAll\|getElementById" scripts/validate-*-render*.js scripts/test-*.js` → **0 命中**。
`scripts/` 底下只有 `extract-embedded-data.js` / `harvest-american-dragon-formulas.js` /
`validate-condition-sources.js` / `validate-data.js` 出現這兩個字，且都不是渲染 gate。
所有 `validate-*-render*.js` 都是**讀原始碼字串**的靜態檢查（`RENDER_SOURCES = ["app.js", "js/knowledge.js", …]`），
所以「把某個呼叫搬進函式、樣板字串原文不動」不會讓它們失效。
`grep -rn 'herbGrid|formulaGrid|pharmGrid|comparisonGrid|renderHerbs|renderComparisons|updateSymptoms' scripts/` → **0 命中**。

### 跨檔相依（改之前一定要看的兩個 DOM 查表）

`app.js` 只有兩處靠「知識卡已經在 DOM 裡」：

* `app.js:1417`（`openKnowledgeRecord` 的 condition 分支）— condition **今天已經是 lazy**，
  這條路靠的就是「`goToSection()` → hashchange 監聽器同步跑完 → 才輪到 `requestAnimationFrame`」，
  已在線上運作，是本包沿用的機制先例。
* `app.js:1465`（`openGlobalResult` 的 comparison 分支）—
  **這條路今天就已經是死的**：`renderComparisons`（`js/knowledge.js:2909`）產出的
  `<article class="k-card k-comparison-card">` **根本沒有 `data-record-id`**，
  實測 before 狀態下 `document.querySelector('[data-record-id="cmp.insomnia_patterns"]')` 也是 `null`。
  也就是說 scroll + `gr-flash` 從來沒發生過，使用者只是被帶到該區塊。
  **本包不修這個既有缺陷，也不會讓它變糟**（記在 §7）。

herb / formula / pharm 的搜尋結果走 `api.openDetail(kind, id)`，**從資料開 modal，不查 DOM**；
symptom 的搜尋結果走「填 `#symptomFilter` → dispatch input」，反而是 lazy 之後更順。
`renderKnowledgeCounts()`（`app.js:2121`）的數字全部來自 `ACUTING_KNOWLEDGE`，不數 DOM。

---

## 5. 三個候選

### 候選 A — 穴位目錄 `#cards` 進 workspace 才渲染
* **收益**：開機 −13,767 節點（39.5%）、−1,894 個 listener；非 acu 的每一次分頁切換都變便宜。
* **bytes / 搜尋**：0 / 不影響（`unifiedSearch` 讀 `points` 陣列，不讀 DOM）。
* **要改**：`app.js:2374`（`render()` 內），另需一個 hashchange 掛勾。
* **風險（為什麼這次不選）**：`render()` 是 app 的脊椎，全檔 **25 處**呼叫它
  （filter、搜尋、語言切換、病例存檔…），而檔頭已經有一整排關於它的 TDZ 警告
  （`app.js:73/80/205/1034` 註解、記憶檔「開機期守門撞 TDZ 會靜默失效」）。
  閘門寫錯的樣子是**穴位清單無聲變空**——這是這個專案最貴的那一類缺陷，
  而 9/02 已開診、D32 保護的正是 Ting 對這個殼的肌肉記憶。
* **另外**：EXP2 證明 acu 切換那 1.6–5.3 秒全部記在 `#cards` 頭上，
  但那是**解除 hidden 後的排版**，lazy 之後第一次進 acu 仍要付一次；
  真正省下的是開機與其他分頁，不是 acu 本身。

### 候選 B — 五個知識 grid 進 workspace 才渲染第一次（**本次實作**）
* **收益**：開機 −17,998 節點（**51.6%**，34,882 → 16,884，EXP2 實測）。
* **bytes / 搜尋**：0 / 不影響（同上，搜尋讀 `ACUTING_KNOWLEDGE`，開卡走 `openDetail` modal）。
* **要改**：`js/knowledge.js` 六處小改 —— 一個共用 helper + 五個區塊各兩行。
* **為什麼是它**：這不是新設計，是把 **2026-08-12 已經在線上跑的 `renderDxOnce`
  （`js/knowledge.js:4014`）原封不動再用五次**。當時的理由（手機因 DOM 過重被系統
  清空頁面）對另外五個分頁一字不差地成立。五個區塊彼此獨立，任一個閘門寫錯
  只影響那一頁，而且**打開那一頁就會立刻看見**（空白 grid），不像候選 A 會在
  25 個呼叫點的某一個組合下才靜默壞掉。
* **驗證器影響**：0（見 §4）。

### 候選 C — `knowledge_*.js` 分片改成進 workspace 才動態載入
* **收益**：開機少載 ~19.7 MB（dx 6.98 + mm 5.79 + rx 4.60 + pat 1.89 + ref 1.39），
  本機 duration 合計 ~444 ms，行動網路上是數量級更大的數字。
* **風險（否決）**：`unifiedSearch` 的資料來源就是 `ACUTING_KNOWLEDGE`
  ——**資料延遲載入 = 首頁搜尋在載完之前查不到方劑/中藥/病症**，
  而首頁搜尋是 Ting 診間的入口。而且 `js/knowledge.js` 在 IIFE 頂端
  `const K = globalThis.ACUTING_KNOWLEDGE` **一次性捕捉**（index.html:1128 的註解寫明），
  晚到的鍵它永遠看不到；`app.js` 的 `dataLoadGuard` 也靠 core 片的 `__expected` 清單抓缺片。
  要做就得先把 `K` 改成每次重讀 + 全站補「資料還沒到」的狀態，
  **那是一個獨立的包，不是這一包能安全塞進去的一個改動**。
* **DOM 延遲（A/B）不影響搜尋，資料延遲（C）會**——這是三個候選最關鍵的分野。

---

## 6. After（實作候選 B）

改動：`js/knowledge.js`，+53 −9 行（一個 `renderWhenWorkspaceOpens()` helper + 五個區塊各兩行）。
其他檔一律沒動（`app.js` / `index.html` / `styles.css` / `js/router.js` 全部零改動）。

### 6.1 節點（確定值，五次重載五次一樣）

| 容器 | before children / 子樹節點 | after（開機、停在 `#ws/home`） |
|---|---:|---:|
| **全站** | **34,882** | **16,883**（−17,999，**−51.6%**） |
| `#cards`（本包沒動） | 947 / 13,767 | 947 / 13,767 |
| `#herbGrid` | 366 / 6,229 | 0 / 0 |
| `#symptomRecords` | 124 / 5,399 | 0 / 0 |
| `#comparisonGrid` | 43 / 3,017 | 0 / 0 |
| `#formulaGrid` | 223 / 2,553 | 0 / 0 |
| `#pharmGrid` | 59 / 801 | 0 / 0 |
| `#conditionRecords`（本來就 lazy） | 5 / 11 | 5 / 11 |
| `#herbRecords` 的工具列 + 分類抽屜（保留，開機期就在） | 209 | 209 |
| `#pharmRecords` 同上 | 305 | 305 |
| `#formulaRecords` 同上 | 160 | 160 |

### 6.2 沒有內容遺失的證據：逐頁走一遍，節點數收斂回 before

一個分頁一個分頁進，每進一頁量一次全站節點：

| 動作 | 全站節點 | 增量 | 該 grid 的 children |
|---|---:|---:|---:|
| 開機（`#ws/home`） | 16,883 | — | — |
| → `#ws/herb` | 23,112 | **+6,229** | herbGrid **366** |
| → `#ws/formula` | 25,665 | **+2,553** | formulaGrid **223** |
| → `#ws/pharm` | 26,466 | **+801** | pharmGrid **59** |
| → `#ws/symptom` | 31,865 | **+5,399** | symptomRecords **124** |
| → `#ws/comparison` | **34,882** | **+3,017** | comparisonGrid **43** |

五個增量與 §2 的 before 子樹**逐一相等**，總和回到 **34,882 = before 的數字**。
每一頁都捲到底並確認最後一張卡有內容、`getBoundingClientRect()` 寬高 > 0：

* herb 366：首 `麻黃 Ma Huang` / 末 `禹餘糧 Yu Yu Liang`
* formula 223：首 `桂枝湯 Gui Zhi Tang` / 末 `復元活血湯(匯入重複殘根)`
* pharm 59：首 `呋塞米 Furosemide` / 末 `昂丹司瓊 Ondansetron`
* symptom 124：首 `頭痛 Headache` / 末 `腰痠 Lumbar soreness`
* comparison 43：首 `失眠常見證型鑑別` / 末 `白虎湯、黃連解毒湯、導赤散、龍膽瀉肝湯 鑑別`

深連結開站（網址直接是 `#ws/herb` 再 reload）：`herbGrid` 366、其餘仍為 0、全站 23,112 ——
`run()` 的立即分支有效。

### 6.3 時間與 heap：**量不出差別，不要拿去當戰功**

before/after **交錯**量（改→量→還原→量，同一個時間窗，排除機器負載漂移）：

| | domComplete（iframe，三次） | `#ws/herb` 切換 | `#ws/home` 切換 | `#ws/acu` 切換 |
|---|---|---|---|---|
| before | 1076 / 812 / 850 | 655.7 · 350.7 | 174 · 313.2 · 278.9 | 905.3 |
| after | 1166 / 842 / 832 | 476.3 · 467.2 | 117.6 · 289.3 · 320.3 | 981.2 |

**兩組完全重疊 = 這台機器上量不出差別。** 原因說得通：開機的瓶頸是
解析執行 30.3 MB 的 script，不是建 DOM（EXP1 拿掉 13,767 個節點也一樣量不出來）。

heap 用**全新分頁**成對量（同一份等待時間，避免量測 harness 汙染）：

| | 全站節點 | usedJSHeapSize | totalJSHeapSize |
|---|---:|---:|---:|
| before | 34,882 | 52.96 MB | 70.25 MB |
| after | 16,883 | 52.86 MB | 69.23 MB |

**一樣沒有差別**——`performance.memory` 量的是 JS 堆，而 30 MB 的資料物件兩邊一模一樣；
DOM 節點的記憶體在 renderer 的 DOM heap，這個 API **看不到**。
所以「省了多少記憶體」這件事**這個量測台量不到，本文件不宣稱**。

**這一包唯一可重現、可驗證的收益是「開機期 DOM 節點少 51.6%」**（以及隨之而來、
本台量不到的 DOM 記憶體與每次切分頁的 style/layout 工作量）。
2026-08-12 那條 condition lazy render 的動機（手機因 DOM 過重被系統清掉頁面）
本來就是**節點數**問題，不是 domComplete 問題。

### 6.4 功能驗證（真的在瀏覽器裡點過）

| 檢查 | before | after |
|---|---|---|
| 搜尋「黃耆」結果數 | 16 | **16**（前三筆同順序） |
| 搜尋「合谷」結果數 | 8 | **8**（LI4 / LR3 / cond.menorrhagia） |
| 搜尋「桂枝湯」結果數 | 11 | **11**（formula.gui_zhi_tang 第一） |
| 點方劑結果 → 開卡 | modal 開啟 | **modal 開啟**（`桂枝湯 Gui Zhi Tang`、`黃芪建中湯`） |
| 點中藥結果 → 開卡 | — | **modal 開啟**（`herb.huang_qi` → 中藥資料庫 黃耆 Huang Qi） |
| 點穴位結果 → 開卡 | — | **`#point/LI4`、`ws=acu`、detailCard 有內容** |
| 進 `#ws/herb` 捲到底 children | 366 | **366** |
| herbFilter 打「黃」 | — | **23**（清空回 366） |
| 分類 chip「活血化瘀藥」 | — | **24**（點「全部」回 366） |
| comparisonFilter 打「失眠」 | — | **1**（清空回 43） |
| console error | `__clinical/ping` 404 | **同樣只有 `__clinical/ping` 404**（本機沒有 Worker） |

搜尋開卡走的是 `api.openDetail(kind, id)`（從資料開 modal），**與 grid 在不在 DOM 無關**——
這是候選 B 風險低的根本原因。

---

## 7. 已知未解 / 不在這一包

1. **`app.js:1465` comparison 的 scroll+flash 是死路**：`renderComparisons` 沒有輸出
   `data-record-id`，before/after 都找不到卡。要修是加一個屬性（一行），
   但那會動到卡片樣板，屬於 D32 凍結面，且與本包的量測主題無關。
2. **`#cards` 13,767 節點仍在開機期**（候選 A）。
3. **30.3 MB script 仍全在開機載入**（候選 C）。
4. **`#ws/condition` 第一次進站 +33,793 節點**且不會釋放——lazy 只推遲不封頂。
   要封頂得做分批 / 虛擬清單，是另一個包。
5. `renderDxOnce`（`js/knowledge.js`，condition 那條）與本包新增的
   `renderWhenWorkspaceOpens()` 是**同一個機制的兩份實作**。沒有把 condition 併過來，
   是刻意不動線上已驗證的路徑；下次碰 condition 時再收斂成一份。
6. **`renderDxOnce` 沒有 fail-open 保險**：`index.html` 的 `section[data-workspace]`
   **沒有預設 `hidden`**，是 `router.js` 執行時才收起來的。router.js 萬一沒載到，
   `data-active-ws` 從頭到尾不存在、所有 section 同時攤開，
   `document.body.dataset.activeWs !== "condition"` 會**永遠成立**，
   於是 condition 整層無聲留白。本包新的 helper 已經補上這條
   （`activeWs === undefined` 就照舊全部畫），`renderDxOnce` 還沒有 —— 一併留給第 5 項那次收斂。
7. **時間與記憶體的收益量不到**（§6.3）。要證明「手機不再被系統清掉頁面」需要真機
   + 真的記憶體壓力量測，不是這台桌機的 `performance.memory` 做得到的。
   本文件只宣稱節點數。

---

## 8. 驗證器輸出（after，原文最後幾行）

```
$ node scripts/validate-interactions.js          → "warnings": 0, "failures": 0   (exit 0)
$ node scripts/validate-ui-freeze.js             → PASS                            (exit 0)
$ node scripts/validate-outcome-panel-render.js  → PASS — 三態都畫到了 Outcome Tracking 上,未標註的維持空白。
$ node scripts/validate-exposure-safety-render.js→ PASS — 黑框警告到得了病歷,且「沒查過」與「查過沒事」分得出來。
$ node scripts/validate-care-draft-render.js     → PASS — 產生草稿按鈕接得上,二次確認守得住,患者代碼與病例標題都沒有出門。
$ node scripts/validate-herb-pair-render.js      → PASS — 兩個藥對來源都到畫面上,重複判定與重算一致。
$ node scripts/check-validation-ratchet.js       → PASS — no regressions.
$ node scripts/validate-render-blocking.js       → validate-render-blocking: PASS
$ node scripts/validate-review-status-vocabulary.js      → PASS — 沒有詞彙外的 review_status。
$ node scripts/validate-rendered-reference-resolution.js → PASS — 會上畫面的引用解析不到的數量都在上限內。
$ node scripts/validate-bilingual-render-parity.js       → PASS — no blocking defects.
$ node scripts/validate-card-text-audience.js            → PASS — 卡上的學習提示沒有欄位名與記錄 id。
```

ratchet 的缺陷數與 baseline 一字不差（encoding 43 / relation_integrity 20 / content_quality 3 /
herb_canon 5495 / herb_track_filler 1131，其餘 0）—— 這一包不碰 `data/**`，本來就該一樣。

## 9. 怎麼重現

```bash
export PATH="/c/Program Files/nodejs:$PATH"
node scripts/dev-server.js 8644        # 服務 repo 根目錄
# 瀏覽器開 http://127.0.0.1:8644/#ws/home，等 domComplete，然後：
#   document.querySelectorAll('*').length                       → 16883（before 是 34882）
#   location.hash='#ws/herb'; …等 700ms…
#   document.getElementById('herbGrid').children.length         → 366
#   document.querySelectorAll('*').length                       → 23112
# 逐頁重複 formula / pharm / symptom / comparison，最後回到 34882。
```
