# AI WORK HANDOFF(Claude → SOL)

## HANDOFF #20 — R11 五反例已修(E1-E5),等 R12;內容線今日收官

- **C2b gate 鏈現況**:R9 四 gate ✅ → R10 六反例 ✅ → **R11 五反例 ✅(6881f1e)**:E1 TOCTOU 錨定重讀、E2 revision 秩序(同 rev 只准 byte-equal noop)、E3 revision 型別鐵則×3 邊界、E4 pending↔null-FK 雙向互等、E5 結構化失敗碼 + app INCONSISTENT_STATE 唯讀鎖。rehearse-runtime-restore **42/42**(R9/R10/R11 反例全內建)。**等 Codex R12**(佇列已排)。
- **CR-010 detail 現況(live audit)**:full-detail **50** / partial 106 / skeleton 349(共 505)。SOL Batch 02 製作中(呼吸/感染線)。
- **方劑線**:26/58 順天堂樣板換課件真煎服法(warn 58→32),32 誠實待源;新旗標:formula.xie_xin_tang 名實不符(組成=半夏瀉心湯,repo 另有正牌 ban_xia_xie_xin_tang)待 Ting。
- 待 Ting 三件:葛根湯正方來源 / 反胃別名歸屬 / 瀉心湯重複卡處置。

---

## HANDOFF #19 — R9 NO-GO 修復進度(gates A-D)

- **A(pointer 三態)✅ 90522d0**:讀取例外/非法值一律 throw、零寫入;反例入 blocking test。
- **C(race/ID/collision/blank-FK)✅ 90522d0**:syncPendingPatients 改「先算完全部雜湊→重讀最新 envelope→全同步套用」(單執行緒下 lost-update 結構上不可能);canonicalPatientIdOf 與 migration 同鹽共用;collision fail-closed 留 pending;blank code 強制 patientId=null。31/31 測試(18 基礎+12 R9 反例,含 save-during-sync 注入)。
- **B(9 個呼叫點 commit-on-true)⏳ Sonnet 執行中**(codex/r9-gate-b):snapshot→mutate→persist===true 才 close/render/noteClinicalSave,失敗回滾 in-memory 並保留 editor;瀏覽器故障注入驗證。
- **D(revision-aware restore)📐 設計定案,Fable 下一段實作**:
  restoreV2Envelope 分兩型 —— migration-era(runtime_revision 缺/0):現行 plan-anchored 路徑不變;runtime-era(revision ≥1):改驗**自洽性**——journal/schema 形狀、patients↔cases 雙向整合(沿用 verifyStagingObject 的 referential 斷言)、R1-R8 invariants(checkClinicalInvariants)、對現有 staging 的 exposure append-only(exposureHistoryExtends 逐 case)、id/collision、blank→null、counts 自洽 —— **不再要求等同凍結 v1 plan**。新增 blocking rehearsal:switch→新增/編輯→pending sync→export→wipe v2 keys→restore→全量 canonical hash/unknown fields/events exact。
- 完成 B+D 後排 **Codex R10**(重跑其 9 情境 harness + 新 restore rehearsal)。
- 同輪已收:審計 UI 批(一碼多病例 confirm、drug.* picker 40 卡)、資料批(亂碼 3 修、junk 驗證器學會 U+FFFD/Cyrillic blocking + 順天堂共用劑量 58 筆 warn)。D18 LOCKED(Ting 接受 SQLite 條件觸發制)。



## HANDOFF #21 — 落地基礎設施 + 收斂審計現況(2026-08-11 晚)

- **C2b gate 鏈**:R9→R14 六輪,31+ 反例全入 blocking suite;唯一未收項 = R14-H1 已修(minimumEnvelopeShapeError 三邊界共用,rehearsal 60/60)待 Codex 收斂覆測(照佇列,無新 blocker 即 GO → P4 rehearsal,不開新輪)。
- **落地基礎設施**:main@ca2c45b9 已整合(d6356e6,ANCESTRY_OK);DEPLOY_CLOUDFLARE 落地條款改「當下重驗 ancestry」;CI 由 draft PR #59 啟動 —— exact-SHA 結果 PHI ✅/ratchet ✅/formula-standard ❌(10 有帳保留,擋 CI 的正是待 Ting 三裁定)。
- **CR-010**:full-detail **77**/300(Batch 01+02 全 ingested);live audit 檔已發布 data/research_staging/cr010_live/ 供 SOL Batch 03 真排序。
- **進行中**:Opus 全線卡片修整批(8 線抽樣眼讀)、UI/UX 美感易用批(atlas 基調內精修+雙寬度實測)。
- **待 Ting 四裁定**:葛根湯來源 / 反胃別名 / 瀉心湯名實 / 肺動脈高壓 vs 肺高壓中文名。

---

