# 攻擊面清單請求 → SOL(2026-08-12)

**Status:** 派工單。SOL 產出研究包,不改任何程式碼或資料。
**Why now:** Codex 額度用盡至 8/18。依 `AGENTS.md`「安全 gate 的驗證分工」,
這段期間**執行層**由隔離的 Opus subagent 擔任,但**攻擊清單仍必須由你出** ——
理由寫在同一段:自家 subagent 與實作者同源,共用盲點的風險較高,你是唯一的
外部視角來源。

---

## 讀取方式(你只有 GitHub 唯讀權限)

你看不到本機工作樹,但**需要的東西都已推上去**:
`github.com/guot-beep/acuting-os`,branch **`codex/pattern-v2`**。

要看的檔:
- `js/previsit-validator.js`(P1 shape 規則本體)
- `app.js` 的 `validatePrevisitPayload` / `pastePrevisitImport` / `saveSoapFromForm`
- `js/clinical-store.js`(load/save/restore 與 fail-loud 訊息)
- `scripts/validate-previsit-payload.js`(self-test + parity gate)
- `scripts/validate-formula-standard.js`(`arr()` / `requireArray()`)
- `docs/AI_REVIEW_FEEDBACK.md` 置頂(Opus 覆測報告,含它**沒測到的面**)
- `docs/P1_PREVISIT_INTAKE_CONTRACT_v0.md` §7(契約正本)

**輸出方式**:你不能寫進 repo,所以**把整份 pack 當回覆內容輸出**,Ting 會轉交,
由我落檔成 `docs/research_packs/ATTACK_INVENTORY_2026-08_SOL.md`。
請用完整 markdown、可直接落檔,不要只給摘要。

---

## 你要產出什麼

內容是**攻擊面**,不是判決(跟你之前那份 P1 transport pack 同樣定位:leads,
執行與證明交給別人)。

每一條寫成:

```
### A-n  <一句話描述>
Surface:  <哪個檔案/函式/資料流>
Why it might break: <推理,不需要證明>
Concrete probe: <具體到可以直接照做的輸入或步驟>
Severity if real: HIGH / MED / LOW
How to tell it's a false alarm: <反證條件 —— 這一行很重要>
```

最後附一節 **「我沒有涵蓋的面」**,誠實列出你這輪沒想到或無法從讀碼判斷的區域。

---

## 優先順序(由高到低)

### 1. 剛修好、還沒被外部驗證過的兩批(最高)

**P1 transport(`63be500c`)** —— 五項修復:
- 原始 number token 無損往返檢查(先剝字串字面量,再逐 token `String(Number(tok)) === tok`)
- metric 值必須是純十進位(`String(v)` 不得含指數形式)
- `filledAt` 經 `Date.UTC` 往返驗證真實曆日
- 控制字元改用字元類別 `[\u0000-\u0008\u000B-\u001F\u007F-\u009F\p{Cf}]`
- parity guard 改成「抽出 `app.js` wrapper 實際執行 + 呼叫計數 + 逐 fixture 判決比對」

**Clinical P4 seam(`17025f01`)** —— 兩項修復:
- parse 失敗訊息只報「key + 字元數」,不轉述內容(四個解析點)
- `validate-formula-standard.js` 先驗 `Array.isArray(expanded_ingredients)` 再進 leaf 迴圈

**已被獨立覆測打過一輪的部分(2026-08-12,`03942336`)**:一位隔離的 Opus
覆測員在上述五項修復裡又找到 **3 HIGH + 5 MED + 4 LOW**,全部已修 ——
包括我漏掉的第八處 PHI 回顯、只比 `ok` 不比 `data` 的 parity gate、
以及 `arr()` 讓桂枝湯從五味變一味而 validator 照樣印 PASS。
**它的報告在 `docs/AI_REVIEW_FEEDBACK.md` 置頂,含它自己列的「沒測到的面」——
請從那份清單接手,不要重複它已經做過的差分 fuzz(30 萬份合法 JSON,0 分歧)。**

**特別想請你想的**(這些是我自己最沒把握的):
- **過度嚴格造成的傷害**。前幾輪都在補「漏放」,但「改嚴」會誤殺合法輸入,
  而誤殺比漏放更難被發現(病人填了合法的值,系統說不行,沒有人會去查)。
  純十進位規則、`\p{Cf}` 剝除、number token 檢查 —— 各自可能擋掉什麼**應該合法**的東西?
- **PHI 出口的完整性**。我只掃了 `JSON.parse` 的 catch。還有哪些路徑可能把
  儲存內容帶到使用者可見的地方?(`String(raw)`、`console.*`、export/import 失敗訊息、
  W1 render、匯入衝突報告、debug 面板、URL、剪貼簿…)
- **字元數本身算不算資訊洩漏**?我判斷不算,想聽反面意見。

### 2. 從未被對抗測試過的面

- **AVS 定稿文件的實際列印/PDF 輸出**(不是 HTML 字串,是瀏覽器列印後的產物)
- **匯出檔在別的工具裡被開啟**(Excel/文字編輯器)時的行為 —— 例如 CSV 注入式的
  `=`/`+`/`-`/`@` 開頭字串,如果未來有 CSV 匯出
- **同一台機器多分頁/多 session 並行寫入** clinical store 的競態
- **瀏覽器 storage 滿了 / 隱私模式 / 使用者手動清除**時的行為

### 3. 內容安全(你的本行)

- `FORMULA_INTERFERON_PROVENANCE_TRACE.md` 已證實:方向反轉的敘述**不是**從單一記錄
  複製的(8 段字串零逐字重複),而且唯一 `public_safe: true` 的那張卡是你上一份
  pack 沒點名的 `formula.shi_quan_da_bu_tang`。
  → 請把「**還有哪些 public_safe: true 的卡帶著無來源的效益方向敘述**」做成清單。
  這是可以純讀資料產出的,而且是目前唯一真正對外曝險的類別。

---

## 邊界

- 不改任何程式碼、資料、schema。只寫研究包。
- 不需要證明你的 leads —— 執行與證偽是下一棒的事。但**每條都要給可直接照做的 probe**,
  沒有 probe 的條目對執行者沒有價值。
- 醫療內容的裁決權在 Ting;技術缺陷的修復在實作線。

---

## 這份清單之後會怎麼被用

隔離的 Opus subagent 會逐條建 harness 執行、證明或推翻,結果寫進
`docs/AI_REVIEW_FEEDBACK.md`。你的 leads 命中率不需要 100% ——
**你的價值在於指出實作者想不到的方向**,那正是自家 subagent 最容易漏的部分。
