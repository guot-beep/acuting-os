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
| Batch B — Cardio/Autonomic (`06_WESTERN_CONDITION_RESEARCH_BATCH_B_CARDIO_AUTONOMIC.md`, sourced from branch `pattern-v2-implementation`) | `cond.heart_failure` → `cond.heart_failure` | 2026-08-11 | 1 (pre-existing C4+C10) → 1 (pre-existing C5, see note) | EXISTING_ENRICH — exact id match already in canon (`name_zh: "心臟衰竭（輔助文件情境）"`, `icd_hint: I50`). Enriched summary/etiology/western_context/risk_factors/red_flags/acupuncture_scope + sign_symptom_ids + cleaned name_zh/en (dropped stale "（輔助文件情境）" suffix) + aliases. **Not 0 defects — flagged, not padded**: `western_pathology_zh` pre-dates this batch and is verbatim CloudTCM content about 心律不整 (cardiac arrhythmia), not heart failure — off-topic content misfiled under this id from an earlier import, NOT this batch's C10-flagged duplicate (that was `etiology_zh`, which duplicated `cond.palpitations` verbatim and has been replaced with real heart-failure content per the validator's own C10 note authorizing replacement). Left `western_pathology_zh` untouched (§0 只加深不刪除 — real sourced content, just wrong condition) rather than translate wrong-topic content into `western_pathology_en`, which would compound the error. Carries forward 1 pre-existing C5 defect on that field; needs a dedicated content-untangling pass (find the arrhythmia essay's rightful home, likely `cond.palpitations`) outside this batch's scope. |
| Batch B — Cardio/Autonomic | `cond.pots` → `cond.pots` | 2026-08-11 | n/a (new record) → 0 | NEW_CANDIDATE — exact-scanned all 153 existing `cond.*` ids/names/aliases for `pots`/`postural orthostatic`/`姿勢性直立` — zero matches |
| Batch C — Endocrine (`07_WESTERN_CONDITION_RESEARCH_BATCH_C_ENDOCRINE.md`, sourced from branch `pattern-v2-implementation`) | `cond.addison_disease` → `cond.addison_disease` | 2026-08-11 | n/a (new record) → 0 | NEW_CANDIDATE — exact-scanned for `addison`/`adrenal insufficiency`/`愛迪生`/`腎上腺功能不全` — zero matches (existing `cond.hpa_dysregulation` is a distinct functional-medicine "HPA-axis dysregulation / adrenal fatigue" concept, not primary adrenal insufficiency — no overlap) |
| Batch C — Endocrine | `cond.graves_disease` → `cond.graves_disease` | 2026-08-11 | n/a (new record) → 0 | NEW_CANDIDATE — exact-scanned for `graves`/`葛瑞夫茲` — zero matches. Judgment call: existing `cond.hyperthyroidism` ("甲狀腺功能亢進") is the generic parent-syndrome card; Graves is a specific autoimmune subtype/cause, not a synonym (template §1 bars 1:1 equivalence). Ruled NEW_CANDIDATE by direct parallel to this canon's own existing precedent: `cond.hashimoto` already sits beside `cond.hypothyroidism` as a specific-autoimmune-cause card next to the generic-parent-syndrome card — same pattern applied to Graves/hyperthyroidism. No condition-to-condition relation field exists in the approved schema (§3.3) to formally link the two; the relationship is carried in prose only (western_context differential-diagnosis section), matching how the pack itself frames it. |
| Batch C — Endocrine | `cond.hashimoto_thyroiditis` → `cond.hashimoto` | 2026-08-11 | 4 (C4+C5×2+C10×2 boilerplate) → 0 | EXISTING_ENRICH — exact id/name match already in canon (`id: cond.hashimoto`, `name_zh: "橋本氏甲狀腺炎（文件情境）"`). `etiology_zh`/`western_pathology_zh` were the repo-wide C10-flagged shared-verbatim boilerplate ("正氣不足，臟腑功能失調..." / "相關系統功能障礙及發炎或代謝異常...", duplicated across ~70 records) — the validator's own C10 message explicitly authorizes replacing this text ("the fill line replaces it from real sources"), so both were replaced (not appended) with real NIDDK-sourced content. Also enriched: summary/western_context/risk_factors/red_flags/acupuncture_scope, sign_symptom_ids, aliases, cleaned name_zh/en (dropped stale "（文件情境）" suffix). |
| Batch D — Emergency/Vascular (`08_WESTERN_CONDITION_RESEARCH_BATCH_D_EMERGENCY_VASCULAR.md`, sourced from branch `pattern-v2-implementation`) | `cond.deep_vein_thrombosis` → `cond.deep_vein_thrombosis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `dvt`/`deep vein thrombosis`/`深部靜脈血栓`/`venous thrombosis` — zero matches (existing `cond.varicose_veins` is a distinct chronic venous-insufficiency concept, no overlap) |
| Batch D — Emergency/Vascular | `cond.pulmonary_embolism` → `cond.pulmonary_embolism` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `pe`/`pulmonary embolism`/`肺栓塞`/`embolism` — zero matches |
| Batch D — Emergency/Vascular | `cond.myocardial_infarction` → `cond.myocardial_infarction` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `mi`/`myocardial infarction`/`heart attack`/`心肌梗塞`/`coronary` — zero matches (existing `cond.cad` is chronic coronary artery disease, a distinct clinical state from acute MI per the pack's own identity-boundary note) |
| Batch D — Emergency/Vascular | `cond.angina_pectoris` → `cond.angina_pectoris` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `angina`/`心絞痛` — zero matches |
| Batch D — Emergency/Vascular | `cond.aneurysm` → `cond.aneurysm` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `aneurysm`/`動脈瘤`/`aortic`/`dissection` — zero matches. **Identity-boundary caveat carried into the card** (per the pack's own explicit warning): sourced content is aortic-aneurysm-specific (NHLBI), so `name_zh`/`name_en` were set to "主動脈瘤" / "Aortic Aneurysm" rather than a generic "Aneurysm" label, with a scope note in `summary_*` and `western_context_*` stating that intracranial/cerebral aneurysm is a separate neurologic entity not covered here. id kept as `cond.aneurysm` per the pack's candidate_id. |
| Batch D — Emergency/Vascular | `cond.transient_ischemic_attack` → `cond.transient_ischemic_attack` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `tia`/`transient ischemic attack`/`暫時性腦缺血`/`stroke`/`中風` — zero matches (existing `cond.stroke_rehab` is post-stroke rehabilitation, a distinct clinical stage; no `cond.stroke` acute-stroke record exists in canon to link against) |
| Batch D — Emergency/Vascular | `cond.giant_cell_arteritis` → `cond.giant_cell_arteritis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `giant cell arteritis`/`temporal arteritis`/`巨細胞動脈炎`/`顳動脈炎` — zero matches |
| Batch D — Emergency/Vascular | `cond.pneumothorax` → `cond.pneumothorax` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `pneumothorax`/`氣胸`/`collapsed lung` — zero matches |

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
