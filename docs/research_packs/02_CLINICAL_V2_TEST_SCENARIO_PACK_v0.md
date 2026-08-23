# CLINICAL V2 FICTIONAL TEST SCENARIO PACK v0

Status: **FICTIONAL TEST DATA / NO PHI / NOT CANONICAL**

Use these as regression/smoke-test fixtures, not clinical guidance.

## Scenario A — longitudinal exposure + outcome + adverse event

5 visits:
- headache 8 → 6 → 5 → 4 → 3
- insomnia co-tracked
- magnesium 200 mg → 400 mg → stopped
- one mild cupping blister adverse event
- working + differential pattern fixture

Must prove:
- symptom trajectory preserved
- supplement events append-only
- adverse event retained
- differential vs working pattern retained
- export/import preserves all records

## Scenario B — patient isolation + multiple cases + exposure status evolution

Same fictional patient has:
1. low back pain case
2. seasonal congestion case

Must prove:
- one Patient can own multiple Cases
- Case A visits never leak into Case B
- wildfire smoke suspected → confirmed retains both event states
- outcome histories remain case-correct

## Scenario C — GI outcome tracking

Bowel movements/week:
3 → 4 → 5 → 6

Must prove:
- `sym.constipation` and `metric.bowel_movements_per_week` coexist
- a lifestyle change can be recorded without auto-creating a diagnosis/pattern

## Scenario D — simple repeated metric

Hot flashes/day:
7 → 5 → 4 → 3

Must prove:
- repeated metric history sorts correctly by visit date/order
- missing extra clinical detail does not break the timeline

## Regression checklist

For every scenario:
- save
- reload
- switch patient
- switch case
- reopen visit
- export
- wipe test store
- import
- compare counts and trajectories

Expected hard assertions:
- no patient leakage
- no case leakage
- no exposure event loss
- no fabricated history
- no duplicate Visit IDs
- no contradiction between `role` and `isPrimary`
- no PHI validator hits from fixture content