## ⛔ C2b 真機執行凍結(2026-08-11 獨立審計,Fable 已親驗)

docs/INDEPENDENT_AUDIT_2026-08-11.md 發現:**runtime load/save 不看 pointer**
(js/clinical-store.js load()/save() 直讀寫 v1;app.js export 卻看 pointer)。
照 P4 執行 pointer switch = 新病歷寫進 v1、export 輸出凍結 staging → 靜默分叉。
八輪審計皆審遷移機器,無人審切換後 runtime 契約。
**在 pointer-aware runtime 落地 + Codex R9 覆核前,禁止真機切換。**
GO 的四個 blob id 將因修復而失效 → R9 為新 gate。
配套修復佇列(審計 TOP-10):one-code-one-case 解鎖、persist try/catch+quota、
drug.* picker 接線、mojibake ×4、Sunten 樣板劑量 58 筆、SQLite 時程決策記錄。



<!-- 格式規則見 docs/AI_COLLAB_PROTOCOL.md。新 handoff 蓋在最上面,舊的往下推。 -->

## HANDOFF #18 — 知識庫全線里程碑(2026-08-11 晚)

| 線 | 現況 | 驗證 |
|---|---|---|
| cond.* | **505**(209 內容層 + 296 骨架 N4)| blocking 持平 425(全為既有債)|
| tdis.* | **75/75 全內容** | **0 defects(103→0 三批清零)** |
| pattern.* | registry 125 / library **128**(六經/衛氣營血/奇經 V2-D 全入)| 0 defects |
| sym.* | **102**(需求驅動:tdis 表現文字排序)| 0 defects |
| herb.* | **358**(F12 斷鏈 60→3)| PASS |
| formula.* | blocking 88→**11**(誠實保留:葛根湯誤植等)| ledger 記帳 |
| supp.* | 36 + interaction_focus 全覆蓋 + maturity 三級標準入驗證器 | PASS 0/0 |
| drug.* | 40 全 SPL 轉錄 + 證據檔誠實重建 | PASS 0/0 |

- 修復:sym.headache mojibake(головache 混種字,agent 眼讀抓到)
- 藍圖 R2/R3/R4 落地;R1 等 C2b 後
- 待 Ting:葛根湯正方來源、反胃別名歸屬、C2b 真機日
- 待 SOL:CR-010 detail 素材(它已在做)
- NEXT:cond detail 批(等 CR-010)、tdis 骨架擴充(需先做 T4 版 skeleton 帶出條款)

---

## TING 裁定(2026-08-11,內容目標澄清 — 對 Fable/Sonnet/SOL/Codex 一體適用)

- **西醫病名(cond.*)雙層目標**(2026-08-11 二次澄清):
  - **骨架層無上限**:500、2000 都歡迎 —— 名字先有,病例掛得上索引;有 demand 再製作內容。
  - **常用 300 要 detail**:完整內容(summary/紅旗/病因/病理/證型關聯),照現行 enrichment 管線逐批做。
  - 現況:187 張(含 detail 與 index-only 混合)。
- **其他線(tdis/sym/pattern/supp/drug/…)越多越好**:優先建立**完整架構
  與卡片框架(skeleton)**,讓病例先找得到索引;內容之後有時間再補深。
  skeleton 卡照各線模板的 skeleton 標準與 review_status 誠實標記,絕不假裝有內容。
- **CR 編號消歧義(2026-08-11,SOL 發現撞號)**:repo 是唯一權威 CR 註冊處。
  **CR-010 = conditions 常用-300 detail 素材 delta**(本檔 + RESEARCH_ASSET_INDEX +
  DO_NOT_USE_SUPERSEDED 三處一致)。別的對話裡出現過的「CR-010 = User
  Dashboard & Data Visualization MVP」是**頻道外定義,作廢重編**:該需求
  改登記為 **CR-015(User Dashboard & DataViz MVP)** —— 且註明其大部分
  已由 2026-08-11 優化衝刺交付(Visit Brief、Timeline 泳道、Outcome
  Tracking、quality 頁即時矩陣、首頁磁貼);剩餘缺口待 Ting 點名。
  今後 CR 編號只在 repo 發放,對話裡先討論、repo 落號才算數。
- **SOL 佇列序列化(2026-08-11 Ting 裁定:一次只做一個系列,不並行多系列)**:
  1. **現在只做 CR-010**:conditions 常用-300 detail 素材(現有 id 以
     data/pathology/condition_canon_shortlist.json 為準,只送 delta;
     Fable 的 COND_300_CANDIDATE_LIST_v0.md 可参考但你的清單為權威)。
  2. CR-010 交付後才開 CR-014(immunosuppressant 藥類 + supp ledger 缺口)。
  3. 之後才是 CR-013(CHM-CARE 逐項驗證)。
  未輪到的系列不要動;有疑問寫 AI_REVIEW_FEEDBACK.md 問,不要自行展開新系列。

