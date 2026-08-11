# P1 診前手機頁 — 實作契約 v0(Fable 設計,Sonnet 實作)

Status: DRAFT v0(2026-08-11)。入口方案仍待 Ting 裁定(見 §5),契約先定,
Sonnet 可先做成獨立靜態頁 + 匯入路徑,入口決定後只換部署位置。

## 1. 目標與邊界

病人在候診/前一晚用手機自填 → 產出一份結構化 JSON → 臨床端(正典 Edge
file:// store)以現有 import-merge 路徑收入該次 visit。**病人裝置絕不直寫
任何 store;不新增後端;頁面本身無任何 PHI 儲存(不寫 localStorage)。**

## 2. 表單內容(全部取自既有 registry,不新造欄位)

1. **結構化 metrics**:NUMERIC_OUTCOME_METRIC_CONFIG 內的 metric 子集,
   題面用 outcome_metrics.json 的 patient_prompt_zh/en(27 個 metric 已備)。
   臨床端可勾選本 case 追蹤哪些 metric(v0:固定 pain/sleep/stress/mood/
   energy/PGIC 六項,PGIC 僅複診)。
2. **主觀變化**:單一自由文字題(「上次治療後有什麼變化?」)→ soap.subjective 前綴。
3. **病人視角**(CARE 12):自由文字 → soap.patientPerspective。
4. **AE 自報**:是/否 + 描述 → 臨床端確認後才成 adverseEvents 列
   (status='patient_reported';自報絕不自動入列,D4)。
5. **supp/藥物變動自報**:是/否 + 文字 → 臨床端經 applyExposureChange 人工收入。

## 3. 輸出格式(唯一契約)

```json
{ "kind": "acuting-previsit-v1", "patientCode": "<病人自己輸入的代碼>",
  "filledAt": "<ISO>", "metrics": [{"metricId":"metric.pain_score","valueNumber":4}],
  "subjectiveText": "", "patientPerspective": "", "aeSelfReport": {"any":false,"text":""},
  "exposureSelfReport": {"any":false,"text":""} }
```

傳遞:v0 = 頁面產 QR(JSON base64)+ 「複製」按鈕;臨床端 SOAP 表單加
「貼上診前資料」→ 預填對應欄位,**臨床者逐欄確認後才存**(不 bypass 表單)。

## 4. 驗證規則

- metricId 必須存在於 registry 且在 config 白名單;valueNumber 過 config
  min/max/integer;非法整筆拒收並顯示原因。
- patientCode 只做字串攜帶,不查表(病人裝置上沒有名單,不可能洩漏)。

## 5. 待 Ting 裁定(入口)

| 選項 | 優點 | 缺點 |
|---|---|---|
| A. workers.dev 靜態頁(9/5 後)| 手機直開、零安裝 | 需等 main 落地;URL 公開(頁面無資料,風險=枚舉不到東西)|
| B. 診間 Wi-Fi 區網頁 | 不出網 | 要開本機 server |
| C. file:// 直開(傳檔給病人)| 零基建 | 手機開 file 不便 |

推薦 A(頁面純空表單、無任何資料,公開無害);9/5 前用 B 應急。

## 6. Sonnet 實作切分

1. `previsit.html`(單檔、無依賴、讀 knowledge bundle 的 metric prompts)
2. app.js SOAP 表單「貼上診前資料」按鈕 + 預填(不觸 C2b/凍結面)
3. 驗證器:scripts/validate-previsit-payload.js(node,CI 用)
