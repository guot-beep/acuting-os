---
name: acuting-condition-fill
description: Fill and repair AcuTing OS condition and TCM pattern cards in data/pathology/ with entity-type separation, structured red flags, resolved pattern links, bilingual pairing, per-field provenance, and validator-gated small batches. Use when working on any 病症 / 西醫病名 / 中醫病名 / 證型 record, or when clearing defects reported by scripts/validate-condition-standard.js.
---

# AcuTing condition & pattern fill

**This skill defines the PROCESS. The FORMAT lives in
[`docs/CONDITION_CARD_TEMPLATE.md`](../../docs/CONDITION_CARD_TEMPLATE.md).**
If this file and the template ever disagree, **the template wins** — and say so
in the handoff so one of them gets fixed. Never restate the field table here;
two copies of a schema always drift.

Treat each record as **source reconciliation, not template filling**. Ting has
52 course handouts in `curriculum/conditions/` — that is Tier-1 material she paid
tuition for. Use it before any website.

## Start every session

1. Read, in this order:
   [`docs/AI_CONSTITUTION.md`](../../docs/AI_CONSTITUTION.md) →
   [`docs/CONDITION_CARD_TEMPLATE.md`](../../docs/CONDITION_CARD_TEMPLATE.md) →
   the newest `PROJECT_LOG.md` entry.
2. `git status --short --branch`. Pull first. Open your own branch.
3. Run the validator and take your batch from the worklist:

   ```bash
   export PATH="/c/Program Files/nodejs:$PATH"     # Bash — node is not on PATH
   node scripts/validate-condition-standard.js --worklist --category gyn_fertility --all
   ```

4. Read [references/entity-and-redflags.md](references/entity-and-redflags.md)
   before your first batch — it covers the two judgment calls that go wrong most.

## Your files — nothing else

**Allowed:** `data/pathology/**` · `data/config/tcm_pattern_canon.json` ·
`data/config/pattern_alias_map.json`

**Forbidden:** `app.js` · `index.html` · `styles.css` · `js/**` ·
`scripts/**` · `docs/**` (except appending at the TOP of `PROJECT_LOG.md`) ·
`data/acupoints/**` · `data/formulas/**` · `data/herbs/**` ·
`data/clinical_cases/**` · `curriculum/**` (read-only, and never stage it)

Those other `data/` folders belong to another line that is writing in them right
now. Touching them is how merge crises start.

## Blocking prerequisite — D10 before any pattern link

Check whether `data/config/pattern_alias_map.json` exists.

**If it does not, that is the whole first task.** Patterns currently live in two
incompatible id namespaces (`pattern.<english_slug>` vs `pat.<中文>`, zero
overlap — see `DECISIONS.md` D10). Writing pattern links before the map exists
means every link is a coin flip, and reconciling later touches every condition
record.

Build the map first: for each `pat.*` id in `tcm_pattern_canon.json`, either map
it to an existing `pattern.*` id, or register a new `pattern.<english_slug>` in
`pattern_registry.json`. **Never re-id and never delete** an existing record
(D1/D6). `方證` (桂枝湯證) is not a `證候` — leave formula-patterns out of the
pattern registry entirely.

## Research one record

Keep the layers distinct and never let a later layer overwrite an earlier one:

1. **NCBAHM outline** — scope and priority only. Being listed is not content.
2. **`curriculum/conditions/`** — Tier-1. Search the English name, the Chinese
   name, and the abbreviation (the filenames are terse: `DYSMENO.DOC`,
   `U_BLEED.DOC`, `LBP1.doc`). A handout about a *different* condition that
   mentions this one is not evidence for this one.
3. **CloudTCM / American Dragon** — depth, only via an exact detail page.
4. Anything else — only with an exact URL, recorded.

If nothing is found, **record the absence**: which sources were searched, on what
date, with what result. An explicit source gap is content. A silent blank is not.

## Fix in this order

The validator's error codes are ordered by cost of getting them wrong:

1. **C4 red flags (95 records)** — safety first. See the reference file.
2. **C3 `entity_type` (150 records)** — biomedical_condition vs tcm_disease.
3. **C7 source drift (85)** — fold `exact_source_url` / `source_urls` /
   `source_links` into `sources`. **Move the value first, then remove the old
   field.** Reversing that order is how content gets dropped.
4. **C5 bilingual (300)** — `etiology_zh` and `western_pathology_zh` exist on
   150/150 with no English at all. Translate from the record's own Chinese and
   its cited source; do not paraphrase from memory.
5. **N1** — lift inline `tcm_patterns` blobs into registered `pattern.*` ids and
   add them to `related_patterns`. Keep the blob (provenance); never navigate by it.

## Vertical slice before volume

Do **`gyn_fertility` (25 records) to zero defects first**, then stop and report.

Reason: it is the only batch that was ever filled, it is closest to Ting's
ABORM track, and it is what she will actually see in clinic from 2026-09-05.
One chain proven end to end (condition → pattern → points → formula → red flags)
makes the other 125 a copy of a known-good process. 150 half-finished records
make nothing.

Batch size: **10–15 records**, then validate, commit, push, handoff. Never 150.

## Never invent

- No red flag, referral threshold, ICD hint, lab value, or diagnostic criterion
  from model memory. Cite or record the gap.
- Two sources disagree → **record both with attribution**. Never silently pick
  one, never present one source's claim as consensus.
- **No one-to-one TCM/biomedical equivalence.** 偏頭痛 ≠ 肝陽上亢. Use
  possible_overlap / symptom_overlap / clinical_correlation.
- Uncertainty stays uncertainty: mechanism ≠ effect, animal study ≠ clinical
  evidence, "a teacher said" ≠ RCT.
- A blank contraindication field is not proof of safety.

## Validate and ship

```bash
export PATH="/c/Program Files/nodejs:$PATH"
node scripts/validate-condition-standard.js --worklist --category <cat> --all
node scripts/build-data.js
node scripts/validate-relations.js
node scripts/validate-content-junk.js
git diff --check
```

**Validator PASS ≠ no loss.** The acupoint safety fields were overwritten on
285/361 records with every validator green, because each string was different.
**Diff your own batch and confirm no field got shorter or emptied.**

Then prepend to `PROJECT_LOG.md` (top of file, never edit anyone else's entry):

```
# YYYY-MM-DD <agent> — conditions <category> batch N
- Records touched: <ids>
- Defect counts before → after, per code (C4 95→80, C3 150→135, …)
- Source gaps found and how they were recorded
- Validation: which commands, PASS/FAIL
- Next batch
```

## Report numbers, never "complete"

Per-code counts, not summaries. "25/25 gyn at zero defects; C4 95→70 repo-wide;
12 records have no red flags in any source, recorded as explicit gaps" — never
"conditions done". Ting decides the next move from these numbers; a wrong number
makes her next decision wrong too.
