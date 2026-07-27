# 穴位卡樣板與優化流程(Ting 2026-07-26)

中藥卡已定案(`docs/HERB_CARD_TEMPLATE.md`)。穴位走**同一套邏輯**,但起點不同:
Antigravity 已把 361 穴的欄位填到近 100%,所以這裡的工作**不是補空白,是優化品質**
—— 用 Ting 的針灸課件 + board 考綱去**校正、精煉、加考點**,並補上英文。

機器檢查:`node scripts/validate-acupoint-standard.js`(A1–A8;`--worklist` 出清單)。

---

## 1. 現況診斷(2026-07-26,361 穴)

| 缺陷 | 數量 | 說明 |
|---|---|---|
| **中英陣列未對齊** | **418 組** | `functions_en` 常常只有 **1 條**,`functions_zh` 卻有 9–16 條 —— 英文等於沒寫。跟中藥「英文配到別的標籤」同一種 bug |
| **功效倒貨** | 只有 123/361 在 3–8 條 | 最多的一穴有 **36 條**,完全沒篩重點 |
| **禁忌套話** | 75 穴 | 3 句共用字串(如「局部皮膚破損或感染時避開」)反覆貼 |
| **中文欄放英文** | 11 穴(腎經) | `cautions_zh` 裡是英文套話 |
| **已驗證** | **0/361** | 全部 `sourced_cloudtcm_and_elotus`,Ting 尚未逐穴確認 |
| 針法有具體數字 | 359/361 | 🟢 這塊 Antigravity 做得好,別動壞 |
| 高風險穴安全警告 | 有 | LU1/LU2/GB21/KI27 等氣胸警告都在,**優化時不可刪弱** |

## 2. 卡片目標(每穴)

| # | 區塊 | 欄位 | 要求 |
|---|---|---|---|
| 1 | 標頭 | `code` `chinese` `pinyin`(帶聲調)`english` | 必 |
| 2 | 經絡・部位 | `channel_zh/en` `region` | 必 |
| 3 | **考試標註** | `exam_importance` `exam_pearl` | **新增**:board 考點、五輸穴/原絡俞募/八會/交會等特定穴身份 |
| 4 | 定位 | `location_zh` `location_en` | 必;骨度分寸要精確 |
| 5 | **功效(中英成對)** | `functions_zh` + `functions_en` | **3–8 條,目標 4–6**,交叉比對後排重要性 |
| 6 | 主治(中英成對) | `indications_zh` + `indications_en` | 可較多,重要的排前面 |
| 7 | 針法(安全) | `needling` `acumethod_zh/en` | **必含深度/角度數字**;不可弱化既有警告 |
| 8 | 艾灸・按摩 | `moxa_zh` `massage_zh` | 有就填 |
| 9 | 解剖 | `anatomy_zh` | 有就填;高風險穴必填鄰近臟器 |
| 10 | 常用配穴 | `combine_points_zh` | 穴名會自動連結 |
| 11 | 現代研究 | `modern_research_zh` | 有就填 |
| 12 | **禁忌與注意** | `contraindications` `cautions_zh/en` | **必須穴位專屬**,套話 = A8 FAIL |
| 13 | 來源 | `field_sources` `sources` `visual_links` | 逐欄引用 |

## 2.5 四層分工(Ting 2026-07-27,不可再混)

課件筆記是英文,所以**英文欄承載課件原文**;中文欄是結構化後的版本。
標籤與全文是**兩層不同的東西**,不可以互相取代:

| 層 | 欄位 | 內容 | 長度 |
|---|---|---|---|
| 內容(英) | `functions_en` `indications_en` | Ting 課件原文,照抄不改寫 | 可長 |
| 內容(中) | `functions_zh` `indications_zh` | 結構化中文,帶配伍 | 可長 |
| **標籤(中)** | `action_tags_zh` `disease_tags_zh` | **短標籤**,搜尋與篩選 chip 用 | 2–6 字 |
| **標籤(英)** | `action_tags_en` `disease_tags_en` | 短標籤的英文,查 glossary | 短 |
| 身分 | `point_identity_zh/en` | 五輸、原絡郄募、八會、交會 | — |

