# Task 11B：正典卡引用網址 Link-Rot 全掃與存活性稽核報告

- **稽核日期**: 2026-08-27 (實測連線時間: 2026-08-28T05:50:00Z - 05:55:30Z)
- **稽核類型**: Full Corpus Canonical URL Liveness & Soft-404 Inventory (READ-ONLY, 0 production data mutation)
- **Base Tree**: `origin/main` @ `8ba58677f5a8cb59a7ff3d4cb8a72b0e60fa2259`
- **結構化帳本**: `data/audits/canon_source_url_liveness_2026-08-27.json`
- **驗證工具**: `scripts/audit-source-url-liveness.js` (`--verify-ledger` / `--self-test`)

---

## 1. 稽核範疇與分母核對（SSOT 直出）

依據規範，掃描欄位鎖定三處正典頂層引用欄位：`exact_source_url`、`safety_source_url`、`source_url`。

| 資料集檔案 | 總記錄數 | 引用總次數 (Occurrences) | Distinct HTTP(S) URL 數 | 掃描欄位細部次數 |
|---|---|---|---|---|
| `data/herbs/herb_canon_shortlist.json` | 364 | 607 | 369 | `exact_source_url`: 262<br>`safety_source_url`: 345 |
| `data/herbs/formulas.json` | 223 | 300 | 196 | `exact_source_url`: 217<br>`safety_source_url`: 83 |
| `data/pathology/condition_canon_shortlist.json` | 508 | 0 | 0 | `source_url`: 0 (全空/無 HTTP URL) |
| **全庫總計** | **1,095 筆** | **907 處** | **565 個** | — |

### Host 分佈
- **`cloudtcm.com`**: 360 個 distinct URL（共 663 處引用）
- **`americandragon.com` / `www.americandragon.com`**: 205 個 distinct URL（共 244 處引用）

---

## 2. 負控驗證（Host-Level Negative Controls）

在執行 565 筆實測前，針對兩大主要 host 實施負控探針，驗證伺服器是否存在 Soft-404（以 200 狀態碼回傳假頁面或首頁）：

1. **`cloudtcm.com` 負控**:
   - 探針網址: `https://cloudtcm.com/herb/nonexistent_fake_herb_404`
   - 響應狀態: HTTP **404**
   - 內容特徵: `This page could not be found` (Next.js 404 專用結構)
   - 判定結論: 具真實 404 響應機制，**非 Soft-404 站台**。後續 200 響應為有效存在證明。

2. **`americandragon.com` 負控**:
   - 探針網址: `https://www.americandragon.com/Individualherbsupdate/XxYyZzWw.html`
   - 響應狀態: HTTP **404**
   - 內容特徵: `404 Not Found` (13 bytes)
   - 判定結論: 具真實 404 響應機制，**非 Soft-404 站台**。後續 200 響應為有效存在證明。

---

## 3. 全庫 565 筆網址實地掃描統計

- **實施節流**: 每個 Host $\le 2\text{ req/s}$（間隔 550ms），逾時（15s）與 429 具 2 次指數退避重試機制。
- **總掃描 Distinct URL 數**: 565
- **HTTP 200 有效正常 (Valid)**: **563** 筆 (99.65%)
- **HTTP 404 實體死連結 (Not Found)**: **1** 筆 (0.18%)
- **HTTP 500 站台伺服器錯誤 (Server Error)**: **1** 筆 (0.18%)
- **疑似 Soft-404 (Soft-404 Suspected)**: **0** 筆
- **網路斷線／逾時失敗**: **0** 筆

---

## 4. 異常網址詳細清單（死連結與掛載錯誤）

依據規範 §3「死連結只報不修，零資料異動」，異常網址僅登載於帳本之 `suggested_replacement`，**未改動正典資料庫任何 byte**：

### 異常 1：`herb.zhi_gan_cao` 炙甘草 American Dragon 404 死連結
- **現有 URL**: `https://www.americandragon.com/IndividualHerbs/ZhiGanCao.html`
- **引用處**: `data/herbs/herb_canon_shortlist.json` 之 `herb.zhi_gan_cao`（`exact_source_url` 與 `safety_source_url`，共 2 處）
- **HTTP 狀態**: `404 Not Found`
- **根因分析**: 路徑誤植為舊版目錄 `/IndividualHerbs/`（缺少 `update`），且 American Dragon 站台將炙甘草收錄於 `GanCao.html` 內作為炮製項目，無獨立之 `ZhiGanCao.html`。
- **建議替換 (Suggested Replacement)**: `https://www.americandragon.com/Individualherbsupdate/GanCao.html`

### 異常 2：`cloudtcm.com/formula/99` 站方 500 伺服器內部錯誤
- **現有 URL**: `https://cloudtcm.com/formula/99`
- **引用處**: `data/herbs/formulas.json` 之 **20 首方劑**（`exact_source_url`）：
  - `formula.jia_jian_wei_rui_tang` (加減葳蕤湯)
  - `formula.xie_xin_tang` (瀉心湯)
  - `formula.qing_gu_san` (清骨散)
  - `formula.wu_wei_xiao_du_yin` (五味消毒飲)
  - `formula.qing_wen_bai_du_yin` (清瘟敗毒飲)
  - `formula.da_huang_mu_dan_tang` (大黃牡丹湯)
  - `formula.fu_zi_li_zhong_wan` (附子理中丸)
  - `formula.huang_qi_jian_zhong_tang` (黃耆建中湯)
  - `formula.jiao_ai_tang` (膠艾湯)
  - `formula.zuo_gui_yin` (左歸飲)
  - `formula.you_gui_yin` (右歸飲)
  - `formula.shen_qi_wan` (腎氣丸)
  - `formula.suo_quan_wan` (縮泉丸)
  - `formula.shou_tai_wan` (壽胎丸)
  - `formula.si_miao_wan` (四妙丸)
  - `formula.shi_pi_yin` (實脾飲)
  - `formula.xiao_huo_luo_dan` (小活絡丹)
  - `formula.sha_shen_mai_men_dong_tang` (沙參麥門冬湯)
  - `formula.zi_xue_dan` (紫雪丹)
  - `formula.yang_he_tang` (陽和湯)
- **HTTP 狀態**: `500 Internal Server Error`
- **根因分析**: `cloudtcm.com` 伺服器端對 `/formula/99` 端點拋出內部例外崩潰（回傳通用首頁標題並附加 500 錯誤碼）。此批方劑最初生成時共用了佔位/批次 ID 99。
- **建議替換 (Suggested Replacement)**: 待 Ting / SOL 裁定個別方劑之獨立專屬 cloudtcm ID 或切換為標準正典文獻出處。

---

## 5. 離線驗證與自檢（Offline Ledger Gate & Self-Test）

本項交付之驗證工具 `scripts/audit-source-url-liveness.js` 可完全離線驗證帳本與正典之一致性：

```bash
# 1. 執行負控與對抗測試（6/6 Fixtures 全部驗證通過）
node scripts/audit-source-url-liveness.js --self-test

# 2. 離線核驗帳本與正典分母（4 大指標與負控門檻全數通過）
node scripts/audit-source-url-liveness.js --verify-ledger
```
