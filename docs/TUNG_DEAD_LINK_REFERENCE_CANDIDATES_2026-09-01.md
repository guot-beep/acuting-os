# Task 11I：mastertungacupuncture.org 非圖片參考頁死連結同站候選清單（2026-09-01）

**稽核日期**：2026-09-01
**來源帳本**：`data/audits/tung_dead_link_disposition_2026-08-28.json`
**輸出帳本**：`data/audits/tung_dead_link_reference_candidates_2026-09-01.json`
**政策**：只出候選清單，不改任何 `data/acupoints/**.json`
**統計方式**：所有數字從上述兩個 JSON 程式化重算，非手算

---

## 1. 分母驗證

```
node -e "const j=require('./data/audits/tung_dead_link_disposition_2026-08-28.json');let n=0;for(const c of j.cards)for(const u of c.dead_urls)if(!u.is_image)n++;console.log(n)"
# 輸出：493
```

| 分母 | 數值 |
|---|---|
| 非圖片死連結出現次數（total_dead_ref_occurrences） | **493** |
| Distinct dead URLs（total_distinct_dead_urls） | **411** |
| Host | `www.mastertungacupuncture.org`（唯一） |

---

## 2. 網站索引建立方式（非猜測）

三個索引來源，每一步都有實際打開頁面或抓取內容確認：

1. **`/acupuncture/traditional/points/list` 目錄頁**
   - 直接列出 EX 穴現行完整 URL 共 **74 條**
   - EX 穴新格式：`/acupuncture/traditional/points/{拼音名}-ex-{zone}{num}`

2. **`/sitemap.xml`**
   - 確認 sitemap 含 traditional 穴位頁面結構

3. **活頁探測（非從死連結拼音組路徑）**
   - `bl1` → HTTP **200** → 發現新格式：`/points/{code}`（無拼音前綴）
   - `th1` → HTTP **200** → 發現 TE（三焦經）在現站使用代碼 `th`

---

## 3. 驗證結果（程式化重算）

### 彙總

| 指標 | 數值 |
|---|---|
| attempted（found + not_found） | **415** |
| found（HTTP 200 候選） | **407** |
| not_found | **8** |
| not_attempted_time_limit | **0** |
| total_dead_ref_occurrences（disposition 來源） | **493** |
| total_distinct_dead_urls（disposition 來源） | **411** |

> **accounting_note**：attempted(415) = found(407) + not_found(8)。
> total_dead_ref_occurrences(493) 減 attempted(415) = 78，這是同一 (card_id, url) 在不同 card 欄位重複出現、解析到相同 distinct candidate 的次數，已在 found 計一次。

### 候選類型分佈（程式化計算）

| 類型 | 數量 | 說明 |
|---|---|---|
| 標準經穴（channel） | **338** | 新格式 `/points/{code}`，如 bl1、gb34 |
| EX 穴（ex_points） | **46** | 從目錄頁索引取得現行 slug |
| TE→TH 映射（te_to_th_mapping） | **23** | te1-te23 → th1-th23 |
| 畸形 URL（malformed_url） | **0** | 無候選（見 not_found_detail） |
| **合計** | **407** | |

---

## 4. not_found 完整明細（8 次出現，6 筆 card_id × URL 組合）

| card_id | dead URL | 出現次數 | 原因 |
|---|---|---|---|
| `ex.b12` | `.../points/list:` | 1 | 畸形 URL：結尾冒號，非穴位頁 |
| `ex.ca5` | `.../points/list:` | 1 | 同上 |
| `ex.hn17` | `.../points/list:` | 1 | 同上 |
| `ex.hn21` | `.../points:` | 2 | 畸形 URL：bare 目錄路徑 + 冒號 |
| `ex.hn21` | `.../points` | 2 | 畸形 URL：bare 目錄索引頁，非穴位頁 |
| `ex.hn22` | `.../traditional_points:` | 1 | 畸形 URL：舊式路徑 + 冒號 |

---

## 5. 2026-09-02 identity correction

- `ex.le3` 卡名是百蟲窩；原候選誤指向 `Xinei (Ex-LE3)`（膝內）。
- 以真瀏覽器重新開啟目錄頁後，實際索引是 `Ex-LE13 Baichongwo`；候選改為
  `https://www.mastertungacupuncture.org/acupuncture/traditional/points/baichongwo-ex-le13`。
- 目錄頁、正確候選頁均回 HTTP 200；頁面 `h1` 是 `Baichongwo (Ex-LE13)`，正文含百蟲窩。
- 這是 found 集合內的一對一更正，`attempted`／`found`／`not_found` 數字不變；沒有修改 canonical 穴位資料。

## 6. 驗收指令輸出

```
node scripts/audit-source-url-liveness.js --self-test
```
輸出：`Self-Test Results: 13/13 fixtures behaving as expected. [SELF-TEST SUCCESS]`

---

## 7. Commit 邊界

只修改：
- `data/audits/tung_dead_link_reference_candidates_2026-09-01.json`（`ex.le3` 候選 identity 更正）
- `docs/TUNG_DEAD_LINK_REFERENCE_CANDIDATES_2026-09-01.md`（本報告）

不動：`data/audits/tung_dead_link_disposition_2026-08-28.json`、所有 `data/acupoints/**`
