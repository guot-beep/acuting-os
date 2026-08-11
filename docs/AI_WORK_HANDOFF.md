# AI WORK HANDOFF(Claude → SOL)

<!-- 格式規則見 docs/AI_COLLAB_PROTOCOL.md。新 handoff 蓋在最上面,舊的往下推。 -->

## HANDOFF #12 — Codex R7 cleanup gate 修正(REVIEW_ACKNOWLEDGED: yes)

- LAST_CODEX_REVIEW: 5b764d8(P3.1/2/4 PASS;P3.3 FAIL:cleanup 吞錯後仍 ok:true、candidate 殘留)
- RESPONSE_TO_REVIEW(本 commit):cleanupCandidate 回傳 {ok}/{ok:false,error}(一次 retry 額度);成功路徑順序改為「cleanup 先行且確認成功 → 才 active swap」,cleanup 失敗即 {ok:false} 且 active/pointer 不動;失敗路徑的 cleanup 失敗附註進 failures,絕不吞錯回 ok:true。rehearse 6j = 你的注入(removeKey 持續拋錯):結構化 fail、swap 未發生(注入的 backend 對 active write 直接 throw 以證明)、active/pointer 不變 —— 3 斷言 PASS;三來源 rehearsal 全綠、Phase E 12/12。
- NEXT: C2B-R8 已排佇列(cleanup gate 單點 + 若 4/4 PASS 發布 P4 final GO)

---

## HANDOFF #11 — Codex R6 interruption 反例修正(REVIEW_ACKNOWLEDGED: yes)

- LAST_CODEX_REVIEW: 50a915e(P3.1/2/4 PASS;P3.3 FAIL:active 替換 write 失敗時 Promise reject 外洩、candidate 殘留、app 無 .catch)
- RESPONSE_TO_REVIEW(本 commit):restoreV2Envelope 全段 fail-closed —— candidate write/plan/hash/active 替換/cleanup 全部 try-catch 收斂成 {ok:false,failures},candidate best-effort 必清;app.js 補 .catch 縱深防禦(alert、不 reload)。rehearse 6i = 你的注入反例(active 替換 writeKey 拋錯):ok:false 無外洩、active/pointer 不變、candidate 清除 —— 4/4 PASS;三來源 rehearsal 全綠、Phase E 12/12。
- NEXT: C2B-R7 單點覆核已排佇列 —— 重跑你的 interruption 注入;4/4 PASS 即發布 P4 final GO

---

## HANDOFF #10 — Codex R5 P3.3 修正(REVIEW_ACKNOWLEDGED: yes)

- LAST_CODEX_REVIEW: edb2040(P3.1/2/4 PASS,P3.3 FAIL:app 匯入未驗證即覆寫 active staging)
- RESPONSE_TO_REVIEW(本 commit):照你的修正 gate 逐項——
  - buildMigrationPlan 搬入 store(單一來源;migrate-c2b CLI 委派,self-test 7/7 不變)
  - 新增 restoreV2Envelope:candidate key → 以「當下 v1 raw + 重建 deterministic plan(adjudications 取自 envelope.journal)」呼叫同一 verifyStagingObject → 全綠才原子替換;任何失敗保留原 staging/pointer、清 candidate、不 reload
  - app.js v2 匯入改走此唯一路徑(browser subtle sha256);拒絕時 alert 失敗清單
  - rehearse 6h:你的竄改 envelope 反例經同一函式必拒(active untouched、candidate cleaned)+ 合法 envelope 成功;rollback/白名單斷言涵蓋 candidate key
  - 全套:fixture/2-case/33-case rehearsal 三來源 PASS;Phase E 12/12;app/store/migrate syntax OK
- NEXT: C2B-R6 已排佇列 —— P3.3 單點覆核 + 若 4/4 PASS 發布 P4 final GO

---

## HANDOFF #9 — Codex C2B-R4 三 FAIL 全修(REVIEW_ACKNOWLEDGED: yes)

- LAST_CODEX_REVIEW: dbeb9c5(P3.1/P3.2/P3.3 FAIL、P3.4+Batch3 PASS、NO-GO 維持)
- RESPONSE_TO_REVIEW(本 commit):
  - P3.1:verifyStaging 以 deterministic plan 為必要錨 —— journal 四欄(version/bytes/counts/adjudicationsApplied)逐項對 plan;無錨驗證直接拒絕
  - P3.2:patients 對 plan 深度 parity(九欄+conflicts+needsReview+caseIds);assignments 逐 case 對 plan;executeMigration 的 noop 以完整 verify 為前提,壞 staging fail closed(throw)
  - P3.3:export 在 pointer=v2 且 staging 缺時中止(不再 fabricate patients:[]);import 對 v2 envelope 絕不降級 —— v1 世界拒收、v2 世界完整還原 staging(journal+patients+cases);rehearse 新增檔案級 export→wipe→import→full-verify→canonical-hash 相等
  - Codex 三反例(journal counts 999、patients[0] occupation 竄改、tampered-noop)+ 無錨拒絕全部內建 rehearse,三來源(fixture/2-case/33-case 隔離副本)全週期 PASS;Phase E 12/12 不變
- NEXT: C2B-R5 覆核已排佇列;SOL 優化共識已收,計畫文件隨後 commit

---

## HANDOFF #8 — SOL BLOCKER(Case↔Patient referential integrity)已修(REVIEW_ACKNOWLEDGED: yes)

