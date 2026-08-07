# Batch 4 — 婦科/生殖:ICD-10-CM 細碼 + 既有 red flags 來源補引

規則正本:`docs/COND_INGESTION_SPEC.md`。
輸出:`data/imports/official/cond_batch4_gyn.json`

婦科 25 筆的 red flags **已全部填寫**(拓關第一批,2026-08 完成)——
這批不寫新警訊,做兩件事:

- **B. ICD-10-CM FY2026 驗證**(全 25 筆):同 Batch 2 規則。
  這是 Ting 的主科,保險文件最先用到的就是這 25 碼。
- **C. 既有 red flags 的來源補引**:對每筆現有的 red_flags 條目,
  在白名單來源(NICHD / MedlinePlus / CDC / NIDDK)找**支持該警訊的
  官方段落**,交 URL + verbatim。找不到支持來源的警訊照實列進
  `not_found` —— 那是審核端要重看的訊號,不是抽取者的失敗。
  ⚠ 不改寫、不增刪任何現有警訊文字;只補來源。

## 逐筆清單

| condition_id | 中文 | English | 現有碼 | 預期問題 |
|---|---|---|---|---|
| cond.pcos | 多囊性卵巢 | PCOS | E28.2 | 驗證 |
| cond.endometriosis | 子宮內膜異位 | Endometriosis | N80 | FY2022 起大改:N80.x 部位細碼,列全 |
| cond.uterine_fibroids | 子宮肌瘤 | Uterine Fibroids | D25 | 細碼 D25.0-.9 |
| cond.primary_dysmenorrhea | 原發性痛經 | Primary Dysmenorrhea | N94.4 | 驗證 |
| cond.pms | 經前症候群 | PMS | N94.3 | 驗證 |
| cond.irregular_menstruation | 月經不調 | Irregular Menstruation | N92.6 | 驗證 |
| cond.menorrhagia | 月經過多 | Heavy Menstrual Bleeding | N92.0 | 驗證 |
| cond.oligomenorrhea | 月經過少 | Scanty Menstruation | N91.5 | 驗證 |
| cond.amenorrhea | 繼發性閉經 | Secondary Amenorrhea | N91.1 | 驗證 |
| cond.female_infertility | 女性不孕 | Female Infertility | N97 | 細碼 N97.0-.9 |
| cond.male_infertility | 男性不育 | Male Factor Infertility | N46 | 細碼 N46.x |
| cond.diminished_ovarian_reserve | 卵巢儲備下降 | DOR | E28.3 | 驗證(E28.39?) |
| cond.ivf_support | IVF 輔助 | IVF/ART Support | Z31.83 | 驗證 Z 碼使用情境 |
| cond.recurrent_pregnancy_loss | 習慣性流產 | RPL | N96 | 驗證 |
| cond.luteal_phase_defect | 黃體功能不足 | Luteal Phase Deficiency | E28.8 | 驗證(E28.8 vs N97.8) |
| cond.menopause_syndrome | 更年期症候群 | Menopausal Syndrome | N95.1 | 驗證 |
| cond.hyperemesis_gravidarum | 妊娠劇吐 | Hyperemesis | O21 | 細碼 O21.0-.9 + 孕期碼規則 |
| cond.breech_presentation | 胎位不正(艾灸情境) | Breech Presentation | O32.1 | 驗證 + 第 7 碼規則 |
| cond.postpartum_hypolactation | 產後缺乳 | Insufficient Lactation | O92.4 | 驗證 |
| cond.chronic_pelvic_pain | 慢性骨盆腔疼痛 | Chronic Pelvic Pain | R10.2 | 驗證 |
| cond.pid_chronic | 慢性骨盆腔炎後遺 | Chronic PID Sequelae | N73.1 | 驗證 |
| cond.vulvovaginal_candidiasis | 念珠菌感染 | VVC | B37.3 | FY2026 細分 B37.31/.32? 列全 |
| cond.thin_endometrium | 子宮內膜偏薄 | Thin Endometrium | N85.8 | 驗證 |
| cond.pmdd | 經前不悅症 | PMDD | F32.81 | 驗證 |
| cond.secondary_dysmenorrhea | 繼發性痛經 | Secondary Dysmenorrhea | N94.5 | 驗證 |

## 注意

- O 碼(孕產)有 trimester 軸與「僅限產科情境」規則 —— 官方說明照抄進
  `specificity_note`,由審核端決定文件寫法。
- 這批的 C 任務輸出放進每筆的 `red_flag_sources[]`,`extractor_notes`
  註明「support for existing flag: <原警訊前 10 字>」。
