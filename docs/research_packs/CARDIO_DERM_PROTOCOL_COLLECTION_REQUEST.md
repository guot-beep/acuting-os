# SOL 查源任務:B8 心血管(4)+皮膚(3) 7 張條件卡逐病重建針灸處方

> **格式與 B1–B7 完全相同**,欄位、來源標準、證據措辭一字未改 —— 直接沿用。
>
> **這是最後一批,也是風險最高的一批。**
> Ting 的指示很明確:**scope 與轉診條件的價值高於穴位。**
> 這批如果七張全部只給 scope、零張有處方,那是合格的結果。

## 背景

AcuTing OS 有 67 張條件卡的 `acupoint_protocols` 曾逐字共用同一個匯入預設值
(足三里 ST36／合谷 LI4／三陰交 SP6／中脘 CV12)。該模板已移入 `import_artifacts`,
處方欄刻意留空。本任務不是設計配穴,而是收集可追溯、逐病適用的來源。

- Repo:`github.com/guot-beep/acuting-os`,branch `codex/pattern-v2`
- 資料檔:`data/pathology/condition_canon_shortlist.json`
- 權限:唯讀,把結果作為回覆輸出,不要改 repo

## B8 清單與現況(2026-08-14 實測)

| # | condition_id | 病名 | 既有 scope | 既有紅旗 |
|---|---|---|---|---:|
| 1 | `cond.cad` | 冠狀動脈疾病 | 無 | 5 |
| 2 | `cond.raynaud` | 雷諾現象 | 有 | 5 |
| 3 | `cond.varicose_veins` | 靜脈曲張 | 無 | 5 |
| 4 | `cond.poor_circulation` | 末梢循環不良 | 無 | 5 |
| 5 | `cond.alopecia` | 斑禿 | 無 | 4 |
| 6 | `cond.rosacea` | 酒糟性皮膚炎 | 無 | 4 |
| 7 | `cond.pruritus` | 慢性搔癢 | 無 | 5 |

只有 `raynaud` 有既有 scope(2026-08-12 已確認其 can_treat／precautions 未對調)。
其餘 6 張**沒有 scope,你寫的就是第一份內容,不是提案** —— 請照最高謹慎度處理。

## 負面結果會被完整顯示

`acupoint_protocol_evidence` 會把 `protocol_status` 與 `evidence_note_zh`
**直接印在卡片上**。在這一批,「現有證據不足以支持建立常規針灸處方」
是一句**有臨床價值**的話,比七組配穴有用得多。

---

## 【補充 A】介入方式必須分辨

`modality`:`acupuncture | electroacupuncture | auricular | acupressure | laser | moxibustion | microneedling | mixed | unclear`

**本批特別注意 `microneedling`(微針／滾針)**:落髮與皮膚科文獻有大量微針研究,
那是**皮膚科的機械性介入**,不是針灸。把微針證據寫成針灸證據,
與乾針、耳穴、PTNS 同一類錯誤。只查到微針是合格結論,寫明並計入
`evidence_from_microneedling_only`。

梅花針／七星針屬於中醫器具,但與微針滾輪不同,請分別標記並說明來源怎麼稱呼它。

## 【補充 B】對照組

`comparator`:`sham | placebo | usual_care | no_treatment | waitlist | active_control(寫出是什麼) | none | unclear`

皮膚科請寫明對照組是否為既有標準治療
(外用 minoxidil／類固醇、口服藥、外用 ivermectin／metronidazole、抗組織胺等)。

## 【補充 C】既有卡片上的「查不到系統性回顧」不可信,請重查

本專案已被推翻兩次(胎位不正 CD003928、不寧腿 PMID 34763496)。
請當成沒有前次結論重新檢索;確實不存在就寫**檢索日期、資料庫與檢索詞**。

## 【補充 D】規格寫錯請直接指出

B3 你指出 SSD 那條寫反了,你是對的,文件已照你的更正改掉。

## 【補充 E】**本批核心:患肢／患部局部針刺的禁忌要先收集**

Ting 指定:`varicose_veins`、`poor_circulation`、`raynaud` 這三張,
**局部針刺的禁忌要在處方之前收集**。

請針對每一張收集**有來源的**局部施術界線,至少涵蓋:

1. **急性深部靜脈栓塞(DVT)疑似時** —— 不得在患肢局部施術,且為急症
2. **已有潰瘍、壞疽或感染的皮膚** —— 不得於其上或鄰近施針
3. **缺血肢體**(脈搏微弱、冰冷、蒼白、疼痛)—— 傷口不易癒合、感染風險高
4. **靜脈曲張血管本身** —— 不得直接針刺曲張靜脈
5. **淋巴水腫或曾清除淋巴結的肢體** —— 若找得到來源,一併收集

`raynaud` 另請收集:**缺血或已潰瘍的指端禁止局部針刺**這條規則的來源
(Ting 已指定必須寫進處方層,不能只留在 scope)。

