# Batch 3 — 腸胃:red flags 來源 + ICD-10-CM 驗證

規則正本:`docs/COND_INGESTION_SPEC.md`。
輸出:`data/imports/official/cond_batch3_gi.json`

腹痛背後是闌尾炎、腸阻塞、消化道出血 —— gi 是 red flag 缺口第三優先
(PLAN §3c),而且 14/15 筆全缺。

## 工作定義

- **A. red flags 來源**(14 筆 flags:N):警訊段落 + URL + verbatim。
  消化道出血警訊(黑便/吐血/貧血/體重減輕)會橫跨多病,**每筆各自引來源**,
  不要一份來源套全部。
- **B. ICD-10-CM FY2026 驗證**(全 15 筆)。`K50-K51` 是範圍不是碼、
  `T45.1/R11` 是兩個碼 —— 這兩筆要拆成官方可用的單碼組。

## 逐筆清單

| condition_id | 中文 | English | 現有碼 | flags | 建議來源機構 |
|---|---|---|---|---|---|
| cond.gerd | 胃食道逆流 | GERD | K21 | N | NIDDK(吞嚥困難/出血警訊) |
| cond.functional_dyspepsia | 功能性消化不良 | Functional Dyspepsia | K30 | Y(僅 B) | — |
| cond.chronic_gastritis | 慢性胃炎 | Chronic Gastritis | K29.5 | N | NIDDK |
| cond.peptic_ulcer | 消化性潰瘍 | Peptic Ulcer Disease | K27 | N | NIDDK(出血/穿孔警訊) |
| cond.ibs | 腸躁症 | IBS | K58 | N | NIDDK(alarm features) |
| cond.ibd | 發炎性腸道疾病 | IBD | K50-K51 | N | NIDDK(拆碼:Crohn K50.x / UC K51.x) |
| cond.chronic_constipation | 慢性便秘 | Chronic Constipation | K59.0 | N | NIDDK |
| cond.chronic_diarrhea | 慢性腹瀉 | Chronic Diarrhea | K59.1 | N | NIDDK(脫水/血便警訊) |
| cond.nausea_vomiting | 噁心嘔吐 | Nausea and Vomiting | R11 | N | MedlinePlus |
| cond.hemorrhoids | 痔瘡 | Hemorrhoids | K64 | N | NIDDK(出血鑑別警訊) |
| cond.nafld | 非酒精性脂肪肝 | NAFLD | K76.0 | N | NIDDK |
| cond.gallbladder_dysfunction | 膽道功能障礙 | Biliary Dyskinesia | K82.8 | N | NIDDK(膽絞痛/黃疸警訊) |
| cond.cinv | 化療相關噁心 | CINV | T45.1/R11 | N | NCI/MedlinePlus(拆碼 + 發燒性中性球低下警訊) |
| cond.post_op_ileus | 術後腸麻痺 | Postoperative Ileus | K91.89 | N | MedlinePlus |
| cond.food_sensitivity | 食物不耐 | Food Intolerance | K90.4 | N | NIDDK(celiac 鑑別)+ FDA(過敏 vs 不耐) |
