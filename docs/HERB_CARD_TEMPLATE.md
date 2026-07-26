# 中藥卡樣板【定案】 — herb.du_zhong

**Status: FINAL(Ting 定案 2026-07-25)。** 每一味中藥都照這張做。
樣板記錄:`herb.du_zhong`(杜仲)。改樣板 = 先問 Ting。

Ting 定案時的兩句話:「**對藥跟考試標註都留著**」、
「**引用來源都要寫**」。

---

## 1. 卡片區塊(照這個順序,不多不少)

| # | 區塊 | 來源欄位 | 必要性 |
|---|---|---|---|
| 1 | 標頭:中文名 · 帶聲調拼音 · 英文常用名(Common name) | `name_zh` `pinyin` `name_en` | 必 |
| 2 | 分類 / 性味 / 歸經 / 外部連結 | `category` `properties_taste_temp` `channels_zh` | 必 |
| 3 | **考試標註**(★高頻 + 💡考點 pearl) | `exam_importance` `exam_pearl` | 必(Ting 指定保留) |
| 4 | 性味・歸經・常用劑量・使用部位 | `tcm_properties` `dosage` `dosage_g` | 必 |
| 5 | **功效 (Actions)**(傳統功效,中英標籤成對) | `functions_zh` + `actions_en` | 必 |
| 6 | 炮製作用 | `pao_zhi_notes_zh` | 有就填 |
| 7 | 現代藥理(中英標籤成對) | `modern_functions_zh` + `modern_functions_en` | 必 |
| 8 | 主治與症狀(證型 —— 配伍 結構,**配伍藥名可點開**) | `indications_zh` | 必 |
| 9 | 病名症狀索引標籤(中英成對,**點了會全站搜尋該症狀**) | `condition_tags_zh` + `condition_tags_en` | 必 |
| 10 | **經典對藥**(七情關係 + 中英配伍理由 + **主治 + 注意**,不同顏色顯示) | 優先 `data/herbs/herb_pairs.json`; `key_pairs` 僅供尚未建立正式藥對記錄時暫存 | 必(Ting 指定保留) |
| 10.5 | **古籍原文**(本草原文 + 英譯,一兩句就好) | `classical_text_zh` + `classical_text_en` | 有就填 |
| 11 | 相關方劑 | `related_formulas` | 有就填 |
| 11.5 | **學習筆記**(辨識定位、相似藥鑑別、臨床記憶與安全重點；不可空白) | `clinical_use_note` | 必 |
| 12 | 毒性安全與來源 | **`contraindications_zh` + `_en`(禁忌,必填)**、`cautions_zh` + `_en`(慎用)、`safety_flags`、`field_sources` | 必 |

**功效欄位的唯一真相是 `functions_zh`**(渲染器優先讀它)。舊的
`traditional_functions_zh` 只在 `functions_zh` 空白時當備援 —— 兩者不一致會
讓中英標籤配不起來(麻黃就出過這個問題)。填資料一律寫 `functions_zh`。
把各來源(課件、CloudTCM、American Dragon、atlas)的功效**整合成 3–5 條**
中英成對的標籤,方便 board exam 記憶;不要為每個來源另開一節。

**3–5 條只適用於傳統功效 `functions_zh`，不適用於主治或現代藥理。**
`indications_zh` 與 `modern_functions_zh/_en` **不設筆數上限**：實際核讀來源
有 8 則具體、非重複內容就完整寫 8 則，不得為了版面、摘要或看起來整齊而刪成
3–5 則。只可合併真正同義、沒有新增辨證或藥理資訊的重複敘述；不同證型、
症狀、臨床用途、作用機制或研究結果必須分項保留。現代藥理中英仍須逐項對齊。

**課件引用一兩個就夠**:`field_sources` 可以逐欄標,但卡片下方只顯示
**每個課件檔一個 chip、最多 2 個**(避免同一頁重複洗版)。

