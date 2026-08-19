# SOL 任務四:中藥劑量欄位整形(不查新來源、不寫新數字)

> **這份任務不需要 2025 年版藥典。**
>
> 你在任務三的結論是對的:拿不到各品種正文就一筆都不能寫,我們照做了,一個劑量值都沒改。
> 2025 正文我們目前**取得不到**,所以那 87 筆維持 blocked。
>
> 這一份是**另一件事**:把 repo 裡**已經有的**劑量內容整理成統一形狀,
> 並把每個數字掛回它**已經寫在卡片裡**的出處。
> **全程不得產生任何新數字、不得引用藥典、不得補你記得的常用量。**
> 你只是把既有內容重新排好、標好、把矛盾指出來。

## 為什麼要做這件事

`record.dosage` 目前有 299 張卡有內容,但**一張都沒上過畫面**。
不接線是刻意的,因為那個欄位有三個問題,接上去會直接放出危險數字:

1. **形狀有四種**:物件 111 / 內含 JSON 的字串 176 / null 59 / 純字串 12。
   同一個欄位、四種讀法,任何渲染邏輯都會漏。
2. **藥用與食療混在一起**,而且 **80 張的食療上限高於藥用上限**。
   最極端:金錢草 藥用≤60g、食療≤200g;大黃 藥用≤9g、食療≤30g。
   盲撈會顯示更危險的那個數字。
3. **有自相矛盾的卡**:4 張(芒硝、阿膠、鹿角膠、鹿茸)卡片他處寫明烊化／沖服／不入湯劑,
   `dosage` 卻寫入湯劑並給克級數字。

整形完成後,這個欄位才有機會安全上畫面。在那之前我們有一個 gate
(`scripts/validate-herb-dosage-shape.js`)擋著,不會有人不小心接上去。

- Repo:`github.com/guot-beep/acuting-os`,branch `codex/pattern-v2`
- 資料檔:`data/herbs/herb_canon_shortlist.json`(Blob SHA 與任務三相同者為準)
- 權限:唯讀,把結果作為回覆輸出,不要改 repo

## 紅線(違反任何一條,整份退回)

1. **不得產生任何新的劑量數字。** 目標值必須逐字來自該筆記錄現有欄位。
2. **不得引用《中國藥典》**(2020 或 2025 皆同)。這份任務不碰藥典。
3. **不得補「常用量」「一般用量」**,不論來自教材記憶或模型知識。
4. **不得跨卡借值。** 浙貝母不能借川貝母,炮薑不能借乾薑,南沙參不能借北沙參。
5. 讀不懂或無法歸類的內容 → `unresolved`,**不要猜、不要丟掉**。
6. 數字有疑慮(量級不合理、給法矛盾)→ 標記,**但不要自行更正**。

## 回傳格式(逐卡)

```json
{
  "herb_id": "herb.example",
  "name_zh": "中文名",
  "original_shape": "object | json_string | plain_string | null",
  "normalized": {
    "medicinal": [
      {
        "route": "decoction | powder | pill | topical | dissolved | unclear",
        "low_g": 3,
        "high_g": 10,
        "verbatim": "原文逐字,不要改寫",
        "attributed_to": "這個數字在原記錄裡標的出處(CloudTCM／American Dragon／課件／未標)"
      }
    ],
    "dietary": [
      { "low_g": null, "high_g": null, "verbatim": "原文逐字", "attributed_to": "同上" }
    ],
    "preparation_notes": ["給法／炮製相關的逐字原文(先煎、後下、包煎、烊化、沖服…)"],
    "cautions_in_dosage_field": ["原本混在劑量欄裡的警語逐字原文"]
  },
  "flags": {
    "dietary_exceeds_medicinal": false,
    "route_contradiction": false,
    "magnitude_suspicious": false,
    "unattributed_numbers": false
  },
  "flag_explanation_zh": "有 flag 時逐條說明;沒有填 null",
  "unresolved": [],
  "changed_nothing": true
}
```

`changed_nothing` 必須是 `true`。這份任務結束時,所有數字應與輸入逐字相同 ——
只是被搬到正確的欄位、標上出處。若你認為某個數字必須改,**不要改**,寫進 `flag_explanation_zh`。

## 分組與各組要求

### 第 1 組:形狀整形(全部 299 張有內容的卡)

把四種形狀收斂成上面那個 `normalized` 結構。重點:

