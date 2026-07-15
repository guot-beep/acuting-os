# AcuTing 權威來源登記表 (TCM Source Registry)

用途：日後擴建知識內容時，優先到這些權威網站查資料、蒸餾成 AcuTing 內容。
分層原則：官方標準 > 大學/學術資料庫 > 實用查詢站 > 開源專案（研究用）。
建立：2026-07-03（Ting 提供，Claude 整理）。所有內容需交叉核對原始文獻/教材後才作臨床用途。

## A. 穴位 Acupoints

| 層級 | 網站 | 語言 | 最適合查 | 備註 |
|---|---|---|---|---|
| A 官方 | WHO Standard Acupuncture Nomenclature | 英 | 361 標準穴英文名、經絡命名、國際對照 | 最終校對標準名，非教學/臨床細節 |
| A 官方 | 《中西醫病名對照大辭典》(林昭庚 主編, 台灣) | 中 | 西醫病名↔中醫病名權威對照、ICD 對應 | 病名對照層(Track E)的第一級核對來源；Ting 指定 2026-07-12 |
| B 實用 | acupoints.org | 英 | 單穴英文頁：位置、主治、分類 | 查詢工具，非權威 |
| B 實用 | 雲端中醫 cloudtcm.com | 中 | 穴位、經絡、證候、病症、養生整合 | 民間平台；已建 code→id 對照直連（見下） |
| B 教學 | 再探當代針灸大成數位典藏 | 中 | 針灸教學、穴位、扎針影片、3D | 教學/數位典藏 |

## B. 方劑 Formulas

| 層級 | 網站 | 語言 | 最適合查 |
|---|---|---|---|
| A- 大學 | 香港浸會大學中醫藥資料庫（方劑圖像庫） | 中英 | 組成/功用/主治/用法/病機/運用/出處 |
| B 臨床 | 高醫中藥處方集 | 中 | 中藥處方、臨床常用配伍 |

## C. 中藥 / 現代藥理 Herbs & Pharmacology

| 層級 | 網站 | 最適合查 |
|---|---|---|
| A | 萬方醫學網 / 中醫藥知識庫 | 中藥、方劑、疾病、中成藥、針灸、文獻 |
| A | 中醫藥數據庫檢索系統（中國中醫科學院, cckf.org） | 期刊、疾病診療、中藥、方劑、國家標準、跨庫檢索 |
| A- | TCMIP 中醫藥整合藥理平台 | 中藥成分、靶標、疾病相關分子、網路藥理 |
| A- | TCMSP | 成分、靶點、ADME、疾病連結（系統藥理） |
| A- | HERB / SymMap / TCMIO | 中藥–成分–靶點–症狀–疾病整合 |
| C 標準 | 香港中藥材標準檢索系統 | 藥材標準、品種、規格 |

## D. 病症 Conditions

| 層級 | 網站 | 最適合查 |
|---|---|---|
| A- 大學 | SFU Library TCM Knowledge Base | 疾病、方劑、中藥、中成藥、古籍、臨床路徑（交叉查詢） |
| B | 中國醫學網 / 台灣中醫醫學網 | 古籍、典籍、條文、延伸閱讀 |

## E. 開源專案 / 資料集（研究用，注意授權，多數限學術）

| 專案 | 內容 | 適合 |
|---|---|---|
| ShenNong-TCM-LLM | 中醫藥指令資料集 + 模型 | 問答/助手/微調 |
| BianCang-TCM-LLM 扁倉 | 辨病辨證、醫考能力 | 診斷輔助、評測 |
| TCMLLM | 中醫大模型入口 | 追蹤 AI 資源 |
| tcmoc 中醫開源醫典 | 典籍、語料、元資料結構 | 古籍整理、知識圖譜、Obsidian |
| 中文医学数据集详细整理 | 資料集彙整入口 | 找更多醫療/NLP 資料集 |
| TCM-Database-Collation-and-Query-System | 資料庫整理與查詢 | 結構化整理、檢索原型 |
| TCMBench / TCMEval | 評測基準 | 中醫 NLP benchmark |
| zhongyi 中醫處方軟體 | 開源處方軟體 | 處方管理、開發參考 |

