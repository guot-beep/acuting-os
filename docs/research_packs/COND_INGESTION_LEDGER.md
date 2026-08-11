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
| Batch G — Neurology (`11_WESTERN_CONDITION_RESEARCH_BATCH_G_NEUROLOGY.md`) | `cond.bell_palsy` → `cond.bells_palsy` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact-scan found the concept already in canon under `cond.bells_palsy` (candidate_id `cond.bell_palsy` resolved to the existing id, D1). `etiology_zh`/`western_pathology_zh`/`classical_references_zh` are real, unique classical-text content (Lingshu/Zhubing Yuanhou Lun/Jingyue Quanshu/Yilin Gaicuo quotes) — left untouched, added `etiology_en`/`western_pathology_en` as condensed faithful translations. Added summary/western_context/risk_factors/red_flags/acupuncture_scope + aliases; this record had zero red flags before (C4), now has 5. |
| Batch G — Neurology | `cond.trigeminal_neuralgia` → `cond.trigeminal_neuralgia` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact id/name match, already had real content (aliases_en "Tic Douloureux", summary, red_flags). **`red_flags_zh`/`red_flags_en` deliberately left untouched** — wired to `data/pathology/red_flag_registry.json` via `red_flag_refs: ["rf.trigeminal_neuralgia.legacy01"]`; touching the legacy array without also updating the registry would break `validate-red-flag-wiring.js`'s verbatim-match requirement (template §3.2). Added `etiology_en`/`western_pathology_en` translations of the existing real zh content, plus western_context/risk_factors/acupuncture_scope, and one `aliases_zh` entry ("痛性抽搐") to match the existing `aliases_en` length. |
| Batch G — Neurology | `cond.peripheral_neuropathy` → `cond.peripheral_neuropathy` | 2026-08-11 | 4 (C4+C10×2 boilerplate+C5) → 0 | EXISTING_ENRICH — exact id/name match. C10 boilerplate `etiology_zh`/`western_pathology_zh` replaced per validator's own authorization (same ruling as prior batches). Pack flags `NEAR_DUPLICATE_NEEDS_DECISION` (parent vs etiology-specific subtype) — kept as the parent/navigational card since `cond.diabetic_neuropathy` already exists in canon as a distinct etiology-specific child; `western_context_*` documents the parent/child relationship in prose (no cond-to-cond relation field exists, per Batch B–E notes). |
| Batch G — Neurology | `cond.epilepsy` → `cond.epilepsy` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `epilepsy`/`seizure`/`癲癇` — zero matches |
| Batch G — Neurology | `cond.parkinson_disease` → `cond.parkinsons` | 2026-08-11 | 3 (C4+C10×2 boilerplate) → 0 | EXISTING_ENRICH — exact-scan found the concept already in canon under a shorter id (`cond.parkinsons`, `name_zh: "帕金森氏症（輔助文件情境）"`) rather than the pack's candidate_id `cond.parkinson_disease` — resolved to the existing id per D1. C10 boilerplate replaced per validator's own authorization. Cleaned stale name suffix, added sign_symptom_ids (`sym.tremor`). |
| Batch G — Neurology | `cond.multiple_sclerosis` → `cond.multiple_sclerosis` | 2026-08-11 | 3 (C4+C10×2 boilerplate) → 0 | EXISTING_ENRICH — exact id/name match (`name_zh: "多發性硬化症（輔助文件情境）"`). C10 boilerplate replaced per validator's own authorization. Cleaned stale name suffix, added sign_symptom_ids (`sym.fatigue`, `sym.numbness`, `sym.blurred_vision`). |
| Batch G — Neurology | `cond.guillain_barre_syndrome` → `cond.guillain_barre_syndrome` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `guillain`/`格林`/`巴利` — zero matches |
| Batch G — Neurology | `cond.cauda_equina_syndrome` → `cond.cauda_equina_syndrome` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `cauda equina`/`馬尾` — zero matches. `cond.urinary_retention` exists (non-obstructive retention) but is a distinct symptom-level entity, not this emergency syndrome — no merge, no relation field available to link them (prose-only note in `western_context_*`). |
| Batch H — GI/Liver (`12_WESTERN_CONDITION_RESEARCH_BATCH_H_GI_LIVER.md`) | `cond.appendicitis` → `cond.appendicitis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `appendic`/`闌尾` — zero matches |
| Batch H — GI/Liver | `cond.gastritis` → `cond.chronic_gastritis` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact-scan found the pack's generic "Gastritis/Gastropathy" concept already covered in canon under `cond.chronic_gastritis` (`name_zh: "慢性胃炎（文件情境）"`), which carries real unique CloudTCM content that is actually generic gastric-discomfort/嘈雜 material, not chronic-specific. **Scope judgment**: broadened `name_zh`/`name_en` to "胃炎／胃黏膜病變（含慢性胃炎）" / "Gastritis / Gastropathy (including Chronic Gastritis)" rather than create a separate acute/generic card, since (a) no acute-gastritis-specific card exists to conflict with, (b) the existing content itself doesn't distinguish acute/chronic, and (c) creating a near-duplicate generic card next to a chronic-specific one would violate the template's non-equivalence rule in the other direction (splitting one real concept into two ids). Real `etiology_zh`/`western_pathology_zh` (huge classical essay) left untouched; added condensed-but-faithful `etiology_en`/`western_pathology_en` (not line-by-line, source is very long) plus all missing structured fields. Flagging this scope-broadening decision explicitly for Fable/Ting review — it is a judgment call, not a mechanical exact-match. |
| Batch H — GI/Liver | `cond.peptic_ulcer_disease` → `cond.peptic_ulcer` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact-scan found the concept already in canon under a shorter id (`cond.peptic_ulcer`, `name_zh: "消化性潰瘍（文件情境）"`) vs the pack's candidate_id `cond.peptic_ulcer_disease` — resolved to existing id (D1). Real unique CloudTCM classical-text content (etiology_zh/western_pathology_zh, huge essay on 胃脘痛) left untouched; added condensed `etiology_en`/`western_pathology_en` translations plus missing structured fields. Cleaned stale name suffix. |
| Batch H — GI/Liver | `cond.irritable_bowel_syndrome` → `cond.ibs` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact-scan found the concept already in canon under a shorter id (`cond.ibs`, `name_zh: "腸躁症"`, already real content not boilerplate) vs the pack's candidate_id `cond.irritable_bowel_syndrome` — resolved to existing id. Added `etiology_en`/`western_pathology_en` translations of the existing real (concise) zh content plus missing structured fields. |
| Batch H — GI/Liver | `cond.inflammatory_bowel_disease` → `cond.ibd` | 2026-08-11 | 3 (C4+C10×2 boilerplate) → 0 | EXISTING_ENRICH — exact-scan found the concept already in canon under a shorter id (`cond.ibd`, `name_zh: "發炎性腸道疾病（文件情境）"`) vs the pack's candidate_id `cond.inflammatory_bowel_disease`. C10 boilerplate `etiology_zh`/`western_pathology_zh` replaced per validator's own authorization (same ruling as prior batches). Pack flags `NEAR_DUPLICATE_NEEDS_DECISION` (parent vs Crohn/UC-specific subtype) — kept as parent/navigational card since no Crohn- or UC-specific child records exist in canon yet; `western_context_*` documents this explicitly, same pattern as `cond.valvular_heart_disease` (Batch E) and `cond.peripheral_neuropathy` (Batch G). |
| Batch H — GI/Liver | `cond.acute_pancreatitis` → `cond.acute_pancreatitis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `pancreat`/`胰臟`/`胰腺` — zero matches |
| Batch H — GI/Liver | `cond.gallstone_disease` → `cond.gallstone_disease` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `gallstone`/`膽結石`/`cholelithiasis` — zero matches. Found `cond.gallbladder_dysfunction` ("膽道功能障礙（文件情境）" / "Biliary Dyskinesia / Gallbladder Dysfunction") but ruled non-overlapping per template's non-equivalence principle: gallstones are a structural problem, biliary dyskinesia is a functional/motility disorder without stones — different entities, documented as a differential note in `western_context_*`, not merged. |
| Batch H — GI/Liver | `cond.bowel_obstruction` → `cond.bowel_obstruction` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `obstruction`/`腸阻塞`/`腸梗阻` — zero matches |
| Batch H — GI/Liver | `cond.cirrhosis` → `cond.cirrhosis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `cirrhosis`/`肝硬化` — zero matches |
| Batch H — GI/Liver | `cond.viral_hepatitis` → `cond.viral_hepatitis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `hepatitis`/`肝炎` — zero matches. Pack flags `NEAR_DUPLICATE_NEEDS_DECISION` (parent vs HBV/HCV-specific subtype) — kept as parent/navigational card, no type-specific child records exist yet, same pattern as `cond.ibd` above. |
| Batch I — Autoimmune/MSK/Derm/Genetic (`13_WESTERN_CONDITION_RESEARCH_BATCH_I_AUTOIMMUNE_MSK_DERM_GENETIC.md`) | `cond.rheumatoid_arthritis` → `cond.rheumatoid_arthritis` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact id/name match (`name_zh: "類風濕性關節炎（文件情境）"`). Real unique CloudTCM content (`etiology_zh`/`western_pathology_zh`) covers the broader arthritis/痹證 family, not RA-specific — left untouched (§0), added a condensed `etiology_en`/`western_pathology_en` translation that explicitly notes it is shared arthritis-family content, not RA-only pathophysiology. Cleaned stale name suffix. |
| Batch I — Autoimmune/MSK/Derm/Genetic | `cond.systemic_lupus_erythematosus` → `cond.systemic_lupus_erythematosus` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `lupus`/`狼瘡` — zero matches |
| Batch I — Autoimmune/MSK/Derm/Genetic | `cond.myasthenia_gravis` → `cond.myasthenia_gravis` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `myasthenia`/`重症肌無力` — zero matches |
| Batch I — Autoimmune/MSK/Derm/Genetic | `cond.psoriasis` → `cond.psoriasis` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact id/name match (`name_zh: "乾癬／銀屑病（文件情境）"`). Real unique CloudTCM classical-text content (白疕 essay) left untouched, condensed `etiology_en`/`western_pathology_en` added. Cleaned stale name suffix. |
| Batch I — Autoimmune/MSK/Derm/Genetic | `cond.gout` → `cond.gout` | 2026-08-11 | 3 (C4+C10×2 boilerplate) → 0 | EXISTING_ENRICH — exact id/name match (`name_zh: "痛風（文件情境）"`). C10 boilerplate `etiology_zh`/`western_pathology_zh` replaced per validator's own authorization (same ruling as prior batches). Cleaned stale name suffix. |
| Batch I — Autoimmune/MSK/Derm/Genetic | `cond.osteoporosis` → `cond.osteoporosis` | 2026-08-11 | 3 (C4+C10×2 boilerplate) → 0 | EXISTING_ENRICH — exact id/name match (`name_zh: "骨質疏鬆（文件情境）"`). C10 boilerplate replaced per validator's own authorization. Cleaned stale name suffix. |
| Batch I — Autoimmune/MSK/Derm/Genetic | `cond.fibromyalgia` → `cond.fibromyalgia` | 2026-08-11 | 0 baseline → 0 | EXISTING_ENRICH — exact id/name match, already carried real content (summary, western_context, real CloudTCM etiology_zh/western_pathology_zh essay). **`red_flags_zh`/`red_flags_en` deliberately left untouched** — wired to `data/pathology/red_flag_registry.json` via `red_flag_refs: ["rf.fibromyalgia.legacy01/02/03"]` (3 entries, more than the single-entry wiring seen on `cond.trigeminal_neuralgia` in Batch G — confirms wiring is not limited to 1-flag records). Added condensed `etiology_en`/`western_pathology_en` translations of the existing real essay, plus risk_factors/acupuncture_scope/sign_symptom_ids. |
| Batch I — Autoimmune/MSK/Derm/Genetic | `cond.ehlers_danlos_syndrome` → `cond.ehlers_danlos_syndrome` | 2026-08-11 | n/a → 0 | NEW_CANDIDATE — exact-scanned for `ehlers`/`danlos`/`埃勒斯`/`hypermobil` — zero matches |

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

