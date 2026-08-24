# CLINICAL RELATION SEEDS v1

**RESEARCH STAGING / NOT CANONICAL**

CR-009. Candidate graph edges for longitudinal measurement and medication-review prompts. These edges do **not** diagnose disease and do **not** assert patient-specific causality.

## Symptom → metric candidates

| Source | Relation | Target | Strength |
|---|---|---|---|
| `sym.headache` | `measured_by` | `metric.pain_score` | `direct_measurement_candidate` |
| `sym.neck_pain` | `measured_by` | `metric.pain_score` | `direct_measurement_candidate` |
| `sym.neck_pain` | `may_be_measured_by` | `metric.range_of_motion_deg` | `context_dependent` |
| `sym.shoulder_pain` | `measured_by` | `metric.pain_score` | `direct_measurement_candidate` |
| `sym.shoulder_pain` | `may_be_measured_by` | `metric.range_of_motion_deg` | `context_dependent` |
| `sym.low_back_pain` | `measured_by` | `metric.pain_score` | `direct_measurement_candidate` |
| `sym.low_back_pain` | `may_be_measured_by` | `metric.range_of_motion_deg` | `context_dependent` |
| `sym.knee_pain` | `measured_by` | `metric.pain_score` | `direct_measurement_candidate` |
| `sym.knee_pain` | `may_be_measured_by` | `metric.range_of_motion_deg` | `context_dependent` |
| `sym.insomnia` | `measured_by` | `metric.sleep_quality` | `direct_measurement_candidate` |
| `sym.insomnia` | `measured_by` | `metric.sleep_hours` | `direct_measurement_candidate` |
| `sym.insomnia` | `measured_by` | `metric.sleep_onset_minutes` | `direct_measurement_candidate` |
| `sym.insomnia` | `measured_by` | `metric.night_wakings` | `direct_measurement_candidate` |
| `sym.fatigue` | `measured_by` | `metric.fatigue_score` | `direct_measurement_candidate` |
| `sym.constipation` | `measured_by` | `metric.bowel_frequency` | `direct_measurement_candidate` |
| `sym.constipation` | `may_be_measured_by` | `metric.stool_form_bristol` | `context_dependent` |
| `sym.diarrhea` | `may_be_measured_by` | `metric.stool_form_bristol` | `context_dependent` |
| `sym.hot_flash` | `measured_by` | `metric.hot_flash_count_day` | `direct_measurement_candidate` |
| `sym.dysmenorrhea` | `measured_by` | `metric.pain_score` | `direct_measurement_candidate` |
| `sym.epigastric_pain` | `measured_by` | `metric.pain_score` | `direct_measurement_candidate` |

## Supplement → medication-class review candidates

| Supplement | Relation | Medication class | Note |
|---|---|---|---|
| `supp.vitamin_k` | `interaction_watch` | `drugclass.vitamin_k_antagonists` | Major management interaction; warfarin-class therapy requires consistent vitamin K intake and monitoring. |
| `supp.st_johns_wort` | `interaction_watch` | `drugclass.anticoagulants` | Can reduce warfarin effect via metabolic induction. |
| `supp.st_johns_wort` | `interaction_watch` | `drugclass.immunosuppressants` | Can markedly reduce cyclosporine exposure; high-priority interaction. |
| `supp.st_johns_wort` | `interaction_watch` | `drugclass.serotonergic_drugs` | Serotonin-related toxicity risk with serotonergic combinations. |
| `supp.ashwagandha` | `interaction_watch` | `drugclass.immunosuppressants` | NCCIH lists possible interaction with medicines that decrease immune response. |
| `supp.ashwagandha` | `interaction_watch` | `drugclass.thyroid_hormones` | NCCIH lists thyroid hormone medication interaction concern. |
| `supp.iron` | `administration_separation_watch` | `drugclass.thyroid_hormones` | Iron can impair levothyroxine absorption; dose separation is clinically important. |
| `supp.calcium` | `administration_separation_watch` | `drugclass.thyroid_hormones` | Calcium can impair levothyroxine absorption; dose separation is clinically important. |
| `supp.garlic` | `interaction_watch` | `drugclass.anticoagulants` | Bleeding risk may increase. |
| `supp.vitamin_e` | `interaction_watch` | `drugclass.anticoagulants` | High-dose vitamin E can increase bleeding tendency. |
| `supp.ginkgo` | `interaction_watch` | `drugclass.anticoagulants` | Bleeding-interaction concern. |
| `supp.omega_3` | `interaction_watch` | `drugclass.anticoagulants` | Dose-dependent bleeding review, especially at high doses. |

## Hard semantic boundaries
- `measured_by` does not mean the metric is mandatory.
- `interaction_watch` means review, not confirmed harm.
- Drug-class IDs are staging placeholders until matched to the repo's actual pharmacology taxonomy.
- No edge in this pack creates Western↔TCM equivalence.