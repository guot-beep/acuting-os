# CloudTCM D3 Review Strategy

Generated: 2026-07-11T01:01:12.404Z

## Current Gate Decision

Do not run `--apply-approved` yet.

Reason: the D3 preview has no fill candidates. `FILL = 0` for every mapped field, so applying now would write nothing useful. The work is now a review/classification task, not a merge task.

## Preview Counts

| canonical field | FILL | MATCH | DIFFER | staging empty |
|---|---:|---:|---:|---:|
| location_zh | 0 | 1 | 360 | 0 |
| needling | 0 | 7 | 354 | 0 |
| functions_zh | 0 | 0 | 348 | 13 |
| indications_zh | 0 | 0 | 348 | 13 |
| contraindications | 0 | 1 | 43 | 317 |

## Interpretation

- `location_zh`: 360 differs. Most are likely wording/detail differences, but numeric landmark differences must be reviewed first.
- `needling`: 354 differs. This is the highest safety priority. Review direction, depth, organ-risk language, eye/neck/chest warnings, pregnancy cautions, and bleeding cautions.
- `functions_zh` and `indications_zh`: 348 differs each. Treat CloudTCM as reference-only. Do not overwrite canonical prose in bulk.
- `contraindications`: only 44 CloudTCM records have caution text; review as a safety supplement, not as a replacement.

## Automated Triage Summary

By risk level:

- high: 553
- low: 189
- medium: 15
- reference: 696

By field and risk level:

- location_zh: medium 10, high 193, low 157
- needling: high 322, low 32
- functions_zh: reference 348
- indications_zh: reference 348
- contraindications: high 38, medium 5

## Recommended Review Order

1. Needling high-risk differences.
2. Location numeric differences.
3. Contraindication differences.
4. Function/indication differences as draft reference only.

## Approval Recommendation

Do not approve bulk apply. Instead, create smaller source-review batches, such as:

- Batch A: eye/neck/chest/abdomen safety points.
- Batch B: BL back-shu location and needling review.
- Batch C: commonly searched points such as LI4, ST36, SP6, PC6, LR3, CV12, CV17, GV20.

Each approved batch should produce a small patch or fill plan with explicit human-reviewed decisions.