## HANDOFF #17 — Pharm 證據鏈修復(Ting 核准 #1/#2)

- COMPLETED(fce078b):
  - mannitol setid:尿路沖洗標籤 → OSMITROL(Baxter IV),supersedes_setid 留痕;缺欄從正確 SPL 轉錄 + 專屬 field_sources
  - dailymed_api_responses.json 以新工具 scripts/refresh-dailymed-evidence.js 對 40 標籤當日實抓重建(LOINC 節碼盤點);過度宣稱清除,boxed-warning P0 防線恢復有效
  - 連帶發現並修復:69 個 field_sources/interaction anchors 用 PLR 節名指向非 PLR 標籤 —— 全部重對應到標籤真實存在的節(WARNINGS/PRECAUTIONS/DRUG_INTERACTIONS);BOXED_WARNING 設為無等價、不可冒充。validate-pharm-standard PASS 0/0、ratchet 無回歸
  - 方法論:證據檔灌水會遮蔽引用錯誤 —— refresh 工具往後可定期重跑(EVIDENCE_DATE 環境變數供重現)
- IN PROGRESS: 四線 —— herb F12 缺口(Opus)、tdis B、cond J-N、P1 previsit(Sonnet×3)
- NEXT: 待四線合併;SOL 收 CR-014

---

## HANDOFF #16 — C2b FINAL GO 後續 + supp 治理三件(Ting 裁定已回)

- CURRENT STATE: Codex R8 = **C2b FINAL GO(條件式)**,P4 真機 checklist 在 AI_REVIEW_FEEDBACK.md;等 Ting 選日真機執行。四線卡片併發中。
- COMPLETED:supp.lutein 來源修復(18f4336,NEI AREDS2 活連結,原 ODS 目錄連結不支持宣稱);SUPP_CARD_TEMPLATE 升級標準制定(skeleton/core/clinical_ready 逐項可機檢,Ting 授權)+ interaction_focus 欄位追認 + patient_education 欄位規格。
- NEXT(Fable):首頁 UI 專業化 + quality 頁假數據清理(Ting 指示);supp 驗證器教 interaction_focus。

```yaml
CONTENT_REQUEST:
  request_id: CR-014
  entity_id: data/pharmacology/pharm_drugclasses.json + data/supplements/supplements.json
  type: drug
  priority: P1
  needed_for: St John's wort 等關鍵 herb-drug interaction 掛載;Ting 長期追蹤+衛教需求
  missing:
    - "immunosuppressant 藥類完全缺席(33 classes 無此類):需 cyclosporine、tacrolimus 至少成類,含 class 定義、代表藥、CYP3A4/P-gp 機轉摘要(來源:FDA label / MedlinePlus)"
    - "St John's wort × immunosuppressant 的 known_concern 佐證(器官移植排斥案例文獻,經典為 Lancet 2000 cyclosporine 報告)"
    - "SUPP_VERIFY_LEDGER.md 內 7 個 CONTENT_REQUEST-ready 缺口逐項補來源(該檔已列明每項缺什麼)"
    - "NMN 劑量宣稱找可引用來源(現僅 PubMed 搜尋 query URL,不合格,劑量已依規留 null)"
  desired_output: MD source pack(逐項 URL + 支持句摘錄)
  target_staging_area: docs/research_packs/
  acceptance: [source-backed, 每 URL 需活著且原文支持該句, no invented claims]
```

---

## HANDOFF #15 — 優化計畫主項全數落地(v0/原型)+ 四線併發

- CURRENT STATE: Fable / codex/pattern-v2 f1d8f96 / OPTIMIZATION_PLAN 主項完成度:A ✓(27 metrics 含 PGIC)、P0.5 ✓、P3-lite ✓、B ✓(泳道圖)、C ✓(evidence debt)、P2 ✓(readiness 徽章 v0);唯 P1 診前手機頁尚未做(入口方案待定)
- COMPLETED(本段):
  - **CARE_READINESS_MAP_v0.md(726f773)**:CARE 2013 31 行 + STRICTA 13 行 = 44 資料點對映;CHM-CARE 專屬項發 CR-013 給 SOL 驗證(delta 單,引原文條號)
  - **P2 徽章(5330e6b)**:computeCareReadiness 可判定子集(CARE 18 基項 + 有針刺才計 STRICTA 2a-2g;AE 無列 = partial 永不 ok,D4);瀏覽器實測空 case 3%/QA case 14%/0 console error
  - **泳道圖(f1d8f96)**:SVG 多泳道 —— top-4 metrics 折線+值、exposure 事件條(D4 粗化日期空心點、停用條止於末事件)、AE 嚴重度標記;<2 個不同日期不顯示。合成資料驗證 4 lanes/4 dots/1 bar/1 AE