- SOL 發現(經 Ting 轉達,亦符合其 CONTINUE/PAUSE 指示):verifyStaging 只驗 patientId「存在」不驗「正確」——互換兩個 valid patientId 可通過。確認為真 BLOCKER。
- RESPONSE_TO_REVIEW(本 commit):verifyStaging 加三條 referential assertions(nonblank code 必有 patientId;patientById.patientCode === case.patientCode;blank code 必為 null)+ Patient.caseIds 與實際指向 case 集合 exact 相等(雙向鎖)。
- Adversarial fixtures 進 rehearse-c2b:swapped-patientId(≥2 patients 時)與 blank-code-with-patientId,三個來源實測——fixture(skip+blank PASS)、Edge copy(2)與 preview copy(33)swap 均被抓、全週期仍 PASS;Phase E 12/12 不受影響。
- 遵照 SOL:真實 pointer switch 維持 PAUSE;Codex 針對此 gate 的覆核已含在 C2B-R4(進行中),其 adversarial 覆測要求已由 rehearse 腳本內建。

---

## HANDOFF #7 — 內容請求直送 SOL(Ting 授權的 app 直接通道首次使用)

CONTENT_REQUEST(已於 ChatGPT app「AcuTing OS Git Review」對話直接送達 SOL,納入其第二包 ZIP):
- CR-001(P0):sym.* 種子研究包 —— 28 候選 × {id, name_zh/en, tradition(both 判準), western_term, body_region(13 選 1), red_flags+來源, related_metric_ids} → SYM_SEED_RESEARCH_BATCH_B_v1
- CR-002(P1):metric.* 定義包 —— 候選中 repo 未有者,EXACT outcome_metrics shape + 測量慣例+來源 → METRIC_DEFINITIONS_v1
- CR-003(P1):supp.* 骨架批次一 —— 18 項 × {id, 雙語名, 八分類, common_forms, dose range+來源, 安全/交互(標抗凝/免疫抑制/甲狀腺), evidence snapshot} → SUPP_SKELETON_BATCH_01_v1
- 驗收:RESEARCH STAGING 標頭、逐筆來源、uncertain 明標、無 PHI;交付=ZIP,Fable 自行至對話框收檔→解壓→驗證→commit(不自動 canonical)
- SOL 的 4-pack(Patient Wiring/Test Scenario/Selector/Ingestion Contract)已批准同包交付;衝突以 repo schema/DECISIONS 為準

---

## HANDOFF #6 — Codex 重審(e5d6158)全 gate 回應(REVIEW_ACKNOWLEDGED: yes)

- LAST_CODEX_REVIEW: commit e5d6158(PAUSE / C2b 仍 NO-GO;R8 兩個 false negative、coverage=0 無牙綠燈、source_bytes 非 byte、needsReview 非 null)
- RESPONSE_TO_REVIEW(本 commit):
  - gate#1 R8 結構化比對:store.exposureHistoryExtends(逐 index id+canonical payload 相等,append 只准接尾),R8 CLI 與 app merge guard 共用;Codex 兩個反例(evt-1→evt-10、同 id payload 改寫)現在都 FAIL,合法 append PASS —— node 與 live 雙重驗證
  - gate#2 CI 覆蓋:data/clinical_cases/sample_export_fixture.json(app-export shape、全虛構、3 selections/2 exposures/5 events/3 lifestyle)進預設掃描 + coverage=0 即 FAIL 斷言;K 系列 DATE_FIELDS 補 camelCase 日期欄(visitDate/resolvedDate/createdAt/updatedAt),生日欄仍不豁免
  - gate#3 migrate-c2b:source_bytes 改 Buffer.byteLength(中文 fixture 85 vs 83 實證);needsReview 欄位落 null;--adjudications 輸入 + adjudicationsApplied journal;duplicate case id / patient id 碰撞 fail closed
  - 註:import 前 R1–R7 gate 與 CI 接線在你 endpoint(7830ba4)之後已落地 —— ee00856(pre-persist gate)與 ef1b58b(validate.yml 兩步,經 web editor byte-verified)
  - mapping status 刷新:contract_landed、note 鍵已在契約(隨本 commit)
- NEXT: 等 Codex 下一輪 gate 覆核;C2b 真實執行仍 NO-GO
- ROUTING: Fable=待重審;Sonnet=idle;Codex=覆核 gate#1-3;Opus=no

---

## HANDOFF #5 — Codex 審計全項回應(REVIEW_ACKNOWLEDGED: yes)

- LAST_CODEX_REVIEW: commit `ae91a7e`(PAUSE / C2b NO-GO,1 BLOCKER·4 HIGH·3 MEDIUM)
- RESPONSE_TO_REVIEW:
  - HIGH#8 → `23b310d`(derivation:+birthYear、canonical set compare、conflict 來源、needsReview)
  - MED#4+HIGH#2 spec → `23b310d` scripts/validate-clinical-invariants.js(R1–R8+--prefix-check)
  - HIGH#1 → `23b310d` mapping 逐欄(對照表逐數一致)+ note 裁決 ADD
  - BLOCKER#9 → `23b310d` docs/C2B_MIGRATION_PLAN.md(A–D 全落;C2b 維持 NO-GO 待重審)
  - HIGH#6 → `b90cd7c`(讀路徑零合成;save 站僅新記錄蓋戳)
  - HIGH#2 → `b90cd7c`(import merge/restore;merge 強制 prefix-extend;restore 雙確認+自動備份)
  - batch-2 WIP → `5e58867` 審核落地;實作者遺留假病例已清(34→33,證據入 log)
- 未結:R1–R5 接進 import 前驗證與 CI/ratchet;MED#7 的 raw backup preflight 屬 C2b 計畫 A 段
- NEXT: 等 Codex 對計畫+修正重審;期間可做 migrate-c2b.js dry-run(假資料)
- ROUTING: Fable=migrate-c2b.js;Sonnet=R1–R5 import 接線+CI wiring;Codex=重審;Opus=no

---

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
