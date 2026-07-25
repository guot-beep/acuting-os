# Herb Fill Dispatch — 接手指令(Codex / 第二個 Claude Code 用)

Ting 把這整段貼給任何要幫忙填中藥的 AI 即可。Antigravity 回來後也用這份。

---

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
>
> **每味藥要填**(目標檔 `data/herbs/herb_canon_shortlist.json`,對照
> SPEC §3):帶聲調拼音、中英名、pharmaceutical latin(xlsx 有)、
> category(功效分類表)、性味歸經(雙語)、**巢狀主治**(功效→證型→臨床
> 表現,Materia 的 bullet 就是這個結構)、配伍(s = pairing →
> major_combinations)、劑量(Materia 的 "Dosage: X–Y grams";**沒來源就留空,
> 絕不編數字**)、禁忌/注意、modern_pharmacology(Materia 的 "WM:" 行)、
> 每欄位 `field_sources`(`curriculum/herbs/<file>#p<N>` 或 URL)、
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
