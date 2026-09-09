# QA-FIVE-DAY 驗收旅程(Ting 2026-09-07 五天派工 · 包 E)

> 目的:每一包落地前,用**同一條旅程**在真瀏覽器走一次,數字寫在這裡,能被一行指令或一段 javascript 重現。
> 三條旅程對應三包:001 搜尋(包 A)、002 手機病例入口(包 B)、003 品質頁數字(包 A 後半)。
> 渲染成本(包 C)的量測表在 `docs/audits/RENDER_COST_2026-09-07.md`;卡片語意(包 D)在 `docs/audits/CARD_REVIEW_PACK_2026-09-07.md`。
>
> 沒有 headless browser 依賴(package.json 零依賴,不加):能在 node 跑的契約進 CI,其餘在 Browser pane 用
> `javascript_tool` / 真鍵盤(`computer type` + `key "Enter"`;注意 key 名是 Enter,不是 Return,後者 keydown 的
> `event.key` 不會等於 "Enter")走一次,結果貼進本檔。

## 環境紀錄

| 項目 | 值 |
|---|---|
| 量測樹 | `claude/pkgA-search`(基底 main @103e162a) |
| 瀏覽器 | Browser pane,`http://localhost:8642`(`scripts/dev-server.js` 服務該 worktree) |
| 資料 | data/generated @ main 103e162a:herbs 366 · formulas 223 · conditionCanon 508 · comparisons 43 · points(runtime)947 |

## QA-SEARCH-001 首頁搜尋 → 開卡 → 空狀態(原誤標為 QA-FIVE-DAY-001,2026-09-09 更正)

**步驟**(每個種子各做一次;三種入口都要走:打字+Enter、打字+搜尋鈕、卡片上的搜尋標籤 `[data-search-term]`)
1. `#ws/home`,點 `#homeSearch`,輸入種子字,等下拉出現(110ms debounce)。
2. 看下拉**第一列**是什麼;按 Enter。
3. 記:開了什麼(dialog id / hash / 卡片 id)、下拉有沒有關、有沒有跳到別的區塊。
4. 無命中的種子:下拉要顯示「找不到…」,停在 `#ws/home`,不跳穴位目錄。

**種子與結果**(2026-09-07,`node scripts/test-unified-search.js` + 瀏覽器 `homeSearchDestination(q)` 對照)

