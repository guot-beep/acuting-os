# 開新 Claude Code 環境（要有網路）時貼的內容

Ting 用法：建一個新環境時選**開放網路**的政策，開新 session 後把下面整段貼給它。

---

> 你在 AcuTing OS 這個 repo（`guot-beep/acuting-os`）接續中藥卡工作。前一個
> session 的環境網路被限制（連 CloudTCM、American Dragon、chinesemedicineatlas
> 都連不上，連 example.com 也不行——是環境層級的政策，不是這幾個網站被擋），
> 所以查證類的工作留到你這裡做。
>
> **第一步：切到這個分支，不要開新分支、不要碰 main。**
> ```
> git fetch origin
> git checkout claude/acuting-os-rebuild-analysis-u0e82n
> git pull origin claude/acuting-os-rebuild-analysis-u0e82n
> ```
> 這個分支已經包含 main 的全部內容（Codex 的 herb batch 9–11、首頁影片、
> pattern chip 等等都已經合併進來），是目前最新的工作狀態。對應的 PR：
> **#58**（draft，`claude/acuting-os-rebuild-analysis-u0e82n` → `main`）。
>
> **第二步：依序讀完這幾份，不要跳：**
> ```
> docs/BLUEPRINT.md
> docs/CONTENT_PIPELINE.md
> docs/HERB_RECORD_STANDARD.md
> docs/ANTIGRAVITY_HERB_FETCH_BRIEF.md   ← 你的任務規格在這份的 §1
> ```
>
> `ANTIGRAVITY_HERB_FETCH_BRIEF.md` §1 是完整的任務說明（建哪些藥、查重規則、
> 來源優先序、紅線），你就照那份做——它原本是寫給另一個工具的，但內容對你
> 完全適用，唯一差別是你有網路可以真的打開 CloudTCM/American Dragon 的頁面。
>
> **這個 repo 目前唯一能做的真來源查證就是你這個 session。** 課件
> （`curriculum/herbs/`）裡的內容前一個 session 已經核對過、能做的都做了；
> 缺的正是需要開網頁確認的部分——American Dragon 的精準頁、CloudTCM 的原文/
> 古文補充、以及兩邊劑量/命名不一致時要不要當同一味藥。
>
> **開工前先看 `data/herbs/herb_canon_shortlist.json` 裡的 `herb.he_tao_ren`
> （核桃仁）這一筆**，那是 Codex 做對的示範：同名異寫不混在一起（核桃仁／
> 胡桃仁／野核桃仁分清楚）、來源衝突留著不做假共識、`exact_source_url` 是
> 真的打開過的頁面。照那個嚴謹度做。
>
> **每做完一批（建議 5 味一批），跑：**
> ```
> node scripts/build-data.js
> node scripts/validate-herb-standard.js
> node scripts/validate-content-junk.js
> node scripts/stamp-herb-card-grade.js --apply
> ```
> 全綠才算做完。`stamp-herb-card-grade.js` 是新的：它會把真的通過模板規則的
> 卡標成 `card_grade: "template"`，不是你自己判斷，是腳本核對過的。
>
> **完成一批就直接 commit + push 到這個分支**（不用等全部做完），訊息裡寫
> 建了哪幾味、來源查到什麼衝突、決定不做的事。PR #58 會自動更新。

---

## 給 Ting／Claude 看的背景

前一個 session（分支 `claude/acuting-os-rebuild-analysis-u0e82n`）在合併
Codex 的 main 之後，做了三件跟接手有關的事，值得知道：

1. **抓到沙苑子/茵陳蒿的查重陷阱**——`missing_report.json` 曾把 Sha Yuan Ji Li
   / Yin Chen 列為缺卡，其實是已存在紀錄的別名沒填。已修，別在新 session 裡
   重踩。
2. **`card_grade` 判定曾經漏掉別人的卡**——用 `field_sources.actions_en`
   判斷「模板級」，會漏掉 Codex 用 `field_sources.functions_zh` 記出處的卡。
   已修成兩個 key 都認，`scripts/stamp-herb-card-grade.js` 是修好後的版本。
3. **首頁影片一度會外洩 `curriculum/` 到公開部署**——已修，`build-site.js`
   現在有機器檢查，不會再發生。

這些都已經 commit 進這個分支，新 session 不用重做，直接接續建卡就好。
