# AcuTing OS Legacy Namespace & Retired-ID Integrity Inventory (Task 10A Round 2)

> **Execution Date**: 2026-08-25  
> **Audit Version**: 2.0.0  
> **Audit Status**: **INVENTORY COMPLETE (READ-ONLY)**  
> **Safety Boundary**: 0 Canonical / Generated / Workflow / Relation Mutations  

---

## 1. Executive Summary

| Metric | Measurement | Interpretation |
|---|---|---|
| **Total Valid Entity Namespaces** | **93** | Distinct entity/staging namespaces (decimal/version tokens excluded) |
| **D11 Canonical Diagnostic Namespaces** | **4** (`cond.*`, `tdis.*`, `pattern.*`, `sym.*`) | DECISIONS.md D11 locked diagnosis-side canonical namespaces |
| **Legacy Diagnostic Candidate Namespaces** | **4** (`western_condition.*`, `eastern_disease.*`, `pat.*`, `symptom.*`) | Diagnostic-side candidates for future migration adjudication |
| **Non-Diagnostic Entity Namespaces** | **29** | Domain entity namespaces (`herb`, `formula`, `pair`, `drug`, `supp`, `tung`, etc.) |
| **Staging & Taxonomy Namespaces** | **4** | `med.*` (medication staging), `rf.*` (red flags), `xwalk.*` (crosswalk sidecar), `tdx.*` (TCM taxonomy) |
| **Unique Legacy Diagnostic Candidate IDs** | **164** | Distinct candidate IDs in legacy diagnostic namespaces |
| **Legacy Diagnostic Total Occurrences** | **712** | Raw string occurrences across data files |
| **Legacy Diagnostic Relationship References** | **222** | Occurrences in relationship/reference fields |
| **Active → Deprecated Reference Edges** | **34** | Real relationship edges from active records to deprecated targets (identity fields excluded) |
| **Active → Import Stub Reference Edges** | **0** | Real relationship edges from active records to import stub targets |
| **UI Duplicate Namespace Universes** | **2** | Renderers mapping multiple namespaces to the same entity type |
| **Unresolved Mapping Candidates** | **154** | Legacy diagnostic candidate IDs requiring human/architectural crosswalk adjudication |

---

## 2. Namespace Inventory by Classification

