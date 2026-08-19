# COND Untangle Ledger — batch 1 (junk-import relocation)

Branch: `codex/cond-untangle-1`, off `origin/codex/pattern-v2` tip `010f930`
("Template 3.5.5 import_artifacts"). Scope per dispatch: `docs/CONDITION_CARD_TEMPLATE.md`
§3.5.5 (`import_artifacts` = move-not-delete destination for junk-import text),
`docs/research_packs/COND_C5_LEDGER.md` (35-record/58-field blog-narrative
enumeration), and `docs/research_packs/COND_INGESTION_LEDGER.md`'s 4 named
cross-contamination flags. Ledger-enumerated records only — no free-lance scope
expansion (§3.5.5's own rule).

## Field-count reconciliation (35 records, ledger says 58 fields — actual is 64)

Direct verification of `data/pathology/condition_canon_shortlist.json` against
the 35 record ids listed in `COND_C5_LEDGER.md`'s "Blog/misfiled-blocked"
section found **64 C5-defective fields**, not the ledger's estimated 58. Two
things were checked before trusting the higher number over the ledger's own
arithmetic:

1. Confirmed the record-id list itself sums to exactly 35 (cardio 3 + derm 1 +
   endo 2 + ent_eye 4 + gi 3 + immune_misc 2 + neuro 1 + pain_msk 15 +
   psych_sleep 1 + uro_renal 3 = 35) — the record scope is exactly right.
2. Field-by-field: of these 35, `cond.heart_failure` contributes only 1 field
   (`western_pathology_zh`; its `etiology_zh`/`_en` pair is real, already
   bilingual, untouched) and is handled separately under the misfile procedure
   (see below), not this bucket's blanket move. The other 34 records each
   contribute up to 2 fields (`western_pathology_zh`, `etiology_zh`). Four of
   those 34 — `cond.tension_headache`, `cond.migraine`, `cond.cluster_headache`,
   `cond.migraine_vestibular` — have their `western_pathology_zh` independently
   confirmed C10-shared-verbatim (exact-string match, `tension_headache` ↔
   `cluster_headache`, and `migraine` ↔ `migraine_vestibular`), i.e.
   genuinely C10-blocked/batch-2 territory per this task's own instruction #4
   ("do not touch C10 boilerplate — that's batch 2"). Their `etiology_zh` is
   NOT C10-shared (unique per record) and reads as blog narrative on direct
   inspection (ad embed codes `[@ad:1]`, member anecdotes, rhetorical asides)
   — squarely this batch's scope. So: 30 records × 2 fields + 4 records × 1
   field (`etiology_zh` only) = **64 fields**, all moved in this commit.

The ledger's footnote claiming one of those 4 records' `etiology_zh` "WAS
translated" does not match current data (`etiology_en` is empty on all 4) —
read as stale/imprecise prose in the source ledger, not a factual record of
completed work; the field-level bucket assignment (which field belongs to
which pass) is otherwise consistent and was trusted. Flagging the discrepancy
here per constitution "驗證器 PASS ≠ 沒有損失 / 回報要能被驗證重現" rather
than silently forcing a match to 58.

## Item 1 — blog-narrative fields → `import_artifacts` (commit A, this ledger)

All 64 fields above: full text moved verbatim into the record's own
`import_artifacts` array as `{original_field, text, reason, moved_at:
"2026-08-11"}`, then the clinical field set to `""` (honest gap — R2 fill
deferred, not this batch's mandate). Reason text is per-record (not a single
copy-pasted sentence across records, per constitution rule 6 樣板句 concern)
but shares a common core description of the junk pattern (CloudTCM blog
voice / member anecdotes / ad embed codes, not template §3.2 clinical
content).

Records touched (34): `cond.hypotension`, `cond.palpitations`, `cond.acne`,
`cond.hypothyroidism`, `cond.hyperthyroidism`, `cond.hearing_loss`,
`cond.eye_strain`, `cond.globus_pharyngitis`, `cond.aphthous_ulcers`,
`cond.chronic_diarrhea`, `cond.nausea_vomiting`, `cond.hemorrhoids`,
`cond.chronic_allergies`, `cond.cancer_supportive`,
`cond.lumbar_disc_herniation`, `cond.sciatica`, `cond.cervical_spondylosis`,
`cond.frozen_shoulder`, `cond.de_quervain`, `cond.trigger_finger`,
`cond.knee_osteoarthritis`, `cond.patellofemoral_pain`, `cond.ankle_sprain`,
`cond.plantar_fasciitis`, `cond.myofascial_pain`, `cond.tmd`,
`cond.circadian_disorder`, `cond.recurrent_uti`, `cond.overactive_bladder`,
`cond.nocturnal_enuresis` (both fields each, 30 records × 2 = 60 fields) +
`cond.migraine_vestibular`, `cond.tension_headache`, `cond.migraine`,
`cond.cluster_headache` (`etiology_zh` only, 4 fields — their
`western_pathology_zh` is left untouched for the C10/batch-2 pass).

`cond.heart_failure` is **not** included in this list — its single blog field
is a cross-record misfile (see Item 2a below), handled in commit B.

### Validator tail — commit A (this batch, item 1 only)

```
validate-condition-standard — data/pathology/condition_canon_shortlist.json
scope: all categories · 505 records · 405 clean

C4  NO RED FLAGS (safety) — 51 defect(s) across 51 record(s)
C5  _zh filled but _en empty — 139 defect(s) across 72 record(s)
C10  content shared verbatim across records (boilerplate/misfiled) — 147 defect(s) across 76 record(s)

FAIL — 337 blocking defect(s).
```

Before → after (commit A only): C4 51→51 (flat, out of scope), C5 203→139
(−64, matches field count exactly), C10 147→147 (flat, correctly untouched —
batch 2 territory), total blocking 401→337 (−64).

```
validation ratchet — defect counts vs committed baseline
  BETTER   conditions   401 → 337   (−64)
  flat     patterns     0 / tdis 0 / symptoms 0 / naming 1
PASS — no regressions (and something improved; run --update to lock it in).
```

```
validate-content-junk: PASS — no scraped header tokens in content arrays.
validate-relations: Relation validation passed. (unchanged link counts)
```

`node scripts/build-data.js` ran clean before validation, no errors.

## Item 2 — misfiled essays (commit B)

Four named cross-contamination flags from `COND_INGESTION_LEDGER.md`, each
resolved per the task's move-first-then-clear procedure (destination write
happens in the same in-memory pass before any field is cleared — verified by
script structure, not just intent). Where the destination record already
holds real content in the same field, the moved text goes into the
*destination's* `import_artifacts` (with an added `original_record` key on
the artifact object, since the base `{original_field, text, reason,
moved_at}` shape has no way to say "this came from a different record" —
additive, does not remove any of the four required keys). Where the shared
text is a wider fan-out with one clear true-home record, the redundant
copies are archived locally (each duplicate's own `import_artifacts`,
pointing at the true home in its `reason` prose) rather than piling multiple
byte-identical copies onto the true-home record.

