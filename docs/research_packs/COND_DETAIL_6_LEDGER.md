# CR-010 Condition Detail Batch 04 (SOL) — Ingestion Ledger (Detail Batch 6)

Branch: `codex/cond-detail-6-sol04` off `origin/codex/pattern-v2` @ `faa8d96`
("Stage SOL CR-010 Batch 04 (live PARTIAL rank 16-30, 15 records; split
handling: 16-23 full backfill / 24-30 sources+relations only)").
Source pack: `docs/research_packs/CR010_CONDITION_DETAIL_BATCH04_SOL.md` +
`data/research_staging/cr010_condition_detail_batch04_SOL.json` +
`cr010_common300_batch04_manifest.json` + `cr010_source_reuse_map_batch04_SOL.json`
(15 conditions).
Target file: `data/pathology/condition_canon_shortlist.json`.

Live audit re-run before ingestion (`node scripts/audit-cr010-condition-detail-maturity.js`
against the pre-batch file): `full_detail_count: 92`, `partial_count: 70`,
`skeleton_count: 343` — the exact Batch 03 ending state, confirming this
branch tip is Batch 03's landing commit plus the Batch 04 staging files.

## Exact-scan result (15 staged ids vs 505 canon records)

**13 of 15 resolved by exact id on the first scan. 2 did NOT resolve — STOPPED,
not fuzzy-matched:**

| Rank | Pack id | Resolves? | Live canon id (if different) |
|---:|---|---|---|
| 16 | `cond.pid_chronic` | yes | — |
| 17 | `cond.piriformis_syndrome` | yes | — |
| 18 | `cond.pmdd` | yes | — |
| 19 | `cond.postpartum_hypolactation` | yes | — |
| 20 | `cond.rotator_cuff` | yes | — |
| 21 | `cond.secondary_dysmenorrhea` | yes | — |
| 22 | `cond.vulvovaginal_candidiasis` | yes | — |
| 23 | `cond.whiplash` | yes | — |
| 24 | `cond.ankle_sprain` | yes | — |
| 25 | `cond.chronic_pelvic_pain` | yes | — |
| 26 | `cond.cluster_headache` | yes | — |
| 27 | `cond.de_quervain_tenosynovitis` | **NO → APPLIED-VIA-VERIFIED-MAPPING (Batch 6b)** | live id is `cond.de_quervain` (no `_tenosynovitis` suffix); mapping independently re-verified and applied — see "Batch 6b" section below |
| 28 | `cond.female_infertility` | yes | — |
| 29 | `cond.male_infertility` | yes | — |
| 30 | `cond.myofascial_pain_syndrome` | **NO → APPLIED-VIA-VERIFIED-MAPPING (Batch 6b)** | live id is `cond.myofascial_pain` (no `_syndrome` suffix); mapping independently re-verified and applied — see "Batch 6b" section below |

