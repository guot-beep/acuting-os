# AI WORK HANDOFF(Claude → SOL)

<!-- 格式規則見 docs/AI_COLLAB_PROTOCOL.md。新 handoff 蓋在最上面,舊的往下推。 -->

## HANDOFF #4 — Phase D batch 1 + SOL Phase C 三項全解 + Cloudflare 認證邊界

### CURRENT STATE
- agent/model: Fable(審核+修正)+ Sonnet(batch 1 實作);branch `codex/pattern-v2`;HEAD `ba8b1bd` + 本 commit
- REVIEW_ACKNOWLEDGED: **yes**(SOL Phase C review 三項,經 Ting 轉達)

### RESPONSE_TO_REVIEW(SOL 三項,全解,commit `ba8b1bd`)
1. **時間戳**:normalizer 兩處 `createdAt || new Date()` 改為 `|| ""` ——
   歷史缺失時間戳保持缺失;只有 applyExposureChange 寫入路徑蓋新戳。
2. **初始事件**:新增 `store.createExposure()`(API 層強制第一筆事件 =
   started|initial_recorded;夾帶 events 會被剝除,實測);新增
   `initial_recorded` 語意(intake 時已在用 ≠ started,表單有「已在使用」勾選);
   legacy events=[] 誠實保留,絕不回填。
3. **34→33 查明**:34 = 33 真實 + 1 個 `case_d17test` 測試病例(Phase B 首次
   round-trip 測試在清理前計數,回報時誤標為「34 legacy」)。證據:現存 33 個
   id 全列(見 git blame 本檔)、0 測試殘留、52 SOAP 總數不變、store 無任何
   delete 路徑。**是回報錯誤,不是資料遺失。**
- Phase D batch 1(Sonnet):ledger UI 全走 applyExposureChange(Fable 逐段審過);
  live 測 3/3 事件、33/33 病例、0 errors;build-site 16 files。
- Sonnet 另發現:persist 會把 normalize 後的完整 shape 回寫(77KB→123KB,
  純 default 欄位膨脹,無內容損失)——屬 pre-existing 行為,列 Codex 確認項。

### CLOUDFLARE(獨立軌,停在認證邊界)
- 本機 = Windows ARM64:wrangler/workerd 不支援(whoami/login 都不能跑),
  且本機零 Cloudflare 憑證 → Step 1 本地 deploy 不可行,**這不是可繞過的問題**。
- 唯一需要 Ting 的單一動作:建 API token(Workers Builds Configuration: Edit +
  Workers Scripts: Edit),以 `CLOUDFLARE_API_TOKEN` 環境變數提供。之後
  trigger 修復 + main production build + smoke test 全部可經 REST API 自主完成。
- DEPLOY_CLOUDFLARE.md 已更正(trigger 必須自帶 build command;jsonc 是第二保險)。

### NEXT INTENDED TASK
**Phase C2:Patient 實體 wiring(Fable,高風險里程碑)**——SOL 路由確認的順序。
設計先行(case→patient 抬升的資料遷移是本 sprint 最危險變更),完成即 Codex audit。

### ROUTING RECOMMENDATION
- Fable 留:C2 Patient wiring 設計+實作
- Sonnet 接:C2 之後的 Phase D 主力(SOAP 內 lifestyle/adverse-event 列;
  不依賴 Patient 所有權的部分可先備)
- Codex 審:B 檢查表 + persist 膨脹行為確認 + createExposure 不變量
- Antigravity:待 supp 卡模板;Opus review needed: no
- SOL:Cloudflare token 一到就通知(經 feedback 檔),我接手 API 修復

---

## HANDOFF 2026-08-12 #3 — Phase C 完成(薄 repository 層)

### CURRENT STATE
- agent/model: Claude Fable 5;branch `codex/pattern-v2`;HEAD `af52eb8`
- phase: Phase C 完成(依鎖定定義:薄抽象+遷移路徑文件;SQLite 實裝不在 9/5 範圍)

### COMPLETED SINCE LAST HANDOFF
- `af52eb8`:`js/clinical-store.js`(零 DOM 依賴,node 可測)——
  storage seam(app.js load/persist 兩處委派,保留直讀 fallback 防清空)、
  `applyExposureChange()`(ledger 唯一認可變更路徑;append-only 的機器強制面,
  回應審計「靠紀律」缺口)、軌跡查詢(getOutcomeHistory/getLifestyleHistory/
  getExposureTimeline/getCurrentExposures,Patient Now/Over Time 與 Phase E 的資料來源)
