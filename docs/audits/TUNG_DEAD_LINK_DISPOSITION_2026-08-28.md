# Task 11G／11H — 董氏穴位死連結處置與同站圖片候選

- 來源帳本：`data/audits/bundle_url_liveness_2026-08-28.json`
- 受影響卡片：411
- 整張卡 ledger-scanned 外部連結全為 404：1
- Dead distinct URLs：1133（圖片 722／參考連結 411）
- 原始欄位 occurrences：1215（圖片 722／參考連結 493）
- 同卡仍為 OK 的原始欄位 occurrences：2611
- 圖片 `dead_urls[].same_site_candidate`：已驗證 360；留 null 362；累計調查 360 個 dead-image 欄位（180 個 unique live image HTTP checks）

## Task 11H 第一批實測

- 範圍：30 張卡／60 個 dead-image 原始欄位；每張卡原本的 location 與 needling 圖都對到該穴位現行 point image。
- 路徑來源：先由 `https://www.mastertungacupuncture.org/acupuncture/traditional/points/list` 的實際目錄連結取得 point page，再核對頁面 `h1` 穴位 code，最後用真瀏覽器逐一開啟 point image。
- 結果：目錄 1/1 HTTP 200；point pages 30/30 HTTP 200；`h1` code 30/30 相符；unique image URLs 30/30 HTTP 200。
- 卡片：`BL1`、`BL2`、`BL3`、`BL10`–`BL36`（依 11G dead-image 數排序後的首批 30 張）。
- `ex.le3` 百蟲窩沒有 dead-image 欄位，只有非圖片 dead references；其 Task 11I 候選另行由誤指 `Xinei (Ex-LE3)` 更正為瀏覽器驗證的 `Baichongwo (Ex-LE13)`。
- 未調查：662/722 個 dead-image 欄位維持 `same_site_candidate: null`；沒有由檔名或 URL 規律推測候選。

## Task 11H 第二批實測（2026-09-03 02:30 PDT heartbeat）

- 範圍：再查 30 張卡／60 個 dead-image 原始欄位；候選累計 `60→120/722`，null `662→602`。
- 結果：目錄 1/1 HTTP 200；point pages 30/30 HTTP 200；`h1` code 30/30 相符；unique image URLs 30/30 HTTP 200。
- 卡片：`BL4`–`BL6`、`BL37`–`BL63`（依仍為 null 的 dead-image 數與 card id 排序後的下一批 30 張）。
- 每個候選保留各自的 `fetched_at`、HTTP 200 與 `how_found`；其餘 602/722 維持 `same_site_candidate: null`。

## Task 11H 第三批實測（2026-09-03）

- 範圍：再查 30 張卡／60 個 dead-image 原始欄位；候選累計 `120→180/722`，null `602→542`。
- 結果：目錄 1/1 HTTP 200；point pages 30/30 HTTP 200；`h1` code 30/30 相符；unique image URLs 30/30 HTTP 200。
- 卡片：`BL7`–`BL9`、`BL64`–`BL67`、`CV1`–`CV8`、`CV10`–`CV24`（依仍為 null 的 dead-image 數與 card id 排序後的下一批 30 張）。
- 每個候選保留各自的 `fetched_at`、HTTP 200 與 `how_found`；其餘 542/722 維持 `same_site_candidate: null`。

## Task 11H 第四批實測（2026-09-03）

- 範圍：再查 30 張卡／60 個 dead-image 原始欄位；候選累計 `180→240/722`，null `542→482`。
- 結果：目錄 1/1 HTTP 200；point pages 30/30 HTTP 200；`h1` code 30/30 相符；unique image URLs 30/30 HTTP 200。
- 卡片：`CV9`、`GB1`–`GB3`、`GB10`–`GB35`（依仍為 null 的 dead-image 數與 card id 排序後的下一批 30 張）。
- 每個候選保留各自的 `fetched_at`、HTTP 200 與 `how_found`；其餘 482/722 維持 `same_site_candidate: null`。

## Task 11H 第五批實測（2026-09-03）

- 範圍：再查 30 張卡／60 個 dead-image 原始欄位；候選累計 `240→300/722`，null `482→422`。
- 結果：目錄 1/1 HTTP 200；point pages 30/30 HTTP 200；`h1` code 30/30 相符；unique image URLs 30/30 HTTP 200。
- 卡片：`GB4`–`GB9`、`GB36`–`GB44`、`GV1`–`GV2`、`GV10`–`GV22`（依仍為 null 的 dead-image 數與 card id 排序後的下一批 30 張）。
- 每個候選保留各自的 `fetched_at`、HTTP 200 與 `how_found`；其餘 422/722 維持 `same_site_candidate: null`。

## Task 11H 第六批實測（2026-09-03）

- 範圍：再查 30 張卡／60 個 dead-image 原始欄位；候選累計 `300→360/722`，null `422→362`。
- 結果：目錄 1/1 HTTP 200；point pages 30/30 HTTP 200；`h1` code 30/30 相符；unique image URLs 30/30 HTTP 200。
- 卡片：`GV3`–`GV9`、`GV23`–`GV28`、`HT1`–`HT9`、`KI1`、`KI10`–`KI16`（依仍為 null 的 dead-image 數與 card id 排序後的下一批 30 張）。
- 每個候選保留各自的 `fetched_at`、HTTP 200 與 `how_found`；其餘 362/722 維持 `same_site_candidate: null`。

## 全連結 404 卡片

- `ex.le3` 百蟲窩：dead occurrences 2；live occurrences 0

## 計數與處置邊界

- JSON 一張卡一列；同一 URL 若出現在同卡多個原始欄位，每個 `field_path` 各留一筆，避免後續修復漏欄位。
- `summary.distinct_dead_url_count` 對應 Task 11E ledger 的 URL 聯集；occurrence 數則對應原始 JSON 欄位。
- Task 11H 只寫入真瀏覽器驗證為 HTTP 200 的候選；沒有修改任何穴位 canonical JSON。
- 驗證：`node scripts/audit-source-url-liveness.js --verify-disposition`。
- verifier 保留 11G 的 URL／card／field_path 雙向核對，並補上 Task 11H nested candidate 與三個 summary 計數的契約檢查。
