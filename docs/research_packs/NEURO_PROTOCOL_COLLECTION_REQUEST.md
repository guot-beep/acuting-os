# SOL 查源任務:B5 神經 8 張條件卡逐病重建針灸處方

> **格式與 B1／B2／B3／B4 完全相同**,欄位、來源標準、證據措辭一字未改 —— 直接沿用。
> 本批新增 **【補充 E】感覺缺失時的針刺安全** 與 **【補充 F】症狀改善不等於疾病修飾**。

## 背景

AcuTing OS 有 67 張條件卡的 `acupoint_protocols` 曾逐字共用同一個匯入預設值
(足三里 ST36／合谷 LI4／三陰交 SP6／中脘 CV12)。該模板已移入 `import_artifacts`,
處方欄刻意留空。本任務不是設計配穴,而是收集可追溯、逐病適用的來源。

- Repo:`github.com/guot-beep/acuting-os`,branch `codex/pattern-v2`
- 資料檔:`data/pathology/condition_canon_shortlist.json`
- 權限:唯讀,把結果作為回覆輸出,不要改 repo

## B5 清單

1. `cond.stroke_rehab` — 中風後復健 / Post-stroke rehabilitation
2. `cond.peripheral_neuropathy` — 周邊神經病變 / Peripheral neuropathy
3. `cond.diabetic_neuropathy` — 糖尿病神經病變 / Diabetic peripheral neuropathy
4. `cond.postherpetic_neuralgia` — 帶狀疱疹後神經痛 / Postherpetic neuralgia
5. `cond.parkinsons` — 帕金森氏症 / Parkinson's disease
6. `cond.multiple_sclerosis` — 多發性硬化症 / Multiple sclerosis
7. `cond.essential_tremor` — 原發性顫抖症 / Essential tremor
8. `cond.menieres` — 梅尼爾氏症 / Ménière's disease

**這一批 scope 與轉診條件的價值高於穴位。** 多數是症狀輔助,
唯一有較強實證基礎的是中風後復健。請照這個比重分配力氣。

## 負面結果會被完整顯示

條件卡的 `acupoint_protocol_evidence` 欄位會把你的 `protocol_status` 與
`evidence_note_zh` **直接印在卡片上**。寫 `not_supported` 或 `adjunct_only`
不是放棄這張卡,而是讓卡片說一句誠實的話。

---

## 【補充 A】介入方式必須分辨

`modality`:`acupuncture | electroacupuncture | auricular | acupressure | laser | dry_needling | scalp_acupuncture | mixed | unclear`

**本批特別注意頭皮針(scalp acupuncture)**:中風後復健文獻有相當比例用頭皮針,
那是不同的取穴系統。若證據來自頭皮針,`modality` 填 `scalp_acupuncture`,
不要記成體針,也不要把頭皮針的穴名轉寫成經穴代碼。

## 【補充 B】對照組

`comparator`:`sham | placebo | usual_care | no_treatment | waitlist | active_control(寫出是什麼) | none | unclear`

神經復健領域 `usual_care` 的內容差異極大(有沒有含常規復健治療),
請在 `finding_zh` 寫明對照組實際接受了什麼。

## 【補充 C】既有卡片上的「查不到系統性回顧」不可信,請重查

**本專案已被推翻過兩次**:胎位不正卡寫查不到艾灸轉胎位的系統性回顧,
而 Cochrane CD003928 早就存在;B3 的不寧腿卡寫查不到,而 PMID 34763496 存在。

請把這 8 張當成沒有前次結論重新檢索。若確實不存在,在 `evidence_note_zh`
明列**檢索日期、資料庫與檢索詞**。

## 【補充 D】這 8 張的現況不一樣,請分開對待

前幾批我說過「既有 scope 不要改寫,你的回傳當提案」。**這批有一半沒有既有內容** ——
2026-08-14 實測:

| condition_id | 既有 scope | 既有 red_flags |
|---|---|---:|
| `stroke_rehab` | **無** | **0** |
| `peripheral_neuropathy` | 有 | 4 |
| `diabetic_neuropathy` | **無** | **0** |
| `postherpetic_neuralgia` | **無** | **0** |
| `parkinsons` | 有 | 4 |
| `multiple_sclerosis` | 有 | 5 |
| `essential_tremor` | **無** | **0** |
| `menieres` | 有 | 3 |

