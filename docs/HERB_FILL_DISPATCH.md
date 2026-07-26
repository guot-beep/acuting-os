# Herb Fill Dispatch — 接手指令(Codex / 第二個 Claude Code 用)

Ting 把這整段貼給任何要幫忙填中藥的 AI 即可。Antigravity 回來後也用這份。

---

## 考綱／課件缺卡處理（Ting 定案 2026-07-26）

凡 NCBAHM 考試大綱或 `curriculum/` 課件列出的中藥、方劑、穴位，若資料庫尚無正式記錄，**必須建立新記錄**。不得因沒有現成模板而跳過、只寫待補，或用相近項目代替。新記錄仍須遵守穩定 ID、雙語、逐欄來源、`review_status: "draft"` 與完整驗證規則；若碰到同名、ID 或架構衝突，保留內容並交 Claude 裁定，不得擅自刪除考綱項目。

## 貼上用 Prompt(copy-paste)

> 你在 AcuTing OS repo 幫 Ting 填中藥卡。開工前依序讀:
> `docs/BLUEPRINT.md` → `docs/AI_ROLES.md` → `docs/CONTENT_PIPELINE.md` →
> `docs/HERB_FORMULA_CARD_SPEC.md` → **`docs/HERB_RECORD_STANDARD.md`(欄位規範,機器強制)** → `curriculum/herbs/README.md`。
>
> **來源優先序**:① `curriculum/herbs/` 的 Chenoweth 三檔(`.md`/`.csv`
> 文字版;356 味拼音/拉丁表、功效分類表、Materia Medica 精要 — 這是 Ting
> 的課件,最權威)+ board exam outline 範圍 → ② CloudTCM、American Dragon、
> chinesemedicineatlas 交叉補深(中文深度/英文巢狀主治/掃描層呈現)。
> 兩源不合 → 兩個都記、標明出處,絕不擅自二選一。
> **現有 CloudTCM URL map 沒收錄，不代表網站沒有該藥。** 必須再用中文藥名
> 查找並核對精確 `/herb/<數字>` 頁；找到後補回
> `data/imports/cloudtcm/herb_url_map.json`，不得直接宣告 CloudTCM 無資料。
> **CloudTCM 找不到單味藥頁時，先查可核讀的專業單味藥頁（例如 Traditional
> World Medicine），仍找不到再查百度百科**，並記錄實際條目 URL。專業頁面
> 實際核讀後，可搬入圖像、辨識、性味歸經、功效、主治、炮製、對藥與劑量，
> 但必須逐欄標來源；百度可補備援圖像、別名、基原與一般內容。劑量、毒性、
> 孕期、禁忌及交互作用必須再與課件、American Dragon 或其他專業來源交叉核對，
> 不以單一外部網站定案，也不得覆蓋來源差異。
>
> **每味藥要填**(目標檔 `data/herbs/herb_canon_shortlist.json`,對照
> SPEC §3):帶聲調拼音、中文名、英文 common name、pharmaceutical latin(xlsx 有)、
> **`name_en` 只放拼音旁的英文 common name；拉丁藥名只放
> `pharmaceutical_latin`，在標頭下一排獨立顯示，兩者不得混用**；
> category(功效分類表)、性味歸經(雙語)、**巢狀主治**(功效→證型→臨床
> 表現,Materia 的 bullet 就是這個結構)、配伍(s = pairing →
> major_combinations)、劑量(Materia 的 "Dosage: X–Y grams";**沒來源就留空,
> 絕不編數字**)、禁忌/注意、modern_pharmacology(Materia 的 "WM:" 行)、
> 每欄位 `field_sources`(`curriculum/herbs/<file>#p<N>` 或 URL)、
> 所有實際核讀的外部網站與圖像另同步到具名 `source_citations`
> (`name` / `url` / `scope`)，否則畫面不會顯示；未核讀的來源不得列入。
> 對藥優先寫入 `data/herbs/herb_pairs.json` 完整記錄：七情 `relation`、
> 中英配伍理由、**中英主治、中英注意**與 sources；已有正式對藥時，單味藥
> `key_pairs` 留空，避免簡略樣式遮住原本不同顏色的「主治／注意」卡。
> **對藥沒有每味一則的上限**：逐一檢查課件 pairing / major combinations、
> NCBAHM 對藥與已核讀專業頁面，有幾組重要且可溯源的配伍就建幾筆正式記錄；
> 不得只取第一組或合併不同配伍。A+B / B+A 共用同一筆記錄；只有來源確實只
> 支持一組時才只顯示一組。
> **主治與現代藥理不設筆數上限**：來源有 8 則具體且有區別的資料就寫滿 8 則，
> 不得套用傳統功效的 3–5 條濃縮規則。只合併完全同義的重複敘述；不同證型、
> 症狀、用途、作用機制或研究結果全部保留。`modern_functions_zh/_en` 必須逐項
> 對齊，且每個採用來源寫入 `field_sources`。
> **`clinical_use_note` 必填**：寫核心辨識定位、相似藥鑑別、重要配伍、
> 炮製／安全記憶與 board 考點，不得只是複製功效主治；來源同步寫入
> `field_sources.clinical_use_note`。
> `review_status:"draft"`。`_zh` 欄位放英文 = 缺陷。
> **不可覆蓋既有更豐富的值** — 只加深、不變薄。
>
> **批次**:一批一個功效分類(例:Wind Cold Releasing 一批),10–20 味。
> 批後必跑:`node scripts/build-data.js` → `node scripts/validate-data.js`、
> `validate-content-quality.js`、`validate-content-junk.js`、
> `validate-herb-canon.js`、`validate-encoding.js`(中文不可變亂碼)。
> 全綠才 push:開 branch(`<你的名字>/herbs-<分類>`)→ PR,**不直接推 main**。
> PROJECT_LOG.md 留 5 行 handoff(批次、味數、來源、validator 結果、疑問)。
>
> **紅線**:絕不碰 `js/`、`app.js`、`index.html`、`scripts/`、schema、
> `data/generated/`(用 build-data 重生,不手改)。架構問題問 Claude,
> 安全數字衝突問 Claude,方向問題問 Ting。

