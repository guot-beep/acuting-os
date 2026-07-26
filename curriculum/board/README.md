# curriculum/board/ — 考試範圍與複習資料

**收什麼:** 考試 outline、範圍表、題庫、模擬題、複習清單、各州執照要求、
CALE / NCCAOM 官方文件。

**不收什麼:** 教學內容本身。一份「解表藥複習表」如果是老師的教材 →
`herbs/`;如果是考試委員會發的範圍 → 這裡。

## 這個資料夾決定「順序」,不決定「內容」

board outline 的角色是**框架**:告訴我們哪些藥/穴/病一定會考、先做哪一批。
內容還是從課件和權威來源來。所以:

- ✅ 「outline 有列 40 個穴 → 這 40 個先做,先做常考經絡」
- ❌ 「outline 寫某穴主治三項 → 卡片就只寫三項」(outline 是範圍不是教材)

批次順序在 `docs/HERB_FILL_DISPATCH.md` 和 `docs/ACUPOINT_FILL_DISPATCH.md`,
它們的排序依據就是這裡的文件。outline 換版本(例如 2026 版)時,回來更新這裡,
再回頭調那兩份 dispatch 的批次順序。

⚠️ 版本要寫進檔名 —— 考綱會改,舊版的範圍拿去衝會白做:
`NCCAOM_outline_2026.pdf`、`CALE_content_outline_2025.pdf`

## 不要在卡片上假造考試出處
卡片曾經硬寫過「Bastyr Exam Pearl」「NCCAOM actions」這種標籤,但那些值其實不是
從考綱來的。**`exam_importance` / `exam_pearl` 只有在真的能指到這個資料夾裡某份
文件時才填**,並在 `field_sources` 寫清楚是哪一份哪一頁。指不到就留空。
