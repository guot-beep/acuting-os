# 交接 · 辨證鑑別軌道

**寫給**：Codex（接手實作）／Ting（決策）
**時間**：2026-07-31
**相關**：`docs/COMPARISON_CARD_TEMPLATE.md`（規格）、`scripts/validate-comparison-standard.js`（驗證）

---

## 一、現況

| 項目 | 狀態 |
|---|---|
| 鑑別卡總數 | **41**（證型 11 ＋ 方劑 30） |
| 已由 Ting 填 cells | 9 |
| 方劑鑑別骨架 | **30/30 建好，cells 全空**（依設計） |
| 證型登錄檔 | `data/pathology/pattern_registry.json`，**50 個證型** |
| └ 已有中文名 | 24 |
| └ **待補中文名** | **26** |
| └ 孤兒 id（需 Ting 判斷） | 2 |

驗證：`node scripts/validate-comparison-standard.js`

---

## 二、Ting 要決定的兩件事（沒人能代決）

### 1. 兩個孤兒證型 id

這兩個只出現在鑑別卡，病症庫從沒用過，看起來是較籠統的寫法：

| 孤兒 id | 疑似應併入 |
|---|---|
| `pattern.kidney_deficiency`（引用 8） | `kidney_yang_deficiency` / `kidney_yin_deficiency` / `kidney_essence_deficiency` |
| `pattern.blood_deficiency`（引用 4） | `liver_blood_deficiency` / `heart_blood_deficiency` / `qi_blood_deficiency` |

**不要自動合併。** 每張卡當初指的是哪一個，是臨床判斷。合併方向決定後才能清掉 C3。

### 2. 30 張方劑鑑別的 cells

依 `COMPARISON_CARD_TEMPLATE` §0，**鑑別點只能 Ting 寫**。建議從這三張開始，寫完當範本再看軸夠不夠：

- `cmp.drain_downward` — 大承氣 / 小承氣 / 調胃承氣（考試最愛）
- `cmp.yin_tonify` — 六味地黃 / 左歸丸 / 一貫煎
- `cmp.exterior_wind_cold` vs `cmp.exterior_wind_heat` — 辛溫 vs 辛涼

---

## 三、Codex 可以做的（有明確規格、可驗證）

### 任務 A：補 26 個證型中文名 ⭐ 優先

`data/pathology/pattern_registry.json` 裡 `needs_name_zh: true` 的 26 筆。

**來源順序**：課件 `curriculum/` → Ting 的 Notion 辨證筆記（D4 八綱 / D5 氣血津液 / D6 臟腑 / Z5 六經 / Z7 三焦）→ CloudTCM。

**規則**：
- 中文名要用**教材通行的標準名**，不要自己組字。`pattern.wind_heat_invading_lung` → 「風熱犯肺」✅，不是「風熱侵肺」。
- 每筆補 `field_sources.name_zh`，記下是哪一份課件哪一頁。
- **查不到就留空**，把 `needs_name_zh` 留著。留空是誠實，音譯是污染。
- 不要動 `id`（id 不可變，DECISIONS D1）。
- 不要動已有 `name_zh` 的 24 筆。

驗收：`node scripts/build-pattern-registry.js`（dry run，會重算覆蓋率）

### 任務 B：收斂病症的 `related_patterns`

`data/pathology/condition_canon_shortlist.json` 目前是**按大類批次掛的**：

```
cond.copd / cond.chronic_cough / cond.post_viral_cough → 完全相同的 14 個證型
cond.endometriosis / pms / 痛經 / 不孕               → 完全相同的 12 個證型
```

鑑別表比 3–5 個證型才有意義。請**逐病收斂成該病真正常見的 3–5 個**，並在 `related_patterns_source_zh` 記下依據。

**這一項要小心**：收斂等於刪除既有連結，屬於 §0 敏感操作。做法是**先產出建議清單給 Ting 過目，不要直接改**。輸出成 `data/staging/condition_pattern_narrowing_proposal.json`。

### 任務 C：把 Notion 辨證筆記匯出到 `curriculum/`

Ting 已同意。Notion 頁面（`AcuTing Knowledge Base` → Master Notes DB）裡的 TCM診斷 D4–D6、Z2–Z7 系列。

匯成 markdown 放 `curriculum/diagnosis/`，檔名照原標題。**匯出即可，不要改寫內容**——那是 Ting 自己的筆記，是 cells 的合法來源。

---

## 四、Antigravity 適不適合接這一段

**我的評估：任務 A 可以，B 和 C 不要，cells 絕對不要。**

依據是這個 session 的實際紀錄：

| 任務型態 | 表現 |
|---|---|
| 純填充＋明確規格（方歌 102 首） | ✅ 零缺陷、100% 註明出處 |
| 欄位加深（327 處） | ✅ 零減損 |
| 需要判斷的精修 | ❌ 把放錯欄位的內容**刪掉**而不是搬走 |
| 掃描清理 | ❌ 110 處只清 55 處（漏掉另一半欄位） |
| 自我回報 | ❌ 三句宣稱有兩句與資料對不上（「100% 完成」「分類一致」） |