查不到來源就留空並寫進 `unresolved`,**不要憑常識寫**,
但要在總表明講 —— 這一批若連局部禁忌都查不到,那本身就是重要結論。

## 【補充 F】不得暗示可替代或減少既有藥物

`cad` 特別嚴格:**抗血小板與 statin 不可因任何輔助治療而停用**
(這句話已經在該卡的紅旗裡,請不要與之衝突)。

`rosacea`、`alopecia`、`pruritus` 同理:不得暗示可停用外用或口服藥物。

---

## 每張回傳 JSON

```json
{
  "condition_id": "cond.example",
  "condition_name_zh": "中文病名",
  "condition_name_en": "English name",
  "protocol_status": "supported | limited | symptom_only | adjunct_only | not_supported | no_source",
  "points": [
    { "code": "PC6", "name_zh": "內關", "role_zh": "研究方案固定穴／依症加減穴",
      "reason_zh": "只寫來源明確支持的理由;來源未解釋填 null", "source_ids": ["S1"] }
  ],
  "point_rationale_zh": "整組取穴依據;不得超出來源",
  "point_rationale_en": "English equivalent",
  "treatment_parameters": {
    "manual_or_electroacupuncture": null, "frequency": null,
    "session_duration": null, "treatment_course": null, "source_ids": []
  },
  "scope_zh": "針灸在此疾病中的合理角色(是否僅為輔助;若只能給 scope 就只給 scope)",
  "scope_conflict_note": null,
  "evidence_note_zh": "證據設計、對照組、主要結果、確定性、限制;查不到時寫檢索日期／資料庫／檢索詞",
  "condition_specific_cautions_zh": [ { "text": "警語", "source_ids": ["S2"] } ],
  "local_needling_contraindications_zh": [ { "text": "患部局部施術禁忌(見補充 E)", "source_ids": ["S4"] } ],
  "referral_red_flags_zh": [ { "text": "轉診或急症條件", "source_ids": ["S3"] } ],
  "sources": [
    { "source_id": "S1", "type": "systematic_review | guideline | rct | textbook | trial_protocol",
      "citation": "完整書目", "url": "可直接開啟的文章頁", "pmid_or_doi": "PMID／DOI 或 null",
      "covers": "精確說明涵蓋哪個疾病、嚴重度、族群",
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

`local_needling_contraindications_zh` 是本批新增(見補充 E),
心血管三張必填;皮膚三張若來源有提到破損／感染皮膚的界線也請填。

## 空白結果的正確寫法

**`not_supported`(找到來源、結論負面)與 `no_source`(什麼都沒找到)不可混用。**

### 只能給 scope 的正確寫法(本批的預期答案)

```json
{
  "protocol_status": "not_supported",
  "points": [],
  "no_source_found": false,
  "scope_zh": "針灸在此疾病中不作為治療手段;可能的角色僅限於……,且不得延誤急性評估。",
  "evidence_note_zh": "已檢索……,未找到支持建立處方的合格來源;本卡以轉診條件與局部施術禁忌為主。"
}
```

## 來源標準

依優先序:專業臨床指引／官方 guideline(AHA/ACC、ESC、AAD、NICE、
SVS 血管外科學會等)→ Cochrane／系統性回顧／meta-analysis →
有 PMID／DOI 的完整 RCT → 已發表試驗 protocol → 正規教材(需完整書目)。

不接受:診所網站、醫美／生髮商業療程頁、部落格、社群貼文、AI 摘要、
無書目的「常用配穴」、搜尋摘要或資料庫首頁、把相近疾病配穴移植。

## B8 專屬規則:疾病不可混用

不得混用:穩定型心絞痛與急性冠心症候群;
原發性雷諾與續發性雷諾(硬皮症、SLE 等結締組織疾病);
靜脈曲張與慢性靜脈功能不全與 DVT 與靜脈性潰瘍;
周邊動脈疾病(PAD)與周邊神經病變與單純「手腳冰冷」;
斑禿與雄性禿與疤痕性落髮與休止期落髮;
酒糟與尋常性痤瘡與 SLE 蝴蝶斑與脂漏性皮膚炎;
有皮疹的搔癢與**無皮疹的全身性搔癢**(見下)。

## 各卡必查範圍

- **`cad`**:**胸痛的鑑別與轉診門檻優先於任何配穴。這張卡若只能給 scope,那就只給 scope。**
  區分穩定型心絞痛與 ACS;若有證據,請寫明是作為心臟復健的輔助還是治療。
  **必收**:與既有 5 條紅旗一致的急症路徑(不得與之衝突,見補充 F);
  抗血小板／statin 不可停用;以及運動耐受度改變的處置。
  主要結果請寫明是心絞痛發作頻率、運動耐受度還是心血管事件 ——
  前兩者是症狀指標,不等於事件減少。

- **`raynaud`**:區分原發性與續發性(**續發性需結締組織疾病評估**)。
  **必收(Ting 指定)**:**缺血或已潰瘍的指端禁止局部針刺**,寫進
  `local_needling_contraindications_zh` 並附來源。
  必收急症:指端壞疽、持續發白發紫不回復、新發潰瘍。
  必收:保暖與戒菸等基礎處置、以及不得停用鈣離子阻斷劑。

- **`varicose_veins`**:見補充 E。
  **必收**:不得直接針刺曲張靜脈;靜脈性潰瘍與蜂窩性組織炎的處置;
  **DVT 的辨識(單側腫脹、疼痛、發熱)是急症**;
  以及針灸不得取代壓力治療或血管外科評估。
  主要結果請寫明是症狀(腫脹、沉重感)還是靜脈形態改變。

- **`poor_circulation`**:這是**症狀描述不是診斷**,請在 scope 據實反映。
  **必收**:與**周邊動脈疾病(PAD)** 的鑑別 ——
  間歇性跛行、靜止痛、傷口不癒;**急性肢體缺血是外科急症**
  (6P:疼痛、蒼白、無脈、感覺異常、麻痺、冰冷)。
  與周邊神經病變的鑑別(見 B5)。見補充 E。

- **`alopecia`**:必須是斑禿(alopecia areata)直接證據;
  **雄性禿與疤痕性落髮的證據不可代替** ——
  **疤痕性落髮是不可逆的,需儘早皮膚科評估**,請收集其辨識特徵。
  見補充 A:微針證據不得寫成針灸證據。
  必收:合併自體免疫疾病的篩檢、以及頭皮施針的衛生與感染考量。

- **`rosacea`**:必須是酒糟直接證據。
  **必收**:**眼型酒糟(ocular rosacea)** 的眼部症狀需眼科評估;
  與 SLE 蝴蝶斑的鑑別;誘發因子(熱、酒精、日曬)——
  **這一點直接影響能否施灸或使用溫熱療法,請務必查證**。
  必收:不得於發炎或破損皮膚上施針。

- **`pruritus`**:**必收最高優先** ——
  **無皮疹的全身性搔癢需系統性病因評估**:
  膽汁鬱積／肝病、慢性腎病、甲狀腺疾病、缺鐵、
  以及**血液惡性腫瘤(如淋巴瘤)**。請收集這條轉診規則的來源。
  區分急性與慢性(≥6 週)、局部與全身、有無皮疹。
  必收:不得於抓破、感染或苔癬化的皮膚上施針;
  以及不得因輔助治療而停用抗組織胺或外用藥。

## 穴位代碼規則

標準 WHO 經穴代碼,中文名須與代碼相符;奇穴用正式 `EX-` 代碼;
耳穴不得混用體穴代碼;**微針／滾針不得寫成經穴代碼**(見補充 A);
梅花針請標明叩刺部位而非單一穴碼;阿是穴用 `ASHI`;
每個穴至少連到一個明確報告該穴的 `source_id`。

> 本庫督脈用 `GV`(不是 `DU`),任脈用 `CV`(不是 `RN`)。

## 證據措辭

指引推薦→「指引建議可考慮……」;低確定性回顧→「現有研究提示可能改善……,但證據確定性有限。」;
單一 RCT→「一項試驗使用此方案並報告……,尚不能視為通用處方。」;
僅支持輔助→「現有證據僅支持作為既有治療的輔助。」;
不支持→「現有證據不足以支持建立常規針灸處方。」

禁止寫「已證實可以治療」「標準處方」「首選穴位」,
以及任何「可停用抗血小板／statin」「可取代血管外科評估」
「可取代皮膚科治療」的說法。

## 最終總表

| condition_id | protocol_status | points_count | 最高來源層級 | 介入方式 | 對照組 | 主要結果 | 局部禁忌已收集 | 急症門檻已收集 | 結論 |
|---|---:|---:|---|---|---|---|---|---|---|

```json
{ "total_conditions": 7, "supported": 0, "limited": 0, "symptom_only": 0,
  "adjunct_only": 0, "not_supported": 0, "no_source": 0,
  "conditions_with_points": 0, "conditions_left_empty": 0,
  "evidence_from_microneedling_only": 0,
  "conditions_with_local_contraindications": 0,
  "conditions_with_emergency_pathway": 0,
  "scope_only_conditions": 0 }
```

## 成功標準

**七張全部 `not_supported`、全部只給 scope,是完全合格的結果。**
Ting 已經明講這一批 scope 與轉診條件比穴位重要。

要拿到的是四件事:
1. 每張的檢索軌跡(查了哪裡、什麼詞、哪一天)
2. **心血管三張的患肢局部針刺禁忌**(補充 E)—— 查不到也要明講
3. 每張的急症門檻,尤其:ACS、急性肢體缺血、DVT、指端壞疽、
   眼型酒糟、無皮疹全身性搔癢的系統性病因
4. 針灸 vs 微針／梅花針有沒有分開

穴位查不到可以留空;上面四件缺一件,這張卡就不算完成。
