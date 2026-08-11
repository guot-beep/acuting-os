# CARE / STRICTA → AcuTing 欄位對映 v0(P2 readiness 前置)

Status: **v0 DRAFT — CARE 2013 + STRICTA 2010 部分為 Fable 依原始 checklist 對映;
CHM-CARE 專屬項目待 SOL 對原文逐項驗證(CR-013)後才升 v1。**
用途:P2「Case Report Readiness 徽章」的計分底表 —— 每個 case 顯示
`readiness: N/M`,缺什麼列什麼。本表一行 = 一個可判定的資料點。

判定欄:✓ = 現有欄位可直接判定;△ = 部分覆蓋/散文欄位需人判;○ = 無欄位。

## A. CARE 2013(13 items)

| # | CARE item | AcuTing 欄位 | 態 |
|---|---|---|---|
| 1 | Title(註明 case report)| 產生時自動 — 非資料點 | ✓ |
| 2 | Key words | cond.*/tdis.*/pattern.* links(自動彙整)| ✓ |
| 3a | Abstract–introduction | 產生時由 4/5 組稿 | △ |
| 3b | Abstract–case presentation | chiefComplaint + 主要診斷 links | ✓ |
| 3c | Abstract–conclusion | 產生時人寫 | ○ |
| 4 | Introduction(背景+文獻)| 卡片層(cond/tdis 卡的 summary/etiology)| △ |
| 5a | Patient information–demographics | birthYear(Month)/sex/genderIdentity/raceEthnicity/occupation | ✓ |
| 5b | Main symptoms | chiefComplaint + sym.* links(soap.symptoms)| ✓ |
| 5c | Medical/family/psychosocial history | pastHistory/menstrualObHistory/lifestyle/currentMeds | ✓ |
| 5d | Relevant past interventions + outcomes | previousTreatment(+Notes)| ✓ |
| 6 | Clinical findings(理學檢查)| soap.objective(散文)| △ |
| 7 | Timeline(重要事件時間表)| visits(visitDate)+ agentExposures events[] + AE 時間欄 | ✓ |
| 8a | Diagnostic assessment–methods | soap.objective/assessment(散文)| △ |
| 8b | Diagnostic challenges | referralOrSupervisorQuestion/differentialConsidered | △ |
| 8c | Diagnosis(含鑑別)| westernConditions/easternDiseases/tcmPatternSelections + patternDifferentials | ✓ |
| 8d | Prognosis characteristics | ○(無欄位;assessment 散文可含)| ○ |
| 9a | Intervention–types | acupointLinks/formulaLinks/modality.*(AE 列的 modalityId)| ✓ |
| 9b | Intervention–administration(劑量/劑型)| formulaHerbs(散文)+ agentExposures.doseText | △ |
| 9c | Intervention–changes(換方及理由)| exposure events[](applyExposureChange 有 reason)| ✓ |
| 10a | Follow-up–clinician/patient assessed outcomes | outcomeMetrics[](27 metrics 含 PGIC)+ outcomeVerdict | ✓ |
| 10b | Important follow-up diagnostic evaluations | soap.objective(散文)| △ |
| 10c | Intervention adherence & tolerability | adverseEvents[](tolerability ✓)/ adherence ○ | △ |
| 10d | Adverse & unanticipated events | adverseEvents[](severity/onset/resolution)| ✓ |
| 11a | Discussion–strengths & limitations | 產生時人寫 | ○ |
| 11b | Discussion–relevant literature | 卡片層 sources | △ |
| 11c | Rationale for conclusions | reflection(按語)| △ |
| 11d | Main take-away lessons | reflection/ifIneffectivePlan | △ |
| 12 | **Patient perspective** | soap.patientPerspective(2026-08-11 落地)| ✓ |
| 13 | **Informed consent** | case.publicationConsent(+Date)(2026-08-11 落地)| ✓ |

## B. STRICTA 2010(針刺個案必列,6 items/17 subitems 中資料點化的部分)

| # | STRICTA item | AcuTing 欄位 | 態 |
|---|---|---|---|
| 1a | 針刺流派/理據 | 全案固定(TCM)+ assessment | △ |
| 1b | 治療變動理由 | soap.plan/exposure events | △ |
| 2a | 每次進針數 | soap.needleCount(2026-08-11)| ✓ |
| 2b | 穴名(標準名)| acupointLinks(361 正典)| ✓ |
| 2c | 深度 | soap.needleDepthText(2026-08-11)| ✓ |
| 2d | 得氣 | soap.deqiResponse(2026-08-11)| ✓ |
| 2e | 刺激方式(手法/電針)| soap.needleStimulation(2026-08-11)| ✓ |
| 2f | 留針時間 | soap.retentionMinutes(既有)| ✓ |
| 2g | 針具規格 | soap.needleTypeText(2026-08-11)| ✓ |
| 3a | 療程次數/頻率 | visits 序列(可自動計)| ✓ |
| 4a | 合併治療(方藥/supp)| formulaLinks/agentExposures | ✓ |
| 5 | 治療者背景 | ○(單一治療者情境,可全域設定)| ○ |
| 6 | 對照/比較 | 個案報告不適用 | — |

## C. CHM-CARE 專屬項(方藥個案)— 待 CR-013

方藥名稱規範(拼音+拉丁學名)、劑量炮製、煎服法、方劑加減軌跡、品質來源
(GMP/藥材鑑定)等 —— **待 SOL 對 CHM-CARE 原文逐項給 canonical 清單**,
現有 formulaHerbs/formulaLinks/agentExposures 可覆蓋一部分,v1 補判定欄。

## 計分草案(P2 徽章)

- 分母 = A+B 中「態 ≠ —」的行;✓=1、△=0.5(該欄有內容才給)、○=0。
- readiness 顯示 `N/M(✓a △b ○c)`,缺項列名。門檻(可調):≥80% 可
  `Generate CARE Draft`。
- 本表 v0 共 A:31 行 + B:13 行 = 44 個資料點;CHM-CARE 驗證後合併進來
  (SOL 的 61 項權威清單 = 本表的驗證與擴充目標,CR-013)。

## 草稿產生器(v1,2026-08-11)

`scripts/generate-care-draft.js` 依本表 A 節順序(Title→Keywords→Abstract
skeleton→Intro→Patient info→Clinical findings→Timeline→Diagnostic
assessment→Interventions→Follow-up/outcomes→Discussion skeleton→Patient
perspective→Consent)產生 CARE 2013 markdown 草稿,任一診有進針資料時附加
STRICTA 2010 節。缺值一律輸出 `〔缺:<CARE item> — <field>〕`,絕不省略;
`publicationConsent !== "granted"` 一律加 ⚠️ 發表同意警示;patientCode 只留在
可移除的標頭註解,正文稱「本案病人」;birthYear 只出年齡層(如 40-49歲)。
用法:`node scripts/generate-care-draft.js <cases-export.json> --case <caseId>
[--out draft.md] [--lang zh|en|both]`;`--self-test` 對
`data/clinical_cases/sample_export_fixture.json` 跑內建斷言。

## CONTENT_REQUEST

```yaml
CONTENT_REQUEST:
  request_id: CR-013
  entity_id: docs/CARE_READINESS_MAP_v0.md
  type: audit
  priority: P1
  needed_for: P2 Case Report Readiness 徽章計分底表
  missing: [CHM-CARE 原文逐項清單與編號, 對照本表 A/B 逐行核對, 61 項權威清單差異 delta]
  desired_output: MD(v1 對映表 delta,只送差異行)
  target_staging_area: docs/research_packs/
  acceptance: [source-backed(引 CHM-CARE 原文條號), no invented claims]
```
