# SOL 查源任務:B7 內分泌代謝(7)+泌尿(2) 9 張條件卡逐病重建針灸處方

> **格式與 B1–B6 完全相同**,欄位、來源標準、證據措辭一字未改 —— 直接沿用。
> 本批新增 **【補充 E】替代指標不等於臨床結果** 與 **【補充 F】骨質疏鬆:針刺深度優先於配穴**。

## 背景

AcuTing OS 有 67 張條件卡的 `acupoint_protocols` 曾逐字共用同一個匯入預設值
(足三里 ST36／合谷 LI4／三陰交 SP6／中脘 CV12)。該模板已移入 `import_artifacts`,
處方欄刻意留空。本任務不是設計配穴,而是收集可追溯、逐病適用的來源。

- Repo:`github.com/guot-beep/acuting-os`,branch `codex/pattern-v2`
- 資料檔:`data/pathology/condition_canon_shortlist.json`
- 權限:唯讀,把結果作為回覆輸出,不要改 repo

## B7 清單與現況(2026-08-14 實測)

| # | condition_id | 病名 | 既有 scope | 既有紅旗 |
|---|---|---|---|---:|
| 1 | `cond.metabolic_syndrome` | 代謝症候群 | 無 | 4 |
| 2 | `cond.hashimoto` | 橋本氏甲狀腺炎 | 有 | 4 |
| 3 | `cond.obesity` | 肥胖／體重管理 | 無 | 5 |
| 4 | `cond.dyslipidemia` | 血脂異常 | 無 | 4 |
| 5 | `cond.osteoporosis` | 骨質疏鬆症 | 有 | 4 |
| 6 | `cond.hpa_dysregulation` | 下視丘-腦下垂體-腎上腺軸失調 | 無 | 4 |
| 7 | `cond.edema_fluid` | 特發性水腫 | 無 | 5 |
| 8 | `cond.interstitial_cystitis` | 間質性膀胱炎 | 無 | 4 |
| 9 | `cond.urinary_retention` | 非阻塞性尿滯留 | 無 | 5 |

有既有 scope 的 2 張(hashimoto、osteoporosis):你的 `scope_zh` 是提案,不覆蓋。
其餘 7 張沒有 scope —— **你寫的就是第一份內容,不是提案**,請提高謹慎度。

## 負面結果會被完整顯示

`acupoint_protocol_evidence` 會把 `protocol_status` 與 `evidence_note_zh`
**直接印在卡片上**。寫 `not_supported` 不是放棄這張卡。

---

## 【補充 A】介入方式必須分辨

`modality`:`acupuncture | electroacupuncture | auricular | acupressure | laser | moxibustion | transcutaneous(TEAS/PTNS) | mixed | unclear`

**本批特別注意 `PTNS`(經皮脛神經刺激)**:泌尿領域有大量 PTNS 研究,
它使用 SP6／KI3 附近的位置,**但那是神經調節治療,不是針灸**。
把 PTNS 的證據寫成針灸的證據,與乾針、耳穴同一類錯誤。
只查到 PTNS 是合格結論,寫明並計入 `evidence_from_neuromodulation_only`。

## 【補充 B】對照組

`comparator`:`sham | placebo | usual_care | no_treatment | waitlist | active_control(寫出是什麼) | none | unclear`

代謝領域請寫明對照組是否含**生活型態介入**(飲食／運動衛教)——
「針灸 vs 什麼都不做」與「針灸＋生活型態 vs 生活型態」意義完全不同。

## 【補充 C】既有卡片上的「查不到系統性回顧」不可信,請重查

本專案已被推翻兩次(胎位不正 CD003928、不寧腿 PMID 34763496)。
請當成沒有前次結論重新檢索;確實不存在就寫**檢索日期、資料庫與檢索詞**。

## 【補充 D】規格寫錯請直接指出

B3 你指出 SSD 那條寫反了,你是對的,文件已照你的更正改掉。

## 【補充 E】**替代指標不等於臨床結果(本批最容易踩)**

這是 B1「DOR 的 FSH／AMH 不等於活產」規則的代謝版,而且這批幾乎每張都適用。

以下都是**替代指標**,改善**不等於**臨床獲益:

| 卡 | 替代指標 | 真正的臨床結果 |
|---|---|---|
| `metabolic_syndrome` | 腰圍、血壓、空腹血糖 | 心血管事件、糖尿病發生率 |
| `dyslipidemia` | LDL、三酸甘油酯 | 心肌梗塞、中風 |
| `obesity` | 體重、BMI（且需追蹤長度） | 維持減重、共病改善 |
| `hashimoto` | TPO 抗體效價、TSH | 甲狀腺功能、用藥需求 |
| `osteoporosis` | 骨密度(BMD) | **骨折發生率** |
| `hpa_dysregulation` | 皮質醇曲線 | 症狀與功能 |

規則:
- `finding_zh` 必須寫明**測的是替代指標還是臨床結果**、變化多少、追蹤多久。
- **只有替代指標改善時,`protocol_status` 不得寫 `supported`。**
- 減重研究請特別註明**追蹤長度**:短期體重下降不等於維持。

