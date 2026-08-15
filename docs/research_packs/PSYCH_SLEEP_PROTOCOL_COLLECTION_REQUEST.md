# SOL 查源任務:B3 精神／睡眠 10 張條件卡逐病重建針灸處方

> **格式與 B1／B2 完全相同**(`GYN_` / `MSK_PROTOCOL_COLLECTION_REQUEST.md`)。
> 欄位、來源標準、證據措辭一字未改 —— 直接沿用,不要另創格式。
> 本批新增的是 **【補充 E】耳穴／NADA** 與 **【補充 F】量表分數不等於臨床緩解**,
> 那是精神／睡眠這一線特有的兩個坑。

## 背景

AcuTing OS 有 67 張條件卡的 `acupoint_protocols` 曾逐字共用同一個匯入預設值:

```text
足三里 (ST36) | 合谷 (LI4) | 三陰交 (SP6) | 中脘 (CV12)
```

該模板已從正式欄位移入 `import_artifacts`,處方欄目前刻意留空。

本任務不是請你依模型知識設計配穴,而是為下列 10 張精神／睡眠卡收集可追溯、
逐病適用的來源。查不到支持具體穴位的來源時,留空是正確結果。

- Repo:`github.com/guot-beep/acuting-os`
- Branch:`codex/pattern-v2`
- 資料檔:`data/pathology/condition_canon_shortlist.json`
- 權限:唯讀;請把查證結果作為回覆輸出,不要直接修改 repo。

## B3 清單

1. `cond.anxiety` — 焦慮症 / Anxiety disorder
2. `cond.panic_disorder` — 恐慌症 / Panic disorder
3. `cond.ptsd` — 創傷後壓力症 / Post-traumatic stress disorder
4. `cond.adhd` — 注意力不足過動症 / ADHD
5. `cond.stress_burnout` — 壓力與職業倦怠 / Stress and occupational burnout
6. `cond.chronic_fatigue` — 慢性疲勞症候群 / Chronic fatigue syndrome (ME/CFS)
7. `cond.restless_legs` — 不寧腿症候群 / Restless legs syndrome
8. `cond.somatic_symptom` — 身體症狀障礙症 / Somatic symptom disorder
9. `cond.poor_memory` — 記憶力減退 / Memory complaint
10. `cond.eating_disorder` — 飲食障礙症 / Eating disorder

## 核心研究問題

每張卡依序回答:

1. 是否有可靠來源支持針灸作為該疾病或症狀的輔助治療?
2. 來源是否真的報告具體穴位?
3. 來源涵蓋的是疾病本身、單一症狀(如失眠、疼痛)、既有治療的輔助,還是不能直接套用的相近診斷?
4. 若來源只有療效結論、沒有具體穴位,不得自行補穴。
5. 若只有試驗 protocol,必須標明是研究介入方案,不能稱為臨床指引或通用處方。
6. 若證據不足、不一致或不支持,照實回傳空穴位與負面結論。

---

## 【補充 A】介入方式必須分辨

`treatment_parameters.manual_or_electroacupuncture` 的合法值:
`"manual" | "electroacupuncture" | "auricular" | "acupressure" | "dry_needling" | "mixed" | null`

每一筆 `sources` 必填:

```json
"modality": "acupuncture | electroacupuncture | auricular | acupressure | laser | dry_needling | mixed | unclear"
```

**介入不同,證據不可互相頂替。** 來源未寫清楚時填 `unclear`,不要猜。

## 【補充 B】對照組決定那個數字的意思

精神／睡眠是**期待效應最大**的領域之一,「針灸 vs 假針」與「針灸 vs 等候名單」
的效果量常常差一個量級。只寫「有效」而不寫對照組,等於沒有資訊。

每一筆 `sources` 必填:

```json
"comparator": "sham | placebo | usual_care | no_treatment | waitlist | active_control(寫出是什麼) | none | unclear"
```

**`waitlist`(等候名單)請務必與 `sham` 分開標記** —— 這一線大量陽性結果來自等候名單對照。
`finding_zh` 內請一併寫出效果是相對於哪一組。

## 【補充 C】既有卡片上的「查不到系統性回顧」不可信,請重查

這 10 張的 `acupuncture_scope_zh.note` 目前多半寫著
「尚未於本次查證中確認……系統性回顧來源」。

