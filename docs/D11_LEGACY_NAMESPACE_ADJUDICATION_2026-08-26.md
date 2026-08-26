# D11 legacy 命名空間裁定準備 — 2026-08-26

**這份只分類、不遷移。** Task 10A（`docs/audits/LEGACY_NAMESPACE_RETIRED_ID_2026-08-25.md`）
盤出 4 個 legacy 診斷命名空間、164 個 unique id；本文把它們分成**五桶**，
每桶一個建議。Ting 逐桶說「照辦」或改判即可；機械部分裁定後由 fill 線執行。

量測基準：main @ `60ca605d`。重現：本文每個數字來自對 `data/**`
（排除 audits/generated）的全文掃描＋與 canonical registry 的比對。

---

## 總表

| 桶 | 內容 | 數量 | 建議 | 裁定需求 |
|---|---|---|---|---|
| A | `pat.*` 已有 alias map 對映 | 95 | 已解決——引用端逐步改讀 map，無新裁定 | 無 |
| B | `pat.*` 無對映 | 47 | 跑 `build-pattern-alias-map.js` 擴充；對不到的留清單 | 低 |
| C | `western_condition.*` | 12 | **三種東西分三路**（見下） | **高** |
| D | `eastern_disease.*` | 6 | 5 筆有 tdis 對映候選，1 筆缺正典 | 中 |
| E | `symptom.*` | 5 | 3 筆機械改 `sym.`，2 筆待判 | 低 |

---

## C 桶：`western_condition.*` 12 筆 —— 本次唯一的高階裁定

10A 只說「154 筆待裁定」；實際看內容，這 12 筆是**三種不同性質的東西**，
不能用同一條規則處理：

**C1 有 `cond.*` 雙胞胎（2 筆）→ 機械重導**
`pcos`、`diminished_ovarian_reserve`。同 slug 正典已存在，
引用改指向＋舊 id 進 alias 機制即可。

**C2 真疾病、無正典卡（3 筆）→ 建 `cond.*` 骨架卡再重導**
`anovulation`、`unexplained_infertility`、`insulin_resistance`。
都是真診斷概念；照 D14 建誠實空骨架（不填內容），引用重導。

**C3 臨床情境 `_context`（4 筆）→ 需要妳裁定它們是不是「病」**
`endometriosis_context`、`male_factor_context`、`ovulatory_factor_context`、
`recurrent_pregnancy_loss_context`。它們是「這個病例帶著某個背景」的標記，
不是獨立診斷。選項：
- (a) 去掉 `_context` 併入對應 `cond.*`（endometriosis 等本病卡），
  「情境」語意由病例層的欄位承載——**建議**，最乾淨；
- (b) 承認「context」是一種正式類型，另立詞彙表——多一套機制，不建議。

**C4 治療週期階段（3 筆）→ 這些根本不是診斷，不准進 `cond.*`**
`ivf_cycle`、`embryo_transfer`、`luteal_support`。它們是**療程階段**，
性質接近 visit 層的 `fertility_cycle_tracking`（schema.sql 已有此表）。
建議：知識層 relation 欄位（`formulas.json`、`comparisons.json` 裡的引用）
**撤下**這三個 id；病例種子檔（`fertility_workflow_seed.json`）保留原樣
（那是 staging，D11 本來就允許）。若日後方劑真的要連「IVF 週期階段」，
那是 `modality.*`／protocol 層的事，不是病名。

> 為什麼 C 桶不能機械做：粗暴把 12 筆全 replace 成 `cond.*` 會鑄出
> 3 個「不是病的病名」（C4）——這正是 D11「namespace 就是 type」要防的。

---

## D 桶：`eastern_disease.*` 6 筆

| legacy id | refs | 對映候選 | 信心 |
|---|---|---|---|
| `.delayed_menstruation` | 8 | `tdis.yue_jing_hou_qi` 月經後期 | 名稱精確對映 |
| `.amenorrhea` | 13 | `tdis.bi_jing` 閉經 | 名稱精確對映 |
| `.dysmenorrhea` | 11 | `tdis.tong_jing` 痛經 | 名稱精確對映 |
| `.threatened_miscarriage_context` | 9 | `tdis.tai_lou` 胎漏 | 高（同概念） |
| `.infertility` | **44** | `tdis.bu_yun` 不孕（女）？ | **要裁定**：legacy id 不分男女，registry 分 `bu_yun`（女）／`bu_yu`（男）。引用多在生殖線（女科），建議全部→`bu_yun`，男性因素已由 `male_factor_context` 另行承載 |
| `.irregular_menstruation` | 26 | **無正典**：registry 有先期/後期/過多/過少/延長五個具體病，沒有「月經不調」總稱 | **要裁定**：(a) 建 `tdis.yue_jing_bu_tiao` 總稱卡（中醫婦科學有此病名，正當）——建議；(b) 逐筆改判到五個具體病——工作量大且多數引用本來就是總稱語意 |

## E 桶：`symptom.*` 5 筆

`headache`／`dizziness`／`irritability` → 同 slug `sym.*` 已存在，機械改前綴。
`facial_redness`（面赤）→ `sym.*` 無此卡——面赤是真體徵，建 `sym.facial_redness` 骨架。
`lumbar_soreness`（腰痠）→ 最近的是 `sym.low_back_pain`（下背痛）——**腰痠≠腰痛**
（痠是虛象、痛可虛可實），建議另立 `sym.lumbar_soreness`，不硬併。

## B 桶：`pat.*` 未對映 47 筆的兩個子群

- **ASCII 子群**（`data/config/modern_application_vocabulary.json` 內，~8 筆）：
  `pat.damp_heat` 等。5 筆在 registry 有同 slug `pattern.*`（機械改前綴）；
  `dampness`／`cold_deficiency`／`bi_syndrome` 3 筆無——其中 **`bi_syndrome`
  （痹證）本來就是病不是證**，該指向 `tdis.*`，這是當年混用的化石。
- **CJK 子群**（`361.json` 穴位卡的 patterns 欄位等，~39 筆）：
  `pat.臟腑虛弱` 這類。走既有機制：`build-pattern-alias-map.js` 擴充
  （該檔案是機器生成的，D16 註明過範圍就是 `pat.<中文>`）；
  對不到正典的留在 map 的 pending 區，不強配。

---

## 裁定後的執行順序（fill 線做，不是 Claude）

1. E 桶 3 筆機械前綴 ＋ B 桶 ASCII 5 筆機械前綴（零裁定成分）
2. D 桶 4 筆精確/高信心對映 → alias 條目＋重導
3. C1 兩筆重導
4. 裁定結果下來後：C2 骨架卡、C3/C4 處置、D 桶兩筆、E 桶兩張新骨架
5. 每步跑 `validate-retired-id-references.js`（已在 CI green 區）＋
   `check-validation-ratchet.js`——任何一步讓數字變差就停
