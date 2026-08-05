# 排期 2026-08 → 12(趕工版,可派給其他 AI)

Ting 2026-07-29:「我這八月先把穴位卡優化跟方劑卡建立大概,然後呢?
排期大概是甚麼,我好心裡有底請其他 AI 一起製作趕工。」

這份文件排的是**八月到十二月**。它不改 `docs/BLUEPRINT.md` 的架構定案,
只是把 BLUEPRINT §4 的 Phase 1–5 依「中藥已提前做完」的現實重新排序,
並補上 Ting 沒問到但會擋路的前置工具。
Owners:**C** = Claude · **X** = Codex · **A** = Antigravity · **T** = Ting 本人。

---

## 0. 誠實現況(來源:`data/audits/missing_report.json.quality_layers`)

> **2026-08-01 Codex refresh:** Antigravity/Claude 已把標準 361 穴推到
> `validate-acupoint-standard.js --worklist --all` 全綠，Codex 重新實測為
> **361/361 template-grade、0 worklist defects**。所以下面原本 2026-07-29
> 的「穴位剩 264 穴」已過期；目前穴位的下一層不是繼續建卡，而是 Ting
> 的 RV1 人工源審核與之後臨床連結補強。方劑工具/量尺與方劑 validator
> defects 仍是下一個工程阻塞點。

| 層 | 卡片存在 | 內容已填 | **達樣板等級** | **已驗證** |
|---|---|---|---|---|
| 穴位 | 751(標準經穴 361) | 751 | **361 / 361**(validator 實測) | **1** |
| 中藥 | 327 | Appendix A 304/304 | **79** | **0** |
| 方劑 | 201 | 152 | **0**(無評分機制) | **0** |
| 病症 | 150 | 150(draft) | 0(無 validator) | 0 |

三個必須先看懂的數字:

1. **穴位標準 361 穴已達 validator template-grade**。這不等於 Ting 已人工源審核；Verified 仍只有 RV1 能推進。
2. **中藥「304/304 齊」是卡片齊,不是內容合格** — 樣板等級只有 79,
   **248 張是 partial**。這是目前最大的隱形債。
3. **方劑樣板等級 0,不是因為內容差,是因為沒有量尺。** `validate-formula-standard.js`
   有,但 **`stamp-formula-card-grade.js` 沒有**,而且 **Appendix C 的覆蓋報告
   也沒有**(中藥有 `herb_outline_coverage`,方劑沒有對應物)。

## 1. 八月第 1 週:開路(C 做,**不要**派給量產 AI)

> **為什麼這週不能跳過。** 2026-07-22 的事故是「202 味中藥共用 26 句模板、
> 通過 8 個 validator、被報告為完成」。當時的根因就是**先量產、後才有量尺**。
> 方劑現在的狀態與那時一模一樣:152 張「已填」而沒有任何 grade 機制。
> 如果八月直接開三條線量產,十月會拿到三層都停在 partial 的資料。
> 這週的四項工具各約半天,買回整個八月的可測量性。

| # | 項目 | Owner | 說明 |
|---|---|---|---|
| F0 | `report-formula-outline-coverage.js` | C | NCBAHM Appendix C 的 **181 方** vs 本地 201 筆比對,輸出缺哪幾方 + 寫進 `missing_report.json.formula_outline_coverage`。中藥的 38 張缺卡就是這樣找出來的。 |
| F1 | `stamp-formula-card-grade.js` + 訂 grade 門檻 | C | 對照 `docs/FORMULA_CARD_TEMPLATE.md` 與參考卡 麻黃湯。門檻要包含:君臣佐使逐藥劑量 + 角色理由、方義、加減、對藥連結、逐欄位引用、雙語。 |
| A0 | 穴位 dispatch 指令 | C | 97 張已完成卡(LU/LI/ST/SP)是現成樣板,`validate-acupoint-standard.js` 已存在(檢查 `field_sources.functions_zh`),**不用新建工具**,只要寫清楚「照 LU 的欄位長相複製」。 |
| A1 | 兩份 copy-paste dispatch | C | 一份方劑、一份穴位,格式照 `docs/AI_ROLES.md`。給其他 AI 的就是這兩段。 |

## 2. 八月第 2–4 週:平行量產 — **只開兩條線**

| 線 | Owner | 目標 | 分批建議 |
|---|---|---|---|
| **穴位** 264 穴 | A + X | 做到 template-grade | ① HT 9 + SI 19 + PC 9 + TE 23 = **60** ② KI 27 + LR 14 + GB 44 = **85** ③ CV 24 + GV 28 = **52** ④ **BL 67 排最後** |
| **方劑** | 第二個 C / X | 先補 F0 找出的缺方,再把 Appendix C 高頻方做到 grade | 依 Appendix C 分類走,一批 8–10 方 |

