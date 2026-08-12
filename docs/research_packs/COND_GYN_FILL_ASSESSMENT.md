# COND_GYN_FILL_ASSESSMENT — assessing `codex/condition-gyn-fill-2026-08-08`

Date: 2026-08-12 · Branch: `codex/gyn-fill-integration` (from `origin/codex/pattern-v2` @ `d5d014e3`)
Sibling: `origin/codex/condition-gyn-fill-2026-08-08` @ `829a8b9d` (2 commits)
Merge base: `a4cd0650` (clean 3-way base — sibling never diverged structurally)

This is an **assessment ledger first**. It records what was rejected as carefully as what
was taken, because "we already have better" is the finding, not an absence of one.

---

## 0. Scope of the sibling branch

`git diff --stat a4cd0650 origin/codex/condition-gyn-fill-2026-08-08`

```
 PROJECT_LOG.md                                |   16 +
 data/generated/knowledge_data.js              |    4 +-
 data/pathology/condition_canon_shortlist.json | 2460 +++++++++++++++++-
```

**25 records touched**, all `category: gyn_fertility`. No new ids, no deleted ids, no
id-format changes. Every touched id also exists on the integration branch, so nothing
had to be created.

Meanwhile the integration branch moved from **150 → 505 records** on the same file
(CR-010 Batches 01–06, the C4 red-flag registry integration, the CloudTCM cleanup
integration, and the eyes-on misfile-relocation batches). Supersession was expected and
is what the numbers show.

---

## 1. Method — why the merge unit is the bilingual pair, not the field

A naive per-field 3-way merge run earlier the same day manufactured **17 half-pairs**
that neither branch had: it took `*_en` from one side where `*_zh` was empty on the
other, producing C5/C9 defects out of thin air.

So this pass resolves at **pair granularity**. A pair (`X_zh` + `X_en`) is taken only
when **all** of these hold, checked by assertion in the merge script — any violation
aborts the run rather than degrading:

1. the sibling has **both** sides non-empty;
2. ours has **both** sides empty;
3. the pair is not a field ours deliberately emptied and archived to `import_artifacts`;
4. for array pairs, `len(_zh) == len(_en)` (CLAUDE.md index alignment);
5. for object pairs, the key sets match.

Running the *field*-level classifier for comparison gave 50 "additive" fields; the
*pair*-level classifier gives **32 fields (16 pairs)**. The 18-field gap is exactly the
set of half-pairs the naive method would have manufactured again.

Archive detection normalizes text (strips HTML entities, tags, all whitespace and
punctuation, lowercases) before comparison — exact match under-detects because of
HTML-entity and OCR differences between the two lines' captures.

---

## 2. Classification counts

**Pair level (the decision unit) — 100 pairs the sibling touched:**

| Class | Pairs | Meaning |
|---|---|---|
| **ADDITIVE** | **16** | ours empty both sides, never archived → taken |
| **SUPERSEDED / CONFLICT** | **69** | both non-empty and different → ours kept |
| **OURS_EMPTIED_ARCHIVED** | **15** | ours deliberately emptied + archived → **not taken** (§4) |

**Record level — 25 records:**

| Class | Records |
|---|---|
| ADDITIVE (at least one pair taken) | **8** |
| SUPERSEDED / CONFLICT only (nothing taken) | **17** |

---

## 3. Per-id table

`*` = ours is still **identical to the merge base** for that pair, i.e. our line has not
yet reworked it (see §5 — these are the three cards still carrying unrelocated CloudTCM
essays).