## Batch G (2026-08-11) — additional notes for the next ingest AI

- **Check `red_flag_refs` before touching `red_flags_zh`/`red_flags_en` on
  any EXISTING_ENRICH target.** `cond.trigeminal_neuralgia` already carried
  `red_flag_refs: ["rf.trigeminal_neuralgia.legacy01"]` pointing at
  `data/pathology/red_flag_registry.json` — more records than just the
  "Batch 4 婦科 25 張" the template §3.2 mentions may already be wired.
  Editing the legacy `red_flags_zh`/`red_flags_en` array without also
  updating the registry entry breaks `validate-red-flag-wiring.js`'s
  verbatim-match requirement. This batch avoided the field entirely rather
  than risk it — safest default until a batch is specifically scoped to
  registry migration.
- **Some pack candidate_ids resolve to shorter/different existing ids** —
  this recurred twice in Batch G (`cond.bell_palsy`→`cond.bells_palsy`,
  `cond.parkinson_disease`→`cond.parkinsons`), same pattern as Batch F's
  `cond.obstructive_sleep_apnea`→`cond.sleep_apnea`. Always exact-scan by
  name/alias content, not just by candidate_id string match — a same-topic
  record with a differently-shaped id is common in this canon.
- **Parent/child judgment**: `cond.peripheral_neuropathy` (parent, this
  batch) coexists with the pre-existing `cond.diabetic_neuropathy` (etiology-
  specific child) — no merge, relationship carried in prose only, following
  the same pattern as `cond.hashimoto`/`cond.hypothyroidism` and
  `cond.valvular_heart_disease` from earlier batches.

## Batch H (2026-08-11) — additional notes for the next ingest AI

- **Scope-broadening judgment call flagged for review**: `cond.gastritis`
  (pack candidate) resolved to the existing `cond.chronic_gastritis`, and
  its name was broadened from "慢性胃炎" to "胃炎／胃黏膜病變（含慢性胃炎）"
  to match the pack's generic scope. This is different from the usual
  "candidate_id resolves to a shorter existing id" pattern (Batch F/G) —
  here the *scope* of the existing card was widened, not just the id
  matched. Rationale: the existing card's real content never actually
  distinguished acute from chronic, so narrowing was already fictional;
  but this is a judgment call, not a mechanical exact-match, and is called
  out explicitly in the Batch H row above for Fable/Ting to review.
- **Real long-essay content gets condensed (not line-by-line) `_en`
  translation, same as Batch F's `cond.asthma`**: `cond.chronic_gastritis`
  and `cond.peptic_ulcer` both carry multi-thousand-character classical-
  text essays in `etiology_zh`. Producing a faithful condensed English
  summary (preserving the named TCM pattern categories and formulas) rather
  than translating every sentence keeps the batch tractable while still
  being real translation, not boilerplate — same approach as asthma in
  Batch F.
- **Two more `NEAR_DUPLICATE_NEEDS_DECISION` parent-card rulings** (same
  shape as `cond.valvular_heart_disease` in Batch E and
  `cond.peripheral_neuropathy` in Batch G): `cond.ibd` and
  `cond.viral_hepatitis` were both kept as parent/navigational cards with
  no Crohn/UC or HBV/HCV type-specific child records yet. Check for this
  same shape before ruling identity on any future "disease family" pack
  candidate (autoimmune subtypes, cancer types, etc. likely to recur in
  Batch I/J).
- **`aliases_zh`/`aliases_en` length-mismatch pitfall recurred 3x this
  batch** (`cond.ibs`, `cond.ibd`, `cond.peptic_ulcer`) despite being
  documented in the Batch F notes — worth writing alias pairs LAST in the
  patch object and double-checking lengths before running the validator,
  not after.

## Batch I (2026-08-11) — additional notes for the next ingest AI, and sprint close-out

- **The `aliases_zh`/`aliases_en` pitfall recurred AGAIN, 4x** this batch
  (`cond.rheumatoid_arthritis`, `cond.ehlers_danlos_syndrome`,
  `cond.myasthenia_gravis`, `cond.psoriasis` — the last one was the
  *reverse* direction, `aliases_zh` filled with `aliases_en` empty), despite
  being flagged in both the Batch F and Batch H notes. **Recommendation for
  whoever owns the next content batch of any kind**: write a tiny self-check
  script that walks every record in the batch's patch/record objects and
  asserts `(aliases_zh||[]).length === (aliases_en||[]).length` (and ideally
  the same for every other array-pair field) BEFORE running the full
  validator — this class of defect is 100% mechanically preventable and has
  now cost 4 separate fix-and-rerun cycles across F/H/I.