| Namespace | Classification | Reference Count | Unique IDs | Sample IDs | Source Files Count |
|---|---|---|---|---|---|
| `standard_acupoint.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 13420 | 745 | `BL1`, `BL2` | 394 |
| `cond.*` | `D11_CANONICAL_DIAGNOSTIC` | 5353 | 533 | `cond.cluster_headache`, `cond.depression` | 39 |
| `pattern.*` | `D11_CANONICAL_DIAGNOSTIC` | 4609 | 158 | `pattern.kidney_essence_deficiency`, `pattern.liver_kidney_yin_deficiency` | 22 |
| `formula.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 3697 | 244 | `formula.jia_wei_xiao_yao_san`, `formula.jin_gui_shen_qi_wan` | 34 |
| `cloudtcm.*` | `UNKNOWN` | 3224 | 2816 | `cloudtcm.disease_entry.11`, `cloudtcm.disease_entry.19` | 6 |
| `herb.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 2852 | 370 | `herb.bai_shao`, `herb.da_zao` | 19 |
| `icd10.*` | `CODE_SYSTEM` | 2613 | 1338 | `G43.909`, `H81.10` | 10 |
| `sym.*` | `D11_CANONICAL_DIAGNOSTIC` | 823 | 136 | `sym.eye`, `sym.general_limb` | 12 |
| `tdis.*` | `D11_CANONICAL_DIAGNOSTIC` | 801 | 163 | `tdis.chuan_zheng`, `tdis.fu_tong` | 6 |
| `tdx.*` | `TCM_DISEASE_TAXONOMY_NAMESPACE` | 739 | 45 | `tdx.internal_medicine`, `tdx.internal_medicine.externally_contracted_febrile` | 3 |
| `drug.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 737 | 98 | `drug.clomiphene_citrate`, `drug.estradiol` | 9 |
| `rf.*` | `RED_FLAG_REGISTRY_NAMESPACE` | 681 | 226 | `rf.chronic_low_back_pain.legacy01`, `rf.chronic_low_back_pain.legacy02` | 4 |
| `tung.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 555 | 277 | `tung.1010.01`, `tung.1010.02` | 3 |
| `pair.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 454 | 243 | `pair.rel.dan_xing`, `pair.rel.xiang_sha` | 12 |
| `contra.*` | `UNKNOWN` | 452 | 452 | `contra.BL1.A0.clinical_pearls_0`, `contra.BL1.A1.combine_points_zh` | 4 |
| `ear.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 431 | 215 | `ear.abdomen`, `ear.abdominal_distension_area` | 3 |
| `pat.*` | `LEGACY_DIAGNOSTIC_CANDIDATE` | 411 | 141 | `pat.心脾兩虛`, `pat.肝腎陰虛` | 7 |
| `western_condition.*` | `LEGACY_DIAGNOSTIC_CANDIDATE` | 180 | 12 | `western_condition.anovulation`, `western_condition.insulin_resistance` | 10 |
| `metric.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 162 | 31 | `metric.night_wakings`, `metric.pain_score` | 10 |
| `xwalk.*` | `CROSSWALK_INTEROP_NAMESPACE` | 150 | 150 | `xwalk.endometriosis`, `xwalk.pcos` | 1 |
| `ex.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 146 | 72 | `ex.hn1`, `ex.hn2` | 3 |
| `med.*` | `MEDICATION_STAGING_NAMESPACE` | 142 | 12 | `med.clomiphene_citrate`, `med.follitropin_alfa` | 8 |
| `supp.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 139 | 47 | `supp.ashwagandha`, `supp.iron` | 9 |
| `drugsystem.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 138 | 7 | `drugsystem.autonomic_nervous_system`, `drugsystem.cardiovascular_renal` | 4 |
| `drugtarget.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 137 | 38 | `drugtarget.aldosterone_receptor`, `drugtarget.carbonic_anhydrase` | 3 |
| `drugclass.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 129 | 56 | `drugclass.carbonic_anhydrase_inhibitors`, `drugclass.loop_diuretics` | 3 |
| `five_shu.*` | `UNKNOWN` | 125 | 5 | `five_shu.he_sea`, `five_shu.jing_river` | 3 |
| `bp.*` | `UNKNOWN` | 118 | 118 | `bp.myasthenia_gravis`, `bp.psoriasis` | 1 |
| `eastern_disease.*` | `LEGACY_DIAGNOSTIC_CANDIDATE` | 111 | 6 | `eastern_disease.amenorrhea`, `eastern_disease.delayed_menstruation` | 6 |
| `fertility.*` | `UNKNOWN` | 71 | 21 | `fertility.baseline_constitution_review`, `fertility.bleeding_pattern_review` | 5 |
| `formula_category.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 64 | 18 | `formula_category.clear_heat`, `formula_category.harmonize` | 3 |
| `life.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 55 | 46 | `life.caffeine.coffee`, `life.sleep.irregular_schedule` | 4 |
| `cmp.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 54 | 43 | `cmp.insomnia_patterns`, `cmp.ivf_cycle_patterns` | 1 |
| `organ.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 51 | 7 | `organ.kidney`, `organ.liver` | 3 |
| `move.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 46 | 46 | `move.neck_extension`, `move.neck_flexion` | 1 |
| `warfarin.*` | `UNKNOWN` | 41 | 41 | `warfarin.board.593952b9`, `warfarin.board.8f6e1ed4` | 1 |
| `modality.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 33 | 18 | `modality.acupuncture`, `modality.auricular_acupuncture` | 5 |
| `apixaban.*` | `UNKNOWN` | 28 | 28 | `apixaban.board.23d556b6`, `apixaban.board.a4d05e75` | 1 |
| `exposure.*` | `UNKNOWN` | 27 | 14 | `exposure.lead`, `exposure.mercury` | 5 |
| `furosemide.*` | `UNKNOWN` | 24 | 24 | `furosemide.board.35ecae84`, `furosemide.board.67823b9c` | 1 |
| `auric_rx.*` | `UNKNOWN` | 23 | 23 | `auric_rx.allergy`, `auric_rx.asthma` | 1 |
| `visits.*` | `UNKNOWN` | 23 | 23 | `visits.cycle_day`, `visits.fertility_phase` | 1 |
| `adverse_event.*` | `UNKNOWN` | 22 | 13 | `adverse_event.bruising`, `adverse_event.dizziness` | 4 |
| `atorvastatin.*` | `UNKNOWN` | 22 | 22 | `atorvastatin.board.4cbb8d30`, `atorvastatin.board.949adead` | 1 |
| `metoprolol.*` | `UNKNOWN` | 21 | 21 | `metoprolol.board.80596645`, `metoprolol.board.a7487749` | 1 |
| `acupuncture_scope_zh.*` | `UNKNOWN` | 20 | 1 | `acupuncture_scope_zh.note` | 1 |
| `losartan.*` | `UNKNOWN` | 20 | 20 | `losartan.board.37fbf16d`, `losartan.board.4b2aca3f` | 1 |
| `lisinopril.*` | `UNKNOWN` | 20 | 20 | `lisinopril.board.2bc22ed3`, `lisinopril.board.6a54e7f3` | 1 |
| `hydrochlorothiazide.*` | `UNKNOWN` | 19 | 19 | `hydrochlorothiazide.board.11b983d6`, `hydrochlorothiazide.board.4ff3e4c2` | 1 |
| `clopidogrel.*` | `UNKNOWN` | 17 | 17 | `clopidogrel.board.3a7b79a1`, `clopidogrel.board.74035d0d` | 1 |
| `influential.*` | `UNKNOWN` | 16 | 8 | `influential.fu`, `influential.gu` | 2 |
| `cases.*` | `UNKNOWN` | 16 | 16 | `cases.case_category`, `cases.case_title` | 1 |
| `digoxin.*` | `UNKNOWN` | 16 | 16 | `digoxin.board.1e9168c6`, `digoxin.board.324db7e2` | 1 |
| `edge.*` | `UNKNOWN` | 14 | 14 | `edge.condition_acupoint_protocols`, `edge.condition_formulas` | 1 |
| `avs.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 13 | 13 | `avs.cold_damp_diet`, `avs.damp_heat_diet` | 1 |
| `source.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 13 | 5 | `source.formula_knowledge_base.pending`, `source.github.mengqi97_chinese_medical_dataset` | 3 |
| `spironolactone.*` | `UNKNOWN` | 13 | 13 | `spironolactone.board.62795708`, `spironolactone.board.bc498023` | 1 |
| `soap_notes.*` | `UNKNOWN` | 12 | 12 | `soap_notes.assessment_pathomechanism_zh`, `soap_notes.assessment_treatment_principle_zh` | 1 |
| `learn.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 12 | 10 | `learn.category.acupuncture`, `learn.category.auricular` | 1 |
| `aspirin.*` | `UNKNOWN` | 12 | 12 | `aspirin.board.6259e5de`, `aspirin.board.e5b61179` | 1 |
| `symptom.*` | `LEGACY_DIAGNOSTIC_CANDIDATE` | 10 | 5 | `symptom.dizziness`, `symptom.facial_redness` | 2 |
| `rivaroxaban.*` | `UNKNOWN` | 10 | 10 | `rivaroxaban.board.58d37817`, `rivaroxaban.board.73db2751` | 1 |
| `amlodipine.*` | `UNKNOWN` | 10 | 10 | `amlodipine.board.55cd4432`, `amlodipine.board.62cd6912` | 1 |
| `soap.*` | `UNKNOWN` | 9 | 8 | `soap.fixture.v2`, `soap.outcomeMetricLinks` | 3 |
| `reth.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 9 | 9 | `reth.american_indian_alaska_native`, `reth.asian` | 1 |
| `enoxaparin.*` | `UNKNOWN` | 7 | 7 | `enoxaparin.board.5d360b9e`, `enoxaparin.board.98aa4bdb` | 1 |
| `doc_req.*` | `UNKNOWN` | 6 | 6 | `doc_req.chief_complaint`, `doc_req.diagnosis_code_support` | 1 |
| `safety.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 6 | 6 | `safety.active_chemotherapy`, `safety.active_radiation` | 1 |
| `derived.*` | `UNKNOWN` | 6 | 6 | `derived.flag.clopidogrel.cyp2c19_metabolizer_relevance`, `derived.flag.enoxaparin.injection_site_bruising` | 1 |
| `case.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 5 | 5 | `case.allergies`, `case.currentMeds` | 4 |
| `patients.*` | `UNKNOWN` | 5 | 5 | `patients.birth_year`, `patients.gender_identity` | 1 |
| `case_intake_baseline.*` | `UNKNOWN` | 5 | 5 | `case_intake_baseline.allergies`, `case_intake_baseline.biomedical_history` | 1 |
| `expevt.*` | `UNKNOWN` | 5 | 5 | `expevt.fixture.1`, `expevt.fixture.2` | 1 |
| `system.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 5 | 5 | `system.auricular`, `system.conditions_evidence` | 1 |
| `acuting_os.*` | `UNKNOWN` | 5 | 1 | `acuting_os.cr010_condition_detail_research.v1` | 5 |
| `visit.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 4 | 2 | `visit.demo_001.001`, `visit.sample_001.001` | 4 |
| `patient.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 4 | 2 | `patient.demo_001`, `patient.sample_001` | 2 |
| `patient_records.*` | `UNKNOWN` | 4 | 4 | `patient_records.billing_ready_documentation`, `patient_records.case_intake` | 1 |
| `english_exam_track.*` | `UNKNOWN` | 4 | 4 | `english_exam_track.actions`, `english_exam_track.contraindications` | 1 |
| `scalp.*` | `UNKNOWN` | 4 | 4 | `scalp.kt.coronal_suture`, `scalp.kt.lambdoid_suture` | 1 |
| `visit_acupuncture.*` | `UNKNOWN` | 3 | 3 | `visit_acupuncture.acupoint_code`, `visit_acupuncture.retention_minutes` | 1 |
| `lifefac.*` | `UNKNOWN` | 3 | 3 | `lifefac.fixture.1`, `lifefac.fixture.2` | 1 |
| `med_class.*` | `NON_DIAGNOSTIC_ENTITY_NAMESPACE` | 3 | 3 | `med_class.clomiphene`, `med_class.letrozole` | 1 |
| `acuting.*` | `UNKNOWN` | 2 | 2 | `acuting.auricular.gb93.index.v1`, `acuting.auricular.gb93.worklist.v1` | 2 |
| `visit_formulas.*` | `UNKNOWN` | 2 | 2 | `visit_formulas.formula_id`, `visit_formulas.formula_name_text` | 1 |
| `visit_western_medications.*` | `UNKNOWN` | 2 | 2 | `visit_western_medications.medication_id`, `visit_western_medications.medication_name_text` | 1 |
| `category.*` | `UNKNOWN` | 2 | 1 | `category.formulas` | 1 |
| `billing.*` | `UNKNOWN` | 1 | 1 | `billing.visit_demo_001` | 1 |
| `visit_outcomes.*` | `UNKNOWN` | 1 | 1 | `visit_outcomes.notes` | 1 |
| `agentexp.*` | `UNKNOWN` | 1 | 1 | `agentexp.fixture.mg` | 1 |
| `envexp.*` | `UNKNOWN` | 1 | 1 | `envexp.fixture.mold` | 1 |
| `advevt.*` | `UNKNOWN` | 1 | 1 | `advevt.fixture.1` | 1 |
| `pattern_library.*` | `UNKNOWN` | 1 | 1 | `pattern_library.related_conditions` | 1 |

