# Codex Task Queue

## ⚡ NEXT（2026-08-29，Claude 派工）：董氏穴位死連結對回卡片——只出清單，不改資料

**背景**：antigravity 的 Task 11E（出貨包層級網址存活性掃描，已驗收落地 `52442afe`／`7713e93d`
兩輪獨立複核都過）挖到全庫目前最大的使用者可見破損：`mastertungacupuncture.org` 1,384 條網址裡
**1,133 條真的 404**（負控乾淨，兩次獨立驗證過不是站台擋掃描器），其中 **722 條是圖片**（該 host
圖片 722/722 全滅）。已派給 antigravity 當 Task 11G，**到 2026-08-29 為止她完全沒有動工**（分支
`antigravity/task11g-tung-dead-link-disposition` 從未出現），改派給你，不用等她。

**MEASURED TREE**：`origin/main` @ `ec073767`。開工前自己用下面這行重跑分母，數字要跟這裡一致：
```bash
node -e "const j=require('./data/audits/bundle_url_liveness_2026-08-28.json');const mt=j.records.filter(r=>r.host.includes('mastertungacupuncture'));console.log('total',mt.length,'dead404',mt.filter(r=>r.http_status===404).length,'deadImages',mt.filter(r=>r.http_status===404&&r.is_image).length)"
```
應該印出 `total 1384 dead404 1133 deadImages 722`；main 動很快，數字對不上就先回報再問要不要繼續。

### 要做的事（跟 11E 的離線 ledger 反向對照即可，不需要活連線）

把那 1,133 條死連結**對回卡片**，一張卡一列，輸出
`data/audits/tung_dead_link_disposition_2026-08-28.json`：

`card_id`（穴位 id／code）· `card_name_zh` · `dead_urls`（陣列，每條含 `url`／`is_image`／
`field_path`，即這條網址掛在該筆記錄的哪個欄位）· `dead_count` · `live_count`（同卡上還活著的
連結數）· `all_links_dead`（bool，整張卡的外部連結全滅＝畫面上整區開天窗）·
`same_site_candidate`（若在同站找得到明顯對應的新路徑就填，找不到填 `null`）

以及一節 `summary`：受影響卡片數／整區全滅的卡片數／圖片與參考連結各佔多少。

**怎麼對回卡片**：從 `data/generated/app_data.js` 與 `points_361.js` 反查（那兩支是這些網址的
出處），再對回 `data/acupoints/**` 的原始 JSON。**欄位路徑要指到原始 JSON 的欄位**，不是只指到
出貨包——後面要修的是原始資料。

### 邊界（跟 11A-11F 一樣的規矩，違反任一條整批退）

- **只出清單，不改任何 `data/**.json` 的內容**。移除／降級成純文字／換來源，是後面的裁定，不是你這輪。
- `same_site_candidate` 要填就必須**實際打開驗證回 200**，並記 `fetched_at`；猜的一律填 `null`。
  **不准用網址規律推出一個「應該存在」的路徑當候選**——這是 Task 11A 查出來的坑（177 條
  americandragon 網址是拼音機械組出來的，看起來合理但沒人真的點開驗證過）。如果這個環境沒有
  對外連線，`same_site_candidate` 全填 `null` 是誠實且可接受的結果，不要用猜的湊。
- 推自己的分支（例如 `codex/tung-dead-link-disposition`），不要推 main。推完在
  `docs/CODEX_HANDOFF.md`（最上方）跟這份檔案都留一句「已推到 XXX 分支，等驗收」。
- 小批次、小 commit（照 `AI_CONSTITUTION.md` §三）；只准改動這份清單 + 你自己新增的驗證模式 +
  對應報告，`app.js`／`js/**`／既有驗證器都不准動。

### 驗收（照 11A-11F 的模式，自己在 `scripts/audit-source-url-liveness.js` 加一個新模式）

`--verify-disposition` 目前**還不存在**，是這輪要新增的：從 11E 帳本
（`data/audits/bundle_url_liveness_2026-08-28.json`）重算「mastertung 且 http_status 為 404」的
URL 集合，跟處置清單裡 `dead_urls` 的聯集**雙向比對**，任一邊有差 exit 1；另外斷言每個 `card_id`
都真的存在於 `data/acupoints/**`（指到不存在的卡也 FAIL）。`--self-test` 再加兩個負控：漏一條
死連結必 FAIL、清單裡出現一個不存在的 card_id 必 FAIL。

```bash
node scripts/audit-source-url-liveness.js --self-test
node scripts/audit-source-url-liveness.js --verify-disposition
node scripts/check-validation-ratchet.js
git show --stat <你的 commit>      # 只准出現清單 + 報告 + 工具本體
```

回報照 `AI_CONSTITUTION.md` §四：逐欄位數字（受影響卡片數／全滅卡片數／`same_site_candidate`
填了幾個查空幾個），不要用「完成」「100%」這種字。**這是全庫目前最大的使用者可見破損，值得優先做**，
但邊界跟前幾輪一樣嚴——只出清單，資料一個 byte 都不准動。

---

> **收口規則(2026-08-12,優先於本檔任何既有條目)**
> 找到**非 hard-gate** 問題 → 寫進 backlog,**不得因此重開當前 milestone**,
> 也不得自行發起同一 milestone 的第二輪完整 adversarial review。
> 一個 milestone 一次 independent audit;修完只跑針對該 blocker 的 regression。
> hard-gate 的定義與擋/不擋對照表見
> `docs/SPRINT_2026-08-12_BRIEF.md` §Validation Convergence / Exit Rule。
>
> **VALIDATION FRONTIER FROZEN**:除非遇到 data-loss / cross-patient /
> clinical safety / export-loss 級別的 blocker,不再開新 audit round。

## ⚡ NEXT:P1 focused retest → P4 rehearsal → landing audit(2026-08-12 晚)

