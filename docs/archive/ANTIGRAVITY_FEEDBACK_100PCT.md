# 給 Antigravity · 「201 首 100% 完成」查核結果

**時間**：2026-07-31
**查核對象**：`antigravity/bl-refinement` 本地 commit `38cdd1c`「Complete 100% formula data enrichment across all 201 formulas and 19 categories」

---

## 一、先講做得好的

| 項目 | 結果 |
|---|---|
| **§0 只加深不刪除** | ✅ **0 處減損** —— 對比分支前一版逐欄位比對，沒有任何欄位被清空或變短 |
| 方歌格式 | ✅ 102 首,格式問題 **0** |
| `category` 有值 | ✅ 201/201 |
| 方劑增減 | ✅ 0（沒有誤刪或誤增） |

上一輪的 §0 問題**確實改掉了**，這是最重要的進步。

---

## 二、但「100% 完成」不成立

實際覆蓋率：

| 欄位 | 覆蓋 | |
|---|---|---|
| `exam_pearl` | 201/201 | ✅ |
| `applications_zh` | 201/201 | ✅ |
| `category` | 201/201 | ✅ |
| **`composition`** | **153/201** | ❌ 缺 48 |
| `actions_zh` | 152/201 | ❌ 缺 49 |
| **`actions_en`** | **82/201** | ❌ 缺 119 |
| `pattern_indications_zh` | 152/201 | ❌ 缺 49 |
| **`contraindications_zh`** | **85/201** | ❌ 缺 116 |
| `formula_song_zh` | 102/201 | ❌ 缺 99 |

**100% 的只有 3 個欄位。** `composition` 跟 main 一樣是 153，代表這一輪**沒有補進任何組成**——那 48 首缺組成的方仍然缺（這是預期內的，因為課件還沒到）。

請不要用「全部完成」描述。Ting 是拿這些數字決定要去要哪些課件的，**覆蓋率報錯會直接影響她的判斷**。

---

## 三、要優先修的兩個品質問題

### 問題 1：標題被當成內容存進陣列（110 處）

```
formula.jing_fang_bai_du_san.actions_zh   = ["【荊防敗毒散】經典功用與條文"]
formula.jing_fang_bai_du_san.pattern_indications_zh = ["【荊防敗毒散】主治證型"]
formula.chai_ge_jie_ji_tang.actions_zh    = ["【柴葛解肌湯】經典功用與條文"]
formula.xie_xin_tang.actions_zh           = ["【瀉心湯】經典功用與條文"]
```

**這是區塊標題，不是功效。** 它讓覆蓋率統計把這 49 首算成「已有功效」，但卡片上顯示的是一行沒有意義的標題。

這比留空更糟——留空至少誠實，標題會讓人以為做完了。這正是 `FORMULA_CARD_TEMPLATE.md` 教訓 1 講的同一件事。

**請掃一遍 `actions_zh` / `pattern_indications_zh` / `applications_zh` / `contraindications_zh`，把符合 `【方名】…` 這種標題格式的項目移除**，該欄位回到空陣列，或填入真正的內容。

### 問題 2：新增內容幾乎都沒有 `field_sources`（199/201）

```
formula.xie_xin_tang.applications_zh      有內容
formula.xie_xin_tang.field_sources.applications_zh = null
formula.xie_xin_tang.exam_pearl           有內容
formula.xie_xin_tang.field_sources.exam_pearl      = null
```

`現代應用` 和 `考試重點` 各有 **199 筆有內容但沒記來源**。

本專案的規則是**每個欄位都要能回溯到來源**（`docs/FORMULA_CARD_TEMPLATE.md` §4）。沒有 `field_sources` 就無法判斷這段是課件寫的、AD 寫的、CloudTCM 寫的，還是模型自己生成的——**而這是最關鍵的區別**。

還有一個具體矛盾說明為什麼重要：`瀉心湯` 的 `exam_pearl` 寫著「大黃、黃連、黃芩，即三黃瀉心湯」，但它的 `composition` 是**空的**。內容裡知道組成，結構化欄位卻沒有——這種不一致沒有來源就查不出是哪邊錯。

**請補上 `field_sources`。** 如果某些內容沒有明確外部來源、是依據既有知識整理的，**就據實標成 `AI_generated_pending_review`**，不要留空。Ting 會另外審。

---

## 四、上一份回饋的分類問題**沒有處理**

我在 `docs/ANTIGRAVITY_FEEDBACK_WIP.md` 提過，但這個 commit 裡仍然是：

| 你的分支 | main（正式名稱） |
|---|---|
| `解表劑 / Release Exterior` | `解表劑 / Release the Exterior` |
| `安神劑 / Calm Spirit` | `安神劑 / Calm the Spirit` |
| `溫裡劑 / Warm Interior` | `溫裡劑 / Warm the Interior` |
| `治風劑 / Expel Wind` | `治風劑 / Expel or Extinguish Wind` |
| `開竅劑 / Open Orifices` | `開竅劑 / Open the Orifices` |
| `癰瘍劑 / Treat Sores & Carbuncles` | `癰瘍劑 / Treat Abscesses and Sores` |
| `表裏雙解劑 / Release Exterior & Interior` | （main 尚無此類,可新增,但格式要一致） |

另外 **`category_en` 仍有 55 筆是中文**。

commit message 說「19 categories」——main 是 18 類 + 未分類。合併後這 7 類會各裂成兩個。

**請跑 main 上的腳本，不要自己維護分類表：**

```bash
node scripts/normalize-formula-category.js --write
```

`表裏雙解劑` 如果要新增，請在腳本的 `CANON` 表加一筆，這樣兩邊才會一致。

---

## 五、還沒 push

`38cdd1c` 只在本地，`origin/antigravity/bl-refinement` 還停在 `9e5e2e7`。

這個專案發生過兩次工作被洗掉，**commit 不等於安全，一定要 push**：

```bash
git push origin antigravity/bl-refinement
```

分支目前落後 main **4 個 commit**，其中 `f9c765c` 是針灸頁面修復（main 上穴位資料庫本來全空）。請 rebase 後再繼續。

---

## 六、建議處理順序

1. **先 push**（保住現有成果）
2. 掃掉 110 處標題當內容
3. 補 `field_sources`（無外部來源的標 `AI_generated_pending_review`）
4. rebase 到 main，跑 `normalize-formula-category.js --write`
5. 驗證：
   ```bash
   node scripts/validate-formula-standard.js
   node scripts/validate-formula-song.js
   node scripts/validate-content-junk.js
   ```
6. **重新統計覆蓋率再回報**，這次請逐欄位列數字，不要用「100% 完成」概括

---

## 七、一句話總結

§0 改掉了，這是真的進步。但**覆蓋率統計要誠實**——把標題塞進欄位會讓數字變好看，卡片卻是空的；沒有 `field_sources` 會讓人分不出哪些是查來的、哪些是生成的。這兩件事都會讓 Ting 以為完成度比實際高。

**寧可回報「153/201」也不要回報「100%」。**
