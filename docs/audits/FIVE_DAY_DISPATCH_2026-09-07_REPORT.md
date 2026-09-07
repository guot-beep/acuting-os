# 五天派工 · 第一天實做(2026-09-07)回報

> Ting 指示:「不用管天數,一天可以做兩三天的分量」「你可以超前做,然後派發 Sonnet 5 / Opus 去做」「持續做六小時」。
> 做法:我(Fable)寫規格、量 before、派執行 agent(Sonnet/Opus,各自 worktree 從 origin/main 切)、再派對抗式審查 agent
> (預設「這批有錯」),審查的 HIGH/MED 我親自修,驗證器 + 真瀏覽器 + 分支 CI 綠了才 ff 落 main。
> 基線:Ting 給的 b196248f;開工時 main = 103e162a(D11 結案後)。**每個數字都附重現方法**,禁「完成」。

| 包 | 分支 → main | 執行 | 審查 | 狀態 |
|---|---|---|---|---|
| D11(前置) | `de358dbf` `103e162a` | Fable | — | 已落 main,CI 綠 |
| A 搜尋 + 品質數字 | `claude/pkgA-search` → main `3c85b7df` | Fable | Opus(4 HIGH / 9 MED / 5 LOW,全修) | 已落 main,CI 綠 |
| C 渲染成本 | `claude/pkgC-render` → `claude/pkgC-r2` → main `4e286c39` | Opus | Opus(2 HIGH / 6 MED / 2 LOW,全修) | 已落 main,CI 綠 |
| B 手機排版 | `claude/pkgB-mobile` → `claude/pkgB-r2` → main `8a3b2ba9` | Sonnet | Sonnet(3 HIGH / 3 MED / 2 LOW,HIGH 全修) | 已落 main,CI 綠 |
| D 卡片語意 | `claude/pkgD-review` → `claude/pkgD-fixes` → `claude/pkgD-r2` @ bf50aac0 | Sonnet(唯讀審讀)+ Fable(帳本落地、歸經修正) | Sonnet(3 HIGH / 4 MED,全修) | 分支 CI 綠後 ff 落 main(見 PROJECT_LOG 最終 SHA) |
| E 驗收旅程 | 併在 A 分支 + 本檔 | Fable | — | 001/002/003 已填 |
| 日報 / 待裁 | `claude/day1-report` | Fable | — | 本檔 + `docs/TING_PENDING_RULINGS_2026-08-31.md` D12–D14 |

---

## 包 A · 首頁搜尋 + 品質頁數字(Day 1)

**(1) 做了什麼**
- 搜尋排名重寫:八類欄位拆成「身分欄」(id/code/名字/拼音/別名;拼音帶不帶空格同義)與「內文欄」(功效/主治/組成/標籤/位置),身分 0–2 分永遠贏內文 3–5 分;同分才看類別順序(病症、症狀排在穴位前)。下拉分組照各組最佳分數排,Enter 開的 = 第一列。
- 四個入口(打字 / Enter / 搜尋鈕 / 卡片搜尋標籤)走同一個純函式 `homeSearchDestination`;無命中 = 空狀態留在原地。舊路(下拉關著時 Enter → 穴位目錄)移除,舊路獨有的欄位(董氏顯示代碼、位置/解剖文字、去空白拼音)全部併進 unifiedSearch。
- 退役卡不進搜尋;110ms debounce timer 不再在開卡後把下拉畫回來;開病症/病例結果後 `hashchange → render → updateContentModeUI` 不再叫回下拉。
- 品質頁:`filled({})` 不再為 true;中藥本地卡 / template-grade / source_checked 用即時數;NCBAHM 覆蓋保留快照並標日期;鑑別表分開報 cells 有字 / 空;進度條分母修正。
- 兩支契約進 CI(`test-unified-search.js` 18 種子 + 12 單元 + 替身分母 ≥900 + 結構;`test-quality-panel-honesty.js` 真資料 + 陰性對照 + 結構);`validate-interactions.js` 加四入口同路檢查(限定在函式本體內)。`claude/**` 分支現在自己跑 CI。

