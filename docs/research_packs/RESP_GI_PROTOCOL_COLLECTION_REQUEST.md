# SOL 查源任務:B6 呼吸(5)+腸胃(6) 11 張條件卡逐病重建針灸處方

> **格式與 B1–B5 完全相同**,欄位、來源標準、證據措辭一字未改 —— 直接沿用。
> 本批的核心是 **【補充 E】CINV 與妊娠劇吐是相反的案例**。

## 背景

AcuTing OS 有 67 張條件卡的 `acupoint_protocols` 曾逐字共用同一個匯入預設值
(足三里 ST36／合谷 LI4／三陰交 SP6／中脘 CV12)。該模板已移入 `import_artifacts`,
處方欄刻意留空。本任務不是設計配穴,而是收集可追溯、逐病適用的來源。

- Repo:`github.com/guot-beep/acuting-os`,branch `codex/pattern-v2`
- 資料檔:`data/pathology/condition_canon_shortlist.json`
- 權限:唯讀,把結果作為回覆輸出,不要改 repo

## B6 清單與現況(2026-08-14 實測)

| # | condition_id | 病名 | 既有 scope | 既有紅旗 |
|---|---|---|---|---:|
| 1 | `cond.common_cold` | 感冒／上呼吸道感染 | 無 | 4 |
| 2 | `cond.influenza` | 流行性感冒 | 有 | 4 |
| 3 | `cond.chronic_sinusitis` | 慢性鼻竇炎 | 無 | 4 |
| 4 | `cond.acute_bronchitis` | 急性支氣管炎 | 有 | 5 |
| 5 | `cond.sleep_apnea` | 阻塞性睡眠呼吸中止症 | 有 | 3 |
| 6 | `cond.ibd` | 發炎性腸道疾病 | 有 | 5 |
| 7 | `cond.nafld` | 非酒精性脂肪肝 | 無 | 4 |
| 8 | `cond.gallbladder_dysfunction` | 膽道功能障礙 | 無 | **0** |
| 9 | `cond.cinv` | 化療相關噁心 | 無 | **0** |
| 10 | `cond.post_op_ileus` | 術後腸麻痺 | 無 | **0** |
| 11 | `cond.food_sensitivity` | 食物不耐 | 無 | **0** |

**有既有 scope 的 5 張**:你的 `scope_zh` 是提案,不覆蓋,衝突填 `scope_conflict_note`。
**紅旗 0 條的 4 張**(gallbladder_dysfunction、cinv、post_op_ileus、food_sensitivity):
你寫的就是第一份內容,不是提案 —— 請提高謹慎度,查不到就留空並寫進 `unresolved`,
**不要憑常識補**,但要在總表明講這是缺口。

## 負面結果會被完整顯示

條件卡的 `acupoint_protocol_evidence` 會把 `protocol_status` 與 `evidence_note_zh`
**直接印在卡片上**。寫 `not_supported` 不是放棄這張卡,是讓卡片說一句誠實的話。

---

## 【補充 A】介入方式必須分辨

`modality`:`acupuncture | electroacupuncture | auricular | acupressure | laser | moxibustion | transcutaneous(TEAS/TENS) | mixed | unclear`

**本批特別注意 `acupressure` 與 `transcutaneous`**:止吐領域有大量
**腕帶指壓(Sea-Band 之類)** 與 **經皮穴位電刺激(TEAS)** 研究。
那是不同的介入,不可頂替針刺。只查到指壓／TEAS 是合格結論,
在 `evidence_note_zh` 寫明,並計入 `evidence_from_nonneedle_only`。

## 【補充 B】對照組

`comparator`:`sham | placebo | usual_care | no_treatment | waitlist | active_control(寫出是什麼) | none | unclear`

止吐研究的 `active_control` 請寫出是哪一線止吐藥
(5-HT3 拮抗劑／NK1 拮抗劑／類固醇／metoclopramide),
以及針灸是**加在標準止吐之上**還是**取代它**。這決定結論能不能用。

## 【補充 C】既有卡片上的「查不到系統性回顧」不可信,請重查

本專案已被推翻兩次(胎位不正 CD003928、不寧腿 PMID 34763496)。
請當成沒有前次結論重新檢索;確實不存在就寫**檢索日期、資料庫與檢索詞**。

## 【補充 D】規格寫錯請直接指出

B3 你指出 SSD 那條寫反了,你是對的,文件已照你的更正改掉。
本份若有寫錯的臨床前提,請一樣用 `scope_conflict_note` 或 `unresolved` 指出來。

## 【補充 E】**本批核心:CINV 與妊娠劇吐是相反的案例**

這是本專案付出過代價的教訓,請務必照做。

我們曾有卡片引用 **Cochrane CD007575(孕期噁心嘔吐)** 替**妊娠劇吐**背書,
而該回顧**明確排除**妊娠劇吐 —— 那是張冠李戴。