**branch 狀態:`mergeable_state: clean`**(可合併 + 全部檢查綠,PR #59 @ dab9ae8)。
SOL 收斂序第 1、2 步(方劑 4 清零 → exact SHA 全 CI 綠)已成立且持續維持。

1. **P1 focused retest(你的解除條件)**:你上一輪判 NO-GO 的 3 HIGH + 4 MED
   已修並落地(aaf8b81):根因(MED-4 兩份規則各自漂移)以抽出單一共用
   `js/previsit-validator.js` 解決,app.js 與 CLI 同呼叫它,app 端缺模組時
   fail-closed 而非退回較弱的內嵌路徑。official self-test 由 3 good + 14 bad
   增為 **3 good + 22 bad**(你 8 個失敗斷言各成常駐 fixture)。
   **Fable 已在活體 app 獨立覆驗**(非只跑 CLI):metrics 物件冒充陣列 /
   9007199254740993 / 1e308 / 白名單外 metricId / `filledAt:"0"` 全部整筆拒收
   且零預填;`"A\rB"` 的 CR 被剝除而非寫入病歷。請跑你的 28 assertions +
   official self-test;全綠才由你改判 P1 `GO`(真實病人使用解除仍是 Ting 的決定)。
2. **Clinical P4 rehearsal**(六軸只做 regression smoke:31/31 + 65/65 + seam diff)。
3. **branch landing audit**(main 已再度前進,見下方「CI 靜默死亡」教訓)。

**新增的 landing 風險項(務必納入 landing audit)**:main 會被其他線推進
(2026-08-12 的 38d3b1b),而 **PR 一旦與 main 衝突,GitHub 連 run 都不會建立**
—— 沒有紅叉、gate 靜默消失(當日實際發生約 3 小時)。landing checklist 請加入
「檢查 `mergeable_state` 而非只看最後一次 run 顏色」,細節見
docs/DEPLOY_CLOUDFLARE.md 對應章節。

---

## 🟢 GATE CLEARED 2026-08-12:CI 史上首次全綠

**Run 31577198745 @ exact SHA a26d2a1**:4 jobs 全 success(no-PHI / preflight /
ratchet / green validators 23 步含 formula 0 阻斷、K-series、R1-R8、AVS)。
SOL 收斂序的第 1、2 步(方劑 4 清零 → exact SHA 全 CI)已成立。
Codex 依序執行:**P1 transport audit(即刻)→ Clinical P4 rehearsal →
branch landing audit**。Clinical 六軸只做 regression smoke(31/31 + 65/65 +
seam diff:W1 bridge、R15 v1 fail-loud、formula-in-formula validator 延伸
—— 最後一項改了 validate-formula-standard.js,mutation-tested 6/6,審它)。

---

## 佇列(SOL 2026-08-12 晚間裁定:Clinical 只做 regression smoke,不再開全輪)

收斂順序(SOL):方劑 4 清零 → 新 exact SHA 全 CI → P1 transport audit →
Clinical P4 rehearsal → branch landing audit → main landing → production smoke。

**Codex 下一個任務 = P1 transport adversarial audit**(可立即開跑,不等方劑 4;
方劑 4 在 Ting/SOL 內容線)。R15 seam 覆核降級:併入 transport audit 的
Clinical regression smoke(六軸只 smoke,W1 bridge + R15 v1 fail-loud 的
diff 快查,不另開輪)。

### P1 transport audit(SOL 指定高價值)
對象:previsit.html payload(formVersion/payloadId/filledAt)+ app.js
pastePrevisitImport 三道硬規則 + scripts/validate-previsit-payload.js。
攻擊面:wrong-patient match(逐字比對繞過?)、stale/replayed payload
(72h/未來/缺時戳/同 payloadId)、clipboard/QR 處理、malformed free text
(注入 HTML/超長/控制字元進 subjective 預填)。契約見
docs/P1_PREVISIT_INTAKE_CONTRACT_v0.md §7。全綠 → 解除「真實病人使用」PAUSE。

### branch landing audit(SOL 指定)
main → codex/pattern-v2 已 280+ commits。審 landing plan:merge-base 盤點、
generated file 決定論、migration/export/import rehearsal、production smoke、
DEPLOY_CLOUDFLARE 六 gate。CI 綠(剩 4 formula holds,3 個等 Ting)後執行。

---

## ⚡ NEXT TASK: C2B-R15 seam 增量覆核(小,非新輪)

R14 六軸 GO 之後 clinical-store.js 有兩筆**已落地**變更,exact-SHA 對照基準
需要前移。請對 diff 做增量覆核(不重跑六軸,除非 diff 觸到已審 seam 的行為):

1. **W1 getPatientsView bridge**(純新增函式 + export;UI 唯讀視圖用,
   不觸 save/restore/sync 任何一行)。
2. **R15 v1 load fail-loud**(Dry Clinic #9,事故驅動:2026-08-11 演練中
   store 被並行 agent 寫入 fetch-404 body,v1 靜默回 [] 差點讓下一次存檔
   蓋掉可救回資料)。變更:v1「存在但 unparseable / 非陣列」→ throw
   (app 端 catch → 唯讀鎖,既有機制);「不存在」→ [] 不變。
   app.js 直讀 fallback 同語意。rehearsal 新增 4 例(R15),65/65;31/31 不動。

覆核點:R15 throw 訊息不洩 PHI(只含 key 名)✅?v1 fail-loud 是否影響
P4 checklist 的 v1→v2 遷移前置(遷移讀 v1 store 的路徑現在會對 corrupt 丟錯
—— 這是意圖行為,遷移工具應在乾淨 store 上跑)?通過後更新 exact-SHA 基準,
CI 綠燈條件不變(剩 4 個 formula holds,其中 3 個等 Ting/SOL)。硬邊界照舊。

---

## (已完成)前一任務: C2B-R14 收斂覆測(依 R14 收斂令,非新輪)

H1 已修並推送(8da3089):minimumEnvelopeShapeError 單一驗證器三邊界共用,
五個 active 變體 + incoming 變體 + sync MAX_SAFE overflow 官方化,rehearsal 60/60。
照你的收斂規則:只覆測本 blocker + 全套 regression;六軸 + exact-SHA CI 全綠
→ 直接發 GO + 修訂版 P4 進 rehearsal 階段。CI:Fable 已開 draft PR 觸發
validate.yml(見 PR 描述,exact SHA 對齊)。硬邊界照舊。

---

## (NO-GO 已修復)前一任務 : C2B-R13 — R12 F1-F4 修復覆核

Fable 已修:F1 active revision 非法(存在但非 safe int ≥1)→ restore
REJECTED_UNCHANGED、active/pointer 不動(四型反例入 suite);F2 兩條 writer
寫入前算 nextRevision,overflow 零寫入丟錯(MAX_SAFE 反例入 suite);F3 官方
E1 夾具重建 —— 含 canonical Patient(hasher 實際被叫)+ hasherCalls≥1 +
restore-未-settled + race-動作已生效 三重防空跑斷言;F4 same-revision no-op
改為原始位元組相等(envelopeText === anchorRaw),whitespace 變體必拒(要放寬
成 canonical equality 需 Ting 明改契約)。rehearse-runtime-restore 50/50。
請重跑 R9(9)+R10(8)+R11(5)+R12 加碼(6)全情境 + 自行再加碼;全綠發 R13 GO
+ 修訂版 P4。硬邊界照舊。

---

## (NO-GO 已修復)前一任務 : C2B-R12 — R11 E1-E5 修復覆核

Fable 已修(現 tip 見 origin):E1 TOCTOU —— 驗證錨 = 驗證起點的 staging exact
bytes,全部 await 結束後寫入前重讀比對,不同即結構化拒絕零寫入(重試會對新
狀態重新驗證);E2 revision 秩序 —— <current 拒、==current 只准 byte-equal
冪等 no-op(divergent 必拒)、>current 才進完整驗證;E3 runtime_revision
型別鐵則(safe integer ≥1,store restore/load 邊界 + app 前置三處);E4
pending 集合與 null-FK case code 集合雙向精確互等(ghost/漏列/重複全拒);
E5 結構化失敗碼 REJECTED_UNCHANGED / INCONSISTENT_STATE,app 依 code 分流,
INCONSISTENT_STATE 顯示實際兩鍵狀態 + 設唯讀鎖擋 persist,不再宣稱「未被更動」。
rehearse-runtime-restore 42/42(你的五反例含 delayed-hasher restore-vs-sync、
equal-revision divergent、string revision、ghost pending、double-fault code)。
請重跑 R9(9)+R10(8)+R11(5)全情境 + 自行加碼;全綠發 R12 GO + 修訂版 P4。硬邊界照舊。

---

## (NO-GO 已修復)前一任務 : C2B-R11 — R10 六反例修復覆核

Fable 已修 D1-D6(現 tip 見 origin):D1 save 對 pending case 明確 patientId=null,
verifier 承認「code∈pending 且 patientId=null」唯一合法 transient(還原後 sync 收尾);
D2 反降級(active runtime-era 時,incoming revision < current 一律拒,revision-0 亦然);
D3 verifyRuntimeEnvelope 以 sha256 重算 canonicalPatientIdOf 逐 patient 驗 immutable id;
D4 duplicate normalized patientCode 必拒;D5 兩鍵替換原子化(pointer 失敗→staging
回滾至 prior exact 值,回滾失敗則精確描述不一致狀態);D6 app importClinicalCases
對 runtime-era envelope 在 pointer 缺席(wipe 復原)時放行同一 restore 函式。
rehearse-runtime-restore 28/28(含你的六反例 + 恆真斷言已改 before/after 位元組比對)。
請重跑你 R10 的 8 情境 + R9 的 9 情境,並自行加碼(D6 的 app 路徑請以你的 fake
app handler 驗 import 可達性)。全綠發 R11 GO + 修訂版 P4。硬邊界照舊。

---

## (NO-GO 已修復)前一任務 : C2B-R10 — R9 四 gate 修復覆核

Fable 已修全部四 gate(A+C = 31/31 pointer tests 含你的 9 情境;B = Sonnet
commit-on-true 批(見最新 tip);D = verifyRuntimeEnvelope 兩型 restore 契約
+ scripts/rehearse-runtime-restore.js 17/17,含 switch→edit→sync→export→
wipe→restore→canonical-hash exact + 截斷/交換/blank-FK 反例)。
請重跑你 R9 的 9 情境注入 harness + 新增你自己的 runtime-restore 對抗情境
(sync-vs-sync、restore-during-pending、pointer 恢復語義)。全綠則發布
R10 GO + 修訂版 P4(需含:切換後寫一筆→export→驗在場;pending sync 驗證;
runtime-era restore 演練)。結論照舊寫檔 push。硬邊界照舊。

---

## (已覆核 NO-GO)前一任務 : C2B-R9 — pointer-aware runtime 契約審計(新 gate,取代已作廢的 R8 GO)

背景:INDEPENDENT_AUDIT_2026-08-11 發現 runtime load/save 不看 pointer(切換後
新病歷寫 v1、export 出凍結 staging = 靜默分叉)。Fable 已修:
- js/clinical-store.js:activeIsV2 / readStagingEnvelopeOrThrow(fail-loud,缺/毀 staging 一律 throw)/
  v2 save 更新 envelope.cases + caseIds 同步 + pending_patient_codes(不同步鑄 id)/
  syncPendingPatients(async,deterministic sha256 id,冪等)/ v1 在 v2 模式凍結永不寫
- app.js:loadClinicalCases try/catch → 唯讀保護旗標;persistClinicalCases try/catch +
  quota 失敗大聲告知絕不假裝已存;存檔後 fire-and-forget 補建病人
- scripts/test-pointer-runtime.js:18 斷言(v1 不變性/v2 讀寫/凍結/pending/冪等/fail-loud)

請審:1) v1 模式逐位元不變性(diff 舊行為);2) v2 模式下所有可達寫入路徑是否仍
whitelist(rehearse 全套 + 你的注入);3) fail-loud 是否無路徑靜默降級;4) pending
病人機制的競態與冪等;5) export/import 與新 runtime 的一致性(export 讀 pointer,
現在 runtime 也讀 —— 兩者對齊?);6) P4 checklist 需要哪些新驗收項(切換後寫一筆
→ export → 驗在場)。PASS 則發布 R9 GO + 修訂版 P4;任何 FAIL 照慣例寫反例。
結論寫 AI_REVIEW_FEEDBACK.md + CODEX_HANDOFF.md 並 push。硬邊界照舊。

