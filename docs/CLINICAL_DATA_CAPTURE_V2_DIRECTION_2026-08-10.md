# AcuTing OS — Clinical Data Capture & Longitudinal Analytics Direction V2

**Status:** Architecture direction for next implementation cycle  
**Priority:** P0 before 2026-09-05 Clinical Data Capture MVP  
**Purpose:** Preserve analyzable longitudinal clinical data from the first real cases onward, while keeping free-text SOAP and avoiding false 1:1 biomedical ↔ TCM mappings.

## 1. Core clinical reasoning rule

AcuTing OS must NOT model:

`Western Condition = TCM Disease = TCM Pattern`

These are different knowledge entities.

Use relationship semantics such as:
- `associated_with`
- `may_present_as`
- `differential_candidate`
- `commonly_seen_with`

Do **not** use `equals` or translation-style equivalence.

The actual TCM differentiation belongs to the **Visit**, based on the patient's findings.

## 2. Central longitudinal model

```text
Patient
  ↓
Case
  ↓
Visit
```

### Patient
Relatively stable or slowly changing information:
- demographics/context
- allergies
- long-term medical history
- medication exposure
- supplement exposure
- lifestyle baseline
- environmental exposure baseline

### Case
One longitudinal clinical problem or episode.

### Visit
The main analytical observation unit.

Every Visit should preserve structured data alongside free-text SOAP.

## 3. Visit structured capture

The Visit should eventually reference canonical IDs for:
- `cond.*`
- `tdis.*`
- `pattern.*`
- `sym.*`
- acupoint canonical IDs
- `formula.*`
- `herb.*`
- `drug.*`
- `supp.*`
- `life.*`
- `exposure.*`
- `modality.*`
- `metric.*`
- `adverse_event.*`

Free-text SOAP remains necessary. Structured fields exist so future analytics do not depend on extracting everything from prose.

## 4. Differential vs working pattern

Do not store only one pattern field.

Preferred logic:

```text
pattern_differential_ids[]
working_patterns[]
```

Future-compatible working-pattern object:

```json
{
  "id": "pattern.example",
  "role": "primary",
  "confidence": "moderate"
}
```

Possible roles later:
- primary
- secondary
- root
- branch

## 5. Clinical reasoning sequence

Treatment should not jump directly from a Western diagnosis to points/formulas.

```text
Patient findings
   ↓
Differential candidates
   ↓
Working TCM pattern(s)
   ↓
Treatment principle
   ↓
Points / Formula / Herbs / Modalities
```

Western conditions provide biomedical context, red flags, medication/lab context, precautions, documentation, and outcome suggestions. They do not automatically determine a TCM pattern or treatment.

## 6. Supplements as first-class canonical entities

Supplements should NOT be ordinary `drug.*` records.

Preferred namespace:

`suppl.*`

UI may still place Medications + Supplements together under **Pharmacology & Exposures**.

Suggested categories:
- vitamins
- minerals
- botanical extracts
- fatty acids
- amino acids / performance
- probiotics
- antioxidants / coenzymes
- multi-ingredient products

Initial skeleton examples:
Vitamin D, B complex, B12, folate, CoQ10, ginkgo, curcumin, lutein, multivitamin, calcium, magnesium, zinc, creatine, NAD+, NR, NMN, omega-3, probiotics.

## 7. Unified medication / supplement exposure timeline

Do not rely only on one free-text `currentMeds` field.

Suggested structure:

```json
{
  "substance_id": "suppl.vitamin_d3",
  "status": "current",
  "dose_text": "2000 IU",
  "frequency": "daily",
  "start_date": "2026-01",
  "stop_date": null,
  "reason": "",
  "adherence": "regular",
  "source": "patient_reported"
}
```

It should work for:
- `drug.*`
- `suppl.*`

At follow-up visits, prefer **Changes since last visit**:
- unchanged
- started
- stopped
- dose changed
- frequency changed

## 8. Lifestyle Factors as structured longitudinal data

Lifestyle should not live only in a SOAP textarea.

Create canonical lifestyle IDs, preferably `life.*`.

### Sleep / circadian
Examples:
- `life.sleep.late_bedtime`
- `life.sleep.short_duration`
- `life.sleep.irregular_schedule`
- `life.sleep.night_shift`
- `life.sleep.frequent_waking`

Capture when useful:
- usual bedtime
- wake time
- hours/night
- weekday/weekend variation

### Caffeine
Coffee, tea, energy drinks, pre-workout.
Prefer cups/day, serving size, and timing.

### Nicotine
Cigarettes, vaping, cigar, other nicotine.
Capture current/former/never, amount/day, duration years, quit date.

### Diet
Examples:
- raw food
- cold food/drinks
- raw seafood
- very hot beverages/soups
- late-night meals
- high sugar intake
- ultra-processed food
- spicy food
- irregular meals
- fasting patterns

Prefer servings/week, drinks/day, or frequency categories.

### Other
- alcohol
- exercise
- sedentary time
- hydration if clinically useful

## 9. Critical separation: observation vs TCM interpretation

A lifestyle observation must NOT automatically become a TCM diagnosis.

Example:

```text
raw seafood = 4 servings/week
cold beverages = 2/day
```

must NOT automatically create:

