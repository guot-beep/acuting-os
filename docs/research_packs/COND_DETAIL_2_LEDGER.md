# CR-010 Condition Detail Batch 01 (SOL) — Ingestion Ledger

Branch: `codex/cond-detail-2-sol01` off `origin/codex/pattern-v2` @ `354b844`.
Source pack: `docs/research_packs/CR010_CONDITION_DETAIL_BATCH01_SOL.md` +
`data/research_staging/cr010_condition_detail_batch01_SOL.json` (12 conditions).
Target file: `data/pathology/condition_canon_shortlist.json`.

## Exact-scan result (12 staged conditions vs 505 canon records)

| # | Staging suggested id | Resolved canon id | Ruling | Pre-batch status | Post-batch status |
|---|---|---|---|---|---|
| 1 | `cond.peptic_ulcer` | `cond.peptic_ulcer` | EXISTING (id resolves exactly) | DETAIL_PARTIAL (11/12, missing field_sources) | FULL_DETAIL_CANDIDATE |
| 2 | `cond.cholelithiasis` | `cond.gallstone_disease` | EXISTING under a different id — `aliases_zh` already carries "膽石症" and `aliases_en` carries "Cholelithiasis"; the record's own `western_context_zh` explicitly documents it is distinct from `cond.gallbladder_dysfunction`. Staging's suggested id was **not** created; no duplicate. | DETAIL_PARTIAL (11/12) | FULL_DETAIL_CANDIDATE |
| 3 | `cond.diverticular_disease` | `cond.diverticular_disease` | EXISTING (id resolves exactly), was a bare skeleton | SKELETON (score 0) | FULL_DETAIL_CANDIDATE |
| 4 | `cond.celiac_disease` | `cond.celiac_disease` | EXISTING (id resolves exactly), was a bare skeleton | SKELETON (score 0) | FULL_DETAIL_CANDIDATE |
| 5 | `cond.lactose_intolerance` | `cond.lactose_intolerance` | EXISTING (id resolves exactly), was a bare skeleton | SKELETON (score 0) | FULL_DETAIL_CANDIDATE |
| 6 | `cond.acute_pancreatitis` | `cond.acute_pancreatitis` | EXISTING (id resolves exactly) | DETAIL_PARTIAL (11/12) | FULL_DETAIL_CANDIDATE |
| 7 | `cond.cirrhosis` | `cond.cirrhosis` | EXISTING (id resolves exactly) | DETAIL_PARTIAL (11/12) | FULL_DETAIL_CANDIDATE |
| 8 | `cond.hepatitis_b` | `cond.chronic_hepatitis_b` | EXISTING under a different id — no `cond.hepatitis_b` record exists; the only close match is the chronic-specific skeleton `cond.chronic_hepatitis_b`. Staging content (which discusses both acute and chronic HBV) was **scoped down** to a chronic-HBV-focused card: acute presentation is described as context inside `western_context_zh/en` ("臨床定位" + "臨床表現"), but the card's identity, risk factors, and red flags stay chronic-HBV-specific to match the existing id's name (`name_zh: 慢性B型肝炎`). No `cond.hepatitis_b` or `cond.acute_hepatitis_b` record was created. | SKELETON (score 0) | FULL_DETAIL_CANDIDATE |
| 9 | `cond.chronic_kidney_disease` | `cond.chronic_kidney_disease` | EXISTING (id resolves exactly) | DETAIL_PARTIAL (11/12) | FULL_DETAIL_CANDIDATE |
| 10 | `cond.nephrolithiasis` | `cond.nephrolithiasis` | EXISTING (id resolves exactly) | DETAIL_PARTIAL (11/12) | FULL_DETAIL_CANDIDATE |
| 11 | `cond.gout` | `cond.gout` | EXISTING (id resolves exactly) | DETAIL_PARTIAL (11/12) | FULL_DETAIL_CANDIDATE |
| 12 | `cond.osteoporosis` | `cond.osteoporosis` | EXISTING (id resolves exactly) | DETAIL_PARTIAL (11/12) | FULL_DETAIL_CANDIDATE |

**Zero new `cond.*` records created.** All 12 staged conditions resolved to existing
canon records (10 by exact id match, 2 by name/alias match to a differently-named
existing id). Per the pack's own ingestion rule ("suggested IDs are not asserted as
canonical"), the 2 mismatches (#2, #8) were treated as EXISTING, not NEW.

## Commits

