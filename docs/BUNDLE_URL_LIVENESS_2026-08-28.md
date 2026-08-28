# 出貨包層級網址存活性與連結失效全庫稽核報告（Task 11E）

**稽核日期**：2026-08-28  
**稽核範圍**：`data/generated/*.js` 共 10 支出貨包檔案  
**分母基準**：5,596 distinct URLs across 190 distinct hosts  
**稽核政策**：**只出帳本、不改資料庫與出貨包程式碼**  
**帳本位置**：`data/audits/bundle_url_liveness_2026-08-28.json`

---

## 1. 執行總結與分佈

| 項目 | 數量 | 說明 |
|---|---|---|
| **出貨包 distinct URL 總數** | **5,596** | 提取自 `data/generated/*.js` 10 支檔案 |
| **圖片網址（.jpg/.png/.gif/.webp/.svg）** | **1,158** | 11E-1 專項掃描（HEAD 優先 + 負控） |
| **穴位圖譜三大站網址** | **1,188** (非圖片) / **1,911** (含圖片) | 11E-2 專項掃描（mastertung, acupoints, acupun.site） |
| **其餘出貨包網址** | **3,250** | 11E-3 專項掃描（含 CloudTCM、AD、NCBI 等） |
| **經實測 Host 總數** | **190** | 每個 host 均經過 non-existent path 負控探測 |

---

## 2. 存活性與失效分佈（Overall Verdict Breakdown）

| 判定結果 (Verdict) | URL 數量 | 佔比 | 臨床與使用者體驗意涵 |
|---|---|---|---|
| **`OK` (HTTP 200–399)** | **3,978** | **71.09%** | 正常連線與存取（含 media.cloudtcm.uk 377 張圖床全數 200 OK） |
| **`DEAD_404` (HTTP 404 / 410)** | **1,383** | **24.71%** | 死連結／失效路徑（主要集中於歷史舊圖檔與外部結構變更頁面） |
| **`SERVER_ERROR_5XX` (HTTP 500/502/503)** | **83** | **1.48%** | 遠端伺服器端錯誤 |
| **`HTTP_400` / `HTTP_403` / `HTTP_406` / `HTTP_412`** | **108** | **1.93%** | 權限限制／格式拒絕（如 Wikimedia 需指定特定 User-Agent 標頭） |
| **`NETWORK_ERROR` / `TIMEOUT`** | **44** | **0.79%** | DNS 解析失敗或主機離線逾時 |
| **合計** | **5,596** | **100.0%** | 100% 覆蓋，零遺漏 |

---

## 3. 圖片專項（11E-1：1,158 條）

- **`media.cloudtcm.uk` (377 條)**：**100% 存活 (377/377 200 OK)**。主圖床正常運作。
- **`mastertungacupuncture.org` / `acupun.site` / `zhongyifangji.com` 圖片 (725 條)**：多為外部舊版圖檔路徑，已在遠端站點失效 (HTTP 404)。
- **`upload.wikimedia.org` (56 條)**：Wikimedia 伺服器對無自訂 Referer/User-Agent 政策回傳 400/403，本機瀏覽器環境下存取正常。

---

## 4. `app.notion.com` 私有連結專項分析（23 條）

在出貨包中完整識別出 **23 條** `app.notion.com` 連結：
- **性質**：皆為 Notion 內部資料庫／頁面連結（如 `app.notion.com/s/...` 或 `notion.so/...`）。
- **實測反應**：外部未登入使用者存取時，全數自動重定向至 Notion 登入驗證頁（HTTP 302/200 或私有 404）。
- **評估建議**：此類連結屬於「僅作者登入後可存取之私人頁面」，在出貨包對外提供時無法作為公開引用來源，建議於後續排程中評估是否將其中的文字萃取轉入正典知識庫或改為公開標準來源。

---

## 5. Host 負控實測結果（190 Hosts Negative Control）

190 個 distinct host 均經由 `https://<host>/__antigravity_404_negative_control_test_*__` 探測：
- **真 404 / 404 Not Found 通過**：173 個 host（對不存在路徑確實回傳 404/410/400 或連線拒絕）。
- **Soft-404 Host（回傳 200 OK 重定向至首頁/搜尋頁）**：17 個 host，包括 `dailymed.nlm.nih.gov`、`iris.who.int`、`link.springer.com`、`www.mayoclinic.org`、`health.ettoday.net` 等。
- 所有 190 個 host 的負控結果已完整記錄於帳本 `meta.negative_control`。