**(2) before → after**(main 103e162a → main 3c85b7df,真瀏覽器 947 穴)

| 指標 | before | after |
|---|---|---|
| Ting 10 個種子:Enter 開錯卡 | 4/10(黃耆→當歸六黃湯、Huang Qi / herb.huang_qi→黃芪建中湯、失眠→申脈) | 0/10 |
| 10 個種子:落到 0 筆穴位目錄 | 6/10 | 0/10 |
| 拼音帶空格的穴位查詢(698 候選) | 舊路 673 開對 | 第一版 2 開對(審查抓到)→ 第二版身分去空白比對,LR3/LI4/ST36 種子全對 |
| 董氏顯示代碼「T 11.01」/ 位置文字「第二掌骨」 | 開對 / 目錄 4 筆 | 第一版找不到 → 第二版 T11.01 / LI2(4 筆) |
| 「感冒」 | 董氏 T88.07 感冒一穴 | cond.common_cold |
| 「蘇子」 | 蘇子降氣湯 | 第一版退役卡 herb.su_zi → 第二版 herb.zi_su_zi |
| Enter 後 110ms 下拉回來 | 會(main 也會) | +400ms 仍 hidden |
| 品質頁 鑑別表已製作 | 43/43 | 9/43(cells 有字 9 / 空 34;32 張是 `{}`) |
| 品質頁 中藥本地卡 / template / 分母 | 329 / 93 / 329(07-28、08-02 快照) | 366 / 88 / 366(即時),NCBAHM 304/304 標「2026-07-28 快照」 |

**(3) 原始驗證**:`node scripts/test-unified-search.js` → `PASS — 18 個種子查詢 + 12 條單元斷言 + 替身分母 + 結構斷言全部符合`;`node scripts/test-quality-panel-honesty.js` → `PASS`;`validate-interactions` failures 0;`validate-ui-freeze` PASS(訊息含「修正」);`check-validation-ratchet` PASS;分支 CI 643382aa success;main CI 3c85b7df success。負控:把 `filled()` 改回舊版契約紅 5 條;把 runHomeSearch 掏空、改名、加回舊路 → 閘門紅(審查 NC1–NC6 六種破壞五種擋住,第六種 NC3 已補)。

**(4) 已知未解**
- 「還有 N 筆…」不能點;要「看全部」需要新入口(凍結中,backlog)。
- 空白查詢 Enter 沒有空狀態(L3);證型不在搜尋範圍(L5,main 同)。
- `composeHerbFrequencyText` 自動寫進病歷的「與西藥間隔至少1小時」:data/ 內無來源,index.html 只寫「台灣醫院衛教常見建議(例:高雄榮總中醫部)」→ **待 Ting**。
- 中藥列 total 是 NCBAHM 304、framework/grade/verified 分母是本地卡 366,同一列兩種分母是舊設計 → **待 Ting** 要不要拆列。

**(5) SHA / CI**:`a2a3f63a` `84ed1a9b` `d8573f8f` `acab129b` `fdd46075` `643382aa` `3c85b7df`;main CI success。

---

## 包 C · 渲染成本(Day 3,提前)

**(1) 做了什麼**:歸因 —— 開機期八個知識分頁的清單一起塞進 DOM,與停在哪一頁無關;`#cards` 13,767 節點(39.5%)、五個知識 grid 17,999(51.6%)。實作候選 B:五個 grid(herb 366 / formula 223 / pharm 59 / symptom 124 / comparison 43)改成進該 workspace 才畫第一次(`renderWhenWorkspaceOpens`,含 fail-open:router 沒載到就全部畫);第二輪把 condition 的 `renderDxOnce` 併進同一個 helper、語言切換只重畫「畫過的」、render 失敗會重試、新增 `validate-lazy-grid-wiring.js` 靜態閘門(對修正前的樹抓到 2 條)。

