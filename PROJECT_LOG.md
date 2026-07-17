# AcuTing OS Project Log

Use this file as the first-read context before each daily optimization session. After each session, add a new entry with date, scope, files changed, validation, commit hash, and next task.

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

### 2026-07-17 - Interactive formula and herb study cards (Codex)

Implemented the first working AcuTing OS formula and single-herb detail cards in
the Lookup workspace. After Ting's visual review, the detail experience was
revised to match the acupoint page rhythm: identity hero, four fast facts,
continuous long-form sections, and sticky quick navigation. Formula cards cover
exam core, composition, clinical context, and safety/sources. Herb cards cover
exam core, clinical context, pairing/differentiation, and safety/sources.

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
fact grid and sidebar.

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
