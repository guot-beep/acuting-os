# CLAUDE.md — AcuTing OS

## 先讀這些（本檔只是入口，規則的正本在別處）

Claude Code 不會自動讀 `AGENTS.md`，所以這個檔案存在的目的是把你指過去。**開始任何工作前先讀**：

| 檔案 | 內容 |
|---|---|
| `AGENTS.md` | **正本規則**。內容政策、填充原則、來源紀律 |
| `docs/BLUEPRINT.md` | 架構已定案，**不要重新發明**。架構變更走 Claude，方向變更只能來自 Ting |
| `docs/AI_ROLES.md` | 誰做什麼（Antigravity 生成 / Codex 驗證 / Claude 架構 / Ting 終審） |

做特定卡片前再讀對應模板：

- 中藥 → `docs/HERB_CARD_TEMPLATE.md`（§0 有五步必跑流程）
- 方劑 → `docs/FORMULA_CARD_TEMPLATE.md`
- 穴位 → `docs/ACUPOINT_CARD_TEMPLATE.md`
- 辨證鑑別 → `docs/COMPARISON_CARD_TEMPLATE.md`

---

## 環境（每次都會踩，先記著）

**Node 不在 PATH**：

```bash
export PATH="/c/Program Files/nodejs:$PATH"     # Bash
```

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path   # PowerShell
```

**Python 沒有安裝**（`python.exe` 是 Windows Store 空殼）。需要解析 PDF 之類的工作，用 JS 寫。

**內嵌 `node -e` 遇到大量引號會壞**：寫成檔案放 scratchpad，用路徑執行。

---

## 不可違反的原則

### §0 只加深，不刪除

不要用較短的內容覆蓋較長的，不要把有內容的欄位清空。

**發現內容放錯欄位時：先搬到對的欄位，再換掉原欄位。順序不能反，一反就會忘記搬。**（Antigravity 犯過：桂枝湯 `actions_zh` 裡的現代應用被直接刪掉而不是搬到 `applications_zh`。）

### 驗證器 PASS ≠ 沒有損失

驗證器只檢查它會檢查的東西。穴位安全欄位被覆蓋 285/361 筆那次，所有驗證器都 PASS，因為每個字串都不一樣，A8 只抓共用樣板。

**改完資料要自己 diff 一次，確認沒有欄位變短或被清空。**

### 兩源不合就並記

不要自己挑一個。主欄位放優先序高的，另一說並記並標明出處。

### 索引對齊

`_en` 陣列長度必須等於 `_zh`，或者整個留空。**寧可整個留空，也不要半套錯位。**

### 拼音一律不加聲調

穴位、中藥、方劑都是。`pinyin` 無聲調（搜尋用），`pinyin_toned` 僅供顯示。

---

## 工作方式

**commit 不等於安全，一定要 push。** 這個專案發生過兩次工作被洗掉。

**小批次**：一批 20–30 筆，跑驗證器，commit + push。不要一次改 700 多筆。

**腳本歸 main 所有**：agent 只動 `data/**`。改了 `scripts/` 底下的驗證器，兩邊標準就不一樣了，資料再怎麼跑都對不齊——分類問題卡三輪就是這樣來的。

---

## 驗證器

```bash
node scripts/validate-herb-standard.js
node scripts/validate-formula-standard.js
node scripts/validate-formula-song.js
node scripts/validate-acupoint-standard.js
node scripts/validate-comparison-standard.js
node scripts/validate-content-junk.js
node scripts/build-data.js          # 改完 data/**.json 一定要跑
```

---

## 回報紀律

**不要用「100% 完成」這種概括。逐欄位列數字。**

Ting 是拿這些數字決定下一步做什麼，回報錯了她的判斷就跟著錯。寧可說「154/201，48 首缺組成因為課件沒有」，也不要說「全部完成」。

**回報前自己先跑一次驗證。** 這個專案裡「已完成」的宣稱錯過很多次。
