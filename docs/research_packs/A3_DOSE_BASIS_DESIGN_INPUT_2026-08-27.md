# A3 Dose-Basis Design Input

**NO PHI · NOT CANONICAL · 2026-08-27**

This companion note is deliberately schema-first.

## Recommended separation

`dose_basis` answers **what the number means**.

`dose_basis_status` answers **whether the stored number is structurally trustworthy**.

Do not put `malformed` into the same enum as `formula_batch_amount`.

## Proposed semantic enum

- `formula_batch_amount`
- `per_unit_exposure`
- `adult_daily_herb_dose`
- `classical_text_amount`
- `raw_material_equivalent`

## Proposed status enum

- `valid`
- `malformed`
- `mixed_basis`
- `evidence_pending`
- `source_conflict`
- `not_applicable`

## Per-unit calculation gate

A calculation is permitted only when the same formula version supplies:
- ingredient batch input
- explicit final unit count or validated final yield
- finished-unit identity/weight
- no missing process factor that invalidates proportional allocation

When calculated from batch/yield, label the result as **nominal apportioned input**, not measured human exposure.

## Historical-unit gate

Default: preserve original unit and do not convert.

A conversion is allowed only with source-specific metrology evidence or an official key-information table that itself supplies the normalized value. Never generalize one conversion coefficient across dynasties or across different unit systems.
