# 給新 Claude Project 的指令（中藥卡 / 方劑卡）

Ting 用法：**把下面 §1 整段複製貼給新的 Claude project。** 其餘章節是給你自己看的，
說明為什麼這樣寫、以及怎麼驗收它交回來的東西。

---

## §1 貼給 Claude 的指令（copy-paste）

> 你在 AcuTing OS 這個 repo 幫我（Ting）填**中藥卡**或**方劑卡**。這是我私人的
> 中醫學習系統 + 臨床病例本，不是公開產品。目的是為了美國針灸執照考試、
> 長期病例紀錄、以及建立我自己的 病 → 證 → 方/穴 知識體系。
>
> **開工前，依序讀完這四份，不要跳：**
> ```
> docs/BLUEPRINT.md
> docs/CONTENT_PIPELINE.md
> docs/HERB_CARD_TEMPLATE.md      ← 做中藥卡讀這份（E1–E9）
> docs/FORMULA_CARD_TEMPLATE.md   ← 做方劑卡讀這份（F1–F12）
> docs/FORMULA_FILL_DISPATCH.md   ← 做方劑卡再加讀這份
> docs/HANDOFF_2026-07-28.md      ← 現在進度到哪、什麼還沒做
> ```
> `FORMULA_CARD_TEMPLATE.md` 的**第一部分是十個教訓**，每一條都是這個專案真的
> 踩過的坑。**請完整讀完再動手** —— 規則沒有理由就會被繞過，而那十條每一條都
> 已經被繞過過一次了。
>
> ---
>
> **最高原則：只加深，不刪除。**
> 資料庫的內容大多是有價值的（從權威網站收集的），問題從來不是「內容爛」，
> 而是**放錯層、沒有結構、缺英文**。你的工作是**重新歸位**，不是重寫覆蓋。
> 唯二例外：內容明確錯置（要**搬**，不是刪），或完全損毀的亂碼。
> 兩者都要在 commit 說明改了什麼、為什麼。
>
> ---
>
> **五條紅線，違反任何一條我都會退回：**
>
> 1. **沒有來源就留空，絕不半翻譯。** 英文一律查 glossary
>    （`data/config/acupoint_tag_glossary.json` / `formula_tag_glossary.json`），
>    查不到就**整格留空**。曾經有 1786 個假英文標籤長這樣：`活血 (TCM Action)`。
> 2. **中英必須逐條對齊，不確定就整欄留空。** 長度不同 = 英文整排錯位，
>    而且**看畫面看不出來**，因為兩邊都有內容。
> 3. **不要從名字推測內容。** 曾經有人把方名去掉「湯」當成藥材，
>    36 個方的組成變成「瀉心湯 → 組成：瀉心」。
> 4. **不要用眼睛讀多欄 PDF。** 用 `scripts/parse-formula-curriculum.py` 或
>    `scripts/parse-channel-curriculum.py`。曾經因為壓平多欄，把左欄的分類標題
>    黏到右欄的藥名上，杜仲被歸成開竅藥。
> 5. **來源要真的查過。** 推導得出網址 ≠ 那頁存在 ≠ 內容出自那裡。
>    沒實際核讀過的來源不得寫進 `field_sources`。
>
> ---
>
> **你的寫入腳本必須自己 assert，對不上就 `process.exit(1)` 不寫檔。**
> 直接抄 `scripts/curate-sample-formula.js` 的模式：
> ```js
> // 1 每一句英文都必須出現在該筆資料的課件原文裡
> // 2 中英陣列長度相等
> // 3 只能引用既有資料裡真的存在的東西（藥名、穴名）
> // 4 每一條結構化條目該有的欄位都要有
> if (fail.length) { fail.forEach(console.error); process.exit(1); }
> ```
> 這不是形式。這些 assert 擋下過我 9 次（ST 經）、3 次（SP 經），
> **每一次都是寫的人錯，不是資料錯。**
>
> ---
>
> **來源優先序（不可對調）：**
> ① **考綱**（`curriculum/board/`）決定**做哪些**，不決定內容
> ② **`curriculum/` 課件**是內容主幹，英文照抄不改寫
> ③ eLotus / CloudTCM / American Dragon 補深度
>
> ⚠️ **CloudTCM、American Dragon、chinesemedicineatlas 這個環境連不上（403）。**
> 既有內容是先前抓好的照樣可用，**但不准假裝現在查過**。
> 要新增內容只能從 `curriculum/` 來。
>
> ---
>
> **完成條件：**
> ```bash
> node scripts/build-data.js
> node scripts/validate-formula-standard.js     # 或 validate-herb-standard.js
> node scripts/validate-content-junk.js
> ```
> 必須全綠。⚠️ `validate-data` / `validate-encoding` / `validate-naming`
> **在 main 上本來就是紅的**，那是既有問題 —— **不要為了讓它們變綠而刪資料**，
> 先 stash 再跑一次確認。
>
> **開 branch → PR，不直接推 main。** `review_status` 你只能寫 `"draft"`。
> PR 裡要寫：做了哪一批、幾筆、驗證結果、**以及你決定不做的事和為什麼**。
>
> **紅線範圍**：只碰 `data/herbs/` 或 `data/acupoints/` 與你自己的
> `scripts/curate-*.js`。**絕不碰** `app.js`、`js/`、`index.html`、
> `data/generated/`（用 build-data 重生）。
>
> **不確定就問我，不要猜。** 架構問題、安全數字衝突、方向問題都問。
> 寧可交 5 筆完全正確的，不要交 50 筆看起來完整但錯位的。

---

## §2 為什麼這樣寫（給 Ting 看）

這份跟 `FORMULA_FILL_DISPATCH.md` 的差別：那份假設對方已經在 repo 裡工作，
這份假設**新的 Claude project 從零開始**，所以：

- 先講「這是什麼專案、為誰做的」，否則它會用一般 TCM 網站的邏輯來填
- 五條紅線寫成**具體事故**而不是抽象原則 —— 「不要半翻譯」沒有用，
  「曾經有 1786 個 `活血 (TCM Action)`」才會記得
- 明說 assert 擋過寫的人幾次，讓它知道**這些檢查是給它自己用的**，不是官僚流程
- 明說三個網站連不上，否則它會宣稱查過 CloudTCM

## §3 怎麼驗收它交回來的東西

按這個順序看，任何一項不過就退回：

1. **PR 裡有沒有寫「決定不做的事」** —— 沒寫通常代表它假裝全部做完了
2. **抽一筆看 `field_sources`** —— 每一欄的來源是不是真的對得上那一欄的內容
3. **抽一筆看中英對齊** —— `_zh` 跟 `_en` 陣列長度一不一樣
4. **搜尋 `(TCM Action)`、`待補` 出現在英文欄** —— 半翻譯的痕跡
5. **跑一次驗證器** —— 它說全綠，你自己再跑一次
6. **看它有沒有動不該動的檔案** —— `git diff --stat` 掃一眼

## §4 建議先給它的一批

**不要一開始就給整條經絡或整章方劑。**

- 中藥：先給 **8 味辛溫解表藥**（麻黃、桂枝、紫蘇葉、生薑、香薷、荊芥、防風、羌活）
- 方劑：先給 **辛溫解表 8 方**（麻黃湯、桂枝湯、小青龍湯…）

小批驗收過了再放量。穴位那邊就是這樣做的 —— LU 經 11 穴逐條比對人工謄寫全對之後，
才開始一條經一條經跑。