**外部來源補位與內容搬遷規則**：CloudTCM 無可核實的單味藥頁時，先查可核讀的
專業單味藥頁（例如 Traditional World Medicine），仍無資料再查百度百科，並保存
精確條目 URL。實際開啟並核讀的專業頁面可作主要外部圖像／藥材辨識來源；其
性味歸經、功效、主治、炮製、對藥及劑量等內容也可以搬入相應欄位，但必須逐欄
寫入 `field_sources`，並在 `source_citations.scope` 說明採用了哪些內容。
百度可作備援圖像、別名、基原與一般內容參考。無論來源為何，安全關鍵欄位
（劑量、毒性、孕期、禁忌、交互作用）仍須與課件、American Dragon 或其他
專業藥物來源交叉核對；不得讓單一外部網站覆蓋已有的安全資料或來源差異。
CloudTCM 本地 URL map 沒有匹配時，仍必須以中文藥名查找精確
`https://cloudtcm.com/herb/<數字>` 頁；只有完成查找仍無精確頁，才啟用補位來源。

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

0. **功效要「交叉比對後選重點」,不是照抄也不是全倒(E8 FAIL)**
   (Ting 2026-07-26)
   - **先聯集**:把課件、CloudTCM、American Dragon、atlas 各家列的功效**全部
     攤開比對**,看哪些是各家都提、哪些只有一家提。
   - **再排序**:**最重要的排前面**,判準是「board 考點 + 各家共識」。
     教材/考綱強調的、多家共同列出的 → 前面;單一來源的邊緣功效 → 後面或不收。
   - **數量**:目標 **3–5 條**,模板級記錄硬性 **2–6 條**(超出 E8 FAIL)。
     - 這味藥真的只有 3 條 → 就列 3 條,**不要湊數**。
     - 這味藥真的有 5 條 → **不可以只列 3 條**(之前常犯)。
     - 真的有 10 條 → **不要全列**,挑最重要的 5 條左右。
   - **主治(indications)可以多**,但同樣**重要的排前面**;主治是「證型 ——
     配伍」的敘述,不是標籤,列 3–8 條都合理。
   - 現況(2026-07-26 全庫):**70 味只列 0–1 條(嚴重漏列)、100 味超過 6 條
     (原始倒貨)**,只有 59 味落在合理區間 —— 這就是接手 AI 的整理工作量。

0a. **禁忌症必填(E7 FAIL)**。`contraindications_zh`(+`_en`)是獨立欄位,
   **不能用 `cautions_zh` 代替** —— 「禁用/忌服」(絕對禁忌)和「慎服/慎用」
   (相對注意)是不同的臨床判斷,卡片也分兩格顯示。
   來源順序:① 課件的 Contraindications 段 → ② 權威網站中明確「忌服/禁用/
   不得服」的條目(把它們從注意事項升級過來);「慎服」留在 `cautions_zh`。
   ⚠️ 抽課件時務必確認段落屬於**這一味藥** —— 麻黃後面緊接桂枝的
   「Contraindications: Pregnancy…」,那是桂枝的,張冠李戴會出人命等級的錯。

0b. **模板級記錄必須全雙語(E6 FAIL)**。只要記錄有 `field_sources`(= 宣稱照
   模板做),`modern_functions_en` / `condition_tags_en` / `cautions_en` 一個都
   不能缺,缺了 `validate-herb-standard.js` 直接 FAIL。
   (Ting 2026-07-26 問:模板寫了為什麼還是會漏?—— 因為之前文件只是建議、
   檢查器只「報告」缺漏。現在改成擋下。舊資料沒有 `field_sources`,仍是待補
   清單,不會卡住批次。)
1. **中英標籤逐項對齊**:`_en` 陣列長度必須等於 `_zh`;不確定就整個留空。
   錯位 = E5 FAIL(會讓每個標籤配到別人的英文)。
2. **`functions_zh` 只放傳統功效**;現代藥理放 `modern_functions_zh`。
   主治與現代藥理不設數量上限；來源有幾則有效資料就保留幾則。
3. **劑量、安全數字絕不虛構**;沒來源就留空 + 標 `safety_review_pending`。
4. **兩源不合就並記**、各標出處,不擅自二選一(見杜仲的性味與劑量欄)。
5. **逐欄引用 + 顯示引用**:`field_sources` 每欄一筆,課件用
   `curriculum/herbs/<file>#p<N>`,網站用完整 URL。凡實際參考過的外部網站，
   還必須同步寫入 `source_citations`（建議，含 `name` / `url` / `scope`）或
   `source_urls`，否則卡片底部不會顯示。沒有實際核讀的來源不得加入。
6. **版面不准硬寫來源名稱**;考試敘述要註明大綱版本(現行 = 2026 NCCAOM)。
7. AI 只能寫 `review_status:"draft"`;`source_checked` 由 Ting 的 RV1 流程升級。

