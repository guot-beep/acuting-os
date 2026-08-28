# G1 · 臨床 picker 身分衛生 —— 裁定（1a）與派工（1b）

> **MEASURED TREE：`origin/main` @ `2ee30b46`**（2026-08-28）。本文件零程式碼變更、零資料變更。
> 上游：`docs/audits/IMPLEMENTATION_GAP_REVIEW_2026-08-27.md` 的 G1（P0，硬期限 9/05）。
> 本文件負責報告 §7.2 的 **1a（語意裁定，Claude）**，並附 **1b 的派工單（Sonnet 5）**。

---

## 1. 開工前重驗的四件事（都在 `2ee30b46` 上實測）

1. **缺口還在**：7 個 picker（`point` / `formula` / `herb` / `pattern` / `easternDisease` / `symptom` /
   `westernCondition`）**沒有任何一個**過濾 `review_status === "deprecated"`。
2. **18 筆 legacy 診斷記錄確實全部懸空**：12 筆 `western_condition.*` 沒有一筆在 `conditionCanon`（508）裡、
   6 筆 `eastern_disease.*` 沒有一筆在 `tdisRegistry`（160）裡。所以它們是真的在選單上多出 18 列。
3. **報告漏列的第四個 union，查完是虛驚**：`patternPickerOptions` 還吃了 `conditions.tcm_patterns` 8 筆，
   但那 8 筆的 id **全部存在於正典 `pattern_library`**，而 `dedupeOptions()`（app.js:8875）是
   **first-wins**（`seen.has → false`），正典排在前面 → **那 8 筆一列都上不了畫面**。
   **今天無害，但它是引信**：任何人往 `conditions.tcm_patterns` 加一筆正典沒有的 id，它會無聲出現在選單上。
   1b-ii 一併拆掉即可，不需要另外處理。
4. **picker 的 `terms` 不含 `aliases_zh`**（沙參個案的第 3 點）——D21 把「沙參」併進
   `herb.bei_sha_shen.aliases_zh` 那一步，在輸入層等於沒生效。**併進 1b-i 一起修**。

**今天撤掉 deprecated 之後選單會少幾列（實測）**：pattern **−3**、herb **−4**、formula **−4**、
tdis／condition／symptom／point **−0**（目前無 deprecated，但過濾照樣要加，防的是未來）。合計 **−11 列**。

---

## 2. 裁定：18 筆 legacy 診斷記錄分三桶

**共同前提（D23）**：這 18 筆**留在資料層不動**——D23 明文允許 staging 檔保留 legacy namespace。
本裁定只處理**輸入層**：哪幾筆不該出現在臨床選單上。撤下不刪除任何東西，既有病歷照樣顯示。

### 桶 1 — 有 1:1 正典對應，**撤下，無爭議**（12 筆）

| legacy id（撤下） | 正典 id（改用這個） | 正典卡名 | 對應依據 |
|---|---|---|---|
| `western_condition.pcos` | `cond.pcos` | 多囊性卵巢症候群 | `name_en` 完全相同 |
| `western_condition.anovulation` | `cond.anovulation` | 無排卵 | `name_zh` 完全相同 |
| `western_condition.unexplained_infertility` | `cond.unexplained_infertility` | 不明原因不孕症 | `name_en` 完全相同 |
| `western_condition.diminished_ovarian_reserve` | `cond.diminished_ovarian_reserve` | 卵巢儲備功能下降 | `name_zh` 完全相同 |
| `western_condition.insulin_resistance` | `cond.insulin_resistance` | 胰島素阻抗 | 去「背景」後同名 |
| `western_condition.endometriosis_context` | `cond.endometriosis` | 子宮內膜異位症 | 去「相關情境」後同名 |
| `western_condition.recurrent_pregnancy_loss_context` | `cond.recurrent_pregnancy_loss` | 習慣性流產（**文件情境**） | 正典卡本身就是情境卡，語意完全重疊 |
| `eastern_disease.infertility` | `tdis.bu_yun` | 不孕（女性） | `name_zh` 完全相同 |
| `eastern_disease.irregular_menstruation` | `tdis.yue_jing_bu_tiao` | 月經不調 | `name_zh` 完全相同 |
| `eastern_disease.delayed_menstruation` | `tdis.yue_jing_hou_qi` | 月經後期 | `name_zh` 完全相同 |
| `eastern_disease.amenorrhea` | `tdis.bi_jing` | 閉經 | `name_zh` 完全相同 |
| `eastern_disease.dysmenorrhea` | `tdis.tong_jing` | 痛經 | `name_zh` 完全相同 |

> ⚠️ `eastern_disease.infertility` 對到的是**女性**不孕 `tdis.bu_yun`；正典另有男性不育 `tdis.bu_yu`。
> 這兩張是不同的卡，不要混。

### 桶 2 — 一對多，**照樣撤下，不需要預先裁定**（1 筆）

`eastern_disease.threatened_miscarriage_context`「胎漏胎動不安相關情境」→ 正典拆成兩張：
`tdis.tai_lou`（胎漏）與 `tdis.tai_dong_bu_an`（胎動不安）。
**撤下後由 Ting 當場選一張或兩張都選**，比現在混成一列更精確，不擋 1b-ii。

### 桶 3 — 正典無對應，**要 Ting 決定**（5 筆）

`western_condition.male_factor_context`（男性因素不孕背景）· `western_condition.ovulatory_factor_context`
（排卵因素不孕背景）· `western_condition.ivf_cycle`（試管嬰兒療程背景）·
`western_condition.embryo_transfer`（胚胎植入背景）· `western_condition.luteal_support`（黃體期支持背景）