## 【補充 F】`osteoporosis`:針刺深度與骨折風險優先於配穴

Ting 指定這張卡的重點**不是配穴,是安全**。

骨密度低下者的相關風險:
- 胸背部穴位的**氣胸風險**在體型偏瘦／骨質疏鬆者更需注意
- 既有**脊椎壓迫性骨折**時的姿勢與擺位
- 施術中的**跌倒風險**(上下治療床、姿勢性低血壓)
- 拔罐／推拿等合併手法在脆弱骨骼上的壓力

請收集**有來源的**針刺深度與部位安全建議。查不到就留空並寫進 `unresolved`,
**不要憑常識寫深度數字** —— 本專案的規則是沒查證的數字不准上畫面。

---

## 每張回傳 JSON

```json
{
  "condition_id": "cond.example",
  "condition_name_zh": "中文病名",
  "condition_name_en": "English name",
  "protocol_status": "supported | limited | symptom_only | adjunct_only | not_supported | no_source",
  "points": [
    { "code": "SP6", "name_zh": "三陰交", "role_zh": "研究方案固定穴／依症加減穴",
      "reason_zh": "只寫來源明確支持的理由;來源未解釋填 null", "source_ids": ["S1"] }
  ],
  "point_rationale_zh": "整組取穴依據;不得超出來源",
  "point_rationale_en": "English equivalent",
  "treatment_parameters": {
    "manual_or_electroacupuncture": null, "frequency": null,
    "session_duration": null, "treatment_course": null,
    "needling_depth_note": null,
    "source_ids": []
  },
  "scope_zh": "針灸在此疾病中的合理角色(是否僅為輔助)",
  "scope_conflict_note": null,
  "evidence_note_zh": "證據設計、對照組、主要結果是替代指標還是臨床結果、追蹤長度、確定性",
  "condition_specific_cautions_zh": [ { "text": "警語", "source_ids": ["S2"] } ],
  "referral_red_flags_zh": [ { "text": "轉診或急症條件", "source_ids": ["S3"] } ],
  "sources": [
    { "source_id": "S1", "type": "systematic_review | guideline | official_safety_info | rct | textbook | trial_protocol",
      "citation": "完整書目", "url": "可直接開啟的文章頁", "pmid_or_doi": "PMID／DOI 或 null",
      "covers": "精確說明涵蓋哪個疾病、嚴重度、族群",
      "modality": "見補充 A", "comparator": "見補充 B",
      "supports": ["efficacy", "specific_points", "treatment_parameters", "scope", "caution", "referral"],
      "primary_outcome_zh": "主要結果、是替代指標還是臨床結果、追蹤多久",
      "outcome_is_surrogate": true,
      "finding_zh": "來源的實際結論(含效果相對於哪一組)",
      "certainty": "high | moderate | low | very_low | not_graded" }
  ],
  "no_source_found": false,
  "unresolved": []
}
```

`outcome_is_surrogate` 是本批新增必填(見補充 E)。
`needling_depth_note` 主要給 `osteoporosis`,其他填 `null`。

## 空白結果的正確寫法

**`not_supported`(找到來源、結論負面)與 `no_source`(什麼都沒找到)不可混用。**

## 來源標準

依優先序:專業臨床指引／官方 guideline(ADA、AACE、ATA、NICE、AUA、EAU、
Endocrine Society、NAMS 等)→ Cochrane／系統性回顧／meta-analysis →
有 PMID／DOI 的完整 RCT → 已發表試驗 protocol → 正規教材(需完整書目)。

> `official_safety_info` 是 2026-08-15 新增:FDA、NIAAA 這類官方安全資訊頁不是 guideline
> 也不是 review。B4 那次你只能暫時映射成 guideline 並加註 —— 現在有正式位置了。

不接受:診所網站、減重／排毒商業療程頁、部落格、社群貼文、AI 摘要、
無書目的「常用配穴」、搜尋摘要或資料庫首頁、把相近疾病配穴移植。

## B7 專屬規則:疾病不可混用

不得混用:代謝症候群與第二型糖尿病與單純肥胖;
橋本氏甲狀腺炎與 Graves 病與非自體免疫甲狀腺功能低下;
原發性與續發性血脂異常;停經後骨質疏鬆與續發性骨質疏鬆與骨質缺乏(osteopenia);
「腎上腺疲勞」與真正的腎上腺功能不全(見下);
特發性水腫與心因性／腎因性／肝因性水腫與淋巴水腫與 DVT;
間質性膀胱炎／膀胱疼痛症候群與泌尿道感染與膀胱過動症;
非阻塞性尿滯留與阻塞性(攝護腺肥大、結石)尿滯留。

## 各卡必查範圍

- **`metabolic_syndrome`**:見補充 E。主要結果是各成分指標還是心血管事件?
  必收:針灸不得取代降血壓／降血糖／降血脂治療。