**這種說法在本專案已被推翻過一次**:胎位不正卡寫著查不到艾灸轉胎位的系統性回顧,
而 Cochrane CD003928 自 2005 年就存在、2023 年更新(13 trials / 2,181 women,中等確定性)。

請把這 10 張當成**沒有前次結論**重新檢索。若確實不存在,請在 `evidence_note_zh`
明列**檢索過哪些資料庫與檢索詞**與檢索日期 ——
「已檢索 PubMed／Cochrane Library／Embase,檢索詞 X、Y,未找到」與「沒查到」不是同一件事。

## 【補充 D】不要改寫既有 scope,衝突另外回報

你回傳的 `scope_zh` 會被當成**提案**,不會直接覆蓋。
若與既有 scope 有實質衝突,額外回傳:

```json
"scope_conflict_note": {
  "existing_says": "既有卡片的說法(逐字)",
  "source_says": "來源的說法",
  "source_ids": ["S1"]
}
```

由 Ting 裁決,不要自行選一邊。

## 【補充 E】耳穴／NADA 是獨立介入,不可併入體針

精神科針灸文獻有一大塊是**耳穴**,尤其 **NADA 五點方案**
(Shen Men、Sympathetic、Kidney、Liver、Lung)—— 常用於成癮、焦慮、PTSD。

這是**不同的介入**:不同的取穴系統、不同的訓練與執業規範,
在許多轄區由非針灸師依 protocol 施作。

- 耳穴證據 `modality` 填 `auricular`,**不得用體穴代碼表示**;
  耳穴請保留來源原稱並標記 `nonstandard_code: true`。
- **若某張卡只找得到耳穴／NADA 證據,這本身就是合格結論**:
  `protocol_status` 用 `limited`,並在 `evidence_note_zh` 寫明
  「現有證據來自耳穴／NADA 方案,非體針,兩者介入不同」。
- 統計時併入 `evidence_from_auricular_only`。

## 【補充 F】量表分數改善不等於臨床緩解

這是 B1 的「替代指標」規則在精神科的版本,而且更容易踩。

PSQI、HAMA、HAMD、PCL-5、ISI 等**自評或他評量表的分數變化**,
不等於診斷緩解、不等於停藥、不等於功能恢復。

- `finding_zh` 必須寫清楚**測的是什麼量表、變化多少、是否達最小臨床重要差異(MCID)**。
- 只有量表分數改善時,`protocol_status` **不得**寫 `supported`。
- 主要結果為自評、且對照組為等候名單、且未盲化時,`certainty` 不得高於 `low`。

## 【補充 G】這一批的安全底線(每張都要)

精神科這條線的風險不在扎針,在**延誤或取代既有治療**。

1. **每一張卡的 `referral_red_flags_zh` 都必須包含自傷／自殺意念的處理路徑**,
   並附 `source_ids`。查不到來源時照實留空,但要在 `unresolved` 說明 —— 不要自行編寫。
2. **不得出現任何可被讀成「可減藥、可停藥、可替代心理治療或精神科治療」的措辭。**
   若來源本身只支持「輔助既有治療(adjunct)」,請逐字寫出 adjunct,不要寫成替代方案。
3. 精神科用藥與中藥的交互作用不在本任務範圍,但若來源提及,請放進
   `condition_specific_cautions_zh` 並附來源。

---

## 每張回傳 JSON

請逐卡回傳下列結構。無資料時使用空陣列或 `null`,不要省略 key。