這 5 筆**在 508 張正典病名卡裡查無對應**（實測，含名稱正規化與 `name_en` 比對）。
它們也**不是病名**——是「這一診發生在療程的哪一段」。撤下去，Ting 就沒有地方記錄這件事。

**我的建議：這 5 筆先留在選單，但 label 前面加上可見標示（例如 `［療程背景］`），其餘 13 筆撤下。**
理由：它們沒有替代品，撤了是製造空缺；而它們也不跟任何正典卡同名，**不會造成「同一個病記成兩個 id」
的分裂**——G1 真正要擋的那個傷害在它們身上並不存在。長期正解是給「療程背景」一個自己的欄位
（不是病名欄），但那要動 schema，D30 剛凍結完，不該擠在 9/05 之前做。

### 撤下之前要知道的一件事：**正典卡比 legacy 記錄薄**

桶 1 的 7 張西醫正典卡實測：`cond.anovulation`／`cond.unexplained_infertility`／`cond.insulin_resistance`
是 **`skeleton` 狀態、只有 13 個欄位**；7 張**全部沒有** `workflow_links` 與 `medication_links`
（fertility workflow 的接線只活在 legacy staging 記錄裡）。

**這不影響撤下的決定**——選單只鑄造 id，內容來自卡片；繼續鑄造分裂 id 的傷害遠大於卡片薄。
但要誠實記著：**撤下之後她點進去會看到比較空的卡**。把「legacy staging 的 workflow／medication／
red_flag 內容搬進那 7 張正典卡」列為後續工作（附對照表在上面，是機械搬運＋逐欄位帳本的形狀），
**不擋 9/05**。

---

## 3. 派工

### 3.1 Task 1b-i — deprecated 過濾 ＋ aliases 搜尋 ＋ 守衛（**Sonnet 5，現在就能開，不等任何裁定**）

**改什麼**

1. 7 個 picker 全部加上 deprecated 過濾。**寫法直接抄同一份檔案裡已經正確的那一個**：
   `patternDifferentialVocab()`（app.js:6748）的 `return p.review_status !== "deprecated";`
   ——它的註解白紙黑字說自己跟 `patternPickerOptions` 同源，只是它有過濾、picker 沒有。
2. picker 的 `terms` 串接加上 `aliases_zh` / `aliases_en`（來源記錄有這些欄位的：herb／formula／
   pattern／tdis／condition）。驗收點：打「沙參」要搜得到 `herb.bei_sha_shen`（它的 `aliases_zh`
   正是 `["沙參"]`），而 `herb.sha_shen`（D21 退役）不再出現。
3. 新驗證器 `scripts/validate-picker-hygiene.js`，並接進 `.github/workflows/validate.yml`。

**不要做**：不要碰 legacy union（那是 1b-ii，等桶 3 裁定）、不要碰任何 `data/**.json`、
不要順手重構 `enhanceLinkField`。

**驗收（負控是硬要求，不是加分）**

- **負控**：從任何一個 picker 把過濾拿掉 → `validate-picker-hygiene.js` **必須 FAIL**。
  做不到就是驗證器沒有守衛力（`gate 自測綠不算數` 的同一條理由）。
- **行為回歸測試**：給一個含 deprecated 記錄的知識 fixture，7 個 picker 的輸出**都不得包含它**。
- **數字對得上**（今天的資料）：pattern **−3**、herb **−4**、formula **−4**，其餘 4 個 picker **−0**。
  數字對不上就是改錯了或漏改。

```bash
node scripts/validate-picker-hygiene.js          # PASS
node scripts/validate-picker-hygiene.js --self-test   # 負控:拿掉過濾必須 FAIL
node scripts/build-data.js && node scripts/check-validation-ratchet.js
```

**落地方式**：Ting 2026-08-14 裁示適用——驗證通過後 rebase → ff-merge → push，不必等我。
**這一項不是安全 gate**（不碰 PHI、不碰持久化格式），實作者自測可接受，不需要另找人對抗測試。

### 3.2 Task 1b-ii — 移除三個 picker 的 legacy union（**Sonnet 5，等桶 3 的答案**）

- `patternPickerOptions` 移除 `k.conditions?.tcm_patterns`（今天是 no-op，拆掉是拆引信）
- `easternDiseasePickerOptions` 移除 `k.conditions?.eastern_diseases`（6 筆全撤，桶 1＋桶 2）
- `westernConditionPickerOptions`：**依桶 3 的答案**——13 筆撤下；那 5 筆療程背景照 Ting 的裁定
  （保留＋標示 / 一起撤下 / 建正典卡）處理
- 驗證器加一條：picker 來源**不得** union 任何不在正典名冊裡的 id（負控：塞一筆假 legacy id 進 fixture → 必須 FAIL）

### 3.3 不派給誰

- **Antigravity**：G1 全在 `app.js`，那條線有編造前科（`modern_functions_en` 整批打回）。
- **Opus 實作 + Opus 覆測**：共用盲點最大值。本項非安全 gate，所以不需要覆測；真要覆測也不能同源。

---

## 4. 現在卡住的只有一件事

**桶 3 那 5 筆療程背景記錄**：Ting 臨床上會不會用到「這一診在 IVF 週期／胚胎植入後／黃體期支持」
這種標記？會用 → 保留＋加標示（我的建議）；不會用 → 18 筆一起撤，選單全清。
**1b-i 不等這個答案。**
