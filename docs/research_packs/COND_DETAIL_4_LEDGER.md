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

### Commit 2 — neuro/vestibular group + carpal_tunnel/restless_legs C10 fixes (8 records)

`cond.tension_headache` (additive only: `aliases_zh/en` + `sign_symptom_ids`
expanded to `sym.neck_pain`/`sym.shoulder_pain`; `western_pathology_zh/en`
deliberately NOT touched — see C10 boundary note above), `cond.carpal_tunnel`
(C10 boilerplate `etiology_zh`/`western_pathology_zh` REPLACED with real
SOL-sourced content + bilingual `_en` added; `risk_factors`/`acupuncture_scope`/
`sources`/`field_sources`/`sign_symptom_ids` added — existing `summary`/
`western_context`/`red_flags` from a prior orthopedic batch left untouched),
`cond.peripheral_neuropathy` (field_sources added, sign_symptom_ids 1→4),
`cond.epilepsy` (field_sources added, sign_symptom_ids added — `relations`
maturity criterion now met honestly via sign_symptom_ids, NOT via a forced
`related_patterns`/`tdis.*` link from the unreviewed tcm_pathogenesis seed),
`cond.bppv` (full skeleton build), `cond.menieres` (risk_factors — previously
empty arrays — + sources + field_sources added; sign_symptom_ids expanded with
`sym.hearing_loss`; existing real non-boilerplate content untouched),
`cond.restless_legs` (C10 boilerplate `etiology_zh`/`western_pathology_zh`
REPLACED with real SOL-sourced content + bilingual `_en` added; full build of
everything else — summary/western_context/risk_factors/red_flags/
acupuncture_scope/sign_symptom_ids/sources/field_sources, all previously
absent), `cond.vestibular_neuritis` (full skeleton build).

**Judgment call — C10 replacement authorization for `carpal_tunnel` and
`restless_legs`**: both records carried the identical 56-way-shared generic
boilerplate in `etiology_zh`/`western_pathology_zh`
("正氣不足，臟腑功能失調，氣血津液運化不利。" / "相關系統功能障礙及發炎或代謝異常導致的臨床症狀。").
`docs/research_packs/COND_C5_LEDGER.md` treats this class of defect as
"Skipped — owned by the untangle pass" for its own (translation-only) scope.
This batch is different in kind: `COND_INGESTION_LEDGER.md` documents the same
detail-batch series REPEATEDLY replacing this exact class of boilerplate with
real sourced content when directly enriching a record (`cond.influenza`,
`cond.menieres`, `cond.osteoporosis`, `cond.acute_bronchitis` — quote: "C10
boilerplate replaced per validator's own authorization"). Since
`carpal_tunnel`/`restless_legs` are this batch's own assigned targets (not
incidental touches), the same precedent was applied. `cond.tension_headache`
was NOT touched the same way because it is not resolvable by simple
replacement — its shared text is a real (if broadly-scoped) article duplicated
across `tension_headache`/`cluster_headache`/`migraine`/`migraine_vestibular`
(4-way, per COND_C5_LEDGER), not a single-line generic stub with no specific
home; disentangling which card the content actually belongs to needs the
dedicated untangle pass, not a detail-batch call.

**Judgment call — `cond.pulmonary_hypertension` name/scope mismatch**: flagged
above (row 5) for Ting; content written as general PH per icd_hint/name_en,
`name_zh` (PAH-specific) left untouched.

**Judgment call — `cond.epilepsy` relations**: added `sign_symptom_ids` only to
close the "relations" maturity gap honestly; did NOT add `related_patterns` or
`related_eastern_diseases` from the tcm_pathogenesis seed, which explicitly
warns "與中醫「癇病」可有臨床重疊但不自動等同" (constitution redline 9 — no
uncertain-as-certain, no West=TCM equivalence).

Validation trail:

```
node scripts/build-data.js                         PASS
node scripts/validate-condition-standard.js
  blocking: 294 -> 285  BETTER (-9)
    C4  43 -> 42  (-1: cond.restless_legs — was draft+content, no red_flags;
        now has red_flags)
    C5  124 -> 120  (-4: carpal_tunnel etiology_en + western_pathology_en,
        restless_legs etiology_en + western_pathology_en, all now paired)
    C10 127 -> 123  (-4: carpal_tunnel + restless_legs etiology_zh +
        western_pathology_zh no longer match the 56-way boilerplate)
  N4 skeleton-count: 289 -> 287 (-2: bppv, vestibular_neuritis)
node scripts/check-validation-ratchet.js --update
  conditions 294 -> 285  BETTER  PASS — baseline updated (ratchet only ever
  allows downward movement; locked in per the script's own recommendation)
node scripts/validate-content-junk.js
  PASS — no scraped header tokens (1 pre-existing formula-layer WARN, unrelated)
node scripts/validate-relations.js
  Relation validation passed (sign_symptom_ids / sources all resolve)
```

## Batch totals (both commits, 15 records)

- **0 new `cond.*` records created.**
- **full_detail_count** (live audit, `node scripts/audit-cr010-condition-detail-maturity.js`):
  **65 → 77** (+12; the other 3 of the 15 — tension_headache, trigeminal_neuralgia,
  bells_palsy — were already FULL_DETAIL_CANDIDATE pre-batch, deepened not promoted).
  All 15 targeted conditions now score FULL_DETAIL_CANDIDATE.
  partial_count 91→85 (-6), skeleton_count 349→343 (-6), arithmetic checks:
  91-6=85 ✓, 349-6=343 ✓, 65+12=77 ✓.
- **Overall condition-layer blocking defects**: 294 → 285 (net **-9**, better —
  not just flat/neutral, a genuine improvement from the authorized C10 fixes).
- **sign_symptom_ids added/expanded**: 11 of 15 records (all except
  `cond.trigeminal_neuralgia` — no genuine match — and 3 that already had full
  coverage from the SOL text before this batch: none; every record received at
  least a documented decision).
- **Sources used this batch**: NHLBI (bronchiectasis, pulmonary hypertension),
  CDC (TB, influenza, RSV + RSV risk-group pages), NIDCD (BPPV, Ménière's,
  vestibular neuritis, balance disorders), NINDS (carpal tunnel via peripheral
  neuropathy page + PMC review, restless legs + PMC review), AAOS OrthoInfo
  (carpal tunnel), PMC/NCBI literature reviews (BPPV risk factors, RLS iron/
  augmentation literature, vestibular neuritis StatPearls, CTS risk factors) —
  used only where the institute overview page lacked risk-factor granularity,
  same standard as Batch 01's NIDDK-family sourcing.
- **`acupuncture_scope.evidence`**: `unknown` for all 15 — no acupuncture-
  specific efficacy guideline was located in this session's live research for
  any of the 15 conditions; matches the existing honest convention already
  used elsewhere in this dataset (never inflated to `guideline`/`course`
  without a real citation).
- **P-4 pattern adjudication** (external_wind_damp CREATE_CANONICAL
  recommendation): not actioned — out of scope for a condition-detail batch,
  flagged above for a separate pattern-registry decision.
- **Missing staging asset**: `data/research_staging/cr010_source_reuse_map_batch02_SOL.json`
  (referenced in the pack's own manifest/README) does not exist on disk —
  flagged, not actioned.

## Next batch

`remaining_detail_slots_to_300` per the live audit after this batch: **235 → 223**
(-12). This batch's 15 conditions are cleared from the CR-010 Common-300 detail
queue. `full_detail_count` 65 → 77 (target: 300).