The task brief's own claim ("SOL confirms it used repo-true ids incl.
`cond.pmdd`, `cond.postpartum_hypolactation`, `cond.rotator_cuff`") is true for
those three named ids, but does not extend to all 15 — ranks 27 and 30 are
genuine pack id errors. Per task instruction ("no fuzzy matching — the
ge_gen_tang mis-join disaster came from fuzzy matching"), **both records were
stopped and left completely untouched in Batch 04.** `cond.de_quervain` and
`cond.myofascial_pain` carried zero writes from Batch 04 — no
western_pathology/etiology/risk_factors/sources/field_sources/relations
changes. Their `name_en` (`De Quervain Tenosynovitis`, `Myofascial Pain
Syndrome`) match the pack's cards verbatim, so this is very likely the same
underlying condition the pack intended — but "very likely" is exactly the
judgment a stop-and-report rule exists to keep out of an automated write.
**13 of 15 records ingested in Batch 04. The remaining 2 were subsequently
applied under a router-verified id mapping in Batch 6b — see below.**

## Split handling (per pack, matches task brief exactly)

- **Ranks 16–23 (8 records): full backfill** — western_pathology, etiology,
  risk_factors, sources, field_sources, relations.
- **Ranks 24–30 resolved subset (5 records: ankle_sprain, chronic_pelvic_pain,
  cluster_headache, female_infertility, male_infertility): preserve core,
  fill sources/field_sources/relations only.** western_pathology_action /
  etiology_action / risk_factors_action were all `PRESERVE_EXISTING` in the
  pack — honored literally: **zero writes** to those three field pairs on
  these 5 records, even where they were already empty (see below).

## C10 boilerplate — all 8 full-backfill records carried it, all 8 authorized for replacement

Every one of the 8 rank-16-23 records' `etiology_zh` was the exact 56-way-shared
string `"正氣不足，臟腑功能失調，氣血津液運化不利。"` and every
`western_pathology_zh` was the exact string
`"相關系統功能障礙及發炎或代謝異常導致的臨床症狀。"` — same boilerplate
documented in `COND_DETAIL_4_LEDGER.md` and replaced in Batch 03. Per that
precedent (this batch's own assigned targets, not incidental touches), all 8
`etiology_zh` + `western_pathology_zh` pairs were **replaced** with the SOL
pack's sourced content, with `_en` written for both (previously absent —
these fields had **no** `_en` twin pre-batch, an 8-way C5 gap in addition to
the C10 boilerplate). This is an 8/8 clean sweep within this batch's
full-backfill scope.

## Ranks 24–30 resolved subset: content fields were already empty, not "populated" — left empty, not backfilled

The pack's own text says "preserve populated core detail" for ranks 24–30,
but on inspection `cond.ankle_sprain` and `cond.chronic_pelvic_pain` (and
`cond.cluster_headache`'s `etiology_zh`) already had **empty** `etiology_zh`/
`western_pathology_zh` — cleared to honest gaps by a prior `import_artifacts`
migration pass (2026-08-11, same day) that moved CloudTCM blog-narrative junk
out of those fields. The pack's `*_action: "PRESERVE_EXISTING"` markers and
`fill_targets` list (sources/field_sources/structured_relations only, no
western_pathology/etiology/risk_factors) still control: **this batch does
not invent replacement content for those empty fields** — that would be
scope creep beyond what this batch's pack authorized, and the empty state is
already an honest gap (§0 只加深不刪除 is not violated by leaving an
already-empty field empty). `risk_factors_zh/en` were likewise absent
pre-batch on all 5 of these records and were **not** added — not a
fill_target for ranks 24–30 this batch.

## Field mapping used (matches Batch 03 precedent, template §3/§5.5)

- `western_pathology_en/zh`, `etiology_en/zh` (ranks 16–23 only) — written
  verbatim from the SOL pack's staged text (already bilingual in the JSON).
- **`risk_factors_zh` — NOT provided by this batch's pack (unlike Batch 03).**
  The staging JSON carries `risk_factors_en` only, no `risk_factors_zh`
  twin, on all 8 full-backfill records (verified directly against the raw
  JSON — this is a genuine pack gap, not an extraction miss; Batch 03's raw
  JSON had both). Per constitution `_zh`/`_en` pairing (C5/C9), `risk_factors_zh`
  was authored as a faithful direct translation of the pack's own
  `risk_factors_en` strings — same underlying CDC/ACOG/AAOS/PubMed/AAPM&R
  source, same factual content, rendered bilingually, not new research. Both
  languages structured into template §5.5 shape
  (`factor`/`direction`/`modifiable`/`source`); `direction` is `increases`
  throughout (no protective factors in this batch's material); `modifiable`
  set per the same clinical-judgment convention as Batch 03 (behavioral/
  exposure/occupational factors → `true`; age, prior injury/trauma, anatomic
  structure, comorbid diagnosis, demographic/physiologic state → `false`).
- **3 risk-factor line items dropped, not ported** (judgment call, see
  below) — `cond.pmdd` (1 of 3), `cond.secondary_dysmenorrhea` (2 of 3),
  `cond.vulvovaginal_candidiasis` (1 of 4). All other items ported.
- `sources` — pack's structured `{title, url, authority}` folded into the
  dataset's `"Authority — Title: URL"` string-array convention. On the 8
  full-backfill records this field was newly created (none had a `sources`
  field pre-batch — only `content_source` tag arrays on 3 of them, left
  untouched). On the 5 resolved rank-24-30 records, the new authoritative URL
  was **appended** to the existing `sources` array — the pre-existing
  CloudTCM URL on all 5 was preserved, not replaced (只加深不刪除).
- `field_sources` — per-field citations, `_zh`/`_en`-suffixed keys matching
  `cond.restless_legs` precedent. On ranks 16–23: keyed to
  `western_pathology_zh/en`, `etiology_zh/en`, `risk_factors_zh/en` (the
  fields actually written this batch). On the 5 resolved rank-24-30 records:
  keyed to `western_context_zh/en` and `red_flags_zh/en` — the **already-
  populated, non-boilerplate** content fields that the newly-added
  authoritative source (AAOS/ACOG/ICHD-3/ASRM) independently corroborates per
  the pack's own `source_support_note` (e.g. ankle_sprain's AAOS source
  explicitly supports "ligament sprain, common inversion/lateral mechanism,
  prior-sprain recurrence risk, and chronic instability" — content already on
  the card's `western_context`/`red_flags`, previously uncited). This
  documents provenance for content that was already correct, not new content
  — the honest reading of "missing_field_sources" as a citation gap rather
  than a content gap on records whose core detail this batch does not touch.
- **`acupuncture_scope_zh/en` — NOT a fill_target in this batch's pack** (the
  pack's `preserve_existing_fields` lists it for ranks 16–23, but like
  `risk_factors` on ranks 24–30, no such field existed to preserve — see
  Maturity audit finding below). **Not written this batch** — inventing an
  evidence-graded acupuncture-scope claim without a session-verified citation
  would be new clinical-judgment content, out of scope for a
  sources/relations-only batch and a redline-9 risk if rushed.
- `domain` — the pack supplies a `domain` array per record, but **not
  written**. 0/505 canon records currently use the `domain` field (checked
  directly), so there is no existing vocabulary to conform to, and the
  pack's own values (`uro_genital`, `mental_neurobehavioral`, `chronic_pain`,
  `reproductive`, `neurology`, …) are visibly not the template's own
  `category` enum (§3.5) either. Left alone — not this batch's fill_target,
  and inventing a first-use vocabulary without checking DECISIONS D8 is a
  schema decision, not a content-ingestion one.
- The pack's own `category` field per record (e.g. `pid_chronic`:
  `"uro_genital"`) was **not** used to overwrite the canon record's existing,
  template-valid `category` (`gyn_fertility`) — the pack's category strings
  are not the template §3.5 12-value enum and appear to be a staging
  convenience label, not a canon value.

