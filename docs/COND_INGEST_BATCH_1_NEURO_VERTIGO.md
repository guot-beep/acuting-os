# Batch 1 — 神經/頭痛眩暈:red flags 來源 + ICD-10-CM 驗證

規則正本:`docs/COND_INGESTION_SPEC.md`(先讀完再動工)。
輸出:`data/imports/official/cond_batch1_neuro_vertigo.json`

為什麼這批最優先:頭痛/眩暈/麻木是**病人最常當成小毛病拿來針灸**的主訴,
背後可能是中風、SAH、腫瘤 —— red flag 缺口的代價最高(PLAN_TO_2026-09-05 §3c)。

## 工作定義

- **A. red flags 來源抽取**(11 筆,flags:N 者):在白名單來源找該病的
  「何時急診/何時就醫」段落,交 URL + verbatim 摘錄 + 建議分級。
  每筆至少 1 個來源,眩暈/中風類至少 2 個。
- **B. ICD-10-CM FY2026 驗證**(全部 12 筆):現有碼是否存在、官方描述、
  billable 與否、是否需要更細碼。

## 逐筆清單

| condition_id | 中文 | English | 現有碼 | flags | 建議來源機構(A 任務) |
|---|---|---|---|---|---|
| cond.bells_palsy | 顏面神經麻痺 | Bell's Palsy | G51.0 | N | NINDS(注意:與中風的鑑別即是 red flag 核心) |
| cond.stroke_rehab | 中風後復健 | Post-Stroke Rehabilitation | I69 | N | NINDS / CDC stroke(復發警訊 FAST) |
| cond.peripheral_neuropathy | 周邊神經病變 | Peripheral Neuropathy | G62.9 | N | NINDS |
| cond.diabetic_neuropathy | 糖尿病周邊神經病變 | Diabetic Peripheral Neuropathy | E11.42 | N | NIDDK(足部潰瘍/感染警訊) |
| cond.trigeminal_neuralgia | 三叉神經痛 | Trigeminal Neuralgia | G50.0 | Y(僅做 B) | — |
| cond.postherpetic_neuralgia | 帶狀皰疹後神經痛 | Postherpetic Neuralgia | B02.29 | N | CDC shingles(眼部侵犯警訊) |
| cond.parkinsons | 帕金森氏症(輔助情境) | Parkinson's Disease | G20 | N | NINDS(跌倒/吞嚥警訊) |
| cond.multiple_sclerosis | 多發性硬化症(輔助情境) | Multiple Sclerosis | G35 | N | NINDS |
| cond.essential_tremor | 原發性顫抖症 | Essential Tremor | G25.0 | N | NINDS(與 Parkinson 鑑別) |
| cond.dizziness_vertigo | 頭暈/眩暈 | Dizziness / Vertigo | R42 | N | MedlinePlus + NINDS(中樞性眩暈警訊,**至少 2 來源**) |
| cond.menieres | 梅尼爾氏症 | Ménière's Disease | H81.0 | N | NIDCD |
| cond.migraine_vestibular | 前庭性偏頭痛 | Vestibular Migraine | G43.82 | N | MedlinePlus(雷擊性頭痛/神經學症狀警訊) |

## 注意

- `H81.0`、`G43.82` 這類可能需要更細碼(laterality / with(out) status
  migrainosus)—— B 任務把官方細碼列進 `specificity_note`,不要自己選。
- 眩暈的 red flag 是這批的靈魂:中樞性 vs 周邊性的辨別線索
  (HINTS 相關描述若出現在官方頁,原文摘錄)。
