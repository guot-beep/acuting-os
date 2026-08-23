# CR-010 Condition Detail Batch 05 (SOL) — Ingestion Ledger (Detail Batch 7)

Branch: `codex/cond-detail-7-sol05` off `origin/codex/pattern-v2` @ `91909af`
("Rebuild bundle (stale vs b688fe5 sources; build verified deterministic —
two runs byte-identical)"). This is the first commit on top of the eyeson-3
fixes landing (`8dba01b`), so it already carries Batch 04 + Batch 6b + the
three eyeson findings-and-fix rounds.

Source pack: `docs/research_packs/CR010_CONDITION_DETAIL_BATCH05_SOL.md` +
`data/research_staging/cr010_condition_detail_batch05_SOL.json` (+ manifest +
live-order snapshot + `CONTENT_REQUEST_COND_BATCH05_NOTES.md`), 23 records
total (8 scope backfills, ranks 16–23; 15 new detail records, ranks 31–45).
Target file: `data/pathology/condition_canon_shortlist.json`.

**Note on environment**: this agent's isolated worktree initially sat on an
unrelated branch (no CR-010 scripts/data present at all — the shared-checkout
copy of these files at `C:\Projects\acuture-point-app\...` is a *different*
tree from the worktree at `.claude\worktrees\agent-...`). The branch was
created correctly per dispatch (`git checkout -b codex/cond-detail-7-sol05
origin/codex/pattern-v2`) before any data was touched; no writes happened
against the wrong tree.

## Exact-scan result (23 staged ids vs 505 canon records)

**23 of 23 resolved by exact id. 0 stopped.**

| Rank | Pack id | Resolves? |
|---:|---|---|
| 16 | `cond.pid_chronic` | yes |
| 17 | `cond.piriformis_syndrome` | yes |
| 18 | `cond.pmdd` | yes |
| 19 | `cond.postpartum_hypolactation` | yes |
| 20 | `cond.rotator_cuff` | yes |
| 21 | `cond.secondary_dysmenorrhea` | yes |
| 22 | `cond.vulvovaginal_candidiasis` | yes |
| 23 | `cond.whiplash` | yes |
| 31 | `cond.autism_spectrum_disorder` | yes (was SKELETON) |
| 32 | `cond.autoimmune_hepatitis` | yes (was SKELETON) |
| 33 | `cond.av_block` | yes (was SKELETON) |
| 34 | `cond.bacterial_vaginosis` | yes (was SKELETON) |
| 35 | `cond.barrett_esophagus` | yes (was SKELETON) |
| 36 | `cond.behcet_disease` | yes (was SKELETON) |
| 37 | `cond.bipolar_disorder` | yes (was SKELETON) |
| 38 | `cond.bladder_stones` | yes (was SKELETON) |
| 39 | `cond.blepharitis` | yes (was SKELETON) |
| 40 | `cond.body_dysmorphic_disorder` | yes (was SKELETON) |
| 41 | `cond.borderline_personality_disorder` | yes (was SKELETON) |
| 42 | `cond.cancer_related_fatigue` | yes (was SKELETON) |
| 43 | `cond.cardiomyopathy` | yes (was SKELETON) |
| 44 | `cond.cataract` | yes (was SKELETON) |
| 45 | `cond.cellulitis` | yes (was SKELETON) |

Merge script (used, not committed as canon logic — this is a one-shot
staging→canon merge, kept in scratchpad, not `scripts/`) verified every id
against `rec.review_status` before writing: Part A ids required
`acupuncture_scope_zh`/`_en` to be **absent** (refuse-to-overwrite guard);
Part B ids required `review_status === "skeleton"` (refuse-to-overwrite
guard). All 23 passed both guards; 0 skipped, 0 forced.

## PART A — acupuncture_scope backfill (8 records, ranks 16–23)

Fields added, per record: `acupuncture_scope_zh`, `acupuncture_scope_en`,
`field_sources.acupuncture_scope_zh`, `field_sources.acupuncture_scope_en`.
Nothing else touched — `summary`/`western_context`/`western_pathology`/
`etiology`/`risk_factors`/`red_flags`/`structured_relations`
(`related_patterns` etc.) were all `preserve_existing_fields` in the pack and
were verified byte-identical before/after (see diff discipline below).
`evidence: "unknown"` on all 8, exactly as the pack states — no upgrades
(constitution redline 9).

