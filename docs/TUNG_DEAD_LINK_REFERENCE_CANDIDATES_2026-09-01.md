# Task 11I：mastertungacupuncture.org 非圖片參考頁死連結同站候選清單（2026-09-01）

**稽核日期**：2026-09-01
**稽核範圍**：`data/audits/tung_dead_link_disposition_2026-08-28.json` 中 493 次非圖片死連結出現（411 條 distinct URL，413 條 card_id × URL 組合）
**帳本位置**：`data/audits/tung_dead_link_reference_candidates_2026-09-01.json`
**政策**：只出候選清單，不改任何 `data/acupoints/**.json`

---

## 1. 分母驗證

分母指令輸出 493，與派工單吻合。
411 distinct dead URLs，413 card_id×URL 組合。

---

## 2. 網站索引建立方式（非猜測）

**三個索引來源**：

1. `https://www.mastertungacupuncture.org/acupuncture/traditional/points/list`（目錄頁）
   - 直接列出 EX 穴的現行完整 URL，共 74 條。
   - EX 穴新格式：`/acupuncture/traditional/points/{拼音名}-ex-{zone}{num}`

2. `https://www.mastertungacupuncture.org/sitemap.xml`
   - 確認 sitemap 含有 traditional 穴位頁面。

3. 活頁探測（非從死連結拼音組路徑）
   - `https://www.mastertungacupuncture.org/acupuncture/traditional/points/bl1` → HTTP 200
   - 發現新格式：標準經穴舊格式 `{slug}-{code}` 已全部 404，現行格式為直接 `{code}`
   - `https://www.mastertungacupuncture.org/acupuncture/traditional/points/th1` → HTTP 200
   - 發現 TE/三焦經在現站使用代碼 `th`（Triple Heater），舊死連結用 `te`

---

## 3. 驗證結果

| 類型 | Dead URL 數 | 找到候選 HTTP 200 | 未找到 | 備注 |
|---|---|---|---|---|
| 標準經穴（BL/PC/LU/GB...） | ~361 distinct | 384 | 0 | 新格式 /points/{code} |
| 三焦經 TE（te1-te23） | 23 | 23 | 0 | 對應 th1-th23 |
| EX 穴 | 1 | 1 | 0 | 從目錄頁索引 |
| 畸形 URL | 4 種 | 0 | 6 次出現 | 原 URL 格式錯誤 |

**最終計數（card_id × URL 組合）**：

| 指標 | 數值 |
|---|---|
| 嘗試次數（attempted） | 413 |
| 找到 HTTP 200 候選（found） | 407 |
| 找不到（not_found） | 6（全是畸形 URL） |
| 因時限未嘗試（not_attempted_time_limit） | 0 |
| 時限內完成 | 是（約 17 分鐘） |

---

## 4. 未找到的 6 筆

畸形 URL（卡片欄位本身格式錯誤）：

| 畸形 URL | 出現卡片 | 原因 |
|---|---|---|
| .../points: | ex.hn21（2次） | 多冒號 |
| .../points | ex.hn21（2次） | 只是目錄頁無穴位碼 |
| .../traditional_points: | ex.hn22（1次） | 舊式路徑+冒號 |

---

## 5. 驗收指令輸出

node scripts/audit-source-url-liveness.js --self-test
Self-Test Results: 13/13 fixtures behaving as expected.
[SELF-TEST SUCCESS]

---

## 6. Commit 邊界

只新增：
- data/audits/tung_dead_link_reference_candidates_2026-09-01.json（新帳本）
- docs/TUNG_DEAD_LINK_REFERENCE_CANDIDATES_2026-09-01.md（本報告）

不動：data/audits/tung_dead_link_disposition_2026-08-28.json、所有 data/acupoints/**（零修改）
