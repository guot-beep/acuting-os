# 2026-08-02 Codex - Quality snapshot refresh + TE filter fix
- Scanned current status: Acupoints 361/361 standard-channel template-grade; Herbs 329 local cards, NCBAHM Appendix A 304/304 closed, 93 template-grade, 37 source_checked; Formulas 201 total, 153 with composition, 2 template-grade; Conditions 150; Comparisons 41.
- Updated `data/audits/missing_report.json` so Quality distinguishes framework / made / grade / verified and no longer shows stale 327/79 herb numbers.
- Updated `app.js` Quality progress logic to read audit-layer counts and use formula composition count for Made.
- Fixed Acupoint 14-channel branch filtering: TE now matches exact point-code prefix only, preventing LI points from appearing because "Large InTEstine" contains `TE`.
- Fixed the acupoint runtime adapter / validation mismatch: `validate-data.js` now matches the current 769-point runtime layer and confirms contraindication / safety lines survive adaptation.
- Added `scripts/validate-extra-point-standard.js` for repeatable 經外奇穴 audit: 72 records, 60 with issues, 16 missing numeric depth, 0 missing source URL; this backlog is now recorded in Quality data.
- Validation: build-data, app.js syntax, interaction audit, acupoint-standard, comparison-standard, herb-standard, formula-standard, validate-data, and extra-point audit PASS.
# 2026-08-02 Codex — Tian Hua Fen + renderer guard
- Reworked `herb.tian_hua_fen` to template-grade draft from Chenoweth curriculum + NCBAHM 2026 CH Appendix A + American Dragon + CloudTCM.
- Separated actions, indications, contraindications, cautions, modern pharmacology, dose notes, Exam Pearl, and field-level sources.
- Added `js/knowledge.js` `asList()` guards so Herbs / Formulas / Conditions do not all fail when one record has a string where an array is expected.
- Validation: build-data, herb-standard Clear Heat worklist, content-junk, interaction audit, JS syntax, and diff-check PASS.
- Manual check needed: Ctrl+F5 then open `#ws/herb`, `#ws/formula`, `#ws/condition` and confirm cards render.
# AcuTing OS Project Log

## 2026-08-01 Codex — 安宮牛黃丸 template-grade 修整 + 雄黃／硃砂安全連結卡

- 依最新來源規則重修 `formula.an_gong_niu_huang_wan`：中藥／方劑只用 NCBAHM/隊列線索、課件、American Dragon、CloudTCM；本方未找到 American Dragon 精確方劑頁，因此不列 AD formula source。
- 安宮牛黃丸補齊 actions、pattern indications、contraindications、cautions、exam pearl、三寶鑑別、方劑家族、加減、舌脈、現代應用／藥理、administration 與逐欄 `field_sources`。CloudTCM 精確頁改為 `https://cloudtcm.com/formula/4361`；課件為 `curriculum/formulas/Herbal Formulations Comprehensive.docx.md`。
- 因方劑 template-grade 後 validator F12 會要求 composition 的每味藥存在於中藥 canon，新增 `herb.xiong_huang`、`herb.zhu_sha` 兩張「安全連結卡」：以 American Dragon + CloudTCM 精確頁補性味、歸經、劑量、禁忌、毒性安全與安宮／紫雪丹關聯；不假裝已做完整課件精修。
- `data/herbs/herb_canon_shortlist.json` local herb cards 327 → 329；`build-data.js` 後 runtime 顯示 herbs 329、formulas 201。
- Validation：`build-data.js` PASS；`validate-formula-standard.js --worklist --category "開竅劑 / Open the Orifices" --all` PASS，安宮牛黃丸已退出 worklist，該分類剩紫雪丹、至寶丹、蘇合香丸；`validate-herb-standard.js --worklist --category "驅蟲藥 / Expel Parasites" --all` PASS structural；`validate-content-junk.js` PASS；`validate-interactions.js` PASS；`git diff --check` PASS。
- Known existing validation failures：`validate-data.js` 仍 FAIL 於穴位 runtime safety lines/defaultPoints total；`validate-encoding.js` 仍 FAIL 於既有 CloudTCM import mojibake、`diagram_urls_zh` URL 欄位誤報與既有資料。這些不是本次安宮／雄黃／硃砂改動新增；本次 target records 已做 mojibake 快檢為 clean。

## 2026-08-01 Codex — 接手後實測 Quality 進度，修正穴位 Grade 數字

- Pull/接手檢查：`main` 與 `origin/main` 同步；tracked 工作樹乾淨。只看到一批 `curriculum/conditions/` untracked 課件，視為 Ting 新增來源資料，本次未碰。
- 重新實測 Antigravity/Claude handoff 宣稱：`validate-acupoint-standard.js --worklist --all` PASS，**361/361 standard-channel points template-grade，0 worklist defects**；`validate-interactions.js` PASS。
- 中藥現況：`validate-herb-standard.js` PASS 結構檢查，327 records；但 bilingual tags / contraindications / modern_functions 等內容品質缺口仍存在，不能視為 327 張都已精修完成。
- 方劑現況：`validate-formula-standard.js` FAIL，3 個 blocking defects：`formula.an_gong_niu_huang_wan`、`formula.zi_xue_dan`、`formula.fang_feng_tong_sheng_san` 的君藥數量超過 validator 允許範圍。方劑仍是下一個明顯阻塞點。
- 更新 `data/audits/missing_report.json` 與 `docs/SCHEDULE_2026-08.md`，把穴位 Grade 從舊的 97/361 改成實測 361/361；Verified 仍維持 1，因為那是 Ting/RV1 人工源審核，不由 AI validator 自動推進。
- 依 Claude 指示新增 `docs/ANTIGRAVITY_VALIDATION_PROTOCOL.md`：Antigravity 批量輸出要做 content-loss audit，不只看 validator；精修時中藥/方劑走 NCBAHM outline → 課件 → American Dragon → CloudTCM，針灸走 NCBAHM outline → 課件，課件不足再補 eLotus / American Dragon。
- 修正 3 首方 F7：安宮牛黃丸、紫雪丹、防風通聖散只調整 `composition[].role_zh/en`，保留組成與劑量，並在 `composition_source_note_zh` 記錄角色正規化依據。重跑 `validate-formula-standard.js` 後 PASS，0 blocking defects。
- 依 Claude 指示新增 `docs/ANTIGRAVITY_VALIDATION_PROTOCOL.md`：Antigravity 批量輸出要做 content-loss audit，不只看 validator；精修時以 NCBAHM outline → 課件 → CloudTCM / American Dragon / eLotus 的來源階層補 Exam Core 與結構化欄位。
- 修正 3 首方 F7：安宮牛黃丸、紫雪丹、防風通聖散只調整 `composition[].role_zh/en`，保留組成與劑量，並在 `composition_source_note_zh` 記錄角色正規化依據。重跑 `validate-formula-standard.js` 後 PASS，0 blocking defects。

## 2026-07-29 Claude — Aug→Dec schedule written for parallel AI dispatch (`docs/SCHEDULE_2026-08.md`)