- **Also caught a length-mismatch the validator does NOT flag**:
  `cond.systemic_lupus_erythematosus` was drafted with `aliases_zh: ["紅斑性狼瘡"]`
  (1 entry) vs `aliases_en: ["SLE", "Lupus"]` (2 entries) — both non-empty,
  so `validate-condition-standard.js`'s C5/C9 checks (which only test
  presence, not length equality) do not catch this. Fixed by hand per
  template §6 ("`_en` 陣列長度必須等於 `_zh`"), which is a written rule with
  no automated enforcement for this specific field. Worth a dedicated
  small validator check in a future scripts/ change (Claude's territory,
  not this batch's).
- **`red_flag_refs` wiring is more common than expected**: 2 of the 4
  batches (F–I) hit an already-wired record (`cond.trigeminal_neuralgia` in
  G, `cond.fibromyalgia` in I) — always check for `red_flag_refs` on any
  EXISTING_ENRICH target before touching `red_flags_zh`/`red_flags_en`.

### Sprint close-out (Batches F–I, 2026-08-11)

- Branch `codex/cond-enrich-f-i`, cut from `origin/codex/pattern-v2` tip
  (`9ebd671`, confirmed ancestor).
- `data/pathology/condition_canon_shortlist.json`: 170 → 187 records
  (17 NEW_CANDIDATE, 17 EXISTING_ENRICH across F/G/H/I — 8+8+10+8=34
  concepts total, matching the pack's own per-batch concept counts).
- `check-validation-ratchet.js` conditions defect count: 539 (committed
  baseline) → 481 after Batch I, monotonically improving batch over batch
  (526 → 509 → 499 → 481). No regressions at any commit.
- One pre-existing cross-contamination flagged, not fixed (out of this
  sprint's scope): `cond.asthma` × `cond.post_covid` share verbatim
  `etiology_zh`/`western_pathology_zh` — see Batch F notes above.
- One scope-broadening judgment call flagged for Fable/Ting review:
  `cond.chronic_gastritis` renamed/broadened to cover the pack's generic
  "gastritis/gastropathy" concept — see Batch H notes above.
- Not pushed (per task instructions — branch left for review).

## Batch J — Mental/Behavioral Health (2026-08-11)

Pack file: `14_WESTERN_CONDITION_RESEARCH_BATCH_J_MENTAL_BEHAVIORAL.md`
(read via `git show origin/pattern-v2-implementation:curriculum/conditions/...`
blob read into scratchpad — same branch-topology workaround as Batches A/F,
this branch stays cut from the true `codex/pattern-v2` tip). Branch
`codex/cond-enrich-j-n`, cut from `origin/codex/pattern-v2` tip (`78c370f`
"Cond F-I merge finalize", confirmed ancestor). `sym.*` registry re-checked
at branch time: still 49 records (unchanged since Batch F/I — the 61 seen in
an early script run was a bug reading `Object.values(s)[0].length`, i.e. the
string length of the `dataset` field, not a record count).

| candidate_id → canonical id | ruling |
|---|---|
| `cond.generalized_anxiety_disorder` → `cond.anxiety` | EXISTING_ENRICH — exact-scanned `anxiety`/`焦慮` — found `cond.anxiety` (`name_zh: "焦慮（文件情境）"`) with C10 boilerplate `etiology_zh`/`western_pathology_zh`, replaced per validator's own authorization (same ruling as prior batches). Renamed to "焦慮症（廣泛性焦慮症）" / "Anxiety Disorder (Generalized Anxiety Disorder)" — the existing record's namespace is generic "anxiety" but the sourced pack content and `related_patterns` are GAD-specific, so the name change is scoped honestly rather than either fabricating generic-anxiety content or silently narrowing the id's stated scope. |
| `cond.major_depressive_disorder` → `cond.depression` | EXISTING_ENRICH — exact-scanned `depress`/`憂鬱` — found `cond.depression` (`name_zh: "憂鬱（文件情境）"`) carrying REAL unique classical-text content (a long 神經衰弱/neurasthenia essay, not C10 boilerplate — confirmed by re-running the C10 check, which did not flag it). Left `etiology_zh`/`western_pathology_zh` untouched (§0) and added a condensed `_en` translation that explicitly notes it summarizes the neurasthenia-framed TCM etiology, not a line-by-line rendering and not itself a biomedical MDD mechanism — same "condensed, faithful, not verbatim" approach as Batch F's `cond.asthma` and Batch H's `cond.chronic_gastritis`/`cond.peptic_ulcer`. |
| `cond.post_traumatic_stress_disorder` → `cond.ptsd` | EXISTING_ENRICH — exact-scanned `ptsd`/`創傷` — found `cond.ptsd` (`name_zh: "創傷後壓力症（文件情境）"`) with C10 boilerplate, replaced per validator's own authorization. Cleaned stale name suffix. |
| `cond.adhd` → `cond.adhd` | EXISTING_ENRICH — exact id match (`name_zh: "注意力不足過動症（文件情境）"`) with C10 boilerplate, replaced per validator's own authorization. Cleaned stale name suffix. |
| `cond.obsessive_compulsive_disorder` → `cond.obsessive_compulsive_disorder` | NEW_CANDIDATE — exact-scanned `ocd`/`強迫` — zero matches |
| `cond.eating_disorder` (parent) → `cond.eating_disorder` | EXISTING_ENRICH — exact id AND candidate_id match (`name_zh: "飲食失調（文件情境）"`) with C10 boilerplate, replaced per validator's own authorization. Kept as parent/navigational card per the pack's own `NEAR_DUPLICATE_NEEDS_DECISION` framing — no anorexia/bulimia/BED child records exist in canon yet, same "parent card, no children yet" pattern as `cond.ibd`/`cond.viral_hepatitis` (Batch H) and `cond.valvular_heart_disease` (Batch E). Cleaned stale name suffix (dropped "（文件情境）", kept generic "飲食失調症"/"Eating Disorders", not narrowed to any one subtype). No `sign_symptom_ids` set — `sym.poor_appetite` considered but rejected as a dishonest match (eating disorders are not fundamentally an appetite-loss presentation; inventing the link would misrepresent the clinical picture). |
| `cond.substance_use_disorder` (parent) → `cond.substance_use_disorder` | NEW_CANDIDATE — exact-scanned `substance`/`物質使用`/`成癮`/`addiction` — zero matches. Kept as parent/navigational card per the pack's own `NEAR_DUPLICATE_NEEDS_DECISION` framing (should alcohol/opioid/stimulant/cannabis be separate child ids — deferred, no child records exist yet to conflict with). |

### Batch J notes for the next ingest AI

- **`cond.anxiety` naming judgment flagged for Fable/Ting review**: renamed from
  generic "焦慮（文件情境）" to "焦慮症（廣泛性焦慮症）" because the *sourced
  content* (this batch) and the pre-existing `related_patterns` are GAD-specific,
  while the id/namespace itself was left generic. This is a smaller version of
  the Batch H `cond.chronic_gastritis` scope call — flagging explicitly rather
  than treating it as a mechanical rename.
- **Real-vs-boilerplate `western_pathology_zh`/`etiology_zh` check is per-field,
  not per-record**: `cond.depression` had to be checked separately from its
  batch-mates because 4 of 5 EXISTING_ENRICH targets in this batch carried the
  repo-wide C10 boilerplate string while `cond.depression` carried real content
  — always re-run the C10 check after drafting rather than assuming a batch is
  uniform.
- **New `aliases_zh`/`aliases_en` length-mismatch catch, applied proactively**:
  followed the Batch I recommendation to hand-verify every alias pair's array
  length before validating — caught one case in drafting
  (`cond.obsessive_compulsive_disorder` needed a matching `aliases_zh` entry for
  `aliases_en: ["OCD"]`) and fixed before the first validator run.
- **`sign_symptom_ids` used where honest, skipped where not**: `sym.insomnia`,
  `sym.fatigue`, `sym.poor_concentration`, `sym.poor_appetite` all resolve
  against the 49-record registry and were used on GAD/MDD/PTSD/ADHD where the
  match is direct. No symptom links invented for OCD, eating disorders or SUD
  — the registry has no honest match (racing thoughts, rituals, craving, and
  eating-behavior disturbance are not literally any of the 49 registered
  symptoms).
- **No red_flag_refs collision**: none of the 5 EXISTING_ENRICH targets in this
  batch (`cond.anxiety`, `cond.depression`, `cond.ptsd`, `cond.adhd`,
  `cond.eating_disorder`) carried a pre-existing `red_flag_refs` array —
  checked before touching `red_flags_zh`/`red_flags_en` per the Batch G/I
  standing rule, none found.
- Validator state after Batch J commit: `data/pathology/condition_canon_shortlist.json`
  187 → 189 records (2 NEW_CANDIDATE, 5 EXISTING_ENRICH — matches the pack's
  own 7-concept count). `check-validation-ratchet.js` conditions defect count:
  481 (F–I close-out) → 458 (BETTER, −23). All 7 touched/added records are
  0-defect (only an N1 informational note on `cond.depression` for unlifted
  `tcm_patterns` blobs, not a blocking defect).

## Batch K — Reproductive/Gynecology/Urology (2026-08-11)

Pack file: `15_WESTERN_CONDITION_RESEARCH_BATCH_K_REPRODUCTIVE_GYNE_UROLOGY.md`
(same blob-read workaround). 9 concepts.

| candidate_id → canonical id | ruling |
|---|---|
| `cond.endometriosis` → `cond.endometriosis` | EXISTING_ENRICH — exact id/name match, already carried real summary/western_context/red_flags and `red_flag_refs: ["rf.endometriosis.legacy01..04"]` (wired — `red_flags_zh/en` left untouched per Batch G/I standing rule). `etiology_zh`/`western_pathology_zh` were C10-flagged: shared verbatim by 7 gyn records (`cond.endometriosis`, `cond.primary_dysmenorrhea`, `cond.pms`, `cond.irregular_menstruation`, `cond.female_infertility`, `cond.recurrent_pregnancy_loss`, `cond.chronic_pelvic_pain`) — a generic 月經不調 (irregular menstruation) essay, title-matched to `cond.irregular_menstruation` as its likely true home, not endometriosis. Replaced with real endometriosis-specific content per validator's own C10 authorization (same ruling class as Batch F's asthma/post_covid, but this time 7-way not 2-way). `cond.irregular_menstruation` itself untouched (out of this batch's candidate list) — still carries the same essay, flagged below for a future batch. |
| `cond.uterine_fibroids` → `cond.uterine_fibroids` | EXISTING_ENRICH — exact id/name match. `etiology_zh`/`western_pathology_zh`/`_en` already real, unique (count=1, not C10-flagged), complete huge bilingual essay pair — left fully untouched. Only added risk_factors/acupuncture_scope/aliases/sign_symptom_ids. |
| `cond.primary_dysmenorrhea` → `cond.primary_dysmenorrhea` | EXISTING_ENRICH — exact id/name match, `red_flag_refs` wired (`rf.primary_dysmenorrhea.legacy01..04`) — `red_flags_zh/en` untouched. Same 7-way shared 月經不調 essay as endometriosis — replaced with real dysmenorrhea-specific content (prostaglandin mechanism) per C10 authorization. |
| `cond.benign_prostatic_hyperplasia` → `cond.bph` | EXISTING_ENRICH — exact-scan resolved candidate_id to shorter existing id `cond.bph` (D1, same pattern as Batch F/G/H shorter-id resolutions). `etiology_zh`/`western_pathology_zh` (real, topically-correct 前列腺增生 essay) were C10-flagged as shared-by-2 with `cond.chronic_prostatitis` — left untouched here since this is the true topical home (title literally matches); the duplicate on chronic_prostatitis was replaced instead (see below), which resolves both flags together. No `red_flag_refs` — added new structured `red_flags_zh/en` (previously 0, C4). Cleaned stale "（文件情境）" name suffix. |
| `cond.prostatitis` → `cond.chronic_prostatitis` | EXISTING_ENRICH — exact-scan found `cond.chronic_prostatitis` (`name_zh: "慢性攝護腺炎／慢性骨盆疼痛"`), a chronic/CPPS-specific existing card, while the pack's candidate covers both acute bacterial AND chronic prostatitis. Pack flags `NEAR_DUPLICATE_NEEDS_DECISION` (separate acute bacterial vs CP/CPPS cards?) — ruled to broaden this card into a parent covering both subtypes (renamed to "攝護腺炎（含慢性攝護腺炎／慢性骨盆疼痛症候群）" / "Prostatitis (including CP/CPPS)"), same scope-broadening pattern as Batch H's `cond.chronic_gastritis`, flagged here for Fable/Ting review same as that precedent. `etiology_zh`/`western_pathology_zh` were the misfiled BPH essay (C10 shared-by-2 with `cond.bph`, confirmed off-topic — the text is literally about 前列腺增生/BPH, not prostatitis) — replaced with real prostatitis-specific content per C10 authorization. Added new structured `red_flags_zh/en` (previously 0, C4). |
| `cond.erectile_dysfunction` → `cond.erectile_dysfunction` | EXISTING_ENRICH — exact id/name match. `etiology_zh`/`western_pathology_zh` are real, topically-correct ED content (陰器不用/陽事不舉/陽萎 — classical ED terminology) but C10-flagged as shared-by-2 with `cond.male_infertility` (confirmed: `cond.male_infertility` carries the identical essay, misfiled there — out of this batch's candidate list, left untouched, flagged below). Left ED's copy untouched as the true home; added condensed `_en` translation. Added new structured `red_flags_zh/en` (previously 0, C4) — cardiovascular/priapism/neurologic red flags per NIDDK. |
| `cond.abnormal_uterine_bleeding` → `cond.abnormal_uterine_bleeding` | NEW_CANDIDATE — exact-scanned `abnormal uterine`/`異常子宮出血`/`子宮出血` — zero matches. `cond.menorrhagia` exists ("月經過多"/"Heavy Menstrual Bleeding") but is a specific bleeding-amount symptom card, not the broader AUB syndrome-classification concept the pack describes (PALM-COEIN-style, "not one etiology... should not be equated directly with fibroids, anovulation or 崩漏") — ruled non-overlapping per template's non-equivalence rule, differential noted in `western_context_*` prose. |
| `cond.ectopic_pregnancy` → `cond.ectopic_pregnancy` | NEW_CANDIDATE — exact-scanned `ectopic`/`子宮外孕`/`異位妊娠` — zero matches |
| `cond.preeclampsia` → `cond.preeclampsia` | NEW_CANDIDATE — exact-scanned `preeclampsia`/`子癲`/`eclampsia` — zero matches. Pack flags `NEAR_DUPLICATE_NEEDS_DECISION` (separate preeclampsia/HELLP/eclampsia or model as complication states?) — ruled to cover the full spectrum under one card (`name_zh: "子癲前症／子癲症"`) with HELLP/eclampsia framed as severe complication states in `western_context_*`, same "single spectrum card" pattern as `cond.valvular_heart_disease` (Batch E parent-card precedent), not split into 3 ids. |

### Batch K notes for the next ingest AI

- **Cross-contamination flags carried forward, not fixed** (2 new ones this
  batch, same class as Batch F's `cond.asthma`×`cond.post_covid`):
  - `cond.irregular_menstruation` likely holds the TRUE home for the 7-way
    shared 月經不調 essay that was replaced on `cond.endometriosis` and
    `cond.primary_dysmenorrhea` this batch. The other 5 records still sharing
    it (`cond.pms`, `cond.female_infertility`, `cond.recurrent_pregnancy_loss`,
    `cond.chronic_pelvic_pain`, and `cond.irregular_menstruation` itself) are
    untouched — out of this batch's candidate list. A future batch touching
    any of these should re-run the C10 check before assuming boilerplate.
  - `cond.male_infertility` holds a duplicate of `cond.erectile_dysfunction`'s
    real ED-specific essay (陰器不用/陽事不舉/陽萎) — confirmed off-topic for
    infertility. Untouched, out of scope.
- **Scope-broadening judgment call flagged for Fable/Ting review** (2nd
  instance of this pattern, 1st was Batch H's `cond.chronic_gastritis`):
  `cond.chronic_prostatitis` renamed/broadened from chronic-only to a parent
  card covering both acute bacterial and chronic/CPPS prostatitis, matching
  the pack's own generic "prostatitis" candidate scope.
- **A real-content C10 collision can be N-way, not just 2-way**: prior batches
  (F, H) only saw pairwise verbatim sharing. This batch's 月經不調 essay was
  shared by 7 records simultaneously. The fix logic is the same (replace the
  off-topic copies, leave the true-home copy alone) but confirm the exact
  share count with `conditions.filter(...).length` before deciding which
  record(s) are "off-topic duplicates" vs the "true home" — do not assume
  2-way from the validator's summary line alone.
- **`red_flag_refs` wiring hit twice this batch** (`cond.endometriosis`,
  `cond.primary_dysmenorrhea`) — both confirmed via direct field check before
  touching `red_flags_zh/en`, consistent with the Batch G/I standing rule.
  `cond.uterine_fibroids` also wired (`rf.uterine_fibroids.legacy01..04`) —
  3 of 9 candidates in this batch alone were pre-wired, reinforcing "always
  check, never assume unwired."
- Validator state after Batch K commit: `data/pathology/condition_canon_shortlist.json`
  189 → 192 records (3 NEW_CANDIDATE, 6 EXISTING_ENRICH — matches the pack's
  own 9-concept count). `check-validation-ratchet.js` conditions defect count:
  458 (Batch J close) → 437 (BETTER, −21). All 9 touched/added records are
  0-defect except `cond.erectile_dysfunction`, which carries forward 1
  pre-existing C10 defect (the `cond.male_infertility` cross-contamination
  above, not caused by or fixable within this batch).

## Batch L — ENT/Ophthalmic Emergencies (2026-08-11)

Pack file: `16_WESTERN_CONDITION_RESEARCH_BATCH_L_ENT_OPHTHALMIC_EMERGENCIES.md`
(same blob-read workaround). 6 concepts.

| candidate_id → canonical id | ruling |
|---|---|
| `cond.acute_angle_closure_glaucoma` → `cond.acute_angle_closure_glaucoma` | NEW_CANDIDATE — exact-scanned `glaucoma`/`青光眼`/`angle-closure`/`閉角` — zero matches |
| `cond.retinal_detachment` → `cond.retinal_detachment` | NEW_CANDIDATE — exact-scanned `retinal detachment`/`視網膜剝離` — zero matches |
| `cond.sudden_sensorineural_hearing_loss` → `cond.sudden_sensorineural_hearing_loss` | NEW_CANDIDATE — exact-scanned `sensorineural hearing`/`感音神經性`/`sudden deafness` — found `cond.hearing_loss` ("感音神經性聽損（文件情境）"), a real, unique classical-text card about chronic tinnitus/耳鳴 with generic sensorineural hearing loss, NOT the time-sensitive SSHL emergency this pack describes — ruled non-overlapping per template's non-equivalence rule (same acute-vs-chronic boundary logic as Batch D's MI-vs-CAD and TIA-vs-stroke_rehab). Differential noted explicitly in `western_context_*` on both records' relationship (only the new record touched; `cond.hearing_loss` itself untouched, out of scope). |
| `cond.meniere_disease` → `cond.menieres` | EXISTING_ENRICH — exact-scan found the concept already in canon under a shorter id (`cond.menieres`, `name_zh: "梅尼爾氏症（文件情境）"`) vs the pack's candidate_id `cond.meniere_disease` — resolved to existing id (D1). C10 boilerplate `etiology_zh`/`western_pathology_zh` replaced per validator's own authorization (same ruling as prior batches). Cleaned stale name suffix, added sign_symptom_ids (`sym.tinnitus`, `sym.vertigo`). |
| `cond.acute_bacterial_sinusitis` → `cond.acute_bacterial_sinusitis` | NEW_CANDIDATE — exact-scanned `sinusitis`/`鼻竇炎` — found `cond.chronic_sinusitis` ("慢性鼻竇炎"/"Chronic Sinusitis"), a distinct chronic entity from the pack's acute-bacterial-rhinosinusitis candidate — ruled non-overlapping per template's non-equivalence rule, same acute-vs-chronic pattern as the SSHL/hearing_loss decision above. `cond.chronic_sinusitis` carries the repo-wide C10 boilerplate on `etiology_zh`/`western_pathology_zh` but was NOT touched — it is not this batch's candidate (§0/工作法: 只做派工單清單上的), flagged below for a future respiratory/ENT batch. |
| `cond.otitis_media` → `cond.otitis_media` | NEW_CANDIDATE — exact-scanned `otitis media`/`中耳炎` — zero matches |

### Batch L notes for the next ingest AI

- **Acute-vs-chronic identity boundary recurred twice this batch** (SSHL vs
  `cond.hearing_loss`, acute bacterial sinusitis vs `cond.chronic_sinusitis`)
  — same underlying pattern as Batch D's MI-vs-CAD and TIA-vs-stroke_rehab:
  a real pre-existing card covering the chronic/generic form of a condition
  does NOT absorb the pack's acute/emergency-specific candidate. Always check
  whether the existing card's content is time-course-specific before ruling
  EXISTING_ENRICH vs NEW_CANDIDATE on an exact-scan name/topic match — a
  shared keyword (hearing loss, sinusitis) is not the same clinical entity
  when one is emergent and the other is chronic.
- **`cond.chronic_sinusitis` C10 boilerplate flagged, not fixed** — it exact-
  scan-matched this batch's search terms but was NOT the pack's candidate
  (which was acute bacterial rhinosinusitis, ruled a separate NEW_CANDIDATE
  above). Per §0/工作法 (only touch the candidate list's ids), left as-is with
  its repo-wide C10 boilerplate `etiology_zh`/`western_pathology_zh` intact.
  A future respiratory or ENT-focused batch should pick this up.
- Validator state after Batch L commit: `data/pathology/condition_canon_shortlist.json`
  192 → 197 records (5 NEW_CANDIDATE, 1 EXISTING_ENRICH — matches the pack's
  own 6-concept count). `check-validation-ratchet.js` conditions defect count:
  437 (Batch K close) → 433 (BETTER, −4; smaller delta than J/K because most
  of this batch was clean NEW_CANDIDATE additions rather than boilerplate
  replacement on high-defect existing records). All 6 touched/added records
  are 0-defect.

## Batch M — Infectious Disease (2026-08-11)

Pack file: `17_WESTERN_CONDITION_RESEARCH_BATCH_M_INFECTIOUS.md` (same
blob-read workaround). 7 concepts.

| candidate_id → canonical id | ruling |
|---|---|
| `cond.influenza` → `cond.influenza` | EXISTING_ENRICH — exact id/name match (`name_zh: "流行性感冒（文件情境）"`), C10 boilerplate `etiology_zh`/`western_pathology_zh` replaced per validator's own authorization. Cleaned stale name suffix. |
| `cond.covid_19` → `cond.covid_19` | NEW_CANDIDATE — exact-scanned `covid`/`新冠` — found `cond.post_covid` ("新冠後症候群"/"Post-COVID Syndrome (Long COVID)"), a distinct post-acute condition, NOT acute COVID-19 infection — ruled non-overlapping per template's non-equivalence rule, same acute-vs-post-acute boundary pattern as Batch L's SSHL/hearing_loss and acute_bacterial_sinusitis/chronic_sinusitis decisions. Differential explicitly cross-referenced in `western_context_*` ("see cond.post_covid"). **Confirmed still-present cross-contamination**: `cond.post_covid`'s `etiology_zh`/`western_pathology_zh` still carry the misfiled asthma essay first flagged in Batch F notes (`cond.asthma`×`cond.post_covid`) — re-verified by direct read this batch, untouched (out of scope; `cond.post_covid` is not this batch's candidate). |
| `cond.tuberculosis_disease` → `cond.tuberculosis_disease` | NEW_CANDIDATE — exact-scanned `tuberculosis`/`結核` — zero matches |
| `cond.lyme_disease` → `cond.lyme_disease` | NEW_CANDIDATE — exact-scanned `lyme`/`萊姆病` — zero matches |
| `cond.hiv_infection` → `cond.hiv_infection` | NEW_CANDIDATE — exact-scanned `hiv`/`愛滋`/`人類免疫缺乏` — zero matches |
| `cond.herpes_zoster` → `cond.herpes_zoster` | EXISTING_ENRICH — exact id/name match (`name_zh: "帶狀皰疹（急性期）"`), real unique classical-text content (蛇串瘡/纏腰火丹 essay) — left untouched, condensed `etiology_en`/`western_pathology_en` added. Distinct from the pre-existing `cond.postherpetic_neuralgia` (a complication, already separately canonical — no action needed, confirms the acute-episode/complication split was already correctly modeled before this batch). |
| `cond.syphilis` → `cond.syphilis` | NEW_CANDIDATE — exact-scanned `syphilis`/`梅毒` — zero matches |

### Batch M notes for the next ingest AI

- **Acute-vs-post-acute boundary recurred a third time**: COVID-19 (acute)
  vs `cond.post_covid` (Long COVID) is the same identity-boundary shape as
  Batch L's two decisions (SSHL vs chronic hearing_loss; acute bacterial
  sinusitis vs chronic_sinusitis). This is now a recurring pattern across
  J–M: a pack candidate naming an acute/emergent state should almost never
  be merged into an existing card whose real content describes the chronic
  or post-acute counterpart, even when the search keyword matches exactly.
- **`cond.post_covid`'s asthma cross-contamination is still unfixed** (3rd
  confirmation across Batch F → M) — flagging again for whichever future
  batch's scope actually includes `cond.post_covid` or `cond.asthma` as a
  candidate; a dedicated content-untangling pass was recommended as far back
  as Batch F and has not yet been picked up.
- **`cond.postherpetic_neuralgia` already existed as a correctly-separated
  complication card** before this batch touched `cond.herpes_zoster` — a
  positive precedent showing the acute-episode/complication split pattern
  (see also `cond.chronic_pelvic_pain` vs acute pelvic conditions) was
  already applied correctly elsewhere in the canon; nothing to fix.
- Validator state after Batch M commit: `data/pathology/condition_canon_shortlist.json`
  197 → 202 records (5 NEW_CANDIDATE, 2 EXISTING_ENRICH — matches the pack's
  own 7-concept count). `check-validation-ratchet.js` conditions defect count:
  433 (Batch L close) → 425 (BETTER, −8). All 7 touched/added records are
  0-defect (only N1 informational notes on `cond.influenza`/`cond.herpes_zoster`
  for unlifted `tcm_patterns` blobs, not blocking).

## Batch N — Genetic/Oncology (2026-08-11)

Pack file: `18_WESTERN_CONDITION_RESEARCH_BATCH_N_GENETIC_ONCOLOGY.md` (same
blob-read workaround). 7 concepts — all 7 ruled NEW_CANDIDATE, a first for
this sprint (Batches J–M each had at least one EXISTING_ENRICH).

| candidate_id → canonical id | ruling |
|---|---|
| `cond.down_syndrome` → `cond.down_syndrome` | NEW_CANDIDATE — exact-scanned `down syndrome`/`唐氏症`/`trisomy` — one false-positive hit on `cond.ehlers_danlos_syndrome` traced to its alias `埃唐氏症候群` (an EDS transliteration containing the substring 唐氏症 by coincidence, unrelated to Down syndrome) — confirmed unrelated by reading the full record, zero real matches |
| `cond.marfan_syndrome` → `cond.marfan_syndrome` | NEW_CANDIDATE — exact-scanned `marfan`/`馬凡氏` — zero matches |
| `cond.cancer_parent` → `cond.cancer_parent` | NEW_CANDIDATE — exact-scanned `cancer`/`癌症`/`惡性腫瘤`/`malignan` — found `cond.cancer_supportive` ("腫瘤支持照護（輔助文件情境）"/"Cancer Supportive Care"), a distinct complementary concept (symptom/side-effect management for cancer patients, not the disease-family identity/staging card the pack describes) — ruled non-overlapping per template's non-equivalence rule, relationship explicitly noted in `western_context_*` on both directions (references `cond.cancer_supportive` by id and vice versa framing). Kept as a parent/navigational card per the pack's own `NEAR_DUPLICATE_NEEDS_DECISION` framing, explicitly deferring to the site-specific cards in this same batch (breast/prostate/colorectal/lung) rather than absorbing them — same "parent card, real children exist" pattern as `cond.ibd`/`cond.viral_hepatitis` (Batch H) but stronger here since the children were authored in the same batch. |
| `cond.breast_cancer` → `cond.breast_cancer` | NEW_CANDIDATE — exact-scanned `breast cancer`/`乳癌` — zero matches |
| `cond.prostate_cancer` → `cond.prostate_cancer` | NEW_CANDIDATE — exact-scanned `prostate cancer`/`攝護腺癌` — zero matches. Explicit non-equivalence note in `western_context_*` against `cond.bph` and `cond.chronic_prostatitis` (both enriched in Batch K) — three distinct uro_renal-family diseases now correctly co-exist without merge. |
| `cond.colorectal_cancer` → `cond.colorectal_cancer` | NEW_CANDIDATE — exact-scanned `colorectal`/`大腸直腸癌`/`大腸癌` — zero matches. Non-equivalence note against `cond.ibd` (long-standing IBD is a risk factor, not the same disease). |
| `cond.lung_cancer` → `cond.lung_cancer` | NEW_CANDIDATE — exact-scanned `lung cancer`/`肺癌` — zero matches |

### Batch N notes for the next ingest AI

- **First all-NEW_CANDIDATE batch this sprint** — no boilerplate replacement,
  no C10 collisions to resolve, no shorter-id resolution. The diff is a pure
  append (0 deleted lines), confirmed with `git diff | grep '^-' | wc -l`.
- **One mechanical alias-length slip caught and fixed before commit**:
  `cond.colorectal_cancer` was drafted with `aliases_zh: ["大腸癌"]` and
  `aliases_en: []` — the exact class of defect flagged repeatedly since
  Batch F/H/I. Caught by the validator's C5 check on this run (not by
  proactive self-check this time — worth re-emphasizing the Batch I
  recommendation to hand-verify every alias pair's length before the first
  validator run, not after).
- **Cross-batch non-equivalence consistency check performed**: `cond.
  prostate_cancer`'s `western_context_*` explicitly references `cond.bph`
  and `cond.chronic_prostatitis` (both from Batch K, same sprint) — confirms
  the three uro_renal prostate-family cards (BPH, prostatitis, cancer) now
  form a correctly non-overlapping triad rather than accumulating silent
  redundancy across batches.
- Validator state after Batch N commit: `data/pathology/condition_canon_shortlist.json`
  202 → 209 records (7 NEW_CANDIDATE, 0 EXISTING_ENRICH — matches the pack's
  own 7-concept count). `check-validation-ratchet.js` conditions defect count:
  425 (Batch M close) → 425 (net zero delta on the raw count, but this is
  BETTER not flat: 7 fully-clean records were added while the pre-existing
  481-baseline defect population is unchanged — the ratchet script correctly
  reports BETTER because it compares against the 481 committed baseline, not
  batch-to-batch). All 7 new records are 0-defect.

### Sprint close-out (Batches J–N, 2026-08-11)

- Branch `codex/cond-enrich-j-n`, cut from `origin/codex/pattern-v2` tip
  (`78c370f` "Cond F-I merge finalize", confirmed ancestor).
- `data/pathology/condition_canon_shortlist.json`: 187 → 209 records
  (22 NEW_CANDIDATE, 14 EXISTING_ENRICH across J/K/L/M/N — 7+9+6+7+7=36
  concepts total, matching the pack's own per-batch concept counts).
- `check-validation-ratchet.js` conditions defect count: 481 (F–I close-out,
  committed baseline) → 425 after Batch N, monotonically improving batch
  over batch (458 → 437 → 433 → 425 → 425). No regressions at any commit;
  the J→K→L→M drops came from a mix of boilerplate replacement on existing
  records and clean new-record additions, while N's all-new-candidate batch
  added 7 clean records without moving the raw defect count (still correctly
  reported BETTER vs the 481 baseline).
- Two multi-record cross-contamination issues resolved this sprint (7-way
  月經不調 essay across gyn records in Batch K; 2-way BPH/prostatitis essay
  swap in Batch K) — larger in scope than any single-pair case fixed in
  Batches F–I.
- Recurring cross-contamination flags carried forward, NOT fixed (out of
  this sprint's scope, for a future content-untangling pass):
  - `cond.asthma` × `cond.post_covid` (flagged Batch F, re-confirmed Batch M
    — still present after 3 batches of not being anyone's candidate)
  - `cond.irregular_menstruation` likely holds the true home for the
    7-way-shared 月經不調 essay (flagged Batch K)
  - `cond.male_infertility` holds a duplicate of `cond.erectile_dysfunction`'s
    real content (flagged Batch K)
- Two scope-broadening/parent-card judgment calls flagged for Fable/Ting
  review this sprint: `cond.chronic_prostatitis` renamed/broadened to a
  parent covering both acute bacterial and chronic prostatitis (Batch K,
  2nd instance of the pattern after Batch H's `cond.chronic_gastritis`);
  `cond.cancer_parent` created as an explicit navigational parent alongside
  4 site-specific child cards authored in the same batch (Batch N).
- A recurring acute-vs-chronic/post-acute identity-boundary pattern
  appeared 3 times (SSHL vs `cond.hearing_loss`, Batch L; acute bacterial
  sinusitis vs `cond.chronic_sinusitis`, Batch L; acute COVID-19 vs
  `cond.post_covid`, Batch M) — worth naming explicitly in the template or a
  future DECISIONS entry, since it is now a load-bearing recurring judgment
  call across two different batches and three different concept pairs.
- Not pushed (per task instructions — branch left for review).

## Skeleton tier — Batch 1: gyn_fertility / pain_msk / gi (2026-08-11)

Ting's uncapped-skeleton ruling (see TING 裁定 in `docs/AI_WORK_HANDOFF.md`):
names-first index records, canon target 209 → ~500. Branch
`codex/cond-skeleton-500`, cut from `origin/codex/pattern-v2` tip `4e644ee`
("Cond J-N merge finalize", 209 records), then rebased onto `7ee6972` ("C4
skeleton-tier carve-out") after that carve-out landed mid-session — see
"C4/skeleton contradiction" note below. Each record carries EXACTLY:
`id`, `entity_type: "biomedical_condition"`, `name_zh`, `name_en`, `category`,
`icd_hint`, `aliases_zh`/`aliases_en` (equal length, may be empty),
`review_status: "skeleton"`, `authored_by: "model_draft"`. No content fields
(no summary/etiology/red_flags/etc.) — absent is honest at this tier, not a
defect.

**Dedupe method**: dumped all 209 existing `cond.*` id/name_zh/name_en/aliases
to a scratch file, exact-scanned every new candidate's Chinese/English/synonym
strings against that list plus every id already added earlier in this same
batch before assigning an id. 0 collisions found — all 68 below are
NEW_CANDIDATE relative to the 209-canon; none required an alias-merge instead
of a new record.

| id | name_zh | name_en | icd_hint | ruling |
|---|---|---|---|---|
| cond.adenomyosis | 子宮腺肌症 | Adenomyosis | N80.0 | NEW — no match on `adenomyosis`/`腺肌症`/`肌腺症` |
| cond.ovarian_cyst | 卵巢囊腫 | Ovarian Cyst | N83.20 | NEW — distinct from `cond.pcos` (cystic morphology, not the syndrome) |
| cond.acute_pid | 急性骨盆腔炎 | Acute Pelvic Inflammatory Disease | N70.9 | NEW — distinct from existing `cond.pid_chronic` (sequelae/chronic state, not the acute episode) |
| cond.bacterial_vaginosis | 細菌性陰道炎 | Bacterial Vaginosis | N76.0 | NEW — distinct from existing `cond.vulvovaginal_candidiasis` (fungal, not bacterial) |
| cond.genitourinary_syndrome_menopause | 停經泌尿生殖症候群 | Genitourinary Syndrome of Menopause | N95.2 | NEW — alias `萎縮性陰道炎`/`Vulvovaginal Atrophy`; no existing GSM/atrophic-vaginitis record |
| cond.mastitis | 乳腺炎 | Mastitis | N61 | NEW — no match |
| cond.cervicitis | 子宮頸炎 | Cervicitis | N72 | NEW — no match |
| cond.cervical_dysplasia | 子宮頸上皮內贅瘤 | Cervical Intraepithelial Neoplasia | N87 | NEW — no match |
| cond.uterine_prolapse | 子宮脫垂 | Uterine Prolapse | N81.4 | NEW — no match |
| cond.pelvic_organ_prolapse | 骨盆器官脫垂 | Pelvic Organ Prolapse | N81.9 | NEW — parent/umbrella term next to uterine_prolapse (specific subtype), same parent/child pattern as `cond.ibd` |
| cond.endometrial_polyp | 子宮內膜息肉 | Endometrial Polyp | N84.0 | NEW — distinct from `cond.uterine_fibroids` (myometrial, not endometrial) |
| cond.postpartum_hemorrhage | 產後出血 | Postpartum Hemorrhage | O72 | NEW — no match |
| cond.placenta_previa | 前置胎盤 | Placenta Previa | O44 | NEW — no match |
| cond.placental_abruption | 胎盤早期剝離 | Placental Abruption | O45 | NEW — no match |
| cond.preterm_labor | 早產 | Preterm Labor | O60 | NEW — no match |
| cond.gestational_diabetes | 妊娠糖尿病 | Gestational Diabetes Mellitus | O24.4 | NEW — distinct from `cond.t2dm`/`cond.type_1_diabetes` (pregnancy-specific) |
| cond.postmenopausal_bleeding | 停經後出血 | Postmenopausal Bleeding | N95.0 | NEW — distinct from `cond.menorrhagia` (reproductive-age heavy bleeding, different red-flag context) |
| cond.cervical_insufficiency | 子宮頸閉鎖不全 | Cervical Insufficiency | N88.3 | NEW — no match |
| cond.gestational_hypertension | 妊娠高血壓 | Gestational Hypertension | O13 | NEW — distinct from `cond.hypertension` (essential) and `cond.preeclampsia` (proteinuria/end-organ involvement) |
| cond.ovarian_torsion | 卵巢扭轉 | Ovarian Torsion | N83.53 | NEW — no match |
| cond.lumbar_spinal_stenosis | 腰椎椎管狹窄症 | Lumbar Spinal Stenosis | M48.06 | NEW — distinct from `cond.lumbar_disc_herniation` |
| cond.pseudogout | 假性痛風 | Pseudogout (CPPD) | M11.2 | NEW — distinct from `cond.gout` (different crystal, per template's non-equivalence rule) |
| cond.sarcopenia | 肌少症 | Sarcopenia | M62.84 | NEW — no match |
| cond.ankylosing_spondylitis | 僵直性脊椎炎 | Ankylosing Spondylitis | M45.9 | NEW — no match |
| cond.si_joint_dysfunction | 薦髂關節功能障礙 | Sacroiliac Joint Dysfunction | M53.2 | NEW — icd_hint uncertain (SI-joint dysfunction spans M53.2X/M46.1 depending on inflammatory vs mechanical framing); used the general spinal-instability chapter code, flagged here per task instruction on ICD uncertainty |
| cond.thoracic_outlet_syndrome | 胸廓出口症候群 | Thoracic Outlet Syndrome | G54.0 | NEW — no match |
| cond.subacromial_impingement | 肩峰下夾擠症候群 | Subacromial Impingement Syndrome | M75.4 | NEW — distinct from `cond.rotator_cuff` (impingement vs tendinopathy, related but not equivalent) |
| cond.shoulder_labral_tear | 肩關節唇損傷 | Shoulder Labral Tear | S43.43 | NEW — no match |
| cond.tfcc_injury | 三角纖維軟骨複合體損傷 | Triangular Fibrocartilage Complex (TFCC) Injury | S63.539 | NEW — no match |
| cond.patellar_tendinopathy | 髕腱病變 | Patellar Tendinopathy | M76.5 | NEW — alias `跳躍膝`/`Jumper's Knee`; distinct from `cond.patellofemoral_pain` (tendon vs joint-surface pain) |
| cond.shin_splints | 脛前疼痛症候群 | Medial Tibial Stress Syndrome | M76.81 | NEW — no match |
| cond.stress_fracture | 應力性骨折 | Stress Fracture | M84.3 | NEW — no match |
| cond.generalized_osteoarthritis | 全身性骨關節炎 | Generalized Osteoarthritis | M15.9 | NEW — parent/umbrella next to `cond.knee_osteoarthritis`/`cond.hip_osteoarthritis` (site-specific children), same pattern as `cond.ibd` |
| cond.psoriatic_arthritis | 乾癬性關節炎 | Psoriatic Arthritis | L40.5 | NEW — distinct from `cond.psoriasis` (skin) and `cond.rheumatoid_arthritis` (different autoimmune mechanism) |
| cond.spondylolisthesis | 脊椎滑脫症 | Spondylolisthesis | M43.1 | NEW — no match |
| cond.spondylolysis | 椎弓解離症 | Spondylolysis | M43.0 | NEW — distinct from spondylolisthesis (defect vs slippage) |
| cond.shoulder_instability | 肩關節不穩定 | Shoulder Instability | M25.319 | NEW — no match |
| cond.cervicogenic_headache | 頸源性頭痛 | Cervicogenic Headache | G44.841 | NEW — distinct from `cond.tension_headache`/`cond.migraine` (structural cervical origin) |
| cond.costochondritis | 肋軟骨炎 | Costochondritis | M94.0 | NEW — no match |
| cond.coccydynia | 尾骨痛 | Coccydynia | M53.3 | NEW — no match |
| cond.myositis | 肌炎 | Myositis | M60.9 | NEW — distinct from `cond.myofascial_pain` (inflammatory vs mechanical) |
| cond.polymyalgia_rheumatica | 風濕性多肌痛症 | Polymyalgia Rheumatica | M35.3 | NEW — no match |
| cond.acute_gastroenteritis | 急性腸胃炎 | Acute Gastroenteritis | A09 | NEW — no match |
| cond.h_pylori_infection | 幽門螺旋桿菌感染 | Helicobacter Pylori Infection | B98.0 | NEW — distinct from `cond.peptic_ulcer` (causative infection vs the ulcer disease) |
| cond.acute_cholecystitis | 急性膽囊炎 | Acute Cholecystitis | K81.0 | NEW — distinct from `cond.gallstone_disease` (acute inflammation vs the stone disease) |
| cond.chronic_pancreatitis | 慢性胰臟炎 | Chronic Pancreatitis | K86.1 | NEW — distinct from `cond.acute_pancreatitis` |
| cond.diverticular_disease | 憩室病／憩室炎 | Diverticular Disease | K57.9 | NEW — no match |
| cond.anal_fissure | 肛裂 | Anal Fissure | K60.2 | NEW — distinct from `cond.hemorrhoids` |
| cond.celiac_disease | 乳糜瀉 | Celiac Disease | K90.0 | NEW — no match |
| cond.lactose_intolerance | 乳糖不耐症 | Lactose Intolerance | E73.9 | NEW — no match |
| cond.crohn_disease | 克隆氏症 | Crohn Disease | K50.9 | NEW — subtype child of existing parent `cond.ibd`, same pattern as `cond.chronic_prostatitis`/BPH-family cards |
| cond.ulcerative_colitis | 潰瘍性結腸炎 | Ulcerative Colitis | K51.9 | NEW — subtype child of existing parent `cond.ibd` |
| cond.barrett_esophagus | 巴瑞特食道 | Barrett Esophagus | K22.7 | NEW — distinct from `cond.gerd` (a GERD complication, not GERD itself) |
| cond.achalasia | 賁門失弛緩症 | Achalasia | K22.0 | NEW — no match |
| cond.hiatal_hernia | 食道裂孔疝氣 | Hiatal Hernia | K44.9 | NEW — no match |
| cond.colonic_polyp | 大腸息肉 | Colonic Polyp | K63.5 | NEW — distinct from `cond.colorectal_cancer` |
| cond.ischemic_colitis | 缺血性結腸炎 | Ischemic Colitis | K55.9 | NEW — no match |
| cond.rectal_prolapse | 直腸脫垂 | Rectal Prolapse | K62.3 | NEW — no match |
| cond.perianal_abscess | 肛門周圍膿瘍 | Perianal Abscess | K61.0 | NEW — no match |
| cond.anal_fistula | 肛門瘻管 | Anal Fistula | K60.3 | NEW — distinct from perianal abscess (chronic tract vs acute collection) |
| cond.chronic_hepatitis_b | 慢性B型肝炎 | Chronic Hepatitis B | B18.1 | NEW — subtype child of existing parent `cond.viral_hepatitis` |
| cond.chronic_hepatitis_c | 慢性C型肝炎 | Chronic Hepatitis C | B18.2 | NEW — subtype child of existing parent `cond.viral_hepatitis` |
| cond.autoimmune_hepatitis | 自體免疫性肝炎 | Autoimmune Hepatitis | K75.4 | NEW — no match |
| cond.primary_biliary_cholangitis | 原發性膽汁性膽管炎 | Primary Biliary Cholangitis | K74.3 | NEW — no match |
| cond.sibo | 小腸細菌過度增生 | Small Intestinal Bacterial Overgrowth | K90.89 | NEW — distinct from `cond.ibs` (overlapping symptoms, distinct mechanism per non-equivalence rule); icd_hint approximate (SIBO has no dedicated ICD-10-CM code, K90.89 "other intestinal malabsorption" is the closest billing proxy) |
| cond.gastroparesis | 胃輕癱 | Gastroparesis | K31.84 | NEW — distinct from `cond.functional_dyspepsia` |
| cond.duodenitis | 十二指腸炎 | Duodenitis | K29.80 | NEW — no match |
| cond.upper_gi_bleeding | 上消化道出血 | Upper Gastrointestinal Bleeding | K92.2 | NEW — no match |

**Dedupe summary this batch**: 68 candidates → 68 NEW, 0 alias-merged, 0
collisions with the 209-canon or with each other.

**ICD uncertainty flagged**: `cond.si_joint_dysfunction` (M53.2, see row
above — genuinely ambiguous between mechanical/inflammatory coding
conventions, not a guess dressed as certainty).

**Judgment calls (parent/child, same pattern as Batches H/K/N)**:
`cond.pelvic_organ_prolapse` (parent) added alongside `cond.uterine_prolapse`
(specific subtype, this batch); `cond.generalized_osteoarthritis` (parent)
added alongside the existing `cond.knee_osteoarthritis`/`cond.hip_osteoarthritis`
(site-specific children); `cond.crohn_disease`/`cond.ulcerative_colitis` and
`cond.chronic_hepatitis_b`/`cond.chronic_hepatitis_c` added as subtype
children of the existing parent cards `cond.ibd`/`cond.viral_hepatitis`
(which were themselves authored as parent/navigational cards in Batches H).

**C4/skeleton contradiction found and resolved mid-session**: the first
validator run on this batch (pre-carve-out) showed the ratchet regressing
425→493 (exactly +68, one per new record) — isolated to code C4 ("no red
flags"), which had no exemption for content-free skeleton records. Flagged
as `needs input` rather than proceeding through all 4 batches at that defect
rate. Resolution landed as commit `7ee6972` on `origin/codex/pattern-v2`
("C4 skeleton-tier carve-out"): `review_status: "skeleton"` + zero content
fields now counts under new code **N4** (note, non-blocking) instead of C4.
Branch was rebased onto `7ee6972` before re-inserting this batch. Re-run
confirms the fix: C4 51/51 (only pre-existing records, unchanged from
pre-batch), **N4 68/68** (all new skeletons, exactly this batch's size),
ratchet **PASS** (conditions flat at 425).

**Validator state after this batch's insertion** (not yet committed at time
of writing this row — see commit below):
`data/pathology/condition_canon_shortlist.json` 209 → 277 records.
`node scripts/validate-condition-standard.js`: 425 blocking defects (flat —
C4 51, C5 227/114, C10 147/76, all pre-existing debt, none from this batch).
`check-validation-ratchet.js`: conditions flat at 425, **PASS**.
`validate-content-junk.js`: PASS. `validate-relations.js`: passed (no
broken links introduced; skeleton records carry no relation fields to
validate).

## Skeleton tier — Batch 2: psych_sleep / respiratory / neuro (2026-08-11)

Same method as Batch 1: exact-scanned all ids/name_zh/name_en/aliases now
in canon (277 records, including Batch 1's own additions) plus every id
already drafted earlier in this batch before assigning each new id.
71 candidates → **71 NEW, 0 alias-merged, 0 collisions**.

**Category dedupe notes** (full per-record table omitted for length; ids are
self-descriptive — see the inserted records for name_zh/name_en/icd_hint):

- `psych_sleep` (25): all NEW. Checked against existing `cond.anxiety`
  (GAD-specific), `cond.depression` (MDD-specific), `cond.ptsd`, `cond.adhd`,
  `cond.ocd`, `cond.substance_use_disorder`, `cond.eating_disorder` — none of
  the 25 new DSM categories (social anxiety, specific phobia, bipolar, SAD,
  ASD, narcolepsy, sleepwalking, sleep terror, nightmare disorder, adjustment
  disorder, postpartum depression, BPD, schizophrenia, learning disorder,
  Tourette, trichotillomania, prolonged grief, agoraphobia, separation
  anxiety, BDD, hoarding, excoriation, acute stress disorder, dissociative
  disorder, reactive attachment disorder) overlap an existing card's named
  diagnosis. `cond.postpartum_depression` checked against
  `cond.menopause_syndrome`/gyn cards — distinct life-stage mood disorder,
  no overlap.
- `respiratory` (20): all NEW. Checked against existing `cond.asthma`,
  `cond.copd`, `cond.chronic_sinusitis`, `cond.chronic_cough`,
  `cond.acute_bronchitis`, `cond.sleep_apnea`, `cond.pneumonia`,
  `cond.pneumothorax` — `cond.chronic_bronchitis`/`cond.emphysema` are
  COPD's two component phenotypes, kept as distinct child concepts next to
  the existing `cond.copd` parent card (same parent/child pattern as
  `cond.ibd`); `cond.central_sleep_apnea` kept distinct from existing
  `cond.sleep_apnea` (obstructive) per template's non-equivalence rule
  (different mechanism, both real sleep-medicine diagnoses).
- `neuro` (26): all NEW. Checked against existing `cond.stroke_rehab`
  (post-stroke rehab stage, NOT the acute event) — `cond.acute_ischemic_stroke`,
  `cond.intracerebral_hemorrhage`, `cond.subarachnoid_hemorrhage` are the
  acute-emergency entities, same acute-vs-chronic/post-acute boundary
  pattern documented in Batches L/M (SSHL vs hearing_loss, COVID vs
  post_covid). Checked against existing `cond.trigeminal_neuralgia`,
  `cond.postherpetic_neuralgia` — `cond.occipital_neuralgia`/
  `cond.glossopharyngeal_neuralgia` are distinct nerve-specific neuralgias,
  no overlap. Checked against existing `cond.migraine`/`cond.tension_headache`
  — `cond.medication_overuse_headache`/`cond.cervicogenic_headache`(Batch 1)/
  `cond.menstrual_migraine` are distinct recognized headache-medicine
  diagnoses, not synonyms.

**ICD notes**: `cond.concussion_mtbi` uses `S06.0X0A` (a full 7-character
ICD-10-CM code including the "initial encounter" 7th character, since
concussion codes require an encounter-type suffix) rather than a bare
category code — flagged here as a format difference from this batch's other
entries, not an error. `cond.menstrual_migraine` uses `G43.829` (migraine,
unspecified, intractable, without status migrainosus) as the closest
existing ICD-10-CM leaf; there is no dedicated "menstrual migraine" code in
ICD-10-CM, so the closest general migraine leaf was used and is noted here
per the task's ICD-uncertainty instruction.

**Validator state after this batch's insertion**:
`data/pathology/condition_canon_shortlist.json` 277 → 348 records.
`validate-condition-standard.js`: 425 blocking defects (flat — C4 51/51
still only pre-existing, N4 139/139 = Batch 1's 68 + this batch's 71).
`check-validation-ratchet.js`: conditions flat at 425, **PASS**.
`validate-content-junk.js`: PASS. `validate-relations.js`: passed.
