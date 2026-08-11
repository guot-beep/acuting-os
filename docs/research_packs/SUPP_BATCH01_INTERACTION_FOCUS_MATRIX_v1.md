# SUPPLEMENT BATCH 01 — INTERACTION FOCUS MATRIX v1

**RESEARCH STAGING / NOT CANONICAL**

CR-006. Fast triage layer for the 18 CR-003 skeletons. This is not a complete interaction database.

| Supplement | Anticoagulant | Immunosuppressant | Thyroid medication | Key note |
|---|---|---|---|---|
| `supp.vitamin_d3` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | Thiazide diuretics can raise hypercalcemia risk; review other drugs affecting vitamin D/calcium. |
| `supp.b_complex` | `component_dependent` | `component_dependent` | `component_dependent` | Must review B6/niacin/folate/B12 amounts separately; do not apply one class-wide interaction conclusion. |
| `supp.b12` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | Metformin and acid suppressants can contribute to low B12 status. |
| `supp.folate` | `no_specific_flag_in_primary_source` | `known_concern_antifolate_drugs` | `no_specific_flag_in_primary_source` | Antifolate and some antiseizure drugs are more relevant than these three focus classes. |
| `supp.coq10` | `known_concern_warfarin` | `insufficient_data` | `no_specific_flag_in_primary_source` | Potential reduction of warfarin effect; monitor anticoagulation clinically. |
| `supp.ginkgo` | `known_concern_bleeding` | `insufficient_data` | `no_specific_flag_in_primary_source` | Bleeding interaction concern with anticoagulant/antiplatelet therapy. |
| `supp.curcumin` | `possible_bleeding_concern` | `insufficient_data` | `no_specific_flag_in_primary_source` | Bleeding/antiplatelet concern is plausible; piperine-containing products can alter drug exposure. |
| `supp.lutein` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | Combination products may introduce separate interactions. |
| `supp.multivitamin` | `known_concern_if_vitamin_k` | `component_dependent` | `known_concern_if_calcium_iron` | Vitamin K can affect warfarin; calcium/iron can impair levothyroxine absorption. |
| `supp.calcium` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | `known_absorption_concern` | Separate calcium and levothyroxine per medication guidance. |
| `supp.magnesium` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | `possible_absorption_timing_concern` | Strongest established timing interactions are with selected antibiotics/bisphosphonates; thyroid timing should be checked against exact product/medication guidance. |
| `supp.zinc` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | Key interactions: quinolone/tetracycline antibiotics and penicillamine. |
| `supp.creatine` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | Renal disease/complex medical context more relevant than these three focus classes. |
| `supp.nad_plus` | `insufficient_data` | `insufficient_data` | `insufficient_data` | Do not convert sparse interaction evidence to 'none'. |
| `supp.nr` | `insufficient_data` | `insufficient_data` | `insufficient_data` | Short-term human safety data do not establish broad drug-interaction absence. |
| `supp.nmn` | `insufficient_data` | `insufficient_data` | `insufficient_data` | Long-term and interaction evidence remains limited. |
| `supp.omega_3` | `dose_dependent_bleeding_review` | `no_specific_flag_in_primary_source` | `no_specific_flag_in_primary_source` | High-dose use warrants anticoagulant/antiplatelet review; also note atrial fibrillation signal in some high-dose trials. |
| `supp.probiotics` | `no_specific_flag_in_primary_source` | `known_host_risk_if_severely_immunocompromised` | `no_specific_flag_in_primary_source` | Serious infections are rare but reported in vulnerable hosts; immunosuppression is a safety-context flag. |

## Semantics
- `no_specific_flag_in_primary_source` ≠ no interaction.
- `insufficient_data` must stay unknown/insufficient.
- `component_dependent` means inspect individual ingredients and doses.

## Source lineage
This matrix is a normalized implementation view of CR-003 Batch 01, whose per-item source lineage is NIH ODS / NCCIH / FDA / cited human trials. It should be joined back to the CR-003 skeleton records for source display.