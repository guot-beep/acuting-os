# ICD-10-CM FY2027 換版盤點(2026-10-22)

執行 `docs/ANTIGRAVITY_DISPATCH_2026-08-19.md` §4。**本次只產報告,`data/interop/condition_crosswalk.json` 一個字都沒改**(§4 明文)。

## 為什麼現在做

08-19 的派工單預言得很準:「679 個碼的 `effective_to` 全部是 `2026-09-30`,六週後全數過期」。
過期日已經到了。**main 的 CI 從 2026-10-01 起就是紅的**,紅在 `validate-crosswalk-mappings.js` 的 XW7:

```
XW7: 679 versioned entries are EXPIRED — the mapping layer is stale.
```

最後一次綠燈是 2026-09-12 的 `8ced6cf7`,那時還沒跨過會計年度。沒有人發現,因為沒有人在那之後推過東西。
這是 `env-dependent-step-blinded-the-ratchet` 的同型:**閘門本身沒壞,是世界走到了它宣告會紅的那一天。**

派工單把這件事指給 Antigravity 而不是 Claude,理由是「Claude 沙箱連 cdc.gov / cms.gov 都是 000」。
**2026-10-22 實測那個判斷已經不成立**:cdc.gov、cms.gov、clinicaltables.nlm.nih.gov、ftp.cdc.gov 全部 200。
(`verify-claims-against-the-source-in-repo`:「核不到」只是暫時診斷。)

## 來源

從目錄實際點進去找到,**不是把 FY2026 網址改數字猜出來的**(派工單 §4.1 明文禁止猜網址):

| 項 | 值 |
|---|---|
| 目錄 | `https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/2027/` |
| 檔案 | `icd10cm-code-descriptions-2027.zip` |
| 大小 | 2,192,779 bytes |
| sha256 | `93e3ad6004badf470c55bfe679b748ae88fd9b2b421851e409eec382c7713b9a` |
| 解出 | `icd10cm-order-2027.txt`(98,403 碼)、`icd10cm-codes-2027.txt`(74,879 可申報碼)、`icd10cm-codes-addenda-2027.txt`(新增 190 / 刪除 30) |

## 方法,以及兩個會讓報告全錯的坑

這份盤點的第一版跑出「97 碼被刪除、223 筆描述不符」。**兩個數字都是假的**,都是參照檔與解析方式選錯。記在這裡,下一年換版的人不必再踩一次。

**坑一:參照檔選錯。**
`icd10cm-codes-2027.txt` 只收**可申報**的碼,分類標頭碼不在裡面。拿它問「這個碼還在不在」,
`M54.5`(下背痛)、`M75.0`(冰凍肩)、`N80`(子宮內膜異位症)這些本來就是標頭的碼會全部被誤報成「FY2027 已刪除」——第一版因此假報 97 筆。
**「碼存不存在」要問 `icd10cm-order-2027.txt`**(收全部碼,第三欄是可申報旗標 0/1);**「能不能拿去申報」才問旗標**。

**坑二:order 檔是固定欄寬,不是空白分隔。**
欄位位置:`0-4` 序號 · `6-12` 碼 · `14` 可申報旗標 · `16-75` 短描述 · `77+` 長描述。
用 `(\d{5})\s+(\S+)\s+([01])\s+(.+)$` 取到的是**短描述**,而短描述是固定寬度報表用的縮寫
(`Endometriosis of bilateral fallops`、`Superfic`、`unsp`)。拿縮寫去跟完整描述比,223 筆全部報成「描述不符」。
描述一律比長描述那一欄,比完是 **0 筆漂移**。

分母與驗證器對齊:只盤 **679 個帶 `effective_to` 的版本化條目**(676 個相異碼 / 150 個病症)。

## 結果

| 分類 | 碼數 | 意義 |
|---|---:|---|
| ① FY2027 仍是可申報碼 | **675** | 碼有效、描述與官方長描述逐字相同 |
| ② 是分類標頭,但我們標成可申報 | **1** | 真缺陷,拿去申報會被退 |
| ③ 是分類標頭,我們也沒標可申報 | 0 | — |
| ④ FY2027 整碼消失 | **0** | — |
| ⑤ 描述與官方不符 | **0** | — |

**臨床內容是好的。** 676 個碼裡 675 個在 FY2027 原封不動,沒有任何一個碼消失,沒有任何一筆描述漂移。
過期的只是 `effective_to` 那個年度戳記。

## 要裁定的一件事:M72.2

`xwalk.plantar_fasciitis`(`cond.plantar_fasciitis`)用的 `M72.2` 在 FY2027 **不再是可申報碼**,被拆成左右腳。
官方 addenda 逐字:

```
Delete:      M722    Plantar fascial fibromatosis
Add:         M7220   Plantar fascial fibromatosis, unspecified foot
Add:         M7221   Plantar fascial fibromatosis, right foot
Add:         M7222   Plantar fascial fibromatosis, left foot
```

order 檔佐證:`M722` 旗標 0(標頭)、`M7220`/`M7221`/`M7222` 旗標 1(可申報)。

**要換成哪一個是臨床裁定,不是機械替換** —— 左右是逐個病人的事實。
常見做法是三個都列、以 `M72.20`(未指定側)當預設 primary,看診時再依實際側別選。
**本次不動資料,等 Ting 裁示。**

## 重新戳記 FY2027 的執行成本

(`measure-execution-cost-before-parking-a-ruling`:呈報待裁項要附分母。)

675 個碼已經逐碼對過官方檔、碼有效、可申報、描述逐字相同。把它們的年度戳記換成

```
release: "FY2027"  ·  effective_from: "2026-10-01"  ·  effective_to: "2027-09-30"
```

是**記錄一個已查證的事實**,不是編造 —— 查證過程就是這份報告。
執行成本:一支落地腳本、逐筆 byte-exact `expect`、約十分鐘;`source` 欄要補上本報告的來源列與 sha256。
決策成本:M72.2 一條。瓶頸在裁定,不在執行。

做完 `validate-crosswalk-mappings.js` 的 XW7 會回到 0,**main 的 CI 才會重新變綠**。
在那之前,任何分支的 CI 都會紅在這一步,與該分支改了什麼無關。

## 未解

- M72.2 等裁示(見上)。
- 本報告只盤 ICD-10-CM。`data/billing/` 底下的 CPT / payer 規則沒有在這次範圍內,它們有沒有年度戳記未查。
- 明年此時會再發生一次。值得考慮讓 `validate-crosswalk-mappings.js` 在到期前 N 週就開始警告,而不是到期當天才紅 ——
  現在的行為是「準時紅」,但紅的那天通常沒有人在看。
