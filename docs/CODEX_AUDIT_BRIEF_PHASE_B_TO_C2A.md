# Codex 獨立審計簡報 — Clinical V2 Phase B → C2a(C2b 遷移的前置 gate)

**Branch**: `codex/pattern-v2` · **範圍**: commits `994d8b3` → `d00012f`
**角色**: 你是獨立審計者。Fable 的所有宣稱(含它自己的對抗性自審
`docs/AUDIT_PHASE_B_2026-08-12.md`)一律視為未驗證,重新實查。
**目的**: 你審完並給 GO 之後,C2b 才准動——C2b 含對 33 個真實病例的
case→patient 抬升遷移(不可逆),Ting 已核准但以你的 GO 為前置條件。

## 先讀(順序)
1. `docs/SPRINT_2026-08-12_BRIEF.md`(十條硬規則)
2. `docs/AUDIT_PHASE_B_2026-08-12.md`(Fable 自審——你要覆核它)
3. `docs/AI_WORK_HANDOFF.md` #1–#4(宣稱與證據索引)
4. `data/clinical_cases/schema.sql`(D17 表 + case_exposure_events)
5. `js/clinical-store.js` + app.js 的 `normalizeClinicalCase`/`normalizeSoapNote`

## 檢查清單(每項給 BLOCKER/HIGH/MEDIUM/LOW/PASS + 證據)

1. **三方一致性**:schema.sql D17 欄位 ↔ normalize 契約鍵 ↔
   `localstorage_sqlite_mapping.json` planned_mappings_d17,逐欄位比對。
2. **Append-only 不變量**:全 codebase 搜尋——除
   `applyExposureChange`/`createExposure` 外,是否存在任何直接寫
   `events` 陣列、改既有事件、或刪事件的路徑(含 Phase D UI:
   `saveAgentExposureFromForm`/`promptAgentExposureAction`)。
3. **檔案級 export→wipe→import 走查**(只用假資料!):建假 case 含
   agentExposures(≥3 events)+ environmentalExposures + lifestyleFactors +
   adverseEvents + patternDifferentials + role/confidence + relatedSymId →
   匯出 → 清掉該假 case → 匯入 → 逐鍵 diff。Fable 只驗過 load 路徑與結構推論。
4. **role⇔isPrimary**:save 路徑一致性 + 手改 import 檔可否造出分歧
   (M-1,建議你直接給 validator 規格)。
5. **K 系列 PHI validator**:`node scripts/validate-clinical-case-standard.js`
   須 exit 0;評估是否納入 validate.yml/ratchet(現在不在 CI)。
6. **Persist 膨脹**:load→save 會把 sparse 舊 case 膨脹成全 default shape
   (實測 77KB→123KB)。確認無內容損失、評估是否可接受(localStorage 5MB 上限,
   33 case 已 123KB,推估容量餘裕)。
7. **34→33 證據覆核**:`docs/AI_WORK_HANDOFF.md` #4 的解釋(Phase B 計數含
   case_d17test)是否成立;store 是否確實無 delete 路徑。
8. **C2a 衍生正確性**:`derivePatientsFromCases`——conflicts 記錄、latest-wins、
   無 code 跳過、對 33 真實 case 的 1:1 結果(僅讀!)。
9. **C2b 遷移計畫審查(最重要)**:C2b 尚未實作。請審 PROJECT_LOG 尾段的
   C2b 範圍(patients 落盤、guard 語意、picker、抬升遷移)並指定:遷移前備份
   要求、idempotency 要求、回滾路徑、驗收數字。你的 GO/NO-GO 直接決定 C2b 開工。
10. **Diff 範圍**:`git diff 994d8b3^..d00012f --stat`——只該動的檔案被動;
    curriculum/ 刪除檔與 js/knowledge.js、js/router.js 藥理 WIP 未被夾帶。

## 硬邊界(違反即中止)
- localStorage 有 **33 個真實病例**:只讀;測試一律用假 case 且事後清理並驗證數量。
- 禁 `git add -A`;不碰 curriculum/ 與藥理 WIP;不 push main;不部署。
- 回報逐項數字,禁「完成/100%」。

## 交付
把審計結果(每項分類+證據+C2b GO/NO-GO+遷移前置要求)寫進
`docs/AI_REVIEW_FEEDBACK.md` 最上方(STATUS 用 CONTINUE/PAUSE),加一段
PROJECT_LOG,commit(逐路徑)+ push 到 `codex/pattern-v2`。