## `summary`/`western_context`/`red_flags` — preserved untouched (all 15 records)

Per the pack's own `preserve_existing_fields` list and Batch 02/03 precedent:
none of these three fields were modified on any of the 13 written records.
All were already condition-specific, non-boilerplate content from an earlier
authoring pass. `red_flags` remain plain string arrays on 12 of the 13 (not
the 5-field structured shape used on newer cards) — this batch did not
restructure them; not named in this batch's fill_targets.

## sign_symptom_ids — genuine-match discipline (6 of 13 records)

Checked all 13 against the 102-symptom registry (`data/symptoms/symptoms.json`).
Genuine matches only, explicit in the card's own summary/presenting-complaint
text, no force-fit:

| Condition | sign_symptom_ids added | Basis |
|---|---|---|
| `cond.pmdd` | `sym.irritability` | 易怒 explicit in existing summary_zh |
| `cond.rotator_cuff` | `sym.shoulder_pain` | exact presenting complaint |
| `cond.secondary_dysmenorrhea` | `sym.dysmenorrhea` | exact id/name match |
| `cond.vulvovaginal_candidiasis` | `sym.pruritus`, `sym.vaginal_discharge` | both explicit in existing summary_zh |
| `cond.whiplash` | `sym.neck_pain` | exact presenting complaint |
| `cond.cluster_headache` | `sym.headache` | exact presenting complaint (rank-24-30 subset; satisfies this record's `structured_relations` fill_target) |

**7 of 13 left honestly empty — no genuine match in the 102-symptom
registry**: `cond.pid_chronic`, `cond.piriformis_syndrome`,
`cond.postpartum_hypolactation`, `cond.ankle_sprain`,
`cond.chronic_pelvic_pain`, `cond.female_infertility`,
`cond.male_infertility`. Matches Batch 03's documented registry gap: no
buttock/pelvic/ankle/lactation/infertility-specific symptom entries exist in
the 102-symptom set.

## `structured_relation_seeds` — disposition (NOT written to canon)

Same disposition as Batch 03: the pack's `structured_relation_seeds`
(`differential_candidate` / `commonly_seen_with` / `workflow_context` /
`associated_with` / `taxonomy_relation`, all `needs_id_resolution: true`) were
**not** written anywhere in canon. No approved relation field exists for
cond-to-cond free text (template §3.3 only resolves `related_patterns`,
`related_eastern_diseases`, `sign_symptom_ids`). Writing them would be a C8
violation. The `structured_relations` fill-target is satisfied honestly by
each record's pre-existing non-empty `related_patterns` (unchanged, already
resolving) plus the 6 records' new `sign_symptom_ids` above.

