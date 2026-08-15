# SOL 查源任務:B2 疼痛／肌骨 11 張條件卡逐病重建針灸處方

> **版本說明(2026-08-12)**:本文以 Ting 交付的 `B2_MSK_PROTOCOL_COLLECTION_REQUEST_SOL.md`
> 為準,並補上三項本專案已實際踩過的坑(標記為 **【補充 A/B/C】**)。
> 其餘結構、欄位與規則一字未改 —— 那一版比初稿嚴謹,採用它。

## 背景

AcuTing OS 有 67 張條件卡的 `acupoint_protocols` 曾逐字共用同一個匯入預設值:

```text
足三里 (ST36) | 合谷 (LI4) | 三陰交 (SP6) | 中脘 (CV12)
```

該模板已從正式欄位移入 `import_artifacts`,處方欄目前刻意留空。

本任務不是請你依模型知識設計配穴,而是為下列 11 張疼痛／肌骨卡收集可追溯、
逐病適用的來源。查不到支持具體穴位的來源時,留空是正確結果。

- Repo:`github.com/guot-beep/acuting-os`
- Branch:`codex/pattern-v2`
- 資料檔:`data/pathology/condition_canon_shortlist.json`
- 權限:唯讀;請把查證結果作為回覆輸出,不要直接修改 repo。

## B2 清單

1. `cond.acute_lumbar_sprain` — 急性腰扭傷 / Acute lumbar sprain
2. `cond.neck_pain_stiff` — 急性頸痛／落枕 / Acute neck pain or stiff neck
3. `cond.whiplash` — 揮鞭式頸部損傷 / Whiplash-associated disorder
4. `cond.rotator_cuff` — 旋轉肌袖肌腱病變 / Rotator cuff tendinopathy
5. `cond.lateral_epicondylitis` — 網球肘 / Lateral epicondylitis
6. `cond.medial_epicondylitis` — 高爾夫球肘 / Medial epicondylitis
7. `cond.carpal_tunnel` — 腕隧道症候群 / Carpal tunnel syndrome
8. `cond.meniscus_injury` — 半月板損傷 / Meniscal injury
9. `cond.achilles_tendinopathy` — 阿基里斯腱病變 / Achilles tendinopathy
10. `cond.hip_osteoarthritis` — 髖骨關節炎 / Hip osteoarthritis
11. `cond.piriformis_syndrome` — 梨狀肌症候群 / Piriformis syndrome

## 核心研究問題

每張卡依序回答:

1. 是否有可靠來源支持針灸作為該疾病或症狀的輔助治療?
2. 來源是否真的報告具體穴位?
3. 來源涵蓋的是疾病本身、疼痛／功能症狀、保守治療期、術後復健,還是不能直接套用的相近疾病?
4. 若來源只有療效結論、沒有具體穴位,不得自行補穴。
5. 若只有試驗 protocol,必須標明是研究介入方案,不能稱為臨床指引或通用處方。
6. 若證據不足、不一致或不支持,照實回傳空穴位與負面結論。

---

## 【補充 A】介入方式必須分辨:**乾針不是針灸**

肌骨疼痛的「針」相關文獻,有很大一部分是**激痛點乾針(dry needling)** ——
那是不同的介入、不同的理論基礎,在許多轄區屬於**不同的執業範圍**。

**把乾針的療效證據寫成針灸的療效證據,就是張冠李戴。**
本專案已因同型錯誤付出代價:曾有卡片引用 Cochrane CD007575(孕期噁心嘔吐)
替妊娠劇吐背書,而該回顧**明確排除**妊娠劇吐。

因此:

- `treatment_parameters.manual_or_electroacupuncture` 的合法值擴充為
  `"manual" | "electroacupuncture" | "dry_needling" | "mixed" | null`
- 每一筆 `sources` 增加必填欄位:

```json
"modality": "acupuncture | electroacupuncture | dry_needling | mixed | unclear"
```

- **若某張卡只找得到乾針證據,這本身就是合格結論**:
  `protocol_status` 用 `not_supported` 或 `limited`,並在 `evidence_note_zh`
  寫明「針灸專屬證據不足,現有證據來自乾針,兩者介入不同」。
- 來源未寫清楚是哪一種時,填 `unclear`,不要猜。

## 【補充 B】對照組決定那個數字的意思

肌骨疼痛領域,「針灸 vs 假針(sham)」與「針灸 vs 常規照護」的效果量差距很大。
只寫「有效」而不寫對照組,等於沒有資訊。

每一筆 `sources` 增加必填欄位:

```json
"comparator": "sham | placebo | usual_care | no_treatment | active_control(寫出是什麼) | none | unclear"
```

`finding_zh` 內請一併寫出效果是相對於哪一組。

## 【補充 C】既有卡片上的「查不到系統性回顧」**不可信,請重查**

這 11 張的 `acupuncture_scope_zh.note` 目前多半寫著
「尚未於本次查證中確認……系統性回顧來源」。