## 3. 樣板欄位清單(杜仲 30 欄,全部到位)

`id` `name_zh` `name_en`(英文 common name，不得填拉丁藥名) `pinyin`(帶聲調)
`pharmaceutical_latin`(拉丁藥名，顯示於標頭下一排) `part_used_en`
`category`(正典) `properties_taste_temp` `tcm_properties` `channels_zh`
`functions_zh` `actions_en` `indications_zh` `condition_tags_zh`
`condition_tags_en` `modern_functions_zh` `modern_functions_en` `dosage`
`dosage_g` `pao_zhi_notes_zh` `key_pairs` `cautions_zh` `cautions_en`
`contraindications_zh` `contraindications_en`
`safety_flags` `safety_review_pending` `related_formulas` `exam_importance`
`exam_pearl` `clinical_use_note` `field_sources` `review_status`

`clinical_use_note` 不是把功效、主治重新貼一次，而是整理「這味藥如何辨識與記憶」：
核心定位、與相似藥的鑑別、最重要配伍、炮製／安全提醒及 board 考點。內容必須
由已核讀來源綜合而來，並在 `field_sources.clinical_use_note` 列出來源。

正式對藥記錄放在 `data/herbs/herb_pairs.json`，包含 `relation`、
`pair_meaning_zh/_en`、`indication_zh/_en`、`caution_zh/_en`、
`found_in_formulas`、`sources`。卡片若已有正式藥對記錄，`key_pairs` 留空，
讓渲染器使用完整彩色卡；否則簡略 `key_pairs` 會遮住完整的主治與注意區塊。

## 4. 對藥寫法(`herb_pairs.json`)

```jsonc
{
  "id": "pair.ban_xia__sheng_jiang",
  "herbs": ["herb.ban_xia", "herb.sheng_jiang"],
  "relation": "pair.rel.xiang_shi",
  "pair_meaning_zh": "半夏燥濕化痰、降逆止嘔；生薑溫中和胃並制半夏之毒。兩藥相使。",
  "pair_meaning_en": "Ban Xia redirects rebellious Qi; Sheng Jiang assists and moderates its toxicity.",
  "indication_zh": "胃寒痰飲上逆：噁心嘔吐、吐清水痰涎",
  "indication_en": "Cold Phlegm and thin fluids rebelling from the Stomach.",
  "caution_zh": "陰虛燥咳、津傷及血證者忌用；內服須用炮製半夏。",
  "caution_en": "Avoid in Yin or fluid deficiency and bleeding; use only processed Ban Xia internally.",
  "sources": ["NCBAHM_2026_CH_Appendix_B", "chenoweth_materia_medica_p26"]
}
```
好的對藥要寫出**為什麼配**(一散一收、相須相使…)、**主治**、**注意**，
而且全部中英對齊。正式成品應寫入 `herb_pairs.json`，使用既有彩色對藥卡：

- `relation`：必須標明相須、相使等七情關係。
- `pair_meaning_zh/_en`：為什麼合用、合用後增強什麼。
- `indication_zh/_en`：主治證型與辨識症狀。
- `caution_zh/_en`：禁忌或使用注意。
- `sources`：實際採用的課件、NCBAHM Appendix B 或專業網站。

**對藥數量依來源，不得固定成一則。** 每味藥須攤開課件的 pairing /
major combinations、NCBAHM 對藥、CloudTCM、American Dragon 與實際核讀的
專業頁面，收錄所有 board-relevant 或有明確配伍意義的重要對藥。來源支持 3 組
就建立 3 筆正式記錄；只有來源真的只支持 1 組時才只顯示 1 組。不得為了版面
只挑第一組，也不得把數組不同配伍合併成一張。反向重複（A+B 與 B+A）共用同一
筆 pair record，但該記錄會在兩味藥的卡片中各自顯示。

**不得用簡略 `key_pairs` 蓋掉已存在的完整對藥卡。** 考試 ★／💡 內容放在
`exam_importance` / `exam_pearl`，不取代對藥的主治與注意。

## 5. 開工

接手指令:`docs/HERB_FILL_DISPATCH.md`(整段貼給 AI)。
欄位規範:`docs/HERB_RECORD_STANDARD.md`。批次順序照 board exam outline。