| id | ADDITIVE pairs | CONFLICT pairs | ours emptied+archived | outcome |
|---|---|---|---|---|
| `cond.pcos` | — | risk_factors, acupuncture_scope | western_pathology, etiology | took nothing |
| `cond.endometriosis` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.uterine_fibroids` | — | western_pathology*, etiology*, risk_factors, acupuncture_scope | — | took nothing |
| `cond.primary_dysmenorrhea` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.pms` | **risk_factors, acupuncture_scope** | — | western_pathology, etiology | **took 2 pairs** |
| `cond.irregular_menstruation` | **risk_factors, acupuncture_scope** | western_pathology* | etiology | **took 2 pairs** |
| `cond.menorrhagia` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.oligomenorrhea` | **risk_factors, acupuncture_scope** | western_pathology*, etiology* | — | **took 2 pairs** |
| `cond.amenorrhea` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.female_infertility` | **risk_factors, acupuncture_scope** | — | western_pathology, etiology | **took 2 pairs** |
| `cond.male_infertility` | **risk_factors, acupuncture_scope** | — | western_pathology, etiology | **took 2 pairs** |
| `cond.diminished_ovarian_reserve` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.ivf_support` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.recurrent_pregnancy_loss` | **risk_factors, acupuncture_scope** | — | western_pathology, etiology | **took 2 pairs** |
| `cond.luteal_phase_defect` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.menopause_syndrome` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.hyperemesis_gravidarum` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.breech_presentation` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.postpartum_hypolactation` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.chronic_pelvic_pain` | **risk_factors, acupuncture_scope** | — | western_pathology, etiology | **took 2 pairs** |
| `cond.pid_chronic` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.vulvovaginal_candidiasis` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.thin_endometrium` | **risk_factors, acupuncture_scope** | — | western_pathology, etiology | **took 2 pairs** |
| `cond.pmdd` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |
| `cond.secondary_dysmenorrhea` | — | western_pathology, etiology, risk_factors, acupuncture_scope | — | took nothing |

The sibling did **not** touch `red_flags_*` on any record. Our C4 red-flag registry
integration (`red_flag_refs`, `rf.*` ids, wiring validator) is untouched by this merge.

---

## 4. Judgment call A — the 15 emptied-and-archived pairs: NOT TAKEN

These are `western_pathology` / `etiology` on 8 cards where **our** line found a CloudTCM
blog essay (member testimonials, `[@ad:1]` ad codes, whole-article misfiles) in a clinical
field, moved it to `import_artifacts`, and left an honest gap. The sibling independently
wrote short fresh clinical replacements for the same fields.

Per the brief, the sibling's fresh content is **not automatically a regression** — but
taking it must be conscious. **Default applied: not taken.** Reasoning:

- Our emptying was a *deliberate attribution decision* recorded with a `reason` string
  naming the true home card and the ledger entry. Refilling those fields from a branch
  that never saw that decision silently re-opens a closed question.
- Our archive notes state the field was cleared "with no replacement content invented
  this batch". The right next step is a sourced fill under the current ledger process,
  not an import that bypasses it.
- The two lines' judgments **agree**, which is the reassuring part: on
  `cond.thin_endometrium` our archive note says the amenorrhea/scanty-menses pages were
  "removed as misfiled substitutes", and the sibling's own `acupuncture_scope.note`
  independently says `不採用閉經或月經稀少頁面替代`. Two lines, same conclusion, reached
  separately.

**For Ting:** these 15 pairs are a *ready-made, already-drafted* fill for 8 honest gaps on
her niche cards. They are short, sourced, and bilingual. They are sitting in the sibling
branch and can be taken in a follow-up batch on her word. This ledger is the record of
where they are. Ids: `pcos`, `pms`, `irregular_menstruation`, `female_infertility`,
`male_infertility`, `recurrent_pregnancy_loss`, `chronic_pelvic_pain`, `thin_endometrium`.

## 5. Judgment call B — the 5 `oursEqBase` conflict pairs: NOT TAKEN

On `cond.uterine_fibroids` (western_pathology, etiology), `cond.oligomenorrhea`
(western_pathology, etiology) and `cond.irregular_menstruation` (western_pathology), ours
is byte-identical to the merge base: **we still carry the long CloudTCM essay** (up to
2,416 zh / 11,435 en chars). The sibling replaced each with ~90–320 chars of clean
clinical prose.

Taking those would be **short overwriting long with no archive first** — constitution red
line 3 in its exact shape. The correct sequence is archive-then-replace, and the archive
step needs the misfile analysis that our line applies per-record via the ledger.

**For Ting:** three gyn cards still hold unrelocated CloudTCM blog essays in clinical
fields. They are a known backlog item, not a regression introduced here.

## 6. Judgment call C — the 64 remaining conflict pairs: ours kept

`risk_factors` / `acupuncture_scope` on 17 cards were filled by **both** lines
independently after the fork. Ours is longer on 44 of 64 and is the product of the
eyes-on fix batches. Neither version is defective; picking per-pair by taste would
produce a card whose voice changes field to field. Ours kept wholesale.

## 7. Judgment call D — `field_sources.source_gaps`: NOT TAKEN

Four sibling records carry a `source_gaps` note inside `field_sources` (e.g. "No exact
local curriculum, CloudTCM, or American Dragon thin-endometrium detail page was found").
That is a claim about the **whole card's** sourcing on the sibling's tree, not about the
two pairs taken, and our tree has since acquired sources theirs never saw. Skipped
rather than imported as a possibly-stale global assertion.

---

## 8. What was actually taken

**16 pairs = 32 fields across 8 records**, plus their attribution:

- `risk_factors_zh` + `risk_factors_en` — structured per §5.5 (`factor` / `direction` /
  `modifiable` / `source`), 2–3 entries each, zh/en index-aligned.
- `acupuncture_scope_zh` + `acupuncture_scope_en` — structured per §5.6 (`can_treat` /
  `precautions` / `co_management` / `evidence` / optional `source` / `note`), key sets
  identical across languages.
- **32 `field_sources` keys** added, for exactly the fields taken and nothing else.
- **15 URLs appended to `sources`** (append-only union, dedup by exact string) — only the
  URLs cited by the `field_sources` entries taken.

Nothing else on any record was modified. Verified programmatically: **0 fields shrank,
0 records lost, 505 → 505.** The only 14 removed lines in the git diff are re-punctuation
from array append (trailing comma) and `"field_sources": {}` opening into a populated
object.

`import_artifacts` was **not** written to at all — the destination fields were empty, so
nothing was displaced and there was nothing to archive. No double-archiving risk in this
merge.

### Why this content passed the quality bar

- **Not boilerplate** (red line 6): every card's `can_treat` / `precautions` /
  `co_management` is condition-specific. `male_infertility` warns against substituting
  erectile-dysfunction material; `thin_endometrium` warns against treating one thickness
  number as prognosis; `female_infertility` explicitly refuses the course handout's
  generic "2–3 cun lower abdomen" depth as an executable technique.
- **Sourced**: womenshealth.gov, NICHD, ACOG, ASRM, PubMed/PMC, and named curriculum
  handouts. No invented numbers.
- **Does not overclaim** (red line 9, §5.6): `evidence: unknown` where efficacy was not
  appraised — the correct initial value, not a defect. Every `can_treat` states what
  acupuncture does **not** replace.
- **Does not decide for the prescriber**: `co_management` says coordinate/refer, never
  "stop the medication".

---

## 9. Verification

| Check | Before | After |
|---|---|---|
| `validate-condition-standard.js` blocking | **4** (C5 ×4 on 3 records) | **4** (same 3 records) |
| records / clean | 505 / 502 | 505 / 502 |
| new C5/C9/C11/C12 defects | — | **0** |
| `audit-cr010…maturity.js` full_detail | **143** | **151** (+8) |
| partial | 100 | 92 (−8) |
| skeleton | 262 | 262 |
| `validate-content-junk.js` | PASS, 8 control chars (frozen baseline) | PASS, **8** (unchanged) |
| `check-validation-ratchet.js` | PASS — conditions 4 | PASS — conditions 4 (no `--update`) |
| CI green job (28 steps) | — | **28 / 28 OK** |

The blocking count did not fall, so the ratchet baseline was **not** updated — nothing
got better by its measure, and lowering a baseline you did not earn is how a ratchet
stops meaning anything.

### Spot checks (all hold)

- `cond.breech_presentation.acupoint_protocols` `[]` with 5 `import_artifacts` ✓
- `cond.depression` `etiology_zh` + `etiology_en` both empty, 4 artifacts archived
  (`etiology_zh`, `western_pathology_zh`, `etiology_en`, `western_pathology_en`) ✓
- `cond.bppv` sustained-vertigo red flag `urgency_level: urgent` (3 matching entries) ✓
- record count **505** ✓

### Eyes-on read (2 cards, whole card, per CLAUDE.md)

**`cond.male_infertility`** — Chinese in the taken fields is real, idiomatic clinical
Traditional Chinese (精索靜脈曲張, 未下降睪丸, 無精症, 輸精管阻塞). No mojibake, no English
sentences inside `_zh`, no template phrasing, on-topic throughout. English twin is a true
translation, not a paraphrase drifting in meaning.
*Pre-existing issues seen while reading (NOT introduced here, NOT fixed here):*
`classical_references_zh` is entirely 陽痿 (impotence) classical quotations — wrong topic
for a male-infertility card, and ironically the exact substitution the sibling's own
`precautions` line warns against. `herb_formulas` holds 50 scraped formula names with no
curation.

**`cond.thin_endometrium`** — taken content is on-topic and specific (endometrial
curettage, intrauterine adhesions, chronic endometritis, measurement timing), sourced to
PubMed 31029557 and PMC12697521, and refuses the "thickens the lining" claim outright.
Chinese clean. The two `import_artifacts` entries read as honest, well-reasoned
relocations with the true home card named.
*Pre-existing issue:* `classical_references_zh` is 血枯經絕 / 月水不利 material — amenorrhea
and scanty menses, not lining thickness — and contains a raw `&hellip;` HTML entity. The
archive pass cleared `etiology_zh` and `western_pathology_zh` on this card but did not
reach `classical_references_zh`.

---

## 10. Needs Ting

1. **The 15 emptied-and-archived pairs (§4)** — a drafted, sourced, bilingual fill for 8
   honest gaps on her niche cards, deliberately left on the table. One word takes them.
2. **Three cards still holding unrelocated CloudTCM essays (§5)**: `uterine_fibroids`,
   `oligomenorrhea`, `irregular_menstruation`.
3. **`classical_references_zh` is wrong-topic on at least 2 gyn cards** (§9 eyes-on).
   The archive passes covered `etiology` / `western_pathology`; `classical_references`
   was never in scope. Worth a sweep across the gyn set.
4. The sibling branch also carries a `PROJECT_LOG.md` entry describing its own work.
   Not merged — the log is append-at-top and shared; merging a 3-day-stale entry into
   today's log would misdate it.
