# Antigravity 任務單 · 2026-07-31 → 08-04

Codex 8/4 才回來，這段時間請以**填充**為主。所有任務都是「有明確來源、可照抄、腳本可驗」的類型。

**先看這兩份**：`docs/FORMULA_CARD_TEMPLATE.md`、`docs/COMPARISON_CARD_TEMPLATE.md`

---

## 第一優先：把上一輪沒做完的收尾（不要開新工作）

`docs/ANTIGRAVITY_FEEDBACK_ROUND3.md` 有三件事沒完成。**這些要先做完**，因為 main 已經往前推了 8 個 commit，再拖 rebase 只會更難。

### 1. rebase 到 main ⚠️ 先做這個

分支落後很多，而且 main 動過 `formulas.json`（分類正規化）。

```bash
git fetch origin && git rebase origin/main
```

衝突處理原則：**內容欄位以你的為準**（你在加深），**`category` / `category_en` 以 main 為準**。

### 2. 清掉 `pattern_indications_zh` 的 55 處標題

上一輪你清了 `actions_zh` 的 55 處，但 `pattern_indications_zh` 的 55 處原封不動：

```
formula.jing_fang_bai_du_san.pattern_indications_zh = ["【荊防敗毒散】主治證型"]
formula.chai_ge_jie_ji_tang.pattern_indications_zh  = ["【柴葛解肌湯】主治證型"]
```

掃描條件：陣列元素符合 `^【.+】` 的一律移除。**移除後該欄位變空陣列是對的**，不要塞別的東西進去。

### 3. 分類正規化（上次參數傳錯所以沒生效）

腳本的參數是 **`--write`**，不是 `--apply`。傳錯會被忽略、走 dry run、一個字都不寫。

`表裏雙解劑` 要先加進 `scripts/normalize-formula-category.js` 的 `CANON` 表（建議英文 `Release Both Exterior and Interior`），然後：

```bash
node scripts/normalize-formula-category.js --write
```

### 4. 99 首方歌補出處

`formula_song_zh` 有 201 首，但其中 **99 首完全沒有 `formula_song_source_zh`**。你回報說都出自《湯頭歌訣》，但前面 91 首都有寫出處，這 99 首沒有。

- 確實查得到出處的：寫上是哪一本
- **無法指到具體書目的：標 `AI_generated_pending_review`**，不要留空，也不要一律掛《湯頭歌訣》

《湯頭歌訣》原書收方約 300 首，**不見得涵蓋我們這 201 首的每一首**。沒收錄的方就不該掛這個出處。

---

## 第二優先：證型登錄檔填充（新工作，適合你）

檔案：`data/pathology/pattern_registry.json`（59 筆）

這是這幾天新建的。證型原本沒有自己的登錄檔，`pattern.*` id 只以引用形式散在別的檔案裡。

### 任務 A：補 13 個中文名

找 `needs_name_zh: true` 的 13 筆。

**規則**：
- 用**教材通行的標準名**。`pattern.wind_heat_invading_lung` → 「風熱犯肺」✅，不是自己組的「風熱侵肺」
- 每筆補 `field_sources.name_zh`，記下哪一份課件、哪一頁
- **查不到就留空**，`needs_name_zh` 留著。留空是誠實，音譯是污染
- 不要動 `id`（不可變）
- 不要動已有 `name_zh` 的 46 筆

### 任務 B：補 11 個 `needs_system`

每個證型屬於哪一套辨證體系，是**教材事實不是推論**：

| 代碼 | 體系 |
|---|---|
| `ba_gang` | 八綱辨證 |
| `zang_fu` | 臟腑辨證 |
| `qi_xue_jin_ye` | 氣血津液辨證 |
| `liu_jing` | 六經辨證 |
| `wei_qi_ying_xue` | 衛氣營血辨證 |
| `san_jiao` | 三焦辨證 |
| `bing_yin` | 病因辨證 |

填 `system`（代碼）＋ `system_zh`（中文）＋ `field_sources.system`。**查不到就留 `needs_system`，不要猜。**

