# CLINICAL V2 CAPTURE EXAMPLES v0

Status: **IMPLEMENTATION REFERENCE / NOT CANONICAL DATA**

## Supplement longitudinal example
Magnesium 200 mg nightly → 400 mg nightly → stopped.

Required:
- current snapshot may be `stopped`
- history preserves all three events
- prior events are never overwritten
- missing legacy timestamps remain missing

```json
{
  "canonicalId": "supp.magnesium",
  "status": "stopped",
  "events": [
    {"eventType":"initial_recorded","doseText":"200 mg","frequency":"nightly"},
    {"eventType":"dose_changed","doseText":"400 mg","frequency":"nightly"},
    {"eventType":"stopped"}
  ]
}
```

## Environmental exposure
Suspected wildfire smoke → later confirmed.
Preserve both states and provenance. Never silently rewrite suspected → confirmed.

## Pattern differential
A visit may simultaneously carry:
- working/primary pattern
- secondary pattern
- differential candidate

`role` and `isPrimary` must not contradict.

## Lifestyle
Lifestyle factors are observations, not diagnoses. Never auto-create a TCM Pattern/Disease or Western Condition from a lifestyle item alone.

## Adverse event
`adverse_event.cupping_blister` can record severity, related modality, patient-reported status, resolution.
This is observational safety/tolerance data, not automatic causality.

## Symptom + metric
`sym.headache` may coexist with `metric.pain_score`.
Example trajectory: 8 → 5 across visits.

## Ownership reminder
Patient: stable demographics/context, allergies, long-term history, baseline/current exposures.
Case: one longitudinal clinical problem.
Visit: SOAP, diagnoses/patterns, findings, treatment, outcomes, per-visit observations, adverse events.
