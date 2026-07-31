# 辨證鑑別卡模板 · COMPARISON_CARD_TEMPLATE

**建立**：2026-07-31
**適用**：`data/knowledge/comparisons.json`
**驗證器**：`scripts/validate-comparison-standard.js`

---

## §0 最高原則：cells 是你的，不是模型的

這條規則早就存在於 `comparisons.json` 的 `policy` 欄位，這份模板只是把它寫清楚並加上驗證器：

> `compares`（證型 id）與 `dimensions`（軸標籤）是**結構**。
> `cells`——每個證型在每條軸上**憑什麼跟別人不同**——是**鑑別點**，屬於臨床內容，
> **只能由 Ting 撰寫，模型絕不代填**。

**為什麼這條不能鬆**：鑑別點是「憑什麼分辨」，不是「是什麼」。症狀清單可以查書照抄，但「跟心腎不交相比，此證偏淡、倦、納差，沒有盜汗與五心煩熱」這種話——**寫錯會直接導致辨錯證**，而且錯得很像對的。這是全庫唯一一種「錯誤內容比空白危險得多」的欄位。

模型能做的是**骨架**：挑出該比哪些證型、定哪幾條軸、確認 id 都存在。骨架出貨時 `cells` 必須是空的。

---

## §1 兩種鑑別卡（不要混用）

| 類型 | `type` | 比什麼 | `compares` 放什麼 | 現況 |
|---|---|---|---|---|
| **證型鑑別** | `comparison` | 同一個病，不同證型怎麼分 | `pattern.*` id | 已有 11 筆（婦科生殖為主） |
| **方劑鑑別** | `formula_comparison` | 同類方，彼此差在哪 | `formula.*` id | **尚未建立**，方劑卡已有 32 個 `comparison_group` 可直接轉 |

**不要把方劑塞進 `compares` 的證型欄位**，反之亦然。驗證器 C3 會擋。

---

## §2 欄位規格

```json
{
  "id": "cmp.cheng_qi_tang_family",
  "type": "formula_comparison",
  "title_zh": "承氣湯類鑑別",
  "title_en": "Cheng Qi Tang family differentiation",
  "compares": ["formula.da_cheng_qi_tang", "formula.xiao_cheng_qi_tang", "formula.tiao_wei_cheng_qi_tang"],
  "dimensions": ["組成差異", "瀉下力度", "主治", "舌", "脈", "辨證要點"],
  "cells": {},
  "authored_by": "model_draft",
  "status": "draft",
  "review_status": "draft",
  "seed_basis": "formula.comparison_group = purgative_cheng_qi",
  "notes_zh": "骨架由模型建立,cells 待 Ting 填寫。"
}
```

| 欄位 | 型別 | 誰填 | 規則 |
|---|---|---|---|
| `id` | string | 模型 | `cmp.<slug>`，**永久不變**（DECISIONS D1）。要作廢用 `review_status: "deprecated"`（D6），不要改 id、不要刪除。 |
| `type` | string | 模型 | `comparison` 或 `formula_comparison` |
| `title_zh` / `title_en` | string | 模型 | 兩個都要 |
| `compares` | string[] | 模型 | **至少 2 個**。每個 id 都必須真實存在，驗證器會查。 |
| `dimensions` | string[] | 模型 | 軸標籤。見 §3 標準軸。 |
| `cells` | object | **只有 Ting** | 骨架階段必須是 `{}`。模型填了 = C1 阻擋。 |
| `authored_by` | string | 模型 | 骨架階段必須是 `"model_draft"` |
| `status` | string | Ting 升級 | `draft` → `owner_filled` → `verified` |
| `seed_basis` | string | 模型 | 這個骨架是從哪來的（哪個 comparison_group、哪份課件） |

---

## §3 標準軸（`dimensions`）

現有 11 筆都用這 6 條，**證型鑑別請沿用，不要自創**：

```
主症 · 舌 · 脈 · 兼症 · 治法 · 代表方
```

方劑鑑別建議這 6 條：

```
組成差異 · 功效側重 · 主治 · 舌 · 脈 · 辨證要點
```

要加軸可以，但**同一張卡的所有成員必須有相同的軸**（C4 會擋參差不齊）。

---

## §4 cells 寫法（Ting 用）

每一格是**中英雙語**，中文在前、英文接在後，同一個字串裡：

```
"舌": "舌淡或淡白，苔薄白。 Pale or pale-white tongue with a thin white coat."
```

**鑑別點要寫「相對於誰」**。現有資料的好範例：

> 「與心腎不交相比，偏淡、倦、納差，缺少盜汗與五心煩熱。」

這句話的價值遠高於單純列症狀——**它告訴你分辨的著力點**。每張卡至少要有一格寫出這種對比句。

---

## §5 模型可以做什麼、不可以做什麼

### ✅ 可以

1. 從 `formulas.json` 的 `comparison_group` 產生方劑鑑別骨架（32 群組，30 個有 ≥2 成員）
2. 從 `tcm_pattern_canon.json` 的 `condition_ids` 找出同一病症底下的多個證型，產生證型鑑別骨架
3. 驗證 `compares` 裡的 id 真的存在
4. 補 `title_zh` / `title_en` / `seed_basis`
5. 回報「哪些群組還沒有對應的鑑別卡」

### ❌ 不可以

1. **填任何 `cells` 內容**——包括「先放個草稿讓 Ting 改」也不行
2. 改既有卡的 `id`
3. 刪除任何一筆（要作廢用 `review_status: "deprecated"`）
4. 把 `status` 從 `draft` 往上升——只有 Ting 能升
5. 動已經是 `owner_filled` 或 `verified` 的卡的任何欄位

---

## §6 驗證

```bash
node scripts/validate-comparison-standard.js
```

| 代碼 | 檢查 | 阻擋 |
|---|---|---|
| C1 | `authored_by=model_draft` 的卡不得有非空 `cells` | ✅ |
| C2 | `id` 格式 `cmp.<slug>`、不重複 | ✅ |
| C3 | `compares` 的 id 必須存在，且型別與 `type` 相符 | ✅ |
| C4 | 有 cells 時，每個成員的軸必須與 `dimensions` 一致 | ✅ |
| C5 | `compares` 至少 2 個 | ✅ |
| C6 | `status=owner_filled/verified` 卻有空 cells | ✅ |
| C7 | cells 內容疑似缺英文（無拉丁字母） | 報告 |
| C8 | 覆蓋率：有幾個 comparison_group 還沒有鑑別卡 | 報告 |

---

## §7 建議工作順序

1. **模型產出 30 張方劑鑑別骨架**（空 cells），一次 commit + push
2. Ting 挑 3 張最高頻的先填（建議：承氣湯類、地黃丸類、辛溫 vs 辛涼解表）
3. 填完的當範本，確認軸和寫法夠不夠用，再調模板
4. 剩下的照樣填，或分批交辦
5. 證型鑑別另外開一輪——現有 11 筆是婦科生殖專科，**考科相關的證型鑑別還沒開始**