1. `70210a7` — Part A: `field_sources` added to the 8 DETAIL_PARTIAL records (#1, #2,
   #6, #7, #9, #10, #11, #12). These already had summary/western_context/
   western_pathology/etiology/risk_factors/red_flags/acupuncture_scope/sources
   filled bilingual from prior batches; only per-field provenance (`field_sources`,
   a C8-approved field) was missing, capping them at score 11/12. No content added,
   moved, or removed — richer existing content was left untouched, per constitution
   rule 3 (don't overwrite richer content with staging's shorter prefetch text).
2. `6da096f` — Part B: full bilingual content written for the 4 true skeletons
   (#3, #4, #5, #8) — summary/western_pathology/western_context/risk_factors/
   red_flags/acupuncture_scope/sign_symptom_ids/sources/field_sources.
   `review_status` moved `skeleton` → `draft` (content now claimed, C4 fully applies).

## Field mapping used (template §3, §8.2 ④)

- `overview_{zh,en}` → `summary_{zh,en}`
- `biomedical_pathophysiology_{zh,en}` → `western_pathology_{zh,en}`
- `diagnostic_signs_{zh,en}` + `diagnostic_tests_{zh,en}` + `treatment_principles_{zh,en}`
  → folded into `western_context_{zh,en}` as structured prose (臨床定位／臨床表現／
  重要特徵／診斷方法／鑑別診斷／西醫治療／編碼備註), matching the convention already
  established by `cond.gallstone_disease` and `cond.viral_hepatitis` — **no new field
  was invented**; the template has no separate diagnostic_signs/diagnostic_tests/
  treatment fields for `biomedical_condition` (§3.2), so this is the field's
  established prose home.
- `key_references` → `sources` (full "Authority — Title: URL" strings) + `field_sources`
  (per-field short-form citations, matching the existing `field_sources` convention
  seen on 37 other records, e.g. `cond.knee_osteoarthritis`, `cond.chronic_low_back_pain`).

## risk_factors — NOT in the staging pack, sourced live (§5.5 compliance)

The staging pack has no `risk_factors` field. For the 4 skeleton records, risk factors
were pulled from live fetches of the same NIDDK source family already cited in the pack
(top-tier, matching `sources`):
- Diverticular disease: `NIDDK — Symptoms & Causes of Diverticular Disease`
- Celiac disease: `NIDDK — Symptoms & Causes of Celiac Disease`
- Lactose intolerance: `NIDDK — Definition & Facts for Lactose Intolerance`,
  `NIDDK — Treatment for Lactose Intolerance`
- Chronic hepatitis B: `NIDDK — Hepatitis B` (transmission/high-risk-group section)

Every `risk_factors_zh/en` entry carries `factor`/`direction`/`modifiable`/`source`
per §5.5; none were invented beyond what these pages state.

## tcm_pathogenesis — dispositions (NOT written to canon)

All 12 staging records carry `tcm_source_status: "needs_textbook_source_review"`.
Per task instruction and constitution redline 9 (no West=TCM equivalence, no
uncertain-as-certain), **none of the 12 `tcm_pathogenesis_zh/en` seed texts were
written into `etiology_zh/en` or any other canon field.** They remain only in the
staging JSON and in this ledger as pending-review material:

| Condition | tcm_pathogenesis seed candidates (differential, not equivalence) | Disposition |
|---|---|---|
| Peptic ulcer disease | 肝胃不和、脾胃虛弱、瘀血阻絡 | pending textbook review |
| Cholelithiasis | 肝膽氣滯、濕熱、痰濁、瘀阻 | pending textbook review |
| Diverticular disease | 腸腑氣滯、濕熱、瘀血、脾虛 | pending textbook review |
| Celiac disease | 脾氣虛、脾陽虛、濕困 | pending textbook review |
| Lactose intolerance | 脾虛、寒濕、濕困、食積 | pending textbook review |
| Acute pancreatitis | 腑氣不通、濕熱、食積、氣滯血瘀 | pending textbook review |
| Cirrhosis | 氣滯、濕、水、瘀 + 肝脾腎虛損複合演變 | pending textbook review |
| Hepatitis B | 濕熱、肝鬱脾虛、瘀阻、正虛 | pending textbook review |
| Chronic kidney disease | 脾腎虛損、濕濁、水濕、瘀血 | pending textbook review |
| Nephrolithiasis | 下焦濕熱、氣滯、瘀阻、正虛（與「石淋」症狀層面重疊，非等同） | pending textbook review |
| Gout | 濕熱痹阻（急性）；痰濁、瘀血、脾腎虛（慢性反覆） | pending textbook review |
| Osteoporosis | 腎精不足、脾腎不足、瘀阻（非「腎虛＝骨質疏鬆」單一等同） | pending textbook review |

`related_patterns` was left empty for all 4 newly-filled skeletons (#3, #4, #5, #8) —
no canon-ready `pattern.*` linkage was asserted from unreviewed seed text.
`etiology_zh/en` was also left empty for these 4 (no staging field maps to it, and
it is not required for FULL_DETAIL_CANDIDATE under the audit script's scoring —
score 11/12 with all 4 hard gates met still qualifies).

## sign_symptom_ids added (honest matches vs 102 `sym.*`)

- `cond.diverticular_disease`: `sym.abdominal_pain`, `sym.abdominal_bloating`,
  `sym.constipation`, `sym.diarrhea`, `sym.bloody_stool`, `sym.fever`
- `cond.celiac_disease`: `sym.diarrhea`, `sym.abdominal_bloating`, `sym.abdominal_pain`,
  `sym.wasting`, `sym.fatigue`
- `cond.lactose_intolerance`: `sym.abdominal_bloating`, `sym.diarrhea`,
  `sym.abdominal_pain`, `sym.nausea`
- `cond.chronic_hepatitis_b`: `sym.jaundice`, `sym.fatigue`, `sym.poor_appetite`,
  `sym.hypochondriac_pain`, `sym.nausea`

(The 8 DETAIL_PARTIAL records already had `sign_symptom_ids` from prior batches;
untouched in this batch.)

## Validation trail

```
node scripts/build-data.js                       # PASS both commits
node scripts/audit-cr010-condition-detail-maturity.js
  full_detail_count: 38 -> 46 (Part A) -> 50 (Part B)
node scripts/validate-condition-standard.js
  blocking: 294 -> 294 (unchanged both commits; C4 43, C5 124, C10 127)
  N4 skeleton-count: 296 -> 292 (4 skeletons promoted to draft)
node scripts/check-validation-ratchet.js
  conditions 294 -> 294  PASS — no regressions
node scripts/validate-content-junk.js
  PASS — no scraped header tokens
node scripts/validate-relations.js
  Relation validation passed (sign_symptom_ids / sources all resolve)
```

## Next batch

252 conditions remain in `remaining_detail_slots_to_300` per the live audit. This
ledger's 12 are cleared from the CR-010 Common-300 batch-01 detail queue.