| # | 種子 | before(main 103e162a)Enter 開的 | after(pkgA)Enter 開的 | 下拉關著時 Enter(舊路 → 新路) |
|---|---|---|---|---|
| 1 | `LI4` | point LI4 | point LI4 | LI4 → LI4 |
| 2 | `合谷` | point LI4 | point LI4 | LI4 → LI4 |
| 3 | `黃耆` | **formula 當歸六黃湯** | herb `herb.huang_qi` | **穴位目錄 0 筆** → herb.huang_qi |
| 4 | `Huang Qi` | **formula 黃芪建中湯** | herb `herb.huang_qi` | **董氏 T88.14**(拼音撞名)→ herb.huang_qi |
| 5 | `herb.huang_qi` | **formula 黃芪建中湯** | herb `herb.huang_qi` | **穴位目錄 0 筆** → herb.huang_qi |
| 6 | `桂枝湯` | formula 桂枝湯 | formula 桂枝湯 | **穴位目錄 0 筆** → 桂枝湯 |
| 7 | `formula.gui_zhi_tang` | formula 桂枝湯 | formula 桂枝湯 | **穴位目錄 0 筆** → 桂枝湯 |
| 8 | `PCOS` | condition cond.pcos | condition cond.pcos | **穴位目錄 0 筆** → cond.pcos |
| 9 | `失眠` | **point BL62 申脈** | condition cond.insomnia | 穴位目錄 57 筆 → cond.insomnia |
| 10 | `zzzz_no_match_20260905` | 空狀態 | 空狀態(留在 #ws/home) | **穴位目錄 0 筆** → 空狀態 |

- 開錯卡:before 4/10 → after 0/10。落到 0 筆穴位目錄:before 6/10 → after 0/10。
- 真鍵盤:`黃耆` + Enter → `knowledgeDetailDialog` 標題「黃耆 Huang Qi · Astragalus」;`zzzz…` + Enter → `.gr-empty` 顯示、hash 仍 `#ws/home`、無 dialog。
- 「失眠」按搜尋鈕 → `#conditionGraph`,cond.insomnia 卡在 DOM(`[data-record-id="cond.insomnia"]` 可見);
  下拉在 t=0 關閉,以前 45ms 後被 `handlePointHashChange → render → updateContentModeUI` 叫回來蓋在頁面上(84ed1a9b 修),
  修後 +2.9s 仍 hidden。
- 分組順序:`失眠` → 病症(2) > 症狀(1) > 鑑別(1) > 穴位(52) > 方劑(9) > 中藥(16);`黃耆` → 中藥(5) > 方劑(16) > 病症(5)。
- 契約鎖在 CI:`scripts/test-unified-search.js`(18 種子 + 12 單元 + 替身分母 ≥900 + 結構)、`scripts/validate-interactions.js`(四入口同路、呼叫關係限定在 runHomeSearch 本體內、無舊路)。

**第二輪(對抗式審查 4 HIGH / 9 MED,643382aa 修)**——第一版砍掉舊路時沒揭露它同時是這些查詢唯一的入口:

| 查詢 | main(舊路) | 第一版 fdd46075 | 第二版 643382aa |
|---|---|---|---|
| `Tai Chong` `he gu` `zu san li`(拼音帶空格,698 個候選) | 673 開對 | 2 開對、612 找不到、59 開到形近方/藥(he gu → 百合固金湯) | 拼音去空白第二趟比對:LR3 / LI4 / ST36 |
| `T 11.01`(董氏顯示代碼,277 筆) | 開 T11.01 | 找不到 | standardCode 進身分欄 → T11.01 |
| `第二掌骨`(位置文字) | 穴位目錄 4 筆 | 找不到 | 位置/解剖進內文欄 → LI2(4 筆) |
| `感冒` | 董氏 T88.07 感冒一穴 | 董氏 T88.07(prefix 平手、穴位組第一) | 病症/症狀排到穴位前 → cond.common_cold |
| `蘇子` | 蘇子降氣湯 | **退役卡 herb.su_zi**(列上看不出退役) | 濾 deprecated → herb.zi_su_zi |
| `Ma Zi Ren`(火麻仁英文別名) | 麻子仁丸 | 麻子仁丸 | aliases_en 進身分欄 → herb.huo_ma_ren |
| `合谷` + Enter 後 110ms | 下拉被 timer 畫回來(main 也有) | 同 | timer 提到模組層、clearGlobalResults 取消 → +400ms 仍 hidden |

- Enter 現在不經 DOM 第一列,直接開 `homeSearchDestination` 回的那一筆(openSearchTarget),測試測的物件 = 畫面開的物件。
- 量測方法注記:Browser pane 隱藏時 `computer type/key` 的真鍵盤注入送不到頁面(keydown 監聽器收到 0 個事件),要用 `dispatchEvent(new Event("input"))` + `new KeyboardEvent("keydown",{key:"Enter"})` 走 app 真正監聽的路;pane 可見時真鍵盤可用(第一輪 黃耆+Enter 開 dialog 就是真鍵盤)。

**已知未解 / 待 Ting**
- 「還有 N 筆…輸入更精確的字」不能點:以前「下拉關著再按 Enter」會把整條經的穴位帶到穴位目錄(例:`失眠` → 57 穴),
  這條副作用路徑已移除;要「看全部」需要新入口(新功能,凍結中,進 backlog)。
- 卡片高亮(`.gr-flash`)靠 `requestAnimationFrame`,Browser pane 隱藏時不會跑,本次沒能在自動化裡驗到它;要人眼看一次。
- `composeHerbFrequencyText` 自動寫進病歷的「與西藥間隔至少1小時」:index.html 說明只寫「台灣醫院衛教常見建議(例:高雄榮總中醫部)」,
  data/ 內沒有這句的來源;是否要附 URL 來源或改成不自動寫,待 Ting。

## QA-MOBILE-002 手機 375×812 · 病例入口與八個區塊(原誤標為 QA-FIVE-DAY-002,2026-09-09 更正)

**步驟**:`resize_window` mobile(375×812)→ 各 hash 量 `document.documentElement.scrollWidth`、區塊內可點元素 <44px 數、`fontSize` <12px 數、`offsetTop`;`#globalResults` 用 `#homeSearch` 派 `input` 事件打開。知識詳情 dialog 實際 id 是 `knowledgeDetailDialog`(`js/knowledge.js ensureDetailDialog()` 動態建立)。

| 區塊 | 指標 | before(main 103e162a) | after(main 8a3b2ba9) |
|---|---|---|---|
| 首頁(輸入「合谷」) | 整頁 scrollWidth | 446 | 375 |
| `#globalResults` | 列高 / <44px / <12px | 41px / 1 / 10 | 44px / 0 / 0 |
| `#globalResults`(輸入「湯」) | 副標溢出 `.gr-item` 的列數 / 盒子 scrollWidth | 16/24 / 512 | 0/24 / 317(省略號生效) |
| `#herbRecords` | <44px / <12px | 878 / 1,384 | 492 / 0(剩 492 顆是內嵌敘述句的引用 chip,重新設計才動得了) |
| `#conditionRecords` | <12px / 內容溢位 | 4,391 / 416 | 3,572 / 375 |
| `knowledgeDetailDialog`(herb.ma_huang) | <44px | 83 | 82 |
| `#caseWorkspace` / `#caseListPanel` / `#caseEntryPoint` | offsetTop | 3,556 / 4,195 / 4,160 | 3,561 / 4,202 / 4,166(手機要滑約 4.4 個螢幕) |
| 桌面 1280(回歸) | `.cat-chip` / `.k-open-detail` / `.k-status` / 下拉列 | 39 / 32.16 / 11.52px / 41 | 38.95 / 32.16 / 11.52px / 41(未變) |

- 已知未解:`#ws/condition` 整頁 scrollWidth 838(main 就有)—— `.fab-stack`(position:fixed)在該頁被算到 773–825px,與 `.k-removed-note` 無關,獨立缺陷待修;病例入口太深是資訊架構,D32 例外三選一待 Ting(見裁定單 D13)。

## QA-QUALITY-003 品質頁數字誠實(原誤標為 QA-FIVE-DAY-003,2026-09-09 更正)

**步驟**:`#ws/quality` → 讀「製作與驗證進度」表;或 `getDomainProgress()`。

| 列 | before(main 103e162a) | after(pkgA) | 為什麼 |
|---|---|---|---|
| 辨證鑑別 已製作 | 43/43 | 9/43,附「cells 有字 9 · cells 空 34」 | `filled({})` 以前為 true(`String({}) === "[object Object]"`);32 張 cells 是 `{}`、2 張有結構沒字 |
| 中藥 本地卡 / 分母 | 329(2026-07-28 快照) | 366(即時) | 快照被當即時數 |
| 中藥 template-grade | 93(2026-08-02 快照) | 88(即時) | 同上 |
| 中藥 NCBAHM 覆蓋 | 304/304 | 304/304 **（NCBAHM 覆蓋為 2026-07-28 快照）** | 算不出來的數保留快照,但要標日期 |
| 方劑 / 病症 已製作 | 223/223 · 505/508 | 不變 | 較嚴的 filled() 沒改變它們 |

- 契約鎖在 CI:`scripts/test-quality-panel-honesty.js`(真資料 + 陰性對照:合成三張表只一張有字 → made 必為 1;快照 999 不准蓋掉即時 2;
  結構上不准再讀 `local_herb_cards` / `template_grade` 快照)。把 filled() 改回舊版本機驗過會紅(5 條)。
- 待 Ting:中藥列 total 仍是 NCBAHM 304(考綱分母)而 framework/grade/verified 分母是本地卡 366 —— 同一列兩種分母是舊設計,
  要不要拆成兩列(考綱覆蓋 vs 本地卡品質)是設計題,不是 bug。

## pdftotext 依賴(包 E 項目)

- `scripts/validate-acupoint-page-anchor-accuracy.js` 的錨點是用 **Xpdf 4.00** `pdftotext -layout` 抽的;CI 的 poppler 版本斷行不同,會假紅。
- 09-06 起:腳本讀 `pdftotext -v` 橫幅,非 Xpdf 就 `skipped`(`--json` 帶 skipped 物件),CI 步驟移到 ratchet 之後並 `continue-on-error`;
  本機要真的驗錨點需要 Xpdf 4.00 在 PATH(`ACUTING_PAGE_ANCHOR_ANY_EXTRACTOR=1` 可強制跑,數字不可比)。
- 未解:CI 上這一層永遠是 UNMEASURED。要在 CI 量,得在 workflow 裡固定裝 Xpdf 4.00(下載二進位、校驗 hash),那是 workflow 供應鏈改動,待 Ting 點頭。

## SHA / CI 回報慣例(包 E 項目)

- 每包一個分支 `claude/pkg<X>-*`,commit 訊息第一行寫「修正:」或「凍結例外(Ting 2026-09-07 五天派工 包 X):」(D32 閘門 grep)。
- 2026-09-07 起 `validate.yml` 的 push 觸發加了 `claude/**`:分支自己跑 CI,不用等落 main。落地仍走 ff `git push origin HEAD:main`,
  之後查 `https://api.github.com/repos/guot-beep/acuting-os/actions/runs?branch=main`(公開 repo,匿名可讀)。
- 每包回報五項:做了什麼 / before→after / 原始驗證輸出 / 已知未解 / 分支 + SHA。


## QA-FIVE-DAY-001 / 002 / 003(Codex 派工稿定義的病例旅程)— **未執行**

| ID | 旅程(派工稿原文) | 狀態 | 為什麼還沒做 / 怎麼做 |
|---|---|---|---|
| QA-FIVE-DAY-001 | 新病例 → SOAP → 重載 | 未執行 | 本機 dev server 沒有 Worker,病例服務「唯讀保護中」,`#newCaseBtn` 開得了 dialog 但存不進去。要在 (a) 有 D1 的測試 origin(wrangler dev + 測試資料庫,launch.json 已有 d1-local-8797 項目)或 (b) localStorage 模式(關掉 clinical-sqlite-backend 的雲端探測)跑;只用合成病人代碼(FAKE-*),不匯入真資料。 |
| QA-FIVE-DAY-002 | 已有病例 → Visit Brief → 追蹤 | 未執行 | 同上;「Visit Brief」對應 app 內的診後摘要(AVS)入口,id 待對照 `js/avs.js`。 |
| QA-FIVE-DAY-003 | 匯出 → 隔離入口還原 → 逐欄對帳 | 未執行 | 匯出/匯入走 `#exportCasesBtn` / `#importCasesFile`;逐欄對帳可用 `scripts/test-clinical-sqlite-service.js` 的 fixture 思路(sample_export_fixture.json)在測試 origin 做。 |

派工稿包 B 的驗收尺寸是 390×844 與 1440×900、整頁 `scrollWidth ≤ clientWidth+1`:本輪量的是 375×812 與 1280×900;`#ws/condition` 整頁 838 溢位(`.fab-stack` 定位,main 就有)未修 → 包 B 驗收**未全達**,列待辦。