所以你的遲疑是對的，但要分清楚原因：**不是他不可靠，是他不適合有判斷成分的工作。**

- **任務 A（補中文名）適合他**——查表對照，有標準答案，`build-pattern-registry.js` 可以驗，錯了看得出來。
- **任務 B（收斂連結）不要給他**——那是「哪些證型跟這個病真的相關」，是判斷，而且要刪東西。他刪過不該刪的。
- **cells 絕對不要**——鑑別點寫錯會直接害你辨錯證，而且錯得很像對的。這是全庫唯一「錯誤內容比空白危險得多」的欄位，C1 就是為了擋這件事。

**給他任務時務必**：明確規格 ＋ 可跑的驗證器 ＋ 分批 20–30 筆 ＋ 每批 push ＋ **回報數字前自己先跑驗證**。最後這條這個 session 已經失效兩次。

---

## 五、驗證清單

```bash
node scripts/validate-comparison-standard.js   # 鑑別卡
node scripts/build-pattern-registry.js         # 證型登錄覆蓋率（dry run）
node scripts/validate-content-junk.js          # 內容雜訊
node scripts/build-data.js                     # 編譯
```

目前 `validate-comparison-standard` 剩 **9 個 C3**，全部來自那 2 個孤兒 id。Ting 決定合併方向後就會歸零。

---

## 六、證型結構（2026-07-31 定案中，Ting 指正後重做）

### 已確立的模型

證型**不是平面清單，也不是單一樹狀**，而是兩個軸交叉分類：

| 軸 | `classified_by` | 例 |
|---|---|---|
| 臟腑軸 | `zang_fu` | 腎虛 → 腎陽虛 / 腎陰虛 / 腎精不足 / 腎氣不固 / 腎不納氣 |
| 病性軸 | `bing_xing` | 陽虛 → 腎陽虛 / 脾陽虛 / 心陽虛 / 脾腎陽虛 |

**同一個證型可以同時屬於兩軸**，這是關鍵：

```
腎陽虛  member_of = [腎虛(臟腑), 陽虛(病性)]
腎陰虛  member_of = [腎虛(臟腑), 陰虛(病性)]
```

單一 `parent` 欄位表達不了，所以用 `member_of`（陣列）。

### 欄位

| 欄位 | 說明 |
|---|---|
| `level` | `category`（上位分類）或 `pattern`（具體證型） |
| `classified_by` | 分類是依臟腑還是依病性 —— 只有 category 有 |
| `members` | 這個分類底下有哪些證型 —— 只有 category 有 |
| `member_of` | 這個證型屬於哪些分類（可多個）—— 只有 pattern 有 |

### 目前 10 個上位分類

虛：**血虛、氣虛、陰虛、陽虛、腎虛**
實：**火、熱、濕熱、痰、外風**

Ting 的原話：「心火 肝火 胃火 都不一樣」「腎陽虛是陽虛的一種，但陽虛有很多種」——**上位分類是鑑別卡的標題，不是辨證結論**。寫病歷不能只寫「陽虛」。

---

## 七、結構上還沒解決的（要先決定才能往下設計）

### 1. 既是診斷、又像分類的證型

| id | 被當診斷用 | 底下更細的證型 |
|---|---|---|
| `pattern.blood_stasis` 血瘀 | **引用 40 次** | 心血瘀阻、氣滯血瘀 |
| `pattern.liver_qi_stagnation` 肝氣鬱結 | 引用 32 次 | 肝脾不和、肝胃不和 |

升為 category 會讓那 40 次引用變成「用分類當診斷」；維持平行則失去關係。**兩種都有代價，要你決定。** 目前標 `needs_owner_decision_zh`，沒有動。

### 2. 胃火 vs 胃熱

本庫目前只有 `pattern.stomach_heat`，歸在「熱」底下。但你提到胃火——**胃火與胃熱要不要分立成兩個 id？**

### 3. 分類本身要不要能被病症引用

`cond.pcos` 可以連到 `腎虛` 這種分類嗎，還是必須連到具體證型？

- 允許：課件只寫「腎虛」時能如實記錄，但辨證會停在粗的層級
- 不允許：逼出精確度，但沒寫細的來源就無法登錄

**建議允許但標記**，讓 C 級檢查報告「連到分類而非具體證型」的數量，當作待精修清單。這一項我沒有實作，等你定。

### 4. 三個軸還是兩個軸

目前只做臟腑 × 病性。八綱（表裡、寒熱、虛實、陰陽）、六經、衛氣營血、三焦是**另外幾套辨證體系**，不是同一軸。你的 Notion 筆記 D4–D6、Z5、Z7 正是這幾套。

**要不要把辨證體系也做成一個維度**（`system: 八綱 / 臟腑 / 六經 / 衛氣營血 / 三焦 / 氣血津液）？如果要，現在加最便宜。