**BL 經為什麼排最後**:67 穴最多,而且背部穴位的安全欄位最重
(針法、刺深、氣胸風險)。趕工期間最容易在這裡出事,要留給能逐穴查證的線,
不要塞在月底。

**中藥的 248 張 partial:八月不要碰。** 三條線並開會讓每一層都停在半成品。
排到九月與病症並行,或十月驗證衝刺時「邊驗邊補」。

**產能基準(有實測,不是猜的)**:2026-07-28→29 兩天,Codex + Claude 兩線
共完成約 40 張缺中藥卡(每批 5 張,逐張 curriculum + American Dragon +
CloudTCM 三源查證)≈ **每線每天 10 張**。穴位卡與此相當;**方劑卡明顯更重**
(君臣佐使逐藥),估每線每天 3–5 方。照這個基準,264 穴 ≈ 兩線 13 個工作日,
八月三週內做完是合理的;方劑則八月只可能覆蓋 Appendix C 的高頻部分,
不要排「181 方全部」。

## 3. 九月:病症 + 辨證鑑別(= BLUEPRINT Phase 3)

開學後產能砍半,所以九月排的是「內容量小、考前價值高」的東西。

| # | 項目 | Owner |
|---|---|---|
| S1 | 病症 150 張:中西病名雙向標籤、連穴位/方劑/red flags | X |
| S2 | **辨證鑑別 comparison tables(LL3)** — Ting 的課堂對照表建成 `cmp.*` 記錄 | T 提供內容 + C 建表 |
| S3 | 穴位 BL 經收尾 + 方劑續填 | A / X |
| S4 | 中藥 248 張 partial 升級開跑 | X |

S2 是整份排期裡**考前投資報酬率最高的一項**(LEARNING_LOOP LL3),
而且只有 Ting 有內容 —— 九月要把課堂對照表拍照/貼進 `curriculum/`。

## 4. 十月:部署 + 驗證衝刺(= BLUEPRINT Phase 5)

| # | 項目 | Owner |
|---|---|---|
| V1 | Cloudflare Pages + Access 密碼,手機可用 | C |
| V2 | **驗證衝刺:品質頁排批次,邊念書邊掃 RV1** | **T only** |
| V3 | BLUEPRINT §4「可以使用」驗收清單逐項打勾 | C + T |

> **這一層 AI 動不了。** 已驗證數字現在是 穴位 1 / 中藥 0 / 方劑 0。
> 趕工再快,品質頁的第二條 bar 不會動一格 —— 只有 Ting 按 RV1 才會動。
> **所以不要留到十月才開始**:八月起每天固定掃一點,十月才有東西可衝。

## 5. 十一–十二月:病例 MVP + 臨床圖譜(= `docs/CLINICAL_GRAPH_TRACK.md`)

| # | 項目 | Owner | 依賴 |
|---|---|---|---|
| P1 | CG1–CG3 patient hub:病人 → 病程 → visit timeline | C | — |
| P2 | **localStorage → SQLite** | C | DECISIONS 的截止日是「臨床前一學期」,不要拖 |
| P3 | CG4 反向索引 panel(「SP6 用過 18 例」) | C | P2 的 foreign keys |
| P4 | CG10 複習佇列七來源 | C | P2 |
| P5 | CG11 搜尋涵蓋病例層 | C | P1 |

CG6(metric 詞彙表)與 CG9(反思三欄)已於 2026-07-29 完成,不佔這兩個月。

## 6. 派工時貼給其他 AI 的三句話

避免重演七月事故,每一份 dispatch 都要帶這三句:

1. 先讀 `docs/BLUEPRINT.md` → `docs/AI_ROLES.md` → 對應的 CARD_TEMPLATE
   (`HERB_CARD_TEMPLATE.md` / `FORMULA_CARD_TEMPLATE.md` / 穴位看 LU 的既有卡)。
2. **逐欄位引用來源,中英雙語。200 張共用一句話比留空更糟** —— 留空至少誠實。
   劑量與安全數字絕不虛構;兩源衝突就兩個都記並註明出處。
3. **只碰 `data/`。** 不碰 `js/`、`app.js`、`index.html`、`scripts/`、schema
   (已經發生過覆蓋事故)。走 branch → PR,PROJECT_LOG 留 5 行 handoff。

## 7. 這份排期的兩個風險(先寫下來,不要事後才發現)

1. **partial 債會疊三層。** 若八月硬開三條線,到十月會是「穴位 partial +
   方劑 partial + 中藥 partial」。對策已寫在 §2:一次兩條線。
2. **開學是懸崖不是斜坡。** 八月是暑假全力產能,九月起要當成減半。
   §3 之後的排期已按減半估;若九月課業比預期重,**優先保 S2(辨證鑑別)
   和 V2(RV1 驗證)**,S1/S4 可以延。