**有既有內容的 4 張**(peripheral_neuropathy、parkinsons、multiple_sclerosis、menieres):
你的 `scope_zh` 是提案,不覆蓋,衝突填 `scope_conflict_note`。

**沒有既有內容的 4 張**(stroke_rehab、diabetic_neuropathy、postherpetic_neuralgia、
essential_tremor):**你寫的就是這張卡的第一份內容,不是提案。**
請照這個前提提高謹慎度 —— 尤其 `stroke_rehab` 目前 **0 條紅旗**,
而急性中風是有時間窗的急症。這四張的 `referral_red_flags_zh` 請務必查到來源;
查不到就留空並寫進 `unresolved`,**不要憑常識補**,但要在總表明講這是缺口。

### 衝突回報格式

```json
"scope_conflict_note": {
  "existing_says": "既有卡片的說法(逐字)",
  "source_says": "來源的說法",
  "source_ids": ["S1"]
}
```

由 Ting 裁決,不要自行選一邊。**規格本身寫錯也請直接指出** ——
B3 你指出 SSD 那條寫反了,你是對的,文件已照你的更正改掉。

## 【補充 E】感覺缺失時的針刺安全(本批獨有,優先於療效)

`diabetic_neuropathy`、`peripheral_neuropathy`、部分 `multiple_sclerosis` 與
中風後患側,**病人感覺不到疼痛與溫度**。這使得:

- **艾灸／溫針/紅外線的燙傷風險大幅上升**,而病人不會喊痛
- 針刺造成的微小傷口**不易被察覺**,在糖尿病足更可能演變成潰瘍與感染
- 患者可能無法可靠回報「得氣」或過度刺激

請針對每一張相關卡收集:
1. 感覺缺失部位施灸／溫熱療法的安全界線
2. 糖尿病足的檢查與照護建議(是否應在足部施針、施針前後的檢查)
3. 傷口癒合不良、周邊動脈疾病、免疫抑制的處置

**查不到來源就留空並寫進 `unresolved`,不要憑常識寫。**
但這一項若整批都空,請在總表明講 —— 那是一個需要被看見的缺口。

## 【補充 F】症狀改善不等於疾病修飾

`parkinsons`、`multiple_sclerosis`、`essential_tremor` 是進行性或復發性疾病。
「UPDRS 分數改善」「疲勞量表下降」「顫抖幅度減少」**都不等於**
疾病進程被改變、也不等於可以調整既有藥物。

- `finding_zh` 必須寫明測的是什麼量表、變化多少、追蹤多久
- **不得出現任何可讀成「可減藥、可停藥、可延緩疾病進展」的措辭**
- 若來源只支持症狀輔助,`protocol_status` 用 `symptom_only` 或 `adjunct_only`
- **絕不可暗示可調整左旋多巴、疾病修飾治療(DMT)或抗癲癇藥物**

---

## 每張回傳 JSON

```json
{
  "condition_id": "cond.example",
  "condition_name_zh": "中文病名",
  "condition_name_en": "English name",
  "protocol_status": "supported | limited | symptom_only | adjunct_only | postoperative_only | not_supported | no_source",
  "points": [
    { "code": "LI11", "name_zh": "曲池", "role_zh": "研究方案固定穴／依症加減穴／頭皮針區",
      "reason_zh": "只寫來源明確支持的理由;來源未解釋填 null", "source_ids": ["S1"] }
  ],
  "point_rationale_zh": "整組取穴依據;不得超出來源",
  "point_rationale_en": "English equivalent",
  "treatment_parameters": {
    "manual_or_electroacupuncture": null, "frequency": null,
    "session_duration": null, "treatment_course": null,
    "timing_after_onset": null,
    "source_ids": []
  },
  "scope_zh": "針灸在此疾病中的合理角色(是否僅為症狀輔助)",
  "scope_conflict_note": null,
  "evidence_note_zh": "證據設計、對照組、量表與追蹤、確定性、限制;查不到時寫檢索日期／資料庫／檢索詞",
  "condition_specific_cautions_zh": [ { "text": "警語", "source_ids": ["S2"] } ],
  "referral_red_flags_zh": [ { "text": "轉診或急症條件", "source_ids": ["S3"] } ],
  "sensory_loss_safety_zh": [ { "text": "感覺缺失時的針刺／施灸安全", "source_ids": ["S4"] } ],
  "sources": [
    { "source_id": "S1", "type": "systematic_review | guideline | rct | textbook | trial_protocol",
      "citation": "完整書目", "url": "可直接開啟的文章頁", "pmid_or_doi": "PMID／DOI 或 null",
      "covers": "精確說明涵蓋哪個疾病、病期、嚴重度、患者群",
      "modality": "見補充 A", "comparator": "見補充 B",
      "supports": ["efficacy", "specific_points", "treatment_parameters", "scope", "caution", "referral"],
      "primary_outcome_zh": "主要結果量表、追蹤多久",
      "finding_zh": "來源的實際結論(含效果相對於哪一組)",
      "certainty": "high | moderate | low | very_low | not_graded" }
  ],
  "no_source_found": false,
  "unresolved": []
}
```

