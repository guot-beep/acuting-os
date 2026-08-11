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
| Batch E — Metabolic/Hematology/Cardiac (`09_WESTERN_CONDITION_RESEARCH_BATCH_E_METABOLIC_HEMATOLOGY_CARDIAC.md`, sourced from branch `pattern-v2-implementation`) | `cond.cushing_syndrome` → `cond.cushing_syndrome` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `cushing`/`庫欣` — zero matches |
| Batch E — Metabolic/Hematology/Cardiac | `cond.type_1_diabetes` → `cond.type_1_diabetes` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `type 1 diabetes`/`第一型糖尿病` — zero matches (existing `cond.t2dm` is Type 2, a distinct disease per the pack's own etiology framing) |
| Batch E — Metabolic/Hematology/Cardiac | `cond.polycythemia_vera` → `cond.polycythemia_vera` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `polycythemia`/`真性紅血球增多`/`erythrocytosis` — zero matches. Pack flags `NEAR_DUPLICATE_NEEDS_DECISION` (PV vs generic erythrocytosis) — no generic erythrocytosis record exists in canon to collide with, so ruled NEW_CANDIDATE; `name_zh`/`name_en` kept PV-specific ("真性紅血球增多症" / "Polycythemia Vera", not generic "erythrocytosis") per the pack's explicit non-synonym warning. |
| Batch E — Metabolic/Hematology/Cardiac | `cond.neutropenia` → `cond.neutropenia` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `neutropenia`/`嗜中性白血球減少` — zero matches |
| Batch E — Metabolic/Hematology/Cardiac | `cond.hemochromatosis` → `cond.hemochromatosis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `hemochromatosis`/`血色素沉著`/`iron overload` — zero matches |
| Batch E — Metabolic/Hematology/Cardiac | `cond.raynaud_phenomenon` → `cond.raynaud` | 2026-08-11 | 3 (C4+C10×2 boilerplate) → 0 | EXISTING_ENRICH — exact id/name match already in canon (`id: cond.raynaud`, `name_zh: "雷諾氏現象（文件情境）"`). Same repo-wide C10-flagged shared-verbatim boilerplate as `cond.hashimoto` in Batch C — replaced (not appended) per the validator's own C10 authorization. `sign_symptom_ids` deliberately left unset: numbness/tingling/pain-in-digits do not resolve against the current 18-record `sym.*` registry; not invented. |
| Batch E — Metabolic/Hematology/Cardiac | `cond.valvular_heart_disease` → `cond.valvular_heart_disease` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `valvular`/`心臟瓣膜`/`valve` — zero matches. Pack flags `NEAR_DUPLICATE_NEEDS_DECISION` (parent vs valve-specific subtype) — ruled NEW_CANDIDATE as the parent/navigational card since no valve-specific child records (aortic stenosis, mitral regurgitation, etc.) exist in canon yet; `western_context_*` explicitly documents this is a parent category and that subtype cards should be added separately rather than merged in, per the pack's own framing. `icd_hint` set to the family range `I34-I39` (not a single code) to honestly reflect the parent scope. |
| Batch F — Respiratory/Renal/Sleep (`10_WESTERN_CONDITION_RESEARCH_BATCH_F_RESPIRATORY_RENAL_SLEEP.md`, read via `git show origin/pattern-v2-implementation:...` blob read — see Notes) | `cond.asthma` → `cond.asthma` | 2026-08-11 | 0 baseline defects on this id (carries a pre-existing, unrelated C10 issue — see below) | EXISTING_ENRICH — exact id match (`name_zh: "氣喘（輔助文件情境）"`). Enriched summary/western_context/risk_factors/red_flags/acupuncture_scope + sign_symptom_ids + aliases, cleaned stale name suffix. Left `etiology_zh`/`western_pathology_zh` untouched (real, unique CloudTCM classical-text content, not C10 boilerplate) and added `etiology_en`/`western_pathology_en` as faithful condensed translations rather than line-by-line (source essay is very long). **Discovered, not caused, by this batch**: validator now flags `cond.asthma`'s `etiology_zh`/`western_pathology_zh` as C10 "shared verbatim by 2 records" — the other record is `cond.post_covid`, which independently carries the identical CloudTCM asthma essay under its own id. This cross-contamination predates Batch F (neither field was touched here) and is out of this batch's scope to fix; flagged for a dedicated content-untangling pass (find the post-COVID content's rightful home, or determine the asthma text was double-imported). |
| Batch F — Respiratory/Renal/Sleep | `cond.chronic_kidney_disease` → `cond.chronic_kidney_disease` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `kidney`/`renal`/`ckd`/`腎` (broad) — zero matches for CKD itself (found `cond.hpa_dysregulation`, `cond.addison_disease`, unrelated endocrine records with 腎上腺 in the name, not CKD) |
| Batch F — Respiratory/Renal/Sleep | `cond.nephrolithiasis` → `cond.nephrolithiasis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `stone`/`結石`/`nephro` — zero matches |
| Batch F — Respiratory/Renal/Sleep | `cond.pyelonephritis` → `cond.pyelonephritis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `pyelo`/`腎盂`/`kidney infection` — zero matches. `cond.recurrent_uti` exists ("反覆泌尿道感染（文件情境）") but is a distinct recurrence-pattern concept, not a single acute-episode upper UTI — kept separate per template's non-equivalence rule, differential relationship carried in `western_context_*` prose only (no cond-to-cond relation field exists, per Batch B-E notes). |
| Batch F — Respiratory/Renal/Sleep | `cond.cystitis` → `cond.cystitis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `cystitis`/`膀胱炎`/`bladder infection` — found `cond.interstitial_cystitis` ("間質性膀胱炎") which the template's own pack source explicitly names as a *different* condition from acute bacterial cystitis (non-inflammatory bladder pain syndrome vs bacterial infection) — ruled non-overlapping, NEW_CANDIDATE for the acute-infection concept. Also distinct from `cond.recurrent_uti` (recurrence pattern, not a single episode). Both boundary relationships documented in `western_context_*` prose. |
| Batch F — Respiratory/Renal/Sleep | `cond.obstructive_sleep_apnea` → `cond.sleep_apnea` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact-scan found the concept already in canon under a shorter id (`cond.sleep_apnea`, `name_zh: "阻塞性睡眠呼吸中止（文件情境）"`) rather than the pack's candidate_id `cond.obstructive_sleep_apnea` — resolved to the existing id per D1 (ids never change), not created as a duplicate. C10 boilerplate `etiology_zh`/`western_pathology_zh` replaced (not appended) per validator's own authorization (same ruling as Batch C/E). Enriched summary/western_context/risk_factors/red_flags/acupuncture_scope + sign_symptom_ids + aliases, cleaned stale name suffix. |
| Batch F — Respiratory/Renal/Sleep | `cond.pneumonia` → `cond.pneumonia` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `pneumonia`/`肺炎` — zero matches |
| Batch F — Respiratory/Renal/Sleep | `cond.acute_bronchitis` → `cond.acute_bronchitis` | 2026-08-11 | 3 (C4+C10×2 boilerplate) → 0 | EXISTING_ENRICH — exact id/name match (`name_zh: "急性支氣管炎（文件情境）"`). Same repo-wide C10-flagged shared-verbatim boilerplate as Batch C/E — replaced per validator's own authorization. Enriched summary/western_context/risk_factors/red_flags/acupuncture_scope + sign_symptom_ids, cleaned stale name suffix. |

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

## Batches B–E (2026-08-11) — additional notes for the next ingest AI

- **C10 replacement is validator-authorized, not a §0 violation**: the
  boilerplate strings `"正氣不足，臟腑功能失調，氣血津液運化不利。"` (etiology_zh)
  and `"相關系統功能障礙及發炎或代謝異常導致的臨床症狀。"` (western_pathology_zh)
  are shared verbatim across ~70 pre-existing records and are flagged by
  `validate-condition-standard.js`'s own C10 check with the message
  *"boilerplate or misfiled text, not this condition's content. Do NOT
  translate it; the fill line replaces it from real sources."* When
  enriching an EXISTING_ENRICH record whose `etiology_zh`/
  `western_pathology_zh` is this exact string, **replace it**, don't append
  around it — that is what the validator's own message directs, and it does
  not conflict with §0 只加深不刪除 because the string carries no real
  per-condition content to lose. Used this way for `cond.hashimoto` (Batch
  C) and `cond.raynaud` (Batch E), both landed at 0 defects.
- **This is different from a unique-but-wrong-topic field**: `cond.
  heart_failure`'s pre-existing `western_pathology_zh` (Batch B) was real
  CloudTCM content about cardiac arrhythmia (心律不整), not the C10
  boilerplate — unique text, not shared verbatim, so C10 does NOT flag it
  and the validator gives no replacement license. Left untouched; the card
  carries 1 pre-existing C5 defect forward. Only replace a field when the
  validator itself identifies it as junk (C10) — don't extend the same
  license to content that merely looks misfiled on a read-through.
- **sym.* registry gaps recur heavily in B–E**: none of dyspnea, syncope,
  chest_pain, tachycardia, tremor, weight_loss/gain, cold/heat_intolerance,
  bruising, jaw_claudication, visual_loss, numbness, speech_difficulty,
  unilateral_leg_swelling, polyuria/polydipsia, cyanosis, or diaphoresis
  exist in the 18-record `data/symptoms/symptoms.json` registry, even
  though they are the single most pack-recommended symptom links for this
  concept cluster (POTS, MI, angina, PE, GCA, pneumothorax, T1DM...). Several
  Batch D/E records (`cond.pulmonary_embolism`, `cond.aneurysm`, `cond.
  transient_ischemic_attack`, `cond.pneumothorax`) therefore carry zero
  `sign_symptom_ids` — not an oversight, the registry has no honest match.
  A dedicated symptom-batch expanding this registry would unlock real value
  across most of the condition canon, not just these records.
- **No condition-to-condition relation field exists** in the approved
  schema (§3.3) — DVT↔PE, MI↔angina, Graves↔hyperthyroidism, Hashimoto↔
  hypothyroidism-style pairs the pack proposes as `DERIVED_RELATION` can
  only be carried in prose (the differential-diagnosis paragraph inside
  `western_context_*`), never as a structured link. Do not invent a new
  field to hold these — that is a schema-change decision for Fable, not an
  ingest-batch decision (§10.5).
- **Parent/child and identity-boundary judgment calls made this batch**
  (all NEW_CANDIDATE, all documented per-row above): `cond.aneurysm` was
  scoped and named specifically to the pack's aortic-only sourced content
  (name_zh/en = "主動脈瘤"/"Aortic Aneurysm", not generic "Aneurysm") rather
  than imply coverage of cerebral aneurysm, which the pack explicitly warns
  is a different neurologic entity. `cond.valvular_heart_disease` was
  authored explicitly as a parent/navigational card with no valve-specific
  child records yet — future subtype cards (aortic stenosis, mitral
  regurgitation, etc.) should link back to it, not be merged into it.
  `cond.graves_disease` was ruled NEW_CANDIDATE (not merged into the
  existing generic `cond.hyperthyroidism`) by direct parallel to this
  canon's own precedent of `cond.hashimoto` sitting beside `cond.
  hypothyroidism` — worth checking for the same generic-parent-vs-specific-
  autoimmune-cause pattern before ruling identity on any future thyroid/
  endocrine candidate in this pack (Cushing disease vs Cushing syndrome,
  type 1 vs type 2 diabetes, etc. all follow the same shape).

## Batch F (2026-08-11) — additional notes for the next ingest AI

- **Pack files F–I location**: same branch-topology situation as Batch A —
  `curriculum/conditions/AcuTing_OS_Disease_Knowledge_Research_Pack_CLEAN_V2_2026-08-09/`
  only exists on `pattern-v2-implementation` (fetch it:
  `git fetch origin pattern-v2-implementation`), not on `codex/pattern-v2`.
  Read via `git show origin/pattern-v2-implementation:curriculum/conditions/...md`
  blob reads into scratchpad files — no merge, this branch stays cut from the
  true `codex/pattern-v2` tip. File names: `10_..._BATCH_F_RESPIRATORY_RENAL_SLEEP.md`,
  `11_..._BATCH_G_NEUROLOGY.md`, `12_..._BATCH_H_GI_LIVER.md`,
  `13_..._BATCH_I_AUTOIMMUNE_MSK_DERM_GENETIC.md`.
- **`sym.*` registry has grown to 49 records** (from 18 at Batch E) — most of
  the gaps flagged in the Batch B–E notes are now real matches: `sym.cough`,
  `sym.shortness_of_breath`, `sym.abdominal_pain`, `sym.epigastric_pain`,
  `sym.vomiting`, `sym.numbness`, `sym.tremor`, `sym.pruritus`,
  `sym.spontaneous_bruising`, `sym.urinary_retention`, `sym.hematuria`,
  `sym.weakness`, `sym.blurred_vision` all exist now. Re-check the registry
  before assuming a symptom link is unavailable — the Batch B–E "does not
  exist" list is now stale for these ids. Still missing: chest_pain (generic),
  syncope, tachycardia, weight_loss/gain, cold/heat_intolerance,
  jaw_claudication, speech_difficulty, cyanosis, diaphoresis, jaundice,
  seizure, facial_pain/facial_weakness (specific), joint_pain (generic —
  only specific-joint sym.knee_pain/shoulder_pain/neck_pain exist).
- **C12 co_management regex pitfall (validator quirk, not a content bug)**:
  `validate-condition-standard.js`'s C12 check flags `co_management` text
  containing `停藥|停用|discontinu|stop taking` UNLESS the same string also
  contains `聯絡|諮詢|contact|consult`. Writing "不建議病人自行停用X" alone
  fails C12 even though the sentence already correctly avoids advising the
  patient to stop medication — the check wants an explicit *route to the
  prescriber* co-located with the caution, not just the caution. Fix: include
  "聯絡"/"contact" in the same string (e.g. "...應聯絡開藥醫師，不建議病人
  自行停用..."). Hit this on 4 Batch F records (cond.asthma, cond.sleep_apnea,
  cond.pneumonia, cond.pyelonephritis) before fixing — check for this pattern
  proactively in future batches rather than discovering it post-validate.
- **Empty-array aliases still trip C9**: `aliases_zh: []` / `aliases_en: [X]`
  reads as "_en filled but _zh empty" (isEmpty() treats `[]` as empty) even
  though both keys are technically present. If only one language has a real
  alias, either add a matching-length entry on the other side or omit the
  pair entirely — don't leave one side `[]` and the other populated. Hit on
  `cond.pyelonephritis` (fixed by adding "上泌尿道感染" to `aliases_zh`).
- **Large single-record insertions cause git-diff realignment noise**: when
  enriching a record with a large field block (e.g. `cond.sleep_apnea`
  gaining ~15 new fields), `git diff` can show the *next* untouched record
  as a spurious full delete+re-add (byte-identical content, just shifted
  down in the unified diff's hunk). Confirmed harmless by direct comparison
  (saw this with `cond.bells_palsy` after enriching `cond.sleep_apnea`,
  which sits immediately before it in array order) — but don't skip the
  check next time just because it "looks like" a real diff; verify.
- **`cond.asthma` × `cond.post_covid` cross-contamination flagged, not
  fixed**: see the Batch F row above. Both records currently carry the
  identical CloudTCM asthma essay verbatim in `etiology_zh`/
  `western_pathology_zh`. This is a pre-existing data-import bug unrelated
  to any F–I batch content; whoever owns a future "content untangling" pass
  needs to determine which record the text actually belongs to (almost
  certainly `cond.asthma`, given the content is asthma-specific) and what,
  if anything, real should replace it in `cond.post_covid`.