### 2a. `cond.heart_failure` → `cond.palpitations` (arrhythmia misfile)

`cond.heart_failure.western_pathology_zh` (765 chars) is cardiac-arrhythmia
(心律不整) CloudTCM blog content, near-identical to
`cond.palpitations.western_pathology_zh` (same essay, differs by one
OCR-artifact character: 一鐘 vs 一分鐘) — flagged in `COND_C5_LEDGER.md` as
an outright misfile. `cond.palpitations`'s own copy of the same essay was
independently blog-junk (moved to its own `import_artifacts` in commit A,
item 1). Tested per the task's own rule: even on its true topical home, this
text is still CloudTCM blog voice (member-anecdote asides, app-download
plugs, ad embed codes), not template §3.2 clinical prose — so it does **not**
get restored into `palpitations.western_pathology_zh` as real content; it is
filed as a second `import_artifacts` entry on `cond.palpitations` (with
`original_record: "cond.heart_failure"`), and `heart_failure.western_pathology_zh`
is cleared to `""`. `cond.heart_failure.etiology_zh`/`_en` (real, distinct,
already bilingual heart-failure content, unrelated to the arrhythmia text)
was left completely untouched.

### 2b. `cond.asthma` × `cond.post_covid` (shared asthma essay)

Both records carried byte-identical `western_pathology_zh` (456 chars) and
`etiology_zh` (1921 chars) — confirmed asthma-specific content ("氣喘是常見
的氣道慢性炎症疾病…") per `COND_INGESTION_LEDGER.md` Batch F's flag.
`cond.asthma`'s copy is real, complete, and **already bilingual**
(`western_pathology_en` 763 chars, `etiology_en` 2453 chars — translated in
an earlier authorized batch) — confirmed true home, left entirely
untouched, no second judgment applied to content a prior batch already
vetted. `cond.post_covid`'s copy was untranslated (`_en` empty on both
fields) — the orphan duplicate. Moved into `cond.post_covid`'s own
`import_artifacts` (local, not duplicated a second time onto asthma, since
asthma's copy is byte-identical and already retained), both fields cleared
to `""`.

### 2c. `cond.male_infertility` → `cond.erectile_dysfunction` (ED misfile)

Both records carried byte-identical `western_pathology_zh` (608 chars) and
`etiology_zh` (2602 chars) — classical ED terminology (陰器不用/陽事不舉/
陽萎), confirmed per `COND_INGESTION_LEDGER.md` Batch K's flag.
`cond.erectile_dysfunction`'s copy is real and already translated (Batch K
added a condensed `_en`) — true home, left untouched.
`cond.male_infertility`'s copy (untranslated, `_en` empty on both fields) —
confirmed-off-topic duplicate — moved into
`cond.erectile_dysfunction.import_artifacts` (destination-occupied branch,
`original_record: "cond.male_infertility"` on each entry), both fields
cleared to `""` on `cond.male_infertility`.

