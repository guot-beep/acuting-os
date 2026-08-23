# SOL 查源任務:B4 行為改變 2 張條件卡逐病重建針灸處方

> **格式與 B1／B2／B3 完全相同**,欄位、來源標準、證據措辭一字未改 —— 直接沿用。
>
> **這一批只有 2 張,而且是刻意單獨發的。**
> 把它們與 B3 分開,是為了不讓「整批都要有處方」的氣氛逼出一份湊出來的配穴。
> **回傳「證據不支持」是正確答案,不是交白卷。**

## 背景

AcuTing OS 有 67 張條件卡的 `acupoint_protocols` 曾逐字共用同一個匯入預設值
(足三里 ST36／合谷 LI4／三陰交 SP6／中脘 CV12)。該模板已移入 `import_artifacts`,
處方欄刻意留空。本任務不是設計配穴,而是收集可追溯、逐病適用的來源。

- Repo:`github.com/guot-beep/acuting-os`,branch `codex/pattern-v2`
- 資料檔:`data/pathology/condition_canon_shortlist.json`
- 權限:唯讀,把結果作為回覆輸出,不要改 repo

## B4 清單

1. `cond.smoking_cessation` — 戒菸輔助 / Smoking cessation
2. `cond.alcohol_use` — 飲酒問題輔助 / Alcohol use disorder

## 先講清楚:負面結果會被完整顯示,不會被丟掉

2026-08-14 起,條件卡新增 `acupoint_protocol_evidence` 欄位,
你回傳的 `protocol_status` 與 `evidence_note_zh` **會直接印在卡片上**。
也就是說:

- 「現有證據不支持建立常規針灸處方」會**原樣顯示給使用者看**
- 「已檢索 X、Y 資料庫,檢索詞 A、B,未找到」也會顯示

所以寫 `not_supported` 不是把這張卡放棄掉,而是**讓卡片說一句誠實的話**。
這比湊一組穴位有用得多。B3 那批 10 張裡有 2 張是 `not_supported`,照樣落庫、照樣上畫面。

---

## 【補充 A】介入方式必須分辨 —— 這一批的頭號陷阱是耳穴

**成癮領域的針灸文獻,絕大部分是耳穴,不是體針。**
最常見的是 **NADA 五點方案**(Shen Men、Sympathetic、Kidney、Liver、Lung),
它本來就是為成癮設計的 protocol,在許多轄區由非針灸師依標準流程施作。

**把耳穴／NADA 的證據寫成體針的證據,就是張冠李戴。**

- `modality` 合法值:`acupuncture | electroacupuncture | auricular | acupressure | laser | dry_needling | mixed | unclear`
- 耳穴**不得用體穴代碼**表示;保留來源原稱並標記 `nonstandard_code: true`
- 若只找得到耳穴證據,這本身就是合格結論:`protocol_status` 用 `limited` 或 `not_supported`,
  並在 `evidence_note_zh` 寫明「現有證據來自耳穴／NADA 方案,非體針」
- 統計時計入 `evidence_from_auricular_only`

## 【補充 B】對照組

`comparator` 合法值:`sham | placebo | usual_care | no_treatment | waitlist | active_control(寫出是什麼) | none | unclear`

成癮研究的 `active_control` 特別重要:對照組是**尼古丁替代療法／varenicline／
bupropion／brief counselling** 之中的哪一個,結論意義完全不同。請寫出來。

## 【補充 C】**這一批最重要的一條:戒菸率不是渴求分數**

這是 B3「量表分數不等於臨床緩解」在成癮領域的版本,而且更嚴格。

**本專案的落庫門檻**(這是我們自己訂的,比文獻慣例嚴):

> **生化驗證(呼氣 CO 或唾液 cotinine)的持續戒菸率,追蹤至少 6 個月。**

> #### 2026-08-15 更正(SOL 於 B4 交付中指出,他是對的)
>
> 本節原本的寫法會讓人以為**Cochrane 的 long-term outcome 就等於上面那條**。
> **不是。** Cochrane CD000009 的實際規則是:取各試驗 **6 個月至 1 年的最後一次測量**、
> 採**該試驗最嚴格的戒菸定義**,並在**有提供時優先採用**生化驗證 ——
> 不是所有納入試驗都做了生化驗證的持續戒菸。
>
> 所以:**落庫門檻照上面那條走**(這仍是我們的要求),
> 但**描述 Cochrane 的結果時必須照它自己的定義寫**,
> 不可把它整體說成「所有試驗均為生化驗證之持續戒菸」。
> 這兩件事分開講。

以下都**不能**當成戒菸有效的證據:
- 渴求(craving)量表下降
- 戒斷症狀分數下降
- 每日吸菸支數減少
- 自陳戒菸而無生化驗證
- 追蹤短於 6 個月