- **內含 JSON 的字串(176 張)**:那是被序列化過的物件,`{"一般建議":"9-15克",...}`
  整個塞進字串欄位。請解析後填進 `normalized`,`original_shape` 標 `json_string`。
- 鍵名不統一(`一般建議`／`decoction_g`／`standard_daily_g`／`最大量`／`特殊說明`／
  `食療用量範圍`／`preparation_zh`…),請依語意歸位,不要保留原鍵名。
- 一個欄位裡塞了多種給法(「煎湯3-6克;研末0.6-1克」)→ 拆成 `medicinal` 陣列的多筆,
  各自標 `route`。

### 第 2 組:藥用/食療分離(重點在那 80 張)

**這是本任務最重要的一組。**

「食療用量範圍」不是治療劑量。目前兩者混在同一個欄位,而且 80 張的食療上限更高。
請把每一個數字明確歸到 `medicinal` 或 `dietary`,並在 `flags.dietary_exceeds_medicinal`
標出落差。

歸不清楚的(原文沒說是藥用還是食療)→ **不要猜**,放 `unresolved` 並說明。

### 第 3 組:矛盾與可疑標記(不修,只標)

- `route_contradiction`:卡片他處寫烊化／沖服／只入丸散／不入湯劑,`dosage` 卻寫入湯劑克數。
  已知 4 張:芒硝、阿膠、鹿角膠、鹿茸。請確認並找出是否還有其他。
- `magnitude_suspicious`:量級與該藥性質明顯不符。
  **已知一張請務必處理:`herb.su_he_xiang` 蘇合香** ——
  你在任務三標為 SAFETY_HOLD(芳香開竅藥卻寫 9-15 克入湯劑)。
  請在本次標出 `magnitude_suspicious: true` 並說明,但**不要提出正確數字**。
- `unattributed_numbers`:數字沒有任何來源標記。這一項會決定哪些卡片將來能上畫面。

### 第 4 組:10 張形狀特殊的卡(任務三誤判為空的那批)

白酒、黃酒、雞子黃、犀角、炮薑、罌粟殼、穿山甲、青木香、金箔、銀箔。

這 10 張的 `dosage` 是**物件**不是空值 —— 任務三的判空測試沒分辨型別,
所以列成「空」。你對它們的處置結論(維持空、不得建立現代劑量)仍然正確,
本次請照第 1 組整形,並在 `flag_explanation_zh` 逐張寫明屬於下列哪一類:

- `prohibited`:犀角、穿山甲(保育／法規禁用,不得建立現代內服劑量)
- `restricted`:罌粟殼(管制,不得從歷史方量推現代劑量)
- `unsafe_obsolete`:青木香(馬兜鈴酸)
- `non_canonical`:白酒、黃酒、雞子黃、金箔、銀箔(方中載體或非單味藥條目)
- `do_not_borrow`:炮薑(不得借乾薑劑量)

分類依據請寫出來源;若該記錄本身沒寫,填 `未標註` —— 不要用你的知識補。

## 最終總表

| herb_id | 原形狀 | medicinal 筆數 | dietary 筆數 | 食療超量 | 給法矛盾 | 量級可疑 | 數字無出處 | unresolved |
|---|---|---:|---:|---|---|---|---|---:|

```json
{
  "total_records": 358,
  "with_dosage_content": 299,
  "normalized_ok": 0,
  "shape_json_string": 176,
  "shape_object": 111,
  "shape_plain_string": 12,
  "shape_null": 59,
  "dietary_exceeds_medicinal": 0,
  "route_contradiction": 0,
  "magnitude_suspicious": 0,
  "unattributed_numbers": 0,
  "unresolved_total": 0,
  "new_numbers_introduced": 0
}
```

`new_numbers_introduced` 必須是 **0**。這是這份任務的驗收條件。

## 成功標準

不是「整理得漂亮」,是**可稽核**:

1. 每一個數字都能追回它在原記錄裡的位置與出處標記。
2. 藥用與食療徹底分開,80 張落差全部標出來。
3. 矛盾與可疑卡標出來但**沒有被你修正**。
4. 讀不懂的進 `unresolved`,不是被靜靜丟掉。

**這份任務的價值在於它不新增任何知識。** 我們要的是把既有內容排整齊到可以安全上畫面,
不是更多劑量。等 2025 藥典正文拿得到時,再用任務三的規格逐筆查證。
