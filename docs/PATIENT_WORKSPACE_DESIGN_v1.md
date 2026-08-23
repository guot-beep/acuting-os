# 病人縱貫工作區(Patient Longitudinal Workspace)設計 v1

Status: **DESIGN(Fable,2026-08-11 Ting 指派)** → 認可後 Sonnet 實作。
獨立審計已點名:P4 checklist 引用的「Patient picker」在 app 中不存在 ——
本設計即補上這個缺口,且**今天就能用**(不等 C2b)。

## 1. 核心原則:一個資料橋,兩個世界

- **切換前(現在)**:工作區由 `derivePatientsFromCases()`(read-only,C2a
  已審)即時推導 —— 不落盤、不建 id、純視圖。
- **切換後(C2b GO 之後)**:同一 UI 改讀 staging envelope 的 patients
  (canonical id、pending sync 狀態可見)。
- 橋 = 一個 `getPatientsView()` 函式:`activeIsV2() ? envelope.patients
  : derivePatientsFromCases(cases)`,UI 全部只認這個出口。**UI 不知道
  自己活在哪個世界 —— 這正是 pointer-aware 契約的 UI 面延伸。**

## 2. 資訊架構(三層)

### 2.1 病人列表(新 workspace `#ws/patients`)
每列:patientCode · 推導姓名欄位(無,只有 code —— PHI 紀律)· 病例數 ·
最近就診日 · 追蹤中 metrics 數 · needsReview/conflict 旗標(推導衝突可見)。
排序:最近就診優先。搜尋:code。

### 2.2 病人縱貫頁(點入)
- **頭卡**:code、出生年段、性別、發表同意狀態、跨 case 的 demographics
  衝突(derive 的 conflicts 原样呈現 —— 不隱藏資料品質問題)。
- **跨 case 時間軸**:所有 case 的 visits + exposure events + AE 合併成
  單一泳道圖(重用 renderCaseSwimlanes,輸入改為合併後的 notes/exposures;
  各 case 以色帶區分)。**這是「Patient Over Time」的本體。**
- **Case 清單**:每 case 一卡(title/category/status/起始日/readiness 徽章
  縮版),點入既有 case detail。
- **跨 case 警訊聚合**:任一 case 的 safetyFlags、抗凝/腫瘤治療等
  advice-library 級 special 旗標,聚合顯示(去重)。
- **用藥/補充劑總帳**:跨 case 合併的 agentExposures 現況表(同 agentId
  多 case 出現 → 一列,註明來源 case)—— 這是「這個病人現在到底在吃什麼」
  的唯一總覽,安全價值最高。

### 2.3 快速動作
新病例(帶入 code)· 產生 AVS(最近 visit)· 產生 CARE 草稿 · 匯出此病人
資料(該病人全部 cases 的子集 export,沿用 v2 envelope 規格標 subset)。

## 3. 實作切分(Sonnet,兩批)

- **W1(視圖)**:getPatientsView 橋 + `#ws/patients` 列表 + 縱貫頁
  (頭卡/Case 清單/警訊聚合/用藥總帳)+ nav 入口。純 read-only,
  不新增任何寫路徑 —— 零 C2b 面接觸。
- **W2(整合)**:跨 case 合併泳道 + 快速動作接線(AVS/CARE 按鈕呼叫
  既有產生器邏輯的瀏覽器版)+ 病人子集 export。
- 驗收:31/31 + 60/60 套件不動;瀏覽器雙寬度實測;QA store 33 案
  (19 病人)渲染正確;conflicts 案例顯示 needsReview。

## 4. Dry Clinic 掛鉤

End-to-End Dry Clinic(Fable 親跑)以本工作區為主動線之一:
新病人 → intake → SOAP(針+藥)→ AVS → 診前頁往返 → 回診第二主訴
(多 case)→ 病人縱貫頁核對總帳 → export/restore 演練 → 月審。
發現的每個摩擦點記 docs/DRY_CLINIC_LOG.md,按「9/5 前必修/可後補」分級。
