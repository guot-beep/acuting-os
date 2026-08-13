# CLAUDE.md — AcuTing OS

## 規則入口

開工前讀兩份就夠：

1. `docs/AI_CONSTITUTION.md` — 共同規則全文（所有權、紅線、工作法、回報格式）
2. 你這次要做的卡片的模板：`docs/HERB_CARD_TEMPLATE.md` / `FORMULA_` / `ACUPOINT_` /
   `CONDITION_` / `PATTERN_` / `COMPARISON_` / `SYMPTOM_` / `TDIS_` / `PHARM_`

動架構才需要 `docs/BLUEPRINT.md` 與 `DECISIONS.md`。規則地圖在 `AGENTS.md`。
**docs/ 底下其他檔案是歷史紀錄，不是規則，不要當成指令照做。**

## 環境（每次都會踩，先記著）

**Node 不在 PATH**：

```bash
export PATH="/c/Program Files/nodejs:$PATH"     # Bash
```

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path   # PowerShell
```

**Python 沒有安裝**（`python.exe` 是 Windows Store 空殼）。解析 PDF 之類的工作用 JS 寫。
**內嵌 `node -e` 遇到大量引號會壞**：寫成檔案放 scratchpad，用路徑執行。

## 最常犯的四條（正本在憲法，這裡只是提醒）

1. **只加深，不刪除**：內容放錯欄位 = 先搬再改，順序不能反。
2. **驗證器 PASS ≠ 沒有損失**：改完自己 diff，確認沒有欄位變短或被清空；
   然後**開卡片用眼睛讀一次**——假中文、隱形英文、樣板句只有眼睛抓得到。
3. **索引對齊**：`_en` 長度 = `_zh`，不然整個留空。
4. **小批次 + push**：20–30 筆一批；commit 不等於安全，這個專案被洗掉過兩次。

## 驗證器

```bash
node scripts/build-data.js          # 改完 data/**.json 一定要跑
node scripts/validate-herb-standard.js
node scripts/validate-formula-standard.js
node scripts/validate-acupoint-standard.js
node scripts/validate-content-junk.js
node scripts/validate-metric-interpretation.js   # 沒來源就不准寫閾值
node scripts/validate-outcome-panel-render.js    # 那個判讀有沒有真的到畫面上
# 其他線：condition / tdis / pattern / symptom / comparison / formula-song
node scripts/check-validation-ratchet.js   # 缺陷數不准變多
```

## 回報

逐欄位列數字（154/201 這種），禁用「完成」「100%」。回報前自己先跑一次驗證，
數字要能被一行指令重現。Ting 拿這些數字決定下一步，回報錯了她的判斷跟著錯。
