# 七支紅燈驗證器沒接進 CI(2026-08-24 盤點)

> 一句話:這個專案**已經寫好**七支驗證器,它們現在全部是紅的,而且**一支都沒有
> 接進 `.github/workflows/validate.yml`** —— 所以它們紅了多久沒有人知道。
> 這不是新缺陷,是既有的內容待辦 + 一個 CI 覆蓋缺口。

## 現況

跑 `scripts/validate-*.js` 全部 61 支:**53 PASS / 7 FAIL / 1 誤報**。

| 驗證器 | 缺陷數 | 在 CI |
|---|---|---|
| `validate-herb-canon` | **5,535** failures + 247 warnings | ❌ |
| `validate-herb-card-schema` | 68 | ❌ |
| `validate-condition-standard` | 52 blocking(= ratchet baseline 的那 52) | ❌ |
| `validate-encoding` | 14,430(多數是誤報,見下) | ❌ |
| `validate-herb-quality-strict` | 樣板殘字(如 `herb.xiong_huang` 的「待補」) | ❌ |
| `validate-formula-correctness` | 匯入重複殘根,組成完全空白(都氣丸、復元活血湯…) | ❌ |
| `validate-formula-dose-staging` | composition_doses 的 pinyin 對不上組成 | ❌ |

**誤報一支**:`validate-previsit-payload` 不帶參數時是印用法並 exit 2(它是 CLI)。
正確跑法是 `--self-test`,結果 **ALL PASS(3 good + 33 bad)**,不是真的紅。

## `validate-encoding` 的 14,430 要打折看

- **1,164 筆**落在 `data/audits/pr59_merge_ledger_2026-08-19.json` —— 那是一份
  merge 帳本,它的 JSON **key 本身就是檔案路徑**,不是內容。
- 大量命中是「`*_zh` 陣列的第 [1] 格是來源網址」—— 那是 field_sources 的既有慣例,
  位置正確,不是缺陷。驗證器的規則與這個慣例錯配。
- **1,100 個 replacement character(U+FFFD)是真的**,但 1,036 個集中在
  `data/imports/cloudtcm/formula_url_map.json`(匯入暫存,不上畫面)。
- 會上畫面的那 2 筆(`data/herbs/herb_pairs.json` 的 PDF 頁尾殘字)已於
  `88a1f687` 處理。

→ 這支要先修**規則**(排除 audits/imports、承認 `*_zh` 陣列的來源位),
再談內容。現在把它接進 CI 只會製造一片紅。

## 建議的處理順序(都需要 Ting 裁定,不建議 AI 自行動內容)

1. **`validate-formula-correctness` 的空組成殘根** —— 這幾張卡在畫面上是空的,
   而且是「匯入重複殘根」,判斷刪或補需要你決定。數量少,影響直接。
2. **`validate-herb-quality-strict` 的樣板殘字** —— 「待補」出現在卡片上,
   一眼看得出來,修起來也單純。
3. **`validate-encoding` 修規則** —— 先讓它只報真的,再接 CI。
4. **`validate-herb-canon` 的 5,535** —— 規模最大,適合走 ratchet 制:
   記下當前數字當天花板,CI 只擋「變多」,不要求一次清乾淨。
   `scripts/check-validation-ratchet.js` + `data/audits/validation_baseline.json`
   已經有這套機制,`conditions` 那 52 就是這樣管的。
5. 其餘兩支同 4。

## 為什麼值得做

`docs/AI_CONSTITUTION.md` 的規矩是「靠機器守,不靠記得」。寫好卻沒接線的驗證器,
比沒有寫更糟 —— 它會讓人以為那條線有人守著。今天修的 16 個缺陷裡,有好幾個
(西藥安全欄位、病人文件捏造劑量)之所以能存在那麼久,正是因為
「驗證器全綠」被當成了「沒有問題」。
