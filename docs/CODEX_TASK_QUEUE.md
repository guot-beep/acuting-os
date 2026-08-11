# Codex Task Queue

## ⚡ NEXT TASK: C2B-R9 — pointer-aware runtime 契約審計(新 gate,取代已作廢的 R8 GO)

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
