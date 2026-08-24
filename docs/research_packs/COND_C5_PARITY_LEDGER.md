# Condition C5 zh→en Parity Ledger

Scope: `data/pathology/condition_canon_shortlist.json` (505 records).
Validator: `node scripts/validate-condition-standard.js` (rules in
`docs/CONDITION_CARD_TEMPLATE.md`).

Branch: `codex/cond-c5-parity-1` (from `origin/codex/pattern-v2` @ `0074194`).

---

## §0 Scope — the 90/47 scan

Baseline run, unmodified working tree:

```
node scripts/validate-condition-standard.js
```

```
scope: all categories · 505 records · 440 clean
C4  NO RED FLAGS (safety) — 42 defect(s) across 42 record(s)
C5  _zh filled but _en empty — 90 defect(s) across 47 record(s)
C10 content shared verbatim across records (boilerplate/misfiled) — 93 defect(s) across 49 record(s)
FAIL — 225 blocking defect(s)
```

`node scripts/check-validation-ratchet.js` baseline: `flat conditions 225` — PASS
(no regression vs committed baseline; this run establishes what batch-1 must not
make worse).

Worklist order (`--worklist --all`, category-alphabetical, the order the
mission's "first 25 records" is taken from):

```
cardio: cond.cad, cond.varicose_veins, cond.poor_circulation
derm: cond.alopecia, cond.rosacea, cond.pruritus
endo_metabolic: cond.metabolic_syndrome, cond.obesity, cond.dyslipidemia, cond.hpa_dysregulation, cond.edema_fluid
gi: cond.nafld, cond.gallbladder_dysfunction, cond.cinv, cond.post_op_ileus, cond.food_sensitivity
gyn_fertility: cond.postpartum_hypolactation, cond.pid_chronic, cond.vulvovaginal_candidiasis, cond.thin_endometrium, cond.pmdd, cond.secondary_dysmenorrhea
neuro: cond.stroke_rehab, cond.diabetic_neuropathy, cond.postherpetic_neuralgia, cond.essential_tremor, cond.migraine_vestibular
pain_msk: cond.whiplash, cond.rotator_cuff, cond.piriformis_syndrome, cond.tension_headache, cond.migraine, cond.cluster_headache
psych_sleep: cond.panic_disorder, cond.stress_burnout, cond.chronic_fatigue, cond.smoking_cessation, cond.somatic_symptom, cond.poor_memory, cond.alcohol_use
respiratory: cond.common_cold, cond.chronic_sinusitis, cond.copd, cond.chronic_cough, cond.post_viral_cough
uro_renal: cond.interstitial_cystitis, cond.urinary_retention
```

**Field-shape finding (checked before any translation work started):** all 90
C5 defects in the entire file, with no exception, land on exactly two field
pairs — `western_pathology_zh`→`_en` (47 occurrences) and `etiology_zh`→`_en`
(43 occurrences). No `summary_zh`, `western_context_zh`, `risk_factors_zh`,
`red_flags_zh`, `acupuncture_scope_zh`, or `aliases_zh` field ever appears in
the C5 list. Confirmed by direct field-count over the validator's own defect
list: `grep -oE '_zh' | sort | uniq -c` → `43 etiology_zh`, `47
western_pathology_zh`, sum 90 = total C5 defects.

**Cross-check against C10 (verbatim-shared) for every one of those 90
occurrences, across all 47 records — not just batch 1 — found ALL 90 are
C10-flagged.** i.e. the entire C5 backlog for this file is boilerplate or
misfiled text, zero exceptions. Confirmed two ways: (a) per-field replica of
the validator's own `C10_FIELDS` / `sharedValues` logic run over the live
file, (b) `grep -c BOILERPLATE` on the generated per-record dump equals the
total defect count (90 of 90).

This changes what batch-1 can deliver: the template's own translation rule
(mirrored in this task's brief) says a C10-flagged field must be **skipped,
not translated** — translating a placeholder or a misfiled paragraph would
launder junk into a second language instead of fixing it. Since every C5
field in the first 25 records (and in the other 22 records too) is C10, batch
1 contains **zero fields eligible for translation**. See §1/§2.

---

## §1 Batch-1 table — first 25 records (worklist order)

All 25 records below are `review_status` context/adjunctive cards drawing
from the same shortlist pass; every C5 field on every one of them resolves to
one of two known-boilerplate clusters (cluster A/B, §2). **Action column is
SKIP for all 50 field-occurrences — no `_en` was written.**

| # | id | name_zh | C5 field(s) | cluster | action |
|---|---|---|---|---|---|
| 1 | cond.cad | 冠狀動脈疾病（輔助文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 2 | cond.varicose_veins | 靜脈曲張（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 3 | cond.poor_circulation | 末梢循環不良（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 4 | cond.alopecia | 斑禿（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 5 | cond.rosacea | 酒糟性皮膚炎（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 6 | cond.pruritus | 慢性搔癢（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 7 | cond.metabolic_syndrome | 代謝症候群（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 8 | cond.obesity | 肥胖／體重管理 | western_pathology_zh, etiology_zh | A | SKIP |
| 9 | cond.dyslipidemia | 血脂異常（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 10 | cond.hpa_dysregulation | 下視丘-腦下垂體-腎上腺軸失調（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 11 | cond.edema_fluid | 特發性水腫（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 12 | cond.nafld | 非酒精性脂肪肝（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 13 | cond.gallbladder_dysfunction | 膽道功能障礙（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 14 | cond.cinv | 化療相關噁心（輔助文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 15 | cond.post_op_ileus | 術後腸麻痺（輔助文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 16 | cond.food_sensitivity | 食物不耐（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 17 | cond.postpartum_hypolactation | 產後缺乳 | western_pathology_zh, etiology_zh | A | SKIP |
| 18 | cond.pid_chronic | 慢性骨盆腔炎後遺（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 19 | cond.vulvovaginal_candidiasis | 外陰陰道念珠菌感染（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 20 | cond.thin_endometrium | 子宮內膜偏薄（文件情境） | western_pathology_zh, etiology_zh | B | SKIP |
| 21 | cond.pmdd | 經前不悅症（文件情境） | western_pathology_zh, etiology_zh | A | SKIP |
| 22 | cond.secondary_dysmenorrhea | 繼發性痛經 | western_pathology_zh, etiology_zh | A | SKIP |
| 23 | cond.stroke_rehab | 中風後復健 | western_pathology_zh, etiology_zh | A | SKIP |
| 24 | cond.diabetic_neuropathy | 糖尿病周邊神經病變 | western_pathology_zh, etiology_zh | A | SKIP |
| 25 | cond.postherpetic_neuralgia | 帶狀皰疹後神經痛 | western_pathology_zh, etiology_zh | A | SKIP |

**zh→en column intentionally omitted**: nothing was translated. Writing an
English rendering of either cluster's text would be laundering boilerplate
(cluster A) or misfiled content (cluster B) into a second language, which the
mission brief explicitly forbids ("do not launder boilerplate into English").

---

## §2 Skipped-boilerplate rows — cluster detail

### Cluster A — generic filler pair, 39 records file-wide, 24 of 25 in batch 1

`western_pathology_zh` verbatim in 39/505 records:

> 相關系統功能障礙及發炎或代謝異常導致的臨床症狀。

`etiology_zh` verbatim in 39/505 records (same 39, same records — confirmed
by manual spot check on cond.cad, cond.rotator_cuff, cond.migraine):

> 正氣不足，臟腑功能失調，氣血津液運化不利。

Both sentences are content-free placeholders — they say nothing specific to
any one condition (no organ, no pattern name, no mechanism). This is the
exact "structural debt" the template doc already flags in §3.2: *"etiology_zh
與 western_pathology_zh 在 150/150 都有內容，但兩者的 _en 完全不存在 — 300
個 C5 缺陷。這是這一層最大的結構債。"* Translating either sentence would
produce a fluent-looking English placeholder that still says nothing —
exactly the C10 warning's "makes the C5 translate-the-missing-_en backlog
look like translation work when the Chinese source itself is fake-filled."

Records affected in batch 1 (24 — all of batch 1 except thin_endometrium):
cad, varicose_veins, poor_circulation, alopecia, rosacea, pruritus,
metabolic_syndrome, obesity, dyslipidemia, hpa_dysregulation, edema_fluid,
nafld, gallbladder_dysfunction, cinv, post_op_ileus, food_sensitivity,
postpartum_hypolactation, pid_chronic, vulvovaginal_candidiasis, pmdd,
secondary_dysmenorrhea, stroke_rehab, diabetic_neuropathy,
postherpetic_neuralgia.

### Cluster B — misfiled content, cond.thin_endometrium (1 of 25 in batch 1)

`cond.thin_endometrium`'s `western_pathology_zh` and `etiology_zh` are not
placeholders — they are full paragraphs, but paragraphs about **月經稀少/閉經
(oligomenorrhea/amenorrhea)**, not about a thin endometrial lining:

- `western_pathology_zh` (shared verbatim by 3 records): opens "月經稀少是指
  月經量明顯減少，甚至經期縮短至不足兩天…" — this is oligomenorrhea's western
  framing, misfiled onto the thin-endometrium card.
- `etiology_zh` (shared verbatim by 2 records): opens "月經稀少或閉經，絕對是
  困擾中國人千年以上的議題…" citing 《金匱要略》/《諸病源候論》 on 經水不利 —
  again oligomenorrhea/amenorrhea etiology, not thin-endometrium etiology.

Translating this would produce English text that reads fluently but describes
the wrong condition on `cond.thin_endometrium`'s card — worse than a blank
field. Per template §3.5.5 (`import_artifacts`), the correct fix is a
relocation pass (move the paragraph to whichever `cond.*` record it actually
describes, or to `import_artifacts` if the true owner can't be identified,
then backfill `cond.thin_endometrium`'s own fields from a real source) — not
a translation pass. Flagging for a separate ledger
(`COND_INGESTION_LEDGER`/misfile-relocation batch per §3.5.5), out of scope
for this zh→en parity batch.

**RELOCATED 2026-08-11** (branch `codex/cond-thin-endometrium-relocate`,
commit see `git log -1 --oneline` on that branch — not pushed as of this
entry). True owner confirmed by exact-match scan: both fields are
byte-identical to `cond.oligomenorrhea` (月經過少), which already holds this
text as real, complete, bilingual content (`western_pathology_en` /
`etiology_en` both filled) — left untouched, nothing backfilled there.
`western_pathology_zh` is a 3-way share (`cond.thin_endometrium`,
`cond.pcos`, `cond.oligomenorrhea`); `etiology_zh` is a 2-way share
(`cond.thin_endometrium`, `cond.oligomenorrhea`). Action taken on
`cond.thin_endometrium` only (the one record this ledger entry and the
mission authorized) — `cond.pcos`'s copy of `western_pathology_zh` is a
separate, not-yet-authorized misfile and was left alone.

- Read the whole record end-to-end first: confirmed both fields' openings
  match this section's description exactly (etiology_zh opens「月經稀少或閉經，
  絕對是困擾中國人千年以上的議題…」; western_pathology_zh opens「月經稀少是指
  月經量明顯減少…」) — no stop condition triggered.
- Salvage check: read both paragraphs in full: no sentence specific to thin
  endometrial lining (vs. oligomenorrhea/amenorrhea) found — nothing
  salvaged into `cond.thin_endometrium`'s own fields.
- Moved verbatim into `cond.thin_endometrium.import_artifacts` (2 entries:
  `{original_field, text, reason, moved_at: "2026-08-11"}`), matching the
  convention already used by the 39 other `import_artifacts` records in this
  file (e.g. `cond.pms`, `cond.tension_headache`). `etiology_zh` and
  `western_pathology_zh` cleared to `""` on `cond.thin_endometrium` —
  `related_patterns` (already carries a 45-char array of Chinese source
  attribution)/`etiology_en`/`western_pathology_en` did not exist beforehand
  so no dangling half-pair was created (C5 was already the defect being
  cleared, not introduced).
- Validators after the change: `validate-condition-standard.js` total
  blocking **225 → 220** (C5 90→88, C10 93→90, C4 unchanged 42/42), 440→441
  clean records. `check-validation-ratchet.js`: **BETTER conditions
  225 → 220 (−5), PASS**. `validate-content-junk.js`: PASS (pre-existing
  unrelated dosage-clause WARN only). `validate-relations.js`: PASS.
  `build-data.js`: 505 condition records unchanged in count.

### File-wide picture (not just batch 1)

The same per-field C10 cross-check was run over all 90 C5 occurrences across
all 47 records (not only the 25 in batch 1): **90 of 90 are C10-flagged.**
Cluster A itself is exactly 39 records file-wide (same 39 ids on both
`western_pathology_zh` and `etiology_zh` — verified by set intersection, not
just matching counts): 24 fall inside batch 1, the other 15 are
cond.whiplash, cond.rotator_cuff, cond.piriformis_syndrome,
cond.panic_disorder, cond.stress_burnout, cond.chronic_fatigue,
cond.smoking_cessation, cond.somatic_symptom, cond.poor_memory,
cond.alcohol_use, cond.common_cold, cond.chronic_sinusitis,
cond.essential_tremor, cond.interstitial_cystitis, cond.urinary_retention —
i.e. batch 2 in worklist order runs straight into the same cluster again.
Beyond cluster A, a few smaller 2–3-record clusters exist (e.g. a shared
咳嗽/頭痛/偏頭痛 blog-style paragraph pattern noted independently by C10's own
top-shared-value scan) — all misfiled content of the same shape as cluster B,
none of it this-condition's-own content. **The entire C5 backlog on this file
is a content-sourcing problem,
not a translation problem** — no batch, taken in worklist order, will yield
translatable material until cluster A is replaced with real
`western_pathology_*`/`etiology_*` content per condition (§0 source
hierarchy: curriculum handouts → CloudTCM/American Dragon → other) and
cluster-B-style misfiles are relocated to their correct cards.

---

## §3 Fresh rescan after

No `data/**` writes were made in this batch — §1/§2 establish that 100% of
the assigned 25 records' C5 fields are correctly out of scope for translation
per the mission's own C10-skip rule. Rescan below is the unmodified baseline,
run again to confirm nothing drifted while the ledger was written:

```
node scripts/build-data.js
```
505 condition records unchanged (see §0 record count).

```
node scripts/validate-condition-standard.js
```
```
scope: all categories · 505 records · 440 clean
C4  NO RED FLAGS (safety) — 42 defect(s) across 42 record(s)
C5  _zh filled but _en empty — 90 defect(s) across 47 record(s)
C10 content shared verbatim across records (boilerplate/misfiled) — 93 defect(s) across 49 record(s)
FAIL — 225 blocking defect(s)
```
C5 90/47 unchanged · C4 42/42 unchanged · C10 93/49 unchanged · total blocking
225 unchanged (mission asked for these numbers "before→after"; before=after
because zero fields qualified for translation — see §0/§2 for why forcing a
change here would itself be a defect).

```
node scripts/check-validation-ratchet.js
```
```
flat     conditions   225
PASS — no regressions.
```

```
node scripts/validate-content-junk.js
```
(unchanged file → same as pre-batch baseline; no new junk introduced since no
edits were made)

```
node scripts/validate-relations.js
```
(unchanged file → same as pre-batch baseline)

**Recommendation for batch 2**: do not continue walking the C5 worklist in
this order expecting translation work — every record hits cluster A or a
cluster-B-style misfile. The unblocking move is a content-sourcing pass
(replace cluster A's two placeholder sentences per condition from curriculum
handouts / CloudTCM, per template §0 source hierarchy) followed by a
misfile-relocation pass (cluster-B-style records, into `import_artifacts` per
§3.5.5) — only after real, non-boilerplate `_zh` text exists per record does
a zh→en parity batch have anything legitimate to translate.
