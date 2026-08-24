# METRIC DEFINITIONS v1

**RESEARCH STAGING / NOT CANONICAL**

CR-002. Semantic dedupe was performed against the existing IDs supplied by Fable. We do **not** create duplicate metrics just because a proposed ID differs.

## Not added because equivalent/existing

- `metric.pain_score` → existing
- `metric.sleep_quality` → existing
- `metric.sleep_duration_hours` → use existing `metric.sleep_hours`
- `metric.sleep_onset_latency_min` → use existing `metric.sleep_onset_minutes`
- `metric.night_awakenings` → use existing `metric.night_wakings`
- `metric.bowel_movements_per_week` → use existing `metric.bowel_frequency`

## New candidate definitions

```json
[
  {
    "id": "metric.fatigue_score",
    "name": "Fatigue score",
    "label_zh": "疲勞分數 (0–10)",
    "label_en": "Fatigue score (0–10)",
    "category": "symptom",
    "unit": "0-10",
    "direction_good": "decrease"
  },
  {
    "id": "metric.stool_form_bristol",
    "name": "Bristol stool form",
    "label_zh": "Bristol 糞便型態 (1–7 型)",
    "label_en": "Bristol stool form (type 1–7)",
    "category": "symptom",
    "unit": "type 1-7",
    "direction_good": "range"
  },
  {
    "id": "metric.hot_flash_count_day",
    "name": "Hot flash count per day",
    "label_zh": "每日潮熱次數 (次/日)",
    "label_en": "Hot flash count (episodes/day)",
    "category": "symptom",
    "unit": "episodes/day",
    "direction_good": "decrease"
  },
  {
    "id": "metric.range_of_motion_deg",
    "name": "Range of motion",
    "label_zh": "關節活動度 (度)",
    "label_en": "Range of motion (degrees)",
    "category": "function",
    "unit": "degrees",
    "direction_good": "range"
  }
]
```

## Measurement conventions / reference interpretation

### `metric.fatigue_score`
- Convention: patient-reported 0–10 numeric rating, 0 = no fatigue, 10 = worst imaginable fatigue.
- Reference range: no universal population “normal range”; interpret longitudinally within the same patient.
- Source basis: generic numeric rating practice; exact instrument is intentionally not claimed to be a validated fatigue scale.
- Status: **uncertain instrument standardization**. If a validated PROM (e.g., PROMIS Fatigue) is later adopted, create a distinct instrument-specific metric rather than pretending this generic 0–10 value is PROMIS.

### `metric.stool_form_bristol`
- Convention: Bristol Stool Form Scale types 1–7.
- Reference interpretation: types 3–4 are commonly treated as the central/typical formed-stool range; clinical interpretation depends on context.
- Source: Lewis SJ, Heaton KW. *Stool form scale as a useful guide to intestinal transit time.* Scand J Gastroenterol. 1997;32(9):920-924. doi:10.3109/00365529709011203.
- Direction: `range`, because “higher” is not always better.

### `metric.hot_flash_count_day`
- Convention: patient diary count of discrete vasomotor episodes per 24 hours; define diary window consistently.
- Reference range: no universal normal range. In symptom tracking, lower count generally indicates improvement.
- Source basis: FDA/clinical-trial vasomotor symptom endpoints commonly use episode frequency/severity diaries; exact protocol can be added later if a named instrument is adopted.
- Direction: `decrease`.

### `metric.range_of_motion_deg`
- Convention: measured joint movement in degrees, ideally with movement name + side + measurement method stored alongside the value.
- Reference range: **joint- and movement-specific; no single universal normal range**. Do not validate all ROM values against one global threshold.
- Source basis: standard goniometric clinical measurement convention.
- Direction: `range`.

## Implementation caution

`range_of_motion_deg` is underspecified without movement metadata. If the schema later permits it, pair value with e.g. `movement=shoulder_abduction`, `side=left`, `method=goniometer`.