- **`hashimoto`**:**必收最高優先**:不得因任何輔助治療而自行停用或減量
  levothyroxine;需定期監測 TSH。
  必收急症:黏液水腫昏迷(嚴重功能低下)與甲狀腺毒症危象的表現;
  以及懷孕期甲狀腺功能控制的特殊要求。
  TPO 抗體效價下降**不等於**疾病緩解(補充 E)。
- **`obesity`**:與 B4 同一個風險 —— 若證據只支持「輔助生活型態介入」,逐字寫出。
  **必收追蹤長度**;短期體重下降不等於維持。
  必收:飲食障礙篩檢(見 B3 `eating_disorder`)、以及不得宣稱可取代
  減重藥物或代謝手術評估。埋線／穴位埋植請單獨標記 modality 與其風險。
- **`dyslipidemia`**:見補充 E,LDL 改善不等於心血管事件減少。
  必收:不得停用 statin;家族性高膽固醇血症需專科評估。
- **`osteoporosis`**:見補充 F,**安全優先於配穴**。
  主要結果請寫明是 BMD 還是骨折率。
  必收紅旗:突發背痛合併身高變矮(疑似脊椎壓迫性骨折)、
  以及不得取代鈣／維生素 D／抗骨鬆藥物。
- **`hpa_dysregulation`**:**這張卡請特別小心**。
  「腎上腺疲勞(adrenal fatigue)」**不是**被主流內分泌學界承認的診斷 ——
  請查證此一現況並在 `scope_zh` 據實反映,不要因為卡片名稱而預設它是疾病。
  **必收**:真正的**腎上腺功能不全是致命急症**(Addison 危象:低血壓、
  低血鈉、休克),其表現與轉診門檻必須收集;
  以及不得建議自行停用類固醇(可致急性腎上腺危象)。
- **`edema_fluid`**:**必收最高優先**:水腫的危險病因 ——
  單側腫脹疼痛(DVT／肺栓塞)、呼吸困難或端坐呼吸(心衰竭)、
  蛋白尿(腎病症候群)、肝硬化。針灸不得用於未鑑別的新發水腫。
  必收:利尿劑相關電解質問題。
- **`interstitial_cystitis`**:必須是 IC/BPS 直接證據,泌尿道感染的證據不可代替。
  必收紅旗:**血尿需排除膀胱癌**、反覆感染、以及疼痛急性惡化。
  主要結果請寫明是疼痛評分、頻尿次數還是生活品質量表。
- **`urinary_retention`**:**急性尿滯留是急症** ——
  必收「何時不得針灸而應導尿」的明確門檻(膀胱脹痛、無法排尿、
  超音波殘尿量、腎後性腎衰竭風險),並附 `source_ids`。
  區分非阻塞性與阻塞性(攝護腺肥大、結石、腫瘤)——
  阻塞性必須先解除阻塞;以及馬尾症候群(合併鞍區麻木、下肢無力)是神經外科急症。
  若證據只支持術後尿滯留,`protocol_status` 用 `postoperative_only`。

## 穴位代碼規則

標準 WHO 經穴代碼,中文名須與代碼相符;奇穴用正式 `EX-` 代碼;
耳穴不得混用體穴代碼;**PTNS 的刺激位置不得寫成經穴代碼**(見補充 A);
穴位埋線請標記為獨立 modality;阿是穴用 `ASHI`;
每個穴至少連到一個明確報告該穴的 `source_id`。

> 本庫督脈用 `GV`(不是 `DU`),任脈用 `CV`(不是 `RN`)。

## 證據措辭

指引推薦→「指引建議可考慮……」;低確定性回顧→「現有研究提示可能改善……,但證據確定性有限。」;
只有替代指標→「研究報告 X 指標改善,尚未顯示臨床結果獲益。」;
僅支持輔助→「現有證據僅支持作為既有治療的輔助。」;
不支持→「現有證據不足以支持建立常規針灸處方。」

禁止寫「已證實可以治療」「標準處方」「首選穴位」,
以及任何「可減藥、可停藥、可取代手術評估」的說法。

## 最終總表

| condition_id | protocol_status | points_count | 最高來源層級 | 介入方式 | 對照組 | 主要結果 | 替代指標? | 追蹤長度 | 紅旗已收集 | 結論 |
|---|---:|---:|---|---|---|---|---|---|---|---|

```json
{ "total_conditions": 9, "supported": 0, "limited": 0, "symptom_only": 0,
  "adjunct_only": 0, "postoperative_only": 0, "not_supported": 0, "no_source": 0,
  "conditions_with_points": 0, "conditions_left_empty": 0,
  "evidence_from_neuromodulation_only": 0,
  "conditions_with_surrogate_only_evidence": 0,
  "osteoporosis_depth_safety_collected": false,
  "conditions_with_emergency_pathway": 0 }
```

## 成功標準

多數卡預期只到 `limited` 或 `adjunct_only`,留空也合格。要拿到的是:
1. 每張的檢索軌跡
2. **替代指標 vs 臨床結果分清楚**(補充 E)
3. `osteoporosis` 的針刺深度／部位安全(補充 F)—— 查不到也要明講
4. 三個急症門檻:腎上腺危象、未鑑別水腫(DVT／心衰)、急性尿滯留