**這種說法在本專案已被推翻過一次**:胎位不正卡寫著查不到艾灸轉胎位的系統性回顧,
而 Cochrane CD003928 自 2005 年就存在、2023 年更新(13 trials / 2,181 women,
中等確定性)。前一次的「沒找到」是不可靠的。

所以請把這 11 張當成**沒有前次結論**重新檢索。若確實不存在,請在
`evidence_note_zh` 明列**檢索過哪些資料庫與檢索詞** —— 「已檢索 PubMed／Cochrane
Library／Embase,檢索詞 X、Y,未找到」與「沒查到」不是同一件事。

## 【補充 D】不要改寫既有 scope,衝突另外回報

這 11 張都已具備 `acupuncture_scope_zh`(can_treat / precautions / co_management)
與各 3 條 `red_flags_zh`,是既有內容。

你回傳的 `scope_zh` 會被當成**提案**,不會直接覆蓋。
若你查到的資料與既有 scope 有實質衝突(例如既有寫「可作為輔助」而來源說不支持),
請額外回傳:

```json
"scope_conflict_note": {
  "existing_says": "既有卡片的說法(逐字)",
  "source_says": "來源的說法",
  "source_ids": ["S1"]
}
```

由 Ting 裁決,不要自行選一邊。

---

## 每張回傳 JSON

請逐卡回傳下列結構。無資料時使用空陣列或 `null`,不要省略 key。

```json
{
  "condition_id": "cond.example",
  "condition_name_zh": "中文病名",
  "condition_name_en": "English name",
  "protocol_status": "supported | limited | symptom_only | postoperative_only | not_supported | no_source",
  "points": [
    {
      "code": "LI11",
      "name_zh": "曲池",
      "role_zh": "局部穴／遠端穴／研究方案固定穴／依症加減穴",
      "reason_zh": "只寫來源明確支持的理由;來源未解釋時填 null",
      "source_ids": ["S1"]
    }
  ],
  "point_rationale_zh": "整組取穴依據;不得超出來源",
  "point_rationale_en": "English equivalent",
  "treatment_parameters": {
    "manual_or_electroacupuncture": null,
    "frequency": null,
    "session_duration": null,
    "treatment_course": null,
    "source_ids": []
  },
  "scope_zh": "針灸在此疾病中的合理角色",
  "scope_conflict_note": null,
  "evidence_note_zh": "證據設計、確定性、主要限制及是否可推廣",
  "condition_specific_cautions_zh": [
    { "text": "警語", "source_ids": ["S2"] }
  ],
  "referral_red_flags_zh": [
    { "text": "轉診或急症條件", "source_ids": ["S3"] }
  ],
  "sources": [
    {
      "source_id": "S1",
      "type": "systematic_review | guideline | rct | textbook | trial_protocol",
      "citation": "完整書目",
      "url": "可直接開啟的文章或資料頁",
      "pmid_or_doi": "PMID、DOI 或 null",
      "covers": "精確說明此來源涵蓋哪個疾病、病期、症狀及患者群",
      "modality": "acupuncture | electroacupuncture | dry_needling | mixed | unclear",
      "comparator": "sham | placebo | usual_care | no_treatment | active_control | none | unclear",
      "supports": ["efficacy", "specific_points", "treatment_parameters", "scope", "caution", "referral"],
      "finding_zh": "來源的實際結論(含效果相對於哪一組)",
      "certainty": "high | moderate | low | very_low | not_graded"
    }
  ],
  "no_source_found": false,
  "unresolved": []
}
```

## 空白結果的正確寫法

### 有療效來源,但沒有穴位資料

```json
{
  "protocol_status": "limited",
  "points": [],
  "no_source_found": false,
  "evidence_note_zh": "來源評估了針灸療效,但未提供可核對的具體穴位,因此不建立處方。"
}
```

### 現有證據不支持

```json
{
  "protocol_status": "not_supported",
  "points": [],
  "no_source_found": false,
  "evidence_note_zh": "現有系統性回顧或指引不支持建立常規針灸處方。"
}
```

### 完全查不到合格來源

```json
{
  "protocol_status": "no_source",
  "points": [],
  "no_source_found": true,
  "evidence_note_zh": "未找到符合本任務來源標準且直接涵蓋此疾病的資料。"
}
```

## 來源標準

依優先順序接受:

1. 專業臨床指引或官方 guideline。
2. Cochrane review、系統性回顧或 meta-analysis。
3. 有 PMID／DOI 的完整 RCT。
4. 已發表的試驗 protocol,但只能支持該研究方案。
5. 正規中醫針灸教材;必須提供書名、主編、版次、出版社、年份及頁碼／篇章。

不接受:診所網站、行銷頁、部落格、社群貼文、AI 摘要、無書目的「常用配穴」、
只有搜尋摘要或資料庫首頁、把相近疾病配穴自行移植、來源只寫 acupuncture 卻自行補穴。

## B2 專屬規則

### 不得為避免重複而人工換穴

疼痛研究可能共同使用阿是穴、LI4、LI11、GB34、ST36 等。
不同卡出現相同穴位不是錯誤;但每張必須有自己對應疾病的來源。

