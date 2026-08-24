# CR-010 Condition Detail Batch 06 (SOL) — Ingestion Ledger (Detail Batch 8)

Branch: `codex/cond-detail-8-sol06` off `origin/codex/pattern-v2` @ `513971b`
("Stage SOL CR-010 Batch 06 (live ranks 46-60, 15 records, full bilingual
detail + acupuncture_scope, evidence honestly unknown)"). At branch-cut time
`origin/codex/pattern-v2` had advanced 2 further commits (other sessions
concurrently editing `formulas.json`); per dispatch this session does not
touch `data/herbs/**` and does not push, so the branch point is left as-is.

Source pack: `docs/research_packs/CR010_CONDITION_DETAIL_BATCH06_SOL.md` +
`data/research_staging/cr010_condition_detail_batch06_SOL.json` (+ manifest +
live-order snapshot), 15 records total, all `EXISTING_ENRICH` /
`live_maturity: SKELETON`, ranks 46–60.

Target file: `data/pathology/condition_canon_shortlist.json`.

## Exact-scan result (15 staged ids vs 505 canon records)

**15 of 15 resolved by exact id. 0 stopped.**

| Rank | Pack id | Resolves? | Pre-batch review_status |
|---:|---|---|---|
| 46 | `cond.central_sleep_apnea` | yes | skeleton |
| 47 | `cond.cerebral_palsy` | yes | skeleton |
| 48 | `cond.cerumen_impaction` | yes | skeleton |
| 49 | `cond.cervical_dysplasia` | yes | skeleton |
| 50 | `cond.cervical_insufficiency` | yes | skeleton |
| 51 | `cond.cervicitis` | yes | skeleton |
| 52 | `cond.cervicogenic_headache` | yes | skeleton |
| 53 | `cond.chronic_bronchitis` | yes | skeleton |
| 54 | `cond.chronic_hepatitis_c` | yes | skeleton |
| 55 | `cond.chronic_open_angle_glaucoma` | yes | skeleton |
| 56 | `cond.chronic_pancreatitis` | yes | skeleton |
| 57 | `cond.chronic_scrotal_pain_syndrome` | yes | skeleton |
| 58 | `cond.chronic_venous_insufficiency` | yes | skeleton |
| 59 | `cond.cidp` | yes | skeleton |
| 60 | `cond.cipn` | yes | skeleton |