**(2) before → after**(localhost,`#ws/home` 開機):DOM 節點 34,882 → 16,883(−51.6%);首頁按 Public EN:第一版 30,130(收益回去 73.6%)→ 第二版 15,148、五個 grid 仍 0;逐頁進站加總回到 34,882,五個容器 innerHTML 與 before 逐位元組相同;scripts 24 / 30,306,219 bytes 不變;domComplete / parse-exec 窗口 / heap **量不出差別**(before 474/435/449 ms vs after 505/442/459 ms),第一次進 #ws/herb 沒變快(成本從 layout 搬到 render+layout)—— 本包唯一可重現的收益是節點數。

**(3) 原始驗證**:`validate-lazy-grid-wiring.js --self-test` → `PASS — self-test 5 條`;本體 PASS;interactions / ui-freeze(凍結例外 + 出處)/ ratchet / render 類六支 / test-unified-search 全 exit 0;分支 CI 4e286c39 success。

**(4) 已知未解**:第一次進 `#ws/condition` +33,793 節點且不釋放(lazy 只推遲不封頂);候選 A(`#cards` 13,767 節點 lazy)與候選 C(19.7 MB 分片延後載入,前置條件是 `K` 一次性捕捉與 dataLoadGuard 要改)沒做;comparison 卡沒有 `data-record-id`,搜尋結果的 scroll+flash 對它是死路(before 就死)。

**(5) SHA / CI**:`42b715f8`(執行)→ `5336af30`(rebase)→ `4e286c39`(第二輪);main CI 見本檔頂部狀態。

---

## 包 B · 手機排版(Day 2,提前)— 執行完,審查中

**(1) 做了什麼**:10 個 commit,只動 `styles.css`(52 行):`.gr-item / .cat-chip / .k-open-detail / .k-detail-close / .learn-from-toggle` min-height 44px;`.k-status / .k-link-chip / .gr-group__title / .gr-kind` 0.72–0.74rem → 0.75rem;`.os-dashboard` 與 `.os-dashboard.home-hero` 的 `1fr` → `minmax(0,1fr)`(首頁溢位真正的規則是後者);`.k-removed-note small` 加 `overflow-wrap:anywhere`。dialog 實際 id 是 `knowledgeDetailDialog`(js/knowledge.js `ensureDetailDialog()` 動態建立)。

**(2) before → after**(375×812):首頁輸入「合谷」後 scrollWidth 446 → 375;`#globalResults` <44px 1 → 0、<12px 10 → 0;`#herbRecords` <44px 878 → 492、<12px 1,384 → 0;`#conditionRecords` <12px 4,391 → 3,572;`#ws/condition` 內容溢位 416 → 375;`#caseWorkspace` offsetTop 3,556 → 3,561(手機上要滑約 4.4 個螢幕才到病例入口)。

**(3) 驗證**:interactions / ui-freeze(10 個訊息都含「修正」)/ ratchet / outcome-panel / care-draft 全 PASS(執行者輸出);審查與分支 CI(d3bda210)進行中。

**(4) 已知未解 / 待 Ting(D32 例外)**:病例入口太深 —— (a) FAB 群加「新增病例」(b) 手機版病例區前移(c) 首頁「繼續上次病例」tile 加大或釘上方,三選一是資訊架構,**待 Ting**。內嵌在敘述句裡的緊湊引用 chip(492 顆 / dialog 82 顆 / 病症卡裸連結 418 顆)沒拉到 44px,那是重新設計引用排版,不是 bug。

**(5) SHA**:`b2bb4e14`(執行)→ `d3bda210`(rebase 到 4e286c39)。

---

## 包 D · 卡片語意(Day 4,提前)— 帳本已落分支,審查中

