# 穴位優化接手指令(貼給 Codex / Antigravity)

> 你在 AcuTing OS repo 幫 Ting **優化穴位卡**(不是從零填 —— 361 穴欄位已近乎填滿,
> 你的工作是**校正、精煉、補英文、加考點**)。
>
> **開工前依序讀**:`docs/BLUEPRINT.md` → `docs/AI_ROLES.md` →
> **`docs/ACUPOINT_CARD_TEMPLATE.md`(目標卡片 + 硬規則)** →
> `curriculum/acupoints/README.md`(Ting 的針灸課件)。
> 中藥的做法可參考已定案的 `docs/HERB_CARD_TEMPLATE.md` 與樣板 `herb.du_zhong`。
>
> **目標檔**:`data/acupoints/361.json`。**一次一條經絡**。
> 先跑清單看這批要修什麼:
> ```
> node scripts/validate-acupoint-standard.js --worklist --channel LU --all
> ```
>
> **來源優先序**(先框架後內容,與中藥卡流程相同、參照物不同):
> ⓪ **board outline**(`curriculum/board/`)決定做哪些穴、標 `exam_importance`
> —— 它是**範圍不是教材**,不要拿 outline 的條列當主治;
> ① `curriculum/acupoints/` 課件(14 條經絡講義 + Techniques + AP Point Book)
> ② **eLotus** ③ **CloudTCM 雲端中醫** ④ WHO 定位標準。
> ⚠️ 這裡 **eLotus 排在 CloudTCM 之前**(和中藥卡相反)。現有 361 穴內容多半是
> CloudTCM 來的,所以要**用課件與 eLotus 回頭校它**,不是拿現有內容當基準。
> 董氏奇穴走另一套:**tungs-acupuncture.com + eLotus**,資料在 `data/tung/`,
> **不要混進 `361.json`**,也不要拿十四經取穴邏輯去套董氏分區。
> 兩源不合 → **兩個都記、標出處**,絕不二選一。查不到就標「待補」,**不准假裝查過**。
>
> 📌 **樣板已定案:`docs/ACUPOINT_CARD_TEMPLATE.md`(16 區塊 + 四層分工 +
> A1–A9 硬規則 + 來源交叉對照 + 配穴格式)。動手前必讀。**
>
> **最高原則:只加深,不刪除。** 既有的配穴、臨床要點、現代研究、艾灸、按摩、
> 古籍都是先前從權威網站收集的,問題是「放錯層、沒結構、缺英文」,不是內容爛。
> 整理 = 重新歸位,不是重寫覆蓋。**A9 會擋下清空配穴或臨床要點的 commit。**
>
> **先跑解析器,不要用眼睛讀 PDF**:
> ```
> python3 scripts/parse-channel-curriculum.py "curriculum/acupoints/<檔名>.pdf"
> python3 scripts/parse-channel-curriculum.py "<檔名>.pdf" --code ST36
> ```
> 課件是四欄表格(穴名／定位／功效／主治),攤平讀會**張冠李戴** ——
> LI12–LI16 的功效在版面上是連成一片的。解析器用座標配對,不靠閱讀順序。
> 它輸出的是**原文擷取,不是卡片**:英文照抄、沒有翻譯也沒有精煉,
> 那兩件事仍然要你做。它只保證「這條功效屬於這個穴」。
> 已用 LU(11 穴逐條吻合)與 LI13(最難歸屬的一穴)驗證過。
>
> **最容易做錯的三件事**
> 1. **功效**:交叉比對後留 **2–8 條(目標 4–6)**,**最重要的排前面**
>    (判準:board 考點 + 各家共識)。現況很多穴列了 9–16 條甚至 36 條,要**精煉**;
>    但真的只有 3 條就列 3 條,不要湊數。
> 2. **中英對齊**:`functions_en` 現在常常只有 1 條、中文卻 16 條 ——
>    必須**逐項對應寫齊**。長度不一致 = A4 FAIL;不確定就整個 `_en` 留空。
> 3. **禁忌要穴位專屬**:「局部皮膚破損或感染時避開」這種共用套話 = A8 FAIL。
>    寫這個穴的真實風險(氣胸、大血管、神經、孕婦禁針…)。
>
> **絕對不可以**:刪弱既有的安全警告(LU1/LU2/GB21/KI27 等氣胸警告)、
> 動針刺深度數字除非有更好來源(要標出處)、把英文寫進 `_zh` 欄位。
>
> **每穴要補**:`exam_importance`(board 考點 + 特定穴身份:五輸/原/絡/俞/募/
> 八會/交會)、`exam_pearl`(2–3 句記憶重點)、`field_sources`(逐欄引用,
> 課件用 `curriculum/acupoints/<file>#p<N>`)、`review_status:"draft"`。
>
> **完成條件**:`node scripts/build-data.js` 後,
> `validate-acupoint-standard.js`、`validate-data.js`、`validate-point-ids.js`、
> `validate-encoding.js`(中文不可變亂碼)、`validate-content-junk.js` 全綠。
> 開 branch `<你的名字>/points-<經絡>` → PR,**不直接推 main**。
> PROJECT_LOG 留 5 行 handoff(經絡、穴數、來源、validator 結果、疑問)。
>
> **紅線**:只碰 `data/acupoints/`。**絕不碰** `js/`、`app.js`、`index.html`、
> `scripts/`、`data/generated/`(用 build-data 重生)。
> 架構問題問 Claude,安全數字衝突問 Claude,方向問題問 Ting。

## 批次順序

LU(11)→ LI(20)→ ST(45)→ SP(21)→ HT(9)→ SI(19)→ BL(67)
→ KI(27,注意 11 穴的 `cautions_zh` 是英文要修)→ PC(9)→ TE(23)
→ GB(44)→ LV(14)→ CV(24)→ GV(28)

建議 **LU 先做**(11 穴,小批),Ting 驗收後再放量。
