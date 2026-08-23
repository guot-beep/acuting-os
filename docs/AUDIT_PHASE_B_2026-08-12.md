# Phase B 對抗性審計 — 2026-08-12(Fable 自審,Codex 落 main 前必須獨立複核)

範圍:`994d8b3`(B1 schema)· `6569eaa`(B2 契約)· `c6a052f`(B3 詞彙)。
方法:所有宣稱重新實查(grep/實跑 validator/live 往返證據重讀),不採信原報告。

## 發現總表

| # | 檢查項 | 判定 |
|---|---|---|
| 1 | schema ↔ normalize ↔ mapping 欄位一致性 | **PASS**(見 L-1 低風險註記) |
| 2 | D17 snapshot-vs-event 原則 | **BLOCKER B-1** |
| 3 | agent ledger 可否重建 200mg→400mg→stopped | **FAIL = B-1 本體** |
| 4 | environmental exposure 同型覆寫問題 | **HIGH H-1** |
| 5 | differential vs working pattern 語意 | **PASS** |
| 6 | role ⇔ isPrimary 不變量 | **MEDIUM M-1** |
| 7 | sym.*/metric.* relatedSymId 語意 | **MEDIUM M-2** |
| 8 | visit_western_medications 與新 ledger 並存 | **MEDIUM M-3** |
| 9 | export/import 新欄位保存 | **PASS**(實證:import 走同一 normalizeClinicalCase,live 往返 7/7) |
| 10 | PHI validator 覆蓋 | **HIGH H-2**(審計中發現 B1 把 K 系列驗證器弄紅了) |
| 11 | 舊病例向後相容 | **PASS**(34 個 legacy cases live 載入,絕鍵預設 []/"",role 不回填) |
| 12 | D12/D17 凍結影響 | **PASS 有條件**——B-1 修正必須趕在 9/01 前 |

## BLOCKER

### B-1 · agent/environmental ledger 就地更新,歷史態不可重建(違反 D17 §5 鎖定原則)

- **檔案/欄位**:`data/clinical_cases/schema.sql` `case_agent_exposures`(設計註解
  明文「updates the SAME row」);`app.js` `normalizeClinicalCase.agentExposures[]`。
- **失敗情境**:Visit 2 記 magnesium 200 mg(changeSinceLast=started)→ Visit 5
  改 400 mg(dose_changed 覆寫 doseText)→ Visit 9 停用(stopped 覆寫 status)。
  此時 row 只剩最終態 + 最後一次 change;**200 mg 曾存在、400 mg 何時開始,
  皆不可重建**。firstNoted/lastConfirmedVisitId 只給端點。V2 §18 的鎖定原則是
  「current 可以是 snapshot,**變化必須保史**」——ledger 只做到了前半。
- **9/01 前必須改 schema?** 是。
- **最小安全修正**:snapshot+event 雙層。ledger row 維持「現況快照」(Patient Now
  用),新增 **append-only 事件層**:
  - schema:一張 `case_exposure_events`(`parent_type` 'agent'|'environmental',
    `parent_id`,`visit_id`,`event_type` started|stopped|dose_changed|
    frequency_changed|status_changed|certainty_changed|timing_changed|confirmed_unchanged,
    `dose_text`/`frequency_text`/`status`/`certainty`/`timing` 記「事件後的新值」,
    `effective_approx`,`note`)。
  - localStorage:`agentExposures[].events[]` / `environmentalExposures[].events[]`
    (additive 巢狀鍵,舊資料缺鍵 = [],合法)。
  - 寫入規則:任何改 ledger 現況的 UI 動作**必須同時 append 一筆 event**;
    normalizer 只記錄不推導。
- 註:`visit_lifestyle_factors` **不受影響**(本來就 per-visit rows,軌跡=行本身)。

## HIGH

### H-1 · environmental exposure 覆寫 = 無痕跡的 suspected→confirmed 晉升通道

- **檔案/欄位**:`case_agent_exposures` 同型的 `case_environmental_exposures.certainty/timing`。
- **失敗情境**:certainty 從 suspected 就地改成 confirmed——D17 §6 說晉升必須是
  「有來源的手動編輯」,但覆寫不留任何證跡,審計上無法區分手動晉升與誤觸。
- **修正**:被 B-1 的事件層一併解決(certainty_changed 事件 + note 記來源)。

### H-2 · B1 把 K 系列 PHI validator 弄紅(審計中發現,原報告未察)

- **檔案/欄位**:`localstorage_sqlite_mapping.json` changelog 新行以
  「2026-08-12:」開頭,命中 K4 完整生日 regex → `validate-clinical-case-standard.js`
  **exit 1**。house 慣例本來就是 changelog 只寫到月(「2026-08:」)以避開 K4——
  B1 破壞了慣例。該 validator 不在 validate.yml/ratchet 裡,所以 CI 沒擋,
  但它紅著 = 未來真 PHI 發現會被噪音淹沒。
- **9/01 前必須改 schema?** 否(資料行修字即可)。
- **最小修正**:changelog 行改月精度。**不改 validator**(regex 行為正確)。
- 順帶答覆檢查 10 本題:K 系列是「整檔 regex 掃描」不是欄位白名單,
  未來含新欄位的 committed sample 檔會自動被掃 → 覆蓋面結構上 PASS。

## MEDIUM

- **M-1 role⇔isPrimary**:save 路徑一致(實查 saveSoapFromForm),但 normalizer
  不 reconcile——手改 import 檔可造出 role='primary' + isPrimary=false,新舊讀者
  分歧。修正:validator 檢查(不在 normalizer 推導),Phase D 前加。
- **M-2 relatedSymId 指向空命名空間**:sym.* 目前 0 records(D11 允許),寫入的
  anchor 是 forward reference。政策要寫明:sym 種子落地前,驗證器對 sym.* 引用
  白名單放行;種子落地後轉為 dangling-ref 檢查。
- **M-3 雙軌並存**:westernMeds/medicationLinks(舊)與 agentExposures(新)在
  Phase D 會同時存在 UI,雙重輸入/分歧風險。修正:Phase D 契約明定——遷移閘門後
  新 Visit 的用藥輸入只寫 ledger,medicationLinks 唯讀顯示 legacy。

## LOW

- **L-1**:JS 契約缺 createdAt/updatedAt(schema 有)——遷移時可補印,不擋。
- **L-2**:`sample_deidentified_case.json` / `case_template.json` 未含 D17 新鍵示例。

## 結論

**PHASE C: HOLD** —— B-1(+H-1 同修)與 H-2 必須先解。兩者修正皆 additive、
均在 9/01 前可落地。修正完成並自驗後 Phase C 可開。

**Codex 落 main 前仍須獨立複核**(不因本自審豁免):
1. B-1 修正後的事件層——append-only 是否真的無覆寫路徑
2. export→wipe→import 檔案級走查(本審只驗了結構與 load 路徑)
3. K 系列 validator 在修正後全綠 + 是否應納入 validate.yml/ratchet
4. role⇔isPrimary validator(M-1)落地
5. 34 個真實 legacy cases 在事件層加入後的再次無回歸驗證