## `cond.chronic_pelvic_pain` — 11 unresolved crossrefs, not touched

Per task instruction and the pack's own identity note ("Umbrella syndrome; 11
unresolved crossrefs must not be auto-resolved"): `related_patterns` and
`related_eastern_diseases` on this record were left **completely untouched**.
Only `sources` (appended) and `field_sources` (newly added, keyed to already-
populated fields per the mapping above) were written.

## `tcm_pathogenesis_seed_zh` — dispositions (NOT written to canon)

All 13 written records carry `tcm_source_status: "needs_textbook_source_review"`
in the pack. Per task instruction and constitution redline 9, none of the 13
`tcm_pathogenesis_seed_zh` candidate texts were written into `etiology_zh/en`
or any other canon field.

## Judgment calls

**3 pack-supplied `risk_factors_en` line items dropped from the ported
`risk_factors_zh/en` arrays** — read as diagnostic-methodology notes or
absence-of-trigger statements, not structurable epidemiological risk factors
(§5.5's `factor`/`direction`/`modifiable` shape presumes a specific factor
that raises or lowers likelihood, not a diagnostic-timing requirement or a
"no clear cause" statement):

- `cond.pmdd`: dropped "prospective cyclic timing is important" (a diagnostic
  methodology note — symptoms must be tracked prospectively across cycles to
  confirm the diagnosis — not a factor that makes someone more likely to
  develop PMDD).
- `cond.secondary_dysmenorrhea`: dropped "new significant pain after
  previously painless cycles" and "progressive/prolonged atypical pain" —
  both are diagnostic red-flag-style clues that duplicate content already on
  this record's existing `red_flags_zh/en` ("進行性加重或止痛無效之痛經需影像
  與專科評估"), not epidemiological risk factors for developing secondary
  dysmenorrhea.
- `cond.vulvovaginal_candidiasis`: dropped "many uncomplicated cases have no
  clear trigger" — an absence-of-trigger statement, not a factor at all.

Nothing from the pack's real clinical content was lost — these 3 items were
candidate risk-factor lines the pack itself proposed, not existing canon
content, and the underlying facts they describe are either already present
elsewhere on the card (dysmenorrhea's red_flags) or not a "risk factor" in
the schema's sense (PMDD's diagnostic-timing note, candidiasis's absence
statement). All other risk-factor items from the pack were ported in full.

**`risk_factors_zh` authored as translation, not sourced independently.** The
pack provided `risk_factors_en` only (no `risk_factors_zh`) on all 8
full-backfill records — confirmed by direct inspection of the raw staging
JSON, not an extraction artifact. Faithful bilingual translation of the same
CDC/ACOG/AAOS/PubMed/AAPM&R-sourced English content, not new research or
invented content — flagged here per CLAUDE.md's "回報錯了她的判斷跟著錯"
discipline rather than silently treated as pack-native content.