All 15 verified as true skeletons before writing: `Object.keys(rec)` was
exactly `id, entity_type, name_zh, name_en, category, icd_hint, aliases_zh,
aliases_en, review_status, authored_by` — no content field existed to
preserve. Merge script (kept in scratchpad, not `scripts/`, one-shot
staging→canon merge like Batch 05's) enforced a refuse-to-overwrite guard:
any non-identity key present, or `review_status !== "skeleton"`, throws and
halts before any write. All 15 passed; 0 skipped, 0 forced.

Fields added, per record: `summary_zh/en`, `western_context_zh/en`,
`western_pathology_zh/en`, `etiology_zh/en`, `risk_factors_zh/en`,
`red_flags_zh/en`, `acupuncture_scope_zh/en`, `sources`, `field_sources`,
`sign_symptom_ids` (6 of 15 only, see below). `review_status` changed
`"skeleton"` → `"draft"` on all 15. `evidence: "unknown"` on all 15
`acupuncture_scope` entries, exactly as the pack states — no upgrades
(constitution redline 9). `name_zh`/`name_en`/`category`/`icd_hint`/
`aliases_zh`/`aliases_en` were **not** touched.

## PLACEHOLDER-STUB CHECK — pack's "no Batch 05 placeholder sentences" claim verified true

Grepped the raw pack JSON before writing anything:

```
grep -c "Associated risk factor"       -> 0
grep -c "Clinical warning"             -> 0
grep -c "see cited source"             -> 0
grep -c "see paired Chinese finding"   -> 0
grep -n "TBD|placeholder|TODO|XXX|Lorem" -> 0
```

Then read all 15 `risk_factors_zh`/`risk_factors_en` pairs directly (not
just grepped) — every `_en` entry is a genuine, per-condition, per-factor
direct translation of its paired `_zh` entry (e.g. `高齡` → `Older age`,
`共用注射器具` → `Sharing injection equipment`), not a templated stub. Same
direct read on all `red_flags_en[].finding` — genuine translations, not
`"Clinical warning {i}"` boilerplate. **The pack's claim is correct for this
batch**, unlike Batch 05 where the same claim would have been false. No
translation-authoring intervention was needed this batch (contrast with
Batch 05's 90-line judgment call).

## `risk_factors` shape — already structured, no restructuring needed this batch

Unlike Batch 05 (whose pack shipped `risk_factors_zh` as a bare string
array), this pack already ships the template §5.5 structured shape
(`{factor, direction, modifiable, source}`) on both `_zh` and `_en`, with
`source` already in the `"Authority — Title"` label convention (not a raw
URL). Kept verbatim, no restructuring. `direction: "increases"` on all 45
factors (15 records × 3) — no protective factors in this batch's material,
consistent with Batch 04/05's own finding.

`red_flags_zh/en` also ship the current 5-field structured shape
(`{finding, urgency_level, recommended_action, rationale, source}`) with
`urgency_level` values used: `emergency`, `same_day`, `urgent` — all inside
the fixed 5-value set (§5). `source` was already the label convention, not a
raw URL — no normalization needed on this field either (contrast with
Batch 05, whose pack's `red_flags[].source` needed URL→label normalization).
Unlike Batch 05, `recommended_action`/`rationale` are **not** identical
verbatim strings shared across all records — each record's red flags have
their own recommended action and rationale text, so the Batch 05
SELF-FLAGGED borderline-redline-6 concern does not recur here.

## `sources` / `field_sources` — normalized to label convention (F-10 avoidance)

Pack's `sources` ships as an array of `{authority, title, url,
supports_fields}` objects (1 item per record, single-source pack). Folded
into the dataset's string convention: `"Authority — Title: URL"` (e.g.
`"NHLBI — Sleep Apnea — Causes and Risk Factors:
https://www.nhlbi.nih.gov/health/sleep-apnea/causes-and-risk-factors"`).

Pack's `field_sources.*` ships as raw URLs (e.g.
`["https://www.nhlbi.nih.gov/health/sleep-apnea/causes-and-risk-factors"]`)
for all 14 filled-field keys per record. Normalized to the `"Authority —
Title"` label (matching `sources[0]`'s label half, no URL) — same F-10
defect-class avoidance as Batch 05 (`COND_FULLDETAIL_EYESON_01.md` §F-10: a
`field_sources` entry that doesn't match the record's own source label).

## JUDGMENT CALL — `acupuncture_scope.cannot_treat` (pack-only key, not in template §5.6) folded into `can_treat`

The pack's `acupuncture_scope_zh/en` carries a `cannot_treat` key on all 15
records, in addition to the template's approved `can_treat` /
`precautions` / `co_management` / `evidence` / `source` / `note`. Checked
`scripts/validate-condition-standard.js`'s C12 rule directly: `SCOPE_KEYS =
{can_treat, precautions, co_management}` plus `evidence`/`source`/`note` are
the only accepted keys — `cannot_treat` would trigger `C12 ... has unknown
keys cannot_treat`. Written verbatim it would have both failed C12 and
invented a field outside §5.6 without going through the "change the
template first" order in AI_CONSTITUTION §5 DON'T.

**Disposition**: `cannot_treat` content was **folded into `can_treat`**
(same field, appended as a second sentence) rather than dropped — no content
lost, no new field invented, no C12 defect. `can_treat` is the field the
template defines as answering "適應範圍是什麼 (症狀緩解 / 輔助 /
不適用)" — the boundary statement `cannot_treat` supplies is exactly the
"不適用" half of that same question, so folding is a content-preserving fit,
not a stretch. Read across all 15 records before writing: `can_treat` and
`cannot_treat` overlap substantially in meaning (both restate the boundary)
but `cannot_treat` frequently adds a more specific mechanism-level detail
(e.g. `cond.cerumen_impaction`: `can_treat` says "不得延誤耳鏡檢查與安全清除",
`cannot_treat` adds "不能軟化、沖出或器械移除阻塞耳垢" — a more specific
statement of what mechanical actions acupuncture cannot perform). Kept as an
appended sentence rather than silently dropped.

**Self-caught bug, fixed before finalizing**: the first draft of the fold
used a fixed `。` (full-width Chinese period) separator, which is correct
for `_zh` but wrong for `_en` — it produced `"...ventilatory support.。Cannot
correct..."`, mixing a CJK punctuation character into English prose (exactly
the "invisible garbage" class CLAUDE.md's eyes-on-the-card rule exists to
catch). Caught by reading the merged `cond.cervicogenic_headache` record
directly after the first merge run, not by a validator (none of the
validators check for CJK characters inside `_en` acupuncture_scope prose).
Fixed the merge script to detect script (CJK vs Latin) per side and use `.`
+ space for English, `。` with no space for Chinese; reverted the canon file
to the pre-batch commit and re-ran the corrected merge from scratch. Spot
grepped all 15 post-fix `acupuncture_scope_en.can_treat` values for
`/[一-鿿]/` — 0 matches. All 15 `_zh` sides read as a single
continuous Chinese sentence pair with no double-punctuation artifact
(verified `can_treat` already ended in `。` in every record, so no
punctuation was inserted on the `_zh` side either run).

## `sign_symptom_ids` — genuine-match discipline (6 of 15 records)

Checked all 15 against the 102-symptom registry
(`data/symptoms/symptoms.json`). Applied the same bar as Batch 05: only a
verbatim (or near-verbatim, single-character-variant) occurrence of the
registry's exact zh symptom string **inside `summary_zh`/`western_pathology_zh`**
counts — not a plausible-but-differently-worded paraphrase, and not a match
that appears only inside `red_flags_zh` (an urgent-tier warning, not the
condition's defining presentation).

| Condition | Registry term found verbatim in summary/pathology | Added | Rejected candidates (wording differs / red-flag-only) |
|---|---|---|---|
| `cond.cerumen_impaction` | 耳鳴 (`sym.tinnitus`) | **yes** | 聽力下降 vs registry's 聽力減退 (`sym.hearing_loss`) — different characters, not verbatim, kept conservative |
| `cond.cervicogenic_headache` | 頭痛 (`sym.headache`, condition is itself defined as a headache) | **yes** | — |
| `cond.chronic_bronchitis` | 咳嗽 (`sym.cough`) | **yes** | 呼吸困難 vs registry's 呼吸急促 (`sym.shortness_of_breath`) — different phrase, not added |
| `cond.chronic_pancreatitis` | 腹痛 (`sym.abdominal_pain`, inside "慢性腹痛") | **yes** | — |
| `cond.cidp` | 無力 (`sym.weakness`) | **yes** | 感覺異常 is paresthesia, not verbatim 麻木 (`sym.numbness`) — not added |
| `cond.cipn` | 手足麻木 (`sym.numbness`), 無力 (`sym.weakness`) | **yes, 2 ids** | 刺痛/疼痛 have no exact single-symptom registry match |
| `cond.central_sleep_apnea` | none in summary (呼吸困難 only in `red_flags_zh`) | no | red-flag-only, excluded |
| `cond.cerebral_palsy` | none (movement/balance/posture disorder, no single registry term) | no | — |
| `cond.cervical_dysplasia` | none (asymptomatic pre-cancerous pathology) | no | — |
| `cond.cervical_insufficiency` | none (structural/functional description, no presenting symptom) | no | — |
| `cond.cervicitis` | 膿性分泌物 vs registry's 帶下異常 (`sym.vaginal_discharge`) | no | wording differs — same conservative rejection Batch 05 applied to `cond.bacterial_vaginosis` |
| `cond.chronic_hepatitis_c` | none (years asymptomatic per the pack's own summary) | no | — |
| `cond.chronic_open_angle_glaucoma` | 周邊視野喪失 (visual-field loss) vs registry's 視物模糊 (`sym.blurred_vision`) | no | different symptom, not the same clinical finding |
| `cond.chronic_scrotal_pain_syndrome` | none (no scrotal-pain term in the 102-symptom registry) | no | registry gap |
| `cond.chronic_venous_insufficiency` | 腫脹/沉重 vs registry's 水腫 (`sym.edema`) / 肢體沉重 (`sym.limb_heaviness`) | no | close but not verbatim on either candidate — kept conservative |

**9 of 15 left honestly empty** (no key written) — registry-gap or
wording-mismatch pattern, same conservative discipline as Batch 05.

### `structured_relation_seeds` — NOT written to canon (C8 precedent, unchanged)

All 15 records carry `"structured_relation_seeds": []` in the pack (empty).
Nothing to withhold; noted for completeness, per dispatch instruction.

## Identity-field drift observed, not corrected (out of scope — no field was in `fill_targets`)

The pack's own `name_zh` differs from the live canon `name_zh` on 8 of 15
records (synonym-level variance, e.g. `中樞型睡眠呼吸中止` pack vs
`中樞型睡眠呼吸中止症` canon; `耳垢栓塞` pack vs `耵聹栓塞` canon), and
`cond.cipn`'s pack `category` (`neuro`) disagrees with the live canon
`category` (`immune_misc`). `fill_targets` for all 15 records lists only
`summary, western_context, western_pathology, etiology, risk_factors,
red_flags, acupuncture_scope, sources, field_sources` — `name_zh`/`name_en`/
`category`/`icd_hint` are not in scope for this pack, matching Batch 05's
own precedent ("category/icd_hint/name_zh/name_en were not touched"). Left
the canon's existing identity fields untouched on all 15; flagging the
drift here for whoever next reconciles pack-vs-canon identity fields (not
this batch's call to make unilaterally — a `name_zh` change is a rename,
which needs Ting per AI_CONSTITUTION §3, and `cond.cipn`'s category
disagreement should be confirmed against the ICD hint `immune_misc`
placement before any change).

## SAFETY AWARENESS check — boilerplate treatment block coexistence

**None of the 15 records carry the known F-07/F-25/F-41 boilerplate
treatment block** (足三里/合谷/三陰交/中脘 + 八珍湯/補中益氣湯/柴胡疏肝散).
Confirmed directly: all 15 were true skeletons pre-batch (identity keys
only — no `tcm_patterns`/`acupoint_protocols`/`herb_formulas` existed to
begin with), and this batch did not introduce any acupoint-protocol or
herb-formula content (out of the pack's `fill_targets` scope entirely). This
differs from Batch 05's Part A (8 records that already carried the block);
Batch 06 has no Part A / EXISTING_ENRICH-with-content records at all — every
record was `EXISTING_ENRICH` in name but `SKELETON` in practice.

**Pregnancy/fertility-adjacent flag**: 3 of the 15 are `gyn_fertility`
category and obstetric-adjacent — `cond.cervical_dysplasia`,
`cond.cervical_insufficiency`, `cond.cervicitis`. Read all 3 end-to-end
(one, `cond.cervical_insufficiency`, is the second eyes-on record below).
None reference acupoints or herb formulas at all (no protocol content
exists on any of the 15, per above), so the SP6/LI4 caution-point
coexistence pattern flagged in Batch 05's Part A does not apply here — there
is no acupoint protocol on these cards to coexist with. `precautions` text
on `cond.cervical_insufficiency` explicitly reads "避免任何可能刺激子宮活動
的處置" (avoid any intervention that may stimulate uterine activity),
authored by the pack, not this session, and is the correct cautious
direction. No acupoint-safety language was invented beyond what the pack
sourced, matching the mission's constraint.

## Validation trail

```
node scripts/build-data.js
  Built app_data.js / knowledge_data.js / cloudtcm_map.js / points_361.js — no errors

node scripts/validate-condition-standard.js   (before batch, via git stash)
  505 records · 451 clean
  C4  42 defects / 42 records
  C5  72 defects / 38 records
  C10 70 defects / 36 records
  FAIL — 184 blocking defect(s)
  N4 skeleton index slots: 272

node scripts/validate-condition-standard.js   (after batch)
  505 records · 451 clean
  C4  42 defects / 42 records   (flat)
  C5  72 defects / 38 records   (flat)
  C10 70 defects / 36 records   (flat)
  FAIL — 184 blocking defect(s)   (flat — none of the 15 target ids appear
  anywhere in --worklist --all output, verified by direct grep)
  N4 skeleton index slots: 257   (272 -> 257, -15, matches the 15
  skeleton->draft promotions)

node scripts/check-validation-ratchet.js
  conditions 184 -> 184  flat
  patterns 0, tdis 0, symptoms 0, naming 1  (all flat)
  PASS — no regressions   (flat, not better — baseline NOT updated)

node scripts/validate-content-junk.js
  PASS — no scraped header tokens, no encoding anomalies in _zh fields
  (1 pre-existing formula-layer WARN, 32-record shared dosage clause,
  unrelated to this batch — same WARN documented in Batches 04/05/6b)

node scripts/validate-relations.js
  Relation validation passed.
  (2 pre-existing icd10-axis warnings on cond.oligomenorrhea and
  cond.cervical_spondylosis — neither is one of this batch's 15 ids,
  unrelated, unchanged by this batch; plus the same pre-existing
  comparisons.json SKELETON notes documented in prior ledgers)

git diff --check data/pathology/condition_canon_shortlist.json
  clean (no whitespace errors)
```

### Why blocking defects did NOT drop from 184 (same mechanism as Batch 05)

None of this batch's 15 target ids carried a C4/C5/C10 defect before this
batch — they were `review_status: "skeleton"` with zero content fields, so
C4 was exempted under template §5's skeleton carve-out (counted under N4,
not C4). Adding full bilingual content including `red_flags` moves all 15
out of N4 and into "has content, has red flags" — they do not trigger C4
(they now have red flags), so C4 stays flat. C5/C10 stay flat because every
field this batch wrote is fully bilingual and record-specific (verified: 0
of the 15 ids appear in the C5/C10 worklist). **The 184 blocking defects
belong entirely to the 90 other pre-existing records this batch did not
touch.**

## Maturity audit — before → after

```
node scripts/audit-cr010-condition-detail-maturity.js   (before batch, per
  Batch 05's own after-numbers and this pack's README "Known limits" note)
  full_detail_count: 115, partial_count: 62, skeleton_count: 328

node scripts/audit-cr010-condition-detail-maturity.js   (after batch)
  full_detail_count: 130, partial_count: 62, skeleton_count: 313
```

**full_detail: 115 → 130 (+15), partial: 62 → 62 (flat), skeleton: 328 → 313
(−15).** All 15 new records include `acupuncture_scope` (present on all,
pack's own design per its README) and clear the `FULL_DETAIL_CANDIDATE`
threshold (`score >= 10` with all 4 hard gates: `red_flags`,
`acupuncture_scope`, `sources`, `field_sources`) directly — 0 landed as
`DETAIL_PARTIAL`, same pattern as Batch 05 Part B.

`remaining_detail_slots_to_300`: 185 → 170.

## Eyes-on read — 2 finished records, end to end

**`cond.cerumen_impaction`** (ent_eye, rank 48): read the full canon record
top to bottom. `summary`/`western_context`/`western_pathology`/`etiology`
read cleanly and specifically (earwax accumulation, canal/tympanic-membrane
exam obstruction, hearing-aid/swab risk factors). `red_flags` correctly
distinguish sudden hearing loss/vertigo (same-day, must not be mistaken for
wax) from drainage/bleeding/fever (urgent). `acupuncture_scope_zh/en` reads
cleanly and matches in strength on both sides — the folded `can_treat` +
`cannot_treat` sentence reads as one coherent statement in both languages,
no CJK-in-English artifact (directly verified after the mid-task fix).
`sign_symptom_ids: ["sym.tinnitus"]` is a genuine match (耳鳴 appears
verbatim in `summary_zh`). `evidence: "unknown"` honestly reflects no
condition-specific acupuncture guideline was verified.

**`cond.cervical_insufficiency`** (gyn_fertility, rank 50, obstetric-adjacent):
read the full canon record top to bottom. All 9 new field pairs present,
bilingual, sourced to RCOG throughout. `red_flags` correctly gate on fluid
gush/bleeding/contractions (same-day obstetric triage) and
fever/foul-discharge/severe pain (emergency — intra-amniotic infection).
`acupuncture_scope.precautions` explicitly directs "avoid any intervention
that may stimulate uterine activity" and `co_management` correctly assigns
management authority to maternal-fetal medicine/obstetrics for ultrasound
surveillance, progesterone, or cerclage — no acupuncture claim overreaches
into preventing preterm birth (`can_treat`/folded `cannot_treat` explicitly
say acupuncture cannot reinforce the cervix, prevent preterm birth, close
the cervix, or replace cerclage). No fake-Chinese/invisible-English/
mojibake found on direct read. No acupoint or herb-formula content present
on this card at all — confirmed the SAFETY AWARENESS boilerplate/
caution-point pattern from Batch 05 Part A does not apply here (see above).

## Judgment calls (summary)

1. **Pack's `acupuncture_scope.cannot_treat` key (not in template §5.6) was
   folded into `can_treat`** rather than dropped or written as an unapproved
   field — preserves content, avoids a C12 defect, avoids inventing a
   schema field outside the "change the template first" order. See dedicated
   section above.
2. **Self-caught and fixed a CJK-into-English punctuation bug** in the first
   draft of that fold (`.。` mixing a full-width Chinese period into `_en`
   prose on all 15 records) — caught by direct eyes-on read of a merged
   record, not by any validator; canon file was reverted to the pre-batch
   commit and the corrected merge re-run from scratch before any other
   validation step.
3. **`sign_symptom_ids` added to 6 of 15 Part-B-style records** (7 ids
   total: `cond.cerumen_impaction` ×1, `cond.cervicogenic_headache` ×1,
   `cond.chronic_bronchitis` ×1, `cond.chronic_pancreatitis` ×1, `cond.cidp`
   ×1, `cond.cipn` ×2), applying the same verbatim-in-summary bar as
   Batch 05; 9 of 15 left honestly empty on registry-gap or wording-mismatch
   grounds, listed above for review.
4. **Identity-field drift observed but not corrected**: 8 of 15 records'
   pack `name_zh` differs from canon `name_zh` at the synonym level, and
   `cond.cipn`'s pack `category` (`neuro`) disagrees with canon's
   (`immune_misc`) — neither was in this pack's `fill_targets`, so neither
   was touched; flagged for whoever next reconciles pack-vs-canon identity,
   `cond.cipn`'s category disagreement in particular needs a call from Ting
   (a rename or recategorization is not this batch's call under
   AI_CONSTITUTION §3).
5. **No pack placeholder-stub sentences found** — the pack's own claim ("無
   Batch 05 placeholder 句") was independently verified true by direct grep
   and direct read of all 15 `risk_factors_en`/`red_flags_en[].finding`
   pairs, not merely trusted.
6. **No boilerplate treatment block on any of the 15** — all were true
   skeletons pre-batch, no `tcm_patterns`/`acupoint_protocols`/
   `herb_formulas` content exists on any of them; the Batch 05 Part A
   coexistence pattern does not recur in this batch.

## Next batch

`remaining_detail_slots_to_300`: 170. The F-07/F-25/F-41 boilerplate-
treatment-block corpus cleanup remains `OPEN, needs Ting` per all prior
eyeson ledgers and Batch 05's own next-batch note — unaffected by this
batch (none of these 15 carried the block). The `cond.cipn` category
disagreement (`neuro` per this pack vs `immune_misc` per live canon) and the
8-record `name_zh` synonym drift noted above are new, small, low-risk items
for the next identity-reconciliation pass.
