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

## Item 2 — misfiled essays (commit B, cross-record moves; see follow-up commit)

Four named cross-contamination flags from `COND_INGESTION_LEDGER.md`, each
resolved per the task's move-first-then-clear procedure. Documented in full
after commit B lands (see below in this same file, appended).