## 使用分工建議

- 查穴位：WHO 標準名 → acupoints.org（英）/ 雲端中醫（中）。
- 查方劑：香港浸大方劑圖像庫（結構最完整、中英）。
- 查病症：SFU TCM Knowledge Base（疾病↔治法↔方藥串接）。
- 查中藥現代藥理：萬方/中醫藥知識庫 → TCMSP / HERB / SymMap / TCMIP。
- 做 AI/資料集：ShenNong、BianCang、tcmoc、中文医学数据集整理頁。

## 下載 / API 現實

- 多數為「線上查詢」，完整免費下載或公開 API 少。
- 較可能可取用：中醫藥數據庫檢索系統、TCMIP（多為站內查詢/分析）、大學圖書館庫（常需授權）。
- 開源資料集（ShenNong/BianCang/tcmoc 等）多附可下載資料，但商用限制需先看授權。

## 已落地：CloudTCM 直連對照

`data/sources/cloudtcm_point_map.json`（361 標準穴）— code → CloudTCM 數字ID + 圖片檔名。
app 的「中文來源」已用此表直連 `cloudtcm.com/acupoint/{id}`，圖片連 `media.cloudtcm.uk/acupoint-s/{img}.jpg`。
重建方式：CloudTCM 是 Next.js 站，資料在 `/_next/data/{buildId}/meridian/{n}.json` 的 `Acupoint_List`；
若日後失效（buildId 改版），重抓 14 條經絡即可（meridian id：LU13 LI14 ST15 SP10 HT4 SI5 BL6 KI9 PC7 TE8 GB12 LR11 CV16 GV17；代碼別名 SJ→TE、LV→LR、REN→CV、DU→GV）。

---

## F. 工作流程（2026-07-03 修訂 — 資料集打底，不要純爬蟲）

原則：先拿別人已結構化好的地基，再用 AI 蓋自己的樓。分三層可信度：

**第 1 層 · 機構官方資料庫（可信度最高，適合 NCCAOM/AcuTing 引用出處）**
- 香港浸會大學「中藥材圖像數據庫」— 420+ 常用中藥，來源、性味功效、性狀鑑別。
- 香港理工大學「中藥資料庫」— ~400 種港澳常用中藥，含安全性。
- 香港中文大學「中藥方劑圖像數據庫」— 182 首常用方劑，組成、劑型、功能主治、方歌。
- 特性：機構維護、有審核；非整包下載，適合人工核對與當可靠出處。

**第 2 層 · 結構化開源資料集（可直接匯入，但一律當 draft，非最終真相）**
- 「中醫方劑知識庫」— 8 萬+ 筆方劑（名稱/出處/組成/功效/禁忌/製法），方劑資料原始源頭。
- `Mengqi97/chinese-medical-dataset`(GitHub) — 現存中文醫學資料集索引（含下載連結與樣本）；先從這裡挑與四科(FOM/ACPL/CH/BIOM)相關的直接下載。
- `AI-HPC-Research-Team/TCM_knowledge_graph`、`HerbiV` — 中藥-成分-靶點-方劑知識圖譜（網絡藥理）。**研究假說層級**，引用須寫「研究顯示可能與…相關」，不得斷言（同「經絡≠筋膜」標準）。

**第 3 層 · agent 補洞**：Codex 這類 agent 只用於「資料集裡缺的細節單獨去查」，不從零爬整個網站。

### 落地流程
1. 從 `Mengqi97/chinese-medical-dataset` 索引挑四科相關資料集，下載 CSV/JSON。
2. 方劑用「中醫方劑知識庫」打底；中藥用港三校資料庫人工核對。
3. 匯入 AcuTing OS（標 draft）後，用 AI 做二次加工：摘要、中英對照、串邏輯鏈（四診→病機→八綱→證型→治法）。
4. Codex 只補資料集沒有的洞。

### 內容誠信鐵則
- 資料集內容 = draft，需經機構庫或教材核對才升 source_checked。
- 網絡藥理/知識圖譜 = 研究假說，措辭保守。
- 不做過度醫療宣稱；區分 educational information 與 clinical decision。