飲酒同理:飲酒量減少、渴求下降、AUDIT 分數變化,
都不等於**戒酒維持率**或**重度飲酒日(heavy drinking days)減少**。

請在每一筆 `sources` 填 `primary_outcome_zh`,寫明:
**測的是什麼、有沒有生化驗證、追蹤多久。**
若主要結果只是渴求或短期戒斷,`protocol_status` **不得**寫 `supported`。

## 【補充 D】這 2 張目前沒有 scope,你寫的就是第一份內容

2026-08-14 實測:兩張都**沒有** `acupuncture_scope_zh`;
`smoking_cessation` 有 4 條紅旗、`alcohol_use` 有 5 條。

也就是說 scope 這一塊**不是提案,是這張卡的第一份內容** —— 請照這個前提提高謹慎度。
既有紅旗仍然不覆蓋,有衝突就回報。

### 衝突回報格式

```json
"scope_conflict_note": {
  "existing_says": "既有卡片的說法(逐字)",
  "source_says": "來源的說法",
  "source_ids": ["S1"]
}
```

由 Ting 裁決,不要自行選一邊。

## 【補充 E】規格寫錯請直接指出

B3 那批你指出我把 SSD 寫成「前提是器質病因已被排除」,DSM-5-TR 不是那個邏輯 ——
**你是對的,請求文件已經照你的更正改掉了。**
本份如果也有寫錯的臨床前提,請一樣用 `scope_conflict_note` 或 `unresolved` 指出來,
不要為了配合我的措辭而扭曲來源。

---

## 每張回傳 JSON

```json
{
  "condition_id": "cond.example",
  "condition_name_zh": "中文病名",
  "condition_name_en": "English name",
  "protocol_status": "supported | limited | symptom_only | adjunct_only | not_supported | no_source",
  "points": [
    { "code": "LI4", "name_zh": "合谷", "role_zh": "研究方案固定穴／依症加減穴／耳穴",
      "reason_zh": "只寫來源明確支持的理由;來源未解釋填 null", "source_ids": ["S1"] }
  ],
  "point_rationale_zh": "整組取穴依據;不得超出來源",
  "point_rationale_en": "English equivalent",
  "treatment_parameters": {
    "manual_or_electroacupuncture": null, "frequency": null,
    "session_duration": null, "treatment_course": null, "source_ids": []
  },
  "scope_zh": "針灸在此情境中的合理角色(是否僅為 adjunct)",
  "scope_conflict_note": null,
  "evidence_note_zh": "證據設計、對照組、主要結果與追蹤長度、確定性;查不到時寫檢索日期／資料庫／檢索詞",
  "condition_specific_cautions_zh": [ { "text": "警語", "source_ids": ["S2"] } ],
  "referral_red_flags_zh": [ { "text": "轉診或急症條件", "source_ids": ["S3"] } ],
  "sources": [
    { "source_id": "S1", "type": "systematic_review | guideline | official_safety_info | rct | textbook | trial_protocol",
      "citation": "完整書目", "url": "可直接開啟的文章頁", "pmid_or_doi": "PMID／DOI 或 null",
      "covers": "精確說明涵蓋哪個族群、成癮程度、共病",
      "modality": "見補充 A", "comparator": "見補充 B",
      "supports": ["efficacy", "specific_points", "treatment_parameters", "scope", "caution", "referral"],
      "primary_outcome_zh": "主要結果、有無生化驗證、追蹤多久",
      "finding_zh": "來源的實際結論(含效果相對於哪一組)",
      "certainty": "high | moderate | low | very_low | not_graded" }
  ],
  "no_source_found": false,
  "unresolved": []
}
```

## 空白結果的正確寫法

### 現有證據不支持(本批的預期答案)

```json
{
  "protocol_status": "not_supported",
  "points": [],
  "no_source_found": false,
  "evidence_note_zh": "現有 Cochrane 回顧／指引不支持將針灸作為常規戒菸輔助。回顧納入 N 項試驗、M 名受試者;長期結果取各試驗 6 個月至 1 年的最後一次測量、採該試驗最嚴格之戒菸定義並於有提供時優先採用生化驗證,相對 sham 未見具臨床意義之差異;證據確定性 low。"
}
```

**注意上面那個寫法**:`no_source_found` 是 `false`,因為**有找到來源,結論是不支持**。
「找到了、結論是負面」與「什麼都沒找到」是兩件事,不可混用。

### 完全查不到合格來源

```json
{
  "protocol_status": "no_source",
  "points": [],
  "no_source_found": true,
  "evidence_note_zh": "2026-08-XX 檢索 PubMed、Cochrane Library、Embase;檢索詞:……。未找到符合本任務來源標準的資料。"
}
```

## 來源標準