---

## 品質樣板(先看這個再動手)

📌 **樣板已定案:`docs/HERB_CARD_TEMPLATE.md`(12 區塊 + 30 欄位清單 + 硬規則)。
動手前必讀。**

**`herb.du_zhong`(杜仲)= 標準樣板**(Ting 定案 2026-07-25:對藥與考試標註保留,
Primary Actions 區塊已刪)。
每味藥做完應該長這樣:帶聲調拼音、tcm_properties、functions_zh 只放傳統功效
且與 actions_en 逐項對齊、indications_zh 是「證型 —— 配伍」結構、完整
`herb_pairs.json` 對藥卡（相須／相使、配伍理由、主治、注意均雙語）、
pao_zhi_notes_zh、dosage 物件、exam_importance/exam_pearl、field_sources 逐欄
引用、具名 source_citations 顯示所有實際核讀外部來源、**中英標籤成對且逐項對齊**(condition_tags_en / modern_functions_en /
cautions_en)。**兩源不合就並記**(看杜仲的性味與劑量欄怎麼寫)。
⚠️ 標籤英文**長度必須與中文相同**,不確定就整個留空 —— 錯位會讓所有標籤配錯,
validator E5 會直接擋下。
註:American Dragon / chinesemedicineatlas 的線上對照需要有瀏覽能力的 agent;
沒有瀏覽能力就標註「AD 對照待補」,不要假裝查過。

## 批次順序(board outline first,Ting 2026-07-25)

照 Chenoweth 功效分類表的分類次序跑(它本身就是考試導向的分類):
1. Wind Cold / Wind Heat Releasing(解表)
2. Clear Heat 系列(瀉火/燥濕/涼血/解毒/虛熱)
3. Tonify 四類(氣血陰陽)
4. 理氣、理血、止血
5. 祛濕/利水、化痰止咳
6. 安神、平肝熄風、開竅
7. 其餘(瀉下、消食、驅蟲、固澀、湧吐、外用)

每批完成 = Ting 可以在 App 內用 RV1 直接掃驗證。
