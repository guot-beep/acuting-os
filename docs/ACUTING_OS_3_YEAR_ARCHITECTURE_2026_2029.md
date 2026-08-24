# AcuTing OS 三年架構藍圖 2026–2029

**Status: PROPOSED**(2026-08-11,Fable 起草;未經 Ting 批准前不據此改任何 schema)
**權威順序:CURRENT repo schema / DECISIONS / validators > 本藍圖。**
本文件不阻塞現行生產線(cond/sym/tdis/supp);不授權任何立即 schema 變更。

## 0. 不可動搖的原則(全文適用)

1. Patient → Case → Visit 是永久核心骨架。
2. Western Condition / TCM Disease / Pattern / Symptom **永不一對一等同**(D17)。
3. PHI 絕不進 GitHub knowledge layer。
4. Longitudinal data = snapshot + append-only event/history(D17 §5)。
5. Analytics 只做 association,不做 causation。
6. AI 不自動生成 diagnosis / pattern canonical truth(D17 §6)。
7. Migration / export / restore 持續可逆、可驗證(C2b 全鏈已示範標準)。
8. 不 over-engineer:今天只保證「不堵死未來」,不預建未來。

## 1. 六層架構

### L1 Clinical Record Layer(私有,localStorage → 未來 SQLite)
現況:Case(含 intake/demographics/agentExposures ledger + events[])、
Visit=SOAP note(S/O/A/P、tcmPatternSelections、outcomeMetrics[]、
lifestyleFactors[]、adverseEvents[]、STRICTA 五欄、patientPerspective)、
Patient(C2b staging,FINAL GO 待真機)、publicationConsent。
- **ClinicalEvent**:不建表。現有每類 row 已自帶 id/日期/型別/出處 ——
  未來的統一 event 流是**投影(projection)**,不是新表。
- **OutcomeSeries**:getOutcomeHistory() 已是 series 投影;未來院外自量
  (wearable/自填)落 `case.measurements[]`(名稱今日保留,實作 LATER)。
- AE / med-supp history:已達標(severity/onset/resolution;exposure ledger)。

### L2 Knowledge Layer(公開,GitHub repo)
11 命名空間全部已存在(cond/tdis/pattern/sym/metric/point/formula/herb/
drug/supp/modality),各有 template+validator+ratchet。雙層策略(Ting
2026-08-11):骨架無上限、常用集 detail。pattern 線按
PATTERN_LINE_RECONCILIATION_v0 收斂三庫。

### L3 Evidence Layer
現況已有雛形:field_sources(pharm,machine-parseable `dailymed:setid#SECTION`)、
sources/safety_review_sources(sym)、red_flag_refs、dose_source.verified、
refresh-dailymed-evidence.js(證據檔可再生)、Evidence Debt 計分(scripts/evidence-debt.js)。
- **EvidenceClaim** 正規化表:LATER。現行 per-field anchor 慣例即是它的
  序列化形式,未來一支腳本可彙整成 claims 表,零 migration。
- 今日唯一該做的:**把 field_sources + retrieved-date 慣例寫進所有 card
  template**(docs 變更,見 §4 保留點 R2)。

### L4 Analytics Layer(去識別聚合)
現況:practice-audit.js(月審)、evidence-debt.js、Visit Brief、泳道圖、
Outcome Tracking(CG8)。全部走「讀 export → 聚合 → ids+counts only」模式。
- **CohortQuery contract**:LATER(24-36m)。前提只有「export 完整性」,
  v2 envelope + unknown-field 保留已滿足 → 無需今日動作。
- seasonal/environment overlays:exposure.* 命名空間與 event 日期已足夠,LATER。

### L5 Learning Layer
現況:LL1 按語(reflection/differential/ifIneffective)、LL2 outcomeVerdict、
知識缺口(audit/debt 腳本)。
- **KnowledgeUsage / LearningEvent**:LATER(12-24m)。使用頻率今天已可
  從 store 推導(evidence-debt 證明);lookup 級記錄是未來新增的捕捉點,
  從零開始即可,不需回溯資料 → 無需今日保留。
