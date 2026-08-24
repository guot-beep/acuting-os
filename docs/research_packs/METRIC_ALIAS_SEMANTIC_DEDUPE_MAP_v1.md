# METRIC ALIAS / SEMANTIC DEDUPE MAP v1

**RESEARCH STAGING / NOT CANONICAL**

Goal: prevent duplicate longitudinal metrics caused only by naming differences.

| Proposed candidate | Canonical target | Action | Reason |
|---|---|---|---|
| `metric.sleep_duration_hours` | `metric.sleep_hours` | `alias_to_existing` | same semantic concept; preserve one longitudinal series |
| `metric.sleep_onset_latency_min` | `metric.sleep_onset_minutes` | `alias_to_existing` | same measurement concept and unit |
| `metric.night_awakenings` | `metric.night_wakings` | `alias_to_existing` | same count concept |
| `metric.bowel_movements_per_week` | `metric.bowel_frequency` | `alias_to_existing` | same bowel frequency concept; canonical unit/period should be defined by existing metric |
| `metric.pain_score` | `metric.pain_score` | `use_existing` | exact existing |
| `metric.sleep_quality` | `metric.sleep_quality` | `use_existing` | exact existing |
| `metric.fatigue_score` | `metric.fatigue_score` | `candidate_new` | no supplied existing equivalent; generic 0–10 longitudinal score |
| `metric.stool_form_bristol` | `metric.stool_form_bristol` | `candidate_new` | ordinal stool-form measurement distinct from bowel frequency |
| `metric.hot_flash_count_day` | `metric.hot_flash_count_day` | `candidate_new` | frequency endpoint distinct from generic symptom severity |
| `metric.range_of_motion_deg` | `metric.range_of_motion_deg` | `candidate_new_needs_metadata` | requires joint/movement/side metadata to be clinically interpretable |

## Rule
Do not migrate an existing metric series merely to make a newer candidate ID look prettier. Prefer alias resolution unless the underlying measurement definition is materially different.