`treatment_parameters.timing_after_onset` 是本批新增,主要給 `stroke_rehab` 用
(急性期／亞急性期／慢性期),其他卡沒有就填 `null`。

## 空白結果的正確寫法

與前批相同。特別提醒:**「找到來源、結論是負面」要寫 `not_supported` 且
`no_source_found: false`**;只有什麼都沒找到才寫 `no_source` 且 `true`。

## 來源標準

依優先序:專業臨床指引／官方 guideline(AAN、NICE、AHA/ASA、AAO-HNS 等)→
Cochrane／系統性回顧／meta-analysis → 有 PMID／DOI 的完整 RCT →
已發表試驗 protocol(只能支持該方案)→ 正規教材(需書名、主編、版次、出版社、年份、頁碼)。

不接受:診所網站、行銷頁、部落格、社群貼文、AI 摘要、無書目的「常用配穴」、
搜尋摘要或資料庫首頁、把相近疾病配穴移植。

## B5 專屬規則

### 疾病不可混用

不得混用:急性中風與中風後復健;缺血性與出血性中風的復健證據若來源未分開,請寫明;
糖尿病神經病變與化療引起的周邊神經病變(CIPN)與其他病因的周邊神經病變;
急性帶狀疱疹與帶狀疱疹後神經痛;帕金森氏症與藥物引起的巴金森症候群與其他非典型症候群;
原發性顫抖症與帕金森氏顫抖;梅尼爾氏症與 BPPV 與前庭偏頭痛與前庭神經炎;
多發性硬化症的復發期與緩解期與進展型。

若來源只涵蓋相近疾病,不能建立處方,放入 `unresolved`。

### 不要為了避免重複而換穴

神經領域常共用 GB34、ST36、LI4、LI11、GV20、SP6、KI3。
不同卡出現相同穴位不是錯誤,但每張要有自己疾病的來源。整組相同時附:

```json
"identical_protocol_explanation": {
  "other_condition_id": "cond.example",
  "reason": "兩個獨立疾病來源確實使用相同方案 | 同一來源合併研究兩病 | 無法證明,故本卡不建立處方",
  "source_ids": ["S1", "S2"]
}
```

## 各卡必查範圍

- **`stroke_rehab`**:本批唯一可能有較強證據的一張,請投入最多力氣。
  **必收介入時機**(急性期／亞急性期／慢性期,填 `timing_after_onset`)。
  區分運動功能、吞嚥障礙(dysphagia)、失語症、肩痛／肩關節半脫位、痙攣 ——
  這些是不同的結果指標,證據強度不同,不可混為「中風有效」。
  **必收紅旗**:急性中風是急症(FAST、溶栓與取栓有時間窗),
  針灸不得延誤送醫;以及抗血小板／抗凝血治療下的針刺出血風險。

- **`peripheral_neuropathy`**:這是一個**傘狀名詞**,必須指明病因
  (糖尿病、化療、B12 缺乏、酒精、遺傳、免疫性如 GBS/CIDP、壓迫性)。
  來源未指明病因就不能建立處方。
  **必收**:急性進行性無力或上行性麻痺(GBS)是急症;
  以及可逆病因(B12、甲狀腺、藥物)應先評估。見補充 E。

- **`diabetic_neuropathy`**:見補充 E,**針刺安全優先於療效**。
  區分疼痛性與麻木為主;主要結果是疼痛評分還是神經傳導。
  **必收**:足部檢查、既有足潰瘍或周邊動脈疾病時的處置、
  以及血糖控制仍是主線這條界線。