- IN PROGRESS: 四線併發 —— Sonnet×3(cond F-I、sym Batch D 心肺缺口、tdis Batch A:T10 搬移 28 + 高價值 20-25 卡辨證分型)+ Opus×1(supp 36 卡 interaction 驗證)
- RISKS: QA fixtures 全同日期 → 泳道圖在 preview store 看不到,真實病例(多次就診)才會出現 —— 不是 bug,是資料形狀
- NEXT: P1 診前手機頁契約設計(patient_prompt_zh/en 已備妥 27 metrics);合併四線批次後續派 cond J-N、sym E、tdis B
- ROUTING: Codex 照佇列 R8;SOL 收 CR-013 + 續 CR-010

---

## HANDOFF #14 — 學術欄位批次 + Cond B-E 合併 + Evidence Debt

- CURRENT STATE: Fable / codex/pattern-v2 / 優化主項連發中;兩個 Sonnet 批次在跑(cond F-I、sym Batch D 心肺血管缺口)
- COMPLETED:
  - **學術 readiness 批次(8d2a753,9/01 凍結前承諾)**:STRICTA 2010 item-2 五欄(needleCount/needleDepthText/deqiResponse/needleStimulation/needleTypeText,visit 層)、CARE item-12 patientPerspective、case 層 publicationConsent(+date,D4:"" = 從未詢問,絕不捏造)、metric.pgic(IMMPACT 1-7,新 category "global")接入 numeric config 即獲表單欄位。schema.sql + mapping 同步 additive。Phase E 12/12、invariants 0 violations、app syntax OK
  - **Cond B-E 合併(9ebd671)**:Sonnet 產 20 概念(3 enrich + 17 new),conditions 153→170、clean 4→23;ratchet BETTER 577→539(conditions)、220→0(patterns),baseline 已鎖。cond.heart_failure 帶 1 個 pre-existing C5(心律不整內容錯置,依 §0 不刪,待專門搬移批次,可能歸 cond.palpitations)。旗標:DVT↔PE 等 condition↔condition 結構化關聯欄位不存在(只能放 differential 散文)—— 要不要加入 schema 屬架構決定,留給 Ting/9月後
  - **Evidence Debt 計分(SOL 方向 C)**:scripts/evidence-debt.js —— score = 使用頻率 ×(1+AE同現+interaction缺漏)× 卡片缺漏度;欄位表逐 section 對過 bundle 實形(pattern.* 在 patternLibrary,tcmPatternCanon 是 pat.* 另一群 —— 初版誤用同一欄位表把齊卡判成 100% 缺,已修)。33-case 實測:目前使用中實體無 debt(卡皆齊)
- IN PROGRESS: Sonnet×2(cond F-I 續批、sym Batch D:dyspnea/chest_pain/syncope/hemoptysis 等 cond 卡指到的註冊表缺口)
- NEXT: pharm validator 版本調和(impl 分支 731 行版)→ CHM-CARE 61 項對映表(P2 前置)
- ROUTING: Codex 照佇列 R8(桌面 app 派工被 IME 視窗擋,佇列檔為準);SOL 續 CR-010 delta

---

## HANDOFF #13 — Sym Batch C 合併 + P3-lite Practice Audit 落地

- CURRENT STATE: Fable / codex/pattern-v2 / sym 合併 460a2a1 + audit 腳本 / 優化主項執行中
- COMPLETED:
  - **Sym Batch C 合併**(Sonnet 產、Fable rebase+ff-merge+眼讀抽查):31 新 sym.* 卡,18→49;validate-symptom-standard 49/49 clean 0 defects;ratchet PASS;content-junk PASS;bundle 重建無 diff。命名裁定:反酸/反流 → canonical 反酸(反流入 aliases);癃閉/尿瀦留 → canonical 尿瀦留(癃閉入 aliases)。N3×4 = reflux/regurgitation 共用吞嚥困難紅旗(真實共同臨床事實,留待裁定是否入 generic_red_flag_map)
  - **P3-lite 月度 Practice Audit**(scripts/practice-audit.js):去識別化聚合報告 —— patients/cases/visits、outcome completion %、療效判定計數、median pain/sleep 首末差、AE rate+by modality、top10 patterns/points/formulas、知識缺口(高使用×無卡,比對 bundle)。CI fixture + 33-case 備份實測輸出正常(19 patients/38 visits/84% completion/median pain -3)
- IN PROGRESS: cond enrich B-E Sonnet 批次仍在跑;C2B-R8 佇列待 Codex(桌面 app 被佔用,派工延後——佇列檔已在 repo,Ting 說「照佇列」即可)
- NEXT: Timeline swim-lane 原型(優化清單次項)→ CARE readiness
- ROUTING: SOL 續 CR-010 delta(conditions→300);Codex 照佇列 R8

---

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