- adaptive review / spaced retrieval / board↔clinical:全 LATER,
  依賴 KnowledgeUsage 先存在。

### L6 Research / Publication Layer
現況:CARE_READINESS_MAP_v0(44 資料點)+ P2 徽章(live)、
publicationConsent(+date)、STRICTA 欄位、PGIC、CR-### 請求紀律、
Research Queue = evidence-debt 輸出。
- **ResearchTask**:CR-### 已是它的 id 紀律;結構化表 LATER。
- **PublicationExport**(CARE 草稿產生器):6-12m,資料依賴已全數落地。
- de-identified cohort export:24-36m,依賴 CohortQuery。

## 2. 時間切分

### 0–6 個月(2026-08 ~ 2027-02)— 臨床立足
C2b 真機遷移(FINAL GO 已發,等 Ting 在場執行)· Pre-Visit Mobile(已落地,
等入口裁定)· Visit Brief(live)· Patient→Case→Visit(C2b 後)·
metrics/outcomes(27 metrics live)· exposure/AE(live)· full export/import
(v2 envelope live)· timeline 泳道(live)· 月審腳本(live)·
知識庫雙層衝刺(cond 500 骨架/300 detail、tdis 清零、pattern 對齊)。

### 6–12 個月 — Clinical Intelligence(association only)
treatment-response overlays(方/穴/supp 變動 × outcome 斜率,泳道圖疊層)·
pattern evolution 檢視(tcmPatternSelections 時序)· relapse/response
durability(effect_duration_days + verdict 序列)· seasonal/exposure overlays ·
CARE 草稿產生器 v1。資料依賴:真機病例累積(9 月開診後自然成長)。

### 12–18 個月 — Evidence 迴圈自動化
KnowledgeUsage 捕捉(lookup 級,additive)· Evidence Debt 常態化(月審附件)·
Research Queue 結構化(CR YAML → JSON)· clinical-use-driven enrichment
(debt 分數自動開 CR)· evidence gap 自動偵測(field_sources 掃描)。

### 18–24 個月 — Medical Brain / Adaptive Learning
case-driven spaced retrieval · weak-concept detection(答錯/查閱頻率)·
personalized review queue · board ↔ clinical cross-reinforcement。
依賴:KnowledgeUsage 至少 6 個月資料。

### 24–36 個月 — Cohort Explorer / Practice Research
CohortQuery contract · pattern/treatment-response cohort 分析(association)·
publication pipeline(case series/audit/poster)· de-identified research datasets。
依賴:病例量(估 ≥100 cases)+ SQLite 遷移完成。

## 3. 八個未來接口逐一裁定

| 接口 | 現在要? | 現 schema 可無痛加入? | 不處理的未來代價 | 最小保留 |
|---|---|---|---|---|
| ClinicalEvent | 否 | ✅ 各 row 已有 id/日期/型別 → 投影即可 | 無 | 維持「每 row 必有 id+日期」紀律(已由 validator 承擔) |
| EvidenceClaim | 否 | ✅ field_sources anchor 可機器彙整 | 低;僅需一支彙整腳本 | **R2:慣例寫進全部 template** |
| KnowledgeUsage | 否 | ✅ 新捕捉點,從零開始即可 | 無(不需回溯) | 無 |
| LearningEvent | 否 | ✅ 獨立 store,additive | 無 | 無 |
| ResearchTask | 否 | ✅ CR-### 紀律已存在 | 無 | CR id 不重用(協議已載) |
| OutcomeSeries | 否 | ✅ 投影已存在;院外量測留 `case.measurements[]` 名 | 低 | **R3:名稱保留寫入 mapping 文件** |
| CohortQuery | 否 | ✅ 依賴 export 完整性(已滿足) | 無 | 無 |
| PublicationExport | 部分已有 | ✅ readiness+consent 已落地 | 無 | 無 |

**結論:8 個接口 0 個需要建表,2 個需要極小保留動作(R2/R3),其餘全靠
既有紀律。**

## 4. 今日建議的極少數保留點(全部 additive、不動穩定 schema)