```json
{
  "condition_id": "cond.example",
  "condition_name_zh": "中文病名",
  "condition_name_en": "English name",
  "protocol_status": "supported | limited | symptom_only | adjunct_only | not_supported | no_source",
  "points": [
    {
      "code": "HT7",
      "name_zh": "神門",
      "role_zh": "研究方案固定穴／依症加減穴／耳穴",
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
  "scope_zh": "針灸在此疾病中的合理角色(是否僅為 adjunct)",
  "scope_conflict_note": null,
  "evidence_note_zh": "證據設計、對照組、量表與 MCID、確定性、主要限制;查不到時寫檢索日期／資料庫／檢索詞",
  "condition_specific_cautions_zh": [
    { "text": "警語", "source_ids": ["S2"] }
  ],
  "referral_red_flags_zh": [
    { "text": "轉診或急症條件(必含自傷風險路徑)", "source_ids": ["S3"] }
  ],
  "sources": [
    {
      "source_id": "S1",
      "type": "systematic_review | guideline | rct | textbook | trial_protocol",
      "citation": "完整書目",
      "url": "可直接開啟的文章或資料頁",
      "pmid_or_doi": "PMID、DOI 或 null",
      "covers": "精確說明此來源涵蓋哪個診斷、嚴重度、共病及患者群",
      "modality": "acupuncture | electroacupuncture | auricular | acupressure | laser | dry_needling | mixed | unclear",
      "comparator": "sham | placebo | usual_care | no_treatment | waitlist | active_control | none | unclear",
      "supports": ["efficacy", "specific_points", "treatment_parameters", "scope", "caution", "referral"],
      "primary_outcome_zh": "主要結果是什麼量表／指標,是否為自評",
      "finding_zh": "來源的實際結論(含效果相對於哪一組、是否達 MCID)",
      "certainty": "high | moderate | low | very_low | not_graded"
    }
  ],
  "no_source_found": false,
  "unresolved": []
}
```

## 空白結果的正確寫法

### 只支持輔助既有治療