**`field_sources.acupuncture_scope_*` was written from `acupuncture_scope_*.source`
(the record's own in-card label), NOT from the pack's own
`field_sources.acupuncture_scope_*` value (a raw URL).** The pack's raw-URL
field_sources would have created exactly the F-10 defect class documented in
`COND_FULLDETAIL_EYESON_01.md` §F-10 — a `field_sources` entry that doesn't
match the record's own `acupuncture_scope_*.source` label. All 8 records now
have `field_sources.acupuncture_scope_zh === [acupuncture_scope_zh.source]`,
matching the `cond.addison_disease` precedent (an existing clean FULL_DETAIL
card) exactly.

| Record | `source` label | `evidence` |
|---|---|---|
| `cond.pid_chronic` | CDC — PID STI Treatment Guidelines | unknown |
| `cond.piriformis_syndrome` | PubMed systematic review — Four symptoms define piriformis syndrome | unknown |
| `cond.pmdd` | ACOG — Management of Premenstrual Disorders | unknown |
| `cond.postpartum_hypolactation` | ACOG — Breastfeeding Challenges | unknown |
| `cond.rotator_cuff` | AAOS — Shoulder Impingement/Rotator Cuff Tendinitis | unknown |
| `cond.secondary_dysmenorrhea` | ACOG — Dysmenorrhea | unknown |
| `cond.vulvovaginal_candidiasis` | CDC — Vulvovaginal Candidiasis STI Treatment Guidelines | unknown |
| `cond.whiplash` | AAPM&R — Cervical Whiplash | unknown |

`sources` array was **not** appended to — each of the 8 records' pre-existing
`sources` array already contained the exact same authority + URL the pack's
`acupuncture_scope` cites (verified by direct string comparison before
writing), so appending would have duplicated, not added information.

### SAFETY AWARENESS check — boilerplate treatment block coexistence (all 8 records)

**All 8 of the Part A records carry the known F-07/F-25/F-41 boilerplate
treatment block** documented across the three eyeson findings ledgers:

```
"tcm_patterns": [
  {"pattern_zh": "氣血不和證", "formula_zh": "八珍湯", "acupoints_zh": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)"]},
  {"pattern_zh": "臟腑虛弱證", "formula_zh": "補中益氣湯", "acupoints_zh": ["中脘 (CV12)", "氣海 (CV6)", "脾俞 (BL20)"]}
],
"acupoint_protocols": ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)", "中脘 (CV12)"],
"herb_formulas": ["八珍湯", "補中益氣湯", "柴胡疏肝散"]
```

Verified byte-identical (`JSON.stringify` equality) on `acupoint_protocols`
and `herb_formulas` for all 8: `cond.pid_chronic`, `cond.piriformis_syndrome`,
`cond.pmdd`, `cond.postpartum_hypolactation`, `cond.rotator_cuff`,
`cond.secondary_dysmenorrhea`, `cond.vulvovaginal_candidiasis`,
`cond.whiplash`.

Per the mission's safety instruction, this batch **did not touch**
`tcm_patterns`/`acupoint_protocols`/`herb_formulas` on any of the 8 —
`acupuncture_scope` was applied as a clean, separate field addition, with no
mixing. The coexistence is noted here, not fixed here (fixing it is the
F-07/F-25/F-41 full-corpus cleanup, explicitly `OPEN, needs Ting` across all
three eyeson ledgers, out of scope for a scope-backfill batch).

**Flagged for priority attention**: `cond.pmdd`, `cond.postpartum_hypolactation`,
`cond.secondary_dysmenorrhea`, and `cond.vulvovaginal_candidiasis` are
gynecologic/fertility/postpartum-adjacent cards carrying 合谷 (LI4) + 三陰交
(SP6) — the same caution-point pair the eyeson sweeps flagged as unsafe when
presented as a structured `acupoint_protocols` recommendation on
pregnancy/fertility cards (`COND_FULLDETAIL_EYESON_01.md` F-01,
`COND_FULLDETAIL_EYESON_02.md` F-19/F-21). This batch's own new
`acupuncture_scope_zh.precautions` text for these 4 records does **not**
reference this specific coexistence (the pack did not author it that way,
and inventing acupoint-safety language beyond what the pack sourced would
violate the mission's own pregnancy/fertility-card constraint). No acupoint
protocol content was introduced or altered by this batch on any of the 8 —
compliant with "never introduce acupoint protocol content beyond what the
pack explicitly sources" — but the pre-existing block remains live and
un-flagged to the practitioner beyond the eyeson ledgers. Recommend this
4-record subset be prioritized whenever the F-07/F-25/F-41 corpus cleanup is
scheduled.

## PART B — 15 new detail records (ranks 31–45)

All 15 were true `review_status: "skeleton"` records carrying only
`id`/`entity_type`/`name_zh`/`name_en`/`category`/`icd_hint`/`aliases_zh`/
`aliases_en` (empty)/`review_status`/`authored_by` before this batch — no
content field existed to preserve, confirmed by direct inspection before
writing. `category`/`icd_hint`/`name_zh`/`name_en` were **not** touched (the
pack's own `category` value matched the live skeleton's `category` on all 15,
checked directly — no drift to reconcile).

Fields added, per record: `summary_zh/en`, `western_context_zh/en`,
`western_pathology_zh/en`, `etiology_zh/en`, `risk_factors_zh/en`,
`red_flags_zh/en`, `acupuncture_scope_zh/en`, `sources`, `field_sources`.
`review_status` changed `"skeleton"` → `"draft"` on all 15 (constitution
§3: "新內容：填好、逐欄標來源、`review_status:"draft"`、直接上"). `evidence:
"unknown"` on all 15 acupuncture_scope entries, exactly as the pack states.

### `summary`/`western_context` and `western_pathology`/`etiology` are pairwise identical per record (pack design, not this batch's error)

Every one of the 15 pack records ships `summary_zh === western_context_zh`
and `western_pathology_zh === etiology_zh` verbatim (and same on the `_en`
side). This is **not** a cross-record C10 boilerplate violation — each
record's text is unique to that condition, verified by direct read of all 15
before writing, and `validate-condition-standard.js`'s C10 check (which
scans `etiology_zh`/`western_pathology_zh`/`summary_zh` for values shared
**across records**, not within one) confirms 0 new C10 defects. It is a
same-record field-pair duplication, not a shared-boilerplate-across-cards
duplication. Written verbatim from the pack, unmodified — flagged here per
CLAUDE.md discipline, not silently passed through.

### JUDGMENT CALL — `risk_factors_en` and `red_flags_en[].finding` were pack placeholders, not real content; authored as faithful translations this session

**This is the single most significant finding of this batch.** Grepped
directly against the raw pack JSON before writing anything:

```
grep -c "Clinical warning"        cr010_condition_detail_batch05_SOL.json  → 45
grep -c "Associated risk factor"  cr010_condition_detail_batch05_SOL.json  → 45
```

45 = 15 records × 3 items each, for **both** fields. Every single
`risk_factors_en[i]` across all 15 new records was the literal string
`"Associated risk factor {i}; see cited source."` — not a translation of the
paired `risk_factors_zh[i]`, a template stub. Every single
`red_flags_en[i].finding` was the literal string `"Clinical warning {i}; see
paired Chinese finding and cited source."` — same pattern. (`red_flags_en[i]`'s
`recommended_action`/`rationale`/`urgency_level`/`source` were genuine,
reasonable, sourced content, not placeholders — only `.finding` was broken.)

Had this been written to canon verbatim, it would have created **90 new
shared-boilerplate strings** across 15 records — precisely the constitution
redline 6 pattern ("多筆記錄共用同一句話比留空更糟，因為留空至少誠實"),
and it would have been *invisible English* in the sense CLAUDE.md warns
about (`_en` fields that read as real content on a schema/validator check but
are empty of actual meaning).

**Disposition**: `risk_factors_zh` (real, pack-authored, per-condition
content) was kept verbatim. `risk_factors_en` was **authored this session as
a faithful direct translation of `risk_factors_zh`** — same underlying
NIH/CDC/NIAMS/NIMH/NCI source per record (the pack's own cited authority),
not new research, not independent claims. Same treatment for
`red_flags_en[].finding`: kept the pack's own `recommended_action`/
`rationale`/`urgency_level`/`source`, replaced only `.finding` with a
faithful translation of the paired `red_flags_zh[].finding`. This mirrors
Batch 04's own precedent in reverse (`COND_DETAIL_6_LEDGER.md`:
"`risk_factors_zh` authored as translation, not sourced independently" — that
batch had real `_en` and placeholder-absent `_zh`; this batch has real `_zh`
and placeholder `_en`).

All 90 translated lines (45 risk factors + 45 red-flag findings) are listed
in the merge script kept at
`C:\Users\guoti\AppData\Local\Temp\claude\...\scratchpad\merge_batch05.js`
(not part of canon, not committed) for anyone who wants to audit the
translation against the source `_zh` line by line.

### JUDGMENT CALL — `risk_factors` and `red_flags` restructured from the pack's plain-string/URL shapes into template §5 / §5.5 structured shapes

The pack's `risk_factors_zh` ships as a **plain string array**
(`["家族中有自閉症", ...]`), not the template §5.5 structured shape
(`{factor, direction, modifiable, source}`) already used on every other
`risk_factors_zh` record in canon (verified against `cond.pid_chronic`,
already-live, before writing). Rebuilt into the structured shape for all 15
new records: `factor` = pack's zh string (or authored en translation),
`direction: "increases"` throughout (no protective factors identified in
this batch's material, matching Batch 04's own finding), `modifiable`
assigned per the same convention as Batch 04
("behavioral/exposure/occupational factors → `true`; age, prior
injury/trauma, anatomic structure, comorbid diagnosis, demographic/
physiologic state → `false`"), `source` = the record's own
`"Authority — Title"` label.

`modifiable` judgment calls, listed for review (3 items per record, in pack
order):

| Record | modifiable[1,2,3] |
|---|---|
| `cond.autism_spectrum_disorder` | false, false, false |
| `cond.autoimmune_hepatitis` | false, false, false |
| `cond.av_block` | false, false, true (medication choice is adjustable) |
| `cond.bacterial_vaginosis` | true, true, true (behavioral) |
| `cond.barrett_esophagus` | false, false, true (obesity/smoking) |
| `cond.behcet_disease` | false, false, false |
| `cond.bipolar_disorder` | false, true, true |
| `cond.bladder_stones` | false, false, true (catheter/foreign body removable) |
| `cond.blepharitis` | false, false, true (contact-lens hygiene) |
| `cond.body_dysmorphic_disorder` | false, false, false |
| `cond.borderline_personality_disorder` | false, false, false |
| `cond.cancer_related_fatigue` | false, false, false |
| `cond.cardiomyopathy` | false, false, true (alcohol/toxin exposure dominant) |
| `cond.cataract` | false, true, true |
| `cond.cellulitis` | true, false, false |

The pack's `red_flags_zh` ships as the newer 5-field structured shape
already (`{finding, urgency_level, recommended_action, rationale, source}`)
— kept as-is, only the `source` field was normalized from a raw URL to the
`"Authority — Title"` label convention (matching the `cond.gout` precedent —
an existing structured-red-flags record whose `source` reads `"NIAMS Gout"`,
a label, not a URL) on both `_zh` and `_en` sides.

### SELF-FLAGGED — `red_flags[].recommended_action` / `.rationale` are shared verbatim across all 45 flags (15 records × 3 each), same as the pack's own zh design

The pack's own `red_flags_zh[].recommended_action` is the identical string
`"先接受醫療評估，再決定是否進行針灸。"` on all 45 flags across all 15
records, and `.rationale` is the identical string
`"可能代表病情惡化、急症或需要標準醫療處置。"` on all 45. This was **kept
verbatim** (not authored by this session — it is the pack's own zh text,
faithfully carried through with only `.finding` translated). The distinguishing,
condition-specific content of each red flag is the `.finding` field, which is
unique per line; `recommended_action`/`.rationale` function as a generic
"this is an urgent-tier safety gate, get it checked before treating"
instruction, not a clinical claim.

This is flagged, not silently passed, because it technically matches the
letter of constitution redline 6 ("多筆記錄共用同一句話"). `validate-condition-standard.js`'s
C10 check does not scan `red_flags` fields (only `etiology_zh`/
`western_pathology_zh`/`summary_zh`), so this will not show up as a defect
count. Judgment: kept as-is because (a) it originates from the pack, not
invented by this session, (b) it is sourced per-record to the same NIH/CDC
page as the record's `finding`, (c) it is a generic triage instruction, not
a diagnostic or treatment claim, and (d) the substantive content
(`finding`) is unique per line — this differs materially from the F-07/F-25
pattern (identical *treatment prescriptions* regardless of diagnosis, which
is clinically wrong, not merely repetitive). **Recommend Ting confirm this
reading is acceptable**; if not, the fix is mechanical (author 45 distinct
`recommended_action`/`rationale` pairs) and can be scoped as a follow-up.

### `sources` / `field_sources`

`sources` was **newly created** on all 15 (none existed pre-batch) as a
single-item array: `"Authority — Title: URL"` (e.g. `"NHLBI — Cardiomyopathy:
https://www.nhlbi.nih.gov/health/cardiomyopathy"`), folding the pack's
structured `{authority, title, url}` into the dataset's established string
convention (Batch 04 precedent). `field_sources` was **newly created** on all
15, one key per filled field (`summary_zh`, `summary_en`, ...,
`acupuncture_scope_en` — 14 keys), each valued `["Authority — Title"]` (the
label, not the pack's raw-URL `field_sources` values — same F-10-avoidance
reasoning as Part A).

### `sign_symptom_ids` — genuine-match discipline (1 of 15 records)

Checked all 15 against the 102-symptom registry (`data/symptoms/symptoms.json`).
Applied a **stricter** bar than Batch 04's precedent because this pack's
`summary_zh`/`western_context_zh` text is definitional/pathophysiological
prose, not a symptom list (unlike earlier batches' summaries, which more
often named the presenting complaint directly) — several plausible matches
exist only inside `red_flags_zh` (an urgent-tier warning sign, not the
condition's defining presentation) and were deliberately **not** added to
avoid force-fitting a red-flag-only symptom as if it were the condition's
core presentation:

| Condition | Considered | Added? | Reasoning |
|---|---|---|---|
| `cond.cancer_related_fatigue` | `sym.fatigue` | **yes** | Fatigue is the condition itself, not an incidental finding — name_en, summary_zh, and western_pathology_zh are all centrally about fatigue |
| `cond.av_block` | `sym.syncope` | no | Syncope appears only in `red_flags_zh` ("暈厥或近暈厥"), not in `summary_zh`/`western_context_zh`, which describe the conduction delay mechanism, not a presenting symptom |
| `cond.autoimmune_hepatitis` | `sym.jaundice` | no | Jaundice appears only in `red_flags_zh` ("黃疸快速加重"), not in `summary_zh` |
| `cond.bacterial_vaginosis` | `sym.vaginal_discharge` | no | `summary_zh` says "異味與分泌物" (odor and discharge) generically, not a specific/exact match to the registry's phrasing; kept conservative |

**14 of 15 left honestly empty** (no key written) — matches Batch 04's
documented registry-gap pattern, applied more conservatively here given the
pack's definitional summary style.

### `structured_relation_seeds` — NOT written to canon (C8 precedent, unchanged)

All 15 records carry `"structured_relation_seeds": []` in the pack (empty —
this pack did not supply any candidate cond-to-cond seeds, unlike Batch 04).
Nothing to withhold; noted for completeness. `crossrefs_auto_resolved: false`
on all 15 — no crossref field exists on any of these 15 records regardless
(`related_patterns`/`related_eastern_diseases` were never populated by this
batch; the pack supplied none).

## Validation trail

```
node scripts/build-data.js
  Built app_data.js / knowledge_data.js / cloudtcm_map.js / points_361.js — no errors

node scripts/validate-condition-standard.js   (before batch, verified via git stash)
  505 records · 451 clean
  C4  42 defects / 42 records
  C5  72 defects / 38 records
  C10 70 defects / 36 records
  FAIL — 184 blocking defect(s)

node scripts/validate-condition-standard.js   (after batch)
  505 records · 451 clean
  C4  42 defects / 42 records   (flat)
  C5  72 defects / 38 records   (flat)
  C10 70 defects / 36 records   (flat)
  FAIL — 184 blocking defect(s)   (flat, NOT the "drop from 184" the dispatch
  anticipated — see explanation below)
  N4 skeleton index slots: 287 -> 272 (-15, matches the 15 skeleton->draft promotions)

node scripts/check-validation-ratchet.js
  conditions 184 -> 184  flat  PASS — no regressions
  (flat, not better — baseline NOT updated, per instruction to only --update on BETTER)

node scripts/validate-content-junk.js
  PASS — no scraped header tokens, no encoding anomalies in _zh fields
  (1 pre-existing formula-layer WARN, 32-record shared dosage clause,
  unrelated to this batch — same WARN documented in Batches 04/6b's own trails)

node scripts/validate-relations.js
  Relation validation passed (sign_symptom_ids / sources / related_patterns
  all resolve; 1 pre-existing unrelated comparisons.json SKELETON note)

git diff --check data/pathology/condition_canon_shortlist.json
  clean (no whitespace errors)
```

### Why blocking defects did NOT drop from 184 (dispatch anticipated a drop; report the actual number, not the anticipated one)

None of this batch's 23 target ids carried a C4, C5, or C10 defect **before**
this batch: the 8 Part A records were already `DETAIL_PARTIAL` with full
bilingual content and existing `red_flags` (score 10/12, missing only
`acupuncture_scope`) — they were never in the 184-defect pool. The 15 Part B
records were `review_status: "skeleton"` with **zero** content fields, which
means C4 (`NO RED FLAGS`) is explicitly exempted for them per template §5's
skeleton carve-out ("`review_status: "skeleton"` 且無任何內容欄位 → C4 跳過，
改計入 N4 skeleton-count") — they were counted under N4 (note-only), not C4,
before this batch. Adding full bilingual content including `red_flags` to
all 15 moves them out of N4 and into "has content, has red_flags" — they
still do not trigger C4 (they have red flags now), so C4 stays flat rather
than rising. C5/C10 stay flat because every field this batch wrote is fully
bilingual and record-specific (no shared boilerplate on the two C10-scanned
fields, verified above). **The 184 blocking defects belong entirely to the
92 other pre-existing records this batch did not touch** — dropping that
number requires a defect-remediation batch (C4/C5/C10-targeted), not a
scope-backfill-and-skeleton-fill batch. This matches the ratchet result
exactly (flat, not regressed).

## Maturity audit — before → after (report exact, not the dispatch's "expect 100/x/343")

```
node scripts/audit-cr010-condition-detail-maturity.js   (before batch)
  full_detail_count: 92, partial_count: 70, skeleton_count: 343

node scripts/audit-cr010-condition-detail-maturity.js   (after batch)
  full_detail_count: 115, partial_count: 62, skeleton_count: 328
```

**full_detail: 92 → 115 (+23), partial: 70 → 62 (−8), skeleton: 343 → 328
(−15).** The dispatch's "expect 100/x/343" anticipated only Part A's +8 (92
→ 100) and assumed Part B's 15 new records would land as `DETAIL_PARTIAL`,
leaving skeleton flat. That assumption did not hold: this pack's own content
request (`CONTENT_REQUEST_COND_BATCH05_NOTES.md`) explicitly told the SOL
author to include `acupuncture_scope` on rank-31+ records too ("新批次(rank
31+)也請直接含此欄"), and the audit's `FULL_DETAIL_CANDIDATE` threshold is
`score >= 10 AND all 4 hard gates present` (`red_flags`, `acupuncture_scope`,
`sources`, `field_sources`) — with `acupuncture_scope` present on all 15 new
records, each scores 11/12 (missing only the 1-point `structured_relations`
criterion, since 14 of 15 have no genuine `sign_symptom_ids` match and no
`related_patterns`/other relation field), which clears the threshold. All 23
of this batch's records are now `FULL_DETAIL_CANDIDATE`; 0 landed as
`DETAIL_PARTIAL`. Per-record score detail (spot-checked 4 of 23):
`cond.pid_chronic` 12/12, `cond.cancer_related_fatigue` 12/12 (has the
`sign_symptom_ids` relation point), `cond.autism_spectrum_disorder` 11/12,
`cond.cellulitis` 11/12 (both missing only `structured_relations`).

`remaining_detail_slots_to_300`: 208 → 185.

## Eyes-on read — 2 finished records, end to end

**Part A — `cond.rotator_cuff`**: read the full canon record top to bottom.
`summary`/`western_context`/`etiology`/`western_pathology`/`red_flags`
(pre-existing, untouched) read cleanly and specifically (lateral shoulder
pain, Jobe/Hawkins-Kennedy tests, full-thickness-tear red flag). The new
`acupuncture_scope_zh/en` reads cleanly, bilingual, matches in strength on
both sides, `evidence: unknown` honestly reflects "no condition-specific
acupuncture guideline was verified." The known boilerplate `tcm_patterns`/
`acupoint_protocols`/`herb_formulas` block is present and untouched (see
SAFETY AWARENESS section above) — confirmed it does not visually blend with
the new `acupuncture_scope` text (they render as separate sections per
template §8.2).

**Part B — `cond.cardiomyopathy`**: read the full canon record top to
bottom. All 9 new field pairs present, bilingual, sourced to NHLBI
throughout, no fake-Chinese/invisible-English/mojibake found on direct read.
Confirmed `red_flags_zh[].recommended_action`/`.rationale` are the shared
strings described above (visible on this direct read, not just from the grep
count) — flagged per the SELF-FLAGGED section, not hidden. `risk_factors`
structured shape reads correctly on both languages.

## Judgment calls (summary)

1. **`risk_factors_en` and `red_flags_en[].finding` were pack placeholder
   stubs on all 15 Part B records (90 lines total) — authored as faithful
   direct translations of the pack's own `_zh` content this session**, not
   independent research. Full translation list in the merge script (not
   committed). This is the single largest content-quality intervention in
   this batch — see the dedicated section above.
2. **`risk_factors_zh/en` restructured from the pack's plain-string array
   into the template §5.5 structured shape** (`factor`/`direction`/
   `modifiable`/`source`) to match the existing dataset convention; 45
   `modifiable` values assigned per the Batch 04 convention, listed above
   for review.
3. **`red_flags[].source` and `field_sources.*` normalized from the pack's
   raw URLs to the dataset's `"Authority — Title"` label convention** on both
   Part A and Part B, to avoid the F-10 defect class (label/field_sources
   mismatch) documented in the eyeson sweeps.
4. **`red_flags[].recommended_action`/`.rationale` shared verbatim across
   all 45 flags** — kept as pack-authored, flagged as a possible redline-6
   borderline case, not silently accepted. Recommend Ting confirm.
5. **`sign_symptom_ids` added to only 1 of 15 Part B records**
   (`cond.cancer_related_fatigue` → `sym.fatigue`), applying a stricter bar
   than Batch 04 because this pack's summary text does not list presenting
   symptoms the way earlier batches' summaries did.
6. **8 Part A records all coexist with the known F-07/F-25/F-41 boilerplate
   treatment block** — not touched (out of scope), explicitly flagged, 4 of
   the 8 are gynecologic/fertility/postpartum cards recommended for priority
   cleanup.

## Next batch

`remaining_detail_slots_to_300`: 185. The dispatch's next-batch note in
Batch 05's own content request already flagged the F-07/F-25/F-41
boilerplate-treatment-block corpus cleanup (74/71/73-record scale) and the
4 pregnancy/fertility-adjacent cards newly reconfirmed in this batch's Part A
as the highest-value next safety pass — both still `OPEN, needs Ting` per
all three eyeson ledgers plus this one.