- **R1 schemaVersion/exportVersion 顯式化**:export envelope 增加頂層
  `schemaVersion`(常數,現值 "v2")與 `exportedBy`;import 對未知版本
  fail-closed(現行為隱式)。一行常數 + 一個檢查,C2b blob 凍結解除後做。
- **R2 Evidence 慣例普及**:把「每個帶主張欄位掛 per-field source anchor
  (含 retrieved date)」寫進 9 個 card template(docs-only;新產卡即遵守,
  舊卡不回溯強制 —— ratchet 自然收斂)。
- **R3 `case.measurements[]` 名稱保留**:在 localstorage_sqlite_mapping.json
  加一條 planned(non-visit-anchored measurements;shape 同 outcomeMetrics
  + measuredAt/source),今天不實作。
- **R4 modality.* 覆蓋檢查**:AE 已引用 modality.*;確認 8 個 modality 足夠
  9 月開診(艾灸/拔罐/刮痧/電針已在),缺就補 vocabulary(additive)。

## 5. What NOT to build yet

| 不做 | 為什麼 | 何時可重新評估 |
|---|---|---|
| 自動 AI 診斷 / 自動證型判定 | 違反原則 6;無標註資料;責任歸屬不明 | 永不自動「判定」;≥500 cases + 明確人審迴圈後可做「檢索式提示」 |
| 預測性季節 forecasting | 病例量遠不足以支撐;association 都還沒做 | seasonal overlays 跑滿 2 個年度週期後 |
| Treatment recommendation engine | = 自動處方;安全與法規紅線;資料量不足 | 不排程;最多做「相似病例檢索」(24-36m 後評估) |
| Patient-facing AI chat | PHI 邊界複雜;診前頁已滿足結構化輸入需求 | 需獨立隱私架構設計,不在本三年期 |
| 複雜 cohort 統計(回歸/傾向分數) | n<100 全是噪音;先 count/median | ≥100 cases 且 SQLite 遷移後 |
| Causal inference | 觀察性單臂資料永遠只能 association;原則 5 | 本三年期不做;發表語言永遠寫 association |

## 6. Migration and Versioning Strategy

- **schemaVersion**:R1 顯式化;bump 只在 shape 變更時,規則 = additive-only
  (D12 精神延伸到全期)。
- **exportVersion**:envelope 級;import 對未知版本 fail-closed(不降級解析)。
- **Backward compatibility**:讀舊寫新;normalize 層是唯一相容點
  (normalizeClinicalCase/SoapNote 已示範:缺 key 補 ""/[],絕不合成值)。
- **Additive migration**:欄位只加不改不刪;改名走「新欄位 + 舊欄位凍結」
  (D15 med→drug 已示範)。
- **Immutable IDs**:D1;patient id = sha256(patientCode)[:12] deterministic。
- **Event append-only**:exposureHistoryExtends 逐 event 比對是守門模板,
  未來任何 event 流沿用。
- **localStorage → SQLite path**:localstorage_sqlite_mapping.json 逐欄對映
  已維護;遷移時走 C2b 同款流程(plan → shadow → verify → pointer →
  rollback);時point:病例量或多裝置需求出現(估 12-24m)。
- **Rollback**:每次遷移必附 whitelist rollback + 原始 bytes 備份(C2b 標準)。
- **Unknown-field preservation**:import/merge 已保未知欄位;此紀律寫死:
  任何未來 parser 不得丟棄未知 key。

## 7. Privacy Boundary

```
Clinical PHI(patientCode、病歷內容)
  → 只存私有 clinical storage(localStorage / 未來本機 SQLite)
  → 備份只進 Git 外目錄(%USERPROFILE%\AcuTing-backups\)
De-identified aggregates(counts、knowledge ids、median deltas)
  → analytics 腳本輸出;可分享、可存 repo
Canonical knowledge(11 命名空間卡片)
  → GitHub repo(公開層;絕無 PHI)
Research agents(SOL/Codex/Sonnet/Antigravity)
  → 只能讀:去識別 aggregate + knowledge data + 合成 fixture
  → 永不讀真實 store;真機操作 = Ting 在場 + Fable(C2b 慣例)
```

