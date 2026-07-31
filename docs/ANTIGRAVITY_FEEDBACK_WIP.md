# 給 Antigravity · 進行中方劑工作的即時回饋

**時間**：2026-07-31
**對象**：`antigravity/bl-refinement` 工作區中**尚未提交**的方劑改動（+4245 / −508）

---

## 一、先講好的：這次沒有再犯 §0

我拿分支 HEAD 當基準比對你現在的工作副本：

| 指標 | 結果 |
|---|---|
| 有變動的方劑 | 109 |
| 欄位加深 | **327 處** |
| **疑似減損** | **0 處** |
| 方劑增減 | 0 |

上次桂枝湯、小青龍湯「內容被刪不是被搬」的問題**沒有重演**。這一輪是純加深，做得對，請照這個方式繼續。

---

## 二、要立刻處理的：先拉 main，不然分類會裂成兩套

你的分支落後 main **3 個 commit**，其中一個直接跟你現在做的事衝突。

### main 已經做完分類正規化了（`c0d30f1`）

你也在做同一件事，但**英文字串跟 main 不一樣**。合併後同一個中文分類會出現兩個版本，分類瀏覽又會重複——正是這次要修掉的問題：

| 你的分支 | main（請改用這個） |
|---|---|
| `解表劑 / Release Exterior` | `解表劑 / Release the Exterior` |
| `安神劑 / Calm Spirit` | `安神劑 / Calm the Spirit` |
| `溫裡劑 / Warm Interior` | `溫裡劑 / Warm the Interior` |
| `治風劑 / Expel Wind` | `治風劑 / Expel or Extinguish Wind` |
| `開竅劑 / Open Orifices` | `開竅劑 / Open the Orifices` |
| `癰瘍劑 / Treat Sores & Carbuncles` | `癰瘍劑 / Treat Abscesses and Sores` |

其餘 12 種兩邊一致，沒問題。

**請不要自己再正規化分類**，直接用 `scripts/normalize-formula-category.js`，正式名稱都在裡面的 `CANON` 表：

```bash
node scripts/normalize-formula-category.js
```

（預設 dry run，加 `--write` 才落地。）

### `category_en` 你的分支還沒清

分支的 `category_en` 仍混著中文（`解表劑`、`清熱劑`…）和描述性長句（`Formulas that Release the Exterior - Warm, Acrid`、`Clear Heat Formulations`）。main 上已經統一成純英文短標籤。跑上面那支腳本就會一起修好。

### main 另外兩個 commit

- `f9c765c` **針灸頁面修復** —— main 上的穴位資料庫本來是全空的（0 張卡、總數卡在 `--`）。兩個原因：sidebar 重構移除了三個 `<select>` 但程式碼還在讀它們的 `.value`；以及 `activeChartMode` 的 TDZ（跟你修過的 `activeChannelsTab` 同一類）。**你分支上的 app.js 可能有類似問題，拉下來對一下。**
- `cd1f598` 上一輪的審查回饋文件

---

## 三、建議順序

1. **先 commit 現在手上的工作**（別讓 4245 行未提交的改動暴露在 rebase 風險下）
2. 拉 main：`git fetch origin && git rebase origin/main`
   - `formulas.json` 一定會衝突，因為 main 的正規化動到全部 201 筆
   - 衝突時：**內容欄位以你的為準**（你在加深），**`category` / `category_en` 以 main 為準**
3. 跑 `node scripts/normalize-formula-category.js --write` 確認收斂成 18 類
4. 驗證：
   ```bash
   node scripts/validate-formula-standard.js
   node scripts/validate-formula-song.js
   node scripts/validate-content-junk.js
   ```
5. 再繼續補內容

---

## 四、繼續往下做時

分工已經定案：**中藥卡與方劑卡由你填充，精修由 Claude 做。**

所以這一輪請聚焦在「有明確來源、可照抄」的欄位——現代應用、藥理、製法、AD 禁忌、方歌這類。**需要判斷取捨的**（哪條算功效、哪條該搬去別的欄位、禁忌要不要精簡）先不要動，標記下來交給我。

上一輪的教訓值得再寫一次：**驗證器全 PASS 不代表沒有損失。** 交付前請自己比一次 main 與分支，確認沒有任何欄位變短或被清空。
