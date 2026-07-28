# Formula Fill Dispatch — 接手指令（Codex / Antigravity / 第二個 Claude Code 用）

Ting 把這整份貼給任何要幫忙填方劑卡的 AI 即可。

**規範本體在 `docs/FORMULA_CARD_TEMPLATE.md`，這份只講「怎麼開工、什麼不能做」。**

---

## 0. 先讀這幾份，順序不要跳

```
docs/BLUEPRINT.md              整個系統要做什麼
docs/AI_ROLES.md               誰負責什麼
docs/CONTENT_PIPELINE.md       來源分層
docs/FORMULA_CARD_TEMPLATE.md  ★ 方劑卡規範本體（F1–F12）
docs/ACUPOINT_CARD_TEMPLATE.md 第一部分那十個教訓，方劑卡照樣適用
```

`FORMULA_CARD_TEMPLATE.md` 的**第一部分是十個教訓**，每一條都是真的踩過的坑。
不要跳過 —— 規則沒有理由就會被繞過，而這十條全部都被繞過過一次。

---

## 1. 貼上用 Prompt（copy-paste）

> 你在 AcuTing OS repo 幫 Ting 填方劑卡。開工前依序讀
> `docs/BLUEPRINT.md` → `docs/AI_ROLES.md` → `docs/CONTENT_PIPELINE.md` →
> **`docs/FORMULA_CARD_TEMPLATE.md`（規範本體，F1–F12 機器強制）**。
>
> **來源優先序**（不可對調）：
> ① **NCBAHM 2026 CH 考綱 Appendix C** — 決定**哪些方要做**，不決定內容
> ② **`curriculum/formulas/Formulations Summary Chart`** — 結構主幹：
>    君臣佐使、劑量、加減、actions、indications、舌脈
> ③ **`curriculum/formulas/Herbal Formulations Comprehensive`** — 深度：
>    **Applications（現代應用）**、**Modern research（藥理）**、Administration（服法）、
>    以及每方一張 Rank/Herb/Amount/Properties/Channels/Notes 表
> ④ `curriculum/formulas/臺灣中藥典第四版英文版` — 官方中英對照、劑量
> ⑤ CloudTCM（115 方已有直連）— 中文深度：方義、現代疾病、藥理
>
> **每做完一批就跑** `node scripts/validate-formula-standard.js`，
> 有紅字就修到全綠再提交。開 branch `<你的名字>/formulas-<分類>` → PR，
> **不直接推 main**。

---

## 2. 絕對紅線

| 不可以 | 為什麼 |
|---|---|
| **從方名推測組成** | 這就是把「瀉心」寫進瀉心湯成分表的那個錯，36 個方中招 |
| **自己音譯方名** | 考綱 Appendix C 只有英文與拼音；12 個骨架記錄的 `name_zh` 是**故意留空的**，等 Ting 指認 |
| **中英湊數對齊** | 對不上就整欄留空。硬湊等於讓第 3 條中文配到講別的事的第 3 條英文 |
| **半翻譯** | 查不到對照就留空。`活血 (TCM Action)` 那 1786 個假英文標籤就是這樣來的 |
| 刪加減、方義、現代疾病、藥理、比較群組、逐味 `elucidation_zh` | §0 只加深不刪除 |
| 用眼睛讀 PDF 表格 | 用 `scripts/parse-formula-curriculum.py` |
| 把 CloudTCM 的 `modern_diseases_zh` 當現代應用 | 它在麻黃湯底下列著系統性紅斑性狼瘡、心肌梗塞 —— 那是關鍵字關聯 |
| 動 `review_status` 到 `source_checked` | AI 只能寫 `"draft"`；升級是 Ting 的 RV1 流程 |

**只加深，不刪除。** 兩個例外：內容明確錯置（搬，不是刪），完全損毀的亂碼。
兩者都要在 commit 寫清楚改了什麼、為什麼。

---

## 3. 寫入腳本必須自己 assert

麻黃湯那張樣板卡是這樣做的（`scripts/curate-sample-formula.js` 可直接抄）：

```js
// 1 每一句英文都必須出現在該方的課件頁面文字裡
for (const s of quoted) if (!page.includes(norm(s))) fail.push(...);
// 2 中英逐條對齊
if (ZH.actions.length !== EN.actions.length) fail.push(...);
// 3 角色只能給既有組成裡的藥
for (const x of roles) if (!comp.some(c => c.herb_zh === x.herb)) fail.push(...);
// 4 家族每一條都要寫 change
for (const f of family) if (!f.change.length) fail.push(...);

if (fail.length) { fail.forEach(console.error); process.exit(1); }  // 不寫檔
```