## 8. Capability 總表

| Capability | NOW/RESERVED/LATER | Current support | Gap | 忽略的 migration 風險 | 建議 |
|---|---|---|---|---|---|
| C2b Patient 遷移 | NOW | FINAL GO + P4 checklist | 排真機日 | — | Ting 在場執行 |
| Pre-Visit Mobile | NOW | 已落地 | 入口裁定 | 無 | 9/5 前區網;後 workers.dev |
| Visit Brief / Timeline / 月審 / Debt | NOW | live | — | 無 | 用真資料迭代 |
| 知識庫雙層(500 骨架/300 detail) | NOW | 生產線跑滿 | 產能 | 無 | 續派 |
| CARE 草稿產生器 | LATER(6-12m) | readiness+consent 齊 | 產生器本體 | 無 | 資料到位後做 |
| ClinicalEvent 投影 | RESERVED | row id+日期紀律 | 無 | 無 | 零動作 |
| EvidenceClaim | RESERVED | field_sources 慣例 | 模板未全載 | 低 | **R2** |
| OutcomeSeries 院外量測 | RESERVED | 投影已有 | 名稱未保留 | 低 | **R3** |
| schemaVersion 顯式化 | RESERVED | 隱式 v2 | 顯式常數 | 中(版本歧義) | **R1**(blob 凍結解除後) |
| KnowledgeUsage/LearningEvent | LATER(12-24m) | 可推導 | 捕捉點 | 無 | 零動作 |
| CohortQuery/去識別資料集 | LATER(24-36m) | export 完整 | contract | 無 | 零動作 |
| SQLite 遷移 | LATER(12-24m) | mapping 全維護 | 執行 | 低(mapping 持續同步即可) | 維持 mapping 紀律 |

## 9. Milestone 表

| 2026–2029 milestone | User-visible benefit | Data dependency | Responsible |
|---|---|---|---|
| 2026-09 開診就緒(C2b+previsit+brief) | 少輸入、開診即用 | 現有 | Fable+Ting |
| 2026-12 知識庫雙層達標 | 病例都找得到索引;常用病 detail | 生產線 | Sonnet/SOL |
| 2027-02 CARE 草稿 v1 | 病例→論文草稿一鍵 | 3-6 月真實病例 | Fable→Sonnet |
| 2027-08 treatment-response overlays | 看見「改了什麼→結果如何」 | 6-12 月縱貫資料 | Fable |
| 2028-02 Evidence 迴圈自動化 | 缺口自動變研究單 | KnowledgeUsage 6m | Fable/SOL |
| 2028-08 Medical Brain v1 | 個人化複習/弱點偵測 | LearningEvent 6m | Fable→Sonnet |
| 2029-08 Cohort Explorer + 發表管線 | case series/audit/poster | ≥100 cases+SQLite | 全員 |

模型分工:Fable 5 = Platform Architect / Clinical Systems Lead;
Sonnet = Production Engineer;SOL = Clinical Product + Research Intelligence;
Codex = Independent high-risk auditor;Antigravity = bulk/mechanical only。

## 10. ARCHITECTURE VERDICT

**ADD SMALL EXTENSION POINTS**(且只有 4 個,全部 additive):
R1 schemaVersion/exportVersion 顯式化 · R2 evidence 慣例寫進全模板 ·
R3 `case.measurements[]` 名稱保留(mapping 文件一行)· R4 modality 詞彙覆蓋檢查。

理由:核心骨架(Patient→Case→Visit、append-only events、D4/D17 紀律、
可逆遷移鏈)經 8 輪對抗審計驗證,**足以承載全部三年能力而不需結構變更**;
八個未來接口全數可用投影或 additive 欄位無痛加入;唯一中度風險是版本
隱式化(R1),其餘保留點都是把「已在做的事」寫成明文紀律。不存在需要
現在大改 schema 的項目 —— 最大的風險反而是 over-engineering,本藍圖以
「零新表」回應。