---

## (已完成)前一任務(2026-08-11,Fable 排入;Ting 只需說「照佇列」)

### C2B-R8 — cleanup gate 單點覆核(最後一關)

Endpoint:codex/pattern-v2 最新(先 pull)。R7 cleanup 反例已修:cleanupCandidate 明示 success/error(retry 一次);成功路徑 = cleanup 確認成功 → 才 active swap;cleanup 失敗在 swap 前回 {ok:false,failures},active/pointer 不動;失敗路徑 cleanup 錯誤附註 failures。rehearse 6j 內建你的注入(含「swap 不得發生」的 backend 證明)。請重跑你的 cleanup 注入(direct + app handler)、確認 R5/R6 反例與 P3.1/3.2/3.4 無回歸;**4/4 PASS 即發布 P4 final GO 條件與真機當日 checklist**(執行=Ting 在場、重比 Edge file:// raw hash)。結論寫 AI_REVIEW_FEEDBACK.md + push。硬邊界照舊。

---

Written: 2026-07-08 (Claude Cowork). Owner: Ting decides when each task runs.
Purpose: Codex is running low on tokens. Each task below is written to be
self-contained — Codex should be able to execute it by reading ONLY this task
section plus the files it names, without re-reading the whole handoff history.

Status overlay: read `docs/CODEX_TASK_STATUS.md` first for completed / gated / blocked state before starting a task.

## How to use this file

- Ting picks ONE task and tells Codex the task ID (e.g. "do A1").
- Tasks are ordered by priority within each track. Track A first when tokens
  are tight; Track B needs medium budget; Track C only with a full budget.
- Every task keeps the standing AGENTS.md rules. For docs-only tasks, a
  compact handoff (files changed / what / validation / next) is acceptable
  instead of the full 15-point format, to save tokens.
- Tasks marked **[GATE]** must stop and wait for Ting's approval at the
  marked point before continuing.

## Standing protected areas (all tasks)

Do not modify unless the task explicitly says so:
`app.js` case/soap/cloudtcm/search/enrichPoint/selectPoint sections,
`js/router.js`, `js/knowledge.js` (except where a task names it),
`styles.css` point-detail-mode, `data/generated/*` by hand,
`data/sources/cloudtcm_point_map.json`, `scripts/validate-data.js` IGNORED_FIELDS,
`legacy/`.

## Standard validation (run after every task unless stated otherwise)

```
node scripts/validate-data.js
node scripts/validate-interactions.js
node scripts/validate-relations.js
node scripts/validate-herbal-links.js
node scripts/validate-herb-canon.js
node scripts/validate-point-ids.js
node scripts/validate-naming.js
node scripts/validate-point-categories.js
node scripts/validate-encoding.js
node scripts/validate-content-junk.js
node scripts/validate-herb-standard.js
node scripts/validate-acupoint-standard.js
```

Point-set maintenance (DECISIONS D6): points are never hard-deleted. To
retire one, set `review_status="deprecated"`. To add a new permanent point,
add it then run `node scripts/update-point-manifest.js --write` to ratify
the id into `data/acupoints/point_id_manifest.json`.

## Quality Capture - NCBAHM 2026 CH Appendix A herb-card gap (added 2026-07-28)

Status: **CLOSED 2026-07-29 (batch16)**. 304/304 Appendix A herbs now have local cards. Source of truth for the live Quality page is `data/audits/missing_report.json.herb_outline_coverage`.

Update 2026-07-29 (Claude, network-verified session) — batch16 (final): Zao Jiao Ci, Zhen Zhu built (curriculum + live American Dragon + live CloudTCM), closing the Appendix A gap: 302/304 → 304/304 matched, 2 → 0 missing. Local herb cards 325 → 327. Both checked against NCBAHM 2026 CH Appendix B (Chinese Herbal Pairs, 57 entries) — neither is listed there.

**Process gap found and fixed**: batch12–15 (20 herbs) were built checking only Appendix A, never Appendix B, and `key_pairs` was left empty by default rather than by verification. Retroactively checked all 20 against the full Appendix B list — none of them appear in it (Appendix B is a short classic-pairs list, not exhaustive per-herb). `docs/HERB_CARD_TEMPLATE.md` §3.4a now requires checking both appendices before writing any card, going forward. Still outstanding: a course/American-Dragon pairing sweep for these 20 herbs (Appendix B being empty for them doesn't mean no pair exists anywhere — course material or AD's own "commonly combined with" notes may still support a `herb_pairs.json` entry; this wasn't checked yet).

Update 2026-07-29 (Claude, network-verified session) — batch15: Tan Xiang, Tu Bie Chong, Tu Fu Ling, Xi Xian Cao, Ye Ju Hua built (curriculum + live American Dragon + live CloudTCM; Tu Bie Chong has no findable exact CloudTCM page, built from curriculum+AD only, labeled honestly). Coverage 297/304 → 302/304 matched, 7 → 2 missing. Local herb cards 320 → 325. Next recommended batch (16, final): Zao Jiao Ci; Zhen Zhu.

Update 2026-07-29 (Claude, network-verified session) — batch14: She Chuang Zi, Shi Wei, Si Gua Luo, Suo Yang built (curriculum + live American Dragon + live CloudTCM). Coverage 293/304 → 297/304 matched, 11 → 7 missing. Local herb cards 316 → 320. Next recommended batch (15): Tan Xiang; Tu Bie Chong; Tu Fu Ling; Xi Xian Cao; Ye Ju Hua.

Update 2026-07-29 (Claude, network-verified session) — batch13: Lu Lu Tong, Ou Jie, Qin Pi, Qing Dai, Sang Zhi built (curriculum + live American Dragon + live CloudTCM). Caught a CloudTCM self-contradiction on Sang Zhi — its own "傳統功效" prose section (疏散風熱清肺潤燥…) didn't match its own "基本資訊" tab (苦平歸肝經) or curriculum/AD; excluded the mismatched section rather than including it as if verified. Coverage 288/304 → 293/304 matched, 16 → 11 missing. Local herb cards 311 → 316. Next recommended batch (14): She Chuang Zi; Shi Wei; Si Gua Luo; Suo Yang.

Update 2026-07-29 (Claude, network-verified session) — dedup fix + batch12: before building the reported-missing list, alias-matched every candidate against the canon; Sha Yuan Ji Li and Yin Chen were already present as `herb.sha_yuan_zi`/`herb.yin_chen_hao` with empty alias arrays, so aliases were added instead of creating duplicates (23 → 21 missing, no new records). Then built batch12: Kun Bu, Lian Xu, Lian Zi Xin, Ling Zhi, Lu Dou — each verified against curriculum + a live American Dragon page fetch + a live CloudTCM page fetch (this session has network access; prior sessions did not). Local herb cards now 311. Normalized Appendix A matching is 288/304 with 16 card candidates still missing. Next recommended batch (13): Lu Lu Tong; Ou Jie; Qin Pi; Qing Dai; Sang Zhi.

Update 2026-07-29 batch11: local herb cards are now 306 after adding He Tao Ren, Hu Jiao, Huai Mi, Jin Ying Zi, and Jing Mi. Normalized Appendix A matching is now 281/304 with 23 card candidates still missing. Next recommended batch: Kun Bu; Lian Xu; Lian Zi Xin; Ling Zhi; Lu Dou.

Update 2026-07-29 batch10: local herb cards were 301 after adding Gua Lou Pi, Gua Lou Ren, Hai Piao Xiao, Hai Tong Pi, and Hai Zao. Normalized Appendix A matching was 276/304 with 28 card candidates still missing.

Update 2026-07-29 batch9: local herb cards were 296 after adding Fu Pen Zi, Ge Jie, Gou Ji, Gu Sui Bu, and Gu Ya. Normalized Appendix A matching was 271/304 with 33 card candidates still missing.

Finding: NCBAHM 2026 CH Appendix A lists 304 herbs. Current local herb cards include 291 records after adding Ba Dou, Chuan Wu, Cao Wu, Niu Huang, Shui Niu Jiao, Wu Gong, Han Fang Ji, Ma Huang Gen, Jue Ming Zi, Mu Zei, Bai Hua She, Liu Huang, Xian Mao, Bai Hua She She Cao, Bai Xian Pi, Bai Guo, Bai Qian, Ban Zhi Lian, Bi Ba, Bi Xie, Chen Xiang, Chi Xiao Dou, Chuan Mu Tong, Chun Pi, Ci Wu Jia, Di Fu Zi, Dong Chong Xia Cao, Dong Gua Zi, Dong Kui Zi, and Feng Mi; normalized pinyin / alias matching found 266 Appendix A herbs represented locally and 38 card candidates still missing. This is a board-outline coverage gap, not the older 202 CloudTCM seed-count metric.

Missing card candidates:
Kun Bu; Lian Xu; Lian Zi Xin; Ling Zhi; Lu Dou; Lu Lu Tong; Ou Jie; Qin Pi; Qing Dai; Sang Zhi; Sha Yuan Ji Li; She Chuang Zi; Shi Wei; Si Gua Luo; Suo Yang; Tan Xiang; Tu Bie Chong; Tu Fu Ling; Xi Xian Cao; Ye Ju Hua; Yin Chen; Zao Jiao Ci; Zhen Zhu.

Recommended next pass: Kun Bu, Lian Xu, Lian Zi Xin, Ling Zhi, Lu Dou unless Ting reprioritizes high-risk herbs such as She Chuang Zi or Qing Dai.

Backlog rule from Ting 2026-07-28: if herb or formula work discovers a missing herb ID that is not on this current 38-card list, append it to the missing-card backlog and build it later. Do not ignore missing referenced herbs just because they were absent from the original NCBAHM-gap list. Current discovered extra backlog item from pair scan: Ju He / `herb.ju_he` for pre-existing `pair.ju_he__chuan_lian_zi`.

Pending pair-linked herb IDs from batch8/9/10/11: `herb.she_chuang_zi`, `herb.qing_xiang_zi`, `herb.gu_jing_cao`, `herb.nan_sha_shen`, and `herb.kun_bu`. `herb.ge_jie` was created in batch9, so the existing Dong Chong Xia Cao/Ge Jie pair should now link normally. These pending IDs are allowed in `herb_pairs.json` before their local cards exist; front-end links remain plain/pending until cards are built.

Done when: each new herb card is created from the current herb template, source-layered against NCBAHM 2026 CH + Chenoweth course + CloudTCM + American Dragon when available, and the missing count is recomputed in `data/audits/missing_report.json`.

---

## Track A — Mechanical hygiene (small, low-risk, token-cheap)

### A1. UTF-8 / mojibake guard for batch edits

Why: Session 19 corrupted Chinese labels on 32 herb records via a Windows
console encoding issue. Same failure family as the earlier OneDrive damage.
We want this caught by a validator, not by manual review after the fact.

Do:
1. New file `scripts/validate-encoding.js`. For every `data/**/*.json`:
   - flag any string value that is only `?` characters (2+),
   - flag replacement chars `�`,
   - flag fields named `*_zh` / `nameZh` / `chinese` whose value contains no
     CJK characters but is non-empty and longer than 3 chars.
   Exit 1 on failures, print file + JSON path + offending value.
2. Add it to the validation list in this file and in `README.md`'s
   push-checklist section (one line each).
3. Do NOT auto-fix anything it finds — report only.

Files: `scripts/validate-encoding.js` (new), `README.md`, this file.
Done when: script passes on current data (or failures are listed for Ting),
standard validations pass.
Risk: low. Read-only checker.

### A2. Bring DATA_MIGRATION_MAP.md back in sync (docs only)

Why: the authority table was last updated 2026-07-02 and doesn't know about
`formula_canon_shortlist.json` (115), `herb_canon_shortlist.json` (202),
`formula_import_staging.json`, `data/imports/`, or `clinical_decision_links.json`.
That file is supposed to be the single answer to "which file is the truth?".

Do: add rows to the authority table for each file above with: source of truth,
consumed-by (all currently "NOT wired into app"), and status. Note that
`data/herbs/formulas.json` (23 records) is the ONLY formula file the app
renders today. Do not change any data file.

Files: `docs/DATA_MIGRATION_MAP.md` only.
Done when: every data file Codex created in Sessions 9–21 appears in the table.
Risk: none.

### A3. Generate Tung + GB93 .js twins from .json  **[GATE]**

Why: `data/tung/point_index.js`, `data/auricular/gb93_index.js`,
`gb93_worklist.js` are hand-maintained copies of their `.json` files —
double-edit risk. REBUILD_PLAN Phase 2 item 3, untouched since 07-02.

Do:
1. In `scripts/build-data.js`, add generation of those three `.js` files from
   their `.json` sources, using the same global-variable names the app expects
   today (inspect the current `.js` files for the exact `globalThis.X = ...`
   or `const X = ...` shape before writing).
2. Run build, diff generated output vs the old hand-kept files. Byte-level
   differences in formatting are fine; data differences are not.
3. **[GATE]** Show Ting the diff summary. Only after approval: delete nothing —
   instead move the hand-kept originals' content authority note into
   DATA_MIGRATION_MAP.md ("now generated"). The old files are simply
   overwritten by the build from now on.

Files: `scripts/build-data.js`, `data/generated/` outputs or the three `.js`
files (as generated targets), `docs/DATA_MIGRATION_MAP.md`.
Done when: editing the `.json` and running build updates the `.js`; app loads
with identical behavior; standard validations pass.
Risk: medium-low. App load order in `index.html` must not change.

### A4. Move remaining config constants out of app.js

Why: REBUILD_PLAN Phase 2 item 2, untouched since 07-02. Seven config blocks
still live at `app.js` lines ~17–425: `standardChannelAudit`,
`channelPrefixMeta`, `auricularZonePositions`, `directoryRegionGroups`,
`directoryTopics`, `earAnatomyLabelData`, `earPointAnchors`.

Do:
1. Create `data/config/ui_config.json` holding all seven blocks (one file is
   fine; they are small).
2. `scripts/build-data.js` emits them into `data/generated/app_data.js` (or a
   new small generated file loaded before app.js — keep it simple).
3. In app.js, replace the seven `const` definitions with reads from the
   generated global. Touch NOTHING else in app.js.
4. Verify: `node --check app.js`, open app, home dashboard counts render,
   directory filters work, ear labels render.

Files: `data/config/ui_config.json` (new), `scripts/build-data.js`, `app.js`
(only the seven const blocks), `index.html` only if a new script tag is needed.
Done when: standard validations pass + the manual checks above.
Risk: medium. This is app.js surgery, but confined to constant definitions.
If anything else in app.js needs touching, STOP and report instead.

---

## Track B — Wire existing draft content into the UI (medium budget)

Principle (architecture decision, Claude 2026-07-08): STOP creating new
draft-content files until the existing ones are visible in the app. The
115-formula and 202-herb shortlists currently help nobody because the UI
can't show them. Wiring beats writing.

### B1. Formula reconciliation plan (plan first, no merge)  **[GATE]**

Why: two formula files overlap — `data/herbs/formulas.json` (23 records,
rendered by the app) and `data/herbs/formula_canon_shortlist.json` (115
records incl. the same 23, richer planning fields, NOT rendered). One must
become canonical or they will diverge like the old 361/embedded split.

Do (mirror the successful 361 workflow):
1. Write the field map: for the 23 overlapping formulas, map every field in
   both files and decide the merge direction. Recommended target: ONE file,
   `data/herbs/formulas.json`, absorbing shortlist fields (`tier`,
   `comparison_group`, `related_formulas`, `modern_clinical_use_tags`,
   `english_exam_track`, `chinese_depth_track`, ...); the 92 skeleton-only
   records join as `review_status: "draft"` skeletons.
2. Write a preview script `scripts/merge-formulas-preview.js` producing
   `docs/FORMULA_MERGE_PREVIEW.json` + `docs/FORMULA_MERGE_DIFF_SUMMARY.md`
   (counts, added, changed, conflicts — same shape as 361_MERGE_DIFF_SUMMARY).
3. **[GATE]** Stop. Ting reviews the diff summary before any file is
   overwritten. Do not apply in the same session as writing the preview.

Files: `scripts/merge-formulas-preview.js` (new), two docs outputs, and the
field map appended to `docs/DATA_MIGRATION_MAP.md`. NO data file changes yet.
Done when: diff summary exists and validations pass.
Risk: low at this step (preview only). The apply step is a separate task.

### B2. Apply formula merge + render in Lookup (after B1 approval)

Do:
1. Apply the approved merge (`--apply-approved` pattern).
2. Run `scripts/build-data.js`; `js/knowledge.js` formula section now renders
   the merged set: keep the existing card layout, add a search box + category
   filter + status pill (draft records visibly marked, consistent with the
   content-status model in ARCHITECTURE_AUDIT.md).
3. Skeleton-only records render as compact rows ("draft — content pending"),
   not full cards, so the section stays honest.

Files: `data/herbs/formulas.json`, `scripts/build-data.js`,
`js/knowledge.js` formula block, `index.html` formulaSection markup if a
search input is needed, `styles.css` additions only (no edits to existing rules).
Done when: 115 formulas searchable in Lookup, 23 with content, all validations
pass, `docs/VALIDATION_LOG.md` updated.
Risk: medium. UI change; run validate-interactions and a browser spot-check.

### B3. Herbs list in Lookup (202 records, draft-labeled)

Why: 202 draft herb records exist and are invisible. Same "wiring beats
writing" principle.

Do:
1. `scripts/build-data.js` adds `herb_canon_shortlist.json` to
   `data/generated/knowledge_data.js`.
2. New "單味藥 Herbs" block in the Lookup workspace (pattern-match the
   formula section in `index.html` + `js/knowledge.js`): search by pinyin/
   zh/en name, filter by category, status pill on every card, related-formula
   links as plain text chips for now (clickable later).
3. Every card must show `draft — source review pending`. No record may render
   without its status.

Files: `scripts/build-data.js`, `js/knowledge.js`, `index.html` (new section
inside lookup workspace), `styles.css` additions only.
Done when: herbs searchable in Lookup, standard validations +
`validate-herb-canon.js` pass, VALIDATION_LOG updated.
Risk: medium-low. Additive UI.

---

## Track C — Content quality (full token budget only)

### C1. Source-check pilot: 20–30 high-yield items  **[GATE — needs source material from Ting]**

Blocked until Ting supplies/points to Bensky text or approved school notes.
Then: verify the 23 filled formulas' `english_exam_track` one by one; only
verified records get `source_status` upgraded. Never batch-upgrade.

### C2. Fill remaining 92 formula skeletons (draft only)

Only after B2, so new content lands in the rendered canonical file, not in a
side file. Same conservative wording rules as FORMULA_CANON_RULES.md. Batch in
groups of ~15 with a validation run between batches (and A1's encoding guard).

### C3. PC/TE/GB/LR/CV/GV standard-point content batches

Channel-by-channel completion per REBUILD_PLAN Phase 3 item 5. Follow the
existing per-channel workflow from README "資料庫更新進度". Requires A1 done
first (encoding guard) since these are large Chinese-text batches.

---

## Track D — Bulk content pipeline (fastest path to complete 361 + formulas)

Background (research finding, Claude 2026-07-08): there is NO ready-made open
dataset with study-grade bilingual content for the 361 points — public
"acupoint datasets" (AcuSim, FAcupoint, MetaAcuPoint) are computer-vision
image-localization sets, and the Mengqi97 index has no acupoint text source.
The fastest bulk channel is one we already half-built: CloudTCM's Next.js data
endpoint, with all 361 code→id mappings already in
`data/sources/cloudtcm_point_map.json` (Session 8).

License / usage rule for this track (Ting acknowledged when dispatching D1):
CloudTCM text is theirs. Raw imports stay under `data/imports/` as PRIVATE
study staging with per-record `source_url`; AcuTing OS stays private; nothing
imported may go into Learn/public content without full rewrite + verification
against WHO/authorized sources. Same policy as the existing GB93/CloudTCM use.

### D1. Fetch 361 CloudTCM point pages  **[RUN ON TING'S MACHINE]**

`node scripts/fetch-cloudtcm-points.js --limit 5` first (probe run), inspect
one raw file, then run without --limit for all 361. The script is resumable,
rate-limited (600 ms), probes the current buildId automatically, writes raw
JSON to `data/imports/cloudtcm/points/` and a fetch manifest. The cloud
sandbox cannot reach cloudtcm.com — this must run locally.
Done when: fetch_manifest.json shows 361/361 (or failures listed for review).
Risk: low. Writes only under data/imports/.

### D2. Distill raw → staging + coverage report

`node scripts/transform-cloudtcm-points.js --inspect LU1` to see the real
JSON shape, tighten FIELD_CANDIDATES in the script if coverage is poor, then
run the full transform. Output: `staging_points.json` (all records draft /
cloudtcm_import_pending_review) + `coverage_report.json`.
Done when: field coverage report shows location/indications/technique filled
for the large majority; unmatched files investigated.
Risk: low. Still staging-only.

### D3. Merge staging into 361.json  **[GATE — mirror the 361 KI merge]**

Write `scripts/merge-cloudtcm-preview.js` following the proven
merge-361-preview pattern: field map (staging zh fields → 361 schema
`location_zh` / `functions_zh` / `indications_zh` / `needling` /
`contraindications`), never overwrite non-empty canonical values (report them
as conflict candidates instead), produce DIFF SUMMARY doc, **stop for Ting's
approval**, apply only with --apply-approved. After apply: 126 missing points
gain Chinese draft content; existing 235 gain missing needling/safety fields.
Then run the full validator suite + rebuild generated data.
Risk: medium. Data merge — the gate + diff summary is mandatory.

### D4. Formula bulk fill (after B1/B2 formula reconciliation)

Two channels, in order:
1. CloudTCM formula pages — same Next.js endpoint approach; first probe how
   /formula pages are structured, build a formula_id map like the point map
   (the 115-shortlist `source_hint` fields already say "CloudTCM /formula
   lookup pending").
2. Public-domain classics for original compositions (傷寒論/金匱要略/溫病條辨
   original text is public domain): ctext.org API or the TCM-Ancient-Books
   GitHub corpus can seed `composition` + classical indications for the
   classical subset of the 115. Modern-textbook actions/contraindications
   still need Bensky/CloudTCM review (C1).
Risk: medium-low. All output draft + staged.

### D5. Fill remaining empty needling / EN fields on existing 361.json records

Status 2026-07-09: Claude built the fill-empty-only pipeline and completed
LU + HT as the worked example (35 fields on 20 records). Remaining gaps
(check live with the gap command below): ~150 records missing `needling`,
~35 missing the EN triple, concentrated in BL(60), KI(27), SP(21), SI(19),
then small remainders in ST/GB/CV/GV/LI/LR/PC/TE.

How to work (one channel batch per session):
1. Count current gaps:
   `node -e "const db=require('./data/acupoints/361.json');const e=v=>!v||(Array.isArray(v)&&!v.length);db.filter(p=>/^BL/.test(p.code)).forEach(p=>{const m=['needling','location_en','functions_en','indications_en'].filter(f=>e(p[f]));if(m.length)console.log(p.code,p.chinese,m.join(','))})"`
2. Write `data/imports/model_draft/enrichment/<channel>_enrichment.json`
   copying the exact format of `enrichment/lu_ht_enrichment.json` (only the
   five allowed fields; only for codes/fields the gap command listed).
   Content rules: conservative textbook needling depths/angles with vessel/
   nerve/organ avoidance notes; chest/back points MUST carry 氣胸 warnings
   (BL11-BL30 paraspinal: 斜刺, no deep perpendicular insertion over the
   thorax); EN text follows WHO SAPL terminology style like the LU examples.
3. `node scripts/apply-361-enrichment.js` (dry run) — confirm 0 conflicts,
   then `--apply`. The script only fills empty fields and never overwrites.
4. Run the standard validators. Handoff with the fill counts.

Batch order: BL → KI → SP → SI → the small remainders in one final batch.
Risk: low-medium. Data adds only; the apply script enforces no-overwrite.

### English-content note (no bulk source exists)

There is no legally bulk-importable English source: Deadman and Bensky are
copyrighted, WHO SAPL is a PDF for verification (tier-1 authority, hand-check
per batch, can be marked source_checked when verified). English fills stay
channel-by-channel (C3 style) — bulk speed applies to the Chinese layer.

## Track E — Conditions module (中西醫病名層)

Design spec: docs/CONDITIONS_MODULE_DESIGN.md (Claude, 2026-07-12).
Gate: Ting approves the design + 150-condition scope FIRST.
Then, in order: E1 pattern-library skeleton (~50) → E2 condition shortlist
skeleton (150, STOP for scope review) → E3+ category fill batches
(gyn_fertility first, red_flags mandatory) → E-tags tag_vocabulary.json →
wire into conditionGraph UI. Follow the schemas and safety wording rules
in the design doc exactly. Extend validate-relations for tag/id integrity
as part of E3.

## Track E-I — Conditions interop (中西醫病名對照 × ICD/CPT × intake)

Design spec: docs/CONDITIONS_INTEROP_DESIGN.md (Claude, 2026-07-12).
Gate: Ting approves the design first; E-I0 additionally needs her approval
of the §6.1 replacement table.

In order:
- E-I0 mojibake repair: `node scripts/repair-mojibake-pathology.js`
  (dry-run verified 2026-07-12: 18 strings across conditions.json +
  condition_graph_expansion.json). After Ting approves §6.1: `--apply`,
  rebuild generated data, run validators, log.
- E-I1 add 《中西醫病名對照大辭典》 (MOHW NRICM) to source_registry +
  citation policy note. Additive only.
- E-I2 `data/interop/condition_crosswalk.json` skeleton: one record per
  canon condition (150), `icd10[]` seeded from icd_hint, empty
  `cpt_placeholder`/`insurance_placeholder` present on every record.
  STOP for Ting spot-check (5 records).
- E-I3 `tcm_dictionary_refs` fill batches citing the 大辭典, category
  order (gyn first), reconciling with related_eastern_diseases.
  Per-batch Ting review; needs her copy of the dictionary.
- E-I4 validate-relations extension: crosswalk FK integrity +
  icd_hint/icd10 agreement warning.
- E-I5 intake form structured fields — [CLAUDE design done → CODEX build],
  only AFTER Phase 2 merge lifts the app.js freeze.
- E-I6 conditionGraph UI reads canon 150 + crosswalk; mark conditions.json
  superseded in DATA_MIGRATION_MAP (no deletion).

Progress protocol: every E-I task ends with validators green + a row
update in docs/CODEX_TASK_STATUS.md + a docs/CODEX_HANDOFF.md entry;
batch tasks keep a done/total per-category checklist in CODEX_TASK_STATUS.

## Track H — Herb module (單味中藥卡片、方藥互連、替換思考)

Design spec: docs/HERB_MODULE_DESIGN.md (Claude, 2026-07-12).
Gate: Ting approves the design first. Then in order: H1 category audit +
comparison_group + related_herbs generation → H2 composition_structured
for the 23 filled formulas (formula→herb ids; STOP list for ambiguous
pinyin) → H3 substitution_context_zh fill batches → H4 herb detail card +
formula⇄herb chips UI → H5 condition-id tag links (after Track E).
Permanent wording law: related_herbs = 比較與替換思考參考，非自動替代.

## Claude-owned items (do NOT assign to Codex)

These involve high-risk app.js surgery or architecture calls:

1. **361.json runtime adapter** — switching the app runtime from
   `data/acupoints/embedded/*.json` to `361.json` as the single source.
2. Case/SOAP dialog UX re-segmentation (per docs/CASE_SOAP_FLOW_REVIEW.md);
   case point/formula links → clickable into the knowledge base.
3. Router/workspace architecture changes; mobile one-workspace-at-a-time UX.
4. Any change to search behavior or the CloudTCM direct-link logic.

## Suggested order when Ting says "just pick the next thing"

D1 → D2 (bulk Chinese content is the biggest coverage win) → A1 → A2 →
D3 (gate) → B1 (gate) → B2 → B3 → D4 → A4 → A3 (gate) → C2 → C3. C1 whenever
source material becomes available — it can interleave.