```json
{
  "protocol_status": "adjunct_only",
  "points": [],
  "no_source_found": false,
  "evidence_note_zh": "來源僅支持作為既有精神科或心理治療的輔助,未支持單獨使用。"
}
```

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
  "evidence_note_zh": "2026-08-XX 檢索 PubMed、Cochrane Library、Embase;檢索詞:……。未找到符合本任務來源標準且直接涵蓋此診斷的資料。"
}
```

## 來源標準

依優先順序接受:

1. 專業臨床指引或官方 guideline(NICE、APA、AASM 等)。
2. Cochrane review、系統性回顧或 meta-analysis。
3. 有 PMID／DOI 的完整 RCT。
4. 已發表的試驗 protocol,但只能支持該研究方案。
5. 正規中醫針灸教材;必須提供書名、主編、版次、出版社、年份及頁碼／篇章。

不接受:診所網站、行銷頁、部落格、社群貼文、AI 摘要、無書目的「常用配穴」、
只有搜尋摘要或資料庫首頁、把相近診斷配穴自行移植、來源只寫 acupuncture 卻自行補穴。

## B3 專屬規則

### 診斷不可混用

不得混用:一般焦慮情緒與 GAD;GAD 與恐慌症;PTSD 與一般壓力反應;
兒童 ADHD 與成人 ADHD;職業倦怠與憂鬱症;ME/CFS 與 long COVID 疲勞與一般疲倦;
不寧腿症候群與週期性肢體運動障礙與一般夜間抽筋;
身體症狀障礙症與已排除器質病因的慢性疼痛;
主觀記憶抱怨與 MCI 與失智症;神經性厭食與暴食症與嗜食症。

若來源只涵蓋相近診斷,不能建立處方,應放入 `unresolved`。

### 不得為避免重複而人工換穴

精神／睡眠研究大量共用 HT7、PC6、GV20、EX-HN3(印堂)、SP6、KI3、安眠穴。
不同卡出現相同穴位不是錯誤;但每張必須有自己對應診斷的來源。

若兩張卡整組完全相同,額外回傳:

```json
{
  "identical_protocol_explanation": {
    "other_condition_id": "cond.example",
    "reason": "兩個獨立診斷來源確實使用相同方案 | 同一來源合併研究兩病 | 無法證明,故本卡不建立處方",
    "source_ids": ["S1", "S2"]
  }
}
```

禁止為了看起來不同而任意增刪穴位、把固定穴改稱辨證加減穴,或依模型知識補一個診斷專屬穴。

## 各卡必查範圍

- `anxiety`:區分 GAD、情境性焦慮與焦慮症狀量表;收集自傷風險、物質戒斷性焦慮、
  以及**甲狀腺功能亢進／心律不整等會偽裝成焦慮的器質病因**轉診條件。
- `panic_disorder`:恐慌發作與心肌梗塞、肺栓塞、低血糖、嗜鉻細胞瘤的鑑別**必須收集**;
  首次發作或非典型表現應優先排除器質病因。
- `ptsd`:區分 PTSD、複雜性 PTSD 與急性壓力反應;
  收集**創傷相關解離／再創傷風險**與施術時的安全考量(針刺與臥位可能誘發);
  若證據只支持輔助既有創傷治療,逐字寫出。
- `adhd`:區分兒童與成人、藥物治療中與未治療;
  多數證據品質有限,若只支持輔助,不得寫成替代用藥方案;收集兒童針刺的年齡與同意議題。
- `stress_burnout`:**ICD-11 將職業倦怠定義為職業現象,不是醫療診斷** ——
  請在 `scope_zh` 明確反映這一點;並收集與憂鬱症的鑑別轉診條件。
- `chronic_fatigue`:使用 ME/CFS 直接證據;**運動後不適(PEM)是核心特徵**,
  收集「漸進式運動可能有害」的現行立場;與 long COVID 疲勞、甲狀腺／貧血／睡眠呼吸中止鑑別。
- `restless_legs`:**這是神經科診斷,不是精神科** ——
  必查**缺鐵(ferritin)評估**、腎功能、懷孕與藥物誘發(抗組織胺、抗憂鬱劑、多巴胺增強現象);
  收集何時應轉神經科。
- `somatic_symptom`:**前提是器質病因已被適當排除**,請在 scope 寫明;
  收集「不得以本診斷為由停止必要檢查」的界線。
- `poor_memory`:區分主觀記憶抱怨、MCI 與失智症;
  收集**應轉診做認知評估的門檻**,以及可逆病因(B12、甲狀腺、憂鬱、藥物、睡眠呼吸中止)。
- `eating_disorder`:**醫療不穩定是禁忌情境** ——
  必須收集電解質異常、心搏過緩／心律不整、體重過低、再餵食症候群風險的**急症轉診門檻**;
  針灸在此最多為輔助,不得寫成可改善進食行為或體重的治療。

## 穴位代碼規則

- 使用標準 WHO 經穴代碼,中文穴名必須與代碼相符。
- 奇穴使用正式 `EX-` 代碼(例:印堂 `EX-HN3`、四神聰 `EX-HN1`);
  無正式代碼者(例:安眠穴)保留來源原稱並標記 `nonstandard_code: true`。
- **耳穴不得混用體穴代碼**(見補充 E)。
- 每個穴位至少連到一個明確報告該穴的 `source_id`。

> 本庫督脈用 `GV`(不是 `DU`),任脈用 `CV`(不是 `RN`)。
> 用其他慣例我會正規化,但直接寫對比較好。

## 證據措辭

- 指引推薦:「指引建議可考慮……」
- 低確定性回顧:「現有研究提示可能改善……,但證據確定性有限。」
- 單一 RCT:「一項試驗使用此方案並報告……,尚不能視為通用處方。」
- 只支持輔助:「現有證據僅支持作為既有治療的輔助。」
- 教材配穴:「教材列為辨證或經驗配穴,並非現代療效證據。」
- 不支持:「現有證據不足以支持建立常規針灸處方。」

除非指引原文使用同等措辭,禁止寫「已證實可以治療」「標準處方」「首選穴位」,
以及任何「可減少用藥」「可替代心理治療」的說法。

## 最終總表

| condition_id | protocol_status | points_count | 最高來源層級 | 介入方式 | 對照組 | 主要結果量表 | 是否診斷直接證據 | 是否僅支持輔助 | 紅旗已收集 | 結論 |
|---|---:|---:|---|---|---|---|---|---|---|---|

並統計:

```json
{
  "total_conditions": 10,
  "supported": 0,
  "limited": 0,
  "symptom_only": 0,
  "adjunct_only": 0,
  "not_supported": 0,
  "no_source": 0,
  "conditions_with_points": 0,
  "conditions_left_empty": 0,
  "evidence_from_auricular_only": 0,
  "evidence_from_waitlist_controlled_only": 0,
  "conditions_with_suicidality_pathway": 0
}
```

## 成功標準

合格結果很可能是**多數卡留空或只到 `adjunct_only`**。
不要以「每張都要有穴位」作為完成條件。

這一批真正要拿到的是三件事:
**每張的檢索軌跡**(查了哪裡、什麼詞、哪一天)、
**每張的對照組與量表**(效果相對於誰、測的是什麼)、
**每張的自傷風險轉診路徑**。

穴位查不到可以留空;上面三件事缺一件,這張卡就不算完成。