### 2d. The 7-way 月經不調 (irregular menstruation) essay — remaining 5-way

`COND_INGESTION_LEDGER.md` Batch K already replaced `cond.endometriosis` and
`cond.primary_dysmenorrhea`'s copies with condition-specific real content,
leaving 5 records sharing the essay verbatim in both
`western_pathology_zh` (484 chars) and `etiology_zh` (3912 chars):
`cond.pms`, `cond.irregular_menstruation`, `cond.female_infertility`,
`cond.recurrent_pregnancy_loss`, `cond.chronic_pelvic_pain`. True home per
the ledger's own title-match analysis: `cond.irregular_menstruation` —
confirmed independently by that record already carrying full, real,
**already-bilingual** content (`western_pathology_en` 1738 chars,
`etiology_en` 11119 chars — its own distinct, much longer essay; only the
`_zh` values happened to byte-match the shared essay in the other 4 records'
copies before this move, and are unaffected/untouched by this commit). The
other 4 records' copies are each archived into their own
`import_artifacts` (local, distributed — not consolidated onto
`irregular_menstruation`, since that would mean 4 redundant byte-identical
copies sitting on one record with no local trace on the records that
actually held the misfile), both fields cleared to `""` on each of the 4.

### Text-volume conservation (item 2 + item 1 combined, whole-dataset)

Global total across all 505 records' `western_pathology_zh` +
`etiology_zh` + `western_pathology_en` + `etiology_en` + `import_artifacts[].text`:
**292192 chars before batch 1 → 292192 chars after batch 1 (commits A+B
combined)** — exact conservation, nothing vanished. Per-record deltas are
non-zero only where content crossed a record boundary (`cond.heart_failure`
−765 / `cond.palpitations` +765; `cond.male_infertility` −3210 /
`cond.erectile_dysfunction` +3210) — every other touched record's own total
(clinical fields + its own `import_artifacts`) is unchanged, confirming
same-record moves lost nothing either.

### Validator tail — commit B (item 2 only, cumulative with commit A)

```
validate-condition-standard — data/pathology/condition_canon_shortlist.json
scope: all categories · 505 records · 414 clean

C4  NO RED FLAGS (safety) — 51 defect(s) across 51 record(s)
C5  _zh filled but _en empty — 126 defect(s) across 65 record(s)
C10  content shared verbatim across records (boilerplate/misfiled) — 129 defect(s) across 67 record(s)

FAIL — 306 blocking defect(s).
```

Commit B delta: C4 51→51 (flat), C5 139→126 (−13: 1 heart_failure +
2 post_covid + 2 male_infertility + 8 the-7-way-remainder = 13), C10
147→129 (−18: asthma/post_covid pair and male_infertility/erectile_dysfunction
pair fully resolved, and the 7-way-essay's shared-group size shrank from
5-sharing to 1-owner on both fields — removes those duplicate-pair/group
C10 hits), total blocking 337→306 (−31).

Cumulative (batch 1, commits A+B vs the branch-tip baseline): C5 203→126
(−77), C10 147→129 (−18), C4 51→51 (flat, out of scope this batch), total
blocking 401→306 (**−95**).

```
validation ratchet — defect counts vs committed baseline
  BETTER   conditions   401 → 306   (−95)
  flat     patterns     0 / tdis 0 / symptoms 0 / naming 1
PASS — no regressions (and something improved; run --update to lock it in).
```

```
validate-content-junk: PASS — no scraped header tokens in content arrays.
validate-relations: Relation validation passed. (unchanged link counts)
git diff --check: clean, no whitespace errors.
```

No C8 (unknown field) defects appeared at any point — confirms the
`import_artifacts` field name is validator-approved per the branch-tip
commit `010f930`, as expected.

## Explicitly out of scope this batch (left untouched, for the record)

- The 138-field C10 boilerplate bucket (the generic 21/24-char sentences
  shared by ~57 records, plus the pcos/oligomenorrhea/thin_endometrium and
  copd/chronic_cough/post_viral_cough C10 groups, plus the 4 headache-group
  `western_pathology_zh` fields excluded above) — batch 2, needs the
  source-reuse map per the dispatch instructions.
- `cond.asthma` and `cond.irregular_menstruation` — confirmed byte-identical
  to their pre-batch-1 state (untouched), verified programmatically.
- No content invented anywhere; every cleared field is an honest gap.

