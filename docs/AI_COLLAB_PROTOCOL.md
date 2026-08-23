# AI 協作協議 — GitHub 即通道(2026-08-12,Ting 核准)

Ting 不再當 AI 之間的傳話人。ChatGPT(SOL)每小時審 `guot-beep/acuting-os`;
repo 本身就是非同步溝通通道。

## 兩個共享檔

| 檔案 | 方向 |
|---|---|
| `docs/AI_WORK_HANDOFF.md` | Claude(Fable/Sonnet)→ SOL |
| `docs/AI_REVIEW_FEEDBACK.md` | SOL → Claude |

## 每個新工作區塊開始前(Fable/Sonnet 必做)

1. `git fetch/pull` 最新分支狀態。
2. 讀 `AI_REVIEW_FEEDBACK.md`;比對 reviewed SHA 與現在 HEAD——**明顯過期的
   review 不盲從**。
3. 遵守最新明確狀態:`CONTINUE` 繼續 / `PAUSE` 停該範圍並查明 /
   `CODEX AUDIT` 停里程碑備審 / `ROUTE TO SONNET`、`ROUTE TO ANTIGRAVITY`
   照路由,不燒 Fable quota。

## 每個 coherent 里程碑(或約每小時)更新 HANDOFF

里程碑優先於時鐘——**不為湊 60 分鐘製造半成品 commit**。格式(全部必填):
CURRENT STATE(agent/branch/HEAD/phase/task)· COMPLETED SINCE LAST HANDOFF
(檔案、schema 變更、validators 與數字)· IN PROGRESS(什麼安全/什麼未驗)·
RISKS / QUESTIONS · NEXT INTENDED TASK · ROUTING RECOMMENDATION
(Fable 留什麼/Sonnet 接什麼/Codex 審什麼/Antigravity 接什麼/要不要 Opus)。

讀到新 review 時,在下一份 handoff 記:`LAST_CHATGPT_REVIEWED_SHA`、
`LAST_FEEDBACK_COMMIT`、`REVIEW_ACKNOWLEDGED: yes`;若 review 指出問題,附
`RESPONSE_TO_REVIEW`(修了什麼、commit SHA、驗證結果)。

## 內容/研究請求

**下單前置(2026-08-11 起,Ting 裁定,對 Fable/SOL/Codex 一體適用):先查**
`docs/research_packs/RESEARCH_ASSET_INDEX_2026-08-11.md`(權威版本清單)與
`DO_NOT_USE_SUPERSEDED_ASSETS.md`,再盤五處(本 repo 含 untracked、origin/main、
pattern-v2-implementation、acuting-antigravity worktree、Downloads)。**只下 delta 單**,
引用既有檔案路徑。SOL 產出新資產時同步更新 INDEX。

缺醫學、中醫、藥理、補充劑、生活型態、來源等內容時,**不停下來等 Ting 轉信**,
在 HANDOFF 加結構化請求:

```yaml
CONTENT_REQUEST:
  request_id: CR-###
  entity_id: <canonical or candidate ID>
  type: <condition|pattern|drug|supplement|lifestyle|exposure|...>
  priority: P0|P1|P2|P3
  needed_for: <implementation reason>
  missing: [<field/data need>]
  desired_output: <MD|JSON|source pack|vocabulary|audit>
  target_staging_area: <path if known>
  acceptance: [source-backed, provenance recorded, no invented claims]
```

SOL 可能研究後 commit 一個 staging artifact 進 repo。
**SOL 的 staging 絕不自動成為 canon** —— 照常走 ingestion/validation/review 閘門。

## 防迴圈

不為回應 review 而造空 commit;不對「只改 AI_REVIEW_FEEDBACK.md 的 commit」
再回一個空狀態 commit。只在有真實作、真 handoff、真修正、研究請求或重要
路由決定時才 push。

## 高風險里程碑(過線就等外審,不深蓋)

Patient wiring · Clinical schema/DDL · migration · med.*→drug.* ·
exposure/ledger 歷史 · export/import 格式 · PHI/隔離 · 落 main · Cloudflare
production。這些做完:commit → push → 更新 HANDOFF → 可行就等下一輪 SOL
review;SOL 或 Fable 建議 Codex audit 時,該範圍停住不往上蓋。

## Codex 通道(2026-08-11 起,Ting 不再傳話)

- **Fable → Codex**:任務寫進 `docs/CODEX_TASK_QUEUE.md` 最上方「⚡ NEXT TASK」
  並 push。Ting 開 Codex session 只需固定一句:「照佇列」。
- **Codex → Fable**:結論寫 `AI_REVIEW_FEEDBACK.md` + `CODEX_HANDOFF.md`,
  commit+push——Fable 監聽 origin,新 commit 自動接手,無需人工轉達。
- **即時通道(Ting 已授權)**:必要時 Fable 可直接操作 ChatGPT 桌面 app
  (computer-use)讀取/回覆 Codex session;repo 檔案仍是正式紀錄,app 對話
  只用於加速,不取代 repo 內的可稽核交接。

## 分支與角色

- 永遠先確認實際工作分支;落 main 後**兩個共享檔都要更新**指向新真相。
- 禁 `git add -A`;無主髒檔不碰(見 SPRINT brief 十條)。
- SOL = 外部架構/產品審閱 + 研究供應 + 跨 agent 路由;Fable = 架構主導 +
  高風險實作 + 本地路由;Sonnet = 契約定案後的有界實作;Codex = 獨立審計;
  Antigravity = 批量內容。Ting 只管:臨床/產品偏好、不可逆、隱私、優先序。
