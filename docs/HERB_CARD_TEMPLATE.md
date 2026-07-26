# 中藥卡樣板【定案】 — herb.du_zhong

**Status: FINAL(Ting 定案 2026-07-25)。** 每一味中藥都照這張做。
樣板記錄:`herb.du_zhong`(杜仲)。改樣板 = 先問 Ting。

Ting 定案時的兩句話:「**對藥跟考試標註都留著**」、
「**引用來源都要寫**」。

---

## 1. 卡片區塊(照這個順序,不多不少)

| # | 區塊 | 來源欄位 | 必要性 |
|---|---|---|---|
| 1 | 標頭:中文名 · 帶聲調拼音 · 英文名 | `name_zh` `pinyin` `name_en` | 必 |
| 2 | 分類 / 性味 / 歸經 / 外部連結 | `category` `properties_taste_temp` `channels_zh` | 必 |
| 3 | **考試標註**(★高頻 + 💡考點 pearl) | `exam_importance` `exam_pearl` | 必(Ting 指定保留) |
| 4 | 性味・歸經・常用劑量・使用部位 | `tcm_properties` `dosage` `dosage_g` | 必 |
| 5 | **功效 (Actions)**(傳統功效,中英標籤成對) | `functions_zh` + `actions_en` | 必 |
| 6 | 炮製作用 | `pao_zhi_notes_zh` | 有就填 |
| 7 | 現代藥理(中英標籤成對) | `modern_functions_zh` + `modern_functions_en` | 必 |
| 8 | 主治與症狀(證型 —— 配伍 結構,**配伍藥名可點開**) | `indications_zh` | 必 |
| 9 | 病名症狀索引標籤(中英成對,**點了會全站搜尋該症狀**) | `condition_tags_zh` + `condition_tags_en` | 必 |
| 10 | **經典對藥**(藥對 + 中英配伍理由,**藥名可點開**) | `key_pairs`(`pair` / `rationale_zh` / `rationale_en`) | 必(Ting 指定保留) |
| 10.5 | **古籍原文**(本草原文 + 英譯,一兩句就好) | `classical_text_zh` + `classical_text_en` | 有就填 |
| 11 | 相關方劑 | `related_formulas` | 有就填 |
| 12 | 毒性安全與來源(禁忌/慎用中英 + 具名來源) | `cautions_zh` + `cautions_en` `safety_flags` `field_sources` | 必 |

**功效欄位的唯一真相是 `functions_zh`**(渲染器優先讀它)。舊的
`traditional_functions_zh` 只在 `functions_zh` 空白時當備援 —— 兩者不一致會
讓中英標籤配不起來(麻黃就出過這個問題)。填資料一律寫 `functions_zh`。
把各來源(課件、CloudTCM、American Dragon、atlas)的功效**整合成 3–5 條**
中英成對的標籤,方便 board exam 記憶;不要為每個來源另開一節。

**課件引用一兩個就夠**:`field_sources` 可以逐欄標,但卡片下方只顯示
**每個課件檔一個 chip、最多 2 個**(避免同一頁重複洗版)。

**已刪除、不要再加**:
- `primary_actions_en`(Bastyr Slide Primary Actions)—— 與第 8 區主治重複(Ting: 太重複了)。
- **獨立的「英文功效 (English Actions)」區塊** —— 很奇怪、且與功效重複。英文一律
  **融合進第 5 區「功效 (Actions)」的中英標籤**(Ting 2026-07-25 定案)。
  `actions_en` 與 `functions_zh` 對齊時成對顯示;不對齊時該區塊補上英文獨立標籤,
  **不再另開一節**。

## 1.5 藥名自動連結(Herb linking)

主治、對藥、禁忌/慎用裡出現的**任何中藥名**都會自動變成可點的中英標籤
(中文 + 拼音),點了直接開那味藥的卡片 —— 例如杜仲主治裡的「配 牛膝、獨活」、
注意事項裡的「應搭配黃柏、知母」。
- 由 `data/herbs/herb_canon_shortlist.json` 的 `name_zh` + `aliases_zh` 建索引,
  **長名優先**(懷牛膝 > 牛膝),**不連結自己**。
- 對填資料的 AI 的意義:**主治與對藥請直接寫藥名**(寫「配 牛膝、獨活」即可),
  不需要手動加連結或 id;寫對名字就會自動連起來。

## 2. 硬規則(違反 = validator 擋下或退回)

0. **模板級記錄必須全雙語(E6 FAIL)**。只要記錄有 `field_sources`(= 宣稱照
   模板做),`modern_functions_en` / `condition_tags_en` / `cautions_en` 一個都
   不能缺,缺了 `validate-herb-standard.js` 直接 FAIL。
   (Ting 2026-07-26 問:模板寫了為什麼還是會漏?—— 因為之前文件只是建議、
   檢查器只「報告」缺漏。現在改成擋下。舊資料沒有 `field_sources`,仍是待補
   清單,不會卡住批次。)
1. **中英標籤逐項對齊**:`_en` 陣列長度必須等於 `_zh`;不確定就整個留空。
   錯位 = E5 FAIL(會讓每個標籤配到別人的英文)。
2. **`functions_zh` 只放傳統功效**;現代藥理放 `modern_functions_zh`。
3. **劑量、安全數字絕不虛構**;沒來源就留空 + 標 `safety_review_pending`。
4. **兩源不合就並記**、各標出處,不擅自二選一(見杜仲的性味與劑量欄)。
5. **逐欄引用**:`field_sources` 每欄一筆,課件用
   `curriculum/herbs/<file>#p<N>`,網站用完整 URL。
6. **版面不准硬寫來源名稱**;考試敘述要註明大綱版本(現行 = 2026 NCCAOM)。
7. AI 只能寫 `review_status:"draft"`;`source_checked` 由 Ting 的 RV1 流程升級。

## 3. 樣板欄位清單(杜仲 30 欄,全部到位)

`id` `name_zh` `name_en` `pinyin`(帶聲調) `pharmaceutical_latin` `part_used_en`
`category`(正典) `properties_taste_temp` `tcm_properties` `channels_zh`
`functions_zh` `actions_en` `indications_zh` `condition_tags_zh`
`condition_tags_en` `modern_functions_zh` `modern_functions_en` `dosage`
`dosage_g` `pao_zhi_notes_zh` `key_pairs` `cautions_zh` `cautions_en`
`safety_flags` `safety_review_pending` `related_formulas` `exam_importance`
`exam_pearl` `field_sources` `review_status`

`key_pairs` 內含 `pair` / `rationale_zh` / `rationale_en`。

## 4. 對藥寫法(key_pairs)

```jsonc
"key_pairs": [
  { "pair": "杜仲 + 續斷 Xù Duàn",
    "rationale_zh": "相須。補肝腎、強筋骨、安胎常相須為用 —— 腰膝痠痛、胎動不安",
    "rationale_en": "Xiang Xu (mutual accentuation). Both tonify Liver & Kidney, strengthen sinews and bones, and calm the fetus." }
]
```
好的對藥要寫出**為什麼配**(一散一收、相須相使…)、**主治**、必要時**注意**,
並且 **`rationale_zh` / `rationale_en` 中英都要寫**。藥名照常寫中文即可(會自動連結)。

## 5. 開工

接手指令:`docs/HERB_FILL_DISPATCH.md`(整段貼給 AI)。
欄位規範:`docs/HERB_RECORD_STANDARD.md`。批次順序照 board exam outline。
