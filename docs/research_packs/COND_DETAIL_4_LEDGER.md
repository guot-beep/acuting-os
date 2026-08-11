# CR-010 Condition Detail Batch 02 (SOL) — Ingestion Ledger (Detail Batch 4)

Branch: `codex/cond-detail-4-sol02` off `origin/codex/pattern-v2` @ `2ab8836`.
Source pack: `docs/research_packs/CR010_CONDITION_DETAIL_BATCH02_SOL.md` +
`data/research_staging/cr010_condition_detail_batch02_SOL.json` (15 conditions).
Target file: `data/pathology/condition_canon_shortlist.json`.

Pack self-flagged its own ranking as unauthoritative ("source-reuse-optimized
prefetch... not an exact reproduction of Fable's private/local partial ranking").
Live audit re-run before ingestion (`node scripts/audit-cr010-condition-detail-maturity.js`):
baseline `full_detail_count: 65` (live, 505 records: 65 FULL_DETAIL_CANDIDATE / 91
DETAIL_PARTIAL / 349 SKELETON). All 15 staged conditions cross-checked against this
live PARTIAL/SKELETON list, not against the pack's own priority claim.

## Exact-scan result (15 staged conditions vs 505 canon records)

| # | Staging suggested id | Resolved canon id | Ruling | Pre-batch maturity | Post-batch maturity |
|---|---|---|---|---|---|
| 1 | `cond.bronchiectasis` | `cond.bronchiectasis` | EXISTING (id resolves exactly) | SKELETON (0/12) | FULL_DETAIL_CANDIDATE |
| 2 | `cond.tuberculosis` | `cond.tuberculosis_disease` | EXISTING under a different id — no `cond.tuberculosis` record; `cond.tuberculosis_disease` (`name_zh: 活動性結核病`, alias `肺結核`) already existed with rich content from an earlier infectious-disease batch. Staged content not needed (existing card is already more complete than the pack's prefetch); only the genuinely-missing `field_sources` + `sign_symptom_ids` expansion were added. | DETAIL_PARTIAL (11/12, missing field_sources) | FULL_DETAIL_CANDIDATE |
| 3 | `cond.influenza` | `cond.influenza` | EXISTING (id resolves exactly), already content-rich from a prior batch | DETAIL_PARTIAL (10/12, missing sources, field_sources) | FULL_DETAIL_CANDIDATE |
| 4 | `cond.rsv_infection` | `cond.rsv_infection` | EXISTING (id resolves exactly), was a bare skeleton | SKELETON (0/12) | FULL_DETAIL_CANDIDATE |
| 5 | `cond.pulmonary_hypertension` | `cond.pulmonary_hypertension` | EXISTING (id resolves exactly), was a bare skeleton. **Name mismatch flagged for Ting**: existing `name_zh` is `肺動脈高壓` (specifically "Pulmonary Arterial Hypertension") but `name_en` ("Pulmonary Hypertension") and `icd_hint` (`I27.20` = unspecified PH, not `I27.0`/`I27.21` which are the PAH-specific codes) are general. Content written covers general PH (per SOL source + icd_hint + name_en), with PAH named as one WHO subgroup within `western_context`. `name_zh` left untouched (id/name not this task's call to change — constitution §2). | SKELETON (0/12) | FULL_DETAIL_CANDIDATE |
| 6 | `cond.tension_type_headache` | `cond.tension_headache` | EXISTING under a shorter id, **already FULL_DETAIL_CANDIDATE** (completed by earlier detail batches). Per task instruction, only genuinely-missing fields added: `aliases_zh/en`, 2 more `sign_symptom_ids`. See "C10 boundary" note below — `western_pathology_zh/en` intentionally NOT touched. | FULL_DETAIL_CANDIDATE | FULL_DETAIL_CANDIDATE (unchanged tier, deepened) |
| 7 | `cond.trigeminal_neuralgia` | `cond.trigeminal_neuralgia` | EXISTING (id resolves exactly), **already FULL_DETAIL_CANDIDATE**. Only genuinely-missing field checked: `sign_symptom_ids` — no genuine `sym.*` match exists (see note below), left honestly empty. | FULL_DETAIL_CANDIDATE | FULL_DETAIL_CANDIDATE (unchanged, no forced match) |
| 8 | `cond.bells_palsy` | `cond.bells_palsy` | EXISTING under a differently-named id (`name_zh: 顏面神經麻痺`, matches Bell's palsy exactly), **already FULL_DETAIL_CANDIDATE**. Only genuinely-missing field added: `sign_symptom_ids` (`sym.facial_deviation`). | FULL_DETAIL_CANDIDATE | FULL_DETAIL_CANDIDATE (unchanged tier, deepened) |
| 9 | `cond.carpal_tunnel_syndrome` | `cond.carpal_tunnel` | EXISTING under a shorter id. See commit 2 detail below. | DETAIL_PARTIAL (5/12) | FULL_DETAIL_CANDIDATE |
| 10 | `cond.peripheral_neuropathy` | `cond.peripheral_neuropathy` | EXISTING (id resolves exactly), already content-rich. See commit 2 detail below. | DETAIL_PARTIAL (11/12, missing field_sources) | FULL_DETAIL_CANDIDATE |
| 11 | `cond.epilepsy` | `cond.epilepsy` | EXISTING (id resolves exactly), already content-rich. See commit 2 detail below. | DETAIL_PARTIAL (10/12, missing field_sources, structured_relations) | FULL_DETAIL_CANDIDATE |
| 12 | `cond.bppv` | `cond.bppv` | EXISTING (id resolves exactly), was a bare skeleton. See commit 2 detail below. | SKELETON (0/12) | FULL_DETAIL_CANDIDATE |
| 13 | `cond.menieres_disease` | `cond.menieres` | EXISTING under a shorter id, already content-rich from an earlier ENT batch (`etiology`/`western_pathology`/`western_context`/`red_flags`/`acupuncture_scope` already real, non-boilerplate content — already C10-clean per `COND_INGESTION_LEDGER.md`). See commit 2 detail below. | DETAIL_PARTIAL (9/12, missing risk_factors, sources, field_sources) | FULL_DETAIL_CANDIDATE |
| 14 | `cond.restless_legs_syndrome` | `cond.restless_legs` | EXISTING under a shorter id. See commit 2 detail below. | SKELETON (1/12) | FULL_DETAIL_CANDIDATE |
| 15 | `cond.vestibular_neuritis` | `cond.vestibular_neuritis` | EXISTING (id resolves exactly), was a bare skeleton. See commit 2 detail below. | SKELETON (0/12) | FULL_DETAIL_CANDIDATE |

**Zero new `cond.*` records created.** All 15 staged conditions resolved to existing
canon records (9 by exact id match, 6 by name/alias match to a differently-named
existing id: `tuberculosis`→`tuberculosis_disease`, `tension_type_headache`→`tension_headache`,
`carpal_tunnel_syndrome`→`carpal_tunnel`, `menieres_disease`→`menieres`,
`restless_legs_syndrome`→`restless_legs`, plus `bells_palsy` which matched by content
identity despite a generic existing `name_zh`). Per the pack's own ingestion rule
("suggested IDs are not asserted as canonical"), all 6 mismatches were treated as
EXISTING, not NEW — matching Batch 01/COND_INGESTION_LEDGER precedent exactly.

## P-4 adjudication (pattern.* — out of scope for this batch)

The pack also carries `data/research_staging/p4_adjudication_external_wind_damp_SOL.json`,
recommending `CREATE_CANONICAL` for a new `pattern.*` record (外感風濕/風濕襲表證,
distinct from `pattern.wind_cold_damp_bi`). **Not actioned this batch** — my task
instructions scope `related_patterns` to "canonical only (library 154)"; creating a
new pattern record is an architectural decision outside a condition-detail batch and
is not named in my task's file/id list. Flagged here for a separate pattern-registry
decision, not silently dropped. `data/research_staging/cr010_source_reuse_map_batch02_SOL.json`
(referenced in `00_README_CR010_COMMON300_BATCH02.md` and the manifest's sha256 list)
**does not exist on disk** — a gap in SOL's own pack, not something I can act on;
noted for whoever runs cleanup on the research-staging directory.

## tcm_pathogenesis — dispositions (NOT written to canon)

All 15 staging records carry `tcm_source_status: "needs_textbook_source_review"`.
Per task instruction and constitution redline 9, **none of the 15
`tcm_pathogenesis_zh/en` seed texts were written into `etiology_zh/en` or any other
canon field.** `related_patterns` was left untouched/empty for every SKELETON build
in this batch (bronchiectasis, rsv_infection, pulmonary_hypertension, bppv,
vestibular_neuritis) — no canon-ready `pattern.*` linkage was asserted from
unreviewed seed text, matching Batch 01 precedent exactly.

| Condition | tcm_pathogenesis seed candidates (differential, not equivalence) | Disposition |
|---|---|---|
| Bronchiectasis | 痰濕、痰熱、肺脾氣虛、肺陰不足 | pending textbook review |
| Tuberculosis | 肺陰虛、陰虛火旺、氣陰兩虛 | pending textbook review |
| Influenza | 風寒、風熱、濕邪 | pending textbook review |
| RSV infection | 外感、痰熱、痰濕、肺脾氣虛 | pending textbook review |
| Pulmonary hypertension | 肺氣虛、心肺氣虛、痰飲、水濕、瘀血 | pending textbook review |
| Tension-type headache | 風邪、肝陽、痰濕、血瘀、氣血不足 | pending textbook review (pre-existing card) |
| Trigeminal neuralgia | 風寒、風熱、胃火、肝火、痰瘀、氣血不足 | pending textbook review (pre-existing card) |
| Bell's palsy | 風邪入絡、風寒、風熱、痰瘀阻絡、氣血不足 | pending textbook review (pre-existing card) |
| Carpal tunnel syndrome | 氣滯血瘀、痰濕、風寒濕痹、氣血不足 | pending textbook review |
| Peripheral neuropathy | 氣血不足、瘀血阻絡、痰濕、濕熱、肝腎不足 | pending textbook review (pre-existing card) |
| Epilepsy | 痰、風、火、瘀、虛 | pending textbook review (pre-existing card) |
| BPPV | 痰濕、痰飲、氣血不足、肝陽 | pending textbook review |
| Ménière's disease | 痰濕、痰飲、肝陽、肝火、氣血不足、腎虛 | pending textbook review (pre-existing card) |
| Restless legs syndrome | 血虛、陰虛、瘀血、痰濕、肝腎不足 | pending textbook review |
| Vestibular neuritis | 痰飲、痰濕、風邪、肝陽 | pending textbook review |

## Field mapping used (identical to Batch 01, template §3, §8.2 ④)

- `overview_{zh,en}` → `summary_{zh,en}`
- `biomedical_pathophysiology_{zh,en}` → `western_pathology_{zh,en}` (mechanism-level)
- `diagnostic_signs_{zh,en}` + `diagnostic_tests_{zh,en}` + `treatment_principles_{zh,en}`
  → folded into `western_context_{zh,en}` as structured prose (臨床定位／臨床表現／
  重要特徵／診斷方法／鑑別診斷／西醫治療／編碼備註) — the established convention.
  Differential-diagnosis lines are standard-textbook additions (not literal SOL text,
  no dosage/safety numbers invented) matching how `cond.tuberculosis_disease` /
  `cond.trigeminal_neuralgia` (both from earlier batches) already do this.
- `key_references`/`refs` → `sources` (full "Authority — Title: URL" strings) +
  `field_sources` (per-field short-form citations).
- **`risk_factors` and `acupuncture_scope` are NOT in the staging pack** (same as
  Batch 01) — sourced live per §5.5/§5.6 from the same source families SOL already
  cited (NHLBI, CDC, NIDCD) plus PMC/NIH literature reviews where the institute
  overview page lacked risk-factor granularity (CTS, RLS, BPPV, vestibular neuritis).
  `acupuncture_scope.evidence` graded `unknown` throughout this batch — no
  acupuncture-specific efficacy guideline was located for any of the 15 conditions
  in the live research this session; this matches the honest existing convention
  already used for TB/influenza/trigeminal_neuralgia/bells_palsy/peripheral_neuropathy/
  epilepsy/Ménière's in this same dataset.

## C10 boundary — `cond.tension_headache` explicitly OUT OF SCOPE

`western_pathology_zh` on `cond.tension_headache` is C10-flagged (shared verbatim with
`cond.cluster_headache`). `docs/research_packs/COND_C5_LEDGER.md` explicitly lists this
record as **"Skipped — owned by the untangle pass"** (a separate, dedicated workstream),
and the record's own `import_artifacts` entry (added 2026-08-11) says the same field
is "left untouched for the C10/batch-2 pass." **Not touched this batch** — no
`western_pathology_en` was added (would bilingually cement a field flagged for
replacement), and the `_zh` content itself was not replaced. This is a deliberate
scope boundary, not an oversight; the C5/C10 defect count for this record is
unchanged. By contrast, `cond.carpal_tunnel` and `cond.restless_legs` (this batch's
own assigned targets) had the SAME 56-way-shared generic boilerplate in
`western_pathology_zh`/`etiology_zh` — those WERE replaced with real SOL-sourced
content, per the repeatedly-used precedent in `COND_INGESTION_LEDGER.md` ("C10
boilerplate replaced per validator's own authorization") for records directly being
enriched by a detail batch — see commit 2.

## sign_symptom_ids — genuine-match discipline

Every addition below maps to an existing `sym.*` (102-symptom registry) id that
matches the condition's actual presenting sign, sourced from either the SOL pack's
own `diagnostic_signs` or the pre-existing card's `western_context`. No
force-fit mappings:

- `cond.trigeminal_neuralgia`: **no addition** — no `sym.facial_pain` (or equivalent)
  exists in the 102-symptom registry; the only near-candidate (`sym.numbness`)
  would misrepresent TN, since numbness is a red-flag for *secondary* TN in the
  card's own text, not the primary presentation. Left honestly empty.
- Full per-condition lists are in the commit sections below.

## Commits (this batch)

### Commit 1 — respiratory group + 2 tiny neuro additions (7 records)

`cond.bronchiectasis` (full skeleton build), `cond.tuberculosis_disease`
(field_sources + sign_symptom_ids expansion), `cond.influenza` (sources +
field_sources + sign_symptom_ids expansion), `cond.rsv_infection` (full skeleton
build), `cond.pulmonary_hypertension` (full skeleton build, name-mismatch flagged),
`cond.trigeminal_neuralgia` (sign_symptom_ids checked, no genuine match, left empty),
`cond.bells_palsy` (sign_symptom_ids: `sym.facial_deviation`).

Validation trail:

```
node scripts/build-data.js                         PASS
node scripts/validate-condition-standard.js
  blocking: 294 -> 294 (flat; the 3 skeleton builds moved from N4 note-only to
  fully clean, not into any blocking code — C4 stayed 43, C5 stayed 124, C10 stayed 127)
  N4 skeleton-count: 292 -> 289 (-3: bronchiectasis, rsv_infection, pulmonary_hypertension)
node scripts/check-validation-ratchet.js
  conditions 294 -> 294  flat  PASS — no regressions
node scripts/validate-content-junk.js
  PASS — no scraped header tokens (1 pre-existing formula-layer WARN, unrelated)
node scripts/validate-relations.js
  Relation validation passed (sign_symptom_ids / sources all resolve)
```

(Commit 2 section appended after that commit lands — see below.)
