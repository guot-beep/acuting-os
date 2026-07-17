# Formula Dose Staging

This folder holds source-transcribed dose evidence before any canonical merge.
It is not a prescribing table and is not medical advice.

Rules:

- `data/herbs/formulas.json` is not changed by this staging batch.
- Classical amounts and source-published gram references are preserved as
  separate fields.
- Concentrated-granule serving grams remain `null` unless a reviewed product
  label or authenticated practitioner source states the serving amount.
- Bottle size, extract ratio, and raw-herb grams must never be converted into a
  serving recommendation automatically.
- All records remain `draft` until Ting approves a field-level merge preview.