**(1) 做了什麼**:20 張卡(herb.huang_qi、formula.xiao_jian_zhong_tang 必審;方劑 9 張 = FORMULA_CARDS_INVENTORY ⭐ 前 9;藥材 9 味 = related_formulas 最多前 9)在瀏覽器逐張讀完(中文模式全數、英文模式抽驗),原檔為證。審讀包 `docs/audits/CARD_REVIEW_PACK_2026-09-07.md`(291 行)。有 repo 內來源的 6 欄我逐條核對後落地(丹參飲君藥「補血養血」→「活血化瘀」×3 欄;大建中湯考點對齊 Ting 08-12 裁定「飴糖君」;小建中湯禁忌英文順序對齊中文;黃芩配白朮句尾剪掉多欄 PDF 黏進來的「Male Reproductive Disorders:」)。審讀 HIGH #1(黃耆卡表頭歸六經、chip 歸兩經)追到渲染器:表頭讀唯一沒來源的 `channels_entered`(282 筆、field_sources 0)→ 表頭 / chip / 清單卡改同一條鏈 `props.meridian_tropism_zh || channels_zh || channels_entered`。

**(2) 數字**:問題 32 件(HIGH 10 / MED 20 / LOW 2);D29:related_formulas 邊 1,703、解析不到 0、指到退役 0、按鈕標題是 id 的 0、與組成反向集合完全相同的藥 60/315;歸經:channels_entered vs channels_zh 兩欄都有 282 味裡 126 味不同,表頭與 chip 講不同的卡 31 → 0;卡上黃耆歸經 6 經 → 肺、脾。

**(3) 驗證**:formula-standard / herb-standard / content-junk / herb-pair-render / card-text-audience / formula-song / bilingual-render-parity / ratchet 全 PASS;帳本 `apply-field-ledger.js` 5 條「寫入 5,現況不符 0」+ herb_pairs.json 原文精確替換 1 行;審查與分支 CI(7ea8825f)進行中。

**(4) 待 Ting(審讀包其餘 26 件裡的 HIGH/系統性)**:大青龍湯麻黃本方功效只寫「止咳化痰」(漏發汗解表);某方 contraindications/cautions 全空(組成含黃耆、熟地);黃芩 `dosage_g.standard_daily_g` 缺口(dosage_normalized 有 3–10g 但畫面不接,B3 劑量形狀公約未結案);`formula_family → derived_from` 反向缺 33/94(`link-formula-family-back.js` 可重跑);`formula.dao_chi_san`、`formula.long_dan_xie_gan_tang` 的 formula_family 各一條指向自己;composition `in_formula_zh` 系統性樣板(126 組合,炙甘草同一句 56 方共用);`channels_entered` 282 筆整批去留;64/223 方 contraindications 與 cautions 逐字重複。

**(5) SHA**:`a0db747a` `98e82e1d`(審讀)→ `20e75252` `75c6f055`(修)→ `7ea8825f`(rebase)。

---

### 包 B 第二輪(審查 b2bb4e14 → 8a3b2ba9)

- **H1** 九條 min-height 44px / font-size 0.75rem 改在全域,桌面 1280 也吃到(`.cat-chip` 39 → 44px、`.k-open-detail` 32 → 44px、`#ws/herb` 整頁高 40,768 → 42,382)→ 全部收回原值,集中到一個 `@media (max-width: 860px)` 區塊。1280 重量:chip 38.95、CTA 32.16、`.k-status` 11.52px、下拉列 41px、名字與副標同一行 —— 桌面回到 main 原樣;375 重量:chip 44、CTA 44、`.k-status` 12px。
- **H2** 副標被容器裁掉沒有提示。追根因:`.gr-item__sub` 是 inline `<span>`,既有的 `text-overflow:ellipsis` 對 inline 無效(clientWidth 0);375 寬搜「湯」24 列裡 16 列副標溢出到 `.gr-item` 外(最長 541px),`#globalResults` scrollWidth 512 > 317 → `display:inline-block; max-width:100%`:溢出列 16 → 0、scrollWidth 317 = clientWidth、省略號真的出現(截圖:「解表劑ー…」)。
- **H3** 第一版 commit 說 `.k-removed-note small` 修掉「整頁 scrollWidth 838」:局部確實修好(340 → 243px),但 `#ws/condition` 的 838 在 main 與第一版都一樣 —— 真正原因是 `.fab-stack`(position:fixed)在該頁被算到 773–825px,**main 就有的獨立缺陷,本包沒解**,列待辦。
- M1 第一顆 commit 改的 `@media(max-width:1040px) .os-dashboard` 是死碼(該 class 永遠與 `.home-hero` 同時出現);M2 `.gr-group__title` 11.84px 只差門檻 0.16px,論證弱,在 CSS 註解標明。