- `docs/MIGRATION_LOCALSTORAGE_TO_SQLITE.md` 補 Phase C 記錄:遷移面=兩個 seam
  呼叫點 + setBackend(adapter)
- 驗證:node 單元測試(append-only 成立、舊事件不可變、非法 eventType throw、
  快照隨事件更新、pain 8→5 軌跡);live:兩 seam 走 store、33 個真實病例無恙、
  0 console errors;build-site 16 files(store 自動入 dist);app.js+store `node --check` PASS
- 讀 AI_REVIEW_FEEDBACK.md:尚無 SOL review(REVIEW_ACKNOWLEDGED: n/a)

### IN PROGRESS
- 無半成品。

### RISKS / QUESTIONS
- UI 目前尚無任何呼叫 applyExposureChange 的表單(Phase D 才有)——invariant
  已可強制但還沒有消費者
- Phase C2(Patient wiring)仍未開始,列高風險里程碑

### NEXT INTENDED TASK
Phase D 最小捕捉 UI —— **建議 ROUTE TO SONNET**(契約全鎖:B2 鍵名 +
applyExposureChange 為唯一 ledger 寫入路徑 + M-3 雙軌規則)。
Phase C2 Patient wiring 留 Fable,排在 Phase D 首批之後。

### ROUTING RECOMMENDATION
- Fable 留:Phase C2 Patient wiring、med→drug 閘門
- Sonnet 接:Phase D 表單(agent ledger + adverse event quick-add + lifestyle 行)
- Codex 審:維持 #2 的五點 + 本次 store seam(fallback 行為、applyExposureChange 不變量)
- Antigravity:不變;Opus review needed: no

---

## HANDOFF 2026-08-12 #2 — 對抗性審計完成:1 BLOCKER 已修,PHASE C 解除 HOLD

### CURRENT STATE
- agent/model: Claude Fable 5;branch `codex/pattern-v2`;phase: Phase B 審計+修正完成
- HEAD: 本 commit(前一實作 commit `858e6f0` 審計報告)

### COMPLETED SINCE LAST HANDOFF
- `858e6f0` 對抗性審計 `docs/AUDIT_PHASE_B_2026-08-12.md`:12 項檢查,
  1 BLOCKER(B-1 ledger 就地更新不可重建歷史,違反 D17 §5)、2 HIGH
  (H-1 certainty 無痕晉升通道;H-2 B1 把 K 系列 PHI validator 弄紅)、3 MEDIUM、2 LOW
- **RESPONSE_TO_REVIEW(本 commit)**:
  - B-1/H-1 修正:schema 新增 `case_exposure_events` append-only 事件表
    (parent_type agent|environmental);契約新增 `agentExposures[].events[]` /
    `environmentalExposures[].events[]`;寫入規則=改快照必 append 事件,事件永不改刪
  - H-2 修正:mapping changelog 改月精度 → `validate-clinical-case-standard.js` exit 0
  - 驗證:live 實測審計指定情境 **200mg→400mg→stopped 3/3 事件保留、兩個歷史劑量
    皆可重建**;suspected→confirmed 晉升 trail 含來源 note;0 console errors;
    app.js `node --check` PASS;K 系列 exit 0
- M-1(role⇔isPrimary validator)、M-3(Phase D 雙軌規則)記入待辦,不擋 Phase C

### RISKS / QUESTIONS
- 事件層的 append-only 不變量目前靠 app 寫入紀律,無機器強制——Codex 複核重點
- M-2:relatedSymId 是指向空 sym.* 命名空間的 forward reference,政策待寫明

### NEXT INTENDED TASK
**PHASE C: SAFE TO PROCEED**(HOLD 解除)——薄 repository 抽象 + 遷移路徑文件。
開工前照協議 re-check 本檔上方是否有 SOL 新 review。

### ROUTING RECOMMENDATION
- Fable 留:Phase C;Sonnet 接:Phase D UI(契約含 events[] 寫入規則)、M-1 validator
- Codex 審:audit 報告結論五點(檔尾)+ B-1 修正的 append-only 驗證
- Antigravity:不變;Opus review needed: no

---

## HANDOFF 2026-08-12 #1 — Phase A+B 完成,等 Codex/SOL 審後進 Phase C

