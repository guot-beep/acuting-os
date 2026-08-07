# Batch 2 — 肌骨疼痛:ICD-10-CM 細碼/laterality + 2 筆 red flags

規則正本:`docs/COND_INGESTION_SPEC.md`。
輸出:`data/imports/official/cond_batch2_pain_msk.json`

這批 30 筆 red flags 已補 28/30 —— **主要工作不是安全層,是編碼層**。
pain_msk 是診所主戰場,也是最先要開保險文件的類別;ICD-10-CM 在肌骨碼
大量要求 laterality(左/右/未指明)與 encounter 型態,現有碼多半停在
3-4 碼層級,billable 與否要逐筆對官方 FY2026 碼表確認。

## 工作定義

- **B. ICD-10-CM FY2026 驗證**(全 30 筆):
  1. 現有碼在官方碼表是否存在、官方描述逐字抄。
  2. `billable` 判定:若非 billable(還有子碼),把**官方子碼清單**
     (含 laterality 變體)列進 `codes[]`,`specificity_note` 說明軸
     (laterality / encounter / severity)。**不要替 Ting 選碼,列全。**
  3. S 開頭傷害碼(S39.012 / S13.4 / S83.2 / S93.4)需要第 7 碼
     encounter(A/D/S)—— 列出三個變體與官方定義。
- **A. red flags 來源**(僅 2 筆 flags:N):
  - cond.gout(痛風):NIAMS(化膿性關節炎鑑別 —— 紅腫熱痛+發燒)
  - cond.rheumatoid_arthritis(類風濕):NIAMS(頸椎不穩/寰樞椎警訊,
    對針灸擺位是直接安全問題)

## 逐筆清單(全部做 B)

| condition_id | 中文 | English | 現有碼 | 預期問題 |
|---|---|---|---|---|
| cond.chronic_low_back_pain | 慢性下背痛 | Chronic Low Back Pain | M54.5 | FY2022 起已細分 M54.50/.51/.59 |
| cond.acute_lumbar_sprain | 急性腰扭傷 | Acute Lumbar Sprain | S39.012 | 第 7 碼 encounter |
| cond.lumbar_disc_herniation | 腰椎椎間盤突出 | Lumbar Disc Herniation | M51.2 | 細碼 M51.2x |
| cond.sciatica | 坐骨神經痛 | Sciatica | M54.3 | laterality M54.30-.32 |
| cond.cervical_spondylosis | 頸椎病 | Cervical Spondylosis | M47.812 | 驗證 billable |
| cond.neck_pain_stiff | 急性頸痛/落枕 | Acute Neck Pain | M54.2 | 驗證 |
| cond.whiplash | 揮鞭式頸傷 | Whiplash | S13.4 | 第 7 碼 |
| cond.frozen_shoulder | 五十肩 | Adhesive Capsulitis | M75.0 | laterality M75.00-.02 |
| cond.rotator_cuff | 旋轉肌袖 | Rotator Cuff Tendinopathy | M75.1 | laterality + 型態細碼 |
| cond.lateral_epicondylitis | 網球肘 | Lateral Epicondylitis | M77.1 | laterality M77.10-.12 |
| cond.medial_epicondylitis | 高爾夫球肘 | Medial Epicondylitis | M77.0 | laterality |
| cond.carpal_tunnel | 腕隧道 | Carpal Tunnel Syndrome | G56.0 | laterality G56.00-.03 |
| cond.de_quervain | 媽媽手 | De Quervain Tenosynovitis | M65.4 | 驗證 |
| cond.trigger_finger | 扳機指 | Trigger Finger | M65.3 | 指別細碼 M65.30-.35 |
| cond.knee_osteoarthritis | 膝骨關節炎 | Knee OA | M17 | 細碼 M17.0-.9(雙/單側) |
| cond.patellofemoral_pain | 髕股疼痛 | PFPS | M22.2 | laterality M22.2x |
| cond.meniscus_injury | 半月板損傷 | Meniscus Injury | S83.2 | 第 7 碼 + 部位細碼 |
| cond.ankle_sprain | 踝扭傷 | Ankle Sprain | S93.4 | 韌帶細碼 + 第 7 碼 |
| cond.plantar_fasciitis | 足底筋膜炎 | Plantar Fasciitis | M72.2 | 驗證(billable) |
| cond.achilles_tendinopathy | 阿基里斯腱 | Achilles Tendinopathy | M76.6 | laterality M76.60-.62 |
| cond.hip_osteoarthritis | 髖骨關節炎 | Hip OA | M16 | 細碼 M16.0-.9 |
| cond.piriformis_syndrome | 梨狀肌症候群 | Piriformis Syndrome | G57.0 | laterality G57.00-.03 |
| cond.fibromyalgia | 纖維肌痛症 | Fibromyalgia | M79.7 | 驗證(billable) |
| cond.myofascial_pain | 肌筋膜疼痛 | Myofascial Pain | M79.1 | FY 細分 M79.11-.18 |
| cond.tmd | 顳顎關節障礙 | TMD | M26.6 | 細碼 M26.60-.69 |
| cond.tension_headache | 緊張型頭痛 | Tension-Type Headache | G44.2 | 細碼(intractable 與否) |
| cond.migraine | 偏頭痛 | Migraine | G43 | 細碼 G43.x(status 軸多) |
| cond.cluster_headache | 叢發性頭痛 | Cluster Headache | G44.0 | 細碼 |
| cond.gout | 痛風 | Gout | M10 | 細碼 + **A 任務** |
| cond.rheumatoid_arthritis | 類風濕 | Rheumatoid Arthritis | M05 | 細碼 + **A 任務** |