### 包 D 第二輪(審查 75c6f055 → bf50aac0)

- **H1** 我在大建中湯考點寫的「人參(佐,補中益氣)」沒有來源(全庫 352 處樣板句)→ 改回審讀包核可、`composition[2].role_reason_zh` 前四字「大補元氣」。**H2**「見本卡組成表說明」指向不存在的區塊 → 「見學習備註」(`clinical_use_note` 渲染成「學習備註 Study context」)。卡上重讀確認。
- **H3** 茯苓 `tcm_properties.meridian_tropism_zh[3]`=「肺經(雲端中醫另列;Chenoweth 作 HT/SP/KD 三經)」、`channels_zh[3]`=「肺經(雲端中醫)」:注記塞在經名陣列,統一鏈後三處都印出來。先搬再改:兩個元素改「肺經」,注記原文搬進 `clinical_use_note`(卡上「學習備註」可見)。新閘門順手抓到雄黃「肝」「大腸」、朱砂「心」(少「經」字)→ 統一。
- **M1** 丹參飲三欄第一輪把「養血」整段拿掉,與 `in_formula_en` 的 nourishes Blood 變中英矛盾 → 「活血化瘀、養血,緩急止痛」。**M2** 兩筆實質改寫補 `field_sources`。**M3** 揭露:統一鏈也對調 chip 第二/三順位,96 味 chip 顯示值跟著改(第一輪只寫 31 張矛盾)。**M4** 搜尋索引仍只鍵 `channels_entered`(黃芩卡顯示脾經、搜「脾經」找不到)→ 三欄聯集;現在搜「脾經」找得到黃芩(131 味),搜「心經」仍找得到(舊值保留在聯集裡,這是刻意的:不讓以前找得到的變找不到)。
- **閘門** `scripts/validate-herb-channel-shape.js`:有來源欄元素必須是「XX經/脈」(0 筆違規)、`channels_entered` 英文/縮寫 52 個只 WARN、三個顯示點與搜尋索引必須走 `herbChannelsZh`;`--self-test` 7 條負控。以前把鏈改回舊版、注記留著,13 支驗證器全綠。
- 帳本合計 6 + 12 = 18 條,`apply-field-ledger` 現況不符 0。

## 包 E · 驗收旅程

`docs/audits/QA_FIVE_DAY_JOURNEYS_2026-09-07.md`:001(搜尋)三版對照表已填、003(品質頁)已填、002(手機)待包 B 落地後填;pdftotext 依賴與 SHA/CI 慣例已寫。Browser pane 隱藏時真鍵盤注入送不到頁面、rAF 不跑 —— 量測方法注記在同一份檔。

## 今日新增的閘門 / 契約(進 CI)

`test-unified-search.js`、`test-quality-panel-honesty.js`、`validate-lazy-grid-wiring.js`(+ self-test)、`validate-interactions.js` 四入口同路檢查;`validate.yml` push 觸發加 `claude/**`;`scripts/lib/extract-app-functions.js`(app.js 頂層函式抽取,讀過頭會丟錯)、`load-knowledge.js` 綁 `window`。