**`acupuncture_scope` not authored this batch** despite being listed in
`preserve_existing_fields` for ranks 16–23 (where, like `risk_factors` on
ranks 24–30, no such field actually existed to preserve). Authoring an
evidence-graded `can_treat`/`precautions`/`co_management` structure from
scratch, with a proper `guideline`/`label_derived`/`course`/
`clinical_judgment`/`unknown` grade, is new clinical-judgment content this
batch's pack does not supply and this session did not independently
research — out of scope for a batch whose fill_targets are explicitly
western_pathology/etiology/risk_factors/sources/field_sources/
structured_relations only.

**2 unresolved ids (`cond.de_quervain_tenosynovitis`, `cond.myofascial_pain_syndrome`) stopped, not fuzzy-matched** — see the exact-scan table above. This is the single largest process finding of this batch: it directly demonstrates the task brief's own warning ("no fuzzy matching — the ge_gen_tang mis-join disaster came from fuzzy matching") was necessary, not decorative — 2 of 15 ids in this SOL pack (13%) do not match live canon ids despite the pack's blanket claim of using "repo-true ids."

## Validation trail (single commit, 13 records written, 2 records stopped)

```
node scripts/build-data.js
  Built data/generated/app_data.js, knowledge_data.js, cloudtcm_map.js, points_361.js — no errors

node scripts/validate-condition-standard.js   (before batch, pre-batch04 file restored from git HEAD)
  505 records · 441 clean
  C4  42 defects / 42 records
  C5  88 defects / 46 records
  C10 90 defects / 48 records
  FAIL — 220 blocking defects

node scripts/validate-condition-standard.js   (after batch)
  505 records · 449 clean   (+8, exactly the 8 rank-16-23 full-backfill records)
  C4  42 defects / 42 records   (flat — red_flags untouched, per merge contract)
  C5  72 defects / 38 records   (-16 = 8 records × 2 fields:
      etiology_en + western_pathology_en both newly paired)
  C10 74 defects / 40 records   (-16 = 8 records × 2 fields:
      etiology_zh + western_pathology_zh no longer match the
      56-way-shared boilerplate)
  FAIL — 188 blocking defects   (-32 net)

node scripts/check-validation-ratchet.js
  conditions 220 -> 188  BETTER  PASS — no regressions
node scripts/check-validation-ratchet.js --update
  baseline updated -> data/audits/validation_baseline.json

node scripts/validate-content-junk.js
  PASS — no scraped header tokens, no encoding anomalies in _zh fields
  (1 pre-existing formula-layer WARN — 32-record shared dosage clause,
  unrelated to this batch, tracked in AUDIT_DATA_FIXES_LEDGER.md)

node scripts/validate-relations.js
  Relation validation passed (sign_symptom_ids / sources / related_patterns
  all resolve; 11 pre-existing unrelated comparisons.json SKELETON notes)

git diff --check data/pathology/condition_canon_shortlist.json
  clean (no whitespace errors)
```

## Maturity audit finding — `full_detail_count` did NOT rise this batch (report exact, not "up to 100")

```
node scripts/audit-cr010-condition-detail-maturity.js   (before batch)
  full_detail_count: 92, partial_count: 70, skeleton_count: 343

node scripts/audit-cr010-condition-detail-maturity.js   (after batch)
  full_detail_count: 92, partial_count: 70, skeleton_count: 343   — ALL THREE FLAT
```

**`full_detail_count` stayed at 92 → 92 (0 change), not "92 → up to 100" as
hoped.** The audit script's `FULL_DETAIL_CANDIDATE` threshold requires
`score >= 10 AND allHard`, and `acupuncture_scope` is one of 4 **hard gates**
(`red_flags`, `acupuncture_scope`, `sources`, `field_sources` — all must be
present, not just scored). `acupuncture_scope` was never a fill_target in
this batch's SOL pack for any of the 15 records, and none of the 13 written
records had it pre-existing. Per-record detail (re-run after ingestion):

