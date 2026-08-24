# SOL 查源任務:B1 婦科 9 張條件卡逐病重建針灸處方(canonical 版)

> **這是重做,不是新任務。** 你先前已交付一份 B1 結果,內容已寫入卡片。
> 但那一份早於 canonical schema,缺少逐穴 `source_ids`、每筆來源的
> `modality`／`comparator`／`certainty`／`supports`、`protocol_status`、
> `treatment_parameters`、以及 **`no_source` 的檢索範圍與檢索詞**。
> 本次請照 B2 的同一份 schema 重做,格式與 `B2_MSK_PROTOCOL_COLLECTION_REQUEST_SOL.md` 一致。
>
> **請重新查證,不要只把舊結論套進新格式。** B2 那批的最大價值正是
> 「查不到」也寫出查了哪些資料庫、用什麼檢索詞、哪一天查的 —— B1 目前缺的就是這個。

## 背景

AcuTing OS 有 67 張條件卡的 `acupoint_protocols` 曾逐字共用同一個匯入預設值:

```text
足三里 (ST36) | 合谷 (LI4) | 三陰交 (SP6) | 中脘 (CV12)
```

該模板已移入 `import_artifacts`,處方欄刻意留空。本任務不是設計配穴,
而是收集可追溯、逐病適用的來源。查不到可支持具體穴位的來源時,留空是正確結果。

- Repo:`github.com/guot-beep/acuting-os`,branch `codex/pattern-v2`
- 資料檔:`data/pathology/condition_canon_shortlist.json`
- 權限:唯讀,把結果作為回覆輸出,不要改 repo

## B1 清單與上一輪結論(請重新查證,不要直接沿用)

| # | id | 病名 | ICD | 上一輪 |
|---|---|---|---|---|
| 1 | `cond.menorrhagia` | 月經過多 | N92.0 | 查無合格來源 |
| 2 | `cond.amenorrhea` | 繼發性閉經 | N91.1 | 查無合格來源 |
| 3 | `cond.secondary_dysmenorrhea` | 繼發性痛經 | N94.5 | 只有子宮內膜異位症證據,未外推 |
| 4 | `cond.pmdd` | 經前不悅症 | F32.81 | SP6／LR3／CV4(PMS 頻率) |
| 5 | `cond.menopause_syndrome` | 更年期症候群 | N95.1 | 效果依對照組而異,留空 |
| 6 | `cond.diminished_ovarian_reserve` | 卵巢儲備功能下降 | E28.3 | 只有替代指標,留空 |
| 7 | `cond.pid_chronic` | 慢性骨盆腔炎後遺 | N73.1 | 複合介入,留空 |
| 8 | `cond.vulvovaginal_candidiasis` | 外陰陰道念珠菌感染 | B37.3 | 查無合格來源 |
| 9 | `cond.postpartum_hypolactation` | 產後缺乳 | O92.4 | CV17／SI1／ST18／ST36 |

## 回傳格式

**與 B2 完全相同**,逐卡回傳,不要省略任何 key:

```json
{
  "condition_id": "cond.example",
  "condition_name_zh": "中文病名",
  "condition_name_en": "English name",
  "protocol_status": "supported | limited | symptom_only | postoperative_only | not_supported | no_source",
  "points": [
    { "code": "SP6", "name_zh": "三陰交", "role_zh": "研究方案固定穴／依症加減穴",
      "reason_zh": "只寫來源明確支持的理由;來源未解釋填 null", "source_ids": ["S1"] }
  ],
  "point_rationale_zh": "整組取穴依據;不得超出來源",
  "point_rationale_en": "English equivalent",
  "treatment_parameters": {
    "manual_or_electroacupuncture": null, "frequency": null,
    "session_duration": null, "treatment_course": null, "source_ids": []
  },
  "scope_zh": "針灸在此疾病中的合理角色",
  "scope_conflict_note": null,
  "evidence_note_zh": "證據設計、確定性、限制;查不到時寫檢索日期／資料庫／檢索詞",
  "condition_specific_cautions_zh": [ { "text": "警語", "source_ids": ["S2"] } ],
  "referral_red_flags_zh": [ { "text": "轉診或急症條件", "source_ids": ["S3"] } ],
  "sources": [
    { "source_id": "S1", "type": "systematic_review", "citation": "完整書目",
      "url": "可直接開啟的文章頁", "pmid_or_doi": "PMID／DOI 或 null",
      "covers": "精確說明涵蓋哪個疾病、病期、患者群",
      "modality": "acupuncture | electroacupuncture | acupressure | dry_needling | mixed | unclear",
      "comparator": "sham | placebo | usual_care | no_treatment | active_control | none | unclear",
      "supports": ["efficacy", "specific_points", "treatment_parameters", "scope", "caution", "referral"],
      "finding_zh": "來源的實際結論", "certainty": "high | moderate | low | very_low | not_graded" }
  ],
  "no_source_found": false,
  "unresolved": []
}
```

**`no_source` 的寫法**(這是本次重做的重點):

```json
"evidence_note_zh": "2026-08-14 檢索 PubMed、Cochrane Library、Embase;檢索詞:'acupuncture menorrhagia randomized trial acupoints'、'acupuncture heavy menstrual bleeding systematic review'。結果多為原發性痛經或異常子宮出血中藥研究,未找到直接涵蓋 N92.0 且列出穴位的合格來源。"
```

## 來源標準

接受(依優先序):臨床指引／官方 guideline → Cochrane／系統性回顧／meta-analysis →
有 PMID／DOI 的完整 RCT → 已發表試驗 protocol(只能支持該方案)→
正規教材(需書名、主編、版次、出版社、年份、頁碼)。

不接受:診所網站、行銷頁、部落格、社群貼文、AI 摘要、無書目的「常用配穴」、
搜尋摘要或資料庫首頁、把相近疾病配穴移植、來源只寫 acupuncture 卻自行補穴。

## B1 專屬規則

### 1. 針壓(acupressure)與針灸要分開

婦科文獻有大量 **acupressure／耳穴貼壓** 研究,尤其痛經與更年期。
那是不同介入,`modality` 要填 `acupressure`,並在 `evidence_note_zh` 寫明
「此為指壓／貼壓證據,不是針刺證據」。
這與 B2 的乾針規則同一個道理:**介入不同,證據不可互相頂替**。

### 2. 疾病與情境不可混用

不得混用:原發性痛經與繼發性痛經;子宮內膜異位症相關痛經與腺肌症／肌瘤;
PMS 與 DSM 定義的 PMDD;PCOS 相關月經稀發與病因多樣的繼發性閉經;
DOR 的替代指標(FSH／AMH／AFC)與懷孕或活產結果;
急性 PID 與慢性骨盆腔炎後遺;產後缺乳與乳腺炎／乳房膿瘍。

若來源只涵蓋相近疾病,不能建立處方,放入 `unresolved`。

### 3. 懷孕可能性

`pmdd`、`secondary_dysmenorrhea`、`diminished_ovarian_reserve` 的病人可能正在備孕或已受孕。
若處方含 **LI4 合谷／SP6 三陰交**,`condition_specific_cautions_zh` 必須有一條
明寫操作條件(例如每週期確認懷孕可能),並附 `source_ids`。
`postpartum_hypolactation` 是產後,不受此限,但請在 scope 說明。

### 4. 替代指標不等於臨床結果

DOR 特別容易踩:FSH、AMH、AFC 改善**不等於**懷孕率或活產率改善。
若來源只報替代指標,`finding_zh` 要寫清楚,`protocol_status` 不得寫 `supported`。

### 5. 不要為了避免重複而換穴

婦科研究常共用 SP6、CV4、ST36。不同卡出現相同穴位不是錯誤,
但每張都要有自己疾病的來源。若兩張整組相同,附:

```json
"identical_protocol_explanation": {
  "other_condition_id": "cond.example",
  "reason": "兩個獨立疾病來源確實使用相同方案 | 同一來源合併研究兩病 | 無法證明,故本卡不建立處方",
  "source_ids": ["S1", "S2"]
}
```

### 6. 既有 scope 不要改寫

這 9 張都已有 `acupuncture_scope_zh`(can_treat／precautions／co_management)與紅旗。
你的 `scope_zh` 會被當成提案,不會直接覆蓋。有實質衝突請填 `scope_conflict_note`
(格式同 B2 的髖 OA 案例),由 Ting 裁決。

## 各卡必查範圍

- `menorrhagia`:區分月經過多、異常子宮出血與經期延長;收集嚴重貧血、凝血異常、結構性病因(肌瘤／息肉／內膜病變)的轉診條件。
- `amenorrhea`:區分下視丘性、PCOS、高泌乳素、卵巢功能不全與解剖性;先驗孕;PCOS 月經頻率研究不可代表全部繼發性閉經。
- `secondary_dysmenorrhea`:必須指明病因(內異症／腺肌症／肌瘤／IUD／PID);原發性痛經證據不可代替。
- `pmdd`:區分 PMS 與 DSM PMDD;收集自傷／自殺意念的精神科急症流程。
- `menopause_syndrome`:**對照組是關鍵**(相對 sham vs 相對無治療);收集停經後異常出血的轉診門檻。
- `diminished_ovarian_reserve`:見規則 4;收集不得把有限卵巢儲備描述為可逆。
- `pid_chronic`:急性 PID 屬急症(發熱、宮頸舉痛、疑似膿瘍),針灸不可替代抗生素;收集轉診門檻。
- `vulvovaginal_candidiasis`:以檢驗與抗黴菌治療為主;反覆發作要查糖尿病／免疫抑制／非念珠菌病因。
- `postpartum_hypolactation`:排除乳腺炎與膿瘍;收集嬰兒體重、脫水、含乳姿勢等先評估項目。

## 穴位代碼規則

標準 WHO 經穴代碼,中文名須與代碼相符;奇穴用正式 `EX-` 代碼;
耳穴不得混用體穴代碼;阿是穴用 `ASHI` 並說明定位方式;
每個穴至少連到一個明確報告該穴的 `source_id`。

> 本庫督脈用 `GV`(不是 `DU`),任脈用 `CV`(不是 `RN`)。用其他慣例我會正規化,但直接寫對比較好。

## 證據措辭

指引推薦→「指引建議可考慮……」;低確定性回顧→「現有研究提示可能改善……,但證據確定性有限。」;
單一 RCT→「一項試驗使用此方案並報告……,尚不能視為通用處方。」;
教材配穴→「教材列為辨證或經驗配穴,並非現代療效證據。」;
不支持→「現有證據不足以支持建立常規針灸處方。」

除非指引原文使用同等措辭,禁止寫「已證實可以治療」「標準處方」「首選穴位」。

## 最終總表

| condition_id | protocol_status | points_count | 最高來源層級 | modality | comparator | 是否疾病直接證據 | 紅旗已收集 | 結論 |
|---|---:|---:|---|---|---|---|---|---|

```json
{ "total_conditions": 9, "supported": 0, "limited": 0, "symptom_only": 0,
  "postoperative_only": 0, "not_supported": 0, "no_source": 0,
  "conditions_with_points": 0, "conditions_left_empty": 0,
  "evidence_from_acupressure_only": 0 }
```

## 成功標準

9 張裡只有 2 張有可追溯方案、7 張留空,是合格結果 —— 上一輪就是這個分布。
本次要補的不是「更多處方」,而是**每一張的查證軌跡**:查了哪裡、用什麼詞、
哪一天、對照組是什麼、介入是針刺還是指壓。