### CURRENT STATE
- agent/model: Claude Fable 5(architecture lead + router);B3 由 Sonnet 5 實作
- branch: `codex/pattern-v2`(與 origin 同步;main 是祖先,落地=fast-forward)
- HEAD: `c6a052f`
- last meaningful implementation commit: `c6a052f`(B3 詞彙種子)
- phase: Phase B 完成;Phase C 未開始
- task: 安裝 AI 協作協議(本 commit)+ 首份 handoff

### COMPLETED SINCE LAST HANDOFF(= sprint 開工以來)
- `994d8b3` B1 schema:`case_agent_exposures` / `case_environmental_exposures` /
  `visit_lifestyle_factors` / `visit_adverse_events` / `visit_pattern_differentials`
  五張空表 + `visit_tcm_patterns.role/confidence` + `visit_outcomes.related_sym_id`;
  `localstorage_sqlite_mapping.json` 加 planned_mappings_d17(7 條)
- `96fa790` Phase A:Cloudflare root cause 修復(wrangler.jsonc 自帶
  `build.command`;dist/ gitignored 是失敗根因)+ `docs/SPRINT_2026-08-12_BRIEF.md`
  + `docs/DEPLOY_CLOUDFLARE.md`(Ting 待核對四項 Dashboard 設定)
- `6569eaa` B2 localStorage 契約:case 層 `agentExposures[]`(單一縱向時間線)
  `environmentalExposures[]`;visit 層 `lifestyleFactors[]` `adverseEvents[]`
  `patternDifferentials[]`;`tcmPatternSelections[].role/confidence`;
  `outcomeMetrics[].relatedSymId`(upsert 保留)
- `c6a052f` B3 五個詞彙檔:supplement_category(8)lifestyle_factor(26)
  exposure(9)adverse_event(8)modality(8)
- validators:build-data PASS · content-junk PASS · ratchet PASS 無回歸 ·
  app.js `node --check` PASS
- live 驗證:D17 七鍵經 normalize→save→reload 往返 7/7 保留;0 console errors;
  34 個既有病例無回歸。export=全物件序列化、import=同一 normalizer
  (`importClinicalCases` → `map(normalizeClinicalCase)`)→ 新鍵結構上不會被
  備份遺漏;完整檔案級 export→wipe→import 走查排在 Phase E 假病人測試。

### IN PROGRESS
- 無半成品。所有已 push 內容已驗證。
- 未驗證區:五個詞彙檔尚未接進 build-data readJson(刻意延後,跟 UI 一起接);
  `visit_tcm_patterns` role 的 root|branch 值只保留未啟用。

### RISKS / QUESTIONS
1. 舊 `visit_western_medications`(逐次快照)與新 `case_agent_exposures`
   (縱向帳)並存——遷移閘門(D15/D17)之後新 Visit 只寫後者,語意請 SOL/Codex 確認。
2. PHI validator 是否需要掃五個新鍵的自由文字欄位(notes/nameText)——待 Codex。
3. Patient 實體仍未 wiring(intake 資料在 case 層)——列為 Phase C2 獨立高風險
   里程碑,做完立刻 Codex audit。
4. Cloudflare Dashboard 四項設定尚待 Ting 核對(docs/DEPLOY_CLOUDFLARE.md)。
5. 工作樹有無主 js/ 藥理 WIP(+96/+2 行)與 curriculum/ 刪除檔——不碰。

### NEXT INTENDED TASK
Phase C:薄 repository 抽象(`js/clinical-store.js` 之類,包住 localStorage 的
createCase/saveVisit/getPatientTimeline/saveExposureChange 等)+ 遷移路徑文件。
SQLite 實裝**不在** 9/5 範圍。開工前會先讀 AI_REVIEW_FEEDBACK.md。

### ROUTING RECOMMENDATION
- Fable 留:Phase C 抽象層設計與實作、Phase C2 Patient wiring、med→drug 閘門
- Sonnet 接:Phase D 捕捉 UI 表單(契約=B2 鍵名,已鎖);詞彙檔接線 build-data
- Codex 審:**現在**——commits `994d8b3`→`c6a052f`(schema/契約/mapping 一致性、
  export 完整性、PHI 掃描範圍、role⇔isPrimary 不變量)
- Antigravity 接:supp.* 骨架卡批量(等 Codex 審過 + supp 卡模板定案後)
- Opus review needed: no(目前無架構分歧)

### REVIEW ACK
- LAST_CHATGPT_REVIEWED_SHA: none yet(協議剛安裝,等首輪 review)
- REVIEW_ACKNOWLEDGED: n/a