- **`postherpetic_neuralgia`**:必須是 PHN 直接證據,
  **急性帶狀疱疹的證據不可代替**。
  **必收**:不得在活動性水疱上或其鄰近施針;眼部帶狀疱疹(HZO)是急症;
  免疫抑制者的播散風險;以及早期抗病毒治療的時間窗。

- **`parkinsons`**:見補充 F,症狀輔助為主。
  區分運動症狀與非運動症狀(便祕、睡眠、疼痛、疲勞)——
  非運動症狀的證據可能較多,請分開報告。
  **必收**:跌倒風險、姿勢性低血壓、以及不得調整左旋多巴。

- **`multiple_sclerosis`**:見補充 F。
  **必收(本卡獨有)**:**熱敏感(Uhthoff 現象)** ——
  體溫上升可暫時惡化症狀,這直接影響艾灸／溫針／熱療的使用,請務必查證。
  復發疑似時須神經科評估;不得暗示可替代或減少疾病修飾治療。

- **`essential_tremor`**:必須與帕金森氏顫抖鑑別(靜止性 vs 動作性)。
  主要結果為顫抖評分量表,請寫明。
  **必收**:突發或單側顫抖、合併其他神經症狀應轉診;酒精反應性的鑑別意義。

- **`menieres`**:必須是梅尼爾氏症直接證據,
  BPPV／前庭偏頭痛／前庭神經炎的證據不可代替。
  **必收(最高優先)**:**突發性感音神經性聽力損失是急症**,
  有類固醇治療時間窗,不可當成梅尼爾發作處理而延誤;
  以及單側聽力損失合併耳鳴需排除聽神經瘤。
  另收低鹽飲食／利尿劑等既有處置與針灸的關係。

## 穴位代碼規則

標準 WHO 經穴代碼,中文名須與代碼相符;奇穴用正式 `EX-` 代碼;
**頭皮針分區不得寫成經穴代碼**(保留來源原稱並標記 `nonstandard_code: true`);
耳穴不得混用體穴代碼;阿是穴用 `ASHI`;
每個穴至少連到一個明確報告該穴的 `source_id`。

> 本庫督脈用 `GV`(不是 `DU`),任脈用 `CV`(不是 `RN`)。

## 證據措辭

指引推薦→「指引建議可考慮……」;低確定性回顧→「現有研究提示可能改善……,但證據確定性有限。」;
單一 RCT→「一項試驗使用此方案並報告……,尚不能視為通用處方。」;
僅症狀輔助→「現有證據僅支持作為症狀輔助,未顯示改變疾病進程。」;
教材配穴→「教材列為辨證或經驗配穴,並非現代療效證據。」;
不支持→「現有證據不足以支持建立常規針灸處方。」

禁止寫「已證實可以治療」「標準處方」「首選穴位」,
以及任何「可延緩疾病進展」「可減少用藥」的說法。

## 最終總表

| condition_id | protocol_status | points_count | 最高來源層級 | 介入方式 | 對照組 | 主要結果(含追蹤) | 介入時機 | 是否疾病直接證據 | 感覺缺失安全已收集 | 紅旗已收集 | 結論 |
|---|---:|---:|---|---|---|---|---|---|---|---|---|

```json
{ "total_conditions": 8, "supported": 0, "limited": 0, "symptom_only": 0,
  "adjunct_only": 0, "postoperative_only": 0, "not_supported": 0, "no_source": 0,
  "conditions_with_points": 0, "conditions_left_empty": 0,
  "evidence_from_scalp_acupuncture_only": 0,
  "conditions_with_sensory_loss_safety": 0,
  "conditions_with_emergency_pathway": 0 }
```

## 成功標準

多數卡預期只到 `symptom_only` 或 `adjunct_only`,留空也合格。

這一批要拿到的是四件事:
1. 每張的檢索軌跡(查了哪裡、什麼詞、哪一天)
2. 中風後復健的**介入時機**與**分項結果**(運動／吞嚥／失語／肩痛不可混談)
3. **感覺缺失時的針刺與施灸安全**(補充 E)—— 整批都查不到也要明講
4. 每張的急症門檻,尤其:急性中風送醫、GBS、眼部帶狀疱疹、突發性聽力損失

穴位查不到可以留空;上面四件缺一件,這張卡就不算完成。