依優先序接受:專業臨床指引／官方 guideline(USPSTF、NICE、SAMHSA 等)→
Cochrane review／系統性回顧／meta-analysis → 有 PMID／DOI 的完整 RCT →
已發表試驗 protocol(只能支持該方案)→ 正規教材(需書名、主編、版次、出版社、年份、頁碼)。

> `official_safety_info` 是 2026-08-15 新增:FDA、NIAAA 這類官方安全資訊頁不是 guideline
> 也不是 review。B4 那次你只能暫時映射成 guideline 並加註 —— 現在有正式位置了。

不接受:診所網站、戒菸／戒酒商業療程頁、部落格、社群貼文、AI 摘要、
無書目的「常用配穴」、搜尋摘要或資料庫首頁、把相近情境配穴移植。

## 各卡必查範圍

### `smoking_cessation`

- **必須以生化驗證的 6 個月持續戒菸率為主要結果**(見補充 C)。
- 區分:針灸單獨使用 vs 作為既有戒菸治療的輔助;體針 vs 耳穴／NADA;
  電針 vs 手針;以及**耳穴貼壓(非侵入)** 與耳針(侵入)的差別。
- **必收**:針灸不得取代已證實有效的戒菸治療(藥物與行為介入)這條界線的來源。
- **必收(診間會用到)**:戒菸本身會改變某些藥物的代謝
  (菸草中的多環芳香烴誘導 CYP1A2,戒菸後相關藥物血中濃度可能上升)。
  若找得到來源,放進 `condition_specific_cautions_zh`;找不到就留空並寫進 `unresolved`,
  **不要憑記憶寫**。
- 紅旗:合併使用戒菸藥物者的精神症狀變化、孕婦戒菸的處置歸屬。

### `alcohol_use`

- **這張卡的安全性優先於療效。**
- **必收(最高優先)**:**酒精戒斷是醫療急症** ——
  震顫譫妄(DT)、戒斷性癲癇、Wernicke 腦病變。
  針灸**不得**取代有醫療監督的戒斷處置。
  請收集明確的轉診／急症門檻(例如 CIWA-Ar 評分、既往戒斷癲癇史、
  自主神經不穩定、意識混亂),並附 `source_ids`。
- 區分:危險性飲酒(hazardous drinking)、酒精使用疾患(AUD)、
  急性戒斷、戒斷後維持期 —— 這四種情境的證據不可互相頂替。
- 主要結果請用**戒酒維持率或重度飲酒日減少**,不是渴求分數(見補充 C)。
- 必收:肝病、上消化道出血、營養不良(thiamine)、跌倒與外傷的相關界線。
- 若證據只支持「輔助既有戒酒治療」,逐字寫出 adjunct。

## 穴位代碼規則

標準 WHO 經穴代碼,中文名須與代碼相符;奇穴用正式 `EX-` 代碼;
**耳穴不得混用體穴代碼**;阿是穴用 `ASHI`;
每個穴至少連到一個明確報告該穴的 `source_id`。

> 本庫督脈用 `GV`(不是 `DU`),任脈用 `CV`(不是 `RN`)。

## 證據措辭

指引推薦→「指引建議可考慮……」;低確定性回顧→「現有研究提示可能改善……,但證據確定性有限。」;
單一 RCT→「一項試驗使用此方案並報告……,尚不能視為通用處方。」;
只支持輔助→「現有證據僅支持作為既有治療的輔助。」;
不支持→「現有證據不足以支持建立常規針灸處方。」

禁止寫「已證實可以戒菸／戒酒」「標準處方」「首選穴位」,
以及任何「可取代戒菸藥物」「可取代戒酒治療」的說法。

## 最終總表

| condition_id | protocol_status | points_count | 最高來源層級 | 介入方式 | 對照組 | 主要結果(含追蹤長度) | 是否生化驗證 | 紅旗已收集 | 結論 |
|---|---:|---:|---|---|---|---|---|---|---|

```json
{ "total_conditions": 2, "supported": 0, "limited": 0, "symptom_only": 0,
  "adjunct_only": 0, "not_supported": 0, "no_source": 0,
  "conditions_with_points": 0, "conditions_left_empty": 0,
  "evidence_from_auricular_only": 0,
  "conditions_with_biochemically_verified_outcome": 0,
  "alcohol_withdrawal_emergency_pathway_collected": 0 }
```

## 成功標準

**兩張都 `not_supported`、兩張都留空,是完全合格的結果。**

這一批要拿到的是:
1. 每張的檢索軌跡(查了哪裡、什麼詞、哪一天)
2. 每張的主要結果與追蹤長度(有沒有生化驗證)
3. 體針與耳穴／NADA 有沒有被分開
4. 酒精戒斷的急症轉診門檻

穴位查不到可以留空;上面四件缺一件,這張卡就不算完成。