若兩張卡整組完全相同,額外回傳:

```json
{
  "identical_protocol_explanation": {
    "other_condition_id": "cond.example",
    "reason": "兩個獨立疾病來源確實使用相同方案 | 同一來源合併研究兩病 | 無法證明,故本卡不建立處方",
    "source_ids": ["S1", "S2"]
  }
}
```

禁止為了看起來不同而任意增刪穴位、把固定穴改稱辨證加減穴,或依模型知識補一個疾病專屬穴。

### 阿是穴

若來源使用阿是穴,回傳:

```json
{
  "code": "ASHI",
  "name_zh": "阿是穴",
  "role_zh": "依壓痛或病灶位置個別選取",
  "reason_zh": "來源使用局部壓痛點;不是固定解剖穴位"
}
```

不得將阿是穴轉成模型推測的固定穴碼。

### 疾病與情境不可混用

不得混用:旋轉肌袖肌腱病與肌腱撕裂;半月板損傷與一般膝 OA;whiplash 與非創傷性
慢性頸痛;hip OA 與其他髖痛;piriformis syndrome 與一般 sciatica;
Achilles tendinopathy 與肌腱斷裂;術後疼痛與未手術保守治療。

若來源只涵蓋相近疾病,不能建立處方,應放入 `unresolved`。

## 各卡必查範圍

- `acute_lumbar_sprain`:區分急性扭傷、急性非特異性下背痛與慢性腰痛;收集馬尾症候群、進行性神經缺損、骨折及感染紅旗。
- `neck_pain_stiff`:區分落枕、急性機械性頸痛與慢性頸痛;收集發熱合併頸強直、神經缺損與頸部創傷轉診條件。
- `whiplash`:使用 WAD 直接證據;標示 Quebec grade;收集骨折、脫位、脊髓及椎動脈相關紅旗。
- `rotator_cuff`:區分 tendinopathy、subacromial pain、partial/full-thickness tear 與術後復健;不得宣稱針灸修復撕裂。
- `lateral_epicondylitis`:只接受 lateral elbow tendinopathy 直接來源;標明是否只有短期止痛。
- `medial_epicondylitis`:不得複製網球肘方案;只有 lateral 證據時回 `limited` 或 `no_source`;收集尺神經症狀鑑別。
- `carpal_tunnel`:區分輕中度保守治療與嚴重壓迫;收集 thenar atrophy、持續感覺缺失、進行性無力及嚴重電診斷結果的轉診門檻。
- `meniscus_injury`:不得以 knee OA 代替;區分 traumatic/degenerative tear、locked knee 與術後復健;允許只回 scope。
- `achilles_tendinopathy`:區分 midportion、insertional 與 rupture;收集 Thompson test 陽性、爆裂感及無法蹬地的轉診門檻。
- `hip_osteoarthritis`:必須是 hip OA;若回顧合併髖膝,說明髖部結果能否分離;收集骨折、缺血性壞死及感染紅旗。
- `piriformis_syndrome`:確認來源真的診斷 piriformis syndrome 而非泛稱 sciatica;記錄 FAIR test 等診斷條件;收集深臀針刺的神經血管風險。

## 穴位代碼規則

- 使用標準 WHO 經穴代碼,中文穴名必須與代碼相符。
- 奇穴使用正式 `EX-` 代碼;無正式代碼者保留來源原稱並標記 `nonstandard_code: true`。
- 耳穴不得混用體穴代碼。
- 激痛點、運動點、神經走行點不得偽裝成傳統經穴。
- 每個穴位至少連到一個明確報告該穴的 `source_id`。

## 證據措辭

- 指引推薦:「指引建議可考慮……」
- 低確定性回顧:「現有研究提示可能改善……,但證據確定性有限。」
- 單一 RCT:「一項試驗使用此方案並報告……,尚不能視為通用處方。」
- 教材配穴:「教材列為辨證或經驗配穴,並非現代療效證據。」
- 不支持:「現有證據不足以支持建立常規針灸處方。」

除非指引原文使用同等措辭,禁止寫「已證實可以治療」「標準處方」或「首選穴位」。

## 最終總表

完成後附表:

| condition_id | protocol_status | points_count | 最高來源層級 | 介入方式 | 對照組 | 是否疾病直接證據 | 是否只有症狀／術後證據 | 紅旗已收集 | 結論 |
|---|---:|---:|---|---|---|---|---|---|---|

並統計:

```json
{
  "total_conditions": 11,
  "supported": 0,
  "limited": 0,
  "symptom_only": 0,
  "postoperative_only": 0,
  "not_supported": 0,
  "no_source": 0,
  "conditions_with_points": 0,
  "conditions_left_empty": 0,
  "evidence_from_dry_needling_only": 0
}
```

## 成功標準

合格結果可能只有部分卡有可追溯方案,其餘只有症狀輔助、術後證據或留空。
不要以「每張都要有穴位」作為完成條件;每張都有誠實、可稽核的結論才是完成。
