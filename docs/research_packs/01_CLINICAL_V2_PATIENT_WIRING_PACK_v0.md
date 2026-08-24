# CLINICAL V2 PATIENT WIRING PACK v0

Status: **IMPLEMENTATION REFERENCE / NOT CANONICAL**

## Objective

Give Fable a concrete ownership map for Phase C2 so Patient wiring is added before Phase D UI hard-codes fields at the Case level.

## Ownership matrix

| Domain | Patient | Case | Visit | Notes |
|---|---:|---:|---:|---|
| patient_id | ✅ | ref | ref | stable identity |
| demographics | ✅ |  | snapshot-display only | do not duplicate as authoritative Visit data |
| allergies | ✅ |  | optional reviewed snapshot | longitudinal patient-level safety data |
| long-term history | ✅ |  |  | stable/history-oriented |
| problem/episode title |  | ✅ | ref | one patient may have many cases |
| case status |  | ✅ |  | active/resolved/etc. |
| case start/end |  | ✅ |  | episode boundary |
| SOAP narrative |  |  | ✅ | Visit-owned |
| Western Condition selections |  | optional longitudinal context | ✅ | actual working selections at visit |
| TCM Disease selections |  | optional longitudinal context | ✅ | not equivalent to Western Condition |
| TCM Pattern selections |  |  | ✅ | differential/working/primary/secondary |
| symptoms/findings |  |  | ✅ | `sym.*` |
| outcome metrics |  |  | ✅ | `metric.*`, optional `relatedSymId` |
| treatment points/formulas/herbs |  |  | ✅ | actual treatment delivered/recommended |
| medication exposure | ✅ current/baseline + longitudinal history | optional case relevance view | visit change event/reference | canonical `drug.*` |
| supplement exposure | ✅ current/baseline + longitudinal history | optional case relevance view | visit change event/reference | canonical `supp.*` |
| lifestyle baseline | ✅ | optional case relevance | ✅ per-visit observation/change | `life.*` |
| environmental baseline | ✅ | optional case relevance | ✅ per-visit status/change | `exposure.*` |
| adverse event |  |  | ✅ | `adverse_event.*` |
| provenance | ✅ where applicable | ✅ where applicable | ✅ | patient-reported/clinician/source |
| created/updated metadata | ✅ | ✅ | ✅ | system metadata |

## Recommended wiring rule

The UI may DISPLAY inherited Patient data inside a Case/Visit screen, but should not silently create a second authoritative copy.

Example:

```text
Patient.currentSupplements
        ↓ displayed in
Case / Visit
        ↓ if changed today
append exposure event
        ↓
Patient longitudinal exposure history updates
```

## New exposure creation

For a genuinely new post-D17 exposure:
- create current snapshot
- append real first event: `started` or `initial_recorded`
- use actual creation time if available

For legacy exposure with no historical events:
- preserve snapshot
- leave `events: []`
- do not synthesize a fake historical start date

## Migration examples

### Legacy medication object

Possible legacy:
```json
{
  "name": "Losartan",
  "dose": "50 mg",
  "frequency": "daily"
}
```

Preferred migration behavior:
- resolve candidate canonical `drug.*` ID if safely mappable
- preserve original text/legacy field for compatibility
- do not invent start date
- do not create a fake `started` event unless migration provenance explicitly says it was recorded at that time

### Legacy supplement object

Possible legacy:
```json
{
  "name": "Magnesium",
  "dose": "200 mg"
}
```

Preferred:
```json
{
  "canonicalId": "supp.magnesium",
  "status": "current",
  "doseText": "200 mg",
  "events": []
}
```

until a real post-migration change occurs.

## UI wiring checklist

### Patient screen
- demographics/context
- allergies
- long-term history
- current medications
- current supplements
- baseline lifestyle
- baseline environmental exposures
- current alerts

### Case screen
- case title/problem
- start/status
- related Western/TCM context if desired
- longitudinal summary/timeline
- no duplicate authoritative patient demographics

### Visit screen
- SOAP
- `cond.*`
- `tdis.*`
- `pattern.*`
- `sym.*`
- `metric.*`
- treatment
- med/supp/lifestyle/exposure changes
- outcomes
- adverse events

## Stop conditions

Pause and ask architecture lead only when:
- a field has two competing authoritative owners;
- a migration would destroy or fabricate history;
- a new write path bypasses `applyExposureChange()` or equivalent ledger path;
- Patient isolation or Case isolation cannot be guaranteed.

Do NOT pause for:
- minor label naming;
- selector ordering;
- harmless UI copy;
- candidate taxonomy wording that can remain staging.