**CINV(化療相關噁心嘔吐)是相反的情況**:
穴位刺激用於 CINV **有其自己的證據基礎**(例如 P6／PC6 內關的穴位刺激回顧),
與孕期噁心的證據**是兩套**。

因此:

1. **CINV 只能引用 CINV 的來源**,不得引用孕期噁心、術後噁心(PONV)或暈動症的回顧。
2. 反之亦然 —— 不得用 CINV 的證據回頭支持其他噁心情境。
3. 若某來源同時涵蓋多種噁心情境(CINV＋PONV＋孕期),
   請在 `covers` 逐字寫明,並說明 **CINV 的結果能否單獨分離**;不能分離就不建立處方。
4. PC6 在不同噁心情境的 `certainty` 可能不同,請分別報告,不要合併成一句「PC6 有效」。

**這一條做對了,這批就有價值;做錯了,就是重演 CD007575。**

---

## 每張回傳 JSON

```json
{
  "condition_id": "cond.example",
  "condition_name_zh": "中文病名",
  "condition_name_en": "English name",
  "protocol_status": "supported | limited | symptom_only | adjunct_only | postoperative_only | not_supported | no_source",
  "points": [
    { "code": "PC6", "name_zh": "內關", "role_zh": "研究方案固定穴／依症加減穴",
      "reason_zh": "只寫來源明確支持的理由;來源未解釋填 null", "source_ids": ["S1"] }
  ],
  "point_rationale_zh": "整組取穴依據;不得超出來源",
  "point_rationale_en": "English equivalent",
  "treatment_parameters": {
    "manual_or_electroacupuncture": null, "frequency": null,
    "session_duration": null, "treatment_course": null,
    "timing_relative_to_trigger": null,
    "source_ids": []
  },
  "scope_zh": "針灸在此疾病中的合理角色(是否僅為輔助)",
  "scope_conflict_note": null,
  "evidence_note_zh": "證據設計、對照組、主要結果、確定性、限制;查不到時寫檢索日期／資料庫／檢索詞",
  "condition_specific_cautions_zh": [ { "text": "警語", "source_ids": ["S2"] } ],
  "referral_red_flags_zh": [ { "text": "轉診或急症條件", "source_ids": ["S3"] } ],
  "sources": [
    { "source_id": "S1", "type": "systematic_review | guideline | rct | textbook | trial_protocol",
      "citation": "完整書目", "url": "可直接開啟的文章頁", "pmid_or_doi": "PMID／DOI 或 null",
      "covers": "精確說明涵蓋哪個疾病、病期、族群(見補充 E)",
      "modality": "見補充 A", "comparator": "見補充 B",
      "supports": ["efficacy", "specific_points", "treatment_parameters", "scope", "caution", "referral"],
      "primary_outcome_zh": "主要結果、追蹤多久",
      "finding_zh": "來源的實際結論(含效果相對於哪一組)",
      "certainty": "high | moderate | low | very_low | not_graded" }
  ],
  "no_source_found": false,
  "unresolved": []
}
```

`treatment_parameters.timing_relative_to_trigger` 給 CINV(化療前／後第幾天)
與 post_op_ileus(術後第幾小時)用,其他填 `null`。

## 空白結果的正確寫法

**`not_supported`(找到來源、結論負面,`no_source_found: false`)與
`no_source`(什麼都沒找到,`no_source_found: true`)不可混用。**
這兩句在卡片上是完全不同的話。

## 來源標準

依優先序:專業臨床指引／官方 guideline(NICE、ACG、AGA、ASCO、MASCC、AASM 等)→
Cochrane／系統性回顧／meta-analysis → 有 PMID／DOI 的完整 RCT →
已發表試驗 protocol(只能支持該方案)→ 正規教材(需書名、主編、版次、出版社、年份、頁碼)。

不接受:診所網站、行銷頁、部落格、社群貼文、AI 摘要、無書目的「常用配穴」、
搜尋摘要或資料庫首頁、把相近疾病配穴移植。

## B6 專屬規則:疾病不可混用

不得混用:一般感冒與流感;急性支氣管炎與肺炎與慢性咳嗽;急性鼻竇炎與慢性鼻竇炎
(有無鼻息肉也要分);OSA 與中樞型睡眠呼吸中止與單純打鼾;
克隆氏症與潰瘍性結腸炎(若來源合併請說明能否分離)與腸躁症(IBS);
NAFLD／MASLD 與酒精性肝病與肝炎;膽道功能障礙與膽結石與急性膽囊炎;
CINV 與孕期噁心與 PONV 與暈動症(見補充 E);
術後腸麻痺與機械性腸阻塞;食物不耐與 IgE 食物過敏與乳糜瀉。

## 各卡必查範圍

- **`common_cold`**:主要結果是症狀持續天數還是嚴重度?區分預防與治療。
  必收:症狀持續或惡化、呼吸困難、高燒不退的轉診條件。
