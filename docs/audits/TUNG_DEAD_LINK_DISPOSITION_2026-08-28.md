# Task 11G — 董氏穴位死連結處置清單

- 來源帳本：`data/audits/bundle_url_liveness_2026-08-28.json`
- 受影響卡片：411
- 整張卡 ledger-scanned 外部連結全為 404：1
- Dead distinct URLs：1133（圖片 722／參考連結 411）
- 原始欄位 occurrences：1215（圖片 722／參考連結 493）
- 同卡仍為 OK 的原始欄位 occurrences：2611
- `same_site_candidate`：已驗證 0；留 null 411；本輪 live candidate checks 0

## 全連結 404 卡片

- `ex.le3` 百蟲窩：dead occurrences 2；live occurrences 0

## 計數與處置邊界

- JSON 一張卡一列；同一 URL 若出現在同卡多個原始欄位，每個 `field_path` 各留一筆，避免後續修復漏欄位。
- `summary.distinct_dead_url_count` 對應 Task 11E ledger 的 URL 聯集；occurrence 數則對應原始 JSON 欄位。
- 本輪沒有推測替代網址，也沒有修改任何穴位 canonical JSON。
- 驗證：`node scripts/audit-source-url-liveness.js --verify-disposition`。