---

## 3. Legacy Diagnostic Candidates & Mechanical Crosswalk Status

| Legacy ID | Namespace | Total Occurrences | Relation Field Refs | Mapping Status | Exact Canonical Twin / Explicit Crosswalk | Mechanical Name Match Candidates |
|---|---|---|---|---|---|---|
| `eastern_disease.amenorrhea` | `eastern_disease` | 13 | 10 | `MULTIPLE_CANDIDATES` | — | `tdis.bi_jing`, `sym.amenorrhea` |
| `eastern_disease.delayed_menstruation` | `eastern_disease` | 8 | 5 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `tdis.yue_jing_hou_qi` |
| `eastern_disease.dysmenorrhea` | `eastern_disease` | 11 | 9 | `MULTIPLE_CANDIDATES` | — | `tdis.tong_jing`, `sym.dysmenorrhea` |
| `eastern_disease.infertility` | `eastern_disease` | 44 | 41 | `NO_CANDIDATE_FOUND` | — | none |
| `eastern_disease.irregular_menstruation` | `eastern_disease` | 26 | 24 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `cond.irregular_menstruation` |
| `eastern_disease.threatened_miscarriage_context` | `eastern_disease` | 9 | 7 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.1` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.bi_syndrome` | `pat` | 1 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.blood_deficiency` | `pat` | 1 | 0 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.blood_deficiency` (twin) | `pattern.blood_deficiency` |
| `pat.blood_stasis` | `pat` | 1 | 0 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.blood_stasis` (twin) | `pattern.blood_stasis` |
| `pat.cold_deficiency` | `pat` | 1 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.damp_heat` | `pat` | 1 | 0 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.damp_heat` (twin) | `pattern.damp_heat` |
| `pat.dampness` | `pat` | 1 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.phlegm` | `pat` | 1 | 0 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.phlegm` (twin) | `pattern.phlegm` |
| `pat.yang_deficiency` | `pat` | 1 | 0 | `EXACT_CANONICAL_TWIN_EXISTS` | `pattern.yang_deficiency` (twin) | `pattern.yang_deficiency` |
| `pat.下焦濕熱` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.damp_heat_lower_burner` |
| `pat.下焦血瘀` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.五苓散` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.半夏瀉心湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.吳茱萸湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.四逆散` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.外感風寒` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.外感風濕` | `pat` | 3 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.外感風熱` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.大腸濕熱` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.large_intestine_damp_heat` |
| `pat.大青龍湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.太陽病輕` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.寒凝肝脈` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.cold_stagnation_liver_channel` |
| `pat.小建中湯類方` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.小柴胡湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.小青龍湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.少陰寒化` | `pat` | 3 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.少陰陰虛火旺` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.心火旺盛` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.心胃火盛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heart_stomach_fire` |
| `pat.心脈瘀阻` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.心脾兩虛` | `pat` | 7 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heart_spleen_deficiency` |
| `pat.心腎不交` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heart_kidney_not_communicating` |
| `pat.心血虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heart_blood_deficiency` |
| `pat.心陰虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heart_yin_deficiency` |
| `pat.心陽虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heart_yang_deficiency` |
| `pat.承氣湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.柴胡桂枝乾薑湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.柴胡桂枝湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.柴胡湯類方` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.桂枝加葛根湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.桂枝湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.桂枝湯類方` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.氣滯血瘀` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.qi_stagnation_blood_stasis` |
| `pat.氣秘` | `pat` | 6 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.qi_constipation` |
| `pat.氣虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.qi_deficiency` |
| `pat.氣血不和` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.氣血兩虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.qi_blood_deficiency` |
| `pat.氣血虛弱` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.氣陰兩虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.qi_yin_deficiency` |
| `pat.水氣凌心` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.water_qi_attacking_heart` |
| `pat.水飲內停` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.water_fluid_retention` |
| `pat.清陽不升` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.溼熱鬱滯經絡` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.濕熱` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.damp_heat` |
| `pat.濕熱浸淫` | `pat` | 6 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.damp_heat_skin_invasion` |
| `pat.濕熱瀰漫三焦` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.濕痰` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.炙甘草湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.熱擾胸膈` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heat_disturbing_chest_diaphragm` |
| `pat.熱毒熾盛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heat_toxin_blazing` |
| `pat.熱秘` | `pat` | 6 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.heat_constipation` |
| `pat.燥氣傷肺` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.理中湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.當歸四逆湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.痰氣互結` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.phlegm_qi_binding` |
| `pat.痰濕中阻` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.痰瘀互結` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.phlegm_stasis_binding` |
| `pat.瘀血阻絡` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.白虎湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.真武湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.肝氣鬱結` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_qi_stagnation` |
| `pat.肝火上炎` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_fire` |
| `pat.肝火犯肺` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_fire_scorching_lung` |
| `pat.肝火犯胃` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_fire_invading_stomach` |
| `pat.肝胃不和` | `pat` | 7 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_stomach_disharmony` |
| `pat.肝胃氣滯` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.肝脾不調` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.肝腎不足` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.肝腎陰虛` | `pat` | 8 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_kidney_yin_deficiency` |
| `pat.肝膽火盛` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.肝血瘀滯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.肝血虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_blood_deficiency` |
| `pat.肝陰虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_yin_deficiency` |
| `pat.肝陽上亢` | `pat` | 8 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_yang_rising` |
| `pat.肝鬱化火` | `pat` | 5 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.liver_depression_transforming_fire` |
| `pat.肝鬱脾虛` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.肝鬱血虛` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.肺氣虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.lung_qi_deficiency` |
| `pat.肺氣虛寒` | `pat` | 5 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.lung_qi_deficiency_cold` |
| `pat.肺熱壅盛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.lung_heat_excess` |
| `pat.肺胃燥熱` | `pat` | 5 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.lung_stomach_dryness_heat` |
| `pat.胃寒` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.stomach_cold` |
| `pat.胃熱` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.stomach_heat` |
| `pat.胃陰虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.stomach_yin_deficiency` |
| `pat.脾不統血` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.spleen_not_governing_blood` |
| `pat.脾氣虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.spleen_qi_deficiency` |
| `pat.脾氣虛弱` | `pat` | 5 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.脾約` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.spleen_constriction` |
| `pat.脾胃氣虛` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.脾胃濕熱` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.damp_heat_spleen_stomach` |
| `pat.脾胃虛寒` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.脾胃虛弱` | `pat` | 7 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.脾胃陽虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.spleen_stomach_yang_deficiency` |
| `pat.脾腎陽虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.spleen_kidney_yang_deficiency` |
| `pat.脾虛濕困` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.spleen_deficiency_damp_encumbrance` |
| `pat.脾虛濕阻` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.脾陽虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.spleen_yang_deficiency` |
| `pat.腎不納氣` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.kidney_not_grasping_qi` |
| `pat.腎氣不固` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.kidney_qi_not_firm` |
| `pat.腎氣虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.kidney_qi_deficiency` |
| `pat.腎精不足` | `pat` | 7 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.kidney_essence_deficiency` |
| `pat.腎精虧虛` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.腎陰虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.kidney_yin_deficiency` |
| `pat.腎陰虧虛` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.腎陽虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.kidney_yang_deficiency` |
| `pat.腎陽虛水泛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.kidney_yang_deficiency_water_flooding` |
| `pat.膀胱濕熱` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.bladder_damp_heat` |
| `pat.膀胱虛寒` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.bladder_deficiency_cold` |
| `pat.膽熱犯胃` | `pat` | 6 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.gallbladder_heat_invading_stomach` |
| `pat.臟腑虛弱` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.苓桂朮甘湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.葛根湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.虛秘` | `pat` | 6 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.deficiency_constipation` |
| `pat.血瘀` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.blood_stasis` |
| `pat.血瘀閉阻` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.血虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.blood_deficiency` |
| `pat.血虛風燥` | `pat` | 7 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.blood_deficiency_wind_dryness` |
| `pat.越婢加朮湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.陰虛` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.yin_deficiency` |
| `pat.陰虛火旺` | `pat` | 7 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.yin_deficiency_fire_flaring` |
| `pat.雜病類方証` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.風寒濕痹` | `pat` | 2 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.wind_cold_damp_bi` |
| `pat.風寒襲絡` | `pat` | 7 | 0 | `MECHANICAL_NAME_CANDIDATE_ONLY` | — | `pattern.wind_cold_invading_collaterals` |
| `pat.風火上擾` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.風熱相搏` | `pat` | 6 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.食傷脾胃` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.麻杏石甘湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.麻黃湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.麻黃湯類方` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.麻黃附子細辛湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `pat.黃耆桂枝五物湯` | `pat` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `symptom.dizziness` | `symptom` | 2 | 0 | `EXACT_CANONICAL_TWIN_EXISTS` | `sym.dizziness` (twin) | `tdis.xuan_yun`, `sym.dizziness` |
| `symptom.facial_redness` | `symptom` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `symptom.headache` | `symptom` | 2 | 0 | `EXACT_CANONICAL_TWIN_EXISTS` | `sym.headache` (twin) | `tdis.tou_tong`, `sym.headache` |
| `symptom.irritability` | `symptom` | 2 | 0 | `EXACT_CANONICAL_TWIN_EXISTS` | `sym.irritability` (twin) | `sym.irritability` |
| `symptom.lumbar_soreness` | `symptom` | 2 | 0 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.anovulation` | `western_condition` | 13 | 9 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.diminished_ovarian_reserve` | `western_condition` | 9 | 7 | `EXACT_CANONICAL_TWIN_EXISTS` | `cond.diminished_ovarian_reserve` (twin) | `cond.diminished_ovarian_reserve` |
| `western_condition.embryo_transfer` | `western_condition` | 11 | 7 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.endometriosis_context` | `western_condition` | 13 | 9 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.insulin_resistance` | `western_condition` | 11 | 7 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.ivf_cycle` | `western_condition` | 13 | 9 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.luteal_support` | `western_condition` | 15 | 11 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.male_factor_context` | `western_condition` | 5 | 3 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.ovulatory_factor_context` | `western_condition` | 15 | 11 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.pcos` | `western_condition` | 34 | 27 | `EXACT_CANONICAL_TWIN_EXISTS` | `cond.pcos` (twin) | none |
| `western_condition.recurrent_pregnancy_loss_context` | `western_condition` | 11 | 7 | `NO_CANDIDATE_FOUND` | — | none |
| `western_condition.unexplained_infertility` | `western_condition` | 30 | 19 | `NO_CANDIDATE_FOUND` | — | none |

---

## 4. Retired & Deprecated ID Reference Audit

| Retired / Deprecated ID | Entity Type | Chinese Name | Declared Replacement ID | Referenced by Active Records | Referenced by Deprecated Records |
|---|---|---|---|---|---|
| `avs.cancer_tx_precautions` | `avs_advice` | — | — | **0** | 0 |
| `formula.bai_du_san` | `formula` | 敗毒散 | — | **9** | 0 |
| `formula.du_qi_wan_import_stub` | `formula` | 都氣丸(匯入重複殘根) | — | **0** | 0 |
| `formula.fu_yuan_huo_xue_tang_import_stub` | `formula` | 復元活血湯(匯入重複殘根) | — | **0** | 0 |
| `formula.ling_jiao_gou_teng_yin` | `formula` | 羚角鉤藤丸 | — | **0** | 0 |
| `herb.han_lian_cao` | `herb` | 旱蓮草 | — | **1** | 0 |
| `herb.qian_cao_gen` | `herb` | 茜草根 | — | **0** | 0 |
| `herb.sha_shen` | `herb` | 沙參 | — | **1** | 0 |
| `herb.wu_zei_gu` | `herb` | 烏賊骨 | — | **0** | 0 |
| `pattern.insomnia_heart_kidney_disharmony` | `pattern` | 心腎不交 | `pattern.heart_kidney_not_communicating` | **4** | 0 |
| `pattern.liver_fire_flaring` | `pattern` | 肝火上炎 | `pattern.liver_fire` | **2** | 0 |
| `pattern.liver_wind_stirring` | `pattern` | 肝風內動 | `pattern.liver_wind` | **17** | 0 |

### Active → Deprecated Edge Risk Inventory (Identity Fields Excluded)

1. `data/herbs/formula_canon_shortlist.json:formula.gui_zhi_tang:records[0].related_formulas[3]->formula.bai_du_san`
2. `data/herbs/formula_canon_shortlist.json:formula.jiu_wei_qiang_huo_tang:records[2].related_formulas[3]->formula.bai_du_san`
3. `data/herbs/formula_canon_shortlist.json:formula.ma_huang_tang:records[1].related_formulas[3]->formula.bai_du_san`
4. `data/herbs/formula_canon_shortlist.json:formula.xiao_qing_long_tang:records[3].related_formulas[3]->formula.bai_du_san`
5. `data/herbs/formulas.json:formula.gui_zhi_tang:records[0].related_formulas[3]->formula.bai_du_san`
6. `data/herbs/formulas.json:formula.jiu_wei_qiang_huo_tang:records[3].related_formulas[3]->formula.bai_du_san`
7. `data/herbs/formulas.json:formula.ma_huang_tang:records[1].related_formulas[3]->formula.bai_du_san`
8. `data/herbs/formulas.json:formula.xiao_qing_long_tang:records[2].related_formulas[3]->formula.bai_du_san`
9. `data/herbs/herb_pairs.json:pair.han_lian_cao__nu_zhen_zi:pairs[170].herbs[0]->herb.han_lian_cao`
10. `data/herbs/herb_pairs.json:pair.mai_men_dong__sha_shen:pairs[174].herbs[1]->herb.sha_shen`
11. `data/knowledge/comparisons.json:cmp.exterior_wind_cold:records[11].compares[4]->formula.bai_du_san`
12. `data/pathology/pattern_library.json:pattern.yin_qiao_mai_imbalance:records[123].differential_patterns[1].pattern_id->pattern.insomnia_heart_kidney_disharmony`
13. `data/pathology/tdis_registry.json:tdis.bu_mei:records[23].related_patterns[2]->pattern.insomnia_heart_kidney_disharmony`
14. `data/pathology/tdis_registry.json:tdis.tou_tong:records[18].related_patterns[3]->pattern.liver_fire_flaring`
15. `data/pathology/tdis_registry.json:tdis.tou_tong:records[18].related_patterns[4]->pattern.liver_wind_stirring`
16. `data/pathology/tdis_registry.json:tdis.xuan_yun:records[19].related_patterns[5]->pattern.liver_fire_flaring`
17. `data/pathology/tdis_registry.json:tdis.xuan_yun:records[19].related_patterns[6]->pattern.liver_wind_stirring`
18. `data/pathology/tdis_registry.json:tdis.zhong_feng:records[20].related_patterns[1]->pattern.liver_wind_stirring`
19. `data/symptoms/symptoms.json:sym.altered_consciousness:records[91].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
20. `data/symptoms/symptoms.json:sym.altered_consciousness:records[91].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`
21. `data/symptoms/symptoms.json:sym.bradykinesia:records[100].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
22. `data/symptoms/symptoms.json:sym.bradykinesia:records[100].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`
23. `data/symptoms/symptoms.json:sym.facial_deviation:records[90].differentiation_en[1].points_to[0]->pattern.liver_wind_stirring`
24. `data/symptoms/symptoms.json:sym.facial_deviation:records[90].differentiation_zh[1].points_to[0]->pattern.liver_wind_stirring`
25. `data/symptoms/symptoms.json:sym.hemiplegia:records[89].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
26. `data/symptoms/symptoms.json:sym.hemiplegia:records[89].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`
27. `data/symptoms/symptoms.json:sym.insomnia:records[3].differentiation_en[3].points_to[0]->pattern.insomnia_heart_kidney_disharmony`
28. `data/symptoms/symptoms.json:sym.insomnia:records[3].differentiation_zh[3].points_to[0]->pattern.insomnia_heart_kidney_disharmony`
29. `data/symptoms/symptoms.json:sym.limb_stiffness:records[86].differentiation_en[2].points_to[0]->pattern.liver_wind_stirring`
30. `data/symptoms/symptoms.json:sym.limb_stiffness:records[86].differentiation_zh[2].points_to[0]->pattern.liver_wind_stirring`
31. `data/symptoms/symptoms.json:sym.slurred_speech:records[84].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
32. `data/symptoms/symptoms.json:sym.slurred_speech:records[84].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`
33. `data/symptoms/symptoms.json:sym.vertigo:records[9].differentiation_en[0].points_to[0]->pattern.liver_wind_stirring`
34. `data/symptoms/symptoms.json:sym.vertigo:records[9].differentiation_zh[0].points_to[0]->pattern.liver_wind_stirring`

---

## 5. UI / Renderer Duplicate Namespace Universe Findings

### Finding 1: `MULTIPLE_NAMESPACES_RENDERED_AS_SAME_ENTITY_TYPE`
- **Location**: `js/knowledge.js:entityKindLabel`
- **Namespaces**: `western_condition` and `cond`
- **Rendered As**: 「西醫病名」
- **Details**: Renderer handles both western_condition.* and cond.* as 西醫病名

### Finding 2: `MULTIPLE_NAMESPACES_RENDERED_AS_SAME_ENTITY_TYPE`
- **Location**: `js/knowledge.js:entityKindLabel`
- **Namespaces**: `eastern_disease` and `tdis`
- **Rendered As**: 「中醫病名」
- **Details**: Renderer handles eastern_disease.* as 中醫病名 alongside canonical tdis.*

---

## 6. Safety & Invariant Verification

- **Canonical Mutation**: 0 bytes diff vs `origin/main`.
- **Generated Data Mutation**: 0 bytes diff vs `origin/main`.
- **CI Workflow Mutation**: 0 bytes diff vs `origin/main`.
- **Output Hygiene**: 0 illegal control characters, 0 replacement characters.
- **Regression Fixtures**: 8/8 PASS.
- **Action Required**: None automatically executed. Awaiting human/architectural review.