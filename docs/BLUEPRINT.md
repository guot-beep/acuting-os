# AcuTing OS — Blueprint(定案藍圖)

**Status: canonical.** 這份文件是本站的方向定案 — 目的、架構、頁面契約、
未來 2–3 個月路線圖。任何 AI(Antigravity / Codex / Claude / 其他)接手任何
工作之前先讀這份;跟其他文件衝突時,以這份 + Ting 的最新指示為準。
架構已經調整過三次,**這一版是定案,不要再重新發明**。改動架構 = 先問 Claude(總指揮),大方向 = 問 Ting。

Last updated: 2026-07-25 (Claude, per Ting's vision statement).

---

## 1. 這個網站是什麼(Purpose)

**Ting 的私人中醫知識系統 + 臨床病例工作台。不公開。**

- 私人使用:無隱私疑慮、無版權疑慮(個人學習收集)。日後會改名。
- 目的一:**有條理地收集知識**,支撐多張執照 — 美國針灸師執照,之後的
  advanced 執照。收集要系統化,才查得到、記得住、考得過。
- 目的二:**長期病歷紀錄與學習** — 建立 Ting 自己的一套知識體系:
  哪一種病、什麼病程階段、怎麼治,**中西醫結合**。
- 目的三(未來):**飲食/生活建議層** — 系統化收集食療、飲食與生活調整
  內容(參照 chinesemedicineatlas 的 food 區),融合西醫、中醫、營養學,
  注意**地域、季節、年齡**差異 → 最終建構出給病人的專業建議模板。

**臨床北極星**(內容為此服務):在美國執業,看懂西醫診斷,再用中醫輔助 —
① 中西藥交互安全第一 → ② 針灸配合西醫治療、減輕 side effects →
③ 處理主要症狀 → ④ 長期治本、調理體質。
安全欄位(交互作用/禁忌/刺深/red flags)永遠優先審核。

## 2. 架構定案(Architecture — settled, do not reinvent)

**技術**:純靜態 — `index.html` + `app.js` + `js/{router,knowledge,review}.js`
+ `styles.css`。資料一律 JSON(`data/`)→ `scripts/build-data.js` →
`data/generated/*.js`。無框架、無打包器、**無圖片檔**(圖片大、拖慢網站 —
視覺一律外連 URL,不下載嵌入)。

**外殼(atlas 風,參照 chinesemedicineatlas 的架構,不放圖)**:
- 暖米紙底 + 深綠/金 + Noto Serif TC 標題。
- **唯一導覽 = 右側滑出面板**(分組:首頁/查詢/臨床/系統),由右下 ☰ FAB
  開啟(任何捲動位置都按得到)。右下另有 🔍(回首頁聚焦搜尋)與 ↩。
  頂欄只有站名,不放按鈕。
- **一個主題 = 一個獨立分頁**(workspace):acu / formula / herb /
  condition / comparison / cases / quality / sources。互不堆疊、不互相捲到。
- **首頁 = 全站統一搜尋 + 蓮花圖**,無其他入口(入口都在面板)。
  搜尋即時分類列出 穴位/方劑/中藥/病症/病例,點了直接開單頁或學習卡。

**頁面契約(最重要的 UI 規則)**:
- **主題分頁只放查詢用的東西**:標題一行 → 搜尋框 → 分類 chips → 卡片。
  沒有 schema 卡、進度條、review 狀態說明、quicknav — 那些全部屬於品質頁。
- **分類 chips 是唯一的分類系統**:小圓圖示(分類首字)+ 雙語標籤 + 數量,
  選中時下方一行雙語解釋。同名分類自動合併(英文子類真的不同才分開)。
- **品質頁 = 誠實報告**:各層進度總表(製作 vs 驗證兩條 bar)、真實缺口、
  歷史紀錄指向 PROJECT_LOG/DECISIONS、下一步。永遠不准出現「骨架=100%完成」
  這種假數字。
- 固定頂欄已有 scroll-padding 補償;跳轉永遠不會被蓋住。

**資料與內容管線**(詳見 `docs/CONTENT_PIPELINE.md`):
`curriculum/`(Ting 課件,Tier-1 最權威)→ CloudTCM / American Dragon /
atlas(Tier-2 補深度)→ 逐欄位雙語 + 標籤 + 引用 → `review_status:"draft"`
→ Ting 在 App 內 RV1 打勾 → 匯出 → `apply-review-verdicts.js` →
`source_checked`。欄位規格:`docs/HERB_FORMULA_CARD_SPEC.md`(兩層:
Glance 掃描層 / Study 深度層)。劑量與安全數字**絕不虛構**。

**分工**(詳見 `docs/AI_ROLES.md`):
- Antigravity:只碰 `data/`(內容生成)。**絕不碰 js/、app.js、index.html、
  scripts/、schema** — 已經發生過覆蓋事故。
- Claude:程式、架構、合併、總指揮。Codex:QA + validator 牆。Ting:驗證與方向。
- Git:所有人經 branch→PR→main;Windows 端用 `update.bat` 同步(先 commit
  再 pull 再 push,永不互相覆蓋)。

## 3. 現況(2026-07-25 誠實快照)

| 層 | 總數 | 製作 | 已驗證 |
|---|---|---|---|
| 穴位(含董氏/耳穴) | 751 | ~100% 骨架+大量內容 | 1 |
| 中藥 | 266 | ~98% | 57 |
| 方劑 | 173 | ~88% | 0 |
| 病症 | 150 | 100%(草稿) | 0 |
| 辨證鑑別 | 11 表 | 150/174 格 | — |
| 病例 | Ting 本機 | 系統可用 | — |

缺口:穴位缺針法 318、缺安全 58;中藥/方劑尚未達
HERB_FORMULA_CARD_SPEC 的完整欄位(巢狀主治、劑量、炮製、對藥…)。

## 4. 路線圖:2–3 個月做到「可以使用」

「可以使用」的定義(驗收清單):
- [ ] Ting 念書時,任何穴位/中藥/方劑/病症 **10 秒內查到、內容可信賴**
      (draft 有標示、驗證過的一眼可辨)。
- [ ] 中藥+方劑達到卡片規格的核心欄位(性味歸經/功效主治巢狀/劑量/禁忌/對藥)。
- [ ] 病例:新病人 → SOAP → 追蹤 → 連回知識庫,全流程順手。
- [ ] 手機可用(部署到有密碼保護的網址)。
- [ ] 每層驗證進度在品質頁真實可見、持續上升。

**Phase 1(第 1–2 週)— 中藥衝刺**
- Ting 把課件放進 `curriculum/herbs/` + board exam outline。
- Claude 用 1 味藥跑完整管線做示範卡(curriculum→4源→雙語→引用)。
- 產出「接手指令」給 Codex / 第二個 Claude(Antigravity 沒 token 期間)。
- 目標:高頻考試藥 50–80 味達規格、Ting 驗證數穩定成長。

**Phase 2(第 3–4 週)— 方劑**
- 同管線填方劑:組成+劑量+君臣佐使、方義、加減、對藥、禁忌。
- 方劑↔中藥↔病症三向連結(點得過去)。

**Phase 3(第 5–6 週)— 病症互標 + 辨證鑑別**
- 病症:中西病名雙向標籤(中英),連穴位/方劑/red flags。
- 辨證鑑別:把 Ting 的 TCM 病理 + Advanced Therapeutics 課的對照表
  建成 comparison tables(她提供內容,AI 建表)。

**Phase 4(第 7–8 週)— 擴增穴位 + 病例強化**
- 頭穴、耳穴補完、平衡針法、運動醫學、美容針法(依 Ting 課程優先序)。
- 病例流程打磨:模板、追蹤指標、療程視圖。

**Phase 5(第 9–10 週)— 部署 + 驗證衝刺**
- 部署:Vercel/Cloudflare Pages + 密碼保護 → 手機可用。
- 驗證衝刺:品質頁排批次,Ting 邊念邊掃 RV1。
- 站名更換(Ting 決定新名字)。

**之後(下學期起)**:西醫病理/藥理層、herb–drug 交互表、red flags 完整化、
**飲食/生活建議層**(食物性味、食療、生活調整;地域×季節×年齡模板)。

## 5. 給接手 AI 的一句話 Handoff

> 讀這份 → `docs/AI_ROLES.md`(你的角色)→ `docs/CONTENT_PIPELINE.md`
> (內容怎麼做)→ 相關 SPEC。內容只進 `data/`,程式問 Claude,
> 假完成度是最重罪,安全數字絕不虛構,每批走 branch→PR,
> PROJECT_LOG 留 5 行 handoff。

## 6. 待 Ting 決定(open questions)

1. ~~部署平台~~ **已決定(2026-07-25):Cloudflare Pages + Access 密碼。**
2. 新站名想好了嗎?(改名連動 repo 名/標題/todo)
3. 辨證鑑別的課堂對照表:拍照/貼文字到 `curriculum/` 哪批先做?
4. ~~中藥優先序~~ **已決定(2026-07-25):照 board exam outline 衝。**
   Tier-1 教材已入庫:`curriculum/herbs/`(356 味拼音/拉丁表 + 功效分類表 +
   Materia Medica 精要,含文字抽取版)。