**這不是形式。** 第 1 條當場抓到我把舌象抄錯（那格跨兩行、中間夾著別欄的字，
「T: thin, white coating」根本不連續出現）。SP 那批擋下我 3 次，ST 那批 9 次，
**每一次都是我寫錯**。

---

## 4. 現在的狀態（2026-07-28，已合併到 main）

**結構完成，內容只有一個方。**

| | |
|---|---|
| 方劑總數 | 201（173 原有 + 28 考綱骨架） |
| 完整整理過的 | **1**（麻黃湯） |
| 考試標註 | **201/201**（機器從考綱 Appendix C 標的） |
| 有組成 | 116/201 |
| 有君臣佐使 | 23/201 |
| 有舌脈 | 1/201 |
| 有方劑家族 | 1/201 |
| `field_sources` | 1/201 |
| 單味藥連結 `herb_id` | 0/201 |

### 已知待修（不要重複踩）

- **解析器只抓到 60 方 / 25 頁中的 21 頁**，而且**只有 8 個抓到 Related 欄**
  —— `formula_family` 是這批要驗證的核心結構，**先修這個再開始整批**
- **14 個方的組成疑似被截斷**（`葛根湯` → `["葛根"]`，看起來合理但錯的，
  真的葛根湯有七味）。已標 `composition_suspect`，卡片會顯示警告。
  **要從課件補齊，不可以自己補**
- **12 個骨架記錄沒有中文方名**，等 Ting 指認
- **34 個方有部分缺字**（像「煎服���與藥後護理」），可讀的不刪，人工對照課件修
- **中英病症標籤 0/201** —— 要先建 `data/config/formula_tag_glossary.json`，
  比照 `acupoint_tag_glossary.json`（現在 625 條）的做法，再機器填

### 建議批次順序

1. **辛溫解表 8 方**（麻黃湯、桂枝湯、小青龍湯…）—— Summary Chart 第一章，
   家族關係最豐富，適合驗證 `formula_family`
2. 辛涼解表 → 瀉下 → 和解 → 清熱
3. 補益劑（課件有專門一份 `Formulas That Tonify 补益剂`）

一批一支腳本：`scripts/curate-<分類>-formulas.js`。

---

## 5. 三張卡的分工，不要搞混

**中藥是零件，穴位是零件，方劑是組裝。**

| 欄位 | 放哪 | 為什麼 |
|---|---|---|
| 杏仁能做什麼 | **中藥卡** `functions_zh` | 這味藥自己的屬性 |
| 杏仁在麻黃湯裡是佐藥、跟麻黃一宣一降 | **方劑卡** `composition[].role_zh` + `role_reason_zh` | 同一味藥在不同方角色不同：麻黃在麻黃湯是君，在麻杏石甘湯是臣 |
| 劑量 | **方劑卡** `dose_range` + `granule_reference_g` | 比例就是方：桂枝湯→桂枝加芍藥湯只差芍藥 9g→18g |

兩句話都要，不能互相取代。

### 連接契約

```
方劑卡 ──composition[].herb_id──→ 中藥卡
       ──syndromes_zh──→ 證候 canon ←──tcm_pattern_ids── 穴位卡
       ──modern_diseases_zh──→ 病證 canon ←──related_conditions── 穴位卡
```

證候 canon（`data/config/tcm_pattern_canon.json`）140 個證候，
其中 **25 個方證帶 `formula_id` 指回方劑**（`kind: "方證"`）。
穴位卡與方劑卡**走同一套證候詞彙** —— 這是整個系統的目的。

⚠️ 新增可搜欄位時要同步更新 `app.js` 的 `unifiedSearch`。
穴位卡曾經漏掉標籤與身分，害辛苦翻譯的 151 個標籤搜尋搜不到。

---

## 6. 完成條件

```bash
node scripts/build-data.js
node scripts/validate-formula-standard.js      # 必須全綠
node scripts/validate-herb-standard.js
node scripts/validate-acupoint-standard.js
node scripts/validate-content-junk.js
```

⚠️ `validate-data` / `validate-encoding` / `validate-naming` **在 main 上本來就是紅的**
（原始 CloudTCM 匯入檔裡的 U+FFFD，以及刻意保留的 34 個部分缺字方）。
**不要為了讓它們變綠而刪資料** —— 先 stash 再跑一次確認是既有問題。

PR 裡要寫：做了哪一批、幾個方、驗證結果、以及**哪些東西你決定不做和為什麼**。

**紅線**：只碰 `data/herbs/formulas.json` 與你自己的 `scripts/curate-*.js`。
**絕不碰** `app.js`、`js/`、`index.html`、`data/generated/`（用 build-data 重生）。
架構問題問 Claude，安全數字衝突問 Claude，方向問題問 Ting。
