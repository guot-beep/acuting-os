# Condition Ingestion Ledger

Tracks each `cond.*` record ingested from a research pack into
`data/pathology/condition_canon_shortlist.json`. One line per record.
Append-only — do not edit or delete past rows (§0 只加深不刪除).

Columns: batch · candidate_id → canonical id · date · defects before → after
(validator: `node scripts/validate-condition-standard.js --worklist`).

| batch | candidate_id → canonical id | date | defects before → after | id decision |
|---|---|---|---|---|
| Batch A — Hematology (`AcuTing_OS_Disease_Knowledge_Research_Pack_CLEAN_V2_2026-08-09/05_WESTERN_CONDITION_RESEARCH_BATCH_A_HEMATOLOGY.md`, sourced from branch `pattern-v2-implementation`) | `cond.anemia` → `cond.anemia` | 2026-08-11 | n/a (new record) → 0 | NEW_CANDIDATE — exact-scanned all 150 existing `cond.*` ids/names/aliases_zh/aliases_en for `anemia`/`貧血`/`anaemia`/`blood`/`platelet`/`sickle`/`鐮狀`/`血小板` — zero matches, no pre-existing record or alias to enrich instead |
| Batch A — Hematology | `cond.thrombocytopenia` → `cond.thrombocytopenia` | 2026-08-11 | n/a (new record) → 0 | NEW_CANDIDATE — same exact-scan as above, zero matches |
| Batch A — Hematology | `cond.sickle_cell_disease` → `cond.sickle_cell_disease` | 2026-08-11 | n/a (new record) → 0 | NEW_CANDIDATE — same exact-scan as above, zero matches |

## Notes for the next ingest AI

- **Branch topology discrepancy found and worked around, not fixed**: the
  research pack directory only exists on `pattern-v2-implementation`
  (commit `c3c38cf`), NOT on `codex/pattern-v2` / `main`. This branch
  (`codex/cond-enrich-batch-a`) was cut from the true `codex/pattern-v2` tip
  (`cef1e93`) per instructions, so the pack files are absent from this
  worktree's working copy. Batch A content was read via
  `git show pattern-v2-implementation:curriculum/conditions/.../05_....md`
  (blob read, no merge). If future batches need pack files B–N, either
  read them the same way or land the archive commit onto this lineage —
  don't assume `curriculum/conditions/AcuTing_OS_Disease_Knowledge_Research_Pack_CLEAN_V2_2026-08-09/`
  exists in the working tree here.
- **Crosswalk (cond↔tdis) deliberately deferred**: the pack flags
  `tdis.xu_lao` (虛勞) as a `POSSIBLE_CONTEXTUAL_ASSOCIATION` for both
  `cond.anemia` and `cond.sickle_cell_disease`, explicitly warning 虛勞 is
  broader than anemia. `related_eastern_diseases` has no per-edge strength
  annotation in the current schema, so it cannot carry that caveat — and
  the pack's own safe ingestion order puts crosswalk linking at STEP_5,
  after the identity-scan step this batch completed. Left unset here;
  revisit in a dedicated crosswalk batch (pack files `40-49`).
- **Symptom endpoint gaps (not created, not invented)**: the symptom
  registry (`data/symptoms/symptoms.json`, 18 records) resolves
  `sym.fatigue` / `sym.dizziness` / `sym.headache` / `sym.palpitations` /
  `sym.weakness`, used on `cond.anemia` / `cond.sickle_cell_disease`.
  It does NOT yet have endpoints for bruising, petechiae, bleeding, heavy
  menstrual bleeding, jaundice, or chest_pain — matching the pack's own
  `missing_symptom_candidates` notes. `cond.thrombocytopenia` therefore
  carries no `sign_symptom_ids` this batch; `cond.sickle_cell_disease`
  carries only the 2 that resolve. Do not invent `sym.*` ids to fill the
  gap — that is a separate symptom-batch task.
- **herb_formulas / acupoint_protocols intentionally left empty** on all
  3 records — the pack's Batch A research is Western-medicine CANONICAL_NOW
  content only; no TCM formula/acupoint prescription was sourced for these
  concepts in this pack, so none was invented.
- **classical_references_zh/en intentionally left empty** — per
  `docs/CONDITION_CARD_TEMPLATE.md` §9, that field pair is the `tdis.*`
  (TCM disease) exclusive column; these are `entity_type: biomedical_condition`
  records and `icd_hint` / `western_context_*` are their exclusive column
  instead.
- **acupuncture_scope evidence graded `unknown`** on all 3 records
  (not `course`): no acupuncture-specific guideline or systematic review for
  anemia / thrombocytopenia / sickle cell disease was located in the source
  material used. `unknown` is the template's documented correct starting
  value, not a defect.
