# 病症官方來源抽取規格（統一 Ingestion Spec）

Written: 2026-08-08 (Claude)。適用對象:ChatGPT(帶網頁瀏覽)/ Codex /
Antigravity —— 任何執行 `docs/COND_INGEST_BATCH_*.md` 派工單的抽取者。

目的:把 red flags 的官方來源與 ICD-10-CM 官方碼**抽進 staging**,
供 Ting/Claude 審核後轉寫成卡。抽取者不寫卡、不碰 canon。

---

## 1. 來源白名單(只准這些,依欄位分工)

| 用途 | 允許來源 | 網域 |
|---|---|---|
| ICD-10-CM 碼與官方描述 | CDC/NCHS ICD-10-CM **FY2026 官方檔案頁** · CMS ICD-10 files | cdc.gov/nchs · cms.gov |
| Red flag 來源段落 | MedlinePlus · NINDS · NIDDK · NHLBI · NIAMS · NICHD · NIDCD · CDC 疾病頁 | medlineplus.gov · *.nih.gov · cdc.gov |
| 藥物相關警訊 | FDA / DailyMed 官方標籤 | fda.gov · dailymed.nlm.nih.gov |

**禁止**:WebMD / Healthline / Mayo Clinic / UpToDate 摘要 / 維基百科 /
任何商業醫療網站 / 雲端中醫(它是另一條線的 Tier-D 來源,不進這裡)。
白名單打不開就寫 `not_found`,**不准換站補**。

## 2. 鐵律

1. **每一筆資料必附實際打開過的 `source_url`。** 沒有 URL 的資料一律作廢。
2. **ICD 碼不准憑記憶寫** —— 碼必須出現在你打開的官方檔案/頁面裡。
3. **查不到就是答案**:寫進 `not_found`,說明查了哪裡。編造是本專案
   最重的違規(見 AI_CONSTITUTION)。
4. **不產生中文翻譯** —— 轉寫是審核端的事,抽取層產生的中文一律視為假中文。
5. **verbatim 摘錄 ≤40 英文字/筆**,標明出處段落。來源多為美國聯邦公版,
   但摘錄仍以「引用依據」為目的,不是搬運內容。
6. 產出只進 `data/imports/official/`(staging,D14 匯入層)。
   **不碰 `data/pathology/` 任何檔案,不改任何 canonical id。**
7. red flags 是高風險欄位:抽取者只交「來源+摘錄+URL」,
   成卡的轉寫與分級由 Claude/Ting 做(AI_CONSTITUTION 模型分級規則)。

## 3. 輸出格式(每批一個 JSON 檔)

檔名:`data/imports/official/<batch_id>.json`

```json
{
  "batch": "cond_batch1_neuro_vertigo",
  "retrieved_at": "2026-08-08",
  "extractor": "chatgpt",
  "icd10cm_version": "FY2026",
  "records": [
    {
      "condition_id": "cond.bells_palsy",
      "icd10cm": {
        "status": "verified | needs_more_specific | code_not_found",
        "codes": [
          {
            "code": "G51.0",
            "official_description": "逐字抄官方描述",
            "billable": true,
            "specificity_note": "若需 laterality/更細碼,寫這裡"
          }
        ],
        "source_url": "實際打開的官方檔案/頁面 URL"
      },
      "red_flag_sources": [
        {
          "source_org": "NINDS",
          "page_title": "",
          "source_url": "",
          "section": "When to seek emergency care(或實際段落名)",
          "quote_en": "≤40 字 verbatim",
          "suggested_tier": "emergency_referral | urgent_referral | routine_referral"
        }
      ],
      "not_found": [],
      "extractor_notes": ""
    }
  ]
}
```

## 4. 驗收(審核端執行,抽取者知悉即可)

- 每筆 `source_url` 抽查可開、內容與摘錄一致。
- ICD 碼對 FY2026 官方碼表逐一核對;`billable` 與官方一致。
- 任何無來源、無 URL、或白名單外來源的資料整筆退回。
- 回報格式:逐批數字(N 筆完成 / N 筆 not_found / N 筆退回),
  禁用「完成」「100%」。

## 5. 批次清單

| 批 | 檔案 | 主要工作 |
|---|---|---|
| 1 | COND_INGEST_BATCH_1_NEURO_VERTIGO.md | 11 筆 red flags 來源 + 12 筆 ICD 驗證 |
| 2 | COND_INGEST_BATCH_2_PAIN_MSK.md | 30 筆 ICD 細碼/laterality + 2 筆 red flags |
| 3 | COND_INGEST_BATCH_3_GI.md | 14 筆 red flags 來源 + 15 筆 ICD 驗證 |
| 4 | COND_INGEST_BATCH_4_GYN.md | 25 筆 ICD 細碼 + 既有 red flags 的來源補引 |