- **`influenza`**:**抗病毒藥物有時間窗**,針灸不得延誤;
  必收高風險族群(孕婦、幼兒、老年、免疫抑制、慢性病)與肺炎併發症紅旗。
- **`chronic_sinusitis`**:必須是慢性直接證據;
  必收**眼窩與顱內併發症**(眼周紅腫、複視、視力改變、劇烈頭痛、神經症狀)的急症門檻。
- **`acute_bronchitis`**:必收與肺炎的鑑別(高燒、局部囉音、低血氧、呼吸急促)。
- **`sleep_apnea`**:**針灸不得取代 CPAP 或手術評估** ——
  必收轉診門檻與 AHI 的意義,以及**嗜睡對駕駛安全**的警示。
  主要結果請寫明是 AHI、嗜睡量表(ESS)還是自覺睡眠品質,三者不同。
- **`ibd`**:**活動期與緩解期分開**;
  必收使用免疫抑制劑／生物製劑者的**針刺感染風險**;
  以及不得以針灸取代或減少 IBD 藥物;毒性巨結腸、腸阻塞、大量出血是急症。
- **`nafld`**:注意國際命名已改為 MASLD,請寫明來源使用哪個名稱;
  主要結果是肝酵素、影像脂肪量還是纖維化 —— **肝酵素改善不等於纖維化改善**;
  必收進展至肝硬化的評估與轉診。
- **`gallbladder_dysfunction`**(紅旗 0):
  必收**急性膽囊炎與膽絞痛是急症**(右上腹痛合併發燒、黃疸、Murphy 徵象),
  以及膽管炎、胰臟炎的門檻。針灸不得用於處理疑似急性腹症。
- **`cinv`**(紅旗 0):見補充 E,這是本批最重要的一張。
  區分急性期、延遲期與預期性噁心;寫明是加在標準止吐之上還是取代;
  必收:嚴重嘔吐脫水、電解質異常、無法進食的轉診門檻,
  以及**針刺於嗜中性球低下或血小板低下患者的感染／出血風險**(化療族群特別相關)。
- **`post_op_ileus`**(紅旗 0):
  `protocol_status` 可用 `postoperative_only`;
  必收**與機械性腸阻塞的鑑別**(那是外科急症,不可當腸麻痺處理)。
- **`food_sensitivity`**(紅旗 0):
  **必收最高優先**:食物不耐與 **IgE 媒介食物過敏**完全不同 ——
  後者可致過敏性休克,**絕不可因任何輔助治療而停用避食或腎上腺素自動注射器**。
  另收乳糜瀉需在飲食調整**之前**完成診斷的原則。
  針灸在此最多為症狀輔助,不得宣稱可改變食物耐受性或取代過敏檢測。

## 穴位代碼規則

標準 WHO 經穴代碼,中文名須與代碼相符;奇穴用正式 `EX-` 代碼;
耳穴不得混用體穴代碼;腕帶指壓請標 `modality: acupressure` 並說明位置;
阿是穴用 `ASHI`;每個穴至少連到一個明確報告該穴的 `source_id`。

> 本庫督脈用 `GV`(不是 `DU`),任脈用 `CV`(不是 `RN`)。

## 證據措辭

指引推薦→「指引建議可考慮……」;低確定性回顧→「現有研究提示可能改善……,但證據確定性有限。」;
單一 RCT→「一項試驗使用此方案並報告……,尚不能視為通用處方。」;
僅支持輔助→「現有證據僅支持作為既有治療的輔助。」;
不支持→「現有證據不足以支持建立常規針灸處方。」

禁止寫「已證實可以治療」「標準處方」「首選穴位」,
以及任何「可取代 CPAP」「可減少止吐藥」「可停用避食」的說法。

## 最終總表

| condition_id | protocol_status | points_count | 最高來源層級 | 介入方式 | 對照組 | 主要結果 | 是否疾病直接證據 | 紅旗已收集 | 結論 |
|---|---:|---:|---|---|---|---|---|---|---|

```json
{ "total_conditions": 11, "supported": 0, "limited": 0, "symptom_only": 0,
  "adjunct_only": 0, "postoperative_only": 0, "not_supported": 0, "no_source": 0,
  "conditions_with_points": 0, "conditions_left_empty": 0,
  "evidence_from_nonneedle_only": 0,
  "cinv_sources_exclusive_to_cinv": true,
  "conditions_with_emergency_pathway": 0 }
```

`cinv_sources_exclusive_to_cinv` 必須是 `true` —— 這是本批的驗收條件(見補充 E)。

## 成功標準

多數卡預期只到 `limited` 或 `adjunct_only`,留空也合格。要拿到的是:
1. 每張的檢索軌跡
2. **CINV 的來源完全不與其他噁心情境混用**
3. 針刺 vs 指壓／TEAS 有沒有分開
4. 四張紅旗 0 條的卡的急症門檻,尤其膽道急症、機械性腸阻塞、IgE 食物過敏