⚠️ **曾經踩過**:整理 LU/LI 時把 `action_tags` 直接設成 `functions`,
結果 LU1 的病症標籤變成「肺募穴 —— 主一切肺病,尤其實證:咳嗽、喘鳴、哮喘」
—— 當 chip 沒用,當搜尋詞比原本的「咳嗽」更差。**標籤必須短。**

英文標籤一律查 **`data/config/acupoint_tag_glossary.json`**,不要自己翻,
否則同一個詞在不同經會有兩種英文,搜尋就散了。glossary 沒有的詞**先加進去**再用;
該欄寧可整個留空,也不要半翻(半翻會讓後面所有標籤錯位)。
身分詞(井滎輸經合、原絡郄募)**不可放進 `action_tags`** —— 「募穴」不是穴位做的事。

## 3. 硬規則(validator 會擋)

- **A4 中英逐項對齊**:`_en` 陣列長度必須等於 `_zh`;不確定就整個留空,**絕不錯位**。
- **A6 功效 2–8 條**(目標 4–6):交叉比對課件 + 考綱 + CloudTCM/eLotus,**最重要的排前面**,單一來源的邊緣功效不收。真的只有 3 條就 3 條,不要湊;有 16 條**不要全列**。
- **A7 針法必含數字**:深度/角度是安全欄位。
- **A8 禁忌不可套話**:寫**這一個穴**的實際風險(氣胸、大血管、神經、孕婦禁針等);沒有特殊風險就寫該穴的具體注意,不要貼共用句。
- **A3 `_zh` 欄位必須有中文**(現有 11 穴的腎經 `cautions_zh` 是英文,要修)。
- **安全不可降級**:既有的氣胸/深刺警告只能**加強或補充**,不可刪除或改弱。
- AI 只能寫 `review_status: "draft"`;`source_checked` 由 Ting 的 RV1 流程升級。

## 4. 來源優先序(Ting 定案 2026-07-26 — 與中藥卡流程相同,只是參照物不同)

**先框架、再內容。** board outline 決定**做什麼、什麼是考點**;課件與網站決定
**寫什麼**。順序不可對調 —— outline 是範圍不是教材,不要拿 outline 的條列當主治。

| # | 來源 | 它決定什麼 |
|---|---|---|
| 0 | **Board exam outline**(`curriculum/board/`,NCBAHM / CALE 現行版)| **框架** — 哪些穴要做、先做哪一批、`exam_importance` 怎麼標 |
| 1 | **`curriculum/acupoints/`** — Ting 的針灸課件 | 內容主幹(14 條經絡講義 + Techniques + AP Point Book),逐頁引用 |
| 2 | **eLotus** | 課件沒講到的臨床深度、針法細節 |
| 3 | **CloudTCM 雲端中醫** | 中文深度補充(現有庫存內容多來自此,要當**補充**不是主幹) |
| 4 | WHO Standard Acupuncture Point Locations | 定位以此為準 |

⚠️ 這個順序和中藥卡**不一樣**:中藥卡 CloudTCM 排在前面,穴位卡 **eLotus 在
CloudTCM 之前**。既有的 361 穴內容多半是 CloudTCM 來的,所以整理時要**用 eLotus
回頭校**,不是反過來拿現有內容當基準。

### 董氏奇穴(Tung's points)另一套來源
董氏奇穴不走上面的順序,主幹是:

1. **<https://www.tungs-acupuncture.com/>**(例:婦科五穴頁)— 董門定位與主治
2. **eLotus** — 臨床應用與對照

董氏穴**不要拿十四經的定位邏輯去套**(它有自己的分區與取穴法),也不要把它的
主治混進正經穴卡。資料在 `data/tung/`,與 `data/acupoints/361.json` 分開維護。

**兩源不合就並記、標出處,絕不擅自二選一。**

## 5. 批次順序(照經絡,一次一條)

LU → LI → ST → SP → HT → SI → BL → KI → PC → TE → GB → LV → CV → GV

每批完成 = Ting 可在 App 內用 RV1 逐穴掃驗證。
清單:`node scripts/validate-acupoint-standard.js --worklist --channel LU --all`
