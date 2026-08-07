# AI 憲法 — AcuTing OS

**這一頁是全部的共同規則，派工時整段貼在 prompt 最前面。**
格式細節只看你那條線的 CARD_TEMPLATE；架構看 `docs/BLUEPRINT.md`；一次性決策看 `DECISIONS.md`。
**`docs/` 底下其他所有檔案都是歷史紀錄，不是規則。**
改這一頁 = Claude + Ting。（v2 精簡版 2026-08-06；v1 在 git 歷史）

## 一、檔案所有權 — 一個檔案，同一時間，一個主人

| 路徑 | 主人 |
|---|---|
| `app.js` · `index.html` · `styles.css` · `js/**` · `scripts/**` · `docs/**` | **Claude** |
| `data/pathology/**` · `data/config/pattern_alias_map.json` | 病症/證型線 |
| `data/acupoints/**` | 穴位線 |
| `data/herbs/**`（含 formulas.json） | 方劑/中藥線 |
| `data/clinical_cases/**` · `data/generated/**` | Claude（generated 只有 build-data.js 寫） |
| `curriculum/**` | Ting，AI 只讀 |
| `PROJECT_LOG.md` | 所有人，**只在最上方新增** |

不是你的路徑：可以讀，**一個字都不能寫**。內容任務**永遠**不改 UI、不改 scripts。

## 二、紅線（違反 = 不可逆損害）

1. **不改任何 id 格式。**（`herb.huang_qi` · `formula.gui_zhi_tang` · `SP6` · `ex.hn3` · `pattern.blood_stasis`）改 id = 病歷外鍵全斷。證型只有 `pattern.<english_slug>`，不准新增 `pat.<中文>`。
2. **不硬刪記錄。** 退役 = `review_status: "deprecated"`。
3. **不用短的覆蓋長的，不清空有內容的欄位。** 內容放錯欄位：**先搬到對的欄位，再改原欄位**——順序反了就會忘記搬。
4. **劑量、刺深、毒性、孕期、藥物交互：絕不虛構數字**，必須具名來源；兩源不合就兩個都記並標出處。
5. **`_en` 陣列長度必須等於 `_zh`，否則整個留空。** `_zh` 欄位裡不准出現英文句子。
6. **不准樣板句。** 多筆記錄共用同一句話比留空更糟，因為留空至少誠實。
7. **病人資料不進 `data/**`。**（clinical 私有層已 gitignored）
8. **`pinyin` 一律無聲調**；聲調只放 `pinyin_toned`。
9. **不建立中西醫一對一等同**（偏頭痛 ≠ 肝陽上亢，一律多對多）；**不把不確定寫成確定**（機轉 ≠ 療效、動物研究 ≠ 臨床證據）。

## 三、怎麼工作

- **一批最多 30 筆，只做派工單 id 清單上的，不多做。** `git pull` → 開自己的 branch → 改 → 驗證 → commit → **push**（commit 不等於安全）。
- 新內容：填好、逐欄標來源、`review_status:"draft"`、直接上，Ting 在 app 裡審。
  覆蓋既有 canonical 內容、或任何刪除：**先問 Ting**。
- **改完自己 diff 一次。** 驗證器 PASS ≠ 沒有損失——確認沒有欄位變短或被清空。
- 收工必跑：`node scripts/build-data.js` + 你那條線的 `validate-*.js` + `node scripts/validate-content-junk.js` + `git diff --check`。CI 沒過不能 merge。
- 需要臨床判斷的欄位（紅旗、鑑別、劑量、安全）查不到來源：**停下來回報，不要編**。「查不到」是有價值的答案。
- 規則不清楚、或發現規則互相矛盾：**停下來問，不要猜著做完一整批**。

## 四、怎麼回報（PROJECT_LOG.md 最上方新增）

- 動到的 id、逐欄位數字 before→after、來源缺口、**驗證器輸出原文貼上**、下一批。
- **禁用「完成」「100%」這類字。** 每個數字都要能被一行驗證指令重現。

## 五、派工單沒有這五項，不開工，回頭要

允許的檔案 · 禁止的檔案 · 這批的 id 清單 · 驗證指令 · 完成的定義。
