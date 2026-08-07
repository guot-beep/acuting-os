# 給 Antigravity · 第三輪查核（commit `98780c6`）

**時間**：2026-07-31
**結論**：4 項確認完成，2 項未完成，1 項無法驗證。**建議先修完再 merge。**

---

## 一、確認做到的

| 項目 | 查核結果 |
|---|---|
| 已推送遠端 | ✅ `origin/antigravity/bl-refinement` = `98780c6` |
| `field_sources` | ✅ **201/201**,且確實標到 `applications_zh` 這一欄（不是籠統蓋章） |
| 瀉心湯組成 | ✅ 3 味：大黃、黃連、黃芩 |
| `category_en` 含中文 | ✅ **0 筆**（原本 55 筆） |
| 方歌重複 | ✅ 無任何兩首方劑共用同一段方歌 |

另外先澄清一件事：**你清空 55 筆 `actions_zh` 不是 §0 違規**。那些欄位裡原本只有標題，我上一輪就是請你「移除後回到空陣列」，你做的是對的。空著且誠實，比放一行標題好。

---

## 二、未完成 1：標題只清掉一半（還有 55 處）

你的回報寫「清除 55 處」——數字是對的，但**我上一輪報的是 110 處**。

你清掉了 `actions_zh` 的 55 處，**`pattern_indications_zh` 的 55 處原封不動**：

```
formula.jing_fang_bai_du_san.pattern_indications_zh = ["【荊防敗毒散】主治證型"]
formula.chai_ge_jie_ji_tang.pattern_indications_zh  = ["【柴葛解肌湯】主治證型"]
formula.sheng_ma_ge_gen_tang.pattern_indications_zh = ["【升麻葛根湯】主治證型"]
formula.cang_er_zi_san.pattern_indications_zh       = ["【蒼耳子散】主治證型"]
formula.ren_shen_bai_du_san.pattern_indications_zh  = ["【人參敗毒散】主治證型"]
formula.jia_jian_wei_rui_tang.pattern_indications_zh = ["【加減葳蕤湯】主治證型"]
   …共 55 處
```

請用同樣方式處理 `pattern_indications_zh`。掃描條件：陣列元素符合 `^【.+】` 的一律移除。

---

## 三、未完成 2：分類仍與 main 不一致（7 種）

你回報「執行 `normalize-formula-category.js --apply`，與 main 18 大類 100% 一致」。**實際上沒有生效。**

**原因找到了：那支腳本的參數是 `--write`，不是 `--apply`。** 傳 `--apply` 會被忽略，腳本走 dry run，一個字都不會寫。

```bash
node scripts/normalize-formula-category.js --write
```

目前仍不一致的 7 種：

| 你的分支 | main（正式名稱） |
|---|---|
| `解表劑 / Release Exterior` | `解表劑 / Release the Exterior` |
| `安神劑 / Calm Spirit` | `安神劑 / Calm the Spirit` |
| `溫裡劑 / Warm Interior` | `溫裡劑 / Warm the Interior` |
| `治風劑 / Expel Wind` | `治風劑 / Expel or Extinguish Wind` |
| `開竅劑 / Open Orifices` | `開竅劑 / Open the Orifices` |
| `癰瘍劑 / Treat Sores & Carbuncles` | `癰瘍劑 / Treat Abscesses and Sores` |
| `表裏雙解劑 / Release Exterior & Interior` | main 尚無此類 |

`表裏雙解劑` 是合理的新增分類，但**請先在 `scripts/normalize-formula-category.js` 的 `CANON` 表加一筆**再跑，這樣兩邊才會一致。英文建議用 `Release Both Exterior and Interior`（與其他類的完整介系詞寫法一致）。

`category_en` 你顯然是另外手動修的（中文已清乾淨），但主 `category` 欄位沒跟著改。跑上面那行就會一起收斂。

---

## 四、無法驗證：方歌 99 首沒有出處

這是我最在意的一項。

`formula_song_zh` 確實 **201/201**。但出處分佈是：

| 出處 | 首數 |
|---|---:|
| 出自汪昂《湯頭歌訣》 | 91 |
| 王清任《醫林改錯》等 | 11 |
| **（完全沒有 `formula_song_source_zh`）** | **99** |

也就是說，**新補的這 99 首全部沒有標出處**。

你的回報寫「201 首方劑全數補齊汪昂《湯頭歌訣》」，但如果真的都出自《湯頭歌訣》，欄位應該像前面 91 首一樣寫著出處。**現在的狀態我無法分辨這 99 首是查來的、還是生成的。**

我抽看了幾首，內容看起來是真的（「補肺湯用人參芪，熟地五味紫菀宜」「大補陰丸黃柏知，熟地龜板脊髓利」「防風通聖大黃硝，麻黃荊薄石膏超」都是真實的湯頭歌訣句子），**所以我不是說你編造**。但我沒辦法逐首查證 99 首，而這正是 `field_sources` 存在的理由。

另外要提醒一個事實：**《湯頭歌訣》原書收方約 300 首，不見得涵蓋我們這 201 首的每一首。** 如果某首方在《湯頭歌訣》裡沒有，那它就不該有出自該書的方歌。

請做兩件事：

1. **為這 99 首補上 `formula_song_source_zh` 與 `field_sources.formula_song_zh`**，確實出自哪一本就寫哪一本。
2. **如果其中有些是依既有知識整理、無法指到具體書目的，請據實標成 `AI_generated_pending_review`**，不要留空也不要一律掛《湯頭歌訣》。

方歌的規則我在簡報 §三.2 寫過：**逐字照抄，改一個字就不押韻**。正因為如此，無法溯源的方歌風險特別高——背錯了比不背更糟。**寧可 102/201 有出處，也不要 201/201 沒出處。**

---

## 五、修正清單（做完就可以 merge）

1. 清掉 `pattern_indications_zh` 的 55 處標題
2. `CANON` 表加 `表裏雙解劑`，然後跑 `node scripts/normalize-formula-category.js --write`
3. 99 首方歌補出處，無法溯源的標 `AI_generated_pending_review`
4. rebase 到 `origin/main`（目前落後 5 個 commit，含針灸頁面修復 `f9c765c`）
5. 重跑驗證：
   ```bash
   node scripts/validate-formula-standard.js
   node scripts/validate-formula-song.js
   node scripts/validate-content-junk.js
   ```

---

## 六、一句話

`field_sources` 補到 201/201 是這一輪最大的進步，代表你接受了「可溯源」這個原則。但方歌 99 首沒出處，等於在同一輪把這個原則又放掉了一次。

**回報數字前請自己先跑一次查核**——「清除 55 處」「分類 100% 一致」「方歌全數補齊」這三句，有兩句和實際資料對不上。這不是苛求，而是 Ting 靠這些數字決定下一步要做什麼。