### 驗收

```bash
node scripts/build-pattern-registry.js          # dry run,重算覆蓋率
node scripts/validate-comparison-standard.js    # 必須維持 PASS
```

---

## 第三優先：方劑禁忌補齊（有來源才做）

`cautions_zh` 目前 115/201。缺的請從 **American Dragon 的方劑頁**補，每筆記 `field_sources.cautions_zh`。

**查不到就留空。** 禁忌是安全資訊，**編出來的禁忌比沒有禁忌危險**。

---

## 絕對不要碰的

| 項目 | 原因 |
|---|---|
| **`comparisons.json` 的 `cells`** | 鑑別點只能 Ting 寫。寫錯會直接害人辨錯證，而且錯得很像對的。驗證器 C1 會擋 |
| **`condition_canon_shortlist.json` 的 `related_patterns`** | 收斂等於刪連結，是判斷題，留給 Codex |
| **30 張方劑鑑別骨架的任何欄位** | cells 是空的，那是設計，不是待補 |
| **`pattern_registry.json` 的 `level` / `members` / `member_of` / `develops_into`** | 證型的分類結構是 Ting 定的，只填名稱和體系 |
| 已有 `name_zh` 的 46 筆 | §0 只加深不刪除 |

---

## 交付方式

1. **分批 20–30 筆**，不要一次全改
2. 每批跑驗證器
3. 每批 **commit 並且 push**（只 commit 過，工作被洗掉過兩次）
4. **回報前自己先跑一次查核**

最後這條特別重要。上一輪你回報的三句話裡有兩句與資料對不上（「清除 55 處」實際只做一半、「分類 100% 一致」實際沒生效）。Ting 是拿這些數字決定下一步要做什麼的，**回報「13/59」比回報「100%」有用得多**。

寧可說「這批只完成 8 筆，5 筆查不到來源」，也不要說「全部完成」。

---

## 附錄：協作規則（2026-07-31 新增，適用所有 agent）

這兩條是為了解決「兩邊檔案老是不平行」而訂的。分支活太久就會這樣，跟用不用 worktree 無關。

### 規則 1 · 腳本與驗證器歸 main 所有，agent 只動 `data/**`

**不要修改** `scripts/` 底下的任何檔案，特別是驗證器和正規化腳本。

原因很具體：這一輪分類問題卡了三輪修不好，根因是 `scripts/normalize-formula-category.js` 在分支上被改過。**工具被改過，兩邊的「標準」就不一樣了**——資料再怎麼跑都對不齊，而且驗證器還會回報 PASS，因為它是照分支自己那版的標準在驗。

需要改腳本時（例如要新增一個分類）：**提出來，由 main 改完你再拉**。不要自己改。

同理，merge 遇到衝突時：

| 檔案 | 以誰為準 |
|---|---|
| `scripts/**`、`docs/**` | **一律 main** |
| `data/**` 的內容欄位 | 你的（你在加深） |
| `data/**` 的結構欄位（`category`、`id`、分類標籤） | **main** |

### 規則 2 · 小批次、當天合併，不要養大分支

目前這個分支累積了 **41+ 個 commit**，橫跨數天，而 main 同時也在動。衝突是必然的，而且越拖越難解。

以後請這樣做：

1. 一批 **20–30 筆**
2. 跑驗證器
3. commit + push
4. **當天請 Ting merge**
5. **merge 完把分支砍掉，下一批開新分支**

這樣 divergence 永遠不會超過一天份，多數情況根本不會有衝突。

**這次的分支已經太大了**：修完分類就 merge 掉，然後重新開一個乾淨的分支做下一批。

### 為什麼這兩條重要

不是流程潔癖。這個 session 裡：

- 分類問題**修了三輪**都沒過，就是因為工具被改過
- 有兩次工作被覆蓋，都是分支和 main 不同步造成的
- 每次 merge 都要人工比對幾千行 diff，才能確認沒有東西被弄壞

小批次當天合併，這些成本全部消失。