```text
Spleen Yang Deficiency
Cold-Damp
```

Observed behavior and clinical interpretation remain separate. TCM interpretation belongs in Assessment / differentiation.

## 10. Environmental / toxic exposure layer

Environmental or toxic exposure should be separate from Lifestyle.

Preferred namespace:

`exposure.*`

Examples:
- wildfire smoke
- secondhand smoke
- mold
- lead
- mercury
- pesticide
- solvent
- occupational dust
- carbon monoxide

Must distinguish:
- suspected
- patient-reported
- confirmed
- historical
- ongoing

Never convert suspected exposure into confirmed poisoning.

## 11. Adverse events / treatment tolerance

Create future-compatible namespace:

`adverse_event.*`

Examples:
- dizziness
- needling pain
- bruising
- fatigue after treatment
- nausea
- headache after treatment
- anxiety
- cupping blister

Visit records should eventually support:
- event
- severity
- suspected related intervention/modality
- patient-reported status
- resolution

## 12. Outcome data

Every Visit should be capable of recording:
- baseline metric
- follow-up metric
- change
- outcome verdict
- patient-reported change
- objective measure where available

Reuse the existing outcome metric architecture where possible. Do not create a duplicate metric system unless required.

## 13. Derived time / season fields

Do not force users to enter season manually.

Store Visit date and derive later:
- month
- quarter
- season
- year
- rolling 30/60/90-day windows

## 14. Future analytics this schema must support

Do NOT build the analytics dashboard yet.

The schema must make these questions possible:

### Patient population
- Which conditions are increasing?
- Which patient groups am I seeing more often?
- Which complaints rise seasonally?

### Lifestyle / exposures
- Which lifestyle factors commonly appear in migraine patients?
- How common is late bedtime in insomnia cases?
- What supplements are common in fertility patients?
- Which environmental exposures are appearing more often?

### Treatment / outcomes
- Which treatment configurations are associated with better recorded outcomes?
- Which patterns commonly appear within one Western condition?
- Which approaches are associated with poor tolerance?

### Safety / tolerance
- Which adverse events occur most often?
- Which patient backgrounds commonly appear when discomfort occurs?
- Which modalities require review?

### Research priority
- Which conditions have high clinical demand but weak knowledge-card coverage?
- Which topics are rising enough to justify focused research?

These are observational practice signals, not proof of causation.

## 15. Future bidirectional system

### Knowledge → Clinical
Knowledge cards may suggest:
- related TCM disease candidates
- differential pattern candidates
- red flags
- relevant medications
- relevant supplements
- suggested outcome metrics

They must NOT automatically diagnose or select a TCM pattern.

### Clinical → Knowledge
Later, knowledge cards may privately display aggregated practice data:
- patient count
- case count
- visit count
- common working patterns
- common treatments
- recorded outcome trends
- adverse events
- seasonality
- common lifestyle/exposure factors

These results come from the private clinical store, not hard-coded GitHub knowledge data.

## 16. Data isolation rule

```text
GitHub
└── Knowledge data
    cond / tdis / pattern / drug / suppl / life / exposure / etc.

Private Clinical Store
└── Patient / Case / Visit / Outcome / Exposure history
```

Real patient data must never be committed to GitHub.

## 17. 2026-09-05 MVP definition

The 9/5 milestone is now:

# Clinical Data Capture MVP

It is NOT "all knowledge cards complete."

Minimum structured capture should support:
- Patient
- Case
- Visit
- Western conditions
- TCM diseases
- differential patterns
- working patterns
- symptoms/findings
- medications
- supplements
- lifestyle
- environmental exposures
- treatment
- points
- formulas
- herbs
- modalities
- outcome metrics
- adverse events
- free-text SOAP

Primary goal:

> Every real Visit entered after 9/5 should create analyzable longitudinal data from day one.

Dashboards, advanced statistics, alerts, research signals, and causal modeling can come later.

## 18. Next Claude/Fable session

Before changing code:

1. Audit the CURRENT repo.
2. Report:
   - ALREADY SUPPORTED
   - PARTIALLY SUPPORTED
   - MISSING
   - CONFLICTS / MIGRATION RISKS
3. Reuse existing IDs and schemas whenever possible.
4. Prefer additive schema evolution.
5. Preserve backward compatibility.
6. Do not remove existing free-text SOAP.
7. Do not bulk-fill cards in this architecture session.
8. Do not build analytics dashboards yet.
9. Update architecture docs / DECISIONS / PROJECT_LOG as appropriate.
10. If implementation begins, limit it to the smallest safe scaffold needed for the next cycle.

## Recommended implementation order

### P0
1. Patient / Case / Visit analytical schema
2. Differential vs working Pattern model
3. Structured Visit canonical links
4. Medication + Supplement exposure timeline
5. Lifestyle registry + patient baseline/change model
6. Environmental exposure registry
7. Adverse event capture
8. Outcome metric integration

### P1
9. Pharmacology category/taxonomy cleanup
10. Supplement skeleton cards
11. Visit UI for "changed since last visit"
12. Reverse-index hooks for future analytics

### Later
13. Analytics dashboard
14. Seasonal trend detection
15. Research-demand signals
16. Practice-level outcome/tolerance summaries