| Record | Score before | Score after | Still missing |
|---|---:|---:|---|
| 8 rank-16-23 records | 5/12 | **10/12** | `acupuncture_scope` only |
| `cond.ankle_sprain`, `cond.chronic_pelvic_pain`, `cond.cluster_headache`, `cond.female_infertility`, `cond.male_infertility` | 6/12 | **7/12** | `western_pathology`, `etiology`, `risk_factors`, `acupuncture_scope` (unchanged — out of this batch's scope) |

All 8 rank-16-23 records went from 6 missing criteria to exactly 1
(`acupuncture_scope`) and are now the closest-to-complete `DETAIL_PARTIAL`
records in the dataset by score — a genuine, measurable improvement — but
none crossed the `FULL_DETAIL_CANDIDATE` line, because that line requires a
field this batch's pack never supplied. This is worth surfacing to whoever
scopes the next batch: an `acupuncture_scope` authoring pass over these same
8 ids (with real session-verified evidence grading, not invented) would move
`full_detail_count` from 92 to 100 in one batch, more efficiently than
sourcing 8 new PARTIAL records from scratch.

## Batch totals (13 records written, 2 records stopped, single commit)

- **0 new `cond.*` records created** — all 13 written ids resolved exactly;
  **2 of 15 pack ids failed to resolve** (`cond.de_quervain_tenosynovitis`,
  `cond.myofascial_pain_syndrome`) and were stopped per the no-fuzzy-matching
  rule, not written anywhere.
- **full_detail_count**: 92 → 92 (flat — see Maturity audit finding above).
  partial_count 70 → 70 (flat), skeleton_count 343 → 343 (flat). The 13
  written records all remain `DETAIL_PARTIAL` but at materially higher
  scores (5→10/12 for the 8 full-backfill records, 6→7/12 for the 5
  sources-only records).
- **Overall condition-layer blocking defects**: 220 → 188 (net **-32**).
- **sign_symptom_ids added**: 6 of 13 records (7 total ids added, including a
  2-symptom pair on `vulvovaginal_candidiasis`); 7 of 13 left honestly empty
  (registry gap, matches Batch 03's documented finding).
- **`risk_factors_zh` authored as direct translation** of the pack's
  English-only `risk_factors_en` (a genuine pack gap vs. Batch 03) — flagged
  as a judgment call above, not silently treated as pack-native bilingual
  content.
- **3 pack-proposed risk-factor line items dropped** (diagnostic-methodology
  notes / absence-of-trigger statements, not structurable risk factors) —
  see Judgment calls.
- **`acupuncture_scope` not authored** — not a fill_target, and the single
  reason `full_detail_count` did not rise this batch.
- **2 records stopped for id non-resolution** — `cond.de_quervain_tenosynovitis`
  → live id `cond.de_quervain`; `cond.myofascial_pain_syndrome` → live id
  `cond.myofascial_pain`. Zero writes to either live record in Batch 04.
  **Update (Batch 6b, 2026-08-12): both applied under a router-verified id
  mapping** — see "Batch 6b — verified id-mapping application" section below.
- **Sources used this batch**: CDC (pid_chronic, vulvovaginal_candidiasis),
  PubMed systematic review (piriformis_syndrome), ACOG (pmdd,
  postpartum_hypolactation, secondary_dysmenorrhea, chronic_pelvic_pain,
  female_infertility), AAOS/ASES (rotator_cuff, ankle_sprain), AAPM&R
  (whiplash), ICHD-3 (cluster_headache), ASRM/AUA (male_infertility) — all
  reused verbatim from the SOL pack's own live-research citations, no new
  independent research performed this session per the pack's
  `REVIEW_REFERENCED_ASSETS_BEFORE_NEW_RESEARCH` gate.

## Next batch

`remaining_detail_slots_to_300` per the live audit after this batch:
**208 → 208 (flat)** — this batch improved existing PARTIAL records' depth
and citation coverage rather than promoting new records to FULL_DETAIL, so
the slot count to 300 is unchanged this batch. Two candidates flagged for
priority attention before/alongside the next rank-31-45 pull:

1. An `acupuncture_scope` authoring pass on the 8 rank-16-23 ids from this
   batch (`cond.pid_chronic`, `cond.piriformis_syndrome`, `cond.pmdd`,
   `cond.postpartum_hypolactation`, `cond.rotator_cuff`,
   `cond.secondary_dysmenorrhea`, `cond.vulvovaginal_candidiasis`,
   `cond.whiplash`) — would move `full_detail_count` 92 → 100 directly.
2. ~~Ting's id-mapping ruling on `cond.de_quervain_tenosynovitis` →
   `cond.de_quervain` and `cond.myofascial_pain_syndrome` →
   `cond.myofascial_pain`~~ — **resolved in Batch 6b (2026-08-12)**, see below.

---

## Batch 6b — verified id-mapping application (2026-08-12)

Branch: `codex/cond-detail-6b-idmap` off `origin/codex/pattern-v2` @ `d0e500f`
(this ledger's own landing commit). Authority: router ruling applying the
Batch 02 name-mismatch precedent (`COND_DETAIL_2_LEDGER.md` #2/#8 — id
mismatches resolved by independent name/definition verification, treated as
EXISTING under the live id, never as a new record) to the 2 records this
batch stopped on id mismatch.

### Step 0 — independent re-verification (mandatory, done before any write)

Both pack records (`data/research_staging/cr010_condition_detail_batch04_SOL.json`)
and both live canon records (`data/pathology/condition_canon_shortlist.json`)
were read directly and compared:

| | Pack (rank 27) | Live (`cond.de_quervain`) |
|---|---|---|
| `name_en` | De Quervain Tenosynovitis | De Quervain Tenosynovitis (exact match) |
| `name_zh` | 狄奎凡氏腱鞘炎 (transliteration) | 媽媽手（狹窄性腱鞘炎）(Taiwan common name) — same condition, different naming convention |
| Definition | AAOS source note: APL/EPB tendon-sheath irritation, pregnancy/postpartum association, thumb/wrist loading | `summary_zh`: 腕橈側第一背側腔室（拇長展肌與拇短伸肌腱）的狹窄性腱鞘炎 — first dorsal compartment (APL/EPB) stenosing tenosynovitis. Same anatomic structures, same condition. |
| `icd_hint` (live only) | — | M65.4 (De Quervain's, correct) |

| | Pack (rank 30) | Live (`cond.myofascial_pain`) |
|---|---|---|
| `name_en` | Myofascial Pain Syndrome | Myofascial Pain Syndrome (exact match) |
| `name_zh` | 肌筋膜疼痛症候群 | 肌筋膜疼痛症候群 (exact match) |
| Definition | AAPM&R source note: regional myofascial pain/trigger-point features, chronic stretch/overload contributors | `summary_zh`: 肌筋膜激痛點（緊繃帶內的過敏點）引起的局部與轉移痛 — trigger-point referred pain. Same condition. |
| `icd_hint` (live only) | — | M79.1 (myofascial pain syndrome, correct) |

Both pairs describe the same underlying condition (name_en exact match on
both; name_zh either exact or a known alternate-naming convention; definition
content congruent; icd_hint correct for the mapped id in both cases). **Both
records verified — neither stopped at Step 0.**

### Application (rank 24–30 sources-only rule, applied exactly)

Per Batch 04's own resolved rank 24-30 subset treatment (both
`western_pathology_action`/`etiology_action`/`risk_factors_action` are
`PRESERVE_EXISTING` in the pack for both records): **no content field was
overwritten.** Only `sources` (appended) and `field_sources` (newly added,
keyed to the already-populated `western_context_zh/en` and `red_flags_zh/en`
pairs, matching the exact field-keying convention used on
`cond.ankle_sprain`/`cond.chronic_pelvic_pain`/`cond.cluster_headache`/
`cond.female_infertility`/`cond.male_infertility`) were written:

| Field | `cond.de_quervain` | `cond.myofascial_pain` |
|---|---|---|
| `sources` | +1 (appended `AAOS — De Quervain's Tenosynovitis: https://orthoinfo.aaos.org/en/diseases--conditions/de-quervains-tendinosis/`; pre-existing CloudTCM URL preserved, not replaced) | +1 (appended `AAPM&R — Myofascial Pain: https://now.aapmr.org/myofascial-pain/`; pre-existing CloudTCM URL preserved) |
| `field_sources` | new: `western_context_zh`, `western_context_en`, `red_flags_zh`, `red_flags_en` (each `["AAOS — De Quervain's Tenosynovitis"]`) | new: `western_context_zh`, `western_context_en`, `red_flags_zh`, `red_flags_en` (each `["AAPM&R — Myofascial Pain"]`) |
| `western_pathology_zh/en`, `etiology_zh/en`, `risk_factors_zh/en` | untouched (already empty pre-batch — same honest-gap state as the rank 24-30 resolved subset; not a fill_target) | untouched (already empty pre-batch; not a fill_target) |
| `summary`, `red_flags` (content), `western_context` (content) | untouched | untouched |
| `sign_symptom_ids` | not added — no genuine match in the 102-symptom registry (`data/symptoms/symptoms.json`; no wrist/thumb-specific entry) | not added — no genuine match (no myofascial/muscle-pain-specific entry beyond `sym.muscle_cramp`/`sym.muscle_atrophy`, neither a genuine fit) |
| `structured_relation_seeds` (pack) | not written — no approved cond-to-cond free-text relation field exists (template §3.3); `related_patterns` (pre-existing, resolving) left untouched | not written, same reason; `related_patterns` (pre-existing, resolving, 2 entries) left untouched |

`git diff data/pathology/condition_canon_shortlist.json` confirms exactly 2
append-only hunks (one per record) — no lines removed, no existing field
shortened or cleared.

### Validation trail

```
node scripts/build-data.js
  Built app_data.js / knowledge_data.js / cloudtcm_map.js / points_361.js — no errors

node scripts/validate-condition-standard.js
  505 records · 449 clean
  C4  42 defects / 42 records   (flat — unchanged)
  C5  72 defects / 38 records   (flat — unchanged, no _zh/_en pairs touched)
  C10 74 defects / 40 records   (flat — unchanged, no boilerplate touched)
  FAIL — 188 blocking defect(s)   (flat vs Batch 04's post-batch 188 — expected:
  this batch adds sources/field_sources only, which are not C4/C5/C10-scored fields)

node scripts/check-validation-ratchet.js
  conditions 188 -> 188  flat  PASS — no regressions
  (flat, not better — baseline NOT updated, per instruction to only --update on BETTER)

node scripts/validate-content-junk.js
  PASS — no scraped header tokens, no encoding anomalies in _zh fields
  (1 pre-existing formula-layer WARN, 32-record shared dosage clause,
  unrelated to this batch — same WARN documented in Batch 04's own trail)

node scripts/validate-relations.js
  Relation validation passed (11 pre-existing unrelated comparisons.json
  SKELETON notes, same as Batch 04's trail)

git diff --check data/pathology/condition_canon_shortlist.json
  clean (no whitespace errors)
```

Maturity audit (`node scripts/audit-cr010-condition-detail-maturity.js`):
`full_detail_count: 92`, `partial_count: 70`, `skeleton_count: 343` — all
three flat, same as Batch 04's own finding (sources/field_sources are not
among the score-moving criteria; `acupuncture_scope` remains the blocking
hard gate on both records, unauthored, same as Batch 04's rank-16-23 set).

### Totals (this batch)

- **0 new `cond.*` records created.** Both pack ids resolved via verified
  mapping to existing live ids; no duplicates.
- **2 records written**: `cond.de_quervain`, `cond.myofascial_pain`.
  `sources` +1 each, `field_sources` newly added (4 keys each) on both.
  All other fields byte-identical to pre-batch state.
- **Overall condition-layer blocking defects: 188 → 188 (flat)** — expected;
  this batch's fill_targets (`sources`, `field_sources`) are not scored by
  C4/C5/C10.
- **`cond.de_quervain_tenosynovitis` → `cond.de_quervain` and
  `cond.myofascial_pain_syndrome` → `cond.myofascial_pain`**: both Batch 04
  STOPPED rows now **APPLIED-VIA-VERIFIED-MAPPING**, authority = this
  dispatch + independent Step 0 re-verification (name_en exact match on
  both + congruent definition + correct `icd_hint` on both live records).