- Ting is dispatching other AIs to sprint through August (穴位卡優化 + 方劑卡建立) and asked what comes after. Wrote the Aug→Dec schedule against the honest `quality_layers` numbers rather than the BLUEPRINT week counts, since the herb sprint finished ahead of the Phase 1 estimate.
- **Found the blocker Ting's August plan walks into:** formula template-grade is 0 not because content is bad but because there is no yardstick — `stamp-herb-card-grade.js` exists, the formula equivalent does not, and there is no Appendix C coverage report (herbs have `herb_outline_coverage`, formulas have nothing). Appendix C = **181 formulas** vs 201 local records, and nobody has ever diffed them. Mass-producing formula cards before those two tools exist reproduces the 2026-07-22 failure exactly (202 herbs / 26 shared sentences / 8 validators green / reported complete). So week 1 of August is tooling (F0 + F1), owned by Claude, not handed to a production agent.
- Schedule shape: Aug wk1 tooling → Aug wk2-4 **two** production lines only (acupoints 264 remaining, BL's 67 deliberately last for safety-field reasons; formulas by Appendix C) → Sep 病症 + 辨證鑑別 comparison tables (highest pre-exam ROI, Ting-supplied content) → Oct deploy + RV1 verification sprint → Nov/Dec patient hub + SQLite + CG4/CG10.
- Two risks recorded: (1) opening three production lines in August leaves all three layers at partial in October — the herb layer already carries 248 partial cards behind a "304/304" headline, so 中藥 upgrade is pushed to September; (2) verified counts (acupoints 1 / herbs 0 / formulas 0) cannot be moved by any AI — only Ting's RV1 taps move that bar, so daily RV1 has to start in August, not October.
- Throughput estimates are grounded in measured history (40 missing herb cards in 2 days across 2 agents ≈ 10/day/line), not invented: 264 points ≈ 13 working days for two lines; formulas are heavier at 3–5/day/line, so August covers high-frequency Appendix C only, never all 181.

## 2026-07-29 Claude — Ting's ChatGPT site review recorded as the Clinical Graph Track (mid/long-term direction)

- Ting reviewed the site with ChatGPT and brought back seven directions (case structure, bidirectional links, outcome tracking, reflection, review queue, search priority, new evaluation weights). Digested and reconciled against the repo rather than filed verbatim: new `docs/CLINICAL_GRAPH_TRACK.md` (CG1–CG13 + acceptance criteria + DON'Ts).
- Key reconciliation: **most of it already has a skeleton.** Patient → Episode → Visit is already `patients → cases → visits` in `schema.sql` ("Episode" = an existing `case` row) — documented as a hard "do not add an `episodes` table". `visit_outcomes` + `outcome_metrics.json` (12 metrics) already fit the tracking need; reflection fields (LL1 three visit columns + `case_reflections`) already landed. The real gaps are runtime/UI (no patient entity in `acuting-clinical-cases-v1`), a 13-item metric vocabulary shortfall (notably `effect_duration_days`), 3 reflection columns, and search not covering the clinical layer.
- New: **DECISIONS D9 (LOCKED)** — clinical usage stats. First draft of this decision said "never persist" on privacy grounds; **Ting corrected it mid-session and was right** — "18 例" is a count, it names nobody, and she records no names. Revised: runtime by default, a dated snapshot MAY be committed (`data/audits/clinical_usage_snapshot.json`), but an aggregate may never be a field inside a canonical knowledge record — that reason is engineering, not privacy (it goes stale silently = the 最重罪 fake number, and it churns the knowledge diffs D7 exists to protect). Residual privacy risk narrowed to small-n cells in the FUTURE public export → suppress n < 5 there; private app shows every n with the n displayed.
- **DECISIONS D4 addendum — "coarsen, never falsify"** (Ting asked whether to record sex reversed and age −10 from now on; answer: no). Sex/age are clinically load-bearing (月經 vs 前列腺; 腎氣 stage, dosing, red-flag weight), so falsifying them makes the three-year dataset teach the wrong patterns while buying no privacy — sex + age band identify nobody; names/DOB/employer/free text are the real vector and are already handled. Also: a remembered transform silently half-applies. If more protection is wanted: age band or the existing `birth_year`-only field, keep sex accurate, stay strict on free text.
- **Implemented the two cheap-now items** from the approved plan: **CG6** — `outcome_metrics.json` 12 → 22 metrics (added `sleep_hours`, `sleep_onset_minutes`, `night_wakings`, `mood`, `bloating`, `bowel_frequency`, `menstrual_flow_volume`, `menstrual_clots`, `post_treatment_reaction`, `effect_duration_days`), backfilled `label_zh`/`label_en` on all 22, and anchored the 0–10 scales (which end is "good" was previously unwritten). Deliberately did NOT add `fatigue` (→ existing `energy_level`) or tongue/pulse metrics (→ `visits.tongue_*`/`pulse_*`) — one fact, one home. **CG9** — `case_reflections` + `what_changed` / `what_surprised` / `what_to_study` (optional, never model-prefilled; `what_to_study` feeds the review queue).
- Recorded Ting's new evaluation weights (data structure 20% / search 18% / case-knowledge links 18% / tracking 15% / efficiency 10% / mobile 8% / backup 7% / visual 4% / SEO ≈ 0), with the reading spelled out: visual 4% means "the look is settled, stop redoing it", and SEO ≈ 0 confirms the existing private-system posture rather than changing it.
- Pointers wired: `BLUEPRINT.md` §4 roadmap tail, `NORTH_STAR.md` §7 item 8. No code, data, or schema changed this session — direction recording only.

## 2026-07-29 Codex — Quality four-layer progress model

- Updated the Quality progress table to separate four meanings that were previously conflated: framework/cards exist, made/content filled, grade/template-level, and verified/source-checked.
- Added concrete current counts to `data/audits/missing_report.json.quality_layers`: acupoints 751 framework / 97 of 361 standard-channel template-grade; herbs 327 local cards / 304 of 304 NCBAHM Appendix A made / 79 template-grade / 248 partial; formulas 201 framework / 152 made with grade tracking not yet established.
- Fixed stale top-level herb audit summary that still said 291 local herb cards and 266/304 coverage after the Appendix A gap had already closed.
- Validation: build-data PASS; app.js syntax PASS; validate-interactions PASS; validate-acupoint-standard PASS; validate-herb-standard PASS; git diff --check PASS.

## 2026-07-29 Claude — NCBAHM CH missing herbs batch 16 (FINAL, network-verified): Zao Jiao Ci, Zhen Zhu — Appendix A gap CLOSED

- Built the final 2 cards from curriculum + live American Dragon + live CloudTCM, closing the Appendix A missing-card gap opened 2026-07-28: **herb_outline_coverage is now 304/304 matched, 0 missing.** Local herb cards: 327.
- Ting caught mid-session that Appendix B (Chinese Herbal Pairs) hadn't been checked at all for batch12-15's 20 herbs — only `key_pairs: []` left by default, not by verification. Read the full Appendix B list (57 pairs) directly and confirmed none of the 20 herbs from batch12-16 appear in it. Updated `docs/HERB_CARD_TEMPLATE.md` §3.4a so both appendices are a required step before writing any future card.
- Same-session follow-up: swept all 20 herbs' already-fetched course/AD content for genuine combination statements (not formula-context lists or comparison notes). Added 4 real pairs to `herb_pairs.json`: 靈芝+酸棗仁, 蛇床子+苦參, 青黛+側柏葉+白茅根, 綠豆+甘草. The other 16 had no clean dui-yao statement in what was already gathered — not forced into pair records.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; card-grade stamper graded both `template`.

## 2026-07-29 Claude — NCBAHM CH missing herbs batch 15 (network-verified): Tan Xiang, Tu Bie Chong, Tu Fu Ling, Xi Xian Cao, Ye Ju Hua

- Built 5 more cards from curriculum + live American Dragon + live CloudTCM. Tu Bie Chong has no findable exact CloudTCM page this pass — built honestly from curriculum + AD only rather than guessing a URL.
- Updated Quality herb-outline audit from 297/304 matched / 7 missing to 302/304 matched / 2 missing; local herb cards now 325. Only Zao Jiao Ci and Zhen Zhu remain to close the Appendix A gap entirely.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; card-grade stamper graded all 5 `template`.

## 2026-07-29 Claude — NCBAHM CH missing herbs batch 14 (network-verified): She Chuang Zi, Shi Wei, Si Gua Luo, Suo Yang

- Built 4 more cards from curriculum + live American Dragon + live CloudTCM. She Chuang Zi and Si Gua Luo have no exact canon category match (dual topical/internal use, and cross-framing between sources respectively) — classified into the closest existing bucket with the reasoning recorded in each card.
- Updated Quality herb-outline audit from 293/304 matched / 11 missing to 297/304 matched / 7 missing; local herb cards now 320.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; card-grade stamper graded all 4 `template`.

## 2026-07-29 Claude — NCBAHM CH missing herbs batch 13 (network-verified): Lu Lu Tong, Ou Jie, Qin Pi, Qing Dai, Sang Zhi

- Built 5 more cards from curriculum + live American Dragon + live CloudTCM. Updated `docs/HERB_CARD_TEMPLATE.md` first to document the 10 record-level metadata fields the template's own field list had never listed (found while fixing batch12's gap) — batch13 was diffed key-for-key against `herb.he_tao_ren` before validating.
- Real find: opened CloudTCM's Sang Zhi page directly and caught it contradicting itself — its "傳統功效" prose section describes a different herb's properties (reads like 桑葉/桑白皮) while its own "基本資訊" tab agrees with curriculum + American Dragon. Excluded the bad section explicitly rather than quietly folding it in.
- Updated Quality herb-outline audit from 288/304 matched / 16 missing to 293/304 matched / 11 missing; local herb cards now 316.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; card-grade stamper graded all 5 `template`.

## 2026-07-29 Claude — NCBAHM CH missing herbs batch 12 (network-verified): Kun Bu, Lian Xu, Lian Zi Xin, Ling Zhi, Lu Dou

- First re-confirmed the dedup trap in Ting's forwarded 23-item list: Sha Yuan Ji Li / Yin Chen were already fixed on this branch as `herb.sha_yuan_zi`/`herb.yin_chen_hao` (aliases added, no duplicates) — real gap was 21, not 23.
- Built 5 full herb cards with live-fetched American Dragon + CloudTCM pages (this session has network access) plus Chenoweth curriculum files, following the `herb.he_tao_ren` template: source conflicts kept side by side (species basionym for Kun Bu, dosage ranges for all five), no fake consensus.
- Updated Quality herb-outline audit from 283/304 matched / 21 missing to 288/304 matched / 16 missing; local herb cards now 311.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; card-grade stamper graded all 5 `template` (full pass). Full validate-data/validate-encoding/validate-herb-canon still fail on pre-existing issues unrelated to this batch (acupoint safety lines, CloudTCM/Tung import encoding, and a legacy herb schema ~175 pre-existing records already fail) — confirmed pre-existing by comparing failure counts before/after this batch.

## 2026-07-29 Codex — homepage video asset

- Replaced the static homepage illustration render with Ting's `curriculum/Home/Home.mp4` video while keeping `assets/home-acuting-watercolor.png` as the poster fallback.
- Added `.home-art__video` styling so the video keeps the same rounded, softly shadowed homepage visual treatment as the prior image.
- Kept the video as a local repo asset under `curriculum/Home/` per Ting's placement; no data records, generated files, or TCM content changed.
- Validation: `validate-interactions.js` PASS using bundled Node; `git diff --check` PASS.

## 2026-07-29 Codex — NCBAHM CH missing herbs batch 11

- Added full formal herb cards for 核桃仁、胡椒、槐米、金櫻子、粳米 from NCBAHM 2026 CH Appendix A + Chenoweth course notes, with CloudTCM/American Dragon used only where exact usable pages or explicitly labeled contextual support were actually reviewed.
- Added ten sourced herb-pair records, including NCBAHM 2026 CH Appendix B `地榆 + 槐米`, plus AD/course-supported pairs for 核桃仁、胡椒、金櫻子、粳米.
- Updated Quality herb-outline audit from 276/304 matched and 28 missing to 281/304 matched and 23 missing; local herb cards are now 306.
- Source honesty notes: 核桃仁 CloudTCM exact page was not found, so only 野核桃仁 is cited as contextual/variant support; 粳米 exact CloudTCM page was not found, so CloudTCM is only contextual via 粳米泔/formula use. 粳米 is placed under 補虛藥 / Tonify Qi because the current canon has no food-grain category, with note that it is mainly a food-medicinal Stomach-protecting assistant.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; batch11 targeted bilingual/source/pair/property-contamination QA PASS. Full validate-data/encoding still fail on known pre-existing acupoint/defaultPoints/import encoding issues outside this herb batch.

## 2026-07-29 Codex — NCBAHM CH missing herbs batch 10

- Added full formal herb cards for 栝樓皮、栝樓仁、海螵蛸、海桐皮、海藻 from NCBAHM 2026 CH Appendix A + Chenoweth course notes, with CloudTCM/American Dragon used only where exact usable pages or explicitly scoped source support were actually reviewed.
- Added ten sourced herb-pair records for 栝樓皮 chest-Bi/phlegm-heat pairings, 栝樓仁 dry cough/constipation pairings, 海螵蛸 astringent/safety-conflict pairings, 海桐皮 wind-damp pairings, and 海藻/昆布 soft-hardness pairing.
- Updated Quality herb-outline audit from 271/304 matched and 33 missing to 276/304 matched and 28 missing; local herb cards are now 301.
- Source honesty notes: Gua Lou Ren American Dragon direct page was not used; Hai Zao uses course + CloudTCM + incompatibility course, with AD not listed as a formal source because the direct page was not usable in this pass. Hai Piao Xiao/Bai Ji pair is marked as source-conflict review because AD/CloudTCM also list incompatibility warnings.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; batch10 targeted bilingual/source/pair/mojibake QA PASS. Full validate-data/encoding still fail on known pre-existing acupoint/defaultPoints/import encoding issues outside this herb batch.

## 2026-07-29 Codex — NCBAHM CH missing herbs batch 9

- Added full formal herb cards for 覆盆子、蛤蚧、狗脊、骨碎補、谷芽 from NCBAHM 2026 CH + Chenoweth course notes, with CloudTCM/American Dragon used only where exact pages were actually reviewed.
- Added eleven sourced herb-pair records for Fu Pen Zi urinary/vision leakage pairs, Ge Jie Lung-Kidney grasping-Qi pairs, Gou Ji Liver-Kidney/Wind-Damp pairs, Gu Sui Bu fracture/Blood-stasis pairs, and Gu Ya food-stagnation pairs.
- Updated Quality herb-outline audit from 266/304 matched and 38 missing to 271/304 matched and 33 missing; local herb cards are now 296.
- Source honesty notes: Ge Jie AD direct page was blocked this pass and not listed as a formal source; Gu Ya CloudTCM exact page was not found and not listed; Gu Sui Bu uses course + CloudTCM without AD.
- Validation: build-data PASS after one transient Windows generated-file lock retry; herb-standard PASS; content-junk PASS; batch9 targeted bilingual/source/pair/mojibake QA PASS. Full validate-data/encoding still fail on known pre-existing acupoint/import issues outside this herb batch.

## 2026-07-29 Codex — make exterior-pattern chips conservative

- Fixed a false-positive exterior-pattern chip issue: 麻黃 could be incorrectly labeled 表虛 because the UI scanned clinical-note contrast text such as “表虛有汗更偏桂枝” as if it were Ma Huang’s indication.
- Exterior-pattern chips now derive only from positive category/tag/indication/pattern fields, not clinical notes, summaries, exam pearls, actions, or functions where negation and comparison language are common.
- Removed overly broad symptom-only triggers such as 自汗, 口渴, 無汗, and 脈浮緊 from chip inference; pattern labels now require explicit pattern wording or board-style English terms.
- Validation: `js/knowledge.js` syntax check PASS; `validate-interactions.js` PASS; `git diff --check` PASS.
- Manual check: 麻黃 should no longer show 表虛; 桂枝 may show 表虛 only when its positive source fields state 營衛不和/表虛.

## 2026-07-29 Codex — soften exterior-pattern chip colors

- Softened the new exterior-pattern chips so 風寒/風熱/暑濕/表虛/表實 remain distinguishable without visually overpowering herb/formula cards.
- Reduced pattern-chip font size/weight and replaced saturated blue/red/purple colors with muted parchment-compatible tones.
- Validation: `js/knowledge.js` syntax check PASS; `validate-interactions.js` PASS; `git diff --check` PASS.
- Manual check: search 麻黃, 桂枝, 葛根; confirm pattern chips feel like gentle hints rather than warning labels.
- No data/content records changed.

## 2026-07-29 Codex — distinguish TCM cold patterns in lookup chips

- Added a front-end TCM exterior-pattern hint layer for herb/formula lookup cards so biomedical `感冒 / Common cold` tags do not flatten board-relevant distinctions.
- Cards now derive colored context chips from existing fields such as category, condition tags, indications, actions, syndromes, and pattern indications: 風寒感冒, 風熱感冒, 暑濕感冒, 表虛感冒, 表實感冒, and 風寒束肺.
- If a card is broadly tagged as cold/URI/exterior but no specific pattern is detectable, it shows `感冒類：待辨風寒/風熱` instead of pretending the pattern is known.
- This is display-only and preserves all immutable IDs and source data; detailed data cleanup still belongs to the herb-card verification batches.
- Validation: `js/knowledge.js` syntax check PASS; `validate-interactions.js` PASS; `git diff --check` PASS.

## 2026-07-29 Codex — fix Public EN toggle on herb/formula pages

- Fixed a mode-sync bug where clicking `Public EN` / `中英版` while already on the herb or formula workspace changed global UI state but did not re-render the lookup grids.
- Herb and formula grids now listen to `acuting:content-mode` and redraw their cards, summaries, and human-readable tag/formula/safety labels immediately.
- Category filter chips now also switch display order by mode: 中英版 keeps Chinese first with English sublabel; Public EN shows English first with Chinese sublabel.
- Validation: `js/knowledge.js` syntax check PASS; `validate-interactions.js` PASS; `git diff --check` PASS.
- Manual check: open `#ws/herb` or `#ws/formula`, search/filter something, then click `Public EN` and `中英版` without returning home; labels should switch in-place.

## 2026-07-29 Codex — herb/formula lookup label resolver

- Fixed herb/formula lookup cards so internal IDs no longer render as user-facing labels: modern tags, safety review flags, and related formula IDs now pass through bilingual/English display resolvers.
- Chinese/bilingual mode now shows labels like `感冒 · Common cold` and `麻黃湯 · Ma Huang Tang`; Public EN mode shows English-facing labels like `Common cold` and `Ma Huang Tang`.
- Kept immutable IDs unchanged for search/data integrity; this is display-only, not a data migration.
- Validation: `js/knowledge.js` syntax check PASS; `validate-interactions.js` PASS; `git diff --check` PASS.
- Manual check: search herbs such as 麻黃/桂枝 and confirm no `common_cold`, `uri`, `formula.ma_huang_tang`, or `pregnancy_priority_review` chips appear in the card list.

## 2026-07-29 Codex — homepage watercolor illustration

- Replaced the experimental inline SVG homepage art with Ting's selected watercolor-style AcuTing illustration as the single local image asset: `assets/home-acuting-watercolor.png`.
- Updated `index.html` to render the image with descriptive alt text and updated `styles.css` so the homepage artwork is centered, responsive, softly rounded, and lightly shadowed.
- This is an explicit one-image exception to the earlier no-image default because Ting chose the image and the whole site currently uses only this one homepage artwork.
- Validation: `validate-interactions.js` PASS; `git diff --check` PASS.
- Manual check: open `#ws/home` on desktop and phone width; confirm the image size, crop, and visual weight feel right.

## 2026-07-29 Codex — Public EN homepage interface

- Added Public EN mode text switching for the home page, top brand title, right-side navigation panel labels, home search button/placeholder, lotus caption, and unified search-result UI labels.
- Kept bilingual mode unchanged; the new behavior only activates when the existing `Public EN` button sets `contentMode="english"`.
- Implemented this as small `data-mode-text` / `data-mode-aria-label` attributes plus one shared `modeText()` helper in `app.js`, so there is no duplicate homepage to maintain.
- Validation: JS syntax checks PASS for `app.js`, `js/knowledge.js`, and `js/router.js`; `validate-interactions.js` PASS.
- Manual check: open homepage, click `Public EN`, confirm the home hero/search/navigation labels switch to English; click `中英版`, confirm the original bilingual interface returns.

## 2026-07-29 Codex — NCBAHM CH missing herbs batch 8

- Added full formal herb cards for 地膚子、冬蟲夏草、冬瓜子、冬葵子、蜂蜜 from NCBAHM 2026 CH + Chenoweth course notes + CloudTCM, with American Dragon used only where exact usable pages or explicitly labeled snippets were available.
- Added fourteen sourced herb-pair records, including source-supported pairs that reference still-missing herb IDs; per Ting's rule, those pending herb links are preserved for later card creation instead of being deleted.
- Updated the herb record standard: source-supported 對藥 may reference a pending herb ID before the target herb card exists; front-end should keep it plain/pending until the card is built.
- Updated Quality herb-outline audit from 261/304 matched and 43 missing to 266/304 matched and 38 missing; local herb cards are now 291.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; batch8 targeted bilingual/source/pair QA PASS with allowed pending pair-linked herb IDs; git diff --check PASS. Known pre-existing full-suite issues remain outside this herb batch.

## 2026-07-28 Codex — NCBAHM CH missing herbs batch 7

- Added full formal herb cards for 沉香、赤小豆、川木通、椿皮、刺五加 from NCBAHM 2026 CH + Chenoweth course notes + CloudTCM, with American Dragon used only where exact pages were actually usable.
- Added seven sourced herb-pair records: 沉香/烏藥/肉桂/小茴香, 沉香/丁香/白豆蔻/紫蘇葉/生薑, 赤小豆/麻黃/連翹/桑白皮, 赤小豆/當歸, 川木通/車前子/梔子/滑石, 椿皮/黃柏/梔子/車前子, 刺五加/杜仲/桑寄生.
- Corrected source honesty for 刺五加: American Dragon exact URL was attempted but blocked/placeholder in this pass, so it is not shown as a formal source or top external link.
- Updated Quality herb-outline audit from 256/304 matched and 48 missing to 261/304 matched and 43 missing; local herb cards are now 286.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; batch7 targeted bilingual/source/pair/property QA PASS; git diff --check PASS. Known pre-existing missing pair ref remains `pair.ju_he__chuan_lian_zi` → `herb.ju_he`.

## 2026-07-28 Codex — search fallback route repair + herb/formula lookup UX

- Investigated Ting-reported issue that search/click links appeared nonfunctional after `update.bat`.
- Confirmed `validate-interactions.js` PASS and generated knowledge/app data can load without syntax errors; no evidence of git overwrite or missing herb data.
- Updated `app.js` fallback routing for formula/herb search results and SOAP formula/herb links from legacy section anchors to workspace hashes (`#ws/formula`, `#ws/herb`) so navigation still works if the knowledge-detail API is not ready.
- Removed stale `Herb Records` / `Formula Records` source-review mini text from lookup pages; that audit/status language belongs in Quality, not the daily search interface.
- Moved the long herb and formula category chip lists into collapsed drawer controls, with stronger clickable styling and visible counts so search results sit higher on the page.
- Added lightweight Public EN support for herb/formula lookup controls: search placeholders and drawer open/close labels switch to English when the existing Public EN mode is selected.
- Reverted generated timestamp-only diffs; no data/herb content changed in this repair.
- Validation: `validate-interactions.js` PASS; JS syntax check PASS for `app.js`, `js/knowledge.js`, and `js/router.js`.

## 2026-07-28 Codex — NCBAHM CH missing herbs batch 6

- Added full formal herb cards for 白果、白前、半枝蓮、蓽茇、萆薢 from NCBAHM 2026 CH + Chenoweth course notes + CloudTCM, with American Dragon used where verified.
- Added five sourced herb-pair records: 白果/麻黃/紫蘇子/杏仁, 蓽茇/高良薑, 蓽茇/延胡索/細辛, 萆薢/益智仁/烏藥, 萆薢/車前子/滑石/黃柏.
- Updated Quality herb-outline audit from 251/304 matched and 53 missing to 256/304 matched and 48 missing; local herb cards are now 281.
- Added backlog rule: if formula/herb work discovers a missing herb ID not on the current missing-card list, append it to the missing-card backlog instead of ignoring it.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; new-pair QA PASS; git diff --check PASS; validate-interactions PASS.

## 2026-07-28 Codex — NCBAHM CH missing herbs batch 5

- Added full formal herb cards for 仙茅、白花蛇舌草、白鮮皮 from NCBAHM 2026 CH + Chenoweth course notes + CloudTCM + American Dragon.
- Added/updated six sourced herb-pair records: 仙茅/淫羊藿 source update, 仙茅/杜仲, 白花蛇舌草/敗醬草/金銀花, 白花蛇舌草/茵陳蒿/黃柏/梔子, 白鮮皮/黃柏/苦參/防風, 白鮮皮/大黃/梔子.
- Updated Quality herb-outline audit from 248/304 matched and 56 missing to 251/304 matched and 53 missing.
- Preserved source dose differences in the requested format, including Xian Mao `3–10g（課件、AD）/ 3–9g（CloudTCM）`, Bai Hua She She Cao `15–30g（課件）/ 15–60g（AD、CloudTCM）`, and Bai Xian Pi `6–10g（課件）/ 4–16g（AD）`.
- Fixed Ting-caught Quality stat display bug: Herbs progress now uses NCBAHM 2026 CH board-outline coverage (`304` total and `251/304` made/covered) instead of the stale local-card/fill-count display (`273`, `269/273`) and refreshed audit metadata to 2026-07-28.
- Hid the obsolete `audit 2026-06-16` Quality summary cards (Verified / Records exist / Draft / Missing) because that older 361-only audit was stale and misleading.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; targeted bilingual/source/property-contamination QA PASS.

Use this file as the first-read context before each daily optimization session. After each session, add a new entry with date, scope, files changed, validation, commit hash, and next task.

## 2026-07-28 Codex — NCBAHM CH missing herbs batch 4 + dosage rule correction

- Added full formal herb cards for 木賊、白花蛇、硫黃 from NCBAHM 2026 CH + Chenoweth course notes + CloudTCM + American Dragon.
- Added six sourced herb-pair records for Mu Zei eye pairs, Bai Hua She Wind-Damp/convulsion pairs, and Liu Huang internal/external safety-relevant pairs.
- Updated Quality herb-outline audit from 245/304 matched and 59 missing to 248/304 matched and 56 missing.
- Fixed Ting-caught property/channel boundary issue: `properties_taste_temp` now stays pure taste/temperature/toxicity; source/channel differences are preserved in notes/sources.
- Updated Jue Ming Zi dosage display to preserve source differences: `6–10g（課件）/ 9–15g（AD、CloudTCM）`, with powder and dietary-use notes retained.

## 2026-07-28 Codex — NCBAHM CH missing herbs batch 3

- Added full formal herb cards for 漢防己、麻黃根、決明子 from NCBAHM 2026 CH + Chenoweth course notes + CloudTCM + American Dragon.
- Added six sourced herb-pair records: 漢防己/黃耆, 漢防己/桂枝/茯苓, 麻黃根/黃耆/牡蠣, 麻黃根/浮小麥/黃耆, 決明子/菊花, 決明子/夏枯草.
- Updated Quality herb-outline audit from 242/304 matched and 62 missing to 245/304 matched and 59 missing.
- Corrected 決明子 category to canonical `平肝息風藥 / Extinguish Wind` after validator caught the longer non-canon category string.
- Validation: build-data PASS; herb-standard PASS; content-junk PASS; git diff --check PASS. Full validate-data/encoding still fail on pre-existing unrelated acupoint/import issues.

## Daily Operating Rule

1. Read `PROJECT_LOG.md`.
2. Check git status.
3. Make one coherent source-aware improvement batch.
4. Validate JS/JSON/HTML as relevant.
5. Commit the change.
6. Add a new log entry.

## Fixed Weekly Optimization Schedule

- Monday: standard 361 acupoints, missing content filters, English locations, needling, safety.
- Tuesday: auricular GB93 indexing, candidate verification, external visual links.
- Wednesday: Master Tung index, zone organization, source and visual links.
- Thursday: formulas, herbs, patterns, contraindications, English public drafts.
- Friday: pathology graph, western medications, fertility workflows, TCM/biomed links.
- Saturday: clinical case notebook, SOAP templates, billing/documentation workflow.
- Sunday: UI/mobile polish, source registry, validation, backlog planning.

## Log Entries

### 2026-07-28 - NCBAHM CH missing herbs batch 2 (Codex)
- Scope: Created `herb.niu_huang`, `herb.shui_niu_jiao`, and `herb.wu_gong`; also fixed top external-link fields for the six newly created high-risk cards.
- Sources: NCBAHM 2026 CH Appendix A, Chenoweth herb curriculum, CloudTCM Shui Niu Jiao, and American Dragon Niu Huang / Shui Niu Jiao / Wu Gong.
- Files: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated data, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`.
- Validation: build-data, targeted three-card bilingual/source/dose QA, herb-standard, content-junk, and diff-check passed.
- Next: Continue the remaining 62 NCBAHM CH Appendix A missing herbs; suggested next high-risk set is Han Fang Ji, Ma Huang Gen, Jue Ming Zi, Mu Zei, Bai Hua She, Liu Huang, Xian Mao.

### 2026-07-28 - NCBAHM CH missing herbs batch 1 (Codex)
- Scope: Created `herb.ba_dou`, `herb.chuan_wu`, and `herb.cao_wu` as formal high-toxicity herb cards from the NCBAHM 2026 CH Appendix A missing-card list.
- Sources: NCBAHM 2026 CH Appendix A, Chenoweth herb curriculum, CloudTCM Ba Dou / Wu Tou, and American Dragon Ba Dou / Zhi Chuan Wu / Zhi Cao Wu.
- Files: `data/herbs/herb_canon_shortlist.json`, `data/herbs/herb_pairs.json`, `data/audits/missing_report.json`, generated data, `docs/CODEX_HANDOFF.md`, `docs/CODEX_TASK_QUEUE.md`.
- Validation: build-data, targeted three-card bilingual/source/dose QA, herb-standard, two category worklists, content-junk, and diff-check passed.
- Next: Continue the remaining 65 NCBAHM CH Appendix A missing herbs; suggested next high-risk set is Niu Huang, Shui Niu Jiao, Wu Gong, Han Fang Ji, Ma Huang Gen, Jue Ming Zi, Mu Zei.

### 2026-07-26 - Six-herb formal card sample (Codex)
- Scope: 蒲公英、桂枝、生薑、荊芥、防風、紫蘇葉，依正式 herb card template 補齊雙語欄位。
- Sources: Chenoweth 課件優先，交叉核對 CloudTCM 與 American Dragon；衝突並列且逐欄標註來源。
- Files: `data/herbs/herb_canon_shortlist.json`；生成檔由 `scripts/build-data.js` 重建。
- Validation: six-herb delta、herb standard、content junk 與 diff check 通過；全庫既有 validator failures 另記 handoff。
- Next: Ting 在 app 逐張審閱排序、禁忌與來源衝突，再決定是否擴充整批辛溫解表藥。

### 2026-07-22 - Bilingual CloudTCM disease index and Trigeminal Neuralgia (Codex)

Converted all 205 CloudTCM disease/symptom browse cards into 190 unique,
stable source-page records. Repeated cards now share one immutable
`cloudtcm.disease_entry.*` ID and retain every browse-category ID instead of
creating duplicate disease concepts. All 190 records have Chinese and
curated-draft English labels plus exact non-Google CloudTCM links.

The Conditions workspace now provides bilingual category filters, search,
pagination, source IDs, and exact-page buttons for this source index. These
records remain a symptom/disease vocabulary and are not automatically treated
as Western diagnoses or one-to-one mappings.

Upgraded the existing immutable `cond.trigeminal_neuralgia` record to a useful
bilingual study card with its exact CloudTCM page `/disease/tcm/36`, official
NHS English page, bilingual summary, alias, and medical-review prompt. The
record remains `draft`.

### 2026-07-22 - Bilingual Dyspepsia condition card and exact sources (Codex)

Upgraded `cond.functional_dyspepsia` without changing its immutable ID or
collapsing Western and TCM concepts. The Western title remains 功能性消化不良 /
Functional Dyspepsia; 消化不良, Dyspepsia, and Indigestion are searchable
aliases. CloudTCM's 上腹胃脘痛 is stored and displayed as a related symptom,
not an exact diagnostic translation.

Added two direct non-Google references: CloudTCM's exact Chinese page
`/disease/tcm/28325` and the official NIDDK English Indigestion (Dyspepsia)
page. The card includes bilingual summary and NIDDK-derived red-flag review
prompts, remains `draft`, and states that the mapping is not one-to-one.

The Conditions workspace now reads the 150-record condition canon, renders
only records that satisfy the existing bilingual safety-field gate, and adds
bilingual search plus exact source buttons. A dedicated validator enforces
HTTPS/direct links, no Google links, registered sources, bilingual labels,
the related-not-exact mapping, rendered output, and Dyspepsia search.

### 2026-07-22 - First CloudTCM formula-indication translation batch (Codex)

Added 58 curated-draft English labels to the 2473-record indication queue,
including high-frequency search terms such as 不寐, 痛經, 月經不調, 不孕,
偏頭痛, 胃痛, 腹痛, 便秘, and 哮喘. Traditional terms remain explicitly
identified where a simple Western-diagnosis translation would be misleading.

English authority lives in `data/config/cloudtcm_formula_indication_en.json`.
The extractor verifies each override's source ID and Chinese identity before
applying it, so source changes fail rather than silently cross-linking labels.
Coverage is now 58 bilingual / 2415 pending. The layer remains unwired.

### 2026-07-22 - CloudTCM disease and formula taxonomy source layer (Codex)

Added an additive, non-runtime taxonomy layer from CloudTCM's public Next.js
page data. It preserves 14 disease browse categories, 139 formula-function
categories, and all 2473 formula-indication labels with stable source IDs and
exact routes. No article text or images were copied.

The 14 disease categories and 139 function categories have curated-draft
English labels. The 2473 indication records deliberately keep `name_en: null`
with `pending_professional_translation`; they are a complete Chinese source
canon and translation queue, not a falsely completed bilingual dataset. A new
validator enforces counts, unique namespaced IDs, direct links, CJK labels,
and honest translation status. None of these files is wired into the app yet.

Validation: new vocabulary validator, JavaScript syntax, recursive JSON parse,
and eight standard validators passed. Existing content-quality baseline remains
36%; this taxonomy task does not claim to fill formula or condition prose.

### 2026-07-22 - Exact CloudTCM herb and Master Tung point links (Codex)

Replaced the broken Google/site-search source path with verified exact record
links. `scripts/fetch-cloudtcm-herb-map.js` resolves the 202-herb canon against
CloudTCM's public herb index/search API using exact Chinese identity matching;
201 records now have direct `/herb/<id>` pages. The one intentionally withheld
record is 牛膝: CloudTCM's candidate is 川牛膝, which is not a safe identity
substitution for the Bensky canon record. 大棗 was browser-verified at
`https://cloudtcm.com/herb/7`.

Added a resumable Master Tung sitemap/page identity extractor. All 277 Tung
records now have source-page Chinese names and exact point URLs. Browser QA
confirmed `T44.02` renders as 後椎穴 and links directly to
`/acupuncture/tung/points/houzhui-t-4402`. No article prose or remote images
were copied; only identity and link metadata were retained.

Runtime link helpers now return verified direct URLs or no link. The old
Google fallback was removed from both acupoint and herb cards. Build, syntax,
recursive JSON parsing, eight validators, and browser checks passed. Content
quality remains a separate fill task; this batch fixes identity and routing,
not the substantive herb/point descriptions.

### 2026-07-22 - RV1 in-app review, after measuring the real content gap (Claude)

Ting reported the site is not usable and everything is stuck in review.
Measured before acting, and the picture contradicted the impression:
acupoints are 361/361 complete on functions, indications and
contraindications in both languages, and herbs are 202/202 complete on
functions, properties, clinical-use note and safety flags. The real gaps
are formulas (composition on only 23/115 — 92 empty skeletons) and the
condition canon (content on only 25/150). Acupoint anatomy fields are 0%,
which is what Codex is currently staging.

Diagnosis: the bottleneck is not production, it is that the gate model
routes every record through one person, and asks her to review markdown
worksheets in a repo. Two agents stage faster than one human approves, so
previews pile up and the app stays empty. My own review worksheets were
adding to that queue.

RV1 addresses the review half. A two-button verdict control (內容正確 /
有問題 + note) now sits on acupoint detail and on formula/herb study
cards, so a verdict is a two-second action on the record being read.
Verdicts are stored in localStorage, exported as JSON, and applied by
`scripts/apply-review-verdicts.js` — dry-run by default. Confirmed
promotes draft -> source_checked with reviewed_by/reviewed_at; issue
never changes status, it only attaches review_issue so the record stays
visibly in need of work. The app still never writes canonical JSON, and
the script never touches content or safety-load fields.

Files: `js/review.js` (new), `scripts/apply-review-verdicts.js` (new),
`app.js`, `index.html`, `styles.css`, and a one-line guarded mount in
`js/knowledge.js` (Codex's file, noted in handoff).

Validation: 6 validators PASS, zero console errors. Browser QA: strip id
always matches the rendered record (checked across five points); confirm,
undo-by-second-click, issue-with-note, counter and export all work;
end-to-end export -> dry-run reported the right three changes with
canonical untouched. Test verdicts cleared from localStorage afterwards.

Commit: `7f8ff7a`. Open decision for Ting: split safety-load fields from
study fields so the 92 formula skeletons can fill as rendered drafts
instead of waiting on a per-record gate.

### 2026-07-21 - CS6 dialog segmentation + two Codex staging reviews (Claude)

Reviews (both ACCEPT, both preview-only, 0 canonical writes):
`27864b5` high-risk anatomy staging and `33882b5` protocol-table anatomy.
Spot-checked ST9, CV22/ST11, GV15/GV16, GB21/SI14/SI15, GV20 and the 16
peripheral-nerve candidates — anatomy correct throughout, and crucially no
needling depth is staged anywhere. Three provenance/merge notes recorded in
`docs/CODEX_HANDOFF.md`: the 16-point nerve list is an uncited background
assertion in PMC6624832 (whose study measured only LI13, which is missing);
ST9 has two legitimate source entries; and "first dorsal interosseous muscle"
names two different muscles across LI4 (hand) and LR3 (foot), so no merge may
key on muscle name. Earlier the same day, WHO staging `16b7f11` was used to
close the two genuine CloudTCM §A location conflicts (BL4, SI16) as
recommendations in the worksheet — still Ting-gated, 361.json untouched.

Then EXECUTION_PLAN 4.3, dialog segmentation, per
`docs/CASE_SOAP_FLOW_REVIEW.md`. The case intake dialog becomes five
fieldsets (identity / background / presenting problem / diagnosis+patterns /
goal+summary) and the SOAP dialog becomes visit-context + S / O / A / P +
outcome & reflection. Following the review doc, the four record-link fields
moved out of the top strip into A - Assessment, since links are assessment
content rather than visit context.

Files: `index.html`, `styles.css`. No data files touched. Field access
throughout app.js is via `form.elements[name]` and `FormData`, both
structure-independent, so segmentation cannot affect save or hydrate.

Validation: validate-data / validate-point-categories / validate-naming PASS.
Browser QA at 1280x900 and 375x812: all 21 case fields and all 38 SOAP fields
resolvable by name; sections render 2-col on desktop and 1-col on mobile with
no horizontal overflow; all seven CS4 link pickers re-attach in their new
sections (A: pattern/disease/condition/safety, P: acupoint/formula/medication)
and `outcomeMetricLinks` stays free text by design; save round-trip wrote 41
keys and re-hydrated correctly, including the reflection fields nested in the
`<details>` block. Zero console errors. Test case created in localStorage for
the round-trip was deleted afterwards; nothing clinical entered git.

Commit: `28e1440`. Next: 4.3's second half — Cases workspace reorder
(working area above scaffolds).

### 2026-07-21 - Extract protocol-table acupoint anatomy (Codex)

Added a second review-only anatomy batch from two open peer-reviewed human
studies. Twelve source-table rows cover 11 points with protocol tissue paths,
muscle/skin innervation, and segmental context. The fill-empty preview proposes
8 fields / 12 values, including structured muscles for seven points and muscle
plus nerve candidates for ST36. LR3 is intentionally withheld because two
studies name different muscle paths and innervation; the disagreement remains
visible for anatomy review instead of being normalized. Apply mode is rejected,
conflicts written to canonical data are 0, and canonical writes are 0.

### 2026-07-21 - Stage high-risk acupoint anatomy and safety evidence (Codex)

Registered six peer-reviewed anatomy/safety sources and built a review-only
high-risk lane without modifying `data/acupoints/361.json`. The ultrasound
study set covers 44 points across chest, abdomen, neck, shoulder/back, and
waist/hip regions. MRI, cadaver, GV20 anatomy, and peripheral-nerve articles
add 15 point-specific findings and 16 explicit point-nerve candidates. The
combined preview covers 66 unique points. A stricter fill-empty preview creates
34 field proposals containing 38 source-backed values for 28 points; three
already-populated safety fields are skipped, conflicts are 0, and canonical
writes are 0. Regional study membership remains a review prompt and is never
treated as complete point anatomy. No fixed safe depth is inferred from cohort
imaging. Eight standard validators, JavaScript syntax, and 483 JSON files pass;
encoding remains the known 768-finding baseline.

### 2026-07-20 - Build WHO acupoint source staging and gap inventory (Codex)

Replaced the vague "many fields pending" problem with a reproducible 361-point
gap inventory and source-lane plan. Core bilingual location, function,
indication, needling, and contraindication fields are complete, while the main
gaps are explicit moxa wording (343), cun measurement (231), anatomy terms
(296), structured muscles/bones/nerves/vessels (361 each), source traceability
(40), and exam/clinical study fields. Parsed the WHO 2008 point-location
standard into a 361-record review-only staging file with PDF page locators and
SHA-256; 356 entries came from the PDF text layer and five malformed-text-layer
entries were transcribed from rendered source pages with a separate extraction
method. A no-apply preview proposes filling 100 currently empty
`cun_measurement` fields from explicit WHO B-cun clauses; 131 remain unresolved,
0 conflicts, 0 canonical writes. The complete copyrighted PDF is not committed.

### 2026-07-20 - Preview herb comparison groups and related links (Codex)

Added a review-only H1 generator that reuses the 202-herb canon's 34 exact
bilingual categories as mechanical comparison-group boundaries. The preview
proposes `comparison_group`, same-group `related_herbs[]`, and an empty
`substitution_context_zh` for every herb: 1,430 directed ID links, 4 singleton
groups, 0 conflicts, and 0 canonical writes. Apply mode is intentionally
unsupported. Five groups larger than 10 herbs are explicitly flagged for
Ting/Claude boundary review before any canonical merge. No substitution
advice, dosage, efficacy claim, or clinical prose was generated. JavaScript
syntax, eight standard validators, and 468 data JSON files passed; encoding
remains the known 768-finding baseline.

### 2026-07-20 - Stage cool-exterior herb visual-link probe (Codex)

Extended the no-apply exact visual-link lane with Bo He, Chan Tui, Sang Ye,
Ju Hua, and Ge Gen. Each record carries one exact CloudTCM page and one HKBU
MMID material-image page, for 10 additional links. The batch preserves a real
source discrepancy instead of normalizing it away: CloudTCM's Bo He page
displays `Bao He`, while Chinese name, Mentha botanical identity, and
pharmaceutical identity match. The validator now accepts a pinyin mismatch
only when `source_typo_documented` and an explicit pinyin caveat are present.
Preview result: 5 herbs, 10 exact links, 0 conflicts, 0 canonical writes;
`--apply` remains rejected. Eight validators and 468 JSON files passed.
Encoding remains the known 768-finding baseline. No canonical, generated, or
UI data changed.

### 2026-07-20 - Stage five-herb exact visual-link probe (Codex)

Added a no-apply staging and preview workflow for exact single-herb image
references. The first probe covers Ma Huang, Gui Zhi, Zi Su Ye, Jing Jie, and
Fang Feng with two verified pages each: CloudTCM plus an HKBU MMID or MPID
image record. Page identity is checked against immutable herb ID, Chinese
name, normalized pinyin, and a botanical/pharmaceutical identity signal.
Per-link caveats record look-alikes, medicinal-part differences, and database
type; Fang Feng correctly uses HKBU's medicinal-plant record rather than
claiming an unavailable prepared-material record. Preview result: 5 herbs,
10 exact links, 0 conflicts, 0 canonical writes. `--apply` is intentionally
rejected. Eight standard validators and all 467 JSON files passed; encoding
remains at the known 768-finding baseline. No canonical or generated data was
changed.

### 2026-07-20 - Add dual-source visual references to single-herb cards (Codex)

Added a dedicated `圖像參考 Visuals` panel to every Materia Medica detail
card. Each herb now offers a name-and-pinyin scoped search of CloudTCM herb
pages and the HKBU Chinese Medicinal Material Images Database. This avoids
guessing CloudTCM numeric IDs while providing immediate image access for all
202 herb skeletons. Future per-record `visual_links[]` or `visualLinks[]`
values automatically override the scoped-search fallback, so exact reviewed
links can be added incrementally without another UI migration. The panel
labels external images as identification/study references and reminds the
reader to verify homonyms, processed forms, and look-alikes. No canonical herb
or generated data changed. JavaScript syntax and eight validators passed;
browser visual spot-check remains manual because the local preview service was
not available in this session.

### 2026-07-20 - PC4+PC5: 特定穴 bidirectional browsing UI (Claude Code)

Made the PC1–PC3 category tags reachable in the app. PC4: adapt361Record()
now emits pointCategories + fiveShuElement to runtime; build-data bundles
point_category_vocabulary into app_data for labels. PC5: (a) point detail page
shows a 特定穴 badge row (LU9 → 輸穴·土 / 脈會 / 原穴), each badge clickable;
(b) new "特定穴" directory filter group (20 category chips with live counts).
Both directions of the bidirectional browsing Ting asked for: clicking 原穴
(chip OR a point's 原穴 badge) lists exactly the 12 yuan points
(BL64/GB40/HT7/KI3/LI4/LR3/LU9/PC7/SI4/SP3/ST42/TE4); selecting a category clears
the search so it shows the full set. app.js + index.html + styles.css; also gave
scripts/dev-server.js a no-store header (was serving stale app.js during QA).
6-validator sweep PASS; browser QA all green, zero console errors. No Codex
overlap (Claude's app.js vs Codex's js/knowledge.js / C2 formula staging).

### 2026-07-19 - Stage five-formula CloudTCM Chinese depth probe (Codex)

Added a separate review-only B-layer for Chinese formula depth. The probe
covers Da Chai Hu Tang, Si Ni San, Tong Xie Yao Fang, Gan Mai Da Zao Tang,
and Suan Zao Ren Tang with concise `fang_yi_zh`, `zhu_zhi_zh`, and
`notes_zh` summaries. Each CloudTCM formula page was matched by name,
classical identity, and composition, then cross-checked against the existing
HKBU/MOHW/course-note evidence where available.

The staging record explicitly preserves source caveats. In particular, the
Gan Mai Da Zao Tang page contains an internal Fu Xiao Mai/Mai Dong mismatch,
so the inconsistent ingredient explanation was excluded. Modern disease
claims, dose recommendations, condition links, and source-checked promotion
were not staged. American Dragon remains a separate manual-browser review
because automated access returned a verification challenge; no URL or content
was inferred.

Added a no-apply preview tool and generated a 5-formula / 15-field report with
0 conflicts and 0 canonical writes. Nine standard validators and formula-dose
staging validation passed; all 466 JSON files parsed. Encoding remains at the
expected 768-finding baseline.

### 2026-07-19 - Complete five-formula C2 review-only probe (Codex)

Completed preview-only staging for Gan Mai Da Zao Tang and Suan Zao Ren Tang,
bringing the C2.1 probe to five formulas. Gan Mai Da Zao Tang uses Taiwan MOHW
plus HKBU institutional evidence for three classical fields. Suan Zao Ren Tang
uses HKBU for formula facts and Ting's insomnia course note for the explicitly
linked liver-blood-deficiency and pattern-comparison exam context.

Added `docs/formula_content_previews/C2_1_PROBE_SUMMARY.md` so the complete
review gate is visible in one table. Probe total: 5 formulas, 24 fields, 64
items, 0 conflicts, and 0 canonical writes. All records remain draft; no dose,
modern disease relationship, source-checked promotion, or apply path exists.

Final validation: nine standard validators passed, all 465 JSON files parsed,
and encoding remained at the expected 768-finding baseline. C2 expansion stops
at this review gate.

### 2026-07-19 - Tong Xie Yao Fang source-role C2 staging preview (Codex)

Added a preview-only staging record for `formula.tong_xie_yao_fang`. HKBU
supports the four-herb composition, actions, and classical painful-diarrhea
pattern. Ting's FOM and diarrhea notes separately support the liver-overacting-
spleen exam context and comparison with spleen qi and kidney yang deficiency
diarrhea. The staging wording keeps those source roles explicit.

Preview result: 5 fields / 13 items / 0 conflicts / 0 canonical writes. Nine
standard validators passed, 463 JSON files parsed, and encoding stayed at the
expected 768-finding baseline. No dose, modern disease link, contraindication,
review promotion, or canonical formula write was added.

### 2026-07-19 - Si Ni San institutional-only C2 staging preview (Codex)

Added a second preview-only formula staging record for `formula.si_ni_san`.
HKBU and Taiwan MOHW independently support the four-herb composition, actions,
and two classical pattern indications. No direct Si Ni San page was found in
Ting's imported Bastyr/Notion formula notes, so exam-track, contraindication,
modern-use, and dose fields were deliberately left empty.

Preview result: 3 fields / 8 items / 0 conflicts / 0 canonical writes. Nine
standard validators passed, 462 JSON files parsed, and encoding stayed at the
expected 768-finding baseline. Canonical formula data was not changed.

### 2026-07-19 - Da Chai Hu Tang source-backed C2 staging preview (Codex)

Created the first real formula-content staging record for
`formula.da_chai_hu_tang`. Ting's direct Bastyr/Notion note supplies the exam
comparison, while the HKBU Chinese Medicine Formulae Images Database and
Taiwan MOHW reference-formula page independently support formula identity,
composition, actions, and the combined Shaoyang-Yangming pattern.

The staging record remains `draft` and contains 8 fields / 21 items. It does
not include dose conversion, modern disease links, clinical claims, or review
promotion. The preview reports 0 conflicts and 0 canonical writes. The other
four formulas in the probe remain source-collection pending because no direct
course-note page was found; indirect search results were not used as a
substitute.

Validation: preview PASS; nine standard validators PASS; all 461 JSON files
parse; encoding remains at the expected 768-finding baseline. Canonical
`data/herbs/formulas.json` was not changed.

### 2026-07-19 - C2 formula staging preview guard and five-formula probe (Codex)

Added a preview-only C2 staging validator for classical formula content. It
requires per-field HTTPS sources and draft status, targets skeleton formulas
only, and rejects populated-target conflicts, unsupported fields, damaged
text, dose fields, modern-use/condition fields, and source-checked promotion.
The tool intentionally has no apply mode and writes only review reports.

Added staging documentation and a five-formula C2.1 source-collection probe
manifest (Da Chai Hu Tang, Si Ni San, Tong Xie Yao Fang, Gan Mai Da Zao Tang,
and Suan Zao Ren Tang). No clinical content and no canonical formula data were
changed.

Validation: in-memory guard tests passed for valid input, conflict rejection,
dose rejection, and missing-source rejection. Probe JSON, eight standard
validators, and diff check passed; encoding remains at 768 findings.

### 2026-07-19 - C2 formula classical-content gap inventory (Codex)

Added a read-only, deterministic formula gap reporter and generated the first
auditable C2 fill queue. It confirms 115 formulas = 23 populated pilot records
+ 92 skeleton records, and divides the skeletons into 30 / 30 / 32 formula
batches. Each skeleton currently lacks 11 classical/English content and safety
fields. The report separately identifies 184 question-mark-damaged string
values across all 23 populated records as frozen repair work, not empty gaps.

No formula data was changed. The queue requires staging, conflict-refusing
dry-run preview, Ting/Claude approval, and apply-only-to-empty behavior before
any future canonical fill. Dose fields, modern-use links, and review-status
promotion are explicitly outside C2.

Validation: reporter rerun PASS; eight standard validators PASS; formula JSON
parse PASS; encoding remains at the known 768-finding baseline.

### 2026-07-18 - LL3: insulin-resistance-context pattern comparison draft fill (Codex)

Filled `cmp.insulin_resistance_patterns` as the ninth complete LL3 table,
comparing Phlegm-Damp and Spleen qi deficiency across 12/12 cells. NIDDK/CDC
support only biomedical context; Ting's Notion/Bastyr notes supply the separate
TCM framework. The table states that body size, fatigue, tongue, pulse, or a
TCM pattern cannot diagnose insulin resistance, prediabetes, or diabetes.
Formula IDs remain study anchors only. Status is draft and not medical advice.

Validation: dry-run/apply passed with 12 filled / 0 skipped. Queue: 150 filled
/ 24 pending / 2 empty / 9 complete. Eight validators and 459-file JSON parse
passed; encoding remains at the known 768-finding baseline.

### 2026-07-18 - LL3: endometriosis-context pattern comparison draft fill (Codex)

Filled `cmp.endometriosis_context_patterns` as the eighth complete LL3
comparison table. It compares Blood stasis and Liver qi stagnation across six
study dimensions (12/12 cells). WHO, ACOG, and NICHD support only the
biomedical symptom/evaluation context; Ting's Notion/Bastyr gynecology,
Qi-Blood, clinical-skills, and Tao Hong Si Wu Tang notes supply the separate
TCM discriminator framework.

The table explicitly says that an endometriosis diagnosis, pain severity, or
imaging result does not determine a TCM pattern, and that a TCM pattern does
not diagnose endometriosis. Formula IDs are comparison anchors only. Status
remains `model_draft`, `review_status: "draft"`, `public_safe: false`, and not
medical advice.

Validation: apply dry-run and apply passed with 12 filled / 0 skipped;
comparison queue reports 138 filled / 36 pending / 3 empty / 8 complete. Eight
standard validators and 458-file JSON parse passed. Encoding remains at the
known 768-finding baseline.

### 2026-07-18 - LL3: luteal support pattern comparison source-assisted draft fill (Codex)

Filled `cmp.luteal_support_patterns` as the seventh complete LL3 comparison
table. It now compares Kidney deficiency, Spleen qi deficiency, and Blood
deficiency across chief cue, tongue, pulse, accompanying signs, treatment
principle, and representative formula (18/18 cells).

TCM discriminator wording came from Ting's Notion/Bastyr notes on irregular
menstruation, gynecological disorders, female reproduction, Zang-Fu and
Qi-Blood differentiation, and Si Wu Tang. ASRM, ACOG, and ReproductiveFacts
were used only for cautious biomedical context: luteal phase deficiency lacks
a reliable standalone diagnostic test, a single progesterone value cannot
assess luteal quality, and IVF progesterone guidance must not be generalized
to natural cycles. The table remains `model_draft`, `review_status: "draft"`,
`public_safe: false`, and not medical advice.

Files changed: `data/knowledge/comparison_fill_luteal_support.json`,
`data/knowledge/comparisons.json`, `docs/COMPARISON_FILL_QUEUE.md`,
`data/generated/knowledge_data.js`, `docs/CODEX_CURRENT_STATUS.md`,
`PROJECT_LOG.md`, and `docs/CODEX_HANDOFF.md`.

Validation: apply dry-run and apply both passed with 18 filled / 0 skipped;
comparison queue reports 126 filled / 48 pending / 4 empty / 7 complete. Eight
standard validators and 457-file JSON parse passed. Encoding remains at the
known 768-finding baseline.

### 2026-07-18 - LL3: insomnia pattern comparison source-assisted draft fill (Codex)

Filled `cmp.insomnia_patterns` as the sixth complete LL3 comparison table. It
now compares Heart-Spleen deficiency, Heart-Kidney not communicating, and Liver
Fire across chief cue, tongue, pulse, accompanying signs, treatment principle,
and representative formula (18/18 cells).

Biomedical insomnia definition, diagnostic context, and CBT-I context came from
official NHLBI/NIH and NCCIH pages. TCM discriminator wording came from Ting's
Notion/Bastyr Insomnia handout notes, Zang-Fu differentiation notes, Gui Pi Tang
formula page, and CAM5300 Heart-Kidney Yin deficiency case. Official biomedical
sources were not used to validate TCM patterns. The table remains
`model_draft`, `review_status: "draft"`, `public_safe: false`, and explicitly
not medical advice.

Files changed: `data/knowledge/comparison_fill_insomnia.json`,
`data/knowledge/comparisons.json`, `docs/COMPARISON_FILL_QUEUE.md`,
`data/generated/knowledge_data.js`, `docs/CODEX_CURRENT_STATUS.md`,
`PROJECT_LOG.md`, and `docs/CODEX_HANDOFF.md`.

Validation: comparison-fill dry-run PASS (18 cells, 0 skipped, 11 metadata
updates); apply PASS; build-data PASS; queue report PASS with 108 filled / 66
pending / 6 complete; validate-data, interactions, relations, herbal-links,
herb-canon, point-ids, naming, and point-categories PASS. Encoding remains the
known baseline backlog and no frozen encoding repair was attempted.

Protected areas not touched: no clinical case data, no canonical formula/herb
records, no `data/acupoints/361.json`, no `docs/CLOUDTCM_*`, no CloudTCM point
map, and no UI source edits.

### 2026-07-17 - First formula dose evidence staging batch (Codex)

Created a source-gated dose staging layer for five existing formulas: Gui Zhi
Tang, Ma Huang Tang, Yin Qiao San, Xiao Chai Hu Tang, and Xiao Yao San. The
batch transcribes classical quantities and the modern gram references displayed
on the reviewed HKBU formula pages while preserving non-gram units and source
ambiguities. Sun Ten U.S. public product evidence records SKU, dosage form, and
public notices for four formulas; all concentrated-granule serving grams remain
null because the reviewed public pages do not state a serving amount.

Added a dedicated validator that checks formula IDs, available herb IDs,
canonical formula composition membership, source fields, positive quantities,
draft status, and the no-inference granule rule. Added an approval summary and
registered the staging layer in the data migration map. Canonical
`data/herbs/formulas.json` was not changed.

Files changed: `data/imports/formula_doses/README.md`,
`data/imports/formula_doses/formula_dose_staging.json`,
`scripts/validate-formula-dose-staging.js`,
`docs/FORMULA_DOSE_STAGING_SUMMARY.md`, `docs/DATA_MIGRATION_MAP.md`,
`PROJECT_LOG.md`, and `docs/CODEX_HANDOFF.md`.

Validation: formula dose staging PASS (5 formulas, 34 composition rows, 30
gram references, 4 missing/non-gram rows, 2 pending herb IDs, 4 Sun Ten product
records, 0 granule serving-gram entries); validate-data, interactions,
relations, herbal-links, herb-canon, point-ids, naming, point-categories, and all
JSON parsing PASS. Encoding validator reports the existing 768-item backlog;
none of the new staging files appears in its findings.

Protected areas not touched: no `app.js`, no `js/knowledge.js`, no
`styles.css`, no `data/herbs/formulas.json`, no `data/acupoints/361.json`, no
`docs/CLOUDTCM_*`, no generated data, and no CloudTCM point map.

### 2026-07-17 - Interactive formula and herb study cards (Codex)

Implemented the first working AcuTing OS formula and single-herb detail cards in
the Lookup workspace. After Ting's visual review, the detail experience was
revised to match the acupoint page rhythm: identity hero, four fast facts,
continuous long-form sections, and sticky quick navigation. Formula cards cover
exam core, composition, clinical context, and safety/sources. Herb cards cover
exam core, clinical context, pairing/differentiation, and safety/sources.

Ting's concentrated-granule requirement was added to the composition design.
The table now separates classical amount, raw-herb/decoction reference grams,
and concentrated-granule reference grams. Granule values require ratio/brand,
dose scope, and source context and are never calculated automatically from raw
herb grams. Current empty values remain visibly pending source review.

Ting selected Sun Ten / 順天堂 as the first U.S. granule reference. The source
policy now separates Sun Ten U.S. product/SKU/ingredient pages from Taiwan MOHW
licensed-product records (raw-herb amount, extract weight, ratio, excipients),
with label serving grams remaining null unless a public label or authenticated
practitioner source is available.

The relation graph is navigable in both directions: formula composition resolves
pinyin entries to stable `herb.*` IDs where available, and herb cards link back
to related `formula.*` records. Modern-use and condition/pattern IDs remain
search-oriented context, not treatment claims. Damaged `????` or U+FFFD content
is suppressed and replaced by a source-review pending state.

Files changed: `js/knowledge.js`, `styles.css`, `design-qa.md`,
`PROJECT_LOG.md`, `docs/CODEX_HANDOFF.md`.

Validation: JavaScript syntax PASS; validate-data PASS;
validate-interactions PASS; validate-relations PASS; validate-herbal-links PASS;
validate-herb-canon PASS; validate-point-ids PASS; validate-naming PASS; all
`data/**/*.json` parse PASS. The first version passed desktop and 390 x 844
mobile QA. The acupoint-style revision was re-tested at 1280 x 720 with no
detail-dialog horizontal overflow; compact-screen rules explicitly collapse the
fact grid and sidebar. The four-column dose table was also browser-tested at
1280 x 720 with zero table or dialog horizontal overflow.

Protected areas not touched: no `app.js`, no clinical case data, no
`data/acupoints/361.json`, no `docs/CLOUDTCM_*`, no generated data, and no
CloudTCM point map changes.

### 2026-07-17 - Herb/formula card relation design captured (Codex)

Captured Ting's direction that formulas and single herbs should become
acupoint-style detail cards with first-class modern applications, related
conditions, traditional disease links, related formulas, and formula composition
links to herb IDs. Added `docs/HERB_FORMULA_CARD_RELATION_DESIGN.md` and
registered it in `docs/DATA_MIGRATION_MAP.md`.

Key decision: modern applications are not prose-only tags; they must connect
western condition IDs, traditional disease IDs, pattern IDs, formulas, and herbs.
Formula composition should link to stable `herb.*` IDs wherever possible.
CloudTCM and American Dragon can be used as private-study source layers with
source refs and draft/source-review status.

Validation: docs-only change; no runtime validators required.

### 2026-07-17 - LL3: IVF cycle comparison source-assisted draft fill (Codex)

Filled `cmp.ivf_cycle_patterns` as the fifth LL3 comparison table. The table
now compares Kidney deficiency, Blood stasis, and Liver qi stagnation across
chief cue, tongue, pulse, key accompanying signs, treatment principle, and
representative formulas (18/18 cells).

Biomedical IVF/ART context came from CDC, ACOG, MedlinePlus, and
ASRM/ReproductiveFacts. TCM discriminator language came from Ting's
Notion/Bastyr gynecology, inquiry, irregular menstruation, and Zang-Fu notes
plus accepted LL3 draft language. The fill stays `model_draft`,
`review_status: "draft"`, `public_safe: false`, and not medical advice.

Files changed: `data/knowledge/comparison_fill_ivf_cycle.json`,
`data/knowledge/comparisons.json`, `docs/COMPARISON_FILL_QUEUE.md`,
`data/generated/app_data.js`, `data/generated/knowledge_data.js`,
`docs/CODEX_CURRENT_STATUS.md`, `docs/CODEX_HANDOFF.md`, `PROJECT_LOG.md`.

Validation: `scripts/apply-comparison-fill.js ivf_cycle` dry-run PASS (18 cells,
0 skipped); apply PASS; `scripts/build-data.js` PASS;
`scripts/report-comparison-fill.js` PASS with 90 filled / 84 pending / 5
complete; `node --check scripts/apply-comparison-fill.js` PASS; validate-data
PASS; validate-interactions PASS; validate-relations PASS; validate-herbal-links
PASS; validate-herb-canon PASS; validate-point-ids PASS; validate-naming PASS;
validate-point-categories PASS; JSON parse check for `data/**/*.json` PASS.
`scripts/validate-encoding.js` still fails on the known 768 finding backlog; no
encoding repair was attempted.

Protected areas not touched: no clinical case data, no `data/acupoints/361.json`,
no `docs/CLOUDTCM_*`, no CloudTCM point map, no case/SOAP UI, no PC category UI.

### 2026-07-17 - LL3: ovulatory factor comparison source-assisted draft fill (Codex)

Filled `cmp.ovulatory_factor_patterns` as the fourth LL3 comparison table. The
table now compares Kidney deficiency, Liver qi stagnation, and Phlegm-Damp
across chief cue, tongue, pulse, key accompanying signs, treatment principle,
and representative formulas (18/18 cells).

Biomedical ovulatory-factor context came from NICHD, ACOG, and
ASRM/ReproductiveFacts. TCM discriminator language came from Ting's
Notion/Bastyr irregular menstruation, Zang-Fu, and formula notes plus the
already accepted PCOS/anovulation LL3 draft language. The fill stays
`model_draft`, `review_status: "draft"`, `public_safe: false`, and not medical
advice.

Files changed: `data/knowledge/comparison_fill_ovulatory_factor.json`,
`data/knowledge/comparisons.json`, `docs/COMPARISON_FILL_QUEUE.md`,
`data/generated/app_data.js`, `data/generated/knowledge_data.js`,
`docs/CODEX_CURRENT_STATUS.md`, `docs/CODEX_HANDOFF.md`, `PROJECT_LOG.md`.

Validation: `scripts/apply-comparison-fill.js ovulatory_factor` dry-run PASS
(18 cells, 0 skipped); apply PASS; `scripts/build-data.js` PASS;
`scripts/report-comparison-fill.js` PASS with 72 filled / 102 pending / 4
complete; `node --check scripts/apply-comparison-fill.js` PASS; validate-data
PASS; validate-interactions PASS; validate-relations PASS; validate-herbal-links
PASS; validate-herb-canon PASS; validate-point-ids PASS; validate-naming PASS;
validate-point-categories PASS; JSON parse check for `data/**/*.json` PASS.
`scripts/validate-encoding.js` still fails on the known 768 finding backlog; no
encoding repair was attempted.

Protected areas not touched: no clinical case data, no `data/acupoints/361.json`,
no `docs/CLOUDTCM_*`, no CloudTCM point map, no case/SOAP UI, no PC category UI.

### 2026-07-17 - LL3: anovulation comparison source-assisted draft fill (Codex)

Filled `cmp.anovulation_patterns` as the third LL3 comparison table. The table
now compares Kidney deficiency and Liver qi stagnation across chief cue, tongue,
pulse, key accompanying signs, treatment principle, and representative formulas
(12/12 cells).

Biomedical ovulation/anovulation context came from NICHD and WomensHealth.gov.
TCM discriminator language came from Ting's Notion/Bastyr notes. The fill stays
`model_draft`, `review_status: "draft"`, `public_safe: false`, and not medical
advice.

Files changed: `data/knowledge/comparison_fill_anovulation.json`,
`data/knowledge/comparisons.json`, `docs/COMPARISON_FILL_QUEUE.md`,
`data/generated/app_data.js`, `data/generated/knowledge_data.js`,
`docs/CODEX_CURRENT_STATUS.md`, `docs/CODEX_HANDOFF.md`, `PROJECT_LOG.md`.

Validation: `scripts/build-data.js` PASS; `scripts/report-comparison-fill.js`
PASS with 54 filled / 120 pending / 3 complete; `node --check
scripts/apply-comparison-fill.js` PASS; validate-data PASS;
validate-interactions PASS; validate-relations PASS; validate-herbal-links PASS;
validate-herb-canon PASS; validate-point-ids PASS; validate-naming PASS; JSON
parse check for `data/**/*.json` PASS. `scripts/validate-encoding.js` still
fails on the known 768 finding backlog; no encoding repair was attempted.

Protected areas not touched: no clinical case data, no `data/acupoints/361.json`,
no `docs/CLOUDTCM_*`, no CloudTCM point map, no case/SOAP UI.

### 2026-07-16 - Verification worksheets: CloudTCM 24 + dictionary gyn 25 (Claude Code)

Ting's "有空時核對" background task. Two review worksheets (docs-only; no
canonical / 361.json / frozen CLOUDTCM edits):

- docs/CLOUDTCM_REVIEW_24_WORKSHEET.md — the §A(15)+§B(9) high-risk diffs.
  Currency check: all 24 "現有" values still match current 361.json. Key
  finding: ~13 of the 15 §A location "conflicts" are FALSE — same point via a
  different landmark (e.g. LU4「天府下1寸」= 腋前紋下4寸) or the 2026-07-11 diff
  parser misreading 一寸五分/二寸五分 as 1/2.5. Only BL4 and SI16 are genuine
  §A conflicts. §B's 9 are real depth non-overlaps and stay for Ting's textbook
  adjudication (depth = safety field; Claude did NOT recommend depths). All §A
  classifications marked "Claude 初判, 待 Ting/教材確認".
- docs/DICTIONARY_REVIEW_GYN_25.md — side-by-side worksheet of the 25 gyn
  western conditions (name/ICD/現有中醫病名對照/辭典欄/打勾欄) for Ting to check
  against 《中西醫病名對照大辭典》. Claude can't access the dictionary itself;
  this prepares the batch per CONDITIONS_MODULE_DESIGN's verification-authority
  flow. Generated from canon + tdis + crosswalk.

Note: runtime adapter (Phase 2) was another Claude's work, not Codex — noted
for handoff attribution. Claude lane; no Codex overlap.

### 2026-07-15 - PC1–PC3: 特定穴 category tags on 361.json (Claude Code)

Executed the point-category tag layer (docs/POINT_CATEGORY_TAGS_DESIGN.md),
gate opened by Ting. PC1: data/config/point_category_vocabulary.json (v1
controlled vocab, 20 category ids + five-shu element rule). Membership single
source of truth: data/config/point_category_members.json (generated from
channel-ordered five-shu + polarity + the closed §5 code lists). PC2:
scripts/apply-point-categories.js (adds-only) tagged 129 distinct points with
point_categories[] + five_shu_element on 60 (five-shu) — 361.json additive,
review_status untouched (a factual tag is not a promotion). PC3:
scripts/validate-point-categories.js enforces id∈vocab, per-category counts ==
expected (原穴12/絡穴15/郄穴16/背俞12/募穴12/八會8/八脈交會8/下合6/五輸60),
no membership drift, and five_shu_element validity — added to the standard
sweep. Self-tested: bad tag + missing element both fail. Spot-check LU9 太淵 =
[輸穴, 脈會, 原穴] element earth (the multi-tag example). Full 8-validator sweep
PASS. Fixed a design-doc slip (五輸 total is 60, not 66; 66 = 60 five-shu + 6
yang-yuan). Data+validator only; runtime adapter passthrough (PC4) + UI badges/
filter (PC5) remain. No Codex overlap (config/scripts/361.json).

### 2026-07-12 - Taiwan dictionary designated as conditions-mapping authority (Ting)

Ting designated the Taiwan authority for the 中西醫病名對照 layer:
《中西醫病名對照大辭典》(林昭庚 主編). Encoded in
CONDITIONS_MODULE_DESIGN (new Verification authority section: mappings
stay draft until checked per condition against the dictionary; dictionary
wins on disease-name correspondence; pattern links follow textbook logic;
icd_hint aligns with its ICD correspondences; agents prepare side-by-side
worksheets for Ting's review batches) and TCM_SOURCE_REGISTRY (new tier-A
row). If Ting meant a different Taiwan source, swap the name in both
files - the workflow is source-agnostic.
### 2026-07-15 - CS5: visual case timeline on the case detail (Claude Code)

Added a compact horizontal outcome timeline above the SOAP cards on each case:
one node per visit (oldest→newest), a dot coloured by LL2 `outcomeVerdict`
(green improved / amber no_change|worsened / grey none), visit#/date + a short
outcome snippet; clicking a node smooth-scrolls to that SOAP card and briefly
flashes it. This turns the LL2 verdicts into the "did it work over time?"
review artifact (external-review Phase 4.7). Progressive/additive — reads
existing localStorage notes, no data-model change; SOAP cards gained an
`id="soap-<noteid>"` anchor for the jump. app.js + styles.css. node --check +
validate-interactions PASS; browser QA (3-visit case): 3 nodes chronological,
correct verdict-dot colours, card anchors present, node click flashes the
target card, zero console errors. Branch cs5-timeline; Claude's lane, no Codex
overlap (origin unchanged since CS3).

### 2026-07-15 - CS3: align schema.sql with LL1/LL2 + D5 cardinality (Claude Code)

Claude's own lane (case/SOAP + schema.sql) while LL3 stays Codex's. The
future SQLite clinical store already had `visit_outcomes` (structured) +
`case_reflections`, so CS3 shrank to aligning `data/clinical_cases/schema.sql`
with what's now in localStorage: (1) `visits.outcome_verdict` (LL2:
improved/no_change/worsened/lost_followup); (2) visit-level LL1 反思 columns
(reflection_differential_considered / reflection_note / reflection_if_ineffective_plan);
(3) NEW `visit_tcm_patterns` junction with `is_primary` — the D5 "one visit →
many patterns" cardinality (soap_notes.assessment_tcm_pattern_ids stays as the
migration-source text blob). Validated by executing the whole schema against an
in-memory SQLite (node:sqlite) — 20 tables, all three additions present, and an
insert smoke test (visit+verdict+pattern junction) passed. Schema-only, not
wired to the app yet (localStorage remains the store until the H2 migration);
this is DECISIONS D5 "set cardinality while data is disposable" prep. Standard
validators unaffected (schema.sql isn't app-loaded). Also reviewed + accepted
Codex's 645a911 (unexplained infertility fill) earlier; recorded that LL3 fills
stay with Codex since Claude lacks the Notion source.

### 2026-07-14 - LL3: unexplained infertility comparison source-assisted draft fill (Codex)

Filled the second LL3 comparison table, `cmp.unexplained_infertility_patterns`,
as a source-assisted draft. The table now compares Kidney deficiency, Liver qi
stagnation, and Blood stasis across chief cue, tongue, pulse, accompanying
signs, treatment principle, and representative formulas.

Biomedical infertility context came from NIH/NICHD, MedlinePlus, and
WomensHealth.gov. TCM discriminator language came from Ting's Notion/Bastyr
gynecology, extraordinary fu / uterus, diagnosis, Yu syndrome, and blood
pathology notes. The record remains `authored_by: "model_draft"`,
`review_status: "draft"`, `public_safe: false`, and includes a no-medical-advice
disclaimer.

Added `data/knowledge/comparison_fill_unexplained_infertility.json`, applied it
through `scripts/apply-comparison-fill.js`, rebuilt generated data, and refreshed
`docs/COMPARISON_FILL_QUEUE.md`. Queue status is now 42 filled cells,
132 pending cells, 9 empty tables, 2 complete tables.

Validation: `scripts/apply-comparison-fill.js unexplained_infertility` dry-run
PASS, `scripts/apply-comparison-fill.js unexplained_infertility --apply` PASS,
`scripts/build-data.js`, `node --check scripts/apply-comparison-fill.js`,
`validate-data`, `validate-interactions`, `validate-relations`,
`validate-herbal-links`, `validate-herb-canon`, `validate-point-ids`,
`validate-naming`, and JSON parse check PASS. `validate-encoding` remains
expected FAIL with 768 known backlog findings.

### 2026-07-14 - Repo mailbox current-status hardening (Codex)

Added `docs/CODEX_CURRENT_STATUS.md` as a single-screen coordination file so
Claude/Ting/Codex can see the current branch, latest commit, review state, and
next action without scanning older handoff entries. Updated
`docs/CODEX_HANDOFF.md` to say that older `pending at time of entry` phrases
are historical snapshots and that `CODEX_CURRENT_STATUS.md` is the current
status source.

Current status now explicitly says `0d0e5c4` (`LL3: fill PCOS pattern
comparison draft`) was reviewed, accepted, and merged by Claude on `main`.
It also records the new coordination rule: an agent should add a `CLAIMED:
<track> on <branch>` marker before starting overlapping multi-step work.

Validation: docs-only change; no data or runtime files changed. `git status`
was clean before edits.

### 2026-07-14 - LL3: PCOS comparison source-assisted draft fill (Codex)

Filled the first LL3 comparison table, `cmp.pcos_patterns`, as a
source-assisted draft. The PCOS table now compares phlegm-damp, Liver qi
stagnation, Kidney deficiency, and Blood stasis across chief cue, tongue,
pulse, accompanying signs, treatment principle, and representative formulas.

Sources were kept explicit: biomedical PCOS context from NIH/NICHD,
WomensHealth.gov, and MedlinePlus; TCM discriminator language from Ting's
Notion/Bastyr diagnosis and pathology notes. The table remains
`review_status: "draft"`, `authored_by: "model_draft"`, `public_safe: false`,
and includes a no-medical-advice disclaimer.

Added `scripts/apply-comparison-fill.js` plus
`data/knowledge/comparison_fill_pcos.json` so future comparison fills can use a
reviewable source-fill pipeline instead of hand-editing canonical JSON. Rebuilt
generated data and refreshed `docs/COMPARISON_FILL_QUEUE.md`; queue status is
now 24 filled cells, 150 pending cells, 10 empty tables, 1 complete table.

Validation: `scripts/build-data.js`, `node --check
scripts/apply-comparison-fill.js`, `validate-data`, `validate-interactions`,
`validate-relations`, `validate-herbal-links`, `validate-herb-canon`,
`validate-point-ids`, `validate-naming`, and JSON parse check PASS.
`validate-encoding` remains expected FAIL with 768 known backlog findings.

### 2026-07-14 - LL3: comparison fill queue report (Codex)

Added `scripts/report-comparison-fill.js`, a UTF-8 Node report generator for
LL3 comparison records. It writes `docs/COMPARISON_FILL_QUEUE.md` from
`data/knowledge/comparisons.json`, listing table-level progress and pending
axes without adding or filling any clinical discriminator content.

Current queue: 11 comparison records, 0 filled cells, 174 pending cells,
11 empty tables, 0 partial tables, 0 complete tables. This gives Ting a
concrete owner-fill checklist for class notes / textbook-based completion.

Validation: `node --check scripts/report-comparison-fill.js`,
`scripts/report-comparison-fill.js`, `validate-data`, `validate-interactions`,
`validate-relations`, `validate-herbal-links`, `validate-herb-canon`,
`validate-point-ids`, `validate-naming`, and JSON parse check PASS.
`validate-encoding` remains expected FAIL with 768 known backlog findings.

### 2026-07-14 - LL3: comparison fill-progress summary (Codex)

Added a compact fill-progress summary to the Lookup comparison section. The
section now reports total filled cells, pending cells, empty tables, partial
tables, and complete tables across all comparison records. This gives Ting a
single queue-level view before opening individual comparison tables.

This is display-only LL3 workflow support. No comparison/discriminator cells
were filled and no clinical content was changed.

Ran `scripts/build-data.js`; generated knowledge still reports
`comparisons: 11`. Validation: `node --check js/knowledge.js`,
`validate-data`, `validate-interactions`, `validate-relations`,
`validate-herbal-links`, `validate-herb-canon`, `validate-point-ids`,
`validate-naming`, and JSON parse check PASS. `validate-encoding` remains
expected FAIL with 768 known backlog findings.

### 2026-07-14 - LL3: comparison source labels + fill progress in Lookup (Codex)

Improved the Lookup comparison renderer so each comparison card now shows its
`source_condition_id` as a readable source condition chip and a filled-cell
progress badge such as `0/18 cells filled`. The comparison search now also
matches the source condition id and label, so typing PCOS, IVF, embryo
transfer, insulin resistance, etc. finds the relevant skeleton table.

This is display-only metadata for the LL3 workflow. No discriminator cells
were filled and no clinical content was changed.

Ran `scripts/build-data.js`; generated knowledge still reports
`comparisons: 11`. Validation: `node --check js/knowledge.js`,
`validate-data`, `validate-interactions`, `validate-relations`,
`validate-herbal-links`, `validate-herb-canon`, `validate-point-ids`,
`validate-naming`, and JSON parse check PASS. `validate-encoding` remains
expected FAIL with 768 known backlog findings.

### 2026-07-14 - LL3: complete fertility comparison skeleton coverage + validator hardening (Codex)

Completed the current fertility/reproductive comparison skeleton coverage for
all conditions in `data/pathology/conditions.json` that already had two or
more `related_tcm_patterns`. Added five skeleton-only comparison records:
`cmp.anovulation_patterns`, `cmp.endometriosis_context_patterns`,
`cmp.recurrent_pregnancy_loss_context_patterns`,
`cmp.insulin_resistance_patterns`, and `cmp.embryo_transfer_patterns`.

Hardened `scripts/validate-relations.js` so comparison records now validate
optional `source_condition_id`, require at least one dimension, require a cell
object for every compared pattern, and require every dimension cell to exist as
a string. This protects the LL3 table structure while keeping clinical
discriminator content owner-filled only.

Ran `scripts/build-data.js`; generated knowledge now reports `comparisons: 11`.
Validation: `node --check scripts/validate-relations.js`, `validate-data`,
`validate-interactions`, `validate-relations`, `validate-herbal-links`,
`validate-herb-canon`, `validate-point-ids`, `validate-naming`, and JSON parse
check PASS. `validate-encoding` remains expected FAIL with 768 known backlog
findings; no repair attempted.

### 2026-07-14 - LL3: fertility comparison skeleton batch (Codex)

Added five more LL3 comparison skeleton records using only existing
`related_tcm_patterns` already present in `data/pathology/conditions.json`.
New records: `cmp.pcos_patterns`, `cmp.unexplained_infertility_patterns`,
`cmp.ovulatory_factor_patterns`, `cmp.ivf_cycle_patterns`, and
`cmp.luteal_support_patterns`.

All discriminator cells are intentionally empty and remain owner/source-filled
only. Each record is `authored_by: "model_draft"`, `status: "draft"`, and
`review_status: "draft"`, with a `source_condition_id` pointing back to the
condition that supplied the existing pattern set. This deepens the data layer
without adding clinical claims.

Ran `scripts/build-data.js`; generated knowledge now reports `comparisons: 6`.
Validation: `node --check js/knowledge.js`, `validate-data`,
`validate-interactions`, `validate-relations`, `validate-herbal-links`,
`validate-herb-canon`, `validate-point-ids`, `validate-naming`, and JSON parse
check PASS. `validate-encoding` remains expected FAIL with 768 known backlog
findings; no repair attempted.

### 2026-07-14 - LL3: comparison tables rendered in Lookup (Codex)

Codex continued while Claude was token-limited. Added a Lookup workspace
section, "Pattern Comparisons / 辨證鑑別表", that renders
`data/knowledge/comparisons.json` as a side-by-side table. Empty discriminator
cells show "待 Ting 填寫" and remain owner-filled only. Added filtering across
comparison id, title, pattern ids, pattern labels, dimensions, status, and
authorship metadata.

This is a display-layer change only. No comparison content was model-filled,
no clinical case data changed, and no protected acupuncture data changed.

Validation: `node --check js/knowledge.js`, `node --check app.js`,
`validate-data`, `validate-interactions`, `validate-relations`,
`validate-herbal-links`, `validate-herb-canon`, `validate-point-ids`,
`validate-naming`, and JSON parse check PASS. `validate-encoding` remains
expected FAIL with 768 known backlog findings; no repair attempted.

Next: Ting can fill `cmp.insomnia_patterns` cells from class/textbook notes;
Claude can review the renderer and merge `ll3-comparison` when ready.

### 2026-07-14 - LL3: comparison record skeleton + relation validation (Claude Code -> Codex)

Learning Loop LL3 was started by Claude Code and completed by Codex after
Claude ran out of token. Added the first JSON knowledge comparison record at
`data/knowledge/comparisons.json`: `cmp.insomnia_patterns`, a draft
side-by-side pattern differentiation skeleton for insomnia. The discriminating
cells are intentionally empty: LL3 policy says clinical discriminators are
owner-authored, never model-filled. Record is `authored_by: model_draft`,
`status: draft`, `review_status: draft`.

`scripts/build-data.js` now bundles comparisons into `ACUTING_KNOWLEDGE`, and
`scripts/validate-relations.js` validates `cmp.*` ids, comparison type/status,
compared pattern references, and `cells` keys. Added
`.claude/settings.local.json` to `.gitignore` so local Claude permissions do
not leak into commits. Build ran and generated knowledge data reports
`comparisons: 1`.

Validation: `node --check app.js`, `node --check scripts/build-data.js`,
`node --check scripts/validate-relations.js`, `scripts/build-data.js`,
`validate-data`, `validate-interactions`, `validate-relations`,
`validate-herbal-links`, `validate-herb-canon`, `validate-point-ids`, and
`validate-naming` PASS. `validate-encoding` remains expected FAIL with 768
known backlog findings; no repair attempted. Next: Ting can fill the empty
comparison cells from class/textbook notes; later a knowledge.js table renderer
can display comparison records.

### 2026-07-14 - LL2: outcome verdict + "cases to learn from" view (Claude Code)

Learning Loop LL2. Added `outcomeVerdict` (improved/no_change/worsened/
lost_followup) per SOAP note — a select near Outcomes, validated in
normalizeSoapNote, shown as a colored badge on each note card. Added a
"值得學習的病例 / Cases to learn from" toggle that flattens every no_change/
worsened visit across all cases (newest first, click-through to the case,
framed as learning not failure). Clinical-layer data (localStorage) →
visits.outcome_verdict at the SQLite store. 6-validator sweep PASS; browser QA
confirmed verdict save + badge, correct filtering (improved excluded),
click-through, toggle-off restore, zero console errors. Branch
ll2-outcome-verdict. Next Learning-Loop candidate: LL3 comparison record type
(contrast tables — highest pre-exam value; pure JSON knowledge + validator).

### 2026-07-14 - LL1: 按語 reflection fields on the SOAP note (Claude Code)

Learning Loop LL1 (highest-ROI item). Three OPTIONAL free-text fields added to
the SOAP note inside a collapsible section (closed by default, no routine
friction): differentialConsidered / reflection (按語) / ifIneffectivePlan.
Wired through normalizeSoapNote + save path + fallback; renderSoapNoteCard
shows them only when filled. Clinical-layer data (localStorage, not Git);
becomes visits columns when the SQLite store lands. 6-validator sweep PASS;
browser QA: collapsed by default, saves with all three empty (0→1), fills
round-trip to the card, zero console errors. Branch ll1-reflection. Next
Learning-Loop candidate: LL2 outcome_verdict enum + "cases to learn from" view.

### 2026-07-14 - CS4-2: pickers extended to all 7 SOAP link fields (Claude Code)

Extended CS4 from 2 → 7 link fields. build-data now bundles pattern_library
(50), tdis_registry (75), condition_canon (150), western_medications (12),
formula_safety_flags (15); `setupLinkAutocomplete()` wires pickers for
tcmPattern / easternDisease / westernCondition / medication / safetyFlag
(each unioning Track E canon with the older registry, deduped by id).
outcomeMetricLinks stays free text (values, not ids → LL2/LL5). This makes
Track E's conditions/patterns/中醫病名 selectable inside a case for the first
time — M3 / LL6 precursor. 7-validator sweep PASS; browser QA confirmed
bilingual search, id-only writeback (cond.pcos), zero console errors. Branch
cs4-pickers-2. Next candidate: LL1 按語 reflection fields on the SOAP form.

### 2026-07-14 - CS-track batch 2: CS4 SOAP autocomplete chip pickers (Claude Code)

The highest-ROI input-friction fix (external-review Phase 4.1). The SOAP
`acupointLinks` and `formulaLinks` fields no longer need hand-typed internal
ids: type Chinese / pinyin / code → pick from an autocomplete menu → a chip is
added and the hidden textarea holds the exact `code` / `formula.<id>` the save
and linkify paths already use. Existing notes hydrate into chips on open.
Vanilla + progressive enhancement — the textarea stays the source of truth, so
the save path is untouched. This turns referential integrity from
"caught later" toward "hard to type wrong" (DECISIONS D1/D3 intent).

Also landed on main first: `scripts/dev-server.js` + `.claude/launch.json`
(local static preview; `node` not on PATH → bundled-node absolute path).

Points store `code` for now (linkify-compatible); the code→id swap comes with
the FK migration. Follow-ups (same pattern): pattern/medication/safety/
condition/outcome link fields. Verified in the live dialog (type/select/
multi/remove/hydrate, 0 console errors); node --check + validate-interactions PASS.

### 2026-07-13 - CS-track batch 1: runtime id + backup banner + honest stats (Claude Code)

First work after the Phase 2 merge lifted the app.js/index.html freeze.
Branch cs-track-1 (off main). Three CS-track items:

- Runtime `id` passthrough: the three point adapters now emit the DECISIONS-D2
  namespaced `id`, so every runtime point carries the stable key that clinical
  FKs and the coming CS4 autocomplete will reference.
- CS1 backup discipline: a sticky "N days since export" banner (shown only when
  there are cases and it's ≥7 days/never) + an every-10-saves export prompt +
  export resets the meta. localStorage stays the store; this is the H2 bridge.
- CS2 fixed the lying numbers: index.html's hardcoded stats (several already
  wrong — 18 categories→17, 23 content-bearing→stale, 15 safety→meaningless)
  replaced with runtime-derived spans; underivable ones removed rather than
  left to drift. Verified live 115/17/202/202/34/407/409, zero console errors.

7-validator sweep PASS + browser QA. Handoff updated. Next: CS4 autocomplete
comboboxes (kills hand-typed ids — the biggest SOAP-form friction), separate batch.

### 2026-07-13 - D6 knowledge-never-hard-deleted + status backfill; D3 homonym rule (Claude Code)

Ting: "你做吧". Two one-way doors closed with machine enforcement:

- D3 LOCKED: formula/herb homonyms disambiguated by classical source with a
  `__<source>` qualifier (`formula.wen_jing_tang__jinkui`); controlled
  source list; `scripts/validate-naming.js` fails on an unqualified shared
  name_zh. 0 homonyms today (115 formulas / 202 herbs) — guard catches the
  first. Self-tested: a 溫經湯 pair without `__` is flagged.
- D6 LOCKED: (1) `scripts/backfill-point-status.js` gave every point a
  review_status — floor "draft" only, adds-only; 235 unlabeled 361 records
  + 29 auricular filled; GB93 source_checked / Tung index_only untouched
  (no promotion). (2) New ledger data/acupoints/point_id_manifest.json (681
  ids) + `scripts/update-point-manifest.js`. (3) validate-point-ids.js now
  fails if a manifest id vanished from data (hard delete) — retire via
  review_status="deprecated" instead. Self-tested: a phantom manifest id
  triggered the failure, then the ledger was regenerated clean.

Both validators added to the standard list. Full sweep (7 validators) PASS.
All data-only + validators; no frozen-file changes. Branch point-id-namespace.
This closes the ID/naming/deletion one-way doors from the external review;
D2+D3+D4+D6 are now LOCKED and machine-enforced.

### 2026-07-13 - Point id namespacing executed (DECISIONS.md D2, Claude Code)

Ting ratified D2 ("統一命名"). Executed approach A: ADD a stable namespaced
`id` to every acupoint; the display `code` is untouched (URLs, prefix
matchers, UI all keep working; no frozen app.js change). Discovered Tung
already had ids (`tung.11.01`) — kept verbatim per D1's immutability rule.
Added ids to standard (id=code), auricular GB93 + embedded (`ear.at4` /
`ear.sm`), and EX extras (`ex.hn3`). 681 points → 681 unique ids, 0
collisions (GB93 `AT4` and embedded `AT4` are the same merged point and
correctly share `ear.at4`). New `scripts/add-point-ids.js` (adds-only,
respects existing ids) + `scripts/validate-point-ids.js` (locks the
convention; a bare non-standard id now fails the build; added to the
standard validator list). All validators PASS. Branch point-id-namespace
(off conditions-interop-design). Clinical foreign keys will reference `id`;
runtime wiring (adapter passthrough) waits for the Phase 2 merge, per the
DECISIONS.md / freeze sequencing.

### 2026-07-13 - 大辭典 verified + E3 gyn content fill (Claude Code)

Codex is out of credits, so Claude ran the unblocked work. Two parts:

1. 大辭典 verification: located the official resource — 中西醫病名對照
   大辭典 第二版 (國家中醫藥研究所, 2010, 全五冊, GPN 4809902627), official
   page nricm.edu.tw/p/412-1000-320.php, online database cnwm.nricm.edu.tw.
   The online DB EXISTS but was unreachable (port 80 timeout, 443 refused)
   from here — recorded edition + both URLs + the access note in
   source_registry (mohw_nricm_disease_name_dictionary). E-I3 stays
   BLOCKED: without dictionary access I will not fabricate citations.

2. E3 gyn_fertility content fill: filled the 25 gyn conditions in
   condition_canon_shortlist.json with summary_zh/en, red_flags_zh/en,
   western_context_zh/en (150 fields) via scripts/apply-condition-fill.js
   (adds-only, never overwrites; compact-format preserved so the diff is
   exactly the 25 gyn records, 125 others byte-identical). red_flags favour
   the refer-out/seek-care direction; western_context uses documentation
   language ("commonly managed with"), never treatment instruction. ALL
   draft / needs_source_review — this is the E3 first batch the module
   design queues (gyn first), pending Ting's per-batch review. Not rendered
   anywhere yet (conditionGraph rewire E-I6 is separately blocked), so this
   is pure reviewable data prep. New file data/pathology/condition_fill_gyn.json
   holds the source content; apply script is rerunnable for later batches.

Validators: relations/data/interactions/herb-canon PASS; encoding still
768 (my Chinese content added zero findings). Branch conditions-interop-design.

### 2026-07-12 - Track E-I0/I1/I2/I4 executed under Ting's delegation (Claude Code)

Ting reviewed the interop design + §6.1 replacement table, then delegated
continuation before stepping out (「繼續執行工作 然後always allowed」);
she returned before the scheduled run fired, so this executed live with
her present. Scope kept strictly to the four pre-listed tasks:

- E-I0 APPLIED: 18 mojibake name_zh strings repaired across
  conditions.json + condition_graph_expansion.json via the guarded
  script (verify-before-replace; re-run dry shows 0 left, 18 healthy).
  validate-encoding findings dropped 798 → 768 — 768 is the new
  expected backlog baseline.
- E-I1: 《中西醫病名對照大辭典》 added to source_registry
  (mohw_nricm_disease_name_dictionary, tier A, authority 5, additive
  only; exact edition/URL needs Ting verification before E-I3).
- E-I2: data/interop/condition_crosswalk.json created — 150 skeleton
  records, icd10 seeded 150/150 from icd_hint, cpt_placeholder /
  insurance_placeholder present on every record. PENDING Ting's
  5-record spot-check.
- E-I4: validate-relations extended (crosswalk FK integrity, id-shape
  check, reserved-field presence, icd_hint agreement warning) —
  150 records checked, 0 errors, 0 warnings.

All must-pass validators green. E-I3 remains BLOCKED on Ting's copy of
the 大辭典; E-I5 waits for the Phase 2 merge.

### 2026-07-12 - Conditions interop designed + pathology mojibake repair staged (Claude Code)

Per Ting's request (中英文醫學學習 + 病例 + 保險對接方向), wrote
docs/CONDITIONS_INTEROP_DESIGN.md EXTENDING the existing conditions
module design (three entities unchanged): (1) sidecar crosswalk layer
data/interop/condition_crosswalk.json — structured icd10[], 《中西醫病名
對照大辭典》(衛福部國家中醫藥研究所) dictionary_refs as the zh mapping
authority, cpt_placeholder/insurance_placeholder reserved-but-present on
every record so future fills need no migration; (2) symptom intake
structured fields where picking a suspected condition auto-surfaces its
red_flags as a mandatory screen; (3) HIPAA-target privacy rules (18
identifiers = de-id checklist, codes-not-member-IDs, BAA trigger line,
no PHI to AI services); (4) canonical AI answer template + fixed safety
phrase blocks zh/en; (5) Track E-I build order for Codex with the
CODEX_TASK_STATUS progress protocol.

Mojibake located: the 亂碼 Ting saw is NOT in the new Track E files
(clean) — it is 9 name_zh strings duplicated in data/pathology/
conditions.json + condition_graph_expansion.json (6 fertility-context
condition names + 濕熱/陰虛/血虛 pattern names). Originals are not
git-recoverable, so replacements are re-authored labels. Guarded script
scripts/repair-mojibake-pathology.js written; dry run verified 18/18
strings match the guard, 0 healthy fields touched. GATED: waiting for
Ting to approve the §6.1 replacement table before --apply.

Branch conditions-interop-design (stacked on phase2-runtime-adapter).
Docs + script only; no data files changed.

### 2026-07-12 - Phase 2 Runtime Adapter LANDED: app renders 361.json (Claude Code)

Executed docs/RUNTIME_ADAPTER_SPEC.md on branch phase2-runtime-adapter
(gate pre-approved, see entry below). The app now renders
data/acupoints/361.json as the single standard-channel source: all 361
points show full bilingual content, dashboard reads 361/361 with
status-based quality counters (draft 361 / source_checked 0), and the
embedded standard-channel arrays are retired from the runtime merge
(files untouched; they still contribute EX-HN3 印堂 / EX-HN5 太陽,
the two extras outside the 361 scope — discovered during field
verification, they would otherwise have been lost).

Changes: scripts/build-data.js emits data/generated/points_361.js;
index.html loads it before app.js; app.js gains adapt361Record() +
needling361Text() (7 BL61-67 records carry needling as an object with
mojibake technique text — rendered faithfully, data untouched per the
encoding freeze); standardPointPlaceholder() removed (validation passed
first); loadPoints() gains reconcileSavedPoints() dropping pre-adapter
localStorage snapshots (old placeholder stubs + unedited default copies
identified by their missing techniqueNotes key) so stale text cannot
shadow 361 content while real user edits still merge; validate-data.js
rewritten from legacy deep-equal to a 361-coverage validator (coverage,
field fidelity, safety-line preservation — every contraindication/danger
line must survive into runtime cautions — layer counts 361+2+29+13-1+277
= 681, duplicate check).

Validation: validate-data PASS, validate-interactions PASS,
validate-relations PASS, validate-herbal-links PASS, validate-herb-canon
PASS, validate-encoding expected FAIL still exactly 798. Browser QA on
a local static server: dashboard 361/361, LI4 + PC1 + BL61 render,
exact-search jump (PC8), topic filters, 390px no overflow, localStorage
3-scenario merge test, zero console errors.

Field-map deviations from the spec table (verified against real embedded
records as the spec instructed): functionsEn is a STRING in runtime
convention (joined " "), not array; needling maps to techniqueNotes.
Full implemented map recorded in docs/DATA_MIGRATION_MAP.md.

Next: push branch + PR for Ting's merge. After merge: Codex W4-1 status
strips can extend to point pages; Phase 3 hygiene continues.

### 2026-07-12 - Runtime Adapter gate APPROVED; handoff to Claude Code (Claude, Cowork session)

Ting approved the RUNTIME_ADAPTER_SPEC.md step-1 gate ask in a Cowork
session: retire `scripts/validate-data.js`'s legacy deep-equal check,
replaced by a 361-coverage validator, so the Runtime Adapter (Phase 2)
can proceed. Approval recorded here per the spec's requirement ("do not
start without this approval recorded").

Execution did not happen in that Cowork session: its Linux sandbox
(the tool environment used to run git/node there) failed to start after
repeated retries, so no branch/commit/validation could run. Ting is
switching to Claude Code (running locally) to continue Phase 2 with a
working shell. No files were touched — 361.json, app.js, index.html,
build-data.js, validate-data.js all unchanged from `f13899a`.

Next agent (Claude Code session): read this entry + EXECUTION_PLAN.md
Phase 2 + RUNTIME_ADAPTER_SPEC.md, confirm `git status` clean on main at
`f13899a` (or later), then execute the 8 spec steps directly — the gate
is already cleared, do not re-ask Ting unless spec details changed.


### 2026-07-12 - Herb module designed (Claude)

Ting's requirement: herb cards like formula cards, formula<->herb linking
in both directions, and category-based substitution reasoning (patient
allergic to one herb -> see category neighbors + the formulas it appears
in). Wrote docs/HERB_MODULE_DESIGN.md. Key design: (1) the herb->formula
direction ALREADY exists (related_formulas, 407 links) - the missing half
is formula->herb, added as composition_structured with herb ids +
optional jun/chen/zuo/shi roles; (2) herb comparison_group +
related_herbs + substitution_context_zh mirroring the proven formula
pattern, with the permanent wording law that neighbors are substitution
REASONING references, never dosage-equivalent swaps; (3) herb detail card
layout in the Codex-safe knowledge.js area; (4) the 34 existing category
labels stay as the classification layer with a rendered category index.
Build order = Track H (H1-H5) in CODEX_TASK_QUEUE, gated on Ting's
approval.


### 2026-07-12 - Conditions mapping layer BUILT: 150 conditions x bidirectional links (Claude)

Per Ting's request, executed the knowledge-dense core of Track E myself
(the part that benefits from a strong model), leaving prose fill to Codex:

- data/pathology/pattern_library.json: 50 TcmPattern records with key
  signs, tongue/pulse, treatment principles (NCCAOM differential core).
- data/pathology/tdis_registry.json: 75 traditional disease names
  (內科/婦科/外科/五官/傷科 chapter level) with permanent ids.
- data/pathology/condition_canon_shortlist.json: 150 western conditions
  across the 12 design categories, EACH with the bidirectional mapping -
  related_eastern_diseases (西醫->中醫病名) and related_patterns
  (2-5 patterns per condition). This is the foundation that 現代應用
  content on points/formulas will reference by id.

Integrity verified: 0 broken references; 70/75 tdis and 48/50 patterns
are used by at least one condition; category counts match the approved
scope (gyn 25, msk 30, gi 15, psych 15, resp 10, neuro 12, derm 8,
endo 10, cardio 8, uro 8, ent_eye 6, misc 3). All records draft /
needs_source_review; mappings are study references, not diagnostic
equivalence claims. All validators PASS.

Codex E3 next: fill summary/red_flags/western_context per condition
(category batches, gyn first; a condition may not render without
red_flags), then E-tags vocabulary, then conditionGraph UI wiring.


### 2026-07-12 - Dependency rule: conditions before modern-application content (Ting)

Ting set the ordering rule: the conditions module (Track E) completes
BEFORE any 現代應用 content is written on acupoints/formulas, because
modern-application statements must reference stable condition ids and the
bidirectional 西醫↔中醫病名 mapping. Encoded in CONDITIONS_MODULE_DESIGN
(prerequisite rule section: related_conditions/modern_use_tags may only
contain existing ids) and EXECUTION_PLAN (month schedule reordered: Week 2
= E1/E2 conditions skeletons first; C2 formula fills restricted to
classical content until Track E ids exist; W3-0 = gyn_fertility 25 first
fill batch).


### 2026-07-12 - Conditions module designed (Claude)

Ting flagged the 中西醫病名 layer as undesigned. Wrote
docs/CONDITIONS_MODULE_DESIGN.md: three-entity model (WesternCondition /
TraditionalDisease / TcmPattern) with full schemas, mandatory red_flags
on every condition, 150-condition NCCAOM+practice scope across 12
categories, ~50-pattern library expansion, one controlled tag vocabulary
shared by cases/conditions/formulas/herbs/points (the backbone of the M3
suggestion panel), permanent safety-wording rules, and the E1-E7 build
order plugged into CODEX_TASK_QUEUE (new Track E) and the month schedule
(W3-0). Gate: Ting approves design + scope before any skeleton is built.


### 2026-07-12 - Final handoff package: EXECUTION_PLAN + RUNTIME_ADAPTER_SPEC (Claude)

Per Ting's instruction that all agents follow Claude's plan going forward,
completed the handoff document chain:

- docs/EXECUTION_PLAN.md: THE standing ordered plan (Phases 1-6 with
  [TING]/[CLAUDE]/[CODEX] ownership, rules of engagement, standing
  freezes) PLUS a one-month Codex self-serve schedule (W1-W4, 20 slots,
  skip-if-gated rule) covering: CloudTCM verdict application, encoding
  triage of the 798 backlog, the 92 formula skeleton fills, herb
  deepening, WHO SAPL worksheets, and knowledge.js status-strip polish.
- docs/RUNTIME_ADAPTER_SPEC.md: complete surgical spec for the one
  remaining Claude-owned task - 361.json becomes the rendered source.
  Includes current-state facts, target data flow, full field-mapping
  table, 8 execution steps with the validate-data retirement gate,
  rollback plan, and known traps (localStorage resurrection, field-name
  verification, app.js freeze coordination).

Session start checklist for ANY agent: PROJECT_LOG top entry ->
EXECUTION_PLAN -> task spec -> NORTH_STAR -> AGENTS.md.

This closes the Fable session's handoff. Everything needed to continue
is in the repo.


### 2026-07-12 - A3+A4 browser visual QA PASS (Claude)

Ran the browser QA Codex requested for A4 (headless Chromium against the
static app):
- Dashboard counts: PASS (235 standard, 235/361 strip; live counter reads
  the embedded runtime layer as expected until the runtime adapter lands).
- Directory topic shortcuts (data-directory-topic-link): PASS - clicking
  applies the filter with visible chip + result count (auricular_index -> 41).
- Tung topic filter: PASS - 277 records, first card T11.01.
- Auricular topic filter: PASS - 41 records, first card AT4.
- Zero page errors on every view tested.
- Ear anatomy labels: #earAnatomyLabels renders 0 children and #modelStage
  is hidden - this is the DESIGNED state (canvas body/ear models were
  deprecated per README visual strategy), not an A4 regression.
  earAnatomyLabelData/earPointAnchors in ui_config.json are dormant legacy
  config; candidates for removal later with Ting's approval.

Verdict: A3 and A4 both verified. Track A complete. app.js UI-config
hydration works; next app.js surgery is the Claude-owned runtime adapter.


### 2026-07-12 - NORTH_STAR strategic map added (Claude)

At Ting's request, wrote docs/NORTH_STAR.md: the permanent big-picture map
for all AI collaborators. Contents: the one architectural law (app is
replaceable, data is not), three horizons anchored to Ting's 5-year plan
(3 school years + 2 practice years), technology decision triggers (when
SQL/framework/server become justified - default NO until a trigger fires),
the AI collaboration model (Claude architecture / Codex implementation /
Ting gates), permanent prohibitions, and the pick-up-work checklist for
any future agent. Known architectural debt named explicitly: clinical
cases in localStorage must move to durable storage before real patient
volume (H2). Direction precedence: NORTH_STAR wins on direction, AGENTS.md
wins on safety, CODEX_TASK_QUEUE carries tactics.

### 2026-07-12 - A4 UI config extraction (Codex)

Completed CODEX_TASK_QUEUE A4. Extracted the remaining app.js UI config constants into `data/config/ui_config.json`: standard channel audit, channel prefix metadata, auricular zone positions, directory region groups, directory topics, ear anatomy labels, and ear point anchors. `scripts/build-data.js` now includes this config in `data/generated/app_data.js` as `uiConfig`.

Updated `app.js` to hydrate the config from `globalThis.ACUTING_APP_DATA.uiConfig`, including regex-based directory region matching and explicit directory topic matchers. Updated `scripts/validate-interactions.js` to read topic IDs from the new config file instead of assuming they live directly in app.js. Updated `docs/DATA_MIGRATION_MAP.md` to mark the UI config as migrated.

Validation: node --check app.js, build-data, validate-data, validate-interactions, validate-relations, validate-herbal-links, and validate-herb-canon PASS. validate-encoding remains the expected 798-item backlog, with no increase from `ui_config.json`. Browser manual QA is still recommended for dashboard counts, directory topic shortcuts, and ear label placement.

### 2026-07-12 - A3 JS twins generation completed (Codex)

Completed CODEX_TASK_QUEUE A3 after Ting approved continuing past the gate. Updated `scripts/build-data.js` so the Tung and GB93 hand-maintained JS twins are generated from their JSON sources:

- `data/tung/point_index.js` from `data/tung/point_index.json`
- `data/auricular/gb93_index.js` from `data/auricular/gb93_index.json`
- `data/auricular/gb93_worklist.js` from `data/auricular/gb93_worklist.json`

Ran the build and compared generated JS payloads back to their JSON sources. All three matched. Added `docs/A3_JS_TWINS_DIFF_SUMMARY.md` for Ting/Claude review. Updated `docs/DATA_MIGRATION_MAP.md` to mark the `.js` twins as generated from `.json` sources.

Validation: node --check build-data and all three JS twins PASS; JSON-vs-JS payload equivalence MATCH for all three; validate-data, validate-interactions, validate-relations, validate-herbal-links, and validate-herb-canon PASS. validate-encoding still reports the known 798-item backlog and was not used as a blocker.

### 2026-07-11 - B3 herbs Lookup wiring (Codex)

Completed CODEX_TASK_QUEUE B3 as additive UI/data wiring. Added `data/herbs/herb_canon_shortlist.json` to `scripts/build-data.js`, so `data/generated/knowledge_data.js` now carries 202 draft herb records. Added a Lookup herbs section in `index.html`, and updated `js/knowledge.js` to render herb records with search, category filtering, draft status, channels, modern-use tags, safety flags, and related formula ID chips. Added small chip/card styling in `styles.css`.

No herb content was source-checked or upgraded. Every herb record remains draft/source-review pending and is displayed as study reference only. Did not touch `data/acupoints/361.json`, `docs/CLOUDTCM_*`, or the encoding backlog.

Validation: node --check build-data, node --check js/knowledge.js, build-data, validate-data, validate-interactions, validate-relations, validate-herbal-links, and validate-herb-canon PASS. validate-encoding still reports the known 798-item backlog and was not used as a blocker.

### 2026-07-11 - B2 formula merge applied + Lookup rendering (Codex)

After Ting approved continuing directly from B1, applied the formula merge using `scripts/merge-formulas-preview.js --apply-approved`. `data/herbs/formulas.json` now has 115 records: the original 23 content-bearing drafts preserved plus 92 draft skeleton additions from `formula_canon_shortlist.json`. No records were upgraded to `source_checked`; skeletons are source-review pending. Ran `scripts/build-data.js`, updating `data/generated/knowledge_data.js` so Lookup receives 115 formula records.

Updated `js/knowledge.js` formula rendering so the 23 content-bearing records remain full cards while skeleton-only formulas render as compact draft rows. Added formula search and category filter, and updated the formula progress strip. Added B2 validation details to `docs/VALIDATION_LOG.md`. Did not touch `data/acupoints/361.json`, `docs/CLOUDTCM_*`, or the encoding backlog.

Validation: node --check merge script, node --check js/knowledge.js, build-data, validate-data, validate-interactions, validate-relations, validate-herbal-links, and validate-herb-canon PASS.

### 2026-07-11 - B1 formula merge preview, no apply (Codex)

Completed CODEX_TASK_QUEUE B1 as preview-only work. Added scripts/merge-formulas-preview.js and generated docs/FORMULA_MERGE_PREVIEW.json plus docs/FORMULA_MERGE_DIFF_SUMMARY.md. The preview compares data/herbs/formulas.json (23 rendered/content-bearing records) with data/herbs/formula_canon_shortlist.json (115 draft canon records). Results: 23/23 overlap matched by id, 0 formula-only records, 92 shortlist-only formulas proposed as draft skeleton additions, projected merged total 115, 0 duplicate ids, 0 identity conflicts, 138 missing planning fields to fill from shortlist, 0 changed/conflicting overlap fields.

Updated docs/DATA_MIGRATION_MAP.md with the formula field map and recommended apply policy. No data file was modified; data/herbs/formulas.json was not changed. Stopped for Ting review before any apply.

Validation: node --check scripts/merge-formulas-preview.js, validate-data, validate-interactions, validate-relations, validate-herbal-links, and validate-herb-canon PASS. validate-encoding runtime remains an expected backlog failure and was not used as a blocker.

### 2026-07-11 - A1/A2 encoding guard + migration map sync (Codex)

Pulled latest main to 0259258 after Claude's D3 merge. Added scripts/validate-encoding.js as a read-only UTF-8 / mojibake guard for data/**/*.json, updated README.md and docs/CODEX_TASK_QUEUE.md to list it with validation, and wrote docs/ENCODING_VALIDATION_FINDINGS.md from the latest main scan. The scan checked 439 JSON files and found 798 existing findings: formulas.json 367, herb_canon_shortlist.json 202, source_registry.json 123, CloudTCM imports/staging replacement-character findings, pathology JSON 30, 361.json 7 remaining BL technique strings, and learn seed 2. No data was auto-fixed.

Completed A2 docs sync by updating docs/DATA_MIGRATION_MAP.md with newer formula/herb/import/pathology/medication/clinical workflow layers and their status as rendered, draft, staging, or not wired. Did not modify data/acupoints/361.json or docs/CLOUDTCM_*.

Validation: validate-encoding syntax PASS; validate-data, validate-interactions, validate-relations, validate-herbal-links, and validate-herb-canon PASS. validate-encoding runtime intentionally FAILS on the existing backlog until repaired or allowlisted.

### 2026-07-11 - D3 review strategy: DIFFER classification, no apply (Claude)

Per Ting's gate instruction (FILL=0, no --apply-approved), classified all
1,453 DIFFER items from docs/CLOUDTCM_MERGE_PREVIEW.json by extracting and
comparing facts (cun numbers incl. Chinese numerals and range dashes,
insertion method, depth-range overlap, safety keywords, risk zones).

Results — location_zh (360): 15 numeric conflicts, 73 landmark-low-overlap,
272 wording-only. needling (354): 25 method conflicts, 9 disjoint depth
ranges (e.g. GB39 ours 1-1.5cun vs CloudTCM 0.3-0.5cun), 26 missing-safety
(CloudTCM has a safety phrase ours lacks), 84 risk-zone wording-only, 211
low-risk wording. functions/indications: draft reference only, not merged.

Outputs: docs/CLOUDTCM_REVIEW_STRATEGY.md (method, counts, approval options)
and docs/CLOUDTCM_HIGH_RISK_DIFFS.md (queues A-F with side-by-side text).
Notable: several location "conflicts" are different reference systems for
the same spot (CV15 胸劍結合下1寸 vs 臍上7寸); CloudTCM text quirks (OCR
"l" for "1" in SI19, box-dash ranges in HT2) are handled.

STOPPED here for Ting's review. No change to 361.json. Next: Ting picks
per-queue decisions (A/B/C adjudicate per record; D approve append of
missing safety phrases; wording-only 272 may be batch-adopted separately).

### 2026-07-10 - BL61-BL67 encoding repair preview (Codex)

Prepared a gated preview for the canonical BL61-BL67 fields that contain literal question-mark encoding damage. Added scripts/preview-bl61-bl67-encoding-repair.js and generated docs/BL61_BL67_ENCODING_REPAIR_PREVIEW.md/json. The preview proposes 3 concise repairs (BL61 location_zh, BL67 location_zh, BL67 contraindications) and leaves 13 clinical_pearls/danger-style fields for manual rewrite or removal decision. No canonical data changed.

Validation: node --check preview script, validate-data, validate-interactions, and UTF-8 doc spot-check PASS. Next step is Ting approval before applying any repair to data/acupoints/361.json.

Update after Ting approval: applied only the 3 approved concise repairs to data/acupoints/361.json. The remaining 13 damaged study-note/safety-note fields were intentionally left unchanged for manual review.

### 2026-07-10 - D3 Batch A safety review worksheet (Codex)

Continued D3 review without applying any merge. Added scripts/build-cloudtcm-safety-review-batch.js and generated broad Batch A plus focused Batch A1 safety worksheets. Batch A1 has 107 explicit high-risk region point codes covering eye/face, neck/head risk, chest/back pneumothorax, abdomen/pregnancy/organ-depth, and common pregnancy caution points. Also added scripts/report-361-encoding-findings.js and docs/CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md after finding 16 literal-question-mark damaged fields in canonical 361.json across BL61-BL67. No canonical data changed.

Validation: node --check for both scripts, validate-data, validate-interactions, and UTF-8 doc spot-check PASS.

### 2026-07-10 - D3 CloudTCM review strategy docs (Codex)

After D3 preview showed FILL=0 for every field, Codex did not apply any merge. Added scripts/analyze-cloudtcm-diffs.js and generated docs/CLOUDTCM_REVIEW_STRATEGY.md plus docs/CLOUDTCM_HIGH_RISK_DIFFS.md. Triage result: 1453 DIFFER items total; 553 high-risk, 15 medium-risk, 189 low wording differences, 696 reference-only prose differences. Recommended next step is small human-review batches, not bulk apply.

Validation: node --check analyze script, validate-data, and validate-interactions PASS. No canonical data changed.

### 2026-07-10 - D1-D2 CloudTCM acupoint private staging (Codex)

Pulled local main to a8cdb21, then ran CODEX_TASK_QUEUE D1-D2. Probe fetch (--limit 5) succeeded, then full CloudTCM fetch completed with 361/361 raw JSON files and 0 failures under data/imports/cloudtcm/points/. Updated scripts/transform-cloudtcm-points.js to match the real Next.js shape (pageProps.pageData) and preserve canonical codes (LU1) while storing CloudTCM padded codes (LU01) as cloudtcm_code.

D2 output: staging_points.json has 361 draft records; coverage is 361/361 for names, location, technique, and description, 348/361 for functions and indications, 44/361 for cautions, 0 unmatched raw files. This is private study staging only; no canonical data or generated runtime data was changed. D3 remains gated: preview/diff summary first, no apply without Ting approval.

Validation: validate-data, validate-interactions, validate-relations, validate-herbal-links, validate-herb-canon, and JSON parse check all PASS.

### 2026-07-09 — Codex D5 verified + merged; 361-point data layer COMPLETE (Claude)

Codex pushed D5 (fba37ac) onto the OLD main, so his 361.json had only 235
records — a plain merge would have lost the 126 new points. Resolution:
kept this branch's 361-record file and re-ran Codex's five batch files
(bl/ki/sp/si/final_tail) through apply-361-enrichment.js. Result: 255
fields filled across 150 records; needling / location_en / functions_en
gaps are now ZERO across all 361 records. Spot-check BL13 肺俞 shows the
required pneumothorax wording. All validators PASS. Merge commit bad8beb
pushed to the claude/acuting-os-rebuild-analysis-u0e82n branch (PR #1).

IMPORTANT for Ting/Codex: main is now BEHIND PR #1 and Codex's local main
is diverged. Do NOT let Codex keep committing to main — next steps:
1. Ting merges PR #1 on GitHub (it contains everything: 361 complete layer,
   all fixes, Codex's D5 via re-apply).
2. On the local machine: git checkout main && git pull (gets the merged
   result). Codex resumes from CODEX_TASK_QUEUE.md — safe next tasks:
   D1+D2 (CloudTCM fetch, local machine only), A1 (encoding guard),
   A2 (migration map sync), B1 (formula merge preview, gated).
3. Claude-owned next task (needs a fresh session): RUNTIME ADAPTER — make
   the app render data/acupoints/361.json so the completed layer becomes
   visible point pages (home counter still reads the old embedded layer,
   shows 235). Includes retiring the legacy deep-equal gate in
   validate-data.js with Ting's approval. Everything needed is in this log,
   CODEX_TASK_QUEUE.md, and 361_DRAFT_FILL_SUMMARY.md.


### 2026-07-09 — CloudTCM links to full pages; enrichment pipeline + LU/HT batch (Claude)

1. Visual links: Ting reported the CloudTCM thumbnails (media.cloudtcm.uk/
   acupoint-s/*.jpg) are too small to study from (e.g. LU2 雲門). enrichPoint
   now links visual references to the full point page
   (cloudtcm.com/acupoint/{id}) for all 361 mapped points, and upgrades any
   previously-stored thumbnail URLs to the page. cloudtcmImage() replaced by
   cloudtcmPageUrl(). Browser-verified on LU2 → /acupoint/162.
2. Point hero titles were made Chinese-first earlier today (h2 always 中文,
   subtitle pinyin · English · code, both content modes).
3. Field enrichment for existing records: new fill-empty-only pipeline
   `scripts/apply-361-enrichment.js` (only needling/location_en/functions_en/
   indications_en/contraindications; never overwrites non-empty values;
   conflicts reported; appends to 361_DRAFT_FILL_SUMMARY.md). Worked example
   batch `enrichment/lu_ht_enrichment.json` applied: 35 fields across 20
   records (LU1-11, HT1-9 needling; LU1/5/7/9 + HT7 EN triples). All drafts
   pending source review.
4. Remaining ~150 records (BL 60, KI 27, SP 21, SI 19, small remainders)
   handed to Codex as CODEX_TASK_QUEUE.md D5 with exact gap-count command,
   file format, safety rules (胸背穴氣胸警告必寫), and batch order.

Validation: app.js syntax + validate-data (681 deep-equal) +
validate-interactions + validate-relations PASS after both changes.

### 2026-07-08 — 361 layer complete: 126 missing points filled as model drafts (Claude)

Scope: Ting approved fast content filling using the established source
registry. Since the sandbox network policy blocks direct fetching of the
registry sites (403 on acupoints.org / acupun.site / cloudtcm.com), Claude
filled the 126 missing standard points as conservative model-knowledge
drafts — the same accepted pattern as the herb (202) and formula (23)
draft fills — for later cross-checking against CloudTCM (D1-D3) and WHO SAPL.

Changes:
- New `data/imports/model_draft/{pc_lr_te,cv_gv,gb}_draft.json`: 126 records
  (PC8, LR12, TE22, CV20, GV25, GB39) with bilingual location, functions,
  indications, needling reference, and contraindications. High-risk points
  carry explicit danger notes (CV22 天突 trachea/aortic arch; GV15 啞門 +
  GV16 風府 medulla; CV8 神闕 needling contraindicated; chest/flank points
  pneumothorax warnings; GV1 rectum; LR12 femoral artery; LR13/GB24/GB25
  organ depth).
- New `scripts/insert-361-drafts.js`: add-only inserter (existing records
  never modified; aborts on duplicate codes), auto-fills per-point sources
  (acupoints.org + CloudTCM direct link from the point map), stamps every
  record review_status "draft" / source_status
  "model_draft_pending_source_review", writes docs/361_DRAFT_FILL_SUMMARY.md,
  regenerates data/audits/missing_report.json.
- Applied: data/acupoints/361.json 235 → 361 records (0 modified, 0 removed).
- missing_report.json now 361/361 present; ran scripts/build-data.js so the
  Quality audit strip shows 361/361 · 缺 0 (browser-verified).

Known visible discrepancy (intentional, documented): the LIVE dashboard
counters still show 235/361 because the app runtime reads
data/acupoints/embedded/*.json, not 361.json. The audit strip (361/361)
counts the canonical layer. The runtime adapter that makes 361.json the
single rendered source is the next Claude-owned task — until then the 126
new drafts are reviewable in 361.json but not yet visible as point pages.

Validation:
- insert dry-run before apply: 126 to insert, 0 skipped, no duplicates.
- After apply: validate-data (681 deep-equal — runtime untouched),
  validate-interactions, validate-relations, validate-herbal-links,
  validate-herb-canon all PASS; 69 data JSON files parse OK.

Accuracy guardrail: all 126 records are study drafts from model knowledge.
None is source_checked. Verification path: CloudTCM import cross-check
(CODEX_TASK_QUEUE D1-D3) → WHO SAPL location verification → per-record
promotion. Needling fields are study reference only, not operating
instructions.

Next:
1. (Claude) Runtime adapter: render 361.json content in the app so the new
   drafts become usable point pages — includes retiring/adapting the legacy
   deep-equal gate in validate-data.js with Ting's approval.
2. (Codex/Ting machine) D1-D2 CloudTCM fetch + distill to cross-check the
   Chinese layer of these drafts.

### 2026-07-08 — Bulk content pipeline: CloudTCM 361-point import scripts (Claude)

Scope: Ting asked how to distill point/formula page content from the
recommended sources faster than channel-by-channel manual work, using public
GitHub resources or APIs where possible.

Research result:
- No open dataset exists with study-grade bilingual 361-point TEXT content.
  Public "acupoint datasets" (AcuSim, FAcupoint, MetaAcuPoint, TARA) are
  computer-vision image-localization sets. The Mengqi97 dataset index has no
  acupoint text source (confirms the 07-03 DATASET_SHORTLIST finding).
- Formula-side open repos are network-pharmacology/KG projects, not
  textbook-grade content. Public-domain classics (傷寒論 etc., via ctext.org
  or the TCM-Ancient-Books corpus) can seed classical compositions later.
- Fastest bulk channel is already half-built in this repo: CloudTCM's Next.js
  data endpoint + the existing data/sources/cloudtcm_point_map.json
  (361 code→id, Session 8).

Changes:
- New `scripts/fetch-cloudtcm-points.js`: resumable, rate-limited (600 ms)
  fetcher for all 361 point pages → raw JSON under
  data/imports/cloudtcm/points/ + fetch_manifest.json. Must run on Ting's
  machine (cloud sandbox cannot reach cloudtcm.com). Probes buildId
  automatically per the re-fetch notes in TCM_SOURCE_REGISTRY.md.
- New `scripts/transform-cloudtcm-points.js`: distills raw JSON →
  data/imports/cloudtcm/staging_points.json (every record draft /
  cloudtcm_import_pending_review with source_url) + coverage_report.json.
  Has --inspect mode because the exact pageProps shape is unknown until the
  first real fetch; FIELD_CANDIDATES is designed to be tightened after
  inspection.
- docs/CODEX_TASK_QUEUE.md: new Track D (D1 fetch → D2 distill → D3 gated
  merge into 361.json mirroring the proven merge-361-preview pattern → D4
  formulas), with the license/usage rule stated: raw imports are private
  study staging only, per-record source URLs kept, nothing goes public
  without rewrite + WHO/authorized verification. English content has no
  legal bulk source (Deadman/Bensky copyrighted); bulk speed applies to the
  Chinese layer, English stays channel-by-channel against WHO SAPL.
- Suggested execution order updated: D1→D2 first (biggest coverage win:
  126 missing points gain Chinese content; 645 missing-needling and 138
  missing-safety records get fill candidates).

Validation: both new scripts pass node --check; transform script correctly
refuses to run without raw files. No data or runtime files touched.

Next: Ting runs D1 probe (`node scripts/fetch-cloudtcm-points.js --limit 5`)
on her machine, or dispatches D1+D2 to Codex. D3 merge stays approval-gated.

### 2026-07-08 — Claude UI scan + three fixes (dashboard count bug, heading dup, SOAP keyword links)

Scope: full browser walkthrough (desktop 1280px + mobile 390px, headless
Chromium screenshots of every workspace) followed by three approved fixes.

Findings from the scan:
- HIGH: home + Quality dashboards showed 0/361 standard points, 0% completion,
  0/N on every channel — contradicting the static audit strip (235/361) on the
  same page. Root cause: `mergeByCode` spreads real records over placeholders,
  but real data records carry no `reviewStatus` field, so the placeholder's
  `reviewStatus: "placeholder"` survives the merge and
  `isReviewedStandardChannelPoint` rejected all 681 points. Bug existed in
  legacy app.js too (not a rebuild regression).
- LOW: point detail section headings rendered doubled ("基本介紹 基本介紹")
  because `studySection` printed `sectionIcon(tone)` + `title`, which resolve
  to the same string.
- SOAP notes' 用穴/方藥 were plain escaped text — the case↔knowledge-base
  keyword link (long-standing Claude backlog item) did not exist yet.
- Positive: mobile 390px has zero horizontal overflow; point pages, routing,
  search, CloudTCM direct links, and the 23 formula cards all render correctly.

Changes (app.js + styles.css only; no data files touched):
- `isPlaceholderStandardRecord(point)` content-based check (reviewStatus
  "placeholder" AND nameZh === code); `isReviewedStandardChannelPoint` and
  `getDataQualityAudit`'s reviewed/placeholder counts now use it. Data itself
  is unchanged, so validate-data deep-equal still passes. Dashboards now show
  235/361 present, 126 placeholders, 65% — matching missing_report.json.
- `studySection` / visual-links / pairing section h3s print the title once;
  removed the now-unused `sectionIcon()`.
- New `linkifyPointsUsed` / `linkifyFormulaHerbs` in the SOAP card renderer:
  用穴 tokens matching a point code, Chinese name, or pinyin become
  `#point/{code}` links; 方藥 tokens matching a formulas.json record (name_zh
  / pinyin / name_en) link to `#formulaSection`. Unmatched terms stay plain
  text (honest contract — only records that exist in the knowledge base get
  links). New `.note-term-link` style in styles.css (dotted underline).

Validation:
- `node --check app.js` PASS; validate-data (681 deep-equal), 
  validate-interactions, validate-relations, validate-herbal-links all PASS.
- Playwright end-to-end: 6/6 PASS — home count 235, quality 235/361 · 65% ·
  126 placeholders, no duplicated headings on #point/LI4, 用穴 "LI4, 太衝,
  GB20, 太陽" all linkified, "Gui Zhi Tang" linkified (天麻鉤藤飲 correctly
  NOT linked — not in the 23-record formulas.json yet), clicking LI4 lands on
  the point page.

For Codex: `sectionIcon()` was removed from app.js; `isPlaceholderStandardRecord`
is the new placeholder test — reuse it instead of checking `reviewStatus`
directly. The SOAP linkify helpers live next to `renderSoapNoteCard`; do not
modify them (Claude-owned case/SOAP area, per standing rules).

Next (Claude backlog): case dialog / SOAP dialog segmentation per
docs/CASE_SOAP_FLOW_REVIEW.md; Cases workspace layout — move the working
notebook above the explainer/scaffold sections.

### 2026-07-08 — Claude Cowork sync check (status audit, no code/data changes)

Scope: Claude Cowork rejoined after several days of Codex-only sessions on Ting's
machine. This entry is a read-only audit of what actually changed since the
last `DATA_MIGRATION_MAP.md` / `REBUILD_PLAN.md` update (2026-07-02), so both
agents share the same status before any new work is assigned. No files other
than this log entry were touched.

Reviewed: AGENTS.md, git log/status, docs/REBUILD_HANDOFF.md (Sessions 7–21),
docs/REBUILD_PLAN.md, docs/DATA_MIGRATION_MAP.md, docs/VALIDATION_LOG.md,
docs/SESSION3_FINAL_STATUS.md, docs/CODEX_FOLLOWUP_2026-07-02.md,
docs/361_MERGE_DIFF_SUMMARY.md, docs/MIGRATION_OFF_ONEDRIVE.md, and direct
inspection of `data/acupoints/361.json`, `data/herbs/formulas.json`,
`data/herbs/formula_canon_shortlist.json`, `data/herbs/herb_canon_shortlist.json`.

Findings — completed since 2026-07-02:
- 361.json standard-point merge is DONE and applied, not pending. Ting approved
  `docs/361_MERGE_DIFF_SUMMARY.md`; `scripts/merge-361-preview.js --apply-approved`
  ran; `data/acupoints/361.json` is 210→235 records, 0 removed, 23 documented
  conflict fields left as-is. `validate-data.js` (681 deep-equal) and
  `validate-interactions.js` passed after apply. Runtime still reads
  `data/acupoints/embedded/*.json` via `app_data.js` — 361.json is merged but
  not yet wired as the runtime source (documented next step, not done).
- Formula/herb draft content buildout (Sessions 9–21, 07-03→07-07): 115-record
  `data/herbs/formula_canon_shortlist.json` (ids/tier/comparison_group/
  related_formulas graph complete, 23/115 filled with dual-track draft
  content); 202-record `data/herbs/herb_canon_shortlist.json` (all 202
  draft-filled, 0 `source_checked`). New validators added
  (`validate-herb-canon.js`, `validate-relations.js`, `validate-herbal-links.js`).
  Confirmed by direct read: neither shortlist file is wired into the UI —
  the app's live Formula section reads the separate, smaller
  `data/herbs/formulas.json` (23 records, wired by Claude on 07-02 via
  `js/knowledge.js` / `data/generated/knowledge_data.js`). The two shortlists
  are a parallel, not-yet-connected content-staging track.
- docs/CASE_SOAP_FLOW_REVIEW.md (Session 14): docs-only review of case/SOAP
  form UX, no schema or code change.

Findings — still in progress / not started:
- `REBUILD_PLAN.md` Phase 2 items untouched since 07-02: moving remaining
  configs (`standardChannelAudit`, `channelPrefixMeta`, `directoryRegionGroups`,
  etc.) out of app.js into data/; generating `data/tung/point_index.js` and
  `data/auricular/gb93_*.js` from their `.json` source instead of hand-maintaining
  twins. `DATA_MIGRATION_MAP.md` still marks both as "UNCHANGED — Phase 2."
  No git history on `data/tung/` or `data/auricular/` since 07-02.
  `DATA_MIGRATION_MAP.md` itself has not been updated since 07-02, so it no
  longer reflects the herb/formula shortlist work.
- 92/115 formula_canon_shortlist records are still skeleton-only (name/
  category/source_hint, no content).
- No herb or formula record has been source-checked against Bensky/CloudTCM
  yet; all new content remains `draft`.

Risk note (not a rule violation, but a repeat-risk pattern): Session 19
batch-expansion of `herb_canon_shortlist.json` corrupted Chinese labels on 32
records via a Windows console encoding issue (`pending_utf8_repair` /
`pending_chinese_label_repair`); Session 20 repaired them before any promotion
past `draft`. No data was lost or silently overwritten, but this is the same
failure mode as the earlier OneDrive corruption (`docs/MIGRATION_OFF_ONEDRIVE.md`)
— local Windows console/sync environment corrupting Chinese text during
large batch edits. Worth a standing guard (e.g. a UTF-8 spot-check step)
before any future large batch content fill, not just after.

No hard-rule violations found: no data files deleted, no fields removed
without a migration note, no private/public content mixing, nothing pushed
without documentation. Working tree is clean; local branch matches
`origin/main` at `33bc8a4` — no unexplained uncommitted changes.

Validation: none run this session (read-only audit; ran ad hoc `node -e`
record-count checks against `formulas.json` / `formula_canon_shortlist.json`
/ `herb_canon_shortlist.json` to confirm the wiring gap above, no files
modified).

Commit: pending.

Next: Ting to review this entry, then Claude will propose a Codex/Claude work
split for the next phase (candidates: (a) reconcile REBUILD_PLAN.md Phase 2
against actual state, (b) decide whether to keep expanding herb/formula
shortlists or wire the existing 23-formula content deeper first, (c) pick up
the stalled Tung/GB93 codegen and app.js config extraction). No implementation
starts until Ting approves the split.

Follow-up same day: Ting asked for the work split to be written down while
Codex is low on tokens. Added `docs/CODEX_TASK_QUEUE.md` (self-contained,
token-cheap task specs A1–C3 with approval gates; Claude-owned items listed
separately) and updated REBUILD_PLAN.md Phase 2 with per-item ✅/⬜ status plus
a Phase 2.5 note for the shortlist staging work. Standing decision recorded:
wire existing draft content into the UI before creating new draft-content
files. Ting dispatches tasks to Codex by ID when he has budget.

### 2026-07-03 — Dataset foundation staging

Scope: first dataset-first import foundation for formulas and future TCM knowledge expansion.

Changes:
- Added `data/imports/README.md` with raw import rules.
- Added `data/imports/import_manifest.json` to track source URLs, license/access status, download status, and intended AcuTing targets before any raw import.
- Added `data/herbs/formula_import_staging.json` as the safe formula staging layer: existing 23 formulas as the pilot batch, 115 formula canon records as the expansion target, and merge requirements.

Safety wording:
- No raw dataset was downloaded.
- No canonical formula content was overwritten.
- All future imported content defaults to `draft` / `dataset_import_pending_review`.
- Modern clinical use and related conditions remain search/study context only, not treatment claims.

Validation:
- `scripts/validate-data.js` PASS.
- `scripts/validate-interactions.js` PASS.
- `scripts/validate-herbal-links.js` PASS.
- `scripts/validate-relations.js` PASS.
- `data/**/*.json` parse check PASS: 65 JSON files.

Next:
- Confirm the exact formula knowledge-base source URL and terms before any raw download.
- If approved, add raw files under `data/imports/<source>/` and record hashes in `import_manifest.json`.
- Transform into staging first; do not merge into `data/herbs/formulas.json` until Ting approves a diff summary.

### 2026-07-03 — Friday relation validation layer

Scope: pathology graph, western medications, fertility workflows, clinical decision links.

Changes:
- Added `scripts/validate-relations.js` to verify ID cross-references across Western conditions, TCM patterns, formulas, western medications, acupoints, fertility workflows, formula relationship links, and clinical decision review prompts.
- Added `data/clinical_cases/clinical_decision_links.json` as a draft registry for 17 fertility review-prompt IDs used by formula-pattern links.
- Expanded `data/pathology/conditions.json` and `data/pathology/condition_graph_expansion.json` with draft documentation-context nodes for fertility workflow references: insulin resistance, male-factor context, ovulatory-factor context, IVF cycle, embryo transfer, luteal support, damp-heat, yin deficiency, and blood deficiency.
- Normalized `DU20` references to the existing acupoint code `GV20`.

Safety wording:
- All new relationship content remains `draft`, `source-review pending`, `public_safe: false`, and framed as documentation context / review prompt only.
- No treatment protocol, diagnosis substitution, or efficacy claim was added.

Validation:
- `scripts/validate-data.js` PASS.
- `scripts/validate-interactions.js` PASS.
- `scripts/validate-herbal-links.js` PASS.
- `scripts/validate-relations.js` PASS: 12 western conditions, 9 TCM patterns, 115 formulas, 12 western medications, 237 acupoint codes, 21 fertility workflow/review prompt IDs, 989 checked links.
- `data/**/*.json` parse check PASS: 63 JSON files.

Commit:
- pending in this session.

Next:
- Use the relation validator as the required guard before adding more pathology, medication, formula, acupoint, or fertility workflow links.
- If future source review upgrades any relationship from draft, attach citations before changing status.

### 2026-07-03 — Rebuild sprint (Claude Cowork + Codex, relayed by Ting)

Scope: Phase 1 data liberation, workspace shell, brand UI, search fixes, migration off
OneDrive, Phase 2 wiring, CloudTCM direct-link map, formula canon shortlist, TCM case/SOAP
restructure. Multi-session; see docs/REBUILD_HANDOFF.md Sessions 1–12.

Key changes (all validated):
- Data liberation: app.js 8,785→~3,300 lines; embedded data → data/**/embedded/*.json →
  scripts/build-data.js → data/generated/{app_data,knowledge_data,cloudtcm_map}.js.
- Workspace shell: js/router.js (Home/Lookup/Cases/Quality/Sources/Learn); brand-warm styles.css.
- Search: home + directory search open exact-match single point directly; data-load guard banner.
- Migration: repo moved OneDrive → C:\Projects\acupuncture-point-app (OneDrive copy archived).
- Phase 2: js/knowledge.js renders formulas/conditions/sources/audit from JSON.
- 361 merge (Codex): data/acupoints/361.json 210→235; docs/361_MERGE_DIFF_SUMMARY.md.
- CloudTCM: data/sources/cloudtcm_point_map.json (361 code→id+image); 中文來源 now直連
  cloudtcm.com/acupoint/{id}; image → media.cloudtcm.uk/acupoint-s/{img}.jpg.
- Formula canon (Codex): data/herbs/formula_canon_shortlist.json (115, all draft);
  rules in docs/FORMULA_SCHEMA_RULES.md.
- Case/SOAP (Claude): TCM-shaped intake — case層(sex/birthYearMonth/occupation/goals/HPI/PMH/
  menstrualObHistory/lifestyle/allergies/currentMeds) + visit層(tongueBody/tongueCoating/pulse/
  vitals/tcmPattern/pathomechanism/treatmentPrinciple/modalities/advice). Backward-compatible.
- Source strategy: docs/TCM_SOURCE_REGISTRY.md (tiered authoritative sources + dataset-first workflow);
  docs/DATASET_SHORTLIST.md reviewed (no dataset imported yet).

Validation (Codex-confirmed): app.js syntax PASS; validate-data.js PASS (681 deep-equal excl.
reference-URL fields); validate-herbal-links.js PASS; validate-interactions.js PASS (0 failures);
62 JSON files parse PASS.

Commit: pending — to be committed on Ting's Windows machine by Codex (Claude does not run git
in the sandbox mount). See commit command in this session's chat.

Next: (1) commit the working tree as one coherent batch; (2) Codex Friday task — pathology graph,
western medications, fertility workflows, clinical decision relation-validation layer;
(3) Claude backlog — make case point/formula links clickable → jump to knowledge base.



### 2026-07-02

Scope: Formula-pattern relationship layer.

Changes:
- Added `data/herbs/formula_pattern_links.json` as a draft relationship index connecting high-yield formulas to TCM pattern IDs, Western condition contexts, acupoint seed codes, safety flags, fertility workflow hooks, and future SOAP fields.
- Added `scripts/validate-herbal-links.js` to check formula IDs, graph IDs, safety flags, acupoint codes, review status, source status, and draft public-safety rules.
- Kept all new relationship records as `draft_index`, `needs_professional_source_review`, and `public_safe: false` so they are study/search structure only, not clinical authority or public-ready content.

Validation:
- `scripts/validate-herbal-links.js` passed: 10 draft formula relationship records.
- `scripts/validate-interactions.js` passed.
- `app.js` syntax check passed.
- JSON parse check passed for `data/**/*.json`.

Commit:
- `91e88eb`

Next:
- Connect the formula relationship layer into the UI as source-aware formula detail prompts, then expand the clinical graph with missing pattern IDs such as qi deficiency, blood deficiency, yin deficiency, yang deficiency, damp-heat, and heart-spleen deficiency.

### 2026-07-01

Scope: System architecture audit.

Changes:
- Added `ARCHITECTURE_AUDIT.md` as the system-level architecture decision map for AcuTing OS.
- Identified the core issue: multiple valid products are currently sharing one visual hierarchy.
- Defined the recommended product layers: Lookup, Clinical, Quality, and Public.
- Classified current sections into keep/change decisions.
- Defined interaction rules, data entities, relationship model, content status model, mobile architecture, and staged rebuild strategy.
- Established that future work should reduce one-page sprawl before adding more content.

Validation:
- Documentation-only update.
- Confirmed existing `DESIGN_OPTIMIZATION_PLAN.md` remains focused on UX/design workflow, while `ARCHITECTURE_AUDIT.md` covers product/system structure.

Commit:
- This entry is part of the commit that adds the system architecture audit.

Next:
- Start applying the architecture map by grouping the visible UI mentally and then in code into `Lookup`, `Clinical`, `Quality`, and `Public` zones.

### 2026-07-01

Scope: Related-point navigation clarity.

Changes:
- Reworked single-point sidebar related-point and common-pairing buttons through a shared `relatedPointButton()` helper.
- Added visible `Open point page / 開啟單穴頁` labels to related-point controls so they read as navigation, not static lists.
- Added `aria-label` text to related-point and pairing-row controls describing the target point page.
- Updated the common pairing table action column from `Linked Pattern` to an explicit `Action` column.
- Added styling for `related-point-action`, `related-point-main`, `related-point-open`, and `pairing-action-label`.
- Updated `scripts/validate-interactions.js` to require related-point navigation labels, helper usage, and action styling hooks.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 51 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that clarifies related-point navigation.

Next:
- Continue auditing remaining edit/copy buttons on the point detail page, especially whether copy-link feedback and edit actions are clear enough for private vs public data workflows.

### 2026-07-01

Scope: Acupoint card action clarity.

Changes:
- Converted rendered acupoint cards from visually clickable articles into explicit point-page actions with `role="button"`, `data-point-card`, and bilingual `aria-label` text.
- Added a visible card action row: `Open point page / 開啟單穴頁`, with the point code shown as the action target.
- Improved keyboard support by preventing Space key page-scroll while opening the point page.
- Added focus-visible styling so keyboard users can see the active acupoint card target.
- Updated `scripts/validate-interactions.js` to require point-card action semantics, visible action text, keyboard handling, and focus styling.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 51 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that clarifies acupoint card actions.

Next:
- Continue auditing the acupoint detail page sidebars and related-point buttons so those controls clearly show that they navigate to another single-point page.

### 2026-07-01

Scope: Dense module quick-navigation.

Changes:
- Added precise `section-quicknav` anchors for Formula, Condition Graph, Source Registry, and Case Workspace.
- Formula now has direct anchors for Schema, Categories, Safety, and Progress.
- Condition Graph now has direct anchors for Layers, Graph Rule, Fertility Workflow, and Case Notes.
- Source Registry now has direct anchors for English, Chinese, Auricular, and Core Standards source groups.
- Case Workspace now has direct anchors for Actions, Case List, Selected Case, and Billing Scaffold.
- Added shared quicknav styling and mobile two-column behavior.
- Extended target highlighting and scroll offset to sub-sections, not only top-level sections.
- Updated `scripts/validate-interactions.js` to require dense-module quicknav anchors and at least four `section-quicknav` blocks.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 51 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that adds dense module quick-navigation.

Next:
- Continue auditing acupoint-specific controls and list/detail transitions, especially whether every point card action clearly opens an individual point page and can return to the directory.

### 2026-07-01

Scope: Hash-jump destination context and stale duplicate CSS cleanup.

Changes:
- Added visible `:target` highlighting for major section destinations so card/hash jumps provide clear visual feedback.
- Added `scroll-margin-top` to major sections, the acupoint search panel, and the clinical case workspace so section headings are not hidden by sticky navigation after jumps.
- Removed stale CSS for the deleted duplicate `public-architecture` and `tung-zone-section` planning sections.
- Updated `scripts/validate-interactions.js` to require target-context CSS, scroll offset support, and absence of the old duplicate section classes.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that adds hash-jump destination context.

Next:
- Continue checking whether dense modules need a more precise sub-navigation layer, especially Formula, Condition Graph, Source Registry, and Case Workspace.

### 2026-07-01

Scope: Dynamic main module active state.

Changes:
- Removed the hard-coded `active` state from the AcuTing OS top module chips.
- Added dynamic module navigation state derived from the current URL hash.
- Point pages and acupoint workspace now highlight Acupuncture; case workspace highlights Patient Records; fertility workflow maps to Conditions.
- Added `aria-current="page"` to the active module chip for clearer navigation semantics.
- Updated `scripts/validate-interactions.js` to fail if module chips hard-code active state or lose the dynamic active-state hooks.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that fixes dynamic module navigation state.

Next:
- Continue the interaction audit by checking secondary module cards and plain hash jumps for visible section context, especially dense sections where a jump alone can feel like a broken or fake action.

### 2026-07-01

Scope: Visible acupoint filter state.

Changes:
- Added an `activeFilterSummary` area under the acupoint search filters.
- The directory now shows active search, channel, region, pattern, body-group, and topic filters as clearable chips.
- Added a clear-all control so topic shortcuts such as Auricular Index and Master Tung Index are visible and reversible.
- Added mobile styling so filter chips wrap into readable full-width rows on small screens.
- Updated `scripts/validate-interactions.js` to require the visible active-filter UI and clear-filter hooks.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- `430c19f Show active acupoint filters`

Next:
- Continue reducing fake or unclear interactions by auditing remaining clickable cards for visible state changes, especially module cards that apply hidden filters or jump to dense sections.

### 2026-07-01

Scope: Push workflow validation gate.

Changes:
- Updated `push-acuting.ps1` so the desktop/GitHub sync workflow runs validation before staging, committing, and pushing.
- Added Node.js discovery for the bundled Codex runtime Node first, then PATH `node`.
- The push workflow now runs `node --check app.js` and `scripts/validate-interactions.js`.
- Updated `README.md` to document the validation gate.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed with 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.
- `push-acuting.ps1` PowerShell parse check passed.

Commit:
- This entry is part of the commit that adds the push validation gate.

Next:
- Continue UI quality work by adding visible active-filter labels in the acupoint directory.

### 2026-07-01

Scope: Interaction contract validation script.

Changes:
- Added `scripts/validate-interactions.js` as a reusable local audit for fake buttons, broken hash links, invalid directory shortcuts, missing patient action-card handlers, removed duplicate section IDs, and acupoint detail-page hooks.
- Documented the validation command in `README.md`.
- Updated `DESIGN_OPTIMIZATION_PLAN.md` to reference the concrete validation script.

Validation:
- `app.js` syntax check passed with Node.
- `scripts/validate-interactions.js` passed.
- Interaction audit result: 35 internal hash links, 4 directory-topic shortcuts, 3 patient case actions, 12 clickable cards, 0 warnings, 0 failures.

Commit:
- This entry is part of the commit that adds the interaction validation script.

Next:
- Add the interaction audit to future update workflow before every UI/navigation commit.

### 2026-07-01

Scope: Product design critique and optimization plan.

Changes:
- Added `DESIGN_OPTIMIZATION_PLAN.md` as the long-term design and architecture direction for AcuTing OS.
- Defined current UX, information architecture, visual hierarchy, mobile, bilingual/public-mode, and content-status problems.
- Added Codex-specific optimization methods: product design audit loop, interaction contract audit, knowledge schema audit, content-mode separation, and mobile-first regression pass.

Validation:
- Product Design user-context preflight was run; no saved Product Design context exists yet.
- This was a planning/documentation update, not an implementation change.

Commit:
- This entry is part of the commit that adds the design optimization plan.

Next:
- Turn the interaction contract audit into a reusable local validation script so fake buttons and broken shortcuts are caught automatically.

### 2026-07-01

Scope: Patient action-card behavior cleanup.

Changes:
- Converted the Patient Record `Treatment Tracking` card from a plain `#caseWorkspace` jump into a handled action via `patientTrackLink`.
- The tracking card now clears case search, refreshes the case list, and scrolls to the clinical case workspace.
- Added a validation audit that flags patient action cards pointing to `#caseWorkspace` without a matching JS handler.

Validation:
- `app.js` syntax check passed with Node.
- Internal hash-link audit passed: 35 internal links resolve to existing IDs.
- Directory-topic shortcut audit passed for `auricular_index` and `tung_index`.
- Patient action-card audit passed: `patientNewCaseLink`, `patientSoapLink`, and `patientTrackLink` all have handlers.

Commit:
- This entry is part of the commit that removes the remaining fake patient tracking action.

Next:
- Audit remaining non-patient cards and decide whether each card is a true navigation action, a true filter action, or should be downgraded to a non-clickable information card.

### 2026-07-01

Scope: Duplicate architecture reduction.

Changes:
- Removed the top-level `Public Learn` navigation item so planning content no longer competes with daily working modules.
- Replaced the large `Public Architecture` and `Master Tung Zone` sections with one compact `systemRoadmap` planning section.
- Kept Roadmap links functional: Public Learn, Master Tung filter, Auricular filter, Formulas, Conditions, and Sources.
- Added `roadmap-card` styling and responsive behavior.

Validation:
- `app.js` syntax check passed with Node.
- Internal hash-link audit passed: 35 internal links resolve to existing IDs.
- Directory-topic shortcut audit passed: `auricular_index` and `tung_index` resolve to known JS topic IDs.
- Confirmed old `publicArchitecture` and `tungZoneSection` IDs are no longer present.

Commit:
- This entry is part of the commit that reduces duplicate homepage architecture.

Next:
- Audit visible text encoding and card hierarchy. Several strings still display as mojibake in PowerShell output; browser rendering should be checked directly before making broad text edits.

### 2026-07-01

Scope: Homepage and module-entry cleanup.

Changes:
- Replaced vague/fake module links with direct module targets for Formulas, Conditions, Billing, and Billing quick access.
- Added a real `billingSection` with documentation workflow cards instead of sending Billing links to a hidden/self-referential anchor.
- Converted Auricular and Master Tung entry cards into true directory-topic shortcuts using `data-directory-topic-link`.
- Removed the obsolete `data-library-search` shortcut handler after all related HTML shortcuts were removed.
- Kept acupoint detail-mode cleanup centralized through `clearPointDetailHash()`.

Validation:
- `app.js` syntax check passed with Node.
- Internal hash-link audit passed: 36 internal hash links resolve to existing IDs.
- Confirmed no remaining `data-library-search` shortcuts and no stale `#formulaLibrary` or `#pathologyLibrary` links.
- Confirmed `billingSection` exists and directory-topic shortcuts are registered for `auricular_index` and `tung_index`.

Commit:
- This entry is part of the commit that cleans homepage/module navigation.

Next:
- Continue by auditing the visible wording and card hierarchy: remove or merge modules that duplicate the same purpose, especially Content Library vs Public Architecture vs Tung Zone.

### 2026-07-01

Scope: Acupoint navigation and layout bug fix.

Changes:
- Split the acupoint area into two explicit states: directory/list mode and individual point article mode.
- Individual point pages now appear only when the URL uses `#point/{code}`.
- Added a back-to-directory control on individual acupoint pages.
- Fixed hash navigation so leaving a point page returns the UI to list mode.
- Updated top navigation targets so Auricular filters the acupoint directory, Pathology goes to the condition graph, Formulas goes to the formula section, and Billing goes to a real documentation anchor.
- Added missing `pathologyAnchor` and `billingAnchor` targets.
- Adjusted desktop and mobile CSS to reduce top navigation overflow and prevent point sidebars from overlapping article content.

Validation:
- `app.js` syntax check passed with Node.
- Internal hash-link audit passed: all non-point hash links resolve to existing page IDs.
- Playwright package was available, but browser executable was not installed, so screenshot automation could not run in this environment.

Commit:
- This entry is part of the commit that fixes acupoint navigation and layout reliability.

Next:
- Continue reducing duplicate content architecture: audit each homepage/library card and decide whether it should be a real module, a filter shortcut, or removed.

### 2026-07-01

Scope: GitHub Pages preparation.

Changes:
- Added `.nojekyll` so GitHub Pages serves AcuTing OS as a static app without Jekyll processing.
- Updated `DEPLOYMENT.md` with the expected Pages URL and exact GitHub Pages settings.

Validation:
- Confirmed the repo root contains `index.html`.
- Confirmed local repository is connected to `https://github.com/guot-beep/acuting-os.git`.
- GitHub CLI is not installed in this environment, so Pages must be enabled from GitHub Settings unless another authenticated tool is added later.

Commit:
- This entry is part of the commit that prepares GitHub Pages.

Next:
- Enable GitHub Pages in GitHub: Settings > Pages > Deploy from branch > main > root.

### 2026-07-01

Scope: Persistent project log workflow.

Changes:
- Added this `PROJECT_LOG.md` file as the first-read context for future AcuTing OS work sessions.
- Captured the fixed weekly optimization schedule so daily work can continue without re-discovering project direction.
- Summarized the current repository state and recent acupoint, auricular, Master Tung, source-link, UI, GitHub, and clinical-note work.
- Updated the daily automation instruction to read this log first and append a session entry after future optimization work.

Validation:
- Confirmed the log contains operating rules, weekly schedule, current state, and historical entries.

Commit:
- This entry is part of the commit that creates the persistent project log.

Next:
- Continue the weekly plan from the current day, then append a new entry with changes, validation, commit, and next task.

### 2026-07-01

Scope: Daily automation structure.

Changes:
- Updated the daily heartbeat automation to follow a fixed weekly optimization schedule.
- Established the rule that each session should be practical, source-aware, validated, and committed.

Validation:
- Automation updated in Codex app.

Commit:
- Not applicable; automation update is stored in the Codex app, not the repo.

Next:
- Add a persistent repo log so future sessions can read prior work before changing files.

### 2026-06-30

Scope: GB93 auricular indexing.

Changes:
- Verified acupun GB93 pages for `AT1`, `AT2`, and `AT3`.
- Promoted verified antitragus GB93 records into `data/auricular/gb93_index.json` and `.js`.
- GB93 coverage increased from `10/93` to `13/93`.
- Removed promoted candidates from `data/auricular/gb93_worklist.json` and `.js`.
- Updated app parsing so GB93 records can use `pinyin` and aliases.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_index.js` syntax check passed.
- `data/auricular/gb93_worklist.js` syntax check passed.
- JSON parse checks passed.
- HTML still has no embedded images or canvas.

Commit:
- `575c7cf Promote verified GB93 antitragus points`

Next:
- Continue GB93 verification. `SC1-SC5` returned incomplete source fields, so prioritize `CO1-CO3` or `HX1-HX7`.

### 2026-06-30

Scope: GB93 promotion workflow.

Changes:
- Added GB93 promotion checklist to the worklist files.
- Displayed promotion checklist in the Database Health GB93 panel.
- Checklist requires confirmed code, Chinese name, English name or translation, auricular zone, visual URL, and `index_only` status until clinical details are checked.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_worklist.js` syntax check passed.
- JSON parse checks passed.
- HTML still has no embedded images or canvas.

Commit:
- `3af16b5 Add GB93 promotion checklist`

Next:
- Use the checklist before promoting each GB93 candidate into `gb93_index`.

### 2026-06-29

Scope: GB93 verification links.

Changes:
- Added `GB93 Candidate Links / 耳穴候選查證` panel to Database Health.
- Rendered candidate codes as external acupun links.
- Kept candidates separate from formal point records.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_worklist.js` syntax check passed.
- HTML still has no embedded images or canvas.

Commit:
- `eda1e62 Add GB93 candidate verification links`

Next:
- Open candidate links and promote only source-verified records.

### 2026-06-27

Scope: GB93 worklist.

Changes:
- Added `data/auricular/gb93_worklist.json` and `.js`.
- Created 25 candidate codes for next GB93 verification batch.
- Added Database Health display for GB93 next batch.
- Added GB93 verification queue text.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_worklist.js` syntax check passed.
- JSON parse checks passed.

Commit:
- `61e5540 Add GB93 verification worklist`

Next:
- Promote verified candidates into `gb93_index`.

### 2026-06-26

Scope: GB93 coverage tracking.

Changes:
- Added `expected_total: 93` and `current_indexed` to GB93 index files.
- Added `GB93 coverage` card to Database Health.
- Added `GB93待校對 / GB93 Drafts` directory filter.

Validation:
- `app.js` syntax check passed.
- `data/auricular/gb93_index.js` syntax check passed.
- JSON parse checks passed.

Commit:
- `8286bbf Track auricular GB93 coverage`

Next:
- Increase coverage beyond `10/93` through source-verified promotion.

### 2026-07-02

Scope: Phase 1 rebuild - data liberation + workspace shell (Claude Cowork).

Changes:
- Froze pre-migration app into `legacy/`.
- Extracted all 15 embedded datasets from app.js into `data/acupoints/embedded/` and `data/auricular/embedded/` (256 standard + 29 auricular records + 4 i18n maps).
- New pipeline: `scripts/build-data.js` builds `data/generated/app_data.js`; app.js now reads `globalThis.ACUTING_APP_DATA` (8,785 -> 3,266 lines).
- New top navigation: 6 workspaces (Home/Lookup/Cases/Quality/Sources/Learn) with `js/router.js`; all legacy anchors and `#point/` deep links still work.
- New docs: REBUILD_PLAN, DATA_MIGRATION_MAP, REBUILD_HANDOFF, VALIDATION_LOG under `docs/`.

Validation:
- `validate-data.js`: defaultPoints 681, deep-equal legacy vs current PASS, no duplicate codes.
- jsdom smoke test 11/11 PASS.

Known issue:
- `.git/index` corrupted by sandbox git over OneDrive mount. Fix commands in docs/REBUILD_HANDOFF.md §15. Working tree and GitHub history intact.

Next:
- Codex: REBUILD_PLAN Phase 2 (361.json unification first, field map before merge).

### Earlier Project State Summary

Completed before this log file:
- Built AcuTing OS as a static HTML/CSS/JS app.
- Added private GitHub setup and desktop push/open shortcuts.
- Added individual point routing via `#point/CODE`.
- Added 361 standard-channel placeholder coverage so every standard point has a page.
- Added Master Tung public navigation index with 277 index-only records.
- Added initial auricular records and GB93 scaffold.
- Removed embedded image/canvas dependency and switched to external visual reference links.
- Added source registry, data quality dashboard, missing-content filters, visual coverage, and mobile-friendly layout improvements.
- Added clinical case/SOAP/billing/pathology/herbal data architecture seeds.

Current repo state as of this log:
- Local `main` is ahead of `origin/main` by multiple commits. Push with the desktop shortcut when ready.
- GB93 index is `13/93`.
- Master Tung index has 277 index-only records.
- Standard 361 point pages exist, but many are placeholders or need source review.
# 2026-07-26 Codex — Transform Phlegm five-card batch
- Completed formal cards for 天南星、白附子、白芥子、桔梗、旋覆花 from Chenoweth pp.31–32 with CloudTCM/American Dragon cross-checks.
- Added five rich colored herb-pair records with 七情 relation, bilingual rationale, 主治, 注意 and sources.
- Added the rule that every herb, formula or point named by the exam outline/course materials must have a record even when no template exists.
- Validation: build-data, herb-standard, content-junk, pair delta and diff checks PASS.
- Existing full-repo blockers remain: validate-data 751/681 count mismatch and legacy encoding findings outside this batch.
# 2026-08-02 Codex - Clear Heat Drain Fire remaining 4-card parity pass
- Reworked `herb.xia_ku_cao`, `herb.dan_zhu_ye`, `herb.he_ye`, and `herb.lian_zi_xin` to template-grade draft quality.
- Separated actions vs indications, added bilingual labels, board focus, Exam Pearl, clinical-use synthesis, dose/source notes, part used, contraindications/cautions, modern notes, and field-level sources.
- Added formal `herb_pairs.json` records for Xia Ku Cao eye/nodule pairs, Dan Zhu Ye Heart/Small Intestine Heat pairs, He Ye raw/charred preparation pairs, and Lian Zi Xin Heart-Fire/Heart-Kidney pairs.
- Fixed Xia Ku Cao legacy render fields so unsupported old boilerplate actions no longer appear in generated data.
- Validation: build-data, Clear Heat herb worklist, content-junk, interaction audit, JS syntax, focused mojibake scan, and diff-check PASS; known unrelated validate-data / validate-encoding failures remain.
# 2026-08-02 Codex — Extra Points EX-HN18–22 source and safety pass
- Refined EX-HN18 牽正, EX-HN19 夾承漿, EX-HN20 新設, EX-HN21 散笑, and EX-HN22 扁桃體 without deleting existing indications, combinations, or legacy technique text.
- Added paired bilingual search tags and field-level provenance; replaced generic CloudTCM attribution with exact eLotus/American Dragon pages where an exact page was verifiably available.
- Preserved and explicitly disclosed nomenclature conflicts: eLotus numbers 牽正 as EX-HN20 and 新設 as EX-HN23, while this database retains its immutable legacy display codes EX-HN18 and EX-HN20.
- EX-HN21/22 exact professional pages were not located; their technique/safety text remains draft and now carries an explicit source-gap warning. EX-HN22 tongue-root needling is flagged high-risk and unvalidated.
- Validation PASS: extra-point audit 50 → 45 issue records, build-data, validate-data (769 runtime), validate-interactions, JSON parse, and git diff check.
# 2026-08-02 Codex — Extra Points EX-CA3/4 and measurable-method validator pass
- Refined EX-CA3 三角灸 and EX-CA4 胃上 with paired bilingual tags, exact field sources, safety/source-conflict notes, and immutable-code disclosures.
- EX-CA3 is now explicitly moxibustion-only; no needle depth was invented. Its 5–7 cone legacy method and differing classical fourteen-cone record remain source-labelled.
- EX-CA4 retains the legacy location/technique while recording eLotus/AD conflicts in lateral distance, direction, depth, and numbering for licensed review.
- Updated the extra-point validator to accept measurable moxibustion and flag generic CloudTCM directory links; measurable-method gaps are now 0/72, while 20 generic-source records are honestly reported.
- Validation PASS: build-data, extra-point audit, validate-data (769 runtime), validate-interactions, validate-point-ids, content-junk, JSON parse, and diff check.
