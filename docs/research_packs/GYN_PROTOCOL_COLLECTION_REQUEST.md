# 收集請求:婦科 9 張條件卡的針灸處方(給 SOL)

**背景**:這 9 張卡的 `acupoint_protocols` 原本是全庫 67 張逐字相同的匯入預設值
(足三里 ST36／合谷 LI4／三陰交 SP6／中脘 CV12)。已於 2026-08-12 搬進
`import_artifacts` 並清空 —— 因為它不是任何一個病的處方,而是匯入時的樣板。

**未以模型知識代寫替代處方**,這是刻意的:憑記憶寫 67 份處方就是造。
本文請你收集有出處的資料,由 Claude 依你回傳的內容寫回卡片。

---

## 要收集的 9 張卡

| id | 中文 | ICD hint |
|---|---|---|
| `cond.menorrhagia` | 月經過多 | N92.0 |
| `cond.amenorrhea` | 繼發性閉經 | N91.1 |
| `cond.secondary_dysmenorrhea` | 繼發性痛經 | N94.5 |
| `cond.pmdd` | 經前不悅症 | F32.81 |
| `cond.menopause_syndrome` | 更年期症候群 | N95.1 |
| `cond.diminished_ovarian_reserve` | 卵巢儲備功能下降 | E28.3 |
| `cond.pid_chronic` | 慢性骨盆腔炎後遺 | N73.1 |
| `cond.vulvovaginal_candidiasis` | 外陰陰道念珠菌感染 | B37.3 |
| `cond.postpartum_hypolactation` | 產後缺乳 | O92.4 |

---

## 每張卡要回傳什麼

```json
{
  "id": "cond.menorrhagia",
  "points": [
    { "code": "SP6", "name_zh": "三陰交", "role_zh": "為什麼取這一穴(一句)" }
  ],
  "point_rationale_zh": "整組配穴的理由,2-3 句",
  "point_rationale_en": "同上英文",
  "sources": [
    { "type": "systematic_review|guideline|textbook|curriculum",
      "citation": "完整引用(有 DOI/PMID/ISBN 就給)",
      "url": "可點的連結",
      "covers": "這份來源實際涵蓋的族群/病名(逐字)",
      "finding": "它對這個處方實際說了什麼,含確定性等級" }
  ],
  "evidence_note_zh": "一段話:證據到哪裡、不到哪裡",
  "condition_specific_cautions_zh": "這個病專屬的注意事項(不是通用孕期禁忌)",
  "no_source_found": false
}
```

**查不到就回 `"no_source_found": true` 並把 `points` 留空。**
空白會誠實顯示為「待補」;猜出來的處方會被當成查證過的,那更糟。

---

## 來源標準

**算數**:Cochrane / 其他系統性回顧、臨床指引(ACOG、NICE、WHO…)、
教科書(要給版次與頁碼)、Ting 的課件(要給檔名與頁碼)、有 PMID 的原始試驗。

**不算數**:診所網站、部落格、內容農場、沒有出處的「常用配穴」列表、
AI 生成的摘要、以及**只給網站首頁而不是該病頁面的連結**。

---

## 六個已知陷阱(這一輪實際踩到過)

1. **不要讓多張卡共用同一組穴。** 這 9 張會被逐字比對;若回傳結果彼此相同,
   就是把樣板換個包裝送回來,會被退回。

2. **不要引用一份排除了該病的回顧。** 實例:Cochrane CD007575(孕期噁心嘔吐)
   **明確排除妊娠劇吐**,拿它替妊娠劇吐背書就是張冠李戴。
   所以每一筆來源都要填 `covers` —— 逐字寫出它涵蓋誰。

3. **合谷(LI4)＋三陰交(SP6)在可能懷孕的情境要單獨標記。** 這 9 張裡
   `diminished_ovarian_reserve`、`pmdd`、`secondary_dysmenorrhea` 的病人都可能
   正在備孕或已受孕。若處方含這兩穴,請在 `condition_specific_cautions_zh`
   明寫「每週期確認懷孕可能」之類的操作條件。
   `postpartum_hypolactation` 是產後,不受此限,但請說明。

4. **證據強度不同就要寫不同。** 不要把「中等確定性的系統性回顧」與
   「教科書常用配穴」寫成同一種語氣。`evidence_note_zh` 要說得出差別。

5. **中文「經」有歧義。** 檢索時 `經` 同時是「月經」與「神經」——
   我這一輪用它篩選,結果把周邊神經病變、糖尿病神經病變、帶狀皰疹後神經痛
   誤收進婦科。請以 ICD 與病名確認,不要用字串包含。

6. **穴位代碼要能對得上。** 本庫有 947 個穴(361 經穴＋奇穴＋董氏＋耳穴)。
   請用標準代碼(SP6、CV4、BL23…),奇穴用 `EX-` 前綴。
   代碼與中文名不一致時,以代碼為準並註明。

---

## 交付方式

一個 JSON 檔,9 個物件。**逐病分開**,不要合併成「婦科通用方」。
若某一病你只找得到教科書等級的資料,照樣回傳,但把 `type` 標成 `textbook`
並在 `evidence_note_zh` 說清楚 —— 我們要的是分得出強弱的資料,不是一律說好。

回傳後由 Claude 寫入 `data/pathology/condition_canon_shortlist.json`,
並跑 `validate-no-template-protocol.js` 與 `validate-condition-standard.js`。
