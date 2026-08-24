# Formula–Interferon 敘述來源追溯(Fable,2026-08-12)

**Status:** 追溯結果,唯讀。`data/herbs/**` 屬方劑線路徑,本文**未改任何資料**。
**Trigger:** `FORMULA_INTERFERON_SAFETY_STAGING_2026-08-12.md`(SOL)§Routing 第 45 行
指派給 Fable:「trace the three current benefit strings to their original provenance
and determine whether they were copied from one record」。
**重現:** 對 `data/herbs/formulas.json` 遞迴掃 `/interferon|干擾素/i`,取出每一段
原文與欄位路徑,再依「去空白後逐字相同」分組。

---

## 1. 回答被指派的問題:**不是從同一筆複製的**

掃到 **8 段** interferon 相關字串,分佈在 **7 張卡**。逐字相同分組的結果是
**8 組 × 各 1 筆 —— 零重複**。每一段措辭都不同:

| 卡 | 欄位 | 原文(節錄) | 方向 |
|---|---|---|---|
| `formula.ma_huang_tang` | `herb_drug_interactions_en[0]` | "…**may reduce** the adverse effects of interferon in hepatitis C patients." | 效益 |
| `formula.da_qing_long_tang` | `herb_drug_interactions_en[0]` | "Concurrent use of this formula **reduced** the adverse effects of interferon…" | 效益 |
| `formula.shi_quan_da_bu_tang` | `modern_research_en[4]` | "…may have a **marked protective effect** against interferon toxicity." | 效益 |
| `formula.xiao_chai_hu_tang` | `herb_drug_interactions_en[0]` | "**Acute Pneumonitis** maybe associated with interferon in combination with this formula." | **風險** |
| `formula.xiao_chai_hu_tang` | `modern_research_en[0]` | "**Acute pneumonitis** may be associated with interferon…" | **風險** |
| `formula.liu_wei_di_huang_wan` | `pharmacology_zh` | 「具**誘生干擾素**的作用」 | 機轉(非交互作用) |
| `formula.xiao_chai_hu_tang` | `pharmacology_zh` | (長段藥理綜述) | 機轉 |
| `formula.chai_hu_gui_zhi_tang` | `correction_note` | FB-26 已下架註記 | 已處理 |

措辭各異(`may reduce` / `reduced` / `marked protective effect`)+ 三張卡都帶
`american_dragon_url` → 最合理的來源是 **American Dragon 逐方抓取的
herb-drug interaction 段落**,不是單一記錄擴散。**「複製自同一筆」的假設不成立**,
因此不能用「找到母筆就一次修好」的策略。

---

## 2. 兩處必須修正 SOL 研究包的事實

### 2.1 `xiao_chai_hu_tang` **沒有**效益方向的 interferon 敘述

SOL §Finding 寫「the current beneficial-direction interferon statements reported for
the three target cards」。實際上這張卡的兩段 interferon 敘述**都已經是風險方向**
(acute pneumonitis)。它需要的是**補來源與措辭升級**(SOL 找到的四筆文獻正好用得上),
不是「把效益改成風險」。

### 2.2 SOL 漏掉的第四張,而且**它才是唯一公開可見的**

| 卡 | `public_safe` | `review_status` | 方向 |
|---|---|---|---|
| `formula.ma_huang_tang` | **false** | draft | 效益(無來源) |
| `formula.da_qing_long_tang` | **undefined** | skeleton | 效益(無來源,`source_urls: []`) |
| `formula.xiao_chai_hu_tang` | **false** | draft | 風險(已正確) |
| **`formula.shi_quan_da_bu_tang`** | **`true`** | sourced_cloudtcm_record | **效益(無來源)** |

SOL 點名的三張全部已經是 `public_safe: false` 或 skeleton —— **不對外顯示**。
唯一 `public_safe: true`、真的會被讀到的,是 SOL **沒有點名**的
`formula.shi_quan_da_bu_tang`(「against interferon toxicity」)。

依 SOL 自己的 measurable outcome(「zero public cards presenting the interferon
signal as a benefit」),**目前唯一違反該條的就是這一張**。

### 2.3 欄位位置陷阱

`shi_quan_da_bu_tang` 的敘述在 **`modern_research_en[4]`**,而它的
`herb_drug_interactions_en` 是**空陣列**。任何只掃 `herb_drug_interactions_*`
的修復或驗證都會**漏掉它**。

---

## 3. 建議的處置順序(方劑線 / Ting 裁決,本線不代改)

1. **P0 —— `formula.shi_quan_da_bu_tang`**:唯一公開曝險。把
   `modern_research_en[4]` 標為 `unsupported_directionality` 並下架顯示,
   或 `public_safe → false`(可逆,不刪內容)。這是四張裡唯一急的。
2. **P1 —— `ma_huang_tang` / `da_qing_long_tang`**:同樣無來源的效益敘述,
   但已不公開,可排在 landing 後依 SOL 建議處理(標記 + 抑制,不要機械套上
   小柴胡湯的警告 —— 那是不同方的證據)。
3. **`xiao_chai_hu_tang`**:方向已正確。用 SOL 的四筆文獻升級措辭與來源,
   並注意它的 §Uncertainty:日本 Sho-saiko-to 的成方與本庫 composition
   是否等同,需先確認再直接套用日方標示。
4. **`liu_wei_di_huang_wan`**:「誘生干擾素」是機轉敘述,不屬本次交互作用缺陷。
   但順帶記錄:它的 `herb_drug_interactions_en[0]`「induce marked improvement in
   patients who are undergoing chemotherapy」是**另一則同類的無來源效益敘述**,
   建議併入同一批處理。
5. **`chai_hu_gui_zhi_tang`**:FB-26 已下架,無需再動。

---

## 4. 機器強制面(尚未實作,附理由)

SOL §Routing 第 47 行提議「directionality regression test:已知的不良交互作用
不得被表述成效益」。**本輪未實作**,原因是誠實的:要機器判斷「方向」需要
interaction 敘述帶 `direction` 欄位(benefit / risk / uncertain),那是 schema
變更 —— 而現行裁定把 **schema 正規化列為 landing 前 PAUSE**。

在那之前可行的低風險替代(留給下一輪決定):
- 掃描規則:同一 agent(如 interferon)在不同卡出現「相反方向動詞」時報 WARN,
  由人裁決 —— 不需 schema,但只能報疑點、不能判對錯。
- 或先只對 `public_safe: true` 的卡做無來源效益敘述的清單化盤點。

---

## 5. 本文的邊界

- **零資料變更**:`data/herbs/formulas.json` 未被本輪修改(`git status` 可證)。
- 所有結論來自對現行 HEAD 的實際掃描,非記憶或轉述。
- 醫療內容的最終措辭與「禁忌 vs 慎用」的層級判斷屬 Ting;本文只做來源追溯與
  曝險排序。
